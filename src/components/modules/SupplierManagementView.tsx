import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileText,
  Star,
  X,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Eye,
  Trash2,
} from 'lucide-react';
import { Company, SupplierItem } from '../../types';

interface SupplierManagementViewProps {
  company: Company;
}

const initialSuppliersList: SupplierItem[] = [
  {
    id: '1',
    code: 'SUP-001',
    name: 'Alpha Raw Materials Ltd',
    address: '14 Industrial Way, Germiston, Gauteng',
    division: 'Raw Materials',
    category: 'Raw Polymers',
    contactName: 'David Miller',
    telNo: '+27 11 824 5500',
    email: 'orders@alpharaw.co.za',
    rating: 94,
    status: 'Approved',
    lastAudit: '12-Feb-2026',
    isoCertified: true,
  },
  {
    id: '2',
    code: 'SUP-002',
    name: 'Precision Tooling & Dies',
    address: '8 Foundry Street, Wadeville, Johannesburg',
    division: 'Engineering',
    category: 'Machining',
    contactName: 'Sarah Jenkins',
    telNo: '+27 11 902 4433',
    email: 'info@precisiontooling.co.za',
    rating: 88,
    status: 'Approved',
    lastAudit: '20-May-2026',
    isoCertified: true,
  },
  {
    id: '3',
    code: 'SUP-003',
    name: 'EcoPack Solutions',
    address: '22 Corrugated Road, Roodekop, Germiston',
    division: 'Packaging',
    category: 'Packaging',
    contactName: 'Michael Van Der Merwe',
    telNo: '+27 11 865 1200',
    email: 'sales@ecopack.co.za',
    rating: 91,
    status: 'Approved',
    lastAudit: '18-Aug-2026',
    isoCertified: false,
  },
  {
    id: '4',
    code: 'SUP-004',
    name: 'Apex Chemical Logistics',
    address: 'Gate 4, Midrand Freight Terminal, Midrand',
    division: 'Logistics',
    category: 'Transport',
    contactName: 'Thabo Ndlovu',
    telNo: '+27 11 315 8890',
    email: 'dispatch@apexlogistics.co.za',
    rating: 74,
    status: 'Pending Evaluation',
    lastAudit: 'Due in 45 days',
    isoCertified: true,
  },
];

export const SupplierManagementView: React.FC<SupplierManagementViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<'asl' | 'eval' | 'audits'>('asl');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);

  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialSuppliersList;
  });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    division: '',
    commodity: '',
    contactName: '',
    telNo: '',
    email: '',
    status: 'Approved',
  });

  useEffect(() => {
    try {
      localStorage.setItem('sheq_suppliers', JSON.stringify(suppliers));
    } catch {}
  }, [suppliers]);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newSupplier: SupplierItem = {
      id: `sup-${Date.now()}`,
      code: `SUP-00${suppliers.length + 1}`,
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      division: formData.division.trim() || undefined,
      category: formData.commodity.trim() || 'General Services',
      contactName: formData.contactName.trim() || undefined,
      telNo: formData.telNo.trim() || undefined,
      email: formData.email.trim() || undefined,
      status: formData.status,
      rating: 90,
      lastAudit: 'Pending initial audit',
      isoCertified: true,
    };

    setSuppliers([newSupplier, ...suppliers]);
    setFormData({
      name: '',
      address: '',
      division: '',
      commodity: '',
      contactName: '',
      telNo: '',
      email: '',
      status: 'Approved',
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteSupplier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSuppliers(suppliers.filter((s) => s.id !== id));
    if (selectedSupplier?.id === id) {
      setSelectedSupplier(null);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (sup) =>
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.division && sup.division.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const approvedCount = suppliers.filter((s) => s.status === 'Approved').length;
  const pendingCount = suppliers.filter((s) => s.status === 'Pending Evaluation').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Approved Supplier List, performance evaluations and qualification.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{approvedCount}</div>
            <div className="text-xs font-medium text-slate-500">Approved Suppliers</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingCount}</div>
            <div className="text-xs font-medium text-slate-500">Pending Evaluation</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">100%</div>
            <div className="text-xs font-medium text-slate-500">Critical Material Traceability</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('asl')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'asl'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved Supplier List (ASL)
        </button>
        <button
          onClick={() => setActiveTab('eval')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'eval'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Evaluations & Scorecards
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'audits'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Schedule
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vendor or material..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export ASL</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#122b49] text-white font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Commodity / Scope</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">ISO 9001</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Audit</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSuppliers.map((sup) => (
                <tr
                  key={sup.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSupplier(sup)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 hover:underline">
                    {sup.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <div>{sup.name}</div>
                    {sup.division && (
                      <span className="text-[10px] font-normal text-slate-400">
                        Division: {sup.division}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{sup.category}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {sup.rating || 90}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {sup.isoCertified ? (
                      <span className="text-emerald-600 font-semibold">Certified</span>
                    ) : (
                      <span className="text-slate-400">Audited via QCP</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sup.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : sup.status === 'Pending Evaluation'
                          ? 'bg-amber-50 text-amber-700 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {sup.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{sup.lastAudit || 'Planned'}</td>
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <button
                        onClick={() => setSelectedSupplier(sup)}
                        className="p-1 hover:text-slate-700 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSupplier(sup.id, e)}
                        className="p-1 hover:text-red-600 cursor-pointer"
                        title="Delete supplier"
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

      {/* Add Supplier Modal - Matching Pinned Design */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3">
              <h2 className="font-bold text-xl text-slate-900">Add Supplier</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 pt-1">
              {/* Row 1: Supplier Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-500 ring-2 ring-blue-500/20 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Row 2: Physical Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Physical Address (Postal Address)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Row 3: Division & Commodity / Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Division
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Commodity / Service
                  </label>
                  <input
                    type="text"
                    value={formData.commodity}
                    onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Contact Name & Tel No. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Tel No.
                  </label>
                  <input
                    type="text"
                    value={formData.telNo}
                    onChange={(e) => setFormData({ ...formData, telNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 5: E-mail */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Row 6: Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Evaluation">Pending Evaluation</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Disqualified">Disqualified</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1d6eed] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Supplier Details Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-lg text-slate-900">{selectedSupplier.name}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {selectedSupplier.code}
                </span>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Status</span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedSupplier.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-300'
                    }`}
                  >
                    {selectedSupplier.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Commodity / Service</span>
                  <span className="font-semibold text-slate-800">{selectedSupplier.category}</span>
                </div>
                {selectedSupplier.division && (
                  <div>
                    <span className="text-xs text-slate-500 block">Division</span>
                    <span className="font-semibold text-slate-800">{selectedSupplier.division}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-500 block">Score</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.rating || 90}%</span>
                </div>
              </div>

              {selectedSupplier.address && (
                <div className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Address</span>
                    <span className="text-slate-800 text-xs font-medium">{selectedSupplier.address}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSupplier.contactName && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 block">Contact Name</span>
                    <span className="text-slate-800 text-xs font-semibold">{selectedSupplier.contactName}</span>
                  </div>
                )}
                {selectedSupplier.telNo && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-500 block">Telephone</span>
                      <span className="text-slate-800 text-xs font-medium">{selectedSupplier.telNo}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedSupplier.email && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-500 block">E-mail</span>
                    <a
                      href={`mailto:${selectedSupplier.email}`}
                      className="text-blue-600 text-xs font-medium hover:underline"
                    >
                      {selectedSupplier.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
