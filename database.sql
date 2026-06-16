-- ═══════════════════════════════════════════
--  Playx Database Schema — Supabase SQL
--  Run this in: Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════

-- 1. Profiles
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade unique,
  username     text,
  avatar_url   text,
  total_xp     integer default 0,
  streak       integer default 0,
  badges       text[]  default '{}',
  games_played integer default 0,
  quizzes_done integer default 0,
  words_won    integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 2. Leaderboard
create table if not exists leaderboard (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  game       text not null,
  score      integer not null,
  played_at  timestamptz default now(),
  unique(user_id, game)
);

-- 3. Comments
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  game       text not null,
  text       text not null,
  likes      integer default 0,
  created_at timestamptz default now()
);

-- 4. Ratings
create table if not exists ratings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  game       text not null,
  rating     integer check(rating between 1 and 5),
  unique(user_id, game)
);

-- ── Row Level Security ───────────────────
alter table profiles    enable row level security;
alter table leaderboard enable row level security;
alter table comments    enable row level security;
alter table ratings     enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "profiles_read"   on profiles    for select using (true);
create policy "profiles_insert" on profiles    for insert with check (auth.uid() = user_id);
create policy "profiles_update" on profiles    for update using   (auth.uid() = user_id);

-- Leaderboard: anyone can read, only owner can write
create policy "lb_read"   on leaderboard for select using (true);
create policy "lb_insert" on leaderboard for insert with check (auth.uid() = user_id);
create policy "lb_update" on leaderboard for update using   (auth.uid() = user_id);

-- Comments: anyone can read, only owner can insert
create policy "comments_read"   on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);

-- Ratings: anyone can read, only owner can write
create policy "ratings_read"   on ratings for select using (true);
create policy "ratings_insert" on ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update" on ratings for update using   (auth.uid() = user_id);

-- ── Indexes for speed ───────────────────
create index if not exists lb_game_score on leaderboard(game, score desc);
create index if not exists lb_game_date  on leaderboard(game, played_at desc);
create index if not exists comments_game on comments(game, created_at desc);

-- ── Auto-create profile on signup ───────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
