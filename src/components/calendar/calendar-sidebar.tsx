"use client";

import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CalendarSidebar() {
    const { selectedDate, setSelectedDate } = useCalendarStore();

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
            <div className="p-4">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white mb-4">
                    <Plus className="h-4 w-4 mr-2" /> Create Event
                </Button>

                <div className="bg-white dark:bg-slate-950 rounded-lg border shadow-sm p-2">
                    <Calendar
                        mode="single"
                        selected={new Date(selectedDate)}
                        onSelect={(date) => date && setSelectedDate(date.getTime())}
                        className="rounded-md border-none"
                    />
                </div>
            </div>
        </div>
    );
}
