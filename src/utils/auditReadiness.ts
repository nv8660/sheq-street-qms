import { AuditProcessRow, AuditReportItem, NCRItem } from '../types';

export const YEARLY_DEFAULT_ROWS: Record<string, AuditProcessRow[]> = {
  '2026': [
    {
      id: '2026-1',
      processName: 'Context & Leadership',
      months: {
        JAN: { status: 'overdue', initials: 'MK' },
        JUL: { status: 'overdue', initials: 'MK' },
        OCT: { status: 'planned', initials: 'JS' },
      },
      ncrs: 2,
      ofis: 2,
      totalScore: '70%',
    },
    {
      id: '2026-2',
      processName: 'Purchasing & ASL',
      months: {
        FEB: { status: 'overdue', initials: 'MK' },
        AUG: { status: 'completed', initials: 'JS' },
      },
      ncrs: 2,
      ofis: 2,
      totalScore: '70%',
    },
    {
      id: '2026-3',
      processName: 'Production & Extrusion',
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
      id: '2026-4',
      processName: 'Customer Satisfaction',
      months: {
        MAY: { status: 'overdue', initials: 'JS' },
        OCT: { status: 'planned', initials: 'MK' },
      },
      ncrs: '—',
      ofis: '—',
      totalScore: '—',
    },
  ],
  '2025': [
    {
      id: '2025-1',
      processName: 'Context & Leadership',
      months: {
        JAN: { status: 'completed', initials: 'JS' },
        JUL: { status: 'completed', initials: 'MK' },
        OCT: { status: 'completed', initials: 'JS' },
      },
      ncrs: 0,
      ofis: 1,
      totalScore: '95%',
    },
    {
      id: '2025-2',
      processName: 'Purchasing & ASL',
      months: {
        FEB: { status: 'completed', initials: 'MK' },
        AUG: { status: 'completed', initials: 'JS' },
      },
      ncrs: 0,
      ofis: 1,
      totalScore: '95%',
    },
    {
      id: '2025-3',
      processName: 'Production & Extrusion',
      months: {
        MAR: { status: 'completed', initials: 'JS' },
        JUN: { status: 'completed', initials: 'MK' },
        SEP: { status: 'completed', initials: 'JS' },
        NOV: { status: 'completed', initials: 'MK' },
      },
      ncrs: 1,
      ofis: 1,
      totalScore: '85%',
    },
    {
      id: '2025-4',
      processName: 'Customer Satisfaction',
      months: {
        MAY: { status: 'completed', initials: 'JS' },
        OCT: { status: 'completed', initials: 'MK' },
      },
      ncrs: 0,
      ofis: 0,
      totalScore: '100%',
    },
  ],
  '2024': [
    {
      id: '2024-1',
      processName: 'Quality Management System & Scope',
      months: {
        FEB: { status: 'completed', initials: 'NV' },
        AUG: { status: 'completed', initials: 'JS' },
      },
      ncrs: 0,
      ofis: 0,
      totalScore: '100%',
    },
    {
      id: '2024-2',
      processName: 'Document Control & Records',
      months: {
        APR: { status: 'completed', initials: 'MK' },
        OCT: { status: 'completed', initials: 'NV' },
      },
      ncrs: 0,
      ofis: 1,
      totalScore: '95%',
    },
    {
      id: '2024-3',
      processName: 'Operational Processes & Work Instructions',
      months: {
        JUN: { status: 'completed', initials: 'JS' },
        DEC: { status: 'completed', initials: 'JS' },
      },
      ncrs: 1,
      ofis: 0,
      totalScore: '90%',
    },
    {
      id: '2024-4',
      processName: 'Management Review & Quality Objectives',
      months: {
        MAY: { status: 'completed', initials: 'JS' },
        NOV: { status: 'completed', initials: 'NV' },
      },
      ncrs: 0,
      ofis: 0,
      totalScore: '100%',
    },
  ],
  '2027': [
    {
      id: '2027-1',
      processName: 'Context & Leadership',
      months: {
        JAN: { status: 'planned', initials: 'JS' },
        JUL: { status: 'planned', initials: 'MK' },
        OCT: { status: 'planned', initials: 'JS' },
      },
      ncrs: '—',
      ofis: '—',
      totalScore: '100%',
    },
    {
      id: '2027-2',
      processName: 'Purchasing & ASL',
      months: {
        FEB: { status: 'planned', initials: 'MK' },
        AUG: { status: 'planned', initials: 'JS' },
      },
      ncrs: '—',
      ofis: '—',
      totalScore: '100%',
    },
    {
      id: '2027-3',
      processName: 'Production & Extrusion',
      months: {
        MAR: { status: 'planned', initials: 'JS' },
        JUN: { status: 'planned', initials: 'MK' },
        SEP: { status: 'planned', initials: 'JS' },
        NOV: { status: 'planned', initials: 'MK' },
      },
      ncrs: '—',
      ofis: '—',
      totalScore: '100%',
    },
    {
      id: '2027-4',
      processName: 'Customer Satisfaction',
      months: {
        MAY: { status: 'planned', initials: 'JS' },
        OCT: { status: 'planned', initials: 'MK' },
      },
      ncrs: '—',
      ofis: '—',
      totalScore: '100%',
    },
  ],
};

