"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    startDate: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: '1',
            name: 'Ahmed Habib',
            position: 'Opérateur CNC Senior',
            email: 'ahmed@mecaprecision.com',
            phone: '+213 555 123 456',
            startDate: '2022-01-15'
        },
        {
            id: '2',
            name: 'Fatima Zara',
            position: 'Responsable Production',
            email: 'fatima@mecaprecision.com',
            phone: '+213 555 234 567',
            startDate: '2021-06-01'
        },
        {
            id: '3',
            name: 'Karim Saïdi',
            position: 'Qualité & Contrôle',
            email: 'karim@mecaprecision.com',
            phone: '+213 555 345 678',
            startDate: '2023-03-10'
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !position || !email || !phone) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const newEmployee: Employee = {
                id: String(employees.length + 1),
                name,
                position,
                email,
                phone,
                startDate: new Date().toISOString().split('T')[0]
            };

            setEmployees([...employees, newEmployee]);
            setName('');
            setPosition('');
            setEmail('');
            setPhone('');
            setShowForm(false);
            alert('✅ Employé ajouté avec succès!');
        } catch (error) {
            alert('❌ Erreur lors de l\'ajout');
        } finally {
            setLoading(false);
        }
    };

    const deleteEmployee = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
            setEmployees(employees.filter(e => e.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Employés</h1>
                    <p className="text-slate-500">Gérez votre équipe et leurs accès</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un employé
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Nouvel Employé</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddEmployee} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Nom Complet</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Ahmed Habib"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Poste</label>
                                    <Input
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        placeholder="Ex: Opérateur CNC"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Téléphone</label>
                                    <Input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+213 555 123 456"
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

            {/* List */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Employés</CardTitle>
                </CardHeader>
                <CardContent>
                    {employees.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucun employé</p>
                    ) : (
                        <div className="space-y-3">
                            {employees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">{employee.name}</p>
                                        <p className="text-sm text-slate-600">{employee.position}</p>
                                        <div className="flex gap-4 text-xs text-slate-500 mt-2">
                                            <span>{employee.email}</span>
                                            <span>{employee.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteEmployee(employee.id)}
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
