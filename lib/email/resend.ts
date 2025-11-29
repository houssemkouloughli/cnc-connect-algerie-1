import { Resend } from 'resend';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

/**
 * Envoie un email via Resend
 * @param to - Email du destinataire
 * @param subject - Sujet de l'email
 * @param html - Contenu HTML de l'email
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return null;
    }

    if (!process.env.RESEND_FROM_EMAIL) {
        console.error('RESEND_FROM_EMAIL not configured');
        return null;
    }

    try {
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', { to, subject, id: result.data?.id });
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        // Ne pas throw pour ne pas bloquer l'application si l'email échoue
        return null;
    }
}
