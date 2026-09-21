import React from 'react';
import {
  Eye,
  AlertCircle,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { AuthUser, Company } from '../types';

interface AuditorDashboardViewProps {
  user: AuthUser;
  company: Company;
  onBackToModeSelection: () => void;
}

export const AuditorDashboardView: React.FC<AuditorDashboardViewProps> = ({
  user,
  company,
  onBackToModeSelection,
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-8 md:p-12 antialiased font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shadow-2xs">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Auditor Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Your Audit Clients
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToModeSelection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mode Selection</span>
          </button>
        </div>

        {/* View-only Access Alert Bar (Matches Screenshot 3) */}
        <div className="bg-[#fefce8] border border-[#fef08a] rounded-xl p-3 sm:p-3.5 flex items-center gap-2.5 text-xs text-[#854d0e] shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong className="font-bold text-[#713f12]">View-only access.</strong> As an
            external auditor you can review all QMS data but cannot make edits or generate
            documents.
          </span>
        </div>

        {/* Section Header: MY AUDIT CLIENTS */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
            <span>MY AUDIT CLIENTS</span>
            <span className="font-medium text-slate-400">0 clients</span>
          </div>

          {/* Empty State Card (Matches Screenshot 3) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center shadow-xs">
            {/* Document / File Icon */}
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
              No audit clients yet
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
              You haven't been added as an external auditor to any company. Ask a company admin
              to invite you via Settings &rarr; Team Management.
            </p>

            <button
              type="button"
              onClick={onBackToModeSelection}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Mode Selection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
