# ESF2 — correções e testes

**Versão para homologação. Produção ainda não liberada.**

Foram implementadas correções para os problemas reproduzidos na auditoria. Os 30 achados estão rastreados abaixo; cinco têm mitigação com alcance explicitamente limitado. Os demais foram corrigidos nos cenários locais testados. Nenhuma alteração foi aplicada ao banco nem à função de IA em produção.

Base: `e094e6b41f8ce7b9bd0cc98597a36d147e790a8a`. Branch: `fix/auditoria-integral-2026-09`.

## Resultado observado

| Verificação | Resultado |
|---|---|
| Regras, segurança do servidor preparado, PDF SINAN e integridade dos scripts | 20/20 testes aprovados |
| Fluxos no navegador | 29/29 grupos aprovados |
| Telas abertas | 24; sem IDs duplicados e sem controles visíveis sem nome acessível |
| Demanda municipal | 33 temas, 35 tabelas, 140 seleções de critérios testadas |
| Layout móvel | 390 e 768 px sem rolagem horizontal da página; menu e ações acessíveis |
| Erros JavaScript em execução | 0 nos percursos testados |
| Fontes oficiais | 66/66 PDFs conferidos ao vivo; nenhum arquivo diferente ou indisponível |
| Ficha de sífilis em gestante | PDF real de 2 páginas, preenchimento fictício e inspeção visual |

Testes executados no Windows, com Node e Edge sem interface visível. O navegador usa dados fictícios, simula os serviços e bloqueia conexões externas. Os 29 grupos contêm múltiplas verificações; não são uma medida percentual de cobertura do código. O fluxo de CI adicionado ao GitHub só poderá ser considerado aprovado após sua execução.

## Rastreabilidade dos 30 achados

