// Ficha SINAN NET de sífilis adquirida, 05/10/2010, incorporada em modelos.js.
// Medidas em pontos, a partir do topo esquerdo de cada folha de 611 × 791 pt.
function sinanDesenharSifilisAdquirida(pdf, pages, font, bold, color, ficha) {
  const [frente, verso] = pages;
  if (pages.length !== 2 || pages.some(p => p.getWidth() !== 611 || p.getHeight() !== 791)) {
    throw new Error('O modelo de sífilis adquirida mudou. Confira a versão da ficha antes de imprimir.');
  }
  const geral = id => sinanVal('sinan-' + id);
  const especifico = id => sinanEspVal(ficha, id);
  const notas = [];
  const limpo = valor => String(valor ?? '').normalize('NFC').replace(/\s+/g, ' ').trim()
    .replace(/[^\x20-\x7e\xa0-\xff–—‘’“”…]/gu, '?').replace(/\u00ad/g, '-');
  const escrever = (pagina, x, topo, texto, tamanho, fonte = font) => {
    pagina.drawText(texto, {x, y: pagina.getHeight() - topo, font: fonte, size: tamanho, color});
  };
  function campo(pagina, x, fim, topo, valor, rotulo) {
    let texto = limpo(valor);
    if (!texto) return;
    const largura = fim - x;
    const tamanho = Math.min(9, Math.max(6.5, largura / font.widthOfTextAtSize(texto, 1)));
    if (font.widthOfTextAtSize(texto, tamanho) > largura + 0.001) {
      notas.push(rotulo + ': ' + texto);
      while (texto && font.widthOfTextAtSize(texto + '…', tamanho) > largura) texto = texto.slice(0, -1);
      texto += '…';
    }
    escrever(pagina, x, topo, texto, tamanho);
  }
  function celulas(pagina, centros, topo, valores, tamanho = 8) {
    Array.from(valores).forEach((valor, i) => {
      const x = centros[i] - bold.widthOfTextAtSize(valor, tamanho) / 2;
      escrever(pagina, x, topo, valor, tamanho, bold);
    });
  }
  function digitos(centros, topo, valor, rotulo) {
    const numeros = sinanSomenteNumeros(valor);
    if (numeros.length > centros.length) notas.push(rotulo + ': ' + limpo(valor));
    else celulas(frente, centros, topo, numeros);
  }
  const data = (centros, topo, valor) => celulas(frente, centros, topo, sinanData(valor));
  const codigo = (x, topo, valor) => { if (valor) celulas(frente, [x], topo, [valor], 7.5); };
  const ibge = (centros, topo, valor) => {
    // A ficha tem seis casas. O sétimo dígito no cadastro IBGE é o verificador.
    digitos(centros, topo, /^\d{7}$/.test(valor) ? valor.slice(0, 6) : valor, 'Código IBGE');
  };
  campo(frente, 444, 531, 39, geral('num-notificacao'), 'Nº da notificação');
  data([421,438,452,465,479,492,506,520], 131, geral('data-notif'));
  celulas(frente, [56,69], 159, geral('uf-notif').slice(0, 2));
  campo(frente, 82, 444, 159, geral('mun-notif'), 'Município de notificação');
  ibge([454,467,481,495,508,523], 159, geral('mun-notif-cod'));
  campo(frente, 53, 314, 186, geral('unidade'), 'Unidade notificadora');
  digitos([323,336,350,364,377,391,406], 186, geral('unidade-cod'), 'CNES');
  data([423,438,451,465,478,492,505,521], 186, geral('data-diagnostico'));
  campo(frente, 53, 410, 214, geral('nome'), 'Nome do paciente');
  data([425,440,453,467,481,494,507,522], 214, geral('nasc'));
  const idade = sinanSomenteNumeros(geral('idade'));
  if (idade.length <= 3) celulas(frente, [63,77,90].slice(3 - idade.length), 248, idade);
  else notas.push('Idade: ' + idade);
  codigo(107.5, 241, geral('idade-unidade'));
  codigo(221.2, 234.5, geral('sexo'));
  // O modelo já traz "6 – Não se aplica" impresso no campo 12.
  if (geral('gestante') && geral('gestante') !== '6') {
    notas.push('Condição gestacional registrada: ' + sinanEl('sinan-gestante').selectedOptions[0].textContent);
  }
  codigo(523.2, 234.8, geral('raca'));
  codigo(524.5, 268.2, geral('escolaridade'));
  digitos([56,66,77,88,98,109,120,131,142,153,163,174,185,196,208], 311, geral('cns'), 'Cartão SUS');
  campo(frente, 220, 529, 311, geral('mae'), 'Nome da mãe');
  celulas(frente, [56,69], 339, geral('uf-res').slice(0, 2));
  campo(frente, 80, 304, 339, geral('mun-res'), 'Município de residência');
  ibge([312,325,339,352,366,380], 339, geral('mun-res-cod'));
  campo(frente, 389, 530, 339, geral('distrito'), 'Distrito');
  campo(frente, 53, 181, 365, geral('bairro'), 'Bairro');
  campo(frente, 186, 449, 365, geral('logradouro'), 'Logradouro');
  digitos([459,472,485,499,512,526], 365, geral('logradouro-cod'), 'Código do logradouro');
  campo(frente, 54, 100, 391, geral('numero'), 'Número');
  campo(frente, 107, 382, 391, geral('complemento'), 'Complemento');
  campo(frente, 389, 529, 391, geral('geo1'), 'Geo campo 1');
  campo(frente, 54, 197, 421, geral('geo2'), 'Geo campo 2');
  campo(frente, 204, 423, 421, geral('referencia'), 'Ponto de referência');
  digitos([435,448,462,476,487,500,512,526], 421, geral('cep'), 'CEP');
  const telefone = sinanSomenteNumeros(geral('telefone'));
  const partes = telefone.split('');
  // O impresso tem DDD e oito casas. Dois dígitos cabem na primeira casa de um celular.
  if (partes.length === 11) partes.splice(2, 2, telefone.slice(2, 4));
  if (partes.length <= 10) celulas(frente, [57,71,84,98,111,125,139,152,166,181], 450, partes);
  else notas.push('Telefone: ' + telefone);
  codigo(318.3, 438, geral('zona'));
  campo(frente, 337, 530, 450, geral('pais'), 'País');

  campo(frente, 55, 532, 501, especifico('ocupacao'), 'Ocupação');
  codigo(278, 514, especifico('antecedente-sifilis'));
  codigo(522.6, 514.5, especifico('tratamento-anterior'));
  codigo(522, 550, especifico('comportamento-sexual'));
  codigo(294.5, 596.5, especifico('teste-nao-treponemico'));
  campo(frente, 334, 409, 607, especifico('titulo-vdrl').replace(/^1\s*:\s*/, ''), 'Título VDRL/RPR');
  data([425,441,454,467,480,493,507,522], 609, especifico('data-teste-nao-treponemico'));
  codigo(518.7, 625.5, especifico('teste-treponemico'));
  codigo(520.8, 657.5, especifico('classificacao-clinica'));
  codigo(362.8, 689.6, especifico('esquema-tratamento'));
  data([429,442,455,468,481,494,508,522], 714, especifico('data-inicio-tratamento'));
  codigo(245, 739.5, especifico('classificacao-final'));

  campo(verso, 54, 428, 207, especifico('investigador-unidade'), 'Unidade do investigador');
  const cnes = sinanSomenteNumeros(especifico('investigador-cnes'));
  if (cnes.length <= 7) celulas(verso, [440,453,466,480,494,507,522], 208, cnes);
  else notas.push('CNES do investigador: ' + cnes);
  campo(verso, 54, 232, 231, especifico('investigador-nome'), 'Nome do investigador');
  campo(verso, 242, 425, 231, especifico('investigador-funcao'), 'Função do investigador');
  const notificante = [geral('notificante-nome'), geral('notificante-funcao'), geral('notificante-unidade')];
  if (notificante.some(Boolean) && notificante.some((v,i) => v !== especifico(['investigador-nome','investigador-funcao','investigador-unidade'][i]))) {
    notas.push('Notificante: ' + notificante.filter(Boolean).join(' / '));
  }
  const observacoes = [especifico('observacoes'), geral('esp-resumo'),
    geral('esp-classificacao') && 'Classificação inicial: ' + geral('esp-classificacao'),
    geral('esp-data-investigacao') && 'Data da investigação: ' + geral('esp-data-investigacao').split('-').reverse().join('/'),
    geral('esp-local-provavel') && 'Local provável: ' + geral('esp-local-provavel'),
    geral('esp-campos'), ...notas].filter(Boolean);
  let pagina = verso, linha = 0;
  function imprimirLinha(texto) {
    if ((pagina === verso && linha === 9) || linha === 48) {
      pagina = pdf.addPage([611, 791]);
      escrever(pagina, 32, 35, 'Sífilis adquirida — continuação das observações', 12, bold);
      campo(pagina, 32, 568, 53, geral('nome'), 'Nome do paciente');
      linha = 0;
    }
    escrever(pagina, 32, pagina === verso ? 43 + 17.25 * linha : 75 + 14 * linha, texto, 8.5);
    linha++;
  }
  for (const paragrafo of observacoes.flatMap(v => String(v).split(/\r?\n/))) {
    let linhaAtual = '';
    for (let palavra of limpo(paragrafo).split(' ').filter(Boolean)) {
      const largura = texto => font.widthOfTextAtSize(texto, 8.5);
      if (linhaAtual && largura(linhaAtual + ' ' + palavra) > 496) {
        imprimirLinha(linhaAtual);
        linhaAtual = '';
      }
      while (largura(palavra) > 496) {
        let corte = 1;
        while (largura(palavra.slice(0, corte + 1)) <= 496) corte++;
        imprimirLinha(palavra.slice(0, corte));
        palavra = palavra.slice(corte);
      }
      linhaAtual = [linhaAtual, palavra].filter(Boolean).join(' ');
    }
    if (linhaAtual) imprimirLinha(linhaAtual);
  }
}
