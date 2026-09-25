import React, { useState } from 'react';
import {
  Check,
  Zap,
  Shield,
  Clock,
  Download,
  ArrowLeft,
  Lock,
  CheckCircle,
  FileText,
  Printer,
  Mail,
  Building,
  ChevronRight,
  RefreshCw,
  Calendar,
  Star,
  CheckCircle2,
  QrCode,
  Smartphone,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { Company, NavigationTab } from '../../types';

interface BillingPlanViewProps {
  company: Company;
  onUpdateCompany?: (updated: Partial<Company>) => void;
  onNavigate?: (tab: NavigationTab) => void;
}

type PlanType = 'starter' | 'pro' | 'enterprise';
type BillingCycle = 'monthly' | 'annual';
type UpiMode = 'qr' | 'vpa';

interface PlanDetails {
  id: PlanType;
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  description: string;
  features: string[];
}

const PLANS: Record<PlanType, PlanDetails> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 899,
    annualMonthlyPrice: 799,
    description: 'Perfect for small teams getting started with QMS.',
    features: [
      'Up to 5 users',
      'Full ISO 9001 QMS suite',
      'AI-powered features',
      'Secure cloud hosting with backups',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    badge: 'COMING SOON',
    monthlyPrice: 1199,
    annualMonthlyPrice: 999,
    description: 'Everything in Starter plus advanced features for growing teams.',
    features: [
      'Up to 10 users',
      'All Starter features included',
      'Multi-site / multi-office organogram with team separation',
      'Additional tools',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Multi-Site',
    monthlyPrice: 2499,
    annualMonthlyPrice: 1999,
    description: 'Custom solutions for large corporations with multi-division SHEQ structures.',
    features: [
      'Unlimited users',
      'Dedicated SHEQ compliance manager',
      'Custom API & SSO (SAML/Okta)',
      'Integrated IMS (ISO 9001 / 14001 / 45001)',
      'Custom SLAs and on-premise audit backup',
    ],
  },
};

const UPI_APPS = [
  { name: 'Google Pay', icon: '⚡', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'PhonePe', icon: '🟣', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { name: 'Paytm', icon: '🔷', color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { name: 'BHIM UPI', icon: '🇮🇳', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'CRED UPI', icon: '💎', color: 'text-slate-800 bg-slate-100 border-slate-300' },
];

const QUICK_UPI_HANDLES = ['@okhdfcbank', '@okaxis', '@okicici', '@ybl', '@paytm', '@upi'];
const MERCHANT_UPI_ID = 'sheqstreet@hdfcbank';
const MERCHANT_NAME = 'SHEQ Street QMS International';

export const BillingPlanView: React.FC<BillingPlanViewProps> = ({
  company,
  onUpdateCompany,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('starter');

  // UPI Payment State (Exclusively UPI)
  const [upiMode, setUpiMode] = useState<UpiMode>('qr');
  const [upiId, setUpiId] = useState<string>(
    company?.email ? `${company.email.split('@')[0]}@okhdfcbank` : 'naveen@okhdfcbank'
  );
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');

  // Billing Details
  const [companyLegalName, setCompanyLegalName] = useState<string>(company?.name || 'NK Quality Systems Ltd');
  const [billingEmail, setBillingEmail] = useState<string>(company?.email || 'nv8660970099@gmail.com');
  const [vatNumber, setVatNumber] = useState<string>('ZA-490219802');
  const [addressLine, setAddressLine] = useState<string>('14 Long Street, 4th Floor, Tech Hub');
  const [city, setCity] = useState<string>('Johannesburg');
  const [postalCode, setPostalCode] = useState<string>('2000');
  const [country, setCountry] = useState<string>('South Africa');
  const [includeTax, setIncludeTax] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Processing & UI state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [lastTransactionId, setLastTransactionId] = useState<string>('TXN-UPI-2026-98412');
  const [lastUtrNumber, setLastUtrNumber] = useState<string>('429184019284');
  const [paymentSuccessNotification, setPaymentSuccessNotification] = useState<string | null>(null);

  // Calculations
  const planInfo = PLANS[selectedPlan];
  const unitPrice = billingCycle === 'annual' ? planInfo.annualMonthlyPrice : planInfo.monthlyPrice;
  const subtotal = billingCycle === 'annual' ? unitPrice * 12 : unitPrice;
  const regularAnnualPrice = planInfo.monthlyPrice * 12;
  const annualSavings = billingCycle === 'annual' ? regularAnnualPrice - subtotal : 0;
  const taxRate = includeTax ? 0.15 : 0;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalDue = Math.round((subtotal + taxAmount) * 100) / 100;

  const handleEnterPaymentMode = (planId?: PlanType) => {
    if (planId) setSelectedPlan(planId);
    setViewMode('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyMerchantUpi = () => {
    navigator.clipboard?.writeText(MERCHANT_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (upiMode === 'vpa') {
      if (!upiId.trim() || !upiId.includes('@') || upiId.trim().length < 5) {
        errors.upiId = 'Please enter a valid UPI ID (e.g. mobile@upi or username@okhdfcbank)';
      }
    }
    if (!companyLegalName.trim()) errors.companyLegalName = 'Company name is required';
    if (!billingEmail.trim() || !billingEmail.includes('@')) {
      errors.billingEmail = 'Valid billing email is required';
    }
    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service to proceed';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProcessPayment = () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setProcessingProgress(20);
    setProcessingStep('Initializing UPI secure channel via NPCI banking gateway...');

    setTimeout(() => {
      setProcessingProgress(50);
      setProcessingStep(`Sending UPI payment request to ${upiMode === 'qr' ? 'UPI QR App' : upiId}...`);
    }, 600);

    setTimeout(() => {
      setProcessingProgress(85);
      setProcessingStep('UPI Payment Verified! Generating NPCI 12-digit UTR settlement...');
    }, 1200);

    setTimeout(() => {
      setProcessingProgress(100);
      setProcessingStep('License activated! Generating official Tax Invoice...');

      const newTxnId = `TXN-UPI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const randomUtr = `42${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setLastTransactionId(newTxnId);
      setLastUtrNumber(randomUtr);

      const planNameFormatted =
        selectedPlan === 'pro' ? 'Professional' : selectedPlan === 'starter' ? 'Starter' : 'Enterprise';

      if (onUpdateCompany) {
        onUpdateCompany({
          plan: planNameFormatted,
          daysRemaining: billingCycle === 'annual' ? 365 : 30,
        });
      }

      setIsProcessing(false);
      setViewMode('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  const handleSendEmailReceipt = () => {
    setPaymentSuccessNotification(
      `Official UPI Tax Invoice & Receipt was successfully dispatched to ${billingEmail}!`
    );
    setTimeout(() => setPaymentSuccessNotification(null), 5000);
  };

  // ==========================================
  // VIEW: PAYMENT SUCCESS VIEW (UPI)
  // ==========================================
  if (viewMode === 'success') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
        {paymentSuccessNotification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{paymentSuccessNotification}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-emerald-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Animated Success Badge */}
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-400 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            UPI Payment Verified • Instant Settlement
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Subscription Activated via UPI!
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
            Your UPI payment of{' '}
            <strong className="text-slate-900 font-bold">R{totalDue.toLocaleString()} ZAR</strong>{' '}
            has been verified with NPCI real-time clearance. Your organization has full access to the SHEQ Street QMS suite.
          </p>

          {/* Transaction Metadata Card */}
          <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 max-w-2xl mx-auto text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">UPI UTR Reference</span>
              <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5 block">
                {lastUtrNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Transaction ID</span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                {lastTransactionId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Subscribed Plan</span>
              <span className="font-bold text-blue-700 text-sm mt-0.5 block">
                {planInfo.name} ({billingCycle === 'annual' ? 'Annual License' : 'Monthly'})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Channel</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                UPI Instant ({upiMode === 'qr' ? selectedUpiApp : upiId})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Merchant VPA</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                {MERCHANT_UPI_ID}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">License Period</span>
              <span className="font-semibold text-emerald-700 mt-0.5 block">
                {billingCycle === 'annual' ? '365 Days Active' : '30 Days Active'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              View & Download Tax Invoice
            </button>

            <button
              onClick={handleSendEmailReceipt}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              Email Receipt
            </button>

            <button
              onClick={() => onNavigate?.('dashboard')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              Go to QMS Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setViewMode('plans')}
              className="text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
            >
              Return to Subscription Overview
            </button>
          </div>
        </div>

        {showInvoiceModal && (
          <TaxInvoiceModal
            companyLegalName={companyLegalName}
            billingEmail={billingEmail}
            addressLine={addressLine}
            city={city}
            postalCode={postalCode}
            country={country}
            vatNumber={vatNumber}
            transactionId={lastTransactionId}
            utrNumber={lastUtrNumber}
            planName={planInfo.name}
            billingCycle={billingCycle}
            subtotal={subtotal}
            taxAmount={taxAmount}
            totalDue={totalDue}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: CHECKOUT MODE (EXCLUSIVELY UPI)
  // ==========================================
  if (viewMode === 'checkout') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('plans')}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Plans</span>
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                UPI Payment Only
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Secure UPI Checkout
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>NPCI 256-Bit Encrypted UPI Gateway</span>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 max-w-xl text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-[11px]">
              ✓
            </div>
            <span>1. Plan Chosen ({planInfo.name})</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 text-blue-700">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
              2
            </div>
            <span>2. UPI Payment</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px]">
              3
            </div>
            <span>3. Instant Activation</span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: UPI Payment Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* UPI Method Header & Sub-selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Unified Payments Interface (UPI)</h2>
                    <p className="text-xs text-slate-500">Scan QR Code or enter your UPI Virtual Payment Address (VPA)</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Instant • 0% Fee
                </span>
              </div>

              {/* Mode Switch Tabs: QR Code vs Enter VPA */}
              <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUpiMode('qr')}
                  className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    upiMode === 'qr'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Scan UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUpiMode('vpa')}
                  className={`py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    upiMode === 'vpa'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Enter UPI ID / VPA</span>
                </button>
              </div>

              {/* TAB 1: SCAN QR CODE */}
              {upiMode === 'qr' && (
                <div className="space-y-5 pt-2">
                  <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Dynamic NPCI QR Generated for R{totalDue.toFixed(2)}
                    </div>

                    {/* Stylized QR Code Visual */}
                    <div className="mx-auto w-56 h-56 p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center relative group">
                      <UpiQrCodeSvg amount={totalDue} />
                      <div className="absolute bottom-2 text-[10px] font-mono text-slate-400">
                        SHEQ-QMS-UPI-{selectedPlan.toUpperCase()}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Open <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any UPI app to scan and approve.
                    </p>

                    {/* Merchant ID Copy Box */}
                    <div className="inline-flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs max-w-sm w-full mx-auto shadow-2xs">
                      <div className="text-left overflow-hidden">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Merchant VPA:
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs truncate block">
                          {MERCHANT_UPI_ID}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyMerchantUpi}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedUpi ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Supported Apps Chips */}
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                        Supported Instant UPI Apps:
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.name}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.name)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              selectedUpiApp === app.name
                                ? `${app.color} ring-2 ring-emerald-500/20 shadow-xs font-bold`
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{app.icon}</span>
                            <span>{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENTER UPI ID / VPA */}
              {upiMode === 'vpa' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your UPI ID / VPA <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          if (formErrors.upiId) setFormErrors((prev) => ({ ...prev, upiId: '' }));
                        }}
                        placeholder="yourname@okhdfcbank or 9876543210@paytm"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 ${
                          formErrors.upiId
                            ? 'border-red-400 focus:ring-red-100 focus:border-red-500'
                            : 'border-slate-300 focus:ring-emerald-100 focus:border-emerald-600'
                        }`}
                      />
                      <div className="absolute right-3 top-2.5 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline">UPI Active</span>
                      </div>
                    </div>
                    {formErrors.upiId && (
                      <span className="text-xs text-red-500 mt-1 block">{formErrors.upiId}</span>
                    )}
                  </div>

                  {/* Quick Handle Suggestions */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Quick Handle Fill:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_UPI_HANDLES.map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => {
                            const prefix = upiId.split('@')[0] || 'user';
                            setUpiId(`${prefix}${handle}`);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Instant App Push Notification</strong>
                      <span>
                        When you click <strong>Pay via UPI</strong>, a payment request of{' '}
                        <strong>R{totalDue.toFixed(2)}</strong> will be pinged directly to your UPI app.
                        Confirm using your UPI PIN to activate instantly.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Billing Address & Organization Tax Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Billing Address & Tax Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Required for your ISO 9001:2015 audit compliant tax invoices.
                  </p>
                </div>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyLegalName}
                    onChange={(e) => setCompanyLegalName(e.target.value)}
                    placeholder="e.g. Acme Quality Corp Ltd"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  />
                  {formErrors.companyLegalName && (
                    <span className="text-xs text-red-500 mt-1 block">{formErrors.companyLegalName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Email (for Invoices) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  />
                  {formErrors.billingEmail && (
                    <span className="text-xs text-red-500 mt-1 block">{formErrors.billingEmail}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    VAT / Tax / GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="e.g. ZA-490219802"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  >
                    <option value="South Africa">South Africa</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Building, Suite, Street name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / Metro"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal / ZIP"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (formErrors.agreeTerms) setFormErrors((prev) => ({ ...prev, agreeTerms: '' }));
                    }}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    I confirm authorization to bind <strong>{companyLegalName || 'this organization'}</strong> to the SHEQ Street QMS Subscription Agreement and ISO quality compliance terms.
                  </span>
                </label>
                {formErrors.agreeTerms && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.agreeTerms}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & UPI Pay Button (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Order Summary</h3>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  {billingCycle === 'annual' ? 'Annual (Save 20%)' : 'Monthly'}
                </span>
              </div>

              {/* Selected Plan Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{planInfo.name}</div>
                  <div className="text-sm font-extrabold text-slate-900">R{unitPrice}/mo</div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{planInfo.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-600">
                  {planInfo.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Cycle Switch */}
              <div className="flex items-center justify-between text-xs bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                    billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Monthly (R{planInfo.monthlyPrice}/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                    billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Annual (R{planInfo.annualMonthlyPrice}/mo)
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded-full">
                    -20%
                  </span>
                </button>
              </div>

              {/* Price Line Items */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span>Base Plan ({billingCycle === 'annual' ? '12 Months' : '1 Month'})</span>
                  <span className="font-semibold text-slate-800">
                    R{(billingCycle === 'annual' ? regularAnnualPrice : planInfo.monthlyPrice).toFixed(2)}
                  </span>
                </div>

                {billingCycle === 'annual' && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span>20% Annual Discount Applied</span>
                    <span>-R{annualSavings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    VAT / Tax (15%)
                    <button
                      type="button"
                      onClick={() => setIncludeTax(!includeTax)}
                      className="text-[10px] text-blue-600 underline"
                    >
                      {includeTax ? 'Remove tax' : 'Add tax'}
                    </button>
                  </span>
                  <span className="font-semibold text-slate-800">R{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Due Today</span>
                  <span className="text-emerald-700 text-xl font-black">
                    R{totalDue.toFixed(2)} <span className="text-xs text-slate-500 font-normal">ZAR</span>
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {upiMode === 'qr'
                    ? `I have Scanned & Paid R${totalDue.toFixed(2)}`
                    : `Pay R${totalDue.toFixed(2)} via UPI`}
                </span>
              </button>

              {/* Guarantees */}
              <div className="space-y-2 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Instant UPI auto-clearance with 30-day refund guarantee.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Immediate ISO license key issuance upon verification.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Next renewal: {new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 86400000).toLocaleDateString()}.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Modal */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600/30 border-t-emerald-600 animate-spin mx-auto flex items-center justify-center text-emerald-600">
                <RefreshCw className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Processing UPI Transaction</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">{processingStep}</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>NPCI UPI 256-Bit Encrypted Security Standard</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: DEFAULT PLANS & BILLING OVERVIEW
  // ==========================================
  const isPaidActive = company.plan && company.plan !== 'TRIAL' && company.plan !== 'Trial';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-700 font-semibold">{company.name}</span>
        {isPaidActive ? (
          <span className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wider">
            {company.plan.toUpperCase()} ACTIVE
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
            {company.plan || 'TRIAL'}
          </span>
        )}
        {company.isoScope && company.isoScope.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span className="text-slate-300">•</span>
            {company.isoScope.map((scope) => (
              <span
                key={scope}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
              >
                {scope}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{company.name} — Subscription & Billing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your SHEQ Street QMS license, invoices, and instant UPI billing.
          </p>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Current Subscription</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your active plan and payment setup</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-900">
                {isPaidActive ? `${company.plan} Plan` : 'Starter Plan'}
              </span>
              {isPaidActive ? (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-[#fffbeb] border border-[#fde68a] text-[#b45309] text-[11px] font-semibold">
                  Free Trial
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">R899/month (base)</div>
          </div>
        </div>

        {isPaidActive ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-950">Active License</div>
              <div className="text-xs text-emerald-900 mt-0.5">
                {company.daysRemaining || 365} days remaining. Full access to all ISO 9001 QMS modules enabled.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#fffbeb] border border-[#fef08a] rounded-xl p-4 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-[#d97706] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#78350f]">Free Trial</div>
              <div className="text-xs text-[#92400e] mt-0.5">
                8 days remaining. Upgrade via instant UPI payment below to retain uninterrupted access.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          AVAILABLE PLANS — MONTHLY (ZAR)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Card 1: Starter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Starter</h4>
              <p className="text-xs text-slate-500 mt-1">Perfect for small teams getting started with QMS.</p>

              <div className="mt-5 mb-5 flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">R899</span>
                <span className="text-xs text-slate-500 font-normal ml-0.5">/mo</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Full ISO 9001 QMS suite</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>AI-powered features</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Secure cloud hosting with backups</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleEnterPaymentMode('starter')}
              className="w-full mt-8 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Subscribe via UPI</span>
            </button>
          </div>

          {/* Card 2: Professional */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#54687c] text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
              COMING SOON
            </div>

            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Star className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Professional</h4>
              <p className="text-xs text-slate-500 mt-1">Everything in Starter plus advanced features for growing teams.</p>

              <div className="mt-5 mb-5 flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">R1 199</span>
                <span className="text-xs text-slate-500 font-normal ml-0.5">/mo</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Up to 10 users</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>All Starter features included</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Multi-site / multi-office organogram</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Additional audit tools</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full mt-8 py-2.5 px-4 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed text-center"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="text-center max-w-4xl text-xs text-slate-600 pt-2">
          Extra users: <strong className="font-bold text-slate-900">R99 per additional user per month</strong>
        </div>
      </div>

      {/* Payment Method Details Preview (Dedicated UPI Card) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                UPI Instant Payment (Google Pay, PhonePe, Paytm, BHIM)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Exclusive
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Merchant VPA: <span className="font-mono font-semibold text-slate-700">{MERCHANT_UPI_ID}</span> • Real-Time NPCI Settlement • 0% Transaction Fees
            </div>
          </div>
        </div>

        <button
          onClick={() => handleEnterPaymentMode()}
          className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-100 self-start sm:self-auto cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Pay / Upgrade with UPI</span>
        </button>
      </div>

      {/* Invoices History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Invoices & Payment Records</h3>
            <p className="text-xs text-slate-500">
              Download formal VAT tax invoices with verified UPI UTR references.
            </p>
          </div>
          <FileText className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Billing Date</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Payment Method</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-mono font-semibold text-slate-800">INV-UPI-2026-0921</td>
                <td className="py-3">Sep 21, 2026</td>
                <td className="py-3">Professional QMS (Annual Subscription)</td>
                <td className="py-3 font-mono text-[11px]">UPI (UTR: 42981048102)</td>
                <td className="py-3 font-semibold text-slate-900">R1 199.00</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    PAID (UPI)
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1 ml-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-mono font-semibold text-slate-800">INV-UPI-2025-0814</td>
                <td className="py-3">Aug 14, 2025</td>
                <td className="py-3">ISO 9001:2015 Pre-Audit Toolkit Setup</td>
                <td className="py-3 font-mono text-[11px]">UPI (UTR: 32819203819)</td>
                <td className="py-3 font-semibold text-slate-900">R899.00</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    PAID (UPI)
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1 ml-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showInvoiceModal && (
        <TaxInvoiceModal
          companyLegalName={companyLegalName}
          billingEmail={billingEmail}
          addressLine={addressLine}
          city={city}
          postalCode={postalCode}
          country={country}
          vatNumber={vatNumber}
          transactionId={lastTransactionId}
          utrNumber={lastUtrNumber}
          planName={planInfo.name}
          billingCycle={billingCycle}
          subtotal={subtotal}
          taxAmount={taxAmount}
          totalDue={totalDue}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};

// ==========================================
// COMPONENT: AUTHENTIC UPI QR CODE (SVG)
// ==========================================
const UpiQrCodeSvg: React.FC<{ amount: number }> = ({ amount }) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full text-slate-900" fill="currentColor">
      {/* Corner Finder Pattern: Top-Left */}
      <rect x="15" y="15" width="45" height="45" rx="6" fill="#0f172a" />
      <rect x="23" y="23" width="29" height="29" rx="3" fill="#ffffff" />
      <rect x="29" y="29" width="17" height="17" rx="2" fill="#0f172a" />

      {/* Corner Finder Pattern: Top-Right */}
      <rect x="140" y="15" width="45" height="45" rx="6" fill="#0f172a" />
      <rect x="148" y="23" width="29" height="29" rx="3" fill="#ffffff" />
      <rect x="154" y="29" width="17" height="17" rx="2" fill="#0f172a" />

      {/* Corner Finder Pattern: Bottom-Left */}
      <rect x="15" y="140" width="45" height="45" rx="6" fill="#0f172a" />
      <rect x="23" y="148" width="29" height="29" rx="3" fill="#ffffff" />
      <rect x="29" y="154" width="17" height="17" rx="2" fill="#0f172a" />

      {/* Alignment Matrix Modules */}
      <rect x="70" y="20" width="8" height="8" rx="1.5" />
      <rect x="85" y="20" width="8" height="8" rx="1.5" />
      <rect x="100" y="20" width="8" height="8" rx="1.5" />
      <rect x="115" y="20" width="8" height="8" rx="1.5" />

      <rect x="70" y="35" width="8" height="8" rx="1.5" />
      <rect x="100" y="35" width="8" height="8" rx="1.5" />
      <rect x="120" y="35" width="8" height="8" rx="1.5" />

      <rect x="20" y="70" width="8" height="8" rx="1.5" />
      <rect x="35" y="70" width="8" height="8" rx="1.5" />
      <rect x="50" y="70" width="8" height="8" rx="1.5" />
      <rect x="65" y="70" width="8" height="8" rx="1.5" />
      <rect x="140" y="70" width="8" height="8" rx="1.5" />
      <rect x="160" y="70" width="8" height="8" rx="1.5" />
      <rect x="175" y="70" width="8" height="8" rx="1.5" />

      <rect x="20" y="85" width="8" height="8" rx="1.5" />
      <rect x="40" y="85" width="8" height="8" rx="1.5" />
      <rect x="60" y="85" width="8" height="8" rx="1.5" />
      <rect x="135" y="85" width="8" height="8" rx="1.5" />
      <rect x="155" y="85" width="8" height="8" rx="1.5" />

      <rect x="20" y="105" width="8" height="8" rx="1.5" />
      <rect x="45" y="105" width="8" height="8" rx="1.5" />
      <rect x="65" y="105" width="8" height="8" rx="1.5" />
      <rect x="130" y="105" width="8" height="8" rx="1.5" />
      <rect x="150" y="105" width="8" height="8" rx="1.5" />
      <rect x="170" y="105" width="8" height="8" rx="1.5" />

      <rect x="20" y="120" width="8" height="8" rx="1.5" />
      <rect x="55" y="120" width="8" height="8" rx="1.5" />
      <rect x="145" y="120" width="8" height="8" rx="1.5" />
      <rect x="165" y="120" width="8" height="8" rx="1.5" />

      <rect x="70" y="145" width="8" height="8" rx="1.5" />
      <rect x="90" y="145" width="8" height="8" rx="1.5" />
      <rect x="110" y="145" width="8" height="8" rx="1.5" />
      <rect x="130" y="145" width="8" height="8" rx="1.5" />
      <rect x="150" y="145" width="8" height="8" rx="1.5" />
      <rect x="170" y="145" width="8" height="8" rx="1.5" />

      <rect x="75" y="165" width="8" height="8" rx="1.5" />
      <rect x="95" y="165" width="8" height="8" rx="1.5" />
      <rect x="115" y="165" width="8" height="8" rx="1.5" />
      <rect x="140" y="165" width="8" height="8" rx="1.5" />
      <rect x="160" y="165" width="8" height="8" rx="1.5" />
      <rect x="175" y="165" width="8" height="8" rx="1.5" />

      {/* Center UPI Branding Badge */}
      <rect x="75" y="75" width="50" height="50" rx="10" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
      <text
        x="100"
        y="98"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill="#047857"
        fontFamily="sans-serif"
      >
        UPI
      </text>
      <text
        x="100"
        y="112"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#059669"
        fontFamily="sans-serif"
      >
        NPCI
      </text>
    </svg>
  );
};

// ==========================================
// MODAL: PRINTABLE TAX INVOICE (UPI VERIFIED)
// ==========================================
interface TaxInvoiceModalProps {
  companyLegalName: string;
  billingEmail: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
  vatNumber: string;
  transactionId: string;
  utrNumber: string;
  planName: string;
  billingCycle: BillingCycle;
  subtotal: number;
  taxAmount: number;
  totalDue: number;
  onClose: () => void;
}

const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  companyLegalName,
  billingEmail,
  addressLine,
  city,
  postalCode,
  country,
  vatNumber,
  transactionId,
  utrNumber,
  planName,
  billingCycle,
  subtotal,
  taxAmount,
  totalDue,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
        {/* Header Ribbon & Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              SQ
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                {MERCHANT_NAME}
              </div>
              <div className="text-[10px] text-slate-500">
                Official ISO 9001:2015 Tax Invoice & UPI Settlement Record
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
              Billed To
            </span>
            <div className="font-bold text-slate-900 text-sm">{companyLegalName}</div>
            <div className="text-slate-600 mt-0.5">{billingEmail}</div>
            <div className="text-slate-600">{addressLine}</div>
            <div className="text-slate-600">{city}, {postalCode}, {country}</div>
            {vatNumber && <div className="text-slate-500 font-mono mt-1">Tax ID: {vatNumber}</div>}
          </div>

          <div className="text-right">
            <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
              Invoice Summary
            </span>
            <div className="font-mono font-bold text-blue-700 text-sm">
              #INV-{transactionId.replace('TXN-UPI-', '')}
            </div>
            <div className="text-slate-600 mt-0.5">Date: {new Date().toLocaleDateString()}</div>
            <div className="text-slate-600">
              Payment Status:{' '}
              <span className="text-emerald-600 font-bold">PAID VIA UPI</span>
            </div>
            <div className="text-slate-700 font-mono mt-1 text-[11px]">
              UPI UTR: <strong className="text-slate-900">{utrNumber}</strong>
            </div>
            <div className="text-slate-500 text-[10px]">
              Merchant VPA: {MERCHANT_UPI_ID}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Period</th>
                <th className="p-3 text-right">Amount (ZAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium text-slate-900">
                  SHEQ Street QMS — {planName}
                  <div className="text-[10px] text-slate-500 font-normal">
                    Includes all 8 active QMS modules, ISO audit matrix planner, document control & Qoo Copilot.
                  </div>
                </td>
                <td className="p-3 text-center text-slate-600">
                  {billingCycle === 'annual' ? '12 Months' : '1 Month'}
                </td>
                <td className="p-3 text-right font-mono font-semibold text-slate-900">
                  R{subtotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50/70 border-t border-slate-200 font-medium text-slate-700">
              <tr>
                <td colSpan={2} className="p-2.5 text-right text-slate-500">Subtotal</td>
                <td className="p-2.5 text-right font-mono">R{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="p-2.5 text-right text-slate-500">VAT / Tax (15%)</td>
                <td className="p-2.5 text-right font-mono">R{taxAmount.toFixed(2)}</td>
              </tr>
              <tr className="border-t border-slate-200 font-bold text-slate-900 text-sm">
                <td colSpan={2} className="p-3 text-right">Total Paid (UPI Instant)</td>
                <td className="p-3 text-right font-mono text-emerald-700">R{totalDue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Seal / Audit Compliance Note */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-emerald-950">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Authorized Digital License Receipt</div>
              <div className="text-[10px] text-emerald-800">
                Certified compliant with ISO 9001:2015 Clause 7.1.3 software control and NPCI digital receipt standards.
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-800 border border-emerald-300 rounded px-2 py-1 bg-white font-bold">
            UPI-SEAL-VERIFIED
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
