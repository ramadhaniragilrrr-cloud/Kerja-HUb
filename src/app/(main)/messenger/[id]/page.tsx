"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/lib/store/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Video, MoreHorizontal, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function ChatWindowPage() {
    const params = useParams();
    const id = params.id as string;
    const { messages, sendMessage, activeChatId, setActiveChat, chats } = useChatStore();
    const { user } = useAuthStore();

    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const currentMessages = messages[id] || [];
    const activeChat = chats.find(c => c.id === id);

    useEffect(() => {
        if (id && id !== activeChatId) {
            setActiveChat(id);
        }
    }, [id, activeChatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentMessages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        await sendMessage(id, inputValue);
        setInputValue("");
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${id}`} />
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">Chat Room</h2>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-500">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-500"><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-500"><Video className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-500"><MoreHorizontal className="h-5 w-5" /></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {currentMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p>No messages yet. Say hello!</p>
                    </div>
                )}
                {currentMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={msg.sender?.avatar_url} />
                                <AvatarFallback>{msg.sender?.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "max-w-[70%] rounded-2xl p-3 text-sm",
                                isMe
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none"
                            )}>
                                <p>{msg.content}</p>
                                <span className={cn(
                                    "text-[10px] mt-1 block opacity-70",
                                    isMe ? "text-blue-100" : "text-slate-500"
                                )}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white dark:bg-slate-950 flex-shrink-0">
                {activeChat?.type === 'announcement' && user?.role !== 'admin' ? (
                    <div className="flex h-10 items-center justify-center text-sm text-slate-500 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        Only administrators can send messages in this channel.
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <Smile className="h-6 w-6" />
                        </Button>
                        <Input
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-100 dark:bg-slate-900 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
