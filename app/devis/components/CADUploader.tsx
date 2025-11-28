'use client';

import { useState, useCallback } from 'react';
import { Upload, FileType, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CADUploaderProps {
    onUploadComplete: (file: File, url: string, geometry: any) => void;
}

const ACCEPTED_FORMATS = ['.stl', '.step', '.stp', '.iges', '.igs'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function CADUploader({ onUploadComplete }: CADUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const [progress, setProgress] = useState(0);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File): string | null => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!ACCEPTED_FORMATS.includes(extension)) {
            return `Format non supporté. Formats acceptés: ${ACCEPTED_FORMATS.join(', ')}`;
        }

        if (file.size > MAX_FILE_SIZE) {
            return `Fichier trop volumineux. Taille maximale: 50MB`;
        }

        return null;
    };

    const uploadToSupabase = async (file: File): Promise<string> => {
        const supabase = createClient();

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${extension}`;

        const { data, error } = await supabase.storage
            .from('cad-files')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw new Error(`Erreur upload: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('cad-files')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const parseGeometry = async (file: File): Promise<any> => {
        // Simplified geometry parsing - in production, use proper CAD parser
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;

                // Basic geometry data extraction
                const geometryData = {
                    volume: 0,
                    surface_area: 0,
                    bounding_box: {
                        x: 0, y: 0, z: 0
                    },
                    complexity: 'medium',
                    estimated_weight: 0
                };

                resolve(geometryData);
            };
            reader.readAsText(file);
        });
    };

    const handleFile = async (file: File) => {
        setError('');

        // Validate
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsUploading(true);
        setProgress(0);

        try {
            // Upload to Supabase Storage
            setProgress(20);
            const fileUrl = await uploadToSupabase(file);

            setProgress(60);

            // Parse geometry
            const geometryData = await parseGeometry(file);

            setProgress(100);

            // Notify parent component
            setTimeout(() => {
                onUploadComplete(file, fileUrl, geometryData);
            }, 500);

        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'upload du fichier');
            setIsUploading(false);
            setProgress(0);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <FileType className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Uploadez votre fichier CAD
                </h2>
                <p className="text-slate-600">
                    Formats supportés: STL, STEP, IGES (max 50MB)
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div
                className={`
          relative border-2 border-dashed rounded-xl p-12 transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}
          ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50'}
        `}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={ACCEPTED_FORMATS.join(',')}
                    onChange={handleFileInput}
                    disabled={isUploading}
                />

                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                <p className="text-lg font-medium text-slate-900 mb-2">
                                    Upload en cours... {progress}%
                                </p>
                                <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-slate-400 mb-4" />
                                <p className="text-lg font-medium text-slate-900 mb-2">
                                    Glissez votre fichier ici
                                </p>
                                <p className="text-sm text-slate-500 mb-4">ou</p>
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                    Parcourir les fichiers
                                </button>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {/* Supported formats info */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {ACCEPTED_FORMATS.map((format) => (
                    <div
                        key={format}
                        className="px-3 py-2 bg-slate-100 rounded-lg text-center text-sm font-medium text-slate-700"
                    >
                        {format.toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
}
