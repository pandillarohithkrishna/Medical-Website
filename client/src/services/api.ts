import { Specialty, Doctor, Room, AppointmentRequest, DashboardMetrics, AuditLog, User } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('aura_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || (data?.details ? data.details.map((d: any) => d.message).join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public
  getSpecialties: () => request<{ specialties: Specialty[] }>('/specialties'),
  getDoctors: (specialtyId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (specialtyId) params.append('specialtyId', specialtyId);
    if (search) params.append('search', search);
    return request<{ doctors: Doctor[] }>(`/doctors?${params.toString()}`);
  },
  getDoctorById: (id: string) => request<{ doctor: Doctor }>(`/doctors/${id}`),
  getDoctorAvailableSlots: (doctorId: string, date: string) =>
    request<{ date: string; availableSlots: Array<{ startTime: string; endTime: string; startAtISO: string; endAtISO: string }> }>(
      `/doctors/${doctorId}/available-slots?date=${date}`
    ),
  createAppointmentRequest: (payload: any) =>
    request<{ success: boolean; publicReference: string; status: string; message: string; request: any }>(
      '/appointments/request',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  checkAppointmentStatus: (publicReference: string, contactVerification: string) =>
    request<any>('/appointments/check-status', {
      method: 'POST',
      body: JSON.stringify({ publicReference, contactVerification }),
    }),
  cancelAppointment: (appointmentId: string, cancellationReason: string) =>
    request<{ success: boolean; message: string; appointment: any }>(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancellationReason }),
    }),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<{ user: User }>('/auth/me'),
  getDemoCredentials: () => request<{ email: string; password: string; role: string; note: string }>('/auth/demo-credentials'),

  // Admin
  getMetrics: () => request<{ metrics: DashboardMetrics }>('/admin/metrics'),
  getRequests: (status?: string, search?: string, page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return request<{ requests: AppointmentRequest[]; pagination: any }>(`/admin/requests?${params.toString()}`);
  },
  approveRequest: (payload: { requestId: string; doctorId: string; roomId: string; startAt: string; endAt: string; notes?: string }) =>
    request<{ success: boolean; message: string; appointment: any; request: any }>('/admin/requests/approve', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  rejectRequest: (payload: { requestId: string; patientFacingReason: string; internalNotes?: string }) =>
    request<{ success: boolean; message: string; request: any }>('/admin/requests/reject', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRooms: () => request<{ rooms: Room[] }>('/rooms'),
  getAvailableRooms: (startAt: string, endAt: string) =>
    request<{ availableRooms: Room[] }>(`/rooms/available?startAt=${encodeURIComponent(startAt)}&endAt=${encodeURIComponent(endAt)}`),
  createRoom: (payload: { roomNumber: string; department: string; isActive?: boolean }) =>
    request<{ room: Room }>('/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  toggleRoomActive: (roomId: string, isActive: boolean) =>
    request<{ room: Room }>(`/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
  getAdminDoctors: () => request<{ doctors: Doctor[] }>('/admin/doctors'),
  createDoctor: (payload: any) => request<{ doctor: Doctor }>('/admin/doctors', { method: 'POST', body: JSON.stringify(payload) }),
  updateDoctor: (id: string, payload: any) => request<{ doctor: Doctor }>(`/admin/doctors/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAuditLogs: () => request<{ logs: AuditLog[] }>('/admin/audit-logs'),
};
