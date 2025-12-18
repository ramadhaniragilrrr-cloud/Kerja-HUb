"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestConnectionPage() {
    const [status, setStatus] = useState<any>({
        envVars: null,
        connection: "testing...",
        error: null,
        data: null
    });

    useEffect(() => {
        const checkConnection = async () => {
            // Check Env Vars (Client-side)
            const envVars = {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "MISSING",
                key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "MISSING",
            };

            try {
                // Try a simple public query
                const { data, error } = await supabase.from('courses').select('count').limit(1);
                
                if (error) {
                    setStatus({
                        envVars,
                        connection: "FAILED",
                        error: error.message,
                        data: null
                    });
                } else {
                    setStatus({
                        envVars,
                        connection: "SUCCESS",
                        error: null,
                        data: data
                    });
                }
            } catch (err: any) {
                setStatus({
                    envVars,
                    connection: "CRASHED",
                    error: err.message,
                    data: null
                });
            }
        };

        checkConnection();
    }, []);

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Supabase Connection Diagnostic</h1>
            
            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900">
                <h2 className="font-semibold mb-2">Environment Variables</h2>
                <div className="grid grid-cols-2 gap-2">
                    <div>NEXT_PUBLIC_SUPABASE_URL:</div>
                    <div className={status.envVars?.url === "Present" ? "text-green-600" : "text-red-600 font-bold"}>
                        {status.envVars?.url}
                    </div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
                    <div className={status.envVars?.key === "Present" ? "text-green-600" : "text-red-600 font-bold"}>
                        {status.envVars?.key}
                    </div>
                </div>
            </div>

            <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900">
                <h2 className="font-semibold mb-2">Connection Status</h2>
                <div className="text-lg">
                    Status: <span className={status.connection === "SUCCESS" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {status.connection}
                    </span>
                </div>
                {status.error && (
                    <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                        Error: {status.error}
                    </div>
                )}
                {status.data && (
                    <div className="mt-2 text-sm text-slate-500">
                        Data received: {JSON.stringify(status.data)}
                    </div>
                )}
            </div>

            <div className="text-sm text-slate-500">
                <p>If Env Vars are "MISSING", please go to Vercel Project Settings {'>'} Environment Variables, add them, and then <strong>Redeploy</strong> (Deployments {'>'} Redeploy).</p>
            </div>
        </div>
    );
}
