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
| 2 | Performance: externalizar 7 blobs + runtime | PENDENTE |
| 3 | Faxina de código morto (seção 4) | PENDENTE |
| 4 | Estrutura para escala (seção 5) | PENDENTE |
| 5 | UX (seção 8) | PENDENTE |
| Final | CORRECOES.md (relatório item-a-item) | PENDENTE |

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
