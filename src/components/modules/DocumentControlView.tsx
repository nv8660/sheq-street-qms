import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  BookOpen,
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
  Book,
  Layers,
  Trash2,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Company } from '../../types';

export interface DocumentItem {
  id: string;
  docNumber: string;
  title: string;
  category: 'Quality Manual' | 'Work Instruction' | 'Form' | 'Policy' | 'Register' | 'SOP';
  revision: string;
  status: 'Approved' | 'In Review' | 'Draft';
  owner: string;
  approvedDate: string;
  nextReview: string;
  clause: string;
  author?: string;
  approver?: string;
  content?: string;
  revisionDate?: string;
  fileName?: string;
  fileData?: string;
  isOriginalFile?: boolean;
}

export interface ProcedureItem {
  id: string;
  docNumber: string;
  title: string;
  clause: string;
  revision: string;
  status: 'Approved' | 'In Review' | 'Draft';
  owner: string;
  approvedDate: string;
  nextReview: string;
}

// Initial 2 Procedures (matching screenshot badge 2)
const initialProceduresList: ProcedureItem[] = [
  {
    id: 'proc-1',
    docNumber: 'NK-SOP-001',
    title: 'Control of Documented Information Procedure',
    clause: 'Clause 7.5',
    revision: 'Rev 3.2',
    status: 'Approved',
    owner: 'Naveen V (Lead Auditor)',
    approvedDate: '15-Feb-2026',
    nextReview: '15-Feb-2027',
  },
  {
    id: 'proc-2',
    docNumber: 'NK-SOP-002',
    title: 'Non-Conformance, Root Cause & Corrective Action Procedure',
    clause: 'Clause 10.2',
    revision: 'Rev 2.1',
    status: 'Approved',
    owner: 'Quality Dept',
    approvedDate: '01-Mar-2026',
    nextReview: '01-Mar-2027',
  },
];

