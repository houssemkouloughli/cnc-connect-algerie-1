'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getClientQuotes, Quote } from '@/lib/queries/quotes';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, FileText, Settings, LogOut, Plus, CheckCircle } from 'lucide-react';
import { signOut } from '@/lib/utils/auth';
import QuoteList from '@/components/dashboard/QuoteList';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
}

function ClientDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Load quotes
            const quotesData = await getClientQuotes();
            setQuotes(quotesData);

            setLoading(false);
        };

        loadData();

        // Check for success message
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [router, searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    // Calculate statistics
    const openQuotes = quotes.filter(q => q.status === 'open').length;
    const awardedQuotes = quotes.filter(q => q.status === 'awarded').length;
    const closedQuotes = quotes.filter(q => q.status === 'closed').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Success Message */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">Devis créé avec succès !</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Tableau de Bord Client
                            </h1>
                            <p className="mt-1 text-slate-600">
                                Bienvenue, {profile.full_name || profile.email}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/devis">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nouveau Devis
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={signOut}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Devis en Cours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-blue-600">{openQuotes}</p>
                            <p className="text-sm text-slate-600 mt-1">En attente de réponses</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Commandes Actives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-green-600">{awardedQuotes}</p>
                            <p className="text-sm text-slate-600 mt-1">En production</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Projets Terminés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-slate-600">{closedQuotes}</p>
                            <p className="text-sm text-slate-600 mt-1">Livrés avec succès</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quote List */}
                <QuoteList quotes={quotes} />
            </div>
        </div>
    );
}

export default function ClientDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement...</p>
                </div>
            </div>
        }>
            <ClientDashboardContent />
        </Suspense>
    );
}
