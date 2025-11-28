'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createQuote } from '@/lib/queries/quotes';
import { useRouter } from 'next/navigation';
import { PriceEstimator } from '@/lib/pricing/PriceEstimator';
import type { GeometryAnalysis } from '@/lib/3d/core/types';
import type { DFMAnalysisResult } from '@/lib/3d/analysis/types';
import type { PriceEstimate } from '@/lib/pricing/types';

interface QuoteFormProps {
    fileUrl: string;
    fileName: string;
    geometryData: any;
    onBack: () => void;
}

const MATERIALS = [
    { value: 'aluminum-6061', label: 'Aluminium 6061-T6', popular: true },
    { value: 'aluminum-7075', label: 'Aluminium 7075-T6', popular: false },
    { value: 'steel-304', label: 'Acier Inoxydable 304L', popular: true },
    { value: 'steel-c45', label: 'Acier C45', popular: false },
    { value: 'brass', label: 'Laiton', popular: false },
    { value: 'abs', label: 'ABS (Plastique)', popular: true },
    { value: 'pom', label: 'Delrin (POM)', popular: false },
    { value: 'peek', label: 'PEEK', popular: false }
];

const FINISHES = [
    { value: 'as-machined', label: 'Brut d\'usinage' },
    { value: 'anodized', label: 'Anodisation' },
    { value: 'powder-coated', label: 'Peinture époxy' },
    { value: 'polished', label: 'Polissage' },
    { value: 'bead-blasted', label: 'Sablage' }
];

export default function QuoteForm({
    fileUrl,
    fileName,
    geometryData,
    onBack
}: QuoteFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

    const [formData, setFormData] = useState({
        part_name: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        material: 'aluminum-6061',
        finish: 'as-machined',
        quantity: 1,
        target_price: '',
        notes: ''
    });

    // Calculate price estimate when form data changes
    useEffect(() => {
        if (geometryData?.analysis) {
            try {
                const estimate = PriceEstimator.estimate(
                    geometryData.analysis as GeometryAnalysis,
                    geometryData.dfmAnalysis as DFMAnalysisResult | null,
                    {
                        material: formData.material,
                        finish: formData.finish,
                        quantity: formData.quantity,
                        tolerance: 'standard',
                        urgency: 'standard'
                    }
                );
                setPriceEstimate(estimate);
            } catch (err) {
                console.error('Price calculation error:', err);
            }
        }
    }, [formData.material, formData.finish, formData.quantity, geometryData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const quoteData = {
                part_name: formData.part_name,
                file_url: fileUrl,
                material: formData.material,
                finish: formData.finish,
                quantity: parseInt(formData.quantity.toString()),
                target_price: formData.target_price ? parseFloat(formData.target_price) : undefined,
                geometry_data: geometryData
            };

            await createQuote(quoteData);

            // Redirect to client dashboard with success message
            router.push('/client?success=true');

        } catch (err: any) {
            console.error('Error creating quote:', err);
            setError(err.message || 'Erreur lors de la création du devis');
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Configuration du Devis
                </h2>
                <p className="text-slate-600">
                    Définissez les paramètres de fabrication pour votre pièce
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div className="space-y-6">
                {/* Part Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Nom de la Pièce *
                    </label>
                    <input
                        type="text"
                        name="part_name"
                        value={formData.part_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Support moteur, Carter..."
                    />
                </div>

                {/* Material */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Matériau *
                    </label>
                    <select
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {MATERIALS.map((material) => (
                            <option key={material.value} value={material.value}>
                                {material.label} {material.popular ? '⭐' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Finish */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Finition
                    </label>
                    <select
                        name="finish"
                        value={formData.finish}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {FINISHES.map((finish) => (
                            <option key={finish.value} value={finish.value}>
                                {finish.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity and Target Price */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Quantité *
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Prix Cible (DZD) - Optionnel
                        </label>
                        <input
                            type="number"
                            name="target_price"
                            value={formData.target_price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 50000"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Notes / Instructions Spéciales
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Soumettre le Devis
                            </>
                        )}
                    </button>
                </div>
        </form>
    );
}
