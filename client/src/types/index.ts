export interface Specialty {
  id: string;
  name: string;
  description: string;
  iconName: string;
  isActive: boolean;
  _count?: {
    doctors: number;
  };
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  appointmentDurationMinutes: number;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  doctorCode: string;
  fullName: string;
  specialtyId: string;
  qualifications: string;
  experienceYears: number;
  languages: string;
  consultationFee: number;
  profileImageUrl?: string | null;
  isActive: boolean;
  appointmentDurationMinutes: number;
  specialty?: Specialty;
  schedules?: DoctorSchedule[];
  _count?: {
    appointments: number;
  };
}

export interface Room {
  id: string;
  roomNumber: string;
  department: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  requestId: string;
  doctorId: string;
  roomId: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  approvedByUserId?: string | null;
  approvedAt: string;
  cancellationReason?: string | null;
  notes?: string | null;
  doctor: Doctor;
  room: Room;
  approvedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AppointmentRequest {
  id: string;
  publicReference: string;
  patientName: string;
  patientAge: number;
  contactNumber: string;
  email?: string | null;
  preferredContactMethod: 'PHONE' | 'EMAIL' | 'SMS';
  problemSummary: string;
  symptomDescription: string;
  specialtyId: string;
  preferredDoctorId?: string | null;
  preferredDate: string;
  preferredTimeRange: 'MORNING' | 'AFTERNOON' | 'EVENING';
  visitType: 'IN_PERSON' | 'VIDEO_CONSULT';
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  patientFacingRejectionReason?: string | null;
  internalStaffNotes?: string | null;
  submittedAt: string;
  updatedAt: string;
  specialty?: Specialty;
  preferredDoctor?: Doctor | null;
  appointment?: Appointment | null;
}

export interface DashboardMetrics {
  totalRequests: number;
  pendingRequests: number;
  confirmedAppointments: number;
  rejectedRequests: number;
  cancelledRequests: number;
  todaysAppointments: number;
  activeDoctors: number;
  configuredRooms: number;
}

export interface AuditLog {
  id: string;
  actorUserId?: string | null;
  actorRole: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: string | null;
  timestamp: string;
  actor?: {
    fullName: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'STAFF' | 'ADMIN';
}
