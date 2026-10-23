import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/db';

describe('AuraHealth API Integration Tests', () => {
  let adminToken: string;
  let specialtyId: string;
  let doctorId: string;
  let roomId: string;

  beforeAll(async () => {
    // 1. Authenticate demo admin to obtain JWT
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@aurahealth.demo',
        password: 'AdminPassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    adminToken = loginRes.body.token;

    // Fetch seed doctor, room, specialty
    const specialty = await prisma.specialty.findFirst({ where: { name: 'Cardiology' } });
    specialtyId = specialty!.id;

    const doctor = await prisma.doctor.findFirst({ where: { doctorCode: 'DOC-CAR-01' } });
    doctorId = doctor!.id;

    const room = await prisma.room.findFirst({ where: { roomNumber: 'Suite 201 - Cardiology Clinic' } });
    roomId = room!.id;
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/specialties returns active medical specialties', async () => {
    const res = await request(app).get('/api/specialties');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.specialties)).toBe(true);
    expect(res.body.specialties.length).toBeGreaterThan(0);
  });

  it('GET /api/doctors returns doctors with specialty and schedule', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(200);
    expect(res.body.doctors.length).toBeGreaterThan(0);
    expect(res.body.doctors[0].specialty).toBeDefined();
    expect(res.body.doctors[0].schedules).toBeDefined();
  });

  it('POST /api/appointments/request creates a new request in PENDING_REVIEW status', async () => {
    const tomorrow = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/appointments/request')
      .send({
        patientName: 'Emma Watson',
        patientAge: 31,
        contactNumber: '+1 (555) 123-4567',
        email: 'emma.watson@example.com',
        preferredContactMethod: 'EMAIL',
        problemSummary: 'Routine cardiovascular wellness screening',
        symptomDescription: 'Family history of arrhythmia, seeking preventative consult and resting ECG evaluation.',
        specialtyId: specialtyId,
        preferredDoctorId: doctorId,
        preferredDate: tomorrow,
        preferredTimeRange: 'MORNING',
        visitType: 'IN_PERSON',
        privacyConsent: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.publicReference).toMatch(/^REQ-\d{4}-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(res.body.status).toBe('PENDING_REVIEW');
  });

  it('POST /api/appointments/check-status requires contact verification to protect privacy', async () => {
    // Create an isolated test request
    const testRef = `REQ-TEST-PRIV-${Date.now()}`;
    await prisma.appointmentRequest.create({
      data: {
        publicReference: testRef,
        patientName: 'Sophia Montgomery',
        patientAge: 34,
        contactNumber: '+1 (555) 349-8812',
        email: 'sophia.montgomery@example.com',
        preferredContactMethod: 'EMAIL',
        problemSummary: 'Persistent heart palpitations',
        symptomDescription: 'Experiencing intermittent episodes of elevated pulse at rest.',
        specialtyId: specialtyId,
        preferredDate: '2026-11-01',
        status: 'PENDING_REVIEW',
        privacyConsent: true,
      },
    });

    // 1. Check with wrong phone/email -> Expect 403 Security Verification Failed
    const failRes = await request(app)
      .post('/api/appointments/check-status')
      .send({
        publicReference: testRef,
        contactVerification: '+1 (999) 000-0000',
      });

    expect(failRes.status).toBe(403);
    expect(failRes.body.error).toContain('Security verification failed');

    // 2. Check with correct phone/email -> Expect 200 with patient status
    const passRes = await request(app)
      .post('/api/appointments/check-status')
      .send({
        publicReference: testRef,
        contactVerification: 'sophia.montgomery@example.com',
      });

    expect(passRes.status).toBe(200);
    expect(passRes.body.status).toBe('PENDING_REVIEW');
    expect(passRes.body.patientName).toBe('Sophia Montgomery');
  });

  it('Admin dashboard metrics derive genuine counts from database', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics.totalRequests).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.activeDoctors).toBeGreaterThanOrEqual(6);
  });

  it('Transactional approval assigns doctor, time, and room; prevents double booking', async () => {
    // Create an isolated pending request for this test
    const pendingTest = await prisma.appointmentRequest.create({
      data: {
        publicReference: `REQ-TEST-APPROV-${Date.now()}`,
        patientName: 'Approval Test Patient',
        patientAge: 45,
        contactNumber: '+1 (555) 777-6655',
        problemSummary: 'Cardiology consult for approval test',
        symptomDescription: 'Patient requires review of resting heart rate and ECG.',
        specialtyId: specialtyId,
        preferredDate: '2026-11-02',
        status: 'PENDING_REVIEW',
        privacyConsent: true,
      },
    });

    // Pick a future Monday 10:00 - 10:30 that is free
    const testDate = new Date();
    // Advance 14 days and set to Monday
    testDate.setDate(testDate.getDate() + 14 + ((1 + 7 - testDate.getDay()) % 7 || 7));
    testDate.setHours(10, 0, 0, 0);
    const endDate = new Date(testDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    // 1. Approve request successfully
    const approveRes = await request(app)
      .post('/api/admin/requests/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        requestId: pendingTest.id,
        doctorId: doctorId,
        roomId: roomId,
        startAt: testDate.toISOString(),
        endAt: endDate.toISOString(),
        notes: 'Approved during automated integration test.',
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.appointment.status).toBe('CONFIRMED');

    // 2. Create second request and attempt to book same doctor at same conflicting time
    const req2 = await prisma.appointmentRequest.create({
      data: {
        publicReference: `REQ-TEST-CONFLICT-${Date.now()}`,
        patientName: 'Conflict Test Patient',
        patientAge: 40,
        contactNumber: '+1 (555) 999-8877',
        problemSummary: 'Cardio conflict test',
        symptomDescription: 'Testing double-booking prevention in appointmentService.',
        specialtyId: specialtyId,
        preferredDate: testDate.toISOString().split('T')[0],
        status: 'PENDING_REVIEW',
        privacyConsent: true,
      },
    });

    // Pick a different room to test doctor conflict
    const otherRoom = await prisma.room.findFirst({ where: { roomNumber: 'Suite 101 - Primary Care' } });

    const conflictRes = await request(app)
      .post('/api/admin/requests/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        requestId: req2.id,
        doctorId: doctorId,
        roomId: otherRoom!.id,
        startAt: testDate.toISOString(),
        endAt: endDate.toISOString(),
      });

    expect(conflictRes.status).toBe(400);
    expect(conflictRes.body.error).toContain('Doctor conflict');
  });
});
