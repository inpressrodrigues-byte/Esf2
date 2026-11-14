const assert=require('node:assert/strict');
module.exports=async page=>{
  const result=await page.evaluate(()=>{
    PERMISSOES_ATUAIS.ver_admin=true;CURRENT_USER_PROFILE.unidade='ESFSB Cosmos';ESFEscopo.atualizar();
    go('hiperdia');const cpf='00000000023',nasc='1995-01-01';
    restaurarDadosModulo('hip',{'hip-cpf':cpf,'hip-nasc':nasc});
    ESFCiap.incluirCodigo('hip','K86');
    const box=document.getElementById('hip-resumo-longitudinal');
    [...box.querySelectorAll('button')].find(b=>b.textContent==='Acompanhar problema').click();
    const data=coletarDadosModulo('hip');
    salvarAtendimentos([{id:'teste-hip',tipo:'Hiperdia',cpf,unidade:CURRENT_USER_PROFILE.unidade,user_id:CURRENT_AUTH_USER_ID,data:'2026-11-10T10:00:00Z',dados:{...data,'hip-alergias':'Alergia fictícia'}}]);
    go('ist');restaurarDadosModulo('ist',{'ist-cpf':cpf,'ist-nasc':nasc});
    const retorno=document.getElementById('ist-resumo-longitudinal'),antes=retorno.textContent;
    [...retorno.querySelectorAll('button')].find(b=>b.textContent==='Avaliar nesta consulta').click();
    retorno.querySelector('select').value='Resolvido';
    [...retorno.querySelectorAll('button')].find(b=>b.textContent==='Registrar evolução').click();
    const resolvido=document.getElementById('ist-condicoes-acompanhadas').value;
    const troca=document.getElementById('ist-cpf');troca.value='00000000044';troca.dispatchEvent(new Event('input',{bubbles:true}));
    const results={antes,resolvido,limpo:retorno.hidden,grupos:ContinuidadeAPS.gruposFamilia([{familia:'02',microarea:'1',unidade:'A'},{familia:'02',microarea:'1',unidade:'A'},{familia:'02',microarea:'1',unidade:'B'}]).grupos.size};
    const atual=dadosGestao;window.dadosGestao=()=>[{cpf,nome:'Pessoa fictícia',consultas:[{tipo:'IST / Testes Rápidos',data:'2026-11-10',dados:{'ist-tr-p-hiv-res':'NÃO REAGENTE','ist-tr-c-hiv-res':'REAGENTE'},soap:'HIV não reagente'}]}];
    results.istNeg=alertasBuscaAtiva().filter(a=>a.linha==='IST/SINAN'||a.linha==='SINAN').length;
    window.dadosGestao=atual;
    return results;
  });
  assert.match(result.antes,/Alergia fictícia/);assert.match(result.antes,/K86/);assert.equal(JSON.parse(result.resolvido)[0].estado,'Resolvido');
  assert.equal(result.limpo,true);assert.equal(result.grupos,2);assert.equal(result.istNeg,0);
  await page.evaluate(()=>{
    window.dadosTesteEquipe=[];let pending=null;
    const slots=[1,2].map(i=>({id:'slot-'+i,inicio:new Date(Date.now()+i*3600000).toISOString(),profissional:'Enfermeiro fictício',agenda_ubs:[]}));
    _sb={from(table){
      const api={gte(){return api;},lt(){return api;},select(){return api;},eq(){return api;},in(){return api;},lte(){return api;},or(){return api;},order(){return api;},
        range(){return Promise.resolve({data:table==='agenda_ubs'?structuredClone(window.dadosTesteEquipe):table==='agenda_horarios'?slots:[],error:null});},
        insert(data){pending={...data,versao:1,criado_em:new Date().toISOString()};return api;},
        update(delta){pending={...window.dadosTesteEquipe[0],...delta,versao:window.dadosTesteEquipe[0].versao+1,...(delta.triagem?{triado_em:new Date().toISOString()}:{})};return api;},
        maybeSingle(){window.dadosTesteEquipe=[pending];return Promise.resolve({data:{id:pending.id},error:null});}};
      return api;}};
    go('equipe');
  });
  const root=page.locator('#equipe-painel');await root.getByText('Nova entrada',{exact:true}).click();
  await root.getByLabel('CPF do paciente cadastrado').fill('00000000023');
  await root.getByLabel('Entrada',{exact:true}).selectOption('Agendado');
  await root.getByLabel('Agenda do profissional').selectOption('Enfermeiro fictício');
  await root.getByLabel('Horário disponível').selectOption('slot-1');
  await root.getByLabel('Motivo ou questão para a equipe').fill('Retorno simulado');
  await root.getByRole('button',{name:'Salvar',exact:true}).click();
  await root.getByText(/Enfermeiro fictício · Retorno simulado/).waitFor();
  await root.getByText('Reagendar ou registrar chegada',{exact:true}).click();
  const update=root.locator('article').filter({hasText:'Retorno simulado'});
  await update.getByLabel('Horário disponível').selectOption('slot-2');
  await update.getByRole('button',{name:'Confirmar mudança'}).click();
  await page.waitForFunction(()=>window.dadosTesteEquipe[0].horario_id==='slot-2');
  await root.getByRole('button',{name:'Registrar chegada'}).click();
  await root.getByRole('button',{name:'Iniciar triagem'}).click();
  await root.getByText(/00000000023 · Em escuta/).waitFor();
  await root.getByText('Registrar triagem',{exact:true}).click();
  await root.getByLabel('PA sistólica (mmHg)').fill('120');await root.getByLabel('PA diastólica (mmHg)').fill('80');
  await root.getByRole('button',{name:'Confirmar mudança'}).click();
  await root.getByRole('button',{name:'Iniciar atendimento'}).click();
  await page.locator('#pg-consulta-geral.on #ger-triagem-resumo').waitFor();
  assert.match(await page.locator('#ger-triagem-resumo').textContent(),/120 mmHg.*80 mmHg/);
  assert.equal(await page.locator('#ger-cpf').inputValue(),'000.000.000-23');
  await page.evaluate(()=>SolicitacoesAPS.show('ger','exam'));
  const exam=page.locator('#ger-area-exam');await exam.getByRole('searchbox').fill('hemograma');
  await exam.locator('.order-results button').first().click();
  assert.match(await page.locator('#ger-exkit-cart').inputValue(),/HEMOGRAMA/i);
  await page.getByRole('button',{name:'Prescrição',exact:true}).click();
  const rx=page.locator('#ger-area-rx');await rx.getByRole('searchbox').fill('amoxicilina');await rx.locator('.order-results button').first().click();
  await rx.getByLabel('Posologia, via, duração e quantidade').fill('Instrução fictícia para teste');
  await rx.getByRole('button',{name:'Adicionar à prescrição'}).click();
  assert.match(await page.locator('#ger-prescricoes-registradas').inputValue(),/Amoxicilina.*Instrução fictícia/i);
  await page.evaluate(()=>go('equipe'));
  await root.getByLabel('Exibir').selectOption('Vacinação');await root.getByText('Registrar dose',{exact:true}).click();
  assert.equal(await root.getByLabel('Lote').evaluate(n=>n.required),true);
  await root.getByLabel('Origem').selectOption('Dose transcrita');assert.equal(await root.getByLabel('Lote').evaluate(n=>n.required),false);
  await page.evaluate(()=>{_sb=null;go('inicio');});
  assert.equal(await root.textContent(),'');console.log('PASS Problemas longitudinais, separação de paciente, família, teste negativo e fluxo de agenda/fila');
};
