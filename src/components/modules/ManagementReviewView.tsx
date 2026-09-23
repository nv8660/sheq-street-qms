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

export const ManagementReviewView: React.FC<ManagementReviewViewProps> = ({
  company,
  reviews,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<'planned' | 'minutes'>('planned');
  const [year, setYear] = useState('2026');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewMeeting | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<ReviewMeeting | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // New Review Form states
  const [titleInput, setTitleInput] = useState('');
  const [chairedBy, setChairedBy] = useState('');
  const [apologies, setApologies] = useState('None');
  const [members, setMembers] = useState('');
  const [dateInput, setDateInput] = useState('17-Sept-2026');
  const [timeInput, setTimeInput] = useState('');
  const [venue, setVenue] = useState('rmz');
  const [status, setStatus] = useState('Planned');
  const [objective, setObjective] = useState(DEFAULT_OBJECTIVE);
  const [agenda, setAgenda] = useState(DEFAULT_AGENDA);

  const resetForm = () => {
    setTitleInput('');
    setChairedBy('');
    setApologies('None');
    setMembers('');
    setDateInput('17-Sept-2026');
    setTimeInput('');
    setVenue('rmz');
    setStatus('Planned');
    setObjective(DEFAULT_OBJECTIVE);
    setAgenda(DEFAULT_AGENDA);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleDownloadPdf = (review: ReviewMeeting) => {
    setDownloadNotice(`Preparing PDF for "${review.title}"...`);
    try {
      downloadReviewPDF(review, company);
    } catch (err) {
      console.error('Download error:', err);
    }
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newReview: ReviewMeeting = {
      id: Date.now().toString(),
      title: titleInput.trim(),
      status: status.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'PLANNED',
      dateStr: dateInput,
      organizer: chairedBy.trim() || company.name || 'rmz',
      chairedBy: chairedBy.trim() || undefined,
      apologies: apologies.trim() || 'None',
      membersInAttendance: members.trim() || undefined,
      time: timeInput.trim() || undefined,
      venue: venue.trim() || 'rmz',
      objective: objective.trim() || DEFAULT_OBJECTIVE,
      agenda: agenda.trim() || DEFAULT_AGENDA,
    };

    onAddReview(newReview);
    resetForm();
    setIsModalOpen(false);
  };

  const handleOpenEditModal = (review: ReviewMeeting) => {
    setEditFormData({
      ...review,
      objective: review.objective || DEFAULT_OBJECTIVE,
      agenda: review.agenda || DEFAULT_AGENDA,
      apologies: review.apologies || 'None',
      venue: review.venue || 'rmz',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    const updated: ReviewMeeting = {
      ...editFormData,
      title: editFormData.title.trim() || 'ISO 9001:2015 Management Review Meeting',
      dateStr: editFormData.dateStr.trim() || '17-Sept-2026',
      venue: editFormData.venue?.trim() || 'rmz',
      apologies: editFormData.apologies?.trim() || 'None',
      objective: editFormData.objective?.trim() || DEFAULT_OBJECTIVE,
      agenda: editFormData.agenda?.trim() || DEFAULT_AGENDA,
    };

    setSelectedReview(updated);
    if (onUpdateReview) {
      onUpdateReview(updated);
    }
    setIsEditModalOpen(false);
  };

  // If a review is selected, display the exact dedicated view matching the user's screenshot
  if (selectedReview) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
        {/* Navigation & Breadcrumb Row */}
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

        {/* Navy Header Banner matching user's screenshot */}
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

        {/* Action Bar with Download PDF and Edit Details */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
          <div className="text-xs text-slate-500 font-medium">
            {downloadNotice ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {downloadNotice}
              </span>
            ) : (
              <span className="text-slate-500">
                DOCUMENT #: <strong className="text-slate-800 font-bold">{company.name ? company.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'NK'}-DC-014</strong>
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
              title="Download Management Review as Print-Ready PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenEditModal(selectedReview)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 bg-white"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Two-Column Master Details Table Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-200/90 text-sm">
            {/* Meeting */}
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                Meeting
              </div>
              <div className="p-4 sm:p-5 flex-1 text-slate-800 font-medium">
                {selectedReview.title}
              </div>
            </div>

            {/* Apologies */}
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                Apologies
              </div>
              <div className="p-4 sm:p-5 flex-1 text-slate-800">
                {selectedReview.apologies || 'None'}
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                Date
              </div>
              <div className="p-4 sm:p-5 flex-1 text-slate-800">
                {selectedReview.dateStr}
              </div>
            </div>

            {/* Venue */}
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                Venue
              </div>
              <div className="p-4 sm:p-5 flex-1 text-slate-800">
                {selectedReview.venue || 'rmz'}
              </div>
            </div>

            {/* Meeting objective */}
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                Meeting objective
              </div>
              <div className="p-4 sm:p-5 flex-1 text-slate-800 leading-relaxed font-normal">
                {selectedReview.objective || DEFAULT_OBJECTIVE}
              </div>
            </div>

            {/* Meeting agenda */}
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-56 bg-slate-50/80 p-4 sm:p-5 font-bold text-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200/90 flex-shrink-0">
                Meeting agenda
              </div>
              <div className="p-4 sm:p-5 flex-1 text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {selectedReview.agenda || DEFAULT_AGENDA}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Details Modal */}
        {isEditModalOpen && editFormData && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Edit Meeting Details</h2>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Meeting Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                        Date
                      </label>
                      <input
                        type="text"
                        value={editFormData.dateStr}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, dateStr: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={editFormData.venue || ''}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, venue: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                        Apologies
                      </label>
                      <input
                        type="text"
                        value={editFormData.apologies || ''}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, apologies: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                        Status
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            status: e.target.value as any,
                          })
                        }
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
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Meeting Objective
                    </label>
                    <textarea
                      rows={4}
                      value={editFormData.objective || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, objective: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Meeting Agenda
                    </label>
                    <textarea
                      rows={8}
                      value={editFormData.agenda || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, agenda: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs font-sans text-xs leading-relaxed resize-y"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
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

  // Otherwise, render list view
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
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* Document Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-4 shadow-xs">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-500">DOCUMENT #:</span>
          <span className="font-bold text-slate-900">
            {company.name ? company.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'NK'}-DC-014
          </span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div>
          <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
          <span className="font-bold text-slate-900">17 Sep 2026</span>
        </div>
      </div>

      {/* Year Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">Year</span>
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-8 cursor-pointer focus:outline-none"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('planned')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'planned'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Planned Reviews
        </button>
        <button
          onClick={() => setActiveTab('minutes')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'minutes'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Minutes Repository
        </button>
      </div>

      {/* Review Item Cards */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm shadow-xs">
            No management reviews scheduled. Click <span className="font-semibold text-blue-600">"New Review"</span> to create one.
          </div>
        ) : (
          reviews.map((rev) => (
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
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                        rev.status.toUpperCase() === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-300'
                      }`}
                    >
                      {rev.status}
                    </span>
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
                    onDeleteReview(rev.id);
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

      {/* New Management Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">New Management Review</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Meeting Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter meeting title..."
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                  />
                </div>

                {/* Chaired By and Apologies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Chaired By
                    </label>
                    <input
                      type="text"
                      placeholder="Name Surname (Role)"
                      value={chairedBy}
                      onChange={(e) => setChairedBy(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Apologies
                    </label>
                    <input
                      type="text"
                      value={apologies}
                      onChange={(e) => setApologies(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Members in Attendance */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Members in Attendance
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Name Surname (Role); Name Surname (Role)..."
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9:30 AM"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Venue and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Boardroom / MS Teams"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Meeting Objective */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Meeting Objective
                  </label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
                  />
                </div>

                {/* Meeting Agenda */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Meeting Agenda (one item per line)
                  </label>
                  <textarea
                    rows={6}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs font-sans text-xs leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Schedule Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
