-- =============================================================================
-- Klinix.digital — Auth roles + Audit logs (Prompt 10)
-- =============================================================================
-- Restringe RLS por role (ADMIN / SECRETARY) e instala triggers de auditoria
-- em todas as tabelas críticas (appointments, services, professionals, clients,
-- categories, professional_schedules, client_anamnesis).
--
-- Pré-requisitos:
--   * 00001_initial_schema.sql aplicado (com a tabela `audit_logs` em `details TEXT`).
--   * Para os logins funcionarem é preciso criar usuários em Supabase Auth e
--     promover ao menos um pra ADMIN via:
--         update public.users set role = 'ADMIN' where email = '<email>';
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Helper: current_user_role()
-- -----------------------------------------------------------------------------
-- Lê o role do usuário autenticado a partir de public.users (que já é
-- preenchida pelo trigger handle_new_auth_user). Retorna NULL se anônimo.
-- security definer pra rodar mesmo com RLS restritivo na tabela `users`.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role::public.user_role from public.users where id = auth.uid();
$$;


-- -----------------------------------------------------------------------------
-- 2. Audit logs: troca `details TEXT` por `details JSONB`
-- -----------------------------------------------------------------------------
-- Em DEV o append na coluna text não foi usado; recriamos como jsonb pra
-- guardar `{table, op, old, new}` estruturado.

alter table public.audit_logs drop column if exists details;
alter table public.audit_logs add  column details jsonb;


-- -----------------------------------------------------------------------------
-- 3. Trigger function: log_audit_event()
-- -----------------------------------------------------------------------------
-- Insere uma linha em audit_logs sempre que uma das tabelas críticas sofre
-- INSERT/UPDATE/DELETE. `user_id` vem de auth.uid() (pode ser NULL em ações
-- automatizadas/anonymous, e o FK trata via on delete set null).

create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_details jsonb;
begin
  v_action := tg_op || '_' || upper(tg_table_name);

  if tg_op = 'INSERT' then
    v_details := jsonb_build_object(
      'table', tg_table_name,
      'op',    tg_op,
      'new',   to_jsonb(new)
    );
  elsif tg_op = 'UPDATE' then
    v_details := jsonb_build_object(
      'table', tg_table_name,
      'op',    tg_op,
      'old',   to_jsonb(old),
      'new',   to_jsonb(new)
    );
  else -- DELETE
    v_details := jsonb_build_object(
      'table', tg_table_name,
      'op',    tg_op,
      'old',   to_jsonb(old)
    );
  end if;

  insert into public.audit_logs (user_id, action, details)
  values (auth.uid(), v_action, v_details);

  return coalesce(new, old);
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. Triggers de auditoria nas tabelas críticas
-- -----------------------------------------------------------------------------

drop trigger if exists audit_appointments           on public.appointments;
drop trigger if exists audit_services               on public.services;
drop trigger if exists audit_professionals          on public.professionals;
drop trigger if exists audit_professional_schedules on public.professional_schedules;
drop trigger if exists audit_clients                on public.clients;
drop trigger if exists audit_client_anamnesis       on public.client_anamnesis;
drop trigger if exists audit_categories             on public.categories;

create trigger audit_appointments
  after insert or update or delete on public.appointments
  for each row execute function public.log_audit_event();

create trigger audit_services
  after insert or update or delete on public.services
  for each row execute function public.log_audit_event();

create trigger audit_professionals
  after insert or update or delete on public.professionals
  for each row execute function public.log_audit_event();

create trigger audit_professional_schedules
  after insert or update or delete on public.professional_schedules
  for each row execute function public.log_audit_event();

create trigger audit_clients
  after insert or update or delete on public.clients
  for each row execute function public.log_audit_event();

create trigger audit_client_anamnesis
  after insert or update or delete on public.client_anamnesis
  for each row execute function public.log_audit_event();

create trigger audit_categories
  after insert or update or delete on public.categories
  for each row execute function public.log_audit_event();


-- =============================================================================
-- 5. Row Level Security — policies por role
-- =============================================================================
-- Remove as policies permissivas dev_all_* do migration 00001 e instala policies
-- baseadas em current_user_role(). Matriz acordada com o usuário (Prompt 10):
--
--   recurso                   | ADMIN | SECRETARY
--   --------------------------|-------|-----------
--   users (próprio)           | RW    | R (próprio)
--   users (todos)             | R     | -
--   categories                | RWD   | R
--   services                  | RWD   | R
--   professionals             | RWD   | R
--   professional_schedules    | RWD   | R
--   clients                   | RWD   | RW (sem D)
--   client_anamnesis          | RWD   | RW (sem D)
--   appointments              | RWD   | RW (sem D)
--   audit_logs                | R     | -
--
-- Observação: `audit_logs` NÃO tem policy de INSERT explícita; a inserção é
-- feita pelo trigger `log_audit_event()` que roda como SECURITY DEFINER e por
-- isso ignora RLS. Qualquer INSERT direto vindo do client é bloqueado.

