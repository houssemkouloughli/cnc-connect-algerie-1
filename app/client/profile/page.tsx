"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Mail, Phone, MapPin, Building } from 'lucide-react';

export default function ClientProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        fetchUser();
    }, []);

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-black text-slate-900">Mon Profil</h1>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Informations Personnelles
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nom Complet</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input defaultValue={user?.user_metadata?.full_name} className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input defaultValue={user?.email} disabled className="pl-10 bg-slate-50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="+213 ..." className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Entreprise</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Votre société" className="pl-10" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Adresse de Livraison</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                className="w-full min-h-[100px] rounded-lg border border-slate-200 p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Adresse complète..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Enregistrer les modifications
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
