/* Presentation and form state only. Clinical thresholds remain in the existing evaluators. */
(() => {
  'use strict';
  const legacy = new Map(), initial = new Map(), dirty = new Set(), saved = new Map(), seenDrafts = new Set();
  const byId = id => document.getElementById(id);
  const pageNow = () => document.querySelector('.pg.on');
  const prefix = page => typeof QUICK_PAGE_PREFIX === 'undefined' ? '' : QUICK_PAGE_PREFIX[page?.id] || '';
  const owner = () => typeof CURRENT_AUTH_USER_ID === 'undefined' ? '' : CURRENT_AUTH_USER_ID || '';
  const stateKey = page => `${owner()}:${page?.id}`;
  const draftKey = page => `esf_rascunho_interface_v2:${stateKey(page)}`;
  const normal = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const make = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  let ready = false, savingDraft = false, lastRisk = null, riskSignature = '', resizeObserver;
  let navOwner = null, navCompact = false, navPreferences = {favorites:[],closed:[]};
  const navGroups = new Map(), navButtons = new Map();
  const navKey = () => `esf_prumo_navigation_v1:${owner() || 'visitante'}`;

  function controlValue(e) { return ['checkbox','radio'].includes(e.type) ? {checked:e.checked,value:e.value} : e.value; }
  function collectValues(page) {
    const data = {};
    page.querySelectorAll('input,select,textarea').forEach(e => {
      if (e.id && !['file','password','button','submit'].includes(e.type) && !e.closest('.ux-draft-prompt')) data[e.id] = controlValue(e);
    });
    return data;
  }
  function capture(page) {
    if (!page) return {};
    return {version:1,chips:[...page.querySelectorAll('[data-ux-key].selected')].map(e => e.dataset.uxKey),riskReviewed:!!byId('ux-risk-reviewed')?.checked};
  }
  function restore(page, data) {
    if (!page) return;
    page.querySelectorAll('[data-ux-key]').forEach(e => e.classList.toggle('selected',Array.isArray(data?.chips) && data.chips.includes(e.dataset.uxKey)));
    if (page.id === 'pg-pn-abertura') {
      const checked = !!data?.riskReviewed;
      syncRiskDuplicates(true); syncExam('pna');
      if (byId('ux-risk-reviewed')) byId('ux-risk-reviewed').checked = checked;
      riskSignature = '';
    }
    syncExam(prefix(page));
    refreshChips(page);
    onNavigate(page);
  }
  function restoreValues(page, values) {
    Object.entries(values || {}).forEach(([id,v]) => {
      const e = byId(id);
      if (!e || !page.contains(e) || ['file','password','button','submit'].includes(e.type)) return;
      if (v && typeof v === 'object' && 'checked' in v) e.checked = !!v.checked;
      else if (typeof v === 'string' || typeof v === 'number') e.value = v;
    });
  }
  function beforeRestore(page) {
    if (!page) return;
    restoreValues(page,initial.get(page.id));
    page.querySelectorAll('[data-ux-key]').forEach(e=>e.classList.remove('selected'));
    if (page.id==='pg-pn-abertura' && byId('ux-risk-reviewed')) byId('ux-risk-reviewed').checked=false;
    saved.delete(stateKey(page));dirty.delete(stateKey(page));riskSignature='';
  }
  function saveDraft(page = pageNow()) {
    if (!ready || savingDraft || !owner() || !prefix(page) || !dirty.has(stateKey(page))) return;
    savingDraft = true;
    try {
      localStorage.setItem(draftKey(page),JSON.stringify({owner:owner(),page:page.id,savedAt:new Date().toISOString(),values:collectValues(page),interface:capture(page)}));
      page.dataset.uxDraftSaved = '1';
    } catch (_) { page.dataset.uxDraftSaved = 'error'; }
    finally { savingDraft = false; updateSaveState(); }
  }
  function beforeNavigate() { saveDraft(); closeMenus(); }
  function offerDraft(id) {
    const page = byId(id), key = stateKey(page);
    if (!ready || !owner() || !prefix(page) || seenDrafts.has(key)) return;
    seenDrafts.add(key);
    let draft;
    try { draft = JSON.parse(localStorage.getItem(draftKey(page)) || 'null'); } catch (_) { return; }
    if (!draft || draft.owner !== owner() || draft.page !== id || !draft.values || dirty.has(key)) return;
    const notice = make('div','ux-draft-prompt');
    const text = make('span','', 'Há um rascunho deste atendimento salvo no dispositivo.');
    const resume = make('button','btn btn-s','Retomar rascunho'); resume.type = 'button';
    const dismiss = make('button','btn btn-s','Continuar sem retomar'); dismiss.type = 'button';
    resume.onclick = () => {
      if (draft.owner !== owner()) return;
      restoreValues(page,draft.values); restore(page,draft.interface); dirty.add(key); page.dataset.uxDraftSaved = '1';
      notice.remove(); recalculate(page); updateSaveState(); showToast('Rascunho retomado. Confira os dados antes de continuar.');
    };
    dismiss.onclick = () => notice.remove();
    notice.append(text,resume,dismiss); page.querySelector('.sh')?.after(notice);
  }
  function touch(page, target) {
    if (!prefix(page)) return;
    dirty.add(stateKey(page)); delete page.dataset.uxDraftSaved;
    if (page.id === 'pg-pn-abertura' && target?.id !== 'ux-risk-reviewed') {
      if (byId('ux-risk-reviewed')) byId('ux-risk-reviewed').checked = false;
    }
    refreshChips(page); updateSaveState(); updatePatient(page);
  }
  function updateSaveState() {
    const page = pageNow(), output = byId('ux-save-state'); if (!output || !prefix(page)) return;
    let text = 'Rascunho · ainda não salvo no histórico';
    const record = saved.get(stateKey(page));
    if (record && !dirty.has(stateKey(page))) {
      const item = typeof carregarAtendimentos === 'function' ? carregarAtendimentos().find(a => a.id === record) : null;
      text = item?.synced ? 'Registro salvo e sincronizado' : 'Salvo no histórico · sincronização pendente';
    } else if (page.dataset.uxDraftSaved === 'error') text = 'Não foi possível salvar o rascunho no dispositivo';
    else if (page.dataset.uxDraftSaved === '1') text = 'Rascunho no dispositivo · não finalizado';
    else if (dirty.has(stateKey(page))) text = 'Alterações ainda não finalizadas';
    if (output.textContent !== text) output.textContent = text;
  }
  function onSaved(p, id) {
    const page = byId('pg-' + moduloPorPrefixo(p)?.page); if (!page) return;
    saved.set(stateKey(page),id); dirty.delete(stateKey(page)); delete page.dataset.uxDraftSaved;
    try { localStorage.removeItem(draftKey(page)); } catch (_) {}
    updateSaveState();
  }
  function recalculate(page) {
    const p = prefix(page);
    syncRiskDuplicates(); syncExam(p);
    if (p === 'pna') avaliarProtocolosPna();
    else if (p === 'pnc') { checkPncQueixas(); checkPncVitais(); }
    if (typeof atualizarAlertaClinico === 'function') atualizarAlertaClinico(p);
    if (typeof MODULOS_CLINICOS !== 'undefined' && MODULOS_CLINICOS[p]) avaliarPrioridadeModulo(p);
    refreshChips(page); atualizarIndicadorPreenchimento();
  }
  function clearConsultation() {
    const page = pageNow(), p = prefix(page); if (!p) return;
    if (!confirm('Limpar a avaliação, os resultados selecionados e o SOAP deste atendimento? A identificação do paciente será mantida.')) return;
    const keep = /-(nome|cpf|cns|nasc|telefone|cep|logradouro|numero|bairro|municipio|uf)$/;
    page.querySelectorAll('input,select,textarea').forEach(e => {
      if (keep.test(e.id) || ['button','submit','hidden','file'].includes(e.type)) return;
      if (['checkbox','radio'].includes(e.type)) e.checked = false; else e.value = '';
    });
    page.querySelectorAll('[data-ux-key],.clinical-chip,.complaint-chip,.alert-chip,.quick-care').forEach(e => e.classList.remove('selected'));
    page.querySelectorAll('input[type=file]').forEach(e => e.value = '');
    page.querySelectorAll('.clinical-alerts,.soap-pendencias,.sae-preview').forEach(e => e.replaceChildren());
    if (typeof EXAMES_PADRAO !== 'undefined') delete EXAMES_PADRAO[p];
    if (typeof EXAMES_LIVRES !== 'undefined') delete EXAMES_LIVRES[p];
    if (typeof AI_SOAP_PENDENCIAS !== 'undefined') delete AI_SOAP_PENDENCIAS[p];
    if (typeof ATENDIMENTO_EM_EDICAO !== 'undefined') ATENDIMENTO_EM_EDICAO = null;
    riskSignature = ''; saved.delete(stateKey(page)); touch(page); recalculate(page); saveDraft(page);
    closeMenus(); showToast('Avaliação e seleções limpas. Identificação do paciente mantida.');
  }

  function prepareTabs(root = document) {
    root.querySelectorAll('.tabs').forEach((list,li) => {
      list.setAttribute('role','tablist'); list.setAttribute('aria-label','Etapas do atendimento');
      [...list.querySelectorAll('.tab')].forEach((old,i) => {
        let button = old;
        if (old.tagName !== 'BUTTON') {
          button = document.createElement('button'); [...old.attributes].forEach(a => button.setAttribute(a.name,a.value));
          button.append(...old.childNodes); old.replaceWith(button);
        }
        button.type = 'button'; button.id ||= `ux-tab-${list.closest('.pg')?.id || li}-${i}`;
        const target = button.getAttribute('onclick')?.match(/['"]([^'"]+)['"]\s*\)/)?.[1];
        if (target && byId(target)) { button.setAttribute('aria-controls',target); byId(target).setAttribute('role','tabpanel'); byId(target).setAttribute('aria-labelledby',button.id); }
        button.setAttribute('role','tab');
      });
      list.addEventListener('keydown',e => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
        const buttons = [...list.querySelectorAll('.tab')], index = buttons.indexOf(document.activeElement); if (index < 0) return;
        e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length-1 : (index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
        buttons[next].click(); buttons[next].focus();
      });
    });
    document.querySelectorAll('.pg').forEach(updateTabs);
  }
  function updateTabs(page) {
    page?.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected',String(t.classList.contains('on'))));
    const select = page?.querySelector('.ux-stage-select');
    if (select) select.value = page.querySelector('.tab.on')?.getAttribute('aria-controls') || '';
    updateActions();
  }
  function labelFields(root = document) {
    root.querySelectorAll('input,select,textarea').forEach(e => {
      if (e.labels?.length || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || ['hidden','button','submit'].includes(e.type)) return;
      const container = e.closest('.f,.user-input-row,.auth-field,.guided-exam-item'), label = container?.querySelector('label');
      if (label && e.id && !label.control) label.htmlFor = e.id;
      else if (container?.querySelector('strong')) e.setAttribute('aria-label',container.querySelector('strong').textContent.trim());
    });
  }
  function updateNavigation() {
    const admin=byId('admin-nav-btn'),support=navGroups.get('Gestão e apoio')?.querySelector('.ux-nav-list');
    if(admin&&support){
      if(!admin.querySelector('.ux-nav-icon')){const icon=make('span','ux-nav-icon'),copy=make('span','ux-nav-copy','Administração');icon.setAttribute('aria-hidden','true');icon.innerHTML=ic('shield');admin.replaceChildren(icon,copy);admin.setAttribute('aria-label','Administração');admin.title='Administração';}
      if(admin.parentElement!==support)support.append(admin);
    }
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    const compact=collapsed&&innerWidth>760;
    if(compact)navGroups.forEach(group=>group.open=true);
    else if(navCompact)navGroups.forEach((group,name)=>group.open=!navPreferences.closed.includes(name));
    navCompact=compact;
    document.querySelectorAll('.sidebar-toggle,.ux-mobile-menu').forEach(b => b.setAttribute('aria-expanded',String(!collapsed)));
    const backdrop = byId('ux-menu-backdrop'); if (backdrop) backdrop.hidden = collapsed || innerWidth > 760;
  }
  function setupNavigation() {
    const bar = document.querySelector('.bar'), nav = document.querySelector('.bar-nav'); if (!bar || !nav) return;
    nav.id = 'ux-navigation'; nav.setAttribute('aria-label','Módulos do sistema');
    const groups = [
      ['Atendimentos',['inicio','pn-abertura','pn-consulta','puericultura','preventivo','idoso','saude-mental','consulta-geral','hiperdia','feridas','puerperio','ist','visita-domiciliar']],
      ['Acompanhamento',['pacientes','historico','sinan','pni','busca-ativa']],
      ['Gestão e apoio',['indicadores','territorio','relatorios','editor','auditoria-clinica','reportes']]
    ];
    const buttons = [...nav.querySelectorAll('.nb')];
    const icons={inicio:'house','pn-abertura':'pregnant','pn-consulta':'stethoscope',puericultura:'baby',preventivo:'flower',idoso:'elder','saude-mental':'brain','consulta-geral':'cross',hiperdia:'heart',feridas:'cross',puerperio:'baby',ist:'flask','visita-domiciliar':'house',pacientes:'users',historico:'clipboard',sinan:'report',pni:'syringe','busca-ativa':'search',indicadores:'report',territorio:'house',relatorios:'doc',editor:'gear','auditoria-clinica':'shield',reportes:'chat'};
    const favorites = make('section','ux-nav-favorites'); favorites.id='ux-nav-favorites';
    favorites.append(make('div','ux-nav-heading','Favoritos'),make('div','ux-favorite-list'));nav.append(favorites);
    groups.forEach(([title,ids],index) => {
      const group=make('details','ux-nav-group'),heading=make('summary','ux-nav-heading',title),list=make('div','ux-nav-list');
      group.id=`ux-nav-group-${index}`;group.open=true;group.append(heading,list);nav.append(group);navGroups.set(title,group);
      group.addEventListener('toggle',()=>{
        if(navOwner!==owner()||(document.body.classList.contains('sidebar-collapsed')&&innerWidth>760))return;
        navPreferences.closed=[...navGroups.entries()].filter(([,g])=>!g.open).map(([name])=>name);saveNavPreferences();
      });
      ids.forEach(id => {
        const b=buttons.find(b=>b.getAttribute('onclick')?.includes(`'${id}'`));if(!b)return;
        const clone=b.cloneNode(true),status=b.querySelector('.dev-nav');clone.querySelectorAll('[data-ic],svg,.dev-nav').forEach(e=>e.remove());
        const name=clone.textContent.trim().replace(/^[^\p{L}\p{N}]+/u,''),icon=make('span','ux-nav-icon'),copy=make('span','ux-nav-copy');
        icon.setAttribute('aria-hidden','true');icon.innerHTML=ic(icons[id]||'doc');copy.append(make('span','ux-nav-label',name));
        if(status){status.textContent='Em desenvolvimento';copy.append(status);}
        b.replaceChildren(icon,copy);b.dataset.uxPage=id;b.dataset.uxGroup=title;b.setAttribute('aria-label',name+(status?' — Em desenvolvimento':''));b.title=b.getAttribute('aria-label');
        list.append(b);navButtons.set(id,b);
      });
    });
    document.querySelectorAll('.pg>.sh').forEach(head=>{
      const button=make('button','ux-favorite-toggle','☆ Favoritar');button.type='button';button.setAttribute('aria-pressed','false');
      button.onclick=()=>{loadNavPreferences();const id=head.parentElement.id.slice(3);navPreferences.favorites=navPreferences.favorites.includes(id)?navPreferences.favorites.filter(x=>x!==id):[...navPreferences.favorites,id];saveNavPreferences();renderFavorites();};head.append(button);
    });
    const mobile = make('div','ux-mobile-header');
    const menu = make('button','ux-mobile-menu','☰ Menu'); menu.type='button'; menu.setAttribute('aria-controls','ux-navigation'); menu.onclick=()=>alternarMenuLateral();
    mobile.append(menu,make('span','ux-mobile-brand', 'PRUMO APS')); document.body.prepend(mobile);
    const backdrop = make('button','ux-menu-backdrop'); backdrop.id='ux-menu-backdrop'; backdrop.type='button'; backdrop.setAttribute('aria-label','Fechar menu'); backdrop.hidden=true; backdrop.onclick=()=>alternarMenuLateral(true); document.body.append(backdrop);
    const toggle = document.querySelector('.sidebar-toggle'); toggle?.setAttribute('aria-label','Recolher ou expandir menu'); toggle?.setAttribute('aria-controls','ux-navigation');
    const profile = byId('user-chip-btn'); if (profile) { profile.setAttribute('role','button'); profile.tabIndex=0; profile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();profile.click();}}); }
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();if(innerWidth<=760)alternarMenuLateral(true);}});
    window.addEventListener('resize',()=>{updateNavigation(); updateActions();}); updateNavigation();
  }
  function saveNavPreferences(){try{localStorage.setItem(navKey(),JSON.stringify(navPreferences));}catch(_){}}
  function loadNavPreferences(){
    if(navOwner===owner())return;
    navOwner=owner();let value;try{value=JSON.parse(localStorage.getItem(navKey())||'null');}catch(_){}
    navPreferences={favorites:Array.isArray(value?.favorites)?value.favorites.filter(x=>navButtons.has(x)):['pn-abertura'],closed:Array.isArray(value?.closed)?value.closed.filter(x=>navGroups.has(x)):[]};
    navGroups.forEach((group,name)=>group.open=!navPreferences.closed.includes(name));
  }
  function renderFavorites(){
    loadNavPreferences();const favoriteList=document.querySelector('.ux-favorite-list');if(!favoriteList)return;
    navButtons.forEach((button,id)=>{const target=navPreferences.favorites.includes(id)?favoriteList:navGroups.get(button.dataset.uxGroup)?.querySelector('.ux-nav-list');if(target&&button.parentElement!==target)target.append(button);});
    byId('ux-nav-favorites').hidden=![...favoriteList.children].some(b=>!b.classList.contains('modulo-desativado')&&b.style.display!=='none');
    document.querySelectorAll('.ux-favorite-toggle').forEach(button=>{const id=button.closest('.pg').id.slice(3),selected=navPreferences.favorites.includes(id),text=selected?'★ Favorito':'☆ Favoritar';if(button.textContent!==text)button.textContent=text;button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',`${selected?'Remover dos':'Adicionar aos'} favoritos: ${button.closest('.sh').querySelector('.sh-t')?.textContent||id}`);});
    updateNavigation();
  }
  function setupAdminTests(){
    const tabs=document.querySelector('.admin-tabs'),body=document.querySelector('.admin-body');if(!tabs||!body)return;
    const tab=make('button','admin-tab','Testes');tab.id='ux-admin-test-tab';tab.type='button';tab.onclick=()=>{refreshAdminTests();adminTab(tab,'testes');};tabs.append(tab);
    const section=make('div','admin-section');section.id='admin-sec-testes';
    const card=make('div','admin-card'),title=make('div','admin-card-title','Cenários de teste'),help=make('p','ux-help','Preenche dados fictícios para conferir o funcionamento. Use um atendimento vazio.');
    const label=make('label','ux-admin-test-label','Atendimento'),select=make('select');select.id='ux-admin-test-module';label.htmlFor=select.id;label.append(select);
    const run=make('button','btn btn-p','Preencher cenário de teste');run.type='button';run.id='ux-admin-run-test';run.onclick=()=>{
      if(!exigirPermissao('usar_modo_teste')||!exigirPermissao('ver_admin'))return;
      const page=byId(select.value),original=page?.querySelector('.sh .admin-test-btn');if(!original)return;
      if(!confirm('Preencher este atendimento com dados fictícios? Os campos atuais podem ser substituídos.'))return;
      go(page.id.slice(3));if(!page.classList.contains('on'))return;fecharAdmin();original.click();
    };
    card.append(title,help,label,run);section.append(card);body.append(section);refreshAdminTests();
  }
  function refreshAdminTests(){
    const tab=byId('ux-admin-test-tab'),select=byId('ux-admin-test-module');if(!tab||!select)return;
    const allowed=temPermissao('usar_modo_teste')&&temPermissao('ver_admin');tab.hidden=!allowed;byId('ux-admin-run-test').disabled=!allowed;
    if(!allowed&&byId('admin-sec-testes').classList.contains('active'))adminTab(null,'atendimentos');
    const options=[...document.querySelectorAll('.pg>.sh>.admin-test-btn')].filter(b=>!b.closest('.pg').classList.contains('modulo-desativado')).map(b=>({id:b.closest('.pg').id,label:b.closest('.sh').querySelector('.sh-t')?.textContent||b.closest('.pg').id}));
    const signature=JSON.stringify(options);if(select.dataset.options===signature)return;const current=select.value;select.replaceChildren();options.forEach(({id,label})=>{const option=make('option','',label);option.value=id;select.append(option);});if(options.some(x=>x.id===current))select.value=current;select.dataset.options=signature;
  }
  function setupPatient(page) {
    if (!prefix(page)) return;
    const strip = make('div','ux-patient-strip'), name = make('span','ux-patient-name'), action = make('button','ux-link','Identificar paciente');
    const icon=make('span','ux-patient-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML=ic('user');
    name.setAttribute('aria-live','polite'); action.type='button'; action.onclick=()=>reveal(`${prefix(page)}-nome`);
    strip.append(icon,name,action); page.querySelector('.sh')?.after(strip);
    const tabs = page.querySelector('.tabs');
    if (tabs) {
      const label = make('label','ux-stage-label','Etapa do atendimento'); const select = make('select','ux-stage-select');
      select.id = `ux-stage-${page.id}`; label.htmlFor=select.id;
      tabs.querySelectorAll('.tab').forEach(t=>{const option=make('option','',t.textContent.trim());option.value=t.getAttribute('aria-controls')||'';select.append(option);});
      select.onchange=()=>{const t=[...tabs.querySelectorAll('.tab')].find(t=>t.getAttribute('aria-controls')===select.value);t?.click();}; label.append(select); tabs.after(label);
    }
    updatePatient(page);
  }
  function updatePatient(page) {
    const p=prefix(page),name=byId(`${p}-nome`)?.value?.trim(),out=page?.querySelector('.ux-patient-name');
    if(out)out.textContent=name||'Paciente ainda não identificado';
    const action=page?.querySelector('.ux-patient-strip button');if(action)action.textContent=name?'Ver identificação':'Identificar paciente';
  }
  function reveal(id) {
    const e=byId(id);if(!e)return;const page=e.closest('.pg');if(!page)return;
    const pane=e.closest('.tp');const t=pane&&[...page.querySelectorAll('.tab')].find(t=>t.getAttribute('aria-controls')===pane.id);t?.click();
    for(let parent=e.parentElement;parent&&parent!==page;parent=parent.parentElement){if(parent.tagName==='DETAILS')parent.open=true;if(parent.classList.contains('pb'))parent.classList.add('open');}
    e.scrollIntoView({block:'center',behavior:'smooth'});e.focus({preventScroll:true});
  }

  const duplicateConditions = [['Hipertireoidismo','hipertireoide'],['Pré-eclâmpsia grave/eclâmpsia anterior','peprev'],['Óbito fetal anterior','obito']];
  function syncRiskDuplicates(importExisting=false) {
    duplicateConditions.forEach(([text,key])=>{
      const auto=document.querySelector(`#pna-comorbidades-list [data-comorb="${key}"]`),manual=[...document.querySelectorAll('.pna-risco-item')].find(e=>normal(e.closest('label')?.textContent.trim())===normal(text));
      if(!auto||!manual)return;if(importExisting&&manual.checked)auto.checked=true;manual.checked=false;
    });
  }
  function setupRisk() {
    const card=byId('pna-risco-automatico')?.closest('.card');if(!card)return;
    card.classList.add('ux-risk-card');const heading=card.querySelector('.ct');heading?.classList.add('ux-risk-title');
    if(heading){heading.replaceChildren(make('span','','Risco gestacional'),make('span','ux-calculated','Calculado pelo sistema'));}
    const instruction=card.querySelector(':scope>.alert');if(instruction){instruction.className='ux-risk-instruction';instruction.textContent='Você informa e revisa os dados; o sistema calcula o risco. Campos em branco ainda precisam de avaliação.';}
    const status=make('strong','ux-risk-state');status.id='ux-risk-state';status.setAttribute('role','status');
    const overview=make('div','ux-risk-overview'),completeness=make('div','ux-risk-completeness');completeness.append(status,make('span','ux-help','Campos em branco não são avaliados. Confira a completude do atendimento.'));
    const result=byId('pna-risco-automatico');result.before(overview);overview.append(result,completeness);
    const details=make('details','ux-risk-additional'),summary=make('summary','','Conferir condições adicionais'),description=make('p','ux-help','Marque somente condições avaliadas que ainda não constam na anamnese.');
    details.append(summary,description);
    const lists=make('div','ux-risk-options');
    [...card.querySelectorAll(':scope>.pb')].forEach(pb=>{const list=pb.querySelector('.cklist');if(list)lists.append(list);pb.remove();});
    details.append(lists);byId('pna-risco-motivos').after(details);
    duplicateConditions.forEach(([text,key])=>{
      const manual=[...lists.querySelectorAll('.pna-risco-item')].find(e=>normal(e.closest('label')?.textContent.trim())===normal(text));
      if(manual){manual.closest('label').hidden=true;manual.disabled=true;}
    });
    const radios=card.querySelector('input[name="risco-pna"]')?.closest('.rpills');
    if(radios){radios.hidden=true;radios.previousElementSibling?.remove();radios.querySelectorAll('input').forEach(e=>e.disabled=true);}
    const label=make('label','ux-risk-confirm'),check=make('input');check.type='checkbox';check.id='ux-risk-reviewed';
    const copy=make('span','','Conferi os dados utilizados na classificação.');copy.append(make('small','ux-help','Esta conferência não preenche nem valida campos que ficaram em branco.'));label.append(check,copy);
    const review=make('div','ux-risk-review'),reviewHead=make('div','ux-risk-review-heading'),reviewStatus=make('span','ux-review-status');reviewStatus.id='ux-risk-review-status';reviewStatus.setAttribute('role','status');reviewHead.append(make('strong','','Conferência do profissional'),reviewStatus);review.append(reviewHead,label);details.after(review);
    const references=make('details','ux-risk-references');references.append(make('summary','','Consultar protocolo de referência'));references.id='ux-risk-references';
    const originalSource=byId('pna-risco-conduta')?.nextElementSibling;if(originalSource?.textContent.trim().startsWith('Fonte:'))references.append(originalSource);card.append(references);
    const documentCard=byId('pna-dmg-doc-status')?.closest('.card');if(documentCard){const documents=make('details','ux-documents'),summary=make('summary','','Documentos para diabetes gestacional');documentCard.before(documents);documents.append(summary,documentCard);documentCard.querySelector('.ct')?.remove();}
    syncRiskDuplicates(true);
  }
  function criterionOrigin(motive) {
    const m=normal(motive),map=[[/^idade /,'pna-idade'],[/escolaridade/,'pna-escol'],[/gestante negra/,'pna-raca'],[/migrante/,'pna-imig'],[/abortos/,'pna-a'],[/cesareas/,'pna-ces'],[/obesidade/,'pna-imc'],[/pela pa/,'pna-pa']];
    for(const [rx,id] of map)if(rx.test(m))return byId(id);
    const conditions=[[/hipertensao arterial cronica/,'has'],[/diabetes mellitus/,'dm'],[/cardiopatia/,'cardio'],[/nefropatia/,'nefro'],[/neurologica|epilepsia/,'epilepsia'],[/cirurgia uterina/,'utero'],[/^hiv$/,'hiv'],[/^hipertireoidismo/,'hipertireoide'],[/^hipotireoidismo;/,'hipotireoide'],[/^pre-eclampsia/,'peprev'],[/^obito fetal/,'obito']];
    for(const [rx,key] of conditions)if(rx.test(m))return document.querySelector(`#pna-comorbidades-list [data-comorb="${key}"]`);
    if(m.startsWith('teste rapido')){const group=m.includes('hiv')?'hiv1':m.includes('sifilis')?'sif':null;const inputs=[...document.querySelectorAll('#tr-p-testes input,#tr-p-testes select')];return inputs.find(e=>group&&e.id.includes(group))||inputs.find(e=>e.value==='REAGENTE')||inputs[0];}
    return [...document.querySelectorAll('.pna-risco-item')].find(e=>normal(e.closest('label')?.textContent.trim())===m);
  }
  function renderRisk(risk) {
    if(!ready||!byId('ux-risk-state'))return;lastRisk=risk;
    const result=byId('pna-risco-automatico'),reasons=byId('pna-risco-motivos'),review=byId('ux-risk-reviewed');
    const signature=JSON.stringify({level:risk.nivel,criteria:risk.criterios});
    if(riskSignature&&riskSignature!==signature)review.checked=false;riskSignature=signature;
    const empty=risk.nivel==='nao-classificado';if(empty)review.checked=false;review.disabled=empty;
    byId('ux-risk-state').textContent=empty?'Ainda não avaliado':'Completude a conferir';
    byId('ux-risk-review-status').textContent=review.checked?'Dados revisados':'Pendente';byId('ux-risk-review-status').dataset.reviewed=String(review.checked);
    result.className='ux-risk-result';result.style.cssText='';
    const tag=make('strong',`ux-risk-tag ux-risk-${risk.nivel}`,empty?'Não classificado':risk.label);
    result.replaceChildren(tag,make('span','ux-help',empty?'Preencha os dados para iniciar a avaliação.':'Resultado com os dados informados.'));
    // Keep clinical guidance visible; consolidate only its repeated bibliography.
    const conduta=byId('pna-risco-conduta');[...(conduta?.children||[])].filter(e=>e.textContent.trim().startsWith('Fonte:')).forEach(e=>{const references=byId('ux-risk-references');if(references&&!references.querySelector('[data-current-source]')){const source=make('p','ux-help');source.dataset.currentSource='1';source.textContent=e.textContent;references.append(source);}e.remove();});
    reasons.replaceChildren();
    if(risk.criterios.length){
      reasons.append(make('div','ux-origin-heading','O que definiu este resultado'));
      risk.criterios.forEach(c=>{
        const row=make('div','ux-criterion'),text=make('div','',c.motivo),source=criterionOrigin(c.motivo);
        const pane=source?.closest('.tp'),tabButton=pane&&document.querySelector(`[aria-controls="${pane.id}"]`);
        text.append(make('small','ux-origin',source?.classList.contains('pna-risco-item')?'Condição adicional informada':tabButton?.textContent.trim()||'Dados da consulta'));
        row.append(text);if(source?.id){const button=make('button','ux-link','Ver origem');button.type='button';button.onclick=()=>reveal(source.id);row.append(button);}reasons.append(row);
      });
    } else if(!empty) reasons.append(make('p','ux-help','Nenhum critério intermediário ou alto identificado nos dados informados. A avaliação ainda precisa ser conferida.'));
  }

  // The native fields remain canonical. Hidden legacy chips retain alert compatibility,
  // but are excluded from the exam prose to avoid repeating the same observation.
  function setupExam() {
    ['pna','pnc'].forEach(p=>{
      const guide=byId(`clinical-guide-${p}-exam`);if(!guide)return;
      const groups=[...guide.querySelectorAll('.clinical-group')];
      const edema=byId(`${p}-edema`),limbs=groups.find(g=>g.querySelector('.clinical-group-title')?.textContent.trim()==='MMII');
      if(edema&&limbs){
        limbs.querySelectorAll('.clinical-chip').forEach(b=>{if(/edema/i.test(b.dataset.text)){b.hidden=true;b.dataset.uxDerived='edema';}});
        const host=edema.closest('.f');host.classList.add('ux-exam-field');limbs.querySelector('.clinical-options').before(host);
        edema.options[0].textContent='Não avaliado';
      }
      if(p==='pna'){
        const general=byId('pna-eg'),muc=byId('pna-muc'),group=groups[0];
        if(!general||!muc||!group)return;
        group.querySelectorAll('.clinical-chip').forEach(b=>{b.hidden=true;b.dataset.uxDerived='general';});
        const fields=make('div','g2 ux-exam-fields');fields.append(general.closest('.f'),muc.closest('.f'));group.append(fields);
        general.placeholder='Descreva o estado geral observado';muc.options[0].textContent='Não avaliado';
        const list=make('datalist');list.id='ux-general-options';['BEG, orientada, eupneica','MEG'].forEach(value=>{const option=make('option');option.value=value;list.append(option);});general.setAttribute('list',list.id);general.after(list);
      }
    });
  }
  function syncExam(p) {
    if(!['pna','pnc'].includes(p))return;
    const guide=byId(`clinical-guide-${p}-exam`);if(!guide)return;
    const edema=byId(`${p}-edema`)?.value||'',muc=byId('pna-muc')?.value||'',general=byId('pna-eg')?.value||'';
    guide.querySelectorAll('[data-ux-derived]').forEach(b=>{
      let selected=false;
      if(b.dataset.uxDerived==='edema')selected=edema==='Ausente'?b.dataset.text.startsWith('Sem edema'):edema.includes('/4+')&&b.dataset.text===`Edema ${edema}`;
      else if(b.dataset.text==='MEG')selected=/^meg\b/i.test(general.trim());
      else if(b.dataset.text.startsWith('Descorada'))selected=b.dataset.text.replace('Descorada','Hipocoradas')===muc;
      b.classList.toggle('selected',!!selected);
    });
  }
  function clearGuide(p,kind) {
    if(kind!=='exam')return;
    const guide=byId(`clinical-guide-${p}-exam`);if(!guide)return;
    guide.querySelectorAll('.ux-exam-field input,.ux-exam-field select,.ux-exam-fields input,.ux-exam-fields select').forEach(e=>e.value='');
  }
  function refreshChips(page) {
    page?.querySelectorAll('.clinical-chip,.complaint-chip,.alert-chip,.quick-care').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('selected'))));
  }

  function soapPane(page=pageNow()) { const ids=typeof SOAP_IDS_MODULO==='undefined'?null:SOAP_IDS_MODULO[prefix(page)];return byId(ids?.s)?.closest('.tp'); }
  function reviewing(page=pageNow()) { return !!soapPane(page)?.classList.contains('on'); }
  function reviewRecord() {
    const page=pageNow(),pane=soapPane(page);if(!pane)return;
    if(!obterSOAPLocalAtual().trim())quickGerarSoap();
    const tabButton=[...page.querySelectorAll('.tab')].find(t=>t.getAttribute('aria-controls')===pane.id);tabButton?.click();
    pane.scrollIntoView({block:'start',behavior:'smooth'});updateActions();
  }
  function closeMenus() { document.querySelectorAll('#quick-actions details').forEach(d=>d.open=false); }
  function setupActions() {
    const bar=byId('quick-actions');if(!bar)return;
    const completion=bar.querySelector('.quick-completion'),mode=byId('quick-soap-mode'),ai=bar.querySelector('.ai');
    const status=make('span','ux-save-state');status.id='ux-save-state';status.setAttribute('role','status');
    const primary=make('button','quick-action-btn primary','Revisar registro');primary.id='ux-primary';primary.type='button';primary.onclick=()=>{closeMenus();reviewing()?quickSalvar():reviewRecord();};
    const copy=make('details','ux-action-menu ux-copy-menu'),copyTitle=make('summary','','Copiar'),copyBody=make('div','ux-action-popover');copy.append(copyTitle,copyBody);
    const label=make('label','','Conteúdo da cópia'),format=make('select');format.id='ux-copy-format';label.htmlFor=format.id;
    [['soap','Somente SOAP'],['pending','SOAP + pendências'],['sae','SOAP + SAE']].forEach(([value,text])=>{const option=make('option','',text);option.value=value;format.append(option);});
    const copyButton=make('button','quick-action-btn','Copiar texto');copyButton.type='button';copyButton.onclick=()=>{({soap:quickCopiarEvolucao,pending:quickCopiarSoapPendencias,sae:quickCopiarSoapSae}[format.value])();closeMenus();};copyBody.append(label,format,copyButton);
    const more=make('details','ux-action-menu'),moreTitle=make('summary','','Mais ações'),moreBody=make('div','ux-action-popover');more.append(moreTitle,moreBody);
    const regenerate=make('button','quick-action-btn','Gerar / atualizar SOAP');regenerate.type='button';regenerate.onclick=()=>{closeMenus();quickGerarSoap();setTimeout(updateActions,180);};
    const modeLabel=make('label','','Formato do SOAP');modeLabel.htmlFor='quick-soap-mode';mode.setAttribute('aria-label','Formato do SOAP');
    const clear=make('button','quick-action-btn ux-clear','Limpar atendimento');clear.type='button';clear.onclick=()=>quickLimpar();
    ai.textContent='Melhorar redação com IA';moreBody.append(modeLabel,mode,regenerate,ai,completion,clear);
    bar.replaceChildren(status,more,copy,primary);
    bar.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)bar.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false;});}));
    document.addEventListener('click',e=>{if(!e.target.closest('#quick-actions'))closeMenus();});
    document.querySelectorAll('.pg .save-atend-btn').forEach(b=>b.classList.add('ux-duplicate-action'));
    document.querySelectorAll('.pg button').forEach(b=>{if(/^(copiarTudo|copiarSOAP|copiarSoap)\(/.test(b.getAttribute('onclick')||''))b.classList.add('ux-duplicate-action');});
    resizeObserver=new ResizeObserver(()=>document.body.style.setProperty('--ux-actions-height',`${bar.getBoundingClientRect().height}px`));resizeObserver.observe(bar);
  }
  function updateActions() {
    if(!ready)return;const page=pageNow(),review=reviewing(page),primary=byId('ux-primary');
    if(primary)primary.textContent=review?'Salvar atendimento':'Revisar registro';
    const copy=document.querySelector('.ux-copy-menu');if(copy)copy.hidden=!review;
    const ai=document.querySelector('#quick-actions .ai');if(ai){ai.hidden=!review;if(!ai.disabled)ai.textContent='Melhorar redação com IA';}
    document.body.classList.toggle('ux-reviewing',review);updateSaveState();
  }
  function onNavigate(page) {
    if(!ready||!page)return;
    document.querySelectorAll('.bar-nav .nb[data-ux-page]').forEach(b=>{const on=`pg-${b.dataset.uxPage}`===page.id;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    renderFavorites();const current=navButtons.get(page.id.slice(3));const group=current?.closest('.ux-nav-group');if(group)group.open=true;
    updatePatient(page);updateTabs(page);refreshChips(page);refreshAdminTests();
  }
  function setup() {
    document.body.classList.add('ux-compact','ux-prumo');
    document.querySelectorAll('.pg').forEach(page=>{
      const controls=[...page.querySelectorAll('input,select,textarea')];legacy.set(page.id,controls);
      controls.forEach((e,i)=>{if(!e.id&&!['file','password'].includes(e.type))e.id=`ux-field-${page.id}-${i}`;});
      page.querySelectorAll('.clinical-chip,.complaint-chip,.alert-chip,.quick-care').forEach((e,i)=>e.dataset.uxKey=`${page.id}:${i}`);
      initial.set(page.id,collectValues(page));
    });
    prepareTabs();setupNavigation();setupRisk();setupExam();document.querySelectorAll('.pg').forEach(setupPatient);setupActions();setupAdminTests();labelFields();
    document.querySelectorAll('.pb-head').forEach(head=>{if(head.tagName==='BUTTON')return;head.setAttribute('role','button');head.tabIndex=0;head.setAttribute('aria-expanded',String(head.closest('.pb').classList.contains('open')));head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();head.click();}});head.addEventListener('click',()=>head.setAttribute('aria-expanded',String(head.closest('.pb').classList.contains('open'))));});
    document.addEventListener('input',onFieldEvent,true);document.addEventListener('change',onFieldEvent,true);
    document.addEventListener('click',event=>{
      const button=event.target.closest('.clinical-chip,.complaint-chip,.alert-chip,.quick-care');if(!button)return;
      const page=button.closest('.pg');touch(page,button);recalculate(page);saveDraft(page);
    });
    document.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.getAttribute('onclick')?.startsWith('limparResultadosClinicos')){const page=button.closest('.pg');touch(page);saveDraft(page);}});
    window.addEventListener('pagehide',()=>saveDraft());
    ready=true;onNavigate(pageNow());avaliarProtocolosPna();byId('autosave-indicator')?.setAttribute('hidden','');
  }
  function onFieldEvent(event) {
    const e=event.target,page=e.closest?.('.pg');if(!prefix(page)||e.closest('.ux-draft-prompt')||e.classList.contains('ux-stage-select'))return;
    if(e.closest('#pna-comorbidades-list'))syncRiskDuplicates();
    touch(page,e);syncExam(prefix(page));
    if(e.id==='ux-risk-reviewed'&&lastRisk)renderRisk(lastRisk);
    if(e.id===`${prefix(page)}-edema`||['pna-eg','pna-muc'].includes(e.id))atualizarAlertaClinico(prefix(page));
    clearTimeout(autoDraftTimer);autoDraftTimer=setTimeout(()=>saveDraft(page),1200);
  }
  window.ESFUsability={capture,restore,beforeRestore,clearGuide,saveDraft,offerDraft,beforeNavigate,onNavigate,onSaved,updateSaveState,updateNavigation,updateTabs,updateActions,renderRisk,clearConsultation,
    legacyControls:p=>legacy.get('pg-'+moduloPorPrefixo(p)?.page),reveal,refresh:()=>{if(!ready)return;document.querySelectorAll('.pg').forEach(refreshChips);labelFields();onNavigate(pageNow());},refreshNavigation:()=>{if(!ready)return;renderFavorites();refreshAdminTests();}};
  document.addEventListener('DOMContentLoaded',setup);
})();
