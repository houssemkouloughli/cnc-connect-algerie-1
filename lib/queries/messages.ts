import { createClient } from '@/lib/supabase/client';

export interface Message {
    id: string;
    quote_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface MessageWithSender extends Message {
    sender: {
        full_name: string | null;
        email: string;
    };
}

/**
 * Send a message (auto-filters sensitive info)
 */
export async function sendMessage(data: {
    quote_id: string;
    receiver_id: string;
    content: string;
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Filter sensitive information before sending
    const filteredContent = filterSensitiveInfo(data.content);

    const { data: message, error } = await supabase
        .from('messages')
        .insert({
            quote_id: data.quote_id,
            sender_id: user.id,
            receiver_id: data.receiver_id,
            content: filteredContent
        })
        .select()
        .single();

    if (error) throw error;
    return message;
}

/**
 * Get messages for a quote
 */
export async function getQuoteMessages(quoteId: string): Promise<MessageWithSender[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:profiles!sender_id(full_name, email)
        `)
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return data as unknown as MessageWithSender[];
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(quoteId: string) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('quote_id', quoteId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
}

/**
 * Filter sensitive information from message content
 * Masks phone numbers, emails, and common contact patterns
 */
export function filterSensitiveInfo(content: string): string {
    let filtered = content;

    // Mask phone numbers (Algerian format: 05XX XX XX XX or 06XX XX XX XX or 07XX XX XX XX)
    filtered = filtered.replace(/0[567]\d{1}[\s\.]?\d{2}[\s\.]?\d{2}[\s\.]?\d{2}/g, '****');

    // Mask international format
    filtered = filtered.replace(/\+213[\s\.]?\d{1,3}[\s\.]?\d{2}[\s\.]?\d{2}[\s\.]?\d{2}/g, '****');

    // Mask emails
    filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '****@****.***');

    // Mask common contact phrases
    const contactPhrases = [
        /appelez[-\s]?moi/gi,
        /contactez[-\s]?moi/gi,
        /mon\s+num[ée]ro/gi,
        /whatsapp/gi,
        /facebook/gi,
        /instagram/gi
    ];

    contactPhrases.forEach(pattern => {
        filtered = filtered.replace(pattern, '[Coordonnées masquées - Utilisez la messagerie]');
    });

    return filtered;
}

/**
 * Mask partner company name for anonymization
 */
export function maskCompanyName(name: string): string {
    if (!name || name.length <= 3) {
        return name.charAt(0) + '***';
    }
    return name.substring(0, 2) + '***' + name.charAt(name.length - 1);
}
