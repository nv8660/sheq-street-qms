import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Download,
  ChevronDown,
  X,
  FileText,
  History,
  Upload,
} from 'lucide-react';
import { CalibrationInstrument, Company } from '../../types';

interface CalibrationControlViewProps {
  company: Company;
}

export const CalibrationControlView: React.FC<CalibrationControlViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'due'>('register');
  const compPrefix = company?.name ? company.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() : 'NK';

  const [instruments, setInstruments] = useState<CalibrationInstrument[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company?.id}_calibration_instruments`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_calibration_instruments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company.id}_calibration_instruments`);
      if (savedScoped) {
        setInstruments(JSON.parse(savedScoped));
      } else {
        const saved = localStorage.getItem('sheq_calibration_instruments');
        setInstruments(saved ? JSON.parse(saved) : []);
      }
    } catch {}
  }, [company.id]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<CalibrationInstrument | null>(null);

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

  const [responsibleOptions, setResponsibleOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const names = new Set<string>();
      // 1. From HR employees
      const hrKey = company?.id ? `sheq_${company.id}_hr_employees` : 'sheq_hr_employees';
      const hrData = localStorage.getItem(hrKey) || localStorage.getItem('sheq_hr_employees');
      if (hrData) {
        const parsed = JSON.parse(hrData);
        if (Array.isArray(parsed)) {
          parsed.forEach((emp: any) => {
            if (emp.name) names.add(emp.name);
          });
        }
      }
      // 2. From existing instruments
      instruments.forEach((inst) => {
        if (inst.responsible && inst.responsible !== 'Unassigned' && inst.responsible !== '—') {
          names.add(inst.responsible);
        }
      });
      // 3. Defaults
      if (names.size === 0) {
        names.add('Naveen V');
        names.add('Quality Manager');
        names.add('Lead Metrology Technician');
        names.add('Lab Supervisor');
      }
      setResponsibleOptions(Array.from(names));
    } catch {
      setResponsibleOptions(['Naveen V', 'Quality Manager', 'Lead Metrology Technician']);
    }
  }, [company?.id, instruments]);

  useEffect(() => {
    try {
      localStorage.setItem('sheq_calibration_instruments', JSON.stringify(instruments));
      if (company?.id) {
        localStorage.setItem(`sheq_${company.id}_calibration_instruments`, JSON.stringify(instruments));
      }
    } catch {}
  }, [instruments, company?.id]);

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
    if (!formData.description.trim() || !formData.serialNo.trim()) {
      alert('Please fill in required fields: Description and Serial Number.');
      return;
    }

    const intervalMonths = parseInt(formData.interval, 10) || 12;
    let baseDate = new Date();
    if (formData.lastCalDate) {
      const parsed = new Date(formData.lastCalDate);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }

    const nextDueDate = new Date(baseDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);

    const pad = (n: number) => String(n).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const lastCalStr = `${pad(baseDate.getDate())}-${months[baseDate.getMonth()]}-${baseDate.getFullYear()}`;
    const nextDueStr = `${pad(nextDueDate.getDate())}-${months[nextDueDate.getMonth()]}-${nextDueDate.getFullYear()}`;
    const diffDays = Math.ceil((nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const newInst: CalibrationInstrument = {
      id: Date.now().toString(),
      instrumentId: formData.instrumentId.trim() || `CAL-INST-${String(instruments.length + 1).padStart(3, '0')}`,
      description: formData.description.trim(),
      serialNo: formData.serialNo.trim(),
      location: formData.location.trim() || 'General Lab',
      lastCal: lastCalStr,
      interval: formData.interval,
      nextDue: nextDueStr,
      daysUntilDue: diffDays,
      status: formData.status,
      responsible: formData.responsible || '—',
      provider: formData.provider.trim(),
      notes: formData.notes.trim(),
      certificateName: certificateFile?.name,
      certificateUrl: certificateFile?.dataUrl,
    };

    setInstruments([newInst, ...instruments]);
    setIsModalOpen(false);
    resetForm();
  };

  // Filtered lists
  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch =
      inst.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.instrumentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || inst.status === statusFilter;
    const matchesLocation = locationFilter === 'All Locations' || inst.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Instruments due this month (status "Due Soon" or daysUntilDue <= 30)
  const dueThisMonthInstruments = instruments.filter(
    (inst) => inst.status === 'Due Soon' || (inst.daysUntilDue !== undefined && inst.daysUntilDue <= 30)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-700 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          {company.plan || 'TRIAL'}
        </span>
        {company.isoScope && company.isoScope.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span className="text-slate-300">•</span>
            {company.isoScope.map((scope) => (
              <span
                key={scope}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
              >
                {scope}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Header and Add Instrument Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{company.name} — Calibration Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Instrument register, calibration tracking and certificate management
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Instrument</span>
        </button>
      </div>

      {/* Document Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-500">DOCUMENT #:</span>
        <span className="font-bold text-slate-900">{compPrefix}-DC-012</span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{instruments.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Instruments</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {instruments.filter((i) => i.status === 'In Tolerance').length}
            </div>
            <div className="text-xs font-medium text-slate-500">In Tolerance</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {instruments.filter((i) => i.status === 'Due Soon').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Due Soon (≤30d)</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {instruments.filter((i) => i.status === 'Overdue').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Overdue</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Instruments Register
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Calibration History
        </button>
        <button
          onClick={() => setActiveTab('due')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'due'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Due This Month
        </button>
      </div>

      {/* TAB 1: Instruments Register */}
      {activeTab === 'register' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search instrument..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-2xs"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="In Tolerance">In Tolerance</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-2xs"
              >
                <option value="All Locations">All Locations</option>
                <option value="Lab A">Lab A</option>
                <option value="Production Floor">Production Floor</option>
                <option value="Quality Control">Quality Control</option>
              </select>

              <button
                onClick={() => alert('Exporting calibration register to CSV...')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#122b49] text-white font-semibold text-xs tracking-wide">
                    <th className="py-3 px-3">Instrument ID</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Serial No.</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Last Cal.</th>
                    <th className="py-3 px-3">Interval</th>
                    <th className="py-3 px-3">Next Due</th>
                    <th className="py-3 px-3">Days Until Due</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Responsible</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInstruments.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-slate-400 font-medium">
                        No instruments found.
                      </td>
                    </tr>
                  ) : (
                    filteredInstruments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-blue-600">{inst.instrumentId}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{inst.description}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.serialNo}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.location}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.lastCal}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.interval}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.nextDue}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{inst.daysUntilDue}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              inst.status === 'In Tolerance'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : inst.status === 'Due Soon'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-red-50 text-red-700 border-red-300'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{inst.responsible}</td>
                        <td
                          onClick={() => setSelectedInstrument(inst)}
                          className="py-3 px-3 text-center text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          View
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

      {/* TAB 2: Calibration History */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl py-16 px-4 text-center text-slate-500 text-sm shadow-2xs">
            No calibration history found.
          </div>
        </div>
      )}

      {/* TAB 3: Due This Month (Matching Pinned Image) */}
      {activeTab === 'due' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {dueThisMonthInstruments.length === 0 ? (
            /* Exactly matching pinned screenshot */
            <div className="bg-white border border-slate-200 rounded-xl py-16 px-4 text-center text-slate-500 text-sm shadow-2xs">
              No instruments due this month.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#122b49] text-white font-semibold text-xs tracking-wide">
                      <th className="py-3 px-3">Instrument ID</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Serial No.</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Next Due</th>
                      <th className="py-3 px-3">Days Until Due</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Responsible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {dueThisMonthInstruments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-blue-600">{inst.instrumentId}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{inst.description}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.serialNo}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.location}</td>
                        <td className="py-3 px-3 text-slate-600">{inst.nextDue}</td>
                        <td className="py-3 px-3 font-bold text-amber-600">{inst.daysUntilDue}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              inst.status === 'In Tolerance'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : inst.status === 'Due Soon'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-red-50 text-red-700 border-red-300'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{inst.responsible}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add New Instrument Modal (Exactly Matching Pinned Screenshot) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Dark Navy Header */}
            <div className="bg-[#163255] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white tracking-tight">Add New Instrument</h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAdd} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Row 1 - Left: Instrument ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Instrument ID
                  </label>
                  <input
                    type="text"
                    value={formData.instrumentId}
                    onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Row 1 - Right: Description * */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Row 2 - Left: Serial Number * */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Row 2 - Right: Location / Department */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Location / Department
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Row 3 - Left: Responsible Person */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Responsible Person
                  </label>
                  <div className="relative">
                    <select
                      value={formData.responsible}
                      onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer pr-9"
                    >
                      <option value="">— Select —</option>
                      {responsibleOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 3 - Right: Calibration Provider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Calibration Provider
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Row 4 - Left: Last Calibration Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Last Calibration Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastCalDate}
                    onChange={(e) => setFormData({ ...formData, lastCalDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                  />
                </div>

                {/* Row 4 - Right: Calibration Interval */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Calibration Interval
                  </label>
                  <div className="relative">
                    <select
                      value={formData.interval}
                      onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer pr-9"
                    >
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="12 months">12 months</option>
                      <option value="24 months">24 months</option>
                      <option value="36 months">36 months</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 5 - Left: Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as 'In Tolerance' | 'Due Soon' | 'Overdue',
                        })
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer pr-9"
                    >
                      <option value="In Tolerance">In Tolerance</option>
                      <option value="Due Soon">Due Soon</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 5 - Right: Empty space to match image layout */}
                <div className="hidden md:block"></div>

                {/* Row 6 - Full width: Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Row 7 - Full width: Calibration Certificate (PDF / Image) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Calibration Certificate (PDF / Image)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Upload Certificate</span>
                    </button>
                    {certificateFile && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700">
                        <span className="truncate max-w-xs">
                          {certificateFile.name} {certificateFile.size ? `(${certificateFile.size})` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCertificateFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7096f8] hover:bg-[#5c85f0] text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Add Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Instrument Details Modal */}
      {selectedInstrument && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#163255] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  {selectedInstrument.description}
                </h2>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  {selectedInstrument.instrumentId} • Serial: {selectedInstrument.serialNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInstrument(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Status</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
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

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Days Until Due</div>
                  <div className="text-sm font-bold text-slate-800">{selectedInstrument.daysUntilDue} days</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Location</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedInstrument.location}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Responsible Person</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedInstrument.responsible}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Last Calibration</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedInstrument.lastCal}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Next Calibration Due</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedInstrument.nextDue}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Calibration Interval</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedInstrument.interval}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Calibration Provider</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedInstrument.provider || '—'}
                  </div>
                </div>
              </div>

              {selectedInstrument.notes && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <div className="text-slate-500 font-medium mb-1">Notes</div>
                  <div className="text-sm text-slate-700">{selectedInstrument.notes}</div>
                </div>
              )}

              {selectedInstrument.certificateName && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{selectedInstrument.certificateName}</span>
                  </div>
                  {selectedInstrument.certificateUrl && (
                    <a
                      href={selectedInstrument.certificateUrl}
                      download={selectedInstrument.certificateName}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Download
                    </a>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInstrument(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
