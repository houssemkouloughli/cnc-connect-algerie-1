'use client';

import { useState } from 'react';
import { type Order } from '@/lib/queries/orders';
import OrderCard from '@/components/orders/OrderCard';
import { updateOrderStatus } from '@/lib/queries/orders';
import { useToast } from '@/components/ui/Toast';
import { PackageCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface PartnerOrdersProps {
    orders: Order[];
    onOrderUpdated: () => void;
}

export default function PartnerOrders({ orders, onOrderUpdated }: PartnerOrdersProps) {
    const { showToast } = useToast();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        setIsUpdating(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            showToast('Statut mis à jour avec succès', 'success');
            onOrderUpdated();
        } catch (error) {
            showToast('Erreur lors de la mise à jour', 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    if (orders.length === 0) {
        return (
            <EmptyState
                icon={PackageCheck}
                title="Aucune commande"
                description="Les commandes apparaîtront ici lorsque les clients accepteront vos offres."
            />
        );
    }

    return (
        <div className="space-y-6">
            {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <OrderCard order={order} viewAs="partner" />

                    {/* Actions de mise à jour de statut */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600 mb-3">Mettre à jour le statut :</p>
                            <div className="flex flex-wrap gap-2">
                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                        disabled={isUpdating === order.id}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Confirmer
                                    </button>
                                )}
                                {order.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'in_production')}
                                        disabled={isUpdating === order.id}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        Démarrer production
                                    </button>
                                )}
                                {order.status === 'in_production' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                        disabled={isUpdating === order.id}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Marquer comme expédiée
                                    </button>
                                )}
                                {order.status === 'shipped' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                        disabled={isUpdating === order.id}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Marquer comme livrée
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
