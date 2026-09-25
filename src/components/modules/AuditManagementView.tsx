import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronDown,
  X,
  Download,
  Calendar,
  CheckCircle2,
  Eye,
  Search,
  ArrowLeft,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  AuditProcessRow,
  AuditReportItem,
  Company,
  AuditFindingItem,
  TurtleAnalysis,
} from '../../types';
import { calculateOverallAuditScore, YEARLY_DEFAULT_ROWS } from '../../utils/auditReadiness';

interface AuditManagementViewProps {
  company: Company;
  rows: AuditProcessRow[];
  onAddProcess: (name: string) => void;
  onDeleteProcess: (id: string) => void;
  onUpdateRow?: (row: AuditProcessRow) => void;
  onReorderRows?: (newRows: AuditProcessRow[]) => void;
  activeYear?: string;
  onYearChange?: (year: string) => void;
}

type CellStatus = 'planned' | 'due' | 'overdue' | 'completed' | 'rescheduled' | null;

interface ActiveCellModal {
  rowId: string;
  processName: string;
  month: string;
  currentStatus: CellStatus;
  currentInitials: string;
}

const SUPPORTED_YEARS = ['2026', '2025', '2024', '2027'];
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const YEAR_METADATA: Record<string, { lastUpdated: string; statusBadge: string; badgeColor: string; description: string }> = {
  '2026': {
    lastUpdated: '16 Sep 2026',
    statusBadge: 'Active Cycle (In-Progress)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Active 2026 Annual QMS Audit Cycle — Ongoing monitoring, due checklists, and closure tracking.',
  },
  '2025': {
    lastUpdated: '15 Dec 2025',
    statusBadge: 'Historical (100% Completed)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Historical 2025 Annual Audit Cycle — Fully closed, verified, and archived with ISO audit sign-offs.',
  },
  '2024': {
    lastUpdated: '18 Dec 2024',
    statusBadge: 'Initial Certification (Archived)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Historical 2024 Audit Records — Formal Stage 1 and Stage 2 ISO 9001:2015 initial certification cycle.',
  },
  '2027': {
    lastUpdated: '15 Jan 2027',
    statusBadge: 'Forward Plan (Draft Schedule)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Forward Planning 2027 Schedule — Tentative auditor assignments and clause surveillance plan.',
  },
};


