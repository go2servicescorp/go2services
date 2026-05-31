import { NextResponse } from "next/server";
import {
  getDriveAuth,
  getDriveFileThumbnailLink,
  getDriveThumbnailUrl,
} from "@/lib/drive";

export async function GET(
  request: Request,
  context: RouteContext<"/api/drive-image/[fileId]">,
) {
  const { fileId } = await context.params;
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("size") === "thumb" ? 600 : 2200;
  const auth = await getDriveAuth();

  if (!auth) {
    return NextResponse.json(
      { error: "Drive auth nao configurado" },
      { status: 500 },
    );
  }

  const thumbnailLink =
    (await getDriveFileThumbnailLink(fileId, auth)) ||
    getDriveThumbnailUrl(fileId, size);

  if (!thumbnailLink) {
    return NextResponse.json(
      { error: "Imagem nao encontrada" },
      { status: 404 },
    );
  }

  const imageUrl = resizeDriveThumbnailUrl(thumbnailLink, size);
  const imageRes = await fetch(imageUrl);

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
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
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
