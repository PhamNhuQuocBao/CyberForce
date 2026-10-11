import * as React from 'react';
import { cn } from '@/lib/utils';
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-card">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  );
}
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('border-b bg-muted px-4 py-3 font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('border-b px-4 py-4 align-top last:border-r-0', className)} {...props} />
  );
}
