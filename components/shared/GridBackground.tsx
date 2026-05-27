'use client';

import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   GRID BACKGROUND — Reusable dashed grid background.
   
   Usage:
     import { GridBackground } from '@/components/shared/GridBackground';
     
     <div className="relative min-h-screen">
       <GridBackground />
     </div>

   Customize:
     <GridBackground variant="solid" gridSize={28} />
     <GridBackground lineColor="rgba(0,100,200,0.2)" />
───────────────────────────────────────────────────────────────────────────── */

export interface GridBackgroundProps {
  /** 'dashed' renders a dashed/dotted grid, 'solid' renders continuous lines */
  variant?: 'dashed' | 'solid';
  /** Grid cell size in px (default: 20) */
  gridSize?: number;
  /** Grid line color for light mode (default: rgba(0,188,161,0.18) — secondary brand teal) */
  lineColor?: string;
  /** Dark mode grid line color override */
  darkLineColor?: string;
  /** Additional className for the wrapper */
  className?: string;
}

export function GridBackground({
  variant = 'dashed',
  gridSize = 20,
  lineColor,
  darkLineColor,
  className,
}: GridBackgroundProps) {
  const lightLine = lineColor ?? 'rgba(0,188,161,0.18)';
  const darkLine = darkLineColor ?? 'rgba(255,255,255,0.08)';

  return (
    <div className={cn('absolute inset-0 z-0 pointer-events-none overflow-hidden', className)}>
      {/* Grid — Light mode */}
      <div
        className="absolute inset-0 dark:hidden"
        style={
          variant === 'dashed'
            ? {
                backgroundImage: `linear-gradient(to right, ${lightLine} 1px, transparent 1px), linear-gradient(to bottom, ${lightLine} 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                maskImage: `repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)`,
                WebkitMaskImage: `repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)`,
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in' as string,
              }
            : {
                backgroundImage: `linear-gradient(to right, ${lightLine} 1px, transparent 1px), linear-gradient(to bottom, ${lightLine} 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }
        }
      />

      {/* Grid — Dark mode */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={
          variant === 'dashed'
            ? {
                backgroundImage: `linear-gradient(to right, ${darkLine} 1px, transparent 1px), linear-gradient(to bottom, ${darkLine} 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                maskImage: `repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)`,
                WebkitMaskImage: `repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)`,
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in' as string,
              }
            : {
                backgroundImage: `linear-gradient(to right, ${darkLine} 1px, transparent 1px), linear-gradient(to bottom, ${darkLine} 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }
        }
      />
    </div>
  );
}

export default GridBackground;
