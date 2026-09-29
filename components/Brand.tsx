import React, { useId } from 'react';

/** Logo mark + wordmark. */
export const Brand: React.FC<{ size?: 'sm' | 'md' | 'lg'; light?: boolean; className?: string }> = ({ size = 'md', light, className = '' }) => {
  const mark = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  // Unique gradient id per instance: a shared id would resolve to a hidden copy and render black.
  const gradientId = `brand-g-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className={`${mark} shrink-0`} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D9BC6A" />
            <stop offset="1" stopColor="#A8663A" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#1E1A15" />
        <path d="M20 22h24l8 10-20 22L12 32z" fill={`url(#${gradientId})`} />
        <path d="M20 22l12 10 12-10M12 32h40M32 32l-8-10M32 32l8-10M32 32v22" fill="none" stroke="#1E1A15" strokeOpacity=".35" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span className={`font-serif font-semibold tracking-[0.18em] ${text} ${light ? 'text-white' : 'text-ink-900'}`}>PEDRETES</span>
    </span>
  );
};
