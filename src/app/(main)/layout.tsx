import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
    title: "Lark Clone",
    description: "A clone of the Lark collaboration suite",
};

import { MobileNav } from "@/components/layout/mobile-nav";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <div className="flex h-screen overflow-hidden bg-background font-sans antialiased text-slate-900 dark:text-slate-50">
                <Sidebar />
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center p-4 border-b bg-white dark:bg-slate-950">
                        <MobileNav />
                        <span className="ml-4 font-semibold text-lg">Kerja Hub</span>
                    </div>
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
