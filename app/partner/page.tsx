'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, TrendingUp, Clock, LogOut, Settings } from 'lucide-react';
import { signOut } from '@/lib/utils/auth';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    company_name: string | null;
    role: string;
}

export default function PartnerDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
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
            setLoading(false);
        };

        loadProfile();
    }, [router]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Tableau de Bord Partenaire
                            </h1>
                            <p className="mt-1 text-slate-600">
                                {profile.company_name || 'Votre Atelier'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                Paramètres
                            </Button>
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
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Devis Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-blue-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">Sur le marché</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Propositions Envoyées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-amber-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">En attente</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Commandes Actives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-green-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">En production</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Note Moyenne</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-purple-600">--</p>
                            <p className="text-sm text-slate-600 mt-1">Pas encore évalué</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Marketplace des Devis</CardTitle>
                            <CardDescription>
                                Consultez les demandes de devis disponibles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-600 mb-4">Aucun devis disponible pour le moment</p>
                                <Button disabled variant="outline">
                                    Voir le Marketplace
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mes Propositions</CardTitle>
                            <CardDescription>
                                Gérez vos offres et suivez leur statut
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-600 mb-4">Vous n&apos;avez pas encore envoyé de proposition</p>
                                <Button disabled variant="outline">
                                    Mes Propositions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Message */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">🚀 Dashboard Partenaire en Construction</h3>
                    <p className="text-blue-800">
                        Bientôt disponible : marketplace des devis, système de propositions, gestion des commandes,
                        statistiques de performance, et bien plus encore. Merci de votre patience !
                    </p>
                </div>
            </div>
        </div>
    );
}
