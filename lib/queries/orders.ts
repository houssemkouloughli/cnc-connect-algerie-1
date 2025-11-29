import { createClient } from '@/lib/supabase/client';
import { notifyOrderStatusChange } from '@/lib/notifications/send';


export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
    id: string;
    quote_id: string;
    bid_id: string;
    partner_id: string;
    client_id: string;
    status: OrderStatus;
    total_amount: number;
    created_at: string;
    updated_at: string;
    // Relations
    quote?: {
        part_name: string;
        material: string;
        quantity: number;
        file_url?: string;
    };
    partner?: {
        id: string;
        company_name: string;
        wilaya_code: string;
        rating: number;
    };
    bid?: {
        lead_time_days: number;
        message?: string;
    };
    client?: {
        full_name: string;
        email: string;
        phone?: string;
        company_name?: string;
    };
};

/**
 * Récupère toutes les commandes pour le client connecté
 */
export async function getClientOrders(): Promise<Order[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      quote:quotes(part_name, material, quantity, file_url),
      partner:partners(id, company_name, wilaya_code, rating),
      bid:bids(lead_time_days, message)
    `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching client orders:', error);
        return [];
    }

    return data as Order[];
}

/**
 * Récupère toutes les commandes pour le partenaire connecté
 */
export async function getPartnerOrders(partnerId: string): Promise<Order[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      quote:quotes(part_name, material, quantity, file_url),
      client:profiles!client_id(full_name, company_name, email, phone)
    `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching partner orders:', error);
        return [];
    }

    return data as Order[];
}

/**
 * Récupère les détails complets d'une commande
 */
export async function getOrderDetails(orderId: string): Promise<Order | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      quote:quotes(*),
      partner:partners(*),
      bid:bids(*),
      client:profiles!client_id(full_name, email, phone, company_name)
    `)
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order details:', error);
        return null;
    }

    return data as Order;
}

/**
 * Met à jour le statut d'une commande
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('orders')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        throw error;
    }

    // Notify client of status change (only for meaningful status changes)
    if (['confirmed', 'in_production', 'shipped', 'delivered'].includes(newStatus)) {
        const orderDetails = await getOrderDetails(orderId);
        if (orderDetails && orderDetails.client && orderDetails.quote) {
            await notifyOrderStatusChange({
                clientId: orderDetails.client_id,
                clientEmail: orderDetails.client.email,
                clientName: orderDetails.client.full_name || orderDetails.client.email,
                partName: orderDetails.quote.part_name,
                newStatus: newStatus as 'confirmed' | 'in_production' | 'shipped' | 'delivered',
                orderId,
            });
        }
    }
}

/**
 * Annule une commande (uniquement si status = pending)
 */
export async function cancelOrder(orderId: string): Promise<void> {
    await updateOrderStatus(orderId, 'cancelled');
}

/**
 * Confirme une commande (client accepte de payer)
 */
export async function confirmOrder(orderId: string): Promise<void> {
    await updateOrderStatus(orderId, 'confirmed');
}
