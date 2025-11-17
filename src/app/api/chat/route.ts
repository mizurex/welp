import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import dagre from "dagre";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai } from "@ai-sdk/openai"
import { createOpenAI } from '@ai-sdk/openai';

const SubtopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  estimatedMinutes: z.number().optional(),
  practiceTasks: z.array(z.string()).optional(),
});

const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  estimatedMinutes: z.number(),
  subtopics: z.array(SubtopicSchema),
  practiceTasks: z.array(z.string()).optional(),
});

const DaySchema = z.object({
  dayNumber: z.number(),
  dayTitle: z.string(),
  topics: z.array(TopicSchema),
  totalMinutes: z.number(),
});

const StudyPlanSchema = z.object({
  days: z.array(DaySchema),
  totalDays: z.number(),
  summary: z.string(),
});


export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    if(!content || content.trim().length <= 3){
      return Response.json(
        { success: false, message: 'Please enter a valid study topic.' },
        { status: 400 }
      );
    }

    const main_prompt =  `
You are a master teacher and curriculum designer. Create a compact, section-based concept map (no "day" wording anywhere).

Goals:
- Keep the graph small but strong: 3–4 sections total, each with ~2 topics, each topic with 1–2 subtopics.
- Make each topic node richer so we need fewer nodes overall.

Teaching Principles (FOLLOW STRICTLY):
- Be concise, specific, and practical. No fluff.
- For every TOPIC node:
  1) Write 120–160 words that explain what/why/how in plain English.
  2) Provide ONE compact, concrete example appropriate to the domain:
     - Programming: minimal runnable code with correct fence (\`\`\`ts|js|py|go|java\`\`\`)
     - SQL: fenced \`\`\`sql using specific columns (never SELECT *), with WHERE and JOIN/GROUP BY when useful
     - DS&A: pseudocode plus time/space complexity
     - Math: formula plus a tiny worked numeric example
     - APIs: JSON request/response or cURL
     - System design: tiny ASCII diagram or bullet-point architecture
  3) Add a 3–5 step micro-walkthrough (short bullets).
  4) Practice tasks OPTIONAL (0–2), only if truly useful.
- For SUBTOPIC nodes: 1–2 sentences; code only if it clarifies.
- Use simple language for beginners.

Structure Requirements (Map these onto the provided JSON schema):
- days[] will represent SECTIONS (use for grouping only; do not write the word "Day").
- Each section (days[i]): dayNumber (for order), dayTitle (concise section name, no "Day"), topics[], totalMinutes.
- Each topic: id, title, content (as above), estimatedMinutes (aim 20–40), subtopics[] (1–2), practiceTasks[] (0–2, optional).
- Each subtopic: id, title, content (1–2 sentences), estimatedMinutes?, practiceTasks? (0–1, optional).

Style & Constraints:
- Never include phrases like "Day 1", "2-day plan", or anything time-based in titles. Use clear section names instead.
- Prefer fewer, richer nodes over many thin nodes.
- Examples must demonstrate practical patterns.
- Examples must be domain-appropriate; prefer specificity over placeholders.

Content to teach:
${content}

Return JSON only that satisfies the schema.
`;

const intent_prompt =  `
Classify this user request for a study plan app:

"${content}"

Return only one word:
- ok -> if it’s a clear learning topic
- image -> if user asks for image/logo/picture/svg/png/jpg any image related request
- nonsense -> if it’s unclear or irrelevant
`;
  
   const userKey = req.headers.get('api-key')?.trim() || ''
   const model:string = req.headers.get('model')?.trim() || 'gemini-2.0-flash'
   const isOpenAI = model.toLowerCase().startsWith('gpt')
   let provider : any;
   if (isOpenAI) {
     if (!userKey) {
       return Response.json(
         { success: false, message: 'OpenAI model selected but no api-key header provided.' },
         { status: 400 }
       );
     }
     provider = createOpenAI({ apiKey: userKey });
   } else {
     provider = userKey ? createGoogleGenerativeAI({ apiKey: userKey }) : google;
   }

   

  const intentModel = isOpenAI ? 'gpt-4o-mini' : 'gemini-2.0-flash';
  const intent = await generateText({
    model: provider(intentModel),
    prompt: intent_prompt,
  });

const normalized = intent.text.trim().toLowerCase();

if (normalized.includes('image')) {
  return Response.json(
    { success: false, message: 'Welp does not support image generation.' },
    { status: 400 }
  );
}

