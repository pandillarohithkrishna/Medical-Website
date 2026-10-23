import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Doctor, Specialty } from '../../types';
import { api } from '../../services/api';

interface DoctorManagementModalProps {
  specialties: Specialty[];
  onClose: () => void;
  onSuccess: () => void;
}

export const DoctorManagementModal: React.FC<DoctorManagementModalProps> = ({
  specialties,
  onClose,
  onSuccess,
}) => {
  const [doctorCode, setDoctorCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialtyId, setSpecialtyId] = useState(specialties[0]?.id || '');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>(10);
  const [languages, setLanguages] = useState('English');
  const [consultationFee, setConsultationFee] = useState<number | ''>(150);
  const [duration, setDuration] = useState<number>(30);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorCode.trim() || !fullName.trim() || !specialtyId || !qualifications.trim()) {
      setError('Please fill all required doctor fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.createDoctor({
        doctorCode: doctorCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        specialtyId,
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears) || 0,
        languages: languages.trim(),
        consultationFee: Number(consultationFee) || 100,
        appointmentDurationMinutes: duration,
        profileImageUrl: profileImageUrl.trim() || undefined,
        isActive: true,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to register doctor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center border border-medblue-100 shadow-sm">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-navy-900">Add Healthcare Specialist</h3>
            <span className="text-xs text-slate-500 block">Register specialist into hospital clinical roster</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-navy-900 mb-1">Doctor Code (ID)</label>
              <input
                type="text"
                value={doctorCode}
                onChange={(e) => setDoctorCode(e.target.value)}
                placeholder="e.g. DOC-CAR-08"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-navy-900 mb-1">Specialty</label>
              <select
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              >
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Full Legal Name & Title</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Arthur Pendelton, MD"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Qualifications & Fellowships</label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="e.g. MD Stanford University, Board Certified"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-navy-900 mb-1">Experience (Yrs)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-navy-900 mb-1">Fee ($)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-navy-900 mb-1">Slot Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Languages Spoken</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g. English, Spanish"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Profile Photo URL (Optional)</label>
            <input
              type="url"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Register Specialist</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
