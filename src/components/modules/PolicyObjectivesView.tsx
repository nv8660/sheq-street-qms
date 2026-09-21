import React, { useState, useRef } from 'react';
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
  const [policies, setPolicies] = useState<PolicyItem[]>(initialPolicies);
  const [objectives, setObjectives] = useState<ObjectiveItem[]>(initialObjectives);
  const [stakeholders, setStakeholders] = useState<StakeholderIssue[]>(initialStakeholders);
  const [risks, setRisks] = useState<RiskItem[]>(initialRisks);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(initialOpportunities);

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

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showNewObjectiveModal, setShowNewObjectiveModal] = useState(false);
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
  const [shType, setShType] = useState<'INTERNAL' | 'EXTERNAL'>('EXTERNAL');
  const [shNeeds, setShNeeds] = useState('');
  const [shRisk, setShRisk] = useState('');
  const [shAction, setShAction] = useState('');

  // Toast trigger
  const showNotice = (msg: string) => {
    setAiSuccessNotice(msg);
    setTimeout(() => setAiSuccessNotice(null), 4000);
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
          needsAndExpectations:
            'Consistent polymer melt-flow specifications, 100% on-time delivery, verified Certificate of Analysis with every dispatched batch.',
          category: 'EXTERNAL',
          riskOpportunity:
            'Opportunity: Secure multi-year exclusive tier-1 supply agreements with 25% margin uplift.',
          actionPlan:
            'Enforce optical inspection checkpoints and automated batch CoA delivery via SHEQ Street portal.',
        },
        {
          id: `sh-ai-${Date.now()}-2`,
          stakeholder: 'Statutory Authorities (DoEL, SABS, Environmental Dept)',
          needsAndExpectations:
            'Strict adherence to OHS Act (Act 85 of 1993), air quality emissions limits, and municipal wastewater discharge bylaws.',
          category: 'EXTERNAL',
          riskOpportunity:
            'Risk: Statutory stop-order notices and non-compliance fines halting plant operations.',
          actionPlan:
            'Quarterly environmental surveillance audits, calibrated noise/air monitoring, and legal register reviews.',
        },
        {
          id: `sh-ai-${Date.now()}-3`,
          stakeholder: 'Raw Polymer & Masterbatch Chemical Suppliers',
          needsAndExpectations:
            'Fair procurement contracts, clear technical quality acceptance specifications, and punctual payment terms.',
          category: 'EXTERNAL',
          riskOpportunity:
            'Risk: Foreign contamination in unwashed scrap bales causing extruder die blockage.',
          actionPlan:
            'Establish Approved Vendor Rating criteria and mandatory incoming raw material bale sampling.',
        },
        {
          id: `sh-ai-${Date.now()}-4`,
          stakeholder: 'Plant Operators & Maintenance Technicians',
          needsAndExpectations:
            'Zero-harm workplace, PPE availability, clear Standard Operating Procedures (SOPs), and skill development programs.',
          category: 'INTERNAL',
          riskOpportunity:
            'Opportunity: Increased workforce retention, fewer lost-time incidents, and reduced scrap defect rates.',
          actionPlan:
            'Monthly ISO 9001 toolbox talks, machine safety guarding certifications, and operator reward schemes.',
        },
        {
          id: `sh-ai-${Date.now()}-5`,
          stakeholder: 'Executive Board & Shareholders',
          needsAndExpectations:
            'Sustainable commercial growth, reduced Cost of Poor Quality (COPQ), and auditable corporate governance.',
          category: 'INTERNAL',
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
          riskScore: 12,
          level: 'HIGH',
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
          riskScore: 8,
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
          riskScore: 9,
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
          riskScore: 8,
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
          riskScore: 6,
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
          score: 20,
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
          score: 16,
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
          score: 20,
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
          score: 12,
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

  // Modal handlers
  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyTitle.trim()) return;
    const item: PolicyItem = {
      id: `pol-${Date.now()}`,
      title: policyTitle.trim(),
      documentNumber: policyDocNumber.trim() || undefined,
      category: policyCategory,
      status: policyStatus,
      effectiveDate: policyEffectiveDate.trim() || undefined,
      reviewDate: policyReviewDate.trim() || undefined,
      content:
        policyContent.trim() ||
        'Policy statement committed to ISO compliance and continual improvement.',
      dateCreated: policyEffectiveDate.trim() || '21 Sep 2026',
    };
    setPolicies([item, ...policies]);
    setPolicyTitle('');
    setPolicyDocNumber('');
    setPolicyCategory('Quality');
    setPolicyStatus('Draft');
    setPolicyEffectiveDate('');
    setPolicyReviewDate('');
    setPolicyContent('');
    setShowNewModal(false);
  };

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setPolicies(policies.map((p) => (p.id === editingPolicy.id ? editingPolicy : p)));
    setEditingPolicy(null);
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
  };

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskDesc.trim()) return;
    const score = riskLikelihood * riskImpact;
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (score >= 12) level = 'HIGH';
    else if (score >= 6) level = 'MEDIUM';

    const newR: RiskItem = {
      id: `risk-${Date.now()}`,
      riskDescription: riskDesc.trim(),
      process: riskProcess.trim() || 'General QMS',
      likelihood: riskLikelihood,
      impact: riskImpact,
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
    const score = oppFeasibility * oppImpact;
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (score >= 15) priority = 'HIGH';
    else if (score >= 8) priority = 'MEDIUM';

    const newOpp: OpportunityItem = {
      id: `opp-${Date.now()}`,
      opportunityDescription: oppDesc.trim(),
      focusArea: oppFocus.trim() || 'General Operations',
      potentialBenefit: 'Improved operational efficiency and customer delivery speed',
      feasibility: oppFeasibility,
      impact: oppImpact,
      score,
      priority,
      actionPlan: oppAction.trim() || 'Plan pilot project with department leads.',
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
      needsAndExpectations: shNeeds.trim() || 'Timely delivery, zero defects, and clear communication.',
      riskOpportunity: shRisk.trim() || 'Risk of misalignment or delay.',
      actionPlan: shAction.trim() || 'Quarterly review and SLA alignment.',
    };
    setStakeholders([newSh, ...stakeholders]);
    setShName('');
    setShNeeds('');
    setShRisk('');
    setShAction('');
    setShowNewStakeholderModal(false);
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
                  const newAi: PolicyItem = {
                    id: `pol-ai-${Date.now()}`,
                    title: 'Information Security & Data Integrity Policy',
                    category: 'INFORMATION SECURITY',
                    status: 'DRAFT',
                    content: `${company.name} safeguards corporate and customer data assets according to ISO/IEC 27001 guidelines, enforcing multi-factor authentication and strict access roles.`,
                    dateCreated: '16 Sep 2026',
                  };
                  setPolicies([newAi, ...policies]);
                  setAiGenerating(null);
                  showNotice('✨ Successfully auto-generated Information Security Policy with AI!');
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
                  {p.documentNumber && (
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {p.documentNumber}
                    </span>
                  )}
                  <span className="font-bold text-sm text-slate-900">{p.title}</span>
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

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => setEditingPolicy(p)}
                    className="p-1.5 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                    title="Edit Policy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPolicies(policies.filter((item) => item.id !== p.id))}
                    className="p-1.5 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
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
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
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
                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                    <span>Owner: {obj.owner}</span>
                    <button
                      onClick={() => setObjectives(objectives.filter((o) => o.id !== obj.id))}
                      className="text-slate-300 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                onClick={handleAutoGenerateStakeholders}
                disabled={aiGenerating === 'parties'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1f38] hover:bg-[#132c4e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {aiGenerating === 'parties' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Auto-Generate Stakeholders with AI</span>
              </button>

              <button
                onClick={() => setShowNewStakeholderModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stakeholder</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Interested Party / Stakeholder</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Needs & Expectations</th>
                    <th className="py-3 px-4">Risk / Opportunity</th>
                    <th className="py-3 px-4">Action Plan</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {stakeholders.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sh.stakeholder}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sh.category === 'EXTERNAL'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {sh.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">{sh.needsAndExpectations}</td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">{sh.riskOpportunity}</td>
                      <td className="py-3.5 px-4 text-blue-700 font-semibold">{sh.actionPlan}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setStakeholders(stakeholders.filter((s) => s.id !== sh.id))}
                          className="text-slate-300 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Risk Register & Assessment (ISO 9001 Clause 6.1.1)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Identify, quantify, and treat process risks using likelihood and impact scoring.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAutoGenerateRisks}
                disabled={aiGenerating === 'risks'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1f38] hover:bg-[#132c4e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {aiGenerating === 'risks' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Auto-Generate Risks with AI</span>
              </button>

              <button
                onClick={() => setShowNewRiskModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Risk Entry</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Risk Description</th>
                    <th className="py-3 px-4">Applicable Process</th>
                    <th className="py-3 px-4 text-center">Likelihood (1-5)</th>
                    <th className="py-3 px-4 text-center">Impact (1-5)</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Mitigation Control</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {risks.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                        {r.riskDescription}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.process}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">{r.likelihood}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">{r.impact}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                        {r.riskScore}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.level === 'HIGH'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : r.level === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {r.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">{r.mitigation}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setRisks(risks.filter((item) => item.id !== r.id))}
                          className="text-slate-300 hover:text-red-600 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Opportunity Register & Action Plans (ISO 9001 Clause 6.1.2)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Capture strategic, market, and technological opportunities for organizational growth and quality improvement.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAutoGenerateOpportunities}
                disabled={aiGenerating === 'opportunities'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0c1f38] hover:bg-[#132c4e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {aiGenerating === 'opportunities' ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Auto-Generate Opportunities with AI</span>
              </button>

              <button
                onClick={() => setShowNewOppModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Opportunity</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Opportunity Description</th>
                    <th className="py-3 px-4">Focus Area / Process</th>
                    <th className="py-3 px-4 text-center">Feasibility (1-5)</th>
                    <th className="py-3 px-4 text-center">Impact (1-5)</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Action Plan & Realization</th>
                    <th className="py-3 px-4">Owner & Target</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                        {opp.opportunityDescription}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{opp.focusArea}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{opp.feasibility}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{opp.impact}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                        {opp.score}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            opp.priority === 'HIGH'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : opp.priority === 'MEDIUM'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {opp.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-sm">{opp.actionPlan}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{opp.owner}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{opp.targetDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setOpportunities(opportunities.filter((o) => o.id !== opp.id))}
                          className="text-slate-300 hover:text-red-600 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
              <h2 className="font-bold text-xl text-slate-900">New Policy</h2>
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
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1d6eed] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Save Policy
                </button>
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
              <button onClick={() => setEditingPolicy(null)} className="text-slate-400">
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Update Policy
                </button>
              </div>
            </form>
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
                <label className="block font-semibold text-slate-700 mb-1">Stakeholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automotive OEM Clients"
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={shType}
                  onChange={(e) => setShType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="EXTERNAL">EXTERNAL</option>
                  <option value="INTERNAL">INTERNAL</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Needs & Expectations</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 100% on-time delivery and strict chemical spec adherence"
                  value={shNeeds}
                  onChange={(e) => setShNeeds(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Risk / Opportunity</label>
                <input
                  type="text"
                  placeholder="e.g. Opportunity to secure annual supply agreement"
                  value={shRisk}
                  onChange={(e) => setShRisk(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Plan</label>
                <input
                  type="text"
                  placeholder="e.g. Institute batch CoA testing and bi-weekly status meetings"
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
                  Save Stakeholder
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
                  <label className="block font-semibold text-slate-700 mb-1">Impact (1 to 5)</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Feasibility (1-5)</label>
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
    </div>
  );
};
