"use client";

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'] & {
    clients: Database['public']['Tables']['clients']['Row'] | null
};

interface OrdersTableProps {
    orders: Order[];
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' }> = {
    pending: { label: 'En attente', variant: 'warning' },
    accepted: { label: 'Acceptée', variant: 'secondary' },
    machining: { label: 'Usinage', variant: 'default' },
    qc: { label: 'Contrôle Qualité', variant: 'secondary' },
    shipped: { label: 'Expédiée', variant: 'success' },
    delivered: { label: 'Livrée', variant: 'success' },
    cancelled: { label: 'Annulée', variant: 'destructive' },
};

export default function OrdersTable({ orders }: OrdersTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">N° Commande</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Fichier</th>
                            <th className="px-6 py-4">Date Limite</th>
                            <th className="px-6 py-4">Montant</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    Aucune commande trouvée
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {order.order_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{order.clients?.company_name || 'Particulier'}</div>
                                        <div className="text-xs text-slate-500">{order.clients?.contact_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {order.file_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {order.deadline ? new Date(order.deadline).toLocaleDateString('fr-FR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {order.price_total ? `${order.price_total.toLocaleString('fr-FR')} DA` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={STATUS_MAP[order.status]?.variant || 'secondary'}>
                                            {STATUS_MAP[order.status]?.label || order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/dashboard/orders/${order.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
