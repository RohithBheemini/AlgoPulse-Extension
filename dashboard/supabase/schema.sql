-- ==============================================================================
-- AlgoPulse Complete Supabase PostgreSQL Schema & Authentication Trigger
-- Run this script in your Supabase project: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Create User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  extension_token text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Submissions Table
create table if not exists public.submissions (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  problem_title text not null,
  problem_slug text not null,
  platform text default 'leetcode',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard', 'Unknown')),
  language text not null,
  user_code text not null,
  
  -- 4-Pillar Scoring
  overall_score integer not null check (overall_score between 0 and 100),
  optimality_score integer,
  time_score integer,
  space_score integer,
  cleanliness_score integer,
  
  -- Big-O Complexity Benchmarks
  user_time_complexity text,
  user_space_complexity text,
  optimal_time_complexity text,
  optimal_space_complexity text,
  
  -- Approach Comparisons
  why_suboptimal text,
  why_ideal text,
  
  summary_feedback text,
  improvements jsonb default '[]'::jsonb,
  optimal_code text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Submissions Policies
drop policy if exists "Users can view own submissions" on public.submissions;
create policy "Users can view own submissions" 
  on public.submissions for select 
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "Allow inserts with valid user or token" on public.submissions;
create policy "Allow inserts with valid user or token" 
  on public.submissions for insert 
  with check (true);

-- 5. Performance Indexes
create index if not exists idx_submissions_user on public.submissions(user_id, created_at desc);
create index if not exists idx_profiles_token on public.profiles(extension_token);

-- 6. Trigger to automatically create profile and extension token on User Sign Up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, extension_token)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'ap_sec_' || md5(random()::text || clock_timestamp()::text)
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
