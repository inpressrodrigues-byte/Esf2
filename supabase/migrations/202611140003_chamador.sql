-- O monitor usa uma credencial temporária restrita às chamadas de uma UBS.
create schema prumo_painel;
revoke all on schema prumo_painel from public;
grant usage on schema prumo_painel to authenticated,anon;

create table prumo_painel.telas (
 chave_hash text primary key, unidade text not null references public.unidades_saude_toledo(nome),
 expira timestamptz not null, emissor uuid not null
);
create index telas_unidade on prumo_painel.telas(unidade);
create table prumo_painel.chamadas (
 agenda uuid primary key references public.agenda_ubs(id) on delete cascade,
 evento uuid not null, unidade text not null, etapa text not null, sala text not null,
 profissional text not null, autor uuid not null, instante timestamptz not null
);
create index chamadas_ubs_hora on prumo_painel.chamadas(unidade,instante desc);
alter table prumo_painel.telas enable row level security;
alter table prumo_painel.chamadas enable row level security;
revoke all on all tables in schema prumo_painel from public,anon,authenticated;

create function prumo_painel.configurar(ubs text, desativar boolean) returns uuid
language plpgsql security definer set search_path='' as $$
declare chave uuid;
begin
 if auth.uid() is null or not esf_access.pode_unidade(ubs) or public.usuario_tem_permissao('ver_historico') is not true then raise insufficient_privilege; end if;
 delete from prumo_painel.telas where expira<=now() or (unidade=ubs and desativar);
 if desativar then return null; end if;
 chave=gen_random_uuid();
 insert into prumo_painel.telas values(md5(chave::text),ubs,now()+interval '12 hours',auth.uid());
 return chave;
end $$;

create function prumo_painel.chamar(atendimento uuid, etapa text, destino text, pedido uuid, versao integer, responsavel text default 'eu') returns uuid
language plpgsql security definer set search_path='' as $$
declare a public.agenda_ubs; nome text; momento timestamptz=clock_timestamp(); ultima prumo_painel.chamadas;
begin
 if auth.uid() is null or public.usuario_tem_permissao('ver_historico') is not true then raise insufficient_privilege; end if;
 select * into a from public.agenda_ubs where id=atendimento and esf_access.pode_unidade(unidade) for update;
 if not found or not exists(select 1 from public.pacientes p where p.unidade=a.unidade and p.cpf=a.cpf and nullif(trim(p.dados->>'nome'),'') is not null) then raise exception 'Paciente indisponível nesta unidade'; end if;
 if versao is distinct from a.versao or (etapa='Triagem' and a.estado not in ('Aguardando atendimento','Em escuta')) or
 (etapa='Atendimento' and a.estado not in ('Triagem concluída','Em atendimento')) or etapa is null or etapa not in ('Triagem','Atendimento') then
   raise exception 'Etapa da fila alterada'; end if;
 if responsavel='agenda' then nome=trim(a.profissional);
 elsif responsavel='eu' then select trim(f.nome) into nome from public.perfis f where f.user_id=auth.uid();
 else raise exception 'Responsável inválido'; end if;
 if nullif(nome,'') is null or pedido is null or destino is null or length(trim(destino)) not between 1 and 60 or destino ~ '[[:cntrl:]]' then raise exception 'Confira o profissional e o destino'; end if;
 select * into ultima from prumo_painel.chamadas where agenda=a.id;
 if ultima.evento=pedido and ultima.autor=auth.uid() then return pedido; end if;
 if ultima.etapa=chamar.etapa and ultima.instante>momento-interval '4 seconds' then raise exception 'Aguarde antes de repetir a chamada'; end if;
 delete from prumo_painel.chamadas where chamadas.instante<now()-interval '10 minutes';
 insert into prumo_painel.chamadas values(a.id,pedido,a.unidade,etapa,trim(destino),nome,auth.uid(),momento)
 on conflict(agenda) do update set evento=excluded.evento,etapa=excluded.etapa,sala=excluded.sala,
 profissional=excluded.profissional,autor=excluded.autor,instante=excluded.instante,unidade=excluded.unidade;
 return pedido;
end $$;

create function prumo_painel.ler(chave uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare ubs text;
begin
 select t.unidade into ubs from prumo_painel.telas t where t.chave_hash=md5(chave::text) and t.expira>now()
   and exists(select 1 from public.unidades_saude_toledo u where u.nome=t.unidade and u.ativa);
 if not found then raise insufficient_privilege; end if;
 return jsonb_build_object('unidade',ubs,'chamadas',coalesce((select jsonb_agg(jsonb_build_object(
 'id',c.evento,'paciente',p.dados->>'nome','profissional',c.profissional,'sala',c.sala,'etapa',c.etapa,'hora',c.instante
 ) order by c.instante desc) from prumo_painel.chamadas c
 join public.agenda_ubs a on a.id=c.agenda and a.unidade=c.unidade
 join public.pacientes p on p.cpf=a.cpf and p.unidade=a.unidade
 where c.unidade=ubs and c.instante>now()-interval '2 minutes' and nullif(trim(p.dados->>'nome'),'') is not null
 and ((c.etapa='Triagem' and a.estado in ('Aguardando atendimento','Em escuta')) or
      (c.etapa='Atendimento' and a.estado in ('Triagem concluída','Em atendimento')))), '[]'::jsonb));
end $$;
create function public.agenda_painel_configurar(ubs text,desativar boolean) returns uuid language sql security invoker set search_path='' as $$select prumo_painel.configurar(ubs,desativar)$$;
create function public.agenda_chamar(atendimento uuid,etapa text,destino text,pedido uuid,versao integer,responsavel text default 'eu') returns uuid language sql security invoker set search_path='' as $$select prumo_painel.chamar(atendimento,etapa,destino,pedido,versao,responsavel)$$;
create function public.agenda_painel_ler(chave uuid) returns jsonb language sql security invoker set search_path='' as $$select prumo_painel.ler(chave)$$;
revoke all on all functions in schema prumo_painel from public,authenticated,anon;
revoke all on function public.agenda_chamar(uuid,text,text,uuid,integer,text),public.agenda_painel_configurar(text,boolean),public.agenda_painel_ler(uuid) from public,anon,authenticated;
grant execute on function prumo_painel.configurar(text,boolean),public.agenda_painel_configurar(text,boolean),prumo_painel.chamar(uuid,text,text,uuid,integer,text),public.agenda_chamar(uuid,text,text,uuid,integer,text) to authenticated;
grant execute on function prumo_painel.ler(uuid),public.agenda_painel_ler(uuid) to anon,authenticated;
