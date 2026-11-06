/* Navigation by reason. Hiding a stage never clears or changes clinical answers. */
(()=>{
  'use strict';
  const byId=id=>document.getElementById(id),models=new Map();
  const motives={
    smu:[['corrimento','Corrimento / leucorreia'],['itu','Queixa urinária'],['iniciar','Iniciar anticoncepcional'],['trocar','Trocar anticoncepcional'],['acompanhar','Acompanhar método'],['preconcepcao','Desejo engravidar'],['emergencia','Contracepção de emergência'],['gestante','Queixa ginecológica na gestação']],
    pna:[['rotina','Iniciar pré-natal'],['corrimento','Pré-natal com corrimento'],['itu','Pré-natal com queixa urinária'],['exames','Revisar / programar exames']],
    pnc:[['rotina','Acompanhamento pré-natal'],['corrimento','Pré-natal com corrimento'],['itu','Pré-natal com queixa urinária'],['exames','Revisar / programar exames']],
    ger:[['aguda','Queixa aguda'],['itu','Queixa urinária'],['retorno','Retorno / resultados de exames'],['seguimento','Acompanhamento de condição crônica']],
    prev:[['rotina','Rastreamento de rotina'],['resultado','Repetir coleta após exame alterado'],['seguimento','Seguimento após colposcopia ou tratamento'],['sintomas','Queixa ginecológica durante o rastreamento']],
    pu:[['rotina','Crescimento e desenvolvimento'],['alimentacao','Alimentação / amamentação'],['sintomas','Criança com sintomas']],
    id:[['rotina','Avaliação integral'],['quedas','Quedas / mobilidade'],['memoria','Memória / funcionalidade'],['medicamentos','Revisão de medicamentos']],
    sm:[['acolhimento','Primeiro acolhimento'],['retorno','Acompanhamento'],['crise','Crise / necessidade imediata']],
    hip:[['rotina','Acompanhamento de hipertensão / diabetes'],['sintomas','Sintomas / descompensação'],['exames','Revisão de exames']],
    fer:[['inicial','Avaliação inicial da ferida'],['retorno','Reavaliação / curativo'],['piora','Piora / sinais de infecção']],
    puerp:[['rotina','Acompanhamento puerperal'],['amamentacao','Dificuldade na amamentação'],['sintomas','Queixa no puerpério']],
    ist:[['testagem','Testagem / exposição'],['sintomas','Sinais ou sintomas'],['seguimento','Seguimento de resultado / tratamento']],
    vd:[['rotina','Visita programada'],['cuidados','Dependência / plano de cuidados'],['sintomas','Nova queixa no domicílio']]
  };
  const help={
    corrimento:'Caracterize aspecto, cor, odor, prurido e sintomas associados. Registre gestação, sinais de alarme e achados do exame antes de confirmar hipótese e tratamento.',
    itu:'Registre início, sintomas urinários, febre, dor lombar, gestação, episódios anteriores e antibióticos recentes. O kit diferencia as indicações de EAS e urocultura.',
    iniciar:'Registre a preferência da usuária, possibilidade de gestação, PA, antecedentes e medicamentos. Compare elegibilidade e métodos antes de confirmar a escolha.',
    trocar:'Registre o método atual, motivo da troca, última utilização, preferência e possibilidade de gestação. Revise elegibilidade e orientação de transição.',
    acompanhar:'Registre método em uso, adesão, efeitos adversos, intercorrências e preferência. Revise as condições de elegibilidade.',
    exames:'Confira resultados e pedidos anteriores. Separe exames já realizados daqueles que ainda precisam ser solicitados; confira as datas-alvo.',
    resultado:'Identifique o exame, a data e o resultado. Registre a avaliação e o seguimento indicado, sem repetir automaticamente a coleta.',
    sintomas:'Caracterize o sintoma e avalie sinais de alarme antes de seguir o atendimento de rotina.',
    crise:'Priorize a avaliação de segurança, risco imediato e necessidade de atendimento/encaminhamento. O preenchimento não deve atrasar a assistência.',
    piora:'Avalie sinais de infecção e comprometimento sistêmico antes de seguir o curativo de rotina.'
  };
  function value(p,k){return byId(p+'-guide-'+k);}
  function stages(p){const m=models.get(p),reason=value(p,'motivo').value;if(p!=='smu'||!reason||reason==='outro')return m.tabs;
    return m.tabs.filter(t=>!['smu-corrimento','smu-contracepcao'].includes(t.getAttribute('aria-controls'))||t.getAttribute('aria-controls')===(['iniciar','trocar','acompanhar','emergencia'].includes(reason)?'smu-contracepcao':['corrimento','gestante'].includes(reason)?'smu-corrimento':''));
  }
  function refresh(p){
    const m=models.get(p);if(!m)return;const reason=value(p,'motivo').value,full=value(p,'completo').checked||!reason||reason==='outro',visible=full?m.tabs:stages(p);
    m.page.classList.toggle('guided-consultation',!full);
    m.rail.replaceChildren();
    visible.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='guide-step';b.textContent=(i+1)+'. '+t.textContent.trim();b.dataset.guideTarget=t.getAttribute('aria-controls');b.setAttribute('aria-current',t.classList.contains('on')?'step':'false');b.onclick=()=>t.click();m.rail.append(b);});
    m.rail.hidden=full;
    m.hint.textContent=reason?(help[reason]||'Registre o motivo, os achados relevantes, a avaliação e o plano. As etapas mantêm identificação, avaliação de risco e revisão do SOAP.'):'Escolha o motivo para organizar as etapas. Para demandas combinadas, use “Ver formulário completo”.';
    const native=byId('smu-motivo-consulta');if(p==='smu'&&native)native.closest('.f').classList.toggle('guide-hidden',!full);
    if(p==='ger'){
      for(const key of ['habitos','familiar','social']){
        const field=byId('ger-'+key);
        field?.closest('.f')?.classList.toggle('guide-hidden',!full&&['aguda','itu'].includes(reason)&&!field.value.trim());
      }
    }
    if(p==='smu'){
      const showing={
        'smu-contra-cigarros':byId('smu-contra-fuma')?.value==='Sim',
        'smu-contra-diasparto':['lt6','6a6','gt6'].includes(byId('smu-contra-posparto')?.value),
        'smu-contra-exclusiva':byId('smu-lactante')?.value==='Sim',
        'smu-contra-apresentacao':byId('smu-contra-metodo')?.value==='mensal',
        'smu-ig':byId('smu-gestante')?.value==='Sim'
      };
      for(const [id,needed] of Object.entries(showing)){
        const field=byId(id);
        field?.closest('.f')?.classList.toggle('guide-hidden',!full&&!needed&&!field.value);
      }
      const references=byId('smu-exames-mulher')?.querySelectorAll(':scope > .smu-card')||[];
      for(const card of references){
        const title=card.querySelector('h3')?.textContent;
        const required={'Pré-concepção':['preconcepcao'],'Contracepção de emergência':['emergencia'],'Gestantes e demais demandas':['gestante','itu']}[title];
        const previous=title==='Exames conforme indicação clínica'&&![...card.querySelectorAll('select,textarea')].some(control=>control.value);
        card.classList.toggle('guide-hidden',!full&&(previous||Boolean(required&&!required.includes(reason))));
      }
    }
    if(['pna','pnc'].includes(p)){const panel=byId(p+'-corr-painel');panel?.classList.toggle('guide-hidden',!full&&reason!=='corrimento'&&byId(p+'-corr-ativo')?.value!=='Sim');}
    const exam=byId(p+'-exkit-painel');m.exam.hidden=!exam||!reason;m.start.hidden=!reason;
    m.extra.hidden=full||visible.some(t=>t.classList.contains('on'));
    m.page.querySelectorAll('.ux-stage-select option').forEach(o=>{o.hidden=!full&&!visible.some(t=>t.getAttribute('aria-controls')===o.value);});
  }
  function reset(p){if(!models.has(p))return;value(p,'motivo').value='';value(p,'completo').checked=false;refresh(p);}
  function choose(p){
    const reason=value(p,'motivo').value;
    if(p==='prev'){
      const code={rotina:'rastr',resultado:'repet',seguimento:'segs'}[reason];
      const native=code&&document.querySelector(`input[name="prev-motivo"][value="${code}"]`);
      if(native&&!native.checked)native.click();
    }
    if(p==='smu'&&reason&&reason!=='outro'){
      const native=byId('smu-motivo-consulta');native.value=['corrimento','itu'].includes(reason)?'queixa':reason;native.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if(['pna','pnc'].includes(p)&&reason==='corrimento'){const active=byId(p+'-corr-ativo');active.value='Sim';active.dispatchEvent(new Event('change',{bubbles:true}));}
    const select=byId(p+'-exkit-kit');if(select){const c=window.ESFExames.context(p);const kit=['itu','corrimento'].includes(reason)?reason:['iniciar','trocar','acompanhar','emergencia'].includes(reason)?'contracepcao':['pna','pnc'].includes(p)&&Number.isFinite(c.ig)?c.ig<14?'pn1':c.ig<28?'pn2':'pn3':'';if(kit){select.value=kit;window.ESFExames.render(p);}}
    refresh(p);
  }
  function mount(){
    for(const [id,p]of Object.entries(QUICK_PAGE_PREFIX)){
      const page=byId(id),tabs=[...(page?.querySelectorAll('.tabs .tab')||[])];if(!tabs.length)continue;
      const root=document.createElement('section');root.className='consultation-guide';root.setAttribute('aria-label','Organizar consulta por motivo');
      root.innerHTML=`<div class="guide-title"><h3>O que trouxe a pessoa à UBS hoje?</h3></div><div class="guide-choice"><div class="f"><label for="${p}-guide-motivo">Motivo principal deste atendimento</label><select id="${p}-guide-motivo"><option value="">Selecionar motivo</option>${(motives[p]||[]).concat([['outro','Outro motivo / várias demandas']]).map(([v,label])=>`<option value="${v}">${label}</option>`).join('')}</select></div><label class="guide-full"><input type="checkbox" id="${p}-guide-completo"> Ver formulário completo</label></div><p class="guide-hint"></p><div class="guide-actions"><button type="button" class="btn btn-p" data-guide-start hidden>Começar avaliação</button><button type="button" class="btn btn-s" data-guide-exams hidden>Revisar exames indicados</button></div><nav class="guide-steps" aria-label="Etapas para o motivo selecionado"></nav><p class="guide-extra" hidden>Você abriu uma etapa adicional. Os dados são preservados; use “Ver formulário completo” para consultar todas as etapas.</p>`;
      page.querySelector('.tabs').before(root);
      const m={page,tabs,root,rail:root.querySelector('.guide-steps'),hint:root.querySelector('.guide-hint'),extra:root.querySelector('.guide-extra'),start:root.querySelector('[data-guide-start]'),exam:root.querySelector('[data-guide-exams]')};models.set(p,m);
      value(p,'motivo').addEventListener('change',()=>choose(p));value(p,'completo').addEventListener('change',()=>refresh(p));
      m.start.onclick=()=>{const t=tabs.find(t=>/(Avalia|Anamn|Queixa)/i.test(t.textContent))||tabs[1]||tabs[0];t.click();byId(t.getAttribute('aria-controls'))?.scrollIntoView({block:'start',behavior:'smooth'});};
      m.exam.onclick=()=>window.ESFExames?.open(p);
      if(p==='smu')page.addEventListener('change',event=>{if(['smu-contra-fuma','smu-contra-posparto','smu-lactante','smu-contra-metodo','smu-gestante'].includes(event.target.id))refresh(p);});
      page.querySelector('.tabs').addEventListener('click',()=>refresh(p));refresh(p);
    }
    const restore=window.restaurarDadosModulo;window.restaurarDadosModulo=function(p,...args){const result=restore.call(this,p,...args);refresh(p);return result;};
    matchMedia('(max-width:760px)').addEventListener('change',event=>{if(event.matches)alternarMenuLateral(true);});
  }
  window.ESFConsultaGuiada={refresh,reset};document.addEventListener('DOMContentLoaded',mount);
})();
