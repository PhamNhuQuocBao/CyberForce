import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-btn border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-[#80BC1D]',
        lime: 'border-transparent bg-primary text-primary-foreground hover:bg-primary-hover active:bg-[#80BC1D]',
        dark: 'border-transparent bg-brand-dark text-white hover:bg-[#212C42]',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-card-hover',
        outline: 'border-control bg-card text-foreground hover:bg-muted',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:opacity-90',
        ghost: 'border-transparent text-foreground hover:bg-muted',
        link: 'border-transparent text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-5 py-2.5',
        sm: 'px-3 py-2',
        lg: 'min-h-12 px-6 py-3 text-base',
        icon: 'h-11 w-11 shrink-0 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
export { Button, buttonVariants };
