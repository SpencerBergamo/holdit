import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (supabaseInstance === null) {
        supabaseInstance = createClient(
            process.env.EXPO_PUBLIC_SUPABASE_URL!,
            process.env.EXPO_PUBLIC_SUPABASE_KEY!,
            {
                auth: {
                    storage: AsyncStorage,
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false,
                    lock: processLock,
                },
            }
        );
    }
    return supabaseInstance;
}

// Export a proxy object that lazily initializes the client
const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        return getSupabase()[prop as keyof SupabaseClient];
    },
});

export default supabase;
