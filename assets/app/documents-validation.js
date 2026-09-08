// Documentos de diabetes gestacional — Protocolo de Pré-Natal de Toledo, páginas 69 a 72.
async function carregarPdfLibPN(){
  if(window.PDFLib?.PDFDocument)return;
  for(const src of ['pdf-lib.min.js','https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js']){
    try{
      await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
      if(window.PDFLib?.PDFDocument)return;
    }catch(e){}
  }
  throw new Error('O gerador de PDF não foi carregado.');
}
function dadosDocumentoGlicemiaPN(){
  const hoje=new Date().toISOString().slice(0,10),data=document.getElementById('pna-data')?.value||hoje;
  return{nome:(document.getElementById('pna-nome')?.value||'').trim(),data:typeof formatarDataBR==='function'?formatarDataBR(data):data.split('-').reverse().join('/')};
}
function pnPdfSafe(texto){
  return String(texto||'').replace(/\u00a0/g,' ').replace(/[–—]/g,'-').replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/[•●]/g,'-').replace(/→/g,'-').replace(/\s+/g,' ').trim();
}
function pnPdfLinhas(texto,font,size,maxWidth){
  const palavras=pnPdfSafe(texto).split(' ').filter(Boolean),linhas=[];let linha='';
  palavras.forEach(p=>{const teste=linha?`${linha} ${p}`:p;if(font.widthOfTextAtSize(teste,size)<=maxWidth)linha=teste;else{if(linha)linhas.push(linha);linha=p}});
  if(linha)linhas.push(linha);return linhas;
}
function pnPdfFonteAjustada(texto,font,maxWidth,max=12,min=7){
  let size=max;while(size>min&&font.widthOfTextAtSize(pnPdfSafe(texto),size)>maxWidth)size-=.25;return size;
}
function pnPdfTextoQuebrado(page,texto,{x,y,width,font,size=10,leading=size+3,color,maxLines=100}){
  const linhas=pnPdfLinhas(texto,font,size,width).slice(0,maxLines);
  linhas.forEach((linha,i)=>page.drawText(linha,{x,y:y-i*leading,size,font,color}));
  return y-linhas.length*leading;
}
async function baixarPdfPN(pdf,nome){
  const bytes=await pdf.save(),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');
  a.href=url;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);
}
function desenharSolicitacaoGlicosimetroPN(pdf,regular,bold,black,d){
  const page=pdf.addPage([595.28,841.89]);
  page.drawText('SOLICITAÇÃO DE GLICOSÍMETRO E TIRAS DE HGT',{x:67,y:785,size:15,font:bold,color:black});
  const linhaNome=`NOME DA PACIENTE: ${pnPdfSafe(d.nome).toUpperCase()}`;
  page.drawText(linhaNome,{x:55,y:730,size:pnPdfFonteAjustada(linhaNome,bold,485,12,8),font:bold,color:black});
  page.drawText('SOLICITO:',{x:55,y:665,size:13,font:bold,color:black});
  page.drawText('1. GLICOSÍMETRO',{x:55,y:620,size:13,font:regular,color:black});
  page.drawText('01 un',{x:475,y:620,size:13,font:regular,color:black});
  page.drawText('2. TIRAS DE HGT',{x:55,y:580,size:13,font:regular,color:black});
  page.drawText('120 un',{x:470,y:580,size:13,font:regular,color:black});
  page.drawText('**REALIZAR CONTROLE GLICÊMICO 4X/DIA.',{x:55,y:535,size:12.5,font:regular,color:black});
  page.drawText('CIAP: W85',{x:55,y:475,size:12.5,font:regular,color:black});
  page.drawText('CID: O24.9',{x:55,y:440,size:12.5,font:regular,color:black});
  page.drawLine({start:{x:165,y:185},end:{x:430,y:185},thickness:.8,color:black});
  page.drawText('ASSINATURA E CARIMBO',{x:210,y:165,size:11.5,font:bold,color:black});
  page.drawText(`DATA: ${d.data}`,{x:400,y:95,size:11.5,font:bold,color:black});
  return page;
}
function desenharControleGlicemiaPN(pdf,regular,bold,cor,d){
  const page=pdf.addPage([595.28,841.89]);
  page.drawText('MODELO DE CONTROLE DE HGT EM GESTANTES',{x:124,y:812,size:13.5,font:bold,color:cor});
  page.drawText('FAZER CONTROLE DA GLICEMIA CAPILAR (HGT) 4 VEZES AO DIA',{x:91,y:786,size:10.2,font:bold,color:cor});
  page.drawText('JEJUM, 1 HORA APÓS CAFÉ DA MANHÃ, ALMOÇO E JANTAR',{x:111,y:767,size:9.5,font:regular,color:cor});
  page.drawText('VALORES-ALVO: JEJUM <= 95 mg/dL | 1 HORA APÓS COMER <= 140 mg/dL',{x:91,y:748,size:9.2,font:bold,color:cor});
  const linhaNome=`NOME DA GESTANTE: ${pnPdfSafe(d.nome).toUpperCase()}`;
  page.drawText(linhaNome,{x:42,y:713,size:pnPdfFonteAjustada(linhaNome,bold,350,10,7),font:bold,color:cor});
  page.drawText(`DATA DE ENTREGA: ${d.data}`,{x:410,y:713,size:8.5,font:regular,color:cor});
  const xs=[42,106,211,326,441,553],top=687,headerH=29,rowH=18.2,rows=31,bottom=top-headerH-rows*rowH;
  page.drawRectangle({x:xs[0],y:top-headerH,width:xs[xs.length-1]-xs[0],height:headerH,color:PDFLib.rgb(.92,.95,.98)});
  xs.forEach(x=>page.drawLine({start:{x,y:top},end:{x,y:bottom},thickness:.75,color:cor}));
  for(let i=0;i<=rows+1;i++){const yLinha=i===0?top:top-headerH-(i-1)*rowH;page.drawLine({start:{x:xs[0],y:yLinha},end:{x:xs[xs.length-1],y:yLinha},thickness:.75,color:cor})}
  [['DATA',54],['JEJUM',136],['1h PÓS CAFÉ',229],['1h PÓS ALMOÇO',340],['1h PÓS JANTA',458]].forEach(([texto,x])=>page.drawText(texto,{x,y:top-19,size:7.6,font:bold,color:cor}));
  for(let i=0;i<rows;i++)page.drawText(String(i+1).padStart(2,'0'),{x:66,y:top-headerH-i*rowH-12.5,size:7,font:regular,color:PDFLib.rgb(.35,.4,.48)});
  page.drawText('Anotar os valores diariamente e levar esta folha em todas as consultas.',{x:124,y:57,size:8.5,font:bold,color:cor});
  return page;
}
async function gerarSolicitacaoGlicosimetroPN(){
  if(!exigirPermissao('gerar_documentos'))return;
  const d=dadosDocumentoGlicemiaPN(),status=document.getElementById('pna-dmg-doc-status');
  if(!d.nome){showToast('Informe o nome da gestante antes de gerar a solicitação.');document.getElementById('pna-nome')?.focus();return}
  try{
    if(status)status.textContent='Gerando solicitação...';
    await carregarPdfLibPN();
    const {PDFDocument,StandardFonts,rgb}=PDFLib,pdf=await PDFDocument.create();
    const regular=await pdf.embedFont(StandardFonts.TimesRoman),bold=await pdf.embedFont(StandardFonts.TimesRomanBold),black=rgb(0,0,0);
    desenharSolicitacaoGlicosimetroPN(pdf,regular,bold,black,d);
    await baixarPdfPN(pdf,`solicitacao-glicosimetro-${rotuloId(d.nome)||'gestante'}.pdf`);
    if(status)status.textContent='Solicitação gerada com os itens fixos do protocolo.';
    showToast('Solicitação de glicosímetro gerada.');
  }catch(e){console.error(e);if(status)status.textContent='Não foi possível gerar a solicitação.';showToast('Não foi possível gerar a solicitação.')}
}
function desenharOrientacoesDiabetesPN(page,regular,bold,cor){
  const colunaW=247,topo=790,leading=11.4,size=8.7;
  const secao=(x,y,titulo,corpo)=>{
    page.drawText(pnPdfSafe(titulo).toUpperCase(),{x,y,size:9.3,font:bold,color:cor});y-=14;
    for(const trecho of corpo){y=pnPdfTextoQuebrado(page,trecho,{x,y,width:colunaW,font:regular,size,leading,color:cor});y-=5}
    return y-3;
  };
  page.drawText('ORIENTAÇÕES PARA DIABETES GESTACIONAL',{x:128,y:820,size:14,font:bold,color:cor});
  page.drawLine({start:{x:42,y:808},end:{x:553,y:808},thickness:1,color:cor});
  let y=topo;
  y=secao(42,y,'Tenho diabetes gestacional, e agora?',[
    'A diabetes é uma doença que aumenta o açúcar, que chamamos de glicose, no sangue. O sangue da mãe com muita glicose passa para o bebê pela placenta. Aumentam as chances de complicações na gestação quando você não tem conhecimento ou controle.'
  ]);
  y=secao(42,y,'O que pode acontecer comigo?',[
    'Infecção de urina; pressão alta; parto prematuro; maior risco de hemorragia pós-parto; maior risco de diabetes no futuro; morte materna.'
  ]);
  y=secao(42,y,'E com o bebê?',[
    'Peso maior que 4 kg, dificuldades no parto e fraturas; problemas na respiração; hipoglicemia; icterícia; morte.'
  ]);
  y=secao(42,y,'O que tenho que fazer?',[
    'Manter valores de glicemia normais. Anotar os valores e levar em todas as consultas.',
    'Fazer 3 refeições principais (café da manhã, almoço e jantar) e 2 a 3 lanches: um no meio da manhã, um no meio da tarde e um antes de se deitar.'
  ]);
  y=secao(42,y,'Seguir uma alimentação saudável',[
    'Tente não ficar muito tempo sem comer.'
  ]);
  y=secao(42,y,'Atividade física',[
    'A atividade física diminui a glicose do sangue e deve ser realizada por 30 minutos, 4 a 5 vezes por semana, quando liberada pela equipe. Exemplos: caminhada, hidroginástica, pilates, yoga e natação.'
  ]);
  y=secao(42,y,'Controle da glicemia',[
    'O controle da glicose é feito com um aparelho, chamado glicosímetro, na lateral dos dedos das mãos.',
    'Inicialmente, medir 4 vezes ao dia: em jejum e 1 hora após iniciar o café da manhã, o almoço e o jantar. Anotar no diário e levar às consultas de pré-natal, nutrição e endocrinologia.',
    'Metas: jejum <= 95 mg/dL; 1 hora após o início da refeição <= 140 mg/dL; 2 horas após o início da refeição <= 120 mg/dL.'
  ]);
  secao(42,y,'Como medir sua glicemia',[
    '1. Lavar as mãos ou passar álcool 70%. Secar bem.',
    '2. Furar a lateral do dedo.',
    '3. Preencher todo o espaço da fita com a gota de sangue.',
    '4. Descartar lancetas e fitas em frasco plástico rígido vazio.',
    '5. Anotar o valor da glicemia no diário.',
    '6. Fazer o rodízio dos dedos.'
  ]);
  y=topo;
  y=secao(306,y,'O que você deve comer ao dia?',[
    '1. Verduras e legumes à vontade.',
    '2. Uma porção de feijões ou oleaginosas.',
    '3. Duas porções de carne ou ovos.',
    '4. Uma porção de óleos ou gorduras.',
    '5. Três porções de legumes de raiz.',
    '6. Três porções de frutas.',
    '7. Três porções de leite ou derivados.',
    '8. Cinco porções de carboidratos.'
  ]);
  y=secao(306,y,'Preferir e evitar',[
    'Prefira alimentos integrais. Evite sucos de frutas, mesmo naturais sem açúcar, refrigerantes e todos os tipos de doces. Se precisar adoçar, prefira adoçante de estévia.'
  ]);
  y=secao(306,y,'Atenção aos avisos do aparelho',[
    'HI pode indicar glicemia acima de 600 mg/dL e LO pode indicar glicemia abaixo de 10 mg/dL; os valores podem variar conforme a marca.',
    'ATENÇÃO: se isso acontecer, procure imediatamente atendimento médico.'
  ]);
  y=secao(306,y,'Orientações gerais',[
    'Não pular refeições.',
    'Avaliar o controle glicêmico 1 hora após a primeira garfada da refeição.',
    'Não tomar medicamento quando em jejum para controle do HGT.',
    'Atividade física preferível: caminhadas diárias, quando liberadas.',
    'Se usa insulina, aguardar 10 segundos após a aplicação para retirar a agulha.',
    'Fazer diário alimentar uma semana antes da consulta com nutricionista.',
    'Sempre levar a folha de controle glicêmico às consultas médicas e de nutrição.'
  ]);
  secao(306,y,'Lembretes importantes',[
    'Siga as orientações e faça todos os exames solicitados no pré-natal.',
    'Se a glicemia não controlar com dieta e atividade física, você pode precisar de medicamentos como insulina, conforme avaliação e prescrição profissional.'
  ]);
  page.drawText('Base: Protocolo de Assistência de Enfermagem ao Pré-Natal de Toledo, 4ª edição, páginas 69 a 72.',{x:42,y:35,size:6.8,font:regular,color:cor});
}
async function gerarControleGlicemiaPN(){
  if(!exigirPermissao('gerar_documentos'))return;
  const d=dadosDocumentoGlicemiaPN(),status=document.getElementById('pna-dmg-doc-status');
  if(!d.nome){showToast('Informe o nome da gestante antes de gerar o controle.');document.getElementById('pna-nome')?.focus();return}
  try{
    if(status)status.textContent='Gerando controle glicêmico e orientações...';
    await carregarPdfLibPN();
    const {PDFDocument,StandardFonts,rgb}=PDFLib,pdf=await PDFDocument.create(),regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),cor=rgb(.03,.09,.19);
    desenharControleGlicemiaPN(pdf,regular,bold,cor,d);
    const orient=pdf.addPage([595.28,841.89]);desenharOrientacoesDiabetesPN(orient,regular,bold,cor);
    await baixarPdfPN(pdf,`controle-glicemico-orientacoes-${rotuloId(d.nome)||'gestante'}.pdf`);
    if(status)status.textContent='Controle glicêmico gerado: frente com diário mensal e verso com orientações.';
    showToast('Controle glicêmico e orientações gerados.');
  }catch(e){console.error(e);if(status)status.textContent='Não foi possível gerar o controle glicêmico.';showToast('Não foi possível gerar o controle glicêmico.')}
}
async function gerarPacoteDiabetesGestacionalPN(){
  if(!exigirPermissao('gerar_documentos'))return;
  const d=dadosDocumentoGlicemiaPN(),status=document.getElementById('pna-dmg-doc-status');
  if(!d.nome){showToast('Informe o nome da gestante antes de gerar os documentos.');document.getElementById('pna-nome')?.focus();return}
  try{
    if(status)status.textContent='Gerando solicitação, controle mensal e orientações...';
    await carregarPdfLibPN();
    const {PDFDocument,StandardFonts,rgb}=PDFLib,pdf=await PDFDocument.create();
    const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),cor=rgb(.03,.09,.19);
    desenharSolicitacaoGlicosimetroPN(pdf,regular,bold,rgb(0,0,0),d);
    desenharControleGlicemiaPN(pdf,regular,bold,cor,d);
    const orient=pdf.addPage([595.28,841.89]);desenharOrientacoesDiabetesPN(orient,regular,bold,cor);
    await baixarPdfPN(pdf,`documentos-diabetes-gestacional-${rotuloId(d.nome)||'gestante'}.pdf`);
    if(status)status.textContent='Documentos completos gerados: solicitação, controle mensal em A4 e orientações.';
    showToast('Documentos completos para diabetes gestacional gerados.');
  }catch(e){console.error(e);if(status)status.textContent='Não foi possível gerar os documentos completos.';showToast('Não foi possível gerar os documentos completos.')}
}

