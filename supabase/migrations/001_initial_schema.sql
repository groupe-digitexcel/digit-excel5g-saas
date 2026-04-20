-- ================================================================
-- DIGIT-EXCEL5G AI STUDIO v3 — Supabase Migration
-- Run via: supabase db push  OR paste in Supabase SQL Editor
-- ================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ── PROFILES (extends Supabase auth.users) ──────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  plan         text not null default 'Free' check (plan in ('Free', 'Starter', 'Pro', 'VIP')),
  credits      integer not null default 100 check (credits >= 0),
  status       text not null default 'active' check (status in ('active', 'suspended')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    100
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ── AI JOBS ─────────────────────────────────────────────────────
create table if not exists public.ai_jobs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  job_type     text not null check (job_type in ('image', 'photo', 'flyer', 'song')),
  prompt       text,
  output_url   text,
  output_data  jsonb,
  status       text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  credits_used integer not null default 0,
  provider     text,
  created_at   timestamptz default now()
);
create index if not exists idx_jobs_user_id on public.ai_jobs(user_id);
create index if not exists idx_jobs_type    on public.ai_jobs(job_type);
create index if not exists idx_jobs_status  on public.ai_jobs(status);

-- ── PAYMENTS ────────────────────────────────────────────────────
create table if not exists public.payments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  method          text not null check (method in ('MTN MoMo', 'Orange Money')),
  amount          numeric(12,2) not null check (amount > 0),
  reference       text unique not null,
  payer_phone     text,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  credits_awarded integer not null default 0,
  verified_by     uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create trigger payments_updated_at before update on public.payments
  for each row execute procedure public.update_updated_at();
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status  on public.payments(status);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.ai_jobs   enable row level security;
alter table public.payments  enable row level security;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can update all profiles"
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ai_jobs
create policy "Users can view own jobs"
  on public.ai_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own jobs"
  on public.ai_jobs for insert with check (auth.uid() = user_id);
create policy "Admins can view all jobs"
  on public.ai_jobs for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- payments
create policy "Users can view own payments"
  on public.payments for select using (auth.uid() = user_id);
create policy "Users can insert own payments"
  on public.payments for insert with check (auth.uid() = user_id);
create policy "Admins can manage all payments"
  on public.payments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── STORAGE BUCKET ──────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('ai-outputs', 'ai-outputs', true)
on conflict (id) do nothing;

create policy "Anyone can read ai-outputs"
  on storage.objects for select using (bucket_id = 'ai-outputs');
create policy "Authenticated users can upload to ai-outputs"
  on storage.objects for insert with check (
    bucket_id = 'ai-outputs' and auth.role() = 'authenticated'
  );

-- ── CREDITS FUNCTION ────────────────────────────────────────────
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer
) returns boolean language plpgsql security definer as $$
declare
  current_credits integer;
begin
  select credits into current_credits from public.profiles
  where id = p_user_id for update;
  if current_credits < p_amount then
    return false;
  end if;
  update public.profiles
  set credits = credits - p_amount
  where id = p_user_id;
  return true;
end;
$$;

-- ── DONE ────────────────────────────────────────────────────────
-- To make first admin: UPDATE public.profiles SET role = 'admin' WHERE email = 'you@email.com';
