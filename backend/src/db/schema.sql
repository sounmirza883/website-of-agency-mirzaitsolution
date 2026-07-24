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
CREATE TABLE admin_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL);
CREATE TABLE admin_invoices (id TEXT PRIMARY KEY, client TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE admin_notifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, msg TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE admin_blog (id SERIAL PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, content TEXT NOT NULL DEFAULT '');
CREATE TABLE admin_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL, category TEXT NOT NULL, description TEXT);

-- Employee
CREATE TABLE employee_assigned_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE employee_tasks (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, priority TEXT NOT NULL, due TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE employee_status_updates (id SERIAL PRIMARY KEY, project TEXT NOT NULL, update_text TEXT NOT NULL, progress INTEGER NOT NULL, date TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE employee_attendance (id SERIAL PRIMARY KEY, date TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));
CREATE TABLE employee_leave_requests (id SERIAL PRIMARY KEY, type TEXT NOT NULL, reason TEXT NOT NULL, from_date TEXT NOT NULL, to_date TEXT NOT NULL, status TEXT NOT NULL, employee_id INTEGER REFERENCES users(id));

-- Client
CREATE TABLE client_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, progress INTEGER NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE client_milestones (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE client_invoices (id TEXT PRIMARY KEY, project TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, due TEXT NOT NULL, client_id INTEGER REFERENCES users(id));
CREATE TABLE client_tickets (id TEXT PRIMARY KEY, subject TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, updated TEXT NOT NULL, client_id INTEGER REFERENCES users(id), description TEXT NOT NULL DEFAULT '');
CREATE TABLE client_messages (id SERIAL PRIMARY KEY, sender TEXT NOT NULL, text TEXT NOT NULL, time TEXT NOT NULL, client_id INTEGER REFERENCES users(id));

-- Shared file storage (employee uploads, optionally visible to a client)
CREATE TABLE project_files (
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
