import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  FileText,
  Check,
  X,
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  ClipboardList,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ProcessControlItem, Company, ProcessFlowStep, QCPCheckpoint } from '../../types';

interface ProcessControlViewProps {
  company: Company;
  processes: ProcessControlItem[];
  onAddProcess: (proc: ProcessControlItem) => void;
  onUpdateProcess?: (proc: ProcessControlItem) => void;
  onDeleteProcess?: (id: string) => void;
}

export const ProcessControlView: React.FC<ProcessControlViewProps> = ({
  company,
  processes,
  onAddProcess,
  onUpdateProcess,
  onDeleteProcess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessControlItem | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Approved' | 'In Review'>('Draft');
  const [hasFlowchart, setHasFlowchart] = useState(true);
  const [hasQCP, setHasQCP] = useState(false);

  // New flowchart step form
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepRole, setNewStepRole] = useState('');
  const [newStepInputs, setNewStepInputs] = useState('');
  const [newStepOutputs, setNewStepOutputs] = useState('');

  // New QCP form
  const [qcpParam, setQcpParam] = useState('');
  const [qcpSpec, setQcpSpec] = useState('');
  const [qcpFreq, setQcpFreq] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newProc: ProcessControlItem = {
      id: `proc-${Date.now()}`,
      name: name.trim().toLowerCase(),
      code: code.trim() || '112',
      status: status,
      hasFlowchart: hasFlowchart,
      hasQCP: hasQCP,
      flowchartSteps: hasFlowchart
        ? [
            {
              id: 'st-1',
              stepNumber: 1,
              title: 'Receiving Inspection',
              responsibleRole: 'QC Inspector',
              inputs: 'Inbound consignment batch',
              outputs: 'Inspection report',
            },
            {
              id: 'st-2',
              stepNumber: 2,
              title: 'Processing Cycle',
              responsibleRole: 'Operator',
              inputs: 'Approved batch',
              outputs: 'Finished lot',
            },
          ]
        : [],
      qcpCheckpoints: hasQCP
        ? [
            {
              id: 'qcp-1',
              parameter: 'Dimensional Tolerance',
              specification: '± 0.2 mm',
              frequency: 'Hourly',
              acceptanceCriteria: 'Calibrated Vernier Pass',
            },
          ]
        : [],
    };
    onAddProcess(newProc);
    setName('');
    setCode('');
    setStatus('Draft');
    setIsModalOpen(false);
  };

  const handleAddFlowStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess || !newStepTitle.trim()) return;

    const existingSteps = selectedProcess.flowchartSteps || [];
    const newStep: ProcessFlowStep = {
      id: `step-${Date.now()}`,
      stepNumber: existingSteps.length + 1,
      title: newStepTitle.trim(),
      responsibleRole: newStepRole.trim() || 'Process Operator',
      inputs: newStepInputs.trim() || 'Material feed',
      outputs: newStepOutputs.trim() || 'Inspected output',
    };

    const updated: ProcessControlItem = {
      ...selectedProcess,
      hasFlowchart: true,
      flowchartSteps: [...existingSteps, newStep],
    };

    setSelectedProcess(updated);
    onUpdateProcess?.(updated);
    setNewStepTitle('');
    setNewStepRole('');
    setNewStepInputs('');
    setNewStepOutputs('');
  };

  const handleAddQcpCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess || !qcpParam.trim()) return;

    const existingCheckpoints = selectedProcess.qcpCheckpoints || [];
    const newCheck: QCPCheckpoint = {
      id: `qcp-${Date.now()}`,
      parameter: qcpParam.trim(),
      specification: qcpSpec.trim() || 'Target ± 5%',
      frequency: qcpFreq.trim() || 'Batch sample',
      acceptanceCriteria: 'Lab standard pass',
    };

    const updated: ProcessControlItem = {
      ...selectedProcess,
      hasQCP: true,
      qcpCheckpoints: [...existingCheckpoints, newCheck],
    };

    setSelectedProcess(updated);
    onUpdateProcess?.(updated);
    setQcpParam('');
    setQcpSpec('');
    setQcpFreq('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb matching Screenshot 5 */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header and Add Button matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Process Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage process maps and quality control plans for all company processes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Process</span>
        </button>
      </div>

      {/* Process Cards Grid matching Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {processes.map((proc) => (
          <div
            key={proc.id}
            onClick={() => setSelectedProcess(proc)}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                {/* Flow icon in light blue square matching screenshot */}
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
                  <Workflow className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {proc.status}
                  </span>
                  {onDeleteProcess && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProcess(proc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded transition-opacity"
                      title="Delete Process"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 leading-snug">{proc.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">{proc.code}</p>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              {proc.hasFlowchart && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                  <Check className="w-3.5 h-3.5 text-[#2563eb]" />
                  Flowchart
                </span>
              )}
              {!proc.hasQCP ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                  No QCP
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  QCP Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Process Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Add New Process</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Process Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. recycle, extrusion, packaging"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Process Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 111, PR-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="In Review">In Review</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFlowchart}
                    onChange={(e) => setHasFlowchart(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">Generate Process Map & Flowchart</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasQCP}
                    onChange={(e) => setHasQCP(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">Generate Quality Control Plan (QCP)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Flowchart & QCP Inspection Drawer / Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{selectedProcess.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">Process ID: {selectedProcess.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Process Flowchart Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-blue-600" />
                  Process Flowchart Steps
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedProcess.flowchartSteps?.length || 0} sequential steps
                </span>
              </div>

              <div className="space-y-2.5">
                {(selectedProcess.flowchartSteps || []).map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                          Role: {step.responsibleRole}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-500 text-[11px]">
                        <div><strong className="text-slate-700">Inputs:</strong> {step.inputs}</div>
                        <div><strong className="text-slate-700">Outputs:</strong> {step.outputs}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add step form */}
              <form onSubmit={handleAddFlowStep} className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs space-y-2">
                <span className="font-semibold text-blue-900">Add Flowchart Step</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Step Title (e.g. Extruder Heating)"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Responsible Role (e.g. Lead Tech)"
                    value={newStepRole}
                    onChange={(e) => setNewStepRole(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Inputs (e.g. Polymer flakes)"
                    value={newStepInputs}
                    onChange={(e) => setNewStepInputs(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Outputs (e.g. Melted strand)"
                    value={newStepOutputs}
                    onChange={(e) => setNewStepOutputs(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  + Add Step
                </button>
              </form>
            </div>

            {/* Section 2: Quality Control Plan (QCP) Checkpoints */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  Quality Control Plan (QCP) Inspection Points
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedProcess.qcpCheckpoints?.length || 0} control gates
                </span>
              </div>

              {(selectedProcess.qcpCheckpoints || []).length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No Quality Control Plan (QCP) registered for this process yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Inspection Parameter</th>
                        <th className="py-2.5 px-3">Specification</th>
                        <th className="py-2.5 px-3">Frequency</th>
                        <th className="py-2.5 px-3">Criteria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {selectedProcess.qcpCheckpoints?.map((chk) => (
                        <tr key={chk.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{chk.parameter}</td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">{chk.specification}</td>
                          <td className="py-2.5 px-3 text-slate-600">{chk.frequency}</td>
                          <td className="py-2.5 px-3 text-emerald-700">{chk.acceptanceCriteria}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add QCP checkpoint form */}
              <form onSubmit={handleAddQcpCheckpoint} className="mt-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-2">
                <span className="font-semibold text-emerald-900">Add QCP Parameter</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Parameter (e.g. Melt Flow Index)"
                    value={qcpParam}
                    onChange={(e) => setQcpParam(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Specification (e.g. 2.5 ± 0.3)"
                    value={qcpSpec}
                    onChange={(e) => setQcpSpec(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g. Hourly)"
                    value={qcpFreq}
                    onChange={(e) => setQcpFreq(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  + Add Inspection Gate
                </button>
              </form>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProcess(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
