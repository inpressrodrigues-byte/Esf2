-- A equipe consulta a evolução longitudinal das pessoas vinculadas à sua UBS.
-- As políticas de alteração e exclusão continuam verificando a autoria.
create policy prontuario_equipe_leitura on public.atendimentos
for select to authenticated using (
  (select public.usuario_tem_permissao('ver_historico')) is true
  and esf_access.pode_unidade(unidade)
  and exists (
    select 1 from public.pacientes p
    where p.cpf = atendimentos.paciente_cpf and p.unidade = atendimentos.unidade
  )
);
create index if not exists atendimentos_prontuario_ubs
  on public.atendimentos (unidade, paciente_cpf, data desc, id);
