'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedButton } from '@/components/AnimatedButton';

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
    }, 6000);

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
    <div className="relative w-full h-[360px] md:h-[500px] overflow-hidden bg-viaro-black border border-border/20 rounded-3xl">
      
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-102 z-0 pointer-events-none'
              }`}
            >
              {/* Image with Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent z-10" />
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Text Content Overlay */}
              <div className="absolute inset-0 flex items-center z-20 px-8 sm:px-16 lg:px-24">
                <div className="max-w-xl space-y-4 md:space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">VIARO Campaigns</span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-wide font-headings">
                    {banner.title}
                  </h1>
                  <div>
                    <Link href={banner.redirectLink}>
                      <AnimatedButton variant="primary">
                        {banner.buttonText}
                      </AnimatedButton>
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
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-primary text-white hover:scale-105 transition-all focus:outline-none cursor-pointer border border-white/5"
            aria-label="Previous Campaign Banner"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-primary text-white hover:scale-105 transition-all focus:outline-none cursor-pointer border border-white/5"
            aria-label="Next Campaign Banner"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </>
      )}

      {/* Slider Indicators / Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-350 focus:outline-none cursor-pointer ${
                index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-card/40 hover:bg-card/80'
              }`}
              aria-label={`Slide target banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
