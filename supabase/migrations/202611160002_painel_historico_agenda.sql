alter table prumo_painel.chamadas drop constraint chamadas_pkey,
 add primary key (agenda,evento), add column cargo text, add column autor_nome text;
create index chamadas_agenda_instante on prumo_painel.chamadas(agenda,instante desc);

create or replace function prumo_painel.chamar(atendimento uuid, etapa text, destino text, pedido uuid, versao integer, responsavel text default 'eu') returns uuid
language plpgsql security definer set search_path='' as $$
declare a public.agenda_ubs; nome text; emissor text; categoria text; momento timestamptz=clock_timestamp(); ultima prumo_painel.chamadas;
begin
 if auth.uid() is null or public.usuario_tem_permissao('ver_historico') is not true then raise insufficient_privilege; end if;
 select * into a from public.agenda_ubs where id=atendimento and esf_access.pode_unidade(unidade) for update;
 if not found or not exists(select 1 from public.pacientes p where p.unidade=a.unidade and p.cpf=a.cpf and nullif(trim(p.dados->>'nome'),'') is not null) then raise exception 'Paciente indisponível nesta unidade'; end if;
 if versao is distinct from a.versao or (etapa='Triagem' and a.estado not in ('Aguardando atendimento','Em escuta')) or
 (etapa='Atendimento' and a.estado not in ('Triagem concluída','Em atendimento')) or etapa is null or etapa not in ('Triagem','Atendimento') then
   raise exception 'Etapa da fila alterada'; end if;
 select coalesce(nullif(btrim(f.nome),''),nullif(btrim(auth.jwt()->'user_metadata'->>'nome'),'')),
        coalesce(nullif(btrim(f.cargo),''),nullif(btrim(auth.jwt()->'user_metadata'->>'cargo'),''))
 into emissor,categoria from (select auth.uid() as id) u left join public.perfis f on f.user_id=u.id;
 if responsavel='agenda' then
   nome=trim(a.profissional);
   select nullif(btrim(f.cargo),'') into categoria from public.agenda_horarios h
   join public.perfis f on f.user_id=h.profissional_id
   where h.id=a.horario_id and h.unidade=a.unidade and h.profissional=a.profissional;
 elsif responsavel='eu' then
   nome=emissor;
 else raise exception 'Responsável inválido'; end if;
 if nullif(nome,'') is null then raise exception 'Profissional sem nome cadastrado'; end if;
 if pedido is null or destino is null or length(trim(destino)) not between 1 and 60 or destino ~ '[[:cntrl:]]' then raise exception 'Confira a sala ou o consultório'; end if;
 if exists(select 1 from prumo_painel.chamadas where agenda=a.id and evento=pedido and autor=auth.uid()) then return pedido; end if;
 select * into ultima from prumo_painel.chamadas where agenda=a.id order by instante desc limit 1;
 if ultima.etapa=chamar.etapa and ultima.instante>momento-interval '4 seconds' then raise exception 'Aguarde antes de repetir a chamada'; end if;
 delete from prumo_painel.chamadas where chamadas.instante<now()-interval '30 minutes';
 insert into prumo_painel.chamadas(agenda,evento,unidade,etapa,sala,profissional,autor,instante,cargo,autor_nome)
 values(a.id,pedido,a.unidade,etapa,trim(destino),nome,auth.uid(),momento,categoria,emissor);
 return pedido;
end $$;

