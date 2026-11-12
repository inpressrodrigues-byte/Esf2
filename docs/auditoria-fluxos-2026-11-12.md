# PRUMO APS — revisão dos atendimentos de enfermagem

Auditoria de 12/11/2026. Referência anterior para comparação: `65201d7`. Foram inspecionados os formulários, o cadastro por CPF, a restauração de consultas, a geração do SOAP e dos documentos, os cálculos e os controles de acesso. As simulações usaram pacientes fictícios e armazenamento local isolado.

## Resultados por módulo

Os números representam a soma dos campos editáveis exibidos ao abrir cada etapa em um computador de 1440 × 1000. Campos de abas inativas, seções recolhidas, campos desabilitados e resultados calculados ficam fora da contagem. A frequência indicada abaixo é a do fluxo afetado, estimada pela estrutura do formulário. Não houve telemetria de pacientes.

| Atendimento | Antes → depois | Problema, frequência e impacto | Alteração ou motivo de preservação |
|---|---:|---|---|
| Abertura do pré-natal | 142 → 131 | Antecedentes e risco se sobrepõem em toda abertura. Alto impacto documental quando um dado ausente vira zero. | Mantida a ligação entre o antecedente de pré-eclâmpsia e a estratificação. Ajustada a paridade incompleta e a data de referência para IG e DPP. |
| Retorno do pré-natal | 94 → 81 | Redigitar a abertura e caracterizar perda vaginal sem queixa consome tempo em cada retorno. Risco alto de misturar episódios. | Seleção da abertura datada pelo CPF, reaproveitamento da DUM após confirmação, antecedentes históricos no SOAP, reavaliação atual do risco e perguntas condicionais sobre perda. |
| Puericultura | 119 → 95 | Peso, medida linear, PC, alimentação e triagens reapareciam nas fichas mensais. A faixa aproximada podia indicar adequação indevida. Impacto alto. | Entrada atual de medidas em um local, com acesso pela ficha mensal. Dados ao nascer continuam distintos. Histórico de triagens junto às perguntas, gráfico com medidas anteriores compatíveis e escores Z oficiais. Perguntas de dificuldade alimentar, desmame e marcos mantidas por terem funções próprias. |
| Preventivo | 116 → 97 | Resultado e coleta pertencem a momentos diferentes. Reabrir a coleta para escrever o laudo podia alterar a evolução original. Impacto alto nos retornos. | Novo registro de resultado vinculado à coleta. Citologia, encaminhamentos e campos oficiais da Ficha Rosa preservados. Retiradas frases de exame e orientações supostamente realizados. |
| Saúde do Idoso | 101 → 90 | Campo vazio podia contar como um “não” no IVCF-20 e inclusive aparecer assim no PDF. Risco clínico alto em avaliações incompletas. | Respostas ausentes ficam em branco, a pontuação final depende da completude. Mantida a avaliação clínica de funcionalidade separada das perguntas oficiais da escala. Calibração movida para o editor restrito. |
| Saúde Mental | 126 → 116 | Definições extensas competiam com os itens. Uma ficha vazia podia aparecer como instrumento aplicado com pontuação zero. Impacto alto. | Ajuda recolhível, revisão da aplicação antes do resultado final e acesso aos sinais agudos. Enunciados e pesos do ERSM preservados. |
| Demanda Espontânea | 82 → 71 | Plano complementar extenso durante atendimentos frequentes. Impacto de tempo moderado. | SAE recolhível, seleção de queixas e orientação imediata preservadas. |
| Hiperdia | 120 → 109 | Dados prévios e diagnóstico atual têm finalidades diferentes. Risco de registrar condição antiga como verificada hoje. | Histórico consultável e reconciliação quando o campo de destino é compatível. Avaliação e conduta da visita atual continuam separadas. |
| Feridas | 95 → 84 | Plano complementar e evolução da lesão lado a lado aumentavam a carga visual. Impacto moderado. | SAE recolhível. Medidas da ferida e medidas corporais continuam distintas. |
| Puerpério | 111 → 100 | Plano extenso em paralelo à avaliação materna. Impacto moderado. | Modo objetivo e histórico datado. Avaliação de sangramento, febre e amamentação permanece acessível. |
| IST | 99 → 88 | Conduta, resultados e documentação da parceria têm funções diferentes. Impacto documental alto. | Menos campos complementares abertos. Preservados diagnóstico, exames, pessoa atendida e parceria. |
| Saúde da Mulher | 126 → 126 | A avaliação de corrimento e a elegibilidade contraceptiva exigem critérios próprios. | Mantidos os campos dessas decisões. Disponíveis histórico e alternância de modo. |
| Visita Domiciliar | 296 → 285 | Maior volume de campos entre os módulos medidos. Impacto de tempo alto. | Menos campos complementares abertos. Instrumentos de dependência, avaliação do cuidador e dados de dispositivos mantidos. Continua a tela mais extensa. |
| SINAN | 76 → 76 | Campos obrigatórios e modelos variam por agravo. Risco documental alto. | Preservados dados gerais, seleção de ficha e campos específicos. A emissão local e a notificação oficial são operações distintas. |
| PNI | Sem abas na medição | Calendário de referência, situação da caderneta e registro de dose têm objetivos distintos. | Preservados os filtros e os estados. O teste de interface não homologa calendários ou envio à RNDS. |

## Comparação e limites das métricas

