"use client";

import { useLMSStore } from "@/lib/store/useLMSStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, PlayCircle, CheckCircle, LayoutDashboard, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function LMSSidebar() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { courses, lessons, loadQuizzes, createLesson } = useLMSStore();
    const { user } = useAuthStore();

    // Simple effect to load quizzes when sidebar mounts/course changes
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (courseId) {
            // Load Quizzes and Course Content (Lessons/Assignments)
            if (loadQuizzes) loadQuizzes(courseId);
            if (useLMSStore.getState().loadCourseContent) useLMSStore.getState().loadCourseContent(courseId);
        }
    }, [courseId, loadQuizzes]);

    const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonType, setNewLessonType] = useState<"video" | "text" | "pdf">("text");
    const [newLessonDuration, setNewLessonDuration] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const currentCourse = courses.find(c => c.id === courseId);
    const currentLessons = lessons[courseId] || [];

    const handleCreateLesson = async () => {
        if (!courseId) return;
        setIsUploading(true);

        let contentUrl = "";

        if (selectedFile && (newLessonType === 'video' || newLessonType === 'pdf')) {
            const { publicUrl, error } = await useLMSStore.getState().uploadLessonContent(selectedFile);
            if (error) {
                console.error("Upload error:", error);
                alert(`Upload failed: ${error.message || JSON.stringify(error)}`);
                setIsUploading(false);
                return;
            }
            contentUrl = publicUrl || "";
        }

        const { error: createError } = await createLesson({
            courseId,
            title: newLessonTitle,
            type: newLessonType,
            duration: newLessonDuration,
            content: contentUrl,
            completed: false
        });

        if (createError) {
            alert(`Failed to create lesson: ${createError.message || JSON.stringify(createError)}`);
            setIsUploading(false);
            return;
        }
        setIsCreateLessonOpen(false);
        setNewLessonTitle("");
        setNewLessonDuration("");
        setSelectedFile(null);
        setIsUploading(false);
    };

    if (courseId && currentCourse) {
        // Course Context Sidebar
        return (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                        <Button variant="ghost" className="-ml-2 text-slate-500 h-8 px-2" onClick={() => router.push('/lms')}>
                            ← Back
                        </Button>
                        {user?.role === 'admin' && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsCreateLessonOpen(true)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <h2 className="font-semibold text-lg leading-tight">{currentCourse.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {currentLessons.filter(l => l.completed).length}/{currentLessons.length} Lessons
                    </p>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {currentLessons.map((lesson, index) => (
                            <Button
                                key={lesson.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-auto py-3 px-3",
                                    params.lessonId === lesson.id && "bg-blue-100 text-blue-700 dark:bg-blue-900/40"
                                )}
                                onClick={() => router.push(`/lms/${courseId}/lesson/${lesson.id}`)}
                            >
                                <div className="mr-3 mt-0.5">
                                    {lesson.completed ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 text-[10px] text-slate-500">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <span className={cn("block text-sm font-medium", lesson.completed && "text-slate-500")}>
                                        {lesson.title}
                                    </span>
                                    <span className="text-xs text-slate-400 font-normal">
                                        {lesson.type === 'video' ? 'Video' : 'Text'} • {lesson.duration}
                                    </span>
                                </div>
                            </Button>
                        ))}
                    </div>
                    <div className="p-2 pt-0">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start py-3 px-3",
                                params.assignmentId ? "bg-blue-100 text-blue-700 font-medium" : "text-slate-600"
                            )}
                            onClick={() => router.push(`/lms/${courseId}/assignments`)}
                        >
                            <div className="mr-3">
                                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-slate-400 text-[10px] text-slate-500">
                                    A
                                </span>
                            </div>
                            Assignments
                        </Button>
                    </div>

                    {/* Quizzes Section */}
                    <div className="p-2 pt-0 space-y-1">
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Exams</h3>
                        {(useLMSStore.getState().quizzes?.[courseId] || []).map((quiz) => (
                            <Button
                                key={quiz.id}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start py-2 px-3 h-auto",
                                    // active state check could be added here
                                )}
                                onClick={() => router.push(`/lms/${courseId}/quiz/${quiz.id}`)}
                            >
                                <div className="mr-3">
                                    <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-orange-400 text-[10px] text-orange-600 font-bold">
                                        Q
                                    </span>
                                </div>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="truncate w-full text-sm">{quiz.title}</span>
                                </div>
                            </Button>
                        ))}

                        {user?.role === 'admin' && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-slate-400 hover:text-blue-600"
                                onClick={() => router.push(`/lms/${courseId}/quiz/create`)}
                            >
                                <Plus className="h-3 w-3 mr-2" /> New Exam
                            </Button>
                        )}
                    </div>
                </ScrollArea>

                <Dialog open={isCreateLessonOpen} onOpenChange={setIsCreateLessonOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Lesson</DialogTitle>
                            <DialogDescription>Add a new lesson to this course.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ltitle" className="text-right">Title</Label>
                                <Input id="ltitle" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ltype" className="text-right">Type</Label>
                                <Select value={newLessonType} onValueChange={(val: any) => setNewLessonType(val)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text (Article)</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="pdf">PDF Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ldur" className="text-right">Duration</Label>
                                <Input id="ldur" placeholder="e.g. 5 min" value={newLessonDuration} onChange={(e) => setNewLessonDuration(e.target.value)} className="col-span-3" />
                            </div>
                            {(newLessonType === 'video' || newLessonType === 'pdf') && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="lfile" className="text-right">File</Label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <Input
                                            id="lfile"
                                            type="file"
                                            accept={newLessonType === 'video' ? "video/*" : "application/pdf"}
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="hidden" // Hide the actual input
                                            ref={(input) => {
                                                // Create a stable ref if needed, or just ID usage. 
                                                // Actually for simplicity, we can just use label trigger or click handler.
                                                // But shadcn Input forwards ref, so we can't easily inline function ref like this if it wasn't designed for it.
                                                // Let's use a Label as the trigger or a separate button that clicks document.getElementById.
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => document.getElementById('lfile')?.click()}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Choose {newLessonType === 'video' ? 'Video' : 'PDF'}
                                        </Button>
                                        <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                            {selectedFile ? selectedFile.name : "No file chosen"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateLessonOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateLesson} disabled={isUploading}>
                                {isUploading ? "Uploading..." : "Add Lesson"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // Dashboard Context Sidebar
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">My Learning</h2>
            </div>
            <div className="p-2 space-y-1">
                <Button variant="secondary" className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Catalog
                </Button>
            </div>
        </div>
    );
}
