import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Send,
  Loader2,
} from 'lucide-react';
import { Doctor, Specialty } from '../../types';
import { api } from '../../services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctor?: Doctor | null;
  specialties: Specialty[];
  doctors: Doctor[];
  onBookingSuccess: (data: {
    reference: string;
    patientName: string;
    specialtyName: string;
    preferredDate: string;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctor,
  specialties,
  doctors,
  onBookingSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'PHONE' | 'EMAIL' | 'SMS'>('PHONE');

  const [problemSummary, setProblemSummary] = useState('');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');

  const [preferredDoctorId, setPreferredDoctorId] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [preferredTimeRange, setPreferredTimeRange] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [visitType, setVisitType] = useState<'IN_PERSON' | 'VIDEO_CONSULT'>('IN_PERSON');

  const [privacyConsent, setPrivacyConsent] = useState(false);

  // When preselected doctor changes or modal opens
  useEffect(() => {
    if (preselectedDoctor) {
      setPreferredDoctorId(preselectedDoctor.id);
      setSpecialtyId(preselectedDoctor.specialtyId);
    } else if (specialties.length > 0 && !specialtyId) {
      setSpecialtyId(specialties[0].id);
    }
  }, [preselectedDoctor, specialties]);

  if (!isOpen) return null;

  // Step 1 Validation
  const isStep1Valid =
    patientName.trim().length >= 2 &&
    typeof patientAge === 'number' &&
    patientAge >= 0 &&
    patientAge <= 130 &&
    contactNumber.trim().length >= 7;

  // Step 2 Validation
  const isStep2Valid =
    problemSummary.trim().length >= 5 &&
    symptomDescription.trim().length >= 10 &&
    Boolean(specialtyId);

  // Step 3 Validation
  const isStep3Valid = Boolean(preferredDate);

  // Step 4 Validation
  const isStep4Valid = privacyConsent;

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1 && !isStep1Valid) {
      setErrorMessage('Please complete all required personal contact information.');
      return;
    }
    if (currentStep === 2 && !isStep2Valid) {
      setErrorMessage('Please provide a summary and detailed description of your symptoms (min 10 characters).');
      return;
    }
    if (currentStep === 3 && !isStep3Valid) {
      setErrorMessage('Please select a valid preferred date.');
      return;
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep4Valid) {
      setErrorMessage('You must review and accept the patient privacy consent to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        patientName: patientName.trim(),
        patientAge: Number(patientAge),
        contactNumber: contactNumber.trim(),
        email: email.trim() || undefined,
        preferredContactMethod,
        problemSummary: problemSummary.trim(),
        symptomDescription: symptomDescription.trim(),
        specialtyId,
        preferredDoctorId: preferredDoctorId || undefined,
        preferredDate,
        preferredTimeRange,
        visitType,
        privacyConsent: true,
      };

      const res = await api.createAppointmentRequest(payload);

      const chosenSpecialty = specialties.find((s) => s.id === specialtyId);

      onBookingSuccess({
        reference: res.publicReference,
        patientName: patientName.trim(),
        specialtyName: chosenSpecialty?.name || 'General Clinical Care',
        preferredDate,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit request. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: 'Patient Info' },
    { num: 2, title: 'Health Concern' },
    { num: 3, title: 'Preferences' },
    { num: 4, title: 'Review & Submit' },
  ];

  const selectedSpecialty = specialties.find((s) => s.id === specialtyId);
  const selectedDoctor = doctors.find((d) => d.id === preferredDoctorId);
  const availableDoctorsForSpecialty = doctors.filter((d) => !specialtyId || d.specialtyId === specialtyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-soft-lg border border-slate-200 overflow-hidden">
        {/* Modal Header & Stepper */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[11px] font-bold text-medteal-700 uppercase tracking-wider block">
                Hospital Clinical Request
              </span>
              <h2 className="text-xl font-bold text-navy-900">Request a Medical Appointment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="grid grid-cols-4 gap-2">
            {stepsMeta.map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="text-left">
                  <div
                    className={`h-1.5 rounded-full mb-2 transition-all ${
                      isPast
                        ? 'bg-medteal-600'
                        : isCurrent
                        ? 'bg-medblue-600'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] sm:text-xs font-semibold block truncate ${
                      isCurrent
                        ? 'text-navy-900 font-bold'
                        : isPast
                        ? 'text-medteal-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.num}. {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PATIENT DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-medteal-50/60 p-3 rounded-2xl border border-medteal-100 text-xs text-medteal-900 flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-medteal-700 shrink-0" />
                <span>We collect only required contact details to coordinate your triage and appointment verification.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Patient Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 38"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Used for status verification lookup</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. eleanor.vance@example.com"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Preferred Contact Method</label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e: any) => setPreferredContactMethod(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  >
                    <option value="PHONE">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS / Text</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HEALTH CONCERN */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Emergency Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Warning:</strong> Routine appointment requests undergo asynchronous triage review. If you are experiencing sudden severe pain, chest distress, or trauma, do not wait—seek emergency care immediately.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Primary Medical Specialty <span className="text-rose-500">*</span>
                </label>
                <select
                  value={specialtyId}
                  onChange={(e) => {
                    setSpecialtyId(e.target.value);
                    setPreferredDoctorId(''); // reset doctor if specialty changes
                  }}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  required
                >
                  <option value="">Select a specialty...</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Reason for Consultation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={problemSummary}
                  onChange={(e) => setProblemSummary(e.target.value)}
                  placeholder="e.g. Intermittent palpitations following light exercise"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Detailed Symptom Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={symptomDescription}
                  onChange={(e) => setSymptomDescription(e.target.value)}
                  placeholder="Describe your symptoms, how long they have lasted, intensity, and any prior relevant diagnoses..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Confidential medical triage data. Protected under clinic privacy standards.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <strong>Please Note:</strong> Selected preferences guide staff allocation and do not constitute an instant reservation. Hospital staff verify doctor working schedules and room availability before confirming.
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Preferred Specialist <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={preferredDoctorId}
                  onChange={(e) => setPreferredDoctorId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                >
                  <option value="">Any Available Specialist in Department</option>
                  {availableDoctorsForSpecialty.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.fullName} ({doc.doctorCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Preferred Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Preferred Time of Day</label>
                  <select
                    value={preferredTimeRange}
                    onChange={(e: any) => setPreferredTimeRange(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  >
                    <option value="MORNING">Morning (09:00 AM – 12:00 PM)</option>
                    <option value="AFTERNOON">Afternoon (01:00 PM – 05:00 PM)</option>
                    <option value="EVENING">Late Clinic (where available)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisitType('IN_PERSON')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      visitType === 'IN_PERSON'
                        ? 'bg-medblue-50 border-medblue-600 text-medblue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    In-Person Hospital Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitType('VIDEO_CONSULT')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      visitType === 'VIDEO_CONSULT'
                        ? 'bg-medblue-50 border-medblue-600 text-medblue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Teleconsultation (Video)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONSENT */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-sm font-bold text-navy-900 mb-3">Please review your submission summary:</h3>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/70">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Patient</span>
                    <span className="font-bold text-navy-900">{patientName} ({patientAge} yrs)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Contact</span>
                    <span className="font-bold text-navy-900">{contactNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/70">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Specialty</span>
                    <span className="font-bold text-navy-900">{selectedSpecialty?.name || 'Selected Department'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Preferred Doctor</span>
                    <span className="font-bold text-navy-900">
                      {selectedDoctor ? selectedDoctor.fullName : 'First Available Doctor'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/70">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Preferred Date</span>
                    <span className="font-bold text-navy-900">{preferredDate} ({preferredTimeRange})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Consult Type</span>
                    <span className="font-bold text-navy-900">{visitType === 'IN_PERSON' ? 'In-Person Hospital Visit' : 'Teleconsult'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Reason for Consult</span>
                  <p className="text-slate-700 italic">"{problemSummary}"</p>
                </div>
              </div>

              {/* Status Warning Box */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <strong>Submission Status:</strong> Your request will be created with status <strong>Pending Review</strong>. You will receive a unique reference code. Once hospital staff confirm a room and physician, the status changes to Confirmed.
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-medteal-600 focus:ring-medteal-500"
                    required
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I confirm that the provided patient information is accurate and consent to hospital triage processing. I understand this request is subject to staff review and doctor availability.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-medteal-600 hover:bg-medteal-700 rounded-xl shadow-soft transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !privacyConsent}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-medteal-600 to-medblue-600 hover:from-medteal-700 hover:to-medblue-700 rounded-xl shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Hospital Queue...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Appointment Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
