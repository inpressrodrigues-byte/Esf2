-- Correção pontual do ESF2 (projeto mcmletzjgykhwknshacg).
-- Executar com acesso administrativo ao banco, após conferir a conta abaixo.
-- Autoriza somente IA SOAP para a conta confirmada do proprietário já previsto no código.
-- Se o perfil estiver ausente, cria o perfil normal usando os padrões da tabela.
-- Não cria conta de login, administrador, política de acesso nem altera dados clínicos.
-- Recusa conta não confirmada, perfil duplicado ou permissões malformadas.
begin;

do $repair$
declare
  alvo uuid;
  permissoes_anteriores jsonb;
  quantidade integer;
begin
  select count(*) into quantidade from auth.users
  where lower(email) = 'inpress.rodrigues@gmail.com' and email_confirmed_at is not null;
  if quantidade <> 1 then
    raise exception 'Correção não aplicada: é necessária exatamente uma conta confirmada do proprietário.';
  end if;

  select id into strict alvo from auth.users
  where lower(email) = 'inpress.rodrigues@gmail.com' and email_confirmed_at is not null
  for update;

  -- A conta pode ter sido criada antes da tabela de perfis. Usa os padrões normais,
  -- sem copiar privilégios de metadados do usuário nem de permissões locais do site.
  insert into public.perfis (user_id,email)
  select u.id,u.email from auth.users u
  where u.id=alvo and not exists (select 1 from public.perfis p where p.user_id=alvo);

  -- INTO STRICT recusa múltiplos perfis e desfaz toda a transação.
  select permissoes::jsonb into strict permissoes_anteriores
  from public.perfis where user_id = alvo for update;
  permissoes_anteriores := coalesce(permissoes_anteriores, '{}'::jsonb);
  if jsonb_typeof(permissoes_anteriores) <> 'object' then
    raise exception 'Correção não aplicada: permissões do perfil precisam ser um objeto JSON.';
  end if;

  update public.perfis
  set permissoes = jsonb_set(permissoes_anteriores, '{usar_ia_soap}', 'true'::jsonb)
  where user_id = alvo;
  get diagnostics quantidade = row_count;
  if quantidade <> 1 then
    raise exception 'Correção não aplicada: quantidade de perfis inesperada.';
  end if;
end
$repair$;

-- Confirma somente o resultado da permissão, sem retornar dados de pacientes.
select (p.permissoes::jsonb -> 'usar_ia_soap') = 'true'::jsonb as ia_soap_autorizada
from public.perfis p join auth.users u on u.id = p.user_id
where lower(u.email) = 'inpress.rodrigues@gmail.com' and u.email_confirmed_at is not null;

commit;
