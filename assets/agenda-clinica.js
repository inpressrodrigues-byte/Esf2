(() => {
  'use strict';
  const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const measurements=[['pas','PA sistólica','mmHg'],['pad','PA diastólica','mmHg'],['fc','Frequência cardíaca','bpm'],['fr','Frequência respiratória','irpm'],['temp','Temperatura','°C'],['spo2','Saturação','%']];
  const clock=value=>new Date(value).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});
  const dayOf=value=>new Date(value).toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});
  const instant=(day,time)=>new Date(day+'T'+time+':00-03:00');
  function input(parent,label,type){
    const wrap=el('label',label),n=el(type==='select'?'select':'input');if(type!=='select')n.type=type;n.setAttribute('aria-label',label);wrap.className='f';wrap.append(n);parent.append(wrap);return n;
  }
  async function slots(unit,day){
    const start=instant(day,'00:00'),end=new Date(+start+86400000),all=[];
    for(let i=0;;i+=200){
      const {data,error}=await _sb.from('agenda_horarios').select('id,inicio,profissional,profissional_id,agenda_ubs(id,estado)').eq('unidade',unit).gte('inicio',start.toISOString()).lt('inicio',end.toISOString()).order('inicio').order('id').range(i,i+199);
      if(error)throw error;all.push(...data);if(data.length<200)return all;
    }
  }
  function picker(parent,unit,day,row){
    const group=el('div');group.className='g3';parent.append(group);
    const date=input(group,'Dia da vaga','date'),who=input(group,'Agenda do profissional','select'),time=input(group,'Horário disponível','select');
    date.value=row?.horario?dayOf(row.horario):day.value;let choices=[],ticket=0;
    function render(){
      time.replaceChildren(new Option('Selecione o horário',''),...choices.filter(x=>x.profissional===who.value).map(x=>new Option(clock(x.inicio),x.id)));
      if(row?.horario_id&&choices.some(x=>x.id===row.horario_id&&x.profissional===who.value))time.value=row.horario_id;
    }
    async function load(){
      const key=++ticket,u=unit.value,scope=escopoDadosClinicos().chave;choices=[];time.replaceChildren();who.replaceChildren(new Option('Carregando…',''));
      try{const data=await slots(u,date.value);if(!group.isConnected||ticket!==key||unit.value!==u||scope!==escopoDadosClinicos().chave)return;
        choices=data.filter(x=>Date.parse(x.inicio)>Date.now()&&!x.agenda_ubs?.some(a=>a.id!==row?.id&&!['Cancelado','Faltou'].includes(a.estado)));
        const names=[...new Set(choices.map(x=>x.profissional))];
        who.replaceChildren(new Option(names.length?'Selecione o profissional':'Sem vagas neste dia',''),...names.map(n=>new Option(n,n)));
        if(names.includes(row?.profissional))who.value=row.profissional;else if(names.length===1)who.value=names[0];render();
      }catch{if(ticket===key)who.replaceChildren(new Option('Falha ao consultar vagas',''));}
    }
    date.onchange=load;who.onchange=render;
    group.hidden=true;
    return {toggle(visible){const changed=group.hidden===visible;group.hidden=!visible;date.required=who.required=time.required=visible;if(visible&&changed)load();},
      value:()=>choices.find(x=>x.id===time.value&&x.profissional===who.value)};
  }
  function availability(toolbar,unit,day,current,onSaved){
    const details=el('details');details.className='support-section';details.append(el('summary','Meus horários de atendimento'));
    const form=el('form'),grid=el('div');grid.className='g3';form.append(grid);
    const date=input(grid,'Data da agenda','date'),start=input(grid,'Início','time'),end=input(grid,'Fim','time'),step=input(grid,'Intervalo por consulta (min)','number');
    date.value=day.value;date.min=dayOf(Date.now());step.min=1;step.max=480;
    for(const n of [date,start,end,step])n.required=true;
    const save=el('button','Abrir horários'),status=el('p'),list=el('div');save.className='btn btn-s';status.setAttribute('role','status');form.append(save);details.append(form,status,list);toolbar.append(details);
    let sequence=0;
    async function show(){
      const t=++sequence;list.replaceChildren();if(!current()||!details.open||!date.value)return;
      try{const data=await slots(unit.value,date.value);if(!current()||t!==sequence)return;
        for(const s of data.filter(x=>x.profissional_id===CURRENT_AUTH_USER_ID)){
          const used=s.agenda_ubs?.some(x=>!['Faltou','Cancelado'].includes(x.estado));
          const b=el('button',clock(s.inicio)+(used?' · reservado':' · retirar'));b.type='button';b.className='btn btn-s';b.disabled=used||s.agenda_ubs?.length>0||Date.parse(s.inicio)<=Date.now();
          b.onclick=async()=>{b.disabled=true;const r=await _sb.from('agenda_horarios').delete().eq('id',s.id).select('id').maybeSingle();if(!current())return;status.textContent=r.error||!r.data?'Não foi possível retirar a vaga.':'Horário retirado.';show();onSaved();};list.append(b);
        }
      }catch{if(current())status.textContent='Não foi possível consultar os horários.';}
    }
    details.ontoggle=show;date.onchange=show;unit.addEventListener('change',()=>{sequence++;details.open=false;list.replaceChildren();status.textContent='';});
    form.onsubmit=async e=>{
      e.preventDefault();const u=unit.value,owner=CURRENT_USER_PROFILE;
      if(!current()||owner?.unidade!==u||!owner?.nome){status.textContent='Escolha a UBS vinculada ao seu perfil.';return;}
      const a=instant(date.value,start.value),b=instant(date.value,end.value),ms=Number(step.value)*60000;
      if(+a<=Date.now()||!ms||+b-+a<ms){status.textContent='Confira o período futuro e a duração da consulta.';return;}
      save.disabled=true;
      try{const existing=await slots(u,date.value);if(!current()||unit.value!==u)return;
        const used=new Set(existing.filter(x=>x.profissional_id===CURRENT_AUTH_USER_ID).map(x=>Date.parse(x.inicio)));
        const rows=[];for(let t=+a;t+ms<=+b;t+=ms)if(!used.has(t))rows.push({unidade:u,profissional:owner.nome.trim(),inicio:new Date(t).toISOString(),duracao:ms/60000});
        if(rows.length){const {error}=await _sb.from('agenda_horarios').insert(rows);if(error)throw error;}
        if(current()){status.textContent=rows.length+' horário(s) aberto(s).';show();onSaved();}
      }catch{if(current())status.textContent='Horários não confirmados. Confira sobreposições na sua agenda.';}finally{save.disabled=false;}
    };
  }
  function triage(form){
    const group=el('fieldset');group.className='g3';group.append(el('legend','Sinais vitais da triagem'));form.append(group);
    const fields=measurements.map(([k,label,unit])=>{const n=input(group,label+' ('+unit+')','number');n.min=k==='temp'?'0.1':'1';n.max=k==='spo2'?100:999;n.step=k==='temp'?'0.1':'1';return [k,n];});
    const note=input(group,'Observações ou motivo de medida não aferida','text');note.maxLength=500;fields.push(['obs',note]);
    return {toggle(on){group.hidden=!on;group.disabled=!on;},value(){return Object.fromEntries(fields.filter(([,n])=>n.value.trim()).map(([k,n])=>[k,n.value.trim()]));}};
  }
  function summary(r){return [...measurements.filter(([k])=>r.triagem?.[k]).map(([k,l,u])=>l+' '+r.triagem[k]+' '+u),r.triagem?.obs].filter(Boolean).join(' · ');}
  function encounter(row,type){
    const cfg=MODULOS_ATENDIMENTO[type];if(!cfg||!moduloAtivo(cfg.page)||!escopoDadosClinicos().permitido)return;
    const p=cfg.prefix,pac=carregarPacientes()[row.cpf]||{},dados={};
    for(const [k,id] of Object.entries(CAMPOS_PACIENTE[p]||{}))if(pac[k])dados[id]=pac[k];
    dados[cfg.cpf]=formatarCPF(row.cpf);dados[cfg.nome]=row.pacientes?.nome||pac.nome||'';
    dados[p+'-triagem-agenda']=JSON.stringify({id:row.id,cpf:row.cpf,unidade:row.unidade,em:row.triado_em,medidas:row.triagem});
    const tri=row.triagem||{};
    for(const key of ['fc','fr','temp','spo2'])if(tri[key])dados[p+'-'+key]=tri[key];
    if(tri.pas&&tri.pad)dados[p+'-pa']=tri.pas+'/'+tri.pad;
    ATENDIMENTO_EM_EDICAO=null;go(cfg.page);
    const page=document.getElementById('pg-'+cfg.page);page.querySelectorAll('.ux-draft-prompt').forEach(x=>x.remove());
    restaurarDadosModulo(p,dados);
    document.getElementById(cfg.nome)?.dispatchEvent(new Event('input',{bubbles:true}));
    renderEncounter(p);
  }
  function renderEncounter(p){
    const store=document.getElementById(p+'-triagem-agenda'),out=document.getElementById(p+'-triagem-resumo');if(!store||!out)return;
    let data;try{data=JSON.parse(store.value);}catch{}
    const scope=escopoDadosClinicos();
    out.hidden=!data||data.cpf!==normalizarCPF(document.getElementById(p+'-cpf')?.value)||!scope.permitido||!scope.municipal&&scope.unidade!==data.unidade;
    out.textContent=out.hidden?'':'Triagem · '+new Date(data.em).toLocaleString('pt-BR')+' — '+summary({triagem:data.medidas});
    if(!out.hidden&&data.id&&_sb){
      const call=el('button','Chamar paciente');call.type='button';call.className='btn btn-s';
      call.onclick=async()=>{
        call.disabled=true;const scope=escopoDadosClinicos().chave;
        try{
          const r=await _sb.from('agenda_ubs').select('id,estado,versao,unidade,profissional').eq('id',data.id).eq('cpf',data.cpf).eq('unidade',data.unidade).maybeSingle();
          if(!call.isConnected||scope!==escopoDadosClinicos().chave)return;
          if(r.error||!r.data||r.data.estado!=='Em atendimento'){showToast('A chamada está disponível durante o atendimento na fila.');return;}
          call.remove();ChamadorAPS.caller(r.data,data.unidade,out);out.lastElementChild.open=true;
        }catch{if(call.isConnected)showToast('Não foi possível consultar a fila.');}finally{call.disabled=false;}
      };out.append(call);
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    for(const cfg of Object.values(MODULOS_ATENDIMENTO)){
      const page=document.getElementById('pg-'+cfg.page),tabs=page?.querySelector('.tabs');if(!tabs)continue;
      const store=el('textarea'),out=el('div');store.hidden=true;store.className='aps-new';store.id=cfg.prefix+'-triagem-agenda';
      out.id=cfg.prefix+'-triagem-resumo';out.className='alert alert-i';out.hidden=true;tabs.before(store,out);
      const cpf=document.getElementById(cfg.cpf);cpf?.addEventListener('input',()=>{if(store.value){renderEncounter(cfg.prefix);if(out.hidden)store.value='';}});
    }
  });
  window.AgendaClinica={slots,clock,picker,availability,triage,summary,encounter,renderEncounter};
})();
