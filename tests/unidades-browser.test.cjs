const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=process.env.ESF_PLAYWRIGHT_PATH?require(process.env.ESF_PLAYWRIGHT_PATH):require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),tests=[],errors=[];fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.ESF_BROWSER_CHANNEL==='chromium'?{}:{channel:process.env.ESF_BROWSER_CHANNEL||'msedge'})});
 const context=await browser.newContext({viewport:{width:1366,height:644}});await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForTimeout(1500);
 await page.evaluate(()=>{CURRENT_AUTH_USER_ID='synthetic-admin';CURRENT_USER_PROFILE={nome:'Admin fictício',unidade:''};PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:true};window.MODO_OFFLINE=false;window.calls=[];_sb={rpc:async(name,args)=>{calls.push({name,args});return{data:args.p_unidade}}};document.getElementById('auth-screen').classList.remove('visible');document.querySelectorAll('.edit-modal.open').forEach(e=>e.remove());ESFUnidades.receberPerfil(CURRENT_AUTH_USER_ID,'');});
 const check=async(name,fn)=>{await fn();tests.push({name,passed:true});console.log('PASS '+name);};
 await check('Unidades: lista inicia sem unidade forçada e administrador salva a própria conta',async()=>{
  await page.evaluate(()=>document.getElementById('user-modal').classList.add('open'));
  assert.equal(await page.locator('#u-unidade option').count(),44);assert.equal(await page.locator('#u-unidade').inputValue(),'');
  await page.locator('#u-unidade').selectOption('ESFSB Cosmos');await page.locator('#u-salvar-unidade').click();
  await page.waitForFunction(()=>CURRENT_USER_PROFILE.unidade==='ESFSB Cosmos');
  const state=await page.evaluate(()=>({call:calls[0],unit:JSON.parse(localStorage.getItem(chaveUsuarioAtual())).unidade,scope:PERMISSOES_ATUAIS.unidade_escopo}));
  assert.equal(state.call.name,'admin_definir_unidade');assert.equal(state.call.args.p_user_id,'synthetic-admin');assert.equal(state.unit,'ESFSB Cosmos');assert.equal(state.scope,state.unit);assert.equal(await page.evaluate(()=>dadosLaudoTR('tr-p',false).unidade),state.unit);assert.equal(await page.locator('#dash-unidade').textContent(),state.unit);
 });
 await check('Unidades: administrador altera outra conta pelo seletor real',async()=>{
  await page.evaluate(async()=>{_sb.from=()=>({select:()=>({order:async()=>({data:[{user_id:'synthetic-other',nome:'Outra conta fictícia',unidade:'ESFSB Cosmos',permissoes:{}}]})})});document.getElementById('admin-screen').classList.add('visible');adminTab(null,'usuarios');await adminCarregarPermissoes();});
  await page.locator('[data-unit-user="synthetic-other"]').selectOption('EAP Boa Vista');
  await page.waitForFunction(()=>calls.some(c=>c.args.p_user_id==='synthetic-other'));
  assert.equal(await page.evaluate(()=>calls.at(-1).args.p_unidade),'EAP Boa Vista');assert.equal(await page.evaluate(()=>CURRENT_USER_PROFILE.unidade),'ESFSB Cosmos');await page.evaluate(()=>fecharAdmin());
 });
 await check('Unidades: usuário comum fica bloqueado mesmo forçando chamada JavaScript',async()=>{
  const state=await page.evaluate(async()=>{PERMISSOES_ATUAIS.ver_admin=false;ESFUnidades.refresh();const before=calls.length;const ok=await ESFUnidades.alterar(CURRENT_AUTH_USER_ID,'EAP Boa Vista');salvarUsuario();return{ok,before,after:calls.length,unit:CURRENT_USER_PROFILE.unidade};});
  assert.equal(await page.locator('#u-unidade').isDisabled(),true);assert.equal(await page.locator('#u-salvar-unidade').isVisible(),false);assert.equal(state.ok,false);assert.equal(state.before,state.after);assert.equal(state.unit,'ESFSB Cosmos');
 });
 await check('Unidades: offline e erro do servidor não simulam uma alteração salva',async()=>{
  await page.evaluate(()=>{PERMISSOES_ATUAIS.ver_admin=true;window.MODO_OFFLINE=true;ESFUnidades.refresh();});assert.equal(await page.locator('#u-unidade').isDisabled(),true);
  const state=await page.evaluate(async()=>{const before=calls.length;await ESFUnidades.alterar(CURRENT_AUTH_USER_ID,'EAP Boa Vista');const offlineCalls=calls.length-before;window.MODO_OFFLINE=false;_sb.rpc=async()=>({error:{code:'42501'}});ESFUnidades.refresh();const select=document.getElementById('u-unidade');select.value='EAP Boa Vista';const ok=await ESFUnidades.alterar(CURRENT_AUTH_USER_ID,select.value,select);return{ok,offlineCalls,unit:CURRENT_USER_PROFILE.unidade,field:select.value};});
  assert.equal(state.offlineCalls,0);assert.equal(state.ok,false);assert.equal(state.unit,'ESFSB Cosmos');assert.equal(state.field,state.unit);
 });
 await check('Unidades: resposta atrasada não altera a conta seguinte',async()=>{
  const state=await page.evaluate(async()=>{let finish;_sb.rpc=()=>new Promise(r=>finish=r);const pending=ESFUnidades.alterar(CURRENT_AUTH_USER_ID,'EAP Boa Vista');CURRENT_AUTH_USER_ID='synthetic-next';CURRENT_USER_PROFILE={nome:'Próxima conta fictícia',unidade:'ESFSB Jardim Europa'};ESFUnidades.receberPerfil(CURRENT_AUTH_USER_ID,CURRENT_USER_PROFILE.unidade);finish({data:'EAP Boa Vista'});await pending;return CURRENT_USER_PROFILE.unidade;});assert.equal(state,'ESFSB Jardim Europa');
 });
 await check('Interface: notebook mais compacto e fundo restrito ao Início',async()=>{
  await page.evaluate(()=>{go('puericultura');window.scrollTo(0,0);document.getElementById('toast')?.remove();});
  const metrics=await page.evaluate(()=>({title:parseFloat(getComputedStyle(document.querySelector('#pg-puericultura .sh-t')).fontSize),field:parseFloat(getComputedStyle(document.getElementById('pu-nome')).fontSize),width:document.documentElement.scrollWidth}));assert.ok(metrics.title<=24);assert.ok(metrics.field>=13&&metrics.field<15);assert.ok(metrics.width<=1366);
  assert.equal(await page.locator('#ux-home-background').isVisible(),false);await page.screenshot({path:path.join(out,'adaptavel-puericultura.png')});
  await page.evaluate(()=>{go('inicio');window.scrollTo(0,0);});assert.equal(await page.locator('#ux-home-background').isVisible(),true);await page.screenshot({path:path.join(out,'inicio-toledo.png')});
  for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.evaluate(()=>alternarMenuLateral(true));await page.waitForTimeout(250);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width);await page.screenshot({path:path.join(out,`inicio-toledo-${width}.png`)});}
 });
 await check('Unidades: nenhuma exceção JavaScript nos percursos',async()=>assert.deepEqual(errors,[]));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'unidades-browser.json'),JSON.stringify({tests,errors},null,2));}})().catch(e=>{console.error(e);process.exitCode=1;});
