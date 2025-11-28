'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileUp, Package, Settings, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CADUploader from './components/CADUploader';
import Viewer3D from './components/Viewer3D';
import QuoteForm from './components/QuoteForm';

type Step = 1 | 2 | 3;

export default function DevisPage() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [geometryData, setGeometryData] = useState<any>(null);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Rediriger vers login si non authentifié
                router.push('/login?redirect=/devis');
                return;
            }

            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [router]);

    const steps = [
        { number: 1, title: 'Upload Fichier', icon: FileUp },
        { number: 2, title: 'Vérification 3D', icon: Package },
        { number: 3, title: 'Configuration', icon: Settings }
    ];

    const handleFileUpload = (file: File, url: string, geometry: any) => {
        setUploadedFile(file);
        setFileUrl(url);
        setGeometryData(geometry);
        setCurrentStep(2);
    };

    const handleContinueToConfig = () => {
        setCurrentStep(3);
    };

    // Afficher écran de chargement pendant vérification auth
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-lg font-medium text-slate-700">Vérification...</p>
                    <p className="mt-2 text-sm text-slate-500">Redirection vers la connexion si nécessaire</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Nouvelle Demande de Devis
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Uploadez votre fichier CAD et obtenez un devis instantané
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;

                        return (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-semibold
                      transition-all duration-300
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isActive ? 'bg-blue-600 text-white scale-110' : ''}
                      ${!isActive && !isCompleted ? 'bg-slate-200 text-slate-500' : ''}
                    `}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                        ) : (
                                            <Icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <p
                                        className={`
                      mt-2 text-sm font-medium
                      ${isActive ? 'text-blue-600' : 'text-slate-600'}
                    `}
                                    >
                                        {step.title}
                                    </p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`
                      flex-1 h-1 mx-4 rounded transition-all duration-300
                      ${currentStep > step.number ? 'bg-green-500' : 'bg-slate-200'}
                    `}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {currentStep === 1 && (
                    <CADUploader onUploadComplete={handleFileUpload} />
                )}

                {currentStep === 2 && (
                    <Viewer3D
                        fileUrl={fileUrl}
                        fileName={uploadedFile?.name || ''}
                        geometryData={geometryData}
                        onContinue={handleContinueToConfig}
                        onBack={() => setCurrentStep(1)}
                    />
                )}

                {currentStep === 3 && (
                    <QuoteForm
                        fileUrl={fileUrl}
                        fileName={uploadedFile?.name || ''}
                        geometryData={geometryData}
                        onBack={() => setCurrentStep(2)}
                    />
                )}
            </div>
        </div>
    );
}
