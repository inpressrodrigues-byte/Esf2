# Função Gemini para homologação

A integração do ESF publicado usa **clever-processor / Gemini 2.5 Flash**. O código informado pelo mantenedor foi analisado e recebeu uma implementação com sessão, permissão, cota, prazos e erros identificáveis.

Siga [o diagnóstico e a instalação](../DIAGNOSTICO-API-2026-09.md). A função corrigida e a migração **não foram implantadas**. O cliente corrigido deve ser homologado junto com o servidor.

Arquivos de execução: `functions/clever-processor/index.ts`, `handler.mjs`, `prompt.mjs`; cota: `migrations/202609070001_ia_quota.sql`. Para gerar um arquivo único para o editor do painel, execute `node scripts/build-gemini-function.cjs`, a partir da raiz do projeto.

O diretório `functions/gerar-soap` conserva a proposta alternativa anterior para OpenAI. A configuração Gemini descrita aqui usa `clever-processor` e `GEMINI_API_KEY`.

O SQL `auditoria-somente-leitura.sql` consulta políticas e permissões sem ler pacientes. Sua execução e a auditoria das políticas reais continuam pendentes. Remover identificadores conhecidos no cliente não garante anonimização de texto livre; a prévia exige conferência profissional.
