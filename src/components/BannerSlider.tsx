'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface BannerItem {
  id: string;
  image: string;
  title: string;
  buttonText: string;
  redirectLink: string;
}

interface BannerSliderProps {
  banners: BannerItem[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play interval
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full h-[320px] md:h-[450px] overflow-hidden bg-slate-900">
      
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image with Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent z-10" />
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Text Content Overlay */}
              <div className="absolute inset-0 flex items-center z-20 px-6 sm:px-12 lg:px-24">
                <div className="max-w-xl space-y-4 md:space-y-6">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                    {banner.title}
                  </h1>
                  <div>
                    <Link
                      href={banner.redirectLink}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white px-5 py-3 text-xs md:text-sm font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-slate-600/30"
                    >
                      <span>{banner.buttonText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chevron Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white hover:scale-105 transition-all focus:outline-none"
            aria-label="Previous Campaign Banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white hover:scale-105 transition-all focus:outline-none"
            aria-label="Next Campaign Banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slider Indicators / Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-350 focus:outline-none ${
                index === activeIndex ? 'w-6 bg-slate-500' : 'w-2.5 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Slide target banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
