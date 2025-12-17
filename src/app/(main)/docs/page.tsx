"use client";

import { useDocsStore } from "@/lib/store/useDocsStore";
import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function DocsDashboardPage() {
    const { documents } = useDocsStore();
    const router = useRouter();

    const handleOpenDoc = (id: string) => {
        router.push(`/docs/${id}`);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            <div className="p-8 max-w-6xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Docs</h1>
                    <p className="text-slate-500">Welcome to your documents workspace.</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4">Recent</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {documents.map((doc) => {
                            const isImage = doc.file_url?.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                            const isPdf = doc.file_url?.match(/\.pdf$/i) != null;
                            const isWord = doc.file_url?.match(/\.(doc|docx)$/i) != null;

                            return (
                                <Card
                                    key={doc.id}
                                    className="cursor-pointer hover:shadow-md transition-all group border-slate-200 dark:border-slate-800 overflow-hidden"
                                    onClick={() => handleOpenDoc(doc.id)}
                                >
                                    <CardHeader className="h-32 p-0 bg-slate-100 dark:bg-slate-800 items-center justify-center relative">
                                        {isImage && doc.file_url ? (
                                            <img
                                                src={doc.file_url}
                                                alt={doc.title}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full">
                                                {isPdf ? (
                                                    <FileText className="h-12 w-12 text-red-500" />
                                                ) : isWord ? (
                                                    <FileText className="h-12 w-12 text-blue-600" />
                                                ) : (
                                                    <FileText className="h-12 w-12 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                                )}
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold truncate text-slate-900 dark:text-white" title={doc.title}>
                                            {doc.title || "Untitled"}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Last edited {new Date(doc.lastModified).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        <Button
                            variant="outline"
                            className="h-full min-h-[220px] flex flex-col gap-4 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => {
                                const { createDoc } = useDocsStore.getState();
                                const newId = Math.random().toString(36).substr(2, 9);
                                createDoc({
                                    id: newId,
                                    title: "Untitled Document",
                                    content: "",
                                    lastModified: Date.now(),
                                    authorId: "1",
                                    type: 'text'
                                });
                                router.push(`/docs/${newId}`);
                            }}
                        >
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <span className="text-2xl text-slate-500">+</span>
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">Create New Doc</span>
                        </Button>

                        {/* Upload File Card */}
                        <Button
                            variant="outline"
                            className="h-full min-h-[220px] flex flex-col gap-4 border-dashed border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 relative"
                            onClick={() => document.getElementById('doc-upload')?.click()}
                        >
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <span className="text-2xl text-slate-500">↑</span>
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">Upload File</span>
                            <input
                                type="file"
                                id="doc-upload"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const { uploadDoc } = useDocsStore.getState();
                                        alert("Uploading " + file.name + "...");
                                        const { error } = await uploadDoc(file);
                                        if (error) {
                                            alert("Upload failed: " + error.message);
                                        } else {
                                            alert("Upload successful!");
                                        }
                                    }
                                    e.target.value = ""; // Reset
                                }}
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
