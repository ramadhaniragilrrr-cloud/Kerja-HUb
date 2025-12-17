"use client";

import * as React from "react";
import { MessageSquare, FileText, Calendar, Video, CheckSquare, Settings, LogOut, GraduationCap, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = React.useState("dashboard");
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const navItems = [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { id: "messenger", icon: MessageSquare, label: "Messenger", path: "/messenger" },
        { id: "docs", icon: FileText, label: "Docs", path: "/docs" },
        { id: "calendar", icon: Calendar, label: "Calendar", path: "/calendar" },
        { id: "tasks", icon: CheckSquare, label: "Tasks", path: "/tasks" },
        { id: "lms", icon: GraduationCap, label: "LMS", path: "/lms" },
    ];

    // Sync active tab with pathname
    React.useEffect(() => {
        if (pathname === '/') setActiveTab('dashboard');
        else if (pathname.startsWith('/messenger')) setActiveTab('messenger');
        else if (pathname.startsWith('/docs')) setActiveTab('docs');
        else if (pathname.startsWith('/calendar')) setActiveTab('calendar');
        else if (pathname.startsWith('/tasks')) setActiveTab('tasks');
        else if (pathname.startsWith('/lms')) setActiveTab('lms');
    }, [pathname]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className={cn("hidden md:flex flex-col w-[70px] bg-slate-100 dark:bg-slate-900 h-full border-r items-center py-4 gap-4", className)}>
            {/* User Verification / Profile (Top) */}
            <div className="mb-2 flex flex-col items-center">
                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/settings')}>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "CN"}</AvatarFallback>
                </Avatar>
                {user?.role === 'admin' && (
                    <span className="mt-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                        ADMIN
                    </span>
                )}
            </div>

            {/* Main Navigation */}
            <div className="flex flex-col gap-2 w-full px-2">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => (
                        <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={activeTab === item.id ? "secondary" : "ghost"}
                                    size="icon"
                                    className={cn(
                                        "w-full h-12 rounded-xl transition-all duration-200",
                                        activeTab === item.id
                                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400"
                                            : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                                    )}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        router.push(item.path);
                                    }}
                                >
                                    <item.icon className="h-6 w-6" />
                                    <span className="sr-only">{item.label}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>

            <div className="mt-auto flex flex-col gap-2 w-full px-2">
                {/* Bottom Actions */}
                <TooltipProvider delayDuration={0}>
                    {/* General Settings */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-12 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                                onClick={() => router.push('/settings')}
                            >
                                <Settings className="h-6 w-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Settings</TooltipContent>
                    </Tooltip>

                    {/* Admin Panel (if needed separate, or just use settings) */}
                    {user?.role === 'admin' && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button component-link="/team" variant="ghost" size="icon" className="w-full h-12 rounded-xl text-amber-600 hover:bg-amber-50" onClick={() => router.push('/team')}>
                                    <span className="font-bold text-xs border border-amber-500 rounded px-1">ADM</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Admin Panel</TooltipContent>
                        </Tooltip>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-full h-12 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50" onClick={handleLogout}>
                                <LogOut className="h-6 w-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Logout</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
