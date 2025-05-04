"use client";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import TaskCard from "../Task/TaskCard";
import { FormEvent, useMemo, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Task } from "@/app/types/task";
import useMount from "@/app/hooks/useMount";
import {
  EllipsisHorizontalIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import TextArea from "../TextArea";
import useClickOutside from "@/app/hooks/useClickOutside";

export default function ColumnContainer({
  columnId,
  tasks,
  addTask,
  updateTask,
  deleteTask,
}: {
  columnId: UniqueIdentifier;
  tasks: Task[];
  addTask: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}) {
  const isMounted = useMount();
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { containerRef: editFormRef } = useClickOutside<HTMLFormElement>({
    enable: isEditing,
    cb: () => setIsEditing(false),
  });

  const { containerRef: taskFormRef } = useClickOutside<HTMLFormElement>({
    enable: isAdding,
    cb: () => setIsAdding(false),
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
          "flex flex-col w-72 justify-between rounded-lg bg-gray-200 max-h-full pb-2",
          isDragging && "opacity-50"
        )}
      >
        <div
          className="p-2 pb-0 flex items-center outline-none cursor-pointer"
          {...newAttributes}
        >
          <div className="flex items-start justify-between w-full">
            {isEditing && (
              <form className="w-full" ref={editFormRef}>
                <label htmlFor="columnTitle"></label>
                <TextArea
                  name="columnTitle"
                  id="editColumnTitle"
                  defaultValue={columnId}
                  className="block py-1.5 px-3 w-full resize-none overflow-hidden rounded-sm font-semibold text-sm leading-5 outline-none border-none ring-2 ring-blue-500"
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
          {isAdding && (
            <li>
              <form ref={taskFormRef} onSubmit={addTask}>
                <label htmlFor="taskTitle"></label>
                <TextArea
                  name="taskTitle"
                  id="taskTitle"
                  className="block w-full text-gray-700 rounded-lg text-sm overflow-hidden outline-none py-2 px-3 shadow-none resize-none border-none ring-2 ring-blue-500"
                  style={{
                    height: "56px",
                    minHeight: "56px",
                  }}
                  placeholder="Nhập tiêu đề thẻ"
                />
                <input
                  type="text"
                  name="columnTitle"
                  defaultValue={columnId}
                  readOnly
                  hidden
                />
                <div className="flex items-center mt-2">
                  <button
                    type="submit"
                    className="font-medium px-3 py-1.5 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                  >
                    Thêm thẻ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="ml-1 p-1.5 text-gray-900 hover:bg-gray-300 rounded-sm"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </form>
            </li>
          )}
        </ul>
        {!isAdding && (
          <div className="p-2 pb-0 text-gray-600">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-3 py-1.5 pl-2 flex items-center hover:bg-gray-300 hover:text-gray-700 rounded-lg w-full space-x-2 text-sm font-medium leading-1.5"
            >
              <PlusIcon className="size-5" />
              <span>Thêm thẻ</span>
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
