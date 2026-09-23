import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { AuthUser } from '../types';
import { SAVED_CREDENTIALS, PRICING_PLANS, CredentialAccount } from '../data/loginData';
import {
  GoogleIcon,
  MicrosoftIcon,
  OAuthModal,
  ForgotPasswordModal,
  OAuthProgressOverlay,
} from './LoginModals';

/* -------------------------------------------------------------------------- */
/* BRAND LOGO COMPONENT                                                       */
/* -------------------------------------------------------------------------- */
const BrandLogo: React.FC<{ lightText?: boolean }> = ({ lightText }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shadow-xs p-1">
      <svg viewBox="0 0 32 32" className="w-full h-full text-white" fill="none">
        <path d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8" stroke="#ea580c" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round" />
      </svg>
    </div>
    <span className={`font-extrabold text-lg tracking-tight ${lightText ? 'text-white' : 'text-slate-900'}`}>
      SHEQ Street
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN LOGIN VIEW                                                            */
/* -------------------------------------------------------------------------- */
interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
  defaultEmail?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, defaultEmail = '' }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>(defaultEmail || '');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState<boolean>(false);

  // Sign up fields
  const [signup, setSignup] = useState({
    name: 'Naveen V',
    company: 'NK Quality Systems Ltd',
    email: '',
    password: '',
    confirmPassword: '',
    showPass: false,
    agreeTerms: true,
  });
  const [signupLinkSent, setSignupLinkSent] = useState(false);
  const [signupLinkPreview, setSignupLinkPreview] = useState<string | null>(null);

  // Modals & Progress
  const [oauthModal, setOauthModal] = useState<'Google' | 'Microsoft' | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [oauthProgress, setOauthProgress] = useState<{ provider: 'Google' | 'Microsoft'; email: string; name: string } | null>(null);

  const emailContainerRef = useRef<HTMLDivElement>(null);

  // Dismiss suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (emailContainerRef.current && !emailContainerRef.current.contains(e.target as Node)) {
        setShowEmailSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Quick auto-redirect for OAuth
  useEffect(() => {
    if (!oauthProgress) return;
    const timer = setTimeout(() => {
      const { email: authEmail, name: authName } = oauthProgress;
      setOauthProgress(null);
      setOauthModal(null);
      handleCompleteSignIn(authEmail, authName);
    }, 400);
    return () => clearTimeout(timer);
  }, [oauthProgress]);

  // Auto-redirect after sign-up link dispatched
  useEffect(() => {
    if (!signupLinkSent) return;
    const timer = setTimeout(() => handleCompleteSignIn(signup.email, signup.name, signup.company), 5000);
    return () => clearTimeout(timer);
  }, [signupLinkSent, signup]);

  const getSavedCompanyName = (): string => {
    try {
      const saved = localStorage.getItem('sheq_company');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return 'nk';
  };

  const handleCompleteSignIn = (loginEmail: string, userName?: string, compName?: string) => {
    const trimmed = (loginEmail || '').trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const derivedName = userName || (trimmed.toLowerCase().includes('naveen') ? 'NAVEEN .V' : trimmed.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    const activeCompName = compName || getSavedCompanyName();
    onLogin({
      id: `usr-${Date.now()}`,
      name: derivedName,
      email: trimmed,
      role: 'SHEQ Quality Lead / ISO 9001 Lead Auditor',
      companyName: activeCompName,
    });
  };

  const handleQuickAutofill = (cred: CredentialAccount, autoSubmit = false) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setShowPassword(false);
    setShowEmailSuggestions(false);
    setErrorMessage('');
    if (autoSubmit) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        handleCompleteSignIn(cred.email, cred.name);
      }, 300);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCompleteSignIn(email);
    }, 400);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!signup.name.trim() || !signup.company.trim() || !signup.email.includes('@')) {
      setErrorMessage('Please fill in all required fields with a valid email.');
      return;
    }
    if (signup.password.length < 6 || signup.password !== signup.confirmPassword) {
      setErrorMessage(signup.password.length < 6 ? 'Password must be at least 6 characters.' : 'Passwords do not match.');
      return;
    }
    if (!signup.agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to proceed.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/send-auth-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signup.email.trim(), companyName: signup.company.trim() }),
      });
      const data = await res.json();
      if (data?.previewUrl) setSignupLinkPreview(data.previewUrl);
    } catch {}
    setIsSubmitting(false);
    setSignupLinkSent(true);
  };

  const filteredCredentials = SAVED_CREDENTIALS.filter(
    c => !email.trim() || c.email.toLowerCase().includes(email.toLowerCase()) || c.name.toLowerCase().includes(email.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row antialiased font-sans text-slate-800">
      {/* LEFT COLUMN: AUTH FORM */}
      <div className="w-full lg:w-[48%] xl:w-[46%] min-h-screen p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-between bg-white relative z-10">
        <div>
          <BrandLogo />
        </div>

        <div className="max-w-sm w-full mx-auto my-auto py-6">
          {authMode === 'signin' ? (
            <div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                Welcome to SHEQ Street
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                Sign in to your account to continue
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Social Logins */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOauthModal('Google')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOauthModal('Microsoft')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <MicrosoftIcon />
                  <span>Continue with Microsoft</span>
                </button>
              </div>

              {/* ⚡ Quick 1-Click Demo Accounts (User-Friendly UX) */}
              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5 px-0.5">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Quick Demo Sign-In</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to enter</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SAVED_CREDENTIALS.map((cred) => (
                    <button
                      key={cred.email}
                      type="button"
                      onClick={() => handleQuickAutofill(cred, true)}
                      title={`Sign in as ${cred.name} (${cred.badge})`}
                      className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-lg text-left transition group cursor-pointer shadow-2xs"
                    >
                      <div className="font-bold text-[11px] text-slate-800 group-hover:text-blue-700 truncate">
                        {cred.badge}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">{cred.initials} • Instant</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400">or sign in with password</span>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div ref={emailContainerRef} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Email</label>
                    {!email && (
                      <button
                        type="button"
                        onClick={() => handleQuickAutofill(SAVED_CREDENTIALS[0])}
                        className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Use {SAVED_CREDENTIALS[0].email}
                      </button>
                    )}
                  </div>
                  <input
                    id="login-email"
                    name="email"
                    autoComplete="username"
                    type="email"
                    value={email}
                    onFocus={() => setShowEmailSuggestions(true)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setShowEmailSuggestions(true);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition bg-white"
                    required
                  />

                  {/* Suggestions dropdown */}
                  {showEmailSuggestions && filteredCredentials.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-200 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 bg-blue-50/80 flex items-center justify-between text-[11px] text-blue-900 font-bold border-b border-blue-100">
                        <span>Saved Accounts</span>
                        <span className="text-[10px] font-normal text-blue-600">Select to autofill</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCredentials.map((cred) => (
                          <div
                            key={cred.email}
                            onMouseDown={(e) => { e.preventDefault(); handleQuickAutofill(cred); }}
                            className="p-2.5 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7 h-7 rounded-full ${cred.color} text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0`}>
                                {cred.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 truncate">{cred.name}</div>
                                <div className="text-[11px] text-slate-500 truncate font-mono">{cred.email}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickAutofill(cred, true); }}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 flex-shrink-0"
                            >
                              <span>Enter</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errorMessage) setErrorMessage(''); }}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 focus:border-blue-500 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !password.trim()}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm shadow-xs transition flex items-center justify-center gap-2 mt-4 ${
                    email.trim() && password.trim() && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Verifying & Dispatched...</span>
                    </div>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between mt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
                <span className="text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              </div>
            </div>
          ) : (
            /* Sign Up View */
            <div>
              {!signupLinkSent ? (
                <div>
                  <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">Create New Account</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">Register your company to begin ISO 9001 compliance.</p>

                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignUpSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={signup.name}
                        onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                        placeholder="Naveen V"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        value={signup.company}
                        onChange={(e) => setSignup({ ...signup, company: e.target.value })}
                        placeholder="NK Quality Systems Ltd"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address *</label>
                      <input
                        type="email"
                        value={signup.email}
                        onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                        placeholder="nv8660970099@gmail.com"
                        className="w-full px-3 py-2 border border-blue-500 rounded-lg text-sm ring-1 ring-blue-500/20 focus:border-blue-600 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                        <input
                          type={signup.showPass ? 'text' : 'password'}
                          value={signup.password}
                          onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                          placeholder="≥ 6 chars"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:border-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm *</label>
                        <input
                          type={signup.showPass ? 'text' : 'password'}
                          value={signup.confirmPassword}
                          onChange={(e) => setSignup({ ...signup, confirmPassword: e.target.value })}
                          placeholder="Re-enter"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:border-blue-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={signup.agreeTerms}
                        onChange={(e) => setSignup({ ...signup, agreeTerms: e.target.checked })}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>I agree to SHEQ Street Terms of Service and ISO data security handling.</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition mt-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account & Send Confirmation Link'}
                    </button>
                  </form>

                  <div className="mt-4 text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              ) : (
                /* Confirmation Card */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Confirmation Link Dispatched!</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A secure sign-in token was sent to <strong className="text-blue-700">{signup.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCompleteSignIn(signup.email, signup.name, signup.company)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Session Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {signupLinkPreview && (
                    <a
                      href={signupLinkPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Dispatched Email Preview</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSignupLinkSent(false); setAuthMode('signin'); }}
                    className="text-xs text-slate-400 hover:text-slate-600 block mx-auto underline cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          ISO 9001:2015 Encrypted Authentication Gateway
        </div>
      </div>

      {/* RIGHT COLUMN: SHOWCASE & PRICING */}
      <div className="w-full lg:w-[52%] xl:w-[54%] bg-[#0c1527] text-white p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-y-auto">
        <BrandLogo lightText />

        <div className="my-8 space-y-6">
          {/* Feature Preview Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111e38] border border-slate-700/80 rounded-xl p-2.5 shadow-md flex flex-col justify-between aspect-[1.4/1]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">Doc Register</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-2 w-3/4 bg-blue-500/30 rounded" />
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <div className="h-4 bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-300 font-bold">ISO 7.5</div>
                  <div className="h-4 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center text-[7px] text-blue-300 font-bold">VERIFIED</div>
                  <div className="h-4 bg-amber-500/20 border border-amber-500/30 rounded flex items-center justify-center text-[7px] text-amber-300 font-bold">ACTIVE</div>
                </div>
                <div className="h-1.5 w-full bg-slate-700/60 rounded mt-1" />
              </div>
            </div>

            <div className="bg-[#111e38] border border-slate-700/80 rounded-xl p-2.5 shadow-md flex flex-col justify-between aspect-[1.4/1]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                <span className="text-[9px] font-mono text-slate-400">Organogram</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center space-y-1">
                <div className="w-10 h-3 bg-blue-600 rounded text-[7px] text-white flex items-center justify-center font-bold">MD</div>
                <div className="w-0.5 h-2 bg-slate-600" />
                <div className="flex gap-2">
                  <div className="w-8 h-3 bg-indigo-600/70 rounded text-[6px] text-white flex items-center justify-center font-bold">QA Lead</div>
                  <div className="w-8 h-3 bg-emerald-600/70 rounded text-[6px] text-white flex items-center justify-center font-bold">Ops</div>
                </div>
              </div>
            </div>

            <div className="bg-[#111e38] border border-slate-700/80 rounded-xl p-2.5 shadow-md flex flex-col justify-between aspect-[1.4/1]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                <span className="text-[9px] font-mono text-cyan-400">85% READINESS</span>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="flex-1 flex items-end gap-1 px-1 pb-1">
                <div className="flex-1 bg-emerald-500/80 rounded-t h-3/4" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-full" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-4/5" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-2/3" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              The modern platform that makes ISO 9001 compliance effortless
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-xl">
              Run your full Quality Management System in one place — with AI-powered document creation, NCRs, audits, supplier & HR management, and more.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">PRICING</div>
            <div className="space-y-3">
              {PRICING_PLANS.map((plan) => (
                <div key={plan.name} className="bg-[#0f1d38]/90 border border-slate-700/70 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{plan.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${plan.badgeColor}`}>
                        {plan.badge}
                      </span>
                    </div>
                    {plan.price && (
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-white">{plan.price}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{plan.period}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold text-xs">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>ISO 9001:2015 Cloud Compliance Platform</span>
          <span className="text-slate-500">SANAS & IRCA Compatible</span>
        </div>
      </div>

      {/* MODALS */}
      {oauthModal && (
        <OAuthModal
          provider={oauthModal}
          accounts={SAVED_CREDENTIALS.slice(0, 2)}
          onClose={() => setOauthModal(null)}
          onSelect={(selectedEmail, selectedName) => {
            setOauthModal(null);
            setOauthProgress({ provider: oauthModal, email: selectedEmail, name: selectedName });
          }}
        />
      )}

      {showForgotModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotModal(false)}
          onSuccessLogin={(resetEmail, newPassword) => {
            setShowForgotModal(false);
            setPassword(newPassword);
            handleCompleteSignIn(resetEmail);
          }}
        />
      )}

      {oauthProgress && (
        <OAuthProgressOverlay
          provider={oauthProgress.provider}
          email={oauthProgress.email}
          onCancel={() => setOauthProgress(null)}
          onEnterNow={() => {
            const { email: aEmail, name: aName } = oauthProgress;
            setOauthProgress(null);
            handleCompleteSignIn(aEmail, aName);
          }}
        />
      )}
    </div>
  );
};
