-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- WORKSHOPS TABLE
create table public.workshops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users not null,
  name text not null,
  city text not null,
  specialties text[],
  capacity integer default 100,
  rating decimal default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLIENTS TABLE
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid references public.workshops not null,
  company_name text,
  contact_name text not null,
  email text,
  phone text,
  sector text,
  notes text,
  total_orders integer default 0,
  total_revenue decimal default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EMPLOYEES TABLE
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid references public.workshops not null,
  name text not null,
  role text not null,
  skills text[],
  hourly_rate decimal,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVENTORY TABLE
create table public.inventory (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid references public.workshops not null,
  item_type text check (item_type in ('material', 'tool', 'consumable')),
  name text not null,
  reference text,
  stock_quantity decimal default 0,
  unit text default 'pcs',
  min_stock decimal default 5,
  category text,
  supplier text,
  unit_price decimal,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid references public.workshops,
  client_id uuid references public.clients,
  order_number text unique not null,
  status text check (status in ('pending', 'accepted', 'machining', 'qc', 'shipped', 'delivered', 'cancelled')),
  file_name text,
  file_url text,
  geometry_data jsonb,
  config jsonb,
  price_total decimal,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXPENSES TABLE
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid references public.workshops not null,
  description text not null,
  category text check (category in ('materials', 'tools', 'utilities', 'salaries', 'maintenance', 'other')),
  amount decimal not null,
  date date default CURRENT_DATE,
  supplier text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Basic Setup)
alter table public.workshops enable row level security;
alter table public.clients enable row level security;
alter table public.employees enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.expenses enable row level security;

-- Policy: Users can only see their own workshop data
-- Note: This requires a function to get the workshop_id for the current user, 
-- or we can simplify by checking owner_id on the workshop table and joining.
-- For simplicity in this script, we'll allow authenticated users to read/write for now, 
-- but in production you MUST refine this.

create policy "Users can view their own workshop" on public.workshops
  for select using (auth.uid() = owner_id);

create policy "Users can update their own workshop" on public.workshops
  for update using (auth.uid() = owner_id);

create policy "Users can insert their own workshop" on public.workshops
  for insert with check (auth.uid() = owner_id);
