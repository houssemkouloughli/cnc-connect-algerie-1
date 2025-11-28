"use client";

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Database } from '@/types/database.types';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];

interface InventoryTableProps {
    items: InventoryItem[];
}

export default function InventoryTable({ items }: InventoryTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Nom</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Référence</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Fournisseur</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    Aucun article en stock
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {item.name}
                                        {item.stock_quantity <= item.min_stock && (
                                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                                <AlertTriangle className="w-3 h-3" /> Stock bas
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="capitalize">
                                            {item.item_type === 'material' ? 'Matériau' :
                                                item.item_type === 'tool' ? 'Outil' : 'Consommable'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                        {item.reference || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <span className={item.stock_quantity <= item.min_stock ? 'text-red-600 font-bold' : 'text-slate-900'}>
                                            {item.stock_quantity}
                                        </span>
                                        <span className="text-slate-500 ml-1">{item.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {item.supplier || '-'}
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
