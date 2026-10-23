import React, { useState, useEffect } from 'react';
import { Shield, Calendar, UserCheck, Search, Menu, X, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenStatusTracker: () => void;
  onOpenAdminPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenStatusTracker,
  onOpenAdminPortal,
  onNavigateSection,
}) => {
  const { isStaff, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Find Doctors', sectionId: 'doctors' },
    { label: 'Specialties', sectionId: 'specialties' },
    { label: 'How It Works', sectionId: 'how-it-works' },
    { label: 'FAQ', sectionId: 'faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medteal-600 to-medblue-600 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-navy-900 flex items-center">
                Aura<span className="text-medteal-600">Health</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 block -mt-1">
                Medical Centre
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => onNavigateSection(item.sectionId)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 rounded-lg hover:bg-slate-100/70 transition-colors"
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={onOpenStatusTracker}
              className="px-3 py-2 text-sm font-medium text-medteal-700 hover:text-medteal-800 rounded-lg hover:bg-medteal-50 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Check Status</span>
            </button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onOpenAdminPortal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200/70 transition-all flex items-center gap-1.5"
              title="Hospital Staff Portal"
            >
              <Shield className="w-3.5 h-3.5 text-medblue-600" />
              <span>{isStaff ? `Staff (${user?.role})` : 'Staff Portal'}</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-medteal-600 to-medblue-600 hover:from-medteal-700 hover:to-medblue-700 rounded-xl shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-medteal-600 rounded-lg"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-navy-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2.5 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.sectionId}
              onClick={() => {
                onNavigateSection(item.sectionId);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenStatusTracker();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-base font-medium text-medteal-700 hover:bg-medteal-50 rounded-lg flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Check Appointment Status
          </button>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 text-center text-sm font-semibold text-white bg-medteal-600 rounded-xl"
            >
              Book Appointment
            </button>
            <button
              onClick={() => {
                onOpenAdminPortal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              Hospital Staff Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
