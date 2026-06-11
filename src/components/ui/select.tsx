import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

/**
 * Styled native <select> — accessible by default, zero extra dependencies, and
 * renders correctly inside mobile drawers.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, invalid, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'text-body focus-ring h-11 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          invalid ? 'border-destructive' : 'border-input',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  ),
);
Select.displayName = 'Select';
