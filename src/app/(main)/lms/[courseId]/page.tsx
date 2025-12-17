"use client";

import { useLMSStore } from "@/lib/store/useLMSStore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseDetailPage() {
    const { courses, lessons } = useLMSStore();
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const course = courses.find(c => c.id === courseId);
    const courseLessons = lessons[courseId] || [];

    if (!course) return <div>Course not found</div>;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="bg-slate-900 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                            <p className="text-slate-300 text-lg mb-4">{course.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                                <span>Instructor: {course.instructor}</span>
                                <span>•</span>
                                <span>{course.totalLessons} Lessons</span>
                            </div>
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    const firstKey = courseLessons[0]?.id;
                                    if (firstKey) router.push(`/lms/${courseId}/lesson/${firstKey}`);
                                }}
                            >
                                {course.progress > 0 ? "Continue Learning" : "Start Course"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full p-8">
                <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                <div className="space-y-4">
                    {courseLessons.map((lesson, idx) => (
                        <Card key={lesson.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer" onClick={() => router.push(`/lms/${courseId}/lesson/${lesson.id}`)}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-400 font-mono text-sm w-8">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{lesson.title}</h3>
                                        <p className="text-xs text-slate-500">{lesson.type === 'video' ? 'Video' : 'Text'} • {lesson.duration}</p>
                                    </div>
                                </div>
                                {lesson.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <PlayCircle className="h-5 w-5 text-slate-300" />}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
