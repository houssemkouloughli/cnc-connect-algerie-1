"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Package, MessageSquare, Shield, AlertCircle } from 'lucide-react';
import { Notification, MOCK_NOTIFICATIONS } from '@/lib/constants/notifications';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'bid': return <Package className="w-5 h-5 text-blue-600" />;
            case 'approval': return <Shield className="w-5 h-5 text-green-600" />;
            case 'order': return <Package className="w-5 h-5 text-purple-600" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-orange-600" />;
            default: return <AlertCircle className="w-5 h-5 text-slate-600" />;
        }
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        return `Il y a ${Math.floor(seconds / 86400)}j`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p>Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        markAsRead(notif.id);
                                        if (notif.actionUrl) {
                                            window.location.href = notif.actionUrl;
                                        }
                                    }}
                                    className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-medium ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                                            <p className="text-xs text-slate-400 mt-2">{getTimeAgo(notif.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-200 text-center">
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Voir toutes les notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
