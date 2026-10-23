import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Search,
  Shield,
  HeartPulse,
  Activity,
  Award,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Stethoscope,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { DemoNotice } from './components/common/DemoNotice';
import { MedicalHeroScene } from './components/3d/MedicalHeroScene';
import { SpecialtyGrid } from './components/specialties/SpecialtyGrid';
import { DoctorList } from './components/doctors/DoctorList';
import { HowItWorksSection } from './components/howItWorks/HowItWorksSection';
import { BookingModal } from './components/booking/BookingModal';
import { BookingSuccessModal } from './components/booking/BookingSuccessModal';
import { StatusTracker } from './components/status/StatusTracker';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Doctor, Specialty } from './types';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const { isStaff } = useAuth();

  // Core Data
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals & Navigation State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPreselectedDoctor, setBookingPreselectedDoctor] = useState<Doctor | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusTrackerReference, setStatusTrackerReference] = useState('');
  const [statusTrackerContact, setStatusTrackerContact] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Success Confirmation State
  const [successData, setSuccessData] = useState<{
    reference: string;
    patientName: string;
    specialtyName: string;
    preferredDate: string;
  } | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Hero refs for GSAP
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLSpanElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroParagraphRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  // Fetch initial specialties & doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          api.getSpecialties(),
          api.getDoctors(),
        ]);
        setSpecialties(specRes.specialties);
        setDoctors(docRes.doctors);
      } catch (err) {
        console.error('Failed to load clinic catalog:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // GSAP Hero Entrance
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroEyebrowRef.current) {
        tl.fromTo(
          heroEyebrowRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }
      if (heroHeadlineRef.current) {
        tl.fromTo(
          heroHeadlineRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.4'
        );
      }
      if (heroParagraphRef.current) {
        tl.fromTo(
          heroParagraphRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );
      }
      if (heroCtaRef.current) {
        tl.fromTo(
          heroCtaRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        );
      }
    }, heroLeftRef);

    return () => ctx.revert();
  }, []);

  const handleBookDoctor = (doc: Doctor) => {
    setBookingPreselectedDoctor(doc);
    setIsBookingOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setBookingPreselectedDoctor(null);
    setIsBookingOpen(true);
  };

  const handleTrackSpecificReference = (ref: string, contact?: string) => {
    setStatusTrackerReference(ref);
    if (contact) setStatusTrackerContact(contact);
    setIsStatusOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Why does my appointment start as "Pending Review" rather than instantly confirmed?',
      a: 'Unlike generic directory sites that fabricate instant confirmations, AuraHealth strictly adheres to real hospital clinical governance. Hospital triage staff review every consultation request to verify clinician rotations, patient medical urgency, and consultation suite allocations. This eliminates double bookings and guarantees physician availability.',
    },
    {
      q: 'How does secure status tracking protect patient confidentiality?',
      a: 'To prevent malicious third parties from discovering patient health complaints through brute-force reference number guesses, our lookup protocol requires both the unique unguessable reference code (e.g. REQ-2026-XXXX-XXXX) and the matching contact telephone or email address on file.',
    },
    {
      q: 'Can I cancel or reschedule my appointment once confirmed?',
      a: 'Yes. Once an appointment is approved and saved to the database, you can look up your confirmed record on the status tracking page and cancel it if your schedule changes. The cancellation is immediately recorded in our clinical transaction logs and frees up the physician and room for other patients.',
    },
    {
      q: 'What should I do in the event of an acute medical emergency?',
      a: 'Our online appointment system is engineered for scheduled outpatient consultations and routine specialist visits. In the event of acute emergencies—such as chest pressure, acute stroke symptoms, severe breathing difficulties, or severe trauma—please contact emergency services (911 / 112) or report directly to the nearest emergency room immediately.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Clinical Emergency Banner */}
      <EmergencyBanner />

      {/* 2. Top Navigation */}
      <Navbar
        onOpenBooking={handleOpenGeneralBooking}
        onOpenStatusTracker={() => {
          setStatusTrackerReference('');
          setStatusTrackerContact('');
          setIsStatusOpen(true);
        }}
        onOpenAdminPortal={() => {
          if (isStaff) {
            setIsAdminPortalOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onNavigateSection={handleNavigateSection}
      />

      {/* 3. HERO SECTION WITH 3D EXPERIENCE */}
      <section className="relative overflow-hidden pt-6 pb-20 md:pt-12 md:pb-28">
        {/* Subtle ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-medteal-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-medblue-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Typography & Actions */}
            <div ref={heroLeftRef} className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Eyebrow Label */}
              <span
                ref={heroEyebrowRef}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-medteal-50 text-medteal-800 border border-medteal-200/80 shadow-2xs"
              >
                <Activity className="w-3.5 h-3.5 text-medteal-600" />
                <span>Next-Generation Healthcare Booking</span>
              </span>

              {/* Exact Master Headline */}
              <h1
                ref={heroHeadlineRef}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.12]"
              >
                Better Care <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-medblue-700 via-medteal-600 to-medteal-700">
                  Begins Here.
                </span>
              </h1>

              {/* Exact Supporting Paragraph */}
              <p
                ref={heroParagraphRef}
                className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Find the right specialist, request an appointment, and take the next step toward better healthcare.
              </p>

              {/* Exact CTA Buttons */}
              <div
                ref={heroCtaRef}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
              >
                <button
                  type="button"
                  onClick={handleOpenGeneralBooking}
                  className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-medteal-600 to-medblue-600 hover:from-medteal-700 hover:to-medblue-700 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigateSection('doctors')}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-navy-900 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Doctors</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Trust statement & Stats highlight */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-navy-900 font-mono block">6</span>
                  <span className="text-[11px] text-slate-500 font-medium block">Specialist Wings</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-navy-900 font-mono block">100%</span>
                  <span className="text-[11px] text-slate-500 font-medium block">Verified Doctors</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-navy-900 font-mono block">0</span>
                  <span className="text-[11px] text-slate-500 font-medium block">Double-Bookings</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <MedicalHeroScene />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Specialties Section */}
      <SpecialtyGrid
        specialties={specialties}
        selectedSpecialtyId={selectedSpecialtyId}
        onSelectSpecialty={(id) => {
          setSelectedSpecialtyId(id);
          handleNavigateSection('doctors');
        }}
      />

      {/* 5. Doctor Discovery Section */}
      <DoctorList
        doctors={doctors}
        specialties={specialties}
        selectedSpecialtyId={selectedSpecialtyId}
        onSelectSpecialty={setSelectedSpecialtyId}
        onBookDoctor={handleBookDoctor}
        isLoading={isLoadingData}
      />

      {/* 6. How It Works Section */}
      <HowItWorksSection
        onOpenBooking={handleOpenGeneralBooking}
        onOpenStatusTracker={() => {
          setStatusTrackerReference('');
          setStatusTrackerContact('');
          setIsStatusOpen(true);
        }}
      />

      {/* 7. Clinical FAQs */}
      <section id="faq" className="py-20 bg-slate-50/70 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-medteal-700 bg-medteal-50 px-3 py-1 rounded-full border border-medteal-100">
              Clear & Transparent Information
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to know about our triage protocol, verification security, and physician scheduling.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-navy-900 text-sm hover:text-medblue-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-medblue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <Footer
        onOpenBooking={handleOpenGeneralBooking}
        onOpenStatusTracker={() => {
          setStatusTrackerReference('');
          setStatusTrackerContact('');
          setIsStatusOpen(true);
        }}
        onOpenAdminPortal={() => {
          if (isStaff) {
            setIsAdminPortalOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* 9. Floating Demo Mode Notice Pill with quick sample credentials */}
      <DemoNotice
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onTrackDemoReference={handleTrackSpecificReference}
      />

      {/* MODALS */}
      {/* A. Multi-Step Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedDoctor={bookingPreselectedDoctor}
        specialties={specialties}
        doctors={doctors}
        onBookingSuccess={(data) => setSuccessData(data)}
      />

      {/* B. Booking Success Modal */}
      {successData && (
        <BookingSuccessModal
          reference={successData.reference}
          patientName={successData.patientName}
          specialtyName={successData.specialtyName}
          preferredDate={successData.preferredDate}
          onClose={() => setSuccessData(null)}
          onTrackStatus={(ref) => {
            setSuccessData(null);
            handleTrackSpecificReference(ref);
          }}
        />
      )}

      {/* C. Status Tracker Modal */}
      {isStatusOpen && (
        <StatusTracker
          initialReference={statusTrackerReference}
          initialContact={statusTrackerContact}
          onClose={() => setIsStatusOpen(false)}
          onRebook={() => {
            setIsStatusOpen(false);
            handleOpenGeneralBooking();
          }}
        />
      )}

      {/* D. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminPortalOpen(true);
        }}
      />

      {/* E. Full Protected Hospital Admin Portal */}
      {isAdminPortalOpen && (
        <AdminPortal
          onClose={() => setIsAdminPortalOpen(false)}
          specialties={specialties}
        />
      )}
    </div>
  );
}
