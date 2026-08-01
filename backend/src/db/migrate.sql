-- ============================================================
-- Zephtrix Studio — Full Schema + Seed Data
-- Run this in Supabase SQL Editor once, then restart backend
-- ============================================================

-- Website
CREATE TABLE IF NOT EXISTS website_services (id SERIAL PRIMARY KEY, title TEXT NOT NULL, icon TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS website_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, slug TEXT NOT NULL, icon TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS website_service_details (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, features TEXT[] NOT NULL, class_name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS website_contact_submissions (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, service TEXT, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Auth (shared login for admin/employee/client portals)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
  status TEXT NOT NULL DEFAULT 'Active',
  dept TEXT,
  position TEXT,
  company TEXT,
  can_create_clients BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin
-- admin_users/admin_employees/admin_clients were legacy demo tables, fully superseded by `users` above.
DROP TABLE IF EXISTS admin_users, admin_employees, admin_clients;
CREATE TABLE IF NOT EXISTS admin_services (id SERIAL PRIMARY KEY, name TEXT NOT NULL, price TEXT NOT NULL, duration TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_invoices (id TEXT PRIMARY KEY, client TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_notifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, msg TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL, category TEXT NOT NULL);
ALTER TABLE admin_portfolio ADD COLUMN IF NOT EXISTS description TEXT;

-- Company bank details, admin-managed, shown to clients on the Invoices page.
-- Singleton table: exactly one row, always id=1.
CREATE TABLE IF NOT EXISTS payment_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  bank_name TEXT,
  account_title TEXT,
  account_number TEXT,
  iban TEXT,
  branch_code TEXT,
  swift_code TEXT,
  instructions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_settings_singleton CHECK (id = 1)
);
-- International payment details, alongside the local fields above.
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS intl_bank_name TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS intl_account_title TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS intl_account_number TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS intl_iban TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS intl_swift_code TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS intl_instructions TEXT;

-- Employee (each row now owned by a real employee account; unowned legacy demo rows are purged below)
CREATE TABLE IF NOT EXISTS employee_assigned_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_tasks (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, priority TEXT NOT NULL, due TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_status_updates (id SERIAL PRIMARY KEY, project TEXT NOT NULL, update_text TEXT NOT NULL, progress INTEGER NOT NULL, date TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_attendance (id SERIAL PRIMARY KEY, date TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_leave_requests (id SERIAL PRIMARY KEY, type TEXT NOT NULL, reason TEXT NOT NULL, from_date TEXT NOT NULL, to_date TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));

ALTER TABLE employee_assigned_projects ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_tasks ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_status_updates ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);

-- Purge unowned legacy demo rows (safe to re-run: only ever removes rows with no real owner)
DELETE FROM employee_assigned_projects WHERE employee_id IS NULL;
DELETE FROM employee_tasks WHERE employee_id IS NULL;
DELETE FROM employee_status_updates WHERE employee_id IS NULL;
DELETE FROM employee_attendance WHERE employee_id IS NULL;
DELETE FROM employee_leave_requests WHERE employee_id IS NULL;

-- Client (each row now owned by a real client account; unowned legacy demo rows are purged below)
CREATE TABLE IF NOT EXISTS client_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, progress INTEGER NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_milestones (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_invoices (id TEXT PRIMARY KEY, project TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, due TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_tickets (id TEXT PRIMARY KEY, subject TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, updated TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_messages (id SERIAL PRIMARY KEY, sender TEXT NOT NULL, text TEXT NOT NULL, time TEXT NOT NULL, client_id INTEGER REFERENCES users(id));

ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_milestones ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_tickets ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_tickets ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE client_messages ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);

-- Purge unowned legacy demo rows (safe to re-run: only ever removes rows with no real owner)
DELETE FROM client_projects WHERE client_id IS NULL;
DELETE FROM client_milestones WHERE client_id IS NULL;
DELETE FROM client_invoices WHERE client_id IS NULL;
DELETE FROM client_tickets WHERE client_id IS NULL;
DELETE FROM client_messages WHERE client_id IS NULL;

-- Unify employee_files/client_files into one shared table (both are guaranteed empty:
-- no create endpoint has ever existed for either, and Phase 1 already purged unowned rows).
DROP TABLE IF EXISTS employee_files, client_files;
CREATE TABLE IF NOT EXISTS project_files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  project TEXT NOT NULL,
  size TEXT NOT NULL,
  path TEXT NOT NULL,
  uploaded TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  uploaded_by INTEGER REFERENCES users(id),
  client_id INTEGER REFERENCES users(id)
);

-- One-time cleanup of duplicated demo rows in the 6 admin tables below (guaranteed
-- leftover — no create endpoint existed for any of them until now, and their old
-- ON CONFLICT DO NOTHING seed inserts had no real unique constraint to check against,
-- so every prior re-run of this script silently duplicated them). Gated behind a
-- sentinel so this fires exactly once ever and is safe to leave in permanently.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_seed_cleanup_admin_v1') THEN
    TRUNCATE admin_services, admin_projects, admin_notifications, admin_portfolio RESTART IDENTITY;
    DELETE FROM admin_invoices;
    CREATE TABLE _seed_cleanup_admin_v1 (done_at TIMESTAMPTZ NOT NULL DEFAULT now());
  END IF;
END $$;

-- ============================================================
-- Phase 3: project assignment, employee<->client chat, user edit/delete,
-- invoice verification, targeted notifications, leave approval
-- ============================================================

-- Unify projects: admin_projects becomes the single source of truth.
-- employee_assigned_projects / client_projects were dead-end duplicates —
-- each only ever had a GET route, nothing anywhere ever wrote to them.
ALTER TABLE admin_projects ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE admin_projects ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE admin_projects ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0;
DROP TABLE IF EXISTS employee_assigned_projects, client_projects;

-- Chat, scoped to a project. client_messages only ever held client->nowhere
-- messages (sender was always hardcoded "client"); repurposed as a real
-- project-scoped thread any of admin/employee/client can read/write.
--
-- Guarded so the script stays re-runnable: the CREATE IF NOT EXISTS earlier in
-- this file resurrects an empty client_messages on every subsequent run (the
-- original having been renamed away), and a bare RENAME would then fail with
-- "relation project_messages already exists".
DO $$
BEGIN
  IF to_regclass('public.project_messages') IS NULL THEN
    ALTER TABLE IF EXISTS client_messages RENAME TO project_messages;
  ELSE
    DROP TABLE IF EXISTS client_messages;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS project_messages (id SERIAL PRIMARY KEY, text TEXT NOT NULL, time TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES admin_projects(id);
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS sender_id INTEGER REFERENCES users(id);
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS sender_role TEXT NOT NULL DEFAULT 'client';
ALTER TABLE project_messages DROP COLUMN IF EXISTS sender;

-- Invoice payment verification (client uploads proof, admin verifies).
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS proof_path TEXT;
ALTER TABLE admin_invoices ADD COLUMN IF NOT EXISTS proof_path TEXT;

-- Notifications gain a target audience; no longer admin-only.
-- Same re-runnability guard as project_messages above.
DO $$
BEGIN
  IF to_regclass('public.notifications') IS NULL THEN
    ALTER TABLE IF EXISTS admin_notifications RENAME TO notifications;
  ELSE
    DROP TABLE IF EXISTS admin_notifications;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, msg TEXT NOT NULL, date TEXT NOT NULL);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS creator_role TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_role TEXT NOT NULL DEFAULT 'all';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_user_id INTEGER REFERENCES users(id);

-- FK safety net so deleting a user never hard-fails on historical rows —
-- it orphans (nulls) them instead. Auto-generated constraint names follow
-- Postgres's default <table>_<column>_fkey convention. project_messages'
-- client_id constraint predates its table rename, so both possible names
-- are handled.
ALTER TABLE admin_projects DROP CONSTRAINT IF EXISTS admin_projects_employee_id_fkey,
  ADD CONSTRAINT admin_projects_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE admin_projects DROP CONSTRAINT IF EXISTS admin_projects_client_id_fkey,
  ADD CONSTRAINT admin_projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_tasks DROP CONSTRAINT IF EXISTS employee_tasks_employee_id_fkey,
  ADD CONSTRAINT employee_tasks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_status_updates DROP CONSTRAINT IF EXISTS employee_status_updates_employee_id_fkey,
  ADD CONSTRAINT employee_status_updates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_attendance DROP CONSTRAINT IF EXISTS employee_attendance_employee_id_fkey,
  ADD CONSTRAINT employee_attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_leave_requests DROP CONSTRAINT IF EXISTS employee_leave_requests_employee_id_fkey,
  ADD CONSTRAINT employee_leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE client_milestones DROP CONSTRAINT IF EXISTS client_milestones_client_id_fkey,
  ADD CONSTRAINT client_milestones_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE client_invoices DROP CONSTRAINT IF EXISTS client_invoices_client_id_fkey,
  ADD CONSTRAINT client_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE client_tickets DROP CONSTRAINT IF EXISTS client_tickets_client_id_fkey,
  ADD CONSTRAINT client_tickets_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE project_messages DROP CONSTRAINT IF EXISTS client_messages_client_id_fkey,
  DROP CONSTRAINT IF EXISTS project_messages_client_id_fkey,
  ADD CONSTRAINT project_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE project_messages DROP CONSTRAINT IF EXISTS project_messages_sender_id_fkey,
  ADD CONSTRAINT project_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE project_messages DROP CONSTRAINT IF EXISTS project_messages_project_id_fkey,
  ADD CONSTRAINT project_messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES admin_projects(id) ON DELETE SET NULL;
ALTER TABLE project_files DROP CONSTRAINT IF EXISTS project_files_uploaded_by_fkey,
  ADD CONSTRAINT project_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE project_files DROP CONSTRAINT IF EXISTS project_files_client_id_fkey,
  ADD CONSTRAINT project_files_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_created_by_fkey,
  ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
-- notifications was renamed from admin_notifications above, so its constraints may
-- still carry either name.
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS admin_notifications_created_by_fkey,
  DROP CONSTRAINT IF EXISTS notifications_created_by_fkey,
  ADD CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS admin_notifications_target_user_id_fkey,
  DROP CONSTRAINT IF EXISTS notifications_target_user_id_fkey,
  ADD CONSTRAINT notifications_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- Phase 4: direct + channel chat (admin <-> employee)
-- ============================================================

-- A conversation is either a 1-on-1 DM (exactly two members, name NULL) or a
-- named channel (any number of members).
--
-- Deliberately NOT built on project_messages: that table's project_id is
-- load-bearing for every one of its authorization checks, and its `time` column
-- is a display string ("3:04 PM") rather than a real timestamp, which unread
-- cursors need.
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'dm' CHECK (kind IN ('dm', 'channel')),
  name TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membership doubles as the per-user read cursor: unread count is the number of
-- messages with a higher id than last_read_message_id that the member didn't
-- send themselves.
--
-- The cursor is a message id, deliberately NOT a timestamp. Message timestamps
-- come from Postgres's clock while the app server writes its own — those clocks
-- drift (measured ~2s apart against this Supabase instance), so a timestamp
-- cursor leaves anything read shortly after it arrived stuck as unread forever.
-- Ids are database-generated and monotonic, so no clock is involved.
--
-- Note user_id is part of the primary key, so unlike every content table above
-- it can NOT be nulled on user deletion — these rows are deleted instead
-- (handled explicitly in authStore.ts, which otherwise nulls user references).
CREATE TABLE IF NOT EXISTS chat_members (
  conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_message_id INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);
-- Re-runnable upgrade for databases created before the cursor changed.
ALTER TABLE chat_members ADD COLUMN IF NOT EXISTS last_read_message_id INTEGER NOT NULL DEFAULT 0;
ALTER TABLE chat_members DROP COLUMN IF EXISTS last_read_at;

-- mentions holds the user ids @mentioned in the message. Stored as ids rather
-- than parsed back out of the text at read time, so a rename or a display name
-- that happens to contain an @ can't change who was mentioned after the fact.
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  attachment_path TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  mentions INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Re-runnable upgrade for databases created before mentions existed.
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS mentions INTEGER[] NOT NULL DEFAULT '{}';
-- Edits and deletes. Deletion is soft: the row stays so replies and paging
-- keyed on id don't develop holes, and the client renders a tombstone.
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- Quote-reply. SET NULL rather than CASCADE: deleting a quoted message must not
-- take the replies to it with it.
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reply_to_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL;

-- One row per person per emoji per message; the composite key is what makes a
-- repeat reaction a no-op rather than a duplicate.
CREATE TABLE IF NOT EXISTS chat_reactions (
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS chat_reactions_message_idx ON chat_reactions (message_id);

-- A thread is always read for one conversation at a time, oldest-first by id;
-- the sidebar reads every conversation a single user belongs to.
CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON chat_messages (conversation_id, id);
CREATE INDEX IF NOT EXISTS chat_members_user_idx ON chat_members (user_id);

-- Sidebar summary for one user, computed in the database.
--
-- Replaces reading every message of every conversation the user belongs to and
-- counting them in the API process: that transferred full message text purely
-- to produce a number, on every sidebar load, every poll, and every realtime
-- nudge. Unread count, mention flag and the last-message preview all have to
-- come back together, because the mention flag is only meaningful for messages
-- that are also unread.
-- Output columns are deliberately NOT named conversation_id / mentions / text:
-- RETURNS TABLE names behave as output parameters, and reusing a real column
-- name there is a classic source of "column reference is ambiguous" errors.
CREATE OR REPLACE FUNCTION chat_conversation_summary(p_user_id INTEGER)
RETURNS TABLE (
  conv_id INTEGER,
  unread BIGINT,
  mentioned BOOLEAN,
  newest_id INTEGER,
  preview_text TEXT,
  preview_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    m.conversation_id,
    COALESCE(COUNT(msg.id) FILTER (
      WHERE msg.id > m.last_read_message_id AND msg.sender_id IS DISTINCT FROM p_user_id
    ), 0),
    COALESCE(BOOL_OR(
      msg.id > m.last_read_message_id
      AND msg.sender_id IS DISTINCT FROM p_user_id
      AND p_user_id = ANY(msg.mentions)
    ), FALSE),
    MAX(msg.id),
    -- Preview text of the newest message, picked without a second query.
    (ARRAY_AGG(COALESCE(msg.text, msg.attachment_name) ORDER BY msg.id DESC))[1],
    MAX(msg.created_at)
  FROM chat_members m
  -- Deleted messages are excluded from the join entirely, so they can't leave
  -- an unread badge behind or sit in the sidebar as the last preview.
  LEFT JOIN chat_messages msg
    ON msg.conversation_id = m.conversation_id AND msg.deleted_at IS NULL
  WHERE m.user_id = p_user_id
  GROUP BY m.conversation_id;
$$;

-- ============================================================
-- Seed Data
-- ============================================================

-- Website Services
INSERT INTO website_services (title, icon, description) VALUES
('Graphic Design', 'fa-paint-brush', 'Creative posters, branding, social media posts, thumbnails, banners, and marketing designs.'),
('Video Editing', 'fa-video', 'Professional video editing for YouTube, reels, ads, documentaries, and social media content.'),
('Motion Graphics', 'fa-film', 'Animated visuals, logo animations, intro/outro videos, explainer animations, and motion designs.'),
('UI/UX Design', 'fa-mobile-alt', 'Clean, user-friendly, modern app and website interfaces focused on better user experience.'),
('WordPress Development', 'fa-wordpress', 'Fast, responsive, SEO-friendly WordPress websites for businesses and online brands.'),
('Social Media Marketing', 'fa-chart-line', 'Content strategy, ad creatives, campaign planning, and brand growth through social platforms.'),
('App Development', 'fa-mobile-alt', 'Native and cross-platform mobile and desktop apps for Android, iOS, and more.'),
('Website Development', 'fa-code', 'Custom high-performance websites, e-commerce stores, and web applications.'),
('Shopify Design', 'fa-shopify', 'Custom Shopify stores with optimized product pages and seamless checkout experiences.'),
('AI Automation', 'fa-robot', 'Workflow automation, AI chatbots, content generation, and custom AI solutions.'),
('SaaS Design', 'fa-cloud', 'SaaS websites, dashboards, and product interfaces built for conversion and scale.'),
('Web Hosting', 'fa-server', 'Reliable, secure, high-performance hosting with 24/7 monitoring and support.')
ON CONFLICT DO NOTHING;

-- Bootstrap admin login (password: ChangeMe123! — change after first login)
INSERT INTO users (name, email, password_hash, role, status) VALUES
('Admin', 'admin@mirzaitsolution.com', '$2b$10$Mr475kmRIDt6XsF493/TwuySS16fmGtWgGBaQ9xDs1U5NboD8s6gm', 'admin', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Admin Services/Projects/Invoices/Notifications/Portfolio are no longer seeded —
-- populated only through the admin CRUD UI from here on (see the one-time cleanup above).
