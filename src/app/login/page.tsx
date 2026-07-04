'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Lock, Mail, ShieldAlert, ArrowRight, KeyRound, Loader2, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  // State Management
  const [view, setView] = useState<'login' | '2fa' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUserId, setTempUserId] = useState('');

  // Password Recovery Fields
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');

  // Handle Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      if (data.twoFactorRequired) {
        setTempUserId(data.userId);
        setView('2fa');
        toast.success('Credentials verified. Please enter 2FA OTP.');
      } else {
        toast.success(`Welcome back, ${data.user.name}!`);
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 800);
      }
    } catch (err) {
      toast.error('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA Verification
  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId, code: twoFactorCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Invalid 2FA code');
        return;
      }

      toast.success(`Authenticated successfully!`);
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 800);
    } catch (err) {
      toast.error('Error verifying 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Recovery Request & Reset
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const bodyPayload = recoveryStep === 'request'
        ? { email }
        : { email, otp: recoveryOtp, newPassword };

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Error executing request');
        return;
      }

      if (recoveryStep === 'request') {
        setRecoveryStep('verify');
        toast.success(data.message || 'Verification code generated');
      } else {
        toast.success('Password updated! Please log in.');
        setView('login');
        setRecoveryStep('request');
        setRecoveryOtp('');
        setNewPassword('');
        setPassword('');
      }
    } catch (err) {
      toast.error('Error in recovery flow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="relative w-full max-w-md space-y-8 z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-primary/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-foreground sm:text-4xl text-glow">
            RUSH <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">CLOSET</span>
          </h2>
          <p className="mt-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Enterprise Management Panel
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <h3 className="text-xl font-bold text-foreground">Sign In</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">Access your secure control panel session</p>
              </div>

              <div className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-4 w-4 text-muted-foreground/80" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@rushcloset.com"
                      suppressHydrationWarning
                      className="block w-full rounded-2xl border border-border bg-card/70 py-3.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setRecoveryStep('request');
                      }}
                      className="text-xs font-bold text-primary hover:text-primary hover:underline transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-4 w-4 text-muted-foreground/80" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      suppressHydrationWarning
                      className="block w-full rounded-2xl border border-border bg-card/70 py-3.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50 hover:scale-[1.02] focus:outline-none disabled:opacity-50 cursor-pointer overflow-hidden mt-8 glow-on-hover uppercase tracking-wider"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TWO-FACTOR VIEW */}
          {view === '2fa' && (
            <form className="space-y-6" onSubmit={handle2FAVerify}>
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 border border-indigo-100 shadow-md">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Two-Factor Auth</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">Enter code sent to your device</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="555555"
                  suppressHydrationWarning
                  className="block w-full rounded-2xl border border-border bg-card/70 py-4 text-center text-2xl font-black tracking-[0.5em] text-foreground placeholder-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm mt-3"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50 hover:scale-[1.02] focus:outline-none cursor-pointer glow-on-hover uppercase tracking-wider"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify and Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground mt-2 underline transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <form className="space-y-6" onSubmit={handleRecovery}>
              <div>
                <h3 className="text-xl font-bold text-foreground">Reset Password</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                  {recoveryStep === 'request'
                    ? 'Enter email to receive temporary recovery PIN'
                    : 'Provide the OTP and setup your new password'}
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-4 w-4 text-muted-foreground/80" />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={recoveryStep === 'verify'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@rushcloset.com"
                      suppressHydrationWarning
                      className="block w-full rounded-2xl border border-border bg-card/70 py-3.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                {recoveryStep === 'verify' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                        Recovery OTP
                      </label>
                      <div className="relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <KeyRound className="h-4 w-4 text-muted-foreground/80" />
                        </div>
                        <input
                          type="text"
                          required
                          value={recoveryOtp}
                          onChange={(e) => setRecoveryOtp(e.target.value)}
                          placeholder="123456"
                          suppressHydrationWarning
                          className="block w-full rounded-2xl border border-border bg-card/70 py-3.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                        New Password
                      </label>
                      <div className="relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Lock className="h-4 w-4 text-muted-foreground/80" />
                        </div>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          suppressHydrationWarning
                          className="block w-full rounded-2xl border border-border bg-card/70 py-3.5 pl-11 pr-4 text-sm font-medium text-foreground placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50 hover:scale-[1.02] focus:outline-none cursor-pointer glow-on-hover uppercase tracking-wider mt-4"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : recoveryStep === 'request' ? (
                    'Send Recovery Code'
                  ) : (
                    'Update Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setRecoveryStep('request');
                  }}
                  className="text-xs text-muted-foreground font-bold hover:text-foreground mt-2 underline text-center transition-colors"
                >
                  Cancel and Go Back
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-foreground font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
