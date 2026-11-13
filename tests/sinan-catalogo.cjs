const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {PDFDocument, PDFRawStream, decodePDFRawStream} = require('../vendor/pdf-lib.min.js');

function textoGerado(pagina) {
  const conteudo = pagina.node.Contents();
  const ultimo = conteudo instanceof PDFRawStream ? conteudo : conteudo.lookup(conteudo.size()-1);
  const comandos = Buffer.from(decodePDFRawStream(ultimo).decode()).toString('latin1');
  return [...comandos.matchAll(/1 0 0 1 ([\d.-]+) ([\d.-]+) Tm\s*<([\da-f]+)> Tj/gi)]
    .map(([,x,y,hex])=>({x:+x,topo:pagina.getHeight()-Number(y),texto:Buffer.from(hex,'hex').toString('latin1')}));
}

module.exports = async function conferirCatalogo(page, modelos) {
  const diagnostico = ['aids-adulto','aids-crianca','crianca-hiv','gestante-hiv'];
  const acidentes = ['ac-trabalho','material-biologico'];
  const umaPagina = ['gestante-hiv','toxoplasmose-adquirida'];
  const saida = process.env.ESF_SINAN_AMOSTRAS;
  if (saida) await fs.mkdir(saida,{recursive:true});
  for (const id of modelos.filter(m=>m!=='sifilis-adquirida')) {
    await page.selectOption('#sinan-ficha-modelo',id);
    const evento = diagnostico.includes(id)?'data-diagnostico':acidentes.includes(id)?'data-acidente':
      id==='antirrabico'?'data-atendimento':'primeiros-sintomas';
    assert.equal(await page.locator('#sinan-'+evento).isEnabled(),true,id);
    assert.equal(await page.inputValue('#sinan-tipo'),'2',id);
    const preenchidos = await page.evaluate(({id,evento})=>{
      const dados = {nome:'Pessoa fictícia para conferência do impresso',mae:'Mãe fictícia de demonstração',
        bairro:'Bairro de teste',logradouro:'Rua de demonstração','data-notif':'2026-11-12',
        'data-acidente':'2026-10-05','data-atendimento':'2026-10-06','data-diagnostico':'2026-10-07',
        'primeiros-sintomas':'2026-10-08',nasc:'2000-09-01',idade:'26','idade-unidade':'4',
        sexo:id==='gestante-hiv'?'F':'M',gestante:id==='gestante-hiv'?'2':'6',cns:'123456789012345',
        escolaridade:'10',raca:'4',unidade:'Unidade fictícia','unidade-cod':'1234567',
        'num-notificacao':'000000012345',distrito:'Distrito de teste',numero:'123',complemento:'Bloco fictício',
        geo1:'A',geo2:'B',referencia:'Referência fictícia',cep:'12345-678',telefone:'(45) 98765-4321',
        zona:'1','logradouro-cod':'123456','notificante-nome':'Profissional fictício','notificante-funcao':'Enfermeiro',
        'notificante-unidade':'Unidade fictícia','esp-resumo':'Caso fictício de impressão','esp-data-investigacao':'2026-11-11'};
      for(const [campo,valor] of Object.entries(dados))sinanSet('sinan-'+campo,valor);
      const livres=[];
      for(const [i,el] of [...document.querySelectorAll('#sinan-campos-especificos .sinan-esp-field')].entries()){
        if(el.tagName==='SELECT')el.selectedIndex=1;
        else if(el.type==='date')el.value='2026-10-05';
        else if(el.type==='time')el.value='12:34';
        else {el.value='Registro demonstrativo '+String(i+1).padStart(2,'0');livres.push(el.value);}
      }
      return {livres,nome:dados.nome,data:sinanData(dados[evento]),valida:sinanValidar()};
    },{id,evento});
    assert.equal(preenchidos.valida,true,id);
    const [download]=await Promise.all([page.waitForEvent('download',{timeout:10000}),page.evaluate(()=>gerarFichaSinanEspecifica())]);
    const bytes=await fs.readFile(await download.path());
    if(saida) await fs.writeFile(path.join(saida,id+'.pdf'),bytes);
    const doc=await PDFDocument.load(bytes);
    const folhas=doc.getPages(), marcas=folhas.map(textoGerado);
    const frente=marcas[0], nome=frente.find(m=>m.texto===preenchidos.nome);
    assert.ok(nome && nome.x>45 && nome.x<80,id);
    const datas=frente.filter(m=>m.x>415 && m.topo>nome.topo-44 && m.topo<nome.topo-15 && /^\d$/.test(m.texto));
    assert.equal(datas.slice(-8).map(m=>m.texto).join(''),preenchidos.data,id);
    assert.ok(frente.some(m=>m.texto==='Rua de demonstração'),id);
    const impresso=marcas.flat().map(m=>m.texto).join(' ');
    for(const valor of preenchidos.livres) assert.ok(impresso.includes(valor),id+' '+valor);
    assert.ok(impresso.includes('Profissional fictício'),id);
    const originais=umaPagina.includes(id)?1:2;
    assert.ok(folhas.length>=originais,id);
    for(const extra of marcas.slice(originais))assert.ok(extra.length>=3,id+' continuação vazia');
    console.log('PASS SINAN '+id+' ('+folhas.length+' páginas)');
  }
};
