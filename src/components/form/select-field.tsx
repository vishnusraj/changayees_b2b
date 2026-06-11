import * as React from 'react';
import { Select, type SelectProps } from '@/components/ui/select';
import { FormField } from './form-field';

export type SelectFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
} & SelectProps;

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, hint, error, required, wrapperClassName, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        required={required}
        htmlFor={inputId}
        className={wrapperClassName}
      >
        <Select id={inputId} ref={ref} invalid={Boolean(error)} {...props} />
      </FormField>
    );
  },
);
SelectField.displayName = 'SelectField';
