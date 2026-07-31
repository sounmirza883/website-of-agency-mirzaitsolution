-- Website
CREATE TABLE website_services (id SERIAL PRIMARY KEY, title TEXT NOT NULL, icon TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE website_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, slug TEXT NOT NULL, icon TEXT NOT NULL);
CREATE TABLE website_service_details (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, features TEXT[] NOT NULL, class_name TEXT NOT NULL);
CREATE TABLE website_contact_submissions (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, service TEXT, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Auth (shared login for admin/employee/client portals)
CREATE TABLE users (
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
CREATE TABLE admin_services (id SERIAL PRIMARY KEY, name TEXT NOT NULL, price TEXT NOT NULL, duration TEXT NOT NULL);
CREATE TABLE admin_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL, client_id INTEGER REFERENCES users(id) ON DELETE SET NULL, employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0);
CREATE TABLE admin_invoices (id TEXT PRIMARY KEY, client TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL, proof_path TEXT);
CREATE TABLE notifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, msg TEXT NOT NULL, date TEXT NOT NULL, created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, creator_role TEXT NOT NULL DEFAULT 'admin', target_role TEXT NOT NULL DEFAULT 'all', target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE admin_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL, category TEXT NOT NULL, description TEXT);

-- Employee
CREATE TABLE employee_tasks (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, priority TEXT NOT NULL, due TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE employee_status_updates (id SERIAL PRIMARY KEY, project TEXT NOT NULL, update_text TEXT NOT NULL, progress INTEGER NOT NULL, date TEXT NOT NULL, employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE employee_attendance (id SERIAL PRIMARY KEY, date TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE employee_leave_requests (id SERIAL PRIMARY KEY, type TEXT NOT NULL, reason TEXT NOT NULL, from_date TEXT NOT NULL, to_date TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id) ON DELETE SET NULL);

-- Client (admin_projects.client_id is the source of truth for "my projects" now)
CREATE TABLE client_milestones (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL, client_id INTEGER REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE client_invoices (id TEXT PRIMARY KEY, project TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, due TEXT NOT NULL, client_id INTEGER REFERENCES users(id) ON DELETE SET NULL, proof_path TEXT);
CREATE TABLE client_tickets (id TEXT PRIMARY KEY, subject TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, updated TEXT NOT NULL, client_id INTEGER REFERENCES users(id) ON DELETE SET NULL, description TEXT NOT NULL DEFAULT '');

-- Chat, scoped to a project (admin can read/send on any; employee/client only on their own)
CREATE TABLE project_messages (id SERIAL PRIMARY KEY, project_id INTEGER REFERENCES admin_projects(id) ON DELETE SET NULL, sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL, sender_role TEXT NOT NULL DEFAULT 'client', text TEXT NOT NULL, time TEXT NOT NULL, client_id INTEGER REFERENCES users(id) ON DELETE SET NULL);

-- Shared file storage (employee uploads, optionally visible to a client)
CREATE TABLE project_files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  project TEXT NOT NULL,
  size TEXT NOT NULL,
  path TEXT NOT NULL,
  uploaded TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
