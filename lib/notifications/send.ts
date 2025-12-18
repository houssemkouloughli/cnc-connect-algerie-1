import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';
import {
    newBidEmailTemplate,
    bidAcceptedEmailTemplate,
    orderStatusEmailTemplate,
} from '@/lib/email/templates';

export type NotificationType = 'new_bid' | 'bid_accepted' | 'order_status' | 'new_message';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: any;
    sendEmailNotification?: boolean;
    userEmail?: string;
    emailHtml?: string;
}

/**
 * Crée une notification in-app et optionnellement envoie un email
 */
export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
    metadata = {},
    sendEmailNotification = false,
    userEmail,
    emailHtml,
}: CreateNotificationParams) {
    const supabase = createClient();

    try {
        // 1. Créer notification in-app
        const { error: dbError } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                link,
                metadata,
            } as any);

        if (dbError) {
            console.error('Error creating notification in DB:', dbError);
        }

        // 2. Envoyer email si demandé
        if (sendEmailNotification && userEmail && emailHtml) {
            await sendEmail({
                to: userEmail,
                subject: title,
                html: emailHtml,
            });
        }
    } catch (error) {
        console.error('Error in createNotification:', error);
        // Ne pas throw pour ne pas blocker l'application
    }
}

/**
 * Notifie un client qu'il a reçu une nouvelle offre
 */
export async function notifyNewBid({
    clientId,
    clientEmail,
    clientName,
    partName,
    partnerName,
    bidAmount,
    quoteId,
}: {
    clientId: string;
    clientEmail: string;
    clientName: string;
    partName: string;
    partnerName: string;
    bidAmount: number;
    quoteId: string;
}) {
    const bidLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client`;

    await createNotification({
        userId: clientId,
        type: 'new_bid',
        title: 'Nouvelle offre reçue !',
        message: `${partnerName} a soumis une offre de ${bidAmount.toLocaleString('fr-DZ')} DZD pour "${partName}".`,
        link: `/client`,
        metadata: {
            quote_id: quoteId,
            partner_name: partnerName,
            bid_amount: bidAmount,
        },
        sendEmailNotification: true,
        userEmail: clientEmail,
        emailHtml: newBidEmailTemplate({
            clientName,
            partName,
            partnerName,
            bidAmount,
            bidLink,
        }),
    });
}

/**
 * Notifie un partenaire que son offre a été acceptée
 */
export async function notifyBidAccepted({
    partnerId,
    partnerEmail,
    partnerName,
    partName,
    clientName,
    orderAmount,
    orderId,
}: {
    partnerId: string;
    partnerEmail: string;
    partnerName: string;
    partName: string;
    clientName: string;
    orderAmount: number;
    orderId: string;
}) {
    const orderLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/partner/dashboard`;

    await createNotification({
        userId: partnerId,
        type: 'bid_accepted',
        title: 'Félicitations ! Offre acceptée',
        message: `Votre offre pour "${partName}" a été acceptée par ${clientName}. Nouvelle commande créée.`,
        link: `/partner/dashboard`,
        metadata: {
            order_id: orderId,
            client_name: clientName,
            order_amount: orderAmount,
        },
        sendEmailNotification: true,
        userEmail: partnerEmail,
        emailHtml: bidAcceptedEmailTemplate({
            partnerName,
            partName,
            clientName,
            orderAmount,
            orderLink,
        }),
    });
}

/**
 * Notifie un client d'un changement de statut de commande
 */
export async function notifyOrderStatusChange({
    clientId,
    clientEmail,
    clientName,
    partName,
    newStatus,
    orderId,
}: {
    clientId: string;
    clientEmail: string;
    clientName: string;
    partName: string;
    newStatus: 'confirmed' | 'in_production' | 'shipped' | 'delivered';
    orderId: string;
}) {
    const statusLabels: Record<typeof newStatus, string> = {
        confirmed: 'Confirmée',
        in_production: 'En production',
        shipped: 'Expédiée',
        delivered: 'Livrée',
    };

    const statusLabel = statusLabels[newStatus];
    const orderLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/commande/${orderId}`;

    await createNotification({
        userId: clientId,
        type: 'order_status',
        title: 'Mise à jour de commande',
        message: `Votre commande "${partName}" est maintenant : ${statusLabel}`,
        link: `/client/commande/${orderId}`,
        metadata: {
            order_id: orderId,
            new_status: newStatus,
        },
        sendEmailNotification: true,
        userEmail: clientEmail,
        emailHtml: orderStatusEmailTemplate({
            clientName,
            partName,
            newStatus,
            statusLabel,
            orderLink,
        }),
    });
}

/**
 * Récupère les notifications d'un utilisateur
 */
export async function getUserNotifications(userId: string, limit = 20) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data;
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(userId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all notifications as read:', error);
    }
}
