-- =============================================================
-- SEED DATA for Smart Student Management System
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- NOTE: These UUIDs are fixed for demo consistency. 
--       Replace with real auth.users UUIDs after creating users.
-- =============================================================

-- Step 1: Insert Departments
INSERT INTO departments (id, name, code) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Computer Science & Engineering', 'CSE'),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Electronics & Communication Engineering', 'ECE'),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'Mechanical Engineering', 'ME')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert Subjects
INSERT INTO subjects (id, name, code, department_id, semester) VALUES
  ('b2c3d4e5-0002-0002-0002-000000000001', 'Data Structures & Algorithms', 'CSE301', 'a1b2c3d4-0001-0001-0001-000000000001', 5),
  ('b2c3d4e5-0002-0002-0002-000000000002', 'Database Management Systems', 'CSE302', 'a1b2c3d4-0001-0001-0001-000000000001', 5),
  ('b2c3d4e5-0002-0002-0002-000000000003', 'Operating Systems', 'CSE303', 'a1b2c3d4-0001-0001-0001-000000000001', 5),
  ('b2c3d4e5-0002-0002-0002-000000000004', 'Signals & Systems', 'ECE301', 'a1b2c3d4-0001-0001-0001-000000000002', 5),
  ('b2c3d4e5-0002-0002-0002-000000000005', 'Thermodynamics', 'ME201', 'a1b2c3d4-0001-0001-0001-000000000003', 3)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- IMPORTANT: Steps 3-7 require REAL auth.users UUIDs.
-- 
-- HOW TO GET REAL UUIDs:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Find each user and copy their UUID
-- 3. Replace the placeholder UUIDs below with REAL ones
--    before running this section.
--
-- OR: Use the Admin panel of the app to create users first,
--     then run the INSERT statements for marks/sports/etc.
-- =============================================================

-- Example: If your admin user UUID is '7afb5e45-653e-49aa-9ff4-81bfcc5aa1d8',
-- replace the profile_id values below with real UUIDs from auth.users.

-- Step 3: Insert Profiles (must match auth.users IDs exactly)
-- UNCOMMENT and replace UUIDs with REAL ones from Supabase Auth:
/*
INSERT INTO profiles (id, email, role, name) VALUES
  ('<REAL-ADMIN-UUID>', 'admin@college.edu', 'admin', 'Dr. Sathish Kumar'),
  ('<REAL-FACULTY-1-UUID>', 'alan@college.edu', 'faculty', 'Prof. Alan Turing'),
  ('<REAL-STUDENT-1-UUID>', 'john@college.edu', 'student', 'John Doe'),
  ('<REAL-STUDENT-2-UUID>', 'jane@college.edu', 'student', 'Jane Smith')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert Faculty
INSERT INTO faculty (profile_id, department_id, employee_id, designation) VALUES
  ('<REAL-FACULTY-1-UUID>', 'a1b2c3d4-0001-0001-0001-000000000001', 'FAC-CSE-001', 'HOD / Professor')
ON CONFLICT (profile_id) DO NOTHING;

-- Step 5: Insert Students
INSERT INTO students (id, profile_id, department_id, roll_number, year, section, admission_year) VALUES
  ('c3d4e5f6-0003-0003-0003-000000000001', '<REAL-STUDENT-1-UUID>', 'a1b2c3d4-0001-0001-0001-000000000001', 'CSE2201', 3, 'A', 2023),
  ('c3d4e5f6-0003-0003-0003-000000000002', '<REAL-STUDENT-2-UUID>', 'a1b2c3d4-0001-0001-0001-000000000001', 'CSE2202', 3, 'A', 2023)
ON CONFLICT (profile_id) DO NOTHING;

-- Step 6: Insert Academic Marks (after students exist)
INSERT INTO academic_marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES
  -- Student 1 - DSA
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000001', 'Internal 1', 22, 25),
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000001', 'Internal 2', 20, 25),
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000001', 'Internal 3', 24, 25),
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000001', 'Semester',   88, 100),
  -- Student 1 - DBMS
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000002', 'Internal 1', 18, 25),
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000002', 'Internal 2', 21, 25),
  ('c3d4e5f6-0003-0003-0003-000000000001', 'b2c3d4e5-0002-0002-0002-000000000002', 'Semester',   82, 100)
ON CONFLICT (student_id, subject_id, exam_type) DO NOTHING;

-- Step 7: Insert Sports Activities
INSERT INTO sports_activities (student_id, activity_name, tournament_name, date, achievement, description) VALUES
  ('c3d4e5f6-0003-0003-0003-000000000001', 'Football', 'Inter-College Sports Meet 2026', '2026-05-15', 'Winner', 'Captain of the college team. Won the finals by 3-1.')
ON CONFLICT DO NOTHING;
*/
