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
        <div className="flex flex-col items-center gap-3 glass-panel p-8 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-500">Compiling Analytics...</p>
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

  // Pie chart accent palettes - more muted/premium
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#f43f5e'];

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
    <div className="space-y-12">
      
      {/* Upper Dashboard Brief */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Dashboard Overview <Sparkles className="h-5 w-5 text-indigo-500" />
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Real-time analytics and store status.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${
                card.title === 'Low Stock' && metrics.lowStockProducts > 0 ? 'border-rose-200 bg-rose-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-semibold text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.title === 'Low Stock' && metrics.lowStockProducts > 0 ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-slate-50 text-indigo-600 border-slate-200'}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900 block mb-1">
                  {card.value}
                </span>
                <div className="flex items-center gap-1">
                  {card.isPositive === true && (
                    <ArrowUpRight className="h-4 w-4 text-teal-500" />
                  )}
                  {card.isPositive === false && (
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      card.isPositive === true
                        ? 'text-teal-500'
                        : card.isPositive === false
                        ? 'text-rose-500'
                        : 'text-indigo-500'
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sales Revenue</h2>
              <p className="text-sm font-medium text-slate-500">Billing trends over time</p>
            </div>
            
            <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSalesFilter(mode)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    salesFilter === mode
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full text-[10px] font-light">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartSource} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₹${v}`} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#f59e0b' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fbbf24', strokeWidth: 0, stroke: 'rgba(251,191,36,0.3)', strokeWidth: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Area */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Customer Growth</h2>
            <p className="text-sm font-medium text-slate-500">Total sign-ups trends</p>
          </div>

          <div className="h-80 w-full text-[10px] font-light">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.customerGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fce7f3" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fce7f3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fbcfe8' }}
                  formatter={(value) => [value, 'Total Customers']}
                />
                <Area type="monotone" dataKey="count" stroke="#fce7f3" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Category Split</h2>
            <p className="text-sm font-medium text-slate-500">Revenue by department</p>
          </div>

          <div className="h-80 w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-700">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.category}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#000', color: '#fff', borderRadius: '0', fontSize: '12px' }}
                  formatter={(value) => `₹${Number(value).toLocaleString()}`} 
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products performance bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
            <p className="text-sm font-medium text-slate-500">Volume generated</p>
          </div>

          <div className="h-80 w-full text-[10px] font-light">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickFormatter={(name) => name.length > 10 ? name.substring(0, 10) + '...' : name} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', borderColor: '#000', color: '#fff', borderRadius: '0', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value, name) => [name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                />
                <Bar dataKey="sales" fill="#3b82f6" maxBarSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row list of detailed products & inventory alerts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Top sales table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-slate-200">
             <h2 className="text-lg font-bold text-slate-900">Top Selling Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">Product Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">Units Sold</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {charts.topProducts.map((p, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-xs font-medium text-slate-900">{p.name}</td>
                    <td className="px-8 py-5 text-xs font-bold text-indigo-600 text-center">{p.sales}</td>
                    <td className="px-8 py-5 text-xs font-bold text-teal-600 text-right">₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {charts.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-xs font-light text-slate-500">No sales transactions logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock alerts list box */}
        <div className="glass-panel p-6 rounded-2xl space-y-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="pb-2">
             <h2 className="text-lg font-bold text-slate-900">Inventory Alerts</h2>
          </div>
          
          <div className="space-y-4">
            {metrics.lowStockProducts > 0 ? (
              <div className="flex items-start gap-4 p-4 border border-rose-500/50 bg-rose-500/10 rounded-xl text-rose-400">
                <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-glow">Attention Required!</span>
                  <p className="text-xs font-medium text-rose-300">You have {metrics.lowStockProducts} products reaching low levels.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 border border-teal-500/30 bg-teal-500/10 rounded-xl text-teal-400">
                <CheckCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-glow">Inventory Healthy</span>
                  <p className="text-xs font-medium text-teal-200/70">All products are well stocked.</p>
                </div>
              </div>
            )}

            {/* Quick action info */}
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-5 space-y-3">
              <span className="text-sm font-semibold text-slate-900">Logistics Insight</span>
              <p className="text-sm text-slate-500">
                Check the Product Management portal to filter and view catalog items marked under Alert quantities, duplicate listings, or bulk update items.
              </p>
              <button 
                onClick={() => window.location.href = '/admin/products'}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors pt-2"
              >
                Go to Catalog <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
