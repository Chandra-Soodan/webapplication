-- ================================================================
-- FIX: Run this in Supabase SQL Editor to fix empty array issues
-- Copy everything below and paste in Supabase → SQL Editor → Run
-- ================================================================

-- PROBLEM: The old certificates SELECT policy used 
--   auth.jwt() -> 'user_metadata' ->> 'role'
-- which can silently return NULL for many users, blocking reads.
-- SOLUTION: Query the profiles table directly instead.

-- Step 1: Drop old broken policies
DROP POLICY IF EXISTS "Allow read on certificates" ON certificates;
DROP POLICY IF EXISTS "Allow admin verify certificates" ON certificates;

-- Step 2: Create fixed policies
CREATE POLICY "Allow student or admin read certificates" ON certificates FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    OR
    EXISTS (SELECT 1 FROM students WHERE students.id = student_id AND students.profile_id = auth.uid())
  )
);

CREATE POLICY "Allow admin verify certificates" ON certificates FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ================================================================
-- DIAGNOSTIC QUERIES
-- Run these to verify your data exists in Supabase:
-- ================================================================

-- Check 1: Does a students row exist for your user?
-- Replace the UUID with your auth.users ID (the one in the URL after login)
-- SELECT * FROM students WHERE profile_id = '7afb5e45-653e-49aa-9ff4-81bfcc5aa1d8';

-- Check 2: Are there academic marks for that student?
-- SELECT am.* FROM academic_marks am
-- JOIN students s ON s.id = am.student_id
-- WHERE s.profile_id = '7afb5e45-653e-49aa-9ff4-81bfcc5aa1d8';

-- Check 3: Are there sports activities for that student?
-- SELECT sa.* FROM sports_activities sa
-- JOIN students s ON s.id = sa.student_id
-- WHERE s.profile_id = '7afb5e45-653e-49aa-9ff4-81bfcc5aa1d8';
