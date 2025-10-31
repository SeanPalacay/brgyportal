-- ========================================
-- Supabase RLS (Row Level Security) Setup
-- ========================================
-- This script enables RLS on all tables and creates policies
-- that allow your backend (service_role) to access everything
-- while blocking unauthorized direct database access.
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Copy-paste this entire file
-- 4. Click "Run" or press Ctrl+Enter
-- ========================================

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "immunization_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "immunization_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daycare_students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daycare_registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "progress_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "broadcast_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "benefits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "youth_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_backups" ENABLE ROW LEVEL SECURITY;

-- Create bypass policies for service_role (your backend)
-- This allows your backend API to access everything

CREATE POLICY "Service role can do everything on users"
ON "users" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on roles"
ON "roles" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on patients"
ON "patients" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on appointments"
ON "appointments" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on immunization_records"
ON "immunization_records" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on immunization_schedules"
ON "immunization_schedules" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on daycare_students"
ON "daycare_students" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on daycare_registrations"
ON "daycare_registrations" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on attendance_records"
ON "attendance_records" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on learning_materials"
ON "learning_materials" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on progress_reports"
ON "progress_reports" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on events"
ON "events" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on event_registrations"
ON "event_registrations" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on event_attendance"
ON "event_attendance" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on certificates"
ON "certificates" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on notifications"
ON "notifications" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on notification_settings"
ON "notification_settings" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on broadcast_messages"
ON "broadcast_messages" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on announcements"
ON "announcements" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on features"
ON "features" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on benefits"
ON "benefits" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on testimonials"
ON "testimonials" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on service_features"
ON "service_features" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on youth_profiles"
ON "youth_profiles" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on system_settings"
ON "system_settings" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on audit_logs"
ON "audit_logs" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on system_backups"
ON "system_backups" FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- ========================================
-- DONE! Your database is now secure.
-- ========================================
-- What this does:
-- ✅ Blocks unauthorized direct database access
-- ✅ Allows your backend API (using service_role key) to work normally
-- ✅ Tables now show 🛡️ shield icon instead of "unrestricted"
--
-- Verify:
-- 1. Go to Database → Tables in Supabase Dashboard
-- 2. Tables should show shield icon (RLS enabled)
-- 3. Click a table → Policies tab → Should see "Service role..." policy
-- ========================================
