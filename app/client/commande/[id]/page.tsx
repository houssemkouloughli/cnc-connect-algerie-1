'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrderDetails, confirmOrder, cancelOrder, type Order } from '@/lib/queries/orders';
import { getOrderPayment, type Payment } from '@/lib/queries/payments';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import PaymentStatus from '@/components/orders/PaymentStatus';
import ShippingTracker from '@/components/orders/ShippingTracker';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getUserFriendlyError } from '@/lib/errors/handleError';
import { ArrowLeft, Package, MapPin, Phone, Mail, Building, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const { showToast } = useToast();

    const [order, setOrder] = useState<Order | null>(null);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        checkAuthAndLoadOrder();
    }, [orderId]);

    const checkAuthAndLoadOrder = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login?redirect=/client/commandes');
            return;
        }

        try {
            // Load order details
            const orderData = await getOrderDetails(orderId);
            setOrder(orderData);

            // Load payment info if exists
            if (orderData) {
                const paymentData = await getOrderPayment(orderId);
                setPayment(paymentData);
            }
        } catch (error) {
            console.error('Error loading order:', error);
            showToast('Erreur lors du chargement de la commande', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!confirm('Confirmer cette commande ? Vous vous engagez à effectuer le paiement.')) return;

        setIsProcessing(true);
        try {
            await confirmOrder(orderId);
            showToast('Commande confirmée avec succès !', 'success');
            await checkAuthAndLoadOrder(); // Reload
        } catch (error) {
            showToast(getUserFriendlyError(error), 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

        setIsProcessing(true);
        try {
            await cancelOrder(orderId);
            showToast('Commande annulée', 'success');
            await checkAuthAndLoadOrder(); // Reload
        } catch (error) {
            showToast(getUserFriendlyError(error), 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-slate-600">Commande introuvable</p>
                    <Link href="/client/commandes">
                        <Button className="mt-4">Retour à mes commandes</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const showShipping = ['shipped', 'in_transit', 'delivered'].includes(order.status || '');

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Link href="/client/commandes" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Retour aux commandes
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {order.quote?.part_name || 'Commande'}
                            </h1>
                            <p className="text-slate-600">Commande #{order.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <OrderStatusBadge status={order.status} />
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                    {order.total_amount.toLocaleString('fr-DZ')} DZD
                                </div>
                                <p className="text-xs text-slate-500">Montant total</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Timeline */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Suivi de commande</h2>
                    <OrderTimeline currentStatus={order.status} />

                    {/* Shipping Tracker Integration */}
                    {showShipping && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <ShippingTracker
                                orderId={order.id}
                                shippingStatus={order.shipping_status || 'shipped'}
                                trackingNumber={order.tracking_number}
                                fromWilaya={order.partner?.wilaya_code}
                                // Default to Alger (16) if client wilaya unknown for now
                                toWilaya="16"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Détails produit */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Détails du produit
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Nom de la pièce</p>
                                    <p className="font-medium text-slate-900">{order.quote?.part_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Matériau</p>
                                    <p className="font-medium text-slate-900 capitalize">{order.quote?.material?.replace('-', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Quantité</p>
                                    <p className="font-medium text-slate-900">{order.quote?.quantity} pièce(s)</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Délai de fabrication</p>
                                    <p className="font-medium text-slate-900">{order.bid?.lead_time_days} jours</p>
                                </div>
                            </div>
                            {order.bid?.message && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-500 mb-1">Message du partenaire</p>
                                    <p className="text-slate-700 italic">"{order.bid.message}"</p>
                                </div>
                            )}
                        </div>

                        {/* Dates importantes */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Dates importantes
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Date de commande</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                {order.status !== 'pending' && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Dernière mise à jour</span>
                                        <span className="font-medium text-slate-900">
                                            {new Date(order.updated_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informations partenaire et Actions */}
                    <div className="space-y-6">

                        {/* Actions & Paiement */}
                        <div className="space-y-6">
                            {/* Payment Status Component */}
                            <PaymentStatus
                                orderId={order.id}
                                amount={order.total_amount}
                                existingPayment={payment}
                                onPaymentSubmitted={() => checkAuthAndLoadOrder()}
                            />

                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
                                <div className="space-y-3">
                                    {order.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={handleConfirmOrder}
                                                disabled={isProcessing}
                                                className="w-full"
                                            >
                                                {isProcessing ? 'Traitement...' : 'Confirmer la commande'}
                                            </Button>
                                            <Button
                                                onClick={handleCancelOrder}
                                                disabled={isProcessing}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Annuler la commande
                                            </Button>
                                        </>
                                    )}
                                    {order.status === 'delivered' && (
                                        <Button variant="outline" className="w-full">
                                            Télécharger la facture
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Atelier partenaire
                            </h2>
                            {order.partner && (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Nom</p>
                                        <p className="font-medium text-slate-900">{order.partner.company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Wilaya</p>
                                        <p className="font-medium text-slate-900">Wilaya {order.partner.wilaya_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Note</p>
                                        <p className="font-medium text-yellow-600">{order.partner.rating} ★</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