/* ══ CAMADA PROFISSIONAL — SOAP, VALIDAÇÃO, IA E LGPD ═══════════
   Esta camada preserva o sistema existente e corrige pontos críticos:
   - avisos clínicos sem bloquear a ação do profissional;
   - pré-natal com resumo municipal mais completo;
   - busca ativa com responsável e prazo;
   - IA SOAP sem chave no navegador e sem dados sensíveis;
   - auditoria técnica/admin sem dados reais. */
(function(){
  const PRO=window.__ESF_PRO_20260622__||(window.__ESF_PRO_20260622__={});
  if(PRO.instalado)return;
  PRO.instalado=true;
  PRO.orig={
    gerarSoapAutomatoPna:window.gerarSoapAutomatoPna,
    gerarSoapAutomatoPnc:window.gerarSoapAutomatoPnc,
    validarEntradaPreSoap:window.validarEntradaPreSoap,
    renderPendenciasSoap:window.renderPendenciasSoap,
    alertasBuscaAtiva:window.alertasBuscaAtiva,
    renderBuscaAtiva:window.renderBuscaAtiva,
    salvarConfigAISoap:window.salvarConfigAISoap,
    lerFormAISoap:window.lerFormAISoap,
    preencherAdminAISoap:window.preencherAdminAISoap,
    gerarSoapPorIA:window.gerarSoapPorIA,
    dadosConsultaAISoap:window.dadosConsultaAISoap,
    montarDadosConsultaParaIA:window.montarDadosConsultaParaIA,
    aplicarPermissoesInterface:window.aplicarPermissoesInterface
  };

  function clean(v){return String(v??'').replace(/\s+/g,' ').trim()}
  function cleanLong(v){return String(v??'').replace(/\r/g,'').split('\n').map(x=>clean(x)).filter(Boolean).join('\n')}
  function norm(v){try{return normalizarTextoProtocolo(String(v||''))}catch(e){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}}
  function safeValue(v){
    v=clean(v);
    if(!v)return '';
    if(/dado fict[ií]cio|paciente teste|ana teste|teste-\d+|placeholder|nome,\s*dose|undefined|null/i.test(v))return '';
    return v;
  }
  function valAny(ids){
    for(const id of ids){const v=safeValue(val(id));if(v)return v}
    return '';
  }
  function add(arr,txt){txt=cleanLong(txt);if(txt&&!arr.includes(txt))arr.push(txt)}
  function line(label,value,suffix=''){value=safeValue(value);return value?`${label}: ${value}${suffix}`:''}
  function todayISO(){return ESFClinical.localDate()}
  function formatDate(v){try{return formatarDataBR(v)}catch(e){return v}}
  function parseNumber(v){const m=String(v||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):NaN}
  function paParts(v){const m=String(v||'').match(/(\d{2,3})\D+(\d{2,3})/);return m?{sis:Number(m[1]),dia:Number(m[2])}:null}
  function paElevada(v){const p=paParts(v);return p&&(p.sis>=140||p.dia>=90)}
  function paMuitoAlta(v){const p=paParts(v);return p&&(p.sis>=160||p.dia>=110)}
  function selectedLabels(selector){return Array.from(document.querySelectorAll(selector)).filter(e=>e.checked).map(e=>clean(e.closest('label')?.textContent||e.value)).filter(Boolean)}
  function prefixPageEl(prefix){
    const id={pna:'pg-pn-abertura',pnc:'pg-pn-consulta',pu:'pg-puericultura',prev:'pg-preventivo',id:'pg-idoso',sm:'pg-saude-mental',ist:'pg-ist'}[prefix];
    return document.getElementById(id)||document.querySelector('.pg.on');
  }
  function valuesInPage(prefix){
    const p=prefixPageEl(prefix);if(!p)return '';
    return Array.from(p.querySelectorAll('input,select,textarea')).map(e=>{
      if(e.type==='checkbox'||e.type==='radio')return e.checked?clean(e.closest('label')?.textContent||e.value):'';
      return clean(e.value);
    }).filter(Boolean).join(' | ');
  }
  function simpleRiskLabel(r){
    const label=clean(r?.label||'');
    if(label)return label.replace(/^[\s\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]+/u,'');
    return '';
  }
  function riskCriteria(r){
    const c=Array.isArray(r?.criterios)?r.criterios:[];
    return c.map(x=>clean(x.motivo||x.label||x.texto||'')).filter(Boolean);
  }
  function gps(prefix){
    const g=valAny([`${prefix}-g`]),p=valAny([`${prefix}-p`]),a=valAny([`${prefix}-a`]);
    return (g||p||a)?`G${g||0} P${p||0} A${a||0}`:'';
  }
  function isG1P0A0(prefix){return String(valAny([`${prefix}-g`])||'0')==='1'&&String(valAny([`${prefix}-p`])||'0')==='0'&&String(valAny([`${prefix}-a`])||'0')==='0'}
  function futureRN(prefix){return valAny([`${prefix}-rn-nome`,`${prefix}-nome-rn`,`${prefix}-futuro-rn`,`${prefix}-bebe-nome`,`${prefix}-bebê-nome`])}
  function pnDesc(prefix,nome){
    const rn=futureRN(prefix);
    if(rn)return `PRÉ-NATAL: ${rn}`;
    return 'PRÉ-NATAL';
  }
  function pnResumo(prefix,risco){
    const out=[];
    add(out,line('G/P/A',gps(prefix)));
    add(out,line('IG',valAny([`${prefix}-ig`,`${prefix}-ig-semanas`])));
    add(out,line('DPP',valAny([`${prefix}-dpp`])));
    add(out,line('Classificação de risco',simpleRiskLabel(risco)||valAny([`${prefix}-risco`])));
    add(out,line('Tipo sanguíneo',valAny([`${prefix}-tipo-sang`,`${prefix}-tipo-sanguineo`,`${prefix}-abo-rh`,`${prefix}-rh`])));
    add(out,line('Toxoplasmose',valAny([`${prefix}-toxo`,`${prefix}-toxoplasmose`])));
    add(out,line('Gestação planejada',valAny([`${prefix}-planejada`])));
    add(out,line('Aceitação da gestação',valAny([`${prefix}-aceitacao`,`${prefix}-aceita`])));
    add(out,line('Medicações em uso',safeValue(limparValorClinicoParaSoap?.(valAny([`${prefix}-med`,`${prefix}-medicamentos`]),'medicamento',valAny([`${prefix}-nome`]))||valAny([`${prefix}-med`,`${prefix}-medicamentos`]))));
    const tri1=valAny([`${prefix}-exames-1tri`,`${prefix}-tri1`,`${prefix}-primeiro-tri`]);
    const tri2=valAny([`${prefix}-exames-2tri`,`${prefix}-tri2`,`${prefix}-segundo-tri`]);
    const tri3=valAny([`${prefix}-exames-3tri`,`${prefix}-tri3`,`${prefix}-terceiro-tri`]);
    if(tri1||tri2||tri3){
      add(out,'Exames relevantes:');
      add(out,tri1?`1º trimestre: ${tri1}.`:'');
      add(out,tri2?`2º trimestre: ${tri2}.`:'');
      add(out,tri3?`3º trimestre: ${tri3}.`:'');
    }
    const usg=valAny([`${prefix}-usg`,`${prefix}-ultrassom`]),morf=valAny([`${prefix}-usg-morf`,`${prefix}-morfologica`]),eco=valAny([`${prefix}-eco-fetal`]);
    if(usg||morf||eco){
      add(out,'Ultrassonografias:');
      add(out,usg?`USG: ${usg}.`:'');
      add(out,morf?`USG morfológica: ${morf}.`:'');
      add(out,eco?`Ecocardiograma fetal: ${eco}.`:'');
    }
    add(out,line('Preventivo',safeValue(limparValorClinicoParaSoap?.(valAny([`${prefix}-prev`,`${prefix}-preventivo`]),'geral',valAny([`${prefix}-nome`]))||valAny([`${prefix}-prev`,`${prefix}-preventivo`]))));
    add(out,line('Streptococcus B',valAny([`${prefix}-strep`,`${prefix}-strepto`,`${prefix}-streptococcus`])));
    add(out,line('Odontologia',valAny([`${prefix}-odonto`])));
    let vac='';
    try{vac=resumoVacinalSoap(prefix)}catch(e){}
    add(out,line('Vacinas',safeValue(valAny([`${prefix}-vac-ref`]))||vac));
    add(out,line('Pré-natal do parceiro',valAny([`${prefix}-pnparc`,`${prefix}-parceiro-pn`])));
    return out.length?`RESUMO PRÉ-NATAL\n\n${out.join('\n')}`:'';
  }
  function testsPna(){
    try{return resumoTestesRapidosPna()}catch(e){return {realizados:[],pendentes:[],texto:'',conduta:''}}
  }
  function testsText(tr){
    const out=[];
    if(tr?.realizados?.length)add(out,`Testes rápidos realizados:\n${tr.realizados.map(x=>`- ${x}`).join('\n')}`);
    if(tr?.pendentes?.length)add(out,`Testes rápidos pendentes: ${tr.pendentes.join(', ')}.`);
    return out.join('\n');
  }
  function pnManual(prefix){
    try{return manualSoapPartes(prefix)}catch(e){return {s:'',o:'',a:'',p:''}}
  }
  function hasAlarmText(prefix){
    return /(sangramento|perda de liquido|perda de líquido|dor abdominal intensa|dor forte|cefaleia persistente|alteracoes visuais|alterações visuais|dor epigastrica|dor epigástrica|dispneia|febre|redu[cç][aã]o.*movimentos fetais|ausencia.*movimentos fetais)/i.test(ESFClinical.positiveText(valuesInPage(prefix)));
  }
  function edemaImportante(prefix){
    return /edema\s*(\+\+\+|importante|face|m[aã]os|s[uú]bito)/i.test(valuesInPage(prefix));
  }
  function pnSifilisReagente(prefix){
    const t=ESFClinical.positiveText(valuesInPage(prefix));
    return /(s[ií]filis|vdrl)[^|;\n]{0,80}(reagente|positivo)|(?:reagente|positivo)[^|;\n]{0,80}(s[ií]filis|vdrl)/i.test(t);
  }
  function pnTestsPending(prefix){
    const tr=prefix==='pna'?testsPna():null;
    if(tr?.pendentes?.length)return tr.pendentes;
    const t=valuesInPage(prefix);
    const pend=[];
    ['HIV','Sífilis','Hepatite B','Hepatite C'].forEach(x=>{if(!new RegExp(x.replace('í','i'),'i').test(t))pend.push(x)});
    return pend;
  }
  function pnValidation(prefix){
    const risco=prefix==='pna'&&typeof avaliarProtocolosPna==='function'?avaliarProtocolosPna():null;
    const out=[];
    const dum=valAny([`${prefix}-dum`]),ig=valAny([`${prefix}-ig`]),dpp=valAny([`${prefix}-dpp`]);
    if(!dum||!ig||!dpp)add(out,'DUM, IG e DPP devem estar preenchidas e coerentes.');
    if(valAny([`${prefix}-pa`])&&paElevada(valAny([`${prefix}-pa`])))add(out,paMuitoAlta(valAny([`${prefix}-pa`]))?'PA em faixa grave: avaliar atendimento imediato/encaminhamento conforme protocolo.':'PA elevada: repetir aferição e avaliar conduta conforme protocolo.');
    if(hasAlarmText(prefix))add(out,'Sinal de alarme obstétrico registrado: revisar conduta/encaminhamento conforme protocolo.');
    if(edemaImportante(prefix))add(out,'Edema importante/súbito registrado: revisar risco e sinais de pré-eclâmpsia.');
    if(pnSifilisReagente(prefix))add(out,'Sífilis reagente: ativar fluxo de sífilis na gestação, parceria, seguimento e SINAN.');
    const pend=pnTestsPending(prefix);if(pend.length)add(out,`Testes rápidos pendentes ou sem registro: ${pend.join(', ')}.`);
    if(!VAC_RESULTADOS?.[prefix]&&!valAny([`${prefix}-vac-ref`]))add(out,'Histórico vacinal não confirmado.');
    const crit=riskCriteria(risco);if((simpleRiskLabel(risco)||valAny([`${prefix}-risco`]))&&!crit.length&&prefix==='pna')add(out,'Classificação de risco sem critério explícito preenchido.');
    const igSem=parseNumber(ig);
    if(igSem>=20&&!valAny([`${prefix}-au`]))add(out,'Altura uterina não registrada para IG em que geralmente é aplicável.');
    if(igSem>=20&&!valAny([`${prefix}-bcf`]))add(out,'BCF não registrado para IG em que geralmente é aplicável.');
    if(!valAny([`${prefix}-retorno`]))add(out,'Retorno programado não preenchido.');
    return out;
  }
  function moduleValidation(prefix){
    const out=[];
    if(prefix==='pna'||prefix==='pnc')return pnValidation(prefix);
    if(prefix==='pu'){
      if(!valAny(['pu-idade','pu-idade-cron','pu-nasc']))add(out,'Idade da criança não registrada.');
      if(!valAny(['pu-peso']))add(out,'Peso não registrado.');
      if(!valAny(['pu-alt']))add(out,'Comprimento/estatura não registrado.');
      if(!valAny(['pu-pc','pu-per-cef']))add(out,'Perímetro cefálico não registrado, se aplicável.');
      if(!VAC_RESULTADOS?.pu&&!valAny(['pu-vac-ref']))add(out,'Vacinação não avaliada/registrada.');
      if(!valAny(['pu-alim']))add(out,'Alimentação não registrada.');
      if(!valAny(['pu-dnpm-class','pu-dnpm-obs'])&&!selectedLabels('.dnpm-marco').length)add(out,'DNPM não avaliado. Marco vazio deve ser tratado como não avaliado, não como ausente.');
      if(/adequado/i.test(soapTextoModulo?.('pu')||'')&&!selectedLabels('.dnpm-marco').length)add(out,'Evitar escrever DNPM adequado quando os marcos não foram avaliados.');
    }
    if(prefix==='prev'){
      const t=valuesInPage(prefix)+' '+(soapTextoModulo?.('prev')||'');
      if(/corrimento|sangramento|les[aã]o|[uú]lcera|verruga|dor p[eé]lvica|n[oó]dulo/i.test(t)&&/sem altera[cç][oõ]es|normal/i.test(t))add(out,'Há queixa/achado ginecológico alterado junto com texto de normalidade. Revisar antes de copiar.');
      if(!/rastreamento|queixa ginecol[oó]gica|coleta|adiad/i.test(t))add(out,'Diferenciar rastreamento de rotina de atendimento por queixa ginecológica.');
      if(!/resultado|retorno/i.test(t))add(out,'Orientar retorno para resultado do citopatológico.');
    }
    if(prefix==='id'){
      const t=valuesInPage(prefix)+' '+(soapTextoModulo?.('id')||'');
      if(!/avd/i.test(t))add(out,'AVD não registrada.');
      if(!/aivd/i.test(t))add(out,'AIVD não registrada.');
      if(!/queda/i.test(t))add(out,'Quedas/risco de queda não avaliados.');
      if(!/mem[oó]ria|cogni/i.test(t))add(out,'Memória/cognição não avaliadas.');
      if(!/humor|tristeza|anedonia/i.test(t))add(out,'Humor não avaliado.');
      if(!/rede de apoio|cuidador|famil/i.test(t))add(out,'Rede de apoio/cuidador não registrados.');
      if(!/ivcf/i.test(t))add(out,'IVCF-20 não registrado.');
      const n=parseNumber(valAny(['id-num-meds']));if(/polifarm/i.test(t)&&Number.isFinite(n)&&n<5)add(out,'Polifarmácia só deve ser confirmada com 5 ou mais medicamentos.');
    }
    if(prefix==='sm'){
      const t=valuesInPage(prefix)+' '+(soapTextoModulo?.('sm')||'');
      ['exame do estado mental','ideação suicida','plano','meio','intenção','tentativa prévia','rede de apoio','fatores de proteção'].forEach(x=>{if(!new RegExp(norm(x),'i').test(norm(t)))add(out,`${x} não registrado/avaliado.`)});
      if(/risco/i.test(t)&&!/crit[eé]rio|pontua[cç][aã]o|ersm/i.test(t))add(out,'Classificação de risco em saúde mental sem critério.');
      if(/ideacao|suicid|plano/i.test(norm(t))&&!/plano de seguran/i.test(norm(t)))add(out,'Risco suicida exige plano de segurança quando indicado.');
      if(/caps ad/i.test(t)&&!/[aá]lcool|droga|subst[aâ]ncia|abstin/i.test(t))add(out,'Não citar CAPS AD sem álcool/drogas ou abstinência/intoxicação.');
      if(/caps i/i.test(t)&&!/crian[cç]a|adolesc|menor de 18/i.test(t))add(out,'Não citar CAPS i para adulto.');
    }
    if(prefix==='ist'){
      const t=valuesInPage(prefix)+' '+(soapTextoModulo?.('ist')||'');
      ['queixa','sintoma','exame','teste','resultado','parceria','retorno'].forEach(x=>{if(!new RegExp(x,'i').test(t))add(out,`${x} não registrado.`)});
      if(!/suspeita|diagn[oó]stico confirmado/i.test(t))add(out,'Diferenciar suspeita clínica de diagnóstico confirmado.');
      if(/reagente|viol[eê]ncia|s[ií]filis|hiv|hepatite/i.test(t)&&!/sinan|notifica/i.test(t))add(out,'Avaliar SINAN/notificação conforme agravo e fluxo municipal.');
    }
    return out;
  }
  function renderClinicalBox(prefix){
    document.getElementById(`clinical-validation-${prefix}`)?.remove();
    if(typeof window.validarAntesDeGerar==='function'){const r=window.validarAntesDeGerar(prefix,'revisar');return [...r.erros,...r.avisos,...r.pendencias].map(x=>x.msg);}
    return [];
  }

  window.validarEntradaPreSoap=function(prefix){
    const base=PRO.orig.validarEntradaPreSoap?.(prefix)||[];
    return [...new Set([...base,...moduleValidation(prefix)])];
  };
  window.renderPendenciasSoap=function(prefix){
    const r=PRO.orig.renderPendenciasSoap?.(prefix);
    renderClinicalBox(prefix);
    return r;
  };

  function setSOAP(prefix,desc,resumo,s,o,a,p){
    const ids=SOAP_IDS_MODULO[prefix]||{};
    const els={s:document.getElementById(ids.s),o:document.getElementById(ids.o),a:document.getElementById(ids.a),p:document.getElementById(ids.p)};
    if(!els.s||!els.o||!els.a||!els.p)return false;
    const lead=['DESCRIÇÃO DA CONSULTA',desc,resumo].filter(Boolean).join('\n\n');
    els.s.value=[lead,'S:',formatarLinhasSemiNarrativasSoap?.(s)||s].filter(Boolean).join('\n');
    els.o.value=['O:',formatarLinhasSemiNarrativasSoap?.(o)||o].filter(Boolean).join('\n');
    els.a.value=['A:',formatarLinhasSemiNarrativasSoap?.(a)||a].filter(Boolean).join('\n');
    els.p.value=['P:',formatarLinhasSemiNarrativasSoap?.(p)||p].filter(Boolean).join('\n');
    try{aplicarModoSoap(prefix)}catch(e){}
    try{renderPendenciasSoap(prefix)}catch(e){}
    try{renderAlertasVermelhosSoap(prefix)}catch(e){}
    try{renderInconsistenciasSoap(prefix)}catch(e){}
    try{atualizarIndicadorPreenchimento()}catch(e){}
    return true;
  }

  function prepararSinanSifilis(prefix){
    try{
      if(typeof sinanSet!=='function')return;
      sinanMontarCatalogoFichas();
      const gestante=prefix==='pna'||prefix==='pnc';
      sinanSet('sinan-ficha-modelo',gestante?'sifilis-gestante':'sifilis-adquirida');
      sinanSet('sinan-agravo',gestante?'Sífilis em gestante':'Sífilis adquirida');
      sinanSet('sinan-data-notif',todayISO());
      sinanSet('sinan-primeiros-sintomas',valAny([`${prefix}-data-sintomas`]));
      sinanSet('sinan-data-diagnostico',valAny([`${prefix}-data-diagnostico`]));
      ['nome','cpf','cns','nasc','idade','sexo','mae','telefone','cep','logradouro','numero','bairro'].forEach(k=>sinanSet(`sinan-${k}`,valAny([`${prefix}-${k}`,`pac-${k}`])));
      const semanas=parseNumber(valAny([`${prefix}-ig`]));
      sinanSet('sinan-gestante',gestante?(Number.isFinite(semanas)?semanas<14?'1':semanas<28?'2':'3':'4'):'5');
      if(typeof sinanSincronizarAgravo==='function')sinanSincronizarAgravo();
      if(typeof sinanSalvarRascunho==='function')sinanSalvarRascunho();
      showToast('Rascunho SINAN preparado conforme o contexto. Revise ficha, datas e dados complementares antes de imprimir.');
    }catch(e){console.warn('Falha ao preparar SINAN sífilis:',e)}
  }
  // Exposto no escopo global para a IIFE de auditoria (validarPN) conseguir chamar.
  window.prepararSinanSifilis = prepararSinanSifilis;

  function gerarSoapPN(prefix){
    const nome=valAny([`${prefix}-nome`]);
    const idade=valAny([`${prefix}-idade`]);
    const risco=prefix==='pna'&&typeof avaliarProtocolosPna==='function'?avaliarProtocolosPna():null;
    const tr=prefix==='pna'?testsPna():{realizados:[],pendentes:[],texto:'',conduta:''};
    const manual=pnManual(prefix);
    if(prefix==='pnc')callAIExames(prefix);
    const lab=EXAMES_PADRAO?.[prefix];
    const queixas=valAny([`${prefix}-queixas`,`${prefix}-queixa`]);
    const queixasMarcadas=selectedLabels(`#${prefix}-queixas-clin input, #${prefix}-queixas-gin input`);
    const comorb=selectedLabels(`#${prefix}-comorbidades-list input`).join('; ');
    const fam=selectedLabels(`#${prefix}-familiares-list input`).join('; ');
    const s=[];
    if(prefix==='pna')add(s,`Gestante${nome?` ${nome}`:''}${idade?`, ${idade} anos`:''}, comparece à UBS para abertura de pré-natal${valAny([`${prefix}-acomp`])?`, ${valAny([`${prefix}-acomp`]).toLowerCase()}`:''}.`);
    else add(s,`Gestante${nome?` ${nome}`:''}${idade?`, ${idade} anos`:''}, comparece à UBS para consulta de pré-natal.`);
    add(s,gps(prefix)?`Antecedentes obstétricos registrados: ${gps(prefix)}.`:'');
    if(!isG1P0A0(prefix))add(s,line('Intervalo interpartal',valAny([`${prefix}-iip`])));
    add(s,line('Gestação planejada',valAny([`${prefix}-planejada`])));
    add(s,line('Aceitação da gestação',valAny([`${prefix}-aceitacao`,`${prefix}-aceita`])));
    if(queixas)add(s,`Relato registrado: ${queixas}.`);
    if(queixasMarcadas.length)add(s,`Queixas/sinais referidos ou selecionados: ${queixasMarcadas.join('; ')}.`);
    add(s,line('Antecedentes/comorbidades registrados',comorb));
    add(s,line('Antecedentes familiares relevantes',fam));
    add(s,line('Medicamentos em uso',limparValorClinicoParaSoap?.(valAny([`${prefix}-med`,`${prefix}-medicamentos`]),'medicamento',nome)||valAny([`${prefix}-med`,`${prefix}-medicamentos`])));
    add(s,line('Alergias medicamentosas',limparValorClinicoParaSoap?.(valAny([`${prefix}-alergia`,`${prefix}-alergias`]),'geral',nome)||valAny([`${prefix}-alergia`,`${prefix}-alergias`])));
    add(s,line('Tabagismo',valAny([`${prefix}-tab`])));
    add(s,line('Álcool/drogas',valAny([`${prefix}-alc`])));
    add(s,line('Violência doméstica',valAny([`${prefix}-viol`])));
    add(s,line('Último preventivo/citopatológico',limparValorClinicoParaSoap?.(valAny([`${prefix}-prev`]),'geral',nome)||valAny([`${prefix}-prev`])));
    add(s,line('Situação vacinal referida',limparValorClinicoParaSoap?.(valAny([`${prefix}-vac-ref`]),'vacina',nome)||valAny([`${prefix}-vac-ref`])));
    add(s,manual.s);

    const o=[];
    const medidas=[
      line('PA',valAny([`${prefix}-pa`]),' mmHg'),
      line('FC',valAny([`${prefix}-fc`]),' bpm'),
      line('Temperatura',valAny([`${prefix}-temp`]),' °C'),
      line('Peso',valAny([`${prefix}-peso`]),' kg'),
      pnaResumoImc?.()&&prefix==='pna'?pnaResumoImc():line('IMC',valAny([`${prefix}-imc`]),' kg/m²'),
      line('Altura uterina',valAny([`${prefix}-au`]),' cm'),
      line('BCF',valAny([`${prefix}-bcf`]),' bpm'),
      line('Edema',valAny([`${prefix}-edema`]))
    ].filter(Boolean);
    if(medidas.length)add(o,medidas.join('\n'));
    add(o,line('DUM',valAny([`${prefix}-dum`])?formatDate(valAny([`${prefix}-dum`])):''));
    add(o,line('DUM confiável',valAny([`${prefix}-dum-conf`])));
    add(o,line('IG pela DUM/registro',valAny([`${prefix}-ig`,`${prefix}-ig-semanas`])));
    add(o,line('DPP pela DUM/registro',valAny([`${prefix}-dpp`])));
    add(o,line('Movimentos fetais',valAny([`${prefix}-mf`])));
    add(o,line('Apresentação fetal',valAny([`${prefix}-apres`])));
    add(o,line('Estado geral',valAny([`${prefix}-eg`])));
    add(o,line('Mucosas',valAny([`${prefix}-muc`])));
    const guia=typeof textoGuiaClinico==='function'?textoGuiaClinico(prefix):{};
    add(o,guia?.exame?`Exame físico guiado registrado:\n${guia.exame}`:'');
    add(o,manual.o);
    add(o,testsText(tr));

    const a=[];
    add(a,`${prefix==='pna'?'Abertura de pré-natal':'Pré-natal em seguimento'} na APS.`);
    if(valAny([`${prefix}-ig`,`${prefix}-dpp`]))add(a,`Idade gestacional e DPP registradas conforme dados preenchidos.`);
    if(pnSifilisReagente(prefix))add(a,'ALERTA: teste rápido/sorologia para sífilis reagente. Necessário ativar fluxo de sífilis na gestação.');
    if(valAny([`${prefix}-pa`])&&paElevada(valAny([`${prefix}-pa`])))add(a,paMuitoAlta(valAny([`${prefix}-pa`]))?'ALERTA: PA em faixa grave registrada.':'ALERTA: PA elevada registrada.');
    if(edemaImportante(prefix))add(a,'ALERTA: edema importante/súbito registrado.');
    if(hasAlarmText(prefix))add(a,'ALERTA: sinais de alarme obstétrico registrados.');
    const rLabel=simpleRiskLabel(risco)||valAny([`${prefix}-risco`]);
    const crit=riskCriteria(risco);
    if(rLabel)add(a,`Classificação de risco: ${rLabel}.`);
    if(crit.length)add(a,`Critérios registrados: ${crit.join('; ')}.`);
    else if(rLabel)add(a,'Critérios de risco devem ser revisados/confirmados no formulário.');
    add(a,manual.a);

    if(lab?.classificados?.length){add(o,'Resultados laboratoriais registrados:');lab.classificados.forEach(x=>add(o,x.texto));}
    if(lab?.riscos?.length)add(a,'Avaliação dos exames: '+lab.riscos.join('; '));
    const p=[];
    if(lab?.condutas?.length)add(p,'Condutas sugeridas a partir dos exames — revisar e confirmar:\n'+lab.condutas.filter(x=>!x.startsWith('Fonte: http')).join('\n'));
    if(lab?.condutas?.some(x=>x.startsWith('Fonte: http')))add(p,'Referência: fluxogramas municipais de tireoide, 2024, página 1; links disponíveis no painel de exames.');
    add(p,`${prefix==='pna'?'Realizada abertura de pré-natal':'Realizada consulta de pré-natal'} e mantido acompanhamento pela APS.`);
    if(rLabel&&!/habitual/i.test(rLabel))add(p,'Indicado cuidado compartilhado conforme estratificação de risco e fluxo municipal.');
    // Conduta de risco/profilaxia de pré-eclâmpsia (AAS + cálcio) — restaura o comportamento
    // da versão original gerarSoapAutomatoPna, perdido na reescrita genérica.
    if(prefix==='pna'&&risco){
      const peAlto=['has','peprev','nefro','dm','geme'].some(k=>document.querySelector(`#pna-comorbidades-list input[data-comorb="${k}"]`)?.checked);
      const condutaRisco=risco.conduta||'';
      add(p,condutaRisco);
      if(peAlto)add(p,'Avaliar prevenção de pré-eclâmpsia conforme critérios clínicos, protocolo municipal e prescrição médica, quando indicada.');
    }
    const dmReconhecido=!!lab?.classificados?.some(x=>/diabetes mellitus gestacional|diabetes manifesto/i.test(x.texto));
    const planoExames=pnaPlanoExamesSoap?.(parseNumber(valAny([`${prefix}-ig`])))||'Solicitar ou conferir exames de rotina conforme protocolo municipal.';
    add(p,dmReconhecido?'DM/DMG reconhecido na interpretação: não repetir glicemia de jejum/TOTG para rastreamento após diagnóstico. Seguir o plano de monitoramento e confirmar os demais exames individualmente.':planoExames);
    if(pnSifilisReagente(prefix)){
      add(p,'Diante de sífilis reagente, ativar fluxo protocolar de sífilis na gestação, realizar aconselhamento pós-teste, registrar tratamento/seguimento, avaliar/tratar parceria sexual e verificar notificação/SINAN conforme fluxo municipal.');
      prepararSinanSifilis(prefix);
    }
    add(p,pnaPlanoVacinalSoap?.(parseNumber(valAny([`${prefix}-ig`])))||'Conferir carteira vacinal e atualizar conforme calendário vigente.');
    add(p,line('Odontologia',valAny([`${prefix}-odonto`])));
    add(p,line('Pré-natal do parceiro',valAny([`${prefix}-pnparc`])));
    add(p,'Orientação sugerida sobre sinais de alerta na gestação: sangramento vaginal, perda de líquido, dor abdominal intensa, cefaleia persistente, alterações visuais, dor epigástrica/HCD, febre, dispneia e redução ou ausência de movimentos fetais.');
    add(p,'Orientação sugerida sobre alimentação, hidratação, suplementação conforme rotina/protocolo, prevenção de IST, aleitamento materno, retorno programado e importância do comparecimento às consultas.');
    add(p,line('Retorno programado',valAny([`${prefix}-retorno`])));
    add(p,tr?.conduta);
    add(p,manual.p);
    add(p,`Base protocolar: ${SOAP_BASE_PROTOCOLAR[prefix]||SOAP_BASE_PROTOCOLAR.pna}`);
    const profissional=valAny([`${prefix}-prof`,`${prefix}-profissional`])||CURRENT_USER_PROFILE?.nome;
    if(profissional)add(p,`Profissional responsável: ${profissional}${CURRENT_USER_PROFILE?.conselho?' — '+CURRENT_USER_PROFILE.conselho:''}.`);

    setSOAP(prefix,pnDesc(prefix,nome),pnResumo(prefix,risco),s.join('\n\n'),o.join('\n\n'),a.join('\n\n'),p.join('\n\n'));
    return true;
  }
  window.gerarSoapAutomatoPna=function(){gerarSoapPN('pna');mudarParaAbaSoap('[onclick*="pna-6"]','pna-6');showToast('SOAP de abertura de pré-natal gerado com validação clínica.')}
  window.gerarSoapAutomatoPnc=function(){gerarSoapPN('pnc');mudarParaAbaSoap('[onclick*="pnc-6"]','pnc-6');showToast('SOAP de consulta de pré-natal gerado com validação clínica.')}

  function prazoPrioridade(pri){
    const d=new Date();if(pri==='alta')d.setDate(d.getDate()+1);else if(pri==='media')d.setDate(d.getDate()+7);else d.setDate(d.getDate()+30);
    return d.toISOString().slice(0,10);
  }
  function responsavelAlerta(a){
    const txt=norm([a.linha,a.motivo,a.acao].join(' '));
    if(/sinan|notifica|ist|sifilis|hiv|hepatite/.test(txt))return 'Enfermagem / Vigilância';
    if(/visita|acs|busca|territorio|faltoso/.test(txt))return 'ACS responsável';
    if(/vacina|pni/.test(txt))return 'Sala de vacina / Enfermagem';
    return 'Enfermagem';
  }
  window.alertasBuscaAtiva=function(){
    const base=(PRO.orig.alertasBuscaAtiva?.()||[]).map(a=>({...a,responsavel:a.responsavel||responsavelAlerta(a),dataLimite:a.dataLimite||prazoPrioridade(a.prioridade)}));
    const existe=new Set(base.map(a=>a.id));
    const add=(p,linha,motivo,prioridade,acao,ref)=>{
      const id=[p.cpf,linha,motivo].join('|');if(existe.has(id))return;existe.add(id);
      base.push({id,cpf:p.cpf,nome:p.nome||'Paciente sem nome',microarea:p.microarea||'',linha,motivo,prioridade,acao,ultimo:ref?.data||p.ultima?.data||'',status:'pendente',responsavel:responsavelAlerta({linha,motivo,acao}),dataLimite:prazoPrioridade(prioridade)});
    };
    try{
      dadosGestao().forEach(p=>{
        p.consultas.forEach(a=>{
          const txt=norm([a.soap,...Object.values(a.dados||{}).map(v=>typeof v==='object'?v.value||'':v)].join(' '));
          if(/sifilis|hiv|hepatite/.test(txt)&&/reagente|positivo/.test(txt)&&!/seguimento|tratamento|fluxo|notifica|sinan/.test(txt))add(p,'IST/SINAN','Teste reagente sem fluxo/seguimento registrado','alta','Agendar consulta e revisar fluxo IST/SINAN',a);
          if(/sifilis|hiv|hepatite|dengue|violencia sexual|agravo notificavel/.test(txt)&&!/sinan|notifica/.test(txt))add(p,'SINAN','SINAN pendente ou não registrado','alta','Revisar notificação e ficha específica',a);
        });
      });
    }catch(e){console.warn('Busca ativa extra falhou:',e)}
    return base;
  };
  window.renderBuscaAtiva=function(){
    try{filtrosGestao()}catch(e){}
    const busca=(document.getElementById('ba-busca')?.value||'').toLowerCase(),linha=val('ba-linha'),pri=val('ba-prioridade'),micro=val('ba-microarea'),status=val('ba-status');
    const lista=alertasBuscaAtiva().filter(a=>(!busca||[a.nome,a.cpf,a.microarea,a.motivo,a.responsavel].join(' ').toLowerCase().includes(busca))&&(!linha||a.linha===linha)&&(!pri||a.prioridade===pri)&&(!micro||a.microarea===micro)&&(!status||a.status===status));
    const k=document.getElementById('ba-kpis');if(k)k.innerHTML=[['Alertas',lista.length,''],['Alta prioridade',lista.filter(a=>a.prioridade==='alta').length,'alta'],['Média prioridade',lista.filter(a=>a.prioridade==='media').length,'media'],['SINAN/IST',lista.filter(a=>/sinan|ist/i.test(a.linha+a.motivo)).length,'alta']].map(x=>`<div class="gestao-kpi ${x[2]}"><strong>${x[1]}</strong><span>${x[0]}</span></div>`).join('');
    const t=document.getElementById('ba-tbody');if(t)t.innerHTML=lista.length?lista.map(a=>`<tr><td><strong>${gestEsc(a.nome)}</strong><br><small>${gestEsc(a.microarea||'Sem microárea')}</small></td><td>${gestEsc(a.linha)}</td><td>${gestEsc(a.motivo)}</td><td><span class="gestao-tag ${a.prioridade}">${a.prioridade}</span></td><td>${gestEsc(a.acao)}</td><td>${gestEsc(a.responsavel||'Enfermagem')}</td><td>${a.dataLimite?new Date(a.dataLimite+'T00:00:00').toLocaleDateString('pt-BR'):'Definir'}</td><td><button class="btn btn-s" onclick="marcarAlerta('${gestEsc(a.id)}','${a.status==='concluido'?'pendente':'concluido'}')">${a.status==='concluido'?'Reabrir':'Concluir'}</button></td></tr>`).join(''):'<tr><td colspan="8">Nenhum alerta encontrado com estes filtros.</td></tr>';
  };

  window.ESF_LOCAL_STORAGE_CATALOG=[
    {chave:'esf_pacientes*',dados:'paciente, CPF, CNS, endereço, telefone, território',sensivel:true},
    {chave:'esf_atendimentos*',dados:'histórico, SOAP, dados clínicos',sensivel:true},
    {chave:'esf_ai_soap_config*',dados:'endpoint/modelo/configuração IA; chave nunca deve ser salva',sensivel:false},
    {chave:'esf_permissoes*',dados:'permissões e perfis',sensivel:false},
    {chave:'sinan_rascunho*',dados:'rascunho SINAN e dados sensíveis',sensivel:true},
    {chave:'calibracao_*',dados:'calibração de documentos',sensivel:false}
  ];
  window.persistirLocalSeguro=function(chave,valor,opt={}){
    if(opt.sensivel&&!window.__aviso_lgpd_local__){
      window.__aviso_lgpd_local__=true;
      console.warn('LGPD: este sistema salva dados sensíveis localmente neste navegador. Use computador protegido e conta individual.');
    }
    localStorage.setItem(chave,typeof valor==='string'?valor:JSON.stringify(valor));
  };
  function redigirSensivel(txt){
    let texto=String(txt||'');
    const conhecidos=[...document.querySelectorAll('.pg input,.pg textarea')].filter(e=>/(?:nome|cpf|cns|nasc|telefone|tel|endereco|logradouro|bairro|cep|mae|cuidador|responsavel|parceiro)/i.test(e.id)).map(e=>e.value?.trim()).filter(v=>v&&v.length>=3);
    if(CURRENT_USER_PROFILE?.nome)conhecidos.push(CURRENT_USER_PROFILE.nome);
    conhecidos.sort((a,b)=>b.length-a.length).forEach(v=>{texto=texto.replace(new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'[IDENTIFICADOR REMOVIDO]');});
    return texto
      .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,'[CPF REMOVIDO]')
      .replace(/\b\d{15}\b/g,'[CNS REMOVIDO]')
      .replace(/\(?\d{2}\)?\s*9?\d{4}-?\d{4}/g,'[TELEFONE REMOVIDO]')
      .replace(/\b(rua|avenida|av\.|travessa|logradouro|bairro|cep)\b[^|\n;]{0,80}/gi,'[ENDEREÇO REMOVIDO]');
  }
  window.lerFormAISoap=function(){
    const cfg=PRO.orig.lerFormAISoap?.()||{};
    cfg.apiKey='';
    return normalizarConfigAISoap?.(cfg)||cfg;
  };
  window.salvarConfigAISoap=function(){
    if(!temPermissao('ver_admin'))return showToast('Somente o administrador configura a IA SOAP.');
    const cfg=lerFormAISoap();cfg.apiKey='';
    localStorage.setItem(AI_SOAP_CONFIG_KEY,JSON.stringify(cfg));
    const key=document.getElementById('ai-soap-key');if(key)key.value='';
    preencherAdminAISoap();
    showToast('Configuração da IA SOAP salva sem chave no navegador.');
  };
  window.preencherAdminAISoap=function(){
    PRO.orig.preencherAdminAISoap?.();
    const key=document.getElementById('ai-soap-key');if(key){key.value='';key.placeholder='Deixe vazio: a Edge Function autentica no Supabase';}
  };
  window.dadosConsultaAISoap=function(prefix,cfg){
    const base=PRO.orig.dadosConsultaAISoap?.(prefix,cfg)||{};
    const soap=redigirSensivel(textoSoapAtual(false));
    const promptModulo=typeof promptModuloAISoap==='function'?promptModuloAISoap(prefix):'';
    return {
      tipoConsulta:tipoConsultaAISoap?.(prefix)||prefix||'consulta',
      soapAtual:soap,
      contexto:soap,
      camposPreenchidos:'',
      pendenciasDetectadas:validarEntradaPreSoap(prefix),
      instrucaoSistema:base.instrucaoSistema||promptSistemaAISoap?.(cfg)||'Lapidar SOAP sem inventar dados.',
      promptModulo:redigirSensivel(base.promptModulo||promptModulo),
      origem:'soap_com_identificadores_conhecidos_removidos_requer_revisao'
    };
  };
  window.montarDadosConsultaParaIA=function(tipoConsulta){
    const prefix=prefixoPaginaAtual(),soapLocal=redigirSensivel(obterSOAPLocalAtual?.()||textoSoapAtual(false));
    if(prefix){
      const dados=dadosConsultaAISoap(prefix,lerConfigAISoap?.()||{});
      dados.soapLocal=soapLocal;
      dados.objetivoIA='Lapidar o SOAP local em estilo semi-narrativo, mantendo dados, corrigindo repetições e sem inventar informações.';
      return dados;
    }
    return {descricaoConsulta:tipoConsulta||'Consulta de enfermagem',soapLocal,origem:'soap_local_sanitizado'};
  };
  function ensureIaCompareStyles(){
    if(document.getElementById('ia-soap-compare-style'))return;
    const st=document.createElement('style');st.id='ia-soap-compare-style';st.textContent=`
      .ia-compare-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px}
      .ia-compare-modal{width:min(1180px,96vw);max-height:92vh;overflow:auto;background:var(--sf,#fff);border:1px solid var(--bd,#ddd);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:18px;color:var(--tx,#111)}
      .ia-compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .ia-compare-grid textarea{width:100%;min-height:430px;border:1px solid var(--bd,#ddd);border-radius:10px;padding:12px;font:13px/1.45 ui-monospace,Consolas,monospace;background:var(--sf2,#f8f8f8);color:var(--tx,#111)}
      .ia-compare-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:12px}
      @media(max-width:800px){.ia-compare-grid{grid-template-columns:1fr}.ia-compare-grid textarea{min-height:260px}}
    `;document.head.appendChild(st);
  }
  function mostrarComparadorIASoap(prefix,local,ia,pendencias=[],bloqueado=false){
    ensureIaCompareStyles();
    document.getElementById('ia-soap-compare')?.remove();
    const div=document.createElement('div');div.id='ia-soap-compare';div.className='ia-compare-backdrop';
    const itens=Array.isArray(pendencias)?pendencias.map(x=>typeof x==='string'?x:JSON.stringify(x)):['Resposta de pendências em formato inválido.'];
    div.innerHTML=`<div class="ia-compare-modal" role="dialog" aria-modal="true" aria-label="Revisar resposta da IA"><h3 style="margin:0 0 6px">Comparar SOAP local x SOAP IA</h3><div class="alert alert-i" style="margin-bottom:12px">A IA não substituiu automaticamente. Revise e aplique somente se estiver correto.</div><div class="alert alert-w">${bloqueado?'Resposta bloqueada pelo servidor. Corrija as pendências antes de solicitar nova revisão.':'Ao aplicar, revise novamente o plano antes de copiar ou salvar.'}${itens.length?`<ul>${itens.map(x=>`<li>${escTR(x)}</li>`).join('')}</ul>`:''}</div><div class="ia-compare-grid"><div><strong>SOAP local</strong><textarea aria-label="SOAP local" readonly>${escTR(local)}</textarea></div><div><strong>SOAP IA</strong><textarea id="ia-soap-text-review" aria-label="SOAP proposto pela IA">${escTR(ia)}</textarea></div></div><div class="ia-compare-actions"><button class="btn btn-s" onclick="document.getElementById('ia-soap-compare').remove()">Manter local</button><button class="btn btn-p" ${bloqueado?'disabled':''} onclick="aplicarSOAPIARevisado('${prefix}')">Aplicar SOAP IA revisado</button></div></div>`;
    document.body.appendChild(div);
    window.__ultimoSoapIA={prefix,ia,pendencias:itens,bloqueado,uid:CURRENT_AUTH_USER_ID};
    div.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();div.remove();return;}
      if(e.key!=='Tab')return;
      const list=[...div.querySelectorAll('button:not(:disabled),textarea')],first=list[0],last=list[list.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    div.querySelector('button').focus();
  }
  window.aplicarSOAPIARevisado=function(prefix){
    if(window.__ultimoSoapIA?.bloqueado||window.__ultimoSoapIA?.uid!==CURRENT_AUTH_USER_ID||window.__ultimoSoapIA?.prefix!==prefix)return showToast('Resposta indisponível para aplicação. Revise as pendências e a sessão.');
    const txt=document.getElementById('ia-soap-text-review')?.value||window.__ultimoSoapIA?.ia||'';
    if(!txt.trim())return showToast('SOAP IA vazio.');
    aplicarTextoCompletoAISoap?.(prefix,txt,window.__ultimoSoapIA?.pendencias||[]);
    const confirmado=document.getElementById(prefix+'-plano-confirmado');if(confirmado)confirmado.checked=false;
    document.getElementById('ia-soap-compare')?.remove();
    showToast('SOAP IA aplicado após revisão.');
  };
  window.gerarSoapPorIA=async function(){
    if(!exigirPermissao('usar_ia_soap','Seu perfil não possui permissão para usar a IA SOAP.'))return;
    const prefix=prefixoPaginaAtual();if(!prefix)return showToast('Abra uma consulta antes de usar a IA SOAP.');
    const cfg=carregarConfiguracaoIASOAP?.()||lerConfigAISoap();
    if(!cfg.ativa&&!cfg.enabled)return mostrarMensagemIA?.('IA SOAP não está ativada.');
    if(!cfg.endpoint)return mostrarMensagemIA?.('Endpoint da IA SOAP não configurado.');
    if(!obterSOAPLocalAtual?.().trim()){quickGerarSoap?.();await new Promise(r=>setTimeout(r,650))}
    const soapLocal=obterSOAPLocalAtual?.()||textoSoapAtual(false);
    if(!soapLocal.trim())return mostrarMensagemIA?.('Gere o SOAP local antes de usar a IA SOAP.');
    const btn=document.querySelector('#quick-actions .quick-action-btn.ai');if(btn){btn.disabled=true;btn.textContent='Gerando...'}
    try{
      mostrarMensagemIA?.('Gerando SOAP com IA...');
      const tipoConsulta=tipoConsultaAISoap?.(prefix)||'consulta';
      const uid=CURRENT_AUTH_USER_ID;ensureIaCompareStyles();
      const revisado=await revisarEnvioIA(montarDadosConsultaParaIA(tipoConsulta).soapLocal);
      if(revisado===null)return;
      if(uid!==CURRENT_AUTH_USER_ID)throw new Error('Sessão alterada durante a revisão.');
      const dadosConsulta={soapLocal:revisado};
      const resposta=await fetchComTimeout(cfg.endpoint,{method:'POST',headers:await cabecalhosIASegura(),body:JSON.stringify({tipoAcao:'gerar_soap',tipoConsulta,dadosConsulta})},45000);
      let data;try{data=await resposta.json()}catch(e){throw new Error('A IA SOAP não retornou JSON válido.')}

      if(!resposta.ok)throw new Error(data?.erro||data?.error||`Erro HTTP ${resposta.status}.`);
      if(uid!==CURRENT_AUTH_USER_ID)throw new Error('Sessão alterada durante a solicitação.');
      if(data?.data)data=data.data;
      if(!data?.soap||typeof data.soap!=='string')throw new Error('IA SOAP respondeu, mas sem campo data.soap.');
      mostrarComparadorIASoap(prefix,soapLocal,data.soap,data.pendencias||[],!!data.bloqueado);
      mostrarMensagemIA?.(data.bloqueado?'IA SOAP retornou bloqueio/pendências para revisão.':'SOAP IA gerado. Revise antes de aplicar.');
    }catch(e){
      console.error('Erro ao aplicar IA SOAP:',e);
      mostrarMensagemIA?.('IA SOAP não respondeu. O SOAP local foi mantido. Veja o console.');
    }finally{if(btn){btn.disabled=false;btn.textContent='IA SOAP'}}
  };

  window.auditarSiteComIA=async function(){if(temPermissao('ver_admin'))return testarSistemaCompleto(true);};
  function criarPainelAuditoriaIA(){
    const sec=document.getElementById('admin-sec-ia-soap')?.querySelector('.admin-card')||document.getElementById('admin-sec-ia-soap');
    const box=document.createElement('div');box.id='ai-site-audit-result';box.className='ai-soap-status';sec?.appendChild(box);return box;
  }
  window.testarSistemaCompleto=function(render=true){
    const checks=[];
    const push=(nome,status,acao='')=>checks.push({nome,status,acao});
    const cfg=lerConfigAISoap();
    push('Endpoint IA SOAP configurado',cfg.endpoint?'PASSOU':'FALHOU',cfg.endpoint?'':'Configurar clever-processor.');
    push('Chave IA no front-end',cfg.apiKey?'FALHOU':'PASSOU',cfg.apiKey?'Remover chave; usar Edge Function.':'');
    push('Permissão IA SOAP admin/usuário',typeof temPermissao==='function'?'PASSOU':'FALHOU','');
    push('Gerador Abertura PN',typeof gerarSoapAutomatoPna==='function'?'PASSOU':'FALHOU','');
    push('Gerador Consulta PN',typeof gerarSoapAutomatoPnc==='function'?'PASSOU':'FALHOU','');
    ['pu','prev','id','sm','ist'].forEach(p=>push(`Validação ${p}`,Array.isArray(validarEntradaPreSoap(p))?'PASSOU':'FALHOU',''));
    push('Busca ativa',Array.isArray(alertasBuscaAtiva())?'PASSOU':'FALHOU','');
    push('Catálogo localStorage LGPD',Array.isArray(ESF_LOCAL_STORAGE_CATALOG)?'PASSOU':'FALHOU','');
    push('Copiar SOAP',typeof copiarTextoSeguro==='function'?'PASSOU':'FALHOU','');
    if(render){
      const out=criarPainelAuditoriaIA();
      out.innerHTML=`<h4>Diagnóstico de componentes</h4><p>Confere a disponibilidade das funções. Não executa os testes de regressão nem certifica segurança clínica. A bateria automatizada está no repositório e no relatório de validação.</p><table class="admin-table"><tbody>${checks.map(c=>`<tr><td>${escTR(c.nome)}</td><td>${escTR(c.status)}</td><td>${escTR(c.acao||'')}</td></tr>`).join('')}</tbody></table>`;
    }
    return checks;
  };
  function instalarBotoesAuditoriaIA(){
    const sec=document.getElementById('admin-sec-ia-soap')?.querySelector('.admin-card');if(!sec||document.getElementById('btn-auditar-site-ia'))return;
    const row=document.createElement('div');row.className='brow';row.style.marginTop='8px';
    row.innerHTML=`<button class="btn btn-p" id="btn-auditar-site-ia" onclick="auditarSiteComIA()">Diagnóstico de componentes</button><button class="btn btn-s" onclick="testarSistemaCompleto(true)">Conferir disponibilidade</button>`;
    sec.appendChild(row);criarPainelAuditoriaIA();
  }
  function esconderDevNaoAdmin(){
    const admin=temPermissao('ver_admin');
    document.querySelectorAll('.nb').forEach(b=>{
      const tx=norm(b.textContent);
      if(/hiperdia|feridas|puerperio|consulta geral|demanda espontanea/.test(tx)&&/em desenvolvimento/.test(tx))b.style.display=admin?'':'none';
    });
  }
  window.aplicarPermissoesInterface=function(){
    PRO.orig.aplicarPermissoesInterface?.();
    esconderDevNaoAdmin();
    instalarBotoesAuditoriaIA();
  };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{instalarBotoesAuditoriaIA();esconderDevNaoAdmin();},600));
})();

