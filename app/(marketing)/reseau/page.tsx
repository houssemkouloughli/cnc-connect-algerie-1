"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import WorkshopCard from '@/features/workshops/components/WorkshopCard';
import { Workshop } from '@/features/workshops/types/workshop.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Map, Loader2 } from 'lucide-react';
import { getApprovedPartners, Partner } from '@/lib/queries/partners';



export default function ReseauPage() {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchPartners() {
            try {
                const partners = await getApprovedPartners();

                // Map DB partners to Workshop type
                const mappedWorkshops: Workshop[] = partners.map((p: Partner) => ({
                    id: p.id,
                    name: p.company_name,
                    location: `Wilaya ${p.wilaya_code}`, // We could map code to name later
                    rating: p.rating,
                    reviewCount: p.completed_jobs, // Using completed jobs as proxy for now
                    specialties: p.capabilities,
                    machines: [], // Not in DB yet
                    imageUrl: p.avatar_url || '',
                    verified: p.status === 'approved',
                    deliveryTime: '3-5 jours', // Placeholder
                    minOrderPrice: 0 // Placeholder
                }));

                setWorkshops(mappedWorkshops);
            } catch (error) {
                console.error('Failed to fetch partners', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPartners();
    }, []);

    const filteredWorkshops = workshops.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Réseau d'Ateliers</h1>
                    <p className="text-slate-600 max-w-2xl">
                        Trouvez le partenaire idéal pour votre production parmi notre réseau d'ateliers certifiés à travers l'Algérie.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Rechercher un atelier, une ville, une spécialité..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filtres
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Map className="w-4 h-4" />
                            Carte
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWorkshops.length > 0 ? (
                            filteredWorkshops.map((workshop) => (
                                <WorkshopCard key={workshop.id} workshop={workshop} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                Aucun atelier trouvé pour votre recherche.
                            </div>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
