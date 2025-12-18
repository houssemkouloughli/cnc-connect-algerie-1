'use client';

import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getDeliveryTracking, WILAYAS } from '@/lib/logistics/shipping-calculator';

interface ShippingTrackerProps {
    orderId: string;
    trackingNumber?: string;
    shippingStatus?: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
    fromWilaya?: string;
    toWilaya?: string;
    estimatedDelivery?: string;
}

interface TrackingEvent {
    id: string;
    status: string;
    location?: string;
    notes?: string;
    created_at: string;
}

const statusConfig = {
    preparing: { label: 'En préparation', icon: Package, color: 'bg-yellow-500' },
    shipped: { label: 'Expédié', icon: Truck, color: 'bg-blue-500' },
    in_transit: { label: 'En transit', icon: Truck, color: 'bg-purple-500' },
    delivered: { label: 'Livré', icon: CheckCircle, color: 'bg-green-500' },
    failed: { label: 'Échec de livraison', icon: AlertCircle, color: 'bg-red-500' }
};

export default function ShippingTracker({
    orderId,
    trackingNumber,
    shippingStatus = 'preparing',
    fromWilaya,
    toWilaya,
    estimatedDelivery
}: ShippingTrackerProps) {
    const [events, setEvents] = useState<TrackingEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTracking();
    }, [orderId]);

    const loadTracking = async () => {
        try {
            const data = await getDeliveryTracking(orderId);
            setEvents(data);
        } catch (error) {
            console.error('Error loading tracking:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentStatus = statusConfig[shippingStatus];
    const CurrentIcon = currentStatus.icon;

    const progressSteps = ['preparing', 'shipped', 'in_transit', 'delivered'];
    const currentStepIndex = progressSteps.indexOf(shippingStatus);

    return (
        <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Suivi de Livraison
            </h4>

            {/* Current Status */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${currentStatus.color} text-white mb-4`}>
                <CurrentIcon className="w-6 h-6" />
                <div>
                    <p className="font-semibold">{currentStatus.label}</p>
                    {trackingNumber && (
                        <p className="text-sm opacity-90">N° de suivi: {trackingNumber}</p>
                    )}
                </div>
            </div>

            {/* Route Info */}
            {fromWilaya && toWilaya && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{WILAYAS[fromWilaya as keyof typeof WILAYAS] || fromWilaya}</span>
                    <span className="text-slate-400">→</span>
                    <span>{WILAYAS[toWilaya as keyof typeof WILAYAS] || toWilaya}</span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-6">
                {progressSteps.map((step, index) => {
                    const stepConfig = statusConfig[step as keyof typeof statusConfig];
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const StepIcon = stepConfig.icon;

                    return (
                        <div key={step} className="flex-1">
                            <div className="relative">
                                {index > 0 && (
                                    <div
                                        className={`absolute top-1/2 right-1/2 w-full h-1 -translate-y-1/2 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'
                                            }`}
                                    />
                                )}
                                <div
                                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center mx-auto ${isCurrent
                                            ? stepConfig.color
                                            : isCompleted
                                                ? 'bg-green-500'
                                                : 'bg-slate-200'
                                        }`}
                                >
                                    <StepIcon className={`w-5 h-5 ${isCompleted || isCurrent ? 'text-white' : 'text-slate-400'}`} />
                                </div>
                            </div>
                            <p className={`text-xs text-center mt-1 ${isCurrent ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
                                {stepConfig.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Estimated Delivery */}
            {estimatedDelivery && shippingStatus !== 'delivered' && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Livraison estimée: <strong>{new Date(estimatedDelivery).toLocaleDateString('fr-FR')}</strong></span>
                </div>
            )}

            {/* Tracking Timeline */}
            {events.length > 0 && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                    <h5 className="text-sm font-medium text-slate-700 mb-3">Historique</h5>
                    <div className="space-y-3">
                        {events.map((event, index) => (
                            <div key={event.id} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full ${index === events.length - 1 ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                    {index < events.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-slate-200 min-h-[20px]" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-sm font-medium text-slate-900">
                                        {statusConfig[event.status as keyof typeof statusConfig]?.label || event.status}
                                    </p>
                                    {event.location && (
                                        <p className="text-xs text-slate-500">{event.location}</p>
                                    )}
                                    {event.notes && (
                                        <p className="text-xs text-slate-600 italic">{event.notes}</p>
                                    )}
                                    <p className="text-xs text-slate-400">
                                        {new Date(event.created_at).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
