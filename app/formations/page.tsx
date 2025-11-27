"use client";

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { SCHEDULED_TRAININGS, TRAINING_DATA } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import * as Icons from 'lucide-react';
import { Calendar, Clock, MapPin, Users, ExternalLink, Globe } from 'lucide-react';

export default function FormationsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900">Formations CNC</h1>
                    <p className="text-slate-600">Développez vos compétences avec nos experts</p>
                </div>

                {/* Scheduled Trainings */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#005f9e]" />
                        Formations Programmées
                    </h2>
                    <div className="grid gap-6">
                        {SCHEDULED_TRAININGS.map((training) => {
                            // @ts-ignore
                            const IconComponent = Icons[training.icon.charAt(0).toUpperCase() + training.icon.slice(1)] || Icons.GraduationCap;

                            return (
                                <Card key={training.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6 flex flex-col md:flex-row gap-6">
                                        <div className={`${training.color} text-white p-4 rounded-2xl h-fit w-fit`}>
                                            <IconComponent className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-bold text-slate-900">{training.title}</h3>
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">{training.level}</Badge>
                                                </div>
                                                <p className="text-slate-600 mt-1">{training.description}</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Icons.User className="w-4 h-4 text-blue-500" />
                                                    {training.instructor}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    {training.duration} • {training.time}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    {new Date(training.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                                                    <MapPin className="w-4 h-4 text-blue-500" />
                                                    {training.location}
                                                </div>
                                                <div className={`flex items-center gap-2 font-bold ${training.seats - training.booked <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                    <Users className="w-4 h-4" />
                                                    {training.seats - training.booked} places restantes
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase">Prix</div>
                                                    <div className="text-2xl font-black text-[#005f9e]">{training.price.toLocaleString('fr-FR')} DA</div>
                                                </div>
                                                <Button className="bg-gradient-to-r from-[#005f9e] to-[#0095e8] hover:from-[#004a7c] hover:to-[#0077c2] text-white font-bold shadow-lg">
                                                    Réserver
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Online Trainings */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-green-600" />
                        Formations en Ligne Gratuites
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {TRAINING_DATA.map((training) => {
                            // @ts-ignore
                            const IconComponent = Icons[training.icon.charAt(0).toUpperCase() + training.icon.slice(1)] || Icons.GraduationCap;

                            return (
                                <Card key={training.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                    <CardHeader className="flex-row gap-4 items-start space-y-0 pb-2">
                                        <div className={`${training.color} text-white p-3 rounded-xl`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <CardTitle className="text-lg leading-tight">{training.title}</CardTitle>
                                                {training.isFree && <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">GRATUIT</Badge>}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{training.description}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4 pt-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="bg-slate-50">{training.duration}</Badge>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">{training.level}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{training.details}</p>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t border-slate-50">
                                        <Button variant="outline" className="w-full gap-2 group" asChild>
                                            <a href={training.url} target="_blank" rel="noopener noreferrer">
                                                Voir la formation
                                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 text-center shadow-lg">
                    <h3 className="font-bold text-2xl mb-2">Formation sur mesure ?</h3>
                    <p className="text-blue-100 mb-6 max-w-lg mx-auto">Contactez-nous pour un programme personnalisé adapté aux besoins de votre entreprise.</p>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-none font-bold">
                        Nous contacter
                    </Button>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
