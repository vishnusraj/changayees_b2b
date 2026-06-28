import { StatusCard } from './status-card';
import { TrackingTimeline } from './tracking-timeline';
import { CustomerNoteCard } from './customer-note-card';
import { TrackingActions } from './tracking-actions';
import type { TrackingView } from '@/features/tracking/tracking.service';

/**
 * TrackingDashboard — the customer-facing order tracking view (mobile-first,
 * app-like): large status card, updates, timeline, and support actions.
 */
export function TrackingDashboard({ view }: { view: TrackingView }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-h3">Order tracking</h1>
        <p className="text-body-sm text-muted-foreground">
          {view.customerName}
          {view.organization ? ` · ${view.organization}` : ''}
        </p>
      </div>

      <StatusCard
        status={view.status}
        orderNumber={view.orderNumber}
        expectedDelivery={view.expectedDelivery}
      />

      {view.notes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-h4">Latest updates</h2>
          <div className="space-y-2">
            {view.notes.map((note, index) => (
              <CustomerNoteCard
                key={index}
                message={note.message}
                date={note.date}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-h4">Timeline</h2>
        <div className="rounded-xl border border-border bg-card p-5 shadow-premium">
          <TrackingTimeline events={view.timeline} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-h4">Need help?</h2>
        <TrackingActions
          email="sales@changayees.com"
          whatsappMessage={`Hi, I have a question about order ${view.orderNumber}.`}
        />
      </section>
    </div>
  );
}
