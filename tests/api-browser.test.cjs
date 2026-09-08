const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm');
const {chromium}=process.env.ESF_PLAYWRIGHT_PATH?require(process.env.ESF_PLAYWRIGHT_PATH):require('playwright');
const root=path.resolve(__dirname,'..'),results=[],errors=[];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [i,m] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries())if(m[1].trim())new vm.Script(m[1],{filename:'inline-'+i});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
const success={apiVersion:2,requestId:'synthetic-request',data:{soap:'DESCRIÇÃO DA CONSULTA\nTeste fictício\nS: Registro fictício.\nO: Não avaliado.\nA: Teste técnico.\nP: Revisar.',modelo:'gemini-2.5-flash',modoTeste:true,bloqueado:false}};
let browser;
async function main(){try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.ESF_BROWSER_CHANNEL==='chromium'?{}:{channel:process.env.ESF_BROWSER_CHANNEL||'msedge'})});
 const context=await browser.newContext();await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.goto(base);await page.waitForTimeout(1300);
 await page.evaluate(()=>{
  CURRENT_AUTH_USER_ID='synthetic-user';CURRENT_USER_PROFILE={nome:'Profissional Fictício',cargo:'Enfermeiro'};PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:true,usar_ia_soap:true};window.MODO_OFFLINE=false;
  window.makeSession=()=>({data:{session:{user:{id:CURRENT_AUTH_USER_ID},access_token:'synthetic-token'}}});_sb={auth:{getSession:async()=>makeSession()}};
  document.getElementById('auth-screen').classList.remove('visible');document.querySelectorAll('.edit-modal.open').forEach(e=>e.remove());
  document.getElementById('admin-screen').classList.add('visible');adminTab(null,'ia-soap');
 });
 const check=async(name,fn)=>{await fn();results.push({name,passed:true});console.log('PASS '+name);};
 const mock=async(data,status=200)=>page.evaluate(({data,status})=>{window.sent=[];window.fetch=async(url,options)=>{sent.push({url,headers:options.headers,body:JSON.parse(options.body)});return new Response(JSON.stringify(data),{status});};},{data,status});
 await check('Botão real envia sessão e exemplo fictício; mostra resposta Gemini',async()=>{
  await mock(success);await page.getByRole('button',{name:'Testar conexão',exact:true}).click();await page.waitForFunction(()=>document.getElementById('ai-soap-status').textContent.includes('Teste de geração concluído'));
  const r=await page.evaluate(()=>({sent:sent[0],status:document.getElementById('ai-soap-status').textContent}));assert.equal(r.sent.headers.Authorization,'Bearer synthetic-token');assert.ok(r.sent.headers.apikey);assert.equal(r.sent.body.tipoAcao,'testar_conexao');assert.match(r.sent.body.dadosConsulta.soapLocal,/fictício/);assert.match(r.status,/gemini-2.5-flash/);
 });
 await check('HTTP 200 com erro é falha, sem sucesso falso',async()=>{await mock({erro:'Controle não instalado'});await page.evaluate(()=>testarConfigAISoap());assert.match(await page.locator('#ai-soap-status').textContent(),/Controle não instalado/);});
 await check('401, 403, 429 e 504 têm mensagens distintas',async()=>{for(const [status,match]of [[401,/Sessão/],[403,/não autorizou/],[429,/Limite/],[504,/tempo/]]){await mock({erro:'Falha fictícia'},status);await page.evaluate(()=>testarConfigAISoap());assert.match(await page.locator('#ai-soap-status').textContent(),match);}});
 await check('Sessão ausente, offline ou de outro usuário não envia requisição',async()=>{
  await mock(success);const errors=await page.evaluate(async()=>{const cfg={endpoint:AI_SOAP_ENDPOINT_PADRAO},out=[];for(const setup of [()=>{window.MODO_OFFLINE=true;},()=>{window.MODO_OFFLINE=false;_sb.auth.getSession=async()=>({data:{session:null}});},()=>{_sb.auth.getSession=async()=>({data:{session:{access_token:'synthetic',user:{id:'other'}}}});}]){setup();try{await chamarIASoap(cfg,{tipoAcao:'testar_conexao'});}catch(e){out.push(e.message);}}_sb.auth.getSession=async()=>makeSession();return{errors:out,calls:sent.length};});assert.equal(errors.errors.length,3);assert.equal(errors.calls,0);
 });
 await check('Endpoint de outro projeto não recebe sessão',async()=>{await mock(success);const r=await page.evaluate(async()=>{try{await chamarIASoap({endpoint:'https://other.supabase.co/functions/v1/test'},{tipoAcao:'testar_conexao'});}catch(e){return{error:e.message,calls:sent.length};}});assert.match(r.error,/mesmo projeto/);assert.equal(r.calls,0);});
 await check('Prazo também cobre corpo da resposta que nunca termina',async()=>{
  const r=await page.evaluate(async()=>{const timer=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timer(fn,ms===45000?25:ms,...args);let aborted=false;window.fetch=async(url,options)=>{options.signal.addEventListener('abort',()=>aborted=true);return{ok:true,status:200,json:()=>new Promise(()=>{})};};try{await chamarIASoap({endpoint:AI_SOAP_ENDPOINT_PADRAO},{tipoAcao:'testar_conexao'});}catch(e){return{name:e.name,aborted,message:explicarFalhaAISoap(e)};}finally{window.setTimeout=timer;}});assert.equal(r.name,'TimeoutError');assert.equal(r.aborted,true);assert.match(r.message,/Tempo de resposta/);
 });
 await page.evaluate(()=>{
  fecharAdmin();go('pn-abertura');const ids=SOAP_IDS_MODULO[prefixoPaginaAtual()];for(const [key,id]of Object.entries(ids))if(document.getElementById(id))document.getElementById(id).value=key.toUpperCase()+': Texto fictício para teste.';
  localStorage.setItem(AI_SOAP_CONFIG_KEY,JSON.stringify({...configAISoapPadrao(),enabled:true}));window.localBefore=obterSOAPLocalAtual();
 });
 await check('Gerar SOAP usa transporte autenticado e aguarda revisão antes de aplicar',async()=>{
  await mock({...success,data:{...success.data,modoTeste:false}});await page.evaluate(()=>gerarSoapPorIA());const r=await page.evaluate(()=>({sent:sent[0],local:obterSOAPLocalAtual(),before:localBefore,compare:!!document.getElementById('ia-soap-compare')}));assert.equal(r.sent.body.tipoAcao,'gerar_soap');assert.deepEqual(Object.keys(r.sent.body.dadosConsulta),['soapLocal']);assert.equal(r.sent.headers.Authorization,'Bearer synthetic-token');assert.equal(r.local,r.before);assert.ok(r.compare);
 });
 await check('Troca de usuário impede aplicar a resposta da sessão anterior',async()=>{await page.evaluate(()=>{CURRENT_AUTH_USER_ID='other-user';aplicarSOAPIARevisado('pn');});assert.equal(await page.evaluate(()=>obterSOAPLocalAtual()),await page.evaluate(()=>localBefore));await page.evaluate(()=>{CURRENT_AUTH_USER_ID='synthetic-user';document.getElementById('ia-soap-compare')?.remove();});});
 await check('Bloqueio do servidor e erro de cota preservam o SOAP local',async()=>{for(const response of [{...success,data:{...success.data,bloqueado:true,pendencias:['Dados insuficientes']}},{erro:'Cota indisponível'}]){await mock(response);await page.evaluate(()=>gerarSoapPorIA());assert.equal(await page.evaluate(()=>obterSOAPLocalAtual()),await page.evaluate(()=>localBefore));assert.equal(await page.locator('#ia-soap-compare').count(),0);}});
 await check('Nenhuma exceção JavaScript nos percursos testados',async()=>assert.deepEqual(errors,[]));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/api-browser.json'),JSON.stringify({time:new Date().toISOString(),environment:'Dados fictícios, serviços simulados e rede externa bloqueada',tests:results,pageErrors:errors},null,2));}console.log(results.length+'/'+results.length+' grupos aprovados');}
main().catch(e=>{console.error(e);process.exitCode=1;});
