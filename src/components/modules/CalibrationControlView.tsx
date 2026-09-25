import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Wrench, CheckCircle2, Clock, AlertTriangle, Plus, Search, Download,
  X, FileText, Trash2, Eye, ChevronLeft, Edit3
} from 'lucide-react';
import { CalibrationInstrument, CalibrationEvent, Company } from '../../types';

interface CalibrationControlViewProps {
  company: Company;
}

const CalStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    'In Tolerance': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'Due Soon': 'bg-amber-50 text-amber-700 border-amber-300',
    Overdue: 'bg-red-50 text-red-700 border-red-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
};

// Initial default instrument matching pinned image: dd, S/N: d, 3-Sept-2026, 12 months, 3-Sept-2027, 342 days, In Tolerance
const initialInstrumentsList: CalibrationInstrument[] = [
  {
    id: 'cal-inst-1',
    instrumentId: 'CAL-INST-001',
    description: 'dd',
    serialNo: 'd',
    location: 'd',
    lastCal: '3-Sept-2026',
    interval: '12 months',
    nextDue: '3-Sept-2027',
    daysUntilDue: 342,
    status: 'In Tolerance',
    responsible: '—',
    provider: 'd',
    notes: '',
    calibrationEvents: [],
  },
];

const calculateDueInfo = (lastCalStr: string, intervalStr: string) => {
  const intervalMonths = parseInt(intervalStr, 10) || 12;
  let baseDate = new Date();
  if (lastCalStr) {
    const parsed = new Date(lastCalStr);
    if (!isNaN(parsed.getTime())) baseDate = parsed;
  }
  const nextDueDate = new Date(baseDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const formattedNextDue = `${nextDueDate.getDate()}-${months[nextDueDate.getMonth()]}-${nextDueDate.getFullYear()}`;
  const diffDays = Math.ceil((nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return { nextDue: formattedNextDue, daysUntilDue: diffDays };
};

export const CalibrationControlView: React.FC<CalibrationControlViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'due'>('register');
  const compPrefix = company?.name ? company.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() : 'NK';

  const [instruments, setInstruments] = useState<CalibrationInstrument[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company?.id}_calibration_instruments_v2`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_calibration_instruments_v2');
      if (saved) return JSON.parse(saved);
      // Fallback to previous v1 if present
      const oldScoped = localStorage.getItem(`sheq_${company?.id}_calibration_instruments`);
      if (oldScoped) return JSON.parse(oldScoped);
      const old = localStorage.getItem('sheq_calibration_instruments');
      if (old) return JSON.parse(old);
    } catch {}
    return initialInstrumentsList;
  });

  useEffect(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company.id}_calibration_instruments_v2`);
      if (savedScoped) {
        setInstruments(JSON.parse(savedScoped));
      } else {
        const saved = localStorage.getItem('sheq_calibration_instruments_v2');
        setInstruments(saved ? JSON.parse(saved) : initialInstrumentsList);
      }
    } catch {}
  }, [company.id]);

  useEffect(() => {
    try {
      localStorage.setItem('sheq_calibration_instruments_v2', JSON.stringify(instruments));
      if (company?.id) {
        localStorage.setItem(`sheq_${company.id}_calibration_instruments_v2`, JSON.stringify(instruments));
      }
    } catch {}
  }, [instruments, company?.id]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<CalibrationInstrument | null>(null);

  // Edit Instrument State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    description: '',
    serialNo: '',
    location: '',
    responsible: '',
    provider: '',
    lastCalDate: '',
    interval: '12 months',
    status: 'In Tolerance' as 'In Tolerance' | 'Due Soon' | 'Overdue',
    notes: '',
  });

  // Log Calibration Event State
  const [isLogEventModalOpen, setIsLogEventModalOpen] = useState(false);
  const [logEventForm, setLogEventForm] = useState({
    date: '',
    calibratedBy: '',
    result: 'Pass',
    certificateNo: '',
    notes: '',
  });

  const [formData, setFormData] = useState({
    instrumentId: '',
    description: '',
    serialNo: '',
    location: '',
    responsible: '',
    provider: '',
    lastCalDate: '',
    interval: '12 months',
    status: 'In Tolerance' as 'In Tolerance' | 'Due Soon' | 'Overdue',
    notes: '',
  });

  const [certificateFile, setCertificateFile] = useState<{ name: string; size?: string; dataUrl?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Esc closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setIsLogEventModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetForm = () => {
    setFormData({
      instrumentId: '',
      description: '',
      serialNo: '',
      location: '',
      responsible: '',
      provider: '',
      lastCalDate: '',
      interval: '12 months',
      status: 'In Tolerance',
      notes: '',
    });
    setCertificateFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const sizeKb = (file.size / 1024).toFixed(1);
      setCertificateFile({
        name: file.name,
        size: `${sizeKb} KB`,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.serialNo.trim()) return;

    const { nextDue, daysUntilDue } = calculateDueInfo(formData.lastCalDate, formData.interval);

    let lastCalFormatted = formData.lastCalDate;
    if (formData.lastCalDate) {
      const d = new Date(formData.lastCalDate);
      if (!isNaN(d.getTime())) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        lastCalFormatted = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
      }
    }

    const newInst: CalibrationInstrument = {
      id: Date.now().toString(),
      instrumentId: formData.instrumentId.trim() || `CAL-INST-${String(instruments.length + 1).padStart(3, '0')}`,
      description: formData.description.trim(),
      serialNo: formData.serialNo.trim(),
      location: formData.location.trim() || 'General Lab',
      lastCal: lastCalFormatted || '3-Sept-2026',
      interval: formData.interval,
      nextDue,
      daysUntilDue,
      status: formData.status,
      responsible: formData.responsible || '—',
      provider: formData.provider.trim(),
      notes: formData.notes.trim(),
      certificateName: certificateFile?.name,
      certificateUrl: certificateFile?.dataUrl,
      calibrationEvents: [],
    };

    setInstruments([newInst, ...instruments]);
    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (inst: CalibrationInstrument) => {
    setEditFormData({
      id: inst.id,
      description: inst.description,
      serialNo: inst.serialNo,
      location: inst.location,
      responsible: inst.responsible && inst.responsible !== '—' ? inst.responsible : '',
      provider: inst.provider || '',
      lastCalDate: inst.lastCal || '',
      interval: inst.interval || '12 months',
      status: inst.status || 'In Tolerance',
      notes: inst.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstrument) return;

    const { nextDue, daysUntilDue } = calculateDueInfo(editFormData.lastCalDate, editFormData.interval);

    const updated: CalibrationInstrument = {
      ...selectedInstrument,
      description: editFormData.description.trim() || selectedInstrument.description,
      serialNo: editFormData.serialNo.trim() || selectedInstrument.serialNo,
      location: editFormData.location.trim() || selectedInstrument.location,
      responsible: editFormData.responsible.trim() || '—',
      provider: editFormData.provider.trim(),
      lastCal: editFormData.lastCalDate.trim() || selectedInstrument.lastCal,
      interval: editFormData.interval,
      nextDue,
      daysUntilDue,
      status: editFormData.status,
      notes: editFormData.notes.trim(),
    };

    setSelectedInstrument(updated);
    setInstruments((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setIsEditModalOpen(false);
  };

  const handleSaveLogEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstrument) return;

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const defaultDateStr = `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
    const eventDate = logEventForm.date.trim() || defaultDateStr;

    const newEvent: CalibrationEvent = {
      id: Date.now().toString(),
      date: eventDate,
      calibratedBy: logEventForm.calibratedBy.trim() || 'Internal Metrologist',
      result: logEventForm.result,
      certificateNo: logEventForm.certificateNo.trim(),
      notes: logEventForm.notes.trim(),
    };

    const { nextDue, daysUntilDue } = calculateDueInfo(eventDate, selectedInstrument.interval);

    const updated: CalibrationInstrument = {
      ...selectedInstrument,
      lastCal: eventDate,
      nextDue,
      daysUntilDue,
      status: logEventForm.result === 'Fail' ? 'Overdue' : 'In Tolerance',
      calibrationEvents: [newEvent, ...(selectedInstrument.calibrationEvents || [])],
    };

    setSelectedInstrument(updated);
    setInstruments((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setIsLogEventModalOpen(false);
    setLogEventForm({
      date: '',
      calibratedBy: '',
      result: 'Pass',
      certificateNo: '',
      notes: '',
    });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const inst = instruments.find((i) => i.id === id);
    if (!inst) return;
    if (window.confirm(`Delete instrument ${inst.description} (${inst.serialNo})?`)) {
      setInstruments(instruments.filter((i) => i.id !== id));
      if (selectedInstrument?.id === id) setSelectedInstrument(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Instrument ID', 'Description', 'Serial No', 'Location', 'Last Cal', 'Interval', 'Next Due', 'Days Left', 'Status', 'Responsible'];
    const rows = filteredInstruments.map((i) => [
      i.instrumentId,
      `"${i.description.replace(/"/g, '""')}"`,
      i.serialNo,
      `"${i.location}"`,
      i.lastCal,
      i.interval,
      i.nextDue,
      i.daysUntilDue,
      i.status,
      `"${i.responsible}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Calibration_Register_${company.name || 'SHEQ'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredInstruments = useMemo(() => {
    return instruments.filter((inst) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        inst.description.toLowerCase().includes(q) ||
        inst.instrumentId.toLowerCase().includes(q) ||
        inst.serialNo.toLowerCase().includes(q) ||
        inst.responsible.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All Statuses' || inst.status === statusFilter;
      const matchesLocation = locationFilter === 'All Locations' || inst.location === locationFilter;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [instruments, searchTerm, statusFilter, locationFilter]);

  const dueThisMonth = useMemo(() => {
    return instruments.filter((inst) => inst.status === 'Due Soon' || (inst.daysUntilDue !== undefined && inst.daysUntilDue <= 30));
  }, [instruments]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(instruments.map((i) => i.location).filter(Boolean)));
  }, [instruments]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {selectedInstrument ? (
        /* DETAIL VIEW: Matching Pinned Image */
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Back to Register */}
          <button
            type="button"
            onClick={() => setSelectedInstrument(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer mt-1 mb-2 transition-colors no-print"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Register</span>
          </button>

          {/* Instrument Detail Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header: Dark Navy Blue #122b49 */}
            <div className="bg-[#122b49] text-white px-7 py-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1">
                  INSTRUMENT DETAIL
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedInstrument.description}
                </h2>
                <div className="text-xs text-slate-300 font-medium mt-1">
                  {selectedInstrument.description} · S/N: {selectedInstrument.serialNo}
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap no-print">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedInstrument)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent hover:bg-white/10 text-white rounded-lg text-xs font-medium border border-white/30 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDelete(selectedInstrument.id, e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3a1d28]/70 hover:bg-[#4a2232] text-rose-200 rounded-lg text-xs font-medium border border-rose-500/40 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-7 sm:p-8 space-y-6">
              {/* 8 Blocks Grid: 3 columns matching pinned image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. SERIAL NUMBER */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    SERIAL NUMBER
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.serialNo || '—'}
                  </div>
                </div>

                {/* 2. LOCATION / DEPT */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    LOCATION / DEPT
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.location || '—'}
                  </div>
                </div>

                {/* 3. RESPONSIBLE PERSON */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    RESPONSIBLE PERSON
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.responsible && selectedInstrument.responsible !== '—'
                      ? selectedInstrument.responsible
                      : '—'}
                  </div>
                </div>

                {/* 4. CALIBRATION PROVIDER */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    CALIBRATION PROVIDER
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.provider || '—'}
                  </div>
                </div>

                {/* 5. LAST CALIBRATION */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    LAST CALIBRATION
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.lastCal || '—'}
                  </div>
                </div>

                {/* 6. INTERVAL */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    INTERVAL
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.interval || '—'}
                  </div>
                </div>

                {/* 7. NEXT DUE DATE */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    NEXT DUE DATE
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.nextDue || '—'}
                  </div>
                </div>

                {/* 8. DAYS UNTIL DUE */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    DAYS UNTIL DUE
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {selectedInstrument.daysUntilDue !== undefined ? `${selectedInstrument.daysUntilDue} days` : '—'}
                  </div>
                </div>
              </div>

              {/* Status Row */}
              <div className="flex items-center gap-2 pt-1 text-sm text-slate-600">
                <span className="font-medium text-slate-500">Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                    selectedInstrument.status === 'In Tolerance'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : selectedInstrument.status === 'Due Soon'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-red-50 text-red-700 border-red-300'
                  }`}
                >
                  {selectedInstrument.status}
                </span>
              </div>

              {/* Certificate Download row if attached */}
              {selectedInstrument.certificateName && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-blue-900 text-xs font-medium">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{selectedInstrument.certificateName}</span>
                  </div>
                  {selectedInstrument.certificateUrl && (
                    <a
                      href={selectedInstrument.certificateUrl}
                      download={selectedInstrument.certificateName}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Download Certificate
                    </a>
                  )}
                </div>
              )}

              {/* Divider */}
              <hr className="border-slate-100 my-6" />

              {/* Calibration History Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Calibration History
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsLogEventModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Log Calibration Event</span>
                  </button>
                </div>

                {(!selectedInstrument.calibrationEvents || selectedInstrument.calibrationEvents.length === 0) ? (
                  <div className="text-sm text-slate-400 font-normal">
                    No calibration events recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#122b49] text-white font-semibold border-b border-[#0e223f]">
                        <tr>
                          <th className="py-2.5 px-3.5">Event Date</th>
                          <th className="py-2.5 px-3.5">Calibrated By</th>
                          <th className="py-2.5 px-3.5">Result</th>
                          <th className="py-2.5 px-3.5">Certificate #</th>
                          <th className="py-2.5 px-3.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedInstrument.calibrationEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3.5 font-medium text-slate-900">{evt.date}</td>
                            <td className="py-2.5 px-3.5 text-slate-600">{evt.calibratedBy}</td>
                            <td className="py-2.5 px-3.5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                evt.result === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {evt.result}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-slate-600">{evt.certificateNo || '—'}</td>
                            <td className="py-2.5 px-3.5 text-slate-600">{evt.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGISTER TABLE VIEW */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <span className="text-slate-800 font-bold">{company.name}</span>
                <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                  {company.plan || 'ACTIVE'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name} — Calibration Control</h1>
              <p className="text-sm text-slate-500 mt-0.5">Instrument register, calibration tracking and certificate management.</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Instrument</span>
            </button>
          </div>

          {/* Meta Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compPrefix}-DC-012</span>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Instruments', count: instruments.length, icon: Wrench, color: 'text-blue-500 bg-blue-50', filter: 'All Statuses' },
              { label: 'In Tolerance', count: instruments.filter((i) => i.status === 'In Tolerance').length, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50', filter: 'In Tolerance' },
              { label: 'Due Soon (≤30d)', count: instruments.filter((i) => i.status === 'Due Soon').length, icon: Clock, color: 'text-amber-500 bg-amber-50', filter: 'Due Soon' },
              { label: 'Overdue', count: instruments.filter((i) => i.status === 'Overdue').length, icon: AlertTriangle, color: 'text-red-500 bg-red-50', filter: 'Overdue' },
            ].map((card) => (
              <div
                key={card.label}
                onClick={() => {
                  setActiveTab('register');
                  setStatusFilter(statusFilter === card.filter ? 'All Statuses' : card.filter);
                }}
                className={`bg-white border rounded-xl p-4 flex items-center gap-3.5 shadow-xs cursor-pointer transition-all ${
                  statusFilter === card.filter && card.filter !== 'All Statuses' ? 'ring-2 ring-blue-500/20 border-blue-500' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{card.count}</div>
                  <div className="text-xs font-medium text-slate-500">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl gap-1 shadow-2xs">
            {[
              { key: 'register', label: `Instruments Register (${instruments.length})` },
              { key: 'history', label: 'Calibration History' },
              { key: 'due', label: `Due This Month (${dueThisMonth.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === t.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            {/* Filters */}
            <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search instrument, serial, owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="In Tolerance">In Tolerance</option>
                  <option value="Due Soon">Due Soon</option>
                  <option value="Overdue">Overdue</option>
                </select>

                {uniqueLocations.length > 0 && (
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="All Locations">All Locations</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#122b49] text-white font-semibold text-xs border-b border-[#0e223f]">
                    <th className="py-3 px-3.5 whitespace-nowrap">Instrument ID</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Description</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Serial No.</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Location</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Last Cal.</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Interval</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Next Due</th>
                    <th className="py-3 px-3.5 whitespace-nowrap text-center">Days Left</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Responsible</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(activeTab === 'due' ? dueThisMonth : filteredInstruments).length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 font-medium">
                        No instruments found. Click "Add Instrument" to create your first calibration record.
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'due' ? dueThisMonth : filteredInstruments).map((inst) => (
                      <tr
                        key={inst.id}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => setSelectedInstrument(inst)}
                      >
                        <td className="py-3 px-3.5 font-bold text-blue-600 hover:underline whitespace-nowrap">{inst.instrumentId}</td>
                        <td className="py-3 px-3.5 font-medium text-slate-900 whitespace-nowrap hover:text-blue-600">{inst.description}</td>
                        <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">{inst.serialNo}</td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{inst.location}</td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{inst.lastCal}</td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{inst.interval}</td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{inst.nextDue}</td>
                        <td className="py-3 px-3.5 text-center font-bold text-slate-900 whitespace-nowrap">{inst.daysUntilDue ?? '—'}</td>
                        <td className="py-3 px-3.5 whitespace-nowrap"><CalStatusBadge status={inst.status} /></td>
                        <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">{inst.responsible}</td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 text-slate-400">
                            <button
                              onClick={() => setSelectedInstrument(inst)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={(e) => handleDelete(inst.id, e)}
                              className="p-1 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete instrument"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Instrument */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Add Instrument</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Digital Vernier Caliper 0-150mm"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    placeholder="e.g. SN-883492"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. QC Lab"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Calibration Date</label>
                  <input
                    type="date"
                    value={formData.lastCalDate}
                    onChange={(e) => setFormData({ ...formData, lastCalDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interval</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                  >
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                    <option value="24 months">24 months</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="e.g. Lead Metrologist"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                  >
                    <option value="In Tolerance">In Tolerance</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provider / Lab</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g. SANAS Accredited Metrology Lab"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              {/* Certificate File */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calibration Certificate (PDF / Image)</label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer font-medium">
                    Upload Certificate
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </label>
                  {certificateFile && (
                    <span className="text-xs text-slate-600 font-medium">{certificateFile.name} ({certificateFile.size})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Instrument */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Edit Instrument Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.serialNo}
                    onChange={(e) => setEditFormData({ ...editFormData, serialNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Dept</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Calibration Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 3-Sept-2026"
                    value={editFormData.lastCalDate}
                    onChange={(e) => setEditFormData({ ...editFormData, lastCalDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interval</label>
                  <select
                    value={editFormData.interval}
                    onChange={(e) => setEditFormData({ ...editFormData, interval: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                  >
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                    <option value="24 months">24 months</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={editFormData.responsible}
                    onChange={(e) => setEditFormData({ ...editFormData, responsible: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                  >
                    <option value="In Tolerance">In Tolerance</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calibration Provider</label>
                <input
                  type="text"
                  value={editFormData.provider}
                  onChange={(e) => setEditFormData({ ...editFormData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Calibration Event */}
      {isLogEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsLogEventModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Log Calibration Event</h2>
              <button onClick={() => setIsLogEventModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLogEvent} className="space-y-3 pt-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calibration Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 25-Sept-2026"
                    value={logEventForm.date}
                    onChange={(e) => setLogEventForm({ ...logEventForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Result</label>
                  <select
                    value={logEventForm.result}
                    onChange={(e) => setLogEventForm({ ...logEventForm, result: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Adjusted">Adjusted & Passed</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calibrated By / Technician</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Metrologist)"
                  value={logEventForm.calibratedBy}
                  onChange={(e) => setLogEventForm({ ...logEventForm, calibratedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate / Report Number</label>
                <input
                  type="text"
                  placeholder="e.g. CAL-CERT-2026-092"
                  value={logEventForm.certificateNo}
                  onChange={(e) => setLogEventForm({ ...logEventForm, certificateNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Observations</label>
                <textarea
                  rows={3}
                  placeholder="e.g. As-found zero error within ±0.01mm tolerance. Calibration verified against standard gauge blocks."
                  value={logEventForm.notes}
                  onChange={(e) => setLogEventForm({ ...logEventForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsLogEventModalOpen(false)} className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  Save Calibration Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
