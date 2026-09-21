import React, { useState } from 'react';
import {
  Users,
  Building,
  Briefcase,
  Plus,
  FileText,
  Trash2,
  X,
} from 'lucide-react';
import { HRData, Company } from '../../types';

interface HRManagementViewProps {
  company: Company;
  hrData: HRData;
  onAddDepartment: (name: string) => void;
  onAddJobTitle: (name: string) => void;
}

export const HRManagementView: React.FC<HRManagementViewProps> = ({
  company,
  hrData,
  onAddDepartment,
  onAddJobTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'employees' | 'organogram' | 'training'>('summary');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [deptInput, setDeptInput] = useState('');
  const [jobInput, setJobInput] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptInput.trim()) return;
    onAddDepartment(deptInput.trim());
    setDeptInput('');
    setShowDeptModal(false);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobInput.trim()) return;
    onAddJobTitle(jobInput.trim());
    setJobInput('');
    setShowJobModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">HR Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage employees, structure, competencies, and training records.
        </p>
      </div>

      {/* Sub Tabs matching screenshot */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('organogram')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'organogram'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Organogram
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'training'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Training Records
        </button>
      </div>

      {/* Document Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-500">DOCUMENT #:</span>
        <span className="font-bold text-slate-900">NK-DC-015</span>
      </div>

      {/* 3 Metric Cards matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {hrData.totalEmployees}
            </div>
            <div className="text-xs font-medium text-slate-500">Total Employees</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {hrData.departments.length}
            </div>
            <div className="text-xs font-medium text-slate-500">Departments</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {hrData.jobTitles.length}
            </div>
            <div className="text-xs font-medium text-slate-500">Job Titles</div>
          </div>
        </div>
      </div>

      {/* Two side-by-side lists matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Departments Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">Departments</h3>
            <button
              onClick={() => setShowDeptModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {hrData.departments.map((dept, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800 capitalize">{dept.name}</span>
                <span className="text-xs font-semibold text-slate-400">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Titles / Positions Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">Job Titles / Positions</h3>
            <button
              onClick={() => setShowJobModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {hrData.jobTitles.map((job, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800 capitalize">{job.name}</span>
                <span className="text-xs font-semibold text-slate-400">{job.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Dept Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDept} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Department name"
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900">Add Job Title</h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddJob} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Job title / position"
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
