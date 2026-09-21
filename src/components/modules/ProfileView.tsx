import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  KeyRound,
  Bell,
  Save,
  Check,
  Plus,
  Globe,
  MapPin,
  ShieldCheck,
  Briefcase,
  Users,
} from 'lucide-react';
import { Company, AuthUser } from '../../types';
import { LogOut } from 'lucide-react';
import { AddCompanyModal } from '../AddCompanyModal';

interface ProfileViewProps {
  company: Company;
  companies?: Company[];
  user?: AuthUser | null;
  onUpdateUser?: (updated: Partial<AuthUser>) => void;
  onUpdateCompany?: (updated: Partial<Company>) => void;
  onAddCompany?: (newCompany: Company) => void;
  onCompanyChange?: (company: Company) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  company,
  companies = [],
  user,
  onUpdateUser,
  onUpdateCompany,
  onAddCompany,
  onCompanyChange,
  onLogout,
}) => {
  // Tab: 'user' | 'company'
  const [activeSubTab, setActiveSubTab] = useState<'user' | 'company'>('company');

  // User state
  const [userSaved, setUserSaved] = useState(false);
  const [name, setName] = useState(user?.name || 'NAVEEN .V');
  const [email, setEmail] = useState(user?.email || 'nv8660970099@gmail.com');
  const [phone, setPhone] = useState('+27 82 459 2810');
  const [role, setRole] = useState('SHEQ Quality Lead / Admin');

  // Company state
  const [companySaved, setCompanySaved] = useState(false);
  const [compName, setCompName] = useState(company.name);
  const [compReg, setCompReg] = useState(company.registrationNumber || '2024/991024/07');
  const [compEmail, setCompEmail] = useState(company.email || 'nv8660970099@gmail.com');
  const [compPhone, setCompPhone] = useState(company.phone || '+27 11 948 2000');
  const [compWebsite, setCompWebsite] = useState(company.website || 'https://nkquality.co.za');
  const [compAddress, setCompAddress] = useState(company.address || 'Sandton Commercial Park, Building 4');
  const [compIndustry, setCompIndustry] = useState(company.industry || 'Manufacturing & Engineering');

  // Add company modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setCompName(company.name);
    setCompReg(company.registrationNumber || '');
    setCompEmail(company.email || 'nv8660970099@gmail.com');
    setCompPhone(company.phone || '+27 11 948 2000');
    setCompWebsite(company.website || '');
    setCompAddress(company.address || '');
    setCompIndustry(company.industry || 'Manufacturing & Engineering');
  }, [company]);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser?.({ name, email });
    setUserSaved(true);
    setTimeout(() => setUserSaved(false), 3000);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany?.({
      name: compName,
      registrationNumber: compReg,
      email: compEmail,
      phone: compPhone,
      website: compWebsite,
      address: compAddress,
      industry: compIndustry,
    });
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  };

  const handleAddNewCompany = (newComp: Company) => {
    onAddCompany?.(newComp);
    setCompName(newComp.name);
    setCompReg(newComp.registrationNumber || '');
    setCompEmail(newComp.email);
    setCompPhone(newComp.phone);
    setCompWebsite(newComp.website || '');
    setCompAddress(newComp.address || '');
    setCompIndustry(newComp.industry || '');
    setAddedNotice(`Successfully created and switched to ${newComp.name}!`);
    setTimeout(() => setAddedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="text-slate-600 font-semibold">{company.name}</span>
          <span className="px-1.5 py-0.5 rounded border border-blue-300/80 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider">
            {company.plan || 'ACTIVE'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Company Details</span>
        </button>
      </div>

      {/* Header with Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeSubTab === 'company' ? 'Company Profile & Details' : 'User Profile'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeSubTab === 'company'
              ? 'Manage corporate entity details, addresses, registration numbers and multi-company portfolios.'
              : 'Manage your personal credentials, contact details and QMS role assignments.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('company')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'company' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('user')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'user' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>User Profile</span>
          </button>
        </div>
      </div>

      {addedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPANY PROFILE SUB-TAB                                  */}
      {/* ======================================================== */}
      {activeSubTab === 'company' && (
        <div className="space-y-6">
          {companySaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Company profile updated successfully!</span>
            </div>
          )}

          {/* Current Company Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0">
                  {compName ? compName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{compName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {compIndustry} • Registration #{compReg}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ISO 9001:2015 Verified
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {company.plan || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Company</span>
              </button>
            </div>

            {/* Editable Form */}
            <form onSubmit={handleSaveCompany} className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration / CIPC Number
                  </label>
                  <input
                    type="text"
                    value={compReg}
                    onChange={(e) => setCompReg(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={compEmail}
                      onChange={(e) => setCompEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={compPhone}
                      onChange={(e) => setCompPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={compAddress}
                      onChange={(e) => setCompAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={compWebsite}
                      onChange={(e) => setCompWebsite(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
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
                  <span>Save Company Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* All Registered Companies Workspaces Portfolio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Company Workspaces & Entities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-company portfolio management. Switch active company or register new corporate entities.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Company</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {companies.map((c) => {
                const isCurrent = company.id === c.id || company.name === c.name;
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {c.name}
                            </span>
                            {c.registrationNumber && (
                              <span className="text-[11px] font-mono text-slate-500">
                                {c.registrationNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isCurrent ? 'ACTIVE' : c.plan || 'STANDARD'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 my-2">
                        <div className="truncate flex items-center gap-1 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{c.email || 'nv8660970099@gmail.com'}</span>
                        </div>
                        {c.phone && (
                          <div className="truncate flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                        {c.address && (
                          <div className="truncate flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{c.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {c.industry || 'Manufacturing'}
                      </span>

                      {isCurrent ? (
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span>Current Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCompanyChange?.(c)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Switch to this
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Card */}
              <div
                onClick={() => setShowAddModal(true)}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                  + Add New Company Details
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Register a new legal entity or client workspace
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* USER PROFILE SUB-TAB                                     */}
      {/* ======================================================== */}
      {activeSubTab === 'user' && (
        <div className="space-y-6">
          {userSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile settings saved successfully.</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-2xl border-2 border-slate-200 shadow-xs">
                N
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{name}</h2>
                <p className="text-xs text-slate-500">{role} • {company.name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ISO 9001 Lead Auditor
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Modal Dialog */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCompany={handleAddNewCompany}
        defaultEmail={user?.email || 'nv8660970099@gmail.com'}
      />
    </div>
  );
};
