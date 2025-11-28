"use client";

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';
import { Database } from '@/types/database.types';

type Expense = Database['public']['Tables']['expenses']['Row'];

interface ExpensesTableProps {
    expenses: Expense[];
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
    materials: { label: 'Matériaux', color: 'bg-blue-100 text-blue-700' },
    tools: { label: 'Outils', color: 'bg-amber-100 text-amber-700' },
    utilities: { label: 'Charges', color: 'bg-purple-100 text-purple-700' },
    salaries: { label: 'Salaires', color: 'bg-green-100 text-green-700' },
    maintenance: { label: 'Maintenance', color: 'bg-red-100 text-red-700' },
    other: { label: 'Autre', color: 'bg-slate-100 text-slate-700' },
};

export default function ExpensesTable({ expenses }: ExpensesTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Catégorie</th>
                            <th className="px-6 py-4">Fournisseur</th>
                            <th className="px-6 py-4">Montant</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    Aucune dépense enregistrée
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600">
                                        {expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {expense.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${CATEGORY_MAP[expense.category || 'other']?.color}`}>
                                            {CATEGORY_MAP[expense.category || 'other']?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {expense.supplier || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {expense.amount.toLocaleString('fr-FR')} DA
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
