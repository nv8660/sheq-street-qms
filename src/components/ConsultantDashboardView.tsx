import React from 'react';
import {
  UserCheck,
  GraduationCap,
  DoorOpen,
  ArrowLeft,
} from 'lucide-react';
import { AuthUser, Company } from '../types';

interface ConsultantDashboardViewProps {
  user: AuthUser;
  company: Company;
  onBackToModeSelection: () => void;
  onNavigateTutorial: () => void;
}

export const ConsultantDashboardView: React.FC<ConsultantDashboardViewProps> = ({
  user,
  company,
  onBackToModeSelection,
  onNavigateTutorial,
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-8 md:p-12 antialiased font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-2xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Consultant Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your client QMS systems
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

        {/* Tutorial Centre Banner Card (Matches Screenshot 2) */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] border border-[#86efac] flex items-center justify-center text-[#16a34a] flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                Tutorial Centre
              </div>
              <div className="text-xs text-slate-600">
                Step-by-step video guides to help you get started with client systems.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateTutorial}
            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Open Tutorial Centre</span>
          </button>
        </div>

        {/* Section Header: MY CLIENT LIST */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
            <span>MY CLIENT LIST</span>
            <span className="font-medium text-slate-400">0 clients</span>
          </div>

          {/* Empty State Card (Matches Screenshot 2) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center shadow-xs">
            {/* Door / Storefront Icon */}
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <DoorOpen className="w-6 h-6 text-slate-400" />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
              No clients yet
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
              You haven't been added as a consultant to any company. Ask a company admin to
              invite you via Settings &rarr; Team Management.
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
