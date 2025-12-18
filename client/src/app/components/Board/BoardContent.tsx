"use client";

import useColor from "@/app/hooks/useColor";
import useMount from "@/app/hooks/useMount";
import { Board, BoardReponse } from "@/app/types/board";
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
  CheckIcon,
  ChevronDoubleUpIcon,
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  GlobeAsiaAustraliaIcon,
  InboxStackIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  ChangeEvent,
  createContext,
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import TextArea from "../TextArea";
import TaskCard from "../Task/TaskCard";
import ColumnContainer from "../Column/ColumnContainer";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import { Task, TaskReponse } from "@/app/types/task";
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
import {
  LockClosedIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ShareBoardModal from "./ShareBoardModal";
import Image from "next/image";
import { User } from "@/app/types/user";
import {
  switchPositionColumn,
  switchPositionTask,
} from "@/app/services/board.service";
import Select, { MultiValue } from "react-select";
import { TrashIcon } from "../tiptap-icons/trash-icon";
import { useRouter } from "@bprogress/next/app";
import { toLowerCaseNonAccentVietnamese } from "@/app/utils/nonVietnameseAccent";
import useDisableKeyboardModal from "@/app/hooks/useDisableKeyboardModal";
import colors from "@/app/datas/colors.json";
import unsplash, { UnplashImageURL } from "@/app/libs/unplash";
import { OrderBy } from "unsplash-js";

type Items = Record<string, Task[]>;

const convertToItems = (columns: Column[]) => {
  return columns.reduce<Items>((acc, column) => {
    acc[column.id] = column.tasks;
    return acc;
  }, {});
};

const initialFilter = {
  keyword: "",
  status: "",
  noDueDate: false,
  overdue: false,
};

interface BoardContextProps {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  items: Items;
  setItems: Dispatch<SetStateAction<Items>>;
  containers: UniqueIdentifier[];
  setContainers: Dispatch<SetStateAction<UniqueIdentifier[]>>;
  addTask: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  updateTask: (id: string, body: Partial<Task> | FormData) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

interface Filter {
  keyword: string;
  status: string;
  noDueDate: boolean;
  overdue: boolean;
}

export const BoardContext = createContext<BoardContextProps>({
  board: {} as Board,
  setBoard: () => {},
  items: {},
  setItems: () => {},
  containers: [],
  setContainers: () => {},
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
});

export default function BoardContent({
  initialBoard,
  tasksInbox,
  user,
}: {
  initialBoard: Board;
  tasksInbox: Task[];
  user: User;
}) {
  const [board, setBoard] = useState<Board>(initialBoard);
  // State to manage the items in the board
  const [items, setItems] = useState<Items>({
    Inbox: tasksInbox,
    ...convertToItems(board.columns),
  });
  const [containers, setContainers] = useState<UniqueIdentifier[]>([
    "Inbox",
    ...board.columns.map((column) => column.id),
  ]);
  // State to manage the active column and task during drag and drop
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  // State to manage add mode
  const [addMode, setAddMode] = useState({
    inbox: false,
    column: false,
  });
  // State to manage the share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditHeader, setIsEditHeader] = useState(false);
  // State to manage the submission state
  const [isSubmiting, setIsSubmiting] = useState(false);

  // State to manage filtering
  const [isFiltering, setIsFiltering] = useState(false);
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const [actionMenu, setActionMenu] = useState<"default" | "changeCover">(
    "default",
  );
  const [coverEnd, setCoverEnd] = useState(7);
  const [unplashImages, setUnplashImages] = useState<UnplashImageURL[]>([]);

  // Custom hook to handle click outside of the form
  const { containerRef: inboxFormRef } = useClickOutside<HTMLFormElement>({
    enable: addMode.inbox,
    cb: () => setAddMode((prev) => ({ ...prev, inbox: false })),
  });
  const { containerRef: columnFormRef } = useClickOutside<HTMLFormElement>({
    enable: addMode.column,
    cb: () => setAddMode((prev) => ({ ...prev, column: false })),
  });
  const { containerRef: editFormRef } = useClickOutside<HTMLDivElement>({
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
  useDisableKeyboardModal({
    execepts: ["Enter"],
  });
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
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
            (container) => container.id in items && container.id !== "Inbox",
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
                  containerItems.some((task) => task.id === container.id),
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
    [activeId, items],
  );

  // Not finished
  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const inboxTitle = target.inboxTitle?.value;
    const taskTitle = target.taskTitle?.value;
    const columnId = target.columnId?.value;

    try {
      setIsSubmiting(true);
      const data: TaskDto = {
        title: inboxTitle || taskTitle,
        isCompleted: false,
        isWatching: false,
      };

      if (taskTitle) {
        data.boardId = board.id;
        data.columnId = columnId;
      }

      const { task } = await fetchAuth<TaskReponse>("/tasks/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      setItems((prevItems) => {
        const newItems = { ...prevItems };

        if (columnId) {
          newItems[columnId] = [...newItems[columnId], task];
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

      unstable_batchedUpdates(() => {
        setItems((prevItems) => {
          const newItems = { ...prevItems };
          newItems[column.id] = [];
          return newItems;
        });
        setContainers((prevContainers) => [...prevContainers, column.id]);
        setBoard((prevBoard) => {
          prevBoard.columns.push(column);
          return prevBoard;
        });
      });

      target.reset();
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleUpdateTask = async (
    id: string,
    body: Partial<Task> | FormData,
  ) => {
    const { task: updatedTask } = await fetchAuth<TaskReponse>(
      `/tasks/update/${id}`,
      {
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
      },
    );

    setItems((prevItems) => {
      const newItems = { ...prevItems };
      for (const key in newItems) {
        newItems[key] = newItems[key].map((t) =>
          t.id === id ? { ...t, ...updatedTask } : t,
        );
      }
      return newItems;
    });
  };

  const handleDeleteTask = async (taskId: string) => {
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

  const handleDeleteColumn = async (columnId: string) => {
    await fetchAuth<{ message: string }>(`/columns/remove/${columnId}`, {
      method: "DELETE",
    });

    unstable_batchedUpdates(() => {
      setContainers((prevColumns) =>
        prevColumns.filter((column) => column !== columnId),
      );
      setItems((prevItems) => {
        const newItems = { ...prevItems };

        for (const key in newItems) {
          if (key === columnId) {
            delete newItems[key];
          }
        }

        return newItems;
      });
      setBoard((prevBoard) => {
        prevBoard.columns.filter((column) => column.id !== columnId);
        return prevBoard;
      });
    });
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].map((task) => task.id).includes(id as string),
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
          (task) => task.id === activeId,
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
            (task) => task.id !== activeId,
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length,
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

    // If the active item is a column, we handle the column position switch
    if (activeId in items && activeId !== overId) {
      const activeIndex = containers.indexOf(activeId);
      const overIndex = containers.indexOf(overId);
      const newContainers = arrayMove(containers, activeIndex, overIndex);
      setContainers(newContainers);
      const beforeCategoryName = newContainers[overIndex - 1];
      const afterCategoryName = newContainers[overIndex + 1];
      const columnId = activeId as string;
      const beforeColumnId = board.columns.find(
        (column) => column.id === beforeCategoryName,
      )?.id;
      const afterColumnId = board.columns.find(
        (column) => column.id === afterCategoryName,
      )?.id;
      await switchPositionColumn({
        boardId: board.id,
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
      (task) => task.id === activeId,
    );
    const overIndex = items[overContainer].findIndex(
      (task) => task.id === overId,
    );
    const isMovedToNewContainer = recentlyMovedToNewContainer.current;
    if (activeId !== overId || isMovedToNewContainer) {
      const newItems = {
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex,
        ),
      };
      setItems(newItems);
      if (isMovedToNewContainer) {
        recentlyMovedToNewContainer.current = false;
      }
      const taskId = newItems[overContainer][overIndex]?.id;
      const beforeTaskId = newItems[overContainer][overIndex - 1]?.id;
      const afterTaskId = newItems[overContainer][overIndex + 1]?.id;
      const columnId = overContainer as string;

      await switchPositionTask({
        boardId: board.id,
        taskId,
        beforeTaskId,
        afterTaskId,
        columnId,
      });
    }
  };

  const handleUpdateBoard = async (body: Partial<Board>) => {
    try {
      const { board: newBoard } = await fetchAuth<BoardReponse>(
        `/boards/update/${board.id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );

      setBoard((prev) => ({ ...prev, ...newBoard }));
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const handleUpdateColumn = async (
    columnId: string,
    data: Partial<Column>,
  ) => {
    try {
      const { column } = await fetchAuth<ColumnResponse>(
        `/columns/update/${columnId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );

      setBoard((prev) => {
        const updatedColumns = prev.columns.map((col) =>
          col.id === columnId ? column : col,
        );
        return { ...prev, columns: updatedColumns };
      });
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const handleSearchKeyword = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const initialItems = convertToItems(board.columns);

    if (!value) {
      setFilter((prev) => ({ ...prev, keyword: "" }));
      setItems((prev) => ({ ...prev, ...initialItems }));
      setIsFiltering(false);
      return;
    }

    for (const key in initialItems) {
      const filteredTasks = initialItems[key].filter((task) =>
        toLowerCaseNonAccentVietnamese(task.title).includes(
          toLowerCaseNonAccentVietnamese(value),
        ),
      );
      initialItems[key] = filteredTasks;
    }

    setFilter((prev) => ({ ...prev, keyword: value }));
    setItems((prev) => ({ ...prev, ...initialItems }));
    setIsFiltering(true);
  };

  const handleFilterStatus = (e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    const checked = e.target.checked;

    const initialItems = convertToItems(board.columns);

    if (!checked) {
      setItems((prevItems) => ({
        ...prevItems,
        ...initialItems,
      }));
      setFilter((prev) => ({ ...prev, status: "" }));
      setIsFiltering(false);
      return;
    }

    for (const key in initialItems) {
      const filteredTasks = initialItems[key].filter((task) =>
        id === "completed" ? task.completedAt : !task.completedAt,
      );
      initialItems[key] = filteredTasks;
    }

    setItems((prev) => ({ ...prev, ...initialItems }));
    setFilter((prev) => ({ ...prev, status: id }));
    setIsFiltering(true);
  };

  const handleFilterDate = (e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    const checked = e.target.checked;

    const initialItems = convertToItems(board.columns);

    if (!checked) {
      setItems((prevItems) => ({
        ...prevItems,
        ...initialItems,
      }));
      setFilter((prev) => ({ ...prev, noDueDate: false, overdue: false }));
      setIsFiltering(false);
      return;
    }

    for (const key in initialItems) {
      const filteredTasks = initialItems[key].filter((task) => {
        if (id === "noDueDate") {
          return !task.dueDate;
        }
        if (id === "overdue") {
          const today = new Date();
          const taskDueDate = new Date(task.dueDate || "");
          return today > taskDueDate;
        }
        return true;
      });
      initialItems[key] = filteredTasks;
    }

    setFilter((prev) => ({
      ...prev,
      noDueDate: id === "noDueDate" ? checked : prev.noDueDate,
      overdue: id === "overdue" ? checked : prev.overdue,
    }));
    setItems((prev) => ({ ...prev, ...initialItems }));
    setIsFiltering(true);
  };

  const handleFilterMembers = (
    options: MultiValue<{
      value: string;
      label: string;
      email: string;
      avatar: string;
    }>,
  ) => {
    const initialItems = convertToItems(board.columns);

    if (options.length < 1) {
      setIsFiltering(false);
      setItems((prev) => ({ ...prev, ...initialItems }));
      return;
    }

    const usersId = options.map((o) => o.value);

    for (const key in initialItems) {
      const filteredTasks = initialItems[key].filter((task) =>
        task.members.some((u) => usersId.includes(u.id)),
      );
      initialItems[key] = filteredTasks;
    }

    setIsFiltering(true);
    setItems((prev) => ({ ...prev, ...initialItems }));
  };

  const handleFilterNoMember = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    const initialItems = convertToItems(board.columns);

    if (!checked) {
      setItems((prev) => ({ ...prev, ...initialItems }));
      setIsFiltering(false);
      return;
    }

    for (const key in initialItems) {
      const filteredItems = initialItems[key].filter((task) =>
        task.members.every((m) => !m),
      );
      initialItems[key] = filteredItems;
    }

    setIsFiltering(true);
    setItems((prev) => ({ ...prev, ...initialItems }));
  };

  const handleFilterMe = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    const initialItems = convertToItems(board.columns);

    if (!checked) {
      setItems((prev) => ({ ...prev, ...initialItems }));
      setIsFiltering(false);
      return;
    }

    for (const key in initialItems) {
      const filteredItems = initialItems[key].filter((task) =>
        task.members.some((m) => m.id === user.id),
      );
      initialItems[key] = filteredItems;
    }

    setIsFiltering(true);
    setItems((prev) => ({ ...prev, ...initialItems }));
  };

  const onDragCancel = () => {
    setActiveId(null);
  };

  const handleDeleteBoard = async () => {
    try {
      await fetchAuth<{ message: string }>(`/boards/remove/${board.id}`, {
        method: "DELETE",
      });
      router.push("/cong-viec");
    } catch (error) {
      console.log("Error deleting board:", error);
    }
  };

  const handleChangeCover = async (url: string) => {
    await handleUpdateBoard({ cover: url, coverColor: "" });
    setActionMenu("default");
  };

  const handleChangeCoverColor = async (color: string) => {
    await handleUpdateBoard({ coverColor: color, cover: "" });
    setActionMenu("default");
  };

  useEffect(() => {
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
      })
      .catch((error) => {
        console.error("Error fetching Unsplash images:", error);
      });
  }, []);

  const containersWithoutInbox = containers.filter(
    (container) => container !== "Inbox",
  );

  return (
    <BoardContext.Provider
      value={{
        board,
        setBoard,
        items,
        setItems,
        containers,
        setContainers,
        addTask: handleAddTask,
        updateTask: handleUpdateTask,
        deleteTask: handleDeleteTask,
      }}
    >
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
          {/* Inbox */}
          <div className="hidden xl:block lg:flex-[0_0_15%] lg:pr-2 group">
            <div className="bg-[rgb(220,234,254)] rounded-lg flex flex-col h-[calc(100vh-105.25px)] border border-gray-300">
              <div className="bg-[#ffffff3d] py-3.5 pr-2 pl-4 text-gray-800 font-bold leading-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <InboxStackIcon className="size-4" />
                  <span>Inbox</span>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-linear">
                  <button type="button">
                    <BarsArrowDownIcon className="size-5" />{" "}
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

              <InboxContainer tasks={items.Inbox} />
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
                  <div ref={editFormRef}>
                    <div
                      className="cursor-pointer h-8"
                      onClick={() => setIsEditHeader(true)}
                    >
                      {!isEditHeader && (
                        <h1 className="px-2.5 leading-8 font-semibold hover:bg-gray-200 rounded-sm">
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
                            onBlur={(e) => {
                              const title = (e.target as HTMLInputElement)
                                .value;
                              if (!title.trim()) {
                                setIsEditHeader(false);
                                return;
                              }
                              setIsEditHeader(false);
                              handleUpdateBoard({ title });
                            }}
                            onKeyDown={(e) => {
                              console.log("Key pressed:", e.key); // Debug log
                              if (e.key === "Enter") {
                                e.currentTarget.blur(); // Triggers the onBlur event
                              }
                            }}
                            className="h-8 w-52 px-2.5 text-lg font-bold bg-white text-gray-800 rounded-sm border-none ring-2 ring-blue-500"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <ul className="flex items-center">
                      {[...board.members]
                        .sort((a, b) =>
                          a.role === "admin" ? -1 : b.role === "admin" ? 1 : 0,
                        )
                        .map((member, i, arrays) => (
                          <li
                            key={member.id}
                            title={member.user.name}
                            className="relative -mr-0.5"
                            style={{
                              zIndex: arrays.length - i,
                            }}
                          >
                            <Image
                              src={member.user.avatar}
                              alt={member.user.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                            {member.role === "admin" && (
                              <ChevronDoubleUpIcon className="size-3 absolute bottom-0 right-0" />
                            )}
                          </li>
                        ))}
                    </ul>
                    <Menu as="div">
                      <MenuButton
                        type="button"
                        className="rounded-sm p-2 focus:outline-none"
                        title="Khả năng xem"
                      >
                        {board.visibility === "public" ? (
                          <GlobeAsiaAustraliaIcon className="size-4" />
                        ) : (
                          <LockClosedIcon className="size-4" />
                        )}
                      </MenuButton>
                      <MenuItems
                        anchor="bottom"
                        className="bg-white pb-4 rounded-sm text-sm w-96 text-gray-800 outline-none"
                      >
                        <header className="py-1">
                          <div className="flex items-center justify-between h-10">
                            <div></div>
                            <h2 className="text-center font-medium">
                              Khả năng xem
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
                        <MenuItem>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBoard({ visibility: "private" })
                            }
                            className="w-full hover:bg-gray-200 text-left px-4 py-2"
                          >
                            <div className="flex items-center mb-1">
                              <LockClosedIcon className="size-4 text-red-600" />
                              <span className="ml-1">Riêng tư</span>
                              {board.visibility === "private" && (
                                <CheckIcon className="size-3.5 ml-1" />
                              )}
                            </div>
                            <span className="text-xs text-gray-600">
                              Chỉ thành viên bảng thông tin mới có quyền xem
                              bảng thông tin này. Quản trị viên của Không gian
                              làm việc có thể đóng bảng thông tin hoặc xóa thành
                              viên.
                            </span>
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBoard({ visibility: "public" })
                            }
                            className="w-full hover:bg-gray-200 text-left px-4 py-2"
                          >
                            <div className="flex items-center mb-1">
                              <GlobeAsiaAustraliaIcon className="size-4 text-green-600" />
                              <span className="ml-1">Công khai</span>
                              {board.visibility === "public" && (
                                <CheckIcon className="size-3.5 ml-1" />
                              )}
                            </div>
                            <span className="text-xs text-gray-600">
                              Bất kỳ ai trên mạng internet đều có thể xem bảng
                              thông tin này. Chỉ thành viên bảng thông tin mới
                              có quyền sửa.
                            </span>
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                    <Menu as="div">
                      {!isFiltering && (
                        <MenuButton
                          type="button"
                          className="rounded-sm p-1.5 focus:outline-none flex items-center space-x-2"
                        >
                          <BarsArrowDownIcon className="size-5" />
                        </MenuButton>
                      )}

                      {isFiltering && (
                        <div className="flex items-center">
                          <MenuButton
                            type="button"
                            className="rounded-l-sm p-1.5 focus:outline-none flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-900/80"
                          >
                            <BarsArrowDownIcon className="size-5" />
                            <div className="flex items-center justify-center bg-black px-1 rounded-3xl text-sm">
                              <span className="h-3 w-3 rounded-full bg-blue-600 mr-1"></span>
                              <span>
                                {Object.values(items).slice(1).flat().length}
                              </span>
                            </div>
                          </MenuButton>
                          <button
                            onClick={() => {
                              setIsFiltering(false);
                              setFilter(initialFilter);
                              setItems((prevItems) => ({
                                ...prevItems,
                                ...convertToItems(board.columns),
                              }));
                            }}
                            className="rounded-e-sm p-1.5 focus:outline-none flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-900/80"
                          >
                            <span className="text-sm">Xóa tất cả</span>
                          </button>
                        </div>
                      )}
                      <MenuItems
                        anchor="bottom"
                        className="bg-white p-3 pt-0 rounded-sm text-sm w-96 text-gray-800 outline-none"
                      >
                        <header className="py-1">
                          <div className="flex items-center justify-between h-10">
                            <div></div>
                            <h2 className="text-center font-medium">Lọc</h2>
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
                        <div>
                          <div className="mb-3">
                            <label
                              htmlFor="search"
                              className="text-gray-700 text-xs font-medium"
                            >
                              Từ khóa
                            </label>
                            <input
                              type="text"
                              className="w-full py-1.5 px-3 rounded text-sm mt-1.5"
                              placeholder="Nhập từ khóa"
                              name="search"
                              id="search"
                              value={filter.keyword}
                              onChange={handleSearchKeyword}
                            />
                          </div>
                          <div className="mb-3">
                            <p className="text-gray-700 text-xs font-medium mb-2">
                              Thành viên
                            </p>
                            <label
                              htmlFor="no-member"
                              className="flex items-center space-x-3 p-2 font-semibold text-xs cursor-pointer text-gray-700"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                id="no-member"
                                onChange={handleFilterNoMember}
                              />
                              <div className="flex items-center space-x-1">
                                <UserCircleIcon className="size-6" />
                                <span>Không có thành viên</span>
                              </div>
                            </label>
                            <label
                              htmlFor="me"
                              className="flex items-center space-x-3 p-2 font-semibold text-xs cursor-pointer text-gray-700"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                id="me"
                                onChange={handleFilterMe}
                              />
                              <div className="flex items-center space-x-1.5">
                                <Image
                                  src={user.avatar}
                                  alt={user.name}
                                  title={user.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                                <span>Các thẻ đã chỉ định cho tôi</span>
                              </div>
                            </label>
                            <Select
                              menuPosition="fixed"
                              id="members"
                              className="w-full p-2 text-sm text-gray-700"
                              isSearchable={false}
                              placeholder="Chọn thành viên"
                              isMulti={true}
                              options={board.members.map((m) => ({
                                label: m.user.name,
                                value: m.user.id,
                                avatar: m.user.avatar,
                                email: m.user.email,
                              }))}
                              formatOptionLabel={({ label, avatar, email }) => {
                                return (
                                  <div
                                    className="flex items-center space-x-2.5"
                                    title={email}
                                  >
                                    <Image
                                      src={avatar}
                                      alt={label}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                    <span className="text-sm font-medium">
                                      {label}
                                    </span>
                                  </div>
                                );
                              }}
                              onChange={handleFilterMembers}
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  cursor: "pointer",
                                }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <p className="text-gray-700 text-xs font-medium mb-2">
                              Card status
                            </p>
                            <label
                              htmlFor="completed"
                              className="flex items-center space-x-3 p-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                id="completed"
                                checked={filter.status === "completed"}
                                onChange={handleFilterStatus}
                              />
                              <span>Đã đánh dấu hoàn thành</span>
                            </label>
                            <label
                              htmlFor="notCompleted"
                              className="flex items-center space-x-3 p-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                id="notCompleted"
                                checked={filter.status === "notCompleted"}
                                onChange={handleFilterStatus}
                              />
                              <span>Không được đánh dấu là đã hoàn thành</span>
                            </label>
                          </div>
                          <div>
                            <p className="text-gray-700 text-xs font-medium mb-2">
                              Ngày hết hạn
                            </p>
                            <label
                              htmlFor="noDueDate"
                              className="flex items-center space-x-3 p-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                id="noDueDate"
                                checked={filter.noDueDate}
                                onChange={handleFilterDate}
                              />
                              <span>Không có ngày hết hạn</span>
                            </label>
                            <label
                              htmlFor="overdue"
                              className="flex items-center space-x-3 p-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded"
                                id="overdue"
                                checked={filter.overdue}
                                onChange={handleFilterDate}
                              />
                              <span>Quá hạn</span>
                            </label>
                          </div>
                        </div>
                      </MenuItems>
                    </Menu>
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="bg-gray-800/80 hover:bg-gray-800 font-medium text-white rounded-sm px-3 py-1.5 flex items-center text-sm"
                    >
                      <UserPlusIcon className="size-4" />
                      <span className="ml-1">Chia sẻ</span>
                    </button>

                    <Menu as="div">
                      <MenuButton type="button" className="rounded-lg p-1.5">
                        <EllipsisHorizontalIcon className="size-5" />
                      </MenuButton>
                      {actionMenu === "default" && (
                        <MenuItems
                          anchor="bottom end"
                          className="bg-white pb-2 px-2 -mt-8 rounded-sm text-sm w-96 text-gray-800 outline-none"
                        >
                          <header className="py-1">
                            <div className="flex items-center justify-between h-10">
                              <div></div>
                              <h2 className="text-center font-medium">Menu</h2>
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
                          <div className="p-1.5">
                            <ul>
                              <li
                                onClick={() => setActionMenu("changeCover")}
                                className="flex items-center p-1.5 hover:bg-gray-200 cursor-pointer rounded-md space-x-2"
                              >
                                {board.cover && (
                                  <div
                                    style={{
                                      backgroundImage: `url(${board.cover})`,
                                    }}
                                    className="rounded bg-center bg-no-repeat bg-cover size-5"
                                  ></div>
                                )}

                                {board.coverColor && (
                                  <div
                                    className="rounded size-5"
                                    style={{
                                      backgroundColor: board.coverColor,
                                    }}
                                  ></div>
                                )}
                                <span>Thay đổi hình nền</span>
                              </li>
                              <li
                                className="flex items-center space-x-2 p-1.5 hover:bg-gray-200 cursor-pointer rounded-md"
                                onClick={handleDeleteBoard}
                              >
                                <TrashIcon className="size-4" />
                                <span>Xóa bảng thông tin</span>
                              </li>
                            </ul>
                          </div>
                        </MenuItems>
                      )}

                      {actionMenu === "changeCover" && (
                        <MenuItems
                          anchor="bottom end"
                          className="bg-white pb-2 px-2 -mt-8 rounded-sm text-sm w-96 text-gray-800 outline-none"
                        >
                          <header className="py-1">
                            <div className="flex items-center justify-between h-10">
                              <button
                                type="button"
                                onClick={() => setActionMenu("default")}
                                className="size-8 hover:bg-gray-200 flex items-center justify-center rounded-lg"
                              >
                                <ChevronLeftIcon className="size-5" />
                              </button>
                              <h2 className="text-center font-medium">
                                Thay đổi hình nền
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
                          <div className="px-3">
                            <label
                              htmlFor="cover"
                              className="text-gray-700 text-sm"
                            >
                              Phông nền
                            </label>
                            <div className="mt-1">
                              <ul className="grid grid-cols-4 gap-1.5 mb-2">
                                {unplashImages
                                  .slice(0, coverEnd)
                                  .map((url, index) => {
                                    const imageUrl = `${url.raw}&q=40&auto=compress&fm=webp&w=2560`;
                                    return (
                                      <li key={index} className="w-full h-10">
                                        <button
                                          type="button"
                                          className="relative w-full h-full group"
                                          onClick={() => {
                                            handleChangeCover(imageUrl);
                                          }}
                                        >
                                          <Image
                                            src={url.small}
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

                              <ul className="grid grid-cols-5 gap-1.5">
                                {colors.map((color, index) => (
                                  <li key={index} className="w-full h-8">
                                    <button
                                      type="button"
                                      className="relative w-full h-full group"
                                      onClick={() =>
                                        handleChangeCoverColor(color)
                                      }
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
                          </div>
                        </MenuItems>
                      )}
                    </Menu>
                  </div>
                </div>
              </div>
              <div className="grow overflow-y-hidden">
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
                        columnTitle={
                          board.columns.find((col) => col.id === container)
                            ?.title
                        }
                        addColumn={handleAddColumn}
                        updateColumn={handleUpdateColumn}
                        deleteColumn={handleDeleteColumn}
                      />
                    ))}
                  </SortableContext>

                  <li className="grow px-1.5">
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
                                setAddMode((prev) => ({
                                  ...prev,
                                  column: false,
                                }))
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
              <>
                <DragOverlay>
                  {activeId ? (
                    containers.includes(activeId) ? (
                      <ColumnContainer
                        tasks={items[activeId]}
                        columnId={activeId}
                        columnTitle={
                          board.columns.find((col) => col.id === activeId)
                            ?.title
                        }
                        addColumn={handleAddColumn}
                        updateColumn={handleUpdateColumn}
                        deleteColumn={handleDeleteColumn}
                      />
                    ) : (
                      <TaskCard
                        task={
                          items[findContainer(activeId) as string].find(
                            (task) => task.id === activeId,
                          ) as Task
                        }
                        isOverlay={true}
                      />
                    )
                  ) : null}
                </DragOverlay>
                <ShareBoardModal
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                  initialMembers={board.members}
                  boardId={board.id}
                />
              </>,
              document.body,
            )}
        </DndContext>
      </div>
    </BoardContext.Provider>
  );
}
