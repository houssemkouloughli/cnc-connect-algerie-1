"use client";

import { useState, useEffect } from 'react';
import { Material, Finish, MATERIALS, FINISHES } from '../types/quote.types';
import type { GeometryData } from '@/features/analysis/types/analysis.types';
import { PricingService, PriceBreakdown } from '../services/pricing.service';
import MaterialSelector from './MaterialSelector';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Save, CheckCircle, Truck, Calendar } from 'lucide-react';
import { createQuote } from '@/lib/queries/quotes';
import { uploadCADFile } from '@/lib/services/storage.service';

interface QuoteCalculatorProps {
    geometryData: GeometryData;
    fileName: string;
    file: File | null;
}

export default function QuoteCalculator({ geometryData, fileName, file }: QuoteCalculatorProps) {
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [email, setEmail] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

    // Calcul du prix automatique
    useEffect(() => {
        if (!selectedMaterial || !selectedFinish) {
            setPriceBreakdown(null);
            return;
        }

        const breakdown = PricingService.calculateQuote(
            geometryData,
            selectedMaterial,
            selectedFinish,
            quantity
        );

        setPriceBreakdown(breakdown);
    }, [selectedMaterial, selectedFinish, quantity, geometryData]);

    const handleSaveQuote = async () => {
        if (!selectedMaterial || !selectedFinish || !priceBreakdown) {
            alert('Veuillez sélectionner une matière et une finition');
            return;
        }

        setSaveStatus('saving');

        try {
            let fileUrl = null;

            // 1. Upload File if provided
            if (file) {
                try {
                    const uploadResult = await uploadCADFile(file);
                    fileUrl = uploadResult.fullPath;
                } catch (uploadError) {
                    console.error('File upload failed:', uploadError);
                    alert('Erreur lors de l\'upload du fichier. Le devis sera sauvegardé sans fichier joint.');
                }
            }

            // 2. Create Quote in DB
            await createQuote({
                part_name: fileName,
                material: selectedMaterial.name,
                finish: selectedFinish.name,
                quantity: quantity,
                target_price: priceBreakdown.total,
                geometry_data: geometryData,
                file_url: fileUrl || undefined,
                thumbnail_url: undefined // We could generate this later
            });

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde. Veuillez vous connecter.');
            setSaveStatus('idle');
        }
    };

    return (
        <div className="space-y-8 animate-slide-up">
            <Card className="p-6">
                <MaterialSelector
                    selectedMaterial={selectedMaterial}
                    selectedFinish={selectedFinish}
                    onMaterialSelect={(m) => {
                        setSelectedMaterial(m);
                        // Reset finish if incompatible
                        if (selectedFinish && !FINISHES.find(f => f.id === selectedFinish.id)?.compatibleMaterials.includes(m.id)) {
                            setSelectedFinish(null);
                        }
                    }}
                    onFinishSelect={setSelectedFinish}
                />

                {/* Quantité */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">3. Quantité</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-l-xl font-bold"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 text-center border-x border-slate-200 py-2 font-bold text-slate-900 outline-none"
                            />
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-r-xl font-bold"
                            >
                                +
                            </button>
                        </div>
                        <div className="text-sm text-slate-500">
                            {quantity >= 5 && <span className="text-green-600 font-bold">Remise appliquée !</span>}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Résumé Prix */}
            {priceBreakdown && (
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl sticky bottom-4">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-slate-400 text-sm font-medium mb-1">Total Estimé</div>
                            <div className="text-4xl font-black">
                                {priceBreakdown.total.toLocaleString()} <span className="text-xl text-slate-400">DA</span>
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                                {Math.round(priceBreakdown.total / quantity).toLocaleString()} DA / pièce
                            </div>

                            {/* Detailed Breakdown Tooltip/Section */}
                            <div className="mt-4 text-xs text-slate-500 space-y-1 bg-slate-800/50 p-3 rounded-lg">
                                <div className="flex justify-between">
                                    <span>Matière:</span>
                                    <span>{priceBreakdown.materialCost.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Usinage ({priceBreakdown.details.baseTime} min):</span>
                                    <span>{priceBreakdown.machiningCost.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Finition:</span>
                                    <span>{priceBreakdown.finishCost.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-700 mt-1">
                                    <span>Complexité:</span>
                                    <span>x{priceBreakdown.details.complexityFactor.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                Livraison Gratuite
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Expédition: J+3
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSaveQuote}
                        disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                        className={`w-full py-6 text-lg ${saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {saveStatus === 'saving' && (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Sauvegarde...</>)}
                        {saveStatus === 'saved' && (<><CheckCircle className="w-5 h-5 mr-2" />Devis sauvegardé !</>)}
                        {saveStatus === 'idle' && (<><Save className="w-5 h-5 mr-2" />Sauvegarder le devis</>)}
                    </Button>
                </div>
            )}
        </div>
    );
}
