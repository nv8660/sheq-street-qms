import React, { useState } from 'react';
import {
  LayoutGrid,
  Folder,
  AlertTriangle,
  Target,
  Gauge,
  Truck,
  Users,
  Smile,
  ClipboardCheck,
  Calendar,
  Workflow,
  GraduationCap,
  CreditCard,
  Settings,
  Building2,
  ChevronDown,
  LogOut,
  Building,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { NavigationTab, Company, AuthUser } from '../types';
import { AddCompanyModal } from './AddCompanyModal';
import { getCompanyPrefix } from '../utils/companyUtils';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onTabChange?: (tab: NavigationTab) => void;
  company?: Company;
  companies?: Company[];
  currentCompany?: Company;
  onCompanyChange?: (company: Company) => void;
  onAddCompany?: (newCompany: Company) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  user?: AuthUser | null;
  onLogout?: () => void;
  onSwitchMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  company,
  companies = [],
  currentCompany,
  onCompanyChange,
  onAddCompany,
  mobileOpen = false,
  setMobileOpen,
  user,
  onLogout,
  onSwitchMode,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  const activeCompany: Company = company || currentCompany || {
    id: 'nk',
    name: 'nk',
    email: 'nk002@gmail.com',
    phone: '1234970099',
    plan: 'TRIAL',
    daysRemaining: 13,
  };

  const companyList: Company[] = React.useMemo(() => {
    const list = [...companies];
    if (!list.some((c) => c.id === activeCompany.id || c.name === activeCompany.name)) {
      list.unshift(activeCompany);
    }
    return list;
  }, [companies, activeCompany]);

  const handleSelectTab = (tab: NavigationTab) => {
    onSelectTab?.(tab);
    onTabChange?.(tab);
    setMobileOpen?.(false);
  };

  const qmsModules: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'document-control', label: 'Document Control', icon: Folder },
    { id: 'ncr-management', label: 'NCR Management', icon: AlertTriangle },
    { id: 'policy-objectives', label: 'Policy, Objectives & CO...', icon: Target },
    { id: 'calibration-control', label: 'Calibration Control', icon: Gauge },
    { id: 'supplier-management', label: 'Supplier Management', icon: Truck },
    { id: 'hr-management', label: 'HR Management', icon: Users },
    { id: 'customer-satisfaction', label: 'Customer Satisfaction', icon: Smile },
    { id: 'audit-management', label: 'Audit Management', icon: ClipboardCheck },
    { id: 'management-review', label: 'Management Review', icon: Calendar },
    { id: 'process-control', label: 'Process Control', icon: Workflow },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c1527] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-[#15233e] md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header with Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#14223c]">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => handleSelectTab('dashboard')}
          >
            {/* SHEQ Street Logo Emblem */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shadow-md p-1">
              <svg viewBox="0 0 32 32" className="w-full h-full text-white" fill="none">
                <path
                  d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8"
                  stroke="#ea580c"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">SHEQ Street</span>
          </div>

          <button
            onClick={() => setMobileOpen?.(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Selector */}
        <div className="px-3 pt-3 pb-1 relative">
          <div
            onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
            className="bg-[#142037] hover:bg-[#182643] border border-[#1e2f50] rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 tracking-wider">
                {getCompanyPrefix(activeCompany.name)}
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[11px] text-slate-400 font-medium leading-none">Company</span>
                <span className="text-sm font-semibold text-white mt-1 leading-none truncate max-w-[130px]">
                  {activeCompany.name}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Company dropdown menu */}
          {companyDropdownOpen && (
            <div className="absolute left-3 right-3 top-14 mt-1 bg-[#101b30] border border-[#1e2f50] rounded-xl shadow-xl py-1 z-30">
              <div className="px-3 py-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Workspaces
              </div>
              {companyList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onCompanyChange?.(c);
                    setCompanyDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer font-medium ${
                    activeCompany.name === c.name || activeCompany.id === c.id
                      ? 'bg-blue-600/20 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                    {c.plan || 'Active'}
                  </span>
                </div>
              ))}
              <div className="border-t border-[#1e2f50] mt-1 pt-1">
                <div
                  onClick={() => {
                    setCompanyDropdownOpen(false);
                    setShowAddCompanyModal(true);
                  }}
                  className="px-3 py-2 text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800/40 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Company Details</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-800">
          {/* GENERAL */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              GENERAL
            </div>
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#f97316] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-5 h-5 flex-shrink-0" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* QMS MODULES */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              QMS MODULES
            </div>
            <div className="space-y-0.5">
              {qmsModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeTab === module.id;
                return (
                  <button
                    key={module.id}
                    onClick={() => handleSelectTab(module.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#f97316] text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{module.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESOURCES */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              RESOURCES
            </div>
            <button
              onClick={() => handleSelectTab('tutorial-centre')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                activeTab === 'tutorial-centre'
                  ? 'bg-[#f97316] text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <GraduationCap className="w-4 h-4 flex-shrink-0" />
              <span>Tutorial Centre</span>
            </button>
          </div>

          {/* ACCOUNT */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ACCOUNT
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectTab('billing-plan')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  activeTab === 'billing-plan'
                    ? 'bg-[#f97316] text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span>Billing & Plan</span>
              </button>

              <button
                onClick={() => handleSelectTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#f97316] text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Footer & Popover */}
        <div className="p-3 border-t border-[#14223c] relative">
          <div
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#1d4ed8] text-white font-semibold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-white truncate leading-snug">
                {user?.name || 'NAVEEN .V'}
              </span>
              <span className="text-xs text-slate-400 truncate leading-snug">
                {user?.email || 'nv8660970099@gmail.com'}
              </span>
            </div>
          </div>

          {/* Profile Menu matching profile.jpeg */}
          {profileMenuOpen && (
            <div className="absolute left-3 bottom-16 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={() => {
                  handleSelectTab('profile');
                  setProfileMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-slate-50 transition-colors text-slate-700 font-medium text-left cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-600" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  handleSelectTab('settings');
                  setProfileMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-slate-50 transition-colors text-slate-700 font-medium text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setCompanyDropdownOpen(true);
                  setProfileMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-slate-50 transition-colors text-blue-600 font-medium text-left cursor-pointer"
              >
                <Building className="w-4 h-4 text-blue-600" />
                <span>Switch Workspace</span>
              </button>

              {onSwitchMode && (
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onSwitchMode();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-slate-50 transition-colors text-slate-700 font-medium text-left cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 text-slate-600" />
                  <span>Switch Session Mode</span>
                </button>
              )}

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-red-50 transition-colors text-red-600 font-medium text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Add Company Modal Dialog */}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onAddCompany={(newComp) => {
          onAddCompany?.(newComp);
          onCompanyChange?.(newComp);
        }}
        defaultEmail={user?.email || activeCompany.email || 'nv8660970099@gmail.com'}
      />
    </>
  );
};
