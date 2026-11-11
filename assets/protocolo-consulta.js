/* Índice de consulta do protocolo municipal de demanda espontânea, edição 2026.
 * As páginas individuais preservam as faixas etárias, indicações e limites das tabelas.
 * Estas orientações são referências de consulta. Nenhuma delas grava uma prescrição. */
(function(root,create){
  const api=create();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.ProtocoloConsulta=api;
})(globalThis,()=>{
  'use strict';
  const demanda='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-06/protocolo_avaliacao_e_manejo_da_demanda_espontanea_aps_2026.pdf';
  const mulher='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-09/protocolo_municipal_de_enf_cuidado_em_saude_da_mulher_2026.pdf';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  // Queixa selecionável, primeira página, página de manejo, sinônimos, orientação de consulta.
  const entries=[
    ['Atraso menstrual',17,19,'amenorreia|atraso menstrual','Verificar DUM, possibilidade de gestação, dor e sangramento. Investigar com teste de gravidez e organizar pré-natal se positivo.','gestacao'],
    ['Cefaleia',21,23,'cefaleia|dor de cabeca','Avaliar PA, início súbito e sinais neurológicos. Priorizar sinais de alarme. No quadro sem gravidade, avaliar analgesia conforme idade, condições clínicas e quadro municipal.'],
    ['Cólica menstrual',24,25,'colica menstrual|dismenorreia','Caracterizar dor e sangramento, avaliar possibilidade de gestação e sinais de alarme. O quadro apresenta analgesia e antiespasmódicos por público.'],
    ['Constipação',27,28,'constipacao|prisao de ventre','Avaliar hábito intestinal, alimentação, hidratação, medicamentos e sinais de obstrução. Orientar medidas alimentares e seguimento.'],
    ['Crise convulsiva',30,31,'crise convulsiva|convulsao','Durante a crise, proteger de trauma e acionar imediatamente avaliação médica e suporte de urgência. Avaliar respiração e duração da crise.'],
    ['Descompensação da pressão arterial',33,34,'descompensacao da pressao arterial|pa elevada|pressao alta','Confirmar a medida de PA e verificar sintomas de lesão aguda de órgão-alvo. Definir urgência e avaliação médica antes de qualquer ajuste de fármaco.'],
    ['Diarreia e/ou náusea/vômito',35,37,'diarreia|nauseas?|vomitos?','Avaliar hidratação, perfusão, aceitação de líquidos e perdas. Conduzir reidratação de acordo com a avaliação e reavaliar sinais de gravidade.'],
    ['Dispneia',38,39,'dispneia|falta de ar','Avaliar esforço respiratório, saturação e sinais vitais. Acionar atendimento imediato na insuficiência respiratória ou instabilidade.'],
    ['Disúria',40,42,'itu|disuria|cistite|polaciuria|urgencia urinaria|infeccao (?:do trato )?urinari[ao]|ardor ao urinar|queixa urinaria','Avaliar gestação, febre, dor lombar e sinais sistêmicos.','itu'],
    ['Dor abdominal',43,44,'dor abdominal|dor na barriga','Avaliar localização, evolução, irritação peritoneal e possibilidade de gestação. Priorizar avaliação médica de abdome agudo.'],
    ['Dor articular',46,47,'dor articular|artralgia','Investigar trauma, febre, edema e limitação funcional. O quadro prevê analgesia de acordo com o perfil e contraindicações.'],
    ['Dor lombar',49,50,'dor lombar|lombalgia','Investigar febre, sintomas urinários, trauma e déficit neurológico. Sem alarme, avaliar analgesia, mobilidade e evolução.'],
    ['Dor osteomuscular',52,53,'dor osteomuscular|dor muscular|mialgia','Avaliar mecanismo, capacidade funcional, trauma e sinais sistêmicos. Conferir analgesia permitida e indicação de encaminhamento.'],
    ['Dor torácica',55,56,'dor toracica|dor no peito','Avaliar sinais vitais, irradiação, dispneia, sudorese e síncope. Suspeita de emergência exige atendimento imediato antes de manejo sintomático.'],
    ['Edema',58,59,'edema|inchaco','Examinar distribuição, simetria, início e sintomas associados. Direcionar investigação laboratorial para a causa clínica.'],
    ['Febre',60,61,'febre|febril','Investigar duração, foco, estado geral, hidratação e sinais de gravidade. Conferir o antitérmico aplicável à idade e ao peso.'],
    ['Herpes labial',63,65,'herpes labial','Avaliar extensão e início das lesões. Orientar cuidados locais e prevenção do contato. Conferir indicação de aciclovir e necessidade de avaliação médica.'],
    ['Herpes genital',66,67,'herpes genital','Avaliar lesões, recorrência, gestação e exposição a IST. Orientar proteção, testagem e tratamento antiviral conforme situação clínica.'],
    ['Herpes zoster',69,70,'herpes zoster|cobreiro','Avaliar distribuição, dor, imunossupressão e acometimento ocular. Encaminhar precocemente para avaliação do antiviral.'],
    ['Hemorroida/doenças orificiais',72,73,'hemorroidas?|doencas orificiais','Caracterizar dor e sangramento, examinar com privacidade e avaliar sinais de gravidade. Orientar hidratação, fibras e alívio sintomático indicado.'],
    ['Hiperglicemia',75,76,'hiperglicemia|glicemia elevada','Aferir glicemia e pesquisar sinais de descompensação aguda. No seguimento de diabetes, conferir HbA1c e estratificação metabólica.'],
    ['Leucorreias',77,78,'leucorreias?|corrimento(?: vaginal)?|candidiase(?: vulvovaginal)?|vaginose(?: bacteriana)?|tricomon[ií]ase|cervicite','Caracterizar secreção, prurido, odor e exame, avaliar gestação, dor pélvica e febre. A conduta depende da hipótese confirmada.','corrimento'],
    ['Mastalgia',80,81,'mastalgia|dor mamaria|dor nas mamas','Avaliar gestação, lactação e exame das mamas. Na lactação, observar mamada e ajustar pega quando indicado.'],
    ['Mordedura/acidente com animais',83,84,'mordedura|mordida de animal|acidente com animais','Identificar animal e tipo de exposição, lavar o ferimento e avaliar profilaxias para raiva e tétano e notificação.'],
    ['Odinofagia/síndrome gripal',86,88,'odinofagia|sindrome gripal|dor de garganta','Avaliar via aérea, hidratação e sinais respiratórios. Oferecer medidas de suporte e avaliar tratamento sintomático conforme o público.'],
    ['Otalgia',90,91,'otalgia|dor de ouvido','Examinar ouvido, avaliar febre e secreção. O manejo de cerume depende do exame. Orientar evitar cotonetes e selecionar analgesia conforme avaliação.'],
    ['Parasitoses intestinais',93,94,'parasitoses? intestinais?|verminose','Avaliar sintomas e exposição, solicitar parasitológico de fezes conforme investigação e direcionar tratamento ao agente e à faixa etária.'],
    ['Pirose',96,98,'pirose|azia','Avaliar sintomas e sinais de alarme. Orientar medidas alimentares e posturais. Conferir indicação e contraindicações de antiácidos.'],
    ['Problemas de pele',99,102,'problemas de pele|dermatite|lesao de pele','Examinar extensão e características das lesões e sinais sistêmicos. A tabela de tratamentos tópicos diferencia a indicação por diagnóstico.'],
    ['Problemas oftalmológicos',104,105,'problemas oftalmologicos|dor ocular|olho vermelho','Avaliar visão, trauma e exposição química. Irrigação imediata quando indicada e avaliação médica de urgência em situações de risco ocular.'],
    ['Queimadura',106,107,'queimaduras?','Avaliar agente, extensão, profundidade e áreas críticas. Proteger a lesão, avaliar analgesia e necessidade de encaminhamento.'],
    ['Reação alérgica',108,110,'reacao alergica|urticaria|anafilaxia','Avaliar respiração, edema de língua/face e instabilidade. Suspeita de anafilaxia exige atendimento imediato. Conferir tratamento específico somente após classificar a gravidade.'],
    ['Sangramento genital',111,113,'sangramento (?:genital|vaginal)','Avaliar volume, sinais vitais e possibilidade de gestação. Priorizar instabilidade, sangramento intenso ou suspeita de complicação obstétrica.'],
    ['Síndrome pé-mão-boca',114,115,'sindrome pe.mao.boca|pe.mao.boca','Avaliar hidratação e aceitação alimentar. Orientar líquidos, dieta tolerada e alívio da dor/febre adequado à idade e ao peso.'],
    ['Sofrimento mental',116,117,'sofrimento mental|ideacao suicida|autoagressao','Avaliar risco imediato, plano, rede de apoio e segurança. Acionar a equipe e o fluxo de saúde mental conforme estratificação.']
  ];
  const rules=entries.map(([title,page,carePage,terms,care,kit])=>({title,page,carePage,rx:new RegExp('\\b(?:'+terms+')\\b'),care,kit}));
  function positive(text){
    return norm(text).split(/[.;!?\n|]+|\s+(?:mas|porem)\s+|,\s*(?=(?:refere|apresenta|com)\b)/)
      .filter(part=>!(/\b(?:descartad[ao]s?|negad[ao]s?|ausentes?|resolvid[ao]s?)\b/.test(part)))
      .map(part=>part.split(/\b(?:nega|negou|sem|nao|ausencia de|historico de|antecedente de|mae com|pai com)\b/)[0]).filter(Boolean);
  }
  function match(text){const parts=positive(text);return rules.filter(rule=>parts.some(part=>rule.rx.test(part)));}
  function urinary(c){
    const source={title:'Saúde da Mulher · p. 35–36',url:mulher+'#page=37'};
    const base={title:'Queixa urinária / suspeita de ITU',kit:'itu',refs:[{title:'Demanda Espontânea · p. 40–42',url:demanda+'#page=40'}]};
    if(c.pregnancyConflict)return {...base,kit:null,care:'Conferir gestação. A avaliação registra “Não” e também a condição “Gestante”. Corrija a informação para consultar o fluxo aplicável.'};
    if(c.gestante==='Sim'){
      return {...base,title:'Queixa urinária na gestação',priority:c.urgent?'Avaliação médica prioritária por sinal de alarme.':'Atendimento prioritário na gestação. Investigar infecção alta.',
        exams:'EAS e urocultura com antibiograma. Colher a cultura antes do antibiótico quando possível, sem atrasar o atendimento.',
        care:c.urgent?'Febre, dor lombar ou comprometimento sistêmico exigem avaliação médica. Priorizar encaminhamento e tratamento.':'Providenciar avaliação médica para definir antibioticoterapia e revisar cultura e sensibilidade. O fluxograma cita cefalexina e nitrofurantoína, com restrição obstétrica para esta última no fim da gestação e na lactação.',
        treatment:c.urgent?'':Number.isFinite(c.ig)&&c.ig>=36?'Para avaliação médica, o quadro cita cefalexina 500 mg VO de 6/6 h por 7–10 dias. Conferir alergias, cultura e sensibilidade.':'Entre as opções do fluxograma para avaliação médica estão cefalexina 500 mg VO de 6/6 h por 7–10 dias e nitrofurantoína 100 mg VO de 6/6 h por 7 dias. Conferir IG, alergias e função renal. O documento restringe a nitrofurantoína após a 36ª semana e na lactação.',
        note:'A seção 2.4 descreve esquemas na gestação, mas explicita a prescrição de enfermagem para cistite simples em não gestantes. Conferir o fluxo obstétrico com a equipe.',refs:[source,...base.refs]};
    }
    if(c.child)return {...base,priority:'Avaliar idade, estado geral, febre e sinais sistêmicos. Criança em idade escolar consta entre os critérios de prioridade.',
      exams:'A investigação depende da idade e do quadro. Avaliar coleta de urina conforme o fluxo pediátrico.',care:'Encaminhar para avaliação pediátrica conforme gravidade. A tabela de antibióticos para disúria se refere a adultos.'};
    if(c.urgent)return {...base,priority:'Avaliação médica prioritária. Investigar infecção alta ou complicação.',exams:'Avaliar EAS e urocultura com antibiograma conforme contexto. Os exames não devem atrasar o encaminhamento.',care:'Priorizar avaliação médica e definir tratamento conforme gravidade e cultura.'};
    if(c.gestante!=='Não'&&!c.male)return {...base,exams:'Verificar possibilidade de gestação. Se confirmada, o protocolo indica EAS e urocultura com antibiograma.',care:'Avaliar febre, dor lombar e fatores de complicação antes de definir tratamento.'};
    return {...base,exams:'Avaliar EAS. A exceção é a mulher jovem não grávida com cistite típica e sem risco de resistência. Cultura em homens, recorrência, complicação ou risco de resistência. Em falha ou retorno rápido, cultura com antibiograma.',
      care:c.male?'Avaliar infecção complicada e encaminhar para definição terapêutica.':c.scope==='mulher'&&c.adult?'Na cistite simples de mulher adulta não gestante, confirmar critérios, alergias, lactação e contraindicações. O fluxo descreve nitrofurantoína ou sulfametoxazol + trimetoprima conforme avaliação e protocolo institucional. Encaminhar se houver piora ou persistência.':'Confirmar faixa etária, perfil e ausência de complicação. O esquema de cistite simples depende dessa avaliação.',refs:[...base.refs,source]};
  }
  return {rules,match,positive,norm,urinary,demanda,mulher};
});
