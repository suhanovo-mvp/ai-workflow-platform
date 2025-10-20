import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { artifacts } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all artifacts for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userArtifacts = await db.select().from(artifacts).where(eq(artifacts.userId, req.userId!));
    res.json(userArtifacts);
  } catch (error) {
    console.error('Get artifacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get artifact by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [artifact] = await db.select().from(artifacts)
      .where(and(eq(artifacts.id, id), eq(artifacts.userId, req.userId!)))
      .limit(1);

    if (!artifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json(artifact);
  } catch (error) {
    console.error('Get artifact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create artifact
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, format, content, metadata, sourceUrl } = req.body;

    if (!type || !format || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [newArtifact] = await db.insert(artifacts).values({
      userId: req.userId!,
      type,
      format,
      content,
      metadata: metadata || {},
      sourceUrl,
    }).returning();

    res.status(201).json(newArtifact);
  } catch (error) {
    console.error('Create artifact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update artifact
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updatedArtifact] = await db.update(artifacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(artifacts.id, id), eq(artifacts.userId, req.userId!)))
      .returning();

    if (!updatedArtifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json(updatedArtifact);
  } catch (error) {
    console.error('Update artifact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete artifact
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedArtifact] = await db.delete(artifacts)
      .where(and(eq(artifacts.id, id), eq(artifacts.userId, req.userId!)))
      .returning();

    if (!deletedArtifact) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json({ message: 'Artifact deleted successfully' });
  } catch (error) {
    console.error('Delete artifact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

