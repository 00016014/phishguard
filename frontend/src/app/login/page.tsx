'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/AuthService';

type AuthMode = 'login' | 'signup' | 'verify_reg_otp' | 'reset' | 'verify_reset_otp' | 'reset_confirm';

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = 6;
  const chars = value.padEnd(digits, ' ').slice(0, digits).split('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = chars.map((c, i) => (i === idx ? v : c)).join('').replace(/ /g, '');
    onChange(next);
    if (v && idx < digits - 1) {
      const nextEl = document.getElementById(`otp-${idx + 1}`);
      (nextEl as HTMLInputElement)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !chars[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      (prev as HTMLInputElement)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, digits);
    onChange(pasted);
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {chars.map((ch, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={ch === ' ' ? '' : ch}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-14 text-center text-xl font-bold bg-surface border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-brand-primary transition-colors"
        />
      ))}
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, verifySignUpOtp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // OTP fields
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');  // email OTP was sent to
  const [resendCooldown, setResendCooldown] = useState(0);

  // Legacy reset-confirm (old email links)
  const [resetUid, setResetUid] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');
    if (urlMode === 'reset_confirm' && uid && token) {
      setMode('reset_confirm');
      setResetUid(uid);
      setResetToken(token);
    }
  }, [searchParams]);

  // Count-down for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const clearStatus = () => { setError(''); setSuccessMessage(''); };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearStatus();
    setOtp('');
    setPassword('');
    setConfirmPassword('');
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    clearStatus();
    try {
      if (mode === 'verify_reg_otp') {
        await signUp(otpEmail, password, { fullName });
        setSuccessMessage('A new OTP has been sent to your email.');
      } else {
        await AuthService.requestPasswordReset(otpEmail);
        setSuccessMessage('A new OTP has been sent to your email.');
      }
      setOtp('');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP.');
    }
  };

  // ── Main submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setLoading(true);

    try {
      // ── Sign in ───────────────────────────────────────────────────────────
      if (mode === 'login') {
        await signIn(email, password);
        router.push('/personal-dashboard');

      // ── Sign up → send OTP ────────────────────────────────────────────────
      } else if (mode === 'signup') {
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        const result = await signUp(email, password, { fullName });
        setOtpEmail(result.email ?? email);
        setResendCooldown(60);
        switchMode('verify_reg_otp');
        setSuccessMessage(`OTP sent to ${result.email ?? email}. Check your inbox.`);

      // ── Verify registration OTP ───────────────────────────────────────────
      } else if (mode === 'verify_reg_otp') {
        if (otp.length < 6) { setError('Please enter the full 6-digit OTP.'); return; }
        await verifySignUpOtp(otpEmail, otp);
        router.push('/personal-dashboard');

      // ── Request password reset → send OTP ─────────────────────────────────
      } else if (mode === 'reset') {
        const result = await AuthService.requestPasswordReset(email);
        setOtpEmail(result.email ?? email);
        setResendCooldown(60);
        switchMode('verify_reset_otp');
        setSuccessMessage(`OTP sent to ${result.email ?? email}. Check your inbox.`);

      // ── Verify reset OTP + set new password ───────────────────────────────
      } else if (mode === 'verify_reset_otp') {
        if (otp.length < 6) { setError('Please enter the full 6-digit OTP.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        await AuthService.verifyResetOtp(otpEmail, otp, password);
        setSuccessMessage('Password changed successfully! You can now sign in.');
        setTimeout(() => switchMode('login'), 2500);

      // ── Legacy reset confirm (old email links) ────────────────────────────
      } else if (mode === 'reset_confirm') {
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        await AuthService.resetPasswordConfirm(resetUid, resetToken, password);
        setSuccessMessage('Password changed successfully! You can now sign in.');
        setTimeout(() => { switchMode('login'); }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const modeIcon = () => {
    if (mode === 'login') return 'LockClosedIcon';
    if (mode === 'signup') return 'UserPlusIcon';
    if (mode === 'verify_reg_otp' || mode === 'verify_reset_otp') return 'KeyIcon';
    return 'KeyIcon';
  };

  const modeTitle = () => {
    if (mode === 'login') return 'Welcome Back';
    if (mode === 'signup') return 'Create Account';
    if (mode === 'verify_reg_otp') return 'Verify Email';
    if (mode === 'reset') return 'Reset Password';
    if (mode === 'verify_reset_otp') return 'Enter OTP';
    return 'Set New Password';
  };

  const modeSubtitle = () => {
    if (mode === 'login') return 'Sign in to your PhishGuard account';
    if (mode === 'signup') return 'Join PhishGuard and stay protected';
    if (mode === 'verify_reg_otp') return `Enter the 6-digit code sent to ${otpEmail}`;
    if (mode === 'reset') return 'Enter your email to receive a 6-digit OTP';
    if (mode === 'verify_reset_otp') return `Enter the code sent to ${otpEmail} and your new password`;
    return 'Enter your new password below';
  };

  const isOtpMode = mode === 'verify_reg_otp' || mode === 'verify_reset_otp';
  const isAuthMode = mode === 'login' || mode === 'signup';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card shadow-md">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <Link href="/homepage" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="PhishGuard Logo" width={40} height={40} className="rounded-lg shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold text-primary leading-none">PhishGuard</span>
              <span className="text-xs font-body text-muted-foreground leading-none mt-0.5">AI-Powered Protection</span>
            </div>
          </Link>
          <Link href="/homepage" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeftIcon" size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />

            <div className="p-8">
              {/* Icon & Title */}
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl mb-4">
                  <Icon name={modeIcon() as any} size={32} className="text-brand-primary" variant="solid" />
                </div>
                <h1 className="text-2xl font-headline font-bold text-primary">{modeTitle()}</h1>
                <p className="text-sm text-muted-foreground mt-1 text-center">{modeSubtitle()}</p>
              </div>

              {/* Tab Switcher */}
              {isAuthMode && (
                <div className="flex bg-surface rounded-lg p-1 mb-6">
                  <button onClick={() => switchMode('login')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'login' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    Sign In
                  </button>
                  <button onClick={() => switchMode('signup')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'signup' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    Sign Up
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-5">
                  <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-5">
                  <Icon name="CheckCircleIcon" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-500">{successMessage}</p>
                </div>
              )}

              {/* ── OTP entry step ── */}
              {isOtpMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} />

                  {/* New password fields for reset OTP */}
                  {mode === 'verify_reset_otp' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="LockClosedIcon" size={18} className="text-muted-foreground" />
                          </div>
                          <input type={showPassword ? 'text' : 'password'} value={password}
                            onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required
                            className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                            <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="LockClosedIcon" size={18} className="text-muted-foreground" />
                          </div>
                          <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading || otp.length < 6}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-all duration-200">
                    {loading ? (
                      <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Verifying…</span></>
                    ) : (
                      <><Icon name="CheckCircleIcon" size={18} /><span>Verify OTP</span></>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={() => switchMode(mode === 'verify_reg_otp' ? 'signup' : 'reset')}
                      className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="ArrowLeftIcon" size={14} />
                      <span>Go Back</span>
                    </button>
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                      className="text-brand-primary hover:text-brand-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>

              ) : (
              /* ── Standard form (login / signup / reset / reset_confirm) ── */
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="UserIcon" size={18} className="text-muted-foreground" />
                      </div>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                    </div>
                  </div>
                )}

                {/* Email */}
                {mode !== 'reset_confirm' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="EnvelopeIcon" size={18} className="text-muted-foreground" />
                      </div>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com" required
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                    </div>
                  </div>
                )}

                {/* Password (login & signup) */}
                {(mode === 'login' || mode === 'signup') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="LockClosedIcon" size={18} className="text-muted-foreground" />
                      </div>
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} required
                        className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                      </button>
                    </div>
                    {mode === 'login' && (
                      <div className="flex justify-end mt-1.5">
                        <button type="button" onClick={() => switchMode('reset')}
                          className="text-xs text-brand-primary hover:text-brand-primary/80 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Password (signup) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="LockClosedIcon" size={18} className="text-muted-foreground" />
                      </div>
                      <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password" required
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                    </div>
                  </div>
                )}

                {/* Legacy reset confirm */}
                {mode === 'reset_confirm' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon name="LockClosedIcon" size={18} className="text-muted-foreground" />
                        </div>
                        <input type={showPassword ? 'text' : 'password'} value={password}
                          onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required
                          className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                          <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon name="LockClosedIcon" size={18} className="text-muted-foreground" />
                        </div>
                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required
                          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors text-sm" />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-all duration-200 mt-2">
                  {loading ? (
                    <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Please wait...</span></>
                  ) : (
                    <><Icon name={mode === 'signup' ? 'PaperAirplaneIcon' : mode === 'login' ? 'ArrowRightOnRectangleIcon' : 'PaperAirplaneIcon'} size={18} />
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Send Verification Code'}
                      {mode === 'reset' && 'Send OTP'}
                      {mode === 'reset_confirm' && 'Set New Password'}
                    </span></>
                  )}
                </button>

                {/* Back links */}
                {(mode === 'reset' || mode === 'reset_confirm') && (
                  <div className="text-center pt-1">
                    <button type="button" onClick={() => switchMode('login')}
                      className="text-sm text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center space-x-1 mx-auto">
                      <Icon name="ArrowLeftIcon" size={14} />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                )}
              </form>
              )}

              {/* Footer note */}
              {isAuthMode && (
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  By continuing, you agree to PhishGuard&apos;s{' '}
                  <span className="text-brand-primary cursor-pointer hover:underline">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-brand-primary cursor-pointer hover:underline">Privacy Policy</span>.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mt-6">
            <Icon name="ShieldCheckIcon" size={16} className="text-green-500" variant="solid" />
            <span className="text-xs text-muted-foreground">Secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}

