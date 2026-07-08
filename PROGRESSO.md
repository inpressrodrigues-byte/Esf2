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
| 1 | Bugs P0/P1 (18 itens da seção 3) | PENDENTE |
| 2 | Performance: externalizar 7 blobs + runtime | PENDENTE |
| 3 | Faxina de código morto (seção 4) | PENDENTE |
| 4 | Estrutura para escala (seção 5) | PENDENTE |
| 5 | UX (seção 8) | PENDENTE |
| Final | CORRECOES.md (relatório item-a-item) | PENDENTE |

## Detalhe por item
(preenchido conforme execução — FEITO/PARCIAL/PENDENTE + commit + evidência)

### Fase 1 — Bugs
- [ ] Bug 1 — contaminação de prontuário (mapas anatômicos globais)
- [ ] Bug 2 — VD ausente em CAMPOS_PACIENTE
- [ ] Bug 3 — prepararSinanSifilis inacessível entre IIFEs
- [ ] Bug 4 — regressão profilaxia pré-eclâmpsia
- [ ] Bug 5 — timezone idadeSM + varredura de classe
- [ ] Bug 6 — split posicional S/O/A/P em salvarEdicao
- [ ] Bug 7 — app travado offline (gate de auth)
- [ ] Bug 8 — impressão com margem fantasma
- [ ] Bug 9 — IA-SOAP: payload de teste != real + fetch sem timeout
- [ ] Bug 10 — render duplicado home vs barra
- [ ] Bug 11 — lerPA sobrescrita cross-módulo
- [ ] Bug 12 — foto Ficha Rosa estoura localStorage
- [ ] Bug 13 — imagem NCBI hotlink sem fallback
- [ ] Bug 14 — baixarAtendimentosNuvem 2x
- [ ] Bug 15 — IDs SOAP divergentes
- [ ] Bug 16 — callAIExames ignora parâmetro
- [ ] Bug 17 — reforcarCamposClinicos substitui em vez de mesclar
- [ ] Bug 18 — vazamento de trialInterval no logout

(Fases 2-5 detalhadas quando iniciadas.)
