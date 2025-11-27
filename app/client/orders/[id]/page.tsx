"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Download, FileText, CheckCircle, Truck, Package, Settings, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/types/database.types';
import { cn } from '@/lib/utils/cn';

type Order = Database['public']['Tables']['orders']['Row'];

const STATUS_STEPS = [
    { id: 'pending', label: 'Commande reçue', icon: FileText },
    { id: 'accepted', label: 'Validée par l\'atelier', icon: CheckCircle },
    { id: 'machining', label: 'En production', icon: Settings },
    { id: 'qc', label: 'Contrôle Qualité', icon: CheckCircle },
    { id: 'shipped', label: 'Expédiée', icon: Truck },
    { id: 'delivered', label: 'Livrée', icon: Package },
];

export default function ClientOrderDetailPage() {
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error('Error fetching order:', error);
            } else {
                setOrder(data as Order);
            }
            setLoading(false);
        };

        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
    if (!order) return <div className="p-8 text-center text-slate-500">Commande introuvable</div>;

    const currentStepIndex = STATUS_STEPS.findIndex(step => step.id === order.status);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/client/orders">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Commande {order.order_number}</h1>
                    <p className="text-slate-500 text-sm">
                        Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Tracking Timeline */}
                    <Card className="border-none shadow-lg shadow-blue-900/5 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                Suivi de Production
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100"></div>

                                <div className="space-y-8 relative">
                                    {STATUS_STEPS.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;
                                        const Icon = step.icon;

                                        return (
                                            <div key={step.id} className="flex items-start gap-6 relative">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-500",
                                                    isCompleted
                                                        ? "bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-600/20"
                                                        : "bg-white border-slate-100 text-slate-300"
                                                )}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className={cn("pt-2 transition-all duration-500", isCompleted ? "opacity-100" : "opacity-50")}>
                                                    <h3 className={cn("font-bold text-lg", isCurrent ? "text-blue-600" : "text-slate-900")}>
                                                        {step.label}
                                                    </h3>
                                                    {isCurrent && (
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            Statut actuel • Mis à jour le {new Date(order.updated_at).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Détails de la Pièce</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-blue-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{order.file_name || 'Fichier CAO'}</div>
                                        <div className="text-xs text-slate-500">STEP • 2.5 MB</div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                                    <div className="font-bold text-slate-900">{(order.config as any)?.quantity || '-'}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Délai</div>
                                    <div className="font-bold text-slate-900">Standard</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-900/20">
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Besoin d'aide ?</h3>
                                <p className="text-blue-100 text-sm mt-1">
                                    Discutez directement avec l'atelier en charge de votre commande.
                                </p>
                            </div>
                            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                Contacter l'atelier
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Récapitulatif</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Sous-total</span>
                                <span className="font-medium">{order.price_total ? order.price_total.toLocaleString('fr-FR') : '0'} DA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Livraison</span>
                                <span className="font-medium">Calculé à l'expédition</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                                <span className="font-bold text-slate-900">Total Estimé</span>
                                <span className="font-black text-xl text-blue-600">
                                    {order.price_total ? order.price_total.toLocaleString('fr-FR') : '0'} DA
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
