"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Package, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Bonjour, John</h1>
                    <p className="text-slate-500 mt-1">Voici un aperçu de vos projets en cours</p>
                </div>
                <Link href="/devis">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20">
                        Lancer une nouvelle production
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-blue-100 font-medium">En cours</span>
                        </div>
                        <div className="text-4xl font-black mb-1">3</div>
                        <div className="text-blue-100 text-sm">Commandes actives</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-slate-500 font-medium">En attente</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1">1</div>
                        <div className="text-slate-500 text-sm">Devis à valider</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-slate-500 font-medium">Terminées</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1">12</div>
                        <div className="text-slate-500 text-sm">Commandes livrées</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Commandes Récentes</h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {[1, 2].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600">
                                    #{2024 + i}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Support Moteur Aluminium</div>
                                    <div className="text-sm text-slate-500">Usinage CNC • 50 pièces</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">125,000 DA</div>
                                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                        En production
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
