import {
  extractDriveFolderId,
  getDriveAuth,
  getDriveFolderImages,
  getServiceAccountAccessToken,
  getServiceAccountClientEmail,
} from "./drive";

export type RoomRecord = {
  [key: string]: string | number | boolean | null | AirtableAttachment[];
};

export type AirtableAttachment = {
  url: string;
  filename: string;
  id?: string;
  // outros campos que o Airtable retorna
};

const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxq3pKJtBwLvktNBh5S9KuTwDJp_88_vg_QUbUBZFxY9qszUiAjRJ6Jpm6g0OWfIlCF/exec";

export async function getRooms() {
  const scriptUrl =
    process.env.ROOM_LISTINGS_API_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    DEFAULT_SCRIPT_URL;

  if (scriptUrl) {
    const res = await fetch(
      `${scriptUrl}${scriptUrl.includes("?") ? "&" : "?"}t=${Date.now()}`,
      {
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) {
      throw new Error(`Fonte externa retornou HTTP ${res.status}`);
    }

    return sortActiveRoomsFirst(
      await addDriveImages(normalizeRooms(await res.json())),
    );
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  const range = process.env.GOOGLE_SHEET_RANGE || "Página1!A1:Z100";

  if (!sheetId) {
    throw new Error(
      "Configure ROOM_LISTINGS_API_URL ou GOOGLE_SHEET_ID.",
    );
  }

  const headers = new Headers();
  const params = new URLSearchParams();

  if (getServiceAccountClientEmail()) {
    headers.set(
      "Authorization",
      `Bearer ${await getServiceAccountAccessToken([
        "https://www.googleapis.com/auth/spreadsheets.readonly",
      ])}`,
    );
  } else if (apiKey) {
    params.set("key", apiKey);
  } else {
    throw new Error(
      "Configure ROOM_LISTINGS_API_URL, GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_API_KEY.",
    );
  }

  const query = params.toString();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    range,
  )}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Google Sheets retornou HTTP ${res.status}`);
  }

  return sortActiveRoomsFirst(
    await addDriveImages(normalizeRooms(await res.json())),
  );
}

export function normalizeRooms(data: unknown): RoomRecord[] {
  if (Array.isArray(data)) {
    return data
      .map(normalizeRecord)
      .filter((room) => Object.keys(room).length > 0);
  }

  if (!isRecord(data)) return [];

  const records = data.rooms || data.data || data.items;
  if (Array.isArray(records)) {
    return records
      .map(normalizeRecord)
      .filter((room) => Object.keys(room).length > 0);
  }

  const values = data.values;
  if (!Array.isArray(values) || values.length === 0) return [];

  const [headers, ...rows] = values;
  if (!Array.isArray(headers)) return [];

  return rows
    .filter(Array.isArray)
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [
          String(header),
          stringifyValue(row[index]),
        ]),
      ),
    )
    .filter((room) => Object.keys(room).length > 0);
}

function normalizeRecord(value: unknown): RoomRecord {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([key, recordValue]) => [
      key,
      stringifyValue(recordValue),
    ]),
  );
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function getStringField(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value) && value.length > 0) {
    const [first] = value;
    if (isRecord(first) && typeof first.url === "string") {
      return first.url;
    }
  }
  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sortActiveRoomsFirst(rooms: RoomRecord[]) {
  return rooms.toSorted(
    (a, b) => Number(isActiveRoom(b)) - Number(isActiveRoom(a)),
  );
}

function isActiveRoom(room: RoomRecord) {
  const value = getStringField(room.available || room.Available).toLowerCase();
  return value === "available" || value === "yes" || value === "true";
}

async function addDriveImages(rooms: RoomRecord[]) {
  const auth = await getDriveAuth();
  if (!auth) return rooms;

  const folderIds = new Set<string>();

  for (const room of rooms) {
    const roomFolderId = extractDriveFolderId(
      getStringField(room["Pictures Room"]),
    );
    const houseFolderId = extractDriveFolderId(
      getStringField(room["Pictures House"]),
    );

    if (roomFolderId) folderIds.add(roomFolderId);
    if (houseFolderId) folderIds.add(houseFolderId);
  }

  const imageByFolder = new Map<
    string,
    Awaited<ReturnType<typeof getDriveFolderImages>>
  >();

  await Promise.all(
    Array.from(folderIds).map(async (folderId) => {
      imageByFolder.set(folderId, await getDriveFolderImages(folderId, auth));
    }),
  );

  return rooms.map((room) => {
    const roomFolderId = extractDriveFolderId(
      getStringField(room["Pictures Room"]),
    );
    const houseFolderId = extractDriveFolderId(
      getStringField(room["Pictures House"]),
    );
    const roomImages = roomFolderId
      ? imageByFolder.get(roomFolderId) || []
      : [];
    const houseImages = houseFolderId
      ? imageByFolder.get(houseFolderId) || []
      : [];

    return {
      ...room,
      "Pictures Room Folder ID": roomFolderId,
      "Pictures House Folder ID": houseFolderId,
      RoomImageUrl: roomImages[0]?.thumbnailUrl || "",
      RoomImageLink: roomImages[0]?.viewUrl || "",
      HouseImageUrl: houseImages[0]?.thumbnailUrl || "",
      HouseImageLink: houseImages[0]?.viewUrl || "",
    };
  });
}
