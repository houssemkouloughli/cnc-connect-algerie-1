import { createClient } from '@/lib/supabase/client';

export interface DesignServiceRequest {
    id: string;
    quote_id: string;
    client_id: string;
    file_url: string;
    file_type: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    assigned_to?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Create a design service request when client uploads an image
 */
export async function createDesignRequest(data: {
    quote_id: string;
    file_url: string;
    file_type: string;
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: request, error } = await supabase
        .from('design_service_requests')
        .insert({
            quote_id: data.quote_id,
            client_id: user.id,
            file_url: data.file_url,
            file_type: data.file_type,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;

    // Also flag the quote as needing design
    await supabase
        .from('quotes')
        .update({ needs_design: true })
        .eq('id', data.quote_id);

    return request;
}

/**
 * Get all pending design requests (Admin view)
 */
export async function getPendingDesignRequests(): Promise<DesignServiceRequest[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('design_service_requests')
        .select(`
            *,
            quote:quotes(part_name, material, quantity),
            client:profiles!client_id(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching design requests:', error);
        return [];
    }

    return data as any;
}

/**
 * Update design request status (Admin action)
 */
export async function updateDesignRequestStatus(
    requestId: string,
    status: 'in_progress' | 'completed' | 'cancelled',
    notes?: string
) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
        status,
        updated_at: new Date().toISOString()
    };

    if (status === 'in_progress') {
        updateData.assigned_to = user.id;
    }

    if (notes) {
        updateData.notes = notes;
    }

    const { error } = await supabase
        .from('design_service_requests')
        .update(updateData)
        .eq('id', requestId);

    if (error) throw error;
}
