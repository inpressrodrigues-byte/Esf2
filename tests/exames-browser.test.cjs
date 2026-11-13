const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.ESF_PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,channel:process.env.ESF_BROWSER_CHANNEL||'chrome'});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForSelector('#smu-ciap-painel',{state:'attached'});
 await page.evaluate(()=>{CURRENT_AUTH_USER_ID='synthetic-exams';PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:true};_sb=null;document.getElementById('auth-screen').classList.remove('visible');window.setFields=o=>Object.entries(o).forEach(([id,v])=>{const e=document.getElementById(id);if(!e)throw Error('Missing '+id);e.value=v;});go('saude-mulher');});
 assert.equal(await page.locator('.consultation-protocol').count(),13);
 assert.equal(await page.locator('.consultation-guide:visible').count(),0);
 for(const [route,p,stage,reason] of [
   ['pn-abertura','pna','3','Disúria'],['pn-consulta','pnc','2','Disúria'],['puericultura','pu','2','Disúria'],
   ['preventivo','prev','2','Otalgia'],['idoso','id','2','Constipação'],['saude-mental','sm','2','Sofrimento mental'],
   ['saude-mulher','smu','aval','Otalgia'],['consulta-geral','ger','aval','Dor torácica'],['hiperdia','hip','aval','Otalgia'],
   ['feridas','fer','aval','Febre'],['puerperio','puerp','aval','Otalgia'],['ist','ist','aval','Otalgia'],['visita-domiciliar','vd','aval','Disúria']
 ]){
   await page.evaluate(({route,p})=>{go(route);restaurarDadosModulo(p,{});},{route,p});
   await page.locator('[aria-controls="'+p+'-'+stage+'"]').click();
   const pane=page.locator('#'+p+'-'+stage),panel=page.locator('#'+p+'-protocolo-atual');
   const native=p==='ger'?pane.locator('.complaint-chip').filter({hasText:/^Dor torácica$/}):p==='pnc'?pane.getByRole('checkbox',{name:'Disúria / ITU'}):null;
   const pick=async()=>{if(native){await native.click();return;}await pane.locator('.protocol-picker>summary').click();await pane.locator('.protocol-picker [data-reason="'+reason+'"]').click();};
   if(p==='vd')await page.locator('#vd-queixa').fill('Revisão de cuidados');
   await pick();await panel.getByRole('heading',{name:reason==='Disúria'?/urinári/i:reason,exact:false}).first().waitFor({timeout:4000});
   assert.ok(await panel.evaluate((el,id)=>el.closest('.tp')?.id===id,p+'-'+stage),p+' protocolo na própria etapa');
   assert.match(await panel.innerText(),/Exames e avaliação/);
   if(p==='pna'||p==='pnc')assert.match(await panel.innerText(),/gestação[\s\S]*urocultura/i);
   if(p==='pu')assert.match(await panel.innerText(),/pediátrica/);
   assert.equal(await page.evaluate(p=>ESFExames.order(p),p),null);
   if(p==='vd'){
     const stored=await page.evaluate(()=>coletarDadosModulo('vd'));assert.match(stored['vd-queixa'],/Revisão de cuidados\nDisúria/);
     await page.locator('[aria-controls="vd-prio"]').click();await panel.getByRole('heading',{name:/urinári/i}).waitFor();
     await page.locator('[aria-controls="vd-aval"]').click();
   }
   await pick();await panel.getByRole('heading',{name:reason==='Disúria'?/urinári/i:reason}).first().waitFor({state:'hidden',timeout:4000});
   if(p==='vd')assert.equal(await page.locator('#vd-queixa').inputValue(),'Revisão de cuidados');
   console.log('PASS '+route+' → '+reason+' → orientação na avaliação → desmarcação');
 }
 await page.evaluate(()=>go('saude-mulher'));
 await page.evaluate(()=>{restaurarDadosModulo('smu',{'smu-guide-motivo':'iniciar','smu-motivo-consulta':'iniciar'});});
 assert.match(await page.locator('#smu-protocolo-atual').innerText(),/Anticoncepção/);
 await page.evaluate(()=>restaurarDadosModulo('smu',{'smu-nome':'Registro legado fictício'}));assert.equal(await page.inputValue('#smu-guide-motivo'),'');
 console.log('PASS Um ponto de orientação por consulta e restauração de históricos');
 await page.evaluate(()=>{go('preventivo');document.querySelector('input[name="prev-motivo"][value="rastr"]').click();});assert.ok(await page.evaluate(()=>ESFCiap.suggestModule('prev').some(c=>c.code==='A98')));
 await page.evaluate(()=>{go('pn-abertura');setFields({'pna-nome':'Registro sintético exames','pna-data':'2026-11-05','pna-ig':'22s0d','pna-exkit-diabetes':'Não','pna-exkit-rh':'negativo','pna-exkit-coombs':'negativo','pna-exkit-toxo':'imune','pna-exkit-totg':'Não'});ESFExames.build('pna','pn2');});
 assert.equal(await page.evaluate(()=>ESFExames.cart('pna').find(x=>x.id==='totg').date),'2026-11-19');
 assert.equal(await page.evaluate(()=>ESFExames.cart('pna').find(x=>x.id==='toxo').status),'revisar');
 await page.evaluate(()=>{document.getElementById('pna-nome').value='';ESFExames.confirm('pna');document.getElementById('pna-nome').value='Registro sintético exames';});assert.equal(await page.evaluate(()=>ESFExames.order('pna')),null);
 await page.evaluate(()=>{document.getElementById('pna-exkit-revisado').checked=true;ESFExames.confirm('pna');});
 assert.ok(await page.evaluate(()=>ESFExames.order('pna')));assert.match(await page.inputValue('#pna-soap-p'),/Solicitações de exames/);
 const first=await page.evaluate(()=>ESFExames.requestText('pna'));assert.match(first,/19\/11\/2026/);assert.doesNotMatch(first,/Toxoplasmose IgG/);
 await page.evaluate(()=>{ESFExames.appendSoap('pna');ESFExames.appendSoap('pna');});assert.equal((await page.inputValue('#pna-soap-p')).split('[Solicitações de exames]').length,2);
 assert.equal(await page.evaluate(()=>{document.getElementById('pna-exkit-diabetes').value='Sim';return ESFExames.validate('pna');}),false);
 assert.equal(await page.evaluate(()=>ESFExames.requestText('pna')),'');
 await page.evaluate(()=>{document.getElementById('pna-exkit-revisado').checked=true;ESFExames.confirm('pna');});assert.equal(await page.evaluate(()=>ESFExames.validate('pna')),false);
 console.log('PASS Kit trimestral, data-alvo, confirmação, SOAP sem duplicação e bloqueio após mudança clínica');
 await page.evaluate(()=>{go('consulta-geral');setFields({'ger-nome':'Registro sintético urinário','ger-queixa':'Disúria há dois dias','ger-exkit-scope':'mulher','ger-exkit-gestante':'Não','ger-exkit-alerta':'Não','ger-exkit-ituSimples':'Não','ger-exkit-ituCultura':'Sim'});ESFCiap.restore('ger',[{code:'U01',s:'Disúria',o:'',a:'Queixa em avaliação',p:'Avaliação clínica'}]);ESFExames.build('ger','itu');});
 await page.evaluate(()=>{const rows=ESFExames.cart('ger');rows.forEach(x=>x.ciap='U01');document.getElementById('ger-exkit-cart').value=JSON.stringify(rows);document.getElementById('ger-exkit-revisado').checked=true;ESFExames.confirm('ger');});
 assert.equal(await page.evaluate(()=>ESFExames.order('ger').items.length),2);assert.match(await page.evaluate(()=>ESFCiap.capture('ger')[0].p),/Urocultura/);
 const saved=await page.evaluate(()=>coletarDadosModulo('ger'));await page.evaluate(data=>restaurarDadosModulo('ger',data),saved);assert.equal(await page.evaluate(()=>ESFExames.validate('ger',true)),true);
 await page.evaluate(()=>{window.examCopies=[];window.copiarTextoSeguro=t=>examCopies.push(t);document.getElementById('ger-exkit-gestante').value='Sim';[...document.querySelectorAll('#ger-ciap-selecionados button')].find(b=>b.textContent==='Copiar SOAP deste CIAP').click();});assert.equal(await page.evaluate(()=>examCopies.length),0);
 await page.evaluate(data=>restaurarDadosModulo('ger',data),saved);
 const popupPromise=page.waitForEvent('popup');await page.evaluate(()=>document.querySelector('#ger-exkit-painel [data-ex-action="print"]').click());const popup=await popupPromise;await popup.waitForLoadState();assert.match(await popup.locator('body').innerText(),/SOLICITAÇÃO DE EXAMES[\s\S]*Urocultura/);await popup.close();
 await page.evaluate(()=>document.querySelector('#ger-exkit-painel [data-ex-action="removeOrder"]').click());assert.doesNotMatch(await page.inputValue('#ger-p'),/Solicitações de exames/);assert.doesNotMatch(await page.evaluate(()=>ESFCiap.capture('ger')[0].p),/Solicitações de exames/);
 console.log('PASS ITU → CIAP → SOAP → persistência → pedido imprimível; revisão obrigatória após mudança');
 await page.evaluate(()=>{restaurarDadosModulo('ger',{'ger-nome':'Registro sintético de fluxo','ger-queixa':'Disúria sem febre'});});await page.evaluate(()=>document.querySelector('[aria-controls="ger-aval"]').click());
 const guidance=page.locator('#ger-protocolo-atual');
 await guidance.getByRole('button',{name:'Revisar pedido de exames'}).click();assert.equal(await page.inputValue('#ger-exkit-kit'),'itu');
 for(const [key,val] of Object.entries({scope:'mulher',gestante:'Não',alerta:'Não',ituSimples:'Não',ituCultura:'Sim'}))await page.selectOption('#ger-exkit-'+key,val);
 await page.locator('#ger-exkit-painel [data-ex-action=confirm]').click();assert.deepEqual(await page.evaluate(()=>ESFExames.order('ger').items.map(i=>i.id)),['eas','cultura']);
 console.log('PASS Botões reais preparam e atualizam o kit após completar o contexto clínico');
 await page.evaluate(()=>{go('pn-consulta');restaurarDadosModulo('pnc',{'pnc-nome':'Registro sintético vazio'});gerarSoapAutomatoPnc();});const empty=await page.inputValue('#pnc-s');assert.doesNotMatch(empty,/Cefaleia|Disúria|Sangramento vaginal/);
 await page.evaluate(()=>gerarSoapAutomatoPnc());assert.doesNotMatch(await page.inputValue('#pnc-s'),/GPA.*(?:Revisar|Solicita)/);
 console.log('PASS Pré-natal vazio não inventa sintomas nem reutiliza plano como paridade');
 await page.evaluate(()=>{go('consulta-geral');restaurarDadosModulo('ger',{});document.querySelector('[aria-controls="ger-aval"]').click();});
 await page.locator('#pg-consulta-geral button.complaint-chip').filter({hasText:/^Disúria$/}).click();
 const preg=page.locator('#ger-alertas-dinamicos button').filter({hasText:/^Gestante$/});await preg.click();
 await page.waitForFunction(()=>document.getElementById('ger-protocolo-atual').textContent.includes('Queixa urinária na gestação'));
 assert.match(await guidance.innerText(),/EAS e urocultura com antibiograma/);assert.match(await guidance.innerText(),/avaliação médica/);
 await page.locator('#pg-consulta-geral button.complaint-chip').filter({hasText:/^Cefaleia$/}).click();assert.equal(await preg.evaluate(b=>b.classList.contains('selected')),true);
 await page.waitForFunction(()=>document.getElementById('ger-protocolo-atual').textContent.includes('Cefaleia'));await page.locator('#ger-alertas-dinamicos button').filter({hasText:/^Febre$/}).click();await page.waitForFunction(()=>document.getElementById('ger-protocolo-atual').textContent.includes('por sinal de alarme'));assert.doesNotMatch(await guidance.innerText(),/500 mg/);
 await page.evaluate(()=>{go('puericultura');const e=document.getElementById('pu-manual-queixa');e.value='Disúria';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.waitForFunction(()=>document.getElementById('pu-protocolo-atual').textContent.includes('pediátrica'));assert.doesNotMatch(await page.locator('#pu-protocolo-atual').innerText(),/cefalexina|nitrofurantoína/i);
 await page.evaluate(()=>{const e=document.getElementById('pu-manual-queixa');e.value='Nega disúria';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.waitForFunction(()=>document.getElementById('pu-protocolo-atual').hidden);
 console.log('PASS Queixas simultâneas, gestação e febre marcadas no atendimento, criança e sintoma negado');
 await page.evaluate(()=>{go('consulta-geral');restaurarDadosModulo('ger',{});document.querySelector('[aria-controls="ger-aval"]').click();});
 const chip=name=>page.locator('#pg-consulta-geral .complaint-chip').filter({hasText:new RegExp('^'+name+'$')});
 await chip('Dor torácica').click();await guidance.getByText(/ECG em até 10 minutos/).waitFor();
 await chip('Dor torácica').click();await chip('Parasitoses intestinais').click();
 await guidance.getByText(/Parasitológico de fezes na investigação/).waitFor();
 await guidance.getByRole('button',{name:'Revisar pedido de exames'}).click();
 assert.deepEqual(await page.evaluate(()=>ESFExames.cart('ger').filter(x=>x.status==='solicitar').map(x=>x.id)),['epf']);
 await page.evaluate(()=>{go('saude-mulher');restaurarDadosModulo('smu',{});document.querySelector('[aria-controls="smu-aval"]').click();});
 const women=page.locator('#smu-protocolo-atual');
 await page.locator('#pg-saude-mulher .complaint-chip').filter({hasText:/^Dor pélvica$/}).click();await women.getByText(/Suspeita de gravidez ectópica/).waitFor();
 await page.selectOption('#smu-gestante','Sim');await page.selectOption('#smu-diagnostico-confirmado',{label:'Candidíase vulvovaginal'});
 await women.getByText(/Miconazol.*10 dias/).waitFor();assert.doesNotMatch(await women.innerText(),/fluconazol/i);
 console.log('PASS Tratamento e exames no clique: dor torácica, EPF, dor pélvica e candidíase na gestação');
 await page.evaluate(()=>{go('ist');document.querySelector('[aria-controls="ist-aval"]').click();});await page.selectOption('#ist-diagnostico-sindromico',{label:'Diagnóstico clínico confirmado: Candidíase complicada ou recorrente'});
 await page.locator('#ist-protocolo-atual').getByText(/Individualizar a conduta/).waitFor();assert.doesNotMatch(await page.locator('#ist-protocolo-atual').innerText(),/Miconazol/);
 await page.evaluate(()=>{go('hiperdia');document.querySelector('[aria-controls="hip-aval"]').click();});await page.selectOption('#hip-condicao-protocolar',{label:'Bócio multinodular'});
 await page.locator('#hip-protocolo-atual').getByRole('heading',{name:'Bócio multinodular'}).waitFor();assert.match(await page.locator('#hip-protocolo-atual').innerText(),/TSH/);
 const printReady=page.waitForEvent('popup');
 await page.evaluate(()=>{const open=window.open;window.open=function(...args){const popup=open.apply(this,args);popup.print=()=>{popup.__printRequested=true;};return popup;};const d=dadosLaudoTR('tr-p',true);abrirLaudosTR([paginaLaudoTR({...d,nome:'Paciente sintética',unidade:'Unidade de teste'}),paginaLaudoTR({...d,nome:'Parceria sintética'})]);});
 const report=await printReady;await report.waitForFunction(()=>window.__printRequested&&document.querySelectorAll('header img').length===2&&[...document.querySelectorAll('header img')].every(img=>img.complete&&img.naturalWidth===482));assert.equal(await report.locator('header img').count(),2);assert.match(await report.locator('header').first().innerText(),/Unidade de teste/);assert.equal(await report.locator('img.family').count(),0);assert.match(await report.locator('.page').first().innerText(),/TESTE NÃO REALIZADO/);
 if(process.env.ESF_SCREENSHOT_DIR){fs.mkdirSync(process.env.ESF_SCREENSHOT_DIR,{recursive:true});await report.pdf({path:path.join(process.env.ESF_SCREENSHOT_DIR,'laudos-municipais.pdf'),preferCSSPageSize:true,printBackground:true});}await report.close();
 console.log('PASS Marca municipal na impressão dos laudos da pessoa e da parceria');
 await page.evaluate(()=>{go('consulta-geral');document.querySelector('[aria-controls="ger-aval"]').click();});
 const out=process.env.ESF_SCREENSHOT_DIR;if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'consulta-desktop.png'),fullPage:false});}
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);if(out)await page.screenshot({path:path.join(out,'consulta-mobile.png'),fullPage:false});
 await page.setViewportSize({width:1440,height:1000});await require('./entrevista.cjs')(page);
 assert.deepEqual(errors,[]);console.log('PASS Layout responsivo sem rolagem horizontal e sem erros de JavaScript');
 }finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
