create or replace function prumo_painel.chamar(atendimento uuid, etapa text, destino text, pedido uuid, versao integer, responsavel text default 'eu') returns uuid
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
 elsif responsavel='eu' then
   nome=coalesce(
     (select nullif(btrim(f.nome),'') from public.perfis f where f.user_id=auth.uid()),
     nullif(btrim(auth.jwt()->'user_metadata'->>'nome'),'')
   );
 else raise exception 'Responsável inválido'; end if;
 if nullif(nome,'') is null then raise exception 'Profissional sem nome cadastrado'; end if;
 if pedido is null or destino is null or length(trim(destino)) not between 1 and 60 or destino ~ '[[:cntrl:]]' then raise exception 'Confira a sala ou o consultório'; end if;
 select * into ultima from prumo_painel.chamadas where agenda=a.id;
 if ultima.evento=pedido and ultima.autor=auth.uid() then return pedido; end if;
 if ultima.etapa=chamar.etapa and ultima.instante>momento-interval '4 seconds' then raise exception 'Aguarde antes de repetir a chamada'; end if;
 delete from prumo_painel.chamadas where chamadas.instante<now()-interval '10 minutes';
 insert into prumo_painel.chamadas values(a.id,pedido,a.unidade,etapa,trim(destino),nome,auth.uid(),momento)
 on conflict(agenda) do update set evento=excluded.evento,etapa=excluded.etapa,sala=excluded.sala,
 profissional=excluded.profissional,autor=excluded.autor,instante=excluded.instante,unidade=excluded.unidade;
 return pedido;
end $$;
