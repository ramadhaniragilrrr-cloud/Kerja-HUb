"use client";

import { useDocsStore } from "@/lib/store/useDocsStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useState } from "react";
import { FileText, Plus, Search, Upload, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function DocsSidebar() {
    const { documents, createDoc, uploadDoc, deleteDoc } = useDocsStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const activeDocId = params.id as string;
    const [search, setSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredDocs = documents.filter((doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateDoc = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        createDoc({
            id: newId,
            title: "Untitled Document",
            content: "",
            lastModified: Date.now(),
            authorId: user?.id || "anonymous",
            type: 'text'
        });
        router.push(`/docs/${newId}`);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Indicate loading state if needed
        await uploadDoc(file);
        // Clear input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Docs</h2>
                    <div className="flex gap-2">
                        {user?.role === 'admin' && (
                            <>
                                <Input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <Button size="sm" variant="outline" onClick={handleUploadClick} title="Upload Document">
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <Button size="sm" onClick={handleCreateDoc} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-1" /> New
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search docs..."
                        className="pl-8 bg-white dark:bg-slate-950"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    <h3 className="px-2 text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Recent</h3>
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between">
                            <Button
                                variant={activeDocId === doc.id ? "secondary" : "ghost"}
                                className={cn(
                                    "flex-1 justify-start h-10 px-2 font-normal",
                                    activeDocId === doc.id && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                )}
                                onClick={() => {
                                    if (doc.type === 'file' && doc.file_url) {
                                        window.open(doc.file_url, '_blank');
                                    } else {
                                        router.push(`/docs/${doc.id}`);
                                    }
                                }}
                            >
                                {doc.type === 'file' ? <Upload className="h-4 w-4 mr-2 text-orange-400" /> : <FileText className="h-4 w-4 mr-2 text-slate-400" />}
                                <span className="truncate">{doc.title}</span>
                            </Button>
                            {user?.role === 'admin' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => deleteDoc(doc.id)}
                                    title="Delete"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
