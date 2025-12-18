import { createClient } from '@/lib/supabase/client';

// Wilaya codes for Algeria (1-58)
export const WILAYAS = {
    '01': 'Adrar',
    '02': 'Chlef',
    '03': 'Laghouat',
    '04': 'Oum El Bouaghi',
    '05': 'Batna',
    '06': 'Béjaïa',
    '07': 'Biskra',
    '08': 'Béchar',
    '09': 'Blida',
    '10': 'Bouira',
    '11': 'Tamanrasset',
    '12': 'Tébessa',
    '13': 'Tlemcen',
    '14': 'Tiaret',
    '15': 'Tizi Ouzou',
    '16': 'Alger',
    '17': 'Djelfa',
    '18': 'Jijel',
    '19': 'Sétif',
    '20': 'Saïda',
    '21': 'Skikda',
    '22': 'Sidi Bel Abbès',
    '23': 'Annaba',
    '24': 'Guelma',
    '25': 'Constantine',
    '26': 'Médéa',
    '27': 'Mostaganem',
    '28': 'M\'Sila',
    '29': 'Mascara',
    '30': 'Ouargla',
    '31': 'Oran',
    '32': 'El Bayadh',
    '33': 'Illizi',
    '34': 'Bordj Bou Arréridj',
    '35': 'Boumerdès',
    '36': 'El Tarf',
    '37': 'Tindouf',
    '38': 'Tissemsilt',
    '39': 'El Oued',
    '40': 'Khenchela',
    '41': 'Souk Ahras',
    '42': 'Tipaza',
    '43': 'Mila',
    '44': 'Aïn Defla',
    '45': 'Naâma',
    '46': 'Aïn Témouchent',
    '47': 'Ghardaïa',
    '48': 'Relizane',
    '49': 'Timimoun',
    '50': 'Bordj Badji Mokhtar',
    '51': 'Ouled Djellal',
    '52': 'Béni Abbès',
    '53': 'In Salah',
    '54': 'In Guezzam',
    '55': 'Touggourt',
    '56': 'Djanet',
    '57': 'El M\'Ghair',
    '58': 'El Meniaa'
};

export interface ShippingRate {
    from_wilaya: string;
    to_wilaya: string;
    base_rate: number;
    weight_additional_rate: number;
    base_weight_kg: number;
    estimated_days: number;
}

/**
 * Calculate shipping cost between two wilayas
 */
export async function calculateShippingCost(
    fromWilaya: string,
    toWilaya: string,
    weightKg: number = 1
): Promise<{ cost: number; estimatedDays: number }> {
    const supabase = createClient();

    // Try to get exact rate
    let { data: rate } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('from_wilaya', fromWilaya)
        .eq('to_wilaya', toWilaya)
        .single();

    // If no exact rate, use fallback logic
    if (!rate) {
        // Same wilaya
        if (fromWilaya === toWilaya) {
            return { cost: 500, estimatedDays: 1 };
        }

        // Major cities (Alger, Oran, Constantine)
        const majorCities = ['16', '31', '25'];
        if (majorCities.includes(fromWilaya) && majorCities.includes(toWilaya)) {
            return { cost: 1200, estimatedDays: 3 };
        }

        // Adjacent wilayas (simplified - in production use a distance matrix)
        const wilayaNum = parseInt(fromWilaya);
        const toWilayaNum = parseInt(toWilaya);
        if (Math.abs(wilayaNum - toWilayaNum) <= 5) {
            return { cost: 800, estimatedDays: 2 };
        }

        // Default long-distance rate
        return { cost: 1500, estimatedDays: 5 };
    }

    // Calculate total cost with weight
    let totalCost = rate.base_rate;
    if (weightKg > rate.base_weight_kg) {
        const additionalWeight = weightKg - rate.base_weight_kg;
        totalCost += additionalWeight * rate.weight_additional_rate;
    }

    return {
        cost: Math.round(totalCost),
        estimatedDays: rate.estimated_days
    };
}

/**
 * Update order shipping status
 */
export async function updateShippingStatus(
    orderId: string,
    status: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'failed',
    trackingNumber?: string,
    location?: string,
    notes?: string
) {
    const supabase = createClient();

    const updateData: any = { shipping_status: status };

    if (status === 'shipped' && !trackingNumber) {
        throw new Error('Tracking number required when marking as shipped');
    }

    if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
        updateData.shipped_at = new Date().toISOString();
    }

    if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
    }

    // Update order
    const { error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (orderError) throw orderError;

    // Add tracking event
    await supabase
        .from('delivery_tracking')
        .insert({
            order_id: orderId,
            status,
            location,
            notes
        });
}

/**
 * Get delivery tracking history for an order
 */
export async function getDeliveryTracking(orderId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching delivery tracking:', error);
        return [];
    }

    return data;
}
