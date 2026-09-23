import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  FileText,
  Trash2,
  ChevronDown,
  X,
  Clock,
  MapPin,
  User,
  Users,
  Eye,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { ReviewMeeting, Company } from '../../types';

interface ManagementReviewViewProps {
  company: Company;
  reviews: ReviewMeeting[];
  onAddReview: (review: ReviewMeeting) => void;
  onDeleteReview: (id: string) => void;
}

const DEFAULT_OBJECTIVE =
  "The organisation's management review of the quality management system to ensure suitability, adequacy and effectiveness. The review is to include the assessment of opportunities for improvement and any potential changes to the quality management system, including quality policy, objectives & targets, and their alignment with business strategy.";

const DEFAULT_AGENDA =
  '1. Status of actions from previous management reviews\n' +
  '2. Changes in external and internal issues relevant to QMS\n' +
  '3. Information on QMS performance and effectiveness (customer satisfaction, quality objectives, audit results, process performance, nonconformities)\n' +
  '4. Adequacy of resources\n' +
  '5. Effectiveness of actions taken to address risks and opportunities\n' +
  '6. Opportunities for continual improvement';

export const ManagementReviewView: React.FC<ManagementReviewViewProps> = ({
  company,
  reviews,
  onAddReview,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<'planned' | 'minutes'>('planned');
  const [year, setYear] = useState('2026');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewMeeting | null>(null);

  // Form states matching pinned image
  // "don't type that title that has been given in that image" -> titleInput starts empty!
  const [titleInput, setTitleInput] = useState('');
  const [chairedBy, setChairedBy] = useState('');
  const [apologies, setApologies] = useState('None');
  const [members, setMembers] = useState('');
  const [dateInput, setDateInput] = useState('22-09-2026');
  const [timeInput, setTimeInput] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState('Planned');
  const [objective, setObjective] = useState(DEFAULT_OBJECTIVE);
  const [agenda, setAgenda] = useState(DEFAULT_AGENDA);

  const resetForm = () => {
    setTitleInput('');
    setChairedBy('');
    setApologies('None');
    setMembers('');
    setDateInput('22-09-2026');
    setTimeInput('');
    setVenue('');
    setStatus('Planned');
    setObjective(DEFAULT_OBJECTIVE);
    setAgenda(DEFAULT_AGENDA);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newReview: ReviewMeeting = {
      id: Date.now().toString(),
      title: titleInput.trim(),
      status: status.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'PLANNED',
      dateStr: dateInput,
      organizer: chairedBy.trim() || company.name || 'Management',
      chairedBy: chairedBy.trim() || undefined,
      apologies: apologies.trim() || undefined,
      membersInAttendance: members.trim() || undefined,
      time: timeInput.trim() || undefined,
      venue: venue.trim() || undefined,
      objective: objective.trim() || undefined,
      agenda: agenda.trim() || undefined,
    };

    onAddReview(newReview);
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header and New Review Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Management Review</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule reviews, record minutes, and track action items.
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
          <span className="font-bold text-slate-900">NK-DC-014</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div>
          <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
          <span className="font-bold text-slate-900">16 Sep 2026</span>
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
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{rev.title}</span>
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
                  onClick={() => setSelectedReview(rev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteReview(rev.id)}
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

      {/* New Management Review Modal matching Pinned Image */}
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
                {/* Meeting Title: Start EMPTY as requested by user ("don't type that title that has been given in that image") */}
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
                    Meeting Agenda (one item per line — auto-populates minutes table)
                  </label>
                  <textarea
                    rows={5}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs font-mono text-xs leading-relaxed resize-y"
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

      {/* Review Details View Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-5 px-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Management Review Details</span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedReview.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Status</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedReview.status}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Date</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedReview.dateStr}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Time</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedReview.time || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Venue</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedReview.venue || 'Not specified'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Chaired By</div>
                  <div className="font-semibold text-slate-900">{selectedReview.chairedBy || selectedReview.organizer}</div>
                </div>
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Apologies</div>
                  <div className="text-slate-800">{selectedReview.apologies || 'None'}</div>
                </div>
              </div>

              {selectedReview.membersInAttendance && (
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Members in Attendance</div>
                  <div className="text-slate-800">{selectedReview.membersInAttendance}</div>
                </div>
              )}

              {selectedReview.objective && (
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">Meeting Objective</div>
                  <div className="text-slate-700 leading-relaxed text-xs">{selectedReview.objective}</div>
                </div>
              )}

              {selectedReview.agenda && (
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1.5">Meeting Agenda</div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800 leading-relaxed">
                    {selectedReview.agenda}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
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
