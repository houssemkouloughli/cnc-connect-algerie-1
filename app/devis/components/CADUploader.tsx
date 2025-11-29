setIsUploading(false);
setCacheStatus(null);
        }
    };

const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
};

const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
};

return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Upload Fichier CAD
            </h2>
            <p className="text-slate-600">
                Formats supportés: STL
            </p>
        </div>

        {/* Cache Status Indicator */}
        {cacheStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${cacheStatus === 'hit'
                ? 'bg-green-50 border border-green-200'
                : cacheStatus === 'miss'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                {cacheStatus === 'hit' && (
                    <>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-900">
                            ⚡ Chargement instantané depuis le cache
                        </span>
                    </>
                )}
                {cacheStatus === 'miss' && (
                    <>
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium text-blue-900">
                            Nouveau fichier - sera mis en cache
                        </span>
                    </>
                )}
                {cacheStatus === 'checking' && (
                    <>
                        <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-slate-700">
                            Vérification du cache...
                        </span>
                    </>
                )}
            </div>
        )}

        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                    ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                }
                    ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                `}
        >
            <input
                type="file"
                accept=".stl"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />

            <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-10 h-10 text-blue-600" />
                </div>

                {isUploading ? (
                    <>
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span>Traitement...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-lg font-semibold text-slate-900 mb-1">
                                Glissez votre fichier ici
                            </p>
                            <p className="text-sm text-slate-600">
                                ou cliquez pour parcourir
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <FileUp className="w-4 h-4" />
                            <span>STL • Max 50MB</span>
                        </div>
                    </>
                )}
            </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
                <strong>💡 Astuce :</strong> Les fichiers déjà uploadés sont mis en cache pour un rechargement instantané la prochaine fois !
            </p>
        </div>
    </div>
);
}
