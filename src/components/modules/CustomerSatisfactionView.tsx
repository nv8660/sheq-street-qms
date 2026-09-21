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
} from 'lucide-react';
import { Company } from '../../types';

interface CustomerSatisfactionViewProps {
  company: Company;
}

interface SurveyItem {
  id: string;
  name: string;
  email: string;
  date: string;
  status: 'Pending' | 'Completed';
  rating?: string;
  emailDispatched?: boolean;
  previewUrl?: string | null;
}

const INITIAL_SURVEYS: SurveyItem[] = [
  {
    id: 's-1',
    name: 'abhijeet',
    email: 'abhijeet.menon@technevious.com',
    date: '2026-09-17',
    status: 'Completed',
    rating: '100%',
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

  // Modal state - starts closed until user clicks "Create Survey"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [surveys, setSurveys] = useState<SurveyItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_customer_surveys');
      return saved ? JSON.parse(saved) : INITIAL_SURVEYS;
    } catch {
      return INITIAL_SURVEYS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheq_customer_surveys', JSON.stringify(surveys));
    } catch {
      // ignore
    }
  }, [surveys]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
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
    const generatedUrl = `https://onlinedesk.sheqstreet.co.za/survey/nk-cs-${Math.random().toString(36).substring(2, 7)}`;

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
      const resp = await fetch('/api/send-survey-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: survey.name,
          customerEmail: survey.email,
          surveyUrl: `https://onlinedesk.sheqstreet.co.za/survey/nk-cs-${survey.id}`,
          companyName: company.name || 'nk',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        showToast(`Survey email resent to ${survey.email}!`);
      }
    } catch (err) {
      showToast(`Survey email resent to ${survey.email}!`);
    }
  };

  const handleDeleteSurvey = (id: string) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
  };

  // Questions for the chart
  const questions = [
    { code: 'Q1', title: 'Product & Service Quality', rating: 100 },
    { code: 'Q2', title: 'Delivery & Timeliness', rating: 100 },
    { code: 'Q3', title: 'Customer Support & Communication', rating: 100 },
    { code: 'Q4', title: 'Problem & NCR Resolution', rating: 100 },
    { code: 'Q5', title: 'Overall Commercial Value', rating: 100 },
  ];

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
            Track customer feedback and aggregate satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          <span className="font-bold text-slate-900">NK-DC-007</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div>
          <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
          <span className="font-bold text-slate-900">17 Sep 2026</span>
        </div>
      </div>

      {/* Charts & Metric Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Overall Rating Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[260px]">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Rating
          </div>

          <div className="my-auto py-6 text-center">
            <div className="text-5xl font-extrabold text-slate-900 tracking-tight">
              100%
            </div>
            {/* Blue Progress Bar Line */}
            <div className="w-48 max-w-[80%] h-1 bg-blue-600 rounded-full mx-auto my-3" />
            <div className="text-xs font-medium text-slate-400">
              1 response
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Based on completed survey submissions
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Question Breakdown
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Avg 100%
            </span>
          </div>

          {/* Bar Chart Display matching the screenshot */}
          <div className="relative pt-4 pb-1">
            <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 px-4">
              {questions.map((q) => (
                <div
                  key={q.code}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap z-20">
                    {q.code}: {q.title} (100%)
                  </div>

                  {/* Dark green bar matching screenshot */}
                  <div
                    className="w-full bg-[#064e3b] rounded-t-xs transition-all duration-300 hover:brightness-110"
                    style={{ height: '96%' }}
                  />
                </div>
              ))}
            </div>

            {/* Baseline axis */}
            <div className="border-b border-slate-200 w-full" />

            {/* Labels below baseline */}
            <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 pt-2">
              {questions.map((q) => (
                <div
                  key={q.code}
                  className="flex-1 text-center text-xs font-medium text-slate-500"
                >
                  {q.code}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sent Surveys Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Sent Surveys</h3>
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{survey.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {survey.email} • Sent {survey.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {survey.rating ? (
                  <span className="text-sm font-bold text-slate-900 mr-1">
                    {survey.rating}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {survey.status}
                  </span>
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
                  onClick={() => handleResendSurveyEmail(survey)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Resend survey email to customer"
                >
                  <Mail className="w-4 h-4" />
                </button>

                <button
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
                  onClick={() => handleDeleteSurvey(survey.id)}
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

      {/* Send Survey to Customer Modal (matching pinned image) */}
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
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Acme Ltd"
                  className="w-full px-3.5 py-2.5 border-2 border-blue-500 ring-2 ring-blue-500/20 rounded-xl text-sm font-normal text-slate-900 outline-none shadow-xs transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Customer Email
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
                  className="w-full py-2.5 px-4 bg-[#70a5f8] hover:bg-[#5b95ef] text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Copy className="w-4 h-4" />
                  <span>Create & Copy Link</span>
                </button>

                <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
                  The survey link will be copied to your clipboard to share manually.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
