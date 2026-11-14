/* Tabelas OMS 2019 para Brasil/Paraguai e escala familiar de Coelho-Savassi. */
(() => {
  'use strict';
  const tables=typeof module==='object'?require('./tabelas-cv.js'):tabelasCV;
  const cvCodes=new Set(['K74','K75','K76','K77','K87','K89','K90','K91','K92','K99']);
  const decimal=v=>Number(String(v??'').trim().replace(',','.'));
  function idade(nasc,dia){
    if(!/^\d{4}-\d\d-\d\d$/.test(nasc)||!/^\d{4}-\d\d-\d\d$/.test(dia)||nasc>dia)return NaN;
    return Number(dia.slice(0,4))-Number(nasc.slice(0,4))-(dia.slice(5)<nasc.slice(5)?1:0);
  }
  function cardiovascular(c){
    const age=idade(c.nasc,c.dia);
    if(!Number.isFinite(age))return 'Informe nascimento e data do atendimento.';
    if(age<40||age>=75)return 'Fora da faixa de 40 a 74 anos da ferramenta.';
    if(c.dcv==='Sim'||c.codes.some(k=>cvCodes.has(k)))return 'Risco muito alto · histórico cardiovascular.';
    if(c.dcv!=='Não')return 'Conferir histórico cardiovascular.';
    if(c.dm==='Sim'||c.drc==='Sim'||c.codes.some(k=>['T89','T90'].includes(k)))return 'Risco alto · diabetes ou doença renal crônica.';
    if(c.dm!=='Não'||c.drc!=='Não')return 'Conferir diabetes e doença renal crônica.';
    if(!['Masculino','Feminino'].includes(c.sexo)||!['Sim','Não'].includes(c.fuma))return 'Informar sexo e tabagismo atual.';
    const pas=String(c.pa||'').trim().match(/^(\d{2,3})(?:\s*[xX/]\s*\d{2,3})?$/),sbp=pas?Number(pas[1]):0;
    if(sbp<50||sbp>300)return 'Conferir a pressão sistólica em mmHg.';
    const ct=decimal(c.ct),peso=decimal(c.peso),altura=decimal(c.alt);
    const limite=new Date(c.dia+'T12:00:00Z');limite.setUTCFullYear(limite.getUTCFullYear()-1);
    let model,band;
    if(c.ct&&!c.dataCt)return 'Informe a data do colesterol total.';
    if(c.dataCt>c.dia||c.ct&&(!Number.isFinite(ct)||ct<=0)||c.dataCt&&!c.ct)return 'Confira o colesterol total e a data do exame.';
    if(c.ct&&c.dataCt>=limite.toISOString().slice(0,10)){
      model='cholesterol';const mmol=ct/38.67;band=[4,5,6,7].filter(n=>mmol>=n).length;
    }else{
      if(!(peso>0&&altura>0))return 'Informe colesterol total dos últimos 12 meses ou peso e altura medidos nesta consulta.';
      const metros=altura>3?altura/100:altura,imc=peso/(metros*metros);
      if(!Number.isFinite(imc)||imc<8||imc>120)return 'Confira as unidades do peso e da altura.';
      model='bmi';band=[20,25,30,35].filter(n=>imc>=n).length;
    }
    const linha=(6-Math.floor((age-40)/5))*5+[180,160,140,120].filter(n=>sbp<n).length;
    const coluna=(c.sexo==='Feminino'?10:0)+(c.fuma==='Sim'?5:0)+band;
    const risk=tables[model][linha][coluna];
    return risk+'% em 10 anos · tabela OMS para o Brasil por '+(model==='bmi'?'IMC':'colesterol total')+'.';
  }
  const sentinelas=[
    ['acamado','Restrito ao leito',3],['defFisica','Deficiência física',3],['defMental','Deficiência mental',3],
    ['desnutricao','Desnutrição grave',3],['drogas','Uso problemático de drogas',2],['desemprego','Desemprego',2],
    ['analfabetismo','Analfabetismo',1],['hipertensao','Hipertensão arterial',1],['diabetes','Diabetes mellitus',1]
  ];
  const familyKey=p=>JSON.stringify([p.unidade,p.microarea,p.familia].map(x=>String(x||'').trim().toLowerCase()));
  function escala(membros,dia){
    let pontos=0,incompletos=0;
    for(const m of membros){
      for(const [k,,peso] of sentinelas){
        const v=m['cs_'+k];if(v==='Sim')pontos+=peso;else if(v!=='Não')incompletos++;
      }
      const years=idade(m.nasc,dia);
      if(!Number.isFinite(years)){incompletos++;continue;}
      const nasc=new Date(m.nasc+'T12:00:00Z'),mes=nasc.getUTCMonth()+6;
      const ultimo=new Date(Date.UTC(nasc.getUTCFullYear(),mes+1,0)).getUTCDate();
      const seis=new Date(Date.UTC(nasc.getUTCFullYear(),mes,Math.min(nasc.getUTCDate(),ultimo))).toISOString().slice(0,10);
      if(dia<seis||years>70)pontos++;
    }
    const domicilios=membros.filter(m=>m.cs_domicilio?.familia===familyKey(m)).map(m=>m.cs_domicilio)
      .sort((a,b)=>String(b.atualizado).localeCompare(String(a.atualizado)));
    const d=domicilios[0];
    if(d?.saneamento==='Sim')pontos+=3;else if(d?.saneamento!=='Não')incompletos++;
    const moradores=Number(d?.moradores),comodos=Number(d?.comodos);
    if(Number.isInteger(comodos)&&comodos>0&&Number.isInteger(moradores)&&moradores>0){
      pontos+=moradores>comodos?3:moradores===comodos?2:0;
    }else incompletos++;
    return {pontos,completa:!incompletos&&membros.length>0,classe:pontos>=9?'Máxima':pontos>=7?'Média':pontos>=5?'Baixa':'Habitual'};
  }
  const api={cardiovascular,idade,escala,sentinelas,familyKey};
  if(typeof module==='object'){module.exports=api;return;}
  window.EstratificacaoAPS=api;
})();
