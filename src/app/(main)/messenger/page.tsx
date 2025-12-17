import { MessageSquare } from "lucide-react";

export default function MessengerPage() {
    return (
        <div className="flex flex-col h-full w-full items-center justify-center bg-white dark:bg-slate-950 text-slate-500">
            <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-4">
                <MessageSquare className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
            <p>Select a chat from the list to start messaging.</p>
        </div>
    );
}
