"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function QuickSetupPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
    const router = useRouter();

    const goToDemo = () => {
        router.push('/demo');
    };

    const goToLogin = () => {
        if (credentials) {
            router.push(`/login?email=${encodeURIComponent(credentials.email)}`);
        } else {
            router.push('/login');
        }
    };

    const setupTestAccount = async () => {
        setLoading(true);
        setStatus('⏳ Creating test account...');

        try {
            const supabase = createClient();

            // Generate test credentials
            const testEmail = `admin_${Date.now()}@example.com`;
            const testPassword = 'Test123!@#';

            setStatus(`⏳ Attempting to create account...\nEmail: ${testEmail}\nPassword: ${testPassword}`);

            // Try to sign up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (authError) {
                setStatus(`⚠️ Auth Issue: ${authError.message}\n\nTrying alternative method...`);
                // Don't fail completely, provide credentials for manual login
                setCredentials({ email: testEmail, password: testPassword });
                return;
            }

            if (!authData.user) {
                setStatus('⚠️ Account created but no user data returned. Please try to login manually.');
                setCredentials({ email: testEmail, password: testPassword });
                return;
            }

            setStatus(`✅ User created: ${testEmail}\n🔐 Password: ${testPassword}\n\n⏳ Setting up profile...`);

            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: testEmail,
                    full_name: 'Admin Test',
                    role: 'admin',
                    wilaya_code: 'ALG',
                    phone: '+213 555 123 456',
                    company_name: 'CNC Connect',
                });

            if (profileError) {
                setStatus(prev => prev + `\n❌ Profile Error: ${profileError.message}`);
                setCredentials({ email: testEmail, password: testPassword });
                return;
            }

            setStatus(prev => prev + `\n✅ Profile created!\n\n🚀 Logging in...`);

            // Try to login
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
            });

            if (loginError) {
                setStatus(prev => prev + `\n⚠️ Login pending - you may need to verify email first.`);
                setCredentials({ email: testEmail, password: testPassword });
                return;
            }

            setStatus(prev => prev + `\n✅ Logged in successfully!\n\n⏳ Redirecting to dashboard...`);
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 2000);

        } catch (error: any) {
            setStatus(`❌ Exception: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">🚀 Quick Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!credentials ? (
                        <>
                            <p className="text-slate-600 text-sm">
                                Create a test account to access the admin dashboard.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-sm mb-2 text-blue-900">Options:</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>✅ Creates admin test account</li>
                                    <li>✅ Sets up profile in database</li>
                                    <li>✅ Logs you in automatically</li>
                                </ul>
                            </div>

                            <Button
                                onClick={setupTestAccount}
                                disabled={loading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            >
                                {loading ? 'Setting up...' : 'Create Test Account'}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">or</span>
                                </div>
                            </div>

                            <Button
                                onClick={goToDemo}
                                variant="outline"
                                className="w-full"
                            >
                                View Demo (No Login)
                            </Button>

                            <div className="bg-slate-100 rounded-lg p-3 min-h-24 font-mono text-xs whitespace-pre-wrap break-words">
                                {status || 'Click button to start...'}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-sm mb-2 text-green-900">✅ Account Ready!</h3>
                                <p className="text-sm text-green-800 mb-3">Use these credentials to login:</p>
                                <div className="bg-white p-2 rounded text-xs font-mono space-y-1">
                                    <p><strong>Email:</strong> {credentials.email}</p>
                                    <p><strong>Password:</strong> {credentials.password}</p>
                                </div>
                            </div>

                            <Button
                                onClick={goToLogin}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            >
                                Go to Login →
                            </Button>

                            <Button
                                onClick={goToDemo}
                                variant="outline"
                                className="w-full"
                            >
                                View Demo First
                            </Button>

                            <Button
                                onClick={() => {
                                    setCredentials(null);
                                    setStatus('');
                                    setLoading(false);
                                }}
                                variant="ghost"
                                className="w-full text-xs"
                            >
                                Create Another Account
                            </Button>
                        </>
                    )}

                    <div className="text-center text-slate-500 text-xs">
                        <a href="/" className="text-blue-600 hover:underline">
                            Back to Home
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

