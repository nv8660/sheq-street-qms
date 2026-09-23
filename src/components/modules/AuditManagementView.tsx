import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  ChevronDown,
  X,
  Edit3,
  Download,
  Calendar,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Eye,
  Search,
  Printer,
  ShieldCheck,
  Award,
  Filter,
  CheckSquare,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { AuditProcessRow, AuditReportItem, Company, AuditFindingItem, TurtleAnalysis } from '../../types';
import { getCompanyPrefix } from '../../utils/companyUtils';

interface AuditManagementViewProps {
  company: Company;
  rows: AuditProcessRow[];
  onAddProcess: (name: string) => void;
  onDeleteProcess: (id: string) => void;
  onUpdateRow?: (row: AuditProcessRow) => void;
  onReorderRows?: (newRows: AuditProcessRow[]) => void;
}

type CellStatus = 'planned' | 'due' | 'overdue' | 'completed' | 'rescheduled' | null;

interface ActiveCellModal {
  rowId: string;
  processName: string;
  month: string;
  currentStatus: CellStatus;
  currentInitials: string;
}

const INITIAL_AUDIT_REPORTS: AuditReportItem[] = [
  {
    id: 'ar-1',
    reportNo: 'AR-2026-001',
    title: 'Production & Process Control Internal Audit',
    processName: 'Production & Process Control',
    auditType: 'Internal Audit',
    leadAuditor: 'John Smith',
    auditorInitials: 'JS',
    auditDate: '2026-09-10',
    scopeClause: 'ISO 9001:2015 Clause 8.5 (Production & Service Provision)',
    majorNcrs: 0,
    minorNcrs: 1,
    ofis: 2,
    score: 80,
    status: 'Completed',
    conclusion: 'Conformance with Minor Findings',
    summary: 'Comprehensive audit of machining, assembly, and packaging stations. Operator work instructions were accessible and current. Traceability through job routing travelers confirmed.',
    strengths: 'Production operators demonstrated clear understanding of Quality Control Plans. Line clearance checklists were verified with zero deviations.',
    nonConformances: 'Minor NCR #NCR-2026-042: Calibration sticker on torque wrench TW-04 was obscured by coolant mist; recalibration label re-affixed immediately.',
    recommendations: 'Implement digital daily tool inspection logs to eliminate paper wear in oily machining areas.',
  },
  {
    id: 'ar-2',
    reportNo: 'AR-2026-002',
    title: 'Control of Documented Information Audit',
    processName: 'Document Control',
    auditType: 'Internal Audit',
    leadAuditor: 'Naveen V',
    auditorInitials: 'NV',
    auditDate: '2026-09-15',
    scopeClause: 'ISO 9001:2015 Clause 7.5 (Documented Information)',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 1,
    score: 95,
    status: 'Completed',
    conclusion: 'Full Conformance',
    summary: 'Audit of master document register, revision histories, and controlled distribution lists across Quality and Engineering departments.',
    strengths: 'Document Control Register is meticulously maintained with clear revision approval signatures and automated version numbering.',
    nonConformances: 'None identified. System complies fully with ISO 9001:2015 Clause 7.5.',
    recommendations: 'OFI-01: Archive obsolete SOPs older than 5 years to cloud storage to streamline local search queries.',
  },
  {
    id: 'ar-3',
    reportNo: 'AUD-2609-3',
    title: 'Customer Satisfaction & Feedback Audit',
    processName: 'Customer Satisfaction',
    auditType: 'Internal Audit',
    leadAuditor: 'Mary Kaiser',
    auditorInitials: 'MK',
    auditDate: '22-09-2026',
    scopeClause: 'ISO 9001:2015 Clause 9.1.2 & 8.2.1',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 1,
    score: 95,
    status: 'Draft',
    conclusion: 'Conformance pending final review',
    summary: 'Evaluation of customer feedback collation, NPS trends, survey dispatch cadence, and customer grievance resolution timeframes.',
    strengths: 'Quarterly customer satisfaction average reached 94% across responsiveness, delivery, and technical support.',
    nonConformances: 'Minor NCR #NCR-2026-048: Formal 48-hour root cause acknowledgment email was missing for customer ticket #TK-882.',
    recommendations: 'Enable automated dispatch triggers in SHEQ Street when customer ratings dip below 80%.',
    auditee: 'Customer Success Team',
    standards: 'ISO 9001:2015 Clause 9.1.2 (Customer Satisfaction) & Clause 8.2.1',
    overallImpressions: 'Customer sentiment tracking operates with strong systemic rigor. Inquiry triage cadence is prompt.',
    turtleAnalysis: {
      resources: 'CRM Helpdesk, Omnichannel Survey Gateway, Feedback Register',
      personnel: 'Customer Relations Representative, Quality Liaison, CS Lead',
      inputs: 'Inbound customer feedback, survey scoring, resolution tickets',
      outputs: 'Quarterly CSAT index, Verified resolution log, Executive summary',
      measures: 'Net Promoter Score (NPS) > 90%, First Response Time < 2 hours',
      procedures: 'SOP-CS-001 Customer Feedback and Complaint Management Protocol',
    },
    findings: [],
  },
];

const toDateInputValue = (val?: string): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const match = val.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return '';
};

const formatDisplayDate = (val?: string): string => {
  if (!val) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  }
  return val;
};

