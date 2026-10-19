-- À exécuter une seule fois dans Supabase > SQL Editor.
create table if not exists public.game_feedback (
  id uuid primary key default gen_random_uuid(),
  game_code text not null,
  game_name text not null,
  kind text not null check (kind in ('review', 'question')),
  author text not null check (char_length(author) between 1 and 60),
  rating smallint null check (rating between 1 and 5),
  message text not null check (char_length(message) between 3 and 1500),
  admin_reply text null check (admin_reply is null or char_length(admin_reply) <= 1500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint game_feedback_rating_kind_check check (
    (kind = 'review' and rating is not null) or
    (kind = 'question' and rating is null)
  )
);

create index if not exists game_feedback_game_status_created_idx
  on public.game_feedback (game_code, status, created_at desc);

alter table public.game_feedback enable row level security;
-- No public policies: all reads/writes are performed by server routes using the
-- server-only SUPABASE_SERVICE_ROLE_KEY. Never expose that key to the browser.
