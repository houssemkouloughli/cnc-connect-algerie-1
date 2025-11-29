'use client';

import { useState } from 'react';
import { Quote, acceptBid } from '@/lib/queries/quotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Calendar, Package, Layers, ChevronDown, ChevronUp, CheckCircle, Star, Clock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { getUserFriendlyError } from '@/lib/errors/handleError';

interface QuoteListProps {
    quotes: Quote[];
    onQuoteUpdate: () => void;
}

const statusLabels: Record<Quote['status'], string> = {
    open: 'Ouvert',
    closed: 'Fermé',
    awarded: 'Attribué'
};

const statusColors: Record<Quote['status'], string> = {
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-slate-100 text-slate-800',
    awarded: 'bg-green-100 text-green-800'
};

export default function QuoteList({ quotes, onQuoteUpdate }: QuoteListProps) {
    const { showToast } = useToast();
    const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedQuoteId(expandedQuoteId === id ? null : id);
    };

    const handleAcceptBid = async (quoteId: string, bidId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir accepter cette offre ? Cette action créera une commande.')) return;

        setIsProcessing(bidId);
        try {
            await acceptBid(quoteId, bidId);
            showToast('Offre acceptée avec succès ! Commande créée.', 'success');
            onQuoteUpdate();
        } catch (error) {
            const message = getUserFriendlyError(error);
            showToast(message, 'error');
        } finally {
            setIsProcessing(null);
        }
    };

    if (quotes.length === 0) {
        return (
            <Card>
                <CardContent className="p-0">
                    <EmptyState
                        icon={FileText}
                        title="Aucun devis pour le moment"
                        description="Commencez par créer votre premier devis pour recevoir des offres de nos partenaires."
                        actionLabel="Créer un Devis"
                        actionHref="/devis"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mes Devis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {quotes.map((quote) => {
                        // @ts-ignore - bids is added in the query but not in the base type yet
                        const bids = quote.bids || [];
                        const bidCount = bids.length;
                        const isExpanded = expandedQuoteId === quote.id;

                        return (
                            <div
                                key={quote.id}
                                className={`border rounded-lg transition-all ${isExpanded ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'
                                    }`}
                            >
                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => toggleExpand(quote.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-slate-900">
                                                    {quote.part_name}
                                                </h4>
                                                {bidCount > 0 && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                        {bidCount} offre{bidCount > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(quote.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={statusColors[quote.status]}>
                                                {statusLabels[quote.status]}
                                            </Badge>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Layers className="w-4 h-4 text-slate-400" />
                                            <span className="capitalize">{quote.material.replace('-', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Package className="w-4 h-4 text-slate-400" />
                                            <span>{quote.quantity} pièce(s)</span>
                                        </div>
                                        {quote.target_price && (
                                            <div className="text-slate-700">
                                                <span className="font-medium">{quote.target_price.toLocaleString('fr-FR')} DZD</span> (Cible)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bids Section */}
                                {isExpanded && (
                                    <div className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-lg">
                                        <h5 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                            Offres reçues
                                            <span className="text-xs font-normal text-slate-500">({bidCount})</span>
                                        </h5>

                                        {bidCount === 0 ? (
                                            <p className="text-sm text-slate-500 italic">Aucune offre pour le moment. Revenez plus tard !</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {bids.map((bid: any) => (
                                                    <div key={bid.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-semibold text-slate-900">{bid.partner?.company_name}</span>
                                                                    <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                                                        <Star className="w-3 h-3 fill-yellow-400 mr-0.5" />
                                                                        {bid.partner?.rating}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-4 h-4" />
                                                                        {bid.lead_time_days} jours
                                                                    </div>
                                                                    {bid.message && (
                                                                        <span className="text-slate-500 italic truncate max-w-[200px]">
                                                                            "{bid.message}"
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[200px]">
                                                                <div className="text-right">
                                                                    <div className="text-lg font-bold text-blue-600">
                                                                        {bid.price.toLocaleString('fr-DZ')} DZD
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">Total TTC</div>
                                                                </div>

                                                                {quote.status === 'open' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAcceptBid(quote.id, bid.id);
                                                                        }}
                                                                        disabled={isProcessing === bid.id}
                                                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                                    >
                                                                        {isProcessing === bid.id ? (
                                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        )}
                                                                        Accepter
                                                                    </button>
                                                                )}

                                                                {bid.status === 'accepted' && (
                                                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Acceptée
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
