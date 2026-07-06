'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Metrics {
  todayRevenue: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  returnRequests: number;
}

interface ChartsData {
  daily: { name: string; revenue: number }[];
  weekly: { name: string; revenue: number }[];
  monthly: { name: string; revenue: number }[];
  category: { name: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  customerGrowth: { name: string; count: number }[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [salesFilter, setSalesFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Fetch Dashboard Stats
  useEffect(() => {
    async function getStats() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setCharts(data.charts);
        } else {
          toast.error('Failed to load dashboard metrics');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching dashboard statistical details');
      } finally {
        setLoading(false);
      }
    }
    getStats();
  }, []);

  if (loading || !metrics || !charts) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 bg-card border border-border/40 p-8 rounded-3xl shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Compiling Analytics...</p>
        </div>
      </div>
    );
  }

  // Choose Sales Trend Source
  const salesChartSource =
    salesFilter === 'daily'
      ? charts.daily
      : salesFilter === 'weekly'
      ? charts.weekly
      : charts.monthly;

  // Pie chart accent palettes - tailored premium color scale
  const COLORS = ['#FF2D2D', '#1A1A1D', '#F5F5F5', '#f59e0b', '#3b82f6'];

  // Metric Box Configuration
  const metricCards = [
    {
      title: "Today's Revenue",
      value: `₹${metrics.todayRevenue.toLocaleString('en-IN')}`,
      change: "+12.4%",
      isPositive: true,
      icon: IndianRupee
    },
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      change: "+8.2%",
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders,
      change: "+4.1%",
      isPositive: true,
      icon: ShoppingBag
    },
    {
      title: "Pending Orders",
      value: metrics.pendingOrders,
      change: "Action required",
      isPositive: null,
      icon: Clock
    },
    {
      title: "Delivered",
      value: metrics.deliveredOrders,
      change: "Completed",
      isPositive: null,
      icon: CheckCircle
    },
    {
      title: "Cancelled",
      value: metrics.cancelledOrders,
      change: "Lost revenue",
      isPositive: false,
      icon: XCircle
    },
    {
      title: "Returns",
      value: metrics.returnRequests,
      change: "Pending requests",
      isPositive: metrics.returnRequests === 0 ? true : false,
      icon: RefreshCcw
    },
    {
      title: "Customers",
      value: metrics.totalCustomers,
      change: "Active users",
      isPositive: true,
      icon: Users
    },
    {
      title: "Products",
      value: metrics.totalProducts,
      change: "Live listings",
      isPositive: null,
      icon: Package
    },
    {
      title: "Low Stock",
      value: metrics.lowStockProducts,
      change: "Needs reorder",
      isPositive: false,
      icon: AlertTriangle
    }
  ];

  return (
    <div className="space-y-10 text-foreground">
      
      {/* Upper Dashboard Brief */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-foreground flex items-center gap-3">
            Dashboard Overview <Sparkles className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            Real-time analytics and storefront status.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-border/40 rounded-xl bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <motion.div 
        className="grid grid-cols-2 gap-4 lg:grid-cols-5"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
      >
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          const isLowStockAlert = card.title === 'Low Stock' && metrics.lowStockProducts > 0;
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-card border p-5 rounded-3xl flex flex-col justify-between shadow-sm transition-all duration-300 ${
                isLowStockAlert ? 'border-primary/30 bg-primary/5' : 'border-border/40 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{card.title}</span>
                <div className={`p-2 rounded-xl border ${isLowStockAlert ? 'bg-primary/15 text-primary border-primary/20' : 'bg-muted text-primary border-border/40'}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black text-foreground block mb-1">
                  {card.value}
                </span>
                <div className="flex items-center gap-1">
                  {card.isPositive === true && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {card.isPositive === false && (
                    <ArrowDownRight className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      card.isPositive === true
                        ? 'text-emerald-500'
                        : card.isPositive === false
                        ? 'text-primary'
                        : 'text-primary'
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Graphs & Charts Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        
        {/* Sales trends lines */}
        <div className="bg-card p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Sales Revenue</h2>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Billing trends over time</p>
            </div>
            
            <div className="flex border border-border/40 rounded-xl p-1 bg-muted">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSalesFilter(mode)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    salesFilter === mode
                      ? 'bg-card text-foreground shadow-sm border border-border/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartSource} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{fill: 'currentColor'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${v}`} tick={{fill: 'currentColor'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'rgba(255,45,45,0.3)', strokeWidth: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Area */}
        <div className="bg-card p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Customer Growth</h2>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Total sign-ups trends</p>
          </div>

          <div className="h-80 w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.customerGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{fill: 'currentColor'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--muted-foreground)" tick={{fill: 'currentColor'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value) => [value, 'Total Customers']}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie */}
        <div className="bg-card p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Category Split</h2>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Revenue by department</p>
          </div>

          <div className="h-80 w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.category}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  formatter={(value) => `₹${Number(value).toLocaleString()}`} 
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products performance bar */}
        <div className="bg-card p-6 rounded-3xl border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Products</h2>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Volume generated</p>
          </div>

          <div className="h-80 w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tickFormatter={(name) => name.length > 10 ? name.substring(0, 10) + '...' : name} tick={{fill: 'currentColor'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--muted-foreground)" tick={{fill: 'currentColor'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                  formatter={(value, name) => [name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                />
                <Bar dataKey="sales" fill="var(--primary)" maxBarSize={32} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </motion.div>

      {/* Row list of detailed products & inventory alerts */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        className="grid grid-cols-1 gap-6 xl:grid-cols-3"
      >
        {/* Top sales table */}
        <div className="xl:col-span-2 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-350">
          <div className="p-6 border-b border-border/40">
             <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Selling Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Units Sold</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {charts.topProducts.map((p, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4.5 text-xs font-semibold text-foreground">{p.name}</td>
                    <td className="px-6 py-4.5 text-xs font-black text-primary text-center">{p.sales}</td>
                    <td className="px-6 py-4.5 text-xs font-black text-foreground text-right">₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {charts.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-xs font-light text-muted-foreground">No sales transactions logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock alerts list box */}
        <div className="bg-card border border-border/40 p-6 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="pb-2 border-b border-border/20">
               <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Inventory Alerts</h2>
            </div>
            
            <div className="space-y-4">
              {metrics.lowStockProducts > 0 ? (
                <div className="flex items-start gap-4 p-4 border border-primary/20 bg-primary/5 rounded-2xl text-primary">
                  <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest">Attention Required!</span>
                    <p className="text-xs font-bold text-foreground">You have {metrics.lowStockProducts} products reaching low levels.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-emerald-500">
                  <CheckCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest">Inventory Healthy</span>
                    <p className="text-xs font-bold text-foreground">All products are well stocked.</p>
                  </div>
                </div>
              )}

              {/* Quick action info */}
              <div className="border border-border/40 bg-muted/30 rounded-2xl p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Logistics Insight</span>
                <p className="text-xs text-muted-foreground leading-relaxed font-light">
                  Check the Product Management portal to filter and view catalog items marked under Alert quantities, duplicate listings, or bulk update items.
                </p>
                <button 
                  onClick={() => window.location.href = '/admin/products'}
                  className="text-xs font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 transition-colors pt-2 cursor-pointer"
                >
                  Go to Catalog <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
