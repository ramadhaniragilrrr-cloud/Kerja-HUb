import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender?: { name: string; avatar_url: string };
}

export interface Chat {
    id: string;
    name: string;
    is_group: boolean;
    type: 'private' | 'group' | 'announcement';
    participants: string[];
    lastMessage?: string;
    updatedAt?: number;
}

interface ChatState {
    chats: Chat[];
    activeChatId: string | null;
    messages: Record<string, Message[]>;
    isLoading: boolean;

    loadChats: () => Promise<void>;
    setActiveChat: (id: string) => void;
    sendMessage: (chatId: string, content: string) => Promise<void>;
    subscribeToChat: (chatId: string) => void;
    unsubscribeFromChat: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    activeChatId: null,
    messages: {},
    isLoading: false,

    loadChats: async () => {
        set({ isLoading: true });
        const user = useAuthStore.getState().user;
        if (!user) return;

        // 1. Get chats user is participant of
        const { data: participation } = await supabase
            .from('chat_participants')
            .select('chat_id')
            .eq('user_id', user.id);

        let chatIds = participation ? participation.map(p => p.chat_id) : [];

        // 2. Get announcement chats (visible to everyone)
        const { data: announcements } = await supabase
            .from('chats')
            .select('id')
            .eq('type', 'announcement');

        if (announcements) {
            chatIds = [...chatIds, ...announcements.map(a => a.id)];
        }

        // Remove duplicates
        chatIds = Array.from(new Set(chatIds));

        if (chatIds.length === 0) {
            set({ chats: [], isLoading: false });
            return;
        }

        // 3. Get chat details
        const { data: chats } = await supabase
            .from('chats')
            .select('*')
            .in('id', chatIds);

        set({ chats: chats as any[] || [], isLoading: false });
    },

    setActiveChat: async (id) => {
        set({ activeChatId: id });
        const { data: messages } = await supabase
            .from('messages')
            .select('*, sender:sender_id(full_name, avatar_url)')
            .eq('chat_id', id)
            .order('created_at', { ascending: true });

        set((state) => ({
            messages: { ...state.messages, [id]: messages as any[] || [] }
        }));

        get().subscribeToChat(id);
    },

    sendMessage: async (chatId, content) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        await supabase.from('messages').insert({
            chat_id: chatId,
            sender_id: user.id,
            content: content
        });
        // Realtime subscription will handle the UI update
    },

    subscribeToChat: (chatId) => {
        // Clean up previous subscription if any (simplified)
        supabase.removeAllChannels();

        supabase
            .channel(`chat:${chatId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`
            }, async (payload) => {
                // Fetch sender details (or optimise to send in payload)
                const { data: sender } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', payload.new.sender_id)
                    .single();

                const newMessage = {
                    ...payload.new,
                    sender: sender
                };

                set((state) => ({
                    messages: {
                        ...state.messages,
                        [chatId]: [...(state.messages[chatId] || []), newMessage as any]
                    }
                }));
            })
            .subscribe();
    },

    unsubscribeFromChat: (chatId) => {
        supabase.removeAllChannels(); // simplistic for now
    }
}));
