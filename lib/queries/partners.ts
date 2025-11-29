import { createClient } from '@/lib/supabase/client';
import { notifyNewBid } from '@/lib/notifications/send';

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

// ===== MARKETPLACE FUNCTIONS =====

export interface Bid {
    id: string;
    quote_id: string;
    partner_id: string;
    price: number;
    lead_time_days: number;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
    created_at: string;
    updated_at: string;
    quote?: {
        part_name: string;
        material: string;
        quantity: number;
        status: string;
    };
}

export interface QuoteWithClient {
    id: string;
    client_id: string;
    part_name: string;
    material: string;
    quantity: number;
    target_price: number | null;
    status: 'open' | 'closed' | 'awarded';
    created_at: string;
    client: {
        full_name: string | null;
        company_name: string | null;
        wilaya_code: string | null;
    };
    bids?: Bid[];
}

export async function getOpenQuotes(): Promise<QuoteWithClient[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quotes')
        .select(`
            *,
            client:profiles!client_id(full_name, company_name, wilaya_code),
            bids(id, partner_id, price, lead_time_days, status, created_at)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as QuoteWithClient[];
}

export async function getPartnerBids(partnerId: string): Promise<Bid[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bids')
        .select(`
            *,
            quote:quotes(part_name, material, quantity, status)
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Bid[];
}

export async function submitBid(bidData: {
    quote_id: string;
    partner_id: string;
    price: number;
    lead_time_days: number;
    message?: string;
}): Promise<void> {
    const supabase = createClient();

    // Insérer l'offre
    const { data: newBid, error } = await supabase
        .from('bids')
        .insert({
            quote_id: bidData.quote_id,
            partner_id: bidData.partner_id,
            price: bidData.price,
            lead_time_days: bidData.lead_time_days,
            message: bidData.message,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;

    // Récupérer les informations du quote et du client pour la notification
    const { data: quote } = await supabase
        .from('quotes')
        .select(`
            *,
            client:profiles!client_id(id, email, full_name)
        `)
        .eq('id', bidData.quote_id)
        .single();

    // Récupérer les informations du partenaire
    const { data: partner } = await supabase
        .from('partners')
        .select('company_name')
        .eq('id', bidData.partner_id)
        .single();

    // Envoyer notification au client
    if (quote && partner) {
        await notifyNewBid({
            clientId: quote.client.id,
            clientEmail: quote.client.email,
            clientName: quote.client.full_name || quote.client.email,
            partName: quote.part_name,
            partnerName: partner.company_name,
            bidAmount: bidData.price,
            quoteId: bidData.quote_id,
        });
    }
}

export async function getPartnerByProfileId(profileId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('profile_id', profileId)
        .single();

    if (error) throw error;
    return data;
}

export async function getPartnerStats(partnerId: string) {
    const supabase = createClient();

    const { data: bids } = await supabase
        .from('bids')
        .select('price, status')
        .eq('partner_id', partnerId);

    if (!bids) return { totalBids: 0, acceptedBids: 0, totalRevenue: 0, acceptanceRate: 0 };

    const totalBids = bids.length;
    const acceptedBids = bids.filter(b => b.status === 'accepted').length;
    const totalRevenue = bids
        .filter(b => b.status === 'accepted')
        .reduce((sum, b) => sum + (b.price || 0), 0);
    const acceptanceRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0;

    return {
        totalBids,
        acceptedBids,
        totalRevenue,
        acceptanceRate: Math.round(acceptanceRate)
    };
}
