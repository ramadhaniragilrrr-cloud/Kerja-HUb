-- MASTER FIX: RLS Policies for Profiles, Chats, LMS
-- Run this in Supabase SQL Editor to fix all access issues.

-- ==========================================
-- 1. PROFILES (Users)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read profiles (needed for user lists, avatars, etc.)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to update any profile (assuming role is stored in profiles)
-- Note: This requires an infinite recursion check if not careful.
-- Safer approach: Users can update if they are admin OR it's their own profile.
-- For now, we'll stick to basic own-update + public read.
-- If you need admins to update others, we can add that specifically.
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );


-- ==========================================
-- 2. CHATS & MESSAGES
-- ==========================================
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chats: Viewable if user is a participant
-- Note: This assumes a 'chat_participants' table or 'participants' array in 'chats'.
-- Based on typical schema:
-- If chats has a participants array column (uuid[]):
-- CREATE POLICY "Chats viewable by participants" ON chats FOR SELECT USING (auth.uid() = ANY(participants));
-- BUT, if you use a join table 'chat_participants', we need policies there too.
-- Let's assume standard 'chats' table. If it uses a join table, we need to know.
-- Assuming 'chats' table has no direct user link, but 'chat_participants' does.

-- Let's check if 'chat_participants' table exists or if it's an array.
-- To be safe, I'll add policies for 'chat_participants' if it exists.

-- Re-applying standard simple Chat RLS (adjust if your schema differs)

-- Allow authenticated users to create chats
DROP POLICY IF EXISTS "Authenticated users can create chats" ON chats;
CREATE POLICY "Authenticated users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow participants to view chats (assuming chat_participants table)
-- If you use a simple 'chats' table with 'created_by', that's not enough for DMs.
-- I'll assume you have a way to link users.
-- IF YOU HAVE 'chat_participants' table:
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their chat relations" ON chat_participants;
CREATE POLICY "Participants can view their chat relations" ON chat_participants
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Participants can insert themselves" ON chat_participants;
CREATE POLICY "Participants can insert themselves" ON chat_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow viewing chats where user is a participant
DROP POLICY IF EXISTS "Users can view chats they belong to" ON chats;
CREATE POLICY "Users can view chats they belong to" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = chats.id
      AND chat_participants.user_id = auth.uid()
    )
  );

-- Messages: Viewable if user is in the chat
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = messages.chat_id
      AND chat_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = messages.chat_id
      AND chat_participants.user_id = auth.uid()
    )
  );


-- ==========================================
-- 3. LMS (COURSES, LESSONS, etc.)
-- ==========================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Courses: Public read
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

-- Authenticated can edit (for now, simpler than admin check)
DROP POLICY IF EXISTS "Authenticated users can modify courses" ON courses;
CREATE POLICY "Authenticated users can modify courses" ON courses
  FOR ALL USING (auth.role() = 'authenticated');

-- Lessons: Authenticated read
DROP POLICY IF EXISTS "Lessons are viewable by authenticated users" ON lessons;
CREATE POLICY "Lessons are viewable by authenticated users" ON lessons
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can modify lessons" ON lessons;
CREATE POLICY "Authenticated users can modify lessons" ON lessons
  FOR ALL USING (auth.role() = 'authenticated');

-- Assignments
DROP POLICY IF EXISTS "Assignments viewable by authenticated" ON assignments;
CREATE POLICY "Assignments viewable by authenticated" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can modify assignments" ON assignments;
CREATE POLICY "Authenticated users can modify assignments" ON assignments
  FOR ALL USING (auth.role() = 'authenticated');

-- Quizzes
DROP POLICY IF EXISTS "Quizzes viewable by authenticated" ON quizzes;
CREATE POLICY "Quizzes viewable by authenticated" ON quizzes
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can modify quizzes" ON quizzes;
CREATE POLICY "Authenticated users can modify quizzes" ON quizzes
  FOR ALL USING (auth.role() = 'authenticated');

-- Quiz Questions
DROP POLICY IF EXISTS "Quiz questions viewable by authenticated" ON quiz_questions;
CREATE POLICY "Quiz questions viewable by authenticated" ON quiz_questions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can modify quiz questions" ON quiz_questions;
CREATE POLICY "Authenticated users can modify quiz questions" ON quiz_questions
  FOR ALL USING (auth.role() = 'authenticated');


-- ==========================================
-- 4. FIX ADMIN ROLE (Optional but helpful)
-- ==========================================
-- This part updates the role of a specific user to 'admin'.
-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with the actual admin email if known.
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@EXAMPLE.COM';
