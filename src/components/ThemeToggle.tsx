'use client';

import React from 'react';
import { useTheme } from '@/lib/theme-context';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full border border-border bg-card text-foreground hover:text-primary transition-all duration-300 shadow-sm focus:outline-none flex items-center justify-center cursor-pointer overflow-hidden group hover:border-primary/50"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
