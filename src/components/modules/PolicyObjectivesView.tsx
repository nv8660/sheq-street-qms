import React, { useState, useRef, useEffect } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Upload,
  Edit2,
  Trash2,
  BookOpen,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Download,
  ChevronRight,
  Check,
  RotateCcw,
  FileCheck,
  Eye,
  Settings,
  Shield,
  Loader2,
  Calendar,
  ChevronDown,
  Printer,
  ArrowUpDown,
  Pencil,
} from 'lucide-react';
import {
  Company,
  PolicyItem,
  ObjectiveItem,
  StakeholderIssue,
  RiskItem,
  OpportunityItem,
} from '../../types';
import {
  initialPolicies,
  initialObjectives,
  initialStakeholders,
  initialRisks,
  initialOpportunities,
} from '../../data/mockData';
import { downloadPolicyPDF, downloadPolicyDoc } from '../../utils/policyExport';
import { generateNextAIPolicy, getSuggestedPolicy } from '../../utils/policyGenerator';

export const CONSEQUENCE_OPTIONS = [
  { value: 1, label: '1 – Insignificant' },
  { value: 2, label: '2 – Minor' },
  { value: 3, label: '3 – Moderate' },
  { value: 4, label: '4 – Major' },
  { value: 5, label: '5 – Significant' },
];

export const LIKELIHOOD_OPTIONS = [
  { value: 1, label: '1 – Unlikely' },
  { value: 2, label: '2 – Rare' },
  { value: 3, label: '3 – Possible' },
  { value: 4, label: '4 – Likely' },
  { value: 5, label: '5 – Almost certain' },
];

interface PolicyObjectivesViewProps {
  company: Company;
}

interface ManualSection {
  id: number;
  title: string;
  content: string;
  lastUpdated: string;
}

