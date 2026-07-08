# CORRECOES — Execução da Auditoria (branch `correcoes-auditoria`)

Estado: **Fases 1 e 2 concluídas e verificadas; Fase 3 parcial. Fases 4 e 5 pendentes.**
Nenhum push, nenhum deploy, `main` intocado. Cada grupo tem commit próprio.

## Métricas antes/depois
| Métrica | Baseline | Atual |
|---|---|---|
| index.html | 4,65 MB / 13.184 linhas | **1,36 MB / 13.087 linhas** |
| Blobs base64 no HTML | ~3,34 MB inline | externalizados (defer) / mortos removidos |
| Arquivos novos | — | vendor/pdf-lib.min.js (513KB), assets/modelos.js (2MB), img/anatomia-vulva-vagina.jpg (258KB) |
| Sintaxe (node --check) | 11 blocos, 0 falhas | 7 blocos, 0 falhas |
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

## Fase 3 — Faxina (PARCIAL)
FEITO: `_FICHA_PDF_B64` (685KB morto) + calibrador manual da Ficha Rosa (163 linhas: 19 fns + FICHA_ROSA_MODELO_DATA_URL 154KB + listener global) removidos.
PENDENTE (com armadilhas de nome documentadas em PROGRESSO.md): VD 1.0, cadeia SINAN antiga (+blob 44KB), IA-SOAP paralela morta, mortas dos blocos A/B/E, cadastro público morto, CSS morto.

## Fases 4 e 5 — PENDENTES
- Fase 4 (estrutural, a mais arriscada): registro canônico de módulos, IDs SOAP padronizados (bug 15), pipeline SOAP único, mapas anatômicos genéricos, coords ERSM únicas, escape/idade únicos, dedup checkPnaQueixas/Pnc. Preservar texto clínico.
- Fase 5 (UX): obrigatoriedade nome/CPF, inputmode/tel, label for, recuperação de senha, erros PT-BR, contraste --tx3, emojis->dots, poda de atendimentos, botão sincronizar.

## Recomendação
Testar em dispositivo real, antes de qualquer merge/deploy: gerar 1 PDF de cada tipo, login/sync, e os fluxos dos bugs P0 (especialmente atender 2 pacientes seguidos no Preventivo e conferir que os achados anatômicos não vazam; e o SOAP de gestante de alto risco trazer a profilaxia AAS+cálcio). Fases 4-5 pedem contexto fresco — ver PROGRESSO.md para retomada precisa.
