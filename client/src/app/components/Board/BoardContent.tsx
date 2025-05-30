"use client";

import useColor from "@/app/hooks/useColor";
import useMount from "@/app/hooks/useMount";
import { Board } from "@/app/types/board";
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  getFirstCollision,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import {
  BarsArrowDownIcon,
  EllipsisHorizontalIcon,
  InboxStackIcon,
} from "@heroicons/react/24/solid";
import { FormEvent, useCallback, useRef, useState } from "react";
import TextArea from "../TextArea";
import TaskCard from "../Task/TaskCard";
import ColumnContainer from "../Column/ColumnContainer";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import { Task, TaskReponse, TasksReponse } from "@/app/types/task";
import InboxContainer from "./InboxContainer";
import useScrollByDragging from "@/app/hooks/useScrollByDragging";
import { TaskDto } from "@/app/schemas/task.schema";
import fetchAuth from "@/app/libs/fetchAuth";
import toast from "react-hot-toast";
import { formatError } from "@/app/utils/formatError";
import useClickOutside from "@/app/hooks/useClickOutside";
import useBodyOverflow from "@/app/hooks/useBodyOverflow";
import { ColumnDto } from "@/app/schemas/column.schema";
import { Column, ColumnResponse } from "@/app/types/column";
import { contrasts } from "@/app/utils/getContrastColor";

type Items = Record<string, Task[]>;

const convertToItems = (columns: Column[]) => {
  return columns.reduce<Items>((acc, column) => {
    acc[column.title] = column.tasks;
    return acc;
  }, {});
};