// Initial 22 Controlled Documents (matching screenshot badge 22)
const initialDocumentsList: DocumentItem[] = [
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
  {
    id: '3',
    docNumber: 'NK-POL-002',
    title: 'Environmental Management Policy',
    category: 'Policy',
    revision: 'Rev 2.0',
    status: 'Approved',
    owner: 'Top Management',
    approvedDate: '10-Jan-2026',
    nextReview: '10-Jan-2027',
    clause: 'Clause 5.2',
  },
  {
    id: '4',
    docNumber: 'NK-POL-003',
    title: 'Occupational Health and Safety Policy',
    category: 'Policy',
    revision: 'Rev 3.1',
    status: 'Approved',
    owner: 'SHEQ Lead',
    approvedDate: '14-Jan-2026',
    nextReview: '14-Jan-2027',
    clause: 'Clause 5.2',
  },
  {
    id: '5',
    docNumber: 'NK-WI-001',
    title: 'Work Instruction: Vernier Caliper & Micrometer Verification',
    category: 'Work Instruction',
    revision: 'Rev 1.5',
    status: 'Approved',
    owner: 'Maintenance Lead',
    approvedDate: '20-May-2026',
    nextReview: '20-May-2027',
    clause: 'Clause 7.1.5',
  },
  {
    id: '6',
    docNumber: 'NK-WI-002',
    title: 'Work Instruction: Incoming Raw Material Sampling & Release',
    category: 'Work Instruction',
    revision: 'Rev 2.0',
    status: 'Approved',
    owner: 'Quality Inspector',
    approvedDate: '04-Feb-2026',
    nextReview: '04-Feb-2027',
    clause: 'Clause 8.4',
  },
  {
    id: '7',
    docNumber: 'NK-WI-003',
    title: 'Work Instruction: Final Product Quality Release Protocol',
    category: 'Work Instruction',
    revision: 'Rev 2.2',
    status: 'Approved',
    owner: 'QA Manager',
    approvedDate: '18-Mar-2026',
    nextReview: '18-Mar-2027',
    clause: 'Clause 8.6',
  },
  {
    id: '8',
    docNumber: 'NK-WI-004',
    title: 'Work Instruction: Torque Wrench & Tool Calibration Check',
    category: 'Work Instruction',
    revision: 'Rev 1.2',
    status: 'Approved',
    owner: 'Tooling Supervisor',
    approvedDate: '22-Apr-2026',
    nextReview: '22-Apr-2027',
    clause: 'Clause 7.1.5',
  },
  {
    id: '9',
    docNumber: 'NK-WI-005',
    title: 'Work Instruction: Non-Conforming Material Quarantine Protocol',
    category: 'Work Instruction',
    revision: 'Rev 1.8',
    status: 'Approved',
    owner: 'Storekeeper & QA',
    approvedDate: '11-Jun-2026',
    nextReview: '11-Jun-2027',
    clause: 'Clause 8.7',
  },
  {
    id: '10',
    docNumber: 'NK-FRM-001',
    title: 'Customer Satisfaction Survey & Evaluation Form',
    category: 'Form',
    revision: 'Rev 1.0',
    status: 'Approved',
    owner: 'Sales & Support',
    approvedDate: '15-Jan-2026',
    nextReview: '15-Jan-2027',
    clause: 'Clause 9.1.2',
  },
  {
    id: '11',
    docNumber: 'NK-FRM-002',
    title: 'Internal Audit Checklist & Findings Report Form',
    category: 'Form',
    revision: 'Rev 3.0',
    status: 'Approved',
    owner: 'Audit Lead',
    approvedDate: '02-Feb-2026',
    nextReview: '02-Feb-2027',
    clause: 'Clause 9.2',
  },
  {
    id: '12',
    docNumber: 'NK-FRM-003',
    title: 'Non-Conformance & CAPA Root Cause 8D Report Form',
    category: 'Form',
    revision: 'Rev 2.4',
    status: 'Approved',
    owner: 'Quality Dept',
    approvedDate: '19-Feb-2026',
    nextReview: '19-Feb-2027',
    clause: 'Clause 10.2',
  },
  {
    id: '13',
    docNumber: 'NK-FRM-004',
    title: 'Supplier Performance Quarterly Evaluation Form',
    category: 'Form',
    revision: 'Rev 1.5',
    status: 'Approved',
    owner: 'Procurement',
    approvedDate: '05-Mar-2026',
    nextReview: '05-Mar-2027',
    clause: 'Clause 8.4',
  },
  {
    id: '14',
    docNumber: 'NK-FRM-005',
    title: 'Management Review Meeting Minutes & Actions Form',
    category: 'Form',
    revision: 'Rev 2.0',
    status: 'Approved',
    owner: 'SHEQ Lead',
    approvedDate: '12-Apr-2026',
    nextReview: '12-Apr-2027',
    clause: 'Clause 9.3',
  },
  {
    id: '15',
    docNumber: 'NK-FRM-006',
    title: 'Equipment Maintenance & Calibration Log Sheet',
    category: 'Form',
    revision: 'Rev 4.1',
    status: 'Approved',
    owner: 'Engineering',
    approvedDate: '18-May-2026',
    nextReview: '18-May-2027',
    clause: 'Clause 7.1.5',
  },
  {
    id: '16',
    docNumber: 'NK-FRM-007',
    title: 'Employee Training & Competency Record Form',
    category: 'Form',
    revision: 'Rev 1.3',
    status: 'Approved',
    owner: 'HR Administrator',
    approvedDate: '01-Jun-2026',
    nextReview: '01-Jun-2027',
    clause: 'Clause 7.2',
  },
  {
    id: '17',
    docNumber: 'NK-FRM-008',
    title: 'Change Request & Risk Analysis Form',
    category: 'Form',
    revision: 'Rev 1.1',
    status: 'Approved',
    owner: 'Quality Lead',
    approvedDate: '15-Jul-2026',
    nextReview: '15-Jul-2027',
    clause: 'Clause 6.3',
  },
  {
    id: '18',
    docNumber: 'NK-FRM-009',
    title: 'Customer Complaint & RMA Investigation Log Form',
    category: 'Form',
    revision: 'Rev 2.0',
    status: 'Approved',
    owner: 'Customer Service',
    approvedDate: '28-Jul-2026',
    nextReview: '28-Jul-2027',
    clause: 'Clause 9.1.2',
  },
  {
    id: '19',
    docNumber: 'NK-REG-001',
    title: 'Legal & Statutory Regulatory Compliance Register',
    category: 'Register',
    revision: 'Rev 3.0',
    status: 'Approved',
    owner: 'Compliance Officer',
    approvedDate: '08-Jan-2026',
    nextReview: '08-Jan-2027',
    clause: 'Clause 4.2',
  },
  {
    id: '20',
    docNumber: 'NK-REG-002',
    title: 'Risk and Opportunity Assessment Matrix Register',
    category: 'Register',
    revision: 'Rev 2.5',
    status: 'Approved',
    owner: 'Risk Committee',
    approvedDate: '16-Feb-2026',
    nextReview: '16-Feb-2027',
    clause: 'Clause 6.1',
  },
  {
    id: '21',
    docNumber: 'NK-REG-003',
    title: 'Approved Suppliers & Critical Vendors Register',
    category: 'Register',
    revision: 'Rev 4.0',
    status: 'Approved',
    owner: 'Procurement Lead',
    approvedDate: '02-Mar-2026',
    nextReview: '02-Mar-2027',
    clause: 'Clause 8.4',
  },
  {
    id: '22',
    docNumber: 'NK-REG-004',
    title: 'Master Monitoring & Measuring Equipment Register',
    category: 'Register',
    revision: 'Rev 3.8',
    status: 'Approved',
    owner: 'Calibration Officer',
    approvedDate: '20-Apr-2026',
    nextReview: '20-Apr-2027',
    clause: 'Clause 7.1.5',
  },
  {
    id: '23',
    docNumber: 'NK-REG-005',
    title: 'Parties & Issues List',
    category: 'Register',
    revision: '1',
    status: 'Approved',
    owner: 'SHEQ Lead',
    approvedDate: '16-Sept-2026',
    nextReview: '16-Sept-2027',
    clause: 'Clause 4.1 & 4.2',
  },
  {
    id: '24',
    docNumber: 'NK-REG-006',
    title: 'Risk Management Register',
    category: 'Register',
    revision: '1',
    status: 'Approved',
    owner: 'Risk Committee',
    approvedDate: '16-Sept-2026',
    nextReview: '16-Sept-2027',
    clause: 'Clause 6.1',
  },
];

