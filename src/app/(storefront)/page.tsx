import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Tag, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db';
import BannerSlider from '@/components/BannerSlider';
import FadeIn from '@/components/FadeIn';

export default async function StorefrontHome() {
  // Fetch data from database
  const products = await db.find('products', (p: any) => p.status === 'Active');
  const categories = await db.find('categories', (c: any) => c.status === 'Active');
  const banners = await db.find('banners', (b: any) => b.status === 'Active' && b.type === 'Homepage Slider');

  const featuredProducts = products.filter((p: any) => p.featured).slice(0, 4);
  const trendingProducts = products.filter((p: any) => p.trending).slice(0, 4);
  const mainCategories = categories.filter((c: any) => !c.parentId);

  // Fallback banner if none configured in DB
  const sliderBanners = banners.length > 0 ? banners : [
    {
      id: 'ban_default',
      title: 'Premium Streetwear & Classic Apparels',
      redirectLink: '/shop',
      buttonText: 'Explore Catalog',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Slider */}
      <BannerSlider banners={sliderBanners} />

      {/* --- VALUE PROPS --- */}
      <FadeIn direction="up">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-6 px-6 glass-panel rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100/50 text-indigo-500 shrink-0 border border-white">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Free Shipping</p>
              <p className="text-xs text-slate-500">On all orders above ₹1,499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100/50 text-indigo-500 shrink-0 border border-white">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">7 Days Returns</p>
              <p className="text-xs text-slate-500">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100/50 text-indigo-500 shrink-0 border border-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">100% Secured</p>
              <p className="text-xs text-slate-500">Secure checkout process</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100/50 text-indigo-500 shrink-0 border border-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Premium Quality</p>
              <p className="text-xs text-slate-500">Handpicked rich textures</p>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* --- CATEGORY HIGHLIGHTS --- */}
      <FadeIn direction="up" delay={0.1}>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 p-4 border-b border-slate-200/60">
          <h2 className="text-3xl font-bold text-slate-900">Shop by Category</h2>
          <Link href="/shop" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
            See All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
          {mainCategories.map((cat: any) => {
            let catImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60';
            if (cat.slug === 'women') catImg = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=60';
            if (cat.slug === 'men') catImg = 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&auto=format&fit=crop&q=60';
            if (cat.slug === 'kids') catImg = 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=60';

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group relative flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 glow-on-hover glass-card"
              >
                <div className="h-64 overflow-hidden product-image-container relative">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
                  <img
                    src={cat.image || catImg}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-6 left-6 z-20">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{cat.name}</h3>
                    <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors underline decoration-2 underline-offset-4 mt-1 inline-block">Shop Now</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </FadeIn>

      {/* --- FEATURED PRODUCTS --- */}
      <FadeIn direction="up" delay={0.2}>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200/60 pb-4">
          <h2 className="text-3xl font-bold text-slate-900">Featured Catalog</h2>
          <Link href="/shop" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
            See All Products
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod: any) => {
            const hasDiscount = prod.regularPrice > prod.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
              : 0;

            return (
              <Link
                key={prod.id}
                href={`/product/${prod.slug}`}
                className="group flex flex-col glow-on-hover"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 mb-4 rounded-3xl product-image-container">
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm border border-rose-400/50">
                      -{discountPercent}%
                    </span>
                  )}
                  <img
                    src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/400?text=Product+Image'}
                    alt={prod.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col space-y-1 px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{prod.brand}</span>
                  <h3 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {prod.name}
                  </h3>
                  
                  {/* Reviews mock */}
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-indigo-400 text-indigo-400" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-400">({Math.floor(Math.random() * 200) + 10})</span>
                  </div>

                  <div className="mt-2 flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">₹{prod.sellingPrice.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-sm font-medium text-slate-400 line-through">₹{prod.regularPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </FadeIn>

      {/* --- PROMOTION STRIP --- */}
      <FadeIn direction="up" delay={0.3}>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="rounded-3xl overflow-hidden glass-panel p-10 text-slate-900 flex flex-col md:flex-row items-center justify-between">
          <div className="space-y-3">
            <h3 className="text-3xl font-bold">
              Festival Season Sale
            </h3>
            <p className="text-sm text-slate-600 max-w-md">
              Apply the coupon code <span className="text-indigo-600 font-bold bg-indigo-100 px-2 py-0.5 rounded ml-1">RUSH20</span> during checkout for 20% off. Minimum cart size of ₹1,499.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/shop"
              className="inline-block rounded-xl bg-indigo-500 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* --- TRENDING PRODUCTS --- */}
      <FadeIn direction="up" delay={0.1}>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-12">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200/60 pb-4">
          <h2 className="text-3xl font-bold text-slate-900">Trending Collection</h2>
          <Link href="/shop" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
            Explore More
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((prod: any) => {
            const hasDiscount = prod.regularPrice > prod.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
              : 0;

            return (
              <Link
                key={prod.id}
                href={`/product/${prod.slug}`}
                className="group flex flex-col glow-on-hover"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 mb-4 rounded-3xl product-image-container">
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm border border-rose-400/50">
                      -{discountPercent}%
                    </span>
                  )}
                  <img
                    src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/400?text=Product+Image'}
                    alt={prod.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col space-y-1 px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{prod.brand}</span>
                  <h3 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {prod.name}
                  </h3>
                  
                  {/* Reviews mock */}
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-indigo-400 text-indigo-400" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-400">({Math.floor(Math.random() * 200) + 10})</span>
                  </div>

                  <div className="mt-2 flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900">₹{prod.sellingPrice.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-sm font-medium text-slate-400 line-through">₹{prod.regularPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </FadeIn>
    </div>
  );
}
