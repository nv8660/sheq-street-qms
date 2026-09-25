import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Eye,
  Trash2,
  Lock,
  X,
  Calendar,
  ArrowLeft,
  Send,
  Download,
  CheckCircle2,
  Edit3,
  Mail,
} from 'lucide-react';
import { NCRItem, Company } from '../../types';

interface NCRManagementViewProps {
  company: Company;
  ncrs: NCRItem[];
  onAddNCR: (ncr: Partial<NCRItem>) => void;
  onUpdateNCR?: (ncr: NCRItem) => void;
  onDeleteNCR: (id: string) => void;
}

// Date Helpers
const toDate = (s: string) => {
  const parts = s.split('-');
  return parts.length === 3 ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])) : new Date();
};
const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
const addDays = (s: string, days: number) => {
  const d = toDate(s);
  d.setDate(d.getDate() + days);
  return fmtDate(d);
};
const toIso = (s: string) => {
  const p = s.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '';
};
const fromIso = (s: string) => {
  const p = s.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : s;
};

const NCRStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    OPEN: 'bg-amber-50 text-amber-700 border-amber-300',
    'IN PROGRESS': 'bg-blue-50 text-blue-700 border-blue-300',
    CLOSED: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider border ${
        styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'
      }`}
    >
      {status}
    </span>
  );
};

export const NCRManagementView: React.FC<NCRManagementViewProps> = ({
  company,
  ncrs,
  onAddNCR,
  onUpdateNCR,
  onDeleteNCR,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNCR, setSelectedNCR] = useState<NCRItem | null>(null);

  // Secondary modals in detail view
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Send to Recipient form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientNotes, setRecipientNotes] = useState('');

  // Edit Action / NCR form state
  const [editForm, setEditForm] = useState<Partial<NCRItem>>({});

  // Create Form State
  const [formData, setFormData] = useState({
    type: 'Internal',
    issuedTo: '',
    dateIssued: '21-09-2026',
    daysToClose: 14,
    dueDate: '05-10-2026',
    raisedBy: '',
    problemSummary: '',
    description: '',
    rootCause: '',
    correctiveAction: '',
    recipientSubmitted: 'No',
    photos: [] as string[],
  });

  const dateIssuedPickerRef = useRef<HTMLInputElement>(null);
  const dueDatePickerRef = useRef<HTMLInputElement>(null);

  // Company Code for top-right of the header (e.g. "nk")
  const compCode = company?.name
    ? company.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toLowerCase()
    : 'nk';

  // Esc closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSendModalOpen) setIsSendModalOpen(false);
        else if (isEditModalOpen) setIsEditModalOpen(false);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSendModalOpen, isEditModalOpen, isModalOpen]);

  const handleDateIssuedChange = (newDate: string) => {
    setFormData((prev) => ({
      ...prev,
      dateIssued: newDate,
      dueDate: addDays(newDate, prev.daysToClose),
    }));
  };

  const handleDaysToCloseChange = (days: number) => {
    setFormData((prev) => ({
      ...prev,
      daysToClose: days,
      dueDate: addDays(prev.dateIssued, days),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = (Array.from(e.target.files) as File[]).slice(0, 4 - formData.photos.length);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, event.target!.result as string].slice(0, 4),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const filteredNCRs = useMemo(() => {
    return ncrs.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        item.ncrNumber.toLowerCase().includes(q) ||
        item.issuedTo.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (item.problemSummary && item.problemSummary.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [ncrs, searchTerm, statusFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNCR({
      ncrNumber: `NCR-2026-00${ncrs.length + 1}`,
      issuedTo: formData.issuedTo || 'Quality Dept',
      dateIssued: formData.dateIssued,
      dueDate: formData.dueDate,
      daysLeft: formData.daysToClose,
      daysToClose: formData.daysToClose,
      openPeriod: '1 day',
      status: 'OPEN',
      type: formData.type,
      problemSummary: formData.problemSummary,
      description: formData.description,
      raisedBy: formData.raisedBy || 'QC Inspector',
      rootCause: formData.rootCause || '',
      correctiveAction: formData.correctiveAction || '',
      recipientSubmitted: 'No',
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
      rootCause: '',
      correctiveAction: '',
      recipientSubmitted: 'No',
      photos: [],
    });
  };

  // Close / Reopen NCR action
  const handleToggleCloseNCR = (ncr: NCRItem) => {
    const nextStatus: 'OPEN' | 'IN PROGRESS' | 'CLOSED' =
      ncr.status === 'CLOSED' ? 'IN PROGRESS' : 'CLOSED';
    const updated: NCRItem = {
      ...ncr,
      status: nextStatus,
    };
    setSelectedNCR(updated);
    if (onUpdateNCR) {
      onUpdateNCR(updated);
    }
    const msg =
      nextStatus === 'CLOSED'
        ? `NCR ${ncr.ncrNumber} has been closed.`
        : `NCR ${ncr.ncrNumber} status reverted to In Progress.`;
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Send to Recipient action
  const handleOpenSendModal = (ncr: NCRItem) => {
    const defaultRecipientEmail = `${ncr.issuedTo.toLowerCase().replace(/[^a-z0-9]/g, '')}@nksystems.com`;
    setRecipientEmail(defaultRecipientEmail);
    setRecipientNotes(
      `Please review Non-Conformance Report ${ncr.ncrNumber} regarding "${ncr.problemSummary || 'Material Inspection'}" and submit corrective action details by ${ncr.dueDate}.`
    );
    setIsSendModalOpen(true);
  };

  const handleConfirmSendRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNCR) return;
    const updated: NCRItem = {
      ...selectedNCR,
      recipientSubmitted: 'Sent (Pending Reply)',
    };
    setSelectedNCR(updated);
    if (onUpdateNCR) {
      onUpdateNCR(updated);
    }
    setIsSendModalOpen(false);
    setToastNotice(
      `Non-Conformance Report ${selectedNCR.ncrNumber} dispatched to ${selectedNCR.issuedTo} (${recipientEmail}).`
    );
    setTimeout(() => setToastNotice(null), 4500);
  };

  // Download PDF action
  const handleDownloadPDF = () => {
    window.print();
  };

  // Open Edit Action / Details modal
  const handleOpenEditModal = (ncr: NCRItem) => {
    setEditForm({
      problemSummary: ncr.problemSummary || '',
      description: ncr.description || '',
      rootCause: ncr.rootCause || '',
      correctiveAction: ncr.correctiveAction || '',
      issuedTo: ncr.issuedTo || '',
      raisedBy: ncr.raisedBy || '',
      type: ncr.type || 'Internal',
      recipientSubmitted: ncr.recipientSubmitted || 'No',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNCR) return;
    const updated: NCRItem = {
      ...selectedNCR,
      ...editForm,
    };
    setSelectedNCR(updated);
    if (onUpdateNCR) {
      onUpdateNCR(updated);
    }
    setIsEditModalOpen(false);
    setToastNotice(`NCR ${selectedNCR.ncrNumber} details & actions updated successfully.`);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const openNCRs = ncrs.filter((n) => n.status !== 'CLOSED');
  const closestDays = openNCRs
    .filter((n) => n.daysLeft !== undefined)
    .sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99))[0]?.daysLeft;

  // ==========================================
  // RENDER: DEDICATED NCR VIEW (MATCHES PINNED IMAGE)
  // ==========================================
  if (selectedNCR) {
    return (
      <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #ncr-printable-card, #ncr-printable-card * {
              visibility: visible;
            }
            #ncr-printable-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              box-shadow: none !important;
              border: 1px solid #cbd5e1 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Action Header: Back on left, 3 Actions on right */}
        <div className="flex items-center justify-between gap-4 mb-6 no-print">
          <button
            type="button"
            onClick={() => setSelectedNCR(null)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 1. Send to Recipient Button */}
            <button
              type="button"
              onClick={() => handleOpenSendModal(selectedNCR)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-700 -rotate-12" />
              <span>Send to Recipient</span>
            </button>

            {/* 2. Close NCR Button */}
            <button
              type="button"
              onClick={() => handleToggleCloseNCR(selectedNCR)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <span>{selectedNCR.status === 'CLOSED' ? 'Reopen NCR' : 'Close NCR'}</span>
            </button>

            {/* 3. Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d63ed] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toastNotice && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2 shadow-2xs animate-in slide-in-from-top-2 no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastNotice}</span>
            </div>
            <button
              onClick={() => setToastNotice(null)}
              className="text-emerald-500 hover:text-emerald-800 cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main NCR Card — Matches Pinned Image */}
        <div
          id="ncr-printable-card"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Navy Blue Header */}
          <div className="bg-[#122b49] text-white px-7 py-6 sm:px-9 sm:py-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">
                NON-CONFORMANCE REPORT
              </span>
              <span className="text-sm font-bold text-white tracking-wide">{compCode}</span>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedNCR.ncrNumber}
              </h1>

              <div>
                {selectedNCR.status === 'IN PROGRESS' && (
                  <span className="bg-white text-[#1d63ed] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs inline-block">
                    IN PROGRESS
                  </span>
                )}
                {selectedNCR.status === 'OPEN' && (
                  <span className="bg-white text-amber-700 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs inline-block">
                    OPEN
                  </span>
                )}
                {selectedNCR.status === 'CLOSED' && (
                  <span className="bg-white text-emerald-700 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs inline-block">
                    CLOSED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-7 sm:p-9 space-y-7">
            {/* Information Grid Container */}
            <div className="bg-[#f8fafc] rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-2xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-8">
                {/* Column 1 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    TYPE
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.type || 'Internal'}
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-5 mb-1">
                    RAISED BY
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.raisedBy || 'QC Inspector'}
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ISSUED TO
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.issuedTo}
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-5 mb-1">
                    DAYS LEFT
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.daysLeft !== undefined ? `${selectedNCR.daysLeft} days` : '6 days'}
                  </div>
                </div>

                {/* Column 3 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    DATE ISSUED
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.dateIssued}
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-5 mb-1">
                    OPEN PERIOD
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.openPeriod || '54 days'}
                  </div>
                </div>

                {/* Column 4 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    DUE DATE
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.dueDate}
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-5 mb-1">
                    RECIPIENT SUBMITTED
                  </div>
                  <div className="text-sm font-normal text-slate-900">
                    {selectedNCR.recipientSubmitted || 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* PROBLEM SUMMARY */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                PROBLEM SUMMARY
              </div>
              <div className="text-sm font-normal text-slate-900 leading-relaxed">
                {selectedNCR.problemSummary ||
                  'Non-conforming raw materials received from Supplier A'}
              </div>
            </div>

            {/* DETAILED DESCRIPTION */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                DETAILED DESCRIPTION
              </div>
              <div className="text-sm font-normal text-slate-900 leading-relaxed whitespace-pre-line">
                {selectedNCR.description ||
                  'Batch #4521 of steel components failed dimensional inspection. 15% of parts out of tolerance.'}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="pt-1">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                ACTIONS
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ROOT CAUSE
                </div>
                <div className="text-sm font-normal text-slate-900 leading-relaxed">
                  {selectedNCR.rootCause || 'Supplier calibration equipment out of service'}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  CORRECTIVE ACTION
                </div>
                <div className="text-sm font-normal text-slate-900 leading-relaxed">
                  {selectedNCR.correctiveAction ||
                    '100% inspection of incoming batch. Supplier notified.'}
                </div>
              </div>
            </div>

            {/* Attached Photos (if present) */}
            {selectedNCR.photos && selectedNCR.photos.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ATTACHED PHOTOS ({selectedNCR.photos.length})
                </div>
                <div className="flex gap-3 flex-wrap">
                  {selectedNCR.photos.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow block"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Footer: Edit & Delete */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedNCR)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit NCR & Actions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${selectedNCR.ncrNumber}?`)) {
                    onDeleteNCR(selectedNCR.id);
                    setSelectedNCR(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete NCR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Send to Recipient */}
        {isSendModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsSendModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-base text-slate-900">
                    Send NCR to Recipient ({selectedNCR.ncrNumber})
                  </h2>
                </div>
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmSendRecipient} className="space-y-3.5 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Recipient Department / Person
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedNCR.issuedTo}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. production.lead@company.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dispatch Notice & Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={recipientNotes}
                    onChange={(e) => setRecipientNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSendModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 -rotate-12" />
                    <span>Send & Dispatch</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit NCR & Actions */}
        {isEditModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsEditModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-base text-slate-900">
                    Edit {selectedNCR.ncrNumber} & Actions
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Problem Summary</label>
                  <input
                    type="text"
                    value={editForm.problemSummary || ''}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, problemSummary: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description || ''}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions Formulation
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Root Cause</label>
                    <textarea
                      rows={2}
                      value={editForm.rootCause || ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, rootCause: e.target.value }))
                      }
                      placeholder="Root cause identified..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Corrective Action
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.correctiveAction || ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, correctiveAction: e.target.value }))
                      }
                      placeholder="Corrective actions taken or planned..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Issued To</label>
                    <input
                      type="text"
                      value={editForm.issuedTo || ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, issuedTo: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Recipient Submitted
                    </label>
                    <select
                      value={editForm.recipientSubmitted || 'No'}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, recipientSubmitted: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="Sent (Pending Reply)">Sent (Pending Reply)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN NCR REGISTER TABLE VIEW
  // ==========================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="text-slate-800 font-bold">{company.name}</span>
            <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
              {company.plan || 'ACTIVE'}
            </span>
            {company.registrationNumber && (
              <span className="hidden sm:inline font-mono text-slate-400">
                • Reg: {company.registrationNumber}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {company.name} — NCR Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Non-Conformance Reports register, corrective actions, and closure workflow.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New NCR</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'OPEN' ? 'ALL' : 'OPEN')}
          className={`bg-white border rounded-xl p-4 flex items-center gap-4 shadow-xs cursor-pointer transition-all ${
            statusFilter === 'OPEN'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{openNCRs.length}</div>
            <div className="text-xs font-medium text-slate-500">Open Non-Conformances</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {closestDays !== undefined ? `${closestDays} days` : '—'}
            </div>
            <div className="text-xs font-medium text-slate-500">Days to Closest Due Date</div>
          </div>
        </div>
      </div>

      {/* Search, Filter Pills & Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search NCRs, department, problem..."
              className="w-full pl-8.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Status Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
            {['ALL', 'OPEN', 'IN PROGRESS', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#122b49] text-white font-semibold text-xs border-b border-[#0e223f]">
                <th className="py-3 px-3.5 whitespace-nowrap">NCR Number</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Issued To</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Date Issued</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Due Date</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">Days Left</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Open Period</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Type</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredNCRs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    No NCRs match your filter.
                  </td>
                </tr>
              ) : (
                filteredNCRs.map((ncr) => (
                  <tr
                    key={ncr.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedNCR(ncr)}
                  >
                    <td className="py-3 px-3.5 font-bold text-blue-600 hover:underline whitespace-nowrap">
                      {ncr.ncrNumber}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {ncr.issuedTo}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {ncr.dateIssued}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {ncr.dueDate}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 justify-center">
                        {ncr.daysLeft}
                        {ncr.locked && <Lock className="w-3 h-3 text-emerald-600" />}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {ncr.openPeriod}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <NCRStatusBadge status={ncr.status} />
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                        {ncr.type}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3.5 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1 text-slate-500">
                        <button
                          type="button"
                          onClick={() => setSelectedNCR(ncr)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="View NCR Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${ncr.ncrNumber}?`)) {
                              onDeleteNCR(ncr.id);
                              if (selectedNCR?.id === ncr.id) setSelectedNCR(null);
                            }
                          }}
                          className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete NCR"
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

      {/* Modal: Create New NCR */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Create New NCR</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 pt-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NCR Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Customer">Customer</option>
                    <option value="External">External</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issued To *</label>
                  <input
                    type="text"
                    required
                    value={formData.issuedTo}
                    onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
                    placeholder="Person or department (e.g. Production Department)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Issued</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.dateIssued}
                      onChange={(e) => handleDateIssuedChange(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => dateIssuedPickerRef.current?.showPicker?.()}
                      className="absolute right-2 text-slate-500 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={dateIssuedPickerRef}
                      type="date"
                      className="sr-only"
                      value={toIso(formData.dateIssued)}
                      onChange={(e) =>
                        e.target.value && handleDateIssuedChange(fromIso(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Days to Close</label>
                  <select
                    value={formData.daysToClose}
                    onChange={(e) => handleDaysToCloseChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {[7, 14, 21, 30, 60, 90].map((d) => (
                      <option key={d} value={d}>
                        {d} days
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => dueDatePickerRef.current?.showPicker?.()}
                      className="absolute right-2 text-slate-500 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={dueDatePickerRef}
                      type="date"
                      className="sr-only"
                      value={toIso(formData.dueDate)}
                      onChange={(e) =>
                        e.target.value && setFormData({ ...formData, dueDate: fromIso(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Raised By</label>
                <input
                  type="text"
                  value={formData.raisedBy}
                  onChange={(e) => setFormData({ ...formData, raisedBy: e.target.value })}
                  placeholder="e.g. QC Inspector"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Summary *</label>
                <input
                  type="text"
                  required
                  value={formData.problemSummary}
                  onChange={(e) => setFormData({ ...formData, problemSummary: e.target.value })}
                  placeholder="Brief summary of non-conformance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full description and context..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Actions fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Root Cause</label>
                  <input
                    type="text"
                    value={formData.rootCause}
                    onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                    placeholder="e.g. Equipment calibration out of service"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corrective Action</label>
                  <input
                    type="text"
                    value={formData.correctiveAction}
                    onChange={(e) =>
                      setFormData({ ...formData, correctiveAction: e.target.value })
                    }
                    placeholder="e.g. 100% inspection of incoming batch"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Photos (up to 4)</label>
                  <span className="text-[11px] text-slate-400">{formData.photos.length}/4</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer font-medium">
                    Upload Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <div className="flex gap-2">
                    {formData.photos.map((p, i) => (
                      <div key={i} className="relative w-10 h-10 rounded-lg border overflow-hidden">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              photos: prev.photos.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Create NCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
