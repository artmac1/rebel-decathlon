-- Allow ON CONFLICT upserts when a participant re-submits an event.
-- Without this constraint the events API route cannot use onConflict resolution.
ALTER TABLE public.event_results
  ADD CONSTRAINT event_results_attempt_event_unique
  UNIQUE (attempt_id, event_key);