| Nº | Achado | Situação | Correção e limite |
|---|---|---|---|
| 01 | O SOAP registra 14 sintomas que não foram marcados | Corrigido nos cenários testados | O SOAP considera somente as marcações selecionadas e preserva sintomas positivos em orações separadas de negações. |
| 02 | Exames anormais e suas condutas desaparecem ao gerar o SOAP | Corrigido nos cenários testados | Achados laboratoriais, riscos e próximos passos chegam às seções O, A e P. Resultado compatível com DMG impede repetir automaticamente o rastreio de rotina. |
| 03 | A cor da demanda espontânea ignora sinais vitais numéricos | Corrigido nos cenários testados | Os motores de triagem compartilham a mesma regra para PA, SpO₂ e glicemia. Limites sem solução explícita no documento exigem avaliação profissional. |
| 04 | Negações e sintomas inespecíficos acionam a conduta errada | Corrigido nos cenários testados | Negações deixam de acionar infecções e riscos inexistentes; diagnóstico de IST informado prevalece sobre queixa inespecífica. Texto livre continua exigindo conferência. |
| 05 | As regras de tireoide divergem dos fluxogramas municipais de 2024 | Corrigido nos cenários testados | Tireoide usa os ramos municipais por TSH, T4 livre, unidade e idade gestacional; dose por peso quando indicada. Sobreposições e lacunas do desenho não recebem uma prescrição inventada. |
| 06 | Hb exatamente 11 recebe classificação de anemia e conduta de tratamento | Corrigido nos cenários testados | Hb de 11 g/dL não recebe anemia pelo limiar do fluxo. Tratamento, gravidade e critérios regionais de agendamento ficam explícitos e usam função compartilhada. |
| 07 | “Não reagente” com acento é sinalizado como crítico | Corrigido nos cenários testados | Resultados negativos, com ou sem acento, deixam de ser críticos ou de acionar condutas de infecção; conferido também no leitor de laudos livres. |
| 08 | O validador transforma 100.0 em 1000 | Corrigido nos cenários testados | Decimais preservam a magnitude; 100.0 não vira 1000 nos validadores. |
| 09 | Número de partos é aceito como se fosse uma conduta registrada | Corrigido nos cenários testados | Campo de partos não é aceito como plano terapêutico. Finalização exige identificação, revisão do plano e resolução ou justificativa específica dos erros. |
| 10 | Avaliações vazias geram baixo risco e atos descritos como realizados | Corrigido nos cenários testados | Escalas incompletas e ausência de avaliação não certificam baixo risco. Orientações automáticas são apresentadas como propostas a revisar nos fluxos corrigidos. |
| 11 | Indicação de profilaxia exibida no risco não chega ao plano do SOAP | Corrigido nos cenários testados | A indicação de prevenção de pré-eclâmpsia por um fator alto ou dois moderados chega ao plano. Foram incluídos fatores familiar, autoimune e história obstétrica relevante. |
| 12 | O preparo de SINAN para gestante usa agravo e datas inadequados | Corrigido nos cenários testados | Sífilis em gestante ganhou o modelo municipal específico, com trimestre e data de diagnóstico separados da DUM/início de sintomas. Duas páginas preenchidas com dados fictícios foram verificadas visualmente. |
| 13 | Campos duplicados fazem leituras recuperarem a ocorrência errada | Corrigido nos cenários testados | IDs duplicados eliminados. Nas 24 telas abertas durante o teste não houve duplicatas nem controles visíveis sem nome acessível. |
| 14 | O modo de auditoria da demanda entra em recursão | Corrigido nos cenários testados | Modo de auditoria da demanda utiliza o motor compartilhado sem chamada recursiva. |
| 15 | A cor muda, mas a justificativa automática conserva o caso anterior | Corrigido nos cenários testados | A justificativa automática é recalculada junto com a cor quando o caso muda. |
| 16 | Os controles chamados de bloqueio são apenas avisos | Corrigido nos cenários testados | Salvar e copiar passam pela revisão central. Resposta bloqueada da IA não pode ser aplicada; a comparação não oferece cópia que contorne essa revisão. |
| 17 | Não há atualização automática comprovada dos protocolos municipais | Mitigado; alcance limitado | Catálogo com 66 PDFs, URLs, páginas, hashes e data de conferência; verificador detecta mudanças e links adicionados/removidos. A atualização de conteúdo clínico precisa de revisão humana e não está agendada automaticamente. |
| 18 | A demanda tem oito cartões específicos para 33 temas principais | Mitigado; alcance limitado | Os 33 temas da demanda estão representados em 35 tabelas de critérios, considerando variantes de herpes. Foram testadas 140 seleções. Isso não equivale a automatizar todas as prescrições do manual ou de todos os PDFs. |
| 19 | Falha de gravação apaga a fila de sincronização | Corrigido nos cenários testados | Falha de gravação mantém o item pendente; só o conteúdo efetivamente enviado e confirmado é retirado da fila. Edição durante o envio permanece pendente. |
| 20 | Cadastros e rascunhos locais não são isolados por usuário | Corrigido nos cenários testados | Pacientes, atendimentos, rascunhos e dados locais sensíveis usam chave vinculada ao usuário. Respostas tardias de outra sessão são descartadas. O isolamento no banco ainda depende de testar as políticas reais. |
| 21 | A sessão offline não expira e o bloqueio por inatividade não fecha a tela | Corrigido nos cenários testados | Acesso offline exige cache recente e compatível com a sessão; inatividade bloqueia a tela e limpa o contexto mesmo sem conexão ao Supabase. Ações administrativas e IA não ficam liberadas pelo cache. |
| 22 | O preparo dos dados para IA conserva nome e texto clínico identificável | Mitigado; alcance limitado | Envio de IA exige sessão e prévia editável; retira identificadores conhecidos e transmite somente o SOAP revisado. Foi preparado um servidor com autorização e cota, ainda sem instalação ou teste real. Texto livre não tem anonimização garantida. |
| 23 | Uma data preenchida impede a restauração do rascunho | Corrigido nos cenários testados | A data padrão não impede restaurar rascunhos. Marcações e seleções são preservadas, e alterações exigem nova confirmação do plano. |
| 24 | A extração de exames PDF informa sucesso mesmo sem encontrar valores | Corrigido nos cenários testados | PDF sem texto/valores, múltiplos resultados ou unidade incompatível não substitui exames. Importação obstétrica e pediátrica exige conferência; laudo livre exige revisão antes da interpretação. |
| 25 | Datas e idade gestacional não usam sempre o contexto da consulta | Corrigido nos cenários testados | Datas usam o horário local e a idade gestacional considera a data da consulta, inclusive registros retrospectivos. |
| 26 | Faltam associações de rótulos e acesso por teclado às abas | Corrigido nos cenários testados | Rótulos associados aos campos, nomes acessíveis e abas operáveis por setas. A verificação não substitui ensaio completo com leitor de tela e usuários. |
| 27 | O celular perde espaço útil e esconde parte das ações | Corrigido nos cenários testados | Menu móvel e ações principais permanecem acessíveis. Larguras 390 e 768 foram testadas sem rolagem horizontal da página. |
| 28 | Avisos concorrentes e muitas ações enfraquecem a clareza da tela | Mitigado; alcance limitado | Validação foi concentrada em um painel e ações secundárias foram agrupadas. Telas extensas, especialmente visita domiciliar, ainda precisam de teste de usabilidade com profissionais. |
| 29 | A arquitetura e os testes internos não sustentam a complexidade clínica atual | Mitigado; alcance limitado | Código do HTML foi separado em seis arquivos de aplicação, estilos e módulos de regras/fontes/revisão; testes reproduzíveis e fluxo de integração contínua foram adicionados. Ainda existe código legado extenso, sem cobertura exaustiva. |
| 30 | O validador trata nomes de campos vazios como achados clínicos | Corrigido nos cenários testados | O validador lê valores e seleções efetivos. Nomes de campos vazios não se tornam achados clínicos nem sinais de urgência. |

