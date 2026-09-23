import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NCRManagementView } from './components/modules/NCRManagementView';
import { AuditManagementView } from './components/modules/AuditManagementView';
import { CalibrationControlView } from './components/modules/CalibrationControlView';
import { CustomerSatisfactionView } from './components/modules/CustomerSatisfactionView';
import { HRManagementView } from './components/modules/HRManagementView';
import { ManagementReviewView } from './components/modules/ManagementReviewView';
import { PolicyObjectivesView } from './components/modules/PolicyObjectivesView';
import { ProcessControlView } from './components/modules/ProcessControlView';
import { SupplierManagementView } from './components/modules/SupplierManagementView';
import { ProfileView } from './components/modules/ProfileView';
import { SettingsView } from './components/modules/SettingsView';
import { BillingPlanView } from './components/modules/BillingPlanView';
import { ResourcesView } from './components/modules/ResourcesView';
import { TutorialCentreView } from './components/modules/TutorialCentreView';
import { DocumentControlView } from './components/modules/DocumentControlView';
import { QooAssistant } from './components/QooAssistant';
import { LoginView } from './components/LoginView';
import { SessionModeSelectionView } from './components/SessionModeSelectionView';

import {
  initialCompany,
  initialNCRs,
  initialAuditRows,
  initialHRData,
  initialReviews,
  initialProcessList,
} from './data/mockData';
import {
  NavigationTab,
  NCRItem,
  AuditProcessRow,
  Company,
  ReviewMeeting,
  ProcessControlItem,
  AuthUser,
} from './types';
import { Menu, X, Mail, ExternalLink, Building, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { LoginAlertNotice } from './components/SessionModeSelectionView';
import { ConsultantDashboardView } from './components/ConsultantDashboardView';
import { AuditorDashboardView } from './components/AuditorDashboardView';

export function App() {
  // Active user session state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem('sheq_logged_out');
      if (isLoggedOut === 'true') return null;
      const isSessionActive = sessionStorage.getItem('sheq_session_active');
      const saved = localStorage.getItem('sheq_auth_user');
      if (saved && isSessionActive === 'true') {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });
  const [sessionMode, setSessionMode] = useState<'selection' | 'management' | 'consultant' | 'auditor'>(() => {
    try {
      const savedMode = sessionStorage.getItem('sheq_session_mode');
      if (savedMode === 'management' || savedMode === 'consultant' || savedMode === 'auditor') {
        return savedMode;
      }
    } catch {}
    return 'selection';
  });
  const [loginAlertNotice, setLoginAlertNotice] = useState<LoginAlertNotice | null>(null);
  const [showLoginToast, setShowLoginToast] = useState<boolean>(true);

  // Auto-dismiss the login alert notice ("Sign-In Alert Sent - Confirmation message dispatched to email") after 5 seconds
  useEffect(() => {
    if (!loginAlertNotice) return;
    const timer = setTimeout(() => {
      setLoginAlertNotice(null);
      setShowLoginToast(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loginAlertNotice]);

  const handleLogin = (user: AuthUser) => {
    if (!user?.email || !user.email.trim() || !user.email.includes('@')) {
      console.warn('Blocked login: No valid email provided.');
      return;
    }

    setCurrentUser(user);
    setSessionMode('selection');
    setShowLoginToast(true);
    try {
      localStorage.removeItem('sheq_logged_out');
      localStorage.setItem('sheq_auth_user', JSON.stringify(user));
      sessionStorage.setItem('sheq_session_active', 'true');
      sessionStorage.setItem('sheq_session_mode', 'selection');
    } catch {}

    const dispatchTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setLoginAlertNotice({
      email: user.email,
      timestamp: dispatchTime,
      status: 'sending',
    });

    fetch('/api/send-login-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        companyName: user.companyName || company?.name || 'NK Quality Systems',
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setLoginAlertNotice({
            email: user.email,
            timestamp: dispatchTime,
            status: 'sent',
            previewUrl: data.previewUrl,
            message: data.message,
          });
        } else {
          setLoginAlertNotice({
            email: user.email,
            timestamp: dispatchTime,
            status: 'failed',
            message: data?.error || 'Email dispatch failed',
          });
        }
      })
      .catch((err) => {
        console.warn('[LOGIN EMAIL] Dispatch failed or offline:', err);
        setLoginAlertNotice({
          email: user.email,
          timestamp: dispatchTime,
          status: 'failed',
          message: 'Could not connect to email service',
        });
      });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSessionMode('selection');
    setLoginAlertNotice(null);
    try {
      localStorage.setItem('sheq_logged_out', 'true');
      localStorage.removeItem('sheq_auth_user');
      sessionStorage.removeItem('sheq_session_active');
      sessionStorage.removeItem('sheq_session_mode');
    } catch {}
  };

  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash as NavigationTab;
      const saved = localStorage.getItem('sheq_activeTab');
      if (saved) return saved as NavigationTab;
    } catch {
      // fallback
    }
    return 'tutorial-centre';
  });
  const [company, setCompany] = useState<Company>(() => {
    try {
      const saved = localStorage.getItem('sheq_company');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'nv860970099@gmail.com') {
          parsed.email = 'nv8660970099@gmail.com';
        }
        return parsed;
      }
      return initialCompany;
    } catch {
      return initialCompany;
    }
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('sheq_companies_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      initialCompany,
      {
        id: 'comp-apex',
        name: 'Apex Industrial Solutions',
        registrationNumber: '2023/551980/07',
        email: 'nv8660970099@gmail.com',
        phone: '+27 11 883 4000',
        address: 'Midrand Logistics Park, Gate 2, Midrand',
        industry: 'Logistics, Freight & Supply Chain',
        website: 'https://apexindustrial.co.za',
        plan: 'PROFESSIONAL',
        daysRemaining: 340,
        isoScope: ['ISO 9001:2015', 'ISO 14001:2015'],
        employeesCount: '51 - 250',
      },
    ];
  });

  // Company Switch / New Profile Toast State
  const [companySwitchNotice, setCompanySwitchNotice] = useState<{
    companyName: string;
    industry?: string;
    plan?: string;
    isNew?: boolean;
    timestamp: string;
  } | null>(null);

  // Auto-dismiss company switch notification after 5 seconds
  useEffect(() => {
    if (!companySwitchNotice) return;
    const timer = setTimeout(() => {
      setCompanySwitchNotice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [companySwitchNotice]);

  const handleAddNewCompany = (newCompany: Company) => {
    setCompanies((prev) => {
      const filtered = prev.filter(
        (c) => c.id !== newCompany.id && c.name.toLowerCase() !== newCompany.name.toLowerCase()
      );
      const updated = [newCompany, ...filtered];
      try {
        localStorage.setItem('sheq_companies_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setCompany(newCompany);
    try {
      localStorage.setItem('sheq_company', JSON.stringify(newCompany));
    } catch {}

    // Initialize company-scoped initial data for the new entity
    const newCompId = newCompany.id;
    const initialCompanyNCRs: NCRItem[] = [];
    const initialCompanyAudits: AuditProcessRow[] = [
      {
        id: `aud-${newCompId}-1`,
        processName: `${newCompany.industry ? newCompany.industry.split('&')[0].trim() : 'Operational'} Process Management`,
        months: {
          JAN: { status: 'completed', initials: 'QA' },
          APR: { status: 'planned', initials: 'Lead' },
        },
        ncrs: '0',
        ofis: '0',
        totalScore: '100%',
      },
      {
        id: `aud-${newCompId}-2`,
        processName: 'Document & Quality Control Assurance',
        months: {
          FEB: { status: 'planned', initials: 'Lead' },
          JUN: { status: 'planned', initials: 'QC' },
        },
        ncrs: '0',
        ofis: '0',
        totalScore: '100%',
      },
    ];

    const initialCompanyHR = {
      departments: [
        { name: 'Executive Leadership', count: 1 },
        { name: 'Quality Assurance & SHEQ', count: 2 },
        { name: 'Operations & Production', count: 3 },
      ],
      jobTitles: [
        { name: newCompany.topExecutiveTitle || 'Managing Director', count: 1 },
        { name: 'SHEQ Officer', count: 1 },
        { name: 'Operations Manager', count: 1 },
      ],
      employees: [],
      trainingRecords: [],
    };

    const initialCompanyProcesses: ProcessControlItem[] = [
      {
        id: `pr-${newCompId}-1`,
        code: `${newCompany.name ? newCompany.name.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'PR'}-01`,
        name: `${newCompany.industry || 'Core Operations'} Process Execution`,
        documentNumber: `${newCompany.name ? newCompany.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'COMP'}-SOP-001`,
        isoClause: '8.5',
        processOwner: 'Operations Lead',
        status: 'Approved',
        hasFlowchart: true,
        hasQCP: false,
        description: `Operational process workflow for ${newCompany.name}.`,
      },
    ];

    setNcrs(initialCompanyNCRs);
    setAuditRows(initialCompanyAudits);
    setHrData(initialCompanyHR);
    setProcesses(initialCompanyProcesses);
    setReviews([]);

    try {
      localStorage.setItem(`sheq_${newCompId}_ncrs`, JSON.stringify(initialCompanyNCRs));
      localStorage.setItem(`sheq_${newCompId}_auditRows`, JSON.stringify(initialCompanyAudits));
      localStorage.setItem(`sheq_${newCompId}_hrData`, JSON.stringify(initialCompanyHR));
      localStorage.setItem(`sheq_${newCompId}_processes`, JSON.stringify(initialCompanyProcesses));
      localStorage.setItem(`sheq_${newCompId}_reviews`, JSON.stringify([]));
    } catch {}

    // AUTOMATICALLY CHANGE PAGE ACCORDING TO NEW COMPANY PROFILE:
    // If the user was on settings or profile, keep them in company profile view; otherwise navigate to dashboard
    setActiveTab((prev) => (prev === 'settings' || prev === 'profile' ? prev : 'dashboard'));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setCompanySwitchNotice({
      companyName: newCompany.name,
      industry: newCompany.industry,
      plan: newCompany.plan,
      isNew: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleSwitchCompany = (targetCompany: Company) => {
    setCompany(targetCompany);
    try {
      localStorage.setItem('sheq_company', JSON.stringify(targetCompany));
    } catch {}

    // Load target company's scoped data
    const compId = targetCompany.id;
    try {
      const savedNcrs = localStorage.getItem(`sheq_${compId}_ncrs`);
      if (savedNcrs) setNcrs(JSON.parse(savedNcrs));
      else if (compId === initialCompany.id) setNcrs(initialNCRs);

      const savedAudits = localStorage.getItem(`sheq_${compId}_auditRows`);
      if (savedAudits) setAuditRows(JSON.parse(savedAudits));
      else if (compId === initialCompany.id) setAuditRows(initialAuditRows);

      const savedHR = localStorage.getItem(`sheq_${compId}_hrData`);
      if (savedHR) setHrData(JSON.parse(savedHR));
      else if (compId === initialCompany.id) setHrData(initialHRData);

      const savedProcesses = localStorage.getItem(`sheq_${compId}_processes`);
      if (savedProcesses) setProcesses(JSON.parse(savedProcesses));
      else if (compId === initialCompany.id) setProcesses(initialProcessList);

      const savedReviews = localStorage.getItem(`sheq_${compId}_reviews`);
      if (savedReviews) setReviews(JSON.parse(savedReviews));
      else if (compId === initialCompany.id) setReviews(initialReviews);
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setCompanySwitchNotice({
      companyName: targetCompany.name,
      industry: targetCompany.industry,
      plan: targetCompany.plan,
      isNew: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleDeleteCompany = (targetCompanyId: string) => {
    setCompanies((prev) => {
      const filtered = prev.filter((c) => c.id !== targetCompanyId);
      const updated = filtered.length > 0 ? filtered : [initialCompany];
      try {
        localStorage.setItem('sheq_companies_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setCompany((prev) => {
      const remaining = companies.filter((c) => c.id !== targetCompanyId);
      const nextComp = remaining.length > 0 ? remaining[0] : initialCompany;
      try {
        localStorage.setItem('sheq_company', JSON.stringify(nextComp));
      } catch {}
      return nextComp;
    });
  };

  const [ncrs, setNcrs] = useState<NCRItem[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${initialCompany.id}_ncrs`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_ncrs');
      return saved ? JSON.parse(saved) : initialNCRs;
    } catch {
      return initialNCRs;
    }
  });

  const [auditRows, setAuditRows] = useState<AuditProcessRow[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${initialCompany.id}_auditRows`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_auditRows');
      return saved ? JSON.parse(saved) : initialAuditRows;
    } catch {
      return initialAuditRows;
    }
  });

  const [hrData, setHrData] = useState<typeof initialHRData>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${initialCompany.id}_hrData`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_hrData');
      return saved ? JSON.parse(saved) : initialHRData;
    } catch {
      return initialHRData;
    }
  });

  const [reviews, setReviews] = useState<ReviewMeeting[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${initialCompany.id}_reviews`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_reviews');
      return saved ? JSON.parse(saved) : initialReviews;
    } catch {
      return initialReviews;
    }
  });

  const [processes, setProcesses] = useState<ProcessControlItem[]>(() => {
    try {
      const savedScoped = localStorage.getItem(`sheq_${initialCompany.id}_processes`);
      if (savedScoped) return JSON.parse(savedScoped);
      const saved = localStorage.getItem('sheq_processes');
      return saved ? JSON.parse(saved) : initialProcessList;
    } catch {
      return initialProcessList;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync to localStorage both globally and company-scoped
  React.useEffect(() => {
    try {
      localStorage.setItem('sheq_activeTab', activeTab);
      localStorage.setItem('sheq_company', JSON.stringify(company));
      localStorage.setItem('sheq_companies_list', JSON.stringify(companies));
      localStorage.setItem('sheq_ncrs', JSON.stringify(ncrs));
      localStorage.setItem('sheq_auditRows', JSON.stringify(auditRows));
      localStorage.setItem('sheq_hrData', JSON.stringify(hrData));
      localStorage.setItem('sheq_reviews', JSON.stringify(reviews));
      localStorage.setItem('sheq_processes', JSON.stringify(processes));

      if (company?.id) {
        localStorage.setItem(`sheq_${company.id}_ncrs`, JSON.stringify(ncrs));
        localStorage.setItem(`sheq_${company.id}_auditRows`, JSON.stringify(auditRows));
        localStorage.setItem(`sheq_${company.id}_hrData`, JSON.stringify(hrData));
        localStorage.setItem(`sheq_${company.id}_reviews`, JSON.stringify(reviews));
        localStorage.setItem(`sheq_${company.id}_processes`, JSON.stringify(processes));
      }
    } catch {
      // ignore storage quota errors
    }
  }, [activeTab, company, companies, ncrs, auditRows, hrData, reviews, processes]);

  // Demo data refresh handler
  const handleLoadDemoData = () => {
    try {
      localStorage.removeItem('sheq_company');
      localStorage.removeItem('sheq_ncrs');
      localStorage.removeItem('sheq_auditRows');
      localStorage.removeItem('sheq_hrData');
      localStorage.removeItem('sheq_reviews');
      localStorage.removeItem('sheq_processes');
      if (company?.id) {
        localStorage.removeItem(`sheq_${company.id}_ncrs`);
        localStorage.removeItem(`sheq_${company.id}_auditRows`);
        localStorage.removeItem(`sheq_${company.id}_hrData`);
        localStorage.removeItem(`sheq_${company.id}_reviews`);
        localStorage.removeItem(`sheq_${company.id}_processes`);
      }
    } catch {}
    setCompany(initialCompany);
    setNcrs(initialNCRs);
    setAuditRows(initialAuditRows);
    setHrData(initialHRData);
    setReviews(initialReviews);
    setProcesses(initialProcessList);
  };

  // NCR handlers
  const handleAddNCR = (newNcr: Partial<NCRItem>) => {
    const item: NCRItem = {
      id: Date.now().toString(),
      ncrNumber: newNcr.ncrNumber || `NCR-2024-00${ncrs.length + 1}`,
      issuedTo: newNcr.issuedTo || 'Quality Dept',
      dateIssued: newNcr.dateIssued || '21-09-2026',
      dueDate: newNcr.dueDate || '05-10-2026',
      daysLeft: newNcr.daysLeft ?? (newNcr.daysToClose || 14),
      openPeriod: newNcr.openPeriod || '1d',
      status: newNcr.status || 'OPEN',
      type: newNcr.type || 'Internal',
      locked: false,
      problemSummary: newNcr.problemSummary,
      description: newNcr.description,
      raisedBy: newNcr.raisedBy,
      daysToClose: newNcr.daysToClose,
      photos: newNcr.photos,
    };
    setNcrs([item, ...ncrs]);
  };

  const handleDeleteNCR = (id: string) => {
    setNcrs(ncrs.filter((n) => n.id !== id));
  };

  // Audit handlers
  const handleAddAuditProcess = (name: string) => {
    const newProcess: AuditProcessRow = {
      id: Date.now().toString(),
      processName: name,
      months: {
        JAN: { status: 'planned', initials: 'JS' },
        APR: { status: 'planned', initials: 'MK' },
      },
      ncrs: '—',
      ofis: '—',
      totalScore: '—',
    };
    setAuditRows([...auditRows, newProcess]);
  };

  const handleUpdateAuditRow = (updatedRow: AuditProcessRow) => {
    setAuditRows(auditRows.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
  };

  const handleReorderAuditRows = (newRows: AuditProcessRow[]) => {
    setAuditRows(newRows);
  };

  const handleDeleteAuditProcess = (id: string) => {
    setAuditRows(auditRows.filter((r) => r.id !== id));
  };

  // HR handlers
  const handleAddDepartment = (name: string) => {
    setHrData({
      ...hrData,
      departments: [...hrData.departments, { name, count: 0 }],
    });
  };

  const handleAddJobTitle = (name: string) => {
    setHrData({
      ...hrData,
      jobTitles: [...hrData.jobTitles, { name, count: 0 }],
    });
  };

  // Management review handlers
  const handleAddReview = (review: ReviewMeeting) => {
    setReviews([review, ...reviews]);
  };

  const handleUpdateReview = (review: ReviewMeeting) => {
    setReviews(reviews.map((r) => (r.id === review.id ? review : r)));
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  // Process control handlers
  const handleAddProcessControl = (proc: ProcessControlItem) => {
    setProcesses([proc, ...processes]);
  };

  const handleUpdateProcessControl = (proc: ProcessControlItem) => {
    setProcesses(processes.map((p) => (p.id === proc.id ? proc : p)));
  };

  const handleDeleteProcessControl = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNavigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    scrollToTop();
  };

  const handleUpdateCompany = (updated: Partial<Company>) => {
    setCompany((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('sheq_company', JSON.stringify(next));
      } catch {}
      return next;
    });
    setCompanies((prev) => {
      const next = prev.map((c) => (c.id === company.id ? { ...c, ...updated } : c));
      try {
        localStorage.setItem('sheq_companies_list', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleUpdateUser = (updated: Partial<AuthUser>) => {
    setCurrentUser((prev) => {
      const nextUser: AuthUser = prev
        ? { ...prev, ...updated }
        : {
            id: 'usr-1',
            name: updated.name || 'NAVEEN .V',
            email: updated.email || 'nv8660970099@gmail.com',
            phone: updated.phone || '+27 82 459 2810',
            role: updated.role || 'SHEQ Quality Lead / Admin',
            companyName: company?.name || 'NK Quality Systems',
          };
      try {
        localStorage.setItem('sheq_auth_user', JSON.stringify(nextUser));
      } catch {}
      return nextUser;
    });
  };

  const renderDashboard = () => (
    <DashboardView
      company={company}
      companies={companies}
      ncrs={ncrs}
      auditRows={auditRows}
      processes={processes}
      onNavigate={handleNavigate}
      onLoadDemoData={handleLoadDemoData}
      onAddCompany={handleAddNewCompany}
      onCompanyChange={handleSwitchCompany}
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'policy-objectives':
        return <PolicyObjectivesView company={company} />;
      case 'process-control':
        return (
          <ProcessControlView
            company={company}
            processes={processes}
            onAddProcess={handleAddProcessControl}
            onUpdateProcess={handleUpdateProcessControl}
            onDeleteProcess={handleDeleteProcessControl}
          />
        );
      case 'hr-management':
        return (
          <HRManagementView
            company={company}
            hrData={hrData}
            onAddDepartment={handleAddDepartment}
            onAddJobTitle={handleAddJobTitle}
          />
        );
      case 'supplier-management':
        return <SupplierManagementView company={company} />;
      case 'customer-satisfaction':
        return <CustomerSatisfactionView company={company} />;
      case 'calibration-control':
        return <CalibrationControlView company={company} />;
      case 'audit-management':
        return (
          <AuditManagementView
            company={company}
            rows={auditRows}
            onAddProcess={handleAddAuditProcess}
            onDeleteProcess={handleDeleteAuditProcess}
            onUpdateRow={handleUpdateAuditRow}
            onReorderRows={handleReorderAuditRows}
          />
        );
      case 'ncr-management':
        return (
          <NCRManagementView
            company={company}
            ncrs={ncrs}
            onAddNCR={handleAddNCR}
            onDeleteNCR={handleDeleteNCR}
          />
        );
      case 'management-review':
        return (
          <ManagementReviewView
            company={company}
            reviews={reviews}
            onAddReview={handleAddReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
          />
        );
      case 'profile':
        return (
          <ProfileView
            company={company}
            companies={companies}
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onUpdateCompany={handleUpdateCompany}
            onAddCompany={handleAddNewCompany}
            onCompanyChange={handleSwitchCompany}
            onLogout={handleLogout}
          />
        );
      case 'settings':
        return (
          <SettingsView
            company={company}
            companies={companies}
            onUpdateCompany={handleUpdateCompany}
            onAddCompany={handleAddNewCompany}
            onCompanyChange={handleSwitchCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        );
      case 'billing-plan':
        return (
          <BillingPlanView
            company={company}
            onUpdateCompany={handleUpdateCompany}
            onNavigate={handleNavigate}
          />
        );
      case 'document-control':
        return <DocumentControlView company={company} />;
      case 'tutorial-centre':
      case 'video-tutorials':
        return <TutorialCentreView company={company} onNavigate={handleNavigate} />;
      case 'iso-toolkit':
      case 'qms-guidelines':
      case 'help-support':
        return <ResourcesView company={company} tab={activeTab} />;
      default:
        return renderDashboard();
    }
  };

  // If user is logged out, present the Login & Magic Link screen (requires email)
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} defaultEmail="" />;
  }

  // 1st Page: Mode Selection Page (Matches Image 1)
  if (sessionMode === 'selection') {
    return (
      <SessionModeSelectionView
        user={currentUser}
        company={company}
        loginNotice={loginAlertNotice}
        onDismissNotice={() => setLoginAlertNotice(null)}
        onSelectMode={(mode) => {
          if (mode === 'consultant' || mode === 'auditor') {
            setSessionMode(mode);
            sessionStorage.setItem('sheq_session_mode', mode);
          } else {
            setSessionMode('management');
            sessionStorage.setItem('sheq_session_mode', 'management');
            setActiveTab('dashboard');
          }
          scrollToTop();
        }}
        onNavigateTutorial={() => {
          setSessionMode('management');
          handleNavigate('tutorial-centre');
        }}
      />
    );
  }

  // 2nd Page: Consultant Dashboard (Matches Image 2)
  if (sessionMode === 'consultant') {
    return (
      <ConsultantDashboardView
        user={currentUser}
        company={company}
        onBackToModeSelection={() => {
          setSessionMode('selection');
          sessionStorage.setItem('sheq_session_mode', 'selection');
          scrollToTop();
        }}
        onNavigateTutorial={() => {
          setSessionMode('management');
          handleNavigate('tutorial-centre');
        }}
      />
    );
  }

  // 3rd Page: Auditor Dashboard (Matches Image 3)
  if (sessionMode === 'auditor') {
    return (
      <AuditorDashboardView
        user={currentUser}
        company={company}
        onBackToModeSelection={() => {
          setSessionMode('selection');
          sessionStorage.setItem('sheq_session_mode', 'selection');
          scrollToTop();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Top App Bar */}
      <div className="md:hidden bg-[#0c1527] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">SHEQ</span>
            <span className="font-extrabold text-sm tracking-tight text-orange-500">Street</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">{company?.name || 'nk'}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            {company?.plan || 'TRIAL'}
          </span>
        </div>
      </div>

      {/* Sidebar: persistent on desktop, drawer on mobile */}
      <div
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 w-64 flex-shrink-0 transition-transform`}
      >
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          company={company}
          companies={companies}
          currentCompany={company}
          onCompanyChange={handleSwitchCompany}
          onAddCompany={handleAddNewCompany}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          user={currentUser}
          onLogout={handleLogout}
          onSwitchMode={() => {
            setSessionMode('selection');
            sessionStorage.setItem('sheq_session_mode', 'selection');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
        />
      )}

      {/* Main Content View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Floating Login Notification Toast in Main App */}
      {loginAlertNotice && showLoginToast && sessionMode === 'management' && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900/95 border border-blue-500/50 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Sign-In Alert Sent</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <button
                type="button"
                onClick={() => setShowLoginToast(false)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-300 text-[11px] mt-1 leading-snug">
              Confirmation message dispatched to{' '}
              <strong className="text-sky-300">{loginAlertNotice.email}</strong>
            </p>
            {loginAlertNotice.previewUrl && (
              <a
                href={loginAlertNotice.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold mt-2 underline cursor-pointer"
              >
                <span>View Dispatched Email</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Floating Company Profile Switch / Created Toast */}
      {companySwitchNotice && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-slate-900/95 border border-emerald-500/50 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
            <Building className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{companySwitchNotice.isNew ? 'Company Profile Created' : 'Workspace Switched'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <button
                type="button"
                onClick={() => setCompanySwitchNotice(null)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-200 text-xs mt-1 font-semibold leading-snug">
              Active company: <span className="text-emerald-400 font-bold">{companySwitchNotice.companyName}</span>
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
              All pages, metrics, audit schedules, and modules are now configured for this profile.
            </p>
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {companySwitchNotice.plan || 'ACTIVE'}
              </span>
              {companySwitchNotice.industry && (
                <span className="truncate">{companySwitchNotice.industry}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Qoo Mascot Assistant */}
      <QooAssistant />
    </div>
  );
}

export default App;
