"use client";

import PartnerDashboard from '@/features/partners/components/PartnerDashboard';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';

export default function PartnerDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar (Simplified for Partner) */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="font-black text-xl tracking-tight">
                        CNC<span className="text-blue-500">CONNECT</span>
                        <span className="text-xs block font-normal text-slate-400 mt-1">Espace Partenaire</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl text-white font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Tableau de bord
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                        <FileText className="w-5 h-5" />
                        Mes Offres
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                        <Settings className="w-5 h-5" />
                        Paramètres
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                            M
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-medium truncate">MecaPrécision</div>
                            <div className="text-xs text-slate-400">Alger, DZ</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>
                    <NotificationBell />
                </header>

                <div className="p-8">
                    <PartnerDashboard />
                </div>
            </main>
        </div>
    );
}
