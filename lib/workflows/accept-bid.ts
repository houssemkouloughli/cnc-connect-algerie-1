import { createClient } from '@/lib/supabase/client';
import { acceptBid } from '@/lib/queries/bids';
import { downloadQuotePDF, getQuotePDFBlob } from '@/lib/pdf/generate-quote';
import type { QuotePDFData } from '@/lib/pdf/generate-quote';

/**
 * Accept a bid and generate PDF quote
 */
export async function acceptBidWithPDF(quoteId: string, bidId: string) {
    const supabase = createClient();

    // 1. Get quote and bid details
    const { data: quote } = await supabase
        .from('quotes')
        .select(`
            *,
            profiles!user_id(full_name, email)
        `)
        .eq('id', quoteId)
        .single();

    const { data: bid } = await supabase
        .from('bids')
        .select(`
            *,
            partners!partner_id(masked_name, wilaya_code)
        `)
        .eq('id', bidId)
        .single();

    if (!quote || !bid) {
        throw new Error('Quote or bid not found');
    }

    // 2. Accept the bid (creates order, updates quotes)
    await acceptBid(quoteId, bidId);

    // 3. Generate PDF
    const pdfData: QuotePDFData = {
        quoteId: quote.id,
        quoteName: `Devis-${quote.part_name}`,
        clientName: (quote.profiles as any).full_name || 'Client',
        clientEmail: (quote.profiles as any).email,
        partName: quote.part_name,
        material: quote.material,
        finish: quote.finish,
        quantity: quote.quantity,
        bidAmount: bid.amount,
        deliveryDays: bid.delivery_days,
        partnerName: (bid.partners as any).masked_name,
        partnerWilaya: (bid.partners as any).wilaya_code,
        createdAt: new Date(),
    };

    // 4. Download PDF for client
    downloadQuotePDF(pdfData);

    // 5. Optional: Upload PDF to storage for record keeping
    try {
        const pdfBlob = getQuotePDFBlob(pdfData);
        const pdfPath = `quotes/${quoteId}/devis_${Date.now()}.pdf`;

        await supabase.storage
            .from('documents')
            .upload(pdfPath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false,
            });
    } catch (uploadError) {
        console.error('Error uploading PDF to storage:', uploadError);
        // Non-critical error, continue
    }

    return { success: true };
}
