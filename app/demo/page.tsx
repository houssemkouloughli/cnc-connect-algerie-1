"use client";

import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AIChat from '@/components/dashboard/AIChat';
import KPICard from '@/components/dashboard/KPICard';
import { ShoppingCart, DollarSign, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DemoDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <DashboardHeader />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Vue d'ensemble - DEMO</h1>
                                <p className="text-slate-500">Bienvenue sur votre tableau de bord Meca Précision</p>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                + Nouvelle Commande
                            </Button>
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

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Délai moyen</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3.2j</div>
                                    <p className="text-xs text-slate-500 mt-1">Production + Livraison</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Taux de satisfaction</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">4.8/5</div>
                                    <p className="text-xs text-slate-500 mt-1">Basé sur 156 avis</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">Capacité disponible</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">78%</div>
                                    <p className="text-xs text-slate-500 mt-1">Heures machines</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Commandes Récentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { id: 'CMD001', client: 'Entreprise A', status: 'En production', date: '2025-01-15' },
                                        { id: 'CMD002', client: 'Entreprise B', status: 'Livrée', date: '2025-01-14' },
                                        { id: 'CMD003', client: 'Entreprise C', status: 'En attente', date: '2025-01-13' },
                                    ].map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                            <div>
                                                <p className="font-medium text-sm">{order.id}</p>
                                                <p className="text-xs text-slate-500">{order.client}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    order.status === 'Livrée' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'En production' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <AIChat />
            </div>
        </div>
    );
}
