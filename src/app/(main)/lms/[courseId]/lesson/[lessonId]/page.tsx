"use client";

import { useLMSStore } from "@/lib/store/useLMSStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, ChevronLeft, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

export default function LessonPage() {
    const { lessons, completeLesson } = useLMSStore();
    const { user } = useAuthStore();
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const courseLessons = lessons[courseId] || [];
    const currentLessonIndex = courseLessons.findIndex(l => l.id === lessonId);
    const lesson = courseLessons[currentLessonIndex];

    if (!lesson) return <div className="p-8">Lesson not found</div>;

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    const handleComplete = () => {
        completeLesson(courseId, lessonId);
        // Optional: Auto-advance
        if (currentLessonIndex < courseLessons.length - 1) {
            router.push(`/lms/${courseId}/lesson/${courseLessons[currentLessonIndex + 1].id}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full p-8 flex-1">
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                    <div className="flex gap-2 text-sm text-slate-500">
                        <span>Lesson {currentLessonIndex + 1} of {courseLessons.length}</span>
                    </div>
                </div>

                <div className="mb-8 min-h-[500px] bg-slate-50 dark:bg-slate-900 rounded-xl border p-8 flex flex-col">
                    {/* Content Viewer */}
                    {lesson.type === 'video' ? (
                        <div
                            className="aspect-video bg-black flex items-center justify-center rounded-lg text-white w-full h-full relative overflow-hidden group cursor-pointer"
                            onClick={togglePlay}
                        >
                            {lesson.content.includes('.') ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        src={lesson.content}
                                        className="w-full h-full object-contain"
                                        controls={false}
                                        onContextMenu={(e) => e.preventDefault()}
                                        disablePictureInPicture
                                        controlsList="nodownload noplaybackrate"
                                        onEnded={handleVideoEnded}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                    />

                                    {/* Play Button Overlay */}
                                    {!isPlaying && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                                            <PlayCircle className="h-20 w-20 text-white opacity-90" />
                                        </div>
                                    )}

                                    {/* Custom Controls Bar (Fade in on hover) */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className="text-white hover:text-blue-400 mr-4"
                                            onClick={togglePlay}
                                        >
                                            <span className="font-bold text-sm">{isPlaying ? "Pause" : "Play"}</span>
                                        </button>

                                        {/* Progress Bar (Visual only for now, or simple) */}
                                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-full opacity-50" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-10">
                                    <PlayCircle className="h-12 w-12 mx-auto mb-2 text-white/50" />
                                    <p>Video Source: {lesson.content}</p>
                                </div>
                            )}
                        </div>
                    ) : lesson.type === 'pdf' ? (
                        <div className="w-full h-[85vh] bg-slate-200 rounded-lg overflow-hidden relative group">
                            {/* PDF Viewer */}
                            <iframe
                                src={`${lesson.content}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                className="w-full h-full"
                                style={{ pointerEvents: 'auto' }} // Allow scrolling
                            />

                            {/* Toolbar Mask / Security Header */}
                            <div className="absolute top-0 left-0 right-0 h-14 bg-slate-100 dark:bg-slate-900 z-10 flex items-center justify-between px-4 border-b select-none">
                                <span className="text-xs font-mono text-slate-400">View Only • {user?.email}</span>
                                <span className="text-xs text-red-500 font-bold">RESTRICTED</span>
                            </div>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-2">Text Content</h3>
                            <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {lesson.content}
                            </div>
                        </div>
                    )
                    }
                </div>

                <div className="flex items-center justify-between border-t pt-6">
                    <Button
                        variant="outline"
                        disabled={currentLessonIndex === 0}
                        onClick={() => router.push(`/lms/${courseId}/lesson/${courseLessons[currentLessonIndex - 1].id}`)}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>

                    <div className="flex gap-2">
                        {!lesson.completed && (
                            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white">
                                Mark as Complete <CheckCircle className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                        <Button
                            disabled={currentLessonIndex === courseLessons.length - 1}
                            onClick={() => router.push(`/lms/${courseId}/lesson/${courseLessons[currentLessonIndex + 1].id}`)}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
