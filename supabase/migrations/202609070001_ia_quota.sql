-- Apenas metadados de limite da IA. Não altera tabelas clínicas existentes.
create schema if not exists esf_ai;
revoke all on schema esf_ai from public, anon, authenticated;
create table if not exists esf_ai.quota (
 user_id uuid primary key references auth.users(id) on delete cascade,
 janela timestamptz not null,
 requisicoes integer not null check (requisicoes >= 0)
);
alter table esf_ai.quota enable row level security;
revoke all on esf_ai.quota from public, anon, authenticated;
create or replace function public.esf_consumir_cota_ia()
returns boolean language plpgsql security definer set search_path = '' as $$
declare usuario uuid := auth.uid(); contador integer;
begin
 if usuario is null then return false; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(usuario::text, 0));
 insert into esf_ai.quota as q(user_id,janela,requisicoes)
 values(usuario,pg_catalog.clock_timestamp(),1)
 on conflict(user_id) do update set
  requisicoes=case when q.janela < pg_catalog.clock_timestamp()-interval '1 hour' then 1 else q.requisicoes+1 end,
  janela=case when q.janela < pg_catalog.clock_timestamp()-interval '1 hour' then pg_catalog.clock_timestamp() else q.janela end
 returning requisicoes into contador;
 return contador <= 30;
end;
$$;
revoke all on function public.esf_consumir_cota_ia() from public, anon;
grant execute on function public.esf_consumir_cota_ia() to authenticated;
