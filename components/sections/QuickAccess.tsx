import Link from 'next/link';
import { GraduationCap, Wrench, Settings, Network } from 'lucide-react';

export default function QuickAccess() {
    return (
        <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 px-1">Accès Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/formations" className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GraduationCap className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Formations</div>
                        <div className="text-xs text-purple-100 mt-1 font-medium">Apprenez le CNC</div>
                    </div>
                </Link>

                <Link href="/pieces" className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wrench className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Pièces</div>
                        <div className="text-xs text-amber-100 mt-1 font-medium">Boutique en ligne</div>
                    </div>
                </Link>

                <Link href="/maintenance" className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Settings className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Maintenance</div>
                        <div className="text-xs text-green-100 mt-1 font-medium">Service expert</div>
                    </div>
                </Link>

                <Link href="/reseau" className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Network className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Network className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg">Réseau</div>
                        <div className="text-xs text-blue-100 mt-1 font-medium">500+ ateliers</div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
