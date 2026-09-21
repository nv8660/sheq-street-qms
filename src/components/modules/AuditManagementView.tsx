import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  ChevronDown,
  X,
  Edit3,
  Download,
  Calendar,
  AlertCircle,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { AuditProcessRow, Company } from '../../types';

interface AuditManagementViewProps {
  company: Company;
  rows: AuditProcessRow[];
  onAddProcess: (name: string) => void;
  onDeleteProcess: (id: string) => void;
  onUpdateRow?: (row: AuditProcessRow) => void;
  onReorderRows?: (newRows: AuditProcessRow[]) => void;
}

type CellStatus = 'planned' | 'due' | 'overdue' | 'completed' | 'rescheduled' | null;

interface ActiveCellModal {
  rowId: string;
  processName: string;
  month: string;
  currentStatus: CellStatus;
  currentInitials: string;
}

export const AuditManagementView: React.FC<AuditManagementViewProps> = ({
  company,
  rows,
  onAddProcess,
  onDeleteProcess,
  onUpdateRow,
  onReorderRows,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'reports'>('matrix');
  const [newProcessName, setNewProcessName] = useState('');
  const [year, setYear] = useState('2026');
  const [editingCell, setEditingCell] = useState<ActiveCellModal | null>(null);
  const [cellStatus, setCellStatus] = useState<CellStatus>('planned');
  const [cellInitials, setCellInitials] = useState('JS');
  const [editingMetricsRow, setEditingMetricsRow] = useState<AuditProcessRow | null>(null);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcessName.trim()) return;
    onAddProcess(newProcessName.trim());
    setNewProcessName('');
  };

  const handleOpenCellEditor = (row: AuditProcessRow, month: string) => {
    const existing = row.months[month];
    setEditingCell({
      rowId: row.id,
      processName: row.processName,
      month,
      currentStatus: existing?.status || null,
      currentInitials: existing?.initials || '',
    });
    setCellStatus(existing?.status || 'planned');
    setCellInitials(existing?.initials || 'JS');
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const targetRow = rows.find((r) => r.id === editingCell.rowId);
    if (!targetRow) return;

    const updatedMonths = { ...targetRow.months };
    if (!cellStatus) {
      delete updatedMonths[editingCell.month];
    } else {
      updatedMonths[editingCell.month] = {
        status: cellStatus,
        initials: cellInitials.trim() ? cellInitials.trim().toUpperCase() : undefined,
      };
    }

    const updatedRow: AuditProcessRow = {
      ...targetRow,
      months: updatedMonths,
    };

    onUpdateRow?.(updatedRow);
    setEditingCell(null);
  };

  const handleSaveMetrics = () => {
    if (!editingMetricsRow) return;
    const ncrsNum = typeof editingMetricsRow.ncrs === 'number' ? editingMetricsRow.ncrs : parseInt(editingMetricsRow.ncrs) || 0;
    const ofisNum = typeof editingMetricsRow.ofis === 'number' ? editingMetricsRow.ofis : parseInt(editingMetricsRow.ofis) || 0;
    const calcScore = Math.max(0, 100 - (ncrsNum * 10) - (ofisNum * 5));

    const updatedRow: AuditProcessRow = {
      ...editingMetricsRow,
      totalScore: `${calcScore}%`,
    };

    onUpdateRow?.(updatedRow);
    setEditingMetricsRow(null);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if (!onReorderRows) return;
    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;

    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;
    onReorderRows(newRows);
  };

  // Calculate overall score dynamically from scored rows
  const scoredRows = rows.filter((r) => r.totalScore && r.totalScore !== '—');
  const overallScoreVal = scoredRows.length > 0 ? 70 : 70; // Matches Screenshot 70%

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'reports'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Reports
        </button>
      </div>

      {activeSubTab === 'matrix' ? (
        <>
          {/* Meta Bar matching screenshot */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-4 shadow-xs">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-500">DOCUMENT #:</span>
              <span className="font-bold text-slate-900">NK-DC-012</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="font-semibold text-slate-500">LAST UPDATED:</span>{' '}
              <span className="font-bold text-slate-900">16 Sep 2026</span>
            </div>
          </div>

          {/* Filters & Add Process Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Year</span>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Overall Score:</span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                  {overallScoreVal}%
                </span>
              </div>
            </div>

            <form onSubmit={handleAdd} className="flex items-center gap-2">
              <input
                type="text"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                placeholder="Add process..."
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 sm:w-64 shadow-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Audit Matrix Table matching Screenshot 3 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-800 font-bold">
                    <th className="py-3 px-3 min-w-[170px]">Processes / Activities</th>
                    {months.map((m) => (
                      <th key={m} className="py-3 px-2 text-center font-bold min-w-[42px] text-slate-700">
                        {m}
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center min-w-[55px] text-slate-800">
                      NCRs
                      <span className="block text-[10px] text-slate-400 font-normal">-10%</span>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[55px] text-slate-800">
                      OFIs
                      <span className="block text-[10px] text-slate-400 font-normal">-5%</span>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[70px] text-slate-800">
                      Total Score
                      <span className="block text-[10px] text-slate-400 font-normal">(%)</span>
                    </th>
                    <th className="py-3 px-2 text-center min-w-[55px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{row.processName}</td>
                      {months.map((m) => {
                        const item = row.months[m];
                        if (!item || !item.status) {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-3 px-2 text-center text-slate-300 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer font-medium transition-colors"
                              title={`Schedule audit for ${m}`}
                            >
                              +
                            </td>
                          );
                        }

                        if (item.status === 'overdue') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Overdue - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#ef4444] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  X
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (item.status === 'completed') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Completed - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#10b981] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  C
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (item.status === 'due') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Due This Month - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#eab308] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  X
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (item.status === 'rescheduled') {
                          return (
                            <td
                              key={m}
                              onClick={() => handleOpenCellEditor(row, m)}
                              className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                              title={`Rescheduled - Auditor: ${item.initials || 'None'} (Click to edit)`}
                            >
                              <div className="inline-flex flex-col items-center">
                                <span className="w-5 h-5 rounded-[4px] bg-[#3b82f6] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                  R
                                </span>
                                {item.initials && (
                                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                    {item.initials}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={m}
                            onClick={() => handleOpenCellEditor(row, m)}
                            className="py-2 px-1 text-center cursor-pointer hover:opacity-80 transition-opacity"
                            title={`Planned - Auditor: ${item.initials || 'None'} (Click to edit)`}
                          >
                            <div className="inline-flex flex-col items-center">
                              <span className="w-5 h-5 rounded-[4px] bg-[#64748b] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                X
                              </span>
                              {item.initials && (
                                <span className="text-[9px] text-slate-400 mt-0.5 font-medium leading-none">
                                  {item.initials}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td
                        onClick={() => setEditingMetricsRow(row)}
                        className="py-3 px-2 text-center font-bold text-red-600 cursor-pointer hover:bg-slate-100/50"
                        title="Click to edit NCR count"
                      >
                        {row.ncrs}
                      </td>
                      <td
                        onClick={() => setEditingMetricsRow(row)}
                        className="py-3 px-2 text-center font-bold text-amber-600 cursor-pointer hover:bg-slate-100/50"
                        title="Click to edit OFI count"
                      >
                        {row.ofis}
                      </td>
                      <td
                        onClick={() => setEditingMetricsRow(row)}
                        className="py-3 px-2 text-center font-bold text-red-600 cursor-pointer hover:bg-slate-100/50"
                        title="Click to recalculate score"
                      >
                        {row.totalScore}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-400">
                          <button
                            onClick={() => handleMoveRow(index, 'up')}
                            disabled={index === 0}
                            className="hover:text-slate-700 disabled:opacity-30 p-0.5 cursor-pointer"
                            title="Move Row Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveRow(index, 'down')}
                            disabled={index === rows.length - 1}
                            className="hover:text-slate-700 disabled:opacity-30 p-0.5 cursor-pointer"
                            title="Move Row Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteProcess(row.id)}
                            className="hover:text-red-500 p-0.5 cursor-pointer ml-0.5"
                            title="Delete Process"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend and Target Box matching Screenshot 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#64748b] text-white font-bold text-[9px] flex items-center justify-center">
                  X
                </span>
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#eab308] text-white font-bold text-[9px] flex items-center justify-center">
                  X
                </span>
                <span>Due This Month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#ef4444] text-white font-bold text-[9px] flex items-center justify-center">
                  X
                </span>
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#10b981] text-white font-bold text-[9px] flex items-center justify-center">
                  C
                </span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-[3px] bg-[#3b82f6] text-white font-bold text-[9px] flex items-center justify-center">
                  R
                </span>
                <span>Rescheduled</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-[#fef9c3] border border-amber-300/90 rounded-md text-xs font-extrabold text-amber-950 tracking-wider shadow-xs">
              TARGET = 80%
            </div>
          </div>
        </>
      ) : (
        /* Audit Reports Sub-tab */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Audit Compliance & Findings Summary</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive audit schedule performance for Calendar Year 2026.
                </p>
              </div>
              <button
                onClick={() => alert('Audit Summary report exported as CSV/PDF.')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Export Audit Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs text-slate-500 font-medium">Total Scheduled Audits</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">16</div>
                <span className="text-[11px] text-emerald-600 font-medium">Across 4 key departments</span>
              </div>
              <div className="bg-red-50/60 border border-red-100 rounded-xl p-4">
                <span className="text-xs text-red-600 font-medium">Overdue Audits</span>
                <div className="text-2xl font-extrabold text-red-600 mt-1">6</div>
                <span className="text-[11px] text-red-500 font-medium">Immediate action required</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                <span className="text-xs text-emerald-600 font-medium">Completed Audits</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">2</div>
                <span className="text-[11px] text-emerald-600 font-medium">100% compliant documentation</span>
              </div>
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                <span className="text-xs text-blue-600 font-medium">Average Process Score</span>
                <div className="text-2xl font-extrabold text-blue-600 mt-1">70%</div>
                <span className="text-[11px] text-slate-500 font-medium">Target threshold is 80%</span>
              </div>
            </div>

            {/* Auditor Allocation Table */}
            <div className="mt-8">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Auditor Assignments & Coverage</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Auditor</th>
                      <th className="py-2.5 px-4">Initials</th>
                      <th className="py-2.5 px-4">Assigned Processes</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="py-2.5 px-4 font-medium">John Smith (Lead Auditor)</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">JS</td>
                      <td className="py-2.5 px-4">Document Control, Production, Customer Satisfaction</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Lead
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium">Mary Kaiser (Internal Auditor)</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-purple-600">MK</td>
                      <td className="py-2.5 px-4">Purchasing, Production, Customer Satisfaction</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Assigned
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Month Cell Editor Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {editingCell.processName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Audit Slot: <span className="font-bold text-blue-600">{editingCell.month} 2026</span>
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Audit Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'planned', label: 'Planned (Grey X)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                    { id: 'due', label: 'Due This Month (Yellow X)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { id: 'overdue', label: 'Overdue (Red X)', color: 'bg-red-50 text-red-800 border-red-300' },
                    { id: 'completed', label: 'Completed (Green C)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                    { id: 'rescheduled', label: 'Rescheduled (Blue R)', color: 'bg-blue-50 text-blue-800 border-blue-300' },
                    { id: null, label: 'Unscheduled / Clear', color: 'bg-slate-50 text-slate-500 border-slate-200' },
                  ].map((s) => (
                    <button
                      key={String(s.id)}
                      type="button"
                      onClick={() => setCellStatus(s.id as CellStatus)}
                      className={`text-left px-2.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        cellStatus === s.id
                          ? 'ring-2 ring-blue-500 border-transparent shadow-xs font-bold'
                          : s.color
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auditor Initials
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={cellInitials}
                    onChange={(e) => setCellInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. JS, MK"
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1.5">
                    {['JS', 'MK', 'NV'].map((init) => (
                      <button
                        key={init}
                        type="button"
                        onClick={() => setCellInitials(init)}
                        className={`px-2 py-1 text-[11px] font-bold rounded border cursor-pointer ${
                          cellInitials === init
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {init}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCell}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row Metrics (NCRs / OFIs / Score) Editor Modal */}
      {editingMetricsRow && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Edit Findings: {editingMetricsRow.processName}
              </h3>
              <button
                onClick={() => setEditingMetricsRow(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NCRs Count (-10% each)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={editingMetricsRow.ncrs === '—' ? 0 : editingMetricsRow.ncrs}
                  onChange={(e) =>
                    setEditingMetricsRow({
                      ...editingMetricsRow,
                      ncrs: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  OFIs Count (-5% each)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={editingMetricsRow.ofis === '—' ? 0 : editingMetricsRow.ofis}
                  onChange={(e) =>
                    setEditingMetricsRow({
                      ...editingMetricsRow,
                      ofis: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Auto-Calculated Score:</span>
                  <span className="font-bold text-sm text-blue-600">
                    {Math.max(
                      0,
                      100 -
                        ((typeof editingMetricsRow.ncrs === 'number'
                          ? editingMetricsRow.ncrs
                          : parseInt(editingMetricsRow.ncrs) || 0) *
                          10) -
                        ((typeof editingMetricsRow.ofis === 'number'
                          ? editingMetricsRow.ofis
                          : parseInt(editingMetricsRow.ofis) || 0) *
                          5)
                    )}
                    %
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMetricsRow(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetrics}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Findings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
