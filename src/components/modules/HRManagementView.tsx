import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Building,
  Briefcase,
  Plus,
  FileText,
  Trash2,
  X,
  ChevronDown,
  GraduationCap,
  Search,
  CheckCircle2,
  Calendar,
  Award,
  Layers,
  Sparkles,
  UserCheck,
  Building2,
  Eye,
  Upload,
} from 'lucide-react';
import { HRData, Company } from '../../types';
import { getCompanyPrefix } from '../../utils/companyUtils';

interface HRManagementViewProps {
  company: Company;
  hrData: HRData;
  onAddDepartment: (name: string) => void;
  onAddJobTitle: (name: string) => void;
}

export interface EmployeeItem {
  id: string;
  name: string;
  employeeNumber?: string;
  position?: string;
  jobTitle: string;
  department: string;
  reportingTo?: string;
  email: string;
  phone?: string;
  hireDate?: string;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  hierarchyLevel?: string | number;
  rank: number; // 1 = highest, etc.
  skills?: string;
}

export interface TrainingRecordItem {
  id: string;
  title: string;
  employeeName: string;
  department: string;
  provider: string;
  completionDate: string;
  expiryDate?: string;
  certificateNo?: string;
  certificateFile?: string;
  doesNotExpire?: boolean;
  status: 'Completed' | 'In Progress' | 'Expired' | 'Planned';
}

export interface MultiTrainingEntry {
  id: string;
  title: string;
  provider: string;
  status: 'Completed' | 'In Progress' | 'Expired' | 'Planned';
  completionDate: string;
  expiryDate: string;
  doesNotExpire: boolean;
  certificateFileName?: string;
}

