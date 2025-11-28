'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import WilayaSelector from '@/components/ui/WilayaSelector';
import OAuthButtons from '@/components/auth/OAuthButtons';
import { UserPlus, Mail, Lock, User, Phone, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        wilayaCode: '',
        accountType: 'client' as 'client' | 'partner',
        companyName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            setLoading(false);
            return;
        }

        const supabase = createClient();

        // Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    wilaya_code: formData.wilayaCode,
                    company_name: formData.accountType === 'partner' ? formData.companyName : null,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            // Update profile with additional data
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    phone: formData.phone,
                    wilaya_code: formData.wilayaCode,
                    company_name: formData.accountType === 'partner' ? formData.companyName : null,
                    role: formData.accountType,
                })
                .eq('id', data.user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
            }

            // If partner, create partner entry
            if (formData.accountType === 'partner' && formData.companyName) {
                await supabase.from('partners').insert({
                    profile_id: data.user.id,
                    company_name: formData.companyName,
                    wilaya_code: formData.wilayaCode,
                    status: 'pending',
                });
            }

            setSuccess(true);
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Inscription réussie !</h2>
                        <p className="text-slate-600">
                            Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
                            Veuillez vérifier votre boîte de réception pour activer votre compte.
                        </p>
                        <Button onClick={() => router.push('/login')} className="w-full">
                            Aller à la connexion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl">Créer un compte</CardTitle>
                    <CardDescription>
                        Rejoignez CNC Connect Algérie et commencez dès aujourd'hui
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* OAuth Buttons */}
                    <OAuthButtons />

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Ou avec email</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Account Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Type de compte
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, accountType: 'client' })}
                                className={`p-4 border-2 rounded-xl transition-all ${formData.accountType === 'client'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <User className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                <p className="font-medium text-slate-900">Client</p>
                                <p className="text-xs text-slate-600 mt-1">Je cherche des pièces</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, accountType: 'partner' })}
                                className={`p-4 border-2 rounded-xl transition-all ${formData.accountType === 'partner'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                <p className="font-medium text-slate-900">Partenaire</p>
                                <p className="text-xs text-slate-600 mt-1">J'ai un atelier CNC</p>
                            </button>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom complet *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Ahmed Benali"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                                    Téléphone *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="0555 12 34 56"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Wilaya *
                            </label>
                            <WilayaSelector
                                value={formData.wilayaCode}
                                onChange={(code) => setFormData({ ...formData, wilayaCode: code })}
                            />
                        </div>

                        {formData.accountType === 'partner' && (
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom de l'entreprise *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="companyName"
                                        type="text"
                                        placeholder="Atelier Precision Algérie"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                    Mot de passe *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                    Confirmer mot de passe *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Création...' : 'Créer mon compte'}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-slate-600">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
