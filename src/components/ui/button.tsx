import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-premium hover:-translate-y-px hover:bg-neutral-800 hover:shadow-premium-hover',
        accent:
          'bg-brand text-brand-foreground shadow-glow hover:-translate-y-px hover:brightness-110',
        secondary:
          'bg-secondary text-secondary-foreground shadow-premium hover:-translate-y-px hover:bg-neutral-700',
        outline:
          'border border-border bg-card text-foreground shadow-sm hover:border-foreground/30 hover:bg-accent',
        ghost: 'bg-transparent text-foreground hover:bg-accent',
        whatsapp:
          'bg-whatsapp text-whatsapp-foreground shadow-sm hover:-translate-y-px hover:brightness-95',
        danger:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-neutral-700',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        sm: 'text-body-sm h-9 px-3.5',
        md: 'text-body-sm h-11 px-5',
        lg: 'text-body h-12 px-6',
        icon: 'h-10 w-10',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element instead of a <button> (e.g. an <a> or <Link>). */
  asChild?: boolean;
  /** Show a spinner and disable the button. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

    // asChild: Slot requires a single child element — never inject a sibling.
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
