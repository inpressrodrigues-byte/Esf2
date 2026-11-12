const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const {PDFDocument, decodePDFRawStream} = require('../vendor/pdf-lib.min.js');

// Limites obtidos das caixas do modelo oficial, em pontos desde o topo.
// Lê somente a camada escrita pelo gerador, sem confundir texto pré-impresso com respostas.
function dadosDaPagina(page) {
  const streams = page.node.Contents();
  const overlay = decodePDFRawStream(streams.lookup(streams.size() - 1)).decode();
  const marcas = [...Buffer.from(overlay).toString('latin1').matchAll(/1 0 0 1 ([\d.]+) ([\d.]+) Tm\s*<([\da-f]+)> Tj/gi)]
    .map(([,x,y,hex]) => ({x:Number(x), topo:page.getHeight()-Number(y), texto:Buffer.from(hex,'hex').toString('latin1')}));
  return (x1,x2,y1,y2) => marcas.filter(m => x1 <= m.x && m.x < x2 && y1 <= m.topo && m.topo < y2)
    .map(m => m.texto).join('');
}

module.exports = async function verificarFichaSifilis(page) {
  await page.selectOption('#sinan-ficha-modelo', 'sifilis-adquirida');
  const prefixo = 'sinan-esp-sifilis-adquirida-';
  assert.equal(await page.inputValue('#' + prefixo + 'teste-treponemico'), '');
  assert.equal(await page.inputValue('#' + prefixo + 'teste-nao-treponemico'), '');
  assert.equal(await page.inputValue('#' + prefixo + 'data-teste-nao-treponemico'), '');
  assert.equal(await page.locator('#sinan-primeiros-sintomas').isDisabled(), true);
  assert.equal(await page.locator('#sinan-data-diagnostico').isEnabled(), true);
  const gerais = {
    'num-notificacao':'000000012345', 'data-notif':'2026-11-12', 'data-diagnostico':'2026-11-10',
    'unidade':'Unidade fictícia de demonstração', 'unidade-cod':'0000000',
    nome:'Pessoa fictícia para conferência de impressão', nasc:'1990-04-05', idade:'36',
    'idade-unidade':'4', sexo:'M', gestante:'6', raca:'4', escolaridade:'10', cns:'000000000000000',
    mae:'Mãe fictícia de demonstração', distrito:'Distrito de teste', bairro:'Bairro fictício',
    logradouro:'Rua de demonstração com nome composto', 'logradouro-cod':'123456', numero:'123',
    complemento:'Bloco de teste', geo1:'A', geo2:'B', referencia:'Referência fictícia', cep:'00000-000',
    telefone:'(45) 90000-0000', zona:'1', 'notificante-nome':'Profissional fictício',
    'notificante-funcao':'Enfermeiro', 'notificante-unidade':'Unidade fictícia de demonstração'
  };
  const clinicos = {
    ocupacao:'Ocupação fictícia', 'antecedente-sifilis':'1', 'tratamento-anterior':'2',
    'comportamento-sexual':'9', 'teste-nao-treponemico':'1', 'titulo-vdrl':'1:32',
    'data-teste-nao-treponemico':'2026-11-09', 'teste-treponemico':'1',
    'classificacao-clinica':'4', 'esquema-tratamento':'3', 'data-inicio-tratamento':'2026-11-11',
    'classificacao-final':'1', observacoes:'Exemplo fictício para conferir a impressão. Sem validade para notificação.'
  };
  await page.evaluate(({gerais,clinicos,prefixo}) => {
    for (const [id,v] of Object.entries(gerais)) sinanSet('sinan-' + id, v);
    for (const [id,v] of Object.entries(clinicos)) sinanSet(prefixo + id, v);
    document.querySelector('#sinan-campos-especificos button').click();
  }, {gerais,clinicos,prefixo});
  assert.equal(await page.evaluate(() => sinanValidar()), true);

  async function baixar() {
    const [download] = await Promise.all([
      page.waitForEvent('download', {timeout:10000}),
      page.evaluate(() => gerarFichaSinanEspecifica())
    ]);
    return fs.readFile(await download.path());
  }
  const normal = await baixar();
  if (process.env.ESF_SINAN_AMOSTRA) await fs.writeFile(process.env.ESF_SINAN_AMOSTRA, normal);
  const doc = await PDFDocument.load(normal);
  assert.equal(doc.getPageCount(), 2);
  const [frente,verso] = doc.getPages().map(dadosDaPagina);
  assert.equal(frente(51,413,205,217), gerais.nome);
  assert.equal(frente(414,531,177,188), '10112026');
  assert.equal(frente(50,216,299,313), gerais.cns);
  assert.equal(frente(183,450,355,368), gerais.logradouro);
  assert.equal(frente(272,284,505,517), '1');
  assert.equal(frente(517,529,505,518), '2');
  assert.equal(frente(289,300,587,600), '1');
  assert.equal(frente(311,410,598,612), '32');
  assert.equal(frente(416,531,599,612), '09112026');
  assert.equal(frente(357,368,681,693), '3');
  assert.equal(frente(421,531,704,717), '11112026');
  assert.equal(frente(239,252,730,743), '1');
  assert.equal(verso(28,532,20,184), clinicos.observacoes);
  assert.equal(verso(51,235,218,234), gerais['notificante-nome']);
  assert.equal(verso(432,530,218,234), '');
  await page.evaluate(id => sinanSet(id, Array.from({length:12}, (_,i) => 'Observação fictícia ' + i).join('\n')), prefixo + 'observacoes');
  const longo = await PDFDocument.load(await baixar());
  assert.equal(longo.getPageCount(), 3);
  assert.match(dadosDaPagina(longo.getPages()[2])(30,532,70,180), /Observação fictícia 11/);
  await page.selectOption('#sinan-ficha-modelo', 'hepatites');
  assert.equal(await page.locator('#sinan-primeiros-sintomas').isEnabled(), true);
  assert.equal(await page.locator('#sinan-data-diagnostico').isDisabled(), true);
  console.log('PASS Ficha de sífilis adquirida, resultados explícitos, duas páginas e continuação sob demanda');
};
