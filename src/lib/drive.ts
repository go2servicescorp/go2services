import { createSign } from "crypto";

export type DriveImage = {
  id: string;
  name: string;
  thumbnailUrl: string;
  viewUrl: string;
};

type DriveFilesResponse = {
  files?: Array<{
    id?: string;
    mimeType?: string;
    name?: string;
    thumbnailLink?: string;
    webViewLink?: string;
  }>;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type DriveAuth =
  | { type: "api-key"; apiKey: string }
  | { type: "bearer"; accessToken: string };

export function extractDriveFolderId(value: string) {
  const match = value.match(/\/folders\/([^/?#]+)/);
  if (match?.[1]) return match[1];

  try {
    const url = new URL(value);
    return url.searchParams.get("id") || "";
  } catch {
    return "";
  }
}

export function getDriveThumbnailUrl(fileId: string, size = 1000) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export async function getDriveFolderImages(folderId: string, auth: DriveAuth) {
  console.info(`[drive] listing folder ${folderId} using ${auth.type}`);

  const params = new URLSearchParams({
    fields: "files(id,mimeType,name,thumbnailLink,webViewLink)",
    includeItemsFromAllDrives: "true",
    orderBy: "name",
    pageSize: "12",
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    supportsAllDrives: "true",
  });

  const headers = new Headers();

  if (auth.type === "api-key") {
    params.set("key", auth.apiKey);
  } else {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    {
      headers,
      next: { revalidate: 86400 },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(
      `Google Drive images failed for folder ${folderId}: ${res.status} ${errorText}`,
    );
    return [];
  }

  const data = (await res.json()) as DriveFilesResponse;
  const files = data.files || [];

  console.info(
    `[drive] folder ${folderId} returned ${files.length} image file(s): ${
      files
        .map(
          (file) => `${file.name || "unnamed"}:${file.mimeType || "unknown"}`,
        )
        .join(", ") || "none"
    }`,
  );

  return files
    .filter(
      (
        file,
      ): file is Required<NonNullable<DriveFilesResponse["files"]>[number]> =>
        Boolean(file.id && file.mimeType && file.name && file.webViewLink),
    )
    .sort((a, b) => getImagePriority(a) - getImagePriority(b))
    .map<DriveImage>((file) => ({
      id: file.id,
      name: file.name,
      thumbnailUrl: `/api/drive-image/${file.id}?size=thumb`,
      viewUrl: file.webViewLink,
    }));
}

function getImagePriority(file: { mimeType: string; name: string }) {
  const mimeType = file.mimeType.toLowerCase();
  const name = file.name.toLowerCase();

  if (
    mimeType === "image/jpeg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  )
    return 0;
  if (mimeType === "image/png" || name.endsWith(".png")) return 1;
  if (mimeType === "image/webp" || name.endsWith(".webp")) return 2;
  if (
    mimeType === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  )
    return 3;

  return 4;
}

export async function getDriveFileThumbnailLink(
  fileId: string,
  auth: DriveAuth,
) {
  const params = new URLSearchParams({
    fields: "thumbnailLink",
    supportsAllDrives: "true",
  });
  const headers = new Headers();

  if (auth.type === "api-key") {
    params.set("key", auth.apiKey);
  } else {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?${params}`,
    {
      headers,
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(
      `Google Drive thumbnail failed for file ${fileId}: ${res.status} ${errorText}`,
    );
    return "";
  }

  const data = (await res.json()) as { thumbnailLink?: string };
  return data.thumbnailLink || "";
}

export async function getServiceAccountAccessToken(
  scopes = ["https://www.googleapis.com/auth/drive.readonly"],
) {
  const credentials = getServiceAccountCredentials();
  if (!credentials) return "";

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncodeJson({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlEncodeJson({
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
    iss: credentials.clientEmail,
    scope: scopes.join(" "),
  });
  const unsignedJwt = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedJwt);
  signer.end();

  const signature = signer.sign(credentials.privateKey, "base64url");
  const assertion = `${unsignedJwt}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
  });
  const data = (await res.json()) as GoogleTokenResponse;

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Erro ao autenticar service account.",
    );
  }

  return data.access_token;
}

export function getServiceAccountClientEmail() {
  return getServiceAccountCredentials()?.clientEmail || "";
}

export async function getDriveAuth(): Promise<DriveAuth | null> {
  if (getServiceAccountClientEmail()) {
    return {
      type: "bearer",
      accessToken: await getServiceAccountAccessToken(),
    };
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    return {
      type: "api-key",
      apiKey,
    };
  }

  return null;
}

function getServiceAccountCredentials() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const jsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey =
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY;

  if (jsonBase64) {
    const parsed = parseServiceAccountJson(jsonBase64, "base64");
    if (parsed.client_email && parsed.private_key) {
      return {
        clientEmail: parsed.client_email,
        privateKey: normalizePrivateKey(parsed.private_key),
      };
    }
  }

  if (json) {
    const parsed = parseServiceAccountJson(
      json,
      json.trim().startsWith("{") ? "json" : "base64",
    );
    if (parsed.client_email && parsed.private_key) {
      return {
        clientEmail: parsed.client_email,
        privateKey: normalizePrivateKey(parsed.private_key),
      };
    }
  }

  if (clientEmail && privateKey) {
    return {
      clientEmail,
      privateKey: normalizePrivateKey(privateKey),
    };
  }

  return null;
}

function parseServiceAccountJson(value: string, format: "json" | "base64") {
  const normalizedValue = value.trim().replace(/%$/, "");
  const json =
    format === "base64"
      ? Buffer.from(normalizedValue, "base64").toString("utf8")
      : normalizedValue;

  return JSON.parse(json) as { client_email?: string; private_key?: string };
}

function normalizePrivateKey(privateKey: string) {
  return privateKey.replace(/\\n/g, "\n");
}

function base64UrlEncodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
