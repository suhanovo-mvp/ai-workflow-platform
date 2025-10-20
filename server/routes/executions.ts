import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { workflowExecutions, workflows } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get execution by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const [execution] = await db.select().from(workflowExecutions)
      .where(eq(workflowExecutions.id, id))
      .limit(1);

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Verify workflow belongs to user
    const [workflow] = await db.select().from(workflows)
      .where(and(eq(workflows.id, execution.workflowId), eq(workflows.userId, req.userId!)))
      .limit(1);

    if (!workflow) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(execution);
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get execution logs
router.get('/:id/logs', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const [execution] = await db.select().from(workflowExecutions)
      .where(eq(workflowExecutions.id, id))
      .limit(1);

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Verify workflow belongs to user
    const [workflow] = await db.select().from(workflows)
      .where(and(eq(workflows.id, execution.workflowId), eq(workflows.userId, req.userId!)))
      .limit(1);

    if (!workflow) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ logs: execution.logs || [] });
  } catch (error) {
    console.error('Get execution logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

