"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { TaskFormData } from "@/zod/taskTypes";
import { useTaskStore } from "../../store/taskStore";
import type { Task } from "@/app/types/types";
import { X } from "lucide-react";

type AddTaskProps = {
  status: string;
  openModal: boolean;
  selectedData?: { success?: boolean; data: Task };
  setOpenModal: (open: boolean) => void;
};

const initialFormData = {
  title: "",
  description: "",
  priority: "low",
  dueDate: undefined,
};

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"] as const;

function getInitialFormData(status: string): TaskFormData {
  return {
    ...initialFormData,
    status,
  } as TaskFormData;
}

const INPUT_CLASS = `
  mt-2 w-full
  bg-[var(--db-bg-surface-2)]
  border border-[var(--db-border-default)]
  rounded-md px-3 py-2
  text-xs text-[var(--db-text-primary)]
  placeholder:text-[var(--db-text-tertiary)]
  focus:outline-none focus:border-[var(--db-green-primary)] focus:ring-1 focus:ring-[var(--db-green-primary)]
  transition-colors duration-150
`;

const LABEL_CLASS =
  "text-[10px] font-medium tracking-[0.07em] uppercase text-[var(--db-text-tertiary)]";

export default function AddTask(props: AddTaskProps) {
  const [formData, setFormData] = useState<TaskFormData>(
    getInitialFormData(props.status),
  );

  const editTaskData = props.selectedData;
  const isEditMode = !!(editTaskData && editTaskData.data);
  const { addOrEditTask } = useTaskStore();

  useEffect(() => {
    if (editTaskData) {
      const taskData = editTaskData.data;
      setFormData({
        title: taskData.title || "",
        description: taskData.description || "",
        priority:
          (taskData.priority?.toLowerCase() as "low" | "medium" | "high") ||
          "low",
        dueDate: taskData.due_date ? new Date(taskData.due_date) : undefined,
        status: taskData.status || props.status,
        _id: taskData._id || crypto.randomUUID(),
      });
    } else {
      setFormData(getInitialFormData(props.status));
    }
  }, [editTaskData, props.status]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();

    const taskToSubmit = {
      ...formData,
      status: formData.status || props.status,
      _id: isEditMode ? formData._id : crypto.randomUUID(),
    };

    try {
      const result = await addOrEditTask(taskToSubmit, isEditMode);
      if (!result?.success) {
        console.error(
          `Failed to ${isEditMode ? "update" : "add"} task:`,
          result,
        );
        return;
      }
      setFormData(getInitialFormData(props.status));
      props.setOpenModal(false);
    } catch (error) {
      console.error("Error adding/updating task", error);
    }
  }

  const handleDialogClose = (open: boolean) => {
    props.setOpenModal(open);
    if (!open) setFormData(getInitialFormData(props.status));
  };

  const closeModal = () => {
    handleDialogClose(false);
  };

  return (
    <Dialog onOpenChange={handleDialogClose} open={props.openModal}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[min(42rem,calc(100vw-2rem))] p-0
          bg-[var(--db-bg-surface)]
          border border-[var(--db-border-default)]
          rounded-lg
          shadow-none
          font-ui-db
          overflow-hidden
        "
      >
        <DialogTitle className="sr-only">
          {isEditMode ? "Edit Task" : "Add Task"}
        </DialogTitle>

        <div className="flex flex-col gap-3 border-b border-[var(--db-border-default)] bg-[var(--db-bg-surface-2)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[1rem] font-semibold tracking-[-0.01em] text-[var(--db-text-primary)]">
              {isEditMode ? "Edit Task" : "New Task"}
            </h2>
            <p className="text-[11px] text-[var(--db-text-tertiary)] mt-0.5">
              {isEditMode
                ? "Update the task details below"
                : "Fill in the details to create a task"}
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
            <span className="inline-flex min-h-8 items-center rounded-md border border-[var(--db-green-mid)] bg-[var(--db-green-soft)] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--db-text-primary)]">
              {formData.status || props.status}
            </span>

            <button
              type="button"
              onClick={closeModal}
              className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--db-border-default)] bg-[var(--db-bg-surface)] text-[var(--db-text-tertiary)] transition-colors hover:border-[var(--db-border-mid)] hover:text-[var(--db-text-primary)]"
              aria-label="Close task modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <form onSubmit={submitForm}>
            <div className="flex flex-col gap-5">
              {/* Title */}
              <div>
                <Label className={LABEL_CLASS}>Title</Label>
                <Input
                  placeholder="Enter task title"
                  className={INPUT_CLASS}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div>
                <Label className={LABEL_CLASS}>Description</Label>
                <Textarea
                  placeholder="Enter task details"
                  className={`${INPUT_CLASS} h-20 resize-none`}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Status + Priority + Due Date */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Status */}
                <div className="flex flex-col">
                  <Label className={LABEL_CLASS}>Status</Label>
                  <Select
                    value={formData.status || props.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger
                      className="
                        mt-2 w-full
                        bg-[var(--db-bg-surface-2)]
                        border border-[var(--db-border-default)]
                        rounded-md px-3 py-2 h-auto
                        text-xs text-[var(--db-text-primary)]
                        focus:outline-none focus:border-[var(--db-green-primary)] focus:ring-1 focus:ring-[var(--db-green-primary)]
                        transition-colors duration-150
                      "
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="
                        bg-[var(--db-bg-surface)]
                        border border-[var(--db-border-default)]
                        rounded-md shadow-none
                        text-xs
                      "
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-xs cursor-pointer text-[var(--db-text-primary)]"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="flex flex-col">
                  <Label className={LABEL_CLASS}>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger
                      className="
                        mt-2 w-full
                        bg-[var(--db-bg-surface-2)]
                        border border-[var(--db-border-default)]
                        rounded-md px-3 py-2 h-auto
                        text-xs text-[var(--db-text-primary)]
                        focus:outline-none focus:border-[var(--db-green-primary)] focus:ring-1 focus:ring-[var(--db-green-primary)]
                        transition-colors duration-150
                      "
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="
                        bg-[var(--db-bg-surface)]
                        border border-[var(--db-border-default)]
                        rounded-md shadow-none
                        text-xs
                      "
                    >
                      {[
                        {
                          value: "low",
                          label: "Low",
                          cls: "text-[var(--db-text-primary)]",
                        },
                        {
                          value: "medium",
                          label: "Medium",
                          cls: "text-[var(--db-amber)]",
                        },
                        {
                          value: "high",
                          label: "High",
                          cls: "text-[var(--db-red)]",
                        },
                      ].map(({ value, label, cls }) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className={`text-xs cursor-pointer ${cls}`}
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="flex flex-col">
                  <Label className={LABEL_CLASS}>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="
                          mt-2 w-full
                          bg-[var(--db-bg-surface-2)]
                          border border-[var(--db-border-default)]
                          hover:border-[var(--db-border-mid)]
                          rounded-md px-3 py-2
                          text-left text-xs
                          text-[var(--db-text-primary)]
                          transition-colors duration-150
                          active:scale-[0.98]
                        "
                      >
                        {formData.dueDate ? (
                          formData.dueDate.toDateString()
                        ) : (
                          <span className="text-[var(--db-text-tertiary)]">
                            Select date
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="
                        p-0
                        bg-[var(--db-bg-surface)]
                        border border-[var(--db-border-default)]
                        rounded-md
                        shadow-none
                      "
                    >
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) setFormData({ ...formData, dueDate: date });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--db-border-default)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Reset */}
              <button
                type="button"
                onClick={() => setFormData(getInitialFormData(props.status))}
                className="
                  w-full px-4 py-2 text-xs font-medium rounded-md
                  bg-[var(--db-bg-surface-2)]
                  border border-[var(--db-border-default)]
                  text-[var(--db-text-secondary)]
                  hover:border-[var(--db-border-mid)]
                  active:scale-[0.98]
                  transition-all duration-150
                  sm:w-auto
                "
              >
                Reset
              </button>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    px-4 py-2 text-xs font-medium rounded-md
                    bg-transparent
                    border border-[var(--db-border-default)]
                    text-[var(--db-text-secondary)]
                    hover:bg-[var(--db-bg-surface-2)]
                    hover:border-[var(--db-border-mid)]
                    active:scale-[0.98]
                    transition-all duration-150
                  "
                >
                  Cancel
                </button>

                {/* Submit */}
                <button
                  type="submit"
                  className="
                    px-5 py-2 text-xs font-semibold rounded-md
                    bg-[var(--db-green-primary)] text-white
                    dark:text-black
                    hover:bg-[var(--db-green-hover)]
                    active:scale-[0.98]
                    transition-all duration-150
                  "
                >
                  {isEditMode ? "Update Task" : "Add Task"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
