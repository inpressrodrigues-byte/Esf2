const assert=require('node:assert/strict');

module.exports=async page=>{
  const resultado=await page.evaluate(async()=>{
    go('saude-mulher');restaurarDadosModulo('smu',{});
    const campo=id=>document.getElementById(id);
    const perfil={nome:'Pessoa fictícia',nasc:'1996-09-15',estado_civil:'União Estável',ocupacao:'Revisora',
      escolaridade:'Técnico completo',raca:'Parda',naturalidade:'Cascavel',religiao:'Não deseja informar',endereco:'Endereço anterior fictício'};
    campo('smu-data-hora').value='2026-09-14T10:00';preencherDadosPaciente('smu',perfil);
    const idade=campo('smu-idade-entrevista').textContent;
    const legado=campo('smu-endereco-legado').textContent;
    campo('smu-logradouro').value='Rua Fictícia';campo('smu-logradouro').dispatchEvent(new Event('input',{bubbles:true}));
    CURRENT_USER_PROFILE={unidade:'Unidade fictícia'};_sb=null;
    campo('smu-cpf').value='00000000001';await salvarCadastroPaciente('smu');
    const dados=carregarPacientes()['00000000001'];
    campo('pna-cpf').value='00000000001';await buscarPacientePorCPF(campo('pna-cpf'));const pn=coletarDadosModulo('pna');
    restaurarDadosModulo('pna',{});restaurarDadosModulo('pna',pn);
    document.querySelector('[aria-controls="smu-aval"]').click();
    return {dados,pn:coletarDadosPaciente('pna'),idade,legado};
  });
  assert.equal(resultado.idade,'29 anos');assert.match(resultado.legado,/Endereço anterior/);
  for(const k of ['estado_civil','escolaridade','ocupacao','raca'])assert.equal(resultado.pn[k],resultado.dados[k]);
  assert.equal(resultado.dados.escolaridade,'Técnico completo');assert.match(resultado.dados.endereco,/Rua Fictícia/);
  const fala='Eu sinto uma ardência desde ontem.';
  await page.locator('#smu-queixa-principal').fill(fala);
  const picker=page.locator('#smu-aval .protocol-picker');
  await picker.locator('summary').click();await picker.locator('[data-reason="Otalgia"]').click();
  assert.equal(await page.inputValue('#smu-queixa-principal'),fala);
  await page.evaluate(()=>{
    document.getElementById('smu-antecedentes-familiares').value='História familiar fictícia registrada';
    gerarSoapGenerico('smu');
  });
  const soap=await page.inputValue('#smu-s');
  assert.ok(soap.includes(fala));assert.match(soap,/Otalgia/);assert.match(soap,/História familiar fictícia registrada/);
  assert.doesNotMatch(soap,/Cascavel|Revisora|Não deseja informar/);
  await page.evaluate(()=>restaurarDadosModulo('smu',{'smu-nome':'Outra pessoa'}));
  for(const k of ['queixa-principal','religiao','protocolo-queixas','antecedentes-familiares'])assert.equal(await page.inputValue('#smu-'+k),'');
  assert.equal(await page.locator('#smu-endereco-legado').textContent(),'');
  await page.evaluate(()=>{go('ist');restaurarDadosModulo('ist',{});document.getElementById('ist-historia-sexual').value='Relato fictício da entrevista';gerarSoapGenerico('ist');});
  assert.match(await page.inputValue('#ist-s'),/Relato fictício da entrevista/);
  assert.equal(await page.evaluate(()=>Object.hasOwn(coletarDadosPaciente('ist'),'historia-sexual')),false);
  console.log('PASS Entrevista, idade da consulta, endereço, reaproveitamento do cadastro, relato literal, SOAP e histórico antigo');
};
