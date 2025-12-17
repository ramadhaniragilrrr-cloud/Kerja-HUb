"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const checkSession = useAuthStore((state) => state.checkSession);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // If session exists, we should ensure our store is in sync
            if (session?.user && event === 'INITIAL_SESSION') {
                checkSession();
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkSession();
            } else if (event === 'SIGNED_OUT') {
                useAuthStore.getState().logout();
            }
        });

        checkSession();

        return () => {
            subscription.unsubscribe();
        };
    }, [checkSession]);

    return <>{children}</>;
}
