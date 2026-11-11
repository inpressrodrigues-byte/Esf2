const {test}=require('node:test'),assert=require('node:assert/strict'),R=require('../assets/exames-regras.js');
const pregnancy={gestante:'Sim',scope:'mulher',ig:12,diabetes:'Não',rh:'negativo',coombs:'negativo',toxo:'suscetivel',totg:'Não',alerta:'Não'};
const selected=(kit,c)=>R.build(kit,c).items.filter(i=>i.selected).map(i=>i.id);
test('Pré-natal: rotina, condicionais e janelas dos três trimestres',()=>{
 const first=selected('pn1',pregnancy);for(const id of ['hemograma','abo','eletro','glicose','toxo','coombs','eas','cultura','us1'])assert.ok(first.includes(id),id);
 for(const id of ['vdrl','usData','avidez','beta','tig'])assert.ok(!first.includes(id),id);
 assert.ok(selected('pn2',{...pregnancy,ig:22}).includes('totg'));
 assert.deepEqual(R.build('pn2',{...pregnancy,ig:22}).items.find(i=>i.id==='totg').window,[24,28]);
 assert.ok(selected('pn3',{...pregnancy,ig:32}).includes('gbs'));
 assert.ok(!selected('pn1',{...pregnancy,ig:15}).includes('us1'));
 assert.ok(!selected('pn2',{...pregnancy,ig:29}).includes('totg'));
 assert.ok(!selected('pn3',{...pregnancy,ig:38}).includes('gbs'));
});
test('Diabetes diagnosticado não recebe rastreamento repetido; dado ausente não é negativo',()=>{
 for(const diabetes of ['Sim',''])for(const kit of ['pn1','pn2','pn3']){const ids=selected(kit,{...pregnancy,ig:26,diabetes});assert.ok(!ids.includes('glicose'));assert.ok(!ids.includes('totg'));}
 assert.ok(!selected('pn2',{...pregnancy,ig:26,totg:'Sim'}).includes('totg'));
 assert.deepEqual(selected('pn1',{...pregnancy,ig:NaN}),[]);
 assert.deepEqual(selected('dmgest',{...pregnancy,ig:26,diabetes:'Sim'}),[]);
 assert.ok(selected('dmgest',{...pregnancy,ig:26,diabetes:'Sim',compartilhado:'Sim'}).includes('eco'));
});
test('Toxoplasmose imune e Coombs positivo não entram em repetição automática',()=>{
 for(const kit of ['pn1','pn2','pn3']){const ids=selected(kit,{...pregnancy,ig:26,toxo:'imune',coombs:'positivo'});assert.ok(!ids.includes('toxo'));assert.ok(!ids.includes('coombs'));}
 assert.ok(!selected('pn2',{...pregnancy,ig:22}).includes('coombs'));
 assert.ok(selected('pn2',{...pregnancy,ig:24}).includes('coombs'));
});
test('ITU: gestação, exceção simples, complicação e falha têm kits distintos',()=>{
 assert.deepEqual(selected('itu',pregnancy),['eas','cultura','atb']);
 const adult={scope:'mulher',gestante:'Não',alerta:'Não',ituSimples:'Sim',ituCultura:'Não'};
 assert.deepEqual(selected('itu',adult),[]);
 assert.deepEqual(selected('itu',{...adult,ituSimples:'Não',ituCultura:'Sim'}),['eas','cultura']);
 assert.deepEqual(selected('itu',{...adult,ituSimples:'Não',ituCultura:'falha'}),['eas','cultura','atb']);
 for(const extra of [{scope:'crianca'},{gestante:''},{alerta:''},{ituCultura:'Sim'}])assert.deepEqual(selected('itu',{...adult,...extra}),[]);
 assert.ok(!R.build('itu',pregnancy).items.some(i=>i.group==='Imagem'));
});
test('Corrimento e anticoncepção não viram painéis universais de exames',()=>{
 assert.deepEqual(selected('corrimento',{scope:'mulher',duvida:'Não'}),[]);
 assert.deepEqual(selected('corrimento',{scope:'mulher',duvida:'Sim'}),['fresco']);
 assert.deepEqual(selected('contracepcao',{scope:'mulher',gestante:'Não',cito:'Sim'}),[]);
 assert.deepEqual(selected('gestacao',{scope:'mulher',gestante:'Sim'}),[]);
});
test('Sugestões por queixa respeitam negação e não confirmam diagnóstico',()=>{
 assert.deepEqual(R.suggests('Nega disúria. Sem corrimento.'),[]);
 assert.deepEqual(R.suggests('Disúria sem febre'),['itu']);
 assert.deepEqual(R.suggests('Disúria há dois dias. Corrimento com odor.'),['itu','corrimento']);
 assert.deepEqual(R.suggests('Histórico de ITU. Hoje sem sintomas.'),[]);
 assert.deepEqual(R.suggests('',{gestante:'Sim',ig:32}),['pn3']);
});

test('Cada queixa municipal abre a orientação; negação e gestação conflitante não indicam tratamento',()=>{
 const protocol=require('../assets/protocolo-consulta.js');
 assert.equal(protocol.rules.length,35);
 for(const rule of protocol.rules)assert.ok(protocol.match(rule.title).includes(rule),rule.title);
 for(const text of ['Nega disúria','ITU descartada','Histórico de ITU'])assert.deepEqual(protocol.match(text),[]);
 assert.equal(protocol.match('Disúria sem febre')[0].kit,'itu');
 assert.equal(protocol.urinary({pregnancyConflict:true}).kit,null);
 assert.ok(!protocol.urinary({gestante:'Sim',urgent:true}).treatment);
 assert.ok(!protocol.urinary({child:true}).treatment);
});
test('A orientação distingue pediculose, escabiose e a elegibilidade para esquema adulto',()=>{
 const protocol=require('../assets/protocolo-consulta.js');
 const adult={adult:true,gestante:'Não'};
 assert.equal(protocol.match('Não gestante com ITU')[0].kit,'itu');
 assert.equal(protocol.match('Nega febre e refere disúria')[0].kit,'itu');
 assert.match(protocol.specificCare('Problemas de pele','pediculose',adult),/permetrina 1%/i);
 assert.doesNotMatch(protocol.specificCare('Problemas de pele','escabiose',adult),/permetrina 1%/i);
 assert.equal(protocol.specificCare('Herpes labial','herpes labial',{...adult,gestante:'Sim'}),'');
 assert.match(protocol.urinary({pregnancyConflict:true,urgent:true}).priority,/prioritária/);
});
