import React from 'react';
import { CheckCircle2, Clock, Copy, Search, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface BookingSuccessModalProps {
  reference: string;
  patientName: string;
  specialtyName: string;
  preferredDate: string;
  onClose: () => void;
  onTrackStatus: (ref: string) => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  reference,
  patientName,
  specialtyName,
  preferredDate,
  onClose,
  onTrackStatus,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg border border-slate-200 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4 border border-amber-100 shadow-sm">
          <Clock className="w-8 h-8" />
        </div>

        <span className="inline-block bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full mb-2">
          Status: Pending Hospital Review
        </span>

        <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
          Request Submitted Successfully
        </h3>

        <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
          Your consultation request has been securely persisted in the hospital clinical queue. Hospital staff are currently reviewing physician availability and clinic suite reservations.
        </p>

        {/* Public Reference Card */}
        <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-left">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Private Reference Code
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-medteal-700 hover:text-medteal-800 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <div className="font-mono text-lg font-extrabold text-navy-900 tracking-wide select-all bg-white p-2.5 rounded-xl border border-slate-200 text-center">
            {reference}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-medteal-600 shrink-0" />
            <span>Keep this reference safe. You will need it together with your phone number to track confirmation.</span>
          </p>
        </div>

        {/* Key Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs text-left mb-6 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px]">Patient</span>
            <span className="font-semibold text-navy-900">{patientName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Specialty</span>
            <span className="font-semibold text-navy-900">{specialtyName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Requested Date</span>
            <span className="font-semibold text-navy-900">{preferredDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Next Step</span>
            <span className="font-semibold text-amber-700">Staff Allocation</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Window
          </button>
          <button
            onClick={() => {
              onClose();
              onTrackStatus(reference);
            }}
            className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-semibold text-white bg-medteal-600 hover:bg-medteal-700 rounded-xl shadow-soft transition-all flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Track Status Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
