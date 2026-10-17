-- À exécuter dans Supabase > SQL Editor.
create table if not exists public.catalogue_game_flags (
  game_code text primary key,
  nouveaute boolean not null default false,
  coup_de_coeur boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.catalogue_game_flags enable row level security;

-- Les visiteurs peuvent lire les badges du catalogue.
drop policy if exists "Public can read catalogue flags" on public.catalogue_game_flags;
create policy "Public can read catalogue flags"
  on public.catalogue_game_flags for select
  to anon, authenticated
  using (true);

-- Les écritures passent exclusivement par la route serveur qui vérifie ADMIN_EMAIL.
-- Aucun droit d'écriture n'est accordé directement aux rôles anon/authenticated.
revoke insert, update, delete on public.catalogue_game_flags from anon, authenticated;
grant select on public.catalogue_game_flags to anon, authenticated;
