'use client';

import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  light?: boolean;
}

// 1. Standalone V Logo Mark (V with red triangle at the bottom tip)
export function LogoMark({ className = 'h-8 w-8', ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* V shape */}
      <path
        d="M 15 15 L 50 80 L 85 15"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Red accent triangle at the base */}
      <path
        d="M 50 63 L 42 77 L 58 77 Z"
        fill="#FF2D2D"
      />
    </svg>
  );
}

// 2. Primary Wordmark "VIARO - LIVE IN STYLE."
export function LogoWordmark({ className = 'h-10 w-auto', ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 320 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* V */}
      <path
        d="M 20 15 L 42 60 L 64 15"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      
      {/* I */}
      <path
        d="M 88 15 L 88 60"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="square"
      />
      
      {/* A (Geometric Triangle with inner Red Triangle) */}
      <path
        d="M 112 60 L 134 15 L 156 60"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M 134 32 L 126 48 L 142 48 Z"
        fill="#FF2D2D"
      />

      {/* R */}
      <path
        d="M 180 60 L 180 15 H 202 C 212 15 214 26 202 36 H 180 M 198 36 L 214 60"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* O */}
      <circle
        cx="244"
        cy="37.5"
        r="22.5"
        stroke="currentColor"
        strokeWidth="6.5"
      />

      {/* Register Mark ® */}
      <circle
        cx="278"
        cy="15"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <text
        x="278"
        y="17.5"
        fontSize="6"
        fontWeight="bold"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        R
      </text>

      {/* Tagline: — LIVE IN STYLE. — */}
      <text
        x="137"
        y="80"
        fill="currentColor"
        fontSize="9.5"
        fontWeight="500"
        letterSpacing="0.48em"
        textAnchor="middle"
        fontFamily="var(--font-montserrat), sans-serif"
      >
        LIVE IN STYLE.
      </text>
    </svg>
  );
}

// 3. Stacked Logo
export function StackedLogo({ className = 'h-24 w-auto', ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex flex-col items-center text-center gap-4 ${className}`} {...props}>
      <LogoMark className="h-16 w-16 text-currentColor" />
      <LogoWordmark className="h-10 w-auto text-currentColor" />
    </div>
  );
}

// 4. Logo Spinner / Loading State
export function LogoSpinner({ className = 'h-12 w-12', ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} {...props}>
      <div className="relative animate-pulse">
        <LogoMark className="h-16 w-16 text-viaro-red" />
        <div className="absolute inset-0 border-2 border-viaro-red/20 rounded-full animate-ping pointer-events-none scale-75" />
      </div>
    </div>
  );
}
