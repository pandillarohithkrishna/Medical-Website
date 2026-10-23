import React, { useState } from 'react';
import { Search, Filter, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { Doctor, Specialty } from '../../types';
import { DoctorCard } from './DoctorCard';
import { DoctorDetailModal } from './DoctorDetailModal';

interface DoctorListProps {
  doctors: Doctor[];
  specialties: Specialty[];
  selectedSpecialtyId: string | null;
  onSelectSpecialty: (id: string | null) => void;
  onBookDoctor: (doctor: Doctor) => void;
  isLoading?: boolean;
}

export const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  specialties,
  selectedSpecialtyId,
  onSelectSpecialty,
  onBookDoctor,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDoctorForModal, setActiveDoctorForModal] = useState<Doctor | null>(null);

  // Filter doctors based on selectedSpecialtyId and search query
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpecialty = selectedSpecialtyId ? doc.specialtyId === selectedSpecialtyId : true;
    const cleanSearch = searchQuery.trim().toLowerCase();
    const matchesSearch = cleanSearch
      ? doc.fullName.toLowerCase().includes(cleanSearch) ||
        doc.doctorCode.toLowerCase().includes(cleanSearch) ||
        doc.qualifications.toLowerCase().includes(cleanSearch) ||
        doc.languages.toLowerCase().includes(cleanSearch) ||
        (doc.specialty?.name && doc.specialty.name.toLowerCase().includes(cleanSearch))
      : true;

    return matchesSpecialty && matchesSearch;
  });

  return (
    <section id="doctors" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-medblue-700 bg-medblue-50 px-3 py-1 rounded-full border border-medblue-100">
            Medical Faculty & Consultants
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-3">
            Find Your Healthcare Specialist
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl">
            Browse our accredited hospital clinicians across disciplines. Each doctor maintains verified consultation schedules and assigned clinic suites.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, specialty, language..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medteal-500 shadow-2xs placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Specialty Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => onSelectSpecialty(null)}
          className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
            selectedSpecialtyId === null
              ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Specialists ({doctors.length})
        </button>
        {specialties.map((spec) => {
          const isSelected = selectedSpecialtyId === spec.id;
          const count = doctors.filter((d) => d.specialtyId === spec.id).length;
          return (
            <button
              key={spec.id}
              onClick={() => onSelectSpecialty(spec.id)}
              className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{spec.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Doctors */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <RefreshCw className="w-8 h-8 text-medteal-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-navy-900">Loading verified specialist directory...</p>
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={onBookDoctor}
              onViewProfile={(d) => setActiveDoctorForModal(d)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900 mb-1">No Doctors Match Your Search</h3>
          <p className="text-xs text-slate-500 mb-5">
            We couldn't find any specialist matching your current filters. Try resetting the search or selecting another department.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectSpecialty(null);
            }}
            className="px-4 py-2 text-xs font-semibold text-medteal-700 bg-medteal-50 hover:bg-medteal-100 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Doctor Availability & Profile Modal */}
      <DoctorDetailModal
        doctor={activeDoctorForModal}
        onClose={() => setActiveDoctorForModal(null)}
        onBook={onBookDoctor}
      />
    </section>
  );
};
