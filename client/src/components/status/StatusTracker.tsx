import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

interface StatusTrackerProps {
  initialReference?: string;
  initialContact?: string;
  onClose?: () => void;
  onRebook?: () => void;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  initialReference = '',
  initialContact = '',
  onClose,
  onRebook,
}) => {
  const [reference, setReference] = useState(initialReference);
  const [contactVerification, setContactVerification] = useState(initialContact);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any | null>(null);

  // Cancellation state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !contactVerification.trim()) {
      setError('Both the appointment reference code and contact phone/email are required for privacy verification.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusData(null);

    try {
      const data = await api.checkAppointmentStatus(reference.trim(), contactVerification.trim());
      setStatusData(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please ensure the reference and contact number/email match the record.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!statusData?.confirmedDetails?.appointmentId) return;
    if (!cancellationReason.trim()) {
      alert('Please provide a brief reason for cancellation.');
      return;
    }

    setIsCancelling(true);
    try {
      await api.cancelAppointment(statusData.confirmedDetails.appointmentId, cancellationReason.trim());
      // Refresh status data
      const refreshed = await api.checkAppointmentStatus(reference.trim(), contactVerification.trim());
      setStatusData(refreshed);
      setShowCancelPrompt(false);
    } catch (err: any) {
      alert(err.message || 'Unable to cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-soft-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medteal-50 text-medteal-700 flex items-center justify-center border border-medteal-100">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-medteal-700 uppercase tracking-wider block">
                Security-Verified Lookup
              </span>
              <h2 className="text-xl font-bold text-navy-900">Check Appointment Status</h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form & Results Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Privacy Notice Banner */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-medteal-600 shrink-0 mt-0.5" />
            <span>
              <strong>Patient Data Privacy:</strong> To protect confidential medical details against unauthorized brute-force queries, you must supply both your Reference Code and the contact phone or email registered during booking.
            </span>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Reference Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  placeholder="e.g. REQ-2026-A1B2-C3D4"
                  className="w-full px-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Contact Phone or Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactVerification}
                  onChange={(e) => setContactVerification(e.target.value)}
                  placeholder="Phone or email on record"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-medteal-600 hover:bg-medteal-700 rounded-xl shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Database...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify & Track Status</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Results Card */}
          {statusData && (
            <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-soft space-y-6 animate-in fade-in duration-200">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Public Reference
                  </span>
                  <span className="text-base font-extrabold text-navy-900 font-mono">
                    {statusData.publicReference}
                  </span>
                </div>

                <div>
                  {statusData.status === 'PENDING_REVIEW' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pending Staff Review</span>
                    </span>
                  )}
                  {statusData.status === 'CONFIRMED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Confirmed Appointment</span>
                    </span>
                  )}
                  {statusData.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      <span>Request Not Confirmed</span>
                    </span>
                  )}
                  {statusData.status === 'CANCELLED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Appointment Cancelled</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Patient Basic Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Patient Name</span>
                  <span className="font-semibold text-navy-900">{statusData.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Specialty</span>
                  <span className="font-semibold text-navy-900">{statusData.specialty}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Submission Date</span>
                  <span className="font-semibold text-navy-900">
                    {new Date(statusData.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* CASE 1: PENDING REVIEW */}
              {statusData.status === 'PENDING_REVIEW' && statusData.pendingDetails && (
                <div className="space-y-3">
                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{statusData.pendingDetails.message}</span>
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      To uphold clinical accuracy, appointments are verified against real physician rotations and consultation suite allocations before confirmation.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Requested Date</span>
                      <span className="font-semibold text-navy-900">{statusData.pendingDetails.preferredDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Requested Doctor</span>
                      <span className="font-semibold text-navy-900">{statusData.pendingDetails.preferredDoctor}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 2: CONFIRMED */}
              {statusData.status === 'CONFIRMED' && statusData.confirmedDetails && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>Your Appointment Is Formally Confirmed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Specialist</span>
                        <span className="font-bold text-navy-900 text-sm block mt-0.5">
                          {statusData.confirmedDetails.doctorName}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700 block">
                          Doctor ID: {statusData.confirmedDetails.doctorCode}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          {statusData.confirmedDetails.doctorQualifications}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Room & Location</span>
                        <span className="font-bold text-navy-900 text-sm block mt-0.5">
                          {statusData.confirmedDetails.roomNumber}
                        </span>
                        <span className="text-[11px] text-slate-600 block flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-medteal-600" />
                          <span>{statusData.confirmedDetails.department}</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Scheduled Date & Time</span>
                        <span className="font-bold text-navy-900 text-sm">
                          {new Date(statusData.confirmedDetails.startTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-600 block text-xs font-mono font-medium">
                          {new Date(statusData.confirmedDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(statusData.confirmedDetails.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 italic max-w-xs">
                        {statusData.confirmedDetails.instructions}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation toggle */}
                  {!showCancelPrompt ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowCancelPrompt(true)}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline"
                      >
                        Need to cancel this appointment?
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-navy-900">Cancel Confirmed Appointment</h4>
                      <input
                        type="text"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Reason for cancellation (e.g. Schedule conflict)"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCancelPrompt(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 bg-slate-200 rounded-lg font-semibold"
                        >
                          Keep Appointment
                        </button>
                        <button
                          type="button"
                          disabled={isCancelling}
                          onClick={handleCancelAppointment}
                          className="px-4 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-semibold disabled:opacity-50"
                        >
                          {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CASE 3: REJECTED */}
              {statusData.status === 'REJECTED' && statusData.rejectionDetails && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Appointment Request Could Not Be Confirmed</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Reason Provided by Hospital Triage</span>
                    <p className="text-rose-800 font-medium mt-0.5">
                      {statusData.rejectionDetails.reason}
                    </p>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {statusData.rejectionDetails.advice}
                  </p>
                  {onRebook && (
                    <button
                      onClick={onRebook}
                      className="px-4 py-2 bg-medteal-600 hover:bg-medteal-700 text-white rounded-xl font-semibold transition-colors mt-2"
                    >
                      Submit a New Request
                    </button>
                  )}
                </div>
              )}

              {/* CASE 4: CANCELLED */}
              {statusData.status === 'CANCELLED' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    This appointment has been cancelled.
                  </p>
                  {statusData.cancellationDetails?.reason && (
                    <p className="text-slate-600">
                      Reason: <em>"{statusData.cancellationDetails.reason}"</em>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-200/70 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
