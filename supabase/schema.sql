-- Run this SQL in your Supabase project's SQL Editor
-- Paste the entire block and click "Run"

-- Courses / Subjects
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  icon text default 'fa-book-medical',
  level text default 'beginner',
  category text,
  instructor text,
  published boolean default true,
  created_at timestamptz default now()
);

-- Lessons / Topics
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  notes_content text,
  quiz jsonb default '[]'::jsonb,
  duration integer,
  order_index integer not null,
  created_at timestamptz default now()
);

-- Lesson progress per user
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  lesson_index integer not null,
  step text default '0',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, course_id, lesson_index)
);

-- Notes per user per course
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, course_id)
);

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text default 'student',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Enable Row Level Security
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table notes enable row level security;
alter table profiles enable row level security;

-- RLS policies
drop policy if exists "Courses are public" on courses;
create policy "Courses are public" on courses for select using (true);

drop policy if exists "Lessons are public" on lessons;
create policy "Lessons are public" on lessons for select using (true);

drop policy if exists "Users can read own progress" on lesson_progress;
create policy "Users can read own progress" on lesson_progress
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on lesson_progress;
create policy "Users can insert own progress" on lesson_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on lesson_progress;
create policy "Users can update own progress" on lesson_progress
  for update using (auth.uid() = user_id);

drop policy if exists "Users can read own notes" on notes;
create policy "Users can read own notes" on notes
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes" on notes;
create policy "Users can insert own notes" on notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on notes;
create policy "Users can update own notes" on notes
  for update using (auth.uid() = user_id);

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

-- Storage: allow authenticated users to upload/read media
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload media" on storage.objects;
create policy "Authenticated users can upload media" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "Anyone can view media" on storage.objects;
create policy "Anyone can view media" on storage.objects
  for select using (bucket_id = 'media');
