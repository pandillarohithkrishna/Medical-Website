import React from 'react';
import { Activity, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

export const WebGLFallback: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[380px] md:min-h-[460px] flex items-center justify-center p-6 relative select-none">
      {/* Decorative gradient backdrops */}
      <div className="absolute inset-0 bg-gradient-to-tr from-medteal-500/10 via-medblue-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
      
      {/* Main glass composition */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-soft-lg text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-medteal-100 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-medblue-100 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        {/* Central visual icon cluster */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-medteal-500 to-medblue-600 rounded-2xl rotate-6 opacity-20 animate-pulse" />
          <div className="absolute inset-0 bg-white shadow-soft rounded-2xl flex items-center justify-center border border-slate-100">
            <HeartPulse className="w-12 h-12 text-medteal-600" />
          </div>
          <div className="absolute -top-2 -right-2 bg-medblue-600 text-white p-2 rounded-xl shadow-md">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-navy-900 tracking-tight mb-2">
          Clinical Excellence & Care
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Board-certified specialist network offering verified consultation schedules and validated hospital clinical rooms.
        </p>

        {/* Key trust badges */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-left">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-medteal-50 flex items-center justify-center text-medteal-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-900">Verified Slots</p>
              <p className="text-[11px] text-slate-500">Zero double-booking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-medblue-50 flex items-center justify-center text-medblue-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-900">Hospital Triage</p>
              <p className="text-[11px] text-slate-500">Staff reviewed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
