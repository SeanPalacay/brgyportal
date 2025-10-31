# Supabase Row Level Security (RLS) Setup

## ⚠️ Security Issue: Unrestricted Tables

If you see "unrestricted" on your tables in Supabase, it means anyone can read/write to your database directly! This is a **critical security risk**.

## Solution: Enable Row Level Security (RLS)

### Quick Fix (Recommended for Backend-Only Access)

Since your app uses a backend API (not direct Supabase client access from frontend), you can use a simple RLS setup:

**Enable RLS on all tables but allow service_role to bypass it.**

This means:
- ✅ Your backend can access everything (using service_role key)
- ❌ Direct database access from frontend is blocked
- ✅ Storage buckets still work (they have separate policies)

---

## Step-by-Step: Enable RLS on All Tables

### Option 1: Using Supabase SQL Editor (Fastest)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/lgqbjqfjhdpahcijpnli

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New query**

3. **Copy and paste this SQL:**

```sql
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

-- Create bypass policy for service_role (your backend)
-- This allows your backend to access everything while blocking direct access

-- Users table
CREATE POLICY "Service role can do everything on users"
ON "users"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Roles table
CREATE POLICY "Service role can do everything on roles"
ON "roles"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Patients table
CREATE POLICY "Service role can do everything on patients"
ON "patients"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Appointments table
CREATE POLICY "Service role can do everything on appointments"
ON "appointments"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Immunization records table
CREATE POLICY "Service role can do everything on immunization_records"
ON "immunization_records"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Immunization schedules table
CREATE POLICY "Service role can do everything on immunization_schedules"
ON "immunization_schedules"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Daycare students table
CREATE POLICY "Service role can do everything on daycare_students"
ON "daycare_students"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Daycare registrations table
CREATE POLICY "Service role can do everything on daycare_registrations"
ON "daycare_registrations"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Attendance records table
CREATE POLICY "Service role can do everything on attendance_records"
ON "attendance_records"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Learning materials table
CREATE POLICY "Service role can do everything on learning_materials"
ON "learning_materials"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Progress reports table
CREATE POLICY "Service role can do everything on progress_reports"
ON "progress_reports"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Events table
CREATE POLICY "Service role can do everything on events"
ON "events"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Event registrations table
CREATE POLICY "Service role can do everything on event_registrations"
ON "event_registrations"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Event attendance table
CREATE POLICY "Service role can do everything on event_attendance"
ON "event_attendance"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Certificates table
CREATE POLICY "Service role can do everything on certificates"
ON "certificates"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Notifications table
CREATE POLICY "Service role can do everything on notifications"
ON "notifications"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Notification settings table
CREATE POLICY "Service role can do everything on notification_settings"
ON "notification_settings"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Broadcast messages table
CREATE POLICY "Service role can do everything on broadcast_messages"
ON "broadcast_messages"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Announcements table
CREATE POLICY "Service role can do everything on announcements"
ON "announcements"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Features table
CREATE POLICY "Service role can do everything on features"
ON "features"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Benefits table
CREATE POLICY "Service role can do everything on benefits"
ON "benefits"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Testimonials table
CREATE POLICY "Service role can do everything on testimonials"
ON "testimonials"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Service features table
CREATE POLICY "Service role can do everything on service_features"
ON "service_features"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Youth profiles table
CREATE POLICY "Service role can do everything on youth_profiles"
ON "youth_profiles"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- System settings table
CREATE POLICY "Service role can do everything on system_settings"
ON "system_settings"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Audit logs table
CREATE POLICY "Service role can do everything on audit_logs"
ON "audit_logs"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- System backups table
CREATE POLICY "Service role can do everything on system_backups"
ON "system_backups"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

4. **Click "Run"** or press `Ctrl+Enter`

5. **Verify:**
   - Go to **Database** → **Tables**
   - All tables should now show a shield icon 🛡️ instead of "unrestricted"

---

## Why This Works

### Before (Unrestricted):
```
Frontend → Supabase Database ✅ (Anyone can access!)
Backend → Supabase Database ✅
```

### After (RLS Enabled):
```
Frontend → Supabase Database ❌ (Blocked by RLS)
Backend (service_role) → Supabase Database ✅ (Allowed by policy)
```

**Your backend uses the `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS policies we created.**

This is perfect because:
- Your app architecture uses backend API (Render) for all database operations
- Frontend never talks directly to Supabase database
- RLS protects against unauthorized direct access
- Your backend still works perfectly!

---

## Option 2: Using Supabase Dashboard UI (Manual, Slower)

If you prefer clicking instead of SQL:

1. Go to **Database** → **Tables**
2. For each table:
   - Click on the table name
   - Click **"RLS disabled"** warning banner
   - Click **"Enable RLS"**
   - Click **"New Policy"**
   - Choose **"Custom Policy"**
   - Name: `Service role full access`
   - Target roles: `service_role`
   - Policy command: `ALL`
   - USING expression: `true`
   - WITH CHECK expression: `true`
   - Click **"Save policy"**

3. Repeat for all 27 tables (tedious!)

**Recommendation:** Use SQL Editor (Option 1) - much faster!

---

## Verification Checklist

After running the SQL:

- [ ] Go to **Database** → **Tables**
- [ ] Check that tables show 🛡️ shield icon (not "unrestricted")
- [ ] Click on a table → **Policies** tab
- [ ] Should see policy: "Service role can do everything..."
- [ ] Test your backend (should still work perfectly)
- [ ] Test direct database access (should be blocked)

---

## Testing RLS is Working

### Test 1: Backend Should Still Work

```bash
# Test your backend API
curl https://your-backend.onrender.com/health
# Should return: {"status":"OK",...}
```

### Test 2: Direct Access Should Be Blocked

1. Go to Supabase → **SQL Editor**
2. Try to query with anon key (this should fail):
   ```sql
   SELECT * FROM users;
   ```
3. You should see: **"Permission denied"** or **"new row violates row-level security policy"**
4. This is GOOD! It means RLS is working.

---

## Important Notes

### Your Backend Will Continue Working Because:

Your backend uses `SUPABASE_SERVICE_ROLE_KEY` which has **service_role** privileges.

The policies we created specifically allow `service_role` to bypass RLS:
```sql
TO service_role
USING (true)  -- Always allow reads
WITH CHECK (true)  -- Always allow writes
```

### Storage Buckets Are Separate

Storage buckets (`proof-of-residency`, `learning-materials`) have their own policies that you already set up. RLS on tables doesn't affect storage.

---

## Alternative: More Granular RLS (Advanced)

If you want user-level access control (e.g., users can only see their own data), you'd need more complex policies like:

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can read own data"
ON "users"
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);
```

**However**, since your app uses a backend API, this is **NOT needed**. Your backend handles all authorization logic, which is simpler and more secure.

---

## Summary

**What We're Doing:**
- ✅ Enabling RLS on all tables (blocks unauthorized access)
- ✅ Creating service_role policies (allows your backend to work)

**Result:**
- ✅ Tables are now secure
- ✅ Backend still works perfectly
- ✅ Direct database access is blocked

**Time Required:** 2 minutes (just copy-paste SQL and run it!)

---

## Quick Fix Command

If you want to do this right now:

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/lgqbjqfjhdpahcijpnli/sql
2. Copy the entire SQL block from above
3. Paste and click "Run"
4. Done! ✅

Your database is now secure! 🔒
