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
import { LogoWordmark, LogoMark } from '@/components/BrandAssets';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerSession, setCustomerSession] = useState<any>(null);
  
  // Settings & Categories from DB
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs uppercase tracking-widest font-bold">Entering VIARO...</p>
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
      <div className="bg-primary text-center py-2.5 px-4 text-[10px] font-bold text-white uppercase tracking-[0.25em] flex justify-center items-center gap-2 shadow-md">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Use Coupon code <span className="underline font-black">RUSH20</span> for 20% off on orders above ₹1,499!</span>
        <ArrowRight className="h-3 w-3" />
      </div>

      {/* --- PREMIUM MARKETPLACE HEADER --- */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-foreground">
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-4">
            <LogoWordmark className="h-6 sm:h-8 w-auto text-foreground" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/shop"
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                pathname === '/shop' ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Collection
            </Link>
            {mainCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Theme Toggle */}
            <ThemeToggle />

            {customerSession ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/account/orders"
                  className="text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-all flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Account
                </Link>
                <button
                  onClick={handleCustomerLogout}
                  className="text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-all cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-all"
              >
                <User className="h-4 w-4" /> Sign In
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 -mr-2 text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-0 sm:right-7 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white border-2 border-background shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden bg-background/95 backdrop-blur-md">
          <div className="w-full flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-12">
              <LogoWordmark className="h-6 w-auto text-foreground" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-6">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-foreground">
                New In
              </Link>
              {mainCategories.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-foreground/85 hover:text-primary">
                  {cat.name}
                </Link>
              ))}
              <div className="h-px bg-border/20 my-4" />
              {customerSession ? (
                <>
                  <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> My Account
                  </Link>
                  <button onClick={() => { handleCustomerLogout(); setMobileMenuOpen(false); }} className="text-left text-lg font-bold uppercase tracking-widest text-primary">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/account/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-white bg-primary px-4 py-3 rounded-lg text-center flex justify-center items-center gap-2 hover:opacity-90 transition-opacity">
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
      <footer className="glass-panel mt-auto border-t border-border/10 text-foreground/75">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* About Column */}
            <div className="space-y-4">
              <LogoWordmark className="h-6 w-auto text-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Experience high-end style merged with premium fabrications. Curated global collections designed for the modern individual.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Shop With Us</h3>
              <ul className="space-y-3 text-xs uppercase tracking-widest">
                <li><Link href="/shop" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                {mainCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.id}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies Column */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Let Us Help You</h3>
              <ul className="space-y-3 text-xs uppercase tracking-widest">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/account/orders" className="hover:text-primary transition-colors">Track Your Order</Link></li>
                <li><Link href="/pages/return-policy" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Contact Us</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {settings?.contactEmail || 'care@viaro.in'}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {settings?.contactPhone || '+91 79 4001 0203'}</p>
                <p className="flex gap-2 pt-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" /> {settings?.address || 'Ahmedabad, Gujarat, India'}</p>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <span className="text-muted-foreground">© {new Date().getFullYear()} VIARO. All rights reserved.</span>
            <span className="text-muted-foreground">
              Designed by <span className="font-bold text-foreground">Rushali Jivrajani</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
