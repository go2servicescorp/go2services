import { NextRequest, NextResponse } from "next/server";
import { getRooms } from "@/lib/rooms";

export async function GET() {
  try {
    const rooms = await getRooms();
    const withImages = rooms.filter(
      (room) => room.RoomImageUrl || room.HouseImageUrl,
    ).length;

    return NextResponse.json({
      rooms,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao buscar quartos",
      },
      { status: 502 },
    );
  }
}
