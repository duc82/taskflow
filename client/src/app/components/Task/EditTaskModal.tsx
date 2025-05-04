"use client";

import useMount from "@/app/hooks/useMount";
import { Task } from "@/app/types/task";
import { createPortal } from "react-dom";
import TextArea from "../TextArea";
import { EyeIcon } from "@heroicons/react/24/outline";
import {
  Bars3BottomLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onUpdate,
}: {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, task: Partial<Task>) => void;
}) {
  const isMounted = useMount();
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      id="edit-task-modal"
      className="fixed inset-0 z-50 flex justify-center bg-[#091e427d] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 my-12 p-4 rounded-lg shadow-lg w-[768px] relative text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-2 right-2 size-9 flex items-center justify-center rounded-full hover:bg-gray-300"
          onClick={onClose}
        >
          <XMarkIcon className="size-6" />
        </button>
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              defaultChecked={task.isCompleted}
              className="mr-4 size-4 rounded-full cursor-pointer text-green-700 focus:ring-0 focus:outline-0 focus:shadow-none peer"
              title="Đánh dấu hoàn tất"
            />
            <h2 className="font-semibold text-xl peer-checked:text-gray-500">
              {task.title}
            </h2>
          </div>
          <div className="ml-8 text-gray-500">
            {!task.column && <span>trong Hộp thư đến của bạn</span>}
            {task.column && (
              <span>
                trong danh sách{" "}
                <button type="button">{task.column.title}</button>
              </span>
            )}
          </div>
        </div>
        <div className="flex">
          <div className="pr-2 flex-4/5">
            <div className="flex flex-wrap mb-4 pl-8 gap-2">
              <div>
                <h3 className="text-xs font-semibold leading-5 mb-1 text-gray-600">
                  Thông báo
                </h3>
                <button
                  type="button"
                  className="py-1.5 px-3 flex justify-center items-center rounded-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  <EyeIcon className="size-4 mr-2" />
                  <span>Theo dõi</span>
                  {/* <CheckIcon className="size-3.5 ml-1" /> */}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between text-gray-800 mb-3">
                <div className="flex items-center">
                  <Bars3BottomLeftIcon className="size-6 mr-2" />
                  <h3 className="font-semibold text-base leading-1.5">Mô tả</h3>
                </div>
                <button
                  type="button"
                  className="py-1.5 px-3 flex justify-center items-center rounded-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Chỉnh sửa
                </button>
              </div>
              <div className="pl-8">
                {task.description && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: task.description,
                    }}
                  ></div>
                )}
                {!task.description && (
                  <>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="pt-2 px-3 pb-8 text-left rounded-sm bg-gray-200 font-medium block w-full text-gray-800 hover:bg-gray-300"
                      >
                        Thêm mô tả chi tiết hơn...
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="pl-2 flex-1/5"></div>
        </div>
      </div>
    </div>,
    document.body
  );
}
