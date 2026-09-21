import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Lock,
  FileText,
  X,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { NCRItem, Company } from '../../types';

interface NCRManagementViewProps {
  company: Company;
  ncrs: NCRItem[];
  onAddNCR: (ncr: Partial<NCRItem>) => void;
  onDeleteNCR: (id: string) => void;
}

export const NCRManagementView: React.FC<NCRManagementViewProps> = ({
  company,
  ncrs,
  onAddNCR,
  onDeleteNCR,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNCR, setSelectedNCR] = useState<NCRItem | null>(null);

  const [formData, setFormData] = useState({
    type: 'Internal',
    issuedTo: '',
    dateIssued: '21-09-2026',
    daysToClose: 14,
    dueDate: '05-10-2026',
    raisedBy: '',
    problemSummary: '',
    description: '',
    photos: [] as string[],
  });

  const dateIssuedPickerRef = useRef<HTMLInputElement>(null);
  const dueDatePickerRef = useRef<HTMLInputElement>(null);

  // Helper to parse DD-MM-YYYY into a Date object
  const parseDDMMYYYY = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.trim().split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  // Helper to format Date object to DD-MM-YYYY
  const formatDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate Due Date = Date Issued + Days
  const calculateDueDate = (issuedDateStr: string, days: number): string => {
    const d = parseDDMMYYYY(issuedDateStr);
    if (!d) return issuedDateStr;
    d.setDate(d.getDate() + days);
    return formatDDMMYYYY(d);
  };

  // Convert ISO string (YYYY-MM-DD) to DD-MM-YYYY
  const nativeToDDMMYYYY = (isoStr: string): string => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoStr;
  };

  // Convert DD-MM-YYYY to ISO string (YYYY-MM-DD)
  const ddmmyyyyToNative = (str: string): string => {
    if (!str) return '';
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return str;
  };

  const handleDateIssuedChange = (newDate: string) => {
    const newDueDate = calculateDueDate(newDate, formData.daysToClose);
    setFormData((prev) => ({
      ...prev,
      dateIssued: newDate,
      dueDate: newDueDate,
    }));
  };

  const handleDaysToCloseChange = (days: number) => {
    const newDueDate = calculateDueDate(formData.dateIssued, days);
    setFormData((prev) => ({
      ...prev,
      daysToClose: days,
      dueDate: newDueDate,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const remainingSlots = 4 - formData.photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => {
            if (prev.photos.length >= 4) return prev;
            return {
              ...prev,
              photos: [...prev.photos, event.target!.result as string],
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== index),
    }));
  };

  const filteredNCRs = ncrs.filter(
    (item) =>
      item.ncrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNCR({
      ncrNumber: `NCR-2026-00${ncrs.length + 1}`,
      issuedTo: formData.issuedTo || 'Quality Dept',
      dateIssued: formData.dateIssued,
      dueDate: formData.dueDate,
      daysLeft: formData.daysToClose,
      daysToClose: formData.daysToClose,
      openPeriod: '1d',
      status: 'OPEN',
      type: formData.type,
      problemSummary: formData.problemSummary,
      description: formData.description,
      raisedBy: formData.raisedBy,
      photos: formData.photos,
    });
    setIsModalOpen(false);
    setFormData({
      type: 'Internal',
      issuedTo: '',
      dateIssued: '21-09-2026',
      daysToClose: 14,
      dueDate: '05-10-2026',
      raisedBy: '',
      problemSummary: '',
      description: '',
      photos: [],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">NCR Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Non-Conformance Reports register and workflow.
        </p>
      </div>

      {/* Meta Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-600">LAST UPDATED:</span>
        <span className="text-slate-900 font-bold">16 Sep 2026</span>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">4</div>
            <div className="text-xs font-medium text-slate-500">Open NCRs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">9 days</div>
            <div className="text-xs font-medium text-slate-500">Days to Closest Due Date</div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search NCRs..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New NCR</span>
        </button>
      </div>

      {/* NCR Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#122b49] text-white font-semibold text-xs tracking-wide">
                <th className="py-3 px-4">NCR Number</th>
                <th className="py-3 px-4">Issued To</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Days Left</th>
                <th className="py-3 px-4">Open Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredNCRs.map((ncr, idx) => (
                <tr
                  key={ncr.id + idx}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedNCR(ncr)}
                >
                  <td className="py-3.5 px-4 font-semibold text-blue-600 hover:underline">
                    {ncr.ncrNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{ncr.issuedTo}</td>
                  <td className="py-3.5 px-4 text-slate-600">{ncr.dateIssued}</td>
                  <td className="py-3.5 px-4 text-slate-600">{ncr.dueDate}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      {ncr.daysLeft}
                      {ncr.locked && <Lock className="w-3 h-3 text-emerald-600" />}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      {ncr.openPeriod}
                      {ncr.locked && <Lock className="w-3 h-3 text-emerald-600" />}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {ncr.status === 'OPEN' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-300">
                        OPEN
                      </span>
                    )}
                    {ncr.status === 'IN PROGRESS' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-blue-50 text-blue-700 border border-blue-300">
                        IN PROGRESS
                      </span>
                    )}
                    {ncr.status === 'CLOSED' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300">
                        CLOSED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                      {ncr.type}
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <button
                        onClick={() => setSelectedNCR(ncr)}
                        className="hover:text-slate-700 p-1 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="hover:text-slate-700 p-1" title="Edit NCR">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNCR(ncr.id)}
                        className="hover:text-red-600 p-1 cursor-pointer"
                        title="Delete NCR"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New NCR Modal - Matching Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-bold text-xl text-slate-900">Create New NCR</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Row 1: NCR Type & Issued To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    NCR Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-blue-500 ring-2 ring-blue-500/20 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all cursor-pointer"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Supplier">Supplier</option>
                      <option value="Customer">Customer</option>
                      <option value="External">External</option>
                      <option value="Audit">Audit</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Issued To
                  </label>
                  <input
                    type="text"
                    value={formData.issuedTo}
                    onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
                    placeholder="Person or team"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Date Issued & Days to Close */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Date Issued
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.dateIssued}
                      onChange={(e) => handleDateIssuedChange(e.target.value)}
                      placeholder="21-09-2026"
                      className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => dateIssuedPickerRef.current?.showPicker?.()}
                      className="absolute right-2.5 p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="Open calendar"
                    >
                      <Calendar className="w-4 h-4 text-slate-600" />
                    </button>
                    <input
                      ref={dateIssuedPickerRef}
                      type="date"
                      className="sr-only"
                      value={ddmmyyyyToNative(formData.dateIssued)}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleDateIssuedChange(nativeToDDMMYYYY(e.target.value));
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Days to Close
                  </label>
                  <div className="relative">
                    <select
                      value={formData.daysToClose}
                      onChange={(e) => handleDaysToCloseChange(Number(e.target.value))}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={21}>21 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Due Date & Raised By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Due Date <span className="font-normal text-slate-500 text-xs sm:text-sm">(auto-calculated, editable)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      placeholder="05-10-2026"
                      className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => dueDatePickerRef.current?.showPicker?.()}
                      className="absolute right-2.5 p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="Open calendar"
                    >
                      <Calendar className="w-4 h-4 text-slate-600" />
                    </button>
                    <input
                      ref={dueDatePickerRef}
                      type="date"
                      className="sr-only"
                      value={ddmmyyyyToNative(formData.dueDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, dueDate: nativeToDDMMYYYY(e.target.value) });
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Raised By
                  </label>
                  <input
                    type="text"
                    value={formData.raisedBy}
                    onChange={(e) => setFormData({ ...formData, raisedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Problem Summary */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Problem Summary
                </label>
                <input
                  type="text"
                  value={formData.problemSummary}
                  onChange={(e) => setFormData({ ...formData, problemSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Row 5: Detailed Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y min-h-[90px]"
                />
              </div>

              {/* Row 6: Photos (up to 4) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Photos (up to 4)
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-normal cursor-pointer transition-colors shadow-2xs">
                      <span>Choose Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-xs sm:text-sm text-slate-600">
                      {formData.photos.length === 0
                        ? 'No file chosen'
                        : `${formData.photos.length} file${formData.photos.length > 1 ? 's' : ''} chosen`}
                    </span>
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {formData.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shadow-xs group"
                        >
                          <img
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Create NCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View NCR Details Modal */}
      {selectedNCR && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-lg text-slate-900">{selectedNCR.ncrNumber}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-300">
                  {selectedNCR.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedNCR(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">NCR Type</span>
                  <span className="font-semibold text-slate-800">{selectedNCR.type}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Issued To</span>
                  <span className="font-semibold text-slate-800">{selectedNCR.issuedTo}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Date Issued</span>
                  <span className="font-semibold text-slate-800">{selectedNCR.dateIssued}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Due Date</span>
                  <span className="font-semibold text-slate-800">{selectedNCR.dueDate}</span>
                </div>
                {selectedNCR.raisedBy && (
                  <div className="col-span-2">
                    <span className="text-xs text-slate-500 block">Raised By</span>
                    <span className="font-semibold text-slate-800">{selectedNCR.raisedBy}</span>
                  </div>
                )}
              </div>

              {selectedNCR.problemSummary && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Problem Summary
                  </h4>
                  <p className="text-slate-800 bg-white border border-slate-200 rounded-lg p-3 text-sm">
                    {selectedNCR.problemSummary}
                  </p>
                </div>
              )}

              {selectedNCR.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Detailed Description
                  </h4>
                  <p className="text-slate-800 bg-white border border-slate-200 rounded-lg p-3 text-sm whitespace-pre-line">
                    {selectedNCR.description}
                  </p>
                </div>
              )}

              {selectedNCR.photos && selectedNCR.photos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Attached Photos ({selectedNCR.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {selectedNCR.photos.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200 aspect-square shadow-2xs hover:opacity-90 transition-opacity"
                      >
                        <img src={img} alt={`Attached ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedNCR(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
