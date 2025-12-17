"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLMSStore } from "@/lib/store/useLMSStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

export default function AssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const assignmentId = params.assignmentId as string;
    const { assignments, submitAssignment } = useLMSStore();

    const assignment = assignments[courseId]?.find(a => a.id === assignmentId);

    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setSubmitting(true);
        const { error } = await submitAssignment(assignmentId, content);
        setSubmitting(false);
        if (!error) {
            setSubmitted(true);
        }
    };

    if (!assignment) {
        return <div className="p-6">Assignment not found</div>;
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{assignment.title}</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
                {/* Details */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {assignment.points} Points
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due {assignment.due_date ? format(new Date(assignment.due_date), "PPP p") : "No due date"}
                        </span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                        <p>{assignment.description}</p>
                    </div>
                </div>

                {/* Submission Area */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Your Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-10 text-green-600 bg-green-50 rounded-lg">
                                <h3 className="text-lg font-bold">Assignment Submitted!</h3>
                                <p className="text-sm">You can re-submit if needed.</p>
                                <Button variant="link" onClick={() => setSubmitted(false)}>Submit again</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Type your answer or paste a link to your work..."
                                    className="min-h-[200px]"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>
                                        {submitting ? "Submitting..." : "Submit Assignment"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
