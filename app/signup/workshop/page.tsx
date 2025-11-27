"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import { Loader2, Store } from 'lucide-react';

export default function WorkshopSignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: companyName,
                        company_name: companyName,
                        city: city,
                        role: 'partner', // Metadata to identify user role
                    },
                },
            });

            if (error) {
                alert(error.message);
                return;
            }

            alert('Compte atelier créé ! Veuillez vérifier votre email pour confirmer.');
            router.push('/login');
        } catch (error) {
            console.error(error);
            alert('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md border-blue-200 shadow-lg">
                <CardHeader className="space-y-1 bg-blue-50/50 rounded-t-xl pb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-600">
                        <Store className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-blue-900">Devenir Partenaire</CardTitle>
                    <p className="text-center text-slate-500 text-sm">
                        Rejoignez le réseau CNC Connect et recevez des commandes
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="companyName">
                                Nom de l'atelier / Entreprise
                            </label>
                            <Input
                                id="companyName"
                                placeholder="Meca Précision SARL"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="city">
                                Ville
                            </label>
                            <Input
                                id="city"
                                placeholder="Alger, Oran, Sétif..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">
                                Email professionnel
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@atelier.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">
                                Mot de passe
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Créer mon compte Atelier
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm pb-6">
                    <div className="text-slate-500">
                        Déjà partenaire ?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Se connecter
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
