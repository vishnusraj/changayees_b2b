import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'text-body focus-ring flex min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-foreground transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-destructive' : 'border-input',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
