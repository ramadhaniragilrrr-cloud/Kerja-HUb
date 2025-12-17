"use client";

import { ResizableShell } from "@/components/layout/resizable-shell";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";

export default function CalendarLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ResizableShell sidebar={<CalendarSidebar />}>
            {children}
        </ResizableShell>
    );
}
