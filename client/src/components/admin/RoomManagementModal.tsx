import React, { useState } from 'react';
import { X, DoorClosed, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface RoomManagementModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomManagementModal: React.FC<RoomManagementModalProps> = ({ onClose, onSuccess }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !department.trim()) {
      setError('Please provide room number and department.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.createRoom({
        roomNumber: roomNumber.trim(),
        department: department.trim(),
        isActive: true,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-soft-lg border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center border border-medblue-100 shadow-sm">
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-navy-900">Add Clinical Room</h3>
            <span className="text-xs text-slate-500 block">Configure consultation suite for hospital bookings</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-navy-900 mb-1">Room Designation / Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Suite 305 - Neuro Care"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Department / Wing & Floor</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Neuroscience Pavilion, 3rd Floor"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              required
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
                <span>Register Room</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
