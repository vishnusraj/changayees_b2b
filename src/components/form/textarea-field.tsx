import * as React from 'react';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';
import { FormField } from './form-field';

export type TextareaFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
} & TextareaProps;

export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(({ label, hint, error, required, wrapperClassName, id, ...props }, ref) => {
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
      <Textarea id={inputId} ref={ref} invalid={Boolean(error)} {...props} />
    </FormField>
  );
});
TextareaField.displayName = 'TextareaField';