const INITIAL_AUDIT_REPORTS: AuditReportItem[] = [
  // 2026 Reports
  {
    id: 'ar-2026-1',
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
    summary: 'Comprehensive audit of machining, assembly, and packaging stations. Operator work instructions were accessible and current.',
    strengths: 'Production operators demonstrated clear understanding of Quality Control Plans.',
    nonConformances: 'Minor NCR #NCR-2026-042: Calibration sticker on torque wrench TW-04 was obscured by coolant mist.',
    recommendations: 'Implement digital daily tool inspection logs to eliminate paper wear in machining areas.',
  },
  {
    id: 'ar-2026-2',
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
    summary: 'Audit of master document register, revision histories, and controlled distribution lists.',
    strengths: 'Document Control Register is meticulously maintained with clear revision approval signatures.',
    nonConformances: 'None identified. System complies fully with ISO 9001:2015 Clause 7.5.',
    recommendations: 'OFI-01: Archive obsolete SOPs older than 5 years to cloud storage to streamline local search queries.',
  },
  {
    id: 'ar-2026-3',
    reportNo: 'AUD-2609-3',
    title: 'Customer Satisfaction & Feedback Audit',
    processName: 'Customer Satisfaction',
    auditType: 'Internal Audit',
    leadAuditor: 'Mary Kaiser',
    auditorInitials: 'MK',
    auditDate: '2026-09-22',
    scopeClause: 'ISO 9001:2015 Clause 9.1.2 & 8.2.1',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 1,
    score: 95,
    status: 'Draft',
    conclusion: 'Conformance pending final review',
    summary: 'Evaluation of customer feedback collation, NPS trends, survey dispatch cadence, and ticket resolution timeframes.',
    strengths: 'Quarterly customer satisfaction average reached 94% across responsiveness, delivery, and technical support.',
    nonConformances: 'Minor NCR #NCR-2026-048: Formal 48-hour root cause acknowledgment email was missing for ticket #TK-882.',
    recommendations: 'Enable automated dispatch triggers in SHEQ Street when customer ratings dip below 80%.',
  },
  // 2025 Reports
  {
    id: 'ar-2025-1',
    reportNo: 'AR-2025-001',
    title: 'Management Review & Strategic Direction Audit',
    processName: 'Context & Leadership',
    auditType: 'Internal Audit',
    leadAuditor: 'Naveen V',
    auditorInitials: 'NV',
    auditDate: '2025-11-14',
    scopeClause: 'ISO 9001:2015 Clause 9.3 & 5.1',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 1,
    score: 95,
    status: 'Completed',
    conclusion: 'Full Conformance',
    summary: 'Annual review of organizational quality objectives, SWOT alignment, and resource allocations.',
    strengths: 'Executive management demonstrated exceptional engagement in risk reviews and KPI dashboards.',
    nonConformances: 'None. QMS suitability and adequacy verified.',
    recommendations: 'OFI-25-01: Incorporate ESG sustainability metrics into the 2026 review agenda.',
  },
  {
    id: 'ar-2025-2',
    reportNo: 'AR-2025-002',
    title: 'Purchasing, Procurement & Vendor Evaluation Audit',
    processName: 'Purchasing & ASL',
    auditType: 'Internal Audit',
    leadAuditor: 'Mary Kaiser',
    auditorInitials: 'MK',
    auditDate: '2025-08-20',
    scopeClause: 'ISO 9001:2015 Clause 8.4 (External Provision)',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 1,
    score: 95,
    status: 'Completed',
    conclusion: 'Full Conformance',
    summary: 'Comprehensive audit of approved supplier list (ASL), vendor rating matrices, and receipt inspection logs.',
    strengths: 'Approved supplier re-evaluations were completed on schedule with verified B-BBEE certificates.',
    nonConformances: 'None identified.',
    recommendations: 'OFI-25-02: Establish dual-sourcing contingency for critical grade-1 steel fasteners.',
  },
  {
    id: 'ar-2025-3',
    reportNo: 'AR-2025-003',
    title: 'Manufacturing, Extrusion & Calibration Audit',
    processName: 'Production & Extrusion',
    auditType: 'Internal Audit',
    leadAuditor: 'John Smith',
    auditorInitials: 'JS',
    auditDate: '2025-04-12',
    scopeClause: 'ISO 9001:2015 Clause 8.5 & 7.1.5',
    majorNcrs: 0,
    minorNcrs: 1,
    ofis: 1,
    score: 85,
    status: 'Completed',
    conclusion: 'Conformance with Minor Findings',
    summary: 'Detailed evaluation of extrusion line parameters, temperature controllers, and digital scale calibrations.',
    strengths: 'Machine operators were fully qualified with valid training sign-offs.',
    nonConformances: 'Minor NCR #NCR-2025-019: Digital micrometer DM-03 was past due 7 days for verification.',
    recommendations: 'Automate calibration alert triggers 30 days prior to certificate expiry.',
  },
  // 2024 Reports
  {
    id: 'ar-2024-1',
    reportNo: 'AR-2024-001',
    title: 'ISO 9001:2015 Stage 2 Pre-Assessment Internal Audit',
    processName: 'Quality Management System & Scope',
    auditType: 'Internal Audit',
    leadAuditor: 'Dr. Arthur Pendelton',
    auditorInitials: 'AP',
    auditDate: '2024-10-25',
    scopeClause: 'Full ISO 9001:2015 Standard (Clauses 4 through 10)',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 0,
    score: 98,
    status: 'Completed',
    conclusion: 'Full Conformance',
    summary: 'Baseline gap audit ahead of formal external certification body assessment.',
    strengths: 'Quality policy and departmental KPIs were well understood across all tiers of the workforce.',
    nonConformances: 'Zero non-conformances identified.',
    recommendations: 'Proceed directly with external accreditation audit.',
  },
  {
    id: 'ar-2024-2',
    reportNo: 'AR-2024-002',
    title: 'Control of Non-Conforming Outputs & Corrective Actions Audit',
    processName: 'Operational Processes & Work Instructions',
    auditType: 'Internal Audit',
    leadAuditor: 'Naveen V',
    auditorInitials: 'NV',
    auditDate: '2024-05-18',
    scopeClause: 'ISO 9001:2015 Clause 8.7 & 10.2',
    majorNcrs: 0,
    minorNcrs: 1,
    ofis: 0,
    score: 90,
    status: 'Completed',
    conclusion: 'Conformance with Minor Findings',
    summary: 'Verification of quarantine quarantine zones, scrap ticketing, and 5-Why root cause investigations.',
    strengths: 'Quarantine area access was strictly controlled with physical cage lockouts.',
    nonConformances: 'Minor NCR #NCR-2024-008: 5-Why action closure sign-off was missing for reject lot #RJ-104.',
    recommendations: 'Ensure Quality Manager double sign-off on all closed corrective action files.',
  },
  // 2027 Reports
  {
    id: 'ar-2027-1',
    reportNo: 'AR-2027-001',
    title: 'Strategic Direction & QMS Modernization Audit Plan',
    processName: 'Context & Leadership',
    auditType: 'Internal Audit',
    leadAuditor: 'Lead Auditor',
    auditorInitials: 'LA',
    auditDate: '2027-01-20',
    scopeClause: 'ISO 9001:2015 Clause 4 & 6 (Risk Planning)',
    majorNcrs: 0,
    minorNcrs: 0,
    ofis: 0,
    score: 100,
    status: 'Draft',
    conclusion: 'Conformance pending final review',
    summary: 'Forward-looking audit plan for 2027 quality modernization and AI tool governance.',
    strengths: 'Early planning framework establishes transparent audit targets across all operating units.',
    nonConformances: 'None. Draft planning stage.',
    recommendations: 'Finalize auditor assignments by December 2026.',
  },
];

