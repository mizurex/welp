"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { Space_Grotesk } from "next/font/google";
import TopPanel from "./menu/top-panel";
import { loadPlan, savePlan } from "@/dexie/db";
import { useThreadStore } from "@/stores/thread-store";
import { Button } from "./ui/button";
import { ArrowUpRight, Info, Loader2 } from "lucide-react";
import MascotDotFace from "./decor/mascot";
import Flips from "./ui/flips";
import MainPanel from "./menu/main-panel";
import { generatePlan } from "@/lib/api/generate";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const nodeTypes = {
  custom: CustomNode,
};

interface chatPageProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export default function ChatPage({
  initialNodes = [],
  initialEdges = [],
}: chatPageProps) {
  const { currentThreadId, init, createNewThread } = useThreadStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const PLAN_DAYS = 3;
  
  const [requestError, setRequestError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

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

  const persist = async () => {
    if (!currentThreadId) return;
    const { nodes: safeNodes, edges: safeEdges } = serializeGraph(
      nodes as any[],
      edges as any[]
    );
    await savePlan(currentThreadId, {
      nodes: safeNodes,
      edges: safeEdges,
      content,
      days: PLAN_DAYS,
      savedAt: new Date().toISOString(),
    });
  };

  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  

  useEffect(() => {
    init();
  }, [init]);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  useEffect(() => {
    if (!currentThreadId) return;
    const PlanLoad = async () => {
      const plan = await loadPlan(currentThreadId);
      if (plan) {
        setNodes(plan.nodes);
        setEdges(plan.edges);
        setContent(plan.content || "");
     
      } else {
        setNodes([]);
        setEdges([]);
        setContent("");
      }
    };
    PlanLoad();
  }, [currentThreadId]);

  useEffect(() => {
    if (!hasHydrated) return;
    const id = setTimeout(() => {
      persist();
    }, 400); //debounce
    return () => clearTimeout(id);
  }, [nodes, edges, content, hasHydrated, currentThreadId]);

  const handleClearAll = () => {
    setNodes([]);
    setEdges([]);
    setContent("");
    // no local storage, Dexie plan will be overwritten by next persist
  };

  const handleExport = () => {
    const flowData = {
      nodes,
      edges,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  

  const onGenerate = async () => {
    if (!content.trim()) return;
    if (requestError) setRequestError("");
    setIsLoading(true);
    try {
      if (!currentThreadId) {
        await createNewThread();
      }
      const data = await generatePlan(content);
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err: any) {
      setRequestError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen">
      {nodes.length === 0 ? (
        <div className="absolute inset-0 bg-white" />
      ) : (
        <div
          className="
    absolute inset-0 bg-white
    before:absolute before:inset-0
    before:bg-[repeating-linear-gradient(315deg,#e5e7eb_0,#d1d5db_0.5px,transparent_0,transparent_50%)]
    before:bg-[length:8px_8px]"
        />
      )}
      {nodes.length === 0 && (
        <>
          <main className="">
            <div className="fixed top-2 left-2 z-30">
              <MainPanel />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-transparent min-w-[700px] relative">
                <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="relative px-3 py-1 rounded-full text-sm bg-white border border-neutral-300 shadow-[2px_3px_rgba(0,0,0,0.1)]">
                    <span className="text-secondary-foreground">
                      Ready to
                      <Flips />
                    </span>
                    <div className="absolute left-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white "></div>
                  </div>
                  <MascotDotFace size={42} />
                </div>
                <div className="rounded-2xl bg-white/80 backdrop-blur">
                  <div className="px-4 pt-4 pb-1 text-[13px] text-muted-foreground">
                    Ask a question…
                  </div>
                  <div className="px-2 pb-4">
                    <div className="rounded-xl bg-[#f5f5f5] border border-neutral-200 px-3 py-2">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="e.g. Learn React from basics"
                        className="w-full text-secondary-foreground h-20 resize-none bg-transparent focus:outline-none text-[13px]"
                        maxLength={350}
                      />
                      {requestError && (
                        <div className="mt-2 text-[11px] text-red-600 flex items-center gap-2 px-2 rounded">
                          <Info className="w-3 h-3" /> {requestError}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-end">
                      
                        <Button
                          className="py-2 px-2.5 w-fit"
                          onClick={onGenerate}
                          disabled={isLoading || !content.trim()}
                        >
                        {isLoading?(
                        <span className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </span>
                          <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-600 to-white animate-[shimmer_1.1s_linear_infinite] font-semibold">
                            Generating
                          </span>
                          <style jsx>{`
                            @keyframes shimmer {
                              0% {
                                background-position: -200% 0;
                              }
                              100% {
                                background-position: 200% 0;
                              }
                            }
                            .animate-\[shimmer_1\.1s_linear_infinite\] {
                              background-size: 200% auto;
                              animation: shimmer 1.1s linear infinite;
                            }
                          `}</style>
                        </span>
                          ):(
                          <span className="flex items-center gap-2 text-sm">                           
                            <ArrowUpRight className="w-4 h-5" />
                          </span>
                          )}
                          
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3 items-center">
                  <div className="text-xs text-neutral-600 mb-1">
                    Suggestions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "React hooks overview",
                      "JavaScript fundamentals",
                      "SQL fundamentals",
                      "System design basics",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setContent(s)}
                        className="px-2 py-1 text-secondary-foreground rounded-md text-xs cursor-pointer hover:bg-neutral-100"
                        style={{
                          background: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="text-secondary-foreground">Helpful:</span>
                  <a
                    href="https://react.dev/learn"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    React docs
                  </a>
                  <a
                    href="https://roadmap.sh"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    Roadmaps
                  </a>
                  <a
                    href="https://developer.mozilla.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:opacity-80"
                  >
                    MDN
                  </a>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {nodes.length > 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes as any}
          defaultEdgeOptions={{ type: 'bezier', animated: false }}
          fitView
          className="touchdevice-flow"
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="transparent"
            bgColor="transparent"
          />
          <TopPanel
            menuOpen={menuOpen}
            onToggleMenu={handleMenuOpen}
            onClear={handleClearAll}
            onExport={handleExport}
          />
        </ReactFlow>
      )}
    </div>
  );
}
