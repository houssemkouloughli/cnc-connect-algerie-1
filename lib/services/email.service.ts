/**
 * Email Notification Service
 * This is a mock implementation. In production, integrate with:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Resend
 */

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export interface EmailRecipient {
    email: string;
    name: string;
}

export class EmailService {
    /**
     * Send workshop approval email
     */
    static async sendWorkshopApproval(recipient: EmailRecipient, workshopName: string): Promise<boolean> {
        const template = this.getApprovalTemplate(workshopName);
        return this.sendEmail(recipient, template);
    }

    /**
     * Send workshop rejection email
     */
    static async sendWorkshopRejection(recipient: EmailRecipient, workshopName: string, reason?: string): Promise<boolean> {
        const template = this.getRejectionTemplate(workshopName, reason);
        return this.sendEmail(recipient, template);
    }

    /**
     * Send new bid notification
     */
    static async sendNewBidNotification(recipient: EmailRecipient, partName: string, bidAmount: number): Promise<boolean> {
        const template = this.getNewBidTemplate(partName, bidAmount);
        return this.sendEmail(recipient, template);
    }

    /**
     * Send order confirmation
     */
    static async sendOrderConfirmation(recipient: EmailRecipient, orderId: string, totalAmount: number): Promise<boolean> {
        const template = this.getOrderConfirmationTemplate(orderId, totalAmount);
        return this.sendEmail(recipient, template);
    }

    /**
     * Core email sending function (mock implementation)
     */
    private static async sendEmail(recipient: EmailRecipient, template: EmailTemplate): Promise<boolean> {
        console.log('📧 [EMAIL SERVICE] Sending email to:', recipient.email);
        console.log('Subject:', template.subject);
        console.log('Body:', template.text);

        // In production, replace with actual email service:
        // await sendgrid.send({ to: recipient.email, subject: template.subject, html: template.html });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;
    }

    // Email Templates

    private static getApprovalTemplate(workshopName: string): EmailTemplate {
        return {
            subject: '✅ Votre atelier a été approuvé - CNC Connect Algérie',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Félicitations ! 🎉</h2>
                    <p>Bonjour,</p>
                    <p>Nous avons le plaisir de vous informer que votre atelier <strong>${workshopName}</strong> a été approuvé sur la plateforme CNC Connect Algérie.</p>
                    <p>Vous pouvez maintenant :</p>
                    <ul>
                        <li>Consulter les appels d'offres disponibles</li>
                        <li>Soumettre des offres aux clients</li>
                        <li>Gérer vos commandes</li>
                    </ul>
                    <p>
                        <a href="https://cncconnect.dz/partner/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Accéder au tableau de bord
                        </a>
                    </p>
                    <p>Cordialement,<br>L'équipe CNC Connect Algérie</p>
                </div>
            `,
            text: `Félicitations ! Votre atelier ${workshopName} a été approuvé. Connectez-vous pour commencer à recevoir des commandes.`,
        };
    }

    private static getRejectionTemplate(workshopName: string, reason?: string): EmailTemplate {
        return {
            subject: 'Mise à jour de votre demande - CNC Connect Algérie',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ef4444;">Mise à jour de votre demande</h2>
                    <p>Bonjour,</p>
                    <p>Nous vous remercions pour votre intérêt pour CNC Connect Algérie.</p>
                    <p>Malheureusement, nous ne pouvons pas approuver votre atelier <strong>${workshopName}</strong> pour le moment.</p>
                    ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ''}
                    <p>Vous pouvez mettre à jour vos informations et soumettre une nouvelle demande.</p>
                    <p>Cordialement,<br>L'équipe CNC Connect Algérie</p>
                </div>
            `,
            text: `Votre demande pour ${workshopName} n'a pas été approuvée. ${reason || 'Veuillez nous contacter pour plus d\'informations.'}`,
        };
    }

    private static getNewBidTemplate(partName: string, bidAmount: number): EmailTemplate {
        return {
            subject: '🔔 Nouvelle offre reçue - CNC Connect Algérie',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Nouvelle offre reçue</h2>
                    <p>Bonjour,</p>
                    <p>Un atelier a soumis une offre pour votre pièce <strong>${partName}</strong>.</p>
                    <p><strong>Montant proposé :</strong> ${bidAmount.toLocaleString()} DA</p>
                    <p>
                        <a href="https://cncconnect.dz/quotes" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Voir l'offre
                        </a>
                    </p>
                    <p>Cordialement,<br>L'équipe CNC Connect Algérie</p>
                </div>
            `,
            text: `Nouvelle offre pour ${partName}: ${bidAmount.toLocaleString()} DA. Consultez votre tableau de bord.`,
        };
    }

    private static getOrderConfirmationTemplate(orderId: string, totalAmount: number): EmailTemplate {
        return {
            subject: '✅ Commande confirmée - CNC Connect Algérie',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Commande confirmée ✅</h2>
                    <p>Bonjour,</p>
                    <p>Votre commande <strong>#${orderId}</strong> a été confirmée.</p>
                    <p><strong>Montant total :</strong> ${totalAmount.toLocaleString()} DA</p>
                    <p>L'atelier va commencer la production de votre pièce.</p>
                    <p>
                        <a href="https://cncconnect.dz/orders/${orderId}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Suivre ma commande
                        </a>
                    </p>
                    <p>Cordialement,<br>L'équipe CNC Connect Algérie</p>
                </div>
            `,
            text: `Votre commande #${orderId} a été confirmée. Montant: ${totalAmount.toLocaleString()} DA.`,
        };
    }
}
