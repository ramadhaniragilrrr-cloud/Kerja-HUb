"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/store/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Megaphone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ChatList() {
    const { chats, loadChats, setActiveChat } = useChatStore();
    const router = useRouter();
    const params = useParams();
    const activeId = params.id as string;
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadChats();
    }, []);

    const filteredChats = chats.filter((chat) =>
        chat.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectChat = (id: string) => {
        setActiveChat(id);
        router.push(`/messenger/${id}`);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
            <div className="p-4 border-b space-y-4">
                <h2 className="font-semibold text-lg">Messenger</h2>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8 bg-white dark:bg-slate-950"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {filteredChats.length === 0 && <div className="p-4 text-sm text-slate-500 text-center">No chats found.</div>}
                    {filteredChats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                "hover:bg-slate-200 dark:hover:bg-slate-800",
                                activeId === chat.id && "bg-blue-100 dark:bg-blue-900/50"
                            )}
                        >
                            <Avatar className={cn(chat.type === 'announcement' && "bg-orange-100 text-orange-600")}>
                                {chat.type === 'announcement' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900">
                                        <Megaphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                ) : (
                                    <>
                                        <AvatarImage src={`https://avatar.vercel.sh/${chat.id}`} />
                                        <AvatarFallback>{chat.name?.[0]}</AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium truncate">{chat.name || "Untitled Chat"}</span>
                                    <span className="text-xs text-muted-foreground">Now</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {/* Last message preview could go here if fetched */}
                                    Click to view messages
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
