"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import { Loader2, Mail, Github, Chrome } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            if (!data.user) {
                setError('Erreur de connexion');
                setLoading(false);
                return;
            }

            // Fetch user profile to check role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                router.push('/dashboard');
            } else {
                const role = profile?.role;
                if (role === 'admin') {
                    router.push('/admin/workshops');
                } else if (role === 'partner') {
                    router.push('/partner/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }

            router.refresh();
        } catch (error) {
            setError('Une erreur inattendue est survenue');
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) {
                setError(error.message);
            }
        } catch (err) {
            setError('Erreur lors de la connexion OAuth');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                    <p className="text-center text-slate-500 text-sm">
                        Accédez à votre espace CNC Connect
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email & Password Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Mot de passe
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Se connecter
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Ou</span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loading}
                        >
                            <Chrome className="mr-2 h-4 w-4" />
                            Connexion Google
                        </Button>
                        
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin('github')}
                            disabled={loading}
                        >
                            <Github className="mr-2 h-4 w-4" />
                            Connexion GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 text-center text-sm">
                    <div className="text-slate-500">
                        Pas encore de compte?{' '}
                        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                            S'inscrire
                        </Link>
                    </div>
                    <Link href="/signup/workshop" className="text-slate-400 hover:text-slate-600 text-xs">
                        Vous êtes un atelier? Créez votre compte partenaire
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
