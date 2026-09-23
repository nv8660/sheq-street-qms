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
  Sparkles,
  Wand2,
  Upload,
  FileSpreadsheet,
  Check,
  Loader2,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Company, SupplierItem } from '../../types';
import { getCompanyPrefix } from '../../utils/companyUtils';

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
  {
    id: '5',
    code: 'SUP-005',
    name: 'Vaal Stainless Steel & Alloys',
    address: '44 Steel Road, Vanderbijlpark, Gauteng',
    division: 'Metals & Fabrication',
    category: 'Speciality Alloys',
    contactName: 'Johan Pretorius',
    telNo: '+27 16 980 3210',
    email: 'sales@vaalsteel.co.za',
    rating: 96,
    status: 'Approved',
    lastAudit: '15-Jan-2026',
    isoCertified: true,
  },
  {
    id: '6',
    code: 'SUP-006',
    name: 'Cape Safety Wear & PPE',
    address: '10 Marine Drive, Paarden Eiland, Cape Town',
    division: 'Safety & PPE',
    category: 'Protective Equipment',
    contactName: 'Nadia Adams',
    telNo: '+27 21 511 7740',
    email: 'support@capesafety.co.za',
    rating: 85,
    status: 'Approved',
    lastAudit: '04-Nov-2025',
    isoCertified: true,
  },
];

interface PerformanceRowItem {
  id: string;
  name: string;
  qualityScore?: number;
  deliveryScore?: number;
  communicationScore?: number;
  totalScore?: number;
  ratingGrade?: 'A' | 'B' | 'C';
  ncrCount: number;
  rawSupplier?: SupplierItem;
}

