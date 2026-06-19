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
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Sparkles,
  RefreshCcw
} from 'lucide-react';
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Compiling financial performance analytics...</p>
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

  // Pie chart accent palettes
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Metric Box Configuration
  const metricCards = [
    {
      title: "Today's Revenue",
      value: `₹${metrics.todayRevenue.toLocaleString('en-IN')}`,
      change: "+12.4% vs yesterday",
      isPositive: true,
      icon: IndianRupee,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20"
    },
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      change: "+8.2% this month",
      isPositive: true,
      icon: TrendingUp,
      color: "from-slate-500/10 to-blue-500/10 text-slate-500 border-slate-500/20"
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders,
      change: "+4.1% this week",
      isPositive: true,
      icon: ShoppingBag,
      color: "from-slate-500/10 to-purple-500/10 text-slate-500 border-slate-500/20"
    },
    {
      title: "Pending Orders",
      value: metrics.pendingOrders,
      change: "Needs packaging",
      isPositive: null,
      icon: Clock,
      color: "from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-500/20"
    },
    {
      title: "Delivered Orders",
      value: metrics.deliveredOrders,
      change: "Fulfillment complete",
      isPositive: null,
      icon: CheckCircle,
      color: "from-green-500/10 to-emerald-500/10 text-green-500 border-green-500/20"
    },
    {
      title: "Cancelled Orders",
      value: metrics.cancelledOrders,
      change: "Returned / Cancelled",
      isPositive: false,
      icon: XCircle,
      color: "from-rose-500/10 to-red-500/10 text-rose-500 border-rose-500/20"
    },
    {
      title: "Return Requests",
      value: metrics.returnRequests,
      change: "Needs attention",
      isPositive: metrics.returnRequests === 0 ? true : false,
      icon: RefreshCcw,
      color: "from-indigo-500/10 to-blue-500/10 text-indigo-500 border-indigo-500/20"
    },
    {
      title: "Total Customers",
      value: metrics.totalCustomers,
      change: "Active user count",
      isPositive: true,
      icon: Users,
      color: "from-sky-500/10 to-cyan-500/10 text-sky-500 border-sky-500/20"
    },
    {
      title: "Total Products",
      value: metrics.totalProducts,
      change: "In catalog listings",
      isPositive: null,
      icon: Package,
      color: "from-pink-500/10 to-rose-500/10 text-pink-500 border-pink-500/20"
    },
    {
      title: "Low Stock Products",
      value: metrics.lowStockProducts,
      change: "Needs reorder",
      isPositive: false,
      icon: AlertTriangle,
      color: metrics.lowStockProducts > 0 
        ? "from-red-500/20 to-orange-500/20 text-red-500 border-red-500/30 animate-pulse"
        : "from-slate-500/10 to-slate-600/10 text-slate-500 border-slate-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Dashboard Brief */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            Dashboard Overview <Sparkles className="h-5 w-5 text-slate-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time analytics and store status performance reports.
          </p>
        </div>

        {/* Global Controls Info */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span>Syncing automatically</span>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border border-border bg-card p-6 shadow-sm glow-on-hover ${card.color.split(' ').pop()}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${card.color.split(' ')[0]} ${card.color.split(' ')[1]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  {card.isPositive === true && (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />
                  )}
                  {card.isPositive === false && (
                    <ArrowDownRight className="h-3 w-3 text-rose-500 shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      card.isPositive === true
                        ? 'text-emerald-500 font-medium'
                        : card.isPositive === false
                        ? 'text-rose-500 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphs & Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Sales trends lines */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales Analysis</h2>
              <p className="text-xs text-slate-400">Monitor billing trends over time</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex rounded-lg bg-muted p-0.5">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSalesFilter(mode)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    salesFilter === mode
                      ? 'bg-slate-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartSource} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Area */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 border-b border-border pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Acquisition</h2>
            <p className="text-xs text-slate-400">Total client sign-ups trends</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.customerGrowth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value) => [value, 'Total Customers']}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 border-b border-border pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Category Performance</h2>
            <p className="text-xs text-slate-400">Revenue contribution per main department</p>
          </div>

          <div className="h-80 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.category}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {charts.category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products performance bar */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm font-sans">
          <div className="mb-4 border-b border-border pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Products</h2>
            <p className="text-xs text-slate-400">Best products by generated sales volume</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" tickFormatter={(name) => name.length > 15 ? name.substring(0, 15) + '...' : name} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#8b5cf6' }}
                  formatter={(value, name) => [name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row list of detailed products & inventory alerts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Top sales table */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Selling Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="text-xs uppercase bg-muted font-semibold border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 text-right">Gross revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {charts.topProducts.map((p, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-500">{p.sales}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-500">₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {charts.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">No sales transactions logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock alerts list box */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Inventory Stock Warnings</h2>
          <div className="space-y-4">
            {metrics.lowStockProducts > 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-bold">Attention Required!</span>
                  <p className="mt-0.5 text-slate-400">You have {metrics.lowStockProducts} products reaching low levels.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-bold">Inventory Healthy</span>
                  <p className="mt-0.5 text-slate-400">All products are well stocked.</p>
                </div>
              </div>
            )}

            {/* Quick action info */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs space-y-2">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block">Logistics Insight:</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Check the Product Management portal to filter and view catalog items marked under Alert quantities, duplicate listings, or bulk update items via spreadsheets.
              </p>
              <button 
                onClick={() => window.location.href = '/admin/products'}
                className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-400 hover:underline flex items-center gap-1"
              >
                Go to Catalog <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
