import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Search,
  Play,
  Pause,
  X,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  FileText,
  Users,
  Target,
  Shield,
  BarChart3,
  Check,
} from 'lucide-react';
import { Company, NavigationTab } from '../../types';

interface TutorialCentreViewProps {
  company: Company;
  onNavigate?: (tab: NavigationTab) => void;
}

interface TutorialScene {
  id: string;
  startSec: number;
  endSec: number;
  stepNumber: number;
  title: string;
  subtitle: string;
  voiceScript: string;
  uiView: 'dashboard' | 'document-control' | 'hr-management' | 'policy-objectives';
  highlightFocus: string;
  cursorTarget?: { x: number; y: number; label: string };
}

interface VideoTutorial {
  id: string;
  category: 'Getting Started' | 'Document Control' | 'HR Management' | 'Policy, Objectives & COTO';
  title: string;
  description: string;
  duration: string;
  durationSec: number;
  bullets?: string[];
  thumbnailType: 'laptop' | 'slide';
  targetTab?: NavigationTab;
  scenes: TutorialScene[];
}

const TUTORIAL_VIDEOS: VideoTutorial[] = [
  {
    id: 'vid-intro',
    category: 'Getting Started',
    title: 'Introducing the SHEQ Street App',
    description:
      'SHEQ Street is a modern, cloud-based Quality Management System designed to streamline ISO 9001 compliance, track real-time audit readiness, and eliminate paper-based QMS overhead.',
    duration: '00:48',
    durationSec: 48,
    thumbnailType: 'laptop',
    targetTab: 'dashboard',
    scenes: [
      {
        id: 's1',
        startSec: 0,
        endSec: 12,
        stepNumber: 1,
        title: 'Welcome to SHEQ Street QMS',
        subtitle: 'Enterprise Cloud Quality Management & ISO 9001 Compliance',
        voiceScript:
          'Welcome to SHEQ Street, your integrated cloud Quality Management System. SHEQ Street empowers your organization to achieve and maintain ISO 9001 compliance, replacing paperwork with a modern, connected compliance workspace.',
        uiView: 'dashboard',
        highlightFocus: 'Overview & Header Navigation',
        cursorTarget: { x: 35, y: 25, label: 'Workspaces & Compliance Status' },
      },
      {
        id: 's2',
        startSec: 12,
        endSec: 24,
        stepNumber: 2,
        title: 'Real-Time Audit Readiness Scorecard',
        subtitle: 'Continuous Telemetry & Compliance Evaluation',
        voiceScript:
          'At the core of your dashboard is the real-time Audit Readiness gauge. Continuous telemetry evaluates your scheduled internal audits, open non-conformance reports, and certified calibration instruments, providing an accurate readiness score.',
        uiView: 'dashboard',
        highlightFocus: 'Audit Readiness Gauge (85%)',
        cursorTarget: { x: 50, y: 40, label: '85% Audit Readiness Target' },
      },
      {
        id: 's3',
        startSec: 24,
        endSec: 36,
        stepNumber: 3,
        title: 'Interconnected Compliance Modules',
        subtitle: 'Seamless Cross-Module Data & Traceability',
        voiceScript:
          'From Document Control and Calibration registers to Customer Satisfaction ratings and Management Reviews, all modules interconnect seamlessly. Operational evidence flows directly into your annual ISO compliance matrix.',
        uiView: 'dashboard',
        highlightFocus: 'Live Module Summaries',
        cursorTarget: { x: 70, y: 65, label: '10 Interconnected Modules' },
      },
      {
        id: 's4',
        startSec: 36,
        endSec: 48,
        stepNumber: 4,
        title: 'Qoo AI Assistant & Audit Exports',
        subtitle: 'Automated Audit Preparation & Executive Reporting',
        voiceScript:
          'Qoo, your SHEQ AI assistant, actively monitors due dates and alerts your team before audits take place. You can generate one-click executive audit summaries ready for external certification bodies.',
        uiView: 'dashboard',
        highlightFocus: 'AI Assistant & Audit Output',
        cursorTarget: { x: 88, y: 85, label: 'Qoo Compliance Assistant' },
      },
    ],
  },
  {
    id: 'vid-getting-started',
    category: 'Getting Started',
    title: 'Getting started on the SHEQ Street App',
    description:
      'This video is a walkthrough on how to configure your company profile, understand sidebar modules, and initiate compliance workflows.',
    duration: '00:48',
    durationSec: 48,
    thumbnailType: 'slide',
    targetTab: 'dashboard',
    bullets: [
      'The modern platform that makes ISO 9001:2015 compliance effortless',
      'Configuring workspace & company details',
      'Understanding the live audit readiness gauge',
    ],
    scenes: [
      {
        id: 'gs1',
        startSec: 0,
        endSec: 12,
        stepNumber: 1,
        title: 'Workspace Configuration & Company Scope',
        subtitle: 'Establishing Your ISO 9001 Organizational Scope',
        voiceScript:
          'In this walkthrough, we configure your organization on SHEQ Street. First, define your corporate legal entity, operational scope, and ISO 9001 boundary in your company settings.',
        uiView: 'dashboard',
        highlightFocus: 'Company Workspace Switcher',
        cursorTarget: { x: 25, y: 20, label: 'Select Workspace' },
      },
      {
        id: 'gs2',
        startSec: 12,
        endSec: 24,
        stepNumber: 2,
        title: 'Navigating QMS Core Modules',
        subtitle: 'Operations, Core Registers, and Resource Libraries',
        voiceScript:
          'The navigation sidebar categorizes your modules into General Operations, Core QMS Modules, and Educational Resources. You can switch between active workspaces with a single click.',
        uiView: 'dashboard',
        highlightFocus: 'QMS Modules Sidebar',
        cursorTarget: { x: 18, y: 50, label: 'Sidebar Modules' },
      },
      {
        id: 'gs3',
        startSec: 24,
        endSec: 36,
        stepNumber: 3,
        title: 'Role Assignments & User Access',
        subtitle: 'Lead Auditor, Quality Lead, and Department Heads',
        voiceScript:
          'Assign user responsibilities such as Lead Auditor, Quality Manager, and Department Supervisors. Each role receives tailored permissions to preserve data integrity and accountability.',
        uiView: 'dashboard',
        highlightFocus: 'User Profile & Roles',
        cursorTarget: { x: 80, y: 30, label: 'Role Permissions' },
      },
      {
        id: 'gs4',
        startSec: 36,
        endSec: 48,
        stepNumber: 4,
        title: 'Launching Your First Compliance Cycle',
        subtitle: 'Baseline Verification & Readiness Tracking',
        voiceScript:
          'With your company profile established, you are ready to register procedures and schedule your first internal audit. Your audit readiness score will automatically track progress.',
        uiView: 'dashboard',
        highlightFocus: 'Audit Readiness Tracking',
        cursorTarget: { x: 50, y: 55, label: 'First Compliance Cycle' },
      },
    ],
  },
  {
    id: 'vid-doc-control',
    category: 'Document Control',
    title: 'Document Control Module - SHEQ Street App',
    description:
      'In this video we look at how to navigate the Document Control Module on the SHEQ Street App, create standard operating procedures, maintain the master QMS documents register, and manage version histories.',
    duration: '00:48',
    durationSec: 48,
    thumbnailType: 'slide',
    targetTab: 'document-control',
    bullets: ['creating procedures', 'QMS documents register', 'uploading documents'],
    scenes: [
      {
        id: 'dc1',
        startSec: 0,
        endSec: 12,
        stepNumber: 1,
        title: 'Control of Documented Information (Clause 7.5)',
        subtitle: 'Ensuring Approved, Traceable Quality Documents',
        voiceScript:
          'Document Control is vital for ISO 9001:2015 Clause 7.5 compliance. The Document Control Module ensures all standard operating procedures, policies, and records are properly versioned and reviewed.',
        uiView: 'document-control',
        highlightFocus: 'Document Register Header',
        cursorTarget: { x: 30, y: 22, label: 'Clause 7.5 Register' },
      },
      {
        id: 'dc2',
        startSec: 12,
        endSec: 24,
        stepNumber: 2,
        title: 'Master Document Index & Metadata',
        subtitle: 'Reference Codes, Revision Numbers, and Owners',
        voiceScript:
          'Here in the Master Document Register, every procedure is indexed with a unique reference code, revision number, effective date, and assigned process owner.',
        uiView: 'document-control',
        highlightFocus: 'Document Register Table (NK-DC-001 to NK-DC-007)',
        cursorTarget: { x: 45, y: 45, label: 'Document Index Rows' },
      },
      {
        id: 'dc3',
        startSec: 24,
        endSec: 36,
        stepNumber: 3,
        title: 'Creating & Registering New Procedures',
        subtitle: 'Controlled Upload & Mandatory Approval Sign-Off',
        voiceScript:
          'To register a new procedure, click Add Document. Enter the procedure title, category, and review interval. The system enforces authorized sign-offs before any revision goes live.',
        uiView: 'document-control',
        highlightFocus: 'Create Document Action',
        cursorTarget: { x: 82, y: 22, label: 'Click Add Document' },
      },
      {
        id: 'dc4',
        startSec: 36,
        endSec: 48,
        stepNumber: 4,
        title: 'Automated Version Archive & Audit History',
        subtitle: 'Preventing Unintended Use of Obsolete Documents',
        voiceScript:
          'When new revisions are published, obsolete versions are immediately archived with permanent timestamped audit trails, guaranteeing full compliance during certification audits.',
        uiView: 'document-control',
        highlightFocus: 'Revision History & Audit Trail',
        cursorTarget: { x: 60, y: 70, label: 'Approved Revision Trail' },
      },
    ],
  },
  {
    id: 'vid-hr-mgmt',
    category: 'HR Management',
    title: 'HR Management Module - SHEQ Street App',
    description:
      'In this video we look at how to navigate the HR Management Module on the SHEQ Street App, setup company departments, define job titles, maintain employee registers, and track organograms.',
    duration: '00:48',
    durationSec: 48,
    thumbnailType: 'slide',
    targetTab: 'hr-management',
    bullets: [
      'company departments',
      'job titles/positions',
      'employee register',
      'organogram',
      'training records',
    ],
    scenes: [
      {
        id: 'hr1',
        startSec: 0,
        endSec: 12,
        stepNumber: 1,
        title: 'Competence & Organizational Roles (Clause 7.2)',
        subtitle: 'Structuring People & Competence for Quality Delivery',
        voiceScript:
          'ISO 9001 requires organizations to establish necessary personnel competence and maintain verifiable training records. The HR Management Module structures your organizational capabilities.',
        uiView: 'hr-management',
        highlightFocus: 'HR Overview & Metrics',
        cursorTarget: { x: 30, y: 25, label: 'Competence Management' },
      },
      {
        id: 'hr2',
        startSec: 12,
        endSec: 24,
        stepNumber: 2,
        title: 'Departments & Position Architecture',
        subtitle: 'Defining Operational Units and Job Specifications',
        voiceScript:
          'Define operational departments such as Quality Assurance, Production, Logistics, and Administration. Assign standardized job titles with required educational and skill baselines.',
        uiView: 'hr-management',
        highlightFocus: 'Department & Job Title Cards',
        cursorTarget: { x: 45, y: 48, label: 'Configure Departments' },
      },
      {
        id: 'hr3',
        startSec: 24,
        endSec: 36,
        stepNumber: 3,
        title: 'Employee Register & Interactive Organogram',
        subtitle: 'Reporting Lines and Authority Structures',
        voiceScript:
          'Maintain a live employee register with position assignments, line managers, and clear reporting hierarchies, providing auditors with an up-to-date organizational organogram.',
        uiView: 'hr-management',
        highlightFocus: 'Employee Register & Hierarchy',
        cursorTarget: { x: 65, y: 55, label: 'Organogram Hierarchy' },
      },
      {
        id: 'hr4',
        startSec: 36,
        endSec: 48,
        stepNumber: 4,
        title: 'Training Records & Qualification Matrix',
        subtitle: 'Tracking Compliance Certifications and Renewals',
        voiceScript:
          'Track internal safety and quality certifications, expiration dates, and competency evaluations to guarantee that all personnel performing quality-critical work are fully qualified.',
        uiView: 'hr-management',
        highlightFocus: 'Training Matrix & Certification Log',
        cursorTarget: { x: 75, y: 75, label: '100% Certified Personnel' },
      },
    ],
  },
  {
    id: 'vid-policy-coto',
    category: 'Policy, Objectives & COTO',
    title: 'Policy, Objectives & COTO Module - SHEQ Street App',
    description:
      'In this video we look at how to configure Quality Policy, Measurable Objectives and Context of the Organization (COTO) to meet ISO 9001:2015 Clause 4 & 5 compliance requirements.',
    duration: '00:48',
    durationSec: 48,
    thumbnailType: 'slide',
    targetTab: 'policy-objectives',
    bullets: [
      'quality policy statement',
      'measurable objectives & targets',
      'internal & external issues (COTO)',
      'interested parties matrix',
    ],
    scenes: [
      {
        id: 'po1',
        startSec: 0,
        endSec: 12,
        stepNumber: 1,
        title: 'Quality Policy Formulation (Clause 5.2)',
        subtitle: 'Top Management Commitment & Quality Framework',
        voiceScript:
          'Top management must establish, review, and communicate an official Quality Policy. In this module, author and approve your policy statement, ensuring alignment with your strategic objectives.',
        uiView: 'policy-objectives',
        highlightFocus: 'Quality Policy Statement',
        cursorTarget: { x: 40, y: 30, label: 'Official Quality Policy' },
      },
      {
        id: 'po2',
        startSec: 12,
        endSec: 24,
        stepNumber: 2,
        title: 'Measurable Quality Objectives (Clause 6.2)',
        subtitle: 'SMART KPIs, Milestone Targets, and Owners',
        voiceScript:
          'Establish measurable SMART quality objectives across all departments. Each objective features target completion dates, responsible owners, and continuous milestone tracking.',
        uiView: 'policy-objectives',
        highlightFocus: 'Measurable Objectives Register',
        cursorTarget: { x: 50, y: 55, label: 'Objectives Progress' },
      },
      {
        id: 'po3',
        startSec: 24,
        endSec: 36,
        stepNumber: 3,
        title: 'Context of the Organization (Clause 4.1)',
        subtitle: 'Internal & External Issues SWOT/PESTLE Analysis',
        voiceScript:
          'Under Clause 4.1, analyze internal and external factors influencing quality performance using structured SWOT and PESTLE methodologies, linking risks directly to mitigation plans.',
        uiView: 'policy-objectives',
        highlightFocus: 'COTO SWOT & PESTLE Matrix',
        cursorTarget: { x: 60, y: 40, label: 'COTO Strategic Context' },
      },
      {
        id: 'po4',
        startSec: 36,
        endSec: 48,
        stepNumber: 4,
        title: 'Needs of Interested Parties (Clause 4.2)',
        subtitle: 'Stakeholders, Legal Mandates, and Mitigation Controls',
        voiceScript:
          'Map the requirements of customers, regulatory authorities, and suppliers. Document their expectations and link them to operational controls for complete auditor satisfaction.',
        uiView: 'policy-objectives',
        highlightFocus: 'Interested Parties Register',
        cursorTarget: { x: 75, y: 70, label: 'Stakeholder Matrix' },
      },
    ],
  },
];

