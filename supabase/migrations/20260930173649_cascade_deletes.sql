-- Add ON DELETE CASCADE to both foreign keys so that deleting a participant
-- automatically removes their attempts, and deleting an attempt automatically
-- removes its event results.

ALTER TABLE public.decathlon_attempts
  DROP CONSTRAINT decathlon_attempts_participant_id_fkey,
  ADD CONSTRAINT decathlon_attempts_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES public.participants (id)
    ON DELETE CASCADE;

ALTER TABLE public.event_results
  DROP CONSTRAINT event_results_attempt_id_fkey,
  ADD CONSTRAINT event_results_attempt_id_fkey
    FOREIGN KEY (attempt_id) REFERENCES public.decathlon_attempts (id)
    ON DELETE CASCADE;
