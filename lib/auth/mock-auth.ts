/**
 * Mock authentication for development/testing
 * Set NEXT_PUBLIC_BYPASS_AUTH=true to enable
 */

export interface MockUser {
    id: string;
    email: string;
    name: string;
    role: 'client' | 'partner' | 'admin';
}

export const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

export const MOCK_USER: MockUser = {
    id: process.env.NEXT_PUBLIC_DEV_USER_ID || 'dev-user-123',
    email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@test.com',
    name: process.env.NEXT_PUBLIC_DEV_USER_NAME || 'Dev User',
    role: (process.env.NEXT_PUBLIC_DEV_USER_ROLE as any) || 'client'
};

/**
 * Get current user (mock or real)
 */
export async function getCurrentUser() {
    if (BYPASS_AUTH) {
        return {
            id: MOCK_USER.id,
            email: MOCK_USER.email,
            user_metadata: {
                full_name: MOCK_USER.name,
                role: MOCK_USER.role
            }
        };
    }

    // Real auth logic here (Supabase)
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Mock auth state for dev
 */
export function useMockAuth() {
    if (!BYPASS_AUTH) {
        return null;
    }

    return {
        user: MOCK_USER,
        isAuthenticated: true,
        isLoading: false
    };
}
