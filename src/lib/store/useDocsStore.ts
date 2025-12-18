import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface Doc {
    id: string;
    title: string;
    content: string;
    lastModified: number;
    authorId: string;
    type?: 'text' | 'file';
    file_url?: string;
    file_path?: string;
}

interface DocsState {
    documents: Doc[];
    createDoc: (doc: Doc) => void;
    updateDoc: (id: string, updates: Partial<Doc>) => void;
    deleteDoc: (id: string) => void;
    uploadDoc: (file: File) => Promise<{ error: any }>;
}

export const useDocsStore = create<DocsState>()(
    persist(
        (set, get) => ({
            documents: [
                {
                    id: "welcome-doc",
                    title: "Welcome to Lark Docs",
                    content: "Start typing to create your first document...",
                    lastModified: Date.now(),
                    authorId: "1",
                    type: 'text'
                }
            ],
            createDoc: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
            updateDoc: (id, updates) => set((state) => ({
                documents: state.documents.map((doc) =>
                    doc.id === id ? { ...doc, ...updates, lastModified: Date.now() } : doc
                )
            })),
            deleteDoc: async (id) => {
                const user = useAuthStore.getState().user;
                if (!user || user.role !== 'admin') return;
                const doc = get().documents.find(d => d.id === id);
                if (doc?.type === 'file') {
                    const path = doc.file_path || (doc.file_url ? doc.file_url.split('/storage/v1/object/public/docs/')[1] : undefined);
                    if (path) {
                        await supabase.storage.from('docs').remove([path]);
                    }
                }
                await supabase.from('documents').delete().eq('id', id);
                set((state) => ({
                    documents: state.documents.filter((d) => d.id !== id)
                }));
            },
            uploadDoc: async (file) => {
                const user = useAuthStore.getState().user;
                if (!user) return { error: "User not logged in" };

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('docs')
                    .upload(filePath, file);

                if (error) return { error };

                const { data: { publicUrl } } = supabase.storage
                    .from('docs')
                    .getPublicUrl(filePath);

                const newDoc: Doc = {
                    id: Math.random().toString(36).substring(2, 9),
                    title: file.name,
                    content: "", // No content for files
                    lastModified: Date.now(),
                    authorId: user.id,
                    type: 'file',
                    file_url: publicUrl,
                    file_path: filePath
                };

                set((state) => ({ documents: [newDoc, ...state.documents] }));

                // Also save to DB in real app
                await supabase.from('documents').insert({
                    id: newDoc.id,
                    title: newDoc.title,
                    type: 'file',
                    file_url: publicUrl,
                    author_id: user.id,
                    last_modified: newDoc.lastModified
                });

                return { error: null };
            }
        }),
        {
            name: 'docs-storage',
        }
    )
);