const CATEGORIES = [
  'All',
  'Getting Started',
  'Document Control',
  'HR Management',
  'Policy, Objectives & COTO',
] as const;

export const TutorialCentreView: React.FC<TutorialCentreViewProps> = ({ company, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideo, setActiveVideo] = useState<VideoTutorial | null>(null);

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceType, setVoiceType] = useState<'female' | 'male'>('female');
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasStartedPlaybackOnce, setHasStartedPlaybackOnce] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const lastSpokenSceneRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          setAvailableVoices(v);
        }
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Web Audio API helper for startup & chapter change acoustic chimes
  const playChimeTone = useCallback(() => {
    try {
      if (isMuted) return;
      if (!audioCtxRef.current && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Play soft dual harmonic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5
      osc2.frequency.setValueAtTime(783.99, now); // G5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Audio context might be restricted before gesture
    }
  }, [isMuted]);

  // Current Scene Calculation
  const currentScene = useMemo(() => {
    if (!activeVideo) return null;
    return (
      activeVideo.scenes.find(
        (s) => currentTimeSec >= s.startSec && currentTimeSec < s.endSec
      ) || activeVideo.scenes[activeVideo.scenes.length - 1]
    );
  }, [activeVideo, currentTimeSec]);

  // Reliable Audio speech synthesis with browser unlocking
  const speakSceneScript = useCallback(
    (text: string, force = false) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      try {
        // Unlock Chromium speech engine state
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();

        if ((isMuted || !aiVoiceEnabled) && !force) {
          setIsSpeakingNow(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceSpeed;
        utterance.pitch = voiceType === 'female' ? 1.05 : 0.92;
        utterance.volume = isMuted ? 0 : 1.0;

        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => {
            const name = v.name.toLowerCase();
            if (voiceType === 'female') {
              return (
                v.lang.startsWith('en') &&
                (name.includes('female') ||
                  name.includes('zira') ||
                  name.includes('samantha') ||
                  name.includes('jenny') ||
                  name.includes('natural') ||
                  name.includes('google uk english female'))
              );
            } else {
              return (
                v.lang.startsWith('en') &&
                (name.includes('male') ||
                  name.includes('david') ||
                  name.includes('guy') ||
                  name.includes('ryan') ||
                  name.includes('george') ||
                  name.includes('google us english'))
              );
            }
          }) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeakingNow(true);
        utterance.onend = () => setIsSpeakingNow(false);
        utterance.onerror = () => setIsSpeakingNow(false);

        window.speechSynthesis.speak(utterance);
        playChimeTone();
      } catch (e) {
        console.warn('Speech synthesis dispatch note:', e);
      }
    },
    [availableVoices, voiceSpeed, voiceType, isMuted, aiVoiceEnabled, playChimeTone]
  );

  // Chrome speech watchdog keep-alive
  useEffect(() => {
    if (isPlaying && isSpeakingNow) {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 9000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isSpeakingNow]);

  // Smooth 60fps Playback Time Loop
  useEffect(() => {
    if (!isPlaying || !activeVideo) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTimestampRef.current = performance.now();

    const loop = (timestamp: number) => {
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTimeSec((prev) => {
        const next = prev + deltaSec * voiceSpeed;
        if (next >= activeVideo.durationSec) {
          setIsPlaying(false);
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setIsSpeakingNow(false);
          return activeVideo.durationSec;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, activeVideo, voiceSpeed]);

  // Trigger speech on scene changes while playing
  useEffect(() => {
    if (!isPlaying || !currentScene || !activeVideo) return;

    if (lastSpokenSceneRef.current !== currentScene.id) {
      lastSpokenSceneRef.current = currentScene.id;
      speakSceneScript(currentScene.voiceScript);
    }
  }, [currentScene, isPlaying, activeVideo, speakSceneScript]);

  // Main Canvas 60FPS Video Graphics Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeVideo || !currentScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res internal canvas dimensions for 16:9 crisp rendering
    const w = 1280;
    const h = 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // 1. Deep Cinematic Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#060c18');
    bgGrad.addColorStop(0.5, '#0b162a');
    bgGrad.addColorStop(1, '#050a14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Animated 3D Cyber Perspective Grid
    ctx.save();
    const horizonY = h * 0.62;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1.5;

    // Perspective vanishing lines
    for (let x = -w * 0.5; x <= w * 1.5; x += 110) {
      ctx.beginPath();
      ctx.moveTo(w / 2, horizonY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Drifting horizontal grid lines
    const gridOffset = ((currentTimeSec * 50) % 36);
    for (let yOffset = 0; yOffset < h - horizonY; yOffset += 32) {
      const lineY = horizonY + yOffset + gridOffset * (yOffset / (h - horizonY + 1));
      if (lineY <= h) {
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Floating Ambient Particles
    ctx.save();
    for (let i = 0; i < 28; i++) {
      const px = (Math.sin(i * 99 + currentTimeSec * 0.2) * 0.5 + 0.5) * w;
      const py = (Math.cos(i * 33 + currentTimeSec * 0.15) * 0.5 + 0.5) * h;
      const rad = (i % 3) + 1.2;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.22)';
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Video Header HUD Watermark
    ctx.save();
    // SHEQ Street Brand Pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(40, 30, 220, 42, 10);
    ctx.fill();
    ctx.stroke();

    // Orange 'S' Icon
    const logoGrad = ctx.createLinearGradient(52, 38, 76, 62);
    logoGrad.addColorStop(0, '#f97316');
    logoGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = logoGrad;
    ctx.beginPath();
    ctx.arc(62, 51, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 62, 51);

    // SHEQ Street Text
    ctx.textAlign = 'left';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SHEQ Street QMS', 84, 47);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ISO 9001:2015 COMPLIANCE', 84, 61);

    // Live HD Recording or Paused Indicator
    if (isPlaying) {
      const recDotAlpha = Math.sin(currentTimeSec * 5) * 0.35 + 0.65;
      ctx.fillStyle = `rgba(239, 68, 68, ${recDotAlpha})`;
      ctx.beginPath();
      ctx.arc(w - 230, 51, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#f87171';
      ctx.fillText('● LIVE HD 1080P 60FPS', w - 215, 55);
    } else {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.beginPath();
      ctx.arc(w - 230, 51, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('⏸ VIDEO PAUSED', w - 215, 55);
    }

    // Voice Narration Pill
    ctx.fillStyle = isSpeakingNow ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.8)';
    ctx.strokeStyle = isSpeakingNow ? '#10b981' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(w - 450, 32, 190, 38, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isSpeakingNow ? '#34d399' : '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(isSpeakingNow ? '🔊 AI VOICE SPEAKING' : '🎙️ AI VOICE READY', w - 435, 55);
    ctx.restore();

    // 5. Center Simulated Application Workspace Window
    const winX = w * 0.07;
    const winY = h * 0.14;
    const winW = w * 0.86;
    const winH = h * 0.62;

    ctx.save();
    // Window Outer Shadow & Border
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = 'rgba(12, 22, 42, 0.95)';
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, winH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Window Titlebar
    ctx.fillStyle = 'rgba(15, 27, 52, 0.98)';
    ctx.beginPath();
    ctx.roundRect(winX, winY, winW, 44, [16, 16, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.beginPath();
    ctx.moveTo(winX, winY + 44);
    ctx.lineTo(winX + winW, winY + 44);
    ctx.stroke();

    // 3 macOS window control dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(winX + 22, winY + 22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(winX + 40, winY + 22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(winX + 58, winY + 22, 6, 0, Math.PI * 2);
    ctx.fill();

    // Window Title
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.fillText(`${company.name} QMS Workspace — Chapter ${currentScene.stepNumber}: ${currentScene.title}`, winX + 80, winY + 26);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText(`Focus: [${currentScene.highlightFocus}]`, winX + winW - 20, winY + 26);

    // Dynamic Category Stage Graphics inside Window
    const sceneProgress = Math.min(
      Math.max((currentTimeSec - currentScene.startSec) / (currentScene.endSec - currentScene.startSec || 1), 0),
      1
    );

    const bodyX = winX + 24;
    const bodyY = winY + 60;
    const bodyW = winW - 48;
    const bodyH = winH - 76;

    // =========================================================================
    // DYNAMIC PICTURE DISPLAY — CHANGES SYNCHRONOUSLY AS VOICE TELLS CONTENT
    // =========================================================================
    const vidId = activeVideo.id;
    const step = currentScene.stepNumber;

    // Smooth scene transition overlay (subtle crossfade when scene begins)
    if (sceneProgress < 0.15) {
      ctx.save();
      const fadeAlpha = (1 - sceneProgress / 0.15) * 0.4;
      ctx.fillStyle = `rgba(15, 23, 42, ${fadeAlpha})`;
      ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
      ctx.restore();
    }

    // Outer stage viewport box
    ctx.fillStyle = 'rgba(11, 19, 36, 0.7)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bodyX, bodyY, bodyW, bodyH, 12);
    ctx.fill();
    ctx.stroke();

    // Helper: Draw Chapter Topic Banner
    const drawSceneHeader = (topic: string, sub: string, badgeText: string, badgeColor: string) => {
      ctx.fillStyle = 'rgba(15, 26, 48, 0.9)';
      ctx.beginPath();
      ctx.roundRect(bodyX + 16, bodyY + 14, bodyW - 32, 46, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.stroke();

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(topic, bodyX + 32, bodyY + 34);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(sub, bodyX + 32, bodyY + 49);

      // Category Pill
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = badgeColor;
      ctx.textAlign = 'right';
      ctx.fillText(`[ ${badgeText} ]`, bodyX + bodyW - 36, bodyY + 41);
      ctx.textAlign = 'left';
    };

    // -------------------------------------------------------------------------
    // VIDEO 1: Introducing the SHEQ Street App (vid-intro)
    // -------------------------------------------------------------------------
    if (vidId === 'vid-intro' || (activeVideo.category === 'Getting Started' && vidId !== 'vid-getting-started')) {
      if (step === 1) {
        // SCENE 1: Welcome to SHEQ Street QMS (Cloud Architecture & Paperless Transformation)
        drawSceneHeader(
          '1. Welcome to SHEQ Street QMS — Modern Cloud Architecture',
          'Eliminate paper-based overhead with integrated cloud ISO 9001 compliance',
          'CLAUSE 4 & 5 OVERVIEW',
          '#38bdf8'
        );

        // Left Column: Traditional Paper QMS vs SHEQ Street Cloud
        const colW = (bodyW - 48) / 2;
        const leftX = bodyX + 16;
        const colY = bodyY + 72;

        // Legacy Box
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(leftX, colY, colW, 100, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#f87171';
        ctx.fillText('❌ Legacy Paper-Based QMS Challenges:', leftX + 16, colY + 24);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('• Bulky physical lever-arch binders & misplaced records', leftX + 16, colY + 44);
        ctx.fillText('• Untracked revisions & obsolete forms used on floor', leftX + 16, colY + 64);
        ctx.fillText('• Weeks of manual preparation required before certification audits', leftX + 16, colY + 84);

        // Modern Cloud Box
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(leftX, colY + 112, colW, 110, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('🌟 SHEQ Street Cloud QMS Workspace:', leftX + 16, colY + 136);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('✓ Centralized ISO 9001:2015 digital compliance registers', leftX + 16, colY + 156);
        ctx.fillText('✓ Automatic version archiving, revision locking, and audit sign-off', leftX + 16, colY + 176);
        ctx.fillText('✓ 100% cloud backup with instant auditor guest access portal', leftX + 16, colY + 196);

        // Right Column: Cloud Architecture Diagram
        const rightX = leftX + colW + 16;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.roundRect(rightX, colY, colW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('INTEGRATED CLOUD PLATFORM ARCHITECTURE', rightX + 16, colY + 26);

        // 3 Cloud Node Cards
        const nodes = [
          { title: 'Digital Document Vault', desc: 'SOPs, Policies & Clause 7.5 Records', icon: '📄' },
          { title: 'Real-Time Audit Telemetry', desc: 'NCRs, Calibrations & Schedule Tracker', icon: '⚡' },
          { title: 'Certification Dossier Engine', desc: 'One-Click SANAS/ISO Audit Generation', icon: '🔒' },
        ];
        nodes.forEach((node, idx) => {
          const nY = colY + 40 + idx * 56;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.beginPath();
          ctx.roundRect(rightX + 16, nY, colW - 32, 48, 6);
          ctx.fill();
          ctx.stroke();
          ctx.font = '16px sans-serif';
          ctx.fillText(node.icon, rightX + 26, nY + 30);
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(node.title, rightX + 54, nY + 20);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(node.desc, rightX + 54, nY + 36);
        });
      } else if (step === 2) {
        // SCENE 2: Real-Time Audit Readiness Scorecard
        drawSceneHeader(
          '2. Real-Time Audit Readiness Scorecard (85% Target Met)',
          'Continuous evaluation of internal audits, open NCRs, and calibration',
          'TELEMETRY ENGINE',
          '#10b981'
        );

        const cardY = bodyY + 72;
        // Left: Big Radial Gauge
        const dialCenterX = bodyX + 160;
        const dialCenterY = cardY + 110;
        const dialRad = 76;

        ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(dialCenterX, dialCenterY, dialRad, 0, Math.PI * 2);
        ctx.stroke();

        const curPct = Math.min(Math.floor(sceneProgress * 85 * 1.2), 85);
        const startAng = -Math.PI * 0.5;
        const endAng = startAng + (curPct / 100) * (Math.PI * 2);
        const arcGrad = ctx.createLinearGradient(dialCenterX - dialRad, dialCenterY, dialCenterX + dialRad, dialCenterY);
        arcGrad.addColorStop(0, '#3b82f6');
        arcGrad.addColorStop(1, '#10b981');
        ctx.strokeStyle = arcGrad;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(dialCenterX, dialCenterY, dialRad, startAng, endAng);
        ctx.stroke();
        ctx.lineCap = 'butt';

        ctx.textAlign = 'center';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${curPct}%`, dialCenterX, dialCenterY + 6);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('AUDIT READY', dialCenterX, dialCenterY + 26);
        ctx.textAlign = 'left';

        // Right Column: 4 Evaluation Breakdown Bars
        const rX = bodyX + 320;
        const rW = bodyW - 336;
        const evals = [
          { name: 'Internal Audit Program (Clause 9.2)', score: '100% Scheduled', sub: 'Baseline cycle on track for Oct 2026', col: '#10b981' },
          { name: 'Non-Conformance Reports (Clause 10.2)', score: '4 Managed', sub: '0 critical open issues; all actioned', col: '#38bdf8' },
          { name: 'Equipment Calibration (Clause 7.1.5)', score: '100% Verified', sub: 'Zero expired measuring instruments', col: '#f59e0b' },
          { name: 'Customer Satisfaction Feedback (Clause 9.1.2)', score: '100% Positive', sub: 'External survey rating exceeded target', col: '#a855f7' },
        ];

        evals.forEach((ev, idx) => {
          const eY = cardY + idx * 54;
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
          ctx.beginPath();
          ctx.roundRect(rX, eY, rW, 46, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(ev.name, rX + 14, eY + 18);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(ev.sub, rX + 14, eY + 34);

          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = ev.col;
          ctx.textAlign = 'right';
          ctx.fillText(ev.score, rX + rW - 14, eY + 28);
          ctx.textAlign = 'left';
        });
      } else if (step === 3) {
        // SCENE 3: Interconnected Compliance Modules
        drawSceneHeader(
          '3. Interconnected Compliance Modules & Traceability Matrix',
          'Seamless operational evidence flows directly into annual ISO matrix',
          'CROSS-MODULE TRACEABILITY',
          '#f59e0b'
        );

        const gridY = bodyY + 72;
        const gridW = bodyW - 32;
        const gridX = bodyX + 16;

        // Central Evidence Hub Card
        const hubW = 280;
        const hubH = 50;
        const hubX = gridX + gridW / 2 - hubW / 2;
        const hubY = gridY + 80;

        ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(hubX, hubY, hubW, hubH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🔗 CENTRAL ISO 9001:2015 COMPLIANCE MATRIX', hubX + hubW / 2, hubY + 24);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('REAL-TIME OPERATIONAL EVIDENCE HUB', hubX + hubW / 2, hubY + 39);
        ctx.textAlign = 'left';

        // 6 Surrounding Connected Modules
        const modules = [
          { title: 'Document Control', clause: 'Cl. 7.5', x: gridX + 20, y: gridY + 10 },
          { title: 'Calibration Control', clause: 'Cl. 7.1.5', x: gridX + gridW / 2 - 80, y: gridY + 10 },
          { title: 'HR & Competency', clause: 'Cl. 7.2', x: gridX + gridW - 180, y: gridY + 10 },
          { title: 'Customer Feedback', clause: 'Cl. 9.1.2', x: gridX + 20, y: gridY + 155 },
          { title: 'NCR Management', clause: 'Cl. 10.2', x: gridX + gridW / 2 - 80, y: gridY + 155 },
          { title: 'Management Review', clause: 'Cl. 9.3', x: gridX + gridW - 180, y: gridY + 155 },
        ];

        modules.forEach((mod) => {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(mod.x, mod.y, 160, 46, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(mod.title, mod.x + 12, mod.y + 20);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#34d399';
          ctx.fillText(`ISO ${mod.clause} Linked`, mod.x + 12, mod.y + 36);

          // Energy connection lines into central hub
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(mod.x + 80, mod.y + 23);
          ctx.lineTo(hubX + hubW / 2, hubY + hubH / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      } else {
        // SCENE 4: Qoo AI Assistant & Audit Exports
        drawSceneHeader(
          '4. Qoo AI Assistant & One-Click Executive Audit Exports',
          'Proactive due-date monitoring and automated certification dossiers',
          'AI ASSISTANT & EXPORT',
          '#a855f7'
        );

        const pY = bodyY + 72;
        const leftW = (bodyW - 48) * 0.48;
        const rightW = (bodyW - 48) * 0.52;
        const leftX = bodyX + 16;
        const rightX = leftX + leftW + 16;

        // Left: Qoo Assistant Avatar & Alert Bubble
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(leftX, pY, leftW, 222, 8);
        ctx.fill();
        ctx.stroke();

        // Qoo Robot Avatar
        const robX = leftX + 44;
        const robY = pY + 44;
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(robX, robY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '22px sans-serif';
        ctx.fillText('🤖', robX - 11, robY + 8);

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('Qoo AI Compliance Officer', robX + 34, robY - 4);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#a855f7';
        ctx.fillText('ACTIVE TELEMETRY MONITOR', robX + 34, robY + 12);

        // Speech Alert Bubble
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)';
        ctx.beginPath();
        ctx.roundRect(leftX + 16, pY + 80, leftW - 32, 126, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('🔔 Proactive Compliance Alerts:', leftX + 28, pY + 104);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• Internal Audit scheduled in 5 days (15-Oct-2026)', leftX + 28, pY + 124);
        ctx.fillText('• All 14 procedures version-controlled and approved', leftX + 28, pY + 144);
        ctx.fillText('• 100% calibration certificates verified', leftX + 28, pY + 164);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('STATUS: 100% READY FOR AUDIT DOSSIER', leftX + 28, pY + 188);

        // Right: Executive Audit Report Export Preview
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.beginPath();
        ctx.roundRect(rightX, pY, rightW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('EXECUTIVE AUDIT DOSSIER PREVIEW', rightX + 18, pY + 26);

        // Report Sheet Card
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.beginPath();
        ctx.roundRect(rightX + 18, pY + 40, rightW - 36, 114, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`ISO 9001:2015 CERTIFICATION PACKET — ${company.name}`, rightX + 30, pY + 62);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Generated: 21-Sep-2026 • Auditor Portal Enabled', rightX + 30, pY + 80);
        ctx.fillText('Clauses 4 through 10 Complete Telemetry Data Attached', rightX + 30, pY + 98);
        ctx.fillStyle = '#34d399';
        ctx.fillText('✓ SANAS / ISO Accreditation Ready', rightX + 30, pY + 120);

        // Download Action Button
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(rightX + 18, pY + 166, rightW - 36, 42, 6);
        ctx.fill();
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('⬇ Download Executive Audit Dossier (PDF)', rightX + rightW / 2, pY + 192);
        ctx.textAlign = 'left';
      }
    }
    // -------------------------------------------------------------------------
    // VIDEO 2: Document Control Module (vid-doc-control)
    // -------------------------------------------------------------------------
    else if (activeVideo.category === 'Document Control') {
      if (step === 1) {
        // SCENE 1: Control of Documented Information (Clause 7.5 Overview)
        drawSceneHeader(
          '1. Control of Documented Information (Clause 7.5 Overview)',
          'Ensuring all standard operating procedures, policies, and records are traceable',
          'CLAUSE 7.5 MANDATE',
          '#38bdf8'
        );

        const cY = bodyY + 72;
        // 4 Summary Metric Tiles
        const tiles = [
          { title: 'Controlled SOPs', count: '14 Active', sub: 'Versioned & Approved', col: '#10b981' },
          { title: 'Policies & Scope', count: '6 Signed', sub: 'Executive Approved', col: '#38bdf8' },
          { title: 'Annual Review Due', count: '1 Due in 30d', sub: 'Automated notification', col: '#f59e0b' },
          { title: 'Archived Obsolete', count: '8 Historical', sub: 'Locked revision trail', col: '#94a3b8' },
        ];

        const tW = (bodyW - 64) / 4;
        tiles.forEach((t, i) => {
          const tX = bodyX + 16 + i * (tW + 10);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.beginPath();
          ctx.roundRect(tX, cY, tW, 76, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(t.title, tX + 12, cY + 22);
          ctx.font = 'bold 18px monospace';
          ctx.fillStyle = t.col;
          ctx.fillText(t.count, tX + 12, cY + 46);
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(t.sub, tX + 12, cY + 64);
        });

        // Bottom Checklist of Clause 7.5 Controls
        const boxY = cY + 90;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.roundRect(bodyX + 16, boxY, bodyW - 32, 132, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('MANDATORY ISO 9001:2015 CLAUSE 7.5 REQUIREMENTS ENFORCED:', bodyX + 32, boxY + 28);

        const reqs = [
          '✓ Clause 7.5.1: Documented information determined as necessary for QMS effectiveness',
          '✓ Clause 7.5.2: Identification, title, date, author, format & approval sign-off',
          '✓ Clause 7.5.3.1: Distribution, access, retrieval, and controlled authorization',
          '✓ Clause 7.5.3.2: Storage, protection of legibility, change control, and retention rules',
        ];
        reqs.forEach((r, idx) => {
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(r, bodyX + 32, boxY + 54 + idx * 22);
        });
      } else if (step === 2) {
        // SCENE 2: Master Document Index & Metadata Register
        drawSceneHeader(
          '2. Master Document Index & Controlled Metadata Register',
          'Unique reference codes, revision numbers, owners, and review cycles',
          'MASTER REGISTER',
          '#10b981'
        );

        const tY = bodyY + 70;
        // Search & Filter Bar
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.beginPath();
        ctx.roundRect(bodyX + 16, tY, 400, 32, 6);
        ctx.fill();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('🔍 Filter: NK-DC-001 Standard Operating Procedure', bodyX + 28, tY + 20);

        // Document Table
        const tableY = tY + 42;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(bodyX + 16, tableY, bodyW - 32, 28);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('DOC CODE', bodyX + 28, tableY + 18);
        ctx.fillText('PROCEDURE TITLE', bodyX + 140, tableY + 18);
        ctx.fillText('CLAUSE', bodyX + 480, tableY + 18);
        ctx.fillText('REV', bodyX + 580, tableY + 18);
        ctx.fillText('OWNER', bodyX + 660, tableY + 18);
        ctx.fillText('STATUS', bodyX + 800, tableY + 18);

        const rows = [
          { code: 'NK-DC-001', title: 'Standard Operating Procedure (SOP-01)', cl: '7.5.1', rev: 'v2.1', owner: 'Quality Lead', stat: 'APPROVED', hi: true },
          { code: 'NK-DC-002', title: 'Corporate Quality Scope Manual', cl: '4.3.0', rev: 'v3.0', owner: 'Managing Dir', stat: 'APPROVED', hi: false },
          { code: 'NK-DC-003', title: 'Internal Audit & CAPA SOP', cl: '9.2.2', rev: 'v1.4', owner: 'Naveen V', stat: 'ACTIVE', hi: false },
          { code: 'NK-DC-004', title: 'Calibration Instrument SOP', cl: '7.1.5', rev: 'v2.0', owner: 'Metrology Lead', stat: 'ACTIVE', hi: false },
        ];

        rows.forEach((r, idx) => {
          const rY = tableY + 32 + idx * 36;
          if (r.hi) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
            ctx.strokeStyle = '#10b981';
            ctx.beginPath();
            ctx.roundRect(bodyX + 16, rY - 4, bodyW - 32, 32, 4);
            ctx.fill();
            ctx.stroke();
          }
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = r.hi ? '#34d399' : '#e2e8f0';
          ctx.fillText(r.code, bodyX + 28, rY + 16);
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(r.title, bodyX + 140, rY + 16);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(r.cl, bodyX + 480, rY + 16);
          ctx.fillText(r.rev, bodyX + 580, rY + 16);
          ctx.fillText(r.owner, bodyX + 660, rY + 16);

          ctx.fillStyle = r.stat === 'APPROVED' ? '#34d399' : '#38bdf8';
          ctx.fillText(`● ${r.stat}`, bodyX + 800, rY + 16);
        });
      } else if (step === 3) {
        // SCENE 3: Creating & Registering New Procedures
        drawSceneHeader(
          '3. Creating & Registering New Procedures (Controlled Sign-Off)',
          'Enter procedure title, review interval, and enforce authorized approval sign-off',
          'DOCUMENT REGISTRATION',
          '#f59e0b'
        );

        const formY = bodyY + 70;
        // Dialog Modal Window on Screen
        const dW = 580;
        const dH = 220;
        const dX = bodyX + bodyW / 2 - dW / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(dX, formY, dW, dH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('REGISTER NEW CONTROLLED QMS PROCEDURE', dX + 20, formY + 24);

        // Input Fields
        const fields = [
          { label: 'Procedure Title:', val: 'Standard Operating Procedure (SOP-01)' },
          { label: 'Clause Category:', val: 'Clause 7.5 — Operational Procedure' },
          { label: 'Review Interval:', val: '12 Months (Annual Audit Review)' },
          { label: 'Authorized Approver:', val: 'Naveen V (Lead Quality Auditor)' },
        ];

        fields.forEach((f, i) => {
          const fY = formY + 40 + i * 36;
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(f.label, dX + 20, fY + 16);

          ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
          ctx.beginPath();
          ctx.roundRect(dX + 150, fY, dW - 170, 26, 4);
          ctx.fill();
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(f.val, dX + 160, fY + 17);
        });

        // Submit Button
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(dX + dW - 220, formY + dH - 36, 200, 28, 6);
        ctx.fill();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Submit for Approval Sign-Off', dX + dW - 120, formY + dH - 18);
        ctx.textAlign = 'left';
      } else {
        // SCENE 4: Automated Version Archive & Audit History
        drawSceneHeader(
          '4. Automated Version Archive & Audit History (Clause 7.5.3.2)',
          'Obsolete versions immediately archived with permanent timestamped audit trails',
          'REVISION ARCHIVE',
          '#10b981'
        );

        const aY = bodyY + 72;
        const leftW = (bodyW - 48) * 0.54;
        const rightW = (bodyW - 48) * 0.46;
        const leftX = bodyX + 16;
        const rightX = leftX + leftW + 16;

        // Left: Version Revision History Timeline
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.beginPath();
        ctx.roundRect(leftX, aY, leftW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('DOCUMENT REVISION TIMELINE (NK-DC-001)', leftX + 16, aY + 26);

        const timeline = [
          { ver: 'Rev 1.0 (15-Jan-2024)', stat: 'LOCKED & ARCHIVED (Obsolete)', col: '#ef4444', icon: '🔒' },
          { ver: 'Rev 2.0 (10-Aug-2025)', stat: 'LOCKED & ARCHIVED (Superseded)', col: '#f59e0b', icon: '🔒' },
          { ver: 'Rev 2.1 (16-Sep-2026)', stat: 'CURRENT ACTIVE APPROVED REVISION', col: '#10b981', icon: '🛡️' },
        ];

        timeline.forEach((item, idx) => {
          const tY = aY + 46 + idx * 56;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.beginPath();
          ctx.roundRect(leftX + 16, tY, leftW - 32, 48, 6);
          ctx.fill();

          ctx.font = '14px sans-serif';
          ctx.fillText(item.icon, leftX + 26, tY + 28);
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(item.ver, leftX + 50, tY + 20);
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = item.col;
          ctx.fillText(item.stat, leftX + 50, tY + 36);
        });

        // Right: Official Certification Stamp & Digital Sign-off
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.beginPath();
        ctx.roundRect(rightX, aY, rightW, 222, 8);
        ctx.fill();
        ctx.stroke();

        // Big Official Stamped Seal
        ctx.save();
        ctx.translate(rightX + rightW / 2, aY + 75);
        ctx.rotate(-0.1);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-110, -30, 220, 60);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(-110, -30, 220, 60);
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('ISO 9001:2015 VERIFIED', 0, -6);
        ctx.font = 'bold 10px monospace';
        ctx.fillText('CLAUSE 7.5 CONTROLLED', 0, 14);
        ctx.restore();

        // Digital Signature Audit Details
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Digital Sign-Off Audit Log:', rightX + 20, aY + 145);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('• Authorized Lead Auditor: Naveen V', rightX + 20, aY + 165);
        ctx.fillText('• Timestamp: 16-Sep-2026 09:15:22 UTC', rightX + 20, aY + 182);
        ctx.fillText('• Permanent tamper-proof SHA-256 hash verified', rightX + 20, aY + 199);
      }
    }
    // -------------------------------------------------------------------------
    // VIDEO 3: HR Management Module (vid-hr-mgmt)
    // -------------------------------------------------------------------------
    else if (activeVideo.category === 'HR Management') {
      if (step === 1) {
        // SCENE 1: Competence & Organizational Roles (Clause 7.2)
        drawSceneHeader(
          '1. Competence & Organizational Roles (Clause 7.2 Overview)',
          'Establishing personnel competence and maintaining verifiable training records',
          'CLAUSE 7.2 COMPETENCE',
          '#38bdf8'
        );

        const hY = bodyY + 72;
        const kpis = [
          { label: 'Staff Competency Verified', num: '100%', note: '24 of 24 Personnel Qualified', col: '#10b981' },
          { label: 'Standardized Positions', num: '8 Roles', note: 'QA, Production & Calibration', col: '#38bdf8' },
          { label: 'Certifications Expirations', num: '0 Overdue', note: 'All licenses current & active', col: '#f59e0b' },
        ];

        const kW = (bodyW - 54) / 3;
        kpis.forEach((k, idx) => {
          const kX = bodyX + 16 + idx * (kW + 11);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.beginPath();
          ctx.roundRect(kX, hY, kW, 78, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(k.label, kX + 12, hY + 22);
          ctx.font = 'bold 20px monospace';
          ctx.fillStyle = k.col;
          ctx.fillText(k.num, kX + 12, hY + 48);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(k.note, kX + 12, hY + 66);
        });

        // Competency by Department Breakdown Chart
        const barBoxY = hY + 92;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.roundRect(bodyX + 16, barBoxY, bodyW - 32, 130, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('DEPARTMENT QUALIFICATION SCORECARDS:', bodyX + 32, barBoxY + 26);

        const depts = [
          { name: 'Quality Assurance Dept (Audit & NCR)', pct: 100 },
          { name: 'Production & Manufacturing (SOP Compliance)', pct: 98 },
          { name: 'Metrology & Tool Calibration (Traceability)', pct: 100 },
          { name: 'Executive Management & Administration', pct: 95 },
        ];
        depts.forEach((d, idx) => {
          const dY = barBoxY + 44 + idx * 21;
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(d.name, bodyX + 32, dY);
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#34d399';
          ctx.textAlign = 'right';
          ctx.fillText(`${d.pct}% Verified`, bodyX + bodyW - 36, dY);
          ctx.textAlign = 'left';
        });
      } else if (step === 2) {
        // SCENE 2: Departments & Position Architecture
        drawSceneHeader(
          '2. Departments & Position Architecture Setup',
          'Standardize job specifications, educational baselines, and responsibilities',
          'DEPARTMENT SETUP',
          '#f59e0b'
        );

        const dY = bodyY + 72;
        const leftW = (bodyW - 48) * 0.52;
        const rightW = (bodyW - 48) * 0.48;
        const leftX = bodyX + 16;
        const rightX = leftX + leftW + 16;

        // Left: 4 Department Hierarchy Cards
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.beginPath();
        ctx.roundRect(leftX, dY, leftW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('CONFIGURED OPERATIONAL DEPARTMENTS', leftX + 16, dY + 24);

        const deptCards = [
          { name: 'Quality Assurance', roles: 'Lead Auditor, QA Inspector, Document Controller' },
          { name: 'Production Operations', roles: 'Plant Supervisor, Senior Machine Operator' },
          { name: 'Metrology & Calibration', roles: 'Certified Instrument Technician' },
          { name: 'Executive Administration', roles: 'Managing Director, Compliance Officer' },
        ];
        deptCards.forEach((dc, i) => {
          const cY = dY + 40 + i * 44;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.beginPath();
          ctx.roundRect(leftX + 14, cY, leftW - 28, 38, 5);
          ctx.fill();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(dc.name, leftX + 24, cY + 16);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(dc.roles, leftX + 24, cY + 30);
        });

        // Right: Job Specification Preview Card
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.beginPath();
        ctx.roundRect(rightX, dY, rightW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('JOB SPECIFICATION: LEAD QUALITY AUDITOR', rightX + 16, dY + 26);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• Educational Baseline: Relevant National Diploma / Degree', rightX + 16, dY + 54);
        ctx.fillText('• Certification: ISO 9001:2015 Lead Auditor (SANAS/IRCA)', rightX + 16, dY + 78);
        ctx.fillText('• Experience: Minimum 3 years in Quality Management', rightX + 16, dY + 102);
        ctx.fillText('• Core Mandate: Author procedures, sign off internal audits', rightX + 16, dY + 126);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(rightX + 16, dY + 150, rightW - 32, 54, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('✓ Assigned Personnel: Naveen V', rightX + 28, dY + 172);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('Competency baseline 100% fulfilled', rightX + 28, dY + 190);
      } else if (step === 3) {
        // SCENE 3: Employee Register & Interactive Organogram Tree
        drawSceneHeader(
          '3. Employee Register & Interactive Organogram Tree',
          'Define line managers, reporting authorities, and live organizational structures',
          'ORGANOGRAM STRUCTURE',
          '#10b981'
        );

        const oY = bodyY + 72;
        const oW = bodyW - 32;
        const oX = bodyX + 16;

        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.beginPath();
        ctx.roundRect(oX, oY, oW, 222, 8);
        ctx.fill();
        ctx.stroke();

        // Level 1: Top Management
        const l1X = oX + oW / 2 - 90;
        const l1Y = oY + 16;
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(l1X, l1Y, 180, 40, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Managing Director / CEO', l1X + 90, l1Y + 18);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#93c5fd';
        ctx.fillText('TOP MANAGEMENT (CLAUSE 5.1)', l1X + 90, l1Y + 32);

        // Connector lines down to Level 2
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(l1X + 90, l1Y + 40);
        ctx.lineTo(l1X + 90, l1Y + 64);
        ctx.lineTo(oX + oW * 0.28, l1Y + 64);
        ctx.lineTo(oX + oW * 0.72, l1Y + 64);
        ctx.stroke();

        // Level 2 Node A: Quality Lead (Naveen V)
        const l2AX = oX + oW * 0.28 - 90;
        const l2AY = l1Y + 70;
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#34d399';
        ctx.beginPath();
        ctx.roundRect(l2AX, l2AY, 180, 44, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Lead Auditor: Naveen V', l2AX + 90, l2AY + 18);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('QUALITY ASSURANCE LEAD', l2AX + 90, l2AY + 32);

        // Level 2 Node B: Operations Director
        const l2BX = oX + oW * 0.72 - 90;
        const l2BY = l1Y + 70;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.roundRect(l2BX, l2BY, 180, 44, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Operations Director', l2BX + 90, l2BY + 18);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('PLANT & PROCESS CONTROL', l2BX + 90, l2BY + 32);

        // Connector down to Level 3
        ctx.beginPath();
        ctx.moveTo(l2AX + 90, l2AY + 44);
        ctx.lineTo(l2AX + 90, l2AY + 62);
        ctx.stroke();

        // Level 3: QA Inspectors
        const l3X = l2AX;
        const l3Y = l2AY + 62;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(l3X, l3Y, 180, 36, 6);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('QA Inspectors (3 Personnel)', l3X + 90, l3Y + 16);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('100% TRAINED ON SOPS', l3X + 90, l3Y + 28);
        ctx.textAlign = 'left';
      } else {
        // SCENE 4: Training Records & Qualification Matrix
        drawSceneHeader(
          '4. Training Records & Qualification Matrix (Auditor Ready)',
          'Track licenses, expiration dates, safety certifications, and competency logs',
          'TRAINING MATRIX',
          '#10b981'
        );

        const mY = bodyY + 72;
        // Training Register Table
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(bodyX + 16, mY, bodyW - 32, 28);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('PERSONNEL NAME', bodyX + 30, mY + 18);
        ctx.fillText('QUALIFICATION / COURSE', bodyX + 220, mY + 18);
        ctx.fillText('CERTIFYING BODY', bodyX + 540, mY + 18);
        ctx.fillText('EXPIRY DATE', bodyX + 700, mY + 18);
        ctx.fillText('AUDIT STATUS', bodyX + 830, mY + 18);

        const records = [
          { name: 'Naveen V (Lead Auditor)', cert: 'ISO 9001:2015 Lead Auditor', body: 'SANAS / IRCA', exp: '2027-10-15', stat: 'CERTIFIED ✓' },
          { name: 'Naveen V (Lead Auditor)', cert: 'Occupational First Aid Level 3', body: 'Dept of Labour', exp: '2027-04-20', stat: 'VALID ✓' },
          { name: 'Abhijeet M (QA Tech)', cert: 'Internal QMS Auditing Workshop', body: 'Quality Institute', exp: '2026-12-31', stat: 'CERTIFIED ✓' },
          { name: 'Production Supervisors', cert: 'SOP Process & Safety Induction', body: 'Internal Training', exp: '2027-01-15', stat: 'COMPLETED ✓' },
        ];

        records.forEach((rec, idx) => {
          const rY = mY + 34 + idx * 36;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.beginPath();
          ctx.roundRect(bodyX + 16, rY - 4, bodyW - 32, 32, 4);
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(rec.name, bodyX + 30, rY + 16);
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(rec.cert, bodyX + 220, rY + 16);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(rec.body, bodyX + 540, rY + 16);
          ctx.fillText(rec.exp, bodyX + 700, rY + 16);

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#34d399';
          ctx.fillText(rec.stat, bodyX + 830, rY + 16);
        });

        // Official Certification Stamp Badge
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bodyX + 16, mY + 180, bodyW - 32, 38, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('🌟 ISO 9001:2015 Clause 7.2 Verification: 100% Staff Competency Verified & Documented for Audit', bodyX + 32, mY + 204);
      }
    }
    // -------------------------------------------------------------------------
    // VIDEO 4: Policy, Objectives & COTO Module (vid-policy-coto)
    // -------------------------------------------------------------------------
    else if (activeVideo.category === 'Policy, Objectives & COTO') {
      if (step === 1) {
        // SCENE 1: Quality Policy Formulation (Clause 5.2)
        drawSceneHeader(
          '1. Quality Policy Formulation & Approval (Clause 5.2)',
          'Top management establishment of quality framework and commitment to excellence',
          'QUALITY POLICY',
          '#f59e0b'
        );

        const pY = bodyY + 72;
        // Official Parchment Certificate
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bodyX + 16, pY, bodyW - 32, 222, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(`${company.name.toUpperCase()} — CORPORATE QUALITY POLICY`, bodyX + bodyW / 2, pY + 28);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('APPROVED IN ACCORDANCE WITH ISO 9001:2015 CLAUSE 5.2', bodyX + bodyW / 2, pY + 44);

        ctx.font = 'italic 12px serif';
        ctx.fillStyle = '#f8fafc';
        const lines = [
          `"Top management of ${company.name} is firmly committed to delivering defect-free products and services`,
          'that exceed our customers expectations and satisfy all applicable statutory and regulatory mandates.',
          'We establish measurable objectives, enforce proactive risk-based thinking, and continuously enhance our',
          'integrated Quality Management System to drive organizational excellence and customer loyalty."',
        ];
        lines.forEach((l, idx) => {
          ctx.fillText(l, bodyX + bodyW / 2, pY + 75 + idx * 22);
        });

        // Executive Signature & Gold Seal Stamp
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('✓ Digital Signature: Managing Director & Executive Quality Committee', bodyX + bodyW / 2, pY + 175);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Signed & Reviewed: 2026 Annual QMS Cycle • Communicated across all departments', bodyX + bodyW / 2, pY + 195);
        ctx.textAlign = 'left';
      } else if (step === 2) {
        // SCENE 2: Measurable Quality Objectives (Clause 6.2)
        drawSceneHeader(
          '2. Measurable Quality Objectives & KPI Tracking (Clause 6.2)',
          'SMART targets across all departments with continuous milestone evaluation',
          'SMART OBJECTIVES',
          '#10b981'
        );

        const oY = bodyY + 72;
        const targets = [
          { title: 'Customer Satisfaction Rating', target: '95%', actual: '100%', status: 'EXCEEDED ✓', col: '#10b981' },
          { title: 'Internal Quality Audit Completion', target: '100%', actual: '100%', status: 'ON SCHEDULE ✓', col: '#38bdf8' },
          { title: 'Major Non-Conformance Incidents', target: '0 Critical', actual: '0 NCR', status: 'COMPLIANT ✓', col: '#10b981' },
          { title: 'Measuring Instrument Calibration', target: '100%', actual: '100%', status: 'VERIFIED ✓', col: '#a855f7' },
        ];

        targets.forEach((tg, idx) => {
          const tY = oY + idx * 52;
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.beginPath();
          ctx.roundRect(bodyX + 16, tY, bodyW - 32, 44, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(tg.title, bodyX + 32, tY + 18);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`Target: ${tg.target} | Actual: ${tg.actual}`, bodyX + 32, tY + 34);

          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = tg.col;
          ctx.textAlign = 'right';
          ctx.fillText(tg.status, bodyX + bodyW - 32, tY + 26);
          ctx.textAlign = 'left';
        });
      } else if (step === 3) {
        // SCENE 3: Context of the Organization (Clause 4.1 SWOT / PESTLE)
        drawSceneHeader(
          '3. Context of the Organization (Clause 4.1 SWOT / PESTLE)',
          'Systematic analysis of internal strengths, weaknesses, and external environmental factors',
          'COTO STRATEGIC ANALYSIS',
          '#38bdf8'
        );

        const swY = bodyY + 72;
        const qW = (bodyW - 48) / 2;
        const qH = 105;
        const col1X = bodyX + 16;
        const col2X = col1X + qW + 16;

        // Quadrant 1: Strengths
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(col1X, swY, qW, qH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('💪 STRENGTHS (Internal Factors)', col1X + 14, swY + 22);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• 100% Certified Lead Quality Auditor staff', col1X + 14, swY + 44);
        ctx.fillText('• Modern connected cloud QMS infrastructure', col1X + 14, swY + 64);
        ctx.fillText('• High customer satisfaction index (100% CSAT)', col1X + 14, swY + 84);

        // Quadrant 2: Weaknesses
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.roundRect(col2X, swY, qW, qH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#f87171';
        ctx.fillText('⚠️ WEAKNESSES (Internal Mitigations)', col2X + 14, swY + 22);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• Legacy paper records migration (In progress)', col2X + 14, swY + 44);
        ctx.fillText('• Supplier onboarding lead times (Mitigated)', col2X + 14, swY + 64);
        ctx.fillText('• Single testing rig dependency (Backup ordered)', col2X + 14, swY + 84);

        // Quadrant 3: Opportunities
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(col1X, swY + qH + 12, qW, qH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('🚀 OPPORTUNITIES (External Environment)', col1X + 14, swY + qH + 34);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• Expansion into high-precision aerospace contracts', col1X + 14, swY + qH + 56);
        ctx.fillText('• Automated vendor quality evaluation integration', col1X + 14, swY + qH + 76);
        ctx.fillText('• Paperless supplier audit sharing portal', col1X + 14, swY + qH + 96);

        // Quadrant 4: Threats
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.beginPath();
        ctx.roundRect(col2X, swY + qH + 12, qW, qH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('🛡️ THREATS (External Risk Controls)', col2X + 14, swY + qH + 34);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('• Changing regulatory safety standards (Monitored)', col2X + 14, swY + qH + 56);
        ctx.fillText('• Global supply chain raw material delays (Stocked)', col2X + 14, swY + qH + 76);
        ctx.fillText('• Competitor pricing pressures (Quality differentiation)', col2X + 14, swY + qH + 96);
      } else {
        // SCENE 4: Needs of Interested Parties (Clause 4.2)
        drawSceneHeader(
          '4. Needs of Interested Parties (Clause 4.2 Stakeholder Matrix)',
          'Mapping customer, regulatory, and supplier requirements to operational controls',
          'STAKEHOLDER MATRIX',
          '#10b981'
        );

        const sY = bodyY + 72;
        // Stakeholders Matrix Table
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(bodyX + 16, sY, bodyW - 32, 28);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('INTERESTED PARTY', bodyX + 30, sY + 18);
        ctx.fillText('CORE EXPECTATIONS & REQUIREMENTS', bodyX + 220, sY + 18);
        ctx.fillText('LINKED QMS OPERATIONAL CONTROL', bodyX + 600, sY + 18);
        ctx.fillText('AUDIT STATUS', bodyX + 830, sY + 18);

        const parties = [
          { party: 'Customers & Clients', req: 'Defect-free delivery, on-time orders & high CSAT', ctrl: 'Customer Satisfaction Surveys & NCRs', stat: 'SATISFIED ✓' },
          { party: 'Certification Bodies (SANAS)', req: 'Traceable Clause 7.5 records & internal audits', ctrl: 'Master Document Register & Audit Schedule', stat: 'COMPLIANT ✓' },
          { party: 'Regulatory Authorities', req: 'Statutory safety, environmental & labor rules', ctrl: 'Legal Compliance Log & Safety SOPs', stat: 'VERIFIED ✓' },
          { party: 'Approved Suppliers', req: 'Clear specification orders & prompt SLA reviews', ctrl: 'Supplier Quality Evaluation Register', stat: 'ACTIVE ✓' },
        ];

        parties.forEach((p, idx) => {
          const rY = sY + 34 + idx * 44;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.beginPath();
          ctx.roundRect(bodyX + 16, rY - 4, bodyW - 32, 38, 4);
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(p.party, bodyX + 30, rY + 18);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(p.req, bodyX + 220, rY + 18);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(p.ctrl, bodyX + 600, rY + 18);
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#34d399';
          ctx.fillText(p.stat, bodyX + 830, rY + 18);
        });
      }
    }
    // -------------------------------------------------------------------------
    // VIDEO 5: Getting started on the SHEQ Street App (vid-getting-started)
    // -------------------------------------------------------------------------
    else {
      if (step === 1) {
        // SCENE 1: Workspace Configuration & Company Scope
        drawSceneHeader(
          '1. Workspace Configuration & Company Scope Setup',
          'Define corporate legal entity, operational scope, and ISO 9001 boundary',
          'COMPANY CONFIGURATION',
          '#38bdf8'
        );

        const wY = bodyY + 72;
        const formW = (bodyW - 32);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.beginPath();
        ctx.roundRect(bodyX + 16, wY, formW, 222, 8);
        ctx.fill();
        ctx.stroke();

        const formItems = [
          { label: 'Company Legal Name:', val: company.name || 'NK Industries Ltd' },
          { label: 'Entity Registration #:', val: '2024/098172/07 (Registered Enterprise)' },
          { label: 'ISO 9001:2015 Scope:', val: 'Design, precision manufacturing, tool assembly, and customer distribution' },
          { label: 'Operational Facilities:', val: 'Unit 4 Industrial Park & Engineering Technology Centre' },
          { label: 'Subscription License:', val: 'SHEQ Street Enterprise Trial (13 Days Remaining)' },
        ];

        formItems.forEach((item, idx) => {
          const itemY = wY + 20 + idx * 38;
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(item.label, bodyX + 32, itemY + 16);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(bodyX + 220, itemY, formW - 250, 26, 4);
          ctx.fill();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#34d399';
          ctx.fillText(item.val, bodyX + 232, itemY + 17);
        });
      } else if (step === 2) {
        // SCENE 2: Navigating QMS Core Modules
        drawSceneHeader(
          '2. Navigating QMS Core Modules & Workspace Layout',
          'Operations, core compliance registers, and resource libraries in the left sidebar',
          'NAVIGATION ARCHITECTURE',
          '#f59e0b'
        );

        const nY = bodyY + 72;
        const cW = (bodyW - 48) / 3;

        const tiers = [
          {
            title: '1. Operations Tier',
            col: '#38bdf8',
            items: ['• Executive Dashboard', '• Non-Conformance (NCR)', '• Internal Audit Program', '• Process Control SOPs'],
          },
          {
            title: '2. Core Registers Tier',
            col: '#10b981',
            items: ['• Document Control (Cl. 7.5)', '• Calibration Register', '• Supplier Management', '• HR Competency Matrix'],
          },
          {
            title: '3. Resources & Account',
            col: '#a855f7',
            items: ['• Interactive Tutorial Centre', '• ISO 9001 Guidelines', '• Company Profile Settings', '• Subscription & Billing'],
          },
        ];

        tiers.forEach((tr, i) => {
          const tX = bodyX + 16 + i * (cW + 8);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = tr.col;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(tX, nY, cW, 222, 8);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = tr.col;
          ctx.fillText(tr.title, tX + 14, nY + 28);

          tr.items.forEach((item, j) => {
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(item, tX + 14, nY + 60 + j * 32);
          });
        });
      } else if (step === 3) {
        // SCENE 3: Role Assignments & User Access
        drawSceneHeader(
          '3. Role Assignments & User Security Permissions',
          'Assign Lead Auditor, Quality Manager, and Department Supervisors with RBAC integrity',
          'ACCESS ROLES & RBAC',
          '#10b981'
        );

        const rY = bodyY + 72;
        const roles = [
          { role: 'Lead Quality Auditor', user: 'Naveen V (nv8660970099@gmail.com)', perms: 'Full Audit Scheduling, Report Signing, NCR Verification', col: '#10b981' },
          { role: 'Quality Operations Manager', user: 'Abhijeet M (qa@sheqstreet.co.za)', perms: 'Document Register Approval, Customer Survey Management', col: '#38bdf8' },
          { role: 'Department Supervisor', user: 'Operations Team Lead', perms: 'Action Plan Owner, Calibration Equipment Log Access', col: '#f59e0b' },
          { role: 'Certification Auditor (Guest)', user: 'External SANAS Assessment Lead', perms: 'Read-Only Live Audit Dossier Portal Access', col: '#a855f7' },
        ];

        roles.forEach((rl, idx) => {
          const cardY = rY + idx * 54;
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.beginPath();
          ctx.roundRect(bodyX + 16, cardY, bodyW - 32, 46, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(rl.role, bodyX + 30, cardY + 18);
          ctx.font = '10px monospace';
          ctx.fillStyle = rl.col;
          ctx.fillText(rl.user, bodyX + 220, cardY + 18);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(rl.perms, bodyX + 30, cardY + 34);
        });
      } else {
        // SCENE 4: Launching Your First Compliance Cycle
        drawSceneHeader(
          '4. Launching Your First Compliance Cycle & Tracking Scorecard',
          'Base verification complete — scheduled internal audit ready to begin',
          'COMPLIANCE LAUNCHPAD',
          '#10b981'
        );

        const lY = bodyY + 72;
        const leftW = (bodyW - 48) * 0.54;
        const rightW = (bodyW - 48) * 0.46;
        const leftX = bodyX + 16;
        const rightX = leftX + leftW + 16;

        // Left: Pre-Flight Checklist
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.roundRect(leftX, lY, leftW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('COMPLIANCE CYCLE PRE-FLIGHT CHECKLIST:', leftX + 16, lY + 26);

        const checks = [
          '✓ Step 1: Company Profile & ISO 9001 Scope Configured',
          '✓ Step 2: Master Document Register Initialized (NK-DC-001)',
          '✓ Step 3: Personnel Competency & Roles Assigned (Naveen V)',
          '✓ Step 4: Measuring Equipment Calibrated & Logged',
          '✓ Step 5: Internal Audit Program Scheduled (15-Oct-2026)',
        ];
        checks.forEach((ch, idx) => {
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(ch, leftX + 16, lY + 54 + idx * 30);
        });

        // Right: Launchpad Button & Readiness Scorecard
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(rightX, lY, rightW, 222, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('READY TO LAUNCH COMPLIANCE CYCLE', rightX + rightW / 2, lY + 36);

        // Circular 85% Preview
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('85%', rightX + rightW / 2, lY + 84);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('BASELINE AUDIT READINESS SCORE', rightX + rightW / 2, lY + 106);

        // Rocket Button
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(rightX + 24, lY + 130, rightW - 48, 54, 8);
        ctx.fill();
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🚀 Launch Annual ISO 9001 Cycle', rightX + rightW / 2, lY + 162);
        ctx.textAlign = 'left';
      }
    }

    // 6. Realistic Animated Mouse Cursor that Moves and Clicks
    ctx.save();
    const cursorProgress = (currentTimeSec * 0.4) % 1;
    // Calculate path for cursor
    const cursorStartX = winX + winW * 0.2;
    const cursorStartY = winY + winH * 0.3;
    const cursorEndX = winX + winW * (currentScene.cursorTarget ? currentScene.cursorTarget.x / 100 : 0.7);
    const cursorEndY = winY + winH * (currentScene.cursorTarget ? currentScene.cursorTarget.y / 100 : 0.6);

    const curX = cursorStartX + (cursorEndX - cursorStartX) * Math.sin(cursorProgress * Math.PI * 0.5);
    const curY = cursorStartY + (cursorEndY - cursorStartY) * Math.sin(cursorProgress * Math.PI * 0.5);

    // Click wave animation at midpoint
    const clickPulse = Math.sin(currentTimeSec * 4);
    if (clickPulse > 0.8) {
      const clickRadius = (clickPulse - 0.8) * 120;
      ctx.strokeStyle = `rgba(249, 115, 22, ${1 - (clickPulse - 0.8) * 5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(curX, curY, clickRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Arrow Pointer
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(curX, curY);
    ctx.lineTo(curX, curY + 18);
    ctx.lineTo(curX + 5, curY + 14);
    ctx.lineTo(curX + 9, curY + 21);
    ctx.lineTo(curX + 12, curY + 20);
    ctx.lineTo(curX + 8, curY + 13);
    ctx.lineTo(curX + 14, curY + 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cursor Target Tooltip
    if (currentScene.cursorTarget) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(curX + 16, curY - 12, 190, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`👉 ${currentScene.cursorTarget.label}`, curX + 22, curY + 4);
    }
    ctx.restore();

    // 7. Dynamic Audio Visualizer Equalizer (Bottom-Right)
    ctx.save();
    const eqX = winX + winW - 220;
    const eqY = winY + winH + 18;
    const barCount = 18;
    for (let b = 0; b < barCount; b++) {
      const barH = isSpeakingNow
        ? (Math.sin(currentTimeSec * 12 + b * 0.7) * 0.5 + 0.5) * 26 + 6
        : (Math.sin(currentTimeSec * 2 + b * 0.4) * 0.5 + 0.5) * 8 + 3;
      const bGrad = ctx.createLinearGradient(0, eqY - barH, 0, eqY);
      bGrad.addColorStop(0, '#38bdf8');
      bGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = bGrad;
      ctx.fillRect(eqX + b * 11, eqY - barH, 7, barH);
    }
    ctx.font = '9px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('AUDIO SPECTRUM', eqX, eqY + 12);
    ctx.restore();

    // 8. Karaoke Subtitle Narration Ribbon (Bottom-Center)
    ctx.save();
    const subW = winW;
    const subH = 46;
    const subX = winX;
    const subY = winY + winH - 24;

    ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(subX, subY, subW, subH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('[AI NARRATOR]:', subX + 16, subY + 28);

    // Subtitle sentence with progressive word highlight
    ctx.font = '12px sans-serif';
    const words = currentScene.voiceScript.split(' ');
    const activeWordIdx = Math.floor(sceneProgress * words.length);
    let curTextX = subX + 120;

    // Display first 15 words or sliding window
    const windowStart = Math.max(0, activeWordIdx - 4);
    const windowWords = words.slice(windowStart, windowStart + 16);

    windowWords.forEach((word, wIdx) => {
      const globalIdx = windowStart + wIdx;
      const isWordActive = globalIdx === activeWordIdx;
      const isWordDone = globalIdx < activeWordIdx;

      if (isWordActive) {
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 12px sans-serif';
      } else if (isWordDone) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
      }

      ctx.fillText(word, curTextX, subY + 28);
      curTextX += ctx.measureText(word + ' ').width;
    });
    ctx.restore();
  }, [activeVideo, currentScene, currentTimeSec, isPlaying, isSpeakingNow, company]);

  // Clean up speech when modal closes
  const handleCloseVideo = useCallback(() => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingNow(false);
    lastSpokenSceneRef.current = null;
    setActiveVideo(null);
  }, []);

  // Pause playback and immediately silence AI voice narration
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingNow(false);
  }, []);

  // Play / Resume video playback and start/resume AI voice narration
  const handlePlay = useCallback(() => {
    playChimeTone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setIsPlaying(true);
    setHasStartedPlaybackOnce(true);
    if (currentScene) {
      speakSceneScript(currentScene.voiceScript);
    }
  }, [currentScene, playChimeTone, speakSceneScript]);

  // Toggle Play / Pause state
  const handleTogglePlayPause = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePause, handlePlay]);

  // Open a video
  const handleOpenVideo = (video: VideoTutorial) => {
    setActiveVideo(video);
    setCurrentTimeSec(0);
    lastSpokenSceneRef.current = null;
    setIsPlaying(true);
    setHasStartedPlaybackOnce(true);

    // Synchronously unlock browser audio & speech within this user click
    playChimeTone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  };

  // Direct Click to Play Handler (Guaranteed Audio/Video Unlocking)
  const handleDirectPlay = () => {
    handlePlay();
  };

  // Keyboard Spacebar & 'k' shortcut to Play/Pause
  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleTogglePlayPause();
      } else if (e.key === 'Escape') {
        handleCloseVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, handleTogglePlayPause, handleCloseVideo]);

  // Direct Test Voice button
  const handleTestVoice = () => {
    playChimeTone();
    if (currentScene) {
      speakSceneScript(currentScene.voiceScript, true);
    } else {
      speakSceneScript('SHEQ Street Quality Management System AI voice narration is active and fully functional.', true);
    }
  };

  // Filter videos
  const filteredVideos = useMemo(() => {
    return TUTORIAL_VIDEOS.filter((vid) => {
      const matchesCategory = selectedCategory === 'All' || vid.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        vid.title.toLowerCase().includes(q) ||
        vid.description.toLowerCase().includes(q) ||
        vid.category.toLowerCase().includes(q) ||
        (vid.bullets && vid.bullets.some((b) => b.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const sections = useMemo(() => {
    const list = selectedCategory === 'All' ? CATEGORIES.filter((c) => c !== 'All') : [selectedCategory];
    return list
      .map((cat) => ({
        category: cat,
        videos: filteredVideos.filter((v) => v.category === cat),
      }))
      .filter((s) => s.videos.length > 0);
  }, [filteredVideos, selectedCategory]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
          TRIAL
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a365d] text-white flex items-center justify-center shadow-xs flex-shrink-0 mt-0.5">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tutorial Centre</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Interactive 1080p video walkthroughs with real-time AI voice narration according to module headings
            </p>
          </div>
        </div>

        {/* AI Voice Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>AI Voice Narration Active</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tutorials by heading, topic, or keyword..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b2537] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Video Sections Grid */}
      <div className="space-y-10 pt-2">
        {sections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No tutorials found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No video guides matched your search &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.category} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {section.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleOpenVideo(video)}
                    className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-[16/9] w-full bg-[#0a1120] overflow-hidden select-none">
                      {video.thumbnailType === 'laptop' ? (
                        <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center p-6 relative">
                          <div className="w-[88%] h-[84%] bg-slate-900 rounded-lg p-1.5 shadow-2xl border border-slate-700 relative flex flex-col">
                            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full mx-auto mb-1 opacity-70" />
                            <div className="w-full flex-1 bg-[#f8fafc] rounded overflow-hidden flex flex-col border border-slate-300">
                              <div className="h-3 bg-[#0f172a] flex items-center px-1.5 gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              </div>
                              <div className="flex-1 p-2 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className="text-[8px] font-bold text-slate-800">SHEQ Street</span>
                                  </div>
                                  <span className="text-[7px] text-blue-600 font-semibold">Audit Ready 85%</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 my-1">
                                  <div className="h-6 rounded bg-blue-50 border border-blue-200 p-0.5">
                                    <div className="text-[6px] font-bold text-blue-900">4 Open NCRs</div>
                                  </div>
                                  <div className="h-6 rounded bg-emerald-50 border border-emerald-200 p-0.5">
                                    <div className="text-[6px] font-bold text-emerald-900">100% Calibrated</div>
                                  </div>
                                  <div className="h-6 rounded bg-amber-50 border border-amber-200 p-0.5">
                                    <div className="text-[6px] font-bold text-amber-900">100% Satisfaction</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[106%] h-2.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-b-md shadow-md border-t border-slate-400 flex items-center justify-center">
                              <div className="w-8 h-0.5 bg-slate-400 rounded-full" />
                            </div>
                          </div>

                          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200">
                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-[7px] font-bold text-white">
                              S
                            </div>
                            <span className="text-[9px] font-bold text-slate-900 tracking-tight">SHEQ Street</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#0a1120] text-white p-5 flex items-center justify-between relative overflow-hidden">
                          <div className="w-[52%] z-10 space-y-2">
                            <h3 className="text-amber-400 text-sm font-extrabold tracking-tight">
                              {video.title.split('-')[0].trim()}
                            </h3>
                            {video.bullets && (
                              <ul className="text-[10px] text-slate-300 space-y-0.5 font-mono">
                                {video.bullets.slice(0, 4).map((b, i) => (
                                  <li key={i}>- {b}</li>
                                ))}
                              </ul>
                            )}
                            <div className="flex items-center gap-1.5 pt-1 opacity-70">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                              <span className="text-[9px] font-semibold tracking-wider text-slate-300">SHEQ Street</span>
                            </div>
                          </div>

                          <div className="w-[44%] h-[85%] bg-[#111c33] rounded-lg border border-slate-700 p-2 flex flex-col justify-between shadow-xl text-[8px]">
                            <div>
                              <div className="text-[7px] text-slate-400 mb-1">SHEQ Street QMS</div>
                              <div className="text-[9px] font-bold text-white leading-tight">
                                {video.title}
                              </div>
                            </div>
                            <div className="bg-[#182848] rounded p-1 flex items-center justify-between text-[7px] text-slate-300">
                              <span>AI Narration</span>
                              <span className="text-emerald-400 font-bold">Enabled</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-slate-800 shadow-sm border border-slate-200/80">
                          {video.category}
                        </span>
                      </div>

                      {/* AI Voice Badge on Card */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                          <Mic className="w-3 h-3" />
                          <span>AI Voice</span>
                        </span>
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-2.5 left-3 z-20">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{video.duration}</span>
                        </span>
                      </div>

                      {/* Dark Overlay with Big Play Button */}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/50 transition-all flex items-center justify-center z-10">
                        <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white text-slate-900 group-hover:scale-110 transition-transform flex items-center justify-center shadow-2xl">
                          <Play className="w-6 h-6 ml-0.5 text-blue-600 fill-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {video.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                          Run Video Tutorial <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-slate-400 font-medium">4 Chapters • Live 60FPS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FULL SCREEN 1080P CANVAS VIDEO PLAYER MODAL WITH REAL-TIME AI VOICE NARRATION */}
      {activeVideo && currentScene && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
          <div
            ref={playerContainerRef}
            className={`bg-[#080e1a] border border-slate-800 rounded-2xl w-full overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 ${
              isFullscreen ? 'max-w-none h-screen' : 'max-w-5xl max-h-[95vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-2.5 bg-[#0b1426] border-b border-slate-800/80 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3 truncate">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {activeVideo.category}
                </span>
                <span className="font-bold text-sm truncate">{activeVideo.title}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* AI Voice Indicator Status Badge */}
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
                    isSpeakingNow
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isSpeakingNow ? 'AI Narrating...' : 'AI Voice Active'}</span>
                </div>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleCloseVideo}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                  title="Close Video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LIVE 1080P CANVAS VIDEO STAGE */}
            <div
              className="relative aspect-[16/9] w-full bg-[#050912] flex flex-col justify-between overflow-hidden select-none border-b border-slate-800 flex-1 group/videostage cursor-pointer"
              onClick={handleTogglePlayPause}
            >
              {/* The HTML5 Canvas Rendering The Dynamic 60FPS Video Walkthrough */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain bg-[#050912]"
              />

              {/* Glowing Initial / Paused Click-to-Play Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 pb-20 flex flex-col items-center justify-center pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-20 h-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl border-2 border-blue-400/80 mb-3 animate-pulse">
                    <Play className="w-9 h-9 fill-white ml-1" />
                  </div>
                  <div className="px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-slate-700 text-white font-bold text-sm shadow-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Video Paused — Click Screen or Press Space to Resume</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-2 text-center max-w-md bg-black/60 px-3 py-1 rounded-md">
                    Chapter {currentScene.stepNumber}: &quot;{currentScene.title}&quot;
                  </p>
                </div>
              )}

              {/* Bottom Video Timeline & Controls Ribbon */}
              <div
                className="relative z-30 mt-auto bg-gradient-to-t from-black via-black/95 to-transparent p-4 pt-6 cursor-default pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Interactive Scrub Progress Bar with Chapter Markers */}
                <div
                  className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden mb-3 cursor-pointer group/bar relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
                    const newSec = Math.floor(percent * activeVideo.durationSec);
                    setCurrentTimeSec(newSec);
                    lastSpokenSceneRef.current = null;
                    if (!isPlaying) {
                      handlePlay();
                    }
                  }}
                >
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all relative"
                    style={{
                      width: `${(currentTimeSec / activeVideo.durationSec) * 100}%`,
                    }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-90 group-hover/bar:scale-125 transition-transform" />
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white">
                  <div className="flex items-center gap-3">
                    {/* Play / Pause Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlayPause();
                      }}
                      className={`px-3 py-2 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 font-bold ${
                        isPlaying
                          ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/50'
                          : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50'
                      }`}
                      title={isPlaying ? 'Pause Video (Space)' : 'Play Video (Space)'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-white" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                          <span>Play</span>
                        </>
                      )}
                    </button>

                    {/* Replay Current Chapter */}
                    <button
                      onClick={() => {
                        setCurrentTimeSec(currentScene.startSec);
                        lastSpokenSceneRef.current = null;
                        handleDirectPlay();
                      }}
                      className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Replay Current Chapter"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Mute Toggle */}
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* High Precision Time Counter */}
                    <div className="text-[11px] font-mono text-slate-300">
                      <span className="text-white font-bold">{formatSeconds(currentTimeSec)}</span> /{' '}
                      <span>{formatSeconds(activeVideo.durationSec)}</span>
                    </div>
                  </div>

                  {/* Right Side: AI Voice Controls */}
                  <div className="flex items-center gap-2">
                    {/* AI Voice ON/OFF Toggle */}
                    <button
                      onClick={() => {
                        setAiVoiceEnabled(!aiVoiceEnabled);
                        if (aiVoiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        aiVoiceEnabled
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                      title="Toggle AI Speech Synthesis"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>AI Voice: {aiVoiceEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Test Voice Audio Button */}
                    <button
                      onClick={handleTestVoice}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Test Audio Output"
                    >
                      <Volume1 className="w-3.5 h-3.5" />
                      <span>🔊 Test Voice</span>
                    </button>

                    {/* Voice Character Selection */}
                    <button
                      onClick={() => setVoiceType(voiceType === 'female' ? 'male' : 'female')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
                      title="Switch AI Voice Character"
                    >
                      {voiceType === 'female' ? 'Voice: Sarah' : 'Voice: David'}
                    </button>

                    {/* Playback Speed Selector */}
                    <button
                      onClick={() => {
                        const speeds = [1.0, 1.25, 1.5];
                        const nextIdx = (speeds.indexOf(voiceSpeed) + 1) % speeds.length;
                        setVoiceSpeed(speeds[nextIdx]);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-300 cursor-pointer"
                      title="Playback Speed"
                    >
                      {voiceSpeed}x
                    </button>

                    {activeVideo.targetTab && onNavigate && (
                      <button
                        onClick={() => {
                          onNavigate(activeVideo.targetTab!);
                          handleCloseVideo();
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ml-1"
                      >
                        <span>Open Live Module</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Chapter List (Click any chapter to jump and immediately run) */}
            <div className="p-4 sm:p-5 bg-[#0a1222] border-t border-slate-800 text-slate-300 space-y-3 flex-shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Video Chapters (Click to Jump &amp; Run Voice):</span>
                <span className="text-blue-400 font-semibold">Active: {currentScene.title}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeVideo.scenes.map((scene) => {
                  const isActive = currentScene.id === scene.id;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => {
                        setCurrentTimeSec(scene.startSec);
                        lastSpokenSceneRef.current = null;
                        handleDirectPlay();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-[#0f1b33] hover:bg-[#152444] border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-blue-400">
                          {formatSeconds(scene.startSec)}
                        </span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />}
                      </div>
                      <div className="text-xs font-bold truncate mt-1">{scene.title}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{scene.highlightFocus}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
