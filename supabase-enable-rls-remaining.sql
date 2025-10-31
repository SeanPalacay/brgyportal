-- ========================================
-- Enable RLS on Remaining Tables
-- ========================================
-- This script secures the last two unrestricted tables:
-- - _UserRoles (Prisma relation table for Users ↔ Roles)
-- - _prisma_migrations (Prisma migration tracking)
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Copy-paste this entire file
-- 4. Click "Run"
-- ========================================

-- Enable RLS on relation table
ALTER TABLE "_UserRoles" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Prisma migrations table
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service_role (your backend) full access

CREATE POLICY "Service role can do everything on _UserRoles"
ON "_UserRoles" FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on _prisma_migrations"
ON "_prisma_migrations" FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- ========================================
-- DONE! All tables are now secure.
-- ========================================
-- What these tables are:
-- - _UserRoles: Junction table linking users to roles (many-to-many)
-- - _prisma_migrations: Tracks which migrations have been applied
--
-- Both are managed by Prisma and now protected by RLS.
-- ========================================
