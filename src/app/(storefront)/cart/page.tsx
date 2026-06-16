'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Percent,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState<any>(null);

  // Fetch Settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/storefront/init');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSettings();
  }, []);

  // Retrieve cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const cartStr = localStorage.getItem('rf_cart');
      if (cartStr) {
        setCart(JSON.parse(cartStr));
      }
      
      const couponStr = localStorage.getItem('rf_coupon');
      if (couponStr) {
        setAppliedCoupon(JSON.parse(couponStr));
      }
    } catch (e) {
      console.error('Failed to load cart from local storage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync Cart changes back to localStorage
  const saveCartState = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('rf_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('rf-cart-changed'));
  };

  const handleQuantityChange = (sku: string, diff: number) => {
    const newCart = cart.map((item) => {
      if (item.sku === sku) {
        const updatedQty = item.quantity + diff;
        if (updatedQty < 1) return item; // Min quantity is 1
        return { ...item, quantity: updatedQty };
      }
      return item;
    });
    saveCartState(newCart);
    
    // Recalculate coupon if already applied
    if (appliedCoupon) {
      // Re-validate coupon against new subtotal
      const newSubtotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (newSubtotal < appliedCoupon.minAmount) {
        setAppliedCoupon(null);
        localStorage.removeItem('rf_coupon');
        toast.error('Applied coupon removed as subtotal fell below requirements.');
      } else {
        // Recalculate discount
        let newDiscount = 0;
        if (appliedCoupon.type === 'Percentage') {
          newDiscount = (newSubtotal * appliedCoupon.value) / 100;
          if (appliedCoupon.maxDiscount && newDiscount > appliedCoupon.maxDiscount) {
            newDiscount = appliedCoupon.maxDiscount;
          }
        } else if (appliedCoupon.type === 'Fixed') {
          newDiscount = appliedCoupon.value;
        }
        const updatedCoupon = { ...appliedCoupon, discount: Math.round(newDiscount) };
        setAppliedCoupon(updatedCoupon);
        localStorage.setItem('rf_coupon', JSON.stringify(updatedCoupon));
      }
    }
  };

  const handleRemoveItem = (sku: string) => {
    const newCart = cart.filter((item) => item.sku !== sku);
    saveCartState(newCart);
    toast.success('Product removed from cart');

    // Remove coupon if cart is empty
    if (newCart.length === 0) {
      setAppliedCoupon(null);
      localStorage.removeItem('rf_coupon');
    } else if (appliedCoupon) {
      // Recheck subtotal limits
      const newSubtotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (newSubtotal < appliedCoupon.minAmount) {
        setAppliedCoupon(null);
        localStorage.removeItem('rf_coupon');
        toast.error('Applied coupon removed as subtotal fell below requirements.');
      }
    }
  };

  // Coupon Submission
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch('/api/storefront/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const validatedCoupon = data.coupon;
        setAppliedCoupon(validatedCoupon);
        localStorage.setItem('rf_coupon', JSON.stringify(validatedCoupon));
        setCouponCode('');
        toast.success(`Coupon code "${validatedCoupon.code}" applied successfully!`);
      } else {
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      toast.error('Error applying coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('rf_coupon');
    toast.success('Coupon removed');
  };

  // Billing math
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Tax calculations
  const taxRate = settings?.taxRateDefault || 18;
  const taxAmount = Math.round(subtotal * (taxRate / 100));

  // Shipping charge zones calculations
  const getShippingCharges = () => {
    if (subtotal === 0) return 0;
    // Default flat calculations: free shipping above 1499, else 100
    if (subtotal >= 1499) return 0;
    return 100;
  };
  const shippingCharges = getShippingCharges();

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmount = subtotal + taxAmount + shippingCharges - discountAmount;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading your cart items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-slate-500">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-350 dark:text-slate-800" />
        <span className="text-slate-600 dark:text-slate-400 font-bold">Shopping Cart</span>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight">YOUR CART BAG</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-800 p-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-950">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500">Looks like you haven&apos;t added any items to your cart yet.</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex rounded-xl bg-slate-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-500 transition-all uppercase tracking-wide"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Items list table */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.sku}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                {/* Product Thumbnail */}
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1 text-center sm:text-left overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h3>
                  {item.variantInfo && (
                    <p className="text-[10px] text-slate-500 font-medium">{item.variantInfo}</p>
                  )}
                  <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                </div>

                {/* Controls (quantity, price, remove) */}
                <div className="flex items-center gap-6 justify-between w-full sm:w-auto shrink-0">
                  {/* Quantity control */}
                  <div className="flex items-center border border-slate-205 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <button
                      onClick={() => handleQuantityChange(item.sku, -1)}
                      className="p-2 hover:bg-slate-150 dark:hover:bg-slate-900"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.sku, 1)}
                      className="p-2 hover:bg-slate-150 dark:hover:bg-slate-900"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[70px]">
                    <p className="text-sm font-black text-slate-600 dark:text-slate-400">₹{item.price * item.quantity}</p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-slate-400">₹{item.price} each</p>
                    )}
                  </div>

                  {/* Delete Icon */}
                  <button
                    onClick={() => handleRemoveItem(item.sku)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="space-y-6">
            
            {/* Coupon Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Discount Coupon</h3>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-950/60 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-slate-500">Applied (₹{appliedCoupon.discount} off)</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-bold text-rose-500 hover:underline uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. RUSH20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white dark:bg-slate-600 dark:hover:bg-slate-500 text-xs font-bold rounded-xl uppercase transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                    <span>Apply</span>
                  </button>
                </form>
              )}
            </div>

            {/* Billing breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Order Summary</h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Taxes ({taxRate}%)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Charges</span>
                  {shippingCharges === 0 ? (
                    <span className="font-bold text-emerald-500 uppercase text-[10px]">Free</span>
                  ) : (
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{shippingCharges}</span>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                {/* Subtotal limit alert */}
                {subtotal < 1499 && (
                  <div className="flex gap-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-950/40 p-2.5 text-[10px] text-amber-600 dark:text-amber-450 leading-relaxed font-medium">
                    <Info className="h-4.5 w-4.5 shrink-0" />
                    <span>Add ₹{1499 - subtotal} more items to unlock FREE shipping!</span>
                  </div>
                )}

                <hr className="border-slate-200 dark:border-slate-800 my-2" />

                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1">
                  <span>Total Amount</span>
                  <span className="text-lg text-slate-600 dark:text-slate-400">₹{totalAmount}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="pt-2">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-slate-600/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
