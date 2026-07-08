# AUDITORIA COMPLETA — Roteiro ESF (Esf2)

Data: 2026-07-06
Alvo: `index.html` (4.869.545 bytes, 13.184 linhas) — main do GitHub = produção (esf2.vercel.app)
Método: 8 agentes de análise em paralelo cobrindo 100% do arquivo por região + verificação ground-truth (grep/awk/node) dos achados críticos.
Escopo: qualidade de código, duplicação, código morto, performance, UX, escala. **Segurança fora do escopo desta auditoria (a pedido).**
Nenhuma linha de código foi alterada — auditoria somente leitura.

---

## 1. VISÃO GERAL DO SISTEMA

SPA monolítico de enfermagem para APS (Toledo-PR): 13 módulos clínicos (pré-natal abertura/consulta, puericultura, preventivo, idoso, saúde mental, consulta geral, acolhimento, hiperdia, feridas, puerpério, IST/TR, visita domiciliar) + SINAN + gestão (busca ativa, indicadores, território, relatórios) + admin + IA-SOAP. Auth e sync via Supabase; dados em localStorage com fila offline. Zero build; deploy automático Vercel a cada push no main.

Mapa do arquivo:

| Região | Linhas | Conteúdo |
|---|---|---|
| Head | 1-67 | Config + 3 blobs (pdf-lib 512KB, ERSM 441KB, IVCF-20 344KB) — **1.3MB bloqueando render** |
| CSS | 68-866 (+2550-2576) | ~890 regras, tokens em `:root`, tema runtime |
| HTML | 868-4020 | Telas estáticas dos 6 módulos antigos + utilitárias |
| JS-A | 4021-6033 | SINAN, navegação, pré-natal, puericultura, motores labLivre/vacinação (+2 blobs: 741KB SINAN, 466KB logo) |
| JS-B | 6034-8187 | Motor SOAP, guia clínico, mapas anatômicos, preventivo, saúde mental, calibradores PDF |
| JS-C | 8188-9850 | Banco de pacientes, gestão ESF, IA-SOAP, sync Supabase, histórico |
| JS-D | 9851-12017 | Auth, admin, Ficha Rosa (+2 blobs: 685KB + 154KB), VD 1.0/2.0, protocolos |
| JS-E | 12018-13184 | PDFs diabetes gestacional + **2 IIFEs de patch** (2026-06-22 e 2026-07-03) que sobrescrevem funções anteriores |

**Composição do payload: 71,85% (3,34MB) são blobs base64; código útil = 1,31MB.**

---

## 2. O QUE ESTÁ BOM (manter e usar como modelo)

1. **Motores `labLivre*` e `vac*`/PNI** (5527-6027): uma implementação parametrizada servindo 12 módulos. É o modelo certo — a refatoração do resto é "fazer o que esses dois já fazem".
2. **Pipeline de qualidade do SOAP** (6470-6980): remove dados de teste, detecta contradições clínicas, gera pendências, isola alertas de gravidade. Raro em sistema desse porte.
3. **Prompts anti-alucinação na IA-SOAP** (8789, 8802): "não invente dados clínicos", "não transforme campo vazio em negação". + sanitização de sugestões para módulos em desenvolvimento (8654).
4. **LGPD embutida no fluxo**: `redigirSensivel()` remove CPF/CNS/telefone antes de enviar à IA (12626); chave de API nunca persiste (12635); SOAP anonimizado na VD (`textoSoapAnonimizadoVD`).
5. **Offline-first coerente na camada de dados**: fila de pendências, sync debounced 900ms, reconciliação ao voltar rede, merge por `id_local`.
6. **Validação real**: CPF com dígito verificador (8679), auto-preenchimento por CPF (8398), SINAN com obrigatoriedade de verdade (4267).
7. **Diagnóstico de rede pensado pra UBS** (9875): testa Supabase+CDN e entrega a lista de domínios pra TI liberar.
8. **Cálculo de IG/DPP via `Date.UTC`** (4945-4977) — evita o bug clássico de fuso (mas não foi padronizado no resto, ver bug 5).
9. **Design tokens reais no CSS** (`:root`, 69-80) usados em massa; tema customizável em runtime com fallbacks; fix de zoom iOS (font-size 16px em inputs mobile).
10. **Compliance clínico**: termo de responsabilidade versionado, trilha de auditoria local (limitada a 1000 itens — bom exemplo), logout por inatividade 15min, protocolos com fonte/URL/data de conferência (12823).
11. **Calibrador `docCal*`** (8042-8145): 1 abstração para 2 documentos — generalização correta.
12. Menu 100% consistente (20 módulos, 1:1 barra/home); checkboxes/radios com labels corretos; datas `type=date` com campos derivados readonly.

