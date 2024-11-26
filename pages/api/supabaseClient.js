import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vslfvcccdcqdfjudktmd.supabase.co'; // Replace with your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Replace with your Service Role Key (server-side operations)
export const supabase = createClient(supabaseUrl, supabaseKey);
