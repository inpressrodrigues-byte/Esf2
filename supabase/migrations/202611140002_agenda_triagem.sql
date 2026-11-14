create table public.agenda_horarios (
  id uuid primary key default gen_random_uuid(),
  unidade text not null references public.unidades_saude_toledo(nome),
  profissional_id uuid not null default auth.uid(),
  profissional text not null check(length(trim(profissional)) between 1 and 160),
  inicio timestamptz not null,
  duracao integer not null check(duracao between 1 and 480),
  unique(profissional_id,inicio), unique(unidade,profissional,inicio)
);
-- A reserva de cada minuto usa uma chave única, inclusive entre UBS e em transações concorrentes.
create table esf_access.agenda_minutos (
  vaga uuid not null references public.agenda_horarios on delete cascade,
  profissional_id uuid not null, minuto timestamptz not null, primary key(profissional_id,minuto)
);
create index agenda_minutos_vaga on esf_access.agenda_minutos(vaga);
revoke all on esf_access.agenda_minutos from public,anon,authenticated;
create function esf_access.reservar_minutos() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if date_trunc('minute',new.inicio)<>new.inicio then raise exception 'Horário inválido'; end if;
 insert into esf_access.agenda_minutos select new.id,new.profissional_id,new.inicio+i*interval '1 minute' from generate_series(0,new.duracao-1) i;
 return new;
end $$;
revoke all on function esf_access.reservar_minutos() from public,anon,authenticated;
create trigger reservar_minutos after insert on public.agenda_horarios for each row execute function esf_access.reservar_minutos();
alter table public.agenda_horarios enable row level security;
revoke all on public.agenda_horarios from public,anon,authenticated;
grant select,insert(unidade,profissional,inicio,duracao),delete on public.agenda_horarios to authenticated;
create policy horarios_ler on public.agenda_horarios for select to authenticated using
(esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico')));
create policy horarios_abrir on public.agenda_horarios for insert to authenticated with check
(esf_access.pode_unidade(unidade) and profissional_id=(select auth.uid()) and inicio>now() and (select public.usuario_tem_permissao('ver_historico'))
 and exists(select 1 from public.perfis f where f.user_id=(select auth.uid()) and f.unidade=agenda_horarios.unidade and trim(f.nome)=agenda_horarios.profissional));
create policy horarios_fechar on public.agenda_horarios for delete to authenticated using
(esf_access.pode_unidade(unidade) and profissional_id=(select auth.uid()));

alter table public.agenda_ubs add column horario_id uuid references public.agenda_horarios(id),
 add column triagem jsonb, add column triado_por uuid, add column triado_em timestamptz;
grant insert(horario_id),update(horario_id,triagem) on public.agenda_ubs to authenticated;
create unique index agenda_reserva_ativa on public.agenda_ubs(horario_id) where horario_id is not null and estado not in ('Cancelado','Faltou');
alter table public.agenda_ubs drop constraint agenda_ubs_estado_check;
alter table public.agenda_ubs add check(estado in ('Aguardando vaga','Agendado','Aguardando atendimento','Em escuta','Triagem concluída','Em atendimento','Em observação','Compartilhado','Respondido','Concluído','Faltou','Cancelado'));

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
 if not (case old.estado
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
