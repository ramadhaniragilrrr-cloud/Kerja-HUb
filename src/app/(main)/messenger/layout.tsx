"use client";

import { ResizableShell } from "@/components/layout/resizable-shell";
import { ChatList } from "@/components/chat/chat-list";

export default function MessengerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ResizableShell sidebar={<ChatList />}>
            {children}
        </ResizableShell>
    );
}
