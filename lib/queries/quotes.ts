import { createClient } from '@/lib/supabase/client';
import { notifyBidAccepted } from '@/lib/notifications/send';


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



export async function acceptBid(quoteId: string, bidId: string) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Update chosen bid to accepted
    const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

    if (bidError) throw bidError;

    // 2. Update other bids to rejected
    await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('quote_id', quoteId)
        .neq('id', bidId);

    // 3. Update quote status
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'awarded' })
        .eq('id', quoteId);

    if (quoteError) throw quoteError;

    // 4. Create Order
    // Fetch bid and quote details
    const { data: bid } = await supabase
        .from('bids')
        .select(`
            partner_id, 
            price,
            partner:partners!inner(profile_id, company_name, profiles!inner(email))
        `)
        .eq('id', bidId)
        .single();

    const { data: quote } = await supabase
        .from('quotes')
        .select('part_name')
        .eq('id', quoteId)
        .single();

    if (bid) {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                quote_id: quoteId,
                bid_id: bidId,
                partner_id: bid.partner_id,
                client_id: user.id,
                total_amount: bid.price,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
        } else if (order && bid.partner && quote) {
            // Notify partner that their bid was accepted
            await notifyBidAccepted({
                partnerId: bid.partner.profile_id,
                partnerEmail: bid.partner.profiles.email,
                partnerName: bid.partner.company_name,
                partName: quote.part_name,
                clientName: user.email, // We would need to fetch this properly
                orderAmount: bid.price,
                orderId: order.id,
            });
        }
    }
}

export async function getClientQuotes() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('quotes')
        .select(`
            *,
            bids (
                id,
                price,
                lead_time_days,
                message,
                status,
                partner:partners(company_name, rating)
            )
        `)
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
