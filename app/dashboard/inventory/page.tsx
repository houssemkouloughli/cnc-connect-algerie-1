"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface InventoryItem {
    id: string;
    name: string;
    material: string;
    quantity: number;
    unit: string;
    minStock: number;
    price: number;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([
        {
            id: '1',
            name: 'Tole Acier Inox',
            material: 'Acier 316L',
            quantity: 50,
            unit: 'kg',
            minStock: 20,
            price: 450
        },
        {
            id: '2',
            name: 'Barre Aluminium',
            material: 'Aluminium 6061',
            quantity: 15,
            unit: 'pieces',
            minStock: 10,
            price: 2500
        },
        {
            id: '3',
            name: 'Huile de coupe',
            material: 'Lubrifiant',
            quantity: 5,
            unit: 'litres',
            minStock: 3,
            price: 3500
        },
        {
            id: '4',
            name: 'Forets CNC',
            material: 'Carbure',
            quantity: 8,
            unit: 'pieces',
            minStock: 10,
            price: 5000
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [material, setMaterial] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('pieces');
    const [minStock, setMinStock] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !material || !quantity || !minStock || !price) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const newItem: InventoryItem = {
                id: String(items.length + 1),
                name,
                material,
                quantity: parseInt(quantity),
                unit,
                minStock: parseInt(minStock),
                price: parseFloat(price)
            };

            setItems([...items, newItem]);
            setName('');
            setMaterial('');
            setQuantity('');
            setUnit('pieces');
            setMinStock('');
            setPrice('');
            setShowForm(false);
            alert('Article ajoute avec succes!');
        } catch (error) {
            alert('Erreur lors de l ajout');
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = (id: string) => {
        if (confirm('Etes-vous sur de vouloir supprimer cet article?')) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const getLowStockItems = () => items.filter(item => item.quantity < item.minStock).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventaire</h1>
                    <p className="text-slate-500">Gerez vos materiaux et outils</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un article
                </Button>
            </div>

            {getLowStockItems() > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                            <p className="font-medium text-orange-900">{getLowStockItems()} article(s) en stock faible</p>
                            <p className="text-sm text-orange-700">A reapprovisionner bientot</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Nouvel Article</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Nom</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Tole Acier"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Materiau</label>
                                    <Input
                                        value={material}
                                        onChange={(e) => setMaterial(e.target.value)}
                                        placeholder="Ex: Acier 316L"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Quantite</label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Unite</label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200"
                                    >
                                        <option>pieces</option>
                                        <option>kg</option>
                                        <option>litres</option>
                                        <option>metres</option>
                                        <option>autres</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Stock Min.</label>
                                    <Input
                                        type="number"
                                        value={minStock}
                                        onChange={(e) => setMinStock(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Prix Unitaire</label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? 'Ajout...' : 'Ajouter'}
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
                    <CardTitle>Articles en Stock</CardTitle>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucun article</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                                        item.quantity < item.minStock 
                                            ? 'bg-orange-50 border border-orange-200'
                                            : 'bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900">{item.name}</p>
                                            {item.quantity < item.minStock && (
                                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600">{item.material}</p>
                                        <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                            <span>Quantite: <strong>{item.quantity} {item.unit}</strong></span>
                                            <span>Min: {item.minStock} {item.unit}</span>
                                            <span>Prix: {item.price} DA</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
