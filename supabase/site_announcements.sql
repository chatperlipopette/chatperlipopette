create extension if not exists pgcrypto;

create table if not exists public.site_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  badge text not null default 'INFO',
  discount text not null default '',
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_announcements_title_length check (char_length(title) between 1 and 100),
  constraint site_announcements_message_length check (char_length(message) between 1 and 500)
);

alter table public.site_announcements enable row level security;

-- L'accès passe par les routes serveur Next.js, protégées par la session admin
-- et utilisant la clé service role. Aucune politique publique n'est nécessaire.
