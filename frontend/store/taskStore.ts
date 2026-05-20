import { create } from "zustand";
import { Task } from "@/app/types/types";
import { TaskFormData } from "@/zod/taskTypes";

type SaveTaskResponse = {
  success: boolean;
  data?: Task;
  receivedData?: Task;
  message?: string;
  error?: string;
};

type KanbanStore = {
  tasks: Task[];
  fetchTasks: (route?: string) => Promise<void>;
  editTask: (taskId: string) => Promise<Response>;
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<Response>;
  addOrEditTask: (
    taskData: TaskFormData,
    isEditMode: boolean,
  ) => Promise<SaveTaskResponse>;
  deleteTasks: (taskId: string) => Promise<Response>;
};

export const useTaskStore = create<KanbanStore>((set) => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === "production" ? "/_/backend" : "http://localhost:8080");
  const getUrl = (path: string) =>
    apiBaseUrl + (path.startsWith("/") ? path : `/${path}`);

  return {
    tasks: [],
    fetchTasks: async (route?: string) => {
      let shouldFetch = false;
      let fetchRoute = "";

    if (route) {
      shouldFetch = true;
      fetchRoute = route.startsWith("/") ? route : `/${route}`;
    }

    if (shouldFetch) {
      try {
        const response = await fetch(getUrl(fetchRoute));

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status} body: ${body}`,
          );
        }

        const jsonResponse = await response.json();
        if (!jsonResponse.success) {
          throw new Error(
            `API returned unsuccessful response: ${JSON.stringify(jsonResponse)}`,
          );
        }

        if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
          set({ tasks: jsonResponse.data });
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        throw new Error(
          `Data was not fetched! ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  },
  editTask: async (taskId: string) => {
    const response = await fetch(getUrl(`kanban/${taskId}`), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response;
  },

  addOrEditTask: async (taskData: TaskFormData, isEditMode: boolean) => {
    try {
      const url = isEditMode
        ? getUrl(`kanban/${taskData._id}`)
        : getUrl("kanban");
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      // Safely parse JSON (backend returns success + data/receivedData)
      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(
          json?.error || `Request failed with ${response.status}`,
        );
      }

      const createdOrUpdated = isEditMode
        ? json.data
        : json.data || json.receivedData;

      if (!createdOrUpdated) {
        throw new Error("Invalid response payload: missing task data");
      }

      // Optimistically update client state
      set((state) => {
        if (isEditMode) {
          return {
            tasks: state.tasks.map((t) =>
              String(t._id) === String(createdOrUpdated._id)
                ? createdOrUpdated
                : t,
            ),
          };
        }
        return { tasks: [...state.tasks, createdOrUpdated] };
      });

      return json;
    } catch (err) {
      console.error("Failed to add/edit task:", err);
      throw err;
    }
  },

  updateTaskStatus: async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(
        getUrl(`tasks/${taskId}/status?status=${newStatus}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        // pass the id of the task , when the update function is called it will take the tasks and start the filtering , once we have found our task use the spread operator to fetch its values and update the status with the new status we are setting throught the dashboard
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t._id === taskId ? { ...t, status: newStatus } : t,
          ),
        }));
      }

      return response;
    } catch (err) {
      console.error("Unable to update the task", err);
      throw err;
    }
  },

  deleteTasks: async (taskId: string) => {
    try {
      const response = await fetch(getUrl(`kanban/${taskId}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        set((state) => ({
          tasks: state.tasks.filter(
            (task) => String(task._id) !== String(taskId),
          ),
        }));
      }

      return response;
    } catch (err) {
      console.error("Failed to delete task:", err);
      throw err;
    }
  },
  };
});
