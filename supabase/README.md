# Integração de IA para homologação

Esta função foi adicionada ao repositório; **não é a função já publicada**. O código
e as políticas do Supabase existente não foram disponibilizados para esta auditoria.
Os testes do handler usam serviços simulados, sem pacientes reais e sem cobrança de IA.

O servidor valida o usuário, exige seu ID na lista administrativa, aceita somente
SOAP, limita o corpo, consulta uma cota atômica de 30 solicitações/hora por usuário,
fixa as instruções e o modelo no servidor e não registra o conteúdo em logs.
Falhas na autenticação, autorização ou cota impedem o uso do provedor.

Antes de instalar em produção:

1. Homologar a migração de cota e a função em um projeto de teste. A migração não altera
   as tabelas de pacientes/atendimentos. Conferir suas políticas com o SQL de leitura.
2. Configurar segredos `OPENAI_API_KEY`, `ESF_OPENAI_MODEL` (modelo Chat Completions
   autorizado na conta), `ESF_AI_USER_IDS` (UUIDs separados por vírgula) e
   `ESF_ALLOWED_ORIGINS` (origens HTTPS exatas separadas por vírgula). Nunca colocar
   esses segredos no HTML. Supabase fornece URL e chave pública no servidor.
3. Manter a verificação de JWT e apontar o cliente para a função homologada.
4. Testar sessão válida/expirada, usuário sem autorização, limite de uso, indisponibilidade
   do provedor, revisão da resposta e isolamento entre dois usuários reais de teste.
5. Aprovar retenção, acesso e tratamento dos dados com o responsável pelo serviço.

`store:false` desativa o armazenamento opcional da resposta; não constitui garantia
de retenção zero. A remoção de identificadores conhecidos no navegador também não
garante anonimização de texto livre. Revisar o texto antes de enviar.

Referências consultadas em 07/09/2026:
[autenticação Supabase](https://supabase.com/docs/guides/functions/auth),
[validação de usuário](https://supabase.com/docs/reference/javascript/auth-getuser),
[Chat Completions](https://developers.openai.com/api/reference/resources/chat),
[controles de dados](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint).
