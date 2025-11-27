"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DebugPage() {
    const [envStatus, setEnvStatus] = useState<{ key: string; value: string; status: 'ok' | 'error' }[]>([]);
    const [supabaseStatus, setSupabaseStatus] = useState<string>('checking...');
    const [testEmail, setTestEmail] = useState('test@example.com');
    const [testPassword, setTestPassword] = useState('password123');
    const [loginResult, setLoginResult] = useState<string>('');
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        checkEnvironment();
        checkSupabaseConnection();
    }, []);

    const checkEnvironment = () => {
        const vars = [
            { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET' },
            { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT SET').substring(0, 20) + '...' },
        ];
        
        setEnvStatus(vars.map(v => ({
            ...v,
            status: v.value !== 'NOT SET' ? 'ok' : 'error'
        })));
    };

    const checkSupabaseConnection = async () => {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                setSupabaseStatus(`✅ Connected as: ${session.user.email}`);
            } else {
                setSupabaseStatus('✅ Connected to Supabase (no session)');
            }

            // Try to fetch profiles to verify DB
            const { data, error } = await supabase.from('profiles').select('*').limit(5);
            if (error) {
                setSupabaseStatus(prev => prev + ` | DB Error: ${error.message}`);
            } else {
                setSupabaseStatus(prev => prev + ` | Found ${data?.length || 0} profiles`);
                setAllUsers(data || []);
            }
        } catch (error: any) {
            setSupabaseStatus(`❌ Error: ${error.message}`);
        }
    };

    const testLogin = async () => {
        setLoginResult('Testing login...');
        try {
            const supabase = createClient();
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
            });

            if (error) {
                setLoginResult(`❌ Login Error: ${error.message}`);
            } else {
                setLoginResult(`✅ Login Success! User: ${data.user?.email}`);
            }
        } catch (error: any) {
            setLoginResult(`❌ Exception: ${error.message}`);
        }
    };

    const createTestUser = async () => {
        setLoginResult('Creating test user...');
        try {
            const supabase = createClient();
            
            const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) {
                setLoginResult(`❌ Signup Error: ${error.message}`);
            } else {
                setLoginResult(`✅ Signup Success! Check email: ${data.user?.email}`);
            }
        } catch (error: any) {
            setLoginResult(`❌ Exception: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">🔧 Debug Page</h1>

                {/* Environment Check */}
                <Card>
                    <CardHeader>
                        <CardTitle>Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {envStatus.map(({ key, value, status }) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                                <span className="font-mono text-sm">{key}</span>
                                <span className={`text-sm ${status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                                    {status === 'ok' ? '✅' : '❌'} {value}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Supabase Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Supabase Connection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm">{supabaseStatus}</p>
                        <Button onClick={checkSupabaseConnection}>Refresh Status</Button>
                    </CardContent>
                </Card>

                {/* Users in Database */}
                {allUsers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Users in Database</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {allUsers.map(user => (
                                    <div key={user.id} className="p-2 bg-slate-100 rounded text-sm">
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Role:</strong> {user.role}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Test Login */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="email"
                                placeholder="Email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={testPassword}
                                onChange={(e) => setTestPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={testLogin} className="flex-1">Test Login</Button>
                            <Button onClick={createTestUser} variant="outline" className="flex-1">Create User</Button>
                        </div>
                        {loginResult && (
                            <div className={`p-3 rounded text-sm font-mono ${
                                loginResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {loginResult}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center text-slate-500 text-sm">
                    <p>Go back to <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
                </div>
            </div>
        </div>
    );
}
