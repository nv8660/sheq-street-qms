import React, { useState, useEffect, useMemo } from 'react';
import {
  Smile, Send, FileText, Copy, Trash2, Check, ChevronDown,
  X, CheckCircle2, Mail, ExternalLink, Star, Eye, MessageSquare
} from 'lucide-react';
import { Company } from '../../types';

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
  scores?: { q1: number; q2: number; q3: number; q4: number; q5: number };
  comments?: string;
  responseDate?: string;
  emailDispatched?: boolean;
  previewUrl?: string | null;
}

const QUESTIONS_CONFIG = [
  { code: 'Q1', title: 'Product & Service Quality', desc: 'Conformance to specifications and defect-free supply.' },
  { code: 'Q2', title: 'Delivery & Timeliness', desc: 'On-time delivery and packaging integrity.' },
  { code: 'Q3', title: 'Support & Communication', desc: 'Responsiveness, competence, and service.' },
  { code: 'Q4', title: 'Problem & NCR Resolution', desc: 'Corrective action speed and resolution.' },
  { code: 'Q5', title: 'Overall Commercial Value', desc: 'Competitive pricing and partnership value.' },
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
    comments: 'Excellent quality assurance and prompt technical support.',
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

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [activeSurveyForResponse, setActiveSurveyForResponse] = useState<SurveyItem | null>(null);
  const [responseScores, setResponseScores] = useState({ q1: 100, q2: 100, q3: 100, q4: 100, q5: 100 });
  const [responseComments, setResponseComments] = useState('');
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

  // Esc closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setActiveSurveyForResponse(null);
        setViewingSurveyDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const copyToClipboard = (text: string, id?: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
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
    const generatedUrl = `https://onlinedesk.sheqstreet.co.za/survey/nk-cs-${Math.random().toString(36).substring(2, 7)}`;

    let emailSent = false;
    let previewUrl: string | null = null;
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
        emailSent = true;
        previewUrl = data.previewUrl || null;
        showToast(`Survey email sent to ${cleanEmail}!`);
      }
    } catch {}

    const newSurvey: SurveyItem = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      emailDispatched: emailSent,
      previewUrl,
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    copyToClipboard(generatedUrl, newId);
    setCustomerName('');
    setCustomerEmail('');
    setIsModalOpen(false);
  };

  const handleOpenResponseModal = (survey: SurveyItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveSurveyForResponse(survey);
    setResponseScores(survey.scores || { q1: 100, q2: 100, q3: 100, q4: 100, q5: 100 });
    setResponseComments(survey.comments || '');
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyForResponse) return;
    const { q1, q2, q3, q4, q5 } = responseScores;
    const overall = Math.round((q1 + q2 + q3 + q4 + q5) / 5);

    setSurveys((prev) =>
      prev.map((s) =>
        s.id === activeSurveyForResponse.id
          ? {
              ...s,
              status: 'Completed',
              rating: `${overall}%`,
              ratingNumber: overall,
              scores: { q1, q2, q3, q4, q5 },
              comments: responseComments.trim() || undefined,
              responseDate: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );
    setActiveSurveyForResponse(null);
    showToast(`Response recorded for "${activeSurveyForResponse.name}"!`);
  };

  // Metrics
  const completedSurveys = useMemo(() => surveys.filter((s) => s.status === 'Completed'), [surveys]);
  const overallRating = useMemo(() => {
    if (!completedSurveys.length) return null;
    const sum = completedSurveys.reduce((acc, s) => acc + (s.ratingNumber ?? parseInt(s.rating || '100', 10)), 0);
    return Math.round(sum / completedSurveys.length);
  }, [completedSurveys]);

  const questionBreakdown = useMemo(() => {
    return QUESTIONS_CONFIG.map((q) => {
      const qKey = q.code.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
      const items = completedSurveys.filter((s) => s.scores && typeof s.scores[qKey] === 'number');
      const avg = items.length ? Math.round(items.reduce((acc, s) => acc + (s.scores![qKey] || 0), 0) / items.length) : (overallRating || 100);
      return { ...q, rating: avg };
    });
  }, [completedSurveys, overallRating]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="text-slate-800 font-bold">{company.name}</span>
            <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
              {company.plan || 'ACTIVE'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name} — Customer Satisfaction</h1>
          <p className="text-sm text-slate-500 mt-0.5">ISO 9001 Clause 9.1.2 customer feedback tracking and live ratings.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600">Year</span>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-7 cursor-pointer shadow-2xs"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => { setCustomerName(''); setCustomerEmail(''); setIsModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Create Survey</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{overallRating !== null ? `${overallRating}%` : '—'}</div>
            <div className="text-xs text-slate-500 font-medium">Overall CSAT Rating</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{completedSurveys.length}</div>
            <div className="text-xs text-slate-500 font-medium">Completed Responses</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{surveys.length - completedSurveys.length}</div>
            <div className="text-xs text-slate-500 font-medium">Pending Feedback</div>
          </div>
        </div>
      </div>

      {/* 5-Question Breakdown Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">ISO 9001 Clause 9.1.2 Question Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {questionBreakdown.map((q) => (
            <div key={q.code} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{q.code}</span>
                <span className="font-bold text-blue-600">{q.rating}%</span>
              </div>
              <div className="font-semibold text-slate-700 truncate">{q.title}</div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${q.rating}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Survey Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Survey Register</h3>
          <span className="text-xs text-slate-400 font-medium">{surveys.length} surveys logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#122b49] text-white font-semibold border-b border-[#0e223f]">
                <th className="py-3 px-3.5 whitespace-nowrap">Customer Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">E-mail</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Date Sent</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">CSAT Score</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {surveys.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">{s.name}</td>
                  <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{s.email}</td>
                  <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{s.date}</td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-slate-900 whitespace-nowrap">
                    {s.rating || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 text-slate-400">
                      {s.status === 'Pending' ? (
                        <button
                          onClick={(e) => handleOpenResponseModal(s, e)}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[11px] hover:bg-blue-100 cursor-pointer"
                        >
                          Record Feedback
                        </button>
                      ) : (
                        <button
                          onClick={() => setViewingSurveyDetails(s)}
                          className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => copyToClipboard(`https://onlinedesk.sheqstreet.co.za/survey/nk-cs-${s.id}`, s.id)}
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Copy Link"
                      >
                        {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete survey for ${s.name}?`)) setSurveys(surveys.filter((x) => x.id !== s.id));
                        }}
                        className="p-1 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
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

      {/* Modal 1: Create Survey */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">Create & Send Survey</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAndCopyLink} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Manufacturing"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. orders@apexmanuf.co.za"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  Send & Copy Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Response */}
      {activeSurveyForResponse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setActiveSurveyForResponse(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Feedback: {activeSurveyForResponse.name}</h3>
                <span className="text-xs text-slate-500">{activeSurveyForResponse.email}</span>
              </div>
              <button onClick={() => setActiveSurveyForResponse(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-3 pt-3 text-xs">
              {QUESTIONS_CONFIG.map((q) => {
                const qKey = q.code.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
                const currentScore = responseScores[qKey];
                const stars = Math.round(currentScore / 20);

                return (
                  <div key={q.code} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.code}: {q.title}</span>
                      <span className="font-bold text-blue-700">{currentScore}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setResponseScores((prev) => ({ ...prev, [qKey]: s * 20 }))}
                          className="p-0.5 cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Comments</label>
                <textarea
                  rows={2}
                  value={responseComments}
                  onChange={(e) => setResponseComments(e.target.value)}
                  placeholder="Optional customer feedback..."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveSurveyForResponse(null)} className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  Save Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Details */}
      {viewingSurveyDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setViewingSurveyDetails(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewingSurveyDetails.name}</h3>
                <span className="text-xs text-slate-500">{viewingSurveyDetails.email}</span>
              </div>
              <button onClick={() => setViewingSurveyDetails(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Total Rating</span>
                <span className="text-xl font-extrabold text-emerald-700">{viewingSurveyDetails.rating || '100%'}</span>
              </div>

              {QUESTIONS_CONFIG.map((q) => {
                const qKey = q.code.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
                const score = viewingSurveyDetails.scores?.[qKey] ?? 100;
                return (
                  <div key={q.code} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-800">{q.code}: {q.title}</span>
                    <span className="font-bold text-blue-700">{score}%</span>
                  </div>
                );
              })}

              {viewingSurveyDetails.comments && (
                <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-700 italic">
                  "{viewingSurveyDetails.comments}"
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setViewingSurveyDetails(null)} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
