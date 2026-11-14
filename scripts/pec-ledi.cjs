// Transporte de uma ficha LEDI já serializada para o receptor indicado pela TI.
'use strict';
const {basename}=require('node:path');
const {readFile}=require('node:fs/promises');
async function transmitir({base,usuario,senha,nome,bytes},request=fetch){
  if(!base||!usuario||!senha)throw Error('Configure PEC_URL, PEC_USUARIO e PEC_SENHA no ambiente do integrador.');
  const url=new URL(base);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Informe a URL HTTPS da instalação, sem credenciais ou parâmetros.');
  if(!/^(?:\d{7}-)?[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}\.esus$/i.test(nome)||!bytes?.length)throw Error('Informe uma ficha binária .esus com o UUID do dado serializado no nome.');
  const post=(path,body,headers={})=>request(url.href.replace(/\/$/,'')+path,{method:'POST',body,headers,redirect:'error',signal:AbortSignal.timeout(30000)});
  const auth=new FormData();auth.set('usuario',usuario);auth.set('senha',senha);
  const login=await post('/api/recebimento/login',auth);
  if(login.status!==200)throw Error('Falha de autenticação do integrador (HTTP '+login.status+').');
  const cookie=login.headers.getSetCookie().map(v=>v.split(';',1)[0]).find(v=>/^JSESSIONID=[^\s;,]+$/.test(v));
  if(!cookie)throw Error('O PEC não devolveu JSESSIONID.');
  const ficha=new FormData();ficha.set('ficha',new Blob([bytes],{type:'application/octet-stream'}),nome);
  let response;
  try{response=await post('/api/v1/recebimento/ficha',ficha,{Cookie:cookie});}
  catch{throw Error('Recebimento incerto. Consulte o UUID em Transmissão de dados antes de repetir.');}
  if(response.status!==200)throw Error('Recebimento não confirmado (HTTP '+response.status+'). Confira a ficha e o lote na instalação.');
  return {uuid:nome.slice(0,-5),http:response.status};
}
module.exports={transmitir};
if(require.main===module)(async()=>{
  const file=process.argv[2];if(!file)throw Error('Uso: node scripts/pec-ledi.cjs caminho/uuid.esus');
  const r=await transmitir({base:process.env.PEC_URL,usuario:process.env.PEC_USUARIO,senha:process.env.PEC_SENHA,nome:basename(file),bytes:await readFile(file)});
  process.stdout.write('Recebido pelo PEC · '+r.uuid+' · HTTP '+r.http+'\n');
})().catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
