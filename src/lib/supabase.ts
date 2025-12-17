import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgfucrjmogjyuvopjfpn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZnVjcmptb2dqeXV2b3BqZnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODIzMjYsImV4cCI6MjA4MDc1ODMyNn0.aMfS_WZxrSnt30guXtRzru7D7mfp0PcL3tfNoO1QV2U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
