import { prisma } from '../db';
import { notificationService } from './notificationService';

export interface ApproveAppointmentParams {
  requestId: string;
  doctorId: string;
  roomId: string;
  startAt: string; // ISO string
  endAt: string;   // ISO string
  approvingUserId: string;
  notes?: string;
}

export interface RejectAppointmentParams {
  requestId: string;
  patientFacingReason: string;
  internalNotes?: string;
  staffUserId: string;
}

export class AppointmentService {
  /**
   * Approves an appointment request transactionally.
   * Strictly enforces conflict prevention for doctor and room, validates schedules,
   * creates the Appointment record, updates the Request, and creates an AuditEvent.
   */
  public static async approveAppointment(params: ApproveAppointmentParams) {
    const { requestId, doctorId, roomId, startAt, endAt, approvingUserId, notes } = params;

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid appointment date or time supplied.');
    }

    if (startDate >= endDate) {
      throw new Error('Appointment end time must be after start time.');
    }

    // Run in a serializable transaction to prevent race conditions and double bookings
    return await prisma.$transaction(async (tx) => {
      // 1. Verify request exists and is PENDING_REVIEW
      const request = await tx.appointmentRequest.findUnique({
        where: { id: requestId },
        include: { specialty: true },
      });

      if (!request) {
        throw new Error('Appointment request not found.');
      }

      if (request.status !== 'PENDING_REVIEW') {
        throw new Error(`Cannot approve request: current status is "${request.status}". Only pending requests can be approved.`);
      }

      // 2. Verify assigned doctor exists and is active
      const doctor = await tx.doctor.findUnique({
        where: { id: doctorId },
        include: { schedules: true, specialty: true },
      });

      if (!doctor || !doctor.isActive) {
        throw new Error('Assigned doctor does not exist or is currently inactive.');
      }

      // 3. Verify slot is within doctor's schedule
      // Day of week in JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dayOfWeek = startDate.getDay();
      const scheduleForDay = doctor.schedules.find(s => s.dayOfWeek === dayOfWeek && s.isActive);

      if (!scheduleForDay) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        throw new Error(`Doctor ${doctor.fullName} is not scheduled to work on ${days[dayOfWeek]}s.`);
      }

      // Parse schedule times
      const appointmentStartHourMin = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      const appointmentEndHourMin = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      if (appointmentStartHourMin < scheduleForDay.startTime || appointmentEndHourMin > scheduleForDay.endTime) {
        throw new Error(`Slot (${appointmentStartHourMin}-${appointmentEndHourMin}) falls outside doctor's working hours (${scheduleForDay.startTime}-${scheduleForDay.endTime}).`);
      }

      // Check break time if configured
      if (scheduleForDay.breakStartTime && scheduleForDay.breakEndTime) {
        if (
          (appointmentStartHourMin >= scheduleForDay.breakStartTime && appointmentStartHourMin < scheduleForDay.breakEndTime) ||
          (appointmentEndHourMin > scheduleForDay.breakStartTime && appointmentEndHourMin <= scheduleForDay.breakEndTime)
        ) {
          throw new Error(`Selected slot falls during doctor's break (${scheduleForDay.breakStartTime}-${scheduleForDay.breakEndTime}).`);
        }
      }

      // 4. Verify doctor has NO conflicting appointment
      // Overlap condition: existing.start < new.end AND existing.end > new.start
      const conflictingDoctorAppointment = await tx.appointment.findFirst({
        where: {
          doctorId: doctorId,
          status: 'CONFIRMED',
          AND: [
            { startAt: { lt: endDate } },
            { endAt: { gt: startDate } },
          ],
        },
      });

      if (conflictingDoctorAppointment) {
        throw new Error(`Doctor conflict: Dr. ${doctor.fullName} already has a confirmed appointment at this time.`);
      }

      // 5. Verify room exists and is active
      const room = await tx.room.findUnique({
        where: { id: roomId },
      });

      if (!room || !room.isActive) {
        throw new Error('Assigned room does not exist or is currently inactive.');
      }

      // 6. Verify room has NO conflicting reservation
      const conflictingRoomAppointment = await tx.appointment.findFirst({
        where: {
          roomId: roomId,
          status: 'CONFIRMED',
          AND: [
            { startAt: { lt: endDate } },
            { endAt: { gt: startDate } },
          ],
        },
      });

      if (conflictingRoomAppointment) {
        throw new Error(`Room conflict: Room ${room.roomNumber} is already reserved by another appointment at this time.`);
      }

      // 7. Create Appointment record
      const appointment = await tx.appointment.create({
        data: {
          requestId: request.id,
          doctorId: doctor.id,
          roomId: room.id,
          startAt: startDate,
          endAt: endDate,
          status: 'CONFIRMED',
          approvedByUserId: approvingUserId,
          approvedAt: new Date(),
          notes: notes || undefined,
        },
        include: {
          doctor: {
            include: { specialty: true },
          },
          room: true,
          approvedBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      // 8. Update request status to CONFIRMED
      const updatedRequest = await tx.appointmentRequest.update({
        where: { id: requestId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });

      // 9. Record Audit Event
      await tx.auditEvent.create({
        data: {
          actorUserId: approvingUserId,
          actorRole: 'STAFF',
          entityType: 'AppointmentRequest',
          entityId: requestId,
          action: 'APPOINTMENT_APPROVED',
          metadata: JSON.stringify({
            appointmentId: appointment.id,
            doctorCode: doctor.doctorCode,
            doctorName: doctor.fullName,
            roomNumber: room.roomNumber,
            startAt: startDate.toISOString(),
            endAt: endDate.toISOString(),
          }),
        },
      });

      // Trigger notification service (safe, preserves DB state)
      notificationService.notify({
        patientName: request.patientName,
        toEmail: request.email || undefined,
        toPhone: request.contactNumber,
        subject: `Appointment Confirmed - Ref ${request.publicReference}`,
        message: `Your appointment with Dr. ${doctor.fullName} has been confirmed for ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()} in ${room.roomNumber}.`,
        type: 'APPOINTMENT_CONFIRMED',
      }).catch(err => console.error('Notification dispatch error:', err));

      return {
        request: updatedRequest,
        appointment,
      };
    });
  }

  /**
   * Rejects an appointment request with an explicit patient-facing reason and staff notes.
   */
  public static async rejectAppointment(params: RejectAppointmentParams) {
    const { requestId, patientFacingReason, internalNotes, staffUserId } = params;

    return await prisma.$transaction(async (tx) => {
      const request = await tx.appointmentRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error('Appointment request not found.');
      }

      if (request.status !== 'PENDING_REVIEW') {
        throw new Error(`Cannot reject request: current status is "${request.status}". Only pending requests can be rejected.`);
      }

      const updatedRequest = await tx.appointmentRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          patientFacingRejectionReason: patientFacingReason,
          internalStaffNotes: internalNotes || undefined,
          updatedAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          actorUserId: staffUserId,
          actorRole: 'STAFF',
          entityType: 'AppointmentRequest',
          entityId: requestId,
          action: 'APPOINTMENT_REJECTED',
          metadata: JSON.stringify({
            reason: patientFacingReason,
            notes: internalNotes,
          }),
        },
      });

      notificationService.notify({
        patientName: request.patientName,
        toEmail: request.email || undefined,
        toPhone: request.contactNumber,
        subject: `Appointment Update - Ref ${request.publicReference}`,
        message: `We were unable to confirm your appointment request: ${patientFacingReason}`,
        type: 'APPOINTMENT_REJECTED',
      }).catch(err => console.error('Notification dispatch error:', err));

      return updatedRequest;
    });
  }

  /**
   * Cancels an appointment safely.
   */
  public static async cancelAppointment(appointmentId: string, reason: string, cancelledByUserId?: string) {
    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { request: true },
      });

      if (!appointment) {
        throw new Error('Appointment not found.');
      }

      if (appointment.status === 'CANCELLED') {
        throw new Error('Appointment is already cancelled.');
      }

      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
        },
      });

      await tx.appointmentRequest.update({
        where: { id: appointment.requestId },
        data: {
          status: 'CANCELLED',
        },
      });

      await tx.auditEvent.create({
        data: {
          actorUserId: cancelledByUserId,
          actorRole: cancelledByUserId ? 'STAFF' : 'PATIENT',
          entityType: 'Appointment',
          entityId: appointmentId,
          action: 'APPOINTMENT_CANCELLED',
          metadata: JSON.stringify({ reason }),
        },
      });

      return updatedAppointment;
    });
  }
}
