'use client';

import { useState, useEffect } from 'react';
import { getClientQuotes } from '@/lib/queries/quotes';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import BidSelection from './BidSelection';

interface Quote {
    id: string;
    part_name: string;
    material: string;
    quantity: number;
    status: 'draft' | 'open' | 'bidding_closed' | 'ordered';
    created_at: string;
}

export default function MyQuotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = async () => {
        setIsLoading(true);
        try {
            const data = await getClientQuotes();
            setQuotes(data as any);
        } catch (error) {
            console.error('Error loading quotes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return { icon: Clock, text: 'En attente d\'offres', color: 'bg-blue-100 text-blue-800' };
            case 'bidding_closed':
                return { icon: CheckCircle, text: 'Offre acceptée', color: 'bg-green-100 text-green-800' };
            case 'ordered':
                return { icon: Package, text: 'Commandé', color: 'bg-purple-100 text-purple-800' };
            default:
                return { icon: AlertCircle, text: 'Brouillon', color: 'bg-slate-100 text-slate-800' };
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (quotes.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium mb-1">Aucune demande de devis</p>
                <p className="text-sm text-slate-500">Commencez par uploader un fichier 3D</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Mes Demandes de Devis</h2>

            <div className="grid gap-4">
                {quotes.map((quote) => {
                    const status = getStatusBadge(quote.status);
                    const StatusIcon = status.icon;

                    return (
                        <div key={quote.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                            {quote.part_name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span>Matériau: {quote.material}</span>
                                            <span>Quantité: {quote.quantity}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {status.text}
                                    </span>
                                </div>

                                {quote.status === 'open' && (
                                    <button
                                        onClick={() => setSelectedQuoteId(selectedQuoteId === quote.id ? null : quote.id)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {selectedQuoteId === quote.id ? 'Masquer les offres' : 'Voir les offres reçues'}
                                    </button>
                                )}
                            </div>

                            {selectedQuoteId === quote.id && (
                                <div className="px-6 pb-6 border-t border-slate-200 pt-6">
                                    <BidSelection
                                        quoteId={quote.id}
                                        onBidAccepted={loadQuotes}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
