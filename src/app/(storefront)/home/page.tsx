import React from 'react';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Tag, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db';
import BannerSlider from '@/components/BannerSlider';
import FadeIn from '@/components/FadeIn';
import { ProductCard } from '@/components/ProductCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import VMark3DWrapper from '@/components/VMark3DWrapper';

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
      title: 'Modern. Minimal. Made for the now.',
      redirectLink: '/shop',
      buttonText: 'Explore Collection',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="space-y-16 pb-20 relative">
      <VMark3DWrapper />
      
      {/* Hero Banner Slider */}
      <BannerSlider banners={sliderBanners} />

      {/* --- VALUE PROPS --- */}
      <FadeIn direction="up">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-8 px-8 glass-panel rounded-3xl border border-border/40">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On all orders above ₹1,499</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">7 Days Returns</p>
                <p className="text-xs text-muted-foreground">Hassle-free exchange policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">100% Secured</p>
                <p className="text-xs text-muted-foreground">Secure checkout process</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground">Premium Quality</p>
                <p className="text-xs text-muted-foreground">Handpicked rich textures</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* --- CATEGORY HIGHLIGHTS --- */}
      <FadeIn direction="up" delay={0.1}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 p-4 border-b border-border/40">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">Shop by Category</h2>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all">
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
                  className="group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 glass-card"
                >
                  <div className="h-72 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                    <img
                      src={cat.image || catImg}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-6 left-6 z-20">
                      <h3 className="text-xl font-bold uppercase tracking-wider text-white drop-shadow-md">{cat.name}</h3>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/95 group-hover:text-primary transition-colors underline decoration-2 underline-offset-4 mt-2 inline-block">Explore Now</span>
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
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex justify-between items-end mb-8 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">Featured Catalog</h2>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all">
              See All Products
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      </FadeIn>

      {/* --- PROMOTION STRIP --- */}
      <FadeIn direction="up" delay={0.3}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="rounded-3xl overflow-hidden glass-panel p-10 md:p-12 text-foreground flex flex-col md:flex-row items-center justify-between border border-border/40 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="h-32 w-32 text-primary" />
            </div>
            <div className="space-y-3 z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Limited Time Drops</span>
              <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide">
                Festival Season Sale
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Apply the coupon code <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded ml-1">RUSH20</span> during checkout for 20% off. Minimum cart size of ₹1,499.
              </p>
            </div>
            <div className="mt-6 md:mt-0 z-10">
              <Link href="/shop">
                <AnimatedButton variant="primary">
                  Shop Now
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* --- TRENDING PRODUCTS --- */}
      <FadeIn direction="up" delay={0.1}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 mb-12">
          <div className="flex justify-between items-end mb-8 border-b border-border/40 pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground">Trending Collection</h2>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all">
              Explore More
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
