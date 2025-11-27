import { createClient } from '@/lib/supabase/client';

export type Quote = {
    id: string;
    part_name: string;
    material: string;
    finish: string;
    quantity: number;
    target_price?: number;
    geometry_data?: any;
    status: 'open' | 'closed' | 'awarded';
    created_at: string;
    file_url?: string;
    thumbnail_url?: string;
    client_id: string;
};

export async function createQuote(quoteData: Omit<Quote, 'id' | 'created_at' | 'status' | 'client_id'>) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('quotes')
        .insert({
            ...quoteData,
            client_id: user.id,
            status: 'open'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating quote:', error);
        throw error;
    }

    return data;
}

export async function getClientQuotes() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }

    return data as Quote[];
}

export async function getOpenQuotesForPartners() {
    const supabase = createClient();

    // RLS will handle the filtering for partners, but we add status check explicitly
    const { data, error } = await supabase
        .from('quotes')
        .select(`
      *,
      profiles (
        full_name,
        company_name
      )
    `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching open quotes:', error);
        return [];
    }

    return data;
}
