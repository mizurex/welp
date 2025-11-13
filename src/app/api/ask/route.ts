import { google } from "@ai-sdk/google";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText} from "ai";


export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();
    const userPrompt = (typeof prompt === 'string' ? prompt : '').trim();
    const nodeContext = (typeof context === 'string' ? context : '').trim();
    if (!userPrompt) {
      return Response.json({ success: false, message: 'Empty prompt' }, { status: 400 });
    }
  
  

    const system = `You are a helpful tutor. Keep answers concise, practical, and accurate.
If context is provided, prefer it and explicitly tie explanations back to it.`;

    const composed = `${system}

Context (may be empty):\n${nodeContext}

User: ${userPrompt}`;

const userKey = req.headers.get('api-key')?.trim() || ''
const provider = userKey ? createGoogleGenerativeAI({ apiKey: userKey }) : google

const { text } = await generateText({
  model: provider('gemini-2.0-flash'),
  prompt: composed,
})

return Response.json({ success: true, text })

  } catch (e: any) {
    return Response.json({ success: false, message: e?.message || 'Failed' }, { status: 500 });
  }
}


