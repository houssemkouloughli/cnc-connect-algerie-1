"use client";

import { useState } from 'react';
import { RFQ } from '../types/partner.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Calendar, Box, ArrowRight } from 'lucide-react';
import RFQDetails from './RFQDetails';

// Mock Data
const MOCK_RFQS: RFQ[] = [
    {
        id: 'rfq-001',
        clientId: 'client-a',
        partName: 'Support Moteur V2',
        quantity: 50,
        material: 'Aluminium 6061',
        process: 'Fraisage 3 Axes',
        targetPrice: 2500,
        deadline: '2023-12-15',
        status: 'open',
        createdAt: '2023-11-25',
    },
    {
        id: 'rfq-002',
        clientId: 'client-b',
        partName: 'Axe de Transmission',
        quantity: 10,
        material: 'Acier Inox 304',
        process: 'Tournage',
        targetPrice: 4500,
        status: 'open',
        createdAt: '2023-11-26',
    },
    {
        id: 'rfq-003',
        clientId: 'client-c',
        partName: 'Boitier Electronique',
        quantity: 5,
        material: 'ABS',
        process: 'Impression 3D / Usinage',
        status: 'open',
        createdAt: '2023-11-27',
    }
];

export default function PartnerDashboard() {
    const [rfqs] = useState<RFQ[]>(MOCK_RFQS);
    const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

    if (selectedRfqId) {
        return <RFQDetails rfqId={selectedRfqId} onBack={() => setSelectedRfqId(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Appels d'Offres (RFQs)</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filtres</Button>
                    <Button variant="outline" size="sm">Trier par date</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rfqs.map((rfq) => (
                    <Card
                        key={rfq.id}
                        className="p-5 hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => setSelectedRfqId(rfq.id)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {rfq.partName}
                                </h3>
                                <div className="text-xs text-slate-500">Ref: {rfq.id}</div>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                {rfq.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Box className="w-4 h-4 text-slate-400" />
                                <span>{rfq.quantity} pièces • {rfq.material}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>Alger (Livraison)</span>
                            </div>
                            {rfq.deadline && (
                                <div className="flex items-center gap-2 text-orange-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Avant le {rfq.deadline}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="font-bold text-slate-900">
                                {rfq.targetPrice ? `${rfq.targetPrice} DA / pc` : 'Sur devis'}
                            </div>
                            <Button size="sm" className="group-hover:translate-x-1 transition-transform">
                                Voir <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
