import { create } from 'zustand';
import type { Exam } from '@/types';
import { examRepository } from '@/data/repositories/examRepository';

interface ExamStore {
  exams: Exam[];
  loading: boolean;
  hydrate: () => Promise<void>;
  addExam: (data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<Exam>;
  updateExam: (id: string, changes: Partial<Exam>) => Promise<void>;
  archiveExam: (id: string) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  duplicateExam: (id: string) => Promise<void>;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  exams: [],
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    const exams = await examRepository.list();
    set({ exams, loading: false });
  },

  addExam: async (data) => {
    const exam = await examRepository.create(data);
    set({ exams: [...get().exams, exam] });
    return exam;
  },

  updateExam: async (id, changes) => {
    const updated = await examRepository.update(id, changes);
    if (!updated) return;
    set({ exams: get().exams.map((e) => (e.id === id ? updated : e)) });
  },

  archiveExam: async (id) => {
    await examRepository.archive(id);
    set({ exams: get().exams.filter((e) => e.id !== id) });
  },

  deleteExam: async (id) => {
    await examRepository.remove(id);
    set({ exams: get().exams.filter((e) => e.id !== id) });
  },

  duplicateExam: async (id) => {
    const copy = await examRepository.duplicate(id, { status: 'upcoming' });
    if (copy) set({ exams: [...get().exams, copy] });
  }
}));