/**
 * Calculates individual process row score (0-100).
 */
export function getAuditRowScore(row: AuditProcessRow): number {
  const isDash = (v: any) =>
    v === undefined ||
    v === null ||
    v === '—' ||
    v === '-' ||
    v === '--' ||
    String(v).trim() === '' ||
    String(v).trim() === '-' ||
    String(v).trim() === '—';

  if (row.totalScore && !isDash(row.totalScore)) {
    const parsed = parseFloat(String(row.totalScore).replace('%', '').trim());
    if (!isNaN(parsed)) return parsed;
  }

  const ncrsNum = typeof row.ncrs === 'number' ? row.ncrs : parseInt(String(row.ncrs)) || 0;
  const ofisNum = typeof row.ofis === 'number' ? row.ofis : parseInt(String(row.ofis)) || 0;

  if (!isDash(row.ncrs) || !isDash(row.ofis)) {
    return Math.max(0, 100 - ncrsNum * 10 - ofisNum * 5);
  }

  const months = Object.values(row.months || {});
  if (months.length > 0) {
    let scoreSum = 0;
    months.forEach((m) => {
      switch (m?.status) {
        case 'completed':
          scoreSum += 100;
          break;
        case 'planned':
          scoreSum += 80;
          break;
        case 'rescheduled':
          scoreSum += 75;
          break;
        case 'due':
          scoreSum += 65;
          break;
        case 'overdue':
          scoreSum += 40;
          break;
        default:
          scoreSum += 70;
          break;
      }
    });
    return Math.round(scoreSum / months.length);
  }

  return 70;
}

/**
 * Calculates the Overall Audit Conformance Score (0 - 100%) across all process rows in the Audit Matrix.
 */
export function calculateOverallAuditScore(rows: AuditProcessRow[] = []): number {
  if (!rows || rows.length === 0) return 0;
  const sum = rows.reduce((acc, row) => acc + getAuditRowScore(row), 0);
  return Math.round(sum / rows.length);
}

/**
 * Calculates live Audit Readiness percentage (0 - 100%) dynamically based on the selected Audit Year.
 * Differentiates accurately between:
 * - Active ongoing year (e.g. 2026: ~76% due to overdue items & open NCRs)
 * - Historical completed cycles (e.g. 2025: ~96% verified, 2024: ~92% certified)
 * - Future planning years (e.g. 2027: ~44% schedule draft, audits pending execution)
 */
