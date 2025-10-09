export const STORAGE_KEY = 'welp.studyPlan.v1';

export type SerializableNode = {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: any;
};

export type SerializableEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
  style?: any;
};

export function serializeGraph(nodes: any[] = [], edges: any[] = []) {
  try {
    const safeNodes: SerializableNode[] = nodes.map((n: any) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    }));
    const safeEdges: SerializableEdge[] = edges.map((e: any) => ({
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
}

export function storageSave(payload: unknown) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // console.debug('[welp] saved', STORAGE_KEY, payload);
  } catch {}
}

export function storageLoad<T = any>(): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageClear() {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}


