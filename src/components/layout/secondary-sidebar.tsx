"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SecondarySidebar() {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8 bg-white dark:bg-slate-950" />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 text-sm text-slate-500 text-center mt-10">
                    Select a module to view content
                </div>
            </ScrollArea>
        </div>
    );
}
