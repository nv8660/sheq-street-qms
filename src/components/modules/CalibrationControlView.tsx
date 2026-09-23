import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CalibrationInstrument, Company } from '../../types';
import { getCompanyPrefix } from '../../utils/companyUtils';

interface CalibrationControlViewProps {
  company: Company;
}

export const CalibrationControlView: React.FC<CalibrationControlViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'due'>('register');
  const [instruments, setInstruments] = useState<CalibrationInstrument[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_calibration_instruments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    instrumentId: '',
    description: '',
    serialNo: '',
    location: 'Lab A',
    interval: '12 Months',
    responsible: 'Naveen V',
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheq_calibration_instruments', JSON.stringify(instruments));
    } catch {}
  }, [instruments]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newInst: CalibrationInstrument = {
      id: Date.now().toString(),
      instrumentId: formData.instrumentId || `CAL-INST-${instruments.length + 1}`,
      description: formData.description || 'Digital Vernier Caliper 0-150mm',
      serialNo: formData.serialNo || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      location: formData.location,
      lastCal: '15-Jan-2026',
      interval: formData.interval,
      nextDue: '15-Jan-2027',
      daysUntilDue: 121,
      status: 'In Tolerance',
      responsible: formData.responsible,
    };
    setInstruments([...instruments, newInst]);
    setIsModalOpen(false);
    setFormData({
      instrumentId: '',
      description: '',
      serialNo: '',
      location: 'Lab A',
      interval: '12 Months',
      responsible: 'Naveen V',
    });
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
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header and Add Instrument Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calibration Control</h1>
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
        <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-012</span>
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
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            {inst.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{inst.responsible}</td>
                        <td className="py-3 px-3 text-center text-blue-600 font-medium cursor-pointer">
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
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
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

      {/* Add Instrument Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Add Instrument to Register</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instrument ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. CAL-MIC-001"
                  value={formData.instrumentId}
                  onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Digital Vernier Caliper"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Serial No.
                  </label>
                  <input
                    type="text"
                    placeholder="SN-1092"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
