import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign in an existing user
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) console.error('Error signing in:', error.message);
    return { data, error };
  };
  
  // Sign out the current user
  export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    return error;
  };
  
  // Get the currently signed-in user
  export const getUser = async () => {
    const { data: user, error } = await supabase.auth.getUser();
    if (error) console.error('Error getting user:', error.message);
    return { user, error };
  };
  
  // Listen for authentication state changes (optional)
  export const onAuthStateChange = (callback) => {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  };