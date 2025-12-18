'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    getOpenQuotes,
    getPartnerByProfileId,
    getPartnerStats,
    type QuoteWithClient
} from '@/lib/queries/partners';
import { getPartnerBids, type BidWithQuote } from '@/lib/queries/bids';
import { getPartnerOrders, type Order } from '@/lib/queries/orders';
import { TrendingUp, FileText, CheckCircle, Clock, Package } from 'lucide-react';
import QuoteMarketplace from './components/QuoteMarketplace';
import MyBids from './components/MyBids';
import PartnerOrders from './components/PartnerOrders';

export default function PartnerDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'marketplace' | 'mybids' | 'orders'>('marketplace');
    const [openQuotes, setOpenQuotes] = useState<QuoteWithClient[]>([]);
    const [myBids, setMyBids] = useState<BidWithQuote[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ totalBids: 0, acceptedBids: 0, totalRevenue: 0, acceptanceRate: 0 });
    const [loading, setLoading] = useState(true);
    const [partnerId, setPartnerId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const bypassAuthValue = process.env.NEXT_PUBLIC_BYPASS_AUTH;
            console.log('[loadData] BYPASS_AUTH value:', bypassAuthValue, 'type:', typeof bypassAuthValue);
            const isDevMode = bypassAuthValue === 'true';
            console.log('[loadData] isDevMode:', isDevMode);

            if (!isDevMode) {
                // Production: Check auth
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login?redirect=/partner/dashboard');
                    return;
                }

                // Get partner from database
                const partner = await getPartnerByProfileId(user.id);
                if (!partner) {
                    console.error('No partner found for user');
                    setLoading(false);
                    return;
                }

                const partnerId = partner.id;
                setPartnerId(partnerId);

                // Load all data
                const [quotes, bids, partnerOrders, partnerStats] = await Promise.all([
                    getOpenQuotes(),
                    getPartnerBids(),
                    getPartnerOrders(partnerId),
                    getPartnerStats(partnerId)
                ]);

                setOpenQuotes(quotes);
                setMyBids(bids);
                setOrders(partnerOrders);
                setStats(partnerStats);
            } else {
                // DEV MODE: Skip all auth checks
                console.log('[loadData] DEV MODE: Loading data without auth...');
                setPartnerId(null);

                try {
                    console.log('[loadData] Calling getOpenQuotes...');
                    const quotes = await getOpenQuotes();
                    console.log('[loadData] Got', quotes.length, 'quotes');

                    console.log('[loadData] Calling getPartnerBids...');
                    const bids = await getPartnerBids();
                    console.log('[loadData] Got', bids.length, 'bids');

                    setOpenQuotes(quotes);
                    setMyBids(bids);
                    setOrders([]);
                    setStats({ totalBids: bids.length, acceptedBids: 0, totalRevenue: 0, acceptanceRate: 0 });
                    console.log('[loadData] State updated successfully!');
                } catch (innerError) {
                    console.error('[loadData] Error in dev mode:', innerError);
                }
            }
        } catch (error) {
            console.error('[loadData] Error loading data:', error);
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
