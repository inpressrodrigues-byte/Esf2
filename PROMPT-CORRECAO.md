# MISSÃO: Executar TODAS as correções do AUDITORIA.md no Roteiro ESF

## Contexto
- Diretório: /Users/joaocris/Desktop/Esf2 — app clínico real em produção (esf2.vercel.app), usado por enfermeiras de UBS.
- O app é um único index.html de 4,8MB / ~13.184 linhas (HTML+CSS+JS inline, zero build, zero deps).
- O arquivo AUDITORIA.md na raiz do projeto é o CONTRATO desta tarefa: auditoria completa com achados verificados, números de linha e plano em 5 fases. Leia ele INTEIRO antes de tocar em qualquer coisa.
- Push no main = deploy automático imediato na Vercel. Por isso as regras abaixo.

## Regras invioláveis
1. Crie e trabalhe SOMENTE na branch `correcoes-auditoria`. NUNCA commite no main, NUNCA faça push (nem da branch — o push é decisão do dono, depois). Se em qualquer momento você se encontrar no main com mudanças, pare e corrija antes de continuar.
2. NUNCA faça deploy, nem sugira que algo "está no ar". Tudo aqui é local.
3. Comportamento clínico é sagrado: nenhuma correção pode alterar conduta/texto clínico além do que o AUDITORIA.md pede explicitamente. Em dúvida entre "corrigir" e "preservar comportamento", preserve e registre a dúvida no relatório final.
4. Sem emojis em nenhum lugar (código, UI, commits, relatório). Onde a auditoria manda REMOVER emojis da UI, substitua por dots CSS (`.dot dr/dg/db/da`, padrão já existente no arquivo) ou SVG inline.
5. Idioma: PT-BR em tudo (mensagens de UI novas, comentários, commits, relatório).
6. Um commit por grupo lógico de correção (ex.: "fase 1: bug timezone idadeSM"), mensagem descritiva. Nada de um commit gigante único.

## Como trabalhar com este arquivo (CRÍTICO — leia antes do primeiro Read)
- O index.html tem 7 linhas-blob gigantes (150KB-741KB cada, base64/lib minificada). Na versão atual são as linhas 23, 28, 31, 4025, 6030, 10293, 10405. NUNCA leia essas linhas inteiras — para inspecioná-las use `awk 'NR==X{print substr($0,1,300)}'`. NUNCA use `cat` no arquivo todo. Leia por faixas de no máximo ~400 linhas.
- Os números de linha do AUDITORIA.md valem para o arquivo ANTES de qualquer edição. Conforme você edita, tudo desloca. Regra: localize cada alvo por CONTEÚDO (grep pelo nome da função/seletor/string única) e use o número de linha da auditoria apenas como referência de partida. Após cada fase, re-derive as posições.
- O arquivo tem 2 IIFEs de "patch" no final (`__ESF_PRO_20260622__` e `__ESF_AUDITORIA_PDF_20260703__`) que capturam e sobrescrevem funções definidas antes. Ao editar qualquer função, confira SEMPRE com `grep -n "function NOME"` e `grep -n "NOME\s*="` se existe redefinição/captura posterior — editar a cópia morta é o erro nº 1 possível nesta tarefa.

## Fonte da verdade e escopo
Execute TODOS os itens das seções 3 (bugs P0/P1), 4 (código morto), 5 (duplicação), 6 (performance/carregamento), 7 (escala de dados), 8 (UX) do AUDITORIA.md, na ordem das fases da seção 9. Completude literal: ao final, cada item numerado da auditoria deve aparecer no seu relatório como FEITO (com evidência) ou NÃO FEITO (com motivo). Nenhum item pode simplesmente sumir.

## Baseline (antes de qualquer edição)
1. `git checkout -b correcoes-auditoria`
2. Suba servidor local: `python3 -m http.server 8000` (em background). O app DEVE ser testado via http://localhost:8000 — nunca via file:// (fetch de assets externos que você vai criar não funciona em file://).
3. Capture o baseline: abra a página (headless ou via curl + análise), registre erros de console pré-existentes e o tamanho do arquivo. Você vai comparar contra isso no final para distinguir regressão de problema pré-existente.
4. Crie um snapshot de verificação de sintaxe: script node que extrai cada bloco <script> do index.html para arquivos temporários e roda `node --check` em cada um. Rode esse script APÓS CADA FASE — é sua rede de segurança contra quebrar o parse de um arquivo de 13 mil linhas. Se algum bloco não passar no baseline (antes de você mexer), registre e compare só o delta.

## Ordem de execução

