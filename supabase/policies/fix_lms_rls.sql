-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses: Everyone can view courses
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

-- Admin can insert/update/delete courses (assuming admin role or specific user)
-- For now, allow authenticated to insert/update for testing/admin purposes
DROP POLICY IF EXISTS "Authenticated users can modify courses" ON courses;
CREATE POLICY "Authenticated users can modify courses" ON courses
  FOR ALL USING (auth.role() = 'authenticated');

-- Lessons: Viewable by authenticated users
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

-- Progress tables
DROP POLICY IF EXISTS "Users can view own course progress" ON user_course_progress;
CREATE POLICY "Users can view own course progress" ON user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own course progress" ON user_course_progress;
CREATE POLICY "Users can insert own course progress" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own course progress" ON user_course_progress;
CREATE POLICY "Users can update own course progress" ON user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can view own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can insert own lesson progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON user_lesson_progress;
CREATE POLICY "Users can update own lesson progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);
