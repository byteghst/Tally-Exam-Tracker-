import { create } from 'zustand';
import type { SyllabusNode } from '@/types';
import { syllabusRepository } from '@/data/repositories/syllabusRepository';
import { logActivity } from '@/data/activityLog';
import { useUIStore } from '@/store/uiStore';

interface SyllabusStore {
  nodes: SyllabusNode[];
  loading: boolean;
  hydrate: () => Promise<void>;
  addNode: (data: Omit<SyllabusNode, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => Promise<SyllabusNode>;
  updateNode: (id: string, changes: Partial<SyllabusNode>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  overallProgress: () => number;
}

export const useSyllabusStore = create<SyllabusStore>((set, get) => ({
  nodes: [],
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    const nodes = await syllabusRepository.list();
    set({ nodes, loading: false });
  },

  addNode: async (data) => {
    const node = await syllabusRepository.create(data);
    set({ nodes: [...get().nodes, node] });
    logActivity('syllabus', node.id, `Added syllabus item "${node.title}"`);
    return node;
  },

  updateNode: async (id, changes) => {
    const updated = await syllabusRepository.update(id, changes);
    if (!updated) return;
    set({ nodes: get().nodes.map((n) => (n.id === id ? updated : n)) });
    const message =
      changes.progressState === 'completed'
        ? `Completed syllabus item "${updated.title}"`
        : `Updated syllabus item "${updated.title}"`;
    logActivity('syllabus', updated.id, message);
  },

  deleteNode: async (id) => {
    const node = get().nodes.find((n) => n.id === id);
    const children = get().nodes.filter((n) => n.parentId === id);
    const childOriginalParents = children.map((c) => ({ id: c.id, parentId: c.parentId }));

    // promote direct children up to the deleted node's own parent so they
    // stay reachable in the tree instead of pointing at a parentId that no
    // longer exists
    for (const child of children) {
      await syllabusRepository.update(child.id, { parentId: node?.parentId });
    }

    await syllabusRepository.remove(id);
    const nodes = await syllabusRepository.list();
    set({ nodes });

    if (node) {
      logActivity('syllabus', id, `Deleted syllabus item "${node.title}"`);
      const toastMessage =
        children.length > 0
          ? `Deleted "${node.title}" — ${children.length} item${children.length === 1 ? '' : 's'} moved up a level`
          : `Deleted "${node.title}"`;
      useUIStore.getState().pushToast(toastMessage, {
        label: 'Undo',
        onClick: async () => {
          await syllabusRepository.restore(node);
          for (const c of childOriginalParents) {
            await syllabusRepository.update(c.id, { parentId: c.parentId });
          }
          const nodes = await syllabusRepository.list();
          set({ nodes });
        }
      });
    }
  },

  overallProgress: () => {
    const nodes = get().nodes;
    if (nodes.length === 0) return 0;
    return Math.round(nodes.reduce((acc, n) => acc + n.progressPercent, 0) / nodes.length);
  }
}));