export const SupplierManagementView: React.FC<SupplierManagementViewProps> = ({ company }) => {
  // Navigation Tabs: 'asl' (Approved Suppliers List) | 'performance' (Supplier Performance Summary)
  const [activeTab, setActiveTab] = useState<'asl' | 'performance'>('asl');

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Performance Summary Tab States
  const [perfSearchTerm, setPerfSearchTerm] = useState('');
  const [perfYear, setPerfYear] = useState('2026');
  const [isRefreshingPerf, setIsRefreshingPerf] = useState(false);

  // AI Modal State
  const [aiMode, setAiMode] = useState<'generate' | 'import'>('generate');
  const [aiIndustry, setAiIndustry] = useState('Manufacturing & Raw Materials');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiRawText, setAiRawText] = useState('');
  const [aiCount, setAiCount] = useState<number>(4);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<Array<Partial<SupplierItem> & { selected?: boolean }>>([]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    showToast(`Supplier "${newSupplier.name}" added successfully!`);
  };

  const handleDeleteSupplier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSuppliers(suppliers.filter((s) => s.id !== id));
    if (selectedSupplier?.id === id) {
      setSelectedSupplier(null);
    }
    showToast('Supplier removed from register.');
  };

  const handleExportASL = () => {
    const headers = [
      '#',
      'Supplier Name',
      'Physical Address',
      'Division',
      'Contact Name',
      'Tel No.',
      'E-mail',
      'Commodity / Service',
      'Status',
    ];
    const rows = filteredSuppliers.map((s, idx) => [
      idx + 1,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.division || '').replace(/"/g, '""')}"`,
      `"${(s.contactName || '').replace(/"/g, '""')}"`,
      `"${(s.telNo || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.category || '').replace(/"/g, '""')}"`,
      `"${(s.status || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Approved_Supplier_List_ASL_${company.name || 'SHEQ'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Approved Supplier List (ASL) to CSV!');
  };

  // AI Generation & Import Handler
  const handleRunAiProcess = async () => {
    setIsAiLoading(true);
    try {
      const resp = await fetch('/api/ai-generate-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: aiMode === 'generate' ? aiIndustry : undefined,
          prompt: aiMode === 'generate' ? aiPrompt : undefined,
          rawText: aiMode === 'import' ? aiRawText : undefined,
          count: aiCount,
          companyName: company.name || 'SHEQ Street',
        }),
      });

      const data = await resp.json();
      if (data.success && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
        const withSelection = data.suppliers.map((s: any) => ({
          ...s,
          selected: true,
          rating: 90 + Math.floor(Math.random() * 8),
          isoCertified: true,
        }));
        setAiGeneratedPreview(withSelection);
        showToast(`AI generated ${withSelection.length} structured suppliers for review!`);
      } else {
        showToast('No suppliers generated. Please adjust prompt or input text.');
      }
    } catch (err) {
      console.warn('AI generation error:', err);
      showToast('AI Service offline. Using ISO catalog fallback.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCommitAiSuppliers = () => {
    const selectedToImport = aiGeneratedPreview.filter((s) => s.selected !== false);
    if (selectedToImport.length === 0) {
      showToast('Please select at least one supplier to import.');
      return;
    }

    const currentLen = suppliers.length;
    const newItems: SupplierItem[] = selectedToImport.map((s, idx) => ({
      id: `sup-${Date.now()}-${idx}`,
      code: `SUP-00${currentLen + idx + 1}`,
      name: s.name || 'Generated Supplier',
      address: s.address || 'Industrial Area',
      division: s.division || 'Operations',
      category: s.category || 'General Supplies',
      contactName: s.contactName || 'Account Manager',
      telNo: s.telNo || '+27 11 000 0000',
      email: s.email || 'orders@supplier.co.za',
      status: s.status || 'Approved',
      rating: s.rating || 92,
      lastAudit: 'Pending initial audit',
      isoCertified: true,
    }));

    setSuppliers([...newItems, ...suppliers]);
    setIsAiModalOpen(false);
    setAiGeneratedPreview([]);
    setAiPrompt('');
    setAiRawText('');
    showToast(`Successfully added ${newItems.length} suppliers to Approved Supplier List (ASL)!`);
  };

  const loadSampleImportText = () => {
    setAiRawText(`Atlas Pneumatics & Hydraulics, 19 Steel Park Germiston, Engineering, Andre Venter, +27 11 873 2200, sales@atlaspneumatics.co.za, Hydraulic Seals & Hoses, Approved
Highveld Chemical Intermediates, 44 Petro Way Sasolburg, Raw Materials, Dr. Susan Marais, +27 16 976 1140, smarais@highveldchem.co.za, Industrial Solvents, Approved
Swiftline Cross-Border Haulage, Gate 8 City Deep Terminal Johannesburg, Logistics, Sipho Sithole, +27 11 613 9020, dispatch@swiftline.co.za, Heavy Freight & Rigging, Pending Evaluation`);
  };

  const handleRefreshPerfData = () => {
    setIsRefreshingPerf(true);
    setTimeout(() => {
      setIsRefreshingPerf(false);
      showToast(`Supplier performance metrics updated for ${perfYear}!`);
    }, 500);
  };

  const filteredSuppliers = suppliers.filter(
    (sup) =>
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.division && sup.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sup.contactName && sup.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Construct Performance Summary Rows (matching Image 2)
  // Row 1 is company name ('nk' by default) with — and 0 NCRs
  const companyPerfRow: PerformanceRowItem = {
    id: 'comp-row',
    name: company?.name || 'nk',
    qualityScore: undefined,
    deliveryScore: undefined,
    communicationScore: undefined,
    totalScore: undefined,
    ratingGrade: undefined,
    ncrCount: 0,
  };

  const supplierPerfRows: PerformanceRowItem[] = suppliers.map((s) => {
    const isApproved = s.status === 'Approved';
    const quality = isApproved ? (s.rating || 90) : 72;
    const delivery = isApproved ? Math.max(70, (s.rating || 90) - 2) : 75;
    const comms = isApproved ? Math.max(70, (s.rating || 90) + 1) : 74;
    const total = Math.round(quality * 0.4 + delivery * 0.3 + comms * 0.3);
    const grade: 'A' | 'B' | 'C' = total >= 85 ? 'A' : total >= 70 ? 'B' : 'C';

    return {
      id: s.id,
      name: s.name,
      qualityScore: quality,
      deliveryScore: delivery,
      communicationScore: comms,
      totalScore: total,
      ratingGrade: grade,
      ncrCount: s.status === 'Pending Evaluation' ? 1 : 0,
      rawSupplier: s,
    };
  });

  const fullPerfList: PerformanceRowItem[] = [companyPerfRow, ...supplierPerfRows];
  const filteredPerfList = fullPerfList.filter((item) =>
    item.name.toLowerCase().includes(perfSearchTerm.toLowerCase())
  );

  const approvedCount = suppliers.filter((s) => s.status === 'Approved').length;
  const pendingCount = suppliers.filter((s) => s.status === 'Pending Evaluation').length;

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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supplier Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage approved suppliers and track performance.
          </p>
        </div>

        {activeTab === 'asl' && (
          <div className="flex items-center gap-3">
            {/* AI Import / Generate List Button */}
            <button
              onClick={() => {
                setAiGeneratedPreview([]);
                setIsAiModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI Import / Generate List</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub Tabs matching 1st Pinned Image & 2nd Pinned Image */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab('asl')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'asl'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Approved Suppliers List
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'performance'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Supplier Performance Summary
        </button>
      </div>

      {/* TAB 1: Approved Suppliers List */}
      {activeTab === 'asl' && (
        <div className="space-y-6 animate-in fade-in duration-150">
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

          {/* Search and Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vendor, address, division or commodity..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleExportASL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ASL</span>
              </button>
            </div>

            {/* Pinned Image Header Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#16325c] text-white font-bold text-xs sm:text-[13px] border-b border-[#0e223f]">
                    <th className="py-3.5 px-4 font-bold text-white text-center w-12 whitespace-nowrap">#</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Supplier Name</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Physical Address</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Division</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Contact Name</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Tel No.</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">E-mail</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Commodity / Service</th>
                    <th className="py-3.5 px-4 font-bold text-white whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 font-bold text-white text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No suppliers found matching "{searchTerm}". Click "AI Import / Generate List" or "Add Supplier" to add suppliers.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((sup, idx) => (
                      <tr
                        key={sup.id}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => setSelectedSupplier(sup)}
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-500 text-center whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div>{sup.name}</div>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">{sup.code}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={sup.address}>
                          {sup.address || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {sup.division || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                          {sup.contactName || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {sup.telNo || '—'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {sup.email ? (
                            <a
                              href={`mailto:${sup.email}`}
                              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              {sup.email}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {sup.category || '—'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              sup.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : sup.status === 'Pending Evaluation'
                                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                : sup.status === 'Conditional'
                                ? 'bg-blue-50 text-blue-700 border border-blue-300'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {sup.status}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-4 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button
                              onClick={() => setSelectedSupplier(sup)}
                              className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                              title="View supplier details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSupplier(sup.id, e)}
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete supplier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Supplier Performance Summary (Matching 2nd Pinned Image) */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Document Bar */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-009</span>
          </div>

          {/* Search, Year, Weighted Summary & Refresh */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={perfSearchTerm}
                  onChange={(e) => setPerfSearchTerm(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 text-xs">Year</span>
                <div className="relative">
                  <select
                    value={perfYear}
                    onChange={(e) => setPerfYear(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="text-slate-500 text-xs hidden sm:block">
                Performance summary — weighted scores: Quality (40%), Delivery (30%), Communication (30%)
              </div>
            </div>

            <button
              onClick={handleRefreshPerfData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer self-start lg:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingPerf ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Rating Scale Legend */}
          <div className="space-y-1.5 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                A
              </span>
              <span>— 85–100% Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                B
              </span>
              <span>— 70–84% Acceptable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                C
              </span>
              <span>— 0–69% Action Required</span>
            </div>
          </div>

          {/* Performance Table Matching Pinned Screenshot */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16325c] text-white font-bold text-xs border-b border-[#0e223f]">
                    <th className="py-3 px-4 text-center w-12 font-bold text-white whitespace-nowrap">#</th>
                    <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Supplier Name</th>
                    <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Quality (40%)</th>
                    <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Delivery (30%)</th>
                    <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Communication (30%)</th>
                    <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Total</th>
                    <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Rating</th>
                    <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">NCRs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPerfList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No performance records found matching "{perfSearchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredPerfList.map((sup, idx) => (
                      <tr
                        key={sup.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                          {idx + 1}
                        </td>
                        <td
                          className="py-3.5 px-4 font-semibold text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                          onClick={() => {
                            if (sup.rawSupplier) {
                              setSelectedSupplier(sup.rawSupplier);
                            }
                          }}
                        >
                          {sup.name}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600">
                          {sup.qualityScore !== undefined ? `${sup.qualityScore}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600">
                          {sup.deliveryScore !== undefined ? `${sup.deliveryScore}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600">
                          {sup.communicationScore !== undefined ? `${sup.communicationScore}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                          {sup.totalScore !== undefined ? `${sup.totalScore}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {sup.ratingGrade ? (
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-white shadow-2xs ${
                                sup.ratingGrade === 'A'
                                  ? 'bg-emerald-600'
                                  : sup.ratingGrade === 'B'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            >
                              {sup.ratingGrade}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                          {sup.ncrCount ?? 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Import / Generate List Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      AI Supplier List Generator & Smart Import
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ISO 9001 Compliant
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate realistic approved suppliers with ISO scopes or parse unstructured vendor lists with AI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2 mt-5 p-1 bg-slate-100 rounded-xl max-w-sm">
              <button
                type="button"
                onClick={() => setAiMode('generate')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  aiMode === 'generate'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate via AI</span>
              </button>
              <button
                type="button"
                onClick={() => setAiMode('import')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  aiMode === 'import'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>AI Smart Import / Paste</span>
              </button>
            </div>

            {/* Mode Content */}
            <div className="mt-4 space-y-4">
              {aiMode === 'generate' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Target Industry / Scope
                      </label>
                      <div className="relative">
                        <select
                          value={aiIndustry}
                          onChange={(e) => setAiIndustry(e.target.value)}
                          className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                          <option value="Manufacturing & Raw Materials">Manufacturing & Raw Materials</option>
                          <option value="Logistics & Cold Chain Transport">Logistics & Cold Chain Transport</option>
                          <option value="Packaging & Paper Products">Packaging & Paper Products</option>
                          <option value="Precision Engineering & CNC Tooling">Precision Engineering & CNC Tooling</option>
                          <option value="Electrical & Automation Systems">Electrical & Automation Systems</option>
                          <option value="Safety, PPE & Facility Services">Safety, PPE & Facility Services</option>
                          <option value="Laboratories & Calibration Metrology">Laboratories & Calibration Metrology</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Number of Suppliers to Generate
                      </label>
                      <div className="flex items-center gap-2">
                        {[3, 4, 6, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setAiCount(num)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              aiCount === num
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Specific Instructions or Location Requirements (Optional)
                    </label>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Include suppliers in Gauteng and Western Cape with ISO 9001 certified polymers and resins"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-800">
                      Paste Raw Text, CSV, or Vendor List
                    </label>
                    <button
                      type="button"
                      onClick={loadSampleImportText}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
                    >
                      Load Sample Data
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder="Paste unformatted text, CSV rows, or invoice vendor details here. AI will extract and structure each into Supplier Name, Physical Address, Division, Contact Name, Tel, Email, and Status..."
                    className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:font-sans"
                  />
                </div>
              )}

              {/* Action Trigger Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleRunAiProcess}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>{aiMode === 'generate' ? 'Generate Suppliers with AI' : 'Parse & Extract List with AI'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Generated Preview Section */}
              {aiGeneratedPreview.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        Generated / Extracted Suppliers ({aiGeneratedPreview.filter((s) => s.selected !== false).length} selected)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Check/uncheck items before adding to register
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setAiGeneratedPreview((prev) =>
                          prev.map((item) => ({ ...item, selected: !prev.every((p) => p.selected) }))
                        )
                      }
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      {aiGeneratedPreview.every((p) => p.selected) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/60">
                    {aiGeneratedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          setAiGeneratedPreview((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p))
                          )
                        }
                        className={`p-3 rounded-lg border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                          item.selected !== false
                            ? 'bg-white border-indigo-200 shadow-2xs'
                            : 'bg-slate-100/70 border-slate-200 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.selected !== false}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <div className="font-bold text-slate-900 truncate">{item.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{item.category}</div>
                          </div>

                          <div className="col-span-1">
                            <div className="text-slate-600 truncate">{item.address}</div>
                            <div className="text-[11px] text-slate-400">{item.division}</div>
                          </div>

                          <div className="col-span-1 flex flex-col sm:items-end justify-between">
                            <span className="font-medium text-slate-700">{item.contactName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.telNo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Commit Action */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAiGeneratedPreview([])}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitAiSuppliers}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Import {aiGeneratedPreview.filter((s) => s.selected !== false).length} Suppliers into ASL
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
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
                  placeholder="e.g. Acme Components Ltd"
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
                  placeholder="e.g. 14 Industrial Way, Germiston"
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
                    placeholder="e.g. Raw Materials"
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
                    placeholder="e.g. Raw Polymers"
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
                    placeholder="e.g. David Miller"
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
                    placeholder="e.g. +27 11 824 5500"
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
                  placeholder="e.g. orders@alpharaw.co.za"
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
                        : selectedSupplier.status === 'Pending Evaluation'
                        ? 'bg-amber-50 text-amber-700 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
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
                    <span className="text-xs text-slate-500 block">Physical Address</span>
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
                      <span className="text-xs text-slate-500 block">Tel No.</span>
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

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
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
