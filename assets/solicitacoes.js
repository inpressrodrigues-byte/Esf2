(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const views=new Map();let dataPromise;
  function catalog(){return dataPromise||=fetch('assets/catalogo-aps.json').then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{dataPromise=null;throw e;});}
  function prescriptions(p){
    if(p==='smu')return (window.ESFSaudeMulher?.records()||[]).filter(r=>['corrimento','contracepcao'].includes(r.id)).map(r=>r.plan);
    if(['pna','pnc'].includes(p)){const r=window.ESFCorrimentoPN?.state(p);return r?.r?[r.r.plan]:[];}
    return [];
  }
  function show(p,view){
    const model=views.get(p);if(!model)return;
    const {pane,page,areas,buttons}=model;
    if(view==='rx'){
      const confirmed=byId(p+'-rx-protocolo');confirmed.textContent=prescriptions(p).join('\n\n');confirmed.hidden=!confirmed.textContent;
    }
    if(!pane.classList.contains('on'))page.querySelector('[aria-controls="'+pane.id+'"]')?.click();
    for(const key of Object.keys(areas)){areas[key].hidden=key!==view;buttons[key].setAttribute('aria-pressed',String(key===view));}
  }
  function field(parent,name,type){
    const l=el('label',name),n=el(type==='select'?'select':'input');if(type!=='select')n.type=type;
    l.className='f';l.append(n);parent.append(l);return n;
  }
  function button(name,action){const b=el('button',name);b.type='button';b.className='btn btn-s';b.onclick=action;return b;}
  function ref(parent,name,url){const a=el('a',name);a.href=url;a.target='_blank';a.rel='noopener';parent.append(a);}
  function search(p,parent,rx,target){
    const box=el('div');box.className='order-catalog';box.append(el('h3',rx?'Medicamentos':'Exames e procedimentos'));
    const group=field(box,rx?'Relação de medicamentos':'Categoria','select');
    for(const label of rx?['Todas','REMUME Toledo 2026','RENAME 2024']:['Todas','Sangue','Laboratório','Imagem','Procedimentos'])group.append(new Option(label,label));
    const query=field(box,rx?'Buscar medicamento':'Buscar por nome ou código','search');
    query.placeholder=rx?'Ex.: amoxicilina':'Ex.: hemograma, ultrassonografia';query.autocomplete='off';
    // Estes campos servem somente à busca. O item escolhido é salvo pelo controle clínico do módulo.
    const results=el('div'),status=el('small');status.setAttribute('role','status');results.className='order-results';box.append(status,results);
    const sources=el('details');sources.append(el('summary','Fontes do catálogo'));
    if(rx){ref(sources,'REMUME Toledo 2026','https://www.toledo.pr.gov.br/portais/saude/assistencia-farmaceutica/lista-de-medicamentos');sources.append(' · ');ref(sources,'RENAME — Ministério da Saúde','https://www.gov.br/saude/pt-br/composicao/sectics/rename');}
    else{ref(sources,'SIGTAP · novembro de 2026','https://wiki.saude.gov.br/sigtap/index.php/Download');sources.append(' · ');ref(sources,'Laboratório · Toledo','https://www.toledo.pr.gov.br/node/14434');}
    let ticket=0;
    async function find(){
      const n=++ticket,q=norm(query.value.trim()),g=group.value;results.replaceChildren();status.textContent='';
      if(q.length<2)return;
      try{
        const d=await catalog();if(n!==ticket)return;
        const rows=rx?[...(g==='RENAME 2024'?[]:d.municipal.map(x=>[x.join(' · '),'REMUME Toledo 2026'])),...(g==='REMUME Toledo 2026'?[]:d.nacional.map(x=>[x,'RENAME 2024']))]:d.exames.filter(x=>g==='Todas'||x[2]===g).map(x=>[x[1],x[0]+' · '+x[2]+(x[3]?' · Toledo':''),x]);
        const terms=q.split(/\s+/),matches=rows.filter(r=>terms.every(t=>norm(r[0]+' '+r[1]).includes(t)));
        status.textContent=matches.length>25?'Primeiros 25 de '+matches.length+'. Refine a busca.':matches.length+' resultado(s).';
        for(const [name,meta,item] of matches.slice(0,25)){
          const b=button(name+' · '+meta,()=>{
            if(rx){drug.value=name;dose.focus();}
            else{const input=byId(p+'-exkit-manual-name'),kind=byId(p+'-exkit-manual-group');input.value=name+' ('+item[0]+')';kind.value=item[2];byId(p+'-exkit-painel').querySelector('[data-ex-action="manual"]').click();showToast('Item adicionado ao pedido para revisão.');}
            query.value='';find();
          });results.append(b);
        }
      }catch{if(n===ticket)status.textContent='Catálogo indisponível. Digite o item ou tente novamente.';}
    }
    query.oninput=group.onchange=find;
    parent.addEventListener('limpar-catalogo',()=>{ticket++;query.value='';group.selectedIndex=0;results.replaceChildren();status.textContent='';if(drug){drug.value='';dose.value='';}});
    let drug,dose;
    if(rx){
      box.append(el('p','Confira indicação, atribuição profissional e protocolo aplicável antes de prescrever.'));
      drug=field(box,'Medicamento e apresentação','text');dose=field(box,'Posologia, via, duração e quantidade','text');
      box.append(button('Adicionar à prescrição',()=>{
        if(!drug.value.trim()||!dose.value.trim()){showToast('Informe medicamento, apresentação e instruções de uso.');return;}
        target.value=[target.value.trim(),drug.value.trim()+' — '+dose.value.trim()].filter(Boolean).join('\n');
        target.dispatchEvent(new Event('input',{bubbles:true}));drug.value='';dose.value='';
      }));
    }
    box.append(sources);parent.prepend(box);
  }
  function mount(){
    for(const cfg of Object.values(MODULOS_ATENDIMENTO)){
      const p=cfg.prefix,page=byId('pg-'+cfg.page),pane=byId(cfg.soap[0])?.closest('.tp'),exam=byId(p+'-exkit-painel');
      if(!pane||!exam)continue;
      const wrapper=el('div'),nav=el('nav'),body=el('div'),areas={},buttons={};wrapper.className='order-workspace';nav.setAttribute('aria-label','Registro e solicitações');
      for(const [key,name] of Object.entries({soap:'SOAP',exam:'Exames',rx:'Prescrição'})){
        areas[key]=el('div');areas[key].id=p+'-area-'+key;
        buttons[key]=button(name,()=>show(p,key));buttons[key].setAttribute('aria-controls',areas[key].id);nav.append(buttons[key]);body.append(areas[key]);
      }
      areas.soap.append(...Array.from(pane.childNodes));wrapper.append(nav,body);pane.append(wrapper);
      const drawer=exam.closest('.order-drawer');areas.exam.append(exam);drawer?.remove();
      const input=byId(p+'-prescricoes-registradas');
      if(input){
        const old=input.closest('details'),label=input.labels?.[0];if(label)areas.rx.append(label);areas.rx.append(input);old?.remove();
        const confirmed=el('p');confirmed.id=p+'-rx-protocolo';confirmed.style.whiteSpace='pre-wrap';confirmed.hidden=true;areas.rx.prepend(confirmed);
        input.placeholder='Prescrição registrada nesta consulta';
        search(p,areas.rx,true,input);
        areas.rx.append(button('Imprimir prescrição',()=>{
          if(p==='smu'&&!ESFSaudeMulher.validate()||['pna','pnc'].includes(p)&&!ESFCorrimentoPN.validate(p,false))return;
          const text=[...prescriptions(p),input.value.trim()].filter(Boolean).join('\n\n');
          if(!text||!byId(cfg.nome)?.value.trim()||!temPermissao('gerar_documentos'))return showToast('Confira paciente, prescrição e permissão para imprimir.');
          const w=window.open('','_blank');if(!w)return showToast('Permita a abertura da impressão.');w.opener=null;
          const d=w.document;d.title='Prescrição';d.documentElement.lang='pt-BR';
          const h=d.createElement('h1');h.textContent='Prescrição';d.body.append(h);
          const prof=CURRENT_USER_PROFILE||{};
          for(const line of [prof.unidade,byId(cfg.nome).value,'Nascimento: '+(byId(p+'-nasc')?.value||'Não informado'),text,new Date().toLocaleDateString('pt-BR'),[prof.nome,prof.cargo,prof.conselho].filter(Boolean).join(' · '),'Assinatura do profissional']){
            const text=d.createElement('p');text.style.whiteSpace='pre-wrap';text.textContent=line;d.body.append(text);}
          w.focus();w.print();
        }));
      }
      search(p,areas.exam,false);views.set(p,{page,pane,areas,buttons});
      const t=page.querySelector('[aria-controls="'+pane.id+'"]');t?.addEventListener('click',()=>{for(const k in areas){areas[k].hidden=k!=='soap';buttons[k].setAttribute('aria-pressed',String(k==='soap'));}});
      for(const k in areas){areas[k].hidden=k!=='soap';buttons[k].setAttribute('aria-pressed',String(k==='soap'));}
    }
  }
  window.SolicitacoesAPS={show,limpar(p){const model=views.get(p);if(!model)return;for(const k of ['exam','rx'])model.areas[k].dispatchEvent(new Event('limpar-catalogo'));}};document.addEventListener('DOMContentLoaded',mount);
})();
