import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard Tailwind utility to merge and resolve class conflicts safely.
 * Follows the official Tailwind CSS & shadcn/ui pattern.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
