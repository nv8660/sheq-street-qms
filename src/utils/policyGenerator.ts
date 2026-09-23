import { PolicyItem, Company } from '../types';

interface PolicyTemplate {
  title: string;
  category: string;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | string;
  docSuffix: string;
  content: (companyName: string) => string;
}

const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    title: 'Information Security & Cyber Resilience Policy',
    category: 'Information Security',
    status: 'Approved',
    docSuffix: 'POL-004',
    content: (name) =>
      `Top Management of ${name} is dedicated to protecting organizational, customer, and proprietary information assets against unauthorized disclosure, cyber threats, and data loss in accordance with ISO/IEC 27001. We mandate multi-factor authentication on all company portals, enforce strict role-based access rights, perform periodic external penetration testing, and require all personnel to complete bi-annual cybersecurity hygiene training. Any potential breach must be escalated to the Incident Response Team within 2 hours.`,
  },
  {
    title: 'Supply Chain & Ethical Procurement Policy',
    category: 'Operations',
    status: 'Active',
    docSuffix: 'POL-005',
    content: (name) =>
      `${name} commits to establishing and maintaining an ethical, transparent, and resilient supply chain under ISO 9001 and ISO 20400 sustainable procurement guidance. Every prospective vendor and subcontractor is evaluated on manufacturing capability, fair labor practices, quality certificates, and on-time in-full (OTIF) fulfillment prior to inclusion on the Approved Supplier List (ASL). We enforce zero tolerance for modern slavery, child labor, and corrupt commercial practices across all tier-1 and tier-2 partners.`,
  },
  {
    title: 'Energy Management & Carbon Reduction Policy',
    category: 'Energy',
    status: 'Active',
    docSuffix: 'POL-006',
    content: (name) =>
      `${name} is committed to responsible energy stewardship, resource conservation, and progressive greenhouse gas reduction in alignment with ISO 50001 standards. We establish rigorous energy performance baselines across all facility assets, invest in energy-efficient drives and LED lighting, recover process thermal waste, and aim to reduce overall kWh energy intensity per ton of manufactured output by 5% year-on-year.`,
  },
  {
    title: 'Product Quality & Defect Prevention Policy',
    category: 'Quality',
    status: 'Approved',
    docSuffix: 'POL-007',
    content: (name) =>
      `Top Management and operations teams across ${name} are dedicated to defect prevention and Right-First-Time (RFT) execution in compliance with ISO 9001:2015 Clause 8.5. Quality is engineered into operations through verified Quality Control Plans (QCP), automated poka-yoke error proofing, and strict quarantine protocols for suspected non-conforming materials. All manufacturing personnel are authorized and empowered to stop production if critical tolerances are compromised.`,
  },
  {
    title: 'Customer Complaints & Service Excellence Policy',
    category: 'Quality',
    status: 'Active',
    docSuffix: 'POL-008',
    content: (name) =>
      `${name} considers customer feedback and warranty claims essential inputs for continual quality improvement pursuant to ISO 10002. We guarantee formal acknowledgment of every customer query or complaint within 24 hours. Valid non-conformances trigger immediate containment followed by multi-disciplinary 5-Why and Ishikawa root cause investigations, ensuring preventative countermeasures are verified before closing any claim.`,
  },
  {
    title: 'Business Continuity & Disaster Recovery Policy',
    category: 'Safety',
    status: 'Approved',
    docSuffix: 'POL-009',
    content: (name) =>
      `${name} maintains resilient operational and emergency response frameworks aligned with ISO 22301 to protect life, safeguard critical manufacturing assets, and ensure continuity of supply during operational disruptions. We maintain redundant cloud system backups, test secondary electrical generator supplies quarterly, and conduct mandatory annual scenario-based emergency simulations with local civil authorities.`,
  },
  {
    title: 'Workplace Health, Wellness & Ergonomics Policy',
    category: 'Safety',
    status: 'Active',
    docSuffix: 'POL-010',
    content: (name) =>
      `${name} is committed to fostering a safe, healthy, and ergonomically sound workplace under ISO 45001. We provide accredited personal protective equipment (PPE), evaluate repetitive-strain hazards across workstations, conduct annual occupational hygiene noise and audiometric screenings, and provide accessible mental health and employee wellness support programs.`,
  },
  {
    title: 'Waste Minimization & Chemical Control Policy',
    category: 'Environment',
    status: 'Active',
    docSuffix: 'POL-011',
    content: (name) =>
      `In compliance with ISO 14001, ${name} enforces cradle-to-grave stewardship of all raw materials, industrial lubricants, and production chemicals. Secondary containment bunds are inspected monthly, Global Harmonized System (GHS) Safety Data Sheets are maintained in digital registers, and plant waste streams are segregated to achieve a minimum 85% diversion from landfills through circular recycling partnerships.`,
  },
  {
    title: 'Anti-Bribery, Gifts & Corporate Governance Policy',
    category: 'Operations',
    status: 'Approved',
    docSuffix: 'POL-012',
    content: (name) =>
      `${name} operates with uncompromising integrity, transparency, and zero tolerance for bribery, extortion, or illicit facilitation payments in accordance with ISO 37001. All staff, contractors, and commercial representatives must declare gifts or hospitality exceeding company thresholds in the central compliance register, and whistleblowers are protected through confidential reporting channels.`,
  },
  {
    title: 'Competence, Training & Skill Development Policy',
    category: 'Operations',
    status: 'Active',
    docSuffix: 'POL-013',
    content: (name) =>
      `Top Management of ${name} recognizes that employee competence is the foundation of quality excellence (ISO 9001 Clause 7.2). We formulate annual Training Needs Analyses (TNA), maintain structured skills matrices for every machine workstation, and verify that all operators and technicians demonstrate proven competency before being authorized to work independently on production orders.`,
  },
  {
    title: 'Calibration & Measurement Traceability Policy',
    category: 'Quality',
    status: 'Approved',
    docSuffix: 'POL-014',
    content: (name) =>
      `Pursuant to ISO 9001 Clause 7.1.5, ${name} mandates that all measuring and test equipment impacting product conformity is calibrated at scheduled intervals against SANAS/NIST traceable standards. Any instrument failing tolerance inspection is quarantined immediately, and retrospective impact analysis is completed for all batches inspected with that instrument since the last valid verification.`,
  },
  {
    title: 'Incident Investigation & Root Cause Prevention Policy',
    category: 'Safety',
    status: 'Active',
    docSuffix: 'POL-015',
    content: (name) =>
      `${name} maintains a transparent, blameless reporting culture for all near-misses, non-conformances, and safety incidents under ISO 45001. Investigations must begin within 24 hours of occurrence, applying structured 5-Why and Fishbone methods to diagnose systemic causes, followed by foolproof Corrective and Preventative Actions (CAPA) with 60-day effectiveness reviews.`,
  },
  {
    title: 'Environmental Sustainable Packaging & Plastics Policy',
    category: 'Environment',
    status: 'Active',
    docSuffix: 'POL-016',
    content: (name) =>
      `${name} actively designs and packages products to minimize post-consumer environmental impact. We commit to utilizing 100% recyclable, biodegradable, or reusable packaging materials across all dispatched shipments, eliminating single-use non-recyclable wraps, and partnering with verified recovery schemes to champion circular economy principles.`,
  },
  {
    title: 'Workplace Diversity, Equity & Inclusion Policy',
    category: 'Operations',
    status: 'Approved',
    docSuffix: 'POL-017',
    content: (name) =>
      `${name} believes that a diverse, equitable, and inclusive workforce sparks innovation and reinforces operational integrity in accordance with ISO 30415. We guarantee equal opportunity in hiring, development, and remuneration regardless of gender, race, religion, disability, or background, maintaining a zero-tolerance policy against discrimination or harassment.`,
  },
  {
    title: 'Artificial Intelligence & Automated Process Governance Policy',
    category: 'Information Security',
    status: 'Active',
    docSuffix: 'POL-018',
    content: (name) =>
      `${name} governs the adoption and deployment of artificial intelligence, machine learning algorithms, and automated industrial decision tools in line with ISO/IEC 42001. We ensure algorithmic transparency, human-in-the-loop oversight on quality validation gates, rigorous data provenance checks, and ethical risk audits for all smart industrial automation systems.`,
  },
];

