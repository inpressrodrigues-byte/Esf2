/* Uma orientação por problema, no ponto em que a equipe registra a queixa. */
(()=>{
  'use strict';
  const R=window.ProtocoloConsulta;
  const byId=id=>document.getElementById(id);
  const value=(p,key)=>byId(p+'-'+key)?.value||'';
  const pages=new Map();
  const kinds=['queixa','queixas','queixa-principal','complaints','historia-atual','hma','sintomas','manual-queixa','problemas','diagnostico','diagnostico-confirmado','condicao-protocolar'];
  const legacyReasons={itu:'Queixa urinária',corrimento:'Corrimento',iniciar:'Iniciar anticoncepcional',trocar:'Trocar anticoncepcional',acompanhar:'Acompanhar método'};
  const ciapTerms={U01:'Disúria',U71:'Infecção urinária',X14:'Corrimento vaginal',X72:'Candidíase vulvovaginal',X73:'Tricomoníase',N01:'Cefaleia',A03:'Febre',D12:'Constipação',D11:'Diarreia',R02:'Dispneia',L03:'Dor lombar'};
  function inputText(p,page){
    const structured=[...page.querySelectorAll('.complaint-chip.selected,.clinical-chip.selected,[id$="-queixas-clin"] input:checked,[id$="-queixas-gin"] input:checked')].map(e=>e.dataset.text||e.closest('label')?.textContent||e.textContent);
    const codes=(window.ESFCiap?.capture(p)||[]).map(item=>ciapTerms[item.code]||window.ESFCiap.description(item.code)).filter(Boolean);
    const content=[...kinds.map(key=>value(p,key)),...structured,...codes].filter(Boolean);
    if(!content.length&&value(p,'guide-motivo'))content.push(legacyReasons[value(p,'guide-motivo')]||'');
    return content.join('\n');
  }
  function addRef(title,url){return {title,url};}
  function activeDecisions(p,text,ctx){
    const output=[],matches=R.match(text);
    for(const rule of matches){
      if(rule.kit==='itu'){output.push(R.urinary(ctx));continue;}
      const item={title:rule.title,care:rule.care,kit:rule.kit,carePage:rule.carePage,refs:[addRef('Avaliação · p. '+rule.page,R.demanda+'#page='+rule.page)]};
      if(rule.kit==='corrimento'){
        item.exams='Se houver dúvida diagnóstica ou persistência, considerar exame a fresco ou Gram. Avaliar testagem para IST conforme exposição.';
        item.refs.unshift(addRef('Saúde da Mulher · corrimento',R.mulher+'#page=14'));
        if(p==='smu'||p==='pna'||p==='pnc')item.action='corrimento';
      }
      if(rule.kit==='gestacao')item.exams='TIG ou β-hCG conforme indicação. Conferir o resultado e a necessidade de repetir a investigação.';
      output.push(item);
    }
    const motive=value(p,'motivo-consulta');
    if(p==='smu'&&['iniciar','acompanhar','trocar','emergencia','preconcepcao'].includes(motive)){
      const emergency=motive==='emergencia',pre=motive==='preconcepcao';
      output.push({title:pre?'Pré-concepção':emergency?'Contracepção de emergência':'Anticoncepção',care:pre?'Revisar condições clínicas, medicamentos, vacinação e plano reprodutivo.':emergency?'Avaliar tempo desde a exposição e risco de violência. Seguir o fluxo de acesso ao levonorgestrel e programar seguimento.':'Revisar preferência, gestação, PA, uso atual e critérios de elegibilidade. A etapa Anticoncepção apresenta métodos, taxas de falha e condutas por categoria.',exams:'Solicitar exames conforme a indicação individual e os resultados anteriores.',kit:pre?'gestacao':'contracepcao',action:pre||emergency?'exames-mulher':'contracepcao',refs:[addRef('Saúde da Mulher · '+(pre?'pré-concepção':emergency?'emergência':'elegibilidade'),R.mulher+'#page='+(pre?47:emergency?65:62))]});
    }
    // Somente sintomas/achados atuais acionam o cruzamento. Textos de orientações e SOAP ficam fora.
    const current=R.positive(text).join(' | ');
    const specialized=[
      ['ist',/uretrite|sifilis reagente|hiv reagente|condiloma|herpes genital|cervicite/,'IST'],
      ['hip',/has mal controlada|diabetes.*sem controle|insuficiencia cardiaca|arritmia|hipotireoidismo|hipertireoidismo|nodulo de tireoide/,'Cardiologia / endocrinologia'],
      ['fer',/ferida|ulcera de pressao|necrose|pe diabetico/,'Feridas'],
      ['puerp',/amamentacao|aleitamento|puerperio/,'Puerpério']
    ];
    for(const [prefix,rx,title] of specialized){
      if(!rx.test(current)||prefix==='puerp'&&p!=='puerp')continue;
      const context=current+(ctx.gestante==='Sim'?' CONTEXTO_GESTANTE':'')+(value(p,'lactante')==='Sim'?' CONTEXTO_LACTANTE':'');
      const d=condutaProtocoladaModulo(prefix,context);if(!d?.protocolada)continue;
      // Esquemas específicos do adulto dependem de idade e situação obstétrica estabelecidas.
      const drug=prefix==='ist'&&ctx.adult&&(ctx.gestante==='Não'||ctx.male)&&!ctx.urgent;
      output.push({title,care:d.conduta,treatment:drug?[d.medicacao,d.dosagem].filter(Boolean).join(' '):'',refs:[addRef(d.fonte,d.url)]});
    }
    if(['pna','pnc'].includes(p)&&Number.isFinite(ctx.ig)){
      const id=ctx.ig<14?'pn1':ctx.ig<28?'pn2':'pn3',built=ExamesRegras.build(id,ctx);
      output.push({title:built.name,exams:built.items.filter(x=>x.selected).map(x=>x.name).join(' · '),kit:id,refs:[addRef('Pré-natal · exames por trimestre',ExamesRegras.sources.pn.url+'#page=29')]});
    }
    return output;
  }
  function tag(name,cls,text){
    const node=document.createElement(name);if(cls)node.className=cls;if(text)node.textContent=text;return node;
  }
  function line(node,label,text){if(!text)return;const row=tag('p');row.append(tag('strong','',label+' '),document.createTextNode(text));node.append(row);}
  function navigate(p,id){
    if(id==='corrimento'&&p!=='smu'){
      byId(p+'-corr-abrir')?.click();return;
    }
    const tab=pages.get(p).page.querySelector('[aria-controls="'+p+'-'+id+'"]');tab?.click();
  }
  function display(p){
    const model=pages.get(p);if(!model)return;
    const {page,box}=model,ctx=ESFExames.context(p),text=inputText(p,page),items=activeDecisions(p,text,ctx);
    const stamp=JSON.stringify(items);
    if(model.stamp===stamp)return;model.stamp=stamp;
    box.replaceChildren();box.hidden=!items.length;
    for(const [index,item] of items.entries()){
      const section=tag('article','care-item');
      section.append(tag('h3','',item.title));
      if(item.priority)section.append(tag('p','care-priority',item.priority));
      line(section,'Exames',item.exams);line(section,'Conduta',item.care);line(section,'Tratamento',item.treatment);
      if(item.note)section.append(tag('p','care-note',item.note));
      const links=tag('div','care-links');
      for(const ref of item.refs||[]){
        if(!ref.url?.startsWith('https://'))continue;
        const link=tag('a','',ref.title);link.href=ref.url;link.target='_blank';link.rel='noopener';links.append(link);
      }
      section.append(links);
      if(item.carePage){
        const details=tag('details','protocol-source');
        const url=R.demanda+'#page='+item.carePage;
        const link=tag('a','','Abrir a página no leitor de PDF');link.href=url;link.target='_blank';link.rel='noopener noreferrer';
        details.append(tag('summary','','Ver manejo no protocolo · p. '+item.carePage),link);
        details.addEventListener('toggle',()=>{
          if(!details.open||details.querySelector('iframe'))return;
          const frame=tag('iframe');frame.title='Manejo municipal de '+item.title;frame.referrerPolicy='no-referrer';frame.src=url;details.append(frame);
        });section.append(details);
      }
      if(item.kit&&byId(p+'-exkit-painel')){
        const order=tag('button','btn btn-s','Revisar pedido de exames');order.type='button';
        order.onclick=()=>{
          if(!ESFExames.cart(p).some(x=>x.kit===item.kit))ESFExames.build(p,item.kit);
          ESFExames.open(p,item.kit);
        };
        section.append(order);
      }
      if(item.action){const b=tag('button','btn btn-s','Abrir avaliação específica');b.type='button';b.onclick=()=>navigate(p,item.action);section.append(b);}
      if(index>0&&item.kit?.startsWith('pn')){const more=tag('details');more.append(tag('summary','',item.title),section);box.append(more);}else box.append(section);
    }
  }
  function disclosure(node,label,cls){
    if(!node||node.parentElement?.classList.contains(cls))return;
    const details=tag('details',cls);details.append(tag('summary','',label));node.before(details);details.append(node);return details;
  }
  function clean(page,p){
    // Guardar os controles antigos para reabertura de históricos e edição de dados complementares.
    const manual=byId('manual-soap-'+p);disclosure(manual,'Complementar o registro em texto livre','extra-record');
    const exams=byId(p+'-exkit-painel');if(exams){
      disclosure(exams,'Pedidos de exames','order-drawer');
      const picker=exams.querySelector('.exam-picker');disclosure(picker,'Escolher outro kit','manual-kit');
      byId(p+'-exkit-sugestoes')?.setAttribute('hidden','');
    }
    const oldExam=byId('smu-confirmar-exames')?.closest('section');
    if(p==='smu'&&oldExam)disclosure(oldExam,'Consultar ou editar pedidos do formulário anterior','old-orders');
    const native=page.querySelector('.tp.on')||page;
    const duplicates=new Set();
    for(const btn of page.querySelectorAll('button[onclick]')){
      const action=btn.getAttribute('onclick').trim(),key=(btn.closest('.tp')?.id||page.id)+'|'+action;
      if(/^gerarSAE\(/.test(action)){if(duplicates.has(key))btn.remove();else duplicates.add(key);}
      if(action==='gerarSoapPorIA()'&&byId('quick-actions')?.querySelector('.ai'))btn.hidden=true;
    }
    if(p==='ger')byId('ger-motivo')?.closest('.f')?.classList.add('legacy-motive');
    for(const d of page.querySelectorAll('[id$="-endereco-auto"]')){
      const field=byId(p+'-endereco');
      if(field&&d.contains(byId(p+'-logradouro'))&&field.closest('.f'))field.closest('.f').classList.add('combined-address');
    }
    const anthro=byId(p+'-antropometria-auto');
    const vital=(byId(p+'-pa')||byId(p+'-pa-atual')||byId(p+'-peso'))?.closest('.card');
    if(anthro&&vital&&vital!==anthro&&vital.closest('.tp')===anthro.closest('.tp')){
      const fields=anthro.querySelector('.module-form-grid');if(fields)vital.append(fields);
      const status=byId(p+'-imc-status');if(status)vital.append(status);anthro.remove();
    }
    for(const card of page.querySelectorAll('.card')){
      const title=card.querySelector(':scope > .ct')?.textContent.trim();
      if(title==='Avaliação Vacinal — PNI'&&p!=='pu')disclosure(card,'Avaliar vacinação','support-section');
      if(title==='Análise livre de laudo laboratorial')disclosure(card,'Interpretar laudo laboratorial','support-section');
    }
    // A área de impressão e os cálculos continuam lendo os valores dos mesmos controles.
    return native;
  }
  function syncLegacy(p){
    const m=pages.get(p);if(!m)return;
    const address=byId(p+'-endereco'),derived=value(p,'logradouro')||value(p,'cep');
    if(address?.closest('.combined-address'))address.closest('.f').hidden=Boolean(derived||!address.value);
    const old=byId('ger-motivo');if(p==='ger'&&old?.closest('.legacy-motive'))old.closest('.f').hidden=!old.value;
    const historic=byId('smu-confirmar-exames')?.closest('.old-orders');
    if(p==='smu'&&historic)historic.hidden=![...historic.querySelectorAll('textarea,select')].some(e=>e.value)&&!window.ESFSaudeMulher?.records().some(r=>r.id==='exames');
  }
  function refresh(p){const m=pages.get(p);if(!m)return;if(!m.box.isConnected)m.home.after(m.box);syncLegacy(p);display(p);}
  function reset(p){const m=pages.get(p);if(!m)return;clearTimeout(m.timer);m.stamp='';m.home.after(m.box);m.box.replaceChildren();m.box.hidden=true;for(const id of ['motivo','completo']){const e=byId(p+'-guide-'+id);if(e){e.value='';e.checked=false;}}}
  function mount(){
    for(const [id,p] of Object.entries(QUICK_PAGE_PREFIX)){
      const page=byId(id);if(!page)continue;
      const home=page.querySelector('.ux-stage-label')||page.querySelector('.tabs');if(!home)continue;
      const box=tag('aside','consultation-protocol');box.id=p+'-protocolo-atual';box.setAttribute('aria-label','Orientação do protocolo');box.setAttribute('aria-live','polite');box.hidden=true;home.after(box);
      const old=tag('div');old.hidden=true;
      for(const k of ['motivo','completo']){const input=tag('input');input.id=p+'-guide-'+k;input.type=k==='completo'?'checkbox':'text';old.append(input);}old.className='consultation-guide legacy-guide';page.append(old);
      pages.set(p,{page,box,home,stamp:'',timer:0});clean(page,p);
      const change=e=>{
        if(e.target.closest('.consultation-protocol'))return;
        const model=pages.get(p),target=e.target;
        if(Object.values(SOAP_IDS_MODULO[p]||{}).includes(target.id))return;
        const relevant=target.closest('.clinical-chip,.complaint-chip,.alert-chip,[data-priority],[id$="-queixas-clin"],[id$="-queixas-gin"]')||kinds.some(k=>target.id===p+'-'+k)||['gestante','motivo-consulta'].some(k=>target.id===p+'-'+k);
        const place=relevant&&target.closest('.complaint-list,.alert-check-list,.clinical-group,.f,.g2,.cki,.rpills');
        if(place&&!place.contains(box)&&!place.closest('[hidden]')&&place.getClientRects().length)place.after(box);
        clearTimeout(model.timer);model.timer=setTimeout(()=>refresh(p),e.type==='input'?100:0);
      };
      for(const event of ['change','input','click'])page.addEventListener(event,change);
    }
    const restore=window.restaurarDadosModulo;
    window.restaurarDadosModulo=function(p,...args){const r=restore.call(this,p,...args);refresh(p);return r;};
    const nav=window.go;
    window.go=function(...args){const r=nav.apply(this,args);const p=prefixoPaginaAtual();if(p)refresh(p);return r;};
    matchMedia('(max-width:760px)').addEventListener('change',e=>{if(e.matches)alternarMenuLateral(true);});
    refresh(prefixoPaginaAtual());
  }
  window.ESFConsultaGuiada={refresh,reset};document.addEventListener('DOMContentLoaded',mount);
})();
