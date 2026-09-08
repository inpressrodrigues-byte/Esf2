/* Nunca substitui regras clínicas automaticamente. Mudança de fonte falha a conferência. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const repo=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(repo,'protocols/manifest.json'),'utf8'));
async function run(){
 const ids=new Set();for(const s of manifest.sources){assert.equal(new URL(s.url).hostname,'www.toledo.pr.gov.br');assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.pages>0);assert.ok(!ids.has(s.id));ids.add(s.id);}
 const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(repo,'assets/protocol-data.js'),'utf8'),box);assert.equal(JSON.stringify(box.window.ESFProtocolSources),JSON.stringify(manifest));
 console.log(`${manifest.sources.length} fontes com URL, hash e páginas; catálogo consistente.`);
 if(process.argv.includes('--offline'))return;
 const results={checkedAt:new Date().toISOString(),portal:manifest.portal,sources:[],addedLinks:[],removedLinks:[]};
 const old=new Set(manifest.sources.flatMap(s=>[s.url,...(s.aliases||[])]));
 const get=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return r;};
 try{const html=await(await get(manifest.portal)).text();const links=new Set([...html.matchAll(/href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi)].map(m=>new URL(m[1].replace(/&amp;/g,'&'),manifest.portal).href));results.addedLinks=[...links].filter(u=>!old.has(u));results.removedLinks=[...old].filter(u=>!links.has(u));}catch(e){results.portalError=e.message;}
 let index=0;
 await Promise.all(Array.from({length:4},async()=>{while(index<manifest.sources.length){const s=manifest.sources[index++];try{const bytes=Buffer.from(await(await get(s.url)).arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');const hash=crypto.createHash('sha256').update(bytes).digest('hex');results.sources.push({id:s.id,status:hash===s.sha256?'igual':'alterado',sha256:hash});}catch(e){results.sources.push({id:s.id,status:'indisponivel',error:e.message});}}}));
 const dir=path.join(repo,'test-results');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'protocols-live.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({same:results.sources.filter(s=>s.status==='igual').length,changed:results.sources.filter(s=>s.status==='alterado').length,unavailable:results.sources.filter(s=>s.status==='indisponivel').length,added:results.addedLinks.length,removed:results.removedLinks.length,portalError:results.portalError}));
 if(results.portalError||results.sources.some(s=>s.status!=='igual')||results.addedLinks.length||results.removedLinks.length)process.exitCode=1;
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
