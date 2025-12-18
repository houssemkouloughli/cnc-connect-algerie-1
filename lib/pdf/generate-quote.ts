import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuotePDFData {
    quoteId: string;
    quoteName: string;
    clientName: string;
    clientEmail: string;
    partName: string;
    material: string;
    finish: string;
    quantity: number;
    bidAmount: number;
    deliveryDays: number;
    partnerName: string;
    partnerWilaya: string;
    createdAt: Date;
}

/**
 * Generate a professional quote PDF
 */
export function generateQuotePDF(data: QuotePDFData): jsPDF {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138); // Blue-900
    doc.text('CNC Connect Algérie', 20, 20);

    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text('Devis Officiel', 20, 35);

    // Quote Info Box
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(20, 45, 170, 30, 'F');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(`Devis N°: ${data.quoteId.substring(0, 8).toUpperCase()}`, 25, 52);
    doc.text(`Date: ${data.createdAt.toLocaleDateString('fr-DZ')}`, 25, 59);
    doc.text(`Client: ${data.clientName}`, 25, 66);
    doc.text(`Email: ${data.clientEmail}`, 25, 73);

    // Part Details
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('Détails de la Pièce', 20, 90);

    const partDetails = [
        ['Nom de la pièce', data.partName],
        ['Matériau', data.material],
        ['Finition', data.finish],
        ['Quantité', data.quantity.toString()],
    ];

    autoTable(doc, {
        startY: 95,
        head: [['Description', 'Valeur']],
        body: partDetails,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // Blue-600
        margin: { left: 20, right: 20 },
    });

    // Pricing
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Offre Acceptée', 20, finalY);

    const pricingDetails = [
        ['Atelier', data.partnerName],
        ['Localisation', `Wilaya ${data.partnerWilaya}`],
        ['Délai de fabrication', `${data.deliveryDays} jours`],
        ['Prix Total', `${data.bidAmount.toLocaleString('fr-DZ')} DZD`],
    ];

    autoTable(doc, {
        startY: finalY + 5,
        body: pricingDetails,
        theme: 'striped',
        margin: { left: 20, right: 20 },
        styles: { fontSize: 11 },
    });

    // Total Price Highlight
    const priceY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(34, 197, 94); // Green-500
    doc.rect(20, priceY, 170, 20, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('PRIX TOTAL:', 25, priceY + 13);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(`${data.bidAmount.toLocaleString('fr-DZ')} DZD`, 150, priceY + 13, { align: 'right' });

    // Terms & Conditions
    const termsY = priceY + 35;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont(undefined, 'normal');
    doc.text('Conditions:', 20, termsY);
    doc.setFontSize(9);
    doc.text('• Ce devis est valable 30 jours à compter de la date d\'émission', 20, termsY + 5);
    doc.text('• Le délai de fabrication commence après réception du paiement', 20, termsY + 10);
    doc.text('• Les tolérances sont conformes aux standards ISO 2768-m sauf indication contraire', 20, termsY + 15);
    doc.text('• La livraison est à organiser séparément', 20, termsY + 20);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('CNC Connect Algérie - Plateforme de mise en relation industrie', 105, 285, { align: 'center' });
    doc.text('www.cnc-connect-algerie.com', 105, 290, { align: 'center' });

    return doc;
}

/**
 * Download PDF to user's device
 */
export function downloadQuotePDF(data: QuotePDFData): void {
    const pdf = generateQuotePDF(data);
    const filename = `Devis_${data.partName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    pdf.save(filename);
}

/**
 * Get PDF as blob (for uploading to storage)
 */
export function getQuotePDFBlob(data: QuotePDFData): Blob {
    const pdf = generateQuotePDF(data);
    return pdf.output('blob');
}