/**
 * Generates the next distinct, non-duplicate policy for a company.
 * Compares against existing policy titles and categories so every auto-generation is fresh.
 */
export function generateNextAIPolicy(existingPolicies: PolicyItem[] = [], company: Company): PolicyItem {
  const companyName = company?.name || 'NK Quality Systems';
  const compPrefix = (companyName.split(' ').map((w) => w[0]).join('').slice(0, 3) || 'NK').toUpperCase();
  const existingTitles = new Set(existingPolicies.map((p) => p.title.toLowerCase().trim()));

  // 1. Search for first ungenerated template from catalog
  const ungenerated = POLICY_TEMPLATES.find((tpl) => !existingTitles.has(tpl.title.toLowerCase().trim()));

  if (ungenerated) {
    const timestamp = Date.now();
    return {
      id: `pol-ai-${timestamp}`,
      title: ungenerated.title,
      category: ungenerated.category,
      status: ungenerated.status,
      documentNumber: `${compPrefix}-${ungenerated.docSuffix}`,
      effectiveDate: '16-Sep-2026',
      reviewDate: '16-Sep-2027',
      content: ungenerated.content(companyName),
      dateCreated: '16 Sep 2026',
    };
  }

  // 2. If all 15 predefined templates are already added, create a dynamic customized variant
  const dynamicTopics = [
    { title: 'Subcontractor & Outbound Logistics Control Policy', category: 'Operations' },
    { title: 'Predictive Maintenance & Asset Reliability Policy', category: 'Quality' },
    { title: 'Water Conservation & Effluent Management Policy', category: 'Environment' },
    { title: 'Hazardous Noise & Hearing Conservation Policy', category: 'Safety' },
    { title: 'Supplier Code of Conduct & ESG Standards Policy', category: 'Operations' },
    { title: 'Customer Property & Intellectual Assets Policy', category: 'Quality' },
  ];

  const nextIndex = existingPolicies.length + 1;
  const pickedTopic = dynamicTopics[(nextIndex - 1) % dynamicTopics.length];
  const dynamicTitle = `${pickedTopic.title} (Phase ${Math.floor(nextIndex / dynamicTopics.length) + 1})`;

  return {
    id: `pol-ai-${Date.now()}`,
    title: dynamicTitle,
    category: pickedTopic.category,
    status: 'Active',
    documentNumber: `${compPrefix}-POL-${String(nextIndex).padStart(3, '0')}`,
    effectiveDate: '16-Sep-2026',
    reviewDate: '16-Sep-2027',
    content: `Top Management of ${companyName} establishes this specialized policy framework under ${pickedTopic.category} governance to enforce rigorous compliance, verified process control checkpoints, and continual improvement across all operational workflows.`,
    dateCreated: '16 Sep 2026',
  };
}

/**
 * Returns a suggested policy to auto-fill into the "+ New Policy" modal.
 */
export function getSuggestedPolicy(existingPolicies: PolicyItem[] = [], company: Company): PolicyItem {
  return generateNextAIPolicy(existingPolicies, company);
}
