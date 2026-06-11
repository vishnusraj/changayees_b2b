import * as React from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'flex gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        info: 'border-info/20 bg-info/5 text-foreground',
        success: 'border-success/20 bg-success/5 text-foreground',
        warning: 'border-warning/30 bg-warning/5 text-foreground',
        danger: 'border-danger/20 bg-danger/5 text-foreground',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const iconMap: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const iconColor: Record<string, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

/** Alert — inline contextual message. */
export function Alert({
  className,
  variant = 'info',
  title,
  children,
  ...props
}: AlertProps) {
  const key = variant ?? 'info';
  const Icon = iconMap[key] ?? Info;
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor[key])} aria-hidden />
      <div className="space-y-1">
        {title && <p className="text-body-sm font-semibold">{title}</p>}
        {children && (
          <div className="text-body-sm text-muted-foreground">{children}</div>
        )}
      </div>
    </div>
  );
}
