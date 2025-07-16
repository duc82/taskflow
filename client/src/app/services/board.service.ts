import fetchAuth from "../libs/fetchAuth";

export const switchPositionColumn = async ({
  boardId,
  columnId,
  beforeColumnId,
  afterColumnId,
}: {
  boardId: string;
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
          boardId,
        }),
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const switchPositionTask = async ({
  taskId,
  beforeTaskId,
  afterTaskId,
  columnId,
  boardId,
}: {
  taskId: string;
  beforeTaskId?: string;
  afterTaskId?: string;
  columnId?: string;
  boardId?: string;
}) => {
  try {
    await fetchAuth<{ message: string }>(`/tasks/switch-position/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({
        beforeTaskId,
        afterTaskId,
        columnId,
        boardId: columnId ? boardId : null,
      }),
    });
  } catch (error) {
    console.log(error);
  }
};
