import React from 'react';
import { Send, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenBooking: () => void;
  onOpenStatusTracker: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onOpenBooking, onOpenStatusTracker }) => {
  const steps = [
    {
      number: '01',
      title: 'Submit Appointment Request',
      subtitle: 'Patient Details & Health Concern',
      description:
        'Specify your symptoms, preferred medical discipline, and preferred doctor or date. Receive an unguessable private reference number immediately upon submission.',
      badge: 'Initial State: Pending Review',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Send,
    },
    {
      number: '02',
      title: 'Hospital Clinical Triage',
      subtitle: 'Staff Schedule & Room Verification',
      description:
        'Authorized hospital clinicians and triage coordinators evaluate your request, check doctor working hours, and verify that consultation suites are free to prevent double booking.',
      badge: 'Transactional Conflict Check',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: ShieldCheck,
    },
    {
      number: '03',
      title: 'Confirmed Appointment Details',
      subtitle: 'Assigned Specialist, Time & Room',
      description:
        'Upon staff approval, check your status to see the verified doctor name, doctor code, confirmed date, exact appointment window, and assigned hospital suite.',
      badge: 'Genuine Saved Details',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-medteal-700 bg-medteal-50 px-3 py-1 rounded-full border border-medteal-100">
            Transparent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-3 mb-4">
            How Appointment Confirmation Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Unlike superficial booking forms that show instant fake confirmations, our platform follows actual hospital operational governance to guarantee clinic availability.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-slate-50/70 rounded-3xl p-8 border border-slate-200/80 hover:shadow-soft-lg transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-slate-300 font-mono group-hover:text-medteal-600 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-medteal-600 border border-slate-100">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border mb-3 ${step.badgeColor}`}>
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-bold text-navy-900 mb-1">{step.title}</h3>
                  <h4 className="text-xs font-semibold text-medteal-700 mb-3">{step.subtitle}</h4>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 group-hover:text-navy-900 transition-colors">
                    Step {idx + 1} of 3
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action callout banner */}
        <div className="mt-14 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-soft-lg">
          <div>
            <h3 className="text-xl font-bold">Ready to consult with a medical specialist?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Submit your consultation request in under two minutes or check an existing submission.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenStatusTracker}
              className="px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
            >
              Check Status
            </button>
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 text-xs font-semibold text-navy-900 bg-medteal-400 hover:bg-medteal-300 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
