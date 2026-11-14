-- A fila e os pedidos de cuidado compartilhado pertencem à unidade.
create table public.agenda_ubs (
 id uuid primary key default gen_random_uuid(),
 unidade text not null references public.unidades_saude_toledo(nome),
 cpf text not null references public.pacientes(cpf),
 estado text not null check (estado in ('Aguardando vaga','Agendado','Aguardando atendimento','Em escuta','Em atendimento','Em observação','Compartilhado','Respondido','Concluído','Faltou','Cancelado')),
 profissional text not null check (length(trim(profissional)) between 1 and 160),
 horario timestamptz,
 motivo text not null check (length(trim(motivo)) between 1 and 1000),
 devolutiva text not null default '' check(length(devolutiva)<=2000),
 versao int not null default 1,
 atualizado_por uuid not null default auth.uid(),
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now(),
 check(estado <> 'Agendado' or horario is not null)
);
create unique index agenda_ubs_horario on public.agenda_ubs(unidade,lower(trim(profissional)),horario)
 where horario is not null and estado in ('Agendado','Aguardando atendimento','Em escuta','Em atendimento','Em observação');
create index agenda_ubs_painel on public.agenda_ubs(unidade,estado,criado_em);
create index agenda_ubs_paciente on public.agenda_ubs(cpf);
create table public.agenda_ubs_historico (
 agenda_id uuid not null references public.agenda_ubs(id), versao int not null, estado text not null,
 responsavel text not null, anotacao text not null, autor uuid not null, registrado_em timestamptz not null,
 primary key(agenda_id,versao)
);
alter table public.agenda_ubs_historico enable row level security;
revoke all on public.agenda_ubs_historico from public,anon,authenticated;
grant select on public.agenda_ubs_historico to authenticated;
create policy historico_equipe on public.agenda_ubs_historico for select to authenticated
 using(exists(select 1 from public.agenda_ubs a where a.id=agenda_id));
create function esf_access.agenda_historico() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.agenda_ubs_historico values(new.id,new.versao,new.estado,new.profissional,new.devolutiva,new.atualizado_por,new.atualizado_em);
 return new;
end $$;
revoke all on function esf_access.agenda_historico() from public,anon,authenticated;
create trigger agenda_historico after insert or update on public.agenda_ubs for each row execute function esf_access.agenda_historico();
alter table public.agenda_ubs enable row level security;
revoke all on public.agenda_ubs from public,anon,authenticated;
grant select,insert(id,unidade,cpf,estado,profissional,horario,motivo),update(estado,profissional,horario,devolutiva) on public.agenda_ubs to authenticated;
create policy agenda_equipe on public.agenda_ubs for all to authenticated
 using (esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico')) and exists
   (select 1 from public.pacientes p where p.cpf=agenda_ubs.cpf and p.unidade=agenda_ubs.unidade))
 with check (esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico')) and exists
   (select 1 from public.pacientes p where p.cpf=agenda_ubs.cpf and p.unidade=agenda_ubs.unidade));
create function esf_access.agenda_transicao() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
   if new.estado not in ('Aguardando vaga','Agendado','Aguardando atendimento','Compartilhado') then raise exception 'Situação inicial inválida'; end if;
   return new;
 end if;
 if not (case old.estado
  when 'Aguardando vaga' then new.estado in ('Agendado','Aguardando atendimento','Cancelado')
  when 'Agendado' then new.estado in ('Agendado','Aguardando atendimento','Faltou','Cancelado')
  when 'Aguardando atendimento' then new.estado in ('Em escuta','Em atendimento','Cancelado')
  when 'Em escuta' then new.estado in ('Em atendimento','Compartilhado','Concluído')
  when 'Em atendimento' then new.estado in ('Em observação','Compartilhado','Concluído')
  when 'Em observação' then new.estado in ('Em atendimento','Compartilhado','Concluído')
  when 'Compartilhado' then new.estado in ('Respondido','Cancelado')
  when 'Respondido' then new.estado in ('Em atendimento','Concluído')
  else false end) then raise exception 'Transição indisponível'; end if;
 if new.estado='Respondido' and trim(new.devolutiva)='' then raise exception 'Informe a devolutiva'; end if;
 new.versao=old.versao+1; new.atualizado_por=auth.uid(); new.atualizado_em=now();
 return new;
