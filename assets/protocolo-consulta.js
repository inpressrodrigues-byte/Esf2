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
    ['Herpes genital',66,67,'herpes genital','Avaliar lesões, recorrência, gestação e exposição a IST. Orientar proteção, testagem e tratamento antiviral conforme situação clínica.','ist-lesoes'],
    ['Herpes zoster',69,70,'herpes zoster|cobreiro','Avaliar distribuição, dor, imunossupressão e acometimento ocular. Encaminhar precocemente para avaliação do antiviral.'],
    ['Hemorroida/doenças orificiais',72,73,'hemorroidas?|doencas orificiais','Caracterizar dor e sangramento, examinar com privacidade e avaliar sinais de gravidade. Orientar hidratação, fibras e alívio sintomático indicado.'],
    ['Hiperglicemia',75,76,'hiperglicemia|glicemia elevada','Aferir glicemia e pesquisar sinais de descompensação aguda. No seguimento de diabetes, conferir HbA1c e estratificação metabólica.'],
    ['Leucorreias',77,78,'leucorreias?|corrimento(?: vaginal)?|candidiase(?: vulvovaginal)?|vaginose(?: bacteriana)?|tricomon[ií]ase|cervicite','Caracterizar secreção, prurido, odor e exame, avaliar gestação, dor pélvica e febre. A conduta depende da hipótese confirmada.','corrimento'],
    ['Mastalgia',80,81,'mastalgia|dor mamaria|dor nas mamas','Avaliar gestação, lactação e exame das mamas. Na lactação, observar mamada e ajustar pega quando indicado.'],
    ['Mordedura/acidente com animais',83,84,'mordedura|mordida de animal|acidente com animais','Identificar animal e tipo de exposição, lavar o ferimento e avaliar profilaxias para raiva e tétano e notificação.'],
    ['Odinofagia/síndrome gripal',86,88,'odinofagia|sindrome gripal|dor de garganta','Avaliar via aérea, hidratação e sinais respiratórios. Oferecer medidas de suporte e avaliar tratamento sintomático conforme o público.'],
    ['Otalgia',90,91,'otalgia|dor de ouvido','Examinar ouvido, avaliar febre e secreção. O manejo de cerume depende do exame. Orientar evitar cotonetes e selecionar analgesia conforme avaliação.'],
    ['Parasitoses intestinais',93,94,'parasitoses? intestinais?|verminose|giardiase|ascaridiase|enterobiase','Avaliar sintomas e exposição, solicitar parasitológico de fezes conforme investigação e direcionar tratamento ao agente e à faixa etária.','parasitoses'],
    ['Pirose',96,98,'pirose|azia','Avaliar sintomas e sinais de alarme. Orientar medidas alimentares e posturais. Conferir indicação e contraindicações de antiácidos.'],
    ['Problemas de pele',99,102,'problemas de pele|dermatite|lesao de pele|escabiose|sarna|pediculose|piolhos?','Examinar extensão e características das lesões e sinais sistêmicos. A tabela de tratamentos tópicos diferencia a indicação por diagnóstico.'],
    ['Problemas oftalmológicos',104,105,'problemas oftalmologicos|dor ocular|olho vermelho','Avaliar visão, trauma e exposição química. Irrigação imediata quando indicada e avaliação médica de urgência em situações de risco ocular.'],
    ['Queimadura',106,107,'queimaduras?','Avaliar agente, extensão, profundidade e áreas críticas. Proteger a lesão, avaliar analgesia e necessidade de encaminhamento.'],
    ['Reação alérgica',108,110,'reacao alergica|urticaria|anafilaxia','Avaliar respiração, edema de língua/face e instabilidade. Suspeita de anafilaxia exige atendimento imediato. Conferir tratamento específico somente após classificar a gravidade.'],
    ['Sangramento genital',111,113,'sangramento (?:genital|vaginal)','Avaliar volume, sinais vitais e possibilidade de gestação. Priorizar instabilidade, sangramento intenso ou suspeita de complicação obstétrica.'],
    ['Síndrome pé-mão-boca',114,115,'sindrome pe.mao.boca|pe.mao.boca','Avaliar hidratação e aceitação alimentar. Orientar líquidos, dieta tolerada e alívio da dor/febre adequado à idade e ao peso.'],
    ['Sofrimento mental',116,117,'sofrimento mental|ideacao suicida|autoagressao','Avaliar risco imediato, plano, rede de apoio e segurança. Acionar a equipe e o fluxo de saúde mental conforme estratificação.']
  ];
  // Elementos do manejo e da investigação, organizados pela queixa do acolhimento.
  // A segunda coluna distingue exame clínico à beira do leito de pedido laboratorial/imagem.
  const management={
    'Atraso menstrual':['Se positivo, agendar abertura do pré-natal preferencialmente em uma semana. Se negativo e persistir amenorreia, investigar com o médico e discutir planejamento reprodutivo.','Priorizar TIG na UBS. Se indisponível, solicitar β-hCG. Ofertar testes rápidos para IST.'],
    'Cefaleia':['Sem alarme, aferir PA antes da analgesia; o fluxo cita paracetamol ou dipirona e reavaliação da PA em 30 minutos. Na gestação, pico pressórico, edema ou alteração visual exigem avaliação médica imediata.','Aferir PA e glicemia capilar.'],
    'Cólica menstrual':['Calor local e medidas de relaxamento. Na cólica menstrual habitual, a tabela inclui escopolamina, dipirona ou paracetamol conforme idade e contraindicações.','Avaliar relação com o ciclo, sangramento e possibilidade de gestação.'],
    'Constipação':['Ajustar ingestão de líquidos e fibras conforme tolerância, estimular mobilidade e rotina após refeições. Distensão importante, vômitos ou parada de gases exigem avaliação de obstrução.','Avaliar abdome, hábito intestinal e medicamentos em uso.'],
    'Crise convulsiva':['Acionar equipe e médico, cronometrar a crise, proteger a cabeça e lateralizar quando seguro. Não conter os membros nem introduzir objetos na boca.','Verificar glicemia capilar após estabilização e monitorar respiração e sinais vitais.'],
    'Descompensação da pressão arterial':['Sintomas neurológicos, dor torácica ou dispneia exigem avaliação imediata. Em acompanhamento estável, conferir adesão e orientar registro da PA durante sete dias.','Repetir a medida da PA com técnica adequada e avaliar sinais de lesão de órgão-alvo.'],
    'Diarreia e/ou náusea/vômito':['Ofertar soro de reidratação oral se tolerado. Na desidratação leve a moderada, observar na UBS e reavaliar a cada 30 minutos. Na grave, acionar médico e suporte de urgência.','Avaliar hidratação, perfusão, aceitação de líquidos e sinais vitais.'],
    'Dispneia':['Avaliar respiração e acionar suporte imediato se houver desconforto intenso, hipóxia ou instabilidade.','Oximetria e frequência respiratória. Se houver suspeita de tuberculose, o fluxo prevê BAAR em duas amostras, cultura de escarro, teste de sensibilidade e radiografia de tórax PA/perfil; ofertar testes rápidos para IST.'],
    'Dor abdominal':['Dor súbita intensa, irritação peritoneal ou instabilidade exigem avaliação médica imediata. No quadro estável, a analgesia depende da avaliação da causa.','Palpar abdome e aferir sinais vitais. Considerar teste rápido de gravidez em idade reprodutiva.'],
    'Dor articular':['Sem alarme, termoterapia e analgesia simples; o quadro cita paracetamol. Trauma há menos de 72 horas segue para pronto atendimento.','Examinar mobilidade, edema, sinais inflamatórios e mecanismo de trauma.'],
    'Dor lombar':['Sem alarme, calor local, orientação postural e analgesia simples conforme perfil. Trauma recente, déficit neurológico ou febre com disúria exigem avaliação médica.','Avaliar irradiação, força e sintomas urinários.'],
    'Dor osteomuscular':['Na dor de baixo risco, repouso relativo, compressa fria na lesão aguda ou morna na contratura; paracetamol consta no quadro. Suspeita de fratura, luxação ou déficit motor exige avaliação médica.','Avaliar trauma, movimento, sensibilidade e força.'],
    'Dor torácica':['Na suspeita de infarto ou instabilidade, acionar imediatamente médico e SAMU. Manter em observação com suporte disponível.','ECG em até 10 minutos da chegada, se disponível na UBS. Aferir PA, pulso, frequência respiratória e saturação.'],
    'Edema':['Elevar os membros no edema leve de origem circulatória. Na gestação com PA elevada, avaliação médica imediata.','Aferir PA e avaliar simetria e cacifo. Para edema crônico no adulto não gestante, considerar EAS e função renal.'],
    'Febre':['Hidratação, conforto e antitérmico conforme idade/peso; o quadro cita paracetamol e dipirona. Menor de três meses com febre requer avaliação médica urgente.','Aferir temperatura e avaliar foco, estado geral e sinais de gravidade.'],
    'Herpes labial':['Recorrência localizada sem alarme: cuidados locais e avaliação de aciclovir oral ou tópico conforme faixa etária. Gestação, imunossupressão ou primeiro episódio muito sintomático: avaliação médica no dia. Lesão ocular ou incapacidade de ingerir líquidos: imediata.','Inspecionar extensão, crostas, sinais de infecção e acometimento ocular.'],
    'Herpes genital':['Aciclovir precoce conforme episódio. Encaminhar para avaliação médica no primeiro episódio, gestação ou imunossupressão. Orientar evitar contato sexual durante as lesões.','Inspecionar lesões e linfonodos; ofertar testes rápidos para HIV, sífilis e hepatites.'],
    'Herpes zoster':['Avaliação médica precoce para antiviral, preferencialmente até 72 horas. Cobrir as lesões. Acometimento ocular, neurológico ou disseminado exige atendimento imediato.','Examinar distribuição das lesões, extensão e sinais de complicação.'],
    'Hemorroida/doenças orificiais':['Aumentar fibras e líquidos conforme tolerância, evitar esforço e orientar higiene com água após evacuar. Avaliar sangramento ou dor intensa.','Inspecionar região anal com consentimento e avaliar volume de sangramento.'],
    'Hiperglicemia':['Verificar sinais de descompensação. Resultado acima de 500 mg/dL ou “HI”: atendimento imediato. Em seguimento estável, revisar uso de medicamentos e diário glicêmico.','Glicemia capilar no atendimento; glicemia de jejum na investigação e HbA1c para seguimento do diabetes diagnosticado.'],
    'Leucorreias':['Identificar o quadro antes de escolher o esquema: candidíase, vaginose, tricomoníase e cervicite têm tratamentos diferentes. Febre ou dor pélvica importante exige avaliar infecção ascendente.','Exame ginecológico; avaliar testes para IST. Se persistência ou dúvida diagnóstica, considerar exame a fresco ou Gram.'],
    'Mastalgia':['Sutiã de sustentação, compressa e correção da pega na lactação. Febre, nódulo, retração ou secreção papilar suspeita exigem avaliação dirigida.','Examinar as mamas. Distinguir investigação de alteração suspeita da mamografia de rastreamento, conforme idade e fluxo municipal.'],
    'Mordedura/acidente com animais':['Lavar imediatamente com água e sabão ou soro. Avaliar profilaxia de raiva e tétano, acionar vigilância quando indicado e notificar no SINAN.','Verificar espécie, características da exposição, ferida e histórico vacinal.'],
    'Odinofagia/síndrome gripal':['Hidratação, lavagem nasal com soro 0,9% e analgesia/antitérmico conforme idade. Dispneia, prostração intensa ou incapacidade de deglutir exige avaliação médica.','Examinar orofaringe, medir saturação, frequência respiratória e temperatura.'],
    'Otalgia':['Se confirmado cerume impactado e sem suspeita de perfuração, o protocolo orienta ceruminolítico por cinco dias e retorno para reavaliação/lavagem. Mastoidalgia ou suspeita de perfuração: avaliação médica.','Realizar otoscopia antes de indicar gotas ou lavagem.'],
    'Parasitoses intestinais':['Tratar conforme o agente identificado. O quadro inclui albendazol com duração diferente para cada parasitose e restrição na gestação. Orientar higiene das mãos, água e alimentos.','Parasitológico de fezes na investigação e amostra de controle após o tratamento.'],
    'Pirose':['Fracionar refeições e evitar deitar por duas horas após comer. O quadro inclui hidróxido de alumínio ou magnésio conforme perfil. Disfagia ou dor ao engolir: avaliação médica; persistência após 14 dias: reavaliar.','Investigar sinais de alarme e uso de anti-inflamatórios.'],
    'Problemas de pele':['Na pediculose, pente fino e permetrina 1%; na escabiose, a apresentação tópica é 5%. Confirmar diagnóstico, faixa etária e restrições antes do uso. Avaliar contatos. Infecção extensa ou necrose: avaliação médica.','Examinar distribuição, bordas, descamação e secreção.'],
    'Problemas oftalmológicos':['Irrigação com soro 0,9% na irritação leve ou suspeita de corpo estranho superficial. Perda visual súbita, trauma ou dor intensa exige avaliação médica imediata.','Avaliar visão, secreção, dor, trauma e exposição química.'],
    'Queimadura':['Proteger a lesão e orientar o curativo sem romper bolhas. Queimaduras graves, extensas, elétricas ou químicas exigem acionar SAMU e organizar transferência.','Avaliar extensão, profundidade, região atingida e agente causador.'],
    'Reação alérgica':['Na reação leve localizada, afastar o desencadeante; o quadro inclui loratadina conforme idade/peso. Na suspeita de anafilaxia, acionar imediatamente o atendimento de emergência.','Verificar PA, saturação, frequência respiratória e sinais de comprometimento de via aérea.'],
    'Sangramento genital':['Sangramento intenso, instabilidade, dor intensa ou suspeita de complicação gestacional: urgência/maternidade. Investigar a causa no seguimento.','Avaliar possibilidade de gestação e sinais vitais. No sangramento intermenstrual ou pós-coito, avaliar colo e indicação de citopatológico conforme fluxo, além da investigação diagnóstica.'],
    'Síndrome pé-mão-boca':['Ofertar líquidos e dieta fria ou pastosa. Analgesia e antitérmico conforme idade/peso. Recusa de líquidos, sonolência ou piora: reavaliar prontamente.','Avaliar hidratação, mucosa oral, lesões e aceitação de líquidos.'],
    'Sofrimento mental':['Acolher em ambiente seguro, estratificar risco e mobilizar rede de apoio. Ideação suicida com risco imediato, autoagressão ou desorganização grave exigem avaliação imediata da equipe.','Avaliar estado mental, risco atual, plano e suporte disponível.']
  };
  const rules=entries.map(([title,page,carePage,terms,care,kit])=>({title,page,carePage,rx:new RegExp('\\b(?:'+terms+')\\b'),care,kit,treatment:management[title]?.[0],assessment:management[title]?.[1]}));
  function positive(text){
    return norm(text).replace(/\b(?:nao (?:gestante|gravida)|sem gestacao)\b/g,'perfil obstetrico negativo').split(/[.;!?\n|]+|\s+(?:mas|porem)\s+|(?:,\s*|\s+e\s+)(?=(?:refere|apresenta|com)\b)/)
      .filter(part=>!(/\b(?:descartad[ao]s?|negad[ao]s?|ausentes?|resolvid[ao]s?)\b/.test(part)))
      .map(part=>part.split(/\b(?:nega|negou|sem|nao|ausencia de|historico de|antecedente de|mae com|pai com)\b/)[0]).filter(Boolean);
  }
  function match(text){const parts=positive(text);return rules.filter(rule=>parts.some(part=>rule.rx.test(part)));}
  const testMarkers=Object.entries({
    hiv2:'(?:duo-)?hiv(?:\\s*(?:tr)?\\s*2)|tr[- ]?2',
    hiv1:'(?:duo-)?hiv(?:\\s*(?:tr)?\\s*1)?|tr[- ]?1',
    hb:'hbsag|hepatite b|hepb',
    hc:'anti[- ]?hcv|hepatite c|hepc',
    syphilis:'sifilis|sif|vdrl|duo-sif'
  }).map(([id,marker])=>[id,new RegExp('\\b(?:'+marker+')(?:-res)?\\s*[:=-]?\\s*(nao reagente|reagente|positivo)\\b')]);
  function testResults(text){
    const result={};
    for(const clause of norm(text).split(/[|;,\n.!?]+|\s+e\s+/)){
      if(/\b(?:nega|historico|antecedente|sem)\b|(?:ist-)?tr-c-|\b(?:parceria|parceir[oa])\b/.test(clause))continue;
      for(const [id,pattern] of testMarkers){
        const match=clause.match(pattern);
        if(!match)continue;
        const value=match[1]==='nao reagente'?'negativo':'positivo';
        result[id]=result[id]&&result[id]!==value?'divergente':value;
      }
    }
    return result;
  }
  const analgesiaAdulto='Para dor ou febre, quando indicada após avaliação: paracetamol 500 mg VO a cada 8 horas por até 3 dias. Conferir hepatopatia, alergia e uso de outros produtos com paracetamol.';
  const quadros={
    'Cefaleia':[23,'Para adulto com mais de 35 kg, após aferir a PA e afastar alarme. '+analgesiaAdulto],
    'Cólica menstrual':[25,'Na dismenorreia habitual, após excluir gestação: butilbrometo de escopolamina simples 10 mg VO, a cada 8 horas por até 3 dias.'],
    'Dor abdominal':[45,analgesiaAdulto], 'Dor articular':[47,analgesiaAdulto], 'Dor lombar':[51,analgesiaAdulto],
    'Dor osteomuscular':[53,analgesiaAdulto],
    'Constipação':[29,'Após afastar obstrução e avaliar risco de aspiração, o quadro prevê óleo mineral, 1 colher de sopa à noite por até 3 dias. Reforçar líquidos e fibras.'],
    'Febre':[62,analgesiaAdulto], 'Hemorroida/doenças orificiais':[74,analgesiaAdulto],
    'Mastalgia':[82,analgesiaAdulto], 'Otalgia':[92,analgesiaAdulto], 'Queimadura':[107,analgesiaAdulto],
    'Síndrome pé-mão-boca':[115,analgesiaAdulto],
    'Diarreia e/ou náusea/vômito':[37,'Para náuseas ou vômitos em adulto: metoclopramida 10 mg VO a cada 8 horas por até 3 dias, se indicada. Avaliar hidratação, obstrução ou sangramento digestivo e antecedentes extrapiramidais.'],
    'Pirose':[98,'Hidróxido de alumínio 60 mg/mL, 10 mL VO a cada 8 horas por até 14 dias. Avaliar função renal, interações e sinais de alarme.'],
    'Odinofagia/síndrome gripal':[89,analgesiaAdulto],
    'Reação alérgica':[110,'Reação leve, sem acometimento respiratório ou circulatório: loratadina 10 mg VO uma vez ao dia por até 5 dias.'],
    'Herpes genital':[67,'Primeiro episódio: encaminhar para avaliação médica. Esquema de referência para o adulto: aciclovir 200 mg VO cinco vezes ao dia por 7 a 10 dias. Conferir função renal e imunossupressão.'],
    'Herpes zoster':[70,'Encaminhar para avaliação médica precoce. O quadro cita aciclovir 800 mg VO cinco vezes ao dia por 7 dias. Conferir função renal. Acometimento ocular, disseminação ou sinais neurológicos exigem urgência.'],
    'Parasitoses intestinais':[95,'Escolher pelo agente. O quadro prevê albendazol 400 mg VO em dose única para ascaridíase, enterobíase ou ancilostomíase; para giardíase, 400 mg VO uma vez ao dia por 5 dias.'],
    'Problemas oftalmológicos':[105,'Na irritação leve ou suspeita de corpo estranho superficial, lavagem ocular abundante com soro fisiológico 0,9%.']
  };
  const paginaMedicacao=title=>quadros[title]?.[0]||rules.find(r=>r.title===title)?.carePage;
  function medicacaoDemanda(title,text,c){
    if(!quadros[title]||c.pregnancyConflict||c.gestante==='Sim'||c.urgent||c.lactante==='Sim')return '';
    if(c.child){
      if(!Number.isFinite(c.idadeMeses)||c.idadeMeses<=6||c.idadeMeses>=144)return 'Conferir idade e peso no quadro de prescrição antes de selecionar uma opção para esta faixa etária.';
      if(['Cefaleia','Febre','Otalgia','Odinofagia/síndrome gripal'].includes(title))return 'Referência pediátrica para crianças acima de 6 meses até 11 anos, após avaliar gravidade: paracetamol gotas 200 mg/mL, 1 gota/kg/dose por via oral a cada 6 horas, por até 3 dias. '+(title==='Cefaleia'?'Máximo de 35 gotas por dose. ':'')+'Conferir idade, peso, equivalência do gotejador e limite da bula antes da prescrição.';
      return '';
    }
    if(title==='Diarreia e/ou náusea/vômito'&&!/nause|vomit/.test(text))return '';
    if(!c.adult||!(c.male||c.gestante==='Não'))return 'Informe a data de nascimento e confira a possibilidade de gestação para visualizar o esquema aplicável. O quadro de prescrição está disponível abaixo.';
    return quadros[title][1];
  }
  function specificCare(title,text,c){
    const adult=c.adult&&!c.child&&!c.urgent&&!c.pregnancyConflict&&(c.gestante==='Não'||c.male&&c.gestante!=='Sim');
    if(title==='Problemas de pele'){
      const lice=/pediculose|piolhos?/.test(text),scabies=/escabiose|sarna/.test(text);
      if(lice&&!scabies)return adult?'Pediculose confirmada: aplicar permetrina 1% no cabelo úmido por 10 minutos, passar pente fino e enxaguar. Repetir após sete dias se necessário. Avaliar contatos.':'Pediculose: pente fino e avaliação dos contatos. O quadro municipal indica permetrina 1% para maiores de dois anos; conferir idade e contraindicações.';
      if(scabies&&!lice)return adult?'Escabiose confirmada: permetrina 5% na pele, conforme distribuição indicada para a idade. O manejo descreve retirar após 8–12 horas e repetir em sete dias. Avaliar contatos e higienizar roupas e roupa de cama.':'Escabiose: avaliar contatos e roupas de uso pessoal. O protocolo diferencia aplicação e limites etários da permetrina 5%; conferir idade e situação obstétrica antes da prescrição.';
    }
    if(title==='Herpes labial'&&adult)return 'Recorrência localizada em adulto imunocompetente, sem alarme: o quadro cita aciclovir 200 mg VO, cinco vezes ao dia por cinco dias, omitindo a dose da noite. Conferir alergias e função renal. Febre, acometimento ocular ou incapacidade de ingerir líquidos: avaliação médica imediata.';
    return '';
  }
  function urinary(c){
    const source={title:'Saúde da Mulher · p. 35–36',url:mulher+'#page=37'};
    const base={title:'Queixa urinária / suspeita de ITU',kit:'itu',refs:[{title:'Demanda Espontânea · p. 40–42',url:demanda+'#page=40'}]};
    if(c.pregnancyConflict)return {...base,kit:null,priority:c.urgent?'Avaliação médica prioritária por sinal de alarme.':'',care:'Conferir gestação. A avaliação registra “Não” e também a condição “Gestante”. Corrija a informação para consultar o fluxo aplicável.'};
    if(c.child&&c.urgent)return {...base,priority:'Avaliação médica prioritária por sinal de alarme em paciente pediátrico.',exams:'Avaliar coleta de urina conforme o fluxo pediátrico; se gestante, EAS e urocultura com antibiograma.',care:'Priorizar avaliação médica e selecionar o tratamento conforme idade e quadro clínico.'};
    if(c.gestante==='Sim'){
      return {...base,title:'Queixa urinária na gestação',priority:c.urgent?'Avaliação médica prioritária por sinal de alarme.':'Atendimento prioritário na gestação. Investigar infecção alta.',
        exams:'EAS e urocultura com antibiograma. Colher a cultura antes do antibiótico quando possível, sem atrasar o atendimento.',
        care:c.urgent?'Febre, dor lombar ou comprometimento sistêmico exigem avaliação médica. Priorizar encaminhamento e tratamento.':'Disúria ou hematúria na gestação requer avaliação médica, mesmo sem febre. Para ITU confirmada, o quadro de pré-natal orienta selecionar o tratamento pela urocultura e antibiograma, considerando alergias, função renal e idade gestacional.',
        medication:c.urgent||c.child?'':!Number.isFinite(c.ig)?'Confirmar a idade gestacional para consultar as opções do quadro obstétrico.':c.lactante==='Sim'||c.ig>=36?'Para ITU confirmada e sensível: cefalexina 500 mg por via oral a cada 6 horas por 7 dias. Após 36 semanas, o quadro restringe a escolha à cefalexina.':'Na ITU confirmada e conforme sensibilidade: 1ª opção, nitrofurantoína 100 mg a cada 6 horas por 7 dias. 2ª, cefalexina 500 mg a cada 6 horas por 7 dias. 3ª, amoxicilina/clavulanato 500/125 mg a cada 8 horas por 7 dias, com as refeições. Encaminhar para avaliação médica se houver resistência às opções do quadro.',
        refs:[{title:'Pré-natal de Toledo · quadro 4, p. 24',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2022-08/protocolo_pre-natal_alteracao_2021_versao_final-2_pdf.pdf#page=24'},source,...base.refs]};
    }
    if(c.child)return {...base,priority:'Avaliar idade, estado geral, febre e sinais sistêmicos. Criança em idade escolar consta entre os critérios de prioridade.',
      exams:'A investigação depende da idade e do quadro. Avaliar coleta de urina conforme o fluxo pediátrico.',care:'Encaminhar para avaliação pediátrica conforme gravidade. A tabela de antibióticos para disúria se refere a adultos.'};
    if(c.urgent)return {...base,priority:'Avaliação médica prioritária. Investigar infecção alta ou complicação.',exams:'Avaliar EAS e urocultura com antibiograma conforme contexto. Os exames não devem atrasar o encaminhamento.',care:'Priorizar avaliação médica e definir tratamento conforme gravidade e cultura.'};
    if(c.gestante!=='Não'&&!c.male)return {...base,exams:'Verificar possibilidade de gestação. Se confirmada, o protocolo indica EAS e urocultura com antibiograma.',care:'Avaliar febre, dor lombar e fatores de complicação antes de definir tratamento.'};
    return {...base,treatment:c.scope==='mulher'&&c.adult&&!c.male&&c.gestante==='Não'&&c.lactante!=='Sim'&&c.ituSimples==='Sim'&&c.ituCultura==='Não'&&c.alerta==='Não'?'Na cistite simples confirmada, o quadro de disúria lista nitrofurantoína 100 mg VO a cada 6 horas por 7 dias. Verificar alergia, função renal e lactação antes de prescrever.':'',exams:'Avaliar EAS. A exceção é a mulher jovem não grávida com cistite típica e sem risco de resistência. Cultura em homens, recorrência, complicação ou risco de resistência. Em falha ou retorno rápido, cultura com antibiograma.',
      care:c.male?'Avaliar infecção complicada e encaminhar para definição terapêutica.':c.scope==='mulher'&&c.adult?'Na cistite simples de mulher adulta não gestante, confirmar critérios, alergias, lactação e contraindicações. O fluxo descreve nitrofurantoína ou sulfametoxazol + trimetoprima conforme avaliação e protocolo institucional. Encaminhar se houver piora ou persistência.':'Confirmar faixa etária, perfil e ausência de complicação. O esquema de cistite simples depende dessa avaliação.',refs:[...base.refs,source]};
  }
  return {rules,match,positive,norm,testResults,specificCare,medicacaoDemanda,paginaMedicacao,urinary,demanda,mulher};
});
