import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/specialties
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const specialties = await prisma.specialty.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { doctors: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ specialties });
  } catch (err) {
    next(err);
  }
});

// POST /api/specialties (Admin only)
router.post('/', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, iconName } = req.body;
    if (!name || !description) {
      res.status(400).json({ error: 'Specialty name and description are required.' });
      return;
    }

    const specialty = await prisma.specialty.create({
      data: {
        name,
        description,
        iconName: iconName || 'Activity',
      },
    });

    res.status(201).json({ specialty });
  } catch (err) {
    next(err);
  }
});

export default router;
