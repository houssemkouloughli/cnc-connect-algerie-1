import { Workshop } from '../types/workshop.types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, Star, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface WorkshopCardProps {
    workshop: Workshop;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-48 w-full bg-slate-100">
                {/* Placeholder pour l'image si pas d'image réelle */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                    <span className="text-4xl font-black opacity-10">{workshop.name[0]}</span>
                </div>
                {/* Badge Vérifié */}
                {workshop.verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" />
                        Vérifié
                    </div>
                )}
            </div>

            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                            {workshop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <MapPin className="w-3 h-3" />
                            {workshop.location}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {workshop.rating}
                        <span className="text-yellow-600/60 font-normal">({workshop.reviewCount})</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {workshop.specialties.slice(0, 3).map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px]">
                            {spec}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workshop.deliveryTime}
                    </div>
                    <div>
                        Min. {workshop.minOrderPrice} DA
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button className="w-full" variant="outline">
                    Voir le profil
                </Button>
            </CardFooter>
        </Card>
    );
}
