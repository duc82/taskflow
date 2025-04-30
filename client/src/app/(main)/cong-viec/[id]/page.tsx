import fetchAuth from "@/app/actions/fetchAuth.action";
import BoardContent from "@/app/components/Board/BoardContent";
import { Board } from "@/app/types/board";
import { TasksReponse } from "@/app/types/task";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [board, taskInboxRes] = await Promise.all([
    fetchAuth<Board>(`/boards/${id}`),
    fetchAuth<TasksReponse>("/tasks/inbox"),
  ]);

  console.log(board);

  return (
    <section className="pt-[68.77px] lg:pt-[73.25px]">
      <BoardContent board={board} taskInboxRes={taskInboxRes} />
    </section>
  );
}