### FASE 1 — Bugs P0/P1 (cirúrgico, um por vez, commit por bug)
Corrija os 18 bugs da seção 3 do AUDITORIA.md. Atenção especial:
- Bug 1 (contaminação mama/colo/vagina): o reset deve cobrir TODAS as portas de entrada de um novo paciente (mudança de `prev-nome`/CPF e reabertura da página do preventivo), não só uma. Corrija a CLASSE do problema.
- Bug 3 (prepararSinanSifilis): exponha via `window.` no fim da IIFE-1 e confirme que a chamada da IIFE-2 (guard `typeof`) passa a executar de verdade (prove com log temporário ou teste manual do fluxo, depois remova o log).
- Bug 4 (profilaxia pré-eclâmpsia): recupere a lógica da versão ORIGINAL (`gerarSoapAutomatoPna`, ~linha 7049-7105, campo `risco.conduta` calculado em ~5296-5299) e reincorpore na `gerarSoapPN` da IIFE-1. O texto clínico deve ser idêntico ao original — não reescreva a conduta.
- Bug 5 (timezone idadeSM): use o padrão já existente no arquivo (`new Date(v+'T00:00:00')`, ver prevVerificaIdade). Depois de corrigir, faça uma varredura no arquivo INTEIRO por outros `new Date(` recebendo string YYYY-MM-DD crua e corrija todas as ocorrências da mesma classe — liste-as no relatório.
- Bug 9 (IA-SOAP): unificar payload do teste com o real E adicionar `fetchComTimeout` no fetch da geração. Não altere o endpoint nem o contrato real.

### FASE 2 — Performance e carregamento
1. Externalize os 7 blobs base64 para arquivos irmãos: `vendor/pdf-lib.min.js`, `modelos/*.pdf` (ERSM, IVCF-20, SINAN específicos, Ficha Rosa), `img/*.png|jpg` (logos laudo TR, Ficha Rosa JPEG). Método: script node que decodifica cada `const X='...'` para arquivo binário. EXIJA integridade: o binário gerado deve ser byte-idêntico ao base64 decodificado (confira com checksum md5 do decode direto vs arquivo escrito).
2. Substitua cada constante por carregamento sob demanda (fetch → ArrayBuffer na primeira utilização, com cache em memória). As funções consumidoras são majoritariamente async (geração de PDF) — mantenha as assinaturas. pdf-lib: carregue via `<script defer>` ou injeção sob demanda antes do primeiro uso; TODAS as funções que usam `PDFLib` devem aguardar a disponibilidade (já existem helpers `carregarPdfLib`/`carregarPdfLibPN` — unifique num só, como pede a auditoria).
3. O blob morto da linha ~4022 (`SINAN_MODELO_OFICIAL_BASE64`, 44KB) NÃO deve ser externalizado — deve ser apagado junto com sua cadeia morta (Fase 3), então pule-o aqui.
4. Reordene o carregamento: head sem blobs, `preconnect` para fonts, scripts de app não-bloqueantes onde seguro. NÃO mude a ordem relativa de definição das funções JS entre si (as sobrescritas intencionais das IIFEs dependem da ordem).
5. Runtime: corrija o O(pacientes×atendimentos) de `dadosGestao`/`consultasDoPaciente` (carregar atendimentos 1x, indexar por CPF/nome num Map, passar como parâmetro); elimine as chamadas triplas em renderIndicadores/renderTerritorio/renderBuscaAtiva e a dobrada na IIFE final; debounce (~400ms) em `ba-busca` e `terr-busca`; corrija o render duplicado home vs barra (centralizar em `go()`); remova a chamada dupla de `baixarAtendimentosNuvem`.
6. Meta verificável: index.html final < 1,6MB. Meça e reporte antes/depois.

### FASE 3 — Faxina de código morto
Remova tudo da seção 4 do AUDITORIA.md. Protocolo para CADA remoção: antes de apagar, rode `grep -c "NOME"` — apague somente se as únicas ocorrências forem a própria definição (e referências internas do bloco que está sendo removido junto). Cuidados explícitos da auditoria:
- VD 1.0 (~11462-11608): 7 funções NA MESMA FAIXA continuam vivas e usadas pela VD 2.0 (`escalasVDHtml`, `campoDispVD`, `coletarMarcadosVD`, `resumoDispositivosVD`, `calcularEscalasVD`, `textoSoapAnonimizadoVD`, `copiarSoapAnonimizadoVD`, `gerarPDFVisitaDomiciliar`). Recorte função por função, nunca a faixa inteira.
- `planoExamesLivresSoap`: antes de apagar, compare com `resumoExamesSoapEstruturado` e confirme que nada foi perdido; se houver lógica única, registre no relatório em vez de apagar.
- Calibrador da Ficha Rosa: remova também o listener global de `pointerdown` órfão.
- CSS morto: inclua o bloco Ficha Rosa duplicado (cópia dentro do @media 768px) e as classes listadas. NÃO remova `.ficha-cal-*` usadas pelos calibradores IVCF/ERSM (são vivos).

