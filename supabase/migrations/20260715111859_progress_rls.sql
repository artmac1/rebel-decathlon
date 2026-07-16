-- =============================================================================
-- Rebel Decathlon — Progress read policies (Phase 6 magic-link auth)
-- =============================================================================
-- The anon deny-all policies from the initial schema remain in place.
-- We ADD authenticated-role SELECT policies that use the JWT email claim
-- to let a verified user read only their own rows.
--
-- Write paths (INSERT/UPDATE for participants, attempts, event_results) stay
-- locked to the service-role key via Next.js API routes — no authenticated
-- write policies are added here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- participants: authenticated user can read their own row
-- ---------------------------------------------------------------------------
CREATE POLICY "authenticated_own_participant"
  ON public.participants
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));

-- ---------------------------------------------------------------------------
-- decathlon_attempts: authenticated user can read their own attempts
-- ---------------------------------------------------------------------------
CREATE POLICY "authenticated_own_attempts"
  ON public.decathlon_attempts
  FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM public.participants
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

-- ---------------------------------------------------------------------------
-- event_results: authenticated user can read results for their own attempts
-- ---------------------------------------------------------------------------
CREATE POLICY "authenticated_own_event_results"
  ON public.event_results
  FOR SELECT
  TO authenticated
  USING (
    attempt_id IN (
      SELECT da.id
      FROM public.decathlon_attempts da
      JOIN public.participants p ON p.id = da.participant_id
      WHERE p.email = (auth.jwt() ->> 'email')
    )
  );
