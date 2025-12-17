import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    type: 'video' | 'text' | 'pdf';
    content: string; // url or markdown
    duration: string;
    completed: boolean;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: string;
    progress: number; // 0-100
    totalLessons: number;
    completedLessons: number;
}

export interface Assignment {
    id: string;
    course_id: string;
    title: string;
    description: string;
    due_date: string;
    points: number;
}

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    content: string;
    submitted_at: string;
    grade?: number;
}

export interface Quiz {
    id: string;
    course_id: string;
    title: string;
    description: string;
    time_limit_minutes: number;
    passing_score: number;
}

export interface QuizQuestion {
    id: string;
    quiz_id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
}


interface LMSState {
    courses: Course[];
    lessons: Record<string, Lesson[]>;
    assignments: Record<string, Assignment[]>;
    quizzes: Record<string, Quiz[]>; // courseId -> quizzes

    // Actions
    loadCourses: () => Promise<void>;
    loadCourseContent: (courseId: string) => Promise<void>;
    loadQuizzes: (courseId: string) => Promise<void>;
    enrollCourse: (courseId: string) => Promise<void>;
    completeLesson: (courseId: string, lessonId: string) => Promise<void>;
    submitAssignment: (assignmentId: string, content: string) => Promise<{ error: any }>;
    createCourse: (course: Partial<Course>) => Promise<{ error: any }>;
    createLesson: (lesson: Partial<Lesson> & { courseId: string }) => Promise<{ error: any }>;
    createQuiz: (quiz: Partial<Quiz>) => Promise<{ error: any }>;
    createQuestion: (question: Partial<QuizQuestion>) => Promise<{ error: any }>;
    deleteQuiz: (quizId: string) => Promise<{ error: any }>;
    submitQuiz: (quizId: string, score: number) => Promise<{ error: any }>;
    uploadLessonContent: (file: File) => Promise<{ publicUrl?: string; error: any }>;
}

export const useLMSStore = create<LMSState>((set, get) => ({
    courses: [],
    lessons: {},
    assignments: {},
    quizzes: {},

    loadCourses: async () => {
        // Fetch courses for the dashboard
        const { data: courses } = await supabase.from('courses').select('*');
        if (courses) {
            // For MVP, we might want to attach progress
            // This logic needs to be expanded for real progress fetching, 
            // but keeping it simple for now to match the "mock-to-real" transition style
            set({ courses: courses.map(c => ({ ...c, progress: 0, completedLessons: 0 })) as any });
        }
    },

    loadCourseContent: async (courseId) => {
        // Fetch lessons
        const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_order', { ascending: true });

        // Fetch assignments
        const { data: assignments } = await supabase
            .from('assignments')
            .select('*')
            .eq('course_id', courseId)
            .order('due_date', { ascending: true });

        set((state) => ({
            lessons: { ...state.lessons, [courseId]: lessons as any[] || [] },
            assignments: { ...state.assignments, [courseId]: assignments as any[] || [] }
        }));
    },

    enrollCourse: async (courseId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        await supabase.from('user_course_progress').insert({
            user_id: user.id,
            course_id: courseId
        });
        // Refresh?
    },

    completeLesson: async (courseId, lessonId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        await supabase.from('user_lesson_progress').insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true
        });

        // In a real app, we'd recalc progress here or via DB trigger
        // For now, toggle local state to show immediate UI update
        set((state) => {
            const courseLessons = state.lessons[courseId] || [];
            const updatedLessons = courseLessons.map(l => l.id === lessonId ? { ...l, completed: true } : l);
            return { lessons: { ...state.lessons, [courseId]: updatedLessons } };
        });
    },

    submitAssignment: async (assignmentId, content) => {
        const user = useAuthStore.getState().user;
        if (!user) return { error: "User not logged in" };

        const { error } = await supabase.from('assignment_submissions').insert({
            assignment_id: assignmentId,
            student_id: user.id,
            content: content
        });

        return { error };
    },

    createCourse: async (course) => {
        const id = Math.random().toString(36).substring(2, 9);
        const { error } = await supabase.from('courses').insert({
            id,
            ...course,
            title: course.title || "Untitled Course",
            thumbnail: course.thumbnail || "/placeholder-course.jpg"
        });

        if (!error) {
            await get().loadCourses(); // Reload
        }
        return { error };
    },

    createLesson: async (lesson) => {
        const id = Math.random().toString(36).substring(2, 9);

        // Map camelCase to snake_case for DB
        const dbLesson = {
            id,
            course_id: lesson.courseId,
            title: lesson.title || "Untitled Lesson",
            type: lesson.type || 'text',
            content: lesson.content,
            duration: lesson.duration,
            sequence_order: 0, // Default order
        };

        const { error } = await supabase.from('lessons').insert(dbLesson);

        if (!error && lesson.courseId) {
            await get().loadCourseContent(lesson.courseId);
        }
        return { error };
    },

    // Quiz Actions
    loadQuizzes: async (courseId) => {
        const { data: quizzes } = await supabase
            .from('quizzes')
            .select('*')
            .eq('course_id', courseId);

        set((state) => ({
            quizzes: { ...state.quizzes, [courseId]: quizzes as any[] || [] }
        }));
    },

    createQuiz: async (quiz) => {
        const { error } = await supabase.from('quizzes').insert(quiz);
        if (!error && quiz.course_id) {
            await get().loadQuizzes(quiz.course_id);
        }
        return { error };
    },

    deleteQuiz: async (quizId) => {
        const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
        // We might need to reload quizzes or remove from local state
        // For simplicity, just return error for now, or could optimally remove from state
        return { error };
    },

    createQuestion: async (question) => {
        const { error } = await supabase.from('quiz_questions').insert(question);
        return { error };
    },

    submitQuiz: async (quizId, score) => {
        const user = useAuthStore.getState().user;
        if (!user) return { error: "User not logged in" };

        const { error } = await supabase.from('quiz_attempts').insert({
            quiz_id: quizId,
            student_id: user.id,
            score: score,
            started_at: new Date().toISOString(), // Mock start time for now
            completed_at: new Date().toISOString()
        });
        return { error };
    },

    uploadLessonContent: async (file) => {
        const user = useAuthStore.getState().user;
        if (!user) return { error: "User not logged in" };

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Using 'lms-materials' bucket
        const { error } = await supabase.storage
            .from('lms-materials')
            .upload(filePath, file);

        if (error) return { error };

        const { data: { publicUrl } } = supabase.storage
            .from('lms-materials')
            .getPublicUrl(filePath);

        return { publicUrl, error: null };
    }
}));
