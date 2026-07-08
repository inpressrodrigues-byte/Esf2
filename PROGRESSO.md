# PROGRESSO — Correções da Auditoria (branch `correcoes-auditoria`)

Documento vivo. Atualizado a cada grupo de correção. Serve de ponto de retomada.

## Como retomar esta tarefa
1. `cd /Users/joaocris/Desktop/Esf2 && git checkout correcoes-auditoria`
2. `git log --oneline` mostra o que já foi feito (cada commit = 1 grupo).
3. Esta tabela mostra o status de cada fase. Continue do primeiro item PENDENTE.
4. Subir servidor: `python3 -m http.server 8000` (testar via http://localhost:8000, nunca file://).
5. Harness de verificação (no scratchpad da sessão original; recriar se necessário a partir das descrições abaixo):
   - `node check-syntax.js index.html` → sintaxe de todos os `<script>` (baseline: 11 blocos, 0 falhas).
   - `node console-check.js "http://localhost:8000/index.html" 7` → erros de runtime via Chrome headless (baseline: console LIMPO, DOM boota).
6. Regra de ouro: nunca `main`, nunca `push`, nunca deploy. Comportamento clínico preservado.

## Baseline (commit inicial 8fc5f69)
- index.html: 4.869.545 bytes (4,64 MB), 13.184 linhas.
- Sintaxe: 11 blocos com corpo, 0 falhas.
- Runtime: console limpo, DOM boota (auth-screen presente).

## Status das fases

| Fase | Descrição | Status |
|---|---|---|
| Infra | Branch + baseline + harness + PROGRESSO.md | FEITO |
| 1 | Bugs P0/P1 (18 itens da seção 3) | FEITO (16/18; bug 12→Fase 3, bug 15→Fase 4) |
| 2 | Performance: externalizar blobs + runtime | FEITO (4.65MB→2.19MB; runtime perf feito) |
| 3 | Faxina de código morto | FEITO (só CSS mortas deferidas, ~500 linhas + 883KB removidos) |
| 4 | Estrutura para escala (seção 5) | PENDENTE (mais arriscada — fazer com contexto fresco) |
| 5 | UX (seção 8) | PARCIAL (contraste, erros PT-BR, inputmode, label for, EMOJIS->SVG) |
| Final | CORRECOES.md (relatório item-a-item) | FEITO (parcial — reflete o estado atual) |

### Estado do index.html: 4.65 MB (baseline) -> 1.36 MB (atual). Meta <1.6MB ATINGIDA.

### Fase 2 — feito
- [x] pdf-lib -> vendor/pdf-lib.min.js (defer)
- [x] blobs de dados vivos -> assets/modelos.js (defer): ERSM, IVCF, SINAN específicos, LAUDO família/brasão
- [x] preconnect fonts
- [x] dadosGestao/consultasDoPaciente: parâmetro ats (fim do reparse O(P×A))
- [x] debounce 350ms em ba-busca / terr-busca
- [ ] (menor) memoizar as 3 chamadas de dadosGestao por render em renderIndicadores/Territorio — NÃO feito (risco baixo, ganho menor)

### Fase 3 — feito / pendente
- [x] _FICHA_PDF_B64 (685KB, morto) removido
- [x] Calibrador manual da Ficha Rosa (163 linhas: 19 fns + consts + FICHA_ROSA_MODELO_DATA_URL 154KB + listener pointerdown) removido -> resolve bug 12
- [ ] VD 1.0 (10 fns mortas em ~11453-11609) — ARMADILHA: nomes idênticos às vivas da VD 2.0 (redeclaração; a 2ª vence) + 7 fns VIVAS intercaladas (escalasVDHtml, campoDispVD, coletarMarcadosVD, resumoDispositivosVD, calcularEscalasVD, textoSoapAnonimizadoVD, copiarSoapAnonimizadoVD, gerarPDFVisitaDomiciliar). Remover só a 1ª ocorrência de cada morta, preservando as vivas intercaladas. NÃO é range contíguo.
- [ ] Cadeia SINAN antiga: gerarFichaSinan + sinanObterModelo + SINAN_MODELO_KEY/URL + blob SINAN_MODELO_OFICIAL_BASE64 (44KB, ~linha 4000). ARMADILHA: "gerarFichaSinan"/"sinanObterModelo" casam por substring com as VIVAS gerarFichaSinanEspecifica/sinanObterModeloEspecifico. Usar \b e conferir cada ocorrência.
- [ ] sinanAbrirFichaOficial (1 ocorrência = morta)
- [ ] IA-SOAP paralela morta: chamarAISoap, payloadAISoap, headersAISoap, aplicarRespostaAISoap, substituirSOAPAtual, copiarSomenteSoap/ComPendencias/ComSae, sugerirSAEAutomatico, chavePareceOpenAI
- [ ] Bloco B mortas: bloqueiosSoap, categorizarSubjetivo/Objetivo/Avaliacao/PlanoSoap (4), gerarSoapCurto/Completo/ComSae, gerarPendenciasPorModulo, exportProto, importProto, resetProto
- [ ] Bloco A: imcCrianca, resumoExamesLivres; planoExamesLivresSoap (conferir vs resumoExamesSoapEstruturado antes)
- [ ] Bloco E: sentence, reagent, isFilled
- [ ] Cadastro público morto: authShowRegister + #auth-register-view (HTML) + authRegister + authShowLogin; adminCriarTrial
- [ ] CSS morto (seção 4 da auditoria) + bloco Ficha Rosa duplicado no CSS
- Protocolo: para CADA remoção, `grep -c "\bNOME\b"` e confirmar que só há a própria definição (ou refs no bloco que sai junto). Verificar sintaxe + console após cada grupo.

### Fase 4 (PENDENTE — a mais delicada, contexto fresco)
Inclui bug 15 (padronizar IDs SOAP divergentes pna-soap-p/sm-a). Ver seção 5 do AUDITORIA.md e passos (a)-(j) do PROMPT-CORRECAO.md. Preservar texto clínico (diff das strings geradas antes/depois).

### Fase 5 (PENDENTE)
UX: obrigatoriedade nome/CPF, inputmode/tel, label for, recuperação de senha, erros PT-BR, contraste --tx3, emojis->dots, poda de atendimentos, etc. Ver seção 8.

### Harness de verificação (no scratchpad da sessão; recriar se preciso)
- check-syntax.js: extrai <script> e roda node --check. Baseline: 7 blocos (após externalização), 0 falhas.
- console-check.js: Chrome headless via CDP, captura erros de console. Baseline: LIMPO.
- offline-test.js / globals-test.js: testes CDP pontuais (modo offline, globais defer).

## Detalhe por item
(preenchido conforme execução — FEITO/PARCIAL/PENDENTE + commit + evidência)

### Fase 1 — Bugs (commits fix(fase1))
- [x] Bug 1 — contaminação de prontuário: resetMapasAnatomicos() no go('preventivo')
- [x] Bug 2 — VD adicionado em CAMPOS_PACIENTE
- [x] Bug 3 — window.prepararSinanSifilis exposto para a IIFE de auditoria
- [x] Bug 4 — profilaxia pré-eclâmpsia reincorporada em gerarSoapPN (só pna)
- [x] Bug 5 — idadeSM usa T00:00:00; varredura confirmou ser o único da classe
- [x] Bug 6 — salvarEdicao só redistribui S/O/A/P se contagem bate; senão avisa
- [x] Bug 7 — MODO OFFLINE com sessão em cache (verificado via CDP)
- [x] Bug 8 — @media print zera padding-left + esconde barras fixas
- [x] Bug 9 — fetchComTimeout na IA viva + payload de teste alinhado ao real
- [x] Bug 10 — pós-navegação centralizada em go(); abrirModulo só resolve botão
- [x] Bug 11 — lerPA única (regex \D+) na posição inicial (harness pegou regressão)
- [ ] Bug 12 — foto Ficha Rosa: código órfão, será removido na FASE 3
- [x] Bug 13 — imagem anatômica local (img/) com fallback NCBI
- [x] Bug 14 — baixarAtendimentosNuvem 1x (removida a de carregarPermissoesUsuario)
- [ ] Bug 15 — IDs SOAP divergentes: será padronizado na FASE 4 (estrutural)
- [x] Bug 16 — callAIExames usa pref nos ids
- [x] Bug 17 — reforcarCamposClinicos documentado (substituição intencional)
- [x] Bug 18 — trialInterval limpo no logout

### Assets criados
- img/anatomia-vulva-vagina.jpg (258KB, do NCI) — bug 13

(Fases 2-5 detalhadas quando iniciadas.)
