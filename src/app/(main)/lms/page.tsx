"use client";

import { useState, useEffect } from "react";
import { useLMSStore } from "@/lib/store/useLMSStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlayCircle, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LMSDashboardPage() {
    const { courses, createCourse, loadCourses } = useLMSStore();
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [newCourseDesc, setNewCourseDesc] = useState("");
    const [newCourseInstructor, setNewCourseInstructor] = useState("");
    const [newCourseThumbnail, setNewCourseThumbnail] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleCourseClick = (courseId: string) => {
        router.push(`/lms/${courseId}`);
    };

    const handleCreateCourse = async () => {
        await createCourse({
            title: newCourseTitle,
            description: newCourseDesc,
            instructor: newCourseInstructor,
            thumbnail: newCourseThumbnail
        });
        setIsCreateOpen(false);
        setNewCourseTitle("");
        setNewCourseDesc("");
        setNewCourseInstructor("");
        setNewCourseThumbnail("");
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            <div className="p-8 max-w-6xl mx-auto w-full">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Learning</h1>
                        <p className="text-slate-500">Track your progress and learn new skills.</p>
                    </div>
                    {user?.role === 'admin' && (
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> New Course
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                            onClick={() => handleCourseClick(course.id)}
                        >
                            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                {course.thumbnail && course.thumbnail !== "/placeholder-course.jpg" ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                        <PlayCircle className="h-12 w-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                            <CardHeader className="p-4">
                                <h3 className="font-semibold text-lg leading-tight mb-1">{course.title}</h3>
                                <p className="text-sm text-slate-500 mb-2">by {course.instructor}</p>
                            </CardHeader>
                            <CardContent className="px-4 pb-2">
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[40px]">
                                    {course.description}
                                </p>
                            </CardContent>
                            <CardFooter className="px-4 pb-4 pt-2 flex flex-col gap-2">
                                <div className="w-full flex justify-between text-xs text-slate-500 mb-1">
                                    <span>{Math.round(course.progress)}% Complete</span>
                                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
            {/* Create Course Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Course</DialogTitle>
                        <DialogDescription>Add a new course to the LMS.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">Description</Label>
                            <Input id="desc" value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="inst" className="text-right">Instructor</Label>
                            <Input id="inst" value={newCourseInstructor} onChange={(e) => setNewCourseInstructor(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="thumb" className="text-right">Thumbnail</Label>
                            <div className="col-span-3 space-y-2">
                                {newCourseThumbnail && (
                                    <div className="w-full h-32 relative rounded-md overflow-hidden border">
                                        <img src={newCourseThumbnail} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => document.getElementById('thumb')?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? "Uploading..." : "Upload Cover Image"}
                                    </Button>
                                    <Input
                                        id="thumb"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setIsUploading(true);
                                                const { uploadLessonContent } = useLMSStore.getState();
                                                const { publicUrl, error } = await uploadLessonContent(file);
                                                setIsUploading(false);
                                                if (error) {
                                                    alert("Upload failed: " + error.message);
                                                } else if (publicUrl) {
                                                    setNewCourseThumbnail(publicUrl);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCourse}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
