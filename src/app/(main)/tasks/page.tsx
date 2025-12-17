"use client";

import { useTaskStore } from "@/lib/store/useTaskStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
    const { tasks, filter, addTask, toggleTask, deleteTask } = useTaskStore();
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const filteredTasks = tasks.filter((t) => {
        if (filter === 'completed') return t.completed;
        if (filter === 'today') return !t.completed; // Simplified for now
        return true; // all
    });

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle);
        setNewTaskTitle("");
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            <div className="p-8 max-w-4xl mx-auto w-full h-full flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                        {filter === 'all' ? 'My Tasks' : filter}
                    </h1>
                    <p className="text-slate-500">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Add Task Input */}
                <form onSubmit={handleAddTask} className="mb-8 flex gap-2">
                    <div className="flex-1 relative">
                        <Plus className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                            className="pl-10 h-12 text-lg border-none bg-slate-100 dark:bg-slate-900 focus-visible:ring-0 rounded-lg"
                            placeholder="Add a task"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        Add Task
                    </Button>
                </form>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredTasks.length === 0 && (
                        <div className="text-center text-slate-400 mt-10">No tasks found</div>
                    )}
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="group flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors border-b border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(task.id)}
                                    className="h-5 w-5 rounded-full border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className={cn(
                                        "text-base cursor-pointer select-none transition-all",
                                        task.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                                    )}
                                >
                                    {task.title}
                                </label>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            >
                                Delete
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
