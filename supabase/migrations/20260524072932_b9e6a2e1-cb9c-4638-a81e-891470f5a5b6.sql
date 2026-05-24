
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  role text not null,
  why_join text not null,
  fun_answer text,
  resume_path text,
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;

-- Anyone (anon or authed) can submit an application
create policy "Anyone can submit an application"
on public.applications
for insert
to anon, authenticated
with check (true);

-- No public select policy: submissions are private. Admin reads via service role.

-- Storage bucket for resumes (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']
);

-- Anyone can upload a resume to the resumes bucket
create policy "Anyone can upload a resume"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'resumes');
