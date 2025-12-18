'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, Package, MessageCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Notification {
    id: string;
    type: 'new_bid' | 'bid_accepted' | 'order_status' | 'new_message';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

const typeIcons = {
    new_bid: Package,
    bid_accepted: CheckCircle,
    order_status: Package,
    new_message: MessageCircle
};

const typeColors = {
    new_bid: 'bg-blue-100 text-blue-600',
    bid_accepted: 'bg-green-100 text-green-600',
    order_status: 'bg-purple-100 text-purple-600',
    new_message: 'bg-yellow-100 text-yellow-600'
};

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();

        // Poll for new notifications
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                setNotifications(data as Notification[]);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const supabase = createClient();
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Tout marquer lu
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-slate-100 rounded"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center text-slate-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const Icon = typeIcons[notification.type] || Bell;
                                    const colorClass = typeColors[notification.type] || 'bg-slate-100 text-slate-600';

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''
                                                }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <p className="font-medium text-sm text-slate-900 pr-2">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {notification.link && (
                                                            <Link
                                                                href={notification.link}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                            >
                                                                Voir <ExternalLink className="w-3 h-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
