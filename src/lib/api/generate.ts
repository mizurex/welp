export async function generatePlan(content: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed');
    return data; 
  }