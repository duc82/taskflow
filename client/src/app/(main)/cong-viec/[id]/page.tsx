import fetchAuth from "@/app/actions/fetchAuth.action";
import BoardDetail from "@/app/components/Board/BoardDetail";
import { Board } from "@/app/types/board";
import { TasksReponse } from "@/app/types/task";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [board, taskInbox] = await Promise.all([
    fetchAuth<Board>(`/boards/${id}`),
    fetchAuth<TasksReponse>("/tasks/inbox"),
  ]);

  return (
    <section className="pt-[68.77px] lg:pt-[73.25px]">
      <BoardDetail board={board} />
    </section>
  );
}
