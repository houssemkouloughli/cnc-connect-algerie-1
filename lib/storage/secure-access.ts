import { createClient } from '@/lib/supabase/server';

/**
 * Generate a signed URL for a CAD file with expiration
 * @param filePath - Path to file in Supabase storage
 * @param expiresIn - Expiration time in seconds (default 24h)
 */
export async function getSignedFileUrl(filePath: string, expiresIn: number = 86400) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .storage
        .from('cad-files')
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }

    // Log file access
    await logFileAccess(filePath, 'url_generated');

    return data.signedUrl;
}

/**
 * Log file access for security audit
 */
async function logFileAccess(filePath: string, action: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('file_access_logs')
        .insert({
            file_path: filePath,
            user_id: user.id,
            action,
            ip_address: '', // Would need to get from request headers
            user_agent: '', // Would need to get from request headers
        });
}

/**
 * Check if user has permission to access a file
 */
export async function canAccessFile(filePath: string, userId: string): Promise<boolean> {
    const supabase = await createClient();

    // Extract quote ID from file path (assuming format: quotes/{quote_id}/file.stl)
    const quoteIdMatch = filePath.match(/quotes\/([^\/]+)\//);
    if (!quoteIdMatch) return false;

    const quoteId = quoteIdMatch[1];

    // Check if user is the quote owner or has an accepted bid
    const { data: quote } = await supabase
        .from('quotes')
        .select('user_id, winning_bid_id, bids(partner_id)')
        .eq('id', quoteId)
        .single();

    if (!quote) return false;

    // Owner can always access
    if (quote.user_id === userId) return true;

    // Partner with accepted bid can access
    if (quote.bids && quote.bids.some((bid: any) => bid.partner_id === userId)) {
        return true;
    }

    return false;
}
