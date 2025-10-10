"use client";

import React from 'react';
import { Panel } from '@xyflow/react';
import { ChevronRight, EllipsisVertical, PlusIcon, TrashIcon, Braces } from 'lucide-react';
import { Instrument_Serif } from "next/font/google";
import MascotDotFace from '@/components/input/MascotDotFace';
import MascotDotFace2 from '../input/MascotEyes';

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"] });

interface TopPanelProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onClear: () => void;
  onNew: () => void;
  onExport: () => void;
  threads?: { id: string; name: string }[];
  currentThreadId?: string | null;
  onSelectThread?: (id: string) => void;
}

export default function TopPanel({ menuOpen, onToggleMenu, onClear, onNew, onExport, threads = [], currentThreadId, onSelectThread }: TopPanelProps) {
  return (
    <Panel position="top-left" className="m-0 flex items-center justify-between pr-2 py-2 space-x-10 bg-white rounded-md shadow-md border border-neutral-100 border-b border-r " style={{ top: 0, left: 0, margin: 0 }}>
      <div className="flex items-center gap-2 pl-4" >
        <div className="flex items-center gap-2">
          <MascotDotFace2/>
        </div>
        
        <h2 className={`text-xl text-secondary-foreground ${instrumentSerif.className}`}>welp</h2>
      </div>
      <div className="relative">
        <button onClick={onToggleMenu} className="cursor-pointer px-2 py-2 rounded-md flex items-center justify-center hover:bg-neutral-100" aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <EllipsisVertical className="w-4 h-4 text-secondary-foreground" />
        </button>
        {menuOpen && (
          <div className="absolute left-0 top-full mt-2 w-[130px] px-0.5 pt-2 pb-2 z-50 rounded-lg bg-[#fefefe] shadow-xl shadow-black/5 border border-neutral-200 backdrop-blur-sm overflow-visible flex flex-col">
            <button onClick={onClear} className="w-full flex justify-between text-left px-3 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2 rounded-md cursor-pointer">
              <span className="text-xs font-medium text-neutral-700"> Clear</span>
              <span className="text-xs font-medium text-neutral-700"> <TrashIcon className="w-4 h-3" /></span>
            </button>
            <button onClick={onNew} className="w-full flex justify-between text-left px-3 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2 rounded-md cursor-pointer">
              <span className="text-xs font-medium text-neutral-700"> New </span>
              <span className="text-xs font-medium text-neutral-700"> <PlusIcon className="w-4 h-3" /></span>
            </button>
            <div className="relative group">
              <button className="w-full flex justify-between text-left px-3 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2 rounded-md cursor-pointer">
                <span className="text-xs font-medium text-neutral-700"> Export as</span>
                <span className="text-xs font-medium text-neutral-700"> <ChevronRight className="w-4 h-3" /></span>
              </button>
              <div className="absolute left-full top-0 w-25 rounded-md bg-white backdrop-blur-md shadow-lg shadow-black/20 border border-neutral-300 p-1 hidden group-hover:block">
                <button onClick={onExport} className="w-full flex justify-between items-center text-zinc-800 text-left px-3 py-2 text-sm hover:bg-neutral-100 rounded cursor-pointer">
                  <span className="text-xs font-medium text-neutral-700"> JSON </span>
                  <Braces className="w-4 h-3 text-neutral-700" />
                </button>
              </div>
            </div>
            <div className="relative group">
              <button className="w-full flex justify-between text-left px-3 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2 rounded-md cursor-pointer">
                <span className="text-xs font-medium text-neutral-700">Threads</span>
                <span className="text-xs font-medium text-neutral-700"> <ChevronRight className="w-4 h-3" /></span>
              </button>
              <div className="absolute left-full top-0 min-w-35 rounded-md bg-white backdrop-blur-md shadow-md shadow-white/20 border border-neutral-300 p-1 hidden group-hover:block">
                {threads.length === 0 && (
                  <div className="px-3 py-2 text-[11px] text-neutral-500">No threads</div>
                )}
                {threads.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onSelectThread && onSelectThread(t.id)}
                    className={`w-full flex justify-between items-center text-left px-3 py-2 text-sm rounded cursor-pointer ${t.id === currentThreadId ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
                  >
                    <span className="text-xs font-medium text-neutral-700 truncate">{t.name}</span>
                    <Braces className="w-4 h-3 text-neutral-700" />
                  </button>
                ))}
                <button onClick={onNew} className="w-full mt-1 text-center justify-between px-3 py-2 text-sm hover:bg-neutral-100 rounded cursor-pointer">
                  <span className="text-xs font-medium text-neutral-700 text-center flex items-center justify-center gap-2"><PlusIcon className="w-4 h-3" /> New thread</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}


