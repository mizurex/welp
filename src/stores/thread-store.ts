'use client';

import { create } from 'zustand';
import { createThread, listThreads, deleteThread, deleteAllThreads } from '@/dexie/db';

export type Thread = { id: string; name: string };

interface ThreadState {
  threads: Thread[];
  currentThreadId: string | null;
  init: () => Promise<void>;
  createNewThread: () => Promise<void>;
  selectThread: (id: string) => void;
  removeCurrentThread: () => Promise<void>;
  removeAllThreads: () => Promise<void>;
}

export const useThreadStore = create<ThreadState>((set, get) => ({
  threads: [],
  currentThreadId: null,
  init: async () => {
    try {
      const ts = await listThreads();
      if (ts.length === 0) {
        set({ threads: [], currentThreadId: null });
      } else {
        set({ threads: ts.map(t => ({ id: t.id, name: t.name })), currentThreadId: ts[0].id });
      }
    } catch {}
  },
  createNewThread: async () => {
    const name = `Thread ${get().threads.length + 1}`;
    const id = await createThread(name);
    set(state => ({ threads: [{ id, name }, ...state.threads], currentThreadId: id }));
  },
  selectThread: (id: string) => set({ currentThreadId: id }),
  removeCurrentThread: async () => {
    const current = get().currentThreadId;
    if (!current) return;
    await deleteThread(current);
    set(state => {
      const remaining = state.threads.filter(t => t.id !== current);
      const nextId = remaining[0]?.id ?? null;
      return { threads: remaining, currentThreadId: nextId };
    });
  },
  removeAllThreads: async () => {
    await deleteAllThreads();
    set({ threads: [], currentThreadId: null });
  },
}));


