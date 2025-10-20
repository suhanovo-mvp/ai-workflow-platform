import { db } from '../db/index.js';
import { workflows, workflowExecutions, aiServices, artifacts } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { openaiService } from './openai.js';

interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  status: 'started' | 'completed' | 'failed';
  message: string;
  data?: any;
}

export class WorkflowOrchestrator {
  private executionId: string;
  private logs: ExecutionLog[] = [];

  constructor(executionId: string) {
    this.executionId = executionId;
  }

  private log(nodeId: string, status: 'started' | 'completed' | 'failed', message: string, data?: any) {
    const logEntry: ExecutionLog = {
      timestamp: new Date().toISOString(),
      nodeId,
      status,
      message,
      data,
    };
    this.logs.push(logEntry);
    console.log(`[${nodeId}] ${status}: ${message}`);
  }

  private async updateExecutionLogs() {
    await db.update(workflowExecutions)
      .set({ logs: this.logs })
      .where(eq(workflowExecutions.id, this.executionId));
  }

  async execute(workflowId: string, userId: string): Promise<void> {
    try {
      // Load workflow
      const [workflow] = await db.select().from(workflows)
        .where(eq(workflows.id, workflowId))
        .limit(1);

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      this.log('workflow', 'started', `Starting workflow: ${workflow.name}`);

      // Build execution graph
      const nodes = workflow.nodes || [];
      const edges = workflow.edges || [];

      // Find starting nodes (nodes with no incoming edges)
      const nodeIds = new Set(nodes.map((n: any) => n.id));
      const targetNodes = new Set(edges.map((e: any) => e.target));
      const startNodes = nodes.filter((n: any) => !targetNodes.has(n.id));

      if (startNodes.length === 0 && nodes.length > 0) {
        // If no clear start, use first node
        startNodes.push(nodes[0]);
      }

      // Execute nodes in topological order
      const executed = new Set<string>();
      const results = new Map<string, any>();

      const executeNode = async (node: any): Promise<void> => {
        if (executed.has(node.id)) return;

        this.log(node.id, 'started', `Executing node: ${node.data.label}`);

        try {
          // Get service info
          const serviceId = node.data.serviceId;
          if (!serviceId) {
            this.log(node.id, 'completed', 'No service attached, skipping');
            executed.add(node.id);
            return;
          }

          const [service] = await db.select().from(aiServices)
            .where(eq(aiServices.id, serviceId))
            .limit(1);

          if (!service) {
            throw new Error(`Service not found: ${serviceId}`);
          }

          // Get input from previous nodes
          const incomingEdges = edges.filter((e: any) => e.target === node.id);
          let inputData = '';

          if (incomingEdges.length > 0) {
            const sourceResults = incomingEdges.map((e: any) => results.get(e.source)).filter(Boolean);
            inputData = sourceResults.join('\n\n');
          } else {
            // Use artifact if specified
            const artifactId = node.data.artifactId;
            if (artifactId) {
              const [artifact] = await db.select().from(artifacts)
                .where(eq(artifacts.id, artifactId))
                .limit(1);
              if (artifact) {
                inputData = artifact.content;
              }
            }
          }

          // Execute AI operation based on service type
          let result = '';
          const params = node.data.parameters || {};

          switch (service.operationType) {
            case 'summarization':
              result = await openaiService.summarize(inputData);
              break;

            case 'translation':
              result = await openaiService.translate(inputData, params.targetLanguage || 'English');
              break;

            case 'analysis':
              result = await openaiService.analyze(inputData, params.analysisType || 'general');
              break;

            case 'code_generation':
              result = await openaiService.generateCode(inputData, params.language || 'javascript');
              break;

            case 'text_generation':
              result = await openaiService.generate(inputData, params.systemPrompt);
              break;

            case 'chat':
              result = await openaiService.chat([
                { role: 'user', content: inputData }
              ], params.model || 'gpt-4.1-mini');
              break;

            default:
              result = await openaiService.generate(inputData);
          }

          // Store result
          results.set(node.id, result);

          // Create artifact with result
          await db.insert(artifacts).values({
            userId,
            type: 'text',
            format: 'text/plain',
            content: result,
            metadata: {
              workflowId,
              executionId: this.executionId,
              nodeId: node.id,
              serviceName: service.name,
            },
          });

          this.log(node.id, 'completed', `Node completed successfully`, { resultLength: result.length });
          executed.add(node.id);
          await this.updateExecutionLogs();

          // Execute dependent nodes
          const outgoingEdges = edges.filter((e: any) => e.source === node.id);
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n: any) => n.id === edge.target);
            if (targetNode) {
              await executeNode(targetNode);
            }
          }
        } catch (error: any) {
          this.log(node.id, 'failed', `Node execution failed: ${error.message}`);
          throw error;
        }
      };

      // Execute starting nodes
      for (const startNode of startNodes) {
        await executeNode(startNode);
      }

      this.log('workflow', 'completed', 'Workflow completed successfully');
      await this.updateExecutionLogs();

      // Update execution status
      await db.update(workflowExecutions)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(workflowExecutions.id, this.executionId));

    } catch (error: any) {
      this.log('workflow', 'failed', `Workflow failed: ${error.message}`);
      await this.updateExecutionLogs();

      await db.update(workflowExecutions)
        .set({
          status: 'failed',
          completedAt: new Date(),
        })
        .where(eq(workflowExecutions.id, this.executionId));

      throw error;
    }
  }
}

export async function executeWorkflow(workflowId: string, executionId: string, userId: string): Promise<void> {
  const orchestrator = new WorkflowOrchestrator(executionId);
  await orchestrator.execute(workflowId, userId);
}

