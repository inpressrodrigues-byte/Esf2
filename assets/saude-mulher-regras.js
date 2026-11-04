/* Regras rastreáveis ao protocolo municipal de Toledo, edição 2026.
 * Dados ausentes nunca equivalem a ausência de contraindicação. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SaudeMulherRegras=api;})(typeof window==='undefined'?globalThis:window,()=>{
  'use strict';
  const source='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-09/protocolo_municipal_de_enf_cuidado_em_saude_da_mulher_2026.pdf';
  const link=page=>source+'#page='+(page+2);
  const yes=v=>v==='Sim', no=v=>v==='Não', answered=v=>yes(v)||no(v);
  const num=v=>v===''||v==null?NaN:Number(String(v).replace(',','.'));
  const methods=[
    {id:'combinada',name:'Pílula combinada',column:0,ciap:'W11',network:'Municipal',ideal:'0,3',typical:'7–9',page:47,drug:'Etinilestradiol 0,03 mg + levonorgestrel 0,15 mg',dose:'1 comprimido VO por dia, no mesmo horário, durante 21 dias; pausa de 7 dias e reinício da cartela.',start:'Iniciar entre o 1º e o 5º dia do ciclo; preservativo por pelo menos 7 dias.',miss:'Até 12 h: tomar ao lembrar. Mais de 12 h: tomar ao lembrar e preservativo por 7 dias. Mais de um esquecimento na cartela: preservativo até terminá-la. Vômito até 4 h após a tomada: preservativo até o fim da cartela.',effects:'Náusea, sensibilidade mamária, tontura, alteração do humor e sangramento irregular inicial. Cefaleia intensa ou alteração visual: avaliação médica.'},
    {id:'mensal',name:'Injetável mensal combinado',column:2,ciap:'W14',network:'Municipal',ideal:'0,05',typical:'3',page:48,drug:'Escolher uma das três apresentações municipais abaixo',dose:'Aplicação intramuscular a cada 30 dias, conforme apresentação selecionada e bula.',start:'Primeira aplicação entre o 1º e o 5º dia do ciclo; preservativo por 7 dias.',miss:'Se atrasar, excluir gestação e seguir a bula da apresentação utilizada para reaplicação e proteção adicional.',effects:'Sensibilidade mamária, náusea, tontura, alteração do humor e sangramento irregular inicial. Cefaleia intensa ou alteração visual: avaliação médica.'},
    {id:'trimestral',name:'Injetável trimestral',column:3,ciap:'W14',network:'Municipal',ideal:'0,2',typical:'3–6',page:49,drug:'Acetato de medroxiprogesterona 150 mg/mL',dose:'150 mg (1 mL) por via IM a cada 84 dias.',start:'Até o 5º dia do ciclo ou em outro momento com gestação excluída. Preservativo por 7 a 14 dias.',miss:'Atraso de até uma semana: reaplicar. Acima de uma semana: excluir gravidez antes de reaplicar.',effects:'Amenorreia, variação de peso e sangramento irregular inicial. Cefaleia intensa ou alteração visual: avaliação médica.'},
    {id:'mini',name:'Minipílula de noretisterona',column:1,ciap:'W11',network:'Municipal',ideal:'0,3',typical:'7–9',page:50,drug:'Noretisterona 0,35 mg',dose:'1 comprimido VO diariamente, de forma contínua e no mesmo horário.',start:'O município restringe esta apresentação à amamentação exclusiva, a partir de 6 semanas após o parto.',miss:'Não ultrapassar 3 horas de atraso. Se ultrapassar, usar preservativo por 2 dias (seção 3.5.4).',effects:'Sangramento irregular, cefaleia leve, náusea e sensibilidade mamária.'},
    {id:'diu',name:'DIU de cobre',column:4,ciap:'W12',network:'Municipal',ideal:'0,6',typical:'0,8',page:49,drug:'DIU de cobre',dose:'Inserção/retirada por profissional habilitado; não registrar inserção apenas por escolher o método.',start:'Pós-parto: até 48 h, sem infecção puerperal, ou a partir de 4 semanas. Nuliparidade não impede o uso.',miss:'Avaliar queixas e posição do dispositivo. USG transvaginal para controle após inserção e anualmente; seção 4.4 também prevê avaliação antes da inserção.',effects:'Aumento de fluxo, cólicas e sangramento irregular nos primeiros meses. Reavaliar se comprometer qualidade de vida.'},
    {id:'implante',name:'Implante de etonogestrel',column:5,ciap:'W14',network:'Municipal',ideal:'0,05',typical:'0,05–0,1',page:52,drug:'Etonogestrel 68 mg',dose:'Encaminhar/agendar com profissional habilitado e aplicar o protocolo municipal específico de implante.',start:'A seção 3.4.7 remete ao protocolo de implante para os critérios e a técnica; esta triagem não autoriza inserção.',miss:'Verificar prazo, intercorrências e seguimento no protocolo específico.',effects:'Alterações de sangramento, sensibilidade mamária e cefaleia leve.'},
    {id:'diu-hormonal',name:'DIU de levonorgestrel',ciap:'W12',network:'Privada no protocolo',ideal:'0,2–0,5',typical:'0,7',page:53,drug:'Levonorgestrel 52 mg (20 microgramas/dia)',dose:'O protocolo municipal não atribui inserção/retirada ao enfermeiro. Encaminhar para avaliação médica.',start:'Duração citada: 8 anos; a partir de 4 semanas após o parto.',miss:'Avaliar dor, sangramento, expulsão e seguimento.',effects:'Oligomenorreia ou amenorreia, expulsão, dor ou sangramento.'},
    {id:'adesivo',name:'Adesivo combinado',ciap:'W14',network:'Privada no protocolo',ideal:'0,3',typical:'7–9',page:53,drug:'Norelgestromina 6 mg + etinilestradiol 0,60 mg',dose:'Troca semanal por 3 semanas, seguida de 1 semana sem adesivo.',start:'Iniciar no 1º dia do ciclo; pele limpa, sem cosméticos; alternar locais, nunca nas mamas. Evitar acima de 90 kg.',miss:'Conferir bula para descolamento ou atraso.',effects:'Reação local, sensibilidade mamária, náusea e cefaleia.'},
    {id:'anel',name:'Anel vaginal combinado',ciap:'W14',network:'Privada no protocolo',ideal:'0,3',typical:'7–9',page:54,drug:'Etonogestrel 11,7 mg + etinilestradiol 2,7 mg',dose:'Via vaginal por 3 semanas; retirar e pausar por 1 semana antes de novo anel.',start:'Iniciar no 1º dia do ciclo.',miss:'Se ficar fora da vagina mais de 2 horas, utilizar barreira conforme protocolo e conferir bula.',effects:'Aumento de secreção, irritação vaginal e cefaleia.'},
    {id:'progestageno',name:'Pílula de progestágeno isolado (rede privada)',ciap:'W11',network:'Privada no protocolo',ideal:'0,3',typical:'7–9',page:54,drug:'Desogestrel 75 microgramas ou drospirenona 4 mg',dose:'A seção 3.5.5 descreve uso diário sem pausa; conferir o regime da apresentação escolhida na bula antes de prescrever.',start:'Primeiros 5 dias do ciclo, com preservativo por pelo menos 7 dias.',miss:'Conduta depende do produto; consultar bula.',effects:'Alterações do padrão de sangramento.'},
    {id:'mini-privada',name:'Minipílulas da rede privada',ciap:'W11',network:'Privada no protocolo',ideal:'0,3',typical:'7–9',page:54,drug:'Linestrenol 0,5 mg ou levonorgestrel 0,03 mg',dose:'Uso diário no mesmo horário.',start:'Amamentação exclusiva e pelo menos 6 semanas após parto, conforme seção 3.5.4.',miss:'Atraso superior a 3 horas: preservativo por 2 dias.',effects:'Sangramento irregular, cefaleia leve, náusea e sensibilidade mamária.'},
    {id:'laqueadura',name:'Laqueadura tubária',ciap:'W14',network:'Municipal',ideal:'0,5',typical:'0,5',page:51,drug:'Método cirúrgico',dose:'Aconselhamento, manifestação de vontade, fluxo de encaminhamento e TCLE. Não é prescrição medicamentosa.',start:'Verificar capacidade civil e critérios legais; prazo mínimo de 60 dias entre manifestação e cirurgia. Sem exigência de consentimento do cônjuge.',miss:'Decisão permanente; discutir alternativas reversíveis.',effects:'Dor pós-operatória e sinais de infecção requerem avaliação.'},
    {id:'vasectomia',name:'Vasectomia (parceria)',ciap:'W14',network:'Municipal',ideal:'0,10',typical:'0,15',page:51,drug:'Método cirúrgico da parceria',dose:'Orientar e encaminhar para o fluxo de planejamento reprodutivo.',start:'Verificar consentimento e requisitos no serviço de referência.',miss:'Manter proteção até liberação pelo serviço responsável.',effects:'Orientações pós-operatórias do serviço.'},
    {id:'preservativo',name:'Preservativo externo',ciap:'W14',network:'Método de barreira',ideal:'2',typical:'13–18',page:56,drug:'Preservativo',dose:'Uso em todas as relações, desde o início, conforme orientações do produto.',start:'Pode ser associado a outro método para dupla proteção.',miss:'Rompimento/exposição: avaliar contracepção de emergência e prevenção de IST.',effects:'Avaliar sensibilidade ao material e alternativa adequada.'}
  ];
  const monthly=['Acetato de medroxiprogesterona 25 mg + cipionato de estradiol 5 mg','Algestona acetofenida 150 mg + enantato de estradiol 10 mg','Enantato de noretisterona 50 mg + valerato de estradiol 5 mg'];
  const failures=[...methods.filter(m=>!['mini-privada','progestageno','anel'].includes(m.id)).map(m=>[m.name,m.ideal,m.typical]),['LAM (por 6 meses)','0,5–0,9','2'],['Preservativo interno','5','21'],['Diafragma + espermicida','6','12–16'],['Coito interrompido','4','20–22'],['Método de ovulação Billings','3–5','≈24'],['Outros métodos de percepção de fertilidade','1–5','24–25'],['Espermicida isolado','18','28']];
  const risks=[
    ['ectopica','Gravidez ectópica prévia'],['ist','IST atual'],['cv','Múltiplos fatores de risco cardiovascular'],['trombofilia','Trombofilia conhecida'],['interacao','Rifampicina ou anticonvulsivantes indutores enzimáticos (fenitoína, carbamazepina, barbitúricos, primidona, topiramato, oxcarbazepina)'],['hipertensao','Hipertensão conhecida'],['tev','História pessoal de trombose venosa/embolia pulmonar'],['arterial','AVC, infarto ou doença valvular complicada'],['aura','Enxaqueca com aura'],['enxaqueca','Enxaqueca sem aura'],['mama','Câncer de mama atual ou prévio'],['diabetes','Diabetes com complicações ou duração superior a 20 anos'],['vesicula','Doença atual da vesícula em tratamento clínico'],['colestase','Colestase relacionada ao combinado'],['cirrose','Cirrose'],['hepatite','Hepatite viral ativa'],['tumor','Tumor hepático'],['sangramento','Sangramento genital sem causa esclarecida'],['puerperal','Infecção puerperal atual'],['outra','Outra condição ou medicamento que possa alterar a elegibilidade']
  ];
  function eligibility(d){
    const missing=[],age=num(d.idade),weight=num(d.peso),height=num(d.altura),pa=String(d.pa||'').match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/),sys=pa?+pa[1]:NaN,dia=pa?+pa[2]:NaN;
    if(!Number.isFinite(age)||age<10||age>65)missing.push('Idade válida (fora de 10–65 anos exige avaliação individual)');
    if(!Number.isFinite(weight)||weight<25||weight>350||!Number.isFinite(height)||height<100||height>220)missing.push('Peso e altura válidos');
    if(!pa||sys<70||sys>260||dia<40||dia>160||sys<=dia)missing.push('Pressão arterial válida');
    for(const [id,label] of [['gestante','Situação gestacional'],['lactante','Amamentação'],['nulipara','Nuliparidade'],['fuma','Tabagismo'],...risks])if(!answered(d[id]))missing.push(label);
    if(!['nenhum','lt6','6a6','gt6'].includes(d.posparto))missing.push('Período após parto');
    if(yes(d.lactante)&&d.posparto==='nenhum')missing.push('Corrigir amamentação sem período pós-parto');
    if(d.posparto!=='nenhum'&&(!Number.isFinite(num(d.diasparto))||num(d.diasparto)<0))missing.push('Dias desde o parto');
    if(d.posparto==='lt6'&&num(d.diasparto)>=42||d.posparto==='6a6'&&(num(d.diasparto)<42||num(d.diasparto)>184)||d.posparto==='gt6'&&num(d.diasparto)<180)missing.push('Revisar coerência entre dias e período pós-parto');
    if(yes(d.fuma)&&(!Number.isFinite(num(d.cigarros))||num(d.cigarros)<1))missing.push('Cigarros por dia');
    if(no(d.gestante)&&!String(d.exclusao||'').trim())missing.push('Fundamento para excluir gestação');
    const bmi=weight/(height/100)**2,rows=[];
    const add=(label,values,page=60)=>rows.push({label,values,page});
    if(Number.isFinite(age))add(age>=40?'Idade ≥40 anos':'Idade <40 anos',age>=40?[2,1,2,1,1,1]:[1,1,1,1,1,1]);
    if(yes(d.nulipara))add('Nuliparidade',[1,1,1,1,2,1]);
    if(yes(d.lactante)){
      if(d.posparto==='lt6')add('Amamentação antes de 6 semanas',[4,2,4,3,2,2]);
      if(d.posparto==='6a6')add('Amamentação entre 6 semanas e 6 meses',[3,1,3,1,1,1]);
      if(d.posparto==='gt6')add('Amamentação após 6 meses',[2,1,2,1,1,1]);
    }else if(no(d.lactante)&&d.posparto==='lt6')add('Pós-parto sem amamentação',[num(d.diasparto)<21?3:'Revisar',1,3,1,1,1],61);
    if(yes(d.ectopica))add('Gravidez ectópica prévia',[1,2,1,1,1,1],61);
    if(bmi>30)add('IMC >30 kg/m²',[2,1,2,1,1,1],61);
    if(yes(d.ist))add('IST atual',[2,1,2,1,4,1],61);
    if(yes(d.cv))add('Múltiplos fatores cardiovasculares',['3/4',2,'3/4',3,1,2],61);
    if(yes(d.fuma))add('Tabagismo',age<35?[2,1,2,1,1,1]:[num(d.cigarros)>=15?4:3,1,num(d.cigarros)>=15?4:3,1,1,1],62);
    const combo=(key,label,cat)=>{if(yes(d[key]))add(label,[cat,'Revisar',cat,'Revisar','Revisar','Revisar'],62);};
    for(const key of ['trombofilia','interacao','tev','arterial','aura','mama','hepatite'])combo(key,risks.find(r=>r[0]===key)[1],4);
    for(const key of ['diabetes','cirrose','tumor'])combo(key,risks.find(r=>r[0]===key)[1],'3/4');
    for(const key of ['vesicula','colestase'])combo(key,risks.find(r=>r[0]===key)[1],3);
    if(yes(d.enxaqueca))add('Enxaqueca sem aura',[age>=35?'3/4':'Revisar','Revisar',age>=35?'3/4':'Revisar','Revisar','Revisar','Revisar'],62);
    if(sys>=140||dia>=90)add('PA elevada: quadro 8 municipal',[4,'Revisar',4,'Revisar','Revisar','Revisar'],62);
    else if(yes(d.hipertensao))add('Hipertensão: requer avaliação específica',[3,'Revisar',3,'Revisar','Revisar','Revisar'],62);
    if(['sangramento','outra'].some(k=>yes(d[k])))add('Condição não detalhada na matriz municipal',Array(6).fill('Revisar'),61);
    if(yes(d.puerperal))add('Infecção puerperal: não inserir DIU',['Revisar','Revisar','Revisar','Revisar',4,'Revisar'],50);
    const result=methods.map(m=>{
      const reasons=Number.isInteger(m.column)?rows.filter(r=>r.values[m.column]!==1).map(r=>({label:r.label,category:r.values[m.column],page:r.page})):[];
      const values=reasons.map(r=>r.category);let category=values.includes(4)?4:values.includes('3/4')?'3/4':values.includes(3)?3:values.includes('Revisar')?'Revisar':values.includes(2)?2:1;
      if(!Number.isInteger(m.column))category='Revisar';
      const blockers=[...missing];
      if(!no(d.gestante))blockers.push('Não iniciar contraceptivo com gestação presente ou não excluída; planejar o pós-parto');
      if(category===4)blockers.push('Categoria 4: não prescrever');
      else if(category===3||category==='3/4')blockers.push('Categoria 3 ou 3/4: avaliação/prescrição médica');
      else if(category==='Revisar')blockers.push('A matriz municipal não resolve esta situação para o método: consultar referência/avaliação individual');
      if(m.id==='mini'&&!(yes(d.lactante)&&yes(d.exclusiva)&&['6a6','gt6'].includes(d.posparto)))blockers.push('Noretisterona: somente amamentação exclusiva e ≥6 semanas, conforme seção 3.4.5');
      if(m.id==='diu'&&d.posparto!=='nenhum'&&num(d.diasparto)>2&&num(d.diasparto)<28)blockers.push('DIU: intervalo entre 48 horas e 4 semanas pós-parto fora da janela prevista');
      if(m.id==='diu'&&num(d.diasparto)===2)blockers.push('Confirmar janela de até 48 horas em serviço habilitado');
      if(['diu','implante'].includes(m.id))blockers.push('Agendamento/encaminhamento com profissional habilitado; seleção não equivale à inserção');
      return {...m,category,estimated:missing.length>0,reasons,blockers,eligible:blockers.length===0};
    });
    return {missing,bmi:Number.isFinite(bmi)?bmi:null,rows,methods:result};
  }
  const diseases={
    cand:{name:'Candidíase vulvovaginal',ciap:'X72',page:15},
    bv:{name:'Vaginose bacteriana',ciap:'X84',page:16},
    tri:{name:'Tricomoníase',ciap:'X73',page:16},
    cerv:{name:'Cervicite',ciap:'X85',page:17}
  };
  function discharge(d){
    const candidates=[],add=(id,why)=>candidates.push({...diseases[id],id,why});
    if(d.micro==='hifas'||d.aspecto==='grumoso'&&(yes(d.eritema)||yes(d.prurido)))add('cand',d.micro==='hifas'?'Hifas/blastoconídeos registrados':'Corrimento grumoso associado a prurido ou inflamação vulvar');
    if(d.micro==='clue'||yes(d.odor)&&['acinzentado','esverdeado'].includes(d.cor)||d.koh==='Positivo')add('bv','Odor, aspecto/cor ou exame compatível; diferenciar tricomoníase');
    if(d.micro==='trich'||yes(d.morango)||d.aspecto==='espumoso'&&['amarelo-esverdeado','esverdeado'].includes(d.cor)&&yes(d.odor)&&yes(d.prurido))add('tri','Trichomonas, colo em morango ou conjunto de achados compatíveis');
    if(yes(d.riscoist)&&[d.pus,d.friavel,d.edemacolo,d.dispareunia].some(yes))add('cerv','Risco de IST associado a achado cervical/dispareunia, conforme fluxograma');
    const urgent=[['dor','Dor pélvica importante'],['mobilizacao','Dor à mobilização do colo: investigar DIP'],['sangra','Sangramento intenso'],['violencia','Violência sexual'],['perdaliquido','Perda de líquido na gestação']].filter(([id])=>yes(d[id])).map(([,label])=>label);
    if(num(d.temp)>=38)urgent.push('Febre ≥38 °C');
    const notes=[];
    if(candidates.length>1)notes.push('Achados sobrepostos: investigar coinfecção/diferenciais. Não somar esquemas automaticamente.');
    if(!candidates.length)notes.push('Sem combinação suficiente para classificar. Cor ou odor isolado não confirma doença; investigar secreção fisiológica e outras causas.');
    if(d.micro==='citolitica')notes.push('Citólise com lactobacilos: avaliar vaginose citolítica; não presumir candidíase.');
    const pending=[];
    for(const [id,label]of [['gestante','Gestação'],['lactante','Lactação'],['alergia','Alergia ao esquema'],['complicado','Recorrência/complicação'],['interacoes','Interações/contraindicações adicionais revisadas']])if(!answered(d[id]))pending.push(label);
    if(!yes(d.interacoes))pending.push('Revisar medicamentos, interações e contraindicações do esquema');
    if(!yes(d.exame)||!d.achados?.trim())pending.push('Registrar exame ginecológico e achados');
    if(!yes(d.confirmado)||!diseases[d.diagnostico])pending.push('Confirmar diagnóstico e critérios após avaliação');
    if(yes(d.alergia))pending.push('Alergia ao esquema: selecionar conduta individualizada');
    if(yes(d.complicado))pending.push('Quadro complicado/recorrente: reavaliar esquema fora deste fluxo simples');
    for(const [id,label]of [['dor','Dor pélvica importante'],['mobilizacao','Dor à mobilização'],['sangra','Sangramento intenso'],['violencia','Violência'],['perdaliquido','Perda de líquido']])if(!answered(d[id]))pending.push('Avaliar '+label.toLowerCase());
    if(!Number.isFinite(num(d.temp))||num(d.temp)<34||num(d.temp)>43)pending.push('Registrar temperatura válida');
    if(yes(d.gestante)&&(!Number.isFinite(num(d.ig))||num(d.ig)<1||num(d.ig)>42))pending.push('Registrar idade gestacional');
    pending.push(...urgent);
    const regimens=[];const put=(id,label,drug,dose,note='')=>regimens.push({id,label,drug,dose,note,page:diseases[d.diagnostico]?.page,enabled:pending.length===0});
    if(d.diagnostico==='cand'){
      put('cand-top','Primeira linha vaginal','Miconazol creme vaginal 2%',yes(d.gestante)?'1 aplicador cheio à noite, por via vaginal, por no mínimo 10 dias; definir duração na avaliação.':'1 aplicador cheio à noite, por via vaginal, durante 7 dias.','Na gestação: somente via vaginal; não usar esquema oral.');
      if(no(d.gestante)&&no(d.lactante)){
        put('cand-flu','Alternativa de primeira linha','Fluconazol 150 mg','1 comprimido VO, dose única.');
        put('cand-itra','Segunda linha','Itraconazol 100 mg','2 comprimidos VO, 2 vezes no dia, por 1 dia.');
      }
      if(no(d.gestante))put('cand-nis','Segunda linha vaginal','Nistatina creme vaginal 25.000 UI/g','1 aplicador cheio por via vaginal à noite, por 7 noites.');
    }
    if(d.diagnostico==='bv'){
      put('bv-250','Primeira linha','Metronidazol 250 mg','2 comprimidos VO, 2 vezes ao dia, por 7 dias.','Tomar após as refeições.');
      put('bv-400','Alternativa oral','Metronidazol 400 mg','1 comprimido VO a cada 8 horas, por 7 dias.');
      put('bv-gel','Alternativa vaginal','Metronidazol gel vaginal 100 mg/g','1 aplicador cheio por via vaginal à noite, por 7 dias.');
    }
    if(d.diagnostico==='tri')put('tri-250','Primeira linha','Metronidazol 250 mg','2 comprimidos VO, 2 vezes ao dia, por 7 dias.','Tratar parcerias concomitantemente e orientar preservativo. Creme vaginal não trata tricomoníase.');
    if(d.diagnostico==='cerv'){
      if(no(d.gestante)&&no(d.lactante))put('cerv-doxi','Primeira linha','Ceftriaxona 500 mg + doxiciclina 100 mg','Ceftriaxona 500 mg IM em dose única + doxiciclina 100 mg VO a cada 12 horas por 7 dias.','Doxiciclina contraindicada na gestação.');
      put('cerv-azi','Alternativa do protocolo sem doxiciclina','Ceftriaxona 500 mg + azitromicina 500 mg','Ceftriaxona 500 mg IM, dose única + azitromicina 500 mg, 2 comprimidos VO em dose única.','Avaliar outras IST e parcerias. Se não melhorar, avaliação médica.');
    }
    if(yes(d.lactante))notes.push('Lactação: revisar a segurança específica de cada fármaco; candidíase com opções vaginais, sem azol oral automático.');
    if(yes(d.gestante))notes.push('Gestação: integrar ao pré-natal. Na candidíase, via vaginal por no mínimo 10 dias; na cervicite, não usar doxiciclina.');
    return {candidates,urgent,notes,pending:[...new Set(pending)],regimens};
  }
  return {source,link,methods,monthly,failures,risks,eligibility,discharge,diseases};
});