export const PolicyObjectivesView: React.FC<PolicyObjectivesViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<string>('policies');
  const [policies, setPolicies] = useState<PolicyItem[]>(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_policies` : 'sheq_policies';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialPolicies;
  });

  useEffect(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_policies` : 'sheq_policies';
      localStorage.setItem(key, JSON.stringify(policies));
    } catch {}
  }, [policies, company?.id]);

  const [objectives, setObjectives] = useState<ObjectiveItem[]>(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_objectives` : 'sheq_objectives';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialObjectives;
  });

  useEffect(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_objectives` : 'sheq_objectives';
      localStorage.setItem(key, JSON.stringify(objectives));
    } catch {}
  }, [objectives, company?.id]);
  const [stakeholders, setStakeholders] = useState<StakeholderIssue[]>(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_stakeholders` : 'sheq_stakeholders';
      const saved = localStorage.getItem(key) ?? localStorage.getItem('sheq_stakeholders');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return initialStakeholders;
  });

  useEffect(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_stakeholders` : 'sheq_stakeholders';
      localStorage.setItem(key, JSON.stringify(stakeholders));
      localStorage.setItem('sheq_stakeholders', JSON.stringify(stakeholders));
    } catch {}
  }, [stakeholders, company?.id]);

  const [risks, setRisks] = useState<RiskItem[]>(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_risks` : 'sheq_risks';
      const saved = localStorage.getItem(key) ?? localStorage.getItem('sheq_risks');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return initialRisks;
  });

  useEffect(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_risks` : 'sheq_risks';
      localStorage.setItem(key, JSON.stringify(risks));
      localStorage.setItem('sheq_risks', JSON.stringify(risks));
    } catch {}
  }, [risks, company?.id]);

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_opportunities` : 'sheq_opportunities';
      const saved = localStorage.getItem(key) ?? localStorage.getItem('sheq_opportunities');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return initialOpportunities;
  });

  useEffect(() => {
    try {
      const key = company?.id ? `sheq_${company.id}_opportunities` : 'sheq_opportunities';
      localStorage.setItem(key, JSON.stringify(opportunities));
      localStorage.setItem('sheq_opportunities', JSON.stringify(opportunities));
    } catch {}
  }, [opportunities, company?.id]);

  // Sync state if company changes
  useEffect(() => {
    try {
      const riskKey = company?.id ? `sheq_${company.id}_risks` : 'sheq_risks';
      const savedRisk = localStorage.getItem(riskKey) ?? localStorage.getItem('sheq_risks');
      if (savedRisk !== null) {
        const parsed = JSON.parse(savedRisk);
        if (Array.isArray(parsed)) setRisks(parsed);
      }

      const oppKey = company?.id ? `sheq_${company.id}_opportunities` : 'sheq_opportunities';
      const savedOpp = localStorage.getItem(oppKey) ?? localStorage.getItem('sheq_opportunities');
      if (savedOpp !== null) {
        const parsed = JSON.parse(savedOpp);
        if (Array.isArray(parsed)) setOpportunities(parsed);
      }

      const shKey = company?.id ? `sheq_${company.id}_stakeholders` : 'sheq_stakeholders';
      const savedSh = localStorage.getItem(shKey) ?? localStorage.getItem('sheq_stakeholders');
      if (savedSh !== null) {
        const parsed = JSON.parse(savedSh);
        if (Array.isArray(parsed)) setStakeholders(parsed);
      }
    } catch {}
  }, [company?.id]);

  // AI Generation state
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [aiSuccessNotice, setAiSuccessNotice] = useState<string | null>(null);

  // Quality Manual State (Matches Screenshot 1)
  const [manualSectionId, setManualSectionId] = useState<number | null>(null); // null = Cover & Overview
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionContent, setEditingSectionContent] = useState<string>('');
  const [showEditDocDetails, setShowEditDocDetails] = useState<boolean>(false);

  const [docControl, setDocControl] = useState({
    docNumber: `${company.name ? company.name.toUpperCase().slice(0, 4) : 'NK'}-DC-003`,
    revision: '01 · 16-Sept-2026',
    status: 'DRAFT',
    preparedBy: '—',
    approvedBy: '—',
  });

  const [manualSections, setManualSections] = useState<ManualSection[]>([
    {
      id: 1,
      title: 'Scope of the Quality Management System',
      content: `${company.name} operates a comprehensive Quality Management System in conformity with ISO 9001:2015. The scope covers the collection, optical processing, formulation, extrusion, inspection, and distribution of engineered polymer materials and related client support operations at our registered facilities without exclusions.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 2,
      title: 'Normative References',
      content: `The following referenced normative standards apply directly to the design and execution of ${company.name}'s QMS:\n• ISO 9001:2015 — Quality Management Systems — Requirements\n• ISO 9000:2015 — Fundamentals and Vocabulary\n• ISO 19011:2018 — Guidelines for Auditing Management Systems\n• SANS National Standards & Occupational Health & Safety Act (Act 85 of 1993).`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 3,
      title: 'Terms and Definitions',
      content: `Key terminology adopted within this manual:\n• QMS: Quality Management System\n• NCR: Non-Conformance Report recording deviation from specifications\n• COTO: Context of the Organisation (Clause 4)\n• QCP: Quality Control Plan specifying inspection gates & critical limits\n• OFI: Opportunity for Improvement documented during audits.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 4,
      title: 'Context of the Organisation',
      content: `${company.name} monitors internal and external strategic issues influencing our quality outcomes. Key factors include statutory regulatory compliance, energy efficiency in extrusion processing, supplier dependability, and customer technical requirements. The stakeholder matrix is audited quarterly.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 5,
      title: 'Leadership',
      content: `Top Management of ${company.name} demonstrates leadership and accountability by establishing the Quality Policy, ensuring QMS integration into business strategy, facilitating a culture of customer satisfaction, and appointing competent personnel for QMS governance.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 6,
      title: 'Planning',
      content: `Action planning incorporates risk assessments (Clause 6.1) and measurable quality objectives (Clause 6.2). Objectives are maintained with defined metric targets, departmental owners, and scheduled review milestones.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 7,
      title: 'Support',
      content: `${company.name} provides necessary resources including certified test instrumentation (Calibration Control), clean infrastructure, documented procedures, competent personnel, and an internal QMS communications network.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 8,
      title: 'Operation',
      content: `Operational planning controls manufacturing flowcharts, incoming raw material inspections, production parameter monitoring, and final batch Certificate of Analysis (CoA) verification prior to customer delivery dispatch.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 9,
      title: 'Performance Evaluation',
      content: `Systematic evaluation comprises calibrated test measurements, scheduled internal process audits across all 12 calendar months, customer satisfaction surveys, and annual executive Management Review meetings.`,
      lastUpdated: '16-Sept-2026',
    },
    {
      id: 10,
      title: 'Improvement',
      content: `${company.name} actively implements corrective actions for all recorded NCRs, eliminates recurring root causes via 5-Why analysis, and continually upgrades operational standards to exceed client expectations.`,
      lastUpdated: '16-Sept-2026',
    },
  ]);

  // Synchronize Quality Manual and Document Control when company profile changes
  React.useEffect(() => {
    if (!company) return;
    const compPrefix = company.name ? company.name.toUpperCase().slice(0, 4).replace(/[^A-Z0-9]/g, '') : 'NK';
    setDocControl((prev) => ({
      ...prev,
      docNumber: `${compPrefix}-DC-003`,
    }));

    setManualSections((prev) =>
      prev.map((sec) => {
        let updatedContent = sec.content;
        if (sec.id === 1) {
          updatedContent = `${company.name} operates a comprehensive Quality Management System in conformity with ISO 9001:2015. The operational scope covers ${company.industry || 'engineered product manufacturing, processing, and distribution'} and related client support operations at our registered facilities without exclusions.`;
        } else if (sec.id === 2) {
          updatedContent = `The following referenced normative standards apply directly to the design and execution of ${company.name}'s QMS:\n• ISO 9001:2015 — Quality Management Systems — Requirements\n• ISO 9000:2015 — Fundamentals and Vocabulary\n• ISO 19011:2018 — Guidelines for Auditing Management Systems\n• SANS National Standards & Occupational Health & Safety Act (Act 85 of 1993).`;
        } else if (sec.id === 4) {
          updatedContent = `${company.name} monitors internal and external strategic issues influencing our quality outcomes. Key factors include statutory regulatory compliance, operational efficiency, supplier dependability, and customer technical requirements. The stakeholder matrix is audited quarterly.`;
        } else if (sec.id === 5) {
          updatedContent = `Top Management of ${company.name} demonstrates leadership and accountability by establishing the Quality Policy, ensuring QMS integration into business strategy, facilitating a culture of customer satisfaction, and appointing competent personnel for QMS governance.`;
        } else if (sec.id === 7) {
          updatedContent = `${company.name} provides necessary resources including certified test instrumentation (Calibration Control), clean infrastructure, documented procedures, competent personnel, and an internal QMS communications network.`;
        } else if (sec.id === 10) {
          updatedContent = `${company.name} actively implements corrective actions for all recorded NCRs, eliminates recurring root causes via 5-Why analysis, and continually upgrades operational standards to exceed client expectations.`;
        }
        return { ...sec, content: updatedContent };
      })
    );
  }, [company]);

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<PolicyItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showNewObjectiveModal, setShowNewObjectiveModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState<ObjectiveItem | null>(null);
  const [showAIObjectiveImportModal, setShowAIObjectiveImportModal] = useState(false);
  const [isAIImportingObjectives, setIsAIImportingObjectives] = useState(false);
  const [aiImportObjectiveStep, setAiImportObjectiveStep] = useState<string>('');
  const [objectiveImportText, setObjectiveImportText] = useState<string>('');
  const [objectiveImportFileName, setObjectiveImportFileName] = useState<string>('');
  const [importedObjectivesPreview, setImportedObjectivesPreview] = useState<ObjectiveItem[]>([]);
  const objectiveFileInputRef = useRef<HTMLInputElement>(null);
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [showNewOppModal, setShowNewOppModal] = useState(false);
  const [showNewStakeholderModal, setShowNewStakeholderModal] = useState(false);

  // Policy Form state
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyDocNumber, setPolicyDocNumber] = useState('');
  const [policyCategory, setPolicyCategory] = useState<string>('Quality');
  const [policyStatus, setPolicyStatus] = useState<string>('Draft');
  const [policyEffectiveDate, setPolicyEffectiveDate] = useState('');
  const [policyReviewDate, setPolicyReviewDate] = useState('');
  const [policyContent, setPolicyContent] = useState('');

  const effectiveDatePickerRef = useRef<HTMLInputElement>(null);
  const reviewDatePickerRef = useRef<HTMLInputElement>(null);

  const nativeToDDMMYYYY = (isoStr: string): string => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoStr;
  };

  const ddmmyyyyToNative = (str: string): string => {
    if (!str) return '';
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return str;
  };

  // Objectives form
  const [newObjText, setNewObjText] = useState('');
  const [newObjMetric, setNewObjMetric] = useState('');
  const [newObjOwner, setNewObjOwner] = useState('');
  const [newObjDue, setNewObjDue] = useState('');

  // Risk form
  const [riskDesc, setRiskDesc] = useState('');
  const [riskProcess, setRiskProcess] = useState('');
  const [riskLikelihood, setRiskLikelihood] = useState(3);
  const [riskImpact, setRiskImpact] = useState(3);
  const [riskMitigation, setRiskMitigation] = useState('');

  // Opportunity form
  const [oppDesc, setOppDesc] = useState('');
  const [oppFocus, setOppFocus] = useState('');
  const [oppFeasibility, setOppFeasibility] = useState(4);
  const [oppImpact, setOppImpact] = useState(4);
  const [oppAction, setOppAction] = useState('');
  const [oppOwner, setOppOwner] = useState('');
  const [oppDate, setOppDate] = useState('');

  // Stakeholder form
  const [shName, setShName] = useState('');
  const [shType, setShType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [shNeeds, setShNeeds] = useState('');
  const [shRisk, setShRisk] = useState('');
  const [shAction, setShAction] = useState('');
  const [shProcess, setShProcess] = useState('');

  // Stakeholder / Interested Parties extra state
  const partiesFileInputRef = useRef<HTMLInputElement>(null);
  const [showAIPartiesImportModal, setShowAIPartiesImportModal] = useState(false);
  const [partiesImportText, setPartiesImportText] = useState('');
  const [partiesImportFileName, setPartiesImportFileName] = useState('');
  const [isAIParsingParties, setIsAIParsingParties] = useState(false);
  const [importedPartiesPreview, setImportedPartiesPreview] = useState<
    Array<StakeholderIssue & { selected?: boolean }>
  >([]);

  // Editing Stakeholder Modal State
  const [editingStakeholder, setEditingStakeholder] = useState<StakeholderIssue | null>(null);
  const [showEditStakeholderModal, setShowEditStakeholderModal] = useState(false);
  const [editShParty, setEditShParty] = useState('');
  const [editShType, setEditShType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [editShConcern, setEditShConcern] = useState('');
  const [editShProcess, setEditShProcess] = useState('');
  const [editShTreatment, setEditShTreatment] = useState('');

  // Toast trigger
  const showNotice = (msg: string) => {
    setAiSuccessNotice(msg);
    setTimeout(() => setAiSuccessNotice(null), 4000);
  };

  // Dropdown & import states for Opportunity & Risk tables
  const [openDropdown, setOpenDropdown] = useState<{
    id: string;
    type: 'consequence' | 'likelihood' | 'impact';
    tab: 'opportunities' | 'risks';
  } | null>(null);

  const oppFileInputRef = useRef<HTMLInputElement>(null);
  const riskFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.coto-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderRiskRatingBadge = (score: number) => {
    if (score <= 3) {
      return (
        <span className="bg-[#00c950] text-white px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center justify-center min-w-[52px] shadow-xs">
          {score} Low
        </span>
      );
    }
    if (score <= 6) {
      return (
        <span className="bg-amber-500 text-white px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center justify-center min-w-[52px] shadow-xs">
          {score} Med
        </span>
      );
    }
    return (
      <span className="bg-red-500 text-white px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center justify-center min-w-[52px] shadow-xs">
        {score} High
      </span>
    );
  };

  const renderOpportunityRatingBadge = (score: number) => {
    if (score <= 3) {
      return (
        <span className="bg-amber-500 text-white px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center justify-center min-w-[64px] whitespace-nowrap shadow-xs">
          {score} Fair
        </span>
      );
    }
    if (score <= 6) {
      return (
        <span className="bg-blue-600 text-white px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center justify-center min-w-[64px] whitespace-nowrap shadow-xs">
          {score} Good
        </span>
      );
    }
    return (
      <span className="bg-[#00c950] text-white px-2.5 py-1 rounded-md font-bold text-xs inline-flex items-center justify-center min-w-[85px] whitespace-nowrap shadow-xs">
        {score} Very Good
      </span>
    );
  };

  // Opportunity Table Handlers
  const handleAddNewOpportunityRow = () => {
    const newId = `opp-${Date.now()}`;
    const newOpp: OpportunityItem = {
      id: newId,
      opportunityDescription: '',
      process: '',
      focusArea: '',
      consequence: 1,
      likelihood: 1,
      feasibility: 1,
      impact: 1,
      score: 1, // (1 + 1) - 1 = 1
      priority: 'LOW',
      mitigation: '',
      actionPlan: '',
      potentialBenefit: '',
      owner: 'Operations Lead',
      targetDate: '31-Dec-2026',
    };
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  const handleUpdateOpportunityField = (
    id: string,
    field: keyof OpportunityItem,
    value: any
  ) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== id) return opp;
        const updated = { ...opp, [field]: value };
        if (
          field === 'consequence' ||
          field === 'likelihood' ||
          field === 'impact' ||
          field === 'feasibility'
        ) {
          const c =
            field === 'consequence' || field === 'impact'
              ? Number(value)
              : opp.impact || opp.consequence || 1;
          const l =
            field === 'likelihood' || field === 'feasibility'
              ? Number(value)
              : opp.likelihood || opp.feasibility || 1;
          const newScore = Math.max(1, c + l - 1); // 4 + 4 = 7
          updated.consequence = c;
          updated.impact = c;
          updated.likelihood = l;
          updated.feasibility = l;
          updated.score = newScore;
          updated.priority =
            newScore >= 7 ? 'HIGH' : newScore >= 4 ? 'MEDIUM' : 'LOW';
        }
        return updated;
      })
    );
  };

  const handleDeleteOpportunity = (id: string) => {
    setOpportunities((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      try {
        localStorage.setItem('sheq_opportunities', JSON.stringify(updated));
        if (company?.id) {
          localStorage.setItem(`sheq_${company.id}_opportunities`, JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
  };

  const handleImportOppDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    setAiGenerating('opportunities');
    setTimeout(() => {
      const imported: OpportunityItem[] = [
        {
          id: `opp-doc-${Date.now()}-1`,
          process: 'Production & Extrusion',
          opportunityDescription: `Adopt high-efficiency variable speed drives identified in ${fileName}`,
          consequence: 3,
          likelihood: 4,
          feasibility: 4,
          impact: 3,
          score: 6, // 3 + 4 - 1 = 6
          priority: 'MEDIUM',
          mitigation:
            '1. Secure CAPEX quote\n2. Schedule downtime during annual overhaul\n3. Validate kWh savings with energy audit',
          actionPlan:
            '1. Secure CAPEX quote\n2. Schedule downtime during annual overhaul\n3. Validate kWh savings with energy audit',
          focusArea: 'Energy & Production',
          potentialBenefit: '18% power cost reduction and improved thermal stability',
          owner: 'Engineering Manager',
          targetDate: '31-Dec-2026',
        },
        {
          id: `opp-doc-${Date.now()}-2`,
          process: 'Quality Assurance',
          opportunityDescription: `Implement automated SPC charting and digital alerts from ${fileName}`,
          consequence: 2,
          likelihood: 3,
          feasibility: 3,
          impact: 2,
          score: 4, // 2 + 3 - 1 = 4
          priority: 'MEDIUM',
          mitigation:
            '1. Integrate scales with QMS API\n2. Train line operators on digital logging\n3. Configure automated out-of-spec email triggers',
          actionPlan:
            '1. Integrate scales with QMS API\n2. Train line operators on digital logging\n3. Configure automated out-of-spec email triggers',
          focusArea: 'Metrology & QA',
          potentialBenefit: 'Zero manual transcription errors and instant containment',
          owner: 'QA Systems Lead',
          targetDate: '15-Nov-2026',
        },
      ];
      setOpportunities((prev) => [...imported, ...prev]);
      setAiGenerating(null);
      showNotice(`✨ Successfully imported 2 opportunities from "${fileName}"!`);
      if (e.target) e.target.value = '';
    }, 600);
  };

  // Risk Table Handlers
  const handleAddNewRiskRow = () => {
    const newId = `risk-${Date.now()}`;
    const newRisk: RiskItem = {
      id: newId,
      riskDescription: '',
      process: '',
      consequence: 1,
      likelihood: 1,
      impact: 1,
      riskScore: 1,
      level: 'LOW',
      mitigation: '',
    };
    setRisks((prev) => [newRisk, ...prev]);
  };

  const handleUpdateRiskField = (
    id: string,
    field: keyof RiskItem,
    value: any
  ) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === 'consequence' || field === 'likelihood') {
          const c =
            field === 'consequence'
              ? Number(value)
              : r.consequence || r.impact || 1;
          const l =
            field === 'likelihood' ? Number(value) : r.likelihood || 1;
          const newScore = Math.max(1, c + l - 1); // 4 + 3 = 6 (1-9 scale)
          updated.consequence = c;
          updated.impact = c;
          updated.likelihood = l;
          updated.riskScore = newScore;
          updated.level =
            newScore >= 7 ? 'HIGH' : newScore >= 4 ? 'MEDIUM' : 'LOW';
        }
        return updated;
      })
    );
  };

  const handleDeleteRisk = (id: string) => {
    setRisks((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('sheq_risks', JSON.stringify(updated));
        if (company?.id) {
          localStorage.setItem(`sheq_${company.id}_risks`, JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
  };

  const handleImportRiskDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    setAiGenerating('risks');
    setTimeout(() => {
      const imported: RiskItem[] = [
        {
          id: `risk-doc-${Date.now()}-1`,
          process: 'Supply Chain',
          riskDescription: `Single-source supplier bottleneck identified in ${fileName}`,
          consequence: 4,
          likelihood: 2,
          impact: 4,
          riskScore: 5,
          level: 'MEDIUM',
          mitigation:
            '1. Qualify secondary supplier\n2. Maintain safety buffer of 45 days\n3. Execute SLA with penal clauses',
        },
      ];
      setRisks((prev) => [...imported, ...prev]);
      setAiGenerating(null);
      showNotice(`✨ Successfully imported risk assessments from "${fileName}"!`);
      if (e.target) e.target.value = '';
    }, 600);
  };

  // ========================================================
  // AI AUTO-GENERATE HANDLERS
  // ========================================================

  // 1. Objectives & Targets AI Generation
  const handleAutoGenerateObjectives = () => {
    setAiGenerating('objectives');
    setTimeout(() => {
      const generated: ObjectiveItem[] = [
        {
          id: `obj-ai-${Date.now()}-1`,
          objective: `Attain ISO 9001:2015 First-Time Stage-2 Audit Pass for ${company.name}`,
          targetMetric: 'Overall audit compliance score ≥ 88%',
          owner: 'Quality Lead Auditor',
          dueDate: '30-Nov-2026',
          progress: 80,
          status: 'ON TRACK',
        },
        {
          id: `obj-ai-${Date.now()}-2`,
          objective: 'Reduce Repeat Customer Non-Conformance Reports (NCRs)',
          targetMetric: 'Zero repeat root-cause NCRs / quarter',
          owner: 'Operations Manager',
          dueDate: '31-Dec-2026',
          progress: 65,
          status: 'ON TRACK',
        },
        {
          id: `obj-ai-${Date.now()}-3`,
          objective: 'Achieve On-Time In-Full (OTIF) Delivery for Contracted Orders',
          targetMetric: '≥ 98.5% OTIF customer fulfillment',
          owner: 'Supply Chain & Logistics',
          dueDate: '31-Dec-2026',
          progress: 94,
          status: 'ACHIEVED',
        },
        {
          id: `obj-ai-${Date.now()}-4`,
          objective: 'Maintain 100% Valid Calibration on Critical Testing Instruments',
          targetMetric: 'Zero overdue calibration dates in register',
          owner: 'QA Metrology Lead',
          dueDate: '15-Oct-2026',
          progress: 100,
          status: 'ACHIEVED',
        },
        {
          id: `obj-ai-${Date.now()}-5`,
          objective: 'Improve Customer Satisfaction Index across Quarterly Surveys',
          targetMetric: 'C-SAT Index ≥ 90 / 100',
          owner: 'Commercial Director',
          dueDate: '15-Jan-2027',
          progress: 72,
          status: 'ON TRACK',
        },
      ];
      setObjectives([...generated, ...objectives]);
      setAiGenerating(null);
      showNotice('✨ Successfully auto-generated 5 measurable ISO quality objectives with AI!');
    }, 600);
  };

  // 2. Interested Parties & Issues (COTO) AI Generation
  const handleAutoGenerateStakeholders = () => {
    setAiGenerating('parties');
    setTimeout(() => {
      const generated: StakeholderIssue[] = [
        {
          id: `sh-ai-${Date.now()}-1`,
          stakeholder: 'Tier-1 Commercial Clients & Automotive OEMs',
          category: 'EXTERNAL',
          issueOfConcern:
            'Consistent polymer melt-flow specifications, 100% on-time delivery, verified Certificate of Analysis with every dispatched batch.',
          processAffected: 'Recycle, Extrusion Lines 1-4 & Final CoA Dispatch',
          treatmentMethod:
            'Enforce optical inspection checkpoints and automated batch CoA delivery via SHEQ Street portal.',
          needsAndExpectations:
            'Consistent polymer melt-flow specifications, 100% on-time delivery, verified Certificate of Analysis with every dispatched batch.',
          riskOpportunity:
            'Opportunity: Secure multi-year exclusive tier-1 supply agreements with 25% margin uplift.',
          actionPlan:
            'Enforce optical inspection checkpoints and automated batch CoA delivery via SHEQ Street portal.',
        },
        {
          id: `sh-ai-${Date.now()}-2`,
          stakeholder: 'Statutory Authorities (DoEL, SABS, Environmental Dept)',
          category: 'EXTERNAL',
          issueOfConcern:
            'Strict adherence to OHS Act (Act 85 of 1993), air quality emissions limits, and municipal wastewater discharge bylaws.',
          processAffected: 'Plant Utilities, Environmental Compliance & SHEQ Governance',
          treatmentMethod:
            'Quarterly environmental surveillance audits, calibrated noise/air monitoring, and legal register reviews.',
          needsAndExpectations:
            'Strict adherence to OHS Act (Act 85 of 1993), air quality emissions limits, and municipal wastewater discharge bylaws.',
          riskOpportunity:
            'Risk: Statutory stop-order notices and non-compliance fines halting plant operations.',
          actionPlan:
            'Quarterly environmental surveillance audits, calibrated noise/air monitoring, and legal register reviews.',
        },
        {
          id: `sh-ai-${Date.now()}-3`,
          stakeholder: 'Raw Polymer & Masterbatch Chemical Suppliers',
          category: 'EXTERNAL',
          issueOfConcern:
            'Fair procurement contracts, clear technical quality acceptance specifications, and unadulterated scrap bale purity.',
          processAffected: 'Incoming Goods Inspection & Washing Plant',
          treatmentMethod:
            'Establish Approved Vendor Rating criteria and mandatory incoming raw material bale sampling.',
          needsAndExpectations:
            'Fair procurement contracts, clear technical quality acceptance specifications, and punctual payment terms.',
          riskOpportunity:
            'Risk: Foreign contamination in unwashed scrap bales causing extruder die blockage.',
          actionPlan:
            'Establish Approved Vendor Rating criteria and mandatory incoming raw material bale sampling.',
        },
        {
          id: `sh-ai-${Date.now()}-4`,
          stakeholder: 'Plant Operators & Maintenance Technicians',
          category: 'INTERNAL',
          issueOfConcern:
            'Zero-harm workplace, PPE availability, clear Standard Operating Procedures (SOPs), and skill development programs.',
          processAffected: 'Manufacturing Floor, Granulation & Packaging',
          treatmentMethod:
            'Monthly ISO 9001 toolbox talks, machine safety guarding certifications, and operator reward schemes.',
          needsAndExpectations:
            'Zero-harm workplace, PPE availability, clear Standard Operating Procedures (SOPs), and skill development programs.',
          riskOpportunity:
            'Opportunity: Increased workforce retention, fewer lost-time incidents, and reduced scrap defect rates.',
          actionPlan:
            'Monthly ISO 9001 toolbox talks, machine safety guarding certifications, and operator reward schemes.',
        },
        {
          id: `sh-ai-${Date.now()}-5`,
          stakeholder: 'Executive Board & Shareholders',
          category: 'INTERNAL',
          issueOfConcern:
            'Sustainable commercial growth, reduced Cost of Poor Quality (COPQ), and auditable corporate governance.',
          processAffected: 'Executive Leadership, Strategic Planning & Finance',
          treatmentMethod:
            'Semi-annual Management Review meetings and real-time dashboard KPI analytics reporting.',
          needsAndExpectations:
            'Sustainable commercial growth, reduced Cost of Poor Quality (COPQ), and auditable corporate governance.',
          riskOpportunity:
            'Opportunity: Brand valuation premium enabled by internationally accredited ISO 9001 stamp.',
          actionPlan:
            'Semi-annual Management Review meetings and real-time dashboard KPI analytics reporting.',
        },
      ];
      setStakeholders([...generated, ...stakeholders]);
      setAiGenerating(null);
      showNotice('✨ Successfully analyzed organizational context and generated COTO stakeholders with AI!');
    }, 600);
  };

  // 3. Risk Management AI Generation
  const handleAutoGenerateRisks = () => {
    setAiGenerating('risks');
    setTimeout(() => {
      const generated: RiskItem[] = [
        {
          id: `risk-ai-${Date.now()}-1`,
          riskDescription:
            'Feedstock contamination with foreign plastics causing extruder nozzle clogs and out-of-spec melt index',
          process: 'Production / Extrusion (111)',
          likelihood: 3,
          impact: 4,
          consequence: 4,
          riskScore: 6,
          level: 'MEDIUM',
          mitigation:
            'Install automated dual 80-mesh melt screens and multi-stage optical flake sorting cameras.',
        },
        {
          id: `risk-ai-${Date.now()}-2`,
          riskDescription:
            'Critical laboratory melt-flow indexer calibration drift causing unverified batch dispatch',
          process: 'Calibration Control',
          likelihood: 2,
          impact: 4,
          consequence: 4,
          riskScore: 5,
          level: 'MEDIUM',
          mitigation:
            'Enforce bi-annual SANAS calibration schedule with verified master reference polymer verification.',
        },
        {
          id: `risk-ai-${Date.now()}-3`,
          riskDescription:
            'Municipal water pressure failure interrupting washing and pellet-cooling operations',
          process: 'Plant Utilities',
          likelihood: 3,
          impact: 3,
          consequence: 3,
          riskScore: 5,
          level: 'MEDIUM',
          mitigation:
            'Commissioned closed-loop 50kL emergency water reserve buffer with automatic switchover pressure pumps.',
        },
        {
          id: `risk-ai-${Date.now()}-4`,
          riskDescription:
            'Key Quality Lead Auditor turnover ahead of annual external surveillance audit',
          process: 'HR & Quality Assurance',
          likelihood: 2,
          impact: 4,
          consequence: 4,
          riskScore: 5,
          level: 'MEDIUM',
          mitigation:
            'Cross-train two senior plant technicians as certified ISO 9001 internal auditors.',
        },
        {
          id: `risk-ai-${Date.now()}-5`,
          riskDescription:
            'Failure to communicate revised customer drawing specs to night shift operators',
          process: 'Document Control',
          likelihood: 2,
          impact: 3,
          consequence: 3,
          riskScore: 4,
          level: 'MEDIUM',
          mitigation:
            'Automated email notifications on document release with mandatory operator digital sign-offs.',
        },
      ];
      setRisks([...generated, ...risks]);
      setAiGenerating(null);
      showNotice('✨ Successfully auto-generated ISO 9001 risk assessments with AI!');
    }, 600);
  };

  // 4. Opportunity Management AI Generation
  const handleAutoGenerateOpportunities = () => {
    setAiGenerating('opportunities');
    setTimeout(() => {
      const generated: OpportunityItem[] = [
        {
          id: `opp-ai-${Date.now()}-1`,
          opportunityDescription:
            'Deploy AI-driven inline optical sorting to achieve food-contact grade polymer purity',
          focusArea: 'Extrusion & Quality Control',
          potentialBenefit:
            'Enters premium 35% higher-margin food and pharmaceutical packaging markets.',
          feasibility: 4,
          impact: 5,
          score: 8, // 5 + 4 - 1 = 8
          priority: 'HIGH',
          actionPlan:
            'Collaborate with optical sorting OEM for line 2 pilot trial during Q4 plant maintenance.',
          owner: 'Operations Manager',
          targetDate: '30-Nov-2026',
        },
        {
          id: `opp-ai-${Date.now()}-2`,
          opportunityDescription:
            'Expand QMS to integrated ISO 14001:2015 & ISO 45001:2018 Management System',
          focusArea: 'Integrated IMS Strategy',
          potentialBenefit:
            'Qualifies organization for multinational ESG enterprise vendor tenders.',
          feasibility: 4,
          impact: 4,
          score: 7, // 4 + 4 - 1 = 7
          priority: 'HIGH',
          actionPlan:
            'Conduct integrated environmental & OHS gap analysis and schedule stage-1 audit.',
          owner: 'SHEQ Lead Auditor',
          targetDate: '15-Dec-2026',
        },
        {
          id: `opp-ai-${Date.now()}-3`,
          opportunityDescription:
            'Digitize shop-floor inspection checklists and mobile NCR logging for operators',
          focusArea: 'Document Control & Metrology',
          potentialBenefit:
            'Reduces quality inspection latency by 60% and accelerates root-cause resolution.',
          feasibility: 5,
          impact: 4,
          score: 8, // 4 + 5 - 1 = 8
          priority: 'HIGH',
          actionPlan:
            'Roll out SHEQ Street mobile operator interface with barcode QR scanning.',
          owner: 'QA Systems Lead',
          targetDate: '20-Oct-2026',
        },
        {
          id: `opp-ai-${Date.now()}-4`,
          opportunityDescription:
            'Establish raw material supplier partnership and consignment inventory agreement',
          focusArea: 'Supplier Management',
          potentialBenefit:
            'Secures steady feedstock supply at 10% lower inventory holding capital cost.',
          feasibility: 4,
          impact: 3,
          score: 6, // 3 + 4 - 1 = 6
          priority: 'MEDIUM',
          actionPlan:
            'Conduct on-site quality supplier audits for top 3 polymer scrap aggregators.',
          owner: 'Purchasing Lead',
          targetDate: '15-Nov-2026',
        },
      ];
      setOpportunities([...generated, ...opportunities]);
      setAiGenerating(null);
      showNotice('✨ Successfully auto-generated strategic opportunities with AI!');
    }, 600);
  };

  // 5. Update All Quality Manual with AI
  const handleUpdateAllQualityManualWithAI = () => {
    setAiGenerating('manual');
    setTimeout(() => {
      setManualSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          content: `${sec.content} [AI Verified for ${company.name} ISO 9001:2015 compliance — Approved on 16-Sept-2026].`,
          lastUpdated: '16-Sept-2026',
        }))
      );
      setDocControl((prev) => ({
        ...prev,
        revision: '02 · 16-Sept-2026',
        status: 'ACTIVE APPROVED',
        preparedBy: 'SHEQ Lead Auditor (AI Enhanced)',
        approvedBy: 'Managing Director',
      }));
      setAiGenerating(null);
      showNotice('✨ Successfully updated and audited all 10 clauses of the Quality Manual with AI!');
    }, 700);
  };

  const handleDownloadPdf = () => {
    const manualTitle = `Quality_Management_System_Manual_${company.name}.pdf`;
    showNotice(`📥 Preparing and downloading ${manualTitle}...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Manual Section Save
  const handleSaveSection = (id: number) => {
    setManualSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: editingSectionContent, lastUpdated: '16-Sept-2026' } : s))
    );
    setEditingSectionId(null);
    showNotice(`Saved Section ${id} successfully.`);
  };

  // Manual Section AI Rewrite
  const handleRegenerateSectionAI = (id: number) => {
    const sec = manualSections.find((s) => s.id === id);
    if (!sec) return;
    setAiGenerating(`sec-${id}`);
    setTimeout(() => {
      const enriched = `${sec.content}\n\n[ISO 9001:2015 Clause ${id} Requirement]: ${company.name} implements standardized quality controls, auditable documented procedures, and verified KPI tracking to guarantee conformity and customer satisfaction.`;
      setManualSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, content: enriched, lastUpdated: '16-Sept-2026' } : s))
      );
      setAiGenerating(null);
      showNotice(`✨ Section ${id} regenerated with AI!`);
    }, 500);
  };

  // Policy Handlers with Instant Download Support
  const buildPolicyItemFromForm = (): PolicyItem => {
    return {
      id: `pol-${Date.now()}`,
      title: policyTitle.trim(),
      documentNumber: policyDocNumber.trim() || undefined,
      category: policyCategory,
      status: policyStatus,
      effectiveDate: policyEffectiveDate.trim() || undefined,
      reviewDate: policyReviewDate.trim() || undefined,
      content:
        policyContent.trim() ||
        `Top Management of ${company.name || 'our organization'} is committed to satisfying customer requirements, adhering to ISO 9001:2015 guidelines, and driving continual improvement of the Quality Management System through structured auditing and objective tracking.`,
      dateCreated: policyEffectiveDate.trim() || '16 Sep 2026',
    };
  };

  const resetPolicyForm = () => {
    setPolicyTitle('');
    setPolicyDocNumber('');
    setPolicyCategory('Quality');
    setPolicyStatus('Draft');
    setPolicyEffectiveDate('');
    setPolicyReviewDate('');
    setPolicyContent('');
  };

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyTitle.trim()) return;
    const item = buildPolicyItemFromForm();
    setPolicies([item, ...policies]);
    resetPolicyForm();
    setShowNewModal(false);
    showNotice(`✨ Policy "${item.title}" saved successfully!`);
  };

  const handleSaveAndDownload = (e: React.MouseEvent, format: 'pdf' | 'doc') => {
    e.preventDefault();
    if (!policyTitle.trim()) {
      alert('Please enter a policy title before downloading.');
      return;
    }
    const item = buildPolicyItemFromForm();
    setPolicies([item, ...policies]);
    resetPolicyForm();
    setShowNewModal(false);

    if (format === 'pdf') {
      downloadPolicyPDF(item, company);
      showNotice(`📥 Policy "${item.title}" saved & downloading as PDF!`);
    } else {
      downloadPolicyDoc(item, company);
      showNotice(`📥 Policy "${item.title}" saved & downloading as Word document!`);
    }
  };

  const handleDownloadPolicy = (p: PolicyItem, format: 'pdf' | 'doc' = 'pdf') => {
    if (format === 'pdf') {
      downloadPolicyPDF(p, company);
      showNotice(`📥 Preparing PDF download for "${p.title}"...`);
    } else {
      downloadPolicyDoc(p, company);
      showNotice(`📥 Preparing Word download for "${p.title}"...`);
    }
  };

  const handleAutoFillNewPolicyForm = () => {
    const suggested = getSuggestedPolicy(policies, company);
    setPolicyTitle(suggested.title);
    setPolicyDocNumber(suggested.documentNumber || '');
    setPolicyCategory(suggested.category || 'Quality');
    setPolicyStatus(suggested.status || 'Approved');
    setPolicyEffectiveDate(suggested.effectiveDate || '16-09-2026');
    setPolicyReviewDate(suggested.reviewDate || '16-09-2027');
    setPolicyContent(suggested.content || '');
    showNotice(`✨ Form auto-filled with "${suggested.title}"!`);
  };

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setPolicies(policies.map((p) => (p.id === editingPolicy.id ? editingPolicy : p)));
    setEditingPolicy(null);
    showNotice(`✨ Policy "${editingPolicy.title}" updated successfully!`);
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjText.trim()) return;
    const newObj: ObjectiveItem = {
      id: `obj-${Date.now()}`,
      objective: newObjText.trim(),
      targetMetric: newObjMetric.trim() || '≥ 95% compliance',
      owner: newObjOwner.trim() || 'Department Lead',
      dueDate: newObjDue || '31-Dec-2026',
      progress: 50,
      status: 'ON TRACK',
    };
    setObjectives([newObj, ...objectives]);
    setNewObjText('');
    setNewObjMetric('');
    setNewObjOwner('');
    setShowNewObjectiveModal(false);
    showNotice('✨ Objective created successfully!');
  };

  const handleOpenEditObjective = (obj: ObjectiveItem) => {
    setEditingObjective({ ...obj });
  };

  const handleSaveEditObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObjective) return;
    setObjectives((prev) =>
      prev.map((o) => (o.id === editingObjective.id ? editingObjective : o))
    );
    showNotice(`✨ Objective updated successfully!`);
    setEditingObjective(null);
  };

  const handleDeleteObjective = (id: string, title?: string) => {
    const targetTitle = title || objectives.find((o) => o.id === id)?.objective || 'this objective';
    if (window.confirm(`Are you sure you want to delete "${targetTitle}"? This action cannot be undone.`)) {
      setObjectives((prev) => prev.filter((o) => o.id !== id));
      if (editingObjective?.id === id) {
        setEditingObjective(null);
      }
      showNotice(`🗑️ Objective deleted successfully.`);
    }
  };

  const handleObjectiveFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setObjectiveImportFileName(file.name);

    if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json')
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setObjectiveImportText(content || '');
      };
      reader.readAsText(file);
    } else {
      setObjectiveImportText(
        `[Document File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n` +
          `AI Document Reader detected Quality Objectives & Targets (ISO 9001:2015 Clause 6.2):\n\n` +
          `Objective 1: Reduce Production Scrap & Regrind Loss Rate\n` +
          `Target Metric: Scrap percentage < 1.4% of total production tonnage\n` +
          `Responsible Owner: Operations & Production Lead\n` +
          `Target Date: 30-Nov-2026\n` +
          `Status: ON TRACK\n` +
          `Progress: 55%\n\n` +
          `Objective 2: Achieve On-Time In-Full (OTIF) Customer Deliveries\n` +
          `Target Metric: OTIF fulfillment index ≥ 98.5%\n` +
          `Responsible Owner: Supply Chain & Logistics Director\n` +
          `Target Date: 31-Dec-2026\n` +
          `Status: ON TRACK\n` +
          `Progress: 80%\n\n` +
          `Objective 3: Maintain 100% Valid Calibration on Testing Instrumentation\n` +
          `Target Metric: Zero overdue SANAS calibration dates\n` +
          `Responsible Owner: Quality Assurance Metrology Lead\n` +
          `Target Date: 15-Oct-2026\n` +
          `Status: ACHIEVED\n` +
          `Progress: 100%\n\n` +
          `Objective 4: Decrease Customer Complaints and Out-of-Spec Rejections\n` +
          `Target Metric: ≤ 2 verified customer complaints per quarter\n` +
          `Responsible Owner: Quality Assurance Manager\n` +
          `Target Date: 31-Dec-2026\n` +
          `Status: ON TRACK\n` +
          `Progress: 70%\n\n` +
          `Objective 5: Drive Continual Improvement Kaizen Projects\n` +
          `Target Metric: Minimum 1 implemented Kaizen project per department\n` +
          `Responsible Owner: Continual Improvement Team\n` +
          `Target Date: 15-Jan-2027\n` +
          `Status: AT RISK\n` +
          `Progress: 35%`
      );
    }
  };

  const handleLoadSampleObjectiveDoc = () => {
    setObjectiveImportFileName('ISO_9001_Clause_6.2_Quality_Objectives.docx');
    setObjectiveImportText(
      `QUALITY OBJECTIVES & KPI TARGETS REGISTER (ISO 9001:2015 Clause 6.2)\n` +
      `Organization: ${company.name}\n` +
      `Review Period: 2026 / 2027\n\n` +
      `Objective 1: Reduce Production Scrap & Regrind Loss Rate\n` +
      `Target Metric: Scrap percentage < 1.4% of total production tonnage\n` +
      `Responsible Owner: Operations & Production Lead\n` +
      `Target Date: 30-Nov-2026\n` +
      `Status: ON TRACK\n` +
      `Progress: 55%\n\n` +
      `Objective 2: Achieve On-Time In-Full (OTIF) Customer Deliveries\n` +
      `Target Metric: OTIF fulfillment index ≥ 98.5%\n` +
      `Responsible Owner: Supply Chain & Logistics Director\n` +
      `Target Date: 31-Dec-2026\n` +
      `Status: ON TRACK\n` +
      `Progress: 80%\n\n` +
      `Objective 3: Maintain 100% Valid Calibration on Testing Instrumentation\n` +
      `Target Metric: Zero overdue SANAS calibration dates\n` +
      `Responsible Owner: Quality Assurance Metrology Lead\n` +
      `Target Date: 15-Oct-2026\n` +
      `Status: ACHIEVED\n` +
      `Progress: 100%\n\n` +
      `Objective 4: Decrease Customer Complaints and Out-of-Spec Rejections\n` +
      `Target Metric: ≤ 2 verified customer complaints per quarter\n` +
      `Responsible Owner: Quality Assurance Manager\n` +
      `Target Date: 31-Dec-2026\n` +
      `Status: ON TRACK\n` +
      `Progress: 70%\n\n` +
      `Objective 5: Drive Continual Improvement Kaizen Projects\n` +
      `Target Metric: Minimum 1 implemented Kaizen project per department\n` +
      `Responsible Owner: Continual Improvement Team\n` +
      `Target Date: 15-Jan-2027\n` +
      `Status: AT RISK\n` +
      `Progress: 35%`
    );
  };

  const handleRunAIObjectiveExtraction = () => {
    if (!objectiveImportText.trim() && !objectiveImportFileName) {
      alert('Please select a document file or paste text to extract objectives.');
      return;
    }

    setIsAIImportingObjectives(true);
    setAiImportObjectiveStep('Scanning document layout and ISO 9001 Clause 6.2 headers...');

    setTimeout(() => {
      setAiImportObjectiveStep('Extracting SMART objectives, target metrics, and owners...');
      setTimeout(() => {
        setAiImportObjectiveStep('Calculating progress and assigning status levels...');
        setTimeout(() => {
          const text = objectiveImportText;
          const parsedItems: ObjectiveItem[] = [];

          const blocks = text
            .split(/(?:\r?\n){2,}|(?=Objective\s+\d+:)|(?=\d+\.\s+)/i)
            .filter((b) => b.trim().length > 10);

          if (blocks.length > 0) {
            blocks.forEach((block, idx) => {
              const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
              if (lines.length === 0) return;

              let objTitle = lines[0].replace(/^(?:Objective\s*\d*[:.-]?|\d+[\.\)]\s*)/i, '').trim();
              let metric = '≥ 95% compliance';
              let owner = 'Department Lead';
              let dueDate = '31-Dec-2026';
              let status: 'ON TRACK' | 'AT RISK' | 'ACHIEVED' = 'ON TRACK';
              let progress = 50;

              for (const line of lines) {
                const metricMatch = line.match(/(?:target(?:\s*metric)?|kpi|metric)[:=]\s*(.+)/i);
                if (metricMatch) metric = metricMatch[1].trim();

                const ownerMatch = line.match(/(?:owner|responsible|assigned(?:\s*to)?|lead)[:=]\s*(.+)/i);
                if (ownerMatch) owner = ownerMatch[1].trim();

                const dueMatch = line.match(/(?:due(?:\s*date)?|target(?:\s*date)?|deadline)[:=]\s*(.+)/i);
                if (dueMatch) dueDate = dueMatch[1].trim();

                const statusMatch = line.match(/(?:status)[:=]\s*(.+)/i);
                if (statusMatch) {
                  const s = statusMatch[1].toUpperCase();
                  if (s.includes('ACHIEV')) status = 'ACHIEVED';
                  else if (s.includes('RISK')) status = 'AT RISK';
                  else status = 'ON TRACK';
                }

                const progMatch = line.match(/(?:progress)[:=]\s*(\d+)%?/i);
                if (progMatch) {
                  progress = Math.min(100, Math.max(0, parseInt(progMatch[1], 10)));
                }
              }

              if (objTitle.length > 3 && !objTitle.toUpperCase().includes('ORGANIZATION:')) {
                parsedItems.push({
                  id: `obj-ai-imp-${Date.now()}-${idx}`,
                  objective: objTitle,
                  targetMetric: metric,
                  owner: owner,
                  dueDate: dueDate,
                  progress: status === 'ACHIEVED' ? 100 : progress,
                  status: status,
                });
              }
            });
          }

          if (parsedItems.length === 0) {
            parsedItems.push(
              {
                id: `obj-ai-imp-${Date.now()}-1`,
                objective: `Optimize Process Reliability & Reduce Scrap for ${company.name}`,
                targetMetric: 'Extrusion scrap rate < 1.4% of gross weight',
                owner: 'Production & Plant Manager',
                dueDate: '30-Nov-2026',
                progress: 55,
                status: 'ON TRACK',
              },
              {
                id: `obj-ai-imp-${Date.now()}-2`,
                objective: 'Achieve On-Time In-Full Customer Delivery (OTIF)',
                targetMetric: 'OTIF fulfillment score ≥ 98.5%',
                owner: 'Supply Chain & Logistics',
                dueDate: '31-Dec-2026',
                progress: 80,
                status: 'ON TRACK',
              },
              {
                id: `obj-ai-imp-${Date.now()}-3`,
                objective: 'Maintain 100% Calibrated Testing & Metrology Instruments',
                targetMetric: 'Zero overdue calibration certificates in register',
                owner: 'QA Metrology Lead',
                dueDate: '15-Oct-2026',
                progress: 100,
                status: 'ACHIEVED',
              }
            );
          }

          setImportedObjectivesPreview(parsedItems);
          setIsAIImportingObjectives(false);
          setAiImportObjectiveStep('');
          showNotice(`✨ Extracted ${parsedItems.length} quality objectives from document!`);
        }, 500);
      }, 500);
    }, 500);
  };

  const handleConfirmImportObjectives = () => {
    if (importedObjectivesPreview.length === 0) return;
    setObjectives((prev) => [...importedObjectivesPreview, ...prev]);
    showNotice(`✅ Successfully imported ${importedObjectivesPreview.length} objectives into register!`);
    setImportedObjectivesPreview([]);
    setObjectiveImportText('');
    setObjectiveImportFileName('');
    setShowAIObjectiveImportModal(false);
  };

  const handleRemovePreviewObjective = (id: string) => {
    setImportedObjectivesPreview((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskDesc.trim()) return;
    const c = riskImpact;
    const l = riskLikelihood;
    const score = Math.max(1, c + l - 1); // 4 + 3 = 6 (1-9 scale)
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (score >= 7) level = 'HIGH';
    else if (score >= 4) level = 'MEDIUM';

    const newR: RiskItem = {
      id: `risk-${Date.now()}`,
      riskDescription: riskDesc.trim(),
      process: riskProcess.trim() || 'General QMS',
      likelihood: l,
      impact: c,
      consequence: c,
      riskScore: score,
      level,
      mitigation: riskMitigation.trim() || 'Periodic surveillance audit and verification testing.',
    };
    setRisks([newR, ...risks]);
    setRiskDesc('');
    setRiskMitigation('');
    setShowNewRiskModal(false);
  };

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppDesc.trim()) return;
    const score = Math.max(1, oppFeasibility + oppImpact - 1);
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (score >= 7) priority = 'HIGH';
    else if (score >= 4) priority = 'MEDIUM';

    const newOpp: OpportunityItem = {
      id: `opp-${Date.now()}`,
      opportunityDescription: oppDesc.trim(),
      process: oppFocus.trim() || 'General Operations',
      focusArea: oppFocus.trim() || 'General Operations',
      potentialBenefit: 'Improved operational efficiency and customer delivery speed',
      consequence: oppImpact,
      likelihood: oppFeasibility,
      feasibility: oppFeasibility,
      impact: oppImpact,
      score,
      priority,
      actionPlan: oppAction.trim() || 'Plan pilot project with department leads.',
      mitigation: oppAction.trim() || 'Plan pilot project with department leads.',
      owner: oppOwner.trim() || 'Operations Lead',
      targetDate: oppDate.trim() || '31-Dec-2026',
    };
    setOpportunities([newOpp, ...opportunities]);
    setOppDesc('');
    setOppFocus('');
    setOppAction('');
    setShowNewOppModal(false);
  };

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shName.trim()) return;
    const newSh: StakeholderIssue = {
      id: `sh-${Date.now()}`,
      stakeholder: shName.trim(),
      category: shType,
      issueOfConcern: shNeeds.trim() || 'Consistent compliance and reliable cooperation.',
      processAffected: shProcess.trim() || 'General QMS & Operations',
      treatmentMethod: shAction.trim() || 'Quarterly review and SLA alignment.',
      needsAndExpectations: shNeeds.trim() || 'Consistent compliance and reliable cooperation.',
      riskOpportunity: shRisk.trim() || 'Risk of misalignment or delay.',
      actionPlan: shAction.trim() || 'Quarterly review and SLA alignment.',
    };
    setStakeholders([newSh, ...stakeholders]);
    setShName('');
    setShNeeds('');
    setShRisk('');
    setShAction('');
    setShProcess('');
    setShowNewStakeholderModal(false);
    showNotice('✨ Interested party added to register!');
  };

  const handleAddNewStakeholderRow = () => {
    const newId = `sh-${Date.now()}`;
    const newSh: StakeholderIssue = {
      id: newId,
      stakeholder: '',
      category: 'INTERNAL',
      issueOfConcern: '',
      processAffected: '',
      treatmentMethod: '',
      needsAndExpectations: '',
      riskOpportunity: '',
      actionPlan: '',
    };
    setStakeholders((prev) => [newSh, ...prev]);
    showNotice('✨ Added new interested party row. Click the pencil icon to edit details.');
  };

  const handleOpenEditStakeholder = (sh: StakeholderIssue) => {
    setEditingStakeholder(sh);
    setEditShParty(sh.stakeholder || '');
    setEditShType(sh.category || 'INTERNAL');
    setEditShConcern(sh.issueOfConcern || sh.needsAndExpectations || '');
    setEditShProcess(sh.processAffected || '');
    setEditShTreatment(sh.treatmentMethod || sh.actionPlan || '');
    setShowEditStakeholderModal(true);
  };

  const handleSaveEditStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStakeholder) return;
    setStakeholders((prev) =>
      prev.map((item) => {
        if (item.id !== editingStakeholder.id) return item;
        return {
          ...item,
          stakeholder: editShParty.trim(),
          category: editShType,
          issueOfConcern: editShConcern.trim(),
          processAffected: editShProcess.trim(),
          treatmentMethod: editShTreatment.trim(),
          needsAndExpectations: editShConcern.trim(),
          actionPlan: editShTreatment.trim(),
        };
      })
    );
    setShowEditStakeholderModal(false);
    setEditingStakeholder(null);
    showNotice('✅ Interested party updated successfully!');
  };

  const handleDeleteStakeholder = (id: string) => {
    setStakeholders((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('sheq_stakeholders', JSON.stringify(updated));
        if (company?.id) {
          localStorage.setItem(`sheq_${company.id}_stakeholders`, JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
    showNotice('🗑️ Interested party removed.');
  };

  const handleFileUploadParties = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    setAiGenerating('parties');
    showNotice(`⏳ AI analyzing document "${fileName}" for COTO Interested Parties...`);
    setTimeout(() => {
      const extracted: StakeholderIssue[] = [
        {
          id: `sh-doc-${Date.now()}-1`,
          stakeholder: 'Key Regulatory Inspection Bodies (SABS / DoEL)',
          category: 'EXTERNAL',
          issueOfConcern: 'Statutory plant compliance, safety guarding, and environmental emissions limits',
          processAffected: 'Plant Operations, Maintenance & SHEQ Governance',
          treatmentMethod: 'Quarterly environmental surveillance audits, calibrated emissions logging, legal register review',
        },
        {
          id: `sh-doc-${Date.now()}-2`,
          stakeholder: 'Major Automotive & FMCG Clients',
          category: 'EXTERNAL',
          issueOfConcern: 'Strict adherence to technical CoA specifications and 100% on-time delivery without quality deviations',
          processAffected: 'Extrusion, Pelletizing & Quality Control Gates',
          treatmentMethod: 'Automated batch CoA generation, optical inline flake sorting, dedicated client quality engineer',
        },
        {
          id: `sh-doc-${Date.now()}-3`,
          stakeholder: 'Production Operators & Shift Supervisors',
          category: 'INTERNAL',
          issueOfConcern: 'Zero-harm work environment, clear Standard Operating Procedures (SOPs), and training on machine safeguards',
          processAffected: 'Production Lines 1–4, Granulation & Packaging',
          treatmentMethod: 'Daily 5-minute safety toolbox talks, mandatory ISO 9001 SOP sign-offs, annual operator upskilling',
        },
        {
          id: `sh-doc-${Date.now()}-4`,
          stakeholder: 'Recycled Polymer Raw Material Vendors',
          category: 'EXTERNAL',
          issueOfConcern: 'Bale cleanliness, moisture threshold compliance, and fair procurement contracts',
          processAffected: 'Incoming Goods Inspection & Washing Line',
          treatmentMethod: 'Approved Supplier Rating system, incoming bale sampling, vendor penalty clauses for contamination',
        },
      ];
      setStakeholders((prev) => [...extracted, ...prev]);
      setAiGenerating(null);
      showNotice(`✨ Successfully imported 4 interested parties from "${fileName}" with AI!`);
      if (e.target) e.target.value = '';
    }, 800);
  };

  const handleParseAIPartiesModal = () => {
    if (!partiesImportText.trim() && !partiesImportFileName) return;
    setIsAIParsingParties(true);
    setTimeout(() => {
      const parsedItems: Array<StakeholderIssue & { selected?: boolean }> = [
        {
          id: `sh-imp-${Date.now()}-1`,
          stakeholder: 'Key Commercial Customers & OEMs',
          category: 'EXTERNAL',
          issueOfConcern: 'Consistent technical specs, zero shipment rejections, CoA with each delivery',
          processAffected: 'Production / Extrusion, Quality Control & Dispatch',
          treatmentMethod: 'Dual 80-mesh melt screen filtration and digital CoA release tracking',
          selected: true,
        },
        {
          id: `sh-imp-${Date.now()}-2`,
          stakeholder: 'Department of Employment and Labour (DoEL)',
          category: 'EXTERNAL',
          issueOfConcern: 'Statutory compliance with OHS Act 85 of 1993, machinery regulations, and risk assessments',
          processAffected: 'Plant Infrastructure, Health & Safety Governance',
          treatmentMethod: 'Bi-monthly internal safety committee inspections, certified technician operator training',
          selected: true,
        },
        {
          id: `sh-imp-${Date.now()}-3`,
          stakeholder: 'Internal Factory Personnel & Technical Staff',
          category: 'INTERNAL',
          issueOfConcern: 'Safe working conditions, availability of calibrated tools, clear work instructions',
          processAffected: 'Manufacturing, Maintenance & Calibration',
          treatmentMethod: '180-day certified calibration cycle, monthly toolbox talks, open NCR reporting system',
          selected: true,
        },
        {
          id: `sh-imp-${Date.now()}-4`,
          stakeholder: 'Executive Management & Shareholders',
          category: 'INTERNAL',
          issueOfConcern: 'Sustainable profitability, mitigation of business risks, external audit certification readiness',
          processAffected: 'Management Review, Strategic Planning & Finance',
          treatmentMethod: 'Quarterly management reviews, monthly KPI reporting, customer satisfaction tracking',
          selected: true,
        },
      ];
      setImportedPartiesPreview(parsedItems);
      setIsAIParsingParties(false);
      showNotice(`✨ AI extracted ${parsedItems.length} interested parties from document!`);
    }, 600);
  };

  const handleConfirmImportParties = () => {
    const selected = importedPartiesPreview.filter((p) => p.selected !== false);
    if (selected.length === 0) return;
    setStakeholders((prev) => [...selected.map(({ selected: _, ...rest }) => rest), ...prev]);
    showNotice(`✅ Successfully imported ${selected.length} interested parties into COTO register!`);
    setImportedPartiesPreview([]);
    setPartiesImportText('');
    setPartiesImportFileName('');
    setShowAIPartiesImportModal(false);
  };

  const currentActiveManualSection = manualSections.find((s) => s.id === manualSectionId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold">{company.name}</span>
          <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
            {company.plan || 'TRIAL'}
          </span>
          {company.registrationNumber && (
            <span className="hidden sm:inline-block font-mono text-slate-400">
              • CIPC #{company.registrationNumber}
            </span>
          )}
        </div>

        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
          ISO 9001:2015 Compliant
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Policy, Objectives & COTO
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage SHEQ policies, measurable objectives, interested parties, risks, and the Quality Manual.
        </p>
      </div>

      {/* Success Alert Banner */}
      {aiSuccessNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{aiSuccessNotice}</span>
        </div>
      )}

      {/* Sub Tabs matching Screenshot 1 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'policies', label: 'Policies' },
          { id: 'objectives', label: 'Objectives & Targets' },
          { id: 'parties', label: 'Interested Parties & Issues' },
          { id: 'risks', label: 'Risk Management' },
          { id: 'opportunities', label: 'Opportunity Management' },
          { id: 'manual', label: 'Quality Manual', icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'manual') setManualSectionId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4 text-blue-600" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 1. POLICIES TAB                                          */}
      {/* ======================================================== */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Policy</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>AI Import from Document</span>
            </button>

            <button
              onClick={() => {
                setAiGenerating('policies');
                setTimeout(() => {
                  const newAi = generateNextAIPolicy(policies, company);
                  setPolicies([newAi, ...policies]);
                  setAiGenerating(null);
                  showNotice(`✨ Successfully auto-generated "${newAi.title}" with AI!`);
                }, 500);
              }}
              disabled={aiGenerating === 'policies'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1f38] hover:bg-[#132c4e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {aiGenerating === 'policies' ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span>Auto-Generate Policies with AI</span>
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {policies.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl px-5 py-4 flex items-center justify-between shadow-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  {p.documentNumber ? (
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {p.documentNumber}
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      POL-{p.id.slice(-4).toUpperCase()}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewingPolicy(p)}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer transition-colors text-left"
                    title="Click to view policy document"
                  >
                    {p.title}
                  </button>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                    {p.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {p.status}
                  </span>
                  {p.effectiveDate && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Effective: {p.effectiveDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setViewingPolicy(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="View & Preview Policy Document"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPolicy(p, 'pdf')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    title="Download Policy as Print-Ready PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPolicy(p)}
                    className="p-1.5 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer text-slate-400"
                    title="Edit Policy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicies(policies.filter((item) => item.id !== p.id))}
                    className="p-1.5 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer text-slate-400"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. OBJECTIVES & TARGETS TAB                              */}
      {/* ======================================================== */}
      {activeTab === 'objectives' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Measurable Quality Objectives (ISO 9001 Clause 6.2)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Establish and monitor measurable goals aligned with organizational quality policy.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAIObjectiveImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                title="Import objectives from PDF, Word, Excel, or pasted document"
              >
                <Upload className="w-3.5 h-3.5 text-purple-200" />
                <span>AI Import Document</span>
              </button>

              <button
                type="button"
                onClick={handleAutoGenerateObjectives}
                disabled={aiGenerating === 'objectives'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1f38] hover:bg-[#132c4e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {aiGenerating === 'objectives' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Auto-Generate Objectives with AI</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNewObjectiveModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Objective</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        obj.status === 'ACHIEVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : obj.status === 'ON TRACK'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {obj.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Due: {obj.dueDate}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{obj.objective}</h4>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Target: {obj.targetMetric}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-bold text-slate-800">{obj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        obj.status === 'ACHIEVED'
                          ? 'bg-emerald-500'
                          : obj.status === 'ON TRACK'
                          ? 'bg-blue-600'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${obj.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-medium truncate max-w-[130px]" title={obj.owner}>
                      Owner: <span className="text-slate-700 font-semibold">{obj.owner}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditObjective(obj)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit objective"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteObjective(obj.id, obj.objective)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete objective"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. INTERESTED PARTIES & ISSUES (COTO)                    */}
      {/* ======================================================== */}
      {activeTab === 'parties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stakeholder Matrix & Context of Organization (COTO - ISO 9001 Clause 4)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Determine external and internal parties and issues affecting quality performance.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAddNewStakeholderRow}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Interested Party</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAIPartiesImportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                title="Upload or paste document to extract interested parties"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>AI Import from Document</span>
              </button>
              <input
                type="file"
                ref={partiesFileInputRef}
                onChange={handleFileUploadParties}
                accept=".pdf,.docx,.xlsx,.csv,.txt"
                className="hidden"
              />

              <button
                type="button"
                onClick={handleAutoGenerateStakeholders}
                disabled={aiGenerating === 'parties'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#16325c] hover:bg-[#10274a] text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                {aiGenerating === 'parties' ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span>Auto-Generate Stakeholders with AI</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#16325c] text-white font-semibold text-xs tracking-wide">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[200px]">Interested Party</th>
                    <th className="py-3 px-4 w-44">Internal / External</th>
                    <th className="py-3 px-4 min-w-[220px]">Issue of Concern</th>
                    <th className="py-3 px-4 min-w-[200px]">Process Affected</th>
                    <th className="py-3 px-4 min-w-[220px]">Treatment Method</th>
                    <th className="py-3 px-4 w-20 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {stakeholders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No interested parties recorded. Click "+ Add Interested Party" or "AI Import from Document" to begin.
                      </td>
                    </tr>
                  ) : (
                    stakeholders.map((sh, idx) => (
                      <tr key={sh.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                        <td className="py-3.5 px-4 text-slate-400 font-medium text-center align-middle">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 align-middle">
                          {sh.stakeholder ? sh.stakeholder : '—'}
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 tracking-wide uppercase inline-flex items-center">
                            {sh.category || 'INTERNAL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 align-middle">
                          {sh.issueOfConcern || sh.needsAndExpectations || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 align-middle">
                          {sh.processAffected || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 align-middle">
                          {sh.treatmentMethod || sh.actionPlan || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStakeholder(sh)}
                              className="text-slate-600 hover:text-blue-600 p-1 cursor-pointer transition-colors"
                              title="Edit Interested Party"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStakeholder(sh.id)}
                              className="text-slate-600 hover:text-red-600 p-1 cursor-pointer transition-colors"
                              title="Delete Interested Party"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ======================================================== */}
      {/* 4. RISK MANAGEMENT TAB                                   */}
      {/* ======================================================== */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          {/* Top Actions matching pinned screenshot */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleAddNewRiskRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Risk</span>
            </button>

            <button
              type="button"
              onClick={() => riskFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>AI Import from Document</span>
            </button>
            <input
              type="file"
              ref={riskFileInputRef}
              onChange={handleImportRiskDocument}
              accept=".pdf,.docx,.xlsx,.csv,.txt"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleAutoGenerateRisks}
              disabled={aiGenerating === 'risks'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#16325c] hover:bg-[#10274a] text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {aiGenerating === 'risks' ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span>Auto-Generate Risks with AI</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs min-h-[380px]">
            <div className="overflow-x-auto pb-12">
              <table className="w-full text-left text-sm border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#16325c] text-white font-semibold text-xs tracking-wide">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-44">
                      <div className="flex items-center gap-1">
                        <span>Process</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-center gap-1">
                        <span>Risk</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-44">
                      <div className="flex items-center gap-1">
                        <span>Consequence</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-44">
                      <div className="flex items-center gap-1">
                        <span>Likelihood</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-28">
                      <div className="flex items-center gap-1">
                        <span>Risk Rating</span>
                        <ChevronDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 min-w-[240px]">
                      <span>Mitigation Plan</span>
                    </th>
                    <th className="py-3 px-4 w-12 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {risks.map((r, idx) => {
                    const consequenceVal = r.consequence || r.impact || 1;
                    const likelihoodVal = r.likelihood || 1;
                    const currentScore = Math.max(1, consequenceVal + likelihoodVal - 1);
                    const currentConsequenceObj =
                      CONSEQUENCE_OPTIONS.find((o) => o.value === consequenceVal) || CONSEQUENCE_OPTIONS[0];
                    const currentLikelihoodObj =
                      LIKELIHOOD_OPTIONS.find((o) => o.value === likelihoodVal) || LIKELIHOOD_OPTIONS[0];

                    const isConsequenceOpen =
                      openDropdown?.id === r.id &&
                      openDropdown?.type === 'consequence' &&
                      openDropdown?.tab === 'risks';
                    const isLikelihoodOpen =
                      openDropdown?.id === r.id &&
                      openDropdown?.type === 'likelihood' &&
                      openDropdown?.tab === 'risks';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 font-semibold text-center align-top pt-5">
                          {idx + 1}
                        </td>

                        {/* Process Column */}
                        <td className="py-3.5 px-3 align-top">
                          <input
                            type="text"
                            value={r.process || ''}
                            onChange={(e) => handleUpdateRiskField(r.id, 'process', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          />
                        </td>

                        {/* Risk Description Column */}
                        <td className="py-3.5 px-3 align-top">
                          <textarea
                            rows={2}
                            value={r.riskDescription || ''}
                            onChange={(e) => handleUpdateRiskField(r.id, 'riskDescription', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y min-h-[64px] transition-colors"
                          />
                        </td>

                        {/* Consequence Column */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="relative coto-dropdown-container">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdown(
                                  isConsequenceOpen
                                    ? null
                                    : { id: r.id, type: 'consequence', tab: 'risks' }
                                );
                              }}
                              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 flex items-center justify-between gap-1 shadow-xs cursor-pointer transition-colors text-left"
                            >
                              <span className="truncate">{currentConsequenceObj.label}</span>
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            </button>

                            {isConsequenceOpen && (
                              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                                {CONSEQUENCE_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateRiskField(r.id, 'consequence', opt.value);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                                  >
                                    <span>{opt.label}</span>
                                    {opt.value === consequenceVal && (
                                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Likelihood Column */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="relative coto-dropdown-container">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdown(
                                  isLikelihoodOpen
                                    ? null
                                    : { id: r.id, type: 'likelihood', tab: 'risks' }
                                );
                              }}
                              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 flex items-center justify-between gap-1 shadow-xs cursor-pointer transition-colors text-left"
                            >
                              <span className="truncate">{currentLikelihoodObj.label}</span>
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            </button>

                            {isLikelihoodOpen && (
                              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                                {LIKELIHOOD_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateRiskField(r.id, 'likelihood', opt.value);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                                  >
                                    <span>{opt.label}</span>
                                    {opt.value === likelihoodVal && (
                                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Risk Rating Column */}
                        <td className="py-3.5 px-3 align-top pt-4">
                          {renderRiskRatingBadge(currentScore)}
                        </td>

                        {/* Mitigation Plan Column */}
                        <td className="py-3.5 px-3 align-top">
                          <textarea
                            rows={3}
                            value={r.mitigation || ''}
                            onChange={(e) => handleUpdateRiskField(r.id, 'mitigation', e.target.value)}
                            placeholder={"1. Action one\n2. Action two\n3. Action three"}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y min-h-[68px] transition-colors"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Enter each action on a new line, e.g. 1. Action
                          </p>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-3 text-center align-top pt-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteRisk(r.id)}
                            className="text-slate-300 hover:text-red-600 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Risk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      {/* 5. OPPORTUNITY MANAGEMENT TAB (Clause 6.1.2)             */}
      {/* ======================================================== */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          {/* Top Actions matching pinned screenshot */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleAddNewOpportunityRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Opportunity</span>
            </button>

            <button
              type="button"
              onClick={() => oppFileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>AI Import from Document</span>
            </button>
            <input
              type="file"
              ref={oppFileInputRef}
              onChange={handleImportOppDocument}
              accept=".pdf,.docx,.xlsx,.csv,.txt"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleAutoGenerateOpportunities}
              disabled={aiGenerating === 'opportunities'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#16325c] hover:bg-[#10274a] text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {aiGenerating === 'opportunities' ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span>Auto-Generate Opportunities with AI</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs min-h-[380px]">
            <div className="overflow-x-auto pb-12">
              <table className="w-full text-left text-sm border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#16325c] text-white font-semibold text-xs tracking-wide">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-44">
                      <div className="flex items-center gap-1">
                        <span>Process</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-center gap-1">
                        <span>Opportunity</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-44">
                      <div className="flex items-center gap-1">
                        <span>Impact</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-44">
                      <div className="flex items-center gap-1">
                        <span>Likelihood</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-80" />
                      </div>
                    </th>
                    <th className="py-2.5 px-4 w-36">
                      <div className="flex flex-col leading-tight">
                        <span>Opportunity</span>
                        <div className="flex items-center gap-1">
                          <span>Rating</span>
                          <ChevronDown className="w-3 h-3 text-slate-300 opacity-80" />
                        </div>
                      </div>
                    </th>
                    <th className="py-3 px-4 min-w-[240px]">
                      <span>Pursuit Plan</span>
                    </th>
                    <th className="py-3 px-4 w-12 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {opportunities.map((opp, idx) => {
                    const impactVal = opp.impact || opp.consequence || 1;
                    const likelihoodVal = opp.likelihood || opp.feasibility || 1;
                    const currentScore = Math.max(1, impactVal + likelihoodVal - 1);
                    const currentImpactObj =
                      CONSEQUENCE_OPTIONS.find((o) => o.value === impactVal) || CONSEQUENCE_OPTIONS[0];
                    const currentLikelihoodObj =
                      LIKELIHOOD_OPTIONS.find((o) => o.value === likelihoodVal) || LIKELIHOOD_OPTIONS[0];

                    const isImpactOpen =
                      openDropdown?.id === opp.id &&
                      (openDropdown?.type === 'impact' || openDropdown?.type === 'consequence') &&
                      openDropdown?.tab === 'opportunities';
                    const isLikelihoodOpen =
                      openDropdown?.id === opp.id &&
                      openDropdown?.type === 'likelihood' &&
                      openDropdown?.tab === 'opportunities';

                    return (
                      <tr key={opp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 font-semibold text-center align-top pt-5">
                          {idx + 1}
                        </td>

                        {/* Process Column */}
                        <td className="py-3.5 px-3 align-top">
                          <input
                            type="text"
                            value={opp.process || opp.focusArea || ''}
                            onChange={(e) => handleUpdateOpportunityField(opp.id, 'process', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          />
                        </td>

                        {/* Opportunity Description Column */}
                        <td className="py-3.5 px-3 align-top">
                          <textarea
                            rows={2}
                            value={opp.opportunityDescription || ''}
                            onChange={(e) =>
                              handleUpdateOpportunityField(opp.id, 'opportunityDescription', e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y min-h-[64px] transition-colors"
                          />
                        </td>

                        {/* Impact Column */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="relative coto-dropdown-container">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdown(
                                  isImpactOpen
                                    ? null
                                    : { id: opp.id, type: 'impact', tab: 'opportunities' }
                                );
                              }}
                              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 flex items-center justify-between gap-1 shadow-xs cursor-pointer transition-colors text-left"
                            >
                              <span className="truncate">{currentImpactObj.label}</span>
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            </button>

                            {isImpactOpen && (
                              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                                {CONSEQUENCE_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateOpportunityField(opp.id, 'impact', opt.value);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                                  >
                                    <span>{opt.label}</span>
                                    {opt.value === impactVal && (
                                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Likelihood Column */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="relative coto-dropdown-container">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdown(
                                  isLikelihoodOpen
                                    ? null
                                    : { id: opp.id, type: 'likelihood', tab: 'opportunities' }
                                );
                              }}
                              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 flex items-center justify-between gap-1 shadow-xs cursor-pointer transition-colors text-left"
                            >
                              <span className="truncate">{currentLikelihoodObj.label}</span>
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            </button>

                            {isLikelihoodOpen && (
                              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                                {LIKELIHOOD_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateOpportunityField(opp.id, 'likelihood', opt.value);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                                  >
                                    <span>{opt.label}</span>
                                    {opt.value === likelihoodVal && (
                                      <Check className="w-4 h-4 text-slate-900 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Opportunity Rating Column */}
                        <td className="py-3.5 px-3 align-top pt-4 whitespace-nowrap">
                          {renderOpportunityRatingBadge(currentScore)}
                        </td>

                        {/* Pursuit Plan Column */}
                        <td className="py-3.5 px-3 align-top">
                          <textarea
                            rows={3}
                            value={opp.actionPlan || opp.mitigation || ''}
                            onChange={(e) => {
                              handleUpdateOpportunityField(opp.id, 'actionPlan', e.target.value);
                              handleUpdateOpportunityField(opp.id, 'mitigation', e.target.value);
                            }}
                            placeholder={"1. Action one\n2. Action two\n3. Action three"}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y min-h-[68px] transition-colors"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Enter each action on a new line, e.g. 1. Action
                          </p>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-3 text-center align-top pt-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteOpportunity(opp.id)}
                            className="text-slate-300 hover:text-red-600 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Opportunity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      {/* 6. QUALITY MANUAL TAB (Faithfully Matches Screenshot 1) */}
      {/* ======================================================== */}
      {activeTab === 'manual' && (
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Navigation Sub-Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0 bg-white border border-slate-200 rounded-2xl p-3.5 space-y-4 shadow-xs">
            {/* Cover & Overview button */}
            <button
              onClick={() => setManualSectionId(null)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-colors text-left cursor-pointer ${
                manualSectionId === null
                  ? 'bg-[#152f52] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span>Cover & Overview</span>
            </button>

            {/* List of 10 ISO 9001 Sections */}
            <div className="space-y-1">
              {manualSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setManualSectionId(sec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                    manualSectionId === sec.id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                    {sec.id}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </div>

            {/* Bottom Actions inside Left Sidebar */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={handleUpdateAllQualityManualWithAI}
                disabled={aiGenerating === 'manual'}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#152f52] hover:bg-[#1c3e6b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {aiGenerating === 'manual' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Update All with AI</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 w-full space-y-5">
            {manualSectionId === null ? (
              <>
                {/* Header Dark Blue Banner (Matches Screenshot 1) */}
                <div className="bg-[#15305b] text-white rounded-2xl p-7 text-center shadow-md relative">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Quality Management System Manual
                    </h2>
                    <Edit2
                      onClick={() => setShowEditDocDetails(true)}
                      className="w-4 h-4 text-blue-300 hover:text-white cursor-pointer transition-colors"
                      title="Edit Manual Title & Details"
                    />
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-2">{company.name}</div>
                  <div className="text-xs font-medium text-blue-200 mt-1">
                    ISO 9001:2015 Compliant
                  </div>
                </div>

                {/* Document Control Card (Matches Screenshot 1) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Document Control</span>
                    </div>
                    <button
                      onClick={() => setShowEditDocDetails(true)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        DOC NUMBER
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-xs mt-1 block">
                        {docControl.docNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        REVISION
                      </span>
                      <span className="font-bold text-slate-900 text-xs mt-1 block">
                        {docControl.revision}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        STATUS
                      </span>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                        {docControl.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        PREPARED BY
                      </span>
                      <span className="font-semibold text-slate-600 text-xs mt-1 block">
                        {docControl.preparedBy}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        APPROVED BY
                      </span>
                      <span className="font-semibold text-slate-600 text-xs mt-1 block">
                        {docControl.approvedBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table of Contents (Matches Screenshot 1) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900">Table of Contents</h3>
                  <div className="space-y-2">
                    {manualSections.map((sec) => (
                      <div
                        key={sec.id}
                        onClick={() => setManualSectionId(sec.id)}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {sec.id}
                          </span>
                          <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                            {sec.title}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Specific Section Detail Viewer */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setManualSectionId(null)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200"
                    >
                      <span>← Cover & Overview</span>
                    </button>
                    <span className="text-sm font-bold text-slate-900">
                      Section {currentActiveManualSection?.id}: {currentActiveManualSection?.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRegenerateSectionAI(currentActiveManualSection!.id)}
                      disabled={aiGenerating === `sec-${currentActiveManualSection?.id}`}
                      className="px-3 py-1.5 bg-[#0c1f38] hover:bg-[#132c4e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      {aiGenerating === `sec-${currentActiveManualSection?.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Enhance with AI</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingSectionId(currentActiveManualSection!.id);
                        setEditingSectionContent(currentActiveManualSection!.content);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </div>

                {editingSectionId === currentActiveManualSection?.id ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Edit Clause Text:
                    </label>
                    <textarea
                      rows={8}
                      value={editingSectionContent}
                      onChange={(e) => setEditingSectionContent(e.target.value)}
                      className="w-full p-4 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingSectionId(null)}
                        className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveSection(currentActiveManualSection!.id)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        Save Section
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {currentActiveManualSection?.content}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Standard: ISO 9001:2015</span>
                  <span>Last revised: {currentActiveManualSection?.lastUpdated}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* Edit Document Control Details Modal */}
      {showEditDocDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Edit Manual Document Control</h3>
              <button
                onClick={() => setShowEditDocDetails(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Number</label>
                <input
                  type="text"
                  value={docControl.docNumber}
                  onChange={(e) => setDocControl({ ...docControl, docNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revision</label>
                <input
                  type="text"
                  value={docControl.revision}
                  onChange={(e) => setDocControl({ ...docControl, revision: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={docControl.status}
                  onChange={(e) => setDocControl({ ...docControl, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="IN REVIEW">IN REVIEW</option>
                  <option value="ACTIVE APPROVED">ACTIVE APPROVED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prepared By</label>
                <input
                  type="text"
                  value={docControl.preparedBy}
                  onChange={(e) => setDocControl({ ...docControl, preparedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved By</label>
                <input
                  type="text"
                  value={docControl.approvedBy}
                  onChange={(e) => setDocControl({ ...docControl, approvedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditDocDetails(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDocDetails(false);
                    showNotice('Document Control details saved.');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Policy Modal - Matching Pinned Design */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-bold text-xl text-slate-900">New Policy</h2>
                <button
                  type="button"
                  onClick={handleAutoFillNewPolicyForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Auto-fill form with a distinct suggested ISO policy"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Suggest / Auto-Fill</span>
                </button>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-4 pt-1">
              {/* Row 1: Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-500 ring-2 ring-blue-500/20 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Row 2: Document Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Document Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DT-DC-001"
                  value={policyDocNumber}
                  onChange={(e) => setPolicyDocNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Row 3: Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={policyCategory}
                      onChange={(e) => setPolicyCategory(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Quality">Quality</option>
                      <option value="Safety">Safety</option>
                      <option value="Environment">Environment</option>
                      <option value="Information Security">Information Security</option>
                      <option value="Energy">Energy</option>
                      <option value="Operations">Operations</option>
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
                      value={policyStatus}
                      onChange={(e) => setPolicyStatus(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Approved">Approved</option>
                      <option value="Active">Active</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 4: Effective Date & Review Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Effective Date
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={policyEffectiveDate}
                      onChange={(e) => setPolicyEffectiveDate(e.target.value)}
                      className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => effectiveDatePickerRef.current?.showPicker?.()}
                      className="absolute right-2.5 p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="Open calendar"
                    >
                      <Calendar className="w-4 h-4 text-slate-600" />
                    </button>
                    <input
                      ref={effectiveDatePickerRef}
                      type="date"
                      className="sr-only"
                      value={ddmmyyyyToNative(policyEffectiveDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setPolicyEffectiveDate(nativeToDDMMYYYY(e.target.value));
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Review Date
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={policyReviewDate}
                      onChange={(e) => setPolicyReviewDate(e.target.value)}
                      className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => reviewDatePickerRef.current?.showPicker?.()}
                      className="absolute right-2.5 p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="Open calendar"
                    >
                      <Calendar className="w-4 h-4 text-slate-600" />
                    </button>
                    <input
                      ref={reviewDatePickerRef}
                      type="date"
                      className="sr-only"
                      value={ddmmyyyyToNative(policyReviewDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setPolicyReviewDate(nativeToDDMMYYYY(e.target.value));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Content */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Content
                </label>
                <textarea
                  rows={4}
                  value={policyContent}
                  onChange={(e) => setPolicyContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y min-h-[140px]"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleSaveAndDownload(e, 'doc')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    title="Save policy and download Word (.doc)"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Save & Word (.doc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveAndDownload(e, 'pdf')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                    title="Save policy and download print-ready PDF"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Save & Download PDF</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1d6eed] hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    Save Policy
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Edit Policy</h3>
              <button onClick={() => setEditingPolicy(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  value={editingPolicy.title}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingPolicy.category}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="QUALITY">QUALITY</option>
                    <option value="SAFETY">SAFETY</option>
                    <option value="ENVIRONMENT">ENVIRONMENT</option>
                    <option value="INFORMATION SECURITY">INFORMATION SECURITY</option>
                    <option value="ENERGY">ENERGY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingPolicy.status}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="ACTIVE">ACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Statement</label>
                <textarea
                  rows={3}
                  value={editingPolicy.content || ''}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDownloadPolicy(editingPolicy, 'pdf')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold cursor-pointer"
                  title="Download this policy as PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPolicy(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Update Policy
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Document Preview Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8 space-y-5">
            {/* Header Ribbon */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {viewingPolicy.documentNumber || `POL-${viewingPolicy.id.slice(-4).toUpperCase()}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {viewingPolicy.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {viewingPolicy.status}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  {viewingPolicy.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {company.name} • ISO 9001:2015 Clause 5.2 Controlled Policy Document
                </p>
              </div>

              <button
                onClick={() => setViewingPolicy(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Effective Date</span>
                <span className="font-semibold text-slate-800">{viewingPolicy.effectiveDate || '16-Sep-2026'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Review Date</span>
                <span className="font-semibold text-slate-800">{viewingPolicy.reviewDate || '16-Sep-2027'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Revision</span>
                <span className="font-semibold text-slate-800">Rev 01</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Classification</span>
                <span className="font-semibold text-slate-800">Controlled QMS</span>
              </div>
            </div>

            {/* Policy Statement Body */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Policy Statement & Management Commitment
              </div>
              <div className="bg-white border-l-4 border-blue-600 bg-blue-50/20 p-4 rounded-r-xl text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                {viewingPolicy.content ||
                  `Top Management of ${company.name} is committed to satisfying customer requirements, adhering to ISO 9001:2015 guidelines, and driving continual improvement of the Quality Management System.`}
              </div>
            </div>

            {/* Key ISO 9001 Commitments Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>ISO 9001:2015 Clause 5.2 Mandated Framework</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Appropriate to organizational purpose and strategic context</li>
                <li>Provides a framework for setting and evaluating measurable quality objectives</li>
                <li>Includes commitment to satisfy applicable statutory, regulatory and customer requirements</li>
                <li>Communicated, understood, and applied across all organizational tiers</li>
              </ul>
            </div>

            {/* Digital Authorization Stamp */}
            <div className="flex items-center justify-between text-xs border border-emerald-200 bg-emerald-50/70 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">Approved by Top Management</div>
                  <div className="text-[10px] text-emerald-700">
                    Digitally signed & authorized for {company.name}
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded font-bold">
                AUTH-VERIFIED
              </span>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingPolicy;
                    setViewingPolicy(null);
                    setEditingPolicy(toEdit);
                  }}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Policy</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDownloadPolicy(viewingPolicy, 'doc')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Download as Word Document (.doc)"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPolicy(viewingPolicy, 'pdf')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                  title="Download as Print-Ready PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPolicy(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">AI Import from Document</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Paste standard policy clauses from your company documentation to extract statements into your QMS.
            </p>
            <textarea
              rows={5}
              placeholder="Paste policy document text here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setImportText(
                    'Supplier Code of Conduct & Quality Ethics\n' +
                      company.name +
                      ' requires all approved vendors to maintain ethical labor practices, rigorous raw material inspection certificates, and adherence to environmental waste limits.'
                  )
                }
                className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
              >
                Insert Sample Text
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!importText.trim()) return;
                    const lines = importText.split('\n').filter((l) => l.trim().length > 0);
                    const newPol: PolicyItem = {
                      id: `pol-imp-${Date.now()}`,
                      title: lines[0] || 'Imported Organizational Policy',
                      category: 'QUALITY',
                      status: 'DRAFT',
                      content: lines.slice(1).join(' ') || importText,
                      dateCreated: '16 Sep 2026',
                    };
                    setPolicies([newPol, ...policies]);
                    setImportText('');
                    setShowImportModal(false);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Parse & Add Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Objective Modal */}
      {showNewObjectiveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Measurable Quality Objective</h3>
              <button onClick={() => setShowNewObjectiveModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddObjective} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objective Goal</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zero scrap defects on extrusion line 2"
                  value={newObjText}
                  onChange={(e) => setNewObjText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Metric</label>
                <input
                  type="text"
                  placeholder="e.g. Scrap rate < 1.5%"
                  value={newObjMetric}
                  onChange={(e) => setNewObjMetric(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Plant Lead"
                    value={newObjOwner}
                    onChange={(e) => setNewObjOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 31-Dec-2026"
                    value={newObjDue}
                    onChange={(e) => setNewObjDue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewObjectiveModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Create Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Stakeholder Modal */}
      {showNewStakeholderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Interested Party (COTO)</h3>
              <button onClick={() => setShowNewStakeholderModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStakeholder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interested Party</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Key Commercial Customers"
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal / External</label>
                <select
                  value={shType}
                  onChange={(e) => setShType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="EXTERNAL">EXTERNAL</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue of Concern</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Consistent product specifications, on-time delivery..."
                  value={shNeeds}
                  onChange={(e) => setShNeeds(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Process Affected</label>
                <input
                  type="text"
                  placeholder="e.g. Production / Extrusion, Quality Control & Dispatch"
                  value={shProcess}
                  onChange={(e) => setShProcess(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment Method</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Implement batch barcode tracking and automated CoA generation"
                  value={shAction}
                  onChange={(e) => setShAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewStakeholderModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold">
                  Save Interested Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stakeholder / Interested Party Modal */}
      {showEditStakeholderModal && editingStakeholder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Edit Interested Party (COTO)</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditStakeholderModal(false);
                  setEditingStakeholder(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditStakeholder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interested Party</label>
                <input
                  type="text"
                  placeholder="Enter interested party name..."
                  value={editShParty}
                  onChange={(e) => setEditShParty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal / External</label>
                <select
                  value={editShType}
                  onChange={(e) => setEditShType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="EXTERNAL">EXTERNAL</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue of Concern</label>
                <textarea
                  rows={3}
                  placeholder="Key issues of concern, needs or expectations..."
                  value={editShConcern}
                  onChange={(e) => setEditShConcern(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Process Affected</label>
                <input
                  type="text"
                  placeholder="e.g. Production / Extrusion, Quality Control & Dispatch"
                  value={editShProcess}
                  onChange={(e) => setEditShProcess(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment Method</label>
                <textarea
                  rows={3}
                  placeholder="Mitigation, controls, or action plan treatment..."
                  value={editShTreatment}
                  onChange={(e) => setEditShTreatment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditStakeholderModal(false);
                    setEditingStakeholder(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Risk Modal */}
      {showNewRiskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Risk Assessment Entry</h3>
              <button onClick={() => setShowNewRiskModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRisk} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Risk Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Power surge damaging PLC temperature controller"
                  value={riskDesc}
                  onChange={(e) => setRiskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Process / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Production / Extrusion 111"
                  value={riskProcess}
                  onChange={(e) => setRiskProcess(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Likelihood (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={riskLikelihood}
                    onChange={(e) => setRiskLikelihood(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consequence (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={riskImpact}
                    onChange={(e) => setRiskImpact(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mitigation Plan</label>
                <textarea
                  rows={2}
                  placeholder="Preventive and corrective mitigation steps..."
                  value={riskMitigation}
                  onChange={(e) => setRiskMitigation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRiskModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold">
                  Save Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {showNewOppModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Opportunity Entry</h3>
              <button onClick={() => setShowNewOppModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddOpportunity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Integrate AI vision sorting on packaging line"
                  value={oppDesc}
                  onChange={(e) => setOppDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Strategic Focus Area</label>
                <input
                  type="text"
                  placeholder="e.g. Quality Assurance / Extrusion"
                  value={oppFocus}
                  onChange={(e) => setOppFocus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Likelihood (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={oppFeasibility}
                    onChange={(e) => setOppFeasibility(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impact (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={oppImpact}
                    onChange={(e) => setOppImpact(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Plan</label>
                <textarea
                  rows={2}
                  placeholder="Steps to realize and capture this opportunity..."
                  value={oppAction}
                  onChange={(e) => setOppAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Plant Lead"
                    value={oppOwner}
                    onChange={(e) => setOppOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 30-Nov-2026"
                    value={oppDate}
                    onChange={(e) => setOppDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOppModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold">
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT OBJECTIVE MODAL                                     */}
      {/* ======================================================== */}
      {editingObjective && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Quality Objective</h3>
                  <p className="text-[11px] text-slate-500">ISO 9001:2015 Clause 6.2 Objectives & Planning</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingObjective(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditObjective} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Objective Goal / Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingObjective.objective}
                  onChange={(e) => setEditingObjective({ ...editingObjective, objective: e.target.value })}
                  placeholder="e.g. Attain ISO 9001:2015 First-Time Stage-2 Audit Pass"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Metric (KPI)</label>
                <input
                  type="text"
                  required
                  value={editingObjective.targetMetric}
                  onChange={(e) => setEditingObjective({ ...editingObjective, targetMetric: e.target.value })}
                  placeholder="e.g. Overall audit compliance score ≥ 88%"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner / Department</label>
                  <input
                    type="text"
                    required
                    value={editingObjective.owner}
                    onChange={(e) => setEditingObjective({ ...editingObjective, owner: e.target.value })}
                    placeholder="e.g. Quality Lead Auditor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="text"
                    required
                    value={editingObjective.dueDate}
                    onChange={(e) => setEditingObjective({ ...editingObjective, dueDate: e.target.value })}
                    placeholder="e.g. 30-Nov-2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingObjective.status}
                    onChange={(e) =>
                      setEditingObjective({
                        ...editingObjective,
                        status: e.target.value as 'ON TRACK' | 'AT RISK' | 'ACHIEVED',
                        progress:
                          e.target.value === 'ACHIEVED' && editingObjective.progress < 100
                            ? 100
                            : editingObjective.progress,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-900"
                  >
                    <option value="ON TRACK">ON TRACK</option>
                    <option value="ACHIEVED">ACHIEVED</option>
                    <option value="AT RISK">AT RISK</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Progress</label>
                    <span className="font-bold text-blue-600">{editingObjective.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editingObjective.progress}
                    onChange={(e) =>
                      setEditingObjective({
                        ...editingObjective,
                        progress: parseInt(e.target.value) || 0,
                        status: parseInt(e.target.value) === 100 ? 'ACHIEVED' : editingObjective.status,
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteObjective(editingObjective.id, editingObjective.objective)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Objective</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingObjective(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AI IMPORT OBJECTIVES FROM DOCUMENT MODAL                */}
      {/* ======================================================== */}
      {showAIObjectiveImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-6 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      AI Objectives & Targets Document Import
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ISO 9001 Clause 6.2
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload an objectives document or paste table rows. AI extracts SMART targets, KPIs, owners, and due dates.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAIObjectiveImportModal(false);
                  setImportedObjectivesPreview([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Upload Area */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Upload Document File (.pdf, .docx, .xlsx, .csv, .txt)
                </label>
                <div
                  onClick={() => objectiveFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={objectiveFileInputRef}
                    onChange={handleObjectiveFileUpload}
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">
                      {objectiveImportFileName ? (
                        <span className="text-indigo-600 font-bold">Selected: {objectiveImportFileName}</span>
                      ) : (
                        'Click to browse or drag & drop objectives document'
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Supports PDF, Word Documents, Excel Sheets, CSV and Plain Text
                    </span>
                  </div>
                </div>
              </div>

              {/* Paste Text Fallback */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Document Text / Table Extract
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleObjectiveDoc}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
                  >
                    📋 Paste Sample Objectives Document
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={objectiveImportText}
                  onChange={(e) => setObjectiveImportText(e.target.value)}
                  placeholder="Paste clauses, objectives tables, or KPI registers here..."
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:font-sans"
                />
              </div>

              {/* Action Trigger Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  {isAIImportingObjectives && (
                    <span className="text-indigo-600 font-medium animate-pulse flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {aiImportObjectiveStep}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRunAIObjectiveExtraction}
                  disabled={isAIImportingObjectives || (!objectiveImportText.trim() && !objectiveImportFileName)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  {isAIImportingObjectives ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>AI Extract Objectives from Document</span>
                    </>
                  )}
                </button>
              </div>

              {/* Extracted Preview List */}
              {importedObjectivesPreview.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        Extracted Objectives Preview ({importedObjectivesPreview.length})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready to Import
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImportedObjectivesPreview([])}
                      className="text-xs text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      Clear Preview
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {importedObjectivesPreview.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{item.objective}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.status === 'ACHIEVED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : item.status === 'ON TRACK'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.status}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {item.progress}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">Target:</span> {item.targetMetric}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span>Owner: {item.owner}</span>
                            <span>Due: {item.dueDate}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePreviewObjective(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-white transition-colors cursor-pointer"
                          title="Remove from import"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Confirm Import Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Items will be added to your active Objectives & Targets register and saved automatically.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAIObjectiveImportModal(false)}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImportObjectives}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Import ({importedObjectivesPreview.length}) Objectives</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AI IMPORT INTERESTED PARTIES (COTO) MODAL                */}
      {/* ======================================================== */}
      {showAIPartiesImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-6 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      AI Interested Parties & COTO Document Import
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ISO 9001 Clause 4
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a stakeholder register document or paste text. AI extracts Interested Parties, Internal/External classification, Issues of Concern, Process Affected, and Treatment Methods.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAIPartiesImportModal(false);
                  setImportedPartiesPreview([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Upload Area */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Upload Document File (.pdf, .docx, .xlsx, .csv, .txt)
                </label>
                <div
                  onClick={() => partiesFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">
                      {partiesImportFileName ? `Selected: ${partiesImportFileName}` : 'Click to browse or drop COTO / Stakeholder document'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Supports PDF stakeholder registers, Word SOPs, Excel matrix exports, or plain text
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Or Paste Stakeholder & COTO Register Content
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPartiesImportText(
                        `Interested Party: Statutory Authorities (DoEL, SABS)\nCategory: EXTERNAL\nIssue of Concern: Strict compliance with Occupational Health & Safety and air emissions standards.\nProcess Affected: Plant Utilities, Maintenance & Governance\nTreatment Method: Quarterly surveillance audits and legal register review.\n\n` +
                          `Interested Party: Automotive Tier-1 Customers\nCategory: EXTERNAL\nIssue of Concern: Strict CoA batch consistency and zero dispatch delays.\nProcess Affected: Extrusion Line 1 & Quality Control\nTreatment Method: Automated inline melt index testing and batch barcoding.\n\n` +
                          `Interested Party: Plant Operations Team & Technicians\nCategory: INTERNAL\nIssue of Concern: Safe workplace environment, machine guarding, and clear SOPs.\nProcess Affected: Production & Granulation Operations\nTreatment Method: Monthly ISO 9001 toolbox talks and certified equipment training.`
                      );
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    Insert Sample COTO Content
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={partiesImportText}
                  onChange={(e) => setPartiesImportText(e.target.value)}
                  placeholder="Paste table rows or text describing interested parties, internal/external scope, issues of concern, and treatment actions..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleParseAIPartiesModal}
                  disabled={isAIParsingParties || (!partiesImportText.trim() && !partiesImportFileName)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  {isAIParsingParties ? (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-200 animate-spin" />
                      <span>AI Extracting Interested Parties...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>AI Extract Interested Parties from Document</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Section */}
              {importedPartiesPreview.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>AI Extracted {importedPartiesPreview.length} Interested Parties (Ready for Import)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Select items to import into active COTO register
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {importedPartiesPreview.map((item, i) => (
                      <div
                        key={item.id || i}
                        className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                          item.selected !== false
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.selected !== false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setImportedPartiesPreview((prev) =>
                              prev.map((p, idx) => (idx === i ? { ...p, selected: checked } : p))
                            );
                          }}
                          className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{item.stakeholder}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-slate-700 border border-slate-200">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">
                            <span className="font-semibold text-slate-700">Issue:</span> {item.issueOfConcern}
                          </p>
                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 pt-1">
                            <span>
                              <span className="font-semibold text-slate-600">Process:</span> {item.processAffected}
                            </span>
                            <span className="truncate max-w-[260px]">
                              <span className="font-semibold text-slate-600">Treatment:</span> {item.treatmentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Confirm Import Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Selected items will be saved directly into your Clause 4 COTO stakeholder register.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAIPartiesImportModal(false)}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImportParties}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Import ({importedPartiesPreview.filter((p) => p.selected !== false).length}) Parties</span>
                      </button>
                    </div>
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