if (normalized.includes('nonsense')) {
  return Response.json(
    { success: false, message: 'Please ask a clear study topic.' },
    { status: 400 }
  );
}

  
    const compressionLevel = "low"; //imp

    const { object } = await generateObject({
      model: provider(model),
      schema: StudyPlanSchema,
      prompt: main_prompt,
    })

  
    const flowNodes: any[] = [];
    const flowEdges: any[] = [];
  


    // Create day nodes
    object.days.forEach((day, dayIndex) => {
      const dayId = `day-${day.dayNumber}`;

      flowNodes.push({
        id: dayId,
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          label: day.dayTitle,
          content: `${day.topics.length} sections • ~${day.totalMinutes} min`,
          nodeType: "day",
          day: day.dayTitle,
          dayNumber: day.dayNumber,
        },
      });
      // (No root-to-day edge per new design)

      // Create topic nodes for this day
      day.topics.forEach((topic, topicIndex) => {
        const topicId = topic.id || `topic-${day.dayNumber}-${topicIndex}`;
        
        flowNodes.push({
          id: topicId,
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            label: topic.title,
            content: topic.content,
            estimatedTime: `${topic.estimatedMinutes} min`,
            nodeType: "topic",
            day: day.dayTitle,
            dayNumber: day.dayNumber,
            practiceTasks: topic.practiceTasks,
          },
        });

      // Connect day to topic
        flowEdges.push({
          id: `edge-${dayId}-${topicId}`,
          source: dayId,
          target: topicId,
        type: "bezier",
          animated: false,
          style: { 
            stroke: "#10b981", 
            strokeWidth: 1.5,
          },
        });
        if (topic.subtopics && topic.subtopics.length > 0) {
          const siblingCount = topic.subtopics.length;
          topic.subtopics.forEach((subtopic, subIndex) => {
            const subtopicId = subtopic.id || `sub-${day.dayNumber}-${topicIndex}-${subIndex}`;

            flowNodes.push({
              id: subtopicId,
              type: "custom",
              position: { x: 0, y: 0 },
              data: {
                label: subtopic.title,
                content: subtopic.content,
                estimatedTime: subtopic.estimatedMinutes ? `${subtopic.estimatedMinutes} min` : undefined,
                nodeType: "subtopic",
                day: day.dayTitle,
                dayNumber: day.dayNumber,
                practiceTasks: subtopic.practiceTasks,
                parentId: topicId,
                subIndex,
                siblingCount,
              },
            });

            // Connect topic to subtopic with curved connector
            flowEdges.push({
              id: `edge-${topicId}-${subtopicId}`,
              source: topicId,
              target: subtopicId,
              type: "bezier",
              animated: false,
              style: {
                stroke: "#64748b",
                strokeWidth: 1.2,
                strokeDasharray: "3 3",
              },
            });
          });
        }
      });
    });


    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    //  vertical tree layout
    dagreGraph.setGraph({
      rankdir: "TB",      
      ranksep: 120,       
      nodesep: 80,     
      marginx: 50,
      marginy: 50,
      acyclicer: "greedy",
      ranker: "tight-tree"
    });
    
    // Define node sizes based on type
    flowNodes.forEach((node) => {
      let width, height;
      switch (node.data.nodeType) {
        case "root":
          width = 300;
          height = 80;
          break;
        case "day":
          width = 250;
          height = 70;
          break;
        case "topic":
          width = 220;
          height = 90;
          break;
        case "subtopic":
          width = 180;
          height = 70;
          break;
        default:
          width = 200;
          height = 80;
      }
      dagreGraph.setNode(node.id, { width, height });
    });
    
    // Add edges to dagre
    flowEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
 
    dagre.layout(dagreGraph);
    
    const prelimNodes = flowNodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      const nodeWidth = dagreNode?.width ?? 200;
      const nodeHeight = dagreNode?.height ?? 80;
      return {
        ...node,
        position: {
          x: (dagreNode?.x ?? 0) - nodeWidth / 2,
          y: (dagreNode?.y ?? 0) - nodeHeight / 2,
        },
        targetPosition: "top",
        sourcePosition: "bottom",
      } as any;
    });

    // Adjust detached subtopics to sit to the right of their parent topic, stacked vertically
    const nodeById: Record<string, any> = Object.fromEntries(prelimNodes.map((n: any) => [n.id, n]));
    const sideOffsetX = 300;  
    const verticalStep = 90;
    const layoutedNodes = prelimNodes.map((n: any) => {
      if (n?.data?.nodeType === "subtopic" && n?.data?.parentId && nodeById[n.data.parentId]) {
        const parent = nodeById[n.data.parentId];
        const count = typeof n.data.siblingCount === 'number' ? n.data.siblingCount : 1;
        const index = typeof n.data.subIndex === 'number' ? n.data.subIndex : 0;
        const centerOffset = (count - 1) * verticalStep / 2;
        return {
          ...n,
          position: {
            x: parent.position.x + sideOffsetX,
            y: parent.position.y - centerOffset + index * verticalStep,
          },
        };
      }
      return n;
    });

    const layoutedEdges = flowEdges.map((edge) => ({
      ...edge,
      markerEnd: {
        type: "arrowclosed",
        width: 15,
        height: 15,
      },
    }));

    return Response.json({
      nodes: layoutedNodes,
      edges: layoutedEdges,
      studyPlan: object,
      success: true,
      metadata: {
        totalNodes: layoutedNodes.length,
        totalDays: object.totalDays,
        compressionLevel,
        nodesPerDay: Math.floor(layoutedNodes.length / object.totalDays),
      }
    });
  } catch (error) {
    console.error("Error generating structured study plan:", error);
    return Response.json(
      { 
        error: "Failed to generate structured study plan", 
        details: error instanceof Error ? error.message : "Unknown error",
        success: false 
      },
      { status: 500 }
    );
  }
}