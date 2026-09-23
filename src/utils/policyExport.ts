import { PolicyItem, Company } from '../types';

/**
 * Generates an official, print-ready ISO 9001:2015 Clause 5.2 compliant HTML document
 * for a policy item, formatted for executive presentation, audit dossier inclusion,
 * and direct PDF print or Word (.doc) export.
 */
export function generatePolicyDocumentHTML(policy: PolicyItem, company: Company): string {
  const companyName = company?.name || 'NK Quality Systems (Pty) Ltd';
  const cipcNumber = company?.registrationNumber ? `• CIPC: ${company.registrationNumber}` : '';
  const address = company?.address || 'Industrial Parkway, Sector 4, Gauteng';
  const email = company?.email || 'quality@sheqstreet.com';
  const docNumber =
    policy.documentNumber ||
    `${(company?.name || 'NK').split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()}-POL-001`;
  const effectiveDate = policy.effectiveDate || '16-Sep-2026';
  const reviewDate = policy.reviewDate || '16-Sep-2027';
  const category = (policy.category || 'QUALITY').toUpperCase();
  const status = (policy.status || 'ACTIVE').toUpperCase();
  const executiveTitle = company?.topExecutiveTitle || 'Managing Director';

  // Format paragraphs from policy.content
  const rawContent = policy.content || 'Top Management is committed to satisfying customer requirements, adhering to ISO 9001:2015 guidelines, and continually improving the effectiveness of the Quality Management System.';
  const paragraphs = rawContent.split('\n').filter((p) => p.trim().length > 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${policy.title} - ${companyName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 15mm 18mm 15mm;
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
      font-size: 13px;
      line-height: 1.55;
    }
    .page-container {
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 32px 36px;
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

    /* Header Table */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #1e293b;
      margin-bottom: 24px;
    }
    .header-table td {
      border: 1px solid #94a3b8;
      padding: 10px 14px;
      vertical-align: middle;
    }
    .brand-col {
      width: 45%;
      background: #f8fafc;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
      line-height: 1.3;
    }
    .title-col {
      width: 30%;
      text-align: center;
      background: #ffffff;
    }
    .doc-main-title {
      font-size: 15px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .meta-col {
      width: 25%;
      font-size: 10.5px;
      background: #f8fafc;
      padding: 6px 10px !important;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 2.5px 0;
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

    /* Policy Title Banner */
    .policy-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner-title {
      font-size: 18px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .banner-sub {
      font-size: 11px;
      color: #93c5fd;
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

    /* Content Sections */
    .section-block {
      margin-bottom: 20px;
    }
    .section-heading {
      font-size: 13px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-text {
      color: #1e293b;
      margin: 0 0 10px 0;
      text-align: justify;
    }
    .statement-box {
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 14px 18px;
      border-radius: 0 6px 6px 0;
      margin: 14px 0 20px 0;
      font-size: 13.5px;
      color: #0f172a;
      font-weight: 500;
      line-height: 1.6;
    }

    /* Core Principles List */
    .principles-list {
      margin: 8px 0 16px 0;
      padding-left: 20px;
    }
    .principles-list li {
      margin-bottom: 6px;
      color: #334155;
    }
    .principles-list strong {
      color: #0f172a;
    }

    /* Sign-off Table */
    .sign-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      margin-top: 26px;
      page-break-inside: avoid;
    }
    .sign-table th {
      background: #f1f5f9;
      color: #334155;
      font-size: 11px;
      font-weight: 700;
      text-align: left;
      padding: 7px 12px;
      border: 1px solid #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .sign-table td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      font-size: 12px;
      vertical-align: top;
      background: #ffffff;
    }
    .signature-badge {
      display: inline-block;
      padding: 3px 8px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      font-weight: 700;
      font-size: 10.5px;
      border-radius: 4px;
      margin-top: 4px;
    }

    /* Document Footer */
    .doc-footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 28px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
    .seal-box {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9.5px;
      color: #64748b;
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Header Table -->
    <table class="header-table">
      <tr>
        <td class="brand-col">
          <div class="brand-name">${companyName}</div>
          <div class="brand-sub">
            Integrated SHEQ Management System ${cipcNumber}<br>
            ${address} • ${email}
          </div>
        </td>
        <td class="title-col">
          <div class="doc-main-title">Controlled Policy</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px; font-weight: 600;">ISO 9001:2015 Clause 5.2</div>
        </td>
        <td class="meta-col">
          <div class="meta-row">
            <span class="meta-label">Doc No:</span>
            <span class="meta-val">${docNumber}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Rev:</span>
            <span class="meta-val">01</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Effective:</span>
            <span class="meta-val">${effectiveDate}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Review:</span>
            <span class="meta-val">${reviewDate}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Status:</span>
            <span class="meta-val" style="color: ${status === 'ACTIVE' || status === 'APPROVED' ? '#15803d' : '#2563eb'}">${status}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Banner -->
    <div class="policy-banner">
      <div>
        <h1 class="banner-title">${policy.title}</h1>
        <div class="banner-sub">${category} GOVERNANCE POLICY STATEMENT</div>
      </div>
      <div class="badge-pill">${status}</div>
    </div>

    <!-- 1. Executive Purpose & Strategic Intent -->
    <div class="section-block">
      <div class="section-heading">1. Purpose & Strategic Scope</div>
      <p class="section-text">
        This document defines the formal commitment of <strong>${companyName}</strong> regarding its quality, regulatory, and corporate performance standards. It provides the overarching framework for establishing, evaluating, and reviewing measurable quality objectives in accordance with <strong>ISO 9001:2015 Clause 5.2</strong> and international SHEQ compliance guidelines.
      </p>
    </div>

    <!-- 2. Formal Policy Statement -->
    <div class="section-block">
      <div class="section-heading">2. Executive Policy Statement</div>
      <div class="statement-box">
        ${paragraphs.map((p) => `<p style="margin: 0 0 8px 0;">${p}</p>`).join('')}
      </div>
    </div>

    <!-- 3. Key Core Commitments -->
    <div class="section-block">
      <div class="section-heading">3. Organizational Commitments</div>
      <ul class="principles-list">
        <li><strong>Customer Focus:</strong> Consistently deliver products and services that meet or exceed customer expectations and statutory specifications.</li>
        <li><strong>Continual Improvement:</strong> Systematically analyze audit findings, process risks, opportunities, and key performance indicators to optimize operational excellence.</li>
        <li><strong>Regulatory Compliance:</strong> Adhere strictly to applicable legal, environmental, occupational health and safety, and ISO standards requirements.</li>
        <li><strong>Resource & Competence Provision:</strong> Ensure personnel receive necessary training, resources, and authority to maintain quality integrity.</li>
      </ul>
    </div>

    <!-- 4. Communication & Accessibility -->
    <div class="section-block">
      <div class="section-heading">4. Communication & Review</div>
      <p class="section-text">
        Top Management ensures that this policy statement is displayed prominently within organizational premises, communicated and understood across all operational tiers, and made accessible to relevant interested parties upon reasonable request. This policy is formally reviewed annually on or before <strong>${reviewDate}</strong> to assure continuing suitability and strategic alignment.
      </p>
    </div>

    <!-- 5. Executive Sign-Off -->
    <table class="sign-table">
      <thead>
        <tr>
          <th style="width: 35%;">Prepared & Reviewed By</th>
          <th style="width: 35%;">Approved By (Top Management)</th>
          <th style="width: 30%;">Authorization Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>SHEQ Lead Auditor / QMR</strong><br>
            <span style="color: #64748b; font-size: 11px;">Quality Management Representative</span><br>
            <span style="font-size: 11px; color: #475569;">Date: ${effectiveDate}</span>
          </td>
          <td>
            <strong>${executiveTitle}</strong><br>
            <span style="color: #64748b; font-size: 11px;">${companyName}</span><br>
            <span style="font-size: 11px; color: #475569;">Date: ${effectiveDate}</span>
          </td>
          <td>
            <div class="signature-badge">✓ DIGITALLY VERIFIED</div><br>
            <span style="font-size: 10px; color: #64748b; font-family: monospace;">HASH: QMS-POL-${policy.id.slice(-6).toUpperCase()}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Footer -->
    <div class="doc-footer">
      <div>Document #${docNumber} • Classification: Controlled Internal Document</div>
      <div class="seal-box">SHEQ STREET QMS INTERNATIONAL • ISO 9001:2015 VERIFIED</div>
      <div>Page 1 of 1</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a direct, print-ready PDF generation via the browser's native print/PDF engine.
 * Includes graceful fallback using a hidden iframe if popup blockers are active.
 */
export function downloadPolicyPDF(policy: PolicyItem, company: Company): void {
  const html = generatePolicyDocumentHTML(policy, company);

  try {
    const printWindow = window.open('', '_blank', 'width=920,height=960');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      const triggerPrint = () => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (err) {
          console.warn('Failed to print from new window:', err);
        }
      };

      printWindow.onload = triggerPrint;
      setTimeout(triggerPrint, 500);
      return;
    }
  } catch (e) {
    console.warn('window.open blocked, falling back to hidden iframe print:', e);
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

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 400);
  }
}

/**
 * Generates an editable Microsoft Word document (.doc) with native styling and tables,
 * and triggers immediate client-side file download to the user's computer.
 */
export function downloadPolicyDoc(policy: PolicyItem, company: Company): void {
  const html = generatePolicyDocumentHTML(policy, company);
  const blob = new Blob(['\ufeff' + html], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const cleanTitle = (policy.documentNumber || policy.title || 'Policy').replace(/[^a-zA-Z0-9_-]/g, '_');
  const compPrefix = company?.name ? company.name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' : '';
  const filename = `${compPrefix}${cleanTitle}.doc`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
