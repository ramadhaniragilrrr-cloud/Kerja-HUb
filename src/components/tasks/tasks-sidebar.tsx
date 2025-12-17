"use client";

import { useTaskStore } from "@/lib/store/useTaskStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, List, Star } from "lucide-react";

export function TasksSidebar() {
    const { filter, setFilter } = useTaskStore();

    const filters = [
        { id: 'all', label: 'My Tasks', icon: List },
        { id: 'today', label: 'Today', icon: Calendar },
        { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    ] as const;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Tasks</h2>
            </div>
            <div className="p-2 space-y-1">
                {filters.map((f) => (
                    <Button
                        key={f.id}
                        variant={filter === f.id ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start",
                            filter === f.id && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        )}
                        onClick={() => setFilter(f.id)}
                    >
                        <f.icon className="h-4 w-4 mr-2" />
                        {f.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
