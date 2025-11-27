'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const supabase = createClient()

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage('❌ Veuillez remplir tous les champs')
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage('❌ Les nouveaux mots de passe ne correspondent pas')
            return
        }

        if (newPassword.length < 8) {
            setMessage('❌ Le mot de passe doit contenir au moins 8 caractères')
            return
        }

        setLoading(true)

        try {
            // First, verify current password by trying to sign in
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user?.email) {
                setMessage('❌ Impossible de récupérer votre email')
                setLoading(false)
                return
            }

            // Try to sign in with current password to verify
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                setMessage('❌ Mot de passe actuel incorrect')
                setLoading(false)
                return
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) {
                setMessage(`❌ Erreur: ${error.message}`)
            } else {
                setMessage('✅ Mot de passe changé avec succès!')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (error: any) {
            setMessage(`❌ Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div>
                <h1 className="text-2xl font-black text-slate-900">Mon Profil</h1>
                <p className="text-slate-500">Gérez votre compte</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Changer le Mot de Passe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="text-sm font-medium">Mot de passe actuel</label>
                            <div className="relative">
                                <Input
                                    type={showPasswords ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPasswords ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-sm font-medium">Nouveau mot de passe</label>
                            <Input
                                type={showPasswords ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-slate-500 mt-1">Au moins 8 caractères</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium">Confirmer le mot de passe</label>
                            <Input
                                type={showPasswords ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-3 rounded text-sm ${
                                message.includes('✅') 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
