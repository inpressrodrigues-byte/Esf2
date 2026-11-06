/* Kits revisáveis. Fonte e condição acompanham cada item; sugestão não é solicitação. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExamesRegras=api;})(typeof window==='undefined'?globalThis:window,()=>{
  'use strict';
  const sources={pn:{name:'Pré-natal Toledo, 4ª edição (2021)',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2022-08/protocolo_pre-natal_alteracao_2021_versao_final-2_pdf.pdf'},smu:{name:'Saúde da Mulher Toledo (2026)',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-09/protocolo_municipal_de_enf_cuidado_em_saude_da_mulher_2026.pdf'},dm:{name:'Fluxograma municipal de diabetes na gestação',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2022-08/fluxograma_diabetes_na_gestacao_1-1.pdf'}};
  const ref=(key,page)=>({...sources[key],page,url:sources[key].url+'#page='+(key==='smu'?page+2:page)});
  const catalog={
    hemograma:['Hemograma completo','Sangue'],abo:['Tipagem sanguínea ABO e fator Rh','Sangue'],coombs:['Coombs indireto (TIA)','Sangue'],eletro:['Eletroforese de hemoglobina — Teste da Mãezinha','Sangue'],glicose:['Glicemia de jejum','Sangue'],totg:['TOTG 75 g — jejum, 1 h e 2 h','Sangue'],toxo:['Toxoplasmose IgG e IgM','Sangue'],avidez:['Avidez de IgG para toxoplasmose','Sangue'],tsh:['TSH','Sangue'],vdrl:['VDRL quantitativo','Sangue'],beta:['β-hCG','Sangue'],tig:['Teste imunológico de gravidez (TIG)','Testes / outros'],hiv:['Teste rápido HIV','Testes / outros'],sifilis:['Teste rápido sífilis','Testes / outros'],hbsag:['Teste rápido hepatite B (HBsAg)','Testes / outros'],hcv:['Teste rápido hepatite C (anti-HCV)','Testes / outros'],eas:['Urina tipo I (EAS)','Urina'],cultura:['Urocultura','Urina'],atb:['Antibiograma, conforme isolamento na urocultura','Urina'],epf:['Parasitológico de fezes','Testes / outros'],gbs:['Pesquisa de Streptococcus do grupo B — swab','Testes / outros'],cito:['Citopatológico do colo uterino, se rastreamento indicado','Testes / outros'],fresco:['Exame a fresco da secreção vaginal','Testes / outros'],gram:['Gram da secreção vaginal','Testes / outros'],us1:['USG obstétrica do 1º trimestre — TN e osso nasal','Imagem'],us2:['USG obstétrica morfológica e avaliação do colo uterino','Imagem'],us3:['USG obstétrica do 3º trimestre','Imagem'],usData:['USG endovaginal para datação, DUM desconhecida','Imagem'],usDiu:['USG transvaginal — análise de controle de DIU','Imagem'],usDm:['USG obstétrica para acompanhamento do diabetes','Imagem'],doppler:['Doppler de artérias uterinas e umbilicais','Imagem'],eco:['Ecocardiograma fetal','Imagem'],ctg:['Cardiotocografia','Testes / outros']
  };
  const kits=[{id:'pn1',name:'Pré-natal — 1º trimestre / abertura'},{id:'pn2',name:'Pré-natal — 2º trimestre'},{id:'pn3',name:'Pré-natal — 3º trimestre'},{id:'itu',name:'Suspeita de ITU / queixas urinárias'},{id:'gestacao',name:'Investigação de gestação'},{id:'corrimento',name:'Corrimento — dúvida diagnóstica / persistência'},{id:'contracepcao',name:'Anticoncepção — exames quando indicados'},{id:'diu',name:'DIU — avaliação e controle de posição'},{id:'sifilis',name:'Sífilis reagente — VDRL / seguimento'},{id:'dmgest',name:'Diabetes na gestação — cuidado compartilhado'}];
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function suggests(text,ctx={}){
    const clauses=norm(text).split(/[.;!?\n]+/).map(s=>s.split(/\b(?:nega|sem|nao|historico|antecedente|orientad\w*)\b/)[0]);
    const found=[];if(ctx.gestante==='Sim'&&Number.isFinite(ctx.ig))found.push(ctx.ig<14?'pn1':ctx.ig<28?'pn2':'pn3');
    if(clauses.some(s=>/\b(itu|disuria|polaciuria|urgencia urinaria)\b|ardor ao urinar|infeccao urinaria|queixa urinaria/.test(s)))found.push('itu');
    if(clauses.some(s=>/corrimento|leucorreia/.test(s)))found.push('corrimento');
    if(clauses.some(s=>/atraso menstrual|suspeita de (gravidez|gestacao)/.test(s)))found.push('gestacao');
    return [...new Set(found)];
  }
  function build(id,c={}){
    const items=[],notes=[],pending=[],pn=id.startsWith('pn'),ig=Number.isFinite(c.ig)&&c.ig>=0&&c.ig<=43?c.ig:null;
    const source=pn?ref('pn',29):ref('smu',id==='itu'?36:id==='corrimento'?15:id==='sifilis'?19:58);
    const add=(exam,when='',eligible=true,selected=eligible,src=source)=>{const [name,group]=catalog[exam];items.push({id:exam,name,group,when,eligible,selected:selected&&eligible,source:src});};
    const woman=c.scope==='mulher'||c.gestante==='Sim';
    if((pn||id==='dmgest')&&c.gestante!=='Sim')pending.push('Confirmar gestação antes de usar este kit de pré-natal.');
    if(pn&&ig===null)pending.push('Registrar idade gestacional para definir janelas e datas.');
    if(!pn&&!['dmgest','itu'].includes(id)&&!woman)pending.push('Este kit utiliza o protocolo Saúde da Mulher. Para outro público, registrar solicitação individual conforme protocolo aplicável.');
    if(c.alerta==='Sim')notes.push('Sinais de alerta: priorizar avaliação/encaminhamento. Não aguardar exames ambulatoriais para conduzir urgência.');
    const tests=()=>['hiv','sifilis','hbsag','hcv'].forEach(k=>add(k,'Ofertar/realizar conforme fluxo de testagem; conferir exames já feitos neste trimestre.'));
    const imaging=(exam,start,end,text)=>add(exam,text+(ig!==null&&ig<start?' Programar para a janela indicada.':''),ig!==null&&ig<=end,ig!==null&&ig<=end,ref('pn',30));
    if(pn){
      notes.push('Revisar resultados prévios e marcar “Já realizado” para evitar duplicação. Exames de diagnóstico/seguimento têm regras próprias.');
      add('hemograma','Rotina do trimestre.');add('eas','Rotina do trimestre.');add('cultura','Rotina do trimestre; registrar agente e tratamento se positivo.');tests();
      add('glicose',c.diabetes==='Sim'?'Diabetes já diagnosticado: não pedir novo rastreamento por glicemia/TOTG.':c.diabetes!=='Não'?'Confirmar se há diabetes diagnosticado antes do rastreamento.':'Rastreamento conforme tabela do trimestre; conferir resultados prévios.',c.diabetes==='Não',c.diabetes==='Não',c.diabetes==='Sim'?ref('dm',1):ref('pn',29));
      add('toxo',c.toxo==='imune'?'Imunidade documentada: não repetir automaticamente; imunodeficiência exige avaliação individual.':c.toxo==='alterada'?'Resultado reagente/indeterminado: seguir investigação específica, sem repetição de rotina.':id==='pn1'?'Triagem inicial IgG e IgM, se ainda não realizada.':'Repetir no início do trimestre se suscetível; se não há resultado prévio, avaliar triagem inicial.',!['imune','alterada'].includes(c.toxo)&&(id==='pn1'||['suscetivel','semresultado'].includes(c.toxo)),true,ref('pn',35));
      add('coombs',c.rh!=='negativo'?'Somente se Rh negativo; conferir tipagem.':c.coombs==='positivo'?'Coombs positivo: referenciar alto risco; não repetir automaticamente.':id==='pn1'?'Rh negativo: triagem inicial.':'Rh negativo e Coombs negativo: mensal a partir de 24 semanas.',c.rh==='negativo'&&c.coombs!=='positivo'&&(id==='pn1'||c.coombs==='negativo'&&ig>=24),true,ref('pn',29));
      add('vdrl','Seguimento após teste reagente; na gestação, controle mensal. Não substitui avaliação e tratamento.',c.sifilis==='Sim',c.sifilis==='Sim',ref('pn',29));
      if(id==='pn1'){
        ['abo','eletro','tsh','epf'].forEach(k=>add(k,'Abertura do pré-natal; conferir se já realizado.'));
        imaging('us1',11,13+6/7,'Realizar entre 11s0d e 13s6d. Informar IG e data-alvo na solicitação.');
        add('usData','Tabela p. 30: via endovaginal para DUM desconhecida no 1º trimestre.',c.dumDesconhecida==='Sim'&&ig!==null&&ig<14,true,ref('pn',30));
        notes.push('A tabela (p. 30) e o fluxograma (p. 49) divergem quanto à via da USG do 1º trimestre. O pedido de TN/ON não fixa a via; confirmar com o serviço. Não duplicar USG de datação e rastreamento sem indicação.');
      }
      if(id==='pn2'){
        add('totg',c.diabetes==='Sim'?'Não realizar após diagnóstico de diabetes.':c.totg==='Sim'?'TOTG já realizado: conferir resultado, não repetir.':'Realizar entre 24 e 28 semanas; fora dessa janela, revisar conduta individual.',c.diabetes==='Não'&&c.totg==='Não'&&ig!==null&&ig<=28,true,ref('pn',29));
        imaging('us2',20,24,'Preferencialmente entre 20 e 24 semanas; incluir avaliação do colo.');
        add('cito','Somente se rastreamento indicado/pendente; não coletar por trimestre isoladamente.',c.cito==='Sim',c.cito==='Sim',ref('smu',58));
      }
      if(id==='pn3'){
        imaging('us3',35,37,'Preferencialmente entre 35 e 37 semanas.');
        add('gbs','Coleta entre 35 e 37 semanas; fora da janela, avaliar oportunidade individual.',ig!==null&&ig<=37,true,ref('pn',30));
      }
      add('avidez','IgM e IgG reagentes/indeterminados e IG inferior a 16 semanas; investigar/encaminhar conforme fluxo.',c.toxo==='alterada'&&ig!==null&&ig<16,false,ref('pn',30));
    }else if(id==='itu'){
      if(!['Sim','Não'].includes(c.alerta))pending.push('Avaliar sinais de alarme antes de preparar o pedido para queixa urinária.');
      if(c.gestante==='Sim'){
        ['eas','cultura','atb'].forEach(k=>add(k,'Suspeita de ITU na gestação. Urocultura antes do antibiótico, quando possível; não atrasar atendimento/tratamento.'));
      }else{
        const src={name:'Demanda Espontânea Toledo 2026, seção 5.9',page:41,url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-06/protocolo_avaliacao_e_manejo_da_demanda_espontanea_aps_2026.pdf#page=41'};
        if(!['mulher','adulto'].includes(c.scope))pending.push('Para criança ou público não definido: avaliação específica; não aplicar kit adulto.');
        if(!['Sim','Não'].includes(c.ituSimples))pending.push('Avaliar se é a exceção de cistite clássica em mulher jovem não grávida sem risco de resistência.');
        if(!['Sim','Não','falha'].includes(c.ituCultura))pending.push('Avaliar critérios para urocultura: homem, recorrência, complicação, resistência ou falha.');
        if(c.ituSimples==='Sim'&&c.ituCultura!=='Não')pending.push('Rever contexto: a exceção de cistite simples sem risco conflita com os critérios de cultura selecionados.');
        add('eas',c.ituSimples==='Sim'?'Exceção do protocolo: pode dispensar EAS em cistite clássica de mulher jovem não grávida sem risco de resistência.':'Análise clínica inicial da queixa urinária, fora da exceção de cistite clássica.',c.ituSimples==='Não',true,src);
        const culture=['Sim','falha'].includes(c.ituCultura);add('cultura','Indicada em homens, recorrência, complicação, risco de resistência ou falha/retorno rápido dos sintomas.',culture,true,src);
        add('atb','Falha de tratamento/retorno rápido: cultura com antibiograma; conferir isolamento e coleta.',c.ituCultura==='falha',true,src);
        if(c.ituCultura==='falha')notes.push('Em falha/retorno rápido, o protocolo orienta conferir coleta da cultura 48–72 h após término do antibiótico. Sinais de alarme exigem avaliação imediata, sem aguardar essa janela.');
      }
      if(!['Sim','Não'].includes(c.gestante))pending.push('Avaliar possibilidade de gestação; se houver suspeita, usar também o kit de investigação.');
      notes.push('Febre, dor lombar e sinais sistêmicos exigem avaliação médica. Este kit não inclui antibiótico nem imagem de rotina para toda queixa urinária.');
    }else if(id==='gestacao'){
      add('tig','Investigação quando houver suspeita/atraso menstrual. Escolher método conforme avaliação e acesso.',c.gestante!=='Sim',true,ref('smu',45));
      add('beta','Alternativa ou complemento ao TIG quando necessário; não solicitar ambos automaticamente.',c.gestante!=='Sim',false,ref('smu',45));
    }else if(id==='corrimento'){
      add('fresco','Considerar na dúvida diagnóstica ou persistência. Escolher exame a fresco OU Gram.',c.duvida==='Sim',true,ref('smu',15));
      add('gram','Alternativa ao exame a fresco, conforme avaliação e disponibilidade.',c.duvida==='Sim',false,ref('smu',15));
      notes.push('Achados clínicos não implicam todos os exames. Avaliar testagem de IST conforme risco.');
    }else if(id==='contracepcao'){
      add('tig','Somente se indicado para investigação de gestação; não é obrigatório para todo início.',c.gestante!=='Sim',false);
      add('beta','Alternativa ao TIG se necessário.',c.gestante!=='Sim',false);
      add('cito','Conforme faixa etária, histórico e rastreamento pendente.',c.cito==='Sim',false);
      ['hiv','sifilis','hbsag','hcv'].forEach(k=>add(k,'Ofertar conforme avaliação, risco e testes prévios.',true,false));
      notes.push('Não há um painel de sangue obrigatório para toda escolha de anticoncepcional. Selecionar e justificar os exames indicados.');
    }else if(id==='diu')add('usDiu','Antes/após inserção e anualmente conforme seção 4.4; especificar etapa e indicação no pedido.',true,true,ref('smu',59));
    else if(id==='sifilis')add('vdrl','Teste reagente documentado: avaliar título e seguimento; mensal na gestação.',c.sifilis==='Sim',true,ref('smu',19));
    else if(id==='dmgest'){
      if(c.diabetes!=='Sim'||c.compartilhado!=='Sim')pending.push('Confirmar diagnóstico de diabetes e plano de cuidado compartilhado antes de solicitar os exames especializados.');
      if(ig===null)pending.push('Registrar idade gestacional.');
      const src=ref('dm',2);add('usDm','Acompanhamento mensal a partir de 24 semanas, conforme fluxo e plano individual.',ig!==null&&ig>=24,true,src);
      add('doppler','Artérias uterinas e umbilicais na 26ª semana; revisar exames anteriores.',ig!==null&&ig<=26,false,src);
      add('eco','Entre 26 e 28 semanas; programar conforme acesso e plano compartilhado.',ig!==null&&ig<=28,true,src);
      add('ctg','Semanal a partir de 34 semanas, conforme serviço responsável.',ig!==null&&ig>=34,false,src);
      notes.push('Não solicitar TOTG nem glicemia de jejum para novo rastreamento após o diagnóstico. Monitorização glicêmica e tratamento seguem o plano compartilhado.');
    }
    const windows={us1:[11,13+6/7],us2:[20,24],us3:[35,37],totg:[24,28],gbs:[35,37],doppler:[26,26],eco:[26,28]};
    for(const item of items)if(windows[item.id])item.window=windows[item.id];
    if(pending.length)items.forEach(i=>{i.eligible=false;i.selected=false;});
    return {id,name:kits.find(k=>k.id===id)?.name||'Kit',items,notes,pending};
  }
  return {catalog,kits,sources,build,suggests};
});
