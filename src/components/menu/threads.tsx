"use client";

import React from 'react';
import { Braces, PlusIcon } from 'lucide-react';
import { useThreadStore } from '@/store/threadStore';

interface ThreadsListProps {
  onAfterSelect?: () => void;
}

export default function ThreadsList({ onAfterSelect }: ThreadsListProps) {
  const { threads, currentThreadId, createNewThread, selectThread } = useThreadStore();

  return (
    <div className="min-w-[130px] bg-white border border-neutral-200 rounded-md shadow-sm p-1">
      {threads.length === 0 && (
        <div className="px-3 py-2 text-[11px] text-neutral-500">No threads</div>
      )}
      {threads.map(t => (
        <button
          key={t.id}
          onClick={() => { selectThread(t.id); onAfterSelect && onAfterSelect(); }}
          className={`w-full flex justify-between items-center text-left px-3 py-2 text-sm rounded cursor-pointer ${t.id === currentThreadId ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
        >
          <span className="text-xs font-medium text-neutral-700 truncate">{t.name}</span>
          <Braces className="w-4 h-3 text-neutral-700" />
        </button>
      ))}
      <button onClick={() => { createNewThread(); onAfterSelect && onAfterSelect(); }} className="w-full mt-1 text-center justify-between px-3 py-2 text-sm hover:bg-neutral-100 rounded cursor-pointer">
        <span className="text-xs font-medium text-neutral-700 text-center flex items-center justify-center gap-2"><PlusIcon className="w-4 h-3" /> New thread</span>
      </button>
    </div>
  );
}

