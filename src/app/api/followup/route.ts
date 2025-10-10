import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { content, followup } = await req.json();
    if (typeof content !== 'string' || !content.trim()) {
      return Response.json({ error: 'Missing content' }, { status: 400 });
    }
    if (typeof followup !== 'string' || !followup.trim()) {
      return Response.json({ error: 'Missing followup question' }, { status: 400 });
    }

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a patient expert teacher. The user is studying a topic node from a study plan.

Node content (context):
"""
${content}
"""

User follow-up question:
"""
${followup}
"""

Please answer in clear, concise Markdown (aim for ~40-50 words total):
- Start with a one-sentence summary in simple words
- Then give a short step-by-step explanation (3-5 steps)
- Include a tiny example
- If code helps, add a minimal fenced code block with the right language tag
- Keep it focused, practical, and easy to follow
- Avoid long paragraphs; use short bullets and keep it tight
      `,
    });

    return Response.json({ answer: text }, { status: 200 });
  } catch (error) {
    console.error("Error generating followup:", error);
    return Response.json({ error: "Failed to generate followup" }, { status: 500 });
  }
}