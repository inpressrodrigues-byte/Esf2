const test=require('node:test'),assert=require('node:assert/strict');
const {transmitir}=require('../scripts/pec-ledi.cjs');
const dados={base:'https://homologacao.invalid/pec/',usuario:'ficticio',senha:'ficticia',nome:'0000007-cfdd9b1b-2c4d-4759-b254-76564ec219f3.esus',bytes:Buffer.from([128,0,2])};
test('LEDI preserva binário, UUID, contexto da instalação e sessão',async()=>{
  const paths=[];
  const r=await transmitir(dados,async(url,init)=>{
    paths.push(url);assert.equal(init.method,'POST');assert.equal(init.redirect,'error');
    if(paths.length===1){assert.equal(init.body.get('usuario'),dados.usuario);assert.equal(init.body.get('senha'),dados.senha);return new Response('',{headers:{'Set-Cookie':'JSESSIONID=teste; Secure; HttpOnly'}});}
    assert.equal(init.headers.Cookie,'JSESSIONID=teste');const file=init.body.get('ficha');assert.equal(file.name,dados.nome);
    assert.deepEqual(Buffer.from(await file.arrayBuffer()),dados.bytes);return new Response('');
  });
  assert.deepEqual(paths,['https://homologacao.invalid/pec/api/recebimento/login','https://homologacao.invalid/pec/api/v1/recebimento/ficha']);assert.equal(r.http,200);
});
test('LEDI impede URL insegura, ausência de sessão e reenvio automático',async()=>{
  await assert.rejects(transmitir({...dados,base:'http://teste'},()=>assert.fail()),/HTTPS/);
  await assert.rejects(transmitir(dados,async()=>new Response('')),/JSESSIONID/);
  let n=0;await assert.rejects(transmitir(dados,async()=>{if(++n===1)return new Response('',{headers:{'Set-Cookie':'JSESSIONID=teste'}});throw Error('sem conexão');}),/incerto/);assert.equal(n,2);
});
