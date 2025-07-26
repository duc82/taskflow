import fetchAuth from "@/app/actions/fetchAuth.action";
import BoardContent from "@/app/components/Board/BoardContent";
import getServerSession from "@/app/libs/session";
import { Board } from "@/app/types/board";
import { Task } from "@/app/types/task";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [board, tasksInbox, session] = await Promise.all([
    fetchAuth<Board>(`/boards/${id}`),
    fetchAuth<Task[]>("/tasks/inbox"),
    getServerSession(),
  ]);

  return (
    <section className="pt-[68.77px] lg:pt-[73.25px]">
      <BoardContent
        initialBoard={board}
        tasksInbox={tasksInbox}
        user={session.user}
      />
    </section>
  );
}
