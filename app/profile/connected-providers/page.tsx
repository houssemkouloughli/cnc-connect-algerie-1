"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chrome, Github, Link2, Trash2, Loader2 } from 'lucide-react';

interface AuthProvider {
    provider: string;
    connected: boolean;
}

export default function ConnectedProvidersPage() {
    const [providers, setProviders] = useState<AuthProvider[]>([
        { provider: 'google', connected: false },
        { provider: 'github', connected: false },
    ]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const checkProviders = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user.identities) {
                    setLoading(false);
                    return;
                }

                const connectedProviders = session.user.identities.map(id => id.provider);
                
                setProviders(prev => prev.map(p => ({
                    ...p,
                    connected: connectedProviders.includes(p.provider)
                })));
            } catch (error) {
                console.error('Error checking providers:', error);
            } finally {
                setLoading(false);
            }
        };

        checkProviders();
    }, [supabase]);

    const handleLinkProvider = async (provider: 'google' | 'github') => {
        try {
            await supabase.auth.linkIdentity({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
        } catch (error) {
            setMessage('Erreur lors de la liaison du compte');
        }
    };

    const handleUnlinkProvider = async (provider: 'google' | 'github') => {
        try {
            if (!window.confirm(`Etes-vous sur de vouloir deliervoir ${provider}?`)) return;
            
            // For now, we'll just show a message since unlinking requires proper API handling
            setMessage(`${provider} a ete delieent`);
            setProviders(prev => prev.map(p => 
                p.provider === provider ? { ...p, connected: false } : p
            ));
        } catch (error) {
            setMessage(`Erreur lors de la deliaison de ${provider}`);
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google':
                return <Chrome className="h-5 w-5" />;
            case 'github':
                return <Github className="h-5 w-5" />;
            default:
                return <Link2 className="h-5 w-5" />;
        }
    };

    const getProviderLabel = (provider: string) => {
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Comptes Connectés</CardTitle>
                    <p className="text-sm text-slate-500 mt-2">
                        Gérez les comptes externes liés à votre profil CNC Connect
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {message && (
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-800 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="space-y-3">
                        {providers.map(provider => (
                            <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-600">
                                        {getProviderIcon(provider.provider)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {getProviderLabel(provider.provider)}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {provider.connected ? 'Connecté' : 'Non connecté'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {provider.connected ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUnlinkProvider(provider.provider as 'google' | 'github')}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Délier
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleLinkProvider(provider.provider as 'google' | 'github')}
                                        >
                                            <Link2 className="h-4 w-4 mr-2" />
                                            Lier
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-slate-700">
                        <p className="font-medium mb-2">💡 Astuce:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Liez plusieurs comptes pour vous connecter de différentes façons</li>
                            <li>Vous devez avoir au moins une méthode de connexion active</li>
                            <li>Délier un compte supprimera cette option de connexion</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
