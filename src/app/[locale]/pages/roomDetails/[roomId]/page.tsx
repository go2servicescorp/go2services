import { RoomDetailsView } from "@/components/room-details-view";

export default async function RoomDetailsPage(
  props: PageProps<"/pages/roomDetails/[roomId]">,
) {
  const { roomId } = await props.params;
  const searchParams = await props.searchParams;
  const token =
    typeof searchParams.token === "string" ? searchParams.token : "";

  return <RoomDetailsView roomId={roomId} token={token} />;
}
