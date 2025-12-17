"use client";

import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
    const { events, selectedDate, setSelectedDate } = useCalendarStore();

    const currentMonthStart = startOfMonth(selectedDate);
    const currentMonthEnd = endOfMonth(selectedDate);

    const days = eachDayOfInterval({
        start: currentMonthStart,
        end: currentMonthEnd
    });

    // Simple Month View Implementation
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {format(selectedDate, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(selectedDate - 2629800000)}> {/* Approx 1 month */}
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(Date.now())}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(selectedDate + 2629800000)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                    <Button variant="ghost" size="sm" className="bg-white shadow-sm dark:bg-slate-800">Month</Button>
                    <Button variant="ghost" size="sm" className="text-slate-500">Week</Button>
                    <Button variant="ghost" size="sm" className="text-slate-500">Day</Button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-slate-200 dark:bg-slate-800 border-l border-b">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="bg-white dark:bg-slate-950 p-2 text-center text-xs font-semibold text-slate-500 border-t">
                        {day}
                    </div>
                ))}

                {/* Padding for empty days at start would go here, simplified for now */}

                {days.map((day) => {
                    const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "bg-white dark:bg-slate-950 p-2 min-h-[100px] hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer",
                                isToday(day) && "bg-blue-50 dark:bg-slate-900"
                            )}
                            onClick={() => setSelectedDate(day.getTime())}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                    isToday(day)
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-700 dark:text-slate-300"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="mt-1 space-y-1">
                                {dayEvents.map(ev => (
                                    <div key={ev.id} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded truncate border-l-2 border-blue-500">
                                        {ev.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
