"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, Column } from "../types/types";
import AddTask from "../components/AddTask";
import {
  DragEndEvent,
  DndContext,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { Edit, GripVertical } from "lucide-react";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { useTaskStore } from "@/store/taskStore";

const columns: Column[] = [
  { status: "To Do", tasks: [] },
  { status: "In Progress", tasks: [] },
  { status: "Done", tasks: [] },
];

type DroppableColumnProps = {
  children: React.ReactNode;
  id: string;
  className?: string;
};

function DroppableColumn({ children, id, className }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

type EditTaskResponse = { success?: boolean; data: Task };

type DraggableTaskProps = {
  task: Task;
  setSelectedData: React.Dispatch<
    React.SetStateAction<EditTaskResponse | undefined>
  >;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveStatus: React.Dispatch<React.SetStateAction<string>>;
  onTaskDelete: (taskId: string) => Promise<void>;
  editTask: (taskId: string) => Promise<Response>;
};

function DraggableTask({
  task,
  setSelectedData,
  setOpenModal,
  setActiveStatus,
  onTaskDelete,
  editTask,
}: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  async function editHandler(taskId: string) {
    const res = await editTask(taskId);
    const json = await res.json();
    setSelectedData(json);
    setActiveStatus(json?.data?.status || "To Do");
    setOpenModal(true);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg"
    >
      {/* Priority strip */}
      <div
        className={`h-[3px] mb-2 rounded
          ${task.priority === "low" && "bg-[var(--text-tertiary)]"}
          ${task.priority === "medium" && "bg-[var(--db-amber)]"}
          ${task.priority === "high" && "bg-[var(--db-red)]"}
        `}
      />

      {/* Drag */}
      <div
        {...listeners}
        {...attributes}
        className="flex items-center gap-2 cursor-grab mb-2"
      >
        <GripVertical className="size-4 text-[var(--text-tertiary)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {task.title}
        </span>
      </div>

      <div className="flex justify-between items-start">
        <p className="text-xs text-[var(--text-secondary)]">
          {task.description}
        </p>

        <div className="flex gap-2">
          <button onClick={() => editHandler(task._id)}>
            <Edit className="size-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition" />
          </button>
          <DeleteConfirmation taskId={task._id} onTaskDelete={onTaskDelete} />
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-[var(--text-tertiary)]">
        <p>{task.priority}</p>
        <p>{new Date(task.due_date).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [columnData, setColumnData] = useState(columns);
  const [activeStatus, setActiveStatus] = useState("To Do");
  const [selectedData, setSelectedData] = useState<EditTaskResponse>();
  const [openModal, setOpenModal] = useState(false);

  const { tasks, deleteTasks, fetchTasks, updateTaskStatus, editTask } =
    useTaskStore();

  useEffect(() => {
    fetchTasks("kanban");
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks) {
      setColumnData(
        columns.map((col) => ({
          ...col,
          tasks: tasks.filter(
            (t) =>
              (t.status || "To Do").toLowerCase() === col.status.toLowerCase(),
          ),
        })),
      );
    }
  }, [tasks]);

  const deleteHandler = useCallback(
    async (taskId: string) => {
      await deleteTasks(taskId);
    },
    [deleteTasks],
  );

  const handleDragEvent = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const newStatus = over.id as Task["status"];

      setColumnData((prev) => {
        let taskToMove: Task | null = null;
        let sourceIndex = -1;

        for (let i = 0; i < prev.length; i++) {
          const idx = prev[i].tasks.findIndex((t) => t._id === taskId);
          if (idx !== -1) {
            taskToMove = prev[i].tasks[idx];
            sourceIndex = i;
            break;
          }
        }

        if (!taskToMove || taskToMove.status === newStatus) return prev;

        const updatedTask = { ...taskToMove, status: newStatus };

        return prev.map((col, i) => {
          if (i === sourceIndex) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t._id !== taskId),
            };
          } else if (col.status === newStatus) {
            return {
              ...col,
              tasks: [...col.tasks, updatedTask],
            };
          }
          return col;
        });
      });

      await updateTaskStatus(taskId, newStatus);
    },
    [updateTaskStatus],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  return (
    <div className="bg-[var(--bg-main)] space-y-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
        <h1 className="text-base font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          Kanban Workspace
        </h1>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Drag tasks between focused, simple columns.
        </p>
      </div>

      <DndContext onDragEnd={handleDragEvent} sensors={sensors}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columnData.map((item, idx) => (
            <DroppableColumn
              key={idx}
              id={item.status}
              className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4"
            >
              <h2 className="text-xs font-medium text-[var(--text-secondary)] mb-3">
                {item.status} ({item.tasks.length})
              </h2>

              <div className="space-y-3">
                {item.tasks.length > 0 ? (
                  item.tasks.map((task) => (
                    <DraggableTask
                      key={task._id}
                      task={task}
                      setSelectedData={setSelectedData}
                      setOpenModal={setOpenModal}
                      setActiveStatus={setActiveStatus}
                      onTaskDelete={deleteHandler}
                      editTask={editTask}
                    />
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-tertiary)]">No tasks</p>
                )}
              </div>

              <button
                className="
                  mt-4 w-full text-xs font-medium
                  bg-[var(--green-primary)] text-white dark:text-black py-2 rounded-md
                  hover:bg-[var(--green-hover)]
                  active:bg-[var(--green-active)]
                  transition
                "
                onClick={() => {
                  setSelectedData(undefined);
                  setActiveStatus(item.status);
                  setOpenModal(true);
                }}
              >
                + Add Task
              </button>
            </DroppableColumn>
          ))}
        </div>
      </DndContext>

      <AddTask
        status={activeStatus}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedData={selectedData}
      />
    </div>
  );
}
