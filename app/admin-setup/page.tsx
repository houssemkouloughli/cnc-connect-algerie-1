'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function AdminSetupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('Test123!@#')
    const [fullName, setFullName] = useState('Admin Test')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const supabase = createClient()

    const createAdmin = async () => {
        setLoading(true)
        setMessage('⏳ Création en cours...')

        try {
            // 1. Sign up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (authError) {
                setMessage(`❌ Erreur auth: ${authError.message}`)
                setLoading(false)
                return
            }

            if (!authData.user) {
                setMessage('❌ Pas de données utilisateur')
                setLoading(false)
                return
            }

            setMessage('✅ Utilisateur créé. Création du profil...')

            // 2. Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                    role: 'admin',
                    wilaya_code: 'ALG',
                })

            if (profileError) {
                setMessage(`❌ Erreur profil: ${profileError.message}`)
                setLoading(false)
                return
            }

            setMessage(`✅ Admin créé! Email: ${email} | Mot de passe: ${password}`)
            setEmail('')
            setFullName('Admin Test')

        } catch (error: any) {
            setMessage(`❌ Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>🔐 Créer un Admin</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nom complet</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Mot de passe</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={createAdmin}
                            disabled={loading || !email}
                            className="w-full"
                        >
                            {loading ? 'Création...' : 'Créer Admin'}
                        </Button>

                        {message && (
                            <div className={`p-3 rounded text-sm ${
                                message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {message}
                            </div>
                        )}

                        <div className="text-center text-sm">
                            <a href="/login" className="text-blue-600 hover:underline">
                                Aller à la connexion
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
