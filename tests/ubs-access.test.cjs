const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const sql=fs.readFileSync(require('node:path').join(__dirname,'../supabase/repairs/restrict-ubs.sql'),'utf8');
const ids={a:'00000000-0000-4000-8000-000000000001',b:'00000000-0000-4000-8000-000000000002',admin:'00000000-0000-4000-8000-000000000003',none:'00000000-0000-4000-8000-000000000004',blocked:'00000000-0000-4000-8000-000000000005'};
const A='ESFSB Cosmos',B='EAP Centro de Saúde de Toledo';let db;
test.before(async()=>{
 db=await PGlite.create();await db.exec(`create role anon;create role authenticated;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select nullif(current_setting('request.jwt.claims',true),'')::jsonb$$;
 grant usage on schema auth to authenticated,anon;
 create table perfis(user_id uuid primary key,unidade text,permissoes jsonb);
 create table profiles(id uuid primary key,full_name text,nome text,cargo text,conselho text,updated_at timestamptz,unidade text,role text default 'user',perfil text,ativo boolean default true,blocked boolean default false,permissoes jsonb default '{}');
 create table unidades_saude_toledo(nome text primary key,ativa boolean default true);
 create table pacientes(cpf text primary key,dados jsonb default '{}',updated_by uuid);
 create table atendimentos(id serial primary key,paciente_cpf text,unidade text,user_id uuid,soap text,data text);
 create function usuario_tem_permissao(chave text) returns boolean language sql stable security definer set search_path='' as $$select coalesce((select(permissoes->>chave)::boolean from public.perfis where user_id=auth.uid()),false)$$;
 grant select on perfis to authenticated;grant usage on all sequences in schema public to authenticated;
 alter table perfis enable row level security;create policy perfil_own on perfis for select to authenticated using(user_id=auth.uid());
 alter table pacientes enable row level security;create policy insecure_read on pacientes for all to authenticated using(true) with check(true);
 grant all on pacientes,profiles,atendimentos to authenticated,anon;
 insert into unidades_saude_toledo(nome) values ('${A}'),('${B}');`);
 for(const [name,id]of Object.entries(ids)){
  const unit=['a','blocked'].includes(name)?A:name==='b'?B:null;
  await db.query('insert into profiles(id,unidade,blocked,perfil) values($1,$2,$3,$4)',[id,unit,name==='blocked',name==='admin'?'gerente_municipio':'enfermeiro']);
  await db.query('insert into perfis values($1,$2,$3)',[id,unit,JSON.stringify({ver_admin:name==='admin',nivel_acesso:name==='admin'?'gerente_municipal':'enfermeiro',unidade_escopo:unit})]);
 }
 await db.query('insert into pacientes values($1,$2,$3),($4,$2,$5),($6,$2,$3)',['11111111111','{}',ids.a,'22222222222',ids.b,'33333333333']);
 await db.query('insert into atendimentos(paciente_cpf,unidade,user_id) values($1,$2,$3),($4,$5,$6)', ['11111111111','ESF cosmos',ids.a,'22222222222',B,ids.b]);
 await db.exec(sql);await db.exec(sql);
});
test.after(async()=>db.close());
test('Equipe da UBS compartilha agenda, mantém histórico e protege vaga, versão, dose e território',async()=>{
 const migration=fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611130001_agenda_ubs.sql'),'utf8');
 await db.exec(migration);
 const colega='00000000-0000-4000-8000-000000000009';
 await db.query('insert into profiles(id,unidade,perfil) values($1,$2,$3)',[colega,A,'enfermeiro']);
 await db.query('insert into perfis values($1,$2,$3)',[colega,A,JSON.stringify({unidade_escopo:A,ver_historico:true})]);
 ids.colega=colega;
 await db.query("update perfis set permissoes=permissoes||'{\"ver_historico\":true}' where user_id in ($1,$2)",[ids.a,ids.b]);
 const insert="insert into agenda_ubs(unidade,cpf,estado,profissional,horario,motivo) values($1,$2,'Agendado','Enfermeira','2026-11-10 12:00Z','Retorno fictício') returning id";
 let id;
 await as('a',async()=>{
   id=(await db.query(insert,[A,'11111111111'])).rows[0].id;
   await assert.rejects(db.query(insert,[A,'11111111111']),/unique/i);
   await assert.rejects(db.query(insert,[B,'22222222222']),/row-level/);
   await assert.rejects(db.query("insert into acoes_ubs(unidade,cpf,tipo,dia,descricao,dose) values($1,'11111111111','Dose aplicada','2026-01-02','Exemplo','1')",[A]),/check constraint/i);
   await db.query("insert into acoes_ubs(unidade,cpf,tipo,dia,descricao,dose,lote,fabricante) values($1,'11111111111','Dose aplicada','2026-01-02','Exemplo','1','X','Y')",[A]);
   await db.query("insert into acoes_ubs(unidade,tipo,dia,descricao,participantes,participantes_cpf) values($1,'Atividade coletiva','2026-01-02','Grupo',2,array['11111111111'])",[A]);
   await assert.rejects(db.query("insert into acoes_ubs(unidade,tipo,dia,descricao,participantes,participantes_cpf) values($1,'Atividade coletiva','2026-01-02','Grupo',2,array['22222222222'])",[A]),/participantes/);
   const imovel=(await db.query("insert into imoveis_ubs(unidade,microarea,endereco) values($1,'01','Teste local') returning id",[A])).rows[0].id;
   await assert.rejects(db.query("update imoveis_ubs set ativo=false where id=$1",[imovel]),/motivo/);
   await db.query("update imoveis_ubs set ativo=false,justificativa='Duplicidade' where id=$1 and versao=1",[imovel]);
 });
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611140001_prontuario_ubs.sql'),'utf8'));
 await as('colega',async()=>{
   assert.deepEqual((await db.query('select paciente_cpf from atendimentos')).rows.map(r=>r.paciente_cpf),['11111111111']);
   assert.equal((await db.query("update atendimentos set soap='alterado' returning id")).rows.length,0);
   assert.equal((await db.query('delete from atendimentos returning id')).rows.length,0);
   for(const [i,est] of ['Aguardando atendimento','Em escuta','Compartilhado','Respondido','Concluído'].entries()){
     assert.equal((await db.query("update agenda_ubs set estado=$1,devolutiva='Anotação fictícia' where id=$2 and versao=$3 returning versao",[est,id,i+1])).rows[0].versao,i+2);
   }
   assert.equal((await db.query('select * from agenda_ubs_historico where agenda_id=$1',[id])).rows.length,6);
   assert.equal((await db.query("update agenda_ubs set estado='Cancelado' where id=$1 and versao=1 returning id",[id])).rows.length,0);
 });
 for(const who of ['b','blocked','none'])await as(who,async()=>{
   for(const table of ['agenda_ubs','agenda_ubs_historico','acoes_ubs','imoveis_ubs'])assert.equal((await db.query('select * from '+table)).rows.length,0);
 });
});
async function as(who,fn){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[who]||'']);await db.exec('set role '+(who==='anon'?'anon':'authenticated'));try{return await fn();}finally{await db.exec('reset role');}}
test('Agenda individual valida vagas, sobreposição, reagendamento e triagem antes da consulta',async()=>{
 await db.exec('alter table public.perfis add column nome text');
 await db.query('update perfis set nome=$1 where user_id=$2',['Nome A',ids.a]);
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611140002_agenda_triagem.sql'),'utf8'));
 let first,second,id;
 await as('a',async()=>{
   const add="insert into agenda_horarios(unidade,profissional,inicio,duracao) values($1,'Nome A',$2,30) returning id";
   first=(await db.query(add,[A,'2099-09-10 09:00Z'])).rows[0].id;
   await assert.rejects(db.query(add,[A,'2099-09-10 09:15Z']),/unique/i);
   second=(await db.query(add,[A,'2099-09-10 10:00Z'])).rows[0].id;
 });
 await as('colega',async()=>{
   const book="insert into agenda_ubs(unidade,cpf,estado,profissional,horario,horario_id,motivo) values($1,'11111111111','Agendado','Nome A',$2,$3,'Retorno') returning id";
   await assert.rejects(db.query(book,[A,'2099-09-10 09:15Z',first]),/horário/i);
   id=(await db.query(book,[A,'2099-09-10 09:00Z',first])).rows[0].id;
   await assert.rejects(db.query(book,[A,'2099-09-10 09:00Z',first]),/unique/i);
   await db.query("update agenda_ubs set horario_id=$1,horario='2099-09-10 10:00Z' where id=$2",[second,id]);
   await db.query("update agenda_ubs set estado='Aguardando atendimento' where id=$1",[id]);
   await assert.rejects(db.query("update agenda_ubs set estado='Em atendimento' where id=$1",[id]),/Transição/);
   await db.query("update agenda_ubs set estado='Em escuta' where id=$1",[id]);
   await assert.rejects(db.query("update agenda_ubs set estado='Triagem concluída' where id=$1",[id]),/medidas/);
   await db.query("update agenda_ubs set estado='Triagem concluída',triagem=$1 where id=$2",[JSON.stringify({pas:'120',pad:'80'}),id]);
 });
 await as('a',async()=>{const r=(await db.query("update agenda_ubs set estado='Em atendimento' where id=$1 returning triagem,triado_por",[id])).rows[0];assert.equal(r.triagem.pas,'120');assert.equal(r.triado_por,ids.colega);});
 await as('b',async()=>assert.equal((await db.query('select * from agenda_horarios')).rows.length,0));
});
test('Monitor exibe somente chamadas recentes da UBS e fecha após a revogação; cancelamento libera a vaga',async()=>{
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611140003_chamador.sql'),'utf8'));
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611160001_chamador_nome.sql'),'utf8'));
 await db.exec("alter table public.perfis add column cargo text");
 await db.query("update perfis set cargo='Enfermeira' where user_id=$1",[ids.a]);
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611160002_painel_historico_agenda.sql'),'utf8'));
 await db.exec("update pacientes set dados=jsonb_set(dados,'{nome}',to_jsonb('Pessoa Fictícia'::text)) where cpf='11111111111'");
 const call="select agenda_chamar($1,$2,'Sala 2',$3,$4) id";
 const agenda=(await db.query("select id,versao from agenda_ubs where estado='Em atendimento'")).rows[0];
 let token,other;
 await as('a',async()=>{
   token=(await db.query('select agenda_painel_configurar($1,false) chave',[A])).rows[0].chave;
   await assert.rejects(db.query('select agenda_painel_configurar($1,false)',[B]),/privilege/i);
   await assert.rejects(db.query(call,[agenda.id,'Triagem',ids.a,agenda.versao]),/Etapa/);
   await db.query(call,[agenda.id,'Atendimento',ids.a,agenda.versao]);
   await db.query(call,[agenda.id,'Atendimento',ids.a,agenda.versao]);
   await assert.rejects(db.query(call,[agenda.id,'Atendimento',ids.none,agenda.versao]),/Aguarde/);
   const row=(await db.query("insert into agenda_ubs(unidade,cpf,profissional,motivo,estado) values($1,'11111111111','Nome A','teste','Aguardando atendimento') returning id,versao",[A])).rows[0];
   await db.query("update agenda_ubs set profissional='Profissional B',estado='Em escuta' where id=$1",[row.id]);
   await db.query("select agenda_chamar($1,'Triagem','Sala 2',$2,$3,'agenda')",[row.id,ids.colega,row.versao+1]);
   const slot=(await db.query("select id,inicio from agenda_horarios order by inicio limit 1")).rows[0];
   const book="insert into agenda_ubs(unidade,cpf,profissional,motivo,estado,horario,horario_id) values($1,'11111111111','Nome A','teste','Agendado',$2,$3) returning id";
   const ag=(await db.query(book,[A,slot.inicio,slot.id])).rows[0];
   await db.query("update agenda_ubs set estado='Cancelado' where id=$1",[ag.id]);await db.query(book,[A,slot.inicio,slot.id]);
 });
 await as('b',async()=>{other=(await db.query('select agenda_painel_configurar($1,false) chave',[B])).rows[0].chave;await assert.rejects(db.query(call,[agenda.id,'Atendimento',ids.b,agenda.versao]),/indisponível/);});
 const read=async t=>(await db.query('select agenda_painel_ler($1) painel',[t])).rows[0].painel;
 await as('anon',async()=>{
   assert.equal((await read(other)).chamadas.length,0);
   const calls=(await read(token)).chamadas;assert.equal(calls.length,2);assert.equal(calls[0].paciente,'Pessoa Fictícia');assert.equal(calls[0].profissional,'Profissional B');
   assert.deepEqual(Object.keys(calls[0]).sort(),['cargo','etapa','hora','id','paciente','profissional','sala']);
   assert.equal(calls[0].cargo,null);assert.equal(calls[1].cargo,'Enfermeira');
   const hist=(await read(token)).historico;assert.equal(hist.length,2);
   assert.equal(hist[0].quemChamou,'Nome A');assert.equal(hist[0].etapa,'Triagem');
   assert.deepEqual((await read(other)).historico,[]);
   await assert.rejects(db.query('select * from prumo_painel.chamadas'),/permission denied/);
   await assert.rejects(db.query(call,[agenda.id,'Atendimento',ids.a,agenda.versao]),/permission denied/);
 });
 await db.query("update perfis set nome=' ' where user_id=$1",[ids.a]);
 await db.query("delete from prumo_painel.chamadas where agenda=$1",[agenda.id]);
 await as('a',async()=>{
   await assert.rejects(db.query(call,[agenda.id,'Atendimento',ids.a,agenda.versao]),/sem nome cadastrado/);
   await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({user_metadata:{nome:'Nome de teste do login'}})]);
   await db.query(call,[agenda.id,'Atendimento',ids.a,agenda.versao]);
   await db.exec("reset request.jwt.claims");
 });
 await as('anon',async()=>assert.equal((await read(token)).chamadas[0].profissional,'Nome de teste do login'));
 await as('a',async()=>{await db.query("update agenda_ubs set estado='Cancelado' where id=$1",[agenda.id]);});
 await as('anon',async()=>{assert.equal((await read(token)).historico.length,1);assert.equal((await read(token)).chamadas.length,1);});
 await as('a',()=>db.query('select agenda_painel_configurar($1,true)',[A]));
 await as('anon',()=>assert.rejects(read(token),/privilege/i));
});
test('UBS: leitura separada por unidade; sem UBS e bloqueado não leem; gestão vê pendentes',async()=>{
 for(const [who,expected]of [['a',['11111111111']],['b',['22222222222']],['none',[]],['blocked',[]],['admin',['11111111111','22222222222','33333333333']]])await as(who,async()=>assert.deepEqual((await db.query('select cpf from pacientes order by cpf')).rows.map(r=>r.cpf),expected));
 await as('anon',()=>assert.rejects(db.query('select * from pacientes'),/permission denied/));
});
test('UBS: cadastro novo assume UBS do profissional; outra UBS e conta sem UBS são recusadas',async()=>{
 await as('a',async()=>{await db.query('insert into pacientes(cpf,dados,updated_by) values($1,$2,$3)',['44444444444','{}',ids.a]);assert.equal((await db.query("select unidade from pacientes where cpf='44444444444'")).rows[0].unidade,A);await assert.rejects(db.query('insert into pacientes(cpf,unidade,updated_by) values($1,$2,$3)',['55555555555',B,ids.a]),/row-level security/);});
 await as('none',()=>assert.rejects(db.query('insert into pacientes(cpf,unidade,updated_by) values($1,$2,$3)',['55555555555',A,ids.none]),/row-level security/));
});
test('UBS: não altera paciente alheio, não transfere, não forja unidade no JSON nem toma CPF via upsert',async()=>{
 await as('a',async()=>{
  assert.equal((await db.query("update pacientes set dados='{}' where cpf='22222222222' returning cpf")).rows.length,0);
  await assert.rejects(db.query("update pacientes set unidade=$1 where cpf='11111111111'",[B]),/transferir/);
  await db.query("update pacientes set dados=$1,updated_by=$2 where cpf='11111111111'",[JSON.stringify({unidade:B}),ids.a]);assert.equal((await db.query("select dados->>'unidade' u from pacientes where cpf='11111111111'")).rows[0].u,A);
  await assert.rejects(db.query('insert into pacientes(cpf,unidade,updated_by) values($1,$2,$3) on conflict(cpf) do update set unidade=excluded.unidade,updated_by=excluded.updated_by',['22222222222',A,ids.a]),/row-level security|transferir/);
 });
});
test('UBS: perfil não permite autoelevação de privilégios nem autoatribuição de unidade',async()=>{
 await as('a',async()=>{
  for(const [key,value]of [['perfil','gerente_municipio'],['role','admin'],['unidade',B],['ativo',false],['blocked',true]])await assert.rejects(db.query(`update profiles set ${key}=$1 where id=$2`,[value,ids.a]),/Somente a administração/);
  await assert.rejects(db.query('insert into profiles(id,perfil) values($1,$2)',[ids.none,'gerente_municipio']),/permission denied/);
  await db.query('update profiles set full_name=$1 where id=$2',['Nome fictício',ids.a]);
 });
});
test('UBS: atendimentos próprios em outra unidade não escapam pela política antiga',async()=>{
 await db.query('insert into atendimentos(paciente_cpf,unidade,user_id) values($1,$2,$3)',['22222222222',B,ids.a]);
 await as('a',async()=>{const rows=(await db.query('select unidade from atendimentos')).rows;assert.equal(rows.length,1);assert.ok(rows.every(r=>r.unidade===A));await assert.rejects(db.query('insert into atendimentos(unidade,user_id) values($1,$2)',[B,ids.a]),/row-level security/);});
});
test('UBS: gestão vincula e transfere; unidade anterior perde acesso; conta bloqueada não ganha exceção municipal',async()=>{
 await as('admin',()=>db.query("update pacientes set unidade=$1,updated_by=$2 where cpf in ('11111111111','33333333333')",[B,ids.admin]));
 await as('a',async()=>assert.equal((await db.query("select cpf from pacientes where cpf='11111111111'")).rows.length,0));
 await as('b',async()=>assert.equal((await db.query("select cpf from pacientes where cpf in ('11111111111','33333333333')")).rows.length,2));
 await db.query("update perfis set permissoes=permissoes||'{\"ver_admin\":true}' where user_id=$1",[ids.blocked]);
 await as('blocked',async()=>assert.equal((await db.query('select cpf from pacientes')).rows.length,0));
});
test('Consultório particular mantém pacientes e agenda restritos ao local e à administração',async()=>{
 await db.exec("alter table unidades_saude_toledo add column codigo text,add column grupo text default 'Rede pública',add column fonte text; grant select on unidades_saude_toledo to authenticated;");
 await db.exec(fs.readFileSync(require('node:path').join(__dirname,'../supabase/migrations/202611170001_consultorios_particulares.sql'),'utf8'));
 const office='Consultório particular de teste';
 await db.query("insert into unidades_saude_toledo(nome,grupo) values($1,'Consultórios particulares')",[office]);
 await db.query("update perfis set unidade=$1,permissoes=jsonb_set(permissoes,'{unidade_escopo}',to_jsonb($1::text)) where user_id=$2",[office,ids.a]);
 await db.query("update profiles set unidade=$1 where id=$2",[office,ids.a]);
 await as('a',async()=>{
   await db.query('insert into pacientes(cpf,updated_by) values($1,$2)',['77777777777',ids.a]);
   await db.query("insert into agenda_ubs(unidade,cpf,profissional,motivo,estado) values($1,'77777777777','Profissional fictício','Retorno','Aguardando atendimento')",[office]);
   assert.deepEqual((await db.query('select cpf from pacientes')).rows.map(r=>r.cpf),['77777777777']);
 });
 await db.query("update perfis set permissoes=permissoes||'{\"nivel_acesso\":\"gerente_municipal\"}' where user_id=$1",[ids.b]);
 for(const who of ['b','colega','blocked'])await as(who,async()=>{
   assert.equal((await db.query("select cpf from pacientes where cpf='77777777777'")).rows.length,0);
   assert.equal((await db.query('select id from agenda_ubs where unidade=$1',[office])).rows.length,0);
 });
 await as('admin',async()=>assert.equal((await db.query("select cpf from pacientes where cpf='77777777777'")).rows.length,1));
});
