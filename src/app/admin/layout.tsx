'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  FileSpreadsheet,
  Users,
  Image as ImageIcon,
  Ticket,
  MessageSquare,
  FileText,
  History,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sun,
  Moon,
  Loader2,
  Sparkles,
  Bell,
  Search,
  RotateCcw
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  permission?: string;
  roles?: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Fetch Current Session Profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // If profile check fails, redirect to login
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  // Sync Theme State (Forced Light Theme)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    const loader = toast.loading('Signing out...');
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Signed out successfully', { id: loader });
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      } else {
        toast.error('Failed to log out', { id: loader });
      }
    } catch (e) {
      toast.error('Logout error', { id: loader });
    }
  };

  // Sidebar Items
  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: FileSpreadsheet },
    { name: 'Returns', href: '/admin/returns', icon: RotateCcw },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Pages Content', href: '/admin/content', icon: FileText },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Activity Logs', href: '/admin/logs', icon: History, roles: ['Super Admin'] },
    { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['Super Admin', 'Admin'] },
  ];

  // RBAC Filter: Display items only if user role matches item requirements
  const allowedItems = sidebarItems.filter(item => {
    if (!user) return false;
    if (item.roles && !item.roles.includes(user.role)) {
      return false;
    }
    return true;
  });

  // Calculate Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p && p !== 'admin');
    if (paths.length === 0) return ['Admin', 'Dashboard'];
    return ['Admin', ...paths.map(p => p.charAt(0).toUpperCase() + p.slice(1))];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-muted-foreground">Loading admin environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Toaster position="top-right" />

      {/* --- SIDEBAR FOR DESKTOP --- */}
      <aside
        className={`sidebar-transition hidden border-r border-border bg-card/85 backdrop-blur-md md:flex md:flex-col shrink-0 h-screen sticky top-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold tracking-wider">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-500 to-slate-600 shadow-md shadow-slate-500/20 text-white shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                RUSH <span className="bg-gradient-to-r from-slate-500 to-slate-500 bg-clip-text text-transparent">FASHION</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:block"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Info Capsule */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-500/10 text-slate-500 shrink-0">
              <User className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-950 dark:text-white truncate">{user?.name}</p>
                <span className="inline-block rounded bg-slate-500/25 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 dark:text-slate-400 mt-0.5">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-600 text-white shadow-md shadow-slate-600/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }`}
                title={collapsed ? item.name : ''}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR FOR MOBILE --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="flex h-16 items-center px-4 border-b border-slate-200 dark:border-slate-800">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold tracking-wider">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-600 text-white shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-base font-extrabold text-slate-950 dark:text-white">RUSH FASHION</span>
              </Link>
            </div>
            
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
              {allowedItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border p-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header navbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/70 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 md:flex uppercase tracking-wider">
              {getBreadcrumbs().map((b, i, arr) => (
                <React.Fragment key={b}>
                  <span className={i === arr.length - 1 ? 'text-slate-600 dark:text-slate-400 font-bold' : ''}>
                    {b}
                  </span>
                  {i < arr.length - 1 && <span className="text-slate-300 dark:text-slate-800">/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-3">
            {/* Search Bar Simulation */}
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Quick search products..."
                className="w-48 rounded-lg border border-border bg-muted py-1.5 pl-9 pr-3 text-xs focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>



            {/* Notifications Trigger */}
            <button
              onClick={() => toast.success('All systems operational! No new notifications.')}
              className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-500"></span>
              </span>
            </button>

            {/* Mobile User Name display */}
            <span className="text-xs font-semibold text-slate-500 md:hidden">{user?.name.split(' ')[0]}</span>
          </div>
        </header>

        {/* Content Render Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
