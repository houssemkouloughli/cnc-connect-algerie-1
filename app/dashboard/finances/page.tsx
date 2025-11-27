"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Search, Plus, TrendingDown, TrendingUp, DollarSign, Trash2 } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

export default function FinancesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([
        {
            id: '1',
            description: 'Matériel CNC - Pièces détachées',
            amount: 45000,
            category: 'Équipement',
            date: '2025-01-10'
        },
        {
            id: '2',
            description: 'Électricité atelier',
            amount: 12000,
            category: 'Utilitaires',
            date: '2025-01-08'
        },
        {
            id: '3',
            description: 'Huile de coupe industrielle',
            amount: 8500,
            category: 'Consommables',
            date: '2025-01-05'
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Autres');
    const [loading, setLoading] = useState(false);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const newExpense: Expense = {
                id: Date.now().toString(),
                description,
                amount: parseFloat(amount),
                category,
                date: new Date().toISOString().split('T')[0]
            };

            setExpenses([newExpense, ...expenses]);
            setDescription('');
            setAmount('');
            setCategory('Autres');
            setShowForm(false);
            alert('✅ Dépense ajoutée avec succès!');
        } catch (error) {
            alert('❌ Erreur lors de l\'ajout');
        } finally {
            setLoading(false);
        }
    };

    const deleteExpense = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const revenues = 450000;
    const profit = revenues - totalExpenses;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Finances</h1>
                    <p className="text-slate-500">Suivi des dépenses et profits</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une dépense
                </Button>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                    title="Revenus (Mois)"
                    value="450,000 DA"
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="green"
                />
                <KPICard
                    title="Dépenses (Mois)"
                    value={`${totalExpenses.toLocaleString('fr-FR')} DA`}
                    trend="+5%"
                    trendUp={false}
                    icon={TrendingDown}
                    color="red"
                />
                <KPICard
                    title="Profit Net"
                    value={`${profit.toLocaleString('fr-FR')} DA`}
                    trend="+8%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Nouvelle Dépense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ex: Matériel CNC"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Montant (DA)</label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Catégorie</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                                    >
                                        <option>Équipement</option>
                                        <option>Utilitaires</option>
                                        <option>Salaires</option>
                                        <option>Consommables</option>
                                        <option>Transport</option>
                                        <option>Autres</option>
                                    </select>
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

            {/* Expenses List */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des Dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                    {expenses.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucune dépense enregistrée</p>
                    ) : (
                        <div className="space-y-2">
                            {expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{expense.description}</p>
                                        <div className="flex gap-4 text-sm text-slate-500">
                                            <span>{expense.category}</span>
                                            <span>{expense.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-slate-900">
                                                {expense.amount.toLocaleString('fr-FR')} DA
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteExpense(expense.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
