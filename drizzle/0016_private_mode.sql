-- SQLite/D1: before executing, inspect PRAGMA table_info('athletes').
-- If private_mode already exists with INTEGER NOT NULL DEFAULT 0, skip this migration.
-- SQLite does not support ADD COLUMN IF NOT EXISTS; the migration runner must enforce this guard.
ALTER TABLE athletes ADD COLUMN private_mode integer NOT NULL DEFAULT 0;
