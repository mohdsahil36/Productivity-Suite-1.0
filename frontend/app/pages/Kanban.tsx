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
import { CalendarDays, Edit, GripVertical, Plus } from "lucide-react";
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
      className="group bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-lg p-3 transition-colors"
    >
      {/* Priority strip */}
      <div
        className={`h-1 w-14 mb-3 rounded-full
          ${task.priority === "low" && "bg-[var(--text-tertiary)]"}
          ${task.priority === "medium" && "bg-[var(--db-amber)]"}
          ${task.priority === "high" && "bg-[var(--db-red)]"}
        `}
      />

      {/* Drag */}
      <div
        {...listeners}
        {...attributes}
        className="flex items-start gap-2 cursor-grab mb-2"
      >
        <GripVertical className="mt-0.5 size-4 shrink-0 text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--text-secondary)]" />
        <span className="line-clamp-2 text-sm font-medium leading-snug text-[var(--text-primary)]">
          {task.title}
        </span>
      </div>

      <div className="flex justify-between items-start gap-3">
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {task.description}
        </p>

        <div className="flex shrink-0 gap-1">
          <button
            className="rounded border border-transparent p-1 text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]"
            onClick={() => editHandler(task._id)}
            aria-label="Edit task"
          >
            <Edit className="size-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition" />
          </button>
          <DeleteConfirmation taskId={task._id} onTaskDelete={onTaskDelete} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-[var(--text-tertiary)]">
        <span className="rounded border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 uppercase tracking-[0.06em]">
          {task.priority}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3" />
          {new Date(task.due_date).toLocaleDateString()}
        </span>
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
  const totalTasks = columnData.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div className="bg-[var(--bg-main)] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <div>
          <h1 className="text-base font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            Kanban Workspace
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Prioritize, move, and close work from a single board.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Board total
          </span>
          <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
            {totalTasks}
          </span>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEvent} sensors={sensors}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {columnData.map((item, idx) => (
            <DroppableColumn
              key={idx}
              id={item.status}
              className="flex min-h-[28rem] flex-col rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-semibold text-[var(--text-primary)]">
                    {item.status}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
                    Lane {idx + 1}
                  </p>
                </div>
                <span className="rounded border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-2 py-1 font-mono text-xs text-[var(--text-secondary)]">
                  {item.tasks.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
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
                  <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 text-center text-xs text-[var(--text-tertiary)]">
                    No tasks in this lane
                  </div>
                )}
              </div>

              <button
                className="
                  mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md
                  bg-[var(--green-primary)] py-2 text-xs font-medium text-white dark:text-black
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
                <Plus className="size-3.5" />
                Add Task
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
