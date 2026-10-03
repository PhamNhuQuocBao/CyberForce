import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none rounded-btn border border-brand-dark dark:border-white/20 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-lg active:translate-y-0.5 active:shadow-neo-sm',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        lime: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        dark: 'bg-brand-dark text-white hover:bg-[#2A2B37]',
        secondary:
          'bg-brand-gray text-brand-dark hover:bg-[#E5E5E5] dark:bg-card dark:text-white dark:hover:bg-card-hover',
        outline: 'bg-white text-brand-dark hover:bg-brand-gray dark:bg-card dark:text-white',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        ghost:
          'border-transparent shadow-none hover:bg-brand-gray dark:hover:bg-card hover:border-brand-dark hover:shadow-neo-sm',
        link: 'border-transparent shadow-none text-brand-dark dark:text-white underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base font-extrabold',
        icon: 'h-11 w-11 p-0 rounded-pill',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
