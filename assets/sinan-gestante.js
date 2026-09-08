/* Ficha oficial SMS Toledo: sífilis em gestante, versão impressa 29/09/2008.
   Coordenadas exclusivas desta ficha; não reutilizar mapa da sífilis adquirida. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ESFSinanGestante=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function draw({pages,font,bold,color,get}){
  let page=pages[0];const scale=1.8;
  const text=(x,y,value,width=180,size=7)=>{
   value=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e]/g,'').toUpperCase();if(!value)return;
   while(size>4&&font.widthOfTextAtSize(value,size)>width/scale)size-=.2;
   if(font.widthOfTextAtSize(value,size)>width/scale)throw Error('Texto longo demais para a ficha; abreviar com revisão profissional.');
   page.drawText(value,{x:x/scale,y:841-y/scale,font,size,color});
  };
  const digits=(xs,y,v)=>String(v||'').replace(/\D/g,'').split('').forEach((c,i)=>{if(xs[i]!==undefined)text(xs[i],y,c,13,7);});
  const date=(xs,y,v)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return;digits(xs,y,v.slice(8)+v.slice(5,7)+v.slice(0,4));};
  const dates=[816,842,868,895,921,947,974,1000];
  date(dates,334,get('sinan-data-notif'));
  text(120,378,get('sinan-uf-notif'),32);text(181,378,get('sinan-mun-notif'),670);
  digits([874,898,922,946,970,994,1018],378,get('sinan-mun-notif-cod'));
  text(127,422,get('sinan-unidade'),480);digits([628,654,680,706,732,758,784],422,get('sinan-unidade-cod'));
  // Campo 7 nesta ficha é DATA DO DIAGNÓSTICO, não DUM/início de sintomas.
  date(dates,422,get('sinan-data-diagnostico'));
  text(128,474,get('sinan-nome'),665);date(dates,477,get('sinan-nasc'));
  digits([121,144],530,get('sinan-idade'));text(210,520,get('sinan-idade-unidade'),14);text(783,508,get('sinan-gestante'),15);
  text(1010,507,get('sinan-raca'),15);text(1010,556,get('sinan-escolaridade'),15);
  digits(Array.from({length:15},(_,i)=>112+i*20.8),640,get('sinan-cns'));text(440,640,get('sinan-mae'),570);
  text(118,690,get('sinan-uf-res'),31);text(175,690,get('sinan-mun-res'),400);digits([605,626,647,669,690,711,733],690,get('sinan-mun-res-cod'));text(781,690,get('sinan-distrito'),240);
  text(120,737,get('sinan-bairro'),230);text(372,737,get('sinan-logradouro'),495);digits([884,910,936,962,988,1014],737,get('sinan-logradouro-cod'));
  text(120,779,get('sinan-numero'),80);text(222,779,get('sinan-complemento'),510);text(765,779,get('sinan-geo1'),250);
  text(121,823,get('sinan-geo2'),255);text(402,823,get('sinan-referencia'),420);digits([831,856,881,906,940,965,990,1015],832,get('sinan-cep'));
  digits(Array.from({length:11},(_,i)=>114+i*24.8),876,get('sinan-telefone'));text(619,859,get('sinan-zona'),16);text(683,876,get('sinan-pais'),330);
  const esp=id=>get('sinan-esp-sifilis-gestante-'+id);
  text(122,953,esp('ocupacao'),890);text(123,1008,esp('uf-pre-natal'),29);text(177,1008,esp('municipio-pre-natal'),231);
  digits([425,448,471,494,517,540,563],1008,esp('municipio-pre-natal-cod'));text(592,1008,esp('unidade-pre-natal'),248);digits([855,880,905,930,955,980,1005],1008,esp('unidade-pre-natal-cod'));
  digits(Array.from({length:10},(_,i)=>120+i*25.5),1057,esp('sisprenatal'));text(981,1049,esp('classificacao-clinica'),16);
  text(560,1110,esp('teste-nao-treponemico'),16);text(651,1127,String(esp('titulo-vdrl')||'').replace(/^1\s*:\s*/,''),120);date(dates,1123,esp('data-teste-nao-treponemico'));text(980,1163,esp('teste-treponemico'),16);
  text(994,1226,esp('esquema-tratamento'),16);text(980,1314,esp('parceiro-tratado'),16);text(983,1389,esp('esquema-parceiro'),16);
  if(pages[1]){page=pages[1];text(990,99,esp('motivo-nao-tratamento'),16);text(248,222,esp('outro-motivo'),350);text(121,291,get('sinan-notificante-unidade'),708);digits([849,875,901,927,953,979,1005],291,get('sinan-notificante-cod'));text(120,333,get('sinan-notificante-nome'),334);text(480,333,get('sinan-notificante-funcao'),344);}
 }
 return {draw};
});
