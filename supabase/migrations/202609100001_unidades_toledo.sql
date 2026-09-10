begin;
create table if not exists public.unidades_saude_toledo (
 codigo text primary key,
 nome text not null unique,
 grupo text not null,
 fonte text not null,
 ativa boolean not null default true
);
alter table public.unidades_saude_toledo enable row level security;
revoke all on public.unidades_saude_toledo from public,anon,authenticated;
grant select on public.unidades_saude_toledo to authenticated;
drop policy if exists unidades_leitura on public.unidades_saude_toledo;
create policy unidades_leitura on public.unidades_saude_toledo for select to authenticated using (true);

insert into public.unidades_saude_toledo (codigo,nome,grupo,fonte) values
('6420958','SMS de Toledo','Gabinete da Secretaria de Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('7294123','Ambulatório de Feridas de Toledo','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('0836060','AMI Ambulatório Materno Infantil','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056949','EAP Boa Vista','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056809','EAP Centro de Saúde de Toledo','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6846327','EAP CERTI Coopagro','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6846319','EAP CERTI Pioneira','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056906','EAP Dois Irmãos / Vila Ipiranga','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056841','EAP Jardim Coopagro','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4057007','EAP Jardim Porto Alegre','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('3404935','EAP Novo Sobradinho','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4057015','EAP Vila Industrial','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056930','EAP/ESF Jardim Maracanã','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056914','ESF Dez de Maio','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056922','ESF Interior Leste','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9756868','ESF Interior Oeste','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9983465','ESFSB Alto Panorama','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('7294700','ESFSB Bressan Cezar Parque','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9002995','ESFSB Cosmos','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056973','ESFSB Jardim Concórdia','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056868','ESFSB Jardim Europa','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('7096623','ESFSB Jardim Pancera','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056981','ESFSB Jardim Panorama','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056965','ESFSB Novo Sarandi','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9624643','ESFSB Paulista','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6748597','ESFSB Santa Clara IV','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6050409','ESFSB São Francisco','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056957','ESFSB Vila Nova','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('7591411','Polo de Academia da Saúde de Toledo','Rede de Atenção Primária à Saúde','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('7463847','EMAD Equipe Multiprofissional de Atenção Domiciliar','Rede de Atenção Às Urgências E Emergências','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4056698','Pronto Atendimento 24 Horas Dr Jorge Milton Nunes','Rede de Atenção Às Urgências E Emergências','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('7737866','UPA II Unidade de Pronto Atendimento','Rede de Atenção Às Urgências E Emergências','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9621830','Central de Abastecimento Farmacêutico CAF','Farmácias','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9462716','Farmácia Comunitária da Pioneira','Farmácias','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4579852','Farmácia Comunitária Santa Maria','Farmácias','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4057023','Farmácia Escola','Farmácias','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6706894','Ambulatório de Saúde Mental','Rede de Atenção à Saúde Mental','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6120768','CAPS AD Centro de Atenção Psicossocial Álcool e Drogas','Rede de Atenção à Saúde Mental','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('9688153','CAPS I Centro de Atenção Psicossocial Infantil','Rede de Atenção à Saúde Mental','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('3586030','CAPS II Centro de Atenção Psicossocial','Rede de Atenção à Saúde Mental','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('6706908','Central de Especialidades de Toledo','Rede de Atenção Especializada','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('0452122','Centro de Fisioterapia, Reabilitação e Terapias Complementares','Rede de Atenção Especializada','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude'),
('4915003','Centro Especializado em Reabilitação - CER II Toledo','Rede de Atenção Especializada','https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/servicos-de-saude')
on conflict (codigo) do update set nome=excluded.nome,grupo=excluded.grupo,fonte=excluded.fonte;


create or replace function public.proteger_unidade_perfil()
returns trigger language plpgsql set search_path='' as $$
declare mudou boolean;
begin
 mudou := new.unidade is distinct from old.unidade;
 if tg_table_name='perfis' then
   mudou := mudou or (new.permissoes->>'unidade_escopo') is distinct from (old.permissoes->>'unidade_escopo');
 end if;
 if not mudou then return new; end if;
 -- Maintenance by the database owner remains possible, without weakening API access.
 if auth.uid() is null and current_user in ('postgres','supabase_admin','service_role') then return new; end if;
 if auth.uid() is null or public.usuario_tem_permissao('ver_admin') is not true then
   raise exception 'Somente o administrador pode alterar a unidade de saúde.' using errcode='42501';
 end if;
 return new;
end;
$$;
drop trigger if exists proteger_unidade_perfis on public.perfis;
create trigger proteger_unidade_perfis before update on public.perfis for each row execute function public.proteger_unidade_perfil();
drop trigger if exists proteger_unidade_profiles on public.profiles;
create trigger proteger_unidade_profiles before update on public.profiles for each row execute function public.proteger_unidade_perfil();

create or replace function public.admin_definir_unidade(p_user_id uuid,p_unidade text)
returns text language plpgsql security definer set search_path='' as $$
declare unidade_escolhida text := btrim(coalesce(p_unidade,'')); cadastro record;
begin
 if auth.uid() is null or public.usuario_tem_permissao('ver_admin') is not true then
   raise exception 'Somente o administrador pode alterar a unidade de saúde.' using errcode='42501';
 end if;
 if unidade_escolhida<>'' and not exists(select 1 from public.unidades_saude_toledo where nome=unidade_escolhida and ativa) then
   raise exception 'Escolha uma unidade da lista de Toledo.' using errcode='22023';
 end if;
 select id,email,raw_user_meta_data into cadastro from auth.users where id=p_user_id;
 if not found then raise exception 'Conta não encontrada.' using errcode='P0002'; end if;
 insert into public.perfis(user_id,nome,email,cargo,unidade)
 values(cadastro.id,coalesce(cadastro.raw_user_meta_data->>'nome',''),coalesce(cadastro.email,''),coalesce(cadastro.raw_user_meta_data->>'cargo',''),unidade_escolhida)
 on conflict(user_id) do nothing;
 update public.perfis set unidade=unidade_escolhida,
   permissoes=jsonb_set(coalesce(permissoes,'{}'::jsonb),'{unidade_escopo}',to_jsonb(unidade_escolhida)),updated_at=now()
 where user_id=p_user_id;
 update public.profiles set unidade=unidade_escolhida,updated_at=now() where id=p_user_id;
 return unidade_escolhida;
end;
$$;
revoke all on function public.admin_definir_unidade(uuid,text) from public,anon;
grant execute on function public.admin_definir_unidade(uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;

