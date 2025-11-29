'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    getOpenQuotes,
    getPartnerBids,
    getPartnerByProfileId,
    getPartnerStats,
    type QuoteWithClient,
    type Bid
} from '@/lib/queries/partners';
import { getPartnerOrders, type Order } from '@/lib/queries/orders';
import { TrendingUp, FileText, CheckCircle, Clock, Package } from 'lucide-react';
import QuoteMarketplace from './components/QuoteMarketplace';
import MyBids from './components/MyBids';
import PartnerOrders from './components/PartnerOrders';

export default function PartnerDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'marketplace' | 'mybids' | 'orders'>('marketplace');
    const [openQuotes, setOpenQuotes] = useState<QuoteWithClient[]>([]);
    const [myBids, setMyBids] = useState<Bid[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ totalBids: 0, acceptedBids: 0, totalRevenue: 0, acceptanceRate: 0 });
    const [loading, setLoading] = useState(true);
    const [partnerId, setPartnerId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?redirect=/partner/dashboard');
                return;
            }

            // Récupérer l'ID du partner depuis la table partners
            const partner = await getPartnerByProfileId(user.id);
            if (!partner) {
                console.error('No partner found for user');
                setLoading(false);
                return;
            }

            setPartnerId(partner.id);

            // Charger toutes les données en parallèle
            const [quotes, bids, partnerOrders, partnerStats] = await Promise.all([
                getOpenQuotes(),
                getPartnerBids(partner.id),
                getPartnerOrders(partner.id),
                getPartnerStats(partner.id)
            ]);

            setOpenQuotes(quotes);
            setMyBids(bids);
            setOrders(partnerOrders);
            setStats(partnerStats);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Tableau de Bord Partenaire</h1>
                <p className="text-slate-600">Gérez vos offres et trouvez de nouveaux projets</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Total Offres</h3>
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalBids}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Offres Acceptées</h3>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.acceptedBids}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Taux d'Acceptation</h3>
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.acceptanceRate}%</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Revenus Totaux</h3>
                        <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                        {stats.totalRevenue.toLocaleString('fr-DZ')} DZD
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'marketplace'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Marketplace ({openQuotes.length})
                </button>
                <button
                    onClick={() => setActiveTab('mybids')}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'mybids'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Mes Offres ({myBids.length})
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'orders'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Package className="w-4 h-4 inline-block mr-2" />
                    Commandes ({orders.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'marketplace' ? (
                <QuoteMarketplace
                    quotes={openQuotes}
                    partnerId={partnerId}
                    onBidSubmitted={loadData}
                />
            ) : activeTab === 'mybids' ? (
                <MyBids bids={myBids} />
            ) : (
                <PartnerOrders orders={orders} onOrderUpdated={loadData} />
            )}
        </div>
    );
}
