import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { workflows, workflowExecutions } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all workflows for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userWorkflows = await db.select().from(workflows).where(eq(workflows.userId, req.userId!));
    res.json(userWorkflows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workflow by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [workflow] = await db.select().from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, req.userId!)))
      .limit(1);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workflow
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, nodes, edges, status } = req.body;

    if (!name || !nodes || !edges) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [newWorkflow] = await db.insert(workflows).values({
      userId: req.userId!,
      name,
      description,
      nodes,
      edges,
      status: status || 'draft',
    }).returning();

    res.status(201).json(newWorkflow);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workflow
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updatedWorkflow] = await db.update(workflows)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(workflows.id, id), eq(workflows.userId, req.userId!)))
      .returning();

    if (!updatedWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(updatedWorkflow);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workflow
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedWorkflow] = await db.delete(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, req.userId!)))
      .returning();

    if (!deletedWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workflow executions
router.get('/:id/executions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify workflow belongs to user
    const [workflow] = await db.select().from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, req.userId!)))
      .limit(1);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const executions = await db.select().from(workflowExecutions)
      .where(eq(workflowExecutions.workflowId, id));

    res.json(executions);
  } catch (error) {
    console.error('Get workflow executions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute workflow
router.post('/:id/execute', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify workflow belongs to user
    const [workflow] = await db.select().from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, req.userId!)))
      .limit(1);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Create execution record
    const [execution] = await db.insert(workflowExecutions).values({
      workflowId: id,
      status: 'running',
      logs: [],
    }).returning();

    // Execute workflow asynchronously
    const { executeWorkflow } = await import('../services/orchestrator.js');
    executeWorkflow(id, execution.id, req.userId!).catch((error) => {
      console.error('Workflow execution error:', error);
    });

    res.status(201).json(execution);
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