---

## 3. BUGS CONFIRMADOS (verificados com ground-truth)

### P0 — risco clínico/integridade de dados

| # | Bug | Linhas | Evidência | Correção |
|---|---|---|---|---|
| 1 | **Contaminação de prontuário entre pacientes**: achados dos mapas anatômicos (mama/colo/vagina) são globais e só zeram com clique manual em "Limpar". Trocar de paciente sem limpar → achados do anterior entram no SOAP do próximo. | 7435-7437, resets só em 7605/7622 | grep: únicas atribuições `=[]` estão nas funções de limpar | Resetar os 3 arrays ao mudar `prev-nome` / reabrir `pg-preventivo` |
| 2 | **VD não alimenta cadastro de pacientes**: `CAMPOS_PACIENTE` tem 12 prefixos, falta `vd`. `salvarCadastroPaciente('vd')` retorna vazio silenciosamente — quebra busca por CPF/território/busca ativa pro módulo mais territorial. | 8219-8232 (uso: 9317) | awk confirmou: `vd:` ausente | 1 linha: adicionar entrada `vd` |
| 3 | **SINAN de sífilis não é preparado no fluxo de validação**: `prepararSinanSifilis` é privada da IIFE-1 (12464); a IIFE-2 chama com guard `typeof` (12966) que resolve `undefined` — nunca executa, sem erro. | 12464 / 12554 / 12966 | grep: 3 ocorrências, definição dentro de IIFE | `window.prepararSinanSifilis=...` no fim da IIFE-1 |
| 4 | **Regressão clínica**: a sobrescrita `gerarSoapPN` (camada patch) perdeu a conduta de profilaxia de pré-eclâmpsia (AAS 100mg + cálcio) que a versão original (7049-7105) incluía no plano pra gestante de risco. Nenhuma validação cobre a ausência. | 12479-12570 vs 7069 | leitura direta: `risco.conduta` nunca lido na nova | Reincorporar `risco.conduta` ao plano |
| 5 | **Timezone em `idadeSM()`**: `new Date('YYYY-MM-DD')` = UTC → no Brasil volta 1 dia (confirmado com Node). Idade/faixa etária pode sair errada na virada de mês/ano. O padrão correto já existe no arquivo (7658). | 7876-7891 | node TZ=America/Sao_Paulo | `new Date(v+'T00:00:00')` |
| 6 | **Edição de SOAP pode desalinhar S/O/A/P**: `salvarEdicao()` redistribui o texto editado por `split(/\n\n+/)` posicional — se o profissional mudar as quebras de parágrafo, campos internos ficam trocados sem aviso e são reinjetados ao reabrir consulta. | 9556-9557 | leitura direta | Editar por 4 campos separados ou validar contagem |

### P1 — funcional/confiabilidade

