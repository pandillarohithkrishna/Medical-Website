import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { roomSchema } from '../utils/validators';

const router = Router();

// GET /api/rooms
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { roomNumber: 'asc' },
    });
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/available?startAt=ISO&endAt=ISO
// Finds all active rooms that are free during the specified window
router.get('/available', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startAt, endAt } = req.query;
    if (!startAt || !endAt || typeof startAt !== 'string' || typeof endAt !== 'string') {
      res.status(400).json({ error: 'startAt and endAt ISO strings are required.' });
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    // Get all rooms that DO have conflicting appointments
    const bookedRooms = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        AND: [
          { startAt: { lt: endDate } },
          { endAt: { gt: startDate } },
        ],
      },
      select: { roomId: true },
    });

    const bookedRoomIds = bookedRooms.map(b => b.roomId);

    // Fetch all active rooms NOT in bookedRoomIds
    const availableRooms = await prisma.room.findMany({
      where: {
        isActive: true,
        id: { notIn: bookedRoomIds },
      },
      orderBy: { roomNumber: 'asc' },
    });

    res.json({ availableRooms });
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms (Admin only)
router.post('/', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = roomSchema.parse(req.body);

    const existing = await prisma.room.findUnique({
      where: { roomNumber: data.roomNumber },
    });

    if (existing) {
      res.status(400).json({ error: `Room "${data.roomNumber}" already exists.` });
      return;
    }

    const room = await prisma.room.create({
      data,
    });

    res.status(201).json({ room });
  } catch (err) {
    next(err);
  }
});

// PUT /api/rooms/:id (Admin only)
router.put('/:id', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = roomSchema.partial().parse(req.body);

    const room = await prisma.room.update({
      where: { id },
      data,
    });

    res.json({ room });
  } catch (err) {
    next(err);
  }
});

export default router;
