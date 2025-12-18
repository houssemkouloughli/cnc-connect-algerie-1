import { createClient } from '@/lib/supabase/client';

export interface Bid {
    id: string;
    quote_id: string;
    partner_id: string;
    amount: number;
    currency: string;
    delivery_days: number;
    proposal_text: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export interface BidWithPartner extends Bid {
    partners: {
        masked_name: string;
        wilaya_code: string;
        rating: number;
        completed_jobs: number;
    };
}

export interface BidWithQuote extends Bid {
    quotes?: {
        part_name: string;
        quantity: number;
        material: string;
    };
}

/**
 * Submit a bid for a quote (Partner action)
 */
export async function submitBid(data: {
    quote_id: string;
    amount: number;
    delivery_days: number;
    proposal_text?: string;
}) {
    // DEV MODE FIX: Use raw client to avoid mock token issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient: createRawClient } = require('@supabase/supabase-js');
    const supabase = createRawClient(supabaseUrl, supabaseKey);

    // For dev mode, use the hardcoded profile ID directly
    // bids.partner_id references profiles.id, not partners.id
    const devProfileId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    console.log('[submitBid] Using profile ID:', devProfileId);

    const { data: bid, error } = await supabase
        .from('bids')
        .insert({
            quote_id: data.quote_id,
            partner_id: devProfileId, // This is profiles.id
            amount: data.amount,
            delivery_days: data.delivery_days,
            proposal_text: data.proposal_text,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('[submitBid] Insert error:', error);
        throw new Error(`Erreur lors de la soumission: ${error.message}`);
    }

    console.log('[submitBid] Success! Bid ID:', bid.id);
    return bid;
}

/**
 * Get all bids for a specific quote (Client view)
 * Partner info is anonymized until bid is accepted
 */
export async function getBidsForQuote(quoteId: string): Promise<BidWithPartner[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bids')
        .select(`
            *,
            partners!partner_id(
                masked_name,
                wilaya_code,
                rating,
                completed_jobs
            )
        `)
        .eq('quote_id', quoteId)
        .order('amount', { ascending: true });

    if (error) {
        console.error('Error fetching bids:', error);
        return [];
    }

    return data as unknown as BidWithPartner[];
}

/**
 * Get partner's own bids
 */
export async function getPartnerBids(): Promise<BidWithQuote[]> {
    console.log('[getPartnerBids] Starting...');

    // DEV MODE FIX: Use raw client to avoid mock token issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient: createRawClient } = require('@supabase/supabase-js');
    const supabase = createRawClient(supabaseUrl, supabaseKey);

    // Use hardcoded dev profile ID directly (same as submitBid)
    const devProfileId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    console.log('[getPartnerBids] Using profile ID:', devProfileId);

    const { data, error } = await supabase
        .from('bids')
        .select(`
            *,
            quotes!quote_id(part_name, quantity, material)
        `)
        .eq('partner_id', devProfileId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getPartnerBids] Error:', error);
        return [];
    }

    console.log('[getPartnerBids] Success! Found', data?.length || 0, 'bids');

    return data as BidWithQuote[];
}

/**
 * Accept a bid and create order (Client action)
 */
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

    // 3. Update quote status and winning_bid_id
    const { error: quoteError } = await supabase
        .from('quotes')
        .update({
            status: 'bidding_closed',
            winning_bid_id: bidId
        })
        .eq('id', quoteId);

    if (quoteError) throw quoteError;

    // 4. Create Order
    const { data: bid } = await supabase
        .from('bids')
        .select('partner_id, amount')
        .eq('id', bidId)
        .single();

    if (bid) {
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                quote_id: quoteId,
                partner_id: bid.partner_id,
                client_id: user.id,
                total_amount: bid.amount,
                status: 'pending'
            });

        if (orderError) throw orderError;
    }
}
