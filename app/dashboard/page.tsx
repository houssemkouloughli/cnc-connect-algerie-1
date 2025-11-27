"use client";

import KPICard from '@/components/dashboard/KPICard';
import { ShoppingCart, DollarSign, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Vue d'ensemble</h1>
                    <p className="text-slate-500">Bienvenue sur votre tableau de bord Meca Précision</p>
                </div>
                <Link href="/dashboard/orders">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        + Nouvelle Commande
                    </Button>
                </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Chiffre d'affaires (Mois)"
                    value="450,000 DA"
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="green"
                />
                <KPICard
                    title="Commandes Actives"
                    value="8"
                    trend="3 urgentes"
                    trendUp={false}
                    icon={ShoppingCart}
                    color="blue"
                />
                <KPICard
                    title="Taux de Conversion"
                    value="64%"
                    trend="+4%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="purple"
                />
                <KPICard
                    title="Alertes Stock"
                    value="2"
                    trend="Critique"
                    trendUp={false}
                    icon={Package}
                    color="orange"
                />
            </div>

            {/* Recent Orders & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Commandes Récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 font-bold text-slate-700">
                                            #{1000 + i}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Pièce Moteur V6</div>
                                            <div className="text-xs text-slate-500">Client: SARL AutoParts • Il y a 2h</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-blue-600">45,000 DA</div>
                                        <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 inline-block mt-1">
                                            En cours
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Activité Récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 relative">
                            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                                    <ShoppingCart className="w-3 h-3 text-blue-600" />
                                </div>
                                <div className="text-sm font-medium text-slate-900">Nouvelle commande reçue</div>
                                <div className="text-xs text-slate-500 mt-0.5">Il y a 10 min • #1005</div>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-7 h-7 bg-green-100 rounded-full flex items-center justify-center border-2 border-white">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                </div>
                                <div className="text-sm font-medium text-slate-900">Commande #1002 livrée</div>
                                <div className="text-xs text-slate-500 mt-0.5">Il y a 2h • Transporteur</div>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center border-2 border-white">
                                    <Package className="w-3 h-3 text-orange-600" />
                                </div>
                                <div className="text-sm font-medium text-slate-900">Stock bas : Alu 6061</div>
                                <div className="text-xs text-slate-500 mt-0.5">Il y a 4h • Inventaire</div>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white">
                                    <Clock className="w-3 h-3 text-purple-600" />
                                </div>
                                <div className="text-sm font-medium text-slate-900">Maintenance préventive</div>
                                <div className="text-xs text-slate-500 mt-0.5">Demain 09:00 • Machine 3 axes</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
