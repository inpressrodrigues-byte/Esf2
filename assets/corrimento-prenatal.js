/* Corrimento no próprio atendimento pré-natal. Compartilha as regras municipais
 * com Saúde da Mulher; não transfere dados entre pacientes ou módulos. */
(() => {
  'use strict';
  const R=window.SaudeMulherRegras,prefixes=['pna','pnc'],labels=new Map();
  const byId=id=>document.getElementById(id),get=(p,k)=>byId(p+'-'+k)?.value||'',val=(p,k)=>get(p,'corr-'+k);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const active=p=>val(p,'ativo')==='Sim';
  const page=p=>byId(p==='pna'?'pg-pn-abertura':'pg-pn-consulta');
  const field=(p,id,label,type='select',options=['Não','Sim'])=>{
    labels.set(id,label);const full=p+'-corr-'+id;
    const input=type==='select'?`<select id="${full}"><option value="">Não avaliado</option>${options.map(x=>{const [value,text]=Array.isArray(x)?x:[x,x];return `<option value="${esc(value)}">${esc(text)}</option>`;}).join('')}</select>`:type==='textarea'?`<textarea id="${full}" rows="3"></textarea>`:`<input id="${full}" type="${type}" ${type==='number'?'step="any" min="0"':''}>`;
    return `<div class="f"><label for="${full}">${esc(label)}</label>${input}</div>`;
  };
  const list=items=>'<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  function selected(p){return [...page(p).querySelectorAll('.clinical-chip.selected')].map(e=>e.dataset.text||e.textContent).concat([...page(p).querySelectorAll(`#${p}-queixas-clin input:checked,#${p}-queixas-gin input:checked,[data-priority]:checked`)].map(e=>e.dataset.priority||e.closest('label')?.textContent.trim()||''));}
  function obstetricAlerts(p){
    const selectedFlags=selected(p).filter(s=>!/^(nega|sem|nao)\b/.test(norm(s))).filter(s=>/sangramento vaginal|perda de liquido|contrac|diminuicao de mf|dispneia|alteracoes visuais|dor epigastrica|dor abdominal|instabilidade/.test(norm(s)));
    if(/sangue|liquido/.test(norm(get(p,'perda-tipo'))))selectedFlags.push('Perda vaginal registrada: '+get(p,'perda-tipo'));
    const pa=get(p,'pa').match(/^(\d+)\s*\/\s*(\d+)$/);if(pa&&(+pa[1]>=140||+pa[2]>=90))selectedFlags.push('PA elevada: avaliar fluxo obstétrico');
    return [...new Set(selectedFlags)];
  }
  function data(p){
    const fields=Object.fromEntries([...labels.keys()].map(k=>[k,val(p,k)]));
    return {...fields,gestante:'Sim',ig:get(p,'ig').match(/^(\d+)/)?.[1]||'',temp:get(p,'temp')};
  }
  function fingerprint(p){return JSON.stringify({patient:[get(p,'nome'),get(p,'cpf'),get(p,'nasc')],data:data(p),ig:get(p,'ig'),dum:get(p,'dum'),med:get(p,'med'),allergy:get(p,'alergia'),complaints:get(p,'queixas'),selected:selected(p),loss:get(p,'perda-tipo'),pa:get(p,'pa')});}
  function record(p){try{const r=JSON.parse(val(p,'registro')||'null');return r&&typeof r.plan==='string'&&r.code?r:null;}catch{return null;}}
  function state(p){
    const d=data(p),e=R.discharge(d),r=record(p);e.pending.push(...obstetricAlerts(p));
    const denies=[get(p,'queixas'),...selected(p)].some(s=>/nega[^.!?;\n]*(corrimento|queixas)|sem (queixas|corrimento)/.test(norm(s)));
    if(active(p)&&denies)e.pending.push('Concilie a negativa de queixas/corrimento registrada na anamnese com esta avaliação');
    if(d.diagnostico==='cand'&&!(Number.isInteger(Number(d.duracao))&&Number(d.duracao)>=10&&Number(d.duracao)<=14))e.pending.push('Registrar duração em dias inteiros: mínimo 10 pelo protocolo. Este assistente permite 10 a 14 dias; outras durações exigem registro e revisão individual');
    e.pending=[...new Set(e.pending)];return {d,e,r,stale:!!r&&(!active(p)||r.fingerprint!==fingerprint(p))};
  }
  function summary(p,keys){return keys.filter(k=>val(p,k)).map(k=>{const el=byId(p+'-corr-'+k),value=el.tagName==='SELECT'?el.selectedOptions[0]?.textContent:el.value;return `${labels.get(k)}: ${value}`;}).join('\n');}
  function parts(p){
    if(!active(p))return {s:'',o:'',a:'',p:''};const {d,r,e}=state(p),disease=R.diseases[d.diagnostico];
    return {
      s:summary(p,['relato','lactante','alergia','complicado','medicamentos','prurido','dispareunia','riscoist','dor','sangra','perdaliquido','violencia']),
      o:[`Gestante; IG registrada: ${get(p,'ig')||'não informada'}; temperatura: ${get(p,'temp')||'não informada'} °C.`,summary(p,['exame','achados','cor','aspecto','odor','eritema','morango','pus','friavel','edemacolo','koh','ph','micro','mobilizacao'])].filter(Boolean).join('\n'),
      a:[disease&&d.confirmado==='Sim'?`Diagnóstico confirmado pelo profissional: ${disease.name} (CIAP-2 ${disease.ciap}).`:'Corrimento vaginal em avaliação; sem diagnóstico confirmado.',...e.urgent,...obstetricAlerts(p)].join('\n'),
      p:[r&&!state(p).stale?`CIAP-2 ${r.code} — ${r.title}\n${r.plan}`:'',val(p,'conduta')].filter(Boolean).join('\n')
    };
  }
  function validate(p,requireSoap=false){
    if(!prefixes.includes(p))return true;const s=state(p);
    if(s.stale){showToast('Corrimento: a avaliação mudou. Confirme novamente o esquema ou remova o registro antes de continuar.');return false;}
    if(requireSoap&&(active(p)||s.r||val(p,'soap-base'))&&val(p,'soap-base')!==fingerprint(p)+val(p,'registro')){showToast('Gere novamente o SOAP do pré-natal para incluir a avaliação atual do corrimento.');return false;}
    return true;
  }
  function syncCiap(p,r){
    if(!window.ESFCiap)return;const items=ESFCiap.capture(p),old=record(p);
    if(old&&old.code!==r?.code){const i=items.findIndex(c=>c.code===old.code&&c.p===old.plan);if(i>=0)items.splice(i,1);}
    if(r){const i=items.findIndex(c=>c.code===r.code),part=parts(p),next={code:r.code,s:part.s||'Avaliação de corrimento na gestação.',o:part.o,a:`Diagnóstico confirmado: ${r.title}.`,p:r.plan};if(i<0)items.push(next);else items[i]=next;}
    ESFCiap.restore(p,items);
  }
  function confirmTreatment(p,id){
    const {d,e}=state(p),regimen=e.regimens.find(r=>r.id===id);if(!active(p)||!regimen||e.pending.length)return showToast('Complete a avaliação e revise as pendências do corrimento.');
    const disease=R.diseases[d.diagnostico],dose=d.diagnostico==='cand'?`1 aplicador cheio via vaginal à noite por ${d.duracao} dias.`:regimen.dose;
    const r={code:disease.ciap,title:disease.name,fingerprint:fingerprint(p),plan:`Prescrição revisada na gestação: ${regimen.drug}. ${dose}\n${regimen.note}\nFonte: Protocolo Municipal de Enfermagem — Saúde da Mulher, Toledo 2026, seção 2.1.1, p. ${regimen.page}.`};
    syncCiap(p,r);byId(p+'-corr-registro').value=JSON.stringify(r);byId(p+'-corr-registro').dispatchEvent(new Event('input',{bubbles:true}));render(p);showToast('Esquema confirmado nesta consulta. Gere o SOAP do pré-natal para incluir o registro.');
  }
  function removeRecord(p){syncCiap(p,null);byId(p+'-corr-registro').value='';byId(p+'-corr-registro').dispatchEvent(new Event('input',{bubbles:true}));render(p);}
  function appendSoap(p){
    if(!validate(p))return;
    if(!active(p)){if(val(p,'soap-base'))byId(p+'-corr-soap-base').value=fingerprint(p)+val(p,'registro');return;}
    pularFinalizadorSoapAutomatico(p,2500);const sections=parts(p),ids=SOAP_IDS_MODULO[p];
    for(const key of ['s','o','a','p'])if(sections[key]){const el=byId(ids[key]);el.value=el.value.replace(/\n*\[Corrimento na gestação\][\s\S]*?\[Fim corrimento\]/g,'').trim()+`\n\n[Corrimento na gestação]\n${sections[key]}\n[Fim corrimento]`;el.dispatchEvent(new Event('input',{bubbles:true}));}
    byId(p+'-corr-soap-base').value=fingerprint(p)+val(p,'registro');
  }
  function render(p){
    const root=byId(p+'-corr-painel');if(!root)return;root.querySelector('[data-pn-corr-body]').hidden=!active(p);
    const {d,e,r,stale}=state(p);byId(p+'-corr-contexto').textContent=`Contexto fixo: gestante · IG: ${get(p,'ig')||'preencha a DUM/IG da consulta'} · temperatura: ${get(p,'temp')||'não registrada'} °C.`;
    const warnings=[...e.urgent,...obstetricAlerts(p)];byId(p+'-corr-hipoteses').innerHTML=(warnings.length?`<div class="alert alert-e">${list([...new Set(warnings)])}Avaliar prioridade obstétrica; não adiar atendimento para preencher o formulário.</div>`:'')+
      e.candidates.map(c=>`<article class="smu-option"><h4>${esc(c.name)} · hipótese a avaliar</h4><p>${esc(c.why)}</p><button type="button" class="btn btn-s" data-pn-corr-diagnosis="${c.id}">Selecionar hipótese</button></article>`).join('')+list(e.notes);
    byId(p+'-corr-tratamentos').innerHTML=(e.pending.length?`<details class="smu-pending"><summary>Pendências antes de confirmar tratamento (${e.pending.length})</summary>${list(e.pending)}</details>`:'')+e.regimens.map(r=>`<article class="smu-option"><h4>${esc(r.label)} · ${esc(r.drug)}</h4><p>${esc(d.diagnostico==='cand'?`1 aplicador cheio via vaginal à noite por ${d.duracao||'___'} dias.`:r.dose)}</p><p>${esc(r.note)}</p><a href="${R.link(r.page)}" target="_blank" rel="noopener">Protocolo municipal · p. ${r.page}</a><br><button class="btn btn-p" type="button" data-pn-corr-regimen="${r.id}" ${e.pending.length?'disabled':''}>Confirmar esquema nesta consulta</button></article>`).join('');
    byId(p+'-corr-registro-view').innerHTML=r?`<article class="smu-option"><h4>${esc(r.title)} · CIAP ${esc(r.code)}</h4><p>${stale?'Avaliação alterada: confirme novamente ou remova este registro.':'Tratamento confirmado para o SOAP desta consulta.'}</p><pre>${esc(r.plan)}</pre><button class="btn btn-s" type="button" data-pn-corr-remove>Remover tratamento confirmado</button></article>`:'';
    window.ESFCiap?.refreshSuggestions?.(p);
  }
  function ciapCodes(p){if(!prefixes.includes(p)||!active(p))return [];const d=data(p);return d.confirmado==='Sim'&&R.diseases[d.diagnostico]?[R.diseases[d.diagnostico].ciap]:['X14'];}
  function centralDecision(p){const {r,stale,e}=state(p);return decisaoProtocolar(FONTES_PROTOCOLARES_MODULOS.smu,r&&!stale?'Tratamento de corrimento confirmado nesta consulta; consultar o registro no bloco de corrimento.':'Avaliar corrimento no bloco específico do pré-natal e confirmar achados antes de tratar.',r&&!stale?r.plan:'Nenhuma prescrição confirmada.',e.pending.length?'Revisar pendências e sinais de alarme no bloco de corrimento.':'Ver esquema selecionado.',true,'Aplicar as restrições da gestação. Outras IST e testes reagentes exigem seus fluxos específicos.');}
  function mount(){
    for(const p of prefixes){
      const anchor=byId(p==='pna'?'pna-3':'pnc-2');if(!anchor||byId(p+'-corr-painel'))continue;
      const root=document.createElement('section');root.id=p+'-corr-painel';root.className='card pn-corr';
      root.innerHTML=`<h3>Corrimento / leucorreia na gestação</h3><p>Avaliação e tratamento dentro deste pré-natal, conforme Saúde da Mulher — Toledo 2026. <a href="${R.link(14)}" target="_blank" rel="noopener">Consultar protocolo</a></p>${field(p,'ativo','Avaliar corrimento nesta consulta?')}<p id="${p}-corr-contexto"></p><div data-pn-corr-body hidden><h4>Relato e achados</h4><div class="smu-grid">`+
        field(p,'relato','Relato, início, duração e tratamentos anteriores','textarea')+
        field(p,'cor','Cor','select',['Branco',['acinzentado','Acinzentado'],['esverdeado','Esverdeado'],['amarelo-esverdeado','Amarelo-esverdeado'],'Transparente','Outro'])+
        field(p,'aspecto','Aspecto','select',[['grumoso','Grumoso'],['homogeneo','Homogêneo'],['espumoso','Bolhoso / espumoso'],['mucopurulento','Mucopurulento'],'Outro'])+
        [['odor','Odor fétido / odor de peixe'],['prurido','Prurido vulvar'],['eritema','Eritema, edema ou escoriações vulvares'],['morango','Colo com aspecto de morango'],['pus','Pus no colo'],['friavel','Colo sangra ao toque'],['edemacolo','Colo avermelhado / edemaciado'],['dispareunia','Dispareunia'],['riscoist','Sem preservativo, múltiplas parcerias ou parceria com IST']].map(([id,label])=>field(p,id,label)).join('')+
        field(p,'koh','KOH / aminas','select',['Positivo','Negativo','Não realizado'])+field(p,'ph','pH vaginal','number')+field(p,'micro','Microscopia','select',[['hifas','Hifas / blastoconídeos'],['trich','Trichomonas vaginalis'],['clue','Clue cells / cocos e bacilos curtos'],['normal','Lactobacilos'],['citolitica','Lactobacilos com citólise'],['leucocitos','Leucócitos aumentados'],['nao','Não realizada']])+
        '</div><h4>Exame, segurança e confirmação</h4><div class="smu-grid">'+
        field(p,'exame','Exame ginecológico/especular realizado')+field(p,'achados','Achados do exame','textarea')+field(p,'lactante','Também está amamentando?')+field(p,'alergia','Alergia aos medicamentos do esquema')+field(p,'complicado','Recorrência, imunossupressão, complicação ou contraindicação ao esquema')+field(p,'medicamentos','Medicamentos em uso e revisão de segurança na gestação','textarea')+field(p,'interacoes','Interações e contraindicações adicionais do esquema revisadas')+
        [['dor','Dor pélvica importante'],['mobilizacao','Dor à mobilização do colo'],['sangra','Sangramento intenso'],['perdaliquido','Perda de líquido / suspeita de rotura'],['violencia','Risco ou relato de violência']].map(([id,label])=>field(p,id,label)).join('')+
        (!byId(p+'-temp')?`<div class="f"><label for="${p}-temp">Temperatura (°C)</label><input id="${p}-temp" type="number" step="0.1"></div>`:'')+
        field(p,'diagnostico','Diagnóstico selecionado após avaliação','select',Object.entries(R.diseases).map(([id,d])=>[id,d.name]))+field(p,'confirmado','Diagnóstico e critérios do protocolo confirmados pelo enfermeiro')+field(p,'duracao','Dias de tratamento vaginal na candidíase (mínimo 10)','number')+'</div>'+ 
        `<div id="${p}-corr-hipoteses" aria-live="polite"></div><h4>Esquemas previstos para gestante</h4><p>Candidíase: apenas via vaginal, por no mínimo 10 dias. Cervicite: sem doxiciclina. As opções são alternativas; não somar esquemas automaticamente.</p><div id="${p}-corr-tratamentos"></div>`+
        field(p,'conduta','Exames, orientações, retorno e demais condutas efetivamente realizados','textarea')+'<p>Na dúvida diagnóstica ou persistência, considerar exame a fresco (0211040037) ou Gram (0202080072); avaliar testagem para IST e parcerias. Registre a solicitação e a indicação acima.</p></div>'+
        `<div id="${p}-corr-registro-view"></div><textarea id="${p}-corr-registro" hidden aria-label="Tratamento de corrimento confirmado"></textarea><textarea id="${p}-corr-soap-base" hidden aria-label="Versão do corrimento usada no SOAP"></textarea>`;
      anchor.append(root);
      const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='btn btn-s';shortcut.id=p+'-corr-abrir';shortcut.textContent='Abrir avaliação de corrimento na gestação';shortcut.onclick=()=>{byId(p+'-corr-ativo').value='Sim';byId(p+'-corr-ativo').dispatchEvent(new Event('change',{bubbles:true}));render(p);root.scrollIntoView({block:'start',behavior:'smooth'});};byId(p+'-queixas')?.closest('.f')?.after(shortcut);
      let timer;const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>render(p),60);};
      for(const event of ['input','change'])page(p).addEventListener(event,e=>{if(!e.target.closest('[data-ciap]')&&!Object.values(SOAP_IDS_MODULO[p]).includes(e.target.id))refresh();});
      page(p).addEventListener('click',e=>{
        const b=e.target.closest('button');
        if(b?.dataset.pnCorrDiagnosis){byId(p+'-corr-diagnostico').value=b.dataset.pnCorrDiagnosis;byId(p+'-corr-confirmado').value='Não';byId(p+'-corr-diagnostico').dispatchEvent(new Event('change',{bubbles:true}));showToast('Hipótese selecionada. Confirme os achados e critérios clínicos antes do tratamento.');}
        if(b?.dataset.pnCorrRegimen)confirmTreatment(p,b.dataset.pnCorrRegimen);
        if(b?.hasAttribute('data-pn-corr-remove'))removeRecord(p);
        if(e.target.closest('.clinical-chip')||e.target.matches(`#${p}-queixas-gin input`)){
          if(selected(p).some(s=>norm(s).trim()==='corrimento vaginal alterado')){byId(p+'-corr-ativo').value='Sim';byId(p+'-corr-ativo').dispatchEvent(new Event('change',{bubbles:true}));}
        }
        refresh();
      });
      render(p);
    }
    for(const [p,name]of [['pna','gerarSoapAutomatoPna'],['pnc','gerarSoapAutomatoPnc']]){const original=window[name];window[name]=function(...args){if(!validate(p))return;const result=original.apply(this,args);appendSoap(p);return result;};}
    const restore=window.restaurarDadosModulo;window.restaurarDadosModulo=function(p,...args){const result=restore.call(this,p,...args);if(prefixes.includes(p))render(p);return result;};
    const navigate=window.go;window.go=function(...args){const result=navigate.apply(this,args);for(const p of prefixes)render(p);return result;};
    const ai=window.gerarSoapPorIA;window.gerarSoapPorIA=function(...args){const p=prefixoPaginaAtual();if(!validate(p,true)||p==='smu'&&window.ESFSaudeMulher&&!ESFSaudeMulher.validateForAI())return;return ai.apply(this,args);};
    const save=window.salvarAtendimentoModulo;window.salvarAtendimentoModulo=function(tipo,...args){const p=MODULOS_ATENDIMENTO[tipo]?.prefix;if(!validate(p,true))return;return save.call(this,tipo,...args);};
  }
  window.ESFCorrimentoPN={data,state,render,validate,ciapCodes,appendSoap,centralDecision,isActive:p=>prefixes.includes(p)&&active(p)};
  document.addEventListener('DOMContentLoaded',mount);
})();
