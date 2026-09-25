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
  CheckCircle2,
  Calendar,
  Upload,
  Search,
} from 'lucide-react';
import { HRData, Company } from '../../types';

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
  rank: number;
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

// Reusable Form Helpers
const FormInput: React.FC<{
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}> = ({ label, required, type = 'text', value, onChange, placeholder, autoFocus, className = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      required={required}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs ${className}`}
    />
  </div>
);

const FormSelect: React.FC<{
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  hint?: string;
}> = ({ label, required, value, onChange, options, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
      {hint && <span className="text-slate-500 font-normal text-xs ml-1">{hint}</span>}
    </label>
    <div className="relative">
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs cursor-pointer"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const FormDateInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="date"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            try {
              (e.target as any).showPicker?.();
            } catch {}
          }}
          className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs cursor-pointer ${
            disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
          }`}
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => {
              try {
                inputRef.current?.showPicker ? inputRef.current.showPicker() : inputRef.current?.focus();
              } catch {}
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 cursor-pointer p-0.5"
            title="Pick date"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const HRManagementView: React.FC<HRManagementViewProps> = ({
  company,
  hrData,
  onAddDepartment,
  onAddJobTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'employees' | 'organogram' | 'training'>('summary');

  // Modals for Summary Tab
  const [simpleModal, setSimpleModal] = useState<{ type: 'dept' | 'job'; isOpen: boolean }>({
    type: 'dept',
    isOpen: false,
  });
  const [simpleModalInput, setSimpleModalInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const compPrefix = company?.name
    ? company.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
    : 'NK';

  // Employees Tab States
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeSort, setEmployeeSort] = useState('Highest to Lowest Rank');
  const [employees, setEmployees] = useState<EmployeeItem[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company?.id}_hr_employees`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_hr_employees');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    employeeNumber: '',
    position: '',
    department: '',
    reportingTo: '',
    email: '',
    phone: '',
    hireDate: '',
    status: 'Active' as 'Active' | 'On Leave' | 'Terminated',
    hierarchyLevel: '1',
    skills: '',
  });

  // Training Records Tab States
  const [trainingSearch, setTrainingSearch] = useState('');
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecordItem[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${company?.id}_hr_training`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_hr_training');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Sync when company changes
  useEffect(() => {
    try {
      const savedScopedEmp = localStorage.getItem(`sheq_${company.id}_hr_employees`);
      setEmployees(savedScopedEmp ? JSON.parse(savedScopedEmp) : JSON.parse(localStorage.getItem('sheq_hr_employees') || '[]'));

      const savedScopedTrn = localStorage.getItem(`sheq_${company.id}_hr_training`);
      setTrainingRecords(savedScopedTrn ? JSON.parse(savedScopedTrn) : JSON.parse(localStorage.getItem('sheq_hr_training') || '[]'));
    } catch {}
  }, [company.id]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sheq_hr_employees', JSON.stringify(employees));
      if (company?.id) localStorage.setItem(`sheq_${company.id}_hr_employees`, JSON.stringify(employees));
    } catch {}
  }, [employees, company?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('sheq_hr_training', JSON.stringify(trainingRecords));
      if (company?.id) localStorage.setItem(`sheq_${company.id}_hr_training`, JSON.stringify(trainingRecords));
    } catch {}
  }, [trainingRecords, company?.id]);

  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [multiEmployee, setMultiEmployee] = useState('');
  const [multiTrainings, setMultiTrainings] = useState<MultiTrainingEntry[]>([
    {
      id: 'mte-1',
      title: '',
      provider: '',
      status: 'Completed',
      completionDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      doesNotExpire: false,
      certificateFileName: '',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimpleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = simpleModalInput.trim();
    if (!val) return;
    if (simpleModal.type === 'dept') {
      onAddDepartment(val);
      showToast(`Department "${val}" added successfully.`);
    } else {
      onAddJobTitle(val);
      showToast(`Job title "${val}" added successfully.`);
    }
    setSimpleModalInput('');
    setSimpleModal({ ...simpleModal, isOpen: false });
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name.trim()) return;

    const rankNum = Number(employeeForm.hierarchyLevel) || 1;
    const pos = employeeForm.position.trim() || hrData.jobTitles[0]?.name || 'Staff';
    const dept = employeeForm.department || hrData.departments[0]?.name || 'General';
    const today = new Date().toISOString().split('T')[0];

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
      hireDate: employeeForm.hireDate || today,
      startDate: employeeForm.hireDate || today,
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
      department: '',
      reportingTo: '',
      email: '',
      phone: '',
      hireDate: '',
      status: 'Active',
      hierarchyLevel: '1',
      skills: '',
    });
    showToast(`Employee "${newEmp.name}" added successfully.`);
  };

  const handleDeleteEmployee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this employee record?')) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      showToast('Employee record removed.');
    }
  };

  const openAddSingleTraining = () => {
    setMultiEmployee(employees[0]?.name || '');
    setMultiTrainings([
      {
        id: `mte-${Date.now()}`,
        title: '',
        provider: 'SHEQ Academy / ISO Institute',
        status: 'Completed',
        completionDate: new Date().toISOString().split('T')[0],
        expiryDate: '2027-09-30',
        doesNotExpire: false,
        certificateFileName: '',
      },
    ]);
    setShowAddMultipleModal(true);
  };

  const openAddMultipleTraining = () => {
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

  const handleUpdateTrainingEntry = (id: string, field: keyof MultiTrainingEntry, val: any) => {
    setMultiTrainings((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  };

  const handleSaveMultipleTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!multiEmployee.trim()) {
      alert('Please select an employee.');
      return;
    }

    const validEntries = multiTrainings.filter((t) => t.title.trim().length > 0);
    if (validEntries.length === 0) {
      alert('Please enter at least one training title.');
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
    if (window.confirm('Delete this training record?')) {
      setTrainingRecords((prev) => prev.filter((t) => t.id !== id));
      showToast('Training record removed.');
    }
  };

  // Filtered lists
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
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold">{company.name}</span>
          <span className="px-1.5 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
            {company.plan || 'ACTIVE'}
          </span>
          {company.registrationNumber && (
            <span className="hidden sm:inline-block font-mono text-slate-400">
              • Reg: {company.registrationNumber}
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name} — HR Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage employees, organizational structure, competencies, and training records for {company.name}.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl gap-1 shadow-2xs">
        {(['summary', 'employees', 'organogram', 'training'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {tab === 'training' ? 'Training Records' : tab}
          </button>
        ))}
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compPrefix}-DC-015</span>
          </div>

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
                <div className="text-2xl font-extrabold text-slate-900">{hrData.departments.length}</div>
                <div className="text-xs font-medium text-slate-500">Departments</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{hrData.jobTitles.length}</div>
                <div className="text-xs font-medium text-slate-500">Job Titles</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Departments */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Departments</h3>
                <button
                  onClick={() => setSimpleModal({ type: 'dept', isOpen: true })}
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

            {/* Job Titles */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Job Titles / Positions</h3>
                <button
                  onClick={() => setSimpleModal({ type: 'job', isOpen: true })}
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

      {/* TAB 2: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compPrefix}-DC-015</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72 sm:w-80">
              <input
                type="text"
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
              {employeeSearch && (
                <button
                  onClick={() => setEmployeeSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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

          {filteredEmployees.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-24 px-4 text-center flex flex-col items-center justify-center shadow-2xs">
              <Users className="w-9 h-9 text-slate-300 stroke-[1.5] mb-2" />
              <div className="text-xs sm:text-sm text-slate-500">
                {employeeSearch ? 'No employees match your search.' : 'No employees found.'}
              </div>
            </div>
          ) : (
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

      {/* TAB 3: ORGANOGRAM */}
      {activeTab === 'organogram' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compPrefix}-DC-015</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{company.name} — Organizational Structure</h3>
                <p className="text-xs text-slate-500">
                  ISO 9001:2015 Clause 5.3 Organizational roles, responsibilities and authorities.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                Live Organogram
              </span>
            </div>

            {/* Tree */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-xl shadow-md text-center w-64 border border-blue-600">
                  <div className="w-9 h-9 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mx-auto text-xs mb-1.5 shadow-2xs">
                    MD
                  </div>
                  <div className="font-bold text-sm tracking-wide">Managing Director / CEO</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">Top Management (Executive)</div>
                </div>
                <div className="w-0.5 h-6 bg-slate-300 mx-auto" />
              </div>

              <div className="w-full max-w-4xl relative">
                <div className="hidden sm:block h-0.5 bg-slate-300 w-3/4 mx-auto mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* TAB 4: TRAINING RECORDS */}
      {activeTab === 'training' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-500">DOCUMENT #:</span>
            <span className="font-bold text-slate-900">{compPrefix}-DC-015</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72 sm:w-80">
              <input
                type="text"
                placeholder="Search training..."
                value={trainingSearch}
                onChange={(e) => setTrainingSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
              {trainingSearch && (
                <button
                  onClick={() => setTrainingSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={openAddSingleTraining}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>

            <button
              onClick={openAddMultipleTraining}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
              <span>Add Multiple</span>
            </button>
          </div>

          {filteredTraining.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-24 px-4 text-center flex flex-col items-center justify-center shadow-2xs">
              <GraduationCap className="w-9 h-9 text-slate-300 stroke-[1.5] mb-2" />
              <div className="text-xs sm:text-sm text-slate-500">
                {trainingSearch ? 'No training records match your search.' : 'No training records found.'}
              </div>
            </div>
          ) : (
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
                        <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">{rec.employeeName}</td>
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

      {/* MODAL: Simple Category Input (Dept / Job Title) */}
      {simpleModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setSimpleModal({ ...simpleModal, isOpen: false })}
          onKeyDown={(e) => e.key === 'Escape' && setSimpleModal({ ...simpleModal, isOpen: false })}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900">
                {simpleModal.type === 'dept' ? 'Add Department' : 'Add Job Title'}
              </h3>
              <button
                onClick={() => setSimpleModal({ ...simpleModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSimpleModalSubmit} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                placeholder={simpleModal.type === 'dept' ? 'e.g. Quality Assurance' : 'e.g. Lead Quality Auditor'}
                value={simpleModalInput}
                onChange={(e) => setSimpleModalInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSimpleModal({ ...simpleModal, isOpen: false })}
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

      {/* MODAL: Add Employee */}
      {showAddEmployeeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddEmployeeModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowAddEmployeeModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">Add Employee</h3>
              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <FormInput
                label="Full Name"
                required
                autoFocus
                value={employeeForm.name}
                onChange={(val) => setEmployeeForm({ ...employeeForm, name: val })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Employee Number"
                  value={employeeForm.employeeNumber}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, employeeNumber: val })}
                />
                <FormSelect
                  label="Position"
                  required
                  value={employeeForm.position}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, position: val })}
                  options={[
                    { label: 'Select position...', value: '' },
                    ...hrData.jobTitles.map((j) => ({ label: j.name, value: j.name })),
                    { label: 'Managing Director / CEO', value: 'Managing Director / CEO' },
                    { label: 'Quality & SHEQ Lead', value: 'Quality & SHEQ Lead' },
                    { label: 'Lead Auditor', value: 'Lead Auditor' },
                    { label: 'Quality Specialist', value: 'Quality Specialist' },
                    { label: 'Operations Lead', value: 'Operations Lead' },
                    { label: 'HR Administrator', value: 'HR Administrator' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Department"
                  value={employeeForm.department}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, department: val })}
                  options={[
                    { label: 'Select department...', value: '' },
                    ...hrData.departments.map((d) => ({ label: d.name, value: d.name })),
                    { label: 'Executive Management', value: 'Executive Management' },
                    { label: 'Quality Assurance', value: 'Quality Assurance' },
                    { label: 'Operations & Logistics', value: 'Operations & Logistics' },
                    { label: 'Administration & HR', value: 'Administration & HR' },
                  ]}
                />
                <FormSelect
                  label="Reporting To"
                  hint="(Supervisor)"
                  value={employeeForm.reportingTo}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, reportingTo: val })}
                  options={[
                    { label: '— None —', value: '' },
                    ...employees.map((emp) => ({ label: `${emp.name} (${emp.position || emp.jobTitle})`, value: emp.name })),
                    { label: 'Managing Director / CEO', value: 'Managing Director / CEO' },
                    { label: 'Quality & SHEQ Lead', value: 'Quality & SHEQ Lead' },
                    { label: 'Operations Lead', value: 'Operations Lead' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Email"
                  type="email"
                  value={employeeForm.email}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, email: val })}
                />
                <FormInput
                  label="Phone"
                  type="tel"
                  value={employeeForm.phone}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, phone: val })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDateInput
                  label="Hire Date"
                  value={employeeForm.hireDate}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, hireDate: val })}
                />
                <FormSelect
                  label="Status"
                  value={employeeForm.status}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, status: val as any })}
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'On Leave', value: 'On Leave' },
                    { label: 'Terminated', value: 'Terminated' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Hierarchy Level"
                  placeholder="e.g. 1 (Top)"
                  value={employeeForm.hierarchyLevel}
                  onChange={(val) => setEmployeeForm({ ...employeeForm, hierarchyLevel: val })}
                />
              </div>

              <FormInput
                label="Skills"
                placeholder="comma-separated"
                value={employeeForm.skills}
                onChange={(val) => setEmployeeForm({ ...employeeForm, skills: val })}
              />

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

      {/* MODAL: Training Records (Single or Multiple) */}
      {showAddMultipleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddMultipleModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowAddMultipleModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">
                {multiTrainings.length > 1 ? 'Add Multiple Training Records' : 'Add Training Record'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMultipleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMultipleTrainingSubmit} className="space-y-5 text-xs">
              <FormSelect
                label="Employee"
                required
                value={multiEmployee}
                onChange={(val) => setMultiEmployee(val)}
                options={[
                  { label: 'Select employee...', value: '' },
                  ...employees.map((emp) => ({
                    label: `${emp.name} ${emp.jobTitle ? `(${emp.jobTitle})` : ''}`,
                    value: emp.name,
                  })),
                  ...(employees.length === 0
                    ? [
                        { label: 'Johnathan Smith (Managing Director)', value: 'Johnathan Smith' },
                        { label: 'Sarah Connor (Quality & SHEQ Lead)', value: 'Sarah Connor' },
                        { label: 'Michael Scott (Operations Lead)', value: 'Michael Scott' },
                      ]
                    : []),
                ]}
              />

              <div className="space-y-4">
                {multiTrainings.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs transition-all relative"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-bold text-sm text-slate-700">Training #{idx + 1}</span>
                      {multiTrainings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMultiTrainings((prev) => prev.filter((t) => t.id !== entry.id))}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <FormInput
                      label="Training / Certificate Title"
                      required
                      placeholder="e.g. First Aid Level 1 / ISO 9001 Internal Auditor"
                      value={entry.title}
                      onChange={(val) => handleUpdateTrainingEntry(entry.id, 'title', val)}
                    />

                    <FormInput
                      label="Provider"
                      placeholder="e.g. SHEQ Street Academy / TÜV Rheinland"
                      value={entry.provider}
                      onChange={(val) => handleUpdateTrainingEntry(entry.id, 'provider', val)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Status"
                        value={entry.status}
                        onChange={(val) => handleUpdateTrainingEntry(entry.id, 'status', val)}
                        options={[
                          { label: 'Completed', value: 'Completed' },
                          { label: 'In Progress', value: 'In Progress' },
                          { label: 'Expired', value: 'Expired' },
                          { label: 'Planned', value: 'Planned' },
                        ]}
                      />
                      <FormDateInput
                        label="Completion Date"
                        value={entry.completionDate}
                        onChange={(val) => handleUpdateTrainingEntry(entry.id, 'completionDate', val)}
                      />
                    </div>

                    <div>
                      <FormDateInput
                        label="Certificate Expiry Date"
                        disabled={entry.doesNotExpire}
                        value={entry.doesNotExpire ? '' : entry.expiryDate}
                        onChange={(val) => handleUpdateTrainingEntry(entry.id, 'expiryDate', val)}
                      />
                      <label className="inline-flex items-center gap-2 mt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={entry.doesNotExpire}
                          onChange={(e) => handleUpdateTrainingEntry(entry.id, 'doesNotExpire', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-600">Does not expire (e.g. degree / diploma)</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">Certificate</label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Upload</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpdateTrainingEntry(entry.id, 'certificateFileName', file.name);
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

              <button
                type="button"
                onClick={() =>
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
                    },
                  ])
                }
                className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-slate-700" />
                <span>Add another training entry</span>
              </button>

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
