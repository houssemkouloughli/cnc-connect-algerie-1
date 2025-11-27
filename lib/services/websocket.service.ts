"use client";

/**
 * WebSocket Notification Service
 * Mock implementation for real-time notifications
 * 
 * In production, integrate with:
 * - Socket.io
 * - Pusher
 * - Ably
 * - AWS AppSync (GraphQL subscriptions)
 */

import { Notification } from '@/lib/constants/notifications';

type NotificationCallback = (notification: Notification) => void;

export class WebSocketService {
    private static instance: WebSocketService;
    private callbacks: NotificationCallback[] = [];
    private mockInterval: NodeJS.Timeout | null = null;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Connect to WebSocket server (mock)
     */
    connect(userId: string): void {
        console.log('🔌 [WebSocket] Connecting for user:', userId);

        // In production:
        // const socket = io('wss://api.cncconnect.dz', { auth: { userId } });
        // socket.on('notification', (data) => this.handleNotification(data));

        // Mock: Simulate receiving notifications every 30 seconds
        this.mockInterval = setInterval(() => {
            this.simulateNotification();
        }, 30000);
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect(): void {
        console.log('🔌 [WebSocket] Disconnecting');
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
            this.mockInterval = null;
        }

        // In production:
        // socket.disconnect();
    }

    /**
     * Subscribe to notifications
     */
    onNotification(callback: NotificationCallback): () => void {
        this.callbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Emit notification to all subscribers
     */
    private handleNotification(notification: Notification): void {
        console.log('📬 [WebSocket] New notification:', notification);
        this.callbacks.forEach(callback => callback(notification));
    }

    /**
     * Simulate receiving a notification (for demo purposes)
     */
    private simulateNotification(): void {
        const mockNotifications: Notification[] = [
            {
                id: `notif-${Date.now()}`,
                type: 'bid',
                title: 'Nouvelle offre',
                message: 'Un atelier a soumis une offre pour votre pièce',
                read: false,
                createdAt: new Date().toISOString(),
            },
            {
                id: `notif-${Date.now()}`,
                type: 'message',
                title: 'Nouveau message',
                message: 'Vous avez reçu un message d\'un client',
                read: false,
                createdAt: new Date().toISOString(),
            },
        ];

        const randomNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        this.handleNotification(randomNotif);
    }

    /**
     * Manually trigger a notification (for testing)
     */
    triggerNotification(notification: Notification): void {
        this.handleNotification(notification);
    }
}

// Export singleton instance
export const wsService = WebSocketService.getInstance();