export const HRManagementView: React.FC<HRManagementViewProps> = ({
  company,
  hrData,
  onAddDepartment,
  onAddJobTitle,
}) => {
  // Navigation Tabs: 'summary' | 'employees' | 'organogram' | 'training' (matching Image 1)
  const [activeTab, setActiveTab] = useState<'summary' | 'employees' | 'organogram' | 'training'>('summary');

  // Modals for Summary Tab
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [deptInput, setDeptInput] = useState('');
  const [jobInput, setJobInput] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Employees Tab States (matching Image 2)
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeSort, setEmployeeSort] = useState('Highest to Lowest Rank');
  const [employees, setEmployees] = useState<EmployeeItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_hr_employees');
      if (saved) return JSON.parse(saved);
    } catch {}
    return []; // Starts empty to match Image 2
  });
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const hireDateInputRef = useRef<HTMLInputElement>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    employeeNumber: '',
    position: '',
    jobTitle: '',
    department: '',
    reportingTo: '',
    email: '',
    phone: '',
    hireDate: '',
    startDate: '',
    status: 'Active' as 'Active' | 'On Leave' | 'Terminated',
    hierarchyLevel: '1',
    rank: 1,
    skills: '',
  });

  // Training Records Tab States (matching Image 3)
  const [trainingSearch, setTrainingSearch] = useState('');
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecordItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_hr_training');
      if (saved) return JSON.parse(saved);
    } catch {}
    return []; // Starts empty to match Image 3
  });
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [multiEmployee, setMultiEmployee] = useState('');
  const [multiTrainings, setMultiTrainings] = useState<MultiTrainingEntry[]>([
    {
      id: 'mte-1',
      title: '',
      provider: '',
      status: 'Completed',
      completionDate: '',
      expiryDate: '',
      doesNotExpire: false,
      certificateFileName: '',
    },
  ]);
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    employeeName: '',
    department: '',
    provider: 'SHEQ Academy / ISO Institute',
    completionDate: new Date().toISOString().split('T')[0],
    expiryDate: '2027-09-30',
    certificateNo: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Completed' as const,
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sheq_hr_employees', JSON.stringify(employees));
    } catch {}
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('sheq_hr_training', JSON.stringify(trainingRecords));
    } catch {}
  }, [trainingRecords]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptInput.trim()) return;
    onAddDepartment(deptInput.trim());
    setDeptInput('');
    setShowDeptModal(false);
    showToast(`Department "${deptInput.trim()}" added successfully.`);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobInput.trim()) return;
    onAddJobTitle(jobInput.trim());
    setJobInput('');
    setShowJobModal(false);
    showToast(`Job title "${jobInput.trim()}" added successfully.`);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name.trim()) return;

    const rankNum = Number(employeeForm.hierarchyLevel) || Number(employeeForm.rank) || 1;
    const pos = employeeForm.position.trim() || employeeForm.jobTitle.trim() || (hrData.jobTitles[0]?.name || 'Staff');
    const dept = employeeForm.department || (hrData.departments[0]?.name || 'General');

    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      name: employeeForm.name.trim(),
      employeeNumber: employeeForm.employeeNumber.trim() || undefined,
      position: pos,
      jobTitle: pos,
      department: dept,
      reportingTo: employeeForm.reportingTo || undefined,
      email: employeeForm.email.trim() || `${employeeForm.name.toLowerCase().replace(/\s+/g, '.')}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: employeeForm.phone.trim() || undefined,
      hireDate: employeeForm.hireDate || employeeForm.startDate || new Date().toISOString().split('T')[0],
      startDate: employeeForm.hireDate || employeeForm.startDate || new Date().toISOString().split('T')[0],
      status: employeeForm.status,
      hierarchyLevel: rankNum,
      rank: rankNum,
      skills: employeeForm.skills.trim() || undefined,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setShowAddEmployeeModal(false);
    setEmployeeForm({
      name: '',
      employeeNumber: '',
      position: '',
      jobTitle: '',
      department: '',
      reportingTo: '',
      email: '',
      phone: '',
      hireDate: '',
      startDate: '',
      status: 'Active',
      hierarchyLevel: '1',
      rank: 1,
      skills: '',
    });
    showToast(`Employee "${newEmp.name}" added successfully.`);
  };

  const handleDeleteEmployee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    showToast('Employee record removed.');
  };

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingForm.title.trim()) return;

    const newRec: TrainingRecordItem = {
      id: `trn-${Date.now()}`,
      title: trainingForm.title.trim(),
      employeeName: trainingForm.employeeName.trim() || 'All Quality Personnel',
      department: trainingForm.department || (hrData.departments[0]?.name || 'Quality'),
      provider: trainingForm.provider.trim() || 'Internal Quality Academy',
      completionDate: trainingForm.completionDate,
      expiryDate: trainingForm.expiryDate,
      certificateNo: trainingForm.certificateNo,
      status: trainingForm.status,
    };

    setTrainingRecords((prev) => [newRec, ...prev]);
    setShowAddTrainingModal(false);
    setTrainingForm({
      title: '',
      employeeName: '',
      department: '',
      provider: 'SHEQ Academy / ISO Institute',
      completionDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-09-30',
      certificateNo: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Completed',
    });
    showToast(`Training record "${newRec.title}" created.`);
  };

  const handleOpenAddMultipleModal = () => {
    setMultiEmployee(employees[0]?.name || '');
    setMultiTrainings([
      {
        id: `mte-${Date.now()}-1`,
        title: '',
        provider: '',
        status: 'Completed',
        completionDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        doesNotExpire: false,
        certificateFileName: '',
      },
    ]);
    setShowAddMultipleModal(true);
  };

  const handleAddAnotherTrainingEntry = () => {
    setMultiTrainings((prev) => [
      ...prev,
      {
        id: `mte-${Date.now()}-${prev.length + 1}`,
        title: '',
        provider: '',
        status: 'Completed',
        completionDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        doesNotExpire: false,
        certificateFileName: '',
      },
    ]);
  };

  const handleRemoveTrainingEntry = (id: string) => {
    if (multiTrainings.length <= 1) {
      setMultiTrainings([
        {
          id: `mte-${Date.now()}`,
          title: '',
          provider: '',
          status: 'Completed',
          completionDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          doesNotExpire: false,
          certificateFileName: '',
        },
      ]);
      return;
    }
    setMultiTrainings((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTrainingEntry = (id: string, field: keyof MultiTrainingEntry, val: any) => {
    setMultiTrainings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  const handleSaveMultipleTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!multiEmployee.trim()) {
      alert('Please select an employee.');
      return;
    }

    const validEntries = multiTrainings.filter((t) => t.title.trim().length > 0);
    if (validEntries.length === 0) {
      alert('Please enter at least one training or certificate title.');
      return;
    }

    const empObj = employees.find((emp) => emp.name === multiEmployee);
    const dept = empObj?.department || hrData.departments[0]?.name || 'Operations';

    const newRecords: TrainingRecordItem[] = validEntries.map((t, idx) => ({
      id: `trn-${Date.now()}-${idx}`,
      title: t.title.trim(),
      employeeName: multiEmployee,
      department: dept,
      provider: t.provider.trim() || 'Accredited Training Provider',
      completionDate: t.completionDate || new Date().toISOString().split('T')[0],
      expiryDate: t.doesNotExpire ? 'Does not expire' : (t.expiryDate || undefined),
      certificateNo: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      certificateFile: t.certificateFileName,
      doesNotExpire: t.doesNotExpire,
      status: t.status,
    }));

    setTrainingRecords((prev) => [...newRecords, ...prev]);
    setShowAddMultipleModal(false);
    showToast(`Added ${newRecords.length} training record${newRecords.length > 1 ? 's' : ''} for ${multiEmployee}.`);
  };

  const handleDeleteTraining = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrainingRecords((prev) => prev.filter((t) => t.id !== id));
    showToast('Training record removed.');
  };

  // Filtered employees
  const filteredEmployees = employees
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(employeeSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (employeeSort === 'Highest to Lowest Rank') return a.rank - b.rank;
      if (employeeSort === 'Lowest to Highest Rank') return b.rank - a.rank;
      if (employeeSort === 'A to Z') return a.name.localeCompare(b.name);
      return a.department.localeCompare(b.department);
    });

  // Filtered training records
  const filteredTraining = trainingRecords.filter(
    (trn) =>
      trn.title.toLowerCase().includes(trainingSearch.toLowerCase()) ||
      trn.employeeName.toLowerCase().includes(trainingSearch.toLowerCase()) ||
      trn.department.toLowerCase().includes(trainingSearch.toLowerCase()) ||
      trn.provider.toLowerCase().includes(trainingSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* Sub Tabs matching 1st Pinned Image */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('organogram')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'organogram'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Organogram
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'training'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          Training Records
        </button>
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Document Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-015</span>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {employees.length > 0 ? employees.length : hrData.totalEmployees}
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

          {/* Two side-by-side lists */}
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
        </div>
      )}

      {/* TAB 2: EMPLOYEES (Matching 2nd Pinned Image) */}
      {activeTab === 'employees' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Document Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-015</span>
          </div>

          {/* Toolbar Matching 2nd Pinned Image */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72 sm:w-80">
              <input
                type="text"
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="relative">
              <select
                value={employeeSort}
                onChange={(e) => setEmployeeSort(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-medium text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              >
                <option value="Highest to Lowest Rank">Highest to Lowest Rank</option>
                <option value="Lowest to Highest Rank">Lowest to Highest Rank</option>
                <option value="A to Z">A to Z</option>
                <option value="By Department">By Department</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Employee</span>
            </button>
          </div>

          {/* Empty State Card Matching 2nd Pinned Image */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-24 px-4 text-center flex flex-col items-center justify-center shadow-2xs">
              <Users className="w-9 h-9 text-slate-300 stroke-[1.5] mb-2" />
              <div className="text-xs sm:text-sm text-slate-500">No employees found.</div>
            </div>
          ) : (
            /* Employee Records Table */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#16325c] text-white font-bold text-xs border-b border-[#0e223f]">
                      <th className="py-3 px-4 text-center w-12 font-bold text-white whitespace-nowrap">#</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Employee Name</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Department</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Job Title</th>
                      <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Rank</th>
                      <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredEmployees.map((emp, idx) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-500 whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div>{emp.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {emp.employeeNumber && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {emp.employeeNumber}
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-slate-400 font-normal">{emp.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{emp.department}</td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <div className="font-medium">{emp.position || emp.jobTitle}</div>
                          {emp.reportingTo && (
                            <div className="text-[10px] text-slate-400">Reports to: {emp.reportingTo}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            Level {emp.hierarchyLevel || emp.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px]">
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => handleDeleteEmployee(emp.id, e)}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors text-slate-400"
                            title="Delete employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORGANOGRAM (Interactive Hierarchy View) */}
      {activeTab === 'organogram' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Document Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-015</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {company.name} — Organizational Structure
                </h3>
                <p className="text-xs text-slate-500">
                  ISO 9001:2015 Clause 5.3 Organizational roles, responsibilities and authorities.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                Live Organogram
              </span>
            </div>

            {/* Tree Structure */}
            <div className="flex flex-col items-center space-y-6">
              {/* Level 1: Executive Head */}
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-xl shadow-md text-center w-64 border border-blue-600">
                  <div className="w-9 h-9 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mx-auto text-xs mb-1.5 shadow-2xs">
                    MD
                  </div>
                  <div className="font-bold text-sm tracking-wide">Managing Director / CEO</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">Top Management (Executive)</div>
                </div>
                {/* Connecting Line Down */}
                <div className="w-0.5 h-6 bg-slate-300 mx-auto" />
              </div>

              {/* Level 2: Key Operational Divisions */}
              <div className="w-full max-w-4xl relative">
                {/* Horizontal distribution bar */}
                <div className="hidden sm:block h-0.5 bg-slate-300 w-3/4 mx-auto mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Division 1 */}
                  <div className="bg-slate-50 border border-slate-200 hover:border-blue-400 p-4 rounded-xl text-center space-y-2 transition-all shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto text-xs">
                      QA
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Quality & SHEQ Lead</div>
                      <div className="text-[10px] text-slate-500 font-medium">Compliance & ISO Audits</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <div className="bg-white py-1 px-2 rounded border border-slate-200">ISO 9001 Lead Auditor</div>
                      <div className="bg-white py-1 px-2 rounded border border-slate-200">Quality Inspectors</div>
                    </div>
                  </div>

                  {/* Division 2 */}
                  <div className="bg-slate-50 border border-slate-200 hover:border-blue-400 p-4 rounded-xl text-center space-y-2 transition-all shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto text-xs">
                      OPS
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Operations & Logistics</div>
                      <div className="text-[10px] text-slate-500 font-medium">Process & Delivery</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <div className="bg-white py-1 px-2 rounded border border-slate-200">Operations Lead</div>
                      <div className="bg-white py-1 px-2 rounded border border-slate-200">Procurement & Warehouse</div>
                    </div>
                  </div>

                  {/* Division 3 */}
                  <div className="bg-slate-50 border border-slate-200 hover:border-blue-400 p-4 rounded-xl text-center space-y-2 transition-all shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center mx-auto text-xs">
                      ADM
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Administration & HR</div>
                      <div className="text-[10px] text-slate-500 font-medium">Training & Governance</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <div className="bg-white py-1 px-2 rounded border border-slate-200">HR Administrator</div>
                      <div className="bg-white py-1 px-2 rounded border border-slate-200">Document Controller</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRAINING RECORDS (Matching 3rd Pinned Image) */}
      {activeTab === 'training' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Document Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{getCompanyPrefix(company?.name)}-DC-015</span>
          </div>

          {/* Toolbar Matching 3rd Pinned Image */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72 sm:w-80">
              <input
                type="text"
                placeholder="Search training..."
                value={trainingSearch}
                onChange={(e) => setTrainingSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <button
              onClick={() => setShowAddTrainingModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>

            <button
              onClick={handleOpenAddMultipleModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
              <span>Add Multiple</span>
            </button>
          </div>

          {/* Empty State Card Matching 3rd Pinned Image */}
          {filteredTraining.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-24 px-4 text-center flex flex-col items-center justify-center shadow-2xs">
              <GraduationCap className="w-9 h-9 text-slate-300 stroke-[1.5] mb-2" />
              <div className="text-xs sm:text-sm text-slate-500">No training records found.</div>
            </div>
          ) : (
            /* Training Records Table */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#16325c] text-white font-bold text-xs border-b border-[#0e223f]">
                      <th className="py-3 px-4 text-center w-12 font-bold text-white whitespace-nowrap">#</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Training Title</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Participant / Role</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Department</th>
                      <th className="py-3 px-4 font-bold text-white whitespace-nowrap">Provider / Institute</th>
                      <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Completed</th>
                      <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 font-bold text-white text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTraining.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-500 whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div>{rec.title}</div>
                          {rec.certificateNo && (
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              {rec.certificateNo}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                          {rec.employeeName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{rec.department}</td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{rec.provider}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 whitespace-nowrap">
                          {rec.completionDate}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px]">
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => handleDeleteTraining(rec.id, e)}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors text-slate-400"
                            title="Delete training record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Add Department */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900">Add Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDept} className="space-y-3">
              <input
                type="text"
                required
                placeholder="e.g. Quality Assurance"
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Job Title */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900">Add Job Title</h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddJob} className="space-y-3">
              <input
                type="text"
                required
                placeholder="e.g. Lead Quality Auditor"
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Employee (Matching Pinned Image) */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">Add Employee</h3>
              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              {/* Row 1: Full Name * */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-600 ring-2 ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs transition-all"
                />
              </div>

              {/* Row 2: Employee Number & Position * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Employee Number
                  </label>
                  <input
                    type="text"
                    value={employeeForm.employeeNumber}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, employeeNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={employeeForm.position}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none shadow-2xs cursor-pointer transition-all"
                    >
                      <option value="">Select position...</option>
                      {hrData.jobTitles.map((j, i) => (
                        <option key={i} value={j.name}>
                          {j.name}
                        </option>
                      ))}
                      <option value="Managing Director / CEO">Managing Director / CEO</option>
                      <option value="Quality & SHEQ Lead">Quality & SHEQ Lead</option>
                      <option value="Lead Auditor">Lead Auditor</option>
                      <option value="Quality Specialist">Quality Specialist</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Operations Lead">Operations Lead</option>
                      <option value="HR Administrator">HR Administrator</option>
                      <option value="Document Controller">Document Controller</option>
                      <option value="Quality Inspector">Quality Inspector</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Department & Reporting To (Supervisor) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={employeeForm.department}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none shadow-2xs cursor-pointer transition-all"
                    >
                      <option value="">Select department...</option>
                      {hrData.departments.map((d, i) => (
                        <option key={i} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                      <option value="Executive Management">Executive Management</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Operations & Logistics">Operations & Logistics</option>
                      <option value="Administration & HR">Administration & HR</option>
                      <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Reporting To <span className="text-slate-500 font-normal">(Supervisor)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={employeeForm.reportingTo}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, reportingTo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none shadow-2xs cursor-pointer transition-all"
                    >
                      <option value="">— None —</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} ({emp.position || emp.jobTitle})
                        </option>
                      ))}
                      <option value="Managing Director / CEO">Managing Director / CEO</option>
                      <option value="Quality & SHEQ Lead">Quality & SHEQ Lead</option>
                      <option value="Operations Lead">Operations Lead</option>
                      <option value="HR Lead">HR Lead</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 4: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Row 5: Hire Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Hire Date
                  </label>
                  <div className="relative flex items-center">
                    <input
                      ref={hireDateInputRef}
                      type="date"
                      value={employeeForm.hireDate}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value, startDate: e.target.value })}
                      onClick={(e) => {
                        try {
                          (e.target as any).showPicker?.();
                        } catch (err) {}
                      }}
                      placeholder="dd-mm-yyyy"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs cursor-pointer transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (hireDateInputRef.current) {
                            if ('showPicker' in hireDateInputRef.current) {
                              hireDateInputRef.current.showPicker();
                            } else {
                              hireDateInputRef.current.focus();
                            }
                          }
                        } catch (err) {}
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 cursor-pointer p-0.5"
                      title="Select date"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={employeeForm.status}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none shadow-2xs cursor-pointer transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 6: Hierarchy Level (1 = Top) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Hierarchy Level <span className="text-slate-500 font-normal">(1 = Top)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1"
                    value={employeeForm.hierarchyLevel}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, hierarchyLevel: e.target.value, rank: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Row 7: Skills */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Skills
                </label>
                <input
                  type="text"
                  placeholder="comma-separated"
                  value={employeeForm.skills}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Single Training Record */}
      {showAddTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Add Training Record</span>
              </h3>
              <button
                onClick={() => setShowAddTrainingModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTraining} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Course / Training Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 9001:2015 Internal Auditor Certification"
                  value={trainingForm.title}
                  onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Participant / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Quality Team"
                    value={trainingForm.employeeName}
                    onChange={(e) => setTrainingForm({ ...trainingForm, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={trainingForm.department}
                    onChange={(e) => setTrainingForm({ ...trainingForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select department...</option>
                    {hrData.departments.map((d, i) => (
                      <option key={i} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                    <option value="Quality">Quality</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Training Provider</label>
                <input
                  type="text"
                  placeholder="e.g. SHEQ Street Academy / TÜV Rheinland"
                  value={trainingForm.provider}
                  onChange={(e) => setTrainingForm({ ...trainingForm, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={trainingForm.completionDate}
                    onChange={(e) => setTrainingForm({ ...trainingForm, completionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valid Until / Expiry</label>
                  <input
                    type="date"
                    value={trainingForm.expiryDate}
                    onChange={(e) => setTrainingForm({ ...trainingForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTrainingModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Add Multiple Training Records (Matching Pinned Image) */}
      {showAddMultipleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">Add Multiple Training Records</h3>
              <button
                type="button"
                onClick={() => setShowAddMultipleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMultipleTrainingSubmit} className="space-y-5 text-xs">
              {/* Employee * */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={multiEmployee}
                    onChange={(e) => setMultiEmployee(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-600 ring-2 ring-blue-500/20 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none shadow-2xs cursor-pointer transition-all font-medium"
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} {emp.jobTitle ? `(${emp.jobTitle})` : ''}
                      </option>
                    ))}
                    {employees.length === 0 && (
                      <>
                        <option value="Johnathan Smith">Johnathan Smith (Managing Director)</option>
                        <option value="Sarah Connor">Sarah Connor (Quality & SHEQ Lead)</option>
                        <option value="Michael Scott">Michael Scott (Operations Lead)</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Training Item Cards */}
              <div className="space-y-4">
                {multiTrainings.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs transition-all relative"
                  >
                    {/* Card Header: Training #X and Trash button */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-bold text-sm text-slate-700">Training #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrainingEntry(entry.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Training Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Training / Certificate Title * */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Training / Certificate Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. First Aid Level 1"
                        value={entry.title}
                        onChange={(e) => handleUpdateTrainingEntry(entry.id, 'title', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs transition-all"
                      />
                    </div>

                    {/* Provider */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Provider
                      </label>
                      <input
                        type="text"
                        placeholder="Training provider"
                        value={entry.provider}
                        onChange={(e) => handleUpdateTrainingEntry(entry.id, 'provider', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs transition-all"
                      />
                    </div>

                    {/* Status & Completion Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Status
                        </label>
                        <div className="relative">
                          <select
                            value={entry.status}
                            onChange={(e) => handleUpdateTrainingEntry(entry.id, 'status', e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 appearance-none pr-10 outline-none shadow-2xs cursor-pointer transition-all"
                          >
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Expired">Expired</option>
                            <option value="Planned">Planned</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Completion Date
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="date"
                            value={entry.completionDate}
                            onChange={(e) => handleUpdateTrainingEntry(entry.id, 'completionDate', e.target.value)}
                            onClick={(e) => {
                              try {
                                (e.target as any).showPicker?.();
                              } catch (err) {}
                            }}
                            placeholder="dd-mm-yyyy"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs cursor-pointer transition-all"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              try {
                                input?.showPicker?.();
                              } catch (err) {}
                            }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 cursor-pointer p-0.5"
                            title="Pick completion date"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Expiry Date & Does not expire checkbox */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Certificate Expiry Date
                      </label>
                      <div className="relative flex items-center mb-2">
                        <input
                          type="date"
                          disabled={entry.doesNotExpire}
                          value={entry.doesNotExpire ? '' : entry.expiryDate}
                          onChange={(e) => handleUpdateTrainingEntry(entry.id, 'expiryDate', e.target.value)}
                          onClick={(e) => {
                            if (!entry.doesNotExpire) {
                              try {
                                (e.target as any).showPicker?.();
                              } catch (err) {}
                            }
                          }}
                          placeholder="dd-mm-yyyy"
                          className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm text-slate-900 outline-none shadow-2xs cursor-pointer transition-all ${
                            entry.doesNotExpire ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                          }`}
                        />
                        {!entry.doesNotExpire && (
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              try {
                                input?.showPicker?.();
                              } catch (err) {}
                            }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 cursor-pointer p-0.5"
                            title="Pick expiry date"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={entry.doesNotExpire}
                          onChange={(e) => handleUpdateTrainingEntry(entry.id, 'doesNotExpire', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-600">
                          Does not expire (e.g. degree / diploma)
                        </span>
                      </label>
                    </div>

                    {/* Certificate Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Certificate
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Upload</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUpdateTrainingEntry(entry.id, 'certificateFileName', file.name);
                              }
                            }}
                          />
                        </label>
                        {entry.certificateFileName && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                            <span className="max-w-[180px] truncate">{entry.certificateFileName}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateTrainingEntry(entry.id, 'certificateFileName', '')}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* + Add another training button */}
              <button
                type="button"
                onClick={handleAddAnotherTrainingEntry}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-400 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-slate-700" />
                <span>Add another training</span>
              </button>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMultipleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Save Training Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
