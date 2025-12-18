"use client";

import Link from 'next/link';
import { Menu, X, Phone, User, LogIn, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/utils/auth';
import NotificationCenter from '@/components/shared/NotificationCenter';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'client' | 'partner' | 'admin';
}

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                setUser(profile);
            }
            setLoading(false);
        };

        loadUser();

        // Listen for auth changes
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'SIGNED_IN' && session?.user) {
                loadUser();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getDashboardUrl = () => {
        if (!user) return '/';
        const roleMap: Record<string, string> = {
            client: '/client/dashboard',
            partner: '/partner/dashboard',
            admin: '/admin/dashboard',
        };
        return roleMap[user.role] || '/';
    };

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <header className="sticky top-0 z-[999] bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                            C
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                CNC<span className="text-blue-600">CONNECT</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Algérie</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Accueil</Link>
                        <Link href="/devis" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Devis Instantané</Link>
                        <Link href="/reseau" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Réseau Ateliers</Link>
                        <Link href="/formations" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Académie</Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <a href="tel:+213555555555" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm font-medium">0555 55 55 55</span>
                        </a>
                        <div className="h-6 w-px bg-slate-200"></div>

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <NotificationCenter />
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">
                                            {user.full_name || 'Mon Compte'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20">
                                                <div className="px-4 py-3 border-b border-slate-100">
                                                    <p className="text-sm font-medium text-slate-900">{user.full_name || 'Utilisateur'}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                    <div className="mt-1">
                                                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                                            {user.role === 'client' ? 'Client' : user.role === 'partner' ? 'Partenaire' : 'Admin'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={getDashboardUrl()}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Tableau de Bord
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Paramètres
                                                </Link>
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Déconnexion
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Connexion</span>
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <span>S'inscrire</span>
                                    <LogIn className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white">
                    <div className="px-4 py-6 space-y-4">
                        <Link href="/" className="block px-4 py-3 rounded-xl bg-slate-50 text-slate-900 font-medium">Accueil</Link>
                        <Link href="/devis" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">Devis Instantané</Link>
                        <Link href="/reseau" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">Réseau Ateliers</Link>
                        <Link href="/formations" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">Académie</Link>
                        <div className="border-t border-slate-100 my-4 pt-4">
                            {user ? (
                                <div className="space-y-2">
                                    <Link
                                        href={getDashboardUrl()}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Tableau de Bord</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        href="/login"
                                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Connexion</span>
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>S'inscrire</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
