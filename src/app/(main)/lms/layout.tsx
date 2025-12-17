"use client";

import { ResizableShell } from "@/components/layout/resizable-shell";
import { LMSSidebar } from "@/components/lms/lms-sidebar";

export default function LMSLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ResizableShell sidebar={<LMSSidebar />}>
            {children}
        </ResizableShell>
    );
}
