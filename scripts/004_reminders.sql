-- Vehicle reminders (revision dates, important dates, etc.)
create table if not exists public.vehicle_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  name text not null,
  date date not null,
  notes text default '',
  created_at timestamptz not null default now()
);

alter table public.vehicle_reminders enable row level security;

create policy "reminders_select_own" on public.vehicle_reminders for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.vehicle_reminders for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.vehicle_reminders for update using (auth.uid() = user_id);
create policy "reminders_delete_own" on public.vehicle_reminders for delete using (auth.uid() = user_id);
