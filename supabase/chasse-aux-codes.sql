-- Chasse aux codes secrets Chat'Perlipopette
-- Exécuter ce script une seule fois dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.hunt_clues (
  id uuid primary key default gen_random_uuid(),
  game_code text not null unique,
  game_name text not null,
  clue text not null,
  answer_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hunt_codes (
  id uuid primary key default gen_random_uuid(),
  clue_id uuid not null references public.hunt_clues(id) on delete cascade,
  code text not null unique,
  discount_percent integer not null default 10 check (discount_percent = 10),
  used_at timestamptz,
  used_for text,
  created_at timestamptz not null default now()
);

create index if not exists hunt_clues_active_idx on public.hunt_clues(active);
create index if not exists hunt_codes_clue_idx on public.hunt_codes(clue_id);

alter table public.hunt_clues enable row level security;
alter table public.hunt_codes enable row level security;

-- Aucun accès public direct : lecture et écritures via les routes serveur Next.js
-- qui utilisent SUPABASE_SERVICE_ROLE_KEY. Ne jamais exposer cette clé au navigateur.

create or replace function public.claim_hunt_code(p_code text, p_reference text)
returns table(discount_percent integer, code_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.hunt_codes c
     set used_at = now(), used_for = p_reference
   where upper(c.code) = upper(trim(p_code))
     and c.used_at is null
     and c.created_at > now() - interval '90 days'
  returning c.discount_percent, c.id;
end;
$$;

revoke all on function public.claim_hunt_code(text, text) from public, anon, authenticated;
grant execute on function public.claim_hunt_code(text, text) to service_role;

create or replace function public.release_hunt_code(p_code text, p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare changed integer;
begin
  update public.hunt_codes
     set used_at = null, used_for = null
   where upper(code) = upper(trim(p_code))
     and used_for = p_reference;
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.release_hunt_code(text, text) from public, anon, authenticated;
grant execute on function public.release_hunt_code(text, text) to service_role;
