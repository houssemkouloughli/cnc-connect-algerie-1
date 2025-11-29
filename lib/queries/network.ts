import { createClient } from '@/lib/supabase/client';

export interface Partner {
    id: string;
    company_name: string;
    wilaya_code: string;
    capabilities: string[];
    rating: number;
    completed_jobs: number;
    description: string | null;
    created_at: string;
    profile: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export async function getApprovedPartners(): Promise<Partner[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('partners')
        .select(`
      id,
      company_name,
      wilaya_code,
      capabilities,
      rating,
      completed_jobs,
      description,
      created_at,
      profile:profiles!profile_id(full_name, avatar_url)
    `)
        .eq('status', 'approved')
        .order('rating', { ascending: false });

    if (error) throw error;
    return data as Partner[];
}
