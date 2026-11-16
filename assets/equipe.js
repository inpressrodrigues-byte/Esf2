(() => {
  'use strict';
  const host=()=>document.getElementById('equipe-painel');
  const flows={
    'Aguardando vaga':['Agendado','Aguardando atendimento','Cancelado'],
    'Agendado':['Agendado','Aguardando atendimento','Faltou','Cancelado'],
    'Aguardando atendimento':['Em escuta','Cancelado'],
    'Em escuta':['Triagem concluída','Compartilhado','Concluído'],
    'Triagem concluída':['Em atendimento','Cancelado'],
    'Em atendimento':['Em observação','Compartilhado','Concluído'],
    'Em observação':['Em atendimento','Compartilhado','Concluído'],
    'Compartilhado':['Respondido','Cancelado'],'Respondido':['Em atendimento','Concluído']
  };
  function fase(estado){
    if(['Aguardando vaga','Agendado'].includes(estado))return 'Agendados';
    if(['Aguardando atendimento','Em escuta'].includes(estado))return 'Triagem';
    if(['Cancelado','Concluído','Faltou'].includes(estado))return 'Encerrados';
    return 'Atendimento';
  }
  let generation=0,timer,sequence=0,retomar;
  function node(tag,text){const n=document.createElement(tag);if(text)n.textContent=text;return n;}
  function btn(text,action){const b=node('button',text);b.type='button';b.className='btn btn-s';b.onclick=action;return b;}
  function field(parent,label,type,key,choices) {
    const l=node('label',label),c=node(choices?'select':type==='textarea'?'textarea':'input');
    c.setAttribute('aria-label',label);l.className='f';if(choices)for(const name of choices)c.append(new Option(name,name));
    else if(type!=='textarea')c.type=type;
    if(key)c.id='eq-'+key;l.append(c);parent.append(l);return c;
  }
  function today(){return new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});}
  function limpar(){retomar=null;generation++;sequence++;clearInterval(timer);host()?.replaceChildren();}
  const active=(g,scope)=>g===generation&&document.getElementById('pg-equipe')?.classList.contains('on')
    && temPermissao('ver_historico')&&escopoDadosClinicos().chave===scope;
  function navegar(page){
    if(page==='prontuario')return;
    if(page==='equipe'&&retomar&&retomar.scope===escopoDadosClinicos().chave&&temPermissao('ver_historico')){
      retomar.atualizar();return;
    }
    limpar();if(page!=='equipe'||!temPermissao('ver_historico'))return;
    const s=escopoDadosClinicos(),g=generation,root=host();
    if(!s.permitido||!_sb||window.MODO_OFFLINE){root.append(node('p','Entre com uma conta conectada à UBS para consultar a agenda compartilhada.'));return;}
    const toolbar=node('div');toolbar.className='card agenda-filtros';
    const unidades=s.municipal?(window.ESFUnidadesToledo?.unidades||[]).map(u=>u.nome):[s.unidade];
    const unit=field(toolbar,'UBS','', 'unidade',unidades);
    if(s.unidade&&unidades.includes(s.unidade))unit.value=s.unidade;
    const mode=field(toolbar,'Exibir','','visao',['Agenda e fila','Aguardando vaga','Cuidado compartilhado','Vacinação','Retornos de vacina','Atividades coletivas','Imóveis','Produção']);
    const day=field(toolbar,'Dia','date','dia');day.value=today();
    const dates=node('div');dates.className='agenda-datas';
    const shift=delta=>{if(!delta)day.value=today();else{const date=new Date((day.value||today())+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+delta);day.value=date.toISOString().slice(0,10);}refresh();};
    dates.append(btn('Dia anterior',()=>shift(-1)),btn('Hoje',()=>shift(0)),btn('Próximo dia',()=>shift(1)));day.parentElement.after(dates);
    const professional=field(toolbar,'Profissional da agenda','','profissional',['Todos os profissionais']);
    const search=field(toolbar,'Buscar por nome, CPF, responsável ou descrição','search','busca');
    const state=node('p');state.setAttribute('role','status');
    const entry=node('details'),list=node('div');entry.className='card';list.className='card';root.append(toolbar,entry,state,list);
    let rows=[],vagasDia=[],patients={},viewKey='',writeLock=false,segment='Em aberto';
    const current=()=>active(g,s.chave);
    const filterKey=()=>JSON.stringify([unit.value,mode.value,day.value]);
    function patientName(cpf,row){return row?.pacientes?.nome||patients[cpf]?.nome||cpf;}
    async function escrever(button,fn,onOk) {
      if(!current()||writeLock)return;
      writeLock=true;button.disabled=true;const key=filterKey();
      try {
        const r=await fn();
        if(!current()||key!==filterKey())return;
        if(r.error)throw r.error;
        if(!r.data)throw Error('conflito');
        onOk?.();if(!current())return;state.textContent='Registro salvo.';await refresh(false);
      } catch(e) {
        if(current()&&key===filterKey())state.textContent=e.code==='23505'?'Este horário já está reservado ou o registro já foi recebido. Atualize a lista.':
          e.message==='conflito'?'Outro profissional atualizou o registro. Atualize a lista antes de tentar novamente.':'Registro não confirmado. Confira os campos, o vínculo do paciente e a conexão.';
      } finally{writeLock=false;button.disabled=false;}
    }
    function fillForm(){
      entry.replaceChildren();entry.open=false;
      const modeName=mode.value, action=modeName==='Vacinação'?'Registrar dose':modeName==='Atividades coletivas'?'Registrar atividade':modeName==='Imóveis'?'Cadastrar imóvel':'Nova entrada';
      entry.hidden=['Produção','Retornos de vacina'].includes(modeName);if(entry.hidden)return;
      entry.append(node('summary',action));
      const form=node('form'),grid=node('div');grid.className='g3';form.append(grid);entry.append(form);
      const key=crypto.randomUUID();
      if(modeName==='Imóveis'){
        const micro=field(grid,'Microárea','text'),address=field(grid,'Endereço e número','text'),extra=field(grid,'Complemento','text');
        micro.required=address.required=true;
        const save=node('button','Cadastrar');save.type='submit';save.className='btn btn-s';form.append(save);
        form.onsubmit=e=>{e.preventDefault();escrever(save,()=>_sb.from('imoveis_ubs').insert({id:key,unidade:unit.value,
          microarea:micro.value.trim(),endereco:address.value.trim(),complemento:extra.value.trim()}).select('id').maybeSingle(),fillForm);};
        return;
      }
      const isDose=modeName==='Vacinação',group=modeName==='Atividades coletivas',operational=!group&&!isDose;
      let cpf,estado,vagas,prof,dia,dose,lote,fabricante,proxima,count,members;
      if(!group){cpf=field(grid,'CPF do paciente cadastrado','text');cpf.required=true;cpf.inputMode='numeric';}
      if(operational){
        estado=field(grid,'Entrada','','',modeName==='Cuidado compartilhado'?['Compartilhado']:modeName==='Aguardando vaga'?['Aguardando vaga']:['Aguardando atendimento','Agendado','Aguardando vaga','Compartilhado']);
        prof=field(grid,'Profissional responsável','text');prof.required=true;prof.maxLength=160;prof.value=CURRENT_USER_PROFILE?.nome||'';
        vagas=AgendaClinica.picker(grid,unit,day);
        const sync=()=>{const agendar=estado.value==='Agendado';vagas.toggle(agendar);prof.required=!agendar;prof.parentElement.hidden=agendar;};
        estado.onchange=sync;sync();
      } else {
        dia=field(grid,'Data de realização','date');dia.value=today();dia.max=today();dia.required=true;
        if(isDose){estado=field(grid,'Origem','','',['Dose aplicada','Dose transcrita']);dose=field(grid,'Dose','text');dose.required=true;
          lote=field(grid,'Lote','text');fabricante=field(grid,'Fabricante','text');proxima=field(grid,'Próxima dose pactuada','date');
          const sync=()=>{lote.required=fabricante.required=estado.value==='Dose aplicada';};
          estado.onchange=sync;sync();
        } else {count=field(grid,'Número de participantes','number');count.min='1';count.step='1';count.required=true;
          members=field(grid,'CPFs dos participantes identificados (um por linha)','textarea');}
      }
      const motivo=field(grid,isDose?'Vacina':group?'Tema e tipo de atividade':'Motivo ou questão para a equipe','textarea');motivo.required=true;motivo.maxLength=operational?1000:300;
      const save=node('button','Salvar');save.type='submit';save.className='btn btn-p';form.append(save);
      form.onsubmit=e=>{
        e.preventDefault();const patient=cpf&&normalizarCPF(cpf.value),u=unit.value;
        if(cpf&&patient.length!==11){state.textContent='Informe o CPF com 11 dígitos.';cpf.focus();return;}
        if(isDose&&proxima.value&&proxima.value<=dia.value){state.textContent='A próxima dose precisa ter uma data posterior à realização.';return;}
        const vaga=estado?.value==='Agendado'?vagas?.value():null;
        if(estado?.value==='Agendado'&&!vaga){state.textContent='Selecione uma vaga disponível.';return;}
        const payload=operational?{id:key,cpf:patient,unidade:u,estado:estado.value,profissional:vaga?.profissional||prof.value.trim(),motivo:motivo.value.trim(),horario:vaga?.inicio||null,horario_id:vaga?.id||null}
          :{id:key,unidade:u,tipo:isDose?estado.value:'Atividade coletiva',dia:dia.value,descricao:motivo.value.trim(),cpf:patient||null,
            participantes:group?Number(count.value):null,participantes_cpf:group?members.value.split(/\n/).filter(v=>v.trim()).map(v=>normalizarCPF(v)):[],
            dose:dose?.value.trim()||null,lote:lote?.value.trim()||null,fabricante:fabricante?.value.trim()||null,proxima:proxima?.value||null};
        escrever(save,()=>_sb.from(operational?'agenda_ubs':'acoes_ubs').insert(payload).select('id').maybeSingle(),fillForm);
      };
    }
    function transitions(row,line){
      const options=flows[row.estado]?.filter(o=>o!=='Cancelado'&&!(row.estado==='Triagem concluída'&&o==='Em atendimento')&&!(row.estado==='Agendado'&&o==='Aguardando atendimento'));if(!options?.length)return;
      const details=node('details');details.append(node('summary',row.estado==='Agendado'?'Reagendar ou registrar falta':row.estado==='Em escuta'?'Registrar triagem':'Atualizar ou passar o caso'));line.append(details);
      const form=node('form');details.append(form);
      const next=field(form,'Próxima situação','','',options),prof=field(form,'Passar para / responsável','text');
      prof.required=true;prof.value=row.profissional;prof.maxLength=160;
      const vagas=AgendaClinica.picker(form,unit,day,row),ssvv=AgendaClinica.triage(form);
      const note=field(form,'Escuta ou devolutiva','textarea');note.maxLength=2000;note.value=row.devolutiva||'';
      const sync=()=>{const booking=next.value==='Agendado';vagas.toggle(booking&&details.open);prof.required=!booking;prof.parentElement.hidden=booking;ssvv.toggle(next.value==='Triagem concluída');note.required=next.value==='Respondido';};
      next.onchange=sync;details.ontoggle=sync;sync();
      const save=node('button','Confirmar mudança');save.type='submit';save.className='btn btn-s';form.append(save);
      form.onsubmit=e=>{e.preventDefault();const patch={estado:next.value,profissional:prof.value.trim(),devolutiva:note.value.trim()};
        if(next.value==='Agendado'){const vaga=vagas.value();if(!vaga)return;Object.assign(patch,{horario:vaga.inicio,horario_id:vaga.id,profissional:vaga.profissional});}
        if(next.value==='Triagem concluída'){patch.triagem=ssvv.value();if(!Object.keys(patch.triagem).length){state.textContent='Registre os sinais vitais ou o motivo de não aferição.';return;}}
        escrever(save,()=>_sb.from('agenda_ubs').update(patch).eq('id',row.id).eq('versao',row.versao).select('id').maybeSingle());
      };
    }
    function draw(){
      list.replaceChildren();const q=search.value.trim().toLocaleLowerCase('pt-BR');
      let filtered=rows.filter(r=>professional.hidden||!professional.value||r.profissional===professional.value).filter(r=>[r.cpf,patientName(r.cpf,r),r.descricao,r.profissional,r.motivo,r.estado,r.microarea,r.endereco,r.complemento].join(' ').toLocaleLowerCase('pt-BR').includes(q));
      if(mode.value==='Agenda e fila'){
        const strip=node('nav');strip.className='agenda-segmentos';strip.setAttribute('aria-label','Etapas da agenda');
        const matches=(r,label)=>label==='Em aberto'?fase(r.estado)!=='Encerrados':fase(r.estado)===label;
        for(const label of ['Em aberto','Agendados','Triagem','Atendimento','Encerrados']){
          const total=filtered.filter(r=>matches(r,label)).length;
          const tab=btn(label+' ('+total+')',()=>{segment=label;draw();list.querySelector('[aria-pressed="true"]')?.focus();});
          tab.setAttribute('aria-pressed',String(segment===label));strip.append(tab);
        }
        list.append(strip);filtered=filtered.filter(r=>matches(r,segment));
      }
      if(mode.value==='Agenda e fila'&&['Em aberto','Agendados'].includes(segment)&&!search.value.trim()){
        const livres=vagasDia.filter(x=>Date.parse(x.inicio)>Date.now()&&(!professional.value||x.profissional===professional.value)&&!x.agenda_ubs?.some(a=>!['Cancelado','Faltou'].includes(a.estado)));
        if(livres.length){const free=node('details');free.append(node('summary','Horários livres ('+livres.length+')'));
          for(const prof of new Set(livres.map(x=>x.profissional)))free.append(node('p',prof+' · '+livres.filter(x=>x.profissional===prof).map(x=>AgendaClinica.clock(x.inicio)).join(', ')));list.append(free);}
      }
      if(mode.value==='Produção'){
        const counts=new Map();for(const r of filtered){const tipo=r.tipo||r.estado;counts.set(tipo,(counts.get(tipo)||0)+1);}
        for(const [tipo,total] of counts)list.append(node('p',tipo+' · '+total+' registro(s)'));
      } else for(const row of filtered){
        const card=node('article');card.className='support-section';
        if(mode.value==='Imóveis'){
          card.append(node('strong',row.endereco+' '+row.complemento),node('p',row.microarea+' · '+(row.ativo?'Ativo':'Inativo')+(row.justificativa?' · '+row.justificativa:'')));
          const details=node('details');details.append(node('summary',row.ativo?'Inativar imóvel':'Reativar imóvel'));card.append(details);
          const motivo=field(details,'Motivo da alteração','text');const save=btn('Confirmar situação',()=>{
            if(!motivo.value.trim()){motivo.focus();return;}
            escrever(save,()=>_sb.from('imoveis_ubs').update({ativo:!row.ativo,justificativa:motivo.value.trim()}).eq('id',row.id).eq('versao',row.versao).select('id').maybeSingle());
          });details.append(save);
        }else if(row.estado){
          const patient=btn(patientName(row.cpf,row),()=>abrirPaciente(row.cpf,unit.value));
          patient.className='agenda-paciente';patient.title='Abrir prontuário';
          card.className='agenda-linha';const title=node('div');title.className='agenda-resumo';
          const time=node('time',row.horario?AgendaClinica.clock(row.horario):'Encaixe'),badge=node('span',row.estado);badge.className='agenda-estado';badge.dataset.fase=fase(row.estado);
          title.append(time,patient,badge);
          card.append(title,node('p',[row.horario&&mode.value!=='Agenda e fila'?new Date(row.horario).toLocaleString('pt-BR'):'',row.profissional,row.motivo,row.devolutiva].filter(Boolean).join(' · ')));
          const history=node('details');history.append(node('summary','Histórico da passagem de caso'));
          history.ontoggle=async()=>{if(!history.open||history.childElementCount>1)return;
            const {data,error}=await _sb.from('agenda_ubs_historico').select('estado,responsavel,anotacao,registrado_em').eq('agenda_id',row.id).order('versao');
            if(!current()||!history.isConnected)return;
            if(error){state.textContent='Falha ao consultar histórico. Feche e reabra para tentar novamente.';return;}
            for(const event of data)history.append(node('p',[new Date(event.registrado_em).toLocaleString('pt-BR'),event.estado,event.responsavel,event.anotacao].filter(Boolean).join(' · ')));
          };card.append(history);
          if(row.estado==='Agendado'||row.estado==='Aguardando atendimento'){
            const next=row.estado==='Agendado'?'Aguardando atendimento':'Em escuta';
            const quick=btn(row.estado==='Agendado'?'Registrar chegada':'Iniciar triagem',()=>escrever(quick,()=>_sb.from('agenda_ubs').update({estado:next}).eq('id',row.id).eq('versao',row.versao).select('id').maybeSingle()));
            card.append(quick);
          }
          if(fase(row.estado)!=='Encerrados'){
            const removal=node('details'),toggle=node('summary','Remover da agenda');
            toggle.className='agenda-cancelar';
            const cancel=btn('Confirmar remoção',()=>escrever(cancel,()=>_sb.from('agenda_ubs').update({estado:'Cancelado'}).eq('id',row.id).eq('versao',row.versao).select('id').maybeSingle()));
            const keep=btn('Manter na agenda',()=>{removal.open=false;toggle.focus();});
            removal.append(toggle,node('p','Remover '+patientName(row.cpf,row)+' desta agenda? A passagem ficará registrada como cancelada.'),cancel,keep);card.append(removal);
          }
          ChamadorAPS.caller(row,unit.value,card);
          if(row.triagem)card.append(node('p','Triagem · '+new Date(row.triado_em).toLocaleString('pt-BR')+' — '+AgendaClinica.summary(row)));
          if(['Triagem concluída','Em atendimento'].includes(row.estado)){
            const type=field(card,'Tipo de consulta','','',Object.keys(MODULOS_ATENDIMENTO).filter(t=>moduloAtivo(MODULOS_ATENDIMENTO[t].page)));
            type.value='Consulta Geral';
            const open=btn(row.estado==='Em atendimento'?'Abrir atendimento':'Iniciar atendimento',()=>{
              if(!type.value)return;
              if(row.estado==='Em atendimento')AgendaClinica.encounter(row,type.value);
              else escrever(open,()=>_sb.from('agenda_ubs').update({estado:'Em atendimento'}).eq('id',row.id).eq('versao',row.versao).select('id').maybeSingle(),()=>AgendaClinica.encounter(row,type.value));
            });card.append(open);
          }
          transitions(row,card);
        } else card.append(node('strong',row.descricao+' · '+(row.cpf?patientName(row.cpf):row.participantes+' participantes')),
          node('p',[row.dia,row.tipo,row.dose,row.lote&&'Lote '+row.lote,row.fabricante,row.proxima&&'Próxima dose '+row.proxima].filter(Boolean).join(' · ')));
        if(row.participantes_cpf?.length){const members=node('details');members.append(node('summary','Participantes identificados'));
          for(const cpf of row.participantes_cpf)members.append(node('p',patientName(cpf)));card.append(members);}
        list.append(card);
      }
      if(!filtered.length&&!list.querySelector('details,article')&&(mode.value==='Agenda e fila'||!list.childElementCount))list.append(node('p','Nenhum registro neste recorte.'));
    }
    async function loadPages(build){
      const result=[];
      for(let offset=0;;offset+=500){const {data,error}=await build().order('id').range(offset,offset+499);
        if(error)throw error;result.push(...data);if(data.length<500)return result;}
    }
    async function refresh(reset=true){
      const ticket=++sequence,key=filterKey(),u=unit.value,m=mode.value,d=day.value;
      if(reset){rows=[];vagasDia=[];list.replaceChildren();state.textContent='Carregando…';}
      if(!current()||!d||!u)return;
      try{
        const start=new Date(d+'T00:00:00-03:00'),finish=new Date(+start+86400000);
        const queue=()=>_sb.from('agenda_ubs').select('*,pacientes(nome:dados->>nome)').eq('unidade',u);
        const tasks=()=>_sb.from('acoes_ubs').select('*').eq('unidade',u).eq('dia',d);
        const wait=m==='Aguardando vaga',share=m==='Cuidado compartilhado',prod=m==='Produção';
        let data;
        if(m==='Imóveis')data=await loadPages(()=>_sb.from('imoveis_ubs').select('*').eq('unidade',u));
        else if(wait||share)data=await loadPages(()=>queue().in('estado',wait?['Aguardando vaga']:['Compartilhado','Respondido']));
        else if(m==='Retornos de vacina'){
          const doses=await loadPages(()=>_sb.from('acoes_ubs').select('*').eq('unidade',u).in('tipo',['Dose aplicada','Dose transcrita']).lte('dia',d));
          const ultimas=new Map();
          for(const r of doses){
            const key=JSON.stringify([r.cpf,r.descricao.trim().toLocaleLowerCase('pt-BR')]),old=ultimas.get(key);
            if(!old||r.dia>old.dia||r.dia===old.dia&&r.criado_em>old.criado_em)ultimas.set(key,r);
          }
          data=[...ultimas.values()].filter(r=>r.proxima&&r.proxima<=d);
        }else if(m==='Vacinação'||m==='Atividades coletivas')data=await loadPages(()=>tasks().in('tipo',m==='Vacinação'?['Dose aplicada','Dose transcrita']:['Atividade coletiva']));
        else {
          const a=start.toISOString(),b=finish.toISOString();
          const scheduled=await loadPages(()=>queue().or('and(horario.gte.'+a+',horario.lt.'+b+'),and(horario.is.null,criado_em.gte.'+a+',criado_em.lt.'+b+')'));
          data=prod?[...scheduled,...await loadPages(tasks)]:scheduled;
          if(!prod&&d===today()) {
            const open=await loadPages(()=>queue().in('estado',['Aguardando atendimento','Em escuta','Triagem concluída','Em atendimento','Em observação']));
            data=[...new Map([...data,...open].map(r=>[r.id,r])).values()];
          }
        }
        if(!current()||ticket!==sequence||key!==filterKey())return;
        const vagas=m==='Agenda e fila'?await AgendaClinica.slots(u,d):[];
        if(!current()||ticket!==sequence||key!==filterKey())return;
        vagasDia=vagas;patients=carregarPacientes();data.sort((a,b)=>(a.horario||a.criado_em).localeCompare(b.horario||b.criado_em));
        rows=data;viewKey=key;
        if(!professional.hidden){
          const selected=professional.value,names=[...new Set([...rows,...vagasDia].map(r=>r.profissional).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
          professional.replaceChildren(new Option('Todos os profissionais',''),...names.map(name=>new Option(name,name)));
          professional.value=names.includes(selected)?selected:'';
        }
        draw();state.textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR')+'.';
      }catch{if(current()&&ticket===sequence){if(viewKey!==key)list.replaceChildren();state.textContent='Não foi possível atualizar. Confira a conexão e tente novamente.';}}
    }
    function switchView(){professional.hidden=professional.parentElement.hidden=mode.value!=='Agenda e fila';fillForm();day.parentElement.hidden=['Aguardando vaga','Cuidado compartilhado','Imóveis'].includes(mode.value);dates.hidden=day.parentElement.hidden;refresh();}
    unit.onchange=()=>{professional.value='';segment='Em aberto';switchView();};mode.onchange=switchView;professional.onchange=draw;day.onchange=()=>refresh();search.oninput=draw;
    ChamadorAPS.panel(toolbar,unit,current);
    AgendaClinica.availability(toolbar,unit,day,current,()=>{refresh();fillForm();});
    toolbar.append(btn('Atualizar lista',()=>refresh()));switchView();
    retomar={scope:s.chave,atualizar:()=>refresh(false)};
    timer=setInterval(()=>{if(current()&&!document.hidden&&!entry.open&&!list.querySelector('details[open]')&&!writeLock)refresh(false);},20000);
  }
  window.EquipeAPS={navegar,limpar};
})();