### FASE 4 — Estrutura para escala
Na ordem: (a) crie o registro canônico único de módulos e derive dele as ~9-12 listas hoje redigitadas (uma por vez, testando após cada); (b) `escHtml()` única substituindo as 5 cópias; (c) função única de idade substituindo as 3 convenções (use a convenção UTC já correta de calcIG — e valide que nenhum módulo muda de resultado para datas normais); (d) padronize os IDs SOAP divergentes (`pna-soap-p`→`pna-p` etc. — atualize TODAS as referências, HTML e JS, grep exaustivo por cada ID antigo); (e) migre `gerarSoapPreventivo` e `gerarSoapSM` para o pipeline `montarSoapClinico`/`finalizarSoapModulo` preservando o texto de saída (compare saída antes/depois com os mesmos inputs); (f) generalize o trio mama/colo/vagina em 1 componente parametrizado; (g) constante única para as coordenadas ERSM (preview e PDF); (h) helper `paginaDoModulo(prefix)`; (i) extraia o desenhador SINAN único; (j) unifique checkPnaQueixas/checkPncQueixas numa tabela de queixas + 1 função — o TEXTO clínico resultante deve permanecer idêntico (diff das strings geradas).
NÃO faça nesta tarefa: separar app.js/styles.css do HTML e dissolver as IIFEs no código principal (mudança estrutural grande demais para o mesmo lote — deixe registrado como pendência futura).

### FASE 5 — UX
Todos os itens da seção 8: obrigatoriedade de nome/CPF nos 7 módulos clínicos usando o padrão já existente do SINAN (`sinan-obrigatorio` + `data-label`, adaptado); `inputmode="numeric"` em CPF/CNS/CEP e `type="tel" inputmode="tel"` em telefones (varra TODOS os módulos, inclusive os gerados via `identificacaoModulo`); `label for` nos campos de texto/select (o padrão de markup é uniforme — pode automatizar com script, mas confira amostras manualmente); botão "Esqueci minha senha" com `_sb.auth.resetPasswordForEmail` + tela de feedback; mapa de erros Supabase→PT-BR no login; modo offline: se o SDK do Supabase falhar ao carregar, permitir entrar em modo local com sessão em cache avisando o que não funciona (sync/IA), em vez de prender na tela de login; emojis de risco→dots CSS; `--tx3` para valor com contraste ≥4,5:1 sobre branco; `body{padding-left:0!important}` no @media print; poda/arquivamento de `esf_atendimentos_*` (padrão do slice(0,1000) da auditoria local + oferta de exportação antes de podar) + botão "Sincronizar agora"; compressão via canvas (máx ~1280px) da imagem de fundo da Ficha Rosa antes de gravar; fallback `onerror` com asset local para a imagem NCBI (baixe a imagem para `img/` e use como fonte primária, mantendo o crédito).

## Protocolo de verificação (obrigatório, por fase)
1. `node --check` em todos os blocos <script> extraídos — zero erros novos vs baseline.
2. Servidor local + carregamento da página — zero erros novos de console vs baseline.
3. Teste funcional dos fluxos TOCADOS na fase (no mínimo): login, abrir cada módulo clínico, gerar SOAP em pna/pnc/preventivo/SM/VD, gerar 1 PDF de cada tipo (SINAN específico, ERSM, IVCF, Ficha Rosa, laudo TR, pacote diabetes) após a externalização dos blobs, busca ativa/indicadores/território, salvar+reabrir atendimento, editar SOAP no histórico.
4. Nada de "parece certo": cada bug P0 corrigido exige demonstração do comportamento correto (ex.: bug 1 — simule dois pacientes em sequência e mostre que o segundo SOAP não contém achados do primeiro).
5. Se algo não puder ser verificado no seu ambiente (ex.: fluxo que exige credencial real do Supabase), NÃO marque como verificado — marque "implementado, verificação parcial: <o que falta>".

## Relatório final (entregável obrigatório)
Crie `CORRECOES.md` na raiz com: tabela item-a-item espelhando TODOS os achados do AUDITORIA.md (colunas: item, status FEITO/NÃO FEITO/PARCIAL, commit, evidência de verificação, observações); métricas antes/depois (bytes do index.html, nº de linhas, nº de funções mortas removidas); lista de TODAS as decisões tomadas em zona cinzenta; pendências deixadas de fora com motivo. Termine com o resumo: o que o dono precisa testar manualmente antes de autorizar merge/deploy — ele vai testar pessoalmente em produção, então seja honesto sobre qualquer incerteza.

## Critério de conclusão
A tarefa só está concluída quando: branch `correcoes-auditoria` com commits granulares; main intocado; todos os itens da auditoria no CORRECOES.md com status; verificação das fases executada com evidência; index.html < 1,6MB; zero erros novos de console; nenhum push feito.
