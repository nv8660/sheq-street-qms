import {
  NCRItem,
  AuditProcessRow,
  CalibrationInstrument,
  HRData,
  ReviewMeeting,
  ProcessControlItem,
  Company,
} from '../types';

export const initialCompany: Company = {
  id: 'nk',
  name: 'nk',
  registrationNumber: '2024/991024/07',
  email: 'nv8660970099@gmail.com',
  phone: '+27 11 948 2000',
  website: 'https://sheqstreet.co.za',
  address: 'no84 guindy workspace',
  industry: 'steel',
  plan: 'TRIAL',
  daysRemaining: 13,
  isoScope: ['ISO 9001:2015'],
  employeesCount: '11-50 employees',
};


export const initialNCRs: NCRItem[] = [
  {
    id: '1',
    ncrNumber: 'NCR-2024-002',
    issuedTo: 'Warehouse',
    dateIssued: '27-Aug-2026',
    dueDate: '26-Sept-2026',
    daysLeft: 9,
    openPeriod: '21d',
    status: 'OPEN',
    type: 'INTERNAL',
  },
  {
    id: '2',
    ncrNumber: 'NCR-2024-002',
    issuedTo: 'Warehouse',
    dateIssued: '27-Aug-2026',
    dueDate: '26-Sept-2026',
    daysLeft: 9,
    openPeriod: '21d',
    status: 'OPEN',
    type: 'INTERNAL',
  },
  {
    id: '3',
    ncrNumber: 'NCR-2024-001',
    issuedTo: 'Production Department',
    dateIssued: '2-Aug-2026',
    dueDate: '1-Oct-2026',
    daysLeft: 14,
    openPeriod: '46d',
    status: 'IN PROGRESS',
    type: 'INTERNAL',
  },
  {
    id: '4',
    ncrNumber: 'NCR-2024-001',
    issuedTo: 'Production Department',
    dateIssued: '2-Aug-2026',
    dueDate: '1-Oct-2026',
    daysLeft: 14,
    openPeriod: '46d',
    status: 'IN PROGRESS',
    type: 'INTERNAL',
  },
  {
    id: '5',
    ncrNumber: 'NCR-2024-003',
    issuedTo: 'Maintenance',
    dateIssued: '18-Jul-2026',
    dueDate: '11-Sept-2026',
    daysLeft: -3,
    openPeriod: '58d',
    status: 'CLOSED',
    type: 'INTERNAL',
    locked: true,
  },
  {
    id: '6',
    ncrNumber: 'NCR-2024-003',
    issuedTo: 'Maintenance',
    dateIssued: '18-Jul-2026',
    dueDate: '11-Sept-2026',
    daysLeft: -3,
    openPeriod: '58d',
    status: 'CLOSED',
    type: 'INTERNAL',
    locked: true,
  },
];

