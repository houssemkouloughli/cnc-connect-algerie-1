'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, Bell, Lock, Database, Shield } from 'lucide-react'

export default function SettingsPage() {
    const [companyName, setCompanyName] = useState('Meca Précision')
    const [email, setEmail] = useState('admin@mecaprecision.com')
    const [phone, setPhone] = useState('+213 555 123 456')
    const [address, setAddress] = useState('Alger, Algérie')
    const [notifications, setNotifications] = useState(true)
    const [autoBackup, setAutoBackup] = useState(true)
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        alert('✅ Paramètres sauvegardés!')
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-8 h-8" />
                    Paramètres
                </h1>
                <p className="text-slate-500">Configurez votre atelier et vos préférences</p>
            </div>

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nom de l'Atelier</label>
                        <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Téléphone</label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Adresse</label>
                        <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Notifications Email</p>
                            <p className="text-sm text-slate-500">Recevoir les alertes importantes</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Sauvegarde Automatique</p>
                            <p className="text-sm text-slate-500">Quotidienne à 2h du matin</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={autoBackup}
                            onChange={(e) => setAutoBackup(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Sécurité
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Changer le mot de passe
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Activer l'authentification 2FA
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Télécharger mes données
                    </Button>
                </CardContent>
            </Card>

            {/* Advanced */}
            <Card>
                <CardHeader>
                    <CardTitle>Avancé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-blue-600">
                        Exporter les données
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-orange-600">
                        Réinitialiser à défaut
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600">
                        Supprimer le compte
                    </Button>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    {saved ? '✅ Sauvegardé' : 'Enregistrer les modifications'}
                </Button>
            </div>
        </div>
    )
}
