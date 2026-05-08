-- =============================================================================
-- Klinix.digital — Initial schema
-- =============================================================================
-- Cria as 9 tabelas do CRM, ENUMs, RLS habilitado em todas as tabelas com
-- policies permissivas temporárias (serão restritas no Prompt 11 — Auditoria),
-- e o trigger que copia novos usuários do schema `auth` (gerenciado pelo
-- Supabase) para a tabela pública `users`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensões
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";    -- gen_random_uuid()


-- -----------------------------------------------------------------------------
-- ENUMs
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('ADMIN', 'SECRETARY');
  end if;

  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum ('SCHEDULED', 'COMPLETED', 'CANCELED');
  end if;
end$$;


-- -----------------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null unique,
  role        public.user_role not null default 'SECRETARY',
  created_at  timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);


-- -----------------------------------------------------------------------------
-- 2. categories
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);


-- -----------------------------------------------------------------------------
-- 3. services
-- -----------------------------------------------------------------------------
create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid not null references public.categories (id) on delete restrict,
  name              text not null,
  duration_minutes  integer not null check (duration_minutes > 0),
  price             numeric(10, 2) not null check (price >= 0)
);

create index if not exists services_category_id_idx on public.services (category_id);


-- -----------------------------------------------------------------------------
-- 4. professionals
-- -----------------------------------------------------------------------------
create table if not exists public.professionals (
  id         uuid primary key default gen_random_uuid(),
  name       text    not null,
  is_active  boolean not null default true
);


-- -----------------------------------------------------------------------------
-- 5. professional_schedules
-- -----------------------------------------------------------------------------
create table if not exists public.professional_schedules (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  day_of_week     integer not null check (day_of_week between 0 and 6),
  start_time      time    not null,
  end_time        time    not null,
  is_working      boolean not null default true,
  constraint professional_schedules_time_order check (end_time > start_time),
  constraint professional_schedules_unique_day unique (professional_id, day_of_week)
);

create index if not exists professional_schedules_professional_id_idx
  on public.professional_schedules (professional_id);


-- -----------------------------------------------------------------------------
-- 6. clients
-- -----------------------------------------------------------------------------
create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  whatsapp            text,
  birth_date          date,
  acquisition_channel text,
  created_at          timestamptz not null default now()
);

create index if not exists clients_full_name_idx on public.clients (full_name);
create index if not exists clients_whatsapp_idx  on public.clients (whatsapp);


-- -----------------------------------------------------------------------------
-- 7. client_anamnesis (1:1 com clients)
-- -----------------------------------------------------------------------------
create table if not exists public.client_anamnesis (
  client_id              uuid primary key references public.clients (id) on delete cascade,
  skin_type              text,
  allergies              text,
  medications            text,
  restrictions           text,
  is_pregnant_or_nursing boolean not null default false
);


-- -----------------------------------------------------------------------------
-- 8. appointments
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients (id)        on delete restrict,
  professional_id  uuid not null references public.professionals (id)  on delete restrict,
  service_id       uuid not null references public.services (id)       on delete restrict,
  appointment_date date not null,
  start_time       time not null,
  end_time         time not null,
  status           public.appointment_status not null default 'SCHEDULED',
  price_charged    numeric(10, 2) not null check (price_charged >= 0),
  constraint appointments_time_order check (end_time > start_time)
);

create index if not exists appointments_client_id_idx        on public.appointments (client_id);
create index if not exists appointments_professional_id_idx  on public.appointments (professional_id);
create index if not exists appointments_service_id_idx       on public.appointments (service_id);
create index if not exists appointments_date_idx             on public.appointments (appointment_date);
create index if not exists appointments_professional_date_idx
  on public.appointments (professional_id, appointment_date);


-- -----------------------------------------------------------------------------
-- 9. audit_logs
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users (id) on delete set null,
  action      text not null,
  details     text,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_user_id_idx    on public.audit_logs (user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);


-- =============================================================================
-- Trigger: auth.users -> public.users
-- =============================================================================
-- Quando um novo usuário é criado em auth.users (via Supabase Auth), copia os
-- dados básicos para a nossa tabela pública. O `role` default é 'SECRETARY';
-- um ADMIN deve promover manualmente quando necessário. O `name` é lido dos
-- raw_user_meta_data se presente, caindo para o e-mail caso contrário.
-- =============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      new.email
    ),
    new.email,
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'SECRETARY'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();


-- =============================================================================
-- Row Level Security
-- =============================================================================
-- Habilita RLS em todas as tabelas. As policies abaixo são PERMISSIVAS para
-- acelerar o desenvolvimento e serão substituídas no Prompt 11 (Auditoria).
-- =============================================================================

alter table public.users                  enable row level security;
alter table public.categories             enable row level security;
alter table public.services               enable row level security;
alter table public.professionals          enable row level security;
alter table public.professional_schedules enable row level security;
alter table public.clients                enable row level security;
alter table public.client_anamnesis       enable row level security;
alter table public.appointments           enable row level security;
alter table public.audit_logs             enable row level security;


-- -----------------------------------------------------------------------------
-- Policies permissivas temporárias (DEV ONLY — restringir no Prompt 11)
-- -----------------------------------------------------------------------------

drop policy if exists "dev_all_users"                  on public.users;
drop policy if exists "dev_all_categories"             on public.categories;
drop policy if exists "dev_all_services"               on public.services;
drop policy if exists "dev_all_professionals"          on public.professionals;
drop policy if exists "dev_all_professional_schedules" on public.professional_schedules;
drop policy if exists "dev_all_clients"                on public.clients;
drop policy if exists "dev_all_client_anamnesis"       on public.client_anamnesis;
drop policy if exists "dev_all_appointments"           on public.appointments;
drop policy if exists "dev_all_audit_logs"             on public.audit_logs;

create policy "dev_all_users"
  on public.users                  for all to authenticated using (true) with check (true);

create policy "dev_all_categories"
  on public.categories             for all to authenticated using (true) with check (true);

create policy "dev_all_services"
  on public.services               for all to authenticated using (true) with check (true);

create policy "dev_all_professionals"
  on public.professionals          for all to authenticated using (true) with check (true);

create policy "dev_all_professional_schedules"
  on public.professional_schedules for all to authenticated using (true) with check (true);

create policy "dev_all_clients"
  on public.clients                for all to authenticated using (true) with check (true);

create policy "dev_all_client_anamnesis"
  on public.client_anamnesis       for all to authenticated using (true) with check (true);

create policy "dev_all_appointments"
  on public.appointments           for all to authenticated using (true) with check (true);

create policy "dev_all_audit_logs"
  on public.audit_logs             for all to authenticated using (true) with check (true);
