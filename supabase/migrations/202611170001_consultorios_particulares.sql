-- Cadastros particulares usam o mesmo vínculo de unidade, sem CNES fictício.
create unique index unidades_particulares_nome
 on public.unidades_saude_toledo(lower(nome)) where grupo='Consultórios particulares';

create or replace function esf_access.cadastrar_consultorio(p_user_id uuid,p_nome text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare nome_local text=regexp_replace(btrim(p_nome),'[[:space:]]+',' ','g'); local public.unidades_saude_toledo;
begin
 if auth.uid() is null or public.usuario_tem_permissao('ver_admin') is not true then
   raise insufficient_privilege;
 end if;
 if nome_local is null or length(nome_local) not between 3 and 160 or p_nome ~ '[[:cntrl:]]' then
   raise exception 'Informe um nome de consultório entre 3 e 160 caracteres.' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(lower(nome_local),0));
 select * into local from public.unidades_saude_toledo u where lower(u.nome)=lower(nome_local) limit 1;
 if found then
   if local.grupo<>'Consultórios particulares' or not local.ativa then
     raise exception 'Este nome já pertence a outro local. Escolha outro nome.' using errcode='22023';
   end if;
 else
   insert into public.unidades_saude_toledo(codigo,nome,grupo,fonte)
   values('particular-'||gen_random_uuid()::text,nome_local,'Consultórios particulares','Cadastro da administração')
   returning * into local;
 end if;
 perform public.admin_definir_unidade(p_user_id,local.nome);
 return jsonb_build_object('codigo',local.codigo,'nome',local.nome,'grupo',local.grupo);
end $$;
revoke all on function esf_access.cadastrar_consultorio(uuid,text) from public,anon;
grant execute on function esf_access.cadastrar_consultorio(uuid,text) to authenticated;
create function public.admin_cadastrar_consultorio(p_user_id uuid,p_nome text)
returns jsonb language sql security invoker set search_path='' as $$
 select esf_access.cadastrar_consultorio(p_user_id,p_nome)
$$;
revoke all on function public.admin_cadastrar_consultorio(uuid,text) from public,anon;
grant execute on function public.admin_cadastrar_consultorio(uuid,text) to authenticated;

-- A gestão municipal consulta sua rede. O administrador continua gerindo os vínculos.
create or replace function esf_access.pode_unidade(alvo text)
returns boolean language sql stable set search_path='' as $$
 select coalesce((c->>'ativo')::boolean and (
   (nullif(c->>'unidade','') is not null and alvo=c->>'unidade') or
   ((c->>'municipal')::boolean and
     (public.usuario_tem_permissao('ver_admin') is true or not exists(
       select 1 from public.unidades_saude_toledo u where u.nome=alvo and u.grupo='Consultórios particulares'
     )))
 ),false) from (select esf_access.contexto() c) s
$$;
notify pgrst,'reload schema';
