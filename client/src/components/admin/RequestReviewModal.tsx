import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AppointmentRequest, Doctor, Room } from '../../types';
import { api } from '../../services/api';

interface RequestReviewModalProps {
  request: AppointmentRequest | null;
  doctors: Doctor[];
  rooms: Room[];
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestReviewModal: React.FC<RequestReviewModalProps> = ({
  request,
  doctors,
  rooms,
  onClose,
  onSuccess,
}) => {
  const [activeAction, setActiveAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approval fields
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [selectedSlotISO, setSelectedSlotISO] = useState<{ startAt: string; endAt: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{ startTime: string; endTime: string; startAtISO: string; endAtISO: string }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');

  // Rejection fields
  const [patientFacingReason, setPatientFacingReason] = useState('');
  const [internalStaffNotes, setInternalStaffNotes] = useState('');

  useEffect(() => {
    if (!request) return;

    // Pre-populate doctor
    if (request.preferredDoctorId) {
      setSelectedDoctorId(request.preferredDoctorId);
    } else {
      const matchDoc = doctors.find((d) => d.specialtyId === request.specialtyId);
      if (matchDoc) setSelectedDoctorId(matchDoc.id);
      else if (doctors.length > 0) setSelectedDoctorId(doctors[0].id);
    }

    setAppointmentDate(request.preferredDate || new Date().toISOString().split('T')[0]);
    setSelectedSlotISO(null);
    setSelectedRoomId('');
    setError(null);
  }, [request, doctors]);

  // Query live free slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const res = await api.getDoctorAvailableSlots(selectedDoctorId, appointmentDate);
        setAvailableSlots(res.availableSlots);
        if (res.availableSlots.length > 0) {
          setSelectedSlotISO({
            startAt: res.availableSlots[0].startAtISO,
            endAt: res.availableSlots[0].endAtISO,
          });
        } else {
          setSelectedSlotISO(null);
        }
      } catch (err: any) {
        console.error('Failed to load slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  // Query live free rooms whenever selected slot changes
  useEffect(() => {
    if (!selectedSlotISO?.startAt || !selectedSlotISO?.endAt) {
      setAvailableRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const res = await api.getAvailableRooms(selectedSlotISO.startAt, selectedSlotISO.endAt);
        setAvailableRooms(res.availableRooms);
        if (res.availableRooms.length > 0) {
          setSelectedRoomId(res.availableRooms[0].id);
        } else {
          setSelectedRoomId('');
        }
      } catch (err: any) {
        console.error('Failed to load rooms:', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [selectedSlotISO]);

  if (!request) return null;

  const handleApprove = async () => {
    if (!selectedDoctorId) {
      setError('Please assign an accredited doctor.');
      return;
    }
    if (!selectedSlotISO?.startAt || !selectedSlotISO?.endAt) {
      setError('Please select an available appointment time slot.');
      return;
    }
    if (!selectedRoomId) {
      setError('Please select an available consultation room.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.approveRequest({
        requestId: request.id,
        doctorId: selectedDoctorId,
        roomId: selectedRoomId,
        startAt: selectedSlotISO.startAt,
        endAt: selectedSlotISO.endAt,
        notes: staffNotes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Approval failed. Possible schedule or room conflict.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!patientFacingReason.trim() || patientFacingReason.trim().length < 3) {
      setError('Please provide a patient-facing reason for rejection.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.rejectRequest({
        requestId: request.id,
        patientFacingReason: patientFacingReason.trim(),
        internalNotes: internalStaffNotes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Rejection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-soft-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-mono font-bold text-medblue-700 uppercase tracking-wider block">
              {request.publicReference}
            </span>
            <h2 className="text-xl font-bold text-navy-900">Hospital Triage & Request Review</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Details & Health Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-slate-200/70">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Patient</span>
                <span className="font-bold text-navy-900">{request.patientName}</span>
                <span className="text-slate-500 block text-[11px]">Age: {request.patientAge}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Contact</span>
                <span className="font-semibold text-navy-900">{request.contactNumber}</span>
                {request.email && <span className="text-slate-500 block text-[11px] truncate">{request.email}</span>}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Specialty</span>
                <span className="font-semibold text-navy-900">{request.specialty?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Requested Pref</span>
                <span className="font-semibold text-navy-900">{request.preferredDate}</span>
                <span className="text-slate-500 block text-[11px]">{request.preferredTimeRange}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Chief Complaint</span>
              <p className="font-semibold text-navy-900 mt-0.5">{request.problemSummary}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Clinical Symptoms Description</span>
              <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                {request.symptomDescription}
              </p>
            </div>
          </div>

          {/* Action Tabs: Approve vs Reject */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveAction('APPROVE')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeAction === 'APPROVE'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Allocate Resources</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAction('REJECT')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeAction === 'REJECT'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request</span>
            </button>
          </div>

          {/* TAB 1: APPROVAL FORM */}
          {activeAction === 'APPROVE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Assign Specialist Doctor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName} ({doc.specialty?.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Appointment Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Time Slot Selection (Live calculated from doctor schedule - bookings) */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Verified Free Slot (Conflict-Checked) <span className="text-rose-500">*</span>
                </label>
                {isLoadingSlots ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-medteal-600" />
                    <span>Loading available slots for doctor schedule...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot, i) => {
                      const isSelected = selectedSlotISO?.startAt === slot.startAtISO;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedSlotISO({ startAt: slot.startAtISO, endAt: slot.endAtISO })}
                          className={`p-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {slot.startTime} – {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    No free slots found on this date for the assigned doctor. Please select an alternative date.
                  </p>
                )}
              </div>

              {/* Room Selection (Live calculated from room - bookings) */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Assign Hospital Room <span className="text-rose-500">*</span>
                </label>
                {isLoadingRooms ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-medteal-600" />
                    <span>Verifying available hospital suites...</span>
                  </div>
                ) : availableRooms.length > 0 ? (
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.department})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    No rooms are free during this time slot. Please choose another time.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Internal Staff Notes</label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g. Advised patient to bring previous ECG records."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* TAB 2: REJECTION FORM */}
          {activeAction === 'REJECT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Patient-Facing Rejection Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={patientFacingReason}
                  onChange={(e) => setPatientFacingReason(e.target.value)}
                  placeholder="e.g. The requested specialist is fully booked for clinical rotations. Please select an alternative date or visit Urgent Care."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This explanation is visible to the patient on their status lookup page.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Internal Staff Triage Notes</label>
                <textarea
                  rows={2}
                  value={internalStaffNotes}
                  onChange={(e) => setInternalStaffNotes(e.target.value)}
                  placeholder="Internal audit notes (hidden from patient)..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>

          {activeAction === 'APPROVE' ? (
            <button
              type="button"
              disabled={isSubmitting || !selectedSlotISO || !selectedRoomId}
              onClick={handleApprove}
              className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enforcing Reservation Transaction...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Appointment</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !patientFacingReason.trim()}
              onClick={handleReject}
              className="px-6 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Database...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Reject Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
