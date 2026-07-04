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
import { LogoMark } from '@/components/BrandAssets';

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
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1} />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading VIARO Admin Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans transition-colors duration-500">
      <Toaster position="top-right" />

      {/* --- SIDEBAR FOR DESKTOP --- */}
      <aside
        className={`hidden md:flex md:flex-col shrink-0 h-screen sticky top-0 bg-card border-r border-border/40 text-foreground transition-all duration-350 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border/40">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark className="h-8 w-8 text-primary" />
            {!collapsed && (
              <span className="text-lg font-black text-foreground tracking-widest uppercase font-headings">
                VIARO <span className="text-primary">Admin</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden p-2 text-muted-foreground hover:text-primary md:block transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary rounded-full shrink-0 border border-primary/20">
              <User className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                <span className="text-[9px] text-primary mt-0.5 block font-black uppercase tracking-widest">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/25 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                }`}
                title={collapsed ? item.name : ''}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border/40 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* --- SIDEBAR FOR MOBILE --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/95 backdrop-blur-md">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 flex-col bg-card border-r border-border/40">
            <div className="flex h-20 items-center px-6 border-b border-border/40">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <LogoMark className="h-8 w-8 text-primary" />
                <span className="text-sm font-extrabold uppercase tracking-widest text-foreground font-headings">VIARO Admin</span>
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
                    className={`flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-xl border ${
                      isActive
                        ? 'bg-primary/10 text-primary border-primary/25 shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border/40 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header navbar */}
        <header className="flex h-20 items-center justify-between border-b border-border/40 bg-card px-6 md:px-12 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-foreground md:hidden hover:text-primary transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground md:flex">
              {getBreadcrumbs().map((b, i, arr) => (
                <React.Fragment key={b}>
                  <span className={i === arr.length - 1 ? 'text-foreground' : 'hover:text-primary transition-colors cursor-pointer'}>
                    {b}
                  </span>
                  {i < arr.length - 1 && <span className="text-border/60">/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-6">
            <div className="relative hidden max-w-xs sm:block">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search command palette..."
                className="w-64 border border-border/60 bg-muted rounded-xl py-2 pl-9 pr-4 text-xs text-foreground focus:ring-2 focus:ring-primary focus:border-primary focus:bg-background outline-none transition-all placeholder-muted-foreground"
              />
            </div>

            <button
              onClick={() => toast.success('All systems operational! No new notifications.')}
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border border-background shadow-sm"></span>
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
