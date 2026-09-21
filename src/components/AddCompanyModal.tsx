import React, { useState } from 'react';
import {
  Building,
  X,
  Plus,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  Users,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Company } from '../types';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (newCompany: Company) => void;
  defaultEmail?: string;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onAddCompany,
  defaultEmail = 'nv8660970099@gmail.com',
}) => {
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('+27 11 948 2000');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [industry, setIndustry] = useState('Manufacturing & Engineering');
  const [employeesCount, setEmployeesCount] = useState('11 - 50');
  const [plan, setPlan] = useState('PROFESSIONAL');
  const [iso9001, setIso9001] = useState(true);
  const [iso14001, setIso14001] = useState(false);
  const [iso45001, setIso45001] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('A valid primary contact email is required.');
      return;
    }

    const isoScope: string[] = [];
    if (iso9001) isoScope.push('ISO 9001:2015');
    if (iso14001) isoScope.push('ISO 14001:2015');
    if (iso45001) isoScope.push('ISO 45001:2018');

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name: name.trim(),
      registrationNumber: registrationNumber.trim() || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      address: address.trim(),
      industry: industry.trim(),
      employeesCount,
      isoScope,
      plan,
      daysRemaining: plan === 'TRIAL' ? 14 : 365,
    };

    onAddCompany(newCompany);
    onClose();

    // Reset fields
    setName('');
    setRegistrationNumber('');
    setAddress('');
    setWebsite('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto antialiased font-sans select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Add New Company Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new corporate entity or client workspace into SHEQ Street.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name & Registration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Industrial Solutions Ltd"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration / CIPC Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. 2026/894102/07"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nv8660970099@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 11 948 2000"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Industry & Team Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:border-blue-600 outline-none"
              >
                <option value="Manufacturing & Engineering">Manufacturing & Engineering</option>
                <option value="Mining & Resources">Mining & Resources</option>
                <option value="Construction & Civil Works">Construction & Civil Works</option>
                <option value="Logistics, Freight & Supply Chain">Logistics, Freight & Supply Chain</option>
                <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                <option value="Food Safety & Agriculture">Food Safety & Agriculture</option>
                <option value="Information Technology & Software">Information Technology & Software</option>
                <option value="Consulting & Auditing Services">Consulting & Auditing Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team Size / Employees
              </label>
              <select
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:border-blue-600 outline-none"
              >
                <option value="1 - 10">1 - 10 Employees</option>
                <option value="11 - 50">11 - 50 Employees</option>
                <option value="51 - 250">51 - 250 Employees</option>
                <option value="250+">250+ Enterprise Scale</option>
              </select>
            </div>
          </div>

          {/* Physical Address & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Head Office Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Building, Street, City"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Website (Optional)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.co.za"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ISO Scope Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ISO Compliance Standards in Scope
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iso9001}
                  onChange={(e) => setIso9001(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">ISO 9001:2015</span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iso14001}
                  onChange={(e) => setIso14001(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">ISO 14001</span>
              </label>

              <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iso45001}
                  onChange={(e) => setIso45001(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">ISO 45001</span>
              </label>
            </div>
          </div>

          {/* Initial Plan Tier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subscription / Access Tier
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:border-blue-600 outline-none"
            >
              <option value="PROFESSIONAL">Professional QMS (Active 365-Day License)</option>
              <option value="ENTERPRISE">Enterprise Multi-Site License</option>
              <option value="TRIAL">14-Day Free Trial</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Switch to New Company</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
