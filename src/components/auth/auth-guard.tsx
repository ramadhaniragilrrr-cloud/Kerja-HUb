"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const isDisabled = (process.env.NEXT_PUBLIC_DISABLE_AUTH_GUARD || '').toLowerCase() === 'true';

    useEffect(() => {
        if (isDisabled) {
            setIsChecking(false);
            return;
        }
        if (!isLoading) {
            setIsChecking(false);
            if (!isAuthenticated) {
                router.push("/login");
            }
        }
    }, [isLoading, isAuthenticated, router, isDisabled]);

    if ((isLoading && !isDisabled) || isChecking) {
        // Simple loading spinner
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isDisabled && !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
