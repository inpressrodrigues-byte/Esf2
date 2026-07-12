# CORRECOES — Execução da Auditoria (branch `correcoes-auditoria`)

Estado: **Fases 1, 2, 3, 5 concluídas. Fase 4: consolidações seguras feitas; refactors de texto clínico DEFERIDOS de propósito (segurança).** 26 commits, cada grupo verificado por sintaxe + console headless real (P0 e itens sensíveis por CDP). Nenhum push, nenhum deploy, `main` intocado.

## Métricas antes/depois
| Métrica | Baseline | Atual |
|---|---|---|
| index.html | 4,65 MB / 13.184 linhas | **1,29 MB / 12.952 linhas** (−72%) |
| Blobs base64 no HTML | ~3,34 MB inline | externalizados (defer) / ~883KB mortos removidos |
| Arquivos novos | — | vendor/pdf-lib.min.js (513KB), assets/modelos.js (2MB), img/anatomia-vulva-vagina.jpg (258KB) |
| Código morto removido | — | ~500 linhas (calibrador, VD 1.0, cadeia SINAN, 26 fns, cadastro, helpers) |
| Sintaxe (node --check) | 11 blocos, 0 falhas | 6 blocos, 0 falhas |
| Console runtime (headless) | limpo | limpo |

## Como foi verificado
Cada grupo passou por: `node --check` de todos os `<script>` + carregamento em Chrome headless (CDP) checando erros de console/exceções. Achados P0 clínicos e o modo offline foram verificados por ground-truth adicional (CDP eval). O verificador headless pegou 1 regressão real durante o trabalho (ReferenceError em lerPA), que foi corrigida antes do commit.

## LIMITE DE VERIFICAÇÃO (ler antes de aprovar)
Não consigo exercitar a **geração de PDF** (laudo TR, ERSM, IVCF-20, SINAN, Ficha Rosa) nem os fluxos autenticados via headless. Confirmei que os modelos (pdf-lib + base64) **carregam** corretamente após o `defer` (PDFLib.PDFDocument ok; ERSM/IVCF strings; SINAN 16 fichas; imagens data-url). Mas **gerar cada PDF de verdade precisa do seu teste em dispositivo real**, logo após revisar. Igual para: login real no Supabase, sync nuvem, IA-SOAP com endpoint real.

## Fase 1 — Bugs (16 de 18; 2 realocados)
| # | Bug | Status | Evidência |
|---|---|---|---|
| 1 | Contaminação de prontuário (mapas anatômicos globais) | FEITO | resetMapasAnatomicos() em go('preventivo'); reusa limpar* |
| 2 | VD ausente em CAMPOS_PACIENTE | FEITO | entrada vd adicionada |
| 3 | prepararSinanSifilis inacessível entre IIFEs | FEITO | window.prepararSinanSifilis exposto |
| 4 | Regressão profilaxia pré-eclâmpsia | FEITO | risco.conduta reincorporado em gerarSoapPN (texto idêntico ao original) |
| 5 | Timezone idadeSM | FEITO | T00:00:00; varredura: era o único da classe |
| 6 | split posicional S/O/A/P em salvarEdicao | FEITO | só redistribui se contagem bate; senão avisa |
| 7 | App travado offline | FEITO | MODO OFFLINE com sessão em cache (verificado CDP) |
| 8 | Impressão margem fantasma | FEITO | @media print zera padding-left |
| 9 | IA-SOAP payload teste != real + fetch sem timeout | FEITO | fetchComTimeout(45s) + payload alinhado |
| 10 | Render duplicado home vs barra | FEITO | pós-navegação centralizada em go() |
| 11 | lerPA sobrescrita cross-módulo | FEITO | lerPA única (regex \D+) na posição inicial |
| 12 | Foto Ficha Rosa estoura localStorage | FEITO (via Fase 3) | código órfão removido junto do calibrador |
| 13 | Imagem NCBI hotlink sem fallback | FEITO | img/ local + onerror -> NCBI |
| 14 | baixarAtendimentosNuvem 2x | FEITO | roda 1x (cobre admin) |
| 15 | IDs SOAP divergentes | PENDENTE (Fase 4) | é rename estrutural (HTML+JS); ver Fase 4 |
| 16 | callAIExames ignora pref | FEITO | ids templados com pref |
| 17 | reforcarCamposClinicos substitui em vez de mesclar | FEITO (documentado) | substituição é intencional; comentado nos 2 pontos |
| 18 | trialInterval vaza no logout | FEITO | clearInterval no branch !session |

## Fase 2 — Performance (FEITO)
- pdf-lib -> vendor/pdf-lib.min.js (defer); blobs vivos -> assets/modelos.js (defer). window.X idêntico, zero reescrita de consumidor. Verificado que todos carregam.
- preconnect para Google Fonts.
- dadosGestao/consultasDoPaciente/renderPacientes: parâmetro `ats` elimina o reparse O(pacientes×atendimentos) do localStorage. Variável morta `ats` agora usada.
- Debounce 350ms em ba-busca e terr-busca.
- Pendência menor: memoizar as 3 chamadas de dadosGestao por render em indicadores/território (ganho menor, deixado para não arriscar).

