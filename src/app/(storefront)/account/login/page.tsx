'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBag,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const BENEFITS = [
  'Track your orders in real-time',
  'Save multiple delivery addresses',
  'Get exclusive member offers',
  'Faster checkout every time',
];

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length > 5) strength += 1;
  if (password.length > 7) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
}

function AccountLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!isValidEmail(loginEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Login failed');
        return;
      }
      toast.success(`Welcome back, ${data.customer.name}! 🎉`);
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 800);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Please enter your email');
    if (!isValidEmail(forgotEmail)) return toast.error('Please enter a valid email address');
    
    setLoading(true);
    try {
      const res = await fetch('/api/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to request recovery code');
        return;
      }
      toast.success(data.message);
      setForgotStep('otp');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword) return toast.error('Please fill all fields');
    if (forgotNewPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await fetch('/api/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to reset password');
        return;
      }
      toast.success(data.message);
      setTab('login');
      setForgotStep('email');
      setForgotEmail('');
      setForgotOtp('');
      setForgotNewPassword('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!isValidEmail(regEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (getPasswordStrength(regPassword) < 2) {
      toast.error('Password is too weak. Add numbers or uppercase letters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, phone: regPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Registration failed');
        return;
      }
      toast.success(`Account created! Welcome to Rush Closet, ${data.customer.name}! 🛍️`);
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 1000);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(regPassword);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600', 'bg-green-700'][strength] || 'bg-border';

  return (
    <div className="min-h-screen flex bg-background">
      <Toaster position="top-right" />

      {/* Left panel – Premium Brand Focus */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-black p-12 text-white relative overflow-hidden border-r border-slate-900">
        <div className="absolute inset-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80" alt="Fashion Background" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center bg-card text-black shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-widest uppercase">
              RUSH CLOSET
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4 uppercase tracking-wide">
              Unlock <br />
              <span className="text-muted-foreground/80 font-light">Exclusive Access.</span>
            </h1>
            <p className="text-muted-foreground/50 text-sm leading-relaxed max-w-xs font-light tracking-wide">
              Join thousands of fashion connoisseurs globally who curate their wardrobes with Rush Closet.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-sm font-light text-border tracking-wide">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-muted-foreground tracking-widest uppercase">
          © {new Date().getFullYear()} Rush Closet · International Delivery
        </div>
      </div>

      {/* Right panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-card">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center bg-black text-white shadow-md">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold uppercase tracking-widest text-black">
                RUSH CLOSET
              </span>
            </Link>
          </div>

          {/* Tab Switcher */}
          {tab !== 'forgot' && (
            <div className="flex mb-10 border-b border-border">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 pb-3 text-sm font-semibold tracking-widest uppercase transition-all ${
                  tab === 'login'
                    ? 'border-b-2 border-black text-black'
                    : 'text-muted-foreground/80 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 pb-3 text-sm font-semibold tracking-widest uppercase transition-all ${
                  tab === 'register'
                    ? 'border-b-2 border-black text-black'
                    : 'text-muted-foreground/80 hover:text-black'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="block w-full border-b border-border/80 bg-transparent py-3 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-black uppercase tracking-widest">Password</label>
                    <button type="button" onClick={() => setTab('forgot')} className="text-[10px] text-muted-foreground hover:text-black uppercase tracking-widest">Forgot?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full border-b border-border/80 bg-transparent py-3 pr-10 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-black"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black py-4 text-[11px] font-bold text-white uppercase tracking-widest transition-all hover:bg-foreground text-background disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jane Doe"
                    className="block w-full border-b border-border/80 bg-transparent py-3 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="block w-full border-b border-border/80 bg-transparent py-3 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="block w-full border-b border-border/80 bg-transparent py-3 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="block w-full border-b border-border/80 bg-transparent py-3 pr-10 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-black"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {regPassword.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-card/80 flex gap-1">
                        {[1,2,3,4].map(level => (
                           <div key={level} className={`h-full flex-1 ${strength >= level ? strengthColor : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{strengthText}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className="block w-full border-b border-border/80 bg-transparent py-3 pr-10 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black py-4 text-[11px] font-bold text-white uppercase tracking-widest transition-all hover:bg-foreground text-background disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Create Account'}
              </button>

              <p className="text-center text-[10px] text-muted-foreground/80 tracking-wide leading-loose">
                By registering, you agree to our{' '}
                <Link href="/pages/terms-condition" className="text-black hover:underline">Terms</Link>{' '}
                and{' '}
                <Link href="/pages/privacy-policy" className="text-black hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {tab === 'forgot' && (
            <div className="space-y-6">
              <div className="mb-8">
                <button onClick={() => { setTab('login'); setForgotStep('email'); }} className="text-[10px] text-muted-foreground hover:text-black uppercase tracking-widest mb-4 inline-block">
                  &larr; Back to Sign In
                </button>
                <h2 className="text-2xl font-extrabold text-black uppercase tracking-widest">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-2 font-light">
                  {forgotStep === 'email' ? 'Enter your email to receive a recovery code.' : 'Enter the recovery code and your new password.'}
                </p>
              </div>

              {forgotStep === 'email' ? (
                <form onSubmit={handleForgotRequest} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="block w-full border-b border-border/80 bg-transparent py-3 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black py-4 text-[11px] font-bold text-white uppercase tracking-widest transition-all hover:bg-foreground text-background disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Recovery Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotReset} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">Recovery Code</label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="block w-full border-b border-border/80 bg-transparent py-3 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black uppercase tracking-widest mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="block w-full border-b border-border/80 bg-transparent py-3 pr-10 text-sm text-black placeholder-slate-400 focus:border-black focus:outline-none transition-colors rounded-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-black"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black py-4 text-[11px] font-bold text-white uppercase tracking-widest transition-all hover:bg-foreground text-background disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AccountLoginForm />
    </Suspense>
  );
}
