import { createClient } from '@/lib/supabase/client';

export interface Payment {
    id: string;
    order_id: string;
    client_id: string;
    partner_id: string;
    amount: number;
    currency: string;
    payment_method: 'bank_transfer' | 'ccp' | 'baridi_mob' | 'satim_card' | 'cash';
    status: 'pending' | 'held' | 'released' | 'refunded' | 'failed';
    transaction_id?: string;
    payment_proof_url?: string;
    paid_at?: string;
    released_at?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Create a payment (escrow) for an order
 */
export async function createPayment(data: {
    order_id: string;
    amount: number;
    payment_method: Payment['payment_method'];
    transaction_id?: string;
    payment_proof_url?: string;
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get order details
    const { data: order } = await supabase
        .from('orders')
        .select('partner_id')
        .eq('id', data.order_id)
        .single();

    if (!order) throw new Error('Order not found');

    const { data: payment, error } = await supabase
        .from('payments')
        .insert({
            order_id: data.order_id,
            client_id: user.id,
            partner_id: order.partner_id,
            amount: data.amount,
            payment_method: data.payment_method,
            transaction_id: data.transaction_id,
            payment_proof_url: data.payment_proof_url,
            status: data.payment_proof_url ? 'pending' : 'pending', // Awaiting admin verification
            paid_at: data.payment_proof_url ? new Date().toISOString() : null
        })
        .select()
        .single();

    if (error) throw error;
    return payment;
}

/**
 * Update payment status (Admin only)
 */
export async function updatePaymentStatus(
    paymentId: string,
    status: 'held' | 'released' | 'refunded' | 'failed'
) {
    const supabase = createClient();

    const updateData: any = { status };

    if (status === 'released') {
        updateData.released_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

    if (error) throw error;
}

/**
 * Get payment for an order
 */
export async function getOrderPayment(orderId: string): Promise<Payment | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (error) return null;
    return data as Payment;
}

/**
 * Get all pending payments (Admin view)
 */
export async function getPendingPayments(): Promise<Payment[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            order:orders(part_name),
            client:profiles!client_id(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pending payments:', error);
        return [];
    }

    return data as any;
}
