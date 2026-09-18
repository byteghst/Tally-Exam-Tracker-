import { create } from 'zustand';
import type { Deadline } from '@/types';
import { deadlineRepository } from '@/data/repositories/deadlineRepository';

interface DeadlineStore {
  deadlines: Deadline[];
  loading: boolean;
  hydrate: () => Promise<void>;
  addDeadline: (data: Omit<Deadline, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<Deadline>;
  updateDeadline: (id: string, changes: Partial<Deadline>) => Promise<void>;
  completeDeadline: (id: string) => Promise<void>;
  deleteDeadline: (id: string) => Promise<void>;
}

export const useDeadlineStore = create<DeadlineStore>((set, get) => ({
  deadlines: [],
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    const deadlines = await deadlineRepository.withComputedStatus();
    set({ deadlines, loading: false });
  },

  addDeadline: async (data) => {
    const deadline = await deadlineRepository.create(data);
    set({ deadlines: [...get().deadlines, deadline] });
    return deadline;
  },

  updateDeadline: async (id, changes) => {
    const updated = await deadlineRepository.update(id, changes);
    if (!updated) return;
    set({ deadlines: get().deadlines.map((d) => (d.id === id ? updated : d)) });
  },

  completeDeadline: async (id) => {
    await get().updateDeadline(id, { status: 'completed' });
  },

  deleteDeadline: async (id) => {
    await deadlineRepository.remove(id);
    set({ deadlines: get().deadlines.filter((d) => d.id !== id) });
  }
}));
