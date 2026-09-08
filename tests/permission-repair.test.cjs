const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const sql=fs.readFileSync(path.join(__dirname,'../supabase/repairs/autorizar-ia-proprietario.sql'),'utf8');
const owner='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
let db,create;
test.before(async()=>{db=await PGlite.create();create=(await import('../supabase/functions/clever-processor/handler.mjs')).createCleverProcessor;});
test.after(async()=>{await db.close();});
async function setup({confirmed=true,profile=true,permissions={usar_ia_soap:false,ver_admin:false,unidade_escopo:'Unidade fictícia'},columnType='jsonb'}={}){
 await db.exec(`drop table if exists public.perfis; drop schema if exists auth cascade;
 create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create table public.perfis(user_id uuid,email text not null default '',permissoes ${columnType} default '{"ver_admin":false,"ver_historico":true,"usar_modo_teste":false,"gerar_documentos":true,"editar_protocolos":false}');`);
 await db.query('insert into auth.users values ($1,$2,$3),($4,$5,now())',[owner,'inpress.rodrigues@gmail.com',confirmed?'2026-01-01T00:00:00Z':null,other,'outra-conta@example.test']);
 await db.query('insert into public.perfis (user_id,permissoes) values ($1,$2)',[other,JSON.stringify({usar_ia_soap:false,ver_admin:false})]);
 if(profile)await db.query('insert into public.perfis (user_id,permissoes) values ($1,$2)',[owner,permissions===null?null:JSON.stringify(permissions)]);
}
const profiles=async()=>JSON.stringify((await db.query('select user_id,permissoes from public.perfis order by user_id')).rows);
async function rejectedWithoutChanges(){const before=await profiles();await assert.rejects(db.exec(sql));await db.exec('rollback');assert.equal(await profiles(),before);}
test('Reparo PostgreSQL: autoriza só IA do proprietário e é idempotente',async()=>{
 await setup();await db.exec(sql);const after=await profiles();await db.exec(sql);assert.equal(await profiles(),after);
 const rows=(await db.query('select user_id,permissoes from public.perfis order by user_id')).rows;
 assert.deepEqual(rows[0].permissoes,{usar_ia_soap:true,ver_admin:false,unidade_escopo:'Unidade fictícia'});
 assert.deepEqual(rows[1].permissoes,{usar_ia_soap:false,ver_admin:false});
});
test('Reparo PostgreSQL: suporta coluna JSON e permissões SQL NULL',async()=>{
 for(const columnType of ['json','jsonb']){await setup({permissions:null,columnType});await db.exec(sql);assert.deepEqual((await db.query('select permissoes from public.perfis where user_id=$1',[owner])).rows[0].permissoes,{usar_ia_soap:true});}
});
test('Reparo PostgreSQL: cria somente o perfil ausente da conta confirmada, sem administração',async()=>{
 await setup({profile:false});await db.exec(sql);
 const result=(await db.query('select user_id,email,permissoes from public.perfis where user_id=$1',[owner])).rows;
 assert.equal(result.length,1);assert.equal(result[0].email,'inpress.rodrigues@gmail.com');
 assert.deepEqual(result[0].permissoes,{usar_ia_soap:true,ver_admin:false,ver_historico:true,usar_modo_teste:false,gerar_documentos:true,editar_protocolos:false});
 await db.exec(sql);assert.equal((await db.query('select count(*) from public.perfis')).rows[0].count,2);
});
test('Reparo PostgreSQL: perfil duplicado não permite alteração parcial',async()=>{
 await setup();await db.query('insert into public.perfis (user_id,permissoes) values ($1,$2)',[owner,'{}']);await rejectedWithoutChanges();
});
test('Reparo PostgreSQL: conta não confirmada ou duplicada é recusada',async()=>{
 await setup({confirmed:false});await rejectedWithoutChanges();await setup();await db.query('update auth.users set email=$1 where id=$2',['INPRESS.RODRIGUES@gmail.com',other]);await rejectedWithoutChanges();
});
test('Reparo PostgreSQL: permissões malformadas são preservadas e recusadas',async()=>{
 for(const permissions of [[],true,'admin']){await setup({permissions});await rejectedWithoutChanges();}
});
test('Reparo e API: 403 vira geração autorizada só para a conta corrigida',async()=>{
 await setup();let providerCalls=0;
 const env=k=>({SUPABASE_URL:'https://project.test',SUPABASE_ANON_KEY:'synthetic-public',GEMINI_API_KEY:'synthetic-secret'}[k]||'');
 const handler=create({env,fetchImpl:async(url,options)=>{
  const userId=options.headers.Authorization==='Bearer owner-session'?owner:other;
  if(url.includes('/auth/v1/'))return Response.json({id:userId});
  if(url.includes('/perfis?'))return Response.json((await db.query('select permissoes from public.perfis where user_id=$1',[userId])).rows);
  if(url.includes('/rpc/'))return Response.json(true);
  providerCalls++;return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'S: Teste fictício. O: Não avaliado. A: Teste. P: Revisar.'}]}}]});
 }});
 const request=token=>new Request('https://function.test',{method:'POST',headers:{Authorization:'Bearer '+token,Origin:'https://esf2.vercel.app','Content-Type':'application/json'},body:JSON.stringify({tipoAcao:'testar_conexao'})});
 let response=await handler(request('owner-session'));assert.equal(response.status,403);assert.equal((await response.json()).codigo,'IA_NOT_ALLOWED');assert.equal(providerCalls,0);
 await db.exec(sql);response=await handler(request('owner-session'));assert.equal(response.status,200);assert.equal((await response.json()).data.modoTeste,true);assert.equal(providerCalls,1);
 assert.equal((await handler(request('other-session'))).status,403);assert.equal(providerCalls,1);
});
