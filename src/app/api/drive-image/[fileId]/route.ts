import { NextResponse } from "next/server";
import {
  getDriveAuth,
  getDriveFileThumbnailLink,
  getDriveThumbnailUrl,
} from "@/lib/drive";

const thumbnailCache = new Map<string, string>();

export async function GET(
  request: Request,
  context: RouteContext<"/api/drive-image/[fileId]">,
) {
  const { fileId } = await context.params;
  const { searchParams } = new URL(request.url);
  const size = getImageSize(searchParams.get("size"));
  const auth = await getDriveAuth();

  if (!auth) {
    return NextResponse.json(
      { error: "Drive auth nao configurado" },
      { status: 500 },
    );
  }

  // Usa cache ou busca uma única vez por fileId
  let thumbnailLink = thumbnailCache.get(fileId);
  if (!thumbnailLink) {
    thumbnailLink =
      (await getDriveFileThumbnailLink(fileId, auth)) ||
      getDriveThumbnailUrl(fileId, size);

    if (thumbnailLink) thumbnailCache.set(fileId, thumbnailLink);
  }

  if (!thumbnailLink) {
    return NextResponse.json(
      { error: "Imagem nao encontrada" },
      { status: 404 },
    );
  }

  const imageUrl = resizeDriveThumbnailUrl(thumbnailLink, size);
  const imageRes = await fetch(imageUrl, {
    next: { revalidate: 604800 }, // Next.js cacheia o fetch por 7 dias
  });

  if (!imageRes.ok) {
    return NextResponse.json(
      { error: "Falha ao buscar imagem" },
      { status: 502 },
    );
  }

  const contentType = imageRes.headers.get("content-type") || "image/jpeg";
  const buffer = await imageRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}

function getImageSize(size: string | null) {
  if (size === "thumb") return 500;
  if (size === "gallery") return 900;
  return 900;
}

function resizeDriveThumbnailUrl(url: string, size: number) {
  if (/[=]s\d+(-c)?/.test(url)) {
    return url.replace(/[=]s\d+(-c)?/, `=s${size}`);
  }

  if (/[=]w\d+(-h\d+)?(-p)?/.test(url)) {
    return url.replace(/[=]w\d+(-h\d+)?(-p)?/, `=w${size}`);
  }

  return url;
}
