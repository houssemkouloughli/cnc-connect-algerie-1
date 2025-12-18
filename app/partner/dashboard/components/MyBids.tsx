'use client';

import { Calendar, Clock } from 'lucide-react';
import type { BidWithQuote } from '@/lib/queries/bids';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

interface MyBidsProps {
    bids: BidWithQuote[];
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    negotiating: 'bg-blue-100 text-blue-800'
};

const statusLabels: Record<string, string> = {
    pending: 'En Attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    negotiating: 'Négociation'
};

export default function MyBids({ bids }: MyBidsProps) {
    if (bids.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="Aucune offre soumise"
                description="Vous n'avez pas encore soumis d'offres. Consultez le marketplace pour commencer !"
            />
        );
    }

    return (
        <div className="space-y-4">
            {bids.map((bid) => (
                <div
                    key={bid.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {bid.quotes?.part_name || 'Devis supprimé'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Soumis le {new Date(bid.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{bid.delivery_days} jours</span>
                                </div>
                            </div>
                        </div>

                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[bid.status]
                                }`}
                        >
                            {statusLabels[bid.status]}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {bid.quotes && (
                            <>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Matériau</p>
                                    <p className="font-semibold text-slate-900 capitalize">
                                        {bid.quotes.material.replace('-', ' ')}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Quantité</p>
                                    <p className="font-semibold text-slate-900">
                                        {bid.quotes.quantity} pièce{bid.quotes.quantity > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </>
                        )}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-blue-600 mb-1">Votre Prix</p>
                            <p className="font-bold text-blue-900">
                                {bid.amount.toLocaleString('fr-DZ')} DZD
                            </p>
                        </div>
                    </div>

                    {bid.proposal_text && (
                        <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <p className="text-xs font-medium text-slate-600 mb-1">Votre Message</p>
                            <p className="text-sm text-slate-700">{bid.proposal_text}</p>
                        </div>
                    )}

                    {bid.status === 'accepted' && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                ✨ Félicitations ! Votre offre a été acceptée. Le client vous contactera bientôt.
                            </p>
                        </div>
                    )}

                    {bid.status === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-700">
                                Malheureusement, cette offre n'a pas été retenue. Continuez à soumettreoffres !
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
