(() => {
  'use strict';
  const id = key => document.getElementById(key);
  const estados = ['Ativo','Latente','Resolvido'];
  function el(tag, text) {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    return n;
  }
  function acao(text, fn) {
    const n = el('button',text); n.type='button'; n.className='btn btn-s'; n.onclick=fn; return n;
  }
  const fmt = date => date ? date.slice(0,10).split('-').reverse().join('/') : '';
  const dia = (a,p) => (a.dados?.[p+'-data'] || a.dados?.[p+'-data-hora'] || a.data || '').slice(0,10);
  function eventos(raw,cpf,nasc) {
    let rows;
    try { rows=JSON.parse(raw); } catch { return []; }
    return Array.isArray(rows) ? rows.filter(r=>r && cpf && r.cpf===cpf && (!nasc||!r.nasc||r.nasc===nasc)
      && /^[A-Z]\d\d$/.test(r.code) && estados.includes(r.estado) && typeof r.data==='string') : [];
  }
  function resumo(records,cpf,nasc) {
    const problemas=new Map(), dados=new Map();
    const keys={Alergias:['alergias','alergia'],Medicamentos:['medicamentos','med'],PA:['pa','pa-atual'],Peso:['peso'],Estatura:['altura','alt']};
    for(const a of records) {
      const p=MODULOS_ATENDIMENTO[a.tipo]?.prefix;
      if(!p) continue;
      const data=dia(a,p),campos=a.dados||{};
      for(const entry of eventos(campos[p+'-condicoes-acompanhadas'],cpf,nasc)) {
        const old=problemas.get(entry.code);
        if(!old||entry.data>old.data||entry.data===old.data&&(a.data||'')>old.gravado)
          problemas.set(entry.code,{...entry,gravado:a.data||''});
      }
      for(const [label,sufixos] of Object.entries(keys)) {
        const value=sufixos.map(k=>campos[p+'-'+k]).find(v=>typeof v==='string'&&v.trim());
        if(value && (!dados.has(label)||dados.get(label).data<data)) dados.set(label,{value,data,tipo:a.tipo});
      }
    }
    return {problemas,dados};
  }
  function mostrar(p,records) {
    const history=id(p+'-historico-consulta'); if(!history)return;
    let box=id(p+'-resumo-longitudinal'),state=id(p+'-condicoes-acompanhadas');
    if(!box) {
      box=el('details');box.id=p+'-resumo-longitudinal';box.className='support-section';
      state=el('textarea');state.id=p+'-condicoes-acompanhadas';state.hidden=true;state.className='aps-new';
      history.before(box,state);
    }
    const cpf=normalizarCPF(id(p+'-cpf')?.value),nasc=id(p+'-nasc')?.value,scope=escopoDadosClinicos();
    const allowed=cpf.length===11&&scope.permitido&&temPermissao('ver_historico');
    const atuais=allowed?eventos(state.value,cpf,nasc):[];
    state.value=atuais.length?JSON.stringify(atuais):'';
    const {problemas,dados}=resumo(allowed?records:[],cpf,nasc);
    for(const row of atuais)problemas.set(row.code,row);
    const codigos=allowed?(window.ESFCiap?.capture(p)||[]):[];
    const codes=[...new Set([...problemas.keys(),...codigos.map(i=>i.code)])];
    const identity=JSON.stringify([scope.chave,cpf,nasc,ATENDIMENTO_EM_EDICAO]);
    const stamp=JSON.stringify([identity,allowed,[...problemas],[...dados],codigos.map(i=>i.code),atuais]);
    if(box._stamp===stamp)return;
    box._stamp=stamp;if(box._identity!==identity)box.open=false;box._identity=identity;
    box.replaceChildren();box.hidden=!allowed||!(dados.size||codes.length);
    if(box.hidden)return;
    const ativos=[...problemas.values()].filter(r=>r.estado==='Ativo');
    box.append(el('summary','Resumo do paciente · '+ativos.length+' problema(s) ativo(s)'+(dados.has('Alergias')?' · Alergias: '+dados.get('Alergias').value:'')));
    for(const [label,r] of dados)box.append(el('p',label+' · '+r.value+' ('+r.tipo+', '+fmt(r.data)+')'));
    const valid=()=>normalizarCPF(id(p+'-cpf')?.value)===cpf&&id(p+'-nasc')?.value===nasc
      &&escopoDadosClinicos().chave===scope.chave&&temPermissao('ver_historico');
    function gravar(rows) {
      if(!valid())return FluxoAPS.historico(p);
      state.value=rows.length?JSON.stringify(rows):'';
      state.dispatchEvent(new Event('input',{bubbles:true}));FluxoAPS.historico(p);
    }
    for(const code of codes) {
      const record=problemas.get(code),selected=codigos.some(i=>i.code===code);
      const label=code+' · '+(window.ESFCiap?.description(code)||''),line=el('div');line.className='brow';
      line.append(el('strong',label),el('span',record?record.estado+' · '+fmt(record.data):'Avaliado nesta consulta'));
      if(!selected)line.append(acao('Avaliar nesta consulta',()=>{if(valid())ESFCiap.incluirCodigo(p,code);}));
      else {
        const select=el('select');select.setAttribute('aria-label','Situação de '+code);
        for(const e of estados)select.append(new Option(e,e));
        select.value=record?.estado||'Ativo';
        line.append(select,acao(record?'Registrar evolução':'Acompanhar problema',()=>{
          const date=(id(p+'-data')?.value||id(p+'-data-hora')?.value||new Date().toLocaleDateString('sv-SE')).slice(0,10);
          gravar([...atuais.filter(r=>r.code!==code),{cpf,nasc,code,estado:select.value,data:date}]);
        }));
      }
      if(atuais.some(r=>r.code===code))line.append(acao('Desfazer alteração',()=>gravar(atuais.filter(r=>r.code!==code))));
      box.append(line);
    }
  }
  function gruposFamilia(ps) {
    const grupos=new Map(),pendentes=[];
    const norm=v=>String(v||'').trim().toLocaleLowerCase('pt-BR');
    for(const pessoa of ps) {
      if(!norm(pessoa.familia)||!norm(pessoa.microarea)||!norm(pessoa.unidade)){pendentes.push(pessoa);continue;}
      const key=JSON.stringify([pessoa.unidade,pessoa.microarea,pessoa.familia].map(norm));
      if(!grupos.has(key))grupos.set(key,[]);grupos.get(key).push(pessoa);
    }
    return {grupos,pendentes};
  }
  function territorio(ps,todos=ps) {
    const {grupos,pendentes}=gruposFamilia(ps);
    const completos=gruposFamilia(todos).grupos,dia=new Date().toLocaleDateString('sv-SE');
    let total=0;
    const vulneravel=p=>/^(média|media|alta)$/i.test(p.vulnerabilidade||'');
    const out=id('terr-familias-resumo');out.replaceChildren(el('summary','Famílias e moradores · '+grupos.size));
    for(const key of grupos.keys()){
      const moradores=completos.get(key),r=EstratificacaoAPS.escala(moradores,dia);
      const d=el('details'),p=moradores[0];d.append(el('summary',p.familia+' · '+p.microarea+' · '+moradores.length+' morador(es) · '+(r.completa?'Vulnerabilidade '+r.classe.toLowerCase()+' ('+r.pontos+' pontos)':'Escala incompleta')));
      if(r.completa?r.pontos>=7:moradores.some(vulneravel))total++;
      for(const m of moradores)d.append(acao(m.nome||'Abrir cadastro',()=>abrirCadastroTerritorial(m.cpf)));
      out.append(d);
    }
    if(pendentes.length)out.append(el('p',pendentes.length+' cadastro(s) sem identificação completa da família, microárea ou UBS.'));
    return total;
  }
  function acompanhar(){
    const out=id('ba-acompanhados');if(!out)return;
    out.replaceChildren();if(!temPermissao('ver_historico')||!escopoDadosClinicos().permitido)return;
    const micro=id('ba-microarea').value,busca=id('ba-busca').value.toLowerCase(),grupo=id('ba-populacao').value;
    for(const pessoa of dadosGestao()){
      if(micro&&pessoa.microarea!==micro||busca&&![pessoa.nome,pessoa.cpf,pessoa.cns,pessoa.microarea].join(' ').toLowerCase().includes(busca))continue;
      const registros=pessoa.consultas;
      const ativos=[...resumo(registros,pessoa.cpf,pessoa.nasc).problemas.values()].filter(r=>r.estado==='Ativo');
      let linhas=[];
      if(grupo==='Problemas ativos')linhas=ativos.map(r=>r.code+' '+(window.ESFCiap?.description(r.code)||''));
      else if(grupo==='Rastreamento e saúde da mulher'){
        for(const [titulo,tipos] of [['Preventivo',['Preventivo']],['Saúde da mulher',['Saúde da Mulher']],['Testes rápidos',['IST / Testes Rápidos']]]){
          const a=registros.find(a=>tipos.includes(a.tipo));if(a)linhas.push(titulo+' · '+fmt(dia(a,MODULOS_ATENDIMENTO[a.tipo].prefix)));
        }
      }else if(grupo==='Pessoa idosa'){
        const a=registros.find(a=>a.dados?.['ivcf20-class']);if(a)linhas=[a.dados['ivcf20-class']+' · '+fmt(dia(a,'id'))];
      }else if(grupo==='Exames a revisar')linhas=window.SeguimentoAPS.pendentes(registros,pessoa.cpf,pessoa.nasc);
      if(!linhas.length)continue;
      const item=el('p');item.append(acao(pessoa.nome||pessoa.cpf,()=>abrirPaciente(pessoa.cpf)),document.createTextNode(' · '+linhas.join(' · ')));out.append(item);
    }
    if(!out.childElementCount)out.append(el('p','Nenhuma pessoa com registro neste recorte.'));
  }
  window.ContinuidadeAPS={mostrar,resumo,territorio,gruposFamilia,acompanhar};
  document.addEventListener('DOMContentLoaded',()=>{
    document.addEventListener('input',e=>{
      if(!e.target.id?.endsWith('-cpf'))return;
      const p=e.target.id.slice(0,-4),box=id(p+'-resumo-longitudinal');
      if(!box?._identity)return;
      const previous=JSON.parse(box._identity)[1];
      if(previous&&previous!==normalizarCPF(e.target.value)&&window.ESFCiap?.capture(p).length)ESFCiap.restore(p,[]);
    },true);
    const filter=id('ba-populacao');filter.onchange=acompanhar;
    const panel=filter.closest('details');panel.ontoggle=()=>{if(panel.open)acompanhar();else id('ba-acompanhados').replaceChildren();};
    for(const key of ['ba-microarea','ba-busca'])id(key).addEventListener(key==='ba-busca'?'input':'change',()=>{if(panel.open)acompanhar();});
    document.addEventListener('input',e=>{
      if(e.target.id?.endsWith('-ciap-registro'))FluxoAPS.historico(e.target.id.split('-')[0]);
    });
    document.addEventListener('click',e=>{
      const panel=e.target.closest('[data-ciap]');
      if(!panel||!e.target.closest('button'))return;
      const p=panel.dataset.ciap;
      if(!id(p+'-atalho-problemas')){
        const b=acao('Ver problemas acompanhados',()=>{
          FluxoAPS.historico(p);
          const resumo=id(p+'-resumo-longitudinal');if(!resumo||resumo.hidden)return showToast('Identifique a pessoa por CPF e confirme um CIAP.');
          const tab=resumo.closest('.tp');document.querySelector('[aria-controls="'+tab.id+'"]')?.click();resumo.open=true;resumo.scrollIntoView();
        });b.id=p+'-atalho-problemas';panel.append(b);
      }
    });
  });
})();
