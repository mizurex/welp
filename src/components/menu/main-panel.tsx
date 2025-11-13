"use client";

import React, { useState } from 'react';
import ThreadsList from './threads';
import { ChevronRight, EllipsisVertical, Info, X } from 'lucide-react';

interface MainPanelProps {}

export default function MainPanel({}: MainPanelProps) {
 const [showApiModal, setShowApiModal] = useState(false);
 const [apiKeyInput, setApiKeyInput] = useState('');
  const [open, setOpen] = useState(false);
  const toggleMenu = () => {
    setOpen(!open);
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
          <div className="relative group">
            <button
              className="text-xs px-2 py-1 rounded hover:bg-neutral-100 w-full text-left cursor-pointer flex items-center justify-between"
              onClick={() => setShowApiModal(true)}
            >
              API KEY
            </button>
          </div>
          {open && showApiModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-900/40">
              <div className="bg-white rounded-lg shadow-lg p-4 w-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-sm">Add API Key</span>
                  <button
                    onClick={() => setShowApiModal(false)}
                    className="text-sm px-2 py-1 rounded hover:bg-neutral-100 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 pb-8  ">
                   <Info className="size-5 mb-5" /> 
                  <span className="text-xs text-neutral-700 leading-relaxed">
                
                    API keys are stored locally in your browser.
                  
                
                    Get a key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">here</a>
                  </span>
                  </div>
                  
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setShowApiModal(false);
                  }}
                >
                  <input
                    type="text"
                    className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs mb-3 font-mono"
                    placeholder="Enter your API KEY"
                    value={apiKeyInput}
                    onChange={(e)=>{
                      setApiKeyInput(e.target.value);
                      localStorage.setItem('api-Key', e.target.value);
                    }}
                  />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1 rounded bg-neutral-700 text-white hover:bg-neutral-800 w-full cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
}