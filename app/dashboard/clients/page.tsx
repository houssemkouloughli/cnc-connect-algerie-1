"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ClientsTable from '@/components/dashboard/ClientsTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(data as Client[]);
            }
            setLoading(false);
        };

        fetchClients();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Clients</h1>
                    <p className="text-slate-500">Gérez votre base de clients</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un client
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher un client..."
                        className="pl-10 bg-slate-50 border-slate-200"
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Chargement des clients...</div>
            ) : (
                <ClientsTable clients={clients} />
            )}
        </div>
    );
}
