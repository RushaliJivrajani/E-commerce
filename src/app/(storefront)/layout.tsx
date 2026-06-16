'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
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
          <p className="text-sm text-muted-foreground">Entering Rush Fashion...</p>
        </div>
      </div>
    );
  }

  // Get only top level categories
  const mainCategories = categories.filter(c => !c.parentId);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Toaster position="top-right" />

      {/* --- TOP BANNER/ALERT LINE --- */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 text-center py-2 px-4 text-xs font-semibold text-white tracking-wide flex justify-center items-center gap-2 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-slate-200" />
        <span>Use Coupon code <span className="underline font-bold text-amber-200">RUSH20</span> for 20% off on orders above ₹1,499!</span>
        <ArrowRight className="h-3 w-3" />
      </div>

      {/* --- HEADER NAVBAR --- */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-card/70 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-wider">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-500 to-slate-600 shadow-md shadow-slate-500/20 text-white shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white uppercase">
                RUSH <span className="bg-gradient-to-r from-slate-500 to-slate-500 bg-clip-text text-transparent">FASHION</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/shop"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/shop' ? 'text-slate-600' : 'text-slate-600 hover:text-slate-500'
                }`}
              >
                All Shop
              </Link>
              {mainCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-500 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/about"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/about' ? 'text-slate-600' : 'text-slate-600 hover:text-slate-500'
                }`}
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">

            {/* Login / My Account */}
            {customerSession ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-white text-[9px] font-black">
                    {customerSession.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span>{customerSession.name?.split(' ')[0]}</span>
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <button
                  onClick={handleCustomerLogout}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                <User className="h-3.5 w-3.5" />
                Login
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold text-white shadow-md shadow-slate-600/20">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 bg-white dark:bg-slate-900 p-6 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <span className="font-extrabold text-slate-950 dark:text-white uppercase">NAVIGATE</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-4">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-slate-900 hover:text-slate-500"
              >
                All Shop
              </Link>
              {mainCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-slate-700 hover:text-slate-500"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-slate-700 hover:text-slate-500 flex items-center gap-2"
              >
                <Info className="h-4 w-4" /> About Us
              </Link>
              <div className="h-px bg-slate-200 my-2" />
              {customerSession ? (
                <>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-slate-600 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <button
                    onClick={() => { handleCustomerLogout(); setMobileMenuOpen(false); }}
                    className="text-left text-lg font-bold text-red-500 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/account/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-slate-600 flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Login / Register
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

      {/* --- PREMIUM FOOTER --- */}
      <footer className="border-t border-border bg-card/40 backdrop-blur-md text-muted-foreground mt-auto transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* About Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold tracking-wider">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-600 text-white text-xs">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
                  {settings?.storeName || 'RUSH FASHION'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Experience high-end style merged with premium fabrications. Dynamic shopping experience powered by local caching architectures.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {settings?.socialLinks?.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {settings?.socialLinks?.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/></svg>
                  </a>
                )}
                {settings?.socialLinks?.twitter && (
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Shop</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/shop" className="hover:text-slate-500 transition-colors">Shop Catalog</Link>
                </li>
                {mainCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.id}`} className="hover:text-slate-500 transition-colors">
                      {cat.name} Collection
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies Column */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/about" className="hover:text-slate-500 transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/account/orders" className="hover:text-slate-500 transition-colors">My Orders</Link>
                </li>
                <li>
                  <Link href="/account/login" className="hover:text-slate-500 transition-colors">Login / Register</Link>
                </li>
                <li>
                  <Link href="/pages/return-policy" className="hover:text-slate-500 transition-colors">Return & Refund Policy</Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Get in Touch</h3>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{settings?.address || 'Ahmedabad, Gujarat, India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{settings?.contactPhone || '+91 79 4001 0203'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{settings?.contactEmail || 'rushfashion@gmail.com'}</span>
              </div>
            </div>

          </div>

          <hr className="border-slate-200 dark:border-slate-800 my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 tracking-wide uppercase text-center sm:text-right">
            <span>© {new Date().getFullYear()} Rush Fashion. All rights reserved.</span>
            <span className="leading-relaxed">A Startup Built & Designed by <span className="text-slate-500 font-bold">Software Engineer Rushali Jivrajani</span><br/>Inspiring Girls in Tech & Fashion · Ahmedabad, Gujarat, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
