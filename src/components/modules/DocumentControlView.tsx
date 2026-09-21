import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  X,
  Building,
  Upload,
} from 'lucide-react';
import { Company } from '../../types';

interface DocumentItem {
  id: string;
  docNumber: string;
  title: string;
  category: 'Quality Manual' | 'SOP' | 'Work Instruction' | 'Form' | 'Policy';
  revision: string;
  status: 'Approved' | 'In Review' | 'Draft';
  owner: string;
  approvedDate: string;
  nextReview: string;
  clause: string;
}

const initialDocuments: DocumentItem[] = [
  {
    id: '1',
    docNumber: 'NK-QM-001',
    title: 'ISO 9001:2015 Quality Manual & Scope',
    category: 'Quality Manual',
    revision: 'Rev 4.0',
    status: 'Approved',
    owner: 'Naveen V (Quality Lead)',
    approvedDate: '12-Jan-2026',
    nextReview: '12-Jan-2027',
    clause: 'Clause 4.3 & 4.4',
  },
  {
    id: '2',
    docNumber: 'NK-SOP-002',
    title: 'Control of Documented Information Procedure',
    category: 'SOP',
    revision: 'Rev 3.2',
    status: 'Approved',
    owner: 'Naveen V',
    approvedDate: '15-Feb-2026',
    nextReview: '15-Feb-2027',
    clause: 'Clause 7.5',
  },
  {
    id: '3',
    docNumber: 'NK-SOP-004',
    title: 'Internal Audit Program & Non-Conformance Procedure',
    category: 'SOP',
    revision: 'Rev 2.1',
    status: 'Approved',
    owner: 'Quality Dept',
    approvedDate: '01-Mar-2026',
    nextReview: '01-Mar-2027',
    clause: 'Clause 9.2 & 10.2',
  },
  {
    id: '4',
    docNumber: 'NK-WI-012',
    title: 'Work Instruction: Vernier Caliper & Gauge Verification',
    category: 'Work Instruction',
    revision: 'Rev 1.5',
    status: 'Approved',
    owner: 'Maintenance Lead',
    approvedDate: '20-May-2026',
    nextReview: '20-May-2027',
    clause: 'Clause 7.1.5',
  },
  {
    id: '5',
    docNumber: 'NK-FRM-018',
    title: 'Customer Satisfaction Survey Evaluation Form',
    category: 'Form',
    revision: 'Rev 1.0',
    status: 'In Review',
    owner: 'Sales & Support',
    approvedDate: 'Pending',
    nextReview: '30-Oct-2026',
    clause: 'Clause 9.1.2',
  },
  {
    id: '6',
    docNumber: 'NK-POL-001',
    title: 'Corporate Quality Policy Statement',
    category: 'Policy',
    revision: 'Rev 5.0',
    status: 'Approved',
    owner: 'Top Management',
    approvedDate: '05-Jan-2026',
    nextReview: '05-Jan-2027',
    clause: 'Clause 5.2',
  },
];

interface DocumentControlViewProps {
  company: Company;
}

export const DocumentControlView: React.FC<DocumentControlViewProps> = ({ company }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'SOP' as DocumentItem['category'],
    owner: 'Quality Dept',
    clause: 'Clause 7.5',
    revision: 'Rev 1.0',
  });

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const cleanTitle = baseName
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const item: DocumentItem = {
      id: Date.now().toString(),
      docNumber: `NK-SOP-00${documents.length + 1}`,
      title: `${cleanTitle} Procedure`,
      category: 'SOP',
      revision: 'Rev 1.0',
      status: 'Approved',
      owner: 'Quality Dept',
      approvedDate: '17-Sep-2026',
      nextReview: '17-Sep-2027',
      clause: 'Clause 7.5',
    };

    setDocuments([item, ...documents]);
    setUploadSuccessMsg(`Procedure "${file.name}" successfully uploaded and registered to Document Control!`);
    setTimeout(() => setUploadSuccessMsg(''), 4500);
    e.target.value = '';
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title.trim()) return;

    const prefix =
      newDoc.category === 'Quality Manual'
        ? 'NK-QM'
        : newDoc.category === 'SOP'
        ? 'NK-SOP'
        : newDoc.category === 'Work Instruction'
        ? 'NK-WI'
        : newDoc.category === 'Form'
        ? 'NK-FRM'
        : 'NK-POL';

    const item: DocumentItem = {
      id: Date.now().toString(),
      docNumber: `${prefix}-00${documents.length + 1}`,
      title: newDoc.title,
      category: newDoc.category,
      revision: newDoc.revision || 'Rev 1.0',
      status: 'Approved',
      owner: newDoc.owner || 'Quality Dept',
      approvedDate: '17-Sep-2026',
      nextReview: '17-Sep-2027',
      clause: newDoc.clause || 'Clause 7.5',
    };

    setDocuments([item, ...documents]);
    setNewDoc({
      title: '',
      category: 'SOP',
      owner: 'Quality Dept',
      clause: 'Clause 7.5',
      revision: 'Rev 1.0',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company?.name || 'nk'}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Control (ISO 9001:2015 Clause 7.5)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Master Document Register, versioning, approvals, and controlled distribution.
          </p>
        </div>

        {/* Action Controls Bar matching pinned screenshot */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b3557] hover:bg-[#142842] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Procedure</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 shadow-2xs transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-700" />
            <span>Upload Procedure</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search procedures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-60 pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {uploadSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{documents.length}</div>
            <div className="text-xs font-medium text-slate-500">Controlled Documents</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {documents.filter((d) => d.status === 'Approved').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Approved & Effective</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {documents.filter((d) => d.status === 'In Review').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending Review</div>
          </div>
        </div>
      </div>

      {/* Category Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Category Filter</span>
          <span className="text-slate-400 font-normal">
            ({filteredDocs.length} of {documents.length} procedures)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'Quality Manual', 'SOP', 'Work Instruction', 'Form', 'Policy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Master Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Doc Number</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Revision</th>
                <th className="py-3.5 px-4">ISO Clause</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Custodian</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No documents matching current search or filters.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                      {doc.docNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{doc.title}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700">
                      {doc.revision}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">{doc.clause}</td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.status === 'In Review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{doc.owner}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Opening controlled preview for ${doc.docNumber}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Create New Procedure</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedure Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Risk Assessment and Opportunity Procedure"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, category: e.target.value as DocumentItem['category'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="SOP">SOP (Procedure)</option>
                    <option value="Quality Manual">Quality Manual</option>
                    <option value="Work Instruction">Work Instruction</option>
                    <option value="Form">Form / Record</option>
                    <option value="Policy">Policy Statement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Revision
                  </label>
                  <input
                    type="text"
                    value={newDoc.revision}
                    onChange={(e) => setNewDoc({ ...newDoc, revision: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISO Clause</label>
                  <input
                    type="text"
                    placeholder="e.g. Clause 6.1, 7.5"
                    value={newDoc.clause}
                    onChange={(e) => setNewDoc({ ...newDoc, clause: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custodian</label>
                  <input
                    type="text"
                    placeholder="e.g. Quality Manager"
                    value={newDoc.owner}
                    onChange={(e) => setNewDoc({ ...newDoc, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1b3557] hover:bg-[#142842] text-white rounded-xl text-sm font-semibold shadow-xs cursor-pointer"
                >
                  Save Procedure to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
