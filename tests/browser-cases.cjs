module.exports=[
 ['Finalização: ações reais de salvar e copiar são bloqueadas sem revisão',async()=>{
  T.clear('idoso');go('idoso');_sb=null;const key=chaveAtendimentosAtual(),before=localStorage.getItem(key);let copied=false;const old=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{copied=true;};
  try{await salvarAtendimentoModulo('Idoso');quickCopiarEvolucao();T.eq(localStorage.getItem(key),before);T.eq(copied,false);}finally{navigator.clipboard.writeText=old;}
 }],
 ['PN: sintomas não marcados não entram no SOAP; negação mista preservada',()=>{
  T.clear('pn-consulta');go('pn-consulta');gerarSoapAutomatoPnc();const ids=SOAP_IDS_MODULO.pnc;T.ok(!/cefaleia|sangramento|disuria/i.test(document.getElementById(ids.s).value),'Sintoma não marcado entrou no subjetivo');
  T.set('pnc-queixas','Nega sangramento, mas refere cefaleia intensa e escotomas');gerarSoapAutomatoPnc();const s=document.getElementById(ids.s).value;T.ok(/cefaleia intensa e escotomas/.test(s),'Sintoma positivo perdido');T.ok(!/Nega queixas/.test(s));
 }],
 ['PN: Hb, glicose e tireoide chegam ao SOAP e evitam novo TOTG',async()=>{
  T.clear('pn-consulta');go('pn-consulta');T.set('pnc-ig','26 semanas');document.querySelector('#exr-hb .ex-val').value='7';document.querySelector('#exr-glic .ex-val').value='100';document.querySelector('#exr-tsh .ex-val').value='12';await callAIExames('pnc');gerarSoapAutomatoPnc();const soap=textoSoapAtual(false);for(const text of ['Hemoglobina 7','Glicemia de jejum 100','TSH 12','2 mcg/kg/dia','não repetir'])T.ok(soap.includes(text),text+' ausente');T.ok(!/solicitar TOTG/i.test(soap));
 }],
 ['Exames: Hb 11 normal, negativos não críticos, motores concordantes',async()=>{
  T.clear('pn-consulta');document.querySelector('#exr-hb .ex-val').value='11';await callAIExames('pnc');T.ok(EXAMES_PADRAO.pnc.classificados.every(x=>x.nivel==='ok'));for(const s of ['HIV: não reagente.','VDRL: nao reagente.'])T.eq(classificarAchadoLaboratorial(s),'ok');
  for(const n of [7,7.9,8,8.9,9,9.9,10,11]){document.querySelector('#exr-hb .ex-val').value=String(n);await callAIExames('pnc');const cards=condutasGestanteProtocoladas([{exame:'Hemoglobina',numerico:n}]);T.eq(cards.length,n<11?1:0);if(cards.length)T.eq(cards[0].achado,EXAMES_PADRAO.pnc.classificados[0].texto);}
 }],
 ['IST: negação não prescreve e diagnóstico explícito prevalece',()=>{
  const neg=condutaProtocoladaModulo('ist','Nega candidíase, sem corrimento e sem prurido');T.ok(!neg.protocolada,'Nega candidíase acionou protocolo');
  const vb=condutaProtocoladaModulo('ist','Diagnóstico clínico confirmado: Vaginose bacteriana; prurido vulvovaginal');T.ok(/metronidazol/i.test(JSON.stringify(vb)),'Vaginose não selecionada');T.ok(!/fluconazol/i.test(JSON.stringify(vb)),'Prurido sobrepôs diagnóstico');
 }],
 ['Triagem: 15 cenários, sinais numéricos e modo auditoria',()=>{
  go('consulta-geral');for(const [name,q,a,expected]of AUDITORIA_CENARIOS){T.clear('consulta-geral');T.set('ger-complaints',q);renderAlertasAcolhimento('ger');T.set('ger-alerts',a);T.eq(corDemandaPorDados().cor,expected,name);}
  T.clear('consulta-geral');T.set('ger-complaints','Dispneia');T.set('ger-sat','80');T.eq(corDemandaPorDados().cor,'Vermelho');
  T.clear('consulta-geral');T.set('ger-complaints','Cefaleia');T.set('ger-pa','220/130');T.eq(corDemandaPorDados().cor,'Vermelho');T.set('ger-modo','Modo auditoria');avaliarDemandaEspontanea();
 }],
 ['Triagem: fonte dos 33 temas e critérios selecionados por categoria',()=>{
  T.eq(Object.keys(DEMANDA_FLUXOS).length,35);T.eq(PROTOCOLOS_OFICIAIS.length,66);T.eq(PROTOCOLOS_ESF_AUDITORIA_2026.length,66);
  for(const [q,f]of Object.entries(DEMANDA_FLUXOS)){T.eq(f.criterios.length,4,q);T.ok(f.url.includes('#page=')&&f.pagina>0,q);for(const c of f.criterios){T.ok(c.texto.length>10,q);T.clear('consulta-geral');T.set('ger-complaints',q);T.set('ger-achado-criterio','Achado sintético conferido no quadro municipal');selecionarCriterioMunicipal(q,c.id,true);T.eq(corDemandaPorDados().cor,c.cor,q);}}
 }],
 ['Triagem: critério automático acompanha mudança de queixa',()=>{
  T.clear('consulta-geral');T.set('ger-complaints','Demanda administrativa');avaliarDemandaEspontanea();const before=val('ger-criterio-classificacao');T.set('ger-complaints','Dor torácica');renderAlertasAcolhimento('ger');T.set('ger-alerts','Sudorese');avaliarDemandaEspontanea();T.ok(val('ger-criterio-classificacao')!==before,'Critério antigo permaneceu');T.ok(!/Demanda administrativa/.test(val('ger-criterio-classificacao')));
 }],
 ['Validação: tela vazia não gera alarmes a partir de rótulos',()=>{
  for(const [p,page]of [['pna','pn-abertura'],['pnc','pn-consulta'],['ist','ist'],['vd','visita-domiciliar']]){T.clear(page);go(page);const r=validarAntesDeGerar(p,'gerar');T.ok(!r.erros.some(x=>/alarme obstétrico|IST\/teste reagente|alerta crítico/.test(x.msg)),p+JSON.stringify(r.erros));}
 }],
 ['Finalização bloqueia sem revisão; partos não contam como plano',()=>{
  T.clear('pn-abertura');go('pn-abertura');T.set('pna-pa','160/110');T.set('pna-p','0');let r=validarAntesDeGerar('pna','copiar SOAP');T.ok(r.bloqueia);T.ok(r.erros.some(x=>/PA.*sem conduta/.test(x.msg)));
  T.clear('idoso');go('idoso');T.set('id-nome','Pessoa Fictícia');gerarSoapIdoso();T.ok(validarAntesDeGerar('id','copiar SOAP').bloqueia);T.set('id-plano-confirmado',true);T.set('id-revisao-justificativa','Avaliação parcial; complemento já agendado pela equipe.');T.ok(!validarAntesDeGerar('id','copiar SOAP').bloqueia);T.set('id-peso','70').dispatchEvent(new Event('input',{bubbles:true}));T.ok(validarAntesDeGerar('id','copiar SOAP').bloqueia,'Alteração não invalidou revisão');
 }],
 ['Avaliações vazias não certificam baixo risco; IVCF completo calcula',()=>{
  T.clear('idoso');montarIVCF20();T.eq(calcularIVCF20().total,null);document.querySelectorAll('.ivcf-item').forEach(e=>e.value='0');T.eq(calcularIVCF20().total,0);T.eq(calcularIVCF20().classe,'Idoso robusto');
  T.clear('saude-mental');calcERSM();T.ok(/INCOMPLETA/i.test(document.getElementById('sm-risco-label')?.textContent||document.getElementById('sm-2').textContent),'ERSM vazio');
  T.clear('visita-domiciliar');classificarRiscoVD();T.ok(!/Risco final: Baixo/.test(textoSoapAtual(false)));
 }],
 ['Pré-eclâmpsia: fatores moderados, familiar e autoimune chegam ao plano',()=>{
  T.clear('pn-abertura');go('pn-abertura');T.set('pna-idade','36');T.set('pna-p','0');gerarSoapAutomatoPna();T.ok(/AAS 100 mg/.test(textoSoapAtual(false)));T.ok(/cálcio 1 g/.test(textoSoapAtual(false)));
  T.clear('pn-abertura');T.set('pna-idade','36');document.querySelector('[data-comorb="pefamilia"]').checked=true;T.ok(/AAS 100 mg/.test(avaliarProtocolosPna().conduta));
  T.clear('pn-abertura');document.querySelector('[data-comorb="autoimune"]').checked=true;T.ok(/AAS 100 mg/.test(avaliarProtocolosPna().conduta));
 }],
 ['SINAN: gestante usa ficha própria sem inventar início de sintomas',()=>{
  T.clear('sinan');T.clear('pn-consulta');T.set('pnc-ig','30 semanas');T.set('pnc-dum','2026-02-09');prepararSinanSifilis('pnc');T.eq(val('sinan-ficha-modelo'),'sifilis-gestante');T.eq(val('sinan-gestante'),'3');T.eq(val('sinan-primeiros-sintomas'),'');
 }],
 ['Cadastro: rejeição mantém fila; nova tentativa confirma; usuário isolado',async()=>{
  CURRENT_AUTH_USER_ID='synthetic-a';const cpf='11111111111';salvarPacientesLocal({[cpf]:{nome:'Pessoa A',cpf}});localStorage.setItem(chavePacientesPendentes(),JSON.stringify([cpf]));
  _sb={from:()=>({upsert:async()=>({error:{message:'simulação'}})})};await sincronizarPacientesPendentes();T.eq(JSON.parse(localStorage.getItem(chavePacientesPendentes())),[cpf]);
  _sb={from:()=>({upsert:async()=>({error:null})})};await sincronizarPacientesPendentes();T.eq(JSON.parse(localStorage.getItem(chavePacientesPendentes())),[]);
  CURRENT_AUTH_USER_ID='synthetic-b';T.eq(carregarPacientes(),{});CURRENT_AUTH_USER_ID='synthetic-a';_sb=null;
 }],
 ['Cadastro: edição durante envio e resposta de outra sessão preservadas',async()=>{
  const cpf='11111111111';localStorage.setItem(chavePacientesPendentes(),JSON.stringify([cpf]));let release;_sb={from:()=>({upsert:()=>new Promise(r=>release=r)})};const pending=sincronizarPacientesPendentes();salvarPacientesLocal({[cpf]:{cpf,nome:'Editado durante envio'}});release({error:null});await pending;T.eq(JSON.parse(localStorage.getItem(chavePacientesPendentes())),[cpf]);
  _sb={from:()=>({select:()=>({order:()=>new Promise(r=>release=r)})})};const read=baixarPacientesNuvem();CURRENT_AUTH_USER_ID='synthetic-b';release({data:[{cpf,dados:{nome:'Resposta sessão A'}}],error:null});await read;T.eq(carregarPacientes(),{});CURRENT_AUTH_USER_ID='synthetic-a';_sb=null;
 }],
 ['Atendimento: edição feita durante sincronização continua pendente',async()=>{
  const key=chaveAtendimentosAtual();localStorage.setItem(chavePacientesPendentes(),'[]');const a={id:'test-1',nome:'Sintético',tipo:'Idoso',data:'2026-09-07',soap:'antes',synced:false};localStorage.setItem(key,JSON.stringify([a]));let release;_sb={from:()=>({upsert:()=>new Promise(r=>release=r)})};const pending=sincronizarAtendimentosPendentes();await new Promise(r=>setTimeout(r,0));localStorage.setItem(key,JSON.stringify([{...a,soap:'depois'}]));T.ok(release,'Envio não iniciado');release({error:null});await pending;T.eq(JSON.parse(localStorage.getItem(key))[0].synced,false);_sb=null;
 }],
 ['Rascunho: recupera com data padrão e mantém marcações sem IDs antigos',()=>{
  T.clear('pn-abertura');go('pn-abertura');T.set('pna-nome','Rascunho Fictício');const checkbox=document.querySelector('[data-comorb="has"]');checkbox.checked=true;T.ok(checkbox.id);salvarRascunhoAutomatico();T.clear('pn-abertura');T.set('pna-data','2026-09-07');restaurarRascunhoAutomatico('pg-pn-abertura');T.eq(val('pna-nome'),'Rascunho Fictício');T.ok(checkbox.checked);
 }],
 ['IA: payload retira identificadores conhecidos e exige sessão',async()=>{
  T.clear('pn-abertura');go('pn-abertura');T.set('pna-nome','Pessoa (Fictícia) Exemplo');T.set('pna-cpf','11111111111');gerarSoapAutomatoPna();const payload=JSON.stringify(montarDadosConsultaParaIA('pna'));T.ok(!payload.includes('Pessoa (Fictícia) Exemplo'),'Nome no payload');T.ok(!payload.includes('11111111111'),'CPF no payload');
  _sb=null;let blocked=false;try{await cabecalhosIASegura();}catch{blocked=true;}T.ok(blocked);_sb={auth:{getSession:async()=>({data:{session:{access_token:'synthetic-token',user:{id:CURRENT_AUTH_USER_ID}}}})}};T.eq((await cabecalhosIASegura()).Authorization,'Bearer synthetic-token');_sb=null;
 }],
 ['IA: envio real usa prévia conferida, autenticação e comparação antes de aplicar',async()=>{
  T.clear('idoso');go('idoso');T.set('id-nome','Pessoa Fictícia da IA');gerarSoapIdoso();const before=textoSoapAtual(false),orig={cfg:carregarConfiguracaoIASOAP,review:revisarEnvioIA,fetch:fetchComTimeout};let captured,reviewed;
  try{carregarConfiguracaoIASOAP=()=>({ativa:true,enabled:true,endpoint:_SB_URL+'/functions/v1/clever-processor'});revisarEnvioIA=async text=>(reviewed=text,'S: Pessoa sem identificação. O: avaliação. A: acompanhamento. P: revisar.');fetchComTimeout=async(url,args)=>(captured=args,{ok:true,json:async()=>({data:{soap:'S: Revisão fictícia.\nO: avaliação.\nA: acompanhamento.\nP: revisar.',pendencias:[],bloqueado:false}})});_sb={auth:{getSession:async()=>({data:{session:{access_token:'synthetic-token',user:{id:CURRENT_AUTH_USER_ID}}}})}};await gerarSoapPorIA();
   T.ok(!reviewed.includes('Pessoa Fictícia da IA'));T.eq(captured.headers.Authorization,'Bearer synthetic-token');T.eq(Object.keys(JSON.parse(captured.body).dadosConsulta),['soapLocal']);T.eq(textoSoapAtual(false),before);T.ok(document.getElementById('ia-soap-compare'));T.ok(!document.getElementById('ia-soap-compare').textContent.includes('Copiar SOAP IA'));document.getElementById('ia-soap-compare').remove();
   fetchComTimeout=async()=>({ok:true,json:async()=>({data:{soap:'S: Texto bloqueado.',pendencias:['Falta informação clínica para revisão'],bloqueado:true}})});await gerarSoapPorIA();T.ok(document.querySelector('#ia-soap-compare .btn-p').disabled);T.ok(document.getElementById('ia-soap-compare').textContent.includes('Falta informação clínica'));aplicarSOAPIARevisado('id');T.eq(textoSoapAtual(false),before);document.getElementById('ia-soap-compare').remove();
  }finally{carregarConfiguracaoIASOAP=orig.cfg;revisarEnvioIA=orig.review;fetchComTimeout=orig.fetch;_sb=null;}
 }],
 ['IA: botão de teste rejeita sucesso falso e usa apenas dados fictícios',async()=>{
  const orig={form:lerFormAISoap,fetch:fetchComTimeout};let captured;let st=document.getElementById('ai-soap-status'),created=false;if(!st){st=document.createElement('div');st.id='ai-soap-status';document.body.appendChild(st);created=true;}
  try{lerFormAISoap=()=>({endpoint:_SB_URL+'/functions/v1/clever-processor'});_sb={auth:{getSession:async()=>({data:{session:{access_token:'synthetic-token',user:{id:CURRENT_AUTH_USER_ID}}}})}};
   fetchComTimeout=async(url,args)=>(captured=args,{status:200,ok:true,json:async()=>({erro:'GEMINI_API_KEY ausente',bloqueado:true})});await testarConfigAISoap();T.ok(/GEMINI_API_KEY ausente/.test(st.textContent));T.ok(!/concluído/.test(st.textContent));
   fetchComTimeout=async(url,args)=>(captured=args,{status:200,ok:true,json:async()=>({data:{soap:'S: Texto fictício.',modoTeste:true,bloqueado:false,modelo:'gemini-2.5-flash'}})});await testarConfigAISoap();T.ok(/concluído/.test(st.textContent));const sent=JSON.parse(captured.body);T.eq(sent.tipoAcao,'testar_conexao');T.ok(!captured.body.includes('Pessoa Fictícia da IA'));T.eq(captured.headers.Authorization,'Bearer synthetic-token');
   let refused=false;try{await chamarIASoap({endpoint:'https://example.test/ia'},{});}catch{refused=true;}T.ok(refused,'Sessão enviada a projeto desconhecido');
  }finally{lerFormAISoap=orig.form;fetchComTimeout=orig.fetch;_sb=null;if(created)st.remove();}
 }],
 ['PDF: zero extração não altera; confirmação necessária para importar',async()=>{
  go('pn-consulta');const dt=new DataTransfer();dt.items.add(new File(['sintético'],'laudo.pdf',{type:'application/pdf'}));document.getElementById('pnc-pdf-file').files=dt.files;
  const fake=text=>({getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:async()=>({items:[{str:text}]})})})})});pdfjsLib=fake('');document.querySelector('#exr-hb .ex-val').value='9';await extrairExamesPDF();T.eq(document.querySelector('#exr-hb .ex-val').value,'9');T.ok(/Nenhum resultado/.test(document.getElementById('pnc-exames-alert').textContent));
  pdfjsLib=fake('Hemoglobina: 11 g/dL');await extrairExamesPDF();T.eq(document.querySelector('#exr-hb .ex-val').value,'9');document.querySelector('#pnc-exames-alert button').click();T.eq(document.querySelector('#exr-hb .ex-val').value,'11');
 }],
 ['PDF: múltiplos laudos e troca de sessão não substituem exames',async()=>{
  const old=pdfjsLib;let release;document.querySelector('#exr-hb .ex-val').value='9';
  try{pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:2,getPage:async()=>({getTextContent:async()=>({items:[{str:'Hemoglobina: 11 g/dL'}]})})})})};await extrairExamesPDF();T.ok(/mais de um resultado/.test(document.getElementById('pnc-exames-alert').textContent));T.eq(document.querySelector('#exr-hb .ex-val').value,'9');
   let signal;const started=new Promise(r=>signal=r);pdfjsLib={getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:()=>new Promise(r=>{release=r;signal();})})})})};const pending=extrairExamesPDF();await Promise.race([started,new Promise((_,reject)=>setTimeout(()=>reject(Error('Leitura não iniciou')),5000))]);CURRENT_AUTH_USER_ID='synthetic-b';release({items:[{str:'Hemoglobina: 7 g/dL'}]});await pending;T.eq(document.querySelector('#exr-hb .ex-val').value,'9');T.ok(!document.querySelector('#pnc-exames-alert button'));
  }finally{pdfjsLib=old;CURRENT_AUTH_USER_ID='synthetic-a';}
 }],
 ['PDF pediátrico: conferência, duplicidade e leitura sem execução dinâmica',async()=>{
  go('puericultura');const dt=new DataTransfer();dt.items.add(new File(['sintético'],'laudo.pdf',{type:'application/pdf'}));document.getElementById('pu-pdf-file').files=dt.files;const old=pdfjsLib;
  try{const fake=text=>({getDocument:options=>{T.eq(options.isEvalSupported,false);return {promise:Promise.resolve({numPages:1,getPage:async()=>({getTextContent:async()=>({items:[{str:text}]})})})};}});
   const hb=document.querySelector('#pu-exr-hb .ex-val');hb.value='9';pdfjsLib=fake('');await extrairExamesPuPDF();T.eq(hb.value,'9');T.ok(/Nenhum resultado/.test(document.getElementById('pu-exames-alert').textContent));
   pdfjsLib=fake('Hemoglobina: 11 g/dL');await extrairExamesPuPDF();T.eq(hb.value,'9');document.querySelector('#pu-exames-alert button').click();T.eq(hb.value,'11');
   pdfjsLib=fake('Hemoglobina: 11 g/dL. Hemoglobina: 7 g/dL');await extrairExamesPuPDF();T.ok(/mais de um resultado/.test(document.getElementById('pu-exames-alert').textContent));T.eq(hb.value,'11');
   pdfjsLib=fake('Hemoglobina: 110 g/L');await extrairExamesPuPDF();T.eq(hb.value,'11');T.ok(/Unidade ausente ou diferente/.test(document.getElementById('pu-exames-alert').textContent));T.ok(!document.querySelector('#pu-exames-alert button'));
  }finally{pdfjsLib=old;}
 }],
 ['Laudo livre: negativos não acionam infecção e arquivo exige conferência',async()=>{
  for(const exame of ['VDRL','HIV','HBsAg','Anti-HCV','Urocultura'])for(const resultado of ['Não reagente','não detectado','negativo'])T.eq(condutaExameLivre({exame,resultado,numerico:null,status:'ok'},'gestante'),'');
  T.ok(/sífilis/.test(condutaExameLivre({exame:'VDRL',resultado:'reagente',numerico:null,status:'alto'},'gestante')));
  T.ok(!/anemia|ferro/i.test(condutaExameLivre({exame:'Hemoglobina glicada',resultado:'5,6',numerico:5.6,status:'ok'},'gestante')));
  go('pn-consulta');const dt=new DataTransfer();dt.items.add(new File(['texto fictício'],'laudo.txt',{type:'text/plain'}));document.getElementById('lab-livre-file-pnc').files=dt.files;
  await carregarLaudoLivre('pnc');T.eq(val('lab-livre-texto-pnc'),'texto fictício');T.ok(/Confira identificação/.test(document.getElementById('lab-livre-out-pnc').textContent));T.ok(!EXAMES_LIVRES.pnc);
 }],
 ['Datas e decimais preservam horário local e consulta retrospectiva',()=>{
  T.eq(ESFClinical.localDateTime(new Date('2026-09-07T12:00:00Z')),'2026-09-07T09:00');T.clear('pn-abertura');T.set('pna-data','2026-01-08');T.set('pna-dum','2026-01-01');calcIG('pna');T.ok(/^1s0d/.test(val('pna-ig')),val('pna-ig'));T.clear('hiperdia');T.set('hip-glicemia','100.0');const r=validarAntesDeGerar('hip','gerar');T.ok(!r.erros.some(x=>/1000|grave.*glicemia/.test(x.msg)));
 }],
 ['Offline: cache expirado recusado e bloqueio local funciona sem Supabase',async()=>{
  const original=setTimeout;let callback;window.setTimeout=(fn,ms,...a)=>ms===900000?(callback=fn,1):original(fn,ms,...a);_sb=null;resetarInatividade();window.setTimeout=original;await callback();T.eq(CURRENT_AUTH_USER_ID,'');T.ok(document.getElementById('auth-screen').classList.contains('visible'));T.ok(document.getElementById('edit-modal'),'Modal permanente removido');T.eq(val('pna-nome'),'');
  localStorage.setItem('esf_sessao_cache',JSON.stringify({uid:'old',ts:1,permissoes:{ver_admin:true}}));T.ok(!entrarModoOffline());
  CURRENT_AUTH_USER_ID='synthetic-a';document.getElementById('auth-screen').classList.remove('visible');PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_admin:true,usar_modo_teste:true,editar_protocolos:true,gerar_documentos:true};aplicarPermissoesInterface();
 }]
];
