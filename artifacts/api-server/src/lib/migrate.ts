/**
 * Auto-migration: creates all tables in the production database if they don't exist.
 * Called at startup — idempotent, safe to run multiple times.
 */
import { pool } from "@workspace/db";

const DDL = `
CREATE TABLE IF NOT EXISTS registrations (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  city             TEXT NOT NULL,
  profession       TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pendente',
  email_confirmed  BOOLEAN NOT NULL DEFAULT FALSE,
  email_confirmed_at TIMESTAMP,
  event_presence   BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_released BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confirmation_tokens (
  id               SERIAL PRIMARY KEY,
  registration_id  INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  token            TEXT NOT NULL UNIQUE,
  expires_at       TIMESTAMP NOT NULL,
  used_at          TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS minicourses (
  id                    SERIAL PRIMARY KEY,
  title                 TEXT NOT NULL,
  instructor            TEXT NOT NULL,
  description           TEXT NOT NULL,
  duration              TEXT NOT NULL,
  max_capacity          INTEGER NOT NULL DEFAULT 30,
  type                  TEXT NOT NULL DEFAULT 'pratico',
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  date                  TEXT NOT NULL DEFAULT '',
  "time"                TEXT NOT NULL DEFAULT '',
  location              TEXT NOT NULL DEFAULT '',
  workload              TEXT NOT NULL DEFAULT '4 horas',
  generates_certificate BOOLEAN NOT NULL DEFAULT TRUE,
  enrollments_closed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id                   SERIAL PRIMARY KEY,
  registration_id      INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  minicourse_id        INTEGER NOT NULL REFERENCES minicourses(id) ON DELETE CASCADE,
  minicourse_presence  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(registration_id, minicourse_id)
);

CREATE TABLE IF NOT EXISTS speakers (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  title         TEXT NOT NULL DEFAULT '',
  institution   TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  talk_topic    TEXT NOT NULL DEFAULT '',
  talk_date     TEXT NOT NULL DEFAULT '',
  talk_time     TEXT NOT NULL DEFAULT '',
  linkedin_url  TEXT,
  photo_url     TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL DEFAULT '',
  caption       TEXT NOT NULL DEFAULT '',
  alt_text      TEXT NOT NULL DEFAULT '',
  image_url     TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'geral',
  display_order INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_content (
  id         SERIAL PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  logo_url      TEXT NOT NULL DEFAULT '',
  website_url   TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'apoio',
  display_order INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id              SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES registrations(id),
  minicourse_id   INTEGER REFERENCES minicourses(id),
  type            TEXT NOT NULL,
  validation_code TEXT NOT NULL UNIQUE,
  workload        TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'ativo',
  issued_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  cancelled_at    TIMESTAMP
);
`;

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(DDL);
    console.log("[migrate] Schema OK");
  } catch (err) {
    console.error("[migrate] Error:", err);
    throw err;
  } finally {
    client.release();
  }
}
