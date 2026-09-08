# Correção da API Gemini do ESF2

**Código corrigido e testado localmente. Ainda não aplicado ao Supabase ou à versão publicada.**

## O que foi confirmado

- O site `https://esf2.vercel.app` ainda serve a versão anterior à auditoria, correspondente à base `e094e6b`.
- A função `clever-processor` existe. O preflight do navegador retorna HTTP 204 com os cabeçalhos necessários; não foi reproduzida rejeição de CORS.
- O pedido exato do botão de teste publicado ficou sem resposta até ser cancelado aos 30 segundos. O programa apresenta esse cancelamento como falha genérica de comunicação.
- Pedidos fictícios curtos retornaram HTTP 200, SOAP e identificação de Gemini 2.5 Flash: 3,52 s fora do navegador; 2,77 s e 3,70 s no Edge, com o mesmo conteúdo. A comparação entre JSON com escapes e UTF-8 funcionou em ambos; não confirmou defeito de codificação.
- No código da função fornecido pelo mantenedor, a chamada à Gemini não possui prazo máximo, erros são devolvidos com HTTP 200 e `modoTeste` é fixado em `true` para todas as consultas.

**Conclusão:** a falha reproduzida é um estouro do limite de espera do POST, com uma mensagem que confunde timeout com rede/CORS. A chave e a API responderam nos testes curtos. O ponto interno que demora em cada chamada ainda precisa dos logs do servidor; não é possível atribuir toda a demora à Gemini apenas pelo erro do navegador. Foram adicionados registros por etapa e identificador, sem o texto clínico.

## Arquivos para aplicar em homologação

1. **Cliente:** usar a versão atualizada do [PR nº 2](https://github.com/inpressrodrigues-byte/Esf2/pull/2), na branch `fix/auditoria-integral-2026-09`. Ela envia a sessão autenticada e distingue falha, bloqueio clínico, limite de uso e resposta vazia. O site atualmente publicado ainda não tem essas alterações.
2. **Controle de uso:** executar `esf2-limite-ia.sql` no SQL Editor do projeto de homologação. Cria somente metadados de cota, sem alterar tabelas clínicas. A cota é de 30 pedidos por hora por usuário. A migração ainda precisa ser executada e validada no banco; se não estiver instalada, a função retorna `QUOTA_NOT_READY` e não chama a IA.
3. **Função:** em Supabase → Edge Functions → `clever-processor` → Code, substituir o conteúdo pelo arquivo único `clever-processor-corrigida.ts`. Ele já contém prompt e implementação; não precisa copiar imports de arquivos separados.
4. **Configuração:** manter `GEMINI_API_KEY` apenas nos Secrets. A chave existente respondeu aos testes; não foi solicitada nem lida. O modelo padrão continua `gemini-2.5-flash`; `GEMINI_MODEL` permite definir o modelo no servidor. `SUPABASE_URL` e `SUPABASE_ANON_KEY` são variáveis fornecidas pelo Supabase. Manter a verificação de JWT; a função também valida a sessão e consulta a permissão no banco.
5. **Origem e permissão:** `ESF_ALLOWED_ORIGINS` aceita uma lista de endereços exatos separados por vírgula. O padrão é `https://esf2.vercel.app`; adicionar o endereço da homologação/preview quando usado. Na tabela `perfis`, o usuário deve ter `permissoes.usar_ia_soap=true` ou `permissoes.ver_admin=true`, e conseguir ler o próprio perfil sob as políticas de acesso. Não confiar em permissões enviadas no JSON pelo navegador.
6. **Verificação após instalar:** entrar na versão corrigida, manter o endpoint da `clever-processor` e clicar “Testar conexão”. A função usa um exemplo fictício controlado no servidor; o teste deve informar o modelo e tempo, sem mudar qualquer prontuário. Testar também usuário sem permissão, sessão expirada, indisponibilidade e cota antes de liberar.

O cliente e o servidor devem ser atualizados como um conjunto. A página antiga não envia `Authorization` e será recusada pela função protegida. Não resolver esse 401 desligando a autenticação.

## Correções feitas

- A chamada à Gemini, incluindo a leitura da resposta, termina em no máximo 20 segundos e é abortada quando excede esse prazo. Autenticação, permissão, cota e recebimento do corpo têm limites próprios de 5 segundos. O cliente aguarda até 45 segundos para o percurso completo.
- Falhas usam códigos HTTP apropriados: 400 para entrada, 401/403 para sessão/permissão, 429 para limite, 502 para resposta inválida e 504 para timeout. O cliente também reconhece erros da função antiga devolvidos indevidamente com HTTP 200.
- Resposta vazia, interrompida por limite de tokens ou composta apenas por pensamentos internos não é aplicada ao SOAP.
- Modo de teste fica restrito à ação de teste, com dados fictícios fixados no servidor. Consultas normais não recebem essa marca automaticamente.
- A chave Gemini fica no cabeçalho do pedido entre servidores, sem aparecer na URL, no HTML ou nos logs. Os registros mostram apenas identificador, etapa, status, código e duração.
- Sessão e permissão são conferidas no Supabase antes de consumir a cota ou chamar a IA. O cliente recusa enviar o token a outro projeto.
- O prompt de estilo fornecido pelo mantenedor foi preservado, com regra final para não copiar fatos dos exemplos nem converter propostas em atos realizados. Essa alteração não substitui homologação clínica das respostas.

## Testes e limites

**34/34 testes de regras, servidor e integridade; 30/30 grupos no navegador aprovados.** Incluem erros HTTP 200, sessão, permissão, segredo ausente, cota, timeout com cancelamento, resposta truncada/vazia, modo de teste, arquivo único para o painel e preservação do SOAP local.

Os testes da implementação corrigida usam serviços simulados e dados fictícios. A função atual foi chamada apenas com exemplos sintéticos. Não foram acessados prontuários, chaves privadas, logs privados ou políticas do banco. Não houve implantação, migração, merge ou liberação de produção. A lentidão interna do servidor e a instalação real precisam da verificação após implantação descrita acima.

Fontes técnicas: [autenticação de funções Supabase](https://supabase.com/docs/guides/functions/auth), [CORS no Supabase](https://supabase.com/docs/guides/functions/cors) e [API Gemini generateContent](https://ai.google.dev/api/generate-content). Código da função fornecido pelo mantenedor em 07/09/2026.
