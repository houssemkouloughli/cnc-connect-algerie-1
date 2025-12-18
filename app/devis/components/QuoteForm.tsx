'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Loader2, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createQuote } from '@/lib/queries/quotes';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { getUserFriendlyError } from '@/lib/errors/handleError';

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
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        part_name: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        material: 'aluminum-6061',
        finish: 'as-machined',
        quantity: 1,
        target_price: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            showToast('Demande de devis envoyée avec succès ! Les partenaires vont vous proposer leurs offres.', 'success');
            router.push('/client?success=true');

        } catch (err: any) {
            console.error('Error creating quote:', err);
            const friendlyError = getUserFriendlyError(err);
            showToast(friendlyError, 'error');
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
                    Demande de Devis
                </h2>
                <p className="text-slate-600">
                    Remplissez les informations ci-dessous pour recevoir des propositions de nos partenaires
                </p>
            </div>

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
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
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
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
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
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
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
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Budget Cible (DZD) - Optionnel
                        </label>
                        <input
                            type="number"
                            name="target_price"
                            value={formData.target_price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-medium"
                            placeholder="Ex: 50000"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Notes Additionnelles (Optionnel)
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                        placeholder="Spécifications techniques, délais souhaités, etc."
                    />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold mb-1">Comment ça marche ?</p>
                            <ul className="space-y-1 text-blue-800">
                                <li>• Votre demande sera visible par nos partenaires qualifiés</li>
                                <li>• Vous recevrez plusieurs propositions sous 24-48h</li>
                                <li>• Comparez et choisissez la meilleure offre</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Envoi en cours...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Envoyer la Demande
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
