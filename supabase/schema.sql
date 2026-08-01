create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_name text not null,
  account_name text not null,
  account_type text not null default 'Savings',
  opening_balance numeric(18, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  account_name text not null,
  type text not null check (type in ('expense', 'income', 'transfer')),
  amount numeric(18, 2) not null check (amount >= 0),
  name text not null,
  category text not null,
  transaction_date date not null,
  paid_date date,
  payment_method text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Users can read own accounts" on public.accounts;
drop policy if exists "Users can insert own accounts" on public.accounts;
drop policy if exists "Users can update own accounts" on public.accounts;
drop policy if exists "Users can delete own accounts" on public.accounts;

create policy "Users can read own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own transactions" on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

create policy "Users can read own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists transactions_user_id_date_idx
  on public.transactions(user_id, transaction_date desc);
