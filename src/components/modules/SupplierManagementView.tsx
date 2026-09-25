import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Truck, Plus, Search, CheckCircle2, Clock, Download, FileText, X,
  ChevronDown, Mail, Phone, MapPin, Eye, Trash2, Sparkles, Wand2,
  Upload, FileSpreadsheet, Check, Loader2, RefreshCw, Edit3, ArrowUpDown,
  Filter, ExternalLink
} from 'lucide-react';
import { Company, SupplierItem } from '../../types';

interface SupplierManagementViewProps {
  company: Company;
}

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

const initialSuppliersList: SupplierItem[] = [
  { id: '1', code: 'SUP-001', name: 'Alpha Raw Materials Ltd', address: '14 Industrial Way, Germiston, Gauteng', division: 'Raw Materials', category: 'Raw Polymers', contactName: 'David Miller', telNo: '+27 11 824 5500', email: 'orders@alpharaw.co.za', rating: 94, status: 'Approved', lastAudit: '12-Feb-2026', isoCertified: true },
  { id: '2', code: 'SUP-002', name: 'Precision Tooling & Dies', address: '8 Foundry Street, Wadeville, Johannesburg', division: 'Engineering', category: 'Machining', contactName: 'Sarah Jenkins', telNo: '+27 11 902 4433', email: 'info@precisiontooling.co.za', rating: 88, status: 'Approved', lastAudit: '20-May-2026', isoCertified: true },
  { id: '3', code: 'SUP-003', name: 'EcoPack Solutions', address: '22 Corrugated Road, Roodekop, Germiston', division: 'Packaging', category: 'Packaging', contactName: 'Michael Van Der Merwe', telNo: '+27 11 865 1200', email: 'sales@ecopack.co.za', rating: 91, status: 'Approved', lastAudit: '18-Aug-2026', isoCertified: false },
  { id: '4', code: 'SUP-004', name: 'Apex Chemical Logistics', address: 'Gate 4, Midrand Freight Terminal, Midrand', division: 'Logistics', category: 'Transport', contactName: 'Thabo Ndlovu', telNo: '+27 11 315 8890', email: 'dispatch@apexlogistics.co.za', rating: 74, status: 'Pending Evaluation', lastAudit: 'Due in 45 days', isoCertified: true },
  { id: '5', code: 'SUP-005', name: 'Vaal Stainless Steel & Alloys', address: '44 Steel Road, Vanderbijlpark, Gauteng', division: 'Metals & Fabrication', category: 'Speciality Alloys', contactName: 'Johan Pretorius', telNo: '+27 16 980 3210', email: 'sales@vaalsteel.co.za', rating: 96, status: 'Approved', lastAudit: '15-Jan-2026', isoCertified: true },
  { id: '6', code: 'SUP-006', name: 'Cape Safety Wear & PPE', address: '10 Marine Drive, Paarden Eiland, Cape Town', division: 'Safety & PPE', category: 'Protective Equipment', contactName: 'Nadia Adams', telNo: '+27 21 511 7740', email: 'support@capesafety.co.za', rating: 85, status: 'Approved', lastAudit: '04-Nov-2025', isoCertified: true },
];

const emptyFormData = {
  name: '', address: '', division: '', commodity: '',
  contactName: '', telNo: '', email: '', status: 'Approved'
};

// Reusable Components
const StatusBadge: React.FC<{ status?: string }> = ({ status = 'Approved' }) => {
  const styles: Record<string, string> = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'Pending Evaluation': 'bg-amber-50 text-amber-700 border-amber-300',
    Conditional: 'bg-blue-50 text-blue-700 border-blue-300',
    Disqualified: 'bg-red-50 text-red-700 border-red-300',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
};

