'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Lock, Mail, ShieldAlert, ArrowRight, UserCheck, KeyRound, Loader2, Sparkles } from 'lucide-react';

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
  const [loginRole, setLoginRole] = useState<'super' | 'manager' | ''>('');

  const handlePresetSelect = (role: 'super' | 'manager') => {
    setLoginRole(role);
  };

  // Password Recovery Fields
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');

  // Handle Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginRole) {
      toast.error('Please select your login role (Super Admin or Manager)');
      return;
    }
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
        // Verify user role matches selection role
        if (loginRole === 'super' && data.user.role !== 'Super Admin') {
          toast.error('Logged-in user is not a Super Admin');
          setLoading(false);
          await fetch('/api/auth/logout', { method: 'POST' });
          return;
        }
        if (loginRole === 'manager' && data.user.role !== 'Manager') {
          toast.error('Logged-in user is not a Manager');
          setLoading(false);
          await fetch('/api/auth/logout', { method: 'POST' });
          return;
        }

        toast.success(`Welcome back, ${data.user.name}!`);
        // Force fully reloading to make sure proxy cookie state takes effect
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
        setPassword(''); // Reset fields
      }
    } catch (err) {
      toast.error('Error in recovery flow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Background Graphic Accents */}
      <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-slate-500/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-slate-600/5 blur-[120px]" />

      <div className="relative w-full max-w-md space-y-8">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-500 to-slate-600 shadow-lg shadow-slate-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            RUSH <span className="bg-gradient-to-r from-slate-600 to-slate-600 bg-clip-text text-transparent">CLOSET</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enterprise Management Panel
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-border glow-on-hover rounded-2xl p-8 shadow-xl backdrop-blur-md">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Sign In</h3>
                <p className="text-xs text-slate-500 mt-1">Access your control panel session</p>
              </div>

              {/* Demo Login Presets */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Sandbox Demo Role
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="presetRole"
                      checked={loginRole === 'super'}
                      onChange={() => handlePresetSelect('super')}
                      className="accent-slate-500 h-4.5 w-4.5"
                    />
                    <span>Super Admin</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="presetRole"
                      checked={loginRole === 'manager'}
                      onChange={() => handlePresetSelect('manager')}
                      className="accent-slate-500 h-4.5 w-4.5"
                    />
                    <span>Manager</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@rushcloset.com"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setRecoveryStep('request');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-500 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-slate-600 to-slate-600 py-3 text-sm font-bold text-white shadow-lg shadow-slate-600/10 transition-all hover:opacity-95 focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TWO-FACTOR VIEW */}
          {view === '2fa' && (
            <form className="space-y-6" onSubmit={handle2FAVerify}>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-3">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Two-Factor Auth</h3>
                <p className="text-xs text-slate-500 mt-1">Enter code sent to your device</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="555555"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-center text-lg font-bold tracking-widest text-slate-900 placeholder-slate-300 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* Sandbox Code Hint */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 text-center">
                <span className="font-semibold text-slate-700">Sandbox Code:</span> Use <code className="text-amber-600 font-mono font-bold">555555</code> to verify.
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-95 focus:outline-none cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify and Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs text-slate-500 hover:text-slate-650 mt-2 underline"
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
                <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {recoveryStep === 'request'
                    ? 'Enter email to receive temporary recovery PIN'
                    : 'Provide the OTP and setup your new password'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Display/Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={recoveryStep === 'verify'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@rushcloset.com"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-450 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                {recoveryStep === 'verify' && (
                  <>
                    {/* OTP Entry */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Recovery OTP (Demo: 123456)
                      </label>
                      <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <KeyRound className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={recoveryOtp}
                          onChange={(e) => setRecoveryOtp(e.target.value)}
                          placeholder="123456"
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-450 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                      </div>
                    </div>

                    {/* New Password Entry */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        New Password
                      </label>
                      <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-450 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-95 focus:outline-none cursor-pointer"
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
                  className="text-xs text-slate-500 hover:text-slate-650 mt-2 underline text-center"
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-slate-900 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
