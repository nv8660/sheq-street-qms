import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  FileText,
  Trash2,
  ChevronDown,
  X,
  Eye,
  ArrowLeft,
  Pencil,
  CheckCircle2,
  Download,
  Search,
} from 'lucide-react';
import { ReviewMeeting, Company } from '../../types';
import { downloadReviewPDF } from '../../utils/managementReviewExport';

interface ManagementReviewViewProps {
  company: Company;
  reviews: ReviewMeeting[];
  onAddReview: (review: ReviewMeeting) => void;
  onUpdateReview?: (review: ReviewMeeting) => void;
  onDeleteReview: (id: string) => void;
}

export const DEFAULT_OBJECTIVE =
  "The organisation's management review of the quality management system to ensure suitability, adequacy and effectiveness. The review is to include the assessment of opportunities for improvement and any potential changes to the quality management system, including quality policy, objectives & targets, and their alignment with business objectives and overall strategy.";

export const DEFAULT_AGENDA =
  "1) Quality management system documents status.\n" +
  "2) Quality policy & objectives\n" +
  "3) External and internal issues\n" +
  "4) Risks and opportunities\n" +
  "5) Audit results:\n" +
  "   a) Internal audits\n" +
  "   b) External audits\n" +
  "6) Customer satisfaction & feedback\n" +
  "7) Supplier performance\n" +
  "8) Non-conformance & corrective actions (CAPA)\n" +
  "9) Changes that could affect the QMS\n" +
  "10) Resource adequacy & improvements";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const upper = status.toUpperCase();
  const cls = upper === 'COMPLETED'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
    : upper === 'IN PROGRESS'
    ? 'bg-blue-50 text-blue-700 border-blue-300'
    : 'bg-amber-50 text-amber-700 border-amber-300';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${cls}`}>
      {status}
    </span>
  );
};

export const ManagementReviewView: React.FC<ManagementReviewViewProps> = ({
  company,
  reviews,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<'planned' | 'minutes'>('planned');
  const [year, setYear] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PLANNED' | 'COMPLETED' | 'IN PROGRESS'>('ALL');
  const [selectedReview, setSelectedReview] = useState<ReviewMeeting | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Modal State (unified for both Create and Edit)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<ReviewMeeting>>({});

  const compDocCode = `${company.name ? company.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'NK'}-DC-014`;

  const openCreateModal = () => {
    setForm({
      title: '',
      chairedBy: '',
      apologies: 'None',
      membersInAttendance: '',
      dateStr: '17-Sept-2026',
      time: '',
      venue: 'rmz',
      status: 'PLANNED',
      objective: DEFAULT_OBJECTIVE,
      agenda: DEFAULT_AGENDA,
    });
    setModalMode('create');
  };

  const openEditModal = (review: ReviewMeeting) => {
    setForm({
      ...review,
      objective: review.objective || DEFAULT_OBJECTIVE,
      agenda: review.agenda || DEFAULT_AGENDA,
      apologies: review.apologies || 'None',
      venue: review.venue || 'rmz',
    });
    setModalMode('edit');
  };

  const handleDownloadPdf = (review: ReviewMeeting) => {
    setDownloadNotice(`Preparing PDF for "${review.title}"...`);
    try {
      downloadReviewPDF(review, company);
    } catch (err) {
      console.error('Download error:', err);
    }
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;

    if (modalMode === 'create') {
      const newReview: ReviewMeeting = {
        id: Date.now().toString(),
        title: form.title.trim(),
        status: (form.status?.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : (form.status || 'PLANNED')) as any,
        dateStr: form.dateStr?.trim() || '17-Sept-2026',
        organizer: form.chairedBy?.trim() || company.name || 'rmz',
        chairedBy: form.chairedBy?.trim() || undefined,
        apologies: form.apologies?.trim() || 'None',
        membersInAttendance: form.membersInAttendance?.trim() || undefined,
        time: form.time?.trim() || undefined,
        venue: form.venue?.trim() || 'rmz',
        objective: form.objective?.trim() || DEFAULT_OBJECTIVE,
        agenda: form.agenda?.trim() || DEFAULT_AGENDA,
      };
      onAddReview(newReview);
    } else if (modalMode === 'edit' && form.id) {
      const updated: ReviewMeeting = {
        ...(form as ReviewMeeting),
        title: form.title.trim() || 'ISO 9001:2015 Management Review Meeting',
        dateStr: form.dateStr?.trim() || '17-Sept-2026',
        venue: form.venue?.trim() || 'rmz',
        apologies: form.apologies?.trim() || 'None',
        objective: form.objective?.trim() || DEFAULT_OBJECTIVE,
        agenda: form.agenda?.trim() || DEFAULT_AGENDA,
      };
      setSelectedReview(updated);
      onUpdateReview?.(updated);
    }
    setModalMode(null);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.chairedBy && r.chairedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.venue && r.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.dateStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dedicated Detail View for Selected Review
  if (selectedReview) {
    const detailRows = [
      { label: 'Meeting', value: selectedReview.title, bold: true },
      { label: 'Apologies', value: selectedReview.apologies || 'None' },
      { label: 'Date', value: selectedReview.dateStr },
      { label: 'Venue', value: selectedReview.venue || 'rmz' },
      { label: 'Meeting objective', value: selectedReview.objective || DEFAULT_OBJECTIVE, pre: false },
      { label: 'Meeting agenda', value: selectedReview.agenda || DEFAULT_AGENDA, pre: true },
    ];

    return (
      <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setSelectedReview(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Management Reviews</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="text-slate-700 font-bold">{company.name}</span>
            <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
              {company.plan || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Navy Header Banner */}
        <div className="bg-[#122b4e] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 block mb-1">
                MANAGEMENT REVIEW
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedReview.title}
              </h1>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-white/90">
                {company.name || 'nk'}
              </span>
              <span className="mt-2 px-3 py-0.5 rounded-full border border-amber-400 text-amber-300 bg-transparent text-[11px] sm:text-xs font-bold tracking-widest uppercase">
                {selectedReview.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
          <div className="text-xs text-slate-500 font-medium">
            {downloadNotice ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {downloadNotice}
              </span>
            ) : (
              <span className="text-slate-500">
                DOCUMENT #: <strong className="text-slate-800 font-bold">{compDocCode}</strong>
                &nbsp;•&nbsp;
                <span>ISO 9001:2015 Clause 9.3</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf(selectedReview)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={() => openEditModal(selectedReview)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 bg-white"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Details Table Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-200/90 text-sm">
          {detailRows.map((row) => (
            <div key={row.label} className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                {row.label}
              </div>
              <div className={`p-4 sm:p-5 flex-1 text-slate-800 leading-relaxed ${row.bold ? 'font-medium' : 'font-normal'} ${row.pre ? 'whitespace-pre-line' : ''}`}>
                {row.value}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal (reuses the common ReviewModal) */}
        {modalMode === 'edit' && (
          <ReviewModal
            title="Edit Meeting Details"
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={() => setModalMode(null)}
          />
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold">{company.name}</span>
          <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
            {company.plan || 'ACTIVE'}
          </span>
          {company.registrationNumber && (
            <span className="hidden sm:inline-block font-mono text-slate-400">
              • Reg: {company.registrationNumber}
            </span>
          )}
        </div>
      </div>

      {/* Header and New Review Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name} — Management Review</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule executive QMS reviews, record minutes, and track action items for {company.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* Document Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compDocCode}</span>
          </div>
          <div className="h-3 w-px bg-slate-200 hidden sm:block" />
          <div>
            <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
            <span className="font-bold text-slate-900">17 Sep 2026</span>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Year:</span>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 appearance-none pr-7 cursor-pointer focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs and Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['planned', 'minutes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'planned' ? 'Planned Reviews' : 'Minutes Repository'}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-56 pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {(['ALL', 'PLANNED', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Review Item Cards */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm shadow-xs">
            {reviews.length === 0 ? (
              <>No management reviews scheduled. Click <span className="font-semibold text-blue-600">"New Review"</span> to create one.</>
            ) : (
              <>No reviews match your filters. <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }} className="text-blue-600 underline font-medium cursor-pointer">Reset</button></>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              onClick={() => setSelectedReview(rev)}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {rev.title}
                    </span>
                    <StatusBadge status={rev.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{rev.dateStr}</span>
                    {rev.time && <span>• {rev.time}</span>}
                    <span>• {rev.chairedBy ? `Chaired by ${rev.chairedBy}` : rev.organizer}</span>
                    {rev.venue && <span>• {rev.venue}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPdf(rev);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReview(rev);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete review "${rev.title}"?`)) onDeleteReview(rev.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {modalMode === 'create' && (
        <ReviewModal
          title="New Management Review"
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
};

// Unified Modal Component for Create & Edit
interface ReviewModalProps {
  title: string;
  form: Partial<ReviewMeeting>;
  setForm: React.Dispatch<React.SetStateAction<Partial<ReviewMeeting>>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter meeting title..."
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Chaired By</label>
                <input
                  type="text"
                  placeholder="Name Surname (Role)"
                  value={form.chairedBy || ''}
                  onChange={(e) => setForm({ ...form, chairedBy: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Apologies</label>
                <input
                  type="text"
                  value={form.apologies || ''}
                  onChange={(e) => setForm({ ...form, apologies: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Members in Attendance</label>
              <textarea
                rows={2}
                placeholder="Name Surname (Role); Name Surname (Role)..."
                value={form.membersInAttendance || ''}
                onChange={(e) => setForm({ ...form, membersInAttendance: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.dateStr || ''}
                    onChange={(e) => setForm({ ...form, dateStr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Time</label>
                <input
                  type="text"
                  placeholder="e.g. 9:30 AM"
                  value={form.time || ''}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Boardroom / MS Teams"
                  value={form.venue || ''}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Status</label>
                <select
                  value={form.status || 'PLANNED'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Meeting Objective</label>
              <textarea
                rows={3}
                value={form.objective || ''}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Meeting Agenda</label>
              <textarea
                rows={6}
                value={form.agenda || ''}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
