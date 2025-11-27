export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            workshops: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    city: string
                    specialties: string[] | null
                    capacity: number
                    rating: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    city: string
                    specialties?: string[] | null
                    capacity?: number
                    rating?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    city?: string
                    specialties?: string[] | null
                    capacity?: number
                    rating?: number
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    workshop_id: string | null
                    client_id: string | null
                    order_number: string
                    status: 'pending' | 'accepted' | 'machining' | 'qc' | 'shipped' | 'delivered' | 'cancelled'
                    file_name: string | null
                    file_url: string | null
                    geometry_data: Json | null
                    config: Json | null
                    price_total: number | null
                    deadline: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workshop_id?: string | null
                    client_id?: string | null
                    order_number: string
                    status: 'pending' | 'accepted' | 'machining' | 'qc' | 'shipped' | 'delivered' | 'cancelled'
                    file_name?: string | null
                    file_url?: string | null
                    geometry_data?: Json | null
                    config?: Json | null
                    price_total?: number | null
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workshop_id?: string | null
                    client_id?: string | null
                    order_number?: string
                    status?: 'pending' | 'accepted' | 'machining' | 'qc' | 'shipped' | 'delivered' | 'cancelled'
                    file_name?: string | null
                    file_url?: string | null
                    geometry_data?: Json | null
                    config?: Json | null
                    price_total?: number | null
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    workshop_id: string
                    company_name: string | null
                    contact_name: string
                    email: string | null
                    phone: string | null
                    sector: string | null
                    notes: string | null
                    total_orders: number
                    total_revenue: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    workshop_id: string
                    company_name?: string | null
                    contact_name: string
                    email?: string | null
                    phone?: string | null
                    sector?: string | null
                    notes?: string | null
                    total_orders?: number
                    total_revenue?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    workshop_id?: string
                    company_name?: string | null
                    contact_name?: string
                    email?: string | null
                    phone?: string | null
                    sector?: string | null
                    notes?: string | null
                    total_orders?: number
                    total_revenue?: number
                    created_at?: string
                }
            }
            inventory: {
                Row: {
                    id: string
                    workshop_id: string
                    item_type: 'material' | 'tool' | 'consumable' | null
                    name: string
                    reference: string | null
                    stock_quantity: number
                    unit: string
                    min_stock: number
                    category: string | null
                    supplier: string | null
                    unit_price: number | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workshop_id: string
                    item_type?: 'material' | 'tool' | 'consumable' | null
                    name: string
                    reference?: string | null
                    stock_quantity?: number
                    unit?: string
                    min_stock?: number
                    category?: string | null
                    supplier?: string | null
                    unit_price?: number | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workshop_id?: string
                    item_type?: 'material' | 'tool' | 'consumable' | null
                    name?: string
                    reference?: string | null
                    stock_quantity?: number
                    unit?: string
                    min_stock?: number
                    category?: string | null
                    supplier?: string | null
                    unit_price?: number | null
                    updated_at?: string
                }
            }
            employees: {
                Row: {
                    id: string
                    workshop_id: string
                    name: string
                    role: string
                    skills: string[] | null
                    hourly_rate: number | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    workshop_id: string
                    name: string
                    role: string
                    skills?: string[] | null
                    hourly_rate?: number | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    workshop_id?: string
                    name?: string
                    role?: string
                    skills?: string[] | null
                    hourly_rate?: number | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    workshop_id: string
                    description: string
                    category: 'materials' | 'tools' | 'utilities' | 'salaries' | 'maintenance' | 'other' | null
                    amount: number
                    date: string | null
                    supplier: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    workshop_id: string
                    description: string
                    category?: 'materials' | 'tools' | 'utilities' | 'salaries' | 'maintenance' | 'other' | null
                    amount: number
                    date?: string | null
                    supplier?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    workshop_id?: string
                    description?: string
                    category?: 'materials' | 'tools' | 'utilities' | 'salaries' | 'maintenance' | 'other' | null
                    amount?: number
                    date?: string | null
                    supplier?: string | null
                    created_at?: string
                }
            }
        }
    }
}
