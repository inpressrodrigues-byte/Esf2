// ══ SISTEMA DE USUÁRIO ══════════════════════════════════════════
const USR_KEY = 'esf_usuario_v2';
const ATD_KEY = 'esf_atendimentos_v3';
const PAC_KEY = 'esf_pacientes_v1';
let CURRENT_AUTH_USER_ID = '';
let CURRENT_USER_PROFILE = null;
let syncTimer = null;
let syncRunning = false;
let ATENDIMENTO_EM_EDICAO = null;

function chaveUsuarioAtual(){ return CURRENT_AUTH_USER_ID ? `${USR_KEY}:${CURRENT_AUTH_USER_ID}` : USR_KEY; }
function chaveAtendimentosAtual(){ return CURRENT_AUTH_USER_ID ? `${ATD_KEY}:${CURRENT_AUTH_USER_ID}` : ATD_KEY; }
function chaveExclusoesAtual(){ return `${chaveAtendimentosAtual()}:exclusoes`; }
function chaveDadosLocais(base,uid=CURRENT_AUTH_USER_ID){return `${base}:usuario:${uid||'sem-sessao'}`;}
function chavePacientesPendentes(){return chaveDadosLocais(PAC_KEY)+':pendentes';}

const MODULOS_ATENDIMENTO={
  'Abertura PN':{prefix:'pna',page:'pn-abertura',nome:'pna-nome',cpf:'pna-cpf',soap:['pna-s','pna-o','pna-a-soap','pna-soap-p']},
  'Consulta PN':{prefix:'pnc',page:'pn-consulta',nome:'pnc-nome',cpf:'pnc-cpf',soap:['pnc-s','pnc-o','pnc-a-soap','pnc-p']},
  'Puericultura':{prefix:'pu',page:'puericultura',nome:'pu-nome',cpf:'pu-cpf',soap:['pu-s','pu-o','pu-a-soap','pu-p']},
  'Preventivo':{prefix:'prev',page:'preventivo',nome:'prev-nome',cpf:'prev-cpf',soap:['prev-s','prev-o','prev-a-soap','prev-p']},
  'Idoso':{prefix:'id',page:'idoso',nome:'id-nome',cpf:'id-cpf',soap:['id-s','id-o','id-a-soap','id-p']},
  'Saúde Mental':{prefix:'sm',page:'saude-mental',nome:'sm-nome',cpf:'sm-cpf',soap:['sm-s','sm-o','sm-a','sm-p']},
  'Consulta Geral':{prefix:'ger',page:'consulta-geral',nome:'ger-nome',cpf:'ger-cpf',soap:['ger-s','ger-o','ger-a','ger-p']},
  'Acolhimento':{prefix:'acol',page:'acolhimento',nome:'acol-nome',cpf:'acol-cpf',soap:['acol-s','acol-o','acol-a','acol-p']},
  'Hiperdia':{prefix:'hip',page:'hiperdia',nome:'hip-nome',cpf:'hip-cpf',soap:['hip-s','hip-o','hip-a','hip-p']},
  'Feridas / Curativos':{prefix:'fer',page:'feridas',nome:'fer-nome',cpf:'fer-cpf',soap:['fer-s','fer-o','fer-a','fer-p']},
  'Puerpério':{prefix:'puerp',page:'puerperio',nome:'puerp-nome',cpf:'puerp-cpf',soap:['puerp-s','puerp-o','puerp-a','puerp-p']},
  'IST / Testes Rápidos':{prefix:'ist',page:'ist',nome:'ist-nome',cpf:'ist-cpf',soap:['ist-s','ist-o','ist-a','ist-p']},
  'Visita Domiciliar':{prefix:'vd',page:'visita-domiciliar',nome:'vd-nome',cpf:'vd-cpf',soap:['vd-s','vd-o','vd-a','vd-p']}
};
const CAMPOS_PACIENTE={
  pna:{nome:'pna-nome',cpf:'pna-cpf',nasc:'pna-nasc',cns:'pna-cns',prontuario:'pna-prontuario',endereco:'pna-end',telefone:'pna-tel',raca:'pna-raca',escolaridade:'pna-escol',ocupacao:'pna-ocup',parceiro_nome:'pna-parceiro',parceiro_prontuario:'tr-c-pront',parceiro_nasc:'tr-c-nasc',parceiro_sexo:'tr-c-sexo'},
  pnc:{nome:'pnc-nome',cpf:'pnc-cpf',nasc:'pnc-nasc',cns:'pnc-cns'},
  pu:{nome:'pu-nome',cpf:'pu-cpf',nasc:'pu-nasc',cns:'pu-cns',endereco:'pu-area',telefone:'pu-tel',raca:'pu-raca',responsavel:'pu-resp',sexo:'pu-sexo'},
  prev:{nome:'prev-nome',cpf:'prev-cpf',nasc:'prev-nasc',cns:'prev-cns',prontuario:'prev-prontuario',telefone:'prev-tel',raca:'prev-raca',escolaridade:'prev-escol',nome_mae:'prev-nome-mae',cep:'prev-cep',logradouro:'prev-logr',numero:'prev-num',bairro:'prev-bairro',municipio:'prev-mun'},
  id:{nome:'id-nome',cpf:'id-cpf',nasc:'id-nasc',cronicas:'id-cron',cuidador:'id-cuidador',rede_apoio:'id-rede-apoio',visita_domiciliar:'id-visita',risco_queda:'id-risco-queda',fragilidade:'id-fragilidade',polifarmacia:'id-polifarmacia'},
  sm:{nome:'sm-nome',cpf:'sm-cpf',nasc:'sm-nasc',cns:'sm-cns',prontuario:'sm-prontuario',endereco:'sm-area',telefone:'sm-tel',raca:'sm-raca',escolaridade:'sm-escol',ocupacao:'sm-ocupacao',responsavel:'sm-resp',sexo:'sm-sexo'},
  ger:{nome:'ger-nome',cpf:'ger-cpf',nasc:'ger-nasc',cns:'ger-cns',telefone:'ger-telefone',endereco:'ger-endereco',microarea:'ger-microarea'},
  acol:{nome:'acol-nome',cpf:'acol-cpf',nasc:'acol-nasc',cns:'acol-cns',telefone:'acol-telefone',endereco:'acol-endereco',microarea:'acol-microarea'},
  hip:{nome:'hip-nome',cpf:'hip-cpf',nasc:'hip-nasc',cns:'hip-cns',telefone:'hip-telefone',endereco:'hip-endereco',microarea:'hip-microarea',cronicas:'hip-diagnostico'},
  fer:{nome:'fer-nome',cpf:'fer-cpf',nasc:'fer-nasc',cns:'fer-cns',telefone:'fer-telefone',endereco:'fer-endereco',microarea:'fer-microarea'},
  puerp:{nome:'puerp-nome',cpf:'puerp-cpf',nasc:'puerp-nasc',cns:'puerp-cns',telefone:'puerp-telefone',endereco:'puerp-endereco',microarea:'puerp-microarea'},
  ist:{nome:'ist-nome',cpf:'ist-cpf',nasc:'ist-nasc',cns:'ist-cns',telefone:'ist-telefone',endereco:'ist-endereco',microarea:'ist-microarea'},
  vd:{nome:'vd-nome',cpf:'vd-cpf',nasc:'vd-nasc',cns:'vd-cns',telefone:'vd-telefone',microarea:'vd-microarea'}
};
function normalizarCPF(v){return String(v||'').replace(/\D/g,'').slice(0,11);}
function formatarCPF(v){const n=normalizarCPF(v);return n.length===11?n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'):v;}
function carregarPacientes(){try{return JSON.parse(localStorage.getItem(chaveDadosLocais(PAC_KEY))||'{}')}catch(e){return{}}}
function salvarPacientesLocal(p){if(!CURRENT_AUTH_USER_ID)throw new Error('Identifique-se antes de salvar pacientes.');localStorage.setItem(chaveDadosLocais(PAC_KEY),JSON.stringify(p));}
function moduloPorPrefixo(prefix){return Object.values(MODULOS_ATENDIMENTO).find(x=>x.prefix===prefix)}
function coletarDadosPaciente(prefix){
  const mapa=CAMPOS_PACIENTE[prefix]||{}, dados={};
  Object.entries(mapa).forEach(([k,id])=>{const v=document.getElementById(id)?.value?.trim();if(v)dados[k]=v;});
  dados.cpf=normalizarCPF(dados.cpf);
  return dados;
}
function preencherDadosPaciente(prefix,dados){
  const mapa=CAMPOS_PACIENTE[prefix]||{};
  Object.entries(mapa).forEach(([k,id])=>{const el=document.getElementById(id);if(el&&dados?.[k])el.value=k==='cpf'?formatarCPF(dados[k]):dados[k];});
  if(prefix==='pna')idadeGest(); if(prefix==='pu'){idadeCrianca();updateAntropometria();checkMCHATIdade();} if(prefix==='prev'){idadePrev();prevVerificaIdade();} if(prefix==='id')idadeIdoso(); if(prefix==='sm')idadeSM();
}
async function buscarPacientePorCPF(input){
  const cpf=normalizarCPF(input?.value);if(cpf.length!==11)return;
  input.value=formatarCPF(cpf);
  const uid=CURRENT_AUTH_USER_ID,prefix=input.id.split('-')[0], locais=carregarPacientes();
  let dados=locais[cpf]||null;
  if(_sb&&CURRENT_AUTH_USER_ID&&navigator.onLine){
    try{const r=await _sb.from('pacientes').select('dados').eq('cpf',cpf).maybeSingle();if(uid!==CURRENT_AUTH_USER_ID||normalizarCPF(input.value)!==cpf)return;const pendentes=JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]');if(!r.error&&r.data?.dados&&!pendentes.includes(cpf)){dados={...(dados||{}),...r.data.dados};const atuais=carregarPacientes();atuais[cpf]=dados;salvarPacientesLocal(atuais);}}catch(e){}
  }
  if(uid!==CURRENT_AUTH_USER_ID||normalizarCPF(input.value)!==cpf)return;
  if(dados){preencherDadosPaciente(prefix,dados);showToast('✓ Cadastro do paciente localizado e preenchido.');}
  else showToast('CPF ainda não cadastrado. Os dados serão salvos ao finalizar o atendimento.');
}
async function salvarCadastroPaciente(prefix){
  if(!CURRENT_AUTH_USER_ID)throw new Error('Sessão necessária para salvar cadastro.');
  const novos=coletarDadosPaciente(prefix),cpf=normalizarCPF(novos.cpf);if(cpf.length!==11)return;
  const pacientes=carregarPacientes();pacientes[cpf]={...(pacientes[cpf]||{}),...novos};salvarPacientesLocal(pacientes);
  const key=chavePacientesPendentes(),pendentes=new Set(JSON.parse(localStorage.getItem(key)||'[]'));pendentes.add(cpf);localStorage.setItem(key,JSON.stringify([...pendentes]));
  return sincronizarPacientesPendentes();
}
let sincronizacaoPacientesAtiva=null;
async function sincronizarPacientesPendentes(){
  if(!_sb||!CURRENT_AUTH_USER_ID||!navigator.onLine)return {pendente:true};
  if(sincronizacaoPacientesAtiva)return sincronizacaoPacientesAtiva;
  const uid=CURRENT_AUTH_USER_ID,key=chavePacientesPendentes(),patientKey=chaveDadosLocais(PAC_KEY);
  sincronizacaoPacientesAtiva=(async()=>{
    const cpfs=JSON.parse(localStorage.getItem(key)||'[]'),falhas=[];
    for(const cpf of cpfs){
      if(CURRENT_AUTH_USER_ID!==uid)break;
      const pacientes=JSON.parse(localStorage.getItem(patientKey)||'{}'),dados=pacientes[cpf];
      if(!dados){falhas.push(cpf);continue;}
      const snapshot=JSON.stringify(dados);
      try{
        const r=await _sb.from('pacientes').upsert({cpf,dados,updated_by:uid},{onConflict:'cpf'});
        if(r.error)throw r.error;
        // Do not acknowledge a newer local edit or an item from a different session.
        const atuais=JSON.parse(localStorage.getItem(patientKey)||'{}');
        if(JSON.stringify(atuais[cpf])===snapshot){const pend=new Set(JSON.parse(localStorage.getItem(key)||'[]'));pend.delete(cpf);localStorage.setItem(key,JSON.stringify([...pend]));}
      }catch(e){falhas.push(cpf);console.warn('[ESF] Cadastro permanece pendente de sincronização.');}
    }
    if(CURRENT_AUTH_USER_ID===uid&&falhas.length)showToast('Cadastro salvo neste dispositivo; sincronização pendente. Tente novamente quando a conexão voltar.');
    return {falhas,pendentes:JSON.parse(localStorage.getItem(key)||'[]').length};
  })();
  try{return await sincronizacaoPacientesAtiva;}finally{sincronizacaoPacientesAtiva=null;}
}

async function baixarPacientesNuvem(forcar=false){
  if(!_sb||!CURRENT_AUTH_USER_ID||!navigator.onLine)return;
  const uid=CURRENT_AUTH_USER_ID;
  try{
    const {data,error}=await _sb.from('pacientes').select('cpf,dados').order('updated_at',{ascending:false});
    if(error)throw error;
    if(CURRENT_AUTH_USER_ID!==uid)return;
    const locais=carregarPacientes(),pendentes=new Set(JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]'));
    (data||[]).forEach(p=>{if(!pendentes.has(p.cpf))locais[p.cpf]={...(locais[p.cpf]||{}),...(p.dados||{}),cpf:p.cpf};});
    salvarPacientesLocal(locais);
    if(document.getElementById('pg-pacientes')?.classList.contains('on'))renderPacientes();
    if(forcar)showToast('Banco de pacientes atualizado.');
  }catch(e){if(forcar)showToast('Não foi possível atualizar o banco de pacientes.');}
}
function enderecoPaciente(d){return d.endereco||[d.logradouro,d.numero,d.bairro,d.municipio].filter(Boolean).join(', ')||'-'}
function consultasDoPaciente(cpf,nome,ats){
  const n=String(nome||'').toLowerCase();
  // ats opcional: quando o chamador já carregou os atendimentos, evita re-parsear o
  // localStorage a cada paciente (era O(pacientes × atendimentos) com JSON.parse repetido).
  return (ats||carregarAtendimentos()).filter(a=>(cpf&&a.cpf===cpf)||(!cpf&&n&&String(a.nome||'').toLowerCase()===n)).sort((a,b)=>new Date(b.data)-new Date(a.data));
}
function renderPacientes(){
  if(!temPermissao('ver_historico'))return;
  const busca=(document.getElementById('pac-busca')?.value||'').toLowerCase().replace(/\D/g,'');
  const buscaTexto=(document.getElementById('pac-busca')?.value||'').toLowerCase();
  const pacientes=Object.entries(carregarPacientes()).map(([cpf,d])=>({cpf,...d})).filter(d=>{
    const txt=[d.nome,d.cpf,d.cns,d.telefone,enderecoPaciente(d),d.parceiro_nome,d.microarea,d.acs,d.familia].join(' ').toLowerCase();
    return !buscaTexto||txt.includes(buscaTexto)||(busca&&normalizarCPF(d.cpf).includes(busca));
  }).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'));
  const consultas=carregarAtendimentos(),comConsulta=new Set(consultas.map(a=>a.cpf).filter(Boolean));
  const stats=document.getElementById('pac-stats');if(stats)stats.innerHTML=`<div class="hist-stat"><strong>${pacientes.length}</strong>pacientes</div><div class="hist-stat"><strong>${comConsulta.size}</strong>com consulta</div><div class="hist-stat"><strong>${pacientes.filter(p=>p.parceiro_nome).length}</strong>com parceiro</div>`;
  const el=document.getElementById('pac-lista');if(!el)return;
  if(!pacientes.length){el.innerHTML='<div class="pac-empty">Nenhum paciente cadastrado. O cadastro será criado automaticamente ao salvar uma consulta com CPF.</div>';return;}
  el.innerHTML=pacientes.map(p=>{const cs=consultasDoPaciente(p.cpf,p.nome,consultas),ult=cs[0];return`<div class="pac-card" onclick="abrirPaciente('${p.cpf}')"><div class="pac-name">${escTR(p.nome||'Paciente sem nome')}</div><div class="pac-meta">CPF: ${escTR(formatarCPF(p.cpf))}${p.cns?`<br>CNS: ${escTR(p.cns)}`:''}${p.telefone?`<br>Contato: ${escTR(p.telefone)}`:''}<br>Endereço: ${escTR(enderecoPaciente(p))}</div><div class="pac-last">${ult?`Última consulta: <strong>${escTR(ult.tipo)}</strong> · ${new Date(ult.data).toLocaleDateString('pt-BR')}`:'Sem consulta relacionada'}</div></div>`}).join('');
}
let PACIENTE_MODAL_CPF='';
function abrirPaciente(cpf){
  const d=carregarPacientes()[cpf];if(!d)return;const cs=consultasDoPaciente(cpf,d.nome),ult=cs[0];
  registrarAuditoria('Cadastro de paciente acessado',`CPF final ${String(cpf).slice(-4)}`);
  PACIENTE_MODAL_CPF=cpf;
  document.getElementById('pac-modal-titulo').textContent=d.nome||'Paciente';
  const item=(l,v)=>v?`<div class="pac-detail-item"><b>${l}</b>${escTR(v)}</div>`:'';
  document.getElementById('pac-modal-conteudo').innerHTML=`<div class="pac-detail-grid">${item('CPF',formatarCPF(cpf))}${item('CNS',d.cns)}${item('Nascimento',d.nasc?formatarDataBR(d.nasc):'')}${item('Prontuário',d.prontuario)}${item('Telefone',d.telefone)}${item('Endereço',enderecoPaciente(d))}${item('Microárea',d.microarea)}${item('ACS responsável',d.acs)}${item('Família',d.familia)}${item('Vulnerabilidade',d.vulnerabilidade)}${item('Necessita visita',d.visita_domiciliar)}${item('Raça/cor',d.raca)}${item('Escolaridade',d.escolaridade)}${item('Ocupação',d.ocupacao)}${item('Responsável',d.responsavel)}${item('Nome da mãe',d.nome_mae)}${item('Parceiro(a)',d.parceiro_nome)}${item('Nascimento do parceiro',d.parceiro_nasc?formatarDataBR(d.parceiro_nasc):'')}${item('Prontuário do parceiro',d.parceiro_prontuario)}${item('Última consulta',ult?`${ult.tipo} em ${new Date(ult.data).toLocaleString('pt-BR')}`:'Sem consulta')}</div><div class="ct"><span class="dot db"></span>Consultas relacionadas</div><div class="pac-consultas">${cs.length?cs.map(a=>`<div class="pac-consulta"><strong>${escTR(a.tipo)}</strong> · ${new Date(a.data).toLocaleString('pt-BR')}<button class="hist-btn hist-btn-edit" style="float:right" onclick="fecharPaciente();reabrirAtendimento('${a.id}')">Reabrir</button><div style="color:var(--tx3);margin-top:3px">${escTR(a.profissional||'')}</div></div>`).join(''):'<div class="pac-consulta">Nenhuma consulta relacionada.</div>'}</div>`;
  document.getElementById('pac-modal').classList.add('open');
}
function fecharPaciente(){document.getElementById('pac-modal').classList.remove('open');PACIENTE_MODAL_CPF=''}
const PACIENTE_CAMPOS_EDICAO=[
  ['nome','Nome completo','text'],['cpf','CPF','text'],['cns','CNS','text'],['nasc','Data de nascimento','date'],
  ['prontuario','Prontuário / registro local','text'],['telefone','Telefone / WhatsApp','text'],['cep','CEP','text'],['logradouro','Logradouro','text'],
  ['numero','Número','text'],['complemento','Complemento','text'],['bairro','Bairro','text'],['municipio','Município','text'],
  ['endereco','Endereço / referência complementar','text'],['microarea','Microárea','text'],['acs','ACS responsável','text'],['familia','Família','text'],
  ['responsavel_familiar','Responsável familiar','text'],['raca','Raça/cor','text'],['escolaridade','Escolaridade','text'],['ocupacao','Ocupação','text'],
  ['condicao_moradia','Condição de moradia','text'],['rede_apoio','Rede de apoio','text'],['vulnerabilidade','Vulnerabilidade social','text'],['beneficio_social','Benefício social','text'],
  ['dificuldade_acesso','Dificuldade de acesso à UBS','text'],['visita_domiciliar','Necessidade de visita domiciliar','text'],['responsavel','Responsável/cuidador','text'],['nome_mae','Nome da mãe','text'],
  ['parceiro_nome','Nome do parceiro(a)','text'],['parceiro_cpf','CPF do parceiro(a)','text'],['parceiro_nasc','Nascimento do parceiro(a)','date'],['parceiro_prontuario','Prontuário do parceiro(a)','text'],
  ['cronicas','Condições crônicas / observações cadastrais','textarea']
];
function editarCadastroPacienteAtual(){
  const cpf=PACIENTE_MODAL_CPF,d=carregarPacientes()[cpf];if(!d)return;
  document.getElementById('pac-modal-titulo').textContent='Editar cadastro do paciente';
  const campo=([k,l,t])=>`<div class="f ${k==='endereco'||k==='cronicas'?'span2':''}"><label>${escTR(l)}</label>${t==='textarea'?`<textarea id="pac-edit-${k}">${escTR(d[k]||'')}</textarea>`:`<input id="pac-edit-${k}" type="${t}" value="${escTR(k==='cpf'?formatarCPF(cpf):(d[k]||''))}">`}</div>`;
  document.getElementById('pac-modal-conteudo').innerHTML=`<div class="alert alert-i">Atualize documentação, endereço, território e informações familiares. O histórico de consultas é preservado.</div><div class="patient-edit-grid">${PACIENTE_CAMPOS_EDICAO.map(campo).join('')}</div><div class="edit-actions"><button class="btn btn-p" onclick="salvarEdicaoPaciente()">Salvar alterações</button><button class="btn btn-s" onclick="abrirPaciente('${cpf}')">Cancelar</button></div>`;
}
async function salvarEdicaoPaciente(){
  const antigo=PACIENTE_MODAL_CPF,banco=carregarPacientes(),original=banco[antigo]||{},dados={...original};
  PACIENTE_CAMPOS_EDICAO.forEach(([k])=>{const e=document.getElementById(`pac-edit-${k}`);if(e)dados[k]=e.value.trim()});
  const novo=normalizarCPF(dados.cpf||antigo);if(novo.length!==11){showToast('Confira o CPF: são necessários 11 números.');return}
  dados.cpf=novo;if(novo!==antigo)delete banco[antigo];banco[novo]=dados;salvarPacientesLocal(banco);PACIENTE_MODAL_CPF=novo;
  const pendentes=new Set(JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]'));pendentes.delete(antigo);pendentes.add(novo);localStorage.setItem(chavePacientesPendentes(),JSON.stringify([...pendentes]));
  if(_sb&&CURRENT_AUTH_USER_ID&&navigator.onLine){try{await _sb.from('pacientes').upsert({cpf:novo,dados,updated_by:CURRENT_AUTH_USER_ID},{onConflict:'cpf'});if(novo!==antigo)await _sb.from('pacientes').delete().eq('cpf',antigo).eq('updated_by',CURRENT_AUTH_USER_ID)}catch(e){}}
  registrarAuditoria('Cadastro de paciente editado',`CPF final ${String(novo).slice(-4)}`);
  renderPacientes();abrirPaciente(novo);showToast('Cadastro atualizado.');
}
async function excluirCadastroPacienteAtual(){
  const cpf=PACIENTE_MODAL_CPF,d=carregarPacientes()[cpf];if(!d)return;
  if(!confirm(`Excluir o cadastro de ${d.nome||'este paciente'}?\n\nAs consultas do histórico serão preservadas.`))return;
  const banco=carregarPacientes();delete banco[cpf];salvarPacientesLocal(banco);
  const pendentes=new Set(JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]'));pendentes.delete(cpf);localStorage.setItem(chavePacientesPendentes(),JSON.stringify([...pendentes]));
  if(_sb&&CURRENT_AUTH_USER_ID&&navigator.onLine){try{await _sb.from('pacientes').delete().eq('cpf',cpf).eq('updated_by',CURRENT_AUTH_USER_ID)}catch(e){}}
  registrarAuditoria('Cadastro de paciente excluído',`CPF final ${String(cpf).slice(-4)}`);
  fecharPaciente();renderPacientes();showToast('Cadastro excluído. O histórico foi mantido.');
}
function baixarArquivo(nome,conteudo,tipo='application/json'){
  const url=URL.createObjectURL(new Blob([conteudo],{type:tipo})),a=document.createElement('a');
  a.href=url;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportarBancoPacientes(){
  const pacientes=Object.entries(carregarPacientes()).map(([cpf,dados])=>({cpf,...dados}));
  baixarArquivo(`banco-pacientes-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({tipo:'esf_banco_pacientes',versao:1,exportado_em:new Date().toISOString(),pacientes},null,2));
}
function lerLinhaCSV(linha,separador){
  const out=[];let atual='',aspas=false;
  for(let i=0;i<linha.length;i++){const c=linha[i];if(c==='"'&&linha[i+1]==='"'){atual+='"';i++;}else if(c==='"')aspas=!aspas;else if(c===separador&&!aspas){out.push(atual.trim());atual='';}else atual+=c;}
  out.push(atual.trim());return out;
}
function normalizarChaveImportacao(k){
  return String(k||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
}
function pacientesDeCSV(texto){
  const linhas=texto.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(linhas.length<2)throw new Error('CSV sem registros.');
  const separador=(linhas[0].match(/;/g)||[]).length>(linhas[0].match(/,/g)||[]).length?';':',';
  const cab=lerLinhaCSV(linhas[0],separador).map(normalizarChaveImportacao);
  return linhas.slice(1).map(l=>{const vals=lerLinhaCSV(l,separador),d={};cab.forEach((k,i)=>{if(k&&vals[i])d[k]=vals[i]});return d;});
}
async function importarBancoPacientes(event){
  const arquivo=event.target.files?.[0];event.target.value='';if(!arquivo)return;
  try{
    const texto=await arquivo.text();let registros;
    if(arquivo.name.toLowerCase().endsWith('.csv'))registros=pacientesDeCSV(texto);
    else{const obj=JSON.parse(texto);registros=Array.isArray(obj)?obj:Array.isArray(obj.pacientes)?obj.pacientes:Object.entries(obj).map(([cpf,d])=>({cpf,...d}));}
    const atuais=carregarPacientes();let novos=0,atualizados=0,ignorados=0;const pendentes=new Set(JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]'));
    registros.forEach(orig=>{
      const d={};Object.entries(orig||{}).forEach(([k,v])=>{const nk=normalizarChaveImportacao(k);if(v!==null&&v!==undefined&&String(v).trim())d[nk]=String(v).trim()});
      d.cpf=normalizarCPF(d.cpf||d.cpf_paciente||d.documento);if(d.cpf.length!==11){ignorados++;return;}
      if(atuais[d.cpf])atualizados++;else novos++;
      atuais[d.cpf]={...(atuais[d.cpf]||{}),...d,cpf:d.cpf};pendentes.add(d.cpf);
    });
    salvarPacientesLocal(atuais);localStorage.setItem(chavePacientesPendentes(),JSON.stringify([...pendentes]));renderPacientes();await sincronizarPacientesPendentes();
    showToast(`Importação concluída: ${novos} novos, ${atualizados} atualizados, ${ignorados} ignorados sem CPF válido.`);
  }catch(e){showToast(`Não foi possível importar: ${e.message||e}`);}
}
document.addEventListener('input',e=>{if(e.target.matches?.('.paciente-cpf')){e.target.value=formatarCPF(e.target.value);clearTimeout(e.target._cpfTimer);e.target._cpfTimer=setTimeout(()=>buscarPacientePorCPF(e.target),500);}});
document.addEventListener('blur',e=>{if(e.target.matches?.('.paciente-cpf'))buscarPacientePorCPF(e.target);},true);

function carregarUsuario() {
  try {
    // Try new key, fallback to old key for migration
    let raw = localStorage.getItem(USR_KEY);
    if (!raw) raw = localStorage.getItem('esf_usuario'); // migrate old
    const u = JSON.parse(raw || 'null');
    if (u && u.nome) {
      const nome = document.getElementById('u-nome');
      const cargo = document.getElementById('u-cargo');
      const conselho = document.getElementById('u-conselho');
      const unidade = document.getElementById('u-unidade');
      if (nome) nome.value = u.nome || '';
      if (cargo) cargo.value = u.cargo || '';
      if (conselho) conselho.value = u.conselho || '';
      if (unidade) unidade.value = u.unidade || '';
      atualizarChip(u);
      // Re-save under new key
      localStorage.setItem(chaveUsuarioAtual(), JSON.stringify(u));
    }
  } catch(e) { console.warn('[ESF] carregarUsuario:', e); }
}

function salvarUsuario() {
  const nomeEl = document.getElementById('u-nome');
  const cargoEl = document.getElementById('u-cargo');
  const conselhoEl = document.getElementById('u-conselho');
  const unidadeEl = document.getElementById('u-unidade');
  if (!nomeEl || !cargoEl) { alert('Erro: campos não encontrados!'); return; }
  const u = {
    nome: nomeEl.value.trim(),
    cargo: cargoEl.value,
    conselho: conselhoEl ? conselhoEl.value.trim() : '',
    unidade: unidadeEl ? unidadeEl.value.trim() : '',
  };
  if (!u.nome) { showToast('Informe seu nome!'); nomeEl.focus(); return; }
  try {
    localStorage.setItem(chaveUsuarioAtual(), JSON.stringify(u));
    CURRENT_USER_PROFILE=u;
  } catch(e) {
    alert('Erro ao salvar: ' + e.message);
    return;
  }
  atualizarChip(u);
  document.getElementById('user-modal').classList.remove('open');
  showToast('✓ Profissional salvo! ' + u.nome);
}

function atualizarChip(u) {
  const initials = u.nome.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  document.getElementById('user-avatar-icon').innerHTML = initials || ic('user');
  document.getElementById('user-chip-label').textContent = u.nome.split(' ')[0];
  atualizarResumoDashboard();
}

function getUsuarioAtual() {
  if(CURRENT_USER_PROFILE?.nome)return CURRENT_USER_PROFILE;
  try { return JSON.parse(localStorage.getItem(chaveUsuarioAtual()) || localStorage.getItem(USR_KEY) || 'null'); } catch(e) { return null; }
}

function avaliarDNPMAutomatico() {
  const nasc=document.getElementById('pu-nasc')?.value, cls=document.getElementById('pu-dnpm-class'), obs=document.getElementById('pu-dnpm-obs');
  if(!nasc||!cls||!obs)return;
  if(!Array.from(cls.options).some(o=>o.value==='Não avaliado / não informado')){
    const opt=document.createElement('option');opt.value='Não avaliado / não informado';opt.textContent='Não avaliado / não informado';cls.insertBefore(opt,cls.firstChild);
  }
  const idade=calcAgeDetail(nasc), meses=idade?.totalM;
  if(!Number.isFinite(meses))return;
  const faixas=[2,4,6,9,12,15,18,24], atual=[...faixas].reverse().find(m=>meses>=m);
  if(!atual){cls.value='Não avaliado / não informado';obs.value='Criança abaixo da primeira faixa de marcos disponível; manter vigilância do desenvolvimento e registrar marcos observados quando aplicável.';atualizaDNPM();return;}
  const anterior=[...faixas].reverse().find(m=>m<atual);
  const marcados=m=>Array.from(document.querySelectorAll(`.dnpm-marco[data-mes="${m}"]:checked`)).map(e=>e.closest('.cki')?.textContent.trim()).filter(Boolean);
  const todos=m=>Array.from(document.querySelectorAll(`.dnpm-marco[data-mes="${m}"]`)).map(e=>e.closest('.cki')?.textContent.trim()).filter(Boolean);
  const presentesAtual=marcados(atual), presentesAnterior=anterior?marcados(anterior):[];
  const totalEsperado=todos(atual).length+(anterior?todos(anterior).length:0);
  const totalPresente=presentesAtual.length+presentesAnterior.length;
  if(totalPresente===0){
    cls.value='Não avaliado / não informado';
    obs.value='Nenhum marco foi marcado como observado. Marcos sem marcação serão tratados como não avaliados, e não como ausentes.';
  }else if(totalPresente<totalEsperado){
    if(!/prov[aá]vel atraso|poss[ií]vel atraso/i.test(cls.value))cls.value='Não avaliado / não informado';
    obs.value=`Marcos presentes registrados: ${[...presentesAnterior,...presentesAtual].join('; ')}. Marcos não marcados são tratados como não avaliados; classificar atraso apenas se o marco foi testado e realmente ausente.`;
  }else{
    cls.value='Adequado para a idade';
    obs.value=`Marcos esperados da faixa atual${anterior?` e anterior`:''} registrados como presentes. Manter vigilância do desenvolvimento.`;
  }
  atualizaDNPM();
}
document.addEventListener('change',e=>{if(e.target.matches?.('.dnpm-marco')||e.target.id==='pu-nasc')avaliarDNPMAutomatico();});
document.addEventListener('input',e=>{if(e.target.id==='pu-nasc')avaliarDNPMAutomatico();});

// ══ GESTÃO DA ESF, TERRITÓRIO, IVCF-20 E PLANO DE CUIDADOS ══
const GESTAO_STATUS_KEY='esf_busca_ativa_status_v1';
const GESTAO_ACOES=['Agendar consulta','Visita domiciliar','Contato telefônico','ACS realizar busca','Encaminhar','Atualizar cadastro'];
const gestEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const diasDesde=d=>d?Math.floor((Date.now()-new Date(d).getTime())/86400000):99999;
const idadeAnos=nasc=>{if(!nasc)return null;const d=new Date(nasc+'T00:00:00'),h=new Date();let a=h.getFullYear()-d.getFullYear();if(h<new Date(h.getFullYear(),d.getMonth(),d.getDate()))a--;return a};
function preencherSelectGestao(id,valores){const s=document.getElementById(id);if(!s)return;const atual=s.value;s.innerHTML='<option value="">Todos</option>'+[...new Set(valores.filter(Boolean))].sort().map(v=>`<option>${gestEsc(v)}</option>`).join('');s.value=atual}
function dadosGestao(){
  const ats=carregarAtendimentos(), pacientes=Object.entries(carregarPacientes()).map(([cpf,d])=>({cpf,...d}));
  return pacientes.map(p=>{const cs=consultasDoPaciente(p.cpf,p.nome,ats),ult=cs[0];return{...p,consultas:cs,ultima:ult,idade:idadeAnos(p.nasc),microarea:p.microarea||p.area||'',acs:p.acs||''}});
}
// Debounce para buscas de gestão: evita recomputar dadosGestao a cada tecla digitada.
let _debGestao;
function buscaGestaoDebounce(fn){clearTimeout(_debGestao);_debGestao=setTimeout(fn,350);}
function renderBuscaGeralESF(){const q=(val('busca-geral-esf')||'').toLowerCase(),el=document.getElementById('busca-geral-resultado');if(!el)return;if(q.length<2){el.innerHTML='';return}const ps=dadosGestao().filter(p=>[p.nome,p.cpf,p.cns,p.microarea].join(' ').toLowerCase().includes(q)).slice(0,8);el.innerHTML=ps.length?`<div class="gestao-table-wrap"><table class="gestao-table"><tbody>${ps.map(p=>`<tr><td><strong>${gestEsc(p.nome)}</strong><br><small>${gestEsc(p.microarea||'Sem microárea')}</small></td><td>${gestEsc(formatarCPF(p.cpf))}</td><td>${p.ultima?gestEsc(p.ultima.tipo)+' · '+new Date(p.ultima.data).toLocaleDateString('pt-BR'):'Sem atendimento'}</td><td><button class="btn btn-s" onclick="abrirModulo('pacientes');setTimeout(()=>abrirPaciente('${p.cpf}'),100)">Abrir</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="alert alert-i">Nenhum paciente encontrado.</div>'}
function dadoAtendimento(a,id){const v=a?.dados?.[id];return typeof v==='object'?v.value||'':v||''}
function temDadoAtendimento(a,fragmento){return Object.entries(a?.dados||{}).some(([k,v])=>k.includes(fragmento)&&String(typeof v==='object'?v.value||v.checked:v||'').trim()&&!['false','-','—'].includes(String(v)))}
function atendimentoContem(a,termo){return [a?.soap,...Object.values(a?.dados||{}).map(v=>typeof v==='object'?v.value||'':v)].join(' ').toLowerCase().includes(String(termo).toLowerCase())}
function alertasBuscaAtiva(){
  const status=JSON.parse(localStorage.getItem(chaveDadosLocais(GESTAO_STATUS_KEY))||'{}'),out=[];
  const add=(p,linha,motivo,prioridade,acao,ref)=>out.push({id:[p.cpf,linha,motivo].join('|'),cpf:p.cpf,nome:p.nome||'Paciente sem nome',microarea:p.microarea||'',linha,motivo,prioridade,acao,ultimo:ref?.data||p.ultima?.data||'',status:status[[p.cpf,linha,motivo].join('|')]||'pendente'});
  dadosGestao().forEach(p=>{
    if(!p.microarea||!p.telefone)add(p,'Território','Cadastro territorial ou contato incompleto','baixa','Atualizar cadastro',p.ultima);
    const pn=p.consultas.filter(a=>a.tipo==='Abertura PN'||a.tipo==='Consulta PN'), ultPn=pn[0], gestante=!!ultPn&&diasDesde(ultPn.data)<=300;
    if(gestante&&diasDesde(ultPn.data)>30)add(p,'Pré-natal','Sem consulta de pré-natal há mais de 30 dias','alta','Agendar consulta',ultPn);
    const abertura=pn.find(a=>a.tipo==='Abertura PN');
    const ig=String(dadoAtendimento(abertura,'pna-ig')||dadoAtendimento(abertura,'pna-ig-semanas')).match(/\d+/)?.[0];
    if(abertura&&Number(ig)>12)add(p,'Pré-natal','Pré-natal iniciado após 12 semanas','media','ACS realizar busca',abertura);
    if(gestante&&abertura&&!temDadoAtendimento(abertura,'tr-'))add(p,'Pré-natal','Sem testes rápidos registrados','alta','Agendar consulta',abertura);
    if(gestante&&abertura&&!temDadoAtendimento(abertura,'vac'))add(p,'Pré-natal','Sem vacinação registrada','media','Atualizar cadastro',abertura);
    if(p.idade!==null&&p.idade<10){
      const pu=p.consultas.find(a=>a.tipo==='Puericultura'),limite=p.idade<1?60:p.idade<2?90:180;
      if(!pu||diasDesde(pu.data)>limite)add(p,'Puericultura','Puericultura atrasada','alta','Agendar consulta',pu);
      if(String(p.vacina_atrasada||'').toLowerCase()==='sim'||(pu&&!temDadoAtendimento(pu,'vac')))add(p,'Puericultura','Vacina atrasada ou sem registro recente','alta','ACS realizar busca',pu);
    }
    if((String(p.sexo||'').toLowerCase().startsWith('f')||p.consultas.some(a=>a.tipo==='Preventivo'))&&p.idade>=25&&p.idade<=64){
      const prev=p.consultas.find(a=>a.tipo==='Preventivo');if(!prev||diasDesde(prev.data)>1095)add(p,'Preventivo','Preventivo pendente ou vencido','media','Agendar consulta',prev);
    }
    if(p.idade>=60){
      const id=p.consultas.find(a=>a.tipo==='Idoso');if(!id||diasDesde(id.data)>180)add(p,'Idoso','Sem avaliação recente','media','Agendar consulta',id);
      const risco=id&&([dadoAtendimento(id,'id-risco-queda'),dadoAtendimento(id,'id-fragilidade'),dadoAtendimento(id,'id-polifarmacia'),dadoAtendimento(id,'ivcf20-class')].join(' ').match(/alto|frágil|fragil|sim/i));
      if(risco)add(p,'Idoso','Risco de queda, polifarmácia ou fragilidade','alta','Visita domiciliar',id);
    }
    const sm=p.consultas.find(a=>a.tipo==='Saúde Mental');if(sm&&(!temDadoAtendimento(sm,'retorno')||diasDesde(sm.data)>90))add(p,'Saúde Mental','Sem retorno agendado ou acompanhamento recente','alta','Contato telefônico',sm);
    if(String(p.faltoso||'').toLowerCase()==='sim')add(p,'Acompanhamento','Paciente faltoso','alta','ACS realizar busca',p.ultima);
    if(p.cronicas&&(!p.ultima||diasDesde(p.ultima.data)>180))add(p,'Condição crônica','Condição crônica sem acompanhamento recente','alta','Agendar consulta',p.ultima);
    if(String(p.visita_domiciliar||'').toLowerCase()==='sim')add(p,'Território','Necessidade de visita domiciliar registrada','media','Visita domiciliar',p.ultima);
  });return out;
}
function filtrosGestao(){
  const dados=dadosGestao(),ats=carregarAtendimentos();
  ['ba-microarea','ind-microarea','terr-filtro-microarea','rel-microarea'].forEach(id=>preencherSelectGestao(id,dados.map(p=>p.microarea)));
  preencherSelectGestao('terr-filtro-acs',dados.map(p=>p.acs));preencherSelectGestao('ind-profissional',ats.map(a=>a.profissional));
}
function marcarAlerta(id,status){const s=JSON.parse(localStorage.getItem(chaveDadosLocais(GESTAO_STATUS_KEY))||'{}');s[id]=status;localStorage.setItem(chaveDadosLocais(GESTAO_STATUS_KEY),JSON.stringify(s));renderBuscaAtiva()}
function renderBuscaAtiva(){
  filtrosGestao();const busca=(document.getElementById('ba-busca')?.value||'').toLowerCase(),linha=val('ba-linha'),pri=val('ba-prioridade'),micro=val('ba-microarea'),status=val('ba-status');
  const lista=alertasBuscaAtiva().filter(a=>(!busca||[a.nome,a.cpf,a.microarea,a.motivo].join(' ').toLowerCase().includes(busca))&&(!linha||a.linha===linha)&&(!pri||a.prioridade===pri)&&(!micro||a.microarea===micro)&&(!status||a.status===status));
  const k=document.getElementById('ba-kpis');if(k)k.innerHTML=[['Alertas',lista.length,''],['Alta prioridade',lista.filter(a=>a.prioridade==='alta').length,'alta'],['Média prioridade',lista.filter(a=>a.prioridade==='media').length,'media'],['Concluídos',lista.filter(a=>a.status==='concluido').length,'baixa']].map(x=>`<div class="gestao-kpi ${x[2]}"><strong>${x[1]}</strong><span>${x[0]}</span></div>`).join('');
  const t=document.getElementById('ba-tbody');if(t)t.innerHTML=lista.length?lista.map(a=>`<tr><td><strong>${gestEsc(a.nome)}</strong><br><small>${gestEsc(a.microarea||'Sem microárea')}</small></td><td>${gestEsc(a.linha)}</td><td>${gestEsc(a.motivo)}</td><td><span class="gestao-tag ${a.prioridade}">${a.prioridade}</span></td><td>${a.ultimo?new Date(a.ultimo).toLocaleDateString('pt-BR'):'Sem registro'}</td><td>${gestEsc(a.acao)}</td><td><button class="btn btn-s" onclick="marcarAlerta('${gestEsc(a.id)}','${a.status==='concluido'?'pendente':'concluido'}')">${a.status==='concluido'?'Reabrir':'Concluir'}</button></td></tr>`).join(''):'<tr><td colspan="7">Nenhum alerta encontrado com estes filtros.</td></tr>';
}
function exportarBuscaAtiva(){exportarLinhasCSV('busca-ativa',alertasBuscaAtiva().map(a=>({paciente:a.nome,cpf:a.cpf,microarea:a.microarea,linha:a.linha,motivo:a.motivo,prioridade:a.prioridade,ultimo:a.ultimo,acao:a.acao,status:a.status})))}
function barraGestao(label,n,max){return`<div class="gestao-bar-row"><span>${gestEsc(label)}</span><div class="gestao-bar-track"><div class="gestao-bar-fill" style="width:${max?Math.max(2,n/max*100):0}%"></div></div><strong>${n}</strong></div>`}
function renderIndicadores(){
  filtrosGestao();const mes=val('ind-mes'),micro=val('ind-microarea'),prof=val('ind-profissional'),linha=val('ind-linha'),risco=val('ind-risco');
  let ps=dadosGestao().filter(p=>!micro||p.microarea===micro), ats=carregarAtendimentos().filter(a=>(!mes||a.data.slice(0,7)===mes)&&(!prof||a.profissional===prof)&&(!linha||a.tipo===linha));
  const alerts=alertasBuscaAtiva().filter(a=>(!micro||a.microarea===micro)&&(!risco||a.prioridade===risco)),count=l=>alerts.filter(a=>a.linha===l).length;
  const txtAt=a=>[a.tipo,a.soap,JSON.stringify(a.dados||{})].join(' ').toLowerCase(),vdAts=ats.filter(a=>a.tipo==='Visita Domiciliar'),vdRx=rx=>vdAts.filter(a=>rx.test(txtAt(a))).length;
  const metrics=[['Pacientes cadastrados',ps.length],['Gestantes acompanhadas',ps.filter(p=>p.consultas.some(a=>['Abertura PN','Consulta PN'].includes(a.tipo)&&diasDesde(a.data)<=300)).length],['Gestantes de alto risco',ps.filter(p=>p.consultas.some(a=>['Abertura PN','Consulta PN'].includes(a.tipo)&&atendimentoContem(a,'alto risco'))).length],['Pré-natal atrasado',alerts.filter(a=>a.motivo.includes('30 dias')).length],['Crianças em puericultura',ps.filter(p=>p.consultas.some(a=>a.tipo==='Puericultura')).length],['Crianças com vacina atrasada',alerts.filter(a=>a.motivo.includes('Vacina atrasada')).length],['Preventivos no mês',ats.filter(a=>a.tipo==='Preventivo').length],['Preventivos pendentes',count('Preventivo')],['Idosos acompanhados',ps.filter(p=>p.consultas.some(a=>a.tipo==='Idoso')).length],['Idosos com risco aumentado',alerts.filter(a=>a.linha==='Idoso'&&a.prioridade==='alta').length],['Saúde mental acompanhados',ps.filter(p=>p.consultas.some(a=>a.tipo==='Saúde Mental')).length],['Pacientes faltosos',alerts.filter(a=>a.motivo==='Paciente faltoso').length],['Visitas domiciliares',vdAts.length],['VD: acamados/restritos',vdRx(/acamado|restrito ao leito/)],['VD: sonda/dispositivo',vdRx(/sonda|gastrostomia|jejunostomia|traqueostomia|oxigenoterapia|ostomia/)],['VD: LPP/ferida',vdRx(/les[aã]o por press[aã]o|\blpp\b|ferida|curativo complexo/)],['VD: alto risco',vdRx(/risco da visita:\s*alto|classifica[cç][aã]o de risco alto|risco alto/)],['VD: cuidador sobrecarregado',vdRx(/cuidador sobrecarregado|sobrecarga do cuidador/)],['VD: insumos insuficientes',vdRx(/insumos insuficientes|falta de .*insumo|sufici[eê]ncia:\s*insuficientes/)],['VD: medicação a conferir',vdRx(/conferir medica[cç][oõ]es|sem prescri[cç][aã]o atual|dose\/uso n[aã]o registrado|hor[aá]rio n[aã]o registrado|poss[ií]vel duplicidade/)]];
  document.getElementById('ind-kpis').innerHTML=metrics.map(([l,n])=>`<div class="gestao-kpi"><strong>${n}</strong><span>${l}</span></div>`).join('');
  const meses={};carregarAtendimentos().forEach(a=>{const m=a.data.slice(0,7);meses[m]=(meses[m]||0)+1});const mm=Object.entries(meses).sort().slice(-12),maxM=Math.max(1,...mm.map(x=>x[1]));document.getElementById('ind-chart-meses').innerHTML=mm.map(x=>barraGestao(x[0],x[1],maxM)).join('')||'Sem atendimentos.';
  const ls={};ats.forEach(a=>ls[a.tipo]=(ls[a.tipo]||0)+1);const ll=Object.entries(ls),maxL=Math.max(1,...ll.map(x=>x[1]));document.getElementById('ind-chart-linhas').innerHTML=ll.map(x=>barraGestao(x[0],x[1],maxL)).join('')||'Sem atendimentos no período.';
}
const TERR_IDS={microarea:'terr-microarea',acs:'terr-acs',familia:'terr-familia',responsavel_familiar:'terr-responsavel-familiar',endereco:'terr-endereco',telefone:'terr-telefone',moradia:'terr-moradia',rede_apoio:'terr-rede-apoio',vulnerabilidade:'terr-vulnerabilidade',beneficio_social:'terr-beneficio',dificuldade_acesso:'terr-acesso',visita_domiciliar:'terr-visita',faltoso:'terr-faltoso',cronicas:'terr-cronicas'};
function limparCadastroTerritorial(){document.querySelectorAll('#pg-territorio input,#pg-territorio select').forEach(e=>e.value='')}
function abrirCadastroTerritorial(cpf){document.getElementById('terr-cpf').value=formatarCPF(cpf);carregarCadastroTerritorial()}
function carregarCadastroTerritorial(){const cpf=normalizarCPF(val('terr-cpf')),p=carregarPacientes()[cpf];if(!p)return;document.getElementById('terr-nome').value=p.nome||'';Object.entries(TERR_IDS).forEach(([k,id])=>document.getElementById(id).value=p[k]||'')}
async function salvarCadastroTerritorial(){const cpf=normalizarCPF(val('terr-cpf'));if(cpf.length!==11)return showToast('Informe um CPF válido para salvar o cadastro territorial.');const ps=carregarPacientes(),p={...(ps[cpf]||{}),cpf};Object.entries(TERR_IDS).forEach(([k,id])=>p[k]=val(id));if(!p.nome)p.nome=val('terr-nome');ps[cpf]=p;salvarPacientesLocal(ps);const pend=new Set(JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]'));pend.add(cpf);localStorage.setItem(chavePacientesPendentes(),JSON.stringify([...pend]));await sincronizarPacientesPendentes();showToast('Cadastro territorial salvo.');renderTerritorio()}
function renderTerritorio(){
  filtrosGestao();const busca=(val('terr-busca')||'').toLowerCase(),micro=val('terr-filtro-microarea'),acs=val('terr-filtro-acs'),grupo=val('terr-filtro-grupo');
  const alerts=alertasBuscaAtiva(),ps=dadosGestao().filter(p=>{const txt=[p.nome,p.cpf,p.cns,p.microarea,p.acs,p.familia].join(' ').toLowerCase();const okG=!grupo||(grupo==='visita'&&String(p.visita_domiciliar).toLowerCase()==='sim')||(grupo==='vulneravel'&&/média|alta/i.test(p.vulnerabilidade||''))||(grupo==='faltoso'&&String(p.faltoso).toLowerCase()==='sim')||(grupo==='sem_acomp'&&!p.ultima);return(!busca||txt.includes(busca))&&(!micro||p.microarea===micro)&&(!acs||p.acs===acs)&&okG});
  document.getElementById('terr-kpis').innerHTML=[['Pacientes',ps.length],['Precisam de visita',ps.filter(p=>String(p.visita_domiciliar).toLowerCase()==='sim').length],['Famílias vulneráveis',ps.filter(p=>/média|alta/i.test(p.vulnerabilidade||'')).length],['Alertas ativos',alerts.filter(a=>ps.some(p=>p.cpf===a.cpf)&&a.status!=='concluido').length]].map(x=>`<div class="gestao-kpi"><strong>${x[1]}</strong><span>${x[0]}</span></div>`).join('');
  const areas={};ps.forEach(p=>{const a=p.microarea||'Sem microárea',r=areas[a]||(areas[a]={microarea:a,pacientes:0,gestantes:0,criancas:0,idosos:0,cronicos:0,visitas:0});r.pacientes++;if(p.consultas.some(x=>['Abertura PN','Consulta PN'].includes(x.tipo)&&diasDesde(x.data)<=300))r.gestantes++;if(p.idade!==null&&p.idade<10)r.criancas++;if(p.idade>=60)r.idosos++;if(p.cronicas)r.cronicos++;if(String(p.visita_domiciliar).toLowerCase()==='sim')r.visitas++});document.getElementById('terr-resumo-microareas').innerHTML=tabelaObjetos(Object.values(areas));
  document.getElementById('terr-lista').innerHTML=ps.length?ps.map(p=>`<div class="territorio-paciente" onclick="abrirCadastroTerritorial('${p.cpf}')"><strong>${gestEsc(p.nome||'Sem nome')}</strong><small>${gestEsc(p.microarea||'Sem microárea')} · ACS: ${gestEsc(p.acs||'não informado')} · ${p.ultima?'Último: '+new Date(p.ultima.data).toLocaleDateString('pt-BR'):'sem acompanhamento'}</small></div>`).join(''):'<div class="territorio-paciente">Nenhum paciente encontrado.</div>';
}
function linhasRelatorio(){
  const tipo=val('rel-tipo','mensal'),mes=val('rel-mes'),micro=val('rel-microarea');let ats=carregarAtendimentos().filter(a=>!mes||a.data.slice(0,7)===mes),ps=dadosGestao().filter(p=>!micro||p.microarea===micro),alerts=alertasBuscaAtiva().filter(a=>!micro||a.microarea===micro);
  if(tipo==='gestantes')return ps.filter(p=>p.consultas.some(a=>['Abertura PN','Consulta PN'].includes(a.tipo)&&diasDesde(a.data)<=300)).map(p=>({paciente:p.nome,cpf:p.cpf,microarea:p.microarea,ultima:p.ultima?.data||'',alertas:alerts.filter(a=>a.cpf===p.cpf&&a.linha==='Pré-natal').map(a=>a.motivo).join('; ')}));
  if(tipo==='puericultura')return ats.filter(a=>a.tipo==='Puericultura').map(a=>({paciente:a.nome,cpf:a.cpf,data:a.data,profissional:a.profissional}));
  if(tipo==='preventivos')return ats.filter(a=>a.tipo==='Preventivo').map(a=>({paciente:a.nome,cpf:a.cpf,data:a.data,profissional:a.profissional}));
  if(tipo==='idosos')return alerts.filter(a=>a.linha==='Idoso').map(a=>({paciente:a.nome,cpf:a.cpf,motivo:a.motivo,prioridade:a.prioridade,ultima:a.ultimo}));
  if(tipo==='mental')return ats.filter(a=>a.tipo==='Saúde Mental').map(a=>({paciente:a.nome,cpf:a.cpf,data:a.data,profissional:a.profissional}));
  if(tipo==='busca')return alerts.map(a=>({paciente:a.nome,cpf:a.cpf,microarea:a.microarea,linha:a.linha,motivo:a.motivo,prioridade:a.prioridade,acao:a.acao}));
  if(tipo==='microarea')return ps.map(p=>({paciente:p.nome,cpf:p.cpf,microarea:p.microarea,acs:p.acs,ultima:p.ultima?.data||'',visita:p.visita_domiciliar||'',vulnerabilidade:p.vulnerabilidade||''}));
  if(tipo==='anonimo')return ats.map(a=>({tipo:a.tipo,mes:a.data.slice(0,7),profissional:a.profissional,microarea:carregarPacientes()[a.cpf]?.microarea||''}));
  return ats.map(a=>({paciente:a.nome,cpf:a.cpf,tipo:a.tipo,data:a.data,profissional:a.profissional,unidade:a.unidade}));
}
function tabelaObjetos(rows){if(!rows.length)return'<div class="alert alert-i">Nenhum dado para os filtros selecionados.</div>';const cols=Object.keys(rows[0]);return`<div class="gestao-table-wrap"><table class="gestao-table"><thead><tr>${cols.map(c=>`<th>${gestEsc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${gestEsc(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function renderRelatorio(){filtrosGestao();document.getElementById('rel-conteudo').innerHTML=tabelaObjetos(linhasRelatorio())}
function exportarLinhasCSV(nome,rows){if(!rows.length)return showToast('Não há dados para exportar.');const cols=Object.keys(rows[0]),q=v=>`"${String(v??'').replace(/"/g,'""')}"`;baixarArquivo(`${nome}-${new Date().toISOString().slice(0,10)}.csv`,[cols.map(q).join(';'),...rows.map(r=>cols.map(c=>q(r[c])).join(';'))].join('\r\n'),'text/csv;charset=utf-8')}
function exportarRelatorioCSV(){exportarLinhasCSV('relatorio-'+val('rel-tipo','esf'),linhasRelatorio())}

const IVCF_SECOES=[
  ['Idade',[['ivcf-idade','Faixa etária',[['60 a 74 anos',0],['75 a 84 anos',1],['85 anos ou mais',3]]]]],
  ['Autopercepção da saúde',[['ivcf-saude','Em geral, comparando com outras pessoas da mesma idade, considera sua saúde:',[['Excelente, muito boa ou boa',0],['Regular ou ruim',1]]]]],
  ['Atividades instrumentais de vida diária',[['ivcf-compras','Deixou de fazer compras por causa da saúde?',0,4],['ivcf-dinheiro','Deixou de controlar dinheiro/gastos por causa da saúde?',0,4],['ivcf-casa','Deixou de realizar pequenos trabalhos domésticos por causa da saúde?',0,4]]],
  ['Atividade básica de vida diária',[['ivcf-banho','Deixou de tomar banho sozinho?',0,6]]],
  ['Cognição',[['ivcf-esquecimento','Familiares referem esquecimento?',0,1],['ivcf-piora-memoria','O esquecimento está piorando?',0,1],['ivcf-memoria-cotidiano','O esquecimento impede alguma atividade cotidiana?',0,2]]],
  ['Humor',[['ivcf-tristeza','No último mês ficou com desânimo, tristeza ou desesperança?',0,2],['ivcf-interesse','No último mês perdeu o interesse em atividades antes prazerosas?',0,2]]],
  ['Mobilidade',[['ivcf-bracos','Incapaz de elevar os braços acima do ombro?',0,1],['ivcf-maos','Incapaz de manusear pequenos objetos?',0,1],['ivcf-perda-peso','Perda de peso não intencional, baixo IMC ou panturrilha reduzida?',0,2],['ivcf-caminhar','Dificuldade para caminhar que impeça atividade cotidiana?',0,2],['ivcf-quedas','Duas ou mais quedas no último ano?',0,2],['ivcf-incontinencia','Perde urina ou fezes sem querer?',0,2]]],
  ['Comunicação',[['ivcf-visao','Problema de visão que impeça atividade cotidiana?',0,2],['ivcf-audicao','Problema de audição que impeça atividade cotidiana?',0,2]]],
  ['Comorbidades múltiplas',[['ivcf-comorbidades','Cinco ou mais doenças, cinco ou mais medicamentos ou internação recente?',0,4]]]
];
function campoIVCF(item){if(Array.isArray(item[2]))return`<div class="f"><label>${item[1]}</label><select id="${item[0]}" class="ivcf-item" onchange="calcularIVCF20()"><option value="">—</option>${item[2].map(x=>`<option value="${x[1]}">${x[0]}</option>`).join('')}</select></div>`;return`<div class="f"><label>${item[1]}</label><select id="${item[0]}" class="ivcf-item" onchange="calcularIVCF20()"><option value="">Não avaliado</option><option value="0">Não</option><option value="${item[3]}">Sim</option></select></div>`}
function montarIVCF20(){const el=document.getElementById('ivcf20-form');if(!el||el.dataset.ready)return;el.dataset.ready='1';el.innerHTML=IVCF_SECOES.map(s=>`<div class="ivcf-dom"><h4>${s[0]}</h4><div class="ivcf-grid">${s[1].map(campoIVCF).join('')}</div></div>`).join('');calcularIVCF20()}
function calcularIVCF20(){
  const getN=id=>Number(document.getElementById(id)?.value||0);
  let total=getN('ivcf-idade')+getN('ivcf-saude')+Math.min(4,getN('ivcf-compras')+getN('ivcf-dinheiro')+getN('ivcf-casa'))+getN('ivcf-banho');
  ['ivcf-esquecimento','ivcf-piora-memoria','ivcf-memoria-cotidiano','ivcf-tristeza','ivcf-interesse','ivcf-bracos','ivcf-maos','ivcf-perda-peso','ivcf-caminhar','ivcf-quedas','ivcf-incontinencia','ivcf-visao','ivcf-audicao','ivcf-comorbidades'].forEach(id=>total+=getN(id));
  const completo=Array.from(document.querySelectorAll('.ivcf-item')).length>0&&Array.from(document.querySelectorAll('.ivcf-item')).every(e=>e.value!=='');
  const classe=!completo?'AVALIAÇÃO INCOMPLETA':total>=15?'Idoso frágil':total>=7?'Idoso em risco de fragilização':'Idoso robusto',nivel=total>=15?'alta':total>=7?'media':'';
  const out=document.getElementById('ivcf20-resultado');if(out){out.className='ivcf-result '+nivel;out.innerHTML=`Pontuação IVCF-20: <strong>${total} / 40</strong> — ${classe}.<br><small>${!completo?'Complete todos os itens antes de concluir a classificação. Pontuação exibida é parcial.':total>=15?'Realizar avaliação multidimensional, construir plano de cuidados e considerar acompanhamento compartilhado/visita domiciliar.':total>=7?'Investigar os domínios alterados, elaborar plano de cuidados e reavaliar precocemente.':'Manter promoção da saúde e acompanhamento periódico.'}</small>`}
  let hidden=document.getElementById('ivcf20-class');if(!hidden){hidden=document.createElement('input');hidden.type='hidden';hidden.id='ivcf20-class';document.getElementById('id-5')?.appendChild(hidden)}hidden.value=`${total} pontos — ${classe}`;avaliarRiscoIdoso();return{total:completo?total:null,pontuacaoParcial:total,completo,classe}
}
async function gerarIVCF20PDF(){
  if(!calcularIVCF20().completo)return showToast('Complete todos os itens do IVCF-20 antes de emitir a ficha.');
  const status=document.getElementById('ivcf20-pdf-status');if(status)status.textContent='Gerando...';
  try{
    if(!window.PDFLib||!window.IVCF20_MODELO_BASE64)throw new Error('Modelo oficial do IVCF-20 não carregado.');
    const doc=await PDFLib.PDFDocument.load(ersmBase64ToUint8Array(window.IVCF20_MODELO_BASE64)),page=doc.getPages()[0],font=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold),azul=PDFLib.rgb(.05,.18,.48);
    const x=(field,px,py,size=8)=>{const p=docCalPdfPoint('ivcf',field,'check',px,py);page.drawText('X',{x:p.x,y:p.y,size,font,color:azul})};
    const escolha=(id,y)=>{const v=Number(document.getElementById(id)?.value||0);x(id,v>0?184:237,y)};
    const idade=Number(val('ivcf-idade')||0);if(idade===0)x('ivcf-idade',389,720);else if(idade===1)x('ivcf-idade',389,709);else x('ivcf-idade',389,698);
    Number(val('ivcf-saude')||0)>0?x('ivcf-saude',389,676):x('ivcf-saude',389,687);
    [['ivcf-compras',646],['ivcf-dinheiro',616],['ivcf-casa',589],['ivcf-banho',569],['ivcf-esquecimento',524],['ivcf-piora-memoria',504],['ivcf-memoria-cotidiano',488],['ivcf-tristeza',457],['ivcf-interesse',434],['ivcf-bracos',390],['ivcf-maos',369],['ivcf-perda-peso',326],['ivcf-caminhar',303],['ivcf-quedas',283],['ivcf-incontinencia',263],['ivcf-visao',224],['ivcf-audicao',181],['ivcf-comorbidades',116]].forEach(([id,y])=>escolha(id,y));
    const r=calcularIVCF20(),pt=docCalPdfPoint('ivcf','ivcf-total','score',540,76);page.drawText(String(r.total),{x:pt.x,y:pt.y,size:10,font,color:azul});
    const bytes=await doc.save(),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=`ivcf20-${rotuloId(val('id-nome','paciente'))}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);if(status)status.textContent='IVCF-20 preenchido gerado.';
  }catch(e){console.error(e);if(status)status.textContent=e.message||'Não foi possível gerar o IVCF-20.'}
}
function sincronizarIdadeIVCF(){const idade=idadeAnos(val('id-nasc')),s=document.getElementById('ivcf-idade');if(!s||idade===null)return;s.value=idade>=85?'3':idade>=75?'1':'0';calcularIVCF20()}
function avaliarRiscoIdoso(){const n=Number(val('id-num-meds')||0),p=document.getElementById('id-polifarmacia');if(p&&n>=5)p.value='Sim — 5 ou mais medicamentos';const risco=document.getElementById('ivcf20-class')?.value||'';return/Frágil|15|16|17|18|19|2\d|3\d|40/i.test(risco)||/Alto|Frágil/i.test([val('id-risco-queda'),val('id-fragilidade')].join(' '))||n>=5}

const PLANO_MODULOS=[['pna','pna-6'],['pnc','pnc-6'],['pu','pu-6'],['prev','prev-6'],['id','id-6'],['sm','sm-3'],['ger','ger-soap'],['acol','acol-soap'],['hip','hip-soap'],['fer','fer-soap'],['puerp','puerp-soap'],['ist','ist-soap'],['vd','vd-soap']];
const CUIDADOS_PRONTOS=['Retornar se houver piora','Manter hidratação','Monitorar pressão arterial conforme orientação','Monitorar glicemia conforme orientação','Manter aleitamento materno exclusivo quando indicado','Realizar higiene da ferida conforme orientação','Manter curativo limpo e seco','Elevar membros inferiores se indicado','Evitar automedicação','Procurar urgência se apresentar sinais de alerta','Comparecer ao retorno agendado','Levar exames no retorno','Manter vacinação atualizada'];
const SAE_REGRAS=[
  {id:'respiratorio',rx:/falta de ar|dispneia|satura[cç][aã]o baixa|esfor[cç]o respirat[oó]rio|mv abolido|cianose|sibilos|crepita[cç][oõ]es/i,problema:'Alteração respiratória',diagnostico:'Padrão respiratório ineficaz',objetivo:'Manter ventilação e oxigenação adequadas.',resultado:'Estado respiratório: ventilação e troca gasosa preservadas ou melhoradas.',intervencoes:'Monitorar frequência respiratória, saturação, esforço respiratório e ausculta; posicionar para conforto; acionar avaliação médica/urgência diante de instabilidade.',orientacoes:'Orientar procura imediata de atendimento diante de piora da falta de ar, cianose, dor torácica ou rebaixamento.',cuidados:['Procurar urgência se apresentar sinais de alerta']},
  {id:'dor',rx:/\bdor\b|algia|c[oó]lica/i,problema:'Dor e impacto funcional',diagnostico:'Dor aguda',objetivo:'Reduzir a intensidade da dor e identificar sinais de gravidade.',resultado:'Nível de dor reduzido e conforto aumentado.',intervencoes:'Avaliar intensidade, localização, duração, fatores desencadeantes e sinais associados; aplicar medidas de conforto e encaminhar conforme gravidade.',orientacoes:'Orientar retorno se dor persistente, intensa ou acompanhada de sinais de alerta.',cuidados:['Retornar se houver piora','Evitar automedicação']},
  {id:'pele',rx:/ferida|curativo|necrose|exsudato|integridade da pele|les[aã]o por press[aã]o|celulite/i,problema:'Alteração da integridade cutânea/tissular',diagnostico:'Integridade tissular prejudicada',objetivo:'Favorecer cicatrização e prevenir complicações.',resultado:'Cicatrização da ferida com redução progressiva da lesão e ausência de infecção.',intervencoes:'Avaliar, medir e registrar a ferida; realizar cuidado conforme plano; monitorar tecido, exsudato, odor, dor e pele ao redor.',orientacoes:'Orientar proteção da lesão, higiene, manutenção do curativo e sinais de infecção.',cuidados:['Realizar higiene da ferida conforme orientação','Manter curativo limpo e seco','Procurar urgência se apresentar sinais de alerta']},
  {id:'infeccao',rx:/febre|infec[cç][aã]o|purulento|odor forte|calor local|sinais sist[eê]micos/i,problema:'Risco ou sinais sugestivos de infecção',diagnostico:'Risco de infecção',objetivo:'Prevenir progressão infecciosa e reconhecer agravamento precocemente.',resultado:'Controle de riscos: processo infeccioso ausente ou tratado oportunamente.',intervencoes:'Monitorar temperatura, sinais locais e sistêmicos; reforçar higiene; comunicar/encaminhar para avaliação médica conforme quadro.',orientacoes:'Orientar retorno imediato diante de febre persistente, piora clínica, secreção purulenta ou alteração do estado geral.',cuidados:['Manter hidratação','Retornar se houver piora','Procurar urgência se apresentar sinais de alerta']},
  {id:'liquidos',rx:/desidrata|v[oô]mito|diarreia|perda de l[ií]quido|baixa ingest[aã]o/i,problema:'Risco de desequilíbrio hídrico',diagnostico:'Risco de volume de líquidos deficiente',objetivo:'Manter hidratação e prevenir complicações.',resultado:'Hidratação adequada e equilíbrio hídrico preservado.',intervencoes:'Avaliar ingestão, perdas, mucosas, diurese e sinais de desidratação; orientar reposição hídrica e encaminhar se incapaz de hidratar.',orientacoes:'Orientar hidratação conforme tolerância e procura de atendimento se redução de diurese, letargia ou vômitos persistentes.',cuidados:['Manter hidratação','Retornar se houver piora']},
  {id:'glicemia',rx:/glicemia|diabetes|hipoglicemia|hiperglicemia|hba1c/i,problema:'Risco de instabilidade glicêmica',diagnostico:'Risco de glicemia instável',objetivo:'Manter glicemia em faixa pactuada e reconhecer descompensação.',resultado:'Controle da glicemia e adesão ao plano de monitoramento.',intervencoes:'Monitorar glicemia conforme indicação, avaliar sintomas e adesão, revisar barreiras e encaminhar alterações importantes.',orientacoes:'Orientar sinais de hipo/hiperglicemia, alimentação, medicação conforme prescrição e retorno programado.',cuidados:['Monitorar glicemia conforme orientação','Comparecer ao retorno agendado','Evitar automedicação']},
  {id:'queda',rx:/queda|marcha inst[aá]vel|mobilidade prejudicada|risco de queda|idoso fr[aá]gil/i,problema:'Risco de queda',diagnostico:'Risco de quedas',objetivo:'Reduzir o risco de quedas e lesões.',resultado:'Comportamento de prevenção de quedas e ambiente domiciliar mais seguro.',intervencoes:'Avaliar marcha, ambiente, visão, calçados, medicamentos e necessidade de apoio; envolver família/cuidador e considerar visita domiciliar.',orientacoes:'Orientar retirada de obstáculos, iluminação adequada, calçado seguro e apoio para mobilidade.',cuidados:['Retornar se houver piora']},
  {id:'adesao',rx:/ades[aã]o inadequada|ades[aã]o parcial|esquecimento de medica|controle ineficaz|falta de acompanhamento/i,problema:'Dificuldade de adesão ao cuidado',diagnostico:'Gestão ineficaz da saúde',objetivo:'Melhorar compreensão, adesão e continuidade do plano de cuidado.',resultado:'Autogestão da saúde melhorada e comparecimento aos retornos.',intervencoes:'Identificar barreiras, revisar horários e orientações, envolver rede de apoio e pactuar metas viáveis e retorno.',orientacoes:'Orientar organização do tratamento, esclarecer dúvidas e manter acompanhamento programado.',cuidados:['Comparecer ao retorno agendado','Levar exames no retorno']},
  {id:'ansiedade',rx:/ansiedade|sofrimento emocional|humor deprimido|choro frequente|tristeza intensa/i,problema:'Ansiedade ou sofrimento emocional',diagnostico:'Ansiedade',objetivo:'Reduzir sofrimento e fortalecer enfrentamento e rede de apoio.',resultado:'Nível de ansiedade reduzido e enfrentamento melhorado.',intervencoes:'Realizar escuta qualificada, avaliar risco, identificar rede de apoio e pactuar acompanhamento.',orientacoes:'Orientar procura imediata de ajuda diante de piora importante, risco à própria segurança ou crise.',cuidados:['Comparecer ao retorno agendado','Procurar urgência se apresentar sinais de alerta']},
  {id:'suicidio',rx:/idea[cç][aã]o suicida|risco de suic[ií]dio|plano suicida/i,problema:'Risco de autoagressão',diagnostico:'Risco de suicídio',objetivo:'Manter segurança imediata e ativar rede de proteção.',resultado:'Autocontrole do impulso suicida e segurança preservada.',intervencoes:'Não deixar a pessoa desacompanhada; realizar avaliação imediata de risco; remover meios; acionar equipe médica, rede de apoio e fluxo de urgência.',orientacoes:'Orientar paciente/família sobre vigilância contínua e procura imediata de urgência.',cuidados:['Procurar urgência se apresentar sinais de alerta']},
  {id:'urinario',rx:/dis[uú]ria|queixa urin[aá]ria|itu|sangue na urina/i,problema:'Alteração da eliminação urinária',diagnostico:'Eliminação urinária prejudicada',objetivo:'Reduzir sintomas urinários e identificar complicações.',resultado:'Eliminação urinária adequada e sintomas reduzidos.',intervencoes:'Avaliar sintomas, febre, dor lombar, gestação e recorrência; orientar coleta de exames e avaliação médica conforme risco.',orientacoes:'Orientar hidratação, não se automedicar e retornar diante de febre, dor lombar ou piora.',cuidados:['Manter hidratação','Evitar automedicação','Retornar se houver piora']},
  {id:'amamentacao',rx:/amamenta[cç][aã]o|fissura mamilar|ingurgitamento|mastite/i,problema:'Dificuldade ou risco relacionado à amamentação',diagnostico:'Amamentação ineficaz',objetivo:'Promover amamentação segura, confortável e efetiva.',resultado:'Estabelecimento da amamentação e redução de dor/trauma mamilar.',intervencoes:'Avaliar pega, posição, frequência, mamas, fissuras e sinais de mastite; apoiar correção da técnica e encaminhar quando necessário.',orientacoes:'Orientar livre demanda, pega adequada e sinais de mastite.',cuidados:['Manter aleitamento materno exclusivo quando indicado','Retornar se houver piora']},
  {id:'sangramento',rx:/sangramento|hemorragia|pet[eé]quias|plaquetas baixas/i,problema:'Risco de sangramento',diagnostico:'Risco de sangramento',objetivo:'Prevenir perda sanguínea e reconhecer gravidade prontamente.',resultado:'Ausência de sangramento ativo ou progressão e estabilidade clínica.',intervencoes:'Avaliar quantidade, origem, sinais vitais e sintomas associados; encaminhar imediatamente quando intenso, gestacional ou acompanhado de instabilidade.',orientacoes:'Orientar procura imediata diante de aumento do sangramento, tontura, desmaio ou piora.',cuidados:['Procurar urgência se apresentar sinais de alerta']},
  {id:'pressao',rx:/pa muito elevada|press[aã]o alta|hipertens[aã]o|cefaleia.*altera[cç][aã]o visual/i,problema:'Controle pressórico inadequado',diagnostico:'Risco de pressão arterial instável',objetivo:'Monitorar PA e prevenir complicações.',resultado:'Pressão arterial monitorada e sinais de gravidade reconhecidos precocemente.',intervencoes:'Repetir aferição com técnica adequada, avaliar sintomas, adesão e medicamentos; solicitar avaliação médica conforme valores e sinais associados.',orientacoes:'Orientar monitoramento conforme pactuado, adesão ao tratamento e sinais de alerta.',cuidados:['Monitorar pressão arterial conforme orientação','Comparecer ao retorno agendado','Procurar urgência se apresentar sinais de alerta']}
];
const SAE_NANDA_FONTE_URL='https://www.unifateb.edu.br/wp-content/uploads/2023/04/01-Diagnosticos-de-Enfermagem-da-NANDA-I_-Definicoes-e-Classificacao-2018_2020.pdf';
const SAE_SUGESTOES={queda:SAE_REGRAS.find(x=>x.id==='queda'),adesao:SAE_REGRAS.find(x=>x.id==='adesao'),dor:SAE_REGRAS.find(x=>x.id==='dor'),ferida:SAE_REGRAS.find(x=>x.id==='pele'),ansiedade:SAE_REGRAS.find(x=>x.id==='ansiedade')};
function preencherCamposSAE(p,regras,sobrescrever=true){
  const unico=k=>[...new Set(regras.map(x=>x[k]).filter(Boolean))].join('\n- '),set=(k,v)=>{const e=document.getElementById(`${p}-pc-${k}`);if(e&&(sobrescrever||!e.value.trim()))e.value=v};
  set('problema','- '+unico('problema'));set('diagnostico','Hipóteses diagnósticas de enfermagem para validação clínica:\n- '+unico('diagnostico'));set('objetivo','- '+unico('objetivo'));set('resultado','Resultados esperados — NOC compatível:\n- '+unico('resultado'));set('intervencoes','Intervenções sugeridas — NIC compatível:\n- '+unico('intervencoes'));set('orientacoes','- '+unico('orientacoes'));
  const cuidados=[...new Set(regras.flatMap(x=>x.cuidados||[]))];const pres=document.getElementById(`${p}-pc-prescricao`);if(pres&&(sobrescrever||!pres.value.trim()))pres.value=cuidados.map(x=>`- ${x}`).join('\n');
  document.querySelectorAll(`#${p}-plano-cuidados .quick-care`).forEach(b=>b.classList.toggle('selected',cuidados.includes(b.textContent.trim())));
}
function sanitizarTextoSAEProtocolado(p,texto){
  if(!MODULOS_EM_DESENVOLVIMENTO.has(p)&&p!=='ist')return texto;
  const partes=String(texto||'').split(';').map(x=>x.trim()).filter(Boolean).filter(x=>!/(encaminh|avalia[cç][aã]o m[eé]dica|acionar.*urg[eê]ncia|procur(?:a|ar).*urg[eê]ncia|procura.*atendimento|medica[cç][aã]o|prescri[cç][aã]o)/i.test(x));
  return partes.join('; ')||'Registrar o achado, manter cuidados de enfermagem compatíveis e definir a conduta profissionalmente; o sistema não sugere medicação nem encaminhamento sem protocolo municipal explícito.';
}
function sanitizarRegrasSAEProtocoladas(p,regras){
  if(!MODULOS_EM_DESENVOLVIMENTO.has(p)&&p!=='ist')return regras;
  return regras.map(r=>({...r,intervencoes:sanitizarTextoSAEProtocolado(p,r.intervencoes),orientacoes:sanitizarTextoSAEProtocolado(p,r.orientacoes),cuidados:(r.cuidados||[]).filter(x=>!/(procur(?:a|ar).*urg[eê]ncia|procura.*atendimento|medica[cç][aã]o|encaminh)/i.test(x))}));
}
function aplicarSugestaoSAE(p,chave){const s=SAE_SUGESTOES[chave];if(!s)return;const regras=sanitizarRegrasSAEProtocoladas(p,[s]);preencherCamposSAE(p,regras);renderizarPreviewSAE(p,regras);showToast('Sugestão SAE aplicada. Revise e valide antes de salvar.')}
function coletarTextoSAE(p,textoExtra=''){const pg=document.getElementById('pg-'+(moduloPorPrefixo(p)?.page||'')),campos=pg?Array.from(pg.querySelectorAll('input:not([type=file]),select,textarea')).map(e=>`${e.id} ${e.value||''}`).join(' '):'',chips=pg?Array.from(pg.querySelectorAll('.clinical-chip.selected,.complaint-chip.selected,.alert-chip.selected')).map(x=>x.textContent).join(' '):'',guia=typeof coletarGuiaClinico==='function'?coletarGuiaClinico(p):{};return[textoExtra,campos,chips,guia.anamnese,guia.exame,guia.alertas,guia.condutas].join(' ')}
function renderizarPreviewSAE(p,regras){const out=document.getElementById(`${p}-sae-preview`);if(!out)return;out.className='sae-preview on';out.innerHTML=`<div class="sae-preview-head"><span class="clinical-seal suggestion">Sugestão</span> <span class="clinical-seal validate">Validar pelo enfermeiro</span> SAE sugerida a partir dos dados registrados</div><div class="sae-preview-grid">${regras.map(r=>`<div class="sae-preview-item"><strong>${r.diagnostico}</strong><b>Problema:</b> ${r.problema}<br><b>NOC compatível:</b> ${r.resultado}<br><b>NIC compatível:</b> ${r.intervencoes}</div>`).join('')}</div><div class="sae-source">Sugestões para apoio ao Processo de Enfermagem, com títulos baseados na <a href="${SAE_NANDA_FONTE_URL}" target="_blank" rel="noopener">NANDA-I 2018–2020</a>. O diagnóstico de enfermagem, os resultados e as intervenções devem ser avaliados, ajustados e validados pelo enfermeiro responsável.</div>`}
function gerarSAE(p,silencioso=false,textoExtra=''){const texto=coletarTextoSAE(p,textoExtra);let regras=SAE_REGRAS.filter(x=>x.rx.test(texto)).slice(0,5);if(!regras.length)regras.push({problema:'Necessidade de promoção e manutenção da saúde',diagnostico:'Disposição para melhora da gestão da saúde',objetivo:'Fortalecer autocuidado, prevenção e continuidade do acompanhamento.',resultado:'Conhecimento e autogestão da saúde melhorados.',intervencoes:'Realizar educação em saúde, identificar necessidades, pactuar cuidados e retorno.',orientacoes:'Manter acompanhamento, vacinação e cuidados pactuados.',cuidados:['Comparecer ao retorno agendado','Manter vacinação atualizada']});regras=sanitizarRegrasSAEProtocoladas(p,regras);preencherCamposSAE(p,regras,true);renderizarPreviewSAE(p,regras);if(!silencioso)showToast(`${regras.length} sugestão(ões) SAE gerada(s). Revise e valide clinicamente.`);return regras}
function limparSAE(p){['problema','diagnostico','objetivo','resultado','intervencoes','orientacoes','prescricao','prazo','responsavel','evolucao'].forEach(k=>{const e=document.getElementById(`${p}-pc-${k}`);if(e)e.value=''});document.querySelectorAll(`#${p}-plano-cuidados .quick-care.selected`).forEach(x=>x.classList.remove('selected'));const out=document.getElementById(`${p}-sae-preview`);if(out){out.className='sae-preview';out.innerHTML=''}showToast('SAE limpa.')}
function alternarCuidadoPronto(p,btn){btn.classList.toggle('selected');const e=document.getElementById(`${p}-pc-prescricao`);if(e)e.value=Array.from(document.querySelectorAll(`#${p}-plano-cuidados .quick-care.selected`)).map(x=>x.textContent.trim()).join('\n')}
function montarPlanosCuidados(){PLANO_MODULOS.forEach(([p,alvo])=>{const area=document.getElementById(alvo);if(!area||document.getElementById(`${p}-plano-cuidados`))return;const cuidados=MODULOS_EM_DESENVOLVIMENTO.has(p)?CUIDADOS_PRONTOS.filter(x=>!/(procurar.*urg[eê]ncia|medica[cç][aã]o|encaminh)/i.test(x)):CUIDADOS_PRONTOS;const c=document.createElement('div');c.className='card';c.id=`${p}-plano-cuidados`;c.innerHTML=`<div class="sae-head"><div class="ct" style="margin:0"><span class="dot dg"></span>SAE — Plano de Cuidados de Enfermagem</div><small>O sistema sugere hipóteses NANDA-I e resultados/intervenções compatíveis com NOC/NIC. O enfermeiro deve revisar e validar clinicamente.</small></div><div class="brow"><button class="btn btn-p" type="button" onclick="gerarSAE('${p}')">GERAR SAE</button><button class="btn btn-s" type="button" onclick="limparSAE('${p}')">Limpar SAE</button><button class="btn btn-s" onclick="aplicarSugestaoSAE('${p}','queda')">Risco de queda</button><button class="btn btn-s" onclick="aplicarSugestaoSAE('${p}','adesao')">Adesão inadequada</button><button class="btn btn-s" onclick="aplicarSugestaoSAE('${p}','dor')">Dor</button><button class="btn btn-s" onclick="aplicarSugestaoSAE('${p}','ferida')">Ferida</button><button class="btn btn-s" onclick="aplicarSugestaoSAE('${p}','ansiedade')">Ansiedade</button></div><div id="${p}-sae-preview" class="sae-preview"></div><div class="plano-cuidados-grid"><div class="f"><label>Problema identificado</label><textarea id="${p}-pc-problema"></textarea></div><div class="f"><label>Hipótese diagnóstica de enfermagem — NANDA-I</label><textarea id="${p}-pc-diagnostico"></textarea></div><div class="f"><label>Objetivo do cuidado</label><textarea id="${p}-pc-objetivo"></textarea></div><div class="f"><label>Resultado esperado — NOC compatível</label><textarea id="${p}-pc-resultado"></textarea></div><div class="f"><label>Intervenções de enfermagem — NIC compatível</label><textarea id="${p}-pc-intervencoes"></textarea></div><div class="f"><label>Orientações ao paciente/família</label><textarea id="${p}-pc-orientacoes"></textarea></div><div class="f span2"><label>Prescrição de cuidados de enfermagem</label><div class="quick-care-list">${cuidados.map(x=>`<button type="button" class="quick-care" onclick="alternarCuidadoPronto('${p}',this)">${x}</button>`).join('')}</div><textarea id="${p}-pc-prescricao" placeholder="Cuidados selecionados e cuidados personalizados..."></textarea></div><div class="f"><label>Prazo para reavaliação</label><input type="date" id="${p}-pc-prazo"></div><div class="f"><label>Responsável pelo acompanhamento</label><input id="${p}-pc-responsavel"></div><div class="f span2"><label>Conduta pactuada com paciente/família</label><textarea id="${p}-pc-pactuada"></textarea></div><div class="f span2"><label>Evolução no retorno</label><textarea id="${p}-pc-evolucao"></textarea></div></div>`;area.appendChild(c)})}
function resumoPlanoCuidados(p){const campos=[['Problemas identificados',`${p}-pc-problema`],['Hipóteses diagnósticas de enfermagem para validação clínica',`${p}-pc-diagnostico`],['Objetivos',`${p}-pc-objetivo`],['Resultado esperado',`${p}-pc-resultado`],['Intervenções/cuidados de enfermagem',`${p}-pc-intervencoes`],['Prescrição de cuidados',`${p}-pc-prescricao`],['Orientações',`${p}-pc-orientacoes`],['Prazo',`${p}-pc-prazo`],['Responsável',`${p}-pc-responsavel`],['Conduta pactuada',`${p}-pc-pactuada`],['Evolução no retorno',`${p}-pc-evolucao`]].map(([l,id])=>val(id)?`${l}:\n${val(id)}`:'').filter(Boolean);return campos.length?`\n\nSAE — SISTEMATIZAÇÃO DA ASSISTÊNCIA DE ENFERMAGEM\nSugestões para avaliação e validação clínica pelo enfermeiro responsável.\n\n${campos.join('\n\n')}`:''}

const AUTO_DRAFT_KEY='esf_rascunho_automatico_v1';let autoDraftTimer;
function salvarRascunhoAutomatico(){
  const pg=document.querySelector('.pg.on');if(!CURRENT_AUTH_USER_ID||!pg||['pg-inicio','pg-pacientes','pg-historico','pg-busca-ativa','pg-indicadores','pg-territorio','pg-relatorios'].includes(pg.id))return;
  const dados={};pg.querySelectorAll('input,select,textarea').forEach(e=>{if(e.id&&e.type!=='file'&&e.type!=='password')dados[e.id]=e.type==='checkbox'||e.type==='radio'?{checked:e.checked,value:e.value}:e.value});localStorage.setItem(`${chaveDadosLocais(AUTO_DRAFT_KEY)}:${pg.id}`,JSON.stringify({salvo:new Date().toISOString(),dados,chips:[...pg.querySelectorAll('.clinical-chip,.complaint-chip,.alert-chip')].map((b,i)=>b.classList.contains('selected')?i:null).filter(i=>i!==null)}));const i=document.getElementById('autosave-indicator');if(i){i.textContent='Rascunho salvo automaticamente';i.style.opacity='1';setTimeout(()=>i.style.opacity='.45',1800)}
}
function restaurarRascunhoAutomatico(pgId,forcar=false){
  const pg=document.getElementById(pgId);if(!CURRENT_AUTH_USER_ID||!pg||pg.dataset.draftChecked===CURRENT_AUTH_USER_ID)return;
  try{
    const r=JSON.parse(localStorage.getItem(`${chaveDadosLocais(AUTO_DRAFT_KEY)}:${pgId}`)||'null');if(!r?.dados)return;
    if(pg.dataset.userEdited&&!forcar){mostrarRecuperacaoRascunho(pgId,r);return;}
    Object.entries(r.dados).forEach(([id,v])=>{const e=document.getElementById(id);if(!e||!pg.contains(e)||e.type==='password'||e.type==='file')return;if(typeof v==='object'&&v&&'checked'in v)e.checked=!!v.checked;else e.value=v??'';});
    pg.dataset.draftChecked=CURRENT_AUTH_USER_ID;pg.querySelector('.draft-recovery')?.remove();
    pg.querySelectorAll('[id$="-plano-confirmado"]').forEach(e=>e.checked=false);
    // Selected chips are saved independently because they are buttons, not inputs.
    pg.querySelectorAll('.clinical-chip,.complaint-chip,.alert-chip').forEach((b,i)=>{if(r.chips?.includes(i))b.classList.add('selected');else b.classList.remove('selected');});
    try{if(pgId==='pg-pn-abertura'){calcIG('pna');avaliarProtocolosPna();}if(pgId==='pg-pn-consulta')calcIG('pnc');if(pgId==='pg-idoso')calcularIVCF20();if(pgId==='pg-saude-mental')calcERSM();}catch(e){}
    showToast('Rascunho deste usuário recuperado. Confira paciente, data e respostas.');
  }catch(e){showToast('Não foi possível recuperar o rascunho. Ele foi preservado para revisão.');}
}
function mostrarRecuperacaoRascunho(pgId,r){
  const pg=document.getElementById(pgId);if(pg.querySelector('.draft-recovery'))return;
  const b=document.createElement('div');b.className='alert alert-i draft-recovery';
  b.innerHTML=`Há um rascunho deste usuário${r.salvo?' de '+new Date(r.salvo).toLocaleString('pt-BR'):''}. <button type="button" class="btn btn-s">Recuperar rascunho</button>`;
  b.querySelector('button').onclick=()=>restaurarRascunhoAutomatico(pgId,true);pg.prepend(b);
}

function validarCPFReal(cpf){cpf=normalizarCPF(cpf);if(cpf.length!==11||/^(\d)\1+$/.test(cpf))return false;let s=0;for(let i=0;i<9;i++)s+=Number(cpf[i])*(10-i);let d=(s*10)%11;if(d===10)d=0;if(d!==Number(cpf[9]))return false;s=0;for(let i=0;i<10;i++)s+=Number(cpf[i])*(11-i);d=(s*10)%11;if(d===10)d=0;return d===Number(cpf[10])}
document.addEventListener('input',e=>{if(e.isTrusted)e.target.closest?.('.pg')?.setAttribute('data-user-edited','1');clearTimeout(autoDraftTimer);autoDraftTimer=setTimeout(salvarRascunhoAutomatico,1200);if(e.target.matches?.('.telefone-mask')||/-(tel|telefone)$/.test(e.target.id||'')){const n=e.target.value.replace(/\D/g,'').slice(0,11);e.target.value=n.length>10?n.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3'):n.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3')}if(/-cns$/.test(e.target.id||''))e.target.value=e.target.value.replace(/\D/g,'').slice(0,15)})
document.addEventListener('blur',e=>{if(e.target.matches?.('.paciente-cpf')&&normalizarCPF(e.target.value).length===11&&!validarCPFReal(e.target.value)){e.target.style.borderColor='#b32848';showToast('CPF parece inválido. Confira os números antes de salvar.')}else if(e.target.matches?.('.paciente-cpf'))e.target.style.borderColor='';if(/-cns$/.test(e.target.id||'')&&e.target.value&&e.target.value.replace(/\D/g,'').length!==15){e.target.style.borderColor='#b32848';showToast('O CNS deve possuir 15 números. Confira antes de salvar.')}else if(/-cns$/.test(e.target.id||''))e.target.style.borderColor=''},true);
document.addEventListener('DOMContentLoaded',()=>{montarIVCF20();montarPlanosCuidados();filtrosGestao();const mes=new Date().toISOString().slice(0,7);['ind-mes','rel-mes'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.value)e.value=mes});['pna','pnc','pu','prev','id','sm','ger','acol','hip','fer','puerp','ist'].forEach(p=>[`${p}-nome`,`${p}-cpf`].forEach(id=>{const e=document.getElementById(id);if(e){e.required=true;e.closest('.f')?.classList.add('required-mark')}}));const i=document.createElement('div');i.id='autosave-indicator';i.textContent='Salvamento automático ativo';i.style.cssText='position:fixed;right:12px;bottom:10px;z-index:240;background:var(--sf);border:1px solid var(--bd);padding:5px 9px;border-radius:5px;font-size:10px;color:var(--tx2);opacity:.45';document.body.appendChild(i);document.getElementById('id-nasc')?.addEventListener('change',sincronizarIdadeIVCF)});

const QUICK_PAGE_PREFIX={'pg-pn-abertura':'pna','pg-pn-consulta':'pnc','pg-puericultura':'pu','pg-preventivo':'prev','pg-idoso':'id','pg-saude-mental':'sm','pg-consulta-geral':'ger','pg-hiperdia':'hip','pg-feridas':'fer','pg-puerperio':'puerp','pg-ist':'ist','pg-visita-domiciliar':'vd'};
// ATENÇÃO: as listas de hip/fer/puerp/vd abaixo são SUBSTITUÍDAS em runtime por
// reforcarCamposClinicos() (IIFE de auditoria, ~final do arquivo), que instala versões
// mais completas. O que roda para esses 4 módulos é a versão de lá, não esta.
const CAMPOS_ESSENCIAIS={
 pna:[['idade gestacional',['pna-ig']],['pressão arterial',['pna-pa']],['BCF',['pna-bcf']],['altura uterina',['pna-au']],['queixa',['pna-queixas']],['avaliação',['pna-a-soap']],['conduta',['pna-soap-p']]],
 pnc:[['idade gestacional',['pnc-ig']],['pressão arterial',['pnc-pa']],['BCF',['pnc-bcf']],['altura uterina',['pnc-au']],['queixa',['pnc-queixas']],['avaliação',['pnc-a']],['conduta',['pnc-p']]],
 pu:[['peso',['pu-peso']],['estatura',['pu-alt']],['alimentação',['pu-alim']],['desenvolvimento',['pu-dnpm','pu-dn']],['vacinação',['pu-vac','pu-vacinacao']],['exame físico',['pu-o']],['orientações',['pu-p']]],
 prev:[['motivo',['prev-motivo']],['histórico ginecológico',['prev-hist','prev-hma']],['achados',['prev-o']],['coleta',['prev-coleta','prev-material']],['orientações',['prev-p']]],
 hip:[['pressão arterial',['hip-pa-atual','hip-pa']],['adesão',['hip-adesao']],['sintomas',['hip-sintomas']],['conduta',['hip-conduta','hip-p']],['retorno',['hip-retorno']]],
 fer:[['localização',['fer-local']],['tamanho',['fer-comprimento','fer-largura']],['aspecto/tecido',['fer-tecido']],['exsudato',['fer-exsudato']],['dor',['fer-dor','fer-dor-escala']],['cobertura/conduta',['fer-cobertura','fer-conduta']],['evolução',['fer-evolucao']]],
 sm:[['queixa',['sm-queixa','sm-s']],['risco',['sm-risco','sm-a']],['sintomas',['sm-sintomas']],['rede de apoio',['sm-rede']],['conduta',['sm-p']],['retorno',['sm-retorno']]],
 ger:[['queixa',['ger-queixa']],['tempo de início',['ger-inicio']],['sinais vitais',['ger-pa','ger-fc']],['prioridade',['ger-prioridade']],['orientação',['ger-orientacoes','ger-p']]],
 id:[['pressão arterial',['id-pa']],['avaliação ampliada',['id-avd','id-aivd']],['exame físico',['id-o']],['conduta',['id-p']]],
 puerp:[['data do parto',['puerp-data-parto']],['sangramento',['puerp-sangramento']],['mamas/amamentação',['puerp-amamentacao']],['humor',['puerp-humor']],['conduta',['puerp-conduta','puerp-p']],['retorno',['puerp-retorno']]],
 ist:[['motivo',['ist-motivo']],['testes rápidos',['ist-tr-p-testes']],['sintomas',['ist-sintomas']],['conduta',['ist-conduta','ist-p']],['retorno',['ist-retorno']]]
};
function campoPreenchido(ids,page){
  return ids.some(id=>{const e=document.getElementById(id);if(!e)return false;if(e.matches('input[type=checkbox],input[type=radio]'))return e.checked;if(e.querySelectorAll)return String(e.value||'').trim()||e.querySelector('.selected,input:checked');return false})||
    ids.some(id=>page?.querySelector(`[id^="${id}"] .selected,[id^="${id}"] input:checked`));
}
function prefixoPaginaAtual(){return QUICK_PAGE_PREFIX[document.querySelector('.pg.on')?.id]||''}
function atualizarIndicadorPreenchimento(){
  const p=prefixoPaginaAtual(),page=document.querySelector('.pg.on'),itens=CAMPOS_ESSENCIAIS[p]||[],faltam=itens.filter(([,ids])=>!campoPreenchido(ids,page)).map(x=>x[0]),pct=itens.length?Math.round((itens.length-faltam.length)*100/itens.length):0;
  const titulo=document.getElementById('quick-completion-title'),det=document.getElementById('quick-completion-detail'),bar=document.getElementById('quick-progress-fill');
  if(titulo)titulo.textContent=`Consulta ${pct}% preenchida`;if(det)det.textContent=faltam.length?`Faltando: ${faltam.join(', ')}`:'Campos essenciais preenchidos';if(bar)bar.style.width=`${pct}%`;
}
function botaoAcaoPagina(rx){const pg=document.querySelector('.pg.on');return Array.from(pg?.querySelectorAll('button')||[]).find(b=>rx.test(`${b.textContent} ${b.getAttribute('onclick')||''}`)&&!b.closest('#quick-actions'))}
function quickGerarSoap(){const b=botaoAcaoPagina(/gerar.*(soap|evolu)/i);b?b.click():showToast('Este módulo ainda não possui gerador SOAP conectado.')}
function bloquearGeracaoSoapSeCritico(prefix){
  const bloqueios=validarEntradaPreSoap(prefix);
  if(!bloqueios.length)return false;
  const ids=SOAP_IDS_MODULO[prefix],s=document.getElementById(ids?.s),card=s?.closest('.card')||s?.closest('.tp')||document.querySelector('.pg.on .card');
  if(card){
    let out=card.querySelector(`#soap-prebloqueios-${prefix}`);
    if(!out){out=document.createElement('div');out.id=`soap-prebloqueios-${prefix}`;out.className='soap-pendencias';out.style.borderLeftColor='var(--rose)';card.insertAdjacentElement('afterbegin',out)}
    out.innerHTML=`<h4>Avisos para revisar antes de finalizar</h4><ul>${bloqueios.map(x=>`<li>${escTR(x.replace(/^Aviso:\s*/i,''))}</li>`).join('')}</ul><div style="font-size:12px;margin-top:8px;color:var(--tx2)">Estes avisos não bloqueiam a geração, salvamento ou cópia. Servem apenas para ajudar a localizar dados que merecem conferência.</div>`;
  }
  showToast('Aviso clínico exibido. A evolução será gerada normalmente.');
  return false;
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('button');if(!b||b.closest('#quick-actions')||b.classList.contains('admin-test-btn'))return;
  const alvo=`${b.textContent||''} ${b.getAttribute('onclick')||''}`;
  if(!/gerar.*(soap|evolu|evolução)/i.test(alvo))return;
  const p=prefixoPaginaAtual();if(!p)return;
  bloquearGeracaoSoapSeCritico(p);
},true);
const AI_SOAP_CONFIG_KEY='esf_ai_soap_config_v1';
let AI_SOAP_PENDENCIAS={};
const AI_SOAP_ENDPOINT_PADRAO='https://mcmletzjgykhwknshacg.supabase.co/functions/v1/clever-processor';
function configAISoapPadrao(){return{enabled:false,endpoint:AI_SOAP_ENDPOINT_PADRAO,model:'gemini-2.5-flash',apiKey:'',temperature:'0.2',extra:''}}
function normalizarConfigAISoap(cfg){
  cfg={...configAISoapPadrao(),...(cfg||{})};
  cfg.apiKey=''; // Preservar o endpoint configurado pelo administrador.
  return cfg;
}
function lerConfigAISoap(){
  try{return normalizarConfigAISoap(JSON.parse(localStorage.getItem(AI_SOAP_CONFIG_KEY)||'{}'))}
  catch(e){return configAISoapPadrao()}
}
function preencherAdminAISoap(){
  const c=lerConfigAISoap(),set=(id,v)=>{const e=document.getElementById(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v??''};
  set('ai-soap-enabled',c.enabled);set('ai-soap-endpoint',c.endpoint);set('ai-soap-model',c.model);set('ai-soap-temperature',String(c.temperature??'0.2'));set('ai-soap-key',c.apiKey);set('ai-soap-extra',c.extra);
  const st=document.getElementById('ai-soap-status');if(st)st.textContent=c.enabled?'IA SOAP configurada neste dispositivo. Use o botão “IA SOAP” após gerar o SOAP local.':'IA SOAP desativada neste dispositivo.';
}
function lerFormAISoap(){
  const cfg={
    enabled:!!document.getElementById('ai-soap-enabled')?.checked,
    endpoint:String(document.getElementById('ai-soap-endpoint')?.value||'').trim(),
    model:String(document.getElementById('ai-soap-model')?.value||'').trim()||'gpt-4o-mini',
    apiKey:String(document.getElementById('ai-soap-key')?.value||'').trim(),
    temperature:String(document.getElementById('ai-soap-temperature')?.value||'0.2'),
    extra:String(document.getElementById('ai-soap-extra')?.value||'').trim()
  };
  return normalizarConfigAISoap(cfg);
}
function endpointSupabaseAISoap(cfg){return /\.supabase\.co\/functions\/v1\//i.test(String(cfg?.endpoint||''))}
function explicarFalhaAISoap(e,cfg){
  const msg=String(e?.message||e||'').trim();
  if(/failed to fetch|networkerror|load failed|abort/i.test(msg)&&endpointSupabaseAISoap(cfg)){
    return [
      'Falha no teste: o navegador não conseguiu conversar com a Edge Function.',
      'Verifique a URL do endpoint clever-processor, CORS/OPTIONS da função ou a conexão da rede.',
      'O navegador envia a sessão autenticada, chave pública Supabase e SOAP conferido; a chave de IA permanece no servidor.',
      'O SOAP local continua funcionando normalmente.'
    ].join('\n');
  }
  if(/api respondeu 401|jwt|unauthorized/i.test(msg)&&endpointSupabaseAISoap(cfg))return 'Falha no teste: a função recusou autenticação. O front-end não envia token; confira se a Edge Function clever-processor está pública ou sem exigência de JWT.';
  if(/api respondeu 404|not found/i.test(msg)&&endpointSupabaseAISoap(cfg))return 'Falha no teste: função não encontrada. Confira se a URL termina exatamente com /functions/v1/clever-processor e se a Edge Function foi implantada.';
  return `Falha no teste: ${msg||'não foi possível chamar a API.'}`;
}
function salvarConfigAISoap(){
  if(!temPermissao('ver_admin'))return showToast('Somente o administrador configura a IA SOAP.');
  const cfg=lerFormAISoap();
  localStorage.setItem(AI_SOAP_CONFIG_KEY,JSON.stringify(cfg));
  preencherAdminAISoap();
  showToast('Configuração da IA SOAP salva neste dispositivo.');
}
function limparConfigAISoap(){
  if(!temPermissao('ver_admin'))return showToast('Somente o administrador configura a IA SOAP.');
  if(!confirm('Remover a configuração da IA SOAP deste dispositivo?'))return;
  localStorage.removeItem(AI_SOAP_CONFIG_KEY);preencherAdminAISoap();showToast('Configuração da IA SOAP removida.');
}
function promptSistemaAISoap(cfg){
  return [
    'Você é um revisor de redação SOAP para enfermagem na APS/ESF.',
    'Sua função é SOMENTE melhorar a escrita do SOAP já gerado pelo sistema, deixando-o semi-narrativo, humano, técnico, claro e copiável para prontuário/e-SUS.',
    'Não invente dados clínicos. Não transforme campo vazio em negação. Não crie diagnóstico, medicação, dose, solicitação de exame, encaminhamento ou conduta que não esteja explícita nos dados enviados.',
    'Se a informação estiver incompatível, confusa, fictícia, placeholder ou ausente, remova do corpo do SOAP e coloque em pendencias.',
    'Mantenha a estrutura com: DESCRIÇÃO DA CONSULTA, S:, O:, A:, P:. Não use HMA, HP, HD ou CD como títulos principais.',
    'Pendências, avisos internos, fontes longas e observações de sistema não devem entrar no corpo principal.',
    'Preserve condutas protocolares existentes quando elas já estiverem no SOAP/dados; pode resumir, organizar e remover repetição.',
    'Retorne apenas o texto final do SOAP, sem Markdown, sem JSON interno e sem explicações fora da evolução. A Edge Function colocará esse texto no campo soap.',
    cfg?.extra?`Preferência local adicional: ${cfg.extra}`:''
  ].filter(Boolean).join('\n');
}
function promptModuloAISoap(prefix){
  if(prefix!=='vd')return '';
  return [
    'PROMPT ESPECÍFICO DO MÓDULO VISITA DOMICILIAR',
    '',
    'Você está lapidando uma evolução SOAP de visita domiciliar de enfermagem na APS/ESF.',
    'A saída deve parecer registro profissional de enfermeiro após visita no domicílio, não relatório administrativo e não formulário copiado.',
    '',
    'Formato obrigatório:',
    'DESCRIÇÃO DA CONSULTA',
    'S:',
    'O:',
    'A:',
    'P:',
    '',
    'DESCRIÇÃO DA CONSULTA:',
    'Usar "Visita domiciliar de enfermagem" e, quando houver, motivo principal da visita. Não incluir CPF, CNS, telefone ou endereço completo no texto final.',
    '',
    'S:',
    'Narrar de forma natural o motivo da visita, demanda referida pelo paciente/família/cuidador, histórico breve, queixas, contexto social relevante, cuidador principal, rede de apoio, barreiras de acesso e informações referidas. Não escrever que nega algo se isso não foi informado.',
    '',
    'O:',
    'Organizar achados objetivos da visita: sinais vitais, estado geral, consciência/comunicação, mobilidade, dependência, AVD/AIVD quando houver, condição do domicílio, risco ambiental, pele/LPP/feridas, alimentação e hidratação, eliminações, respiração, dispositivos, medicações conferidas, insumos e escalas aplicadas.',
    'Para escalas, preservar a pontuação exatamente como enviada: Braden, Katz, Barthel, Morse e MNA-SF simplificada. Se escala estiver incompleta ou não aplicada, citar apenas como pendência/limitação quando isso for relevante.',
    'Para alimentação por sonda/GTT/JTT, usar dados estruturados quando presentes: tipo, data de instalação/troca, fórmula, volume, horários, água antes/depois, lavagem, método, cabeceira, náuseas/vômitos, distensão, diarreia, constipação, tosse/engasgo, obstrução e pele ao redor.',
    'Para dispositivos, separar achados importantes por tipo: traqueostomia, sonda vesical, SNE/SNG, gastrostomia, jejunostomia, oxigenoterapia, ostomia, acesso venoso, dreno e curativo. Não inventar funcionamento normal se não avaliado.',
    '',
    'A:',
    'Interpretar de forma curta: risco da visita, principais problemas/necessidades de enfermagem observadas, riscos de LPP, queda, broncoaspiração, infecção, descompensação clínica, medicação desorganizada, falta de insumos, cuidador sobrecarregado ou vulnerabilidade social quando presentes.',
    'Não transformar risco em diagnóstico médico. Não classificar como alto risco sem critério preenchido. Não repetir todo o objetivo.',
    '',
    'P:',
    'Registrar condutas de enfermagem realizadas/pactuadas, orientações ao paciente/cuidador, cuidados com pele, mudança de decúbito, prevenção de quedas, higiene, hidratação, organização de medicações, cuidados com sonda/dispositivo, solicitação/organização de insumos, sinais de alerta e próxima visita/retorno.',
    'Não criar medicação, dose, exame, encaminhamento ou prescrição que não esteja nos dados enviados ou explicitamente protocolada.',
    'Se houver sinal de gravidade, escrever de forma objetiva que foi orientada/necessária avaliação conforme fluxo local, sem bloquear o texto.',
    '',
    'Estilo:',
    'Usar linguagem semi-narrativa, limpa e humana.',
    'Evitar frases como "Durante o atendimento, foram registrados", "campo preenchido", "conduta protocolar acionada", "conforme formulário".',
    'Não copiar campos vazios, "não avaliado" em excesso, nem listas enormes sem necessidade.',
    'Preservar dados clínicos relevantes e remover repetições.'
  ].join('\n');
}
function contextoAISoap(prefix){
  const ids=SOAP_IDS_MODULO[prefix]||{},page=document.querySelector('.pg.on'),modulo=(page?.querySelector('.head h2')?.textContent||page?.id||prefix).trim();
  const soap={descricao:extrairDescricaoSoapAtual(document.getElementById(ids.s)?.value||''),s:document.getElementById(ids.s)?.value||'',o:document.getElementById(ids.o)?.value||'',a:document.getElementById(ids.a)?.value||'',p:document.getElementById(ids.p)?.value||''};
  const campos=textoCamposPagina(prefix).slice(0,14000),pendencias=gerarPendenciasSoap(prefix).join('\n- ');
  const promptModulo=promptModuloAISoap(prefix);
  return `MÓDULO: ${modulo}${promptModulo?`\n\nINSTRUÇÃO_ESPECÍFICA_DO_MÓDULO:\n${promptModulo}`:''}\n\nSOAP_ATUAL:\n${JSON.stringify(soap,null,2)}\n\nCAMPOS_PREENCHIDOS_DA_CONSULTA:\n${campos}\n\nPENDÊNCIAS_JÁ_DETECTADAS:\n${pendencias||'Nenhuma pendência automática.'}`;
}
function tipoConsultaAISoap(prefix){
  return ({pna:'abertura_pre_natal',pnc:'consulta_pre_natal',pu:'puericultura',prev:'preventivo',id:'idoso',sm:'saude_mental',ger:'consulta_enfermagem',acol:'demanda_espontanea',hip:'hiperdia',fer:'feridas',puerp:'puerperio',ist:'ist_testes_rapidos',vd:'visita_domiciliar'}[prefix]||prefix||'consulta_enfermagem');
}
function dadosConsultaAISoap(prefix,cfg){
  const system=promptSistemaAISoap(cfg),user=contextoAISoap(prefix);
  const ids=SOAP_IDS_MODULO[prefix]||{},soapAtual={descricao:extrairDescricaoSoapAtual(document.getElementById(ids.s)?.value||''),s:document.getElementById(ids.s)?.value||'',o:document.getElementById(ids.o)?.value||'',a:document.getElementById(ids.a)?.value||'',p:document.getElementById(ids.p)?.value||''};
  return{tipoConsulta:tipoConsultaAISoap(prefix),soapAtual,camposPreenchidos:textoCamposPagina(prefix),pendenciasDetectadas:gerarPendenciasSoap(prefix),contexto:user,instrucaoSistema:system,promptModulo:promptModuloAISoap(prefix),modoSoap:modoSoapAtual()};
}
function textoRespostaAISoap(json){
  if(typeof json==='string')return json;
  if(json?.data?.soap)return JSON.stringify(json.data);
  if(json?.soap)return JSON.stringify(json);
  if(json?.bloqueado)throw new Error(json.motivo||json.erro||'A IA recusou gerar o SOAP.');
  if(json?.data?.bloqueado)throw new Error(json.data.motivo||json.data.erro||'A IA recusou gerar o SOAP.');
  if(json?.choices?.[0]?.message?.content)return json.choices[0].message.content;
  if(json?.output_text)return json.output_text;
  const part=json?.output?.flatMap?.(o=>o.content||[])?.find?.(c=>c.text||c.type==='output_text');
  if(part?.text)return part.text;
  if(json?.descricao||json?.s)return JSON.stringify(json);
  return '';
}
function extrairSoapTextoIA(texto){
  const raw=String(texto||'').replace(/\r/g,'').replace(/[–—−]/g,'-').trim();
  const header=l=>`${l}[ \\t]*(?::|-[^\\n]*)`;
  const sec=(letra,next)=>{
    const prox=next==='$'?'$':`(?=\\n[ \\t]*(?:${next.split('|').map(header).join('|')})[ \\t]*(?:\\n|$))`;
    const rx=new RegExp(`(?:^|\\n)[ \\t]*${header(letra)}[ \\t]*\\n?([\\s\\S]*?)${prox}`,'i');
    return (raw.match(rx)?.[1]||'').trim();
  };
  const desc=(raw.match(/(?:^|\n)[ \t]*DESCRI\S*O[ \t]+DA[ \t]+CONSULTA[ \t]*[:-]?[ \t]*([\s\S]*?)(?=\n[ \t]*S[ \t]*(?::|-)|$)/i)?.[1]||'').trim();
  return{descricao:desc,s:sec('S','O|A|P'),o:sec('O','A|P'),a:sec('A','P'),p:sec('P','$')};
}
function parseAISoap(content){
  let obj,txt='';
  if(content&&typeof content==='object')obj=content;
  else{
    txt=String(content||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
    const ini=txt.indexOf('{'),fim=txt.lastIndexOf('}');
    if(ini>=0&&fim>ini){
      try{obj=JSON.parse(txt.slice(ini,fim+1))}catch(e){obj=null}
    }
  }
  if(obj?.data)obj=obj.data;
  if(obj?.soap&&typeof obj.soap==='string'){
    const partes=extrairSoapTextoIA(obj.soap);
    return{soap:obj.soap,bloqueado:!!obj.bloqueado,descricao:partes.descricao||extrairDescricaoSoapAtual(obj.soap),s:partes.s,o:partes.o,a:partes.a,p:partes.p,pendencias:obj.pendencias||[]};
  }
  if(obj?.bloqueado)throw new Error(obj.motivo||obj.erro||'A IA recusou gerar o SOAP.');
  if(obj)return obj;
  if(txt){
    const partes=extrairSoapTextoIA(txt);
    return{soap:txt,descricao:partes.descricao||extrairDescricaoSoapAtual(txt),s:partes.s,o:partes.o,a:partes.a,p:partes.p,pendencias:[]};
  }
  throw new Error('IA SOAP respondeu, mas sem campo soap.');
}
function normalizarListaPendenciasIA(pendencias){
  if(!Array.isArray(pendencias))pendencias=String(pendencias||'').split(/\n|;/);
  return pendencias.map(x=>String(x||'').replace(/^[-•]\s*/,'').trim()).filter(Boolean).slice(0,12);
}
function renderPendenciasIASoap(prefix,pendencias){
  AI_SOAP_PENDENCIAS[prefix]=normalizarListaPendenciasIA(pendencias);
  const ids=SOAP_IDS_MODULO[prefix],s=document.getElementById(ids?.s),card=s?.closest('.card')||s?.closest('.tp');if(!card)return;
  let out=card.querySelector(`#soap-pendencias-ia-${prefix}`);if(!out){out=document.createElement('div');out.id=`soap-pendencias-ia-${prefix}`;out.className='soap-pendencias';(card.querySelector(`#soap-pendencias-${prefix}`)||card.querySelector('.soap-grid')||card).insertAdjacentElement('afterend',out)}
  const p=AI_SOAP_PENDENCIAS[prefix];
  out.innerHTML=p.length?`<h4>Pendências apontadas pela IA</h4><ul>${p.map(x=>`<li>${escTR(x)}</li>`).join('')}</ul>`:'';
  out.style.display=p.length?'':'none';
}
function obterSOAPLocalAtual(){return textoSoapAtual(false)}
function mostrarMensagemIA(mensagem){const st=document.getElementById('ai-soap-status');if(st)st.textContent=mensagem;showToast(mensagem)}
function montarDadosConsultaParaIA(tipoConsulta){
  const prefix=prefixoPaginaAtual(),cfg=lerConfigAISoap(),soapLocal=obterSOAPLocalAtual();
  if(prefix){
    const dados=dadosConsultaAISoap(prefix,cfg);
    dados.soapLocal=soapLocal;
    dados.origem='soap_local_gerado_pelo_sistema';
    dados.objetivoIA='Lapidar o SOAP local em estilo misto, mantendo dados, corrigindo repetições e sem inventar informações.';
    return dados;
  }
  return{descricaoConsulta:tipoConsulta||'Consulta de enfermagem',soapLocal,origem:'soap_local_gerado_pelo_sistema',objetivoIA:'Lapidar o SOAP local em estilo misto, mantendo dados, corrigindo repetições e sem inventar informações.'};
}
function carregarConfiguracaoIASOAP(){
  const cfg=lerConfigAISoap();
  return{...cfg,ativa:!!cfg.enabled,instrucaoExtra:cfg.extra||''};
}
function normalizarTextoSoapRetornado(valor){
  let txt=String(valor||'').trim();
  if(!/^\s*\{/.test(txt))return txt;
  try{
    const obj=JSON.parse(txt);
    if(typeof obj.soap==='string')return obj.soap.trim();
    if(obj.descricao||obj.s||obj.o||obj.a||obj.p){
      return [
        'DESCRIÇÃO DA CONSULTA',
        obj.descricao||obj.descricao_consulta||'Consulta de enfermagem realizada na APS/ESF.',
        '',
        'S:',obj.s||obj.subjetivo||'',
        '',
        'O:',obj.o||obj.objetivo||'',
        '',
        'A:',obj.a||obj.avaliacao||obj.avaliação||'',
        '',
        'P:',obj.p||obj.plano||obj.conduta||''
      ].join('\n').replace(/\n{3,}/g,'\n\n').trim();
    }
  }catch(e){}
  return txt;
}
function aplicarTextoCompletoAISoap(prefix,novoSOAP,pendencias){
  const ids=SOAP_IDS_MODULO[prefix];if(!ids)return false;
  const s=document.getElementById(ids.s),o=document.getElementById(ids.o),a=document.getElementById(ids.a),p=document.getElementById(ids.p);if(!s||!o||!a||!p)return false;
  novoSOAP=normalizarTextoSoapRetornado(novoSOAP);
  const partes=extrairSoapTextoIA(novoSOAP),temPartes=!!(partes.s||partes.o||partes.a||partes.p);
  if(!temPartes){
    s.value=String(novoSOAP||'').trim();
    o.value='';a.value='';p.value='';
  }else{
    s.value=`DESCRIÇÃO DA CONSULTA\n${(partes.descricao||extrairDescricaoSoapAtual(novoSOAP)||'Consulta de enfermagem realizada na APS/ESF.').trim()}\n\nS:${partes.s?`\n${partes.s.trim()}`:''}`;
    o.value=`O:${partes.o?`\n${partes.o.trim()}`:''}`;
    a.value=`A:${partes.a?`\n${partes.a.trim()}`:''}`;
    p.value=`P:${partes.p?`\n${partes.p.trim()}`:''}`;
  }
  renderPendenciasIASoap(prefix,pendencias||[]);renderAlertasVermelhosSoap(prefix);renderPendenciasSoap(prefix);renderInconsistenciasSoap(prefix);atualizarIndicadorPreenchimento();
  return true;
}
async function cabecalhosIASegura(){
  if(window.MODO_OFFLINE||!_sb||!CURRENT_AUTH_USER_ID)throw new Error('Entre novamente para usar a IA.');
  const {data,error}=await _sb.auth.getSession();
  if(error||!data?.session?.access_token||data.session.user?.id!==CURRENT_AUTH_USER_ID)throw new Error('Sessão expirada. Entre novamente.');
  return {'Content-Type':'application/json','Authorization':'Bearer '+data.session.access_token,apikey:_SB_KEY};
}
function modeloEdgeFunctionAISoap(){return 'Consulte supabase/functions/gerar-soap e supabase/README.md no repositório. A instalação exige autenticação, permissões, limite de uso e origens autorizadas. Não há modelo público sem autenticação.';}
async function copiarModeloEdgeFunctionAISoap(){await copiarTextoSeguro(modeloEdgeFunctionAISoap(),'Instruções da função segura copiadas.');}
async function testarConfigAISoap(){
  const cfg=lerFormAISoap(),st=document.getElementById('ai-soap-status');
  if(!cfg.endpoint){if(st)st.textContent='Informe o endpoint da API antes de testar.';return}
  if(st)st.textContent='Testando a API...';
  try{
    // Espelha o envelope REAL enviado por gerarSoapPorIA ({tipoAcao,tipoConsulta,dadosConsulta}
    // centrado em soapLocal). Um teste com formato divergente do fluxo real dava falso "ok".
    const payloadTeste={
      tipoAcao:'gerar_soap',
      tipoConsulta:'preventivo',
      dadosConsulta:{
        descricaoConsulta:'Teste de conexão IA SOAP',
        soapLocal:'S: paciente comparece para rastreamento citopatológico.\nO: colo sem alterações à inspeção.\nA: preventivo de rotina.\nP: manter rastreamento conforme protocolo municipal.',
        origem:'teste_conexao',
        objetivoIA:'Teste de conexão: apenas confirmar resposta da IA SOAP, sem inventar dados.'
      }
    };
    const r=await fetchComTimeout(cfg.endpoint,{method:'POST',headers:await cabecalhosIASegura(),body:JSON.stringify(payloadTeste)},30000);
    const texto=await r.text();
    if(!r.ok)throw new Error(`API respondeu ${r.status}: ${texto.slice(0,240)}`);
    let json;try{json=JSON.parse(texto)}catch(e){throw new Error('Resposta não veio em JSON válido.')}
    const soap=json?.data?.soap||json?.soap;
    if(!soap){console.log('Resposta recebida da IA SOAP:',json);throw new Error('Resposta sem campo soap/data.soap.');}
    if(st)st.textContent='Conexão com IA SOAP funcionando.';
    showToast('Conexão com IA SOAP funcionando.');
  }catch(e){
    if(st)st.textContent=explicarFalhaAISoap(e,cfg);
  }
}
function textoSoapAtual(incluirPendencias=false){const prefix=prefixoPaginaAtual(),ids=SOAP_IDS_MODULO[prefix];if(!ids)return'';const txt=[ids.s,ids.o,ids.a,ids.p].map(id=>document.getElementById(id)?.value.trim()).filter(Boolean).join('\n\n');const pend=incluirPendencias?[...gerarPendenciasSoap(prefix),...(AI_SOAP_PENDENCIAS[prefix]||[])]:[];return txt+(pend.length?`\n\nPENDÊNCIAS PARA REVISAR ANTES DE SALVAR:\n- ${[...new Set(pend)].join('\n- ')}`:'')}
function textoSoapComSae(){const prefix=prefixoPaginaAtual();return textoSoapAtual(false)+resumoPlanoCuidados(prefix)}
async function copiarTextoSeguro(txt,msg){if(!txt)return showToast('Gere ou preencha a evolução antes de copiar.');try{await navigator.clipboard.writeText(txt);showToast(msg)}catch(e){const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();showToast(msg)}}
function podeCopiarSoapAtual(){
  const prefix=prefixoPaginaAtual();if(!prefix)return true;
  const avisos=validarEntradaPreSoap(prefix);
  if(avisos.length){renderAlertasVermelhosSoap(prefix);renderInconsistenciasSoap(prefix);showToast('Há avisos para revisar, mas a cópia foi liberada.')}
  return true;
}
function quickCopiarEvolucao(){if(!podeCopiarSoapAtual())return;return copiarTextoSeguro(textoSoapAtual(false),'Somente o SOAP foi copiado.')}
function quickCopiarSoapPendencias(){if(!podeCopiarSoapAtual())return;return copiarTextoSeguro(textoSoapAtual(true),'SOAP e pendências foram copiados.')}
function quickCopiarSoapSae(){if(!podeCopiarSoapAtual())return;return copiarTextoSeguro(textoSoapComSae(),'SOAP e SAE foram copiados.')}
function quickSalvar(){const b=botaoAcaoPagina(/salvar atendimento/i);b?b.click():showToast('Este módulo ainda não possui salvamento conectado.')}
function quickLimpar(){const pg=document.querySelector('.pg.on');if(!pg||!confirm('Limpar os campos clínicos desta consulta? Os dados básicos do paciente serão mantidos.'))return;pg.querySelectorAll('input,select,textarea').forEach(e=>{if(/-(nome|cpf|cns|nasc|telefone|cep|logradouro|numero|bairro|municipio|uf)$/.test(e.id)||['button','submit','file','hidden'].includes(e.type))return;if(e.type==='checkbox'||e.type==='radio')e.checked=false;else e.value=''});atualizarIndicadorPreenchimento();showToast('Campos clínicos limpos.')}
function atualizarBarraAcoesRapidas(){
  const bar=document.getElementById('quick-actions'),p=prefixoPaginaAtual(),on=!!p&&moduloAtivo(document.querySelector('.pg.on')?.id.replace(/^pg-/,''));
  bar?.classList.toggle('on',on);document.body.classList.toggle('quick-actions-visible',on);const auto=document.getElementById('autosave-indicator');if(auto)auto.style.bottom=on?'76px':'10px';if(on)atualizarIndicadorPreenchimento();
}
document.addEventListener('DOMContentLoaded',()=>{const bar=document.createElement('div');bar.id='quick-actions';bar.className='quick-actions';bar.innerHTML=`<div class="quick-completion"><strong id="quick-completion-title">Consulta 0% preenchida</strong><small id="quick-completion-detail">Preencha os campos essenciais</small><div class="quick-progress"><span id="quick-progress-fill"></span></div></div><select id="quick-soap-mode" class="soap-mode-select" title="Tipo de evolução" onchange="definirModoSoap(this.value)"><option value="curto">SOAP curto</option><option value="completo">SOAP completo</option><option value="sae">SOAP + SAE</option></select><button class="quick-action-btn primary" onclick="quickGerarSoap()">Gerar SOAP</button><button class="quick-action-btn ai" onclick="gerarSoapPorIA()">IA SOAP</button><button class="quick-action-btn" onclick="quickCopiarEvolucao()">Copiar somente SOAP</button><button class="quick-action-btn" onclick="quickCopiarSoapPendencias()">Copiar SOAP + pendências</button><button class="quick-action-btn" onclick="quickCopiarSoapSae()">Copiar SOAP + SAE</button><button class="quick-action-btn" onclick="quickSalvar()">Salvar atendimento</button><button class="quick-action-btn" onclick="quickLimpar()">Limpar campos</button><button class="quick-action-btn" onclick="go('pacientes')">Selecionar paciente</button>`;document.body.appendChild(bar);definirModoSoap(localStorage.getItem('esf_modo_soap')||'completo');atualizarBarraAcoesRapidas();carregarModulosAtivos();setTimeout(()=>{if(typeof aplicarPermissoesInterface==='function')aplicarPermissoesInterface()},350)});
document.addEventListener('DOMContentLoaded',()=>{const observer=new MutationObserver(ms=>{if(ms.some(m=>Array.from(m.addedNodes).some(n=>n.nodeType===1&&!n.closest?.('#admin-screen'))))aplicarModulosAtivos()});observer.observe(document.body,{childList:true,subtree:true});setTimeout(aplicarModulosAtivos,500)});
document.addEventListener('input',()=>setTimeout(atualizarIndicadorPreenchimento,0));document.addEventListener('change',()=>setTimeout(atualizarIndicadorPreenchimento,0));document.addEventListener('click',()=>setTimeout(atualizarIndicadorPreenchimento,50));

// ══ SISTEMA DE ATENDIMENTOS — localStorage ═══════════════════════

function carregarAtendimentos() {
  try {
    const chaveAtual=chaveAtendimentosAtual();
    // Dados legados sem proprietário exigem recuperação explícita após conferência.
    if(!CURRENT_AUTH_USER_ID)return [];
    return filtrarAtendimentosPorEscopo(JSON.parse(localStorage.getItem(chaveAtual) || '[]'));
  } catch(e) { return []; }
}
function filtrarAtendimentosPorEscopo(lista){
  const nivel=PERMISSOES_ATUAIS.nivel_acesso||'enfermeiro',unidade=(PERMISSOES_ATUAIS.unidade_escopo||CURRENT_USER_PROFILE?.unidade||'').trim().toLowerCase(),municipio=(PERMISSOES_ATUAIS.municipio_escopo||'Toledo').trim().toLowerCase();
  if(nivel==='gerente_municipal')return lista.filter(a=>!municipio||!a.municipio||String(a.municipio).toLowerCase()===municipio);
  if(nivel==='gerente_esf')return lista.filter(a=>!unidade||String(a.unidade||'').trim().toLowerCase()===unidade);
  return lista.filter(a=>!a.user_id||a.user_id===CURRENT_AUTH_USER_ID);
}
function aplicarEscopoQueryAtendimentos(query){
  const nivel=PERMISSOES_ATUAIS.nivel_acesso||'enfermeiro';
  if(temPermissao('ver_admin'))return query;
  if(nivel==='gerente_municipal')return query.eq('municipio',PERMISSOES_ATUAIS.municipio_escopo||'Toledo');
  if(nivel==='gerente_esf')return query.eq('unidade',PERMISSOES_ATUAIS.unidade_escopo||CURRENT_USER_PROFILE?.unidade||'');
  return query.eq('user_id',CURRENT_AUTH_USER_ID);
}

function salvarAtendimentos(lista) {
  localStorage.setItem(chaveAtendimentosAtual(), JSON.stringify(lista));
  agendarSincronizacao();
}

function agendarSincronizacao(){
  clearTimeout(syncTimer);
  syncTimer=setTimeout(sincronizarAtendimentosPendentes,900);
}

async function sincronizarAtendimentosPendentes(){
  if(syncRunning||!_sb||!CURRENT_AUTH_USER_ID||!navigator.onLine)return;
  const uid=CURRENT_AUTH_USER_ID,storageKey=chaveAtendimentosAtual(),deleteKey=chaveExclusoesAtual();
  const lista=carregarAtendimentos(), pendentes=lista.filter(a=>!a.synced),snapshots=new Map(pendentes.map(a=>[a.id,JSON.stringify(a)]));
  const exclusoes=JSON.parse(localStorage.getItem(chaveExclusoesAtual())||'[]');
  const pacientesPendentes=JSON.parse(localStorage.getItem(chavePacientesPendentes())||'[]');
  if(!pendentes.length&&!exclusoes.length&&!pacientesPendentes.length)return;
  syncRunning=true;
  try{
    await sincronizarPacientesPendentes();
    if(CURRENT_AUTH_USER_ID!==uid)return;
    if(exclusoes.length){
      const {error}=await _sb.from('atendimentos').delete().eq('user_id',CURRENT_AUTH_USER_ID).in('id_local',exclusoes);
      if(error)throw error;
      localStorage.setItem(deleteKey,JSON.stringify(JSON.parse(localStorage.getItem(deleteKey)||'[]').filter(id=>!exclusoes.includes(id))));
    }
    if(CURRENT_AUTH_USER_ID!==uid)return;
    if(pendentes.length){
      const linhas=pendentes.map(a=>({id_local:a.id,paciente:a.nome,paciente_cpf:a.cpf||'',tipo:a.tipo,profissional:a.profissional,unidade:a.unidade||'',municipio:a.municipio||'Toledo',data:a.data,soap:a.soap,dados:a.dados||{},user_id:CURRENT_AUTH_USER_ID}));
      let {error}=await _sb.from('atendimentos').upsert(linhas,{onConflict:'user_id,id_local'});
      if(error&&/municipio|schema cache|column/i.test(error.message||'')){const compativeis=linhas.map(({municipio,...a})=>a);({error}=await _sb.from('atendimentos').upsert(compativeis,{onConflict:'user_id,id_local'}))}
      if(error)throw error;
      const atualizados=JSON.parse(localStorage.getItem(storageKey)||'[]').map(a=>snapshots.get(a.id)===JSON.stringify(a)?{...a,synced:true}:a);
      localStorage.setItem(storageKey,JSON.stringify(atualizados));
    }
  }catch(e){
    console.warn('[ESF] Sincronizacao pendente:',e?.message||e);
  }finally{syncRunning=false;}
}

async function baixarAtendimentosNuvem(){
  if(!_sb||!CURRENT_AUTH_USER_ID||!navigator.onLine)return;
  const uid=CURRENT_AUTH_USER_ID;
  try{
    const {data,error}=await aplicarEscopoQueryAtendimentos(_sb.from('atendimentos').select('*')).order('data',{ascending:false});
    if(error)throw error;
    if(CURRENT_AUTH_USER_ID!==uid)return;
    const locais=carregarAtendimentos(), mapa=new Map(locais.map(a=>[a.id,a]));
    (data||[]).forEach(a=>{
      const local=mapa.get(a.id_local);
      if(!local||local.synced!==false)mapa.set(a.id_local,{id:a.id_local,nome:a.paciente,cpf:a.paciente_cpf||'',tipo:a.tipo,profissional:a.profissional,unidade:a.unidade||'',municipio:a.municipio||'',user_id:a.user_id,data:a.data,soap:a.soap,dados:a.dados||{},synced:true});
    });
    const unidos=[...mapa.values()].sort((a,b)=>new Date(b.data)-new Date(a.data));
    localStorage.setItem(chaveAtendimentosAtual(),JSON.stringify(unidos));
    if(document.getElementById('pg-historico')?.classList.contains('on'))renderHistorico();
  }catch(e){console.warn('[ESF] Leitura da nuvem indisponivel:',e?.message||e);}
}

async function sincronizarAgora(){
  if(window.MODO_OFFLINE){
    showToast('Modo offline: os dados serão sincronizados automaticamente ao reconectar.');
    return;
  }
  if(!_sb||!navigator.onLine){
    showToast('Sem conexão para sincronizar agora.');
    return;
  }
  showToast('Sincronizando...');
  try{
    if(typeof sincronizarAtendimentosPendentes==='function')await sincronizarAtendimentosPendentes();
    if(typeof sincronizarPacientesPendentes==='function')await sincronizarPacientesPendentes();
    if(typeof baixarAtendimentosNuvem==='function')await baixarAtendimentosNuvem();
    if(typeof baixarPacientesNuvem==='function')await baixarPacientesNuvem(true);
    showToast('Sincronização concluída.');
  }catch(e){
    console.warn('[ESF] Sincronizar agora:',e?.message||e);
    showToast('Não foi possível concluir a sincronização. Tente novamente.');
  }
}

function coletarSOAP(ids) {
  return ids.map(id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }).join('\n\n').trim();
}

function coletarDadosModulo(prefix){
  const pagina=document.getElementById('pg-'+moduloPorPrefixo(prefix)?.page), dados={};
  pagina?.querySelectorAll('input,select,textarea').forEach((el,i)=>{
    if(['button','submit','file','password'].includes(el.type))return;
    const key=el.id||`@${i}`;
    if(el.type==='checkbox'||el.type==='radio')dados[key]={checked:el.checked,value:el.value};
    else dados[key]=el.value;
  });
  return dados;
}
function restaurarDadosModulo(prefix,dados){
  const pagina=document.getElementById('pg-'+moduloPorPrefixo(prefix)?.page), controles=pagina?.querySelectorAll('input,select,textarea')||[];
  Object.entries(dados||{}).forEach(([id,v])=>{const el=id.startsWith('@')?controles[Number(id.slice(1))]:document.getElementById(id);if(!el)return;if(typeof v==='object'&&v!==null&&'checked'in v){el.checked=!!v.checked;}else el.value=v??'';});
  if(prefix==='pna'){idadeGest();calcIG('pna');avaliarProtocolosPna();atualizarTestesRapidosPna();}
  if(prefix==='pnc'){calcAge('pnc-nasc','pnc-idade');calcIG('pnc');checkPncQueixas();checkPncVitais();}
  if(prefix==='pu'){idadeCrianca();updateAntropometria();checkMCHATIdade();avaliarDNPMAutomatico();}
  if(prefix==='prev'){idadePrev();prevVerificaIdade();prevMostraResultadoDetalhe();prevAlertaAdequab();prevAlertaAtipias();}
  if(prefix==='id')idadeIdoso();
  if(prefix==='sm'){idadeSM();calcERSM();}
  if(prefix==='vd')setTimeout(()=>{atualizarDispositivosVD();Object.entries(dados||{}).forEach(([id,v])=>{const el=document.getElementById(id);if(!el)return;if(typeof v==='object'&&v!==null&&'checked'in v)el.checked=!!v.checked;else el.value=v??''});calcularEscalasVD();classificarRiscoVD();},0);
  if(MODULOS_CLINICOS?.[prefix])setTimeout(()=>avaliarPrioridadeModulo(prefix),0);
  setTimeout(()=>avaliarVacinasModulo(prefix),0);
}
function criarAtendimento(tipo) {
  const u = getUsuarioAtual();
  if (!u || !u.nome) {
    showToast('Identifique-se antes de salvar. Toque no ícone de perfil no canto superior direito.');
    // abre modal de usuário automaticamente
    document.getElementById('user-modal').classList.add('open');
    return null;
  }
  const cfg=MODULOS_ATENDIMENTO[tipo], prefix=cfg.prefix;
  const nome = document.getElementById(cfg.nome)?.value?.trim() || 'Paciente não identificado';
  const cpf=normalizarCPF(document.getElementById(cfg.cpf)?.value);
  const soap = coletarSOAP(cfg.soap);
  if (!soap) { showToast('Gere o SOAP antes de salvar. Toque em GERAR EVOLUÇÃO primeiro.'); return null; }
  const conselho = u.conselho ? ` (${u.conselho})` : '';
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    tipo,
    nome,
    cpf,
    soap,
    dados:coletarDadosModulo(prefix),
    data: new Date().toISOString(),
    profissional: `${u.nome}${conselho} · ${u.cargo}`,
    unidade: u.unidade || '',
    municipio: PERMISSOES_ATUAIS.municipio_escopo || u.municipio || 'Toledo',
    user_id: CURRENT_AUTH_USER_ID,
  };
}

// Aviso soft (não bloqueia) quando nome/CPF do paciente estão vazios.
function confirmarSalvarSemIdentificacao(faltando){
  return new Promise(resolve=>{
    let m=document.getElementById('sem-ident-modal');
    if(!m){m=document.createElement('div');m.id='sem-ident-modal';m.className='edit-modal';document.body.appendChild(m);}
    m.innerHTML=`<div class="edit-panel" style="max-width:480px"><h3><span data-ic="warning"></span> Identificação incompleta</h3><p style="font-size:13px;color:var(--tx2);line-height:1.6">Salvar atendimento sem ${faltando} do paciente? Isso dificulta a rastreabilidade.</p><div class="edit-actions" style="margin-top:18px"><button class="btn btn-p" id="sem-ident-voltar">Voltar e preencher</button><button class="edit-cancel-btn" id="sem-ident-salvar">Salvar mesmo assim</button></div></div>`;
    m.classList.add('open');
    if(typeof hidratarIcones==='function')hidratarIcones(m);
    const fechar=v=>{m.classList.remove('open');resolve(v);};
    m.querySelector('#sem-ident-voltar').onclick=()=>fechar(false);
    m.querySelector('#sem-ident-salvar').onclick=()=>fechar(true);
  });
}

async function salvarAtendimentoModulo(tipo){
  const cfgSalvar=MODULOS_ATENDIMENTO[tipo],prefixSalvar=cfgSalvar?.prefix;
  if(prefixSalvar){
    validarEntradaPreSoap(prefixSalvar);
    renderAlertasVermelhosSoap(prefixSalvar);renderInconsistenciasSoap(prefixSalvar);
    // Aviso soft (não bloqueia): nome ou CPF do paciente ausentes.
    const dadosPac=coletarDadosPaciente(prefixSalvar);
    const semNome=!dadosPac.nome, semCpf=!dadosPac.cpf;
    if(semNome||semCpf){
      const faltando=semNome&&semCpf?'nome e CPF':(semNome?'nome':'CPF');
      if(!(await confirmarSalvarSemIdentificacao(faltando)))return;
    }
  }
  if(typeof abrirChecklistPreSalvar==='function'&&!(await abrirChecklistPreSalvar(tipo)))return;
  const a=criarAtendimento(tipo);if(!a)return;
  const lista = carregarAtendimentos();
  const cfg=MODULOS_ATENDIMENTO[tipo];
  salvarCadastroPaciente(cfg.prefix);
  const editando=!!ATENDIMENTO_EM_EDICAO;
  if(ATENDIMENTO_EM_EDICAO){
    const idx=lista.findIndex(x=>x.id===ATENDIMENTO_EM_EDICAO);
    if(idx>=0&&lista[idx].tipo===tipo){lista[idx]={...lista[idx],...a,id:lista[idx].id,data:lista[idx].data,editadoEm:new Date().toISOString(),synced:false};}
    else lista.unshift(a);
    ATENDIMENTO_EM_EDICAO=null;
  }else lista.unshift(a);
  salvarAtendimentos(lista);
  registrarAuditoria(editando?'Atendimento editado':'Atendimento salvo',`${tipo} · ${a.id}`);
  showToast('✓ Atendimento e cadastro do paciente salvos!');
  setTimeout(renderHistorico, 300);
}
function salvarAtendimento_pna(){salvarAtendimentoModulo('Abertura PN')}
function salvarAtendimento_pnc(){salvarAtendimentoModulo('Consulta PN')}
function salvarAtendimento_pu(){salvarAtendimentoModulo('Puericultura')}
function salvarAtendimento_prev(){salvarAtendimentoModulo('Preventivo')}
function salvarAtendimento_id(){salvarAtendimentoModulo('Idoso')}
function salvarAtendimento_sm(){salvarAtendimentoModulo('Saúde Mental')}

// ══ RENDERIZAR HISTÓRICO ════════════════════════════════════════
const tipoCss = {
  'Abertura PN':'pna','Consulta PN':'pnc','Puericultura':'pu',
  'Preventivo':'prev','Idoso':'id','Saúde Mental':'sm','Consulta Geral':'ger',
  'Acolhimento':'acol','Hiperdia':'hip','Feridas / Curativos':'fer','Puerpério':'puerp','IST / Testes Rápidos':'ist','Visita Domiciliar':'vd'
};

function renderHistorico() {
  if(!temPermissao('ver_historico'))return;
  const lista = carregarAtendimentos();
  const busca = (document.getElementById('hist-busca')?.value || '').toLowerCase();
  const filtroTipo = document.getElementById('hist-filtro-tipo')?.value || '';
  const filtroUser = document.getElementById('hist-filtro-user')?.value || '';

  // Populate user filter
  const sel = document.getElementById('hist-filtro-user');
  if (sel) {
    const users = [...new Set(lista.map(a=>a.profissional).filter(Boolean))];
    const curVal = sel.value;
    sel.innerHTML = '<option value="">Todos os profissionais</option>' +
      users.map(u=>`<option ${u===curVal?'selected':''}>${escTR(u)}</option>`).join('');
  }

  let filtrada = lista.filter(a => {
    const txt = (a.nome + (a.cpf||'') + a.tipo + a.profissional + a.soap).toLowerCase();
    if (busca && !txt.includes(busca)) return false;
    if (filtroTipo && a.tipo !== filtroTipo) return false;
    if (filtroUser && a.profissional !== filtroUser) return false;
    return true;
  });

  // Stats bar
  const statsEl = document.getElementById('hist-stats-bar');
  if (statsEl) {
    const total = lista.length;
    const hoje = lista.filter(a => new Date(a.data).toDateString() === new Date().toDateString()).length;
    const profSet = new Set(lista.map(a=>a.profissional).filter(Boolean));
    const tipos = {};
    lista.forEach(a => tipos[a.tipo] = (tipos[a.tipo]||0)+1);
    const topTipo = Object.entries(tipos).sort((x,y)=>y[1]-x[1])[0];
    statsEl.innerHTML = `
      <div class="hist-stat"><strong>${total}</strong>total</div>
      <div class="hist-stat"><strong>${hoje}</strong>hoje</div>
      <div class="hist-stat"><strong>${profSet.size}</strong>profissional(is)</div>
      ${topTipo ? `<div class="hist-stat"><strong>${topTipo[1]}</strong>${escTR(topTipo[0])}</div>` : ''}
    `;
  }

  const el = document.getElementById('hist-lista');
  if (!filtrada.length) {
    el.innerHTML = '<div class="hist-empty">'+ic('inbox')+' Nenhum atendimento encontrado</div>';
    return;
  }

  el.innerHTML = filtrada.map(a => {
    const css = tipoCss[a.tipo] || 'pna';
    const dt = new Date(a.data);
    const dtStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const soap = (a.soap||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `
<div class="hist-card" id="hcard-${a.id}">
  <div class="hist-head" onclick="toggleHistCard('${a.id}')">
    <span class="hist-badge hist-tipo-${css}">${escTR(a.tipo)}</span>
    <div class="hist-meta">
      <div class="hist-nome">${escTR(a.nome)}</div>
      <div class="hist-sub">${dtStr}${a.cpf?' · CPF '+escTR(formatarCPF(a.cpf)):''} · ${escTR(a.profissional)}</div>
    </div>
    <div class="hist-actions" onclick="event.stopPropagation()">
      ${a.dados&&Object.keys(a.dados).length?`<button class="hist-btn hist-btn-edit" onclick="reabrirAtendimento('${a.id}')">↗ Reabrir consulta</button>`:''}
      <button class="hist-btn" onclick="abrirEdicao('${a.id}')" style="display:inline-flex;align-items:center;gap:5px">${ic('pencil')} Editar SOAP</button>
      <button class="hist-btn" onclick="exportarUm('${a.id}')">⬇ TXT</button>
      <button class="hist-btn" onclick="copiarSOAP('${a.id}')" style="display:inline-flex;align-items:center;gap:5px">${ic('clipboard')} Copiar</button>
      <button class="hist-btn hist-btn-del" onclick="excluirAtendimento('${a.id}')" title="Excluir">${ic('trash')}</button>
    </div>
  </div>
  <div class="hist-body" id="hbody-${a.id}">
    <pre class="hist-soap">${soap || '(sem conteúdo SOAP)'}</pre>
    <div class="hist-user-tag">Profissional: ${escTR(a.profissional)}${a.unidade?' · '+escTR(a.unidade):''}${a.editadoEm ? '<span style="margin-left:8px;opacity:.55;font-size:10px">· editado '+new Date(a.editadoEm).toLocaleDateString('pt-BR')+'</span>' : ''}</div>
  </div>
</div>`;
  }).join('');
  verificarVolumeAtendimentos();
}

function toggleHistCard(id) {
  const head = document.querySelector(`#hcard-${id} .hist-head`);
  const body = document.getElementById(`hbody-${id}`);
  const open = body.classList.toggle('open');
  head.classList.toggle('open', open);
}

async function excluirAtendimento(id) {
  if (!confirm('Excluir este atendimento?')) return;
  const lista = carregarAtendimentos().filter(a => a.id !== id);
  const exclusoes=new Set(JSON.parse(localStorage.getItem(chaveExclusoesAtual())||'[]'));
  exclusoes.add(id);
  localStorage.setItem(chaveExclusoesAtual(),JSON.stringify([...exclusoes]));
  salvarAtendimentos(lista);
  renderHistorico();
  showToast(navigator.onLine?'Atendimento excluído.':'Excluído do aparelho; a nuvem será atualizada quando houver internet.');
}

function exportarUm(id) {
  const a = carregarAtendimentos().find(x=>x.id===id);
  if (!a) return;
  const dt = new Date(a.data).toLocaleDateString('pt-BR');
  const txt = `ATENDIMENTO ESF — ${a.tipo}
${'='.repeat(40)}
Data: ${dt}
Paciente: ${a.nome}
Profissional: ${a.profissional}
Unidade: ${a.unidade||'-'}

${a.soap}`;
  const blob = new Blob([txt], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `atendimento-${a.tipo.replace(/\s+/g,'-')}-${dt.replace(/\//g,'-')}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function copiarSOAP(id) {
  const a = carregarAtendimentos().find(x=>x.id===id);
  if (!a) return;
  navigator.clipboard.writeText(a.soap).then(()=>showToast('SOAP copiado!'));
}

function exportarTodosJSON() {
  const lista = carregarAtendimentos();
  const blob = new Blob([JSON.stringify(lista, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `esf-atendimentos-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`${lista.length} atendimento(s) exportado(s)!`);
}

// ══ ARQUIVAMENTO NÃO-DESTRUTIVO DE ATENDIMENTOS ANTIGOS ══════════
// Exporta TODOS antes de remover; só remove do aparelho os mais antigos que N meses.
// A cópia na nuvem (Supabase) permanece intacta.
async function arquivarAtendimentosAntigos(mesesLimite){
  const meses = Number.isFinite(mesesLimite) ? mesesLimite : 12;
  const chave = chaveAtendimentosAtual();
  let bruto;
  try{ bruto = JSON.parse(localStorage.getItem(chave) || '[]'); }
  catch(e){ bruto = []; }
  if(!Array.isArray(bruto) || !bruto.length){ showToast('Não há atendimentos para arquivar.'); return; }

  // (a) EXPORTA TUDO ANTES de qualquer remoção.
  try{
    const blob = new Blob([JSON.stringify(bruto, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `esf-atendimentos-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 120000);
  }catch(e){
    showToast('Não foi possível exportar o backup. Nada foi removido.');
    return;
  }

  // (b) SÓ DEPOIS remove os mais antigos que o limite; mantém os recentes.
  const corte = new Date();
  corte.setMonth(corte.getMonth() - meses);
  const limite = corte.getTime();
  const antes = bruto.length;
  const mantidos = bruto.filter(a=>{
    const t = a && a.data ? new Date(a.data).getTime() : NaN;
    // Mantém: recentes, sem data válida (não perde por engano) ou ainda não sincronizados.
    if(!Number.isFinite(t)) return true;
    if(a.synced === false) return true;
    return t >= limite;
  });
  const arquivados = antes - mantidos.length;
  if(!arquivados){ showToast(`Backup exportado. Nenhum atendimento com mais de ${meses} meses para liberar.`); return; }

  localStorage.setItem(chave, JSON.stringify(mantidos));
  registrarAuditoria('Atendimentos antigos arquivados', `${arquivados} removido(s) do aparelho (backup exportado)`);
  if(document.getElementById('pg-historico')?.classList.contains('on')) renderHistorico();
  showToast(`${arquivados} atendimento(s) arquivado(s) e liberado(s) do aparelho. Backup exportado.`);
}

// Aviso não-bloqueante, uma vez por sessão, quando o histórico ficar grande.
let _avisoArquivamentoMostrado = false;
function verificarVolumeAtendimentos(){
  if(_avisoArquivamentoMostrado) return;
  try{
    if(carregarAtendimentos().length > 800){
      _avisoArquivamentoMostrado = true;
      showToast('Histórico grande neste aparelho. Considere "Arquivar antigos" para liberar espaço.');
    }
  }catch(e){}
}

function exportarTodosTexto() {
  const lista = carregarAtendimentos();
  const txt = lista.map(a => {
    const dt = new Date(a.data).toLocaleDateString('pt-BR');
    return `ATENDIMENTO ESF — ${a.tipo}
${'='.repeat(40)}
Data: ${dt}
Paciente: ${a.nome}
Profissional: ${a.profissional}
Unidade: ${a.unidade||'-'}

${a.soap}

${'─'.repeat(40)}
`;
  }).join('\n');
  const blob = new Blob([txt], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `esf-atendimentos-${new Date().toISOString().slice(0,10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function importarJSON() {
  document.getElementById('import-file').click();
}

function processarImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importados = JSON.parse(e.target.result);
      if (!Array.isArray(importados)) throw new Error();
      const existentes = carregarAtendimentos();
      const idsExist = new Set(existentes.map(a=>a.id));
      const novos = importados.filter(a => !idsExist.has(a.id)).map(a=>({...a,synced:false}));
      salvarAtendimentos([...novos, ...existentes]);
      renderHistorico();
      showToast(`✓ ${novos.length} atendimento(s) importado(s)!`);
    } catch {
      showToast('Arquivo inválido.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}


// ══ EDIÇÃO DE ATENDIMENTO ══════════════════════════════════════════
function abrirEdicao(id) {
  const lista = carregarAtendimentos();
  const a = lista.find(x => x.id === id);
  if (!a) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-nome').value = a.nome || '';
  document.getElementById('edit-tipo').value = a.tipo || 'Abertura PN';
  // Convert ISO to datetime-local format
  const dt = new Date(a.data);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,16);
  document.getElementById('edit-data').value = local;
  document.getElementById('edit-soap').value = a.soap || '';
  document.getElementById('edit-prof').value = a.profissional || '';
  document.getElementById('edit-unidade').value = a.unidade || '';
  document.getElementById('edit-modal').classList.add('open');
}

function fecharEdicao() {
  document.getElementById('edit-modal').classList.remove('open');
}

function salvarEdicao() {
  const id = document.getElementById('edit-id').value;
  const lista = carregarAtendimentos();
  const idx = lista.findIndex(x => x.id === id);
  if (idx === -1) { showToast('Atendimento não encontrado'); return; }
  const soapEditado=document.getElementById('edit-soap').value.trim(),cfg=MODULOS_ATENDIMENTO[document.getElementById('edit-tipo').value],dados={...(lista[idx].dados||{})};
  if(cfg&&Object.keys(dados).length){
    const partes=soapEditado.split(/\n\n+/);
    if(partes.length===cfg.soap.length){
      // Estrutura íntegra (um bloco por campo S/O/A/P): redistribui posicionalmente.
      partes.forEach((v,i)=>dados[cfg.soap[i]]=v);
    } else {
      // Nº de blocos != nº de campos: NÃO redistribui às cegas (evitaria trocar conteúdo
      // entre S/O/A/P silenciosamente). Mantém o texto completo em .soap e avisa.
      showToast('SOAP salvo como texto. Os campos S/O/A/P não foram re-divididos (estrutura alterada); ao reabrir a consulta eles mostrarão a versão anterior.');
    }
  }
  lista[idx] = {
    ...lista[idx],
    nome: document.getElementById('edit-nome').value.trim(),
    tipo: document.getElementById('edit-tipo').value,
    data: new Date(document.getElementById('edit-data').value).toISOString(),
    soap: soapEditado,
    dados,
    profissional: document.getElementById('edit-prof').value.trim(),
    unidade: document.getElementById('edit-unidade').value.trim(),
    editadoEm: new Date().toISOString(),
    synced: false,
  };
  salvarAtendimentos(lista);
  fecharEdicao();
  renderHistorico();
  showToast('✓ Atendimento atualizado!');
}

// ── Relatos, sugestões e revisão de protocolos ─────────────────
const REPORTES_KEY='esf_reportes_v1';
function reportesLocais(){try{return JSON.parse(localStorage.getItem(chaveDadosLocais(REPORTES_KEY))||'[]')}catch(e){return []}}
function autorReporte(){const u=getUsuarioAtual?.()||CURRENT_USER_PROFILE||{};return u.nome||'Profissional não identificado'}
async function salvarReporte(){
  if(!exigirPermissao('reportar_erro'))return;
  const titulo=document.getElementById('rep-titulo').value.trim(),descricao=document.getElementById('rep-descricao').value.trim();
  if(!titulo||!descricao)return showToast('Preencha o título e a descrição do relato.');
  const item={id_local:'rep-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),user_id:CURRENT_AUTH_USER_ID||'',autor:autorReporte(),categoria:document.getElementById('rep-categoria').value,modulo:document.getElementById('rep-modulo').value,titulo,descricao,prioridade:document.getElementById('rep-prioridade').value,status:'novo',created_at:new Date().toISOString()};
  const locais=reportesLocais();locais.unshift(item);localStorage.setItem(chaveDadosLocais(REPORTES_KEY),JSON.stringify(locais));
  if(_sb&&CURRENT_AUTH_USER_ID){const {error}=await _sb.from('reportes').upsert(item,{onConflict:'id_local'});if(error)console.warn('Relato salvo localmente; sincronização pendente.',error)}
  document.getElementById('rep-titulo').value='';document.getElementById('rep-descricao').value='';
  showToast('Relato enviado. Obrigado por ajudar a melhorar o sistema.');carregarReportes();
}
function cardReporte(r){
  const pode=temPermissao('ver_reportes')||temPermissao('ver_admin'),data=new Date(r.created_at||Date.now()).toLocaleString('pt-BR');
  const seletor=pode?`<select onchange="atualizarStatusReporte('${r.id_local}',this.value)">${['novo','em análise','planejado','resolvido','recusado'].map(s=>`<option ${r.status===s?'selected':''}>${s}</option>`).join('')}</select>`:`<strong>${r.status||'novo'}</strong>`;
  return `<div style="border:1px solid var(--bd);border-radius:8px;padding:12px;margin:8px 0;background:var(--sf2)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><strong>${escTR(r.titulo)}</strong><div style="font-size:11px;color:var(--tx2)">${escTR(r.categoria)} · ${escTR(r.modulo)} · ${escTR(r.prioridade)} · ${escTR(r.autor)} · ${data}</div></div>${seletor}</div><div style="margin-top:8px;white-space:pre-wrap">${escTR(r.descricao)}</div></div>`;
}
async function carregarReportes(){
  const gestao=document.getElementById('reportes-gestao'),lista=document.getElementById('reportes-lista');if(!gestao||!lista)return;
  const pode=temPermissao('ver_reportes')||temPermissao('ver_admin');gestao.style.display='block';
  let dados=reportesLocais();
  if(_sb&&CURRENT_AUTH_USER_ID){const q=await _sb.from('reportes').select('*').order('created_at',{ascending:false});if(!q.error&&q.data){dados=q.data;localStorage.setItem(chaveDadosLocais(REPORTES_KEY),JSON.stringify(dados))}}
  if(!pode)dados=dados.filter(r=>!CURRENT_AUTH_USER_ID||r.user_id===CURRENT_AUTH_USER_ID);
  lista.innerHTML=dados.map(cardReporte).join('')||'<div class="alert alert-i">Nenhum relato registrado.</div>';
}
async function atualizarStatusReporte(id_local,status){
  if(!(temPermissao('ver_reportes')||temPermissao('ver_admin')))return;
  const dados=reportesLocais(),i=dados.findIndex(r=>r.id_local===id_local);if(i>=0){dados[i].status=status;localStorage.setItem(chaveDadosLocais(REPORTES_KEY),JSON.stringify(dados))}
  if(_sb)await _sb.from('reportes').update({status,updated_at:new Date().toISOString()}).eq('id_local',id_local);
  carregarReportes();
}

// ── Novidades exibidas uma vez por versão e disponíveis no menu ─
const APP_RELEASE={versao:'2026.06.11.10',data:'11/06/2026',titulo:'Exames livres e integração clínica',itens:[
  {tipo:'Organização',texto:'As condutas detalhadas da Abertura PN agora aparecem imediatamente abaixo das queixas selecionadas.'},
  {tipo:'Integração',texto:'O histórico vacinal informado na identificação preenche automaticamente os campos de vacinação da área de exame físico.'},
  {tipo:'Novo',texto:'Todas as consultas agora aceitam qualquer laudo em PDF/TXT ou texto colado, utilizando os valores de referência informados pelo próprio laboratório.'},
  {tipo:'Apoio clínico',texto:'Resultados reconhecidos são cruzados com os protocolos cadastrados e as condutas sugeridas entram automaticamente no SOAP.'},
  {tipo:'Correção',texto:'Removida a segunda área concorrente de queixas da Consulta PN; a consulta mantém apenas sua seleção clínica detalhada.'},
  {tipo:'Organização',texto:'As duas áreas repetidas de queixas da Abertura PN foram integradas em uma única seleção rápida da anamnese.'},
  {tipo:'Visual',texto:'As condutas das queixas agora são divididas em blocos de avaliação, orientações, medicações previstas e encaminhamento.'},
  {tipo:'Organização',texto:'A puericultura recebeu uma etapa própria para estratificação de risco e vacinação; o SOAP passou a ser a etapa 6.'},
  {tipo:'Visual',texto:'O histórico vacinal agora aparece em tabela estruturada, com colunas delimitadas, cabeçalho fixo e seções separadas para pendências e registros adequados.'},
  {tipo:'Melhoria clínica',texto:'A Abertura PN agora possui as mesmas queixas frequentes e condutas detalhadas já disponíveis na Consulta PN, integradas automaticamente ao SOAP.'},
  {tipo:'Novo',texto:'Todas as consultas receberam uma área para colar e interpretar o histórico vacinal conforme idade e calendário vigente do PNI.'},
  {tipo:'Novo',texto:'O histórico é organizado por vacina, dose, data aplicada, próxima data ou condição, profissional e unidade.'},
  {tipo:'Correção',texto:'Vacina materna contra VSR atualizada para indicação a partir da 28ª semana gestacional; dTpa permanece a partir da 20ª semana.'},
  {tipo:'Melhoria clínica',texto:'A Consulta PN agora apresenta condutas detalhadas do protocolo municipal para ITU e demais queixas frequentes da gestação.'},
  {tipo:'Puericultura',texto:'A estratificação CIB-PR identifica automaticamente critérios presentes nos dados de nascimento, triagens e desenvolvimento e inclui o resultado no SOAP.'},
  {tipo:'Adicionado',texto:'Conduta detalhada para náuseas e vômitos conforme Protocolo Pré-Natal Toledo.'},
  {tipo:'Adicionado',texto:'Orientação de movimentos fetais e mobilograma sem atrasar encaminhamentos urgentes.'},
  {tipo:'Adicionado',texto:'Avaliação vacinal por IG e histórico: dT, dTpa, hepatite B e VSR materna.'},
  {tipo:'Corrigido',texto:'O site não fica mais preso carregando quando a rede bloqueia serviços externos.'},
  {tipo:'Adicionado',texto:'Diagnóstico de conexão na tela de login com a lista de endereços para liberação pela TI.'},
  {tipo:'Adicionado',texto:'Perímetros abdominal e torácico na puericultura, integrados ao SOAP.'},
  {tipo:'Corrigido',texto:'Apelido, nacionalidade e ponto de referência separados nos quadrinhos da Ficha Rosa.'},
  {tipo:'Corrigido',texto:'Data reposicionada no documento de estratificação de saúde mental.'}
]};
// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  let menuRecolhido=false;
  try{menuRecolhido=localStorage.getItem('esf_sidebar_recolhida')==='1'}catch(e){}
  alternarMenuLateral(window.innerWidth<=760||menuRecolhido);
  atualizarResumoDashboard();
  setInterval(atualizarResumoDashboard,1000);
});
window.addEventListener('online',agendarSincronizacao);

// Re-render histórico quando abre a página
document.querySelectorAll('[onclick*="go("]').forEach(btn => {
  const orig = btn.getAttribute('onclick');
  if (orig && orig.includes("'historico'")) {
    btn.addEventListener('click', () => setTimeout(renderHistorico, 200));
  }
});
