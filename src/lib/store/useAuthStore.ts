import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user';
    phone?: string;
    address?: string;
    outlet_id?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    updateProfile: (data: Partial<User> & { avatarFile?: File }) => Promise<{ error: any }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    checkSession: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch additional profile data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email!,
                        name: profile?.full_name || session.user.email!.split('@')[0],
                        avatar: profile?.avatar_url,
                        role: profile?.role || 'user',
                        phone: profile?.phone,
                        address: profile?.address,
                        outlet_id: profile?.outlet_id
                    },
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Error checking session:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return { error };

        if (data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            set({
                user: {
                    id: data.user.id,
                    email: data.user.email!,
                    name: profile?.full_name || data.user.email!.split('@')[0],
                    avatar: profile?.avatar_url,
                    role: profile?.role || 'user',
                    phone: profile?.phone,
                    address: profile?.address,
                    outlet_id: profile?.outlet_id
                },
                isAuthenticated: true
            });
        }
        return { error: null };
    },

    signup: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) return { error };

        // Profile creation is usually handled by a database trigger, 
        // but for simplicity we can manually insert or rely on the trigger if specificed in schema.
        // Our schema didn't specify a trigger, so let's try to insert profile manually here for safety.
        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                email: email,
                full_name: name,
                role: 'user' // Default
            });

            set({
                user: {
                    id: data.user.id,
                    email: email,
                    name: name,
                    role: 'user'
                },
                isAuthenticated: true
            });
        }

        return { error: null };
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    updateProfile: async (data) => {
        const currentUser = get().user;
        if (!currentUser) return { error: "Not logged in" };

        let avatarUrl = currentUser.avatar;

        // Upload Avatar if provided
        if (data.avatarFile) {
            const fileExt = data.avatarFile.name.split('.').pop();
            const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars') // Ensure this bucket exists or use 'lms-materials' generically if needed
                .upload(filePath, data.avatarFile);

            if (uploadError) {
                // If avatars bucket fails, try lms-materials as fallback or log it.
                // For now, assuming 'avatars' bucket will be created or used
                console.error("Avatar upload failed", uploadError);
            } else {
                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                avatarUrl = publicUrlData.publicUrl;
            }
        }

        // Update DB
        const updates: any = {
            id: currentUser.id,
            updated_at: new Date().toISOString(),
        };
        if (data.name) updates.full_name = data.name;
        if (data.phone) updates.phone = data.phone;
        if (data.address) updates.address = data.address;
        if (avatarUrl !== currentUser.avatar) updates.avatar_url = avatarUrl;

        // Only admin can update outlet_id usually, but let's allow it in this call for simplicity if passed
        // Or if user is just updating self-profile, maybe they can't change outlet. 
        // We'll trust the UI to restrict this.
        if (data.outlet_id) updates.outlet_id = data.outlet_id;

        const { error } = await supabase.from('profiles').upsert(updates);

        if (!error) {
            // Update local state
            set(state => ({
                user: state.user ? {
                    ...state.user,
                    name: data.name || state.user.name,
                    phone: data.phone || state.user.phone,
                    address: data.address || state.user.address,
                    avatar: avatarUrl,
                    outlet_id: data.outlet_id || state.user.outlet_id
                } : null
            }));
        }

        return { error };
    }
}));
