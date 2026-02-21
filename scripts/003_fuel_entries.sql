-- Fuel entries table
create table if not exists public.fuel_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null default current_date,
  fuel_type text not null default 'Gasolina',
  liters numeric(10,2) not null,
  total_cost numeric(10,2) not null,
  odometer_partial numeric(10,1) not null default 0,
  odometer_total numeric(10,1) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fuel_entries enable row level security;

create policy "fuel_select_own" on public.fuel_entries for select using (auth.uid() = user_id);
create policy "fuel_insert_own" on public.fuel_entries for insert with check (auth.uid() = user_id);
create policy "fuel_update_own" on public.fuel_entries for update using (auth.uid() = user_id);
create policy "fuel_delete_own" on public.fuel_entries for delete using (auth.uid() = user_id);
