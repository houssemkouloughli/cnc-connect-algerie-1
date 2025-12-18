"use client";

import { Bell, Search, User, LogOut, Plus, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardHeader() {
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 transition-transform duration-300 transform -translate-y-[90%] hover:translate-y-0 shadow-md">
            {/* Search */}
            <div className="w-96">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher une commande, un client..."
                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-50">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 relative">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-900">Meca Précision</div>
                        <div className="text-xs text-slate-500">Admin</div>
                    </div>

                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border border-blue-700 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        <User className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-slate-200">
                                <p className="text-sm font-medium text-slate-900">Menu Admin</p>
                            </div>

                            <Link href="/admin-setup">
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                                    <Plus className="w-4 h-4" />
                                    Ajouter un Admin
                                </button>
                            </Link>

                            <Link href="/profile">
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                                    <Lock className="w-4 h-4" />
                                    Changer mot de passe
                                </button>
                            </Link>

                            <div className="border-t border-slate-200">
                                <button
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left disabled:opacity-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {loading ? 'Déconnexion...' : 'Déconnexion'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
