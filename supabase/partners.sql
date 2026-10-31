-- Chat’Perlipopette : comptes et codes partenaires.
-- À exécuter une seule fois dans Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text unique,
  password_hash text,
  promo_code text unique,
  discount_type text not null check (discount_type in ('free', 'percent')),
  discount_percent numeric(5,2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  active boolean not null default true,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  created_at timestamptz not null default now(),
  constraint partners_has_login_or_code check (username is not null or promo_code is not null),
  constraint partners_login_has_password check (username is null or password_hash is not null),
  constraint partners_percent_value check (discount_type <> 'percent' or discount_percent > 0)
);

alter table public.partners enable row level security;
revoke all on public.partners from anon, authenticated;
-- L'accès passe exclusivement par les routes Next.js utilisant SUPABASE_SERVICE_ROLE_KEY.
