const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.ESF_PLAYWRIGHT_PATH||'playwright');const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,channel:process.env.ESF_BROWSER_CHANNEL||'chrome'});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForTimeout(1800);
 const result=await page.evaluate(async()=>{
  const unitA='ESFSB Cosmos',unitB='EAP Centro de Saúde de Toledo';
  const login=(id,unit,admin=false)=>{CURRENT_AUTH_USER_ID=id;CURRENT_USER_PROFILE={unidade:unit};PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:admin,nivel_acesso:admin?'gerente_municipal':'enfermeiro'};_sb=null;document.getElementById('auth-screen').classList.remove('visible');ESFEscopo.atualizar();};
  login('a',unitA);localStorage.setItem(PAC_KEY,JSON.stringify({legado:{nome:'Legado sem escopo'}}));
  const legacy=Object.keys(carregarPacientes()).length;salvarPacientesLocal({a:{nome:'Pessoa A',unidade:unitA},b:{nome:'Pessoa B',unidade:unitB}});const onlyA=Object.keys(carregarPacientes());
  const keyA=chavePacientesAtual();salvarAtendimentos([{id:'1',user_id:'a',unidade:unitA},{id:'2',user_id:'a',unidade:unitB},{id:'3',user_id:'b',unidade:unitA}]);clearTimeout(syncTimer);const appointments=carregarAtendimentos().map(x=>x.id);
  go('consulta-geral');document.getElementById('ger-nome').value='Pessoa A';ESFCiap.restore('ger',[{code:'N01',s:'Relato A'}]);
  login('b',unitB);const other=Object.keys(carregarPacientes()).length,cleared=val('ger-nome'),ciap=ESFCiap.capture('ger').length;salvarPacientesLocal({b:{nome:'Pessoa B',unidade:unitB}});
  login('a','');const noUnit=Object.keys(carregarPacientes()).length;
  login('a',unitB);const changed=Object.keys(carregarPacientes()).length;
  login('a',unitA);const restored=Object.keys(carregarPacientes());
  // Falha PostgREST não vira sucesso nem remove o cadastro da fila.
  localStorage.setItem(chavePacientesPendentes(),JSON.stringify(['a']));_sb={from:()=>({upsert:async()=>({error:{code:'42501',message:'RLS'}})})};let denied=false;try{await sincronizarPacientesPendentes();}catch{denied=true;}
  const pending=JSON.parse(localStorage.getItem(chavePacientesPendentes()));
  // Leitura concluída após troca de conta não pode preencher a nova sessão.
  let complete;_sb={from:()=>({select:()=>({order:()=>new Promise(r=>complete=r)})})};const reading=baixarPacientesNuvem();login('b',unitB);complete({data:[{cpf:'secret',unidade:unitA,dados:{nome:'Outra conta'}}],error:null});await reading;const late=Object.keys(carregarPacientes());
  login('manager','',true);salvarPacientesLocal({pending:{nome:'Sem UBS',unidade:null}});abrirPaciente('pending');const control=!!document.getElementById('pac-vinculo-ubs');
  login('b',unitB);abrirPaciente('b');const noControl=!document.getElementById('pac-vinculo-ubs');
  _sb=null;return{legacy,onlyA,keyA,appointments,other,cleared,ciap,noUnit,changed,restored,denied,pending,late,control,noControl};
 });
 assert.equal(result.legacy,0);assert.deepEqual(result.onlyA,['a']);assert.deepEqual(result.appointments,['1']);assert.equal(result.other,0);assert.equal(result.cleared,'');assert.equal(result.ciap,0);assert.equal(result.noUnit,0);assert.equal(result.changed,0);assert.deepEqual(result.restored,['a']);assert.ok(result.denied);assert.deepEqual(result.pending,['a']);assert.deepEqual(result.late,['b']);assert.ok(result.control);assert.ok(result.noControl);assert.deepEqual(errors,[]);
 console.log('PASS UBS navegador: cache isolado, legado ignorado, sem UBS bloqueado, limpeza de tela, filas preservadas, resposta atrasada descartada e vínculo exclusivo da gestão.');
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
