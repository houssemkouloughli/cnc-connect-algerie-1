export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'ccp',
        name: 'CCP (Compte Courant Postal)',
        description: 'Paiement via compte postal Algérie Poste',
    },
    {
        id: 'baridi-mob',
        name: 'Baridi Mob',
        description: 'Paiement mobile via Baridi Mob',
    },
    {
        id: 'virement',
        name: 'Virement Bancaire',
        description: 'Virement bancaire classique',
    },
    {
        id: 'cash',
        name: 'Espèces à la livraison',
        description: 'Paiement en espèces lors de la réception',
    },
];
