import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing demo data...');
  await prisma.auditEvent.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.appointmentRequest.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.room.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Creating demo hospital administrative users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
  const staffPasswordHash = await bcrypt.hash('StaffPassword123!', salt);

  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Sarah Mitchell, MD (Chief Medical Officer)',
      email: 'admin@aurahealth.demo',
      phone: '+1 (555) 019-2834',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      fullName: 'Marcus Vance (Triage Coordinator)',
      email: 'staff@aurahealth.demo',
      phone: '+1 (555) 019-8721',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      accountStatus: 'ACTIVE',
    },
  });

  console.log('[Seed] Creating medical specialties...');
  const cardiology = await prisma.specialty.create({
    data: {
      name: 'Cardiology',
      description: 'Comprehensive cardiovascular care, diagnostic echocardiography, and preventative heart wellness.',
      iconName: 'HeartPulse',
    },
  });

  const dermatology = await prisma.specialty.create({
    data: {
      name: 'Dermatology',
      description: 'Advanced clinical dermatology, skin health screenings, and targeted dermatological therapies.',
      iconName: 'Sparkles',
    },
  });

  const neurology = await prisma.specialty.create({
    data: {
      name: 'Neurology',
      description: 'Specialized evaluation and management of neurological conditions, migraines, and cognitive disorders.',
      iconName: 'Brain',
    },
  });

  const orthopedics = await prisma.specialty.create({
    data: {
      name: 'Orthopedics',
      description: 'Musculoskeletal care, sports medicine, joint preservation, and rehabilitation planning.',
      iconName: 'Bone',
    },
  });

  const pediatrics = await prisma.specialty.create({
    data: {
      name: 'Pediatrics',
      description: 'Dedicated healthcare for infants, children, and adolescents with compassionate developmental support.',
      iconName: 'Baby',
    },
  });

  const generalMedicine = await prisma.specialty.create({
    data: {
      name: 'General Medicine',
      description: 'Primary medical care, chronic disease management, proactive screenings, and holistic wellness.',
      iconName: 'Stethoscope',
    },
  });

  const gynecology = await prisma.specialty.create({
    data: {
      name: 'Gynecology',
      description: 'Comprehensive women’s health, preventative gynecological wellness, and personalized reproductive care.',
      iconName: 'Flower2',
    },
  });

  console.log('[Seed] Creating hospital rooms...');
  const room101 = await prisma.room.create({
    data: { roomNumber: 'Suite 101 - Primary Care', department: 'West Wing, 1st Floor', isActive: true },
  });
  const room102 = await prisma.room.create({
    data: { roomNumber: 'Suite 102 - Triage & Consult', department: 'West Wing, 1st Floor', isActive: true },
  });
  const room201 = await prisma.room.create({
    data: { roomNumber: 'Suite 201 - Cardiology Clinic', department: 'Heart & Vascular Pavilion, 2nd Floor', isActive: true },
  });
  const room202 = await prisma.room.create({
    data: { roomNumber: 'Suite 202 - Neuro Diagnostics', department: 'Neuroscience Center, 2nd Floor', isActive: true },
  });
  const room301 = await prisma.room.create({
    data: { roomNumber: 'Suite 301 - Orthopedic Rehab', department: 'Surgical & Sports Clinic, 3rd Floor', isActive: true },
  });
  const room302 = await prisma.room.create({
    data: { roomNumber: 'Suite 302 - Dermatology Clinic', department: 'Ambulatory Care, 3rd Floor', isActive: true },
  });

  console.log('[Seed] Creating specialist doctors and schedules...');

  // Doctor 1: Dr. Elena Rostova (Cardiology)
  const drElena = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-CAR-01',
      fullName: 'Dr. Elena Rostova, MD, FACC',
      specialtyId: cardiology.id,
      qualifications: 'MD Harvard Medical School, Residency Johns Hopkins Hospital',
      experienceYears: 14,
      languages: 'English, French, Russian',
      consultationFee: 180,
      profileImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
      isActive: true,
      appointmentDurationMinutes: 30,
    },
  });

  // Doctor 2: Dr. Julian Hayes (Neurology)
  const drJulian = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-NEU-02',
      fullName: 'Dr. Julian Hayes, MD, PhD',
      specialtyId: neurology.id,
      qualifications: 'MD Oxford University, Fellowship Stanford Neuroscience Institute',
      experienceYears: 16,
      languages: 'English, German',
      consultationFee: 210,
      profileImageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      isActive: true,
      appointmentDurationMinutes: 45,
    },
  });

  // Doctor 3: Dr. Amara Chen (Dermatology)
  const drAmara = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-DER-03',
      fullName: 'Dr. Amara Chen, MD, FAAD',
      specialtyId: dermatology.id,
      qualifications: 'MD Columbia University Vagelos College of Physicians and Surgeons',
      experienceYears: 11,
      languages: 'English, Mandarin',
      consultationFee: 150,
      profileImageUrl: 'https://images.unsplash.com/photo-1594824813576-a4c03c5332f9?auto=format&fit=crop&q=80&w=600',
      isActive: true,
      appointmentDurationMinutes: 30,
    },
  });

  // Doctor 4: Dr. Marcus Thorne (Orthopedics)
  const drMarcus = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-ORT-04',
      fullName: 'Dr. Marcus Thorne, MD',
      specialtyId: orthopedics.id,
      qualifications: 'MD University of Pennsylvania, Orthopedic Sports Fellowship',
      experienceYears: 18,
      languages: 'English, Spanish',
      consultationFee: 195,
      profileImageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
      isActive: true,
      appointmentDurationMinutes: 30,
    },
  });

  // Doctor 5: Dr. Priya Sharma (General Medicine)
  const drPriya = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-GEN-05',
      fullName: 'Dr. Priya Sharma, MBBS, MD',
      specialtyId: generalMedicine.id,
      qualifications: 'MBBS King George Medical University, MD Internal Medicine',
      experienceYears: 12,
      languages: 'English, Hindi',
      consultationFee: 120,
      profileImageUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600',
      isActive: true,
      appointmentDurationMinutes: 30,
    },
  });

  // Doctor 6: Dr. Clara Dupont (Pediatrics)
  const drClara = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-PED-06',
      fullName: 'Dr. Clara Dupont, MD, FAAP',
      specialtyId: pediatrics.id,
      qualifications: 'MD McGill University, Boston Children’s Hospital Residency',
      experienceYears: 9,
      languages: 'English, French',
      consultationFee: 140,
      profileImageUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=600',
      isActive: true,
      appointmentDurationMinutes: 30,
    },
  });

  // Set schedules for doctors (Monday = 1 through Saturday = 6)
  const allDoctors = [drElena, drJulian, drAmara, drMarcus, drPriya, drClara];
  for (const doc of allDoctors) {
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          appointmentDurationMinutes: doc.appointmentDurationMinutes,
          isActive: true,
        },
      });
    }
  }

  console.log('[Seed] Creating demo sample requests with genuine statuses...');

  // 1. A PENDING request (for staff testing)
  const pendingReq = await prisma.appointmentRequest.create({
    data: {
      publicReference: 'REQ-2026-A1B2-C3D4',
      patientName: 'Sophia Montgomery',
      patientAge: 34,
      contactNumber: '+1 (555) 349-8812',
      email: 'sophia.montgomery@example.com',
      preferredContactMethod: 'EMAIL',
      problemSummary: 'Persistent heart palpitations and lightheadedness following mild cardio workouts',
      symptomDescription: 'Experiencing intermittent episodes of elevated pulse at rest (approx 105-115 bpm) and occasional slight chest tightness. Episodes last 10 to 15 minutes.',
      specialtyId: cardiology.id,
      preferredDoctorId: drElena.id,
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      preferredTimeRange: 'MORNING',
      visitType: 'IN_PERSON',
      status: 'PENDING_REVIEW',
      privacyConsent: true,
    },
  });

  // 2. A CONFIRMED request with complete real assignment
  const confirmedDate = new Date(Date.now() + 86400000);
  confirmedDate.setHours(10, 0, 0, 0);
  const confirmedEndDate = new Date(confirmedDate);
  confirmedEndDate.setMinutes(confirmedEndDate.getMinutes() + 30);

  const confirmedReq = await prisma.appointmentRequest.create({
    data: {
      publicReference: 'REQ-2026-CONF-9821',
      patientName: 'David K. Vance',
      patientAge: 48,
      contactNumber: '+1 (555) 782-9900',
      email: 'david.vance@example.com',
      preferredContactMethod: 'PHONE',
      problemSummary: 'Recurring migraine with aura and visual distortion',
      symptomDescription: 'Headaches occurring 3 times weekly, typically accompanied by light sensitivity and zig-zag visual disturbances.',
      specialtyId: neurology.id,
      preferredDoctorId: drJulian.id,
      preferredDate: confirmedDate.toISOString().split('T')[0],
      preferredTimeRange: 'MORNING',
      visitType: 'IN_PERSON',
      status: 'CONFIRMED',
      privacyConsent: true,
    },
  });

  await prisma.appointment.create({
    data: {
      requestId: confirmedReq.id,
      doctorId: drJulian.id,
      roomId: room202.id,
      startAt: confirmedDate,
      endAt: confirmedEndDate,
      status: 'CONFIRMED',
      approvedByUserId: adminUser.id,
      approvedAt: new Date(),
      notes: 'Initial neurological consult scheduled. Patient requested morning slot.',
    },
  });

  // 3. A REJECTED request with patient-facing explanation
  await prisma.appointmentRequest.create({
    data: {
      publicReference: 'REQ-2026-REJ-4411',
      patientName: 'Jonathan Davis',
      patientAge: 29,
      contactNumber: '+1 (555) 231-7788',
      email: 'j.davis@example.com',
      preferredContactMethod: 'EMAIL',
      problemSummary: 'Acute knee trauma with severe swelling after ski trip',
      symptomDescription: 'Complete inability to bear weight and intense localized pain around patella following rotational twist.',
      specialtyId: orthopedics.id,
      preferredDoctorId: drMarcus.id,
      preferredDate: new Date().toISOString().split('T')[0],
      preferredTimeRange: 'MORNING',
      visitType: 'IN_PERSON',
      status: 'REJECTED',
      patientFacingRejectionReason: 'The requested urgent same-day orthopedic slot is fully booked. For acute traumatic injuries with inability to bear weight, please visit our Urgent Care center immediately.',
      internalStaffNotes: 'Triage redirected patient to immediate ER/Urgent Care triage.',
      privacyConsent: true,
    },
  });

  // Seed Audit events
  await prisma.auditEvent.create({
    data: {
      actorUserId: adminUser.id,
      actorRole: 'ADMIN',
      entityType: 'Appointment',
      entityId: confirmedReq.id,
      action: 'APPOINTMENT_APPROVED',
      metadata: JSON.stringify({ doctorCode: drJulian.doctorCode, room: room202.roomNumber }),
    },
  });

  console.log('[Seed] Database seeded successfully!');
  console.log('--------------------------------------------------');
  console.log('Admin Login:   admin@aurahealth.demo / AdminPassword123!');
  console.log('Staff Login:   staff@aurahealth.demo / StaffPassword123!');
  console.log('Pending Ref:   REQ-2026-A1B2-C3D4 (Sophia Montgomery)');
  console.log('Confirmed Ref: REQ-2026-CONF-9821 (David K. Vance)');
  console.log('Rejected Ref:  REQ-2026-REJ-4411 (Jonathan Davis)');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
