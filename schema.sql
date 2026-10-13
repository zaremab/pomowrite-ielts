-- Run in Supabase SQL Editor. Foundation for per-user saved essays.
create extension if not exists pgcrypto;
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id integer,
  topic_title text not null,
  topic_category text,
  essay_text text not null default '',
  brainstorming jsonb not null default '{}'::jsonb,
  outline text not null default '',
  ai_feedback jsonb,
  estimated_overall numeric(2,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists essays_user_updated_idx on public.essays(user_id, updated_at desc);
alter table public.essays enable row level security;
create policy "Users can read own essays" on public.essays for select using (auth.uid() = user_id);
create policy "Users can insert own essays" on public.essays for insert with check (auth.uid() = user_id);
create policy "Users can update own essays" on public.essays for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own essays" on public.essays for delete using (auth.uid() = user_id);
