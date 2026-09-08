# Recusa de permissão da IA

O erro `IA_NOT_ALLOWED` é emitido depois da validação da sessão e da leitura do perfil. O servidor exige `public.perfis.permissoes.usar_ia_soap = true` ou `ver_admin = true`, como booleanos JSON. Não resolve desativar autenticação ou colocar a chave Gemini no navegador.

O painel legado concede privilégios locais ao e-mail do proprietário sem consultar o perfil. A correção do cliente passa a consultar o perfil também para essa conta e usa a regra do servidor para IA. As outras funções legadas do painel não são alteradas por este reparo. O servidor continua sendo responsável pela autorização.

## Correção pontual no banco

`autorizar-ia-proprietario.sql` habilita somente `usar_ia_soap` na conta confirmada `inpress.rodrigues@gmail.com`, já identificada como proprietária no código. Preserva todas as outras permissões e todos os demais usuários. Não cria perfil nem concede administração. Falta de perfil, duplicidade e JSON malformado interrompem a transação.

Aplicar apenas no projeto `mcmletzjgykhwknshacg`, usando a conexão administrativa legítima do Supabase. Esta é uma operação de reparo específica desse projeto, não uma migração automática para todas as instalações.

Com a CLI oficial atual autenticada, a execução direta a partir da raiz deste repositório é:

```powershell
npx --yes supabase@2 db query --project-ref mcmletzjgykhwknshacg --file supabase/repairs/autorizar-ia-proprietario.sql
```

Se a ferramenta informar ausência de token, o proprietário precisa conectar a conta com `npx --yes supabase@2 login`. A credencial deve ser fornecida somente ao fluxo oficial, nunca publicada no repositório ou nesta conversa. A consulta usa a Management API, sem exigir uma senha de banco no código.

Após a execução, a consulta final deve retornar uma linha com `ia_soap_autorizada = true`. Entrar novamente no programa para recarregar as permissões e usar **Testar conexão**, que envia exclusivamente o exemplo fictício. Só publicar o cliente após esse teste real passar. Remover a origem temporária após conferir produção.

## Validação disponível

`npm test` executa o SQL de verdade em PostgreSQL isolado via PGlite, com esquema mínimo e contas fictícias. Cobre concessão restrita, repetição, preservação de permissões, tipos JSON/JSONB, perfil ausente/duplicado e conta não confirmada. Um teste integrado mostra a transição de 403 para 200 no handler existente, usando o banco isolado e provedor Gemini simulado. `npm run test:browser` exercita os fluxos do cliente com rede externa bloqueada.

Isso não comprova a estrutura completa, as políticas ou o estado do banco de produção. A aplicação remota e a geração real continuam necessárias. A mensagem relatada pelo usuário com identificador `c0630d3c-f10c-472c-92a6-c289a0a0377b` não inclui o código específico da recusa; os logs privados desse pedido ainda não foram consultados.
