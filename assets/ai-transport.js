(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ESFAITransport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function error(message,status=0,code=''){return Object.assign(new Error(message),{status,code});}
 async function readResponse(response){
  let json;try{json=await response.json();}catch{throw error('O servidor retornou uma resposta que não pôde ser lida.',response.status,'INVALID_JSON_RESPONSE');}
  const data=json?.data||json;
  if(!response.ok||data?.erro||data?.error)throw Object.assign(error(String(data?.erro||data?.error||'A API recusou a solicitação.').slice(0,300),response.status>=400?response.status:502,data?.codigo||json?.codigo||'API_ERROR'),{requestId:json?.requestId||data?.requestId||''});
  if(typeof data?.soap!=='string'||!data.soap.trim())throw error('A API respondeu sem um SOAP válido. O texto local foi preservado.',502,'EMPTY_RESPONSE');
  return{...data,requestId:json.requestId||data.requestId||'',pendencias:Array.isArray(data.pendencias)?data.pendencias:[],bloqueado:!!data.bloqueado};
 }
 function explain(e){
  const detail=e?.requestId?' Identificador: '+e.requestId+'.':'';
  if(e?.name==='AbortError'||e?.name==='TimeoutError'||/GEMINI_TIMEOUT|AUTH_TIMEOUT|QUOTA_TIMEOUT/.test(e?.code||''))return 'Tempo de resposta excedido. A função ou a Gemini demorou além do limite; o SOAP local foi preservado. Tente novamente. Não é confirmação de chave inválida nem de erro de CORS.'+detail;
  if(e?.status===401)return 'Sessão recusada ou expirada. Saia e entre novamente no programa. A função deve receber a sessão autenticada; mantenha a autenticação habilitada.'+detail;
  if(e?.status===403)return 'O servidor não autorizou este usuário ou endereço do site. Confira a permissão de IA no Supabase.'+detail;
  if(e?.status===404)return 'A função configurada não foi encontrada. Confira o endereço e a implantação no Supabase.'+detail;
  if(e?.status===429)return 'Limite de uso ou cota atingido. Aguarde e confira a cota no Supabase/Gemini.'+detail;
  if(e?.status===504)return 'A função excedeu o tempo de resposta. O SOAP local foi preservado.'+detail;
  if(e instanceof TypeError||/failed to fetch|networkerror|load failed/i.test(e?.message||''))return 'O navegador não recebeu uma resposta da função. Pode haver falha de rede, bloqueio do navegador ou CORS; esta mensagem sozinha não identifica qual deles. O SOAP local foi preservado.';
  return 'Falha na IA: '+(e?.message||'Resposta indisponível.')+detail;
 }
 return Object.freeze({readResponse,explain});
});
