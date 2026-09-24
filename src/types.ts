export type NavigationTab =
  | 'dashboard'
  | 'document-control'
  | 'ncr-management'
  | 'policy-objectives'
  | 'calibration-control'
  | 'supplier-management'
  | 'hr-management'
  | 'customer-satisfaction'
  | 'audit-management'
  | 'management-review'
  | 'process-control'
  | 'tutorial-centre'
  | 'iso-toolkit'
  | 'qms-guidelines'
  | 'video-tutorials'
  | 'help-support'
  | 'billing-plan'
  | 'settings'
  | 'profile';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  plan: string;
  daysRemaining: number;
  registrationNumber?: string;
  industry?: string;
  address?: string;
  isoScope?: string[];
  employeesCount?: string;
  companyDescription?: string;
  mainProductsAndServices?: string;
  topExecutiveTitle?: string;
  keyFunctionalRoles?: {
    purchasingResponsible?: string[];
    supplierManagementResponsible?: string[];
    hrManager?: string[];
    trainingCoordinator?: string[];
    productReleaseApprover?: string[];
    salesManager?: string[];
  };
  socialMedia?: {
    linkedIn?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    otherLinks?: string;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  companyName?: string;
}

export interface NCRItem {
  id: string;
  ncrNumber: string;
  issuedTo: string;
  dateIssued: string;
  dueDate: string;
  daysLeft: number;
  openPeriod: string;
  status: 'OPEN' | 'IN PROGRESS' | 'CLOSED';
  type: string;
  locked?: boolean;
  problemSummary?: string;
  description?: string;
  raisedBy?: string;
  daysToClose?: number;
  photos?: string[];
}

export interface AuditProcessRow {
  id: string;
  processName: string;
  months: {
    [key: string]: {
      status: 'planned' | 'due' | 'overdue' | 'completed' | 'rescheduled' | null;
      initials?: string;
    };
  };
  ncrs: number | string;
  ofis: number | string;
  totalScore: number | string;
}

export interface AuditFindingItem {
  id: string;
  findingType: 'Minor Non-Conformance' | 'Major Non-Conformance' | 'Observation / OFI' | 'Good Practice';
  clause: string;
  description: string;
  responsible?: string;
  targetDate?: string;
}

export interface TurtleAnalysis {
  resources: string; // With what resources / Machines or Equipment?
  personnel: string; // With Whom / People, Sections or Departments?
  inputs: string; // Inputs
  outputs: string; // Outputs
  measures: string; // How many / measures or indicators?
  procedures: string; // How / Techniques, Methods or Procedures?
}

export interface AuditReportItem {
  id: string;
  reportNo: string;
  title: string;
  processName: string;
  auditType: 'Internal Audit' | 'Supplier Audit' | 'External Certification' | 'Surveillance Audit';
  leadAuditor: string;
  auditorInitials: string;
  auditDate: string;
  scopeClause: string;
  majorNcrs: number;
  minorNcrs: number;
  ofis: number;
  score: number;
  status: 'Completed' | 'Pending Review' | 'Draft' | 'Follow-up Required';
  conclusion: string;
  summary?: string;
  strengths?: string;
  nonConformances?: string;
  recommendations?: string;
  auditee?: string;
  standards?: string;
  overallImpressions?: string;
  turtleAnalysis?: TurtleAnalysis;
  findings?: AuditFindingItem[];
}

export interface CalibrationInstrument {
  id: string;
  instrumentId: string;
  description: string;
  serialNo: string;
  location: string;
  lastCal: string;
  interval: string;
  nextDue: string;
  daysUntilDue: number;
  status: 'In Tolerance' | 'Due Soon' | 'Overdue';
  responsible: string;
  provider?: string;
  notes?: string;
  certificateName?: string;
  certificateUrl?: string;
}

export interface HRData {
  totalEmployees: number;
  departments: { name: string; count: number }[];
  jobTitles: { name: string; count: number }[];
}

export interface ReviewMeeting {
  id: string;
  title: string;
  status: 'PLANNED' | 'COMPLETED' | string;
  dateStr: string;
  organizer: string;
  chairedBy?: string;
  apologies?: string;
  membersInAttendance?: string;
  time?: string;
  venue?: string;
  objective?: string;
  agenda?: string;
}

export interface PolicyItem {
  id: string;
  title: string;
  category: 'QUALITY' | 'ENVIRONMENT' | 'SAFETY' | 'INFORMATION SECURITY' | 'ENERGY' | string;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'ARCHIVED' | string;
  content?: string;
  dateCreated?: string;
  documentNumber?: string;
  effectiveDate?: string;
  reviewDate?: string;
}

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  division?: string;
  category: string;
  contactName?: string;
  telNo?: string;
  email?: string;
  status: 'Approved' | 'Pending Evaluation' | 'Conditional' | 'Disqualified' | string;
  rating?: number;
  lastAudit?: string;
  isoCertified?: boolean;
}

export interface ObjectiveItem {
  id: string;
  objective: string;
  targetMetric: string;
  owner: string;
  dueDate: string;
  progress: number;
  status: 'ON TRACK' | 'AT RISK' | 'ACHIEVED';
}

export interface StakeholderIssue {
  id: string;
  stakeholder: string;
  needsAndExpectations?: string;
  category: 'INTERNAL' | 'EXTERNAL';
  riskOpportunity?: string;
  actionPlan?: string;
  issueOfConcern?: string;
  processAffected?: string;
  treatmentMethod?: string;
}

export interface RiskItem {
  id: string;
  riskDescription: string;
  process: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // Likelihood + Consequence - 1 (1-9 scale, e.g. 4+3=6)
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation: string;
  consequence?: number;
}

export interface ProcessFlowStep {
  id: string;
  stepNumber: number;
  title: string;
  responsibleRole: string;
  inputs: string;
  outputs: string;
}

export interface QCPCheckpoint {
  id: string;
  parameter: string;
  specification: string;
  frequency: string;
  acceptanceCriteria: string;
}

export interface ProcessControlItem {
  id: string;
  name: string;
  code: string;
  status: 'Draft' | 'Approved' | 'In Review';
  hasFlowchart: boolean;
  hasQCP: boolean;
  flowchartSteps?: ProcessFlowStep[];
  qcpCheckpoints?: QCPCheckpoint[];
  documentNumber?: string;
  isoClause?: string;
  processOwner?: string;
  preparedBy?: string;
  coreTeam?: string;
  customer?: string;
  revisionNumber?: string;
  effectiveDate?: string;
  revisionDate?: string;
  customerApprovalDate?: string;
  description?: string;
}

export interface OpportunityItem {
  id: string;
  opportunityDescription: string;
  focusArea: string;
  potentialBenefit: string;
  feasibility: number; // 1-5
  impact: number; // 1-5
  score: number; // Impact + Likelihood - 1 (1-9 scale, e.g. 4+4=7)
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionPlan: string;
  owner: string;
  targetDate: string;
  process?: string;
  consequence?: number;
  likelihood?: number;
  mitigation?: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: 'Consultant' | 'Standard User' | 'External Auditor' | 'Owner';
  status: 'ACTIVE' | 'INVITED';
  dateAdded: string;
  expiry?: string;
  duration?: string;
  isOwner?: boolean;
}

