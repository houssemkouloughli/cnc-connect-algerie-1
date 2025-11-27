"use client";

import { Material, Finish, MATERIALS, FINISHES } from '../types/quote.types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, Info } from 'lucide-react';

interface MaterialSelectorProps {
    selectedMaterial: Material | null;
    selectedFinish: Finish | null;
    onMaterialSelect: (material: Material) => void;
    onFinishSelect: (finish: Finish) => void;
}

export default function MaterialSelector({
    selectedMaterial,
    selectedFinish,
    onMaterialSelect,
    onFinishSelect
}: MaterialSelectorProps) {

    // Filtrer les finitions compatibles avec le matériau sélectionné
    const compatibleFinishes = selectedMaterial
        ? FINISHES.filter(f => f.compatibleMaterials.includes(selectedMaterial.id))
        : [];

    return (
        <div className="space-y-8">
            {/* Sélection Matériau */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    1. Matériau
                    {selectedMaterial && <Check className="w-5 h-5 text-green-500" />}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MATERIALS.map((material) => (
                        <div
                            key={material.id}
                            onClick={() => {
                                onMaterialSelect(material);
                                // Reset finish if not compatible
                                if (selectedFinish && !FINISHES.find(f => f.id === selectedFinish.id)?.compatibleMaterials.includes(material.id)) {
                                    // Logic to reset finish handled by parent or auto-select first compatible
                                }
                            }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMaterial?.id === material.id
                                    ? 'border-blue-600 bg-blue-50/50'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-slate-900">{material.name}</div>
                                {material.category === 'metal'
                                    ? <Badge variant="secondary" className="bg-slate-200">Métal</Badge>
                                    : <Badge variant="secondary" className="bg-blue-100 text-blue-700">Plastique</Badge>
                                }
                            </div>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{material.description}</p>

                            {/* Properties Bars */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="w-16">Résistance</span>
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${material.properties.strength * 10}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="w-16">Poids</span>
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${material.properties.weight * 10}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sélection Finition */}
            {selectedMaterial && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        2. Finition
                        {selectedFinish && <Check className="w-5 h-5 text-green-500" />}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {compatibleFinishes.map((finish) => (
                            <div
                                key={finish.id}
                                onClick={() => onFinishSelect(finish)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFinish?.id === finish.id
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-slate-900">{finish.name}</div>
                                    {finish.priceMultiplier > 1 && (
                                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                                            +{Math.round((finish.priceMultiplier - 1) * 100)}%
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{finish.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
