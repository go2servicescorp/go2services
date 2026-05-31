import { NextResponse } from "next/server";
import { getDriveAuth, getDriveFolderImages } from "@/lib/drive";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/driver-folder/[folderId]">,
) {
  const { folderId } = await context.params;
  const auth = await getDriveAuth();

  if (!auth) {
    return NextResponse.json(
      { error: "Drive auth nao configurado" },
      { status: 500 },
    );
  }

  const images = await getDriveFolderImages(folderId, auth);

  return NextResponse.json(
    { images },
    {
      headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
