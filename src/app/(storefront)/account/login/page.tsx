'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

function AccountLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
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
      toast.success(`Account created! Welcome to Rush Fashion, ${data.customer.name}! 🛍️`);
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 1000);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-50/30 to-slate-50/20">
      <Toaster position="top-right" />

      {/* Left panel – Benefits */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-slate-600 via-slate-600 to-slate-800 p-12 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-slate-400/10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur border border-white/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-wider">
              RUSH <span className="text-slate-200">FASHION</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black leading-tight mb-3">
              Shop Smarter.<br />
              <span className="text-slate-200">Track Every Order.</span>
            </h1>
            <p className="text-slate-100 text-sm leading-relaxed max-w-xs">
              Join thousands of fashion lovers across India who shop with Rush Fashion for the latest trends delivered to their doorstep.
            </p>
          </div>

          <div className="space-y-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle2 className="h-4 w-4 text-slate-100" />
                </div>
                <span className="text-sm text-slate-100">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-200">
          © 2026 Rush Fashion · All India Delivery · Founded by Rushali Jivrajani
        </div>
      </div>

      {/* Right panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-500 to-slate-600 text-white shadow-md">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-black uppercase text-slate-900">
                RUSH <span className="text-slate-600">FASHION</span>
              </span>
            </Link>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-8">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Welcome back!</h2>
                <p className="text-sm text-slate-500 mt-1">Sign in to track orders and access your account</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-600/20 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Sign In</>}
              </button>

              <p className="text-center text-xs text-slate-500">
                New to Rush Fashion?{' '}
                <button type="button" onClick={() => setTab('register')} className="font-bold text-slate-600 hover:underline">
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create Account</h2>
                <p className="text-sm text-slate-500 mt-1">Join Rush Fashion and enjoy exclusive member benefits</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Your full name"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number <span className="text-slate-400">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Confirm <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        placeholder="Re-enter"
                        className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                        required
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  {showPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPass ? 'Hide' : 'Show'} passwords
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-600/20 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Create My Account</>}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                By registering, you agree to our{' '}
                <Link href="/pages/terms-condition" className="text-slate-500 hover:underline">Terms</Link>{' '}
                and{' '}
                <Link href="/pages/privacy-policy" className="text-slate-500 hover:underline">Privacy Policy</Link>.
              </p>

              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="font-bold text-slate-600 hover:underline">
                  Sign In
                </button>
              </p>
            </form>
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
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    }>
      <AccountLoginForm />
    </Suspense>
  );
}
