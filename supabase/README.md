# Integração Gemini do ESF2

A função `clever-processor` recebe a sessão Supabase do usuário. A chave Gemini permanece no servidor.

- Endpoint: `https://mcmletzjgykhwknshacg.supabase.co/functions/v1/clever-processor`.
- Segredo necessário: `GEMINI_API_KEY`; modelo padrão `gemini-2.5-flash`.
- Origem padrão permitida: `https://esf2.vercel.app`.
- A função valida a sessão em `/auth/v1/user` e a permissão `usar_ia_soap` ou `ver_admin` no perfil do próprio usuário.
- A migração `migrations/202609070001_ia_quota.sql` instala o limite de 30 solicitações por hora por usuário. A tabela contém somente identificador, horário e contador.
- `node scripts/build-gemini-function.cjs` gera o arquivo único para o editor de funções do Supabase.
- O teste de conexão utiliza exclusivamente o exemplo fictício definido no servidor.

Em 08/09/2026 UTC, a função de versão 2 já estava publicada no projeto. A consulta de estrutura confirmou a ausência da cota, que foi instalada pelo editor SQL com resultado de sucesso. O cliente antigo continuava enviando pedidos sem sessão, recusados com 401.

Esta atualização corrige somente a integração da API. As alterações de protocolos, regras clínicas, documentos e aparência da auditoria ampla estão no PR #2 e não fazem parte desta publicação.

Validação antes da publicação: 14 testes de servidor/transporte e 10 grupos de navegador com dados fictícios e serviços simulados. O teste autenticado no serviço real deve ser registrado após a publicação do cliente compatível. Não houve acesso a prontuários para estes testes.
