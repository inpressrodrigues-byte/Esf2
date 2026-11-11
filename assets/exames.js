/* Solicitações por indicação, com revisão, persistência e ligação ao SOAP. */
(()=>{
  'use strict';
  const R=window.ExamesRegras,byId=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const anchors={pu:'pu-2',sm:'sm-2',fer:'fer-aval',vd:'vd-aval',pna:'pna-4',pnc:'pnc-4',smu:'smu-exames-mulher',ger:'ger-aval',acol:'acol-aval',prev:'prev-3',id:'id-2',hip:'hip-aval',ist:'ist-aval',puerp:'puerp-aval'};
  const el=(p,k)=>byId(p+'-exkit-'+k),v=(p,k)=>el(p,k)?.value||'',native=(p,k)=>byId(p+'-'+k)?.value||'';
  const page=p=>byId(paginaDoModulo(p));
  const parse=(p,k,fallback)=>{try{return JSON.parse(v(p,k))||fallback;}catch{return fallback;}};
  const cart=p=>{const a=parse(p,'cart',[]);return Array.isArray(a)?a.filter(item=>item&&typeof item.id==='string'&&(item.manual?/^manual-\d+$/.test(item.id):Object.hasOwn(R.catalog,item.id)&&R.kits.some(k=>k.id===item.kit))):[];};
  const order=p=>parse(p,'order',null);
  function put(p,k,data){el(p,k).value=JSON.stringify(data);el(p,k).dispatchEvent(new Event('input',{bubbles:true}));}
  function complaint(p){return [...(page(p)?.querySelectorAll('input,textarea')||[])].filter(e=>!e.closest('.exam-kits')&&!e.closest('[data-ciap]')&&/(queixas?|queixa-principal|historia-atual|hma)$/.test(e.id)).map(e=>e.value).concat([...(page(p)?.querySelectorAll('.clinical-chip.selected,.complaint-chip.selected')||[])].map(e=>e.textContent),[...(page(p)?.querySelectorAll('[id$="queixas-clin"] input:checked,[id$="queixas-gin"] input:checked')||[])].map(e=>e.closest('label')?.textContent)).filter(Boolean).join('\n');}
  const ctxKeys=['scope','gestante','ig','diabetes','rh','coombs','toxo','totg','sifilis','dumDesconhecida','cito','duvida','ituSimples','ituCultura','compartilhado','alerta'];
  function context(p){
    const c=Object.fromEntries(ctxKeys.map(k=>[k,v(p,k)]));
    if(['pna','pnc'].includes(p)){c.gestante='Sim';const m=native(p,'ig').match(/^(\d+)(?:s(\d+)d)?/);c.ig=m?+m[1]+Number(m[2]||0)/7:NaN;}
    else {if(p==='smu')c.gestante=native(p,'gestante')||c.gestante;c.ig=c.ig.trim()?Number(c.ig.replace(',','.')):NaN;}
    if(['smu','prev','pna','pnc','puerp'].includes(p))c.scope='mulher';
    const nasc=native(p,'nasc');if(c.gestante!=='Sim'&&nasc&&typeof idadePorNascimento==='function'&&idadePorNascimento(nasc)<18)c.scope='crianca';
    if(page(p)?.querySelector('[data-comorb="dm"]:checked'))c.diabetes='Sim';
    const pg=page(p);
    const normalize=window.ProtocoloConsulta?.norm||((text)=>String(text||'').toLowerCase());
    const selected=[...(pg?.querySelectorAll('[data-priority]:checked,.alert-chip.selected')||[])].map(item=>normalize(item.dataset.priority||item.textContent.trim()));
    selected.push(...normalize(native(p,'alerts')).split(/;\s*/));
    const fromField=native(p,'gestante');
    const pregnantFlag=selected.includes('gestante')||native(p,'tr-condicao')==='gestante'||['pna','pnc'].includes(p);
    const reported=window.ProtocoloConsulta?.positive(complaint(p))||[];
    const reportedPregnancy=reported.some(s=>/\b(?:gestante|gravidez confirmada)\b/.test(s)&&!/suspeita|possibilidade|descartar/.test(s));
    c.pregnancyConflict=Boolean((pregnantFlag||reportedPregnancy)&&(fromField==='Não'||!fromField&&c.gestante==='Não'));
    c.gestante=c.pregnancyConflict?'':pregnantFlag||reportedPregnancy?'Sim':fromField||c.gestante;
    c.nativePregnancy=!c.pregnancyConflict&&(pregnantFlag||reportedPregnancy||['Sim','Não'].includes(fromField));
    const age=nasc&&Number(idadePorNascimento(nasc));
    c.child=p==='pu'||Boolean(nasc&&Number.isFinite(age)&&age<18);
    c.adult=Boolean(nasc&&Number.isFinite(age)&&age>=18);
    c.male=['m','masculino'].includes(normalize(native(p,'sexo')));
    if(c.child&&c.gestante!=='Sim')c.scope='crianca';
    if(c.male&&c.gestante!=='Sim'&&c.adult){c.ituSimples='Não';c.ituCultura=c.ituCultura==='falha'?'falha':'Sim';}
    const temp=Number(native(p,'temp').replace(',','.'));
    const current=window.ProtocoloConsulta?.positive(complaint(p))||[];
    const danger=/\b(febre|dor lombar|delirium|instabilidade|giordano positivo)\b/;
    const markedDanger=selected.some(text=>danger.test(text))||current.some(text=>danger.test(text));
    c.urgent=temp>=38||markedDanger||['dor','perdaliquido','sangra','mobilizacao'].some(k=>native(p,'corr-'+k)==='Sim')||c.alerta==='Sim';
    if(c.urgent)c.alerta='Sim';
    const today=new Date();c.consultaDate=/^\d{4}-\d{2}-\d{2}$/.test(native(p,'data'))?native(p,'data'):[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    return c;
  }
  function signature(p){const contextSnapshot=context(p);return JSON.stringify({patient:[native(p,'nome'),native(p,'cpf'),native(p,'nasc')],date:native(p,'data')||native(p,'data-hora'),context:Object.fromEntries([...ctxKeys,'consultaDate'].map(key=>[key,contextSnapshot[key]])),complaint:complaint(p),indication:v(p,'indicacao'),cart:cart(p)});}
  function valid(p,soap=false){
    if(!el(p,'cart'))return true;const o=order(p);
    if(o&&o.signature!==signature(p)){showToast('Exames: a avaliação ou o pedido mudou. Confira e confirme novamente a solicitação.');return false;}
    if(o&&o.items.some(item=>item.ciap&&!window.ESFCiap?.capture(p).some(code=>code.code===item.ciap))){showToast('O CIAP do pedido mudou. Revise o vínculo e confirme novamente.');return false;}
    if(soap&&(o||v(p,'soap-base'))&&v(p,'soap-base')!==JSON.stringify(o)){showToast('Gere novamente o SOAP para atualizar as solicitações de exames.');return false;}
    return true;
  }
  function ruleLookup(c){
    const byKit=new Map();
    return row=>{
      if(row.manual)return {...row,eligible:true};
      if(!byKit.has(row.kit))byKit.set(row.kit,new Map(R.build(row.kit,c).items.map(item=>[item.id,item])));
      return byKit.get(row.kit).get(row.id)||{eligible:false,when:'Item fora do kit atual.',source:{name:'Conferir origem',url:'#',page:'—'}};
    };
  }
  function targetDate(c,item){if(!item.window||!Number.isFinite(c.ig))return '';const d=new Date(c.consultaDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+Math.max(0,Math.round((item.window[0]-c.ig)*7)));return d.toISOString().slice(0,10);}
  function validDate(c,row,rule){if(!rule.window)return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date))return false;const days=(Date.parse(row.date+'T12:00:00Z')-Date.parse(c.consultaDate+'T12:00:00Z'))/86400000;const age=Math.round(c.ig*7)+days;return days>=0&&age>=Math.round(rule.window[0]*7)&&age<=Math.round(rule.window[1]*7);}
  function selected(p){return cart(p).filter(x=>x.status==='solicitar');}
  function kit(p,id,quiet=false){
    const b=R.build(id,context(p));el(p,'kit').value=id;
    const old=cart(p),c=context(p);
    for(const item of b.items){
      const previous=old.find(row=>row.id===item.id);
      if(!previous){old.push({...item,kit:id,status:item.selected?'solicitar':'revisar',date:targetDate(c,item),note:'',ciap:''});continue;}
      if(previous.kit!==id||previous.edited)continue;
      Object.assign(previous,item,{status:item.selected?'solicitar':'revisar',date:targetDate(c,item)});
    }
    put(p,'cart',old);if(!v(p,'indicacao'))el(p,'indicacao').value=complaint(p)||b.name;
    el(p,'revisado').checked=false;render(p);if(!quiet)showToast('Kit preparado para revisão. Ajuste indicação, resultados prévios e datas antes de confirmar.');
  }
  function lines(o){return o.items.map(x=>`- ${x.name}${x.date?' — data-alvo: '+x.date.split('-').reverse().join('/'):''}${x.ciap?' — CIAP '+x.ciap:''}${x.note?' — '+x.note:''}\n  Indicação/janela: ${x.when}`).join('\n');}
  const start='[Solicitações de exames]',end='[Fim solicitações de exames]';
  function strip(s){return String(s||'').replace(/\n*\[Solicitações de exames\][\s\S]*?\[Fim solicitações de exames\]/g,'').trim();}
  function appendSoap(p){
    if(!el(p,'cart')||!valid(p))return;const dest=byId(SOAP_IDS_MODULO[p]?.p);if(!dest)return;
    const o=order(p);if(o)syncCiap(p,o);const body=o?`\n\n${start}\nExames solicitados após revisão. Indicação: ${o.indication}\n${lines(o)}\n${end}`:'';
    dest.value=strip(dest.value)+body;el(p,'soap-base').value=JSON.stringify(o);dest.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function syncCiap(p,o){
    if(!window.ESFCiap)return;const codes=ESFCiap.capture(p);for(const c of codes){c.p=strip(c.p);const items=o?.items.filter(x=>x.ciap===c.code)||[];if(items.length)c.p+=`\n\n${start}\nIndicação: ${o.indication}\n${lines({items})}\n${end}`;}ESFCiap.restore(p,codes);
  }
  function confirmOrder(p){
    const rows=selected(p),c=context(p),rule=ruleLookup(c);if(!rows.length)return showToast('Selecione ao menos um exame indicado para solicitar.');
    if(!native(p,'nome').trim())return showToast('Identifique o paciente antes de confirmar a solicitação.');
    if(!v(p,'indicacao').trim())return showToast('Registre a indicação clínica do pedido.');
    if(c.alerta==='Sim'&&!el(p,'prioridade').checked)return showToast('Priorize a avaliação/encaminhamento e confirme a conduta para os sinais de alerta.');
    if(rows.some(x=>!rule(x).eligible))return showToast('Há exame selecionado com condição ou janela não atendida. Revise os itens sinalizados.');
    if(rows.some(x=>!validDate(c,x,rule(x))))return showToast('Confira a data-alvo dos exames com janela gestacional: ela deve respeitar a IG e a janela indicadas.');
    if(rows.some(x=>x.manual&&!x.note.trim()))return showToast('Exame individual: registre a justificativa específica.');
    if(rows.some(x=>x.ciap&&!window.ESFCiap?.capture(p).some(c=>c.code===x.ciap)))return showToast('O CIAP vinculado foi removido. Revise o vínculo do exame.');
    const o={version:1,ig:c.gestante==='Sim'&&Number.isFinite(c.ig)?Math.round(c.ig*7):null,indication:v(p,'indicacao').trim(),items:rows.map(x=>({...x,...rule(x),status:'solicitar'})),signature:signature(p),confirmedAt:new Date().toISOString()};
    put(p,'order',o);appendSoap(p);render(p);showToast('Solicitação confirmada e incluída no plano SOAP. Confira o pedido antes de imprimir.');
  }
  function requestText(p){
    const o=order(p);if(!o||!valid(p))return '';
    return `SOLICITAÇÃO DE EXAMES\nPaciente: ${native(p,'nome')}\nNascimento: ${native(p,'nasc')||'não informado'}\nData: ${new Date(o.confirmedAt).toLocaleDateString('pt-BR')}\nProfissional: ${native(p,'enf')||native(p,'profissional')||CURRENT_USER_PROFILE?.nome||'conferir identificação e COREN'}\n\nIndicação: ${o.indication}${Number.isFinite(o.ig)?'\nIG na consulta: '+Math.floor(o.ig/7)+' semanas e '+o.ig%7+' dias':''}\n${lines(o)}\n\nFontes: ${[...new Set(o.items.filter(x=>!x.manual).map(x=>x.source.name+' · p. '+x.source.page))].join('; ')}\n\nConferir identificação, assinatura e registro no sistema oficial conforme fluxo da UBS.`;
  }
  function print(p){const txt=requestText(p);if(!txt)return showToast('Confirme uma solicitação atual antes de imprimir.');const w=window.open('','_blank');if(!w)return showToast('Permita abrir a prévia de impressão no navegador.');w.opener=null;w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Solicitação de exames</title><style>body{font:14px/1.5 Arial;margin:32px;color:#172c22}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Imprimir / salvar PDF</button><pre>${esc(txt)}</pre><p>________________________________________<br>Assinatura e identificação profissional / COREN</p></body></html>`);w.document.close();}
  const options=(values,empty='Não avaliado')=>`<option value="">${empty}</option>`+values.map(x=>{const [value,label]=Array.isArray(x)?x:[x,x];return `<option value="${esc(value)}">${esc(label)}</option>`;}).join('');
  const field=(p,k,label,values)=>`<div class="f" data-exctx="${k}"><label for="${p}-exkit-${k}">${label}</label><select id="${p}-exkit-${k}">${options(values)}</select></div>`;
  function render(p){
    if(!el(p,'painel'))return;const c=context(p),rule=ruleLookup(c),id=v(p,'kit'),b=id?R.build(id,c):null;
    el(p,'sugestoes').innerHTML=R.suggests(complaint(p),c).map(k=>`<button class="btn btn-s" type="button" data-ex-suggest="${k}">${esc(R.kits.find(x=>x.id===k).name)}</button>`).join('')||'<span>Nenhum kit sugerido pela queixa atual. Você pode escolher abaixo.</span>';
    const keys=new Set(['scope','gestante','alerta',...(id.startsWith('pn')?['diabetes','rh','coombs','toxo','totg','sifilis','dumDesconhecida','cito','ig']:id==='itu'&&c.gestante!=='Sim'?['ituSimples','ituCultura']:id==='dmgest'?['diabetes','compartilhado','ig']:id==='corrimento'?['duvida']:id==='contracepcao'?['cito']:id==='sifilis'?['sifilis']:[])]);
    el(p,'painel').querySelectorAll('[data-exctx]').forEach(e=>{e.hidden=!keys.has(e.dataset.exctx)||e.dataset.exctx==='gestante'&&c.nativePregnancy||['pna','pnc'].includes(p)&&['scope','gestante','ig'].includes(e.dataset.exctx)||['smu','prev','puerp'].includes(p)&&e.dataset.exctx==='scope'||p==='smu'&&e.dataset.exctx==='gestante';});
    el(p,'contexto-info').textContent=`${c.gestante==='Sim'?'Gestação confirmada neste atendimento. ':''}${Number.isFinite(c.ig)?'IG: '+c.ig.toFixed(1)+' semanas. ':''}${c.diabetes==='Sim'?'Diabetes diagnosticado: rastreamento por TOTG/glicemia não será incluído.':''}`;
    el(p,'notas').innerHTML=b?[...b.pending,...b.notes].map(n=>`<p>${esc(n)}</p>`).join(''):'';
    el(p,'prioridade-wrap').hidden=c.alerta!=='Sim';
    const ciaps=window.ESFCiap?.capture(p)||[],rows=cart(p),o=order(p),opened=new Set([...el(p,'lista').querySelectorAll('details[open][data-ex-item]')].map(e=>e.dataset.exItem));
    el(p,'lista').innerHTML=rows.length?['Sangue','Urina','Imagem','Testes / outros'].map(group=>{const items=rows.filter(x=>x.group===group);return !items.length?'':`<h4>${group}</h4>`+items.map(x=>{const r=rule(x);return `<details data-ex-item="${esc(x.id)}" ${opened.has(x.id)?'open':''} class="exam-row ${!r.eligible?'exam-restricted':''}"><summary><strong>${esc(x.name)}</strong><span>${({solicitar:'Solicitar',feito:'Já realizado / solicitado',dispensado:'Não indicado',revisar:'Revisar'})[x.status]||'Revisar'}${x.date?' · '+esc(x.date.split('-').reverse().join('/')):''}</span></summary><p>${esc(r.when)}</p>${x.manual?'<small>Solicitação individual — indicação registrada pelo profissional.</small>':`<a href="${esc(r.source.url)}" target="_blank" rel="noopener">${esc(r.source.name)} · p. ${r.source.page}</a>`}<div class="exam-row-fields"><div class="f"><label for="${p}-exkit-status-${x.id}">Decisão</label><select id="${p}-exkit-status-${x.id}" data-ex-row="${esc(x.id)}" data-key="status">${[['revisar','Não selecionado'],['solicitar','Solicitar'],['feito','Já realizado / solicitado'],['dispensado','Não indicado']].map(([val,label])=>`<option value="${val}" ${x.status===val?'selected':''} ${val==='solicitar'&&!r.eligible?'disabled':''}>${label}</option>`).join('')}</select></div><div class="f"><label for="${p}-exkit-date-${x.id}">Data-alvo (não é agendamento)</label><input id="${p}-exkit-date-${x.id}" type="date" data-ex-row="${esc(x.id)}" data-key="date" value="${esc(x.date)}"></div><div class="f"><label for="${p}-exkit-note-${x.id}">Justificativa / observação</label><input id="${p}-exkit-note-${x.id}" data-ex-row="${esc(x.id)}" data-key="note" value="${esc(x.note)}"></div><div class="f"><label for="${p}-exkit-ciap-${x.id}">Problema confirmado (opcional)</label><select id="${p}-exkit-ciap-${x.id}" data-ex-row="${esc(x.id)}" data-key="ciap"><option value="">Plano geral</option>${ciaps.map(c=>`<option ${c.code===x.ciap?'selected':''}>${esc(c.code)}</option>`).join('')}</select></div></div><button class="btn btn-s" type="button" data-ex-remove="${esc(x.id)}">Retirar item</button></details>`;}).join('');}).join(''):'<p>Escolha um kit para preparar os exames, ou adicione um pedido individual.</p>';
    el(p,'status').textContent=o?(o.signature===signature(p)?`${o.items.length} exames confirmados. Pedido pronto para conferir e imprimir.`:'A avaliação ou os itens mudaram. Revise e confirme novamente antes de usar o pedido.'):'Nenhuma solicitação confirmada.';
  }
  function open(p,id){const a=byId(anchors[p]);if(!a)return;const button=page(p).querySelector(`[aria-controls="${a.id}"]`)||[...page(p).querySelectorAll('.tabs .tab')].find(b=>b.getAttribute('onclick')?.includes("'"+a.id+"'"));button?.click();const drawer=a.querySelector('.order-drawer');if(drawer)drawer.open=true;if(id){el(p,'kit').value=id;}render(p);el(p,'painel').scrollIntoView({block:'start',behavior:'smooth'});}
  function mount(){
    for(const [p,anchorId]of Object.entries(anchors)){
      const anchor=byId(anchorId);if(!anchor)continue;const panel=document.createElement('section');panel.className='card exam-kits';panel.id=p+'-exkit-painel';
      panel.innerHTML=`<div class="exam-heading"><div><h3>Exames por motivo do atendimento</h3><p>Kits municipais de sangue, urina, imagem e outros exames. Revise indicação, janela e resultados anteriores.</p></div></div><div id="${p}-exkit-sugestoes" class="brow"></div><div class="exam-picker"><div class="f"><label for="${p}-exkit-kit">Qual situação está sendo avaliada?</label><select id="${p}-exkit-kit">${options(R.kits.map(k=>[k.id,k.name]),'Escolher kit')}</select></div><button class="btn btn-p" type="button" data-ex-action="build">Preparar kit</button></div><details open><summary>Contexto necessário para o kit</summary><p id="${p}-exkit-contexto-info"></p><div class="exam-grid">`+
        field(p,'scope','Perfil para aplicar o protocolo',[['mulher','Mulher adulta / contexto ginecológico'],['adulto','Outro adulto'],['crianca','Criança / adolescente']])+field(p,'gestante','Gestação',['Sim','Não'])+`<div class="f" data-exctx="ig"><label for="${p}-exkit-ig">IG (semanas)</label><input id="${p}-exkit-ig" type="number" min="0" max="43" step="0.1"></div>`+
        field(p,'diabetes','Diabetes já diagnosticado?',['Sim','Não'])+field(p,'rh','Fator Rh',[['positivo','Positivo'],['negativo','Negativo']])+field(p,'coombs','Coombs indireto anterior',[['negativo','Negativo'],['positivo','Positivo'],['semresultado','Sem resultado']])+field(p,'toxo','Toxoplasmose — resultado revisto',[['imune','Imunidade documentada'],['suscetivel','Suscetível (IgG e IgM negativos)'],['semresultado','Ainda sem resultado'],['alterada','IgG e IgM reagentes / indeterminados']])+field(p,'totg','TOTG já realizado nesta gestação?',['Sim','Não'])+field(p,'sifilis','Sífilis reagente documentada?',['Sim','Não'])+field(p,'dumDesconhecida','DUM desconhecida?',['Sim','Não'])+field(p,'cito','Rastreamento cervical indicado e pendente?',['Sim','Não'])+field(p,'duvida','Corrimento: dúvida diagnóstica ou persistência?',['Sim','Não'])+field(p,'ituSimples','Cistite clássica em mulher jovem não grávida, sem risco de resistência?',['Sim','Não'])+field(p,'ituCultura','Indicação de cultura: homem, recorrência, complicação, resistência ou falha?',[['Sim','Sim — homem / recorrência / complicação / resistência'],['falha','Falha de tratamento / retorno rápido'],['Não','Não']])+field(p,'compartilhado','Plano de alto risco revisto com a equipe responsável?',['Sim','Não'])+field(p,'alerta','Há sinais de alarme, febre, dor lombar importante ou instabilidade?',['Sim','Não'])+
        `</div></details><div id="${p}-exkit-notas" class="exam-notes" aria-live="polite"></div><div class="f"><label for="${p}-exkit-indicacao">Indicação clínica da solicitação</label><textarea id="${p}-exkit-indicacao" rows="2" placeholder="Queixa, hipótese avaliada, IG e motivo dos pedidos"></textarea></div><div id="${p}-exkit-lista"></div><details><summary>Adicionar outro exame com indicação individual</summary><div class="exam-grid"><div class="f"><label for="${p}-exkit-manual-name">Exame</label><input id="${p}-exkit-manual-name"></div><div class="f"><label for="${p}-exkit-manual-group">Tipo</label><select id="${p}-exkit-manual-group">${['Sangue','Urina','Imagem','Testes / outros'].map(s=>`<option>${s}</option>`).join('')}</select></div></div><button type="button" class="btn btn-s" data-ex-action="manual">Adicionar para revisão</button></details><input type="checkbox" hidden id="${p}-exkit-revisado"><label class="exam-check" id="${p}-exkit-prioridade-wrap" hidden><input type="checkbox" id="${p}-exkit-prioridade"> Avaliação/encaminhamento prioritário providenciado; os exames não atrasam a assistência.</label><div class="brow"><button type="button" class="btn btn-p" data-ex-action="confirm">Confirmar pedido e incluir no SOAP</button><button type="button" class="btn btn-s" data-ex-action="copy">Copiar pedido</button><button type="button" class="btn btn-s" data-ex-action="print">Imprimir / PDF</button><button type="button" class="btn btn-s" data-ex-action="removeOrder">Retirar solicitação do SOAP</button></div><p id="${p}-exkit-status" role="status"></p><small>Confirme o pedido e registre no sistema oficial conforme fluxo da UBS. A sugestão de kit não significa exame realizado.</small><textarea id="${p}-exkit-cart" hidden></textarea><textarea id="${p}-exkit-order" hidden></textarea><textarea id="${p}-exkit-soap-base" hidden></textarea>`;
      anchor.prepend(panel);
      panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.exSuggest){kit(p,b.dataset.exSuggest);return;}if(b.dataset.exRemove){put(p,'cart',cart(p).filter(x=>x.id!==b.dataset.exRemove));el(p,'revisado').checked=false;render(p);return;}switch(b.dataset.exAction){case'build':if(v(p,'kit'))kit(p,v(p,'kit'));break;case'confirm':confirmOrder(p);break;case'copy':{const t=requestText(p);if(t)copiarTextoSeguro(t,'Pedido de exames copiado.');else showToast('Confirme uma solicitação atual antes de copiar.');break;}case'print':print(p);break;case'removeOrder':put(p,'order',null);syncCiap(p,null);appendSoap(p);render(p);break;case'manual':{const name=v(p,'manual-name').trim();if(!name)return;put(p,'cart',[...cart(p),{id:'manual-'+Date.now(),manual:true,name,group:v(p,'manual-group'),status:'solicitar',note:'',date:'',ciap:'',when:'Solicitação individual conforme avaliação profissional.'}]);el(p,'manual-name').value='';el(p,'revisado').checked=false;render(p);break;}}});
      panel.addEventListener('change',e=>{const id=e.target.dataset.exRow;if(id){const rows=cart(p),row=rows.find(x=>x.id===id);row[e.target.dataset.key]=e.target.value;row.edited=true;put(p,'cart',rows);el(p,'revisado').checked=false;render(p);}else if(e.target.id!==p+'-exkit-revisado'&&e.target.id!==p+'-exkit-prioridade'){el(p,'revisado').checked=false;if(e.target.closest('[data-exctx]')&&v(p,'kit')&&cart(p).some(x=>x.kit===v(p,'kit'))&&!order(p))kit(p,v(p,'kit'),true);else render(p);}});
      // Inputs in the list are persisted as typed without rebuilding the focused control.
      panel.addEventListener('input',e=>{const id=e.target.dataset.exRow;if(id){const rows=cart(p),row=rows.find(x=>x.id===id);row[e.target.dataset.key]=e.target.value;row.edited=true;put(p,'cart',rows);el(p,'revisado').checked=false;}});
      let timer;for(const event of ['input','change'])page(p).addEventListener(event,e=>{if(e.target.closest('.exam-kits')||e.target.closest('[data-ciap]')||Object.values(SOAP_IDS_MODULO[p]||{}).includes(e.target.id))return;clearTimeout(timer);timer=setTimeout(()=>render(p),180);});
      render(p);
    }
    for(const [p,name]of [['pna','gerarSoapAutomatoPna'],['pnc','gerarSoapAutomatoPnc'],['prev','gerarSoapPreventivo'],['id','gerarSoapIdoso']]){const original=window[name];window[name]=function(...args){if(!valid(p))return;const r=original.apply(this,args);appendSoap(p);return r;};}
    const gen=window.gerarSoapGenerico;window.gerarSoapGenerico=function(p,...args){if(!valid(p))return;const r=gen.call(this,p,...args);appendSoap(p);return r;};
    const restore=window.restaurarDadosModulo;window.restaurarDadosModulo=function(p,...args){const r=restore.call(this,p,...args);render(p);return r;};
    const nav=window.go;window.go=function(...args){const r=nav.apply(this,args);const p=prefixoPaginaAtual();if(anchors[p])render(p);return r;};
    const save=window.salvarAtendimentoModulo;window.salvarAtendimentoModulo=function(tipo,...args){if(!valid(MODULOS_ATENDIMENTO[tipo]?.prefix,true))return;return save.call(this,tipo,...args);};
    const ai=window.gerarSoapPorIA;window.gerarSoapPorIA=function(...args){if(!valid(prefixoPaginaAtual(),true))return;return ai.apply(this,args);};
    const copy=window.podeCopiarSoapAtual;window.podeCopiarSoapAtual=function(...args){return valid(prefixoPaginaAtual(),true)&&copy.apply(this,args);};
  }
  window.ESFExames={context,cart,order,build:kit,confirm:confirmOrder,render,open,validate:valid,appendSoap,requestText};
  document.addEventListener('DOMContentLoaded',mount);
})();
