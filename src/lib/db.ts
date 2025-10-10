import Dexie, { Table } from 'dexie';

export interface Thread {
  id: string; // primary key
  name: string;
  updatedAt: string;
}

export interface PlanData {
  nodes: any[];
  edges: any[];
  content: string;
  days: number;
  savedAt: string;
}

export interface Plan {
  threadId: string; // primary key
  data: PlanData;
}

class WelpDB extends Dexie {
  threads!: Table<Thread, string>;
  plans!: Table<Plan, string>;

  constructor() {
    super('welp');
    this.version(1).stores({
      threads: 'id, updatedAt',
      plans: 'threadId'
    });
  }
}

export const db = new WelpDB();

export async function createThread(name = 'New thread') {
  const id = `t_${Date.now()}`;
  const now = new Date().toISOString();
  await db.threads.add({ id, name, updatedAt: now });
  await db.plans.put({ threadId: id, data: { nodes: [], edges: [], content: '', days: 7, savedAt: now } });
  return id;
}

export async function listThreads(): Promise<Thread[]> {
  return db.threads.orderBy('updatedAt').reverse().toArray();
}

export async function loadPlan(threadId: string): Promise<PlanData | null> {
  const p = await db.plans.get({ threadId });
  return p?.data ?? null;
}

export async function savePlan(threadId: string, data: PlanData) {
  await db.plans.put({ threadId, data });
  await db.threads.update(threadId, { updatedAt: new Date().toISOString() });
}


