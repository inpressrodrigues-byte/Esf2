(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const element=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const join=(...parts)=>parts.filter(Boolean).join(' · ');
  const json=value=>{try{return typeof value==='string'?JSON.parse(value):value;}catch{return null;}};
  const date=value=>{
    if(!value)return 'Data não registrada';
    if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value.split('-').reverse().join('/');
    const d=new Date(value);return Number.isNaN(+d)?String(value):d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  };
  let origin='pacientes',trigger,scrollYBefore=0;
  const sections={
    'Identificação':['identificacao','user'],'Consultas':['consultas','clipboard'],
    'Exames solicitados':['exames','flask'],'Medicações prescritas':['medicacoes','pill'],'Vacinas':['vacinas','syringe']
  };
  function icon(name){
    const n=element('span');n.className='chart-icon';n.setAttribute('aria-hidden','true');n.innerHTML=ic(name);return n;
  }
  function section(root,title){
    const box=element('section');box.className='prontuario-secao';
    const [key,glyph]=sections[title];box.id='prontuario-'+key;
    const h=element('h2',title);h.prepend(icon(glyph));box.append(h);root.append(box);return box;
  }
  function line(box,title,detail){
    const item=element('article');item.className='pac-consulta';item.append(element('strong',title));
    if(detail)item.append(element('p',detail));box.append(item);
  }
  function identify(root,p,cpf){
    byId('pac-modal-titulo').textContent=p.nome||'Paciente sem nome';
    const words=(p.nome||'').trim().split(/\s+/);
    byId('pg-prontuario').querySelector('.chart-avatar').textContent=((words[0]?.[0]||'')+(words.length>1?words.at(-1)[0]:'')).toLocaleUpperCase('pt-BR');
    const unit=byId('prontuario-unidade');unit.hidden=!p.unidade;unit.textContent=p.unidade||'';
    const box=section(root,'Identificação'),grid=element('div');grid.className='pac-detail-grid';box.append(grid);
    const field=(label,value)=>{const n=element('div');n.className='pac-detail-item';n.append(element('b',label),document.createTextNode(value||'Não informado'));grid.append(n);};
    field('Nascimento',p.nasc&&formatarDataBR(p.nasc));field('Cartão SUS (CNS)',p.cns);field('CPF',formatarCPF(cpf));
    if(p.prontuario)field('Registro local',p.prontuario);
    if(p.telefone)field('Telefone',p.telefone);
    const extra=element('details');extra.append(element('summary','Mais dados do cadastro'));
    for(const [key,label,type] of PACIENTE_CAMPOS_EDICAO){
      if(['nome','nasc','cns','cpf','telefone','prontuario'].includes(key)||!p[key])continue;
      extra.append(element('p',label+' — '+(type==='date'?formatarDataBR(p[key]):p[key])));
    }
    if(extra.childElementCount>1)box.append(extra);
    window.ESFEscopo?.mostrarVinculo(cpf,p,box);
  }
  function consultations(root,rows,cpf,nasc,warning){
    const visits=section(root,'Consultas'),exams=section(root,'Exames solicitados'),meds=section(root,'Medicações prescritas');
    if(warning)visits.append(element('p',warning));
    const valid=rows.filter(r=>MODULOS_ATENDIMENTO[r.tipo]&&r.dados);
    const orders=SeguimentoAPS.pedidos(valid),results=new Map(),vaccines=[];
    for(const r of valid){
      const p=MODULOS_ATENDIMENTO[r.tipo].prefix;
      for(const result of SeguimentoAPS.resultados(r.dados[p+'-resultados-vinculados'],cpf,nasc)){
        const key=SeguimentoAPS.keyOf(result);if(!results.has(key))results.set(key,result);
      }
    }
    const meus=new Set(carregarAtendimentos().filter(r=>r.cpf===cpf&&r.user_id===CURRENT_AUTH_USER_ID).map(r=>r.id));
    for(const r of rows){
      const details=element('details');details.className='pac-consulta';
      const author=r.profissional||'Profissional não registrado',when=join(date(r.data),author);
      const summary=element('summary'),info=element('span'),time=element('span',date(r.data)),chevron=element('span','⌄');
      info.className='chart-visit-info';time.className='chart-time';chevron.className='chart-chevron';chevron.setAttribute('aria-hidden','true');
      info.append(element('strong',r.tipo||'Consulta'),element('small',author));
      summary.append(time,info,chevron);details.classList.add('chart-visit');
      details.append(summary,element('p',r.soap||'SOAP não registrado nesta consulta.'));
      const tri=json(r.dados?.[MODULOS_ATENDIMENTO[r.tipo]?.prefix+'-triagem-agenda']);
      if(tri?.cpf===cpf&&tri.medidas)details.append(element('p','Triagem · '+date(tri.em)+' — '+AgendaClinica.summary({triagem:tri.medidas})));
      if(meus.has(r.id)&&MODULOS_ATENDIMENTO[r.tipo]&&Object.keys(r.dados||{}).length){
        const reopen=element('button','Reabrir minha consulta');reopen.type='button';reopen.className='btn btn-s';
        reopen.onclick=()=>{fecharPaciente();reabrirAtendimento(r.id);};details.append(reopen);
      }
      if(r.synced===false)details.append(element('small','Aguardando sincronização'));
      visits.append(details);
      const p=MODULOS_ATENDIMENTO[r.tipo]?.prefix,d=r.dados||{};if(!p)continue;
      const names=new Set();
      const orderData=json(d[p+'-exkit-order']);
      for(const item of Array.isArray(orderData?.items)?orderData.items:[]){
        const key=SeguimentoAPS.keyOf({origem:r.id,confirmadoEm:orderData.confirmedAt,exameId:item?.id});
        const order=orders.get(key);if(!order||names.has(order.nome))continue;
        names.add(order.nome);const result=results.get(key);
        line(exams,order.nome,join(when,result&&('Resultado de '+date(result.data)+' — '+result.resultado)));
      }
      const records=json(d['smu-protocolo-registros']);
      for(const v of Array.isArray(records)?records:[]){
        if(v?.id==='exames'&&typeof v.plan==='string'){
          const requested=v.plan.split('\n')[0].replace(/^Solicitados:\s*/,'').replace(/\.$/,'').split(';').map(x=>x.trim()).filter(Boolean);
          for(const name of requested)if(!names.has(name)){names.add(name);line(exams,name,when);}
        }
        if(['corrimento','contracepcao'].includes(v?.id)&&v.plan)line(meds,v.title||'Prescrição',join(when,v.plan));
      }
      const corr=json(d[p+'-corr-registro']);
      if(corr?.code&&corr.plan)line(meds,corr.title||'Prescrição',join(when,corr.plan));
      if(d[p+'-prescricoes-registradas'])line(meds,d[p+'-prescricoes-registradas'],when);
      if(p==='ist'&&d['ist-tratamento'])line(meds,'Tratamento realizado em IST',join(when,d['ist-tratamento']));
      if(d['vac-texto-'+p])for(const v of interpretarHistoricoVacinal(d['vac-texto-'+p])){
        if(v.vacina)vaccines.push({dia:v.data.split('/').reverse().join('-'),descricao:v.vacina,dose:v.dose,lote:v.lote,tipo:'Histórico transcrito na consulta',profissional:v.prof,unidade:v.unidade});
      }
    }
    if(!rows.length)visits.append(element('p',warning?'Nenhuma consulta disponível neste aparelho.':'Nenhuma consulta vinculada a este CPF.'));
    if(exams.childElementCount===1)exams.append(element('p','Nenhum pedido estruturado nas consultas exibidas.'));
    if(meds.childElementCount===1)meds.append(element('p','Nenhuma prescrição estruturada nas consultas exibidas. Prescrições em texto livre podem ser consultadas no SOAP.'));
    return vaccines;
  }
  async function pages(build){
    const all=[];
    for(let i=0;;i+=200){
      const {data,error}=await build().order('id').range(i,i+199);
      if(error||!Array.isArray(data))throw error||Error('Resposta indisponível');
      all.push(...data);if(data.length<200)return all;
    }
  }
  function renderDoses(root,records,failed){
    const box=section(root,'Vacinas'),seen=new Set();
    if(failed)box.append(element('p','Não foi possível consultar as doses da equipe.'));
    for(const r of records.sort((a,b)=>b.dia.localeCompare(a.dia))){
      const key=[r.dia,r.descricao,r.dose,r.lote].map(x=>String(x||'').trim().toLocaleLowerCase('pt-BR')).join('|');
      if(seen.has(key))continue;seen.add(key);
      line(box,join(r.descricao,r.dose),join(date(r.dia),r.tipo,r.lote&&'Lote '+r.lote,r.fabricante,r.profissional,r.unidade,r.proxima&&'Próxima dose em '+date(r.proxima)));
    }
    if(!seen.size&&!failed)box.append(element('p','Nenhuma dose registrada.'));
  }
  function limpar(){
    PACIENTE_MODAL_CPF='';
    byId('pac-modal-conteudo').replaceChildren();byId('pac-modal-titulo').textContent='Prontuário';
    byId('prontuario-unidade').replaceChildren();byId('prontuario-unidade').hidden=true;
    byId('pg-prontuario').querySelector('.chart-avatar').replaceChildren();
    byId('prontuario-acoes').hidden=true;byId('prontuario-acoes').open=false;
    trigger=null;origin='pacientes';scrollYBefore=0;
  }
  function voltar(){
    const focus=trigger,offset=scrollYBefore;
    const target=moduloAtivo(origin)?origin:'inicio';
    go(target,document.querySelector('.nb[data-ux-page="'+target+'"]'));
    if(focus?.isConnected)focus.focus({preventScroll:true});
    window.scrollTo({top:offset,behavior:'instant'});
  }
  function shortcuts(root){
    const nav=element('nav');nav.className='chart-jumps';nav.setAttribute('aria-label','Seções do prontuário');
    for(const [label,[key,glyph]] of Object.entries(sections).slice(1)){
      const link=element('a',label),target=byId('prontuario-'+key);link.href='#'+target.id;link.prepend(icon(glyph));
      link.onclick=e=>{e.preventDefault();target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});};nav.append(link);
    }
    root.querySelector('section').after(nav);
  }
  async function abrir(cpf,selectedUnit){
    const scope=escopoDadosClinicos();
    if(!scope.permitido||!temPermissao('ver_historico'))return;
    const cached=carregarPacientes()[cpf],unit=selectedUnit||cached?.unidade||scope.unidade;
    if(!scope.municipal&&unit!==scope.unidade)return;
    const root=element('div'),page=byId('pg-prontuario');
    if(!page.classList.contains('on')){
      origin=document.querySelector('.pg.on')?.id.slice(3)||'pacientes';
      trigger=document.activeElement;scrollYBefore=window.scrollY;
    }
    byId('prontuario-voltar').textContent='← '+({equipe:'Voltar à agenda',pacientes:'Voltar aos pacientes','busca-ativa':'Voltar à busca ativa',territorio:'Voltar ao território'}[origin]||'Voltar');
    byId('prontuario-unidade').hidden=true;byId('prontuario-unidade').textContent='';page.querySelector('.chart-avatar').replaceChildren(icon('user'));
    byId('prontuario-acoes').open=false;
    PACIENTE_MODAL_CPF=cpf;
    const current=()=>root.isConnected&&PACIENTE_MODAL_CPF===cpf&&escopoDadosClinicos().chave===scope.chave&&temPermissao('ver_historico');
    byId('pac-modal-conteudo').replaceChildren(root);byId('pac-modal-titulo').textContent='Prontuário';
    const actions=(enabled)=>{for(const id of ['pac-editar-btn','pac-excluir-btn'])byId(id).disabled=!enabled;};
    actions(false);byId('prontuario-acoes').hidden=true;byId('pac-excluir-btn').hidden=!scope.municipal;
    if(!page.classList.contains('on'))go('prontuario');
    byId('pac-modal-titulo').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
    const online=!!_sb&&!window.MODO_OFFLINE&&navigator.onLine;
    const message=element('p','Carregando prontuário…');message.setAttribute('role','status');root.append(message);
    let patient=cached;
    if(online){
      try{
        let query=_sb.from('pacientes').select('cpf,unidade,dados').eq('cpf',cpf);
        if(unit)query=query.eq('unidade',unit);
        const {data,error}=await query.maybeSingle();if(!current())return;if(error)throw error;
        const pending=(json(localStorage.getItem(chavePacientesPendentes()))||[]).includes(cpf);
        if(!data&&!(cached&&pending&&cached.unidade===unit)){message.textContent='Cadastro indisponível nesta UBS.';return;}
        if(data){
          patient={...data.dados,...(pending?cached:{}),cpf,unidade:data.unidade};
          salvarPacientesLocal({...carregarPacientes(),[cpf]:patient});
        }
      }catch{if(current())message.textContent='Não foi possível verificar o cadastro. Feche e abra o prontuário para tentar novamente.';return;}
    }
    if(!patient||(!scope.municipal&&patient.unidade!==scope.unidade)){message.textContent='Cadastro indisponível nesta UBS.';return;}
    root.replaceChildren();identify(root,patient,cpf);actions(true);byId('prontuario-acoes').hidden=false;
    registrarAuditoria('Prontuário consultado','CPF final '+String(cpf).slice(-4));
    const local=carregarAtendimentos().filter(r=>r.cpf===cpf&&(r.unidade||null)===(patient.unidade||null));
    let visits=local,doses=[],warning='Histórico local. Conecte-se para consultar a equipe.',doseError=true;
    if(online&&patient.unidade){
      root.append(message);message.textContent='Carregando consultas e vacinas da equipe…';
      const [v,d]=await Promise.allSettled([
        pages(()=>_sb.from('atendimentos').select('id,id_local,tipo,tipo_atendimento,profissional,data,soap,soap_text,dados,dados_json').eq('unidade',patient.unidade).eq('paciente_cpf',cpf).order('data',{ascending:false})),
        pages(()=>_sb.from('acoes_ubs').select('id,dia,descricao,tipo,dose,lote,fabricante,proxima').eq('unidade',patient.unidade).eq('cpf',cpf).in('tipo',['Dose aplicada','Dose transcrita']).order('dia',{ascending:false}))
      ]);if(!current())return;message.remove();
      if(v.status==='fulfilled'){
        const rows=new Map(v.value.map(r=>[r.id_local||r.id,{...r,id:r.id_local||r.id,tipo:r.tipo||r.tipo_atendimento,soap:r.soap||r.soap_text,dados:{...r.dados_json,...r.dados}}]));
        for(const r of local)if(r.synced===false)rows.set(r.id,r);
        visits=[...rows.values()];warning='';
      }else warning='Não foi possível carregar as consultas da equipe. Exibindo os registros deste aparelho.';
      if(d.status==='fulfilled'){doses=d.value;doseError=false;}
    }
    visits.sort((a,b)=>(Date.parse(b.data)||0)-(Date.parse(a.data)||0));
    const transcribed=consultations(root,visits,cpf,patient.nasc,warning);
    renderDoses(root,[...doses,...transcribed],doseError);shortcuts(root);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    for(const cfg of Object.values(MODULOS_ATENDIMENTO)){
      const plan=byId(cfg.soap[3]);if(!plan)continue;
      const box=element('details'),label=element('label','Medicamento, apresentação e posologia'),input=element('textarea');
      box.className='support-section';input.className='aps-new';input.rows=2;input.id=cfg.prefix+'-prescricoes-registradas';
      label.htmlFor=input.id;box.append(element('summary','Registrar medicação prescrita nesta consulta'),label,input);
      (plan.closest('.f')||plan).after(box);
    }
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&byId('pg-prontuario')?.classList.contains('on')){e.preventDefault();fecharPaciente();}
  });
  window.ProntuarioAPS={abrir,voltar,limpar};
})();
