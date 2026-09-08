const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const PDFLib=require('../vendor/pdf-lib.min.js'),form=require('../assets/sinan-gestante.js');
test('PDF de sífilis em gestante usa modelo próprio e data de diagnóstico',async()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/modelos.js'),'utf8'),context);
 const bytes=Buffer.from(context.window.SINAN_MODELOS_ESPECIFICOS_BASE64['sifilis-gestante'],'base64');assert.ok(bytes.length>20000);
 const doc=await PDFLib.PDFDocument.load(bytes);assert.equal(doc.getPageCount(),2);
 const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica),bold=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold),data={
  'sinan-data-notif':'2026-09-07','sinan-data-diagnostico':'2026-09-03','sinan-primeiros-sintomas':'2020-01-01','sinan-uf-notif':'PR','sinan-mun-notif':'Toledo','sinan-mun-notif-cod':'4127700','sinan-unidade':'UNIDADE FICTICIA PARA TESTE','sinan-unidade-cod':'1234567','sinan-nome':'PESSOA FICTICIA PARA VALIDACAO','sinan-nasc':'1990-04-15','sinan-idade':'36','sinan-idade-unidade':'4','sinan-gestante':'3','sinan-raca':'4','sinan-escolaridade':'6','sinan-cns':'111111111111111','sinan-mae':'MAE FICTICIA','sinan-uf-res':'PR','sinan-mun-res':'Toledo','sinan-mun-res-cod':'4127700','sinan-distrito':'FICTICIO','sinan-bairro':'FICTICIO','sinan-logradouro':'RUA FICTICIA','sinan-numero':'123','sinan-complemento':'CASA TESTE','sinan-cep':'85900000','sinan-telefone':'45999999999','sinan-zona':'1','sinan-pais':'BRASIL'
 };
 Object.assign(data,{'sinan-notificante-unidade':'UNIDADE FICTICIA','sinan-notificante-nome':'NOTIFICANTE FICTICIO','sinan-notificante-funcao':'ENFERMEIRO','sinan-notificante-cod':'1234567'});
 for(const [key,v]of Object.entries({'ocupacao':'PROFISSAO FICTICIA','uf-pre-natal':'PR','municipio-pre-natal':'TOLEDO','municipio-pre-natal-cod':'4127700','unidade-pre-natal':'UNIDADE TESTE','unidade-pre-natal-cod':'1234567','sisprenatal':'1234567890','classificacao-clinica':'4','teste-nao-treponemico':'1','titulo-vdrl':'1:8','data-teste-nao-treponemico':'2026-09-03','teste-treponemico':'1','esquema-tratamento':'3','parceiro-tratado':'2','esquema-parceiro':'5','motivo-nao-tratamento':'6','outro-motivo':'DADO FICTICIO PARA TESTE'}))data['sinan-esp-sifilis-gestante-'+key]=v;
 const used=[];form.draw({pages:doc.getPages(),font,bold,color:PDFLib.rgb(.02,.08,.32),get:id=>(used.push(id),data[id]||'')});assert.ok(used.includes('sinan-data-diagnostico'));assert.ok(!used.includes('sinan-primeiros-sintomas'));
 const output=path.join(__dirname,'../test-results');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'sinan-gestante-sintetica.pdf'),await doc.save());
});
