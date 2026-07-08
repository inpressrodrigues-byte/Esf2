# CORRECOES — Execução da Auditoria (branch `correcoes-auditoria`)

Estado: **Fases 1 e 2 concluídas; Fase 3 concluída (só CSS mortas deferidas); Fase 5 parcial. Fase 4 pendente.**
21 commits, cada grupo verificado. Nenhum push, nenhum deploy, `main` intocado.

## Métricas antes/depois
| Métrica | Baseline | Atual |
|---|---|---|
| index.html | 4,65 MB / 13.184 linhas | **1,28 MB / 12.751 linhas** (−73%) |
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

## Fase 5 — UX (PARCIAL)
FEITO: contraste --tx3 (WCAG AA); erros de login em PT-BR; inputmode=numeric em CPF/CNS/CEP + type=tel em telefones (gerador + estáticos); 296 labels ligados aos campos (for=).
PENDENTE:
- Obrigatoriedade nome/CPF ao salvar — **DECISÃO SUA (regra de negócio)**: bloquear ou avisar? CPF é sempre exigido (ex.: acolhimento sem identificação)? Não implementei para não impor regra.
- Emojis -> SVG: **FEITO** (a seu pedido). 281 emojis pictográficos trocados por ~55 ícones SVG (helper ic() + data-ic hidratado; risco -> .dot .dg/.da/.dr); em texto puro (SOAP/PDF/toast) viraram texto limpo. Verificado: 0 emoji restante, 125 svg no DOM, 122 data-ic hidratados, console limpo. FALTA: sua validação visual do desenho dos ícones em dispositivo real. Obs.: o commit normalizou CRLF->LF; revisar com `git diff -w`.
- Recuperação de senha (resetPasswordForEmail), botão "sincronizar agora", poda/arquivamento de esf_atendimentos_*.

## Fase 4 — Estrutura (PENDENTE — a mais arriscada; contexto fresco)
Registro canônico de módulos, padronizar IDs SOAP (bug 15), unificar pipeline SOAP (preventivo/SM), mapas anatômicos genéricos, coords ERSM únicas, escape/idade únicos, dedup checkPnaQueixas/Pnc. Refactor de geração de SOAP clínico — preservar texto (diff antes/depois). Ver seção 5 do AUDITORIA.md e passos (a)-(j) do PROMPT-CORRECAO.md.

## Recomendação de teste (dispositivo real, antes de merge/deploy)
1. Gerar 1 PDF de CADA tipo: laudo TR, ERSM, IVCF-20, SINAN específico, Ficha Rosa, pacote diabetes (confirma que a externalização defer não quebrou geração).
2. Login real + sync nuvem + IA-SOAP com endpoint real.
3. Bugs P0: atender 2 pacientes seguidos no Preventivo e conferir que achados de mama/colo/vagina NÃO vazam para o 2º; SOAP de gestante de alto risco deve trazer profilaxia AAS+cálcio; idade em Saúde Mental correta na virada de mês.
Fase 4 e o restante da Fase 5 pedem sua decisão (regras/design) + contexto fresco — ver PROGRESSO.md para retomada precisa.
