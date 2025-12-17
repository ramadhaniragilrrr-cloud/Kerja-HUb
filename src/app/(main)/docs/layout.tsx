"use client";

import { ResizableShell } from "@/components/layout/resizable-shell";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export default function DocsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ResizableShell sidebar={<DocsSidebar />}>
            {children}
        </ResizableShell>
    );
}
