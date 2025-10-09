"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface InputCardProps {
  content: string;
  setContent: (v: string) => void;
  daysInput: string;
  setDaysInput: (v: string) => void;
  daysError: string;
  setDays: (n: number) => void;
  setDaysError: (v: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export default function InputCard({
  content,
  setContent,
  daysInput,
  setDaysInput,
  daysError,
  setDays,
  setDaysError,
  isLoading,
  onSubmit,
}: InputCardProps) {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="bg-[#fffaf5] backdrop-blur-md rounded-2xl p-8 border border-neutral-300 min-w-[500px]">
        <h2 className={`text-2xl selection:bg-[#bbe2cc]/30 mb-6 text-center `}>Add Your Content</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your content here..."
          className="w-full max-h-80 min-h-30 p-4 rounded-lg bg-white/10 border focus:outline-none focus:ring-2 focus:ring-neutral-200 border-neutral-300 placeholder-gray-400 overflow-hidden "
        />
        <div className="mt-4">
          <label className={`block mb-2 font-medium `}>Days to complete (1-7):</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1-7"
              value={daysInput}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                setDaysInput(onlyDigits);
                if (onlyDigits === '') {
                  setDaysError('Enter a value between 1 and 7');
                  return;
                }
                const num = parseInt(onlyDigits, 10);
                if (num >= 1 && num <= 7) {
                  setDays(num);
                  setDaysError('');
                } else {
                  setDaysError('Only 1-7 allowed');
                }
              }}
              className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-neutral-300 transition focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:bg-white/40 focus:backdrop-blur-md"
            />
            {daysError && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 inline-block px-2 py-1 rounded">{daysError}</div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xs text-neutral-600 mb-2">Suggestions</div>
          <div className="flex flex-wrap gap-2">
            {['React hooks overview', 'JavaScript fundamentals', 'SQL fundamentals', 'System design basics'].map((s) => (
              <button key={s} onClick={() => setContent(s)} className="px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-neutral-100" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-neutral-600">
          <span>Helpful:</span>
          <a href="https://react.dev/learn" target="_blank" rel="noreferrer" className="underline hover:opacity-80">React docs</a>
          <a href="https://roadmap.sh" target="_blank" rel="noreferrer" className="underline hover:opacity-80">Roadmaps</a>
          <a href="https://developer.mozilla.org/" target="_blank" rel="noreferrer" className="underline hover:opacity-80">MDN</a>
        </div>
        <div className='flex justify-end mt-4'>
          <Button className='w-fit' onClick={onSubmit} disabled={isLoading || !content.trim() || !!daysError}>
            <span className="flex items-center gap-2 justify-end">Generate <ArrowUpRight className="w-4 h-4" /></span>
          </Button>
        </div>
      </div>
    </div>
  );
}