| # | Bug | Linhas | Correção |
|---|---|---|---|
| 7 | **App 100% travado offline**: se o CDN do supabase-js falhar, `verificarAcesso` nunca roda e a tela de login não sai da frente — mesmo o app sendo majoritariamente client-side. Crítico pra visita domiciliar. | 9855-9862, 9680 | Sessão em cache + vendorizar supabase-js; bloquear só o que precisa de rede |
| 8 | **Impressão com margem fantasma ~236px**: `@media print` esconde a sidebar mas não zera `body{padding-left:var(--sidebar-w)}`. | 337 vs 739 | `body{padding-left:0!important}` no print |
| 9 | **"Testar conexão" da IA-SOAP mente**: payload de teste tem formato diferente do real — teste verde não garante geração funcionando. E `gerarSoapPorIA` usa `fetch` sem timeout (botão pode travar em "IA ajustando..."). | 9104-9133 vs 8855-8858; 9020 | Unificar payload; `fetchComTimeout` |
| 10 | **Render duplicado**: abrir busca-ativa/indicadores/território/relatórios/reportes pela home roda a renderização 2x (setTimeout duplicado em `go()` + `abrirModulo()`). | 4678-4701 | Centralizar pós-navegação em `go()` |
| 11 | **`lerPA` sobrescrita cross-módulo**: definida em 5241 (pré-natal) e redefinida em 11781 (VD) — a do VD vence pra TODO o app. Hoje inócuo (regex superconjunto), mas mudar a "versão PN" não teria efeito. | 5241 vs 11781 | Uma única `lerPA` global |
| 12 | **Foto de fundo da Ficha Rosa pode estourar a cota do localStorage** (5-10MB) e travar o salvamento de atendimentos — data URL crua sem compressão, mitigação é só um alert. | 10503 | Redimensionar via canvas ou IndexedDB |
| 13 | **Mapa anatômico vulva/vagina é imagem hotlinkada do NCBI sem fallback** — se sair do ar, a etapa do exame perde a interface (os outros 2 mapas já são SVG inline). | 2448 | Converter pra SVG inline ou asset local |
| 14 | **`baixarAtendimentosNuvem()` roda 2x** a cada login/refresh de token (via `carregarPermissoesUsuario` + chamada direta). | 9932 / 9955 | Remover uma |
| 15 | **IDs de SOAP divergentes por copy-paste**: `pna-soap-p` (ordem invertida), `sm-a` (sem sufixo) vs padrão `-a-soap`/`-p` dos demais — automação por convenção quebra em 2 dos 6 módulos antigos. | 1339-1340, 3639-3640 | Padronizar nomenclatura |
| 16 | **`callAIExames(pref)` ignora o parâmetro** — IDs hardcoded de `pnc`; armadilha pra reuso. | 5449-5527 | Template-string nos IDs |
| 17 | `reforcarCamposClinicos` **substitui** (não mescla) `CAMPOS_ESSENCIAIS.hip/fer/puerp` — quem lê 8685-8696 vê algo que não roda. | 12946-12953 vs 8685-8696 | Documentar ou mesclar |
| 18 | Vazamento de `trialInterval` no logout manual (timer de 60s roda pra sempre até reload). | 9989-10032 | Limpar no branch `!session` |

---

## 4. CÓDIGO MORTO (todos confirmados com grep = 1 ocorrência)

Total: **~60 funções mortas + ~44KB de blob morto + ~15 classes CSS mortas + ~460 linhas de blocos mortos.**

