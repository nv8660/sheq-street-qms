import { Company } from '../types';

export interface ExportableDocument {
  id: string;
  docNumber: string;
  title: string;
  category?: string;
  revision: string;
  status: string;
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

/**
 * Generates rich default content for ISO 9001:2015 controlled documents when custom content is not supplied.
 */
function getDocumentDefaultBody(doc: ExportableDocument, companyName: string): string {
  const category = (doc.category || 'Standard Operating Procedure').toUpperCase();

  if (category.includes('QUALITY MANUAL') || doc.docNumber.includes('QM')) {
    return `
1. PURPOSE & SCOPE
This Quality Manual establishes the Quality Management System (QMS) of ${companyName} in full compliance with ISO 9001:2015 requirements (${doc.clause}). It covers all operations, personnel, and service delivery across all registered operational sites.

2. NORMATIVE REFERENCES
- ISO 9001:2015: Quality management systems — Requirements
- ISO 9000:2015: Quality management systems — Fundamentals and vocabulary
- Applicable statutory, regulatory, and customer contractual requirements.

3. CONTEXT OF THE ORGANIZATION
3.1 Understanding the organization and its context (Clause 4.1): Internal and external issues affecting the strategic direction are determined and monitored through the Risk and Opportunity Register.
3.2 Interested Parties (Clause 4.2): Requirements of customers, statutory bodies, shareholders, and suppliers are monitored regularly.
3.3 Scope of the QMS (Clause 4.3): Covers design, procurement, inspection, storage, delivery, and customer service.

4. LEADERSHIP & COMMITMENT (Clause 5)
Top Management demonstrates active leadership by establishing the Quality Policy, ensuring availability of resources, assigning authorities, and conducting annual Management Review meetings.

5. SUPPORT & DOCUMENTED INFORMATION (Clause 7.5)
All documents required by the QMS are controlled to ensure availability, suitability, adequate protection, and controlled distribution. Obsolete documents are removed from points of use.

6. OPERATION & PROCESS CONTROL (Clause 8)
Processes required for product and service provision are planned, implemented, and monitored against verified acceptance criteria.

7. PERFORMANCE EVALUATION & AUDIT (Clause 9)
Customer satisfaction, internal audits, process metrics, and supplier performance are evaluated at planned intervals to guarantee adherence.

8. CONTINUAL IMPROVEMENT (Clause 10)
Non-conformances are investigated via 8D Root Cause Analysis and recorded in the CAPA register to eliminate systemic recurrences.
`.trim();
  }

  if (category.includes('WORK INSTRUCTION') || doc.docNumber.includes('WI')) {
    return `
1. OBJECTIVE & SCOPE
This Work Instruction defines the step-by-step verification and execution standards for "${doc.title}" governed under ${doc.clause}.

2. HEALTH, SAFETY & PPE REQUIREMENTS
All technicians and operators must utilize designated PPE (Safety boots, eye protection, high-visibility vest) and adhere to plant safety guidelines before commencing work.

3. REQUIRED TOOLS, STANDARDS & EQUIPMENT
- Certified calibrated tools with active calibration labels
- Clean inspection bench with proper lighting (>500 lux)
- Reference specifications and drawings

4. STEP-BY-STEP OPERATING PROCEDURE
Step 1: Verify the equipment label, calibration expiry date, and zero-point datum.
Step 2: Inspect item visually for physical defects, contamination, or burrs.
Step 3: Perform verification measurements at 3 distinct points as per technical drawings.
Step 4: Record measured values in the designated Inspection Record Sheet.
Step 5: Compare readings against tolerance limits (+/- 0.05 mm or applicable tolerance).

5. ACCEPTANCE CRITERIA & NON-CONFORMANCE PROTOCOL
- Conforming Items: Apply green acceptance stamp/tag and transfer to approved buffer.
- Non-Conforming Items: Quarantine immediately in designated red bin and issue NCR within 2 hours.

6. RECORDS & RETENTION
Completed inspection records are preserved for a minimum of 5 years under Document Control archives.
`.trim();
  }

  if (category.includes('POLICY') || doc.docNumber.includes('POL')) {
    return `
1. POLICY STATEMENT
${companyName} is committed to delivering exceptional quality, operational safety, and customer satisfaction by upholding the highest international standards in compliance with ISO 9001:2015 (${doc.clause}).

2. MANAGEMENT COMMITMENT
Top Management ensures that:
- Customer and statutory requirements are understood and met consistently.
- Measurable quality objectives are established, monitored, and reviewed annually.
- Necessary resources, competent personnel, and modern infrastructure are provided.
- Risk-based thinking is integrated across all operational workflows.

3. COMMUNICATION & AWARENESS
This policy is displayed across all operating premises, communicated during onboarding, and published on internal portals for stakeholder access.

4. REVIEW & CONTINUAL IMPROVEMENT
This policy is reviewed annually during the Management Review Meeting to ensure ongoing suitability and alignment with strategic objectives.
`.trim();
  }

  if (category.includes('FORM') || doc.docNumber.includes('FRM')) {
    return `
1. FORM PURPOSE & USAGE
This standard form is utilized across ${companyName} to record verifiable operational evidence, inspections, and approvals under ${doc.clause}.

2. INSTRUCTIONS FOR COMPLETION
- Complete all mandatory header details (Date, Inspector / User, Item Number, Batch ID).
- Record exact quantitative values where applicable; avoid vague entries.
- Both technician and supervising authority must sign upon completion.
- Scanned copies must be archived into the digital Document Control register.

3. RETENTION SCHEDULE
Completed forms must be archived for a minimum duration of 3 to 7 years in accordance with regulatory and customer warranty requirements.
`.trim();
  }

  if (category.includes('REGISTER') || doc.docNumber.includes('REG')) {
    return `
1. REGISTER SCOPE & APPLICABILITY
This Master Register constitutes controlled documented information maintained pursuant to ISO 9001:2015 (${doc.clause}) for ${companyName}.

2. CUSTODIAN RESPONSIBILITY
Maintained by: ${doc.owner || 'SHEQ Lead'}. Any updates, additions, or revisions must be authorized and logged with revision number and date.

3. MONITORING & AUDIT VERIFICATION
The register is verified monthly and audited during scheduled internal quality audits. All active entries must reflect current operational reality.
`.trim();
  }

  // Default SOP / General Procedure
  return `
1. PURPOSE
The purpose of this procedure is to define requirements, process workflows, and control points for "${doc.title}" in accordance with ISO 9001:2015 (${doc.clause}).

2. SCOPE
Applies to all operations, facilities, and personnel of ${companyName}.

3. RESPONSIBILITIES
- Document Custodian (${doc.owner}): Responsible for maintenance and periodic review.
- Quality Lead / QA: Responsible for verification and compliance audits.
- Department Heads: Responsible for ensuring adherence by all departmental staff.

4. PROCEDURE DETAILS
4.1 Planning & Initiation: All activities must be planned with appropriate risk evaluations.
4.2 Execution: Work must follow approved technical standards, checklists, and safe working protocols.
4.3 Verification & Quality Control: Independent verification must be completed prior to release.
4.4 Records: Documented evidence must be retained in accordance with Clause 7.5.

5. ASSOCIATED DOCUMENTS & RECORDS
- Document Master Register
- Non-Conformance & CAPA Logs
- Relevant Inspection Checklists & Forms
`.trim();
}

/**
 * Converts markdown text or plain text into clean, structured HTML for document rendering.
 */
function formatContentToHtml(content: string): string {
  const lines = content.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Markdown Headers
    if (line.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2 class="doc-h1">${escapeHtml(line.slice(2))}</h2>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3 class="doc-h2">${escapeHtml(line.slice(3))}</h3>`);
    } else if (line.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h4 class="doc-h3">${escapeHtml(line.slice(4))}</h4>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul class="doc-list">');
        inList = true;
      }
      htmlParts.push(`<li>${formatInlineMarkdown(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      const match = line.match(/^(\d+\.?\d*)\s+(.*)$/);
      if (match) {
        htmlParts.push(`<div class="doc-numbered"><span class="doc-num-prefix">${escapeHtml(match[1])}</span><span>${formatInlineMarkdown(match[2])}</span></div>`);
      } else {
        htmlParts.push(`<p class="doc-p">${formatInlineMarkdown(line)}</p>`);
      }
    } else {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<p class="doc-p">${formatInlineMarkdown(line)}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}

function formatInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="doc-code">$1</code>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an official, print-ready ISO 9001:2015 Controlled Document HTML
 */
export function generateControlledDocumentHTML(doc: ExportableDocument, company: Company): string {
  const companyName = company?.name || 'NK Quality Systems (Pty) Ltd';
  const cipcNumber = company?.registrationNumber ? `CIPC Reg: ${company.registrationNumber}` : 'ISO 9001:2015 Registered';
  const address = company?.address || 'Industrial Parkway, Sector 4, Gauteng';
  const email = company?.email || 'quality@sheqstreet.com';

  const docCategory = (doc.category || 'Standard Operating Procedure').toUpperCase();
  const effectiveDate = doc.revisionDate || doc.approvedDate || '16-Sep-2026';
  const nextReview = doc.nextReview || '16-Sep-2027';
  const custodian = doc.author || doc.owner || 'Quality Assurance Lead';
  const approver = doc.approver || 'Managing Director / Lead Auditor';
  const status = (doc.status || 'APPROVED').toUpperCase();

  const bodyContent = doc.content && doc.content.trim().length > 20
    ? doc.content
    : getDocumentDefaultBody(doc, companyName);

  const formattedBodyHtml = formatContentToHtml(bodyContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(doc.docNumber)} - ${escapeHtml(doc.title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 18mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 12.5px;
      line-height: 1.55;
    }
    .page-container {
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 30px 34px;
      background: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .page-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Controlled Header Box */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #16325c;
      margin-bottom: 18px;
    }
    .header-table td {
      border: 1px solid #94a3b8;
      padding: 8px 12px;
      vertical-align: middle;
    }
    .brand-col {
      width: 42%;
      background: #f8fafc;
    }
    .brand-name {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.3;
    }
    .title-col {
      width: 32%;
      text-align: center;
      background: #ffffff;
    }
    .doc-main-category {
      font-size: 10px;
      font-weight: 700;
      color: #1e40af;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .doc-main-number {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      margin: 2px 0;
    }
    .meta-col {
      width: 26%;
      font-size: 10.5px;
      background: #f8fafc;
      padding: 6px 10px !important;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      border-bottom: 1px dashed #cbd5e1;
    }
    .meta-row:last-child {
      border-bottom: none;
    }
    .meta-label {
      font-weight: 600;
      color: #475569;
    }
    .meta-val {
      font-weight: 700;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    /* Title Banner */
    .title-banner {
      background: linear-gradient(135deg, #16325c 0%, #1e40af 100%);
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner-title {
      font-size: 16px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .banner-sub {
      font-size: 11px;
      color: #bfdbfe;
      margin-top: 2px;
    }
    .badge-pill {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Controlled Stamp Notice */
    .controlled-stamp {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f1f5f9;
      border-left: 4px solid #16325c;
      padding: 8px 12px;
      font-size: 10.5px;
      color: #334155;
      margin-bottom: 18px;
      border-radius: 0 4px 4px 0;
    }
    .stamp-badge {
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 0.05em;
    }
    .stamp-warning {
      color: #dc2626;
      font-weight: 600;
    }

    /* Metadata Summary Box */
    .metadata-box {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      font-size: 11.5px;
    }
    .metadata-box th {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      color: #475569;
      font-weight: 600;
      text-align: left;
      width: 25%;
    }
    .metadata-box td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      color: #0f172a;
      font-weight: 600;
    }

    /* Content Body Styles */
    .doc-body {
      color: #1e293b;
      margin-bottom: 28px;
    }
    .doc-h1 {
      font-size: 15px;
      font-weight: 800;
      color: #16325c;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin: 18px 0 10px 0;
    }
    .doc-h2 {
      font-size: 13.5px;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 3px;
      margin: 16px 0 8px 0;
    }
    .doc-h3 {
      font-size: 12.5px;
      font-weight: 700;
      color: #334155;
      margin: 12px 0 6px 0;
    }
    .doc-p {
      margin: 0 0 10px 0;
      text-align: justify;
      line-height: 1.6;
    }
    .doc-list {
      margin: 6px 0 12px 0;
      padding-left: 20px;
    }
    .doc-list li {
      margin-bottom: 4px;
      color: #334155;
    }
    .doc-numbered {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
      line-height: 1.55;
    }
    .doc-num-prefix {
      font-weight: 700;
      color: #1e3a8a;
      flex-shrink: 0;
    }
    .doc-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 11.5px;
      color: #0f172a;
    }

    /* Approval & Sign-off Table */
    .signoff-section {
      margin-top: 26px;
      page-break-inside: avoid;
    }
    .signoff-heading {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #16325c;
      margin-bottom: 8px;
    }
    .signoff-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #94a3b8;
      font-size: 11px;
    }
    .signoff-table th {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      font-weight: 700;
      color: #334155;
      text-align: left;
    }
    .signoff-table td {
      border: 1px solid #cbd5e1;
      padding: 10px 10px;
      vertical-align: top;
    }
    .sign-role {
      font-weight: 700;
      color: #0f172a;
    }
    .sign-name {
      color: #334155;
      margin-top: 2px;
    }
    .sign-status {
      display: inline-block;
      margin-top: 4px;
      font-weight: 700;
      color: #15803d;
      font-size: 10px;
      text-transform: uppercase;
    }

    /* Page Footer */
    .footer-bar {
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Header Table -->
    <table class="header-table">
      <tr>
        <td class="brand-col">
          <div class="brand-name">${escapeHtml(companyName)}</div>
          <div class="brand-sub">${escapeHtml(cipcNumber)} • ${escapeHtml(address)}</div>
          <div class="brand-sub">${escapeHtml(email)}</div>
        </td>
        <td class="title-col">
          <div class="doc-main-category">${escapeHtml(docCategory)}</div>
          <div class="doc-main-number">${escapeHtml(doc.docNumber)}</div>
          <div style="font-size: 10px; color: #64748b;">${escapeHtml(doc.clause)}</div>
        </td>
        <td class="meta-col">
          <div class="meta-row"><span class="meta-label">Revision:</span><span class="meta-val">${escapeHtml(doc.revision)}</span></div>
          <div class="meta-row"><span class="meta-label">Effective:</span><span class="meta-val">${escapeHtml(effectiveDate)}</span></div>
          <div class="meta-row"><span class="meta-label">Next Review:</span><span class="meta-val">${escapeHtml(nextReview)}</span></div>
          <div class="meta-row"><span class="meta-label">Status:</span><span class="meta-val" style="color: #166534;">${escapeHtml(status)}</span></div>
        </td>
      </tr>
    </table>

    <!-- Banner -->
    <div class="title-banner">
      <div>
        <h1 class="banner-title">${escapeHtml(doc.title)}</h1>
        <div class="banner-sub">SHEQ Street Quality Management System • ISO 9001:2015 Controlled Record</div>
      </div>
      <div class="badge-pill">${escapeHtml(status)}</div>
    </div>

    <!-- Controlled Notice -->
    <div class="controlled-stamp">
      <span class="stamp-badge">CONTROLLED DOCUMENT • MASTER REGISTER</span>
      <span class="stamp-warning">Notice: Uncontrolled when printed or extracted locally. Verify latest revision against QMS Master Register.</span>
    </div>

    <!-- Metadata Details -->
    <table class="metadata-box">
      <tr>
        <th>Document Number</th>
        <td>${escapeHtml(doc.docNumber)}</td>
        <th>ISO 9001:2015 Clause</th>
        <td>${escapeHtml(doc.clause)}</td>
      </tr>
      <tr>
        <th>Document Category</th>
        <td>${escapeHtml(docCategory)}</td>
        <th>Current Revision</th>
        <td>${escapeHtml(doc.revision)}</td>
      </tr>
      <tr>
        <th>Author / Custodian</th>
        <td>${escapeHtml(custodian)}</td>
        <th>Approving Authority</th>
        <td>${escapeHtml(approver)}</td>
      </tr>
    </table>

    <!-- Body Content -->
    <div class="doc-body">
      ${formattedBodyHtml}
    </div>

    <!-- Approval & Sign-Off -->
    <div class="signoff-section">
      <div class="signoff-heading">Controlled Sign-Off &amp; Approvals</div>
      <table class="signoff-table">
        <tr>
          <th style="width: 33.3%;">Prepared / Custodian</th>
          <th style="width: 33.3%;">Reviewed &amp; Verified</th>
          <th style="width: 33.3%;">Approved &amp; Authorized</th>
        </tr>
        <tr>
          <td>
            <div class="sign-role">Custodian / Author</div>
            <div class="sign-name">${escapeHtml(custodian)}</div>
            <div class="sign-status">✔ Verified &amp; Effective</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${escapeHtml(effectiveDate)}</div>
          </td>
          <td>
            <div class="sign-role">Quality Assurance</div>
            <div class="sign-name">Quality Assurance Department</div>
            <div class="sign-status">✔ Compliance Checked</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${escapeHtml(effectiveDate)}</div>
          </td>
          <td>
            <div class="sign-role">Top Management</div>
            <div class="sign-name">${escapeHtml(approver)}</div>
            <div class="sign-status">✔ Authorized Release</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${escapeHtml(effectiveDate)}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer Bar -->
    <div class="footer-bar">
      <span>SHEQ Street QMS • Document Control Register</span>
      <span>${escapeHtml(doc.docNumber)} | ${escapeHtml(doc.title)}</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a direct, print-ready PDF generation via the browser's native print/PDF engine.
 */
export function downloadControlledDocumentPDF(doc: ExportableDocument, company: Company): void {
  const html = generateControlledDocumentHTML(doc, company);

  try {
    const printWindow = window.open('', '_blank', 'width=940,height=980');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      const triggerPrint = () => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (err) {
          console.warn('Failed to trigger print from window:', err);
        }
      };

      printWindow.onload = triggerPrint;
      setTimeout(triggerPrint, 500);
      return;
    }
  } catch (e) {
    console.warn('window.open blocked, falling back to hidden iframe:', e);
  }

  // Fallback: Invisible iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2500);
    }, 450);
  }
}

/**
 * Generates an editable Microsoft Word document (.doc) with native styling and tables.
 */
export function downloadControlledDocumentDoc(doc: ExportableDocument, company: Company): void {
  const html = generateControlledDocumentHTML(doc, company);
  const blob = new Blob(['\ufeff' + html], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const cleanDocNum = (doc.docNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanTitle = (doc.title || 'Controlled_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanDocNum}_${cleanTitle}.doc`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads Markdown / Plain Text representation of the controlled document.
 */
export function downloadControlledDocumentText(doc: ExportableDocument, company: Company): void {
  const companyName = company?.name || 'NK Quality Systems';
  const effectiveDate = doc.revisionDate || doc.approvedDate || '16-Sep-2026';
  const custodian = doc.author || doc.owner || 'Quality Lead';

  const bodyContent = doc.content && doc.content.trim().length > 20
    ? doc.content
    : getDocumentDefaultBody(doc, companyName);

  const textOutput = `
# ${doc.docNumber}: ${doc.title}
============================================================
Company: ${companyName}
Category: ${doc.category || 'Standard Operating Procedure'}
Revision: ${doc.revision}
Status: ${doc.status}
ISO Clause: ${doc.clause}
Custodian: ${custodian}
Approver: ${doc.approver || 'Managing Director'}
Effective Date: ${effectiveDate}
Next Review: ${doc.nextReview || '16-Sep-2027'}
============================================================

${bodyContent}

============================================================
CONTROLLED COPY • SHEQ STREET QMS
Uncontrolled when printed or downloaded locally.
`.trim();

  const blob = new Blob([textOutput], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const cleanDocNum = (doc.docNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanTitle = (doc.title || 'Document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanDocNum}_${cleanTitle}.md`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the original uploaded file if available.
 */
export function downloadOriginalUploadedFile(doc: ExportableDocument): boolean {
  if (!doc.fileData || !doc.fileName) return false;

  const link = document.createElement('a');
  link.href = doc.fileData;
  link.download = doc.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

/**
 * Exports the entire Master Document Register as a structured CSV file.
 */
export function exportMasterDocumentRegisterCSV(documents: ExportableDocument[], company: Company): void {
  const headers = [
    'Document Number',
    'Title',
    'Category',
    'Revision',
    'ISO Clause',
    'Status',
    'Custodian',
    'Approver',
    'Approved Date',
    'Next Review Date',
  ];

  const rows = documents.map((d) => [
    `"${(d.docNumber || '').replace(/"/g, '""')}"`,
    `"${(d.title || '').replace(/"/g, '""')}"`,
    `"${(d.category || '').replace(/"/g, '""')}"`,
    `"${(d.revision || '').replace(/"/g, '""')}"`,
    `"${(d.clause || '').replace(/"/g, '""')}"`,
    `"${(d.status || '').replace(/"/g, '""')}"`,
    `"${(d.owner || d.author || '').replace(/"/g, '""')}"`,
    `"${(d.approver || '').replace(/"/g, '""')}"`,
    `"${(d.approvedDate || d.revisionDate || '').replace(/"/g, '""')}"`,
    `"${(d.nextReview || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const companyPrefix = (company?.name || 'Company').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${companyPrefix}_Document_Master_Register_ISO9001.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
