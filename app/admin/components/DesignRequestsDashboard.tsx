'use client';

import { useState, useEffect } from 'react';
import { getPendingDesignRequests, updateDesignRequestStatus } from '@/lib/queries/design-service';
import { FileImage, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import type { DesignServiceRequest } from '@/lib/queries/design-service';

export default function DesignRequestsDashboard() {
    const [requests, setRequests] = useState<DesignServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingDesignRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error loading design requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (requestId: string, status: 'in_progress' | 'completed' | 'cancelled') => {
        try {
            await updateDesignRequestStatus(requestId, status);
            showToast('Statut mis à jour', 'success');
            loadRequests();
        } catch (error) {
            showToast('Erreur lors de la mise à jour', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Demandes de Conception 3D</h2>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    {requests.length} en attente
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                    <FileImage className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Aucune demande de conception en attente</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request: any) => (
                        <div key={request.id} className="bg-white border border-slate-200 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {request.quote.part_name}
                                    </h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <FileImage className="w-4 h-4" />
                                            <span>{request.file_type.toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Client:</span> {request.client.full_name || request.client.email}
                                        </div>
                                        <div>
                                            <span className="font-medium">Matériau:</span> {request.quote.material}
                                        </div>
                                        <div>
                                            <span className="font-medium">Quantité:</span> {request.quote.quantity}
                                        </div>
                                    </div>
                                </div>

                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-slate-100 text-slate-800'
                                    }`}>
                                    {request.status === 'pending' && <Clock className="w-3 h-3" />}
                                    {request.status === 'in_progress' && <Clock className="w-3 h-3" />}
                                    {request.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                    {request.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                    {request.status === 'pending' ? 'En attente' :
                                        request.status === 'in_progress' ? 'En cours' :
                                            request.status === 'completed' ? 'Terminé' : 'Annulé'}
                                </span>
                            </div>

                            {/* File Preview */}
                            <div className="mb-4">
                                <a
                                    href={request.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Voir le fichier uploadé →
                                </a>
                            </div>

                            {/* Actions */}
                            {request.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleStatusChange(request.id, 'in_progress')}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Prendre en charge
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(request.id, 'cancelled')}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            )}

                            {request.status === 'in_progress' && (
                                <button
                                    onClick={() => handleStatusChange(request.id, 'completed')}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Marquer comme terminé
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