const toDateInputValue = (val?: string): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const match = val.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  const parsed = new Date(val);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : '';
};

const formatDisplayDate = (val?: string): string => {
  if (!val) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  }
  return val;
};

const statusCellConfig: Record<string, { bg: string; letter: string; title: string }> = {
  overdue: { bg: 'bg-[#ef4444]', letter: 'X', title: 'Overdue' },
  completed: { bg: 'bg-[#10b981]', letter: 'C', title: 'Completed' },
  due: { bg: 'bg-[#eab308]', letter: 'X', title: 'Due This Month' },
  rescheduled: { bg: 'bg-[#3b82f6]', letter: 'R', title: 'Rescheduled' },
  planned: { bg: 'bg-[#64748b]', letter: 'X', title: 'Planned' },
};

export const AuditManagementView: React.FC<AuditManagementViewProps> = ({
  company,
  rows: initialPropRows,
  onAddProcess,
  onDeleteProcess,
  onUpdateRow,
  onReorderRows,
  activeYear,
  onYearChange,
}) => {
  const auditDateInputRef = useRef<HTMLInputElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'reports'>('matrix');
  const [year, setYear] = useState<string>(() => {
    return activeYear || localStorage.getItem('sheq_selected_audit_year') || '2026';
  });
  const [yearChangeToast, setYearChangeToast] = useState<string | null>(null);

  // Sync year if parent activeYear changes
  React.useEffect(() => {
    if (activeYear && activeYear !== year) {
      setYear(activeYear);
    }
  }, [activeYear]);

  // Yearly Rows State: separate matrix schedule for each year
  const [yearlyRows, setYearlyRows] = useState<Record<string, AuditProcessRow[]>>(() => {
    const base: Record<string, AuditProcessRow[]> = { ...YEARLY_DEFAULT_ROWS };
    if (initialPropRows && initialPropRows.length > 0) {
      base['2026'] = initialPropRows;
    }
    try {
      SUPPORTED_YEARS.forEach((yr) => {
        const saved = localStorage.getItem(`sheq_${company.id}_auditRows_${yr}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) base[yr] = parsed;
        }
      });
    } catch (e) {
      console.error('Error loading yearly audit rows', e);
    }
    return base;
  });

  // Current active year's rows
  const currentRows = yearlyRows[year] || YEARLY_DEFAULT_ROWS[year] || YEARLY_DEFAULT_ROWS['2026'];

  const updateCurrentRows = (newRows: AuditProcessRow[]) => {
    setYearlyRows((prev) => ({ ...prev, [year]: newRows }));
    try {
      localStorage.setItem(`sheq_${company.id}_auditRows_${year}`, JSON.stringify(newRows));
    } catch {}
    if (year === '2026' && onReorderRows) {
      onReorderRows(newRows);
    }
  };

  // Matrix Modals
  const [newProcessName, setNewProcessName] = useState('');
  const [editingCell, setEditingCell] = useState<ActiveCellModal | null>(null);
  const [cellStatus, setCellStatus] = useState<CellStatus>('planned');
  const [cellInitials, setCellInitials] = useState('JS');
  const [editingMetricsRow, setEditingMetricsRow] = useState<AuditProcessRow | null>(null);

  // All Reports with localStorage
  const [reports, setReports] = useState<AuditReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_audit_reports_v4') || localStorage.getItem('sheq_audit_reports_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AUDIT_REPORTS;
  });

  const updateReports = (newReports: AuditReportItem[]) => {
    setReports(newReports);
    try {
      localStorage.setItem('sheq_audit_reports_v4', JSON.stringify(newReports));
    } catch {}
  };

  // Switch Year handler with full sync and feedback
  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    try {
      localStorage.setItem('sheq_selected_audit_year', newYear);
    } catch {}
    if (onYearChange) {
      onYearChange(newYear);
    }
    const meta = YEAR_METADATA[newYear];
    setYearChangeToast(`Switched Audit System to Year ${newYear} (${meta?.statusBadge || 'Custom Year'})`);
    setTimeout(() => setYearChangeToast(null), 4000);
  };

  // Filter reports specifically for the active year
  const yearReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.auditDate && r.auditDate.startsWith(year)) return true;
      if (r.reportNo && (r.reportNo.includes(year) || r.reportNo.includes(year.slice(2)))) return true;
      return false;
    });
  }, [reports, year]);

  // Report Search & Filter
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'ALL' | 'Completed' | 'Pending Review' | 'Draft' | 'Follow-up Required'>('ALL');

  const filteredYearReports = useMemo(() => {
    return yearReports.filter((r) => {
      const matchesSearch =
        r.reportNo.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.processName.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.leadAuditor.toLowerCase().includes(reportSearch.toLowerCase()) ||
        r.scopeClause.toLowerCase().includes(reportSearch.toLowerCase());
      const matchesStatus = reportStatusFilter === 'ALL' || r.status === reportStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [yearReports, reportSearch, reportStatusFilter]);

  // Dynamic score for the current year
  const overallScoreVal = calculateOverallAuditScore(currentRows);

  // Dynamic KPI counters for current year
  const totalReportsCount = yearReports.length;
  const completedReportsCount = yearReports.filter((r) => r.status === 'Completed').length;
  const totalFindingsCount = yearReports.reduce((acc, r) => acc + (r.majorNcrs + r.minorNcrs + r.ofis), 0);
  const averageAuditScore =
    yearReports.length > 0
      ? Math.round(yearReports.reduce((acc, r) => acc + r.score, 0) / yearReports.length)
      : 100;

  // Editor State
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [activeReport, setActiveReport] = useState<AuditReportItem | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState('');
  const [isAddingFinding, setIsAddingFinding] = useState(false);
  const [newFinding, setNewFinding] = useState<AuditFindingItem>({
    id: '',
    findingType: 'Minor Non-Conformance',
    clause: 'Clause 8.5',
    description: '',
    responsible: '',
    targetDate: `30-Oct-${year}`,
  });

  const handleOpenNewReportModal = () => {
    setActiveSubTab('reports');
    const nextSeq = yearReports.length + 1;
    const defaultAuditDate = `${year}-09-15`;

    const newRep: AuditReportItem = {
      id: `ar-${year}-${Date.now()}`,
      reportNo: `AR-${year}-00${nextSeq}`,
      title: `${year} Internal Audit Report #${nextSeq}`,
      processName: currentRows[0]?.processName || 'Production & Process Control',
      auditType: 'Internal Audit',
      leadAuditor: 'Quality Lead Auditor',
      auditorInitials: 'QA',
      auditDate: defaultAuditDate,
      scopeClause: 'ISO 9001:2015 Clause 8.5 (Operations & Control)',
      majorNcrs: 0,
      minorNcrs: 0,
      ofis: 0,
      score: 100,
      status: 'Draft',
      conclusion: 'Conformance pending final review',
      summary: `Internal audit conducted for ${year} annual quality assurance cycle.`,
      auditee: 'Process Owner',
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
    const updated =
      existingIndex >= 0
        ? reports.map((r) => (r.id === finalReport.id ? finalReport : r))
        : [finalReport, ...reports];

    updateReports(updated);
    setActiveReport(finalReport);
    setSaveSuccessNotice(`Audit Report "${finalReport.reportNo} - ${finalReport.title}" saved successfully.`);
    setTimeout(() => setSaveSuccessNotice(''), 4500);
  };

  const handleDeleteReport = (id: string, reportNo: string) => {
    if (window.confirm(`Delete audit report ${reportNo}?`)) {
      updateReports(reports.filter((r) => r.id !== id));
      if (activeReport?.id === id) {
        setIsEditorActive(false);
        setActiveReport(null);
      }
    }
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
      targetDate: newFinding.targetDate || `30-Oct-${year}`,
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
      score: Math.max(0, 100 - majorCount * 20 - minorCount * 10 - ofiCount * 5),
    });

    setIsAddingFinding(false);
    setNewFinding({
      id: '',
      findingType: 'Minor Non-Conformance',
      clause: 'Clause 8.5',
      description: '',
      responsible: '',
      targetDate: `30-Oct-${year}`,
    });
  };

  const handleAddProcessToYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessName.trim()) return;

    const newRow: AuditProcessRow = {
      id: `${year}-${Date.now()}`,
      processName: newProcessName.trim(),
      months: {},
      ncrs: '—',
      ofis: '—',
      totalScore: '—',
    };

    const updated = [...currentRows, newRow];
    updateCurrentRows(updated);
    setNewProcessName('');
    if (year === '2026') onAddProcess(newProcessName.trim());
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
    const updated = currentRows.map((r) => {
      if (r.id !== editingCell.rowId) return r;
      const updatedMonths = { ...r.months };
      if (!cellStatus) {
        delete updatedMonths[editingCell.month];
      } else {
        updatedMonths[editingCell.month] = {
          status: cellStatus,
          initials: cellInitials.trim() ? cellInitials.trim().toUpperCase() : undefined,
        };
      }
      return { ...r, months: updatedMonths };
    });

    updateCurrentRows(updated);
    setEditingCell(null);
  };

  const handleSaveMetrics = () => {
    if (!editingMetricsRow) return;
    const ncrsNum =
      typeof editingMetricsRow.ncrs === 'number'
        ? editingMetricsRow.ncrs
        : parseInt(editingMetricsRow.ncrs) || 0;
    const ofisNum =
      typeof editingMetricsRow.ofis === 'number'
        ? editingMetricsRow.ofis
        : parseInt(editingMetricsRow.ofis) || 0;
    const calcScore = Math.max(0, 100 - ncrsNum * 10 - ofisNum * 5);

    const updated = currentRows.map((r) =>
      r.id === editingMetricsRow.id
        ? {
            ...editingMetricsRow,
            totalScore: `${calcScore}%`,
          }
        : r
    );

    updateCurrentRows(updated);
    setEditingMetricsRow(null);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const newRows = [...currentRows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;
    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;
    updateCurrentRows(newRows);
  };

  const handleDeleteRow = (id: string, name: string) => {
    if (window.confirm(`Delete process "${name}" from ${year} Audit Matrix?`)) {
      const updated = currentRows.filter((r) => r.id !== id);
      updateCurrentRows(updated);
      if (year === '2026') onDeleteProcess(id);
    }
  };

  const handleExportMatrixCSV = () => {
    const headers = ['Process / Activity', ...months, 'NCRs', 'OFIs', 'Total Score'];
    const rowsCsv = currentRows.map((r) => [
      `"${r.processName.replace(/"/g, '""')}"`,
      ...months.map((m) => {
        const item = r.months[m];
        return item ? `"${item.status?.toUpperCase() || ''} (${item.initials || ''})"` : '""';
      }),
      `"${r.ncrs}"`,
      `"${r.ofis}"`,
      `"${r.totalScore}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rowsCsv.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Audit_Matrix_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReportsCSV = () => {
    const headers = [
      'Report #',
      'Title',
      'Process',
      'Audit Type',
      'Lead Auditor',
      'Date',
      'Major NCRs',
      'Minor NCRs',
      'OFIs',
      'Score',
      'Status',
      'Conclusion',
    ];
    const rowsCsv = yearReports.map((r) => [
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
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rowsCsv.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Audit_Reports_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const meta = YEAR_METADATA[year] || YEAR_METADATA['2026'];

  // ==========================================
  // RENDER: FULL-PAGE REPORT EDITOR VIEW
  // ==========================================
  if (isEditorActive && activeReport) {
    const turtleQuadrants: { field: keyof TurtleAnalysis; title: string; subtitle: string }[] = [
      {
        field: 'resources',
        title: 'With what resources / Machines or Equipment?',
        subtitle: 'Enter details of resources used (machines, materials, equipment).',
      },
      {
        field: 'personnel',
        title: 'With Whom / People, Sections or Departments?',
        subtitle: 'Enter personnel involved, required skills, and competence criteria.',
      },
      {
        field: 'inputs',
        title: 'Inputs',
        subtitle: 'Enter inputs for this process (materials, tooling, schedule, etc).',
      },
      {
        field: 'outputs',
        title: 'Outputs',
        subtitle: 'Enter outputs of this process (products, services, documentation, reports).',
      },
      {
        field: 'measures',
        title: 'How many / measures or indicators?',
        subtitle: 'Enter measures of process effectiveness (KPIs, targets, defect rates).',
      },
      {
        field: 'procedures',
        title: 'How / procedures, work instructions or methods?',
        subtitle: 'Enter supporting SOPs, control plans, and instructions.',
      },
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Report Editor</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            ISO 9001:2015 Clause Audit Report & Turtle Analysis for Year {year}.
          </p>
        </div>

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
            <span>Back to {year} Audit Reports</span>
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
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessNotice}</span>
          </div>
        )}

        {/* Report Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="bg-[#16325c] px-6 sm:px-8 py-5 text-white flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                AUDIT REPORT ({year})
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
              <div className="text-sm font-bold text-slate-200 mb-1">{company.name}</div>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800/80 text-slate-300 border border-slate-700 uppercase tracking-wider">
                {activeReport.status?.toUpperCase() || 'DRAFT'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-7">
            <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-blue-500">
              <input
                type="text"
                value={activeReport.title}
                onChange={(e) => setActiveReport({ ...activeReport, title: e.target.value })}
                placeholder="Report Title"
                className="w-full text-xl sm:text-2xl font-bold text-slate-900 placeholder:text-slate-400 bg-transparent outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveActiveReport}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Audit Type</label>
                <select
                  value={activeReport.auditType}
                  onChange={(e) => setActiveReport({ ...activeReport, auditType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="Internal Audit">Internal Audit</option>
                  <option value="Supplier Audit">Supplier Audit</option>
                  <option value="External Certification">External Certification</option>
                  <option value="Surveillance Audit">Surveillance Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Process Audited</label>
                <input
                  type="text"
                  value={activeReport.processName}
                  onChange={(e) => setActiveReport({ ...activeReport, processName: e.target.value })}
                  placeholder="e.g. Production & Process Control"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Audit Date</label>
                <input
                  ref={auditDateInputRef}
                  type="date"
                  value={toDateInputValue(activeReport.auditDate)}
                  onChange={(e) => setActiveReport({ ...activeReport, auditDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Lead Auditor</label>
                <input
                  type="text"
                  value={activeReport.leadAuditor}
                  onChange={(e) => setActiveReport({ ...activeReport, leadAuditor: e.target.value })}
                  placeholder="e.g. John Smith"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">ISO 9001 Turtle Diagram Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {turtleQuadrants.map((q) => (
                  <div key={q.field} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-3 border-b border-slate-200">
                      <div className="text-xs font-bold text-blue-700">{q.title}</div>
                      <div className="text-[11px] text-slate-500">{q.subtitle}</div>
                    </div>
                    <div className="p-3">
                      <textarea
                        rows={3}
                        value={activeReport.turtleAnalysis?.[q.field] || ''}
                        onChange={(e) =>
                          setActiveReport({
                            ...activeReport,
                            turtleAnalysis: {
                              ...activeReport.turtleAnalysis!,
                              [q.field]: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter details..."
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-hidden resize-y bg-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Audit Conclusion</label>
              <select
                value={activeReport.conclusion}
                onChange={(e) => setActiveReport({ ...activeReport, conclusion: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer font-medium"
              >
                <option value="Full Conformance">Full Conformance</option>
                <option value="Conformance with Minor Findings">Conformance with Minor Findings</option>
                <option value="Conformance pending final review">Conformance pending final review</option>
                <option value="Conditional Pass">Conditional Pass</option>
                <option value="Non-Conformant">Non-Conformant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal: Add Finding */}
        {isAddingFinding && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Add Audit Finding ({year})</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingFinding(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddFindingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Finding Type</label>
                  <select
                    value={newFinding.findingType}
                    onChange={(e) => setNewFinding({ ...newFinding, findingType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Minor Non-Conformance">Minor Non-Conformance (-10%)</option>
                    <option value="Major Non-Conformance">Major Non-Conformance (-20%)</option>
                    <option value="Observation / OFI">Observation / OFI (-5%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISO Clause</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clause 8.5"
                    value={newFinding.clause}
                    onChange={(e) => setNewFinding({ ...newFinding, clause: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe deviation observed..."
                    value={newFinding.description}
                    onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
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

  // ==========================================
  // RENDER: MAIN MATRIX & REPORTS VIEW
  // ==========================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold">{company.name}</span>
          <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
            {company.plan || 'ACTIVE'}
          </span>
          {company.registrationNumber && (
            <span className="hidden sm:inline-block font-mono text-slate-400">
              • Reg: {company.registrationNumber}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {(company.isoScope || ['ISO 9001:2015']).map((sc) => (
            <span
              key={sc}
              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200"
            >
              {sc}
            </span>
          ))}
        </div>
      </div>

      {/* Title & Global Year Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Audit Management — Year {year}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badgeColor}`}>
              {meta.statusBadge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{meta.description}</p>
        </div>

        {/* Global Year Switcher Pill Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Audit Year:
          </span>
          {SUPPORTED_YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handleYearChange(y)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                year === y
                  ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Year Change Alert Toast */}
      {yearChangeToast && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center justify-between gap-2 shadow-2xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{yearChangeToast}</span>
          </div>
          <button
            onClick={() => setYearChangeToast(null)}
            className="text-blue-400 hover:text-blue-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-tabs: Audit Matrix vs Audit Reports */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {year} Audit Matrix Schedule
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'reports'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{year} Audit Reports</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSubTab === 'reports' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {yearReports.length}
          </span>
        </button>
      </div>

      {activeSubTab === 'matrix' ? (
        <>
          {/* Document Header Metadata Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center justify-between gap-4 shadow-xs flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-500">DOCUMENT #:</span>
                <span className="font-bold text-slate-900">
                  {company.name ? company.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'NK'}
                  -DC-012
                </span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div>
                <span className="font-semibold text-slate-500">CYCLE YEAR:</span>{' '}
                <span className="font-bold text-blue-600">{year}</span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div>
                <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
                <span className="font-bold text-slate-900">{meta.lastUpdated}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportMatrixCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {year} Matrix CSV</span>
            </button>
          </div>

          {/* Filters, Scores, and Add Process Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Audit Year:</span>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-8 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    {SUPPORTED_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Overall Score ({year}):</span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                    overallScoreVal >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : overallScoreVal >= 60
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-red-50 text-red-600 border-red-300'
                  }`}
                >
                  {overallScoreVal}%
                </span>
              </div>
            </div>

            <form onSubmit={handleAddProcessToYear} className="flex items-center gap-2">
              <input
                type="text"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                placeholder={`Add process for ${year}...`}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 sm:w-64 shadow-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Audit Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-800 font-bold">
                    <th className="py-3 px-3 min-w-[170px]">Processes / Activities ({year})</th>
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
                  {currentRows.map((row, index) => (
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
                              title={`Schedule audit for ${m} ${year}`}
                            >
                              +
                            </td>
                          );
                        }
                        const cfg = statusCellConfig[item.status] || statusCellConfig.planned;
                        return (
                          <td
                            key={m}
                            onClick={() => handleOpenCellEditor(row, m)}
                            className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                            title={`${cfg.title} - Auditor: ${item.initials || 'None'} (Click to edit)`}
                          >
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`w-5 h-5 rounded-[4px] ${cfg.bg} text-white font-bold flex items-center justify-center text-[10px] shadow-xs`}
                              >
                                {cfg.letter}
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
                      <td className="py-3 px-2 text-center font-bold text-slate-800">{row.totalScore}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveRow(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRow(index, 'down')}
                            disabled={index === currentRows.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(row.id, row.processName)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer ml-1"
                            title="Delete process"
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
        </>
      ) : (
        /* REPORTS SUBTAB (FILTERED BY YEAR) */
        <div className="space-y-6">
          {/* Dynamic Year KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">{year} Audit Reports</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalReportsCount}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Completed in {year}</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{completedReportsCount}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">{year} Average Score</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">{averageAuditScore}%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Findings ({year})</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">{totalFindingsCount}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder={`Search ${year} reports by #, title, auditor...`}
                  className="w-full pl-9 pr-7 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {reportSearch && (
                  <button
                    onClick={() => setReportSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(['ALL', 'Completed', 'Pending Review', 'Draft', 'Follow-up Required'] as const).map(
                    (st) => (
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
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleExportReportsCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  title={`Export ${year} reports as CSV`}
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export {year} CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewReportModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New {year} Report</span>
                </button>
              </div>
            </div>

            {/* Reports Table for Current Year */}
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
                  {filteredYearReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm text-slate-600">
                          No Audit Reports for Year {year}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {reportSearch || reportStatusFilter !== 'ALL'
                            ? `No reports match your filters in year ${year}.`
                            : `Click "New ${year} Report" above to log an internal audit for this period.`}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredYearReports.map((rep) => {
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
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  rep.majorNcrs > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {rep.majorNcrs} Maj
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  rep.minorNcrs > 0
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {rep.minorNcrs} Min
                              </span>
                              <span
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
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColor}`}
                            >
                              {rep.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditReportModal(rep)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="View & Edit Report"
                              >
                                <Eye className="w-4 h-4" />
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
          </div>
        </div>
      )}

      {/* Modal: Edit Matrix Cell */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Audit: {editingCell.processName} ({editingCell.month} {year})
              </h3>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={cellStatus || ''}
                  onChange={(e) => setCellStatus((e.target.value as CellStatus) || null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Unscheduled —</option>
                  <option value="planned">Planned (Grey X)</option>
                  <option value="due">Due This Month (Yellow X)</option>
                  <option value="completed">Completed (Green C)</option>
                  <option value="rescheduled">Rescheduled (Blue R)</option>
                  <option value="overdue">Overdue (Red X)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Auditor Initials</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={cellInitials}
                    onChange={(e) => setCellInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. JS"
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                  Apply to {year}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Row Metrics */}
      {editingMetricsRow && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Findings ({year}): {editingMetricsRow.processName}
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
                <label className="block font-semibold text-slate-700 mb-1">NCRs Count (-10% each)</label>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">OFIs Count (-5% each)</label>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
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
                          : parseInt(editingMetricsRow.ncrs) || 0) * 10) -
                        ((typeof editingMetricsRow.ofis === 'number'
                          ? editingMetricsRow.ofis
                          : parseInt(editingMetricsRow.ofis) || 0) * 5)
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
    </div>
  );
};
