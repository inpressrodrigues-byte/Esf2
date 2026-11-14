(()=>{
  'use strict';
  const id=k=>document.getElementById(k),value=k=>id(k)?.value||'';
  const R=window.EstratificacaoAPS,simNao=['Sim','Não'];
  const today=()=>new Date().toLocaleDateString('sv-SE');
  function campo(grid,key,label,options,type='text'){
    const wrap=document.createElement('div'),l=document.createElement('label'),input=document.createElement(options?'select':'input');
    wrap.className='f';l.textContent=label;l.htmlFor=input.id=key;input.className='aps-new';
    if(options){input.add(new Option('Não informado',''));options.forEach(v=>input.add(new Option(v,v)));}
    else input.type=type;
    wrap.append(l,input);grid.append(wrap);return input;
  }
  function grupo(anchor,title){
    const panel=document.createElement('details'),head=document.createElement('summary'),grid=document.createElement('div');
    head.textContent=title;panel.className='support-section';grid.className='g2';panel.append(head,grid);anchor.after(panel);
    return {panel,grid,head};
  }
  function cardio(){
    if(!id('hip-cv-out'))return;
    const date=value('hip-data-hora').slice(0,10)||value('hip-data')||today(),nasc=value('hip-nasc');
    const patient=normalizarCPF(value('hip-cpf')),known=carregarPacientes()[patient]||{};
    const codes=(window.ESFCiap?.capture('hip')||[]).map(item=>item.code);
    for(const a of window.FluxoAPS?.registros('hip')||[])for(const item of a.dados?.__ciap2||[])codes.push(item.code);
    const dm=['Diabetes','Hipertensão e diabetes'].includes(value('hip-diagnostico'))?'Sim':value('hip-cv-dm');
    const result=R.cardiovascular({nasc,dia:date,codes,dcv:value('hip-cv-dcv'),dm,drc:value('hip-cv-drc'),
      sexo:value('hip-cv-sexo')||value('hip-sexo')||known.sexo,fuma:value('hip-cv-fuma'),pa:value('hip-pa-atual')||value('hip-pa'),
      peso:value('hip-peso'),alt:value('hip-alt')||value('hip-altura'),ct:value('hip-cv-ct'),dataCt:value('hip-cv-data-ct')});
    id('hip-cv-out').textContent=result;id('hip-cv-resultado').value=/^(?:Risco |\d+%)/.test(result)?result:'';
  }
  function montar(){
    const risco=id('hip-risco-cv');
    if(risco){
      const {panel,grid}=grupo(risco.closest('.f'),'Estimar risco cardiovascular em 10 anos');
      campo(grid,'hip-cv-dcv','Histórico de doença cardiovascular abrangida pelo PEC',simNao);
      campo(grid,'hip-cv-drc','Doença renal crônica',simNao);campo(grid,'hip-cv-dm','Diabetes mellitus',simNao);
      campo(grid,'hip-cv-sexo','Sexo para a tabela (se ausente ou divergente no cadastro)',['Masculino','Feminino']);
      campo(grid,'hip-cv-fuma','Fuma atualmente?',simNao);
      const ct=campo(grid,'hip-cv-ct','Colesterol total (mg/dL)',null,'number');ct.min=1;ct.step='any';
      campo(grid,'hip-cv-data-ct','Data do colesterol total',null,'date');
      const out=document.createElement('p');out.id='hip-cv-out';out.setAttribute('role','status');
      const result=document.createElement('input');result.type='hidden';result.id='hip-cv-resultado';result.className='aps-new';
      const link=document.createElement('a');link.textContent='Consultar tabelas originais da OMS';link.href='https://cdn.who.int/media/docs/default-source/cardiovascular-diseases/tropical-latin-america.pdf';link.target='_blank';link.rel='noopener';
      panel.append(out,result,link);panel.ontoggle=()=>{if(panel.open)cardio();};
      const page=risco.closest('.pg');
      id('hip-cpf').addEventListener('input',()=>{for(const input of grid.querySelectorAll('input,select'))input.value='';});
      for(const event of ['input','change'])page.addEventListener(event,e=>{if(e.target.id?.startsWith('hip-')&&!Object.values(SOAP_IDS_MODULO.hip).includes(e.target.id))cardio();});
      const restore=window.restaurarDadosModulo;window.restaurarDadosModulo=function(p,...args){const v=restore.call(this,p,...args);if(p==='hip')cardio();return v;};
      cardio();
    }
    const {grid,panel}=grupo(id('terr-cronicas').closest('.g2'),'Avaliar vulnerabilidade familiar · Coelho-Savassi');
    for(const [k,label] of R.sentinelas){
      const input=campo(grid,'terr-cs-'+k,label,simNao);TERR_IDS['cs_'+k]=input.id;
    }
    campo(grid,'terr-cs-saneamento','Condições de saneamento precárias no domicílio',simNao);
    for(const [k,label] of [['moradores','Moradores no domicílio (todas as famílias)'],['comodos','Número de cômodos do domicílio']]){
      const input=campo(grid,'terr-cs-'+k,label,null,'number');input.min='1';input.step='1';
    }
    const source=document.createElement('a');source.textContent='Critérios e pontuação da escala';source.href='https://app4.unasus.gov.br/ppuplayer4_idoso/uploads/recursos/SE_UNASUS_0002_IDOSO_ACOES_ESTRATEGICAS/8/assets/lib/docs/Vulnerabilidade_Familiar_Escala_Coelho_Savassi.pdf';source.target='_blank';source.rel='noopener';panel.append(source);
    for(const k of ['terr-familia','terr-microarea'])id(k).addEventListener('change',()=>{
      const ps=carregarPacientes(),p=ps[normalizarCPF(value('terr-cpf'))]||{};
      carregarDom(ps,{...p,familia:value('terr-familia'),microarea:value('terr-microarea')});
    });
  }
  function domicilio(pessoas,p){
    const key=R.familyKey(p);
    return Object.values(pessoas).filter(m=>R.familyKey(m)===key&&m.cs_domicilio?.familia===key)
      .map(m=>m.cs_domicilio).sort((a,b)=>b.atualizado.localeCompare(a.atualizado))[0];
  }
  function carregarDom(ps,p){
    const d=p&&domicilio(ps,p);
    for(const k of ['saneamento','moradores','comodos'])if(id('terr-cs-'+k))id('terr-cs-'+k).value=d?.[k]||'';
  }
  function salvarDom(p){
    const key=R.familyKey(p);
    if(!p.unidade||!p.familia||!p.microarea)return;
    p.cs_domicilio={familia:key,atualizado:new Date().toISOString(),saneamento:value('terr-cs-saneamento'),moradores:value('terr-cs-moradores'),comodos:value('terr-cs-comodos')};
  }
  window.AvaliacoesAPS={cardio,carregarDom,salvarDom};
  document.addEventListener('DOMContentLoaded',montar);
})();
