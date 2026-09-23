import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Clock,
  Sparkles,
  Download,
  ArrowLeft,
  Lock,
  CheckCircle,
  FileText,
  Printer,
  Mail,
  Building,
  Globe,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Calendar,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Company, NavigationTab } from '../../types';

interface BillingPlanViewProps {
  company: Company;
  onUpdateCompany?: (updated: Partial<Company>) => void;
  onNavigate?: (tab: NavigationTab) => void;
}

type PlanType = 'starter' | 'pro' | 'enterprise';
type BillingCycle = 'monthly' | 'annual';
type PaymentMethodType = 'card' | 'bank' | 'paypal';

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

export const BillingPlanView: React.FC<BillingPlanViewProps> = ({
  company,
  onUpdateCompany,
  onNavigate,
}) => {
  // Mode state: 'plans' = catalog, 'checkout' = payment mode, 'success' = confirmation
  const [viewMode, setViewMode] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('starter');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');

  // Card details form
  const [cardholderName, setCardholderName] = useState<string>(company?.name || 'Naveen V');
  const [cardNumber, setCardNumber] = useState<string>('4532 8901 2345 4109');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('392');
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Bank Transfer EFT details
  const [payerBank, setPayerBank] = useState<string>('Standard Corporate Bank');
  const [payerAccountHolder, setPayerAccountHolder] = useState<string>(company?.name || 'NK Enterprise Ltd');
  const [payerReference, setPayerReference] = useState<string>('INV-SHEQ-89241');
  const [remittanceEmail, setRemittanceEmail] = useState<string>(company?.email || 'nv8660970099@gmail.com');

  // PayPal details
  const [paypalEmail, setPaypalEmail] = useState<string>(company?.email || 'finance@nkenterprise.com');

  // Billing Address & Company Tax Information
  const [companyLegalName, setCompanyLegalName] = useState<string>(company?.name || 'NK Quality Systems Ltd');
  const [billingEmail, setBillingEmail] = useState<string>(company?.email || 'nv8660970099@gmail.com');
  const [vatNumber, setVatNumber] = useState<string>('ZA-490219802');
  const [addressLine, setAddressLine] = useState<string>('14 Long Street, 4th Floor, Tech Hub');
  const [city, setCity] = useState<string>('Johannesburg');
  const [postalCode, setPostalCode] = useState<string>('2000');
  const [country, setCountry] = useState<string>('South Africa');
  const [includeTax, setIncludeTax] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Synchronize billing fields whenever company prop changes
  useEffect(() => {
    if (company?.name) {
      setCompanyLegalName(company.name);
      setPayerAccountHolder(company.name);
    }
    if (company?.email) {
      setBillingEmail(company.email);
      setRemittanceEmail(company.email);
    }
    if (company?.address) {
      setAddressLine(company.address);
    }
  }, [company]);

  // Processing & UI state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [lastTransactionId, setLastTransactionId] = useState<string>('TXN-SHEQ-2026-98412');
  const [paymentSuccessNotification, setPaymentSuccessNotification] = useState<string | null>(null);

  // Determine card type based on number
  const getCardType = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^6(011|5)/.test(clean)) return 'Discover';
    return 'Credit Card';
  };

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const parts = clean.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : clean);
    if (formErrors.cardNumber) {
      setFormErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Format expiry date MM/YY
  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
    if (formErrors.cardExpiry) {
      setFormErrors((prev) => ({ ...prev, cardExpiry: '' }));
    }
  };

  // Pricing calculations
  const planInfo = PLANS[selectedPlan];
  const unitPrice = billingCycle === 'annual' ? planInfo.annualMonthlyPrice : planInfo.monthlyPrice;
  const subtotal = billingCycle === 'annual' ? unitPrice * 12 : unitPrice;
  const regularAnnualPrice = planInfo.monthlyPrice * 12;
  const annualSavings = billingCycle === 'annual' ? regularAnnualPrice - subtotal : 0;
  const taxRate = includeTax ? 0.15 : 0; // 15% VAT
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalDue = Math.round((subtotal + taxAmount) * 100) / 100;

  // Handle plan transition into Payment Mode
  const handleEnterPaymentMode = (planId?: PlanType) => {
    if (planId) {
      setSelectedPlan(planId);
    }
    setViewMode('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!cardholderName.trim()) errors.cardholderName = 'Cardholder name is required';
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) errors.cardNumber = 'Valid 15-16 digit card number is required';
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        errors.cardExpiry = 'Format MM/YY required';
      }
      if (cardCvc.length < 3) errors.cardCvc = 'Valid CVV (3-4 digits) required';
    } else if (paymentMethod === 'bank') {
      if (!payerAccountHolder.trim()) errors.payerAccountHolder = 'Account holder name is required';
      if (!payerReference.trim()) errors.payerReference = 'Transaction reference is required';
      if (!remittanceEmail.trim() || !remittanceEmail.includes('@')) {
        errors.remittanceEmail = 'Valid notification email is required';
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail.trim() || !paypalEmail.includes('@')) {
        errors.paypalEmail = 'Valid PayPal account email is required';
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

  // Submit payment & simulate transaction processing
  const handleProcessPayment = () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStep('Establishing 256-bit encrypted connection to banking gateway...');

    setTimeout(() => {
      setProcessingProgress(45);
      setProcessingStep('Authorizing credentials and checking 3D Secure / OTP clearance...');
    }, 500);

    setTimeout(() => {
      setProcessingProgress(80);
      setProcessingStep('Activating ISO 9001:2015 multi-seat enterprise license...');
    }, 1000);

    setTimeout(() => {
      setProcessingProgress(100);
      setProcessingStep('Payment cleared! Generating official invoice...');

      const newTxnId = `TXN-SHEQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setLastTransactionId(newTxnId);

      // Update company subscription state in app and storage
      const planNameFormatted =
        selectedPlan === 'pro'
          ? 'Professional'
          : selectedPlan === 'starter'
          ? 'Starter'
          : 'Enterprise';

      if (onUpdateCompany) {
        onUpdateCompany({
          plan: planNameFormatted,
          daysRemaining: billingCycle === 'annual' ? 365 : 30,
        });
      }

      setIsProcessing(false);
      setViewMode('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  };

  const handleSendEmailReceipt = () => {
    setPaymentSuccessNotification(
      `Official Tax Invoice & Payment Receipt was successfully dispatched to ${billingEmail}!`
    );
    setTimeout(() => {
      setPaymentSuccessNotification(null);
    }, 5000);
  };

  // ==========================================
  // RENDER: PAYMENT SUCCESS VIEW
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
          {/* Decorative background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-emerald-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Animated Success Badge */}
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-400 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            Payment Verified & License Active
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank You! Your QMS Subscription is Active
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
            Your payment of{' '}
            <strong className="text-slate-900 font-bold">
              R{totalDue.toLocaleString()} ZAR
            </strong>{' '}
            was successfully processed. Your organization now enjoys complete, unrestricted access
            to the SHEQ Street Quality Management System.
          </p>

          {/* Transaction Metadata Card */}
          <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 max-w-2xl mx-auto text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Transaction Reference</span>
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
              <span className="text-slate-400 block font-medium">Payment Method</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {paymentMethod === 'card'
                  ? `${getCardType(cardNumber)} •••• ${cardNumber.replace(/\s+/g, '').slice(-4) || '4109'}`
                  : paymentMethod === 'bank'
                  ? `Bank Transfer (${payerBank})`
                  : `PayPal (${paypalEmail})`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">License Period</span>
              <span className="font-semibold text-emerald-700 mt-0.5 block">
                {billingCycle === 'annual' ? '365 Days Active' : '30 Days Active'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Billed Entity</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {companyLegalName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Billing Email</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {billingEmail}
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

        {/* Tax Invoice Modal */}
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
            planName={planInfo.name}
            billingCycle={billingCycle}
            subtotal={subtotal}
            taxAmount={taxAmount}
            totalDue={totalDue}
            paymentMethod={paymentMethod}
            cardNumber={cardNumber}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: PAYMENT MODE (CHECKOUT / PAYMENT DETAILS)
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
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Payment Mode
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Secure Checkout & Payment Details
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
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
            <span>2. Payment Details</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px]">
              3
            </div>
            <span>3. Activation</span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Details Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Method Selector Tabs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mb-1.5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-xs">Credit / Debit Card</div>
                    <div className="text-[10px] text-slate-500">Visa, MC, Amex</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <Building className={`w-5 h-5 mb-1.5 ${paymentMethod === 'bank' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-xs">Bank EFT / Wire</div>
                    <div className="text-[10px] text-slate-500">Direct Deposit</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <Globe className={`w-5 h-5 mb-1.5 ${paymentMethod === 'paypal' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-xs">PayPal</div>
                    <div className="text-[10px] text-slate-500">Instant Checkout</div>
                  </div>
                </button>
              </div>
            </div>

            {/* IF CARD SELECTED: Interactive 3D Visual Card & Input Fields */}
            {paymentMethod === 'card' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Card Payment Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your corporate or debit card details for secure instant licensing.
                  </p>
                </div>

                {/* 3D Realistic Virtual Credit Card Preview */}
                <div className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl p-6 text-white bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-xl border border-slate-700/60 overflow-hidden flex flex-col justify-between select-none">
                  {/* Holographic light streak reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                  <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Top: Chip & Network Logo */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      {/* EMV Chip */}
                      <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border border-amber-500/80 p-1 flex flex-col justify-between shadow-xs">
                        <div className="w-full h-0.5 bg-amber-600/50" />
                        <div className="w-full h-0.5 bg-amber-600/50" />
                      </div>
                      {/* Contactless waves icon */}
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 10c1-1 2-1 3 0m-4-3c2.5-2.5 5.5-2.5 8 0m-10-3c4-4 8-4 12 0" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold tracking-widest text-slate-300 uppercase">
                        {getCardType(cardNumber)}
                      </span>
                      {getCardType(cardNumber) === 'Mastercard' ? (
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-500/90" />
                          <div className="w-6 h-6 rounded-full bg-amber-400/90" />
                        </div>
                      ) : (
                        <div className="w-7 h-5 rounded bg-blue-600 font-black italic text-white flex items-center justify-center text-[10px]">
                          VISA
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="relative z-10 my-2">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-0.5">
                      Card Number
                    </div>
                    <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100">
                      {cardNumber || '•••• •••• •••• 4109'}
                    </div>
                  </div>

                  {/* Card Bottom: Holder Name & Expiry */}
                  <div className="flex items-end justify-between relative z-10 text-xs">
                    <div>
                      <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                        Cardholder Name
                      </div>
                      <div className="font-semibold tracking-wider uppercase text-slate-100 truncate max-w-[200px]">
                        {cardholderName || 'CARDHOLDER NAME'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                        Expires
                      </div>
                      <div className="font-mono font-bold text-slate-100">
                        {cardExpiry || 'MM/YY'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cardholder Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => {
                        setCardholderName(e.target.value);
                        if (formErrors.cardholderName) {
                          setFormErrors((prev) => ({ ...prev, cardholderName: '' }));
                        }
                      }}
                      placeholder="e.g. Naveen V"
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.cardholderName
                          ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                          : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
                      }`}
                    />
                    {formErrors.cardholderName && (
                      <span className="text-xs text-red-500 mt-1 block">
                        {formErrors.cardholderName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-3.5 py-2.5 pl-10 border rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 transition-all ${
                          formErrors.cardNumber
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
                        }`}
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <div className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                        {getCardType(cardNumber)}
                      </div>
                    </div>
                    {formErrors.cardNumber && (
                      <span className="text-xs text-red-500 mt-1 block">
                        {formErrors.cardNumber}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 transition-all ${
                          formErrors.cardExpiry
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.cardExpiry && (
                        <span className="text-xs text-red-500 mt-1 block">
                          {formErrors.cardExpiry}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>CVC / CVV <span className="text-red-500">*</span></span>
                        <span className="text-[10px] text-slate-400 font-normal">3-4 digits on back</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => {
                            setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                            if (formErrors.cardCvc) {
                              setFormErrors((prev) => ({ ...prev, cardCvc: '' }));
                            }
                          }}
                          placeholder="•••"
                          maxLength={4}
                          className={`w-full px-3.5 py-2.5 pl-10 border rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 transition-all ${
                            formErrors.cardCvc
                              ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                              : 'border-slate-300 focus:ring-blue-100 focus:border-blue-600'
                          }`}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                      {formErrors.cardCvc && (
                        <span className="text-xs text-red-500 mt-1 block">
                          {formErrors.cardCvc}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Store card securely for automated renewal (cancel anytime)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* IF BANK TRANSFER SELECTED */}
            {paymentMethod === 'bank' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Direct Bank Transfer / EFT</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay via official corporate electronic funds transfer or wire. License activates immediately upon receipt confirmation.
                  </p>
                </div>

                {/* Beneficiary Details Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-slate-800 text-sm mb-1">
                    Official SHEQ Street Beneficiary Bank Account
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Beneficiary Name:</span>
                      <strong className="text-slate-800">SHEQ Street International Ltd</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bank:</span>
                      <strong className="text-slate-800">First National Bank (FNB)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Account Number:</span>
                      <strong className="font-mono text-slate-800">6289 4019 824</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Branch Code / SWIFT:</span>
                      <strong className="font-mono text-slate-800">250655 / FIRNZAJJ</strong>
                    </div>
                  </div>
                </div>

                {/* User Bank Remittance Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Originating Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={payerBank}
                      onChange={(e) => setPayerBank(e.target.value)}
                      placeholder="e.g. Standard Bank, JPMorgan, HSBC"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={payerAccountHolder}
                      onChange={(e) => setPayerAccountHolder(e.target.value)}
                      placeholder="Organization or account name making the payment"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Payment Reference / POP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={payerReference}
                        onChange={(e) => setPayerReference(e.target.value)}
                        placeholder="e.g. REF-SHEQ-89241"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Remittance Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={remittanceEmail}
                        onChange={(e) => setRemittanceEmail(e.target.value)}
                        placeholder="finance@yourcompany.com"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IF PAYPAL SELECTED */}
            {paymentMethod === 'paypal' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">PayPal Express Checkout</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fast and protected payment via your linked PayPal balance or corporate card.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PayPal Account Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="paypal@yourdomain.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>
                    When you click <strong>Pay & Activate</strong>, you will also receive an instant PayPal buyer protection confirmation receipt.
                  </span>
                </div>
              </div>
            )}

            {/* Billing Address & Organization Tax Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Billing Address & Tax Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This information appears on your official ISO tax invoices and audit records.
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    VAT / Tax Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="e.g. ZA-490219802"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  >
                    <option value="South Africa">South Africa</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                    <option value="India">India</option>
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal / ZIP"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
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
                      if (formErrors.agreeTerms) {
                        setFormErrors((prev) => ({ ...prev, agreeTerms: '' }));
                      }
                    }}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I confirm that I am authorized to bind{' '}
                    <strong>{companyLegalName || 'this organization'}</strong> to the SHEQ Street QMS
                    Subscription Agreement and ISO data confidentiality standards.
                  </span>
                </label>
                {formErrors.agreeTerms && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {formErrors.agreeTerms}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Order Summary</h3>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  {billingCycle === 'annual' ? 'Annual (Save 20%)' : 'Monthly'}
                </span>
              </div>

              {/* Selected Plan Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{planInfo.name}</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    R{unitPrice}/mo
                  </div>
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

              {/* Billing Cycle Switch in Summary */}
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
                  <span>Base Subscription ({billingCycle === 'annual' ? '12 Months' : '1 Month'})</span>
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
                  <span className="font-semibold text-slate-800">
                    R{taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Due Today</span>
                  <span className="text-blue-600 text-xl font-black">
                    R{totalDue.toFixed(2)} <span className="text-xs text-slate-500 font-normal">ZAR</span>
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>Pay R{totalDue.toFixed(2)} & Activate License</span>
              </button>

              {/* Security Guarantees */}
              <div className="space-y-2 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>30-day money-back guarantee — zero risk.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Instant license key generation & module unlocking.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Next billing date: {new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 86400000).toLocaleDateString()}.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-step Processing Loader Modal */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin mx-auto flex items-center justify-center text-blue-600">
                <RefreshCw className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Processing Secure Payment
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {processingStep}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>PCI-DSS Level 1 Banking Vault Tokenization</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: DEFAULT PLANS OVERVIEW
  // ==========================================
  const isPaidActive = company.plan && company.plan !== 'TRIAL' && company.plan !== 'Trial';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-600 font-semibold">{company.name}</span>
        {isPaidActive ? (
          <span className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wider">
            {company.plan.toUpperCase()} ACTIVE
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded border border-amber-300/80 bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider">
            TRIAL
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your SHEQ Street QMS license, invoices, and secure payment methods.
          </p>
        </div>
      </div>

      {/* Current Subscription Card (Screenshot 1) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Card Header */}
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Current Subscription</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your active plan and billing details</p>
          </div>
        </div>

        {/* Plan Row */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <CreditCard className="w-5 h-5" />
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

        {/* Amber Banner (Free Trial notification) */}
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
                8 days remaining. Subscribe below to keep full access. Trial ends: 30 September 2026.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AVAILABLE PLANS — MONTHLY (ZAR) (Screenshot 2) */}
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
              <p className="text-xs text-slate-500 mt-1">
                Perfect for small teams getting started with QMS.
              </p>

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
              className="w-full mt-8 py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span>Subscribe</span>
            </button>
          </div>

          {/* Card 2: Professional (Coming Soon) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs relative">
            {/* Centered COMING SOON Top Pill */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#54687c] text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
              COMING SOON
            </div>

            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Star className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Professional</h4>
              <p className="text-xs text-slate-500 mt-1">
                Everything in Starter plus advanced features for growing teams.
              </p>

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
                  <span>Multi-site / multi-office organogram with team separation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Additional tools</span>
                </li>
              </ul>

              <p className="text-xs text-slate-500 mt-6 leading-relaxed">
                Professional plan coming soon — includes multi-site organogram, team splitting across
                offices/sites, and additional tools for multi-location companies.
              </p>
            </div>

            <button
              disabled
              className="w-full mt-8 py-2.5 px-4 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed text-center"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center max-w-4xl text-xs text-slate-600 pt-2">
          Extra users (on either plan): <strong className="font-bold text-slate-900">R99 per additional user per month</strong>
        </div>
      </div>

      {/* Payment Method & Card Details Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">
              {getCardType(cardNumber)} ending in •••• {cardNumber.replace(/\s+/g, '').slice(-4) || '4109'}
            </div>
            <div className="text-xs text-slate-500">
              Expires {cardExpiry || '08/28'} • Primary card on file
            </div>
          </div>
        </div>

        <button
          onClick={() => handleEnterPaymentMode()}
          className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-100 self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Update Payment Details / Mode</span>
        </button>
      </div>

      {/* Billing Invoices History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Invoices & Payment Records</h3>
            <p className="text-xs text-slate-500">
              Download formal VAT tax invoices for ISO audit reporting.
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
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-mono font-semibold text-slate-800">INV-SHEQ-2026-0921</td>
                <td className="py-3">Sep 21, 2026</td>
                <td className="py-3">Professional QMS (Annual Subscription)</td>
                <td className="py-3 font-semibold text-slate-900">R1 199.00</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    PAID
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
                <td className="py-3 font-mono font-semibold text-slate-800">INV-SHEQ-2025-0814</td>
                <td className="py-3">Aug 14, 2025</td>
                <td className="py-3">ISO 9001:2015 Pre-Audit Toolkit Setup</td>
                <td className="py-3 font-semibold text-slate-900">R899.00</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                    PAID
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

      {/* Tax Invoice Modal */}
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
          planName={planInfo.name}
          billingCycle={billingCycle}
          subtotal={subtotal}
          taxAmount={taxAmount}
          totalDue={totalDue}
          paymentMethod={paymentMethod}
          cardNumber={cardNumber}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};

// ==========================================
// TAX INVOICE MODAL (PRINTABLE / PDF READY)
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
  planName: string;
  billingCycle: BillingCycle;
  subtotal: number;
  taxAmount: number;
  totalDue: number;
  paymentMethod: PaymentMethodType;
  cardNumber: string;
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
  planName,
  billingCycle,
  subtotal,
  taxAmount,
  totalDue,
  paymentMethod,
  cardNumber,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
        {/* Header Ribbon & Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-xs">
              SQ
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                SHEQ STREET QMS INTERNATIONAL
              </div>
              <div className="text-[10px] text-slate-500">
                Official ISO 9001:2015 Tax Invoice & Audit Receipt
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
              #INV-{transactionId.replace('TXN-SHEQ-', '')}
            </div>
            <div className="text-slate-600 mt-0.5">Date: {new Date().toLocaleDateString()}</div>
            <div className="text-slate-600">
              Payment Status:{' '}
              <span className="text-emerald-600 font-bold">PAID IN FULL</span>
            </div>
            <div className="text-slate-500 mt-1">
              Method: {paymentMethod === 'card' ? `Card •••• ${cardNumber.replace(/\s+/g, '').slice(-4) || '4109'}` : paymentMethod.toUpperCase()}
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
                <td colSpan={2} className="p-3 text-right">Total Paid</td>
                <td className="p-3 text-right font-mono text-blue-700">R{totalDue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Seal / Audit Compliance Note */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-blue-950">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Authorized Digital License Receipt</div>
              <div className="text-[10px] text-blue-800">
                This document is certified compliant with ISO 9001:2015 Clause 7.1.3 software control standards.
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 border border-slate-300 rounded px-2 py-1 bg-white">
            SEAL-VERIFIED-OK
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
