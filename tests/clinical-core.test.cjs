const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../assets/clinical-core.js');
test('decimais preservam magnitude e recusam entradas ambíguas',()=>{
 for(const [input,expected] of [['100.0',100],['100,0',100],['7.9',7.9],['1.234,5',1234.5],['0',0],['',null],['1.2.3',null],['12abc',null],['1,2.3',null]])assert.equal(core.number(input),expected,input);
});
test('negações não apagam sintomas positivos de outra oração',()=>{
 assert.equal(core.positiveText('Ansiedade sem ideação suicida'),'ansiedade');
 assert.match(core.positiveText('Nega sangramento, mas refere cefaleia intensa e escotomas'),/cefaleia intensa e escotomas/);
 assert.doesNotMatch(core.positiveText('Nega candidíase; sem corrimento e sem prurido'),/candidiase|corrimento|prurido/);
});
test('resultados negativos têm o mesmo estado com ou sem acento',()=>{
 for(const text of ['HIV: não reagente.','VDRL: nao reagente.','HBsAg: negativo.'])assert.equal(core.labLevel(text),'ok');
 assert.equal(core.labLevel('HIV: reagente.'),'crit');
});
test('IG usa a data da consulta, inclusive retrospectiva e ano bissexto',()=>{
 assert.equal(core.gestationalDays('2026-01-01','2026-01-08'),7);
 assert.equal(core.gestationalDays('2024-02-28','2024-03-01'),2);
 assert.equal(core.gestationalDays('2026-02-30','2026-03-01'),null);
});
test('pressão arterial: limites municipais e sintomas',()=>{
 for(const [pa,text,cor] of [['220/130','Cefaleia','Vermelho'],['221/130','Sem sintomas','Vermelho'],['160/110','Nega cefaleia; sem sintomas','Amarelo'],['159/109','Sem sintomas','Verde']])assert.equal(core.triage({complaints:'Descompensação da pressão arterial',pa,text,assessed:true}).cor,cor,pa);
});
test('saturação: limites do fluxograma e lacuna documental explícita',()=>{
 for(const [sat,cor] of [[80,'Vermelho'],[83.9,'Vermelho'],[84,'Não classificado'],[85,'Amarelo'],[92,'Amarelo'],[93,'Verde'],[101,'Não classificado']])assert.equal(core.triage({complaints:'Dispneia',sat,text:'Associada à ansiedade',assessed:true}).cor,cor,String(sat));
});
test('glicemia >500/HI é imediata e >250 é prioritária',()=>{
 for(const [glicemia,cor] of [[501,'Vermelho'],['HI','Vermelho'],[500,'Amarelo'],[251,'Amarelo'],[220,'Verde']])assert.equal(core.triage({complaints:'Hiperglicemia',glicemia,text:'Sem sintomas',assessed:true}).cor,cor);
});
test('triagem vazia não afirma baixo risco e negações não viram suicídio',()=>{
 assert.equal(core.triage({}).cor,'Não classificado');
 assert.equal(core.triage({complaints:'Cefaleia'}).cor,'Não classificado');
 assert.equal(core.triage({complaints:'Sofrimento mental',alerts:'Ansiedade sem ideação suicida',assessed:true}).cor,'Verde');
 assert.equal(core.triage({complaints:'Sofrimento mental',alerts:'Ideação suicida; Plano suicida'}).cor,'Vermelho');
 assert.equal(core.triage({complaints:'Demanda administrativa',text:'Documento sem queixa aguda'}).cor,'Azul');
});
test('tireoide usa ramos por peso e idade gestacional, sem unidade mg/dL',()=>{
 assert.match(core.thyroid({tsh:12}).actions.join(' '),/2 mcg\/kg\/dia/);
 assert.match(core.thyroid({tsh:5}).actions.join(' '),/1 mcg\/kg\/dia/);
 assert.match(core.thyroid({tsh:0.01,t4:3,t4Unit:'ng/dL',weeks:12}).actions.join(' '),/propiltiouracil antes de 16/);
 assert.match(core.thyroid({tsh:0.01,t4:3,t4Unit:'ng/dL',weeks:20}).actions.join(' '),/metimazol apos|metimazol após/);
 assert.match(core.thyroid({tsh:0.01,t4:2,t4Unit:'ng/dL',weeks:20}).actions.join(' '),/exatamente 2/);
 assert.match(core.thyroid({tsh:0.01,t4:3,t4Unit:'mg/dL'}).actions.join(' '),/incompatível/);
});
test('extração de laudo aceita Hb inteira e não confunde hemoglobina glicada',()=>{
 assert.equal(core.extractLabs('HEMOGLOBINA: 11 g/dL')[0].value,11);
 assert.equal(core.extractLabs('HEMOGLOBINA GLICADA: 5,6 %').length,0);
 assert.equal(core.extractLabs('GLICOSE EM JEJUM: 100 mg/dL')[0].value,100);
 assert.deepEqual(core.extractLabs('Imagem digitalizada'),[]);
 assert.equal(core.extractLabs('Hemoglobina: 110 g/L')[0].value,110);
 assert.equal(core.extractLabs('Hemoglobina: 11 g/dL. Hemoglobina: 9 g/dL').length,2);
});

test('anemia: limiar e ramo de ferro não se confundem com agendamento HOESP',()=>{
 assert.equal(core.anemia(11).level,'ok');
 assert.equal(core.anemia(7.9).level,'crit');
 assert.match(core.anemia(9.5).actions.join(' '),/especificamente no agendamento HOESP/);
 assert.match(core.anemia(7).actions.join(' '),/exatamente 7/);
 assert.doesNotMatch(core.anemia(7).actions.join(' '),/prescrição de 120/);
});
test('TSH respeita trimestre, unidade desconhecida e limites sobrepostos',()=>{
 assert.equal(core.thyroid({tsh:2.8,weeks:20}).level,'ok');
 assert.equal(core.thyroid({tsh:2.8,weeks:10}).level,'att');
 assert.equal(core.thyroid({tsh:4,weeks:20}).level,'att');
 assert.match(core.thyroid({tsh:0.01,t4:3}).actions.join(' '),/Unidade.*incompatível/);
});
