import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebGLFallback } from '../components/3d/WebGLFallback';
import { BookingSuccessModal } from '../components/booking/BookingSuccessModal';

describe('Frontend Clinical Interface Components', () => {
  it('renders WebGL Fallback gracefully with medical accessibility badges', () => {
    render(<WebGLFallback />);
    expect(screen.getByText(/Clinical Excellence & Care/i)).toBeDefined();
    expect(screen.getByText(/Zero double-booking/i)).toBeDefined();
    expect(screen.getByText(/Hospital Triage/i)).toBeDefined();
  });

  it('renders BookingSuccessModal with unique reference and Pending Review status', () => {
    const handleClose = vi.fn();
    const handleTrack = vi.fn();

    render(
      <BookingSuccessModal
        reference="REQ-2026-TEST-9988"
        patientName="Clara Oswald"
        specialtyName="Cardiology"
        preferredDate="2026-10-25"
        onClose={handleClose}
        onTrackStatus={handleTrack}
      />
    );

    expect(screen.getByText(/Status: Pending Hospital Review/i)).toBeDefined();
    expect(screen.getByText('REQ-2026-TEST-9988')).toBeDefined();
    expect(screen.getByText('Clara Oswald')).toBeDefined();
    expect(screen.getByText('Cardiology')).toBeDefined();

    const trackBtn = screen.getByText(/Track Status Now/i);
    fireEvent.click(trackBtn);
    expect(handleTrack).toHaveBeenCalledWith('REQ-2026-TEST-9988');
  });
});
