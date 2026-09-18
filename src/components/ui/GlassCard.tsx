import { type HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

/**
 * The single glass-surface primitive used everywhere. Intensity/blur are
 * driven by CSS variables set from Settings, so this component never
 * hardcodes opacity values.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ interactive, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'rounded-card border border-border bg-surface-raised/[var(--glass-alpha)] backdrop-blur-glass shadow-glass',
        interactive && 'transition-transform hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';
