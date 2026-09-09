const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=process.env.ESF_PLAYWRIGHT_PATH?require(process.env.ESF_PLAYWRIGHT_PATH):require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results'),tests=[],errors=[];fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
let browser,page;
async function main(){try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.ESF_BROWSER_CHANNEL==='chromium'?{}:{channel:process.env.ESF_BROWSER_CHANNEL||'msedge'})});
 const context=await browser.newContext({viewport:{width:1366,height:900},timezoneId:'America/Sao_Paulo'});await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 async function login(){await page.evaluate(()=>{CURRENT_AUTH_USER_ID='synthetic-usability';CURRENT_USER_PROFILE={nome:'Profissional Fictício',unidade:'Unidade de Teste'};PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:true,usar_ia_soap:true,usar_modo_teste:true,editar_protocolos:true};window.MODO_OFFLINE=false;_sb=null;document.getElementById('auth-screen').classList.remove('visible');document.querySelectorAll('.edit-modal.open').forEach(e=>e.remove());aplicarPermissoesInterface();});}
 await page.goto(base);await page.waitForTimeout(1500);await login();
 const check=async(name,fn)=>{await fn();tests.push({name,passed:true});console.log('PASS '+name);};
 await check('Interface inicializa e todas as abas usam botões acessíveis',async()=>{
  assert.deepEqual(errors,[]);assert.equal(await page.locator('body.ux-compact').count(),1);assert.equal(await page.locator('.tabs .tab:not(button)').count(),0);assert.equal(await page.locator('button.tab[role=tab]').count(),62);
 });
 await check('24 páginas e 62 abas abrem sem perder o estado ativo',async()=>{
  const ids=await page.locator('.pg').evaluateAll(nodes=>nodes.map(n=>n.id));assert.equal(ids.length,24);
  for(const id of ids){await page.evaluate(id=>go(id.slice(3)),id);const tabs=page.locator('#'+id+' .tabs .tab');for(let i=0;i<await tabs.count();i++){await tabs.nth(i).evaluate(e=>e.click());assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');}}
  assert.deepEqual(errors,[]);
 });
 await check('Risco vazio e parcial têm revisão explícita; critérios elevados permanecem visíveis',async()=>{
  await page.evaluate(()=>{go('pn-abertura');quickLimpar();});assert.match(await page.locator('#ux-risk-state').textContent(),/Ainda não avaliado/);
  await page.locator('#pna-idade').evaluate(e=>{e.value='25';e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.match(await page.locator('#ux-risk-state').textContent(),/Avaliação parcial/);
  await page.evaluate(()=>{document.querySelector('#pna-comorbidades-list [data-comorb="has"]').checked=true;avaliarProtocolosPna();document.querySelector('[aria-controls="pna-5"]').click();});
  assert.match(await page.locator('#pna-risco-automatico').textContent(),/ALTO RISCO/);assert.equal(await page.locator('input[name="risco-pna"]:visible').count(),0);
  await page.screenshot({path:path.join(out,'usabilidade-risco-desktop.png')});
 });
 await check('Revisão perde validade quando os dados mudam; origem leva ao campo correto',async()=>{
  await page.locator('#ux-risk-reviewed').check();assert.match(await page.locator('#ux-risk-state').textContent(),/Dados revisados/);
  await page.locator('#pna-risco-motivos').getByRole('button',{name:'Ver origem'}).first().click();
  assert.equal(await page.locator('#pna-3').evaluate(e=>e.classList.contains('on')),true);
  await page.locator('#pna-comorbidades-list [data-comorb="dm"]').check();assert.equal(await page.locator('#ux-risk-reviewed').isChecked(),false);
 });
 await check('Critério duplicado antigo é migrado para anamnese; desmarcar remove o risco correspondente',async()=>{
  const r=await page.evaluate(()=>{
   const page=document.getElementById('pg-pn-abertura'),manual=[...document.querySelectorAll('.pna-risco-item')].find(e=>e.closest('label').textContent.trim()==='Hipertireoidismo'),auto=document.querySelector('[data-comorb="hipertireoide"]');
   manual.checked=true;auto.checked=false;ESFUsability.restore(page,{});const imported=auto.checked;auto.checked=false;auto.dispatchEvent(new Event('change',{bubbles:true}));
   return{imported,manual:manual.checked,reasons:avaliarProtocolosPna().criterios.map(x=>x.motivo)};
  });assert.equal(r.imported,true);assert.equal(r.manual,false);assert.ok(!r.reasons.includes('Hipertireoidismo'));
 });
 await check('Exame tem uma entrada para estado geral, mucosas e edema; seleção em massa removida',async()=>{
  await page.evaluate(()=>document.querySelector('[aria-controls="pna-4"]').click());
  assert.equal(await page.locator('#clinical-guide-pna-exam #pna-eg:visible').count(),1);assert.equal(await page.locator('#clinical-guide-pna-exam #pna-muc:visible').count(),1);assert.equal(await page.locator('#clinical-guide-pna-exam #pna-edema:visible').count(),1);
  assert.equal(await page.getByRole('button',{name:'Selecionar resultados esperados',exact:true}).count(),0);
  await page.locator('#pna-eg').fill('MEG');await page.locator('#pna-edema').selectOption('+++/4+');
  const r=await page.evaluate(()=>({guide:coletarGuiaClinico('pna'),data:coletarDadosModulo('pna')}));assert.match(r.guide.alertas,/Edema/);assert.equal(r.data['pna-eg'],'MEG');assert.doesNotMatch(r.guide.exame,/Edema|Condicoes gerais/);
  await page.screenshot({path:path.join(out,'usabilidade-exame-desktop.png')});
 });
 await check('Limpeza do guia também limpa a fonte nativa e seus alertas derivados',async()=>{
  await page.evaluate(()=>limparResultadosClinicos('pna','exam'));
  assert.equal(await page.locator('#pna-edema').inputValue(),'');assert.equal(await page.locator('#pna-eg').inputValue(),'');assert.equal(await page.locator('#pna-muc').inputValue(),'');
  assert.equal(await page.locator('#clinical-guide-pna-exam [data-ux-derived].selected').count(),0);
 });
 await check('Achados escolhidos são preservados no registro e restauração, inclusive legado por índice',async()=>{
  const r=await page.evaluate(()=>{
   const page=document.getElementById('pg-pn-abertura'),chip=[...page.querySelectorAll('.clinical-chip')].find(e=>e.dataset.text==='Roncos');chip.click();const data=coletarDadosModulo('pna');chip.classList.remove('selected');restaurarDadosModulo('pna',data);
   const restored=chip.classList.contains('selected'),old=ESFUsability.legacyControls('pna'),field=old.find(e=>e.matches('[data-comorb="asma"]')),idx=old.indexOf(field);restaurarDadosModulo('pna',{['@'+idx]:{checked:true}});
   return{restored,legacy:field.checked};
  });assert.equal(r.restored,true);assert.equal(r.legacy,true);
 });
 await check('Registro antigo não herda dados de outro atendimento já aberto',async()=>{
  await page.evaluate(()=>{document.getElementById('pna-eg').value='Observação de outro atendimento';restaurarDadosModulo('pna',{'pna-nome':'Registro antigo fictício'});});
  assert.equal(await page.locator('#pna-eg').inputValue(),'');assert.equal(await page.locator('#pna-nome').inputValue(),'Registro antigo fictício');
 });
 await check('Limpar remove achados e entradas também do novo rascunho, preservando identificação',async()=>{
  const r=await page.evaluate(()=>{document.getElementById('pna-nome').value='Pessoa fictícia';document.querySelector('#clinical-guide-pna-exam .clinical-chip:not([hidden])').click();quickLimpar();return{selected:document.querySelectorAll('#pg-pn-abertura .selected').length,name:document.getElementById('pna-nome').value,eg:document.getElementById('pna-eg').value,edema:document.getElementById('pna-edema').value,draft:JSON.parse(localStorage.getItem('esf_rascunho_interface_v2:synthetic-usability:pg-pn-abertura'))};});
  assert.equal(r.selected,0);assert.equal(r.name,'Pessoa fictícia');assert.equal(r.eg,'');assert.equal(r.edema,'');assert.deepEqual(r.draft.interface.chips,[]);
 });
 await check('Rascunho inclui checkbox sem ID original e achados; é retomado explicitamente',async()=>{
  await page.evaluate(()=>{document.querySelector('[data-comorb="asma"]').checked=true;document.querySelector('[data-comorb="asma"]').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#clinical-guide-pna-exam .clinical-chip:not([hidden])').click();ESFUsability.saveDraft();});
  await page.reload();await page.waitForTimeout(1500);await login();await page.evaluate(()=>go('pn-abertura'));
  await page.getByRole('button',{name:'Retomar rascunho',exact:true}).click();
  assert.equal(await page.locator('[data-comorb="asma"]').isChecked(),true);assert.ok(await page.locator('#clinical-guide-pna-exam .clinical-chip.selected').count()>0);
 });
 await check('Rascunho de outra conta não é oferecido',async()=>{
  await page.evaluate(()=>{CURRENT_AUTH_USER_ID='other-synthetic-user';ESFUsability.offerDraft('pg-pn-abertura');});assert.equal(await page.getByRole('button',{name:'Retomar rascunho',exact:true}).count(),0);await page.evaluate(()=>CURRENT_AUTH_USER_ID='synthetic-usability');
 });
 await check('Barra destaca revisão e salvamento; copiar tem um único seletor',async()=>{
  await page.evaluate(()=>{document.querySelector('[aria-controls="pna-4"]').click();});assert.equal(await page.locator('#ux-primary').textContent(),'Revisar registro');
  await page.locator('#ux-primary').click();assert.equal(await page.locator('#ux-primary').textContent(),'Salvar atendimento');assert.equal(await page.locator('.ux-copy-menu').isVisible(),true);
  await page.locator('.ux-copy-menu summary').click();assert.equal(await page.locator('#ux-copy-format option').count(),3);await page.keyboard.press('Escape');assert.equal(await page.locator('.ux-copy-menu').getAttribute('open'),null);
 });
 await check('Salvar pelo botão real preserva achados e reabrir reconstrói o atendimento',async()=>{
  await page.evaluate(()=>{
   quickLimpar();
   const values={'pna-nome':'Paciente de teste fictício','pna-cpf':'52998224725','pna-nasc':'1996-04-12','pna-data':'2026-09-08','pna-dum':'2026-01-10','pna-pa':'110/70','pna-peso':'68','pna-alt':'1.64','pna-eg':'BEG, orientada, eupneica','pna-edema':'Ausente','pna-bcf':'145','pna-mf':'Presentes / padrão habitual'};
   Object.entries(values).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.value=v;});
   idadeGest();calcIG('pna');avaliarProtocolosPna();
   const chip=[...document.querySelectorAll('#clinical-guide-pna-exam .clinical-chip')].find(e=>e.dataset.text==='MV+ bilateralmente, sem RA');chip.click();
   for(const [key,id]of Object.entries(SOAP_IDS_MODULO.pna))if(document.getElementById(id))document.getElementById(id).value=key==='p'?'Acompanhamento e retorno registrados para teste fictício.':'Registro fictício para teste de interface.';
   document.querySelector('[aria-controls="pna-6"]').click();
  });
  await page.locator('#ux-primary').click();
  await page.locator('#pre-save-review-ok').check();await page.locator('#pre-save-confirm').click();
  await page.waitForFunction(()=>document.getElementById('ux-save-state').textContent.includes('Salvo no histórico'));
  const r=await page.evaluate(()=>{const item=carregarAtendimentos().find(a=>a.nome==='Paciente de teste fictício');window.uxSavedId=item.id;return{chips:item.dados.__interface.chips.length,soap:item.soap};});assert.ok(r.chips>0);assert.match(r.soap,/Registro fictício/);
  await page.evaluate(()=>{document.getElementById('pna-nome').value='Nome alterado';document.querySelectorAll('#clinical-guide-pna-exam .selected').forEach(e=>e.classList.remove('selected'));reabrirAtendimento(window.uxSavedId);});
  await page.waitForFunction(()=>document.getElementById('pna-nome').value==='Paciente de teste fictício');assert.ok(await page.locator('#clinical-guide-pna-exam .selected').count()>0);
 });
 await check('Estados de histórico e sincronização são distintos; nova edição volta a rascunho',async()=>{
  await page.evaluate(()=>{localStorage.setItem(chaveAtendimentosAtual(),JSON.stringify([{id:'synthetic-record',tipo:'Abertura PN',data:'2026-09-08T12:00:00Z',nome:'Pessoa fictícia',soap:'Registro fictício',profissional:'Profissional fictício',user_id:CURRENT_AUTH_USER_ID,synced:false}]));ESFUsability.onSaved('pna','synthetic-record');});assert.match(await page.locator('#ux-save-state').textContent(),/sincronização pendente/);
  await page.evaluate(()=>{localStorage.setItem(chaveAtendimentosAtual(),JSON.stringify([{id:'synthetic-record',tipo:'Abertura PN',data:'2026-09-08T12:00:00Z',nome:'Pessoa fictícia',soap:'Registro fictício',profissional:'Profissional fictício',user_id:CURRENT_AUTH_USER_ID,synced:true}]));ESFUsability.updateSaveState();});assert.match(await page.locator('#ux-save-state').textContent(),/salvo e sincronizado/);
  await page.locator('#pna-eg').evaluate(e=>{e.value='Nova observação';e.dispatchEvent(new Event('input',{bubbles:true}));});assert.match(await page.locator('#ux-save-state').textContent(),/não finalizadas/);
 });
 await check('Abas funcionam pelo teclado e identificação mantém a consulta ativa',async()=>{
  await page.locator('#pg-pn-abertura .tab').first().focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#pg-pn-abertura .tab').nth(1).getAttribute('aria-selected'),'true');
  await page.locator('#pg-pn-abertura .ux-patient-strip button').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'pna-nome');assert.equal(await page.locator('#pg-pn-abertura').evaluate(e=>e.classList.contains('on')),true);
 });
 await check('24 páginas em 390 e 768 px sem barra cortada ou rolagem horizontal global',async()=>{
  const ids=await page.locator('.pg').evaluateAll(nodes=>nodes.map(n=>n.id));
  for(const width of [768,390]){await page.setViewportSize({width,height:844});await page.waitForTimeout(250);for(const id of ids){await page.evaluate(id=>{go(id.slice(3));atualizarBarraAcoesRapidas();},id);await page.waitForTimeout(40);const r=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,bar:document.getElementById('quick-actions').scrollWidth,barWidth:document.getElementById('quick-actions').clientWidth}));assert.ok(r.document<=width,`${id} ${width}: document ${r.document}`);if(r.barWidth)assert.ok(r.bar<=r.barWidth,`${id} ${width}: bar overflow`);}}
  await page.evaluate(()=>{go('pn-abertura');document.querySelector('#pg-pn-abertura .ux-stage-select').value='pna-5';document.querySelector('#pg-pn-abertura .ux-stage-select').dispatchEvent(new Event('change'));window.scrollTo(0,0);});await page.screenshot({path:path.join(out,'usabilidade-risco-mobile.png')});
 });
 await check('Menu móvel abre, fecha por Escape e não ocupa espaço quando fechado',async()=>{
  await page.getByRole('button',{name:'☰ Menu',exact:true}).click();assert.equal(await page.locator('.bar').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.bar').isVisible(),false);assert.equal(await page.evaluate(()=>parseFloat(getComputedStyle(document.body).paddingLeft)),0);
 });
 await check('Nenhuma exceção JavaScript nos percursos',async()=>assert.deepEqual(errors,[]));
}catch(error){if(page){await page.screenshot({path:path.join(out,'usabilidade-falha.png'),fullPage:false});console.log(await page.evaluate(()=>({body:document.body.className,bar:document.getElementById('quick-actions')?.innerText,errors:document.querySelector('.pg.on')?.id})));}throw error;
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'usability-browser.json'),JSON.stringify({time:new Date().toISOString(),tests,pageErrors:errors},null,2));}console.log(tests.length+' grupos aprovados');}
main().catch(e=>{console.error(e);process.exitCode=1;});
