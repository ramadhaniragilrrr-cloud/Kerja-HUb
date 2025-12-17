"use client";

import { ResizableShell } from "@/components/layout/resizable-shell";
import { TasksSidebar } from "@/components/tasks/tasks-sidebar";

export default function TasksLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ResizableShell sidebar={<TasksSidebar />}>
            {children}
        </ResizableShell>
    );
}
