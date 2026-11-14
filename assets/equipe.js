(() => {
  'use strict';
  const host=()=>document.getElementById('equipe-painel');
  const flows={
    'Aguardando vaga':['Agendado','Aguardando atendimento','Cancelado'],
    'Agendado':['Agendado','Aguardando atendimento','Faltou','Cancelado'],
    'Aguardando atendimento':['Em escuta','Em atendimento','Cancelado'],
    'Em escuta':['Em atendimento','Compartilhado','Concluído'],
    'Em atendimento':['Em observação','Compartilhado','Concluído'],
    'Em observação':['Em atendimento','Compartilhado','Concluído'],
    'Compartilhado':['Respondido','Cancelado'],'Respondido':['Em atendimento','Concluído']
  };
  const id=key=>document.getElementById('eq-'+key);
  let generation=0,timer,sequence=0;
  function node(tag,text){const n=document.createElement(tag);if(text)n.textContent=text;return n;}
  function btn(text,action){const b=node('button',text);b.type='button';b.className='btn btn-s';b.onclick=action;return b;}
  function field(parent,label,type,key,choices) {
    const l=node('label',label),c=node(choices?'select':type==='textarea'?'textarea':'input');
    l.className='f';if(choices)for(const name of choices)c.append(new Option(name,name));
    else if(type!=='textarea')c.type=type;
    if(key)c.id='eq-'+key;l.append(c);parent.append(l);return c;
  }
  function today(){return new Date().toLocaleDateString('sv-SE');}
  function localDateTime(ts){const d=new Date(ts);return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
  function limpar(){generation++;sequence++;clearInterval(timer);host()?.replaceChildren();}
  const active=(g,scope)=>g===generation&&document.getElementById('pg-equipe')?.classList.contains('on')
    && temPermissao('ver_historico')&&escopoDadosClinicos().chave===scope;
  function navegar(page){
    limpar();if(page!=='equipe'||!temPermissao('ver_historico'))return;
    const s=escopoDadosClinicos(),g=generation,root=host();
    if(!s.permitido||!_sb||window.MODO_OFFLINE){root.append(node('p','Entre com uma conta conectada à UBS para consultar a agenda compartilhada.'));return;}
    const toolbar=node('div');toolbar.className='card';
    const unidades=s.municipal?(window.ESFUnidadesToledo?.unidades||[]).map(u=>u.nome):[s.unidade];
    const unit=field(toolbar,'UBS','', 'unidade',unidades);
    if(s.unidade&&unidades.includes(s.unidade))unit.value=s.unidade;
    const mode=field(toolbar,'Exibir','','visao',['Agenda e fila','Aguardando vaga','Cuidado compartilhado','Vacinação','Retornos de vacina','Atividades coletivas','Imóveis','Produção']);
    const day=field(toolbar,'Dia','date','dia');day.value=today();
    const professional=field(toolbar,'Profissional da agenda','','profissional',['Todos os profissionais']);
    const search=field(toolbar,'Buscar por nome, CPF, responsável ou descrição','search','busca');
    const state=node('p');state.setAttribute('role','status');
    const entry=node('details'),list=node('div');entry.className='card';list.className='card';root.append(toolbar,entry,state,list);
    let rows=[],patients={},viewKey='',writeLock=false;
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
        onOk?.();state.textContent='Registro salvo.';await refresh(false);
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
      let cpf,estado,horario,prof,dia,dose,lote,fabricante,proxima,count,members;
      if(!group){cpf=field(grid,'CPF do paciente cadastrado','text');cpf.required=true;cpf.inputMode='numeric';}
      if(operational){
        estado=field(grid,'Entrada','','',modeName==='Cuidado compartilhado'?['Compartilhado']:modeName==='Aguardando vaga'?['Aguardando vaga']:['Aguardando atendimento','Agendado','Aguardando vaga','Compartilhado']);
        prof=field(grid,'Profissional responsável','text');prof.required=true;prof.maxLength=160;prof.value=CURRENT_USER_PROFILE?.nome||'';
        horario=field(grid,'Dia e horário da consulta','datetime-local');
        const sync=()=>{horario.parentElement.hidden=estado.value!=='Agendado';horario.required=!horario.parentElement.hidden;};
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
        const payload=operational?{id:key,cpf:patient,unidade:u,estado:estado.value,profissional:prof.value.trim(),motivo:motivo.value.trim(),horario:estado.value==='Agendado'?new Date(horario.value).toISOString():null}
          :{id:key,unidade:u,tipo:isDose?estado.value:'Atividade coletiva',dia:dia.value,descricao:motivo.value.trim(),cpf:patient||null,
            participantes:group?Number(count.value):null,participantes_cpf:group?members.value.split(/\n/).filter(v=>v.trim()).map(v=>normalizarCPF(v)):[],
            dose:dose?.value.trim()||null,lote:lote?.value.trim()||null,fabricante:fabricante?.value.trim()||null,proxima:proxima?.value||null};
        escrever(save,()=>_sb.from(operational?'agenda_ubs':'acoes_ubs').insert(payload).select('id').maybeSingle(),fillForm);
      };
    }
    function transitions(row,line){
      const options=flows[row.estado];if(!options)return;
      const details=node('details');details.append(node('summary','Atualizar ou passar o caso'));line.append(details);
      const form=node('form');details.append(form);
      const next=field(form,'Próxima situação','','',options),prof=field(form,'Passar para / responsável','text');
      prof.required=true;prof.value=row.profissional;prof.maxLength=160;
      const time=field(form,'Novo horário','datetime-local');if(row.horario)time.value=localDateTime(row.horario);
      const note=field(form,'Escuta ou devolutiva','textarea');note.maxLength=2000;note.value=row.devolutiva||'';
      const sync=()=>{time.required=next.value==='Agendado';time.parentElement.hidden=!time.required;note.required=next.value==='Respondido';};
      next.onchange=sync;sync();
      const save=node('button','Confirmar mudança');save.type='submit';save.className='btn btn-s';form.append(save);
      form.onsubmit=e=>{e.preventDefault();const patch={estado:next.value,profissional:prof.value.trim(),devolutiva:note.value.trim()};
        if(next.value==='Agendado')patch.horario=new Date(time.value).toISOString();
        escrever(save,()=>_sb.from('agenda_ubs').update(patch).eq('id',row.id).eq('versao',row.versao).select('id').maybeSingle());
      };
    }
    function draw(){
      list.replaceChildren();const q=search.value.trim().toLocaleLowerCase('pt-BR');
      const filtered=rows.filter(r=>professional.hidden||!professional.value||r.profissional===professional.value).filter(r=>[r.cpf,patientName(r.cpf,r),r.descricao,r.profissional,r.motivo,r.estado,r.microarea,r.endereco,r.complemento].join(' ').toLocaleLowerCase('pt-BR').includes(q));
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
          const title=node('strong');title.append(patient,document.createTextNode(' · '+row.estado));
          card.append(title,node('p',[row.horario?new Date(row.horario).toLocaleString('pt-BR'):'',row.profissional,row.motivo,row.devolutiva].filter(Boolean).join(' · ')));
          const history=node('details');history.append(node('summary','Histórico da passagem de caso'));
          history.ontoggle=async()=>{if(!history.open||history.childElementCount>1)return;
            const {data,error}=await _sb.from('agenda_ubs_historico').select('estado,responsavel,anotacao,registrado_em').eq('agenda_id',row.id).order('versao');
            if(!current()||!history.isConnected)return;
            if(error){state.textContent='Falha ao consultar histórico. Feche e reabra para tentar novamente.';return;}
            for(const event of data)history.append(node('p',[new Date(event.registrado_em).toLocaleString('pt-BR'),event.estado,event.responsavel,event.anotacao].filter(Boolean).join(' · ')));
          };card.append(history);
          transitions(row,card);
        } else card.append(node('strong',row.descricao+' · '+(row.cpf?patientName(row.cpf):row.participantes+' participantes')),
          node('p',[row.dia,row.tipo,row.dose,row.lote&&'Lote '+row.lote,row.fabricante,row.proxima&&'Próxima dose '+row.proxima].filter(Boolean).join(' · ')));
        if(row.participantes_cpf?.length){const members=node('details');members.append(node('summary','Participantes identificados'));
          for(const cpf of row.participantes_cpf)members.append(node('p',patientName(cpf)));card.append(members);}
        list.append(card);
      }
      if(!filtered.length)list.append(node('p','Nenhum registro neste recorte.'));
    }
    async function loadPages(build){
      const result=[];
      for(let offset=0;;offset+=500){const {data,error}=await build().order('id').range(offset,offset+499);
        if(error)throw error;result.push(...data);if(data.length<500)return result;}
    }
    async function refresh(reset=true){
      const ticket=++sequence,key=filterKey(),u=unit.value,m=mode.value,d=day.value;
      if(reset){rows=[];list.replaceChildren();state.textContent='Carregando…';}
      if(!current()||!d||!u)return;
      try{
        const start=new Date(d+'T00:00:00'),finish=new Date(start);finish.setDate(finish.getDate()+1);
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
            const open=await loadPages(()=>queue().in('estado',['Aguardando atendimento','Em escuta','Em atendimento','Em observação']));
            data=[...new Map([...data,...open].map(r=>[r.id,r])).values()];
          }
        }
        if(!current()||ticket!==sequence||key!==filterKey())return;
        patients=carregarPacientes();data.sort((a,b)=>(a.horario||a.criado_em).localeCompare(b.horario||b.criado_em));
        rows=data;viewKey=key;
        if(!professional.hidden){
          const selected=professional.value,names=[...new Set(rows.map(r=>r.profissional).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
          professional.replaceChildren(new Option('Todos os profissionais',''),...names.map(name=>new Option(name,name)));
          professional.value=names.includes(selected)?selected:'';
        }
        draw();state.textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR')+'.';
      }catch{if(current()&&ticket===sequence){if(viewKey!==key)list.replaceChildren();state.textContent='Não foi possível atualizar. Confira a conexão e tente novamente.';}}
    }
    function switchView(){professional.hidden=professional.parentElement.hidden=mode.value!=='Agenda e fila';fillForm();day.parentElement.hidden=['Aguardando vaga','Cuidado compartilhado','Imóveis'].includes(mode.value);refresh();}
    unit.onchange=()=>{professional.value='';switchView();};mode.onchange=switchView;professional.onchange=draw;day.onchange=()=>refresh();search.oninput=draw;
    toolbar.append(btn('Atualizar lista',()=>refresh()));switchView();
    timer=setInterval(()=>{if(current()&&!document.hidden&&!entry.open&&!list.querySelector('details[open]')&&!writeLock)refresh(false);},20000);
  }
  window.EquipeAPS={navegar,limpar};
})();
