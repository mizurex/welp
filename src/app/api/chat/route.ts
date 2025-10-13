import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import dagre from "dagre";

// ----------------------
// 1. Zod Schemas
// ----------------------
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

// ----------------------
// 2. POST Route
// ----------------------
export async function POST(req: Request) {
  try {
    const { content, daysBeforeExam } = await req.json();

    // Determine compression level based on days
    const compressionLevel = daysBeforeExam <= 7 ? "low" : 
                           daysBeforeExam <= 14 ? "medium" : "high";
    
    const topicsPerDay = daysBeforeExam <= 7 ? "2-3" : 
                        daysBeforeExam <= 14 ? "3-5" : "4-6";

    // ----------------------
    // 3. AI Generation
    // ----------------------
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: StudyPlanSchema,
      prompt: `
You are an **expert academic planner** creating a clean, hierarchical study roadmap that will be displayed as a tree structure.

### Task
Organize the material below into a structured study plan over ${daysBeforeExam} days.
${daysBeforeExam > 10 ? `
**IMPORTANT**: Since we have ${daysBeforeExam} days, we need to COMPRESS content to keep the tree manageable:
- Each day should cover ${topicsPerDay} main topics
- Each topic should have 2-4 subtopics maximum
- Group related concepts together aggressively
- Combine smaller topics into larger themed sessions
- Keep the total tree width reasonable (no more than 6 topics per day)
` : `
- Each day should have 2-3 main topics
- Each topic should have 3-5 subtopics
`}

---

### Content to Study
${content}

---

### STRICT STRUCTURAL REQUIREMENTS

1. **Day Structure** (Parent Level):
   - Each day is a major node with a clear title like "Day 1: Fundamentals" or "Day 3: Advanced Concepts"
   - Days should progress logically: basics → intermediate → advanced → review

2. **Topic Structure** (Child Level):
   - Each day branches into ${topicsPerDay} main topics
   - Topics must TEACH the concept with:
     - A concise explanation (2-4 sentences)
     - A step-by-step mini walkthrough (3-6 steps)
     - 1-3 mini-exercises (practiceTasks)
   - Each topic: 30-90 minutes

3. **Subtopic Structure** (Grandchild Level):
   - Each topic branches into 2-5 specific subtopics
   - Subtopics are specific concepts or skills
   - Keep subtopic titles concise (2-5 words)
   - Subtopic content: 1-3 sentences with a concrete example
   - Include 1-2 practiceTasks where helpful
  - Provide 1-3 short practiceTasks (bite-sized exercises)
  - Provide 2-4 high-quality resources (label + url)

4. **Compression Rules for ${daysBeforeExam > 10 ? 'LARGE' : 'STANDARD'} Plans**:
   ${daysBeforeExam > 10 ? `
   - Aggressively group related concepts
   - Prioritize breadth over depth
   - Combine small topics into themed sessions
   - Maximum 6 topics per day to keep tree width manageable
   ` : `
   - Balanced distribution across days
   - Detailed breakdown of each concept
   `}

5. **Flow Requirements**:
   - Day 1 must cover prerequisites and fundamentals
   - Middle days build complexity progressively
   - Include a review/practice day if ${daysBeforeExam} > 7
   - Last day should be lighter (review/practice)

---

### Output Format Example
{
  "days": [
    {
      "dayNumber": 1,
      "dayTitle": "Day 1: Foundation & Setup",
      "topics": [
        {
          "id": "topic-1-1",
          "title": "Core Concepts",
          "content": "Understanding the fundamental principles",
          "estimatedMinutes": 60,
          "subtopics": [
            {
              "id": "sub-1-1-1",
              "title": "Basic Theory",
              "content": "Introduction to key theoretical concepts"
            },
            {
              "id": "sub-1-1-2",
              "title": "Terminology",
              "content": "Essential terms and definitions"
            }
          ]
        }
      ],
      "totalMinutes": 180
    }
  ],
  "totalDays": ${daysBeforeExam},
  "summary": "A structured ${daysBeforeExam}-day study plan..."
}

CRITICAL: 
- Give the high quality answers to the questions
- Teach clearly with short, precise explanations and step-by-step bullets
- When appropriate, include minimal, runnable code snippets fenced with language tags, e.g. \`\`\`ts ... \`\`\`
- Every topic MUST have at least 2 subtopics
- Keep the tree balanced - similar number of topics per day
- Make sure IDs are unique and follow the pattern: topic-{day}-{index}, sub-{day}-{topic}-{index}
- Content should be educational and specific, not generic
 
### Teaching and Markdown Formatting Rules
- Use Markdown for structure (headings, lists, tables if helpful)
- Prefer concrete examples over abstract summaries
- For algorithms or CLI steps, show a numbered list of steps
- For code, include a short explanation before and after the snippet
      `,
    });

    // ----------------------
    // 4. Convert to React Flow Nodes & Edges
    // ----------------------
    const flowNodes: any[] = [];
    const flowEdges: any[] = [];
    let nodeIdCounter = 0;

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

    // ----------------------
    // 5. DAGRE Layout - Hierarchical Tree
    // ----------------------
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    // Configure for vertical tree layout
    dagreGraph.setGraph({
      rankdir: "TB",      // Top to Bottom for tree structure
      ranksep: 120,       // Vertical spacing between levels
      nodesep: 80,        // Horizontal spacing between siblings
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
    
    // Run the layout algorithm
    dagre.layout(dagreGraph);
    
    // Apply the calculated positions
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

    // Update edges for better visuals
    const layoutedEdges = flowEdges.map((edge) => ({
      ...edge,
      markerEnd: {
        type: "arrowclosed",
        width: 15,
        height: 15,
      },
    }));

    // ----------------------
    // 6. Return Response
    // ----------------------
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