'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Printer,
  ChevronRight,
  Clock,
  MapPin,
  CreditCard,
  Loader2
} from 'lucide-react';

function OrderSuccessDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function loadReceipt() {
      try {
        const res = await fetch(`/api/storefront/orders?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReceipt();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Retrieving your order invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md text-center py-16 px-4 space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/20">
          <Clock className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Receipt Not Found</h3>
          <p className="text-xs text-slate-500">
            We couldn&apos;t load the invoice details for this transaction, but rest assured your order is processing.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-500 transition-all uppercase tracking-wide"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8 print:py-0 print:px-0">
      
      {/* Printable Invoice Header - hidden on screen */}
      <div className="hidden print:block text-center space-y-2 mb-8">
        <h1 className="text-xl font-black uppercase tracking-wider">RUSH FASHION INVOICE</h1>
        <p className="text-xs text-slate-500">Order Number: {order.orderNumber} | Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        <hr className="border-slate-300" />
      </div>

      {/* Success Confirmation Card */}
      <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-555 dark:bg-emerald-950/20 dark:text-emerald-400 relative">
          <span className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75"></span>
          <CheckCircle className="h-10 w-10 relative z-10" />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Thank you for shopping with us! Your order <span className="font-extrabold text-slate-600 dark:text-slate-400">{order.orderNumber}</span> has been confirmed and is being packed.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:border-slate-350 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-white px-4 py-2.5 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 text-xs font-bold px-4 py-2.5 transition-all shadow-md shadow-slate-600/10"
          >
            Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Invoice details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Shipping address info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-500" /> Delivery Details
          </h3>
          <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-950 dark:text-white">{order.customerName}</p>
            <p>{order.shippingAddress.addressLine}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
            <p className="pt-1 text-[11px] text-slate-500">Contact: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment details info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-slate-500" /> Billing Records
          </h3>
          <div className="text-xs space-y-1.5 text-slate-750 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentDetails?.transactionId && (
              <div className="flex justify-between text-[10px] text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-1.5">
                <span>TXN Reference:</span>
                <span className="font-mono truncate max-w-[150px]">{order.paymentDetails.transactionId}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice items table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Itemized Invoice Receipt
        </h3>
        
        <div className="divide-y divide-slate-150 dark:divide-slate-850 space-y-3.5">
          {order.products.map((item: any) => (
            <div key={item.sku} className="flex gap-4 text-xs pt-3.5 first:pt-0">
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{item.variantInfo || 'Default Combination'}</p>
                <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-slate-900 dark:text-white">₹{item.price * item.quantity}</span>
                <p className="text-[10px] text-slate-400">₹{item.price} x {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className="border-slate-200 dark:border-slate-850 my-2" />

        {/* Pricing Summary */}
        <div className="space-y-2 text-xs font-semibold max-w-sm ml-auto">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="text-slate-900 dark:text-white">₹{order.totalAmount + order.discountAmount - order.shippingCharges - order.taxAmount}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Taxes</span>
            <span className="text-slate-900 dark:text-white">₹{order.taxAmount}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping Fees</span>
            {order.shippingCharges === 0 ? (
              <span className="text-emerald-500 uppercase text-[10px]">Free</span>
            ) : (
              <span className="text-slate-900 dark:text-white">₹{order.shippingCharges}</span>
            )}
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-slate-500 font-bold">
              <span>Applied Discount</span>
              <span>- ₹{order.discountAmount}</span>
            </div>
          )}
          <hr className="border-slate-200 dark:border-slate-850 my-1" />
          <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1">
            <span>Total Charged</span>
            <span className="text-lg text-slate-600 dark:text-slate-400">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 py-4 print:block hidden">
        Thank you for choosing Rush Fashion! Reach rushfashion@gmail.com for returns or help.
      </div>
      
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading receipt details...</p>
        </div>
      </div>
    }>
      <OrderSuccessDetails />
    </Suspense>
  );
}
