const test=require('node:test'),assert=require('node:assert/strict');
const {cardiovascular:cv,escala,sentinelas,familyKey}=require('../assets/estratificacao.js');
const dia='2026-11-13',base={nasc:'1954-01-01',dia,codes:[],dcv:'Não',dm:'Não',drc:'Não',sexo:'Feminino',fuma:'Sim',pa:'182/90',ct:'285',dataCt:dia};
test('OMS Brasil: extremos, sexo, tabagismo, PAS, colesterol e IMC',()=>{
  assert.match(cv(base),/^20%/);assert.match(cv({...base,sexo:'Masculino'}),/^31%/);
  assert.match(cv({...base,ct:'',dataCt:'',peso:110,alt:170}),/^22%/);
  assert.match(cv({...base,nasc:'1986-11-13',pa:'118/70',sexo:'Masculino',fuma:'Não',ct:'120'}),/^1%/);
  assert.doesNotMatch(cv({...base,nasc:'1986-11-14'}),/%/);
  assert.doesNotMatch(cv({...base,nasc:'1951-11-13'}),/%/);
  assert.match(cv({...base,dataCt:'2025-11-12'}),/12 meses/);assert.match(cv({...base,dataCt:'2026-11-14'}),/Confira/);
  assert.match(cv({...base,codes:['K86','K90'],dm:'Sim'}),/muito alto/);
  assert.match(cv({...base,codes:['T90']}),/Risco alto/);
  for(const key of ['dcv','dm','drc','sexo','fuma','pa','nasc'])assert.doesNotMatch(cv({...base,[key]:''}),/%/);
});
test('Coelho-Savassi: dados desconhecidos, indivíduo, domicílio e cortes',()=>{
  const adulto={unidade:'UBS A',microarea:'1',familia:'7',nasc:'1990-01-01',...Object.fromEntries(sentinelas.map(([k])=>['cs_'+k,'Não']))};
  const d={familia:familyKey(adulto),atualizado:dia,comodos:'3',moradores:'2',saneamento:'Não'};
  const p={...adulto,cs_domicilio:d};
  assert.deepEqual(escala([p],dia),{pontos:0,completa:true,classe:'Habitual'});
  assert.equal(escala([{...p,cs_diabetes:'',cs_acamado:'Sim'}],dia).completa,false);
  for(const [score,classe] of [[5,'Baixa'],[7,'Média'],[9,'Máxima']]){
    const m={...p,cs_acamado:'Sim',cs_desemprego:'Sim',cs_drogas:score>=7?'Sim':'Não',cs_hipertensao:score===9?'Sim':'Não',cs_diabetes:score===9?'Sim':'Não'};
    assert.deepEqual(escala([m],dia),{pontos:score,completa:true,classe});
  }
  assert.deepEqual(escala([{...p,cs_domicilio:{...d,comodos:'2',saneamento:'Sim'}},{...adulto,nasc:'2026-05-14'}],dia),{pontos:6,completa:true,classe:'Baixa'});
  assert.equal(escala([{...p,familia:'8'}],dia).completa,false);
});
