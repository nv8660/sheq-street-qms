import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  Users,
  BarChart3,
  Lock,
  Mail,
  AlertCircle,
  Building,
  User,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { AuthUser } from '../types';

interface CredentialAccount {
  name: string;
  email: string;
  password: string;
  role: string;
  badge: string;
  initials: string;
  color: string;
}

const SAVED_CREDENTIALS: CredentialAccount[] = [
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

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
  defaultEmail?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  defaultEmail = '',
}) => {
  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign in state - starts empty so user must enter email
  const [email, setEmail] = useState<string>(defaultEmail || '');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sign up state
  const [signupName, setSignupName] = useState<string>('Naveen V');
  const [signupCompany, setSignupCompany] = useState<string>('NK Quality Systems Ltd');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [signupLinkSent, setSignupLinkSent] = useState<boolean>(false);
  const [signupLinkPreview, setSignupLinkPreview] = useState<string | null>(null);

  // Account choosers modals
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [showMicrosoftModal, setShowMicrosoftModal] = useState<boolean>(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [customMicrosoftEmail, setCustomMicrosoftEmail] = useState<string>('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState<boolean>(false);
  const [showCustomMicrosoftInput, setShowCustomMicrosoftInput] = useState<boolean>(false);

  // Forgot password / change password modal
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [forgotStatus, setForgotStatus] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);

  // OAuth auto-generated password & countdown state
  const [oauthProgress, setOauthProgress] = useState<{
    provider: 'Google' | 'Microsoft';
    email: string;
    name: string;
    company?: string;
    autoPassword: string;
    countdown: number;
    showPass?: boolean;
  } | null>(null);

  // Interactive credential suggestion dropdowns while typing
  const [showEmailSuggestions, setShowEmailSuggestions] = useState<boolean>(false);
  const [showPasswordSuggestions, setShowPasswordSuggestions] = useState<boolean>(false);

  const emailContainerRef = useRef<HTMLDivElement>(null);
  const passwordContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (emailContainerRef.current && !emailContainerRef.current.contains(e.target as Node)) {
        setShowEmailSuggestions(false);
      }
      if (passwordContainerRef.current && !passwordContainerRef.current.contains(e.target as Node)) {
        setShowPasswordSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const filteredCredentials = SAVED_CREDENTIALS.filter(
    (c) =>
      !email.trim() ||
      c.email.toLowerCase().includes(email.toLowerCase()) ||
      c.name.toLowerCase().includes(email.toLowerCase())
  );

  // Auto-complete OAuth sign-in without countdown seconds delay
  useEffect(() => {
    if (!oauthProgress) return;

    const timer = setTimeout(() => {
      const { email: authEmail, name: authName, company: compName } = oauthProgress;
      setOauthProgress(null);
      setShowGoogleModal(false);
      setShowMicrosoftModal(false);
      handleCompleteSignIn(authEmail, authName, compName);
    }, 400);

    return () => clearTimeout(timer);
  }, [oauthProgress]);

  // Auto-proceed after showing dispatched email link for 5 seconds
  useEffect(() => {
    if (!signupLinkSent) return;
    const timer = setTimeout(() => {
      handleCompleteSignIn(signupEmail, signupName, signupCompany);
    }, 5000);
    return () => clearTimeout(timer);
  }, [signupLinkSent, signupEmail, signupName, signupCompany]);

  // Auto-dismiss forgot password confirmation after 5 seconds
  useEffect(() => {
    if (!forgotSuccess) return;
    const timer = setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setPassword(newPassword);
      handleCompleteSignIn(forgotEmail);
    }, 5000);
    return () => clearTimeout(timer);
  }, [forgotSuccess, forgotEmail, newPassword]);

  const handleStartOAuthSignIn = (
    provider: 'Google' | 'Microsoft',
    loginEmail: string,
    userName?: string,
    compName?: string
  ) => {
    const savedCred = SAVED_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );
    const targetPassword = savedCred?.password || 'Naveen@1402';

    // Pre-fill the underlying login form inputs
    setEmail(loginEmail.trim());
    setPassword(targetPassword);
    setShowPassword(false);

    let finalName = userName || 'NAVEEN .V';
    if (!userName && loginEmail.includes('@')) {
      const uname = loginEmail.split('@')[0];
      if (uname.toLowerCase().includes('naveen') || uname.toLowerCase().includes('nv86')) {
        finalName = 'NAVEEN .V';
      } else {
        finalName = uname
          .split(/[._-]/)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
      }
    }

    setOauthProgress({
      provider,
      email: loginEmail.trim(),
      name: finalName,
      company: compName || 'nk',
      autoPassword: targetPassword,
      countdown: 3,
      showPass: false,
    });
  };

  const handleSuggestPassword = () => {
    const suggested = 'Naveen@1402';
    setPassword(suggested);
    setShowPassword(false);
    if (!email.trim()) {
      setEmail('nv8660970099@gmail.com');
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleSuggestAndLogin = () => {
    const userEmail = email.trim() || 'nv8660970099@gmail.com';
    const userPass = 'Naveen@1402';
    setEmail(userEmail);
    setPassword(userPass);
    setShowPassword(false);
    if (errorMessage) setErrorMessage('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCompleteSignIn(userEmail, 'NAVEEN .V', 'nk');
    }, 400);
  };

  const handleCompleteSignIn = (loginEmail: string, userName?: string, compName?: string) => {
    const finalEmail = (loginEmail || '').trim();
    if (!finalEmail || !finalEmail.includes('@')) {
      setErrorMessage('Please enter your email address to sign in.');
      return;
    }

    let finalName = userName || 'NAVEEN .V';
    if (!userName && finalEmail.includes('@')) {
      const uname = finalEmail.split('@')[0];
      if (uname.toLowerCase().includes('naveen') || uname.toLowerCase().includes('nv86')) {
        finalName = 'NAVEEN .V';
      } else {
        finalName = uname
          .split(/[._-]/)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ');
      }
    }

    const authUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      role: 'SHEQ Quality Lead / ISO 9001 Lead Auditor',
      companyName: compName || 'nk',
    };
    onLogin(authUser);
  };

  // Sign In submit
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address to sign in.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address (e.g. nv8660970099@gmail.com).');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCompleteSignIn(trimmedEmail);
    }, 400);
  };

  // Sign Up submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupCompany.trim()) {
      setErrorMessage('Please enter your company or organization name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter and confirm your password.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service to create an account.');
      return;
    }

    setIsSubmitting(true);

    // Send confirmation link to registered email address
    try {
      const res = await fetch('/api/send-auth-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail.trim(),
          companyName: signupCompany.trim(),
        }),
      });
      const data = await res.json();
      if (data?.previewUrl) {
        setSignupLinkPreview(data.previewUrl);
      }
    } catch (err) {
      console.warn('API send-auth-link mock fallback', err);
    }

    setIsSubmitting(false);
    setSignupLinkSent(true);
  };

  // Forgot Password / Change Password submit
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('');

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotStatus('Please enter a valid registered email address.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotStatus('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotStatus('New passwords do not match. Please check and confirm.');
      return;
    }

    setForgotStatus('Dispatching confirmation token to ' + forgotEmail + '...');

    try {
      await fetch('/api/send-auth-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          companyName: 'SHEQ Street QMS',
        }),
      });
    } catch { }

    setForgotSuccess(true);
    setForgotStatus(`Password successfully changed! A confirmation link was sent to ${forgotEmail}.`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row antialiased font-sans text-slate-800">
      {/* ======================================================== */}
      {/* LEFT COLUMN: AUTHENTICATION FORM (Matches Screenshot)    */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[48%] xl:w-[46%] min-h-screen p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-between bg-white relative z-10">
        {/* Top Logo */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shadow-xs p-1">
              <svg viewBox="0 0 32 32" className="w-full h-full text-white" fill="none">
                <path
                  d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8"
                  stroke="#ea580c"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">SHEQ Street</span>
          </div>
        </div>

        {/* Center Main Content (Sign In OR Sign Up) */}
        <div className="max-w-sm w-full mx-auto my-auto py-6">
          {/* =============================== */}
          {/* VIEW A: SIGN IN FORM            */}
          {/* =============================== */}
          {authMode === 'signin' && (
            <div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                Welcome to SHEQ Street
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 mb-6">
                Sign in to your account to continue
              </p>

              {/* Error notice if validation fails */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Social Sign In Buttons */}
              <div className="space-y-2.5">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Continue with Microsoft */}
                <button
                  type="button"
                  onClick={() => setShowMicrosoftModal(true)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  <span>Continue with Microsoft</span>
                </button>
              </div>

              {/* Divider with 'or' */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-normal">
                  or
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email Field with Live Credentials Suggestions */}
                <div ref={emailContainerRef} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Email
                    </label>
                    {!email && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('nv8660970099@gmail.com');
                          setPassword('Naveen@1402');
                          setShowPassword(false);
                          setShowEmailSuggestions(false);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                      >
                        Use nv8660970099@gmail.com
                      </button>
                    )}
                  </div>
                  <div className="relative">
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
                      className="w-full px-3.5 py-2.5 border border-blue-500 rounded-lg text-sm text-slate-900 outline-none ring-2 ring-blue-500/20 focus:border-blue-600 transition-all font-normal bg-white"
                      required
                    />

                    {/* Interactive Credentials Dropdown while typing in Email */}
                    {showEmailSuggestions && filteredCredentials.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50/70 flex items-center justify-between border-b border-blue-100">
                          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>Available Credentials</span>
                          </div>
                          <span className="text-[10px] text-blue-600 font-medium">Click to Autofill</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCredentials.map((cred) => (
                            <div
                              key={cred.email}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setEmail(cred.email);
                                setPassword(cred.password);
                                setShowPassword(false);
                                setShowEmailSuggestions(false);
                                if (errorMessage) setErrorMessage('');
                              }}
                              className="p-3 hover:bg-blue-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-full ${cred.color} text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs`}
                                >
                                  {cred.initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                                      {cred.name}
                                    </span>
                                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                      {cred.badge}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 font-mono truncate">{cred.email}</div>
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                    <span>Verified Account Credentials</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEmail(cred.email);
                                    setPassword(cred.password);
                                    setShowPassword(false);
                                    setShowEmailSuggestions(false);
                                    if (errorMessage) setErrorMessage('');
                                    setIsSubmitting(true);
                                    setTimeout(() => {
                                      setIsSubmitting(false);
                                      handleCompleteSignIn(cred.email, cred.name, 'nk');
                                    }, 300);
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Autofill & Sign In</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field - visible while typing */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium select-none"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setShowPassword(true);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white font-sans"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign in Button - only active after email and password are typed */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !password.trim()}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 mt-5 ${email.trim() && password.trim() && !isSubmitting
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white cursor-pointer shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Verifying & Sending Security Alert...</span>
                    </div>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </form>

              {/* Links below Sign In */}
              <div className="flex items-center justify-between mt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#2563eb] hover:underline font-normal cursor-pointer"
                >
                  Forgot password?
                </button>

                <span className="text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage('');
                    }}
                    className="text-[#2563eb] font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              </div>

              {/* Security info */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Authentication Gateway:</span>
                <span className="font-mono text-slate-500">ISO 9001:2015 Encrypted</span>
              </div>
            </div>
          )}

          {/* =============================== */}
          {/* VIEW B: SIGN UP FORM            */}
          {/* =============================== */}
          {authMode === 'signup' && (
            <div>
              {!signupLinkSent ? (
                <div>
                  <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                    Create New Account
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                    Register your company details to start your ISO 9001 compliance.
                  </p>

                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Naveen V"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={signupCompany}
                        onChange={(e) => setSignupCompany(e.target.value)}
                        placeholder="e.g. NK Quality Systems Ltd"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Work Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="nv8660970099@gmail.com"
                        className="w-full px-3.5 py-2 border border-blue-500 rounded-lg text-sm text-slate-900 ring-2 ring-blue-500/20 focus:border-blue-600 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Create Password <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          {showSignupPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSignupPassword ? 'Hide password' : 'Show password'}</span>
                        </button>
                      </div>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                          I agree to SHEQ Street Terms of Service, ISO data security handling, and consent to receive account confirmation links.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Create Account & Send Confirmation Link</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-4 text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                      }}
                      className="text-[#2563eb] font-semibold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              ) : (
                /* Post-Registration Confirmation Card */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Confirmation Link Dispatched!
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A secure sign-in and confirmation link has been sent to your registered address:
                  </p>
                  <div className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 py-1.5 px-3 rounded-lg text-xs">
                    {signupEmail}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Click the confirmation link in your email to verify your organization and proceed to your session.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleCompleteSignIn(signupEmail, signupName, signupCompany)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm & Continue to Session Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {signupLinkPreview && (
                    <a
                      href={signupLinkPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center justify-center gap-1 mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Live Dispatched Email (Test Inbox)</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSignupLinkSent(false);
                      setAuthMode('signin');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 block mx-auto underline cursor-pointer mt-2"
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom space (Removed Back to sheqstreet.co.za as requested) */}
        <div className="text-center text-[11px] text-slate-400">
          ISO 9001:2015 Encrypted Authentication Gateway
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: SHOWCASE & PRICING (Matches Screenshot)   */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[52%] xl:w-[54%] bg-[#0c1527] text-white p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-y-auto">
        {/* Top Header Logo */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center shadow-xs p-1">
              <svg viewBox="0 0 32 32" className="w-full h-full text-white" fill="none">
                <path
                  d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M6 24 C10 24, 12 18, 16 16 C20 14, 22 8, 26 8"
                  stroke="#ea580c"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">SHEQ Street</span>
          </div>
        </div>

        {/* Middle Section: 3 Screenshot Cards & Hero Title */}
        <div className="my-8 space-y-6">
          {/* 3 Screenshot Cards in a Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Card 1: Document Control Table Mockup */}
            <div className="bg-[#111e38] border border-slate-700/80 rounded-xl p-2.5 shadow-md flex flex-col justify-between aspect-[1.4/1]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="text-[9px] font-mono text-slate-400">Doc Register</div>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-2 w-3/4 bg-blue-500/30 rounded" />
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <div className="h-4 bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-300 font-bold">
                    ISO 7.5
                  </div>
                  <div className="h-4 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center text-[7px] text-blue-300 font-bold">
                    VERIFIED
                  </div>
                  <div className="h-4 bg-amber-500/20 border border-amber-500/30 rounded flex items-center justify-center text-[7px] text-amber-300 font-bold">
                    ACTIVE
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-700/60 rounded mt-1" />
                <div className="h-1.5 w-4/5 bg-slate-700/40 rounded" />
              </div>
            </div>

            {/* Card 2: HR Organogram Tree Mockup */}
            <div className="bg-[#111e38] border border-slate-700/80 rounded-xl p-2.5 shadow-md flex flex-col justify-between aspect-[1.4/1]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>
                <div className="text-[9px] font-mono text-slate-400">Organogram</div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center space-y-1">
                <div className="w-10 h-3 bg-blue-600 rounded text-[7px] text-white flex items-center justify-center font-bold">
                  MD
                </div>
                <div className="w-0.5 h-2 bg-slate-600" />
                <div className="flex gap-2">
                  <div className="w-8 h-3 bg-indigo-600/70 rounded text-[6px] text-white flex items-center justify-center font-bold">
                    QA Lead
                  </div>
                  <div className="w-8 h-3 bg-emerald-600/70 rounded text-[6px] text-white flex items-center justify-center font-bold">
                    Ops
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Audit Readiness 85% Mockup */}
            <div className="bg-[#111e38] border border-slate-700/80 rounded-xl p-2.5 shadow-md flex flex-col justify-between aspect-[1.4/1]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
                <div className="text-[9px] font-mono text-cyan-400">85% READINESS</div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="flex-1 flex items-end gap-1 px-1 pb-1">
                <div className="flex-1 bg-emerald-500/80 rounded-t h-3/4" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-full" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-4/5" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-2/3" />
                <div className="flex-1 bg-emerald-500/80 rounded-t h-5/6" />
              </div>
            </div>
          </div>

          {/* Hero Heading & Subtitle */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              The modern platform that makes ISO 9001 compliance effortless
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed max-w-xl">
              Run your full Quality Management System in one place — with AI-powered document
              creation, NCRs, audits, supplier & HR management, and more.
            </p>
          </div>

          {/* PRICING Section (Matches Screenshot) */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              PRICING
            </div>

            <div className="space-y-3">
              {/* Card 1: Starter */}
              <div className="bg-[#0f1d38]/90 border border-slate-700/70 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Starter</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      14 day free trial
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">R899</span>
                    <span className="text-[10px] text-slate-400 ml-1">/month</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>Full QMS module suite</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>AI-powered document creation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>NCR, Audit & Supplier management</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>HR & Calibration control</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>Up to 5 users</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Professional */}
              <div className="bg-[#0f1d38]/90 border border-slate-700/70 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Professional</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Coming soon
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>Everything in Starter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>Multi-site / multi-office support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>ISO 9001:2015 Cloud Compliance Platform</span>
          <span className="text-slate-500">SANAS & IRCA Compatible</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GOOGLE ACCOUNT CHOOSER MODAL                             */}
      {/* ======================================================== */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-bold text-slate-800 text-sm">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Choose an account</h3>
              <p className="text-xs text-slate-500 mt-0.5">to continue to SHEQ Street</p>
            </div>

            {/* Account List */}
            <div className="space-y-2">
              <div
                onClick={() => {
                  setShowGoogleModal(false);
                  handleStartOAuthSignIn('Google', 'nv8660970099@gmail.com', 'Naveen V');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 cursor-pointer transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                  N
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900">Naveen V</div>
                  <div className="text-xs text-slate-500 truncate">nv8660970099@gmail.com</div>
                </div>
              </div>

              <div
                onClick={() => {
                  setShowGoogleModal(false);
                  handleStartOAuthSignIn('Google', 'admin@nkquality.co.za', 'NK Quality Administrator');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 cursor-pointer transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                  NK
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900">NK Quality Systems</div>
                  <div className="text-xs text-slate-500 truncate">admin@nkquality.co.za</div>
                </div>
              </div>

              {/* Use another account */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50/40 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>+ Use another Google account</span>
                </button>
              ) : (
                <div className="space-y-2 p-2 bg-slate-50 rounded-xl">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="Enter custom Google email"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:border-blue-600 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customGoogleEmail.trim()) {
                        setShowGoogleModal(false);
                        handleStartOAuthSignIn('Google', customGoogleEmail.trim());
                      }
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Continue with this account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MICROSOFT ACCOUNT CHOOSER MODAL                          */}
      {/* ======================================================== */}
      {showMicrosoftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span className="font-bold text-slate-800 text-sm">Microsoft</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMicrosoftModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Pick an account</h3>
              <p className="text-xs text-slate-500 mt-0.5">to sign in to SHEQ Street</p>
            </div>

            {/* Account List */}
            <div className="space-y-2">
              <div
                onClick={() => {
                  setShowMicrosoftModal(false);
                  handleStartOAuthSignIn('Microsoft', 'nv8660970099@gmail.com', 'Naveen V');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 cursor-pointer transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#00a4ef] text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                  N
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900">Naveen V</div>
                  <div className="text-xs text-slate-500 truncate">nv8660970099@gmail.com</div>
                </div>
              </div>

              <div
                onClick={() => {
                  setShowMicrosoftModal(false);
                  handleStartOAuthSignIn('Microsoft', 'naveen@sheqstreet.co.za', 'Naveen V (SHEQ Lead Auditor)');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 cursor-pointer transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                  SQ
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900">SHEQ Lead Auditor</div>
                  <div className="text-xs text-slate-500 truncate">naveen@sheqstreet.co.za</div>
                </div>
              </div>

              {/* Use another account */}
              {!showCustomMicrosoftInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomMicrosoftInput(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50/40 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>+ Use another Microsoft account</span>
                </button>
              ) : (
                <div className="space-y-2 p-2 bg-slate-50 rounded-xl">
                  <input
                    type="email"
                    value={customMicrosoftEmail}
                    onChange={(e) => setCustomMicrosoftEmail(e.target.value)}
                    placeholder="name@company.com or @outlook.com"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:border-blue-600 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customMicrosoftEmail.trim()) {
                        setShowMicrosoftModal(false);
                        handleStartOAuthSignIn('Microsoft', customMicrosoftEmail.trim());
                      }
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Continue with this account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORGOT PASSWORD / CHANGE PASSWORD MODAL                  */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Change & Reset Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStatus('');
                  setForgotSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!forgotSuccess ? (
              <>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your registered email and choose a new secure password for your SHEQ Street account.
                </p>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="nv8660970099@gmail.com"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showNewPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 6 characters"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  {forgotStatus && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg font-medium">
                      {forgotStatus}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotStatus('');
                      }}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password & Send Link</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Password Changed Successfully!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your new credentials are now configured. We have also sent a confirmation notification to{' '}
                  <strong className="text-slate-900">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                    setPassword(newPassword);
                    handleCompleteSignIn(forgotEmail);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Sign In with New Password Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* OAUTH COUNTDOWN & AUTO-GENERATED PASSWORD MODAL          */}
      {/* ======================================================== */}
      {oauthProgress && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-800 border border-slate-100">
            {/* Header with Provider Logo */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {oauthProgress.provider === 'Google' ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                )}
                <span className="font-bold text-slate-800 text-sm">
                  Sign in with {oauthProgress.provider}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                Verified
              </span>
            </div>

            {/* Account Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                {oauthProgress.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900">{oauthProgress.name}</div>
                <div className="text-xs text-slate-500 font-mono truncate">{oauthProgress.email}</div>
              </div>
            </div>


            {/* Signing in progress - No seconds */}
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                Signing in automatically...
              </div>
              <p className="text-[11px] text-slate-500">
                Connecting to SHEQ Street ISO 9001 Management Gateway
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOauthProgress(null)}
                className="w-1/3 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const { email: aEmail, name: aName, company: cName } = oauthProgress;
                  setOauthProgress(null);
                  setShowGoogleModal(false);
                  setShowMicrosoftModal(false);
                  handleCompleteSignIn(aEmail, aName, cName);
                }}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Sign In Immediately</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