- **Cadeia SINAN antiga**: `gerarFichaSinan` (4545-4602, e é cópia de `sinanDesenharDadosGerais`), `sinanObterModelo`, `SINAN_MODELO_KEY/URL` + **blob de 44KB na linha 4022** (`SINAN_MODELO_OFICIAL_BASE64`).
- **VD 1.0 inteira** (11462-11608, ~108 linhas): 10 funções redeclaradas pela VD 2.0 (a 2ª declaração vence) — `visitaDomiciliarExtraHtml`, `adicionarMedicamentoVD`, `coletarMedicamentosVD`, `atualizarAlertasMedicamentosVD`, `camposDispositivoVD`, `atualizarDispositivosVD`, `resumoSondaVD`, `classificarRiscoVD`, `gerarSoapVisitaDomiciliar`, `relatorioTextoVisitaDomiciliar`. CUIDADO ao recortar: 7 funções na mesma faixa continuam vivas (`escalasVDHtml`, `campoDispVD`, `coletarMarcadosVD`, `resumoDispositivosVD`, `calcularEscalasVD`, `textoSoapAnonimizadoVD`, `copiarSoapAnonimizadoVD`, `gerarPDFVisitaDomiciliar`).
- **Calibrador manual da Ficha Rosa** (~10429-10530, ~150 linhas, ~18 funções órfãs): alvo `ficha-cal-page` não existe no HTML; stubs confirmam remoção intencional; sobrou até um listener global de `pointerdown` permanente e o upload de imagem de fundo (que é o bug 12).
- **IA-SOAP paralela morta**: `chamarAISoap`, `payloadAISoap`, `headersAISoap`, `aplicarRespostaAISoap`, `substituirSOAPAtual`, `copiarSomenteSoap/ComPendencias/ComSae`, `sugerirSAEAutomatico`, `chavePareceOpenAI`.
- **Bloco B (12)**: `bloqueiosSoap`, `categorizarSubjetivoSoap/ObjetivoSoap/AvaliacaoSoap/PlanoSoap` (refactor abandonado que valia a pena), `gerarSoapCurto/Completo/ComSae`, `gerarPendenciasPorModulo`, `exportProto`, `importProto`, `resetProto`.
- **Auth**: tela de cadastro inteira inalcançável (`authShowRegister` sem nenhum caller + HTML `#auth-register-view` sempre oculto + `authRegister`/`authShowLogin`), `adminCriarTrial` (stub órfão).
- **Bloco A**: `sinanAbrirFichaOficial`, `imcCrianca`, `resumoExamesLivres`, `planoExamesLivresSoap` (esta com lógica não-trivial — conferir se `resumoExamesSoapEstruturado` cobre tudo antes de apagar).
- **Bloco E**: `sentence`, `reagent`, `isFilled`.
- **CSS**: `.badge-role/-admin/-user/-trial/-block/-expired`, `.bg-blue`, `.bg-purple`, `.clinical-tabs/.clinical-tab`, `.ic-t`/`.dt` (matiz teal inteira sem consumidor), `.ai-soap-pill`, `.admin-chip`, `.info-box-ed`, `.list-ed`, `.ed-section-sub`, `.lab-high/low/critical`, bloco "modal trial" (570-574) + **bloco Ficha Rosa duplicado literal** (677-690 = cópia de 699-728, uma dentro do @media 768px).

---

## 5. DUPLICAÇÃO (classes de problema, causa-raiz)

1. **A lista dos ~13 módulos clínicos é redigitada à mão em ~9 estruturas** (`MODULOS_SISTEMA` 4639, `EXAMES_LIVRES_MODULOS` 5513, `VAC_MODULOS` 5785, `FONTES_PROTOCOLARES_MODULOS` 6127, `MODULOS_ATENDIMENTO` 8204, `CAMPOS_PACIENTE` 8219, `PLANO_MODULOS` 8628, `DEMANDA_MODULOS` 11201, `CENTRAL_PROTOCOLAR_MODULOS` 11863 + `tipoCss` 9338, `QUICK_PAGE_PREFIX` 8684, `CAMPOS_ESSENCIAIS` 8685). **É a causa-raiz do bug P0-2** (esqueceram `vd` numa delas). Consolidar num registro canônico único.
2. **5 cópias idênticas de escape HTML**: `vacEsc` (5831), `escTR` (6026), `protoEsc` (7201), `docCalEsc` (8061), `gestEsc` (8494).
3. **3 implementações de "idade a partir de nascimento"** com convenções diferentes (meia-noite local / meio-dia local / UTC) — casos de borda divergem 1 dia entre módulos (e o bug 5 é a 4ª variante, errada).
4. **~90 linhas de conteúdo clínico duplicado**: `checkPnaQueixas` vs `checkPncQueixas` (5317-5407) — mesmas ~16 queixas com condutas terapêuticas quase palavra por palavra. Atualização de protocolo exige editar 2 lugares.
5. **Mapas anatômicos**: 18 funções / ~210 linhas para 1 componente (mama/colo/vagina), com assimetrias acidentais (só vagina tem preventDefault).
6. **Desenhadores de PDF do SINAN reimplementados 5x** (`at/spaced/digits/dateAt/codeAt` em 4326, 4362, 4411, 4478 + na função morta 4556).
7. **Bloco de identificação do paciente copiado à mão 8x no HTML** (1042, 1362, 1536, 2190, 2925, 3064, 3695, 3864) — sendo que a fábrica `identificacaoModulo(p)` (11751) já existe e gera isso pros 7 módulos novos.
8. **Coordenadas ERSM duplicadas** entre preview (8089-8090) e PDF real (8168-8169) — recalibrar um e esquecer o outro = divergência silenciosa.
9. **Ternária de 230 chars prefixo→página copiada 4x** (6599, 6632, 6641, 11880).
10. **`carregarPdfLib` duplicada** (10639 vs 12020); KPI cards montados inline 3x (8546/8557/8569); 6 wrappers `salvarAtendimento_*` de uma linha obsoletos (9330).
11. **2 IIFEs de patch no fim do arquivo** capturando/sobrescrevendo funções anteriores — decorator manual em camadas; 3 delas capturam `PRO.orig` e nunca usam. Padrão frágil: foi ele que produziu os bugs P0-3 e P0-4.
12. **Preventivo e Saúde Mental não passam pelo pipeline central de SOAP** (`montarSoapClinico`/`finalizarSoapModulo`) — montam na mão (~130 linhas duplicadas; correções de humanização não se propagam).

