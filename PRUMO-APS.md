# PRUMO APS — aplicação da identidade aprovada

A prévia aprovada pelo mantenedor foi adaptada aos formulários reais. O sistema passa a se apresentar como PRUMO APS, com a assinatura “Clareza para cuidar.”, preservando o acesso e os registros existentes.

## Interface

- Tipografia maior, campos com 44 px de altura, grupos mais espaçados e fundo neutro. Padrão comum aos 24 módulos/páginas, incluindo identificação do paciente, etapas, revisão e barra de ações.
- Menu com grupos recolhíveis e favoritos por conta neste dispositivo. Os mesmos botões originais são reposicionados, preservando as verificações de permissão e a ativação dos módulos.
- Exame com indicação visual de seleção além da cor, mantendo os botões e estados acessíveis existentes.
- Risco apresenta classificação e “Completude a conferir” lado a lado. A conferência do profissional tem estado próprio e não certifica preenchimento completo. Alterações nos dados continuam invalidando a conferência.
- Bibliografia reunida em seção recolhível; a conduta permanece visível. Documentos de diabetes gestacional ficam em uma seção própria, com os geradores originais.
- Cenários fictícios ficam em Administração → Testes, com confirmação de substituição dos campos e as permissões existentes. O botão chamativo “TESTE” deixa o cabeçalho clínico.
- Entrada, administração e navegação usam PRUMO APS. Aparência padrão antiga é migrada para o novo padrão; personalizações de cores existentes são preservadas. Administração → Aparência oferece PRUMO APS e PRUMO escuro.

## Verificação

`npm test` cobre 22 testes de servidor, transporte e reparo PostgreSQL. `npm run test:browser` reúne 13 grupos de API e 23 grupos de usabilidade. A suíte inclui 24 páginas/62 abas, teclado, salvamento real pelo botão e checklist, reabertura, rascunhos, preferências separadas por conta, restrições de acesso e larguras de 320 a 1366 px nos novos estados.

Dados fictícios e armazenamento isolado são utilizados nos testes de navegador, com rede externa bloqueada. Os JSONs e as capturas são registrados em `test-results/` e nos artefatos da integração contínua. A publicação deve ser conferida comparando os arquivos públicos com o código testado.

## Escopo

Classificadores, limiares, doses, protocolos, formatos de documentos e transporte da API não foram alterados. Esta aplicação visual não conclui a auditoria clínica integral separada no PR #2. O nome adotado decorre da proposta aprovada; esta alteração não constitui pesquisa ou registro de marca.
