"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2 } from 'lucide-react';

interface Order {
    id: string;
    client: string;
    description: string;
    amount: number;
    status: string;
    date: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'CMD001',
            client: 'Entreprise ABC',
            description: 'Usinage precision 100 pieces',
            amount: 45000,
            status: 'En production',
            date: '2024-01-15'
        },
        {
            id: 'CMD002',
            client: 'Industries XYZ',
            description: 'Decoupe laser 50 pieces',
            amount: 32000,
            status: 'Livree',
            date: '2024-01-10'
        },
        {
            id: 'CMD003',
            client: 'Atelier Meca',
            description: 'Fraisage CNC 25 pieces',
            amount: 18500,
            status: 'En attente',
            date: '2024-01-18'
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [client, setClient] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('En attente');
    const [loading, setLoading] = useState(false);

    const handleAddOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !description || !amount) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const newOrder: Order = {
                id: String(orders.length + 1),
                client,
                description,
                amount: parseFloat(amount),
                status,
                date: new Date().toISOString().split('T')[0]
            };

            setOrders([...orders, newOrder]);
            setClient('');
            setDescription('');
            setAmount('');
            setStatus('En attente');
            setShowForm(false);
            alert('Commande ajoutee avec succes!');
        } catch (error) {
            alert('Erreur lors de l ajout');
        } finally {
            setLoading(false);
        }
    };

    const deleteOrder = (id: string) => {
        if (confirm('Etes-vous sur?')) {
            setOrders(orders.filter(o => o.id !== id));
        }
    };

    const getStatusColor = (status: string): string => {
        if (status === 'En production') return 'bg-blue-600';
        if (status === 'Livree') return 'bg-green-600';
        if (status === 'En attente') return 'bg-yellow-500';
        if (status === 'Annulee') return 'bg-red-600';
        return 'bg-slate-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
                    <p className="text-slate-500">Gerez vos commandes clients</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Commande
                </Button>
            </div>

            {showForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Nouvelle Commande</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddOrder} className="space-y-4">
                            <Input
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder="Client"
                            />
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Montant"
                                />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="px-3 rounded-lg border"
                                >
                                    <option>En attente</option>
                                    <option>En production</option>
                                    <option>Livree</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading} className="flex-1">
                                    Ajouter
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucune commande</p>
                    ) : (
                        <div className="space-y-2">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-bold">{order.client}</p>
                                        <p className="text-sm text-slate-600">{order.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="font-bold">{order.amount} DA</span>
                                        <button
                                            onClick={() => deleteOrder(order.id)}
                                            className="text-red-600"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
