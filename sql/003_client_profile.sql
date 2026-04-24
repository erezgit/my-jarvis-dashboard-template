-- 003_client_profile.sql — add typed profile fields to clients
-- Idempotent: uses IF NOT EXISTS. Safe to re-run.

BEGIN;

-- Add `type`, `goal`, `status` columns if not present.
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS type   TEXT NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS goal   TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Backfill `type` from existing notes (seed rows encode category in the notes field).
-- סטודנטיות → student, מתאמנים → individual (default; couples can be flipped manually).
UPDATE clients
SET type = 'student'
WHERE type = 'individual'
  AND notes IS NOT NULL
  AND notes LIKE '%סטודנטיות%';

-- Simple CHECK constraint: one of the four allowed types.
-- Drop-and-recreate pattern so re-runs succeed.
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_type_check;
ALTER TABLE clients
  ADD CONSTRAINT clients_type_check
  CHECK (type IN ('individual', 'couple', 'student', 'lead'));

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients
  ADD CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'paused', 'archived'));

CREATE INDEX IF NOT EXISTS clients_type_idx   ON clients (type);
CREATE INDEX IF NOT EXISTS clients_status_idx ON clients (status);

COMMIT;