export const initialAuditRows: AuditProcessRow[] = [
  {
    id: '1',
    processName: 'Document Control',
    months: {
      JAN: { status: 'overdue', initials: 'JS' },
      APR: { status: 'overdue', initials: 'JS' },
      JUN: { status: 'completed' },
      JUL: { status: 'overdue', initials: 'MK' },
      OCT: { status: 'planned', initials: 'JS' },
    },
    ncrs: 2,
    ofis: 2,
    totalScore: '70%',
  },
  {
    id: '2',
    processName: 'Purchasing',
    months: {
      FEB: { status: 'overdue', initials: 'MK' },
      AUG: { status: 'completed', initials: 'JS' },
    },
    ncrs: 2,
    ofis: 2,
    totalScore: '70%',
  },
  {
    id: '3',
    processName: 'Production',
    months: {
      MAR: { status: 'overdue', initials: 'JS' },
      JUN: { status: 'overdue', initials: 'MK' },
      SEP: { status: 'due', initials: 'JS' },
      NOV: { status: 'planned', initials: 'MK' },
    },
    ncrs: '—',
    ofis: '—',
    totalScore: '—',
  },
  {
    id: '4',
    processName: 'Customer Satisfaction',
    months: {
      MAY: { status: 'overdue', initials: 'JS' },
      OCT: { status: 'planned', initials: 'MK' },
    },
    ncrs: '—',
    ofis: '—',
    totalScore: '—',
  },
  {
    id: '5',
    processName: 'Document Control',
    months: {
      JAN: { status: 'overdue', initials: 'JS' },
      APR: { status: 'overdue', initials: 'JS' },
      JUN: { status: 'completed' },
      JUL: { status: 'overdue', initials: 'MK' },
      OCT: { status: 'planned', initials: 'JS' },
    },
    ncrs: 2,
    ofis: 2,
    totalScore: '70%',
  },
  {
    id: '6',
    processName: 'Purchasing',
    months: {
      FEB: { status: 'overdue', initials: 'MK' },
      AUG: { status: 'completed', initials: 'JS' },
    },
    ncrs: 2,
    ofis: 2,
    totalScore: '70%',
  },
  {
    id: '7',
    processName: 'Production',
    months: {
      MAR: { status: 'overdue', initials: 'JS' },
      JUN: { status: 'overdue', initials: 'MK' },
      SEP: { status: 'due', initials: 'JS' },
      NOV: { status: 'planned', initials: 'MK' },
    },
    ncrs: '—',
    ofis: '—',
    totalScore: '—',
  },
  {
    id: '8',
    processName: 'Customer Satisfaction',
    months: {
      MAY: { status: 'overdue', initials: 'JS' },
      OCT: { status: 'planned', initials: 'MK' },
    },
    ncrs: '—',
    ofis: '—',
    totalScore: '—',
  },
];

export const initialHRData: HRData = {
  totalEmployees: 0,
  departments: [{ name: 'marketing', count: 0 }],
  jobTitles: [{ name: 'sales', count: 0 }],
};

export const initialReviews: ReviewMeeting[] = [
  {
    id: 'rev-1',
    title: 'ISO 9001:2015 Management Review Meeting',
    status: 'PLANNED',
    dateStr: '17-Sept-2026',
    organizer: 'rmz',
    venue: 'rmz',
    apologies: 'None',
    objective:
      "The organisation's management review of the quality management system to ensure suitability, adequacy and effectiveness. The review is to include the assessment of opportunities for improvement and any potential changes to the quality management system, including quality policy, objectives & targets, and their alignment with business objectives and overall strategy.",
    agenda:
      "1) Quality management system documents status.\n2) Quality policy & objectives\n3) External and internal issues\n4) Risks and opportunities\n5) Audit results:\n   a) Internal audits\n   b) External audits\n6) Customer satisfaction & feedback\n7) Supplier performance\n8) Non-conformance & corrective actions (CAPA)\n9) Changes that could affect the QMS\n10) Resource adequacy & improvements",
  },
];

