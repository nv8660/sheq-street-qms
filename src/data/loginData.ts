export interface CredentialAccount {
  name: string;
  email: string;
  password: string;
  role: string;
  badge: string;
  initials: string;
  color: string;
}

export const SAVED_CREDENTIALS: CredentialAccount[] = [
  {
    name: 'NAVEEN .V',
    email: 'nv8660970099@gmail.com',
    password: 'Naveen@1402',
    role: 'SHEQ Quality Lead / ISO 9001 Lead Auditor',
    badge: 'Lead Auditor',
    initials: 'NV',
    color: 'bg-blue-600',
  },
  {
    name: 'NK Quality Administrator',
    email: 'admin@nkquality.co.za',
    password: '1234567',
    role: 'SHEQ Administrator & Quality Lead',
    badge: 'Admin',
    initials: 'NK',
    color: 'bg-emerald-600',
  },
  {
    name: 'SHEQ Street Lead Auditor',
    email: 'naveen@sheqstreet.co.za',
    password: 'SQ-Auditor9001!',
    role: 'External ISO 9001:2015 Auditor',
    badge: 'Auditor',
    initials: 'SQ',
    color: 'bg-purple-600',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Starter',
    badge: '14 day free trial',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    price: 'R899',
    period: '/month',
    features: [
      'Full QMS module suite',
      'AI-powered document creation',
      'NCR, Audit & Supplier management',
      'HR & Calibration control',
      'Up to 5 users',
    ],
  },
  {
    name: 'Professional',
    badge: 'Coming soon',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    price: '',
    period: '',
    features: ['Everything in Starter', 'Multi-site / multi-office support'],
  },
];
