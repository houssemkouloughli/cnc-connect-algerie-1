"use client";

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { PARTS_DATA } from '@/lib/data';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, ShoppingCart } from 'lucide-react';

export default function PiecesPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900">Pièces & Consommables</h1>
                    <p className="text-slate-600">Boutique en ligne pour machines CNC</p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    <Button variant="default" className="rounded-full bg-[#005f9e] hover:bg-[#004a7c]">Tous</Button>
                    <Button variant="secondary" className="rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200">Broches</Button>
                    <Button variant="secondary" className="rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200">Outils</Button>
                    <Button variant="secondary" className="rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200">Consommables</Button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PARTS_DATA.map((part) => (
                        <Card key={part.id} className="overflow-hidden hover:shadow-lg transition-all group">
                            <div className={`${part.image} h-48 flex items-center justify-center text-white relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                <Package className="w-16 h-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <CardContent className="p-5 space-y-3">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{part.category}</div>
                                    <h3 className="font-bold text-slate-900 text-lg mt-1 line-clamp-1">{part.name}</h3>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 h-10">{part.description}</p>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-2xl font-black text-[#005f9e]">{part.price.toLocaleString('fr-FR')} DA</div>
                                    <Badge variant={part.stock === 'En stock' ? 'success' : 'warning'} className={part.stock === 'En stock' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}>
                                        {part.stock}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="p-5 pt-0">
                                <Button className="w-full bg-gradient-to-r from-[#005f9e] to-[#0095e8] hover:from-[#004a7c] hover:to-[#0077c2] text-white font-bold shadow-md group-hover:shadow-lg transition-all">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Ajouter au panier
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
