"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    User,
    LogOut,
    Package
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

const MENU_ITEMS = [
    { label: 'Vue d\'ensemble', icon: LayoutDashboard, href: '/client/dashboard' },
    { label: 'Mes Commandes', icon: Package, href: '/client/orders' },
    { label: 'Mes Devis', icon: FileText, href: '/client/quotes' },
    { label: 'Mon Profil', icon: User, href: '/client/profile' },
];

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="font-black text-xl text-slate-900">
                            CNC Connect
                        </Link>
                        <nav className="hidden md:flex items-center gap-1">
                            {MENU_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 hidden sm:flex"
                            onClick={() => router.push('/devis')}
                        >
                            + Nouveau Devis
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-600"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
