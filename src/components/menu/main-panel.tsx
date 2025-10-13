"use client";

import React, { useState } from 'react';
import ThreadsList from './threads';
import { useThreadStore } from '@/store/threadStore';
import { ChevronRight, EllipsisVertical } from 'lucide-react';

interface MainPanelProps {}

export default function MainPanel({}: MainPanelProps) {
  const { createNewThread, removeAllThreads } = useThreadStore();
  const [open, setOpen] = useState(false);
  const toggleMenu = () => {
    setOpen(!open);
  }
  const clearAll = async () => {
    await removeAllThreads();
    localStorage.removeItem('welp-data');
  }
  return (
    <div className="relative inline-block text-left ">
    <button
      onClick={toggleMenu}
      className="text-xs px-2 py-1 rounded hover:bg-neutral-100 w-full text-left cursor-pointer"
    >
      <EllipsisVertical className="w-4 h-4" />
    </button>

    {open && (
      <div className="absolute left-0 mt-2 w-[130px] rounded-md bg-white border border-neutral-200 shadow-md p-2 z-50">
        <div className="flex flex-col gap-2">
          <div className="relative group">
            <button className="text-xs px-2 py-1 rounded hover:bg-neutral-100 w-full text-left cursor-pointer flex items-center justify-between">
             <span className="text-xs font-medium text-neutral-700">Threads</span> <ChevronRight className="w-4 h-3" />
            </button>
            <div className="absolute left-full top-0 w-[130px] hidden group-hover:block z-50">
              <ThreadsList />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}