'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <StorefrontLayoutInner>{children}</StorefrontLayoutInner>
    </Suspense>
  );
}

function StorefrontLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerSession, setCustomerSession] = useState<any>(null);
  
  // Scroll Navbar hide logic
  const { scrollY } = useScroll();
  const [navHidden, setNavHidden] = useState(false);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setNavHidden(true);
    } else {
      setNavHidden(false);
    }
  });

  // Settings & Categories from DB
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
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
          setCoupons(data.coupons || []);
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
  const activePromo = coupons.length > 0 ? coupons[0] : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* --- TOP BANNER/ALERT LINE --- */}
      {activePromo ? (
        <div className="bg-primary text-center py-2.5 px-4 text-[10px] font-bold text-primary-foreground uppercase tracking-[0.25em] flex justify-center items-center gap-2 shadow-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Use Coupon code <span className="underline font-black">{activePromo.code}</span> for {activePromo.type === 'Percentage' ? `${activePromo.value}%` : `₹${activePromo.value}`} off{activePromo.minAmount > 0 ? ` on orders above ₹${activePromo.minAmount.toLocaleString()}!` : '!'}</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      ) : (
        <div className="bg-primary text-center py-2.5 px-4 text-[10px] font-bold text-primary-foreground uppercase tracking-[0.25em] flex justify-center items-center gap-2 shadow-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Welcome to VIARO - Premium Fashion Worldwide</span>
        </div>
      )}

      {/* --- PREMIUM MARKETPLACE HEADER --- */}
      <motion.header 
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={navHidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="sticky top-0 z-50 w-full glass-panel border-b border-border/10"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-foreground">
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 mr-4">
            <LogoWordmark className="h-6 sm:h-8 w-auto text-foreground" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a
              href="/shop"
              className={`group relative text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                pathname === '/shop' && !activeCategory ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              Collection
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${pathname === '/shop' && !activeCategory ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </a>
            {mainCategories.map((cat) => (
              <a
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className={`group relative text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                  activeCategory === cat.id ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {cat.name}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${activeCategory === cat.id ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </a>
            ))}
            <Link
              href="/about"
              className={`group relative text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                pathname === '/about' ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              About
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Theme Toggle */}
            <ThemeToggle />

            {customerSession ? (
              <div className="hidden md:flex items-center gap-4 relative group">
                <Link
                  href="/account/orders"
                  className="text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-all flex items-center gap-2 py-2"
                >
                  <User className="h-4 w-4" /> Account
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-48 pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="glass-panel bg-card border border-border/50 p-2 flex flex-col gap-1 shadow-2xl rounded-xl">
                    <Link href="/account/orders" className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3">
                      <Package className="h-4 w-4" /> Orders
                    </Link>
                    <div className="h-px bg-border/40 my-1 mx-2" />
                    <button onClick={handleCustomerLogout} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg transition-colors text-left flex items-center gap-3 w-full cursor-pointer">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
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
                <span className="absolute -top-1 right-0 sm:right-7 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground border-2 border-background shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex md:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm flex flex-col h-full bg-background p-6 shadow-2xl border-r border-border/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-12">
                <Link href="/home" onClick={() => setMobileMenuOpen(false)}>
                  <LogoWordmark className="h-6 w-auto text-foreground" />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-foreground cursor-pointer">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <motion.nav 
                variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                initial="hidden"
                animate="show"
                className="flex-1 flex flex-col gap-6"
              >
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                  <a href="/shop" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-bold uppercase tracking-widest ${pathname === '/shop' && !activeCategory ? 'text-primary' : 'text-foreground'}`}>
                    Collection
                  </a>
                </motion.div>
                {mainCategories.map((cat) => (
                  <motion.div key={cat.id} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                    <a href={`/shop?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className={`text-lg font-bold uppercase tracking-widest hover:text-primary ${activeCategory === cat.id ? 'text-primary' : 'text-foreground/85'}`}>
                      {cat.name}
                    </a>
                  </motion.div>
                ))}
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-foreground/85 hover:text-primary">
                    About
                  </Link>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="h-px bg-border/20 my-4" />
                {customerSession ? (
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="flex flex-col gap-6">
                    <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" /> My Account
                    </Link>
                    <button onClick={() => { handleCustomerLogout(); setMobileMenuOpen(false); }} className="text-left text-lg font-bold uppercase tracking-widest text-primary cursor-pointer">
                      Sign Out
                    </button>
                  </motion.div>
                ) : (
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                    <Link href="/account/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-primary-foreground bg-primary px-4 py-3 rounded-lg text-center flex justify-center items-center gap-2 hover:opacity-90 transition-opacity">
                      <User className="h-5 w-5" /> Sign In / Register
                    </Link>
                  </motion.div>
                )}
              </motion.nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
