import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { FormField } from './form-field';

interface BaseFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export type TextFieldProps = BaseFieldProps & InputProps;

/** Generic labelled text input. RHF-compatible (forwards ref + spreads props). */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, required, wrapperClassName, id, ...inputProps }, ref) => {
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
        <Input id={inputId} ref={ref} invalid={Boolean(error)} {...inputProps} />
      </FormField>
    );
  },
);
TextField.displayName = 'TextField';

/** Email input — correct type, inputMode, and autocomplete. */
export const EmailField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => (
    <TextField
      ref={ref}
      type="email"
      inputMode="email"
      autoComplete="email"
      placeholder="name@organization.com"
      {...props}
    />
  ),
);
EmailField.displayName = 'EmailField';

/** Phone input — mobile numeric keypad + tel autocomplete. */
export const PhoneField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => (
    <TextField
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+91 98765 43210"
      {...props}
    />
  ),
);
PhoneField.displayName = 'PhoneField';

/** Native date input wrapper. */
export const DateField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => <TextField ref={ref} type="date" {...props} />,
);
DateField.displayName = 'DateField';

/** Number input — numeric keypad. */
export const NumberField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => (
    <TextField ref={ref} type="number" inputMode="numeric" {...props} />
  ),
);
NumberField.displayName = 'NumberField';
