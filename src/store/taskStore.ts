import { create } from 'zustand';
import type { Task } from '@/types';
import { taskRepository } from '@/data/repositories/taskRepository';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  hydrate: () => Promise<void>;
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<Task>;
  toggleComplete: (id: string) => Promise<void>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    const tasks = await taskRepository.list();
    set({ tasks, loading: false });
  },

  addTask: async (data) => {
    const task = await taskRepository.create(data);
    if (task.recurrence && task.date) {
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 60);
      await taskRepository.ensureRecurringInstances(
        task,
        task.date,
        horizon.toISOString().slice(0, 10)
      );
      const tasks = await taskRepository.list();
      set({ tasks });
      return task;
    }
    set({ tasks: [...get().tasks, task] });
    return task;
  },

  toggleComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    await get().updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  },

  updateTask: async (id, changes) => {
    const updated = await taskRepository.update(id, changes);
    if (!updated) return;
    set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) });

    if (updated.recurrence && updated.date) {
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 60);
      await taskRepository.ensureRecurringInstances(
        updated,
        updated.date,
        horizon.toISOString().slice(0, 10)
      );
      const tasks = await taskRepository.list();
      set({ tasks });
    }
  },

  deleteTask: async (id) => {
    await taskRepository.remove(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  }
}));
