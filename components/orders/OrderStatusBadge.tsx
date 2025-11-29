import { type OrderStatus } from '@/lib/queries/orders';
import { Badge } from '@/components/ui/Badge';

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    pending: {
        label: 'En attente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    confirmed: {
        label: 'Confirmée',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    in_production: {
        label: 'En production',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    shipped: {
        label: 'Expédiée',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    delivered: {
        label: 'Livrée',
        className: 'bg-green-100 text-green-800 border-green-200'
    },
    cancelled: {
        label: 'Annulée',
        className: 'bg-red-100 text-red-800 border-red-200'
    }
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge className={`${config.className} border`}>
            {config.label}
        </Badge>
    );
}
