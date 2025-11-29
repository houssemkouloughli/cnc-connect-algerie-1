import { type OrderStatus } from '@/lib/queries/orders';
import { CheckCircle, Circle, Clock, Package, Truck, Home, XCircle } from 'lucide-react';

interface OrderTimelineProps {
    currentStatus: OrderStatus;
}

type TimelineStep = {
    status: OrderStatus;
    label: string;
    icon: typeof CheckCircle;
};

const steps: TimelineStep[] = [
    { status: 'pending', label: 'En attente', icon: Clock },
    { status: 'confirmed', label: 'Confirmée', icon: CheckCircle },
    { status: 'in_production', label: 'En production', icon: Package },
    { status: 'shipped', label: 'Expédiée', icon: Truck },
    { status: 'delivered', label: 'Livrée', icon: Home }
];

const statusOrder: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 1,
    in_production: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1
};

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
    const currentIndex = statusOrder[currentStatus];

    // Si annulée, afficher un état spécial
    if (currentStatus === 'cancelled') {
        return (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Commande annulée</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.status} className="flex items-center flex-1">
                            {/* Step */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}
                    ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span
                                    className={`
                    mt-2 text-xs font-medium text-center
                    ${isCompleted ? 'text-blue-600' : 'text-slate-500'}
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                    flex-1 h-1 mx-2 -mt-8 rounded transition-all
                    ${index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'}
                  `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
