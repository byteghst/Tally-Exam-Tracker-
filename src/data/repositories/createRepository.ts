import type { Table } from 'dexie';
import type { BaseEntity } from '@/types';

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Factory that gives every entity the same CRUD + archive shape,
 * so components never talk to Dexie directly.
 */
export function createRepository<T extends BaseEntity>(table: Table<T, string>) {
  return {
    async list(includeArchived = false): Promise<T[]> {
      const all = await table.toArray();
      return includeArchived ? all : all.filter((item) => !item.archived);
    },

    async get(id: string): Promise<T | undefined> {
      return table.get(id);
    },

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): Promise<T> {
      const now = Date.now();
      const entity = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        archived: false
      } as T;
      await table.add(entity);
      return entity;
    },

    async update(id: string, changes: Partial<T>): Promise<T | undefined> {
      const existing = await table.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...changes, updatedAt: Date.now() } as T;
      await table.put(updated);
      return updated;
    },

    async archive(id: string): Promise<void> {
      await table.update(id, { archived: true, updatedAt: Date.now() } as any);
    },

    async unarchive(id: string): Promise<void> {
      await table.update(id, { archived: false, updatedAt: Date.now() } as any);
    },

    async remove(id: string): Promise<void> {
      await table.delete(id);
    },

    async duplicate(id: string, overrides: Partial<T> = {}): Promise<T | undefined> {
      const existing = await table.get(id);
      if (!existing) return undefined;
      const now = Date.now();
      const copy = {
        ...existing,
        ...overrides,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        archived: false
      } as T;
      await table.add(copy);
      return copy;
    },

    async bulkPut(items: T[]): Promise<void> {
      await table.bulkPut(items);
    },

    async clearAll(): Promise<void> {
      await table.clear();
    }
  };
}
