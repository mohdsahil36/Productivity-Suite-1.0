"use client";

import { useState } from "react";
import type { Task } from "@/app/types/types";

type EditTaskResponse = { success?: boolean; data: Task };

export function useTaskModal() {
  // The status that the AddTask modal should use when creating/updating a task.
  const [activeStatus, setActiveStatus] = useState("To Do");

  // When this has task data, AddTask opens in edit mode. When undefined, it opens in add mode.
  const [selectedData, setSelectedData] = useState<EditTaskResponse>();

  // Controls whether the shared AddTask dialog is visible.
  const [openModal, setOpenModal] = useState(false);

  // Open the modal for a new task and clear any previously selected edit data.
  function openAddTask(statusValue = "To Do") {
    setSelectedData(undefined);
    setActiveStatus(statusValue);
    setOpenModal(true);
  }

  // Open the modal with an existing task loaded into the form.
  function openEditTask(taskData: EditTaskResponse) {
    setSelectedData(taskData);
    setActiveStatus(taskData.data.status || "To Do");
    setOpenModal(true);
  }

  return {
    activeStatus,
    selectedData,
    openModal,
    setOpenModal,
    openAddTask,
    openEditTask,
  };
}