-- Drop policies do 00001 (também as de DEV anon caso tenham sido aplicadas).
drop policy if exists "dev_all_users"                  on public.users;
drop policy if exists "dev_all_categories"             on public.categories;
drop policy if exists "dev_all_services"               on public.services;
drop policy if exists "dev_all_professionals"          on public.professionals;
drop policy if exists "dev_all_professional_schedules" on public.professional_schedules;
drop policy if exists "dev_all_clients"                on public.clients;
drop policy if exists "dev_all_client_anamnesis"       on public.client_anamnesis;
drop policy if exists "dev_all_appointments"           on public.appointments;
drop policy if exists "dev_all_audit_logs"             on public.audit_logs;

drop policy if exists "dev_all_users_anon"                  on public.users;
drop policy if exists "dev_all_categories_anon"             on public.categories;
drop policy if exists "dev_all_services_anon"               on public.services;
drop policy if exists "dev_all_professionals_anon"          on public.professionals;
drop policy if exists "dev_all_professional_schedules_anon" on public.professional_schedules;
drop policy if exists "dev_all_clients_anon"                on public.clients;
drop policy if exists "dev_all_client_anamnesis_anon"       on public.client_anamnesis;
drop policy if exists "dev_all_appointments_anon"           on public.appointments;
drop policy if exists "dev_all_audit_logs_anon"             on public.audit_logs;


-- ---- users ------------------------------------------------------------------

create policy "users_admin_read_all"
  on public.users for select to authenticated
  using (public.current_user_role() = 'ADMIN');

create policy "users_self_read"
  on public.users for select to authenticated
  using (id = auth.uid());

create policy "users_admin_write"
  on public.users for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

create policy "users_admin_update"
  on public.users for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

create policy "users_admin_delete"
  on public.users for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- categories -------------------------------------------------------------

create policy "categories_select_all_auth"
  on public.categories for select to authenticated
  using (true);

create policy "categories_admin_insert"
  on public.categories for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

create policy "categories_admin_update"
  on public.categories for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

create policy "categories_admin_delete"
  on public.categories for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- services ---------------------------------------------------------------

create policy "services_select_all_auth"
  on public.services for select to authenticated
  using (true);

create policy "services_admin_insert"
  on public.services for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

create policy "services_admin_update"
  on public.services for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

create policy "services_admin_delete"
  on public.services for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- professionals ----------------------------------------------------------

create policy "professionals_select_all_auth"
  on public.professionals for select to authenticated
  using (true);

create policy "professionals_admin_insert"
  on public.professionals for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

create policy "professionals_admin_update"
  on public.professionals for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

create policy "professionals_admin_delete"
  on public.professionals for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- professional_schedules -------------------------------------------------

create policy "schedules_select_all_auth"
  on public.professional_schedules for select to authenticated
  using (true);

create policy "schedules_admin_insert"
  on public.professional_schedules for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

create policy "schedules_admin_update"
  on public.professional_schedules for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

create policy "schedules_admin_delete"
  on public.professional_schedules for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- clients ----------------------------------------------------------------

create policy "clients_select_all_auth"
  on public.clients for select to authenticated
  using (true);

create policy "clients_write_authenticated"
  on public.clients for insert to authenticated
  with check (public.current_user_role() in ('ADMIN', 'SECRETARY'));

create policy "clients_update_authenticated"
  on public.clients for update to authenticated
  using (public.current_user_role() in ('ADMIN', 'SECRETARY'))
  with check (public.current_user_role() in ('ADMIN', 'SECRETARY'));

create policy "clients_admin_delete"
  on public.clients for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- client_anamnesis -------------------------------------------------------

create policy "anamnesis_select_all_auth"
  on public.client_anamnesis for select to authenticated
  using (true);

create policy "anamnesis_write_authenticated"
  on public.client_anamnesis for insert to authenticated
  with check (public.current_user_role() in ('ADMIN', 'SECRETARY'));

create policy "anamnesis_update_authenticated"
  on public.client_anamnesis for update to authenticated
  using (public.current_user_role() in ('ADMIN', 'SECRETARY'))
  with check (public.current_user_role() in ('ADMIN', 'SECRETARY'));

create policy "anamnesis_admin_delete"
  on public.client_anamnesis for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- appointments -----------------------------------------------------------

create policy "appointments_select_all_auth"
  on public.appointments for select to authenticated
  using (true);

create policy "appointments_write_authenticated"
  on public.appointments for insert to authenticated
  with check (public.current_user_role() in ('ADMIN', 'SECRETARY'));

create policy "appointments_update_authenticated"
  on public.appointments for update to authenticated
  using (public.current_user_role() in ('ADMIN', 'SECRETARY'))
  with check (public.current_user_role() in ('ADMIN', 'SECRETARY'));

create policy "appointments_admin_delete"
  on public.appointments for delete to authenticated
  using (public.current_user_role() = 'ADMIN');


-- ---- audit_logs (somente ADMIN lê; INSERT pelo trigger SECURITY DEFINER) ----

create policy "audit_logs_admin_select"
  on public.audit_logs for select to authenticated
  using (public.current_user_role() = 'ADMIN');
