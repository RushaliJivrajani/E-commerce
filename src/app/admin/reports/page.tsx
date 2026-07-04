'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  Download,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Users,
  Loader2
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Simple fetch all
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resO, resP] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);
      if (resO.ok && resP.ok) {
        const dO = await resO.json();
        const dP = await resP.json();
        setOrders(dO.orders);
        setProducts(dP.products);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrders = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Amount (INR)', 'Status'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      o.customerEmail,
      o.totalAmount,
      o.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadCSV('sales_report.csv', csvContent);
    toast.success('Sales report exported');
  };

  const handleExportProducts = () => {
    if (products.length === 0) {
      toast.error('No products to export');
      return;
    }
    
    const headers = ['Product Name', 'Category', 'Stock Level', 'Status', 'Date Added'];
    const rows = products.map(p => [
      `"${p.name}"`,
      p.category,
      p.stock,
      p.status,
      new Date(p.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadCSV('inventory_report.csv', csvContent);
    toast.success('Inventory report exported');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground/80">Aggregating report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white sm:text-3xl flex items-center gap-2">
            Data Reports & Exports <FileText className="h-6 w-6 text-muted-foreground" />
          </h1>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
            Generate and download business intelligence reports for analytics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales Report Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-slate-800 dark:bg-foreground text-background/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/100/10 text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground dark:text-white text-lg">Sales & Revenue</h3>
              <p className="text-xs text-muted-foreground">Export order history and financial data</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Orders Available</span>
              <span className="font-bold text-foreground dark:text-white">{orders.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Gross Processed Value</span>
              <span className="font-bold text-foreground dark:text-white">
                ₹{orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' && o.status !== 'Returned' ? o.totalAmount : 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportOrders}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-card dark:text-foreground dark:hover:bg-card/80"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>

        {/* Inventory Report Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-slate-800 dark:bg-foreground text-background/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground dark:text-white text-lg">Inventory Status</h3>
              <p className="text-xs text-muted-foreground">Export product catalog and stock levels</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Products Linked</span>
              <span className="font-bold text-foreground dark:text-white">{products.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Low Stock Variants</span>
              <span className="font-bold text-rose-500">
                {products.filter(p => p.stock <= 10).length}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportProducts}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-card dark:text-foreground dark:hover:bg-card/80"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>

      </div>

    </div>
  );
}