create or replace function prumo_painel.ler(chave uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare ubs text;
begin
 select t.unidade into ubs from prumo_painel.telas t where t.chave_hash=md5(chave::text) and t.expira>now()
   and exists(select 1 from public.unidades_saude_toledo u where u.nome=t.unidade and u.ativa);
 if not found then raise insufficient_privilege; end if;
 return (
   with recentes as (
     select c.*, a.estado, p.dados->>'nome' as paciente
     from prumo_painel.chamadas c
     join public.agenda_ubs a on a.id=c.agenda and a.unidade=c.unidade
     join public.pacientes p on p.cpf=a.cpf and p.unidade=a.unidade
     where c.unidade=ubs and c.instante>now()-interval '30 minutes'
       and a.estado<>'Cancelado' and nullif(trim(p.dados->>'nome'),'') is not null
   ), atuais as (
     select distinct on (agenda) * from recentes where instante>now()-interval '2 minutes'
       and ((etapa='Triagem' and estado in ('Aguardando atendimento','Em escuta'))
         or (etapa='Atendimento' and estado in ('Triagem concluída','Em atendimento')))
     order by agenda, instante desc
   )
   select jsonb_build_object('unidade',ubs,
     'chamadas',coalesce((select jsonb_agg(jsonb_build_object(
       'id',evento,'paciente',paciente,'profissional',profissional,'cargo',cargo,'sala',sala,'etapa',etapa,'hora',instante
     ) order by instante desc) from atuais),'[]'::jsonb),
     'historico',coalesce((select jsonb_agg(jsonb_build_object(
       'paciente',paciente,'quemChamou',autor_nome,'etapa',etapa,'hora',instante
     ) order by instante desc) from (select * from recentes order by instante desc limit 6) h),'[]'::jsonb))
 );
end $$;

create or replace function esf_access.agenda_transicao() returns trigger language plpgsql set search_path='' as $$
declare vaga public.agenda_horarios; k text; v jsonb;
begin
 if new.estado='Agendado' and (tg_op='INSERT' or new.horario_id is distinct from old.horario_id or new.horario is distinct from old.horario or new.profissional is distinct from old.profissional or old.estado<>'Agendado') then
   select * into vaga from public.agenda_horarios where id=new.horario_id and unidade=new.unidade;
   if vaga.id is null or vaga.inicio<=now() or new.horario is distinct from vaga.inicio or new.profissional is distinct from vaga.profissional then
     raise exception 'Selecione um horário livre da agenda do profissional'; end if;
 elsif tg_op='UPDATE' and new.estado<>'Agendado' and (new.horario_id is distinct from old.horario_id or new.horario is distinct from old.horario) then
   raise exception 'Altere o horário pelo reagendamento';
 end if;
 if tg_op='INSERT' then
   if new.estado not in ('Aguardando vaga','Agendado','Aguardando atendimento','Compartilhado') or (new.estado<>'Agendado' and new.horario_id is not null) then raise exception 'Situação inicial inválida'; end if;
   return new;
 end if;
 if not ((new.estado='Cancelado' and old.estado in ('Em escuta','Em atendimento','Em observação','Respondido')) or case old.estado
  when 'Aguardando vaga' then new.estado in ('Agendado','Aguardando atendimento','Cancelado')
  when 'Agendado' then new.estado in ('Agendado','Aguardando atendimento','Faltou','Cancelado')
  when 'Aguardando atendimento' then new.estado in ('Em escuta','Cancelado')
  when 'Em escuta' then new.estado in ('Triagem concluída','Compartilhado','Concluído')
  when 'Triagem concluída' then new.estado in ('Em atendimento','Cancelado')
  when 'Em atendimento' then new.estado in ('Em observação','Compartilhado','Concluído')
  when 'Em observação' then new.estado in ('Em atendimento','Compartilhado','Concluído')
  when 'Compartilhado' then new.estado in ('Respondido','Cancelado')
  when 'Respondido' then new.estado in ('Em atendimento','Concluído')
  else false end) then raise exception 'Transição indisponível'; end if;
 if new.estado='Triagem concluída' then
   if jsonb_typeof(new.triagem) is distinct from 'object' or new.triagem='{}'::jsonb then raise exception 'Registre as medidas ou o motivo da ausência'; end if;
   for k,v in select * from jsonb_each(new.triagem) loop
     if k not in ('pas','pad','fc','fr','temp','spo2','obs') or jsonb_typeof(v)<>'string' or length(trim(v#>>'{}')) not between 1 and 500 then raise exception 'Triagem inválida'; end if;
     if k<>'obs' and ((v#>>'{}') !~ '^[0-9]{1,3}([.][0-9])?$' or (v#>>'{}')::numeric<=0 or (k='spo2' and (v#>>'{}')::numeric>100)) then raise exception 'Medida inválida'; end if;
   end loop;
   new.triado_por=auth.uid();new.triado_em=now();
 elsif new.triagem is distinct from old.triagem then raise exception 'Registre as medidas na conclusão da triagem'; end if;
 if new.estado='Respondido' and trim(new.devolutiva)='' then raise exception 'Informe a devolutiva'; end if;
 new.versao=old.versao+1;new.atualizado_por=auth.uid();new.atualizado_em=now();return new;
end $$;
