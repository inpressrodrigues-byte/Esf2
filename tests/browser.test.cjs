/* Regressões com pessoas fictícias. Nenhuma requisição externa é permitida. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm');
let chromium;try{({chromium}=require('playwright'));}catch(error){if(!process.env.ESF_PLAYWRIGHT_PATH)throw Error('Instale as dependências com npm ci antes de testar o navegador.',{cause:error});({chromium}=require(process.env.ESF_PLAYWRIGHT_PATH));}
const repo=path.resolve(__dirname,'..'),output=path.join(repo,'test-results');fs.mkdirSync(output,{recursive:true});
const results={time:new Date().toISOString(),environment:'isolado, dados sintéticos, rede externa bloqueada',tests:[],pageErrors:[],visual:[]};
const server=http.createServer((req,res)=>{const file=path.resolve(repo,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(repo+path.sep)){res.writeHead(403).end();return;}try{const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.pdf':'application/pdf'};res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
async function main(){
 let browser;
 const check=async(name,fn)=>{try{await fn();results.tests.push({name,passed:true});console.log('PASS '+name);}catch(e){results.tests.push({name,passed:false,error:e.message});console.error('FAIL '+name+': '+e.message);}};
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const options={headless:true};if(process.env.ESF_BROWSER_CHANNEL!=='chromium')options.channel=process.env.ESF_BROWSER_CHANNEL||'msedge';browser=await chromium.launch(options);
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'America/Sao_Paulo'});
  await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  const page=await ctx.newPage();page.on('pageerror',e=>results.pageErrors.push(String(e)));page.on('console',m=>{if(m.text().includes('Falha ao preparar SINAN'))console.error(m.text());});page.on('dialog',d=>d.dismiss());
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForTimeout(1300);
  await page.evaluate(()=>{
   window.T={set(id,value){const e=document.getElementById(id);if(!e)throw Error('Campo ausente '+id);if(e.type==='checkbox')e.checked=!!value;else e.value=value;return e;},eq(a,b,msg=''){if(JSON.stringify(a)!==JSON.stringify(b))throw Error(msg+' esperado '+JSON.stringify(b)+' recebido '+JSON.stringify(a));},ok(v,msg){if(!v)throw Error(msg||'Condição falsa');},clear(id){const p=document.getElementById('pg-'+id);p.querySelectorAll('input,textarea,select').forEach(e=>{if(e.type==='checkbox'||e.type==='radio')e.checked=false;else if(e.type!=='file')e.value='';});p.querySelectorAll('.clinical-chip.selected,.complaint-chip.selected,.alert-chip.selected').forEach(e=>e.classList.remove('selected'));delete p.dataset.userEdited;delete p.dataset.draftChecked;}};
   CURRENT_AUTH_USER_ID='synthetic-a';CURRENT_USER_PROFILE={nome:'Profissional Fictício',cargo:'Enfermeiro',unidade:'Laboratório de teste'};PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:true,usar_modo_teste:true,usar_ia_soap:true,editar_protocolos:true,gerar_documentos:true};
   document.getElementById('auth-screen').classList.remove('visible');document.querySelectorAll('.edit-modal.open').forEach(e=>e.classList.remove('open'));aplicarPermissoesInterface();
  });
  for(const [name,fn] of require('./browser-cases.cjs'))await check(name,()=>page.evaluate(fn));
  await check('24 telas abrem sem IDs duplicados e com controles nomeados',async()=>{
   const pages=await page.evaluate(()=>[...document.querySelectorAll('.pg')].map(e=>e.id));assert.equal(pages.length,24);
   for(const id of pages){await page.evaluate(id=>{go(id.slice(3));scrollTo(0,0);},id);await page.waitForTimeout(40);
    const r=await page.evaluate(id=>{const p=document.getElementById(id);return {id,visible:p.getBoundingClientRect().height>0,unlabelled:[...p.querySelectorAll('input,select,textarea')].filter(e=>e.type!=='hidden'&&e.getBoundingClientRect().height>0&&!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>({id:e.id,html:e.outerHTML,context:e.parentElement.outerHTML.slice(0,900)}))};},id);results.visual.push(r);assert.equal(r.visible,true,id);assert.deepEqual(r.unlabelled,[],id);
   }
   assert.deepEqual(await page.evaluate(()=>Object.entries([...document.querySelectorAll('[id]')].reduce((a,e)=>(a[e.id]=(a[e.id]||0)+1,a),{})).filter(([k,v])=>v>1)),[]);
  });
  await check('abas funcionam com setas no teclado',async()=>{await page.evaluate(()=>go('pn-abertura'));const tabs=page.locator('#pg-pn-abertura .tab');await tabs.first().click();await tabs.first().focus();await page.keyboard.press('ArrowRight');assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');assert.equal(await tabs.nth(1).evaluate(e=>document.activeElement===e),true);});
  await check('celular 390 e tablet 768 sem rolagem horizontal',async()=>{
   for(const width of [390,768]){await page.setViewportSize({width,height:844});await page.evaluate(()=>{go('pn-abertura');document.querySelector('#pg-pn-abertura .tab').click();scrollTo(0,0);});await page.waitForTimeout(180);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(output,'pn-'+width+'.png')});}
   await page.setViewportSize({width:390,height:844});await page.locator('#mobile-menu-button').click();assert.equal(await page.locator('#mobile-menu-button').getAttribute('aria-expanded'),'true');assert.ok(await page.locator('.bar .nb').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=12));await page.keyboard.press('Escape');
  });
  await check('nenhuma exceção JavaScript em execução',()=>assert.deepEqual(results.pageErrors,[]));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(output,'browser.json'),JSON.stringify(results,null,2));}
 const failures=results.tests.filter(t=>!t.passed);console.log(`${results.tests.length-failures.length}/${results.tests.length} grupos aprovados`);if(failures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;server.close();});
