/* Interação acessível, completude explícita e estado da revisão do atendimento. */
(function(){
  'use strict';
  const labelledControls=new WeakSet();
  function checkbox(id,text,host,change){
    if(!host||document.getElementById(id))return;
    const label=document.createElement('label');label.className='assessment-confirmation';
    const input=document.createElement('input');input.type='checkbox';input.id=id;input.addEventListener('change',change||(()=>{}));
    label.append(input,document.createTextNode(text));host.prepend(label);
  }
  function install(){
    checkbox('sm-avaliacao-confirmada','Concluí a avaliação de todos os itens do ERSM e de segurança; itens não marcados foram avaliados como ausentes.',document.getElementById('sm-2'),()=>calcERSM());
    checkbox('pu-avaliacao-confirmada','Revisei os critérios de risco da criança; os itens não marcados foram avaliados como ausentes.',document.getElementById('pu-risco-resultado')?.parentElement,()=>calcRisco());
    checkbox('vd-avaliacao-confirmada','Revisei as quatro dimensões de risco da visita e confirmei a ausência dos fatores não marcados.',document.getElementById('vd-risco-painel')?.parentElement,()=>classificarRiscoVD());
    checkbox('ger-avaliacao-confirmada','Avaliei os sinais de alerta da queixa e confirmei os achados registrados.',document.getElementById('ger-demanda-painel')?.parentElement,()=>avaliarDemandaEspontanea());
    checkbox('id-humor-confirmado','Avaliei todas as perguntas deste rastreio breve de humor.',document.getElementById('gds-score')?.parentElement);
    if(typeof SOAP_IDS_MODULO!=='undefined')Object.entries(SOAP_IDS_MODULO).forEach(([p,ids])=>{
      const plan=document.getElementById(ids.p);if(!plan||document.getElementById(p+'-plano-confirmado'))return;
      const section=document.createElement('div');section.className='plan-review';plan.parentElement.insertAdjacentElement('afterend',section);
      checkbox(p+'-plano-confirmado','Revisei o SOAP e confirmei o plano e as ações efetivamente definidas para este atendimento.',section);
      const details=document.createElement('details');details.innerHTML=`<summary>Justificativa clínica para pendências ou exceções</summary><label for="${p}-revisao-justificativa">Descreva o motivo específico e a decisão profissional</label><textarea id="${p}-revisao-justificativa" placeholder="Preencha quando houver uma pendência que precisa permanecer no registro."></textarea>`;section.append(details);
    });
    // Keep the primary actions visible; move the remaining tools into an explicit menu.
    const bar=document.getElementById('quick-actions');
    if(bar&&!bar.dataset.organized){
      bar.dataset.organized='1';const details=document.createElement('details');details.className='quick-more';details.innerHTML='<summary>Mais ações</summary><div class="quick-more-panel"></div>';
      const panel=details.lastElementChild;
      [...bar.children].forEach(el=>{if(el.matches('.quick-action-btn')&&!/quickGerarSoap|quickSalvar|quickCopiarEvolucao/.test(el.getAttribute('onclick')||''))panel.append(el);});bar.append(details);
    }
    if(!document.getElementById('mobile-menu-button')){
      const b=document.createElement('button');b.type='button';b.id='mobile-menu-button';b.textContent='☰ Menu';b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Abrir menu de módulos');b.onclick=()=>{const open=document.body.classList.toggle('mobile-menu-open');b.setAttribute('aria-expanded',String(open));};document.body.append(b);
      const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='mobile-menu-backdrop';backdrop.setAttribute('aria-label','Fechar menu');backdrop.onclick=()=>{document.body.classList.remove('mobile-menu-open');b.setAttribute('aria-expanded','false');};document.body.append(backdrop);
    }
    labelControls();labelTabs();
  }
  function labelControls(){
    document.querySelectorAll('input,select,textarea').forEach((e,i)=>{
      if(labelledControls.has(e))return;labelledControls.add(e);
      if(!e.id){let id='accessible-field-'+i,n=1;while(document.getElementById(id))id='accessible-field-'+i+'-'+n++;e.id=id;}
      if(e.type==='hidden'||e.labels?.length||e.hasAttribute('aria-label')||e.hasAttribute('aria-labelledby'))return;
      const field=e.closest('.f,.field,.edit-field,.auth-field,.appearance-field,.guided-exam-item'),label=field?.querySelector('label');
      if(label&&field.querySelectorAll('input:not([type=hidden]),select,textarea').length===1){if(!e.id)e.id='accessible-field-'+i;label.htmlFor=e.id;return;}
      const td=e.closest('td'),tr=td?.parentElement,table=td?.closest('table');
      const column=td?[...tr.children].indexOf(td):-1;
      const name=[e.closest('.ex-row')?.querySelector('.ex-name')?.textContent,field?.querySelector('strong')?.textContent,td?tr.querySelector('td')?.textContent:'',column>=0?table?.querySelectorAll('thead th')[column]?.textContent:'',e.getAttribute('placeholder'),e.getAttribute('title')].filter(Boolean).map(t=>t.trim()).filter(Boolean).join(' — ');
      if(name)e.setAttribute('aria-label',name);else if(e.id==='quick-soap-mode')e.setAttribute('aria-label','Formato do SOAP');
      else if(e.id==='hist-filtro-tipo')e.setAttribute('aria-label','Filtrar histórico por tipo de consulta');
      else if(e.id==='hist-filtro-user')e.setAttribute('aria-label','Filtrar histórico por profissional');
    });
  }
  function labelTabs(){
    document.querySelectorAll('.tab').forEach((e,i)=>{
      e.setAttribute('role','tab');e.setAttribute('aria-selected',String(e.classList.contains('on')));e.tabIndex=e.classList.contains('on')?0:-1;
      e.parentElement.setAttribute('role','tablist');
      if(!e.id)e.id='accessible-tab-'+i;
      const target=(e.getAttribute('onclick')||'').match(/tab\(this,\s*['"]([^'"]+)/)?.[1];
      if(target){e.setAttribute('aria-controls',target);const panel=document.getElementById(target);if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',e.id);}}
    });
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){document.body.classList.remove('mobile-menu-open');document.getElementById('mobile-menu-button')?.setAttribute('aria-expanded','false');}
    const tab=e.target.closest?.('[role="tab"]');if(!tab)return;
    const tabs=[...tab.parentElement.querySelectorAll('.tab')],index=tabs.indexOf(tab);
    if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[n].click();tabs[n].focus();labelTabs();}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();tab.click();labelTabs();}
  });
  document.addEventListener('click',e=>{
    if(e.target.closest?.('.tab'))labelTabs();
    if(e.target.closest?.('.bar [onclick*="go("]')&&innerWidth<=700){document.body.classList.remove('mobile-menu-open');document.getElementById('mobile-menu-button')?.setAttribute('aria-expanded','false');}
  });
  function invalidate(e){
    const page=e.target.closest?.('.pg');if(!page||/plano-confirmado|revisao-justificativa/.test(e.target.id))return;
    page.querySelectorAll('[id$="-plano-confirmado"]').forEach(c=>c.checked=false);
    if(e.target.id.startsWith('ger-')&&typeof avaliarDemandaEspontanea==='function')avaliarDemandaEspontanea();
    if(e.target.matches('.gds,#id-humor-confirmado')){
      const total=document.querySelectorAll('.gds:checked').length,out=document.getElementById('gds-score');
      if(out)out.textContent=document.getElementById('id-humor-confirmado')?.checked?`Rastreio breve de humor: ${total} / 5 (não substitui a GDS-15)`:`Rastreio não concluído; ${total} sinal(is) marcado(s).`;
    }
  }
  document.addEventListener('input',invalidate);document.addEventListener('change',invalidate);
  let scheduled=false;
  document.addEventListener('DOMContentLoaded',()=>{
    install();setTimeout(install,1000);
    new MutationObserver(ms=>{if(scheduled||!ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches('input,select,textarea,.tab,.pg')||n.querySelector('input,select,textarea,.tab')))))return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;install();});}).observe(document.body,{childList:true,subtree:true});
  });
})();
