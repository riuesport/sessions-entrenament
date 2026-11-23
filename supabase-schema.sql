-- RIU · SQL per al projecte privat de Supabase.
-- 1) Crear un projecte propi. 2) Executar aquest script al SQL Editor.
-- 3) Crear els dos comptes a Authentication > Users (no activar registre públic).
-- 4) Executar el bloc final de membres, substituint els dos emails pels vostres.

create table if not exists public.riu_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'coach' check (role in ('admin','coach')),
  created_at timestamptz not null default now()
);
alter table public.riu_members enable row level security;
revoke all on table public.riu_members from anon, authenticated;
grant select on table public.riu_members to authenticated;
drop policy if exists "RIU membre veu el propi compte" on public.riu_members;
create policy "RIU membre veu el propi compte" on public.riu_members
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.riu_data (
  id text primary key check (id = 'main'),
  version bigint not null default 1,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.riu_data enable row level security;
revoke all on table public.riu_data from anon, authenticated;
grant select on table public.riu_data to authenticated;
drop policy if exists "RIU dades privades per membres" on public.riu_data;
create policy "RIU dades privades per membres" on public.riu_data
  for select to authenticated using (
    exists (select 1 from public.riu_members m where m.user_id = (select auth.uid()))
  );

-- L'única funció que pot escriure: comprova el membre i la revisió anterior.
-- El control de versions evita que dos entrenadors se sobreescriguin els canvis.
create or replace function public.riu_write(p_expected_version bigint, p_payload jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare v_next bigint;
begin
  if (select auth.uid()) is null or not exists (
     select 1 from public.riu_members m where m.user_id = (select auth.uid())
  ) then
    raise exception using message='RIU_NO_AUTORITZAT', errcode='42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object'
     or not (p_payload ? 'exercises' and p_payload ? 'months' and p_payload ? 'motor') then
    raise exception using message='RIU_FORMAT_INVALID',errcode='22023';
  end if;
  if pg_column_size(p_payload) > 16000000 then
    raise exception using message='RIU_DADES_MASSA_GRANS',errcode='22023';
  end if;

  if p_expected_version = 0 then
    insert into public.riu_data(id,version,payload)
       values('main',1,p_payload)
       on conflict(id) do nothing returning version into v_next;
  else
    update public.riu_data
      set version=version+1,payload=p_payload,updated_at=now()
      where id='main' and version=p_expected_version
      returning version into v_next;
  end if;

  if v_next is null then
    raise exception using message='RIU_CONFLICT: el servidor te una versio mes nova',errcode='40001';
  end if;
  return v_next;
end;
$$;
revoke all on function public.riu_write(bigint,jsonb) from public, anon;
grant execute on function public.riu_write(bigint,jsonb) to authenticated;

-- IMPORTANT: Executeu aquesta línia NOMÉS després de crear els DOS comptes.
-- Substituïu els emails d'exemple per les adreces reals al SQL Editor de Supabase:
-- insert into public.riu_members (user_id, role)
-- select id, 'admin' from auth.users where lower(email) in (lower('ENTRENADOR_1@EXEMPLE.COM'),lower('ENTRENADOR_2@EXEMPLE.COM'))
-- on conflict (user_id) do nothing;
-- Comproveu que s'han afegit exactament dos comptes abans d'activar l'aplicació:
-- select count(*) from public.riu_members;