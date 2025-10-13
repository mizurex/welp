'use client';
import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import Image from 'next/image';
import { NotebookPen,Ellipsis } from 'lucide-react';
import dynamic from 'next/dynamic';
const MarkdownRenderer = dynamic(() => import('./markdown-renderer'), { ssr: false });

export interface CustomNodeData {
  label: string;
  content: string;
  day: string;
  estimatedTime: string;
  isCompleted: boolean;
  nodeType: 'topic' | 'subtopic';
  practiceTasks?: string[];
  isNote?: boolean;
}

type CustomNodeProps = NodeProps & {
  data: CustomNodeData;
  xPos: number;
  yPos: number;
};

const CustomNode = memo(({ id, data, isConnectable, xPos, yPos }: CustomNodeProps) => {
  const { addNodes, addEdges } = useReactFlow();
  const [isCompleted, setIsCompleted] = useState(data.isCompleted);
  const [showDetails, setShowDetails] = useState(false);
  const [openInMenu, setOpenInMenu] = useState(false);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleted(!isCompleted);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const handleAddNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const noteId = `note-${id}-${Date.now()}`;
    addNodes([{
      id: noteId,
      type: 'custom',
      // place the note slightly below the current node
      position: { x: (typeof xPos === 'number' ? xPos : 0), y: (typeof yPos === 'number' ? yPos : 0) + 140 },
      data: {
        label: 'Note',
        nodeType: 'subtopic',
        day: data.day,
        estimatedTime: '',
        isCompleted: false,
        isNote: true,
      },
    }]);
    addEdges([{
      id: `edge-${id}-${noteId}`,
      source: id,
      target: noteId,
      type: 'smoothstep',
    }]);
  };


  const buildPrompt = (): string => {
    const practice = Array.isArray(data.practiceTasks) && data.practiceTasks.length
      ? `\nPractice Tasks:\n- ${data.practiceTasks.slice(0, 5).join('\n- ')}`
      : '';
    return `Explain this topic with steps and a concrete example.\nTitle: ${data.label}\nContent: ${data.content}${practice}`;
  };

  const openWithProvider = (provider: 'chatgpt' | 'claude' | 'grok', e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = buildPrompt();
    try { navigator.clipboard?.writeText(prompt); } catch {}
    let url = '';
    switch (provider) {
      case 'chatgpt':
        url = `https://chatgpt.com/?hints=search&prompt=${encodeURIComponent(prompt)}`;
        break;
      case 'claude':
        url = `https://claude.ai/new?text=${encodeURIComponent(prompt)}`;
        break;
      case 'grok':
        url = `https://grok.com/?q=${encodeURIComponent(prompt)}`;
        break;
    }
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) {
      try { navigator.clipboard?.writeText(prompt); } catch {}
    }
    setOpenInMenu(false);
  };

  const nodeStyles = data.nodeType === 'topic' 
    ? 'bg-[#5a5a5a]  text-white shadow-xl'
    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 shadow-md';

  const completedStyles = isCompleted 
    ? 'ring-3 ring-[#7cff3f]' 
    : '';

  return (
    <div 
      className={`
        relative rounded-lg p-4 min-w-[200px] max-w-[300px] 
        transition-all duration-300 transform hover:scale-105
        ${nodeStyles} ${completedStyles}
        cursor-pointer select-none
      `}
      onClick={handleExpand}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1 line-clamp-2">
            {data.label}
          </h3>
          <div className="flex gap-2 text-xs opacity-90">
            <span className="gap-3 bg-white/40 backdrop-blur-md rounded-lg border border-white/20  px-2 cursor-pointer py-1 text-xs transition-colors flex items-center justify-between border border-white/90">
              {data.day}
            </span>
            {data.estimatedTime && (
              <span className="gap-3 bg-white/40 backdrop-blur-md rounded-lg border border-white/20  px-2 cursor-pointer py-1 text-xs transition-colors flex items-center justify-between border border-white/90">
                {data.estimatedTime}
              </span>
            )}
          </div>
        </div> 
        <button  //checkbox
          onClick={handleComplete}
          className={`
            w-4 h-4 rounded-full border-1 ml-3 mt-0.5 flex items-center cursor-pointer justify-center
            ${isCompleted 
              ? '' 
              : 'border-black hover:border-gray-400'
            }
            transition-colors duration-200
          `}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-neutral-300">
          {data.isNote ? (
            <textarea
              defaultValue={data.content}
              className="w-full text-xs leading-relaxed font-light bg-white/10 rounded p-2 border border-white/20"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                (data as any).content = e.target.value;
              }}
            />
          ) : (
            <MarkdownRenderer content={data.content} />
          )}
          {Array.isArray(data.practiceTasks) && data.practiceTasks.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold mb-1 opacity-90">Practice</div>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                {data.practiceTasks.slice(0, 4).map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
          )} 
          <div className="mt-3"> 
            {data.isNote ? (
            <div className="flex justify-end relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenInMenu((v) => !v); }}
                className="gap-2 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 px-2 cursor-pointer py-1 text-xs transition-colors flex items-center border border-white/90"
              >
                <span>Open in</span>
                <Ellipsis className="w-3 h-3" />
              </button>
              {openInMenu && (
                <div
                  className="absolute right-0 bottom-full mb-2 w-36 bg-white/40 backdrop-blur-md border border-white/20 rounded-md shadow-md p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                      <button onClick={(e) => openWithProvider('chatgpt', e)} className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-xs text-black flex items-center justify-between hover:shadow-lg hover:brightness-110 cursor-pointer"> ChatGPT <span> <Image src="/openai.svg" alt="ChatGPT" width={10} height={10} /></span>   </button>
                      <button onClick={(e) => openWithProvider('grok', e)} className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-xs text-black flex items-center justify-between hover:shadow-lg hover:brightness-110 cursor-pointer"> Grok <span> <Image src="/grokk.png" alt="Grok" width={10} height={10} /></span>   </button>
                      <button onClick={(e) => openWithProvider('claude', e)} className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-xs text-black flex items-center justify-between hover:shadow-lg hover:brightness-110 cursor-pointer"> Claude <span> <Image src="/anthropic.svg" alt="Claude" width={10} height={10} /></span>   </button>
                </div>
              )}
            </div>
             
            ) : (
              <div className="flex gap-2 mt-3 justify-between items-center">
                 <button
                   onClick={handleAddNote}
                   className="gap-3 flex items-center justify-between px-2 py-1 text-xs cursor-pointer transition-colors rounded-lg"
                   style={{
                     background: 'rgba(255, 255, 255, 0.25)',
                     boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                     backdropFilter: 'blur(12px)',
                     WebkitBackdropFilter: 'blur(12px)',
                     border: '1px solid rgba(255,255,255,0.18)',
                     borderColor: 'rgba(255,255,255,0.25)',
                   }}
                 >
                   <span><NotebookPen className="w-3 h-3" /></span>Notes
              </button>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenInMenu((v) => !v); }}
                    className="gap-2 bg-white/40 backdrop-blur-md rounded-lg border border-white/20 px-2 cursor-pointer py-1 text-xs transition-colors flex items-center border border-white/90"
                    style={{
                      background: 'rgba(255,255,255,0.25)',
                      boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.18)'
                    }}
                  >
                    <span>Open in</span>
                    <Ellipsis className="w-3 h-3" />
                  </button>
                  {openInMenu && (
                    <div
                      className="absolute right-0 bottom-full mb-2 w-36 bg-white/70 backdrop-blur-md border border-white/20 rounded-md shadow-md p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button onClick={(e) => openWithProvider('chatgpt', e)} className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-xs text-black flex items-center justify-between hover:shadow-lg hover:brightness-110 cursor-pointer"> ChatGPT <span> <Image src="/openai.svg" alt="ChatGPT" width={10} height={10} /></span>   </button>
                      <button onClick={(e) => openWithProvider('grok', e)} className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-xs text-black flex items-center justify-between hover:shadow-lg hover:brightness-110 cursor-pointer"> Grok <span> <Image src="/grokk.png" alt="Grok" width={10} height={10} /></span>   </button>
                      <button onClick={(e) => openWithProvider('claude', e)} className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-xs text-black flex items-center justify-between hover:shadow-lg hover:brightness-110 cursor-pointer"> Claude <span> <Image src="/anthropic.svg" alt="Claude" width={10} height={10} /></span>   </button>
                    </div>
                  )}
                </div>
              </div>
             
            )}
          </div>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;