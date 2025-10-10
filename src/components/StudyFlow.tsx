// components/StudyFlow.tsx
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { Space_Grotesk } from "next/font/google";
import { Instrument_Serif } from 'next/font/google';
import LoadingCard from '@/components/loading-card';
import TopPanel from '@/components/menu/TopPanel';
import InputCard from '@/components/input/InputCard';
import { serializeGraph, storageClear, storageLoad, storageSave } from '@/lib/storage';
import { createThread, listThreads, loadPlan, savePlan } from '@/lib/db';

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"] });
const nodeTypes = {
  custom: CustomNode,
};

interface StudyFlowProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export default function StudyFlow({ initialNodes = [], initialEdges = [] }: StudyFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [days, setDays] = useState(7);
  const [daysInput, setDaysInput] = useState('7');
  const [daysError, setDaysError] = useState('');


  const [menuOpen, setMenuOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<{ id: string; name: string }[]>([]);

  const serializeGraph = (ns: any[], es: any[]) => {
    try {
      const safeNodes = (ns || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));
      const safeEdges = (es || []).map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        label: e.label,
        animated: e.animated,
        style: e.style,
      }));
      return { nodes: safeNodes, edges: safeEdges };
    } catch {
      return { nodes: [], edges: [] };
    }
  };

  const persist = async (payload: unknown) => {
    storageSave(payload);
    if (currentThreadId) {
      const { nodes: safeNodes, edges: safeEdges } = serializeGraph(nodes as any[], edges as any[]);
      await savePlan(currentThreadId, { nodes: safeNodes, edges: safeEdges, content, days, savedAt: new Date().toISOString() });
    }
  };

  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const processContent = async () => {
  if(!content.trim()) return;
  if(days<1 || days>7) return;
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat",{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({content, daysBeforeExam: days})
      })

      const data = await response.json();
      if(!data.success) return;
     

        setNodes(data.nodes);
        setEdges(data.edges);

        const daysArray = Array.isArray(data.studyPlan?.days) ? data.studyPlan.days : [];

        const totalTopics = daysArray.reduce((acc: number, day: any) => {
          const topics = Array.isArray(day?.topics) ? day.topics : [];
          return acc + topics.length;
        }, 0);

        const totalTime = daysArray.reduce((sum: number, day: any) => {
          if (typeof day?.totalMinutes === 'number') return sum + day.totalMinutes;
          const topics = Array.isArray(day?.topics) ? day.topics : [];
          const minutesFromTopics = topics.reduce((t: number, topic: any) => t + (typeof topic?.estimatedMinutes === 'number' ? topic.estimatedMinutes : 0), 0);
          return sum + minutesFromTopics;
        }, 0);

       
        const { nodes: safeNodes, edges: safeEdges } = serializeGraph(data.nodes, data.edges);
        persist({
          nodes: safeNodes,
          edges: safeEdges,
          studyStats: { totalTopics, completedTopics: 0, totalTime },
          content,
          days,
          savedAt: new Date().toISOString(),
        });
      
    } catch (error) {
      console.error('Error processing content..', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const ts = await listThreads();
        if (ts.length === 0) {
          const id = await createThread('Thread 1');
          setCurrentThreadId(id);
          setThreads([{ id, name: 'Thread 1' }]);
        } else {
          setThreads(ts.map(t => ({ id: t.id, name: t.name })));
          setCurrentThreadId(ts[0].id);
          const plan = await loadPlan(ts[0].id);
          if (plan) {
            setNodes(plan.nodes as any);
            setEdges(plan.edges as any);
            setContent(plan.content || '');
            setDays(typeof plan.days === 'number' ? plan.days : 7);
            setDaysInput(String(typeof plan.days === 'number' ? plan.days : 7));
          }
        }
      } catch {}
    })();
  }, []);

  useEffect(() => { setHasHydrated(true); }, []);

  useEffect(() => {
    const existing = storageLoad();
    if (!existing) {
      persist({ nodes, edges, content, days, savedAt: new Date().toISOString() });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === 'undefined') return;
        if (!hasHydrated) return;
        await persist({ nodes, edges, content, days, savedAt: new Date().toISOString() });
      } catch {}
    })();
  }, [nodes, edges, content, days, hasHydrated, currentThreadId]);

  const handleClearAll = () => {
    setNodes([]);
    setEdges([]);
    setContent('');
    storageClear();
  };

  const handleExport = () => {
    const flowData = {
      nodes,
      edges,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  React.useEffect(() => {
    nodes.filter(n => 
      n.data.nodeType === 'topic' && n.data.isCompleted
    ).length;
  }, [nodes]);

  return (
    <div className="w-full h-screen ">
<div
  className="
    absolute inset-0 bg-white
    before:absolute before:inset-0
    before:bg-[repeating-linear-gradient(315deg,#e5e7eb_0,#d1d5db_0.5px,transparent_0,transparent_50%)]
    before:bg-[length:8px_8px]
  "
/>
      {nodes.length === 0 && (
        <>
          <div className="absolute inset-0 z-10 bg-white backdrop-blur-md" />
          {isLoading ? (
            <LoadingCard/>
          ) : (
            <InputCard
              content={content}
              setContent={setContent}
              daysInput={daysInput}
              setDaysInput={setDaysInput}
              daysError={daysError}
              setDays={setDays}
              setDaysError={setDaysError}
              isLoading={isLoading}
              onSubmit={processContent}
            />
          )}
        </>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes as any}
        fitView
        className="touchdevice-flow"
      >
        <Background variant={BackgroundVariant.Dots} color="transparent" bgColor="transparent" />
        
        <Controls className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg" />
        {nodes.length > 0 && (
          <TopPanel
            menuOpen={menuOpen}
            onToggleMenu={handleMenuOpen}
            onClear={handleClearAll}
            onNew={async () => { 
              const id = await createThread(`Thread ${threads.length + 1}`);
              setCurrentThreadId(id);
              setThreads(prev => [{ id, name: `Thread ${prev.length + 1}`}, ...prev]);
              setNodes([]);
              setEdges([]);
              setContent('');
            }}
            onExport={handleExport}
            threads={threads}
            currentThreadId={currentThreadId}
            onSelectThread={async (id: string) => {
              setCurrentThreadId(id);
              const plan = await loadPlan(id);
              if (plan) {
                setNodes(plan.nodes as any);
                setEdges(plan.edges as any);
                setContent(plan.content || '');
                setDays(typeof plan.days === 'number' ? plan.days : 7);
                setDaysInput(String(typeof plan.days === 'number' ? plan.days : 7));
              } else {
                setNodes([]);
                setEdges([]);
                setContent('');
              }
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}