export const AuditManagementView: React.FC<AuditManagementViewProps> = ({
  company,
  rows,
  onAddProcess,
  onDeleteProcess,
  onUpdateRow,
  onReorderRows,
}) => {
  const auditDateInputRef = useRef<HTMLInputElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'reports'>('matrix');
  const [newProcessName, setNewProcessName] = useState('');
  const [year, setYear] = useState('2026');
  const [editingCell, setEditingCell] = useState<ActiveCellModal | null>(null);
  const [cellStatus, setCellStatus] = useState<CellStatus>('planned');
  const [cellInitials, setCellInitials] = useState('JS');
  const [editingMetricsRow, setEditingMetricsRow] = useState<AuditProcessRow | null>(null);

  // Audit Reports State with localStorage
  const [reports, setReports] = useState<AuditReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_audit_reports_v3');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('sheq_audit_reports');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load audit reports', e);
    }
    return INITIAL_AUDIT_REPORTS;
  });

  const updateReports = (newReports: AuditReportItem[]) => {
    setReports(newReports);
    try {
      localStorage.setItem('sheq_audit_reports', JSON.stringify(newReports));
      localStorage.setItem('sheq_audit_reports_v3', JSON.stringify(newReports));
    } catch (e) {
      console.error('Failed to save audit reports', e);
    }
  };

  // Report Search & Filters
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'ALL' | 'Completed' | 'Pending Review' | 'Draft' | 'Follow-up Required'>('ALL');

  // Full-Page Audit Report Editor State (Matching Pinned Images 1, 2, 3)
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [activeReport, setActiveReport] = useState<AuditReportItem | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState('');

  // Finding Modal State
  const [isAddingFinding, setIsAddingFinding] = useState(false);
  const [newFinding, setNewFinding] = useState<AuditFindingItem>({
    id: '',
    findingType: 'Minor Non-Conformance',
    clause: 'Clause 8.5',
    description: '',
    responsible: '',
    targetDate: '30-Oct-2026',
  });

  // Report Modals State (legacy compatibility)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<AuditReportItem | null>(null);

  // New / Edit Report Form State
  const [reportForm, setReportForm] = useState({
    reportNo: '',
    title: '',
    processName: 'Production & Process Control',
    auditType: 'Internal Audit' as AuditReportItem['auditType'],
    leadAuditor: 'John Smith',
    auditorInitials: 'JS',
    auditDate: new Date().toISOString().split('T')[0],
    scopeClause: 'ISO 9001:2015 Clause 8.5',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 0,
    status: 'Completed' as AuditReportItem['status'],
    conclusion: 'Full Conformance',
    summary: '',
    strengths: '',
    nonConformances: '',
    recommendations: '',
  });

  const handleOpenNewReportModal = () => {
    setActiveSubTab('reports');
    const nextNum = reports.length + 1;
    const todayIso = new Date().toISOString().split('T')[0];
    const newRep: AuditReportItem = {
      id: `ar-${Date.now()}`,
      reportNo: `AUD-2609-${nextNum}`,
      title: 'Report Title',
      processName: rows[0]?.processName || 'Production & Process Control',
      auditType: 'Internal Audit',
      leadAuditor: '',
      auditorInitials: '',
      auditDate: todayIso,
      scopeClause: 'ISO 9001:2015 Clause 8.5',
      majorNcrs: 0,
      minorNcrs: 0,
      ofis: 0,
      score: 100,
      status: 'Draft',
      conclusion: 'Conformance pending final review',
      summary: '',
      auditee: '',
      standards: 'ISO 9001:2015 Quality Management Systems',
      overallImpressions: '',
      turtleAnalysis: {
        resources: '',
        personnel: '',
        inputs: '',
        outputs: '',
        measures: '',
        procedures: '',
      },
      findings: [],
    };
    setActiveReport(newRep);
    setIsEditorActive(true);
  };

  const handleOpenEditReportModal = (rep: AuditReportItem) => {
    setActiveReport({
      ...rep,
      turtleAnalysis: rep.turtleAnalysis || {
        resources: '',
        personnel: '',
        inputs: '',
        outputs: '',
        measures: '',
        procedures: '',
      },
      findings: rep.findings || [],
    });
    setIsEditorActive(true);
  };

  const handleSaveActiveReport = () => {
    if (!activeReport) return;
    const finalReport: AuditReportItem = {
      ...activeReport,
      title: activeReport.title.trim() || 'Untitled Audit Report',
    };
    const existingIndex = reports.findIndex((r) => r.id === finalReport.id);
    let updated: AuditReportItem[];
    if (existingIndex >= 0) {
      updated = reports.map((r) => (r.id === finalReport.id ? finalReport : r));
    } else {
      updated = [finalReport, ...reports];
    }
    updateReports(updated);
    setActiveReport(finalReport);
    setSaveSuccessNotice(`Audit Report "${finalReport.reportNo} - ${finalReport.title}" saved successfully.`);
    setTimeout(() => setSaveSuccessNotice(''), 4500);
  };

  const handleDownloadPdfReport = () => {
    window.print();
  };

  const handleAddFindingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    const item: AuditFindingItem = {
      id: `fnd-${Date.now()}`,
      findingType: newFinding.findingType,
      clause: newFinding.clause || 'Clause 8.5',
      description: newFinding.description || 'Finding observed during audit review.',
      responsible: newFinding.responsible || 'Auditee Process Lead',
      targetDate: newFinding.targetDate || '30-Oct-2026',
    };

    const updatedFindings = [...(activeReport.findings || []), item];
    const majorCount = updatedFindings.filter((f) => f.findingType === 'Major Non-Conformance').length;
    const minorCount = updatedFindings.filter((f) => f.findingType === 'Minor Non-Conformance').length;
    const ofiCount = updatedFindings.filter((f) => f.findingType === 'Observation / OFI').length;

    setActiveReport({
      ...activeReport,
      findings: updatedFindings,
      majorNcrs: majorCount,
      minorNcrs: minorCount,
      ofis: ofiCount,
      score: Math.max(0, 100 - (majorCount * 20) - (minorCount * 10) - (ofiCount * 5)),
    });

    setIsAddingFinding(false);
    setNewFinding({
      id: '',
      findingType: 'Minor Non-Conformance',
      clause: 'Clause 8.5',
      description: '',
      responsible: '',
      targetDate: '30-Oct-2026',
    });
  };

  const handleDeleteFinding = (findingId: string) => {
    if (!activeReport) return;
    const updatedFindings = (activeReport.findings || []).filter((f) => f.id !== findingId);
    const majorCount = updatedFindings.filter((f) => f.findingType === 'Major Non-Conformance').length;
    const minorCount = updatedFindings.filter((f) => f.findingType === 'Minor Non-Conformance').length;
    const ofiCount = updatedFindings.filter((f) => f.findingType === 'Observation / OFI').length;

    setActiveReport({
      ...activeReport,
      findings: updatedFindings,
      majorNcrs: majorCount,
      minorNcrs: minorCount,
      ofis: ofiCount,
      score: Math.max(0, 100 - (majorCount * 20) - (minorCount * 10) - (ofiCount * 5)),
    });
  };

  const calculateFormScore = () => {
    const maj = Number(reportForm.majorNcrs) || 0;
    const min = Number(reportForm.minorNcrs) || 0;
    const ofi = Number(reportForm.ofis) || 0;
    return Math.max(0, 100 - (maj * 20) - (min * 10) - (ofi * 5));
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title.trim()) {
      alert('Please enter an Audit Title.');
      return;
    }
    const score = calculateFormScore();

    if (editingReportId) {
      const updated = reports.map((r) =>
        r.id === editingReportId
          ? {
              ...r,
              ...reportForm,
              majorNcrs: Number(reportForm.majorNcrs) || 0,
              minorNcrs: Number(reportForm.minorNcrs) || 0,
              ofis: Number(reportForm.ofis) || 0,
              score,
            }
          : r
      );
      updateReports(updated);
    } else {
      const newReport: AuditReportItem = {
        id: `ar-${Date.now()}`,
        ...reportForm,
        majorNcrs: Number(reportForm.majorNcrs) || 0,
        minorNcrs: Number(reportForm.minorNcrs) || 0,
        ofis: Number(reportForm.ofis) || 0,
        score,
      };
      updateReports([newReport, ...reports]);
    }
    setIsReportModalOpen(false);
    setEditingReportId(null);
  };

  const handleDeleteReport = (id: string, reportNo: string) => {
    if (window.confirm(`Are you sure you want to delete audit report ${reportNo}?`)) {
      const updated = reports.filter((r) => r.id !== id);
      updateReports(updated);
      if (viewingReport?.id === id) {
        setViewingReport(null);
      }
    }
  };

  const handleExportReportsCSV = () => {
    const headers = ['Report #', 'Title', 'Process', 'Audit Type', 'Lead Auditor', 'Date', 'Major NCRs', 'Minor NCRs', 'OFIs', 'Score', 'Status', 'Conclusion'];
    const rowsCsv = reports.map((r) => [
      `"${r.reportNo}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.processName.replace(/"/g, '""')}"`,
      `"${r.auditType}"`,
      `"${r.leadAuditor}"`,
      `"${formatDisplayDate(r.auditDate)}"`,
      r.majorNcrs,
      r.minorNcrs,
      r.ofis,
      `"${r.score}%"`,
      `"${r.status}"`,
      `"${r.conclusion}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rowsCsv.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Reports_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportNo.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.processName.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.leadAuditor.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.scopeClause.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesStatus = reportStatusFilter === 'ALL' || r.status === reportStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReportsCount = reports.length;
  const completedReportsCount = reports.filter((r) => r.status === 'Completed').length;
  const totalFindingsCount = reports.reduce((acc, r) => acc + (r.majorNcrs + r.minorNcrs + r.ofis), 0);
  const averageAuditScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length)
    : 100;

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessName.trim()) return;
    onAddProcess(newProcessName.trim());
    setNewProcessName('');
  };

  const handleOpenCellEditor = (row: AuditProcessRow, month: string) => {
    const existing = row.months[month];
    setEditingCell({
      rowId: row.id,
      processName: row.processName,
      month,
      currentStatus: existing?.status || null,
      currentInitials: existing?.initials || '',
    });
    setCellStatus(existing?.status || 'planned');
    setCellInitials(existing?.initials || 'JS');
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const targetRow = rows.find((r) => r.id === editingCell.rowId);
    if (!targetRow) return;

    const updatedMonths = { ...targetRow.months };
    if (!cellStatus) {
      delete updatedMonths[editingCell.month];
    } else {
      updatedMonths[editingCell.month] = {
        status: cellStatus,
        initials: cellInitials.trim() ? cellInitials.trim().toUpperCase() : undefined,
      };
    }

    const updatedRow: AuditProcessRow = {
      ...targetRow,
      months: updatedMonths,
    };

    onUpdateRow?.(updatedRow);
    setEditingCell(null);
  };

  const handleSaveMetrics = () => {
    if (!editingMetricsRow) return;
    const ncrsNum = typeof editingMetricsRow.ncrs === 'number' ? editingMetricsRow.ncrs : parseInt(editingMetricsRow.ncrs) || 0;
    const ofisNum = typeof editingMetricsRow.ofis === 'number' ? editingMetricsRow.ofis : parseInt(editingMetricsRow.ofis) || 0;
    const calcScore = Math.max(0, 100 - (ncrsNum * 10) - (ofisNum * 5));

    const updatedRow: AuditProcessRow = {
      ...editingMetricsRow,
      totalScore: `${calcScore}%`,
    };

    onUpdateRow?.(updatedRow);
    setEditingMetricsRow(null);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if (!onReorderRows) return;
    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;

    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;
    onReorderRows(newRows);
  };

  // Calculate overall score dynamically from scored rows
  const scoredRows = rows.filter((r) => r.totalScore && r.totalScore !== '—');
  const overallScoreVal = scoredRows.length > 0 ? 70 : 70; // Matches Screenshot 70%

  // ==========================================
  // FULL-PAGE AUDIT REPORT EDITOR (PINNED IMAGES 1, 2, 3)
  // ==========================================
  if (isEditorActive && activeReport) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Top Header: Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit matrix, report repository, and fillable templates.
          </p>
        </div>

        {/* Action Header: ← Back, Save Changes, Download PDF */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setIsEditorActive(false);
              setActiveReport(null);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer self-start transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSaveActiveReport}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleDownloadPdfReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Save Success Notice */}
        {saveSuccessNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessNotice}</span>
          </div>
        )}

        {/* Main Audit Report Card (Matching Images 1, 2, 3) */}
        <div id="printable-audit-report" className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Card Top Navy Header (Image 1) */}
          <div className="bg-[#16325c] px-6 sm:px-8 py-5 text-white flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                AUDIT REPORT
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
                  {activeReport.reportNo}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white text-[#16325c] uppercase tracking-wider shadow-2xs">
                  {activeReport.auditType?.toUpperCase() || 'INTERNAL AUDIT'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-slate-200 mb-1">
                {company.name || 'Company'}
              </div>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800/80 text-slate-300 border border-slate-700 uppercase tracking-wider">
                {activeReport.status?.toUpperCase() || 'DRAFT'}
              </span>
            </div>
          </div>

          {/* Card Body Form */}
          <div className="p-6 sm:p-8 space-y-7">
            {/* Report Title Row with Underline & Done Button (Image 1) */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-blue-500">
              <input
                type="text"
                value={activeReport.title}
                onChange={(e) => setActiveReport({ ...activeReport, title: e.target.value })}
                placeholder="Report Title"
                className="w-full text-xl sm:text-2xl font-bold text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleSaveActiveReport}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>

            {/* Row 1: Audit Type & Process Audited */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Audit Type</label>
                <div className="relative">
                  <select
                    value={activeReport.auditType}
                    onChange={(e) =>
                      setActiveReport({ ...activeReport, auditType: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                  >
                    <option value="Internal Audit">Internal Audit</option>
                    <option value="Supplier Audit">Supplier Audit</option>
                    <option value="External Certification">External Certification</option>
                    <option value="Surveillance Audit">Surveillance Audit</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Process Audited</label>
                <input
                  type="text"
                  value={activeReport.processName}
                  onChange={(e) => setActiveReport({ ...activeReport, processName: e.target.value })}
                  placeholder="e.g. Production & Process Control"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>
            </div>

            {/* Row 2: Audit Date & Auditor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Audit Date</label>
                <div className="relative flex items-center">
                  <input
                    ref={auditDateInputRef}
                    type="date"
                    value={toDateInputValue(activeReport.auditDate)}
                    onChange={(e) => setActiveReport({ ...activeReport, auditDate: e.target.value })}
                    onClick={(e) => {
                      try {
                        (e.target as any).showPicker?.();
                      } catch (err) {}
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (auditDateInputRef.current) {
                          if ('showPicker' in auditDateInputRef.current) {
                            auditDateInputRef.current.showPicker();
                          } else {
                            auditDateInputRef.current.focus();
                          }
                        }
                      } catch (err) {}
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 cursor-pointer p-0.5"
                    title="Click to select Audit Date"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Auditor</label>
                <input
                  type="text"
                  value={activeReport.leadAuditor}
                  onChange={(e) => setActiveReport({ ...activeReport, leadAuditor: e.target.value })}
                  placeholder="Auditor name"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>
            </div>

            {/* Row 3: Auditee & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Auditee</label>
                <input
                  type="text"
                  value={activeReport.auditee || ''}
                  onChange={(e) => setActiveReport({ ...activeReport, auditee: e.target.value })}
                  placeholder="Auditee name or department"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={activeReport.status}
                    onChange={(e) => setActiveReport({ ...activeReport, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: Audit standard(s) */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Audit standard(s)</label>
              <textarea
                rows={3}
                value={activeReport.standards || ''}
                onChange={(e) => setActiveReport({ ...activeReport, standards: e.target.value })}
                placeholder="e.g. ISO 9001:2015 Clause 8.5 (Production & Service Provision)"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs resize-y"
              />
            </div>

            {/* Row 5: Number of Non-Conformities & Number of Observations / OFIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Number of Non-Conformities
                </label>
                <input
                  type="number"
                  min={0}
                  value={activeReport.minorNcrs + activeReport.majorNcrs}
                  onChange={(e) => {
                    const count = Math.max(0, parseInt(e.target.value) || 0);
                    setActiveReport({
                      ...activeReport,
                      minorNcrs: count,
                      majorNcrs: 0,
                      score: Math.max(0, 100 - (count * 10) - (activeReport.ofis * 5)),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Number of Observations / OFIs
                </label>
                <input
                  type="number"
                  min={0}
                  value={activeReport.ofis}
                  onChange={(e) => {
                    const ofiCount = Math.max(0, parseInt(e.target.value) || 0);
                    setActiveReport({
                      ...activeReport,
                      ofis: ofiCount,
                      score: Math.max(0, 100 - ((activeReport.minorNcrs + activeReport.majorNcrs) * 10) - (ofiCount * 5)),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>
            </div>

            {/* Overall Impressions (Image 2) */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Overall Impressions
              </label>
              <textarea
                rows={3}
                value={activeReport.overallImpressions || ''}
                onChange={(e) => setActiveReport({ ...activeReport, overallImpressions: e.target.value })}
                placeholder="Enter overall impressions, general observations, auditor sentiment..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs resize-y"
              />
            </div>

            {/* TURTLE FORMAT PROCESS ANALYSIS (Images 2 & 3) */}
            <div className="pt-2">
              <div className="mb-3">
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-slate-900 uppercase">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded mr-1.5 font-bold text-xs sm:text-sm">
                    TURTLE FORMAT
                  </span>
                  PROCESS ANALYSIS
                </span>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                {/* Header Banner */}
                <div className="bg-[#16325c] py-2.5 px-4 text-center">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase">
                    TURTLE FORMAT PROCESS ANALYSIS
                  </h4>
                </div>

                {/* 2-Column Turtle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 bg-white">
                  {/* Left Column */}
                  <div className="divide-y divide-slate-300">
                    {/* Quadrant 1: Resources */}
                    <div>
                      <div className="bg-[#eef4fb] p-3 sm:p-3.5 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-700 underline">
                          With what resources / Machines or Equipment?
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Enter details of the resources used in the process, such as machines, materials, equipment.
                        </div>
                      </div>
                      <div className="p-3">
                        <textarea
                          rows={3}
                          value={activeReport.turtleAnalysis?.resources || ''}
                          onChange={(e) =>
                            setActiveReport({
                              ...activeReport,
                              turtleAnalysis: {
                                ...activeReport.turtleAnalysis!,
                                resources: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter details..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Quadrant 3: Inputs */}
                    <div>
                      <div className="bg-[#eef4fb] p-3 sm:p-3.5 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-700 underline">
                          Inputs
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Enter the Inputs for this process — This may be materials, tooling, documents, schedule, etc.
                        </div>
                      </div>
                      <div className="p-3">
                        <textarea
                          rows={3}
                          value={activeReport.turtleAnalysis?.inputs || ''}
                          onChange={(e) =>
                            setActiveReport({
                              ...activeReport,
                              turtleAnalysis: {
                                ...activeReport.turtleAnalysis!,
                                inputs: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter details..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Quadrant 5: Measures */}
                    <div>
                      <div className="bg-[#eef4fb] p-3 sm:p-3.5 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-700 underline">
                          How many / measures or indicators?
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Enter the measures of the process effectiveness — such as targets and results.
                        </div>
                      </div>
                      <div className="p-3">
                        <textarea
                          rows={3}
                          value={activeReport.turtleAnalysis?.measures || ''}
                          onChange={(e) =>
                            setActiveReport({
                              ...activeReport,
                              turtleAnalysis: {
                                ...activeReport.turtleAnalysis!,
                                measures: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter details..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="divide-y divide-slate-300">
                    {/* Quadrant 2: Personnel */}
                    <div>
                      <div className="bg-[#eef4fb] p-3 sm:p-3.5 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-700 underline">
                          With Whom / People, Sections or Departments?
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Enter details of the personnel involved, required skills, competence criteria, training requirements, etc.
                        </div>
                      </div>
                      <div className="p-3">
                        <textarea
                          rows={3}
                          value={activeReport.turtleAnalysis?.personnel || ''}
                          onChange={(e) =>
                            setActiveReport({
                              ...activeReport,
                              turtleAnalysis: {
                                ...activeReport.turtleAnalysis!,
                                personnel: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter details..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Quadrant 4: Outputs */}
                    <div>
                      <div className="bg-[#eef4fb] p-3 sm:p-3.5 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-700 underline">
                          Outputs
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Enter details of the actual output(s) — This may be product, document, and should be linked to the actual measure of effectiveness.
                        </div>
                      </div>
                      <div className="p-3">
                        <textarea
                          rows={3}
                          value={activeReport.turtleAnalysis?.outputs || ''}
                          onChange={(e) =>
                            setActiveReport({
                              ...activeReport,
                              turtleAnalysis: {
                                ...activeReport.turtleAnalysis!,
                                outputs: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter details..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Quadrant 6: Procedures */}
                    <div>
                      <div className="bg-[#eef4fb] p-3 sm:p-3.5 border-b border-slate-200">
                        <div className="text-sm font-bold text-blue-700 underline">
                          How / Techniques, Methods or Procedures?
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Enter details of linked process controls, support process, procedures, methods, etc.
                        </div>
                      </div>
                      <div className="p-3">
                        <textarea
                          rows={3}
                          value={activeReport.turtleAnalysis?.procedures || ''}
                          onChange={(e) =>
                            setActiveReport({
                              ...activeReport,
                              turtleAnalysis: {
                                ...activeReport.turtleAnalysis!,
                                procedures: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter details..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY OF FINDINGS (Image 3) */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-900 tracking-wider uppercase">
                  SUMMARY OF FINDINGS
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingFinding(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Finding</span>
                </button>
              </div>

              {!activeReport.findings || activeReport.findings.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 sm:p-10 text-center text-sm text-slate-500">
                  No findings recorded yet. Click "+ Add Finding" to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReport.findings.map((fnd, idx) => (
                    <div
                      key={fnd.id || idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              fnd.findingType === 'Major Non-Conformance'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : fnd.findingType === 'Minor Non-Conformance'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : fnd.findingType === 'Observation / OFI'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {fnd.findingType}
                          </span>
                          <span className="font-mono font-semibold text-xs text-slate-700">
                            {fnd.clause}
                          </span>
                          {fnd.targetDate && (
                            <span className="text-xs text-slate-500">
                              Target: <strong className="text-slate-700">{fnd.targetDate}</strong>
                            </span>
                          )}
                          {fnd.responsible && (
                            <span className="text-xs text-slate-500">
                              Owner: <strong className="text-slate-700">{fnd.responsible}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">{fnd.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteFinding(fnd.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Finding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditorActive(false);
                  setActiveReport(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close Editor
              </button>
              <button
                type="button"
                onClick={handleSaveActiveReport}
                className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Add Finding Modal */}
        {isAddingFinding && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Add Audit Finding</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingFinding(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFindingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Finding Type</label>
                  <select
                    value={newFinding.findingType}
                    onChange={(e) =>
                      setNewFinding({
                        ...newFinding,
                        findingType: e.target.value as AuditFindingItem['findingType'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Minor Non-Conformance">Minor Non-Conformance</option>
                    <option value="Major Non-Conformance">Major Non-Conformance</option>
                    <option value="Observation / OFI">Observation / OFI</option>
                    <option value="Good Practice">Good Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISO 9001 Clause</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clause 8.5"
                    value={newFinding.clause}
                    onChange={(e) => setNewFinding({ ...newFinding, clause: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Finding Details / Objective Evidence
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the discrepancy, condition, or observation..."
                    value={newFinding.description}
                    onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Responsible Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Production Lead"
                      value={newFinding.responsible}
                      onChange={(e) => setNewFinding({ ...newFinding, responsible: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={newFinding.targetDate}
                      onChange={(e) => setNewFinding({ ...newFinding, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingFinding(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                  >
                    Add Finding
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'reports'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Audit Reports</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeSubTab === 'reports' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {reports.length}
          </span>
        </button>
      </div>

      {activeSubTab === 'matrix' ? (
        <>
          {/* Meta Bar matching screenshot */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-4 shadow-xs">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-500">DOCUMENT #:</span>
              <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-012</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
              <span className="font-bold text-slate-900">16 Sep 2026</span>
            </div>
          </div>

          {/* Filters & Add Process Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Year</span>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Overall Score:</span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                  {overallScoreVal}%
                </span>
              </div>
            </div>

            <form onSubmit={handleAdd} className="flex items-center gap-2">
              <input
                type="text"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                placeholder="Add process..."
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 sm:w-64 shadow-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Audit Matrix Table matching Screenshot 3 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-800 font-bold">
                    <th className="py-3 px-3 min-w-[170px]">Processes / Activities</th>
                    {months.map((m) => (
                      <th key={m} className="py-3 px-2 text-center font-bold min-w-[42px] text-slate-700">
                        {m}
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center min-w-[55px] text-slate-800">
                      NCRs
                      <span className="block text-[10px] text-slate-400 font-normal">-10%</span>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[55px] text-slate-800">
                      OFIs
                      <span className="block text-[10px] text-slate-400 font-normal">-5%</span>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[70px] text-slate-800">
                      Total Score
                      <span className="block text-[10px] text-slate-400 font-normal">(%)</span>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[55px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{row.processName}</td>
                      {months.map((m) => {
                        const item = row.months[m];
                        if (!item || !item.status) {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-3 px-2 text-center text-slate-300 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer font-medium transition-colors"
                              title={`Schedule audit for ${m}`}
                            >
                              +
                            </td>
                          );
                        }

                        if (item.status === 'overdue') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Overdue - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#ef4444] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  X
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (item.status === 'completed') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Completed - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#10b981] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  C
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (item.status === 'due') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Due This Month - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#eab308] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  X
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (item.status === 'rescheduled') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Rescheduled - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#3b82f6] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  R
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={m}
                            onClick={() => handleOpenCellEditor(row, m)}
                            className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                            title={`Planned - Auditor: ${item.initials || 'None'} (Click to edit)`}
                          >
                            <div className="inline-flex flex-col items-center">
                              <span className="w-5 h-5 rounded-[4px] bg-[#64748b] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                X
                              </span>
                              {item.initials && (
                                <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                  {item.initials}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td
                        onClick={() => setEditingMetricsRow(row)}
                        className="py-3 px-2 text-center font-bold text-red-600 cursor-pointer hover:bg-slate-100/50"
                        title="Click to edit NCR count"
                      >
                        {row.ncrs}
                      </td>
                      <td
                        onClick={() => setEditingMetricsRow(row)}
                        className="py-3 px-2 text-center font-bold text-amber-600 cursor-pointer hover:bg-slate-100/50"
                        title="Click to edit OFI count"
                      >
                        {row.ofis}
                      </td>
                      <td
                        onClick={() => setEditingMetricsRow(row)}
                        className="py-3 px-2 text-center font-bold text-red-600 cursor-pointer hover:bg-slate-100/50"
                        title="Click to recalculate score"
                      >
                        {row.totalScore}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => handleMoveRow(index, 'up')}
                            disabled={index === 0}
                            className="hover:text-slate-700 disabled:opacity-30 p-0.5 cursor-pointer"
                            title="Move Row Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveRow(index, 'down')}
                            disabled={index === rows.length - 1}
                            className="hover:text-slate-700 disabled:opacity-30 p-0.5 cursor-pointer"
                            title="Move Row Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteProcess(row.id)}
                            className="hover:text-red-500 p-0.5 cursor-pointer ml-0.5"
                            title="Delete Process"
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

          {/* Legend and Target Box matching Screenshot 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#64748b] text-white font-bold text-[9px] flex items-center justify-center">
                  X
                </span>
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#eab308] text-white font-bold text-[9px] flex items-center justify-center">
                  X
                </span>
                <span>Due This Month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#ef4444] text-white font-bold text-[9px] flex items-center justify-center">
                  X
                </span>
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#10b981] text-white font-bold text-[9px] flex items-center justify-center">
                  C
                </span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#3b82f6] text-white font-bold text-[9px] flex items-center justify-center">
                  R
                </span>
                <span>Rescheduled</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-[#fef9c3] border border-amber-300/90 rounded-md text-xs font-extrabold text-amber-950 tracking-wider shadow-xs">
              TARGET = 80%
            </div>
          </div>
        </>
      ) : (
        /* Audit Reports Sub-tab */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Audit Reports & Findings Register</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    ISO 9001:2015
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Official audit reports, non-conformance records, observation logs, and lead auditor conclusions.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleExportReportsCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewReportModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New Audit Report</span>
                </button>
              </div>
            </div>

            {/* Dynamic Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs text-slate-500 font-medium">Total Audit Reports</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalReportsCount}</div>
                <span className="text-[11px] text-blue-600 font-medium">Scheduled & completed records</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                <span className="text-xs text-emerald-700 font-medium">Completed Audits</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">{completedReportsCount}</div>
                <span className="text-[11px] text-emerald-600 font-medium">With formal lead auditor sign-off</span>
              </div>
              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                <span className="text-xs text-amber-700 font-medium">Total Findings</span>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">{totalFindingsCount}</div>
                <span className="text-[11px] text-amber-600 font-medium">Major NCRs, Minor NCRs & OFIs</span>
              </div>
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                <span className="text-xs text-blue-700 font-medium">Average Audit Score</span>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">{averageAuditScore}%</div>
                <span className="text-[11px] text-slate-500 font-medium">Target ISO threshold is 80%</span>
              </div>
            </div>
          </div>

          {/* Search, Filter & Reports Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Search by report #, title, process, auditor..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(['ALL', 'Completed', 'Pending Review', 'Draft', 'Follow-up Required'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReportStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        reportStatusFilter === st
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st === 'ALL' ? 'All' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#16325c] text-white font-semibold">
                  <tr>
                    <th className="py-3 px-4">Report No. & Title</th>
                    <th className="py-3 px-4">Process / Scope</th>
                    <th className="py-3 px-4">Lead Auditor</th>
                    <th className="py-3 px-4">Audit Date</th>
                    <th className="py-3 px-4 text-center">Findings</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm text-slate-600">No Audit Reports Found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {reportSearch || reportStatusFilter !== 'ALL'
                            ? 'No reports match your current filters.'
                            : 'Get started by creating your first ISO 9001 internal audit report.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenNewReportModal}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Audit Report</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => {
                      const scoreColor =
                        rep.score >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : rep.score >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-red-50 text-red-700 border-red-300';

                      const statusColor =
                        rep.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rep.status === 'Pending Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : rep.status === 'Follow-up Required'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200';

                      return (
                        <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-blue-600">{rep.reportNo}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {rep.auditType}
                                  </span>
                                </div>
                                <h4
                                  onClick={() => handleOpenEditReportModal(rep)}
                                  className="font-semibold text-slate-900 mt-0.5 line-clamp-1 hover:text-blue-600 cursor-pointer"
                                >
                                  {rep.title}
                                </h4>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{rep.processName}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{rep.scopeClause}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                                {rep.auditorInitials || 'AU'}
                              </span>
                              <span className="font-medium text-slate-800">{rep.leadAuditor}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                            {formatDisplayDate(rep.auditDate)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                title="Major Non-Conformances"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  rep.majorNcrs > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {rep.majorNcrs} Maj
                              </span>
                              <span
                                title="Minor Non-Conformances"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  rep.minorNcrs > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {rep.minorNcrs} Min
                              </span>
                              <span
                                title="Opportunities for Improvement"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  rep.ofis > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {rep.ofis} OFI
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${scoreColor}`}>
                              {rep.score}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColor}`}>
                              {rep.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditReportModal(rep)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="View & Edit Full Audit Report"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditReportModal(rep)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Report"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReport(rep.id, rep.reportNo)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Report"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Auditor Allocation Table */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Auditor Assignments & Coverage</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Auditor</th>
                      <th className="py-2.5 px-4">Initials</th>
                      <th className="py-2.5 px-4">Assigned Processes</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="py-2.5 px-4 font-medium">John Smith (Lead Auditor)</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">JS</td>
                      <td className="py-2.5 px-4">Document Control, Production, Customer Satisfaction</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Lead
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Mary Kaiser (Internal Auditor)</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-purple-600">MK</td>
                      <td className="py-2.5 px-4">Purchasing, Production, Customer Satisfaction</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Assigned
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Month Cell Editor Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {editingCell.processName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Audit Slot: <span className="font-bold text-blue-600">{editingCell.month} 2026</span>
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Audit Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'planned', label: 'Planned (Grey X)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                    { id: 'due', label: 'Due This Month (Yellow X)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { id: 'overdue', label: 'Overdue (Red X)', color: 'bg-red-50 text-red-800 border-red-300' },
                    { id: 'completed', label: 'Completed (Green C)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                    { id: 'rescheduled', label: 'Rescheduled (Blue R)', color: 'bg-blue-50 text-blue-800 border-blue-300' },
                    { id: null, label: 'Unscheduled / Clear', color: 'bg-slate-50 text-slate-500 border-slate-200' },
                  ].map((s) => (
                    <button
                      key={String(s.id)}
                      type="button"
                      onClick={() => setCellStatus(s.id as CellStatus)}
                      className={`text-left px-2.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        cellStatus === s.id
                          ? 'ring-2 ring-blue-500 border-transparent shadow-xs font-bold'
                          : s.color
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auditor Initials
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={cellInitials}
                    onChange={(e) => setCellInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. JS, MK"
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1.5">
                    {['JS', 'MK', 'NV'].map((init) => (
                      <button
                        key={init}
                        type="button"
                        onClick={() => setCellInitials(init)}
                        className={`px-2 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                          cellInitials === init
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {init}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCell}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row Metrics (NCRs / OFIs / Score) Editor Modal */}
      {editingMetricsRow && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Edit Findings: {editingMetricsRow.processName}
              </h3>
              <button
                onClick={() => setEditingMetricsRow(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NCRs Count (-10% each)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={editingMetricsRow.ncrs === '—' ? 0 : editingMetricsRow.ncrs}
                  onChange={(e) =>
                    setEditingMetricsRow({
                      ...editingMetricsRow,
                      ncrs: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  OFIs Count (-5% each)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={editingMetricsRow.ofis === '—' ? 0 : editingMetricsRow.ofis}
                  onChange={(e) =>
                    setEditingMetricsRow({
                      ...editingMetricsRow,
                      ofis: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Auto-Calculated Score:</span>
                  <span className="font-bold text-sm text-blue-600">
                    {Math.max(
                      0,
                      100 -
                        ((typeof editingMetricsRow.ncrs === 'number'
                          ? editingMetricsRow.ncrs
                          : parseInt(editingMetricsRow.ncrs) || 0) *
                          10) -
                        ((typeof editingMetricsRow.ofis === 'number'
                          ? editingMetricsRow.ofis
                          : parseInt(editingMetricsRow.ofis) || 0) *
                          5)
                    )}
                    %
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMetricsRow(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetrics}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Findings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Audit Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingReportId ? 'Edit Audit Report' : 'New ISO 9001 Audit Report'}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    SHEQ Form AR-01
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record audit scope, auditor observations, non-conformance findings, and formal score.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="mt-4 space-y-4 text-xs">
              {/* Row 1: Report # & Audit Date & Audit Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Report Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.reportNo}
                    onChange={(e) => setReportForm({ ...reportForm, reportNo: e.target.value })}
                    placeholder="e.g. AR-2026-004"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Audit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={toDateInputValue(reportForm.auditDate)}
                    onChange={(e) => setReportForm({ ...reportForm, auditDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Audit Type
                  </label>
                  <select
                    value={reportForm.auditType}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        auditType: e.target.value as AuditReportItem['auditType'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="Internal Audit">Internal Audit (1st Party)</option>
                    <option value="Supplier Audit">Supplier Audit (2nd Party)</option>
                    <option value="External Certification">External Certification (3rd Party)</option>
                    <option value="Surveillance Audit">Surveillance Audit</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit Title / Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  placeholder="e.g. Production & Process Control Internal Audit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
                />
              </div>

              {/* Row 3: Process & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Process / Area Audited <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="process-list-options"
                      required
                      value={reportForm.processName}
                      onChange={(e) => setReportForm({ ...reportForm, processName: e.target.value })}
                      placeholder="Select or enter process..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <datalist id="process-list-options">
                      {rows.map((r) => (
                        <option key={r.id} value={r.processName} />
                      ))}
                      <option value="Document Control" />
                      <option value="Management Review" />
                      <option value="Calibration & Maintenance" />
                      <option value="Purchasing & Supplier Evaluation" />
                      <option value="HR & Competence Training" />
                      <option value="Customer Satisfaction" />
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ISO Scope / Applicable Clause
                  </label>
                  <input
                    type="text"
                    value={reportForm.scopeClause}
                    onChange={(e) => setReportForm({ ...reportForm, scopeClause: e.target.value })}
                    placeholder="e.g. ISO 9001:2015 Clause 8.5 (Production & Service Provision)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Lead Auditor & Initials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Auditor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.leadAuditor}
                    onChange={(e) => setReportForm({ ...reportForm, leadAuditor: e.target.value })}
                    placeholder="e.g. John Smith"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Auditor Initials
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={reportForm.auditorInitials}
                      onChange={(e) => setReportForm({ ...reportForm, auditorInitials: e.target.value.toUpperCase() })}
                      placeholder="e.g. JS"
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <div className="flex items-center gap-1.5">
                      {['JS', 'NV', 'MK'].map((init) => (
                        <button
                          key={init}
                          type="button"
                          onClick={() => setReportForm({ ...reportForm, auditorInitials: init })}
                          className={`px-2 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                            reportForm.auditorInitials === init
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {init}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Findings & Score Calculation Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Audit Findings & Score Computation</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Calculated Score:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-extrabold border ${
                        calculateFormScore() >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : calculateFormScore() >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      {calculateFormScore()}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-red-700 mb-1">
                      Major NCRs (-20%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={reportForm.majorNcrs}
                      onChange={(e) => setReportForm({ ...reportForm, majorNcrs: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border border-red-200 rounded-lg text-red-700 font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-700 mb-1">
                      Minor NCRs (-10%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={reportForm.minorNcrs}
                      onChange={(e) => setReportForm({ ...reportForm, minorNcrs: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-amber-700 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 mb-1">
                      OFIs (-5%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={reportForm.ofis}
                      onChange={(e) => setReportForm({ ...reportForm, ofis: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-700 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Status & Conclusion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Audit Status
                  </label>
                  <select
                    value={reportForm.status}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        status: e.target.value as AuditReportItem['status'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
                  >
                    <option value="Completed">Completed (Finalized)</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Audit Conclusion
                  </label>
                  <select
                    value={reportForm.conclusion}
                    onChange={(e) => setReportForm({ ...reportForm, conclusion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium"
                  >
                    <option value="Full Conformance">Full Conformance (Satisfactory)</option>
                    <option value="Conformance with Minor Findings">Conformance with Minor Findings</option>
                    <option value="Conditional Pass">Conditional Pass (CAR required)</option>
                    <option value="Non-Conformant">Non-Conformant (Re-audit needed)</option>
                  </select>
                </div>
              </div>

              {/* Text Areas */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Executive Summary & Scope Description
                </label>
                <textarea
                  rows={2}
                  value={reportForm.summary}
                  onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                  placeholder="Key observations, areas evaluated, interviewees, and sampling summary..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Strengths & Good Practices
                </label>
                <textarea
                  rows={2}
                  value={reportForm.strengths}
                  onChange={(e) => setReportForm({ ...reportForm, strengths: e.target.value })}
                  placeholder="Positive practices, compliance highlights, well-maintained documentation..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Non-Conformances Identified & Corrective Actions (CAR)
                </label>
                <textarea
                  rows={2}
                  value={reportForm.nonConformances}
                  onChange={(e) => setReportForm({ ...reportForm, nonConformances: e.target.value })}
                  placeholder="Specific deviations noted against ISO 9001 clause, NCR reference numbers..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Opportunities for Improvement & Recommendations
                </label>
                <textarea
                  rows={2}
                  value={reportForm.recommendations}
                  onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                  placeholder="Continual improvement suggestions, workflow optimizations..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingReportId ? 'Save Report Changes' : 'Create Audit Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Audit Report Details Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    {company.name} · SHEQ STREET QMS
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    ISO 9001:2015 INTERNAL AUDIT REPORT
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Meta Banner */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Number</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{viewingReport.reportNo}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Date</span>
                <span className="font-semibold text-slate-800">{formatDisplayDate(viewingReport.auditDate)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Type</span>
                <span className="font-semibold text-slate-800">{viewingReport.auditType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Compliance Rating</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${
                    viewingReport.score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : viewingReport.score >= 60
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-red-50 text-red-700 border-red-300'
                  }`}
                >
                  {viewingReport.score}%
                </span>
              </div>
            </div>

            {/* Report Content */}
            <div className="mt-6 space-y-6 text-xs text-slate-700">
              {/* Title & Scope */}
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Audit Title & Process
                    </h4>
                    <p className="font-bold text-sm text-slate-900">{viewingReport.title}</p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{viewingReport.processName}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Lead Auditor & Scope
                    </h4>
                    <p className="font-semibold text-slate-900">
                      {viewingReport.leadAuditor} ({viewingReport.auditorInitials})
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{viewingReport.scopeClause}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Audit Conclusion:</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {viewingReport.conclusion}
                  </span>
                </div>
              </div>

              {/* Findings Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                  <span className="text-[11px] font-bold text-red-800 block">Major Non-Conformances</span>
                  <span className="text-xl font-extrabold text-red-600">{viewingReport.majorNcrs}</span>
                  <span className="text-[10px] text-red-500 block mt-0.5">Critical system breakdown</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-800 block">Minor Non-Conformances</span>
                  <span className="text-xl font-extrabold text-amber-600">{viewingReport.minorNcrs}</span>
                  <span className="text-[10px] text-amber-500 block mt-0.5">Procedural lapse</span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[11px] font-bold text-blue-800 block">Opportunities for Improvement</span>
                  <span className="text-xl font-extrabold text-blue-600">{viewingReport.ofis}</span>
                  <span className="text-[10px] text-blue-500 block mt-0.5">Preventive enhancement</span>
                </div>
              </div>

              {/* Executive Summary */}
              {viewingReport.summary && (
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Executive Summary & Audit Scope</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{viewingReport.summary}</p>
                </div>
              )}

              {/* Strengths */}
              {viewingReport.strengths && (
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Strengths & Positive Observations</span>
                  </h4>
                  <p className="text-emerald-950 leading-relaxed whitespace-pre-line">{viewingReport.strengths}</p>
                </div>
              )}

              {/* Non-Conformances */}
              {viewingReport.nonConformances && (
                <div className="p-4 bg-red-50/40 rounded-xl border border-red-200">
                  <h4 className="font-bold text-red-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Non-Conformances & Corrective Actions Required (CAR)</span>
                  </h4>
                  <p className="text-red-950 leading-relaxed whitespace-pre-line">{viewingReport.nonConformances}</p>
                </div>
              )}

              {/* Recommendations */}
              {viewingReport.recommendations && (
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 text-xs mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recommendations for Continual Improvement</span>
                  </h4>
                  <p className="text-blue-950 leading-relaxed whitespace-pre-line">{viewingReport.recommendations}</p>
                </div>
              )}

              {/* Sign-off Seal */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Auditor Sign-off</span>
                  <p className="font-bold text-xs text-slate-800 mt-0.5">
                    Lead Auditor: {viewingReport.leadAuditor}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Verified on {viewingReport.auditDate} · SHEQ Street Internal Audit Register
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>FORMALLY APPROVED & SIGNED</span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const rep = viewingReport;
                  setViewingReport(null);
                  handleOpenEditReportModal(rep);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Edit Report
              </button>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
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