/* Auditoria final baseada no PDF "Auditoria e Correcoes no Sistema ESF".
   Esta camada nao substitui o sistema: reforca validacoes, protocolos e campos
   criticos antes de gerar SOAP, salvar, copiar ou exportar documentos. */
(function(){
  const AUD=window.__ESF_AUDITORIA_PDF_20260703__||(window.__ESF_AUDITORIA_PDF_20260703__={});
  if(AUD.instalado)return;
  AUD.instalado=true;

  const original={
    quickGerarSoap:window.quickGerarSoap,
    quickSalvar:window.quickSalvar,
    quickCopiarEvolucao:window.quickCopiarEvolucao,
    quickCopiarSoapPendencias:window.quickCopiarSoapPendencias,
    quickCopiarSoapSae:window.quickCopiarSoapSae,
    salvarAtendimentoModulo:window.salvarAtendimentoModulo,
    gerarFichaRosa:window.gerarFichaRosa,
    gerarSoapGenerico:window.gerarSoapGenerico,
    gerarSoapAutomatoPna:window.gerarSoapAutomatoPna,
    gerarSoapAutomatoPnc:window.gerarSoapAutomatoPnc,
    gerarSoapAutomatoPu:window.gerarSoapAutomatoPu,
    gerarSoapPreventivo:window.gerarSoapPreventivo,
    gerarSoapIdoso:window.gerarSoapIdoso,
    gerarSoapSM:window.gerarSoapSM,
    testarSistemaCompleto:window.testarSistemaCompleto
  };

  window.PROTOCOLOS_ESF_AUDITORIA_2026=ESFProtocolSources.sources.map(p=>({modulo:p.id,nome:p.title,origem:'SMS Toledo',ano:'Consultar edição do documento',status:p.reviewStatus,url:p.url,conferencia:ESFProtocolSources.checkedAt,sha256:p.sha256}));

  function el(id){return document.getElementById(id)}
  function valor(id){return String(el(id)?.value||'').trim()}
  function normTxt(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function num(v){return ESFClinical.number(v)}
  function soapMap(){return (typeof SOAP_IDS_MODULO!=='undefined'?SOAP_IDS_MODULO:window.SOAP_IDS_MODULO)||{}}
  function modulosMap(){return (typeof MODULOS_CLINICOS!=='undefined'?MODULOS_CLINICOS:window.MODULOS_CLINICOS)||{}}
  function essenciaisMap(){return (typeof CAMPOS_ESSENCIAIS!=='undefined'?CAMPOS_ESSENCIAIS:window.CAMPOS_ESSENCIAIS)||{}}
  function atendimentosMap(){return (typeof MODULOS_ATENDIMENTO!=='undefined'?MODULOS_ATENDIMENTO:window.MODULOS_ATENDIMENTO)||{}}
  function add(lista,msg,campo,acao){if(msg&&!lista.some(x=>x.msg===msg))lista.push({msg,campo:campo||'',acao:acao||''})}
  function page(prefix){const map={pna:'pg-pn-abertura',pnc:'pg-pn-consulta',pu:'pg-puericultura',prev:'pg-preventivo',id:'pg-idoso',sm:'pg-saude-mental',ger:'pg-consulta-geral',hip:'pg-hiperdia',fer:'pg-feridas',puerp:'pg-puerperio',ist:'pg-ist',vd:'pg-visita-domiciliar'};return el(map[prefix]||'')}
  function textoPagina(prefix){
    const pg=page(prefix);if(!pg)return'';
    const campos=Array.from(pg.querySelectorAll('input,select,textarea')).filter(c=>c.type!=='hidden'&&c.type!=='file').map(c=>{
      if((c.type==='checkbox'||c.type==='radio')&&!c.checked)return'';
      const ids=Object.values(soapMap()[prefix]||{});if(ids.includes(c.id)||c.id.includes('-pc-')||/revisao|plano-confirmado|avaliacao-confirmada/.test(c.id))return '';
      if(c.type!=='checkbox'&&c.type!=='radio'&&!ESFClinical.positiveText(c.value))return '';
      if(c.type!=='checkbox'&&c.type!=='radio'&&!String(c.value||'').trim())return '';
      if(/^(nao|não|ausente|normal|não avaliado|nao avaliado|não reagente|nao reagente|negativo)$/i.test(String(c.value||'').trim()))return '';
      const label=c.closest('label')?.textContent||pg.querySelector(`label[for="${c.id}"]`)?.textContent||c.id||c.name||'';
      return `${label}: ${(c.type==='checkbox'||c.type==='radio')?'marcado':c.value}`;
    }).filter(Boolean);
    const chips=Array.from(pg.querySelectorAll('.clinical-chip.selected,.complaint-chip.selected,.alert-chip.selected,.quick-care.selected')).map(c=>c.textContent||'').filter(Boolean);
    return ESFClinical.positiveText([...campos,...chips].join(' | '));
  }
  function temTexto(prefix,rx){return rx.test(textoPagina(prefix))}
  function campoTem(ids){return ids.some(id=>!!valor(id))}
  function condutaOk(prefix){const ids=soapMap()[prefix]||{};return campoTem([`${prefix}-conduta`,`${prefix}-pc-pactuada`])||(el(`${prefix}-plano-confirmado`)?.checked&&!!valor(ids.p));}
  function retornoOk(prefix){return campoTem([`${prefix}-retorno`,`${prefix}-proximo-retorno`,`${prefix}-agenda-retorno`])||/retorno|reavaliar|agendad|proxima consulta/.test(normTxt(window.textoSoapAtual?.(false)||''))}
  function paValor(prefix){
    const raw=valor(`${prefix}-pa`)||valor(`${prefix}-pa-atual`)||valor(`${prefix}-pressao`);
    const m=raw.match(/(\d{2,3})\D+(\d{2,3})/);
    return m?{sis:+m[1],dia:+m[2],raw}:null;
  }
  function igSemanas(prefix){
    const raw=valor(`${prefix}-ig`)||valor(`${prefix}-ig-semanas`)||'';
    const m=raw.match(/(\d{1,2})/);
    return m?+m[1]:null;
  }
  function soapVazio(prefix){
    const ids=soapMap()[prefix];if(!ids)return false;
    return ![ids.s,ids.o,ids.a,ids.p].some(id=>valor(id));
  }
  function adicionarCampo(prefix,campo){
    const mods=modulosMap();if(!mods[prefix])return;
    const lista=mods[prefix].campos||[];
    if(!['pa','fc','fr','sat','temp'].includes(campo[0])&&!lista.some(c=>c[0]===campo[0])&&!document.getElementById(`${prefix}-${campo[0]}`))lista.push(campo);
  }
  function reforcarCamposClinicos(){
    [
      ['hip',['tipo-diagnostico','Tipo detalhado','select',['HAS','DM1','DM2','HAS + DM','Pré-diabetes','Obesidade','Dislipidemia','DRC','IAM/AVC prévio','Outro']]],
      ['hip',['pa-repetida','PA repetida / segunda medida','text']],
      ['hip',['braco-pa','Braço usado na aferição','select',['Direito','Esquerdo','Ambos','Não registrado']]],
      ['hip',['tecnica-pa','Técnica/condição da aferição','textarea']],
      ['hip',['fc','Frequência cardíaca','number']],
      ['hip',['acesso-medicacao','Acesso aos medicamentos','select',['Regular','Irregular','Sem acesso','Não avaliado']]],
      ['hip',['sint-deficit-neuro','Déficit neurológico agudo','select',['Não','Sim']]],
      ['hip',['sint-confusao','Confusão mental / rebaixamento','select',['Não','Sim']]],
      ['hip',['sint-vomitos','Vômitos persistentes','select',['Não','Sim']]],
      ['hip',['sint-sincope','Síncope','select',['Não','Sim']]],
      ['hip',['hiperglicemia-sintomatica','Hiperglicemia sintomática','select',['Não','Sim']]],
      ['hip',['creatinina','Creatinina','text']],
      ['hip',['albuminuria','Albuminúria/proteinúria','text']],
      ['hip',['lipidograma','Lipidograma','text']],
      ['hip',['potassio','Potássio','text']],
      ['hip',['ecg','ECG','textarea']],
      ['hip',['fundo-olho','Fundo de olho / avaliação oftalmológica','textarea']],
      ['hip',['pe-pele','Pé diabético: pele','textarea']],
      ['hip',['pe-unhas','Pé diabético: unhas','textarea']],
      ['hip',['pe-deformidades','Pé diabético: deformidades','textarea']],
      ['hip',['pe-pulsos','Pé diabético: pulsos','textarea']],
      ['hip',['pe-sensibilidade','Pé diabético: sensibilidade','textarea']],
      ['hip',['pe-calcados','Pé diabético: calçados','textarea']],
      ['hip',['classificacao','Classificação do seguimento','select',['Rotina','Descontrole sem urgência','Alto risco','Urgência / avaliar no mesmo atendimento']]],
      ['fer',['lateralidade','Lateralidade','select',['Direita','Esquerda','Bilateral','Não se aplica']]],
      ['fer',['tempo-evolucao','Tempo de evolução','text']],
      ['fer',['area','Área calculada/estimada (cm²)','number']],
      ['fer',['tuneis','Túneis / sinus','textarea']],
      ['fer',['descolamento','Descolamento de bordas','textarea']],
      ['fer',['pele-perilesional','Pele perilesional','textarea']],
      ['fer',['sinais-sistemicos','Sinais sistêmicos','textarea']],
      ['fer',['braden','Braden / risco de LPP','text']],
      ['fer',['lpp-classificacao','Classificação LPP, se aplicável','select',['Não se aplica','Estágio 1','Estágio 2','Estágio 3','Estágio 4','Não classificável','Lesão tissular profunda']]],
      ['fer',['solucao','Solução utilizada','text']],
      ['fer',['fixacao','Fixação / proteção','text']],
      ['fer',['criterios-urgencia','Critérios de urgência encontrados','textarea']],
      ['puerp',['fc','Frequência cardíaca','number']],
      ['puerp',['temp','Temperatura','number']],
      ['puerp',['pa','Pressão arterial','text']],
      ['puerp',['loquios','Lóquios','textarea']],
      ['puerp',['odor','Odor de lóquios/ferida','select',['Ausente','Presente','Não avaliado']]],
      ['puerp',['utero','Involução uterina','textarea']],
      ['puerp',['perineo','Períneo / episiorrafia','textarea']],
      ['puerp',['incisao','Incisão cirúrgica','textarea']],
      ['puerp',['edema','Edema','select',['Ausente','Leve','Importante','Não avaliado']]],
      ['puerp',['panturrilhas','Panturrilhas / sinais tromboembólicos','textarea']],
      ['puerp',['cefaleia','Cefaleia persistente','select',['Não','Sim']]],
      ['puerp',['visao-turva','Alterações visuais','select',['Não','Sim']]],
      ['puerp',['dispneia','Dispneia','select',['Não','Sim']]],
      ['puerp',['dor-toracica','Dor torácica','select',['Não','Sim']]],
      ['puerp',['ideacao-suicida','Ideação suicida','select',['Não','Sim']]],
      ['puerp',['pensamento-ferir-bebe','Pensamento de ferir o bebê','select',['Não','Sim']]],
      ['puerp',['rn-peso','RN: peso atual/alta','text']],
      ['puerp',['rn-mamadas','RN: mamadas','textarea']],
      ['puerp',['rn-diurese','RN: diurese','textarea']],
      ['puerp',['rn-evacuacoes','RN: evacuações','textarea']],
      ['puerp',['rn-ictericia','RN: icterícia','select',['Não','Sim','Não avaliado']]],
      ['puerp',['rn-coto','RN: coto umbilical','textarea']],
      ['puerp',['rn-vacinas','RN: vacinas/testes neonatais','textarea']]
    ].forEach(([p,c])=>adicionarCampo(p,c));
    const essenciais=essenciaisMap();
    if(essenciais){
      // Substitui intencionalmente hip/fer/puerp/vd de CAMPOS_ESSENCIAIS por listas mais
      // completas (redesenho da auditoria clínica). É a versão que vale em runtime.
      Object.assign(essenciais,{
        hip:[['PA atual e repetida',['hip-pa-atual','hip-pa','hip-pa-repetida']],['diagnóstico/condição',['hip-diagnostico','hip-tipo-diagnostico']],['glicemia/HbA1c quando DM',['hip-glicemia','hip-hba1c']],['adesão e acesso',['hip-adesao','hip-acesso-medicacao']],['sinais de alerta',['hip-dor-toracica','hip-falta-ar','hip-sint-deficit-neuro']],['conduta',['hip-conduta','hip-p']],['retorno',['hip-retorno']]],
        fer:[['localização e lateralidade',['fer-local','fer-lateralidade']],['dimensões',['fer-comprimento','fer-largura','fer-profundidade']],['leito/tecido',['fer-tecido']],['exsudato/odor',['fer-exsudato','fer-odor']],['dor',['fer-dor','fer-dor-escala']],['cobertura/conduta',['fer-cobertura','fer-produto','fer-conduta']],['retorno/evolução',['fer-retorno','fer-evolucao']]],
        puerp:[['data e dias pós-parto',['puerp-data-parto','puerp-dias']],['sinais vitais',['puerp-pa','puerp-fc','puerp-temp']],['sangramento/lóquios',['puerp-sangramento','puerp-loquios']],['mamas/amamentação',['puerp-mamas','puerp-amamentacao']],['humor e segurança',['puerp-humor','puerp-ideacao-suicida']],['RN vinculado',['puerp-rn','puerp-rn-mamadas']],['conduta',['puerp-conduta','puerp-p']],['retorno',['puerp-retorno']]],
        vd:[['motivo da visita',['vd-motivo']],['cuidador/rede',['vd-cuidador','vd-rede']],['sinais vitais',['vd-pa','vd-fc','vd-temp','vd-sat']],['mobilidade/AVD',['vd-mobilidade','vd-adl']],['medicações/dispositivos',['vd-medicamentos','vd-dispositivos-detalhes']],['conduta',['vd-conduta','vd-p']],['retorno/próxima visita',['vd-retorno']]]
      });
    }
  }

  function validarPN(prefix,acao,res){
    const pa=paValor(prefix),ig=igSemanas(prefix),t=textoPagina(prefix),salvar=/salvar|copiar|exportar|pdf|ficha/i.test(acao);
    if(!campoTem([`${prefix}-dum`]))add(res.erros,'DUM não registrada para validação da IG/DPP.','DUM','Registrar DUM ou justificar ausência.');
    if(!campoTem([`${prefix}-ig`,`${prefix}-ig-semanas`]))add(res.erros,'Idade gestacional não registrada.','IG','Calcular ou registrar IG antes de finalizar.');
    if(!campoTem([`${prefix}-dpp`]))add(res.erros,'DPP não registrada.','DPP','Calcular DPP antes de finalizar.');
    if(pa&&(pa.sis>=140||pa.dia>=90)&&!condutaOk(prefix))add(res.erros,`PA elevada (${pa.raw}) sem conduta registrada.`,`PA ${pa.raw}`,'Registrar repetição da PA, avaliação clínica e conduta conforme fluxo municipal.');
    if(pa&&(pa.sis>=160||pa.dia>=110)&&!condutaOk(prefix))add(res.erros,`PA em faixa grave (${pa.raw}) exige conduta imediata registrada.`,`PA ${pa.raw}`,'Registrar ação realizada e fluxo acionado antes de salvar/copiar.');
    if(/sangramento vaginal|perda de liquido|perda de líquido|dor abdominal intensa|dor epigastrica|dor epigástrica|reducao de movimentos|redução de movimentos/.test(t)&&!condutaOk(prefix))add(res.erros,'Sinal de alarme obstétrico sem conduta registrada.','Anamnese/alertas','Registrar avaliação, orientação/fluxo e retorno/encaminhamento conforme protocolo municipal.');
    if(/sifilis.*reagente|sífilis.*reagente|tr sifilis.*reagente|tr sífilis.*reagente/.test(t)&&!/sifilis.*nao reagente|sífilis.*não reagente/.test(t)){
      if(!/sinan|notifica|vdrl|parceria|tratamento|fluxo/.test(t+normTxt(window.textoSoapAtual?.(false)||'')))add(res.erros,'Sífilis reagente sem fluxo completo registrado.','Teste rápido','Registrar VDRL/fluxo, parceria sexual, notificação/SINAN e seguimento conforme Protocolo IST Toledo.');
      // O preparo do SINAN ocorre apenas na ação explícita de gerar, não ao validar a tela.
    }
    if(ig!==null&&ig>=20&&!campoTem([`${prefix}-bcf`]))add(res.pendencias,'BCF não registrado para IG em que a avaliação geralmente é aplicável.','BCF','Registrar se avaliado ou justificar.');
    if(ig!==null&&ig>=20&&!campoTem([`${prefix}-au`]))add(res.pendencias,'Altura uterina não registrada.','AU','Registrar se avaliado ou justificar.');
    if(salvar&&!retornoOk(prefix))add(res.erros,'Retorno programado não definido.','Retorno','Registrar data/período de retorno ou justificativa.');
    if(/risco habitual|risco intermediario|risco intermediário|alto risco/.test(t)&&!/criterio|critério|identificado|motivo|pontuacao|pontuação/.test(t))add(res.avisos,'Classificação de risco sem critérios visíveis.','Risco gestacional','Confirmar os critérios avaliados.');
  }

  function validarPreventivo(acao,res){
    const t=textoPagina('prev'),salvar=/salvar|copiar|exportar|pdf|ficha/i.test(acao);
    if(/ficha rosa|citopatol|pdf|exportar/i.test(acao)){
      if(!valor('prev-nome'))add(res.erros,'Ficha Rosa sem nome da paciente.','Nome','Preencher identificação.');
      if(!valor('prev-cns')&&!valor('prev-cpf'))add(res.erros,'Ficha Rosa exige CNS ou CPF.','CNS/CPF','Preencher ao menos um identificador.');
      if(!valor('prev-nasc'))add(res.erros,'Ficha Rosa sem data de nascimento.','Nascimento','Preencher nascimento.');
      if(!document.querySelector('input[name="prev-motivo"]:checked'))add(res.erros,'Motivo do exame não marcado.','Motivo','Selecionar rastreamento, repetição ou seguimento.');
      if(!document.querySelector('input[name="prev-colo"]:checked'))add(res.erros,'Situação do colo não marcada.','Exame clínico','Registrar inspeção do colo.');
      if(!valor('prev-data'))add(res.erros,'Data da coleta não preenchida.','Data da coleta','Preencher data da coleta.');
      if(!valor('prev-enf'))add(res.erros,'Responsável pela coleta não preenchido.','Responsável','Preencher profissional responsável.');
    }
    if(/lesao|lesão|corrimento|sangramento|ulcera|úlcera|verruga|dor pelvica|dor pélvica|nodulo|nódulo/.test(t)&&/sem alteracoes|sem alterações|normal/.test(normTxt(window.textoSoapAtual?.(false)||''))&&salvar)add(res.erros,'Achado ginecológico relevante não pode gerar texto de “sem alterações”.','Exame preventivo','Revisar SOAP e conduta antes de salvar/copiar.');
    if(/lesao suspeita|lesão suspeita|colo alterado/.test(t)&&!condutaOk('prev'))add(res.erros,'Lesão/colo alterado sem conduta registrada.','Colo uterino','Registrar fluxo/encaminhamento conforme protocolo local.');
  }

  function validarPuericultura(acao,res){
    const t=textoPagina('pu'),salvar=/salvar|copiar|exportar|pdf/i.test(acao);
    [['idade da criança',['pu-idade','pu-nasc']],['peso',['pu-peso']],['comprimento/estatura',['pu-alt','pu-comprimento']],['perímetro cefálico',['pu-pc']],['alimentação',['pu-alim']],['vacinação',['pu-vac','pu-vacinacao']],['DNPM',['pu-dnpm','pu-dn']]].forEach(([nome,ids])=>{if(!campoTem(ids))(salvar?add(res.erros,`${nome} não registrado.`,nome,'Registrar ou justificar não avaliado.'):add(res.pendencias,`${nome} não registrado.`,nome,'Registrar ou justificar.'))});
    if(!campoTem(['pu-dnpm','pu-dn'])&&/dnpm adequado|desenvolvimento adequado/.test(normTxt(window.textoSoapAtual?.(false)||'')))add(res.erros,'DNPM vazio não pode ser descrito como adequado.','DNPM','Marcar os marcos avaliados ou deixar como não avaliado.');
    if(/nao reage|não reage|atraso|marco ausente|vacina atrasada/.test(t)&&!condutaOk('pu'))add(res.erros,'Alteração de desenvolvimento/vacina sem conduta.','Puericultura','Registrar orientação, retorno e fluxo conforme protocolo.');
  }

  function validarHiperdia(res){
    const t=textoPagina('hip'),pa=paValor('hip'),glic=num(valor('hip-glicemia'));
    const sintomas=/dor toracica|dor torácica|falta de ar|deficit|déficit|confus|sincope|síncope|alteracao visual|alteração visual|cefaleia|vomitos|vômitos/.test(t);
    if(pa&&(pa.sis>=180||pa.dia>=120)&&!condutaOk('hip'))add(res.erros,`PA muito elevada (${pa.raw}) sem conduta registrada.`,'Hiperdia','Registrar reavaliação e conduta conforme protocolo municipal.');
    if(pa&&(pa.sis>=140||pa.dia>=90)&&sintomas&&!condutaOk('hip'))add(res.erros,`PA elevada com sintoma de alerta (${pa.raw}) sem conduta.`,'Hiperdia','Registrar avaliação médica/fluxo local quando indicado.');
    if(glic!==null&&(glic<70||glic>=300)&&/sintomatica|sintomática|confus|vomit|desidrat|mal estar/.test(t)&&!condutaOk('hip'))add(res.erros,`Glicemia crítica/sintomática (${glic}) sem conduta registrada.`,'Glicemia','Registrar conduta conforme protocolo local.');
    if(/ferida em pe diabetico|ferida em pé diabético|perda de sensibilidade/.test(t)&&!condutaOk('hip'))add(res.erros,'Achado de pé diabético sem conduta.','Pé diabético','Registrar avaliação dos pés, cuidado local e fluxo compatível.');
    ['creatinina','albuminuria','lipidograma','potassio','ecg','fundo-olho'].forEach(id=>{if(!valor(`hip-${id}`))add(res.avisos,`${id.replace('-',' ')} não registrado em Hiperdia.`,id,'Preencher quando disponível ou deixar como não avaliado.')});
  }

  function validarFeridas(res){
    const t=textoPagina('fer');
    ['fer-local','fer-comprimento','fer-largura','fer-tecido','fer-exsudato','fer-cobertura','fer-retorno'].forEach(id=>{if(!valor(id))add(res.pendencias,`${id.replace('fer-','')} não registrado.`,id,'Completar avaliação da ferida.')});
    if(/necrose|odor forte|exsudato purulento|celulite|febre|pe diabetico|pé diabético|dor intensa/.test(t)&&!condutaOk('fer'))add(res.erros,'Ferida com sinal de gravidade/infecção sem conduta registrada.','Feridas','Registrar conduta de enfermagem e necessidade de avaliação/fluxo conforme protocolo.');
  }

  function validarPuerperio(res){
    const t=textoPagina('puerp'),pa=paValor('puerp');
    if(pa&&(pa.sis>=140||pa.dia>=90)&&!condutaOk('puerp'))add(res.erros,`PA elevada no puerpério (${pa.raw}) sem conduta.`, 'Puerpério','Registrar avaliação e fluxo conforme protocolo pré-natal/puerpério.');
    if(/febre|sangramento intenso|odor|secrecao|secreção|dispneia|dor toracica|dor torácica|ideacao suicida|ideação suicida|ferir o bebe|ferir o bebê|mastite/.test(t)&&!condutaOk('puerp'))add(res.erros,'Sinal de alerta puerperal sem conduta registrada.','Puerpério','Registrar conduta, retorno e fluxo acionado.');
  }

  function validarSaudeMental(res){
    [['ideação atual',['sm-ideacao-atual']],['plano suicida',['sm-plano-suicida']],['meios disponíveis',['sm-meio-disponivel']],['tentativa prévia',['sm-tentativa-previa']],['rede de apoio',['sm-rede-crise','sm-rede-apoio']]].forEach(([label,ids])=>{if(!campoTem(ids))add(res.pendencias,`${label}: não avaliado/registrado.`,ids[0],'Registrar a resposta, inclusive ausência ou não avaliado.');});
    const t=textoPagina('sm');
    if(!el('sm-avaliacao-confirmada')?.checked)add(res.pendencias,'ERSM ainda não confirmado como avaliação completa.','sm-avaliacao-confirmada','Revisar todos os itens antes de concluir a classificação.');
    if(/ideacao.*sim|suicid.*sim|tentativa recente|autoagress/.test(t)&&!valor('sm-plano-seguranca'))add(res.erros,'Risco atual exige registro do plano de segurança/fluxo acionado.','sm-plano-seguranca','Registrar a ação e a avaliação profissional.');
  }

  function validarIST(res){
    const t=textoPagina('ist');
    if(/reagente|violencia sexual|violência sexual|lesao|lesão|dor pelvica|dor pélvica|sinais sistemicos|sinais sistêmicos/.test(t)&&!condutaOk('ist'))add(res.erros,'IST/teste reagente ou alerta sem conduta registrada.','IST','Registrar aconselhamento, fluxo, SINAN quando aplicável e retorno.');
    if(/reagente|sifilis|sífilis|hiv|hepatite/.test(t)&&!/sinan|notifica/.test(t))add(res.pendencias,'Avaliar notificação/SINAN conforme agravo.','SINAN','Registrar se aplicável.');
    ['queixa','sintoma','exame','teste','resultado','parceria','retorno'].forEach(x=>{if(!t.includes(x))add(res.avisos,`${x} não registrado no atendimento IST.`,x,'Completar se aplicável.')});
  }

  function validarIdoso(res){
    const t=textoPagina('id')+' '+normTxt(window.textoSoapAtual?.(false)||'');
    ['avd','aivd','queda','memoria','humor','rede de apoio','cuidador','ivcf'].forEach(x=>{if(!t.includes(x))add(res.pendencias,`${x} não registrado/avaliado.`,x,'Completar avaliação ampliada do idoso.')});
    const meds=num(valor('id-num-meds')||valor('id-medicamentos-qtd'));
    if(/polifarm/.test(t)&&meds!==null&&meds<5)add(res.erros,'Polifarmácia só deve ser confirmada com 5 ou mais medicamentos.','Medicamentos','Revisar classificação.');
  }

  function validarVD(res){
    const t=textoPagina('vd');
    if(/febre|dispneia|saturacao baixa|saturação baixa|rebaixamento|confusao aguda|confusão aguda|necrose|purulento|odor forte|sonda exteriorizada|cuidador exausto|violencia|violência|negligencia|negligência|sem insumo|insuficientes/.test(t)&&!condutaOk('vd'))add(res.erros,'Visita domiciliar com alerta crítico sem conduta registrada.','Visita domiciliar','Registrar plano, responsável, retorno/próxima visita e fluxo acionado.');
  }

  window.validarAntesDeGerar=function(modulo,acao='gerar'){
    const prefix=modulo||window.prefixoPaginaAtual?.()||'';
    const res={prefix,acao,erros:[],avisos:[],pendencias:[],bloqueia:false};
    if(!prefix)return res;
    if(/copiar|salvar|exportar|pdf/i.test(acao)&&soapVazio(prefix))add(res.erros,'SOAP vazio: gere ou preencha a evolução antes de continuar.','SOAP','Gerar SOAP local ou preencher manualmente.');
    if(prefix==='pna'||prefix==='pnc')validarPN(prefix,acao,res);
    if(prefix==='ger')validarDemandaEspontanea(false).forEach(msg=>add(res.erros,msg,'Demanda','Revisar classificação e desfecho.'));
    if(prefix==='prev')validarPreventivo(acao,res);
    if(prefix==='pu')validarPuericultura(acao,res);
    if(prefix==='hip')validarHiperdia(res);
    if(prefix==='fer')validarFeridas(res);
    if(prefix==='puerp')validarPuerperio(res);
    if(prefix==='sm')validarSaudeMental(res);
    if(prefix==='ist')validarIST(res);
    if(prefix==='id')validarIdoso(res);
    if(prefix==='vd')validarVD(res);
    const t=textoPagina(prefix);
    if(/dado ficticio|dado fictício|paciente teste|teste-\d+/.test(t))add(res.avisos,'Há dado de teste/fictício na tela. Isso não bloqueia, mas revise antes de usar em produção.','Modo teste','Substituir por dados reais antes de salvar em produção.');
    const finalizar=/copiar|salvar|exportar|pdf|ficha/i.test(acao);
    if(finalizar){
      if(!valor(`${prefix}-nome`))add(res.erros,'Paciente não identificado.','Nome','Preencher o nome antes de finalizar.');
      if(!el(`${prefix}-plano-confirmado`)?.checked)add(res.erros,'Plano ainda não revisado e confirmado.','Plano','Revisar o SOAP e confirmar as ações efetivamente definidas.');
    }
    const justificativa=valor(`${prefix}-revisao-justificativa`);
    const identidadeOK=!!valor(`${prefix}-nome`),planoOK=el(`${prefix}-plano-confirmado`)?.checked;
    res.bloqueia=!!(finalizar&&(!identidadeOK||!planoOK||(res.erros.length&&justificativa.length<15)));
    res.excecao=finalizar&&res.erros.length&&!res.bloqueia?justificativa:'';
    renderPainelValidacaoAuditoria(prefix,res);
    return res;
  };

  function ensureCss(){
    if(el('auditoria-pdf-style'))return;
    const st=document.createElement('style');st.id='auditoria-pdf-style';st.textContent=`
      .auditoria-pdf-box{border:1px solid var(--bd,#ddd);border-radius:12px;padding:12px;margin:12px 0;background:var(--sf2,#fafafa)}
      .auditoria-pdf-box.ok{border-color:#bbf7d0;background:#f0fdf4;color:#14532d}
      .auditoria-pdf-box.erro{border-color:#fde68a;background:#fffbeb;color:#78350f}
      .auditoria-pdf-box.aviso{border-color:#fde68a;background:#fffbeb;color:#78350f}
      .auditoria-pdf-box h4{margin:0 0 8px;font-size:14px}
      .auditoria-pdf-box ul{margin:6px 0 0 18px;padding:0}
      .auditoria-pdf-box li{margin:4px 0}
      .auditoria-pdf-tag{display:inline-block;font-size:11px;padding:2px 7px;border-radius:999px;border:1px solid currentColor;margin-right:5px}
    `;document.head.appendChild(st);
  }
  function renderPainelValidacaoAuditoria(prefix,res){
    ensureCss();
    const ids=soapMap()[prefix]||{};
    const anchor=el(ids.s)?.closest('.card')||page(prefix)?.querySelector('.card')||page(prefix);
    if(!anchor)return;
    let box=el(`auditoria-pdf-validacao-${prefix}`);
    if(!box){box=document.createElement('div');box.id=`auditoria-pdf-validacao-${prefix}`;anchor.insertAdjacentElement('afterbegin',box)}
    const cls=res.erros.length||res.avisos.length||res.pendencias.length?'aviso':'ok';
    box.className=`auditoria-pdf-box ${cls}`;
    const lista=(titulo,itens,tag)=>itens.length?`<div><span class="auditoria-pdf-tag">${tag}</span><strong>${titulo}</strong><ul>${itens.map(x=>`<li>${escTR(x.msg)}${x.acao?` <small>(${escTR(x.acao)})</small>`:''}</li>`).join('')}</ul></div>`:'';
    box.innerHTML=res.erros.length||res.avisos.length||res.pendencias.length
      ?`<h4>Validação clínica/documental antes de ${escTR(res.acao)}</h4>${lista('Itens importantes para revisar',res.erros,'revisar')}${lista('Avisos para revisar',res.avisos,'aviso')}${lista('Pendências de preenchimento',res.pendencias,'pendência')}<div style="font-size:12px;margin-top:8px;color:var(--tx2)">${res.bloqueia?'Finalização pendente: complete a identificação, confirme o plano e resolva os erros ou registre justificativa clínica específica.':'Revisão de campos: este painel não certifica normalidade clínica nem substitui a avaliação profissional.'}</div>`
      :`<h4>Validação clínica/documental</h4><div>Nenhum alerta automático nestas verificações. Confirme a avaliação e o plano antes de finalizar.</div>`;
  }
  function bloquearSeCritico(prefix,acao){
    const r=window.validarAntesDeGerar(prefix,acao);
    if(r.bloqueia){el(`auditoria-pdf-validacao-${prefix}`)?.scrollIntoView({block:'center'});showToast('Revise os itens indicados antes de finalizar. O rascunho pode continuar sendo editado.');}
    if(r.excecao)registrarAuditoria('Exceção documentada',`${prefix}: ${r.excecao}`);
    return r.bloqueia;
  }
  function prefixAtual(){return window.prefixoPaginaAtual?.()||''}
  function sanitizarSoapPosGeracao(prefix){
    if(prefix==='pu'&&!campoTem(['pu-dnpm','pu-dn'])){
      const ids=soapMap().pu||{};
      [ids.a,ids.o,ids.p].forEach(id=>{const e=el(id);if(e)e.value=String(e.value||'').replace(/[^.\n]*(DNPM|desenvolvimento)[^.\n]*(adequad[oa])[^.\n]*\.?/gi,'DNPM não avaliado nos campos preenchidos.')});
    }
  }

  function wrapGerador(nome,prefixo){
    if(typeof original[nome]!=='function')return;
    window[nome]=function(...args){
      const prefix=typeof prefixo==='function'?prefixo(...args):prefixo;
      if(prefix&&bloquearSeCritico(prefix,'gerar SOAP'))return;
      const r=original[nome].apply(this,args);
      setTimeout(()=>{if(prefix)sanitizarSoapPosGeracao(prefix);},120);
      return r;
    };
  }
  wrapGerador('gerarSoapGenerico',p=>p);
  wrapGerador('gerarSoapAutomatoPna','pna');
  wrapGerador('gerarSoapAutomatoPnc','pnc');
  wrapGerador('gerarSoapAutomatoPu','pu');
  wrapGerador('gerarSoapPreventivo','prev');
  wrapGerador('gerarSoapIdoso','id');
  wrapGerador('gerarSoapSM','sm');

  window.quickGerarSoap=function(){const p=prefixAtual();if(p&&bloquearSeCritico(p,'gerar SOAP'))return;return original.quickGerarSoap?.apply(this,arguments)}
  window.quickCopiarEvolucao=function(){const p=prefixAtual();if(p&&bloquearSeCritico(p,'copiar SOAP'))return;return original.quickCopiarEvolucao?.apply(this,arguments)}
  window.quickCopiarSoapPendencias=function(){const p=prefixAtual();if(p&&bloquearSeCritico(p,'copiar SOAP + pendências'))return;return original.quickCopiarSoapPendencias?.apply(this,arguments)}
  window.quickCopiarSoapSae=function(){const p=prefixAtual();if(p&&bloquearSeCritico(p,'copiar SOAP + SAE'))return;return original.quickCopiarSoapSae?.apply(this,arguments)}
  window.quickSalvar=function(){const p=prefixAtual();if(p&&bloquearSeCritico(p,'salvar atendimento'))return;return original.quickSalvar?.apply(this,arguments)}
  window.salvarAtendimentoModulo=async function(tipo){
    const cfg=atendimentosMap()[tipo],p=cfg?.prefix||prefixAtual();
    if(p&&bloquearSeCritico(p,'salvar atendimento'))return;
    return original.salvarAtendimentoModulo?.apply(this,arguments);
  };
  window.gerarFichaRosa=async function(){
    if(bloquearSeCritico('prev','gerar Ficha Rosa'))return;
    return original.gerarFichaRosa?.apply(this,arguments);
  };

  window.testarSistemaCompleto=function(render=true){
    const base=Array.isArray(original.testarSistemaCompleto?.(false))?original.testarSistemaCompleto(false):[];
    const checks=[...base];
    const push=(nome,status,acao='')=>checks.push({nome,status,acao});
    push('Registro central de protocolos',Array.isArray(window.PROTOCOLOS_ESF_AUDITORIA_2026)&&window.PROTOCOLOS_ESF_AUDITORIA_2026.length>=10?'PASSOU':'FALHOU','Conferir lista oficial de Toledo.');
    push('Validador clínico central',typeof window.validarAntesDeGerar==='function'?'PASSOU':'FALHOU','');
    ['pna','pnc','pu','prev','id','sm','hip','fer','puerp','ist','vd'].forEach(p=>{
      const r=window.validarAntesDeGerar(p,'teste automatizado');
      push(`Validação ${p}`,r&&Array.isArray(r.erros)&&Array.isArray(r.avisos)?'PASSOU':'FALHOU','');
    });
    push('Função de geração de Ficha Rosa disponível',typeof window.gerarFichaRosa==='function'?'PASSOU':'FALHOU','O teste de bloqueio e preenchimento é executado na suíte de integração.');
    push('Módulos em desenvolvimento ocultos para não-admin',typeof window.aplicarPermissoesInterface==='function'?'PASSOU':'ALERTA','Revalidar com perfil comum.');
    push('Escopo destes testes','INFORMATIVO','Checagens estruturais locais. Não representam validação clínica integral, teste de banco ou aprovação para produção.');
    if(render){
      const out=document.getElementById('ai-site-audit-result')||document.createElement('div');
      if(!out.id){out.id='ai-site-audit-result';document.body.appendChild(out)}
      out.className='auditoria-pdf-box';
      out.innerHTML=`<h4>Diagnóstico de componentes</h4><p>Confere a disponibilidade das funções. Não executa os testes de regressão nem certifica segurança clínica. A bateria automatizada está no repositório e no relatório de validação.</p><table class="admin-table"><tbody>${checks.map(c=>`<tr><td>${escTR(c.nome)}</td><td>${escTR(c.status)}</td><td>${escTR(c.acao||'')}</td></tr>`).join('')}</tbody></table>`;
    }
    return checks;
  };

  reforcarCamposClinicos();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
    reforcarCamposClinicos();
    try{window.atualizarIndicadorPreenchimento?.()}catch(e){}
    try{Object.keys(soapMap()).forEach(p=>window.validarAntesDeGerar(p,'abrir tela'))}catch(e){}
  },900));
})();
