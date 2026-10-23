import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Award, Globe, DollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Doctor } from '../../types';
import { api } from '../../services/api';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ doctor, onClose, onBook }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!doctor || !selectedDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSlotMessage(null);
      try {
        const res = await api.getDoctorAvailableSlots(doctor.id, selectedDate);
        setSlots(res.availableSlots);
        if (res.availableSlots.length === 0) {
          setSlotMessage('Doctor is not scheduled or slots are currently booked for this date.');
        }
      } catch (err: any) {
        setSlotMessage(err.message || 'Unable to load slots');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor, selectedDate]);

  if (!doctor) return null;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-soft-lg border border-slate-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {doctor.profileImageUrl ? (
              <img
                src={doctor.profileImageUrl}
                alt={doctor.fullName}
                className="w-24 h-24 rounded-2xl object-cover object-top border-4 border-white/10 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-medteal-600 text-white font-bold text-3xl flex items-center justify-center border-4 border-white/10 shadow-lg">
                {doctor.fullName.replace('Dr. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            )}
            <div className="text-center sm:text-left">
              <span className="inline-block bg-medteal-500/20 text-medteal-300 border border-medteal-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                {doctor.doctorCode} • {doctor.specialty?.name}
              </span>
              <h2 className="text-2xl font-bold">{doctor.fullName}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md">{doctor.qualifications}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Clinical Exp</span>
              <span className="text-sm font-bold text-navy-900">{doctor.experienceYears} Years</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Consult Fee</span>
              <span className="text-sm font-bold text-navy-900">${doctor.consultationFee}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Languages</span>
              <span className="text-xs font-semibold text-navy-900 truncate block">{doctor.languages}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Slot Length</span>
              <span className="text-sm font-bold text-navy-900">{doctor.appointmentDurationMinutes} Mins</span>
            </div>
          </div>

          {/* Schedule & Real-Time Availability Inspector */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-900">Check Available Consultation Slots</h3>
                <p className="text-xs text-slate-500">Live slots derived from clinic operating hours and existing confirmed bookings.</p>
              </div>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-medteal-500 bg-white"
              />
            </div>

            {isLoadingSlots ? (
              <div className="flex items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <Loader2 className="w-6 h-6 text-medteal-600 animate-spin mr-2" />
                <span className="text-xs font-semibold text-slate-600">Calculating real-time slot availability...</span>
              </div>
            ) : slots.length > 0 ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-semibold text-navy-900">
                    {slots.length} Free Slots Available on {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}:
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bookable via request
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    >
                      {slot.startTime} – {slot.endTime}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{slotMessage || 'No slots available on this date. Doctor may have clinics on other days of the week.'}</span>
              </div>
            )}
          </div>

          {/* Configured Weekly Working Schedule */}
          {doctor.schedules && doctor.schedules.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Working Schedule</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {doctor.schedules.map((sch) => (
                  <div key={sch.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-navy-900 block">{daysOfWeek[sch.dayOfWeek]}</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {sch.startTime} – {sch.endTime}
                    </span>
                    {sch.breakStartTime && (
                      <span className="text-[10px] text-slate-400 block">
                        Break: {sch.breakStartTime}-{sch.breakEndTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(doctor);
              }}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-medteal-600 hover:bg-medteal-700 rounded-xl shadow-soft transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Appointment with {doctor.fullName.split(' ')[1] || 'Doctor'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
