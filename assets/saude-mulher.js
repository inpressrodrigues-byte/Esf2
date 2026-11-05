/* Interface, registro revisado e SOAP para os capítulos 2–6 do protocolo. */
(() => {
  'use strict';
  const R=window.SaudeMulherRegras,$=id=>document.getElementById('smu-'+id),v=id=>$(id)?.value||'';
  const display=id=>$(id)?.tagName==='SELECT'?$(id).selectedOptions[0]?.textContent||'':v(id);
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const yn=['Não','Sim'];
  const labels=new Map();
  function field(id,label,type='select',options=yn){
    labels.set(id,label);const control=type==='select'?`<select id="smu-${id}"><option value="">Não avaliado</option>${options.map(o=>{const a=Array.isArray(o)?o:[o,o];return `<option value="${escape(a[0])}">${escape(a[1])}</option>`;}).join('')}</select>`:type==='textarea'?`<textarea id="smu-${id}" rows="3"></textarea>`:`<input id="smu-${id}" type="${type}" ${type==='number'?'step="any" min="0"':''}>`;
    return `<div class="f"><label for="smu-${id}">${escape(label)}</label>${control}</div>`;
  }
  const grid=html=>`<div class="smu-grid">${html}</div>`;
  const ref=(page,label='Ver protocolo')=>`<a target="_blank" rel="noopener" href="${R.link(page)}">${label} · p. ${page}</a>`;
  const card=(title,html)=>`<section class="card smu-card"><h3>${title}</h3>${html}</section>`;
  const list=items=>`<ul>${items.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`;
  function dischargeData(){
    const d=Object.fromEntries([...labels.keys()].filter(k=>k.startsWith('corr-')).map(k=>[k.slice(5),v(k)]));
    return {...d,gestante:v('gestante'),lactante:v('lactante'),alergia:v('alergia-medicamentos'),complicado:v('caso-complicado'),exame:v('exame-especular'),achados:v('achados-exame'),confirmado:v('criterios-confirmados'),diagnostico:Object.keys(R.diseases).find(k=>R.diseases[k].name===v('diagnostico-confirmado'))||'',temp:v('temp'),ig:v('ig'),violencia:v('violencia')};
  }
  function contraceptionData(){
    const d=Object.fromEntries([...labels.keys()].filter(k=>k.startsWith('contra-')).map(k=>[k.slice(7),v(k)]));
    return {...d,gestante:v('gestante'),lactante:v('lactante'),idade:idadePorNascimento(v('nasc')),pa:v('pa')};
  }
  function fingerprint(){
    return JSON.stringify({patient:[v('cpf'),v('nome'),v('nasc')],corr:dischargeData(),contra:contraceptionData(),exams:[...labels.keys()].filter(k=>k.startsWith('exames-')).map(k=>[k,v(k)]),allergy:v('alergia-medicamentos'),medicines:v('medicamentos'),conditions:v('comorbidades'),alerts:v('alerts'),priority:[...document.querySelectorAll('#pg-saude-mulher [data-priority]:checked')].map(e=>e.dataset.priority)});
  }
  function records(){try{const a=JSON.parse(v('protocolo-registros')||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.id==='string'&&typeof x.plan==='string'):[];}catch{return [];}}
  function saveRecords(items){$('protocolo-registros').value=JSON.stringify(items);$('protocolo-registros').dispatchEvent(new Event('input',{bubbles:true}));}
  function stale(){const f=fingerprint();return records().some(r=>r.fingerprint!==f);}
  function validate(){if(stale()){showToast('A avaliação mudou. Remova ou confirme novamente as condutas no painel de registros antes de gerar o SOAP.');return false;}return true;}
  function validateForAI(){if(!validate())return false;if((records().length||v('soap-base'))&&v('soap-base')!==fingerprint()+v('protocolo-registros')){showToast('Gere novamente o SOAP local para incluir as condutas confirmadas antes de continuar.');return false;}return true;}
  function record(r){
    const previous=records().find(x=>x.id===r.id);if(previous?.ciap&&previous.ciap!==r.ciap&&window.ESFCiap)ESFCiap.restore('smu',ESFCiap.capture('smu').filter(c=>!(c.code===previous.ciap&&c.p===previous.plan)));
    const items=records().filter(x=>x.id!==r.id);items.push({...r,fingerprint:fingerprint()});saveRecords(items);syncCiap();refresh();showToast('Conduta confirmada. Será incluída no SOAP local e no CIAP deste problema.');
  }
  function pendingCommon(){
    const out=[];
    if(v('alergia-medicamentos')!=='Não')out.push('Confirmar ausência de alergia ao esquema selecionado');
    if(v('contra-revisao')!=='Sim')out.push('Conferir medicamentos, interações, apresentação e bula');
    if(v('contra-orientada')!=='Sim')out.push('Registrar aconselhamento e compreensão da usuária');
    if(v('contra-escolha')!=='Sim')out.push('Confirmar escolha compartilhada com a usuária');
    if(v('violencia')==='Sim'||v('alerts')||document.querySelector('#pg-saude-mulher [data-priority]:checked'))out.push('Revisar alertas e prioridade antes de prescrever neste fluxo');
    return out;
  }
  function methodState(){
    const data=contraceptionData(),e=R.eligibility(data),m=e.methods.find(m=>m.id===v('contra-metodo'));if(!m)return {data,e,m,pending:[]};
    const pending=[...m.blockers,...pendingCommon()];
    if(m.category===2&&!v('contra-justificativa').trim())pending.push('Categoria 2: justificar por que não há método mais seguro adequado à escolha');
    if(['combinada','mensal'].includes(m.id)&&!(Number(v('contra-dia-ciclo'))>=1&&Number(v('contra-dia-ciclo'))<=5))pending.push('Registrar dia do ciclo entre 1 e 5 para início conforme protocolo');
    if(m.id==='mensal'&&!R.monthly.includes(v('contra-apresentacao')))pending.push('Selecionar apresentação do injetável mensal');
    return {data,e,m,pending:[...new Set(pending)]};
  }
  function treatmentState(){
    const data=dischargeData(),e=R.discharge(data);
    if(v('alerts')||document.querySelector('#pg-saude-mulher [data-priority]:checked'))e.pending.push('Revisar os alertas/prioridade selecionados');
    if(data.gestante==='Sim'&&data.diagnostico==='cand'&&!(Number.isInteger(Number(v('corr-duracao')))&&Number(v('corr-duracao'))>=10&&Number(v('corr-duracao'))<=14))e.pending.push('Registrar duração em dias inteiros: mínimo 10 pelo protocolo. Este assistente permite 10 a 14 dias; outras durações exigem registro e revisão individual');
    return {data,e};
  }
  function renderDischarge(){
    const {data,e}=treatmentState(),out=$('corr-result');if(!out)return;
    const hints=e.candidates.map(c=>`<article class="smu-option"><h4>${escape(c.name)} <small>Hipótese a avaliar</small></h4><p>${escape(c.why)}</p>${ref(c.page)} <button type="button" class="btn btn-s" data-smu-diagnosis="${c.id}">Selecionar para avaliação</button></article>`).join('');
    out.innerHTML=(e.urgent.length?`<div class="alert alert-e">${list(e.urgent)}Avaliar prioridade e encaminhamento; não aguardar preenchimento.</div>`:'')+hints+list(e.notes)+`<p>Na dúvida ou persistência: considerar exame a fresco (0211040037) ou Gram (0202080072). Avaliar testagem para outras IST conforme exposição. ${ref(15)}</p>`;
    const reg=$('corr-tratamentos');reg.innerHTML=`<h3>Tratamentos para o diagnóstico selecionado</h3><p>Os esquemas abaixo são alternativas. Confirmar um esquema registra a decisão do enfermeiro; selecionar achados não confirma doença.</p>${e.pending.length?`<details open class="smu-pending"><summary>Pendências para registrar prescrição (${e.pending.length})</summary>${list([...new Set(e.pending)])}</details>`:''}`+e.regimens.map(r=>{
      const dose=data.gestante==='Sim'&&data.diagnostico==='cand'?`1 aplicador cheio via vaginal à noite por ${v('corr-duracao')||'___'} dias.`:r.dose;
      return `<article class="smu-option"><h4>${escape(r.label)} · ${escape(r.drug)}</h4><p>${escape(dose)}</p><p>${escape(r.note)}</p>${ref(r.page)}<br><button class="btn btn-p" type="button" data-smu-regimen="${r.id}" ${e.pending.length?'disabled':''}>Confirmar este esquema para o SOAP</button></article>`;
    }).join('');
    if(!e.regimens.length)reg.insertAdjacentHTML('beforeend','<p>Selecione e confirme o diagnóstico na avaliação clínica para consultar seus esquemas.</p>');
  }
  function confirmRegimen(id){
    const {data,e}=treatmentState(),r=e.regimens.find(r=>r.id===id);if(!r||e.pending.length)return showToast('Complete a avaliação e revise as pendências antes de confirmar.');
    const disease=R.diseases[data.diagnostico],dose=data.gestante==='Sim'&&data.diagnostico==='cand'?`1 aplicador cheio via vaginal à noite por ${v('corr-duracao')} dias.`:r.dose;
    record({id:'corrimento',title:disease.name,ciap:disease.ciap,s:[v('queixa-principal'),v('historia-atual'),v('corrimento-caracteristicas')].filter(Boolean).join('\n'),o:dischargeSummary(),a:`Diagnóstico confirmado pelo profissional: ${disease.name}.`,plan:`Prescrição revisada: ${r.drug}. ${dose}\n${r.note}\nFonte: protocolo municipal Toledo 2026, seção 2.1.1, p. ${r.page}.`});
  }
  function renderContraception(){
    const {e,m,pending}=methodState(),out=$('contra-result');if(!out)return;
    out.innerHTML=`<p><strong>IMC:</strong> ${e.bmi?e.bmi.toFixed(1):'pendente'} kg/m². Categorias 1 e 2 podem permitir prescrição de enfermagem; 2 exige avaliar alternativa mais segura. Categoria 3: prescrição médica. Categoria 4: não prescrever. ${ref(59)}</p>`+
      (e.missing.length?`<details class="smu-pending"><summary>Triagem incompleta (${e.missing.length} respostas)</summary>${list(e.missing)}</details>`:'')+
      '<p>Os resultados comparam segurança clínica. A escolha depende também da preferência, adesão, acesso e avaliação profissional.</p><div class="smu-methods">'+e.methods.filter(x=>Number.isInteger(x.column)).map(x=>`<article class="smu-option"><h4>${escape(x.name)}</h4><strong class="smu-status">${x.estimated?'Triagem incompleta · ':''}${typeof x.category==='number'||x.category==='3/4'?'Categoria '+x.category:'Revisão individual'}</strong><p>Falha: uso ideal ${x.ideal}% · típico ${x.typical}%</p>${x.reasons.length?list(x.reasons.map(r=>`${r.label}: ${r.category} (p. ${r.page})`)):'<p>Nenhuma restrição encontrada nas respostas avaliadas.</p>'}${x.blockers.length?`<details><summary>Restrições / pendências (${x.blockers.length})</summary>${list(x.blockers)}</details>`:''}<button class="btn btn-s" type="button" data-smu-method="${x.id}">Ver método e conduta</button></article>`).join('')+'</div>';
    const detail=$('contra-detalhe');
    if(!m){detail.innerHTML='<p>Escolha um método para ver as condutas, apresentações, efeitos adversos e orientações.</p>';return;}
    detail.innerHTML=`<h3>${escape(m.name)} · CIAP ${m.ciap}</h3><p>${escape(m.network)} · ${ref(m.page)}</p><p><strong>Apresentação:</strong> ${escape(m.id==='mensal'&&v('contra-apresentacao')?v('contra-apresentacao'):m.drug)}</p><p><strong>Uso:</strong> ${escape(m.dose)}</p><p><strong>Início:</strong> ${escape(m.start)}</p><p><strong>Atraso / seguimento:</strong> ${escape(m.miss)}</p><p><strong>Efeitos adversos:</strong> ${escape(m.effects)}</p><p><strong>Falha (quadro 6):</strong> uso ideal ${m.ideal}%; uso típico ${m.typical}%.</p>`+
      (pending.length?`<details open class="smu-pending"><summary>Antes da prescrição</summary>${list(pending)}</details>`:'<p class="smu-ready">Triagem preenchida e sem impedimento identificado para esta prescrição no fluxo municipal.</p>')+
      `<button class="btn btn-p" type="button" id="smu-confirmar-metodo" ${pending.length?'disabled':''}>Confirmar prescrição e orientações para o SOAP</button>`;
  }
  function confirmMethod(){
    const {m,pending}=methodState();if(!m||pending.length)return showToast('Revise as pendências do método antes de confirmar.');
    record({id:'contracepcao',title:m.name,ciap:m.ciap,s:`Motivo: ${v('motivo-consulta')?display('motivo-consulta'):'Planejamento contraceptivo'}.\nPreferências/experiências: ${v('contra-preferencias')||'não registradas'}.`,o:contraceptionSummary(),a:`Método escolhido com a usuária: ${m.name}. Categoria ${m.category} conforme condições registradas.${m.category===2?' Justificativa: '+v('contra-justificativa'):''}`,plan:`Prescrição revisada: ${m.id==='mensal'?v('contra-apresentacao'):m.drug}. ${m.dose}\nOrientações confirmadas: ${m.start} ${m.miss} ${m.effects}\nDupla proteção com preservativo. Retorno anual ou antes, conforme necessidade clínica.\nFonte: protocolo municipal Toledo 2026, seções 3–5, p. ${m.page}.`});
  }
  function dischargeSummary(){return [...labels].filter(([k])=>k.startsWith('corr-')&&v(k)).map(([k,l])=>`${l}: ${display(k)}`).concat(v('achados-exame')?['Exame registrado: '+v('achados-exame')]:[]).join('\n');}
  function contraceptionSummary(){return [`PA: ${v('pa')||'não registrada'}`,...[...labels].filter(([k])=>k.startsWith('contra-')&&v(k)).map(([k,l])=>`${l}: ${display(k)}`)].join('\n');}
  function renderRecords(){
    const out=$('registros-list');if(!out)return;
    out.innerHTML=records().length?records().map(r=>`<article class="smu-option"><h4>${escape(r.title)} · CIAP ${escape(r.ciap)}</h4><p>${r.fingerprint===fingerprint()?'Confirmado com a avaliação atual.':'A avaliação mudou: confirmar novamente no fluxo ou remover este registro.'}</p><pre>${escape(r.plan)}</pre><button class="btn btn-s" type="button" data-smu-remove="${escape(r.id)}">Remover registro</button></article>`).join(''):'<p>Nenhuma prescrição ou solicitação confirmada neste assistente.</p>';
  }
  function refresh(){renderDischarge();renderContraception();renderRecords();window.ESFCiap?.refreshSuggestions?.('smu');}
  function confirmedCiap(){
    const codes=[];if(v('motivo-consulta')==='emergencia')codes.push('W10');
    if(['iniciar','trocar','acompanhar'].includes(v('motivo-consulta')))codes.push(R.methods.find(m=>m.id===v('contra-metodo'))?.ciap||'W14');
    if(v('criterios-confirmados')==='Sim'){const id=Object.keys(R.diseases).find(k=>R.diseases[k].name===v('diagnostico-confirmado'));if(id)codes.push(R.diseases[id].ciap);}
    if(['corr-cor','corr-aspecto'].some(k=>v(k))&&!codes.some(c=>c.startsWith('X')))codes.push('X14');
    return codes;
  }
  function syncCiap(){
    if(!window.ESFCiap||!validate())return;
    const items=ESFCiap.capture('smu');for(const r of records().filter(r=>r.ciap)){
      const i=items.findIndex(x=>x.code===r.ciap),next={code:r.ciap,s:r.s||v('queixa-principal'),o:r.o||'',a:r.a||r.title,p:r.plan};
      if(i<0)items.push(next);else items[i]=next;
    }ESFCiap.restore('smu',items);
  }
  function soap(){
    if(!validate())return;
    const get=id=>v(id),display=id=>$(id)?.tagName==='SELECT'?$(id).selectedOptions[0]?.textContent:get(id),rows=ids=>ids.filter(id=>get(id)).map(id=>`${labels.get(id)||document.querySelector(`label[for="smu-${id}"]`)?.textContent||id}: ${display(id)}`).join('\n');
    const saved=records(),diagnosis=get('criterios-confirmados')==='Sim'?get('diagnostico-confirmado'):'';
    const sections={
      s:[rows(['motivo-consulta']),get('queixa-principal'),get('complaints'),get('historia-atual'),rows(['dum','gestante','ig','lactante','vida-sexual','antecedentes-gineco','medicamentos','comorbidades','alergia-medicamentos','violencia']),get('corrimento-caracteristicas'),get('contra-preferencias')].filter(Boolean),
      o:[rows(['pa','fc','fr','sat','temp','exame-especular']),get('achados-exame'),get('exame-complementar'),dischargeSummary(),v('contra-metodo')||v('contra-peso')?contraceptionSummary():''].filter(Boolean),
      a:[diagnosis&&!diagnosis.startsWith('Não definido')?`Diagnóstico confirmado pelo profissional: ${diagnosis}.`:'',...saved.filter(r=>r.a).map(r=>`CIAP-2 ${r.ciap}: ${r.a}`)].filter(Boolean),
      p:[get('conduta'),...saved.map(r=>(r.ciap?'CIAP-2 '+r.ciap+' — ':'')+r.title+'\n'+r.plan),get('orientacoes'),get('encaminhamento'),get('retorno')?'Retorno: '+get('retorno'):'',get('sinais-alerta-orientados')].filter(Boolean)
    };
    pularFinalizadorSoapAutomatico('smu');for(const [key,parts]of Object.entries(sections)){$(key).value=parts.length?key.toUpperCase()+':\n'+parts.join('\n'):'';$(key).dispatchEvent(new Event('input',{bubbles:true}));}
    $('orientacao-paciente').value=[get('orientacoes'),get('retorno')].filter(Boolean).join('\n');syncCiap();$('soap-base').value=fingerprint()+v('protocolo-registros');showToast('SOAP gerado com achados registrados e condutas confirmadas. Revise antes de salvar.');
  }
  function mount(){
    const page=document.getElementById('pg-saude-mulher');if(!page||$('corr-result'))return;
    const first=$('aval').querySelector('.card');
    first.insertAdjacentHTML('afterbegin',card('Motivo e contexto do atendimento',grid(field('motivo-consulta','Motivo principal','select',[['queixa','Queixa ginecológica'],['iniciar','Quero iniciar anticoncepcional'],['trocar','Trocar método'],['acompanhar','Acompanhar método'],['preconcepcao','Desejo engravidar'],['emergencia','Contracepção de emergência'],['gestante','Queixa ginecológica na gestação']])+field('ig','Idade gestacional em semanas, se gestante','number'))+'<p>Preencha gestação, lactação, alergias, história e exame nesta avaliação. As etapas seguintes usam esses dados.</p><div class="brow"><button class="btn btn-p" type="button" data-smu-tab="corrimento">Avaliar corrimento</button><button class="btn btn-p" type="button" data-smu-tab="contracepcao">Avaliar anticoncepcional</button></div>'));
    const tabs=page.querySelector('.tabs'),soapTab=tabs.querySelector('[onclick*="smu-soap"]');
    const addTab=(id,label,html)=>{const b=document.createElement('button');b.className='tab';b.type='button';b.textContent=label;b.setAttribute('onclick',`tab(this,'smu-${id}')`);tabs.insertBefore(b,soapTab);const panel=document.createElement('div');panel.id='smu-'+id;panel.className='tp';panel.innerHTML=html;page.append(panel);};
    addTab('corrimento','Corrimento / leucorreia',
      card('Achados da secreção e do exame',`<p>Registre o que foi observado. As combinações sugerem hipóteses; confirme o diagnóstico após a avaliação. ${ref(14)}</p>`+grid(
        field('corr-cor','Cor','select',['Branco',['acinzentado','Acinzentado'],['esverdeado','Esverdeado'],['amarelo-esverdeado','Amarelo-esverdeado'],'Transparente','Outro'])+
        field('corr-aspecto','Aspecto','select',[['grumoso','Grumoso'],['homogeneo','Homogêneo'],['espumoso','Bolhoso / espumoso'],['mucopurulento','Mucopurulento'],'Outro'])+
        [['odor','Odor fétido / odor de peixe'],['prurido','Prurido vulvar'],['eritema','Eritema, edema ou escoriações vulvares'],['morango','Colo com aspecto de morango / framboesa'],['pus','Pus no colo'],['friavel','Colo sangra ao toque'],['edemacolo','Colo avermelhado / edemaciado'],['dispareunia','Dispareunia'],['riscoist','Sem preservativo, múltiplas parcerias ou parceria com IST']].map(([id,label])=>field('corr-'+id,label)).join('')+
        field('corr-koh','Teste KOH / aminas','select',['Positivo','Negativo','Não realizado'])+field('corr-ph','pH vaginal','number')+
        field('corr-micro','Microscopia, se realizada','select',[['hifas','Hifas / blastoconídeos'],['trich','Trichomonas vaginalis'],['clue','Clue cells / cocos e bacilos curtos'],['normal','Predomínio de lactobacilos'],['citolitica','Lactobacilos com citólise'],['leucocitos','Leucócitos aumentados'],['nao','Não realizada']])) )+
      card('Segurança, confirmação e diferenciais',grid([['dor','Dor pélvica importante'],['mobilizacao','Dor à mobilização do colo'],['sangra','Sangramento intenso'],['perdaliquido','Perda de líquido (especialmente na gestação)'],['interacoes','Interações e contraindicações adicionais do esquema revisadas']].map(([id,label])=>field('corr-'+id,label)).join('')+field('corr-duracao','Dias de tratamento vaginal na candidíase da gestante (mínimo 10)','number'))+'<p>Na etapa Avaliação, registre temperatura, situação gestacional, lactação, alergias, recorrência/complicação, exame e achados; confirme o diagnóstico e os critérios.</p><div id="smu-corr-result" aria-live="polite"></div><button class="btn btn-s" type="button" data-smu-tab="aval">Ir à confirmação clínica</button>')+
      card('Conduta conforme protocolo','<div id="smu-corr-tratamentos"></div>'));
    addTab('contracepcao','Anticoncepção',
      card('Consulta de enfermagem · avaliação',`<p>Para início, troca ou acompanhamento, avaliar preferências e condições clínicas. A consulta pode ocorrer sem queixas ginecológicas. ${ref(57)}</p>`+grid(
        field('contra-preferencias','Preferências, experiências anteriores, adesão e dúvidas','textarea')+field('contra-menarca','Menarca, sexarca, padrão menstrual e dismenorreia','textarea')+field('contra-exclusao','Como a gestação foi excluída? DUM, história, teste e data quando indicado','textarea')+
        field('contra-peso','Peso (kg)','number')+field('contra-altura','Altura (cm)','number')+field('contra-cintura','Circunferência abdominal (cm), quando indicada','number')+field('contra-nulipara','Nulípara')+
        field('contra-posparto','Período após parto','select',[['nenhum','Não está no pós-parto'],['lt6','Menos de 6 semanas'],['6a6','6 semanas a 6 meses'],['gt6','Mais de 6 meses']])+field('contra-diasparto','Dias desde o parto','number')+field('contra-exclusiva','Amamentação exclusiva')+field('contra-fuma','Tabagismo atual')+field('contra-cigarros','Cigarros por dia','number')+field('contra-dia-ciclo','Dia do ciclo para iniciar o método','number')+field('contra-pelvico','Exame pélvico: indicação, realização, recusa e achados','textarea'))+'<p>Registre PA na Avaliação. Exame pélvico/genital quando necessário: DIU, diafragma, encaminhamento para laqueadura ou queixa ginecológica. Não presumir exame normal.</p>')+
      card('Critérios de elegibilidade · condições clínicas',`<p>Responda cada item após investigar a história. ${ref(60)} · ${ref(62)}</p>`+grid(R.risks.map(([id,label])=>field('contra-'+id,label)).join('')))+
      card('Comparação dos métodos','<div id="smu-contra-result"></div>')+
      card('Escolha compartilhada e conduta',grid(field('contra-metodo','Método escolhido para avaliação','select',R.methods.map(m=>[m.id,m.name]))+field('contra-apresentacao','Apresentação do injetável mensal','select',R.monthly)+field('contra-justificativa','Categoria 2: justificativa e alternativas mais seguras discutidas','textarea')+field('contra-revisao','Medicamentos, interações, apresentação e bula conferidos')+field('contra-orientada','Orientados eficácia, uso, esquecimentos, efeitos adversos, dupla proteção e retorno; compreensão confirmada')+field('contra-escolha','Escolha da usuária confirmada após aconselhamento'))+'<div id="smu-contra-detalhe"></div>')+
      card('Taxas de falha · uso ideal e típico',`<p>Valores do quadro 6 municipal. LAM corresponde a 6 meses. Uso típico inclui falhas de adesão; nenhum método é 100% eficaz. ${ref(55)}</p><div class="smu-table-wrap"><table><thead><tr><th>Método</th><th>Uso ideal (%)</th><th>Uso típico (%)</th></tr></thead><tbody>${R.failures.map(row=>'<tr>'+row.map(x=>'<td>'+escape(x)+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`));
    addTab('exames-mulher','Exames / seguimento',
      card('Exames conforme indicação clínica',`<p>A seção 4.3 prevê solicitação quando indicada. Selecione e justifique; a sugestão não significa exame solicitado. ${ref(58)}</p>`+grid(
        field('exames-tig','TIG ou β-hCG','select',[['solicitar','Solicitar para investigar gestação'],['nao','Não indicado nesta consulta']])+field('exames-cito','Citopatológico','select',[['solicitar','Solicitar conforme rastreamento vigente'],['nao','Não indicado / em dia']])+field('exames-ist','Sorologias/testes para IST','select',[['solicitar','Solicitar/ofertar conforme avaliação'],['nao','Não indicado / já avaliado']])+field('exames-usg','USG transvaginal para DIU','select',[['solicitar','Solicitar controle de posição do DIU'],['nao','Não indicado']])+field('exames-fresco','Exame a fresco ou Gram','select',[['solicitar','Solicitar por dúvida ou persistência de corrimento'],['nao','Não indicado']])+field('exames-detalhes','Exames, indicação, resultados prévios e observações na solicitação','textarea'))+'<p>DIU: o protocolo prevê USG antes/após inserção e anualmente, com a observação “análise de controle de DIU”. No corrimento persistente: fresco 0211040037 ou Gram 0202080072. Registre quais testes de IST foram solicitados.</p><button type="button" class="btn btn-p" id="smu-confirmar-exames">Confirmar solicitações para o SOAP</button>')+
      card('Pré-concepção',`<p>Avaliar doenças, medicamentos, vacinas, hábitos, história reprodutiva e desejo de gestação. O protocolo prevê ácido fólico 5 mg, 1 comprimido VO ao dia, ou solução 0,2 mg/mL, 40 gotas/dia, conforme apresentação municipal. Conferir formulação e avaliação antes de registrar prescrição em Conduta. ${ref(45)}</p><p>Atraso menstrual: TIG/β-hCG; rastreamento cervical quando indicado e sorologias conforme protocolo.</p>`)+
      card('Contracepção de emergência',`<p>CIAP W10. Avaliar tempo desde a exposição, falha do método e violência sexual. O protocolo descreve levonorgestrel 0,75 mg, 2 comprimidos VO, preferencialmente até 72 horas; disponibilidade SUS citada apenas no PAM/UPA. Encaminhar conforme fluxo sem atrasar atendimento. ${ref(63)}</p><p>Vômito em 1–2 horas após a tomada exige reavaliação/repetição conforme protocolo. Orientar seguimento e prevenção de IST. Este painel não registra administração automaticamente.</p>`)+
      card('Gestantes e demais demandas',`<p>Gestação não impede avaliação de queixas ginecológicas. Integre achados, IG e tratamentos ao pré-natal. Febre, dor pélvica importante, sangramento ou perda de líquido exigem avaliação prioritária.</p><p>ITU na gestação: EAS, urocultura e antibiograma; o texto municipal contém orientações diferentes sobre o alcance da prescrição, portanto o assistente não libera antibioticoterapia obstétrica automática. ${ref(36)}</p><p>Para úlceras/IST, alterações mamárias, climatério e outras queixas, registrar avaliação e seguir o capítulo correspondente: ${ref(18,'Úlceras')} · ${ref(34,'ITU')} · ${ref(36,'Dor pélvica')} · ${ref(76,'Mamas')} · ${ref(82,'Climatério')} · ${ref(89,'Adolescentes')} · ${ref(94,'Infertilidade')}.</p>`));
    $('soap').insertAdjacentHTML('afterbegin',card('Condutas confirmadas para o SOAP','<p>Se a avaliação mudar, confirme novamente as condutas antes de gerar a evolução. O SOAP com IA usa o texto local revisado.</p><textarea id="smu-protocolo-registros" hidden aria-label="Registros estruturados do protocolo"></textarea><textarea id="smu-soap-base" hidden aria-label="Versão da avaliação usada no SOAP"></textarea><div id="smu-registros-list"></div>'));
    tabs.insertBefore(tabs.querySelector('[onclick*="smu-prio"]'),soapTab);
    [...tabs.querySelectorAll('.tab')].forEach((b,i)=>{b.textContent=(i+1)+' · '+b.textContent.replace(/^\d+\s*·\s*/,'');});
    // Apenas opções de hipótese: a confirmação clínica é sempre explícita.
    page.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.smuTab){const t=tabs.querySelector(`[onclick*="smu-${b.dataset.smuTab}'"]`);t?.click();}
      if(b.dataset.smuDiagnosis){$('diagnostico-confirmado').value=R.diseases[b.dataset.smuDiagnosis].name;$('criterios-confirmados').value='Não';$('diagnostico-confirmado').dispatchEvent(new Event('change',{bubbles:true}));showToast('Hipótese selecionada. Confirme exame, critérios e diagnóstico na Avaliação.');}
      if(b.dataset.smuMethod){$('contra-metodo').value=b.dataset.smuMethod;$('contra-metodo').dispatchEvent(new Event('change',{bubbles:true}));$('contra-detalhe').scrollIntoView({block:'start',behavior:'smooth'});}
      if(b.dataset.smuRegimen)confirmRegimen(b.dataset.smuRegimen);
      if(b.id==='smu-confirmar-metodo')confirmMethod();
      if(b.dataset.smuRemove){const old=records().find(r=>r.id===b.dataset.smuRemove);if(old?.ciap&&window.ESFCiap)ESFCiap.restore('smu',ESFCiap.capture('smu').filter(c=>!(c.code===old.ciap&&c.p===old.plan)));saveRecords(records().filter(r=>r.id!==b.dataset.smuRemove));refresh();}
      if(b.id==='smu-confirmar-exames'){
        const selected=[...labels].filter(([k])=>k.startsWith('exames-')&&v(k)==='solicitar').map(([,l])=>l);
        if(!selected.length||!v('exames-detalhes').trim())return showToast('Selecione exames e registre a indicação/detalhes.');
        record({id:'exames',title:'Solicitações de exames',plan:'Solicitados: '+selected.join('; ')+'.\nIndicação/detalhes: '+v('exames-detalhes')+'\nFonte: protocolo municipal 2026, seções 2.1 e 4.3–4.4.'});
      }
    });
    let timer;for(const event of ['input','change'])page.addEventListener(event,e=>{if(e.target.closest('[data-ciap]')||/^smu-(s|o|a|p|protocolo-registros)$/.test(e.target.id))return;clearTimeout(timer);timer=setTimeout(refresh,80);});
    const oldRestore=window.restaurarDadosModulo;window.restaurarDadosModulo=function(p,data){const r=oldRestore.apply(this,arguments);if(p==='smu')refresh();return r;};
    const oldGo=window.go;window.go=function(page){const r=oldGo.apply(this,arguments);if(page==='saude-mulher')refresh();return r;};
    window.gerarSoapSaudeMulher=soap;
    const oldDecision=window.condutaSaudeMulher;window.condutaSaudeMulher=function(ctx,source){
      if(['iniciar','trocar','acompanhar'].includes(v('motivo-consulta'))){const {m,pending}=methodState();return decisaoProtocolar(source,m?`${m.name}: ${pending.length?'revisar pendências na etapa Anticoncepção':'triagem preenchida; confirmar decisão compartilhada'}`:'Abra a etapa Anticoncepção para avaliar elegibilidade e métodos.','Consultar a apresentação do método selecionado.','Ver conduta por método na etapa Anticoncepção.',true,'Categorias e restrições: seções 3–5, p. 45–62.');}
      if(Object.values(R.diseases).some(d=>d.name===v('diagnostico-confirmado'))){const {e}=treatmentState();return decisaoProtocolar(source,'Revisar achados e alternativas na etapa Corrimento / leucorreia.',e.pending.length?'Pendências: '+e.pending.join('; '):e.regimens.map(r=>r.drug).join(' OU '),e.pending.length?'Completar a avaliação antes de confirmar.':'Escolher um esquema na etapa Corrimento.',true,'Gestação/lactação e sinais de alarme são avaliados no fluxo específico.');}
      return oldDecision(ctx,source);
    };
    refresh();
  }
  window.ESFSaudeMulher={mount,refresh,validate,validateForAI,soap,records,stale,ciapCodes:confirmedCiap,dischargeData,contraceptionData,methodState,treatmentState};
  document.addEventListener('DOMContentLoaded',mount);
})();
