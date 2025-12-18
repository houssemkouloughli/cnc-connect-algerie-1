import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { BYPASS_AUTH, MOCK_USER } from '@/lib/auth/mock-auth';

/**
 * Create Supabase client with auth bypass support
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Configure client options - disable persistence in bypass mode to avoid sending mock tokens
    const options = BYPASS_AUTH ? {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    } : {};

    const client = createSupabaseClient(supabaseUrl, supabaseKey, options);

    // Wrap auth methods if bypass is enabled
    if (BYPASS_AUTH) {
        const originalAuth = client.auth;

        client.auth = {
            ...originalAuth,
            getUser: async () => ({
                data: {
                    user: {
                        id: MOCK_USER.id,
                        email: MOCK_USER.email,
                        user_metadata: {
                            full_name: MOCK_USER.name,
                            role: MOCK_USER.role
                        },
                        aud: 'authenticated',
                        role: 'authenticated',
                        created_at: new Date().toISOString(),
                        app_metadata: {},
                        email_confirmed_at: new Date().toISOString(),
                    } as any
                },
                error: null
            }),
            getSession: async () => ({
                data: {
                    session: {
                        access_token: 'mock-token',
                        refresh_token: 'mock-refresh',
                        user: {
                            id: MOCK_USER.id,
                            email: MOCK_USER.email,
                        } as any,
                        expires_at: Date.now() + 3600000,
                        expires_in: 3600
                    }
                },
                error: null
            }),
            onAuthStateChange: (callback: any) => {
                // Mock: immediately call callback with signed_in event
                setTimeout(() => {
                    callback('SIGNED_IN', {
                        access_token: 'mock-token',
                        refresh_token: 'mock-refresh',
                        user: {
                            id: MOCK_USER.id,
                            email: MOCK_USER.email,
                            user_metadata: {
                                full_name: MOCK_USER.name,
                                role: MOCK_USER.role
                            }
                        }
                    });
                }, 0);

                // Return unsubscribe function
                return {
                    data: { subscription: { unsubscribe: () => { } } }
                };
            },
            signOut: async () => ({
                error: null
            })
        } as any;
    }

    return client;
}
