'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications/send';
import Link from 'next/link';

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    type: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();

        // Subscribe to realtime notifications
        const supabase = createClient();
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                () => {
                    loadNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadNotifications = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        setNotifications(data || []);
        setLoading(false);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId);
        await loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await markAllNotificationsAsRead(user.id);
            await loadNotifications();
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl border border-slate-200 z-40 max-h-[500px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm">Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                {notif.link ? (
                                                    <Link
                                                        href={notif.link}
                                                        onClick={() => {
                                                            handleMarkAsRead(notif.id);
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        <h4 className="font-medium text-slate-900 text-sm hover:text-blue-600">
                                                            {notif.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <h4 className="font-medium text-slate-900 text-sm">
                                                            {notif.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    className="text-blue-600 hover:text-blue-700 p-1"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