const GradeBadge: React.FC<{ grade?: 'A' | 'B' | 'C' }> = ({ grade }) => {
  if (!grade) return <span className="text-slate-400">—</span>;
  const colors = { A: 'bg-emerald-600', B: 'bg-amber-500', C: 'bg-red-500' };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-white shadow-2xs ${colors[grade]}`}>
      {grade}
    </span>
  );
};

const ScoreCell: React.FC<{ score?: number; barColor?: string }> = ({ score, barColor = 'bg-blue-500' }) => {
  if (score === undefined) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="font-semibold text-slate-700">{score}%</span>
      <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden md:block">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
    </div>
  );
};

const FormInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}> = ({ label, value, onChange, placeholder, required, type = 'text' }) => (
  <div>
    <label className="block font-semibold text-slate-700 mb-1">{label} {required && '*'}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
    />
  </div>
);

export const SupplierManagementView: React.FC<SupplierManagementViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<'asl' | 'performance'>('asl');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'name' | 'division' | 'category' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Active State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Performance Tab
  const [perfSearchTerm, setPerfSearchTerm] = useState('');
  const [perfYear, setPerfYear] = useState('2026');
  const [isRefreshingPerf, setIsRefreshingPerf] = useState(false);

  // AI Modal
  const [aiMode, setAiMode] = useState<'generate' | 'import'>('generate');
  const [aiIndustry, setAiIndustry] = useState('Manufacturing & Raw Materials');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiRawText, setAiRawText] = useState('');
  const [aiCount, setAiCount] = useState<number>(4);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<Array<Partial<SupplierItem> & { selected?: boolean }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compPrefix = company?.name ? company.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() : 'NK';

  // Persistence
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company?.id}_suppliers`);
      if (savedScoped) {
        const parsed = JSON.parse(savedScoped);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const saved = localStorage.getItem('sheq_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialSuppliersList;
  });

  useEffect(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company.id}_suppliers`);
      if (savedScoped) {
        const parsed = JSON.parse(savedScoped);
        if (Array.isArray(parsed)) return setSuppliers(parsed);
      }
      const savedGlobal = localStorage.getItem('sheq_suppliers');
      if (savedGlobal) {
        const parsed = JSON.parse(savedGlobal);
        if (Array.isArray(parsed) && parsed.length > 0) return setSuppliers(parsed);
      }
      setSuppliers(initialSuppliersList);
    } catch {}
  }, [company.id]);

  useEffect(() => {
    try {
      localStorage.setItem('sheq_suppliers', JSON.stringify(suppliers));
      if (company?.id) localStorage.setItem(`sheq_${company.id}_suppliers`, JSON.stringify(suppliers));
    } catch {}
  }, [suppliers, company?.id]);

  // Esc key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFormModalOpen(false);
        setSelectedSupplier(null);
        setIsAiModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add / Edit Handlers
  const openAddModal = () => {
    setEditingSupplierId(null);
    setFormData(emptyFormData);
    setIsFormModalOpen(true);
  };

  const openEditModal = (sup: SupplierItem) => {
    setEditingSupplierId(sup.id);
    setFormData({
      name: sup.name,
      address: sup.address || '',
      division: sup.division || '',
      commodity: sup.category || '',
      contactName: sup.contactName || '',
      telNo: sup.telNo || '',
      email: sup.email || '',
      status: sup.status || 'Approved',
    });
    setSelectedSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingSupplierId) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplierId
            ? {
                ...s,
                name: formData.name.trim(),
                address: formData.address.trim() || undefined,
                division: formData.division.trim() || undefined,
                category: formData.commodity.trim() || 'General Services',
                contactName: formData.contactName.trim() || undefined,
                telNo: formData.telNo.trim() || undefined,
                email: formData.email.trim() || undefined,
                status: formData.status,
              }
            : s
        )
      );
      showToast(`Updated "${formData.name.trim()}"`);
    } else {
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
      showToast(`Added "${newSupplier.name}"`);
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteSupplier = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return;
    if (window.confirm(`Remove "${sup.name}" from the Approved Supplier List?`)) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      if (selectedSupplier?.id === id) setSelectedSupplier(null);
      showToast(`Removed "${sup.name}"`);
    }
  };

  // Export CSV
  const handleExportASL = () => {
    const headers = ['#', 'Supplier Name', 'Code', 'Address', 'Division', 'Contact', 'Tel', 'Email', 'Commodity', 'Status', 'Rating'];
    const rows = filteredSuppliers.map((s, idx) => [
      idx + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      s.code,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.division || '').replace(/"/g, '""')}"`,
      `"${(s.contactName || '').replace(/"/g, '""')}"`,
      `"${(s.telNo || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.category || '').replace(/"/g, '""')}"`,
      s.status,
      `${s.rating || 90}%`
    ]);
    const blob = new Blob([[headers.join(','), ...rows.map((r) => r.join(','))].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Approved_Supplier_List_ASL_${company.name || 'SHEQ'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported ASL to CSV');
  };

  // AI Pipeline
  const handleRunAiProcess = async (textOverride?: string) => {
    setIsAiLoading(true);
    const effectiveMode = textOverride !== undefined ? 'import' : aiMode;
    try {
      const resp = await fetch('/api/ai-generate-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: effectiveMode === 'generate' ? aiIndustry : undefined,
          prompt: effectiveMode === 'generate' ? aiPrompt : undefined,
          rawText: effectiveMode === 'import' ? (textOverride ?? aiRawText) : undefined,
          count: aiCount,
          companyName: company.name || 'SHEQ Street',
        }),
      });
      const data = await resp.json();
      if (data.success && Array.isArray(data.suppliers) && data.suppliers.length > 0) {
        const preview = data.suppliers.map((s: any) => ({
          ...s,
          selected: true,
          rating: 90 + Math.floor(Math.random() * 8),
          isoCertified: true,
        }));
        setAiGeneratedPreview(preview);
        showToast(`AI extracted ${preview.length} suppliers!`);
      } else {
        showToast('No suppliers generated. Try adjusting prompt or input.');
      }
    } catch {
      showToast('AI offline. Loaded standard ISO supplier catalog.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUploadImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiMode('import');
    setIsAiModalOpen(true);
    try {
      const text = await file.text();
      setAiRawText(text);
      showToast(`📄 Loaded "${file.name}". Parsing...`);
      handleRunAiProcess(text);
    } catch {
      showToast('Could not read file.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleCommitAiSuppliers = () => {
    const selected = aiGeneratedPreview.filter((s) => s.selected !== false);
    if (!selected.length) return showToast('Select at least one supplier to import.');
    const curLen = suppliers.length;
    const newItems: SupplierItem[] = selected.map((s, idx) => ({
      id: `sup-${Date.now()}-${idx}`,
      code: `SUP-00${curLen + idx + 1}`,
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
    showToast(`Imported ${newItems.length} suppliers to ASL!`);
  };

  // Filtered & Sorted Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => {
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.division && s.division.toLowerCase().includes(q)) ||
          (s.contactName && s.contactName.toLowerCase().includes(q));
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const valA = (a[sortField] || '').toString().toLowerCase();
        const valB = (b[sortField] || '').toString().toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [suppliers, searchTerm, statusFilter, sortField, sortAsc]);

  // Performance Rows
  const perfRows = useMemo(() => {
    const compRow: PerformanceRowItem = {
      id: 'comp-row',
      name: company?.name || 'nk',
      ncrCount: 0,
    };
    const supRows: PerformanceRowItem[] = suppliers.map((s) => {
      const isApproved = s.status === 'Approved';
      const q = isApproved ? (s.rating || 90) : 72;
      const d = isApproved ? Math.max(70, (s.rating || 90) - 2) : 75;
      const c = isApproved ? Math.max(70, (s.rating || 90) + 1) : 74;
      const total = Math.round(q * 0.4 + d * 0.3 + c * 0.3);
      const grade: 'A' | 'B' | 'C' = total >= 85 ? 'A' : total >= 70 ? 'B' : 'C';
      return {
        id: s.id,
        name: s.name,
        qualityScore: q,
        deliveryScore: d,
        communicationScore: c,
        totalScore: total,
        ratingGrade: grade,
        ncrCount: s.status === 'Pending Evaluation' ? 1 : 0,
        rawSupplier: s,
      };
    });
    return [compRow, ...supRows].filter((row) =>
      row.name.toLowerCase().includes(perfSearchTerm.toLowerCase())
    );
  }, [company?.name, suppliers, perfSearchTerm]);

  const approvedCount = suppliers.filter((s) => s.status === 'Approved').length;
  const pendingCount = suppliers.filter((s) => s.status === 'Pending Evaluation').length;

  const toggleSort = (field: 'name' | 'division' | 'category' | 'status') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="text-slate-800 font-bold">{company.name}</span>
            <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
              {company.plan || 'ACTIVE'}
            </span>
            {company.registrationNumber && (
              <span className="hidden sm:inline font-mono text-slate-400">• Reg: {company.registrationNumber}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name} — Supplier Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Approved supplier list (ASL) and vendor performance tracking.</p>
        </div>

        {activeTab === 'asl' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { setAiMode('import'); setAiGeneratedPreview([]); setIsAiModalOpen(true); }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>AI Import Supply List</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab('asl')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'asl' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Approved Suppliers List ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'performance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Supplier Performance Summary
        </button>
      </div>

      {/* TAB 1: ASL */}
      {activeTab === 'asl' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* KPI Stat Cards (Interactive: click to filter) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'ALL' : 'Approved')}
              className={`bg-white border rounded-xl p-4 flex items-center gap-3.5 shadow-xs cursor-pointer transition-all hover:border-blue-400 ${
                statusFilter === 'Approved' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{approvedCount}</div>
                <div className="text-xs text-slate-500 font-medium">Approved Suppliers</div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter(statusFilter === 'Pending Evaluation' ? 'ALL' : 'Pending Evaluation')}
              className={`bg-white border rounded-xl p-4 flex items-center gap-3.5 shadow-xs cursor-pointer transition-all hover:border-amber-400 ${
                statusFilter === 'Pending Evaluation' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{pendingCount}</div>
                <div className="text-xs text-slate-500 font-medium">Pending Evaluation</div>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter('ALL')}
              className={`bg-white border rounded-xl p-4 flex items-center gap-3.5 shadow-xs cursor-pointer transition-all hover:border-emerald-400 ${
                statusFilter === 'ALL' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 font-medium">Material Traceability</div>
              </div>
            </div>
          </div>

          {/* Search, Filter Pills & Export Bar */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 flex-wrap">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search vendor, division, category, email..."
                    className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                  {['ALL', 'Approved', 'Pending Evaluation', 'Conditional'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        statusFilter === status ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status.replace(' Evaluation', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Upload .csv, .xlsx, .pdf, or .docx"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import File</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUploadImport} accept=".csv,.xlsx,.xls,.pdf,.docx,.txt" className="hidden" />

                <button
                  onClick={handleExportASL}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* ASL Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16325c] text-white font-bold border-b border-[#0e223f]">
                    <th className="py-3 px-3.5 text-center w-10 whitespace-nowrap">#</th>
                    <th className="py-3 px-3.5 whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Supplier Name</span>
                        <ArrowUpDown className="w-3 h-3 opacity-70" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Physical Address</th>
                    <th className="py-3 px-3.5 whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort('division')}>
                      <div className="flex items-center gap-1">
                        <span>Division</span>
                        <ArrowUpDown className="w-3 h-3 opacity-70" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Contact Name</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Tel No.</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">E-mail</th>
                    <th className="py-3 px-3.5 whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort('category')}>
                      <div className="flex items-center gap-1">
                        <span>Commodity / Service</span>
                        <ArrowUpDown className="w-3 h-3 opacity-70" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 whitespace-nowrap cursor-pointer select-none" onClick={() => toggleSort('status')}>
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3 opacity-70" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400">
                        <p className="font-medium text-slate-600">No suppliers match your current filter.</p>
                        <button
                          onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                          className="mt-2 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((sup, idx) => (
                      <tr key={sup.id} className="hover:bg-slate-50/80 cursor-pointer transition-colors" onClick={() => setSelectedSupplier(sup)}>
                        <td className="py-3 px-3.5 font-semibold text-slate-400 text-center">{idx + 1}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                          <div>{sup.name}</div>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">{sup.code}</span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate" title={sup.address}>{sup.address || '—'}</td>
                        <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">{sup.division || '—'}</td>
                        <td className="py-3 px-3.5 text-slate-800 font-medium whitespace-nowrap">{sup.contactName || '—'}</td>
                        <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">{sup.telNo || '—'}</td>
                        <td className="py-3 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {sup.email ? (
                            <a href={`mailto:${sup.email}`} className="text-blue-600 hover:underline font-medium">{sup.email}</a>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">{sup.category || '—'}</td>
                        <td className="py-3 px-3.5 whitespace-nowrap"><StatusBadge status={sup.status} /></td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 text-slate-400">
                            <button onClick={() => setSelectedSupplier(sup)} className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded" title="View details">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEditModal(sup)} className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit supplier">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => handleDeleteSupplier(sup.id, e)} className="p-1 hover:text-red-600 hover:bg-red-50 rounded" title="Delete supplier">
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

      {/* TAB 2: Performance Summary */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-600 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compPrefix}-DC-009</span>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={perfSearchTerm}
                onChange={(e) => setPerfSearchTerm(e.target.value)}
                className="w-full sm:w-60 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Year</span>
                <div className="relative">
                  <select
                    value={perfYear}
                    onChange={(e) => setPerfYear(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 pr-7 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                Weights: Quality (40%), Delivery (30%), Communication (30%)
              </span>
            </div>

            <button
              onClick={() => {
                setIsRefreshingPerf(true);
                setTimeout(() => { setIsRefreshingPerf(false); showToast(`Updated metrics for ${perfYear}`); }, 400);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshingPerf ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Rating Scale Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
            <span className="flex items-center gap-1.5"><GradeBadge grade="A" /> 85–100% Excellent</span>
            <span className="flex items-center gap-1.5"><GradeBadge grade="B" /> 70–84% Acceptable</span>
            <span className="flex items-center gap-1.5"><GradeBadge grade="C" /> 0–69% Action Required</span>
          </div>

          {/* Performance Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#16325c] text-white font-bold border-b border-[#0e223f]">
                    <th className="py-3 px-3.5 text-center w-10">#</th>
                    <th className="py-3 px-3.5">Supplier Name</th>
                    <th className="py-3 px-3.5 text-center">Quality (40%)</th>
                    <th className="py-3 px-3.5 text-center">Delivery (30%)</th>
                    <th className="py-3 px-3.5 text-center">Communication (30%)</th>
                    <th className="py-3 px-3.5 text-center">Total</th>
                    <th className="py-3 px-3.5 text-center">Rating</th>
                    <th className="py-3 px-3.5 text-center">NCRs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {perfRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                      <td
                        className="py-3 px-3.5 font-semibold text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                        onClick={() => row.rawSupplier && setSelectedSupplier(row.rawSupplier)}
                      >
                        {row.name}
                      </td>
                      <td className="py-3 px-3.5 text-center"><ScoreCell score={row.qualityScore} barColor="bg-blue-500" /></td>
                      <td className="py-3 px-3.5 text-center"><ScoreCell score={row.deliveryScore} barColor="bg-indigo-500" /></td>
                      <td className="py-3 px-3.5 text-center"><ScoreCell score={row.communicationScore} barColor="bg-purple-500" /></td>
                      <td className="py-3 px-3.5 text-center font-bold text-slate-900">
                        {row.totalScore !== undefined ? `${row.totalScore}%` : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-center"><GradeBadge grade={row.ratingGrade} /></td>
                      <td className="py-3 px-3.5 text-center font-semibold text-slate-800">{row.ncrCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add / Edit Supplier */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsFormModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">{editingSupplierId ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 pt-3 text-xs">
              <FormInput label="Supplier Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. Acme Components Ltd" required />
              <FormInput label="Physical Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} placeholder="e.g. 14 Industrial Way, Germiston" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Division" value={formData.division} onChange={(v) => setFormData({ ...formData, division: v })} placeholder="e.g. Raw Materials" />
                <FormInput label="Commodity / Service" value={formData.commodity} onChange={(v) => setFormData({ ...formData, commodity: v })} placeholder="e.g. Raw Polymers" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Contact Person" value={formData.contactName} onChange={(v) => setFormData({ ...formData, contactName: v })} placeholder="e.g. David Miller" />
                <FormInput label="Telephone" value={formData.telNo} onChange={(v) => setFormData({ ...formData, telNo: v })} placeholder="e.g. +27 11 824 5500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="E-mail" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="orders@company.co.za" type="email" />
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Evaluation">Pending Evaluation</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Disqualified">Disqualified</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  {editingSupplierId ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Supplier Details */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedSupplier(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">{selectedSupplier.name}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {selectedSupplier.code}
                </span>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <StatusBadge status={selectedSupplier.status} />
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Rating Score</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSupplier.rating || 90}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Commodity / Service</span>
                  <span className="font-semibold text-slate-800">{selectedSupplier.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Division</span>
                  <span className="font-semibold text-slate-800">{selectedSupplier.division || '—'}</span>
                </div>
              </div>

              {selectedSupplier.address && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Address</span>
                    <span className="text-slate-800 font-medium">{selectedSupplier.address}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSupplier.contactName && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-400 block">Contact</span>
                    <span className="text-slate-800 font-semibold">{selectedSupplier.contactName}</span>
                  </div>
                )}
                {selectedSupplier.telNo && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block">Telephone</span>
                      <a href={`tel:${selectedSupplier.telNo}`} className="text-slate-800 font-mono hover:text-blue-600">
                        {selectedSupplier.telNo}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {selectedSupplier.email && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block">E-mail</span>
                    <a href={`mailto:${selectedSupplier.email}`} className="text-blue-600 font-medium hover:underline">
                      {selectedSupplier.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => openEditModal(selectedSupplier)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Supplier</span>
              </button>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI Import & Generator */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsAiModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">AI Supply List Generator & Smart Import</h3>
                  <p className="text-xs text-slate-500">Generate suppliers with ISO scopes or parse vendor text with AI.</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-100 rounded-xl text-xs max-w-xs font-semibold">
              <button
                type="button"
                onClick={() => setAiMode('generate')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  aiMode === 'generate' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate via AI</span>
              </button>
              <button
                type="button"
                onClick={() => setAiMode('import')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  aiMode === 'import' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Smart Import / Paste</span>
              </button>
            </div>

            {/* Mode Content */}
            <div className="mt-4 space-y-3.5 text-xs">
              {aiMode === 'generate' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Industry / Domain</label>
                      <select
                        value={aiIndustry}
                        onChange={(e) => setAiIndustry(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="Manufacturing & Raw Materials">Manufacturing & Raw Materials</option>
                        <option value="Logistics & Cold Chain Transport">Logistics & Cold Chain Transport</option>
                        <option value="Packaging & Paper Products">Packaging & Paper Products</option>
                        <option value="Precision Engineering & CNC Tooling">Precision Engineering & CNC Tooling</option>
                        <option value="Safety, PPE & Facility Services">Safety, PPE & Facility Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                      <div className="flex gap-2">
                        {[3, 4, 6, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setAiCount(num)}
                            className={`flex-1 py-2 font-bold rounded-xl border transition-all cursor-pointer ${
                              aiCount === num ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Custom Scope / Requirements (Optional)</label>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Suppliers located in Gauteng with ISO 9001 certified polymers"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Paste Text, Vendor List or CSV</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiRawText(`Atlas Pneumatics, 19 Steel Park Germiston, Engineering, Andre Venter, +27 11 873 2200, sales@atlaspneumatics.co.za, Hydraulic Seals, Approved\nHighveld Chemicals, 44 Petro Way Sasolburg, Raw Materials, Dr. Susan Marais, +27 16 976 1140, smarais@highveldchem.co.za, Industrial Solvents, Approved`)}
                        className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        Sample Data
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder="Paste unformatted text, CSV rows, or invoice vendor details here..."
                    className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:font-sans"
                  />
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleRunAiProcess()}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>{aiMode === 'generate' ? 'Generate with AI' : 'Parse with AI'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview */}
              {aiGeneratedPreview.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Preview ({aiGeneratedPreview.filter((s) => s.selected !== false).length} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiGeneratedPreview((prev) => prev.map((item) => ({ ...item, selected: !prev.every((p) => p.selected) })))}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      {aiGeneratedPreview.every((p) => p.selected) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {aiGeneratedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setAiGeneratedPreview((prev) => prev.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p)))}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                          item.selected !== false ? 'bg-white border-indigo-200 shadow-2xs' : 'bg-slate-100 border-slate-200 opacity-60'
                        }`}
                      >
                        <input type="checkbox" checked={item.selected !== false} onChange={() => {}} className="rounded text-indigo-600 cursor-pointer" />
                        <div className="flex-1 min-w-0 grid grid-cols-3 gap-2">
                          <div className="truncate font-bold text-slate-900">{item.name}</div>
                          <div className="truncate text-slate-600">{item.category}</div>
                          <div className="truncate text-slate-500 font-mono">{item.telNo}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setAiGeneratedPreview([])} className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer font-medium">
                      Clear
                    </button>
                    <button type="button" onClick={handleCommitAiSuppliers} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Import Selected</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
