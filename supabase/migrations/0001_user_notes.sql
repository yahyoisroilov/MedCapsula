-- MedCapsula — multi-note block editor
-- Run this in your Supabase project's SQL Editor (paste the whole block, click "Run").
-- Safe to run more than once.

create table if not exists user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default '',
  subject text default '',              -- subject tag label, e.g. 'Anatomiya' or 'Umumiy'
  blocks jsonb default '[]'::jsonb,     -- array of { id, type: 'h'|'p'|'bullet'|'todo'|'callout', text, checked? }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists user_notes_user_idx on user_notes (user_id, updated_at desc);

-- Keep updated_at fresh on every UPDATE, regardless of the caller.
create or replace function set_user_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_notes_set_updated_at on user_notes;
create trigger user_notes_set_updated_at
  before update on user_notes
  for each row execute function set_user_notes_updated_at();

alter table user_notes enable row level security;

drop policy if exists "Users can read own notes" on user_notes;
create policy "Users can read own notes" on user_notes
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes" on user_notes;
create policy "Users can insert own notes" on user_notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on user_notes;
create policy "Users can update own notes" on user_notes
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own notes" on user_notes;
create policy "Users can delete own notes" on user_notes
  for delete using (auth.uid() = user_id);
