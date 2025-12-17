import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: 'admin' | 'user';
    created_at: string;
    outlet_id?: string;
    phone?: string;
    address?: string;
}

export interface Outlet {
    id: string;
    name: string;
    address: string;
    phone: string;
}

interface TeamState {
    users: UserProfile[];
    outlets: Outlet[];
    isLoading: boolean;
    error: string | null;
    loadUsers: () => Promise<void>;
    updateUser: (id: string, updates: Partial<UserProfile>) => Promise<{ error: any }>;
    loadOutlets: () => Promise<void>;
    createOutlet: (outlet: Partial<Outlet>) => Promise<{ error: any }>;
    deleteOutlet: (id: string) => Promise<{ error: any }>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
    users: [],
    outlets: [],
    isLoading: false,
    error: null,

    loadUsers: async () => {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            set({ error: error.message, isLoading: false });
        } else {
            set({ users: data as UserProfile[], isLoading: false });
        }
    },

    updateUser: async (id, updates) => {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);

        if (!error) {
            set((state) => ({
                users: state.users.map((user) =>
                    user.id === id ? { ...user, ...updates } : user
                )
            }));
        }

        return { error };
    },

    loadOutlets: async () => {
        const { data, error } = await supabase
            .from('outlets')
            .select('*')
            .order('name', { ascending: true });

        if (!error && data) {
            set({ outlets: data as Outlet[] });
        }
    },

    createOutlet: async (outlet) => {
        const { error } = await supabase.from('outlets').insert(outlet);
        if (!error) {
            await get().loadOutlets();
        }
        return { error };
    },

    deleteOutlet: async (id) => {
        const { error } = await supabase.from('outlets').delete().eq('id', id);
        if (!error) {
            set(state => ({ outlets: state.outlets.filter(o => o.id !== id) }));
        }
        return { error };
    }
}));
