import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <label
        htmlFor={inputId}
        className="text-body-sm inline-flex cursor-pointer items-center gap-2 text-foreground"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            'focus-ring h-4 w-4 rounded border-input text-primary accent-[hsl(var(--primary))]',
            className,
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
