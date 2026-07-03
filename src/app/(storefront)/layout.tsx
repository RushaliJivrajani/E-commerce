'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  ShoppingCart,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  Loader2,
  User,
  LogOut,
  Package,
  Info,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerSession, setCustomerSession] = useState<any>(null);
  
  // Settings & Categories from DB
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Theme State (Forced Light Theme)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Load Settings, Categories, and Customer Session
  useEffect(() => {
    async function loadStoreInit() {
      try {
        const [initRes, meRes] = await Promise.all([
          fetch('/api/storefront/init'),
          fetch('/api/customer/me'),
        ]);
        if (initRes.ok) {
          const data = await initRes.json();
          setSettings(data.settings);
          setCategories(data.categories || []);
        }
        if (meRes.ok) {
          const meData = await meRes.json();
          setCustomerSession(meData.customer || null);
        }
      } catch (err) {
        console.error('Failed to init storefront data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStoreInit();
  }, []);

  const handleCustomerLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' });
    setCustomerSession(null);
    toast.success('Signed out successfully');
  };

  // Update Cart Count
  const updateCartCount = () => {
    try {
      const cartStr = localStorage.getItem('rf_cart');
      if (cartStr) {
        const cart = JSON.parse(cartStr);
        const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    
    // Listen to custom cart updates
    window.addEventListener('rf-cart-changed', updateCartCount);
    // Listen to storage events (tab sync)
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('rf-cart-changed', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-muted-foreground">Entering RUSH CLOSET...</p>
        </div>
      </div>
    );
  }

  // Get only top level categories
  const mainCategories = categories.filter(c => !c.parentId);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500">
      <Toaster position="top-right" />

      {/* --- TOP BANNER/ALERT LINE --- */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-center py-2.5 px-4 text-xs font-bold text-white tracking-wide flex justify-center items-center gap-2 shadow-md">
        <Sparkles className="h-4 w-4 text-pink-200" />
        <span>Use Coupon code <span className="underline font-black text-white decoration-pink-300">RUSH20</span> for 20% off on orders above ₹1,499!</span>
        <ArrowRight className="h-4 w-4 text-pink-200" />
      </div>

      {/* --- PREMIUM MARKETPLACE HEADER --- */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-slate-900">
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-slate-700 hover:text-indigo-500 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
              <span className="text-indigo-500 mr-1">RUSH</span>CLOSET
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/shop"
              className={`text-sm font-semibold transition-colors ${
                pathname === '/shop' ? 'text-indigo-500 text-glow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collection
            </Link>
            {mainCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="text-sm font-semibold text-slate-600 hover:text-indigo-500 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            {customerSession ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Account
                </Link>
                <button
                  onClick={handleCustomerLogout}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all"
              >
                <User className="h-4 w-4" /> Sign In
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 -mr-2 text-slate-700 hover:text-indigo-500 transition-colors flex items-center gap-1"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="hidden sm:inline text-sm font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-0 sm:right-6 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden bg-white/95 backdrop-blur-md">
          <div className="w-full flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center text-glow">
                <span className="text-indigo-500 mr-1">RUSH</span>CLOSET
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-6">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold text-slate-900">
                New In
              </Link>
              {mainCategories.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold text-slate-600 hover:text-indigo-500">
                  {cat.name}
                </Link>
              ))}
              <div className="h-px bg-slate-200 my-4" />
              {customerSession ? (
                <>
                  <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-600 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" /> My Account
                  </Link>
                  <button onClick={() => { handleCustomerLogout(); setMobileMenuOpen(false); }} className="text-left text-lg font-semibold text-rose-500">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/account/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-white bg-indigo-500 px-4 py-3 rounded-lg text-center flex justify-center items-center gap-2 glass-button hover:text-white">
                  <User className="h-5 w-5" /> Sign In / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* --- CONTENT OUTLET --- */}
      <main className="flex-1">
        {children}
      </main>

      {/* --- MARKETPLACE FOOTER --- */}
      <footer className="glass-panel mt-auto border-t-0 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* About Column */}
            <div className="space-y-4">
              <span className="text-xl font-bold text-slate-900 flex items-center text-glow">
                <span className="text-indigo-500 mr-1">RUSH</span>CLOSET
              </span>
              <p className="text-xs leading-relaxed text-slate-500">
                Experience high-end style merged with premium fabrications. Curated global collections designed for the modern individual.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Shop With Us</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/shop" className="hover:text-indigo-500 transition-colors">New Arrivals</Link></li>
                {mainCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.id}`} className="hover:text-indigo-500 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies Column */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Let Us Help You</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-indigo-500 transition-colors">About Us</Link></li>
                <li><Link href="/account/orders" className="hover:text-indigo-500 transition-colors">Track Your Order</Link></li>
                <li><Link href="/pages/return-policy" className="hover:text-indigo-500 transition-colors">Returns & Refunds</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Contact Us</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-500" /> {settings?.contactEmail || 'care@rushcloset.com'}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-indigo-500" /> {settings?.contactPhone || '+91 79 4001 0203'}</p>
                <p className="flex gap-2 pt-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500" /> {settings?.address || 'Ahmedabad, Gujarat, India'}</p>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <span className="text-slate-500">© {new Date().getFullYear()} RUSH CLOSET. All rights reserved.</span>
            <span className="text-indigo-600/80 font-medium">Designed for Premium Fashion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
