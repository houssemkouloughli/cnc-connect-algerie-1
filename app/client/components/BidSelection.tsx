'use client';

import { useState } from 'react';
import { getBidsForQuote, acceptBid } from '@/lib/queries/bids';
import { Check, MessageCircle, MapPin, Star, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getUserFriendlyError } from '@/lib/errors/handleError';
import MessagingPanel from '@/components/shared/MessagingPanel';
import type { BidWithPartner } from '@/lib/queries/bids';

interface BidSelectionProps {
    quoteId: string;
    onBidAccepted?: () => void;
}

export default function BidSelection({ quoteId, onBidAccepted }: BidSelectionProps) {
    const [bids, setBids] = useState<BidWithPartner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
    const [messagingOpen, setMessagingOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string } | null>(null);
    const { showToast } = useToast();

    useState(() => {
        loadBids();
    }, []);

    const loadBids = async () => {
        setIsLoading(true);
        try {
            const data = await getBidsForQuote(quoteId);
            setBids(data);
        } catch (error) {
            console.error('Error loading bids:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir accepter cette offre ? Cette action est irréversible.')) {
            return;
        }

        setAcceptingBidId(bidId);
        try {
            await acceptBid(quoteId, bidId);
            showToast('Offre acceptée ! Une commande a été créée.', 'success');
            if (onBidAccepted) onBidAccepted();
        } catch (error) {
            const friendlyError = getUserFriendlyError(error);
            showToast(friendlyError, 'error');
        } finally {
            setAcceptingBidId(null);
        }
    };

    const handleOpenMessaging = (partnerId: string, partnerName: string) => {
        setSelectedPartner({ id: partnerId, name: partnerName });
        setMessagingOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (bids.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium mb-1">Aucune offre reçue pour le moment</p>
                <p className="text-sm text-slate-500">Les partenaires vont soumettre leurs propositions sous 24-48h</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                    {bids.length} offre{bids.length > 1 ? 's' : ''} reçue{bids.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-slate-600">Triées par prix croissant</p>
            </div>

            {bids.map((bid, index) => (
                <div
                    key={bid.id}
                    className={`bg-white border-2 rounded-xl p-6 transition-all ${index === 0
                            ? 'border-green-500 shadow-lg'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-lg font-bold text-slate-900">
                                    {bid.partners.masked_name}
                                </h4>
                                {index === 0 && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        Meilleure offre
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Wilaya {bid.partners.wilaya_code}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{bid.partners.rating.toFixed(1)}/5</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>{bid.partners.completed_jobs} commandes complétées</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                                {bid.amount.toLocaleString('fr-DZ')} DZD
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                                <Clock className="w-4 h-4" />
                                <span>{bid.delivery_days} jours</span>
                            </div>
                        </div>
                    </div>

                    {bid.proposal_text && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">{bid.proposal_text}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleOpenMessaging(bid.partner_id, bid.partners.masked_name)}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Envoyer un message
                        </button>
                        <button
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={acceptingBidId !== null}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {acceptingBidId === bid.id ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Accepter cette offre
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ))}

            {/* Messaging Panel */}
            {selectedPartner && (
                <MessagingPanel
                    quoteId={quoteId}
                    receiverId={selectedPartner.id}
                    receiverName={selectedPartner.name}
                    isOpen={messagingOpen}
                    onClose={() => setMessagingOpen(false)}
                />
            )}
        </div>
    );
}
