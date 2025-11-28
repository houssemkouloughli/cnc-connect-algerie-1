import { createClient } from '@/lib/supabase/client';

export type UserRole = 'client' | 'partner' | 'admin';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    wilaya_code: string | null;
    phone: string | null;
    company_name: string | null;
    avatar_url: string | null;
}

/**
 * Get redirect URL based on user role
 */
export function getRedirectByRole(role: UserRole): string {
    const roleRedirects: Record<UserRole, string> = {
        client: '/client',
        partner: '/partner',
        admin: '/admin',
    };

    return roleRedirects[role] || '/';
}

/**
 * Check if user has specific role
 */
export function isClient(role: UserRole | null): boolean {
    return role === 'client';
}

export function isPartner(role: UserRole | null): boolean {
    return role === 'partner';
}

export function isAdmin(role: UserRole | null): boolean {
    return role === 'admin';
}

/**
 * Sign out user
 */
export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
}
