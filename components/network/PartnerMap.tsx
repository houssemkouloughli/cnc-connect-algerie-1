'use client';

import { MapPin } from 'lucide-react';
import type { Partner } from '@/lib/queries/network';

interface PartnerMapProps {
    partners: Partner[];
}

export default function PartnerMap({ partners }: PartnerMapProps) {
    return (
        <div className="w-full h-[600px] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <MapPin className="w-16 h-16 mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Carte Interactive Indisponible</h3>
            <p className="max-w-md">
                La visualisation cartographique est temporairement désactivée pour maintenance technique.
                Veuillez utiliser la vue "Liste" pour consulter les ateliers partenaires.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-left max-w-lg w-full">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="block text-2xl font-bold text-blue-600">{partners.length}</span>
                    <span className="text-sm text-slate-600">Partenaires actifs</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="block text-2xl font-bold text-green-600">
                        {new Set(partners.map(p => p.wilaya_code)).size}
                    </span>
                    <span className="text-sm text-slate-600">Wilayas couvertes</span>
                </div>
            </div>
        </div>
    );
}
