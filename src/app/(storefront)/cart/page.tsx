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
import FadeIn from '@/components/FadeIn';

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
      const newSubtotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (newSubtotal < appliedCoupon.minAmount) {
        setAppliedCoupon(null);
        localStorage.removeItem('rf_coupon');
        toast.error('Applied coupon removed as subtotal fell below requirements.');
      } else {
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

    if (newCart.length === 0) {
      setAppliedCoupon(null);
      localStorage.removeItem('rf_coupon');
    } else if (appliedCoupon) {
      const newSubtotal = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (newSubtotal < appliedCoupon.minAmount) {
        setAppliedCoupon(null);
        localStorage.removeItem('rf_coupon');
        toast.error('Applied coupon removed as subtotal fell below requirements.');
      }
    }
  };

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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = settings?.taxRateDefault || 18;
  const taxAmount = Math.round(subtotal * (taxRate / 100));

  const getShippingCharges = () => {
    if (subtotal === 0) return 0;
    if (subtotal >= 1499) return 0;
    return 100;
  };
  const shippingCharges = getShippingCharges();
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmount = subtotal + taxAmount + shippingCharges - discountAmount;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      
      {/* Path Breadcrumbs */}
      <FadeIn direction="up">
        <div className="flex justify-center items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary text-glow">Shopping Bag</span>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <div className="text-center pb-8 border-b border-white/10">
          <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em] text-white text-glow">Your Shopping Bag</h1>
        </div>
      </FadeIn>

      {cart.length === 0 ? (
        <FadeIn direction="up" delay={0.2}>
          <div className="text-center py-24 space-y-8 glass-panel border border-white/10 rounded-3xl mx-auto max-w-2xl shadow-2xl">
            <ShoppingBag className="h-12 w-12 mx-auto text-primary drop-shadow-lg" strokeWidth={1} />
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-white">Your Bag is Empty</h3>
              <p className="text-xs text-muted-foreground/80 font-light">Explore our curated collection to add items.</p>
            </div>
            <Link
              href="/shop"
              className="inline-block border border-primary/50 px-8 py-4 text-[10px] font-bold text-foreground bg-primary hover:bg-primary transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(255,45,45,0.3)] rounded-xl"
            >
              Discover New Arrivals
            </Link>
          </div>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left: Items list table */}
            <div className="lg:col-span-8 space-y-8">
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-8">
                {cart.map((item) => (
                  <div
                    key={item.sku}
                    className="flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center pb-8 border-b border-white/10 group"
                  >
                    {/* Product Info */}
                    <div className="w-full sm:col-span-6 flex items-center gap-6">
                      <div className="h-32 w-24 bg-card/5 shrink-0 rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/30 transition-colors">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover mix-blend-screen" />
                      </div>
                      <div className="space-y-2">
                        <Link href={`/product/${item.productId}`} className="text-sm font-semibold text-white hover:text-primary transition-colors tracking-wide block">
                          {item.name}
                        </Link>
                        {item.variantInfo && (
                          <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest">{item.variantInfo}</p>
                        )}
                        <p className="text-[9px] text-muted-foreground font-light uppercase tracking-widest">Ref: {item.sku}</p>
                        <p className="text-xs font-bold text-white pt-2 hidden sm:block">₹{item.price}</p>
                      </div>
                    </div>

                    {/* Quantity control */}
                    <div className="w-full sm:col-span-3 flex justify-between sm:justify-center items-center">
                      <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quantity</span>
                      <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-card/5">
                        <button
                          onClick={() => handleQuantityChange(item.sku, -1)}
                          className="px-3 py-2 hover:bg-card/10 transition-colors text-white hover:text-primary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-[11px] font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.sku, 1)}
                          className="px-3 py-2 hover:bg-card/10 transition-colors text-white hover:text-primary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Price Total */}
                    <div className="w-full sm:col-span-2 flex justify-between sm:justify-end items-center">
                      <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
                      <p className="text-sm font-bold text-primary tracking-wide">₹{item.price * item.quantity}</p>
                    </div>

                    {/* Remove */}
                    <div className="w-full sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveItem(item.sku)}
                        className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">
              
              <div className="glass-panel border border-white/10 rounded-2xl p-8 space-y-8 shadow-xl">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-white text-glow">Order Summary</h3>
                
                <div className="space-y-4 text-xs font-light text-muted-foreground/50 tracking-wide">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estimated Tax ({taxRate}%)</span>
                    <span className="font-bold text-white">₹{taxAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    {shippingCharges === 0 ? (
                      <span className="font-bold text-primary uppercase tracking-widest text-[10px]">Complimentary</span>
                    ) : (
                      <span className="font-bold text-white">₹{shippingCharges}</span>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-primary font-bold bg-primary/10/10 p-2 rounded-lg border border-primary/30/20">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                <hr className="border-white/10" />

                <div className="flex justify-between items-center text-sm font-extrabold text-white uppercase tracking-widest">
                  <span>Total</span>
                  <span className="text-xl tracking-wide text-primary drop-shadow-md">₹{totalAmount}</span>
                </div>

                {subtotal < 1499 && (
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 p-4 text-center rounded-xl">
                    Add ₹{1499 - subtotal} more items to unlock COMPLIMENTARY shipping!
                  </div>
                )}

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-primary text-foreground hover:bg-primary rounded-xl text-xs font-bold uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(255,45,45,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Coupon Form */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Apply VIP Discount Code</h3>
                {appliedCoupon ? (
                  <div className="flex justify-between items-center border border-primary/30 bg-primary/10 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary">
                    <span>{appliedCoupon.code} (₹{appliedCoupon.discount} OFF)</span>
                    <button onClick={handleRemoveCoupon} className="text-muted-foreground/80 hover:text-white transition-colors underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-white/20 bg-card/5 border-r-0 px-4 py-3.5 rounded-l-xl text-xs font-light text-white focus:outline-none focus:border-primary uppercase placeholder-slate-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-6 bg-card/10 border border-white/20 border-l-0 rounded-r-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Apply'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
