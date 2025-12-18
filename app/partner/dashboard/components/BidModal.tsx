'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { submitBid } from '@/lib/queries/bids';
import { useToast } from '@/components/ui/Toast';
import { getUserFriendlyError } from '@/lib/errors/handleError';

interface BidModalProps {
    quote: {
        id: string;
        part_name: string;
        material: string;
        finish: string;
        quantity: number;
        target_price?: number;
    };
    onClose: () => void;
    onBidSubmitted: () => void;
}

export default function BidModal({ quote, onClose, onBidSubmitted }: BidModalProps) {
    const [amount, setAmount] = useState('');
    const [deliveryDays, setDeliveryDays] = useState('');
    const [proposalText, setProposalText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !deliveryDays) {
            showToast('Veuillez remplir tous les champs requis', 'error');
            return;
        }

        const amountNum = parseFloat(amount);
        const daysNum = parseInt(deliveryDays);

        if (amountNum <= 0 || daysNum <= 0) {
            showToast('Le prix et le délai doivent être positifs', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            await submitBid({
                quote_id: quote.id,
                amount: amountNum,
                delivery_days: daysNum,
                proposal_text: proposalText || undefined
            });

            showToast('Offre soumise avec succès !', 'success');
            onBidSubmitted();
            onClose(); // Close the modal after successful submission
        } catch (error) {
            const friendlyError = getUserFriendlyError(error);
            showToast(friendlyError, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Soumettre une Offre</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Quote Info */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">{quote.part_name}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-slate-600">Matériau : </span>
                            <span className="font-medium text-slate-900 capitalize">
                                {quote.material.replace('-', ' ')}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-600">Quantité : </span>
                            <span className="font-medium text-slate-900">{quote.quantity}</span>
                        </div>
                        {quote.target_price && (
                            <div className="col-span-2">
                                <span className="text-slate-600">Budget cible : </span>
                                <span className="font-medium text-slate-900">
                                    {quote.target_price.toLocaleString('fr-DZ')} DZD
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Prix Total (DZD) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ex: 50000"
                                min="1"
                                step="0.01"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Délai de Fabrication (jours) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={deliveryDays}
                                onChange={(e) => setDeliveryDays(e.target.value)}
                                placeholder="Ex: 7"
                                min="1"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Message / Notes (optionnel)
                            </label>
                            <textarea
                                value={proposalText}
                                onChange={(e) => setProposalText(e.target.value)}
                                placeholder="Informations complémentaires, certifications, garanties..."
                                rows={3}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Envoi...' : 'Soumettre l\'Offre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
