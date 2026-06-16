import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Tag, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db';
import BannerSlider from '@/components/BannerSlider';

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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-6 px-6 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">Free Shipping</p>
              <p className="text-[10px] text-slate-500">On all orders above ₹1,499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">7 Days Returns</p>
              <p className="text-[10px] text-slate-500">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">100% Secured</p>
              <p className="text-[10px] text-slate-500">Secure simulated checkouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">Premium Quality</p>
              <p className="text-[10px] text-slate-500">Handpicked rich textures</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY HIGHLIGHTS --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl uppercase">Shop by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Explore tailored collections for everyone</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-slate-600 dark:text-slate-450 hover:underline inline-flex items-center gap-1">
            See All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {mainCategories.map((cat: any) => {
            // Pick fallback images for categories if they lack ones
            let catImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60';
            if (cat.slug === 'women') catImg = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=60';
            if (cat.slug === 'men') catImg = 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&auto=format&fit=crop&q=60';
            if (cat.slug === 'kids') catImg = 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&auto=format&fit=crop&q=60';

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group relative h-64 overflow-hidden rounded-2xl border border-border shadow-sm glow-on-hover hover:border-slate-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10" />
                <img
                  src={cat.image || catImg}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute bottom-6 left-6 z-20 space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">{cat.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                    Browse Collection <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- FEATURED PRODUCTS --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl uppercase flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-slate-500" />
              Featured Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-1">Our highly curated luxury design pieces</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-slate-600 dark:text-slate-455 hover:underline inline-flex items-center gap-1">
            Browse All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((prod: any) => {
            const hasDiscount = prod.regularPrice > prod.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
              : 0;

            return (
              <Link
                key={prod.id}
                href={`/product/${prod.slug}`}
                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-500/20 transition-all duration-300 glow-on-hover"
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950">
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-rose-600/20">
                      <Tag className="h-2.5 w-2.5" /> {discountPercent}% Off
                    </span>
                  )}
                  <img
                    src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/400?text=Product+Image'}
                    alt={prod.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{prod.brand}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-500 transition-colors">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-slate-600 dark:text-slate-400">₹{prod.sellingPrice}</span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">₹{prod.regularPrice}</span>
                      )}
                    </div>
                    
                    <span className="text-[10px] rounded bg-slate-50 px-1.5 py-0.5 font-bold text-slate-600 dark:bg-slate-950/50 dark:text-slate-400 uppercase tracking-wide">
                      {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- PROMOTION STRIP --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-950 to-slate-950 border border-slate-900/30 p-6 sm:p-12 text-white shadow-2xl">
          <div className="absolute right-0 bottom-0 top-0 opacity-20 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60"
              alt="Promotion model"
              className="h-full object-cover"
            />
          </div>
          <div className="max-w-md space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1 rounded bg-slate-500/30 px-2.5 py-0.5 text-xs font-bold tracking-wider text-slate-300 uppercase">
              Festival Season Sale
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight uppercase leading-none">
              Flat 20% Discount <br />On All Items
            </h3>
            <p className="text-xs text-slate-300">
              Apply the coupon code <span className="text-white font-bold underline">RUSH20</span> during checkout. Minimum cart size of ₹1,499. Grab yours today!
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 transition-all uppercase shadow-md shadow-white/10"
              >
                Shop Now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRENDING PRODUCTS --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl uppercase flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Trending Collection
            </h2>
            <p className="text-xs text-slate-500 mt-1">High-demand items flying off the shelves</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-slate-600 dark:text-slate-450 hover:underline inline-flex items-center gap-1">
            Browse All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {trendingProducts.map((prod: any) => {
            const hasDiscount = prod.regularPrice > prod.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
              : 0;

            return (
              <Link
                key={prod.id}
                href={`/product/${prod.slug}`}
                className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-500/20 transition-all duration-300 glow-on-hover"
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950">
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-rose-600/20">
                      <Tag className="h-2.5 w-2.5" /> {discountPercent}% Off
                    </span>
                  )}
                  <img
                    src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/400?text=Product+Image'}
                    alt={prod.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{prod.brand}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-slate-500 transition-colors">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-slate-600 dark:text-slate-400">₹{prod.sellingPrice}</span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">₹{prod.regularPrice}</span>
                      )}
                    </div>
                    
                    <span className="text-[10px] rounded bg-slate-50 px-1.5 py-0.5 font-bold text-slate-600 dark:bg-slate-950/50 dark:text-slate-400 uppercase tracking-wide">
                      {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
