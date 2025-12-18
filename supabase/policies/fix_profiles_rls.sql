-- FIX PROFILES RLS
-- Run this in Supabase SQL Editor

-- 1. PROFILES TABLE
alter table profiles enable row level security;

-- Drop potentially conflicting policies
drop policy if exists "profiles_select_authenticated" on profiles;
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Create permissive policies
-- Allow any authenticated user to view all profiles (needed for user search)
create policy "profiles_select_authenticated" on profiles 
  for select using (auth.uid() is not null);

-- Allow users to update their own profile
create policy "profiles_update_own" on profiles 
  for update using (auth.uid() = id);

-- Allow users to insert their own profile (usually handled by trigger, but good to have)
create policy "profiles_insert_own" on profiles 
  for insert with check (auth.uid() = id);
