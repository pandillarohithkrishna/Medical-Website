import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/doctors
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { specialtyId, search } = req.query;

    const whereClause: any = {
      isActive: true,
    };

    if (specialtyId && typeof specialtyId === 'string') {
      whereClause.specialtyId = specialtyId;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { fullName: { contains: search } },
        { qualifications: { contains: search } },
        { languages: { contains: search } },
        { specialty: { name: { contains: search } } },
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      include: {
        specialty: true,
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    res.json({ doctors });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialty: true,
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!doctor || !doctor.isActive) {
      res.status(404).json({ error: 'Doctor not found or inactive.' });
      return;
    }

    res.json({ doctor });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// Calculates real available slots from configured schedules minus confirmed bookings
router.get('/:id/available-slots', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Valid date query param (YYYY-MM-DD) is required.' });
      return;
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        schedules: { where: { isActive: true } },
      },
    });

    if (!doctor || !doctor.isActive) {
      res.status(404).json({ error: 'Doctor not found or inactive.' });
      return;
    }

    const targetDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = targetDate.getDay();

    const schedule = doctor.schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule) {
      res.json({
        date,
        dayOfWeek,
        availableSlots: [],
        message: 'Doctor is not scheduled to work on this day of the week.',
      });
      return;
    }

    // Get all confirmed appointments for this doctor on this day
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        status: 'CONFIRMED',
        startAt: { gte: dayStart, lte: dayEnd },
      },
      select: {
        startAt: true,
        endAt: true,
      },
    });

    // Helper: convert "HH:MM" to minutes from midnight
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    // Helper: convert minutes to "HH:MM"
    const toTimeStr = (totalMin: number) => {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const startMin = toMinutes(schedule.startTime);
    const endMin = toMinutes(schedule.endTime);
    const duration = schedule.appointmentDurationMinutes || 30;

    const breakStartMin = schedule.breakStartTime ? toMinutes(schedule.breakStartTime) : null;
    const breakEndMin = schedule.breakEndTime ? toMinutes(schedule.breakEndTime) : null;

    const slots: Array<{ startTime: string; endTime: string; startAtISO: string; endAtISO: string; available: boolean }> = [];

    for (let current = startMin; current + duration <= endMin; current += duration) {
      const slotEnd = current + duration;

      // Check if overlaps with break
      if (breakStartMin !== null && breakEndMin !== null) {
        if (current < breakEndMin && slotEnd > breakStartMin) {
          continue; // during break
        }
      }

      const slotStartTimeStr = toTimeStr(current);
      const slotEndTimeStr = toTimeStr(slotEnd);

      const slotStartISO = new Date(`${date}T${slotStartTimeStr}:00`).toISOString();
      const slotEndISO = new Date(`${date}T${slotEndTimeStr}:00`).toISOString();
      const slotStartDate = new Date(slotStartISO);
      const slotEndDate = new Date(slotEndISO);

      // Check if overlaps with any existing confirmed appointment
      const hasConflict = existingAppointments.some(apt => {
        return apt.startAt < slotEndDate && apt.endAt > slotStartDate;
      });

      if (!hasConflict) {
        slots.push({
          startTime: slotStartTimeStr,
          endTime: slotEndTimeStr,
          startAtISO: slotStartISO,
          endAtISO: slotEndISO,
          available: true,
        });
      }
    }

    res.json({
      date,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      availableSlots: slots,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