interface DocumentControlViewProps {
  company: Company;
}

export const DocumentControlView: React.FC<DocumentControlViewProps> = ({ company }) => {
  // Navigation Sub-Tab: 'procedures' | 'documents' (matching pinned image, default 'documents')
  const [activeSubTab, setActiveSubTab] = useState<'procedures' | 'documents'>('documents');

  // Procedures State
  const [procedures, setProcedures] = useState<ProcedureItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_controlled_procedures');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialProceduresList;
  });

  // Documents State (Initial 24 documents matching screenshot)
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_controlled_documents_v2');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('sheq_controlled_documents');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed.length >= 24) return parsed;
      }
    } catch {}
    return initialDocumentsList;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcModalOpen, setIsProcModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Upload Choice Modal State (Matching Pinned Image)
  const [isUploadChoiceModalOpen, setIsUploadChoiceModalOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProcessingStep, setAiProcessingStep] = useState('');
  const [aiImportBanner, setAiImportBanner] = useState<string | null>(null);

  // Hidden File Inputs Refs
  const fileAsIsInputRef = useRef<HTMLInputElement | null>(null);
  const fileImportTextInputRef = useRef<HTMLInputElement | null>(null);

  const getTodayFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getAutoDocNumber = () => {
    const prefix = company?.name ? company.name.substring(0, 2).toUpperCase() : 'NK';
    return `${prefix}-DC-019`;
  };

  // New Document Form - Matching Pinned Image
  const [newDoc, setNewDoc] = useState({
    title: '',
    docNumber: 'NK-DC-019',
    isCustomDocNumber: false,
    category: 'Policy' as DocumentItem['category'],
    status: 'Draft' as DocumentItem['status'],
    revision: '0',
    revisionDate: '16-Sept-2026',
    author: '',
    approver: '',
    content: `# Document Title\n\n## 1. Purpose\n...`,
  });

  const handleOpenNewDocModal = () => {
    setNewDoc({
      title: '',
      docNumber: getAutoDocNumber(),
      isCustomDocNumber: false,
      category: 'Policy',
      status: 'Draft',
      revision: '0',
      revisionDate: getTodayFormatted(),
      author: '',
      approver: '',
      content: `# Document Title\n\n## 1. Purpose\n...`,
    });
    setIsModalOpen(true);
  };

  // New Procedure Form
  const [newProc, setNewProc] = useState({
    title: '',
    clause: 'Clause 7.5',
    revision: 'Rev 1.0',
    owner: 'Quality Lead',
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sheq_controlled_procedures', JSON.stringify(procedures));
    } catch {}
  }, [procedures]);

  useEffect(() => {
    try {
      localStorage.setItem('sheq_controlled_documents', JSON.stringify(documents));
      localStorage.setItem('sheq_controlled_documents_v2', JSON.stringify(documents));
    } catch {}
  }, [documents]);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredProcedures = procedures.filter(
    (proc) =>
      proc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Option 1: Upload File As-Is Handler
  const handleChooseFileAsIs = () => {
    fileAsIsInputRef.current?.click();
  };

  const handleFileAsIsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const cleanTitle = baseName
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const fileUrl = URL.createObjectURL(file);
    const dateFormatted = getTodayFormatted();

    if (activeSubTab === 'procedures') {
      const item: ProcedureItem = {
        id: Date.now().toString(),
        docNumber: `NK-SOP-00${procedures.length + 1}`,
        title: `${cleanTitle} Procedure`,
        clause: 'Clause 7.5',
        revision: '1',
        status: 'Approved',
        owner: 'Quality Dept',
        approvedDate: dateFormatted,
        nextReview: '16-Sept-2027',
      };
      setProcedures([item, ...procedures]);
      setUploadSuccessMsg(`Original file "${file.name}" saved as procedure in register.`);
    } else {
      const item: DocumentItem = {
        id: Date.now().toString(),
        docNumber: `NK-DOC-0${documents.length + 1}`,
        title: cleanTitle,
        category: 'Work Instruction',
        revision: '1',
        status: 'Approved',
        owner: 'Quality Assurance',
        approvedDate: dateFormatted,
        nextReview: '16-Sept-2027',
        clause: 'Clause 7.5',
        fileName: file.name,
        fileData: fileUrl,
        isOriginalFile: true,
      };
      setDocuments([item, ...documents]);
      setUploadSuccessMsg(`Original file "${file.name}" saved to register for viewing and downloading.`);
    }

    setIsUploadChoiceModalOpen(false);
    setTimeout(() => setUploadSuccessMsg(''), 5000);
    e.target.value = '';
  };

  // Option 2: Upload PDF & Import Text Handler (AI Reads Document and Imports into Template)
  const handleChoosePdfImportText = () => {
    fileImportTextInputRef.current?.click();
  };

  const handlePdfImportTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    setAiProcessingStep('AI reading document binary and parsing text layers...');

    try {
      let rawText = '';
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        rawText = await file.text();
      }

      setAiProcessingStep('Analyzing structure, ISO 9001 clauses, and populating template...');

      const res = await fetch('/api/ai-extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileContent: rawText,
          companyName: company?.name || 'NK Quality Systems',
        }),
      });

      const json = await res.json();
      const extracted = json?.data;

      const title =
        extracted?.title ||
        file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .split(/\s+/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

      const docNumber = extracted?.docNumber || getAutoDocNumber();
      const category = (extracted?.category as DocumentItem['category']) || 'Policy';
      const content =
        extracted?.content ||
        `# ${title}\n\n**Document Number:** ${docNumber}\n**Status:** Draft\n\n## 1. Purpose & Objectives\nImported from ${file.name} for revision.\n\n## 2. Scope\nStandardized operational compliance.\n\n## 3. Responsibilities\nSupervised by Quality Lead.`;

      setNewDoc({
        title,
        docNumber,
        isCustomDocNumber: true,
        category,
        status: 'Draft',
        revision: '0',
        revisionDate: getTodayFormatted(),
        author: extracted?.author || 'Quality Team',
        approver: extracted?.approver || 'Quality Lead',
        content,
      });

      setAiImportBanner(
        `AI successfully read "${file.name}" and imported the content into the editable template below. You can now revise the content and adjust details before saving.`
      );

      setIsUploadChoiceModalOpen(false);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to parse document with AI', err);
      const title = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .split(/\s+/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      setNewDoc({
        title,
        docNumber: getAutoDocNumber(),
        isCustomDocNumber: true,
        category: 'Policy',
        status: 'Draft',
        revision: '0',
        revisionDate: getTodayFormatted(),
        author: 'Quality Dept',
        approver: 'Quality Lead',
        content: `# ${title}\n\n## 1. Purpose & Objectives\nImported from ${file.name} for revision.\n\n## 2. Scope & Applicability\nAll departments and processes governed by this quality standard.\n\n## 3. Operational Requirements\n1. Review and edit imported parameters\n2. Authorize before release`,
      });

      setAiImportBanner(
        `Document "${file.name}" imported into template for revision. Please review and edit before saving.`
      );
      setIsUploadChoiceModalOpen(false);
      setIsModalOpen(true);
    } finally {
      setIsAiProcessing(false);
      setAiProcessingStep('');
      e.target.value = '';
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title.trim()) return;

    const docNum = newDoc.docNumber.trim() || getAutoDocNumber();

    const item: DocumentItem = {
      id: Date.now().toString(),
      docNumber: docNum,
      title: newDoc.title.trim(),
      category: newDoc.category,
      revision: newDoc.revision.startsWith('Rev') ? newDoc.revision : `Rev ${newDoc.revision}`,
      status: newDoc.status,
      owner: newDoc.author.trim() || newDoc.approver.trim() || 'Quality Dept',
      approvedDate: newDoc.status === 'Approved' ? newDoc.revisionDate : 'Pending Review',
      nextReview: '22-Sep-2027',
      clause: newDoc.category === 'Policy' ? 'Clause 5.2' : 'Clause 7.5',
      author: newDoc.author.trim(),
      approver: newDoc.approver.trim(),
      content: newDoc.content,
      revisionDate: newDoc.revisionDate,
    };

    setDocuments([item, ...documents]);
    setUploadSuccessMsg(`Document "${item.docNumber} - ${item.title}" successfully created and added to register.`);
    setIsModalOpen(false);
    setTimeout(() => setUploadSuccessMsg(''), 4500);
  };

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProc.title.trim()) return;

    const item: ProcedureItem = {
      id: Date.now().toString(),
      docNumber: `NK-SOP-00${procedures.length + 1}`,
      title: newProc.title,
      clause: newProc.clause || 'Clause 7.5',
      revision: newProc.revision || 'Rev 1.0',
      status: 'Approved',
      owner: newProc.owner || 'Quality Lead',
      approvedDate: '22-Sep-2026',
      nextReview: '22-Sep-2027',
    };

    setProcedures([item, ...procedures]);
    setNewProc({
      title: '',
      clause: 'Clause 7.5',
      revision: 'Rev 1.0',
      owner: 'Quality Lead',
    });
    setIsProcModalOpen(false);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Control (ISO 9001:2015 Clause 7.5)</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Master Document Register, versioning, procedures, approvals, and controlled distribution.
        </p>
      </div>

      {/* Sub Tabs: Procedures (2) and Documents (22) matching Pinned Image */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl gap-1 shadow-2xs">
        <button
          onClick={() => setActiveSubTab('procedures')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
            activeSubTab === 'procedures'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-700 hover:text-slate-900 font-medium'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeSubTab === 'procedures' ? 'text-slate-900' : 'text-[#16325c]'}`} />
          <span>Procedures</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#16325c] text-white">
            {procedures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('documents')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
            activeSubTab === 'documents'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-700 hover:text-slate-900 font-medium'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeSubTab === 'documents' ? 'text-slate-900' : 'text-slate-600'}`} />
          <span>Documents</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeSubTab === 'documents'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {documents.length}
          </span>
        </button>
      </div>

      {uploadSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{uploadSuccessMsg}</span>
        </div>
      )}

      {/* VIEW A: PROCEDURES TAB (Count 2) */}
      {activeSubTab === 'procedures' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Document Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">NK-DC-002</span>
          </div>

          {/* Procedures Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{procedures.length}</div>
                <div className="text-xs font-medium text-slate-500">Standard Operating Procedures</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {procedures.filter((p) => p.status === 'Approved').length}
                </div>
                <div className="text-xs font-medium text-slate-500">Approved & Effective</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">100%</div>
                <div className="text-xs font-medium text-slate-500">ISO 9001:2015 Coverage</div>
              </div>
            </div>
          </div>

          {/* Procedures Actions & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsProcModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b3557] hover:bg-[#142842] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>New Procedure</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadChoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-700" />
                <span>Upload Procedure</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search procedures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Procedures Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#16325c] text-white border-b border-[#0e223f] text-xs font-bold">
                  <tr>
                    <th className="py-3.5 px-4 text-white">#</th>
                    <th className="py-3.5 px-4 text-white">Procedure Number</th>
                    <th className="py-3.5 px-4 text-white">Procedure Title</th>
                    <th className="py-3.5 px-4 text-white">ISO Clause</th>
                    <th className="py-3.5 px-4 text-white text-center">Revision</th>
                    <th className="py-3.5 px-4 text-white">Custodian</th>
                    <th className="py-3.5 px-4 text-white text-center">Status</th>
                    <th className="py-3.5 px-4 text-white text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProcedures.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No procedures found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredProcedures.map((proc, idx) => (
                      <tr key={proc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs">
                          {proc.docNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{proc.title}</td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-600">{proc.clause}</td>
                        <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700 text-center">
                          {proc.revision}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{proc.owner}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            {proc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => alert(`Opening controlled procedure document ${proc.docNumber}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title="View Procedure"
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
        </div>
      )}

      {/* VIEW B: DOCUMENTS TAB (Count 22 matching screenshot) */}
      {activeSubTab === 'documents' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{documents.length}</div>
                <div className="text-xs font-medium text-slate-500">Master Controlled Documents</div>
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

          {/* Document Actions & Search Bar - Before Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleOpenNewDocModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b3557] hover:bg-[#142842] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>New Document</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadChoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-700" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Category Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Category Filter</span>
              <span className="text-slate-400 font-normal">
                ({filteredDocs.length} of {documents.length} documents)
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['ALL', 'Quality Manual', 'Work Instruction', 'Form', 'Policy', 'Register'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#16325c] text-white shadow-2xs'
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
                <thead className="bg-[#16325c] text-white border-b border-[#0e223f] text-xs font-bold">
                  <tr>
                    <th className="py-3.5 px-4 text-white">#</th>
                    <th className="py-3.5 px-4 text-white">Doc Number</th>
                    <th className="py-3.5 px-4 text-white">Title</th>
                    <th className="py-3.5 px-4 text-white">Category</th>
                    <th className="py-3.5 px-4 text-white text-center">Revision</th>
                    <th className="py-3.5 px-4 text-white">ISO Clause</th>
                    <th className="py-3.5 px-4 text-white text-center">Status</th>
                    <th className="py-3.5 px-4 text-white">Custodian</th>
                    <th className="py-3.5 px-4 text-white text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No documents matching current search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, idx) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 text-xs">
                          {doc.docNumber}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="text-left font-medium text-slate-900 hover:text-blue-700 inline-flex items-center gap-1.5 group cursor-pointer transition-colors"
                          >
                            <span>{doc.title}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700 text-center">
                          {doc.revision}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-mono">{doc.clause}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              doc.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : doc.status === 'In Review'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {doc.status === 'Approved' ? 'ACTIVE' : doc.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{doc.owner}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setPreviewDoc(doc)}
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
        </div>
      )}

      {/* Modal: Upload Choice Modal (Matching Pinned Image) */}
      {isUploadChoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Document</h2>
              <button
                type="button"
                onClick={() => setIsUploadChoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base font-normal mt-2.5 mb-6">
              How would you like to upload this document?
            </p>

            {/* Hidden native file pickers */}
            <input
              ref={fileAsIsInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls,.txt"
              className="hidden"
              onChange={handleFileAsIsChange}
            />
            <input
              ref={fileImportTextInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              className="hidden"
              onChange={handlePdfImportTextChange}
            />

            {/* Upload Choice Cards */}
            <div className="space-y-4">
              {/* Option 1: Upload File As-Is */}
              <button
                type="button"
                onClick={handleChooseFileAsIs}
                disabled={isAiProcessing}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-xs transition-all flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-slate-900 mb-1">Upload File As-Is</div>
                  <div className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Saves the original file (PDF, Word) into the register for viewing and downloading.
                  </div>
                </div>
              </button>

              {/* Option 2: Upload PDF & Import Text */}
              <button
                type="button"
                onClick={handleChoosePdfImportText}
                disabled={isAiProcessing}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/20 hover:shadow-xs transition-all flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-slate-900 mb-1">Upload PDF &amp; Import Text</div>
                  <div className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    AI reads the document and imports the content into the editable template for revision.
                  </div>
                </div>
              </button>
            </div>

            {/* AI Reading Loader Overlay */}
            {isAiProcessing && (
              <div className="absolute inset-0 bg-white/95 rounded-2xl backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">AI Reading Document</h3>
                <p className="text-xs text-slate-600 max-w-xs">{aiProcessingStep}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: New Document / Editable Template (Matching Pinned Image) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {aiImportBanner ? 'Revise Imported Document' : 'New Document'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setAiImportBanner(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Import Notification Banner */}
            {aiImportBanner && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-800">AI Document Import Ready</div>
                  <div className="text-emerald-700 mt-0.5">{aiImportBanner}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleAddDocument} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Document title..."
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-600 ring-2 ring-blue-500/20 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>

              {/* Document Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-900">
                    Document Number
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextCustom = !newDoc.isCustomDocNumber;
                      setNewDoc({
                        ...newDoc,
                        isCustomDocNumber: nextCustom,
                        docNumber: nextCustom ? newDoc.docNumber : getAutoDocNumber(),
                      });
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {newDoc.isCustomDocNumber ? 'Auto-Generate Number' : 'Use Custom Number'}
                  </button>
                </div>
                <input
                  type="text"
                  value={newDoc.docNumber}
                  onChange={(e) => setNewDoc({ ...newDoc, docNumber: e.target.value })}
                  readOnly={!newDoc.isCustomDocNumber}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-sm transition-all shadow-2xs font-mono ${
                    newDoc.isCustomDocNumber
                      ? 'bg-white border border-slate-300 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={newDoc.category}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, category: e.target.value as DocumentItem['category'] })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Policy">Policy</option>
                      <option value="Quality Manual">Quality Manual</option>
                      <option value="Work Instruction">Work Instruction</option>
                      <option value="Form">Form</option>
                      <option value="Register">Register</option>
                      <option value="SOP">SOP</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={newDoc.status}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, status: e.target.value as DocumentItem['status'] })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Review">In Review</option>
                      <option value="Approved">Approved</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Revision No. & Revision Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Revision No.
                  </label>
                  <input
                    type="text"
                    value={newDoc.revision}
                    onChange={(e) => setNewDoc({ ...newDoc, revision: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Revision Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newDoc.revisionDate}
                      onChange={(e) => setNewDoc({ ...newDoc, revisionDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs pr-10"
                    />
                    <Calendar className="w-4 h-4 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Author
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={newDoc.author}
                  onChange={(e) => setNewDoc({ ...newDoc, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>

              {/* Approver */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Approver
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={newDoc.approver}
                  onChange={(e) => setNewDoc({ ...newDoc, approver: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>

              {/* Content (Markdown — optional) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Content <span className="text-slate-500 font-normal text-xs">(Markdown — optional)</span>
                </label>
                <textarea
                  rows={6}
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs resize-y"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1b3557] hover:bg-[#142842] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {previewDoc.docNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {previewDoc.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      previewDoc.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : previewDoc.status === 'In Review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {previewDoc.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{previewDoc.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-100 bg-slate-50/70 -mx-6 px-6">
              <div>
                <span className="text-slate-500 font-medium block">Revision</span>
                <span className="font-semibold text-slate-800">{previewDoc.revision}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Date</span>
                <span className="font-semibold text-slate-800">
                  {previewDoc.revisionDate || previewDoc.approvedDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Author / Custodian</span>
                <span className="font-semibold text-slate-800">{previewDoc.author || previewDoc.owner}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Approver</span>
                <span className="font-semibold text-slate-800">{previewDoc.approver || 'Pending Approval'}</span>
              </div>
            </div>

            {/* Original File Download/View if uploaded as-is */}
            {previewDoc.fileName && (
              <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold truncate max-w-xs">{previewDoc.fileName}</span>
                  <span className="text-blue-600 text-[11px] font-medium">(Original file)</span>
                </div>
                {previewDoc.fileData && (
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            )}

            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Document Content
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {previewDoc.content || `# ${previewDoc.title}\n\n## 1. Scope & Purpose\nControlled document registered under ${previewDoc.clause}.\n\n## 2. Custodian\n${previewDoc.owner}`}
              </div>
            </div>

            <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create New Procedure */}
      {isProcModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Create New Procedure</h3>
              <button
                onClick={() => setIsProcModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProcedure} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedure Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Management Review Procedure"
                  value={newProc.title}
                  onChange={(e) => setNewProc({ ...newProc, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISO Clause</label>
                  <input
                    type="text"
                    placeholder="e.g. Clause 9.3"
                    value={newProc.clause}
                    onChange={(e) => setNewProc({ ...newProc, clause: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Revision
                  </label>
                  <input
                    type="text"
                    value={newProc.revision}
                    onChange={(e) => setNewProc({ ...newProc, revision: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custodian / Owner</label>
                <input
                  type="text"
                  placeholder="e.g. Quality Lead"
                  value={newProc.owner}
                  onChange={(e) => setNewProc({ ...newProc, owner: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProcModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1b3557] hover:bg-[#142842] text-white rounded-xl text-sm font-semibold shadow-xs cursor-pointer"
                >
                  Save Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
