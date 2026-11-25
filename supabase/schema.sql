-- ============ LOOKUP TABLES ============
create table public.departments (id smallint generated always as identity primary key, code text unique not null, name text not null);
create table public.regulations (id smallint generated always as identity primary key, name text unique not null);
create table public.academic_years (id smallint generated always as identity primary key, year smallint unique not null check (year between 1 and 4));
create table public.semesters (id smallint generated always as identity primary key, number smallint unique not null check (number between 1 and 8));
create table public.resource_types (id smallint generated always as identity primary key, slug text unique not null, name text unique not null);

-- ============ STUDENTS (passwords live in Supabase Auth, not here) ============
create table public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  college_email text not null unique,
  department text not null,
  academic_year smallint not null check (academic_year between 1 and 4),
  created_at timestamptz not null default now()
);

-- ============ SUBJECTS / RESOURCES / BOOKMARKS / REPORTS ============
create table public.subjects (
  id bigint generated always as identity primary key,
  department_id smallint not null references public.departments(id),
  regulation_id smallint not null references public.regulations(id),
  academic_year_id smallint not null references public.academic_years(id),
  semester_id smallint not null references public.semesters(id),
  name text not null,
  created_at timestamptz not null default now()
);
create unique index subjects_unique on public.subjects (department_id, regulation_id, academic_year_id, semester_id, lower(name));

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  subject_id bigint not null references public.subjects(id),
  resource_type_id smallint not null references public.resource_types(id),
  uploaded_by uuid not null references public.students(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  description text,
  file_name text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 26214400),
  file_type text not null check (file_type in ('pdf','doc','docx','ppt','pptx','jpg','png','zip')),
  storage_key text not null,
  created_at timestamptz not null default now()
);
create index resources_subject_idx on public.resources (subject_id);
create index resources_uploader_idx on public.resources (uploaded_by);
create index resources_created_idx on public.resources (created_at desc);

create table public.bookmarks (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, resource_id)
);

create table public.reports (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.resources(id) on delete cascade,
  reported_by uuid not null references public.students(id) on delete cascade,
  reason text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ============ FLAT VIEWS (make browse/search/filter queries simple) ============
create or replace view public.resources_view with (security_invoker = true) as
select r.id, r.title, r.description, r.file_name, r.file_size, r.file_type, r.created_at, r.uploaded_by,
       st.full_name as uploader_name,
       sb.id as subject_id, sb.name as subject_name,
       d.code as dept_code, g.name as reg_name, y.year as academic_year, sm.number as semester,
       t.slug as type_slug, t.name as type_name
from public.resources r
join public.students st on st.id = r.uploaded_by
join public.subjects sb on sb.id = r.subject_id
join public.departments d on d.id = sb.department_id
join public.regulations g on g.id = sb.regulation_id
join public.academic_years y on y.id = sb.academic_year_id
join public.semesters sm on sm.id = sb.semester_id
join public.resource_types t on t.id = r.resource_type_id;

create or replace view public.subjects_view with (security_invoker = true) as
select sb.id, sb.name, d.code as dept_code, g.name as reg_name, y.year as academic_year, sm.number as semester
from public.subjects sb
join public.departments d on d.id = sb.department_id
join public.regulations g on g.id = sb.regulation_id
join public.academic_years y on y.id = sb.academic_year_id
join public.semesters sm on sm.id = sb.semester_id;

revoke all on public.resources_view, public.subjects_view from anon;

-- ============ SIGNUP: college-email check + student row ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.students (
    id,
    full_name,
    college_email,
    department,
    academic_year
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email,
    coalesce(new.raw_user_meta_data->>'department', 'CSE'),
    coalesce((new.raw_user_meta_data->>'academic_year')::smallint, 1)
  );

  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY (private to logged-in students) ============
alter table public.departments enable row level security;
alter table public.regulations enable row level security;
alter table public.academic_years enable row level security;
alter table public.semesters enable row level security;
alter table public.resource_types enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.resources enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reports enable row level security;

create policy "read departments" on public.departments for select to authenticated using (true);
create policy "read regulations" on public.regulations for select to authenticated using (true);
create policy "read years" on public.academic_years for select to authenticated using (true);
create policy "read semesters" on public.semesters for select to authenticated using (true);
create policy "read types" on public.resource_types for select to authenticated using (true);

create policy "read subjects" on public.subjects for select to authenticated using (true);
create policy "add subjects" on public.subjects for insert to authenticated with check (true);

create policy "read students" on public.students for select to authenticated using (true);
create policy "update own student" on public.students for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- other students can see names but never emails
revoke all on public.students from anon, authenticated;
grant select (id, full_name, department, academic_year, created_at) on public.students to authenticated;
grant update (full_name, department) on public.students to authenticated;

create policy "read resources" on public.resources for select to authenticated using (true);
create policy "insert own resources" on public.resources for insert to authenticated with check (uploaded_by = auth.uid());
create policy "update own resources" on public.resources for update to authenticated
  using (uploaded_by = auth.uid()) with check (uploaded_by = auth.uid());
create policy "delete own resources" on public.resources for delete to authenticated using (uploaded_by = auth.uid());

create policy "own bookmarks select" on public.bookmarks for select to authenticated using (student_id = auth.uid());
create policy "own bookmarks insert" on public.bookmarks for insert to authenticated with check (student_id = auth.uid());
create policy "own bookmarks delete" on public.bookmarks for delete to authenticated using (student_id = auth.uid());

create policy "insert own reports" on public.reports for insert to authenticated with check (reported_by = auth.uid());
create policy "read own reports" on public.reports for select to authenticated using (reported_by = auth.uid());

-- ============ SEED ============
insert into public.departments (code, name) values
 ('CSE','Computer Science & Engineering'),('ECE','Electronics & Communication'),('MECH','Mechanical Engineering'),
 ('IT','Information Technology'),('AI-DS','AI & Data Science'),('CIVIL','Civil Engineering');
insert into public.regulations (name) values ('R23'),('R21'),('R19'),('R16');
insert into public.academic_years (year) values (1),(2),(3),(4);
insert into public.semesters (number) select generate_series(1,8);
insert into public.resource_types (slug, name) values
 ('pyq','Previous Year Question Papers'),('syllabus','Syllabus'),('notes','Unit-wise Notes'),
 ('lab','Lab Stuff'),('important','Important Questions');