---

## 6. PERFORMANCE E CARREGAMENTO

**Hoje: ~6,7s só de download; tela branca até processar 1,3MB de blob no head; HTML re-baixado inteiro a cada visita (sem cache possível).**

| Item | Linha | KB | Ação |
|---|---|---|---|
| SINAN 16 fichas base64 | 4025 | 741 | Externalizar, lazy |
| Ficha Rosa PDF | 10293 | 685 | Externalizar, lazy |
| pdf-lib | 23 | 512 | Externalizar, defer/lazy |
| Logo laudo TR (PNG) | 6030 | 466 | Externalizar |
| ERSM PDF | 28 | 441 | Externalizar, lazy |
| IVCF-20 PDF | 31 | 344 | Externalizar, lazy |
| Ficha Rosa JPEG | 10405 | 154 | Externalizar |
| SINAN oficial (MORTO) | 4022 | 44 | **Apagar** |

Plano (sem build, arquivos irmãos do index.html, compatível com upload manual):
1. Extrair os blobs pra `/modelos/*.pdf`, `/img/*.png|jpg`, `/vendor/pdf-lib.min.js` → HTML cai de 4,8MB pra ~1,4MB (**-70%**, ~6,7s → ~2s) e os 3,3MB viram cacheáveis (visitas seguintes quase zero).
2. Lazy-load: pdf-lib e cada modelo só na primeira vez que a função que os usa roda (fetch → ArrayBuffer direto no pdf-lib, sem base64).
3. Head enxuto (+preconnect fonts); JS de app com defer no fim do body.

Runtime:
- **`dadosGestao()` é O(pacientes × atendimentos)** com re-parse do localStorage por paciente (8294-8297, 8498-8501; variável `ats` calculada e nunca usada = resíduo de refactor). Indicadores/território chamam isso **3x por render** (8537-8568), e a camada de patch final **dobra** (12592-12600). Com anos de uso, trava. Corrigir: carregar 1x, indexar por CPF num Map, passar como parâmetro.
- Buscas `ba-busca`/`terr-busca` sem debounce (3821, 3852) disparando a cascata acima a cada tecla.
- 2 inits com `setTimeout` mágicos (600ms/900ms) nas IIFEs — frágil em máquina lenta.

---

## 7. ESCALA DE DADOS

- `esf_atendimentos_v3:{USER_ID}` cresce sem limite (`unshift` sem poda). O log de auditoria já faz `slice(0,1000)` — replicar o padrão: manter N meses locais + exportar/arquivar (export JSON/TXT/CSV já existe).
- Dados já são por usuário autenticado (não por navegador) e sync com Supabase existe (debounce 900ms + download a cada `getSession`). Gaps: sem refresh automático com aba aberta; sem botão "sincronizar agora"; offline prolongado prende dados no dispositivo.
- Gerentes consultam Supabase direto com escopo por nível de acesso — correto pra multi-UBS.

