-- Bill Maker — Supabase schema
-- Run in Supabase SQL editor. Enables RLS so each user only sees their own data.

create extension if not exists "pgcrypto";

-- BUSINESS PROFILES
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  legal_name text,
  gstin text,
  pan text,
  domain text,
  logo_url text,
  signature_url text,
  phone text,
  email text,
  website text,
  address jsonb,
  bank jsonb,
  terms_default text,
  invoice_prefix text default 'INV',
  next_invoice_number int default 1,
  currency text default 'INR',
  default_template text default 'classic',
  created_at timestamptz default now()
);

-- CLIENTS
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  gstin text,
  email text,
  phone text,
  billing_address jsonb,
  shipping_address jsonb,
  notes text,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  hsn_sac text,
  unit text,
  rate numeric(14,2) not null default 0,
  gst_rate numeric(5,2),
  created_at timestamptz default now()
);

-- BILLS
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  short_id text unique,
  type text not null,
  template_id text not null default 'classic',
  number text not null,
  date date not null,
  due_date date,
  business jsonb not null,
  client jsonb not null,
  place_of_supply_code text,
  items jsonb not null default '[]'::jsonb,
  extra_discount numeric(14,2) default 0,
  extra_discount_type text default 'flat',
  shipping_charge numeric(14,2) default 0,
  round_off boolean default true,
  notes text,
  terms text,
  status text default 'draft',
  paid_amount numeric(14,2) default 0,
  payment_mode text,
  reference text,
  totals jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists bills_owner_idx on public.bills(owner_user_id, created_at desc);
create index if not exists clients_owner_idx on public.clients(owner_user_id, name);
create index if not exists products_owner_idx on public.products(owner_user_id, name);

-- Row Level Security
alter table public.business_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.bills enable row level security;

-- Owner-scoped policies
create policy "own_profiles" on public.business_profiles
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "own_clients" on public.clients
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "own_products" on public.products
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "own_bills" on public.bills
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

-- Public read of a bill via short_id (for shareable link).
create policy "public_read_by_shortid" on public.bills
  for select
  using (short_id is not null);

-- STORAGE: create these buckets in Supabase Studio manually:
--   * logos      (public read)
--   * signatures (public read)
--   * bill-pdfs  (private; signed URLs)
