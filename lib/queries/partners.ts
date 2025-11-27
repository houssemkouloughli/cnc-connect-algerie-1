import { createClient } from '@/lib/supabase/client';

export type Partner = {
    id: string;
    company_name: string;
    wilaya_code: string;
    capabilities: string[];
    certifications: string[];
    rating: number;
    completed_jobs: number;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    description?: string;
    avatar_url?: string;
};

export async function getApprovedPartners() {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('partners')
        .select(`
      *,
      profiles (
        avatar_url
      )
    `)
        .eq('status', 'approved')
        .order('rating', { ascending: false });

    if (error) {
        console.error('Error fetching partners:', error);
        return [];
    }

    return data.map(partner => ({
        ...partner,
        avatar_url: partner.profiles?.avatar_url
    })) as Partner[];
}

export async function getPartnerById(id: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('partners')
        .select(`
      *,
      profiles (
        avatar_url,
        email,
        phone
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching partner:', error);
        return null;
    }

    return {
        ...data,
        avatar_url: data.profiles?.avatar_url,
        email: data.profiles?.email,
        phone: data.profiles?.phone
    };
}