## Fase 3 — Faxina (CONCLUÍDA, exceto CSS)
FEITO (~500 linhas + 883KB de blobs mortos):
- `_FICHA_PDF_B64` (685KB) e cadeia SINAN antiga com blob `SINAN_MODELO_OFICIAL` (44KB) + `FICHA_ROSA_MODELO_DATA_URL` (154KB).
- Calibrador manual da Ficha Rosa (163 linhas, resolve bug 12).
- VD 1.0 (10 fns redeclaradas, preservando 8 vivas intercaladas + VD 2.0).
- Cadeia SINAN antiga (gerarFichaSinan/sinanObterModelo/sinanAbrirFichaOficial) — preservadas as vivas Especifica/Especifico.
- 26 fns mortas (IA-SOAP paralela, refactor SOAP abandonado, aliases, imcCrianca, adminCriarTrial...).
- Cadastro público morto (auth-register-view + 3 fns), preservando authLogin.
- 3 helpers mortos da IIFE (isFilled/sentence/reagent).
Cada remoção: confirmada sem chamadores externos + sintaxe/console verificados.
DEFERIDO (baixo valor): ~20 classes CSS mortas (badge-*, modal-*, bg-blue/purple, clinical-tabs, ai-soap-pill, admin-chip, lab-high/low/critical, etc. — confirmadas mortas via node; regras agrupadas tornam a remoção fiddly; harmless).

## Fase 4 — Estrutura (consolidações seguras FEITAS; refactors de texto clínico DEFERIDOS)
FEITO (provado sem mudança de output, por CDP):
- Função de escape única: `vacEsc`/`protoEsc` viraram alias de `escTR`. `docCalEsc`/`gestEsc` NÃO unificados (usam `??` em vez de `||` — saída diferente para 0/false/NaN; preservados).
- `paginaDoModulo(prefix)`: 1 helper substitui 4 cópias da ternária + 1 variante (mapeamento idêntico provado nos 13 prefixos + desconhecido).
- Coordenadas ERSM (`sourceYPage1/2`) extraídas para constante única (byte-idênticas).
DEFERIDO DE PROPÓSITO (segurança clínica — NÃO fazer às cegas):
- Unificar pipeline SOAP do Preventivo/Saúde Mental (montarSoapClinico): reescreve a geração inteira da nota de 2 módulos; espaço de entrada grande demais para provar saída byte-idêntica em ambiente headless. Risco de mudança silenciosa de texto clínico.
- Registro canônico de módulos: as ~9 listas têm MEMBROS e SHAPES diferentes (não é dedup, é redesenho); forçar unificação arriscaria mudar quais módulos aparecem onde. O caso concreto do bug (vd faltando) já foi corrigido pontualmente (bug 2).
- Unificar cálculo de idade: as 3 convenções (T00:00:00 / T12:00:00 / UTC) dão resultados diferentes em bordas; unificar MUDA a idade calculada de algum módulo (não é preservável por design).
- Desenhador SINAN único / mapas anatômicos genéricos: refactor de saída em PDF / DOM interativo, inviável provar exaustivamente headless.
- IDs SOAP divergentes (bug 15): renomear é mecânico mas SEM benefício atual (os geradores usam listas de ids explícitas, não convenção — não há automação quebrada hoje) e com risco real. Deixado como está.
- **checkPnaQueixas vs checkPncQueixas**: a auditoria dizia "quase palavra por palavra", mas investigação exaustiva mostrou que **NÃO são duplicatas**: 12/12 textos de conduta divergem, HTML de saída diferente (complaint-protocol vs alert), ordem diferente, fontes diferentes (chips+livre vs checkboxes), itens exclusivos da pnc. Deduplicar seria mais complexo e sem ganho real. Correto NÃO mexer.
Recomendação: se quiser esses refactors no futuro, faça um por um, com teste de diff de texto gerado e validação sua em produção — não em lote cego.

## Fase 5 — UX (COMPLETA no que é seguro/aditivo)
FEITO:
- Contraste --tx3 (WCAG AA); erros de login em PT-BR; inputmode=numeric em CPF/CNS/CEP + type=tel em telefones (gerador + estáticos); 296 labels ligados (for=).
- Emojis -> SVG: 281 emojis pictográficos trocados por ~55 ícones SVG (helper ic() + data-ic hidratado; risco -> .dot .dg/.da/.dr); em texto puro (SOAP/PDF/toast) viraram texto limpo. Verificado: 0 emoji, 125 svg no DOM, 122 data-ic hidratados. (Commit normalizou CRLF->LF; revisar com `git diff -w`.) FALTA sua validação visual do desenho dos ícones em dispositivo real.
- Recuperação de senha ("Esqueci minha senha" -> resetPasswordForEmail, mensagem neutra).
- Botão "Sincronizar agora" (menu do usuário; reusa sync existente, guarda offline).
- Poda não-destrutiva: arquivarAtendimentosAntigos() exporta TUDO e só depois remove >12 meses do localStorage (nuvem permanece); botão no Histórico; aviso 1x/sessão acima de 800.
- Aviso soft (não bloqueia) ao salvar sem nome/CPF, via modal próprio.
DECISÃO SUA (mantida como aviso, não implementei bloqueio): se salvar sem nome/CPF deve ser BLOQUEADO de vez, ou se CPF é sempre exigido (ex.: acolhimento sem identificação). Hoje é só aviso não-bloqueante.

## Recomendação de teste (dispositivo real, antes de merge/deploy)
1. Gerar 1 PDF de CADA tipo: laudo TR, ERSM, IVCF-20, SINAN específico, Ficha Rosa, pacote diabetes (confirma que a externalização defer não quebrou geração).
2. Login real + sync nuvem + IA-SOAP com endpoint real.
3. Bugs P0: atender 2 pacientes seguidos no Preventivo e conferir que achados de mama/colo/vagina NÃO vazam para o 2º; SOAP de gestante de alto risco deve trazer profilaxia AAS+cálcio; idade em Saúde Mental correta na virada de mês.
Fase 4 e o restante da Fase 5 pedem sua decisão (regras/design) + contexto fresco — ver PROGRESSO.md para retomada precisa.
