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
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-border/30">
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground mb-1">Free Shipping</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">On orders above ₹1,499</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RefreshCw className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground mb-1">7 Days Returns</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hassle-free exchange</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground mb-1">100% Secured</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Safe checkout</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground mb-1">Premium Quality</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Finest textures</p>
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
                  className="group relative flex flex-col overflow-hidden transition-all duration-500 bg-background"
                >
                  <div className="h-[400px] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 duration-500" />
                    <img
                      src={cat.image || catImg}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-white drop-shadow-xl">{cat.name}</h3>
                      <span className="text-xs font-bold uppercase tracking-widest text-white mt-4 border-b border-white pb-1">Explore</span>
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
        <section className="mt-16 mb-16">
          <div className="w-full bg-card text-foreground border-y border-border py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
              <Sparkles className="h-96 w-96 text-foreground" />
            </div>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
              <div className="space-y-4 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Limited Time Drops</span>
                <h3 className="text-3xl md:text-5xl font-extrabold uppercase tracking-widest font-headings">
                  Festival Season Sale
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto md:mx-0 font-light tracking-wide leading-relaxed mt-2">
                  Apply the coupon code <span className="text-foreground font-bold uppercase tracking-widest border-b border-primary ml-1">RUSH20</span> during checkout for 20% off. Minimum cart size of ₹1,499.
                </p>
              </div>
              <div className="mt-4 md:mt-0 z-10">
                <Link href="/shop" className="inline-flex items-center justify-center bg-foreground text-background px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-colors">
                  Shop Now
                </Link>
              </div>
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
