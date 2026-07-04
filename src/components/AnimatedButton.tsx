'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

export function AnimatedButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative inline-flex items-center justify-center overflow-hidden
        px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300
        cursor-pointer font-sans select-none
        ${isPrimary 
          ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/45' 
          : 'bg-transparent text-foreground border border-foreground/30 hover:border-foreground'}
        ${className}
      `}
      {...props}
    >
      {/* Sheen effect for primary button */}
      {isPrimary && (
        <motion.div
          initial={{ left: '-100%' }}
          whileHover={{ left: '100%' }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
