import fetchAuth from "@/app/actions/fetchAuth.action";
import { getUnplashImages } from "@/app/actions/unplash.action";
import ListBoard from "@/app/components/Board/ListBoard";
import { BoardsResponse } from "@/app/types/board";

export default async function Boards() {
  const [{ boards }, unplashImages] = await Promise.all([
    fetchAuth<BoardsResponse>("/boards"),
    getUnplashImages(1, 30),
  ]);

  return (
    <section className="w-full py-24 lg:py-28 h-screen">
      <ListBoard initialBoards={boards} unplashImages={unplashImages} />
    </section>
  );
}
