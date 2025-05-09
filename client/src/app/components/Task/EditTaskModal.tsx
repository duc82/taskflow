"use client";

import useMount from "@/app/hooks/useMount";
import { Task, TaskReponse } from "@/app/types/task";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import TextArea from "../TextArea";
import {
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PaperClipIcon,
  PhotoIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  Bars3BottomLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";
import fetchAuth from "@/app/libs/fetchAuth";
import clsx from "clsx";
import Image from "next/image";
import { useSession } from "next-auth/react";
import cn from "@/app/utils/cn";

export default function EditTaskModal({
  isOpen,
  task,
  onClose,
  onDelete,
  onUpdate,
}: {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, task: Partial<Task>) => void;
}) {
  const { data: session } = useSession();
  const user = session?.user || null;
  const isMounted = useMount();
  const [activeEdit, setActiveEdit] = useState({
    description: false,
    activity: false,
  });
  const [isViewMoreDescription, setViewMoreDescription] = useState(false);
  const [description, setDescription] = useState<string>(
    task.description || ""
  );
  const [activityContent, setActivityContent] = useState<string>("");

  const handleSubmitDescription = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetchAuth<TaskReponse>(
        `/tasks/update/${task.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            description,
          }),
        }
      );
      onUpdate(task.id, response.task);
      setDescription(response.task.description || "");
      setActiveEdit((prev) => ({ ...prev, description: false }));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const resetModal = () => {
    unstable_batchedUpdates(() => {
      setActiveEdit({
        description: false,
        activity: false,
      });
      setDescription(task.description || "");
      onClose();
    });
  };

  const memoizedDescription = useMemo(() => {
    return task.description;
  }, [task.description]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      id="edit-task-modal"
      className="fixed top-0 left-0 h-dvh w-dvw z-50 flex items-start justify-center overflow-auto bg-[#091e427d] backdrop-blur-[2px]"
      onClick={resetModal}
    >
      <div
        className="bg-gray-100 h-auto my-12 p-4 rounded-lg shadow-lg w-[768px] relative text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-2 right-2 size-9 flex items-center justify-center rounded-full hover:bg-gray-300"
          onClick={resetModal}
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
              <div>
                trong danh sách{" "}
                <button
                  type="button"
                  className="px-1 inline-flex items-center bg-gray-200 rounded-sm text-[11px] font-bold uppercase leading-4 text-truncate hover:bg-gray-400 hover:text-gray-700"
                >
                  <span>{task.column.title}</span>
                  <ChevronDownIcon className="size-3 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex">
          {/* Left */}
          <div className="pr-2 flex-3/4">
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
                {memoizedDescription && !activeEdit.description && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveEdit((prev) => ({
                        ...prev,
                        description: true,
                      }))
                    }
                    className="py-1.5 px-3 flex justify-center items-center rounded-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="pl-8">
                {!activeEdit.description && memoizedDescription && (
                  <div>
                    <div
                      style={{
                        maxHeight: isViewMoreDescription ? "none" : 440,
                      }}
                      className={clsx(
                        !isViewMoreDescription &&
                          "overflow-hidden mask-b-from-[calc(100%-100px)] mask-position-[0_0] mask-no-repeat"
                      )}
                    >
                      <div
                        className="tiptap ProseMirror"
                        dangerouslySetInnerHTML={{
                          __html: memoizedDescription,
                        }}
                      ></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewMoreDescription((prev) => !prev)}
                      className="py-1.5 px-3 mt-2 w-full flex justify-center items-center rounded-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                      <ChevronDownIcon
                        className={clsx(
                          "size-5 mr-2",
                          isViewMoreDescription && "rotate-180"
                        )}
                      />
                      {isViewMoreDescription
                        ? "Hiển thị ít hơn"
                        : "Hiển thị nhiều hơn"}
                    </button>
                  </div>
                )}

                {!activeEdit.description && !memoizedDescription && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveEdit((prev) => ({
                        ...prev,
                        description: true,
                      }))
                    }
                    className="pt-2 px-3 pb-8 text-left rounded-sm bg-gray-200 font-medium block w-full text-gray-800 hover:bg-gray-300"
                  >
                    Thêm mô tả chi tiết hơn...
                  </button>
                )}

                {activeEdit.description && (
                  <form onSubmit={handleSubmitDescription}>
                    <SimpleEditor
                      defaultValue={description}
                      setValue={setDescription}
                      editorClassName="description"
                      placeholder="Mẹo chuyên nghiệp: Nhấn 'Enter' để xuống dòng và 'Shift + Enter' để ngắt dòng đơn giản"
                    />
                    <div className="mt-2.5 flex items-center">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-sm font-medium mr-2"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveEdit((prev) => ({
                            ...prev,
                            description: false,
                          }))
                        }
                        className="hover:bg-gray-300 py-1.5 px-3 rounded-sm font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-gray-800 mb-3">
                <div className="flex items-center">
                  <ListBulletIcon className="size-6 mr-2" />
                  <h3 className="font-semibold text-base leading-1.5">
                    Hoạt động
                  </h3>
                </div>
                <button
                  type="button"
                  className="py-1.5 px-3 flex justify-center items-center rounded-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Ẩn chi tiết
                </button>
              </div>
              <div className="flex items-start mb-2">
                <Image
                  src={user?.avatar || ""}
                  alt={user?.name || ""}
                  width={32}
                  height={32}
                  className="rounded-full object-cover mr-2"
                />
                {!activeEdit.activity && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveEdit((prev) => ({ ...prev, activity: true }))
                    }
                    className="w-full text-left rounded-md py-2 px-3 shadow-raised text-sm text-gray-600 bg-white hover:bg-gray-200"
                  >
                    Viết bình luận...
                  </button>
                )}

                {activeEdit.activity && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setActiveEdit((prev) => ({ ...prev, activity: false }));
                    }}
                    className="w-full"
                  >
                    <SimpleEditor
                      defaultValue={activityContent}
                      setValue={setActivityContent}
                      placeholder="Viết bình luận..."
                    />
                    <div className="mt-2.5 flex items-center">
                      <button
                        type="submit"
                        disabled={!activityContent}
                        className={cn(
                          "bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-sm font-medium mr-2",
                          !activityContent &&
                            "opacity-50 cursor-not-allowed hover:bg-blue-600"
                        )}
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveEdit((prev) => ({
                            ...prev,
                            activity: false,
                          }))
                        }
                        className="hover:bg-gray-300 py-1.5 px-3 rounded-sm font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <ul></ul>
            </div>
          </div>

          {/* Right */}
          <div className="pl-2 flex-1/4">
            <ul className="mb-4">
              <li className="mb-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <UserPlusIcon className="size-4 mr-1.5" />
                  <span>Tham gia</span>
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <UserIcon className="size-4 mr-1.5" />
                  <span>Thành viên</span>
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <ClockIcon className="size-4 mr-1.5" />
                  <span>Ngày</span>
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <PaperClipIcon className="size-4 mr-1.5" />
                  <span>Đính kèm</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <PhotoIcon className="size-4 mr-1.5" />
                  <span>Ảnh bìa</span>
                </button>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <ArrowRightIcon className="size-4 mr-1.5" />
                  <span>Di chuyển</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  <DocumentDuplicateIcon className="size-4 mr-1.5" />
                  <span>Sao chép</span>
                </button>
              </li>
              <hr className="text-gray-300" />
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                  onClick={async () => {
                    await onDelete(task.id);
                    onClose();
                  }}
                >
                  <TrashIcon className="size-4 mr-1.5" />
                  <span>Xóa</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
