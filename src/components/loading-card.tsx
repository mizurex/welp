'use client';
import React from "react";
import { Rabbit } from "lucide-react";
import { useState } from "react";

export default function LoadingCard() {
    const loadingMessages = [
        'Reading your content',
        'Extracting key topics',
        'Structuring into days and sessions',
        'Generating practice tasks',
        'Laying out your study tree'
      ];
      const [loadingIndex, setLoadingIndex] = useState(0);
      const tips = [
        'Tip: Open the content in your favorite AI (ChatGPT, Claude, Grok).',
        'Tip: Use Notes to jot down insights under any node.',
        'Tip: Click “Open in ▾” on a node to send to an AI.',
        'Tip: Export your plan as JSON from the menu.',
      ];
      const [tipIndex, setTipIndex] = useState(0);
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
    <div className="bg-[#fffaf5] backdrop-blur-md rounded-2xl p-10 border border-neutral-300 w-[420px] text-center shadow-xl">
      <div className="flex items-center justify-center mb-4">
        <Rabbit className="w-10 h-10 text-neutral-500 animate-pulse" />
      </div>
      <div className="text-sm text-neutral-600 h-5">{loadingMessages[loadingIndex]}...</div>
      <div className="mt-2 text-xs text-neutral-500 h-4">{tips[tipIndex]}</div>
    </div>
  </div>    
  );
}