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

  // Sync Theme State (Forced Light Theme for Dashboard)
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
    { name: 'Staff Members', href: '/admin/staff', icon: Users, roles: ['Super Admin'] },
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
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-black" strokeWidth={1} />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-500">
      <Toaster position="top-right" />

      {/* --- SIDEBAR FOR DESKTOP --- */}
      <aside
        className={`hidden md:flex md:flex-col shrink-0 h-screen sticky top-0 bg-white shadow-lg border-r border-slate-200 border-y-0 border-l-0 text-slate-900 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-indigo-500 text-white rounded-md shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-slate-900 tracking-wide">
                Rush Closet
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden p-2 text-slate-400 hover:text-indigo-600 md:block transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-indigo-100 text-indigo-600 rounded-full shrink-0">
              <User className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <span className="text-[10px] text-indigo-600 mt-0.5 block font-bold uppercase tracking-widest">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto hide-scrollbar">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
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
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR FOR MOBILE --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 flex-col bg-white border-r border-slate-200">
            <div className="flex h-20 items-center px-6 border-b border-slate-200">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center bg-black text-white shrink-0">
                  <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-extrabold uppercase tracking-widest text-black">Rush Closet</span>
              </Link>
            </div>
            
            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
              {allowedItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-black'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header navbar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white border-x-0 border-t-0 px-6 md:px-12 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-slate-900 md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden items-center gap-2 text-sm font-bold text-slate-500 md:flex">
              {getBreadcrumbs().map((b, i, arr) => (
                <React.Fragment key={b}>
                  <span className={i === arr.length - 1 ? 'text-slate-900' : 'hover:text-indigo-600 transition-colors cursor-pointer'}>
                    {b}
                  </span>
                  {i < arr.length - 1 && <span className="text-slate-300">/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-6">
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 border border-slate-300 bg-slate-50 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-shadow placeholder-slate-400"
              />
            </div>

            <button
              onClick={() => toast.success('All systems operational! No new notifications.')}
              className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 border border-white shadow-sm"></span>
            </button>
          </div>
        </header>

        {/* Content Render Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
