-- Executar atomicamente via apply_migration após os testes isolados.
begin;
create schema if not exists esf_access;
revoke all on schema esf_access from public,anon;
grant usage on schema esf_access to authenticated;

-- Consulta apenas a identidade autenticada; nunca aceita um usuário do cliente.
-- SECURITY DEFINER é necessário para ler a autorização sem recursão nas RLS.
create or replace function esf_access.contexto()
returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce((select jsonb_build_object(
   'ativo',p.ativo is true and p.blocked is not true,
   'municipal',p.ativo is true and p.blocked is not true and
      (public.usuario_tem_permissao('ver_admin') is true or f.permissoes->>'nivel_acesso'='gerente_municipal' or p.perfil='gerente_municipio'),
   'gestor_ubs',f.permissoes->>'nivel_acesso'='gerente_esf',
   'unidade',(select u.nome from public.unidades_saude_toledo u
      where u.nome=f.unidade and u.ativa and f.permissoes->>'unidade_escopo'=f.unidade)
 ) from public.profiles p left join public.perfis f on f.user_id=p.id
 where p.id=auth.uid() and auth.uid() is not null),'{"ativo":false,"municipal":false}'::jsonb)
$$;
revoke all on function esf_access.contexto() from public,anon;
grant execute on function esf_access.contexto() to authenticated;

create or replace function esf_access.pode_unidade(alvo text)
returns boolean language sql stable set search_path='' as $$
 select coalesce((c->>'ativo')::boolean and ((c->>'municipal')::boolean or
   (nullif(c->>'unidade','') is not null and alvo=c->>'unidade')),false)
 from (select esf_access.contexto() c) s
$$;
revoke all on function esf_access.pode_unidade(text) from public,anon;
grant execute on function esf_access.pode_unidade(text) to authenticated;

-- profiles não pode servir como atalho de autoatribuição de papel/unidade.
do $$declare r record;begin
 for r in select policyname from pg_policies where schemaname='public' and tablename='profiles'
 loop execute format('drop policy %I on public.profiles',r.policyname);end loop;
end$$;
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select,update on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated
 using(id=(select auth.uid()) or public.usuario_tem_permissao('ver_admin') is true);
create policy profiles_write on public.profiles for update to authenticated
 using(id=(select auth.uid()) or public.usuario_tem_permissao('ver_admin') is true)
 with check(id=(select auth.uid()) or public.usuario_tem_permissao('ver_admin') is true);
create or replace function esf_access.proteger_perfil()
returns trigger language plpgsql set search_path='' as $$
begin
 if auth.uid() is null and current_user in ('postgres','supabase_admin','service_role') then return new;end if;
 if (to_jsonb(new)-array['full_name','nome','cargo','conselho','updated_at'])
    is distinct from (to_jsonb(old)-array['full_name','nome','cargo','conselho','updated_at'])
    and public.usuario_tem_permissao('ver_admin') is not true then
   raise exception 'Somente a administração pode alterar acesso, identidade ou unidade.' using errcode='42501';
 end if;
 return new;
end$$;
revoke all on function esf_access.proteger_perfil() from public,anon,authenticated;
drop trigger if exists proteger_acesso_profiles on public.profiles;
create trigger proteger_acesso_profiles before update on public.profiles for each row execute function esf_access.proteger_perfil();

alter table public.pacientes add column if not exists unidade text references public.unidades_saude_toledo(nome);
create index if not exists pacientes_unidade_idx on public.pacientes(unidade);
-- Alias histórico localizado na inspeção; não altera conteúdo clínico.
update public.atendimentos set unidade='ESFSB Cosmos' where lower(btrim(unidade))='esf cosmos';
-- Só atribui automaticamente quando há uma única UBS no histórico do CPF.
update public.pacientes p set unidade=x.unidade
from (select a.paciente_cpf,min(a.unidade) unidade from public.atendimentos a
      left join public.unidades_saude_toledo u on u.nome=a.unidade
      group by a.paciente_cpf having count(distinct a.unidade)=1 and count(*)=count(u.nome)) x
where p.cpf=x.paciente_cpf and p.unidade is null;

create or replace function esf_access.proteger_paciente()
returns trigger language plpgsql set search_path='' as $$
declare c jsonb;
begin
 if auth.uid() is null and current_user in ('postgres','supabase_admin','service_role') then return new;end if;
 c:=esf_access.contexto();
 if tg_op='INSERT' and new.unidade is null then new.unidade:=nullif(c->>'unidade','');end if;
 if tg_op='UPDATE' and new.unidade is distinct from old.unidade and coalesce((c->>'municipal')::boolean,false) is not true then
   raise exception 'Somente a gestão municipal pode transferir o cadastro de UBS.' using errcode='42501';
 end if;
 new.dados:=jsonb_set(coalesce(new.dados,'{}'::jsonb),'{unidade}',coalesce(to_jsonb(new.unidade),'null'::jsonb));
 return new;
end$$;
revoke all on function esf_access.proteger_paciente() from public,anon,authenticated;
drop trigger if exists pacientes_proteger_ubs on public.pacientes;
create trigger pacientes_proteger_ubs before insert or update on public.pacientes for each row execute function esf_access.proteger_paciente();

-- Remove políticas permissivas antigas: não podem ampliar a nova política por OR.
do $$declare r record;begin
 for r in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('pacientes','atendimentos')
 loop execute format('drop policy %I on public.%I',r.policyname,r.tablename);end loop;
end$$;
alter table public.pacientes enable row level security;
alter table public.atendimentos enable row level security;
revoke all on public.pacientes,public.atendimentos from public,anon,authenticated;
grant select,insert,update,delete on public.pacientes,public.atendimentos to authenticated;
create policy pacientes_read on public.pacientes for select to authenticated using(esf_access.pode_unidade(unidade));
create policy pacientes_insert on public.pacientes for insert to authenticated
 with check(esf_access.pode_unidade(unidade) and updated_by=(select auth.uid()));
create policy pacientes_update on public.pacientes for update to authenticated
 using(esf_access.pode_unidade(unidade)) with check(esf_access.pode_unidade(unidade) and updated_by=(select auth.uid()));
create policy pacientes_delete on public.pacientes for delete to authenticated
 using(coalesce(((select esf_access.contexto())->>'municipal')::boolean,false));
create policy atendimentos_read on public.atendimentos for select to authenticated
 using(esf_access.pode_unidade(unidade) and
   (user_id=(select auth.uid()) or coalesce(((select esf_access.contexto())->>'municipal')::boolean,false) or coalesce(((select esf_access.contexto())->>'gestor_ubs')::boolean,false)));
create policy atendimentos_insert on public.atendimentos for insert to authenticated
 with check(esf_access.pode_unidade(unidade) and user_id=(select auth.uid()));
create policy atendimentos_update on public.atendimentos for update to authenticated
 using(esf_access.pode_unidade(unidade) and (user_id=(select auth.uid()) or coalesce(((select esf_access.contexto())->>'municipal')::boolean,false)))
 with check(esf_access.pode_unidade(unidade) and (user_id=(select auth.uid()) or coalesce(((select esf_access.contexto())->>'municipal')::boolean,false)));
create policy atendimentos_delete on public.atendimentos for delete to authenticated
 using(esf_access.pode_unidade(unidade) and (user_id=(select auth.uid()) or coalesce(((select esf_access.contexto())->>'municipal')::boolean,false)));
notify pgrst,'reload schema';
commit;
