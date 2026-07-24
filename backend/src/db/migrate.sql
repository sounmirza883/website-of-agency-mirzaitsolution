-- ============================================================
-- Zephtrix Studio — Full Schema + Seed Data
-- Run this in Supabase SQL Editor once, then restart backend
-- ============================================================

-- Website
CREATE TABLE IF NOT EXISTS website_services (id SERIAL PRIMARY KEY, title TEXT NOT NULL, icon TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS website_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, slug TEXT NOT NULL, icon TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS website_service_details (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, features TEXT[] NOT NULL, class_name TEXT NOT NULL);

-- Admin
CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_employees (id SERIAL PRIMARY KEY, name TEXT NOT NULL, dept TEXT NOT NULL, position TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_clients (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_services (id SERIAL PRIMARY KEY, name TEXT NOT NULL, price TEXT NOT NULL, duration TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, client TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_invoices (id TEXT PRIMARY KEY, client TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_notifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, msg TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_blog (id SERIAL PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_portfolio (id SERIAL PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL, category TEXT NOT NULL);

-- Employee
CREATE TABLE IF NOT EXISTS employee_assigned_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS employee_tasks (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, priority TEXT NOT NULL, due TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS employee_files (id SERIAL PRIMARY KEY, name TEXT NOT NULL, project TEXT NOT NULL, size TEXT NOT NULL, uploaded TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS employee_status_updates (id SERIAL PRIMARY KEY, project TEXT NOT NULL, update_text TEXT NOT NULL, progress INTEGER NOT NULL, date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS employee_attendance (id SERIAL PRIMARY KEY, date TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS employee_leave_requests (id SERIAL PRIMARY KEY, type TEXT NOT NULL, reason TEXT NOT NULL, from_date TEXT NOT NULL, to_date TEXT NOT NULL, status TEXT NOT NULL);

-- Client
CREATE TABLE IF NOT EXISTS client_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, deadline TEXT NOT NULL, progress INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS client_milestones (id SERIAL PRIMARY KEY, project TEXT NOT NULL, task TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS client_files (id SERIAL PRIMARY KEY, name TEXT NOT NULL, project TEXT NOT NULL, size TEXT NOT NULL, uploaded TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS client_invoices (id TEXT PRIMARY KEY, project TEXT NOT NULL, amount TEXT NOT NULL, status TEXT NOT NULL, due TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS client_tickets (id TEXT PRIMARY KEY, subject TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS client_messages (id SERIAL PRIMARY KEY, sender TEXT NOT NULL, text TEXT NOT NULL, time TEXT NOT NULL);

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

-- Admin Users
INSERT INTO admin_users (name, email, role, status) VALUES
('John Doe', 'john@example.com', 'Admin', 'Active'),
('Jane Smith', 'jane@example.com', 'Editor', 'Active'),
('Mike Johnson', 'mike@example.com', 'Viewer', 'Active'),
('Sarah Lee', 'sarah@example.com', 'Editor', 'Inactive'),
('Tom Brown', 'tom@example.com', 'Viewer', 'Active')
ON CONFLICT DO NOTHING;

-- Admin Employees
INSERT INTO admin_employees (name, dept, position, status) VALUES
('Ali Khan', 'Design', 'Graphic Designer', 'Active'),
('Fatima Ahmed', 'Video', 'Video Editor', 'Active'),
('Usman Ali', 'Development', 'Web Developer', 'Active'),
('Ayesha Malik', 'Marketing', 'Social Media Manager', 'Inactive'),
('Hassan Raza', 'Design', 'UI/UX Designer', 'Active')
ON CONFLICT DO NOTHING;

-- Admin Clients
INSERT INTO admin_clients (name, email, company, status) VALUES
('Bright Tech', 'info@brighttech.com', 'Bright Tech Ltd', 'Active'),
('Green Leaf Co', 'hello@greenleaf.com', 'Green Leaf Co', 'Active'),
('Urban Studio', 'contact@urbanstudio.com', 'Urban Studio', 'Inactive'),
('Prime Media', 'info@primemedia.com', 'Prime Media Group', 'Active'),
('NextWave', 'hello@nextwave.io', 'NextWave Inc', 'Active')
ON CONFLICT DO NOTHING;

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

-- Employee Assigned Projects
INSERT INTO employee_assigned_projects (name, role, status, deadline) VALUES
('Brand Identity – Bright Tech', 'Graphic Designer', 'In Progress', 'Aug 15, 2026'),
('Social Media Kit – Green Leaf', 'Graphic Designer', 'Completed', 'Jul 20, 2026'),
('Product Video – Prime Media', 'Video Editor', 'In Progress', 'Sep 1, 2026'),
('Website UI – NextWave', 'UI/UX Designer', 'Pending', 'Sep 20, 2026')
ON CONFLICT DO NOTHING;

-- Employee Tasks
INSERT INTO employee_tasks (project, task, priority, due, status) VALUES
('Brand Identity', 'Design Logo Variations', 'High', 'Jul 28, 2026', 'In Progress'),
('Brand Identity', 'Create Mood Board', 'Medium', 'Jul 25, 2026', 'Done'),
('Product Video', 'Edit Raw Footage', 'High', 'Aug 5, 2026', 'Pending'),
('Product Video', 'Add Motion Graphics', 'Medium', 'Aug 10, 2026', 'Pending'),
('Social Media Kit', 'Finalize Templates', 'Low', 'Jul 22, 2026', 'Done')
ON CONFLICT DO NOTHING;

-- Employee Files
INSERT INTO employee_files (name, project, size, uploaded, status) VALUES
('Logo_V1.ai', 'Brand Identity', '4.2 MB', 'Jul 20, 2026', 'Approved'),
('Logo_V2.ai', 'Brand Identity', '4.5 MB', 'Jul 21, 2026', 'Pending Review'),
('Mood_Board.pdf', 'Brand Identity', '1.8 MB', 'Jul 22, 2026', 'Approved'),
('Video_Rough_Cut.mp4', 'Product Video', '120 MB', 'Jul 23, 2026', 'Pending Review'),
('Thumbnail_Design.psd', 'Social Media Kit', '8.3 MB', 'Jul 18, 2026', 'Approved')
ON CONFLICT DO NOTHING;

-- Employee Status Updates
INSERT INTO employee_status_updates (project, update_text, progress, date) VALUES
('Brand Identity', 'Completed logo variations and color palette', 65, 'Jul 22, 2026'),
('Product Video', 'Finished filming, starting rough cut editing', 35, 'Jul 23, 2026'),
('Social Media Kit', 'All templates delivered to client', 100, 'Jul 20, 2026')
ON CONFLICT DO NOTHING;

-- Employee Attendance
INSERT INTO employee_attendance (date, check_in, check_out, status) VALUES
('Jul 17, 2026', '9:00 AM', '5:30 PM', 'Present'),
('Jul 18, 2026', '8:45 AM', '5:15 PM', 'Present'),
('Jul 19, 2026', '—', '—', 'Weekend'),
('Jul 20, 2026', '9:15 AM', '5:00 PM', 'Present'),
('Jul 21, 2026', '—', '—', 'Absent'),
('Jul 22, 2026', '8:55 AM', '5:30 PM', 'Present'),
('Jul 23, 2026', '9:05 AM', '—', 'Present')
ON CONFLICT DO NOTHING;

-- Employee Leave Requests
INSERT INTO employee_leave_requests (type, reason, from_date, to_date, status) VALUES
('Sick Leave', 'Not feeling well', 'Aug 5, 2026', 'Aug 6, 2026', 'Approved'),
('Personal Leave', 'Family event', 'Aug 12, 2026', 'Aug 12, 2026', 'Pending'),
('Annual Leave', 'Vacation', 'Sep 10, 2026', 'Sep 15, 2026', 'Pending'),
('Sick Leave', 'Doctor appointment', 'Jul 28, 2026', 'Jul 28, 2026', 'Approved')
ON CONFLICT DO NOTHING;

-- Client Projects
INSERT INTO client_projects (name, status, deadline, progress) VALUES
('Brand Identity Design', 'In Progress', 'Aug 15, 2026', 65),
('Social Media Kit', 'Completed', 'Jul 20, 2026', 100),
('Product Video', 'In Progress', 'Sep 1, 2026', 35),
('Website Banner Set', 'Pending', 'Sep 10, 2026', 0)
ON CONFLICT DO NOTHING;

-- Client Milestones
INSERT INTO client_milestones (project, task, status, date) VALUES
('Brand Identity Design', 'Logo Concepts', 'Done', 'Jul 10, 2026'),
('Brand Identity Design', 'Color Palette', 'Done', 'Jul 15, 2026'),
('Brand Identity Design', 'Typography Selection', 'In Review', 'Jul 20, 2026'),
('Brand Identity Design', 'Final Asset Delivery', 'Pending', 'Aug 15, 2026'),
('Product Video', 'Script Writing', 'Done', 'Jul 18, 2026'),
('Product Video', 'Footage Recording', 'In Progress', 'Jul 25, 2026'),
('Product Video', 'Editing & Post-production', 'Pending', 'Aug 15, 2026')
ON CONFLICT DO NOTHING;

-- Client Files
INSERT INTO client_files (name, project, size, uploaded) VALUES
('Logo_Concept_1.png', 'Brand Identity', '2.4 MB', 'Jul 12, 2026'),
('Color_Palette.pdf', 'Brand Identity', '0.8 MB', 'Jul 14, 2026'),
('Social_Media_Template.psd', 'Social Media Kit', '15 MB', 'Jul 18, 2026'),
('Video_Script.docx', 'Product Video', '0.3 MB', 'Jul 19, 2026'),
('Banner_Mockup.png', 'Website Banners', '3.1 MB', 'Jul 22, 2026')
ON CONFLICT DO NOTHING;

-- Client Invoices
INSERT INTO client_invoices (id, project, amount, status, due) VALUES
('INV-001', 'Brand Identity Design', '$1,200', 'Paid', 'Jul 25, 2026'),
('INV-002', 'Social Media Kit', '$800', 'Paid', 'Jul 30, 2026'),
('INV-003', 'Product Video', '$1,500', 'Unpaid', 'Aug 20, 2026'),
('INV-004', 'Website Banner Set', '$400', 'Unpaid', 'Sep 15, 2026')
ON CONFLICT DO NOTHING;

-- Client Tickets
INSERT INTO client_tickets (id, subject, status, priority, updated) VALUES
('TK-001', 'Revision Request', 'Open', 'Medium', '2 hours ago'),
('TK-002', 'File Format Question', 'Closed', 'Low', '1 day ago'),
('TK-003', 'Deadline Extension Request', 'Open', 'High', '3 hours ago'),
('TK-004', 'New Project Inquiry', 'Open', 'Low', '5 hours ago')
ON CONFLICT DO NOTHING;

-- Client Messages
INSERT INTO client_messages (sender, text, time) VALUES
('client', 'Hi! I had a question about the logo concepts.', '10:15 AM'),
('team', 'Sure, feel free to ask! Which concept are you referring to?', '10:16 AM'),
('client', 'Concept B — could we see it with a different color palette?', '10:18 AM'),
('team', 'Absolutely! I will update the mockups and share them with you shortly.', '10:20 AM'),
('team', 'Here are some alternative color versions for Concept B.', '10:35 AM')
ON CONFLICT DO NOTHING;
