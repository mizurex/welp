import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import dagre from "dagre";

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

function buildTeachingPrompt(content: string, daysBeforeExam: number) {
  const compressionLevel = daysBeforeExam <= 7 ? "low" : daysBeforeExam <= 14 ? "medium" : "high";
  const topicsPerDay = daysBeforeExam <= 7 ? "2-3" : daysBeforeExam <= 14 ? "3-5" : "4-6";

  return `
You are a master teacher and curriculum designer. Create a crystal-clear, step-by-step ${daysBeforeExam}-day study plan that TEACHES deeply (not just lists syntax).

Teaching Principles (FOLLOW STRICTLY):
- Be concise, specific, and practical. No fluff.
- For every TOPIC:
  1) Explain the concept 7-8 sentences (why it matters, how it works).
  2) Show ONE minimal, runnable code example when the concept is programming-related.
     - Use correct language fences (\`\`\`ts, \`\`\`js, \`\`\`py, etc.)
     - code should clear and easy to understand.
  3) Give a short 3-5 step walkthrough (how to apply it mentally or in code).
  4) Practice tasks are OPTIONAL (0-2). Include them only if they truly add value.
- For SUBTOPICS: 1-3 sentence explanation. Include code snippet only if it clarifies the idea.
- Use simple language so a beginner can follow.

Compression Rules (${compressionLevel.toUpperCase()}):
- Topics per day: ${topicsPerDay}
- Keep the tree width reasonable. Combine small topics under themed sessions.

Structure Requirements:
- days[] ordered: fundamentals → intermediate → advanced → review
- Each day: dayNumber, dayTitle, topics[], totalMinutes
- Each topic: id, title, content (teaching text as above), estimatedMinutes, subtopics[] (2-5), practiceTasks[] (0-2, optional)
- Each subtopic: id, title, content (1-3 sentences), estimatedMinutes?, practiceTasks? (0-1, optional)

Content to teach:
${content}

Important:
- Don’t skip subtopics. Every topic must have 2-5 subtopics.
- Prefer short, runnable code examples over abstract descriptions when relevant.
- Always write clear, direct, beginner-friendly text.
`;
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const daysBeforeExam = 2; 

  
    const IntentSchema = z.object({ intent: z.enum(['ok', 'image', 'nonsense']) });
    const intentResult = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: IntentSchema,
      prompt: `You are a strict intent classifier for a study-plan builder.\nReturn JSON with {"intent": "ok" | "image" | "nonsense"}.\n- Use "image" if the user asks to create/generate/provide an image, picture, logo, or references formats like png/jpg/svg.\n- Use "nonsense" if the request is unintelligible or not a meaningful topic/question.\n- Otherwise use "ok".\nUser request: "${content}"`,
    });
    if (intentResult.object.intent === 'image') {
      return Response.json(
        { success: false, error: 'UNSUPPORTED_INTENT', message: 'Welp does not support image generation' },
        { status: 400 }
      );
    }
    if (intentResult.object.intent === 'nonsense') {
      return Response.json(
        { success: false, error: 'INVALID_REQUEST', message: 'Please ask a clear study topic.' },
        { status: 400 }
      );
    }

  
    const compressionLevel = "low";
    const topicsPerDay = "2-3";


    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: StudyPlanSchema,
      prompt: buildTeachingPrompt(content, daysBeforeExam),
    });

  
    const flowNodes: any[] = [];
    const flowEdges: any[] = [];
  

    // Create root node
    const rootId = "root";
    flowNodes.push({
      id: rootId,
      type: "custom",
      position: { x: 0, y: 0 },
      data: {
        label: `${object.totalDays}-Day Study Plan`,
        content: object.summary,
        nodeType: "root",
        isRoot: true,
      },
    });

    // Create day nodes
    object.days.forEach((day, dayIndex) => {
      const dayId = `day-${day.dayNumber}`;
      
      flowNodes.push({
        id: dayId,
        type: "custom",
        position: { x: 0, y: 0 },
        data: {
          label: day.dayTitle || `Day ${day.dayNumber}`,
          content: `${day.topics.length} topics • ${day.totalMinutes} min total`,
          nodeType: "day",
          day: `Day ${day.dayNumber}`,
          dayNumber: day.dayNumber,
        },
      });

      // Connect root to day
      flowEdges.push({
        id: `edge-root-${dayId}`,
        source: rootId,
        target: dayId,
        type: "smoothstep",
        animated: false,
        style: { 
          stroke: "#3b82f6", 
          strokeWidth: 2,
        },
      });

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
            day: `Day ${day.dayNumber}`,
            dayNumber: day.dayNumber,
            practiceTasks: topic.practiceTasks,
          },
        });

        // Connect day to topic
        flowEdges.push({
          id: `edge-${dayId}-${topicId}`,
          source: dayId,
          target: topicId,
          type: "smoothstep",
          animated: false,
          style: { 
            stroke: "#10b981", 
            strokeWidth: 1.5,
          },
        });

        // Create subtopic nodes
        if (topic.subtopics && topic.subtopics.length > 0) {
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
                day: `Day ${day.dayNumber}`,
                dayNumber: day.dayNumber,
                practiceTasks: subtopic.practiceTasks,
              },
            });

            // Connect topic to subtopic
            flowEdges.push({
              id: `edge-${topicId}-${subtopicId}`,
              source: topicId,
              target: subtopicId,
              type: "smoothstep",
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
      rankdir: "TB",      // Top to Bottom for tree structure
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
    
    const layoutedNodes = flowNodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      const nodeWidth = dagreNode.width;
      const nodeHeight = dagreNode.height;
      
      return {
        ...node,
        position: {
          x: dagreNode.x - nodeWidth / 2,
          y: dagreNode.y - nodeHeight / 2,
        },
        targetPosition: "top",
        sourcePosition: "bottom",
      };
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