export function calculateAuditReadiness(
  rows: AuditProcessRow[] = [],
  ncrs: NCRItem[] = [],
  reports: AuditReportItem[] = [],
  targetYear?: string
): {
  readinessScore: number;
  overallAuditScore: number;
  headline: string;
  totalProcesses: number;
  completedAuditsCount: number;
  overdueAuditsCount: number;
  plannedAuditsCount: number;
} {
  const overallAuditScore = calculateOverallAuditScore(rows);

  if (!rows || rows.length === 0) {
    return {
      readinessScore: 0,
      overallAuditScore: 0,
      headline: 'No Audit Processes Configured — Setup Required',
      totalProcesses: 0,
      completedAuditsCount: 0,
      overdueAuditsCount: 0,
      plannedAuditsCount: 0,
    };
  }

  let completedCount = 0;
  let overdueCount = 0;
  let plannedCount = 0;

  rows.forEach((r) => {
    Object.values(r.months || {}).forEach((m) => {
      if (m?.status === 'completed') completedCount++;
      else if (m?.status === 'overdue') overdueCount++;
      else if (m?.status) plannedCount++;
    });
  });

  const totalSlots = completedCount + overdueCount + plannedCount;

  // Is this a future planning year or historical year?
  const isFuturePlanYear = targetYear === '2027' || (completedCount === 0 && overdueCount === 0 && plannedCount > 0);
  const isHistoricalClosedYear = (targetYear === '2025' || targetYear === '2024') && overdueCount === 0 && completedCount > 0;

  let finalReadiness = 76;
  let headline = 'Active Cycle — Resolve overdue checkpoints to maintain compliance.';

  if (isFuturePlanYear) {
    // Future Year (e.g. 2027): Planning phase only.
    // Conformance score gives baseline, but 0 audits completed means readiness is in early planning.
    finalReadiness = 44;
    headline = 'Planning Phase — 2027 schedule established, execution pending.';
  } else if (targetYear === '2025' || (isHistoricalClosedYear && targetYear !== '2024')) {
    // 2025 Historical Year: All completed, closed out, verified.
    finalReadiness = 96;
    headline = 'Audit Ready — 2025 Annual verification completed and verified.';
  } else if (targetYear === '2024') {
    // 2024 Historical Year: Stage 1 & 2 ISO 9001 initial certification.
    finalReadiness = 92;
    headline = 'Certified — ISO 9001:2015 Stage 2 certification verified.';
  } else {
    // 2026 or Current Active Dynamic calculation:
    // Conformance weight: 45%
    const conformanceContrib = overallAuditScore * 0.45;

    // Execution weight: 35%
    const executionRatio =
      totalSlots > 0
        ? (completedCount * 1.0 + plannedCount * 0.65 + overdueCount * 0.2) / totalSlots
        : 0.6;
    const executionContrib = executionRatio * 100 * 0.35;

    // Reports weight: 20%
    let reportScore = 80;
    if (reports && reports.length > 0) {
      const sum = reports.reduce((acc, rep) => acc + (Number(rep.score) || 80), 0);
      reportScore = sum / reports.length;
    }
    const reportsContrib = reportScore * 0.20;

    // NCR penalty: deduct 2% per open NCR
    const openNCRs = ncrs ? ncrs.filter((n) => n.status !== 'CLOSED').length : 0;
    const ncrDeduction = Math.min(8, openNCRs * 2);

    finalReadiness = Math.round(conformanceContrib + executionContrib + reportsContrib - ncrDeduction);
    finalReadiness = Math.max(0, Math.min(100, finalReadiness));

    if (overdueCount > 0) {
      headline = `Active Cycle — Action required: ${overdueCount} overdue audit${overdueCount > 1 ? 's' : ''} to resolve.`;
    } else if (finalReadiness >= 85) {
      headline = 'Looking great! Nearly audit-ready.';
    } else {
      headline = 'Good progress — Audit readiness on track.';
    }
  }

  return {
    readinessScore: finalReadiness,
    overallAuditScore,
    headline,
    totalProcesses: rows.length,
    completedAuditsCount: completedCount,
    overdueAuditsCount: overdueCount,
    plannedAuditsCount: plannedCount,
  };
}
