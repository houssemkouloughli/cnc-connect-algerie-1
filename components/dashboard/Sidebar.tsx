"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Briefcase,
    DollarSign,
    Settings,
    LogOut,
    Store
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
    { label: 'Vue d\'ensemble', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Commandes', icon: ShoppingCart, href: '/dashboard/orders' },
    { label: 'Inventaire', icon: Package, href: '/dashboard/inventory' },
    { label: 'Clients', icon: Users, href: '/dashboard/clients' },
    { label: 'Employés', icon: Briefcase, href: '/dashboard/employees' },
    { label: 'Finances', icon: DollarSign, href: '/dashboard/finances' },
    { label: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 z-50">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none">CNC Connect</h1>
                    <span className="text-xs text-slate-400">Espace Atelier</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
