const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const sql=fs.readFileSync(path.join(__dirname,'../supabase/migrations/202609100001_unidades_toledo.sql'),'utf8');
const admin='00000000-0000-4000-8000-000000000001',user='00000000-0000-4000-8000-000000000002',missing='00000000-0000-4000-8000-000000000003';
let db;
test.before(async()=>{
 db=await PGlite.create();await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table public.perfis(user_id uuid primary key,nome text default '',email text default '',cargo text default '',unidade text default '',permissoes jsonb default '{}'::jsonb,updated_at timestamptz default now());
 create table public.profiles(id uuid primary key,unidade text,updated_at timestamptz default now());
 create function public.usuario_tem_permissao(chave text) returns boolean language sql stable security definer set search_path='' as $$ select coalesce((select (permissoes->>chave)::boolean from public.perfis where user_id=auth.uid()),false) $$;
 grant usage on schema auth to authenticated;grant select,update on public.perfis,public.profiles to authenticated;
 alter table perfis enable row level security;alter table profiles enable row level security;
 create policy own_read on perfis for select to authenticated using (user_id=auth.uid() or public.usuario_tem_permissao('ver_admin'));
 create policy admin_write on perfis for update to authenticated using (public.usuario_tem_permissao('ver_admin'));
 create policy own_profile on profiles for all to authenticated using(id=auth.uid()) with check(id=auth.uid());`);
 for(const id of [admin,user,missing])await db.query('insert into auth.users values($1,$2,$3)',[id,id+'@example.test',JSON.stringify({nome:'Profissional fictício',unidade:'Metadado antigo'})]);
 for(const id of [admin,user]){await db.query('insert into perfis(user_id,unidade,permissoes) values($1,$2,$3)',[id,'Cadastro anterior',JSON.stringify({ver_admin:id===admin,usar_ia_soap:false,unidade_escopo:'Cadastro anterior'})]);await db.query('insert into profiles(id,unidade) values($1,$2)',[id,'Cadastro anterior']);}
 await db.exec(sql);await db.exec(sql);
});
test.after(async()=>db.close());
async function as(id,fn){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role authenticated');try{return await fn();}finally{await db.exec('reset role');}}
const update=(id,unit)=>db.query('select public.admin_definir_unidade($1,$2) as unidade',[id,unit]);
test('Unidades: catálogo municipal tem 43 entradas e migração é reaplicável',async()=>{assert.equal((await db.query('select count(*)::int as n from unidades_saude_toledo')).rows[0].n,43);});
test('Unidades: administrador altera outra conta sem substituir permissões',async()=>{
 const result=await as(admin,()=>update(user,'ESFSB Cosmos'));assert.equal(result.rows[0].unidade,'ESFSB Cosmos');
 const p=(await db.query('select unidade,permissoes from perfis where user_id=$1',[user])).rows[0];assert.equal(p.unidade,'ESFSB Cosmos');assert.equal(p.permissoes.unidade_escopo,p.unidade);assert.equal(p.permissoes.ver_admin,false);assert.equal(p.permissoes.usar_ia_soap,false);
 assert.equal((await db.query('select unidade from profiles where id=$1',[user])).rows[0].unidade,p.unidade);
});
test('Unidades: administrador escolhe a própria unidade e pode deixar sem definição',async()=>{await as(admin,()=>update(admin,'EAP Boa Vista'));await as(admin,()=>update(admin,''));assert.equal((await db.query('select unidade from perfis where user_id=$1',[admin])).rows[0].unidade,'');});
test('Unidades: usuário comum e chamada sem sessão não podem usar a função',async()=>{for(const id of [user,''])await as(id,()=>assert.rejects(update(user,'EAP Boa Vista'),e=>e.code==='42501'));});
test('Unidades: atualização direta do próprio profile também é recusada',async()=>{await as(user,()=>assert.rejects(db.query('update profiles set unidade=$1 where id=$2',['EAP Boa Vista',user]),e=>e.code==='42501'));assert.equal((await db.query('select unidade from profiles where id=$1',[user])).rows[0].unidade,'ESFSB Cosmos');});
test('Unidades: unidade inexistente e conta inexistente não provocam alterações parciais',async()=>{
 await as(admin,()=>assert.rejects(update(user,'Unidade inventada'),e=>e.code==='22023'));
 await as(admin,()=>assert.rejects(update('00000000-0000-4000-8000-000000000099','EAP Boa Vista'),e=>e.code==='P0002'));
 assert.equal((await db.query('select unidade from perfis where user_id=$1',[user])).rows[0].unidade,'ESFSB Cosmos');
});
test('Unidades: perfil ausente é criado sem conceder administração',async()=>{await as(admin,()=>update(missing,'EAP Boa Vista'));const p=(await db.query('select unidade,permissoes from perfis where user_id=$1',[missing])).rows[0];assert.equal(p.unidade,'EAP Boa Vista');assert.equal(p.permissoes.ver_admin,undefined);});
test('Unidades: cliente não pode adulterar o catálogo',async()=>{await as(admin,()=>assert.rejects(db.query("update unidades_saude_toledo set nome='Adulterado' where codigo='9002995'"),e=>e.code==='42501'));});
