import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { aiServices } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all AI services
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const services = await db.select().from(aiServices);
    res.json(services);
  } catch (error) {
    console.error('Get AI services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI service by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [service] = await db.select().from(aiServices).where(eq(aiServices.id, id)).limit(1);

    if (!service) {
      return res.status(404).json({ error: 'AI service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get AI service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create AI service (admin only)
router.post('/', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, operationType, inputFormats, outputFormats, parameters, apiEndpoint, apiKeyRequired } = req.body;

    if (!name || !category || !operationType || !inputFormats || !outputFormats) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [newService] = await db.insert(aiServices).values({
      name,
      description,
      category,
      operationType,
      inputFormats,
      outputFormats,
      parameters: parameters || {},
      apiEndpoint,
      apiKeyRequired: apiKeyRequired || false,
      isActive: true,
    }).returning();

    res.status(201).json(newService);
  } catch (error) {
    console.error('Create AI service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update AI service (admin only)
router.put('/:id', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updatedService] = await db.update(aiServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiServices.id, id))
      .returning();

    if (!updatedService) {
      return res.status(404).json({ error: 'AI service not found' });
    }

    res.json(updatedService);
  } catch (error) {
    console.error('Update AI service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete AI service (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedService] = await db.delete(aiServices)
      .where(eq(aiServices.id, id))
      .returning();

    if (!deletedService) {
      return res.status(404).json({ error: 'AI service not found' });
    }

    res.json({ message: 'AI service deleted successfully' });
  } catch (error) {
    console.error('Delete AI service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

