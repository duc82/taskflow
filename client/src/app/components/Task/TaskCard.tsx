"use client";

import { Task } from "@/app/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { ChangeEvent, MouseEvent, useState } from "react";
import EditTaskModal from "./EditTaskModal";
import useMount from "@/app/hooks/useMount";
import { ChatBubbleLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import cn from "@/app/utils/cn";
import { Bars3BottomLeftIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import useBoard from "@/app/hooks/use-board";

export default function TaskCard({
  task,
  isOverlay = false,
}: {
  task: Task;
  isOverlay?: boolean;
}) {
  const isMounted = useMount();
  const [isOpen, setIsOpen] = useState(false);
  const { updateTask } = useBoard();

  const handleOpen = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.target as HTMLLIElement;

    // Prevent the modal from opening when clicking on the checkbox
    if (target.tagName === "INPUT") return;

    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const markCompleted = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    updateTask(task.id, {
      completedAt: isChecked ? new Date() : null,
    });

    if (isChecked) {
      setIsOpen(false);
    }
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
    },
  });

  const newAttributes = isMounted
    ? {
        ...attributes,
        ...listeners,
      }
    : {};

  const now = new Date();
  const dueDate = new Date(task.dueDate || now);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const isSoonDue = diffHours > 0 && diffHours <= 24;
  const isOverDue = diffHours < 0;

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
          "bg-white rounded-lg relative text-sm shadow-raised cursor-pointer ring-blue-500 group/completed",
          isDragging ? "focus:ring-0" : "focus:ring-2"
        )}
        onClick={handleOpen}
      >
        {task.cover && (
          <div
            className="h-36 bg-cover bg-no-repeat bg-center rounded-t-lg"
            style={{
              backgroundImage: `url(${task.cover})`,
            }}
          ></div>
        )}

        {task.coverColor && (
          <div
            className="h-36 rounded-t-lg"
            style={{ backgroundColor: task.coverColor }}
          ></div>
        )}

        <div className="py-2 px-3">
          {task.labels?.length > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="w-10 h-2 rounded-full opacity-80 hover:opacity-100"
                  title={`Màu sắc: ${label.color}, tiêu đề: ${label.name}`}
                  style={{ backgroundColor: label.color }}
                ></span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isCompleted"
                id={task.title}
                defaultChecked={!!task.completedAt}
                className={clsx(
                  "mr-1 p-0.5 rounded-full cursor-pointer text-green-700 focus:ring-0 focus:outline-0 focus:shadow-none transition-opacity duration-300 ease-in",
                  !task.completedAt &&
                    "opacity-0 group-hover/completed:opacity-100"
                )}
                title="Đánh dấu hoàn tất"
                onChange={markCompleted}
              />

              {isOverlay ? (
                <span>{task.title}</span>
              ) : (
                <span
                  className={clsx(
                    "transition-transform duration-300 ease-in",
                    !task.completedAt &&
                      "-translate-x-5 group-hover/completed:translate-x-0"
                  )}
                >
                  {task.title}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(task.startDate || task.dueDate) && (
              <div
                className="mt-1"
                title={
                  task.completedAt
                    ? "Thẻ này đã hoàn tất"
                    : isSoonDue
                    ? "Thẻ này sắp hết hạn trong vòng 24 giờ"
                    : isOverDue
                    ? "Thẻ đã hết hạn"
                    : "Thẻ chưa hết hạn"
                }
              >
                <button
                  className={cn(
                    "flex items-center space-x-1 bg-gray-200 text-gray-800 rounded-sm px-1 py-0.5 text-xs",
                    isSoonDue && "bg-yellow-500 text-gray-800",
                    isOverDue && "bg-red-700 text-white",
                    task.completedAt && "bg-green-700 text-white"
                  )}
                >
                  <ClockIcon className="size-4" />
                  {task.startDate && (
                    <span>
                      {new Date(task.startDate).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "short",
                        year:
                          new Date(task.startDate).getFullYear() ===
                          new Date().getFullYear()
                            ? undefined
                            : "numeric",
                      })}
                    </span>
                  )}

                  {task.startDate && task.dueDate && <span>-</span>}

                  {task.dueDate && (
                    <span>
                      {new Date(task.dueDate).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "short",
                        year:
                          new Date(task.dueDate).getFullYear() ===
                          new Date().getFullYear()
                            ? undefined
                            : "numeric",
                      })}
                    </span>
                  )}
                </button>
              </div>
            )}
            {task.description && (
              <Bars3BottomLeftIcon
                className="size-4 mt-1"
                title="Thẻ đã có mô tả"
              />
            )}

            {task.comments?.length > 0 && (
              <div
                className="flex items-center space-x-1 mt-1"
                title="Bình luận"
              >
                <ChatBubbleLeftIcon className="size-4" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {task.attachments?.length > 0 && (
              <div
                className="flex items-center space-x-1 mt-1"
                title="Các tập tin đính kèm"
              >
                <PaperClipIcon className="size-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>
          {task.members?.length > 0 && (
            <ul className="flex flex-wrap items-center justify-end mt-0.5 space-x-1">
              {task.members?.map((member) => (
                <li key={member.id}>
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    title={member.name}
                    className="rounded-full object-cover"
                    width={24}
                    height={24}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </li>
      <EditTaskModal
        task={task}
        isSoonDue={isSoonDue}
        isOverDue={isOverDue}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}
