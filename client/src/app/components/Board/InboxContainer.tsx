"use client";
import { Task } from "@/app/types/task";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useMemo } from "react";
import TaskCard from "../Task/TaskCard";
import { useDroppable } from "@dnd-kit/core";

export default function InboxContainer({
  tasks,
  updateTask,
  deleteTask,
}: {
  tasks: Task[];
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: "Inbox",
    data: {
      type: "Column",
      columnId: "Inbox",
      tasks,
    },
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <ul
      ref={setNodeRef}
      className="flex flex-col flex-grow-1 overflow-y-auto overflow-x-hidden px-2 pt-0.5 pb-3 text-gray-700 space-y-2 z-10"
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            updateTask={updateTask}
            deleteTask={deleteTask}
          />
        ))}
      </SortableContext>
    </ul>
  );
}
