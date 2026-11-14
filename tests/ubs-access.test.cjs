const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const sql=fs.readFileSync(require('node:path').join(__dirname,'../supabase/repairs/restrict-ubs.sql'),'utf8');
const ids={a:'00000000-0000-4000-8000-000000000001',b:'00000000-0000-4000-8000-000000000002',admin:'00000000-0000-4000-8000-000000000003',none:'00000000-0000-4000-8000-000000000004',blocked:'00000000-0000-4000-8000-000000000005'};
const A='ESFSB Cosmos',B='EAP Centro de Saúde de Toledo';let db;
test.before(async()=>{
 db=await PGlite.create();await db.exec(`create role anon;create role authenticated;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated,anon;
 create table perfis(user_id uuid primary key,unidade text,permissoes jsonb);
 create table profiles(id uuid primary key,full_name text,nome text,cargo text,conselho text,updated_at timestamptz,unidade text,role text default 'user',perfil text,ativo boolean default true,blocked boolean default false,permissoes jsonb default '{}');
 create table unidades_saude_toledo(nome text primary key,ativa boolean default true);
 create table pacientes(cpf text primary key,dados jsonb default '{}',updated_by uuid);
 create table atendimentos(id serial primary key,paciente_cpf text,unidade text,user_id uuid,soap text);
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
 await as('colega',async()=>{
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
