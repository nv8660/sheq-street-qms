import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  Save,
  Check,
  Plus,
  Mail,
  Phone,
  MapPin,
  Users,
  Eye,
  Crown,
  Trash2,
  AlertTriangle,
  Clock,
  Infinity,
  UserCheck,
  Briefcase,
  Globe,
  ChevronDown,
  X,
  LayoutList,
} from 'lucide-react';
import { Company, TeamMemberItem } from '../../types';
import { AddCompanyModal } from '../AddCompanyModal';
import { initialTeamMembers } from '../../data/mockData';

interface SettingsViewProps {
  company: Company;
  companies?: Company[];
  onUpdateCompany: (updated: Partial<Company>) => void;
  onAddCompany?: (newCompany: Company) => void;
  onCompanyChange?: (company: Company) => void;
  onDeleteCompany?: (companyId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  companies = [],
  onUpdateCompany,
  onAddCompany,
  onCompanyChange,
  onDeleteCompany,
}) => {
  // Settings view sub-tab: 'profile' | 'team' (default 'profile' first)
  const [settingsTab, setSettingsTab] = useState<'profile' | 'team'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Company Profile form state
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry || 'steel');
  const [regNumber, setRegNumber] = useState(company.registrationNumber || '2024/991024/07');
  const [companyEmail, setCompanyEmail] = useState(company.email || 'nv8660970099@gmail.com');
  const [companyPhone, setCompanyPhone] = useState(company.phone || '+27 11 948 2000');
  const [companyAddress, setCompanyAddress] = useState(company.address || 'no84 guindy workspace');
  const [companyWebsite, setCompanyWebsite] = useState(company.website || 'https://sheqstreet.co.za');

  // 3. Company Overview State (Matches Pinned Image)
  const [companyDescription, setCompanyDescription] = useState(() => {
    try {
      const saved = localStorage.getItem('sheq_company_description');
      if (saved) return saved;
    } catch {}
    return company.companyDescription || '';
  });

  const [mainProductsServices, setMainProductsServices] = useState(() => {
    try {
      const saved = localStorage.getItem('sheq_main_products_services');
      if (saved) return saved;
    } catch {}
    return company.mainProductsAndServices || '';
  });

  const [employeesCount, setEmployeesCount] = useState(() => {
    try {
      const saved = localStorage.getItem('sheq_employees_count');
      if (saved) return saved;
    } catch {}
    return company.employeesCount || '11-50 employees';
  });

  React.useEffect(() => {
    setName(company.name);
    setIndustry(company.industry || 'steel');
    setRegNumber(company.registrationNumber || '');
    setCompanyEmail(company.email || 'nv8660970099@gmail.com');
    setCompanyPhone(company.phone || '+27 11 948 2000');
    setCompanyAddress(company.address || 'no84 guindy workspace');
    setCompanyWebsite(company.website || '');
    if (company.employeesCount) setEmployeesCount(company.employeesCount);
    if (company.companyDescription) setCompanyDescription(company.companyDescription);
    if (company.mainProductsAndServices) setMainProductsServices(company.mainProductsAndServices);
  }, [company]);

  // 1. Company Leadership State (Matches Screenshot 1)
  const [topExecutiveTitle, setTopExecutiveTitle] = useState(() => {
    try {
      const saved = localStorage.getItem('sheq_top_executive_title');
      if (saved) return saved;
    } catch {}
    return company.topExecutiveTitle || 'Managing Director';
  });

  // 2. Key Functional Roles State (Matches Screenshot 1 & 2)
  const [functionalRoles, setFunctionalRoles] = useState<{
    purchasingResponsible: string[];
    supplierManagementResponsible: string[];
    hrManager: string[];
    trainingCoordinator: string[];
    productReleaseApprover: string[];
    salesManager: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem('sheq_company_functional_roles');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      purchasingResponsible: company.keyFunctionalRoles?.purchasingResponsible || ['Procurement Manager'],
      supplierManagementResponsible: company.keyFunctionalRoles?.supplierManagementResponsible || ['Supply Chain Manager'],
      hrManager: company.keyFunctionalRoles?.hrManager || ['Human Resources Manager'],
      trainingCoordinator: company.keyFunctionalRoles?.trainingCoordinator || ['Training & Development Officer'],
      productReleaseApprover: company.keyFunctionalRoles?.productReleaseApprover || ['Quality Manager'],
      salesManager: company.keyFunctionalRoles?.salesManager || ['Sales & Marketing Manager'],
    };
  });

  // Website & Social Media State (Matches Screenshot 3)
  const [socialLinks, setSocialLinks] = useState<{
    website: string;
    linkedIn: string;
    facebook: string;
    instagram: string;
    twitter: string;
    otherLinks: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('sheq_company_social_links');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      website: company.website || 'https://www.company.co.za',
      linkedIn: company.socialMedia?.linkedIn || 'https://linkedin.com/company/sheq-street',
      facebook: company.socialMedia?.facebook || 'https://facebook.com/sheqstreet',
      instagram: company.socialMedia?.instagram || 'https://instagram.com/sheqstreet',
      twitter: company.socialMedia?.twitter || 'https://x.com/sheqstreet',
      otherLinks:
        company.socialMedia?.otherLinks ||
        'https://vimeo.com/sheqstreet\nhttps://pinterest.com/sheqstreet\nhttps://youtube.com/@sheqstreet',
    };
  });

  const handleAddRoleInput = (roleKey: keyof typeof functionalRoles) => {
    setFunctionalRoles((prev) => ({
      ...prev,
      [roleKey]: [...prev[roleKey], ''],
    }));
  };

  const handleUpdateRoleInput = (
    roleKey: keyof typeof functionalRoles,
    index: number,
    val: string
  ) => {
    setFunctionalRoles((prev) => {
      const updated = [...prev[roleKey]];
      updated[index] = val;
      return { ...prev, [roleKey]: updated };
    });
  };

  const handleRemoveRoleInput = (roleKey: keyof typeof functionalRoles, index: number) => {
    setFunctionalRoles((prev) => {
      if (prev[roleKey].length <= 1) return prev;
      const updated = prev[roleKey].filter((_, i) => i !== index);
      return { ...prev, [roleKey]: updated };
    });
  };

  const [standards, setStandards] = useState({
    iso9001: true,
    iso14001: false,
    iso45001: false,
  });

  // Add new company modal state
  const [showAddCompanyModal, setShowAddCompanyModal] = useState<boolean>(false);
  const [companyAddedNotice, setCompanyAddedNotice] = useState<string | null>(null);

  // ========================================================
  // Team Management State (Matches Screenshots 1 & 2)
  // ========================================================
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(() => {
    try {
      const savedMembers = localStorage.getItem('sheq_team_members');
      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: TeamMemberItem) => {
            if (m.email.toLowerCase().includes('nv8660970099@gmail.com') || m.role === 'Owner') {
              return { ...m, role: 'Owner', expiry: 'Permanent', isOwner: true, status: 'ACTIVE' };
            }
            return m;
          });
        }
      }
    } catch {}
    return initialTeamMembers;
  });

  const [memberEmail, setMemberEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Consultant' | 'Standard User' | 'External Auditor'>('Consultant');
  const [auditorDuration, setAuditorDuration] = useState<number | 'custom'>(30);
  const [customDaysInput, setCustomDaysInput] = useState<string>('45');
  const [teamNotice, setTeamNotice] = useState<string | null>(null);
  const [showStepDownModal, setShowStepDownModal] = useState(false);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState<string>('');

  const internalUsersCount = teamMembers.filter((m) => m.role !== 'External Auditor').length || 1;
  const externalAuditorsCount = teamMembers.filter((m) => m.role === 'External Auditor').length || 0;

  const handleStepDownConfirm = () => {
    if (!selectedNewOwnerId) {
      alert('Please select a team member to transfer ownership to.');
      return;
    }
    const targetMember = teamMembers.find((m) => m.id === selectedNewOwnerId);
    if (!targetMember) return;

    const updated = teamMembers.map((m) => {
      if (m.id === selectedNewOwnerId) {
        return { ...m, role: 'Owner' as const, isOwner: true, expiry: 'Permanent' };
      }
      if (m.isOwner || m.role === 'Owner') {
        return { ...m, role: 'Consultant' as const, isOwner: false };
      }
      return m;
    });

    setTeamMembers(updated);
    try {
      localStorage.setItem('sheq_team_members', JSON.stringify(updated));
    } catch {}

    setShowStepDownModal(false);
    setTeamNotice(`Ownership of QMS has been transferred to ${targetMember.email}.`);
    setTimeout(() => setTeamNotice(null), 4000);
  };

  // Sync team members to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('sheq_team_members', JSON.stringify(teamMembers));
    } catch {}
  }, [teamMembers]);

  // Expiry date calculator
  const calculateExpiryDate = (days: number): string => {
    const baseDate = new Date(2026, 8, 21);
    const exp = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    const day = exp.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[exp.getMonth()]} ${exp.getFullYear()}`;
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !memberEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    let calculatedExpiry = 'Permanent';
    let durationStr = 'Permanent';

    if (selectedRole === 'External Auditor') {
      const days = auditorDuration === 'custom' ? parseInt(customDaysInput, 10) || 30 : auditorDuration;
      calculatedExpiry = calculateExpiryDate(days);
      durationStr = `${days} days`;
    }

    const newMember: TeamMemberItem = {
      id: `tm-${Date.now()}`,
      name: memberEmail.split('@')[0],
      email: memberEmail.trim(),
      role: selectedRole,
      status: 'ACTIVE',
      dateAdded: '21-Sep-2026',
      expiry: calculatedExpiry,
      duration: durationStr,
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    try {
      localStorage.setItem('sheq_team_members', JSON.stringify(updated));
    } catch {}

    setMemberEmail('');
    setTeamNotice(`Invitation sent to ${newMember.email} as ${selectedRole}!`);
    setTimeout(() => setTeamNotice(null), 4000);
  };

  const handleRemoveMember = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    try {
      localStorage.setItem('sheq_team_members', JSON.stringify(updated));
    } catch {}
    setTeamNotice('Team member access revoked.');
    setTimeout(() => setTeamNotice(null), 3000);
  };

  const handleSaveCompany = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateCompany({
      name,
      industry,
      registrationNumber: regNumber,
      email: companyEmail,
      phone: companyPhone,
      address: companyAddress,
      employeesCount,
      companyDescription,
      mainProductsAndServices: mainProductsServices,
      website: socialLinks.website,
      topExecutiveTitle,
      keyFunctionalRoles: functionalRoles,
      socialMedia: socialLinks,
    });
    try {
      localStorage.setItem('sheq_top_executive_title', topExecutiveTitle);
      localStorage.setItem('sheq_company_functional_roles', JSON.stringify(functionalRoles));
      localStorage.setItem('sheq_company_social_links', JSON.stringify(socialLinks));
      localStorage.setItem('sheq_company_description', companyDescription);
      localStorage.setItem('sheq_main_products_services', mainProductsServices);
      localStorage.setItem('sheq_employees_count', employeesCount);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddNewCompany = (newComp: Company) => {
    onAddCompany?.(newComp);
    onUpdateCompany(newComp);
    setName(newComp.name);
    setIndustry(newComp.industry || 'steel');
    setRegNumber(newComp.registrationNumber || '');
    setCompanyEmail(newComp.email);
    setCompanyPhone(newComp.phone);
    setCompanyAddress(newComp.address || 'no84 guindy workspace');
    setCompanyWebsite(newComp.website || '');
    if (newComp.employeesCount) setEmployeesCount(newComp.employeesCount);
    if (newComp.companyDescription) setCompanyDescription(newComp.companyDescription);
    if (newComp.mainProductsAndServices) setMainProductsServices(newComp.mainProductsAndServices);
    if (newComp.topExecutiveTitle) setTopExecutiveTitle(newComp.topExecutiveTitle);
    if (newComp.keyFunctionalRoles) setFunctionalRoles(newComp.keyFunctionalRoles as any);
    if (newComp.socialMedia) {
      setSocialLinks({
        website: newComp.website || '',
        linkedIn: newComp.socialMedia.linkedIn || '',
        facebook: newComp.socialMedia.facebook || '',
        instagram: newComp.socialMedia.instagram || '',
        twitter: newComp.socialMedia.twitter || '',
        otherLinks: newComp.socialMedia.otherLinks || '',
      });
    }
    setCompanyAddedNotice(`Successfully registered and switched to ${newComp.name}!`);

    setTimeout(() => {
      setCompanyAddedNotice(null);
    }, 4000);
  };

  const handleConfirmDeleteProfile = () => {
    setShowDeleteConfirm(false);
    const companyToDeleteName = company.name;
    if (onDeleteCompany) {
      onDeleteCompany(company.id);
    } else {
      setName('');
      setCompanyEmail('');
      setIndustry('');
      setCompanyAddress('');
      setCompanyDescription('');
      setMainProductsServices('');
      onUpdateCompany({
        name: '',
        email: '',
        industry: '',
        address: '',
        companyDescription: '',
        mainProductsAndServices: '',
      });
    }
    setDeleteNotice(`Company profile "${companyToDeleteName}" has been deleted.`);
    setTimeout(() => setDeleteNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200 text-slate-800">
      {/* Settings Top Header matching Pinned Image */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your company profile and team access
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <span className="text-xs font-bold text-slate-600">{company.name}</span>
            <span className="px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider uppercase">
              {company.plan || 'TRIAL'}
            </span>
          </div>
        </div>

        {/* Tab Switcher Pill Container matching Pinned Image */}
        <div className="inline-flex items-center bg-[#f1f4f8] p-1 rounded-xl border border-slate-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setSettingsTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              settingsTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 border border-transparent'
            }`}
          >
            <Building className="w-4 h-4 text-slate-800" />
            <span>Company Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('team')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              settingsTab === 'team'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Team Management</span>
          </button>
        </div>
      </div>

      {/* Notification Toasts */}
      {teamNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{teamNotice}</span>
        </div>
      )}

      {companyAddedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{companyAddedNotice}</span>
        </div>
      )}

      {deleteNotice && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{deleteNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: TEAM MANAGEMENT (Matches Pinned Image & Role Cards) */}
      {/* ======================================================== */}
      {settingsTab === 'team' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Row (Matches Pinned Image) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Team Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invite team members and manage their access to this company's QMS.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStepDownModal(true)}
              className="px-4 py-2 bg-white hover:bg-red-50/50 text-[#b91c1c] border border-red-200 hover:border-red-300 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
            >
              <Crown className="w-4 h-4 text-red-500" />
              <span>Step Down as Owner</span>
            </button>
          </div>

          {/* Usage Metrics: Internal Users & External Auditors (Matches Pinned Image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Internal Users */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Users className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Internal Users</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {internalUsersCount} / 5
                </div>
              </div>
            </div>

            {/* External Auditors */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Eye className="w-5 h-5 text-[#ea580c]" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">External Auditors</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {externalAuditorsCount} / 2
                </div>
              </div>
            </div>
          </div>

          {/* 3 Role Description Cards (Exact match to Screenshot 1 & 2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role 1: Consultant */}
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#2563eb] font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Consultant</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Full access — can manage the entire QMS on behalf of the company.
              </p>
            </div>

            {/* Role 2: Standard User */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#16a34a] font-bold text-sm">
                <UserCheck className="w-4 h-4" />
                <span>Standard User</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Normal access — can view and edit data but has limited admin capabilities.
              </p>
            </div>

            {/* Role 3: External Auditor */}
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#d97706] font-bold text-sm">
                <Eye className="w-4 h-4" />
                <span>External Auditor</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                View-only — can read all modules and reports. Cannot edit, delete, or generate
                documents.
              </p>
            </div>
          </div>

          {/* Add Team Member Card (Exact match to Screenshot 1 & 2) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add Team Member</h2>

            <form onSubmit={handleAddTeamMember} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@company.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 font-normal outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Assign Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Assign Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('Consultant')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      selectedRole === 'Consultant'
                        ? 'bg-[#152c4a] text-white border-[#152c4a] shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Consultant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('Standard User')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      selectedRole === 'Standard User'
                        ? 'bg-[#152c4a] text-white border-[#152c4a] shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Standard User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('External Auditor')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      selectedRole === 'External Auditor'
                        ? 'bg-[#152c4a] text-white border-[#152c4a] shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>External Auditor</span>
                  </button>
                </div>
              </div>

              {/* Conditional Box: Consultant (Screenshot 1) */}
              {selectedRole === 'Consultant' && (
                <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-xs text-[#1d4ed8] font-medium flex items-center gap-2 animate-in fade-in duration-150">
                  <Infinity className="w-4 h-4 text-[#2563eb] flex-shrink-0" />
                  <span>Consultant access is permanent until manually revoked.</span>
                </div>
              )}

              {/* Conditional Box: Standard User */}
              {selectedRole === 'Standard User' && (
                <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-xs text-[#15803d] font-medium flex items-center gap-2 animate-in fade-in duration-150">
                  <Infinity className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                  <span>Standard user access is permanent until manually revoked.</span>
                </div>
              )}

              {/* Conditional Box: External Auditor (Screenshot 2) */}
              {selectedRole === 'External Auditor' && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                  {/* Access Duration Pills */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Access Duration</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[14, 30, 60, 90].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setAuditorDuration(days)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                            auditorDuration === days
                              ? 'bg-[#152c4a] text-white border-[#152c4a] shadow-2xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {days} days
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setAuditorDuration('custom')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          auditorDuration === 'custom'
                            ? 'bg-[#152c4a] text-white border-[#152c4a] shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        Custom days
                      </button>

                      {auditorDuration === 'custom' && (
                        <div className="flex items-center gap-1.5 ml-1 animate-in fade-in">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={customDaysInput}
                            onChange={(e) => setCustomDaysInput(e.target.value)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="days"
                          />
                          <span className="text-xs text-slate-500">days</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amber Warning Banner (Exact text & styling from Screenshot 2) */}
                  <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Access expires:{' '}
                      <strong className="font-bold">
                        {calculateExpiryDate(
                          auditorDuration === 'custom'
                            ? parseInt(customDaysInput, 10) || 30
                            : auditorDuration
                        )}
                      </strong>{' '}
                      — view-only enforced for entire duration.
                    </span>
                  </div>
                </div>
              )}

              {/* Send Invite Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#788ca2] hover:bg-[#64768b] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </button>
              </div>
            </form>
          </div>

          {/* Team Members Table Card (Exact match to Screenshot 1 & 2) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Team Members</h3>
              <span className="text-xs text-slate-500 font-medium">
                {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#152c4a] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Email</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Expiry</th>
                    <th className="py-3 px-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {teamMembers.map((m) => {
                    const isOwner =
                      m.role === 'Owner' ||
                      m.email.toLowerCase().includes('nv8660970099@gmail.com') ||
                      m.isOwner;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Email */}
                        <td className="py-3.5 px-5 font-mono text-slate-900 font-medium">
                          {m.email}{' '}
                          {isOwner && (
                            <span className="text-slate-400 font-sans font-normal text-[11px]">
                              (you)
                            </span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-5">
                          {isOwner ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] inline-flex items-center gap-1">
                              <Crown className="w-3 h-3 text-red-500" />
                              Owner
                            </span>
                          ) : m.role === 'Consultant' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#2563eb]" />
                              Consultant
                            </span>
                          ) : m.role === 'External Auditor' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fffbeb] text-[#d97706] border border-[#fde68a] inline-flex items-center gap-1">
                              <Eye className="w-3 h-3 text-[#d97706]" />
                              External Auditor
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-[#16a34a]" />
                              Standard User
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#15803d]">
                            {m.status === 'INVITED' ? 'Invited' : 'Active'}
                          </span>
                        </td>

                        {/* Expiry */}
                        <td className="py-3.5 px-5 font-medium text-slate-700">
                          {m.role === 'External Auditor' && m.expiry && m.expiry !== 'Permanent' ? (
                            <span>{m.expiry}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Infinity className="w-3.5 h-3.5 text-slate-400" />
                              Permanent
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5">
                          {isOwner ? (
                            <span className="text-red-600 font-bold inline-flex items-center gap-1 text-[11px]">
                              <Crown className="w-3.5 h-3.5 text-red-500" />
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-red-600 hover:text-red-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: COMPANY PROFILE                                   */}
      {/* ======================================================== */}
      {settingsTab === 'profile' && (
        <div className="space-y-6">
          {saved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          {/* Add New Company Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-blue-950">Add New Company Details</div>
                <div className="text-xs text-blue-800/80 mt-0.5">
                  Register a new subsidiary, division, or corporate client organization into your
                  SHEQ Street QMS.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCompanyModal(true)}
              className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Company</span>
            </button>
          </div>

          {/* Company Identity Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5">
              <Building className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Company Identity</h2>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration / CIPC Number
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Head Office Address
                  </label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Company Details</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* ======================================================== */}
          {/* WEBSITE & SOCIAL MEDIA (Directly after Company Identity) */}
          {/* ======================================================== */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Globe className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Website & Social Media</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Online presence links for your company profile
                </p>
              </div>
            </div>

            <div className="border-b border-slate-100 pt-1" />

            {/* Website (Full Width) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="https://www.company.co.za"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  LinkedIn
                </label>
                <div className="relative">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-[11px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-sans border border-slate-400/80 rounded-[3px] leading-none">
                    in
                  </span>
                  <input
                    type="url"
                    value={socialLinks.linkedIn}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedIn: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Facebook
                </label>
                <div className="relative">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-xs text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-serif leading-none">
                    f
                  </span>
                  <input
                    type="url"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Instagram
                </label>
                <div className="relative">
                  <svg
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <input
                    type="url"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* X (Twitter) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  X (Twitter)
                </label>
                <div className="relative">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <input
                    type="url"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://x.com/..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Other Links */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                Other Links
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Any other platforms (Vimeo, Pinterest, YouTube, TikTok, etc.) — one URL per line
              </p>
              <textarea
                rows={4}
                value={socialLinks.otherLinks}
                onChange={(e) => setSocialLinks({ ...socialLinks, otherLinks: e.target.value })}
                placeholder="https://vimeo.com/...&#10;https://pinterest.com/...&#10;https://youtube.com/..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* 1. COMPANY LEADERSHIP (Next after Website & Social Media) */}
          {/* ======================================================== */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Briefcase className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Company Leadership</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  The senior-most executive role — used in quality policies, management reviews and formal documents
                </p>
              </div>
            </div>

            <div className="border-b border-slate-100 pt-1" />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Top Executive Title
              </label>
              <div className="relative">
                <select
                  value={topExecutiveTitle}
                  onChange={(e) => setTopExecutiveTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-10"
                >
                  <option value="" disabled>Select title...</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="Chief Executive Officer (CEO)">Chief Executive Officer (CEO)</option>
                  <option value="General Manager">General Manager</option>
                  <option value="President">President</option>
                  <option value="Operations Director">Operations Director</option>
                  <option value="Owner / Principal">Owner / Principal</option>
                  <option value="Executive Director">Executive Director</option>
                  <option value="Plant Manager">Plant Manager</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. KEY FUNCTIONAL ROLES (Matches Screenshot 1 & 2)       */}
          {/* ======================================================== */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Users className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">2. Key Functional Roles</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Job titles only — people come and go, but job titles remain. Used by AI when generating procedures.
                </p>
              </div>
            </div>

            <div className="border-b border-slate-100 pt-1" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Column 1 */}
              <div className="space-y-5">
                {/* Purchasing Responsible */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Purchasing Responsible
                  </label>
                  <div className="space-y-2">
                    {functionalRoles.purchasingResponsible.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => handleUpdateRoleInput('purchasingResponsible', idx, e.target.value)}
                          placeholder="e.g. Procurement Manager"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {functionalRoles.purchasingResponsible.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleInput('purchasingResponsible', idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove role"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoleInput('purchasingResponsible')}
                    className="mt-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another</span>
                  </button>
                </div>

                {/* HR Manager */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    HR Manager
                  </label>
                  <div className="space-y-2">
                    {functionalRoles.hrManager.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => handleUpdateRoleInput('hrManager', idx, e.target.value)}
                          placeholder="e.g. Human Resources Manager"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {functionalRoles.hrManager.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleInput('hrManager', idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove role"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoleInput('hrManager')}
                    className="mt-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another</span>
                  </button>
                </div>

                {/* Product / Service Release Approver */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-0.5">
                    Product / Service Release Approver
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Who signs off on final product/service release
                  </p>
                  <div className="space-y-2">
                    {functionalRoles.productReleaseApprover.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => handleUpdateRoleInput('productReleaseApprover', idx, e.target.value)}
                          placeholder="e.g. Quality Manager"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {functionalRoles.productReleaseApprover.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleInput('productReleaseApprover', idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove role"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoleInput('productReleaseApprover')}
                    className="mt-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another</span>
                  </button>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-5">
                {/* Supplier Management Responsible */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Supplier Management Responsible
                  </label>
                  <div className="space-y-2">
                    {functionalRoles.supplierManagementResponsible.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => handleUpdateRoleInput('supplierManagementResponsible', idx, e.target.value)}
                          placeholder="e.g. Supply Chain Manager"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {functionalRoles.supplierManagementResponsible.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleInput('supplierManagementResponsible', idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove role"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoleInput('supplierManagementResponsible')}
                    className="mt-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another</span>
                  </button>
                </div>

                {/* Training Coordinator */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-0.5">
                    Training Coordinator
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Responsible for internal/external training & induction
                  </p>
                  <div className="space-y-2">
                    {functionalRoles.trainingCoordinator.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => handleUpdateRoleInput('trainingCoordinator', idx, e.target.value)}
                          placeholder="e.g. Training & Development Officer"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {functionalRoles.trainingCoordinator.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleInput('trainingCoordinator', idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove role"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoleInput('trainingCoordinator')}
                    className="mt-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another</span>
                  </button>
                </div>

                {/* Sales Manager */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Sales Manager
                  </label>
                  <div className="space-y-2">
                    {functionalRoles.salesManager.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => handleUpdateRoleInput('salesManager', idx, e.target.value)}
                          placeholder="e.g. Sales & Marketing Manager"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {functionalRoles.salesManager.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoleInput('salesManager', idx)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove role"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoleInput('salesManager')}
                    className="mt-2 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. COMPANY OVERVIEW (Matches Pinned Image)               */}
          {/* ======================================================== */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <LayoutList className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">3. Company Overview</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Context pulled automatically by AI when generating QMS documents
                </p>
              </div>
            </div>

            <div className="border-b border-slate-100 pt-1" />

            {/* What does the company do? */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                What does the company do?
              </label>
              <textarea
                rows={3}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder="Brief description of the company's core business, mission and scope of operations..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Main Products & Services */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Main Products & Services
              </label>
              <textarea
                rows={5}
                value={mainProductsServices}
                onChange={(e) => setMainProductsServices(e.target.value)}
                placeholder={`List your main products and services, one per line:\n• Product A\n• Service B\n• Service C`}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Industry & Number of Employees Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="steel"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Number of Employees
                </label>
                <div className="relative">
                  <select
                    value={employeesCount}
                    onChange={(e) => setEmployeesCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-10"
                  >
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="500+ employees">500+ employees</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Main Physical Location / Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Main Physical Location / Address
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="no84 guindy workspace"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Changes Floating Action Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Save identity, website, leadership, functional roles, and overview details for {name}.
            </span>
            <button
              type="button"
              onClick={() => handleSaveCompany()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Profile Changes</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* DANGER ZONE (Matches Pinned Image)                       */}
          {/* ======================================================== */}
          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#e02b2b]">Danger Zone</h2>
              <p className="text-xs text-slate-500 mt-1">
                Irreversible actions for this company profile
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 bg-[#e02b2b] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Company Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Company Profile</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{company.name}</strong>?
              All company configuration, leadership details, and overview settings will be permanently removed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProfile}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#e02b2b] hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Down as Owner Modal */}
      {showStepDownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#b91c1c] flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Step Down as Owner</h3>
                <p className="text-xs text-slate-500">Transfer primary management of this QMS</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Select an active team member below to take over as the primary Owner of{' '}
              <strong className="text-slate-900">{company.name}</strong>. Your account will remain as a Consultant.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Primary Owner
              </label>
              <div className="relative">
                <select
                  value={selectedNewOwnerId}
                  onChange={(e) => setSelectedNewOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-10"
                >
                  <option value="" disabled>Select a team member...</option>
                  {teamMembers
                    .filter((m) => !m.isOwner && m.role !== 'Owner')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.email} ({m.role})
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {teamMembers.filter((m) => !m.isOwner && m.role !== 'Owner').length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1.5">
                  No other team members available. Please invite a team member first before transferring ownership.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowStepDownModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStepDownConfirm}
                disabled={teamMembers.filter((m) => !m.isOwner && m.role !== 'Owner').length === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#b91c1c] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Confirm Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onAddCompany={handleAddNewCompany}
        defaultEmail={companyEmail}
      />
    </div>
  );
};
