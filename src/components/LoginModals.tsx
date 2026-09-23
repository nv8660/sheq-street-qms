import React from 'react';
import { X, Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

export const MicrosoftIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

export interface AccountItem {
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface OAuthModalProps {
  provider: 'Google' | 'Microsoft';
  accounts: AccountItem[];
  onClose: () => void;
  onSelect: (email: string, name: string) => void;
}

export const OAuthModal: React.FC<OAuthModalProps> = ({
  provider,
  accounts,
  onClose,
  onSelect,
}) => {
  const [customEmail, setCustomEmail] = React.useState('');
  const [showCustom, setShowCustom] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {provider === 'Google' ? <GoogleIcon /> : <MicrosoftIcon />}
            <span className="font-bold text-slate-800 text-sm">Sign in with {provider}</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900">Choose an account</h3>
          <p className="text-xs text-slate-500">to continue to SHEQ Street</p>
        </div>

        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc.email}
              onClick={() => onSelect(acc.email, acc.name)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 cursor-pointer transition"
            >
              <div className={`w-8 h-8 rounded-full ${acc.color} text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0`}>
                {acc.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900">{acc.name}</div>
                <div className="text-xs text-slate-500 truncate">{acc.email}</div>
              </div>
            </div>
          ))}

          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50/40 flex items-center gap-2 cursor-pointer transition"
            >
              <span>+ Use another {provider} account</span>
            </button>
          ) : (
            <div className="space-y-2 p-2 bg-slate-50 rounded-xl">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={`Enter custom ${provider} email`}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:border-blue-600 outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => customEmail.trim() && onSelect(customEmail.trim(), 'User')}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Continue with this account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccessLogin: (email: string, newPass: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSuccessLogin }) => {
  const [email, setEmail] = React.useState('');
  const [newPass, setNewPass] = React.useState('');
  const [confirmPass, setConfirmPass] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || newPass.length < 6 || newPass !== confirmPass) {
      setStatus(newPass.length < 6 ? 'Password must be at least 6 chars.' : 'Passwords do not match or email is invalid.');
      return;
    }
    setStatus(`Sending verification token to ${email}...`);
    try {
      await fetch('/api/send-auth-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), companyName: 'SHEQ Street QMS' }),
      });
    } catch {}
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900">Change & Reset Password</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-slate-500">Enter your email and configure your new secure password.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nv8660970099@gmail.com"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPass ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-blue-600"
                required
              />
            </div>

            {status && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                {status}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Lock className="w-3 h-3" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Password Changed Successfully!</h4>
            <p className="text-xs text-slate-600">A confirmation notification was sent to {email}.</p>
            <button
              type="button"
              onClick={() => onSuccessLogin(email, newPass)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              Sign In with New Password Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface OAuthProgressOverlayProps {
  provider: 'Google' | 'Microsoft';
  email: string;
  onCancel: () => void;
  onEnterNow: () => void;
}

export const OAuthProgressOverlay: React.FC<OAuthProgressOverlayProps> = ({
  provider,
  email,
  onCancel,
  onEnterNow,
}) => (
  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-slate-800 text-center">
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <h3 className="text-sm font-bold text-slate-900">Signing in with {provider}...</h3>
      <p className="text-xs text-slate-500 font-mono truncate">{email}</p>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onEnterNow}
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-xs"
        >
          <span>Enter Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);
