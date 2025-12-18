import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get supabase client
// This prevents errors during build time when env vars aren't available
function getSupabaseClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a dummy client during build time
        // This will be replaced with real client at runtime
        console.warn('Supabase credentials not found. Using placeholder client.');
        return createClient('https://placeholder.supabase.co', 'placeholder-key', {
            db: { schema: 'public' }
        });
    }
    return createClient(supabaseUrl, supabaseAnonKey, {
        db: { schema: 'public' }
    });
}

export const supabase = getSupabaseClient();
