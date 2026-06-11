'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField } from './form-field';
import type { SelectOption } from '@/components/ui/select';

export interface MultiSelectProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

/** MultiSelect — checkbox dropdown for selecting multiple options. */
export function MultiSelect({
  label,
  hint,
  error,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = (val: string) =>
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );

  const summary =
    value.length === 0
      ? placeholder
      : `${value.length} selected`;

  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'text-body focus-ring flex h-11 w-full items-center justify-between rounded-lg border bg-background px-3 text-left',
            error ? 'border-destructive' : 'border-input',
            value.length === 0 && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-multiselectable
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-elevation-3"
          >
            {options.map((option) => {
              const selected = value.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(option.value)}
                    className="text-body-sm flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input',
                      )}
                    >
                      {selected && <Check className="h-3 w-3" aria-hidden />}
                    </span>
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FormField>
  );
}
