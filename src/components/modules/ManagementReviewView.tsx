import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  FileText,
  Trash2,
  ChevronDown,
  X,
} from 'lucide-react';
import { ReviewMeeting, Company } from '../../types';

interface ManagementReviewViewProps {
  company: Company;
  reviews: ReviewMeeting[];
  onAddReview: (review: ReviewMeeting) => void;
  onDeleteReview: (id: string) => void;
}

export const ManagementReviewView: React.FC<ManagementReviewViewProps> = ({
  company,
  reviews,
  onAddReview,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<'planned' | 'minutes'>('planned');
  const [year, setYear] = useState('2026');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState('24-Oct-2026');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    onAddReview({
      id: Date.now().toString(),
      title: titleInput.trim(),
      status: 'PLANNED',
      dateStr: dateInput,
      organizer: 'Naveen V',
    });
    setTitleInput('');
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
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
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

      {/* Review Item Card matching screenshot */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{rev.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-300">
                    {rev.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {rev.dateStr} • {rev.organizer}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteReview(rev.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
              title="Delete Review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* New Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Schedule Management Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Agenda / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Executive Quality Review"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Date
                </label>
                <input
                  type="text"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-blue-700"
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
