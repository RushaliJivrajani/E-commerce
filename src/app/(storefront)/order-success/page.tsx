'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
  Printer,
  Clock,
  MapPin,
  CreditCard,
  Loader2
} from 'lucide-react';
import { LogoMark } from '@/components/BrandAssets';

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
      <div className="flex h-[60vh] items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Retrieving your order invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md text-center py-16 px-4 space-y-4 text-foreground bg-background">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
          <Clock className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Receipt Not Found</h3>
          <p className="text-xs text-muted-foreground font-light">
            We couldn&apos;t load the invoice details for this transaction, but rest assured your order is processing.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex rounded-xl bg-card border border-border/40 px-5 py-2.5 text-xs font-bold text-foreground hover:text-primary transition-all uppercase tracking-widest"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8 print:py-0 print:px-0 text-foreground">
      
      {/* Printable Invoice Header - hidden on screen */}
      <div className="hidden print:block text-center space-y-2 mb-8">
        <h1 className="text-xl font-black uppercase tracking-wider">VIARO INVOICE</h1>
        <p className="text-xs text-muted-foreground">Order Number: {order.orderNumber} | Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        <hr className="border-border/40" />
      </div>

      {/* Success Confirmation Card */}
      <div className="text-center py-10 bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 relative">
          <span className="absolute inset-0 bg-emerald-500/25 rounded-full animate-ping opacity-75"></span>
          <CheckCircle className="h-10 w-10 relative z-10" />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-foreground font-headings">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-light">
            Thank you for shopping with us! Your order <span className="font-extrabold text-foreground">{order.orderNumber}</span> has been confirmed and is being packed.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/40 hover:border-primary text-xs font-bold text-foreground px-4 py-2.5 transition-all cursor-pointer bg-card"
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white hover:bg-primary/95 text-xs font-bold px-4 py-2.5 transition-all shadow-md shadow-primary/20"
          >
            Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Invoice details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Shipping address info */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-primary" /> Delivery Details
          </h3>
          <div className="text-xs space-y-1 text-foreground leading-relaxed font-light">
            <p className="font-bold text-foreground">{order.customerName}</p>
            <p>{order.shippingAddress.addressLine}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
            <p className="pt-1 text-[11px] text-muted-foreground font-semibold">Contact: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment details info */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CreditCard className="h-4.5 w-4.5 text-primary" /> Billing Records
          </h3>
          <div className="text-xs space-y-1.5 text-foreground leading-relaxed font-light">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Mode:</span>
              <span className="font-bold uppercase tracking-wider">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                  : 'bg-primary/15 text-primary border border-primary/25'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentDetails?.transactionId && (
              <div className="flex justify-between text-[10px] text-muted-foreground border-t border-border/20 pt-1.5 mt-1">
                <span>TXN Reference:</span>
                <span className="font-mono truncate max-w-[150px] font-bold">{order.paymentDetails.transactionId}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice items table */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Itemized Invoice Receipt
        </h3>
        
        <div className="divide-y divide-border/20 space-y-3.5">
          {order.products.map((item: any) => (
            <div key={item.sku} className="flex gap-4 text-xs pt-3.5 first:pt-0">
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate">{item.name}</h4>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{item.variantInfo || 'Default Combination'}</p>
                <p className="text-[10px] text-muted-foreground">SKU: {item.sku}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                <p className="text-[10px] text-muted-foreground">₹{item.price.toLocaleString()} x {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className="border-border/20 my-2" />

        {/* Pricing Summary */}
        <div className="space-y-2 text-xs font-semibold max-w-sm ml-auto">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">₹{(order.totalAmount + order.discountAmount - order.shippingCharges - order.taxAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxes</span>
            <span className="text-foreground">₹{order.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping Fees</span>
            {order.shippingCharges === 0 ? (
              <span className="text-emerald-500 uppercase text-[9px] font-black tracking-widest">Free</span>
            ) : (
              <span className="text-foreground">₹{order.shippingCharges.toLocaleString()}</span>
            )}
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-primary font-bold">
              <span>Applied Discount</span>
              <span>- ₹{order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <hr className="border-border/20 my-1" />
          <div className="flex justify-between text-sm font-black text-foreground pt-1">
            <span>Total Charged</span>
            <span className="text-lg text-primary">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-muted-foreground py-4 border-t border-border/20 print:block hidden uppercase tracking-widest font-bold">
        Thank you for choosing VIARO! Contact customercare@viaro.com for returns or help.
      </div>
      
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading receipt details...</p>
        </div>
      </div>
    }>
      <OrderSuccessDetails />
    </Suspense>
  );
}
