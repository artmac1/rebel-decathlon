-- =============================================================================
-- Rebel Decathlon — Initial Schema
-- =============================================================================
-- All client-facing data access goes through Next.js server-side API routes
-- using the service role key, which bypasses RLS by design.
-- The anon role has NO direct read/write access to any of these tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- participants
-- ---------------------------------------------------------------------------
CREATE TABLE public.participants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  text        NOT NULL,
  email       text        NOT NULL UNIQUE,
  gender      text        NOT NULL,
  age         int         NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Fast email lookups (uniqueness constraint already adds a unique index,
-- but an explicit btree index makes existence checks explicit and readable)
CREATE INDEX participants_email_idx ON public.participants (email);

-- ---------------------------------------------------------------------------
-- decathlon_attempts
-- ---------------------------------------------------------------------------
CREATE TABLE public.decathlon_attempts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  uuid        NOT NULL REFERENCES public.participants (id),
  status          text        NOT NULL DEFAULT 'in_progress'
                              CHECK (status IN ('in_progress', 'completed')),
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  age_at_test     int         NOT NULL,
  gender          text        NOT NULL,
  total_points    numeric,
  notes           text
);

-- "Does this participant already have an in-progress attempt?" is the most
-- common lookup; composite index makes it a single index scan.
CREATE INDEX attempts_participant_status_idx
  ON public.decathlon_attempts (participant_id, status);

-- Application-level business rules (not DB constraints):
--   1. A participant should have at most one 'in_progress' attempt at a time.
--      Enforce in the API route that creates a new attempt: query for an
--      existing in_progress row before inserting.
--   2. An attempt flips to 'completed' (with total_points and completed_at)
--      only once event_results has rows for all 10 events.
--      Enforce in the API route that saves an event result: after insert,
--      count event_results for this attempt; if count = 10, update status.

-- ---------------------------------------------------------------------------
-- event_results
-- ---------------------------------------------------------------------------
CREATE TABLE public.event_results (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id    uuid        NOT NULL REFERENCES public.decathlon_attempts (id),
  event_key     text        NOT NULL,
  raw_input     jsonb       NOT NULL,
  points_earned numeric     NOT NULL,
  completed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX event_results_attempt_idx ON public.event_results (attempt_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is enabled on all tables. The anon role receives no policies, so all
-- anon requests are default-denied. The service role (used by Next.js API
-- routes) bypasses RLS entirely — no service-role policies are needed.

ALTER TABLE public.participants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decathlon_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results      ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all policies make intent clear in the Supabase dashboard
-- and prevent accidental anon access if RLS is ever inspected later.
CREATE POLICY "anon_no_access" ON public.participants
  FOR ALL TO anon USING (false);

CREATE POLICY "anon_no_access" ON public.decathlon_attempts
  FOR ALL TO anon USING (false);

CREATE POLICY "anon_no_access" ON public.event_results
  FOR ALL TO anon USING (false);