Nas mesmas 69 etapas, os campos visíveis passaram de **1.703 para 1.549** (154 a menos, 9,0%). Os botões visíveis passaram de **899 para 652**. Esses números somam etapas visitadas individualmente. Não representam o número de cliques necessários para salvar uma consulta. Na ficha mensal infantil, três medidas atuais passaram a ter uma única entrada. No retorno PN simulado, selecionar uma abertura recuperou a DUM e os antecedentes disponíveis e recalculou a IG para a data do atendimento. Não foi cronometada a mediana de atendimento por profissionais.

## Dados, documentos e reversão

O cadastro existente fornece a identificação. O histórico usa o CPF completo, confere o nascimento quando disponível e respeita o acesso ao histórico e o escopo já aplicado pelo sistema. Uma medida anterior permanece datada. Medicação recuperada requer reconciliação e a ação não substitui um valor atual já preenchido. Registros sem identificador confiável ficam fora da correspondência automática.

A estrutura do banco não mudou. Dados novos ficam no objeto de dados da consulta já utilizado pelos registros anteriores, incluindo a referência da coleta, a abertura revisada, a posição da criança na medida e a revisão das escalas. A coleta e o respectivo resultado posterior têm identificadores e autoria próprios. A interface conserva valores condicionais ao recolher campos, e os leitores clínicos desconsideram complementos inativos. Históricos legados com valores mensais divergentes continuam disponíveis para conferência.

Componentes alterados: `index.html` (cálculos, formulário, SOAP, validações e PDF), `assets/fluxo-assistencial.js` (histórico, modos e vinculação), `assets/crescimento.js` e `assets/oms-lms.json` (gráfico e cálculo local), `assets/usability.js` (rascunhos e restauração), `assets/consulta-guiada.css` (apresentação), `tests/fluxo-browser.test.cjs` e `package.json` (regressão). A reversão da versão de interface pode ser feita pelo Git ou pela Vercel. Preservar o banco e os registros com novos campos ao reverter.

## Evidências e limites clínicos

Foram simulados a abertura PN com antecedente e o retorno com risco revisável, a antropometria infantil e o SOAP, a coleta sem laudo e o registro separado do resultado, o sangramento com resposta alterada, a retomada de rascunho e a alternância de módulos. O teste verifica que o relato ocultado continua armazenado e fica fora da queixa atual. A regressão inclui controle de acesso por UBS, reabertura de registros, documentos, CIAP, exames, comportamento com várias queixas e tela estreita.

Os PDFs de IVCF-20, ERSM e Ficha Rosa foram gerados e seus arquivos foram reabertos no teste. São respectivamente uma, duas e uma página. A impressão física sobre papel oficial e o alinhamento nas impressoras de cada UBS ainda precisam de conferência local.

O cálculo antropométrico usa LMS diário de peso/idade, comprimento ou estatura/idade, PC/idade e IMC/idade, por sexo. A série cobre 0 a 1.826 dias. A posição da medida determina o ajuste entre comprimento e estatura. Para menores de dois anos com prematuridade registrada, a tela remete à avaliação de idade corrigida. Fora da referência, o sistema conserva as medidas. A implantação de outra referência para prematuros e crianças maiores deve ser definida com o responsável técnico. [Software da OMS](https://www.who.int/toolkits/child-growth-standards/software) · [Tabelas oficiais utilizadas](https://github.com/WorldHealthOrganization/anthro/tree/b776d8a12b1c97369c748b561159fd2ec4f4db58/data-raw/growthstandards)

A mamografia de rotina foi corrigida para 50–74 anos a cada dois anos, conforme o protocolo municipal e a orientação do INCA. No rastreamento cervical, a interface distingue a citologia do DNA-HPV. A oferta do DNA-HPV precisa ser confirmada por unidade. A tela de resultado implementada continua voltada ao citopatológico. A simulação não verificou transmissão a SIGSS, SISCAN, GAL ou e-SUS. [Protocolo municipal de Saúde da Mulher](https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-09/protocolo_municipal_de_enf_cuidado_em_saude_da_mulher_2026.pdf) · [INCA — mama](https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/mama/versao-para-profissionais-de-saude/deteccao-precoce) · [INCA — colo do útero](https://www.gov.br/inca/pt-br/assuntos/gestor-e-profissional-de-saude/controle-do-cancer-do-colo-do-utero/acoes/deteccao-precoce) · [Implantação no Paraná](https://www.saude.pr.gov.br/Noticia/Parana-disponibiliza-painel-de-rastreamento-organizado-do-cancer-do-colo-do-utero-com-teste)

## Notas da auditoria técnica

| Critério | Nota | Base da avaliação |
|---|---:|---|
| Usabilidade | 8/10 | Navegação por teclado, modos compartilhados e redução visível. Falta observação com a equipe. |
| Agilidade | 7/10 | Menos campos e digitação nos fluxos testados. O tempo real da consulta segue sem medição. |
| Organização | 8/10 | Separação entre histórico, avaliação atual, coleta, resultado e calibração. A visita domiciliar continua extensa. |
| Funcionalidade | 8/10 | Percursos com registros fictícios, documentos e regressões executados. Integrações oficiais fora do teste. |
| Segurança clínica | 7/10 | Casos testados de ausência de dados, critérios, curvas e escalas. A nota não constitui homologação assistencial de todos os protocolos. |
