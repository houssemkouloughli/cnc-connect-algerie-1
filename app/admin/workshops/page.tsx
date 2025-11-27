"use client";

import { useState } from 'react';
import { PartnerProfile, PartnerCapability } from '@/features/partners/types/partner.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import WilayaSelector from '@/components/ui/WilayaSelector';
import { getWilayaByCode } from '@/lib/constants/wilayas';
import { EmailService } from '@/lib/services/email.service';

// Mock Data
const MOCK_WORKSHOPS: PartnerProfile[] = [
    {
        id: 'ws-001',
        companyName: 'MecaPrécision',
        wilaya: '16',
        capabilities: ['3-axis', 'lathe'],
        certifications: ['ISO 9001'],
        rating: 4.5,
        completedJobs: 45,
        status: 'approved',
    },
    {
        id: 'ws-002',
        companyName: 'Oran Industries',
        wilaya: '31',
        capabilities: ['3-axis', '5-axis'],
        certifications: ['ISO 9001', 'ISO 14001'],
        rating: 4.8,
        completedJobs: 120,
        status: 'approved',
    },
    {
        id: 'ws-003',
        companyName: 'Constantine Usinage',
        wilaya: '25',
        capabilities: ['3-axis', 'sheet-metal'],
        certifications: [],
        rating: 4.2,
        completedJobs: 30,
        status: 'pending',
    },
    {
        id: 'ws-004',
        companyName: 'Sétif Mécanique',
        wilaya: '19',
        capabilities: ['lathe'],
        certifications: [],
        rating: 0,
        completedJobs: 0,
        status: 'pending',
    },
];

export default function AdminWorkshopsPage() {
    const [workshops, setWorkshops] = useState<PartnerProfile[]>(MOCK_WORKSHOPS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState<PartnerProfile | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        wilaya: '',
        capabilities: [] as PartnerCapability[],
        certifications: '',
    });

    const handleAddNew = () => {
        setEditingWorkshop(null);
        setFormData({
            companyName: '',
            wilaya: '',
            capabilities: [],
            certifications: '',
        });
        setShowForm(true);
    };

    const handleEdit = (workshop: PartnerProfile) => {
        setEditingWorkshop(workshop);
        setFormData({
            companyName: workshop.companyName,
            wilaya: workshop.wilaya,
            capabilities: workshop.capabilities,
            certifications: workshop.certifications.join(', '),
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet atelier ?')) {
            setWorkshops(workshops.filter(w => w.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newWorkshop: PartnerProfile = {
            id: editingWorkshop?.id || `ws-${Date.now()}`,
            companyName: formData.companyName,
            wilaya: formData.wilaya,
            capabilities: formData.capabilities,
            certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
            rating: editingWorkshop?.rating || 0,
            completedJobs: editingWorkshop?.completedJobs || 0,
            status: editingWorkshop?.status || 'pending',
        };

        if (editingWorkshop) {
            setWorkshops(workshops.map(w => w.id === editingWorkshop.id ? newWorkshop : w));
        } else {
            setWorkshops([...workshops, newWorkshop]);
        }

        setShowForm(false);
    };

    const toggleCapability = (cap: PartnerCapability) => {
        setFormData(prev => ({
            ...prev,
            capabilities: prev.capabilities.includes(cap)
                ? prev.capabilities.filter(c => c !== cap)
                : [...prev.capabilities, cap]
        }));
    };

    const handleApprove = async (id: string) => {
        const workshop = workshops.find(w => w.id === id);
        if (!workshop) return;

        setWorkshops(workshops.map(w => w.id === id ? { ...w, status: 'approved' as const } : w));

        // Send email notification
        await EmailService.sendWorkshopApproval(
            { email: 'workshop@example.com', name: workshop.companyName },
            workshop.companyName
        );

        alert('Atelier approuvé ! Email de confirmation envoyé.');
    };

    const handleReject = async (id: string) => {
        const workshop = workshops.find(w => w.id === id);
        if (!workshop) return;

        setWorkshops(workshops.map(w => w.id === id ? { ...w, status: 'rejected' as const } : w));

        // Send email notification
        await EmailService.sendWorkshopRejection(
            { email: 'workshop@example.com', name: workshop.companyName },
            workshop.companyName,
            'Les informations fournies ne sont pas complètes.'
        );

        alert('Atelier rejeté. Email de notification envoyé.');
    };

    const filteredWorkshops = workshops.filter(w => {
        const matchesSearch = w.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getWilayaByCode(w.wilaya)?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gestion des Ateliers</h1>
                        <p className="text-slate-500">Gérer les ateliers partenaires de la plateforme</p>
                    </div>
                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouvel Atelier
                    </Button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvés' : 'Rejetés'}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Rechercher par nom ou wilaya..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </Card>

                {/* Workshop Form Modal */}
                {showForm && (
                    <Card className="p-6 border-2 border-blue-500">
                        <h2 className="text-xl font-bold mb-4">
                            {editingWorkshop ? 'Modifier l\'Atelier' : 'Nouvel Atelier'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nom de l'entreprise</label>
                                <Input
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Wilaya</label>
                                <WilayaSelector
                                    value={formData.wilaya}
                                    onChange={(code) => setFormData({ ...formData, wilaya: code })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Capacités</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['3-axis', '5-axis', 'lathe', 'sheet-metal', '3d-printing'] as PartnerCapability[]).map(cap => (
                                        <button
                                            key={cap}
                                            type="button"
                                            onClick={() => toggleCapability(cap)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.capabilities.includes(cap)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                        >
                                            {cap}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Certifications (séparées par virgule)</label>
                                <Input
                                    value={formData.certifications}
                                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                    placeholder="ISO 9001, ISO 14001"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingWorkshop ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Workshop List */}
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-medium text-slate-700">Entreprise</th>
                                <th className="text-left p-4 font-medium text-slate-700">Wilaya</th>
                                <th className="text-left p-4 font-medium text-slate-700">Capacités</th>
                                <th className="text-left p-4 font-medium text-slate-700">Certifications</th>
                                <th className="text-left p-4 font-medium text-slate-700">Statut</th>
                                <th className="text-left p-4 font-medium text-slate-700">Note</th>
                                <th className="text-left p-4 font-medium text-slate-700">Jobs</th>
                                <th className="text-right p-4 font-medium text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkshops.map((workshop) => (
                                <tr key={workshop.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{workshop.companyName}</td>
                                    <td className="p-4 text-slate-600">
                                        {getWilayaByCode(workshop.wilaya)?.name || workshop.wilaya}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {workshop.capabilities.map(cap => (
                                                <span key={cap} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {workshop.certifications.length > 0 ? workshop.certifications.join(', ') : '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${workshop.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            workshop.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                workshop.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {workshop.status === 'approved' ? 'Approuvé' :
                                                workshop.status === 'pending' ? 'En attente' :
                                                    workshop.status === 'rejected' ? 'Rejeté' : 'Suspendu'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500">★</span>
                                            <span className="font-medium">{workshop.rating}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{workshop.completedJobs}</td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            {workshop.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(workshop.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approuver"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(workshop.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleEdit(workshop)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(workshop.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
}
