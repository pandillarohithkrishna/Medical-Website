import React from 'react';
import { HeartPulse, Mail, Phone, MapPin, Shield, Clock } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenStatusTracker: () => void;
  onOpenAdminPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenStatusTracker,
  onOpenAdminPortal,
}) => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-medteal-500 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Aura<span className="text-medteal-400">Health</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A modern healthcare technology platform integrating clinical schedule verification, doctor specialty discovery, and triage-backed appointment management.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-medteal-400" /> Secure transactional confirmation
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-medteal-400" /> Mon – Sat: 09:00 AM – 05:00 PM
              </p>
            </div>
          </div>

          {/* Col 2: Patient Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Patient Portal</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={onOpenBooking} className="hover:text-white transition-colors">
                  Request an Appointment
                </button>
              </li>
              <li>
                <button onClick={onOpenStatusTracker} className="hover:text-white transition-colors">
                  Check Appointment Status
                </button>
              </li>
              <li>
                <a href="#doctors" className="hover:text-white transition-colors">
                  Explore Specialist Directory
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-white transition-colors">
                  Medical Specialties & Wings
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How Triage Review Works
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hospital Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Clinic Enquiries</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-medteal-400 shrink-0 mt-0.5" />
                <span>100 Medical Centre Boulevard, Suite 400, Metropolitan Healthcare District</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-medteal-400 shrink-0" />
                <span>+1 (555) 019-2000 (Central Reception)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-medteal-400 shrink-0" />
                <span>appointments@aurahealth.demo</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Administrative & Governance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Staff & Governance</h4>
            <p className="text-xs text-slate-400 mb-3">
              Hospital administration, triage officers, and department heads may access the management portal:
            </p>
            <button
              onClick={onOpenAdminPortal}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-medblue-400" />
              <span>Hospital Staff Sign In</span>
            </button>
            <p className="text-[11px] text-slate-500 mt-3">
              Protected healthcare system. All booking events, approvals, and room reservations are transaction-recorded for clinical audit compliance.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AuraHealth Medical Centre. All rights reserved. Demonstration Platform.</p>
          <div className="flex space-x-6 text-xs">
            <span className="hover:text-slate-400 cursor-pointer">Patient Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Consultation</span>
            <span className="hover:text-slate-400 cursor-pointer">Clinical Governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
