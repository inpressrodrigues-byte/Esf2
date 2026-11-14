const assert=require('node:assert/strict');
module.exports=async page=>{
  await page.evaluate(()=>{
    const unit='ESFSB Cosmos',cpf='00000000042';
    window.MODO_OFFLINE=false;
    CURRENT_USER_PROFILE={nome:'Profissional A',unidade:unit};
    PERMISSOES_ATUAIS={...PERMISSOES_PADRAO};ESFEscopo.atualizar();
    const order={confirmedAt:'2026-11-01',items:[{id:'h',name:'Exame solicitado A',status:'solicitar'},{id:'x',name:'Exame descartado',status:'dispensar'}]};
    const tables={
      pacientes:[{cpf,unidade:unit,dados:{nome:'Pessoa de teste',nasc:'1999-11-23',cns:'CNS fictício'}}],
      agenda_ubs:['Profissional A','Profissional B'].map((profissional,i)=>({id:i+1,cpf,unidade:unit,profissional,pacientes:{nome:'Pessoa de teste'},estado:'Agendado',motivo:'Retorno simulado',horario:new Date().toISOString()})),
      atendimentos:[
        {id:1,id_local:'a1',paciente_cpf:cpf,unidade:unit,data:'2026-11-01',profissional:'Profissional B',tipo:'Consulta Geral',soap:'S: relato fictício\nP: plano registrado',dados:{'ger-exkit-order':JSON.stringify(order),'ger-medicamentos':'Somente em uso','ger-prescricoes-registradas':'Prescrição fictícia A'}},
        {id:2,id_local:'a2',paciente_cpf:cpf,unidade:unit,data:'2026-11-02',profissional:'Profissional A',tipo:'Preventivo',soap_text:'SOAP anterior salvo',dados:{'prev-resultados-vinculados':JSON.stringify([{cpf,origem:'a1',confirmadoEm:'2026-11-01',exameId:'h',nome:'Exame solicitado A',data:'2026-11-02',resultado:'Resultado fictício A'}])}},
        {id:3,paciente_cpf:'00000000043',unidade:unit,soap:'Outro paciente'},
        {id:4,paciente_cpf:cpf,unidade:'Outra UBS',soap:'Outra unidade'}],
      acoes_ubs:[{id:3,cpf,unidade:unit,tipo:'Dose aplicada',dia:'2026-10-08',descricao:'Vacina de teste',dose:'Primeira dose',lote:'X'}]
    };
    _sb={from(table){let data=tables[table]||[];const api={select(){return api;},order(){return api;},eq(k,v){data=data.filter(r=>r[k]===v);return api;},in(k,vs){data=data.filter(r=>vs.includes(r[k]));return api;},or(){return api;},range(a,b){return Promise.resolve({data:data.slice(a,b+1)});},maybeSingle(){return Promise.resolve({data:data[0]});}};return api;}};
    const user={id:CURRENT_AUTH_USER_ID,email:'teste@exemplo.invalid',user_metadata:{nome:'Profissional A'}};
    const from=_sb.from;_sb.from=function(table){
      if(table==='perfis')return {select(){return this;},eq(){return this;},maybeSingle(){return Promise.resolve({data:{nome:'Profissional A',unidade:unit,permissoes:{ver_historico:true}}});}};
      return from(table);
    };
    CURRENT_AUTH_USER_ID='';
    verificarAcesso({user},'SIGNED_IN');
  });
  if(await page.locator('#clinical-safety-modal.open').isVisible()){
    await page.locator('#clinical-safety-accept').check();await page.locator('#clinical-safety-confirm').click();
  }
  const agenda=page.locator('#equipe-painel'),filter=agenda.getByLabel('Profissional da agenda'),patient=agenda.getByRole('button',{name:'Pessoa de teste'});
  await patient.first().waitFor();assert.equal(await patient.count(),2);
  await filter.selectOption('Profissional B');assert.equal(await patient.count(),1);
  await patient.click();
  const chart=page.locator('#pac-modal');
  await chart.getByText('Vacina de teste · Primeira dose').waitFor();
  assert.deepEqual(await chart.locator('h4').allTextContents(),['Identificação','Consultas','Exames solicitados','Medicações prescritas','Vacinas']);
  const visits=chart.locator('section').nth(1);
  assert.match(await visits.locator('summary').first().innerText(),/02\/11\/2026.*Profissional A/);
  await visits.getByText(/01\/11\/2026.*Consulta Geral.*Profissional B/).click();
  assert.match(await visits.innerText(),/relato fictício/);
  const all=await chart.textContent();for(const term of ['CNS fictício','Exame solicitado A','Resultado fictício A','Prescrição fictícia A','Lote X'])assert.ok(all.includes(term),term);
  for(const term of ['Somente em uso','Exame descartado','Outro paciente','Outra unidade'])assert.ok(!all.includes(term),term);
  await page.keyboard.press('Escape');assert.equal(await chart.isVisible(),false);
  assert.equal(await page.locator('.pg.on').getAttribute('id'),'pg-equipe');
  await page.evaluate(()=>{go('consulta-geral');verificarAcesso({user:{id:CURRENT_AUTH_USER_ID}},'TOKEN_REFRESHED');_sb=null;});
  assert.equal(await page.locator('.pg.on').getAttribute('id'),'pg-consulta-geral');
  console.log('PASS Agenda da unidade, filtro por profissional, prontuário em ordem, SOAP, pedidos, prescrições e doses do paciente.');
};
