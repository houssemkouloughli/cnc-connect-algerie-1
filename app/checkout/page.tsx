"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import WilayaSelector from '@/components/ui/WilayaSelector';
import { PAYMENT_METHODS } from '@/lib/constants/payment-methods';
import { calculateShippingCost, getEstimatedDeliveryDays } from '@/lib/utils/shipping';
import { getWilayaByCode } from '@/lib/constants/wilayas';
import { Package, CreditCard, Truck, CheckCircle } from 'lucide-react';

// Mock Quote Data
const MOCK_QUOTE = {
    id: 'quote-001',
    partName: 'Support Moteur V2',
    quantity: 50,
    material: 'Aluminium 6061',
    finish: 'Anodisation',
    unitPrice: 2500,
    workshopWilaya: '16', // Alger
};

export default function CheckoutPage() {
    const [clientWilaya, setClientWilaya] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    const materialCost = MOCK_QUOTE.unitPrice * MOCK_QUOTE.quantity;
    const shippingCost = clientWilaya ? calculateShippingCost(MOCK_QUOTE.workshopWilaya, clientWilaya, 10) : 0;
    const totalCost = materialCost + shippingCost;
    const deliveryDays = clientWilaya ? getEstimatedDeliveryDays(MOCK_QUOTE.workshopWilaya, clientWilaya) : 0;

    const handlePlaceOrder = () => {
        if (!clientWilaya || !selectedPayment) {
            alert('Veuillez sélectionner une wilaya et un mode de paiement.');
            return;
        }
        setOrderPlaced(true);
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <Card className="max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Commande Confirmée !</h2>
                    <p className="text-slate-600 mb-6">
                        Votre commande a été enregistrée. L'atelier va préparer votre pièce.
                    </p>
                    <div className="bg-slate-100 p-4 rounded-lg text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Référence:</span>
                            <span className="font-bold">{MOCK_QUOTE.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Livraison estimée:</span>
                            <span className="font-bold">{deliveryDays} jours</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Total:</span>
                            <span className="font-bold text-lg">{totalCost.toLocaleString()} DA</span>
                        </div>
                    </div>
                    <Button onClick={() => window.location.href = '/dashboard'} className="w-full mt-6">
                        Retour au Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Finaliser la Commande</h1>
                    <p className="text-slate-500">Vérifiez les détails et choisissez votre mode de paiement</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details & Shipping */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Package className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold">Résumé de la Commande</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Pièce:</span>
                                    <span className="font-medium">{MOCK_QUOTE.partName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Quantité:</span>
                                    <span className="font-medium">{MOCK_QUOTE.quantity} pièces</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Matière:</span>
                                    <span className="font-medium">{MOCK_QUOTE.material}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Finition:</span>
                                    <span className="font-medium">{MOCK_QUOTE.finish}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-slate-200">
                                    <span className="text-slate-600">Prix unitaire:</span>
                                    <span className="font-medium">{MOCK_QUOTE.unitPrice.toLocaleString()} DA</span>
                                </div>
                            </div>
                        </Card>

                        {/* Shipping */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Truck className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold">Livraison</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Votre Wilaya</label>
                                    <WilayaSelector
                                        value={clientWilaya}
                                        onChange={setClientWilaya}
                                        placeholder="Sélectionnez votre wilaya"
                                    />
                                </div>
                                {clientWilaya && (
                                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">De:</span>
                                            <span className="font-medium text-blue-900">
                                                {getWilayaByCode(MOCK_QUOTE.workshopWilaya)?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Vers:</span>
                                            <span className="font-medium text-blue-900">
                                                {getWilayaByCode(clientWilaya)?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-blue-200">
                                            <span className="text-blue-700">Délai estimé:</span>
                                            <span className="font-bold text-blue-900">{deliveryDays} jours</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Payment Method */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold">Mode de Paiement</h2>
                            </div>
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedPayment === method.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={selectedPayment === method.id}
                                            onChange={(e) => setSelectedPayment(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">{method.name}</div>
                                            <div className="text-sm text-slate-500">{method.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Price Breakdown */}
                    <div>
                        <Card className="p-6 sticky top-6">
                            <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Sous-total ({MOCK_QUOTE.quantity} pcs)</span>
                                    <span className="font-medium">{materialCost.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Frais de livraison</span>
                                    <span className="font-medium">
                                        {clientWilaya ? `${shippingCost.toLocaleString()} DA` : '-'}
                                    </span>
                                </div>
                                <div className="border-t border-slate-200 pt-3 flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-blue-600">
                                        {clientWilaya ? `${totalCost.toLocaleString()} DA` : '-'}
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={handlePlaceOrder}
                                className="w-full mt-6"
                                disabled={!clientWilaya || !selectedPayment}
                            >
                                Confirmer la Commande
                            </Button>
                            {(!clientWilaya || !selectedPayment) && (
                                <p className="text-xs text-slate-500 text-center mt-2">
                                    Sélectionnez une wilaya et un mode de paiement
                                </p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
