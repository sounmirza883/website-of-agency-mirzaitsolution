-- ============================================================
-- Contact form: estimated budget + currency
-- Run this in the Supabase SQL Editor.
--
-- Standalone extract of the two statements already present in
-- migrate.sql — run either one, they do the same thing. Safe to
-- run more than once (IF NOT EXISTS), and no backend restart or
-- redeploy is needed afterwards.
--
-- Until this runs, the contact form still captures enquiries but
-- drops the budget, so the Budget column on Admin > Leads is empty.
-- ============================================================

ALTER TABLE website_contact_submissions ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE website_contact_submissions ADD COLUMN IF NOT EXISTS currency TEXT;
