-- Composite index for the analytics report queries
-- (filter by event_name + created_at range, e.g. top products / per-event counts).
CREATE INDEX "analytics_events_event_name_created_at_idx"
  ON "analytics_events"("event_name", "created_at");
