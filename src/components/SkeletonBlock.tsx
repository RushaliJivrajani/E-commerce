'use client';

import React from 'react';

interface SkeletonBlockProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function SkeletonBlock({ className = '', variant = 'rect' }: SkeletonBlockProps) {
  const shapeClass = 
    variant === 'circle' ? 'rounded-full' :
    variant === 'text' ? 'h-4 rounded w-3/4' : 'rounded-2xl';

  return (
    <div
      className={`
        animate-pulse 
        bg-viaro-charcoal/20 dark:bg-viaro-charcoal/60
        border border-border/10
        ${shapeClass} 
        ${className}
      `}
      style={{
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}
