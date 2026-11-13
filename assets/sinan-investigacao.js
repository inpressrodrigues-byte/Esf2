// Sobreimpressão nas fichas incorporadas da Vigilância de Toledo.
function sinanImprimirInvestigacao(pdf, pages, fonte, negrito, cor, ficha, mapa) {
  const frente = pages[0];
  const verso = pages[pages.length - 1];
  const notas = [];
  const valor = chave => sinanVal('sinan-' + chave);
  const especifico = chave => sinanEspVal(ficha, chave);
  const usados = new Set();
  const normalizar = texto => String(texto ?? '').normalize('NFC')
    .replace(/\s+/gu, ' ').trim().replace(/[^\x20-\x7e\xa0-\xff–—‘’“”…]/gu, '?');
  function escrever(pagina, x, topo, texto, tamanho = 8, tipo = fonte) {
    if (texto) pagina.drawText(texto, {x, y:pagina.getHeight()-topo, size:tamanho, font:tipo, color:cor});
  }
  function campo(linha, inicio, fim, dado, rotulo) {
    const texto = normalizar(dado);
    if (!texto) return;
    const [dx, topo] = linha;
    const largura = fim-inicio;
    const tamanho = Math.min(9, largura / fonte.widthOfTextAtSize(texto, 1));
    if (tamanho >= 6.5) return escrever(frente, inicio+dx, topo, texto, tamanho);
    notas.push([rotulo, texto]);
    let prefixo = texto;
    while (prefixo && fonte.widthOfTextAtSize(prefixo+'…',6.5)>largura) prefixo=prefixo.slice(0,-1);
    escrever(frente,inicio+dx,topo,prefixo+'…',6.5);
  }
  function centralizar(x, topo, texto, pagina=frente) {
    if (texto) escrever(pagina,x-negrito.widthOfTextAtSize(texto,8)/2,topo,texto,8,negrito);
  }
  function casas(linha, centros, caracteres) {
    Array.from(caracteres).forEach((c,i) => centralizar(linha[0]+centros[i],linha[1],c));
  }
  function numero(linha, centros, chave) {
    const n=sinanSomenteNumeros(valor(chave));
    if (n.length<=centros.length) casas(linha,centros,n);
    else notas.push([sinanEl('sinan-'+chave).labels?.[0]?.textContent || chave, valor(chave)]);
  }
  function data(posicao, iso) {
    if (!iso) return;
    const [topo, centros]=posicao;
    casas([0,topo],centros,sinanData(iso));
  }
  function ibge(linha, centros, chave) {
    const n=valor(chave);
    if (/^\d{7}$/.test(n)) casas(linha,centros,n.slice(0,6));
    else numero(linha,centros,chave);
  }
  const codigo = (pos, chave) => centralizar(...pos,valor(chave));
  campo([0,mapa.number[1]],mapa.number[0],558,valor('num-notificacao'),'Nº da notificação');
  data(mapa.notif,valor('data-notif'));
  casas(mapa.uf,[57,70],valor('uf-notif').slice(0,2));
  campo(mapa.uf,83,469,valor('mun-notif'),'Município de notificação');
  ibge(mapa.uf,[480,494,509,523,538,553],'mun-notif-cod');
  campo(mapa.unit,53,332,valor('unidade'),'Unidade notificadora');
  numero(mapa.unit,[341,355,369,384,398,413,427],'unidade-cod');
  data(mapa.event,valor(mapa.eventField));
  campo(mapa.name,54,431,valor('nome'),'Nome do paciente');
  data(mapa.birth,valor('nasc'));
  const idade=sinanSomenteNumeros(valor('idade'));
  if (idade.length<=3) casas(mapa.age,[65,80,94].slice(3-idade.length),idade);
  else notas.push(['Idade',idade]);
  codigo(mapa.ageUnit,'idade-unidade');
  codigo(mapa.sex,'sexo');
  if (!mapa.excluded?.includes('gestante')) codigo(mapa.pregnancy,'gestante');
  codigo(mapa.race,'raca');
  if (!mapa.excluded?.includes('escolaridade')) codigo(mapa.school,'escolaridade');
  numero([0,mapa.cns[1]],mapa.cnsX,'cns');
  campo(mapa.cns,232,558,valor('mae'),'Nome da mãe');
  casas(mapa.city,[57,71],valor('uf-res').slice(0,2));
  campo(mapa.city,83,320,valor('mun-res'),'Município de residência');
  ibge(mapa.city,[330,343,358,372,387,401],'mun-res-cod');
  campo(mapa.city,413,560,valor('distrito'),'Distrito');
  campo(mapa.street,54,186,valor('bairro'),'Bairro');
  campo(mapa.street,195,474,valor('logradouro'),'Logradouro');
  numero(mapa.street,[484,497,512,526,540,555],'logradouro-cod');
  campo(mapa.extra,54,102,valor('numero'),'Número');
  campo(mapa.extra,111,401,valor('complemento'),'Complemento');
  campo(mapa.extra,411,558,valor('geo1'),'Geo campo 1');
  campo(mapa.ref,55,205,valor('geo2'),'Geo campo 2');
  campo(mapa.ref,216,447,valor('referencia'),'Ponto de referência');
  numero(mapa.ref,[460,473,488,502,516,528,541,mapa.cepLast??555],'cep');
  const tel = sinanSomenteNumeros(valor('telefone')).split('');
  const par=mapa.phonePair??2;
  if (tel.length===11) tel.splice(par,2,tel.slice(par,par+2).join(''));
  const telefoneX=mapa.phonePair ? [59,74,90,104,119,134,149,164,179,194] : [59,73,87,102,116,131,145,159,174,188];
  if (tel.length<=10) casas(mapa.phone,telefoneX,tel);
  else notas.push(['Telefone',valor('telefone')]);
  codigo(mapa.zone,'zona');
  campo(mapa.phone,357,559,valor('pais'),'País');

  if (mapa.investigation) data(mapa.investigation,valor('esp-data-investigacao'));
  if (mapa.accident) { data(mapa.accident,especifico('data-acidente')); usados.add('data-acidente'); }
  if (mapa.cough) { data(mapa.cough,especifico('tosse-data')); usados.add('tosse-data'); }
  if (mapa.eventField==='data-acidente') usados.add('data-acidente');
  if (mapa.occupation) {
    const [x,topo,fim]=mapa.occupation;
    campo([0,topo],x,fim,especifico('ocupacao'),'Ocupação');
    usados.add('ocupacao');
  }
  if (ficha.id==='ac-animal') {
    centralizar(290,715,especifico('animal'));
    centralizar(338,44,especifico('classificacao'),verso);
    usados.add('animal'); usados.add('classificacao');
  }
  if (ficha.id==='ac-trabalho') {
    const hora=especifico('hora-acidente').replace(':','');
    [99.6,113.4,202.4,216.1].forEach((x,i)=>centralizar(x,144.5,hora[i],verso));
    centralizar(549.5,399.5,especifico('cat'),verso);
    usados.add('hora-acidente'); usados.add('cat');
  }
  if (ficha.id==='antirrabico') {
    data([583.5,[65,81,96,110,124,138,152,167]],especifico('data-acidente'));
    usados.add('data-acidente');
  }
  if (ficha.id==='crianca-hiv') {
    centralizar(555,596,especifico('tipo-parto'));
    usados.add('tipo-parto');
  }
  if (ficha.id==='gestante-hiv') {
    centralizar(367.7,598,especifico('uso-arv'));
    usados.add('uso-arv');
  }
  if (ficha.id==='coqueluche' && ['1','2'].includes(especifico('classificacao-final'))) {
    centralizar(203.4,268.6,especifico('classificacao-final'),verso);
    usados.add('classificacao-final');
  }
  if (ficha.id==='toxoplasmose-adquirida') {
    campo([0,644],115,555,especifico('exames'),'IgM/IgG/avidez e outros exames');
    campo([0,700],125,555,especifico('tratamento'),'Tratamento/seguimento');
    usados.add('exames'); usados.add('tratamento');
  }
  notas.push(['Resumo clínico',valor('esp-resumo')],['Classificação inicial',valor('esp-classificacao')],
    ['Local provável',valor('esp-local-provavel')]);
  if (!mapa.investigation && valor('esp-data-investigacao')) notas.push(['Data da investigação',formatarDataBR(valor('esp-data-investigacao'))]);
  for (const el of document.querySelectorAll('#sinan-campos-especificos .sinan-esp-field')) {
    const chave=el.id.slice(('sinan-esp-'+ficha.id+'-').length);
    if (!usados.has(chave) && el.value) notas.push([el.dataset.sinanLabel,
      el.tagName==='SELECT' ? el.selectedOptions[0].textContent : el.type==='date' ? formatarDataBR(el.value) : el.value]);
  }
  notas.push(['Observações',valor('esp-campos')],['Notificante',
    ['notificante-nome','notificante-funcao','notificante-unidade'].map(valor).filter(Boolean).join(' / ')]);

  // Usar o espaço de observações do impresso antes de abrir uma continuação.
  // Nos modelos sem esse espaço (AIDS e gestante HIV), preservar as páginas oficiais.
  const linhas = mapa.notes || [];
  const tamanho=8.5, limite=483;
  const largura = texto => fonte.widthOfTextAtSize(texto,tamanho);
  let pagina=verso, indice=0;
  function imprimir(texto) {
    if (pagina===verso && indice<linhas.length) {
      escrever(verso,56,linhas[indice++],texto,tamanho);
      return;
    }
    if (pagina===verso || indice===51) {
      pagina=pdf.addPage([595,842]); indice=0;
      escrever(pagina,48,42,ficha.nome+' — continuação',12,negrito);
      const id=normalizar([valor('nome'),valor('num-notificacao')].filter(Boolean).join(' / '));
      escrever(pagina,48,60,id,Math.min(9,493/fonte.widthOfTextAtSize(id||' ',1)));
    }
    escrever(pagina,48,82+indice++*14,texto,tamanho);
  }
  for (const [rotulo,dado] of notas.filter(([,v])=>v)) {
    for (const paragrafo of (rotulo+': '+dado).split(/\r?\n/)) {
      let linha='';
      for (let palavra of normalizar(paragrafo).split(' ').filter(Boolean)) {
        if (linha && largura(linha+' '+palavra)>limite) { imprimir(linha); linha=''; }
        while (largura(palavra)>limite) {
          let n=1; while (largura(palavra.slice(0,n+1))<=limite) n++;
          imprimir(palavra.slice(0,n)); palavra=palavra.slice(n);
        }
        linha=[linha,palavra].filter(Boolean).join(' ');
      }
      if (linha) imprimir(linha);
    }
  }
}
