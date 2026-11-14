(() => {
  'use strict';
  const id = key => document.getElementById(key);
  const field = (p, suffix) => id(p + '-' + suffix);
  const read = (p, suffix) => field(p, suffix)?.value || '';
  const formatDate = value => value ? value.slice(0, 10).split('-').reverse().join('/') : '';
  const keyOf = r => JSON.stringify([r.origem, r.confirmadoEm, r.exameId]);
  const openMarker = '[Resultados de exames vinculados]', closeMarker = '[Fim dos resultados vinculados]';
  function element(tag, text) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  }
  function button(text, action) {
    const node = element('button', text);
    node.type = 'button'; node.className = 'btn btn-s'; node.onclick = action;
    return node;
  }
  function parse(value) {
    try { return JSON.parse(value); } catch { return null; }
  }
  function resultados(raw, cpf, nasc) {
    const rows = parse(raw);
    if (!Array.isArray(rows) || cpf.length !== 11) return [];
    return rows.filter(r => r && r.cpf === cpf && (!nasc || !r.nasc || r.nasc === nasc)
      && ['origem','confirmadoEm','exameId','nome','data','resultado'].every(k => typeof r[k] === 'string' && r[k].trim()));
  }
  function atuais(p) {
    return temPermissao('ver_historico') && escopoDadosClinicos().permitido
      ? resultados(read(p, 'resultados-vinculados'), normalizarCPF(read(p, 'cpf')), read(p, 'nasc')) : [];
  }
  function removerBloco(objective) {
    if (objective.value.includes(openMarker))
      objective.value = objective.value.replace(/\n*\[Resultados de exames vinculados\][\s\S]*?\[Fim dos resultados vinculados\]/g, '').trimEnd();
  }
  function sincronizarSoap(p) {
    const objective = id(SOAP_IDS_MODULO[p]?.o), state = field(p, 'resultados-vinculados');
    if (!objective || !state) return;
    const rows = atuais(p);
    if (state.value) state.value = rows.length ? JSON.stringify(rows) : '';
    const old = objective.value;
    if (!rows.length && !old.includes(openMarker)) return;
    removerBloco(objective);
    const base = objective.value;
    const lines = rows.map(r => r.nome + ' (' + formatDate(r.data) + ') — ' + r.resultado);
    objective.value = lines.length ? [base || 'O:', openMarker, ...lines, closeMarker].join('\n') : base.trim() === 'O:' ? '' : base;
  }
  function pedidos(records) {
    const orders = new Map();
    for (const record of records) {
      const p = MODULOS_ATENDIMENTO[record.tipo].prefix, order = parse(record.dados[p + '-exkit-order']);
      if (!record.id || !order?.confirmedAt || !Array.isArray(order.items)) continue;
      const dataPedido = (record.dados[p + '-data'] || record.dados[p + '-data-hora'] || order.confirmedAt).slice(0, 10);
      for (const item of order.items) {
        if (!item?.id || !item.name || item.status !== 'solicitar') continue;
        const row = {origem:record.id, confirmadoEm:order.confirmedAt, exameId:item.id, nome:item.name, tipo:record.tipo, dataPedido};
        orders.set(keyOf(row), row);
      }
    }
    return orders;
  }
  function registrar(p, rows) {
    const state = field(p, 'resultados-vinculados');
    state.value = rows.length ? JSON.stringify(rows) : '';
    sincronizarSoap(p);
    state.dispatchEvent(new Event('input', {bubbles:true}));
    FluxoAPS.historico(p);
  }
  function mostrar(p, records) {
    const history = field(p, 'historico-consulta');
    if (!history) return;
    let box = field(p, 'seguimento-exames');
    if (!box) {
      box = element('details'); box.id = p + '-seguimento-exames'; box.className = 'support-section'; box.dataset.seguimento = '1';
      const store = element('textarea'); store.hidden = true; store.id = p + '-resultados-vinculados'; store.className = 'aps-new';
      history.before(box, store);
    }
    sincronizarSoap(p);
    const cpf = normalizarCPF(read(p, 'cpf')), nasc = read(p, 'nasc'), scope = escopoDadosClinicos().chave;
    const orders = pedidos(records), saved = new Map(), current = atuais(p);
    for (const record of records) {
      const q = MODULOS_ATENDIMENTO[record.tipo].prefix;
      for (const row of resultados(record.dados[q + '-resultados-vinculados'], cpf, nasc)) {
        if (!saved.has(keyOf(row))) saved.set(keyOf(row), row);
      }
    }
    const reviewed = new Set([...saved.keys(), ...current.map(keyOf)]);
    const pending = [...orders].filter(([key]) => !reviewed.has(key));
    const identity = JSON.stringify([scope, cpf, nasc, ATENDIMENTO_EM_EDICAO]);
    const stamp = JSON.stringify([identity, pending, [...saved], current]);
    if (box._stamp === stamp) return;
    if (box._identity !== identity) box.open = false;
    box._stamp = stamp; box._identity = identity; box.replaceChildren();
    box.hidden = !pending.length && !reviewed.size;
    if (box.hidden) return;
    box.append(element('summary', 'Exames do paciente · ' + pending.length + ' a revisar'));
    const samePatient = () => scope === escopoDadosClinicos().chave && cpf === normalizarCPF(read(p,'cpf'))
      && nasc === read(p,'nasc') && temPermissao('ver_historico');
    if (pending.length) {
      const select = element('select'), date = element('input'), result = element('textarea');
      for (const [key, row] of pending) {
        const option = element('option', row.nome + ' · ' + formatDate(row.dataPedido) + ' · ' + row.tipo);
        option.value = key; select.append(option);
      }
      date.type = 'date'; result.rows = 2;
      for (const [text, control] of [['Pedido para revisar', select], ['Data de realização', date], ['Resultado do laudo', result]]) {
        const label = element('label', text); label.className = 'f'; label.append(control); box.append(label);
      }
      const action = button('Incluir resultado nesta consulta', () => {
        if (!samePatient()) return FluxoAPS.historico(p);
        const recordsNow = FluxoAPS.registros(p), row = pedidos(recordsNow).get(select.value);
        if (!row || atuais(p).some(r => keyOf(r) === select.value) || recordsNow.some(a =>
          resultados(a.dados[MODULOS_ATENDIMENTO[a.tipo].prefix + '-resultados-vinculados'], cpf, nasc).some(r => keyOf(r) === select.value))) return FluxoAPS.historico(p);
        if (!date.value || !date.validity.valid) {date.focus(); return showToast('Confira a data de realização do exame.');}
        if (!result.value.trim()) {result.focus(); return showToast('Informe o resultado descrito no laudo.');}
        registrar(p, [...atuais(p), {...row, cpf, nasc, data:date.value, resultado:result.value.trim()}]);
        box.querySelector('summary').focus();
      });
      function datas() {
        date.min = orders.get(select.value)?.dataPedido || '';
        const today = new Date();
        date.max = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
      }
      select.onchange = () => { date.value = ''; result.value = ''; datas(); };
      datas(); box.append(action);
    }
    for (const row of current) {
      const line = element('p', 'Nesta consulta · ' + row.nome + ' · ' + formatDate(row.data) + ' · ' + row.resultado + ' ');
      line.append(button('Retirar deste atendimento', () => {
        if (samePatient()) registrar(p, atuais(p).filter(r => keyOf(r) !== keyOf(row)));
      }));
      box.append(line);
    }
    const previous = [...saved].filter(([key]) => !current.some(r => keyOf(r) === key));
    if (previous.length) {
      const details = element('details'); details.append(element('summary','Resultados anteriores (' + previous.length + ')'));
      for (const [,r] of previous) details.append(element('p',r.nome + ' · ' + formatDate(r.data) + ' · ' + r.resultado));
      box.append(details);
    }
  }
  function pendentes(records,cpf,nasc){
    const valid=records.filter(a=>MODULOS_ATENDIMENTO[a.tipo]&&a.dados&&normalizarCPF(a.cpf)===cpf
      &&(!nasc||!a.dados[MODULOS_ATENDIMENTO[a.tipo].prefix+'-nasc']||a.dados[MODULOS_ATENDIMENTO[a.tipo].prefix+'-nasc']===nasc));
    const orders=pedidos(valid);
    for(const a of valid)for(const row of resultados(a.dados[MODULOS_ATENDIMENTO[a.tipo].prefix+'-resultados-vinculados'],cpf,nasc))orders.delete(keyOf(row));
    return [...orders.values()].map(r=>r.nome+' · '+formatDate(r.dataPedido));
  }
  window.SeguimentoAPS = {mostrar, sincronizarSoap, removerBloco,pendentes};
  document.addEventListener('DOMContentLoaded', () => {
    for (const p of Object.values(QUICK_PAGE_PREFIX)) if (field(p,'historico-consulta')) FluxoAPS.historico(p);
    const generators = {gerarSoapAutomatoPna:'pna',gerarSoapAutomatoPnc:'pnc',gerarSoapAutomatoPu:'pu',
      gerarSoapPreventivo:'prev',gerarSoapIdoso:'id',gerarSoapSM:'sm',gerarSoapVisitaDomiciliar:'vd',gerarSoapSaudeMulher:'smu',gerarSoapGenerico:''};
    for (const [name, prefix] of Object.entries(generators)) {
      const generate = window[name];
      window[name] = function(...args) {
        const value = generate.apply(this,args);
        sincronizarSoap(prefix || args[0]);
        return value;
      };
    }
  });
})();
