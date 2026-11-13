const assert = require('node:assert/strict');

module.exports = async page => {
  const panel = page.locator('#ist-seguimento-exames');
  await page.evaluate(() => {
    go('ist');
    const cpf = '00000000023', confirmado = '2026-01-06T12:00:00Z';
    const order = (nome, id) => JSON.stringify({confirmedAt:confirmado,items:[{name:nome,id,status:'solicitar'}]});
    const exam = {'pna-cpf':cpf,'pna-nasc':'1995-01-01','pna-data':'2026-01-06','pna-exkit-order':order('Urocultura','uro')};
    const record = (id, dados, cpfPessoa=cpf) => ({id,tipo:'Abertura PN',cpf:cpfPessoa,dados,user_id:CURRENT_AUTH_USER_ID,unidade:CURRENT_USER_PROFILE.unidade});
    salvarAtendimentos([
      record('origem',exam),record('outro',{'pna-exkit-order':order('Outro CPF','ex')},'00000000024'),
      record('somente-rascunho',{'pna-exkit-cart':order('Sugestão','ex')}),
      record('origem-2',{...exam,'pna-data':'2026-01-10'})
    ]);
    restaurarDadosModulo('ist',{'ist-cpf':cpf,'ist-nasc':'1995-01-01'});
    document.querySelector('#pg-ist .tabs [role="tab"]').click();
  });
  assert.equal(await page.locator('[data-seguimento]').count(),13);
  await panel.locator(':scope > summary').click();
  assert.equal(await panel.locator('option').count(),2);
  assert.doesNotMatch(await panel.innerText(),/Outro CPF|Sugestão/);
  await panel.getByLabel('Data de realização').fill('2026-01-12');
  await panel.getByLabel('Resultado do laudo').fill('Sem crescimento na amostra fictícia');
  await panel.getByRole('button',{name:'Incluir resultado nesta consulta'}).click();
  assert.match(await panel.locator(':scope > summary').innerText(),/1 a revisar/);
  await panel.getByRole('button',{name:'Retirar deste atendimento'}).click();
  assert.match(await panel.locator(':scope > summary').innerText(),/2 a revisar/);
  assert.doesNotMatch(await page.inputValue('#ist-o'),/amostra fictícia/);
  await panel.getByLabel('Data de realização').fill('2026-01-12');
  await panel.getByLabel('Resultado do laudo').fill('Sem crescimento na amostra fictícia');
  await panel.getByRole('button',{name:'Incluir resultado nesta consulta'}).click();
  await page.evaluate(() => {gerarSoapGenerico('ist'); gerarSoapGenerico('ist');});
  assert.equal((await page.inputValue('#ist-o')).split('amostra fictícia').length,2);
  const saved = await page.evaluate(() => coletarDadosModulo('ist'));
  await page.evaluate(() => {
    const cpf = document.getElementById('ist-cpf');
    cpf.value='00000000024'; cpf.dispatchEvent(new Event('input',{bubbles:true}));
  });
  assert.doesNotMatch(await page.inputValue('#ist-o'),/amostra fictícia/);
  assert.equal(await page.inputValue('#ist-resultados-vinculados'),'');
  await page.evaluate(data => {
    restaurarDadosModulo('ist',data);
    const tipo = moduloPorPrefixo('ist');
    salvarAtendimentos([{id:'retorno',tipo:Object.keys(MODULOS_ATENDIMENTO).find(k=>MODULOS_ATENDIMENTO[k]===tipo),cpf:data['ist-cpf'],
      dados:coletarDadosModulo('ist'),user_id:CURRENT_AUTH_USER_ID,unidade:CURRENT_USER_PROFILE.unidade},...carregarAtendimentos()]);
    go('hiperdia'); restaurarDadosModulo('hip',{'hip-cpf':data['ist-cpf'],'hip-nasc':data['ist-nasc']});
    document.querySelector('#pg-hiperdia .tabs [role="tab"]').click();
  }, saved);
  const next = page.locator('#hip-seguimento-exames');
  await next.locator(':scope > summary').click();
  assert.match(await next.locator(':scope > summary').innerText(),/1 a revisar/);
  await next.getByText('Resultados anteriores (1)').click();
  assert.match(await next.innerText(),/Sem crescimento na amostra fictícia/);
  assert.doesNotMatch(await page.inputValue('#hip-o'),/amostra fictícia/);
  await page.evaluate(() => {
    PERMISSOES_ATUAIS.ver_admin = false;
    CURRENT_USER_PROFILE.unidade = 'Outra unidade fictícia'; ESFEscopo.atualizar();
    restaurarDadosModulo('hip',{'hip-cpf':'00000000023','hip-nasc':'1995-01-01'});
  });
  assert.equal(await next.isHidden(),true);
  assert.doesNotMatch(await next.textContent(),/amostra fictícia/);
  console.log('PASS 13 módulos, pedido repetido, retorno em outro módulo, SOAP, retirada, histórico e troca de paciente');
};
