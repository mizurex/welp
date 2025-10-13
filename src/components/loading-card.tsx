'use client';

import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import MascotDotFace from "./input/MascotDotFace";

export default function LoadingCard() {
  const loadingMessages = [
    'Creating nodes',
    'Creating edges',
    'Structuring into days and sessions',
    'Generating practice tasks',
    'Laying out your study tree'
  ];

  const tips = [
    'Tip: You can mark completed nodes to track progress.'
    
  ];

  const [loadingIndex, setLoadingIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate messages
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => {
      clearInterval(loadingInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
      <style>
        {`
          @keyframes shine {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>

      <div className="bg-[#fffaf5] backdrop-blur-md rounded-2xl p-10 border border-neutral-300 w-[500px] text-center">
        <div className="flex items-center justify-center mb-4 animate-bounce">
          <MascotDotFace />
        </div>
        <div
          className="text-sm text-neutral-500 h-5 font-medium inline-block bg-gradient-to-r from-neutral-400 via-black to-neutral-400 bg-[length:200%_100%] bg-clip-text text-transparent"
          style={{
            animation: 'shine 1.8s linear infinite',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {loadingMessages[loadingIndex]}...
        </div>
        <div className="mt-3 text-xs text-neutral-500 h-4 flex justify-center items-center gap-1">
          <Lightbulb size={14} className="text-yellow-500" />
          <span className="italic">{tips[tipIndex]}</span>
        </div>
      </div>
    </div>
  );
}
