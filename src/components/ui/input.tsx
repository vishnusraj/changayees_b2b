import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'text-body focus-ring flex h-11 w-full rounded-lg border bg-background px-3 text-foreground transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-destructive' : 'border-input',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
