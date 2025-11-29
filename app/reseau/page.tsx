'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Filter, Map as MapIcon, List } from 'lucide-react';
import { getApprovedPartners, type Partner } from '@/lib/queries/network';
import { EmptyState } from '@/components/ui/EmptyState';
import WilayaSelector from '@/components/ui/WilayaSelector';

import PartnerMap from '@/components/network/PartnerMap';

export default function NetworkPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWilaya, setSelectedWilaya] = useState('');

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const data = await getApprovedPartners();
            setPartners(data);
        } catch (error) {
            console.error('Error loading partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesWilaya = !selectedWilaya || partner.wilaya_code === selectedWilaya;
        return matchesSearch && matchesWilaya;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Réseau d'Ateliers CNC Certifiés
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Trouvez le partenaire idéal pour votre projet parmi notre réseau d'experts qualifiés à travers toute l'Algérie.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4 w-full md:w-auto flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un atelier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <WilayaSelector
                            value={selectedWilaya}
                            onChange={setSelectedWilaya}
                            placeholder="Toutes les Wilayas"
                            className="w-full md:w-64 bg-white"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'map'
                                ? 'bg-white text-blue-600 shadow-sm font-medium'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <MapIcon className="w-4 h-4" />
                            Carte
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white text-blue-600 shadow-sm font-medium'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            Liste
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredPartners.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="Aucun atelier trouvé"
                        description="Essayez de modifier vos critères de recherche."
                    />
                ) : viewMode === 'map' ? (
                    <PartnerMap partners={filteredPartners} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPartners.map((partner) => (
                            <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                                            {partner.company_name}
                                        </h3>
                                        <p className="text-sm text-slate-500">Wilaya {partner.wilaya_code}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <span className="font-bold text-yellow-700">{partner.rating}</span>
                                        <span className="text-yellow-400">★</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                    {partner.description || "Aucune description disponible."}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {partner.capabilities.slice(0, 3).map((cap, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                            {cap}
                                        </span>
                                    ))}
                                    {partner.capabilities.length > 3 && (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                            +{partner.capabilities.length - 3}
                                        </span>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                                    <span>{partner.completed_jobs} projets réalisés</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
