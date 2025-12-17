"use client";

import { useParams, useRouter } from "next/navigation";
import { useLMSStore } from "@/lib/store/useLMSStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AssignmentListPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { assignments } = useLMSStore();

    const courseAssignments = assignments[courseId] || [];

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">Assignments</h1>
                <p className="text-slate-500">View and submit your course work.</p>
            </div>

            <div className="p-6 overflow-y-auto">
                {courseAssignments.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No assignments found for this course.
                    </div>
                )}

                <div className="grid gap-4">
                    {courseAssignments.map((assignment) => (
                        <Card
                            key={assignment.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/lms/${courseId}/assignments/${assignment.id}`)}
                        >
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        {assignment.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                                </div>
                                <div className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                    {assignment.points} pts
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-slate-500 gap-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Due {assignment.due_date ? format(new Date(assignment.due_date), "PPP") : "No due date"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
