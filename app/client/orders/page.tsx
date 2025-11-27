"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' }> = {
    pending: { label: 'En attente', variant: 'warning' },
    accepted: { label: 'Acceptée', variant: 'secondary' },
    machining: { label: 'En production', variant: 'default' },
    qc: { label: 'Contrôle Qualité', variant: 'secondary' },
    shipped: { label: 'Expédiée', variant: 'success' },
    delivered: { label: 'Livrée', variant: 'success' },
    cancelled: { label: 'Annulée', variant: 'destructive' },
};

export default function ClientOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // In a real app, we would filter by client_id linked to the user
            // For now, we'll just fetch all orders for demo purposes or filter if we had the link
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
            } else {
                setOrders(data as Order[]);
            }
            setLoading(false);
        };

        fetchOrders();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">Mes Commandes</h1>
                <div className="w-72 relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Rechercher une commande..." className="pl-10" />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Chargement...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Aucune commande</h3>
                        <p className="text-slate-500 mb-6">Vous n'avez pas encore passé de commande.</p>
                        <Link href="/devis">
                            <Button>Créer mon premier devis</Button>
                        </Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-slate-900">Commande {order.order_number}</h3>
                                            <Badge variant={STATUS_MAP[order.status]?.variant || 'secondary'}>
                                                {STATUS_MAP[order.status]?.label || order.status}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-500 text-sm">
                                            {order.file_name} • {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 self-end sm:self-center">
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Montant Total</div>
                                        <div className="font-bold text-slate-900 text-lg">
                                            {order.price_total ? `${order.price_total.toLocaleString('fr-FR')} DA` : '-'}
                                        </div>
                                    </div>
                                    <Link href={`/client/orders/${order.id}`}>
                                        <Button className="group-hover:bg-blue-700 transition-colors">
                                            Détails <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Progress Bar (Visual Flair) */}
                            <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                    style={{
                                        width: order.status === 'delivered' ? '100%' :
                                            order.status === 'shipped' ? '80%' :
                                                order.status === 'qc' ? '60%' :
                                                    order.status === 'machining' ? '40%' :
                                                        order.status === 'accepted' ? '20%' : '5%'
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
