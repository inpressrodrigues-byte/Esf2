const assert=require('node:assert/strict');

module.exports=async page=>{
  await page.evaluate(()=>{go('pn-consulta');restaurarDadosModulo('pnc',{});document.querySelector('[aria-controls="pnc-2"]').click();});
  const painel=page.locator('#pnc-protocolo-atual');
  const selecionar=async nome=>{
    await page.locator('#pnc-queixas-clin label').filter({hasText:nome}).locator('input').click();
  };
  await selecionar('Náuseas');
  await painel.getByText(/bromoprida 10 mg/).waitFor();
  assert.doesNotMatch(await painel.innerText(),/Diarreia e\/ou|ondansetrona 8 mg/i);
  await page.evaluate(()=>{document.getElementById('pnc-ig').value='21s0d';ESFConsultaGuiada.refresh('pnc');});
  assert.match(await painel.innerText(),/ondansetrona 8 mg/i);
  await selecionar('Alterações visuais');
  await painel.getByText(/Sinal de alerta:/).first().waitFor();
  assert.doesNotMatch(await painel.innerText(),/bromoprida|metoclopramida|ondansetrona 8 mg/i);
  await selecionar('Alterações visuais');await selecionar('Náuseas');
  for(const [nome,esperado] of [['Pirose',/hidróxido de alumínio/i],['Dor lombar',/paracetamol 500 mg/i],
    ['Dor abdominal',/escopolamina simples/i],['Constipação',/lactulose/i],['Hemorroidas',/supositório de glicerina/i],
    ['Cãibras',/não indica medicamento/i],['Cefaleia',/paracetamol 500 mg/i],['Tontura',/avaliar PA, glicemia/i],
    ['Dispneia',/ausculta/i]]){
    await selecionar(nome);await painel.getByText(esperado).first().waitFor();await selecionar(nome);
  }
  await page.evaluate(()=>{go('pn-abertura');restaurarDadosModulo('pna',{'pna-queixas':'Refere náuseas','pna-pa':'110/70'});ESFConsultaGuiada.refresh('pna');});
  assert.match(await page.locator('#pna-protocolo-atual').innerText(),/bromoprida 10 mg/i);
  await page.evaluate(()=>{document.getElementById('pna-alergia').value='bromoprida';ESFConsultaGuiada.refresh('pna');});
  assert.match(await page.locator('#pna-protocolo-atual').innerText(),/campo de alergias/i);
  assert.doesNotMatch(await page.locator('#pna-protocolo-atual').innerText(),/bromoprida 10 mg/i);
  await page.evaluate(()=>{document.getElementById('pna-queixas').value='Nega náuseas';ESFConsultaGuiada.refresh('pna');});
  assert.doesNotMatch(await page.locator('#pna-protocolo-atual').textContent(),/bromoprida/i);
  console.log('PASS Queixas do pré-natal no painel visível, alternativas por IG, negações e sinais de alarme');
};
