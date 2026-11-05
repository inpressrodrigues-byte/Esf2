const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.ESF_PLAYWRIGHT_PATH||'playwright');const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,channel:process.env.ESF_BROWSER_CHANNEL||'chrome'});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForSelector('#pna-ciap-painel',{state:'attached'});
 await page.evaluate(()=>{CURRENT_AUTH_USER_ID='synthetic-pn-corr';PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_historico:true,ver_admin:true,usar_ia_soap:true};_sb=null;document.getElementById('auth-screen').classList.remove('visible');go('pn-abertura');});
 for(const p of ['pna','pnc']){
  assert.equal(await page.locator('#'+p+'-corr-painel').count(),1);
  assert.equal(await page.evaluate(p=>ESFUsability.legacyControls(p).some(e=>e.closest('.pn-corr')),p),false);
 }
 const ids=await page.locator('.pn-corr [id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(ids.length,new Set(ids).size);
 for(const p of ['pna','pnc']){
  await page.evaluate(p=>go(p==='pna'?'pn-abertura':'pn-consulta'),p);await page.locator('[aria-controls="'+p+(p==='pna'?'-3':'-2')+'"]').click();
  await page.locator('#'+p+'-corr-abrir').click();assert.equal(await page.locator('#'+p+'-corr-ativo').inputValue(),'Sim');await page.locator('#'+p+'-corr-aspecto').selectOption('grumoso');await page.locator('#'+p+'-corr-prurido').selectOption('Sim');await page.waitForTimeout(150);
  await page.locator('#'+p+'-corr-painel [data-pn-corr-diagnosis="cand"]').click();await page.waitForTimeout(150);
  assert.equal(await page.locator('#'+p+'-corr-confirmado').inputValue(),'Não');assert.equal(await page.locator('#'+p+'-corr-painel [data-pn-corr-regimen="cand-top"]').isDisabled(),true);
  await page.evaluate(p=>{const set=(id,value)=>document.getElementById(p+'-'+id).value=value;
   const d=new Date();d.setDate(d.getDate()-140);set('dum',d.toISOString().slice(0,10));calcIG(p);set('nome','Gestante sintética '+p);set('nasc','1996-01-01');set('pa','110/70');set('bcf','145');set('temp','36.5');set('queixas','Nega febre. Refere prurido e corrimento.');
   for(const [id,value]of Object.entries({relato:'Corrimento e prurido há três dias',exame:'Sim',achados:'Corrimento grumoso e eritema vulvar',lactante:'Não',alergia:'Não',complicado:'Não',interacoes:'Sim',dor:'Não',mobilizacao:'Não',sangra:'Não',perdaliquido:'Não',violencia:'Não',diagnostico:'cand',confirmado:'Sim',duracao:'10'}))set('corr-'+id,value);ESFCorrimentoPN.render(p);
  },p);
  assert.deepEqual(await page.evaluate(p=>ESFCorrimentoPN.state(p).e.pending,p),[]);
  assert.equal(await page.locator('#'+p+'-corr-painel [data-pn-corr-regimen="cand-flu"]').count(),0);
  await page.locator('#'+p+'-corr-painel [data-pn-corr-regimen="cand-top"]').click();assert.equal(await page.evaluate(p=>ESFCiap.capture(p)[0].code,p),'X72');
  await page.evaluate(p=>p==='pna'?gerarSoapAutomatoPna():gerarSoapAutomatoPnc(),p);await page.waitForTimeout(700);
  const soap=await page.evaluate(p=>Object.fromEntries(Object.entries(SOAP_IDS_MODULO[p]).map(([k,id])=>[k,document.getElementById(id).value])),p);
  assert.match(soap.s,/pré-natal/);assert.match(soap.s,/Refere prurido e corrimento/i);assert.doesNotMatch(soap.s,/Nega queixas no momento/);assert.match(soap.o,/145/);assert.match(soap.o,/grumoso/);assert.match(soap.p,/Miconazol.*10 dias/);assert.doesNotMatch(soap.p,/Fluconazol|Itraconazol|doxiciclina/);assert.equal(await page.evaluate(p=>ESFCorrimentoPN.validate(p,true),p),true);
  const saved=await page.evaluate(p=>coletarDadosModulo(p),p);await page.evaluate(({p,saved})=>restaurarDadosModulo(p,saved),{p,saved});assert.equal(await page.evaluate(p=>ESFCorrimentoPN.state(p).stale,p),false);
  await page.evaluate(p=>{document.getElementById(p+'-corr-perdaliquido').value='Sim';ESFCorrimentoPN.render(p);},p);
  assert.equal(await page.evaluate(p=>ESFCorrimentoPN.validate(p,true),p),false);assert.equal(await page.locator('#'+p+'-corr-painel [data-pn-corr-regimen="cand-top"]').isDisabled(),true);
  const aiGuard=await page.evaluate(async()=>{const original=window.exigirPermissao;let calls=0;window.exigirPermissao=()=>{calls++;return false;};try{await gerarSoapPorIA();return calls;}finally{window.exigirPermissao=original;}});assert.equal(aiGuard,0,'IA real para antes de iniciar transporte quando o esquema está desatualizado');
  await page.evaluate(p=>{document.getElementById(p+'-corr-perdaliquido').value='Não';if(p==='pna'){const e=[...document.querySelectorAll('#clinical-guide-pna-anamnesis .clinical-chip')].find(x=>x.dataset.text==='Perda de líquido');e.click();}else {const e=[...document.querySelectorAll('#pnc-queixas-gin input')].find(x=>x.closest('label').textContent.includes('Perda de líquido'));e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));}ESFCorrimentoPN.render(p);},p);
  assert.ok((await page.evaluate(p=>ESFCorrimentoPN.state(p).e.pending,p)).some(x=>/Perda de líquido/.test(x)));
  await page.evaluate(()=>quickLimpar());assert.equal(await page.evaluate(p=>ESFCorrimentoPN.state(p).r,p),null);assert.deepEqual(await page.evaluate(p=>ESFCiap.capture(p),p),[]);
 }
 // Atendimentos e Saúde da Mulher não compartilham estado clínico.
 assert.equal(await page.locator('#pna-corr-ativo').inputValue(),'');assert.equal(await page.locator('#smu-gestante').inputValue(),'');
 await page.evaluate(()=>{go('pn-consulta');gerarSoapAutomatoPnc();});assert.doesNotMatch(await page.locator('#pnc-p').inputValue(),/\[Corrimento na gestação\]/,'Pré-natal sem avaliação de corrimento não ganha tratamento');
 await page.evaluate(()=>{go('pn-consulta');const e=[...document.querySelectorAll('#pnc-queixas-gin input')].find(x=>x.closest('label').textContent.includes('Corrimento vaginal alterado'));e.click();});
 assert.equal(await page.locator('#pnc-corr-ativo').inputValue(),'Sim');
 await page.evaluate(()=>{document.getElementById('pnc-queixas').value='Nega corrimento';ESFCorrimentoPN.render('pnc');});assert.ok((await page.evaluate(()=>ESFCorrimentoPN.state('pnc').e.pending)).some(x=>x.includes('Concilie')));
 await page.locator('[aria-controls="pnc-2"]').click();await page.locator('#pnc-corr-painel').scrollIntoViewIfNeeded();if(process.env.ESF_PN_SCREENSHOTS){fs.mkdirSync(process.env.ESF_PN_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.ESF_PN_SCREENSHOTS,'corrimento-pn-desktop.png')});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{if(!document.body.classList.contains('sidebar-collapsed'))alternarMenuLateral();});await page.locator('#pnc-corr-painel').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);if(process.env.ESF_PN_SCREENSHOTS)await page.screenshot({path:path.join(process.env.ESF_PN_SCREENSHOTS,'corrimento-pn-mobile.png')});
 assert.deepEqual(errors,[]);console.log('PASS corrimento PN: abertura e seguimento, hipóteses, gestação fixa, bloqueios, SOAP integrado, CIAP, restauração, limpeza e isolamento.');
 }finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