export default function BoardContent({
  board,
  taskInboxRes,
}: {
  board: Board;
  taskInboxRes: TasksReponse;
}) {
  // State to manage the items in the board
  const [items, setItems] = useState<Items>({
    Inbox: taskInboxRes.tasks,
    ...convertToItems(board.columns),
  });
  const [containers, setContainers] = useState<UniqueIdentifier[]>([
    "Inbox",
    ...board.columns.map((column) => column.title),
  ]);
  // State to manage the active column and task during drag and drop
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  // State to manage add mode
  const [addMode, setAddMode] = useState({
    inbox: false,
    column: false,
  });
  const [isEditHeader, setIsEditHeader] = useState(false);
  // State to manage the submission state
  const [isSubmiting, setIsSubmiting] = useState(false);
  // Custom hook to handle click outside of the form
  const { containerRef: inboxFormRef } = useClickOutside<HTMLFormElement>({
    enable: addMode.inbox,
    cb: () => setAddMode((prev) => ({ ...prev, inbox: false })),
  });
  const { containerRef: columnFormRef } = useClickOutside<HTMLFormElement>({
    enable: addMode.column,
    cb: () => setAddMode((prev) => ({ ...prev, column: false })),
  });
  const { containerRef: editFormRef } = useClickOutside<HTMLFormElement>({
    enable: isEditHeader,
    cb: () => setIsEditHeader(false),
  });
  // Check if the component is mounted to avoid document is not defined error
  const isMounted = useMount();
  // Get dynamic color based on the board background
  const contrast = useColor(board);
  // Handle scroll by dragging
  const { containerRef, handleMouseDown, handleTouchStart } =
    useScrollByDragging<HTMLUListElement>();
  useBodyOverflow();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );
  // Ref to store the last over id during drag and drop
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  // Ref to check if the item was recently moved to a new container
  const recentlyMovedToNewContainer = useRef(false);

  // Drag and drop collision detection strategy
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items && container.id !== "Inbox"
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.some((task) => task.id === container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  // Not finished
  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const inboxTitle = target.inboxTitle?.value;
    const taskTitle = target.taskTitle?.value;

    try {
      setIsSubmiting(true);
      const data: TaskDto = {
        title: inboxTitle || taskTitle,
        isCompleted: false,
        isWatching: false,
      };

      if (taskTitle) {
        const columnId = board.columns.find(
          (column) => column.title === target.columnTitle?.value
        )?.id;
        data.boardId = board.id;
        data.columnId = columnId;
      }

      const { task } = await fetchAuth<TaskReponse>("/tasks/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setItems((prevItems) => {
        const newItems = { ...prevItems };
        const columnTitle = board.columns.find(
          (column) => column.id === task.column?.id
        )?.title;

        if (columnTitle) {
          newItems[columnTitle] = [...newItems[columnTitle], task];
        } else {
          newItems.Inbox = [task, ...newItems.Inbox];
        }

        return newItems;
      });

      target.reset();
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleAddColumn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;

    try {
      setIsSubmiting(true);
      const data: ColumnDto = {
        title: target.columnTitle.value.trim(),
        boardId: board.id,
      };

      const { column } = await fetchAuth<ColumnResponse>("/columns/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      board.columns.push(column);

      unstable_batchedUpdates(() => {
        setItems((prevItems) => {
          const newItems = { ...prevItems };
          newItems[column.title] = [];
          return newItems;
        });
        setContainers((prevContainers) => [...prevContainers, column.title]);
      });

      target.reset();
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setIsSubmiting(false);
    }
  };

  const switchPositionColumn = async ({
    columnId,
    beforeColumnId,
    afterColumnId,
  }: {
    columnId?: string;
    beforeColumnId?: string;
    afterColumnId?: string;
  }) => {
    try {
      await fetchAuth<{ message: string }>(
        `/columns/switch-position/${columnId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            beforeColumnId,
            afterColumnId,
            boardId: board.id,
          }),
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const switchPositionTask = async ({
    taskId,
    beforeTaskId,
    afterTaskId,
    columnId,
  }: {
    taskId: string;
    beforeTaskId?: string;
    afterTaskId?: string;
    columnId?: string;
  }) => {
    try {
      await fetchAuth<{ message: string }>(`/tasks/switch-position/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          beforeTaskId,
          afterTaskId,
          columnId,
          boardId: columnId ? board.id : null,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setItems((prevItems) => {
      const newItems = { ...prevItems };

      Object.keys(newItems).forEach((key) => {
        newItems[key] = newItems[key].map((t) =>
          t.id === id ? { ...t, ...task } : t
        );
      });

      return newItems;
    });
  };

  const deleteTask = async (taskId: string) => {
    await fetchAuth<{ message: string }>(`/tasks/remove/${taskId}`, {
      method: "DELETE",
    });

    setItems((prevItems) => {
      const newItems = { ...prevItems };

      Object.keys(newItems).forEach((key) => {
        newItems[key] = newItems[key].filter((task) => task.id !== taskId);
      });

      return newItems;
    });
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].map((task) => task.id).includes(id as string)
    );
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId || activeId in items) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.findIndex((task) => task.id === overId);
        const activeIndex = activeItems.findIndex(
          (task) => task.id === activeId
        );

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        recentlyMovedToNewContainer.current = true;

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (task) => task.id !== activeId
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length
            ),
          ],
        };
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId) return;

    if (activeId in items && activeId !== overId) {
      const activeIndex = containers.indexOf(activeId);
      const overIndex = containers.indexOf(overId);

      const newContainers = arrayMove(containers, activeIndex, overIndex);

      setContainers(newContainers);

      const beforeCategoryName = newContainers[overIndex - 1];
      const afterCategoryName = newContainers[overIndex + 1];

      const columnId = board.columns.find(
        (column) => column.title === activeId
      )?.id;
      const beforeColumnId = board.columns.find(
        (column) => column.title === beforeCategoryName
      )?.id;
      const afterColumnId = board.columns.find(
        (column) => column.title === afterCategoryName
      )?.id;

      await switchPositionColumn({
        columnId,
        beforeColumnId,
        afterColumnId,
      });
      return;
    }

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      return;
    }

    const activeIndex = items[activeContainer].findIndex(
      (task) => task.id === activeId
    );
    const overIndex = items[overContainer].findIndex(
      (task) => task.id === overId
    );
    const isMovedToNewContainer = recentlyMovedToNewContainer.current;

    if (activeId !== overId || isMovedToNewContainer) {
      const newItems = {
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      };
      setItems(newItems);

      if (isMovedToNewContainer) {
        recentlyMovedToNewContainer.current = false;
      }

      const taskId = newItems[overContainer][overIndex]?.id;
      const beforeTaskId = newItems[overContainer][overIndex - 1]?.id;
      const afterTaskId = newItems[overContainer][overIndex + 1]?.id;
      const columnId = board.columns.find(
        (column) => column.title === overContainer
      )?.id;

      await switchPositionTask({
        taskId,
        beforeTaskId,
        afterTaskId,
        columnId,
      });
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
  };

  const containersWithoutInbox = containers.filter(
    (container) => container !== "Inbox"
  );

  return (
    <div className="flex p-4 relative">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="hidden xl:block lg:flex-[0_0_15%] lg:pr-2 group">
          <div className="bg-[rgb(220,234,254)] rounded-lg flex flex-col h-[calc(100vh-105.25px)] border border-gray-300">
            <div className="bg-[#ffffff3d] py-3.5 pr-2 pl-4 text-gray-800 font-bold leading-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <InboxStackIcon className="size-4" />
                <span>Inbox</span>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-linear">
                <button type="button">
                  <BarsArrowDownIcon className="size-5" />
                </button>
                <button type="button">
                  <EllipsisHorizontalIcon className="size-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 mb-2 px-2">
              {addMode.inbox ? (
                <form
                  ref={inboxFormRef}
                  onSubmit={handleAddTask}
                  className="shadow-raised rounded-lg"
                >
                  <TextArea
                    name="inboxTitle"
                    id="inboxTitle"
                    className="block w-full text-gray-700 rounded-t-lg text-sm overflow-hidden outline-none py-2 px-3 shadow-none resize-y border-none focus:ring-inset"
                    style={{
                      height: "36px",
                      minHeight: "36px",
                      maxHeight: "160px",
                    }}
                    placeholder="Nhập tên thẻ"
                  />
                  <div className="px-3 py-1.5 bg-gray-100 space-x-1 flex items-center rounded-b-lg">
                    <button
                      type="submit"
                      disabled={isSubmiting}
                      className="font-medium px-2 py-0.5 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                    >
                      Thêm thẻ
                    </button>
                    <button
                      type="button"
                      className="font-medium text-gray-700 text-sm hover:bg-gray-300 rounded-sm px-2 py-0.5"
                      onClick={() =>
                        setAddMode((prev) => ({ ...prev, inbox: false }))
                      }
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setAddMode((prev) => ({ ...prev, inbox: true }))
                  }
                  className="w-full bg-white px-3 py-2 rounded-lg min-h-6 text-gray-500 text-left text-sm shadow-raised hover:bg-gray-300 hover:text-gray-700"
                >
                  Thêm thẻ
                </button>
              )}
            </div>

            <InboxContainer
              tasks={items.Inbox}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          </div>
        </div>

        <div className="lg:flex-[1_1_85%] lg:pl-2 overflow-hidden">
          <div
            className="rounded-lg h-[calc(100vh-105.25px)] bg-cover bg-center bg-no-repeat flex flex-col space-y-3 border border-gray-300"
            style={{
              backgroundColor: board?.coverColor || "",
              backgroundImage: `url(${board.cover})`,
            }}
          >
            <div
              className="backdrop-blur-[6px] rounded-t-lg"
              style={contrasts[contrast]}
            >
              <div className="flex justify-between relative flex-wrap items-center p-3 gap-1">
                <form ref={editFormRef}>
                  <div
                    className="cursor-pointer h-8"
                    onClick={() => setIsEditHeader(true)}
                  >
                    {!isEditHeader && (
                      <h1 className="px-2.5 leading-8 font-semibold">
                        {board.title}
                      </h1>
                    )}
                    {isEditHeader && (
                      <>
                        <label htmlFor="boardTitle"></label>
                        <input
                          type="text"
                          name="boardTitle"
                          id="boardTitle"
                          defaultValue={board.title}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </form>
                <div className="flex items-center"></div>
              </div>
            </div>
            <div className="flex-grow-1 overflow-y-hidden">
              <ul
                className="px-1.5 h-[calc(100%-8px)] flex flex-row select-none overflow-x-auto overflow-y-hidden"
                id="board"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <SortableContext
                  items={containersWithoutInbox}
                  strategy={horizontalListSortingStrategy}
                >
                  {containersWithoutInbox.map((container) => (
                    <ColumnContainer
                      key={container}
                      tasks={items[container]}
                      columnId={container}
                      addTask={handleAddTask}
                      updateTask={updateTask}
                      deleteTask={deleteTask}
                    />
                  ))}
                </SortableContext>

                <li className="flex-grow-1 px-1.5">
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.preventDefault()}
                  >
                    {addMode.column ? (
                      <form
                        ref={columnFormRef}
                        onSubmit={handleAddColumn}
                        className="rounded-lg shadow-raised w-72"
                      >
                        <TextArea
                          name="columnTitle"
                          id="columnTitle"
                          className="block w-full text-gray-700 rounded-t-lg text-sm overflow-hidden outline-none py-2 px-3 shadow-none resize-y border-none focus:ring-inset"
                          style={{
                            height: "36px",
                            minHeight: "36px",
                            maxHeight: "160px",
                          }}
                          placeholder="Nhập tên danh sách"
                        />

                        <div className="px-3 py-1.5 space-x-1 flex items-center rounded-b-lg bg-gray-100">
                          <button
                            type="submit"
                            disabled={isSubmiting}
                            className="font-medium px-2 py-0.5 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                          >
                            Thêm danh sách
                          </button>
                          <button
                            type="button"
                            className="font-medium text-gray-700 text-sm hover:bg-gray-300 rounded-sm px-2 py-0.5"
                            onClick={() =>
                              setAddMode((prev) => ({ ...prev, column: false }))
                            }
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setAddMode((prev) => ({ ...prev, column: true }))
                        }
                        className="bg-gray-200 w-72 text-gray-700 font-medium text-sm rounded-lg p-2"
                      >
                        Thêm danh sách khác
                      </button>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {isMounted &&
          createPortal(
            <DragOverlay>
              {activeId && (
                <>
                  {containers.includes(activeId) ? (
                    <ColumnContainer
                      tasks={items[activeId]}
                      columnId={activeId}
                      addTask={handleAddTask}
                      updateTask={updateTask}
                      deleteTask={deleteTask}
                    />
                  ) : (
                    <TaskCard
                      task={
                        items[findContainer(activeId) as string].find(
                          (task) => task.id === activeId
                        ) as Task
                      }
                      updateTask={updateTask}
                      deleteTask={deleteTask}
                      isOverlay={true}
                    />
                  )}
                </>
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
