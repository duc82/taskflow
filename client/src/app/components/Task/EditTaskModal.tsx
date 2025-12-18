"use client";

import useMount from "@/app/hooks/useMount";
import {
  Attachment,
  Comment,
  Label,
  Task,
  TaskReponse,
} from "@/app/types/task";
import { createPortal } from "react-dom";
import {
  ClockIcon,
  PaperClipIcon,
  PhotoIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ListBulletIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";
import fetchAuth from "@/app/libs/fetchAuth";
import Image from "next/image";
import { useSession } from "next-auth/react";
import cn from "@/app/utils/cn";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { User } from "@/app/types/user";
import { formatDateTime } from "@/app/utils/formatDate";
import TextArea from "../TextArea";
import Link from "next/link";
import toast from "react-hot-toast";
import colors from "@/app/datas/colors.json";
import clsx from "clsx";
import useBoard from "@/app/hooks/use-board";
import unsplash, { UnplashImageURL } from "@/app/libs/unplash";
import { OrderBy } from "unsplash-js";

export default function EditTaskModal({
  isOpen,
  task,
  isSoonDue,
  isOverDue,
  onClose,
}: {
  isOpen: boolean;
  task: Task;
  isSoonDue: boolean;
  isOverDue: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user || null;
  const { board, updateTask, deleteTask, setItems } = useBoard();
  const isMounted = useMount();
  const [activeEdit, setActiveEdit] = useState({
    title: false,
    description: false,
    comment: false,
  });
  const [editCommentId, setEditCommentId] = useState<string>("");
  const [description, setDescription] = useState<string>(
    task.description || "",
  );
  const [commentContent, setCommentContent] = useState<string>("");
  const [editCommentContent, setEditCommentContent] = useState<string>("");
  const [taskMembers, setTaskMembers] = useState<User[]>(task?.members || []);
  const [boardMembers, setBoardMembers] = useState<User[]>(
    task.userInbox
      ? []
      : board.members
          .filter((m) => task.members.every((tm) => tm.id !== m.user.id))
          .map((m) => m.user),
  );
  const [date, setDate] = useState({
    startDate: task.startDate?.split("T")[0] || "",
    dueDate:
      task.dueDate?.split("T")[0] ||
      new Date(
        new Date(task.startDate || Date.now()).getTime() + 24 * 60 * 60 * 1000, // Default to tomorrow
      )
        .toISOString()
        .split("T")[0],
  });
  const [dateActive, setDateActive] = useState({
    startDate: task.startDate ? true : false,
    dueDate: (!task.startDate && !task.dueDate) || task.dueDate ? true : false,
  });
  const [dueTime, setDueTime] = useState<string>(
    task.dueDate?.split("T")[1]?.substring(0, 5) ||
      new Date().toTimeString().split(" ")[0].substring(0, 5),
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    task?.attachments || [],
  );
  const [comments, setComments] = useState<Comment[]>(task?.comments || []);
  const [labels, setLabels] = useState<Label[]>(task?.labels || []);
  const [coverEnd, setCoverEnd] = useState(7);
  const [unplashImages, setUnplashImages] = useState<UnplashImageURL[]>([]);
  const [labelMenu, setLabelMenu] = useState<"default" | "add">("default");
  const [labelValues, setLabelValues] = useState<{
    name: string;
    color: string;
  }>({
    name: "",
    color: "#000000",
  });

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
        },
      );
      updateTask(task.id, response.task);
      setDescription(response.task.description || "");
      setActiveEdit((prev) => ({ ...prev, description: false }));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleSubmitComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetchAuth<{ comment: Comment }>(
        `/tasks/comments/create`,
        {
          method: "POST",
          body: JSON.stringify({
            taskId: task.id,
            content: commentContent,
          }),
        },
      );
      setCommentContent("");
      setActiveEdit((prev) => ({ ...prev, comment: false }));
      setComments((prev) => [...prev, response.comment]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    try {
      await fetchAuth<{ message: string }>(
        `/tasks/comments/remove/${commentId}`,
        {
          method: "DELETE",
        },
      );
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Error removing comment:", error);
    }
  };

  const handleAddMember = async (user: User) => {
    try {
      setTaskMembers((prev) => [...prev, user]);
      setBoardMembers((prev) => prev.filter((m) => m.id !== user.id));

      await updateTask(task.id, {
        members: [...task.members, user],
      });
    } catch (error) {
      console.error("Error toggling member:", error);
    }
  };

  const handleRemoveMember = async (user: User) => {
    try {
      setTaskMembers((prev) => prev.filter((m) => m.id !== user.id));
      setBoardMembers((prev) => [...prev, user]);
      await updateTask(task.id, {
        members: task.members.filter((m) => m.id !== user.id),
      });
    } catch (error) {
      console.error("Error toggling member:", error);
    }
  };

  const handleSearchMembers = (e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value.trim();

    if (!search) {
      setBoardMembers(board.members.map((m) => m.user));
      setTaskMembers(task.members);
      return;
    }

    setBoardMembers((prev) =>
      prev.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    );
    setTaskMembers((prev) =>
      prev.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    );
  };

  const handleUpdateDate = async () => {
    try {
      await updateTask(task.id, {
        startDate: dateActive.startDate ? date.startDate : null,
        dueDate: dateActive.dueDate ? `${date.dueDate} ${dueTime}:00` : null,
      });
    } catch (error) {
      console.error("Error updating task date:", error);
    }
  };

  const handleRemoveDate = async () => {
    try {
      await updateTask(task.id, {
        startDate: null,
        dueDate: null,
      });
      setDate({
        startDate: "",
        dueDate: new Date().toISOString().split("T")[0],
      });
      setDueTime(new Date().toTimeString().split(" ")[0].substring(0, 5));
      setDateActive({
        startDate: false,
        dueDate: true,
      });
    } catch (error) {
      console.error("Error removing task date:", error);
    }
  };

  const handleUploadAttachments = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("taskId", task.id);

    try {
      toast.loading("Đang tải tệp lên...");
      const response = await fetchAuth<{ attachments: Attachment[] }>(
        `/tasks/attachments/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      setAttachments((prev) => [...prev, ...response.attachments]);
    } catch (error) {
      console.error("Error uploading attachments:", error);
    } finally {
      toast.dismiss();
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await fetchAuth<{ message: string }>(
        "/tasks/attachments/remove/" + attachmentId,
        {
          method: "DELETE",
        },
      );
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.id !== attachmentId),
      );
    } catch (error) {
      console.error("Error removing attachment:", error);
    }
  };

  const handleSetCoverColor = async (color: string) => {
    try {
      await updateTask(task.id, {
        coverColor: color,
        cover: null,
      });
    } catch (error) {
      console.error("Error setting cover color:", error);
    }
  };

  const handleSetCover = async (url: string) => {
    try {
      await updateTask(task.id, {
        cover: url,
        coverColor: null,
      });
    } catch (error) {
      console.error("Error setting cover image:", error);
    }
  };

  const handleUploadCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("coverColor", "");

    try {
      toast.loading("Đang tải ảnh bìa lên...");
      updateTask(task.id, formData);
    } catch (error) {
      console.error("Error uploading cover:", error);
    } finally {
      toast.dismiss();
    }
  };

  const handleAddLabel = async () => {
    try {
      const response = await fetchAuth<{ label: Label }>(
        `/tasks/labels/create`,
        {
          method: "POST",
          body: JSON.stringify({
            taskId: task.id,
            name: labelValues.name,
            color: labelValues.color,
          }),
        },
      );
      setLabels((prev) => [...prev, response.label]);
      setLabelMenu("default");
      setLabelValues({ name: "", color: "#000000" });
    } catch (error) {
      console.error("Error adding label:", error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    try {
      await fetchAuth<{ message: string }>(`/tasks/labels/delete/${labelId}`, {
        method: "DELETE",
      });
      setLabels((prev) => prev.filter((label) => label.id !== labelId));
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };

  const resetModal = () => {
    setActiveEdit({
      title: false,
      description: false,
      comment: false,
    });
    setDescription(task.description || "");
    onClose();
  };

  const memoizedDescription = useMemo(() => {
    return task.description;
  }, [task.description]);

  useEffect(() => {
    if (!isOpen) return;
    unsplash.collections
      .getPhotos({
        page: 1,
        perPage: 30,
        orderBy: OrderBy.LATEST,
        collectionId: "317099",
      })
      .then((response) => {
        setUnplashImages(
          response.response?.results.map((data) => data.urls) || [],
        );
      });
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      id="edit-task-modal"
      className="fixed top-0 left-0 h-dvh w-dvw z-50 flex items-start justify-center overflow-auto bg-[#091e427d] backdrop-blur-[2px]"
      onClick={resetModal}
    >
      <div
        className="bg-gray-100 h-auto my-12 rounded-lg shadow-lg w-3xl relative text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={cn(
            "absolute top-2 right-2 size-9 flex items-center justify-center rounded-full hover:bg-gray-300",
            (task.cover || task.coverColor) && "text-white hover:bg-gray-500",
          )}
          onClick={resetModal}
        >
          <XMarkIcon className="size-6" />
        </button>
        {/* Wallpaper */}
        {task.cover && (
          <div
            style={{
              backgroundImage: `url(${task.cover})`,
            }}
            className="h-40 w-full bg-no-repeat bg-cover bg-center rounded-t-lg"
          ></div>
        )}
        {task.coverColor && (
          <div
            style={{ backgroundColor: task.coverColor }}
            className="h-40 w-full rounded-t-lg"
          ></div>
        )}
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center mr-10">
              <input
                type="checkbox"
                defaultChecked={!!task.completedAt}
                className="mr-4 size-4 rounded-full cursor-pointer text-green-700 focus:ring-0 focus:outline-0 focus:shadow-none peer"
                title={
                  task.completedAt
                    ? "Đánh dấu chưa hoàn tất"
                    : "Đánh dấu hoàn tất"
                }
                onChange={(e) => {
                  updateTask(task.id, {
                    completedAt: e.target.checked
                      ? new Date().toISOString()
                      : null,
                  });
                }}
              />

              <TextArea
                defaultValue={task.title}
                className="peer-checked:text-gray-500 font-semibold text-xl border-none bg-inherit w-full rounded-sm focus:ring-2 focus:ring-blue-600 overflow-hidden resize-none p-1.5 -ml-3"
                style={{
                  minHeight: "40px",
                  height: "40px",
                }}
              />
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
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex">
            {/* Left */}
            <div className="pr-2 flex-3/4">
              <div className="flex flex-wrap mb-4 pl-8 space-x-4">
                {task.members?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold leading-5 mb-1 text-gray-600">
                      Thành viên
                    </h3>
                    <ul className="flex items-center">
                      {task.members.map((member) => (
                        <li key={member.id} className="mr-2">
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            title={member.name}
                            className="rounded-full object-cover"
                            width={32}
                            height={32}
                          />
                        </li>
                      ))}
                      <li>
                        <Menu as="div">
                          <MenuButton
                            type="button"
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                          >
                            <PlusIcon className="size-4" />
                          </MenuButton>
                          <MenuItems
                            anchor="bottom start"
                            className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                          >
                            <header className="py-1 px-3">
                              <div className="flex items-center justify-between h-10">
                                <div></div>
                                <h2 className="text-center font-medium">
                                  Thành viên
                                </h2>
                                <MenuItem>
                                  <button
                                    type="button"
                                    className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                                  >
                                    <XMarkIcon className="size-5" />
                                  </button>
                                </MenuItem>
                              </div>
                            </header>
                            <div className="p-3 overflow-y-auto max-h-56">
                              <input
                                type="text"
                                className="w-full rounded-sm py-1.5 px-3 placeholder:text-sm"
                                placeholder="Tìm kiếm các thành viên"
                                onChange={handleSearchMembers}
                              />
                              {taskMembers?.length > 0 && (
                                <>
                                  <h3 className="mt-4 mb-2 text-gray-800 text-xs font-semibold">
                                    Thành viên của thẻ
                                  </h3>
                                  <ul>
                                    {taskMembers.map((user) => (
                                      <li
                                        key={user.id}
                                        className="hover:bg-gray-200 cursor-pointer p-1"
                                        onClick={() => handleRemoveMember(user)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2 text-gray-800">
                                            <Image
                                              src={user.avatar}
                                              alt={user.name}
                                              width={32}
                                              height={32}
                                              className="object-cover rounded-full"
                                            />
                                            <span>{user.name} </span>
                                          </div>
                                          <button type="button">
                                            <XMarkIcon className="size-4" />
                                          </button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}

                              {boardMembers?.length > 0 && (
                                <>
                                  <h3 className="mt-4 mb-2 text-gray-800 text-xs font-semibold">
                                    Thành viên của bảng
                                  </h3>
                                  <ul>
                                    {boardMembers.map((user) => (
                                      <li
                                        key={user.id}
                                        className="hover:bg-gray-200 cursor-pointer p-1"
                                        onClick={() => handleAddMember(user)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2 text-gray-800">
                                            <Image
                                              src={user.avatar}
                                              alt={user.name}
                                              width={32}
                                              height={32}
                                              className="object-cover rounded-full"
                                            />
                                            <span>{user.name} </span>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          </MenuItems>
                        </Menu>
                      </li>
                    </ul>
                  </div>
                )}

                {labels.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold leading-5 mb-1 text-gray-600">
                      Nhãn
                    </h3>
                    <ul className="flex items-center">
                      {task.labels.map((label) => (
                        <li
                          key={label.id}
                          className="rounded h-8 min-w-12 leading-8 truncate text-white px-3 mr-2"
                          style={{
                            backgroundColor: label.color,
                          }}
                        >
                          {label.name}
                        </li>
                      ))}
                      <li>
                        <Menu as="div">
                          <MenuButton
                            type="button"
                            className="flex items-center justify-center w-8 h-8 rounded bg-gray-200 hover:bg-gray-300"
                          >
                            <PlusIcon className="size-4" />
                          </MenuButton>
                          {labelMenu === "default" && (
                            <MenuItems
                              anchor="bottom start"
                              className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                            >
                              <header className="py-1 px-3">
                                <div className="flex items-center justify-between h-10">
                                  <div></div>
                                  <h2 className="text-center font-medium">
                                    Nhãn
                                  </h2>
                                  <MenuItem>
                                    <button
                                      type="button"
                                      className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                                    >
                                      <XMarkIcon className="size-5" />
                                    </button>
                                  </MenuItem>
                                </div>
                              </header>
                              <div className="pb-3 px-3">
                                <div>
                                  <p className="text-xs font-semibold leading-5 mb-1 text-gray-600">
                                    Nhãn
                                  </p>
                                  {labels.map((label) => (
                                    <div
                                      className="flex items-center"
                                      key={label.id}
                                    >
                                      <div
                                        className="rounded flex-1 h-8 leading-8 px-3 text-white truncate"
                                        style={{
                                          backgroundColor: label.color,
                                        }}
                                      >
                                        {label.name}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteLabel(label.id)
                                        }
                                        className="p-2 hover:bg-gray-200 rounded ml-1"
                                      >
                                        <TrashIcon className="size-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setLabelMenu("add")}
                                  className="mt-4 py-1.5 w-full flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 font-semibold"
                                >
                                  Tạo nhãn mới
                                </button>
                              </div>
                            </MenuItems>
                          )}

                          {labelMenu === "add" && (
                            <MenuItems
                              anchor="bottom start"
                              className="bg-white shadow-overlay rounded-lg mt-2 text-gray-800 text-sm w-80 z-50"
                            >
                              <header className="py-1 px-3">
                                <div className="flex items-center justify-between h-10">
                                  <button
                                    type="button"
                                    onClick={() => setLabelMenu("default")}
                                    className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                                  >
                                    <ChevronLeftIcon className="size-5" />
                                  </button>
                                  <h2 className="text-center font-medium">
                                    Tạo nhãn mới
                                  </h2>
                                  <button
                                    type="button"
                                    className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                                  >
                                    <XMarkIcon className="size-5" />
                                  </button>
                                </div>
                              </header>
                              <div className="p-8 bg-gray-300">
                                <div
                                  className="rounded px-3 h-8 leading-8 text-white font-medium text-sm truncate"
                                  style={{
                                    backgroundColor: labelValues.color,
                                  }}
                                >
                                  {labelValues.name}
                                </div>
                              </div>
                              <div className="p-3">
                                <div className="mb-2">
                                  <label
                                    htmlFor="labelName"
                                    className="block text-xs font-semibold leading-5 mb-1 text-gray-600"
                                  >
                                    Tiêu đề
                                  </label>
                                  <input
                                    type="text"
                                    id="labelName"
                                    className="w-full px-2 py-1.5 rounded text-sm"
                                    value={labelValues.name}
                                    onChange={(e) =>
                                      setLabelValues((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="mb-2">
                                  <label
                                    htmlFor="labelColor"
                                    className="block text-xs font-semibold leading-5 mb-1 text-gray-600"
                                  >
                                    Chọn màu sắc
                                  </label>
                                  <input
                                    type="color"
                                    id="labelColor"
                                    className="w-full h-9 border-none cursor-pointer"
                                    defaultValue={labelValues.color}
                                    onChange={(e) =>
                                      setLabelValues((prev) => ({
                                        ...prev,
                                        color: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddLabel}
                                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                                >
                                  Tạo mới
                                </button>
                              </div>
                            </MenuItems>
                          )}
                        </Menu>
                      </li>
                    </ul>
                  </div>
                )}

                {(task.startDate || task.dueDate) && (
                  <div>
                    <h3 className="text-xs font-semibold leading-5 mb-1 text-gray-600">
                      Ngày {task.startDate && !task.dueDate && "bắt đầu"}{" "}
                      {!task.startDate && task.dueDate && "kết thúc"}
                    </h3>
                    <Menu as="div">
                      {({ close }) => (
                        <>
                          <MenuButton className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-sm py-1.5 px-3 font-medium">
                            {task.startDate && (
                              <span>
                                {new Date(task.startDate).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year:
                                      new Date(task.startDate).getFullYear() ===
                                      new Date().getFullYear()
                                        ? undefined
                                        : "numeric",
                                  },
                                )}
                              </span>
                            )}

                            {task.startDate && task.dueDate && <span>-</span>}

                            {task.dueDate && (
                              <>
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString(
                                    "vi-VN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "numeric",
                                      month: "short",
                                      year:
                                        new Date(task.dueDate).getFullYear() ===
                                        new Date().getFullYear()
                                          ? undefined
                                          : "numeric",
                                    },
                                  )}
                                </span>

                                {task.completedAt ? (
                                  <span className="px-1 py-0.5 rounded text-white bg-green-700 font-medium text-xs ml-2">
                                    Hoàn tất
                                  </span>
                                ) : (
                                  <>
                                    {isOverDue && (
                                      <span className="px-1 py-0.5 rounded text-white bg-red-700 font-medium text-xs ml-2">
                                        Quá hạn
                                      </span>
                                    )}

                                    {isSoonDue && (
                                      <span className="px-1 py-0.5 rounded text-gray-800 bg-yellow-500 font-medium text-xs ml-2">
                                        Sắp hết hạn
                                      </span>
                                    )}
                                  </>
                                )}

                                <ChevronDownIcon className="size-4 ml-1" />
                              </>
                            )}
                          </MenuButton>
                          <MenuItems
                            anchor="bottom start"
                            className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                          >
                            <header className="py-1 px-4">
                              <div className="flex items-center justify-between h-10">
                                <div></div>
                                <h2 className="text-center font-medium">
                                  Chọn ngày
                                </h2>
                                <MenuItem>
                                  <button
                                    type="button"
                                    className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                                  >
                                    <XMarkIcon className="size-5" />
                                  </button>
                                </MenuItem>
                              </div>
                            </header>

                            <div className="px-4 py-2">
                              <div className="mb-4">
                                <label htmlFor="">Ngày bắt đầu</label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={dateActive.startDate}
                                    onChange={(e) => {
                                      setDateActive((prev) => ({
                                        ...prev,
                                        startDate: e.target.checked,
                                      }));
                                      if (!date.startDate) {
                                        setDate((prev) => ({
                                          ...prev,
                                          startDate: new Date()
                                            .toISOString()
                                            .split("T")[0],
                                        }));
                                      }
                                    }}
                                  />
                                  <input
                                    type="date"
                                    className="rounded p-1.5 text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:border-none"
                                    value={
                                      dateActive.startDate ? date.startDate : ""
                                    }
                                    onChange={(e) => {
                                      const newDate = new Date(e.target.value);
                                      const dueDate = new Date(date.dueDate);

                                      if (newDate >= dueDate) {
                                        dueDate.setDate(newDate.getDate() + 1);
                                      }

                                      setDate({
                                        startDate: e.target.value,
                                        dueDate: dueDate
                                          .toISOString()
                                          .split("T")[0],
                                      });
                                    }}
                                    disabled={!dateActive.startDate}
                                  />
                                </div>
                              </div>
                              <div className="mb-4">
                                <label htmlFor="" className="mt-2">
                                  Ngày hết hạn
                                </label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={dateActive.dueDate}
                                    onChange={(e) => {
                                      setDateActive((prev) => ({
                                        ...prev,
                                        dueDate: e.target.checked,
                                      }));
                                    }}
                                  />
                                  <input
                                    type="date"
                                    className="rounded p-1.5 text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:border-none"
                                    value={
                                      dateActive.dueDate ? date.dueDate : ""
                                    }
                                    onChange={(e) =>
                                      setDate((prev) => ({
                                        ...prev,
                                        dueDate: e.target.value,
                                      }))
                                    }
                                    disabled={!dateActive.dueDate}
                                  />
                                  <input
                                    type="time"
                                    className="rounded p-1.5 text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:border-none"
                                    value={dateActive.dueDate ? dueTime : ""}
                                    onChange={(e) => setDueTime(e.target.value)}
                                    disabled={!dateActive.dueDate}
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  await handleUpdateDate();
                                  close();
                                }}
                                className="p-1.5 w-full bg-blue-600 hover:bg-blue-700 rounded text-white text-center font-medium mb-2"
                              >
                                Lưu
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await handleRemoveDate();
                                  close();
                                }}
                                className="p-1.5 w-full text-center bg-gray-100 hover:bg-gray-300 rounded font-medium text-gray-800"
                              >
                                Gỡ bỏ
                              </button>
                            </div>
                          </MenuItems>
                        </>
                      )}
                    </Menu>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-gray-800 mb-3">
                  <div className="flex items-center">
                    <Bars3BottomLeftIcon className="size-6 mr-2" />
                    <h3 className="font-semibold text-base leading-1.5">
                      Mô tả
                    </h3>
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
                        className="tiptap ProseMirror"
                        dangerouslySetInnerHTML={{
                          __html: memoizedDescription,
                        }}
                      ></div>
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

              {attachments.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-gray-800 mb-3">
                    <div className="flex items-center">
                      <PaperClipIcon className="size-5 mr-2" />
                      <h3 className="font-semibold text-base leading-1.5">
                        Các tệp đính kèm
                      </h3>
                    </div>
                    <Menu as="div">
                      <MenuButton
                        type="button"
                        className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                      >
                        <span>Thêm</span>
                      </MenuButton>
                      <MenuItems
                        anchor="bottom start"
                        className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                      >
                        <header className="py-1 px-4">
                          <div className="flex items-center justify-between h-10">
                            <div></div>
                            <h2 className="text-center font-medium">
                              Đính kèm
                            </h2>
                            <MenuItem>
                              <button
                                type="button"
                                className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                              >
                                <XMarkIcon className="size-5" />
                              </button>
                            </MenuItem>
                          </div>
                        </header>

                        <div className="p-3">
                          <h2 className="mb-2">
                            Kính kèm tệp từ máy tính của bạn
                          </h2>
                          <label
                            htmlFor="attachments"
                            className="w-full flex items-center justify-center py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-gray-700 font-medium"
                          >
                            <span>Chọn tệp</span>
                            <input
                              type="file"
                              id="attachments"
                              multiple
                              hidden
                              onChange={handleUploadAttachments}
                            />
                          </label>
                        </div>
                      </MenuItems>
                    </Menu>
                  </div>
                  <div className="pl-6">
                    <ul className="flex flex-wrap gap-2">
                      {attachments.map((attachment) => {
                        return (
                          <li
                            key={attachment.id}
                            className="flex items-center justify-between w-full rounded-md p-2"
                          >
                            <div className="flex items-center space-x-2">
                              {attachment.type.startsWith("image/") ? (
                                <Image
                                  src={attachment.url}
                                  alt={attachment.name}
                                  width={64}
                                  height={48}
                                  className="rounded-md object-cover mr-2"
                                />
                              ) : (
                                <div className="bg-gray-200 rounded w-16 h-12 flex items-center justify-center font-bold uppercase text-gray-600 shadow-raised mr-2">
                                  {attachment.name.split(".").pop()}
                                </div>
                              )}
                              <div className="text-sm text-gray-800 truncate">
                                <h3 className="font-medium">
                                  {attachment.name}
                                </h3>
                                <span
                                  title={new Date(
                                    attachment.createdAt,
                                  ).toLocaleString("vi-VN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                  className="text-xs"
                                >
                                  Đã thêm {formatDateTime(attachment.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Link
                                href={attachment.url}
                                target="_blank"
                                className="mr-2 p-2 hover:bg-gray-300 rounded-sm"
                              >
                                <ArrowUpRightIcon className="size-3" />
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveAttachment(attachment.id)
                                }
                                className="p-2 hover:bg-gray-300 rounded-sm"
                              >
                                <TrashIcon className="size-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-gray-800 mb-3">
                  <div className="flex items-center">
                    <ListBulletIcon className="size-6 mr-2" />
                    <h3 className="font-semibold text-base leading-1.5">
                      Nhận xét và các hoạt động
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
                  {user && (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover mr-2"
                    />
                  )}
                  {!activeEdit.comment && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveEdit((prev) => ({ ...prev, comment: true }))
                      }
                      className="w-full text-left rounded-md py-2 px-3 shadow-raised text-sm text-gray-600 bg-white hover:bg-gray-200"
                    >
                      Viết bình luận...
                    </button>
                  )}

                  {activeEdit.comment && (
                    <form onSubmit={handleSubmitComment} className="w-full">
                      <SimpleEditor
                        defaultValue={commentContent}
                        setValue={setCommentContent}
                        placeholder="Viết bình luận..."
                      />
                      <div className="mt-2.5 flex items-center">
                        <button
                          type="submit"
                          disabled={!commentContent.trim()}
                          className={cn(
                            "bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-sm font-medium mr-2",
                            !commentContent &&
                              "opacity-50 cursor-not-allowed hover:bg-blue-600",
                          )}
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveEdit((prev) => ({
                              ...prev,
                              comment: false,
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
                <ul className="space-y-4">
                  {comments.map((comment) => (
                    <li key={comment.id}>
                      <div className="flex items-start space-x-2">
                        <Image
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          title={comment.user.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <div className="w-full">
                          <div>
                            <span className="text-gray-800 font-bold mr-2">
                              {comment.user.name}
                            </span>
                            <span
                              className="text-xs text-gray-700"
                              title={new Date(comment.createdAt).toLocaleString(
                                "vi-VN",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                },
                              )}
                            >
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>

                          {editCommentId === comment.id && (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!editCommentContent.trim()) return;
                                setEditCommentId("");
                                setComments((prevComments) =>
                                  prevComments.map((c) =>
                                    c.id === comment.id
                                      ? { ...c, content: editCommentContent }
                                      : c,
                                  ),
                                );
                                updateTask(task.id, {
                                  comments: task.comments.map((c) =>
                                    c.id === comment.id
                                      ? { ...c, content: editCommentContent }
                                      : c,
                                  ),
                                });
                              }}
                              className="mt-2"
                            >
                              <SimpleEditor
                                defaultValue={comment.content}
                                setValue={setEditCommentContent}
                                placeholder="Chỉnh sửa bình luận..."
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
                                  onClick={() => setEditCommentId("")}
                                  className="hover:bg-gray-300 py-1.5 px-3 rounded-sm font-medium"
                                >
                                  Hủy
                                </button>
                              </div>
                            </form>
                          )}

                          {!editCommentId && (
                            <>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: comment.content,
                                }}
                                className="bg-white rounded-md px-2.5 py-2 w-full mt-1 shadow-sm tiptap ProseMirror"
                              ></div>
                              <div className="flex items-center space-x-2 text-gray-700 text-xs mt-1.5">
                                <button
                                  type="button"
                                  className="hover:underline"
                                  onClick={() => setEditCommentId(comment.id)}
                                >
                                  Chỉnh sửa
                                </button>
                                <button
                                  type="button"
                                  className="hover:underline"
                                  onClick={() => {
                                    handleRemoveComment(comment.id);
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right */}
            <div className="pl-2 flex-1/4">
              <ul className="mb-2">
                {!task.userInbox && (
                  <li className="mb-2">
                    {!task.members.some((m) => m.id === user?.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) return;
                          handleAddMember(user);
                        }}
                        className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                      >
                        <UserPlusIcon className="size-4 mr-1.5" />
                        <span>Tham gia</span>
                      </button>
                    )}
                    {task.members.some((m) => m.id === user?.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) return;
                          handleRemoveMember(user);
                        }}
                        className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                      >
                        <UserMinusIcon className="size-4 mr-1.5" />
                        <span>Rời đi</span>
                      </button>
                    )}
                  </li>
                )}
                <li className="mb-2">
                  <Menu as="div">
                    <MenuButton
                      type="button"
                      className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    >
                      <UserIcon className="size-4 mr-1.5" />
                      <span>Thành viên</span>
                    </MenuButton>
                    <MenuItems
                      anchor="bottom start"
                      className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                    >
                      <header className="py-1 px-3">
                        <div className="flex items-center justify-between h-10">
                          <div></div>
                          <h2 className="text-center font-medium">
                            Thành viên
                          </h2>
                          <MenuItem>
                            <button
                              type="button"
                              className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                            >
                              <XMarkIcon className="size-5" />
                            </button>
                          </MenuItem>
                        </div>
                      </header>
                      <div className="p-3 overflow-y-auto max-h-56">
                        <input
                          type="text"
                          className="w-full rounded-sm py-1.5 px-3 placeholder:text-sm"
                          placeholder="Tìm kiếm các thành viên"
                          onChange={handleSearchMembers}
                        />
                        {taskMembers?.length > 0 && (
                          <>
                            <h3 className="mt-4 mb-2 text-gray-800 text-xs font-semibold">
                              Thành viên của thẻ
                            </h3>
                            <ul>
                              {taskMembers.map((user) => (
                                <li
                                  key={user.id}
                                  className="hover:bg-gray-200 cursor-pointer p-1"
                                  onClick={() => handleRemoveMember(user)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-gray-800">
                                      <Image
                                        src={user.avatar}
                                        alt={user.name}
                                        width={32}
                                        height={32}
                                        className="object-cover rounded-full"
                                      />
                                      <span>{user.name} </span>
                                    </div>
                                    <button type="button">
                                      <XMarkIcon className="size-4" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        {boardMembers?.length > 0 && (
                          <>
                            <h3 className="mt-4 mb-2 text-gray-800 text-xs font-semibold">
                              Thành viên của bảng
                            </h3>
                            <ul>
                              {boardMembers.map((user) => (
                                <li
                                  key={user.id}
                                  className="hover:bg-gray-200 cursor-pointer p-1"
                                  onClick={() => handleAddMember(user)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-gray-800">
                                      <Image
                                        src={user.avatar}
                                        alt={user.name}
                                        width={32}
                                        height={32}
                                        className="object-cover rounded-full"
                                      />
                                      <span>{user.name} </span>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </MenuItems>
                  </Menu>
                </li>

                <li className="mb-2">
                  <Menu as="div">
                    {({ close }) => (
                      <>
                        <MenuButton
                          type="button"
                          className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                        >
                          <ClockIcon className="size-4 mr-1.5" />
                          <span>Ngày</span>
                        </MenuButton>
                        <MenuItems
                          anchor="bottom start"
                          className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                        >
                          <header className="py-1 px-4">
                            <div className="flex items-center justify-between h-10">
                              <div></div>
                              <h2 className="text-center font-medium">
                                Chọn ngày
                              </h2>
                              <MenuItem>
                                <button
                                  type="button"
                                  className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                                >
                                  <XMarkIcon className="size-5" />
                                </button>
                              </MenuItem>
                            </div>
                          </header>

                          <div className="px-4 py-2">
                            <div className="mb-4">
                              <label htmlFor="">Ngày bắt đầu</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  checked={dateActive.startDate}
                                  onChange={(e) => {
                                    setDateActive((prev) => ({
                                      ...prev,
                                      startDate: e.target.checked,
                                    }));
                                    if (!date.startDate) {
                                      setDate((prev) => ({
                                        ...prev,
                                        startDate: new Date()
                                          .toISOString()
                                          .split("T")[0],
                                      }));
                                    }
                                  }}
                                />
                                <input
                                  type="date"
                                  className="rounded p-1.5 text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:border-none"
                                  value={
                                    dateActive.startDate ? date.startDate : ""
                                  }
                                  onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    const dueDate = new Date(date.dueDate);

                                    if (newDate >= dueDate) {
                                      dueDate.setDate(newDate.getDate() + 1);
                                    }

                                    setDate({
                                      startDate: e.target.value,
                                      dueDate: dueDate
                                        .toISOString()
                                        .split("T")[0],
                                    });
                                  }}
                                  disabled={!dateActive.startDate}
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label htmlFor="" className="mt-2">
                                Ngày hết hạn
                              </label>
                              <div className="flex items-center space-x-2 mt-1">
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  checked={dateActive.dueDate}
                                  onChange={(e) => {
                                    setDateActive((prev) => ({
                                      ...prev,
                                      dueDate: e.target.checked,
                                    }));
                                  }}
                                />
                                <input
                                  type="date"
                                  className="rounded p-1.5 text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:border-none"
                                  value={dateActive.dueDate ? date.dueDate : ""}
                                  onChange={(e) =>
                                    setDate((prev) => ({
                                      ...prev,
                                      dueDate: e.target.value,
                                    }))
                                  }
                                  disabled={!dateActive.dueDate}
                                />
                                <input
                                  type="time"
                                  className="rounded p-1.5 text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:border-none"
                                  value={dateActive.dueDate ? dueTime : ""}
                                  onChange={(e) => setDueTime(e.target.value)}
                                  disabled={!dateActive.dueDate}
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                await handleUpdateDate();
                                close();
                              }}
                              className="p-1.5 w-full bg-blue-600 hover:bg-blue-700 rounded text-white text-center font-medium mb-2"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await handleRemoveDate();
                                close();
                              }}
                              className="p-1.5 w-full text-center bg-gray-100 hover:bg-gray-300 rounded font-medium text-gray-800"
                            >
                              Gỡ bỏ
                            </button>
                          </div>
                        </MenuItems>
                      </>
                    )}
                  </Menu>
                </li>
                <li className="mb-2">
                  <Menu as="div">
                    <MenuButton
                      type="button"
                      className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    >
                      <PaperClipIcon className="size-4 mr-1.5" />
                      <span>Đính kèm</span>
                    </MenuButton>
                    <MenuItems
                      anchor="bottom start"
                      className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                    >
                      <header className="py-1 px-4">
                        <div className="flex items-center justify-between h-10">
                          <div></div>
                          <h2 className="text-center font-medium">Đính kèm</h2>
                          <MenuItem>
                            <button
                              type="button"
                              className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                            >
                              <XMarkIcon className="size-5" />
                            </button>
                          </MenuItem>
                        </div>
                      </header>

                      <div className="p-3">
                        <h2 className="mb-2">
                          Kính kèm tệp từ máy tính của bạn
                        </h2>
                        <label
                          htmlFor="attachments"
                          className="w-full flex items-center justify-center py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-gray-700 font-medium"
                        >
                          <span>Chọn tệp</span>
                          <input
                            type="file"
                            id="attachments"
                            multiple
                            hidden
                            onChange={handleUploadAttachments}
                          />
                        </label>
                      </div>
                    </MenuItems>
                  </Menu>
                </li>
                <li className="mb-2">
                  <Menu as="div">
                    <MenuButton
                      type="button"
                      className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    >
                      <TagIcon className="size-4 mr-1.5" />
                      <span>Nhãn</span>
                    </MenuButton>
                    {labelMenu === "default" && (
                      <MenuItems
                        anchor="bottom start"
                        className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-50"
                      >
                        <header className="py-1 px-3">
                          <div className="flex items-center justify-between h-10">
                            <div></div>
                            <h2 className="text-center font-medium">Nhãn</h2>
                            <MenuItem>
                              <button
                                type="button"
                                className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                              >
                                <XMarkIcon className="size-5" />
                              </button>
                            </MenuItem>
                          </div>
                        </header>
                        <div className="pt-1.5 pb-3 px-3">
                          <div>
                            <p className="text-xs font-semibold leading-5 mb-1 text-gray-600">
                              Nhãn
                            </p>
                            {labels.map((label) => (
                              <div className="flex items-center" key={label.id}>
                                <div
                                  className="rounded flex-1 h-8 leading-8 px-3 text-white truncate"
                                  style={{
                                    backgroundColor: label.color,
                                  }}
                                >
                                  {label.name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLabel(label.id)}
                                  className="p-2 hover:bg-gray-200 rounded ml-1"
                                >
                                  <TrashIcon className="size-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setLabelMenu("add")}
                            className="mt-4 py-1.5 w-full flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 font-semibold"
                          >
                            Tạo nhãn mới
                          </button>
                        </div>
                      </MenuItems>
                    )}

                    {labelMenu === "add" && (
                      <MenuItems
                        anchor="bottom start"
                        className="bg-white shadow-overlay rounded-lg mt-2 text-gray-800 text-sm w-80 z-50"
                      >
                        <header className="py-1 px-3">
                          <div className="flex items-center justify-between h-10">
                            <button
                              type="button"
                              onClick={() => setLabelMenu("default")}
                              className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                            >
                              <ChevronLeftIcon className="size-5" />
                            </button>
                            <h2 className="text-center font-medium">
                              Tạo nhãn mới
                            </h2>
                            <button
                              type="button"
                              className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                            >
                              <XMarkIcon className="size-5" />
                            </button>
                          </div>
                        </header>
                        <div className="p-8 bg-gray-300">
                          <div
                            className="rounded px-3 h-8 leading-8 text-white font-medium text-sm truncate"
                            style={{
                              backgroundColor: labelValues.color,
                            }}
                          >
                            {labelValues.name}
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="mb-2">
                            <label
                              htmlFor="labelName"
                              className="block text-xs font-semibold leading-5 mb-1 text-gray-600"
                            >
                              Tiêu đề
                            </label>
                            <input
                              type="text"
                              id="labelName"
                              className="w-full px-2 py-1.5 rounded text-sm"
                              value={labelValues.name}
                              onChange={(e) =>
                                setLabelValues((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="mb-2">
                            <label
                              htmlFor="labelColor"
                              className="block text-xs font-semibold leading-5 mb-1 text-gray-600"
                            >
                              Chọn màu sắc
                            </label>
                            <input
                              type="color"
                              id="labelColor"
                              className="w-full h-9 border-none cursor-pointer"
                              defaultValue={labelValues.color}
                              onChange={(e) =>
                                setLabelValues((prev) => ({
                                  ...prev,
                                  color: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddLabel}
                            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                          >
                            Tạo mới
                          </button>
                        </div>
                      </MenuItems>
                    )}
                  </Menu>
                </li>
                <li>
                  <Menu as="div">
                    <MenuButton
                      type="button"
                      className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    >
                      <PhotoIcon className="size-4 mr-1.5" />
                      <span>Ảnh bìa</span>
                    </MenuButton>
                    <MenuItems
                      anchor="bottom start"
                      className="bg-white shadow-overlay mt-2 rounded-lg text-gray-800 text-sm w-80 z-50"
                    >
                      <header className="py-1 px-4">
                        <div className="flex items-center justify-between h-10">
                          <div></div>
                          <h2 className="text-center font-medium">Ảnh bìa</h2>
                          <MenuItem>
                            <button
                              type="button"
                              className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                            >
                              <XMarkIcon className="size-5" />
                            </button>
                          </MenuItem>
                        </div>
                      </header>
                      <div className="p-2">
                        <div className="mb-4">
                          <p className="text-xs font-semibold leading-5 mb-2 text-gray-600">
                            Màu sắc
                          </p>
                          <ul className="grid grid-cols-5 gap-1.5">
                            {colors.map((color, index) => (
                              <li key={index} className="w-full h-8">
                                <button
                                  type="button"
                                  className={clsx(
                                    "relative w-full h-full group",
                                  )}
                                  onClick={() => handleSetCoverColor(color)}
                                >
                                  <div
                                    className="w-full h-full rounded-md group-hover:brightness-75"
                                    style={{
                                      backgroundColor: color,
                                    }}
                                  ></div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs font-semibold leading-5 mb-2 text-gray-600">
                            Ảnh từ Unsplash
                          </p>
                          <ul className="grid grid-cols-4 gap-1.5">
                            {unplashImages
                              .slice(0, coverEnd)
                              .map((url, index) => {
                                const imageUrl = `${url.raw}&q=40&auto=compress&fm=webp&w=2560`;
                                return (
                                  <li key={index} className="w-full h-10">
                                    <button
                                      type="button"
                                      className={clsx(
                                        "relative w-full h-full group",
                                      )}
                                      onClick={() => handleSetCover(imageUrl)}
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt="Unplash ImageImage"
                                        fill
                                        className="object-cover rounded-md group-hover:brightness-75"
                                      />
                                    </button>
                                  </li>
                                );
                              })}
                            <li className="w-full h-10">
                              {coverEnd < 30 && (
                                <button
                                  type="button"
                                  className="bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center h-full w-full px-1.5 font-medium text-gray-800"
                                  onClick={() =>
                                    setCoverEnd((prev) => prev + 8)
                                  }
                                >
                                  <PlusIcon className="size-5" />
                                </button>
                              )}
                            </li>
                          </ul>
                        </div>
                        <label
                          htmlFor="coverTask"
                          className="w-full flex items-center justify-center py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-gray-700 font-medium mb-2"
                        >
                          <span>Tải lên ảnh bìa</span>
                          <input
                            type="file"
                            id="coverTask"
                            multiple={false}
                            onChange={handleUploadCover}
                            hidden
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            updateTask(task.id, {
                              cover: null,
                              coverColor: null,
                            });
                          }}
                          className="w-full flex items-center justify-center py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-gray-700 font-medium"
                        >
                          Xóa ảnh bìa
                        </button>
                      </div>
                    </MenuItems>
                  </Menu>
                </li>
              </ul>
              <hr className="text-gray-300 mb-2" />

              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center justify-start py-1.5 px-3 cursor-pointer border-none rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    onClick={async () => {
                      await deleteTask(task.id);
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
      </div>
    </div>,
    document.body,
  );
}
