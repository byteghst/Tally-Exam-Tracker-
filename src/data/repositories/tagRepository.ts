import { db } from '@/data/db';
import type { Tag } from '@/types';

export const tagRepository = {
  async list(): Promise<Tag[]> {
    return db.tags.toArray();
  },
  async create(name: string, color: string): Promise<Tag> {
    const tag: Tag = { id: crypto.randomUUID(), name, color };
    await db.tags.add(tag);
    return tag;
  },
  async rename(id: string, name: string): Promise<void> {
    await db.tags.update(id, { name });
  },
  async recolor(id: string, color: string): Promise<void> {
    await db.tags.update(id, { color });
  },
  async remove(id: string): Promise<void> {
    await db.tags.delete(id);
  }
};
