import React, { useState } from 'react';
import { Info, Key, X, Check, ExternalLink } from 'lucide-react';

interface DemoNoticeProps {
  onOpenAdminLogin: () => void;
  onTrackDemoReference?: (ref: string, contact: string) => void;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({ onOpenAdminLogin, onTrackDemoReference }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <>
      {/* Persistent floating Demo Pill */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-navy-900/90 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-soft-lg border border-slate-700/60 transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-medteal-400 animate-ping" />
          <span>DEMO PLATFORM ACTIVE</span>
          <Info className="w-3.5 h-3.5 text-medteal-400 ml-1" />
        </button>
      </div>

      {/* Demo Information Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-soft-lg border border-slate-200 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-medteal-50 flex items-center justify-center text-medteal-700 border border-medteal-100">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">Platform Demonstration Environment</h3>
                <span className="inline-block bg-medteal-100 text-medteal-800 text-[11px] font-semibold px-2 py-0.5 rounded-md mt-0.5">
                  Full-Stack Interactive Demo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This system connects to an active SQLite relational backend running transactional conflict checks and double-booking prevention. You can submit real appointment requests, check live status records, or sign in as hospital staff to approve or reject requests.
            </p>

            <div className="space-y-3 mb-5">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-navy-900">Hospital Admin Credentials</span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="text-xs font-semibold text-medblue-600 hover:text-medblue-700 flex items-center gap-1"
                  >
                    Open Staff Portal <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={() => handleCopy('admin@aurahealth.demo', 'email')}
                    className="cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-medblue-300 transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Email</span>
                    <span className="font-mono text-slate-700 font-medium">admin@aurahealth.demo</span>
                  </div>
                  <div
                    onClick={() => handleCopy('AdminPassword123!', 'pass')}
                    className="cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-medblue-300 transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Password</span>
                    <span className="font-mono text-slate-700 font-medium">AdminPassword123!</span>
                  </div>
                </div>
                {copiedText && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copied {copiedText} to clipboard!
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-navy-900 block mb-2">Sample Patient Reference Records</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-mono font-bold text-amber-700">REQ-2026-A1B2-C3D4</span>
                      <span className="text-slate-500 text-[11px] ml-2">(Pending Review - Sophia M.)</span>
                    </div>
                    {onTrackDemoReference && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onTrackDemoReference('REQ-2026-A1B2-C3D4', 'sophia.montgomery@example.com');
                        }}
                        className="text-xs font-semibold text-medteal-700 hover:underline"
                      >
                        Track
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-mono font-bold text-emerald-700">REQ-2026-CONF-9821</span>
                      <span className="text-slate-500 text-[11px] ml-2">(Confirmed - David V.)</span>
                    </div>
                    {onTrackDemoReference && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onTrackDemoReference('REQ-2026-CONF-9821', 'david.vance@example.com');
                        }}
                        className="text-xs font-semibold text-medteal-700 hover:underline"
                      >
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
