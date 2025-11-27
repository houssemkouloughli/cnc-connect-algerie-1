import { Button } from '@/components/ui/Button';
import { Chrome, Github, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface OAuthButtonsProps {
    onLoading?: (loading: boolean) => void;
    onError?: (error: string) => void;
}

export function OAuthButtons({ onLoading, onError }: OAuthButtonsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        setIsLoading(true);
        onLoading?.(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) {
                onError?.(error.message);
                setIsLoading(false);
                onLoading?.(false);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion';
            onError?.(errorMessage);
            setIsLoading(false);
            onLoading?.(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
            >
                <Chrome className="mr-2 h-4 w-4" />
                Connexion Google
            </Button>
            
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading}
            >
                <Github className="mr-2 h-4 w-4" />
                Connexion GitHub
            </Button>
        </div>
    );
}
