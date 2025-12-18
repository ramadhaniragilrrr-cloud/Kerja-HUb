"use client";

import { useLMSStore } from "@/lib/store/useLMSStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, PlayCircle, CheckCircle, LayoutDashboard, Plus, Trash2, Edit } from "lucide-react";
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
    const { courses, lessons, loadQuizzes, createLesson, updateLesson, deleteLesson, deleteQuiz, updateQuiz } = useLMSStore();
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
    const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonType, setNewLessonType] = useState<"video" | "text" | "pdf">("text");
    const [newLessonDuration, setNewLessonDuration] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
    const [quizTitle, setQuizTitle] = useState("");

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

    const handleEditLesson = async () => {
        if (!editingLessonId) return;
        setIsUploading(true);

        let contentUrl = ""; // Should ideally fetch existing content if not replaced

        if (selectedFile && (newLessonType === 'video' || newLessonType === 'pdf')) {
            const { publicUrl, error } = await useLMSStore.getState().uploadLessonContent(selectedFile);
            if (error) {
                alert(`Upload failed: ${error.message}`);
                setIsUploading(false);
                return;
            }
            contentUrl = publicUrl || "";
        }

        const updates: any = {
            title: newLessonTitle,
            type: newLessonType,
            duration: newLessonDuration
        };
        if (contentUrl) updates.content = contentUrl;

        const { error } = await updateLesson(editingLessonId, updates);
        if (error) {
            alert("Failed to update lesson");
        }
        setIsEditLessonOpen(false);
        setIsUploading(false);
        setEditingLessonId(null);
    };

    const handleDeleteLesson = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this lesson?")) {
            await deleteLesson(id, courseId);
        }
    };

    const handleDeleteQuiz = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this exam?")) {
            await deleteQuiz(id, courseId);
        }
    };
    
    const openEditLesson = (lesson: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setNewLessonTitle(lesson.title);
        setNewLessonType(lesson.type);
        setNewLessonDuration(lesson.duration);
        setEditingLessonId(lesson.id);
        setIsEditLessonOpen(true);
    };

    const openEditQuiz = (quiz: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setQuizTitle(quiz.title);
        setEditingQuizId(quiz.id);
        setIsEditQuizOpen(true);
    };

    const handleUpdateQuiz = async () => {
        if (!editingQuizId) return;
        await updateQuiz(editingQuizId, { title: quizTitle });
        setIsEditQuizOpen(false);
        setEditingQuizId(null);
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
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                                setNewLessonTitle("");
                                setNewLessonDuration("");
                                setIsCreateLessonOpen(true);
                            }}>
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
                            <div key={lesson.id} className="group relative flex items-center">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-auto py-3 px-3 pr-16", // padding for buttons
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
                                {user?.role === 'admin' && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-900 shadow-sm rounded-md p-0.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => openEditLesson(lesson, e)}>
                                            <Edit className="h-3 w-3 text-slate-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600" onClick={(e) => handleDeleteLesson(lesson.id, e)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Assignments (Skipped for brevity as requested only content/exams, but kept structure) */}
                    <div className="p-2 pt-0">
                         {/* ... */}
                    </div>

                    {/* Quizzes Section */}
                    <div className="p-2 pt-0 space-y-1">
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Exams</h3>
                        {(useLMSStore.getState().quizzes?.[courseId] || []).map((quiz) => (
                            <div key={quiz.id} className="group relative flex items-center">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start py-2 px-3 h-auto pr-16",
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
                                {user?.role === 'admin' && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-900 shadow-sm rounded-md p-0.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => openEditQuiz(quiz, e)}>
                                            <Edit className="h-3 w-3 text-slate-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600" onClick={(e) => handleDeleteQuiz(quiz.id, e)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
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

                {/* Create Lesson Dialog */}
                <Dialog open={isCreateLessonOpen} onOpenChange={setIsCreateLessonOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Lesson</DialogTitle>
                            <DialogDescription>Add a new lesson to this course.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                             {/* ... (Same inputs as before) ... */}
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
                                            className="hidden" 
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

                {/* Edit Lesson Dialog */}
                <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Lesson</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="etitle" className="text-right">Title</Label>
                                <Input id="etitle" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="etype" className="text-right">Type</Label>
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
                                <Label htmlFor="edur" className="text-right">Duration</Label>
                                <Input id="edur" placeholder="e.g. 5 min" value={newLessonDuration} onChange={(e) => setNewLessonDuration(e.target.value)} className="col-span-3" />
                            </div>
                             {(newLessonType === 'video' || newLessonType === 'pdf') && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="efile" className="text-right">File</Label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <Input
                                            id="efile"
                                            type="file"
                                            accept={newLessonType === 'video' ? "video/*" : "application/pdf"}
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="hidden" 
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => document.getElementById('efile')?.click()}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Replace {newLessonType === 'video' ? 'Video' : 'PDF'}
                                        </Button>
                                        <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                            {selectedFile ? selectedFile.name : "Keep existing file"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditLessonOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditLesson} disabled={isUploading}>
                                {isUploading ? "Updating..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Quiz Dialog (Title only for now) */}
                <Dialog open={isEditQuizOpen} onOpenChange={setIsEditQuizOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Exam Title</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="qtitle" className="text-right">Title</Label>
                                <Input id="qtitle" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditQuizOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateQuiz}>Save Changes</Button>
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
