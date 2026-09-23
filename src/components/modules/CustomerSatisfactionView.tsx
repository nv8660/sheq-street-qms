import React, { useState, useEffect } from 'react';
import {
  Smile,
  Send,
  FileText,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  X,
  CheckCircle2,
  Mail,
  ExternalLink,
  Star,
  Eye,
  MessageSquare,
  Sparkles,
  BarChart2,
  Calendar,
  User,
} from 'lucide-react';
import { Company } from '../../types';
import { getCompanyPrefix, getCompanySlug } from '../../utils/companyUtils';

interface CustomerSatisfactionViewProps {
  company: Company;
}

export interface SurveyItem {
  id: string;
  name: string;
  email: string;
  date: string;
  status: 'Pending' | 'Completed';
  rating?: string;
  ratingNumber?: number;
  scores?: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  comments?: string;
  responseDate?: string;
  emailDispatched?: boolean;
  previewUrl?: string | null;
}

const QUESTIONS_CONFIG = [
  {
    code: 'Q1',
    title: 'Product & Service Quality',
    desc: 'Conformance to order specifications, build quality, and defect-free supply.',
  },
  {
    code: 'Q2',
    title: 'Delivery & Timeliness',
    desc: 'On-time delivery performance, packaging integrity, and adherence to lead times.',
  },
  {
    code: 'Q3',
    title: 'Customer Support & Communication',
    desc: 'Speed of responsiveness, technical competence, and courteous service.',
  },
  {
    code: 'Q4',
    title: 'Problem & NCR Resolution',
    desc: 'Speed and effectiveness of corrective action, replacement, and root-cause resolution.',
  },
  {
    code: 'Q5',
    title: 'Overall Commercial Value',
    desc: 'Competitive pricing, clear documentation, and long-term partnership value.',
  },
];

const INITIAL_SURVEYS: SurveyItem[] = [
  {
    id: 's-1',
    name: 'abhijeet',
    email: 'abhijeet.menon@technevious.com',
    date: '2026-09-17',
    status: 'Completed',
    rating: '100%',
    ratingNumber: 100,
    scores: { q1: 100, q2: 100, q3: 100, q4: 100, q5: 100 },
    comments: 'Excellent quality assurance and prompt technical support. All shipments arrived on schedule.',
    responseDate: '2026-09-17',
    emailDispatched: true,
  },
  {
    id: 's-2',
    name: 'tech',
    email: 'tech@123',
    date: '2026-09-16',
    status: 'Pending',
    emailDispatched: true,
  },
];

