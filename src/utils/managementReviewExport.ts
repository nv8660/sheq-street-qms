import { ReviewMeeting, Company } from '../types';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_OBJECTIVE =
  "The organisation's management review of the quality management system to ensure suitability, adequacy and effectiveness. The review is to include the assessment of opportunities for improvement and any potential changes to the quality management system, including quality policy, objectives & targets, and their alignment with business objectives and overall strategy.";

const DEFAULT_AGENDA =
  "1) Quality management system documents status.\n" +
  "2) Quality policy & objectives\n" +
  "3) External and internal issues\n" +
  "4) Risks and opportunities\n" +
  "5) Audit results:\n" +
  "   a) Internal audits\n" +
  "   b) External audits\n" +
  "6) Customer satisfaction & feedback\n" +
  "7) Supplier performance\n" +
  "8) Non-conformance & corrective actions (CAPA)\n" +
  "9) Changes that could affect the QMS\n" +
  "10) Resource adequacy & improvements";

/**
 * Generates an executive, print-ready HTML document for the Management Review Meeting.
 */
export function generateManagementReviewHTML(review: ReviewMeeting, company: Company): string {
  const companyName = company.name || 'nk';
  const cipcNumber = company.registrationNumber || '2024/991024/07';
  const docNumber = `${companyName.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')}-DC-014`;
  const objective = review.objective || DEFAULT_OBJECTIVE;
  const agenda = review.agenda || DEFAULT_AGENDA;
  const status = review.status || 'PLANNED';
  const isCompleted = status.toUpperCase() === 'COMPLETED';

  // Format agenda lines cleanly
  const agendaHtml = agenda
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<div style="height: 6px;"></div>';
      const isSubItem = line.startsWith('   ') || line.startsWith('\t') || line.startsWith('  ');
      return `<div style="margin-bottom: 4px; ${isSubItem ? 'padding-left: 20px; color: #334155;' : 'font-weight: 500; color: #0f172a;'}">${escapeHtml(trimmed)}</div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(review.title)} - Management Review</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }
    .page-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 10px;
    }

    /* Top Metadata Bar */
    .top-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
    }
    .top-meta-bar strong {
      color: #0f172a;
    }

    /* Dark Navy Header Banner matching user's UI */
    .banner {
      background-color: #122b4e !important;
      border-radius: 12px;
      padding: 24px 28px;
      color: #ffffff;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .banner-left {
      flex: 1;
    }
    .banner-category {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    .banner-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .banner-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
    }
    .banner-company {
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .banner-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      ${
        isCompleted
          ? 'border: 1px solid #10b981; color: #34d399;'
          : 'border: 1px solid #fbbf24; color: #fde047;'
      }
    }

    /* Two-Column Master Details Table */
    .details-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .details-table tr {
      border-bottom: 1px solid #e2e8f0;
    }
    .details-table tr:last-child {
      border-bottom: none;
    }
    .details-table th {
      width: 190px;
      background-color: #f8fafc !important;
      padding: 14px 18px;
      text-align: left;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      border-right: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .details-table td {
      padding: 14px 18px;
      font-size: 13px;
      color: #1e293b;
      vertical-align: top;
      line-height: 1.6;
    }

    /* Sign-off & Attendance Section */
    .signoff-card {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 18px 20px;
      background: #ffffff;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .signoff-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #1e3a8a;
      margin-bottom: 12px;
    }
    .signoff-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      font-size: 12px;
    }
    .signoff-box {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
    }
    .signoff-box-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .signoff-box-val {
      font-weight: 600;
      color: #0f172a;
    }

    /* Footer */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .page-container {
        padding: 0;
      }
      .banner {
        background-color: #122b4e !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .details-table th {
        background-color: #f8fafc !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Top Metadata Bar -->
    <div class="top-meta-bar">
      <div>
        <span>DOCUMENT REF: <strong>${escapeHtml(docNumber)}</strong></span>
        &nbsp;•&nbsp;
        <span>ISO STANDARD: <strong>ISO 9001:2015 Clause 9.3</strong></span>
      </div>
      <div>
        <span>ORGANISATION: <strong>${escapeHtml(companyName)}</strong> (Reg: ${escapeHtml(cipcNumber)})</span>
      </div>
    </div>

    <!-- Navy Header Banner -->
    <div class="banner">
      <div class="banner-left">
        <div class="banner-category">MANAGEMENT REVIEW</div>
        <h1 class="banner-title">${escapeHtml(review.title)}</h1>
      </div>
      <div class="banner-right">
        <div class="banner-company">${escapeHtml(companyName)}</div>
        <div class="banner-badge">${escapeHtml(status)}</div>
      </div>
    </div>

    <!-- Two-Column Master Details Table -->
    <table class="details-table">
      <tr>
        <th>Meeting</th>
        <td style="font-weight: 600; color: #0f172a;">${escapeHtml(review.title)}</td>
      </tr>
      <tr>
        <th>Apologies</th>
        <td>${escapeHtml(review.apologies || 'None')}</td>
      </tr>
      <tr>
        <th>Date</th>
        <td>${escapeHtml(review.dateStr)}</td>
      </tr>
      <tr>
        <th>Venue</th>
        <td>${escapeHtml(review.venue || 'rmz')}</td>
      </tr>
      <tr>
        <th>Meeting objective</th>
        <td>${escapeHtml(objective)}</td>
      </tr>
      <tr>
        <th>Meeting agenda</th>
        <td>${agendaHtml}</td>
      </tr>
    </table>

    <!-- Governance & Sign-off Section -->
    <div class="signoff-card">
      <div class="signoff-title">Governance, Verification & Sign-off</div>
      <div class="signoff-grid">
        <div class="signoff-box">
          <div class="signoff-box-label">Chaired By</div>
          <div class="signoff-box-val">${escapeHtml(review.chairedBy || review.organizer || 'Management Representative')}</div>
        </div>
        <div class="signoff-box">
          <div class="signoff-box-label">Review Date / Status</div>
          <div class="signoff-box-val">${escapeHtml(review.dateStr)} (${escapeHtml(status)})</div>
        </div>
        <div class="signoff-box">
          <div class="signoff-box-label">Executive Approval Signature</div>
          <div class="signoff-box-val" style="color: #2563eb; font-style: italic;">Verified & Recorded</div>
        </div>
      </div>
      ${
        review.membersInAttendance
          ? `<div style="margin-top: 12px; font-size: 11.5px; color: #475569;">
               <strong>Members in Attendance:</strong> ${escapeHtml(review.membersInAttendance)}
             </div>`
          : ''
      }
    </div>

    <!-- Footer -->
    <div class="doc-footer">
      <div>SHEQ Street QMS • ISO 9001:2015 Quality Management System Executive Records</div>
      <div>Confidential • Uncontrolled when printed or downloaded locally</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a direct, print-ready PDF download via the browser's native print-to-PDF engine.
 * Includes graceful fallback using a hidden iframe if popup blockers are active.
 */
export function downloadReviewPDF(review: ReviewMeeting, company: Company): void {
  const html = generateManagementReviewHTML(review, company);

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
      }, 2500);
    }, 450);
  }
}
