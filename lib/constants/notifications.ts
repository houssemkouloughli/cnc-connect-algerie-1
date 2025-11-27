export type NotificationType = 'bid' | 'approval' | 'order' | 'message' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}

// Mock Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-001',
        type: 'bid',
        title: 'Nouvelle offre reçue',
        message: 'MecaPrécision a soumis une offre pour Support Moteur V2',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        actionUrl: '/partner/dashboard',
    },
    {
        id: 'notif-002',
        type: 'approval',
        title: 'Atelier approuvé',
        message: 'Votre atelier a été approuvé par l\'administrateur',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
        id: 'notif-003',
        type: 'order',
        title: 'Commande confirmée',
        message: 'Votre commande #Q-001 a été confirmée',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
        actionUrl: '/orders/Q-001',
    },
    {
        id: 'notif-004',
        type: 'message',
        title: 'Nouveau message',
        message: 'Un client vous a envoyé un message',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
];
