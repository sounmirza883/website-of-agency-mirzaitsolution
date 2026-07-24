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

-- Employee (each row now owned by a real employee account; unowned legacy demo rows are purged below)
CREATE TABLE IF NOT EXISTS employee_assigned_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_tasks (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, priority TEXT NOT NULL, due TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_files (id SERIAL PRIMARY KEY, name TEXT NOT NULL, project TEXT NOT NULL, size TEXT NOT NULL, uploaded TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_status_updates (id SERIAL PRIMARY KEY, project TEXT NOT NULL, update_text TEXT NOT NULL, progress INTEGER NOT NULL, date TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_attendance (id SERIAL PRIMARY KEY, date TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS employee_leave_requests (id SERIAL PRIMARY KEY, type TEXT NOT NULL, reason TEXT NOT NULL, from_date TEXT NOT NULL, to_date TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));

ALTER TABLE employee_assigned_projects ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_tasks ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_files ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_status_updates ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS employee_id INTEGER REFERENCES users(id);

-- Purge unowned legacy demo rows (safe to re-run: only ever removes rows with no real owner)
DELETE FROM employee_assigned_projects WHERE employee_id IS NULL;
DELETE FROM employee_tasks WHERE employee_id IS NULL;
DELETE FROM employee_files WHERE employee_id IS NULL;
DELETE FROM employee_status_updates WHERE employee_id IS NULL;
DELETE FROM employee_attendance WHERE employee_id IS NULL;
DELETE FROM employee_leave_requests WHERE employee_id IS NULL;

-- Client (each row now owned by a real client account; unowned legacy demo rows are purged below)
CREATE TABLE IF NOT EXISTS client_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, progress INTEGER NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_milestones (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_files (id SERIAL PRIMARY KEY, name TEXT NOT NULL, project TEXT NOT NULL, size TEXT NOT NULL, uploaded TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_invoices (id TEXT PRIMARY KEY, project TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, due TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_tickets (id TEXT PRIMARY KEY, subject TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, updated TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS client_messages (id SERIAL PRIMARY KEY, sender TEXT NOT NULL, text TEXT NOT NULL, time TEXT NOT NULL, client_id INTEGER REFERENCES users(id));

ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_milestones ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_files ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_tickets ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);
ALTER TABLE client_messages ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES users(id);

-- Purge unowned legacy demo rows (safe to re-run: only ever removes rows with no real owner)
DELETE FROM client_projects WHERE client_id IS NULL;
DELETE FROM client_milestones WHERE client_id IS NULL;
DELETE FROM client_files WHERE client_id IS NULL;
DELETE FROM client_invoices WHERE client_id IS NULL;
DELETE FROM client_tickets WHERE client_id IS NULL;
DELETE FROM client_messages WHERE client_id IS NULL;

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

-- Admin Services
INSERT INTO admin_services (name, price, duration) VALUES
('Graphic Design', '$199', '3-5 days'),
('Video Editing', '$299', '5-7 days'),
('Motion Graphics', '$399', '5-10 days'),
('UI/UX Design', '$499', '7-14 days'),
('WordPress Development', '$599', '7-14 days'),
('Social Media Marketing', '$249', 'Ongoing')
ON CONFLICT DO NOTHING;

-- Admin Projects
INSERT INTO admin_projects (name, client, status, deadline) VALUES
('Brand Identity', 'Bright Tech', 'In Progress', 'Aug 15, 2026'),
('Website Redesign', 'Green Leaf Co', 'Completed', 'Jul 10, 2026'),
('Social Media Campaign', 'Prime Media', 'In Progress', 'Sep 1, 2026'),
('Mobile App UI', 'NextWave', 'Pending', 'Sep 20, 2026'),
('Product Video', 'Bright Tech', 'Completed', 'Jun 25, 2026')
ON CONFLICT DO NOTHING;

-- Admin Invoices
INSERT INTO admin_invoices (id, client, amount, status, date) VALUES
('INV-001', 'Bright Tech', '$1,200', 'Paid', 'Jul 5, 2026'),
('INV-002', 'Green Leaf Co', '$2,500', 'Unpaid', 'Jul 12, 2026'),
('INV-003', 'Urban Studio', '$800', 'Overdue', 'Jun 20, 2026'),
('INV-004', 'Prime Media', '$1,800', 'Paid', 'Jul 18, 2026'),
('INV-005', 'NextWave', '$3,200', 'Unpaid', 'Jul 22, 2026')
ON CONFLICT DO NOTHING;

-- Admin Notifications
INSERT INTO admin_notifications (title, msg, date) VALUES
('New Project Created', 'Bright Tech started a new project.', '2 hours ago'),
('Invoice Paid', 'INV-001 has been paid by Bright Tech.', '5 hours ago'),
('New Client Registered', 'NextWave Inc has registered as a client.', '1 day ago'),
('Project Completed', 'Website Redesign for Green Leaf Co is done.', '2 days ago'),
('Support Ticket Opened', 'Urban Studio opened a new support ticket.', '3 days ago')
ON CONFLICT DO NOTHING;

-- Admin Blog
INSERT INTO admin_blog (title, author, date, status) VALUES
('Top Design Trends in 2026', 'Ali Khan', 'Jul 15, 2026', 'Published'),
('Why Video Content Matters', 'Fatima Ahmed', 'Jul 10, 2026', 'Published'),
('UI/UX Best Practices', 'Hassan Raza', 'Jul 5, 2026', 'Draft'),
('Social Media Growth Tips', 'Ayesha Malik', 'Jun 28, 2026', 'Published'),
('WordPress vs Custom Dev', 'Usman Ali', 'Jun 20, 2026', 'Draft')
ON CONFLICT DO NOTHING;

-- Admin Portfolio
INSERT INTO admin_portfolio (title, client, category) VALUES
('Brand Identity Pack', 'Bright Tech', 'Graphic Design'),
('Website Redesign', 'Green Leaf Co', 'Web Development'),
('Product Launch Video', 'Prime Media', 'Video'),
('Mobile App UI', 'NextWave', 'UI/UX'),
('Social Media Kit', 'Urban Studio', 'Social Media')
ON CONFLICT DO NOTHING;
