export async function generatePlan(content: string, apiKey: string, model: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' , 'api-key': apiKey , 'model': model},
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed');
    return data; 
  }