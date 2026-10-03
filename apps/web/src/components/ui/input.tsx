import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mono = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-btn border border-brand-dark dark:border-white/20 bg-white dark:bg-card px-4 py-2 text-sm font-medium text-foreground shadow-neo-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-neo focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          mono && 'font-mono text-xs',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
