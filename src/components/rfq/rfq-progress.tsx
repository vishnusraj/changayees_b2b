import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/** RfqProgress — segmented progress bar + current step label. */
export function RfqProgress({
  step,
  labels,
}: {
  step: number;
  labels: string[];
}) {
  const total = labels.length;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-body-sm flex items-center gap-1.5 font-semibold">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] text-brand-foreground">
            {step}
          </span>
          {labels[step - 1]}
        </p>
        <p className="text-caption text-muted-foreground">
          Step {step} of {total}
        </p>
      </div>
      <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
        {labels.map((label, i) => (
          <div
            key={label}
            className={cn(
              'flex h-1.5 flex-1 items-center justify-center rounded-full transition-colors',
              i < step ? 'bg-brand' : 'bg-muted',
            )}
          >
            {i + 1 < step && (
              <Check className="h-2.5 w-2.5 text-brand-foreground" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
