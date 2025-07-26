"use client";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import TaskCard from "../Task/TaskCard";
import { FormEvent, useEffect, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Task } from "@/app/types/task";
import useMount from "@/app/hooks/useMount";
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import TextArea from "../TextArea";
import useClickOutside from "@/app/hooks/useClickOutside";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import fetchAuth from "@/app/libs/fetchAuth";
import { Board } from "@/app/types/board";
import Select from "react-select";
import { Column, ColumnResponse } from "@/app/types/column";
import useBoard from "@/app/hooks/use-board";

interface MoveColumn {
  boardId: string;
  position: number;
}

export default function ColumnContainer({
  columnId,
  columnTitle,
  tasks,
  addColumn,
  updateColumn,
  deleteColumn,
}: {
  columnId: UniqueIdentifier;
  columnTitle?: string;
  tasks: Task[];
  addColumn: (e: FormEvent<HTMLFormElement>) => void;
  updateColumn: (columnId: string, column: Partial<Column>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
}) {
  const isMounted = useMount();
  const { board, addTask, setBoard, setItems, setContainers } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [actionMenu, setActionMenu] = useState<"default" | "copy" | "move">(
    "default"
  );
  const [boards, setBoards] = useState<Board[]>([]);
  const [moveColumn, setMoveColumn] = useState<MoveColumn>({
    boardId: board.id,
    position: board.columns.findIndex((col) => col.id === columnId) + 1,
  });

  const { containerRef: editFormRef } = useClickOutside<HTMLDivElement>({
    enable: isEditing,
    cb: () => setIsEditing(false),
  });

  const { containerRef: taskFormRef } = useClickOutside<HTMLFormElement>({
    enable: isAdding,
    cb: () => setIsAdding(false),
  });

  const openAdding = () => {
    setIsAdding(true);
  };

  const handleMoveColumn = async () => {
    try {
      await fetchAuth(`/columns/move/${columnId}`, {
        method: "PUT",
        body: JSON.stringify({}),
      });

      setActionMenu("default");
      setMoveColumn({
        boardId: board.id,
        position: board.columns.findIndex((col) => col.id === columnId) + 1,
      });
    } catch (error) {
      console.log("Error moving column:", error);
    }
  };

  const handleCopyColumn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const newColumnTitle = target.columnTitle.value.trim();
    try {
      const { column } = await fetchAuth<ColumnResponse>(
        `/columns/copy/${columnId}`,
        {
          method: "PUT",
          body: JSON.stringify({ title: newColumnTitle }),
        }
      );
      setItems((prevItems) => {
        const newItems = { ...prevItems };
        newItems[column.id] = column.tasks;
        return newItems;
      });
      setContainers((prevContainers) => [...prevContainers, column.id]);
      setBoard((prevBoard) => {
        prevBoard.columns.push(column);
        return prevBoard;
      });
    } catch (error) {
      console.log("Error", error);
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
    id: columnId,
    data: {
      type: "Column",
    },
    disabled: isEditing,
  });

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

  useEffect(() => {
    fetchAuth<Board[]>("/boards/my-boards").then((data) => setBoards(data));
  }, []);

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
            <div
              className={clsx("w-full", isEditing ? "block" : "hidden")}
              ref={editFormRef}
            >
              <label htmlFor="columnTitle"></label>
              <TextArea
                name="columnTitle"
                id="editColumnTitle"
                defaultValue={columnTitle}
                className="block py-1.5 px-3 w-full resize-none overflow-hidden rounded-sm font-semibold text-sm leading-5 outline-none border-none ring-2 ring-blue-500"
                maxLength={512}
                style={{
                  minHeight: "32px",
                  height: "32px",
                }}
                onBlur={async (e) => {
                  e.preventDefault();
                  const newTitle = e.currentTarget.value.trim();
                  if (newTitle !== columnTitle) {
                    await updateColumn(columnId as string, {
                      title: newTitle,
                    });
                  }
                  setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
            {!isEditing && (
              <h2
                className="font-medium text-sm leading-5 py-1.5 pl-2 pr-3 w-full"
                onClick={() => setIsEditing(true)}
              >
                {columnTitle}
              </h2>
            )}

            <Menu as="div">
              <MenuButton
                type="button"
                className="hover:bg-gray-300 rounded-lg p-1.5"
                title="Thao tác"
              >
                <EllipsisHorizontalIcon className="size-5" />
              </MenuButton>
              {actionMenu === "copy" && (
                <MenuItems
                  anchor="bottom start"
                  className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-40"
                >
                  <header className="py-1 px-4">
                    <div className="flex items-center justify-between h-10">
                      <button
                        type="button"
                        onClick={() => setActionMenu("default")}
                      >
                        <ChevronLeftIcon className="size-5" />
                      </button>

                      <h2 className="text-center font-medium">
                        Sao chép danh sách
                      </h2>
                      <MenuItem>
                        <button
                          type="button"
                          className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                          onClick={() => {
                            setActionMenu("default");
                          }}
                        >
                          <XMarkIcon className="size-5" />
                        </button>
                      </MenuItem>
                    </div>
                  </header>
                  <form className="px-3 pb-3" onSubmit={handleCopyColumn}>
                    <label
                      htmlFor="columnTitle"
                      className="block text-xs mb-1 leading-4 font-bold"
                    >
                      Tên
                    </label>

                    <TextArea
                      name="addColumnTitle"
                      id="columnTitle"
                      className="w-full px-3 py-2 text-sm leading-5 mb-2 rounded-sm resize-y overflow-hidden outline-none"
                      defaultValue={columnTitle}
                      style={{
                        minHeight: "72px",
                      }}
                    ></TextArea>
                    <button
                      type="submit"
                      className="font-medium px-3 py-1.5 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                    >
                      Tạo danh sách
                    </button>
                  </form>
                </MenuItems>
              )}

              {actionMenu === "move" && (
                <MenuItems
                  anchor="bottom start"
                  className="bg-white shadow-overlay rounded-lg mt-2 text-gray-700 text-sm w-80 z-40"
                >
                  <header className="py-1 px-4">
                    <div className="flex items-center justify-between h-10">
                      <button
                        type="button"
                        onClick={() => setActionMenu("default")}
                      >
                        <ChevronLeftIcon className="size-5" />
                      </button>

                      <h2 className="text-center font-medium">
                        Di chuyển danh sách
                      </h2>
                      <MenuItem>
                        <button
                          type="button"
                          className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                          onClick={() => {
                            setActionMenu("default");
                          }}
                        >
                          <XMarkIcon className="size-5" />
                        </button>
                      </MenuItem>
                    </div>
                  </header>
                  {/* Add move column logic here */}
                  <div className="px-3 pb-3">
                    <div className="mb-2">
                      <label htmlFor="boardId" className="mb-1 block">
                        Bảng thông tin
                      </label>
                      <Select
                        menuPosition="fixed"
                        name="boardId"
                        id="boardId"
                        className="w-full text-sm leading-5 rounded-sm outline-none"
                        isSearchable={false}
                        options={boards.map((board) => ({
                          value: board.id,
                          label: board.title,
                        }))}
                        defaultValue={{
                          value: moveColumn.boardId,
                          label:
                            boards.find((b) => b.id === moveColumn.boardId)
                              ?.title || "Chọn bảng",
                        }}
                        onChange={(option) => {
                          if (!option) return;
                          setMoveColumn((prev) => ({
                            ...prev,
                            boardId: option.value,
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="columnId" className="mb-1 block">
                        Vị trí
                      </label>
                      <Select
                        menuPosition="fixed"
                        name="columnId"
                        id="columnId"
                        className="w-full text-sm leading-5 rounded-sm outline-none"
                        isSearchable={false}
                        options={
                          boards
                            .find((b) => b.id === moveColumn.boardId)
                            ?.columns.map((col, i) => ({
                              value: col.id,
                              label: i + 1,
                            })) || []
                        }
                        defaultValue={{
                          value: columnId as string,
                          label: moveColumn.position,
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleMoveColumn}
                      className="font-medium px-6 py-1.5 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700 mt-2"
                    >
                      Di chuyển
                    </button>
                  </div>
                </MenuItems>
              )}

              {actionMenu === "default" && (
                <MenuItems
                  anchor="bottom start"
                  className="bg-white shadow-overlay rounded-lg mt-2 pb-2 text-gray-700 text-sm w-80 z-40"
                >
                  <header className="py-1 px-4">
                    <div className="flex items-center justify-between h-10">
                      <div></div>
                      <h2 className="text-center font-medium">Thao tác</h2>
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
                  <MenuItem>
                    <ul>
                      <li
                        onClick={openAdding}
                        className="hover:bg-gray-100 px-4 py-1.5 cursor-pointer"
                      >
                        Thêm thẻ
                      </li>

                      <li
                        className="hover:bg-gray-100 px-4 py-1.5 cursor-pointer"
                        onClick={async () =>
                          await deleteColumn(columnId as string)
                        }
                      >
                        Xóa danh sách
                      </li>
                    </ul>
                  </MenuItem>
                </MenuItems>
              )}
            </Menu>
          </div>
        </div>
        <ul className="p-2 space-y-2 overflow-y-auto">
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
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
                  autoFocus
                />
                <input
                  type="text"
                  name="columnId"
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
              onClick={openAdding}
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
