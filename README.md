# ESF Toledo

Aplicação de apoio à documentação e às consultas de enfermagem, com referências da Secretaria da Saúde de Toledo–PR.

**Esta branch está em homologação; não representa liberação clínica ou de produção.** Consulte [correções e resultados dos testes](VALIDACAO-2026-09.md) para os 30 achados, o alcance das correções e as dependências externas.

## Estrutura

- `index.html`: telas e campos; `assets/app/`: seis partes da aplicação e estilos.
- `assets/clinical-core.js`: regras compartilhadas e testáveis; `assets/protocol-data.js` e `protocols/manifest.json`: fontes e critérios municipais.
- `assets/review-ui.*`, `assets/ai-review.js`: navegação, acessibilidade e conferência.
- `assets/sinan-gestante.js` e `assets/modelos.js`: preenchimento e modelos de documentos.
- `tests/`: regressões com dados fictícios; `.github/workflows/tests.yml`: integração contínua.
- `supabase/`: proposta de servidor IA e consulta de auditoria do banco, ainda não implantadas.

## Testar

Requer Node 22 ou posterior:

```sh
npm ci --ignore-scripts
npm test
npm run test:browser
npm run check:protocols -- --offline
```

O navegador usa Edge no Windows. Para usar Chromium, execute `npx playwright install chromium` e configure `ESF_BROWSER_CHANNEL=chromium`. Todos os pedidos externos do teste de navegador são bloqueados. Os resultados ficam em `test-results/`.

`npm run check:protocols` verifica o portal municipal online. Uma mudança faz a conferência falhar e exige revisão humana; não altera prescrições automaticamente.

Sirva a pasta por HTTP para inspecionar a aplicação. A autenticação/configuração mantida no cliente aponta para o serviço existente; use um projeto de homologação e pessoas fictícias para testar integrações. O pacote não contém credenciais privadas nem um modo de acesso liberado à produção.

Antes de liberar, seguir as pendências em VALIDACAO-2026-09.md e supabase/README.md, incluindo RLS, função realmente publicada, migração de dados locais antigos e homologação clínica. Relatórios anteriores na raiz registram versões históricas.
