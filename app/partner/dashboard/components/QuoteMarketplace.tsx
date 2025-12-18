'use client';

import { useState, useEffect } from 'react';
import { getOpenQuotesForPartners } from '@/lib/queries/quotes';
import { Search, Filter, Package, Calendar, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';
import BidModal from './BidModal';

interface Quote {
    id: string;
    part_name: string;
    material: string;
    finish: string;
    quantity: number;
    target_price?: number;
    created_at: string;
    geometry_data: any;
    file_url?: string;
}

export default function QuoteMarketplace() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [materialFilter, setMaterialFilter] = useState('all');
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    useEffect(() => {
        loadQuotes();
    }, []);

    useEffect(() => {
        let filtered = quotes;

        if (searchTerm) {
            filtered = filtered.filter(q =>
                q.part_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (materialFilter !== 'all') {
            filtered = filtered.filter(q => q.material === materialFilter);
        }

        setFilteredQuotes(filtered);
    }, [quotes, searchTerm, materialFilter]);

    const loadQuotes = async () => {
        setIsLoading(true);
        try {
            const data = await getOpenQuotesForPartners();
            setQuotes(data as any);
            setFilteredQuotes(data as any);
        } catch (error) {
            console.error('Error loading quotes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBidSubmitted = () => {
        setSelectedQuote(null);
        loadQuotes();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Opportunités Disponibles</h2>
                    <p className="text-slate-600 mt-1">{filteredQuotes.length} demande(s) de devis</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom de pièce..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={materialFilter}
                    onChange={(e) => setMaterialFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">Tous les matériaux</option>
                    <option value="aluminum-6061">Aluminium 6061</option>
                    <option value="steel-304">Acier Inox 304L</option>
                    <option value="steel-c45">Acier C45</option>
                </select>
            </div>

            {/* Quote Cards */}
            <div className="grid gap-4">
                {filteredQuotes.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">Aucune opportunité disponible pour le moment</p>
                    </div>
                ) : (
                    filteredQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {quote.part_name}
                                    </h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Package className="w-4 h-4" />
                                            <span>{quote.quantity} pièce(s)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Matériau:</span>
                                            <span>{quote.material}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Finition:</span>
                                            <span>{quote.finish}</span>
                                        </div>
                                        {quote.target_price && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Budget: {quote.target_price.toLocaleString()} DZD</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Publié {formatDistanceToNow(new Date(quote.created_at))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedQuote(quote)}
                                    className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Soumettre une offre
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bid Modal */}
            {selectedQuote && (
                <BidModal
                    quote={selectedQuote}
                    onClose={() => setSelectedQuote(null)}
                    onBidSubmitted={handleBidSubmitted}
                />
            )}
        </div>
    );
}
