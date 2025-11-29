'use client';

import { useState } from 'react';
import { MapPin, Package, Calendar, TrendingUp } from 'lucide-react';
import type { QuoteWithClient } from '@/lib/queries/partners';
import BidModal from './BidModal';
import { EmptyState } from '@/components/ui/EmptyState';

interface QuoteMarketplaceProps {
    quotes: QuoteWithClient[];
    partnerId: string | null;
    onBidSubmitted: () => void;
}

export default function QuoteMarketplace({ quotes, partnerId, onBidSubmitted }: QuoteMarketplaceProps) {
    const [selectedQuote, setSelectedQuote] = useState<QuoteWithClient | null>(null);

    if (quotes.length === 0) {
        return (
            <EmptyState
                icon={Package}
                title="Aucun devis ouvert"
                description="Il n'y a pas de nouveaux devis disponibles pour le moment. Revenez plus tard !"
            />
        );
    }

    return (
        <>
            <div className="grid gap-4">
                {quotes.map((quote) => {
                    const hasMyBid = quote.bids?.some(bid => bid.partner_id === partnerId);
                    const bidCount = quote.bids?.length || 0;

                    return (
                        <div
                            key={quote.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {quote.part_name}
                                        </h3>
                                        {hasMyBid && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Offre soumise
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{quote.client?.wilaya_code || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {bidCount > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{bidCount} offre{bidCount > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Matériau</p>
                                    <p className="font-semibold text-slate-900 capitalize">
                                        {quote.material.replace('-', ' ')}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Quantité</p>
                                    <p className="font-semibold text-slate-900">
                                        {quote.quantity} pièce{quote.quantity > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Budget Cible</p>
                                    <p className="font-semibold text-slate-900">
                                        {quote.target_price
                                            ? `${quote.target_price.toLocaleString('fr-DZ')} DZD`
                                            : 'Non spécifié'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setSelectedQuote(quote)}
                                    disabled={hasMyBid || !partnerId}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {hasMyBid ? 'Offre déjà soumise' : 'Soumettre une Offre'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedQuote && partnerId && (
                <BidModal
                    quote={selectedQuote}
                    partnerId={partnerId}
                    onClose={() => setSelectedQuote(null)}
                    onSuccess={() => {
                        setSelectedQuote(null);
                        onBidSubmitted();
                    }}
                />
            )}
        </>
    );
}
