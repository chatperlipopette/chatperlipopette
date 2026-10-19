-- Chat'Perlipopette : modifications du catalogue depuis l'espace administrateur
-- À exécuter une seule fois dans Supabase > SQL Editor.
create table if not exists public.catalogue_game_edits (
  game_code text primary key,
  game_data jsonb not null default '{}'::jsonb,
  is_deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.catalogue_game_edits enable row level security;
-- L'accès se fait uniquement côté serveur via SUPABASE_SERVICE_ROLE_KEY.
