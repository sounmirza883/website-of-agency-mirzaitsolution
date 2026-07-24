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
CREATE TABLE IF NOT EXISTS admin_blog (id SERIAL PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL, category TEXT NOT NULL);
ALTER TABLE admin_blog ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE admin_portfolio ADD COLUMN IF NOT EXISTS description TEXT;

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
    TRUNCATE admin_services, admin_projects, admin_notifications, admin_blog, admin_portfolio RESTART IDENTITY;
    DELETE FROM admin_invoices;
    CREATE TABLE _seed_cleanup_admin_v1 (done_at TIMESTAMPTZ NOT NULL DEFAULT now());
  END IF;
END $$;

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
('Admin', 'admin@zephtrix.com', '$2b$10$Mr475kmRIDt6XsF493/TwuySS16fmGtWgGBaQ9xDs1U5NboD8s6gm', 'admin', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Admin Services/Projects/Invoices/Notifications/Blog/Portfolio are no longer seeded —
-- populated only through the admin CRUD UI from here on (see the one-time cleanup above).
