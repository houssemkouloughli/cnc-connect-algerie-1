"use client";

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wrench, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900">Maintenance & Entretien</h1>
                    <p className="text-slate-600">Service expert pour vos machines CNC</p>
                </div>

                {/* Hero Card */}
                <section className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <Wrench className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Contrat de Maintenance</h2>
                        <p className="text-green-50 mb-6 max-w-lg mx-auto font-medium">Garantissez la disponibilité de vos équipements avec nos plans de maintenance préventive.</p>
                        <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 border-none font-bold shadow-md">
                            Demander un devis
                        </Button>
                    </div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </section>

                {/* Services */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl w-fit text-blue-600">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Maintenance Préventive</h3>
                                <p className="text-sm text-slate-600 mt-2">Visites programmées pour éviter les pannes imprévues.</p>
                                <ul className="text-xs text-slate-500 mt-4 space-y-2">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Inspection complète</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Lubrification & nettoyage</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Calibration & alignement</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="bg-red-100 p-3 rounded-xl w-fit text-red-600">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Dépannage Urgent</h3>
                                <p className="text-sm text-slate-600 mt-2">Intervention rapide 24/7 en cas d'arrêt machine.</p>
                                <ul className="text-xs text-slate-500 mt-4 space-y-2">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> Diagnostic à distance</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> Technicien sur site J+1</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> Pièces de rechange en stock</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="bg-purple-100 p-3 rounded-xl w-fit text-purple-600">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Retrofit & Modernisation</h3>
                                <p className="text-sm text-slate-600 mt-2">Mise à niveau de vos machines anciennes.</p>
                                <ul className="text-xs text-slate-500 mt-4 space-y-2">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Contrôleurs CNC Next-Gen</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Systèmes de mesure 3D</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span> Automatisation & robotique</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card className="overflow-hidden border-none shadow-lg">
                    <div className="bg-slate-900 p-6 text-white">
                        <h3 className="font-bold text-xl">Demande d'intervention</h3>
                        <p className="text-slate-400 text-sm mt-1">Remplissez ce formulaire pour être contacté par un technicien.</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">Nom Complet</label>
                                <Input placeholder="Votre nom" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
                                <Input type="email" placeholder="email@exemple.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Téléphone</label>
                            <Input type="tel" placeholder="+213 ..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Description du problème</label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Décrivez votre problème..."
                            />
                        </div>
                        <Button className="w-full bg-gradient-to-r from-[#005f9e] to-[#0095e8] hover:from-[#004a7c] hover:to-[#0077c2] text-white font-bold h-12 shadow-md">
                            Envoyer la demande
                        </Button>
                    </CardContent>
                </Card>
            </main>

            <BottomNav />
        </div>
    );
}
