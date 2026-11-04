/* CIAP-2: classificação revisada pelo profissional; sem inferência de prescrição. */
(() => {
  'use strict';
  const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const byId = id => document.getElementById(id);
  const states = new Map();
  let catalog = [], catalogError = '', owner = '';
  const indicatorGuide='https://sisaps.saude.gov.br/sistemas/esusaps/docs/guias-preenchimento%20Atual/equipeaps/';
  function indicator(code,p){
    if(p==='prev'&&code==='A98')return 'A98 descreve o atendimento preventivo. Para o indicador de prevenção do câncer, registre o exame/procedimento efetivamente realizado, solicitado ou avaliado no sistema oficial, com os campos e critérios exigidos. O CIAP isolado não comprova coleta.';
    if(['K86','K87'].includes(code))return 'Cuidado da pessoa com hipertensão: registrar na Avaliação e na lista de problemas/condições. A elegibilidade também depende dos demais critérios da ficha técnica.';
    if(['T89','T90'].includes(code))return 'Cuidado da pessoa com diabetes: registrar na Avaliação e na lista de problemas/condições. O código isolado não comprova as boas práticas realizadas.';
    if(['W03','W78','W79','W81','W84','W85'].includes(code))return 'Cuidado da gestante: código citado no guia nacional. Conferir DUM, lista de problemas, consultas e procedimentos registrados nos campos estruturados.';
    return 'Sem correspondência validada neste app com uma ficha de indicador. Use o código que descreve o atendimento; não troque a classificação para pontuar.';
  }
  const aliases = {A01:['dor generalizada'],A02:['calafrios'],A03:['febre','febril'],A04:['fadiga','cansaco'],A06:['desmaio','sincope'],A11:['dor toracica'],N01:['cefaleia','dor de cabeca'],U01:['disuria','ardor ao urinar'],U02:['polaciuria','urgencia urinaria'],U04:['incontinencia urinaria'],U06:['hematuria'],X14:['corrimento vaginal','leucorreia'],X16:['prurido vulvar','coceira na vulva'],R02:['dispneia','falta de ar'],R05:['tosse'],R06:['epistaxe'],R07:['congestao nasal','espirros'],R21:['dor de garganta'],D01:['dor abdominal generalizada'],D02:['dor epigastrica','epigastralgia'],D03:['azia'],D09:['nausea','nauseas'],D10:['vomito','vomitos'],D11:['diarreia'],D12:['constipacao','obstipacao'],L01:['cervicalgia','dor no pescoco'],L03:['lombalgia','dor lombar'],X02:['colica menstrual','dismenorreia'],X04:['dispareunia'],X05:['amenorreia'],X11:['sintomas da menopausa','sintomas do climaterio'],X12:['sangramento pos menopausa'],X18:['mastalgia'],X19:['nodulo mamario'],P01:['ansiedade','nervosismo'],P03:['tristeza'],P06:['insonia']};
  function matches(code,text){return (aliases[code]||[]).some(term=>new RegExp('(?:^|\\W)'+term+'(?:$|\\W)').test(norm(text)));}
  function suggest(text) {
    // Somente sintomas explícitos. Negação, hipótese e antecedentes exigem busca manual.
    const clauses=norm(text).split(/[.!?;\n]+/).filter(x=>!/(\bnega\b|\bsem\b|\bnao\b|ausencia|historico|antecedente|suspeita|descartar|se houver|orientad)/.test(x));
    return catalog.filter(c=>clauses.some(s=>matches(c.code,s)));
  }
  function capture(p){return structuredClone(states.get(p)||[]);}
  function persist(p){const e=byId(p+'-ciap-registro');if(e){e.value=JSON.stringify(capture(p));e.dispatchEvent(new Event('input',{bubbles:true}));}}
  function restore(p,items){states.set(p,Array.isArray(items)?items.filter(x=>catalog.some(c=>c.code===x.code)).map(x=>({code:x.code,s:String(x.s||''),o:String(x.o||''),a:String(x.a||''),p:String(x.p||'')})):[]);renderSelected(p);const e=byId(p+'-ciap-registro');if(e)e.value=JSON.stringify(capture(p));if(p==='prev')refreshSuggestions(p);}
  function restoreFromPage(p){try{restore(p,JSON.parse(byId(p+'-ciap-registro')?.value||'[]'));}catch{restore(p,[]);}}
  function source(p){
    const page=byId('pg-'+moduloPorPrefixo(p)?.page);
    return [...(page?.querySelectorAll('input,textarea')||[])].filter(e=>!e.closest('[data-ciap]')&&/(queixas?|queixa-principal|complaints|sintomas|hma|historia-atual)$/.test(e.id)).map(e=>e.value).filter(Boolean).join('\n');
  }
  function preventiveReason(){return document.querySelector('input[name="prev-motivo"]:checked')?.value||'';}
  function suggestModule(p){
    const codes=new Set(suggest(source(p)).map(c=>c.code));
    if(p==='prev'){
      const reason=preventiveReason();
      if(reason==='rastr')codes.add('A98');
      // O rótulo de repetição deste formulário especifica exame anterior alterado.
      if(reason==='repet')codes.add('X86');
      if(norm(byId('prev-sang-rel')?.value)==='sim')codes.add('X13');
      if(norm(byId('prev-sang-menop')?.value)==='sim')codes.add('X12');
    }
    return catalog.filter(c=>codes.has(c.code));
  }
  function refreshSuggestions(p){
    if(byId(p+'-ciap-busca')?.value.trim())return;
    results(p,suggestModule(p));
  }
  function draft(p,i){
    const item=states.get(p)?.[i];if(!item)return;
    const c=catalog.find(c=>c.code===item.code);
    const excerpts=source(p).split(/[.!?;\n]+/).map(s=>s.trim()).filter(s=>suggest(s).some(c=>c.code===item.code));
    if(p==='prev'&&item.code==='A98'&&preventiveReason()==='rastr')excerpts.unshift('Comparece para rastreamento citopatológico do colo do útero.');
    if(p==='prev'&&item.code==='X86'&&preventiveReason()==='repet')excerpts.unshift('Comparece para repetição de exame citopatológico anterior alterado, conforme motivo registrado.');
    if(!item.s)item.s=[...new Set(excerpts)].join('. ');
    if(!item.a)item.a=`Problema classificado pelo profissional: ${item.code} — ${c.display}.`;
    // Exame e plano precisam ser vinculados a este problema pelo profissional.
    // Não copiamos automaticamente um plano geral para vários diagnósticos.
    renderSelected(p);persist(p);showToast('Rascunho gerado. Complete os achados e a conduta deste problema.');
  }
  function button(text,fn){const b=document.createElement('button');b.type='button';b.className='btn btn-s';b.textContent=text;b.onclick=fn;return b;}
  function add(p,c){const items=states.get(p)||[];if(items.some(x=>x.code===c.code))return;items.push({code:c.code,s:'',o:'',a:'',p:''});states.set(p,items);renderSelected(p);persist(p);}
  function results(p,items){const out=byId(p+'-ciap-resultados');if(!out)return;out.replaceChildren();if(!items.length)out.textContent=catalogError||'Nenhum código sugerido. Busque pelo código ou descrição e confirme o problema avaliado.';items.slice(0,25).forEach(c=>out.append(button(c.code+' — '+c.display,()=>add(p,c))));}
  function soapFor(item){const c=catalog.find(c=>c.code===item.code);return ['CIAP-2: '+item.code+' — '+(c?.display||''),...['s','o','a','p'].map(k=>k.toUpperCase()+': '+(item[k]||'Não registrado para este problema.'))].join('\n');}
  function renderSelected(p){const out=byId(p+'-ciap-selecionados');if(!out)return;out.replaceChildren();capture(p).forEach((item,i)=>{
    const card=document.createElement('div');card.className='card';const title=document.createElement('h4');title.textContent=item.code+' — '+(catalog.find(c=>c.code===item.code)?.display||'');card.append(title);
    const info=document.createElement('p');info.textContent=indicator(item.code,p)+' ';const link=document.createElement('a');link.href=indicatorGuide;link.target='_blank';link.rel='noopener';link.textContent='Guia nacional de registro (MS)';info.append(link);card.append(info);
    const grid=document.createElement('div');grid.className='soap-grid';
    [['s','S — relato desta queixa'],['o','O — achados deste problema'],['a','A — avaliação deste problema'],['p','P — conduta realizada/pactuada para este problema']].forEach(([key,label])=>{
      const wrap=document.createElement('div');wrap.className='f';const l=document.createElement('label'),input=document.createElement('textarea');input.id=p+'-ciap-'+item.code+'-'+key;l.htmlFor=input.id;l.textContent=label;input.value=item[key];input.oninput=()=>{states.get(p)[i][key]=input.value;persist(p);};wrap.append(l,input);grid.append(wrap);
    });card.append(grid,button('Gerar rascunho deste problema',()=>draft(p,i)),button('Copiar SOAP deste CIAP',()=>copiarTextoSeguro(soapFor(capture(p)[i]),'SOAP por problema copiado.')),button('Remover código',()=>{states.get(p).splice(i,1);renderSelected(p);persist(p);}));out.append(card);
  });}
  function apply(p){
    const items=capture(p),ids=SOAP_IDS_MODULO[p];if(!items.length||!ids)return showToast('Selecione ao menos um CIAP-2.');
    if(items.some(i=>!i.s.trim()||!i.a.trim()||!i.p.trim()))return showToast('Preencha relato, avaliação e plano específicos de cada problema.');
    if(Object.values(ids).some(id=>byId(id)?.value)&&!confirm('Substituir o SOAP atual pelos blocos revisados de cada CIAP?'))return;
    pularFinalizadorSoapAutomatico(p);
    for(const k of ['s','o','a','p']){const el=byId(ids[k]);el.value=items.map(i=>'CIAP-2 '+i.code+' — '+catalog.find(c=>c.code===i.code)?.display+'\n'+(i[k]||'Não registrado para este problema.')).join('\n\n');el.dispatchEvent(new Event('input',{bubbles:true}));}
    showToast('SOAP organizado por problema. Revise antes de salvar.');
  }
  function mount(){
    for(const cfg of Object.values(MODULOS_ATENDIMENTO)){
      const p=cfg.prefix,page=byId('pg-'+cfg.page),anchor=byId(cfg.soap[0])?.closest('.card');if(!page||!anchor||byId(p+'-ciap-painel'))continue;
      const panel=document.createElement('section');panel.className='card';panel.id=p+'-ciap-painel';panel.dataset.ciap=p;
      const h=document.createElement('h3');h.textContent='CIAP-2 — problemas avaliados';
      const note=document.createElement('p');note.textContent='Sugestões precisam de confirmação clínica. Selecione somente problemas avaliados. Registre o SOAP de cada problema abaixo; o código não define tratamento nem garante contabilização em indicadores oficiais.';
      const input=document.createElement('input');input.id=p+'-ciap-busca';input.placeholder='Buscar código ou descrição (686 códigos)';input.setAttribute('aria-label','Buscar CIAP-2');input.oninput=()=>{const q=norm(input.value).trim();results(p,q.length<2?[]:catalog.filter(c=>norm(c.code+' '+c.display).includes(q)));};
      const result=document.createElement('div');result.id=p+'-ciap-resultados';result.className='brow';
      const selected=document.createElement('div');selected.id=p+'-ciap-selecionados';
      const hidden=document.createElement('input');hidden.type='hidden';hidden.id=p+'-ciap-registro';
      panel.append(h,note,button(p==='prev'?'Sugerir pelo motivo e queixas':'Sugerir pela queixa',()=>results(p,suggestModule(p))),input,result,selected,hidden,button('Gerar SOAP por CIAP no atendimento',()=>apply(p)));
      if(p==='prev'){const help=document.createElement('p');help.textContent='Rastreamento sugere A98; repetição de citopatológico alterado sugere X86. Seguimento depende do resultado/condição avaliada. Confirme o motivo na Anamnese. Nenhuma coleta ou resultado normal é presumido.';panel.append(help);}
      anchor.before(panel);renderSelected(p);if(p==='prev')refreshSuggestions(p);
    }
  }
  function aggregate(records){const counts=new Map();const seen=new Set();for(const r of records){if(seen.has(r.id))continue;seen.add(r.id);const items=r.dados?.__ciap2||[];for(const code of new Set(items.map(x=>x.code).filter(code=>catalog.some(c=>c.code===code))))counts.set(code,(counts.get(code)||0)+1);}return [...counts].sort((a,b)=>b[1]-a[1]).map(([code,n])=>({ciap:code,descricao:catalog.find(c=>c.code===code).display,atendimentos:n}));}
  function indicators(){
    if(!temPermissao('ver_historico'))return;
    let box=byId('ind-ciap');if(!box){box=document.createElement('section');box.id='ind-ciap';box.className='card';byId('pg-indicadores')?.append(box);}
    const mes=val('ind-mes'),prof=val('ind-profissional'),linha=val('ind-linha'),micro=val('ind-microarea'),risco=val('ind-risco');
    const records=carregarAtendimentos().filter(r=>(!r.municipio||norm(r.municipio)==='toledo')&&(!mes||r.data?.slice(0,7)===mes)&&(!prof||r.profissional===prof)&&(!linha||r.tipo===linha)&&(!micro||Object.entries(r.dados||{}).some(([k,v])=>k.endsWith('-microarea')&&v===micro)));
    box.replaceChildren();const h=document.createElement('h3');h.textContent='CIAP-2 — atendimentos registrados no app / Toledo';const note=document.createElement('p');note.textContent='Contagem por código confirmado, uma vez por atendimento. Não é o indicador oficial municipal nem inclui registros externos. Filtros: mês, profissional, linha e microárea. O filtro de risco não se aplica a esta tabela.';box.append(h,note);
    const data=aggregate(records);if(!data.length)box.append(document.createTextNode('Nenhum CIAP-2 confirmado neste recorte.'));
    else{const table=document.createElement('table');for(const row of [['CIAP-2','Descrição','Atendimentos'],...data.map(x=>[x.ciap,x.descricao,x.atendimentos])]){const tr=document.createElement('tr');for(const cell of row){const td=document.createElement('td');td.textContent=cell;tr.append(td);}table.append(tr);}box.append(table,button('Exportar contagem CIAP-2',()=>exportarLinhasCSV('ciap2-toledo',data)));}
  }
  window.ESFCiap={capture,restore,restoreFromPage,suggest,suggestModule,aggregate,soapFor,mount};
  async function init(){
    try{const res=await fetch('assets/ciap2.json');if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();catalog=data.concept.filter(c=>/^[A-Z][0-9]{2}$/.test(c.code));}catch{catalogError='Catálogo CIAP-2 indisponível. Recarregue para tentar novamente.';}
    mount();owner=CURRENT_AUTH_USER_ID;
    const navigate=window.go;window.go=function(...args){if(owner!==CURRENT_AUTH_USER_ID){states.clear();for(const cfg of Object.values(MODULOS_ATENDIMENTO))restore(cfg.prefix,[]);owner=CURRENT_AUTH_USER_ID;}mount();const r=navigate.apply(this,args);if(args[0]==='indicadores')indicators();if(args[0]==='preventivo')refreshSuggestions('prev');return r;};
    const render=window.renderIndicadores;window.renderIndicadores=function(...args){const r=render.apply(this,args);indicators();return r;};
    document.addEventListener('input',e=>{const p=e.target?.closest('[data-ciap]')?.dataset.ciap;if(p&&e.target.id!==p+'-ciap-registro')persist(p);});
    for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target?.closest('#pg-preventivo')&&!e.target.closest('[data-ciap]'))refreshSuggestions('prev');});
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1200));
})();
