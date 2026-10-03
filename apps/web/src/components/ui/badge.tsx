import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-badge border border-brand-dark dark:border-white/20 shadow-neo-sm select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        primary: 'bg-primary text-primary-foreground',
        lime: 'bg-brand-lime text-brand-dark',
        dark: 'bg-brand-dark text-white',
        white: 'bg-white text-brand-dark dark:bg-card dark:text-white',
        secondary: 'bg-brand-gray text-brand-dark dark:bg-card dark:text-white',
        outline: 'bg-transparent text-foreground border-brand-dark dark:border-white/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
