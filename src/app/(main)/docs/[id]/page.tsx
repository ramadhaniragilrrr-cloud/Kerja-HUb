"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useDocsStore, Doc } from "@/lib/store/useDocsStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Share2, MoreHorizontal } from "lucide-react";

export default function DocEditorPage() {
   const params = useParams();
   const id = params.id as string;
   const { documents, updateDoc } = useDocsStore();
   const doc = documents.find((d) => d.id === id);

   const [title, setTitle] = useState("");
   const [content, setContent] = useState("");
   const [status, setStatus] = useState("Saved");

   useEffect(() => {
      if (doc) {
         setTitle(doc.title);
         setContent(doc.content);
      }
   }, [id, doc]);

   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setStatus("Saving...");
      updateDoc(id, { title: e.target.value });
      setTimeout(() => setStatus("Saved"), 500);
   };

   const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      setStatus("Saving...");
      updateDoc(id, { content: e.target.value });
      setTimeout(() => setStatus("Saved"), 500);
   };

   if (!doc) {
      return <div className="flex h-full items-center justify-center">Document not found</div>;
   }

   return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-950">
         {/* Toolbar / Header */}
         <div className="h-14 border-b flex items-center justify-between px-4 bg-white dark:bg-slate-950 sticky top-0 z-10">
            <div className="flex items-center gap-2">
               <span className="text-xs text-slate-400">{status}</span>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-slate-500"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
               <Button variant="ghost" size="icon" className="text-slate-500"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
         </div>

         {/* Editor Canvas / Viewer */}
         <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="max-w-5xl mx-auto py-8 px-8 min-h-screen">
               {/* Title */}
               <Input
                  className="text-4xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-slate-300 bg-transparent mb-6"
                  placeholder="Untitled"
                  value={title}
                  onChange={handleTitleChange}
               />

               {doc.type === 'file' && doc.file_url ? (
                  <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm overflow-hidden min-h-[800px] relative">
                     {/* File Handler Logic */}
                     {doc.file_url.match(/\.pdf$/i) ? (
                        <div className="w-full h-[85vh] bg-slate-200 relative group">
                           {/* PDF Viewer */}
                           <iframe
                              src={`${doc.file_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                              className="w-full h-full"
                              style={{ pointerEvents: 'auto' }}
                           />
                           {/* Security Watermark (Reuse from LMS) */}
                           <div className="absolute top-0 left-0 right-0 h-14 bg-slate-100 dark:bg-slate-900 z-10 flex items-center justify-between px-4 border-b select-none">
                              <span className="text-xs font-mono text-slate-400">View Only • {useDocsStore.getState().documents.find(d => d.id === id)?.authorId}</span>
                              {/* Ideally we want current viewer's email here but for now just showing it's restricted or author */}
                              <span className="text-xs text-red-500 font-bold">RESTRICTED VIEW</span>
                           </div>
                        </div>
                     ) : doc.file_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <div className="flex items-center justify-center p-4 bg-black/5 min-h-[600px]">
                           <img src={doc.file_url} alt={title} className="max-w-full max-h-[80vh] object-contain shadow-lg rounded" />
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full p-20 text-slate-400">
                           <p>Preview not available for this file type.</p>
                           <Button variant="outline" className="mt-4" onClick={() => window.open(doc.file_url, '_blank')}>
                              Download File
                           </Button>
                        </div>
                     )}
                  </div>
               ) : (
                  /* Text Editor */
                  <textarea
                     className="w-full h-[calc(100vh-300px)] resize-none outline-none text-lg leading-relaxed bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-300 p-4"
                     placeholder="Start writing..."
                     value={content}
                     onChange={handleContentChange}
                  />
               )}
            </div>
         </div>
      </div>
   );
}
