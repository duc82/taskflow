"use client";

import { Task } from "@/app/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { TrashIcon } from "@heroicons/react/24/solid";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { MouseEvent, useState } from "react";
import EditTaskModal from "./EditTaskModal";
import useMount from "@/app/hooks/useMount";

export default function TaskCard({
  task,
  updateTask,
  deleteTask,
  isOverlay = false,
}: {
  task: Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => Promise<void>;
  isOverlay?: boolean;
}) {
  const isMounted = useMount();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.target as HTMLLIElement;

    // Prevent the modal from opening when clicking on the checkbox
    if (target.tagName === "INPUT") return;

    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const newAttributes = isMounted
    ? {
        ...attributes,
        ...listeners,
      }
    : {};

  return (
    <>
      <li
        ref={setNodeRef}
        style={{
          transition,
          transform: CSS.Transform.toString(transform),
          opacity: isDragging ? 0.5 : 1,
        }}
        {...newAttributes}
        className={clsx(
          "bg-white py-2 px-3 rounded-lg relative text-sm shadow-raised cursor-pointer ring-blue-500 group/completed",
          isDragging ? "focus:ring-0" : "focus:ring-2"
        )}
        onClick={handleOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {!isOverlay && !isDragging && (
              <input
                type="checkbox"
                name="isCompleted"
                id={task.title}
                defaultChecked={task.isCompleted}
                className={clsx(
                  "mr-1 p-0.5 rounded-full cursor-pointer text-green-700 focus:ring-0 focus:outline-0 focus:shadow-none transition-opacity duration-300 ease-in",
                  !task.isCompleted &&
                    "opacity-0 group-hover/completed:opacity-100"
                )}
                title="Đánh dấu hoàn tất"
              />
            )}
            {isOverlay || isDragging ? (
              <span>{task.title}</span>
            ) : (
              <span
                className={clsx(
                  "transition-transform duration-300 ease-in",
                  !task.isCompleted &&
                    "-translate-x-5 group-hover/completed:translate-x-0"
                )}
              >
                {task.title}
              </span>
            )}
          </div>
          {/* <button type="button" onClick={() => deleteTask(task.id)}>
            <TrashIcon className="size-4" />
          </button> */}
        </div>
      </li>
      <EditTaskModal
        task={task}
        isOpen={isOpen}
        onUpdate={updateTask}
        onClose={handleClose}
        onDelete={deleteTask}
      />
    </>
  );
}
