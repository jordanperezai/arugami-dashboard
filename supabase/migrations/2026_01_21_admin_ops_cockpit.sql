-- ============================================
-- ADMIN OPS COCKPIT - DATABASE MIGRATIONS
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL)
-- These changes add:
--   1. onboarding_checklist column to clients table
--   2. client_notes table for tracking admin notes

-- ===========================================
-- 1. ADD ONBOARDING CHECKLIST TO CLIENTS
-- ===========================================
-- This JSONB column tracks onboarding progress for each client
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB
  DEFAULT '{"ghl_setup": false, "website_live": false, "first_automation": false, "payment_collected": false}';

-- ===========================================
-- 2. CREATE CLIENT NOTES TABLE
-- ===========================================
-- Admin notes for tracking client interactions
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Index for fast lookups by client
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);

-- ===========================================
-- 3. RLS POLICIES (if RLS is enabled)
-- ===========================================
-- Allow service role full access (admin dashboard uses service role)
-- If you need user-based access, add appropriate policies here

-- Enable RLS on client_notes (optional - service role bypasses RLS)
-- ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (default behavior)
-- CREATE POLICY "Service role has full access to client_notes"
--   ON client_notes
--   FOR ALL
--   TO service_role
--   USING (true);
