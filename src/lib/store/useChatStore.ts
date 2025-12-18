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
    users: { id: string; full_name: string; avatar_url?: string; email?: string }[];

    loadChats: () => Promise<void>;
    setActiveChat: (id: string) => void;
    sendMessage: (chatId: string, content: string) => Promise<void>;
    subscribeToChat: (chatId: string) => void;
    unsubscribeFromChat: (chatId: string) => void;
    loadUsers: () => Promise<void>;
    createPrivateChat: (otherUserId: string) => Promise<{ chatId?: string; error: any }>;
    createAnnouncementChat: () => Promise<{ chatId?: string; error: any }>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    activeChatId: null,
    messages: {},
    isLoading: false,
    users: [],

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

        // 3. Get chat details AND participants to ensure dynamic naming works
        const { data: chats } = await supabase
            .from('chats')
            .select('*, chat_participants(user_id)')
            .in('id', chatIds);

        if (!chats) {
            set({ chats: [], isLoading: false });
            return;
        }

        // 4. Resolve Dynamic Names for Private Chats
        const updatedChats = await Promise.all(chats.map(async (chat: any) => {
            // Ensure participants array is populated from relation if needed
            if (!chat.participants && chat.chat_participants) {
                chat.participants = chat.chat_participants.map((p: any) => p.user_id);
            }

            if (chat.type === 'private' && chat.participants) {
                // Find the "other" participant ID
                const otherUserId = chat.participants.find((uid: string) => uid !== user.id);
                if (otherUserId) {
                    const { data: otherProfile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', otherUserId)
                        .single();
                    if (otherProfile?.full_name) {
                        return { ...chat, name: otherProfile.full_name };
                    }
                }
            }
            return chat;
        }));

        set({ chats: updatedChats as any[] || [], isLoading: false });
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

        // Optimistic UI: Send and immediately add to store
        const { data: newMessage, error } = await supabase.from('messages').insert({
            chat_id: chatId,
            sender_id: user.id,
            content: content
        }).select().single();

        if (newMessage) {
             const messageWithSender = {
                ...newMessage,
                sender: { 
                    full_name: user.name, 
                    avatar_url: user.avatar 
                }
            };

            set((state) => {
                const currentMessages = state.messages[chatId] || [];
                // Check if already exists (via Realtime race condition)
                if (currentMessages.find(m => m.id === newMessage.id)) {
                    return state;
                }
                return {
                    messages: {
                        ...state.messages,
                        [chatId]: [...currentMessages, messageWithSender as any]
                    }
                };
            });
        }
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
                // Check if we already have this message (from optimistic update)
                const state = get();
                const currentMessages = state.messages[chatId] || [];
                if (currentMessages.find(m => m.id === payload.new.id)) {
                    return;
                }

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
    },

    loadUsers: async () => {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .order('full_name', { ascending: true });
        set({ users: (profiles as any[]) || [] });
    },

    createPrivateChat: async (otherUserId) => {
        const me = useAuthStore.getState().user;
        if (!me) return { error: "Not logged in" };
        const { data: other } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', otherUserId)
            .single();
        const name = other?.full_name || 'New Chat';
        const { data: chatRow, error: chatErr } = await supabase.from('chats').insert({
            name,
            type: 'private',
            participants: [me.id, otherUserId]
        }).select('id').single();
        if (chatErr) return { error: chatErr };
        if (!chatRow?.id) return { error: "Chat ID not generated" };
        const id = chatRow.id;
        await supabase.from('chat_participants').insert([{ chat_id: id, user_id: me.id }, { chat_id: id, user_id: otherUserId }]);
        await get().loadChats();
        return { chatId: id, error: null };
    },

    createAnnouncementChat: async () => {
        const me = useAuthStore.getState().user;
        if (!me) return { error: "Not logged in" };
        const existing = get().chats.find(c => c.type === 'announcement');
        if (existing) return { chatId: existing.id, error: null };
        const { data: chatRow, error: chatErr } = await supabase.from('chats').insert({
            name: 'Broadcast',
            type: 'announcement',
            participants: [me.id]
        }).select('id').single();
        if (chatErr) return { error: chatErr };
        if (!chatRow?.id) return { error: "Chat ID not generated" };
        const id = chatRow.id;
        await supabase.from('chat_participants').insert({ chat_id: id, user_id: me.id });
        await get().loadChats();
        return { chatId: id, error: null };
    }
}));
