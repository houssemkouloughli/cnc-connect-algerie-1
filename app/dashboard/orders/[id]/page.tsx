"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Download, FileText, Calendar, DollarSign, User, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'] & {
    clients: Database['public']['Tables']['clients']['Row'] | null
};

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'; color: string }> = {
    pending: { label: 'En attente', variant: 'warning', color: 'text-yellow-600 bg-yellow-50' },
    accepted: { label: 'Acceptée', variant: 'secondary', color: 'text-blue-600 bg-blue-50' },
    machining: { label: 'Usinage', variant: 'default', color: 'text-purple-600 bg-purple-50' },
    qc: { label: 'Contrôle Qualité', variant: 'secondary', color: 'text-indigo-600 bg-indigo-50' },
    shipped: { label: 'Expédiée', variant: 'success', color: 'text-green-600 bg-green-50' },
    delivered: { label: 'Livrée', variant: 'success', color: 'text-green-700 bg-green-100' },
    cancelled: { label: 'Annulée', variant: 'destructive', color: 'text-red-600 bg-red-50' },
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, clients(*)')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error('Error fetching order:', error);
                // router.push('/dashboard/orders');
            } else {
                setOrder(data as Order);
            }
            setLoading(false);
        };

        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    const updateStatus = async (newStatus: Order['status']) => {
        if (!order) return;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', order.id);

        if (error) {
            alert('Erreur lors de la mise à jour du statut');
        } else {
            setOrder({ ...order, status: newStatus });
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Chargement de la commande...</div>;
    }

    if (!order) {
        return <div className="p-8 text-center text-slate-500">Commande introuvable</div>;
    }

    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900">Commande {order.order_number}</h1>
                            <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">
                                {statusInfo.label}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Créée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {order.status === 'pending' && (
                        <>
                            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => updateStatus('cancelled')}>
                                Refuser
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus('accepted')}>
                                Accepter la commande
                            </Button>
                        </>
                    )}
                    {order.status === 'accepted' && (
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus('machining')}>
                            Démarrer l'usinage
                        </Button>
                    )}
                    {order.status === 'machining' && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => updateStatus('qc')}>
                            Terminer & Contrôle Qualité
                        </Button>
                    )}
                    {order.status === 'qc' && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus('shipped')}>
                            Expédier
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* File & Config */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Détails de la Pièce
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{order.file_name || 'Fichier sans nom'}</div>
                                        <div className="text-xs text-slate-500">STEP • 2.5 MB</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Matériau</div>
                                    <div className="font-bold text-slate-900">{(order.config as any)?.material || '-'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Finition</div>
                                    <div className="font-bold text-slate-900">{(order.config as any)?.finish || '-'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Quantité</div>
                                    <div className="font-bold text-slate-900">{(order.config as any)?.quantity || '-'} pièces</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Tolérance</div>
                                    <div className="font-bold text-slate-900">Standard (ISO 2768-m)</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline (Placeholder for now) */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                Suivi de Production
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                <div className="relative">
                                    <div className="absolute -left-8 top-1 w-7 h-7 bg-green-100 rounded-full flex items-center justify-center border-2 border-white text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div className="font-bold text-slate-900">Commande Reçue</div>
                                    <div className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString('fr-FR')}</div>
                                </div>
                                {/* Add more steps based on status */}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="w-4 h-4 text-slate-500" />
                                Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {order.clients?.contact_name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{order.clients?.company_name || 'Particulier'}</div>
                                    <div className="text-xs text-slate-500">{order.clients?.contact_name}</div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm pt-2 border-t border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Email</span>
                                    <span className="font-medium">{order.clients?.email || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Téléphone</span>
                                    <span className="font-medium">{order.clients?.phone || '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="w-4 h-4 text-slate-500" />
                                Paiement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-slate-500">Total HT</span>
                                <span className="font-bold text-lg text-slate-900">
                                    {order.price_total ? order.price_total.toLocaleString('fr-FR') : '0'} DA
                                </span>
                            </div>
                            <div className="flex justify-between items-end text-sm">
                                <span className="text-slate-500">TVA (19%)</span>
                                <span className="font-medium text-slate-700">
                                    {order.price_total ? (order.price_total * 0.19).toLocaleString('fr-FR') : '0'} DA
                                </span>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                <span className="font-bold text-slate-900">Total TTC</span>
                                <span className="font-black text-xl text-blue-600">
                                    {order.price_total ? (order.price_total * 1.19).toLocaleString('fr-FR') : '0'} DA
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
