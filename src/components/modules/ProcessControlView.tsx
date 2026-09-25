import React, { useState, useMemo, useEffect } from 'react';
import {
  Workflow, Plus, Check, X, Trash2, ClipboardList, Search
} from 'lucide-react';
import { ProcessControlItem, Company, ProcessFlowStep, QCPCheckpoint } from '../../types';

interface ProcessControlViewProps {
  company: Company;
  processes: ProcessControlItem[];
  onAddProcess: (proc: ProcessControlItem) => void;
  onUpdateProcess?: (proc: ProcessControlItem) => void;
  onDeleteProcess?: (id: string) => void;
}

const emptyProcForm = {
  name: '', documentNumber: '', isoClause: '8.5', processOwner: '',
  preparedBy: '', coreTeam: '', customer: '', revisionNumber: '0',
  effectiveDate: '', revisionDate: '', customerApprovalDate: '',
  status: 'Draft' as 'Draft' | 'Approved' | 'In Review', description: '',
  hasFlowchart: true, hasQCP: false,
};

export const ProcessControlView: React.FC<ProcessControlViewProps> = ({
  company,
  processes,
  onAddProcess,
  onUpdateProcess,
  onDeleteProcess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessControlItem | null>(null);
  const [formData, setFormData] = useState(emptyProcForm);

  // Flowchart & QCP inline inputs
  const [stepData, setStepData] = useState({ title: '', role: '', inputs: '', outputs: '' });
  const [qcpData, setQcpData] = useState({ param: '', spec: '', freq: '' });

  const compPrefix = company?.name ? company.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() : 'NK';

  // Esc closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setSelectedProcess(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const docNum = formData.documentNumber.trim() || `${compPrefix}-QCP-00${processes.length + 1}`;
    const newProc: ProcessControlItem = {
      id: `proc-${Date.now()}`,
      name: formData.name.trim(),
      code: docNum,
      documentNumber: docNum,
      isoClause: formData.isoClause.trim() || '8.5',
      processOwner: formData.processOwner.trim(),
      preparedBy: formData.preparedBy.trim(),
      coreTeam: formData.coreTeam.trim(),
      customer: formData.customer.trim(),
      revisionNumber: formData.revisionNumber.trim() || '0',
      effectiveDate: formData.effectiveDate.trim(),
      revisionDate: formData.revisionDate.trim(),
      customerApprovalDate: formData.customerApprovalDate.trim(),
      status: formData.status,
      description: formData.description.trim(),
      hasFlowchart: formData.hasFlowchart,
      hasQCP: formData.hasQCP,
      flowchartSteps: [
        { id: 'st-1', stepNumber: 1, title: 'Material Receipt & Verification', responsibleRole: formData.processOwner.trim() || 'Operator', inputs: 'Inbound consignment', outputs: 'Verified batch' },
        { id: 'st-2', stepNumber: 2, title: `${formData.name.trim()} Core Operation`, responsibleRole: formData.preparedBy.trim() || 'Lead Tech', inputs: 'Verified batch', outputs: 'Finished lot' },
        { id: 'st-3', stepNumber: 3, title: 'Final Quality Release', responsibleRole: 'QC Inspector', inputs: 'Finished lot', outputs: 'CoA & Released Product' },
      ],
      qcpCheckpoints: [
        { id: 'qcp-1', parameter: 'Operational Tolerances', specification: `Conforming to Clause ${formData.isoClause || '8.5'}`, frequency: 'Per Lot', acceptanceCriteria: 'QC Pass' },
      ],
    };

    onAddProcess(newProc);
    setFormData(emptyProcForm);
    setIsModalOpen(false);
  };

  const handleAddFlowStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess || !stepData.title.trim()) return;
    const existing = selectedProcess.flowchartSteps || [];
    const updated: ProcessControlItem = {
      ...selectedProcess,
      hasFlowchart: true,
      flowchartSteps: [
        ...existing,
        {
          id: `step-${Date.now()}`,
          stepNumber: existing.length + 1,
          title: stepData.title.trim(),
          responsibleRole: stepData.role.trim() || 'Operator',
          inputs: stepData.inputs.trim() || 'Feedstock',
          outputs: stepData.outputs.trim() || 'Output',
        },
      ],
    };
    setSelectedProcess(updated);
    onUpdateProcess?.(updated);
    setStepData({ title: '', role: '', inputs: '', outputs: '' });
  };

  const handleAddQcp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess || !qcpData.param.trim()) return;
    const existing = selectedProcess.qcpCheckpoints || [];
    const updated: ProcessControlItem = {
      ...selectedProcess,
      hasQCP: true,
      qcpCheckpoints: [
        ...existing,
        {
          id: `qcp-${Date.now()}`,
          parameter: qcpData.param.trim(),
          specification: qcpData.spec.trim() || 'Target ± 5%',
          frequency: qcpData.freq.trim() || 'Batch sample',
          acceptanceCriteria: 'Lab pass',
        },
      ],
    };
    setSelectedProcess(updated);
    onUpdateProcess?.(updated);
    setQcpData({ param: '', spec: '', freq: '' });
  };

  const filteredProcesses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return processes;
    return processes.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.processOwner && p.processOwner.toLowerCase().includes(q)) ||
        (p.isoClause && p.isoClause.toLowerCase().includes(q))
    );
  }, [processes, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="text-slate-800 font-bold">{company.name}</span>
            <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
              {company.plan || 'ACTIVE'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name} — Process Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">Process maps, flowchart steps and quality control plans (QCP).</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Process</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search process name, code, clause..."
          className="w-full pl-8.5 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Process Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProcesses.map((proc) => (
          <div
            key={proc.id}
            onClick={() => setSelectedProcess(proc)}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Workflow className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {proc.status}
                  </span>
                  {onDeleteProcess && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete process ${proc.name}?`)) onDeleteProcess(proc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded transition-opacity"
                      title="Delete Process"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {proc.documentNumber || proc.code}
                </span>
                {proc.isoClause && <span className="text-[11px] font-medium text-slate-400">Clause {proc.isoClause}</span>}
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">{proc.name}</h3>
              {proc.processOwner && (
                <p className="text-xs text-slate-500 mt-1">Owner: <span className="font-medium text-slate-700">{proc.processOwner}</span></p>
              )}
              {proc.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">{proc.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                <Check className="w-3 h-3 text-blue-600" /> Flowchart ({proc.flowchartSteps?.length || 0})
              </span>
              {proc.hasQCP ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                  <Check className="w-3 h-3 text-emerald-600" /> QCP Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">No QCP</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Process */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">New Process</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Process Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. In-house Recycling & Compounding"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Number</label>
                  <input
                    type="text"
                    placeholder="e.g. QCP-001"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISO Clause</label>
                  <input
                    type="text"
                    value={formData.isoClause}
                    onChange={(e) => setFormData({ ...formData, isoClause: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Process Owner</label>
                  <input
                    type="text"
                    placeholder="Job title or name"
                    value={formData.processOwner}
                    onChange={(e) => setFormData({ ...formData, processOwner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scope of process and key deliverables..."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer">
                  Save Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Flowchart & QCP Viewer */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedProcess(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {selectedProcess.documentNumber || selectedProcess.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">ISO {selectedProcess.isoClause || '8.5'}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">Rev {selectedProcess.revisionNumber || '0'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedProcess.name}</h3>
              </div>
              <button onClick={() => setSelectedProcess(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div><span className="text-slate-400 block">Owner</span><span className="font-semibold text-slate-800">{selectedProcess.processOwner || 'N/A'}</span></div>
              <div><span className="text-slate-400 block">Status</span><span className="font-semibold text-slate-800">{selectedProcess.status}</span></div>
              <div><span className="text-slate-400 block">Customer</span><span className="font-semibold text-slate-800">{selectedProcess.customer || 'Standard'}</span></div>
              <div><span className="text-slate-400 block">Effective</span><span className="font-semibold text-slate-800">{selectedProcess.effectiveDate || 'Pending'}</span></div>
            </div>

            {/* Flowchart Steps */}
            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-blue-600" />
                Flowchart Steps ({selectedProcess.flowchartSteps?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {(selectedProcess.flowchartSteps || []).map((step, idx) => (
                  <div key={step.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{step.responsibleRole}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-500">
                        <div><strong>In:</strong> {step.inputs}</div>
                        <div><strong>Out:</strong> {step.outputs}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step */}
              <form onSubmit={handleAddFlowStep} className="mt-2.5 p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Step Title *"
                    value={stepData.title}
                    onChange={(e) => setStepData({ ...stepData, title: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={stepData.role}
                    onChange={(e) => setStepData({ ...stepData, role: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Inputs"
                    value={stepData.inputs}
                    onChange={(e) => setStepData({ ...stepData, inputs: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Outputs"
                    value={stepData.outputs}
                    onChange={(e) => setStepData({ ...stepData, outputs: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold cursor-pointer">
                  + Add Step
                </button>
              </form>
            </div>

            {/* QCP Inspection Points */}
            <div className="border-t border-slate-100 pt-3">
              <h4 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                Quality Control Plan (QCP) Inspection Gates ({selectedProcess.qcpCheckpoints?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {(selectedProcess.qcpCheckpoints || []).map((qcp) => (
                  <div key={qcp.id} className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{qcp.parameter}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{qcp.specification} • {qcp.frequency}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                      {qcp.acceptanceCriteria}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add QCP */}
              <form onSubmit={handleAddQcp} className="mt-2.5 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Parameter *"
                    value={qcpData.param}
                    onChange={(e) => setQcpData({ ...qcpData, param: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Specification"
                    value={qcpData.spec}
                    onChange={(e) => setQcpData({ ...qcpData, spec: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={qcpData.freq}
                    onChange={(e) => setQcpData({ ...qcpData, freq: e.target.value })}
                    className="px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
                <button type="submit" className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold cursor-pointer">
                  + Add Inspection Gate
                </button>
              </form>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedProcess(null)} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
