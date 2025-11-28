'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Building2, FileText, ShieldCheck, LogOut } from 'lucide-react';
import { signOut } from '@/lib/utils/auth';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
}

export default function AdminDashboard() {
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

            if (profileData?.role !== 'admin') {
                router.push('/login');
                return;
            }

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
                                Administration
                            </h1>
                            <p className="mt-1 text-slate-600">
                                Tableau de bord administrateur
                            </p>
                        </div>
                        <Button variant="outline" onClick={signOut}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-blue-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">Total inscrits</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Partenaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-green-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">Ateliers actifs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Devis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-purple-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">Au total</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Commandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-amber-600">0</p>
                            <p className="text-sm text-slate-600 mt-1">Complétées</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button disabled variant="outline" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                Voir tous les utilisateurs
                            </Button>
                            <Button disabled variant="outline" className="w-full justify-start">
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Gérer les rôles
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Partenaires</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button disabled variant="outline" className="w-full justify-start">
                                <Building2 className="w-4 h-4 mr-2" />
                                Ateliers en attente
                            </Button>
                            <Button disabled variant="outline" className="w-full justify-start">
                                <FileText className="w-4 h-4 mr-2" />
                                Modération des devis
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Message */}
                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="font-semibold text-red-900 mb-2">🔒 Zone Admin en Construction</h3>
                    <p className="text-red-800">
                        Les fonctionnalités d&apos;administration complètes seront disponibles dans la Phase 5.
                        Cela inclura la gestion des utilisateurs, la modération des partenaires, les statistiques
                        globales, et les outils d&apos;administration avancés.
                    </p>
                </div>
            </div>
        </div>
    );
}
