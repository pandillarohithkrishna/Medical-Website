import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-amber-900 text-xs sm:text-sm font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Medical Notice:</strong> If you are experiencing acute chest pain, severe shortness of breath, sudden numbness, or life-threatening symptoms, please call emergency services (911 / 112) or go to the nearest emergency room immediately.
          </span>
        </div>
      </div>
    </div>
  );
};
