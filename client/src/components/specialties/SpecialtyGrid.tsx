import React from 'react';
import {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Stethoscope,
  Sparkles,
  Flower2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Specialty } from '../../types';

interface SpecialtyGridProps {
  specialties: Specialty[];
  selectedSpecialtyId?: string | null;
  onSelectSpecialty: (id: string | null) => void;
}

const iconMap: Record<string, React.ElementType> = {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Stethoscope,
  Sparkles,
  Flower2,
  Activity,
};

export const SpecialtyGrid: React.FC<SpecialtyGridProps> = ({
  specialties,
  selectedSpecialtyId,
  onSelectSpecialty,
}) => {
  return (
    <section id="specialties" className="py-20 bg-slate-50/70 border-y border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-medteal-700 bg-medteal-50 px-3 py-1 rounded-full border border-medteal-100">
            Clinical Departments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-3 mb-4">
            Specialized Medical Disciplines
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Select a specialty to explore accredited doctors, clinical schedules, and consultation availability.
          </p>
        </div>

        {/* Grid of Specialties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* "All Specialties" card */}
          <div
            onClick={() => onSelectSpecialty(null)}
            className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 border ${
              selectedSpecialtyId === null
                ? 'bg-gradient-to-br from-navy-900 to-navy-800 text-white shadow-soft-lg scale-[1.02] border-navy-700'
                : 'bg-white hover:bg-slate-50/80 text-navy-900 border-slate-200/80 hover:shadow-soft'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                selectedSpecialtyId === null
                  ? 'bg-medteal-500 text-white'
                  : 'bg-medteal-50 text-medteal-700 border border-medteal-100'
              }`}
            >
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1.5">All Departments</h3>
            <p
              className={`text-xs leading-relaxed mb-4 ${
                selectedSpecialtyId === null ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              View all available board-certified specialists and hospital clinic suites.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={selectedSpecialtyId === null ? 'text-medteal-300' : 'text-medteal-700'}>
                Show all doctors
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Dynamic Specialty Cards */}
          {specialties.map((specialty) => {
            const IconComponent = iconMap[specialty.iconName] || Activity;
            const isSelected = selectedSpecialtyId === specialty.id;

            return (
              <div
                key={specialty.id}
                onClick={() => onSelectSpecialty(specialty.id)}
                className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 border ${
                  isSelected
                    ? 'bg-gradient-to-br from-navy-900 to-navy-800 text-white shadow-soft-lg scale-[1.02] border-navy-700'
                    : 'bg-white hover:bg-slate-50/80 text-navy-900 border-slate-200/80 hover:shadow-soft'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-medteal-500 text-white'
                      : 'bg-medblue-50 text-medblue-700 border border-medblue-100'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <h3 className="text-lg font-bold">{specialty.name}</h3>
                  {specialty._count && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/10 text-medteal-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {specialty._count.doctors} {specialty._count.doctors === 1 ? 'Doctor' : 'Doctors'}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed mb-4 line-clamp-2 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {specialty.description}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-medteal-300' : 'text-medblue-600'}>
                    Filter by specialty
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