## Proteções adicionais encontradas durante a correção

- Importação pediátrica passou a usar a mesma conferência do pré-natal; unidades incompatíveis e mais de um resultado para o mesmo exame exigem transcrição manual.
- Hemoglobina glicada não aciona o tratamento de anemia no laudo livre; resultados negativos não geram recomendação de tratar infecção.
- Resposta bloqueada da IA permanece indisponível para aplicação; pendências ficam visíveis e a cópia passa pelo fluxo de revisão do prontuário.
- Leitores PDF desativam a opção associada à execução de código no aviso de segurança da Mozilla.

## Como reproduzir

Requer Node 22 ou mais recente. No diretório do projeto: `npm ci --ignore-scripts`, `npm test`, `npm run test:browser` e `npm run check:protocols -- --offline`. No Windows, o teste do navegador usa Edge. Em outro ambiente, instalar o Chromium do Playwright e definir `ESF_BROWSER_CHANNEL=chromium`. `npm run check:protocols` faz a conferência online das fontes, sem alterar regras clínicas. Evidências do navegador e dos PDFs são geradas em `test-results/`.

O código do servidor preparado está em `supabase/`; suas instruções de instalação e seus limites estão no README dessa pasta. Os arquivos antigos AUDITORIA, CORRECOES e PROGRESSO são registros históricos e não substituem este resultado.

## Pendências que impedem a liberação em produção

1. **Ambiente publicado:** não foi informado o endereço do programa em uso. Falta testar login, permissões, gravação/leitura, sincronização e recuperação de sessão nesse ambiente, com contas e pacientes fictícios.
2. **Supabase existente:** não estão disponíveis o código da função publicada, o esquema completo e as políticas reais de acesso às tabelas. Testes locais simulam os serviços; não demonstram isolamento no banco. O SQL de leitura e a nova função de IA foram preparados, sem execução da migração nem implantação.
3. **Homologação clínica:** a equipe responsável precisa aprovar cada regra automatizada e decidir os limites sobrepostos/lacunas dos documentos. Inventariar 66 PDFs e testar regressões não certifica 100% das 1.667 páginas, todas as condutas ou todas as combinações clínicas.
4. **Migração e uso real:** dados locais antigos, sem vínculo ao usuário, são preservados e não importados automaticamente para uma conta. Planejar a migração autorizada e testar formulários extensos com profissionais, dispositivos e navegadores do serviço.

PDF.js 2.16.105 permanece na integração legada com `isEvalSupported:false` em todos os leitores, a mitigação publicada pela Mozilla para CVE-2024-4367. A migração para uma versão suportada continua necessária na manutenção das dependências; esta entrega não declara ausência de outras vulnerabilidades. Os testes de importação simulam a extração de texto, enquanto a geração da ficha SINAN usa a biblioteca e o modelo PDF reais.

## Fontes e interpretação da atualização

O [portal oficial fornecido](https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude) foi a referência municipal. A conferência ao vivo de 07/09/2026 encontrou 66 arquivos com o mesmo hash, zero alterações, zero indisponibilidades e nenhum link adicionado/removido em relação ao inventário. Há 68 URLs por causa de dois arquivos duplicados.

O programa contém regras implementadas em código e acesso às referências. Ele **não extrai nem homologa automaticamente todas as condutas dos PDFs**. O verificador identifica mudança da fonte; uma alteração precisa ser revisada, codificada e testada antes de entrar no atendimento. “Inventariado” não significa “vigente” ou “validado clinicamente”.

Referências técnicas: [mitigação oficial PDF.js](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq), [autenticação Supabase](https://supabase.com/docs/guides/functions/auth), [validação do usuário](https://supabase.com/docs/reference/javascript/auth-getuser), [API de IA](https://developers.openai.com/api/reference/resources/chat), [tratamento de dados de IA](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint).
