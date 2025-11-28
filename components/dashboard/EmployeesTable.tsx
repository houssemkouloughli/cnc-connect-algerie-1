"use client";

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit } from 'lucide-react';
import { Database } from '@/types/database.types';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeesTableProps {
    employees: Employee[];
}

export default function EmployeesTable({ employees }: EmployeesTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Nom</th>
                            <th className="px-6 py-4">Rôle</th>
                            <th className="px-6 py-4">Compétences</th>
                            <th className="px-6 py-4">Taux Horaire</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    Aucun employé enregistré
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {employee.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {employee.role}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {employee.skills?.map((skill, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">
                                        {employee.hourly_rate ? `${employee.hourly_rate} DA/h` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={employee.is_active ? 'success' : 'secondary'}>
                                            {employee.is_active ? 'Actif' : 'Inactif'}
                                        </Badge>
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
