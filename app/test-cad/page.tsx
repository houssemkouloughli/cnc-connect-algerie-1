"use client";

import { useState } from 'react';
import Viewer3D from '@/features/devis/components/Viewer3D';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, Upload, FileBox } from 'lucide-react';
import * as THREE from 'three';
import { convertCADToGeometry } from '@/features/analysis/services/cad-converter.service';
import { analyzeGeometry } from '@/features/analysis/services/analysis-3d.service';

export default function TestCADPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [dfmMode, setDfmMode] = useState(false);
    const [thinWallFaces, setThinWallFaces] = useState<number[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!['step', 'stp', 'iges', 'igs'].includes(extension || '')) {
            setStatus('error');
            setErrorMsg("Format non supporté. Veuillez uploader un fichier .step, .stp, .iges ou .igs (pas de ZIP).");
            return;
        }

        setStatus('loading');
        setFileName(file.name);
        setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
        setErrorMsg('');
        setDfmMode(false);
        setThinWallFaces([]);

        try {
            const buffer = await file.arrayBuffer();
            const geo = await convertCADToGeometry(buffer, file.name);
            setGeometry(geo);

            // Run DFM Analysis
            const analysis = analyzeGeometry(geo, file.name);
            if (analysis.dfmResult?.thinWallFaces) {
                setThinWallFaces(analysis.dfmResult.thinWallFaces);
                console.log("DFM Analysis Complete. Thin faces found:", analysis.dfmResult.thinWallFaces.length);
            }

            setStatus('success');

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.message || "Erreur inconnue");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Test Support CAD Avancé</h1>
                        <p className="text-slate-500">Environnement de test pour fichiers STEP / IGES via WebAssembly</p>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                        Beta - Experimental
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <Card className="p-6 space-y-6 h-fit">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                            <input
                                type="file"
                                accept=".step,.stp,.iges,.igs"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                            />
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900">Uploader un fichier</h3>
                            <p className="text-sm text-slate-500 mt-1">STEP, STP, IGES, IGS</p>
                        </div>

                        {status !== 'idle' && (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <FileBox className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-slate-900 truncate">{fileName}</div>
                                        <div className="text-xs text-slate-500">{fileSize}</div>
                                    </div>
                                </div>

                                {status === 'loading' && (
                                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Conversion en cours...
                                    </div>
                                )}

                                {status === 'success' && (
                                    <div className="space-y-3">
                                        <div className="text-green-600 text-sm font-bold">
                                            Conversion réussie !
                                        </div>

                                        <div className="pt-3 border-t border-slate-100">
                                            <label className="flex items-center justify-between cursor-pointer group">
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Analyse DFM</span>
                                                <div
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${dfmMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                    onClick={() => setDfmMode(!dfmMode)}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${dfmMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </label>
                                            {dfmMode && (
                                                <div className="mt-2 text-xs text-slate-500 bg-blue-50 p-2 rounded text-center">
                                                    Les zones rouges indiquent des parois fines (&lt; 2mm)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                                        {errorMsg}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Viewer */}
                    <div className="lg:col-span-2 h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                        <Viewer3D
                            fileBuffer={null}
                            fileName={fileName}
                            geometry={geometry}
                            dfmMode={dfmMode}
                            thinWallFaces={thinWallFaces}
                        />

                        {status === 'idle' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                                <div className="text-slate-400 font-medium">En attente de modèle...</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
