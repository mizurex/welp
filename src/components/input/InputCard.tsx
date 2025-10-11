"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Info } from 'lucide-react';
import MascotEyes from './MascotEyes';
import MascotDotFace from './MascotDotFace';
import Flips from '../ui/flips';
import MainPanel from '@/components/menu/main-panel';

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
  requestError?: string;
  setRequestError?: (v: string) => void;
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
  requestError,
  setRequestError,
}: InputCardProps) {
  return (
    <>
    <div className="fixed top-2 left-2 z-30">
      <MainPanel />
    </div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="bg-transparent min-w-[700px] relative">
      <div className="flex flex-col items-center gap-2 mb-6">
  <div className="relative px-3 py-1 rounded-full text-sm bg-white border border-neutral-300 shadow-[2px_3px_rgba(0,0,0,0.1)]">
   <span className="text-secondary-foreground">Ready to
    <Flips /></span>
    <div className="absolute left-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white "></div>
  </div>
  <MascotDotFace size={42} />
</div>
        <div className="rounded-2xl bg-white/80 backdrop-blur">
          <div className="px-4 pt-4 pb-1 text-[13px] text-muted-foreground">Ask a question…</div>
          <div className="px-2 pb-4">
            <div className="rounded-xl bg-[#f5f5f5] border border-neutral-200 px-3 py-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="eg. How to learn React?"
                className="w-full text-secondary-foreground h-20 resize-none bg-transparent focus:outline-none text-[13px]"
                maxLength={350}
              />
              {requestError && (
                <div className="mt-2 text-[11px] text-red-600 flex items-center gap-2 px-2 rounded">
                 <Info className="w-3 h-3" /> {requestError}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
              <div className="relative mt-6">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1-7"
              value={daysInput}
              maxLength={1}
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
              className="w-10 text-sm text-neutral-700 h-6 pl-2 rounded-lg bg-white/20 backdrop-blur-sm border border-neutral-300 transition focus:outline-none focus:ring-1 focus:ring-neutral-200 focus:bg-white/40 focus:backdrop-blur-md"
            />
          </div>
                <Button className='w-fit' onClick={onSubmit} disabled={isLoading || !content.trim() || !!daysError}>
                  <span className="flex items-center gap-2 text-sm">
                    {isLoading ? 'Generating…' : 'Send'}
                    {!isLoading && <ArrowUpRight className="w-3 h-4" />}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2">
          
         
        </div>
        <div className="mt-4 flex gap-3 items-center">
          <div className="text-xs text-neutral-600 mb-1">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {['React hooks overview', 'JavaScript fundamentals', 'SQL fundamentals', 'System design basics'].map((s) => (
              <button key={s} onClick={() => setContent(s)} className="px-2 py-1 text-secondary-foreground rounded-md text-xs cursor-pointer hover:bg-neutral-100" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-secondary-foreground">Helpful:</span>
          <a href="https://react.dev/learn" target="_blank" rel="noreferrer" className="underline hover:opacity-80">React docs</a>
          <a href="https://roadmap.sh" target="_blank" rel="noreferrer" className="underline hover:opacity-80">Roadmaps</a>
          <a href="https://developer.mozilla.org/" target="_blank" rel="noreferrer" className="underline hover:opacity-80">MDN</a>
        </div>
      
      </div>
    </div>
    </>
  );
}


