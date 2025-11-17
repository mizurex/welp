"use client";

import React, { useState, useEffect } from 'react';
import ThreadsList from './threads';
import { ChevronRight, EllipsisVertical, Info, TrashIcon, X } from 'lucide-react';
import { TStorage } from 'tsrage';

interface MainPanelProps {}

export default function MainPanel({}: MainPanelProps) {
 const [showApiModal, setShowApiModal] = useState(false);
 const [apiKeyInput, setApiKeyInput] = useState('');
  const [open, setOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'gemini-2.0-flash'>('gemini-2.0-flash');
  const storage = new TStorage<{apiKey: string, model: string}>();

  useEffect(() => {
    try {
      const m = (storage.getItem('model') as any) || '';
      const k = (storage.getItem('apiKey') as any) || '';
      if (m === 'gpt-4o') {
        setSelectedModel('gpt-4o');
      } else if (m === 'gemini-2.0-flash') {
        setSelectedModel('gemini-2.0-flash');
      }
      if (typeof k === 'string') setApiKeyInput(k);
    } catch {}
  }, []);
  const toggleMenu = () => {
    setOpen(!open);
  }

  const clearApiKey = () => {
    storage.removeItem('apiKey');
    storage.removeItem('model');
    
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
                <div className="flex items-center gap-2 pb-4  ">
                   <Info className="size-5 mb-5" /> 
                  <span className="text-xs text-neutral-700 leading-relaxed">
                
                    API keys are stored locally in your browser.
                  
                
                    Get a key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">here</a>
                  </span>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-neutral-700 mb-1">Model</div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setModelMenuOpen(v => !v)}
                        className="w-full flex items-center justify-between border border-neutral-300 rounded-md px-2 py-1 text-xs bg-white cursor-pointer"
                      >
                        <span>{selectedModel === 'gpt-4o' ? 'GPT-4o' : 'Google (Gemini)'}</span>
                        <svg viewBox="0 0 16 16" className="w-3 h-3"><path d="M3.5 6l4 4 4-4" fill="currentColor"/></svg>
                      </button>
                      {modelMenuOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedModel('gpt-4o');
                              storage.setItem('model', 'gpt-4o');
                              setModelMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 rounded-t-md ${selectedModel === 'gpt-4o' ? 'bg-neutral-50' : ''} cursor-pointer`}
                          >
                            GPT-4o
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedModel('gemini-2.0-flash');
                              storage.setItem('model', 'gemini-2.0-flash');
                              setModelMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 rounded-b-md ${selectedModel === 'gemini-2.0-flash' ? 'bg-neutral-50' : ''} cursor-pointer`}
                          >
                            Google (Gemini)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    try {
                      storage.setItem('model', selectedModel);
                    } catch {}
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
                      storage.setItem('apiKey', e.target.value);
                    }}
                  />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1 rounded bg-neutral-700 text-white hover:bg-neutral-800 w-full cursor-pointer"
                  >
                    Save
                  </button>
                </form>
                <div className="flex items-center justify-center mt-1">
                  <button
                  onClick={clearApiKey}
                  className="flex item-center text-xs justify-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-full cursor-pointer">
                    
                    Clear 
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
}