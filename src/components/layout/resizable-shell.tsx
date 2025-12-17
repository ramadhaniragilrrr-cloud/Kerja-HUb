"use client";

import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface ResizableShellProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    defaultLayout?: number[];
}

export function ResizableShell({
    children,
    sidebar,
    defaultLayout = [25, 75],
}: ResizableShellProps) {
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="h-full items-stretch"
        >
            {/* Secondary Sidebar (Module Specific) */}
            <ResizablePanel
                defaultSize={defaultLayout[0]}
                minSize={20}
                maxSize={40}
                className="min-w-[250px] border-r"
            >
                {sidebar}
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Main Content */}
            <ResizablePanel defaultSize={defaultLayout[1]}>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
