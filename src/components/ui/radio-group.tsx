import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn('flex flex-col gap-2', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className="text-body-sm inline-flex cursor-pointer items-center gap-2 text-foreground"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={defaultValue === option.value}
            checked={value !== undefined ? value === option.value : undefined}
            onChange={(event) => onChange?.(event.target.value)}
            className="focus-ring h-4 w-4 border-input text-primary accent-[hsl(var(--primary))]"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