end $$;
revoke all on function esf_access.agenda_transicao() from public,anon,authenticated;
create trigger agenda_transicao before insert or update on public.agenda_ubs for each row execute function esf_access.agenda_transicao();
create table public.acoes_ubs (
 id uuid primary key default gen_random_uuid(), unidade text not null references public.unidades_saude_toledo(nome),
 tipo text not null check(tipo in ('Dose aplicada','Dose transcrita','Atividade coletiva')),
 dia date not null, descricao text not null check(length(trim(descricao)) between 1 and 300),
 cpf text references public.pacientes(cpf), dose text, lote text, fabricante text, proxima date,
 participantes int, participantes_cpf text[] not null default '{}', criado_por uuid not null default auth.uid(), criado_em timestamptz not null default now(),
 check (cardinality(participantes_cpf)=0 or (tipo='Atividade coletiva' and cardinality(participantes_cpf)<=participantes)),
 check (proxima is null or proxima>dia),
 check ((tipo='Atividade coletiva' and cpf is null and participantes>0 and participantes is not null and dose is null and proxima is null)
    or (tipo<>'Atividade coletiva' and cpf is not null and participantes is null and nullif(trim(dose),'') is not null
    and (tipo='Dose transcrita' or (nullif(trim(lote),'') is not null and nullif(trim(fabricante),'') is not null))))
);
create index acoes_ubs_periodo on public.acoes_ubs(unidade,dia desc);
create index acoes_ubs_dose on public.acoes_ubs(unidade,cpf,proxima) where cpf is not null;
alter table public.acoes_ubs enable row level security;
revoke all on public.acoes_ubs from public,anon,authenticated;
grant select,insert(id,unidade,tipo,dia,descricao,cpf,dose,lote,fabricante,proxima,participantes,participantes_cpf) on public.acoes_ubs to authenticated;
create function esf_access.validar_participantes() returns trigger language plpgsql set search_path='' as $$
begin
 if cardinality(new.participantes_cpf)<>(select count(*) from public.pacientes p where p.unidade=new.unidade and p.cpf=any(new.participantes_cpf)) then
   raise exception 'Confira duplicidades e vínculo dos participantes com a UBS';
 end if;
 return new;
end $$;
revoke all on function esf_access.validar_participantes() from public,anon,authenticated;
create trigger validar_participantes before insert on public.acoes_ubs for each row execute function esf_access.validar_participantes();
create policy acoes_equipe on public.acoes_ubs for all to authenticated
 using (esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico'))
    and (cpf is null or exists(select 1 from public.pacientes p where p.cpf=acoes_ubs.cpf and p.unidade=acoes_ubs.unidade)))
 with check (dia <= (now() at time zone 'America/Sao_Paulo')::date and esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico'))
    and (cpf is null or exists(select 1 from public.pacientes p where p.cpf=acoes_ubs.cpf and p.unidade=acoes_ubs.unidade)));
create table public.imoveis_ubs (
 id uuid primary key default gen_random_uuid(), unidade text not null references public.unidades_saude_toledo(nome),
 microarea text not null check(length(trim(microarea)) between 1 and 80),
 endereco text not null check(length(trim(endereco)) between 1 and 350),
 complemento text not null default '' check(length(complemento)<=160),
 ativo boolean not null default true, justificativa text not null default '',
 versao int not null default 1, atualizado_por uuid not null default auth.uid(),
 criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);
create unique index imovel_ubs_local on public.imoveis_ubs(unidade,lower(trim(microarea)),lower(trim(endereco)),lower(trim(complemento))) where ativo;
alter table public.imoveis_ubs enable row level security;
revoke all on public.imoveis_ubs from public,anon,authenticated;
grant select,insert(id,unidade,microarea,endereco,complemento),update(ativo,justificativa) on public.imoveis_ubs to authenticated;
create policy imoveis_equipe on public.imoveis_ubs for all to authenticated
 using(esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico')))
 with check(esf_access.pode_unidade(unidade) and (select public.usuario_tem_permissao('ver_historico')));
create function esf_access.imovel_revisar() returns trigger language plpgsql set search_path='' as $$
begin
 if old.ativo=new.ativo or length(trim(new.justificativa)) not between 1 and 500 then raise exception 'Revise a situação e informe o motivo';end if;
 new.versao=old.versao+1;new.atualizado_por=auth.uid();new.atualizado_em=now();return new;
end $$;
revoke all on function esf_access.imovel_revisar() from public,anon,authenticated;
create trigger imovel_revisar before update on public.imoveis_ubs for each row execute function esf_access.imovel_revisar();
notify pgrst,'reload schema';
