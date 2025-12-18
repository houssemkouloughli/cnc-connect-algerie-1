import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
    invoiceNumber: string;
    orderNumber: string;
    issuedDate: Date;

    // Client info
    clientName: string;
    clientAddress?: string;
    clientEmail: string;

    // Partner/Supplier info
    partnerName: string;
    partnerAddress?: string;
    partnerRC?: string;
    partnerNIF?: string;

    // Items
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];

    // Amounts
    subtotal: number;
    tvaRate: number; // 19% for Algeria
    tvaAmount: number;
    shippingCost: number;
    totalAmount: number;

    // Legal
    article87Exempt?: boolean;
}

/**
 * Generate an official invoice PDF with Algerian legal requirements
 */
export function generateInvoicePDF(data: InvoiceData): jsPDF {
    const doc = new jsPDF();

    // Header - Company Info
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138);
    doc.text('CNC Connect Algérie', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Marketplace Industriel', 20, 27);
    doc.text('Email: contact@cnc-connect-algerie.com', 20, 32);

    // Invoice Title
    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85);
    doc.text('FACTURE', 150, 20);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`N° ${data.invoiceNumber}`, 150, 27);
    doc.text(`Date: ${data.issuedDate.toLocaleDateString('fr-DZ')}`, 150, 32);

    // Client Info Box
    doc.setFillColor(241, 245, 249);
    doc.rect(20, 45, 85, 30, 'F');

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURÉ À:', 25, 52);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(data.clientName, 25, 59);
    if (data.clientAddress) doc.text(data.clientAddress, 25, 64, { maxWidth: 75 });
    doc.text(data.clientEmail, 25, 70);

    // Supplier Info Box
    doc.setFillColor(241, 245, 249);
    doc.rect(110, 45, 85, 30, 'F');

    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('FOURNISSEUR:', 115, 52);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(data.partnerName, 115, 59);
    if (data.partnerAddress) doc.text(data.partnerAddress, 115, 64, { maxWidth: 75 });
    if (data.partnerRC) doc.text(`RC: ${data.partnerRC}`, 115, 69);
    if (data.partnerNIF) doc.text(`NIF: ${data.partnerNIF}`, 115, 73);

    // Items Table
    const tableData = data.items.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.unitPrice.toLocaleString('fr-DZ')} DZD`,
        `${item.total.toLocaleString('fr-DZ')} DZD`
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Description', 'Quantité', 'Prix Unitaire', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
    });

    // Amounts Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = 120;

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    // Subtotal
    doc.text('Sous-total:', summaryX, finalY);
    doc.text(`${data.subtotal.toLocaleString('fr-DZ')} DZD`, 185, finalY, { align: 'right' });

    // Shipping
    if (data.shippingCost > 0) {
        doc.text('Frais de livraison:', summaryX, finalY + 6);
        doc.text(`${data.shippingCost.toLocaleString('fr-DZ')} DZD`, 185, finalY + 6, { align: 'right' });
    }

    // TVA
    doc.text(`TVA (${data.tvaRate}%):`, summaryX, finalY + 12);
    doc.text(`${data.tvaAmount.toLocaleString('fr-DZ')} DZD`, 185, finalY + 12, { align: 'right' });

    // Article 87 exemption note
    if (data.article87Exempt) {
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('* Exonération selon Article 87', summaryX, finalY + 17);
    }

    // Total (highlighted)
    doc.setFillColor(34, 197, 94);
    doc.rect(summaryX - 5, finalY + 20, 70, 10, 'F');

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL TTC:', summaryX, finalY + 27);
    doc.text(`${data.totalAmount.toLocaleString('fr-DZ')} DZD`, 185, finalY + 27, { align: 'right' });

    // Legal footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const footerY = 270;
    doc.text('Conditions de paiement: Paiement sous 30 jours', 20, footerY);
    doc.text('En vertu de la loi algérienne sur la TVA (Loi de finances)', 20, footerY + 4);

    doc.setTextColor(148, 163, 184);
    doc.text('CNC Connect Algérie - Plateforme de mise en relation industrie', 105, 290, { align: 'center' });

    return doc;
}

/**
 * Download invoice PDF
 */
export function downloadInvoice(data: InvoiceData): void {
    const pdf = generateInvoicePDF(data);
    pdf.save(`Facture_${data.invoiceNumber}.pdf`);
}

/**
 * Get invoice as blob
 */
export function getInvoicePDFBlob(data: InvoiceData): Blob {
    const pdf = generateInvoicePDF(data);
    return pdf.output('blob');
}
