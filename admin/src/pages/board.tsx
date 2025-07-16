import { CONFIG } from "src/config-global";
import BoardView from "src/sections/board/view/board-view";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Bảng - ${CONFIG.appName}`}</title>

      <BoardView />
    </>
  );
}
