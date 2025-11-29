import Link from 'next/link';
import { type Order } from '@/lib/queries/orders';
import OrderStatusBadge from './OrderStatusBadge';
import { Calendar, Package, MapPin, ArrowRight } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    viewAs?: 'client' | 'partner';
}

export default function OrderCard({ order, viewAs = 'client' }: OrderCardProps) {
    const linkHref = viewAs === 'client'
        ? `/client/commande/${order.id}`
        : `/partner/commande/${order.id}`;

    return (
        <Link href={linkHref}>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">
                                {order.quote?.part_name || 'Commande'}
                            </h3>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                            Commande #{order.id.slice(0, 8)}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            {order.total_amount.toLocaleString('fr-DZ')} DZD
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Montant total</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="capitalize">
                            {order.quote?.material?.replace('-', ' ')} × {order.quote?.quantity}
                        </span>
                    </div>

                    {viewAs === 'client' && order.partner && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{order.partner.company_name}</span>
                        </div>
                    )}

                    {viewAs === 'partner' && order.client && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{order.client.company_name || order.client.full_name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end mt-4 text-blue-600 text-sm font-medium">
                    <span>Voir détails</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>
        </Link>
    );
}
