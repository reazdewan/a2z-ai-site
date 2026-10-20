-- Run this once in Cloudflare: D1 > your database > Console.
CREATE TABLE IF NOT EXISTS subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  first_name  TEXT,
  last_name   TEXT,
  form        TEXT NOT NULL,              -- newsletter | free-download | early-access
  product     TEXT NOT NULL DEFAULT '',   -- which product they clicked
  country     TEXT,
  page        TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT,
  UNIQUE (email, form, product)
);

CREATE INDEX IF NOT EXISTS idx_subscribers_created ON subscribers (created_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_form ON subscribers (form);
