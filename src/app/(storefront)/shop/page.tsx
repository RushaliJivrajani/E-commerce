'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Loader2,
  X
} from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { ProductCard } from '@/components/ProductCard';

interface Category {
  id: string;
  name: string;
  parentId?: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  regularPrice: number;
  sellingPrice: number;
  stock: number;
  featured: boolean;
  trending: boolean;
  status: string;
  images: string[];
}

function ShopCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // UI States
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch initial product & category data
  useEffect(() => {
    async function initCatalog() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        if (prodRes.ok && catRes.ok) {
          const prodData = await prodRes.json();
          const catData = await catRes.json();
          
          const activeProds = prodData.products?.filter((p: any) => p.status === 'Active') || [];
          setProducts(activeProds);
          setCategories(catData.categories || []);

          // Set max price based on available products
          if (activeProds.length > 0) {
            const maxVal = Math.max(...activeProds.map((p: any) => p.sellingPrice));
            setPriceRange(prev => ({ ...prev, max: maxVal }));
          }
        }
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    initCatalog();
  }, []);

  // Update category filter when URL searchParam changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  // Extract unique brands for brand filter sidebar
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    if (products.length > 0) {
      const maxVal = Math.max(...products.map((p: any) => p.sellingPrice));
      setPriceRange({ min: 0, max: maxVal });
    } else {
      setPriceRange({ min: 0, max: 10000 });
    }
  };

  // Filter and Sort Pipeline
  const filteredProducts = products.filter((prod) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchBrand = prod.brand?.toLowerCase().includes(q);
      const matchDesc = prod.description?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc) return false;
    }

    // 2. Categories
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(prod.category)) {
        return false;
      }
    }

    // 3. Brands
    if (selectedBrands.length > 0) {
      if (!selectedBrands.includes(prod.brand)) {
        return false;
      }
    }

    // 4. Price Limit
    if (prod.sellingPrice < priceRange.min || prod.sellingPrice > priceRange.max) {
      return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.sellingPrice - b.sellingPrice;
    }
    if (sortBy === 'price-high') {
      return b.sellingPrice - a.sellingPrice;
    }
    // Default: 'newest'
    return b.id.localeCompare(a.id);
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-foreground">
      <FadeIn direction="up">
        {/* Top Breadcrumb & Heading */}
        <div className="flex flex-col items-start justify-start border-b border-border/40 pb-6 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-wider text-foreground font-headings">
            {selectedCategories.length === 1 && categories.length > 0 
              ? `${categories.find(c => c.id === selectedCategories[0])?.name || 'Shop'} Collection`
              : 'Shop Collection'}
          </h1>
          <p className="text-xs text-primary mt-1.5 font-bold uppercase tracking-widest">Showing {sortedProducts.length} Premium Items</p>
        </div>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* --- DESKTOP SIDEBAR FILTERS --- */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-24">
            
            {/* Global Search Bar */}
            <div className="relative w-full">
              <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border/40 shadow-sm rounded-2xl py-2.5 pl-9 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder-muted-foreground"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-primary" /> Filters
              </span>
              <button onClick={clearFilters} className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest cursor-pointer">
                Clear All
              </button>
            </div>

            {/* Categories Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Categories</h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
                {categories.filter(c => !c.parentId).map((cat) => (
                  <div key={cat.id} className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => {
                          setSelectedCategories(prev => 
                            prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                          );
                        }}
                        className="rounded border-border bg-muted text-primary focus:ring-primary w-4 h-4 accent-primary"
                      />
                      <span>{cat.name}</span>
                    </label>
                    {categories.filter(sub => sub.parentId === cat.id).map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-muted-foreground/80 hover:text-foreground pl-6 transition-colors uppercase tracking-wide">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(sub.id)}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              prev.includes(sub.id) ? prev.filter(c => c !== sub.id) : [...prev, sub.id]
                            );
                          }}
                          className="rounded border-border bg-muted text-primary focus:ring-primary w-3.5 h-3.5 accent-primary"
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
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Brands</h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded border-border bg-muted text-primary focus:ring-primary w-4 h-4 accent-primary"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Price Range</h3>
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span>₹{priceRange.min}</span>
                <span>₹{priceRange.max}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(10000, ...products.map((p: any) => p.sellingPrice))}
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full accent-primary cursor-pointer bg-muted h-1.5 rounded-lg appearance-none"
              />
            </div>
          </aside>

          {/* --- MAIN CATALOG GRID --- */}
          <div className="flex-1 w-full space-y-6">
            {/* Sorting and Mobile Filter Toggle */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-foreground font-bold uppercase tracking-wider border border-border/40 px-3.5 py-2 rounded-2xl bg-card shadow-sm text-xs cursor-pointer"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>

              <div className="hidden lg:block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Showing {sortedProducts.length} items
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-card border border-border/40 shadow-sm rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border/40 shadow-sm space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary/70">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-foreground">No Results Found</h3>
                <p className="text-xs text-muted-foreground font-light">Adjust your filters to explore more items.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 inline-block bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white rounded-2xl hover:bg-primary/95 transition-colors shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* --- MOBILE DRAWER FILTERS --- */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden bg-background/95 backdrop-blur-md">
          <div className="w-[85%] max-w-sm bg-card border-r border-border/40 flex flex-col h-full overflow-y-auto absolute left-0 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border/40">
              <span className="text-xs font-black uppercase tracking-widest text-foreground">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              <div className="relative w-full border-b border-border/40">
                <Search className="absolute top-2 left-0 h-4 w-4 text-primary" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2 pl-7 pr-4 text-xs focus:outline-none placeholder-muted-foreground font-semibold text-foreground"
                />
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-border/20 pb-2">Categories</h3>
                <div className="flex flex-col gap-3">
                  {categories.filter(c => !c.parentId).map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <label className="flex items-center gap-3 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          className="rounded border-border bg-muted text-primary focus:ring-primary accent-primary w-4 h-4"
                        />
                        <span>{cat.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-border/20 pb-2">Price Limit</h3>
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>₹{priceRange.min}</span>
                  <span>₹{priceRange.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(10000, ...products.map((p: any) => p.sellingPrice))}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full accent-primary cursor-pointer bg-muted h-1.5 rounded-lg appearance-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border/40 flex gap-4">
              <button
                onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                className="flex-1 py-4 border border-border/40 rounded-xl text-[10px] font-bold text-muted-foreground text-center uppercase tracking-widest hover:bg-muted transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-4 bg-primary text-[10px] font-bold text-white rounded-xl text-center uppercase tracking-widest hover:bg-primary/90 shadow-md transition-colors cursor-pointer"
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
      <div className="flex h-[60vh] items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
      </div>
    }>
      <ShopCatalog />
    </Suspense>
  );
}
