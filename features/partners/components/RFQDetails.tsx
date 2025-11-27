"use client";

import { useState } from 'react';
import { RFQ, PartnerBid } from '../types/partner.types';
import Viewer3D from '@/features/devis/components/Viewer3D';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Download, CheckCircle, AlertCircle, Clock, Box, MapPin } from 'lucide-react';
import * as THREE from 'three';

interface RFQDetailsProps {
    rfqId: string;
    onBack: () => void;
}

// Mock RFQ Data
const MOCK_RFQ: RFQ = {
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
};

export default function RFQDetails({ rfqId, onBack }: RFQDetailsProps) {
    const [rfq] = useState<RFQ>(MOCK_RFQ);
    const [bidPrice, setBidPrice] = useState<string>(rfq.targetPrice?.toString() || '');
    const [bidLeadTime, setBidLeadTime] = useState<string>('7');
    const [bidMessage, setBidMessage] = useState<string>('');
    const [geometry] = useState<THREE.BufferGeometry | null>(null); // Would be loaded from server

    const handleSubmitBid = () => {
        const bid: Partial<PartnerBid> = {
            quoteId: rfq.id,
            price: parseFloat(bidPrice),
            leadTimeDays: parseInt(bidLeadTime),
            message: bidMessage,
            status: 'pending',
        };
        console.log('Submitting bid:', bid);
        alert('Offre soumise avec succès !');
    };

    const handleAcceptTarget = () => {
        if (rfq.targetPrice) {
            setBidPrice(rfq.targetPrice.toString());
            handleSubmitBid();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{rfq.partName}</h1>
                    <p className="text-sm text-slate-500">Référence: {rfq.id}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    {rfq.status.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 3D Viewer */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-0 overflow-hidden">
                        <div className="h-[500px] bg-slate-50">
                            <Viewer3D
                                fileBuffer={null}
                                fileName={rfq.partName}
                                geometry={geometry}
                            />
                        </div>
                        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Télécharger STEP
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Télécharger Plan 2D
                            </Button>
                        </div>
                    </Card>

                    {/* Technical Specs */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Spécifications Techniques</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-slate-500">Matière</div>
                                <div className="font-medium text-slate-900">{rfq.material}</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Procédé</div>
                                <div className="font-medium text-slate-900">{rfq.process}</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Quantité</div>
                                <div className="font-medium text-slate-900">{rfq.quantity} pièces</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Délai souhaité</div>
                                <div className="font-medium text-slate-900">{rfq.deadline || 'Flexible'}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Bidding Form */}
                <div className="space-y-4">
                    {/* Target Price Card */}
                    {rfq.targetPrice && (
                        <Card className="p-6 bg-blue-50 border-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                    <Box className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-blue-700 font-medium">Prix Cible Client</div>
                                    <div className="text-2xl font-black text-blue-900 mt-1">
                                        {rfq.targetPrice} DA
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">par pièce</div>
                                    <Button
                                        onClick={handleAcceptTarget}
                                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Accepter ce prix
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Custom Bid Form */}
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4">Soumettre une Offre</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Votre Prix (DA / pièce)
                                </label>
                                <Input
                                    type="number"
                                    value={bidPrice}
                                    onChange={(e) => setBidPrice(e.target.value)}
                                    placeholder="2500"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Délai de Livraison (jours)
                                </label>
                                <Input
                                    type="number"
                                    value={bidLeadTime}
                                    onChange={(e) => setBidLeadTime(e.target.value)}
                                    placeholder="7"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Message (optionnel)
                                </label>
                                <textarea
                                    value={bidMessage}
                                    onChange={(e) => setBidMessage(e.target.value)}
                                    placeholder="Précisions sur votre offre..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleSubmitBid}
                                className="w-full"
                                disabled={!bidPrice || !bidLeadTime}
                            >
                                Envoyer l'Offre
                            </Button>
                        </div>
                    </Card>

                    {/* Info Card */}
                    <Card className="p-4 bg-amber-50 border-amber-200">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <strong>Important:</strong> Une fois votre offre soumise, le client sera notifié et pourra vous contacter directement.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
