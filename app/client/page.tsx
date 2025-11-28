'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, FileText, Settings, LogOut, Plus } from 'lucide-react';
import { signOut } from '@/lib/utils/auth';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
}

export default function ClientDashboard() {
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
                            <p className="text-4xl font-bold text-blue-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">En attente de réponses</p>
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
                            <CardTitle className="text-lg">Projets Terminés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-slate-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">Livrés avec succès</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                        <CardDescription>
                            Gérez vos devis et commandes en quelques clics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link href="/devis">
                                <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer text-center">
                                    <Plus className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                                    <p className="font-medium text-slate-900">Nouveau Devis</p>
                                    <p className="text-sm text-slate-600 mt-1">Uploadez un fichier CAD</p>
                                </div>
                            </Link>

                            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center opacity-50 cursor-not-allowed">
                                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                                <p className="font-medium text-slate-600">Mes Devis</p>
                                <p className="text-sm text-slate-500 mt-1">À venir</p>
                            </div>

                            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center opacity-50 cursor-not-allowed">
                                <Settings className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                                <p className="font-medium text-slate-600">Mon Profil</p>
                                <p className="text-sm text-slate-500 mt-1">À venir</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Message */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">🚀 Dashboard en Construction</h3>
                    <p className="text-blue-800">
                        Cette page sera bientôt enrichie avec la liste de vos devis, le suivi de vos commandes,
                        et la gestion de votre profil. Pour l'instant, vous pouvez créer un nouveau devis en cliquant
                        sur le bouton ci-dessus.
                    </p>
                </div>
            </div>
        </div>
    );
}
