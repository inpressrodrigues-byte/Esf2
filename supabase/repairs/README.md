# Recusa de permissão da IA

O erro `IA_NOT_ALLOWED` é emitido depois da validação da sessão e da leitura do perfil. O servidor exige `public.perfis.permissoes.usar_ia_soap = true` ou `ver_admin = true`, como booleanos JSON. Não resolve desativar autenticação ou colocar a chave Gemini no navegador.

O painel legado concede privilégios locais ao e-mail do proprietário sem consultar o perfil. A correção do cliente passa a consultar o perfil também para essa conta e usa a regra do servidor para IA. As outras funções legadas do painel não são alteradas por este reparo. O servidor continua sendo responsável pela autorização.

## Correção pontual no banco

`autorizar-ia-proprietario.sql` habilita somente `usar_ia_soap` na conta confirmada `inpress.rodrigues@gmail.com`, já identificada como proprietária no código. Preserva todas as outras permissões e todos os demais usuários. Quando falta o perfil dessa conta existente, cria o perfil com os padrões normais da tabela e habilita a IA. Não cria login nem concede administração. Duplicidade e JSON malformado interrompem a transação.

Aplicar apenas no projeto `mcmletzjgykhwknshacg`, usando a conexão administrativa legítima do Supabase. Esta é uma operação de reparo específica desse projeto, não uma migração automática para todas as instalações.

Com a CLI oficial atual autenticada, a execução direta a partir da raiz deste repositório é:

```powershell
npx.cmd --yes supabase@2 db query --linked --project-ref mcmletzjgykhwknshacg --file supabase/repairs/autorizar-ia-proprietario.sql
```

Se a ferramenta informar ausência de token, o proprietário precisa conectar a conta com `npx.cmd --yes supabase@2 login` no Windows. A credencial deve ser fornecida somente ao fluxo oficial, nunca publicada no repositório ou nesta conversa. A consulta usa a Management API, sem exigir uma senha de banco no código.

Após a execução, a consulta final deve retornar uma linha com `ia_soap_autorizada = true`. Entrar novamente no programa para recarregar as permissões e usar **Testar conexão**, que envia exclusivamente o exemplo fictício. Só publicar o cliente após esse teste real passar. Remover a origem temporária após conferir produção.

## Validação disponível

`npm test` executa o SQL de verdade em PostgreSQL isolado via PGlite, com esquema mínimo e contas fictícias. Cobre concessão restrita, repetição, preservação de permissões, tipos JSON/JSONB, perfil ausente/duplicado e conta não confirmada. Um teste integrado mostra a transição de 403 para 200 no handler existente, usando o banco isolado e provedor Gemini simulado. `npm run test:browser` exercita os fluxos do cliente com rede externa bloqueada.

Esses testes isolados não certificam a estrutura completa nem todas as políticas de produção. Em 08/09/2026, a consulta administrativa confirmou uma conta proprietária confirmada e zero perfis correspondentes. O reparo foi aplicado e a nova consulta confirmou um perfil com `usar_ia_soap = true`, `ver_admin = false` e RLS habilitada.

O teste autenticado real passou às 20:20 UTC de 08/09/2026: conta técnica temporária criada via Auth Admin, login por senha, recusa 403 antes da permissão e geração Gemini 2.5 Flash com HTTP 200 após habilitar IA. O botão do cliente testado foi executado em navegador headless com origem de produção; autenticação, CORS, cota e provedor foram reais. A página de teste usou o código local candidato à publicação, sem controlar o navegador do usuário. Somente o exemplo fictício do servidor foi enviado. Identificador da geração: `c30be694-90d9-4aa0-94c4-34c0a1d5fd63`; duração 3.616 ms. Conta e perfil técnicos foram removidos e a remoção foi conferida.
