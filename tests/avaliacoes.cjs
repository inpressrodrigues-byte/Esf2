const assert=require('node:assert/strict');
module.exports=async page=>{
  const actual=await page.evaluate(()=>{
    go('hiperdia');restaurarDadosModulo('hip',{'hip-data-hora':'2026-11-13T09:00','hip-nasc':'1960-01-01','hip-cv-dcv':'Não','hip-cv-drc':'Não','hip-diagnostico':'Diabetes'});
    AvaliacoesAPS.cardio();
    const cv=document.getElementById('hip-cv-out').textContent;
    const values=coletarDadosModulo('hip');
    restaurarDadosModulo('hip',{});AvaliacoesAPS.cardio();
    const cleared=document.getElementById('hip-cv-resultado').value;
    go('consulta-geral');restaurarDadosModulo('ger',{'ger-queixa':'Dengue','ger-dengue-grave':'Não','ger-dengue-alarme':'Não','ger-dengue-especial':'Sim'});
    ESFConsultaGuiada.refresh('ger');const painel=document.getElementById('ger-protocolo-atual');
    const b=painel.textContent;
    const select=painel.querySelector('select');select.value='Sim';select.dispatchEvent(new Event('change',{bubbles:true}));
    const d=painel.textContent;
    return {cv,values:values['hip-cv-resultado'],cleared,b,d,familia:!!document.getElementById('terr-cs-acamado')};
  });
  assert.match(actual.cv,/Risco alto/);assert.equal(actual.cv,actual.values);assert.equal(actual.cleared,'');assert.equal(actual.familia,true);
  assert.match(actual.b,/Grupo B/);assert.match(actual.b,/hemograma completo/i);assert.match(actual.d,/Grupo D/);assert.doesNotMatch(actual.d,/paracetamol/i);
  console.log('PASS Hiperdia, recuperação da avaliação, escala territorial e estadiamento A–D na consulta');
};
