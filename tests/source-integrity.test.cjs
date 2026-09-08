const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const repo=path.resolve(__dirname,'..');
test('arquivos referenciados existem e todos os scripts clássicos compilam',()=>{
 const html=fs.readFileSync(path.join(repo,'index.html'),'utf8');let checked=0;
 for(const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)){
  if(/^https?:/.test(m[1]))continue;
  const file=path.resolve(repo,m[1]);assert.ok(fs.existsSync(file),m[1]);new vm.Script(fs.readFileSync(file,'utf8'),{filename:m[1]});checked++;
 }
 assert.ok(checked>=10);
 for(const m of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css)["']/g))if(!/^https?:/.test(m[1]))assert.ok(fs.existsSync(path.resolve(repo,m[1])),m[1]);
});
test('leitores PDF desativam eval conforme mitigação CVE-2024-4367',()=>{
 const source=fs.readFileSync(path.join(repo,'assets/app/clinical-app.js'),'utf8');
 const reads=[...source.matchAll(/pdfjsLib\.getDocument\(\{([^}]+)\}\)/g)];assert.equal(reads.length,2);
 for(const read of reads)assert.match(read[1],/isEvalSupported\s*:\s*false/);
});