---

## 8. UX (vida da enfermeira)

1. **Dá pra salvar consulta inteira sem nome/CPF** em 6 dos 7 módulos — só o SINAN valida obrigatoriedade (o padrão `sinan-obrigatorio` + `data-label` já existe, é estender).
2. **Teclado errado no celular**: só 1 campo em ~15 numéricos tem `inputmode="numeric"` (2209); nenhum telefone usa `type="tel"`; zero `autocomplete`.
3. **Nenhum `<label for>`** nos ~430 campos de texto/select (checkboxes estão corretos) — área de toque menor e leitor de tela mudo.
4. **Sem recuperação de senha** (não existe `resetPasswordForEmail`) e cadastro morto → esqueceu a senha = admin no console do Supabase.
5. **Erros de login em inglês cru** ("Invalid login credentials") pra usuária leiga (10102-10113).
6. **Emojis como indicador de risco** (M-CHAT 7292, ERSM 7900-7956, admin 10239+) — inconsistente com o resto (dots CSS) e pode quebrar na impressão de laudos.
7. **Contraste `--tx3` (#96938a) = 3,07:1** — abaixo de WCAG AA (4,5:1), usado em textos de 10-12px no app inteiro.
8. 70 divs/spans clicáveis sem teclado/foco (abas, acordeões — 3 padrões, trocar por `<button>` resolve).
9. `document.write`+`setTimeout(print,300)` nos laudos — em máquina lenta pode imprimir antes do layout estabilizar.
10. Zero `@media` dark/orientation; 11 breakpoints não padronizados (760 e 768 competindo).

---

## 9. PLANO DE AÇÃO PRIORIZADO

**Fase 1 — Bugs clínicos e de dados (P0, cirúrgico, sem mudar arquitetura)**
Reset dos mapas anatômicos por paciente · `vd` em CAMPOS_PACIENTE · expor `prepararSinanSifilis` · restaurar conduta pré-eclâmpsia no `gerarSoapPN` · timezone `idadeSM` · guard no `salvarEdicao` · timeout no fetch da IA + payload de teste igual ao real · print padding.

**Fase 2 — Performance (maior ganho percebido)**
Externalizar os 7 blobs + lazy pdf-lib (4,8MB → 1,4MB) · indexar `dadosGestao` (matar O(P×A) e as chamadas triplas/dobradas) · debounce nas buscas · render duplicado da home · `baixarAtendimentosNuvem` única.

**Fase 3 — Faxina (zero risco funcional, -700+ linhas)**
VD 1.0 · calibrador Ficha Rosa · cadeia SINAN antiga + blob 44KB · IA-SOAP paralela · 12 mortas do bloco B · cadastro morto · CSS morto + bloco duplicado.

**Fase 4 — Estrutura pra escala (causa-raiz)**
Registro canônico único de módulos (mata a classe do bug P0-2) · `escHtml` única · idade única · pipeline SOAP único (migrar preventivo/SM) · IDs SOAP padronizados · identificação via fábrica nos 6 módulos antigos · mapas anatômicos genéricos · coordenadas ERSM únicas · dissolver as 2 IIFEs de patch no código principal · separar `app.js`/`styles.css` do HTML.

**Fase 5 — UX**
Obrigatoriedade nome/CPF nos 7 módulos · inputmode/tel/autocomplete · label for · recuperação de senha · erros em PT-BR · modo offline (gate de auth) · emojis→dots/SVG · contraste `--tx3` · limite/arquivamento de atendimentos + botão sincronizar.

---

## 10. COBERTURA E LIMITES

- 100% das 13.184 linhas cobertas por região (8 agentes); blobs identificados por assinatura, não decodificados.
- Top 5 achados críticos re-verificados com grep/awk/node nesta máquina; código morto confirmado individualmente com grep pelos agentes (1 ocorrência = morto).
- Não coberto (fora de escopo): segurança/RLS do Supabase, conteúdo clínico dos protocolos em si (só a mecânica do código), comportamento em runtime real (nenhum teste de navegador foi executado nesta auditoria).
