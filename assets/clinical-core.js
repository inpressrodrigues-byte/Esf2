/* Regras compartilhadas por interface, documentos e testes. Sem acesso ao DOM/rede. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ESFClinical=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  function number(v){
    if(typeof v==='number')return Number.isFinite(v)?v:null;
    let s=String(v??'').trim().replace(/\s/g,'');if(!s)return null;
    if(!/^-?\d+(?:[.,]\d+)*$/.test(s))return null;
    if(s.includes(',')&&s.includes('.')){
      if(!/^-?\d{1,3}(?:\.\d{3})*,\d+$/.test(s))return null;
      s=s.replace(/\./g,'').replace(',','.');
    }else if(s.includes(',')){if((s.match(/,/g)||[]).length!==1)return null;s=s.replace(',','.');}
    else if((s.match(/\./g)||[]).length>1)return null;
    const n=Number(s);return Number.isFinite(n)?n:null;
  }
  function positiveText(v){
    // Conservative support for text. Negated clauses never become diagnoses.
    // Structured answers remain the source of truth; ambiguous prose requires review.
    return normalize(v).split(/(?:[;|\n.!?]|\b(?:mas|porem|contudo|entretanto)\b|\be (?=refere|relata|apresenta))/)
      .map(s=>s.replace(/\b(?:nega(?:m)?|negou|ausencia de|ausente|sem|nao (?:apresenta|refere|relata|ha|tem|possui|reagente|detectado|avaliado))\b[\s\S]*$/,'').trim())
      .filter(Boolean).join('; ');
  }
  function labLevel(text){const t=normalize(text);if(/nao reagente|nao detectad|negativ|sem anemia|dentro (?:da|do)|normal/.test(t))return'ok';return /grave|alto risco|reagente|positivo|pielonefrite|diabetes manifesto|compativel com diabetes|isoimuniza|hepatite viral/.test(t)?'crit':'att';}
  function localDateTime(date=new Date()){return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}
  const localDate=(date=new Date())=>localDateTime(date).slice(0,10);
  function gestationalDays(dum,reference=localDate()){
    const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const d=new Date(s+'T12:00:00Z');return Number.isNaN(+d)||d.toISOString().slice(0,10)!==s?null:+d;};
    const a=parse(dum),b=parse(reference);return a===null||b===null?null:Math.floor((b-a)/86400000);
  }
  function thyroid({tsh,t4=null,t4Unit='',weeks=null}={}){
    tsh=number(tsh);t4=number(t4);weeks=number(weeks);if(tsh===null)return null;
    const hipo='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2024-05/fluxogrma_hipo_2024.pdf#page=1';
    const hiper='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2024-05/fluxograma_hipertireoidismo_2024.pdf#page=1';
    if(tsh===4)return{title:'TSH no limite de dois ramos',level:'att',finding:'TSH 4 mUI/L: limite sobreposto no fluxograma.',actions:['A figura inclui 4 no ramo anti-TPO e no ramo 4–10. Confirmar T4 livre, anti-TPO, trimestre e avaliação médica antes de prescrever.'],source:hipo};
    if(tsh>4)return{title:'TSH elevado na gestação',level:'att',finding:`TSH ${tsh} mUI/L: avaliar hipotireoidismo.`,actions:[
      'Solicitar/avaliar T4 livre e encaminhar para avaliação médica da reposição de levotiroxina.',
      tsh>10?'O fluxograma de 2024 usa o ramo TSH > 10 com dose inicial por peso (2 mcg/kg/dia). A prescrição deve considerar avaliação médica, peso, uso prévio e contexto clínico.':'O fluxograma de 2024 usa o ramo TSH entre 4 e 10 com dose inicial por peso (1 mcg/kg/dia). A prescrição deve considerar avaliação médica, peso, uso prévio e contexto clínico.',
      'Meta e seguimento: conferir TSH, idade gestacional e resposta no fluxograma. Não aplicar ajuste automático sem avaliação médica. Separar levotiroxina de ferro/cálcio por 4 horas.'
    ],source:hipo};
    if(tsh>2.5&&tsh<4){
      if(weeks===null)return{title:'Confirmar trimestre para interpretar TSH',level:'att',finding:`TSH ${tsh} mUI/L: idade gestacional necessária.`,actions:['O limite eutireoidiano na figura é 2,5 no primeiro trimestre e 3 no segundo/terceiro. Confirmar trimestre antes de escolher o ramo anti-TPO.'],source:hipo};
      if(weeks<14||tsh>=3)return{title:'TSH: avaliação por trimestre e anti-TPO',level:'att',finding:`TSH ${tsh} mUI/L: conferir ramo de anti-TPO.`,actions:[tsh===3&&weeks>=14?'TSH 3 no segundo/terceiro trimestre está no limite sobreposto da figura; confirmar avaliação médica.':'Solicitar/avaliar anti-TPO.','Anti-TPO positivo: a figura indica levotiroxina 50 mcg/dia sob prescrição médica. Anti-TPO negativo: não tratar e repetir TSH no segundo e terceiro trimestres. Não aplicar sem confirmar resultado e contexto.'],source:hipo};
    }
    if(tsh<0.1){
      const actions=['Repetir/avaliar TSH, T4 livre e TRAb. Confirmar unidade de T4 livre: ng/dL.'];
      if(t4!==null&&normalize(t4Unit)!=='ng/dl')actions.push('Unidade de T4 livre incompatível com o fluxograma; confirmar/converter no laudo antes de comparar. Nenhuma dose foi calculada.');
      else if(t4!==null&&t4<2)actions.push('T4 livre < 2 ng/dL: o fluxograma orienta acompanhamento do ramo subclínico, sem antitireoidiano automático. Correlacionar com avaliação clínica.');
      else if(t4===2)actions.push('T4 livre exatamente 2 ng/dL: a figura usa limites estritos < 2 e > 2. Confirmar o ramo com a equipe médica; não presumir uma dose.');
      else if(t4!==null){actions.push('T4 livre > 2 ng/dL: avaliação médica/endocrinologia e estratificação obstétrica.');actions.push(weeks===null||weeks===16?'Confirmar idade gestacional e escolha de antitireoidiano com a equipe médica; o fluxograma separa < 16 e > 16 semanas.':weeks<16?'O fluxograma indica propiltiouracil antes de 16 semanas; a dose depende de T4 livre e avaliação médica.':'O fluxograma indica metimazol após 16 semanas; a dose depende de T4 livre e avaliação médica.');}
      else actions.push('Definir o ramo após T4 livre e idade gestacional. Não sugerir antitireoidiano sem esses dados e avaliação médica.');
      actions.push('Acompanhamento com T4 livre e ajuste médico conforme tabela do fluxograma; não usar doses genéricas fora do ramo individual.');
      return{title:'TSH suprimido na gestação',level:'att',finding:`TSH ${tsh} mUI/L: investigar hipertireoidismo.`,actions,source:hiper};
    }
    return{title:'TSH na gestação',level:'ok',finding:`TSH ${tsh} mUI/L: sem acionamento dos ramos alterados do fluxograma.`,actions:['Correlacionar com T4 livre, sintomas, histórico e referência do laboratório.'],source:hipo};
  }
  function anemia(value){
    const hb=number(value);if(hb===null||hb<=0)return null;
    const source='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2024-05/fluxograma_ferro_2024.pdf#page=1';
    if(hb>=11)return {finding:`Hemoglobina ${hb} g/dL: sem anemia pelo limiar do fluxograma.`,level:'ok',risks:[],actions:[],source};
    const actions=['Solicitar/avaliar ferritina, saturação de transferrina e índices do hemograma; confirmar a causa antes de tratar como anemia ferropriva.'];
    if(hb>7)actions.push('Confirmada anemia ferropriva: avaliação profissional para prescrição de 120 mg/dia de ferro elementar e hemograma em 30 dias. Se aumento de Hb > 1 g/dL, manter até meta de 11; se < 1 g/dL, considerar ferro EV e investigar outras causas. Resposta exatamente 1 g/dL requer avaliação individual.');
    if(hb===7)actions.push('Hb exatamente 7 g/dL: o desenho separa < 7 e > 7. Avaliação médica prioritária para definir o ramo e a via, sem prescrição automática.');
    if(hb<8)actions.push('Anemia grave (Hb < 8 no fluxo de ferro): encaminhar ao alto risco e avaliar ferro endovenoso. Hb < 7 aciona o ramo de ferro EV; instabilidade ou iminência de parto requer avaliação hospitalar imediata e consideração de transfusão.');
    else actions.push('Intolerância oral ou bariátrica prévia: avaliação médica para considerar ferro endovenoso.');
    actions.push('Ferro EV, quando prescrito: dose total = [peso (kg) × (11 − Hb) × 2,4] + 500 mg. Conferir apresentação, diluição, tempo e estrutura de administração diretamente no fluxograma. Manter sulfato ferroso até 3 meses após o parto conforme avaliação.');
    actions.push('Estratificação: o pré-natal de 2021 descreve Hb 8–8,9 como intermediário e 9–11 como leve. A errata regional, p. 1, usa Hb 9–9,9 como moderada especificamente no agendamento HOESP. Confirmar referência/vinculação; Hb isolada não certifica risco habitual.');
    return {finding:`Hemoglobina ${hb} g/dL: ${hb<8?'anemia grave':'anemia — reestratificação obstétrica necessária'}.`,level:hb<8?'crit':'att',risks:[hb<8?'Alto risco: anemia grave (fluxo de ferro 2024).':'Anemia: confirmar estratificação e fluxo obstétrico aplicável.'],actions,source};
  }
  const actions={Vermelho:'Atendimento imediato: avaliar estabilidade, garantir presença médica e acionar urgência/SAMU conforme o quadro. Registrar medidas efetivamente realizadas.',Amarelo:'Atendimento prioritário: avaliação no mesmo turno, monitoramento e reavaliação com responsável definido.',Verde:'Avaliação no dia e manejo específico após exame clínico; registrar orientações, retorno e sinais de alarme.',Azul:'Demanda eletiva: orientar/agendar e registrar desfecho após confirmar ausência de queixa aguda.', 'Não classificado':'Complete a avaliação de sinais de alerta e os dados necessários antes de definir a prioridade.'};
  function triage(d={}){
    const q=normalize(d.complaints||d.q),t=positiveText([d.alerts||d.a,d.text,d.queixa,d.hma,d.gravidade,d.motivo].filter(Boolean).join('; '));
    const all=q+'; '+t, pa=String(d.pa||'').match(/^(\d{2,3})\s*[/x]\s*(\d{2,3})$/i),pas=pa?Number(pa[1]):null,pad=pa?Number(pa[2]):null,sat=number(d.sat),fr=number(d.fr),glic=number(d.glicemia);
    const answer=(cor,criterio)=>({cor,criterio,acao:actions[cor]});
    if(sat!==null&&(sat<0||sat>100)||fr!==null&&fr<0||glic!==null&&glic<0)return answer('Não classificado','Valor numérico inválido; conferir sinais vitais.');
    if(sat!==null&&sat<84)return answer('Vermelho',`SpO₂ ${sat}% (< 84%): critério de atendimento imediato no fluxo de dispneia, p. 38.`);
    if(pas!==null&&(pas>220||pad>130||(pas>=160||pad>=110)&&/cefaleia|dor toracica|dispneia|falta de ar|visu|neuro|vomit|nausea/.test(all)))return answer('Vermelho',`PA ${pas}/${pad} com critério de gravidade do fluxo de pressão arterial, p. 33.`);
    if(glic!==null&&glic>500||normalize(d.glicemia)==='hi')return answer('Vermelho','Glicemia > 500 mg/dL ou HI: atendimento imediato, fluxo municipal p. 75.');
    if(/cianose|confusao mental|alteracao neurologica|crise em atividade|rebaixamento|anafilaxia|edema de (?:face|lingua)|hipotensao|plano suicida|ideacao suicida com (?:plano|planejamento)|tentativa recente|surto psicotico|sangramento intenso|blumberg positivo|dor abdominal moderada\/grave|perda visual subita|face\/vias aereas|instabilidade/.test(t)||/crise convulsiva/.test(q)&&/atividade|convulsionando/.test(t))return answer('Vermelho','Sinal de gravidade presente e registrado: '+t+'.');
    if(/dor toracica/.test(q)&&/sudorese|falta de ar|dispneia|sincope|nausea/.test(t))return answer('Vermelho','Dor torácica com sinais associados de gravidade.');
    if(/dispneia grave|saturacao baixa|pa muito elevada|hipoglicemia importante/.test(t))return answer('Vermelho','Sinal de gravidade explicitamente informado; confirmar sinais vitais e avaliar imediatamente.');
    if(sat!==null&&sat>=85&&sat<=92||pas!==null&&(pas>=160||pad>=110)||glic!==null&&(glic>250||glic>200&&/poliuria|polidipsia|polifagia|perda ponderal/.test(t))||/dor intensa|febre associada|febre persistente|gestante|defesa muscular|massa abdominal|vomitos persistentes|sinais de desidratacao|ferida em pe diabetico|necrose|exsudato purulento|odor forte|violencia sexual|teste reagente|dor pelvica importante|animal nao localizado|idoso fragil|crianca pequena|resultado critico|ideacao suicida/.test(t))return answer('Amarelo','Achado que exige avaliação prioritária: '+[t,sat!==null?`SpO₂ ${sat}%`:'',pa?`PA ${pas}/${pad}`:'',glic!==null?`glicemia ${glic}`:''].filter(Boolean).join('; ')+'.');
    if(sat!==null&&sat>=84&&sat<85)return answer('Não classificado','SpO₂ entre 84 e 85%: intervalo não resolvido na figura municipal. Avaliação profissional imediata, sem presumir baixo risco.');
    if(glic!==null&&glic<70)return answer('Não classificado','Glicemia baixa: avaliar imediatamente pelo fluxo de hipoglicemia do serviço; não enquadrar como hiperglicemia nem presumir baixo risco.');
    if(/demanda administrativa/.test(q)&&!/dor|febre|dispneia|queixa aguda/.test(t))return answer('Azul','Demanda administrativa sem sintoma agudo ou sinal de alerta registrado.');
    if(!q&&!t)return answer('Não classificado','Queixa e avaliação ainda não registradas.');
    // A complaint alone cannot certify absence of risk.
    if(!t&&!d.assessed)return answer('Não classificado','Confirme a avaliação de sinais de alerta; campo vazio não significa ausência.');
    return answer('Verde','Queixa avaliada sem critério vermelho/amarelo identificado nos dados registrados; revisar o fluxo específico.');
  }
  function extractLabs(text){
    const found=[];
    const patterns=[['hb','Hemoglobina',/\bhemoglobina\b(?!\s+(?:glicada|a1c))[^\n\d]{0,30}(\d+(?:[,.]\d+)?)\s*([a-zµμ]+\/[a-z]+)?/gi],['glic','Glicemia',/\b(?:glicemia|glicose)(?:\s+(?:em|de))?(?:\s+jejum)?[^\n\d]{0,25}(\d+(?:[,.]\d+)?)\s*([a-zµμ]+\/[a-z]+)?/gi]];
    for(const [key,label,rx] of patterns)for(const m of String(text||'').matchAll(rx))found.push({key,label,value:number(m[1]),unit:m[2]||'Unidade não identificada — conferir',snippet:m[0]});
    return found;
  }
  return Object.freeze({normalize,number,positiveText,labLevel,localDate,localDateTime,gestationalDays,thyroid,anemia,triage,triageActions:actions,extractLabs});
});
