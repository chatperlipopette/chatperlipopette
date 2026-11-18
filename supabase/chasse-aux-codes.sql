-- Évolution de la chasse : une énigme peut concerner plusieurs jeux
-- et chaque énigme possède ses propres paramètres de réduction.
-- À exécuter dans Supabase > SQL Editor après la mise à jour du site.

alter table public.hunt_clues
  add column if not exists game_codes text[] not null default '{}',
  add column if not exists game_names text[] not null default '{}',
  add column if not exists discount_percent integer not null default 10
    check (discount_percent between 1 and 100),
  add column if not exists validity_days integer not null default 90
    check (validity_days between 1 and 365);

update public.hunt_clues
set game_codes = case when cardinality(game_codes) = 0 then array[game_code] else game_codes end,
    game_names = case when cardinality(game_names) = 0 then array[game_name] else game_names end
where cardinality(game_codes) = 0 or cardinality(game_names) = 0;

alter table public.hunt_codes
  add column if not exists valid_until timestamptz;

alter table public.hunt_codes
  drop constraint if exists hunt_codes_discount_percent_check;

alter table public.hunt_codes
  add constraint hunt_codes_discount_percent_check
  check (discount_percent between 1 and 100);

-- Codes déjà créés : conservent leur durée initiale de 90 jours.
update public.hunt_codes
set valid_until = created_at + interval '90 days'
where valid_until is null;

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
     and coalesce(c.valid_until, c.created_at + interval '90 days') > now()
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
