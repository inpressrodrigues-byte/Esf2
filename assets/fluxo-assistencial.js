(()=>{
'use strict';
const id=x=>x==='pnc-sang-marcado'?document.querySelector('[data-sang-marcado]'):document.getElementById(x), value=x=>id(x)?.value||'';
const make=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el;};
function button(label,action){const b=make('button',label);b.type='button';b.className='btn btn-s';b.onclick=action;return b;}
function dateOf(a){const p=MODULOS_ATENDIMENTO[a.tipo]?.prefix;return a.dados?.[p+'-data']||a.dados?.[p+'-data-hora']?.slice(0,10)||a.data?.slice(0,10)||'';}
function registros(p){
 const cpf=normalizarCPF(value(p+'-cpf')),birth=value(p+'-nasc');
 if(cpf.length!==11||!temPermissao('ver_historico'))return [];
 return carregarAtendimentos().filter(a=>{const prefix=MODULOS_ATENDIMENTO[a.tipo]?.prefix,d=a.dados;if(!prefix||!d||a.id===ATENDIMENTO_EM_EDICAO)return false;
 const dob=d[prefix+'-nasc'];return normalizarCPF(a.cpf||d[prefix+'-cpf'])===cpf&&(!birth||!dob||birth===dob);}).sort((a,b)=>dateOf(b).localeCompare(dateOf(a)));
}
function syncField(key,v){const field=id(key);if(!field||!v||field.value)return;field.value=v;field.dispatchEvent(new Event('input',{bubbles:true}));}
const triagens=['pezinho','orelhinha','olhinho','coracao','lingua'];
function historico(p){
 const box=id(p+'-historico-consulta');if(!box)return;box.replaceChildren();const records=registros(p);box.hidden=!records.length;
 window.SeguimentoAPS?.mostrar(p,records);
 if(p==='pu')for(const k of triagens){
   const hint=id('pu-anterior-'+k),a=records.find(a=>a.tipo==='Puericultura'&&(a.dados['pu-t-'+k]||a.dados['cm1m-t-'+k]));
   if(hint)hint.textContent=a?'Registrado em '+dateOf(a)+': '+(a.dados['pu-t-'+k]||a.dados['cm1m-t-'+k])+'. Preencha se houver atualização.':'';
 }
 if(!records.length)return;
 box.append(make('summary','Histórico do paciente · '+records.length+' atendimento(s)'));
 for(const a of records){
 const q=MODULOS_ATENDIMENTO[a.tipo].prefix,d=a.dados,date=dateOf(a),section=make('details');section.append(make('summary',a.tipo+' · '+date.split('-').reverse().join('/')));
 const pairs=[['Alergias',['alergia','alergias','alergia-medicamentos']],['Medicamentos',['med','medicamentos']],['Antecedentes',['antecedentes','cron','comorbidades','antecedentes-gineco']],['História familiar',['familiares','antecedentes-familiares']],['Exames',['exames','exames-recebidos']]];
 for(const [label,keys] of pairs){const old=keys.map(k=>d[q+'-'+k]).find(v=>typeof v==='string'&&v.trim());if(!old)continue;section.append(make('p',label+' · '+old));
 if(['Medicamentos','Alergias'].includes(label)){
 const target=keys.map(k=>id(p+'-'+k)).find(e=>e?.matches('input[type=text],textarea')&&!e.value);
 if(target)section.append(button(label==='Medicamentos'?'Confirmar medicamentos em uso':'Confirmar alergias nesta consulta',()=>{if(registros(p).some(r=>r.id===a.id))syncField(target.id,old);historico(p);}));
 }}
 if(p==='pnc'&&q==='pna'){
 const dum=d['pna-dum'];if(dum)section.append(make('p','DUM da abertura · '+dum));
 const hist=Object.entries(d).filter(([k,v])=>k.startsWith('pna-')&&/anteced|alerg|intercor|risco-motivos/.test(k)&&typeof v==='string'&&v.trim()).map(([,v])=>v);
 const controls=window.ESFUsability?.legacyControls('pna')||[];
 for(const [k,v] of Object.entries(d)){const e=k.startsWith('@')?controls[Number(k.slice(1))]:id(k);if(v?.checked&&e?.closest('#pna-comorbidades-list,#pna-familiares-list,.ux-risk-options'))hist.push(e.closest('label')?.textContent.trim());}
 const summary=[...new Set([['G','pna-g'],['P','pna-p'],['A','pna-a']].filter(([,k])=>d[k]!==undefined&&d[k]!=='').map(([l,k])=>l+d[k]).concat(hist).filter(Boolean))].join(' · ');
 if(summary)section.append(make('p',summary));
 if(dum&&!value('pnc-dum'))section.append(button('Usar esta abertura na gestação atual',()=>{if(!registros(p).some(r=>r.id===a.id)||value('pnc-dum'))return;syncField('pnc-dum',dum);syncField('pnc-abertura-ref','Abertura de '+date+' · DUM '+dum+(summary?' · '+summary:''));calcIG('pnc');historico(p);}));
 }
 if(p==='pu'&&q==='pu'){const old=triagens.map(k=>[k,d['pu-t-'+k]||d['cm1m-t-'+k]]).filter(([,v])=>v);if(old.length)section.append(make('p','Triagens registradas · '+old.map(([k,v])=>k+' '+v).join(', ')));
 const measures=['peso','alt','pc'].filter(k=>d['pu-'+k]);if(measures.length)section.append(make('p',measures.map(k=>({peso:'Peso',alt:'Comprimento/estatura',pc:'PC'})[k]+' '+d['pu-'+k]+(k==='peso'?' kg':' cm')).join(' · ')));}
 if(p==='prev'&&q==='prev'&&d['prev-mat']&&!d['prev-vinculo-coleta']&&!ATENDIMENTO_EM_EDICAO&&!value('prev-mat'))section.append(button('Registrar resultado desta coleta',()=>{if(!registros('prev').some(r=>r.id===a.id))return;id('prev-vinculo-coleta').value=a.id;id('prev-vinculo-coleta').dispatchEvent(new Event('input',{bubbles:true}));id('prev-origem-resultado').textContent='Resultado da coleta de '+date;document.querySelector('[aria-controls="prev-5"]').click();}));
 const old=make('details');old.append(make('summary','Consultar registro anterior'),make('p',a.soap||'Sem evolução disponível.'));section.append(old);box.append(section);
 }
}
function fold(el,label){if(!el||el.closest('details[data-complementar]'))return;const d=make('details');d.dataset.complementar='1';d.className='support-section';d.append(make('summary',label));el.before(d);d.append(el);return d;}
function reverMes(el){
 if(!el)return;
 el.querySelectorAll('input:not([id]),textarea:not([id]),select:not([id])').forEach((field,i)=>{field.id=el.id+'-resposta-'+i;});
 for(const card of el.querySelectorAll('.card')){
 const title=card.querySelector('.ct')?.textContent.trim()||'';
 if(!/^\d+\.\s*(Medidas|Triagem Neonatal)$/.test(title))continue;
 if(!card.previousElementSibling?.classList.contains('canonical-shortcut')){const tri=title.includes('Triagem');const b=button(tri?'Registrar ou revisar triagens neonatais':'Registrar ou revisar medidas da consulta',()=>{document.querySelector('[aria-controls="pu-'+(tri?'2':'3')+'"]').click();id(tri?'pu-t-pezinho':'pu-peso').focus();});b.classList.add('canonical-shortcut');card.before(b);}
 // Um valor legado divergente permanece acessível para conferência.
 card.hidden=![...card.querySelectorAll('input,select')].some(e=>e.value);
 }
 for(const radio of el.querySelectorAll('input[name$="-aleit"]')){const group=radio.closest('.rpills');if(!group||group.dataset.vinculado)continue;group.dataset.vinculado='1';
 group.after(button('Registrar padrão alimentar atual',()=>{document.querySelector('[aria-controls="pu-2"]').click();id('pu-alim').focus();}));group.hidden=!group.querySelector('input:checked');}
}
function prepararHistoricoInfantil(dados){
 const keys=Object.keys(dados||{});
 for(const pane of document.querySelectorAll('#pg-puericultura [id^="cm-"]')){
   if(!/^cm-(?:1sem|\d+m)$/.test(pane.id))continue;
   const month=pane.id.slice(3);
   if(!pane.childElementCount&&keys.some(k=>k.startsWith(pane.id+'-resposta-')||k.startsWith('cm'+month+'-'))){
     pane.innerHTML=parseInt(month,10)<6?buildMesPrecoce(month):buildMesTardio(month);
     pane.querySelectorAll('input[name$="-risco"]').forEach(e=>e.closest('.card')?.remove());
     reverMes(pane);
   }
 }
}
function importarMedidasLegadas(){
 const month=document.querySelector('input[name="pu-mes"]:checked')?.value;
 if(!month)return;
 const src=month==='1sem'?'cm1s':'cm'+month;
 for(const [dest,k,unit] of [['peso','peso',1000],['alt','comp',1],['pc','pc',1]]){
   const previous=Number(value(src+'-'+k));
   if(previous>0&&!value('pu-'+dest))id('pu-'+dest).value=String(previous/unit);
 }
 for(const k of triagens)if(!value('pu-t-'+k)&&month==='1m')id('pu-t-'+k).value=value('cm1m-t-'+k);
}
function perdaAtiva(){
 const marked=[...document.querySelectorAll('#pnc-queixas-gin input:checked')].some(e=>/sangramento|líquido|corrimento|tampão/i.test(e.closest('label').textContent));
 return marked||value('pnc-sang-atual')==='Sim'||!value('pnc-sang-atual')&&['tipo','qtd','obs'].some(k=>value('pnc-perda-'+k));
}
function syncPerda(){
 const group=id('pnc-perda-tipo').closest('.g3');group.hidden=!perdaAtiva();group.toggleAttribute('data-clinico-inativo',group.hidden);
}
function conditional(key,detail,yes){const field=id(key),area=id(detail)?.closest('.f');if(!field||!area)return;
 const update=()=>{area.hidden=field.value!==yes&&!(field.value===''&&id(detail).value);area.toggleAttribute('data-clinico-inativo',area.hidden);};field.addEventListener('change',update);update();return update;}
function mount(){
 const riskBox=make('div');riskBox.className='f';const riskLabel=make('label','Reavaliação do risco gestacional nesta consulta');riskLabel.htmlFor='pnc-risco-reavaliado';
 const risk=make('select');risk.id=riskLabel.htmlFor;risk.className='aps-new';
 for(const text of ['Não avaliado','Habitual','Intermediário','Alto']){const o=make('option',text);o.value=text==='Não avaliado'?'':text;risk.append(o);}
 const reasonLabel=make('label','Critérios avaliados e conduta');reasonLabel.htmlFor='pnc-risco-fundamento';const reason=make('textarea');reason.id=reasonLabel.htmlFor;reason.className='aps-new';
 riskBox.append(riskLabel,risk,reasonLabel,reason);id('pnc-3').append(riskBox);
 for(const [key,anchor,label,compute] of [
   ['pu-risco-revisado','pu-risco-resultado','Revisei os critérios de risco desta consulta',calcRisco],
   ['sm-ersm-revisado','sm-ersm-classificacao','Concluí a aplicação do ERSM',calcERSM]
 ]){
   const control=make('input');control.type='checkbox';control.id=key;control.className='aps-new';
   const row=make('label');row.className='cki';row.append(control,document.createTextNode(' '+label));id(anchor).before(row);
   control.addEventListener('change',compute);compute();
 }
 document.addEventListener('change',e=>{
   if(e.target.matches('.ersm-chk')){id('sm-ersm-revisado').checked=false;calcERSM();}
   if(e.target.matches('.risco-alto,.risco-inter,#pu-pn,#pu-ig,#pu-apgar')){id('pu-risco-revisado').checked=false;calcRisco();}
 });
 for(const k of triagens){const hint=make('small');hint.id='pu-anterior-'+k;id('pu-t-'+k).after(hint);}
 for(const node of document.querySelectorAll('#pg-saude-mental .sm-desc')){
   const d=make('details');d.className='instrument-help';d.dataset.complementar='1';d.append(make('summary','Definição e exemplo'));node.before(d);d.append(node);
 }
 id('pnc-sang-marcado').closest('label').hidden=true;
 id('pnc-sang-atual').addEventListener('change',()=>{id('pnc-sang-marcado').checked=value('pnc-sang-atual')==='Sim';checkPncQueixas();syncPerda();});
 id('pnc-queixas-gin').addEventListener('change',syncPerda);syncPerda();
 for(const [pageId,p] of Object.entries(QUICK_PAGE_PREFIX)){
 const page=id(pageId),tabs=page.querySelector('.tabs'),first=page.querySelector('.tp');if(!first||!tabs)continue;
 const history=make('details');history.id=p+'-historico-consulta';history.className='support-section';history.hidden=true;first.prepend(history);
 for(const sel of ['#'+p+'-plano-cuidados','.extra-record','.manual-kit','.old-orders','.support-section'])for(const e of page.querySelectorAll(sel)){
 if(e===history)continue;if(e.tagName==='DETAILS')e.dataset.complementar='1';else fold(e,'Plano de cuidados de enfermagem (SAE)');}
 for(const card of page.querySelectorAll('.card')){const title=card.querySelector(':scope > .ct')?.textContent.trim();
 if(/^(Dados da Gestação e Parto|Anexar Laudo em PDF|Resultados de Exames — Criança|Histórico de rastreamento e antecedentes cervicais)/.test(title))fold(card,title);}
 const mode=button('Modo ampliado',()=>{const wide=mode.getAttribute('aria-pressed')!=='true';mode.setAttribute('aria-pressed',String(wide));mode.textContent=wide?'Voltar ao modo objetivo':'Modo ampliado';page.querySelectorAll('details[data-complementar]').forEach(d=>d.open=wide);});
 mode.setAttribute('aria-pressed','false');mode.classList.add('mode-switch');tabs.before(mode);
 page.addEventListener('input',e=>{if(e.target.id===p+'-nasc')historico(p);});
 page.addEventListener('input',e=>{if(e.target.id===p+'-cpf'){historico(p);for(const k of [p+'-abertura-ref',p+'-vinculo-coleta'])if(id(k))id(k).value='';if(p==='prev')id('prev-origem-resultado').textContent='';}});
 }
 for(const [host,key,label] of [['pnc-2','pnc-abertura-ref','Antecedentes da abertura confirmada'],['prev-5','prev-vinculo-coleta','Coleta vinculada']]){
 const f=make('input');f.type='hidden';f.id=key;id(host).prepend(f);if(key.startsWith('prev')){const status=make('p');status.id='prev-origem-resultado';id(host).prepend(status);}}
 const updates=['cm1s','cm1m'].map(x=>conditional(x+'-parou',x+'-desmame','Sim')).filter(Boolean);
 for(const card of document.querySelectorAll('[id^="cm-"]'))reverMes(card);
 const editor=id('pg-editor');for(const e of document.querySelectorAll('.doc-calibrator'))editor.append(e);
 document.querySelectorAll('button[onclick^="abrirCalibradorDoc"]').forEach(e=>e.remove());
 const prevTab=document.querySelector('[aria-controls="prev-5"]');if(prevTab)prevTab.textContent='Resultado e seguimento';
 const oldRestore=window.restaurarDadosModulo;
 window.restaurarDadosModulo=function(p,data){for(const k of [p+'-abertura-ref',p+'-vinculo-coleta'])if(id(k))id(k).value='';
 const result=oldRestore.apply(this,arguments);
 if(p==='sm')calcERSM();if(p==='id')calcularIVCF20();if(p==='pu')calcRisco();
 if(p==='pnc'){if(!value('pnc-sang-atual')&&id('pnc-sang-marcado').checked)id('pnc-sang-atual').value='Sim';syncPerda();}
 if(p==='pu'){const active=document.querySelector('input[name="pu-mes"]:checked')?.value;if(active)showConsultaMes(active);importarMedidasLegadas();updates.forEach(update=>update());CrescimentoOMS.render();}
 if(p==='prev')id('prev-origem-resultado').textContent=value('prev-vinculo-coleta')?'Resultado vinculado à coleta registrada.':'';
 historico(p);return result;};
 const nav=window.go;window.go=function(){const r=nav.apply(this,arguments);const p=prefixoPaginaAtual();if(p)historico(p);return r;};
 document.addEventListener('change',e=>{if(e.target.id==='pna-data'||e.target.id==='pnc-data')calcIG(e.target.id.slice(0,3));if(e.target.id==='pu-data'){idadeCrianca();CrescimentoOMS.render();}});
}
window.FluxoAPS={registros,historico,reverMes,prepararHistoricoInfantil,perdaAtiva,syncPerda};document.addEventListener('DOMContentLoaded',mount);
})();