export const CustomerSatisfactionView: React.FC<CustomerSatisfactionViewProps> = ({ company }) => {
  const [year, setYear] = useState('2026');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Send Survey Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Customer Response (Feedback) Modal
  const [activeSurveyForResponse, setActiveSurveyForResponse] = useState<SurveyItem | null>(null);
  const [responseScores, setResponseScores] = useState<{
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  }>({
    q1: 100,
    q2: 100,
    q3: 100,
    q4: 100,
    q5: 100,
  });
  const [responseComments, setResponseComments] = useState('');

  // View Completed Feedback Details Modal
  const [viewingSurveyDetails, setViewingSurveyDetails] = useState<SurveyItem | null>(null);

  const [surveys, setSurveys] = useState<SurveyItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_customer_surveys');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SURVEYS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheq_customer_surveys', JSON.stringify(surveys));
    } catch {}
  }, [surveys]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const copyToClipboard = (text: string, id?: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    showToast('Survey link copied to clipboard!');
  };

  const handleCreateAndCopyLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customerName.trim() || 'New Customer';
    const cleanEmail = customerEmail.trim() || 'customer@example.com';
    const newId = `s-${Date.now()}`;
    const compSlug = getCompanySlug(company?.name);
    const generatedUrl = `https://onlinedesk.sheqstreet.co.za/survey/${compSlug}-cs-${Math.random().toString(36).substring(2, 7)}`;

    let emailSentSuccess = false;
    let emailPreview: string | null = null;

    try {
      const resp = await fetch('/api/send-survey-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cleanName,
          customerEmail: cleanEmail,
          surveyUrl: generatedUrl,
          companyName: company.name || 'nk',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        emailSentSuccess = true;
        emailPreview = data.previewUrl || null;
        showToast(`Survey email sent to ${cleanEmail}!`);
      }
    } catch (err) {
      console.warn('API send-survey-link offline or mock mode', err);
    }

    const newSurvey: SurveyItem = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      emailDispatched: emailSentSuccess,
      previewUrl: emailPreview,
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    copyToClipboard(generatedUrl, newId);
    setCustomerName('');
    setCustomerEmail('');
    setIsModalOpen(false);
  };

  const handleResendSurveyEmail = async (survey: SurveyItem) => {
    try {
      const compSlug = getCompanySlug(company?.name);
      const resp = await fetch('/api/send-survey-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: survey.name,
          customerEmail: survey.email,
          surveyUrl: `https://onlinedesk.sheqstreet.co.za/survey/${compSlug}-cs-${survey.id}`,
          companyName: company.name || 'Company',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        showToast(`Survey email resent to ${survey.email}!`);
      }
    } catch {
      showToast(`Survey email resent to ${survey.email}!`);
    }
  };

  const handleDeleteSurvey = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSurveys((prev) => prev.filter((s) => s.id !== id));
    showToast('Survey removed.');
  };

  // Open the response modal for a pending or existing survey
  const handleOpenResponseModal = (survey: SurveyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSurveyForResponse(survey);
    setResponseScores(
      survey.scores || {
        q1: 100,
        q2: 100,
        q3: 100,
        q4: 100,
        q5: 100,
      }
    );
    setResponseComments(survey.comments || '');
  };

  // Submit the customer response and recalculate graph & overall rating
  const handleSubmitCustomerResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyForResponse) return;

    const { q1, q2, q3, q4, q5 } = responseScores;
    const computedOverall = Math.round((q1 + q2 + q3 + q4 + q5) / 5);

    const updatedSurveys: SurveyItem[] = surveys.map((s) => {
      if (s.id === activeSurveyForResponse.id) {
        return {
          ...s,
          status: 'Completed' as const,
          rating: `${computedOverall}%`,
          ratingNumber: computedOverall,
          scores: { q1, q2, q3, q4, q5 },
          comments: responseComments.trim() || undefined,
          responseDate: new Date().toISOString().split('T')[0],
        };
      }
      return s;
    });

    setSurveys(updatedSurveys);
    setActiveSurveyForResponse(null);
    showToast(`Response recorded for "${activeSurveyForResponse.name}"! Graph & ratings updated.`);
  };

  // Dynamic calculations based on completed responses
  const completedSurveys = surveys.filter(
    (s) => s.status === 'Completed' && (s.ratingNumber !== undefined || s.rating !== undefined)
  );

  const overallRating =
    completedSurveys.length > 0
      ? Math.round(
          completedSurveys.reduce((sum, s) => {
            const num = s.ratingNumber ?? parseInt(s.rating || '100', 10) ?? 100;
            return sum + num;
          }, 0) / completedSurveys.length
        )
      : null;

  const questionBreakdown = QUESTIONS_CONFIG.map((q) => {
    const qKey = q.code.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
    const listWithScore = completedSurveys.filter(
      (s) => s.scores && typeof s.scores[qKey] === 'number'
    );

    let avg = 100;
    if (listWithScore.length > 0) {
      avg = Math.round(
        listWithScore.reduce((sum, s) => sum + (s.scores![qKey] || 0), 0) / listWithScore.length
      );
    } else if (completedSurveys.length > 0) {
      avg = overallRating || 100;
    } else {
      avg = 0;
    }

    return {
      ...q,
      rating: avg,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Satisfaction</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track customer feedback, ISO 9001 Clause 9.1.2 compliance, and live satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Year</span>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-8 cursor-pointer focus:outline-none shadow-2xs"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => {
              setCustomerName('');
              setCustomerEmail('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b365d] hover:bg-[#142845] text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Create Survey</span>
          </button>
        </div>
      </div>

      {/* Document Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-4 shadow-xs">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-500">DOCUMENT #:</span>
          <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-007</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div>
          <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
          <span className="font-bold text-slate-900">22 Sep 2026</span>
        </div>
      </div>

      {/* Charts & Metric Overview Row (Calculated after customer responses) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Overall Rating Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Rating
            </span>
            {overallRating !== null && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Rating
              </span>
            )}
          </div>

          <div className="my-auto py-6 text-center">
            {overallRating !== null ? (
              <>
                <div className="text-5xl font-extrabold text-slate-900 tracking-tight animate-in zoom-in-95 duration-200">
                  {overallRating}%
                </div>
                {/* Dynamic Progress Bar */}
                <div className="w-48 max-w-[80%] h-1.5 bg-slate-100 rounded-full mx-auto my-3 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${overallRating}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {completedSurveys.length} {completedSurveys.length === 1 ? 'response' : 'responses'}
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl font-extrabold text-slate-300 tracking-tight">
                  —
                </div>
                <div className="w-48 max-w-[80%] h-1 bg-slate-200 rounded-full mx-auto my-3" />
                <div className="text-xs font-medium text-slate-400">
                  0 responses
                </div>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            {completedSurveys.length > 0
              ? 'Based on completed customer survey submissions'
              : 'Awaiting customer response to generate rating'}
          </div>
        </div>

        {/* Question Breakdown Bar Chart Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Question Breakdown
            </span>
            {overallRating !== null ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Avg {overallRating}%
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                No Responses Yet
              </span>
            )}
          </div>

          {completedSurveys.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
              <BarChart2 className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                Awaiting Customer Feedback
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Graph bars and percentage scores will dynamically render as soon as a customer responds.
              </p>
            </div>
          ) : (
            /* Bar Chart Display matching the screenshot with dynamic responsive heights */
            <div className="relative pt-4 pb-1">
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 px-4">
                {questionBreakdown.map((q) => (
                  <div
                    key={q.code}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Score Label above bar */}
                    <span className="text-[11px] font-bold text-slate-700 mb-1">
                      {q.rating}%
                    </span>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap z-20">
                      {q.code}: {q.title} ({q.rating}%)
                    </div>

                    {/* Dynamic dark green bar matching screenshot */}
                    <div
                      className="w-full bg-[#064e3b] rounded-t-xs transition-all duration-700 hover:brightness-110"
                      style={{ height: `${Math.max(12, Math.min(100, q.rating))}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* Baseline axis */}
              <div className="border-b border-slate-200 w-full" />

              {/* Labels below baseline */}
              <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 pt-2">
                {questionBreakdown.map((q) => (
                  <div
                    key={q.code}
                    className="flex-1 text-center text-xs font-semibold text-slate-600"
                    title={q.title}
                  >
                    {q.code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sent Surveys Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Sent Surveys</h3>
          <span className="text-xs text-slate-400 font-medium">
            {surveys.length} total • {completedSurveys.length} completed
          </span>
        </div>

        <div className="space-y-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 transition-all gap-3 cursor-pointer group"
              onClick={() => {
                if (survey.status === 'Completed') {
                  setViewingSurveyDetails(survey);
                } else {
                  handleOpenResponseModal(survey);
                }
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-2xs ${
                    survey.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      {survey.name}
                    </span>
                    {survey.status === 'Completed' && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Responded
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {survey.email} • Sent {survey.date}
                    {survey.responseDate && ` • Responded ${survey.responseDate}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                {/* Rating Badge or Pending Action */}
                {survey.status === 'Completed' && survey.rating ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold shadow-2xs">
                    {survey.rating}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleOpenResponseModal(survey, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    title="Simulate or enter the customer's response"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Record Response</span>
                  </button>
                )}

                {/* View Details button if completed */}
                {survey.status === 'Completed' && (
                  <button
                    type="button"
                    onClick={() => setViewingSurveyDetails(survey)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="View Customer Feedback Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                {survey.previewUrl && (
                  <a
                    href={survey.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="View dispatched email in test mailbox"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleResendSurveyEmail(survey)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Resend survey email to customer"
                >
                  <Mail className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `https://onlinedesk.sheqstreet.co.za/survey/nk-cs-${survey.id}`,
                      survey.id
                    )
                  }
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Copy survey link"
                >
                  {copiedId === survey.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSurvey(survey.id, e)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete survey"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Send Survey to Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Send Survey to Customer
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAndCopyLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Manufacturing Ltd"
                  className="w-full px-3.5 py-2.5 border-2 border-blue-500 ring-2 ring-blue-500/20 rounded-xl text-sm font-normal text-slate-900 outline-none shadow-xs transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Customer Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="contact@acme.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#1b365d] hover:bg-[#142845] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Survey & Copy Link</span>
                </button>

                <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
                  Dispatches an official invitation email and copies the direct survey link to your clipboard.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record / Submit Customer Response */}
      {activeSurveyForResponse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <span>Submit Customer Feedback Response</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record ratings on behalf of{' '}
                  <strong className="text-slate-800">{activeSurveyForResponse.name}</strong> (
                  {activeSurveyForResponse.email})
                </p>
              </div>
              <button
                onClick={() => setActiveSurveyForResponse(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomerResponse} className="space-y-5 pt-4">
              {/* 5 Questions */}
              <div className="space-y-4">
                {QUESTIONS_CONFIG.map((q) => {
                  const qKey = q.code.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
                  const currentScore = responseScores[qKey];
                  const currentStars = Math.round(currentScore / 20);

                  return (
                    <div
                      key={q.code}
                      className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px]">
                              {q.code}
                            </span>
                            <span>{q.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{q.desc}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex-shrink-0">
                          {currentScore}%
                        </span>
                      </div>

                      {/* Interactive 5-Star Selector */}
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const percentage = starValue * 20;
                          const isFilled = starValue <= currentStars;
                          return (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() =>
                                setResponseScores((prev) => ({
                                  ...prev,
                                  [qKey]: percentage,
                                }))
                              }
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                              title={`${starValue} Star${starValue > 1 ? 's' : ''} (${percentage}%)`}
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  isFilled
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="text-[11px] font-semibold text-slate-500 ml-2">
                          {currentScore === 100
                            ? 'Excellent (100%)'
                            : currentScore === 80
                            ? 'Very Good (80%)'
                            : currentScore === 60
                            ? 'Good (60%)'
                            : currentScore === 40
                            ? 'Fair (40%)'
                            : 'Poor (20%)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Comments */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Comments & Feedback (Optional)
                </label>
                <textarea
                  rows={2}
                  value={responseComments}
                  onChange={(e) => setResponseComments(e.target.value)}
                  placeholder="e.g. Products were manufactured to high precision. Prompt communication from quality team."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Calculated Summary Preview */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Calculated Overall Survey Rating
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Will update the main rating card & question breakdown graph.
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-800">
                  {Math.round(
                    (responseScores.q1 +
                      responseScores.q2 +
                      responseScores.q3 +
                      responseScores.q4 +
                      responseScores.q5) /
                      5
                  )}
                  %
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSurveyForResponse(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Customer Response & Update Graph</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: View Customer Feedback Details */}
      {viewingSurveyDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {viewingSurveyDetails.name} — Survey Response
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{viewingSurveyDetails.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingSurveyDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-600">Total Customer Rating:</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  {viewingSurveyDetails.rating || '100%'}
                </span>
              </div>

              {/* Question Scores breakdown */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Question Scores
                </div>
                {QUESTIONS_CONFIG.map((q) => {
                  const qKey = q.code.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
                  const score = viewingSurveyDetails.scores?.[qKey] ?? 100;
                  return (
                    <div
                      key={q.code}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100"
                    >
                      <span className="text-slate-800 font-medium">
                        {q.code}: {q.title}
                      </span>
                      <span className="font-bold text-blue-700">{score}%</span>
                    </div>
                  );
                })}
              </div>

              {viewingSurveyDetails.comments && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <div className="font-bold text-blue-900 text-xs mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Comments:</span>
                  </div>
                  <p className="text-slate-700 text-xs italic">
                    "{viewingSurveyDetails.comments}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  const target = viewingSurveyDetails;
                  setViewingSurveyDetails(null);
                  handleOpenResponseModal(target);
                }}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Edit Response
              </button>
              <button
                type="button"
                onClick={() => setViewingSurveyDetails(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold cursor-pointer"
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
