"use client";

import { useState } from "react";
import { useLMSStore } from "@/lib/store/useLMSStore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Save, Trash } from "lucide-react";

export default function QuizCreatePage() {
    const { createQuiz } = useLMSStore();
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(30);

    const handleCreate = async () => {
        const { error } = await createQuiz({
            course_id: params.courseId,
            title,
            description,
            time_limit_minutes: duration,
            passing_score: 70
        });

        if (error) {
            alert(`Failed to create exam: ${error.message}`);
            return;
        }

        router.push(`/lms/${params.courseId}`);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-2xl mx-auto w-full space-y-6">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-500">
                        ← Back
                    </Button>
                    <h1 className="text-2xl font-bold">Create New Exam</h1>
                    <p className="text-slate-500">Set up the details for the new examination.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Exam Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Exam Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mid-term Exam" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dur">Duration (minutes)</Label>
                            <Input id="dur" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleCreate}>Create Exam</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
