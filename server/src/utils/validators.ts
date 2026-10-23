import { z } from 'zod';

export const createAppointmentRequestSchema = z.object({
  patientName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  patientAge: z.coerce.number().int().min(0, 'Age must be 0 or greater').max(130, 'Please enter a valid age'),
  contactNumber: z.string().min(7, 'Contact number is too short').max(20, 'Contact number is too long')
    .regex(/^[+0-9\s\-()]+$/, 'Contact number contains invalid characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  preferredContactMethod: z.enum(['PHONE', 'EMAIL', 'SMS']).default('PHONE'),
  problemSummary: z.string().min(5, 'Problem summary must be at least 5 characters').max(250),
  symptomDescription: z.string().min(10, 'Please provide more details on symptoms (at least 10 characters)').max(3000),
  specialtyId: z.string().min(1, 'Please select a specialty'),
  preferredDoctorId: z.string().optional().nullable(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Preferred date must be in YYYY-MM-DD format'),
  preferredTimeRange: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).default('MORNING'),
  visitType: z.enum(['IN_PERSON', 'VIDEO_CONSULT']).default('IN_PERSON'),
  privacyConsent: z.boolean().refine(val => val === true, 'You must accept the privacy policy to proceed'),
});

export const verifyStatusSchema = z.object({
  publicReference: z.string().min(5, 'Invalid reference format'),
  contactVerification: z.string().min(3, 'Please provide the contact phone or email used during booking'),
});

export const approveAppointmentSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  roomId: z.string().uuid('Invalid room ID'),
  startAt: z.string().datetime({ message: 'Valid start date-time in ISO format required' }),
  endAt: z.string().datetime({ message: 'Valid end date-time in ISO format required' }),
  notes: z.string().max(1000).optional(),
});

export const rejectAppointmentSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  patientFacingReason: z.string().min(3, 'Rejection reason must be at least 3 characters').max(500),
  internalNotes: z.string().max(1000).optional(),
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(3, 'Cancellation reason is required').max(500),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const doctorSchema = z.object({
  doctorCode: z.string().min(2).max(20),
  fullName: z.string().min(2).max(100),
  specialtyId: z.string().uuid(),
  qualifications: z.string().min(2).max(200),
  experienceYears: z.coerce.number().int().min(0).max(70),
  languages: z.string().default('English'),
  consultationFee: z.coerce.number().min(0).default(100),
  profileImageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  isActive: z.boolean().default(true),
  appointmentDurationMinutes: z.coerce.number().int().min(10).max(180).default(30),
});

export const roomSchema = z.object({
  roomNumber: z.string().min(1).max(50),
  department: z.string().min(2).max(100),
  isActive: z.boolean().default(true),
});

export const scheduleSchema = z.object({
  doctorId: z.string().uuid(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be HH:MM'),
  breakStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  breakEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  appointmentDurationMinutes: z.coerce.number().int().min(10).max(120).default(30),
  isActive: z.boolean().default(true),
});
