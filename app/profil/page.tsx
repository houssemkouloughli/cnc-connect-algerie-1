"use client";

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Package, Settings, LogOut, MapPin, Building, CreditCard, Bell } from 'lucide-react';
import { useState } from 'react';

// Données fictives
const USER_PROFILE = {
    name: "Amine Benali",
    email: "amine.benali@tech-algerie.dz",
    company: "Tech Algérie Solutions",
    role: "Ingénieur Mécanique",
    location: "Sidi Abdellah, Alger",
    avatar: "AB"
};

const RECENT_ORDERS = [
    { id: "CMD-2024-001", date: "24 Nov 2024", status: "En production", amount: "45,000 DA", items: "Boîtier Aluminium x5" },
    { id: "CMD-2024-002", date: "10 Nov 2024", status: "Livré", amount: "12,500 DA", items: "Support Moteur x2" },
    { id: "CMD-2024-003", date: "05 Oct 2024", status: "Livré", amount: "8,000 DA", items: "Prototype POM-C x1" },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar / User Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                            <div className="px-6 pb-6">
                                <div className="relative -mt-12 mb-4">
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                        <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-black text-slate-400">
                                            {USER_PROFILE.avatar}
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{USER_PROFILE.name}</h2>
                                <p className="text-sm text-slate-500 mb-4">{USER_PROFILE.role} chez {USER_PROFILE.company}</p>

                                <div className="space-y-3 text-sm text-slate-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {USER_PROFILE.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-slate-400" />
                                        {USER_PROFILE.company}
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                                    <LogOut className="w-4 h-4" />
                                    Déconnexion
                                </Button>
                            </div>
                        </Card>

                        {/* Navigation Menu (Desktop) */}
                        <Card className="hidden lg:block">
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <User className="w-4 h-4" />
                                    Vue d'ensemble
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Package className="w-4 h-4" />
                                    Commandes
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Paramètres
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Mobile Tabs */}
                        <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
                            <Button
                                variant={activeTab === 'overview' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('overview')}
                                size="sm"
                            >
                                Vue d'ensemble
                            </Button>
                            <Button
                                variant={activeTab === 'orders' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('orders')}
                                size="sm"
                            >
                                Commandes
                            </Button>
                            <Button
                                variant={activeTab === 'settings' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('settings')}
                                size="sm"
                            >
                                Paramètres
                            </Button>
                        </div>

                        {activeTab === 'overview' && (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="text-sm font-medium text-slate-500 mb-1">Commandes en cours</div>
                                            <div className="text-2xl font-black text-slate-900">1</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="text-sm font-medium text-slate-500 mb-1">Total dépensé</div>
                                            <div className="text-2xl font-black text-slate-900">65,500 DA</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="text-sm font-medium text-slate-500 mb-1">Devis sauvegardés</div>
                                            <div className="text-2xl font-black text-slate-900">4</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Orders Preview */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Commandes Récentes</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>Voir tout</Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {RECENT_ORDERS.map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div>
                                                        <div className="font-bold text-slate-900">{order.items}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {order.id} • {order.date}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-slate-900">{order.amount}</div>
                                                        <Badge variant={order.status === 'Livré' ? 'success' : 'warning'} className="mt-1">
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {activeTab === 'orders' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historique des Commandes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>Liste complète des commandes à venir...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Préférences de Notification</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">Notifications par email</div>
                                                    <div className="text-sm text-slate-500">Recevoir les mises à jour de commande</div>
                                                </div>
                                            </div>
                                            <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Moyen de Paiement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                <CreditCard className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">Carte CIB / Edahabia</div>
                                                <div className="text-sm text-slate-500">**** **** **** 1234</div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="ml-auto">Modifier</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
