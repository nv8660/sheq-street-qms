import { AuditProcessRow, AuditReportItem, NCRItem } from '../types';

/**
 * Calculates individual process row score (0-100).
 * Handles:
 * 1. Explicit totalScore e.g. "70%", 70
 * 2. ncrs and ofis deduction if recorded (100 - ncrs*10 - ofis*5)
 * 3. Schedule status in months (completed = 100, planned = 90, due = 70, overdue = 45)
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
          scoreSum += 90;
          break;
        case 'rescheduled':
          scoreSum += 80;
          break;
        case 'due':
          scoreSum += 70;
          break;
        case 'overdue':
          scoreSum += 45;
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
 * Calculates the Overall Audit Score (0 - 100%) across all process rows in the Audit Matrix.
 */
export function calculateOverallAuditScore(rows: AuditProcessRow[] = []): number {
  if (!rows || rows.length === 0) return 0;
  const sum = rows.reduce((acc, row) => acc + getAuditRowScore(row), 0);
  return Math.round(sum / rows.length);
}

/**
 * Calculates the live Audit Readiness percentage (0 - 100%).
 * Evaluates:
 * - Active audit process matrix rows and their score
 * - Execution of scheduled audit checkpoints (completed vs overdue vs planned)
 * - Internal audit reports performance
 * - Penalty for open non-conformances (NCRs)
 */
export function calculateAuditReadiness(
  rows: AuditProcessRow[] = [],
  ncrs: NCRItem[] = [],
  reports: AuditReportItem[] = []
): {
  readinessScore: number;
  overallAuditScore: number;
  headline: string;
  totalProcesses: number;
  completedAuditsCount: number;
  overdueAuditsCount: number;
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
    };
  }

  // 1. Process matrix contribution (50% weight)
  const matrixContrib = overallAuditScore * 0.5;

  // 2. Schedule completion contribution (25% weight)
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
  const scheduleRatio =
    totalSlots > 0
      ? (completedCount * 1.0 + plannedCount * 0.9 + overdueCount * 0.4) / totalSlots
      : 0.75;
  const scheduleContrib = scheduleRatio * 100 * 0.25;

  // 3. Reports contribution (25% weight)
  let reportAvg = 90;
  if (reports && reports.length > 0) {
    const sum = reports.reduce((acc, rep) => acc + (Number(rep.score) || 80), 0);
    reportAvg = sum / reports.length;
  }
  const reportsContrib = reportAvg * 0.25;

  // 4. Open NCR impact (deduct 2% per open NCR, max 10%)
  const openNCRs = ncrs ? ncrs.filter((n) => n.status !== 'CLOSED').length : 0;
  const ncrDeduction = Math.min(10, openNCRs * 2);

  // 5. Base process governance credit (scales with number of tracked processes)
  const baseProcessCredit = Math.min(12, rows.length * 1.5);

  let finalReadiness = Math.round(
    matrixContrib + scheduleContrib + reportsContrib + baseProcessCredit - ncrDeduction
  );
  finalReadiness = Math.max(0, Math.min(100, finalReadiness));

  let headline = 'Looking great! Nearly audit-ready.';
  if (finalReadiness >= 85) {
    headline = 'Looking great! Nearly audit-ready.';
  } else if (finalReadiness >= 75) {
    headline = 'Good progress — Audit readiness on track.';
  } else if (finalReadiness >= 50) {
    headline = 'Moderate readiness — Review open findings & schedule.';
  } else {
    headline = 'Action Required — Significant audit gaps identified.';
  }

  return {
    readinessScore: finalReadiness,
    overallAuditScore,
    headline,
    totalProcesses: rows.length,
    completedAuditsCount: completedCount,
    overdueAuditsCount: overdueCount,
  };
}
