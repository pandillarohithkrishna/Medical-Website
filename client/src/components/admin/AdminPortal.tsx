import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Users,
  DoorClosed,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Search,
  Filter,
  Plus,
  LogOut,
  RefreshCw,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppointmentRequest, DashboardMetrics, Doctor, Room, AuditLog, Specialty } from '../../types';
import { api } from '../../services/api';
import { RequestReviewModal } from './RequestReviewModal';
import { DoctorManagementModal } from './DoctorManagementModal';
import { RoomManagementModal } from './RoomManagementModal';

interface AdminPortalProps {
  onClose: () => void;
  specialties: Specialty[];
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onClose, specialties }) => {
  const { user, logout, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'DOCTORS' | 'ROOMS' | 'AUDIT'>('REQUESTS');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Filters & search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<AppointmentRequest | null>(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Fetch metrics and active data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, reqRes, docRes, roomRes] = await Promise.all([
        api.getMetrics(),
        api.getRequests(statusFilter === 'ALL' ? undefined : statusFilter, searchQuery || undefined),
        api.getAdminDoctors(),
        api.getRooms(),
      ]);

      setMetrics(metricsRes.metrics);
      setRequests(reqRes.requests);
      setDoctors(docRes.doctors);
      setRooms(roomRes.rooms);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setAuditLogs(res.logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'AUDIT') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleToggleRoom = async (roomId: string, currentActive: boolean) => {
    try {
      await api.toggleRoomActive(roomId, !currentActive);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update room');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Admin Navigation Bar */}
      <header className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between border-b border-navy-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-medteal-500 text-white flex items-center justify-center font-bold shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">
              AuraHealth <span className="text-medteal-400 font-normal">| Hospital Operations & Triage</span>
            </h1>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Logged in as <strong className="text-white">{user?.fullName}</strong> ({user?.role})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Exit to Website
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Real-time DB Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Requests</span>
              <span className="text-2xl font-extrabold text-navy-900 mt-1 block">{metrics.totalRequests}</span>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 shadow-soft">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending Review
              </span>
              <span className="text-2xl font-extrabold text-amber-900 mt-1 block">{metrics.pendingRequests}</span>
            </div>
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70 shadow-soft">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{metrics.confirmedAppointments}</span>
            </div>
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/70 shadow-soft">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Rejected
              </span>
              <span className="text-2xl font-extrabold text-rose-900 mt-1 block">{metrics.rejectedRequests}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Visits</span>
              <span className="text-2xl font-extrabold text-medblue-600 mt-1 block">{metrics.todaysAppointments}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Doctors</span>
              <span className="text-2xl font-extrabold text-navy-900 mt-1 block">{metrics.activeDoctors}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinic Suites</span>
              <span className="text-2xl font-extrabold text-navy-900 mt-1 block">{metrics.configuredRooms}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation Controls */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'REQUESTS'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              Appointment Queue ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('DOCTORS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'DOCTORS'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              Doctors & Roster ({doctors.length})
            </button>
            <button
              onClick={() => setActiveTab('ROOMS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'ROOMS'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              Clinic Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'AUDIT'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              Clinical Audit Trail
            </button>
          </div>

          {/* Action additions for admin */}
          <div className="flex items-center gap-2">
            {activeTab === 'DOCTORS' && isAdmin && (
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </button>
            )}
            {activeTab === 'ROOMS' && isAdmin && (
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-medblue-600 hover:bg-medblue-700 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTENT 1: APPOINTMENTS QUEUE */}
        {activeTab === 'REQUESTS' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'PENDING_REVIEW', 'CONFIRMED', 'REJECTED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      statusFilter === st
                        ? 'bg-medblue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reference or patient..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-medblue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4">Patient Info</th>
                    <th className="py-3.5 px-4">Concern & Specialty</th>
                    <th className="py-3.5 px-4">Requested / Confirmed</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy-900 whitespace-nowrap">
                          {req.publicReference}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-navy-900 block">{req.patientName}</span>
                          <span className="text-slate-500 block text-[11px]">{req.contactNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-semibold text-medteal-800 bg-medteal-50 px-2 py-0.5 rounded-md text-[11px] inline-block mb-0.5">
                            {req.specialty?.name}
                          </span>
                          <p className="text-slate-600 truncate text-[11px]">{req.problemSummary}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {req.status === 'CONFIRMED' && req.appointment ? (
                            <div>
                              <span className="font-bold text-emerald-800 block text-[11px]">
                                {new Date(req.appointment.startAt).toLocaleDateString()}
                              </span>
                              <span className="text-slate-500 block text-[10px]">
                                {req.appointment.doctor.fullName.split(',')[0]} • {req.appointment.room.roomNumber}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-semibold text-navy-900 block text-[11px]">{req.preferredDate}</span>
                              <span className="text-slate-400 block text-[10px]">{req.preferredTimeRange}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {req.status === 'PENDING_REVIEW' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Pending Review
                            </span>
                          )}
                          {req.status === 'CONFIRMED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              Confirmed
                            </span>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                              Rejected
                            </span>
                          )}
                          {req.status === 'CANCELLED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {req.status === 'PENDING_REVIEW' ? (
                            <button
                              onClick={() => setSelectedRequestForReview(req)}
                              className="px-3 py-1.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl font-semibold shadow-2xs transition-all"
                            >
                              Triage & Allocate
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedRequestForReview(req)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No appointment requests found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: DOCTORS */}
        {activeTab === 'DOCTORS' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-medblue-100 text-medblue-700 font-bold flex items-center justify-center shrink-0">
                    {doc.fullName.replace('Dr. ', '').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">{doc.doctorCode}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${doc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h4 className="font-bold text-navy-900 truncate mt-0.5">{doc.fullName}</h4>
                    <span className="text-medteal-700 font-semibold block">{doc.specialty?.name}</span>
                    <span className="text-slate-500 block text-[11px] mt-1">{doc.experienceYears} yrs • ${doc.consultationFee} • {doc.appointmentDurationMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: CLINIC ROOMS */}
        {activeTab === 'ROOMS' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy-900 text-sm">{room.roomNumber}</h4>
                    <span className="text-slate-500 text-xs">{room.department}</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleToggleRoom(room.id, room.isActive)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                        room.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {room.isActive ? 'Active' : 'Disabled'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: AUDIT LOGS */}
        {activeTab === 'AUDIT' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-100">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Immutable Healthcare Audit Trail</h3>
              <p className="text-[11px] text-slate-500">Every transactional approval, rejection, and cancellation is cryptographically recorded.</p>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className="font-semibold text-navy-900 block">{log.actor?.fullName || 'Patient / Guest'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.actorRole}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {log.entityType} ({log.entityId.slice(0, 8)}...)
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate" title={log.metadata || ''}>
                        {log.metadata || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <RequestReviewModal
        request={selectedRequestForReview}
        doctors={doctors}
        rooms={rooms}
        onClose={() => setSelectedRequestForReview(null)}
        onSuccess={() => loadDashboardData()}
      />

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <DoctorManagementModal
          specialties={specialties}
          onClose={() => setShowAddDoctorModal(false)}
          onSuccess={() => loadDashboardData()}
        />
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <RoomManagementModal
          onClose={() => setShowAddRoomModal(false)}
          onSuccess={() => loadDashboardData()}
        />
      )}
    </div>
  );
};
