-- Supabase PostgreSQL Schema for Smart Student Attendance, Academics & Sports Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Same as auth.users.id
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FACULTY TABLE
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    employee_id TEXT NOT NULL UNIQUE,
    designation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    roll_number TEXT NOT NULL UNIQUE,
    year INT NOT NULL CHECK (year >= 1 AND year <= 4),
    section TEXT NOT NULL,
    admission_year INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
    semester INT NOT NULL CHECK (semester >= 1 AND semester <= 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'On Duty')),
    marked_by UUID REFERENCES faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, subject_id, date)
);

-- 7. ACADEMIC MARKS TABLE
CREATE TABLE IF NOT EXISTS academic_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('Internal 1', 'Internal 2', 'Internal 3', 'Semester')),
    marks_obtained NUMERIC(5,2) NOT NULL,
    max_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, subject_id, exam_type)
);

-- 8. SPORTS ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS sports_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    activity_name TEXT NOT NULL,
    tournament_name TEXT NOT NULL,
    date DATE NOT NULL,
    achievement TEXT NOT NULL, -- e.g., Winner, Runner Up, Third Place, Participation
    description TEXT,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic', 'Sports', 'Other')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on tables for security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (Example policies - in production, customize as needed)
-- Public read on departments
CREATE POLICY "Allow public read on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow admin edit on departments" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Profiles policies
CREATE POLICY "Allow users to view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger for syncing auth.users with profiles
-- Note: When signing up from the application, metadata should include `role` and `name`
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
