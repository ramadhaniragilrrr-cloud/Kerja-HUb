"use client";

import { useLMSStore } from "@/lib/store/useLMSStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Clock, Award, Plus, Trash, PlayCircle, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function QuizPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const quizId = params.quizId as string;

    const { quizzes, loadQuizzes, submitQuiz, createQuestion, deleteQuiz } = useLMSStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Quiz State
    const [hasStarted, setHasStarted] = useState(false); // New: Start Screen State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Admin State
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [newQText, setNewQText] = useState("");
    const [newQOptions, setNewQOptions] = useState(["", "", "", ""]);
    const [newQCorrect, setNewQCorrect] = useState(0);

    const quiz = (quizzes[courseId] || []).find(q => q.id === quizId);

    // Using local state for questions to enable immediate feedback on add/delete
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (!quiz) {
            loadQuizzes(courseId).then(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            if (questions.length === 0) {
                // Initial Mock Data or Fetch
                setQuestions([
                    { id: "q1", question_text: "What is the capital of Indonesia?", options: ["Bali", "Jakarta", "Surabaya", "Bandung"], correct_option_index: 1 },
                    { id: "q2", question_text: "What does React use to update the UI?", options: ["Real DOM", "Shadow DOM", "Virtual DOM", "Magic"], correct_option_index: 2 },
                ]);
            }
        }
    }, [quiz, courseId, loadQuizzes]);

    // Timer Logic - Starts only when hasStarted is true
    const handleStartQuiz = () => {
        setHasStarted(true);
        if (quiz?.time_limit_minutes) {
            setTimeLeft(quiz.time_limit_minutes * 60);
        }
    };

    useEffect(() => {
        if (!hasStarted || timeLeft === null || isSubmitted) return;

        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [hasStarted, timeLeft, isSubmitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (optionIndex: number) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitted) return;

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct_option_index) {
                correctCount++;
            }
        });
        const finalScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
        setScore(finalScore);
        setIsSubmitted(true);

        await submitQuiz(quizId, finalScore);
    };

    const handleAddQuestion = async () => {
        if (!newQText || newQOptions.some(o => !o)) {
            alert("Please fill in all fields.");
            return;
        }

        const newQuestion = {
            id: Math.random().toString(36).substring(7),
            quiz_id: quizId,
            question_text: newQText,
            options: newQOptions,
            correct_option_index: newQCorrect
        };

        setQuestions([...questions, newQuestion]);

        await createQuestion({
            quiz_id: quizId,
            question_text: newQText,
            options: newQOptions,
            correct_option_index: newQCorrect
        });

        setIsAddingQuestion(false);
        setNewQText("");
        setNewQOptions(["", "", "", ""]);
        setNewQCorrect(0);
    };

    const handleDeleteQuestion = (indexToDelete: number) => {
        if (confirm("Are you sure you want to delete this question?")) {
            const updatedQuestions = questions.filter((_, idx) => idx !== indexToDelete);
            setQuestions(updatedQuestions);
            // In a real app, delete from DB here
        }
    };

    const handleQuizDelete = async () => {
        if (confirm("Are you sure you want to DELETE this entire exam? This action cannot be undone.")) {
            const { error } = await deleteQuiz(quizId, courseId);
            if (error) {
                alert("Failed to delete quiz: " + error.message);
            } else {
                router.push(`/lms/${courseId}`);
            }
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!quiz) return <div className="p-10">Quiz not found.</div>;

    // Start Screen
    if (!hasStarted && !isSubmitted) {
        return (
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-8 items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
                        <CardDescription className="text-lg">{quiz.description || "No description provided."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <span className="block text-slate-500 text-sm uppercase tracking-wide">Time Limit</span>
                                <span className="text-xl font-bold flex items-center justify-center gap-2">
                                    <Clock className="h-5 w-5" /> {quiz.time_limit_minutes} Mins
                                </span>
                            </div>
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <span className="block text-slate-500 text-sm uppercase tracking-wide">Questions</span>
                                <span className="text-xl font-bold flex items-center justify-center gap-2">
                                    <AlertCircle className="h-5 w-5" /> {questions.length} Items
                                </span>
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
                            <strong>Note:</strong> Once you start, the timer will begin immediately. You cannot pause the exam.
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="w-full text-lg h-12" onClick={handleStartQuiz}>
                            Start Quiz Now <PlayCircle className="ml-2 h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* Admin Management Panel (Available even before start) */}
                {user?.role === 'admin' && (
                    <div className="w-full max-w-2xl mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-700">Admin: Manage Questions</h3>
                            <Button variant="outline" size="sm" onClick={() => setIsAddingQuestion(!isAddingQuestion)}>
                                {isAddingQuestion ? "Cancel" : "Add New Question"}
                            </Button>
                        </div>

                        {isAddingQuestion && (
                            <Card className="border-dashed border-2 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-base">New Question Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Question Text</Label>
                                        <Input value={newQText} onChange={(e) => setNewQText(e.target.value)} placeholder="Enter question here..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Options</Label>
                                        {newQOptions.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`h-4 w-4 rounded-full border cursor-pointer ${newQCorrect === i ? 'bg-green-500 border-green-500' : 'border-slate-300'}`} onClick={() => setNewQCorrect(i)} title="Mark as correct" />
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...newQOptions];
                                                        newOpts[i] = e.target.value;
                                                        setNewQOptions(newOpts);
                                                    }}
                                                    placeholder={`Option ${i + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleAddQuestion} className="w-full">Save Question</Button>
                                </CardFooter>
                            </Card>
                        )}

                        <div className="space-y-2">
                            {questions.map((q, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                                    <span className="truncate flex-1 font-medium text-sm">{idx + 1}. {q.question_text}</span>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteQuestion(idx)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <Award className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                        <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                        <CardDescription>You have finished {quiz.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2">{score}%</div>
                        <p className={score >= quiz.passing_score ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {score >= quiz.passing_score ? "Passed" : "Failed - Try Again"}
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button onClick={() => router.push(`/lms/${courseId}`)}>Return to Course</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full space-y-6 flex-1">
                <div className="flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 py-2">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
                        <div className="flex items-center text-slate-500 text-sm gap-4">
                            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        </div>
                    </div>
                    {/* Timer Display */}
                    <div className={`text-xl font-mono font-bold flex items-center px-4 py-2 rounded-lg border ${timeLeft && timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-slate-200'
                        }`}>
                        <Clock className="h-5 w-5 mr-2" />
                        {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                    </div>
                </div>

                <Card className="w-full min-h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium leading-relaxed">
                            {currentQuestion ? currentQuestion.question_text : "No questions yet."}
                        </CardTitle>
                    </CardHeader>
                    {currentQuestion && ( // Fixed logic check for empty questions
                        <CardContent className="flex-1 space-y-3">
                            {currentQuestion.options.map((option: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[currentQuestionIndex] === idx
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-slate-200 hover:border-blue-300"
                                        }`}
                                    onClick={() => handleOptionSelect(idx)}
                                >
                                    <div className="flex items-center">
                                        <div className={`h-6 w-6 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestionIndex] === idx ? "border-blue-600" : "border-slate-300"
                                            }`}>
                                            {answers[currentQuestionIndex] === idx && <div className="h-3 w-3 rounded-full bg-blue-600" />}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    )}
                    <CardFooter className="flex justify-between border-t p-6 bg-slate-50 dark:bg-slate-950/50">
                        <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                            Previous
                        </Button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white" disabled={!questions.length}>
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button onClick={handleNext} disabled={!questions.length}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
