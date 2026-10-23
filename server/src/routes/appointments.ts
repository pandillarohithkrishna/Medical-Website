import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { createAppointmentRequestSchema, verifyStatusSchema, cancelAppointmentSchema } from '../utils/validators';
import { generatePublicReference } from '../utils/referenceGenerator';
import { createRateLimiter } from '../middleware/rateLimiter';
import { notificationService } from '../services/notificationService';
import { AppointmentService } from '../services/appointmentService';

const router = Router();

// Rate limiter for request creation: max 15 requests per 15 mins per IP
const requestRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many appointment requests created from this IP. Please wait before trying again.',
});

// Rate limiter for status checks: max 30 checks per 10 mins per IP to stop brute-forcing references
const statusCheckRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Too many status check attempts. Please wait a few minutes.',
});

// POST /api/appointments/request
router.post('/request', requestRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createAppointmentRequestSchema.parse(req.body);

    // Verify specialty exists
    const specialty = await prisma.specialty.findUnique({
      where: { id: validatedData.specialtyId },
    });

    if (!specialty || !specialty.isActive) {
      res.status(400).json({ error: 'Selected medical specialty is not available.' });
      return;
    }

    // Verify preferred doctor if provided
    if (validatedData.preferredDoctorId) {
      const doc = await prisma.doctor.findUnique({
        where: { id: validatedData.preferredDoctorId },
      });
      if (!doc || !doc.isActive) {
        res.status(400).json({ error: 'Selected preferred doctor is not available.' });
        return;
      }
    }

    // Generate unique unguessable reference
    let publicReference = generatePublicReference();
    let collisionCheck = await prisma.appointmentRequest.findUnique({ where: { publicReference } });
    while (collisionCheck) {
      publicReference = generatePublicReference();
      collisionCheck = await prisma.appointmentRequest.findUnique({ where: { publicReference } });
    }

    // Create the appointment request - ALWAYS INITIALIZED AS PENDING_REVIEW
    const newRequest = await prisma.appointmentRequest.create({
      data: {
        publicReference,
        patientName: validatedData.patientName,
        patientAge: validatedData.patientAge,
        contactNumber: validatedData.contactNumber,
        email: validatedData.email || null,
        preferredContactMethod: validatedData.preferredContactMethod,
        problemSummary: validatedData.problemSummary,
        symptomDescription: validatedData.symptomDescription,
        specialtyId: validatedData.specialtyId,
        preferredDoctorId: validatedData.preferredDoctorId || null,
        preferredDate: validatedData.preferredDate,
        preferredTimeRange: validatedData.preferredTimeRange,
        visitType: validatedData.visitType,
        status: 'PENDING_REVIEW', // Strict rule: must never start confirmed
        privacyConsent: true,
      },
      include: {
        specialty: true,
        preferredDoctor: {
          select: { id: true, fullName: true, doctorCode: true },
        },
      },
    });

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        actorRole: 'PATIENT',
        entityType: 'AppointmentRequest',
        entityId: newRequest.id,
        action: 'REQUEST_SUBMITTED',
        metadata: JSON.stringify({
          publicReference: newRequest.publicReference,
          specialty: specialty.name,
          preferredDate: newRequest.preferredDate,
        }),
      },
    });

    // Notify (safely, preserves status)
    notificationService.notify({
      patientName: newRequest.patientName,
      toEmail: newRequest.email || undefined,
      toPhone: newRequest.contactNumber,
      subject: `Appointment Request Received - Ref ${newRequest.publicReference}`,
      message: `Your request (${newRequest.publicReference}) has been received and is currently Pending Review by hospital staff.`,
      type: 'REQUEST_SUBMITTED',
    }).catch(err => console.error('Notification error:', err));

    res.status(201).json({
      success: true,
      publicReference: newRequest.publicReference,
      status: newRequest.status,
      submittedAt: newRequest.submittedAt,
      message: 'Your appointment request has been submitted successfully. Hospital staff will review your request shortly.',
      request: {
        publicReference: newRequest.publicReference,
        patientName: newRequest.patientName,
        specialtyName: newRequest.specialty.name,
        preferredDoctorName: newRequest.preferredDoctor?.fullName || null,
        preferredDate: newRequest.preferredDate,
        status: newRequest.status,
        submittedAt: newRequest.submittedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/check-status
// SECURE VERIFICATION: Requires Reference + Matching Phone/Email to prevent exposure of patient health concerns
router.post('/check-status', statusCheckRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { publicReference, contactVerification } = verifyStatusSchema.parse(req.body);

    const cleanRef = publicReference.trim().toUpperCase();
    const cleanVerification = contactVerification.trim().toLowerCase();

    const request = await prisma.appointmentRequest.findUnique({
      where: { publicReference: cleanRef },
      include: {
        specialty: true,
        preferredDoctor: {
          select: { id: true, fullName: true, doctorCode: true },
        },
        appointment: {
          include: {
            doctor: {
              select: {
                id: true,
                doctorCode: true,
                fullName: true,
                qualifications: true,
                specialty: { select: { name: true } },
              },
            },
            room: {
              select: {
                id: true,
                roomNumber: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      res.status(404).json({ error: 'No appointment request found matching the provided reference number.' });
      return;
    }

    // Verify contact verification matches either contactNumber or email
    const phoneMatches = request.contactNumber.replace(/[^0-9]/g, '').includes(cleanVerification.replace(/[^0-9]/g, '')) && cleanVerification.replace(/[^0-9]/g, '').length >= 4;
    const emailMatches = request.email && request.email.toLowerCase() === cleanVerification;

    if (!phoneMatches && !emailMatches) {
      res.status(403).json({
        error: 'Security verification failed: The contact number or email provided does not match the record on file for this reference.',
      });
      return;
    }

    // Build patient-safe response
    const responsePayload: any = {
      publicReference: request.publicReference,
      status: request.status,
      submittedAt: request.submittedAt,
      updatedAt: request.updatedAt,
      patientName: request.patientName,
      specialty: request.specialty.name,
      visitType: request.visitType,
      problemSummary: request.problemSummary,
    };

    if (request.status === 'PENDING_REVIEW') {
      responsePayload.pendingDetails = {
        preferredDate: request.preferredDate,
        preferredTimeRange: request.preferredTimeRange,
        preferredDoctor: request.preferredDoctor?.fullName || 'Any available specialist',
        message: 'Your request is currently being reviewed by hospital triage staff. Once approved, your assigned doctor, confirmed time, and clinic room will be displayed here.',
      };
    } else if (request.status === 'CONFIRMED' && request.appointment) {
      responsePayload.confirmedDetails = {
        appointmentId: request.appointment.id,
        doctorName: request.appointment.doctor.fullName,
        doctorCode: request.appointment.doctor.doctorCode,
        doctorQualifications: request.appointment.doctor.qualifications,
        specialty: request.appointment.doctor.specialty.name,
        date: request.appointment.startAt.toISOString().split('T')[0],
        startTime: request.appointment.startAt.toISOString(),
        endTime: request.appointment.endAt.toISOString(),
        roomNumber: request.appointment.room.roomNumber,
        department: request.appointment.room.department,
        instructions: 'Please arrive 15 minutes prior to your scheduled time at the hospital reception.',
      };
    } else if (request.status === 'REJECTED') {
      responsePayload.rejectionDetails = {
        reason: request.patientFacingRejectionReason || 'The requested specialist or time slot is unfortunately unavailable.',
        advice: 'You may submit a new request with alternative dates or contact hospital reception directly.',
      };
    } else if (request.status === 'CANCELLED') {
      responsePayload.cancellationDetails = {
        reason: request.appointment?.cancellationReason || 'Appointment cancelled upon request.',
      };
    }

    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/:id/cancel
router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancellationReason } = cancelAppointmentSchema.parse(req.body);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Confirmed appointment not found.' });
      return;
    }

    const updated = await AppointmentService.cancelAppointment(id, cancellationReason);
    res.json({ success: true, message: 'Appointment has been cancelled.', appointment: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
