"use client";

import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "@/components/layout/sidebar";
import { SecondarySidebar } from "@/components/layout/secondary-sidebar";
import { cn } from "@/lib/utils";

interface MainResizableLayoutProps {
    children: React.ReactNode;
    defaultLayout?: number[];
    navCollapsedSize?: number;
}

export function MainResizableLayout({
    children,
    defaultLayout = [4, 20, 76], // roughly 70px, 20%, rest
    navCollapsedSize = 4,
}: MainResizableLayoutProps) {
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="h-full items-stretch"
        >
            {/* Icon Rail (Main Sidebar) - Fixedish width via min/max size or locked */}
            <ResizablePanel
                defaultSize={defaultLayout[0]}
                collapsedSize={navCollapsedSize}
                collapsible={false}
                minSize={4}
                maxSize={4}
                className={cn("min-w-[70px] max-w-[70px] border-r transition-all duration-300 ease-in-out border-none")}
            >
                <Sidebar className="w-full" />
            </ResizablePanel>

            {/* Secondary Sidebar (List) */}
            <ResizablePanel
                defaultSize={defaultLayout[1]}
                minSize={15}
                maxSize={30}
                className="min-w-[250px]"
            >
                <SecondarySidebar />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Main Content */}
            <ResizablePanel defaultSize={defaultLayout[2]}>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
