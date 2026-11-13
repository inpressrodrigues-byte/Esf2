/* Toledo, protocolo de pré-natal, quadro 4. Referências para revisão na consulta. */
(function(root,create){
  const api=create();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.QueixasGestacao=api;
})(globalThis,()=>{
  const fonte='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2022-08/protocolo_pre-natal_alteracao_2021_versao_final-2_pdf.pdf';
  const anvisa='https://www.gov.br/anvisa/pt-br/assuntos/fiscalizacao-e-monitoramento/cartas-aos-profissionais-de-saude/2020/vonau-r-ondansetrona-risco-de-malformacao-congenita-com-o-uso-da-ondansetrona-biolab-farmaceutica-ltda-15-de-maio-de-2020/@@download/file';
  const dipirona='https://www.novalgina.com.br/dam/jcr%3A339ea4bf-b9c1-43d1-9392-b86a1078e287/Bula%2520Novalgina%2520Solu%25C3%25A7%25C3%25A3o%2520Oral.pdf';
  const analgesia='Se a dor persistir após os cuidados e a avaliação afastar risco: paracetamol 500 mg a cada 6 horas, se dor. O quadro também cita dipirona 500 mg a cada 6 horas; a bula recomenda evitar no primeiro trimestre, exige avaliação médica no segundo e contraindica nos três últimos meses.';
  // Título da regra geral substituída, expressão sobre achados atuais, página e conduta.
  const regras=[
    ['Náuseas e vômitos','Diarreia e/ou náusea/vômito',/\b(?:nauseas?|vomitos?|hiperemese|enjoos?)\b/,23,
      'Avaliar hidratação, perda de peso e tolerância oral. Fracionar as refeições e evitar jejum e odores desencadeantes.',
      ig=>'Se as medidas iniciais falharem e os riscos forem afastados, escolher uma opção, 30 minutos antes das refeições. 1ª escolha: bromoprida 10 mg a cada 8 horas. 2ª escolha: metoclopramida 10 mg a cada 8 horas. '+(Number.isFinite(ig)&&ig>=14?'3ª escolha: ondansetrona 8 mg (2 comprimidos de 4 mg) a cada 8 horas.':'3ª escolha do quadro: ondansetrona. Evitar no primeiro trimestre; confirmar a idade gestacional antes de considerar esta opção.')+' Conferir alergias e antecedentes de reações extrapiramidais.'],
    ['Cefaleia','Cefaleia',/cefaleia|dor de cabeca/,22,'Aferir a PA e investigar pré-eclâmpsia. Repouso em local tranquilo e hidratação. Cefaleia recorrente requer avaliação médica.',analgesia],
    ['Tontura, desmaio ou fraqueza','',/tontura|desmaio|fraqueza/,22,'Avaliar PA, glicemia, anemia e estabilidade. Orientar decúbito lateral esquerdo, hidratação e mudanças lentas de posição. O quadro orienta cuidados sem prescrição farmacológica.'],
    ['Pirose ou azia','Pirose',/\b(?:pirose|azia)\b/,25,'Fracionar a alimentação, elevar a cabeceira e evitar deitar após comer. Investigar elevação pressórica associada.',
      'Persistência após os cuidados, com riscos afastados: hidróxido de alumínio, 10 a 15 mL após as refeições e ao deitar. Encaminhar se persistir.'],
    ['Dor abdominal ou cólicas','Dor abdominal',/dor abdominal|colicas?\b/,24,'Avaliar sangramento, febre, sinais peritoneais, ITU e contrações. Dor progressiva ou suspeita de parto prematuro exige avaliação obstétrica.',
      'Para cólica simples após afastar alarme: butilbrometo de escopolamina simples (Buscopan simples), 1 comprimido a cada 8 horas se cólica. Conferir apresentação; o quadro não especifica a concentração.'],
    ['Dor lombar ou pélvica','Dor lombar',/dor lombar|lombalgia|dor pelvica/,25,'Avaliar trauma, déficit neurológico, febre, disúria e contrações. Se mecânica, orientar postura, calor local e alongamento.',analgesia],
    ['Cãibras','',/c[ai]+m?bras?\b/,25,'Orientar massagem, calor local, alongamento orientado e revisão da alimentação. O quadro não indica medicamento para cãibras.'],
    ['Constipação ou flatulência','Constipação',/constipacao|flatulencia|prisao de ventre/,26,'Reforçar fibras, líquidos e rotina de evacuação. Avaliar distensão, dor e sinais de obstrução.',
      'Se persistir a constipação apesar dos cuidados e sem alarme: lactulose (Lactulona), 1 colher de sopa, até 3 vezes ao dia. O quadro também lista óleo mineral, mas orienta evitá-lo pelo efeito na absorção de vitaminas. Encaminhar se persistir.'],
    ['Hemorroidas','Hemorroida/doenças orificiais',/hemorroid/,27,'Avaliar dor, endurecimento e sangramento retal. Orientar fibras, líquidos, higiene e banho de assento morno.',
      'O protocolo admite supositório de glicerina se necessário, sem especificar dose ou frequência. Dor intensa, sangramento ou endurecimento requerem avaliação médica.'],
    ['Dispneia','Dispneia',/dispneia|falta de ar/,26,'Avaliar início, intensidade, sinais vitais e ausculta cardíaca e pulmonar. Com alterações, encaminhar para avaliação médica. O quadro não indica medicamento de rotina.'],
    ['Sinais de alerta obstétrico','Edema',/escotomas?|alterac(?:ao|oes) visua|dor epigastrica|hipocondrio direito|edema (?:de |em )?(?:face|maos)/,25,'Aferir e repetir PA, investigar pré-eclâmpsia e providenciar avaliação médica/obstétrica imediata.'],
    ['Perda de sangue ou líquido','Sangramento genital',/sangramento vaginal|perda de liquido|liquido amniotico/,42,'Avaliar sinais vitais, perda vaginal, movimentos fetais e BCF. Encaminhar para avaliação obstétrica imediata.'],
    ['Movimentos fetais reduzidos','',/diminuicao de mf|movimentos? fetais? (?:reduzid|diminuid|ausente)|(?:diminuicao|ausencia) (?:de |dos? )?movimentos? fetais?/,42,'Avaliação obstétrica imediata por redução ou ausência percebida de movimentos.'],
    ['Contrações antes de 37 semanas','',/contracoes antes de 37|parto prematuro/,39,'Avaliar dinâmica uterina e encaminhar à maternidade na suspeita de trabalho de parto prematuro.'],
    ['Perda de tampão mucoso','',/tampao mucoso/,42,'Conferir idade gestacional, contrações, sangramento, perda de líquido e movimentos fetais. Os sinais associados definem o encaminhamento. Sem indicação de medicação pelo achado isolado.']
  ];
  function avaliar(texto,ctx){
    const achados=regras.filter(([, ,rx])=>rx.test(texto));
    const alarme=ctx.alarme||achados.some(([titulo])=>['Sinais de alerta obstétrico','Perda de sangue ou líquido','Movimentos fetais reduzidos','Contrações antes de 37 semanas'].includes(titulo))||
      /hiperemese|desidratacao|perda de peso|vomitos? (?:continuos?|persistentes?|incoerciveis?|intensos?)|incapacidade de ingerir|nao (?:tolera|consegue ingerir)|(?:cefaleia|dor abdominal|dispneia) (?:intensa|subita)|febre|deficit neurologico|convulsao|sincope atual/.test(texto)||
      /(?:disuria|\bitu\b)/.test(texto)&&/dor lombar/.test(texto);
    const cobertas=new Set(achados.map(r=>r[1]).filter(Boolean));
    if(/diarreia/.test(texto))cobertas.delete('Diarreia e/ou náusea/vômito');
    const items=achados.map(([titulo,,rx,pagina,care,med])=>{
      const refs=[{title:'Pré-natal de Toledo · p. '+pagina,url:fonte+'#page='+pagina}];
      if(med&&!alarme){
        if(pagina===23)refs.push({title:'Anvisa · ondansetrona na gravidez',url:anvisa});
        if(med===analgesia)refs.push({title:'Bula · dipirona na gestação',url:dipirona});
      }
      return {title:titulo+' na gestação',care,medication:alarme?'':typeof med==='function'?med(ctx.ig):med,
        priority:alarme?'Sinal de alerta: priorizar avaliação médica/obstétrica antes do tratamento sintomático.':'',refs};
    });
    return {items,cobertas,alarme};
  }
  return {avaliar};
});
