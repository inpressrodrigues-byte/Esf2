const test=require('node:test'),assert=require('node:assert/strict'),transport=require('../assets/ai-transport.js');
test('IA: erro antigo com HTTP 200 não vira conexão aprovada',async()=>{await assert.rejects(transport.readResponse(new Response(JSON.stringify({bloqueado:true,erro:'Chave ausente'}))),e=>e.status===502&&/Chave ausente/.test(e.message));});
test('IA: resposta vazia e JSON inválido não viram sucesso',async()=>{for(const body of ['<html>erro</html>',JSON.stringify({soap:''})])await assert.rejects(transport.readResponse(new Response(body)));});
test('IA: envelopes antigo e novo preservam bloqueio e SOAP para revisão',async()=>{for(const json of [{soap:'S: Texto',bloqueado:true},{data:{soap:'S: Texto',bloqueado:true,pendencias:['Conferir']},requestId:'id-teste'}]){const data=await transport.readResponse(new Response(JSON.stringify(json)));assert.equal(data.bloqueado,true);assert.equal(data.soap,'S: Texto');}});
test('IA: timeout é distinguido de rede, autenticação e cota',()=>{assert.match(transport.explain(Object.assign(new Error(),{name:'AbortError'})),/Tempo de resposta/);assert.match(transport.explain(new TypeError('Failed to fetch')),/mensagem sozinha não identifica/);assert.match(transport.explain({status:401}),/mantenha a autenticação habilitada/);assert.match(transport.explain({status:429}),/cota/);});
test('IA: recusa de perfil não é confundida com origem; preserva identificador',async()=>{
 for(const [codigo,match,absent]of [['IA_NOT_ALLOWED',/perfil não tem permissão/,/endereço/],['ORIGIN_NOT_ALLOWED',/endereço do site/,/perfil/]]){
  await assert.rejects(transport.readResponse(new Response(JSON.stringify({erro:'Recusado',codigo,requestId:'synthetic-403'}),{status:403})),e=>{
   assert.equal(e.code,codigo);assert.equal(e.requestId,'synthetic-403');
   assert.match(transport.explain(e),match);assert.doesNotMatch(transport.explain(e),absent);
   assert.match(transport.explain(e),/synthetic-403/);return true;
  });
 }
 assert.match(transport.explain({status:403}),/não identificou/);
});
