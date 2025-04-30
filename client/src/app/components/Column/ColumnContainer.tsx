"use client";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import TaskCard from "../Task/TaskCard";
import { useMemo, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Task } from "@/app/types/task";
import useMount from "@/app/hooks/useMount";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import TextArea from "../TextArea";
import useClickOutside from "@/app/hooks/useClickOutside";

export default function ColumnContainer({
  columnId,
  tasks,
  updateTask,
  deleteTask,
}: {
  columnId: UniqueIdentifier;
  tasks: Task[];
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}) {
  const isMounted = useMount();
  const [isEditing, setIsEditing] = useState(false);
  const { containerRef } = useClickOutside<HTMLFormElement>({
    enable: isEditing,
    cb: () => setIsEditing(false),
  });

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnId,
    data: {
      type: "Column",
      columnId,
      tasks,
    },
    disabled: isEditing,
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const newAttributes = isMounted
    ? {
        ...attributes,
        ...listeners,
      }
    : {};

  const headerAttributes = !isEditing
    ? {
        onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
        onMouseUp: (e: React.MouseEvent) => e.preventDefault(),
        onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
        onTouchEnd: (e: React.TouchEvent) => e.preventDefault(),
      }
    : {};

  return (
    <li
      className="px-1.5 text-gray-700 max-h-full"
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
      }}
    >
      <div
        {...headerAttributes}
        className={clsx(
          "flex flex-col w-72 justify-between rounded-lg bg-gray-200 max-h-full",
          isDragging && "opacity-50"
        )}
      >
        <div
          className="p-2 pb-0 flex items-center outline-none cursor-pointer"
          {...newAttributes}
        >
          <div className="flex items-start justify-between w-full">
            {isEditing && (
              <form className="w-full" ref={containerRef}>
                <label htmlFor="columnTitle"></label>
                <TextArea
                  name="columnTitle"
                  id="columnTitle"
                  defaultValue={columnId}
                  className="block py-1.5 px-3 w-full resize-none rounded-sm font-semibold text-sm leading-5 outline-none border-none ring-2 ring-blue-500"
                  maxLength={512}
                  style={{
                    minHeight: "32px",
                    height: "32px",
                  }}
                />
              </form>
            )}
            {!isEditing && (
              <h2
                className="font-medium text-sm leading-5 py-1.5 pl-2 pr-3 w-full"
                onClick={() => setIsEditing(true)}
              >
                {columnId}
              </h2>
            )}
            <button
              type="button"
              className="hover:bg-gray-300 rounded-lg p-1.5"
              title="Thao tác"
            >
              <EllipsisHorizontalIcon className="size-5" />
            </button>
          </div>
        </div>
        <ul className="px-4 py-2 space-y-2 overflow-y-auto">
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
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
        <div className="p-2 pb-0">
          <button type="button" className="px-3 py-1.5">
            <span>Thêm thẻ</span>
          </button>
        </div>
      </div>
    </li>
  );
}
