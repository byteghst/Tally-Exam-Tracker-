import { create } from 'zustand';
import type { Exam } from '@/types';
import { examRepository } from '@/data/repositories/examRepository';
import { logActivity } from '@/data/activityLog';
import { useUIStore } from '@/store/uiStore';

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
    logActivity('exam', exam.id, `Added exam "${exam.name}"`);
    return exam;
  },

  updateExam: async (id, changes) => {
    const updated = await examRepository.update(id, changes);
    if (!updated) return;
    set({ exams: get().exams.map((e) => (e.id === id ? updated : e)) });
    logActivity('exam', updated.id, `Updated exam "${updated.name}"`);
  },

  archiveExam: async (id) => {
    const exam = get().exams.find((e) => e.id === id);
    await examRepository.archive(id);
    set({ exams: get().exams.filter((e) => e.id !== id) });
    if (exam) {
      logActivity('exam', id, `Archived exam "${exam.name}"`);
      useUIStore.getState().pushToast(`Archived "${exam.name}"`, {
        label: 'Undo',
        onClick: async () => {
          await examRepository.unarchive(id);
          const exams = await examRepository.list();
          set({ exams });
        }
      });
    }
  },

  deleteExam: async (id) => {
    const exam = get().exams.find((e) => e.id === id);
    await examRepository.remove(id);
    set({ exams: get().exams.filter((e) => e.id !== id) });
    if (exam) logActivity('exam', id, `Deleted exam "${exam.name}"`);
  },

  duplicateExam: async (id) => {
    const copy = await examRepository.duplicate(id, { status: 'upcoming' });
    if (copy) {
      set({ exams: [...get().exams, copy] });
      logActivity('exam', copy.id, `Duplicated exam "${copy.name}"`);
    }
  }
}));
