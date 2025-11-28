'use client';

import { Quote } from '@/lib/queries/quotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Calendar, Package, Layers } from 'lucide-react';

interface QuoteListProps {
    quotes: Quote[];
}

const statusLabels: Record<Quote['status'], string> = {
    open: 'Ouvert',
    closed: 'Fermé',
    awarded: 'Attribué'
};

const statusColors: Record<Quote['status'], string> = {
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-slate-100 text-slate-800',
    awarded: 'bg-green-100 text-green-800'
};

import { EmptyState } from '@/components/ui/EmptyState';

// ...

export default function QuoteList({ quotes }: QuoteListProps) {
    if (quotes.length === 0) {
        return (
            <Card>
                <CardContent className="p-0">
                    <EmptyState
                        icon={FileText}
                        title="Aucun devis pour le moment"
                        description="Commencez par créer votre premier devis pour recevoir des offres de nos partenaires."
                        actionLabel="Créer un Devis"
                        actionHref="/devis"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mes Devis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {quotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 mb-1">
                                        {quote.part_name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(quote.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <Badge className={statusColors[quote.status]}>
                                    {statusLabels[quote.status]}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Layers className="w-4 h-4 text-slate-400" />
                                    <span className="capitalize">{quote.material.replace('-', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    <span>{quote.quantity} pièce(s)</span>
                                </div>
                                {quote.target_price && (
                                    <div className="text-slate-700">
                                        <span className="font-medium">{quote.target_price.toLocaleString('fr-FR')} DZD</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
