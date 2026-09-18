import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface UIStore {
  commandPaletteOpen: boolean;
  quickAddOpen: boolean;
  toasts: Toast[];
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  pushToast: (message: string, action?: Toast['action']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  commandPaletteOpen: false,
  quickAddOpen: false,
  toasts: [],

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),

  pushToast: (message, action) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, message, action }] });
    setTimeout(() => get().dismissToast(id), 6000);
  },

  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) })
}));
