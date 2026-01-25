 create table if not exists public.account_requests (
   id uuid primary key default gen_random_uuid(),
   email text not null,
   full_name text not null,
   credentials text not null,
   avatar_url text,
   status text not null default 'pending',
   created_at timestamptz not null default now()
 );
 
 create table if not exists public.feed_items (
   id uuid primary key default gen_random_uuid(),
   candidate_name text not null,
   candidate_avatar text,
   candidate_avatar_alt text,
   type text not null,
   title text not null,
   content text not null,
   media_url text,
   media_alt text,
   created_at timestamptz not null default now()
 );
 
 create table if not exists public.comments (
   id uuid primary key default gen_random_uuid(),
   feed_id uuid not null references public.feed_items(id) on delete cascade,
   user_name text not null,
   content text not null,
   created_at timestamptz not null default now()
 );
 
 create table if not exists public.elections (
   id uuid primary key default gen_random_uuid(),
   title text not null,
   position text not null,
   type text not null,
   status text not null,
   start_date date not null,
   end_date date not null,
   description text,
   created_at timestamptz not null default now()
 );
 
 create table if not exists public.candidates (
   id uuid primary key default gen_random_uuid(),
   election_id uuid not null references public.elections(id) on delete cascade,
   name text not null,
   position text not null,
   status text not null,
   manifesto text,
   avatar text,
   department text,
   level text,
   gpa text,
   email text,
   votes integer not null default 0,
   submitted_at timestamptz default now()
 );
 
 create table if not exists public.notifications (
   id uuid primary key default gen_random_uuid(),
   title text not null,
   message text not null,
   created_at timestamptz not null default now()
 );
 
 alter table public.account_requests enable row level security;
 alter table public.feed_items enable row level security;
 alter table public.comments enable row level security;
 alter table public.elections enable row level security;
 alter table public.candidates enable row level security;
 alter table public.notifications enable row level security;
 
 create policy "allow read" on public.account_requests for select using (true);
 create policy "allow insert" on public.account_requests for insert with check (true);
 
 create policy "allow read" on public.feed_items for select using (true);
 
 create policy "allow read" on public.comments for select using (true);
 create policy "allow insert" on public.comments for insert with check (true);
 
 create policy "allow read" on public.elections for select using (true);
 
 create policy "allow read" on public.candidates for select using (true);
 
 create policy "allow read" on public.notifications for select using (true);
 
 select storage.create_bucket('avatars', public:=true);
