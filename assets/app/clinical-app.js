// ── SINAN — NOTIFICAÇÃO INDIVIDUAL ─────────────────────────────
const SINAN_RASCUNHO_KEY='esf_sinan_rascunho_v1';
const SINAN_FICHAS_TOLEDO_URL='https://www.toledo.pr.gov.br/portais/saude/vigilancia-em-saude/sinan/fichas-de-notificacao';
const SINAN_FICHAS_BASE='https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2024-07/';
const SINAN_FICHAS_INTEGRADAS_IDS=['ac-animal','ac-trabalho','material-biologico','aids-adulto','aids-crianca','antirrabico','coqueluche','crianca-hiv','difteria','febre-amarela','febre-maculosa','gestante-hiv','hantavirose','hepatites','sifilis-adquirida','sifilis-gestante','toxoplasmose-adquirida'];
const SINAN_FICHAS_CATALOGO=[
  ['ac-animal','Acidente por animal peçonhento','ficha_notificacao_ac_animal_peconhento.pdf','Zoonoses / acidentes',false],
  ['ac-trabalho','Acidente de trabalho','ficha_notificacao_acidente_de_trabalho.pdf','Saúde do trabalhador',false],
  ['material-biologico','Acidente com material biológico','ficha_notificacao_acidente_material_biologico.pdf','Saúde do trabalhador',false],
  ['aids-adulto','AIDS adulto','ficha_notificacao_aids_adulto.pdf','IST / HIV',false],
  ['aids-crianca','AIDS criança','ficha_notificacao_aids_crianca.pdf','IST / HIV',false],
  ['antirrabico','Atendimento antirrábico humano','ficha_notificacao_atendimento_antirrabico_humano.pdf','Zoonoses / acidentes',false],
  ['botulismo','Botulismo','ficha_notificacao_botulismo.pdf','Transmissão alimentar / toxinas',false],
  ['cancer-trabalho','Câncer relacionado ao trabalho','ficha_notificacao_cancer_relacionado_ao_trabalho.pdf','Saúde do trabalhador',false],
  ['caxumba','Caxumba','ficha_notificacao_caxumba.pdf','Exantemáticas / imunopreveníveis',false],
  ['chagas-aguda','Doença de Chagas aguda','ficha_notificacao_chagas_aguda.pdf','Vetoriais / zoonoses',false],
  ['chagas-cronica','Doença de Chagas crônica','ficha_notificacao_chagas_cronica.pdf','Vetoriais / zoonoses',false],
  ['colera','Cólera','ficha_notificacao_colera.pdf','Transmissão alimentar / hídrica',false],
  ['coqueluche','Coqueluche','ficha_notificacao_coqueluche.pdf','Respiratórias / imunopreveníveis',false],
  ['crianca-hiv','Criança exposta ao HIV','ficha_notificacao_crianca_exposta_hiv.pdf','IST / HIV',false],
  ['dengue-chik','Dengue / Chikungunya','ficha_notificacao_dengue_chikungunya.pdf','Arboviroses','sinan-online'],
  ['dermatose-trabalho','Dermatoses ocupacionais','ficha_notificacao_dermatoses_ocupacionais.pdf','Saúde do trabalhador',false],
  ['difteria','Difteria','ficha_notificacao_difteria.pdf','Respiratórias / imunopreveníveis',false],
  ['dta','Doenças transmitidas por alimento','ficha_notificacao_doencas_transmitidas_por_alimento.pdf','Transmissão alimentar / hídrica',false],
  ['epizootia','Epizootia','ficha_notificacao_epizootia.pdf','Zoonoses / vigilância animal',false],
  ['esavi','ESAVI','ficha-de-notificacao-esavi.pdf','Vacinação / evento adverso',false],
  ['esquistossomose','Esquistossomose','ficha_notificacao_esquistossomose.pdf','Parasitárias',false],
  ['febre-amarela','Febre amarela','ficha_notificacao_febre_amarela.pdf','Arboviroses / imunopreveníveis',false],
  ['febre-nilo','Febre do Nilo','ficha_notificacao_febre_do_nilo.pdf','Arboviroses',false],
  ['febre-maculosa','Febre maculosa','ficha_notificacao_febre_maculosa.pdf','Zoonoses / vetoriais',false],
  ['febre-tifoide','Febre tifóide','ficha_notificacao_febre_tifoide.pdf','Transmissão alimentar / hídrica',false],
  ['gestante-hiv','Gestante HIV','ficha_notificacao_gestante_hiv.pdf','IST / HIV / gestação',false],
  ['hanseniase','Hanseníase','ficha_notificacao_hanseniase.pdf','Condições crônicas transmissíveis',false],
  ['hantavirose','Hantavirose','ficha_notificacao_hantavirose.pdf','Zoonoses',false],
  ['hepatites','Hepatites virais','ficha_notificacao_hepatites_virais.pdf','IST / hepatites',false],
  ['intoxicacao','Intoxicação exógena','ficha_notificacao_intoxicacao_exogena.pdf','Toxicologia',false],
  ['lta','Leishmaniose tegumentar','ficha_notificacao_leishmaniose_tegumentar.pdf','Vetoriais / zoonoses',false],
  ['lv','Leishmaniose visceral','ficha_notificacao_leishmaniose_visceral.pdf','Vetoriais / zoonoses',false],
  ['leptospirose','Leptospirose','ficha_notificacao_leptospirose.pdf','Zoonoses',false],
  ['ler-dort','LER/DORT','ficha_notificacao_ler_dort.pdf','Saúde do trabalhador',false],
  ['malaria','Malária','ficha_notificacao_malaria.pdf','Vetoriais',false],
  ['meningite','Meningite','ficha_notificacao_meningite.pdf','Neurológicas / infecciosas',false],
  ['mini-saia','Mini saia','ficha_notificacao_mini_saia.pdf','Vigilância',false],
  ['mpox','MPOX','ficha_notificacao_monkeypox.pdf','e-SUS SINAN', 'esus-sinan'],
  ['pfa','Paralisia flácida aguda / poliomielite','ficha_notificacao_paralisia_flacida_aguda_poliomielite.pdf','Neurológicas / imunopreveníveis',false],
  ['pneumoconiose','Pneumoconioses','ficha_notificacao_peneumoconioses.pdf','Saúde do trabalhador',false],
  ['pair','Perda auditiva induzida por ruído','ficha_notificacao_perda_auditiva_induzida_por_ruido.pdf','Saúde do trabalhador',false],
  ['peste','Peste','ficha_notificacao_peste.pdf','Zoonoses',false],
  ['raiva','Raiva humana','ficha_notificacao_raiva_humana.pdf','Zoonoses',false],
  ['rotavirus','Rotavírus','ficha_notificacao_rotavirus.pdf','Diarreicas / imunopreveníveis',false],
  ['sarampo-rubeola','Sarampo / Rubéola','ficha_notificacao_sarampo_rubeola.pdf','Exantemáticas / imunopreveníveis',false],
  ['sifilis-adquirida','Sífilis adquirida','ficha_notificacao_sifilis_adquirida.pdf','IST / sífilis',false],
  ['sifilis-congenita','Sífilis congênita','ficha_notificacao_sifilis_congenita.pdf','IST / sífilis',false],
  ['sifilis-gestante','Sífilis em gestante','ficha_notificacao_sifilis_em_gestante.pdf','IST / sífilis / gestação',false],
  ['src','Síndrome da rubéola congênita','ficha_notificacao_sindrome_da_rubeola_congenita.pdf','Exantemáticas / gestação',false],
  ['corrimento-uretral','Síndrome do corrimento uretral masculino sentinela','ficha_notificacao_sindrome_do_corrimento_uretral_masculino_sentinela.pdf','IST / sentinela',false],
  ['srag','SRAG','ficha_notificacao_srag.pdf','Respiratórias',false],
  ['surto','Surto','ficha_notificacao_surto.pdf','Surto',false],
  ['tetano-acidental','Tétano acidental','ficha_notificacao_tetano_acidental.pdf','Imunopreveníveis',false],
  ['tetano-neonatal','Tétano neonatal','ficha_notificacao_tetano_neonatal.pdf','Imunopreveníveis / neonatal',false],
  ['toxoplasmose-adquirida','Toxoplasmose adquirida','ficha_notificacao_toxoplasmose_adquirida.pdf','Toxoplasmose',false],
  ['toxoplasmose-congenita','Toxoplasmose congênita','ficha_notificacao_toxoplasmose_congenita.pdf','Toxoplasmose',false],
  ['toxoplasmose-gestacional','Toxoplasmose gestacional','ficha_notificacao_toxoplasmose_gestacional.pdf','Toxoplasmose / gestação',false],
  ['mental-trabalho','Transtornos mentais relacionados ao trabalho','ficha_notificacao_transtornos_mentais_relacionados_ao_trabalho.pdf','Saúde do trabalhador',false],
  ['tuberculose','Tuberculose','ficha_notificacao_tuberculose.pdf','Condições crônicas transmissíveis',false],
  ['varicela','Varicela','ficha_notificacao_varicela.pdf','Exantemáticas / imunopreveníveis',false],
  ['violencia','Violência interpessoal / autoprovocada','ficha_notificacao_violencia_interpessoal_autoprovocada.pdf','Violência / proteção',false],
  ['zika','Zika','ficha_notificacao_zika.pdf','Arboviroses',false],
  ['planilha-surto','Planilha de surto','planilha_surto.pdf','Surto',false]
].map(([id,nome,arquivo,categoria,calibrada])=>({id,nome,arquivo,categoria,calibrada,url:SINAN_FICHAS_BASE+arquivo})).filter(f=>SINAN_FICHAS_INTEGRADAS_IDS.includes(f.id));
function sinanEl(id){return document.getElementById(id)}
function sinanVal(id){return sinanEl(id)?.value?.trim()||''}
function sinanSet(id,v){const el=sinanEl(id);if(el&&v!==undefined&&v!==null)el.value=v}
function sinanSomenteNumeros(v){return String(v||'').replace(/\D/g,'')}
function sinanData(v){if(!v)return'';const p=v.split('-');return p.length===3?p[2]+p[1]+p[0]:sinanSomenteNumeros(v)}
function sinanSeguro(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').toUpperCase()}
function sinanNormalizar(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function sinanFichaPorId(id){return SINAN_FICHAS_CATALOGO.find(f=>f.id===id)||null}
function sinanFichaAtual(){
  const sel=sinanEl('sinan-ficha-modelo')?.value;
  if(sel)return sinanFichaPorId(sel);
  const q=sinanNormalizar(sinanVal('sinan-agravo'));
  if(!q)return null;
  return SINAN_FICHAS_CATALOGO.find(f=>sinanNormalizar(f.nome)===q)||SINAN_FICHAS_CATALOGO.find(f=>sinanNormalizar(f.nome).includes(q)||q.includes(sinanNormalizar(f.nome)))||null;
}
function sinanMontarCatalogoFichas(){
  const sel=sinanEl('sinan-ficha-modelo'),dl=sinanEl('sinan-agravos');
  if(sel)sel.innerHTML='<option value="">Selecione a ficha oficial...</option>'+SINAN_FICHAS_CATALOGO.map(f=>`<option value="${f.id}">${escTR(f.nome)} — ${escTR(f.categoria)}</option>`).join('');
  if(dl)dl.innerHTML=SINAN_FICHAS_CATALOGO.map(f=>`<option value="${escTR(f.nome)}"></option>`).join('');
}
function sinanSincronizarAgravo(){
  const f=sinanFichaAtual(),sel=sinanEl('sinan-ficha-modelo');
  if(f&&sel&&sel.value!==f.id)sel.value=f.id;
  sinanRenderFichaSelecionada();
}
function sinanAplicarFichaSelecionada(){
  const f=sinanFichaAtual();
  if(f)sinanSet('sinan-agravo',f.nome);
  sinanRenderFichaSelecionada();
}
function sinanOrientacaoFicha(f){
  if(!f)return {classe:'alert-i',titulo:'Selecione uma ficha',texto:'Escolha o agravo para o sistema indicar o modelo oficial correto.'};
  if(f.id==='dengue-chik')return {classe:'alert-w',titulo:'Dengue/Chikungunya — SINAN Online',texto:'A Prefeitura orienta registro no SINAN Online. O sistema ainda assim gera a ficha preenchida para apoio físico/local quando necessário.'};
  if(f.calibrada==='esus-sinan')return {classe:'alert-w',titulo:`${f.nome} — e-SUS SINAN`,texto:'A Prefeitura orienta registro no e-SUS SINAN. O sistema ainda assim organiza os dados e gera a ficha preenchida para apoio local quando houver modelo em PDF.'};
  if(f.calibrada===true)return {classe:'alert-s',titulo:'Ficha calibrada',texto:'Esta ficha possui sobreimpressão calibrada no sistema.'};
  return {classe:'alert-i',titulo:'Ficha específica por agravo',texto:'Este agravo possui modelo próprio. O sistema vai gerar o PDF específico preenchido com os dados disponíveis e manter os campos específicos no próprio documento/folha complementar quando ainda não houver coordenada fina calibrada.'};
}
function sinanCamposEspecificosSugeridos(f){
  const n=sinanNormalizar([f?.nome,f?.categoria].join(' '));
  if(/violencia/.test(n))return ['Tipo de violência','Local de ocorrência','Autor provável','Recorrência','Encaminhamentos/rede de proteção','Notificação obrigatória e sigilo'];
  if(/trabalho|ocupacional|ler dort|pneumoconiose|auditiva|cancer/.test(n))return ['Ocupação/CBO','Empresa/empregador','Local do acidente/exposição','Data e hora do acidente','CAT emitida','EPI utilizado','Evolução/afastamento'];
  if(/sifilis|hiv|aids|hepatite|corrimento|ist/.test(n))return ['Resultado dos testes','Estágio/classificação clínica','Gestante/parceiro/RN quando aplicável','Tratamento realizado','Parcerias sexuais','Notificação e seguimento'];
  if(/toxoplasmose|gestante|congenita|neonatal|crianca exposta/.test(n))return ['Idade gestacional/idade da criança','Exames maternos e/ou RN','Tratamento/seguimento','Vínculo pré-natal/maternidade','Resultado confirmatório'];
  if(/animal|antirrabico|raiva|peconhento|epizootia/.test(n))return ['Espécie/animal envolvido','Animal localizado/observação','Local e gravidade da lesão','Vacina/soro indicados','Local provável do acidente','Conduta de vigilância'];
  if(/dengue|chik|zika|febre|malaria|leish|chagas|hanta|lepto|maculosa|oropouche|arbovirose|vetoriais/.test(n))return ['Sinais e sintomas','Data de início','Viagem/local provável','Exames/coleta','Hospitalização','Classificação final'];
  if(/meningite|srag|coqueluche|difteria|sarampo|rubeola|varicela|caxumba|rotavirus|tetano/.test(n))return ['Sintomas principais','Vacinação prévia','Contato com caso semelhante','Coleta/exames','Hospitalização','Bloqueio/medidas de controle'];
  if(/intoxicacao|botulismo|alimento|colera|tifoide/.test(n))return ['Agente/alimento/produto suspeito','Data/hora da exposição','Via de exposição','Sintomas','Local provável','Coleta/amostras'];
  return ['Resumo clínico','Critério de suspeição/confirmação','Exames coletados','Tratamento/conduta já realizada','Local provável de infecção/exposição','Encaminhamento/vigilância'];
}
const SINAN_SIM_NAO_IGN=[['','—'],['1','1 — Sim'],['2','2 — Não'],['9','9 — Ignorado']];
const SINAN_RESULTADO_EXAME=[['','—'],['1','1 — Reagente'],['2','2 — Não reagente'],['3','3 — Não realizado'],['9','9 — Ignorado']];
const SINAN_FICHA_CAMPOS_ESPECIFICOS={
  'sifilis-gestante':[
    ['ocupacao','31. Ocupação','text'],['uf-pre-natal','32. UF do pré-natal','text'],
    ['municipio-pre-natal','33. Município do pré-natal','text'],['municipio-pre-natal-cod','33. Código IBGE do pré-natal','text'],
    ['unidade-pre-natal','34. Unidade do pré-natal','text'],['unidade-pre-natal-cod','34. Código da unidade','text'],['sisprenatal','35. Número SISPRENATAL','text'],
    ['classificacao-clinica','36. Classificação clínica','select',[['','—'],['1','Primária'],['2','Secundária'],['3','Terciária'],['4','Latente'],['9','Ignorado']]],
    ['teste-nao-treponemico','37. Teste não treponêmico no pré-natal','select',SINAN_RESULTADO_EXAME],['titulo-vdrl','38. Título','text'],['data-teste-nao-treponemico','39. Data do exame','date'],
    ['teste-treponemico','40. Teste treponêmico no pré-natal','select',SINAN_RESULTADO_EXAME],
    ['esquema-tratamento','41. Tratamento prescrito à gestante (registrar, não é sugestão de prescrição)','select',[['','—'],['1','Penicilina G benzatina 2.400.000 UI'],['2','Penicilina G benzatina 4.800.000 UI'],['3','Penicilina G benzatina 7.200.000 UI'],['4','Outro esquema'],['5','Não realizado'],['9','Ignorado']]],
    ['parceiro-tratado','42. Parceiro tratado concomitantemente','select',SINAN_SIM_NAO_IGN],
    ['esquema-parceiro','43. Tratamento prescrito ao parceiro (registro)','select',[['','—'],['1','Penicilina G benzatina 2.400.000 UI'],['2','Penicilina G benzatina 4.800.000 UI'],['3','Penicilina G benzatina 7.200.000 UI'],['4','Outro esquema'],['5','Não realizado'],['9','Ignorado']]],
    ['motivo-nao-tratamento','44. Motivo de não tratamento do parceiro','select',[['','— / não se aplica'],['1','Não teve mais contato'],['2','Não foi comunicado/convocado'],['3','Convocado, não compareceu'],['4','Recusou tratamento'],['5','Sorologia não reagente'],['6','Outro motivo']]],['outro-motivo','44. Outro motivo — detalhar','text']
  ],
  'sifilis-adquirida':[
    ['ocupacao','31. Ocupação','text'],
    ['antecedente-sifilis','32. Antecedente de sífilis','select',SINAN_SIM_NAO_IGN],
    ['tratamento-anterior','33. Se sim, o tratamento foi realizado?','select',SINAN_SIM_NAO_IGN],
    ['comportamento-sexual','34. Comportamento sexual','select',[['','—'],['1','1 — Relações sexuais com homens'],['2','2 — Relações sexuais com mulheres'],['3','3 — Relações sexuais com homens e mulheres'],['9','9 — Ignorado']]],
    ['teste-nao-treponemico','35. Teste não treponêmico','select',SINAN_RESULTADO_EXAME],
    ['titulo-vdrl','36. Título do VDRL/RPR','text'],
    ['data-teste-nao-treponemico','37. Data da coleta do teste não treponêmico','date'],
    ['teste-treponemico','38. Teste treponêmico','select',SINAN_RESULTADO_EXAME],
    ['classificacao-clinica','39. Classificação clínica','select',[['','—'],['1','1 — Primária'],['2','2 — Secundária'],['3','3 — Terciária'],['4','4 — Latente'],['9','9 — Ignorado']]],
    ['esquema-tratamento','40. Esquema de tratamento realizado','select',[['','—'],['1','1 — Penicilina G benzatina 2.400.000 UI'],['2','2 — Penicilina G benzatina 4.800.000 UI'],['3','3 — Penicilina G benzatina 7.200.000 UI'],['4','4 — Outro esquema'],['5','5 — Não realizado'],['9','9 — Ignorado']]],
    ['data-inicio-tratamento','41. Data do início do tratamento','date'],
    ['classificacao-final','42. Classificação final do caso','select',[['','—'],['1','1 — Confirmado'],['2','2 — Descartado']]],
    ['observacoes','Observações adicionais','textarea']
  ],
  'hepatites':[
    ['ocupacao','Ocupação','text'],['gestante-semanas','Gestante - semanas de gestação','text'],['vacina-hepatite-b','Vacina contra hepatite B','select',SINAN_SIM_NAO_IGN],['exposicao-provavel','Provável fonte/mecanismo de infecção','textarea'],['suspeita-tipo','Suspeita/tipo de hepatite','select',[['','—'],['A','Hepatite A'],['B','Hepatite B'],['C','Hepatite C'],['D','Hepatite D'],['E','Hepatite E'],['9','Ignorado']]],['marcadores','Marcadores laboratoriais registrados','textarea'],['classificacao-final','Classificação final','select',[['','—'],['1','Confirmado'],['2','Descartado'],['3','Inconclusivo']]],['evolucao','Evolução do caso','textarea']],
  'gestante-hiv':[
    ['ig-diagnostico','Idade gestacional no diagnóstico','text'],['data-diagnostico-hiv','Data do diagnóstico HIV','date'],['uso-arv','Uso de antirretroviral no pré-natal','select',SINAN_SIM_NAO_IGN],['inicio-arv','Data de início do ARV','date'],['carga-viral','Carga viral / data','text'],['cd4','CD4 / data','text'],['parceiro-testado','Parceiro testado/orientado','select',SINAN_SIM_NAO_IGN],['maternidade','Maternidade de referência','text'],['observacoes','Observações e seguimento','textarea']],
  'crianca-hiv':[
    ['nome-mae','Nome da mãe/gestante HIV','text'],['data-parto','Data do parto','date'],['tipo-parto','Tipo de parto','select',[['','—'],['1','Vaginal'],['2','Cesárea'],['9','Ignorado']]],['arv-rn','ARV para RN','select',SINAN_SIM_NAO_IGN],['aleitamento','Aleitamento materno','select',SINAN_SIM_NAO_IGN],['exames-rn','Exames da criança / datas','textarea'],['seguimento','Seguimento pactuado','textarea']],
  'aids-adulto':[
    ['ocupacao','Ocupação','text'],['criterio-definicao','Critério de definição do caso','textarea'],['exames-hiv','Exames HIV / carga viral / CD4','textarea'],['provavel-transmissao','Provável modo de transmissão','textarea'],['tratamento-arv','Tratamento ARV em uso/iniciado','textarea'],['evolucao','Evolução do caso','textarea']],
  'aids-crianca':[
    ['nome-mae','Nome da mãe','text'],['exposicao-vertical','Exposição vertical conhecida','select',SINAN_SIM_NAO_IGN],['criterio-definicao','Critério de definição do caso','textarea'],['exames','Exames laboratoriais','textarea'],['tratamento-arv','Tratamento ARV','textarea'],['evolucao','Evolução do caso','textarea']],
  'coqueluche':[
    ['tosse-data','Data de início da tosse','date'],['tosse-paroxistica','Tosse paroxística','select',SINAN_SIM_NAO_IGN],['guincho','Guincho inspiratório','select',SINAN_SIM_NAO_IGN],['vomito-pos-tosse','Vômito pós-tosse','select',SINAN_SIM_NAO_IGN],['vacina-dtp','Vacinação DTP/dTpa e doses','textarea'],['coleta','Coleta/exame laboratorial','textarea'],['contatos','Contatos e bloqueio','textarea'],['classificacao-final','Classificação final','select',[['','—'],['1','Confirmado'],['2','Descartado'],['3','Inconclusivo']]]],
  'difteria':[
    ['inicio-sintomas','Data de início dos sintomas respiratórios','date'],['pseudomembrana','Presença de pseudomembrana','select',SINAN_SIM_NAO_IGN],['localizacao','Localização/forma clínica','textarea'],['vacina','Vacinação contra difteria','textarea'],['coleta','Coleta/cultura','textarea'],['soro','Soro antidiftérico/conduta','textarea'],['contatos','Contatos e bloqueio','textarea']],
  'febre-amarela':[
    ['vacina-fa','Vacina febre amarela','select',SINAN_SIM_NAO_IGN],['data-vacina-fa','Data da última dose','date'],['ictericia','Icterícia','select',SINAN_SIM_NAO_IGN],['hemorragia','Hemorragia','select',SINAN_SIM_NAO_IGN],['viagem-area','Viagem/local provável de infecção','textarea'],['exames','Exames e coleta','textarea'],['hospitalizacao','Hospitalização/evolução','textarea']],
  'febre-maculosa':[
    ['carrapato','Contato com carrapato','select',SINAN_SIM_NAO_IGN],['exantema','Exantema','select',SINAN_SIM_NAO_IGN],['febre','Febre','select',SINAN_SIM_NAO_IGN],['local-provavel','Local provável de infecção','textarea'],['animais','Contato com animais/ambiente rural','textarea'],['exames','Exames/coleta','textarea'],['tratamento','Tratamento instituído','textarea']],
  'hantavirose':[
    ['exposicao-roedores','Exposição a roedores/ambiente de risco','select',SINAN_SIM_NAO_IGN],['dispneia','Dispneia/sintomas respiratórios','select',SINAN_SIM_NAO_IGN],['choque','Choque/gravidade','select',SINAN_SIM_NAO_IGN],['local-provavel','Local provável de infecção','textarea'],['exames','Exames/coleta','textarea'],['hospitalizacao','Hospitalização/evolução','textarea']],
  'toxoplasmose-adquirida':[
    ['gestante','Gestante','select',SINAN_SIM_NAO_IGN],['ig','Idade gestacional, se gestante','text'],['linfonodos','Linfadenopatia','select',SINAN_SIM_NAO_IGN],['ocular','Manifestação ocular','select',SINAN_SIM_NAO_IGN],['exames','IgM/IgG/avidez e outros exames','textarea'],['tratamento','Tratamento/seguimento','textarea'],['local-provavel','Fonte/local provável de exposição','textarea']],
  'antirrabico':[
    ['data-acidente','Data do acidente/exposição','date'],['animal','Espécie do animal agressor','text'],['animal-observavel','Animal passível de observação','select',SINAN_SIM_NAO_IGN],['tipo-exposicao','Tipo/local da exposição','textarea'],['ferimento','Característica do ferimento','textarea'],['vacina-soro','Vacina/soro indicados ou realizados','textarea'],['conduta-animal','Conduta com o animal','textarea']],
  'ac-animal':[
    ['data-acidente','Data do acidente','date'],['hora-acidente','Hora do acidente','time'],['animal','Animal peçonhento provável','select',[['','—'],['1','Serpente'],['2','Aranha'],['3','Escorpião'],['4','Lagarta'],['5','Abelha'],['6','Outro'],['9','Ignorado']]],['local-picada','Local da picada/lesão','text'],['manifestacoes','Manifestações locais/sistêmicas','textarea'],['tempo-atendimento','Tempo até atendimento','text'],['soroterapia','Soroterapia realizada','textarea'],['classificacao','Classificação do acidente','select',[['','—'],['1','Leve'],['2','Moderado'],['3','Grave'],['9','Ignorado']]],['evolucao','Evolução','textarea']],
  'ac-trabalho':[
    ['data-acidente','Data do acidente','date'],['hora-acidente','Hora do acidente','time'],['ocupacao','Ocupação/CBO','text'],['empresa','Empresa/empregador','text'],['local-acidente','Local do acidente','textarea'],['tipo-acidente','Tipo de acidente','textarea'],['parte-corpo','Parte do corpo atingida','text'],['cat','CAT emitida','select',SINAN_SIM_NAO_IGN],['evolucao','Evolução/afastamento','textarea']],
  'material-biologico':[
    ['data-acidente','Data do acidente','date'],['hora-acidente','Hora do acidente','time'],['ocupacao','Ocupação/CBO','text'],['material','Material biológico envolvido','text'],['tipo-exposicao','Tipo de exposição','textarea'],['fluido','Fluido/material fonte','text'],['uso-epi','EPI utilizado','textarea'],['paciente-fonte','Paciente fonte conhecido/exames','textarea'],['profilaxia','Profilaxia/seguimento','textarea']]
};
function sinanCampoEspecificoHtml(f,campo){
  const [id,label,tipo,opts]=campo,domId=`sinan-esp-${f.id}-${id}`,base=`class="sinan-esp-field" data-sinan-label="${escTR(label)}" data-sinan-ficha="${f.id}"`;
  if(tipo==='textarea')return `<div class="f span3"><label>${escTR(label)}</label><textarea id="${domId}" ${base}></textarea></div>`;
  if(tipo==='select')return `<div class="f"><label>${escTR(label)}</label><select id="${domId}" ${base}>${(opts||[['','—']]).map(o=>Array.isArray(o)?`<option value="${escTR(o[0])}">${escTR(o[1])}</option>`:`<option>${escTR(o)}</option>`).join('')}</select></div>`;
  return `<div class="f"><label>${escTR(label)}</label><input id="${domId}" type="${tipo==='date'?'date':tipo==='time'?'time':'text'}" ${base}></div>`;
}
function sinanRenderCamposEspecificos(f){
  const alvo=sinanEl('sinan-campos-especificos');if(!alvo)return;
  if(!f){alvo.innerHTML='<div class="f span3"><label>Selecione uma ficha</label><textarea placeholder="Escolha o agravo na primeira aba para abrir as perguntas oficiais da ficha."></textarea></div>';return}
  if(alvo.dataset.fichaAtual===f.id&&alvo.querySelector('input,textarea,select'))return;
  alvo.dataset.fichaAtual=f.id;
  const campos=SINAN_FICHA_CAMPOS_ESPECIFICOS[f.id]||[];
  alvo.innerHTML=[
    `<div class="f span3"><label for="sinan-esp-resumo">Resumo clínico / suspeita que motivou a notificação</label><textarea id="sinan-esp-resumo" placeholder="Ex.: sinais, sintomas, exposição, resultado de teste, vínculo epidemiológico..."></textarea></div>`,
    `<div class="f"><label>Data da investigação</label><input type="date" id="sinan-esp-data-investigacao"></div>`,
    `<div class="f"><label for="sinan-esp-classificacao">Classificação inicial</label><select id="sinan-esp-classificacao"><option value="">—</option><option>Suspeito</option><option>Confirmado</option><option>Descartado</option><option>Em investigação</option></select></div>`,
    `<div class="f"><label for="sinan-esp-local-provavel">Local provável de infecção/exposição</label><input id="sinan-esp-local-provavel"></div>`,
    campos.length?`<div class="f span3"><label>Perguntas oficiais desta ficha</label><div class="alert alert-i"><div>Preencha os campos que aparecem na ficha selecionada. Campos vazios serão avisados na conferência, mas não bloqueiam a geração.</div></div></div>`:'',
    ...campos.map(c=>sinanCampoEspecificoHtml(f,c)),
    `<div class="f span3"><label for="sinan-esp-campos">Outros campos/observações da ficha</label><textarea id="sinan-esp-campos" placeholder="Use se houver detalhe adicional que não esteja nos campos acima."></textarea></div>`
  ].filter(Boolean).join('');
  sinanAutoPreencherCamposEspecificos(f);
}
function sinanValoresCamposEspecificos(){
  return Array.from(document.querySelectorAll('#sinan-campos-especificos .sinan-esp-field')).map(el=>({id:el.id,label:el.dataset.sinanLabel||el.id,value:String(el.value||'').trim(),ficha:el.dataset.sinanFicha||''})).filter(x=>x.value);
}
function sinanAutoPreencherCamposEspecificos(f){
  // Datas e resultados exigem registro explícito. Rótulos da página não são exames.
}
function sinanRenderFichaSelecionada(){
  const f=sinanFichaAtual(),status=sinanEl('sinan-ficha-status'),painel=sinanEl('sinan-ficha-especifica-painel'),campos=sinanEl('sinan-esp-campos');
  const o=sinanOrientacaoFicha(f);
  const html=`<div class="alert ${o.classe}"><div><strong>${escTR(o.titulo)}:</strong> ${escTR(o.texto)}${f?`<br><small>Modelo selecionado: ${escTR(f.nome)} · Fonte interna: catálogo oficial da Prefeitura de Toledo/Vigilância em Saúde</small>`:''}</div></div>`;
  if(status)status.innerHTML=html;
  if(painel) painel.innerHTML=html+(f?`<div class="vac-table-wrap" style="margin-top:10px"><table class="vac-table"><thead><tr><th>Campo específico esperado</th><th>Uso no sistema</th></tr></thead><tbody>${sinanCamposEspecificosSugeridos(f).map(c=>`<tr><td>${escTR(c)}</td><td>Registrar no campo específico e transcrever para a ficha oficial até calibrarmos este modelo.</td></tr>`).join('')}</tbody></table></div>`:'');
  if(campos&&!campos.value&&f)campos.placeholder='Campos esperados para '+f.nome+': '+sinanCamposEspecificosSugeridos(f).join('; ')+'.';
  sinanRenderCamposEspecificos(f);
}
function sinanGerarChecklistEspecifica(){
  const f=sinanFichaAtual(),out=sinanEl('sinan-checklist-especifica');
  if(!out)return;
  if(!f){out.innerHTML='<div class="alert alert-w"><div>Selecione uma ficha oficial primeiro.</div></div>';return}
  const campos=sinanCamposEspecificosSugeridos(f),gerais=['Tipo de notificação','Agravo/doença','Data da notificação','Município/UF','Unidade notificadora','Primeiros sintomas','Nome','Nascimento/idade','Sexo','Gestante','Raça/cor','Escolaridade','CNS','Nome da mãe','Endereço/telefone','Notificante'];
  out.innerHTML=`<div class="alert alert-i"><div><strong>Checklist para ${escTR(f.nome)}</strong><br>Use este roteiro para garantir que os dados necessários ao modelo específico estejam no sistema antes de gerar.</div></div><div class="vac-table-wrap"><table class="vac-table"><thead><tr><th>Bloco</th><th>Itens</th></tr></thead><tbody><tr><td>Dados gerais</td><td>${gerais.map(escTR).join(' · ')}</td></tr><tr><td>Campos específicos</td><td>${campos.map(escTR).join(' · ')}</td></tr><tr><td>Modelo selecionado</td><td>${escTR(f.nome)}</td></tr></tbody></table></div>`;
}
function sinanCampos(){
  const d={};document.querySelectorAll('#pg-sinan input[id],#pg-sinan select[id],#pg-sinan textarea[id]').forEach(el=>{if(el.type!=='file')d[el.id]=el.value});return d;
}
function sinanPreencher(d){Object.entries(d||{}).forEach(([id,v])=>sinanSet(id,v))}
function sinanAtualizarIdade(){
  const n=sinanVal('sinan-nasc');if(!n)return;const idade=calcAgeDetail(n);if(!idade)return;
  if(idade.y>0){sinanSet('sinan-idade',idade.y);sinanSet('sinan-idade-unidade','4')}
  else if(idade.totalM>0){sinanSet('sinan-idade',idade.totalM);sinanSet('sinan-idade-unidade','3')}
  else{sinanSet('sinan-idade',idade.dias);sinanSet('sinan-idade-unidade','2')}
}
function sinanValidar(mostrar=false){
  const gestante=sinanFichaAtual()?.id==='sifilis-gestante';
  const faltam=Array.from(document.querySelectorAll('#pg-sinan .sinan-obrigatorio')).filter(el=>!(gestante&&el.id==='sinan-primeiros-sintomas')&&!el.value?.trim());
  if(gestante&&!sinanVal('sinan-data-diagnostico'))faltam.push(sinanEl('sinan-data-diagnostico'));
  if(gestante&&!['1','2','3','4','9'].includes(sinanVal('sinan-gestante')))faltam.push(sinanEl('sinan-gestante'));
  const f=sinanFichaAtual(),especificosVazios=f?Array.from(document.querySelectorAll('#sinan-campos-especificos .sinan-esp-field')).filter(el=>!String(el.value||'').trim()).map(el=>el.dataset.sinanLabel||el.id).slice(0,12):[];
  document.querySelectorAll('#pg-sinan .sinan-obrigatorio').forEach(el=>el.style.borderColor=el.value?.trim()?'':'#cf3f5b');
  const out=sinanEl('sinan-validacao');
  if(out){
    if(!faltam.length&&especificosVazios.length){out.className='alert alert-w';out.innerHTML='<div><strong>Geração liberada:</strong> obrigatórios preenchidos. Campos específicos ainda sem resposta: '+especificosVazios.map(escTR).join(' · ')+(especificosVazios.length>=12?'...':'')+'</div>'}
    else if(!faltam.length){out.className='alert alert-s';out.innerHTML='<div><strong>Ficha conferida:</strong> todos os campos obrigatórios estão preenchidos.</div>'}
    else{out.className='alert alert-e';out.innerHTML='<div><strong>Complete antes de gerar:</strong> '+faltam.map(el=>el.dataset.label||el.id).join(' · ')+'</div>'}
  }
  if(mostrar&&faltam.length){faltam[0].scrollIntoView({behavior:'smooth',block:'center'});faltam[0].focus()}
  return faltam.length===0;
}
function sinanSalvarRascunho(){try{localStorage.setItem(chaveDadosLocais(SINAN_RASCUNHO_KEY),JSON.stringify(sinanCampos()));showToast('Rascunho SINAN salvo neste dispositivo.')}catch(e){alert('Não foi possível salvar o rascunho.')}}
function sinanLimpar(){if(!confirm('Limpar todos os campos da ficha SINAN?'))return;document.querySelectorAll('#pg-sinan input,#pg-sinan select,#pg-sinan textarea').forEach(el=>{if(el.type!=='file')el.value=''});sinanSet('sinan-uf-notif','PR');sinanSet('sinan-mun-notif','Toledo');sinanSet('sinan-mun-notif-cod','4127700');sinanSet('sinan-uf-res','PR');sinanSet('sinan-mun-res','Toledo');sinanSet('sinan-mun-res-cod','4127700');sinanSet('sinan-data-notif',new Date().toISOString().slice(0,10));localStorage.removeItem(chaveDadosLocais(SINAN_RASCUNHO_KEY));sinanValidar();sinanRenderFichaSelecionada()}
async function sinanBuscarPaciente(){
  const cpf=normalizarCPF(sinanVal('sinan-cpf'));const st=sinanEl('sinan-paciente-status');
  if(cpf.length!==11){if(st)st.textContent='Informe um CPF válido para buscar.';return}
  const p=carregarPacientes()[cpf];if(!p){if(st)st.textContent='Paciente ainda não encontrado no banco local.';return}
  sinanSet('sinan-nome',p.nome);sinanSet('sinan-nasc',p.nasc);sinanSet('sinan-cns',p.cns);sinanSet('sinan-mae',p.nome_mae);sinanSet('sinan-raca',p.raca);sinanSet('sinan-escolaridade',p.escolaridade);sinanSet('sinan-cep',p.cep);sinanSet('sinan-logradouro',p.logradouro||p.endereco);sinanSet('sinan-numero',p.numero);sinanSet('sinan-bairro',p.bairro);sinanSet('sinan-mun-res',p.municipio||'Toledo');sinanSet('sinan-telefone',p.telefone);sinanSet('sinan-sexo',String(p.sexo||'').toLowerCase().includes('menin')?(String(p.sexo).toLowerCase().includes('menina')?'F':'M'):p.sexo);sinanAtualizarIdade();if(st)st.textContent='Cadastro localizado e preenchido.';showToast('Dados do paciente preenchidos.')
}
async function sinanBuscarCep(){
  const cep=sinanSomenteNumeros(sinanVal('sinan-cep'));if(cep.length!==8)return;
  try{const r=await fetchComTimeout('https://viacep.com.br/ws/'+cep+'/json/');const j=await r.json();if(j.erro)return;sinanSet('sinan-logradouro',j.logradouro);sinanSet('sinan-bairro',j.bairro);sinanSet('sinan-mun-res',j.localidade);sinanSet('sinan-uf-res',j.uf);sinanSet('sinan-mun-res-cod',j.ibge);showToast('Endereço preenchido pelo CEP.')}catch(e){}
}
function sinanB64Bytes(b64){const bin=atob(b64),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
async function sinanObterModeloEspecifico(f){
  if(!f||f.id==='individual-geral')throw new Error('Selecione uma ficha específica do agravo. A ficha geral antiga não será mais usada.');
  const embutido=window.SINAN_MODELOS_ESPECIFICOS_BASE64?.[f.id];
  if(embutido)return {bytes:sinanB64Bytes(embutido),fallback:false};
  const cacheKey='esf_sinan_modelo_especifico_'+f.id;
  const salvo=localStorage.getItem(cacheKey);if(salvo)return {bytes:sinanB64Bytes(salvo),fallback:false};
  try{
    const r=await fetchComTimeout(f.url,{},20000);
    if(!r.ok)throw new Error('modelo indisponível');
    const bytes=new Uint8Array(await r.arrayBuffer());
    try{let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));localStorage.setItem(cacheKey,btoa(bin))}catch(e){}
    return {bytes,fallback:false};
  }catch(e){
    const out=sinanEl('sinan-validacao');
    if(out){out.className='alert alert-w';out.innerHTML=`<div><strong>Modelo específico não encontrado no arquivo offline:</strong> a ficha de ${escTR(f.nome)} ainda precisa ser baixada/embutida. A ficha geral antiga não será usada no lugar dela.</div>`}
    throw new Error('Modelo específico de '+f.nome+' ainda não está disponível offline. Baixe/embuta esta ficha antes de gerar.');
  }
}
function sinanTextoLinhas(texto,max=95){
  const words=sinanSeguro(texto).split(/\s+/).filter(Boolean),linhas=[];let l='';
  words.forEach(w=>{if((l+' '+w).trim().length>max){if(l)linhas.push(l);l=w}else l=(l+' '+w).trim()});
  if(l)linhas.push(l);return linhas;
}
const SINAN_FICHAS_INVESTIGACAO=new Set([
  'ac-animal','ac-trabalho','material-biologico','aids-adulto','aids-crianca','antirrabico','botulismo','cancer-trabalho','caxumba','chagas-aguda','chagas-cronica','colera','coqueluche','crianca-hiv','dermatose-trabalho','difteria','dta','epizootia','esavi','esquistossomose','febre-amarela','febre-nilo','febre-maculosa','febre-tifoide','gestante-hiv','hanseniase','hantavirose','hepatites','intoxicacao','lta','lv','leptospirose','ler-dort','malaria','meningite','mini-saia','mpox','pfa','pneumoconiose','pair','peste','raiva','rotavirus','sarampo-rubeola','sifilis-adquirida','sifilis-congenita','sifilis-gestante','src','corrimento-uretral','srag','tetano-acidental','tetano-neonatal','toxoplasmose-adquirida','toxoplasmose-congenita','toxoplasmose-gestacional','mental-trabalho','tuberculose','varicela','violencia','zika'
]);
function sinanDesenharDadosGerais(pdf,pages,font,bold,color){
  const p1=pages[0],p2=pages[1]||pages[0];
  const at=(page,x,y,text,size=6.3,max=80,b=false)=>{text=sinanSeguro(text).slice(0,max);if(text)page.drawText(text,{x,y,size,font:b?bold:font,color})};
  const spaced=(page,x,y,text,step=10.5,size=6.2,max=60)=>{sinanSeguro(text).slice(0,max).split('').forEach((c,i)=>{if(c!==' ')at(page,x+i*step,y,c,size,1)})};
  const digits=(page,x,y,text,step=14,size=6.3,max=20)=>spaced(page,x,y,sinanSomenteNumeros(text),step,size,max);
  const digitsAt=(page,y,text,xs,size=6.3)=>{sinanSomenteNumeros(text).slice(0,xs.length).split('').forEach((c,i)=>at(page,xs[i],y,c,size,1))};
  const dateAt=(page,y,value,xs)=>digitsAt(page,y,sinanData(value),xs,6.2);
  const codeAt=(page,x,y,id,transform)=>{let v=sinanVal(id);if(transform)v=transform[v]||v;at(page,x,y+3,v,7,2,true)};
  const dateMain=[453,467.5,482.5,496.8,511.3,525.8,540.2,554.6];
  const dateSurto=[72,86.5,101,115.5,130,144.5,159,173.5];
  const dateComp1=[58,72.5,87,101.5,116,130.5,145,159.5];
  const dateComp2=[180,194.5,209,223.5,238,252.5,267,281.5];
  const dateCompExantema=[257,271.5,286,300.5,315,329.5,344,358.5];
  const dateCompVacina=[217,231.5,246,260.5,275,289.5,304,318.5];
  const dateCompHosp=[463,477.5,492,506.5,521,535.5,550,564.5];
  digits(p1,455,800,sinanVal('sinan-num-notificacao'),13.5,6.4,12);
  codeAt(p1,550,758,'sinan-tipo');
  at(p1,70,727,sinanVal('sinan-agravo'),7,70,true);dateAt(p1,729,sinanVal('sinan-data-notif'),dateMain);
  spaced(p1,58,697,sinanVal('sinan-uf-notif'),14,6.5,2);at(p1,91,697,sinanVal('sinan-mun-notif'),7,55);digits(p1,487,697,sinanVal('sinan-mun-notif-cod'),14.45,6.3,7);
  at(p1,71,669,sinanVal('sinan-unidade'),7,70);digits(p1,346,669,sinanVal('sinan-unidade-cod'),14.45,6.3,7);dateAt(p1,671,sinanVal('sinan-primeiros-sintomas'),dateMain);
  spaced(p1,70,639,sinanVal('sinan-nome'),10.5,6.3,72);dateAt(p1,641,sinanVal('sinan-nasc'),dateMain);digitsAt(p1,615,sinanVal('sinan-idade'),[61,75],6.3);
  codeAt(p1,137,623,'sinan-idade-unidade');codeAt(p1,236,623,'sinan-sexo',{M:'M',F:'F',I:'I'});codeAt(p1,432,623,'sinan-gestante');codeAt(p1,556,623,'sinan-raca');codeAt(p1,557,596,'sinan-escolaridade');
  digits(p1,56,550,sinanVal('sinan-cns'),11.45,6.2,15);at(p1,244,550,sinanVal('sinan-mae'),6.4,55);
  if(p2!==p1||pages.length>1){
    dateAt(p2,727,sinanVal('sinan-comp-sorologia'),dateComp1);dateAt(p2,726,sinanVal('sinan-comp-outra-data'),dateComp2);at(p2,312,724,sinanVal('sinan-comp-exame'),6.5,75);
    codeAt(p2,297,708,'sinan-comp-obito');codeAt(p2,559,708,'sinan-comp-contato');codeAt(p2,216,678,'sinan-comp-exantema');dateAt(p2,662,sinanVal('sinan-comp-exantema-data'),dateCompExantema);codeAt(p2,560,678,'sinan-comp-petequias');
    codeAt(p2,192,643,'sinan-comp-liquor');at(p2,230,640,sinanVal('sinan-comp-bacterioscopia'),6.3,75);codeAt(p2,190,607,'sinan-comp-vacina');dateAt(p2,596,sinanVal('sinan-comp-vacina-data'),dateCompVacina);codeAt(p2,444,607,'sinan-comp-hospitalizacao');dateAt(p2,593,sinanVal('sinan-comp-hosp-data'),dateCompHosp);
  }
  dateAt(p1,519,sinanVal('sinan-surto-data'),dateSurto);digits(p1,73,489,sinanVal('sinan-surto-casos'),14.4,6.2,8);codeAt(p1,550,489,'sinan-surto-local');at(p1,420,487,sinanVal('sinan-surto-outro'),6.2,40);
  spaced(p1,57,454,sinanVal('sinan-uf-res'),14,6.3,2);at(p1,92,454,sinanVal('sinan-mun-res'),6.3,48);digits(p1,329,454,sinanVal('sinan-mun-res-cod'),14.45,6.2,7);at(p1,424,454,sinanVal('sinan-distrito'),6.3,34);
  at(p1,64,435,sinanVal('sinan-bairro'),6.3,35);spaced(p1,203,435,sinanVal('sinan-logradouro'),9.2,6.1,60);digits(p1,493,435,sinanVal('sinan-logradouro-cod'),14.4,6.1,6);
  at(p1,65,410,sinanVal('sinan-numero'),6.3,10);at(p1,119,410,sinanVal('sinan-complemento'),6.3,48);at(p1,420,410,sinanVal('sinan-geo1'),6.3,32);
  at(p1,65,384,sinanVal('sinan-geo2'),6.3,32);at(p1,226,384,sinanVal('sinan-referencia'),6.3,50);digits(p1,466,384,sinanVal('sinan-cep'),14.4,6.2,8);
  digits(p1,64,360,sinanVal('sinan-telefone'),14.4,6.2,11);codeAt(p1,386,368,'sinan-zona');at(p1,367,360,sinanVal('sinan-pais'),6.3,45);
  at(p1,56,320,sinanVal('sinan-notificante-unidade'),6.5,80);at(p1,56,288,sinanVal('sinan-notificante-nome'),6.5,55);at(p1,254,288,sinanVal('sinan-notificante-funcao'),6.5,55);
}
function sinanDesenharDadosInvestigacao(pdf,pages,font,bold,color){
  const p1=pages[0];
  const at=(page,x,y,text,size=6.1,max=80,b=false)=>{text=sinanSeguro(text).slice(0,max);if(text)page.drawText(text,{x,y,size,font:b?bold:font,color})};
  const spaced=(page,x,y,text,step=9.7,size=5.9,max=72)=>{sinanSeguro(text).slice(0,max).split('').forEach((c,i)=>{if(c!==' ')at(page,x+i*step,y,c,size,1)})};
  const digitsAt=(page,y,text,xs,size=5.9)=>{sinanSomenteNumeros(text).slice(0,xs.length).split('').forEach((c,i)=>at(page,xs[i],y,c,size,1))};
  const dateAt=(page,y,value,xs)=>digitsAt(page,y,sinanData(value),xs,5.8);
  const codeAt=(page,x,y,id,transform)=>{let v=sinanVal(id);if(transform)v=transform[v]||v;at(page,x,y,v,6.4,2,true)};
  const dataX=[430,444,458,475,489,506,520,534];
  const ufY=637, unidadeY=609, nomeY=584, demY=547, escY=513, cnsY=486;
  const munY=455, endY=426, compY=398, refY=371, telY=343;

  digitsAt(p1,763,sinanVal('sinan-num-notificacao'),[506,520,534,548,562,576,590],6.2);
  dateAt(p1,664,sinanVal('sinan-data-notif'),dataX);
  spaced(p1,58,ufY,sinanVal('sinan-uf-notif'),13.8,6,2);
  at(p1,90,ufY,sinanVal('sinan-mun-notif'),6.4,48);
  digitsAt(p1,ufY,sinanVal('sinan-mun-notif-cod'),[452,465,478,491,504,517,530],6);
  at(p1,66,unidadeY,sinanVal('sinan-unidade'),6.2,64);
  digitsAt(p1,unidadeY,sinanVal('sinan-unidade-cod'),[334,347,360,373,386,399,412],6);
  dateAt(p1,unidadeY,sinanVal('sinan-primeiros-sintomas'),dataX);
  spaced(p1,65,nomeY,sinanVal('sinan-nome'),9.35,5.9,86);
  dateAt(p1,nomeY,sinanVal('sinan-nasc'),dataX);
  digitsAt(p1,demY,sinanVal('sinan-idade'),[62,76],6);
  codeAt(p1,111,demY+1,'sinan-idade-unidade');
  codeAt(p1,222,demY+1,'sinan-sexo',{M:'M',F:'F',I:'I'});
  codeAt(p1,421,demY+1,'sinan-gestante');
  codeAt(p1,532,demY+1,'sinan-raca');
  codeAt(p1,532,escY,'sinan-escolaridade');
  digitsAt(p1,cnsY,sinanVal('sinan-cns'),[56,67.8,79.6,91.4,103.2,115,126.8,138.6,150.4,162.2,174,185.8,197.6,209.4,221.2],5.8);
  at(p1,235,cnsY,sinanVal('sinan-mae'),6.1,62);
  spaced(p1,58,munY,sinanVal('sinan-uf-res'),13.8,6,2);
  at(p1,91,munY,sinanVal('sinan-mun-res'),6.2,46);
  digitsAt(p1,munY,sinanVal('sinan-mun-res-cod'),[326,339,352,365,378,391,404],5.9);
  at(p1,425,munY,sinanVal('sinan-distrito'),6.1,35);
  at(p1,65,endY,sinanVal('sinan-bairro'),5.9,34);
  spaced(p1,202,endY,sinanVal('sinan-logradouro'),8.8,5.7,62);
  digitsAt(p1,endY,sinanVal('sinan-logradouro-cod'),[472,485,498,511,524,537],5.7);
  at(p1,65,compY,sinanVal('sinan-numero'),6,10);
  at(p1,119,compY,sinanVal('sinan-complemento'),5.9,55);
  at(p1,420,compY,sinanVal('sinan-geo1'),5.9,32);
  at(p1,65,refY,sinanVal('sinan-geo2'),5.9,32);
  at(p1,226,refY,sinanVal('sinan-referencia'),5.9,48);
  digitsAt(p1,refY,sinanVal('sinan-cep'),[450,462,474,486,498,510,522,534],5.9);
  digitsAt(p1,telY,sinanVal('sinan-telefone'),[64,78.5,93,107.5,122,136.5,151,165.5,180,194.5,209],5.8);
  codeAt(p1,389,telY+1,'sinan-zona');
  at(p1,367,telY,sinanVal('sinan-pais'),5.9,45);
}
function sinanDesenharDadosInvestigacaoPorMapa(pdf,pages,font,bold,color,map){
  const p1=pages[0], y=map?.y||{};
  const compact=map?.xVariant==='compact';
  const dy=compact?4.2:0;
  const dcode=compact?5.2:0;
  const at=(page,x,yy,text,size=6.1,max=80,b=false)=>{text=sinanSeguro(text).slice(0,max);if(text&&Number.isFinite(yy))page.drawText(text,{x,y:yy,size,font:b?bold:font,color})};
  const spaced=(page,x,yy,text,step=9.7,size=5.9,max=72)=>{if(!Number.isFinite(yy))return;sinanSeguro(text).slice(0,max).split('').forEach((c,i)=>{if(c!==' ')at(page,x+i*step,yy,c,size,1)})};
  const digitsAt=(page,yy,text,xs,size=5.9)=>{if(!Number.isFinite(yy))return;sinanSomenteNumeros(text).slice(0,xs.length).split('').forEach((c,i)=>at(page,xs[i],yy,c,size,1))};
  const dateAt=(page,yy,value,xs)=>digitsAt(page,yy,sinanData(value),xs,5.8);
  const codeAt=(page,x,yy,id,transform)=>{let v=sinanVal(id);if(transform)v=transform[v]||v;at(page,x,yy,v,6.4,2,true)};
  const xs=compact?{
    num:[506,520,534,548,562,576,590],
    data:[430,444,458,475,489,506,520,534],
    munNotif:[452,465,478,491,504,517,530],
    unidade:[334,347,360,373,386,399,412],
    nasc:[430,444,458,475,489,506,520,534],
    cns:[56,67.8,79.6,91.4,103.2,115,126.8,138.6,150.4,162.2,174,185.8,197.6,209.4,221.2],
    munRes:[326,339,352,365,378,391,404],
    logrCod:[472,485,498,511,524,537],
    cep:[450,462,474,486,498,510,522,534],
    tel:[64,78.5,93,107.5,122,136.5,151,165.5,180,194.5,209]
  }:{
    num:[486,499,512,525,538,551,564],
    data:[453,467.5,482,496.5,511,525.5,540,554.5],
    munNotif:[487,501.5,516,530.5,545,559.5,574],
    unidade:[346,360.5,375,389.5,404,418.5,433],
    nasc:[453,467.5,482,496.5,511,525.5,540,554.5],
    cns:[56,67.5,79,90.5,102,113.5,125,136.5,148,159.5,171,182.5,194,205.5,217],
    munRes:[329,343.5,358,372.5,387,401.5,416],
    logrCod:[493,507.5,522,536.5,551,565],
    cep:[466,480.5,495,509.5,535,549.5,564,578.5],
    tel:[64,78.5,93,107.5,122,136.5,151,165.5,180,194.5,209]
  };
  const numY=Number.isFinite(map?.h)?(compact?map.h-28:map.h-41):(compact?763:800);
  digitsAt(p1,numY,sinanVal('sinan-num-notificacao'),xs.num,6.2);
  dateAt(p1,y.dataNotif+dy,sinanVal('sinan-data-notif'),xs.data);
  spaced(p1,compact?58:58,y.uf+dy,sinanVal('sinan-uf-notif'),13.8,6,2);
  at(p1,compact?90:91,y.uf+dy,sinanVal('sinan-mun-notif'),6.4,48);
  digitsAt(p1,y.uf+dy,sinanVal('sinan-mun-notif-cod'),xs.munNotif,6);
  at(p1,compact?66:70,y.unidade+dy,sinanVal('sinan-unidade'),6.2,64);
  digitsAt(p1,y.unidade+dy,sinanVal('sinan-unidade-cod'),xs.unidade,6);
  dateAt(p1,y.unidade+dy,sinanVal('sinan-primeiros-sintomas'),xs.data);
  spaced(p1,compact?65:67,y.nome+dy,sinanVal('sinan-nome'),compact?9.35:9.5,5.9,86);
  dateAt(p1,y.nome+dy,sinanVal('sinan-nasc'),xs.nasc);
  digitsAt(p1,y.dem+dcode,sinanVal('sinan-idade'),compact?[62,76]:[62,76],6);
  codeAt(p1,compact?111:113,y.dem+dcode,'sinan-idade-unidade');
  codeAt(p1,compact?222:226,y.dem+dcode,'sinan-sexo',{M:'M',F:'F',I:'I'});
  codeAt(p1,compact?421:425,y.dem+dcode,'sinan-gestante');
  codeAt(p1,compact?532:532,y.dem+dcode,'sinan-raca');
  codeAt(p1,compact?532:532,y.esc+dcode,'sinan-escolaridade');
  digitsAt(p1,y.cns+dy,sinanVal('sinan-cns'),xs.cns,5.8);
  at(p1,compact?235:244,y.cns+dy,sinanVal('sinan-mae'),6.1,62);
  spaced(p1,compact?58:58,y.mun+dy,sinanVal('sinan-uf-res'),13.8,6,2);
  at(p1,compact?91:91,y.mun+dy,sinanVal('sinan-mun-res'),6.2,46);
  digitsAt(p1,y.mun+dy,sinanVal('sinan-mun-res-cod'),xs.munRes,5.9);
  at(p1,compact?425:424,y.mun+dy,sinanVal('sinan-distrito'),6.1,35);
  at(p1,compact?65:64,y.end+dy,sinanVal('sinan-bairro'),5.9,34);
  spaced(p1,compact?202:203,y.end+dy,sinanVal('sinan-logradouro'),compact?8.8:9.1,5.7,62);
  digitsAt(p1,y.end+dy,sinanVal('sinan-logradouro-cod'),xs.logrCod,5.7);
  at(p1,compact?65:65,y.comp+dy,sinanVal('sinan-numero'),6,10);
  at(p1,compact?119:119,y.comp+dy,sinanVal('sinan-complemento'),5.9,55);
  at(p1,compact?420:420,y.comp+dy,sinanVal('sinan-geo1'),5.9,32);
  at(p1,compact?65:65,y.ref+dy,sinanVal('sinan-geo2'),5.9,32);
  at(p1,compact?226:226,y.ref+dy,sinanVal('sinan-referencia'),5.9,48);
  digitsAt(p1,y.ref+dy,sinanVal('sinan-cep'),xs.cep,5.9);
  digitsAt(p1,y.tel+dy,sinanVal('sinan-telefone'),xs.tel,5.8);
  codeAt(p1,compact?389:386,y.tel+dcode,'sinan-zona');
  at(p1,compact?367:367,y.tel+dy,sinanVal('sinan-pais'),5.9,45);
}
function sinanEspVal(f,id){return sinanEl(`sinan-esp-${f.id}-${id}`)?.value?.trim()||''}
function sinanDesenharSifilisAdquirida(pdf,pages,font,bold,color,f){
  const p1=pages[0],p2=pages[1]||pages[0];
  const at=(page,x,y,text,size=6,max=80,b=false)=>{text=sinanSeguro(text).slice(0,max);if(text)page.drawText(text,{x,y,size,font:b?bold:font,color})};
  const code=(x,y,id)=>{const v=sinanEspVal(f,id);if(v)at(p1,x,y,v,7,3,true)};
  const spaced=(x,y,text,step=9.4,size=5.8,max=40)=>sinanSeguro(text).slice(0,max).split('').forEach((c,i)=>{if(c!==' ')at(p1,x+i*step,y,c,size,1)});
  const digitsAt=(page,y,text,xs,size=5.8)=>sinanSomenteNumeros(text).slice(0,xs.length).split('').forEach((c,i)=>at(page,xs[i],y,c,size,1));
  const date=(y,id,xs)=>digitsAt(p1,y,sinanData(sinanEspVal(f,id)),xs,5.8);
  const ocup=sinanEspVal(f,'ocupacao');if(ocup)spaced(67,309,ocup,8.7,5.8,55);
  code(240,283,'antecedente-sifilis');
  code(522,283,'tratamento-anterior');
  code(535,252,'comportamento-sexual');
  code(246,202,'teste-nao-treponemico');
  const titulo=sinanEspVal(f,'titulo-vdrl');if(titulo)at(p1,340,202,titulo.replace(/^1\s*:\s*/,'').replace(/^/,'1:'),6,10,true);
  date(202,'data-teste-nao-treponemico',[430,444,458,475,489,506,520,534]);
  code(535,174,'teste-treponemico');
  code(535,141,'classificacao-clinica');
  code(535,108,'esquema-tratamento');
  date(106,'data-inicio-tratamento',[430,444,458,475,489,506,520,534]);
  code(272,65,'classificacao-final');
  const obs=sinanEspVal(f,'observacoes');
  if(obs){
    let y=680;
    sinanTextoLinhas(obs,92).slice(0,9).forEach(l=>{at(p2,57,y,l,6.3,96);y-=17.3});
  }
}
function sinanDesenharDadosPorFicha(pdf,pages,font,bold,color,f){
  if(f?.id==='sifilis-gestante')return ESFSinanGestante.draw({pages,font,bold,color,get:sinanVal});
  if(f&&SINAN_FICHAS_INVESTIGACAO.has(f.id)){
    const map=window.SINAN_COORDS_ESPECIFICOS?.[f.id];
    if(map)sinanDesenharDadosInvestigacaoPorMapa(pdf,pages,font,bold,color,map);
    else sinanDesenharDadosInvestigacao(pdf,pages,font,bold,color);
    if(f.id==='sifilis-adquirida')sinanDesenharSifilisAdquirida(pdf,pages,font,bold,color,f);
    return;
  }
  return sinanDesenharDadosGerais(pdf,pages,font,bold,color);
}
function sinanAdicionarComplementoEspecifico(pdf,font,bold,color,f){
  const especificos=sinanValoresCamposEspecificos().map(x=>[x.label,x.value]);
  const resumo=[['FICHA SELECIONADA',f?.nome],['PACIENTE',sinanVal('sinan-nome')],['AGRAVO',sinanVal('sinan-agravo')],['RESUMO CLINICO / SUSPEITA',sinanVal('sinan-esp-resumo')],['DATA DA INVESTIGACAO',sinanVal('sinan-esp-data-investigacao')],['CLASSIFICACAO INICIAL',sinanVal('sinan-esp-classificacao')],['LOCAL PROVAVEL',sinanVal('sinan-esp-local-provavel')],...especificos,['OUTROS CAMPOS / OBSERVACOES',sinanVal('sinan-esp-campos')]].filter(([,v])=>String(v||'').trim());
  if(!resumo.length)return;
  let page=pdf.addPage([595.28,841.89]);
  const at=(x,y,t,s=9,b=false)=>page.drawText(sinanSeguro(t),{x,y,size:s,font:b?bold:font,color});
  const novaPagina=()=>{page=pdf.addPage([595.28,841.89]);at(46,800,'COMPLEMENTO DE PREENCHIMENTO - FICHA ESPECIFICA SINAN',12,true);at(46,782,'Dados gerados pelo sistema para transcricao/conferencia dos campos especificos do agravo.',8,false);return 748};
  novaPagina();
  let y=748;
  resumo.forEach(([k,v])=>{if(y<72)y=novaPagina();at(46,y,k+':',8,true);y-=14;sinanTextoLinhas(v,100).forEach(l=>{if(y<60)y=novaPagina();at(62,y,l,8,false);y-=11});y-=8});
}
async function gerarFichaSinanEspecifica(){
  if(!exigirPermissao('gerar_documentos'))return;if(!sinanValidar(true))return;
  const f=sinanFichaAtual();
  if(!f||f.id==='individual-geral'){alert('Selecione a ficha específica do agravo. A ficha geral antiga não será mais usada.');return}
  try{
    if(!window.PDFLib?.PDFDocument)throw new Error('O gerador de PDF não foi carregado.');
    const modelo=await sinanObterModeloEspecifico(f);
    const {PDFDocument,StandardFonts,rgb}=window.PDFLib,pdf=await PDFDocument.load(modelo.bytes),pages=pdf.getPages(),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),color=rgb(.02,.08,.32);
    sinanDesenharDadosPorFicha(pdf,pages,font,bold,color,f);
    sinanAdicionarComplementoEspecifico(pdf,font,bold,color,f);
    const bytes=await pdf.save(),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a'),nome=sinanSeguro(sinanVal('sinan-nome')).toLowerCase().replace(/[^a-z0-9]+/g,'-'),agr=sinanSeguro(f.nome).toLowerCase().replace(/[^a-z0-9]+/g,'-');
    a.href=url;a.download='sinan-'+agr+'-'+(nome||'notificacao')+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);sinanSalvarRascunho();showToast('Ficha específica SINAN gerada.');
  }catch(e){alert((e?.message&&e.message!=='Failed to fetch')?e.message:'Modelo específico indisponível. A ficha geral antiga não será usada como substituta.')}
}
function sinanInicializar(){
  sinanMontarCatalogoFichas();
  const hoje=new Date().toISOString().slice(0,10);if(!sinanVal('sinan-data-notif'))sinanSet('sinan-data-notif',hoje);
  let rascunho={};try{rascunho=JSON.parse(localStorage.getItem(chaveDadosLocais(SINAN_RASCUNHO_KEY))||'{}');sinanPreencher(rascunho)}catch(e){}
  const u=typeof getUsuarioAtual==='function'?getUsuarioAtual():null;
  sinanSet('sinan-unidade',sinanVal('sinan-unidade')||u?.unidade||PROTO?.unit?.nome||'');sinanSet('sinan-notificante-unidade',sinanVal('sinan-notificante-unidade')||u?.unidade||PROTO?.unit?.nome||'');sinanSet('sinan-notificante-nome',sinanVal('sinan-notificante-nome')||u?.nome||'');sinanSet('sinan-notificante-funcao',sinanVal('sinan-notificante-funcao')||u?.cargo||'');
  sinanSincronizarAgravo();
  try{sinanPreencher(rascunho)}catch(e){}
}
async function garantirPdfJs(){const ok=await carregarDependenciaRede('pdfjs',()=>!!window.pdfjsLib);if(ok)pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';return ok}
async function garantirChartJs(){return carregarDependenciaRede('chart',()=>!!window.Chart)}

// ── NAV / TABS GERAIS ──────────────────────────────────────
async function fetchComTimeout(url,opcoes={},timeoutMs=10000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetch(url,{...opcoes,signal:controller.signal});}
  finally{clearTimeout(timer);}
}
function alternarMenuLateral(forcar){
  const recolher=typeof forcar==='boolean'?forcar:!document.body.classList.contains('sidebar-collapsed');
  document.body.classList.toggle('sidebar-collapsed',recolher);
  try{localStorage.setItem('esf_sidebar_recolhida',recolher?'1':'0')}catch(e){}
}
function atualizarResumoDashboard(){
  const agora=new Date(),usuario=typeof getUsuarioAtual==='function'?getUsuarioAtual():null;
  const unidade=document.getElementById('dash-unidade'),data=document.getElementById('dash-data'),hora=document.getElementById('dash-hora');
  if(unidade)unidade.textContent=usuario?.unidade||'UBS não informada';
  if(data)data.textContent=agora.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
  if(hora)hora.textContent=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  renderHomeUpdateLog();
}
const HOME_UPDATE_LOG=[
  {data:'28/06',tag:'Visita',texto:'Criado módulo de Visita Domiciliar com avaliação do domicílio, acamados, dispositivos, medicações, insumos, risco, SOAP e relatório PDF.'},
  {data:'21/06',tag:'IA SOAP',texto:'Adicionada configuração de API no Admin e botão IA SOAP para reescrever apenas a evolução, sem criar condutas ou dados clínicos novos.'},
  {data:'20/06',tag:'Demanda',texto:'Demanda Espontânea recebeu classificação Toledo 2026, bloqueio de rebaixamento de risco, fluxo por queixa, desfecho obrigatório e relatório de testes.'},
  {data:'20/06',tag:'Laudos',texto:'Laudo de teste rápido agora embute os logotipos no próprio HTML, evitando imagem quebrada na impressão.'},
  {data:'20/06',tag:'SOAP',texto:'Evoluções ficaram mais limpas, com subtítulos claros, pendências separadas e cópia somente do SOAP.'},
  {data:'20/06',tag:'PNI',texto:'Avaliação vacinal passou a listar registros conferidos e orientar validação de intervalos, contraindicações e CRIE.'},
  {data:'20/06',tag:'IST',texto:'IST foi reorganizado por queixa/síndrome, suspeita clínica, diagnóstico confirmado, tratamento, parceria, SINAN e retorno.'},
  {data:'20/06',tag:'PDF',texto:'Ajustes contínuos em ERSM, IVCF-20, SINAN e documentos padronizados para melhorar impressão e sobreposição.'}
];
function renderHomeUpdateLog(){
  const out=document.getElementById('home-update-log');if(!out)return;
  out.innerHTML=HOME_UPDATE_LOG.slice(0,6).map(x=>`<div class="update-item"><div class="update-date">${escTR(x.data)}</div><div class="update-text"><span class="update-tag">${escTR(x.tag)}</span>${escTR(x.texto)}</div></div>`).join('');
}
const MODULOS_SISTEMA={
  'pn-abertura':'Abertura PN','pn-consulta':'Consulta PN','puericultura':'Puericultura','preventivo':'Preventivo','idoso':'Idoso','saude-mental':'Saúde Mental',
  'consulta-geral':'Consulta Geral','hiperdia':'Hiperdia','feridas':'Feridas / Curativos','puerperio':'Puerpério','ist':'IST / Testes Rápidos','visita-domiciliar':'Visita Domiciliar','pni':'PNI',
  'sinan':'SINAN','pacientes':'Pacientes','historico':'Histórico','busca-ativa':'Busca Ativa','indicadores':'Indicadores','territorio':'Território e ACS','relatorios':'Relatórios','auditoria-clinica':'Auditoria Clínica','reportes':'Reportar erro','editor':'Protocolos'
};
const MODULOS_ATIVOS_KEY='esf_modulos_ativos_v1';
let MODULOS_ATIVOS=Object.fromEntries(Object.keys(MODULOS_SISTEMA).map(k=>[k,true]));
function moduloAtivo(id){return MODULOS_ATIVOS[id]!==false}
function aplicarModulosAtivos(){
  Object.keys(MODULOS_SISTEMA).forEach(id=>{
    const ativo=moduloAtivo(id);
    document.querySelectorAll(`[onclick*="'${id}'"],[onclick*='"${id}"']`).forEach(el=>{
      if(el.closest('#admin-screen'))return;
      el.classList.toggle('modulo-desativado',!ativo);
      el.setAttribute('aria-hidden',ativo?'false':'true');
    });
    const pagina=document.getElementById(`pg-${id}`);
    if(pagina){pagina.classList.toggle('modulo-desativado',!ativo);pagina.setAttribute('aria-hidden',ativo?'false':'true')}
  });
  const atual=document.querySelector('.pg.on')?.id?.replace(/^pg-/,'');
  if(atual&&atual!=='inicio'&&!moduloAtivo(atual))go('inicio');
  renderAdminModulos();
}
function renderAdminModulos(){
  const grid=document.getElementById('admin-module-grid');if(!grid)return;
  grid.innerHTML=Object.entries(MODULOS_SISTEMA).map(([id,nome])=>`<label class="admin-module-toggle"><input type="checkbox" data-module-toggle="${id}" ${moduloAtivo(id)?'checked':''}> <span>${escTR(nome)}</span></label>`).join('');
}
async function carregarModulosAtivos(){
  try{MODULOS_ATIVOS={...MODULOS_ATIVOS,...JSON.parse(localStorage.getItem(MODULOS_ATIVOS_KEY)||'{}')}}catch(e){}
  if(_sb){const {data}=await _sb.from('configuracoes_sistema').select('valor').eq('chave','modulos_ativos').maybeSingle();if(data?.valor)MODULOS_ATIVOS={...MODULOS_ATIVOS,...data.valor}}
  localStorage.setItem(MODULOS_ATIVOS_KEY,JSON.stringify(MODULOS_ATIVOS));aplicarModulosAtivos();
}
async function salvarModulosAtivos(){
  if(!temPermissao('ver_admin'))return showToast('Somente o administrador pode alterar os módulos.');
  document.querySelectorAll('[data-module-toggle]').forEach(e=>MODULOS_ATIVOS[e.dataset.moduleToggle]=e.checked);
  localStorage.setItem(MODULOS_ATIVOS_KEY,JSON.stringify(MODULOS_ATIVOS));
  if(_sb){const {error}=await _sb.from('configuracoes_sistema').upsert({chave:'modulos_ativos',valor:MODULOS_ATIVOS,updated_at:new Date().toISOString()},{onConflict:'chave'});if(error)return showToast('Módulos salvos neste dispositivo. Execute o SQL seguro para compartilhar.')}
  aplicarModulosAtivos();showToast('Visibilidade dos módulos atualizada para todos.');
}
function go(id,btn){
  if(id!=='inicio'&&!moduloAtivo(id))return showToast('Este módulo está temporariamente desativado pelo administrador.');
  if(id==='historico'&&!exigirPermissao('ver_historico','Seu perfil não possui permissão para visualizar o histórico.'))return;
  if(id==='pacientes'&&!exigirPermissao('ver_historico','Seu perfil não possui permissão para visualizar o banco de pacientes.'))return;
  if(['busca-ativa','indicadores','territorio','relatorios'].includes(id)&&!exigirPermissao('ver_historico','Seu perfil não possui permissão para visualizar dados de gestão assistencial.'))return;
  if(id==='editor'&&!exigirPermissao('editar_protocolos','Seu perfil não possui permissão para editar protocolos.'))return;
  if(id==='reportes'&&!exigirPermissao('reportar_erro','Seu perfil não possui permissão para enviar relatos.'))return;
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  const pagina=document.getElementById('pg-'+id); if(!pagina)return;
  pagina.classList.add('on');
  if(typeof restaurarRascunhoAutomatico==='function')setTimeout(()=>restaurarRascunhoAutomatico('pg-'+id),30);
  if(btn)btn.classList.add('on');
  if(id==='inicio')atualizarResumoDashboard();
  if(id==='reportes')setTimeout(carregarReportes,50);
  if(id==='busca-ativa')setTimeout(renderBuscaAtiva,50);
  if(id==='indicadores')setTimeout(renderIndicadores,50);
  if(id==='territorio')setTimeout(renderTerritorio,50);
  if(id==='relatorios')setTimeout(renderRelatorio,50);
  if(id==='historico'&&typeof renderHistorico==='function')setTimeout(renderHistorico,50);
  if(id==='pacientes'&&typeof renderPacientes==='function')setTimeout(()=>{renderPacientes();baixarPacientesNuvem();},50);
  if(id==='preventivo'&&typeof resetMapasAnatomicos==='function')resetMapasAnatomicos();
  if(window.innerWidth<=760)alternarMenuLateral(true);
  setTimeout(atualizarBarraAcoesRapidas,30);
  window.scrollTo({top:0,behavior:'smooth'});
}
function abrirModulo(id){
  // Toda a lógica pós-navegação (render de histórico/pacientes/gestão) vive em go(),
  // para rodar uma única vez independentemente da entrada (tile da home ou barra lateral).
  const btn=Array.from(document.querySelectorAll('.bar-nav .nb')).find(el=>el.getAttribute('onclick')?.includes(`'${id}'`));
  go(id,btn);
}
function tab(btn,tp){
  const parent=btn.closest('.pg');
  const target=document.getElementById(tp);
  if(!parent||!target)return;
  parent.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  parent.querySelectorAll('.tp').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');
  target.classList.add('on');
  parent.querySelectorAll('.tab').forEach(t=>{t.setAttribute('aria-selected',String(t===btn));t.tabIndex=t===btn?0:-1;});

  // Re-render chart ao entrar na tab Antropometria
  if (tp === 'pu-3') {
    // Pequeno delay para garantir que o canvas está visível antes de inicializar
    setTimeout(() => { initChart(); updateAntropometria(); }, 50);
  }
}

// ── IDADES (Comuns) ────────────────────
function calcAge(dateId,outId){
  const v=document.getElementById(dateId).value;
  if(!v)return null;
  const d=new Date(v+'T00:00:00'), h=new Date(); h.setHours(0,0,0,0);
  let y=h.getFullYear()-d.getFullYear();
  let m=h.getMonth()-d.getMonth();
  if(m<0){y--;m+=12;}
  if(h.getDate()<d.getDate()){m--;if(m<0){y--;m+=12;}}
  if(y<0){if(outId)document.getElementById(outId).value='Data futura';return null;}
  const totalM=y*12+m;
  const txt=totalM<24?totalM+' meses':y+' anos'+(m>0?' e '+m+'m':'');
  if(outId)document.getElementById(outId).value=txt;
  return{y,m,totalM};
}
function idadeGest(){calcAge('pna-nasc','pna-idade');avaliarProtocolosPna();}
function idadeIdoso(){calcAge('id-nasc','id-idade');if(typeof sincronizarIdadeIVCF==='function')sincronizarIdadeIVCF();}
function idadePrev(){calcAge('prev-nasc','prev-idade');}

// ── LÓGICA DE PUERICULTURA: IDADE, ANTROPOMETRIA E GRÁFICO (NOVO) ──
let idadePuericulturaGlobal = { cronologica_meses: 0 };
let growthChart = null;

// Tabela condensada da OMS (Medianas em meses-chave: 0, 2, 4, 6, 9, 12, 15, 18, 24, 36, 48, 60)
const WHO_LABELS = [0, 2, 4, 6, 9, 12, 15, 18, 24, 36, 48, 60];
const WHO_DATA = {
  boys: {
    peso: [3.3, 5.6, 7.0, 7.9, 8.9, 9.6, 10.3, 10.9, 12.2, 14.3, 16.3, 18.3],
    alt:  [49.9, 58.4, 63.9, 67.6, 72.0, 75.7, 79.1, 82.3, 87.8, 96.1, 103.3, 110.0],
    pc:   [34.5, 38.3, 40.5, 42.2, 43.8, 45.3, 46.3, 47.2, 48.3, 50.0, 50.8, 51.5]
  },
  girls: {
    peso: [3.2, 5.1, 6.4, 7.3, 8.2, 8.9, 9.6, 10.2, 11.5, 13.9, 16.1, 18.2],
    alt:  [49.1, 57.1, 62.1, 65.7, 70.1, 74.0, 77.5, 80.7, 86.4, 95.1, 102.7, 109.4],
    pc:   [33.9, 37.3, 39.5, 41.1, 42.6, 44.0, 45.0, 46.0, 47.0, 48.9, 49.8, 50.6]
  }
};

function calcAgeDetail(v) {
  if(!v) return null;
  const d = new Date(v + 'T00:00:00'); const h = new Date(); h.setHours(0,0,0,0);
  if(Number.isNaN(d.getTime())||d>h)return null;
  let y = h.getFullYear() - d.getFullYear(); let m = h.getMonth() - d.getMonth(); let dias = h.getDate() - d.getDate();
  if (dias < 0) { m--; dias += new Date(h.getFullYear(), h.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, dias, totalM: (y * 12) + m, totalDias: Math.floor((h - d) / 86400000) };
}

function idadeCrianca(){
  const dataNasc = document.getElementById('pu-nasc').value; if(!dataNasc) return;
  const idade = calcAgeDetail(dataNasc); if(!idade) return;
  idadePuericulturaGlobal.cronologica_meses = idade.totalM;

  let txtCron = idade.totalM === 0 ? idade.dias + ' dias' : (idade.y === 0 ? idade.m + ' meses e ' + idade.dias + ' dias' : idade.y + ' anos e ' + idade.m + ' meses');
  document.getElementById('pu-idade').value = txtCron;

  const banner = document.getElementById('pu-idade-banner'); banner?.classList.add('show');
  const idadeBig=document.getElementById('pu-idade-big');if(idadeBig)idadeBig.textContent = txtCron;

  // Lógica Corrigida Prematuro
  const igEl = document.getElementById('pu-ig').value;
  const corrContainer = document.getElementById('pu-corr-container');
  if (igEl && parseInt(igEl) < 37 && idade.totalM < 24) {
    const diasCorrigidos = idade.totalDias - ((40 - parseInt(igEl)) * 7);
    let txtCorr = diasCorrigidos < 0 ? 'Não atingiu termo' : (Math.floor(diasCorrigidos/30) === 0 ? (diasCorrigidos%30) + ' dias' : Math.floor(diasCorrigidos/30) + ' m e ' + (diasCorrigidos%30) + ' d');
    document.getElementById('pu-idade-corr-big').textContent = txtCorr;
    if(corrContainer)corrContainer.style.display = 'flex';
  } else if(corrContainer){ corrContainer.style.display = 'none'; }

  const mchatAlert=document.getElementById('pu-mchat-alert');if(mchatAlert)mchatAlert.style.display = (idade.totalM >= 18 && idade.totalM <= 24) ? 'flex' : 'none';

  // ── Auto-seleciona a consulta do mês conforme a idade atual ──
  autoSelecionaConsultaMes(idade.totalM, idade.dias);
}

function autoSelecionaConsultaMes(meses, dias) {
  // Mapeia a idade para a consulta mais adequada do calendário MS
  let val = null;
  const totalDias = meses * 30 + dias;
  if (totalDias <= 10)      val = '1sem';
  else if (meses <= 1)      val = '1m';
  else if (meses <= 2)      val = '2m';
  else if (meses <= 3)      val = '3m';
  else if (meses <= 4)      val = '4m';
  else if (meses <= 5)      val = '5m';
  else if (meses <= 6)      val = '6m';
  else if (meses <= 7)      val = '7m';
  else if (meses <= 8)      val = '8m';
  else if (meses <= 9)      val = '9m';
  else if (meses <= 10)     val = '10m';
  else if (meses <= 11)     val = '11m';

  if (!val) return; // acima de 11 meses não auto-seleciona

  // Marca o radio button correspondente
  const radio = document.querySelector(`input[name="pu-mes"][value="${val}"]`);
  if (radio && !radio.checked) {
    radio.checked = true;
    // Atualiza estilo visual do pill
    document.querySelectorAll('.rp').forEach(rp => {
      if (rp.querySelector('input[name="pu-mes"]')) rp.classList.remove('sg','sr','sa');
    });
    radio.closest('.rp')?.classList.add('sg');
    // Mostra o conteúdo da consulta
    showConsultaMes(val);
  }
}

function initChart() {
  const ctx = document.getElementById('growthChart');
  if (!ctx) return;
  if(!window.Chart){
    const status=document.getElementById('st-pu-peso');
    if(status)status.innerHTML='<span style="color:var(--amber)">Carregando gráfico sem bloquear a consulta...</span>';
    garantirChartJs().then(ok=>{if(ok)initChart();else if(status)status.innerHTML='<span style="color:var(--amber)">Gráfico bloqueado pela rede; os campos permanecem utilizáveis.</span>'});
    return;
  }
  if (growthChart) { growthChart.destroy(); growthChart = null; }
  growthChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        { label: 'Faixa superior aproximada', data: [], borderColor: '#eab308', fill: false, borderDash: [6,4], tension: 0.4, pointRadius: 0, borderWidth: 1.5, parsing: false },
        { label: 'Mediana',             data: [], borderColor: '#22c55e', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2, parsing: false },
        { label: 'Faixa inferior aproximada',  data: [], borderColor: '#ef4444', fill: false, borderDash: [6,4], tension: 0.4, pointRadius: 0, borderWidth: 1.5, parsing: false },
        { label: 'Criança',             data: [], backgroundColor: '#2563eb', borderColor: '#1d4ed8', pointRadius: 8, pointHoverRadius: 10, showLine: false, parsing: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true } },
        tooltip: { callbacks: { label: c => { const v = c.raw?.y; return c.dataset.label + ': ' + (v != null ? v : '—'); } } }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Idade (meses)', font: { size: 11 } }, ticks: { stepSize: 6 }, min: 0, max: 61 },
        y: { title: { display: true, text: 'Valor', font: { size: 11 } }, beginAtZero: false }
      }
    }
  });
}

function updateAntropometria() {
  const p   = parseFloat(document.getElementById('pu-peso').value);
  const a   = parseFloat(document.getElementById('pu-alt').value);
  const pc  = parseFloat(document.getElementById('pu-pc').value);
  const sexoRaw = document.getElementById('pu-sexo').value;
  const sexo = sexoRaw === 'Menina' ? 'girls' : (sexoRaw === 'Menino' ? 'boys' : null);
  const meses = idadePuericulturaGlobal.cronologica_meses;
  const temIdade = (typeof meses === 'number' && !isNaN(meses));

  // ── IMC — altura em cm (>10); avisa se digitado em metros ──
  if (p && a && a > 10) {
    document.getElementById('pu-imc').value = (p / Math.pow(a / 100, 2)).toFixed(1) + ' kg/m²';
  } else if (p && a && a <= 10) {
    document.getElementById('pu-imc').value = 'Altura em cm (ex: 78)';
  } else {
    document.getElementById('pu-imc').value = '—';
  }

  // ── Avaliação textual ──
  function evalVal(val, base, multMin, multMax) {
    if (!val || isNaN(val)) return '<span style="color:var(--tx3)">—</span>';
    if (val < base * multMin) return '<span style="color:var(--rose)">'+icrisk('dr')+' Abaixo / Insuficiente</span>';
    if (val > base * multMax) return '<span style="color:var(--amber)">'+icrisk('da')+' Acima / Elevado</span>';
    return '<span style="color:var(--green)">'+icrisk('dg')+' Adequado</span>';
  }

  if (sexo && temIdade) {
    let closestIdx = 0, minDiff = Infinity;
    WHO_LABELS.forEach((L, i) => { const d = Math.abs(L - meses); if (d < minDiff) { minDiff = d; closestIdx = i; } });
    const pMin = 0.78, pMax = 1.25, aMin = 0.94, aMax = 1.06, pcMin = 0.95, pcMax = 1.05;
    document.getElementById('st-pu-peso').innerHTML = evalVal(p,  WHO_DATA[sexo].peso[closestIdx], pMin, pMax);
    document.getElementById('st-pu-alt').innerHTML  = evalVal(a,  WHO_DATA[sexo].alt[closestIdx],  aMin, aMax);
    document.getElementById('st-pu-pc').innerHTML   = evalVal(pc, WHO_DATA[sexo].pc[closestIdx],  pcMin, pcMax);
  }

  // ── Gráfico ──
  if (!growthChart) return;
  if (!sexo) {
    growthChart.data.datasets.forEach(d => d.data = []);
    growthChart.update();
    return;
  }

  const type = document.getElementById('pu-chart-type').value;
  const baseData = WHO_DATA[sexo][type];

  let minM, maxM, yLabel;
  if (type === 'peso')     { minM = 0.78; maxM = 1.25; yLabel = 'Peso (kg)'; }
  else if (type === 'alt') { minM = 0.94; maxM = 1.06; yLabel = 'Estatura (cm)'; }
  else                     { minM = 0.95; maxM = 1.05; yLabel = 'Perím. Cefálico (cm)'; }

  growthChart.options.scales.y.title.text = yLabel;
  const allVals = baseData.flatMap(v => [v * minM, v * maxM]);
  growthChart.options.scales.y.min = Math.floor(Math.min(...allVals) * 0.97);
  growthChart.options.scales.y.max = Math.ceil(Math.max(...allVals) * 1.03);

  growthChart.data.datasets[0].data = WHO_LABELS.map((x, i) => ({ x, y: +(baseData[i] * maxM).toFixed(2) }));
  growthChart.data.datasets[1].data = WHO_LABELS.map((x, i) => ({ x, y: baseData[i] }));
  growthChart.data.datasets[2].data = WHO_LABELS.map((x, i) => ({ x, y: +(baseData[i] * minM).toFixed(2) }));

  const userVal = type === 'peso' ? p : (type === 'alt' ? a : pc);
  if (temIdade && !isNaN(userVal) && userVal > 0) {
    growthChart.data.datasets[3].data = [{ x: meses, y: userVal }];
  } else {
    growthChart.data.datasets[3].data = [];
  }

  growthChart.update();
}

// Inicializa a escuta passiva nas antigas funções manuais para não quebrar a lógica de IMC do Idoso/Gestante
function dataISOEmUTC(valor){
  const partes=String(valor||'').split('-').map(Number);
  if(partes.length!==3||partes.some(Number.isNaN))return null;
  return new Date(Date.UTC(partes[0],partes[1]-1,partes[2]));
}
function formatarDataUTC(data){
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC'}).format(data);
}
function calcularDppNaegeleUTC(dum){
  return new Date(Date.UTC(dum.getUTCFullYear()+1,dum.getUTCMonth()-3,dum.getUTCDate()+7));
}
function calcIG(prefix){
  const dumEl=document.getElementById(prefix+'-dum'), igEl=document.getElementById(prefix+'-ig'), banner=document.getElementById(prefix+'-ig-banner');
  const dum=dumEl?.value;
  if(!dum){if(igEl)igEl.value='';if(banner)banner.classList.remove('show');return;}
  const dDate=dataISOEmUTC(dum); if(!dDate)return;
  const referencia=document.getElementById(prefix+'-data')?.value||ESFClinical.localDate();
  const diffDias=ESFClinical.gestationalDays(dum,referencia);
  if(diffDias===null){igEl.value='Data inválida';return;}
  if(diffDias<0){igEl.value='DUM no futuro';if(banner)banner.classList.remove('show');return;}
  const semanas=Math.floor(diffDias/7), diasResto=diffDias%7;
  igEl.value=semanas+'s'+diasResto+'d ('+diffDias+' dias)';
  const dpp=calcularDppNaegeleUTC(dDate);
  const dppTexto=formatarDataUTC(dpp);
  document.getElementById(prefix+'-dpp').value=dppTexto;

  let trim=''; if(semanas<14)trim='1º Trimestre'; else if(semanas<28)trim='2º Trimestre'; else trim='3º Trimestre';
  document.getElementById(prefix+'-ig-banner').classList.add('show');
  document.getElementById(prefix+'-ig-big').textContent=semanas+'s'+diasResto+'d';
  document.getElementById(prefix+'-dpp-big').textContent=dppTexto;
  document.getElementById(prefix+'-trim-big').textContent=trim;
  document.getElementById(prefix+'-trim-badge').textContent=trim;
  if(prefix==='pna'){avaliarVacinacaoPna();avaliarMovimentosFetaisPna();}
}
function togglePb(head){head?.closest('.pb')?.classList.toggle('open');}
function calcIMC(p,h,outId){
  if(!p||!h||h===0)return; const imc=p/(h*h); let cls='';
  if(imc<18.5)cls='Abaixo do peso'; else if(imc<25)cls='Eutrófico'; else if(imc<30)cls='Sobrepeso'; else cls='Obesidade';
  document.getElementById(outId).value=imc.toFixed(1)+' kg/m² — '+cls;
}
function imcGest(){ calcIMC(parseFloat(document.getElementById('pna-peso').value),parseFloat(document.getElementById('pna-alt').value),'pna-imc'); avaliarProtocolosPna(); }
function idmoIdoso(){ calcIMC(parseFloat(document.getElementById('id-peso').value),parseFloat(document.getElementById('id-alt').value),'id-imc'); }

// ── CONSULTA DO MÊS — PUERICULTURA ──────────────────────────────
function showConsultaMes(val){
  document.querySelectorAll('[id^="cm-"]').forEach(el=>el.style.display='none');
  const el=document.getElementById('cm-'+val);
  if(!el)return;
  // Renderiza dinamicamente para meses 2-5 e 6-11 se ainda vazios
  if(el.innerHTML.trim()===''){
    if(['2m','3m','4m','5m'].includes(val)) el.innerHTML=buildMesPrecoce(val);
    else if(['6m','7m','8m','9m','10m','11m'].includes(val)) el.innerHTML=buildMesTardio(val);
  }
  el.querySelectorAll('input[type="radio"][name$="-risco"]').forEach(r=>r.closest('.card')?.remove());
  el.style.display='block';
}

function mesLabel(val){
  const map={'2m':'2º Mês','3m':'3º Mês','4m':'4º Mês','5m':'5º Mês','6m':'6º Mês','7m':'7º Mês','8m':'8º Mês','9m':'9º Mês','10m':'10º Mês','11m':'11º Mês'};
  return map[val]||val;
}

function buildMesPrecoce(v){
  // Meses 2 a 5: estrutura com sinais de alerta, exame ocular, cuidados, DNPM, laços, risco
  const trv = (v==='2m') ? `<div class="f" style="margin-top:8px"><label>Teste do Reflexo Vermelho (TRV)</label><div class="rpills"><label class="rp"><input type="radio" name="cm${v}-trv" value="normal"> Normal</label><label class="rp"><input type="radio" name="cm${v}-trv" value="alt"> Alterado</label></div></div>` : '';
  return `
  <div class="alert alert-i">${ic('clipboard')}<span>Consulta do ${mesLabel(v)}</span></div>
  <div class="card">
    <div class="ct"><span class="dot dg"></span>1. Medidas</div>
    <div class="g4">
      <div class="f"><label>PC (cm)</label><input type="number" step="0.1" id="cm${v}-pc"></div>
      <div class="f"><label>Peso (g)</label><input type="number" id="cm${v}-peso"></div>
      <div class="f"><label>Comprimento (cm)</label><input type="number" step="0.1" id="cm${v}-comp"></div>
      <div class="f"><label>IMC</label><input class="ro" readonly type="text" id="cm${v}-imc"></div>
    </div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot db"></span>2. Aleitamento / Alimentação</div>
    <div class="rpills" style="margin-bottom:10px">
      <label class="rp"><input type="radio" name="cm${v}-aleit" value="lme"> LME <small style="opacity:.65;font-size:.85em">(Leite Materno Exclusivo)</small></label>
      <label class="rp"><input type="radio" name="cm${v}-aleit" value="lm+la"> LM + LA <small style="opacity:.65;font-size:.85em">(Leite Materno + Leite Artificial)</small></label>
      <label class="rp"><input type="radio" name="cm${v}-aleit" value="la"> LA <small style="opacity:.65;font-size:.85em">(Leite Artificial Exclusivo)</small></label>
    </div>
    <div class="g2">
      <div class="f"><label>Dificuldade para amamentar?</label><select id="cm${v}-dif-aleit"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
      <div class="f"><label>Parou de amamentar?</label><select id="cm${v}-parou"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
    </div>
    <div class="f"><label>Motivo do desmame precoce (se houver)</label><textarea id="cm${v}-desmame" style="min-height:54px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot dr"></span>3. Sinais de Alerta</div>
    <div class="cklist">
      <label class="cki"><input type="checkbox"> Secreção nasal</label>
      <label class="cki"><input type="checkbox"> Cólica / Engasgos</label>
      <label class="cki"><input type="checkbox"> Diarreia / Constipação</label>
      <label class="cki"><input type="checkbox"> Vômitos / Golfadas</label>
      <label class="cki"><input type="checkbox"> Dificuldade para respirar (FR>60 ou <30)</label>
      <label class="cki"><input type="checkbox"> Febre (≥37,5°C)</label>
      <label class="cki"><input type="checkbox"> Hipotermia (<36,5°C)</label>
      <label class="cki"><input type="checkbox"> Convulsões ou movimentos anormais</label>
    </div>
    <div class="f" style="margin-top:8px"><label>Outros</label><textarea id="cm${v}-outros" style="min-height:54px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot db"></span>4. Exame Ocular</div>
    <div class="cklist">
      <label class="cki"><input type="checkbox"> Abertura ocular normal</label>
      <label class="cki"><input type="checkbox"> Pupilas normais</label>
      <label class="cki"><input type="checkbox"> Estrabismo</label>
      <label class="cki"><input type="checkbox"> Segue com o olhar</label>
    </div>
    ${trv}
  </div>
  <div class="card">
    <div class="ct"><span class="dot da"></span>5. Verificações e Cuidados Especiais</div>
    <div class="g2">
      <div class="f"><label>Vacinas de acordo com o calendário?</label><select id="cm${v}-vacinas"><option value="">—</option><option>Sim</option><option>Não</option></select></div>
      <div class="f"><label>Posição de sono</label><input type="text" id="cm${v}-sono-pos"></div>
      <div class="f"><label>Tempo de sono</label><input type="text" id="cm${v}-sono-tempo"></div>
      <div class="f"><label>Troca de posição durante o dia</label><input type="text" id="cm${v}-troca-pos"></div>
      <div class="f"><label>Intestino / cólicas</label><input type="text" id="cm${v}-intestino"></div>
      <div class="f"><label>Higiene e cuidados gerais</label><input type="text" id="cm${v}-higiene"></div>
      <div class="f"><label>Higiene bucal</label><input type="text" id="cm${v}-buco"></div>
      <div class="f"><label>Uso de bico/chupeta?</label><select id="cm${v}-chupeta"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
      <div class="f"><label>Uso de soro fisiológico nasal</label><input type="text" id="cm${v}-soro"></div>
      <div class="f"><label>Acidentes domésticos?</label><select id="cm${v}-acid"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
      <div class="f"><label>Sinais de violências/negligências?</label><select id="cm${v}-violen"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
    </div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot dg"></span>6. Desenvolvimento Neuropsicomotor (DNPM)</div>
    <div class="f"><label>Observação da interação mãe-filho(a)</label><textarea id="cm${v}-interacao" style="min-height:60px"></textarea></div>
    <div style="margin-top:10px">
      <div class="rpills">
        <label class="rp"><input type="radio" name="cm${v}-dnpm" value="adequado"> <span class="dot dot-lg dg"></span> Adequado para idade</label>
        <label class="rp"><input type="radio" name="cm${v}-dnpm" value="alerta"> <span class="dot dot-lg da"></span> Alerta para o desenvolvimento</label>
        <label class="rp"><input type="radio" name="cm${v}-dnpm" value="atraso"> <span class="dot dot-lg dr"></span> Provável atraso</label>
      </div>
    </div>
    <div class="f" style="margin-top:8px"><label>Observações</label><textarea id="cm${v}-dnpm-obs" style="min-height:54px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot da"></span>7. Laços de Afeto</div>
    <div class="f"><label>Rede de apoio, participação dos pais, depressão materna</label><textarea id="cm${v}-afeto" style="min-height:70px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot db"></span>8. Estratificação de Risco</div>
    <div class="rpills">
      <label class="rp"><input type="radio" name="cm${v}-risco" value="hab"> <span class="dot dot-lg dg"></span> Risco Habitual</label>
      <label class="rp"><input type="radio" name="cm${v}-risco" value="inter"> <span class="dot dot-lg da"></span> Risco Intermediário</label>
      <label class="rp"><input type="radio" name="cm${v}-risco" value="alto"> <span class="dot dot-lg dr"></span> Alto Risco</label>
    </div>
  </div>`;
}

function buildMesTardio(v){
  // Meses 6 ao 11: alimentos introduzidos, presença de sintomas, desenvolvimento, cuidados, laços, risco
  return `
  <div class="alert alert-i">${ic('clipboard')}<span>Consulta do ${mesLabel(v)}</span></div>
  <div class="card">
    <div class="ct"><span class="dot dg"></span>1. Medidas</div>
    <div class="g4">
      <div class="f"><label>PC (cm)</label><input type="number" step="0.1" id="cm${v}-pc"></div>
      <div class="f"><label>Peso (g)</label><input type="number" id="cm${v}-peso"></div>
      <div class="f"><label>Comprimento (cm)</label><input type="number" step="0.1" id="cm${v}-comp"></div>
      <div class="f"><label>IMC</label><input class="ro" readonly type="text" id="cm${v}-imc"></div>
    </div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot db"></span>2. Aleitamento / Alimentação</div>
    <div class="rpills" style="margin-bottom:10px">
      <label class="rp"><input type="radio" name="cm${v}-aleit" value="lm"> LM</label>
      <label class="rp"><input type="radio" name="cm${v}-aleit" value="la"> LA <small style="opacity:.65;font-size:.85em">(Leite Artificial Exclusivo)</small></label>
    </div>
    <div class="g2">
      <div class="f"><label>Parou de amamentar?</label><select id="cm${v}-parou"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
      <div class="f"><label>Com que idade parou?</label><input type="text" id="cm${v}-parou-idade"></div>
      <div class="f"><label>Alimentos introduzidos</label><input type="text" id="cm${v}-alimentos"></div>
      <div class="f"><label>Porções de fruta/dia</label><input type="text" id="cm${v}-frutas"></div>
      <div class="f"><label>Alimento industrializado?</label><select id="cm${v}-indust"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
      <div class="f"><label>Qual industrializado?</label><input type="text" id="cm${v}-indust-qual"></div>
    </div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot dr"></span>3. Presença de</div>
    <div class="cklist">
      <label class="cki"><input type="checkbox"> Diarreia</label>
      <label class="cki"><input type="checkbox"> Vômitos</label>
      <label class="cki"><input type="checkbox"> Febre (≥37,5°C)</label>
      <label class="cki"><input type="checkbox"> Sibilâncias</label>
      <label class="cki"><input type="checkbox"> Dificuldade para respirar (FR>50 ou <30)</label>
      <label class="cki"><input type="checkbox"> Convulsões ou tremores</label>
    </div>
    <div class="f" style="margin-top:8px"><label>Outros</label><textarea id="cm${v}-outros" style="min-height:54px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot dg"></span>4. Desenvolvimento Neuropsicomotor (DNPM)</div>
    <div class="rpills" style="margin-bottom:10px">
      <label class="rp"><input type="radio" name="cm${v}-dnpm" value="adequado"> <span class="dot dot-lg dg"></span> Adequado para idade</label>
      <label class="rp"><input type="radio" name="cm${v}-dnpm" value="alerta"> <span class="dot dot-lg da"></span> Alerta para o desenvolvimento</label>
      <label class="rp"><input type="radio" name="cm${v}-dnpm" value="atraso"> <span class="dot dot-lg dr"></span> Provável atraso</label>
    </div>
    <div class="f"><label>Observações</label><textarea id="cm${v}-dnpm-obs" style="min-height:54px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot da"></span>5. Cuidados Especiais</div>
    <div class="g2">
      <div class="f"><label>Vacinas de acordo com o calendário?</label><select id="cm${v}-vacinas"><option value="">—</option><option>Sim</option><option>Não</option></select></div>
      <div class="f"><label>Suplementação de Fe / Micronutrientes?</label><select id="cm${v}-ferro"><option value="">—</option><option>Sim</option><option>Não</option></select></div>
      <div class="f"><label>Suplementação de Vitamina A?</label><select id="cm${v}-vita"><option value="">—</option><option>Sim</option><option>Não</option></select></div>
      <div class="f"><label>Acompanhamento odontológico?</label><select id="cm${v}-odonto"><option value="">—</option><option>Sim</option><option>Não</option></select></div>
      <div class="f"><label>Acidentes domésticos?</label><select id="cm${v}-acid"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
      <div class="f"><label>Sinais de violências/negligências?</label><select id="cm${v}-violen"><option value="">—</option><option>Não</option><option>Sim</option></select></div>
    </div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot da"></span>6. Laços de Afeto</div>
    <div class="f"><label>Observações sobre vínculo, rede de apoio e participação dos pais</label><textarea id="cm${v}-afeto" style="min-height:70px"></textarea></div>
  </div>
  <div class="card">
    <div class="ct"><span class="dot db"></span>7. Estratificação de Risco</div>
    <div class="rpills">
      <label class="rp"><input type="radio" name="cm${v}-risco" value="hab"> <span class="dot dot-lg dg"></span> Risco Habitual</label>
      <label class="rp"><input type="radio" name="cm${v}-risco" value="inter"> <span class="dot dot-lg da"></span> Risco Intermediário</label>
      <label class="rp"><input type="radio" name="cm${v}-risco" value="alto"> <span class="dot dot-lg dr"></span> Alto Risco</label>
    </div>
  </div>`;
}

// ── ALERTAS GERAIS ──────────────────────────────
function protocoloTireoideGestacao(tipo){
  const hipo=tipo==='hipo';
  const titulo=hipo?'PROTOCOLO HIPOTIREOIDISMO NA GESTAÇÃO — Toledo/PR':'PROTOCOLO HIPERTIREOIDISMO NA GESTAÇÃO — Toledo/PR';
  const imediato=hipo
    ?'<li>Solicitar <strong>TSH + T4 livre</strong> na abertura do pré-natal.</li><li>Verificar uso, dose e adesão à levotiroxina prescrita.</li><li>Hipotireoidismo controlado permanece em risco habitual; caso refratário ou com comorbidades exige reavaliação da estratificação.</li>'
    :'<li>Solicitar/revisar <strong>TSH, T4 livre e TRAb</strong>.</li><li>Avaliar sintomas como taquicardia, tremores e perda de peso.</li><li>Hipertireoidismo na gestação exige avaliação médica e estratificação de alto risco conforme o fluxo municipal.</li>';
  const conduta=hipo
    ?'<strong>TSH &gt; 4:</strong> colher T4 livre e solicitar avaliação médica para definição/ajuste do tratamento. Meta do fluxo: TSH &lt; 2,5. Monitorar mensalmente até 20 semanas e, na meta, trimestralmente. O ajuste de levotiroxina depende de avaliação/prescrição médica.'
    :'<strong>TSH &lt; 0,1:</strong> avaliar T4 livre e TRAb. T4 livre normal sugere quadro subclínico, sem tratamento medicamentoso pelo fluxo. T4 livre elevado ou sintomas relevantes exigem avaliação médica/endocrinológica; medicações e doses devem ser definidas pelo profissional prescritor.';
  const sintomas=hipo?'fadiga, constipação, sonolência e ganho ponderal':'taquicardia, tremores, perda ponderal e intolerância ao calor';
  return `<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px"><strong style="color:var(--rose)">${ic('butterfly')} ${titulo}</strong><div style="font-size:11px;color:var(--tx2)">Fluxo municipal específico · Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div><div style="padding:12px 14px;background:var(--sf);display:grid;gap:10px"><div style="background:var(--rbg);border-left:3px solid var(--rose);padding:8px 12px"><strong>Fazer agora</strong><ul style="margin:4px 0 0 18px">${imediato}</ul></div><div style="background:var(--abg);border-left:3px solid #bf7210;padding:8px 12px"><strong>Conduta conforme condição</strong><div>${conduta}</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;padding:8px 12px"><strong>Monitoramento</strong><div>Reavaliar exames e sintomas de ${sintomas}. Registrar alterações e comunicar a equipe médica quando fora da meta ou com sinais clínicos relevantes.</div></div></div></div>`;
}
function checkPnaAnamneseAlerts() {
  const c = document.getElementById('pna-anamnese-alerts'); c.innerHTML='';
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="peprev"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px"><strong style="color:var(--rose)">PRÉ-ECLÂMPSIA GRAVE / ECLÂMPSIA ANTERIOR — Fluxograma Hipertensão Toledo</strong></div><div style="padding:12px 14px;background:var(--sf);font-size:13px;line-height:1.75"><strong>Fazer agora:</strong><ul style="margin:4px 0 8px 18px"><li>Encaminhar ao Ambulatório Materno-Infantil para cuidado compartilhado e manter acompanhamento na UBS.</li><li>Aferir PA em toda consulta e orientar procura imediata se cefaleia persistente, alteração visual, dor epigástrica/HCD, edema súbito, convulsão ou redução de movimentos fetais.</li><li>Avaliação médica para prescrever <strong>AAS 100 mg VO à noite + cálcio 1 g/dia</strong>, iniciando entre <strong>12 e 20 semanas</strong> e mantendo até <strong>36 semanas</strong>.</li><li>Se suspeita atual de pré-eclâmpsia: solicitar hemograma com plaquetas, enzimas hepáticas, ácido úrico, creatinina, urina 1 e proteína urinária de 24h ou relação proteína/creatinina.</li></ul><strong>Encaminhar imediatamente à maternidade:</strong> PA ≥ 160/110 mmHg, proteinúria com sinal de gravidade, plaquetas &lt; 100.000, creatinina &gt; 1,1 mg/dL ou 2x basal, transaminases 2x elevadas, edema agudo de pulmão, dor abdominal/HCD, alteração visual, cefaleia persistente ou convulsão.<div style="margin-top:7px;color:var(--tx3);font-size:11px">Fonte: Fluxograma 3 — Manejo da Hipertensão Arterial em Gestantes, SMS Toledo.</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="has"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('shield')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">PROTOCOLO HIPERTENSÃO NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Fluxograma Hipertensão · Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas Imediatas</div><ul style="font-size:13px;color:var(--tx);margin:0;padding-left:16px;line-height:1.8"><li><strong>Suspender IECA/BRA</strong> (captopril, enalapril, losartana) — contraindicados na gestação</li><li>Solicitar avaliação médica para ajuste: o fluxo municipal lista metildopa VO 750–3000 mg/dia em 2–4 tomadas, nifedipino retard VO 20–120 mg/dia em 1–3 tomadas ou hidralazina VO 50–100 mg/dia em 2–4 tomadas; utilizar dose máxima antes de acrescentar outro medicamento</li><li>Encaminhar para <strong>consulta médica / AMI</strong> para ajuste do anti-hipertensivo</li></ul></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--amber);margin-bottom:4px">${ic('pill')} Profilaxia de Pré-eclâmpsia (Protocolo Toledo)</div><div style="font-size:13px;color:var(--tx);line-height:1.8">HAS crônica = <strong>fator de alto risco</strong> → profilaxia de pré-eclâmpsia indicada pelo fluxo municipal:<ul style="margin:4px 0 0 0;padding-left:16px"><li>Avaliação médica no mesmo atendimento para prescrição: <strong>AAS 100 mg VO à noite + cálcio 1 g/dia</strong>. Iniciar entre <strong>12 e 20 semanas</strong> e manter até <strong>36 semanas</strong>. Aumentar ingestão de alimentos ricos em cálcio</li></ul></div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--blue);margin-bottom:4px">${ic('microscope')} Monitoramento Reforçado</div><ul style="font-size:13px;color:var(--tx);margin:0;padding-left:16px;line-height:1.8"><li>PA em toda consulta — PA ≥ 140/90 mmHg em duas ocasiões com mais de 4 horas confirma hipertensão. PA ≥ 150/100: avaliação médica para tratamento; meta municipal 120/80 &lt; PA &lt; 150/100. PA ≥ 160/110: emergência hipertensiva e encaminhamento à maternidade de referência</li><li>Proteinúria: solicitar proteína 24h ou relação prot/creatinina se suspeita de PE</li><li>Sinais de gravidade: cefaleia, alterações visuais, dor epigástrica, edema súbito → <strong>encaminhar imediatamente</strong></li><li>Estratificar como <strong>Alto Risco</strong> → cuidado compartilhado APS + Atenção Ambulatorial Especializada</li></ul></div><div style="background:var(--gbg);border-left:3px solid var(--green);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--green);margin-bottom:4px">${ic('clipboard')} Outros fatores de risco para PE (verificar acúmulo)</div><div style="font-size:12px;color:var(--tx2);line-height:1.7">Nulípara · Obesidade IMC ≥ 30 · Hist. familiar PE (mãe/irmã) · Idade ≥ 35 anos · Raça negra · PE prévia c/ desfecho adverso · DM · Doença renal · LES/SAAF · Gestação múltipla<br><em>Com ≥ 2 fatores moderados: também indicar AAS + Cálcio</em></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Fluxograma Hipertensão · Protocolo Pré-Natal Toledo 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="dm"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('blood')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">PROTOCOLO DIABETES NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Fluxograma Diabetes na Gestação · Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas Imediatas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Estratificar como <strong>Alto Risco</strong> → encaminhar ao AMI</li><li>Após diagnóstico de diabetes na gestação, <strong>não solicitar nova glicemia de jejum ou TOTG para rastreamento</strong></li><li>Orientar automonitoramento glicêmico: jejum, 1h pós café, 1h pós almoço, 1h pós jantar</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Metas Glicêmicas (Protocolo Toledo)</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Jejum: <strong>&lt; 95 mg/dL</strong></li><li>1h pós-refeição: <strong>&lt; 140 mg/dL</strong></li><li>Se não atingir com dieta em 2 semanas → acionar médico para insulinoterapia</li></ul></div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>USG morfológico e avaliação de crescimento fetal a cada 4 semanas (a cada 15 dias se PIG ou GIG)</li><li>Solicitar proteína urinária/creatinina se HAS associada</li><li>TOTG 75g de 6–8 semanas pós-parto para reclassificação</li></ul></div></div><div style="background:var(--gbg);border-left:3px solid var(--green);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--green);margin-bottom:4px">${ic('salad')} Orientações Gerais</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Não pular refeições · Atividade física: caminhadas diárias · Diário alimentar 1 semana antes da consulta c/ nutricionista · Registrar controle glicêmico e levar nas consultas</div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Fluxograma Diabetes na Gestação Toledo</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="tireoide"]')?.checked) c.innerHTML+=`<div class="card"><h3>Tireoide na gestação — fluxogramas municipais de 2024</h3><p>Solicitar/avaliar TSH, T4 livre, idade gestacional, peso e tratamento atual. A dose de levotiroxina depende do ramo e do peso; a escolha do antitireoidiano depende de T4 livre e idade gestacional. Não aplicar esquema fixo para toda gestante.</p><a href="https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2024-05/fluxogrma_hipo_2024.pdf#page=1" target="_blank" rel="noopener">Hipotireoidismo: fonte e ramos</a> · <a href="https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2024-05/fluxograma_hipertireoidismo_2024.pdf#page=1" target="_blank" rel="noopener">Hipertireoidismo: fonte e ramos</a><p>Prescrição e ajuste dependem da avaliação médica.</p></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="anemia"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('syringe')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">PROTOCOLO ANEMIA NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · Fluxograma Ferro 2024 · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Estratificação pelo Nível de Hb</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Hb &ge; 11 g/dL: <strong>sem anemia pelo ponto de corte do protocolo</strong> — manter acompanhamento</li><li>Hb ≥ 9 e &lt; 11 g/dL: <strong>anemia leve</strong> → Risco Habitual</li><li>Hb 8–8,9 g/dL: <strong>anemia moderada</strong> → Risco Intermediário</li><li>Hb &lt; 8 g/dL: <strong>anemia grave</strong> → Alto Risco e avaliação médica</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Suplementação (Protocolo Toledo)</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><strong>Prevenção:</strong> ferro elementar 40–60 mg/dia a partir de 12 semanas, 30–60 minutos antes do almoço.<br><strong>Hb &lt; 11:</strong> solicitar ferritina e saturação da transferrina. Anemia ferropriva com Hb &gt; 7: ferro elementar 120 mg/dia e hemograma em 30 dias. Se Hb subir &gt; 1 g/dL, manter até Hb 11; se subir &lt; 1 g/dL, considerar ferro EV e investigar causas. Intolerância oral, bariátrica prévia ou Hb &lt; 8: considerar EV. Hb &lt; 7, instabilidade ou iminência de parto: considerar transfusão. Manter sulfato ferroso até 3 meses pós-parto.</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Hemograma na abertura; se anemia ferropriva em tratamento oral, repetir em 30 dias; após ferro EV, repetir em 15 dias</li><li>Checar adesão ao sulfato ferroso em toda consulta</li><li>Anemia moderada: risco intermediário — possível promoção de parto via HOESP</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021 · Fluxograma Ferro 2024</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="ist"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('dna')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">PROTOCOLO IST / HIV NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo IST 2020 · Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Triagem Obrigatória</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Testes rápidos (TR) na abertura: <strong>HIV, Sífilis, Hepatite B e C</strong> — gestante E parceiro(a)</li><li>Repetir HIV e Sífilis no 3º trimestre (≥ 28 sem) e na admissão para o parto</li><li>Resultado reagente: seguir algoritmo confirmatório, notificação e fluxo municipal correspondente</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Condutas por IST</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><strong>Sífilis:</strong> Penicilina G Benzatina IM — ver Quadro 7 do protocolo (1ª, 2ª ou 3ª série conforme estágio) · Tratar parceiro · Registrar planilha municipal de sífilis<br><strong>HIV reagente/confirmado:</strong> seguir algoritmo confirmatório e articular CTA + pré-natal de alto risco conforme fluxo vigente<br><strong>Hepatite B:</strong> Solicitar imunoglobulina via CRIE (ficha com DPP e hospital) · RN recebe IGHAHB + vacina ao nascer</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Sífilis: VDRL mensal após tratamento para controle de cura</li><li>HIV: CD4 + carga viral conforme AMI; via de parto conforme avaliação da equipe especializada e protocolo vigente</li><li>Registrar na planilha municipal de IST/Sífilis da UBS</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo IST Toledo 2020 · Protocolo Pré-Natal 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="hiv"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('virus')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">PROTOCOLO HIV NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo IST 2020 · Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas Imediatas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Realizar TR HIV (se não realizado) → resultado positivo: notificar epidemiologia imediatamente</li><li>Encaminhar ao <strong>CTA</strong> para confirmação e início de TARV</li><li>Estratificar como <strong>Alto Risco</strong> → articular cuidado compartilhado com AMI conforme regulação</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia da Transmissão Vertical</div><div style="font-size:13px;color:var(--tx);line-height:1.8">TARV (via médica/CTA) — iniciar o mais precocemente possível, independente de CD4<br>Carga viral (CV) alvo: indetectável antes do parto<br>Via de parto definida pela equipe especializada conforme carga viral, idade gestacional e protocolo vigente</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento RN</div><div style="font-size:13px;color:var(--tx);line-height:1.8">O cuidado do recém-nascido exposto, a profilaxia, a alimentação e o calendário de exames devem seguir a prescrição e o protocolo vigente da equipe especializada; registrar no sistema de vigilância.</div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo IST Toledo 2020 · Protocolo Pré-Natal 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="nefro"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('kidney')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">NEFROPATIA / PROTEINÚRIA NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · Fluxograma Hipertensão · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas Imediatas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Nefropatia crônica = <strong>fator de alto risco para PE</strong> → avaliação médica no mesmo atendimento para prescrever AAS 100 mg VO à noite + cálcio 1 g/dia, iniciar entre 12–20 semanas e manter até 36 semanas</li><li>Estratificar como <strong>Alto Risco</strong> → encaminhar ao AMI conforme regulação</li><li>Suspender IECA/BRA se em uso (contraindicados na gestação)</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia de Pré-eclâmpsia</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Avaliação médica no mesmo atendimento para prescrição: <strong>AAS 100 mg VO à noite + cálcio 1 g/dia</strong>; iniciar entre <strong>12 e 20 semanas</strong> e manter até <strong>36 semanas</strong>; aumentar ingestão de alimentos ricos em cálcio</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Proteinúria: relação proteína/creatinina ou proteína 24h — trimestralmente ou se sintomas</li><li>Creatinina sérica e ureia no 1º trimestre e repetir conforme evolução</li><li>PA em toda consulta — meta PA &lt; 140x90 mmHg</li><li>Alertar para sinais de PE: cefaleia, edema súbito, escotomas, epigastralgia</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Fluxograma Hipertensão Toledo · Protocolo Pré-Natal 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="cardio"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('heart')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">CARDIOPATIA NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas Imediatas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Cardiopatia ativa = <strong>Alto Risco</strong> → encaminhar ao AMI e cardiologia conforme regulação</li><li>Manter cuidado compartilhado entre APS e atenção especializada</li><li>Revisar todos os medicamentos cardíacos: verificar segurança na gestação</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Atenção Medicamentosa</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Solicitar revisão médica imediata de IECA/BRA, estatinas, anticoagulantes e demais medicamentos potencialmente contraindicados<br>Heparina de baixo peso molecular pode ser indicada para profilaxia de tromboembolismo (via médica/AMI)<br>Betabloqueadores e anticoagulantes: confirmar indicação e escolha com cardiologia/AMI</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Ecocardiograma fetal entre 20–24 semanas</li><li>Monitoramento frequente de FC e PA em toda consulta</li><li>Sinais de descompensação (dispneia, edema agudo, cianose) → encaminhar urgência</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021 · Protocolo Cardiologia Municipal 2023</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="asma"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('lungs')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">ASMA / PNEUMOPATIA NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Asma não controlada = <strong>Risco Intermediário ou Alto Risco</strong> → encaminhar ao AMI</li><li>Manter tratamento de controle da asma durante a gestação — não suspender corticoide inalatório</li><li>Não suspender ou iniciar medicação respiratória sem avaliação; revisar o plano terapêutico com a equipe médica</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia de Agudizações</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Tratamento de manutenção: revisar e manter conforme prescrição médica; não alterar automaticamente pelo sistema<br>Evitar gatilhos (tabagismo passivo, ácaros, mofo, animais)<br>Vacina Influenza obrigatória (proteção adicional para pneumopatia)<br>Crise grave → corticoide sistêmico curto prazo é preferível ao risco da crise</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Avaliar frequência de crises e uso de resgate em toda consulta</li><li>Oximetria se sintomas respiratórios</li><li>Asma não controlada: risco de crescimento fetal restrito — solicitar USG para avaliação</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="utero"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('knife')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">CIRURGIA UTERINA ANTERIOR — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · Errata Regional 20ª RS · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Estratificar como <strong>Risco Intermediário ou Alto Risco</strong> conforme tipo de cirurgia</li><li>Cesárea anterior: avaliar cicatriz por USG (placenta prévia/acreta, deiscência) — solicitar USG morfológico detalhado</li><li>Miomectomia com abertura de cavidade: discutir via de parto com médico — risco de rotura uterina</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Atenção</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Vigilância para <strong>placenta prévia/acreta</strong> (mais comum após cesárea anterior)<br>Monitorar sinais de rotura uterina: dor abdominal intensa, alteração dos BCF<br>Via de parto a ser definida pelo médico/AMI conforme tipo de cirurgia anterior</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('clipboard')} Planejamento do Parto</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Cesárea eletiva (se indicada): seguir Fluxo de Cesárea HOESP Toledo<br>Preencher Plano de Parto e TCLE conforme protocolo regional 20ª RS<br>Vinculação ao HOESP desde a abertura do PN</div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021 · Fluxo Cesárea Toledo</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="obito"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('dove')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">ÓBITO FETAL ANTERIOR — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Óbito fetal anterior com desfecho adverso = <strong>fator de alto risco para PE</strong></li><li>Estratificar como <strong>Risco Intermediário ou Alto Risco</strong> → encaminhar ao AMI</li><li>Investigar causa do óbito anterior (trombofilia, doença autoimune, malformação) — avaliar com médico</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia (se causa identificada ou fator de risco associado)</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Avaliar indicação de AAS e, quando houver diagnóstico específico, anticoagulação exclusivamente pela equipe médica/AMI pela equipe responsável; o documento municipal fornecido não especifica um esquema único para esta situação<br>Suplementação rotineira: Sulfato ferroso + Ácido Fólico</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento Intensificado</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>USG de crescimento e Doppler fetal a partir de 24–28 semanas</li><li>Contagem de movimentos fetais: orientar a gestante sobre percepção e redução de MF</li><li>Suporte psicológico: encaminhar se necessário — luto gestacional anterior</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021 · Fluxograma Hipertensão Toledo</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="prem"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('baby')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">PREMATURIDADE ANTERIOR — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Prematuridade anterior = <strong>Risco Intermediário ou Alto Risco</strong> → encaminhar ao AMI</li><li>Investigar causa: incompetência istmo-cervical, infecção, malformação, doença materna</li><li>Cervicometria por USG transvaginal entre 16–24 semanas</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Colo curto: encaminhar para avaliação médica/AMI e definição de profilaxia pela equipe responsável; o documento municipal fornecido não especifica um esquema único para esta situação<br>Tratar infecções vaginais (vaginose bacteriana) precocemente<br>Suplementação rotineira: Sulfato ferroso + Ácido Fólico<br>Betametasona (maturação fetal): via AMI/hospital se ameaça de parto prematuro</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Cervicometria seriada (a cada 2 semanas) entre 16–28 semanas se colo curto</li><li>Orientar sinais de alerta: contrações regulares, perda de líquido, pressão pélvica</li><li>Colo &lt; 15 mm ou dilatação: encaminhar urgência ao HOESP</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021 · Estratificação de Risco Materno Infantil fornecida</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="geme"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('users')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">GEMELARIDADE ANTERIOR / GESTAÇÃO MÚLTIPLA — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · Fluxograma Hipertensão · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Gestação múltipla atual = <strong>fator de alto risco para PE</strong> → indicar avaliação médica para AAS 100 mg VO à noite + cálcio 1 g/dia, entre 12–20 e até 36 semanas</li><li>Estratificar como <strong>Alto Risco</strong> → encaminhar ao AMI conforme regulação</li><li>Confirmar corionicidade e amnionicidade com USG precoce (antes de 14 semanas)</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia de Pré-eclâmpsia</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Gestação múltipla atual: avaliação médica para prescrever <strong>AAS 100 mg VO à noite + cálcio 1 g/dia</strong>, iniciar entre <strong>12 e 20 semanas</strong> e manter até <strong>36 semanas</strong><br>Suplementação com Sulfato Ferroso (dobrar atenção para anemia — risco maior em gemelares)</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento Intensificado</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>USG quinzenal a partir de 24 semanas para avaliação de crescimento discordante</li><li>Vigilância para STFF (síndrome transfusão feto-feto) nos monocoriônicos</li><li>Via de parto e semana de interrupção definidas pelo AMI</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Fluxograma Hipertensão Toledo · Protocolo Pré-Natal 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="epilepsia"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('bolt')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">EPILEPSIA / NEUROLÓGICO NA GESTAÇÃO — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas Imediatas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Estratificar como <strong>Alto Risco</strong> → encaminhar ao AMI e neurologia conforme regulação</li><li>NÃO suspender antiepilépticos sem avaliação médica — risco de convulsão é maior que risco fetal</li><li>Valproato de sódio: altamente teratogênico — necessita reavaliação pelo neurologista urgente</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia de Defeitos do Tubo Neural</div><div style="font-size:13px;color:var(--tx);line-height:1.8">Avaliar necessidade de ácido fólico em dose diferenciada com a equipe médica conforme risco e protocolo vigente<br>Antiepilépticos de 1ª geração (fenitoína, carbamazepina, valproato) aumentam risco de DTN — a suplementação deve ser definida pela equipe médica conforme o risco<br>Vitamina K: discutir com médico se uso de carbamazepina/fenitoína</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>USG morfológico detalhado (20–22 sem) — maior risco de malformações</li><li>Monitorar frequência de crises em toda consulta</li><li>Orientar: sono regular, evitar álcool/privação de sono — gatilhos de crise</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="malf"]')?.checked) c.innerHTML+=`<div style="border:1px solid var(--rmid);border-radius:var(--rl);overflow:hidden;margin-bottom:8px;"><div style="background:var(--rbg);border-bottom:1px solid var(--rmid);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px">${ic('dna')}</span><div><div style="font-weight:700;color:var(--rose);font-size:13px">MALFORMAÇÃO FETAL ANTERIOR — Toledo/PR</div><div style="font-size:11px;color:var(--tx2)">Protocolo Pré-Natal 4ª Ed. · SMS Toledo</div></div></div><div style="padding:12px 14px;background:var(--sf);display:flex;flex-direction:column;gap:10px;"><div style="background:var(--rbg);border-left:3px solid var(--rose);border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--rose);margin-bottom:4px">${ic('warning')} Condutas</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Estratificar como <strong>Risco Intermediário ou Alto Risco</strong> → encaminhar ao AMI</li><li>Investigar causa da malformação anterior: genética, ambiental, medicamentosa, infecciosa</li><li>Encaminhar para aconselhamento genético se indicado</li></ul></div></div><div style="background:var(--abg);border-left:3px solid #bf7210;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#bf7210;margin-bottom:4px">${ic('pill')} Profilaxia (conforme causa)</div><div style="font-size:13px;color:var(--tx);line-height:1.8">História de defeito do tubo neural: solicitar avaliação médica para definir suplementação pela equipe responsável; o documento municipal fornecido não especifica um esquema único para esta situação<br>Evitar teratógenos: álcool, tabaco, medicamentos sem avaliação médica<br>Controle rigoroso de doenças maternas associadas (DM, epilepsia, HAS)</div></div><div style="background:var(--bbg);border-left:3px solid #5080c0;border-radius:0 6px 6px 0;padding:8px 12px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#5080c0;margin-bottom:4px">${ic('microscope')} Monitoramento</div><div style="font-size:13px;color:var(--tx);line-height:1.8"><ul style='margin:0;padding-left:16px'><li>Avaliar indicação e período de USG morfológico detalhado pela equipe responsável; o documento municipal fornecido não especifica um esquema único para esta situação</li><li>Ecocardiograma fetal se malformação cardíaca anterior</li><li>Considerar amniocentese/análise cromossômica se indicado pelo médico/AMI</li></ul></div></div><div style="font-size:11px;color:var(--tx3);text-align:right">Ref: Protocolo Pré-Natal Toledo 4ª Ed. 2021 · Estratificação de Risco Materno Infantil fornecida</div></div></div>`;
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="hipotireoide"]')?.checked)c.innerHTML+=protocoloTireoideGestacao('hipo');
  if(document.querySelector('#pna-comorbidades-list input[data-comorb="hipertireoide"]')?.checked)c.innerHTML+=protocoloTireoideGestacao('hiper');
  atualizarAcaoGlicosimetroSoapPN();
}
function atualizarAcaoGlicosimetroSoapPN(){
  const acao=document.getElementById('pna-dm-soap-action'),dm=document.querySelector('#pna-comorbidades-list input[data-comorb="dm"]')?.checked;
  if(acao)acao.style.display=dm?'flex':'none';
}
function semanasPna(){return parseInt((document.getElementById('pna-ig')?.value||'').match(/^(\d+)s/)?.[1]||'0')}
function avaliarMovimentosFetaisPna(){
  const out=document.getElementById('pna-mf-conduta');if(!out)return;
  const mf=document.getElementById('pna-mf')?.value||'',ig=semanasPna();out.innerHTML='';
  if(/reduzidos|Ausentes após/.test(mf)){
    out.innerHTML=`<div class="alert alert-e"><div><strong>Redução/ausência de movimentos fetais:</strong> verificar BCF e sinais vitais e encaminhar para avaliação obstétrica imediata. <strong>Não aguardar mobilograma domiciliar</strong> quando há redução em relação ao padrão habitual ou ausência após movimentos previamente percebidos.</div></div>`;
  }else if(ig>=28&&/Presentes/.test(mf)){
    out.innerHTML=`<div class="alert alert-i"><div><strong>Mobilograma / percepção fetal:</strong> orientar a gestante a observar diariamente o padrão habitual dos movimentos. Se perceber redução ou ausência, procurar imediatamente a maternidade/serviço de referência; a contagem domiciliar não deve atrasar a avaliação.</div></div>`;
  }else if(ig>=18&&!mf){
    out.innerHTML=`<div class="alert alert-w"><div><strong>A partir de 18–20 semanas:</strong> perguntar ativamente sobre percepção dos movimentos fetais e orientar sinais de alerta.</div></div>`;
  }
}
function avaliarVacinacaoPna(){
  const out=document.getElementById('pna-vac-conduta');if(!out)return;const ig=semanasPna(),idade=parseInt((document.getElementById('pna-idade')?.value||'').match(/\d+/)?.[0]||'0');
  const dt=document.getElementById('vac-dt-hist')?.value||'',dtpa=document.getElementById('vac-dtpa-status')?.value||'',hep=document.getElementById('vac-hepb-hist')?.value||'',vsr=document.getElementById('vac-vsr-status')?.value||'';
  const itens=[];
  if(dt==='0')itens.push('<strong>dT/dTpa:</strong> iniciar o mais precocemente possível esquema de 3 doses, intervalo preferencial de 60 dias e mínimo de 30 dias; pelo menos uma dose deve ser dTpa.');
  if(dt==='1'||dt==='2')itens.push(`<strong>dT/dTpa:</strong> completar as ${dt==='1'?'2 doses restantes':'1 dose restante'} o mais precocemente possível, respeitando intervalo preferencial de 60 dias e mínimo de 30 dias; garantir uma dose de dTpa nesta gestação.`);
  if(/^3/.test(dt))itens.push('<strong>dT/dTpa:</strong> esquema básico completo; garantir 1 dose de dTpa em cada gestação.');
  if(dt==='semcomprovante')itens.push(`<strong>dT:</strong> esgotar busca do histórico. Sem comprovação, avaliar/iniciar esquema conforme sala de vacina e protocolo vigente.`);
  if(dtpa==='nao'&&ig>=27&&ig<=36)itens.push('<strong>dTpa pendente:</strong> encaminhar agora à sala de vacina. Janela preferencial municipal: 27–36 semanas; uma dose em cada gestação.');
  else if(dtpa==='nao'&&ig>=20)itens.push('<strong>dTpa:</strong> orientar desde já. Programar para 27–36 semanas; em local de difícil acesso, o protocolo municipal permite a partir da 20ª semana.');
  if(hep==='naovacinada')itens.push('<strong>Hepatite B:</strong> iniciar 3 doses, esquema 0, 1 e 6 meses, independentemente da idade gestacional.');
  if(hep==='incompleto')itens.push('<strong>Hepatite B:</strong> completar somente as doses faltantes do esquema iniciado.');
  if(hep==='semcomprovante')itens.push(`<strong>Hepatite B sem comprovante:</strong> esgotar busca. ${idade&&idade<25?'Se menor de 25 anos, o protocolo municipal orienta solicitar Anti-HBs para avaliar imunidade.':'Se maior de 25 anos, o protocolo municipal orienta esquema de 3 doses (0, 1 e 6 meses).'}`);
  if(ig>=28&&vsr!=='sim')itens.push('<strong>VSR materna:</strong> a partir de 28 semanas, uma dose em cada gestação conforme o calendário vigente do PNI. Encaminhar à sala de vacina e verificar disponibilidade.');
  if(!itens.length)itens.push('Preencher o histórico vacinal para gerar as orientações conforme protocolo.');
  out.innerHTML=`<div class="alert alert-i"><div><strong>Conduta vacinal sugerida</strong><ul style="margin:6px 0 0 18px">${itens.map(x=>`<li>${x}</li>`).join('')}</ul><div style="margin-top:6px;font-size:11px;color:var(--tx3)">Fontes: Protocolo de Pré-Natal de Toledo, 4ª edição, e Calendário Nacional de Vacinação/PNI vigente.</div></div></div>`;
}
// lerPA canônica (única no app): extrai [sistólica, diastólica] com qualquer separador não-dígito.
// Definida cedo (mesmo bloco de avaliarProtocolosPna) para estar disponível no boot.
function lerPA(v){const m=String(v||'').match(/(\d{2,3})\D+(\d{2,3})/);return m?[Number(m[1]),Number(m[2])]:[0,0]}
function adicionarCriterioRisco(lista,nivel,motivo){
  if(motivo&&!lista.some(x=>x.nivel===nivel&&x.motivo===motivo))lista.push({nivel,motivo});
}
function avaliarProtocolosPna(){
  const criterios=[];
  const idade=parseInt((document.getElementById('pna-idade')?.value||'').match(/\d+/)?.[0]||'');
  const raca=document.getElementById('pna-raca')?.value||'';
  const escol=document.getElementById('pna-escol')?.value||'';
  const imig=(document.getElementById('pna-imig')?.value||'').trim();
  const abortos=Number(document.getElementById('pna-a')?.value||0);
  const cesareas=Number(document.getElementById('pna-ces')?.value||0);
  const partos=ESFClinical.number(document.getElementById('pna-p')?.value);
  const imc=parseFloat(document.getElementById('pna-imc')?.value||'');
  const [pas,pad]=lerPA(document.getElementById('pna-pa')?.value);
  const queixas=(document.getElementById('pna-queixas')?.value||'').toLowerCase();
  const comorb=id=>document.querySelector(`#pna-comorbidades-list input[data-comorb="${id}"]`)?.checked;
  const tr=dadosLaudoTR('tr-p',document.getElementById('tr-principal-condicao')?.value==='gestante');
  if(tr.hiv1==='REAGENTE')adicionarCriterioRisco(criterios,'alto','Teste rápido HIV reagente');
  if(tr.hepb==='REAGENTE'||tr.hepc==='REAGENTE')adicionarCriterioRisco(criterios,'alto','Teste rápido para hepatite viral reagente');
  if(tr.sif==='REAGENTE')adicionarCriterioRisco(criterios,'habitual','Teste rápido para sífilis reagente — ativar tratamento e seguimento');
  if(idade<15||idade>40)adicionarCriterioRisco(criterios,'inter',`Idade ${idade} anos (<15 ou >40)`);
  if(escol==='Sem escolaridade')adicionarCriterioRisco(criterios,'inter','Baixa escolaridade');
  if(/Preta|Parda/.test(raca))adicionarCriterioRisco(criterios,'inter',`Gestante negra (${raca.toLowerCase()})`);
  if(imig&&!/brasil/i.test(imig))adicionarCriterioRisco(criterios,'inter','Gestante migrante');
  if(abortos>=3)adicionarCriterioRisco(criterios,'alto','Três ou mais abortos espontâneos');
  else if(abortos>0)adicionarCriterioRisco(criterios,'habitual','Até dois abortos precoces informados; confirmar idade gestacional');
  if(cesareas>=3)adicionarCriterioRisco(criterios,'alto','Histórico de três ou mais cesáreas');
  if(imc>=40)adicionarCriterioRisco(criterios,'alto',`Obesidade mórbida (IMC ${imc.toFixed(1)})`);
  else if(imc>=30)adicionarCriterioRisco(criterios,'habitual',`Obesidade grau I/II (IMC ${imc.toFixed(1)})`);
  [['has','Hipertensão arterial crônica'],['dm','Diabetes mellitus prévio'],['cardio','Cardiopatia em acompanhamento'],['nefro','Nefropatia com repercussão'],['epilepsia','Doença neurológica / epilepsia'],['utero','Cirurgia uterina prévia'],['hiv','HIV'],['hipertireoide','Hipertireoidismo']].forEach(([id,m])=>{if(comorb(id))adicionarCriterioRisco(criterios,'alto',m);});
  if(comorb('hipotireoide'))adicionarCriterioRisco(criterios,'habitual','Hipotireoidismo; encaminhar ao alto risco se refratário ou com comorbidades');
  if(comorb('peprev'))adicionarCriterioRisco(criterios,'inter','Pré-eclâmpsia grave/eclâmpsia anterior');
  if(comorb('obito'))adicionarCriterioRisco(criterios,'inter','Óbito fetal anterior');
  if(pas>=140||pad>=90)adicionarCriterioRisco(criterios,'alto',`Suspeita de síndrome hipertensiva pela PA ${pas}/${pad} mmHg; confirmar e avaliar`);
  document.querySelectorAll('.pna-risco-item:checked').forEach(el=>adicionarCriterioRisco(criterios,el.dataset.risco,el.closest('label')?.textContent.trim()));
  const temDados=Number.isFinite(idade)||Number.isFinite(imc)||pas>0||criterios.length>0||document.querySelector('#pna-comorbidades-list input:checked');
  if(!temDados){
    const res=document.getElementById('pna-risco-automatico'), motivos=document.getElementById('pna-risco-motivos'), conduta=document.getElementById('pna-risco-conduta');
    if(res){res.textContent='Preencha os dados da gestante para calcular o risco.';res.style.background='var(--sf2)';res.style.borderColor='var(--bd)';res.style.color='var(--tx)';}
    if(motivos)motivos.innerHTML='';if(conduta)conduta.innerHTML='';
    document.querySelectorAll('input[name="risco-pna"]').forEach(el=>el.checked=false);
    return {nivel:'nao-classificado',label:'NÃO CLASSIFICADO',criterios:[],conduta:''};
  }
  const nivel=criterios.some(x=>x.nivel==='alto')?'alto':criterios.some(x=>x.nivel==='inter')?'inter':'habitual';
  const labels={habitual:'RISCO HABITUAL',inter:'RISCO INTERMEDIÁRIO',alto:'ALTO RISCO'};
  const cores={habitual:['var(--gbg)','var(--gmid)','var(--green)'],inter:['var(--abg)','var(--amid)','var(--amber)'],alto:['var(--rbg)','var(--rmid)','var(--rose)']};
  const res=document.getElementById('pna-risco-automatico'), motivos=document.getElementById('pna-risco-motivos'), conduta=document.getElementById('pna-risco-conduta');
  if(res){res.textContent=labels[nivel];res.style.background=cores[nivel][0];res.style.borderColor=cores[nivel][1];res.style.color=cores[nivel][2];}
  if(motivos)motivos.innerHTML=criterios.length?`<div class="alert alert-i"><div><strong>Critérios identificados</strong><ul style="margin:5px 0 0 18px">${criterios.map(x=>`<li>${x.motivo} — ${labels[x.nivel]}</li>`).join('')}</ul></div></div>`:'<div class="alert alert-s">Nenhum critério de risco intermediário ou alto identificado com os dados preenchidos.</div>';
  const radio=document.querySelector(`input[name="risco-pna"][value="${nivel}"]`);if(radio)radio.checked=true;
  const moderadosPE=[partos===0,imc>=30,idade>=35,/Preta|Parda/.test(raca),!!(comorb('obito')||comorb('prem')||comorb('pehist')),comorb('pefamilia')].filter(Boolean).length;
  const altoPE=comorb('has')||comorb('dm')||comorb('nefro')||comorb('peprev')||comorb('autoimune')||Array.from(document.querySelectorAll('#pna-risco-alto input:checked')).some(el=>el.closest('label')?.textContent.includes('Gestação gemelar'));
  const profilaxia=altoPE||moderadosPE>=2?'<br><strong>Prevenção de pré-eclâmpsia:</strong> há 1 fator de alto risco ou ≥2 fatores moderados. Avaliação médica para prescrever <strong>AAS 100 mg VO à noite + cálcio 1 g/dia</strong>, iniciar entre <strong>12 e 20 semanas</strong> e manter até <strong>36 semanas</strong>. Aumentar ingestão alimentar de cálcio.':'';
  if(conduta)conduta.innerHTML=nivel==='alto'?`<div class="alert alert-e"><div><strong>Conduta:</strong> cuidado compartilhado APS + Atenção Ambulatorial Especializada/alto risco. Encaminhar ao Ambulatório Materno-Infantil e manter acompanhamento na UBS.${profilaxia}</div></div>`:nivel==='inter'?`<div class="alert alert-w"><div><strong>Conduta:</strong> cuidado compartilhado APS + Atenção Ambulatorial Especializada. Realizar encaminhamento e plano de cuidados.${profilaxia}</div></div>`:`<div class="alert alert-s"><div><strong>Conduta:</strong> acompanhamento na APS, com reestratificação em todos os atendimentos.${profilaxia}</div></div>`;
  if(conduta)conduta.innerHTML+='<div style="margin-top:6px;text-align:right;font-size:11px;color:var(--tx3)">Fonte: Estratificação de risco — Linha de cuidado Materno Infantil + Protocolo Pré-natal Toledo, 4ª edição.</div>';
  const vitais=document.getElementById('pna-vitais-alerts');
  if(vitais){
    vitais.innerHTML='';
    const sintomasPE=/cefale|escotom|visual|epigastr|hipocôndrio|hipocondrio|edema.*(face|mão|mao)/.test(queixas);
    if(pas>=160||pad>=110)vitais.innerHTML+='<div class="alert alert-e"><strong>PA grave:</strong> repetir para confirmação sem retardar assistência e encaminhar imediatamente para urgência obstétrica.</div>';
    else if(pas>=140||pad>=90)vitais.innerHTML+='<div class="alert alert-e"><strong>PA alterada:</strong> repouso, repetir aferição e avaliação médica no mesmo atendimento para investigação de síndrome hipertensiva.</div>';
    if(sintomasPE)vitais.innerHTML+='<div class="alert alert-e"><strong>Possíveis sinais de gravidade de pré-eclâmpsia:</strong> aferir PA e realizar avaliação médica/obstétrica imediata.</div>';
    if(/sangramento|perda de líquido|perda de liquido|contraç|contrac/.test(queixas))vitais.innerHTML+='<div class="alert alert-e"><strong>Sinal de alerta obstétrico informado:</strong> realizar avaliação obstétrica imediata conforme quadro clínico.</div>';
  }
  checkPnaQueixas();avaliarMovimentosFetaisPna();avaliarVacinacaoPna();
  window.ultimoRiscoPna={nivel,label:labels[nivel],criterios,conduta:conduta?.innerText||''};
  return window.ultimoRiscoPna;
}
document.addEventListener('change',e=>{if(e.target.closest?.('#pg-pn-abertura'))avaliarProtocolosPna();});
document.addEventListener('input',e=>{if(e.target.closest?.('#pg-pn-abertura')&&e.target.id!=='pna-pa')avaliarProtocolosPna();});
setTimeout(()=>avaliarProtocolosPna(),0);

function checkPnaQueixas() {
  const c=document.getElementById('pna-queixas-condutas');if(!c)return '';c.innerHTML='';
  const marcadas=Array.from(document.querySelectorAll('#clinical-guide-pna-anamnesis .clinical-chip.selected')).map(e=>e.dataset.text).filter(Boolean);
  const livre=(document.getElementById('pna-queixas')?.value||'').toLowerCase();
  const tem=(nome,re)=>marcadas.includes(nome)||(re&&re.test(livre));
  const add=(classe,titulo,texto)=>{
    const frases=texto.split(/\.\s+/).map(x=>x.trim().replace(/\.$/,'')).filter(Boolean);
    const grupo=(tipo,filtro,rotulo)=>{const itens=frases.filter(filtro);return itens.length?`<div class="complaint-action ${tipo}"><strong>${rotulo}</strong>${itens.map(x=>`<div>• ${x}.</div>`).join('')}</div>`:'';};
    const urg=f=>/imediat|encaminhar|exige|instabilidade|progressiva|sinais associados|persistência|recorrência|vômitos contínuos|após 36 semanas/.test(f.toLowerCase());
    const med=f=>/\d+\s?mg|escolha|prescri|medica|antibiograma|nitrofuranto|cefalexina|amoxicilina|hidróxido|paracetamol|dipirona|bromoprida|metoclopramida|ondansetrona/.test(f.toLowerCase());
    const orient=f=>/orientar|repouso|hidrata|aliment|calor local|massagem|fibras|higiene|banho|movimentos lentos/.test(f.toLowerCase());
    c.innerHTML+=`<div class="complaint-protocol"><div class="complaint-protocol-head">${titulo}</div><div class="complaint-protocol-grid">${grupo('now',urg,'Avaliar / encaminhar')}${grupo('guide',f=>!urg(f)&&orient(f),'Orientações')}${grupo('med',f=>!urg(f)&&med(f),'Medicação prevista no protocolo')}${grupo('',f=>!urg(f)&&!orient(f)&&!med(f),'Avaliação clínica')}</div></div>`;
  };
  if(tem('Náuseas / vômitos',/náuse|nause|vômit|vomit/))add('alert-w','Náuseas/vômitos — Protocolo Pré-Natal Toledo','avaliar hidratação, perda de peso, alterações urinárias/metabólicas e hiperêmese. Orientar refeições pequenas a cada 3 horas, alimento leve ao acordar e antes de dormir, evitar jejum, gorduras, temperos, doces e odores fortes, e manter hidratação. Se medidas falharem e riscos forem afastados: avaliação profissional para bromoprida 10 mg 8/8h; segunda escolha metoclopramida 10 mg 8/8h; terceira escolha ondansetrona 8 mg 8/8h, meia hora antes das refeições. Vômitos contínuos/intensos, desidratação ou perda de peso exigem avaliação médica.');
  if(tem('Cefaleia',/cefale|dor de cabeça/))add('alert-w','Cefaleia — Protocolo Toledo','aferir e repetir PA, afastar sinais de pré-eclâmpsia e investigar outras causas. Orientar repouso, hidratação e alimentação. Se recorrente, solicitar avaliação médica; com riscos afastados e persistência, avaliação profissional para paracetamol 500 mg 6/6h se dor ou, como segunda escolha, dipirona 500 mg 6/6h.');
  if(tem('Tontura / desmaio / fraqueza',/tontur|desmai|fraqueza/))add('alert-w','Tontura/desmaio/fraqueza — Protocolo Toledo','aferir PA e avaliar anemia, hipoglicemia e instabilidade. Colocar em decúbito lateral esquerdo, orientar movimentos lentos, ambiente ventilado, alimentação fracionada e hidratação. Persistência, recorrência ou instabilidade requer avaliação médica.');
  if(tem('Pirose / azia',/pirose|azia/))add('alert-w','Pirose/azia — Protocolo Toledo','aferir PA se houver dor epigástrica. Orientar alimentação fracionada, não deitar após comer, elevar cabeceira e evitar frituras, café, doces, gordurosos e picantes. Sem melhora: avaliação profissional para hidróxido de alumínio 10–15 mL após refeições e ao deitar.');
  if(tem('Dor abdominal / cólicas',/dor abdominal|cólic|colic/))add('alert-e','Dor abdominal/cólicas — avaliar agora','verificar febre, sinais peritoneais, sangramento, ITU, dinâmica uterina e contrações. Dor progressiva, sinais de alerta ou suspeita de trabalho de parto prematuro exigem avaliação obstétrica imediata.');
  if(tem('Dor lombar / pélvica',/dor lombar|dor pélvic|dor pelvic/))add('alert-w','Dor lombar/pélvica — Protocolo Toledo','avaliar febre, sintomas urinários, contrações, déficit neurológico e trauma. Orientar postura, calor local, massagens e alongamento; sinais associados exigem avaliação médica/obstétrica.');
  if(tem('Cãibras',/cãibra|caibra/))add('alert-i','Cãibras — Protocolo Toledo','orientar calor local, massagem, extensão/flexão e alimentos ricos em potássio. Dor unilateral persistente, edema ou calor exige avaliação vascular.');
  if(tem('Constipação / flatulência',/constipa|flatul/))add('alert-w','Constipação/flatulência — Protocolo Toledo','orientar fibras, frutas, verduras, grãos integrais, hidratação, rotina de evacuação e atividade física tolerada. Sem melhora, solicitar avaliação médica antes de tratamento farmacológico.');
  if(tem('Hemorroidas',/hemorroid/))add('alert-w','Hemorroidas — Protocolo Toledo','avaliar dor, endurecimento e sangramento retal. Orientar fibras, hidratação, higiene e banho de assento morno. Alteração importante requer avaliação médica.');
  if(tem('Dispneia',/dispne|falta de ar/))add('alert-e','Dispneia — Protocolo Toledo','realizar ausculta cardíaca e pulmonar, sinais vitais e oximetria quando disponível. Dor torácica, início súbito, hipoxemia ou desconforto importante exige avaliação médica imediata.');
  if(tem('Disúria / ITU',/disúria|disuria|itu|ardência.*urina/))add('alert-e','Disúria/ITU — Protocolo Toledo','avaliar febre, hematúria e dor lombar; solicitar EAS e urocultura com antibiograma e encaminhar para consulta médica. Após urocultura positiva, conforme prescrição e antibiograma: 1ª escolha nitrofurantoína 100 mg 6/6h por 7 dias; 2ª cefalexina 500 mg 6/6h por 7 dias; 3ª amoxicilina + clavulanato 500+125 mg 8/8h por 7 dias. Após 36 semanas, usar apenas cefalexina. Programar urocultura de controle.');
  if(tem('Sangramento vaginal',/sangramento|sangue vaginal/))add('alert-e','Sangramento vaginal','verificar sinais vitais, intensidade, dor e estabilidade; encaminhar imediatamente à maternidade de referência para avaliação obstétrica.');
  if(tem('Perda de líquido',/perda de líquido|perda de liquido|líquido amniótico|liquido amniotico/))add('alert-e','Suspeita de perda de líquido amniótico','verificar BCF, movimentos fetais e sinais vitais; encaminhar imediatamente para avaliação obstétrica.');
  if(tem('Corrimento vaginal alterado',/corrimento/))add('alert-w','Corrimento vaginal alterado — Protocolo Toledo','caracterizar cor, odor, prurido, ardência, dor e sangramento pós-coito; realizar avaliação/exame especular e tratamento específico após avaliação profissional.');
  if(tem('Diminuição de MF',/diminui.*movimento|ausência.*movimento|ausencia.*movimento/))add('alert-e','Movimentos fetais reduzidos/ausentes','realizar avaliação obstétrica imediata; não aguardar mobilograma domiciliar quando houver redução ou ausência percebida.');
  if(tem('Contrações antes de 37s',/contraç|contrac/))add('alert-e','Suspeita de trabalho de parto prematuro','avaliar dinâmica uterina e encaminhar para avaliação hospitalar imediata.');
  if(tem('Alterações visuais / escotomas',/visual|escotoma/)||tem('Dor epigástrica / hipocôndrio direito',/epigastr|hipocôndrio|hipocondrio/)||tem('Edema de face/mãos',/edema.*(face|mão|mao)/))add('alert-e','Possíveis sinais de gravidade de pré-eclâmpsia','aferir e repetir PA e realizar avaliação médica/obstétrica imediata.');
  return c.innerText.trim();
}

function checkPncQueixas() {
  const c = document.getElementById('pnc-queixas-alerts'); if(!c)return; c.innerHTML='';
  const q = Array.from(document.querySelectorAll('#pnc-queixas-clin input:checked, #pnc-queixas-gin input:checked')).map(e=>e.closest('.cki').textContent.trim());
  const mf=document.getElementById('pnc-mf')?.value||'';
  const perdaTipo=document.getElementById('pnc-perda-tipo')?.value||'', perdaQtd=document.getElementById('pnc-perda-qtd')?.value||'';
  const add=(classe,titulo,texto)=>c.innerHTML+=`<div class="alert ${classe}"><strong>${titulo}:</strong> ${texto}</div>`;
  if(q.includes('Náuseas / vômitos')) add('alert-w','Náuseas/vômitos — Protocolo Toledo','avaliar vômitos contínuos/intensos, desidratação, perda de peso e alterações urinárias/metabólicas. Orientar refeições pequenas a cada 3 horas, alimento leve ao acordar e antes de dormir, evitar jejum, gorduras, temperos, doces e odores fortes, e manter hidratação. Se medidas falharem e riscos forem afastados, realizar avaliação profissional para prescrição escalonada: bromoprida 10 mg 8/8h; segunda escolha metoclopramida 10 mg 8/8h; terceira escolha ondansetrona 8 mg 8/8h, meia hora antes das refeições. Suspeita de hiperêmese gravídica exige avaliação médica.');
  if(q.includes('Cefaleia')) add('alert-w','Cefaleia — Protocolo Toledo','aferir e repetir PA, afastar sinais de pré-eclâmpsia e investigar enxaqueca/outras causas e medicamentos. Orientar repouso em local pouco iluminado e ventilado, hidratação, alimentação adequada e relaxamento. Se recorrente, solicitar avaliação médica. Com riscos afastados e persistência: avaliação profissional para paracetamol 500 mg 6/6h se dor; segunda escolha dipirona 500 mg 6/6h se dor.');
  if(q.includes('Tontura / desmaio / fraqueza')) add('alert-w','Tontura/desmaio/fraqueza — Protocolo Toledo','aferir PA e avaliar anemia, hipoglicemia e sinais de instabilidade. Colocar em decúbito lateral esquerdo, orientar movimentos lentos, ambiente ventilado, alimentação fracionada rica em ferro/vitamina C e hidratação. Episódio persistente, recorrente ou com instabilidade requer avaliação médica.');
  if(q.includes('Pirose / azia')) add('alert-w','Pirose/azia — Protocolo Toledo','aferir PA se houver dor epigástrica ou suspeita de pré-eclâmpsia. Orientar alimentação fracionada, evitar líquidos durante refeições, não deitar logo após comer, elevar cabeceira e evitar frituras, café, chá preto/mate, doces, gordurosos e picantes. Sem risco e sem melhora: avaliação profissional para hidróxido de alumínio 10–15 mL após refeições e ao deitar; sem melhora, avaliação médica.');
  if(q.includes('Dor abdominal / cólicas')) add('alert-e','Dor abdominal/cólicas — avaliar agora','verificar febre, Blumberg, sangramento, ITU, dinâmica uterina e contrações. Dor progressiva, sinais de alerta ou suspeita de trabalho de parto prematuro exigem avaliação obstétrica imediata. Sem sinais de risco: repouso em decúbito lateral esquerdo, hidratação e prevenção de constipação/flatulência; medicação somente após avaliação profissional.');
  if(q.includes('Dor lombar / pélvica')) add('alert-w','Dor lombar/pélvica — Protocolo Toledo','caracterizar dor e avaliar febre, mal-estar, sintomas urinários, enrijecimento/contrações, déficit neurológico e trauma. Orientar postura, sapatos confortáveis, calor local, massagens e alongamento; encaminhar à fisioterapia se necessário. Sinais associados exigem avaliação médica/obstétrica.');
  if(q.includes('Cãibras')) add('alert-i','Cãibras — Protocolo Toledo','orientar calor local, massagem, movimentos passivos de extensão/flexão, evitar posição prolongada e excesso de exercício, e estimular alimentos ricos em potássio. Avaliar se dor unilateral persistente, edema, calor ou outros sinais vasculares.');
  if(q.includes('Constipação / flatulência')) add('alert-w','Constipação/flatulência — Protocolo Toledo','orientar fibras, frutas, verduras e grãos integrais, hidratação, alimentação fracionada, rotina de evacuação e atividade física tolerada. Evitar alimentos flatulentos e óleo mineral de rotina. Se cuidados não forem efetivos, solicitar avaliação médica antes de tratamento farmacológico.');
  if(q.includes('Hemorroidas')) add('alert-w','Hemorroidas — Protocolo Toledo','avaliar aumento da dor, endurecimento e sangramento retal. Orientar fibras, hidratação, higiene após evacuação e banho de assento morno. Qualquer alteração importante requer avaliação médica.');
  if(q.includes('Dispneia')) add('alert-e','Dispneia — Protocolo Toledo','realizar ausculta cardíaca e pulmonar, sinais vitais e oximetria quando disponível. Manter repouso em decúbito lateral esquerdo e elevar cabeceira. Alteração na ausculta, hipoxemia, dor torácica, início súbito ou desconforto importante exige avaliação médica imediata.');
  if(q.includes('Sangramento vaginal')||/Sangue/.test(perdaTipo)) c.innerHTML+=`<div class="alert alert-e"><strong>Sangramento vaginal:</strong> verificar sinais vitais e estabilidade; realizar avaliação obstétrica imediata na maternidade de referência. Antes de 20 semanas, considerar ameaça de aborto; aferir sinais vitais, avaliar intensidade/volume, dor e estabilidade e encaminhar imediatamente à maternidade de referência.</div>`;
  if(q.includes('Perda de líquido')||/Líquido/.test(perdaTipo)) c.innerHTML+=`<div class="alert alert-e"><strong>Suspeita de perda de líquido amniótico:</strong> verificar BCF, movimentos fetais e sinais vitais; encaminhar imediatamente para avaliação obstétrica.</div>`;
  if(q.includes('Corrimento vaginal alterado')||perdaTipo==='Corrimento') add('alert-w','Corrimento vaginal alterado — Protocolo Toledo','caracterizar cor, odor, prurido, ardência, dor, sangramento pós-coito e dispareunia; realizar avaliação/exame especular e bacterioscopia conforme achados. Fluxo sem prurido, desconforto ou odor pode ser fisiológico. Achado compatível com candidíase, vaginose, tricomoníase ou cervicite deve seguir tratamento específico após avaliação profissional e incluir parceria quando indicado.');
  if(q.includes('Perda de tampão mucoso')||perdaTipo==='Tampão mucoso') c.innerHTML+=`<div class="alert alert-w"><strong>Perda de tampão mucoso:</strong> avaliar idade gestacional, contrações, dilatação e outros sinais de trabalho de parto.</div>`;
  if(perdaQtd==='Grande') c.innerHTML+=`<div class="alert alert-e"><strong>Perda vaginal em grande quantidade:</strong> avaliar estabilidade e encaminhar imediatamente para urgência obstétrica.</div>`;
  if(q.includes('Diminuição de MF')||/Diminuídos|Ausentes/.test(mf)) c.innerHTML+=`<div class="alert alert-e"><strong>Movimentos fetais reduzidos/ausentes:</strong> avaliação obstétrica imediata.</div>`;
  if(q.includes('Contrações antes de 37s')) c.innerHTML+=`<div class="alert alert-e"><strong>Suspeita de trabalho de parto prematuro:</strong> encaminhar para avaliação hospitalar imediata.</div>`;
  if(q.includes('Disúria / ITU')) add('alert-e','Disúria/ITU — Protocolo Toledo','avaliar sinais sistêmicos, febre, hematúria e dor lombar; solicitar EAS e urocultura com antibiograma e encaminhar para consulta médica. Tratar após urocultura positiva, conforme prescrição e antibiograma: 1ª escolha nitrofurantoína 100 mg 6/6h por 7 dias; 2ª cefalexina 500 mg 6/6h por 7 dias; 3ª amoxicilina + clavulanato 500+125 mg 8/8h por 7 dias com refeições. Após 36 semanas, o protocolo orienta usar apenas cefalexina. Resistência, febre, dor lombar ou suspeita de pielonefrite exigem avaliação médica/hospitalar. Programar urocultura de controle; ITU recorrente (≥3) ou pielonefrite eleva o risco.');
  const gravidade=q.some(x=>/Cefaleia|Alterações visuais|Dor epigástrica|Edema de face/.test(x));
  if(gravidade) c.innerHTML+=`<div class="alert alert-e"><strong>Possíveis sinais de gravidade de pré-eclâmpsia:</strong> aferir/repetir PA e realizar avaliação médica/obstétrica imediata.</div>`;
  checkPncVitais();
}
function checkPncVitais() {
  const c=document.getElementById('pnc-vitais-alerts'); if(!c)return; c.innerHTML='';
  const [pas,pad]=lerPA(document.getElementById('pnc-pa')?.value);
  const sintomas=Array.from(document.querySelectorAll('#pnc-queixas-clin input:checked')).map(e=>e.closest('.cki')?.textContent||'').join(' ');
  const sinaisGravidade=/Cefaleia|Alterações visuais|Dor epigástrica|Edema de face/.test(sintomas);
  if(pas>=160||pad>=110) c.innerHTML+=`<div class="alert alert-e"><strong>PA grave (${pas}/${pad} mmHg):</strong> repetir para confirmação sem retardar a assistência e encaminhar imediatamente para urgência obstétrica.</div>`;
  else if(pas>=140||pad>=90) c.innerHTML+=`<div class="alert alert-e"><strong>PA alterada (${pas}/${pad} mmHg):</strong> manter em repouso, repetir a aferição e realizar avaliação médica no mesmo atendimento para investigação de síndrome hipertensiva${sinaisGravidade?' com sinais de gravidade':''}.</div>`;
  if(sinaisGravidade&&(pas>=140||pad>=90)) c.innerHTML+=`<div class="alert alert-e"><strong>Suspeita de pré-eclâmpsia com gravidade:</strong> encaminhamento obstétrico imediato. Solicitar hemograma com plaquetas, enzimas hepáticas, ácido úrico, creatinina, urina 1 e proteína urinária de 24h ou relação proteína/creatinina; encaminhar imediatamente à maternidade de referência.</div>`;
  const bcf=parseInt(document.getElementById('pnc-bcf').value);
  if(bcf&&(bcf<110||bcf>160)) c.innerHTML+=`<div class="alert alert-e"><strong>BCF alterado (${bcf} bpm):</strong> posicionar em decúbito lateral esquerdo, reavaliar e encaminhar imediatamente se persistente.</div>`;
}

// ── EXAMES: PDF E AVALIAÇÃO (Gestantes) ──────────────────────────────
// A mesma conferência protege os exames obstétricos e pediátricos.
async function importarExamesPDF(prefix){
  const uid=CURRENT_AUTH_USER_ID,identidade=()=>['nome','cpf','nasc'].map(k=>val(prefix+'-'+k)).join('|'),paciente=identidade();
  const f=document.getElementById(prefix+'-pdf-file').files[0],out=document.getElementById(prefix+'-exames-alert');
  const atual=()=>uid===CURRENT_AUTH_USER_ID&&paciente===identidade();
  if(!f){out.textContent='Anexe um PDF.';return;}
  out.textContent='Lendo o texto do PDF para conferência...';
  let pdf;
  try{
    if(!window.pdfjsLib)await garantirPdfJs();
    if(!window.pdfjsLib)throw new Error('Leitor indisponível. Preencha os exames manualmente.');
    // Mitigação oficial da Mozilla para CVE-2024-4367.
    pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer(),isEvalSupported:false}).promise;
    const found=[];
    for(let n=1;n<=pdf.numPages;n++){const content=await(await pdf.getPage(n)).getTextContent();const text=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('');ESFClinical.extractLabs(text).forEach(x=>found.push({...x,page:n}));}
    if(!atual())return;
    if(!found.length){out.innerHTML='<div class="alert alert-w">Nenhum resultado reconhecido. PDF digitalizado ou formato não reconhecido exige preenchimento manual; nenhum campo foi alterado.</div>';return;}
    const keys=found.map(x=>x.key);if(new Set(keys).size!==keys.length){out.innerHTML='<div class="alert alert-w">Há mais de um resultado para o mesmo exame. Confira as datas e transcreva o resultado correto manualmente; nenhum campo foi alterado.</div>';return;}
    if(found.some(x=>ESFClinical.normalize(x.unit)!==(x.key==='hb'?'g/dl':'mg/dl'))){out.textContent='Unidade ausente ou diferente da tabela (Hb em g/dL; glicemia em mg/dL). Confira o laudo e preencha manualmente, com conversão profissional quando necessária. Nenhum campo foi alterado.';return;}
    out.innerHTML=`<div class="alert alert-i"><strong>Confira antes de importar</strong><ul>${found.map(x=>`<li>${escTR(x.label)}: ${x.value} ${escTR(x.unit)} — página ${x.page}. Trecho: ${escTR(x.snippet)}</li>`).join('')}</ul><p>Ao confirmar, o painel anterior será substituído pelos resultados reconhecidos neste arquivo. Confirme unidade, jejum, data e identificação no laudo.</p><button type="button" class="btn btn-p">Conferi e quero importar estes valores</button></div>`;
    out.querySelector('button').onclick=()=>{
      if(!atual())return;
      const row=prefix==='pnc'?'exr-':'pu-exr-';
      document.querySelectorAll(`[id^="${row}"] .ex-val`).forEach(e=>e.value='');
      document.querySelectorAll(`[id^="${row}"] .ex-status`).forEach(e=>{e.textContent='—';e.className='ex-status st-neu';});
      found.forEach(x=>{const e=document.querySelector(`#${row}${x.key} .ex-val`);if(e){e.value=String(x.value);if(prefix==='pnc')avaliaExame(e,x.key,'gestante');else avaliaExamePu(e,x.key);}});
      out.textContent=`${found.length} resultado(s) importado(s) após conferência. Revise a interpretação.`;
    };
  }catch(e){if(atual())out.textContent='Não foi possível importar: '+(e.message||'erro de leitura')+'. Nenhum valor foi substituído.';}
  finally{if(pdf?.destroy)await pdf.destroy();}
}
async function extrairExamesPDF(){return importarExamesPDF('pnc');}
function avaliaExame(el,key,ctx){
  const st=document.getElementById('est-'+key); if(!st)return;
  const val=el.tagName==='SELECT'?el.value:parseFloat(el.value); if(val===''||Number.isNaN(val)){st.textContent='—'; st.className='ex-status st-neu'; return;}
  let ok=true;
  if(key==='hb'&&val<11) ok=false; if(key==='ht'&&(val<33||val>44)) ok=false; if(key==='glic'&&val>=92) ok=false;
  if(key==='vdrl'&&val==='reag') ok=false; if(key==='hiv'&&val==='pos') ok=false;
  if(key==='tsh'){
    ok=ESFClinical.thyroid({tsh:val,weeks:ESFClinical.number((document.getElementById('pnc-ig')?.value.match(/\d+/)||[])[0])})?.level==='ok';
  }
  if(key==='urina'&&(val==='itu'||val==='pielo')) ok=false;
  if(key==='coombs'&&val==='pos') ok=false;
  if((key==='hepb'||key==='hepc')&&val==='pos') ok=false;
  st.textContent=ok?'✓ Normal':'✖ Alterado'; st.className='ex-status '+(ok?'st-ok':'st-alt');
  if(ctx==='gestante')callAIExames('pnc');
}
function toggleExGrupo(title){ title.closest('.ex-grupo').classList.toggle('open'); }
function addExtraExame(){ const c=document.getElementById('ex-extras-list'), d=document.createElement('div'); d.className='ex-extra-row'; d.innerHTML=`<input placeholder="Exame"><input placeholder="Valor"><button class="del-btn" onclick="this.parentNode.remove()">×</button>`; c.appendChild(d); }
function limparExames(){
  document.querySelectorAll('#exames-card-pnc .ex-val').forEach(e=>e.value='');
  document.querySelectorAll('#exames-card-pnc .ex-status').forEach(e=>{e.textContent='—';e.className='ex-status st-neu'});
  const wrap=document.getElementById('ex-ai-wrap-pnc'), alerts=document.getElementById('ex-alerts-pnc');if(wrap)wrap.style.display='none';if(alerts)alerts.innerHTML='';delete EXAMES_PADRAO.pnc;
}
function classificarAchadoLaboratorial(texto){return ESFClinical.labLevel(texto)}
function renderInterpretacaoLaboratorial(out,achados,riscos,condutas,contexto){
  const classificados=achados.map(texto=>({texto,nivel:classificarAchadoLaboratorial(texto)}));
  const total=nivel=>classificados.filter(x=>x.nivel===nivel).length;
  const rotulo={ok:'Dentro da referencia',att:'Requer avaliacao',crit:'Alerta protocolar'};
  out.innerHTML=`<div class="lab-summary"><div class="lab-summary-item ok"><strong>${total('ok')}</strong><span>Dentro da referencia</span></div><div class="lab-summary-item att"><strong>${total('att')}</strong><span>Requer avaliacao</span></div><div class="lab-summary-item crit"><strong>${total('crit')}</strong><span>Alertas</span></div></div>`+
    (classificados.length?`<div class="lab-results">${classificados.map(x=>`<div class="lab-result ${x.nivel}"><b>${rotulo[x.nivel]}</b><span>${x.texto}</span></div>`).join('')}</div>`:'<div class="alert alert-i">Informe ao menos um resultado para gerar a interpretacao.</div>')+
    (riscos.length?`<div class="lab-section"><div class="lab-section-title">Impacto na estratificacao de risco</div><ul>${[...new Set(riscos)].map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'')+
    (condutas.length?`<div class="lab-section"><div class="lab-section-title">Proximos passos sugeridos</div><ul>${[...new Set(condutas)].map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'')+
    `<div class="alert alert-i" style="margin-top:12px"><strong>Fontes do apoio à decisão:</strong> Protocolo Pré-natal Toledo — 4ª edição (2021), Estratificação de risco Materno Infantil e fluxogramas municipais de Hipertensão, Diabetes, Ferro e Hipertireoidismo. Inventário da página oficial: 07/09/2026. Consulte a versão e a página da fonte no catálogo de protocolos.<br><strong>Segurança:</strong> validar com o contexto clínico, idade gestacional e avaliação profissional. Resultados isolados não substituem avaliação clínica.</div>`;
  const prefix=(out?.id||'').replace(/^ex-ai-out-/,'');
  if(prefix)EXAMES_PADRAO[prefix]={classificados,riscos:[...new Set(riscos)],condutas:[...new Set(condutas)],contexto};
}
async function callAIExames(pref){
  const get = id => document.querySelector('#'+id+' .ex-val')?.value || '';
  const numeric=id=>ESFClinical.number(get(id))??NaN;
  const hb=numeric('exr-hb'), ht=numeric('exr-ht'), glic=numeric('exr-glic');
  const tsh=numeric('exr-tsh'), vdrl=get('exr-vdrl'), hiv=get('exr-hiv'), urina=get('exr-urina'), coombs=get('exr-coombs'), hepb=get('exr-hepb'), hepc=get('exr-hepc'), achados=[], condutas=[], riscos=[];
  const anemia=ESFClinical.anemia(hb);
  if(anemia){achados.push(anemia.finding);riscos.push(...anemia.risks);condutas.push(...anemia.actions);}
  if(!Number.isNaN(ht)){
    if(ht<33){achados.push(`Hematócrito ${ht}%: reduzido, reforça investigação de anemia.`);condutas.push('Correlacionar com hemoglobina, sintomas e demais índices do hemograma.');}
    else if(ht>44){achados.push(`Hematócrito ${ht}%: elevado.`);condutas.push('Reavaliar hidratação, repetir/confirmar resultado e solicitar avaliação médica.');}
    else achados.push(`Hematócrito ${ht}%: dentro da referência informada.`);
  }
  if(!Number.isNaN(glic)){
    if(glic<92) achados.push(`Glicemia de jejum ${glic} mg/dL: dentro da meta inicial da gestação.`);
    else if(glic<126){achados.push(`Glicemia de jejum ${glic} mg/dL: compatível com diabetes mellitus gestacional.`);riscos.push('Risco intermediário se DMG sem insulina; alto risco se insulinodependente');condutas.push('Diagnóstico de DMG: encaminhar ao Ambulatório Materno-Infantil e nutricionista, iniciar dieta + exercício físico e controle por HGT em jejum e 1 hora após café, almoço e jantar. Metas: jejum < 95 mg/dL e 1 hora pós-prandial < 140 mg/dL. Reavaliar em 2 semanas. Se > 30% dos valores alterados ou jejum alterado isoladamente: encaminhar ao endocrinologista para avaliação de insulinoterapia. Após diagnóstico, não repetir GJ/TOTG.');}
    else {achados.push(`Glicemia de jejum ${glic} mg/dL: possível diabetes manifesto na gestação.`);riscos.push('Alto risco: possível diabetes prévio/manifesto');condutas.push('Glicemia de jejum ≥ 126 mg/dL indica diabetes mellitus pré-gestacional no fluxograma municipal: encaminhar ao Ambulatório Materno-Infantil e nutricionista, iniciar dieta + exercício e controle por HGT. Reavaliar em 2 semanas; mau controle requer endocrinologista e avaliação de insulinoterapia.');}
  }
  if(vdrl==='reag'){achados.push('VDRL/sífilis: reagente.');riscos.push('Risco habitual, exceto sífilis terciária, resistente à penicilina ou com achado ecográfico suspeito, que é alto risco');condutas.push('Sífilis reagente: notificar e realizar avaliação clínica para estadiamento. Sífilis recente: benzilpenicilina benzatina 2,4 milhões UI IM, dose única, 1,2 milhão em cada glúteo. Sífilis tardia, duração ignorada ou terciária: 2,4 milhões UI IM uma vez por semana por 3 semanas, total 7,2 milhões UI. Controle VDRL mensal na gestante. Testar parcerias; exposição nos últimos 90 dias: tratamento presuntivo com 2,4 milhões UI IM, dose única. Neurossífilis ou necessidade de alternativa: avaliação médica.');}
  else if(vdrl==='nreag') achados.push('VDRL/sífilis: não reagente.');
  if(hiv==='pos'){achados.push('HIV: reagente.');riscos.push('Alto risco: HIV');condutas.push('HIV reagente: acolher, notificar, realizar o algoritmo confirmatório com TR2 e vincular imediatamente ao CTA para início precoce de TARV; classificar como alto risco e articular AMI. A escolha do esquema e a via de parto dependem da equipe especializada e carga viral.');}
  else if(hiv==='neg') achados.push('HIV: não reagente.');
  if(!Number.isNaN(tsh)){
    const rule=ESFClinical.thyroid({tsh,weeks:ESFClinical.number((val(`${pref}-ig`).match(/\d+/)||[])[0])});
    achados.push(rule.finding);condutas.push(...rule.actions,`Fonte: ${rule.source}`);
    if(rule.level!=='ok')riscos.push('Avaliação tireoidiana pendente de confirmação clínica.');
  }
  if(urina==='itu'){achados.push('EAS/urocultura alterada ou positiva.');condutas.push('Correlacionar com sintomas, solicitar/avaliar urocultura com antibiograma e realizar avaliação médica para escolha segura do antimicrobiano na gestação. Registrar cura por urocultura de controle e monitorar recorrência; 3 ou mais ITU ou pielonefrite elevam a estratificação.');}
  if(urina==='pielo'){achados.push('Pielonefrite na gestação.');riscos.push('Alto risco: pielonefrite na gestação atual');condutas.push('Encaminhar imediatamente para avaliação médica/hospitalar e compartilhar cuidado com alto risco.');}
  if(coombs==='pos'){achados.push('Coombs indireto/TIA positivo.');riscos.push('Alto risco: isoimunização Rh');condutas.push('Coombs indireto positivo: encaminhar ao pré-natal de alto risco. Se Rh negativo e Coombs indireto negativo, repetir mensalmente a partir da 24ª semana. Imunoglobulina anti-D é indicada no pós-parto se RN Rh positivo e Coombs direto negativo, e após abortamento, ectópica, mola, sangramento vaginal ou procedimento invasivo.');}
  if(hepb==='pos'||hepc==='pos'){achados.push(`${hepb==='pos'?'Hepatite B ':''}${hepb==='pos'&&hepc==='pos'?'e ':''}${hepc==='pos'?'Hepatite C ':''}reagente.`);riscos.push('Alto risco: hepatite viral na gestação');condutas.push('Hepatite viral reagente: notificar à epidemiologia. Hepatite C: solicitar PCR quantitativo e encaminhar ao infectologista sem urgência; tratamento é contraindicado na gestação e lactação. Hepatite B: solicitar Anti-HBc IgM/IgG, Anti-HBs, Anti-HBe, HBeAg e PCR quantitativo; encaminhar ao infectologista se HBeAg reagente ou PCR VHB > 2.000 UI/mL. HBsAg reagente: solicitar imunoglobulina anti-hepatite B pelo formulário do CRIE e encaminhar com a notificação à epidemiologia.');}
  const wrap=document.getElementById(`ex-ai-wrap-${pref}`), out=document.getElementById(`ex-ai-out-${pref}`); if(wrap)wrap.style.display='block';
  renderInterpretacaoLaboratorial(out,achados,riscos,condutas,'quadro clinico e idade gestacional');
}

async function buscarEnderecoCEP(){
  const cepEl=document.getElementById('prev-cep'), status=document.getElementById('prev-cep-status');
  const cep=(cepEl?.value||'').replace(/\D/g,'');
  if(!cep){if(status)status.textContent='';return;}
  if(cep.length!==8){if(status)status.textContent='Informe um CEP com 8 números.';return;}
  cepEl.value=cep.replace(/^(\d{5})(\d{3})$/,'$1-$2');
  if(status)status.textContent='Buscando endereço...';
  try{
    const resposta=await fetchComTimeout(`https://viacep.com.br/ws/${cep}/json/`);
    if(!resposta.ok)throw new Error('Falha na consulta');
    const dados=await resposta.json();
    if(dados.erro)throw new Error('CEP não encontrado');
    const preencher=(id,valor)=>{const el=document.getElementById(id);if(el&&valor)el.value=valor;};
    preencher('prev-logr',dados.logradouro);
    preencher('prev-bairro',dados.bairro);
    preencher('prev-mun',[dados.localidade,dados.uf].filter(Boolean).join(' / '));
    if(status)status.textContent='Endereço preenchido automaticamente.';
  }catch(e){
    if(status)status.textContent='Não foi possível localizar o CEP. Preencha o endereço manualmente.';
  }
}

// ── ANÁLISE LIVRE DE QUALQUER LAUDO LABORATORIAL ─────────────────
const EXAMES_LIVRES={};
const EXAMES_PADRAO={};
const EXAMES_LIVRES_MODULOS=[
  {p:'pna',alvo:'pna-4',contexto:'gestante'},
  {p:'pnc',alvo:'pnc-4',contexto:'gestante'},
  {p:'pu',alvo:'pu-5',contexto:'crianca'},
  {p:'prev',alvo:'prev-5',contexto:'adulto'},
  {p:'id',alvo:'id-4',contexto:'idoso'},
  {p:'sm',alvo:'sm-2',contexto:'adulto'},
  {p:'ger',alvo:'ger-aval',contexto:'adulto'},
  {p:'acol',alvo:'acol-aval',contexto:'adulto'},
  {p:'hip',alvo:'hip-aval',contexto:'adulto'},
  {p:'fer',alvo:'fer-aval',contexto:'adulto'},
  {p:'puerp',alvo:'puerp-aval',contexto:'adulto'},
  {p:'ist',alvo:'ist-aval',contexto:'adulto'}
];
function labLivreNum(v){let s=String(v||'').replace(/\s/g,'').replace(/[<>]/g,'');if(/^\d{1,3}(?:\.\d{3})+$/.test(s))s=s.replace(/\./g,'');else s=s.replace(',','.');const n=parseFloat(s);return Number.isFinite(n)?n:null;}
function labLivreNorm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
const LAB_LIVRE_CATALOGO=[
  ['Hemoglobina','hemoglobina|\\bhb\\b'],['Hematócrito','hematocrito|\\bht\\b'],['Hemácias','hemacias|eritrocitos'],['Leucócitos','leucocitos'],['Plaquetas','plaquetas'],['HCM','\\bhcm\\b'],['CHCM','\\bchcm\\b'],['VCM','\\bvcm\\b'],['RDW','\\brdw\\b'],['Bastões','bastoes'],['Segmentados','segmentados'],['Linfócitos','linfocitos'],['Eosinófilos','eosinofilos'],['Monócitos','monocitos'],['Basófilos','basofilos'],
  ['Glicemia de jejum','glicemia(?: de)? jejum|glicose(?: de)? jejum'],['Hemoglobina glicada','hemoglobina glicada|hba1c'],['Creatinina','creatinina'],['Ureia','ureia'],['Sódio','sodio'],['Potássio','potassio'],
  ['Cálcio iônico','calcio ionico'],['Cálcio total','calcio total'],['Cloro','\\bcloro\\b'],['Magnésio','magnesio'],['Fósforo','fosforo'],['Glicose','\\bglicose\\b'],['Amilase','amilase'],['Lipase','lipase'],
  ['TGO / AST','\\btgo\\b|\\bast\\b|aspartato aminotransferase'],['TGP / ALT','\\btgp\\b|\\balt\\b|alanina aminotransferase'],['Gama GT','gama\\s*gt|\\bggt\\b'],['Bilirrubina total','bilirrubina total'],['Bilirrubina direta','bilirrubina direta'],['Bilirrubina indireta','bilirrubina indireta'],['Proteínas totais','proteinas totais'],['Albumina','albumina'],['Globulina','globulina'],['Relação A/G','relacao a\\/g'],
  ['TSH','\\btsh\\b'],['T4 livre','t4 livre|tiroxina livre'],['Ferritina','ferritina'],['Ferro sérico','ferro serico'],['Vitamina B12','vitamina b12'],['Vitamina D','vitamina d|25.?oh'],
  ['Proteína C reativa','proteina c reativa|\\bpcr\\b'],['Lactato','acido latico|lactato'],['CK-MB','ck.?mb'],['Troponina','troponina'],['RNI / INR','\\brni\\b|\\binr\\b'],['Tempo de protrombina','tempo de protrombina|\\btp\\b'],['Atividade da protrombina','atividade da protrombina'],['TTPA / KPTT','\\bttpa\\b|\\bkptt\\b'],['Fibrinogênio','fibrinogenio'],['Dímero-D','dimero.?d'],
  ['pH','\\bph\\b'],['pCO2','pco2'],['pO2','po2'],['HCO3','hco3|bicarbonato'],['Saturação de O2','saturacao de o2'],
  ['Colesterol total','colesterol total'],['HDL','colesterol hdl|\\bhdl\\b'],['LDL','colesterol ldl|\\bldl\\b'],['Triglicerídeos','triglicerideos'],
  ['VDRL / Sífilis','\\bvdrl\\b|teste.*sifilis'],['HIV','anti.?hiv|teste.*hiv'],['HBsAg','hbsag'],['Anti-HCV','anti.?hcv'],['Beta HCG','beta.?hcg'],
  ['EAS / Urina','\\beas\\b|urina rotina|parcial de urina'],['Urocultura','urocultura'],['Parasitológico de fezes','parasitologico de fezes']
];
function labLivreNomeValido(nome){
  const n=labLivreNorm(nome).replace(/[.:]+$/,'').trim();
  if(n.length<3||n.length>80)return false;
  if(/^[\d<>.,%]/.test(n)||!/[a-z]/.test(n))return false;
  if(/^(ate|a partir de|referencia|intervalo|resultado|requisicao|nome|sexo|medico|convenio|idade|impresso|pagina|local coleta|setor|material|metodo|observacao|data|hora)\b/.test(n))return false;
  if(/requisicao|intervalo de referencia|alvos terapeuticos|aceitacao deste resultado|condicionada|paciente|solicitante/.test(n))return false;
  return true;
}
function labLivreReferencia(trecho){
  const r=trecho.match(/(?:refer[eê]ncia|valor(?:es)? de refer[eê]ncia|vr)\s*[:=]?\s*([<>]?\s*\d+(?:[.,]\d+)?)\s*(?:a|até|ate|-|–)\s*([<>]?\s*\d+(?:[.,]\d+)?)/i)
    ||trecho.match(/\b([<>]?\s*\d+(?:[.,]\d+)?)\s*(?:a|até|ate|-|–)\s*([<>]?\s*\d+(?:[.,]\d+)?)\b/i);
  return r?{min:labLivreNum(r[1]),max:labLivreNum(r[2]),texto:`${r[1]} a ${r[2]}`}:{min:null,max:null,texto:'Referência não identificada'};
}
const LAB_LIVRE_REFERENCIAS_AUXILIARES=[
  [/^hemacias$|eritrocitos/,4,5.9,'milhões/mm³'],[/^hemoglobina$/,12,17.5,'g/dL'],[/hematocrito/,36,53,'%'],[/^vcm$/,80,100,'fL'],[/^hcm$/,27,33,'pg'],[/^chcm$/,32,36,'g/dL'],[/^rdw$/,11.5,14.5,'%'],
  [/bastoes/,0,5,'%'],[/segmentados/,40,70,'%'],[/linfocitos/,20,45,'%'],[/eosinofilos/,0,6,'%'],[/monocitos/,2,10,'%'],[/basofilos/,0,2,'%'],
  [/tempo de protrombina/,10,14,'segundos'],[/atividade da protrombina/,70,100,'%'],[/ttpa|kptt/,25,43,'segundos'],[/^rni|inr/,0.8,1.2,''],
  [/^ph$/,7.35,7.45,''],[/pco2/,35,45,'mmHg'],[/po2/,80,100,'mmHg'],[/hco3/,22,26,'mmol/L'],[/saturacao de o2/,95,100,'%'],[/lactato/,0.5,2.2,'mmol/L'],
  [/creatinina/,0.6,1.3,'mg/dL'],[/ureia/,15,45,'mg/dL'],[/sodio/,135,145,'mmol/L'],[/potassio/,3.5,5.1,'mmol/L'],[/calcio ionico/,1.12,1.32,'mmol/L'],[/^cloro$/,98,107,'mmol/L'],
  [/bilirrubina total/,0.2,1.2,'mg/dL'],[/bilirrubina direta/,0,0.3,'mg/dL'],[/bilirrubina indireta/,0.1,0.9,'mg/dL'],[/proteinas totais/,6.4,8.3,'g/dL'],[/^albumina$/,3.5,5.2,'g/dL'],[/^globulina$/,2,3.5,'g/dL'],[/relacao a\/g/,1,2.2,''],
  [/^glicose$|glicemia/,70,99,'mg/dL'],[/amilase/,28,100,'U/L'],[/ck.?mb/,0,5,'ng/mL']
];
function labLivreReferenciaAuxiliar(exame,contexto){
  const n=labLivreNorm(exame).replace(/[.\s]+$/,'').trim(),r=LAB_LIVRE_REFERENCIAS_AUXILIARES.find(([re])=>re.test(n));if(!r)return null;
  let min=r[1],max=r[2];if(contexto==='gestante'&&/^hemoglobina$/.test(n))min=11;
  return{min,max,texto:`${String(min).replace('.',',')} a ${String(max).replace('.',',')} ${r[3]} · faixa auxiliar`};
}
function completarReferenciasLaudoLivre(registros,contexto){
  return registros.map(r=>{if(r.min!==null&&r.max!==null)return r;const aux=labLivreReferenciaAuxiliar(r.exame,contexto);if(!aux||r.numerico===null)return r;return{...r,min:aux.min,max:aux.max,referencia:aux.texto,status:r.numerico<aux.min?'baixo':r.numerico>aux.max?'alto':'ok',referenciaAuxiliar:true};});
}
function interpretarLinhasLaudoLivre(texto){
  const bruto=String(texto||'').replace(/\r/g,'\n'), plano=bruto.replace(/\s+/g,' '), planoBusca=labLivreNorm(plano), encontrados=[];
  LAB_LIVRE_CATALOGO.forEach(([nome,padrao])=>{
    const re=new RegExp(`(?:^|\\s)(${padrao})\\s*[:\\-]?\\s*(não reagente|nao reagente|reagente|negativo|positivo|normal|alterado|detectável|detectavel|não detectável|nao detectavel|[<>]?\\s*\\d+(?:[.,]\\d+)?)\\s*([%A-Za-zÀ-ÿµμ/0-9.^-]{0,15})`,'ig');
    let m;while((m=re.exec(planoBusca))){
      const resultado=m[2].trim(),numerico=labLivreNum(resultado),qual=numerico===null,unidade=qual?'—':(m[3]||'—'),pos=m.index+m[0].length,ref=labLivreReferencia(plano.slice(pos,pos+180));
      if(/^(a|ate|à|de)$/i.test(unidade))continue;
      let status='semref';if(qual)status=/reagente|positivo|alterado|detect[aá]vel/i.test(resultado)&&!/não|nao/i.test(resultado)?'alto':'ok';else if(ref.min!==null&&ref.max!==null)status=numerico<ref.min?'baixo':numerico>ref.max?'alto':'ok';
      encontrados.push({exame:nome,resultado,unidade,referencia:qual?'Resultado qualitativo':ref.texto,status,numerico,min:ref.min,max:ref.max});
    }
  });
  const linhas=bruto.split(/\n|(?=\s{2,}[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ()/.-]{2,}\s+[:<>]?\s*\d)/).map(x=>x.trim().replace(/\s+/g,' ')).filter(x=>x.length>3);
  linhas.forEach(linha=>{
    if(/^\d{2}\/\d{2}\/\d{4}/.test(linha)||!/[\p{L}]/u.test(linha))return;
    const qual=linha.match(/^(.{2,70}?)\s*[:\-]?\s+(não reagente|nao reagente|reagente|negativo|positivo|normal|alterado|detectável|detectavel|não detectável|nao detectavel)\b/i);
    if(qual&&labLivreNomeValido(qual[1])){const resultado=qual[2],alterado=/reagente|positivo|alterado|detect[aá]vel/i.test(resultado)&&!/não|nao/i.test(resultado);encontrados.push({exame:qual[1].trim(),resultado,unidade:'—',referencia:'Resultado qualitativo',status:alterado?'alto':'ok',numerico:null});return;}
    const m=linha.match(/^(.{2,80}?)\s*[:\-]?\s+([<>]?\s*\d+(?:[.,]\d+)?)\s*([%A-Za-zÀ-ÿµμ/0-9.^-]{1,18})(?:\s+(?:ref(?:er[eê]ncia)?\.?|vr|valor de refer[eê]ncia)?\s*[:=]?\s*([<>]?\s*\d+(?:[.,]\d+)?)\s*(?:a|até|ate|-|–)\s*([<>]?\s*\d+(?:[.,]\d+)?))?/i);
    if(!m)return;
    const exame=m[1].trim(),valor=labLivreNum(m[2]),min=labLivreNum(m[4]),max=labLivreNum(m[5]);if(valor===null||!labLivreNomeValido(exame)||/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(m[2]))return;
    if(!min&&!max&&!/(mg|g|mmol|mol|u\/l|ui|mil|µ|μ|%|seg|s$|mL|dL)/i.test(m[3]))return;
    let status='semref';if(min!==null&&max!==null)status=valor<min?'baixo':valor>max?'alto':'ok';
    encontrados.push({exame,resultado:m[2].replace(/\s/g,''),unidade:m[3]||'—',referencia:min!==null&&max!==null?`${m[4]} a ${m[5]}`:'Referência não identificada',status,numerico:valor,min,max});
  });
  return encontrados.filter(x=>labLivreNomeValido(x.exame)).filter((x,i,a)=>a.findIndex(y=>labLivreNorm(y.exame)===labLivreNorm(x.exame)&&y.resultado===x.resultado)===i);
}
const LAB_LIVRE_GRUPOS=[
  ['Hemograma',/hemoglobina|hematocrito|hemacia|eritrocito|leucocito|plaqueta|hcm|chcm|vcm|rdw|bast|segment|linfoc|eosinof|monoc|basof/],
  ['Coagulação',/rni|inr|protrombina|ttpa|kptt|fibrinogen|dimero/],
  ['Gasometria e equilíbrio ácido-base',/^ph$|pco2|po2|hco3|bicarbonato|saturacao de o2|lactato/],
  ['Função renal e eletrólitos',/creatinina|ureia|sodio|potassio|calcio|cloro|magnesio|fosforo/],
  ['Função hepática e proteínas',/tgo|ast|tgp|alt|gama|ggt|bilirrubina|proteina total|albumina|globulina|relacao a\/g/],
  ['Glicemia e metabolismo',/glicemia|glicose|glicada|hba1c|colesterol|hdl|ldl|triglicer/],
  ['Marcadores inflamatórios e cardíacos',/proteina c reativa|pcr|ck.?mb|troponina/],
  ['Hormônios, ferro e vitaminas',/tsh|t4|ferritina|ferro|vitamina|beta.?hcg/],
  ['Sorologias e microbiologia',/vdrl|sifilis|hiv|hbsag|hcv|hepatite|urocultura/],
  ['Urina e fezes',/eas|urina|parasitologico|fezes/],
  ['Outros exames bioquímicos',/.*/]
];
function grupoExameLivre(exame){const n=labLivreNorm(exame);return LAB_LIVRE_GRUPOS.find(([,re])=>re.test(n))?.[0]||'Outros exames bioquímicos';}
function labLivreAchar(registros,padrao){return registros.find(r=>padrao.test(labLivreNorm(r.exame).replace(/[.\s]+$/,'')));}
function condutasGestanteProtocoladas(registros){
  const cards=[],add=(nivel,titulo,achado,acoes,fonte)=>cards.push({nivel,titulo,achado,acoes,fonte});
  const hb=labLivreAchar(registros,/^hemoglobina$/),tsh=labLivreAchar(registros,/^tsh$/),t4=labLivreAchar(registros,/t4 livre|tiroxina livre/),glic=labLivreAchar(registros,/glicemia.*jejum|glicose.*jejum/),glicose=labLivreAchar(registros,/^glicose$/),plaq=labLivreAchar(registros,/plaqueta/),creat=labLivreAchar(registros,/creatinina/);
  const trans=registros.filter(r=>/tgo|ast|tgp|alt|transaminase/.test(labLivreNorm(r.exame))&&r.status==='alto');
  const anemia=ESFClinical.anemia(hb?.numerico);
  if(anemia&&anemia.level!=='ok')add(anemia.level==='crit'?'urgente':'atencao','Anemia na gestação',anemia.finding,anemia.actions,anemia.source);
  if(tsh?.numerico!==null&&tsh?.numerico!==undefined){
    const rule=ESFClinical.thyroid({tsh:tsh.numerico,t4:t4?.numerico,t4Unit:t4?.unidade||'',weeks:ESFClinical.number((val(prefixoPaginaAtual()+'-ig').match(/\d+/)||[])[0])});
    if(rule&&rule.level!=='ok')add('atencao',rule.title,rule.finding,rule.actions,rule.source);
  }
  if(glic?.numerico>=92){
    const v=glic.numerico,manifesto=v>=126;
    add('atencao',manifesto?'Possível diabetes manifesto na gestação':'Diabetes mellitus gestacional',`Glicemia de jejum ${String(v).replace('.',',')} mg/dL.`,[
      manifesto?'Avaliação médica prioritária e encaminhamento ao AMI para confirmar/classificar diabetes manifesto.':'Ativar fluxo de diabetes na gestação e encaminhar ao AMI/nutrição.',
      'Após o diagnóstico, não repetir glicemia de jejum ou TOTG para rastreamento.',
      'Orientar controle glicêmico: jejum e 1 hora após café, almoço e jantar. Metas: jejum < 95 mg/dL e 1 hora pós-refeição < 140 mg/dL.',
      'Se metas não forem atingidas com medidas não farmacológicas em 2 semanas: avaliação médica para insulinoterapia.',
      'Solicitar TOTG 75 g entre 6 e 8 semanas após o parto para reclassificação.'
    ],'Fluxograma Diagnóstico e Manejo de Diabetes Mellitus na Gestação — Toledo.');
  }else if(glicose?.numerico>=200){
    add('urgente','Hiperglicemia importante sem informação de jejum',`Glicose ${String(glicose.numerico).replace('.',',')} mg/dL; o laudo não informa que a coleta foi em jejum.`,[
      'Avaliar imediatamente sintomas, hidratação e sinais de descompensação; realizar glicemia capilar e avaliação médica no mesmo atendimento.',
      'Confirmar condição da coleta antes de aplicar os pontos de corte de DMG. Se houver sintomas ou descompensação, encaminhar para atendimento de urgência.',
      'Se confirmado diagnóstico de diabetes na gestação, ativar o fluxo municipal de diabetes e encaminhar ao AMI/nutrição.'
    ],'Fluxograma Diabetes na Gestação — Toledo; interpretação depende da condição da coleta.');
  }
  const grav=[];
  if(plaq?.numerico<100000)grav.push(`plaquetas ${plaq.resultado} ${plaq.unidade} (< 100.000)`);
  if(creat?.numerico>1.1)grav.push(`creatinina ${creat.resultado} ${creat.unidade} (> 1,1)`);
  if(trans.length)grav.push('transaminase(s) acima da referência; confirmar se elevação ≥ 2 vezes o limite');
  if(grav.length)add('urgente','Sinais laboratoriais de gravidade para pré-eclâmpsia',grav.join('; ')+'.',[
    'Aferir PA, pesquisar cefaleia persistente, alteração visual, dor epigástrica/HCD, edema súbito, dispneia e convulsão.',
    'Realizar avaliação obstétrica imediata/encaminhar à maternidade de referência; não aguardar consulta de rotina.',
    'Completar investigação com hemograma/plaquetas, creatinina, transaminases, urina 1 e proteína urinária de 24 h ou relação proteína/creatinina.'
  ],'Fluxograma 3 — Manejo da Hipertensão Arterial em Gestantes, Toledo.');
  const sod=labLivreAchar(registros,/^sodio$/),pot=labLivreAchar(registros,/^potassio$/),hco3=labLivreAchar(registros,/^hco3|bicarbonato/),ph=labLivreAchar(registros,/^ph$/);
  const crit=[];if(sod?.numerico<130)crit.push(`sódio ${sod.resultado}`);if(pot?.numerico>=5.5)crit.push(`potássio ${pot.resultado}`);if(hco3?.numerico<18)crit.push(`HCO3 ${hco3.resultado}`);if(ph?.numerico<7.3||ph?.numerico>7.5)crit.push(`pH ${ph.resultado}`);
  if(crit.length)add('urgente','Alteração metabólica potencialmente grave',crit.join('; ')+'.',[
    'Confirmar imediatamente o resultado e excluir erro de coleta/hemólise.',
    'Realizar avaliação médica no mesmo atendimento, com sinais vitais, glicemia, estado volêmico, ECG quando indicado e repetição/expansão dos exames.',
    'Encaminhar à urgência se houver sintomas, alteração persistente, piora clínica ou impossibilidade de avaliação imediata.'
  ],'Conduta de segurança clínica; o protocolo obstétrico municipal anexado não traz dose/tratamento específico para estes distúrbios.');
  return cards;
}
function htmlCondutasProtocoladas(cards){
  if(!cards.length)return'';
  const ordem={urgente:0,atencao:1,rotina:2};
  return`<div class="lab-section"><div class="lab-section-title">Condutas protocoladas para a gestante</div><div class="lab-protocol-grid">${cards.sort((a,b)=>ordem[a.nivel]-ordem[b.nivel]).map(c=>`<div class="lab-protocol-card ${c.nivel}"><div class="lab-protocol-head">${vacEsc(c.titulo)}<span>${c.nivel==='urgente'?'Avaliação imediata':c.nivel==='atencao'?'Requer avaliação':'Acompanhamento'}</span></div><div class="lab-protocol-body"><strong>Achado:</strong> ${vacEsc(c.achado)}<ul>${c.acoes.map(x=>`<li>${vacEsc(x)}</li>`).join('')}</ul><div class="lab-protocol-source"><strong>Fonte:</strong> ${vacEsc(c.fonte)}</div></div></div>`).join('')}</div></div>`;
}
function condutaExameLivre(r,contexto){
  const n=labLivreNorm(r.exame),v=r.numerico,alterado=r.status==='alto'||r.status==='baixo',resultado=ESFClinical.positiveText(r.resultado);
  if(/^hemoglobina$/.test(n)&&v>0&&contexto==='gestante'&&v<11)return ESFClinical.anemia(v).actions.join(' ');
  if(/glicemia.*jejum|glicose.*jejum/.test(n)&&v!==null&&contexto==='gestante'&&v>=92)return v>=126?'Possível diabetes manifesto: encaminhar ao AMI/nutrição e ativar fluxo municipal de diabetes na gestação.':'Compatível com DMG: encaminhar ao AMI/nutrição, iniciar monitoramento glicêmico e aplicar metas do fluxo municipal.';
  if(/plaqueta/.test(n)&&v!==null&&contexto==='gestante'&&v<100000)return'Achado de gravidade para síndrome hipertensiva: aferir PA, avaliar sintomas e encaminhar imediatamente para avaliação obstétrica.';
  if(/creatinina/.test(n)&&v!==null&&contexto==='gestante'&&v>1.1)return'Achado de gravidade para pré-eclâmpsia quando associado ao quadro clínico: avaliação obstétrica imediata.';
  if(/tgo|ast|tgp|alt|transaminase/.test(n)&&r.status==='alto'&&contexto==='gestante')return'Elevação de enzimas hepáticas na gestação: aferir PA, pesquisar sinais de gravidade e realizar avaliação obstétrica prioritária.';
  if(/tsh/.test(n)&&v!==null&&contexto==='gestante'&&(v>4||v<0.1))return'Ativar fluxo municipal de tireoide na gestação: solicitar/avaliar T4 livre e encaminhar para avaliação médica conforme faixa encontrada.';
  if(/urocultura|urina|eas/.test(n)&&/reagente|positivo|alterado/i.test(resultado))return'Correlacionar com sintomas, avaliar urocultura/antibiograma e aplicar o fluxo de ITU adequado ao contexto clínico.';
  if(/vdrl|sifilis|sífilis/.test(n)&&/reagente|positivo/i.test(resultado))return'Ativar fluxo de sífilis: notificar, estadiar, tratar conforme protocolo e acompanhar titulação.';
  if(/hiv|hbsag|hepatite|anti-hcv/.test(n)&&/reagente|positivo|detect/i.test(resultado))return'Ativar fluxo protocolar da infecção identificada, com confirmação, notificação e encaminhamento correspondente.';
  if(alterado)return'Resultado fora da referência informada pelo laboratório: correlacionar com sintomas, medicamentos, condições da coleta e solicitar avaliação profissional para definir investigação/conduta.';
  if(r.status==='semref')return'Referência não identificada automaticamente: conferir a faixa do laudo considerando idade, sexo, gestação e método do laboratório antes de concluir.';
  return'';
}
function renderLaudoLivre(prefix){
  const texto=document.getElementById(`lab-livre-texto-${prefix}`)?.value||'',out=document.getElementById(`lab-livre-out-${prefix}`),cfg=EXAMES_LIVRES_MODULOS.find(x=>x.p===prefix);if(!out||!cfg)return;
  const registros=completarReferenciasLaudoLivre(interpretarLinhasLaudoLivre(texto),cfg.contexto),condutas=registros.map(r=>condutaExameLivre(r,cfg.contexto)).filter(Boolean),cardsProtocolo=cfg.contexto==='gestante'?condutasGestanteProtocoladas(registros):[],alt=registros.filter(r=>r.status==='alto'||r.status==='baixo').length,semref=registros.filter(r=>r.status==='semref').length;
  const status=r=>r.status==='ok'?['Dentro da referência','ok']:r.status==='alto'?['Acima da referência','att']:r.status==='baixo'?['Abaixo da referência','att']:['Conferir referência','crit'];
  const grupos=LAB_LIVRE_GRUPOS.map(([nome])=>{const itens=registros.filter(r=>grupoExameLivre(r.exame)===nome);if(!itens.length)return'';const linhas=itens.map(r=>{const s=status(r);return`<tr class="lab-${r.status}"><td><strong>${vacEsc(r.exame)}</strong></td><td>${vacEsc(r.resultado)} ${vacEsc(r.unidade)}</td><td>${vacEsc(r.referencia)}</td><td><span class="free-lab-status ${s[1]}">${s[0]}</span></td></tr>`}).join('');return`<section class="free-lab-group"><div class="free-lab-group-head">${nome}<span>${itens.length} ${itens.length===1?'resultado':'resultados'}</span></div><div class="free-lab-table-wrap"><table class="free-lab-table"><thead><tr><th>Exame</th><th>Resultado</th><th>Referência do laudo</th><th>Interpretação</th></tr></thead><tbody>${linhas}</tbody></table></div></section>`}).join('');
  out.innerHTML=registros.length?`<div class="lab-summary"><div class="lab-summary-item ok"><strong>${registros.length}</strong><span>Resultados lidos</span></div><div class="lab-summary-item att"><strong>${alt}</strong><span>Fora da referência</span></div><div class="lab-summary-item crit"><strong>${semref}</strong><span>Conferir referência</span></div></div>${grupos}${htmlCondutasProtocoladas(cardsProtocolo)}${condutas.length?`<div class="lab-section"><div class="lab-section-title">${cardsProtocolo.length?'Outras observações e próximos passos':'Condutas e próximos passos'}</div><ul>${[...new Set(condutas)].map(x=>`<li>${x}</li>`).join('')}</ul></div>`:''}<div class="alert alert-i"><strong>Referências:</strong> o sistema prioriza a faixa impressa junto ao resultado. Quando o PDF não mantém essa associação, usa uma <strong>faixa clínica auxiliar</strong>, identificada na tabela, apenas para triagem. Confirmar método, idade, sexo, gestação e valores críticos com o laboratório/equipe responsável.</div>`:'<div class="alert alert-w">Nenhum resultado foi identificado. Cole linhas contendo nome do exame, resultado, unidade e faixa de referência, por exemplo: Creatinina 1,2 mg/dL Referência 0,6 - 1,1.</div>';
  EXAMES_LIVRES[prefix]={registros,condutas,cardsProtocolo,resumo:`Laudo livre: ${registros.length} resultados interpretados; ${alt} fora da referência; ${semref} sem referência reconhecida.`,texto:out.innerText};
}
async function carregarLaudoLivre(prefix){
  const f=document.getElementById(`lab-livre-file-${prefix}`)?.files?.[0],ta=document.getElementById(`lab-livre-texto-${prefix}`),out=document.getElementById(`lab-livre-out-${prefix}`);if(!f||!ta)return;
  const uid=CURRENT_AUTH_USER_ID,identidade=()=>['nome','cpf','nasc'].map(k=>val(prefix+'-'+k)).join('|'),paciente=identidade(),anterior=ta.value;
  const atual=()=>uid===CURRENT_AUTH_USER_ID&&paciente===identidade()&&ta.value===anterior;
  let pdf;
  try{
    let txt='';
    if(f.type==='application/pdf'){
      if(!window.pdfjsLib)await garantirPdfJs();if(!window.pdfjsLib)throw new Error('Leitor de PDF indisponível');
      pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer(),isEvalSupported:false}).promise;
      for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i),ct=await p.getTextContent();txt+=ct.items.map(x=>x.str+(x.hasEOL?'\n':'  ')).join('')+'\n';}
    }else txt=await f.text();
    if(!atual())return;
    if(!txt.trim()){out.textContent='Nenhum texto reconhecido. Confira o arquivo ou transcreva manualmente. O laudo anterior foi mantido.';return;}
    ta.value=txt;delete EXAMES_LIVRES[prefix];
    out.textContent='Texto carregado. Confira identificação, datas, resultados, unidades e referências; depois selecione Interpretar laudo completo.';
  }catch(e){if(atual())out.textContent='Não foi possível ler o arquivo: '+e.message;}
  finally{if(pdf?.destroy)await pdf.destroy();}
}
function montarLeitoresLivres(){
  EXAMES_LIVRES_MODULOS.forEach(cfg=>{const alvo=document.getElementById(cfg.alvo);if(!alvo||document.getElementById(`lab-livre-card-${cfg.p}`))return;const card=document.createElement('div');card.className='card';card.id=`lab-livre-card-${cfg.p}`;card.innerHTML=`<div class="ct"><span class="dot db"></span>Análise livre de laudo laboratorial</div><div class="alert alert-i">Anexe um PDF/TXT ou cole qualquer laudo. O sistema utiliza os valores de referência escritos no próprio exame e cruza achados reconhecidos com os protocolos cadastrados.</div><div class="f"><label>Arquivo do laudo</label><input type="file" id="lab-livre-file-${cfg.p}" accept=".pdf,.txt,text/plain,application/pdf" onchange="carregarLaudoLivre('${cfg.p}')"></div><div class="f"><label>Texto do laudo</label><textarea class="free-lab-input" id="lab-livre-texto-${cfg.p}" placeholder="Cole aqui resultados, unidades e valores de referência..."></textarea></div><div class="brow"><button class="btn btn-p" type="button" onclick="renderLaudoLivre('${cfg.p}')">Interpretar laudo completo</button><button class="btn btn-s" type="button" onclick="document.getElementById('lab-livre-texto-${cfg.p}').value='';document.getElementById('lab-livre-out-${cfg.p}').innerHTML='';delete EXAMES_LIVRES['${cfg.p}']">Limpar</button></div><div id="lab-livre-out-${cfg.p}" style="margin-top:12px"></div>`;alvo.appendChild(card);});
}
function resumoExamesSoapEstruturado(prefix){
  const padrao=EXAMES_PADRAO[prefix],livre=EXAMES_LIVRES[prefix],objetivo=[],avaliacao=[],plano=[],unicos=lista=>[...new Set(lista.filter(Boolean))];
  const curta=(texto,max=210)=>{const t=String(texto||'').replace(/\s+/g,' ').trim();return t.length>max?t.slice(0,max-1).replace(/[,;:\s]+$/,'')+'…':t};
  if(padrao?.classificados?.length){
    const normais=padrao.classificados.filter(x=>x.nivel==='ok'),alterados=padrao.classificados.filter(x=>x.nivel!=='ok');
    objetivo.push(`${padrao.classificados.length} resultados avaliados no painel da consulta; ${alterados.length} com alteração ou necessidade de avaliação.`);
    if(normais.length){
      const itens=normais.slice(0,5).map(x=>curta(x.texto,120));
      objetivo.push(`Sem alteração protocolar identificada: ${itens.join('; ')}${normais.length>itens.length?`; e mais ${normais.length-itens.length} resultado(s)`:''}.`);
    }
    alterados.slice(0,5).forEach(x=>avaliacao.push(`- ${curta(x.texto)}`));
    padrao.riscos?.slice(0,4).forEach(x=>avaliacao.push(`- Impacto no risco: ${curta(x,180)}`));
    padrao.condutas?.slice(0,4).forEach(x=>plano.push(`- ${curta(x,240)}`));
  }
  if(livre?.registros?.length){
    const alterados=livre.registros.filter(r=>r.status==='alto'||r.status==='baixo'),semref=livre.registros.filter(r=>r.status==='semref');
    objetivo.push(`Laudo anexado interpretado: ${livre.registros.length} resultados; ${alterados.length} alterados; ${semref.length} sem referência reconhecida.`);
    const porGrupo={};alterados.forEach(r=>(porGrupo[grupoExameLivre(r.exame)]??=[]).push(`${r.exame.replace(/[.\s]+$/,'')} ${r.resultado} ${r.unidade}`));
    Object.entries(porGrupo).slice(0,5).forEach(([grupo,itens])=>objetivo.push(`- ${grupo}: ${itens.slice(0,4).join('; ')}${itens.length>4?`; e mais ${itens.length-4}`:''}.`));
    (livre.cardsProtocolo||[]).slice(0,4).forEach(c=>{
      avaliacao.push(`- ${c.nivel==='urgente'?'Prioridade imediata':c.nivel==='atencao'?'Requer avaliação':'Acompanhamento'} — ${c.titulo}: ${curta(c.achado,180)}`);
      c.acoes.slice(0,2).forEach(acao=>plano.push(`- ${curta(acao,240)}`));
    });
    if(alterados.length&&!(livre.cardsProtocolo||[]).length)plano.push('- Correlacionar alterações laboratoriais com o quadro clínico e confirmar resultados críticos antes de definir a conduta.');
    if(semref.length)avaliacao.push(`- Conferir referência laboratorial de: ${semref.slice(0,6).map(r=>r.exame.replace(/[.\s]+$/,'')).join('; ')}${semref.length>6?`; e mais ${semref.length-6}`:''}.`);
  }
  return{objetivo:unicos(objetivo).join('\n'),avaliacao:unicos(avaliacao).join('\n'),plano:unicos(plano).slice(0,7).join('\n')};
}
function substituirBlocoFinalSoap(texto,titulo,conteudo){
  const bruto=String(texto||''),indice=bruto.indexOf(titulo),base=(indice>=0?bruto.slice(0,indice):bruto).trim();
  return conteudo?[base,`${titulo}\n${conteudo}`].filter(Boolean).join('\n\n'):base;
}
function resumoExamesParaCentral(prefix){
  const p=EXAMES_PADRAO[prefix],l=EXAMES_LIVRES[prefix],partes=[];
  p?.classificados?.filter(x=>x.nivel!=='ok').forEach(x=>partes.push(x.texto));
  p?.riscos?.forEach(x=>partes.push(x));
  (l?.cardsProtocolo||[]).forEach(x=>partes.push(`${x.titulo}: ${x.achado}`));
  l?.registros?.filter(x=>x.status==='alto'||x.status==='baixo').slice(0,12).forEach(x=>partes.push(`${x.exame} ${x.resultado} ${x.unidade}`));
  return [...new Set(partes)].join(' | ');
}

// ── AVALIAÇÃO UNIVERSAL DO HISTÓRICO VACINAL — PNI ─────────────────
const VAC_MODULOS=[
  {p:'pna',pagina:'pn-abertura',alvo:'pna-1',nasc:'pna-nasc',idade:'pna-idade',gestante:true,ig:'pna-ig'},
  {p:'pnc',pagina:'pn-consulta',alvo:'pnc-1',nasc:'pnc-nasc',idade:'pnc-idade',gestante:true,ig:'pnc-ig'},
  {p:'pu',pagina:'puericultura',alvo:'pu-5',nasc:'pu-nasc',idade:'pu-idade'},
  {p:'prev',pagina:'preventivo',alvo:'prev-1',nasc:'prev-nasc',idade:'prev-idade'},
  {p:'id',pagina:'idoso',alvo:'id-1',nasc:'id-nasc',idade:'id-idade'},
  {p:'sm',pagina:'saude-mental',alvo:'sm-1',nasc:'sm-nasc',idade:'sm-idade'},
  {p:'ger',pagina:'consulta-geral',alvo:'ger-cad',nasc:'ger-nasc'},
  {p:'hip',pagina:'hiperdia',alvo:'hip-cad',nasc:'hip-nasc'},
  {p:'fer',pagina:'feridas',alvo:'fer-cad',nasc:'fer-nasc'},
  {p:'puerp',pagina:'puerperio',alvo:'puerp-cad',nasc:'puerp-nasc'},
  {p:'ist',pagina:'ist',alvo:'ist-cad',nasc:'ist-nasc'},
  {p:'pni',pagina:'pni',alvo:'pni-avaliador',nasc:'pni-nasc',contexto:'pni-contexto',ig:'pni-ig'}
];
let VAC_RESULTADOS={};
const PNI_CALENDARIOS={
  gestante:[
    ['Ao identificar a gestação',[['Hepatite B','Completar esquema de 3 doses conforme histórico.'],['dT','Completar esquema de 3 doses conforme histórico.'],['Influenza','1 dose na temporada.'],['Covid-19','1 dose em cada gestação.'],['Febre amarela','Somente em situação excepcional, após avaliação de risco-benefício.']]],
    ['A partir de 20 semanas',[['dTpa','1 dose em cada gestação.']]],
    ['A partir de 28 semanas',[['VSR materna','1 dose em cada gestação.']]]
  ],
  crianca:[
    ['Ao nascer',[['BCG','Dose única.'],['Hepatite B','1ª dose.']]],
    ['2 a 6 meses',[['Pentavalente','2, 4 e 6 meses.'],['Poliomielite VIP','2, 4 e 6 meses.'],['Pneumocócica 10','2 e 4 meses.'],['Rotavírus','2 e 4 meses.'],['Meningocócica C','3 e 5 meses.'],['Influenza e Covid-19','Iniciar conforme idade e esquema vigente.']]],
    ['9 a 15 meses',[['Febre amarela','9 meses.'],['Pneumocócica 10 e Meningocócica ACWY','Reforços aos 12 meses.'],['Tríplice viral','1ª aos 12 meses e 2ª aos 15 meses.'],['DTP, VIP, Varicela e Hepatite A','Doses e reforços aos 15 meses.']]],
    ['4 a 9 anos',[['DTP, febre amarela e varicela','Reforços aos 4 anos.'],['HPV','Dose única dos 9 aos 14 anos.']]]
  ],
  jovem:[
    ['10 a 14 anos',[['HPV','Dose única dos 9 aos 14 anos.'],['Dengue','2 doses conforme oferta e histórico.'],['Meningocócica ACWY','Dose dos 11 aos 14 anos.']]],
    ['10 a 24 anos',[['Hepatite B','Completar 3 doses.'],['dT','Completar 3 doses e reforço a cada 10 anos.'],['Tríplice viral','2 doses até 29 anos.'],['Febre amarela','Conforme histórico e recomendação vigente.']]]
  ],
  adulto:[
    ['25 a 59 anos',[['Hepatite B','Completar esquema de 3 doses.'],['dT','Completar 3 doses e reforço a cada 10 anos.'],['Tríplice viral','2 doses até 29 anos; 1 dose dos 30 aos 59 anos.'],['Febre amarela','Conforme histórico, indicação e área de risco.']]],
    ['Condições e campanhas',[['Influenza e Covid-19','Conforme grupo prioritário e calendário vigente.'],['Vacinas especiais','Avaliar indicação e encaminhamento ao CRIE quando aplicável.']]]
  ],
  idoso:[
    ['60 anos ou mais',[['Influenza','1 dose anual.'],['Covid-19','Dose a cada 6 meses.'],['Hepatite B','Completar esquema de 3 doses.'],['dT','Completar esquema e reforço a cada 10 anos.']]],
    ['Avaliação individual',[['Febre amarela','Somente após avaliação de risco-benefício.'],['Pneumocócica 23','Conforme condição clínica, institucionalização ou indicação específica.']]]
  ]
};
const PNI_ROTULOS={gestante:'Gestante',crianca:'Criança',jovem:'Adolescente e jovem',adulto:'Adulto',idoso:'Idoso'};
function organizarEtapaPuericultura(){
  const destino=document.getElementById('pu-5');if(!destino)return;
  ['pu-risco-card','pu-encaminhamentos-card','pu-vac-status-card'].forEach(id=>{const el=document.getElementById(id);if(el)destino.appendChild(el);});
  document.querySelectorAll('#pg-puericultura input[type="radio"][name$="-risco"]').forEach(el=>el.closest('.card')?.remove());
}
function vacEsc(s){return escTR(s);}
function vacNorm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
function vacData(s){const m=String(s||'').match(/(\d{2})\/(\d{2})\/(\d{4})/);return m?new Date(+m[3],+m[2]-1,+m[1]):null;}
function vacDataBR(d){return d&&!isNaN(d)?String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear():'—';}
function vacAddMes(d,n){const x=new Date(d);x.setMonth(x.getMonth()+n);return x;}
function vacAddAno(d,n){const x=new Date(d);x.setFullYear(x.getFullYear()+n);return x;}
function vacTipo(nome){
  const n=vacNorm(nome);
  if(/hepatite b|— hb|\bhb\b/.test(n))return'hepb';
  if(/dtpa|triplice bacteriana acelular/.test(n))return'dtpa';
  if(/dupla adulto|— dt\b|\bdt\b/.test(n))return'dt';
  if(/influenza|flu3v|h1n1/.test(n))return'influenza';
  if(/covid|covishield|comirnaty|spikevax/.test(n))return'covid';
  if(/febre amarela|— fa\b/.test(n))return'fa';
  if(/triplice viral|scr/.test(n))return'scr';
  if(/bcg/.test(n))return'bcg';
  if(/hpv/.test(n))return'hpv';
  if(/dengue/.test(n))return'dengue';
  if(/virus sincicial|vvsr|\bvsr\b/.test(n))return'vsr';
  if(/penta|dtp\/hib|tetra/.test(n))return'penta';
  if(/poliomielite|vip|vop/.test(n))return'polio';
  if(/pneumo/.test(n))return'pneumo';
  if(/meningo/.test(n))return'meningo';
  if(/rotavirus/.test(n))return'rotavirus';
  if(/varicela|tetraviral/.test(n))return'varicela';
  if(/hepatite a/.test(n))return'hepa';
  return'outro';
}
function interpretarHistoricoVacinal(texto){
  return String(texto||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
    const data=(l.match(/^\d{2}\/\d{2}\/\d{4}/)||[])[0];if(!data)return null;
    const colunas=l.split('\t').map(x=>x.trim());
    if(colunas.length>=4)return{data,dataObj:vacData(data),vacina:colunas[1]||'',tipo:vacTipo(colunas[1]||''),lote:colunas[2]||'',dose:colunas[3]||'',prof:colunas[4]||'',unidade:colunas[5]||''};
    const partes=l.split(/\t+|\s{2,}/).map(x=>x.trim()).filter(Boolean);
    let vacina=partes[1]||'',dose='',lote='',prof='',unidade='';
    const idxDose=partes.findIndex((x,i)=>i>1&&/(dose|reforco|revacina|unica)/.test(vacNorm(x)));
    if(idxDose>1){dose=partes[idxDose];lote=partes.slice(2,idxDose).join(' ');prof=partes[idxDose+1]||'';unidade=partes[idxDose+2]||'';}
    else {const resto=l.replace(data,'').trim().split(/\s{2,}|\t+/).filter(Boolean);vacina=resto[0]||vacina;dose=resto.find(x=>/(dose|reforço|reforco|revacina|única|unica)/i.test(x))||'';prof=resto.at(-2)||'';unidade=resto.at(-1)||'';}
    return{data,dataObj:vacData(data),vacina,tipo:vacTipo(vacina),lote,dose,prof,unidade};
  }).filter(Boolean).sort((a,b)=>b.dataObj-a.dataObj);
}
function proximaDataRegistro(r,registros){
  if(!r.dataObj)return'—';
  const dose=vacNorm(r.dose), mesmo=registros.filter(x=>x.tipo===r.tipo);
  if(r.tipo==='hepb'){if(/1/.test(dose))return vacDataBR(vacAddMes(r.dataObj,1));if(/2/.test(dose))return vacDataBR(vacAddMes(r.dataObj,5));return'Esquema completo se 3 doses válidas';}
  if(r.tipo==='dt'){return mesmo.length>=3?vacDataBR(vacAddAno(r.dataObj,10)):'Completar esquema de 3 doses';}
  if(r.tipo==='dtpa')return'Reavaliar em cada gestação';
  if(r.tipo==='influenza')return'Próxima campanha anual';
  if(r.tipo==='covid')return'Conforme grupo e calendário vigente';
  if(r.tipo==='dengue'&&/1/.test(dose))return vacDataBR(vacAddMes(r.dataObj,3));
  if(r.tipo==='pneumo'&&mesmo.length===1)return'Conforme idade/condição clínica';
  return'Conforme idade e histórico';
}
function idadeVacModulo(cfg){
  const d=document.getElementById(cfg.nasc)?.value;if(!d)return null;
  const n=new Date(d+'T12:00:00'),h=new Date();let anos=h.getFullYear()-n.getFullYear();if(h<new Date(h.getFullYear(),n.getMonth(),n.getDate()))anos--;
  return{anos,meses:Math.max(0,(h.getFullYear()-n.getFullYear())*12+h.getMonth()-n.getMonth())};
}
function grupoPNIModulo(cfg,idade){
  const contexto=document.getElementById(cfg.contexto)?.value;
  if(cfg.gestante||contexto==='gestante')return'gestante';
  if(contexto&&contexto!=='automatico')return contexto;
  if(!idade)return null;
  return idade.anos<10?'crianca':idade.anos<=24?'jovem':idade.anos<60?'adulto':'idoso';
}
function renderCalendarioPNI(grupo){
  const area=document.getElementById('pni-calendario');if(!area)return;
  area.innerHTML=(PNI_CALENDARIOS[grupo]||[]).map(([etapa,vacinas])=>`<div class="pni-stage"><h4>${vacEsc(etapa)}</h4>${vacinas.map(([vacina,orientacao])=>`<div class="pni-vaccine"><strong>${vacEsc(vacina)}</strong><span>${vacEsc(orientacao)}</span></div>`).join('')}</div>`).join('');
  document.querySelectorAll('#pni-filtros button').forEach(b=>b.classList.toggle('on',b.dataset.grupo===grupo));
}
function atualizarCentralPNI(grupoManual){
  const cfg=VAC_MODULOS.find(x=>x.p==='pni'),idade=idadeVacModulo(cfg),grupo=grupoManual||grupoPNIModulo(cfg,idade)||'crianca';
  if(grupoManual){const c=document.getElementById('pni-contexto');if(c)c.value=grupoManual;}
  const igField=document.getElementById('pni-ig-field');if(igField)igField.style.display=grupo==='gestante'?'block':'none';
  const resumo=document.getElementById('pni-grupo');if(resumo)resumo.innerHTML=`<div class="pni-group-banner"><span style="font-size:24px">✦</span><span><strong>${vacEsc(PNI_ROTULOS[grupo])}</strong><br>${idade?`${idade.anos} ano(s) e ${idade.meses%12} mês(es). `:''}O histórico será comparado com este calendário.</span></div>`;
  renderCalendarioPNI(grupo);avaliarVacinasModulo('pni');
}
function montarCentralPNI(){
  const filtros=document.getElementById('pni-filtros');if(!filtros)return;
  filtros.innerHTML=Object.entries(PNI_ROTULOS).map(([k,v])=>`<button type="button" data-grupo="${k}" onclick="atualizarCentralPNI('${k}')">${vacEsc(v)}</button>`).join('');
  atualizarCentralPNI();
}
function avaliarPNIVacinas(cfg,registros){
  const idade=idadeVacModulo(cfg), grupo=grupoPNIModulo(cfg,idade), hoje=new Date(), tipos=t=>registros.filter(r=>r.tipo===t&&r.dataObj<=hoje), avisos=[],ok=[];
  const ultima=t=>tipos(t).sort((a,b)=>b.dataObj-a.dataObj)[0];
  const futuro=registros.filter(r=>r.dataObj>hoje);if(futuro.length)avisos.push(`Há ${futuro.length} aplicação(ões) com data futura; conferir digitação antes de validar.`);
  if(!idade){avisos.push('Informe a data de nascimento para cruzar o histórico com o PNI.');return{avisos,ok};}
  if(grupo!=='crianca'){
    const hepb=tipos('hepb');hepb.length>=3?ok.push('Hepatite B: 3 ou mais registros encontrados.'):avisos.push(`Hepatite B: ${hepb.length} registro(s); completar esquema de 3 doses conforme histórico válido.`);
    const tet=[...tipos('dt'),...tipos('dtpa'),...tipos('penta')].sort((a,b)=>b.dataObj-a.dataObj);
    if(tet.length>=3){const ult=tet[0];vacAddAno(ult.dataObj,10)<=hoje?avisos.push(`dT: reforço decenal devido desde ${vacDataBR(vacAddAno(ult.dataObj,10))}.`):ok.push(`dT/dTpa: esquema básico identificado; próximo reforço estimado em ${vacDataBR(vacAddAno(ult.dataObj,10))}.`);}else avisos.push(`dT/dTpa: apenas ${tet.length} registro(s) identificado(s); conferir/completar 3 doses.`);
  }
  if(grupo==='crianca'){
    const agenda=[[0,'BCG','bcg'],[2,'Penta 1ª, VIP 1ª, Pneumo 1ª e Rotavírus 1ª','penta'],[3,'Meningocócica C 1ª','meningo'],[4,'Penta 2ª, VIP 2ª, Pneumo 2ª e Rotavírus 2ª','penta'],[5,'Meningocócica C 2ª','meningo'],[6,'Penta 3ª, VIP 3ª, influenza e covid-19','penta'],[9,'Febre amarela e covid-19 conforme esquema','fa'],[12,'Pneumo reforço, Meningo ACWY e SCR 1ª','scr'],[15,'DTP/VIP reforço, SCR 2ª, varicela e Hepatite A','varicela'],[48,'DTP 2º reforço, febre amarela reforço e varicela','dt']];
    agenda.filter(x=>idade.meses>=x[0]&&!tipos(x[2]).length).forEach(x=>avisos.push(`${x[1]}: nenhum registro identificado para a idade.`));
    if(idade.meses>=6&&idade.meses<72&&!tipos('influenza').some(r=>r.dataObj.getFullYear()===hoje.getFullYear()))avisos.push('Influenza: dose anual não identificada nesta temporada.');
  } else if(grupo==='jovem'){
    if(idade.anos>=9&&idade.anos<=14&&!tipos('hpv').length)avisos.push('HPV4: dose única não identificada para 9 a 14 anos.');
    if(idade.anos>=10&&idade.anos<=14&&tipos('dengue').length<2)avisos.push('Dengue: conferir/completar 2 doses conforme oferta e histórico.');
    if(idade.anos>=11&&idade.anos<=14&&!tipos('meningo').length)avisos.push('Meningocócica ACWY: dose não identificada para 11 a 14 anos.');
    const scr=tipos('scr').length;if(scr<2)avisos.push(`Tríplice viral: ${scr} registro(s); até 29 anos o PNI indica 2 doses.`);
  } else if(grupo==='adulto'){
    const meta=idade.anos<=29?2:1,scr=tipos('scr').length;if(scr<meta)avisos.push(`Tríplice viral: ${scr} registro(s); PNI indica ${meta} dose(s) nesta faixa etária.`);
    if(!tipos('fa').length)avisos.push('Febre amarela: sem registro; avaliar indicação conforme histórico e área de risco.');
  } else if(grupo==='idoso'){
    if(!tipos('influenza').some(r=>r.dataObj.getFullYear()===hoje.getFullYear()))avisos.push('Influenza: dose anual da temporada não identificada.');
    const covid=ultima('covid');if(!covid||vacAddMes(covid.dataObj,6)<=hoje)avisos.push('Covid-19: para idosos, conferir dose semestral.');
    if(!tipos('fa').length)avisos.push('Febre amarela: aos 60 anos ou mais, somente após avaliação individual de risco-benefício.');
  }
  if(grupo==='gestante'){
    const ig=parseInt((document.getElementById(cfg.ig)?.value||'').match(/\d+/)?.[0]||'0');
    if(!tipos('influenza').some(r=>r.dataObj.getFullYear()===hoje.getFullYear()))avisos.push('Gestante: influenza da temporada não identificada.');
    if(!tipos('covid').some(r=>r.dataObj>=new Date(hoje.getFullYear()-1,0,1)))avisos.push('Gestante: conferir 1 dose de covid-19 em cada gestação.');
    if(ig>=20&&!tipos('dtpa').some(r=>r.dataObj>=new Date(hoje.getFullYear()-1,0,1)))avisos.push('Gestante com 20 semanas ou mais: dTpa indicada em cada gestação.');
    if(ig>=28&&!tipos('vsr').some(r=>r.dataObj>=new Date(hoje.getFullYear()-1,0,1)))avisos.push('Gestante com 28 semanas ou mais: vacina VSR indicada em cada gestação.');
    if(tipos('scr').length)ok.push('Tríplice viral consta no histórico; vacina viva não deve ser aplicada durante a gestação.');
  }
  if(!avisos.length)ok.push('Nenhuma pendência evidente identificada no cruzamento automático.');
  return{avisos,ok};
}
function montarAvaliadoresVacinais(){
  VAC_MODULOS.forEach(cfg=>{
    const alvo=document.getElementById(cfg.alvo);if(!alvo||document.getElementById(`vac-card-${cfg.p}`))return;
    const card=document.createElement('div');card.className='card';card.id=`vac-card-${cfg.p}`;
    card.innerHTML=`<div class="ct"><span class="dot dg"></span>Avaliação Vacinal — PNI</div><div class="alert alert-i" style="margin-bottom:10px">Cole abaixo o histórico exportado do sistema. A interpretação considera data de nascimento, ciclo de vida e, quando aplicável, idade gestacional.</div><div class="f"><label>Histórico de vacinas</label><textarea id="vac-texto-${cfg.p}" style="min-height:150px" placeholder="Cole aqui as linhas com data, vacina, lote, dose, profissional e unidade..."></textarea></div><div class="brow"><button class="btn btn-p" type="button" onclick="avaliarVacinasModulo('${cfg.p}')">Interpretar histórico vacinal</button><button class="btn btn-s" type="button" onclick="document.getElementById('vac-texto-${cfg.p}').value='';document.getElementById('vac-out-${cfg.p}').innerHTML=''">Limpar</button></div><div id="vac-out-${cfg.p}" style="margin-top:12px"></div>`;
    alvo.appendChild(card);
    document.getElementById(cfg.nasc)?.addEventListener('change',()=>avaliarVacinasModulo(cfg.p));
  });
}
function sincronizarVacinasPna(registros){
  const hoje=new Date(),validos=registros.filter(r=>r.dataObj&&r.dataObj<=hoje),tipos=t=>validos.filter(r=>r.tipo===t).sort((a,b)=>b.dataObj-a.dataObj),set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
  const tet=[...tipos('dt'),...tipos('dtpa'),...tipos('penta')].sort((a,b)=>b.dataObj-a.dataObj);
  if(tet.length<3)set('vac-dt-hist',String(tet.length));
  else{const anos=(hoje-tet[0].dataObj)/(365.25*86400000);set('vac-dt-hist',anos<5?'3menos5':anos<=10?'3de5a10':'3mais10');}
  const recente=t=>tipos(t).some(r=>(hoje-r.dataObj)/(86400000)<=366);
  set('vac-dtpa-status',recente('dtpa')?'sim':'nao');
  const hb=tipos('hepb').length;set('vac-hepb-hist',hb>=3?'completo':hb>0?'incompleto':'naovacinada');
  set('vac-inf-status',tipos('influenza').some(r=>r.dataObj.getFullYear()===hoje.getFullYear())?'sim':'nao');
  set('vac-covid-status',recente('covid')?'atualizada':'avaliar');
  set('vac-vsr-status',recente('vsr')?'sim':'nao');
  avaliarVacinacaoPna();
  const out=document.getElementById('pna-vac-sync-status');if(out)out.innerHTML='<div class="alert alert-s"><strong>Preenchimento automático:</strong> os campos abaixo foram atualizados pelo histórico vacinal informado na identificação. Confira e ajuste manualmente se necessário.</div>';
}
function avaliarVacinasModulo(prefix){
  const cfg=VAC_MODULOS.find(x=>x.p===prefix),out=document.getElementById(`vac-out-${prefix}`),texto=document.getElementById(`vac-texto-${prefix}`)?.value||'';if(!cfg||!out)return null;
  if(!texto.trim()){out.innerHTML='';return null;}
  const registros=interpretarHistoricoVacinal(texto),avaliacao=avaliarPNIVacinas(cfg,registros);
  const tabela=registros.map(r=>`<tr><td class="vac-date">${vacEsc(r.data)}</td><td class="vac-name">${vacEsc(r.vacina)}</td><td class="vac-dose">${vacEsc(r.dose||'—')}</td><td class="vac-next">${vacEsc(proximaDataRegistro(r,registros))}</td><td class="vac-prof">${vacEsc(r.prof||'—')}</td><td class="vac-unit">${vacEsc(r.unidade||'—')}</td></tr>`).join('');
  out.innerHTML=`<div class="vac-result-block"><div class="lab-summary"><div class="lab-summary-item ok"><strong>${registros.length}</strong><span>Aplicações lidas</span></div><div class="lab-summary-item att"><strong>${avaliacao.avisos.length}</strong><span>Conferir/atualizar</span></div><div class="lab-summary-item ok"><strong>${avaliacao.ok.length}</strong><span>Adequados</span></div></div>${avaliacao.avisos.length?`<div class="vac-alert-section"><div class="vac-alert-title">Pendências e itens para conferir</div>${avaliacao.avisos.map(x=>`<div class="alert alert-w">${vacEsc(x)}</div>`).join('')}</div>`:''}${avaliacao.ok.length?`<div class="vac-alert-section"><div class="vac-alert-title">Registros adequados identificados</div>${avaliacao.ok.map(x=>`<div class="alert alert-s">${vacEsc(x)}</div>`).join('')}</div>`:''}<div class="vac-alert-title">Aplicações registradas</div><div class="vac-table-wrap"><table class="vac-table"><thead><tr><th class="vac-date">Data</th><th class="vac-name">Vacina</th><th class="vac-dose">Dose</th><th class="vac-next">Próxima data/condição</th><th class="vac-prof">Profissional</th><th class="vac-unit">Unidade</th></tr></thead><tbody>${tabela}</tbody></table></div><div class="alert alert-i"><strong>Fonte:</strong> Calendário Nacional de Vacinação do Ministério da Saúde/PNI, consultado em 13/06/2026. Validar intervalos, doses válidas, condições especiais e contraindicações com a sala de vacina/CRIE.</div></div>`;
  if(prefix==='pna')sincronizarVacinasPna(registros);
  const vacinasLidas=[...new Set(registros.map(r=>r.tipo||r.vacina).filter(Boolean))].slice(0,8).join(', ');
  VAC_RESULTADOS[prefix]={registros,avaliacao,resumo:`Avaliação vacinal PNI: ${registros.length} aplicações lidas${vacinasLidas?` (${vacinasLidas})`:''}. ${avaliacao.avisos.length?`Pendências/itens para conferir: ${avaliacao.avisos.join(' ')}`:'Nenhuma pendência automática nos itens avaliados; confirmar intervalos, contraindicações, situações especiais e CRIE com a sala de vacina.'}`};
  return VAC_RESULTADOS[prefix];
}
function resumoVacinalSoap(prefix){
  const d=VAC_RESULTADOS[prefix];if(!d)return'';
  const linhas=[`Histórico analisado: ${d.registros.length} aplicações registradas.`];
  const vacinas=[...new Set(d.registros.map(r=>`${r.vacina}${r.dose?` (${r.dose})`:''}${r.data?` em ${r.data}`:''}`).filter(Boolean))].slice(0,6);
  if(vacinas.length){linhas.push('Registros conferidos:');vacinas.forEach(x=>linhas.push(`- ${x}`));}
  if(d.avaliacao.avisos.length){linhas.push('Pendências/itens para conferir:');d.avaliacao.avisos.forEach(x=>linhas.push(`- ${x}`));}
  else linhas.push('Sem pendência automática nos itens avaliados; confirmar intervalos, contraindicações, situações especiais e indicação de CRIE com a sala de vacina.');
  return linhas.join('\n');
}
setTimeout(()=>{organizarEtapaPuericultura();montarCentralPNI();montarAvaliadoresVacinais();montarLeitoresLivres();},0);

// ── SOAP GENERATORS ──────────────────────────────
// Testes rapidos e laudo padronizado
const trResultadoOptions='<option value="">— selecionar —</option><option>NÃO REAGENTE</option><option>REAGENTE</option><option>INVÁLIDO</option><option>NÃO REALIZADO</option>';
function trLinha(prefix,key,titulo){return `<div class="tr-test-grid"><div class="tr-test-title">${titulo}</div><div class="f"><label>Marca / lote</label><input id="${prefix}-${key}-marca"></div><div class="f"><label>Resultado</label><select id="${prefix}-${key}-res" onchange="avaliarResultadosTR()">${trResultadoOptions}</select></div></div>`;}
function montarCamposTR(prefix,duo){
  const alvo=document.getElementById(`${prefix}-testes`);if(!alvo)return;
  alvo.innerHTML=duo?`<div class="alert alert-s" style="margin-top:10px"><strong>Gestante:</strong> utilizar teste rápido DUO HIV/Sífilis como TR1 e registrar TR2 para HIV quando indicado pelo fluxo diagnóstico.</div>${trLinha(prefix,'duo-hiv','DUO — HIV TR 1 e marca/lote')}<div class="tr-test-grid"><div class="tr-test-title">DUO — resultado Sífilis</div><div class="f"><label>Mesmo kit DUO informado acima</label><input class="ro" readonly value="Marca/lote compartilhados"></div><div class="f"><label>Resultado</label><select id="${prefix}-duo-sif-res" onchange="avaliarResultadosTR()">${trResultadoOptions}</select></div></div>${trLinha(prefix,'duo-hiv2','HIV — TR 2, se indicado')}${trLinha(prefix,'hepb','Hepatite B — HBsAg')}${trLinha(prefix,'hepc','Hepatite C — Anti-HCV')}`:`<div class="alert alert-i" style="margin-top:10px"><strong>Não gestante:</strong> HIV e sífilis realizados separadamente.</div>${trLinha(prefix,'hiv','HIV — TR 1')}${trLinha(prefix,'hiv2','HIV — TR 2, se indicado')}${trLinha(prefix,'sif','Sífilis')}${trLinha(prefix,'hepb','Hepatite B — HBsAg')}${trLinha(prefix,'hepc','Hepatite C — Anti-HCV')}`;
}
function copiarDadosPacienteParaTR(){const copy=(a,b)=>{const x=document.getElementById(a),y=document.getElementById(b);if(x&&y)y.value=x.value||'';};copy('pna-nome','tr-p-nome');copy('pna-prontuario','tr-p-pront');copy('pna-nasc','tr-p-nasc');copy('pna-data','tr-p-data');copy('pna-hora','tr-p-hora');copy('pna-enf','tr-p-executor');}
function atualizarTestesRapidosPna(){
  copiarDadosPacienteParaTR();const gestante=document.getElementById('tr-principal-condicao')?.value==='gestante',parceiro=document.getElementById('tr-parceiro-presente')?.value==='sim';
  montarCamposTR('tr-p',gestante);montarCamposTR('tr-c',false);document.getElementById('tr-p-sexo').value=gestante?'Feminino':document.getElementById('tr-p-sexo').value;document.getElementById('tr-parceiro-box').style.display=parceiro?'block':'none';
  const parceiroNome=document.getElementById('tr-c-nome');if(parceiroNome&&!parceiroNome.value)parceiroNome.value=document.getElementById('pna-parceiro')?.value||'';
  const today=new Date().toISOString().slice(0,10),time=new Date().toTimeString().slice(0,5);['tr-p-data','tr-c-data'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.value)e.value=today;});['tr-p-hora','tr-c-hora'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.value)e.value=time;});const ex=document.getElementById('tr-c-executor');if(ex&&!ex.value)ex.value=document.getElementById('pna-enf')?.value||'';
}
function avaliarResultadosTR(){
  const preencher=(seletor,outId)=>{const reag=Array.from(document.querySelectorAll(`${seletor} select[id$="-res"]`)).filter(x=>x.value==='REAGENTE').map(x=>x.closest('.tr-test-grid')?.querySelector('.tr-test-title')?.textContent).filter(Boolean),out=document.getElementById(outId);if(out)out.innerHTML=reag.length?`<div class="alert alert-e"><strong>Resultado(s) reagente(s):</strong> ${reag.join('; ')}. Realizar acolhimento, aconselhamento pós-teste, registro e ativar o fluxo protocolar correspondente.</div>`:'';return reag};
  preencher('#pna-tr','tr-alertas');const reagIST=preencher('#pg-ist','ist-tr-alertas'),outIST=document.getElementById('ist-tr-alertas');if(reagIST.length&&outIST){const r=resumoTestesRapidosIST();outIST.innerHTML=`<div class="alert alert-e"><strong>Conduta protocolada — Toledo:</strong><div style="white-space:pre-line;margin-top:5px">${r.conduta}</div></div>`}const e=document.getElementById('ist-alerts');if(e){const outros=(e.value||'').split('; ').filter(x=>x&&x!=='Teste reagente'&&x!=='Gestante com teste reagente');e.value=[...new Set([...outros,reagIST.length?'Teste reagente':'',reagIST.length&&document.getElementById('ist-tr-condicao')?.value==='gestante'?'Gestante com teste reagente':''].filter(Boolean))].join('; ')}if(typeof avaliarPrioridadeModulo==='function')avaliarPrioridadeModulo('ist');avaliarProtocolosPna();
}
function trVal(id,fallback=''){return(document.getElementById(id)?.value||fallback).trim();}function formatarDataBR(data){if(!data)return'';const p=data.split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:data;}function idadePorNascimento(data){if(!data)return'';const n=new Date(data+'T12:00:00'),h=new Date();let a=h.getFullYear()-n.getFullYear();if(h<new Date(h.getFullYear(),n.getMonth(),n.getDate()))a--;return String(a);}
function dadosLaudoTR(prefix,gestante){
  const nome=trVal(`${prefix}-nome`),nasc=trVal(`${prefix}-nasc`),hivKey=gestante?'duo-hiv':'hiv',hiv2Key=gestante?'duo-hiv2':'hiv2',sifKey=gestante?'duo-sif':'sif',res=k=>trVal(`${prefix}-${k}-res`,'NÃO REALIZADO'),marca=k=>trVal(`${prefix}-${k}-marca`,'NÃO INFORMADO'),hiv1=res(hivKey),hiv2=res(hiv2Key);
  return{nome,pront:trVal(`${prefix}-pront`),nasc:formatarDataBR(nasc),idade:idadePorNascimento(nasc),sexo:trVal(`${prefix}-sexo`),municipio:trVal(prefix.startsWith('ist-')?'ist-tr-municipio':'tr-municipio','Toledo'),unidade:PROTO?.unit?.nome||'ESF - COSMOS',cidade:PROTO?.unit?.cidade||'TOLEDO - PR',data:formatarDataBR(trVal(`${prefix}-data`)),hora:trVal(`${prefix}-hora`),executor:trVal(`${prefix}-executor`),hivMarca:marca(hivKey),hiv1,hiv2Marca:marca(hiv2Key),hiv2,hivConclusao:hiv1==='NÃO REAGENTE'?'AMOSTRA NÃO REAGENTE':(hiv1==='REAGENTE'&&hiv2==='REAGENTE'?'AMOSTRA REAGENTE':'AMOSTRA INCONCLUSIVA'),sifMarca:gestante?marca('duo-hiv'):marca(sifKey),sif:res(sifKey),hepbMarca:marca('hepb'),hepb:res('hepb'),hepcMarca:marca('hepc'),hepc:res('hepc')};
}
function resumoTestesRapidosPna(){
  const d=dadosLaudoTR('tr-p',document.getElementById('tr-principal-condicao')?.value==='gestante'),todos=[['HIV TR1',d.hiv1],['HIV TR2',d.hiv2],['Sífilis',d.sif],['Hepatite B',d.hepb],['Hepatite C',d.hepc]],realizados=todos.filter(([,r])=>r&&!/NÃO REALIZADO|NAO REALIZADO/i.test(r)),pendentes=todos.filter(([,r])=>!r||/NÃO REALIZADO|NAO REALIZADO/i.test(r)).map(x=>x[0]),reag=realizados.filter(([,r])=>r==='REAGENTE');
  const texto=realizados.length?realizados.map(([n,r])=>`${n}: ${r.toLowerCase()}`).join('; '):'';
  const conduta=[reag.length?`Resultado(s) reagente(s): ${reag.map(x=>x[0]).join('; ')}. Ativar o fluxo protocolar correspondente, realizar aconselhamento pós-teste e registros indicados.`:'',pendentes.length?`Pendentes testes rápidos para ${pendentes.join(', ')}, a serem realizados conforme protocolo local.`:''].filter(Boolean).join(' ');
  return{texto,realizados,pendentes,conduta};
}
function escTR(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function blocoLaudoTR(titulo,marca,resultado,notas){return`<section class="test"><h2>${titulo}</h2><div>Material: Sangue Total por punção digital</div><div class="line"><b>Teste Rápido (Marca/Lote):</b><span>${escTR(marca)}</span><small>Valor de Referência: Não Reagente</small></div><div class="line"><b>RESULTADO:</b><span class="result">${escTR(resultado)}</span><small>Método: Imunocromatográfico</small></div><div class="notes">${notas}</div></section>`;}
function paginaLaudoTR(d){
const hivNotas='<b>De acordo com a Portaria Nº 29, de 17 de dezembro de 2013 - SVS - Ministério da Saúde</b><br>1. Resultados reagentes devem seguir o fluxo diagnóstico vigente.<br>2. No resultado não reagente, diante de suspeita de infecção, realizar nova coleta conforme protocolo.',sifNotas='<b>De acordo com a Portaria nº 3.242, de 30 de dezembro de 2011 - SVS - Ministério da Saúde</b><br>1. O teste rápido utilizado é um teste treponêmico.<br>2. No resultado reagente, realizar teste não treponêmico (VDRL) e seguir o fluxo vigente.',hepBNotas='<b>De acordo com a Portaria nº 25 de 01 de dezembro de 2015 - SVS - Ministério da Saúde</b><br>Teste de triagem para Hepatite B. Resultado reagente requer testes complementares e seguimento protocolar. Avaliar esquema vacinal.',hepCNotas='<b>De acordo com a Portaria nº 25 de 01 de dezembro de 2015 - SVS - Ministério da Saúde</b><br>Teste de triagem para Hepatite C. Resultado reagente requer testes complementares para conclusão diagnóstica.';
return`<article class="page"><header><div class="logos"><img src="${LAUDO_TR_BRASAO}" alt="Prefeitura de Toledo"><img class="family" src="${LAUDO_TR_FAMILIA}" alt="Saúde da Família"></div><div class="sf">Saúde da Família</div><div><b>PREFEITURA MUNICIPAL DE TOLEDO</b><br>${escTR(d.unidade)}<br>${escTR(d.cidade)}</div></header><div class="patient"><b>Nome do Paciente:</b> ${escTR(d.nome)}<br><b>Nome Social:</b> _______________________________________________<br><b>Prontuário:</b> ${escTR(d.pront)} &nbsp;&nbsp; <b>Data Nascimento:</b> ${escTR(d.nasc)} &nbsp;&nbsp; <b>Idade:</b> ${escTR(d.idade)} anos &nbsp;&nbsp; <b>Sexo:</b> ${escTR(d.sexo)}</div><h1>LAUDO DE TESTE RÁPIDO (TR) PARA DIAGNÓSTICO</h1><section class="test"><h2>Pesquisa de Anticorpos Anti HIV-1 / HIV-2</h2><div>Material: Sangue Total por punção digital</div><div class="line"><b>TR 1 (Marca/Lote):</b><span>${escTR(d.hivMarca)}</span><small>Valor de Referência: Não Reagente</small></div><div class="line"><b>RESULTADO:</b><span class="result">${escTR(d.hiv1)}</span><small>Método: Imunocromatográfico</small></div><div class="line"><b>TR 2 (Marca/Lote):</b><span>${escTR(d.hiv2Marca)}</span><small>Valor de Referência: Não Reagente</small></div><div class="line"><b>RESULTADO:</b><span class="result">${escTR(d.hiv2)}</span><small>Método: Imunocromatográfico</small></div><div class="line"><b>Conclusão:</b><span>${escTR(d.hivConclusao)}</span></div><div class="notes">${hivNotas}</div></section>${blocoLaudoTR('Pesquisa de Anticorpos para SÍFILIS',d.sifMarca,d.sif,sifNotas)}${blocoLaudoTR('Pesquisa de Antígenos de Superfície para HEPATITE B - HBsAg',d.hepbMarca,d.hepb,hepBNotas)}${blocoLaudoTR('Pesquisa de Anticorpos para HEPATITE C - Anti-HCV',d.hepcMarca,d.hepc,hepCNotas)}<div class="sign"><span>Assinatura e Carimbo do Executor<br><b>${escTR(d.executor)}</b></span><span>Assinatura e Carimbo do Técnico Responsável</span></div><div class="collect"><b>Município:</b> ${escTR(d.municipio)} &nbsp;&nbsp; <b>Data da Coleta:</b> ${escTR(d.data)} &nbsp;&nbsp; <b>Horário leitura do TR:</b> ${escTR(d.hora)}</div><section class="cert"><b>CERTIFICAÇÃO DA IDENTIFICAÇÃO E ORIENTAÇÃO</b><br>Recebi todas as orientações sobre o procedimento e laudo dos Testes Rápidos HIV, Sífilis, Hepatites B e C.<br><br>Assinatura do Paciente: ______________________________________________</section></article>`;
}
function abrirLaudosTR(paginas){const w=window.open('','_blank');if(!w){alert('Permita a abertura de janelas para gerar o laudo.');return;}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><base href="${escTR(location.href)}"><title>Laudo de Teste Rápido</title><style>@page{size:A4;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#000;margin:0}.page{width:100%;min-height:277mm;page-break-after:always;font-size:10px}.page:last-child{page-break-after:auto}header{display:grid;grid-template-columns:112px 145px 1fr;align-items:center;border-top:1px solid #000;border-bottom:1px solid #000}.logos{display:flex;align-items:center;justify-content:center;gap:5px;border-left:0!important;padding:2px!important}.logos img{width:47px;height:35px;object-fit:contain;margin:0}.logos img.family{width:55px}.sf{text-align:center;font-size:15px;font-weight:bold}header>div{padding:5px;border-left:1px solid #000;line-height:1.45}.patient{border:1px solid #000;margin-top:4px;padding:5px;line-height:1.8;font-size:11px}h1{text-align:center;font-size:12px;margin:7px 0}.test{border:1px solid #000;margin-top:4px}.test h2{font-size:11px;margin:0;padding:3px;background:#e8e8e8;border-bottom:1px solid #000}.test>div{padding:2px 4px}.line{display:grid;grid-template-columns:150px 1fr 205px;gap:4px;align-items:end}.line span{border-bottom:1px solid #000;min-height:14px}.line small{text-align:right}.result{font-weight:bold}.notes{text-align:center;font-size:8px;line-height:1.35;border-top:1px solid #aaa}.sign{display:grid;grid-template-columns:1fr 1fr;gap:50px;text-align:center;margin-top:20px}.sign span{border-top:1px solid #000;padding-top:4px}.collect,.cert{border:1px solid #000;padding:5px;margin-top:9px}.cert{text-align:center;line-height:1.6}@media print{body{margin:0}}</style></head><body>${paginas.join('')}<script>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close();}
function gerarLaudoTesteRapido(pessoa){if(!exigirPermissao('gerar_documentos'))return;copiarDadosPacienteParaTR();const gestante=pessoa==='p'&&document.getElementById('tr-principal-condicao').value==='gestante',dados=dadosLaudoTR(`tr-${pessoa}`,gestante);if(!dados.nome){alert('Informe o nome da pessoa antes de gerar o laudo.');return;}abrirLaudosTR([paginaLaudoTR(dados)]);}
function gerarTodosLaudosTesteRapido(){if(!exigirPermissao('gerar_documentos'))return;copiarDadosPacienteParaTR();const principal=dadosLaudoTR('tr-p',document.getElementById('tr-principal-condicao').value==='gestante');if(!principal.nome){alert('Informe os dados da pessoa principal.');return;}const paginas=[paginaLaudoTR(principal)];if(document.getElementById('tr-parceiro-presente').value==='sim'){const c=dadosLaudoTR('tr-c',false);if(!c.nome){alert('Informe os dados do parceiro(a).');return;}paginas.push(paginaLaudoTR(c));}abrirLaudosTR(paginas);}
document.addEventListener('DOMContentLoaded',()=>{atualizarTestesRapidosPna();['pna-nome','pna-prontuario','pna-nasc','pna-data','pna-hora','pna-enf'].forEach(id=>document.getElementById(id)?.addEventListener('input',copiarDadosPacienteParaTR));});

// Guia clinico rapido usado por todos os tipos de consulta.
const cp=(text,level='normal',conduta='')=>({text,level,conduta});
const gestanteAnamnese=[
  {title:'Queixas obstétricas',items:[cp('Nega queixas'),cp('Nega sangramento vaginal'),cp('Nega perda de líquido'),cp('Nega dor abdominal intensa'),cp('Nega disúria e corrimento alterado'),cp('Náuseas / vômitos','attention'),cp('Pirose / azia','attention'),cp('Dor abdominal / cólicas','critical'),cp('Dor lombar / pélvica','attention'),cp('Cãibras','attention'),cp('Constipação / flatulência','attention'),cp('Hemorroidas','attention'),cp('Disúria / ITU','critical'),cp('Sangramento vaginal','critical'),cp('Perda de líquido','critical'),cp('Corrimento vaginal alterado','attention'),cp('Contrações antes de 37s','critical')]},
  {title:'Sinais gerais e de alerta',items:[cp('Movimentos fetais presentes'),cp('Nega cefaleia persistente, alterações visuais e dor epigástrica/HCD'),cp('Nega febre e dispneia'),cp('Diminuição de MF','critical'),cp('Cefaleia','attention'),cp('Tontura / desmaio / fraqueza','attention'),cp('Dispneia','critical'),cp('Alterações visuais / escotomas','critical'),cp('Dor epigástrica / hipocôndrio direito','critical'),cp('Edema de face/mãos','critical')]}
];
const gestanteExame=[
  {title:'Condicoes gerais (CG)',items:[cp('BEG, LOTE, CHAAA, eupneica'),cp('Descorada +/4+','attention'),cp('Descorada ++/4+','attention'),cp('MEG','critical','Solicitar avaliacao medica imediata.')]},
  {title:'Ausculta pulmonar (AP)',items:[cp('MV+ bilateralmente, sem RA'),cp('Roncos','attention'),cp('Sibilos','attention'),cp('Crepitacoes em bases','attention'),cp('MV diminuido ou abolido','critical','Solicitar avaliacao medica imediata.')]},
  {title:'Ausculta cardiaca (AC)',items:[cp('BRNF 2T, sem sopros'),cp('Sopro cardiaco','attention'),cp('Arritmia','attention'),cp('Sinais de instabilidade','critical','Solicitar avaliacao medica imediata.')]},
  {title:'Abdome obstetrico (ABD)',items:[cp('Globoso gravidico, indolor'),cp('Contracoes esporadicas','attention'),cp('Dor a palpacao','attention'),cp('Dor epigastrica ou HCD','critical','Investigar sindrome hipertensiva e realizar avaliacao obstetrica imediata.')]},
  {title:'MMII',items:[cp('Sem edema, pulsos presentes'),cp('Edema +/4+','attention'),cp('Edema ++/4+','attention'),cp('Edema +++/4+','critical','Aferir PA, investigar sinais associados e solicitar avaliacao medica.'),cp('Homans positivo','critical','Avaliar imediatamente suspeita de trombose venosa profunda.')]},
  {title:'Mamas e colo uterino',items:[cp('Mamas sem alteracoes'),cp('Colostro presente'),cp('Fissura mamilar','attention'),cp('Ingurgitamento','attention'),cp('Nodulo mamario','critical','Encaminhar para avaliacao de nodulo mamario.'),cp('Colo posterior, longo e fechado'),cp('Apagamento parcial','attention'),cp('Colo dilatado','critical','Avaliar trabalho de parto imediatamente.')]}
];
const commonAdultExam=[
  {title:'Condicoes gerais (CG)',items:[cp('BEG, LOTE, afebril, hidratado, eupneico'),cp('Desidratado','attention'),cp('Febril','attention'),cp('MEG ou rebaixamento do sensorio','critical','Solicitar avaliacao medica imediata.')]},
  {title:'Ausculta pulmonar (AP)',items:[cp('MV+ bilateralmente, sem RA'),cp('Roncos','attention'),cp('Sibilos','attention'),cp('Crepitacoes','attention'),cp('Esforco respiratorio ou MV abolido','critical','Solicitar avaliacao medica imediata.')]},
  {title:'Ausculta cardiaca (AC)',items:[cp('BRNF 2T, sem sopros, TEC <3s'),cp('Sopro','attention'),cp('Arritmia','attention'),cp('Dor toracica ou instabilidade','critical','Acionar avaliacao medica/urgencia imediatamente.')]},
  {title:'Abdome (ABD)',items:[cp('Plano, depressivel, RHA+, indolor, sem peritonismo'),cp('Dor localizada','attention'),cp('Distensao','attention'),cp('Defesa ou sinais de peritonite','critical','Solicitar avaliacao medica imediata.')]},
  {title:'MMII e neurologico',items:[cp('Sem edema, pulsos palpaveis, panturrilhas livres'),cp('Edema','attention'),cp('Homans positivo','critical','Avaliar imediatamente suspeita de trombose venosa profunda.'),cp('Sem deficit neurologico focal'),cp('Deficit neurologico focal agudo','critical','Acionar fluxo de urgencia imediatamente.')]}
];
const CLINICAL_PRESETS={
  pna:{anamnesisLocation:'pna-3',examLocation:'pna-4',examTarget:'Exame Físico Específico',anamnesis:gestanteAnamnese,exam:gestanteExame},
  pnc:{anamnesisLocation:'pnc-2',examLocation:'pnc-3',examTarget:'Exame Físico Específico e Obstétrico',anamnesis:[],exam:gestanteExame},
  pu:{anamnesisLocation:'pu-2',examLocation:'pu-4',examTarget:'Exame Físico',anamnesis:[
    {title:'Alimentacao e eliminacoes',items:[cp('Alimentacao adequada'),cp('Diurese e evacuacoes sem alteracoes'),cp('Dificuldade alimentar','attention'),cp('Recusa alimentar','critical','Avaliar imediatamente hidratacao e estado geral.')]},
    {title:'Queixas atuais',items:[cp('Sem queixas atuais'),cp('Febre','attention'),cp('Tosse ou coriza','attention'),cp('Vomitos ou diarreia','attention'),cp('Convulsao, cianose ou letargia','critical','Encaminhar imediatamente para avaliacao de urgencia.')]},
    {title:'Sono e desenvolvimento',items:[cp('Sono adequado'),cp('Desenvolvimento adequado para idade'),cp('Possivel atraso de marco','attention'),cp('Perda de habilidades adquiridas','critical','Solicitar avaliacao medica e do desenvolvimento prioritariamente.')]}
  ],exam:[
    {title:'Condicoes gerais',items:[cp('BEG, ativa, reativa, hidratada'),cp('Irritavel','attention'),cp('Desidratada','attention'),cp('Letargica ou MEG','critical','Solicitar avaliacao medica imediata.')]},
    {title:'Cabeca e fontanela',items:[cp('Fontanela normotensa'),cp('Fontanela deprimida','attention'),cp('Fontanela abaulada','critical','Solicitar avaliacao medica imediata.')]},
    {title:'Cardiorrespiratorio',items:[cp('MV+ sem RA; BRNF 2T sem sopros'),cp('Sibilos ou roncos','attention'),cp('Sopro cardiaco','attention'),cp('Tiragem, cianose ou esforco respiratorio','critical','Encaminhar imediatamente para avaliacao de urgencia.')]},
    {title:'Abdome, pele e desenvolvimento',items:[cp('Abdome flacido, indolor; pele integra'),cp('Dermatite de fralda','attention'),cp('Dor ou distensao abdominal','attention'),cp('Petequias','critical','Solicitar avaliacao medica imediata.'),cp('DNPM adequado para idade'),cp('Sinais de atraso do DNPM','attention')]}
  ]},
  prev:{anamnesisLocation:'prev-2',examLocation:'prev-3',examTarget:'11. Inspeção do Colo',anamnesis:[
    {title:'Queixas ginecologicas',items:[cp('Sem queixas ginecologicas'),cp('Corrimento ou odor','attention'),cp('Prurido genital','attention'),cp('Dispareunia','attention'),cp('Dor pelvica','attention')]},
    {title:'Sangramentos e IST',items:[cp('Nega sangramento anormal'),cp('Sangramento pos-coito','critical','Encaminhar para avaliacao medica/ginecologica prioritaria.'),cp('Sangramento pos-menopausa','critical','Encaminhar para avaliacao medica/ginecologica prioritaria.'),cp('Exposicao ou suspeita de IST','attention')]}
  ],exam:[
    {title:'Mamas',items:[cp('Mamas sem alteracoes'),cp('Dor mamaria','attention'),cp('Nodulo mamario','critical','Encaminhar para avaliacao diagnostica de nodulo mamario.'),cp('Descarga papilar suspeita','critical','Encaminhar para avaliacao diagnostica prioritaria.')]},
    {title:'Vulva e exame especular',items:[cp('Vulva sem alteracoes'),cp('Colo visualizado, sem lesoes'),cp('Corrimento vaginal','attention'),cp('Colo friavel','attention'),cp('Lesao suspeita em colo ou vulva','critical','Encaminhar para avaliacao ginecologica/colposcopia conforme protocolo.')]},
    {title:'Coleta',items:[cp('Coleta realizada sem intercorrencias'),cp('Material adequado'),cp('Material possivelmente inadequado','attention')]}
  ]},
  id:{anamnesisLocation:'id-2',examLocation:null,anamnesis:[
    {title:'Rotina e funcionalidade',items:[cp('Sem queixas atuais'),cp('Adesao adequada aos medicamentos'),cp('Sono, apetite e eliminacoes preservados'),cp('Queda recente','attention'),cp('Tontura','attention'),cp('Incontinencia','attention')]},
    {title:'Cognicao e humor',items:[cp('Memoria e humor sem mudancas'),cp('Queixa de memoria','attention'),cp('Humor deprimido','attention'),cp('Confusao mental aguda','critical','Solicitar avaliacao medica imediata.')]},
    {title:'Sinais de alerta',items:[cp('Nega sinais de alerta'),cp('Dor toracica ou dispneia','critical','Acionar avaliacao medica/urgencia imediatamente.'),cp('Deficit neurologico focal','critical','Acionar fluxo de urgencia imediatamente.')]}
  ],exam:commonAdultExam.concat([{title:'Mobilidade, pele e cognicao',items:[cp('Marcha estavel e pele integra'),cp('Marcha instavel','attention'),cp('Lesao por pressao','attention'),cp('Delirium','critical','Solicitar avaliacao medica imediata.')]}])},
  sm:{anamnesisLocation:'sm-2',examLocation:null,anamnesis:[
    {title:'Humor e rotina',items:[cp('Humor estavel, sono e apetite preservados'),cp('Ansiedade','attention'),cp('Humor deprimido','attention'),cp('Insonia','attention'),cp('Uso problematico de substancias','attention')]},
    {title:'Risco atual',items:[cp('Nega ideacao suicida e heteroagressividade'),cp('Ideacao suicida sem plano','critical','Realizar avaliacao imediata de seguranca e risco suicida.'),cp('Ideacao suicida com plano','critical','Nao deixar paciente desacompanhado e acionar fluxo de urgencia.'),cp('Agitacao ou agressividade','critical','Garantir seguranca e acionar avaliacao imediata.'),cp('Sintomas psicoticos','critical','Solicitar avaliacao imediata e definir fluxo de urgencia.')]}
  ],exam:[
    {title:'Aparencia e atitude',items:[cp('Apresentacao adequada, cooperativo e vigil'),cp('Autocuidado prejudicado','attention'),cp('Agitado ou pouco cooperativo','critical','Avaliar seguranca e necessidade de suporte imediato.')]},
    {title:'Orientacao, humor e pensamento',items:[cp('Orientado, discurso coerente, pensamento organizado'),cp('Humor deprimido ou ansioso','attention'),cp('Critica ou juizo prejudicados','attention'),cp('Desorientacao ou pensamento desorganizado','critical','Solicitar avaliacao medica imediata.')]},
    {title:'Sensopercepcao e risco',items:[cp('Sem alteracoes sensoperceptivas'),cp('Alucinacoes','critical','Solicitar avaliacao imediata e definir fluxo de urgencia.'),cp('Risco suicida ou de violencia presente','critical','Garantir seguranca e acionar fluxo de urgencia.')]}
  ]}
};
function clinicalPane(module,kind,groups,on){
  return `<div class="clinical-pane ${on?'on':''}" data-kind="${kind}"><div class="brow" style="margin:0 0 6px"><button type="button" class="btn btn-s btn-sm" onclick="selecionarResultadosEsperados('${module}','${kind}')">Selecionar resultados esperados</button><button type="button" class="btn btn-s btn-sm" onclick="limparResultadosClinicos('${module}','${kind}')">Limpar</button></div>${groups.map((g,gi)=>`<div class="clinical-group" data-group="${gi}"><div class="clinical-group-title">${g.title}</div><div class="clinical-options">${g.items.map(i=>`<button type="button" class="clinical-chip" data-level="${i.level}" data-text="${i.text}" data-conduta="${i.conduta||''}" onclick="toggleClinicalChip(this)">${i.text}</button>`).join('')}</div></div>`).join('')}</div>`;
}
function renderClinicalGuides(){
  Object.entries(CLINICAL_PRESETS).forEach(([module,cfg])=>{
    const addGuide=(location,kind,groups,title,targetTitle='')=>{
      const host=document.getElementById(location),id=`clinical-guide-${module}-${kind}`;if(!host||!groups?.length||document.getElementById(id))return;
      const guide=document.createElement('div');guide.className='clinical-guide';guide.id=id;guide.dataset.module=module;
      guide.innerHTML=`<div class="clinical-guide-head"><strong>${title}</strong><span>Clique nos resultados encontrados; eles serão usados para montar o SOAP</span></div>${clinicalPane(module,kind,groups,true)}<div class="clinical-alerts" data-clinical-alert="${module}"></div>`;
      if(module==='pna'&&kind==='anamnesis'){
        guide.querySelector('.clinical-alerts')?.remove();
        const condutas=document.getElementById('pna-queixas-condutas');if(condutas)guide.appendChild(condutas);
      }
      const cards=Array.from(host.querySelectorAll(':scope > .card'));
      const existingCard=targetTitle?cards.find(card=>card.querySelector(':scope > .ct')?.textContent.includes(targetTitle)):cards[0];
      if(existingCard){
        const heading=existingCard.querySelector(':scope > .ct');
        heading?.after(guide);
        if(!heading)existingCard.prepend(guide);
      }else{
        const card=document.createElement('div');card.className='card clinical-guide-card';card.appendChild(guide);host.prepend(card);
      }
    };
    addGuide(cfg.anamnesisLocation,'anamnesis',cfg.anamnesis,'Resultados rápidos da anamnese');
    addGuide(cfg.examLocation,'exam',cfg.exam,'Resultados rápidos',cfg.examTarget);
  });
}
function toggleClinicalChip(btn){const group=btn.closest('.clinical-group'),normal=btn.dataset.level==='normal',was=btn.classList.contains('selected');if(!was){if(normal)group.querySelectorAll('.clinical-chip:not([data-level="normal"])').forEach(x=>x.classList.remove('selected'));else group.querySelectorAll('.clinical-chip[data-level="normal"]').forEach(x=>x.classList.remove('selected'));}btn.classList.toggle('selected',!was);const module=btn.closest('.clinical-guide').dataset.module;atualizarAlertaClinico(module);if(module==='pna'){checkPnaQueixas();avaliarProtocolosPna();}if(typeof MODULOS_CLINICOS!=='undefined'&&MODULOS_CLINICOS[module])avaliarPrioridadeModulo(module);}
function selecionarResultadosEsperados(module,kind){document.querySelectorAll(`.clinical-guide[data-module="${module}"] .clinical-pane[data-kind="${kind}"] .clinical-group`).forEach(group=>{group.querySelectorAll('.clinical-chip').forEach(x=>x.classList.remove('selected'));group.querySelectorAll('.clinical-chip[data-level="normal"]').forEach(x=>x.classList.add('selected'));});atualizarAlertaClinico(module);if(module==='pna')checkPnaQueixas();if(typeof MODULOS_CLINICOS!=='undefined'&&MODULOS_CLINICOS[module])avaliarPrioridadeModulo(module);}
function limparResultadosClinicos(module,kind){document.querySelectorAll(`.clinical-guide[data-module="${module}"] .clinical-pane[data-kind="${kind}"] .clinical-chip`).forEach(x=>x.classList.remove('selected'));atualizarAlertaClinico(module);if(module==='pna')checkPnaQueixas();if(typeof MODULOS_CLINICOS!=='undefined'&&MODULOS_CLINICOS[module])avaliarPrioridadeModulo(module);}
const MODULOS_EM_DESENVOLVIMENTO=new Set(['ger','acol','hip','fer','puerp']);
const MODULOS_COM_PROTOCOLO_ATIVO=new Set(['ist',...MODULOS_EM_DESENVOLVIMENTO]);
const FONTES_PROTOCOLARES_MODULOS={
  ger:{nome:'Protocolos da Secretaria da Saúde — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},
  acol:{nome:'Protocolos da Secretaria da Saúde — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},
  hip:{nome:'Protocolo Municipal de Cardiologia — Protocolo 1: HAS',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2026-01/protocolo_municipal_de_cardiologia_1versao_06112023.pdf'},
  fer:{nome:'Protocolos da Secretaria da Saúde — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},
  puerp:{nome:'Protocolo Pré-Natal de Toledo — assistência puerperal',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2022-08/protocolo_pre-natal_alteracao_2021_versao_final-2_pdf.pdf'},
  ist:{nome:'Protocolo IST Toledo 2020',url:'https://www.toledo.pr.gov.br/sites/default/files/paginabasica-2022-08/protocolo_ist_2020_final_dezembro.pdf'}
};
function normalizarTextoProtocolo(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function avisoSemCondutaProtocolada(p,achado='o achado informado'){
  return`Conduta automática não definida: não foi localizada, para ${achado}, uma conduta explícita nos protocolos oficiais de Toledo cadastrados neste módulo. O sistema não sugere medicação nem encaminhamento; registre a avaliação e defina a conduta profissionalmente.`;
}
function decisaoProtocolar(fonte,conduta,medicacao='Não prevista neste protocolo.',dosagem='Não prevista neste protocolo.',protocolada=true,observacoes='Revisar critérios clínicos, contraindicações, alergias, gestação/lactação e registrar a decisão profissional.'){
  return{conduta,medicacao,dosagem,observacoes,fonte:fonte.nome,url:fonte.url,protocolada,texto:`CONDUTA:\n${conduta}\n\nMEDICAÇÃO:\n${medicacao}\n\nDOSAGEM / TEMPO:\n${dosagem}\n\nOBSERVAÇÕES DO PROTOCOLO:\n${observacoes}\n\nCONFORME PROTOCOLO:\n${fonte.nome}`};
}
function condutaProtocoladaModulo(p,contexto=''){
  let t=ESFClinical.positiveText(contexto);const fonte=FONTES_PROTOCOLARES_MODULOS[p]||FONTES_PROTOCOLARES_MODULOS.ger;
  if(!MODULOS_COM_PROTOCOLO_ATIVO.has(p))return decisaoProtocolar(fonte,'',undefined,undefined,true);
  if(p==='hip'){
    if(/dor toracica: sim|sindrome coronariana|falta de ar: sim|alteracao neurologica: sim/.test(t))return decisaoProtocolar(fonte,'Avaliar imediatamente sinais vitais e estabilidade. Suspeita de síndrome coronariana aguda ou instabilidade deve seguir atendimento de urgência/emergência.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.');
    if(/insuficiencia cardiaca.*sincope|insuficiencia cardiaca.*hipoperfusao|insuficiencia cardiaca.*congestao pulmonar/.test(t))return decisaoProtocolar(fonte,'Encaminhar para urgência/emergência quando a insuficiência cardíaca apresentar síncope, sinais de hipoperfusão ou congestão pulmonar sem condições de manejo ambulatorial.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar sinais/sintomas, classe funcional, congestão/hipoperfusão, medicamentos e posologias, descompensações/internações, ECG, radiografia e ecocardiograma disponíveis.');
    if(/arritmia.*sincope|arritmia.*hipoperfusao|arritmia.*dispneia|arritmia.*alteracoes de risco/.test(t))return decisaoProtocolar(fonte,'Encaminhar para urgência/emergência quando houver arritmia associada a hipoperfusão, síncope, dispneia, suspeita de síndrome coronariana aguda ou alterações de risco no ECG.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar tipo da arritmia, tempo/frequência dos sintomas, consequências hemodinâmicas, medicamentos e posologias, ECG e outros exames disponíveis.');
    if(/refrat|mal controlad/.test(t)&&(/tres medica|3 medica|dose plena/.test(t)))return decisaoProtocolar(fonte,'Estratificar conforme critérios do MACC. Se alto risco, preencher integralmente a ficha, reunir glicemia de jejum, colesterol total, HDL, triglicerídeos, ácido úrico, potássio, creatinina e exame qualitativo de urina e registrar no SIGSS como “MACC-HIPERTENSÃO ALTO RISCO”. Se refratária e não elegível ao MACC, o protocolo permite encaminhamento à cardiologia pela Central de Especialidades com documentação completa.','O protocolo municipal de cardiologia não define ajuste medicamentoso automático para enfermagem.','Manter e registrar as posologias prescritas; ajuste depende de avaliação profissional habilitada.');
    const fonteEndo={nome:'Protocolo Municipal de Endocrinologia — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'};
    if(/hipotireoidismo central/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar para endocrinologia por suspeita de hipotireoidismo central: TSH normal ou baixo com T4 livre ou total baixo.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'No encaminhamento, registrar sinais/sintomas, TSH e T4 com datas, medicação para tireoide e dose, outras medicações e peso.');
    if(/levotiroxina.*2.?5|hipotireoidismo.*dose elevada/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar para endocrinologia quando houver hipotireoidismo usando mais de 2,5 mcg/kg/dia de levotiroxina, após avaliação da adesão e de condições/medicações que alteram metabolismo ou absorção.','Manter e registrar a dose prescrita; o protocolo não define ajuste automático.','Critério de encaminhamento: levotiroxina > 2,5 mcg/kg/dia.',true,'Registrar TSH, T4, peso, adesão, medicamento/dose e possíveis interferentes.');
    if(/hipertireoidismo subclinico/.test(t))return decisaoProtocolar(fonteEndo,'Se TSH baixo com T4 e T3 normais, repetir TSH, T4 e T3 para confirmar hipertireoidismo subclínico antes de definir tratamento e encaminhamento especializado.','Não prevista neste protocolo de encaminhamento.','Repetir exames em 1 a 3 meses.',true,'Se confirmado hipertireoidismo subclínico, encaminhar para endocrinologia. Registrar sinais/sintomas, exames com datas e medicações.');
    if(/hipertireoidismo/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar todos os pacientes com hipertireoidismo para endocrinologia.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar sinais/sintomas, TSH, T4, T3 quando indicado, antitireoidiano e dose, além de outras medicações como amiodarona.');
    if(/nodulo de tireoide|nódulo de tireoide/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar todos os pacientes com nódulo de tireoide para avaliação especializada. Se houver indicação de PAAF ou sinais/sintomas sugestivos de malignidade, encaminhar primeiramente para oncologia; caso contrário, endocrinologia.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar TSH, laudo integral da ecografia com tamanho, características e TIRADS, e informar alto risco para câncer de tireoide.');
    if(/bocio multinodular/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar bócio multinodular para avaliação especializada. Nódulos com indicação de PAAF ou sinais de malignidade seguem primeiramente para oncologia; os demais, para endocrinologia.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar TSH, ecografia completa com TIRADS e volume do bócio e fatores de alto risco para câncer.');
    if(/hiperprolactinemia/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar todos os pacientes com diagnóstico de hiperprolactinemia para endocrinologia.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar sinais/sintomas, especialmente galactorreia, alterações menstruais/sexuais, e resultado da prolactina com data.');
    if(/obesidade secundaria/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar para endocrinologia por suspeita de obesidade secundária.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.',true,'Registrar sinais/sintomas, peso, altura, IMC, comorbidades e medicações com doses.');
    if(/obesidade.*imc 35|obesidade.*imc 40|obesidade.*imc 50|cirurgia bariatrica/.test(t))return decisaoProtocolar(fonteEndo,'Aplicar os critérios municipais de encaminhamento para endocrinologia/cirurgia bariátrica após tratamento clínico longitudinal documentado.','Não prevista neste protocolo de encaminhamento.','Tratamento clínico longitudinal mínimo de 2 anos nos critérios que o exigem.',true,'Endocrinologia: IMC 35–39,99 com comorbidade e insucesso por 2 anos. Cirurgia bariátrica: IMC ≥50; ou IMC 40–49,99 com ou sem comorbidade e insucesso por 2 anos. Registrar medidas, comorbidades, tratamentos prévios e risco cardiovascular.');
    if(/dm sem controle.*insulina|diabetes.*1 unidade\/kg|tfg menor que 30|doenca cardiovascular.*metformina.*sulfonilureia|avaliacao de isglt2/.test(t))return decisaoProtocolar(fonteEndo,'Encaminhar à endocrinologia via Central de Especialidades quando o paciente não for elegível ao MACC-Diabetes Alto Risco e preencher um dos critérios protocolados.','O protocolo encaminha para avaliação especializada; não define ajuste automático de medicação.','Critérios: insulina ≥1 unidade/kg/dia com boa adesão e sem controle; TFG <30; DM2 em metformina + sulfonilureia com doença cardiovascular preexistente; ou avaliação/prescrição de iSGLT2.',true,'O encaminhamento deve conter sinais/sintomas, HbA1c e creatinina com datas, insulina e dose/posologia, demais medicações e doses e peso.');
    if(/insulina|diabetes|glicemia|hba1c|hemoglobina glicada/.test(t))return decisaoProtocolar({nome:'Protocolo Municipal de Endocrinologia — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},'Manter acompanhamento na APS e estratificar o risco. O protocolo prevê encaminhamento ao MACC-Diabetes Alto Risco quando elegível e endocrinologia nos critérios documentados, como ausência de controle apesar de insulina ≥ 1 unidade/kg/dia com boa adesão ou TFG < 30.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.');
    return decisaoProtocolar(fonte,'Manter acompanhamento integral na APS, registrar medidas seriadas, adesão, exames e estratificação. Encaminhamento fica reservado aos critérios refratários/de alto risco documentados.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.');
  }
  if(p==='ist'){
    const dx=t.match(/diagnostico (?:clinico )?(?:confirmado)?\s*:\s*([^;\n]+)/)?.[1]||'';
    if(dx){const contextoGest=t.match(/contexto_(?:gestante|lactante)/)?.[0]||'';t=dx+'; '+contextoGest;}
    const hivReagentes=(t.match(/(?:duo-hiv2?|hiv2?|tr.?[12])[^:;]{0,30}:\s*reagente/g)||[]).length;
    if(/contexto_(gestante|lactante)/.test(t)&&/candidiase|vaginose|tricomon|herpes/.test(t))return decisaoProtocolar(fonte,'Aplicar o fluxo específico do pré-natal/puerpério. O protocolo IST municipal não autoriza usar automaticamente o esquema de não gestante neste contexto.','Não sugerida automaticamente para gestante/lactante.','Definir conforme protocolo obstétrico e avaliação responsável.',true,'Gestação com herpes genital deve ser encaminhada para avaliação médica. Para candidíase, vaginose e tricomoníase, consultar o Protocolo de Assistência ao Pré-Natal de Toledo.');
    if(/candidiase complicada|candidiase.*recorrente/.test(t))return decisaoProtocolar(fonte,'Encaminhar para avaliação médica. Investigar causas sistêmicas predisponentes.','Definir após avaliação médica.','Definir após avaliação médica.',true,'Aplica-se à recorrência em menos de 30 dias ou quatro ou mais episódios/ano. Investigar diabetes, imunodepressão/HIV e uso de corticoides.');
    if(/candidiase|corrimento branco|corrimento grumoso|prurido vulvovaginal|ardencia vulvar/.test(t))return decisaoProtocolar(fonte,'Quadro compatível com candidíase vulvovaginal: confirmar avaliação clínica antes de registrar tratamento. CVV complicada, recorrência em menos de 30 dias ou quatro ou mais episódios/ano exige avaliação médica.','Primeira escolha: miconazol creme vaginal 2%. Segunda escolha: fluconazol VO ou itraconazol VO.','Miconazol: 1 aplicador cheio à noite por 7 dias. Fluconazol: 150 mg VO, dose única. Itraconazol: 100 mg, 2 comprimidos VO, 2x/dia por 1 dia.',true,'Parcerias não precisam ser tratadas, exceto se sintomáticas. Investigar diabetes, imunodepressão/HIV e uso de corticoides nos casos recorrentes/difíceis.');
    if(/diagnostico clinico.*candidiase|diagnostico confirmado.*candidiase/.test(t))return decisaoProtocolar(fonte,'Tratar candidíase vulvovaginal após diagnóstico clínico registrado. CVV complicada, recorrência em menos de 30 dias ou quatro ou mais episódios/ano exige avaliação médica.','Primeira escolha: miconazol creme vaginal 2%. Segunda escolha: fluconazol VO ou itraconazol VO.','Miconazol: 1 aplicador cheio à noite por 7 dias. Fluconazol: 150 mg VO, dose única. Itraconazol: 100 mg, 2 comprimidos VO, 2x/dia por 1 dia.',true,'Parcerias não precisam ser tratadas, exceto se sintomáticas. Investigar causas sistêmicas nos casos recorrentes ou de difícil controle: diabetes, imunodepressão/HIV e uso de corticoides.');
    if(/vaginose bacteriana recorrente/.test(t))return decisaoProtocolar(fonte,'Encaminhar para consulta médica.','Definir após consulta médica.','Definir após consulta médica.',true,'O protocolo municipal encaminha os casos recorrentes para consulta médica.');
    if(/vaginose|corrimento cinza|odor f[eé]tido|odor de peixe|whiff positivo/.test(t))return decisaoProtocolar(fonte,'Quadro compatível com vaginose bacteriana sintomática: confirmar avaliação clínica antes de registrar tratamento. Casos recorrentes devem ser encaminhados para consulta médica.','Primeiras opções: metronidazol VO ou gel vaginal. Segunda opção: clindamicina VO.','Metronidazol 250 mg: 2 comprimidos VO, 2x/dia por 7 dias; OU 400 mg: 1 comprimido VO, 8/8h por 7 dias; OU 400 mg: 5 comprimidos VO em dose única, total 2 g; OU gel vaginal 100 mg/g, 1 aplicador à noite por 5 dias. Clindamicina 300 mg VO, 2x/dia por 7 dias.',true,'Não tratar parcerias de rotina. Evitar álcool durante metronidazol; suspender relações sexuais; manter tratamento durante menstruação.');
    if(/diagnostico clinico.*vaginose|diagnostico confirmado.*vaginose/.test(t))return decisaoProtocolar(fonte,'Tratar vaginose bacteriana sintomática com diagnóstico registrado. Casos recorrentes devem ser encaminhados para consulta médica.','Primeiras opções: metronidazol VO ou gel vaginal. Segunda opção: clindamicina VO.','Metronidazol 250 mg: 2 comprimidos VO, 2x/dia por 7 dias; OU 400 mg: 1 comprimido VO, 8/8h por 7 dias; OU 400 mg: 5 comprimidos VO em dose única, total 2 g; OU gel vaginal 100 mg/g, 1 aplicador à noite por 5 dias. Clindamicina 300 mg VO, 2x/dia por 7 dias.',true,'Não tratar parcerias. No esquema metronidazol 2 g, orientar possível intolerância gástrica. Evitar álcool durante o tratamento; suspender relações sexuais; manter o tratamento durante a menstruação.');
    if(/tricomon|corrimento amarelad|corrimento esverdead|corrimento espumoso/.test(t))return decisaoProtocolar(fonte,'Quadro compatível com tricomoníase: confirmar avaliação clínica antes de registrar tratamento; tratar a pessoa e parcerias sexuais com o mesmo esquema quando confirmado.','Metronidazol VO.','Metronidazol 400 mg: 5 comprimidos VO em dose única, total 2 g; OU metronidazol 250 mg: 2 comprimidos VO, 2x/dia por 7 dias.',true,'Tratar parcerias com o mesmo esquema. Evitar relações desprotegidas até tratamento completo e avaliar outras IST/testagem.');
    if(/diagnostico clinico.*tricomon|diagnostico confirmado.*tricomon/.test(t))return decisaoProtocolar(fonte,'Tratar a pessoa e todas as parcerias sexuais com o mesmo esquema. Ofertar avaliação presencial, orientação e exames para outras IST às parcerias.','Metronidazol VO.','Metronidazol 400 mg: 5 comprimidos VO em dose única, total 2 g; OU metronidazol 250 mg: 2 comprimidos VO, 2x/dia por 7 dias.',true,'Tratar parcerias com o mesmo esquema. Se citologia apresentar alterações morfológicas associadas à tricomoníase, tratar e repetir a citologia após seis meses.');
    if(/cervicite|material mucopurulento|dor a mobilizacao do colo|dor à mobilização do colo|sangramento ao toque|gonococo|clamidia/.test(t))return decisaoProtocolar(fonte,'Quadro compatível com cervicite/gonococo + clamídia: confirmar sinais clínicos e tratar/captar parcerias quando confirmado.','Ceftriaxona IM associada a azitromicina VO.','Ceftriaxona 500 mg IM, dose única + azitromicina 500 mg, 2 comprimidos VO, dose única.',true,'Solicitar/testar sífilis, HIV e hepatites B/C. Registrar dor à mobilização do colo, material mucopurulento e sangramento ao toque.');
    if(/diagnostico clinico.*cervicite|diagnostico confirmado.*cervicite/.test(t))return decisaoProtocolar(fonte,'Tratar cervicite gonocócica não complicada associada à infecção por clamídia e avaliar/tratar as parcerias presencialmente.','Ceftriaxona IM associada a azitromicina VO.','Ceftriaxona 500 mg IM, dose única + azitromicina 500 mg, 2 comprimidos VO, dose única.',true,'Solicitar exames de outras IST para as parcerias e identificar/captar outras parcerias sexuais.');
    if(/uretrite|corrimento uretral|dor uretral|estranguria|eritema de meato/.test(t))return decisaoProtocolar(fonte,'Quadro compatível com uretrite: confirmar avaliação clínica, investigar agente quando possível e tratar/captar parcerias quando confirmado. Alergia grave a cefalosporina exige avaliação médica.','Primeira opção: ceftriaxona IM + azitromicina VO. Segunda opção: ceftriaxona IM + doxiciclina VO.','Primeira opção: ceftriaxona 500 mg IM, dose única + azitromicina 500 mg, 2 comprimidos VO, dose única. Segunda opção: ceftriaxona 500 mg IM, dose única + doxiciclina 100 mg VO, 2x/dia por 7 dias.',true,'Paciente e parcerias devem evitar relações desprotegidas até tratamento completo ou 7 dias após dose única.');
    if(/diagnostico clinico.*uretrite|diagnostico confirmado.*uretrite/.test(t))return decisaoProtocolar(fonte,'Tratar uretrite sem identificação do agente etiológico. Alergia grave a cefalosporinas exige avaliação médica.','Primeira opção: ceftriaxona IM + azitromicina VO. Segunda opção: ceftriaxona IM + doxiciclina VO.','Primeira opção: ceftriaxona 500 mg IM, dose única + azitromicina 500 mg, 2 comprimidos VO, dose única. Segunda opção: ceftriaxona 500 mg IM, dose única + doxiciclina 100 mg VO, 2x/dia por 7 dias.',true,'Paciente e parcerias devem se abster de relações sexuais desprotegidas até o tratamento de ambos estar completo ou por sete dias após terapia de dose única.');
    if(/diagnostico confirmado.*sifilis recente/.test(t))return decisaoProtocolar(fonte,'Tratar sífilis recente e realizar seguimento com VDRL. Avaliar e testar todas as parcerias.','Benzilpenicilina benzatina IM.','2,4 milhões UI IM, dose única, dividida em 1,2 milhão UI em cada glúteo.',true,'Realizar VDRL trimestral até o 12º mês: 3, 6, 9 e 12 meses. Em gestantes, controle mensal. Parceria exposta nos últimos 90 dias: ofertar tratamento presuntivo com 2,4 milhões UI IM, dose única.');
    if(/diagnostico confirmado.*sifilis tardia|diagnostico confirmado.*duracao ignorada/.test(t))return decisaoProtocolar(fonte,'Tratar sífilis tardia ou de duração ignorada e realizar seguimento com VDRL. Neurossífilis, tratamento alternativo e retratamento exigem avaliação médica.','Benzilpenicilina benzatina IM.','2,4 milhões UI IM, 1 vez por semana durante 3 semanas; dose total 7,2 milhões UI.',true,'Intervalo recomendado entre doses: 7 dias. Se ultrapassar 14 dias, reiniciar o esquema, exceto gestantes. VDRL trimestral até 12 meses; em gestantes, mensal.');
    if(/herpes.*primeiro episodio|primeiro episodio.*herpes/.test(t))return decisaoProtocolar(fonte,'Iniciar o tratamento do primeiro episódio de herpes genital o mais precocemente possível.','Aciclovir VO.','Aciclovir 200 mg: 2 comprimidos VO, 3x/dia por 7–10 dias; OU aciclovir 200 mg: 1 comprimido VO, 5x/dia, às 7h, 11h, 15h, 19h e 23h, por 7–10 dias.',true,'O tratamento pode ser prorrogado se a cicatrização estiver incompleta após 10 dias. Higienizar lesões com compressas de solução fisiológica ou degermante aquoso. Retorno em uma semana para reavaliar as lesões.');
    if(/herpes|vesicula|vesículas|ulcera genital|úlcera genital|lesao ulcerativa/.test(t))return decisaoProtocolar(fonte,'Lesões compatíveis com herpes/úlcera genital: diferenciar primeiro episódio, recidiva, cancroide, LGV, donovanose e sífilis antes de registrar tratamento definitivo. Se primeiro episódio de herpes, iniciar precocemente conforme protocolo.','Aciclovir VO quando primeiro episódio de herpes genital for confirmado.','Aciclovir 200 mg: 2 comprimidos VO, 3x/dia por 7–10 dias; OU aciclovir 200 mg: 1 comprimido VO, 5x/dia por 7–10 dias.',true,'Retorno em uma semana, orientação de transmissão, higiene local e avaliação médica em supressão, imunossupressão, gestação ou diagnóstico diferencial.');
    if(/herpes.*recidiva.*lesoes maiores|recidiva.*herpes.*maiores/.test(t))return decisaoProtocolar(fonte,'Iniciar preferencialmente no período prodrômico da recidiva: aumento de sensibilidade local, ardor, dor, prurido ou hiperemia.','Aciclovir VO.','Aciclovir 200 mg: 2 comprimidos VO, 3x/dia por 5 dias; OU aciclovir 200 mg: 4 comprimidos VO, 2x/dia por 5 dias.',true,'Retorno em uma semana para reavaliar as lesões. Orientar transmissão e possibilidade de infecção assintomática.');
    if(/herpes.*recidiva.*lesoes menores|recidiva.*herpes.*menores/.test(t))return decisaoProtocolar(fonte,'Iniciar preferencialmente no período prodrômico da recidiva.','Aciclovir creme 50 mg.','1 aplicação local, 5x/dia.',true,'Higienizar as lesões e retornar em uma semana para reavaliação.');
    if(/supressao.*herpes|herpes.*imunossuprim|herpes.*6 ou mais|herpes.*gestacao/.test(t))return decisaoProtocolar(fonte,'Encaminhar para avaliação médica.','Definir em avaliação médica.','Definir em avaliação médica.',true,'Aplicável à supressão de herpes genital com seis ou mais episódios/ano, herpes em imunossuprimidos ou gestação.');
    if(/condiloma.*pequen|hpv.*lesoes pequenas/.test(t))return decisaoProtocolar(fonte,'Realizar cauterização química na própria UBS/ESF para lesões pequenas em pele e mucosa, exceto canal vaginal, colo uterino, lábio interno, língua e outras mucosas internas.','Ácido tricloroacético (ATA) 80% a 90%.','Aplicar nas lesões 1x por semana até o desaparecimento.',true,'Antes: não estar menstruada; evitar depilação com cera/químicos, relação sexual por pelo menos dois dias, duchas e medicamentos vaginais. Após: evitar relações até cicatrização, não arrancar lesões e registrar quantidade, local, lesões cauterizadas e evolução.');
    if(/condiloma|hpv|verruga anogenital|verruga genital/.test(t))return decisaoProtocolar(fonte,'Lesões compatíveis com HPV/condiloma: caracterizar quantidade, local e extensão. Lesões pequenas externas podem ser tratadas na UBS/ESF; lesões extensas ou internas devem seguir encaminhamento.','Ácido tricloroacético (ATA) 80% a 90% para lesões pequenas externas, quando indicado.','Aplicar nas lesões 1x por semana até o desaparecimento.',true,'Não aplicar em canal vaginal, colo uterino, lábio interno, língua ou mucosas internas. Registrar evolução e avaliar preventivo/colposcopia quando indicado.');
    if(/condiloma.*extens|hpv.*lesoes extensas/.test(t))return decisaoProtocolar(fonte,'Encaminhar para pequenos procedimentos no Mini-Hospital.','Não prevista para execução automática neste quadro.','Não prevista para execução automática neste quadro.',true,'Registrar extensão, localização e características das lesões.');
    if(/cancroide|linfogranuloma|lgv|donovanose|neurossifilis/.test(t))return decisaoProtocolar(fonte,'Encaminhar para avaliação médica.','Definir em avaliação médica.','Definir em avaliação médica.',true,'O protocolo municipal define avaliação médica para este quadro.');
    if(hivReagentes>=2)return decisaoProtocolar(fonte,'Realizar notificação; acolhimento e aconselhamento pós-teste; solicitar testagem da parceria fixa ou das parcerias dos últimos 12 meses; ligar para o CTA para agendamento.');
    if(hivReagentes===1&&/(?:duo-hiv2|hiv2|tr.?2)[^:;]{0,30}:\s*nao reagente/.test(t))return decisaoProtocolar(fonte,'Solicitar no sistema municipal “Pesquisa de Anticorpos Anti-HIV-1 + HIV-2 (Elisa)”.');
    if(/hbsag|hepatite b/.test(t)&&/reagente/.test(t))return decisaoProtocolar(fonte,'Notificar; solicitar marcadores virais e PCR quantitativo pelo formulário próprio; encaminhar documentação à epidemiologia; testar parceria e contatos domiciliares. Somente se PCR > 2.000, contatar CTA para agendamento com infectologista.');
    if(/anti.?hcv|hepatite c/.test(t)&&/reagente/.test(t))return decisaoProtocolar(fonte,'Notificar; solicitar PCR quantitativo pelo formulário próprio e encaminhar documentação à epidemiologia; com PCR pronto, agendar infectologista no CTA; testar parceria e contatos domiciliares.');
    if(/sifilis/.test(t)&&/reagente/.test(t))return decisaoProtocolar(fonte,'Solicitar VDRL, classificar o estágio clínico antes de definir o tratamento e testar todas as parcerias.','Não sugerida sem o estágio clínico registrado.','Registrar o estágio para exibir o esquema protocolar.');
    if(/violencia sexual|exposicao sexual/.test(t))return decisaoProtocolar(fonte,'Aplicar o fluxo específico de PEP. Como o fluxo completo de PEP não está cadastrado neste módulo, não há medicação ou encaminhamento automático.');
    return decisaoProtocolar(fonte,avisoSemCondutaProtocolada(p,'o achado de IST registrado'),undefined,undefined,false);
  }
  if(p==='puerp')return decisaoProtocolar(fonte,'Registrar como CONSULTA PUERPERAL quando realizada até 45 dias pós-parto e priorizar até o 10º dia; conferir dTpa perdida na gestação, influenza, registro de imunoglobulina anti-Rh e consulta/visita do RN até o 5º dia após alta. Para alterações clínicas sem conduta puerperal explícita cadastrada, registrar e definir a conduta profissionalmente.','Vacinação prevista: dTpa perdida pode ser administrada até 45 dias após o parto; influenza durante a campanha. Não há medicação clínica automática cadastrada.','Conforme calendário e situação vacinal.');
  if(p==='fer'&&/lesao|ferida|pele|necrose|ulcera/.test(t))return decisaoProtocolar({nome:'Protocolo de Teledermatologia — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},'Identificar e registrar a lesão. Quando necessária avaliação especializada, o médico preenche a solicitação de teledermatologia; realizar dermatoscopia/telediagnóstico conforme fluxo. Classificação vermelha segue urgência/emergência; amarela prioriza dermatologia/oncologia; verde dermatologia; azul tratamento na UBS conforme laudo; branca sem necessidade de especialista.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.');
  if((p==='ger'||p==='acol')&&/sindrome coronariana aguda|suspeita de sca/.test(t))return decisaoProtocolar({nome:'Protocolo Municipal de Cardiologia — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},'Suspeita registrada de síndrome coronariana aguda: realizar avaliação imediata e seguir o fluxo de urgência/emergência.','Não prevista neste protocolo de encaminhamento.','Não prevista neste protocolo de encaminhamento.');
  return decisaoProtocolar(fonte,avisoSemCondutaProtocolada(p,'o achado registrado'),undefined,undefined,false);
}
function condutaSistemaProtocolada(p,contexto,condutaOriginal=''){return MODULOS_COM_PROTOCOLO_ATIVO.has(p)?condutaProtocoladaModulo(p,[contexto,condutaOriginal].join(' ')).texto:condutaOriginal}
function coletarGuiaClinico(module){
  const guides=Array.from(document.querySelectorAll(`.clinical-guide[data-module="${module}"]`)),result={anamnese:'',exame:'',alertas:'',condutas:''};if(!guides.length)return result;
  const collect=kind=>guides.flatMap(guide=>Array.from(guide.querySelectorAll(`.clinical-pane[data-kind="${kind}"] .clinical-group`))).map(g=>{const items=Array.from(g.querySelectorAll('.clinical-chip.selected')).map(x=>x.dataset.text);return items.length?`${g.querySelector('.clinical-group-title').textContent}: ${items.join('; ')}.`:'';}).filter(Boolean).join('\n');
  result.anamnese=collect('anamnesis');result.exame=collect('exam');const selected=guides.flatMap(guide=>Array.from(guide.querySelectorAll('.clinical-chip.selected')));
  result.alertas=selected.filter(x=>x.dataset.level!=='normal').map(x=>`${x.dataset.level==='critical'?'ALERTA':'Atencao'}: ${x.dataset.text}.`).join('\n');result.condutas=[...new Set(selected.filter(x=>x.dataset.level!=='normal').map(x=>condutaSistemaProtocolada(module,x.dataset.text,x.dataset.conduta||condutaClinicaPadrao(x.dataset.text,x.dataset.level,module))).filter(Boolean))].join('\n');return result;
}
function condutaClinicaPadrao(text,level,module){
  const t=(text||'').toLowerCase(),urgente='Avaliar sinais vitais e estabilidade. Solicitar avaliação médica no mesmo atendimento; se houver instabilidade, encaminhar imediatamente ao serviço de urgência.';
  if(/sangramento vaginal|perda de liquido|contrações regulares|redução ou ausência de movimentos fetais/.test(t))return 'Encaminhar imediatamente para avaliação obstétrica na maternidade de referência. Registrar início, intensidade, perdas, dor e movimentos fetais; não aguardar consulta de rotina.';
  if(/cefaleia persistente|alterações visuais|dor epigástrica|hcd/.test(t))return 'Aferir e repetir a PA, pesquisar proteinúria e sinais de gravidade. Solicitar avaliação médica imediata; na gestante, encaminhar à maternidade se suspeita de pré-eclâmpsia ou PA ≥ 160/110 mmHg.';
  if(/disúria/.test(t))return 'Solicitar EAS e urocultura com antibiograma, realizar avaliação médica para tratamento e programar cultura de controle após o tratamento.';
  if(/náuseas|vômitos|nauseas|vomitos/.test(t))return 'Aplicar orientações alimentares do Protocolo Pré-Natal Toledo; avaliar hiperêmese e solicitar avaliação médica se vômitos contínuos/intensos, desidratação, perda de peso ou alterações urinárias/metabólicas.';
  if(/mv diminuído|abolido|roncos|sibilos|crepitações/.test(t))return 'Verificar frequência respiratória, saturação e sinais de esforço respiratório. Solicitar avaliação médica no mesmo atendimento; encaminhar à urgência se hipoxemia ou desconforto.';
  if(/sopro|arritmia/.test(t))return 'Verificar sinais vitais e estabilidade, solicitar avaliação médica e ECG quando disponível. Encaminhar à urgência se dor torácica, síncope, dispneia ou instabilidade.';
  if(/homans positivo/.test(t))return 'Suspeitar trombose venosa profunda: não massagear o membro e encaminhar imediatamente para avaliação médica/urgência.';
  if(/edema/.test(t)&&(module==='pna'||module==='pnc'))return 'Aferir e repetir PA, pesquisar cefaleia, alterações visuais, dor epigástrica/HCD e proteinúria. Solicitar avaliação médica no mesmo atendimento se edema súbito/importante.';
  if(/nódulo|nodulo mamario/.test(t))return 'Registrar localização e características e encaminhar para avaliação diagnóstica conforme fluxo municipal de mama.';
  if(/fissura mamilar|ingurgitamento/.test(t))return 'Avaliar pega, posicionamento, dor, febre e sinais inflamatórios; corrigir técnica e solicitar avaliação se suspeita de mastite.';
  if(/colo dilatado|dilatado/.test(t))return 'Avaliar trabalho de parto e encaminhar para avaliação obstétrica conforme idade gestacional e presença de contrações/perdas.';
  if(/palidez|hipocoradas/.test(t))return 'Solicitar hemograma e investigar anemia; definir reposição e prazo de controle conforme resultado.';
  return level==='critical'?urgente:'Avaliar o achado durante a consulta, registrar características e solicitar avaliação médica conforme gravidade e contexto clínico.';
}
function atualizarAlertaClinico(module){const guia=coletarGuiaClinico(module),limpa=x=>String(x).replace(/^(ALERTA|Atencao):?\s*/i,'').trim(),unicos=x=>[...new Set(x.map(limpa).filter(Boolean))].slice(0,4),crit=unicos(guia.alertas.split('\n').filter(x=>x.startsWith('ALERTA'))),att=unicos(guia.alertas.split('\n').filter(x=>x.startsWith('Atencao'))),cond=unicos(guia.condutas.split('\n').filter(Boolean)),html=(crit.length?`<div class="alert alert-e"><strong>Alerta clínico:</strong> ${crit.join(' · ')}</div>`:'')+(att.length?`<div class="alert alert-w"><strong>Requer avaliação:</strong> ${att.join(' · ')}</div>`:'')+(cond.length?`<div class="alert alert-i"><strong>O que fazer agora:</strong><ul style="margin:6px 0 0 18px">${cond.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'');document.querySelectorAll(`[data-clinical-alert="${module}"]`).forEach(out=>out.innerHTML=html);}
document.addEventListener('DOMContentLoaded',renderClinicalGuides);

const ADMIN_TEST_MODULES={
  pna:{page:'pg-pn-abertura',values:{'pna-nome':'Marina Alves Ribeiro','pna-nasc':'1996-04-12','pna-cns':'700000000000001','pna-prontuario':'PN-4821','pna-data':'today','pna-hora':'09:00','pna-enf':'Enf. Mariana Lopes','pna-dum':'2026-01-10','pna-g':'1','pna-p':'0','pna-a':'0','pna-peso':'68','pna-alt':'1.64','pna-pa':'110/70','pna-fc':'78','pna-temp':'36.5','pna-eg':'BEG, LOTE, hidratada, eupneica','pna-mf':'Presentes / padrão habitual','vac-dt-hist':'2','vac-dtpa-status':'nao','vac-hepb-hist':'incompleto','vac-vsr-status':'nao','pna-queixas':'Nega queixas no momento'}},
  pnc:{page:'pg-pn-consulta',values:{'pnc-nome':'Beatriz Lima Rocha','pnc-cns':'700000000000001','pnc-num':'2','pnc-data':'today','pnc-hora':'09:30','pnc-enf':'Enf. Mariana Lopes','pnc-dum':'2026-03-10','pnc-queixas':'Nega queixas no momento','pnc-peso':'69','pnc-pa':'110/70','pnc-fc':'78','pnc-au':'18','pnc-bcf':'145','pnc-mama':'Simétricas, sem nódulos','pnc-ausculta':'AC: BRNF 2T sem sopros. AP: MV+ sem RA.'}},
  pu:{page:'pg-puericultura',values:{'pu-nome':'Helena Martins Ribeiro','pu-nasc':'2025-12-09','pu-sexo':'Menina','pu-cns':'700000000000002','pu-data':'today','pu-hora':'10:00','pu-enf':'Enf. Mariana Lopes','pu-peso':'7.5','pu-alt':'66','pu-pc':'43','pu-pa':'44','pu-pt':'45','pu-alim':'Aleitamento e alimentação adequados para idade'}},
  id:{page:'pg-idoso',values:{'id-nome':'José Carlos da Silva','id-idade':'72 anos','id-pa':'130/80','id-gli':'98','id-peso':'74','id-alt':'1.70','id-cron':'HAS controlada','id-meds':'Losartana conforme prescrição','id-vac':'Atualizadas','id-avd':'Independente','id-aivd':'Independente','id-mob':'Marcha estável','id-quedas':'Nega quedas'}},
  sm:{page:'pg-saude-mental',values:{'sm-nome':'Renata Oliveira Costa','sm-nasc':'1990-05-15','sm-sexo':'Feminino','sm-ocupacao':'Trabalhadora','sm-escol':'Ensino médio','sm-data':'today','sm-prof':'Enf. Mariana Lopes','sm-servico':'ESF Toledo','sm-area':'Microárea 04'}},
  ger:{page:'pg-consulta-geral',values:{'ger-nome':'Rafael Mendes Pereira','ger-cpf':'12345678909','ger-motivo':'Avaliação de enfermagem','ger-queixa':'Lesão de pele em acompanhamento','ger-hma':'Lesão de pele há 15 dias, sem sinais sistêmicos.','ger-conduta':'Registrar achados e revisar decisão protocolar.','ger-retorno':'7 dias'}},
  hip:{page:'pg-hiperdia',values:{'hip-nome':'Eduardo Costa Ribeiro','hip-cpf':'12345678909','hip-diagnostico':'Hipertensão e diabetes','hip-condicao-protocolar':'HAS mal controlada com três medicações em dose plena','hip-pa-atual':'168/104','hip-pa-anteriores':'164/102 e 170/106','hip-glicemia':'286','hip-hba1c':'10.2','hip-medicamentos':'Três anti-hipertensivos em dose plena; insulina em uso.','hip-adesao':'Adequada','hip-conduta':'HAS mal controlada apesar de três medicamentos em dose plena.','hip-retorno':'Retorno breve'}},
  fer:{page:'pg-feridas',values:{'fer-nome':'Lucas Henrique Almeida','fer-cpf':'12345678909','fer-local':'Perna direita','fer-tipo':'Venosa','fer-comprimento':'4','fer-largura':'3','fer-profundidade':'0.4','fer-tecido':'Necrose','fer-exsudato':'Moderado','fer-odor':'Forte','fer-infeccao':'Lesão com necrose e odor forte','fer-conduta':'Registrar e avaliar fluxo protocolar.'}},
  puerp:{page:'pg-puerperio',values:{'puerp-nome':'Camila Fernandes Souza','puerp-cpf':'12345678909','puerp-data-parto':'2026-06-05','puerp-tipo-parto':'Vaginal','puerp-dias':'8','puerp-sangramento':'Loquiação fisiológica','puerp-amamentacao':'Aleitamento materno em livre demanda','puerp-vacinacao':'dTpa não realizada na gestação','puerp-conduta':'Consulta puerperal até o 10º dia.'}},
  ist:{page:'pg-ist',values:{'ist-nome':'Juliana Martins Pereira','ist-cpf':'12345678909','ist-motivo':'Corrimento e prurido','ist-sintomas':'Prurido vulvovaginal e corrimento branco','ist-corrimento':'Sim','ist-diagnostico-sindromico':'Diagnóstico clínico confirmado: Candidíase vulvovaginal','ist-conduta':'Revisar tratamento protocolar','ist-retorno':'Se persistência ou recorrência'}},
  vd:{page:'pg-visita-domiciliar',values:{'vd-nome':'Antônio Ferreira Martins','vd-cpf':'12345678909','vd-nasc':'1948-03-14','vd-cuidador':'Maria Helena Martins','vd-parentesco-cuidador':'Filha','vd-telefone-cuidador':'(45) 99964-1234','vd-acs':'ACS Ana Paula','vd-microarea':'04','vd-tipo-visita':'acamado','vd-motivo':'Avaliação de acamado','vd-queixa':'Família solicita avaliação de pele, medicações e insumos.','vd-acamado':'Sim','vd-mobilidade':'Acamado','vd-adl':'Dependência total','vd-consciencia':'Lúcido/orientado','vd-pa':'128/76','vd-fc':'82','vd-fr':'18','vd-sat':'96','vd-temp':'36.6','vd-glicemia':'118','vd-pele':'Hiperemia discreta em região sacral, sem abertura de pele.','vd-alimentacao-via':'Oral','vd-dieta':'Aceitando dieta pastosa e líquidos ofertados pelo cuidador.','vd-cuidador-avaliacao':'Cuidadora presente, orientada, refere cansaço e dúvidas sobre mudança de decúbito.','vd-conduta':'Orientada mudança de decúbito, cuidados com pele, organização de medicações e sinais de alerta.','vd-orientacoes':'Manter pele limpa e seca, hidratação, troca de posição e observar febre, dispneia, dor intensa ou alteração do estado geral.','vd-retorno':'Nova visita em 7 dias ou antes se piora.'}}
};
function setTestField(id,value){
  const el=document.getElementById(id);if(!el)return;el.value=value==='today'?new Date().toISOString().slice(0,10):value;
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
}
function sorteioTeste(lista){return lista[Math.floor(Math.random()*lista.length)]}
function inteiroTeste(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function dataIdadeTeste(anos,meses=0){const d=new Date();d.setFullYear(d.getFullYear()-anos);d.setMonth(d.getMonth()-meses);d.setDate(inteiroTeste(2,25));return d.toISOString().slice(0,10)}
function cpfFicticioValido(){
  const n=Array.from({length:9},()=>inteiroTeste(0,9));const dig=t=>{let s=0;for(let i=0;i<t;i++)s+=n[i]*(t+1-i);const r=(s*10)%11;return r===10?0:r};n.push(dig(9));n.push(dig(10));return n.join('');
}
function dadosFicticiosCoerentes(module){
  const femininos=['Marina Alves Ribeiro','Camila Fernandes Souza','Juliana Martins Pereira','Renata Oliveira Costa','Beatriz Lima Rocha'],masculinos=['Lucas Henrique Almeida','Rafael Mendes Pereira','Bruno Vieira Santos','Eduardo Costa Ribeiro','Mateus Rodrigues Lima'];
  const feminino=['pna','pnc','prev','puerp'].includes(module),infantil=module==='pu',idoso=module==='id';
  const nome=infantil?sorteioTeste([...femininos,...masculinos]):sorteioTeste(feminino?femininos:[...femininos,...masculinos]);
  const nasc=infantil?dataIdadeTeste(0,inteiroTeste(4,18)):idoso?dataIdadeTeste(inteiroTeste(65,84)):dataIdadeTeste(inteiroTeste(feminino?22:20,feminino?39:59));
  const prefixos={pna:'pna',pnc:'pnc',pu:'pu',id:'id',sm:'sm',ger:'ger',hip:'hip',fer:'fer',puerp:'puerp',ist:'ist',vd:'vd'},p=prefixos[module]||module;
  const dados={
    [`${p}-nome`]:nome,[`${p}-nasc`]:nasc,[`${p}-cpf`]:cpfFicticioValido(),[`${p}-cns`]:`7${Array.from({length:14},()=>inteiroTeste(0,9)).join('')}`,
    [`${p}-telefone`]:`45 9${inteiroTeste(1000,9999)}-${inteiroTeste(1000,9999)}`,[`${p}-microarea`]:String(inteiroTeste(1,8)),[`${p}-cep`]:'85900-000',
    [`${p}-logradouro`]:sorteioTeste(['Rua das Flores','Rua São João','Avenida Maripá','Rua Santos Dumont']),[`${p}-numero`]:String(inteiroTeste(40,980)),[`${p}-bairro`]:sorteioTeste(['Jardim Europa','Centro','Jardim Panorama','Vila Industrial']),[`${p}-municipio`]:'Toledo',[`${p}-uf`]:'PR',
    [`${p}-profissional`]:sorteioTeste(['Enf. Mariana Lopes','Enf. Carlos Henrique','Enf. Ana Paula Ribeiro'])
  };
  if(module==='pna'){Object.assign(dados,{'pna-prontuario':`PN-${inteiroTeste(1000,9999)}`,'pna-peso':String(inteiroTeste(55,88)),'pna-alt':(inteiroTeste(155,174)/100).toFixed(2),'pna-pa':sorteioTeste(['108/68','112/72','118/76']),'pna-fc':String(inteiroTeste(72,88)),'pna-temp':'36.5','pna-enf':dados['pna-profissional']});}
  if(module==='pnc'){Object.assign(dados,{'pnc-peso':String(inteiroTeste(58,92)),'pnc-pa':sorteioTeste(['110/70','116/74','122/78']),'pnc-fc':String(inteiroTeste(72,90)),'pnc-bcf':String(inteiroTeste(135,155)),'pnc-enf':dados['pnc-profissional']});}
  if(module==='pu'){Object.assign(dados,{'pu-peso':(inteiroTeste(650,1250)/100).toFixed(2),'pu-alt':String(inteiroTeste(62,82)),'pu-pc':String(inteiroTeste(41,48)),'pu-pa':String(inteiroTeste(42,50)),'pu-pt':String(inteiroTeste(43,52)),'pu-enf':dados['pu-profissional']});}
  if(module==='id'){Object.assign(dados,{'id-peso':String(inteiroTeste(58,86)),'id-alt':(inteiroTeste(150,178)/100).toFixed(2),'id-pa':sorteioTeste(['128/78','134/82','142/86']),'id-gli':String(inteiroTeste(88,138)),'id-idade':`${new Date().getFullYear()-Number(nasc.slice(0,4))} anos`});}
  if(module==='sm')Object.assign(dados,{'sm-prof':dados['sm-profissional'],'sm-area':`Microárea ${inteiroTeste(1,8)}`});
  if(['ger','hip','fer','puerp','ist'].includes(module)){Object.assign(dados,{[`${p}-pa`]:sorteioTeste(['118/76','126/82','134/86']),[`${p}-fc`]:String(inteiroTeste(68,92)),[`${p}-fr`]:String(inteiroTeste(14,20)),[`${p}-sat`]:String(inteiroTeste(96,99)),[`${p}-temp`]:(inteiroTeste(362,370)/10).toFixed(1),[`${p}-dor-escala`]:String(inteiroTeste(0,4))});}
  if(module==='hip')Object.assign(dados,{'hip-peso':String(inteiroTeste(68,98)),'hip-alt':String(inteiroTeste(155,182)),'hip-circ-abdominal':String(inteiroTeste(82,112))});
  return dados;
}
function valorTestePorCampo(el){
  const id=(el.id||'').toLowerCase(),name=(el.name||'').toLowerCase(),ph=(el.placeholder||'').toLowerCase(),label=(el.closest('.f')?.querySelector('label')?.textContent||'').toLowerCase(),ctx=`${id} ${name} ${ph} ${label}`;
  if(el.type==='date')return new Date().toISOString().slice(0,10);
  if(el.type==='datetime-local')return ESFClinical.localDateTime();
  if(el.type==='time')return '09:00';
  if(el.tagName==='SELECT'){
    const opcoes=Array.from(el.options).filter(o=>!/^$|—|não avaliado|nao avaliado/i.test(String(o.value||o.textContent||'').trim()));
    const texto=o=>String(o.textContent||o.value||'').trim(),pega=rx=>opcoes.find(o=>rx.test(texto(o)))?.value||opcoes.find(o=>rx.test(texto(o)))?.textContent||'';
    if(/sexo/.test(ctx))return pega(/feminino/i)||pega(/masculino/i)||texto(opcoes[0]||{});
    if(/gestante|gravidez|gr[aá]vida/.test(ctx))return pega(/^n[aã]o\b/i)||texto(opcoes[0]||{});
    if(/tabag|[aá]lcool|droga|viol[eê]ncia|febre|sangramento|perda|dor|queda|dis[uú]ria|corrimento|les[oõ]es|fissura|ingurgitamento|mastite|hipoglicemia|feridas|edema|falta|dispneia|tontura|visual|cefaleia/.test(ctx))return pega(/^n[aã]o\b/i)||texto(opcoes[0]||{});
    if(/estado geral/.test(ctx))return pega(/BEG|bom/i)||texto(opcoes[0]||{});
    if(/consci[eê]ncia/.test(ctx))return pega(/l[uú]cido|orientado/i)||texto(opcoes[0]||{});
    if(/moradia/.test(ctx))return pega(/pr[oó]pria/i)||texto(opcoes[0]||{});
    if(/saneamento|acesso|cama|banheiro/.test(ctx))return pega(/adequad/i)||texto(opcoes[0]||{});
    if(/[aá]gua|energia|cuidador sabe|medica[cç][aã]o|receita|prescri[cç][aã]o|tem em casa|suficiente/.test(ctx))return pega(/^sim\b/i)||texto(opcoes[0]||{});
    if(/mobilidade/.test(ctx))return pega(/aux[ií]lio|cadeirante|restrito/i)||texto(opcoes[0]||{});
    if(/depend[eê]ncia|adl|avd/.test(ctx))return pega(/parcial/i)||texto(opcoes[0]||{});
    if(/risco|prioridade|classifica/.test(ctx))return pega(/baixo|rotina/i)||texto(opcoes[0]||{});
    return texto(opcoes[0]||{});
  }
  if(el.type==='number'){
    if(/peso/.test(ctx))return '72';
    if(/altura uterina|\bau\b/.test(ctx))return '22';
    if(/bcf/.test(ctx))return '145';
    if(/altura|estatura|\balt\b/.test(ctx))return '1.65';
    if(/sat/.test(ctx))return '98';
    if(/temp/.test(ctx))return '36.6';
    if(/\bfc\b|frequencia cardiaca|frequência cardíaca/.test(ctx))return '78';
    if(/\bfr\b|respirat/.test(ctx))return '16';
    if(/glic/.test(ctx))return '104';
    if(/dor/.test(ctx))return '2';
    if(/dias/.test(ctx))return '8';
    if(/comprimento|largura/.test(ctx))return '3';
    if(/profundidade/.test(ctx))return '0.3';
    if(/perimetro|perímetro|pc|pa|pt/.test(ctx))return '44';
    if(/\bg\b|gesta/.test(ctx))return '1';
    if(/\bp\b|parto/.test(ctx))return '0';
    if(/aborto|cesárea|cesarea|filhos vivos/.test(ctx))return '0';
    return String(inteiroTeste(1,12));
  }
  if(/cpf/.test(ctx))return cpfFicticioValido();
  if(/cns/.test(ctx))return `7${Array.from({length:14},()=>inteiroTeste(0,9)).join('')}`;
  if(/cep/.test(ctx))return '85900-000';
  if(/telefone|whatsapp|ddd/.test(ctx))return `(45) 9${inteiroTeste(1000,9999)}-${inteiroTeste(1000,9999)}`;
  if(/pa\b|press[aã]o/.test(ctx))return '112/72';
  if(/nome.*m[aã]e|mae/.test(ctx))return sorteioTeste(['Sonia Maria Ribeiro','Lucia Helena Souza','Aparecida Martins Pereira']);
  if(/parceiro|acompanhante/.test(ctx))return 'Rafael Mendes Pereira';
  if(/nome/.test(ctx))return sorteioTeste(['Marina Alves Ribeiro','Camila Fernandes Souza','Juliana Martins Pereira','Renata Oliveira Costa','Beatriz Lima Rocha']);
  if(/prontu[aá]rio|registro/.test(ctx))return `PR-${inteiroTeste(1000,9999)}`;
  if(/logradouro|endere|rua|avenida/.test(ctx))return sorteioTeste(['Rua das Flores','Rua São João','Avenida Maripá','Rua Santos Dumont']);
  if(/n[uú]mero/.test(ctx))return String(inteiroTeste(40,980));
  if(/bairro/.test(ctx))return sorteioTeste(['Jardim Europa','Centro','Jardim Panorama','Vila Industrial']);
  if(/munic[ií]pio|cidade/.test(ctx))return 'Toledo';
  if(/\buf\b|estado/.test(ctx))return 'PR';
  if(/micro[aá]rea|area|área/.test(ctx))return `Microárea ${inteiroTeste(1,8)}`;
  if(/profissional|enfermeir|executor|coren/.test(ctx))return sorteioTeste(['Enf. Mariana Lopes - COREN 123456','Enf. Carlos Henrique - COREN 234567','Enf. Ana Paula Ribeiro - COREN 345678']);
  if(/ocupa|trabalho/.test(ctx))return sorteioTeste(['Auxiliar administrativa','Professora','Comerciante','Autônoma']);
  if(/alerg/.test(ctx))return 'Nega alergias medicamentosas';
  if(/medicamento|medica[cç][aã]o|muc/.test(ctx))return 'Em uso de medicação conforme prescrição vigente; nega automedicação';
  if(/queixa|hma|hist[oó]ria|motivo|sintoma/.test(ctx))return 'Sem queixas no momento; nega sinais de alerta durante a consulta';
  if(/conduta|plano|orienta|retorno|encaminha/.test(ctx))return 'Orientadas medidas de rotina, sinais de alerta, retorno programado e seguimento conforme protocolo local';
  if(/exame f[ií]sico|estado geral|eg/.test(ctx))return 'BEG, orientada, hidratada, eupneica, sem sinais de alarme no momento';
  if(/mama/.test(ctx))return 'Mamas simétricas, sem nódulos palpáveis, sem descarga papilar';
  if(/ausculta|ap|ac/.test(ctx))return 'AC: BRNF 2T sem sopros. AP: MV+ bilateralmente, sem RA';
  if(/observa|descri|detalhe/.test(ctx))return 'Sem intercorrências adicionais relatadas durante a avaliação';
  return 'Sem particularidades';
}
function preencherCamposTesteGenericos(pageId){
  const page=document.getElementById(pageId);if(!page)return;
  page.querySelectorAll('input:not([type="file"]):not([type="hidden"]),textarea,select').forEach(el=>{
    if(el.value||el.readOnly||el.disabled)return;
    const v=valorTestePorCampo(el);
    if(el.tagName==='SELECT'){
      const opt=Array.from(el.options).find(o=>o.value===v||o.textContent===v);
      if(opt)el.value=opt.value;else if(el.options.length>1)el.selectedIndex=1;
    }else el.value=v;
    el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  });
  page.querySelectorAll('input[type="radio"]').forEach(el=>{
    if(!el.name||page.querySelector(`input[type="radio"][name="${CSS.escape(el.name)}"]:checked`))return;
    el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));
  });
}
function preencherGuiasClinicosTeste(module){
  document.querySelectorAll(`.clinical-guide[data-module="${module}"] .clinical-pane`).forEach(pane=>{
    selecionarResultadosEsperados(module,pane.dataset.kind);
  });
}
function preencherTestesRapidosContainerTeste(containerSel,prefix){
  const box=document.querySelector(containerSel);if(!box)return;
  box.querySelectorAll('input:not([readonly])').forEach(input=>{
    if(input.type==='file'||input.type==='hidden')return;
    if(!input.value)input.value=/marca|lote/i.test(input.id||input.placeholder||'')?'BIOKIT 2026 / L2406':valorTestePorCampo(input);
    input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  box.querySelectorAll('select[id$="-res"]').forEach(sel=>{sel.value='NÃO REAGENTE';sel.dispatchEvent(new Event('change',{bubbles:true}))});
  const datas=box.querySelectorAll('input[type="date"]');datas.forEach(x=>{if(!x.value)x.value=new Date().toISOString().slice(0,10)});
  const horas=box.querySelectorAll('input[type="time"]');horas.forEach(x=>{if(!x.value)x.value='09:00'});
  if(prefix==='ist')avaliarResultadosTR();else avaliarResultadosTR();
}
function registrarVacinaTeste(module){
  const texto=document.getElementById(`vac-texto-${module}`);
  if(texto&&!texto.value)texto.value='22/05/2026 Influenza Trivalente — FLU3V Única ESF COSMOS\n26/07/2024 Hepatite B — HB 3ª Dose ESF COSMOS\n26/07/2024 dTpa adulto — dTpa 1º Reforço ESF COSMOS';
  VAC_RESULTADOS[module]={registros:[{data:'22/05/2026',vacina:'Influenza Trivalente',dose:'Única',prof:'Enf. Mariana Lopes',unidade:'ESF COSMOS'}],avaliacao:{avisos:[],ok:['Histórico vacinal preenchido para conferência do módulo.']},resumo:'Avaliação vacinal PNI: histórico preenchido para conferência; confirmar intervalos, contraindicações e situações especiais com a sala de vacina.'};
}
function preencherVisitaDomiciliarTeste(){
  setTestField('vd-tipo-visita','acamado');
  document.querySelectorAll('[name="vd-tipo-visita-radio"]').forEach(r=>{r.checked=r.value==='acamado';r.dispatchEvent(new Event('change',{bubbles:true}))});
  if(typeof atualizarTipoVisitaVD==='function')atualizarTipoVisitaVD();
  [['vd-estado-geral','BEG, responsivo, hidratado, sem sinal agudo'],['vd-consciencia','Lúcido/orientado'],['vd-respiratorio','Eupneico, sem secreção importante'],['vd-ferida-tipo','Lesão por pressão'],['vd-ferida-local','Região sacral'],['vd-ferida-tamanho','2 x 1 cm'],['vd-ferida-tecido','Granulação'],['vd-ferida-exsudato','Pouco'],['vd-ferida-odor','Ausente'],['vd-ferida-dor','Leve ao manuseio'],['vd-mudanca-decubito','Realizada com apoio da cuidadora a cada 2 horas'],['vd-colchao','Colchão comum com coxins improvisados'],['vd-rede-apoio','Parcial'],['vd-cuidador-sobrecarga-sel','Sim'],['vd-insumos-suficientes','Parcial'],['vd-insumos-obs','Família possui fraldas e luvas; orientar organização de gazes, soro fisiológico e cobertura conforme disponibilidade da unidade.'],['vd-risco-manual','Moderado'],['vd-risco-justificativa','Risco funcional e social por acamamento, dependência total e cuidadora com sobrecarga referida.']].forEach(([id,v])=>setTestField(id,v));
  ['vd-pele-avaliada','vd-lpp-presente','vd-cuidador-sobrecarga'].forEach(id=>{const el=document.getElementById(id);if(el){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}});
  ['Sonda vesical de demora','Curativo complexo'].forEach(valor=>{const el=Array.from(document.querySelectorAll('.vd-device')).find(x=>x.value===valor);if(el){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}});
  if(typeof atualizarDispositivosVD==='function')atualizarDispositivosVD();
  document.querySelectorAll('.vd-device-card select').forEach(sel=>{if(!sel.value&&sel.options.length>1)sel.selectedIndex=1;sel.dispatchEvent(new Event('change',{bubbles:true}))});
  document.querySelectorAll('.vd-device-card textarea').forEach(tx=>{if(!tx.value)tx.value='Dispositivo avaliado no domicílio, sem intercorrência aguda no momento; cuidadora orientada quanto à higiene, fixação e sinais de alerta.';tx.dispatchEvent(new Event('input',{bubbles:true}))});
  document.querySelectorAll('.vd-device-card input:not([type="hidden"])').forEach(inp=>{if(!inp.value)inp.value=valorTestePorCampo(inp);inp.dispatchEvent(new Event('input',{bubbles:true}))});
  if(!document.querySelector('#vd-med-body tr')){
    adicionarMedicamentoVD({nome:'Losartana',dose:'1 comprimido pela manhã conforme prescrição',horarios:'08h',admin:'Cuidadora'});
    adicionarMedicamentoVD({nome:'Metformina',dose:'Uso conforme prescrição familiar apresentada',horarios:'08h e 20h',admin:'Cuidadora'});
  }
  ['Fraldas','Luvas','Gazes','Soro fisiológico','Cobertura de curativo','Medicamentos de uso contínuo'].forEach(valor=>{
    const chip=Array.from(document.querySelectorAll('.vd-insumo')).find(x=>x.value===valor);if(chip){chip.checked=true;chip.dispatchEvent(new Event('change',{bubbles:true}))}
  });
  document.querySelectorAll('.vd-table tr[data-insumo]').forEach((row,i)=>{
    const item=row.dataset.insumo||'',tem=row.querySelector('.vd-insumo-tem'),suf=row.querySelector('.vd-insumo-suf'),sol=row.querySelector('.vd-insumo-solicitar'),forn=row.querySelector('.vd-insumo-forn');
    if(tem)tem.value=/Gazes|Cobertura|Soro/.test(item)?'Parcial':'Sim';
    if(suf)suf.value=/Gazes|Cobertura|Soro/.test(item)?'Parcial':'Sim';
    if(sol)sol.value=/Gazes|Cobertura|Soro/.test(item)?'Sim':'Não';
    if(forn&&!forn.value)forn.value='Família / UBS';
    row.querySelectorAll('select,input').forEach(el=>el.dispatchEvent(new Event('change',{bubbles:true})));
  });
  if(typeof atualizarAlertasMedicamentosVD==='function')atualizarAlertasMedicamentosVD();
  if(typeof classificarRiscoVD==='function')classificarRiscoVD();
  if(typeof validarVisitaDomiciliar==='function')validarVisitaDomiciliar();
  if(typeof atualizarSoftChecks==='function')atualizarSoftChecks(document.getElementById('pg-visita-domiciliar')||document);
}
function gerarSoapTesteModulo(module){
  try{
    if(module==='pna')gerarSoapAutomatoPna();
    else if(module==='pnc')gerarSoapAutomatoPnc();
    else if(module==='pu')gerarSoapAutomatoPu();
    else if(module==='prev')gerarSoapPreventivo();
    else if(module==='id')gerarSoapIdoso();
    else if(module==='sm')gerarSoapSM();
    else if(MODULOS_COM_PROTOCOLO_ATIVO.has(module))gerarSoapGenerico(module);
  }catch(e){console.warn('Falha ao gerar SOAP no modo teste',module,e)}
}
function preencherTesteModulo(module){
  if(!exigirPermissao('usar_modo_teste','Seu perfil não possui permissão para utilizar o modo TESTE.'))return;
  if(module==='prev'){preencherDadosTeste();preencherCamposTesteGenericos('pg-preventivo');preencherGuiasClinicosTeste('prev');registrarVacinaTeste('prev');gerarSoapTesteModulo('prev');return;}
  const cfg=ADMIN_TEST_MODULES[module];if(!cfg)return;
  const ficticios=dadosFicticiosCoerentes(module),idsFicticios=new Set(Object.keys(ficticios));
  Object.entries(cfg.values).filter(([id])=>!idsFicticios.has(id)).forEach(([id,value])=>setTestField(id,value));
  Object.entries(ficticios).forEach(([id,value])=>setTestField(id,value));
  preencherCamposTesteGenericos(cfg.page);
  preencherGuiasClinicosTeste(module);
  registrarVacinaTeste(module);
  if(module==='pna'){
    calcIG('pna');imcGest();
    document.querySelectorAll('#pna-familiares-list input').forEach((el,i)=>{if(i<2){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}});
    atualizarTestesRapidosPna();
    preencherCamposTesteGenericos('pna-tr');
    preencherTestesRapidosContainerTeste('#pna-tr','pna');
    avaliarProtocolosPna();
  }
  if(module==='pnc'){
    [['exr-hb','12.1'],['exr-ht','36'],['exr-glic','84'],['exr-tsh','1.8']].forEach(([row,value])=>{const el=document.querySelector(`#${row} .ex-val`);if(el){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}});
    [['exr-vdrl','nreag'],['exr-hiv','neg'],['exr-urina','normal'],['exr-coombs','neg'],['exr-hepb','neg'],['exr-hepc','neg']].forEach(([row,value])=>{const el=document.querySelector(`#${row} .ex-val`);if(el){el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}});
    callAIExames('pnc');
  }
  if(module==='pu'){
    [['pu-exr-hb','12'],['pu-exr-ht','36'],['pu-exr-glic','88']].forEach(([row,value])=>{const el=document.querySelector(`#${row} .ex-val`);if(el){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}});
    [['pu-exr-para','neg'],['pu-exr-urina','normal']].forEach(([row,value])=>{const el=document.querySelector(`#${row} .ex-val`);if(el){el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}});
    callAIExamesPu();
  }
  if(module==='ist'){
    atualizarTestesRapidosIST();
    preencherCamposTesteGenericos('pg-ist');
    preencherTestesRapidosContainerTeste('#pg-ist','ist');
  }
  if(module==='vd')preencherVisitaDomiciliarTeste();
  if(MODULOS_COM_PROTOCOLO_ATIVO.has(module)){
    avaliarPrioridadeModulo(module);
  }
  gerarSoapTesteModulo(module);
  showToast('Cenário de teste preenchido.');
}
function mostrarBotoesTesteAdmin(){
  if(!temPermissao('usar_modo_teste'))return;
  Object.entries(ADMIN_TEST_MODULES).forEach(([module,cfg])=>{
    const head=document.querySelector(`#${cfg.page} > .sh`);if(!head||head.querySelector('.admin-test-btn'))return;
    const btn=document.createElement('button');btn.type='button';btn.className='btn admin-test-btn';btn.style.display='inline-flex';btn.textContent='TESTE';btn.title='Preencher cenário simulado para testar este atendimento';btn.onclick=()=>preencherTesteModulo(module);head.appendChild(btn);
  });
  const prev=document.getElementById('btn-prev-teste');if(prev)prev.style.display='inline-flex';
}

function val(id, fallback='') {
  const el = document.getElementById(id);
  return (el?.value || fallback || '').trim();
}
function checkedText(sel) {
  return Array.from(document.querySelectorAll(sel + ':checked')).map(e => e.closest('label')?.textContent?.trim()).filter(Boolean).join('; ');
}
function formatarCondutaSoap(texto){
  return String(texto||'').replace(/\.Fonte:/g,'.\nFonte:').replace(/sugerida(?=dT|Hepatite|Influenza|Covid|VSR)/g,'sugerida:\n- ').replace(/(?<!^)(dT\/dTpa:|dTpa:|Hepatite B:|Influenza:|Covid-19:|VSR:)/g,'\n- $1').replace(/\n{3,}/g,'\n\n').trim();
}
const SOAP_IDS_MODULO={
  pna:{s:'pna-s',o:'pna-o',a:'pna-a-soap',p:'pna-soap-p'},pnc:{s:'pnc-s',o:'pnc-o',a:'pnc-a-soap',p:'pnc-p'},pu:{s:'pu-s',o:'pu-o',a:'pu-a-soap',p:'pu-p'},
  prev:{s:'prev-s',o:'prev-o',a:'prev-a-soap',p:'prev-p'},id:{s:'id-s',o:'id-o',a:'id-a-soap',p:'id-p'},sm:{s:'sm-s',o:'sm-o',a:'sm-a',p:'sm-p'},
  ger:{s:'ger-s',o:'ger-o',a:'ger-a',p:'ger-p'},acol:{s:'acol-s',o:'acol-o',a:'acol-a',p:'acol-p'},hip:{s:'hip-s',o:'hip-o',a:'hip-a',p:'hip-p'},
  fer:{s:'fer-s',o:'fer-o',a:'fer-a',p:'fer-p'},puerp:{s:'puerp-s',o:'puerp-o',a:'puerp-a',p:'puerp-p'},ist:{s:'ist-s',o:'ist-o',a:'ist-a',p:'ist-p'},vd:{s:'vd-s',o:'vd-o',a:'vd-a',p:'vd-p'}
};
const SOAP_BASE_PROTOCOLAR={
 pna:'Linha de Cuidado Materno-Infantil; Protocolo Municipal de Pré-Natal de Toledo, 4ª edição; Calendário Nacional de Vacinação/PNI vigente.',
 pnc:'Linha de Cuidado Materno-Infantil; Protocolo Municipal de Pré-Natal de Toledo, 4ª edição; Calendário Nacional de Vacinação/PNI vigente.',
 pu:'Estratificação de Risco de Crianças do Paraná; fluxo municipal de Pediatria; Calendário Nacional de Vacinação/PNI vigente.',
 prev:'Rastreamento citopatológico vigente; Protocolo IST Toledo.',id:'IVCF-20 e protocolos municipais aplicáveis.',sm:'ERSM e Fluxograma Municipal de Saúde Mental.',
 hip:'Protocolos municipais de Cardiologia e Endocrinologia.',fer:'Protocolo municipal de Teledermatologia e fluxos aplicáveis.',puerp:'Protocolo Municipal de Pré-Natal de Toledo, seção de puerpério.',ist:'Protocolo IST Toledo.',vd:'Atenção Domiciliar na APS/ESF; protocolos municipais aplicáveis ao quadro registrado.',ger:'Protocolos municipais aplicáveis ao quadro registrado.',acol:'Protocolos municipais aplicáveis ao quadro registrado.'
};
function limparSegmentosVazios(linha){
  return String(linha||'').split('|').map(x=>x.trim()).filter(x=>x&&!/:\s*(?:-|—)(?:\s|$)|:\s*(?:não informado|nao informado|não realizada?|nao realizada?|não calculad[ao]|nao calculad[ao])\.?$/i.test(x)).join(' | ');
}
function limparTextoSoap(texto){
  const proibido=/(?:^|\b)complementar\b|campo não preenchido|campo nao preenchido|não informado|nao informado|não classificado|nao classificado|sinais vitais não informados|sinais vitais nao informados|nenhum item marcado|nenhum marco assinalado|registrar complementos clínicos|registrar complementos clinicos|sem condições de vulnerabilidade marcadas|sem eventos? agudos? marcados?|preencher o histórico vacinal|(?:^|\b)(?:undefined|null|nan)(?:\b|$)/i;
  texto=String(texto||'').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'').replace(/[^.\n]*(?:AAS|ácido acetilsalicílico)[^.\n]*(?:cálcio|calcio)[^.\n]*\./gi,'Avaliar prevenção de pré-eclâmpsia conforme critérios clínicos, protocolo municipal e prescrição médica, quando indicada.');
  const linhas=texto.replace(/\r/g,'').split('\n').map(limparSegmentosVazios).map(x=>x.replace(/^(?:HMA|HP|HD|CD|CONDUTA INICIAL|PLANO\/ORIENTAÇÕES|PLANO\/ORIENTACOES):?\s*/i,'').replace(/^[•\-–—]\s*/,'').trim()).filter(x=>x&&!/^(?:S\s*[—-]\s*SUBJETIVO|O\s*[—-]\s*OBJETIVO|A\s*[—-]\s*AVALIAÇÃO|P\s*[—-]\s*PLANO\s*\/\s*CONDUTA):?$/i.test(x)&&!proibido.test(x)&&!/^[-•]\s*$/.test(x)&&!/^fontes?(?: verificada)?:/i.test(x));
  return [...new Set(linhas)].join('\n').replace(/\n{3,}/g,'\n\n').replace(/\s+\./g,'.').trim();
}
function campoExiste(...ids){return ids.some(id=>!!document.getElementById(id))}
function campoTemValor(...ids){return ids.some(id=>{const e=document.getElementById(id);if(!e)return false;if(e.type==='checkbox'||e.type==='radio')return e.checked;if('value' in e)return !!String(e.value||'').trim();return !!String(e.textContent||'').trim()})}
const SOAP_MANUAL_PREFIXOS=['pna','pnc','pu','prev','id','sm','ger','acol','hip','fer','puerp','ist','vd'];
const SOAP_MANUAL_ANCHORS={pna:'pna-3',pnc:'pnc-2',pu:'pu-2',prev:'prev-2',id:'id-2',sm:'sm-2',ger:'ger-anamnese',acol:'acol-anamnese',hip:'hip-anamnese',fer:'fer-anamnese',puerp:'puerp-anamnese',ist:'ist-anamnese',vd:'vd-aval'};
function textoManual(id){return String(document.getElementById(id)?.value||'').trim()}
function manualSoapPartes(prefix){
  const queixa=textoManual(`${prefix}-manual-queixa`),hma=textoManual(`${prefix}-manual-hma`),objetivo=textoManual(`${prefix}-manual-objetivo`),avaliacao=textoManual(`${prefix}-manual-avaliacao`),conduta=textoManual(`${prefix}-manual-conduta`);
  return {
    s:[queixa,hma].filter(Boolean).join('\n'),
    o:objetivo||'',
    a:avaliacao||'',
    p:conduta||''
  };
}
function manualSoapHtml(prefix){
  return `<div class="card manual-soap-card" id="manual-soap-${prefix}"><div class="ct"><span class="dot db"></span>Complementos manuais para o SOAP</div><div class="alert alert-i"><strong>Campo livre:</strong> use quando a queixa, detalhe clínico ou conduta não existir nos botões. O texto escrito aqui entra automaticamente na evolução e também ajuda a acionar os protocolos compatíveis.</div><div class="g2"><div class="f"><label>Queixa/anamnese manual</label><textarea id="${prefix}-manual-queixa" placeholder="Ex: refere dor em baixo ventre há 2 dias, piora ao urinar, nega febre..." oninput="atualizarManualSoap('${prefix}')"></textarea></div><div class="f"><label>História complementar / contexto</label><textarea id="${prefix}-manual-hma" placeholder="Detalhes de início, evolução, fatores associados, contexto familiar/social, medicações ou informações que não estão nos botões..." oninput="atualizarManualSoap('${prefix}')"></textarea></div><div class="f"><label>Exame físico / dados objetivos manuais</label><textarea id="${prefix}-manual-objetivo" placeholder="Achados observados, sinais vitais extras, medidas, exame dirigido..." oninput="atualizarManualSoap('${prefix}')"></textarea></div><div class="f"><label>Avaliação e conduta manual</label><textarea id="${prefix}-manual-avaliacao" placeholder="Impressão/avaliação clínica do profissional..." oninput="atualizarManualSoap('${prefix}')"></textarea><textarea id="${prefix}-manual-conduta" placeholder="Condutas, orientações, retorno, encaminhamento decidido pelo profissional..." oninput="atualizarManualSoap('${prefix}')" style="margin-top:8px"></textarea></div></div></div>`;
}
function atualizarManualSoap(prefix){
  clearTimeout(window._manualSoapTimer);
  window._manualSoapTimer=setTimeout(()=>{try{renderCentralProtocolar(prefix);avaliarPrioridadeModulo(prefix);atualizarIndicadorPreenchimento();}catch(e){}},180);
}
function montarComplementosManuaisSoap(){
  SOAP_MANUAL_PREFIXOS.forEach(prefix=>{
    if(document.getElementById(`manual-soap-${prefix}`))return;
    const alvo=document.getElementById(SOAP_MANUAL_ANCHORS[prefix])||document.getElementById(`${prefix}-anamnese`)||document.getElementById(`${prefix}-consulta`)||document.getElementById(`${prefix}-aval`)||document.getElementById(`${prefix}-soap`)||document.getElementById(SOAP_IDS_MODULO[prefix]?.s)?.closest('.tp');
    if(!alvo)return;
    alvo.insertAdjacentHTML('beforeend',manualSoapHtml(prefix));
  });
}
function gerarPendenciasSoap(prefix){
  const p=[],add=(cond,txt)=>{if(cond&&!p.includes(txt))p.push(txt)};
  const idsSoap=SOAP_IDS_MODULO[prefix]||{};
  const temExame=campoTemValor(`${prefix}-exame-complementar`,`${prefix}-manual-objetivo`,idsSoap.o)||!!document.querySelector(`#clinical-guide-${prefix}-exam .selected`);
  add(!campoTemValor(`${prefix}-queixa`,`${prefix}-queixas`,`${prefix}-hma`,`${prefix}-complaints`,`${prefix}-motivo`,`${prefix}-sintomas`,`${prefix}-inicio`,`${prefix}-evolucao`,`${prefix}-manual-queixa`,`${prefix}-manual-hma`,idsSoap.s),'Registrar queixa principal e história da queixa atual.');
  if(prefix!=='pna'){
    add(campoExiste(`${prefix}-alergias`)&&!campoTemValor(`${prefix}-alergias`),'Confirmar alergias.');
    add(campoExiste(`${prefix}-medicamentos`)&&!campoTemValor(`${prefix}-medicamentos`),'Confirmar medicamentos em uso.');
  }
  add(!temExame&&!['pna','pnc'].includes(prefix),'Registrar exame físico, se realizado.');
  add(!campoTemValor(`${prefix}-conduta`,`${prefix}-manual-conduta`)&&!String(document.getElementById(SOAP_IDS_MODULO[prefix]?.p)?.value||'').trim(),'Registrar conduta de enfermagem.');
  add(campoExiste(`${prefix}-retorno`)&&!campoTemValor(`${prefix}-retorno`)&&['pna','pnc','pu','prev','id','sm','ger','acol','hip','fer','puerp','ist'].includes(prefix),'Definir retorno programado.');
  if(prefix==='pna'||prefix==='pnc'){
    add(!campoTemValor(`${prefix}-dum`,`${prefix}-dpp`,`${prefix}-ig`),'Confirmar DUM, DPP e idade gestacional.');
    add(!campoTemValor(`${prefix}-pa`),'Registrar pressão arterial.');
    add(!campoTemValor(`${prefix}-peso`,`${prefix}-imc`),'Registrar peso e IMC.');
    add(!campoTemValor(`${prefix}-au`),'Registrar altura uterina, se avaliada/aplicável.');
    add(!campoTemValor(`${prefix}-bcf`),'Registrar BCF, se avaliado/aplicável.');
    add(!campoTemValor(`${prefix}-mf`),'Revisar movimentos fetais, se aplicável.');
    add(!document.querySelector(`#clinical-guide-${prefix}-exam .selected`)&&!campoTemValor(`${prefix}-eg`,`${prefix}-ausculta`),'Registrar exame físico geral/obstétrico, se realizado.');
    add(!VAC_RESULTADOS[prefix],'Confirmar histórico vacinal.');
    if(prefix==='pna'){
      const tr=resumoTestesRapidosPna(),igSem=parseInt((val('pna-ig').match(/\d+/)||[])[0]||0,10);
      add(!campoTemValor('pna-planejada'),'Registrar se a gestação foi planejada.');
      add(!campoTemValor('pna-dum-conf'),'Confirmar se a DUM é confiável ou se IG será ajustada por USG.');
      add(!campoTemValor('pna-med'),'Confirmar medicamentos em uso.');
      add(!campoTemValor('pna-alergia'),'Confirmar alergias medicamentosas.');
      add(!campoTemValor('pna-tab','pna-alc','pna-viol'),'Registrar tabagismo, álcool/drogas e violência doméstica.');
      add(!checkedText('#pna-familiares-list input'),'Registrar antecedentes familiares relevantes.');
      add(!campoTemValor('pna-prev'),'Registrar último preventivo/citopatológico.');
      add(!campoTemValor('pna-vac-ref')&&!VAC_RESULTADOS.pna,'Registrar situação vacinal referida ou analisar histórico vacinal.');
      add(igSem>=20&&!campoTemValor('pna-au'),'Registrar altura uterina para IG acima de 20 semanas, se avaliada.');
      add(igSem>=20&&!campoTemValor('pna-bcf'),'Registrar BCF para IG acima de 20 semanas, se avaliado.');
      add(!campoTemValor('pna-edema'),'Avaliar edema e MMII.');
      add(!campoTemValor('pna-maternidade'),'Registrar maternidade de referência/vinculação.');
      add(!campoTemValor('pna-odonto'),'Registrar encaminhamento ou orientação para odontologia.');
      add(!campoTemValor('pna-retorno'),'Definir retorno programado do pré-natal.');
      add(!!tr.pendentes.length,'Realizar/registrar testes rápidos pendentes conforme protocolo.');
    }
  }
  if(prefix==='pu'){add(!campoTemValor('pu-peso'),'Registrar peso.');add(!campoTemValor('pu-alt'),'Registrar estatura.');add(!campoTemValor('pu-pc','pu-per-cef'),'Registrar perímetro cefálico, se aplicável.');add(campoExiste('pu-dnpm','pu-dn')&&!campoTemValor('pu-dnpm','pu-dn'),'Avaliar desenvolvimento neuropsicomotor.');add(!campoTemValor('pu-alim'),'Confirmar alimentação.');add(!VAC_RESULTADOS.pu,'Revisar vacinação.');}
  if(prefix==='prev'){add(!campoTemValor('prev-idade','prev-nasc'),'Confirmar idade e indicação de rastreamento.');add(!campoTemValor('prev-dum','prev-hma','prev-queixas'),'Registrar DUM, queixas ginecológicas e histórico prévio.');add(!campoTemValor('prev-colo','prev-o'),'Registrar achados do exame clínico.');add(!campoTemValor('prev-coleta','prev-material','prev-data'),'Registrar se a coleta foi realizada.');add(!campoTemValor('prev-retorno'),'Orientar retorno para resultado.');}
  if(prefix==='hip'){add(!campoTemValor('hip-pa-atual','hip-pa'),'Registrar pressão arterial.');add(!campoTemValor('hip-glicemia'),'Registrar glicemia, se avaliada.');add(!campoTemValor('hip-adesao'),'Registrar adesão medicamentosa.');add(!campoTemValor('hip-sintomas','hip-dor-toracica','hip-falta-ar'),'Avaliar sintomas de alerta.');add(!campoTemValor('hip-exames'),'Revisar exames laboratoriais.');add(!campoTemValor('hip-pe-diabetico'),'Avaliar pé diabético, quando aplicável.');}
  if(prefix==='fer'){add(!campoTemValor('fer-local'),'Registrar localização da ferida.');add(!campoTemValor('fer-comprimento','fer-largura','fer-profundidade'),'Registrar tamanho e medidas da ferida.');add(!campoTemValor('fer-tecido'),'Registrar tecido predominante.');add(!campoTemValor('fer-exsudato'),'Registrar exsudato.');add(!campoTemValor('fer-odor','fer-dor','fer-bordas','fer-pele'),'Registrar odor, dor, bordas e pele perilesional.');add(!campoTemValor('fer-cobertura'),'Registrar cobertura utilizada.');}
  if(prefix==='sm'){add(!campoTemValor('sm-risco','sm-ersm-score'),'Avaliar risco suicida e estratificação.');add(campoExiste('sm-plano','sm-meio','sm-tentativa')&&!campoTemValor('sm-plano','sm-meio','sm-tentativa'),'Verificar plano, meio disponível e tentativa prévia, quando pertinente.');add(campoExiste('sm-rede','sm-contato')&&!campoTemValor('sm-rede','sm-contato'),'Avaliar rede de apoio.');add(campoExiste('sm-seguranca','sm-p')&&!campoTemValor('sm-seguranca','sm-p'),'Registrar conduta e plano de segurança.');}
  if(prefix==='ger'||prefix==='acol'){add(campoExiste(`${prefix}-inicio`)&&!campoTemValor(`${prefix}-inicio`),'Registrar tempo de início.');add(!campoTemValor(`${prefix}-pa`,`${prefix}-fc`,`${prefix}-temp`,`${prefix}-sat`),'Registrar sinais vitais.');add(campoExiste(`${prefix}-alerts`,`${prefix}-gravidade`)&&!campoTemValor(`${prefix}-alerts`,`${prefix}-gravidade`),'Avaliar sinais de alerta.');add(campoExiste(`${prefix}-prioridade`)&&!campoTemValor(`${prefix}-prioridade`),'Registrar classificação de prioridade.');add(campoExiste(`${prefix}-orientacoes`)&&!campoTemValor(`${prefix}-orientacoes`),'Registrar orientações.');}
  if(prefix==='id'){add(!campoTemValor('id-risco-queda','ivcf-quedas'),'Avaliar risco de quedas.');add(!campoTemValor('id-cognicao','id-humor','ivcf-esquecimento','ivcf-tristeza'),'Avaliar cognição e humor.');add(!campoTemValor('id-polifarmacia','id-num-meds'),'Avaliar polifarmácia.');add(!campoTemValor('id-violencia'),'Avaliar risco de violência ou negligência.');add(!campoTemValor('id-avd','id-aivd','ivcf-banho'),'Avaliar funcionalidade.');}
  if(prefix==='puerp'){add(!campoTemValor('puerp-sangramento'),'Avaliar sangramento/lóquios.');add(!campoTemValor('puerp-febre','puerp-dor'),'Avaliar febre e dor.');add(!campoTemValor('puerp-mamas','puerp-amamentacao'),'Avaliar mamas e amamentação.');add(!campoTemValor('puerp-humor','puerp-depressao'),'Avaliar humor materno.');add(!campoTemValor('puerp-sinais-alerta-orientados'),'Orientar sinais de alerta.');}
  if(prefix==='ist'){const tr=resumoTestesRapidosIST();add(!campoTemValor('ist-exposicao','ist-motivo','ist-sintomas'),'Registrar exposição ou queixa.');add(!tr.realizados?.length,'Registrar testes realizados e resultados.');add(!campoTemValor('ist-janela'),'Avaliar janela imunológica.');add(!campoTemValor('ist-parceria'),'Orientar parceria sexual.');add(!campoTemValor('ist-notificacao','ist-encaminhamento'),'Definir notificação/encaminhamento, se aplicável.');}
  return p;
}
function renderPendenciasSoap(prefix){
  const ids=SOAP_IDS_MODULO[prefix],s=document.getElementById(ids?.s);if(!s)return;
  const card=s.closest('.card')||s.closest('.tp'),grid=card?.querySelector('.soap-grid');if(!grid)return;
  let out=card.querySelector(`#soap-pendencias-${prefix}`);if(!out){out=document.createElement('div');out.id=`soap-pendencias-${prefix}`;grid.insertAdjacentElement('afterend',out)}
  const p=gerarPendenciasSoap(prefix);out.className=`soap-pendencias${p.length?'':' soap-pendencias-vazia'}`;out.innerHTML=p.length?`<h4>Pendências para revisar antes de salvar</h4><ul>${p.map(x=>`<li>${escTR(x)}</li>`).join('')}</ul>`:'<h4>Revisão</h4><div style="font-size:12px">Nenhuma pendência essencial identificada nos campos avaliados.</div>';return p;
}
function soapTextoModulo(prefix){
  const ids=SOAP_IDS_MODULO[prefix]||{};
  return [ids.s,ids.o,ids.a,ids.p].map(id=>document.getElementById(id)?.value||'').join('\n').toLowerCase();
}
function contarMedicamentosTexto(texto){
  const bruto=String(texto||'').replace(/\b(?:uso|em uso|medicamentos?|muc|nega|não usa|nao usa)\b/gi,' ').trim();
  if(!bruto)return 0;
  return bruto.split(/[,;\n+]| e /i).map(x=>x.trim()).filter(x=>x&&x.length>2&&!/^[-—]$/.test(x)).length;
}
function paginaDoModulo(prefix){return prefix==='pna'?'pg-pn-abertura':prefix==='pnc'?'pg-pn-consulta':prefix==='pu'?'pg-puericultura':prefix==='prev'?'pg-preventivo':prefix==='id'?'pg-idoso':prefix==='sm'?'pg-saude-mental':`pg-${MODULOS_CLINICOS?.[prefix]?.page||''}`;}
function validarCoerenciaSoap(prefix){
  const txt=soapTextoModulo(prefix),avisos=[],add=x=>{if(x&&!avisos.includes(x))avisos.push(x)};
  const pagina=document.querySelector('.pg.on')||document.getElementById(paginaDoModulo(prefix));
  const textoPagina=pagina?Array.from(pagina.querySelectorAll('input,select,textarea')).map(e=>String(e.value||'')).join(' ').toLowerCase():'';
  if(/\b(paciente teste|ana teste|dado fict[ií]cio|registro fict[ií]cio|valida[cç][aã]o do m[oó]dulo|mock|teste-\d+|cpf:\s*12345678909)\b/i.test(`${txt} ${textoPagina}`))add('Aviso: há possível dado de teste/fictício na consulta. Revise antes de copiar para prontuário real.');
  if(/ex:\s|placeholder|nome, dose, frequ[eê]ncia|dado fict[ií]cio preenchido/i.test(`${txt} ${textoPagina}`))add('Aviso: há texto de exemplo ou placeholder preenchido como dado clínico. Revise antes de finalizar.');
  if(/vacina|vacinal|pni/i.test(textoPagina)&&/mv\+|brnf|abdome|ausculta|beg|eupneic/i.test(textoPagina))add('Possível campo misturado: achado de exame físico aparece junto de campo vacinal. Revisar antes de salvar.');
  if(/medicamento|medica[cç][aã]o em uso/i.test(textoPagina)&&/\b(ana|maria|jo[aã]o|gustavo|rafael|camila|beatriz)\b/i.test(textoPagina)&&!/mg|mcg|ui|comprim|gota|ml|vo|im|sc|dose|hor[aá]rio/i.test(textoPagina))add('Possível campo misturado: medicações em uso parecem conter nome próprio sem dose/via/frequência.');
  const temNormal=/sem altera[cç][oõ]es|sem les[oõ]es|mamas sem altera[cç][oõ]es|colo sem les[oõ]es|adequado para a idade|dnpm adequado/i.test(txt);
  const temAlterado=/n[oó]dulo|les[aã]o|corrimento|odor|dor p[eé]lvica|sangramento|prov[aá]vel atraso|poss[ií]vel atraso|alto risco|queda|fragilidade|viol[eê]ncia|neglig[eê]ncia/i.test(txt);
  if(temNormal&&temAlterado)add('Há achados alterados e expressões de normalidade no mesmo SOAP. Revisar para evitar contradição clínica.');
  if(prefix==='pu'){
    if(/dnpm adequado|adequado para a idade/i.test(txt)&&/prov[aá]vel atraso|poss[ií]vel atraso/i.test(txt))add('Aviso: DNPM aparece como adequado e como possível/provável atraso. Revisar marcos avaliados.');
    if(/estratifica[cç][aã]o cib-pr:\s*alto/i.test(txt)&&!/crit[eé]rios?:/i.test(txt))add('Estratificação de risco da criança sem critério explícito no SOAP.');
  }
  if(prefix==='prev'){
    if(/n[oó]dulo/i.test(txt)&&/mamas sem altera[cç][oõ]es|exame das mamas:\s*sem altera/i.test(txt))add('Aviso: nódulo mamário registrado junto com mamas sem alterações. Revisar descrição e plano.');
    if(/les[aã]o|cisto de naboth|fri[aá]vel|sangramento ao toque/i.test(txt)&&/colo sem les[oõ]es|inspe[cç][aã]o do colo:\s*normal/i.test(txt))add('Aviso: achado cervical alterado registrado junto com colo normal/sem lesões. Revisar descrição e plano.');
    if(/corrimento|odor|dor p[eé]lvica|dispareunia/i.test(txt)&&/sinais de ist:\s*n[aã]o identificados/i.test(txt))add('Há queixa ginecológica sugestiva e texto dizendo IST não identificada. Revisar avaliação sindrômica.');
  }
  if(prefix==='id'){
    const meds=val('id-meds'),num=Number(val('id-num-meds')||0)||contarMedicamentosTexto(meds);
    if(/polifarm[aá]cia:\s*sim/i.test(txt)&&num>0&&num<5)add('Aviso: polifarmácia marcada, mas menos de 5 medicamentos foram informados. Registrar como referida/não confirmada ou completar lista.');
    if(/depend[eê]ncia:\s*independente/i.test(txt)&&/aivd:\s*(depend|parcial)/i.test(txt))add('Aviso: funcionalidade contraditória: AIVD com dependência parcial e avaliação geral como independente.');
    if(/viol[eê]ncia\/neglig[eê]ncia:\s*suspe/i.test(txt)&&!/relato|sinal objetivo|les[aã]o|medo|abandono|coer[cç][aã]o/i.test(txt))add('Suspeita de violência/negligência precisa de relato ou sinal objetivo; rede limitada deve ser registrada como vulnerabilidade.');
  }
  if(prefix==='sm'){
    if(/risco|ersm/i.test(txt)&&!/crit[eé]rios|itens pontuados|pontua[cç][aã]o/i.test(txt))add('Estratificação de saúde mental sem critérios/pontuação detalhada.');
    if(!/exame do estado mental|apar[eê]ncia|humor|afeto|pensamento|ju[ií]zo|orienta[cç][aã]o/i.test(txt))add('Aviso: registrar exame do estado mental resumido antes de finalizar, se aplicável.');
    if(/caps i/i.test(txt)&&!/menor de 18|crian[cç]a|adolescente/i.test(txt))add('Aviso: CAPS i só deve aparecer quando o perfil for menor de 18 anos.');
    if(/caps ad/i.test(txt)&&!/subst[aâ]ncia|[aá]lcool|droga|abstin[eê]ncia|intoxica/i.test(txt))add('Aviso: CAPS AD só deve aparecer quando houver uso problemático de álcool/drogas ou abstinência/intoxicação.');
  }
  return avisos;
}
function textoCamposPagina(prefix){
  const page=document.getElementById(paginaDoModulo(prefix));
  if(!page)return'';
  return Array.from(page.querySelectorAll('input,select,textarea')).filter(e=>e.type!=='hidden'&&e.type!=='file').map(e=>{
    const label=e.closest('.f')?.querySelector('label')?.textContent||e.id||e.name||'campo';
    const v=(e.type==='checkbox'||e.type==='radio')?(e.checked?(e.closest('label')?.textContent||e.value):''):e.value;
    return v?`${label}: ${v}`:'';
  }).filter(Boolean).join(' | ');
}
function localizarCamposSuspeitos(prefix,regex){
  const page=document.getElementById(paginaDoModulo(prefix));
  if(!page)return'';
  const achados=Array.from(page.querySelectorAll('input,select,textarea')).filter(e=>e.type!=='hidden'&&e.type!=='file').map(e=>{
    const valor=(e.type==='checkbox'||e.type==='radio')?(e.checked?(e.closest('label')?.textContent||e.value):''):e.value;
    const texto=normalizarTextoProtocolo(valor||'');
    if(!texto||!regex.test(texto))return'';
    const label=(e.closest('.f')?.querySelector('label')?.textContent||e.id||e.name||'campo').trim();
    return `${label}: "${String(valor).trim().slice(0,60)}"`;
  }).filter(Boolean).slice(0,4);
  return achados.length?` Local provável: ${achados.join(' | ')}.`:'';
}
function validarEntradaPreSoap(prefix){
  const texto=normalizarTextoProtocolo(textoCamposPagina(prefix)),avisos=[],add=x=>{if(x&&!avisos.includes(x))avisos.push(x)};
  const rxTeste=/\b(paciente teste|ana teste|dado ficticio|registro ficticio|validacao do modulo|mock|teste-\d+|12345678909)\b/;
  const rxExemplo=/ex:\s|placeholder|nome, dose, frequencia|dado ficticio preenchido/;
  if(rxTeste.test(texto))add('Aviso: há possível dado de teste/fictício na consulta.'+localizarCamposSuspeitos(prefix,rxTeste)+' A evolução será gerada normalmente; revise antes de usar em prontuário real.');
  if(rxExemplo.test(texto))add('Aviso: há texto de exemplo preenchido como dado clínico.'+localizarCamposSuspeitos(prefix,rxExemplo)+' Revise antes de finalizar.');
  if(/vacina|vacinal|pni/.test(texto)&&/mv\+|brnf|abdome|ausculta|beg|eupneic/.test(texto))add('Aviso: provável campo misturado, com exame físico dentro de vacina/PNI. Ação não bloqueada.');
  if(/medicamento|medicacoes em uso|medicamentos em uso/.test(texto)&&/\b(ana|maria|joao|gustavo|rafael|camila|beatriz)\b/.test(texto)&&!/mg|mcg|ui|comprim|gota|ml|vo|im|sc|dose|horario/.test(texto))add('Aviso: campo de medicamento parece conter nome próprio sem dose/via/frequência. Ação não bloqueada.');
  if(prefix==='pna'||prefix==='pnc'){
    const ig=pnaIgSemanas? (prefix==='pna'?pnaIgSemanas():Number((val('pnc-ig').match(/\d+/)||[])[0]||0)) : 0;
    if(ig>=20&&!campoTemValor(`${prefix}-au`,`${prefix}-bcf`,`${prefix}-mf`))add('Aviso: IG maior ou igual a 20 semanas sem AU/BCF/movimentos fetais registrados. Gere se desejar, mas revise se foram avaliados.');
  }
  if(prefix==='id'&&/polifarmacia:\s*sim/.test(texto)&&contarMedicamentosTexto(val('id-meds'))<5)add('Aviso: polifarmácia exige 5 ou mais medicamentos listados ou registro como referida/não confirmada.');
  return avisos;
}
function alertasVermelhosSoap(prefix){
  const txt=[soapTextoModulo(prefix),textoConsultaCentral(prefix)].join(' ').toLowerCase(),a=[],add=x=>{if(x&&!a.includes(x))a.push(x)};
  if(/sangramento vaginal|sangramento gestacional/.test(txt))add('Sangramento gestacional registrado: avaliar urgência obstétrica conforme protocolo e não usar plano de rotina isolado.');
  if(/perda de l[ií]quido/.test(txt))add('Perda de líquido registrada: avaliar bolsa rota/urgência obstétrica conforme protocolo.');
  if(/redu[cç][aã]o de mf|aus[eê]ncia de movimentos fetais|diminui[cç][aã]o de mf/.test(txt))add('Redução/ausência de movimentos fetais: avaliar vitalidade fetal e fluxo obstétrico.');
  if(/pa\s*(?:1[6-9]\d|[2-9]\d\d)\s*[x/]\s*(?:1[1-9]\d|[2-9]\d\d)|press[aã]o.*elevada.*sintoma|cefaleia.*escotoma|dor epig[aá]strica|dor em hcd/.test(txt))add('PA/sintomas de gravidade na gestação ou atendimento: priorizar avaliação imediata conforme protocolo.');
  if(/idea[cç][aã]o suicida.*plano|plano suicida|meio dispon[ií]vel|autoagress[aã]o/.test(txt))add('Risco suicida/autoagressão: realizar avaliação imediata de segurança e acionar rede/urgência quando indicado.');
  if(/teste.*reagente|hiv.*reagente|s[ií]filis.*reagente|hbsag.*reagente|anti.?hcv.*reagente/.test(txt))add('Teste reagente registrado: seguir fluxo de aconselhamento, confirmação/notificação e parcerias conforme protocolo.');
  if(/viol[eê]ncia sexual|viol[eê]ncia dom[eé]stica|risco de viol[eê]ncia|neglig[eê]ncia confirmada/.test(txt))add('Violência/vulnerabilidade grave registrada: aplicar fluxo ético, proteção e notificação quando cabível.');
  if(/dispneia intensa|dor tor[aá]cica|satura[cç][aã]o baixa|altera[cç][aã]o neurol[oó]gica|confus[aã]o mental|meg/.test(txt))add('Sinal de urgência clínica registrado: avaliar prioridade alta/urgência e conduta imediata.');
  return a;
}
function renderAlertasVermelhosSoap(prefix){
  const ids=SOAP_IDS_MODULO[prefix],s=document.getElementById(ids?.s);if(!s)return[];
  const card=s.closest('.card')||s.closest('.tp'),ref=card?.querySelector('.soap-grid');if(!card||!ref)return[];
  let out=card.querySelector(`#soap-alertas-vermelhos-${prefix}`);if(!out){out=document.createElement('div');out.id=`soap-alertas-vermelhos-${prefix}`;ref.insertAdjacentElement('beforebegin',out)}
  const alertas=alertasVermelhosSoap(prefix);
  out.className='soap-pendencias';
  out.style.display=alertas.length?'block':'none';out.style.borderLeftColor='var(--rose)';
  out.innerHTML=alertas.length?`<h4>Alertas vermelhos antes do SOAP</h4><ul>${alertas.map(x=>`<li>${escTR(x)}</li>`).join('')}</ul>`:'';
  return alertas;
}
function renderInconsistenciasSoap(prefix){
  const ids=SOAP_IDS_MODULO[prefix],s=document.getElementById(ids?.s);if(!s)return[];
  const card=s.closest('.card')||s.closest('.tp'),ref=card?.querySelector(`#soap-pendencias-${prefix}`)||card?.querySelector('.soap-grid');if(!card||!ref)return[];
  let out=card.querySelector(`#soap-inconsistencias-${prefix}`);if(!out){out=document.createElement('div');out.id=`soap-inconsistencias-${prefix}`;ref.insertAdjacentElement('afterend',out)}
  const avisos=validarCoerenciaSoap(prefix);
  out.className=`soap-pendencias${avisos.length?'':' soap-pendencias-vazia'}`;
  out.style.borderLeftColor=avisos.length?'var(--rose)':'var(--green)';
  out.innerHTML=avisos.length?`<h4>Inconsistências para revisar</h4><ul>${avisos.map(x=>`<li>${escTR(x)}</li>`).join('')}</ul>`:'<h4>Coerência clínica</h4><div style="font-size:12px">Nenhuma contradição automática identificada.</div>';
  return avisos;
}
function modoSoapAtual(){return document.getElementById('quick-soap-mode')?.value||localStorage.getItem('esf_modo_soap')||'completo'}
function definirModoSoap(modo){localStorage.setItem('esf_modo_soap',modo);const s=document.getElementById('quick-soap-mode');if(s)s.value=modo}
function resumirSecaoSoap(texto,maxLinhas){const linhas=String(texto||'').split('\n'),cab=linhas.shift()||'',corpo=linhas.filter(x=>x.trim()&&!/^Base protocolar:/i.test(x)).slice(0,maxLinhas);return [cab,...corpo].join('\n').trim()}
function aplicarModoSoap(prefix){
  const ids=SOAP_IDS_MODULO[prefix],modo=modoSoapAtual();if(!ids)return;
  if(modo==='curto'){const limites={s:4,o:4,a:3,p:5};Object.entries(ids).forEach(([k,id])=>{const e=document.getElementById(id);if(e)e.value=resumirSecaoSoap(e.value,limites[k]||4)})}
  if(modo==='sae')gerarSAE(prefix,true,textoSoapAtual(false));
}
function linhasSoapValidas(texto){
  return String(texto||'').split('\n').map(x=>x.trim()).filter(Boolean);
}
function finalizarFraseSoap(texto){
  texto=String(texto||'').replace(/\s+/g,' ').trim();
  if(!texto)return '';
  return /[.!?;:]$/.test(texto)?texto:`${texto}.`;
}
function minusculaInicialSoap(texto){
  texto=String(texto||'').trim();
  return texto?texto.charAt(0).toLowerCase()+texto.slice(1):'';
}
function limparCabecalhosNarrativosSoap(linha){
  return String(linha||'')
    .replace(/^(?:DESCRICAO|DESCRIÇÃO)\s+DA\s+CONSULTA\s*/i,'')
    .replace(/^(?:S\s*(?::|[—-]\s*SUBJETIVO)|O\s*(?::|[—-]\s*OBJETIVO)|A\s*(?::|[—-]\s*(?:AVALIAÇÃO|AVALIACAO))|P\s*(?::|[—-]\s*PLANO(?:\s*\/\s*CONDUTA)?))\s*/i,'')
    .replace(/^(?:ANAMNESE GUIADA|DADOS OBJETIVOS|EXAME FISICO GUIADO|EXAME FÍSICO GUIADO|AVALIACAO|AVALIAÇÃO|PLANO\/ORIENTACOES|PLANO\/ORIENTAÇÕES|CONDUTA|CONDUTA REALIZADA|HISTÓRIA DA QUEIXA ATUAL|HISTORIA DA QUEIXA ATUAL|ANTECEDENTES RELEVANTES|ANAMNESE\s*\/\s*HISTÓRIA ATUAL|ANAMNESE\s*\/\s*HISTORIA ATUAL|QUEIXAS E SINAIS DE ALERTA|ANTECEDENTES,\s*MEDICAÇÕES,\s*ALERGIAS E HÁBITOS|ANTECEDENTES,\s*MEDICACOES,\s*ALERGIAS E HABITOS|REDE DE APOIO,\s*TERRITÓRIO E VULNERABILIDADE|REDE DE APOIO,\s*TERRITORIO E VULNERABILIDADE|SINAIS VITAIS E ANTROPOMETRIA|EXAME FÍSICO GERAL\/ESPECÍFICO|EXAME FISICO GERAL\/ESPECIFICO|EXAMES,\s*TESTES RÁPIDOS,\s*LAUDOS E VACINAS|EXAMES,\s*TESTES RAPIDOS,\s*LAUDOS E VACINAS|ESCALAS OU INSTRUMENTOS APLICADOS|SÍNTESE\/AVALIAÇÃO CLÍNICA|SINTESE\/AVALIACAO CLINICA|SÍNTESE CLÍNICA|SINTESE CLINICA|ESTRATIFICAÇÃO DE RISCO E CRITÉRIOS|ESTRATIFICACAO DE RISCO E CRITERIOS|ACHADOS ALTERADOS\s*\/\s*PONTOS DE ATENÇÃO|ACHADOS ALTERADOS\s*\/\s*PONTOS DE ATENCAO|PENDÊNCIAS CLÍNICAS PARA REVISÃO|PENDENCIAS CLINICAS PARA REVISAO|CONDUTAS REALIZADAS\s*\/\s*PLANEJADAS|EXAMES,\s*TESTES E VACINAS|TRATAMENTOS OU MEDICAÇÕES CONFORME PROTOCOLO|TRATAMENTOS OU MEDICACOES CONFORME PROTOCOLO|ENCAMINHAMENTOS E CUIDADO COMPARTILHADO|ORIENTAÇÕES,\s*RETORNO E SINAIS DE ALERTA|ORIENTACOES,\s*RETORNO E SINAIS DE ALERTA):\s*/i,'')
    .replace(/^(?:Queixa adicional|História\/contexto|Historia\/contexto|Achado adicional ao exame|Avaliação do profissional|Avaliacao do profissional|Conduta pactuada):\s*/i,'')
    .trim();
}
function normalizarPontuacaoSoap(texto){
  return String(texto||'')
    .replace(/([a-záéíóúâêôãõç])\.(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g,'$1. ')
    .replace(/\s+([,.;:])/g,'$1')
    .replace(/([;:])([^\s\n])/g,'$1 $2')
    .replace(/\.([A-Za-zÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç])/g,'. $1')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function deduplicarFrasesSoap(texto){
  const partes=normalizarPontuacaoSoap(texto).split(/(?<=[.!?])\s+/),vistas=new Set(),saida=[];
  partes.forEach(p=>{const k=p.toLowerCase().replace(/\s+/g,' ').trim();if(k&&!vistas.has(k)){vistas.add(k);saida.push(p)}});
  return saida.join(' ');
}
function unirNarrativaSoap(linhas){
  return deduplicarFrasesSoap(linhas.map(limparCabecalhosNarrativosSoap).filter(Boolean).map(finalizarFraseSoap).join(' '));
}
function humanizarSubjetivoSoap(prefix,descricao,subj){
  const linhas=linhasSoapValidas(subj).filter(l=>l!==descricao).map(limparCabecalhosNarrativosSoap).filter(Boolean);
  if(!linhas.length)return '';
  const principais=[],detalhes=[];
  linhas.forEach(l=>{
    if(/^Queixas selecionadas:/i.test(l))detalhes.push(l.replace(/^Queixas selecionadas:\s*/i,'Na anamnese dirigida, foram assinalados: '));
    else if(/^Antecedentes obstétricos registrados:/i.test(l))detalhes.push(l);
    else if(/^Antecedentes\/comorbidades registrados:/i.test(l))detalhes.push(l.replace(/^Antecedentes\/comorbidades registrados:/i,'Como antecedentes/comorbidades, constam:'));
    else if(/^Responsável refere/i.test(l))principais.push(l);
    else if(/^Comparece referindo/i.test(l))principais.push(`Comparece à unidade referindo ${minusculaInicialSoap(l.replace(/^Comparece referindo\s*/i,''))}`);
    else principais.push(l);
  });
  return [unirNarrativaSoap(principais),unirNarrativaSoap(detalhes)].filter(Boolean).join('\n');
}
function humanizarObjetivoSoap(prefix,obj){
  const linhas=linhasSoapValidas(obj).map(limparCabecalhosNarrativosSoap).filter(Boolean);
  if(!linhas.length)return '';
  const saida=[];
  linhas.forEach(l=>{
    if(/^(?:TESTES RÁPIDOS|TESTES RAPIDOS) REALIZADOS:/i.test(l)){
      saida.push('Testes rápidos realizados:');
      l.replace(/^(?:TESTES RÁPIDOS|TESTES RAPIDOS) REALIZADOS:\s*/i,'').split(/\s*;\s*/).filter(Boolean).forEach(x=>saida.push(finalizarFraseSoap(x)));
      return;
    }
    if(/^Testes rápidos realizados:/i.test(l)){
      saida.push('Testes rápidos realizados:');
      l.replace(/^Testes rápidos realizados:\s*/i,'').split(/\s*;\s*/).filter(Boolean).forEach(x=>saida.push(finalizarFraseSoap(x)));
      return;
    }
    if(/^Dados obstétricos:/i.test(l)){
      l.replace(/^Dados obstétricos:\s*/i,'').split(/\s*;\s*/).filter(Boolean).forEach(x=>saida.push(finalizarFraseSoap(x)));
      return;
    }
    if(/^(?:PA|FC|FR|Temperatura|Peso|IMC|Altura uterina|BCF|Edema)\b/i.test(l)&&l.includes(',')){
      l.split(/,\s+(?=(?:PA|FC|FR|Temperatura|Peso|IMC|Altura uterina|BCF|Edema)\b)/i).filter(Boolean).forEach(x=>saida.push(finalizarFraseSoap(x)));
      return;
    }
    if(/^Exame físico registrado:/i.test(l)){
      l.replace(/^Exame físico registrado:\s*/i,'').split(/\s*;\s*/).filter(Boolean).forEach(x=>saida.push(finalizarFraseSoap(x)));
      return;
    }
    if(/^Durante o atendimento, foram registrados\s+/i.test(l)){
      l=l.replace(/^Durante o atendimento, foram registrados\s+/i,'');
    }
    if(/^Exame físico geral\/específico:/i.test(l))l=l.replace(/^Exame físico geral\/específico:\s*/i,'');
    saida.push(finalizarFraseSoap(l));
  });
  return [...new Set(saida.filter(Boolean))].join('\n');
}
function humanizarAvaliacaoSoap(prefix,ava){
  const linhas=linhasSoapValidas(ava).map(limparCabecalhosNarrativosSoap).filter(Boolean);
  if(!linhas.length)return '';
  const texto=unirNarrativaSoap(linhas);
  if(/^(Gestação|Pré-natal|Pre-natal|Puericultura|Avaliação|Consulta|Estratificação|Rastreamento|Atendimento)/i.test(texto))return texto;
  return `Avaliação de enfermagem: ${minusculaInicialSoap(texto)}`;
}
function humanizarPlanoSoap(prefix,plano){
  const linhas=linhasSoapValidas(plano)
    .map(limparCabecalhosNarrativosSoap)
    .map(l=>l.replace(/Prevenção de pré-eclâmpsia:\s*há\s+1\s+fator[^.]*\./gi,'').replace(/Prevenção de pré-eclâmpsia:\s*há\s+1\s+fator[^A-ZÁÉÍÓÚÂÊÔÃÕÇ]*/gi,''))
    .map(l=>l.trim()).filter(Boolean);
  if(!linhas.length)return '';
  const blocos=[],corrente=[];
  linhas.forEach(l=>{
    if(/^(CONDUTAS LABORATORIAIS|CONDUTAS PROTOCOLARES|Base protocolar:|Fonte verificada:)/i.test(l)){
      if(corrente.length){blocos.push(unirNarrativaSoap(corrente));corrente.length=0}
      blocos.push(l);
    }else corrente.push(l);
  });
  if(corrente.length)blocos.unshift(unirNarrativaSoap(corrente));
  if(blocos[0]&&/^cuidado compartilhado/i.test(blocos[0]))blocos[0]=`Indicado ${minusculaInicialSoap(blocos[0])}`;
  else if(blocos[0]&&!/^(Mantid|Realizad|Orientad|Solicitad|Pactuad|Programad|Encaminhad|Avaliar|Retorno|Conduta|Indicado)/i.test(blocos[0]))blocos[0]=`Plano proposto para revisão profissional: ${blocos[0]}`;
  return blocos.filter(Boolean).join('\n');
}
function linhasNaoVazias(texto){return String(texto||'').split('\n').map(x=>x.trim()).filter(Boolean)}
function dividirLinhasPorRegex(linhas,rx){const sim=[],nao=[];linhas.forEach(l=>(rx.test(l)?sim:nao).push(l));return{sim,nao}}
function blocoCategoriaSoap(titulo,linhas){linhas=Array.isArray(linhas)?linhasNaoVazias(linhas.join('\n')):linhasNaoVazias(linhas);return linhas.length?`${titulo}:\n${linhas.join('\n')}`:''}
function resumoSinanIntegrado(prefix){
  const texto=normalizarTextoProtocolo([textoCamposPagina(prefix),soapTextoModulo(prefix)].join(' ')),agravos=[];
  const add=x=>{if(!agravos.includes(x))agravos.push(x)};
  if(/sifilis|vdrl/.test(texto)&&/reagente|positivo|diagnostico confirmado/.test(texto))add('sífilis');
  if(/\bhiv\b/.test(texto)&&/reagente|positivo|diagnostico confirmado/.test(texto))add('HIV');
  if(/hepatite b|hbsag/.test(texto)&&/reagente|positivo/.test(texto))add('hepatite B');
  if(/hepatite c|anti.?hcv/.test(texto)&&/reagente|positivo/.test(texto))add('hepatite C');
  if(/violencia sexual|violencia interpessoal|exposicao sexual/.test(texto))add('violência/exposição sexual');
  if(/dengue|chikungunya|zika|tuberculose|hanseniase|meningite|leptospirose|raiva|acidente.*animal peconhento/.test(texto))add('agravo de notificação informado');
  if(!agravos.length)return'';
  return`Notificação/SINAN: verificar preenchimento/notificação para ${agravos.join(', ')} conforme ficha e fluxo municipal, antes de encerrar o atendimento.`;
}
function extrairDescricaoSoapAtual(texto,descricao=''){
  let desc=limparTextoSoap(descricao);
  const raw=String(texto||'').replace(/\r/g,'');
  if(desc)return desc;
  const m=raw.match(/DESCRI(?:Ç|C)(?:Ã|A)O\s+DA\s+CONSULTA\s*([\s\S]*?)(?:\n\s*S\s*(?:[—-]\s*SUBJETIVO)?\s*:|\n\s*S\s*[—-])/i);
  if(m){
    desc=linhasNaoVazias(m[1]).find(Boolean)||'';
  }
  return limparTextoSoap(desc)||'Consulta de enfermagem realizada na APS/ESF.';
}
function extrairCorpoSecaoSoapAtual(texto,letra){
  let raw=String(texto||'').replace(/\r/g,'').trim();
  if(!raw)return '';
  if(letra==='S'){
    raw=raw.replace(/^[\s\S]*?DESCRI(?:Ç|C)(?:Ã|A)O\s+DA\s+CONSULTA[\s\S]*?(?=\n\s*S\s*(?:[—-]\s*SUBJETIVO)?\s*:|\n\s*S\s*[—-])/i,'');
  }
  raw=raw
    .replace(new RegExp(`^\\s*${letra}\\s*(?::|[—-]\\s*(?:SUBJETIVO|OBJETIVO|AVALIAÇÃO|AVALIACAO|PLANO(?:\\s*\\/\\s*CONDUTA)?))\\s*`,'i'),'')
    .replace(/^\s*(?:S\s*(?::|[—-]\s*SUBJETIVO)|O\s*(?::|[—-]\s*OBJETIVO)|A\s*(?::|[—-]\s*(?:AVALIAÇÃO|AVALIACAO))|P\s*(?::|[—-]\s*PLANO(?:\s*\/\s*CONDUTA)?))\s*/gm,'');
  return raw.trim();
}
function limparValorClinicoParaSoap(valor,tipo='geral',nomePaciente=''){
  const v=String(valor||'').trim();
  if(!v)return '';
  const suspeito=/dado fict[ií]cio|paciente teste|ana teste|teste-\d+|placeholder|nome,\s*dose|exemplo|undefined|null/i;
  if(suspeito.test(v))return '';
  if(tipo==='vacina'&&/\b(?:AC|AP|ABD)\s*:|BRNF|MV\+|ausculta|eupneic|hidratad/i.test(v))return '';
  if(tipo==='medicamento'){
    const nome=sinanNormalizar(nomePaciente||val('pna-nome')||'');
    const vv=sinanNormalizar(v);
    if(nome&&vv&&nome.includes(vv)&&vv.length>8)return '';
    if(/\b(?:rua|avenida|bairro|telefone|cpf|cns)\b/i.test(v))return '';
  }
  return v;
}
function formatarLinhasSemiNarrativasSoap(texto){
  const saida=[],vistos=new Set(),abrevs=/\b(?:PA|FC|FR|SpO2|SatO2|IMC|IG|DPP|DUM|AU|BCF|CNS|CPF|TR1|TR2|HIV|HBsAg|HCV|VDRL|IVCF-20|ERSM)\b/i;
  const add=l=>{l=normalizarPontuacaoSoap(l).replace(/\s+\./g,'.').trim();if(!l)return;const k=l.toLowerCase().replace(/\s+/g,' ');if(!vistos.has(k)){vistos.add(k);saida.push(l)}};
  String(texto||'').replace(/\r/g,'').split('\n').forEach(raw=>{
    let linha=limparCabecalhosNarrativosSoap(raw).trim();
    if(!linha)return;
    if(/^(Anamnese|Queixas|Antecedentes|Rede de apoio|Sinais vitais|Exame físico|Exames|Testes|Vacinas|Escalas|Síntese|Estratificação|Achados|Pendências|Condutas|Tratamentos|Encaminhamentos|Orientações)\s*:?\s*$/i.test(linha)&&!linha.endsWith(':'))linha+=':';
    if(linha.endsWith(':')){add(linha);return}
    if(/^(PA|FC|FR|SpO2|SatO2|Temperatura|Peso|Altura|IMC|AU|BCF|DUM|DPP|IG|HIV|Sífilis|Sifilis|HBsAg|HCV|VDRL|dT|dTpa|Influenza|Covid|Hepatite B|VSR)\s*:/i.test(linha)){add(linha);return}
    const partes=linha.length>120?linha.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/):[linha];
    partes.forEach(p=>add(finalizarFraseSoap(p)));
  });
  const final=[];
  saida.forEach((l,i)=>{
    if(l.endsWith(':')&&i>0&&final[final.length-1]!=='')final.push('');
    final.push(l);
  });
  return final.join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
function secaoSoapSemiNarrativa(letra,texto){
  const corpo=formatarLinhasSemiNarrativasSoap(texto);
  return `${letra}:${corpo?`\n${corpo}`:''}`.trim();
}
function pularFinalizadorSoapAutomatico(prefix,ms=1400){
  window._pularFinalizadorSoapAutomatico={prefix,ate:Date.now()+ms};
}
function devePularFinalizadorSoapAutomatico(prefix){
  const cfg=window._pularFinalizadorSoapAutomatico;
  if(!cfg||cfg.prefix!==prefix||Date.now()>cfg.ate)return false;
  return true;
}
function finalizarSoapModulo(prefix,descricao=''){
  const ids=SOAP_IDS_MODULO[prefix];if(!ids)return;
  const s=document.getElementById(ids.s),o=document.getElementById(ids.o),a=document.getElementById(ids.a),p=document.getElementById(ids.p);if(!s||!o||!a||!p)return;
  const desc=extrairDescricaoSoapAtual(s.value,descricao);
  let subj=limparTextoSoap(extrairCorpoSecaoSoapAtual(s.value,'S')).replace(/^DESCRI(?:Ç|C)(?:Ã|A)O DA CONSULTA\s*/i,'').trim(),obj=limparTextoSoap(extrairCorpoSecaoSoapAtual(o.value,'O')),ava=limparTextoSoap(extrairCorpoSecaoSoapAtual(a.value,'A')),plano=limparTextoSoap(extrairCorpoSecaoSoapAtual(p.value,'P'));
  const exames=resumoExamesSoapEstruturado(prefix);
  obj=substituirBlocoFinalSoap(obj,'EXAMES LABORATORIAIS — RESUMO:',exames.objetivo);
  ava=substituirBlocoFinalSoap(ava,'AVALIAÇÃO LABORATORIAL:',exames.avaliacao);
  plano=substituirBlocoFinalSoap(plano,'CONDUTAS LABORATORIAIS:',exames.plano);
  if(subj.startsWith(desc))subj=subj.slice(desc.length).trim();
  subj=humanizarSubjetivoSoap(prefix,desc,subj);obj=humanizarObjetivoSoap(prefix,obj);ava=humanizarAvaliacaoSoap(prefix,ava);plano=humanizarPlanoSoap(prefix,plano);
  const manual=manualSoapPartes(prefix),junta=(base,extra)=>[base,extra].filter(Boolean).join('\n');
  subj=junta(subj,manual.s);obj=junta(obj,manual.o);ava=junta(ava,manual.a);plano=junta(junta(plano,manual.p),resumoSinanIntegrado(prefix));
  const base=modoSoapAtual()==='curto'?'':SOAP_BASE_PROTOCOLAR[prefix];
  plano=[plano,base?`Base protocolar: ${base}`:''].filter(Boolean).join('\n');
  s.value=`DESCRIÇÃO DA CONSULTA\n${formatarLinhasSemiNarrativasSoap(desc)}\n\n${secaoSoapSemiNarrativa('S',subj)}`;
  o.value=secaoSoapSemiNarrativa('O',obj);
  a.value=secaoSoapSemiNarrativa('A',ava);
  p.value=secaoSoapSemiNarrativa('P',plano);
  aplicarModoSoap(prefix);renderAlertasVermelhosSoap(prefix);renderPendenciasSoap(prefix);renderInconsistenciasSoap(prefix);atualizarIndicadorPreenchimento();
}
function montarSoapClinico(cfg) {
  const nome = cfg.nome || '';
  const idade = cfg.idade ? `, ${cfg.idade}` : '';
  const guia = coletarGuiaClinico(cfg.modulo);
  const descricao=cfg.descricao||[nome?`${nome}${idade}`:'', 'comparece à unidade para consulta de enfermagem'].filter(Boolean).join(' ');
  const alvos=cfg?.ids&&Object.fromEntries(Object.entries(cfg.ids).map(([k,id])=>[k,document.getElementById(id)]));
  if(!alvos?.s||!alvos?.o||!alvos?.a||!alvos?.p)return false;
  alvos.s.value = [
    descricao ? `DESCRICAO DA CONSULTA\n${descricao.replace(/\s+/g,' ').trim()}` : '',
    cfg.hma ? `História da queixa atual:\n${cfg.hma}` : '',
    guia.anamnese ? `ANAMNESE GUIADA:\n${guia.anamnese}` : '',
    cfg.hp ? `Antecedentes relevantes:\n${cfg.hp}` : ''
  ].filter(Boolean).join('\n\n');
  alvos.o.value = [
    cfg.exame || '',
    guia.exame ? 'EXAME FISICO GUIADO:\n' + guia.exame : '',
    cfg.objetivo ? 'DADOS OBJETIVOS:\n' + cfg.objetivo : ''
  ].filter(Boolean).join('\n');
  alvos.a.value = [
    cfg.hd ? `Síntese/Avaliação clínica:\n${cfg.hd}` : '',
    cfg.avaliacao ? 'AVALIACAO:\n' + cfg.avaliacao : '',
    guia.alertas ? 'ACHADOS QUE REQUEREM AVALIACAO:\n' + guia.alertas : ''
  ].filter(Boolean).join('\n');
  const vacinaSoap=resumoVacinalSoap(cfg.modulo);
  alvos.p.value = [
    cfg.cd ? `Conduta realizada:\n${formatarCondutaSoap(cfg.cd)}` : '',
    cfg.plano ? 'PLANO/ORIENTACOES:\n' + cfg.plano : '',
    guia.condutas ? 'CONDUTAS DOS ACHADOS SELECIONADOS:\n' + resumoLinhasOperacionais(guia.condutas,4) : '',
    vacinaSoap ? 'AVALIACAO VACINAL PNI:\n' + resumoLinhasOperacionais(vacinaSoap,5) : ''
  ].filter(Boolean).join('\n');
  finalizarSoapModulo(cfg.modulo,descricao);
  return true;
}
function mudarParaAbaSoap(tabSelector, tabId) {
  const soapTab = document.querySelector(tabSelector);
  if (soapTab) tab(soapTab, tabId);
}
function pnaIgSemanas(){
  const m=String(val('pna-ig')||'').match(/(\d+)/);
  return m?parseInt(m[1],10):0;
}
function pnaTextoSe(label,id,sufixo=''){
  const v=val(id);
  return v?`${label} ${v}${sufixo}`:'';
}
function pnaValorSelect(label,id){
  const v=val(id);
  return v?`${label}: ${v}`:'';
}
function pnaResumoObstetrico(){
  const partes=[];
  if(campoTemValor('pna-g','pna-p','pna-a'))partes.push(`G${val('pna-g','0')} P${val('pna-p','0')} A${val('pna-a','0')}`);
  if(val('pna-ces'))partes.push(`${val('pna-ces')} cesárea(s) anterior(es)`);
  if(val('pna-fv'))partes.push(`${val('pna-fv')} filho(s) vivo(s)`);
  const iip=limparValorClinicoParaSoap(val('pna-iip'),'geral',val('pna-nome'));
  if(iip)partes.push(`intervalo interpartal ${iip}`);
  return partes.length?`Antecedentes obstétricos registrados: ${partes.join('; ')}.`:'';
}
function pnaResumoImc(){
  const raw=val('pna-imc');
  if(!raw)return '';
  const numero=(raw.match(/[\d.,]+/)||[])[0]||raw;
  const classe=(raw.split('—')[1]||'').trim();
  if(classe)return `IMC ${numero.replace('.',',')} kg/m², classificada como ${classe.toLowerCase().replace('eutrófico','eutrófica').replace('eutrofico','eutrófica')}`;
  return /^[\d.,]+$/.test(raw)?`IMC ${numero.replace('.',',')} kg/m²`:`IMC ${raw}`;
}
function pnaResumoSubjetivoBase(queixas){
  const texto=String(queixas||'').trim();
  if(!texto)return 'Gestante comparece à unidade para abertura de pré-natal.';
  if(/nega queixas|sem queixas/i.test(texto))return 'Gestante comparece à unidade para abertura de pré-natal, sem queixas no momento.';
  return `Gestante comparece à unidade para abertura de pré-natal, referindo ${minusculaInicialSoap(texto)}.`;
}
function pnaResumoRiscoSoap(risco,testesRapidos){
  const criterios=risco.criterios||[],critAltos=criterios.filter(x=>x.nivel!=='habitual').map(x=>x.motivo),critHabitual=criterios.filter(x=>x.nivel==='habitual').map(x=>x.motivo);
  const elementos=[];
  if(val('pna-pa'))elementos.push(`PA ${val('pna-pa')} mmHg`);
  if(campoTemValor('pna-g','pna-p','pna-a'))elementos.push(`antecedente obstétrico G${val('pna-g','0')} P${val('pna-p','0')} A${val('pna-a','0')}`);
  if(testesRapidos.realizados?.length)elementos.push('testes rápidos registrados');
  if(val('pna-queixas')&&/nega|sem queixa/i.test(val('pna-queixas')))elementos.push('ausência de queixas no momento');
  if(/habitual/i.test(risco.label||'')){
    return [`Risco habitual até o momento, considerando os dados preenchidos e ausência de critérios intermediários ou de alto risco marcados no formulário.`,elementos.length?`Elementos avaliados: ${elementos.join('; ')}.`:'',critHabitual.length?`Pontos de atenção para seguimento: ${critHabitual.join('; ')}.`:'',`Reavaliar estratificação a cada consulta e após exames laboratoriais, ultrassonografia e atualização da anamnese.`].filter(Boolean).join(' ');
  }
  return [`${risco.label||'Risco gestacional'} conforme critérios preenchidos no formulário.`,critAltos.length?`Critérios identificados: ${critAltos.join('; ')}.`:'',critHabitual.length?`Outros pontos de atenção: ${critHabitual.join('; ')}.`:'',`Manter reavaliação do risco a cada atendimento e após novos exames.`].filter(Boolean).join(' ');
}
function pnaPlanoExamesSoap(igSem){
  const itens=['Solicitar ou checar exames de rotina da abertura do pré-natal: hemograma, tipagem sanguínea e fator Rh, Coombs indireto quando Rh negativo, glicemia de jejum, urina tipo I, urocultura, toxoplasmose IgM/IgG e sorologias/testes rápidos conforme protocolo municipal.','Avaliar necessidade de citopatológico conforme idade, histórico e periodicidade do rastreamento.'];
  if(igSem>=20&&igSem<=24)itens.push('Solicitar ou checar ultrassonografia morfológica, preferencialmente entre 20 e 24 semanas.');
  if(igSem>=20&&igSem<24)itens.push('Programar TOTG para o período de 24 a 28 semanas.');
  else if(igSem>=24&&igSem<=28)itens.push('Realizar ou checar TOTG entre 24 e 28 semanas.');
  else if(igSem>28)itens.push('Verificar se TOTG foi realizado no período indicado e avaliar conduta conforme protocolo local se estiver pendente.');
  return itens.join(' ');
}
function pnaPlanoVacinalSoap(igSem){
  const itens=[];
  if(igSem>=20)itens.push('Verificar dTpa nesta gestação; se ainda não realizada, encaminhar/orientar sala de vacina conforme calendário e protocolo local.');
  else itens.push('Orientar dTpa no período indicado da gestação, com programação conforme calendário vigente.');
  itens.push('Conferir hepatite B e completar doses faltantes quando esquema incompleto ou sem comprovação.');
  itens.push('Avaliar influenza, COVID-19 e demais vacinas conforme calendário vigente e disponibilidade da rede.');
  if(igSem>=28)itens.push('Avaliar vacina VSR materna a partir de 28 semanas conforme calendário vigente e disponibilidade.');
  else itens.push('Programar avaliação da VSR materna a partir de 28 semanas, conforme calendário vigente e disponibilidade.');
  return itens.join(' ');
}
function gerarSoapAutomatoPna() {
  const nome = val('pna-nome');
  const idade = val('pna-idade');
  const queixas = val('pna-queixas');
  const medSeguro=limparValorClinicoParaSoap(val('pna-med'),'medicamento',nome),alergiaSegura=limparValorClinicoParaSoap(val('pna-alergia'),'geral',nome),prevSeguro=limparValorClinicoParaSoap(val('pna-prev'),'geral',nome),vacRefSegura=limparValorClinicoParaSoap(val('pna-vac-ref'),'vacina',nome);
  const igSem=pnaIgSemanas();
  const condutasQueixas=checkPnaQueixas();
  const comorb = checkedText('#pna-comorbidades-list input');
  const familiares=checkedText('#pna-familiares-list input');
  const risco=avaliarProtocolosPna();
  const testesRapidos=resumoTestesRapidosPna();
  avaliarMovimentosFetaisPna();avaliarVacinacaoPna();
  const condutaMf=document.getElementById('pna-mf-conduta')?.innerText.trim()||'',condutaVac=document.getElementById('pna-vac-conduta')?.innerText.trim()||'';
  const medidas=[pnaTextoSe('PA','pna-pa',' mmHg'),pnaTextoSe('FC','pna-fc',' bpm'),pnaTextoSe('Temperatura','pna-temp',' °C'),pnaTextoSe('Peso','pna-peso',' kg'),pnaResumoImc(),pnaTextoSe('Altura uterina','pna-au',' cm'),pnaTextoSe('BCF','pna-bcf',' bpm'),pnaValorSelect('Edema','pna-edema')].filter(Boolean).join(', ');
  const obst=[val('pna-dum')?`DUM em ${formatarDataBR(val('pna-dum'))}`:'',val('pna-dum-conf')?`DUM confiável: ${minusculaInicialSoap(val('pna-dum-conf'))}`:'',val('pna-ig')?`idade gestacional estimada em ${val('pna-ig')}`:'',val('pna-dpp')?`DPP em ${val('pna-dpp')}`:'',val('pna-mf')?`movimentos fetais: ${minusculaInicialSoap(val('pna-mf'))}`:'',val('pna-apres')?`apresentação fetal: ${minusculaInicialSoap(val('pna-apres'))}`:''].filter(Boolean).join('; ');
  const exameFisico=[pnaValorSelect('Estado geral','pna-eg'),pnaValorSelect('Mucosas','pna-muc')].filter(Boolean).join('; ');
  const subjetivo=[pnaResumoSubjetivoBase(queixas),'Gestação em acompanhamento inicial na APS.',idade?`Idade materna registrada: ${idade}.`:'',val('pna-planejada')?`Gestação planejada: ${minusculaInicialSoap(val('pna-planejada'))}.`:'',pnaResumoObstetrico(),val('pna-acomp')?`Parceiro/acompanhante na consulta: ${minusculaInicialSoap(val('pna-acomp'))}.`:''].filter(Boolean).join(' ');
  const antecedentes=[comorb?`Antecedentes pessoais/comorbidades registrados: ${comorb}.`:'',medSeguro?`Medicamentos em uso: ${medSeguro}.`:'',alergiaSegura?`Alergias medicamentosas: ${alergiaSegura}.`:'',familiares?`Antecedentes familiares relevantes: ${familiares}.`:'',val('pna-tab')?`Tabagismo: ${val('pna-tab')}.`:'',val('pna-alc')?`Álcool/drogas: ${val('pna-alc')}.`:'',val('pna-viol')?`Violência doméstica: ${val('pna-viol')}.`:'',prevSeguro?`Último preventivo/citopatológico: ${prevSeguro}.`:'',vacRefSegura?`Situação vacinal referida: ${vacRefSegura}.`:''].filter(Boolean).join(' ');
  const obesidade=Number(String(val('pna-imc')).replace(',','.'))>=30,peAlto=['has','peprev','nefro','dm','geme'].some(k=>document.querySelector(`#pna-comorbidades-list input[data-comorb="${k}"]`)?.checked);
  const atencaoObesidade=obesidade&&!peAlto?'Obesidade identificada como ponto de atenção para acompanhamento e reestratificação.':'';
  const condutaRisco=risco.conduta||'';
  const planoRotina=['Mantido acompanhamento pré-natal na APS, com reestratificação de risco em todos os atendimentos.',pnaPlanoExamesSoap(igSem),pnaPlanoVacinalSoap(igSem),'Orientada quanto à suplementação conforme rotina/protocolo, alimentação, sinais de alerta obstétrico, prevenção de IST, aleitamento materno, participação em atividades educativas/grupo de gestantes e importância do retorno programado.',val('pna-maternidade')?`Maternidade de referência/vinculação registrada: ${val('pna-maternidade')}.`:'Orientar vinculação à maternidade de referência conforme rede municipal.',val('pna-odonto')?`Odontologia: ${val('pna-odonto')}.`:'Orientar avaliação odontológica no pré-natal.',val('pna-pnparc')?`Pré-natal do parceiro: ${val('pna-pnparc')}.`:'Envolver parceiro no pré-natal quando possível.',val('pna-retorno')?`Retorno programado: ${val('pna-retorno')}.`:'Definir retorno programado conforme idade gestacional, risco e rotina da unidade.'].filter(Boolean).join(' ');
  montarSoapClinico({
    nome, idade, modulo:'pna',
    ids:{s:'pna-s', o:'pna-o', a:'pna-a-soap', p:'pna-soap-p'},
    descricao:`Abertura de pré-natal${nome?` de ${nome}`:''}.`,
    hma:subjetivo,
    hp:antecedentes,
    exame:[medidas,obst?`Dados obstétricos: ${obst}.`:'',exameFisico?`Exame físico registrado: ${exameFisico}.`:'',testesRapidos.texto?`Testes rápidos realizados: ${testesRapidos.texto}.`:'' ].filter(Boolean).join('\n'),
    hd:[`Gestação em acompanhamento pré-natal na APS.`,pnaResumoRiscoSoap(risco,testesRapidos),atencaoObesidade].filter(Boolean).join(' '),
    cd:[condutaRisco,peAlto?'Avaliar prevenção de pré-eclâmpsia conforme critérios clínicos, protocolo municipal e prescrição médica, quando indicada.':'',planoRotina,testesRapidos.conduta,condutasQueixas?`Condutas das queixas conforme protocolo municipal:\n${condutasQueixas}`:'',condutaMf,condutaVac].filter(Boolean).join('\n')
  });
  mudarParaAbaSoap('[onclick*="pna-6"]','pna-6');
  showToast('SOAP PNA preenchido!');
}
function gerarSoapAutomatoPnc() {
  const nome = val('pnc-nome');
  const idade = val('pnc-idade');
  const queixas = val('pnc-queixas');
  checkPncQueixas(); checkPncVitais();
  const queixasMarcadas=Array.from(document.querySelectorAll('#pnc-queixas-clin input:checked, #pnc-queixas-gin input:checked')).map(e=>e.closest('.cki')?.textContent.trim()).filter(Boolean);
  const perda=[val('pnc-perda-tipo'),val('pnc-perda-qtd'),val('pnc-perda-obs')].filter(Boolean).join(' | ');
  const alertas=[document.getElementById('pnc-queixas-alerts')?.innerText,document.getElementById('pnc-vitais-alerts')?.innerText].filter(Boolean).join('\n');
  const medidas=[['IG',val('pnc-ig'),''],['PA',val('pnc-pa'),'mmHg'],['BCF',val('pnc-bcf'),'bpm'],['AU',val('pnc-au'),'cm'],['Apresentação',val('pnc-apres'),'']].filter(x=>x[1]).map(([n,v,u])=>`${n} ${v}${u?' '+u:''}`).join(', ');
  montarSoapClinico({
    nome, idade, modulo:'pnc',
    ids:{s:'pnc-s', o:'pnc-o', a:'pnc-a-soap', p:'pnc-p'},
    descricao:`Consulta de retorno de pré-natal${nome?` de ${nome}`:''}.`,
    hma:[queixas?`Gestante refere ${queixas.charAt(0).toLowerCase()+queixas.slice(1)}.`:'',queixasMarcadas.length?`Queixas selecionadas: ${queixasMarcadas.join('; ')}.`:'',perda?`Perda vaginal caracterizada: ${perda}.`:''].filter(Boolean).join('\n'),
    hp:'',
    exame:medidas,
    hd:`Pre-natal em seguimento. Evolucao e risco reavaliados conforme dados clínicos e exames disponíveis.${alertas?`\nAchados protocolados: ${alertas}`:''}`,
    cd:`Mantidas orientacoes de rotina, sinais de alerta obstetrico, suplementacao/vacinacao conforme necessidade, avaliacao de exames e retorno agendado.${alertas?`\nCondutas indicadas pelo protocolo municipal:\n${alertas}`:''}`
  });
  mudarParaAbaSoap('[onclick*="pnc-6"]','pnc-6');
  showToast('SOAP PNC preenchido!');
}
function gerarSoapAutomatoPu() {
  const nome = val('pu-nome');
  const idade = val('pu-idade') || val('pu-idade-cron');
  const avaliacaoAutoP = document.getElementById('st-pu-peso')?.innerText || '-';
  const avaliacaoAutoA = document.getElementById('st-pu-alt')?.innerText || '-';
  const marcos = checkedText('.dnpm-marco');
  avaliarDNPMAutomatico();
  const dnpmClass=val('pu-dnpm-class'), dnpmObs=val('pu-dnpm-obs');
  const riscoPu=calcRisco();
  const idadeM=calcAgeDetail(val('pu-nasc'))?.totalM;
  const medidaLinear=Number.isFinite(idadeM)&&idadeM<24?'Comprimento':'Estatura';
  const dnpmAtraso=/prov[aá]vel atraso|poss[ií]vel atraso/i.test(dnpmClass);
  const medidas=[['Peso',val('pu-peso'),'kg'],[medidaLinear,val('pu-alt'),'cm'],['Perímetro cefálico',val('pu-pc'),'cm'],['Perímetro abdominal',val('pu-pa'),'cm'],['Perímetro torácico',val('pu-pt'),'cm'],['IMC',val('pu-imc'),'kg/m²']].filter(x=>x[1]).map(([n,v,u])=>`${n} ${v} ${u}`).join(', ');
  montarSoapClinico({
    nome, idade, modulo:'pu',
    ids:{s:'pu-s', o:'pu-o', a:'pu-a-soap', p:'pu-p'},
    descricao:`Consulta de puericultura. Crianca ${nome}${idade ? ', ' + idade : ''}.`,
    hma:[val('pu-alim')?`Responsável refere alimentação: ${val('pu-alim')}.`:'',val('pu-queixas')?`Queixas/intercorrências referidas: ${val('pu-queixas')}.`:''].filter(Boolean).join('\n'),
    hp:'',
    exame:[medidas,val('pu-peso')&&avaliacaoAutoP&&avaliacaoAutoP!=='-'?`Avaliação do peso: ${avaliacaoAutoP}.`:'',val('pu-alt')&&avaliacaoAutoA&&avaliacaoAutoA!=='-'?`Avaliação do ${medidaLinear.toLowerCase()}: ${avaliacaoAutoA}.`:''].filter(Boolean).join('\n'),
    hd:[`Puericultura com avaliação antropométrica e acompanhamento do desenvolvimento.`,dnpmClass?`DNPM: ${dnpmClass}.`:'',marcos?`Marcos presentes/observados: ${marcos}.`:'Marcos do desenvolvimento não registrados como avaliados; não inferir atraso apenas por ausência de marcação.',dnpmObs,`Estratificação CIB-PR: ${riscoPu.nivel}.`,riscoPu.criterios.length?`Critérios: ${riscoPu.criterios.join('; ')}.`:'Critérios de risco não identificados nos campos preenchidos.'].filter(Boolean).join(' '),
    cd:`Orientações propostas para revisão: vacinas conforme calendário, alimentação, sinais de alerta, prevenção de acidentes, higiene e estimulação do desenvolvimento. ${dnpmAtraso?(dnpmClass.includes('Provável')?'Encaminhar para avaliação neuropsicomotora especializada e manter seguimento na APS.':'Orientar estimulação direcionada e reavaliar em 30 dias, se o marco foi testado e realmente ausente.'):'Retorno conforme faixa etária e rotina da unidade.'}\nEstratificação de risco: ${riscoPu.conduta}\nAvaliar crescimento em curvas/escore-z e comparar com medidas anteriores quando disponíveis.`
  });
  mudarParaAbaSoap('[onclick*="pu-6"]','pu-6');
  showToast('SOAP Puericultura preenchido!');
}
function dominiosIVCFAlterados(){
  if(typeof IVCF_SECOES==='undefined')return[];
  const saida=[];
  IVCF_SECOES.forEach(([secao,itens])=>{
    const marcados=[];
    itens.forEach(item=>{
      const el=document.getElementById(item[0]);if(!el)return;
      const pts=Number(el.value||0);if(pts<=0)return;
      let escolha='';
      if(Array.isArray(item[2]))escolha=(item[2].find(x=>String(x[1])===String(el.value))||[])[0]||'alterado';
      else escolha='sim';
      marcados.push(`${item[1]} (${escolha}; ${pts} ponto${pts>1?'s':''})`);
    });
    if(marcados.length)saida.push(`${secao}: ${marcados.join('; ')}`);
  });
  return saida;
}
function resumoPolifarmaciaIdoso(){
  const meds=val('id-meds'),numCampo=Number(val('id-num-meds')||0),num=numCampo||contarMedicamentosTexto(meds),sel=val('id-polifarmacia');
  if(num>=5)return `Polifarmácia confirmada (${num} medicamento(s) registrados/referidos).`;
  if(/sim/i.test(sel))return `Polifarmácia referida, não confirmada pela lista atual (${num||'sem'} medicamento(s) informado(s)); revisar medicações, dose, horário, indicação e adesão.`;
  if(sel)return `Polifarmácia: ${sel}.`;
  return '';
}
function gerarSoapIdoso() {
  const nome = val('id-nome');
  const idade = val('id-idade');
  const gds = document.getElementById('id-humor-confirmado')?.checked?document.getElementById('gds-score')?.textContent||'':'Humor: instrumento não avaliado.';
  const ivcf = calcularIVCF20();
  const altoRisco = avaliarRiscoIdoso();
  const dominios=dominiosIVCFAlterados();
  const polifarmacia=resumoPolifarmaciaIdoso();
  const funcionalidade=[val('id-avd')?`AVD: ${val('id-avd')}.`:'',val('id-aivd')?`AIVD: ${val('id-aivd')}.`:''].filter(Boolean).join(' ');
  const violencia=val('id-violencia');
  const violenciaTxt=violencia?/suspe|confirm/i.test(violencia)?`Risco de violência/negligência registrado: ${violencia}. Necessita caracterização por relato ou sinal objetivo.`:`Violência/negligência: ${violencia}.`:'';
  montarSoapClinico({
    nome, idade, modulo:'id',
    ids:{s:'id-s', o:'id-o', a:'id-a-soap', p:'id-p'},
    descricao:`Atendimento ao idoso. ${nome}${idade ? ', ' + idade : ''}. Avaliacao multidimensional na APS.`,
    hma:'',
    hp:[val('id-cron')?`Condições prevalentes: ${val('id-cron')}.`:'',val('id-meds')?`Medicamentos em uso: ${val('id-meds')}.`:'',polifarmacia,val('id-vac')?`Vacinas: ${val('id-vac')}.`:'',val('id-cuidador')?`Cuidador: ${val('id-cuidador')}.`:'',val('id-rede-apoio')?`Rede de apoio: ${val('id-rede-apoio')}.`:''].filter(Boolean).join('\n'),
    exame:[['PA',val('id-pa')],['Controle PA',val('id-controle-pa')],['Glicemia',val('id-gli')],['Controle glicêmico',val('id-controle-glicemia')],['Peso',val('id-peso')],['Altura',val('id-alt')],['IMC',val('id-imc')],['AVD',val('id-avd')],['AIVD',val('id-aivd')],['Mobilidade',val('id-mob')],['Quedas',val('id-quedas')],['Risco de queda',val('id-risco-queda')],['MEEM',val('id-meem')],['Cognição',val('id-cognicao')],['Humor',val('id-humor')]].filter(x=>x[1]).map(x=>`${x[0]}: ${x[1]}`).concat(gds?[gds]:[]).join(' | '),
    hd:[ivcf.completo?`Avaliação multidimensional da pessoa idosa. IVCF-20: ${ivcf.total} pontos — ${ivcf.classe}.`:'IVCF-20 incompleto: não é possível concluir robustez/fragilidade pela avaliação não preenchida.',dominios.length?`Domínios alterados no IVCF-20: ${dominios.join(' | ')}.`:'Domínios não pontuados exigem confirmação de avaliação; não presumir normalidade.',val('id-fragilidade')?`Fragilidade clínica: ${val('id-fragilidade')}.`:'',funcionalidade,violenciaTxt,altoRisco?'Alerta: pessoa idosa com risco aumentado.':''].filter(Boolean).join(' '),
    cd:`Orientações propostas: medidas de prevenção de quedas, revisão medicamentosa completa, atualização vacinal, atividade física conforme tolerância e acompanhamento de condições crônicas. ${altoRisco?'Construir plano de cuidados individualizado, programar reavaliação precoce, avaliar visita domiciliar com ACS/equipe e cuidado multiprofissional conforme necessidades identificadas.':'Manter acompanhamento periódico e promoção do envelhecimento saudável.'} Registrar metas de PA/glicemia somente quando houver contexto clínico suficiente e histórico de medidas.`
  });
  mudarParaAbaSoap('[onclick*="id-6"]','id-6');
  showToast('SOAP Idoso preenchido!');
}

const PROTOCOLOS_OFICIAIS=ESFProtocolSources.sources.map(p=>({tema:p.title,documento:p.title,versao:'Cópia conferida em '+ESFProtocolSources.checkedAt,uso:p.reviewStatus,url:p.url,sha256:p.sha256}));
let PROTO = { unit:{nome:'',cidade:''}, diseases:[], exames:[], orientacoes:[], infoboxes:[] };
function loadProto(){ try{const s=localStorage.getItem('esf_proto'); if(s)PROTO=JSON.parse(s);}catch(e){} }
function protoEsc(v){return escTR(v);}
function renderProtoEditor(){
  const fontes=document.getElementById('protocol-sources-list');
  if(fontes)fontes.innerHTML=PROTOCOLOS_OFICIAIS.map(p=>`<div class="card" style="padding:12px 14px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><strong>${protoEsc(p.tema)}</strong><div style="font-size:12px;color:var(--tx2);margin-top:3px">${protoEsc(p.documento)} · ${protoEsc(p.versao)}</div><div style="font-size:12px;color:var(--tx3);margin-top:5px">Uso no sistema: ${protoEsc(p.uso)}</div></div>${p.url?`<a class="btn btn-s btn-sm" href="${p.url}" target="_blank" rel="noopener">Abrir fonte</a>`:''}</div></div>`).join('');
  const cobertura=document.getElementById('protocol-coverage-list');
  if(cobertura&&typeof CENTRAL_PROTOCOLAR_MODULOS!=='undefined')cobertura.innerHTML=`<div class="alert alert-i" style="margin-bottom:10px"><div><strong>Integração ampla ativa:</strong> cada consulta mantém seu motor especializado e também cruza queixas, achados, sinais vitais e exames com os demais protocolos clínicos municipais compatíveis. Condutas sem regra explícita não geram medicação ou encaminhamento automático.</div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px">${Object.values(CENTRAL_PROTOCOLAR_MODULOS).map(x=>`<div class="card" style="padding:11px 13px;margin:0"><strong>${protoEsc(x.nome)}</strong><div style="font-size:12px;color:var(--tx2);margin-top:5px">${protoEsc(x.especializado)}</div><div style="font-size:11px;color:var(--green);font-weight:700;margin-top:7px">Central Protocolar transversal ativa</div></div>`).join('')}</div>`;
  const configs=[['diseases','drug-diseases-container','Doença / condição'],['exames','exames-container','Grupo de exames'],['orientacoes','orientacoes-container','Grupo de orientações']];
  configs.forEach(([key,id,label])=>{const el=document.getElementById(id);if(!el)return;const list=Array.isArray(PROTO[key])?PROTO[key]:[];el.innerHTML=list.length?list.map((x,i)=>`<div class="card" style="padding:10px 12px"><div style="display:flex;gap:8px;align-items:center"><input value="${protoEsc(x.nome||x.titulo||'')}" placeholder="${label}" oninput="PROTO.${key}[${i}].nome=this.value;markUnsaved()" style="flex:1"><button class="btn btn-s btn-sm" onclick="PROTO.${key}.splice(${i},1);renderProtoEditor();markUnsaved()">Excluir</button></div></div>`).join(''):`<div class="alert alert-i">Nenhum item personalizado cadastrado.</div>`;});
  const nome=document.getElementById('unit-nome'),cidade=document.getElementById('unit-cidade');if(nome)nome.value=PROTO.unit?.nome||'';if(cidade)cidade.value=PROTO.unit?.cidade||'';
}
function addProtoItem(key){if(!Array.isArray(PROTO[key]))PROTO[key]=[];PROTO[key].push({nome:''});renderProtoEditor();markUnsaved();}
function addDisease(){addProtoItem('diseases');}
function addExameGroup(){addProtoItem('exames');}
function addOrientacaoGroup(){addProtoItem('orientacoes');}
function saveProto(){PROTO.unit={nome:document.getElementById('unit-nome')?.value||'',cidade:document.getElementById('unit-cidade')?.value||''};localStorage.setItem('esf_proto',JSON.stringify(PROTO)); document.getElementById('save-bar').classList.remove('show'); showToast('Salvo!'); }
function discardChanges(){ loadProto();renderProtoEditor(); document.getElementById('save-bar').classList.remove('show'); }
function markUnsaved(){ document.getElementById('save-bar').classList.add('show'); }
function showToast(msg){ let t=document.getElementById('toast'); if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;padding:9px 18px;border-radius:8px;font-size:13px;z-index:500;transition:opacity .3s';document.body.appendChild(t);} t.textContent=msg; t.style.opacity='1'; setTimeout(()=>t.style.opacity='0',2200); }
function edTab(b,id){ document.querySelectorAll('.ed-tab').forEach(t=>t.classList.remove('on')); document.querySelectorAll('.ed-sec').forEach(s=>s.classList.remove('on')); b.classList.add('on'); document.getElementById(id).classList.add('on'); }
const MCHAT_PERGUNTAS = [
  {n:1,  txt:'Se você apontar para algo no outro lado da sala, seu filho(a) olha para o local apontado?', risco:'nao'},
  {n:2,  txt:'Alguma vez você se perguntou se seu filho(a) pode ser surdo(a)?', risco:'sim'},
  {n:3,  txt:'Seu filho(a) brinca de faz-de-conta? (ex: faz de conta que bebe de um copo vazio, ou fala ao telefone de brinquedo)', risco:'nao'},
  {n:4,  txt:'Seu filho(a) gosta de subir em coisas? (ex: móveis, brinquedos do parquinho)', risco:'nao'},
  {n:5,  txt:'Seu filho(a) faz movimentos incomuns com os dedos perto dos olhos?', risco:'sim'},
  {n:6,  txt:'Seu filho(a) aponta com o dedo indicador para pedir algo ou para obter ajuda?', risco:'nao'},
  {n:7,  txt:'Seu filho(a) aponta com o dedo indicador para mostrar algo interessante?', risco:'nao'},
  {n:8,  txt:'Seu filho(a) se interessa por outras crianças?', risco:'nao'},
  {n:9,  txt:'Seu filho(a) mostra coisas a você — trazendo ou levantando — apenas para compartilhar o interesse?', risco:'nao'},
  {n:10, txt:'Seu filho(a) responde quando você chama pelo nome dele(a)?', risco:'nao'},
  {n:11, txt:'Quando você sorri para seu filho(a), ele(a) sorri de volta?', risco:'nao'},
  {n:12, txt:'Seu filho(a) fica perturbado com ruídos cotidianos? (ex: aspirador de pó, música alta)', risco:'sim'},
  {n:13, txt:'Seu filho(a) anda?', risco:'nao'},
  {n:14, txt:'Seu filho(a) olha nos seus olhos quando você fala com ele(a) ou brinca com ele(a)?', risco:'nao'},
  {n:15, txt:'Seu filho(a) tenta imitar o que você faz?', risco:'nao'},
  {n:16, txt:'Se você vira a cabeça para olhar para algo, seu filho(a) olha ao redor para ver o que você está olhando?', risco:'nao'},
  {n:17, txt:'Seu filho(a) tenta fazer você olhar para ele(a)?', risco:'nao'},
  {n:18, txt:'Seu filho(a) entende quando você lhe pede para fazer algo?', risco:'nao'},
  {n:19, txt:'Quando acontece algo novo, seu filho(a) olha para o seu rosto para ver como você reage?', risco:'nao'},
  {n:20, txt:'Seu filho(a) gosta de atividades que envolvem movimento? (ex: balanço, cavalinho de pau)', risco:'nao'},
];

function buildMCHAT() {
  const c = document.getElementById('mchat-perguntas'); if (!c || c.children.length > 0) return;
  MCHAT_PERGUNTAS.forEach(p => {
    c.innerHTML += `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border:1px solid var(--bd);border-radius:7px;font-size:13px">
      <span style="font-size:11px;font-weight:700;color:var(--tx3);min-width:20px;margin-top:1px">${p.n}.</span>
      <span style="flex:1;line-height:1.5">${p.txt}</span>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;font-weight:600">
          <input type="radio" name="mchat-${p.n}" value="sim" onchange="calcMCHAT()" style="accent-color:var(--green)"> Sim
        </label>
        <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;font-weight:600">
          <input type="radio" name="mchat-${p.n}" value="nao" onchange="calcMCHAT()" style="accent-color:var(--rose)"> Não
        </label>
      </div>
    </div>`;
  });
}

function calcMCHAT() {
  if(!MCHAT_PERGUNTAS.every(p=>document.querySelector(`input[name="mchat-${p.n}"]:checked`))){document.getElementById('mchat-resultado').textContent='M-CHAT incompleto: responda todos os itens antes de classificar.';return;}
  let score = 0;
  MCHAT_PERGUNTAS.forEach(p => {
    const sel = document.querySelector(`input[name="mchat-${p.n}"]:checked`);
    if (!sel) return;
    const resp = sel.value;
    if ((p.risco === 'nao' && resp === 'nao') || (p.risco === 'sim' && resp === 'sim')) score++;
  });
  const el = document.getElementById('mchat-resultado');
  let classe, label, cor;
  if (score <= 2)       { classe='st-ok';  label='Baixo Risco';   cor='var(--green)'; }
  else if (score <= 7)  { classe='st-att'; label='Risco Médio — aplicar M-CHAT-R/F seguimento'; cor='var(--amber)'; }
  else                  { classe='st-alt'; label='Risco Elevado — encaminhar imediatamente para avaliação diagnóstica'; cor='var(--rose)'; }
  el.style.color = cor;
  el.textContent = `Pontuação: ${score} / 20  |  ${label}`;
}

function calcRisco() {
  const altoManual = Array.from(document.querySelectorAll('.risco-alto:checked')).map(x=>x.closest('.cki')?.textContent.trim()).filter(Boolean);
  const interManual = Array.from(document.querySelectorAll('.risco-inter:checked')).map(x=>x.closest('.cki')?.textContent.trim()).filter(Boolean);
  const altoAuto=[], interAuto=[];
  const pesoNasc=parseFloat(document.getElementById('pu-pn')?.value), igNasc=parseFloat(document.getElementById('pu-ig')?.value);
  const apgarTxt=document.getElementById('pu-apgar')?.value||'', apgarPartes=apgarTxt.match(/\d+/g)||[], apgar5=parseInt(apgarPartes[1]||apgarPartes[0]||'');
  if(Number.isFinite(pesoNasc)){if(pesoNasc<2000||pesoNasc>=4000)altoAuto.push(`Peso ao nascer ${pesoNasc} g`);else if(pesoNasc<2500)interAuto.push(`Peso ao nascer ${pesoNasc} g`);}
  if(Number.isFinite(igNasc)){if(igNasc<=34)altoAuto.push(`Prematuridade: ${igNasc} semanas`);else if(igNasc<37)interAuto.push(`IG ao nascer: ${igNasc} semanas`);}
  if(Number.isFinite(apgar5)&&apgar5<7)altoAuto.push(`Apgar no 5º minuto menor que 7 (${apgar5})`);
  ['pezinho','orelhinha','olhinho','coracao'].forEach(k=>{
    const v=document.getElementById(`pu-t-${k}`)?.value||'';
    if(/Alterado|Falhou/.test(v))altoAuto.push(`Triagem neonatal alterada: ${k}`);
    else if(v==='Pendente')interAuto.push(`Triagem neonatal pendente: ${k}`);
  });
  const dnpm=document.getElementById('pu-dnpm-class')?.value||'';
  if(dnpm.includes('Provável atraso'))altoAuto.push('Desenvolvimento psicomotor insatisfatório para a faixa etária');
  const alto = altoManual.length+altoAuto.length;
  const inter = interManual.length+interAuto.length;
  const meses = idadePuericulturaGlobal.cronologica_meses;
  const ateDoisAnos = Number.isFinite(meses) && meses <= 24;
  const el = document.getElementById('pu-risco-resultado');
  const conduta = document.getElementById('pu-risco-conduta');
  const auto=document.getElementById('pu-risco-auto');
  if(auto)auto.innerHTML=(altoAuto.length||interAuto.length)?`<div class="alert alert-i"><strong>Critérios identificados automaticamente:</strong> ${[...altoAuto.map(x=>'Alto risco — '+x),...interAuto.map(x=>'Risco intermediário — '+x)].join('; ')}.</div>`:'';
  if (alto > 0) {
    el.style.background='var(--rbg)'; el.style.borderColor='var(--rmid)'; el.style.color='var(--rose)';
    el.textContent='ALTO RISCO — ' + alto + ' critério(s) de alto risco identificado(s)';
    conduta.innerHTML=ateDoisAnos?'<strong>Conduta CIB-PR:</strong> cuidado compartilhado entre APS e Atenção Ambulatorial Especializada; construir e executar plano de cuidados compartilhado e monitorar o seguimento. O calendário prevê consultas mensais na APS até 12 meses, depois aos 15, 18, 21 e 24 meses, além de 6 atendimentos multiprofissionais na AAE.':'<strong>Conduta:</strong> manter acompanhamento na APS e encaminhar ao pediatra/serviço especializado conforme o critério identificado.';
  } else if (inter > 0) {
    el.style.background='var(--abg)'; el.style.borderColor='var(--amid)'; el.style.color='var(--amber)';
    el.textContent='RISCO INTERMEDIÁRIO — ' + inter + ' critério(s) identificado(s)';
    conduta.innerHTML='<strong>Conduta CIB-PR:</strong> seguimento intensificado na APS, ampliando o calendário de puericultura. Se os fatores não melhorarem ou houver piora, reclassificar como alto risco e encaminhar à Atenção Ambulatorial Especializada.';
  } else {
    el.style.background='var(--sf2)'; el.style.borderColor='var(--bd)'; el.style.color='var(--tx)';
    el.textContent=document.getElementById('pu-avaliacao-confirmada')?.checked?'Risco Habitual — critérios avaliados e confirmados':'AVALIAÇÃO INCOMPLETA — critérios de risco não confirmados';
    conduta.innerHTML=document.getElementById('pu-avaliacao-confirmada')?.checked?'<strong>Conduta CIB-PR:</strong> acompanhamento de rotina na APS. Reavaliar a estratificação em todas as consultas até completar 2 anos.':'Completar e confirmar a avaliação antes de concluir risco habitual.';
  }
  conduta.innerHTML+='<div style="margin-top:5px;font-size:11px;color:var(--tx3)">Fonte: Estratificação de Risco de Crianças no Paraná, aprovada na CIB/PR em 28/04/2021. Um único critério define o estrato, prevalecendo o maior risco.</div>';
  return {nivel:alto?'Alto risco':inter?'Risco intermediário':document.getElementById('pu-avaliacao-confirmada')?.checked?'Risco habitual':'Avaliação incompleta',criterios:[...altoAuto,...altoManual,...interAuto,...interManual],conduta:conduta.innerText};
}

document.addEventListener('change',e=>{if(e.target.closest?.('#pg-puericultura'))calcRisco();});
document.addEventListener('input',e=>{if(e.target.closest?.('#pg-puericultura'))calcRisco();});

function atualizaDNPM() {
  const v = document.getElementById('pu-dnpm-class')?.value;
  const el = document.getElementById('pu-dnpm-resultado'); if (!el) return;
  if (!v) { el.innerHTML=''; return; }
  if (v.includes('Provável')) el.innerHTML='<div class="alert alert-e">'+icrisk('dr')+' Provável atraso: encaminhar para avaliação neuropsicomotora especializada.</div>';
  else if (v.includes('Possível')) el.innerHTML='<div class="alert alert-w">'+icrisk('da')+' Possível atraso: orientar estimulação e reavaliar em 30 dias.</div>';
  else el.innerHTML='<div class="alert alert-s">'+icrisk('dg')+' Desenvolvimento adequado para a faixa etária.</div>';
  calcRisco();
}

function checkMCHATIdade() {
  const nasc = document.getElementById('pu-nasc')?.value; if (!nasc) return;
  const idade = calcAgeDetail(nasc); if (!idade) return;
  const meses = idade.totalM;
  const card = document.getElementById('pu-mchat-card');
  if (meses >= 16 && meses <= 30) {
    if (card) { card.style.display='block'; buildMCHAT(); }
  } else {
    if (card) card.style.display='none';
  }
}

// ── EXAMES PUERICULTURA ──────────────────────────────
function avaliaExamePu(el, key) {
  const st = document.getElementById('pu-est-' + key); if (!st) return;
  const val = el.tagName === 'SELECT' ? el.value : parseFloat(el.value);
  if (!val || val === '') { st.textContent = '—'; st.className = 'ex-status st-neu'; return; }
  const resultadoObjetivo=(key === 'para' || key === 'urina');
  const alterado=(key === 'para' && val === 'pos') || (key === 'urina' && val === 'alt');
  st.textContent = resultadoObjetivo ? (alterado ? '✖ Alterado' : '✓ Informado como normal') : '↗ Conferir referência';
  st.className = 'ex-status ' + (resultadoObjetivo ? (alterado ? 'st-alt' : 'st-ok') : 'st-att');
  const ac = document.getElementById('pu-ex-alerts'); if (!ac) return;
  const hb=parseFloat(document.querySelector('#pu-exr-hb .ex-val')?.value), para=document.querySelector('#pu-exr-para .ex-val')?.value;
  ac.innerHTML=(!Number.isNaN(hb)?'<div class="alert alert-i"><strong>Hemograma pediátrico:</strong> interpretar conforme idade, sexo, referência do laboratório, sintomas e índices hematimétricos. O sistema não declara normalidade automaticamente.</div>':'')+
    (para==='pos'?'<div class="alert alert-w"><strong>Parasitologico positivo:</strong> identificar agente e avaliar conduta conforme idade, peso e quadro clinico.</div>':'');
  callAIExamesPu();
}
async function extrairExamesPuPDF(){return importarExamesPDF('pu');}
function addExtraExamePu() {
  const c = document.getElementById('pu-ex-extras-list'), d = document.createElement('div');
  d.className = 'ex-extra-row';
  d.innerHTML = '<input placeholder="Exame"><input placeholder="Valor"><button class="del-btn" onclick="this.parentNode.remove()">×</button>';
  c.appendChild(d);
}
function limparExamesPu() {
  document.querySelectorAll('#exames-card-pu .ex-val').forEach(e => { e.value = ''; });
  document.querySelectorAll('#exames-card-pu .ex-status').forEach(e => { e.textContent = '—'; e.className = 'ex-status st-neu'; });
  document.getElementById('pu-ex-alerts').innerHTML = '';
  document.getElementById('pu-ex-ai-wrap').style.display = 'none';
}
function callAIExamesPu() {
  const get=id=>document.querySelector('#'+id+' .ex-val')?.value||'';
  const hb=parseFloat(get('pu-exr-hb')), ht=parseFloat(get('pu-exr-ht')), glic=parseFloat(get('pu-exr-glic'));
  const para=get('pu-exr-para'), urina=get('pu-exr-urina'), achados=[], condutas=[];
  if(!Number.isNaN(hb)){achados.push(`Hemoglobina ${hb} g/dL: requer comparação com faixa de referência por idade/sexo do laboratório.`);condutas.push('Correlacionar com idade, alimentação, sintomas e demais índices do hemograma antes de definir anemia ou tratamento.');}
  if(!Number.isNaN(ht)){
    achados.push(`Hematócrito ${ht}%: requer comparação com faixa de referência por idade/sexo do laboratório.`);
    condutas.push('Correlacionar hematócrito com hemoglobina, hidratação, sintomas e demais índices hematimétricos.');
  }
  if(!Number.isNaN(glic)){
    achados.push(`Glicemia de jejum ${glic} mg/dL: requer confirmação das condições da coleta e comparação com a referência pediátrica do laboratório.`);
    condutas.push('Avaliar contexto clínico e encaminhar para avaliação médica se alterada na referência laboratorial, persistente ou sintomática.');
  }
  if(para==='pos'){achados.push('Parasitológico de fezes: positivo.');condutas.push('Identificar o agente e avaliar tratamento específico conforme idade, peso, sintomas e protocolo vigente.');}
  else if(para==='neg') achados.push('Parasitológico de fezes: negativo.');
  if(urina==='alt'){achados.push('EAS/urina rotina: alterado.');condutas.push('Correlacionar com sintomas urinários; avaliar necessidade de urocultura e avaliação médica conforme achados.');}
  else if(urina==='normal') achados.push('EAS/urina rotina: normal.');
  document.getElementById('pu-ex-ai-wrap').style.display='block';
  renderInterpretacaoLaboratorial(document.getElementById('pu-ex-ai-out'),achados,[],condutas,'faixa etaria e quadro clinico');
}

// ── MAPAS ANATÔMICOS INTERATIVOS ──────────────────────────

let mamaTipoAtual = 'Nódulo';
let coloTipoAtual = 'Lesão visível';
let vaginaTipoAtual = 'Corrimento';
let mamaAchados = [];
let coloAchados = [];
let vaginaAchados = [];
let mamaCounter = 0;
let coloCounter = 0;
let vaginaCounter = 0;

function setMamaTool(btn) {
  document.querySelectorAll('#mama-toolbar .anat-tool-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  mamaTipoAtual = btn.dataset.tipo;
}

function setColoTool(btn) {
  document.querySelectorAll('#colo-toolbar .anat-tool-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  coloTipoAtual = btn.dataset.tipo;
}

function setVaginaTool(btn) {
  document.querySelectorAll('#vagina-toolbar .anat-tool-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  vaginaTipoAtual = btn.dataset.tipo;
}

function registrarAchadoVagina(zona, x=50, y=50, mostrarMarcador=true) {
  vaginaCounter++;
  const n = vaginaCounter;
  vaginaAchados.push({zona,tipo:vaginaTipoAtual,n});
  if(mostrarMarcador){
    const marker=document.createElement('span');
    marker.className='vagina-marker';
    marker.dataset.n=n;
    marker.style.left=x+'%';
    marker.style.top=y+'%';
    marker.textContent=n;
    document.getElementById('markers-vagina')?.appendChild(marker);
  }
  atualizarTagsVagina();
}

function vaginaMapaClick(e, zonaEl) {
  e.preventDefault();
  e.stopPropagation();
  const mapa=document.getElementById('mapa-vagina');
  const r=mapa.getBoundingClientRect();
  registrarAchadoVagina(zonaEl.dataset.zona,((e.clientX-r.left)/r.width)*100,((e.clientY-r.top)/r.height)*100,true);
}

function adicionarAchadoVaginalInterno(zona) {
  registrarAchadoVagina(zona,50,50,false);
}

function mamaSvgClick(e, lado) {
  const svg = document.getElementById('svg-mama-' + lado.toLowerCase());
  let zonaEl = e.target;
  if (!zonaEl.dataset || !zonaEl.dataset.zona) return;

  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

  mamaCounter++;
  const n = mamaCounter;
  const zona = zonaEl.dataset.zona;
  const horas = zonaEl.dataset.horas || '';
  // Se clicou em quadrante, inclui as horas correspondentes automaticamente
  // Se clicou no anel de hora, só usa a hora
  const isHora = zonaEl.classList.contains('mama-hora');
  const zonaLabel = isHora ? zona : (horas ? zona + ' (' + horas + ')' : zona);

  mamaAchados.push({ lado, zona: zonaLabel, tipo: mamaTipoAtual, n });

  const markersG = document.getElementById('markers-' + lado);
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cx = Math.round(svgP.x), cy = Math.round(svgP.y);
  g.setAttribute('data-n', n);
  g.innerHTML = '<circle cx="' + cx + '" cy="' + cy + '" r="10" style="fill:var(--rose);stroke:#fff;stroke-width:1.5"/>' +
    '<text x="' + cx + '" y="' + cy + '" style="fill:#fff;font-size:9px;font-family:\'DM Mono\',monospace;font-weight:700;dominant-baseline:central;text-anchor:middle;pointer-events:none">' + n + '</text>';
  markersG.appendChild(g);
  atualizarTagsMama();
}

function coloSvgClick(e) {
  const svg = document.getElementById('svg-colo');
  let zonaEl = e.target;
  if (!zonaEl.dataset || !zonaEl.dataset.zona) return;

  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

  coloCounter++;
  const n = coloCounter;
  coloAchados.push({ zona: zonaEl.dataset.zona, tipo: coloTipoAtual, n });

  const markersG = document.getElementById('markers-colo');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('data-n', n);
  g.innerHTML = '<circle cx="' + Math.round(svgP.x) + '" cy="' + Math.round(svgP.y) + '" r="10" style="fill:#3a1d68;stroke:#fff;stroke-width:1.5"/>' +
    '<text x="' + Math.round(svgP.x) + '" y="' + Math.round(svgP.y) + '" style="fill:#fff;font-size:9px;font-family:\'DM Mono\',monospace;font-weight:700;dominant-baseline:central;text-anchor:middle;pointer-events:none">' + n + '</text>';
  markersG.appendChild(g);
  atualizarTagsColo();
}

function atualizarTagsMama() {
  const cont = document.getElementById('mama-tags');
  if (!cont) return;
  cont.innerHTML = '';
  if (!mamaAchados.length) return;
  mamaAchados.forEach(a => {
    const tag = document.createElement('span');
    tag.className = 'anat-tag';
    tag.innerHTML = '<b>' + a.n + '</b>&nbsp;' + a.tipo + ' &mdash; ' + a.zona + ' (' + (a.lado === 'D' ? 'Dir.' : 'Esq.') + ')' +
      '&nbsp;<span style="cursor:pointer;opacity:.6;font-size:11px" onclick="removerMarcaMama(' + a.n + ')">✕</span>';
    cont.appendChild(tag);
  });
  atualizarTextareaMama();
}

function atualizarTagsColo() {
  const cont = document.getElementById('colo-tags');
  if (!cont) return;
  cont.innerHTML = '';
  if (!coloAchados.length) return;
  coloAchados.forEach(a => {
    const tag = document.createElement('span');
    tag.className = 'anat-tag';
    tag.style.cssText = 'background:var(--pbg);border-color:var(--pmid);color:var(--purple)';
    tag.innerHTML = '<b>' + a.n + '</b>&nbsp;' + a.tipo + ' &mdash; ' + a.zona +
      '&nbsp;<span style="cursor:pointer;opacity:.6;font-size:11px" onclick="removerMarcaColo(' + a.n + ')">✕</span>';
    cont.appendChild(tag);
  });
  atualizarTextareaColo();
}

function atualizarTagsVagina() {
  const cont=document.getElementById('vagina-tags');
  if(!cont)return;
  cont.innerHTML='';
  vaginaAchados.forEach(a=>{
    const tag=document.createElement('span');
    tag.className='anat-tag';
    tag.style.cssText='background:var(--pbg);border-color:var(--pmid);color:var(--purple)';
    tag.innerHTML='<b>'+a.n+'</b>&nbsp;'+a.tipo+' &mdash; '+a.zona+
      '&nbsp;<span style="cursor:pointer;opacity:.6;font-size:11px" onclick="removerMarcaVagina('+a.n+')">✕</span>';
    cont.appendChild(tag);
  });
  atualizarTextareaVagina();
}

function removerMarcaMama(n) {
  mamaAchados = mamaAchados.filter(a => a.n !== n);
  ['D','E'].forEach(l => { const g = document.querySelector('#markers-' + l + ' [data-n="' + n + '"]'); if(g) g.remove(); });
  atualizarTagsMama();
}

function removerMarcaColo(n) {
  coloAchados = coloAchados.filter(a => a.n !== n);
  const g = document.querySelector('#markers-colo [data-n="' + n + '"]'); if(g) g.remove();
  atualizarTagsColo();
}

function removerMarcaVagina(n) {
  vaginaAchados=vaginaAchados.filter(a=>a.n!==n);
  document.querySelector('#markers-vagina [data-n="'+n+'"]')?.remove();
  atualizarTagsVagina();
}

function limparMarcadores() {
  mamaAchados = []; mamaCounter = 0;
  ['D','E'].forEach(l => { const g = document.getElementById('markers-'+l); if(g) g.innerHTML=''; });
  const cont = document.getElementById('mama-tags'); if(cont) cont.innerHTML = '';
}

function limparMarcadoresColo() {
  coloAchados = []; coloCounter = 0;
  const g = document.getElementById('markers-colo'); if(g) g.innerHTML = '';
  const cont = document.getElementById('colo-tags'); if(cont) cont.innerHTML = '';
}

function limparMarcadoresVagina() {
  vaginaAchados=[]; vaginaCounter=0;
  const g=document.getElementById('markers-vagina');if(g)g.innerHTML='';
  const cont=document.getElementById('vagina-tags');if(cont)cont.innerHTML='';
  const ta=document.getElementById('prev-vagina-desc');
  if(ta)ta.value=ta.value.replace(/^Achados mapeados:[\s\S]*?\n\n/,'');
}

// Zera os achados dos 3 mapas anatômicos (arrays globais + marcadores SVG + tags).
// Chamado ao abrir o Preventivo, para não carregar achados de um paciente ao próximo.
function resetMapasAnatomicos() {
  if (typeof limparMarcadores === 'function') limparMarcadores();
  if (typeof limparMarcadoresColo === 'function') limparMarcadoresColo();
  if (typeof limparMarcadoresVagina === 'function') limparMarcadoresVagina();
  ['prev-mama-palp','prev-colo-desc'].forEach(id => {
    const t = document.getElementById(id);
    if (t) t.value = t.value.replace(/^Achados mapeados:[\s\S]*?\n\n/, '');
  });
}

function atualizarTextareaMama() {
  if (!mamaAchados.length) return;
  const ta = document.getElementById('prev-mama-palp');
  if (!ta) return;
  const linhas = mamaAchados.map(a => '  ' + a.n + '. ' + a.tipo + ' — ' + a.zona + ' (Mama ' + (a.lado === 'D' ? 'Direita' : 'Esquerda') + ')').join('\n');
  const anterior = ta.value.replace(/^Achados mapeados:[\s\S]*?\n\n/, '');
  ta.value = 'Achados mapeados:\n' + linhas + '\n\n' + anterior;
}

function atualizarTextareaColo() {
  if (!coloAchados.length) return;
  const ta = document.getElementById('prev-colo-desc');
  if (!ta) return;
  const linhas = coloAchados.map(a => '  ' + a.n + '. ' + a.tipo + ' — ' + a.zona).join('\n');
  const anterior = ta.value.replace(/^Achados mapeados:[\s\S]*?\n\n/, '');
  ta.value = 'Achados mapeados:\n' + linhas + '\n\n' + anterior;
}

function atualizarTextareaVagina() {
  const ta=document.getElementById('prev-vagina-desc');
  if(!ta)return;
  const anterior=ta.value.replace(/^Achados mapeados:[\s\S]*?\n\n/,'');
  if(!vaginaAchados.length){ta.value=anterior;return}
  const linhas=vaginaAchados.map(a=>'  '+a.n+'. '+a.tipo+' — '+a.zona).join('\n');
  ta.value='Achados mapeados:\n'+linhas+'\n\n'+anterior;
}

loadProto();

// ── PREVENTIVO — FUNÇÕES ──────────────────────────────────

function prevVerificaIdade() {
  const v = document.getElementById('prev-nasc').value;
  if (!v) return;
  const d = new Date(v + 'T00:00:00'), h = new Date();
  const age = h.getFullYear() - d.getFullYear() - (h < new Date(h.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  const el = document.getElementById('prev-idade-alert');
  if (el) el.style.display = (age < 25 || age > 64) ? 'flex' : 'none';
}

function prevTogglePapAno() {
  const v = document.getElementById('prev-fez').value;
  const wrap = document.getElementById('prev-ult-wrap');
  if (wrap) wrap.style.display = (v === 'sim') ? 'block' : 'none';
}

function prevAlertaGravida() {
  const v = document.getElementById('prev-gravida').value;
  const el = document.getElementById('prev-gravida-alert');
  if (el) el.style.display = (v === 'sim') ? 'flex' : 'none';
}

function prevCheckAdj() {
  const any = document.querySelectorAll('.adj-ck:checked').length > 0;
  const el = document.getElementById('adj-alert');
  if (el) el.style.display = any ? 'flex' : 'none';
}

function prevPillStyle(radio, cls) {
  const group = radio.name;
  document.querySelectorAll(`input[name="${group}"]`).forEach(r => {
    r.closest('.rp')?.classList.remove('sg','sr','sa');
  });
  radio.closest('.rp')?.classList.add(cls);
  // alertas dinâmicos
  if (group === 'prev-dst') prevAlertaDST();
}

function prevColoPillStyle(radio, cls) {
  document.querySelectorAll('input[name="prev-colo"]').forEach(r => {
    r.closest('.rp')?.classList.remove('sg','sr','sa');
  });
  radio.closest('.rp')?.classList.add(cls);
}

function prevAvaliarColo() {
  const v = document.querySelector('input[name="prev-colo"]:checked')?.value;
  const elAlt = document.getElementById('prev-colo-alert-lesao');
  const elNao = document.getElementById('prev-colo-alert-naovisu');
  if (elAlt) elAlt.style.display = (v === 'alterado') ? 'flex' : 'none';
  if (elNao) elNao.style.display = (v === 'naovisu') ? 'flex' : 'none';
}

function prevAlertaDST() {
  const v = document.querySelector('input[name="prev-dst"]:checked')?.value;
  const el = document.getElementById('prev-dst-alert');
  if (el) el.style.display = (v === 'sim') ? 'flex' : 'none';
  // Sinais de sangramento
  const rs = document.getElementById('prev-sang-rel').value;
  const rm = document.getElementById('prev-sang-menop').value;
  const esRel = document.getElementById('prev-sang-rel-alert');
  const esMenop = document.getElementById('prev-sang-menop-alert');
  if (esRel) esRel.style.display = (rs === 'sim') ? 'flex' : 'none';
  if (esMenop) esMenop.style.display = (rm === 'sim') ? 'flex' : 'none';
}

// Chama ao mudar sangramento também
document.addEventListener('DOMContentLoaded', () => {
  const sr = document.getElementById('prev-sang-rel');
  const sm = document.getElementById('prev-sang-menop');
  if (sr) sr.addEventListener('change', prevAlertaDST);
  if (sm) sm.addEventListener('change', prevAlertaDST);
});

function prevAlertaAdequab() {
  const v = document.getElementById('prev-adequab').value;
  const el = document.getElementById('prev-insat-alert');
  if (el) el.style.display = (v === 'insat') ? 'flex' : 'none';
}

function prevMostraResultadoDetalhe() {
  const v = document.getElementById('prev-normal').value;
  const el = document.getElementById('prev-res-detalhe');
  if (el) el.style.display = (v === 'nao') ? 'block' : 'none';
}

function prevAlertaAtipias() {
  const any = document.querySelectorAll('.ck-asc:checked').length > 0;
  const el = document.getElementById('prev-atipias-alert');
  if (el) el.style.display = any ? 'flex' : 'none';
}

function gerarSoapPreventivo() {
  const nome = document.getElementById('prev-nome')?.value || '';
  const idade = document.getElementById('prev-idade')?.value || '';
  const motivo = document.querySelector('input[name="prev-motivo"]:checked')?.value || '';
  const motivoTxt = {rastr:'rastreamento citopatológico', repet:'repetição de exame citopatológico alterado', segs:'seguimento pós-diagnóstico/tratamento'}[motivo] || 'preventivo ginecológico';
  const dum = document.getElementById('prev-dum')?.value || '';
  const diu = document.getElementById('prev-diu')?.value || '';
  const gravida = document.getElementById('prev-gravida')?.value || '';
  const pilula = document.getElementById('prev-pilula')?.value || '';
  const fezPrev = document.getElementById('prev-fez')?.value || '';
  const ultPrev = document.getElementById('prev-ult')?.value || '';
  const sangRel = document.getElementById('prev-sang-rel')?.value || '';
  const sangMenop = document.getElementById('prev-sang-menop')?.value || '';
  const queixas = document.getElementById('prev-queixas')?.value || '';
  const colo = document.querySelector('input[name="prev-colo"]:checked')?.value || '';
  let coloTxt = {normal:'Normal', ausente:'Ausente (cirurgico/congenito)', alterado:'Alterado', naovisu:'Nao visualizado'}[colo] || '';
  const coloDesc = document.getElementById('prev-colo-desc')?.value || '';
  const vaginaDesc = document.getElementById('prev-vagina-desc')?.value || '';
  const mat = document.getElementById('prev-mat')?.value || '';
  const corr = document.getElementById('prev-corr')?.value || '';
  const dst = document.querySelector('input[name="prev-dst"]:checked')?.value || '';
  const mamapalp = document.getElementById('prev-mama-palp')?.value || '';
  const conduta = document.getElementById('prev-conduta')?.value || '';
  const adequab={sat:'Satisfatória',insat:'Insatisfatória para avaliação oncótica'}[document.getElementById('prev-adequab')?.value]||'';
  const normal={sim:'Dentro dos limites da normalidade',nao:'Com alterações descritas no laudo'}[document.getElementById('prev-normal')?.value]||'';
  const achados=Array.from(document.querySelectorAll('#prev-res-detalhe input[type="checkbox"]:checked')).map(e=>e.closest('.cki')?.textContent.trim()).filter(Boolean);
  const resObs=val('prev-res-obs'), resData=val('prev-res-data'), retorno=val('prev-retorno'), orient=val('prev-orient'), encam=val('prev-encam');
  const txtAlterado=[coloDesc,vaginaDesc,mamapalp,queixas,corr,achados.join(' ')].join(' ');
  const temQueixaGine=/corrimento|odor|prurido|coceira|dor p[eé]lvica|sangramento|dispareunia|dis[uú]ria/i.test(txtAlterado);
  const lesaoColo=/les[aã]o|ferida|fri[aá]vel|sangramento ao toque|cisto de naboth|ectopia|hiperemia|alterad/i.test([coloDesc,coloTxt].join(' '));
  const achadoMama=/n[oó]dulo|espessamento|retra[cç][aã]o|descarga|secre[cç][aã]o papilar|alterad/i.test(mamapalp);
  if(lesaoColo&&/normal/i.test(coloTxt))coloTxt='Alterado';
  const cap=s=>s?String(s).charAt(0).toUpperCase()+String(s).slice(1):'';
  const idadeTxt=idade?`, ${/ano/i.test(idade)?idade:`${idade} anos`}`:'';
  const desc=`Consulta de ${motivoTxt}. ${nome||'Paciente'}${idadeTxt}.`;
  const norm=v=>normalizarTextoProtocolo(v||'');
  const sim=v=>/\bsim\b/.test(norm(v));
  const nao=v=>/\bnao\b|\bn[aã]o\b/.test(norm(v));
  const ns=v=>/nao sabe|não sabe|ignorado|nao lembra|não lembra/.test(norm(v));
  const fraseSelecao=(valor,simTxt,naoTxt,nsTxt='Não soube informar.')=>sim(valor)?simTxt:(nao(valor)?naoTxt:(ns(valor)?nsTxt:''));
  const linhasS=[],linhasO=[],linhasA=[],linhasP=[];
  linhasS.push(`Paciente comparece à UBS para consulta de ${motivoTxt}.`);
  if(dum)linhasS.push(`DUM: ${formatarDataBR(dum)}.`);
  if(fezPrev==='sim')linhasS.push(`Refere já ter realizado preventivo${ultPrev?` previamente, com último exame em ${ultPrev}`:''}.`);
  if(fezPrev==='nao')linhasS.push('Refere não ter realizado preventivo anteriormente.');
  if(pilula)linhasS.push(fraseSelecao(pilula,'Refere uso de anticoncepcional oral.','Nega uso de anticoncepcional oral.','Não soube informar uso de anticoncepcional oral.'));
  if(diu)linhasS.push(fraseSelecao(diu,'Refere uso de DIU.','Nega uso de DIU.','Não soube informar uso de DIU.'));
  if(gravida)linhasS.push(fraseSelecao(gravida,'Refere gestação atual.','Nega gestação atual.','Não soube informar gestação atual.'));
  if(queixas)linhasS.push(`Queixa ginecológica/contexto referido: ${finalizarFraseSoap(queixas)}`);
  else linhasS.push('Não foram registradas queixas ginecológicas no momento.');
  if(sim(sangRel))linhasS.push('Refere sangramento após relação sexual.');
  if(sim(sangMenop))linhasS.push('Refere sangramento após a menopausa.');
  const manual=manualSoapPartes('prev');
  if(manual.s)linhasS.push(`Registro complementar da anamnese: ${finalizarFraseSoap(manual.s)}`);

  linhasO.push('Avaliação ginecológica proposta conforme registro da consulta.');
  if(vaginaDesc)linhasO.push(`Inspeção da vagina e vulva: ${finalizarFraseSoap(vaginaDesc)}`);
  if(coloTxt)linhasO.push(`Inspeção do colo: ${coloTxt.toLowerCase()}${coloDesc?` — ${finalizarFraseSoap(coloDesc)}`:'.'}`);
  if(mat)linhasO.push(`Material coletado: ${finalizarFraseSoap(mat)}`);
  if(corr)linhasO.push(`Corrimento: ${finalizarFraseSoap(corr)}`);
  if(dst)linhasO.push(dst==='sim'?'Sinais de IST presentes conforme descrição registrada.':'Sinais de IST: não identificados na avaliação registrada.');
  if(mamapalp)linhasO.push(`Exame das mamas: ${finalizarFraseSoap(mamapalp)}`);
  if(resData||adequab||normal||achados.length||resObs){
    if(resData)linhasO.push(`Resultado recebido em ${formatarDataBR(resData)}.`);
    if(adequab)linhasO.push(`Adequabilidade: ${adequab}.`);
    if(normal)linhasO.push(`Resultado citopatológico: ${normal}.`);
    if(achados.length)linhasO.push(`Achados do laudo: ${achados.join('; ')}.`);
    if(resObs)linhasO.push(`Observações do laudo: ${finalizarFraseSoap(resObs)}`);
  }
  if(manual.o)linhasO.push(`Achado complementar: ${finalizarFraseSoap(manual.o)}`);

  linhasA.push(`Paciente em consulta de ${motivoTxt}.`);
  if(!queixas&&!temQueixaGine)linhasA.push('Sem queixas ginecológicas registradas no momento.');
  if(temQueixaGine)linhasA.push('Queixa ginecológica registrada para avaliação associada ao rastreamento.');
  if(/normal/i.test(coloTxt)&&!lesaoColo)linhasA.push('Colo uterino com aspecto normal à inspeção registrada.');
  if(lesaoColo)linhasA.push('Achado cervical alterado registrado, com necessidade de caracterização e conduta conforme fluxo.');
  if(dst==='nao')linhasA.push('Sem sinais de IST identificados na avaliação.');
  if(achadoMama)linhasA.push('Achado mamário registrado, com necessidade de avaliação conforme fluxo.');
  if(adequab||normal||achados.length)linhasA.push('Resultado citopatológico avaliado conforme registro disponível.');
  if(manual.a)linhasA.push(`Avaliação complementar: ${finalizarFraseSoap(manual.a)}`);

  linhasP.push('Plano proposto de rastreamento conforme avaliação e rotina da APS.');
  if(mat)linhasP.push('Coleta citopatológica registrada conforme técnica e rotina da unidade.');
  if(lesaoColo)linhasP.push('Caracterizar lesão cervical quanto à localização, tamanho, aspecto, sangramento ao toque/friabilidade e secreção; se houver suspeita clínica de lesão sugestiva de câncer, seguir fluxo municipal e não aguardar apenas o resultado citopatológico.');
  if(achadoMama)linhasP.push('Caracterizar achado mamário quanto à mama, quadrante, tamanho, consistência, mobilidade, dor, limites, pele, descarga papilar e linfonodos; avaliar seguimento conforme fluxo de mama/imagem quando indicado.');
  if(temQueixaGine)linhasP.push('Avaliar corrimento, dor, odor ou sangramento em abordagem clínica/sindrômica conforme Protocolo IST Toledo, com orientação de parceria sexual quando indicado.');
  if(conduta)linhasP.push(`Conduta definida: ${finalizarFraseSoap(conduta)}`);
  if(retorno)linhasP.push(`Retorno/agendamento: ${formatarDataBR(retorno)}.`);
  else linhasP.push('Orientar retorno para avaliação do resultado do exame, quando disponível.');
  linhasP.push('Orientar sobre acompanhamento ginecológico periódico.');
  linhasP.push('Orientar a procurar a UBS em caso de corrimento vaginal, dor pélvica, sangramento fora do período menstrual, sangramento após relação sexual, lesões genitais ou outros sintomas ginecológicos.');
  linhasP.push('Orientar prevenção de IST e uso de preservativo.');
  if(orient)linhasP.push(`Orientações adicionais registradas: ${finalizarFraseSoap(orient)}`);
  if(encam)linhasP.push(`Conduta complementar/encaminhamento: ${finalizarFraseSoap(encam)}`);
  if(manual.p)linhasP.push(`Conduta complementar pactuada: ${finalizarFraseSoap(manual.p)}`);
  linhasP.push('Base protocolar: Rastreamento citopatológico vigente; Protocolo IST Toledo.');

  const ids=SOAP_IDS_MODULO.prev;
  document.getElementById(ids.s).value=`DESCRIÇÃO DA CONSULTA\n${desc}\n\nS:\n${formatarLinhasSemiNarrativasSoap(linhasS.join('\n\n'))}`;
  document.getElementById(ids.o).value=`O:\n${formatarLinhasSemiNarrativasSoap(linhasO.join('\n\n'))}`;
  document.getElementById(ids.a).value=`A:\n${formatarLinhasSemiNarrativasSoap(linhasA.join('\n\n'))}`;
  document.getElementById(ids.p).value=`P:\n${formatarLinhasSemiNarrativasSoap(linhasP.join('\n\n'))}`;
  pularFinalizadorSoapAutomatico('prev');
  renderAlertasVermelhosSoap('prev');renderPendenciasSoap('prev');renderInconsistenciasSoap('prev');atualizarIndicadorPreenchimento();
  const soapTab = document.querySelector('[onclick*="prev-6"]');
  if (soapTab) tab(soapTab, 'prev-6');
  showToast('SOAP do preventivo gerado em formato narrativo. Revise antes de salvar.');
}
// SAUDE MENTAL - FUNCOES

function toggleSMItem(chk) {
  const item = chk.closest('.sm-item');
  if (item) item.classList.toggle('checked', chk.checked);
}

function limparERSM() {
  document.querySelectorAll('.ersm-chk').forEach(el => {
    el.checked = false;
    const item = el.closest('.sm-item');
    if (item) item.classList.remove('checked');
  });
  document.getElementById('sm-ersm-score').textContent = '0';
  const cl = document.getElementById('sm-ersm-classificacao');
  cl.style.cssText = ''; cl.textContent = 'Preencha os itens acima para calcular';
  document.getElementById('sm-ersm-conduta').innerHTML = '';
  document.getElementById('sm-ersm-alerta').innerHTML = '';
}

function idadeSM() {
  const v = document.getElementById('sm-nasc').value; if (!v) return;
  const nasc = new Date(v+'T00:00:00'), hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  if (meses < 0) { anos--; meses += 12; }
  if (hoje.getDate() < nasc.getDate()) meses--;
  const txt = anos > 0 ? `${anos} ano${anos>1?'s':''} e ${Math.abs(meses)} mês${Math.abs(meses)!==1?'es':''}` : `${Math.abs(meses)} mês${Math.abs(meses)!==1?'es':''}`;
  document.getElementById('sm-idade').value = txt;
  // Verifica faixa etária <18 ou >60 para sugerir marcação
  const totalAnos = anos + (meses/12);
  if (totalAnos < 18 || totalAnos > 60) {
    document.getElementById('sm-idade').style.background = 'var(--abg)';
    document.getElementById('sm-idade').title = 'Faixa etária <18 ou >60 anos — marcar item correspondente no Grupo V do ERSM (6 pts)';
  } else {
    document.getElementById('sm-idade').style.background = '';
    document.getElementById('sm-idade').title = '';
  }
}

function alertaAgudo() {
  const ts = document.getElementById('sm-ev-ts').checked;
  const crise = document.getElementById('sm-ev-crise').checked;
  const surto = document.getElementById('sm-ev-surto').checked;
  const el = document.getElementById('sm-agudo-alerta');
  if (ts || crise || surto) {
    el.innerHTML = '<div class="alert alert-e">'+ic('alarm')+' <strong>ATENÇÃO IMEDIATA:</strong> Evento agudo identificado. Acionar UPA, PAM ou SAMU para estabilização e definição do fluxo. NÃO aguardar pontuação do ERSM.</div>';
  } else {
    el.innerHTML = '';
  }
}

function calcERSM() {
  const PONTOS = {4:4,2:2,6:6,8:8,10:10};
  let total = 0;
  document.querySelectorAll('.ersm-chk:checked').forEach(el => {
    const item = el.closest('.sm-item');
    if (item) total += parseInt(item.dataset.pts || 0);
  });

  document.getElementById('sm-ersm-score').textContent = total;

  const clasDiv = document.getElementById('sm-ersm-classificacao');
  const condDiv = document.getElementById('sm-ersm-conduta');
  const alertDiv = document.getElementById('sm-ersm-alerta');

  const completo=document.getElementById('sm-avaliacao-confirmada')?.checked===true;
  let cor, bg, label, conduta;
  if(!completo){cor='var(--amber)';bg='var(--abg)';label='AVALIAÇÃO INCOMPLETA';conduta='Conclua a avaliação de todos os itens e de segurança. Achados críticos exigem ação independentemente da pontuação parcial.';}
  else if (total <= 40) {
    cor='var(--green)'; bg='var(--gbg)'; label='BAIXO RISCO';
    conduta='Acompanhamento longitudinal na APS/ESF, com escuta qualificada e matriciamento quando necessário. Em uso de substâncias, articular cuidado com CAPS AD mesmo em baixo risco.';
  } else if (total <= 70) {
    cor='var(--amber)'; bg='var(--abg)'; label='MÉDIO RISCO';
    conduta='Compartilhar o cuidado conforme perfil: ASM para sofrimento/transtorno a partir de 3 anos, CAPS AD para maiores de 18 anos com uso de substâncias e CAPS i para menores de 18 anos. Manter vínculo e monitoramento na APS.';
  } else {
    cor='var(--rose)'; bg='var(--rbg)'; label='ALTO RISCO';
    conduta='Direcionar conforme idade e perfil para CAPS i, CAPS II, CAPS AD, CAPS III/SIM-PR ou outro ponto regulado. Alto risco não significa internação automática. Em evento agudo, acionar UPA, PAM ou SAMU.';
  }

  clasDiv.style.background = bg;
  clasDiv.style.borderColor = cor;
  clasDiv.style.color = cor;
  clasDiv.textContent = label + ' — ' + total + ' pontos';
  condDiv.innerHTML = '<strong>Conduta sugerida:</strong> ' + conduta + '<div style="font-size:11px;color:var(--tx3);margin-top:6px">Fonte: Fluxograma da Saúde Mental / ERSM — Toledo, 2025. Registrar avaliação e encaminhamento no prontuário eletrônico.</div>';

  // Verifica condições especiais (vulnerabilidade)
  const vulns = ['sm-gest','sm-lgbtqia','sm-indigena','sm-migrante','sm-rua','sm-agrotox','sm-def-int'];
  const vulnAtivas = vulns.filter(id => document.getElementById(id)?.checked);
  const elVuln = document.getElementById('sm-vuln-alerta');
  if (vulnAtivas.length > 0) {
    elVuln.innerHTML = '<div class="alert alert-w">'+ic('warning')+' <strong>Condições especiais de vulnerabilidade identificadas.</strong> Mesmo com baixa pontuação no ERSM, considerar encaminhamento ou reforço do cuidado.</div>';
  } else {
    elVuln.innerHTML = '';
  }

  // Alerta crítico (ideação com plano ou delirium)
  verificaAlertaCritico();
}

function verificaAlertaCritico() {
  const chks = document.querySelectorAll('.sm-item-critico .ersm-chk:checked');
  const alertDiv = document.getElementById('sm-ersm-alerta');
  if (chks.length > 0) {
    alertDiv.innerHTML = '<div class="alert alert-e">'+ic('alarm')+' <strong>Sinal crítico identificado:</strong> Ideação suicida com planejamento ou Delirium tremens marcados. Acionar UPA, PAM ou SAMU imediatamente, independentemente da pontuação total.</div>';
  } else {
    alertDiv.innerHTML = '';
  }
}

// limparERSM definida acima

function smTexto(id) { return (document.getElementById(id)?.value || '').trim(); }
function smLabelMarcado(id) { const el = document.getElementById(id); return el?.checked ? (el.closest('label')?.textContent || '').replace(/^[^A-Za-z?-?]+/, '').trim() : ''; }
function smSintomasMarcados() { return Array.from(document.querySelectorAll('.ersm-chk:checked')).map(el => (el.closest('label')?.textContent || '').replace(/\s+/g,' ').trim()).filter(Boolean); }
function smSintomasPontuados() { return Array.from(document.querySelectorAll('.ersm-chk:checked')).map(el => { const item=el.closest('.sm-item'),pts=Number(item?.dataset.pts||0),label=(el.closest('label')?.textContent||'').replace(/\s+/g,' ').trim(); return {label,pts}; }).filter(x=>x.label); }
function smVulnerabilidadesMarcadas() { return ['sm-gest','sm-lgbtqia','sm-indigena','sm-migrante','sm-rua','sm-agrotox','sm-def-int'].map(smLabelMarcado).filter(Boolean); }
function smEventosAgudosMarcados() { return ['sm-ev-ts','sm-ev-crise','sm-ev-surto'].map(smLabelMarcado).filter(Boolean); }
function smIdadeAnosAtual(){
  const nasc=smTexto('sm-nasc');if(nasc){const n=idadeAnos(nasc);if(Number.isFinite(n))return n}
  const m=smTexto('sm-idade').match(/\d+/);return m?Number(m[0]):null;
}
function smTemSubstancias(sintomas){
  const t=[...sintomas.map(x=>x.label||x),smTexto('sm-intoxicacao-abstinencia'),smTexto('sm-substancias')].join(' ');
  return /subst[aâ]ncia|[aá]lcool|droga|crack|coca[ií]na|maconha|abstin[eê]ncia|intoxica/i.test(t);
}
function smResumoSeguranca(){
  const itens=[
    ['Ideação suicida atual',smTexto('sm-ideacao-atual')],
    ['Plano',smTexto('sm-plano-atual')],
    ['Meio disponível',smTexto('sm-meio-disponivel')],
    ['Tentativa prévia',smTexto('sm-tentativa-previa')],
    ['Automutilação',smTexto('sm-automutilacao')],
    ['Psicose/surto',smTexto('sm-psicose')],
    ['Substâncias/intoxicação',smTexto('sm-intoxicacao-abstinencia')],
    ['Rede de apoio',smTexto('sm-rede-apoio')],
    ['Contato de segurança',smTexto('sm-contato-seguranca')]
  ].filter(x=>x[1]);
  return itens.length?`Avaliação de segurança registrada: ${itens.map(([k,v])=>`${k}: ${v}`).join('; ')}.`:'Avaliação de segurança não registrada de forma estruturada; revisar ideação, plano, meios, tentativa prévia, automutilação, substâncias, psicose, impulsividade e rede de apoio.';
}
function smPlanoIndividualizado(score,sintomas,agudos,vulnerabilidades){
  const idade=smIdadeAnosAtual(),menor=Number.isFinite(idade)&&idade<18,subst=smTemSubstancias(sintomas);
  const linhas=[];
  if(agudos.length||sintomas.some(x=>/idea[cç][aã]o suicida com planejamento|delirium tremens/i.test(x.label||x))){
    linhas.push('Realizar avaliação imediata de segurança, não deixar paciente desacompanhado em situação de risco e acionar fluxo de urgência/rede de apoio conforme avaliação profissional.');
  }else if(score===null){linhas.push('Completar ERSM e avaliação de segurança antes de definir estratificação. Conferir ideação, plano, meios, intenção, tentativas anteriores, rede de apoio e fatores de proteção.');
  }else if(score>70){
    linhas.push('Alto risco em saúde mental: manter vínculo com APS, organizar retorno breve e compartilhar cuidado com ponto de atenção psicossocial compatível com perfil e disponibilidade da rede.');
  }else if(score>40){
    linhas.push('Médio risco em saúde mental: manter acompanhamento pela APS, pactuar retorno breve, avaliar matriciamento/ambulatório de saúde mental e monitorar evolução clínica.');
  }else{
    linhas.push('Baixo risco pelo instrumento preenchido: manter escuta qualificada, acompanhamento longitudinal na APS e reavaliar risco se houver mudança clínica.');
  }
  if(menor)linhas.push('Se houver necessidade de cuidado especializado, direcionar para fluxo infantojuvenil/CAPS i conforme idade e gravidade.');
  else if(subst)linhas.push('Havendo uso problemático de álcool ou outras drogas, articular cuidado com CAPS AD/fluxo específico conforme protocolo municipal.');
  else if(score>40)linhas.push('Para adulto sem uso problemático de substâncias registrado, priorizar fluxo de saúde mental adulto/ASM/CAPS compatível com risco e regulação local.');
  if(vulnerabilidades.length)linhas.push(`Considerar vulnerabilidades registradas no plano de cuidado: ${vulnerabilidades.join('; ')}.`);
  linhas.push('Registrar fatores de proteção, plano de segurança quando indicado, profissional de referência, retorno e contato da rede de apoio quando autorizado.');
  return linhas.join(' ');
}
function gerarSoapSM() {
  calcERSM();
  const nome = smTexto('sm-nome') || 'PACIENTE';
  const idade = smTexto('sm-idade') || 'idade não informada';
  const sexo = smTexto('sm-sexo'), ocupacao = smTexto('sm-ocupacao'), escolaridade = smTexto('sm-escol');
  const area = smTexto('sm-area'), responsavel = smTexto('sm-resp'), contato = smTexto('sm-tel');
  const score = document.getElementById('sm-ersm-score').textContent || '0';
  const classif = (document.getElementById('sm-ersm-classificacao').textContent || '').trim();
  const sintomas = smSintomasMarcados();
  const sintomasPts = smSintomasPontuados();
  const vulnerabilidades = smVulnerabilidadesMarcadas();
  const agudos = smEventosAgudosMarcados();
  const guia = coletarGuiaClinico('sm');
  const scoreNum=document.getElementById('sm-avaliacao-confirmada')?.checked?(Number(score)||0):null;
  const criterios=sintomasPts.length?`Itens pontuados no ERSM: ${sintomasPts.map(x=>`${x.label} (${x.pts} ponto${x.pts>1?'s':''})`).join('; ')}.`:'Nenhum item pontuado foi marcado no ERSM; classificação baseada apenas nos campos preenchidos.';
  const exameMental=guia.exame?`Exame do estado mental guiado: ${guia.exame}`:'Exame do estado mental não registrado nos campos estruturados; revisar aparência, comportamento, fala, humor/afeto, pensamento, senso-percepção, orientação, juízo crítico e sinais de intoxicação/agitação.';
  const seguranca=smResumoSeguranca();
  const identificacao = [`Paciente ${nome}, ${idade}${sexo ? `, ${sexo}` : ''}.`, ocupacao ? `Ocupação/situação de trabalho: ${ocupacao}.` : '', escolaridade ? `Escolaridade: ${escolaridade}.` : '', responsavel ? `Responsável: ${responsavel}.` : '', area ? `Endereço/microárea: ${area}.` : '', contato ? `Contato: ${contato}.` : ''].filter(Boolean);
  document.getElementById('sm-s').value = ['DESCRIÇÃO DA CONSULTA', ...identificacao, 'Comparece à APS/ESF para escuta qualificada, avaliação em saúde mental e estratificação de risco.', vulnerabilidades.length ? `Condições de vulnerabilidade identificadas: ${vulnerabilidades.join('; ')}.` : '', agudos.length ? `Eventos agudos informados: ${agudos.join('; ')}.` : '', guia.anamnese ? `ANAMNESE GUIADA:\n${guia.anamnese}` : ''].filter(Boolean).join('\n');
  document.getElementById('sm-o').value = [scoreNum===null?'ERSM não concluído. Itens não marcados não foram confirmados como ausentes.':'ERSM concluído e confirmado pelo profissional.', `Pontuação ${scoreNum===null?'parcial':'total'}: ${score} pontos.`, `Estratificação: ${classif || 'não calculada'}.`, criterios, exameMental, seguranca].filter(Boolean).join('\n');
  document.getElementById('sm-a').value = [`Avaliação de risco em saúde mental: ${classif || score + ' pontos'}.`, criterios, vulnerabilidades.length ? `Vulnerabilidades relevantes: ${vulnerabilidades.join('; ')}.` : '', agudos.length ? 'Presença de evento agudo/critério crítico, exigindo avaliação imediata e definição de fluxo de urgência.' : '', scoreNum>40?'Necessário diferenciar risco atual, risco histórico, fatores de proteção e rede de apoio antes de definir fluxo final.':''].filter(Boolean).join('\n');
  document.getElementById('sm-p').value = [smPlanoIndividualizado(scoreNum,sintomasPts,agudos,vulnerabilidades), guia.condutas ? `CONDUTAS DOS ACHADOS SELECIONADOS:\n${guia.condutas}` : ''].filter(Boolean).join('\n');
  if(guia.alertas) document.getElementById('sm-a').value += '\n\nACHADOS QUE REQUEREM AVALIACAO:\n' + guia.alertas;
  if(resumoVacinalSoap('sm')) document.getElementById('sm-p').value += '\n\nAVALIACAO VACINAL PNI:\n' + resumoVacinalSoap('sm');
  finalizarSoapModulo('sm',`Consulta de enfermagem em saúde mental${nome&&nome!=='PACIENTE'?` de ${nome}`:''}.`);
  const soapTab = document.querySelector('[onclick*="sm-3"]'); if (soapTab) tab(soapTab, 'sm-3'); showToast('SOAP Saude Mental preenchido!');
}
function ersmBase64ToUint8Array(base64) { const bin = atob(base64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return bytes; }
function ersmClassificacaoLimpa() { const txt = (document.getElementById('sm-ersm-classificacao')?.textContent || '').trim(); return txt.replace(/^[^A-Za-z?-?]*/, '') || 'AVALIAÇÃO INCOMPLETA'; }
function ersmWrapText(text, maxChars) { const words = String(text || '').replace(/\s+/g, ' ').trim().split(' '); const lines = []; let line = ''; words.forEach(word => { if ((line + ' ' + word).trim().length > maxChars) { lines.push(line); line = word; } else line = (line + ' ' + word).trim(); }); if (line) lines.push(line); return lines; }
function ersmDrawText(page, text, x, y, maxChars, font, size, color) { const lines = ersmWrapText(text, maxChars); lines.slice(0, 3).forEach((line, idx) => page.drawText(line, { x, y: y - idx * (size + 2), size, font, color })); }
const DOC_CAL_KEYS={ivcf:'esf_doc_cal_ivcf20_v1',ersm:'esf_doc_cal_ersm_v1'};
const DOC_CAL_W=595,DOC_CAL_H=842;
function docCalDefault(){return{global:{x:0,y:0},group:{check:{x:0,y:0},text:{x:0,y:0},score:{x:0,y:0}},items:{},zoom:.76,page:1}}
function docCalMerge(raw){const d=docCalDefault(),r=raw||{};return{...d,...r,global:{...d.global,...(r.global||{})},group:{check:{...d.group.check,...(r.group?.check||{})},text:{...d.group.text,...(r.group?.text||{})},score:{...d.group.score,...(r.group?.score||{})}},items:{...(r.items||{})}}}
function lerDocCalibracao(doc){try{return docCalMerge(JSON.parse(localStorage.getItem(DOC_CAL_KEYS[doc])||'{}'))}catch(e){return docCalDefault()}}
function salvarDocCalibracao(doc,c){try{localStorage.setItem(DOC_CAL_KEYS[doc],JSON.stringify(docCalMerge(c)))}catch(e){}}
function salvarCoordenadasDoc(doc){
  const c=lerDocCalibracao(doc);
  salvarDocCalibracao(doc,c);
  atualizarCalibradorDoc(doc);
  const st=document.getElementById(`${doc}-cal-status`);
  const nome=doc==='ivcf'?'IVCF-20':doc==='ersm'?'ERSM':'documento';
  const msg=`Coordenadas do ${nome} salvas neste computador.`;
  if(st){st.textContent=msg;setTimeout(()=>{if(st.textContent===msg)st.textContent=''},3500)}
  showToast(msg);
}
function docCalOffset(doc,field,type){const c=lerDocCalibracao(doc),g=c.global||{},grp=c.group?.[type]||{},it=c.items?.[field]||{};return{x:(parseFloat(g.x)||0)+(parseFloat(grp.x)||0)+(parseFloat(it.x)||0),y:(parseFloat(g.y)||0)+(parseFloat(grp.y)||0)+(parseFloat(it.y)||0)}}
function docCalPdfPoint(doc,field,type,x,y){const o=docCalOffset(doc,field,type);return{x:x+o.x,y:y-o.y}}
function docCalPreviewPoint(doc,field,type,x,y,size){const o=docCalOffset(doc,field,type);return{left:x+o.x,top:DOC_CAL_H-y-(size||9)+o.y}}
function docCalEsc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function docCalBase64(doc){return doc==='ivcf'?window.IVCF20_MODELO_BASE64:window.ERSM_PDF_LIMPO_BASE64}
function docCalPdfSrc(doc,page){const b=docCalBase64(doc)||'';return b?`data:application/pdf;base64,${b}#page=${page||1}&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`:''}
function docCalZoom(doc){const c=lerDocCalibracao(doc);return Math.max(.55,Math.min(1.25,parseFloat(c.zoom)||.76))}
function docCalIVCFTokens(){
  if(typeof montarIVCF20==='function')montarIVCF20();
  const n=id=>Number(document.getElementById(id)?.value||0),tokens=[];
  const add=(id,label,x,y,type='check',text='X',size=9)=>tokens.push({page:1,id,label,x,y,type,text,size});
  const idade=n('ivcf-idade');add('ivcf-idade','Idade',389,idade===0?720:(idade===1?709:698));
  add('ivcf-saude','Autopercepção da saúde',389,n('ivcf-saude')>0?676:687);
  [['ivcf-compras','Compras',646],['ivcf-dinheiro','Controle dinheiro/contas',616],['ivcf-casa','Trabalhos domésticos',589],['ivcf-banho','Banho sozinho',569],['ivcf-esquecimento','Esquecimento referido',524],['ivcf-piora-memoria','Piora da memória',504],['ivcf-memoria-cotidiano','Memória impede cotidiano',488],['ivcf-tristeza','Desânimo/tristeza',457],['ivcf-interesse','Perda de interesse',434],['ivcf-bracos','Elevar braços',390],['ivcf-maos','Manusear objetos',369],['ivcf-perda-peso','Perda de peso/IMC/panturrilha/marcha',326],['ivcf-caminhar','Dificuldade de caminhar',303],['ivcf-quedas','Quedas',283],['ivcf-incontinencia','Incontinência',263],['ivcf-visao','Visão',224],['ivcf-audicao','Audição',181],['ivcf-comorbidades','Comorbidades múltiplas',116]].forEach(([id,label,y])=>add(id,label,n(id)>0?184:237,y));
  const r=typeof calcularIVCF20==='function'?calcularIVCF20():{total:0};
  add('ivcf-total','Pontuação total',540,76,'score',String(r.total||0),10);
  return tokens;
}
const ERSM_CHECK_Y_P1=[397.8,421.3,444.6,468.0,491.4,514.9,538.2,561.6,585.0,608.5,631.8,655.2,678.6,702.1,725.4,748.8,772.2,795.7,819.0,842.4,865.8,889.3,912.6,936.0,959.4,982.9];
const ERSM_CHECK_Y_P2=[108.3,145.4,168.8,205.9,229.3,252.8,289.9,327.0,350.4,373.8,397.3,434.4,457.8,494.9,518.2,541.6,565.1,588.5,611.8,635.2,658.7,682.1,705.4,728.8,752.3,775.7];
function docCalERSMTokens(){
  if(typeof calcERSM==='function')calcERSM();
  const today=new Date().toISOString().slice(0,10);
  const dataBR=((typeof smTexto==='function'?smTexto('sm-data'):'')||today).split('-').reverse().join('/');
  const txt=(id,p)=>typeof smTexto==='function'?(smTexto(id)||p):p;
  const tokens=[
    {page:1,id:'ersm-nome',label:'Nome',x:160,y:665,type:'text',text:txt('sm-nome','NOME DO USUARIO'),size:9},
    {page:1,id:'ersm-ocupacao',label:'Ocupação',x:125,y:653,type:'text',text:txt('sm-ocupacao','OCUPACAO'),size:8.5},
    {page:1,id:'ersm-prontuario',label:'Prontuário/CNS',x:430,y:665,type:'text',text:txt('sm-prontuario',txt('sm-cns','PRONTUARIO')),size:8.5},
    {page:1,id:'ersm-prof',label:'Profissional',x:230,y:636,type:'text',text:txt('sm-prof','PROFISSIONAL'),size:8.5},
    {page:1,id:'ersm-servico',label:'Serviço',x:170,y:607,type:'text',text:txt('sm-servico','SERVICO'),size:8.5},
    {page:1,id:'ersm-data',label:'Data',x:485,y:607,type:'text',text:dataBR,size:8}
  ];
  const sourceYPage1=ERSM_CHECK_Y_P1;
  const sourceYPage2=ERSM_CHECK_Y_P2;
  const checks=Array.from(document.querySelectorAll('.sm-item .ersm-chk'));
  sourceYPage1.forEach((y,i)=>tokens.push({page:1,id:`ersm-check-${i}`,label:`Item ERSM ${i+1}`,x:528,y:841.92-y*.75-3,type:'check',text:'X',size:9,dim:!checks[i]?.checked}));
  sourceYPage2.forEach((y,j)=>{const i=j+sourceYPage1.length;tokens.push({page:2,id:`ersm-check-${i}`,label:`Item ERSM ${i+1}`,x:528,y:841.92-y*.75-3,type:'check',text:'X',size:9,dim:!checks[i]?.checked})});
  tokens.push({page:2,id:'ersm-total',label:'Pontuação total',x:548,y:212,type:'score',text:document.getElementById('sm-ersm-score')?.textContent||'0',size:12});
  tokens.push({page:2,id:'ersm-classificacao',label:'Classificação',x:395,y:180,type:'score',text:ersmClassificacaoLimpa(),size:9});
  tokens.push({page:2,id:'ersm-vulnerabilidades',label:'Vulnerabilidades marcadas',x:195,y:143,type:'text',text:'Marcado: '+((typeof smVulnerabilidadesMarcadas==='function'?smVulnerabilidadesMarcadas().join('; '):'')||'vulnerabilidades'),size:7.5});
  tokens.push({page:2,id:'ersm-agudos',label:'Eventos agudos marcados',x:195,y:110,type:'text',text:'Marcado: '+((typeof smEventosAgudosMarcados==='function'?smEventosAgudosMarcados().join('; '):'')||'eventos agudos'),size:7.5});
  return tokens;
}
function docCalTokens(doc){return doc==='ivcf'?docCalIVCFTokens():docCalERSMTokens()}
function aplicarZoomCalibradorDoc(doc){
  const el=document.getElementById(`${doc}-cal-zoom`),wrap=document.getElementById(`${doc}-cal-stage-inner`),label=document.getElementById(`${doc}-cal-zoom-label`);
  const c=lerDocCalibracao(doc),z=Math.max(.55,Math.min(1.25,parseFloat(el?.value)||c.zoom||.76));c.zoom=z;salvarDocCalibracao(doc,c);
  if(el)el.value=z;if(wrap)wrap.style.setProperty('--ficha-cal-zoom',z);if(label)label.textContent=Math.round(z*100)+'%';
}
function atualizarCalibradorDoc(doc){
  const d=document.getElementById(`${doc}-calibrador`);if(!d?.open)return;
  const pageEl=document.getElementById(`${doc}-cal-page`),sel=document.getElementById(`${doc}-cal-page-select`);if(!pageEl)return;
  const c=lerDocCalibracao(doc),page=Number(sel?.value||c.page||1);c.page=page;salvarDocCalibracao(doc,c);aplicarZoomCalibradorDoc(doc);
  const bg=docCalPdfSrc(doc,page);
  const tokens=docCalTokens(doc).filter(t=>Number(t.page||1)===page).map(t=>{const p=docCalPreviewPoint(doc,t.id,t.type,t.x,t.y,t.size);const active=(document.getElementById(`${doc}-cal-alvo`)?.value||'item')===t.type;const op=t.dim?0.55:1;return`<div class="ficha-cal-token doc-cal-token ${t.type==='check'?'x':''} ${active?'active':''}" data-doc-cal-token="1" data-doc-cal-doc="${doc}" data-doc-cal-field="${docCalEsc(t.id)}" data-doc-cal-type="${docCalEsc(t.type)}" title="${docCalEsc(t.label||t.id)}" style="left:${p.left.toFixed(1)}px;top:${p.top.toFixed(1)}px;font-size:${t.size||9}px;opacity:${op}">${docCalEsc(t.text)}</div>`}).join('');
  pageEl.innerHTML=`${bg?`<embed class="doc-cal-pdf-bg" src="${bg}" type="application/pdf">`:''}<div class="doc-cal-page-meta">${doc==='ivcf'?'IVCF-20':'ERSM'} · pág. ${page}</div>${tokens}`;
}
function ativarAbaCalibradorDoc(doc){
  const cfg=doc==='ivcf'?{pg:'pg-idoso',tp:'id-5'}:doc==='ersm'?{pg:'pg-saude-mental',tp:'sm-2'}:null;if(!cfg)return;
  const pg=document.getElementById(cfg.pg);if(!pg)return;
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));pg.classList.add('on');
  pg.querySelectorAll('.tp').forEach(t=>t.classList.remove('on'));document.getElementById(cfg.tp)?.classList.add('on');
  pg.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',(t.getAttribute('onclick')||'').includes(cfg.tp)));
}
function abrirCalibradorDoc(doc){ativarAbaCalibradorDoc(doc);const d=document.getElementById(`${doc}-calibrador`);if(!d)return;d.open=true;setTimeout(()=>{atualizarCalibradorDoc(doc);d.scrollIntoView({behavior:'smooth',block:'start'});document.getElementById(`${doc}-cal-page`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});},40)}
function fecharCalibradorDoc(doc){const d=document.getElementById(`${doc}-calibrador`);if(d)d.open=false}
function resetarCalibradorDoc(doc){try{localStorage.removeItem(DOC_CAL_KEYS[doc])}catch(e){}atualizarCalibradorDoc(doc);showToast('Calibração restaurada.')}
let DOC_CAL_DRAG_ACTIVE=false;
function iniciarArrasteDocCal(e){
  const tok=e.target.closest?.('[data-doc-cal-token]');if(!tok)return;
  if(DOC_CAL_DRAG_ACTIVE)return;
  DOC_CAL_DRAG_ACTIVE=true;
  const doc=tok.dataset.docCalDoc,page=document.getElementById(`${doc}-cal-page`);if(!doc||!page||!page.contains(tok))return;
  e.preventDefault();if(e.pointerId!==undefined)tok.setPointerCapture?.(e.pointerId);
  const tipo=tok.dataset.docCalType||'text',field=tok.dataset.docCalField,alvo=document.getElementById(`${doc}-cal-alvo`)?.value||'item';
  const iniX=e.clientX,iniY=e.clientY,startLeft=parseFloat(tok.style.left)||tok.offsetLeft,startTop=parseFloat(tok.style.top)||tok.offsetTop,zoom=docCalZoom(doc);
  function move(ev){tok.style.left=(startLeft+(ev.clientX-iniX)/zoom)+'px';tok.style.top=(startTop+(ev.clientY-iniY)/zoom)+'px'}
  function up(ev){
    document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);DOC_CAL_DRAG_ACTIVE=false;
    const dx=+(((ev.clientX-iniX)/zoom).toFixed(1)),dy=+(((ev.clientY-iniY)/zoom).toFixed(1)),c=lerDocCalibracao(doc);
    if(alvo==='geral'){c.global.x=+((parseFloat(c.global.x)||0)+dx).toFixed(1);c.global.y=+((parseFloat(c.global.y)||0)+dy).toFixed(1)}
    else if(alvo===tipo){c.group[tipo]=c.group[tipo]||{x:0,y:0};c.group[tipo].x=+((parseFloat(c.group[tipo].x)||0)+dx).toFixed(1);c.group[tipo].y=+((parseFloat(c.group[tipo].y)||0)+dy).toFixed(1)}
    else if(field){c.items[field]=c.items[field]||{x:0,y:0};c.items[field].x=+((parseFloat(c.items[field].x)||0)+dx).toFixed(1);c.items[field].y=+((parseFloat(c.items[field].y)||0)+dy).toFixed(1)}
    salvarDocCalibracao(doc,c);atualizarCalibradorDoc(doc);
  }
  document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});document.addEventListener('mousemove',move);document.addEventListener('mouseup',up,{once:true});
}
document.addEventListener('pointerdown',iniciarArrasteDocCal);
document.addEventListener('mousedown',iniciarArrasteDocCal);
async function gerarPdfERSM() {
  if(!exigirPermissao('gerar_documentos'))return;
  if (!window.PDFLib) { alert('Nao foi possivel carregar o gerador de PDF. Verifique a conexao com a internet e tente novamente.'); return; }
  calcERSM();
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdfBase = window.ERSM_PDF_LIMPO_BASE64;
  if(!pdfBase){alert('O modelo limpo do ERSM não foi carregado. Mantenha o arquivo ersm-modelo-limpo.js junto ao site.');return;}
  const pdfDoc = await PDFDocument.load(ersmBase64ToUint8Array(pdfBase));
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0.05, 0.05, 0.05), blue = rgb(0.05, 0.18, 0.45);
  const pages = pdfDoc.getPages(), p1 = pages[0], p2 = pages[1];
  const today = new Date().toISOString().slice(0,10);
  const dataBR = (smTexto('sm-data') || today).split('-').reverse().join('/');
  const drawTextCal=(page,id,text,x,y,maxChars,f,size,type='text')=>{const p=docCalPdfPoint('ersm',id,type,x,y);ersmDrawText(page,text,p.x,p.y,maxChars,f,size,blue)};
  const drawRawCal=(page,id,text,x,y,size,f,type='text')=>{const p=docCalPdfPoint('ersm',id,type,x,y);page.drawText(text,{x:p.x,y:p.y,size,font:f,color:blue})};
  drawTextCal(p1,'ersm-nome', smTexto('sm-nome'), 160, 665, 42, bold, 9);
  drawTextCal(p1,'ersm-ocupacao', smTexto('sm-ocupacao'), 125, 653, 35, font, 8.5);
  drawTextCal(p1,'ersm-prontuario', smTexto('sm-prontuario') || smTexto('sm-cns'), 430, 665, 18, font, 8.5);
  drawTextCal(p1,'ersm-prof', smTexto('sm-prof'), 230, 636, 42, font, 8.5);
  drawTextCal(p1,'ersm-servico', smTexto('sm-servico'), 170, 607, 38, font, 8.5);
  drawRawCal(p1,'ersm-data', dataBR, 485, 607, 8, font);
  const sourceYPage1 = ERSM_CHECK_Y_P1;
  const sourceYPage2 = ERSM_CHECK_Y_P2;
  const rows = sourceYPage1.map(y => [p1, 841.92 - y * 0.75]).concat(sourceYPage2.map(y => [p2, 841.92 - y * 0.75]));
  const checks = Array.from(document.querySelectorAll('.sm-item .ersm-chk'));
  rows.forEach(([page, y], i) => { if (checks[i]?.checked) { const p=docCalPdfPoint('ersm',`ersm-check-${i}`,'check',528,y-3); page.drawText('X', { x: p.x, y: p.y, size: 9, font: bold, color: blue }); } });
  const total = document.getElementById('sm-ersm-score')?.textContent || '0';
  drawRawCal(p2,'ersm-total', total, 548, 212, 12, bold, 'score');
  drawTextCal(p2,'ersm-classificacao', ersmClassificacaoLimpa(), 395, 180, 34, bold, 9, 'score');
  const vulnerabilidades = smVulnerabilidadesMarcadas().join('; '), agudos = smEventosAgudosMarcados().join('; ');
  if (vulnerabilidades) drawTextCal(p2,'ersm-vulnerabilidades', 'Marcado: ' + vulnerabilidades, 195, 143, 68, font, 7.5);
  if (agudos) drawTextCal(p2,'ersm-agudos', 'Marcado: ' + agudos, 195, 110, 68, font, 7.5);
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const nome = (smTexto('sm-nome') || 'usuario').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase();
  a.href = url; a.download = `estratificacao-ersm-${nome || 'usuario'}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); showToast('PDF da estratificacao gerado!');
}
