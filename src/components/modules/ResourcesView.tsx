import React from 'react';
import {
  FileCode,
  BookOpen,
  Video,
  LifeBuoy,
  ExternalLink,
  Download,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Company, NavigationTab } from '../../types';

interface ResourcesViewProps {
  company: Company;
  tab: NavigationTab;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ company, tab }) => {
  const getResourceContent = () => {
    switch (tab) {
      case 'iso-toolkit':
        return {
          title: 'ISO 9001:2015 Implementation Toolkit',
          subtitle: 'Templates, standard clause checklists, risk matrix calculators, and audit readiness roadmaps.',
          items: [
            {
              title: 'Mandatory Procedures Pack (ISO 9001)',
              desc: 'Control of Documents, Records, Internal Audit, and Non-Conforming Outputs.',
              type: 'DOCX / PDF',
            },
            {
              title: 'Clause-by-Clause Compliance Cross-Reference Matrix',
              desc: 'Detailed mapping of clauses 4 through 10 against operational evidence.',
              type: 'XLSX',
            },
            {
              title: 'Management Review Meeting Minutes Agenda Template',
              desc: 'Complete ISO-compliant agenda covering all 7 mandatory input categories.',
              type: 'DOCX',
            },
          ],
        };
      case 'video-tutorials':
        return {
          title: 'SHEQ Street Video Tutorials',
          subtitle: 'Step-by-step masterclasses on mastering QMS modules and passing audits.',
          items: [
            {
              title: 'Getting Started: Setting up your ISO 9001 Scope & Departments',
              desc: '12 min video guide on configuring your company profile and HR organograms.',
              type: 'VIDEO (1080p)',
            },
            {
              title: 'NCR Workflow & Root Cause Analysis (5-Whys / Fishbone)',
              desc: '18 min video tutorial on closing non-conformances with corrective action plans.',
              type: 'VIDEO (1080p)',
            },
            {
              title: 'Building your Annual Audit Matrix & Calculating Auditor Scores',
              desc: '15 min video guide on scheduling internal audits and recording completion rates.',
              type: 'VIDEO (1080p)',
            },
          ],
        };
      case 'help-support':
        return {
          title: 'Help & Priority Support',
          subtitle: 'Get in touch with ISO 9001 lead auditors and SHEQ technical support engineers.',
          items: [
            {
              title: 'Live Chat with Quality Support Specialist',
              desc: 'Average response time under 5 minutes during business hours.',
              type: 'INSTANT CHAT',
            },
            {
              title: 'Request a Mock Audit Consultation',
              desc: 'Schedule a 45-minute virtual review of your audit matrix and open NCRs.',
              type: 'CALENDAR BOOKING',
            },
          ],
        };
      case 'qms-guidelines':
      default:
        return {
          title: 'QMS Guidelines & Best Practices',
          subtitle: 'Standard operating principles for maintaining high audit readiness all year round.',
          items: [
            {
              title: 'Continual Improvement Guide (Clause 10.3)',
              desc: 'Systematic approaches to using OFIs and NCR trends to enhance operational performance.',
              type: 'GUIDE',
            },
            {
              title: 'Calibration Tolerance & Traceability Standards',
              desc: 'Guidelines for setting calibration intervals and maintaining SANAS / ISO 17025 certificates.',
              type: 'GUIDE',
            },
          ],
        };
    }
  };

  const content = getResourceContent();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{content.subtitle}</p>
      </div>

      <div className="space-y-4">
        {content.items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {item.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>

            <button
              onClick={() => alert(`Accessing ${item.title}...`)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto flex-shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Access Resource</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
