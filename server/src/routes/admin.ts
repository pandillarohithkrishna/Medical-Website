import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppointmentService } from '../services/appointmentService';
import {
  approveAppointmentSchema,
  rejectAppointmentSchema,
  doctorSchema,
  scheduleSchema,
} from '../utils/validators';

const router = Router();

// Protect ALL admin routes with authentication and STAFF/ADMIN role
router.use(authenticate);
router.use(requireRole(['STAFF', 'ADMIN']));

// GET /api/admin/metrics
router.get('/metrics', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalRequests,
      pendingRequests,
      confirmedAppointments,
      rejectedRequests,
      cancelledRequests,
      todaysAppointments,
      activeDoctors,
      configuredRooms,
    ] = await Promise.all([
      prisma.appointmentRequest.count(),
      prisma.appointmentRequest.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointmentRequest.count({ where: { status: 'REJECTED' } }),
      prisma.appointmentRequest.count({ where: { status: 'CANCELLED' } }),
      prisma.appointment.count({
        where: {
          status: 'CONFIRMED',
          startAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.room.count({ where: { isActive: true } }),
    ]);

    res.json({
      metrics: {
        totalRequests,
        pendingRequests,
        confirmedAppointments,
        rejectedRequests,
        cancelledRequests,
        todaysAppointments,
        activeDoctors,
        configuredRooms,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/requests
router.get('/requests', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { publicReference: { contains: search } },
        { patientName: { contains: search } },
        { contactNumber: { contains: search } },
        { email: { contains: search } },
        { problemSummary: { contains: search } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.appointmentRequest.findMany({
        where,
        include: {
          specialty: true,
          preferredDoctor: true,
          appointment: {
            include: {
              doctor: { include: { specialty: true } },
              room: true,
              approvedBy: { select: { fullName: true, email: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take,
      }),
      prisma.appointmentRequest.count({ where }),
    ]);

    res.json({
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/requests/approve
// Enforces complete backend validation and transactional approval
router.post('/requests/approve', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = approveAppointmentSchema.parse(req.body);

    const result = await AppointmentService.approveAppointment({
      requestId: parsed.requestId,
      doctorId: parsed.doctorId,
      roomId: parsed.roomId,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      approvingUserId: req.user!.id,
      notes: parsed.notes,
    });

    res.json({
      success: true,
      message: 'Appointment successfully approved and confirmed.',
      appointment: result.appointment,
      request: result.request,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/requests/reject
router.post('/requests/reject', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = rejectAppointmentSchema.parse(req.body);

    const updatedRequest = await AppointmentService.rejectAppointment({
      requestId: parsed.requestId,
      patientFacingReason: parsed.patientFacingReason,
      internalNotes: parsed.internalNotes,
      staffUserId: req.user!.id,
    });

    res.json({
      success: true,
      message: 'Appointment request has been rejected.',
      request: updatedRequest,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/doctors
router.get('/doctors', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        specialty: true,
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    res.json({ doctors });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/doctors
router.post('/doctors', requireRole(['ADMIN']), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = doctorSchema.parse(req.body);

    const existing = await prisma.doctor.findUnique({
      where: { doctorCode: data.doctorCode },
    });

    if (existing) {
      res.status(400).json({ error: `Doctor code ${data.doctorCode} is already taken.` });
      return;
    }

    const doctor = await prisma.doctor.create({
      data,
      include: { specialty: true },
    });

    await prisma.auditEvent.create({
      data: {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        entityType: 'Doctor',
        entityId: doctor.id,
        action: 'DOCTOR_CREATED',
        metadata: JSON.stringify({ doctorCode: doctor.doctorCode, fullName: doctor.fullName }),
      },
    });

    res.status(201).json({ doctor });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/doctors/:id
router.put('/doctors/:id', requireRole(['ADMIN']), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = doctorSchema.partial().parse(req.body);

    const doctor = await prisma.doctor.update({
      where: { id },
      data,
      include: { specialty: true },
    });

    await prisma.auditEvent.create({
      data: {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        entityType: 'Doctor',
        entityId: doctor.id,
        action: 'DOCTOR_UPDATED',
        metadata: JSON.stringify(data),
      },
    });

    res.json({ doctor });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/schedules
router.post('/schedules', requireRole(['ADMIN']), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = scheduleSchema.parse(req.body);

    // Upsert or create schedule for doctor and day
    const existingSchedule = await prisma.doctorSchedule.findFirst({
      where: { doctorId: data.doctorId, dayOfWeek: data.dayOfWeek },
    });

    let schedule;
    if (existingSchedule) {
      schedule = await prisma.doctorSchedule.update({
        where: { id: existingSchedule.id },
        data: {
          startTime: data.startTime,
          endTime: data.endTime,
          breakStartTime: data.breakStartTime,
          breakEndTime: data.breakEndTime,
          appointmentDurationMinutes: data.appointmentDurationMinutes,
          isActive: data.isActive,
        },
      });
    } else {
      schedule = await prisma.doctorSchedule.create({
        data,
      });
    }

    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await prisma.auditEvent.findMany({
      include: {
        actor: { select: { fullName: true, email: true, role: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

export default router;
