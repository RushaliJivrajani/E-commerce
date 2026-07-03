'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Tag,
  ShoppingBag,
  Grid,
  List,
  Loader2,
  X,
  Star
} from 'lucide-react';
import FadeIn from '@/components/FadeIn';

function ShopCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  // Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category from URL param if it changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  // Load products and categories
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/storefront/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setCategories(data.categories || []);
          
          if (data.products && data.products.length > 0) {
            const maxPrice = Math.max(...data.products.map((p: any) => p.sellingPrice));
            setPriceRange(prev => ({ ...prev, max: maxPrice || 10000 }));
          }
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.tags && prod.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    let matchesCategory = true;
    if (selectedCategories.length > 0) {
      const getCategoryAndChildrenIds = (catId: string): string[] => {
        const ids = [catId];
        const children = categories.filter(c => c.parentId === catId);
        children.forEach(child => {
          ids.push(...getCategoryAndChildrenIds(child.id));
        });
        return ids;
      };
      const allowedCategoryIds = selectedCategories.flatMap(c => getCategoryAndChildrenIds(c));
      matchesCategory = allowedCategoryIds.includes(prod.category) || 
                        allowedCategoryIds.includes(prod.subcategory) || 
                        allowedCategoryIds.includes(prod.childcategory);
    }

    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(prod.brand);

    const matchesPrice =
      prod.sellingPrice >= priceRange.min && prod.sellingPrice <= priceRange.max;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'price-low') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'price-high') return b.sellingPrice - a.sellingPrice;
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map((p: any) => p.sellingPrice));
      setPriceRange({ min: 0, max: maxPrice || 10000 });
    }
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn direction="up">
        {/* Top Breadcrumb & Heading */}
        <div className="flex flex-col items-start justify-start border-b border-slate-200/60 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Shop Collection</h1>
          <p className="text-sm text-indigo-600 mt-1 font-medium">Showing {sortedProducts.length} Premium Items</p>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* --- DESKTOP SIDEBAR FILTERS --- */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6 sticky top-24">
            
            {/* Global Search Bar */}
            <div className="relative w-full">
              <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/60 shadow-sm rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-500" /> Filters
              </span>
              <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors font-semibold">
                Clear All
              </button>
            </div>

            {/* Categories Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Categories</h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
                {categories.filter(c => !c.parentId).map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => {
                          setSelectedCategories(prev => 
                            prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                          );
                        }}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 w-4 h-4 accent-indigo-500"
                      />
                      <span>{cat.name}</span>
                    </label>
                    {categories.filter(sub => sub.parentId === cat.id).map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 text-sm cursor-pointer text-slate-500 hover:text-slate-900 pl-6 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(sub.id)}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              prev.includes(sub.id) ? prev.filter(c => c !== sub.id) : [...prev, sub.id]
                            );
                          }}
                          className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 w-3.5 h-3.5 accent-indigo-500"
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            {availableBrands.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Brands</h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 w-4 h-4 accent-indigo-500"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Price Range</h3>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>₹{priceRange.min}</span>
                <span>₹{priceRange.max}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(10000, ...products.map((p: any) => p.sellingPrice))}
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full accent-indigo-500 cursor-pointer bg-slate-200 h-1.5 rounded-lg appearance-none"
              />
            </div>
          </aside>

          {/* --- MAIN CATALOG GRID --- */}
          <div className="flex-1 w-full space-y-6">
                     {/* Sorting and Mobile Filter Toggle */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-slate-900 font-semibold border border-slate-200 px-3 py-1.5 rounded-xl bg-white shadow-sm"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>

              <div className="hidden lg:block text-slate-500 font-medium">
                Showing {sortedProducts.length} items
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium text-sm hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Results Found</h3>
                <p className="text-sm text-slate-500">Adjust your filters to explore more items.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 inline-block bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((prod) => {
                  const hasDiscount = prod.regularPrice > prod.sellingPrice;
                  const discountPercent = hasDiscount
                    ? Math.round(((prod.regularPrice - prod.sellingPrice) / prod.regularPrice) * 100)
                    : 0;

                  return (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className="group flex flex-col rounded-3xl overflow-hidden bg-white/40 hover:bg-white transition-all duration-300 p-2 relative shadow-sm hover:shadow-xl border border-slate-100"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 mb-3 rounded-2xl product-image-container">
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 z-10 bg-rose-500 px-2 py-1 text-xs font-bold text-white rounded-lg shadow-sm border border-rose-400/50">
                            -{discountPercent}%
                          </span>
                        )}
                        <img
                          src={prod.images && prod.images[0] ? prod.images[0] : 'https://placehold.co/400?text=Product+Image'}
                          alt={prod.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex flex-col space-y-1 px-2 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prod.brand}</span>
                        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors h-10">
                          {prod.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                               <Star key={s} className="h-3 w-3 fill-indigo-400 text-indigo-400" />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-slate-400 ml-1">({Math.floor(Math.random() * 300) + 12})</span>
                        </div>

                        <div className="flex flex-col mt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-slate-900">₹{prod.sellingPrice.toLocaleString()}</span>
                            {hasDiscount && (
                              <span className="text-sm font-medium text-slate-400 line-through">₹{prod.regularPrice.toLocaleString()}</span>
                            )}
                          </div>
                          
                          <span className="text-xs font-semibold mt-1 text-teal-500">
                            {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>      )}
          </div>
        </div>
      </FadeIn>

      {/* --- MOBILE DRAWER FILTERS --- */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden bg-black/80 backdrop-blur-md">
          <div className="w-[85%] max-w-sm glass-panel border-r border-white/10 flex flex-col h-full overflow-y-auto absolute left-0 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <span className="text-sm font-extrabold uppercase tracking-widest text-white text-glow">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400 hover:text-indigo-400 transition-colors">
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              <div className="relative w-full border-b border-white/20">
                <Search className="absolute top-2 left-0 h-4 w-4 text-indigo-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2 pl-7 pr-4 text-xs focus:outline-none placeholder-slate-500 font-light text-white"
                />
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2">Categories</h3>
                <div className="flex flex-col gap-3">
                  {categories.filter(c => !c.parentId).map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <label className="flex items-center gap-3 text-xs font-light cursor-pointer text-slate-300 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          className="rounded border-slate-600 bg-slate-800 text-indigo-400 focus:ring-indigo-400 accent-indigo-400 w-4 h-4"
                        />
                        <span className="tracking-wide">{cat.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2">Price Limit</h3>
                <div className="flex items-center justify-between text-xs font-light text-slate-300">
                  <span>₹{priceRange.min}</span>
                  <span>₹{priceRange.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(10000, ...products.map((p: any) => p.sellingPrice))}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full accent-indigo-400 cursor-pointer bg-white/20 h-1.5 rounded-lg appearance-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-4">
              <button
                onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                className="flex-1 py-4 border border-white/20 rounded-xl text-[10px] font-bold text-slate-300 text-center uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-4 bg-indigo-400 text-[10px] font-bold text-slate-900 rounded-xl text-center uppercase tracking-widest hover:bg-indigo-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-colors"
              >
                View Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" strokeWidth={1} />
      </div>
    }>
      <ShopCatalog />
    </Suspense>
  );
}
