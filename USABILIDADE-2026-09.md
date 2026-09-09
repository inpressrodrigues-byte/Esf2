# Interface compacta e clareza do atendimento

Esta alteração aplica a direção visual aprovada pelo mantenedor: navegação verde, formulários compactos, menos superfícies decorativas e ações de revisão, cópia e salvamento organizadas.

## Alterações

- Aparência comum em 24 páginas. Menu agrupado por tarefa, abas acessíveis por teclado e identificação do paciente durante a consulta. No celular, menu em gaveta e seletor da etapa evitam faixas de abas cortadas.
- Uma ação principal por etapa nos 12 módulos assistenciais. Na revisão, o botão salva usando a validação e o checklist existentes; variantes de cópia ficam reunidas. IA aparece como apoio à redação na revisão, com a mesma autenticação e comparação já publicadas.
- Risco gestacional apresentado como resultado calculado, com critérios, origem e estado de revisão. Dados parciais ficam explicitamente pendentes; novos dados invalidam a revisão. Os limiares, estratos, encaminhamentos e doses do avaliador existente não foram alterados.
- As três condições exatamente duplicadas entre anamnese e critérios adicionais passam a ter uma única entrada. Marcações antigas dessas condições são preservadas na anamnese ao restaurar o registro.
- Estado geral, mucosas e edema da abertura do pré-natal ficam junto do exame, sem controles equivalentes em outros blocos. Edema da consulta PN também tem uma única entrada. Achados estruturados preservam os alertas existentes; os marcadores derivados não repetem o texto do exame.
- Removida a ação de marcar todos os resultados esperados de uma vez. Cada achado deve ser escolhido pelo profissional. Limpar remove também seleções; limpar o guia remove seus campos estruturados.
- Seleções ficam incluídas nos dados do atendimento. A reabertura preserva compatibilidade com campos antigos gravados por posição e limpa dados de outro atendimento antes de restaurar.
- Novos rascunhos identificados pela conta, incluindo checkboxes e seleções, com retomada explícita. Rascunho, registro salvo localmente e registro sincronizado têm mensagens distintas.

## Validação

`npm test` executa 22 testes de servidor, transporte e reparo PostgreSQL. `npm run test:browser` executa os 13 grupos da API e 19 grupos da interface, incluindo o salvamento pelo botão real e a reabertura do registro.

O teste de interface percorre 24 páginas e 62 abas, faz 48 verificações de largura (390 e 768 px), confere teclado, critérios duplicados, fontes do exame, limpeza, rascunhos por conta e os estados de salvamento. Os testes usam somente dados fictícios, armazenamento isolado e rede externa bloqueada; não há operação em prontuários reais. Capturas e resultados ficam em `test-results/` e nos artefatos da integração contínua.

## Limites

Esta é a implementação da direção visual e dos ajustes de interação descritos acima. A reorganização clínica de formulários longos, revisão integral dos protocolos, importação de documentos e demais mudanças amplas permanecem no PR #2; esta alteração parte do código publicado pelo PR #3 e preserva a API.

Rascunhos antigos sem identificação de conta não são apagados nem atribuídos automaticamente a um usuário. A chave legada permanece no dispositivo. O registro final e os novos rascunhos têm caminhos próprios de restauração; registros antigos com apenas SOAP continuam seguindo a edição já existente.

Os estados de sincronização se referem ao atendimento, não a uma certificação de todas as tabelas do banco. A revisão de risco é uma declaração de conferência do profissional, não comprovação automática de completude clínica. Não houve piloto de usabilidade com profissionais, validação clínica integral ou certificação de acessibilidade nesta mudança.

O nome ESF Enfermagem permanece. As propostas de nova identidade e nome são apresentadas separadamente ao mantenedor.