export const initialProcessList: ProcessControlItem[] = [
  {
    id: 'proc-1',
    name: 'recycle',
    code: '111',
    status: 'Draft',
    hasFlowchart: true,
    hasQCP: false,
    flowchartSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Collection & Weighbridge Inspection',
        responsibleRole: 'Logistics Officer',
        inputs: 'Raw post-industrial waste batches',
        outputs: 'Weighed and categorized lot voucher',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Optical & Manual Polymer Sorting',
        responsibleRole: 'Sorting Line Lead',
        inputs: 'Bulk scrap materials',
        outputs: 'Single-grade plastic polymers (HDPE, PP, PET)',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Hot Wash, Friction Cleaning & Shredding',
        responsibleRole: 'Plant Operator',
        inputs: 'Sorted plastic fractions & wash chemicals',
        outputs: 'Clean washed regrind flakes (<12mm)',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Twin-Screw Extrusion & Pelletizing',
        responsibleRole: 'Extruder Tech',
        inputs: 'Clean dry polymer flakes',
        outputs: 'Uniform recycled resin pellets',
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Quality Lab Verification & Packing',
        responsibleRole: 'QC Inspector',
        inputs: 'Resin samples',
        outputs: 'Certificate of Analysis (CoA) & 25kg bags',
      },
    ],
    qcpCheckpoints: [
      {
        id: 'qcp-1',
        parameter: 'Moisture Content',
        specification: '< 0.08%',
        frequency: 'Every production lot',
        acceptanceCriteria: 'ASTM D6980 moisture analyzer pass',
      },
      {
        id: 'qcp-2',
        parameter: 'Melt Flow Index (MFI)',
        specification: '2.5 ± 0.35 g/10 min',
        frequency: 'Every 2 hours',
        acceptanceCriteria: 'ISO 1133 standard extrusion index',
      },
      {
        id: 'qcp-3',
        parameter: 'Contamination & Foreign Inclusions',
        specification: '0 black specs > 0.5mm',
        frequency: 'Hourly optical scan',
        acceptanceCriteria: 'Visual plaque test approval',
      },
    ],
  },
  {
    id: 'proc-2',
    name: 'Injection Moulding',
    code: '112',
    status: 'Approved',
    hasFlowchart: true,
    hasQCP: true,
    flowchartSteps: [
      {
        id: 'step-201',
        stepNumber: 1,
        title: 'Tool Setup & Mold Clamping',
        responsibleRole: 'Tooling Tech',
        inputs: 'Mold spec sheet',
        outputs: 'Clamped & verified mold fixture',
      },
      {
        id: 'step-202',
        stepNumber: 2,
        title: 'Resin Drying & Barrel Feeding',
        responsibleRole: 'Material Handler',
        inputs: 'Virgin/recycled polymer',
        outputs: 'Dry resin at 80°C hopper feed',
      },
    ],
    qcpCheckpoints: [
      {
        id: 'qcp-201',
        parameter: 'Cycle Time',
        specification: '24.5 ± 1.0 sec',
        frequency: 'Continuous PLC log',
        acceptanceCriteria: 'Auto rejection if > 26.0 sec',
      },
    ],
  },
];

export const initialPolicies: import('../types').PolicyItem[] = [
  {
    id: 'pol-1',
    title: 'Quality Policy Statement',
    category: 'QUALITY',
    status: 'DRAFT',
    content:
      'Top Management of nk is committed to consistently satisfying customer requirements, adhering to ISO 9001:2015 requirements, and driving continual improvement of the Quality Management System through structured auditing and objective tracking.',
    dateCreated: '16 Sep 2026',
  },
  {
    id: 'pol-2',
    title: 'Occupational Health & Safety Policy',
    category: 'SAFETY',
    status: 'APPROVED',
    content:
      'nk prioritizes zero-harm workplace environments by preventing injury, reducing occupational health hazards, and consulting employees across all operations.',
    dateCreated: '12 Sep 2026',
  },
  {
    id: 'pol-3',
    title: 'Environmental & Sustainability Policy Statement',
    category: 'ENVIRONMENT',
    status: 'ACTIVE',
    content:
      'nk is committed to minimizing emissions, promoting closed-loop recycling processes, and complying with all South African environmental legislation.',
    dateCreated: '08 Sep 2026',
  },
];

export const initialObjectives: import('../types').ObjectiveItem[] = [
  {
    id: 'obj-1',
    objective: 'Achieve ISO 9001:2015 First-Time Certification',
    targetMetric: 'Audit score ≥ 85%',
    owner: 'Quality Manager',
    dueDate: '30-Oct-2026',
    progress: 85,
    status: 'ON TRACK',
  },
  {
    id: 'obj-2',
    objective: 'Reduce Customer Complaint Response Time',
    targetMetric: '< 24 Hours initial response',
    owner: 'Customer Success Lead',
    dueDate: '31-Dec-2026',
    progress: 92,
    status: 'ACHIEVED',
  },
  {
    id: 'obj-3',
    objective: 'Resolve Internal NCRs Within SLA',
    targetMetric: '100% closed within 30 days',
    owner: 'Operations Manager',
    dueDate: '15-Nov-2026',
    progress: 68,
    status: 'AT RISK',
  },
];

