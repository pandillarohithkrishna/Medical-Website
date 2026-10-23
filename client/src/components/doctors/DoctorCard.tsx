import React, { useRef, useState } from 'react';
import { Calendar, Clock, Award, Globe, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  onViewProfile: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook, onViewProfile }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Restrained, subtle 3D perspective tilt
    setRotateX(((y - centerY) / centerY) * -5);
    setRotateY(((x - centerX) / centerX) * 5);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const activeDaysCount = doctor.schedules ? doctor.schedules.filter(s => s.isActive).length : 6;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
      }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-lg flex flex-col justify-between overflow-hidden group"
    >
      <div>
        {/* Top Header / Avatar & Code */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start gap-4">
          <div className="relative shrink-0">
            {doctor.profileImageUrl ? (
              <img
                src={doctor.profileImageUrl}
                alt={doctor.fullName}
                className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-medteal-600 to-medblue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {doctor.fullName.replace('Dr. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" title="Active Specialist" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {doctor.doctorCode}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Mon-Sat
              </span>
            </div>
            <h3 className="text-base font-bold text-navy-900 truncate mt-1 group-hover:text-medblue-600 transition-colors">
              {doctor.fullName}
            </h3>
            <p className="text-xs font-medium text-medteal-700 font-semibold truncate">
              {doctor.specialty?.name || 'Specialist'}
            </p>
          </div>
        </div>

        {/* Doctor Details Body */}
        <div className="p-5 space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 text-slate-700">{doctor.qualifications}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Experience</span>
              <span className="font-semibold text-navy-900">{doctor.experienceYears}+ Years</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Duration</span>
              <span className="font-semibold text-navy-900">{doctor.appointmentDurationMinutes} Mins / Slot</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[140px]">{doctor.languages}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
              <span className="text-sm font-bold text-navy-900">${doctor.consultationFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(doctor);
          }}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1"
        >
          <span>Availability</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook(doctor);
          }}
          className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-medteal-600 hover:bg-medteal-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Request</span>
        </button>
      </div>
    </div>
  );
};
