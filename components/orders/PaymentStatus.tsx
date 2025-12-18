'use client';

import { useState } from 'react';
import { CreditCard, Building2, Smartphone, Wallet, DollarSign, CheckCircle, Clock, AlertCircle, XCircle, Upload } from 'lucide-react';
import { createPayment, type Payment } from '@/lib/queries/payments';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

interface PaymentStatusProps {
    orderId: string;
    amount: number;
    existingPayment?: Payment | null;
    onPaymentSubmitted?: () => void;
}

const paymentMethods = [
    { id: 'baridi_mob', name: 'BaridiMob', icon: Smartphone, color: 'bg-green-500', instructions: 'RIP: 00799999000123456789' },
    { id: 'ccp', name: 'CCP', icon: Wallet, color: 'bg-yellow-500', instructions: 'CCP: 123456 clé 89' },
    { id: 'bank_transfer', name: 'Virement Bancaire', icon: Building2, color: 'bg-blue-500', instructions: 'RIB: 00799999000123456789012' },
    { id: 'satim_card', name: 'Carte CIB/EDAHABIA', icon: CreditCard, color: 'bg-purple-500', instructions: 'Paiement en ligne sécurisé' },
    { id: 'cash', name: 'Espèces (à la livraison)', icon: DollarSign, color: 'bg-slate-500', instructions: 'Payable à la réception' }
] as const;

const statusConfig = {
    pending: { label: 'En attente de vérification', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    held: { label: 'Fonds en séquestre', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
    released: { label: 'Paiement libéré', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    refunded: { label: 'Remboursé', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
    failed: { label: 'Échec', icon: XCircle, color: 'text-red-600 bg-red-50' }
};

export default function PaymentStatus({ orderId, amount, existingPayment, onPaymentSubmitted }: PaymentStatusProps) {
    const [selectedMethod, setSelectedMethod] = useState<Payment['payment_method'] | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmitPayment = async () => {
        if (!selectedMethod) return;

        setSubmitting(true);
        try {
            await createPayment({
                order_id: orderId,
                amount,
                payment_method: selectedMethod,
                transaction_id: transactionId || undefined
            });
            showToast('Paiement soumis avec succès !', 'success');
            onPaymentSubmitted?.();
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Erreur lors du paiement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // If payment already exists, show status
    if (existingPayment) {
        const config = statusConfig[existingPayment.status];
        const StatusIcon = config.icon;
        const method = paymentMethods.find(m => m.id === existingPayment.payment_method);

        return (
            <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Paiement
                </h4>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${config.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="text-sm opacity-80">
                            {method?.name} • {existingPayment.amount.toLocaleString('fr-DZ')} DZD
                        </p>
                    </div>
                </div>

                {existingPayment.transaction_id && (
                    <p className="text-sm text-slate-600 mt-2">
                        Réf: {existingPayment.transaction_id}
                    </p>
                )}
            </div>
        );
    }

    // Show payment form
    return (
        <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payer {amount.toLocaleString('fr-DZ')} DZD
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-blue-300'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-medium text-center">{method.name}</span>
                        </button>
                    );
                })}
            </div>

            {selectedMethod && (
                <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                        <p className="font-medium text-blue-800">Instructions:</p>
                        <p className="text-blue-700">
                            {paymentMethods.find(m => m.id === selectedMethod)?.instructions}
                        </p>
                    </div>

                    {selectedMethod !== 'cash' && (
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Numéro de transaction (optionnel)"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    )}

                    <Button
                        onClick={handleSubmitPayment}
                        disabled={submitting}
                        className="w-full"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Envoi en cours...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Confirmer le paiement
                            </span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
