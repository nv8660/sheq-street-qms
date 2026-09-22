import React, { useEffect } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  Shield,
  UserCheck,
  Eye,
  Check,
  ArrowRight,
  Mail,
  ExternalLink,
  X,
} from 'lucide-react';
import { NavigationTab, AuthUser, Company } from '../types';

export interface LoginAlertNotice {
  email: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'failed';
  previewUrl?: string | null;
  message?: string;
}

interface SessionModeSelectionViewProps {
  user: AuthUser;
  company: Company;
  onSelectMode: (mode: 'management' | 'consultant' | 'auditor') => void;
  onNavigateTutorial?: () => void;
  loginNotice?: LoginAlertNotice | null;
  onDismissNotice?: () => void;
}

export const SessionModeSelectionView: React.FC<SessionModeSelectionViewProps> = ({
  user,
  company,
  onSelectMode,
  onNavigateTutorial,
  loginNotice,
  onDismissNotice,
}) => {
  // Auto-dismiss the login alert toast after 5 seconds
  useEffect(() => {
    if (!loginNotice) return;
    const timer = setTimeout(() => {
      onDismissNotice?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [loginNotice, onDismissNotice]);

  return (
    <div className="min-h-screen bg-[#070e1c] text-white flex flex-col justify-center items-center px-4 py-12 antialiased font-sans select-none">
      <div className="max-w-5xl w-full space-y-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Main Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to SHEQ Street
          </h1>
        </div>

        {/* Tutorial Centre Banner Card (Matches Screenshot 1) */}
        <div className="bg-[#0e1b33] border border-slate-700/70 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base">
                Tutorial Centre
              </div>
              <div className="text-xs text-slate-400">
                Step-by-step video guides to help you get started.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateTutorial}
            className="px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600/80 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open</span>
            <span>→</span>
          </button>
        </div>


        {/* Subtitle */}
        <div className="text-center">
          <p className="text-sm text-slate-300 font-medium">
            Choose how you'd like to use the platform for this session.
          </p>
        </div>

        {/* Warning Alert Box (Matches Screenshot) */}
        <div className="bg-[#11192e] border border-amber-500/40 rounded-xl p-3.5 sm:p-4 text-xs max-w-3xl mx-auto flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
            <strong className="text-amber-300 font-bold">Company owner?</strong> Use the{' '}
            <strong className="text-white font-semibold">Management System App</strong> card for your
            own companies — it gives full owner access including Billing & Plan. Consultant / Auditor
            modes are only for external access to <em>other</em> companies.
          </p>
        </div>

        {/* 3 Session Mode Cards (Matches Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 max-w-5xl mx-auto">
          {/* CARD 1: Management System App (Primary - Navigates to Dashboard) */}
          <div
            onClick={() => onSelectMode('management')}
            className="bg-[#0b172c] hover:bg-[#0e1d38] border-2 border-blue-600/80 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xl hover:shadow-blue-900/30 hover:scale-[1.01] relative group"
          >
            <div>
              {/* Blue Shield Icon */}
              <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-4 shadow-inner">
                <Shield className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                Management System App
              </h2>
              <div className="text-xs font-semibold text-sky-400 mt-1">
                Run your own QMS / IMS
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                Full SHEQ Street platform with all modules, AI document creation, NCRs, audits, and
                more.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Full QMS module suite (Documents, NCRs, Audits, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>AI-powered document creation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Supplier & HR management</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Customer satisfaction surveys</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Enter Management App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CARD 2: Consultant */}
          <div
            onClick={() => onSelectMode('consultant')}
            className="bg-[#0b172c] hover:bg-[#0e1d38] border border-teal-600/50 hover:border-teal-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-teal-900/20 hover:scale-[1.01] relative group"
          >
            <div>
              {/* Green User Icon + FREE Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-teal-600/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shadow-inner">
                  <UserCheck className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  FREE
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">Consultant</h2>
              <div className="text-xs font-semibold text-teal-400 mt-1">
                Full edit access for clients
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                Manage multiple client QMS systems with full edit privileges on behalf of your
                clients.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Manage multiple client companies</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Full QMS edit access per client</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>Switch between clients instantly</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
              <span>Enter Consultant Mode</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CARD 3: External Auditor */}
          <div
            onClick={() => onSelectMode('auditor')}
            className="bg-[#0b172c] hover:bg-[#0e1d38] border border-amber-600/50 hover:border-amber-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-amber-900/20 hover:scale-[1.01] relative group"
          >
            <div>
              {/* Amber Eye Icon + FREE Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
                  <Eye className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  FREE
                </span>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">External Auditor</h2>
              <div className="text-xs font-semibold text-amber-400 mt-1">
                View-only access for audits
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                View client QMS systems in read-only mode. Perfect for external audit reviews.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>View multiple audit clients</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Strict view-only access</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Review documents & reports</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>Enter Auditor View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* User Identity Footer */}
        <div className="text-center pt-2 text-xs text-slate-400">
          Signed in as <strong className="text-white">{user.name}</strong> ({user.email}) for organization{' '}
          <strong className="text-blue-400">{company.name}</strong>.
        </div>
      </div>

      {/* Floating Login Notification Toast (Doesn't affect Image 1 layout) */}
      {loginNotice && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#0f1d38]/95 border border-blue-500/50 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
            {loginNotice.status === 'sending' ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{loginNotice.status === 'sending' ? 'Sending Login Alert...' : 'Sign-In Alert Sent'}</span>
                {loginNotice.status === 'sent' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </span>
              {onDismissNotice && (
                <button
                  type="button"
                  onClick={onDismissNotice}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-slate-300 text-[11px] mt-1 leading-snug">
              Confirmation message dispatched to{' '}
              <strong className="text-sky-300 font-mono">{loginNotice.email}</strong>
            </p>
            {loginNotice.previewUrl && (
              <a
                href={loginNotice.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold mt-2 underline cursor-pointer"
              >
                <span>View Dispatched Email</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
