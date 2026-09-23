import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Database,
  AlertTriangle,
  Wrench,
  Truck,
  Users,
  Smile,
  ClipboardCheck,
  Calendar,
  Workflow,
  ArrowRight,
  Sparkles,
  Check,
  Shield,
  Target,
  Building,
  ChevronDown,
  MapPin,
  Globe,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { NavigationTab, Company } from '../types';
import { AddCompanyModal } from './AddCompanyModal';

interface DashboardViewProps {
  company: Company;
  companies?: Company[];
  ncrs?: import('../types').NCRItem[];
  auditRows?: import('../types').AuditProcessRow[];
  processes?: import('../types').ProcessControlItem[];
  onNavigate: (tab: NavigationTab) => void;
  onLoadDemoData: () => void;
  onAddCompany?: (newCompany: Company) => void;
  onCompanyChange?: (company: Company) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  companies = [],
  ncrs,
  auditRows,
  processes,
  onNavigate,
  onLoadDemoData,
  onAddCompany,
  onCompanyChange,
}) => {
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const openNCRsCount = ncrs ? ncrs.filter((n) => n.status !== 'CLOSED').length : 0;
  const processMapCount = processes ? processes.length : 1;

  const compPrefix = company?.name ? company.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() : 'NK';

  // Closest due NCR calculation
  const openNCRsWithDue = ncrs
    ? ncrs.filter((n) => n.status !== 'CLOSED' && n.daysLeft !== undefined).sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99))
    : [];
  const closestNCR = openNCRsWithDue[0];

  const handleDemoClick = () => {
    onLoadDemoData();
    setDemoDataLoaded(true);
    setTimeout(() => setDemoDataLoaded(false), 3000);
  };

  const isoScopes = company.isoScope && company.isoScope.length > 0 ? company.isoScope : ['ISO 9001:2015'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Fast Workspace Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-slate-500 pb-1 border-b border-slate-200/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 text-sm">{company.name}</span>
          <span className="px-2 py-0.5 rounded-full border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
            {company.plan || 'ACTIVE'}
          </span>
          {company.industry && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
              {company.industry}
            </span>
          )}
          {company.registrationNumber && (
            <span className="hidden md:inline-block font-mono text-slate-500 text-[11px]">
              • Reg: {company.registrationNumber}
            </span>
          )}
        </div>

        {/* Quick Multi-Company Workspace Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {companies.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[130px]">{company.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showWorkspaceMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                    Select Company Workspace
                  </div>
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {companies.map((c) => {
                      const isCurrent = c.id === company.id || c.name === company.name;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setShowWorkspaceMenu(false);
                            onCompanyChange?.(c);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div>{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{c.industry || 'General Industry'}</div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWorkspaceMenu(false);
                        setShowAddCompanyModal(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Register New Company</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddCompanyModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Main Header & Company Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 mt-0.5">
              {company.name ? company.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-bold">
                  Active QMS Profile
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{company.industry || 'Manufacturing & Engineering'}</span>
                {company.registrationNumber && (
                  <span>• CIPC: <span className="font-mono text-slate-700 font-semibold">{company.registrationNumber}</span></span>
                )}
                {company.employeesCount && (
                  <span>• Size: {company.employeesCount}</span>
                )}
              </p>

              {/* Physical Address & Contact */}
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2.5 flex-wrap">
                {company.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.address}</span>
                  </span>
                )}
                {company.email && (
                  <span className="flex items-center gap-1 font-mono text-slate-600">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button
              onClick={() => onNavigate('profile')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Company Profile Settings
            </button>
            <button
              onClick={handleDemoClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {demoDataLoaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Demo Data Ready</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-slate-600" />
                  <span>Load Demo Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ISO Standards in Scope Badges Row */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600 mr-1">Compliance Scope:</span>
            {isoScopes.map((scope) => (
              <span
                key={scope}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>{scope}</span>
              </span>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            System Clock: <strong className="text-slate-600 font-mono">Wednesday, 16 September 2026</strong>
          </div>
        </div>
      </div>


      {/* License Status Banner (Trial or Active Paid) */}
      {company.plan && company.plan !== 'TRIAL' && company.plan !== 'Trial' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-8 h-8 rounded-full border border-emerald-300 flex items-center justify-center text-emerald-600 bg-emerald-100 flex-shrink-0 mt-0.5 sm:mt-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-950 text-base leading-snug">
                Active License — {company.plan} Plan
              </div>
              <div className="text-sm text-emerald-800/90 leading-snug">
                {company.daysRemaining || 365} days remaining — all 8 QMS modules fully unlocked.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('billing-plan')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-xs transition-colors self-start sm:self-auto flex-shrink-0 cursor-pointer"
          >
            Manage Subscription
          </button>
        </div>
      ) : (
        <div className="bg-[#fffbeb] border border-[#fef08a] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-8 h-8 rounded-full border border-amber-300 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-base leading-snug">
                Free Trial Active
              </div>
              <div className="text-sm text-amber-800/90 leading-snug">
                {company.daysRemaining || 13} days remaining — upgrade to keep full access.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('billing-plan')}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-xs transition-colors self-start sm:self-auto flex-shrink-0 cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* AUDIT READINESS Gradient Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c3958] via-[#0e4870] to-[#125580] text-white p-6 sm:p-7 shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] mb-1.5">
              AUDIT READINESS
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-white tracking-tight">
              Looking great! Nearly audit-ready.
            </h2>
          </div>

          <div className="flex items-baseline">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
              85
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#67e8f9] ml-1">
              %
            </span>
          </div>
        </div>

        {/* Progress Bar matching screenshot */}
        <div className="mt-6 relative z-10">
          <div className="w-full bg-[#072439] rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#22c55e] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: '85%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-300/80 font-mono mt-2">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
        <span className="text-slate-800 font-medium text-sm">
          All setup tasks complete — your QMS is well configured!
        </span>
      </div>

      {/* LIVE MODULE SUMMARIES */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          LIVE MODULE SUMMARIES
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. NCR Management */}
          <div
            onClick={() => onNavigate('ncr-management')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">NCR Management</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{openNCRsCount}</span>
              <span className="text-sm font-medium text-slate-600">Open NCRs</span>
            </div>

            <div className="text-xs text-slate-500 mt-2">
              {closestNCR
                ? `Closest due: ${closestNCR.daysLeft} days — ${closestNCR.issuedTo || 'Action Pending'}`
                : openNCRsCount === 0
                ? 'No open non-conformances — 100% closed'
                : 'All corrective actions on schedule'}
            </div>
          </div>

          {/* 2. Calibration Control */}
          <div
            onClick={() => onNavigate('calibration-control')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Calibration Control</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 py-1">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>No instruments due for calibration</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              All register instruments within certified tolerance
            </div>
          </div>

          {/* 3. Supplier Management */}
          <div
            onClick={() => onNavigate('supplier-management')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Supplier Management</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">12</span>
              <span className="text-sm font-medium text-slate-600">Approved Suppliers</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              1 Pending Evaluation — Next supplier audit in 45 days
            </div>
          </div>

          {/* 4. HR Management */}
          <div
            onClick={() => onNavigate('hr-management')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">HR Management</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">0</span>
              <span className="text-sm font-medium text-slate-600">Total Employees</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              1 Department (marketing) • 1 Position (sales)
            </div>
          </div>

          {/* 5. Customer Satisfaction */}
          <div
            onClick={() => onNavigate('customer-satisfaction')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Smile className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Customer Satisfaction</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">100%</span>
              <span className="text-sm font-medium text-slate-600">Satisfaction Rating</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              1 Completed (abhijeet) • 1 Pending (tech)
            </div>
          </div>

          {/* 6. Audit Management */}
          <div
            onClick={() => onNavigate('audit-management')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Audit Management</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">70%</span>
              <span className="text-sm font-medium text-slate-600">Overall Score</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Target: 80% • Document #: {compPrefix}-DC-012
            </div>
          </div>

          {/* 7. Management Review */}
          <div
            onClick={() => onNavigate('management-review')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Management Review</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">1</span>
              <span className="text-sm font-medium text-slate-600">Planned Review</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              ISO 9001:2015 Review Meeting scheduled for 17-Sept-2026
            </div>
          </div>

          {/* 8. Objectives & Targets (After Management Review) */}
          <div
            onClick={() => onNavigate('policy-objectives')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">Objectives & Targets</span>
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate pr-2">
                    Hazardous Material Handling Training
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium flex-shrink-0">
                    Not Started
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate pr-2">
                    Customer Satisfaction Survey Score
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium flex-shrink-0">
                    Not Started
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate pr-2">
                    PPE Usage Compliance
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium flex-shrink-0">
                    Not Started
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate pr-2">
                    Machine Preventive Maintenance Com...
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium flex-shrink-0">
                    Not Started
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium pt-0.5">
                  +6 more
                </div>
              </div>
            </div>
          </div>

          {/* 9. Process Control */}
          <div
            onClick={() => onNavigate('process-control')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Workflow className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Process Control</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                View <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{processMapCount}</span>
              <span className="text-sm font-medium text-slate-600">Process Map{processMapCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="text-xs text-slate-500 mt-2">
              Process: recycle (111) — Flowchart active, No QCP
            </div>
          </div>
        </div>
      </div>

      {/* Add Company Modal Dialog */}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onAddCompany={(newComp) => {
          onAddCompany?.(newComp);
          onCompanyChange?.(newComp);
        }}
        defaultEmail={company.email || 'nv8660970099@gmail.com'}
      />
    </div>
  );
};
