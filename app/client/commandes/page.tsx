'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getClientOrders, type Order, type OrderStatus } from '@/lib/queries/orders';
import OrderCard from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingCart, Filter } from 'lucide-react';

export default function ClientOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | OrderStatus>('all');

    useEffect(() => {
        checkAuthAndLoadOrders();
    }, []);

    const checkAuthAndLoadOrders = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login?redirect=/client/commandes');
            return;
        }

        try {
            const data = await getClientOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        filter === 'all' || order.status === filter
    );

    // Statistiques
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => ['confirmed', 'in_production', 'shipped'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Mes Commandes</h1>
                    <p className="text-slate-600">Suivez l'état de vos commandes en temps réel</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">Total</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">En attente</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">En cours</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">Livrées</p>
                        <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Filtrer par statut</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Toutes ({orders.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            En attente ({stats.pending})
                        </button>
                        <button
                            onClick={() => setFilter('confirmed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'confirmed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Confirmées
                        </button>
                        <button
                            onClick={() => setFilter('in_production')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'in_production'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            En production
                        </button>
                        <button
                            onClick={() => setFilter('delivered')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'delivered'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Livrées ({stats.delivered})
                        </button>
                    </div>
                </div>

                {/* Liste des commandes */}
                {filteredOrders.length === 0 ? (
                    <EmptyState
                        icon={ShoppingCart}
                        title={filter === 'all' ? "Aucune commande" : `Aucune commande ${filter === 'pending' ? 'en attente' : filter}`}
                        description={filter === 'all' ? "Créez un devis et acceptez une offre pour créer votre première commande." : "Essayez de changer le filtre pour voir d'autres commandes."}
                        actionLabel={filter === 'all' ? "Créer un devis" : undefined}
                        actionHref={filter === 'all' ? "/devis" : undefined}
                    />
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} viewAs="client" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
