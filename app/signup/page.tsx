"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import Link from 'next/link';
import { Loader2, Mail, Github, Chrome } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!fullName.trim()) {
            setError('Veuillez entrer votre nom complet');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            // Sign up
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                }
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (!data.user) {
                setError('Erreur lors de la création du compte');
                setLoading(false);
                return;
            }

            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        email: email,
                        role: 'user',
                        created_at: new Date().toISOString(),
                    }
                ]);

            if (profileError) {
                setError('Erreur lors de la création du profil');
                setLoading(false);
                return;
            }

            alert('Compte créé avec succès! Veuillez vérifier votre email.');
            router.push('/login');
        } catch (err) {
            setError('Une erreur inattendue est survenue');
            setLoading(false);
        }
    };

    const handleOAuthSignup = async (provider: 'google' | 'github') => {
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
                    <CardTitle className="text-2xl font-bold text-center">S'inscrire</CardTitle>
                    <p className="text-center text-slate-500 text-sm">
                        Créez votre compte CNC Connect
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email & Password Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Nom complet
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Votre nom complet"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

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
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimum 8 caractères"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Confirmer mot de passe
                            </label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirmez votre mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Inscription...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    S'inscrire
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
                            onClick={() => handleOAuthSignup('google')}
                            disabled={loading}
                        >
                            <Chrome className="mr-2 h-4 w-4" />
                            S'inscrire avec Google
                        </Button>
                        
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthSignup('github')}
                            disabled={loading}
                        >
                            <Github className="mr-2 h-4 w-4" />
                            S'inscrire avec GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 text-center text-sm">
                    <div className="text-slate-500">
                        Vous avez déjà un compte?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Se connecter
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