export const initialStakeholders: import('../types').StakeholderIssue[] = [
  {
    id: 'sh-1',
    stakeholder: 'Key Commercial Customers',
    needsAndExpectations: 'Consistent product specifications, on-time delivery, CoA with every batch',
    category: 'EXTERNAL',
    riskOpportunity: 'Opportunity to secure long-term annual supply contracts',
    actionPlan: 'Implement batch barcode tracking and automated CoA generation',
  },
  {
    id: 'sh-2',
    stakeholder: 'Statutory & Regulatory Bodies (DoEL / SABS)',
    needsAndExpectations: 'Full compliance with Occupational Health and Safety Act and SANS standards',
    category: 'EXTERNAL',
    riskOpportunity: 'Risk of non-compliance fines and work stoppages',
    actionPlan: 'Quarterly compliance audits and legal register reviews',
  },
  {
    id: 'sh-3',
    stakeholder: 'Plant Employees & Operations Team',
    needsAndExpectations: 'Safe workplace, clear SOPs, continuous skill development',
    category: 'INTERNAL',
    riskOpportunity: 'Retention of skilled operators and zero workplace incidents',
    actionPlan: 'Monthly toolbox safety talks and ISO 9001 awareness training',
  },
];

export const initialRisks: import('../types').RiskItem[] = [
  {
    id: 'risk-1',
    riskDescription: 'Raw material polymer contamination causing extruder nozzle clogs',
    process: 'Recycle (111)',
    likelihood: 3,
    impact: 4,
    riskScore: 12,
    level: 'HIGH',
    mitigation: 'Implement optical multi-stage flake sorters and dual 80-mesh melt screens.',
  },
  {
    id: 'risk-2',
    riskDescription: 'Key laboratory calibration instrument drift',
    process: 'Calibration Control',
    likelihood: 2,
    impact: 3,
    riskScore: 6,
    level: 'MEDIUM',
    mitigation: 'Enforce automatic 180-day calibration alert schedule with SANAS accredited lab.',
  },
  {
    id: 'risk-3',
    riskDescription: 'Delayed closure of customer complaints due to cross-department backlog',
    process: 'Customer Satisfaction',
    likelihood: 2,
    impact: 2,
    riskScore: 4,
    level: 'LOW',
    mitigation: 'Automated 7-day escalation notifications directly to General Manager.',
  },
];

export const initialInstruments: CalibrationInstrument[] = [];

export const initialOpportunities: import('../types').OpportunityItem[] = [
  {
    id: 'opp-1',
    opportunityDescription: 'Implement AI inline optical sorting to upgrade recycled polymer purity to food-contact grade',
    focusArea: 'Recycle & Extrusion Process',
    potentialBenefit: 'Access 35% higher-margin food & beverage packaging contracts',
    feasibility: 4,
    impact: 5,
    score: 20,
    priority: 'HIGH',
    actionPlan: 'Partner with equipment vendor for pilot trial on line 2 in Q4.',
    owner: 'Operations Manager',
    targetDate: '30-Nov-2026',
  },
  {
    id: 'opp-2',
    opportunityDescription: 'Pursue integrated ISO 14001:2015 & ISO 45001:2018 certification alongside ISO 9001',
    focusArea: 'Integrated Management System',
    potentialBenefit: 'Qualify for premium multinational corporate ESG supply panels',
    feasibility: 4,
    impact: 4,
    score: 16,
    priority: 'HIGH',
    actionPlan: 'Conduct gap assessment and schedule stage-1 certification audit.',
    owner: 'SHEQ Quality Lead',
    targetDate: '15-Dec-2026',
  },
  {
    id: 'opp-3',
    opportunityDescription: 'Digitize shop-floor inspection checklists and mobile NCR logging for operators',
    focusArea: 'Quality Control & Calibration',
    potentialBenefit: 'Reduce quality reporting turnaround time by 60%',
    feasibility: 5,
    impact: 3,
    score: 15,
    priority: 'MEDIUM',
    actionPlan: 'Roll out SHEQ Street mobile app with operator QR code scanning.',
    owner: 'Quality Inspector',
    targetDate: '20-Oct-2026',
  },
];

export const initialTeamMembers: import('../types').TeamMemberItem[] = [
  {
    id: 'tm-1',
    name: 'NAVEEN .V',
    email: 'nv8660970099@gmail.com',
    role: 'Owner',
    status: 'ACTIVE',
    dateAdded: '16-Sep-2026',
    expiry: 'Permanent',
    isOwner: true,
  },
];

