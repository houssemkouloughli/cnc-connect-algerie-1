"use client";

import { Button } from '@/components/ui/Button';
import { Edit, Phone, Mail } from 'lucide-react';
import { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientsTableProps {
    clients: Client[];
}

export default function ClientsTable({ clients }: ClientsTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Entreprise / Nom</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Secteur</th>
                            <th className="px-6 py-4">Commandes</th>
                            <th className="px-6 py-4">CA Total</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    Aucun client enregistré
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{client.company_name || client.contact_name}</div>
                                        {client.company_name && <div className="text-xs text-slate-500">{client.contact_name}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-slate-600 text-xs">
                                                    <Mail className="w-3 h-3" /> {client.email}
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-slate-600 text-xs">
                                                    <Phone className="w-3 h-3" /> {client.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {client.sector || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {client.total_orders}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-600">
                                        {client.total_revenue.toLocaleString('fr-FR')} DA
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                            <Edit className="w-4 h-4" />
                                        </Button>
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
