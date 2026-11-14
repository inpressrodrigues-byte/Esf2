/* Uma orientação por problema, no ponto em que a equipe registra a queixa. */
(()=>{
  'use strict';
  const R=window.ProtocoloConsulta;
  const byId=id=>document.getElementById(id);
  const value=(p,key)=>byId(p+'-'+key)?.value||'';
  const pages=new Map();
  const kinds=['queixa','queixas','queixa-principal','complaints','historia-atual','hma','sintomas','manual-queixa','problemas','diagnostico','diagnostico-confirmado','condicao-protocolar','queixa-sindrome','diagnostico-sindromico'];
  const legacyReasons={itu:'Queixa urinária',corrimento:'Corrimento',iniciar:'Iniciar anticoncepcional',trocar:'Trocar anticoncepcional',acompanhar:'Acompanhar método'};
  const ciapTerms={U01:'Disúria',U71:'Infecção urinária',X14:'Corrimento vaginal',X72:'Candidíase vulvovaginal',X73:'Tricomoníase',N01:'Cefaleia',A03:'Febre',D12:'Constipação',D11:'Diarreia',R02:'Dispneia',L03:'Dor lombar'};
  const binaryFindings={
    ist:{'dor-pelvica':'Dor pélvica',disuria:'Disúria',corrimento:'Corrimento vaginal'},
    hip:{'dor-toracica':'Dor torácica','falta-ar':'Dispneia',cefaleia:'Cefaleia',edema:'Edema','pe-diabetico':'Pé diabético',feridas:'Ferida'},
    puerp:{febre:'Febre',fissuras:'Aleitamento: fissura mamilar',ingurgitamento:'Aleitamento: ingurgitamento mamário'}
  };
  const assessment={pna:'3',pnc:'2',pu:'2',prev:'2',id:'2',sm:'2',vd:'aval',ist:'aval',smu:'aval',fer:'aval',hip:'aval',puerp:'aval'};
  function findings(p,page){
    if(!page)return '';
    const structured=[...page.querySelectorAll('.complaint-chip.selected,.clinical-chip.selected,[id$="-queixas-clin"] input:checked,[id$="-queixas-gin"] input:checked')].map(e=>e.dataset.text||e.closest('label')?.textContent||e.textContent);
    const content=[...kinds.map(key=>value(p,key)),value(p,'protocolo-queixas'),...structured].filter(Boolean);
    if(p==='pnc'&&window.FluxoAPS?.perdaAtiva()){
      const perda=value(p,'perda-tipo');
      if(/sangue/i.test(perda))content.push('sangramento vaginal');
      if(/líquido/i.test(perda))content.push('perda de líquido');
      if(/corrimento|tampão/i.test(perda))content.push(perda);
    }
    for(const [key,label] of Object.entries(binaryFindings[p]||{}))if(value(p,key)==='Sim')content.push(label);
    if(p==='puerp')content.push(value(p,'dor'),value(p,'sangramento'));
    if(p==='fer'&&value(p,'tipo'))content.push('Ferida '+value(p,'tipo'),value(p,'tecido'));
    return content.filter(Boolean).join('\n');
  }
  function inputText(p,page){
    const codes=(window.ESFCiap?.capture(p)||[]).map(item=>ciapTerms[item.code]||window.ESFCiap.description(item.code)).filter(Boolean);
    const content=[findings(p,page),...codes].filter(Boolean);
    if(!content.length&&value(p,'guide-motivo'))content.push(legacyReasons[value(p,'guide-motivo')]||'');
    return content.join('\n');
  }
  function addRef(title,url){return {title,url};}
  const dengueCampos=[
    ['grave','Choque, hemorragia grave ou disfunção grave de órgão'],
    ['alarme','Sinal de alarme (dor abdominal intensa contínua, vômitos persistentes, acúmulo de líquido, hipotensão postural, lipotimia, hepatomegalia, sangramento de mucosa, letargia, irritabilidade ou hematócrito em ascensão)'],
    ['especial','Sangramento cutâneo, prova do laço positiva, condição especial, comorbidade ou risco social']
  ];
  function dengue(p,ctx){
    const ler=k=>value(p,'dengue-'+k),grave=ler('grave'),alarme=ler('alarme'),especial=ler('especial');
    const grupo=grave==='Sim'?'D':grave!=='Não'?'':alarme==='Sim'?'C':alarme!=='Não'?'':especial==='Sim'||ctx.gestante==='Sim'?'B':especial==='Não'?'A':'';
    const item={dengue:true,grupo,title:'Dengue'+(grupo?' · Grupo '+grupo:''),refs:[addRef('Manejo por grupo · Ministério da Saúde','https://sisaps.saude.gov.br/sistemas/esusaps/docs/manual/PEC/PEC_13_sdc/')]};
    if(!grupo){item.care='Avalie gravidade, sinais de alarme e condições especiais para classificar. Se houver instabilidade, acione urgência imediatamente.';return item;}
    if(grupo==='D'||grupo==='C'){item.priority=grupo==='D'?'Emergência · iniciar estabilização e acionar remoção imediata.':'Urgência · iniciar manejo de sinais de alarme e encaminhar para atendimento hospitalar.';
      item.care='Monitorar perfusão e sinais vitais, obter acesso venoso e iniciar reposição conforme protocolo de urgência. A coleta de exames não deve atrasar a assistência.';return item;}
    item.care=grupo==='B'?'Manter em observação, iniciar hidratação e reavaliar com o hematócrito. Após liberação, reavaliar diariamente até 48 horas depois da queda da febre.':'Iniciar hidratação oral. Reavaliar quando a febre baixar ou no quinto dia de sintomas se a febre persistir.';
    item.medication='Sais de reidratação oral. Para dor ou febre, avaliar paracetamol ou dipirona conforme idade, contraindicações e protocolo aplicável. Evitar AAS e anti-inflamatórios.';
    item.exams=(grupo==='B'?'Solicitar hemograma completo. ':'Hemograma a critério clínico. ')+'Para investigação etiológica, NS1 ou RT-PCR até o 5º dia e sorologia a partir do 6º dia, conforme fluxo local.';
    item.note='Notificar a suspeita conforme o fluxo de vigilância. Orientar retorno imediato diante de sinais de alarme.';return item;
  }
  function activeDecisions(p,text,ctx){
    const current=R.positive(text).join(' | ');
    const priority=value(p,'prioridade');
    const immediate=priority==='Vermelho'||/anafilaxia|instabilidade hemodinamica|choque anafilatico/.test(current);
    const alerts=[...pages.get(p).page.querySelectorAll('.alert-chip.selected,[data-priority]:checked')].map(e=>R.norm(e.dataset.priority||e.textContent)).join(' ');
    const perigo=/sangramento intenso|instabilidade|choque|violencia sexual|dor pelvica importante|perda de liquido|vomitos? persistentes?|desidratacao|dor abdominal intensa|alteracao neurologica|saturacao baixa|dispneia intensa|dificuldade importante para engolir|edema de (?:lingua|glote)/;
    const redFlag=immediate||perigo.test(alerts)||perigo.test(current);
    const gestacao=ctx.gestante==='Sim'&&!ctx.pregnancyConflict;
    const pa=value(p,'pa').match(/(\d{2,3})\s*[x/]\s*(\d{2,3})/i);
    const obstetricos=[current];
    if(value(p,'sang-atual')==='Sim')obstetricos.push('sangramento vaginal');
    if(/diminu[ií]dos|ausentes/i.test(value(p,'mf')))obstetricos.push('movimentos fetais reduzidos');
    const declarados=R.norm(findings(p,pages.get(p).page));
    if(/(?:nao tolera liquidos|nao consegue ingerir)/.test(declarados))obstetricos.push('incapacidade de ingerir');
    const febre=Number((value(p,'temp')||'').replace(',','.'))>=38;
    const alarme=redFlag||ctx.alarmeGeral||febre||/febre|instabilidade|giordano|convulsao|hemorragia|dispneia intensa/.test(alerts)||value(p,'exkit-alerta')==='Sim'||(pa&&(Number(pa[1])>=140||Number(pa[2])>=90))||
      ['dor','perdaliquido','sangra','mobilizacao'].some(k=>value(p,'corr-'+k)==='Sim');
    const pn=gestacao?QueixasGestacao.avaliar(obstetricos.join(' | '),{ig:ctx.ig,alarme}):null;
    const output=pn?.items.slice()||[],matches=R.match(text);
    if(/\bdengue\b/.test(current)||/\bsuspeita (?:de )?dengue\b/.test(declarados)&&!/nega|descart|sem suspeita/.test(declarados))output.push(dengue(p,ctx));
    for(const rule of matches){
      if(pn?.cobertas.has(rule.title))continue;
      if(rule.kit==='itu'){output.push(R.urinary({...ctx,urgent:ctx.urgent||redFlag||pn?.alarme}));continue;}
      const item={title:rule.title,treatment:(!redFlag&&R.specificCare(rule.title,current,ctx))||rule.treatment,exams:rule.assessment,kit:rule.kit,refs:[addRef('Protocolo municipal · manejo p. '+rule.carePage,R.demanda+'#page='+rule.carePage)]};
      if(!redFlag&&!pn?.alarme) item.medication=R.medicacaoDemanda(rule.title,current,{...ctx,
        urgent:ctx.alarmeSistemico||ctx.febre&&rule.title!=='Febre'||ctx.urgent&&matches.some(r=>r.kit==='itu')});
      if(item.medication)item.refs.push(addRef('Quadro de prescrição · p. '+R.paginaMedicacao(rule.title),R.demanda+'#page='+R.paginaMedicacao(rule.title)));
      if(redFlag||pn?.alarme){
        item.kit=null;
        item.priority=immediate?'Atendimento imediato. Acionar a equipe e seguir o fluxo de urgência.':'Priorizar avaliação '+(gestacao?'médica/obstétrica':'médica')+' pelo sinal de alerta associado.';
        item.treatment=rule.care;
      }
      if(rule.kit==='corrimento'){
        const women=window.SaudeMulherRegras;
        const pattern={cand:/candidiase/,bv:/vaginose bacteriana/,tri:/tricomon[ií]ase/,cerv:/cervicite/};
        const diseases=Object.entries(pattern).filter(([,rx])=>rx.test(current));
        if(diseases.length===1&&women){
          const id=diseases[0][0];
          item.title=women.diseases[id].name+' · avaliação';
          const data=p==='smu'?ESFSaudeMulher.dischargeData():['pna','pnc'].includes(p)?ESFCorrimentoPN.data(p):{};
          const evaluation=women.discharge({...data,gestante:ctx.gestante,lactante:value(p,'lactante')||data.lactante,diagnostico:id});
          const first=evaluation.regimens[0];
          if(ctx.urgent||redFlag||pn?.alarme||evaluation.urgent.length)item.treatment='Priorizar avaliação médica por sinal de alarme antes de iniciar tratamento para corrimento.';
          else if(ctx.child||ctx.pregnancyConflict||data.complicado==='Sim'||data.alergia==='Sim'||/candidiase (?:complicada|recorrente)|vaginose bacteriana recorrente/.test(current))item.treatment='Individualizar a conduta após avaliar faixa etária, gestação, alergia e recorrência.';
          else if(first&&!ctx.adult&&ctx.gestante!=='Sim')item.treatment='Se confirmado: '+first.drug+'. Conferir idade, gestação/lactação e contraindicações para definir o esquema.';
          else if(first){
            item.treatment='Se a avaliação confirmar o diagnóstico: '+first.drug+'. '+(id==='cand'&&!['Sim','Não'].includes(ctx.gestante)?'Conferir gestação para definir a duração do tratamento vaginal.':first.dose)+' '+(first.note||'');
          }
          item.refs=[addRef('Saúde da Mulher · '+women.diseases[id].name,women.link(women.diseases[id].page))];
        }else item.refs.unshift(addRef('Saúde da Mulher · corrimento',R.mulher+'#page=14'));
        if(p==='smu'||p==='pna'||p==='pnc')item.action='corrimento';
      }

      output.push(item);
    }
    const explicit=value(p,'motivo-consulta');
    const motive=['iniciar','acompanhar','trocar','emergencia','preconcepcao'].includes(explicit)?explicit:/contracepcao de emergencia/.test(current)?'emergencia':/planejamento reprodutivo/.test(current)?'iniciar':'';
    if(!gestacao&&/dor pelvica/.test(current))output.push({title:'Dor pélvica',exams:'Investigar possibilidade de gestação, sangramento, corrimento e dor à mobilização do colo. Avaliar teste de gravidez conforme o quadro.',treatment:'Suspeita de gravidez ectópica, DIP ou complicação puerperal exige avaliação médica. Na dor cíclica estável, investigar dismenorreia e orientar tratamento conforme a causa.',refs:[addRef('Saúde da Mulher · dor pélvica',R.mulher+'#page=38')]});
    if(/climaterio|menopausa/.test(current))output.push({title:'Climatério / menopausa',exams:'Após os 45 anos, sintomas típicos com alteração do ciclo permitem avaliação clínica. Exames laboratoriais dependem de indicação específica.',treatment:'Avaliar fogachos, sono e sintomas geniturinários. Orientar atividade física, alimentação e medidas para o sintoma predominante. Avaliar individualmente a indicação de terapia hormonal.',refs:[addRef('Saúde da Mulher · climatério',R.mulher+'#page=84')]});
    if(p==='smu'&&['iniciar','acompanhar','trocar','emergencia','preconcepcao'].includes(motive)){
      const emergency=motive==='emergencia',pre=motive==='preconcepcao';
      output.push({title:pre?'Pré-concepção':emergency?'Contracepção de emergência':'Anticoncepção',care:pre?'Revisar condições clínicas, medicamentos, vacinação e plano reprodutivo.':emergency&&ctx.gestante==='Sim'?'Gestação confirmada: avaliar a demanda no pré-natal. A contracepção de emergência não interrompe uma gestação estabelecida.':emergency?'Avaliar tempo desde a exposição e risco de violência. O protocolo descreve levonorgestrel 0,75 mg, dois comprimidos por via oral, o mais cedo possível, preferencialmente nas primeiras 72 horas.':'Revisar preferência, gestação, PA, uso atual e critérios de elegibilidade. A etapa Anticoncepção apresenta métodos, taxas de falha e condutas por categoria.',exams:'Solicitar exames conforme a indicação individual e os resultados anteriores.',kit:pre?'gestacao':'contracepcao',action:pre||emergency?'exames-mulher':'contracepcao',refs:[addRef('Saúde da Mulher · '+(pre?'pré-concepção':emergency?'emergência':'elegibilidade'),R.mulher+'#page='+(pre?47:emergency?65:62))]});
    }
    // Somente sintomas/achados atuais acionam o cruzamento. Textos de orientações e SOAP ficam fora.
    const specialized=[
      ['ist',/uretrite|sifilis (?:recente|tardia|reagente)|hiv reagente|condiloma|neurossifilis|cancroide|linfogranuloma|donovanose/,'IST'],
      ['hip',/hipertensao|diabetes|has mal controlada|\bdm2?\b|insuficiencia cardiaca|arritmia|hipotireoidismo|hipertireoidismo|nodulo de tireoide|bocio multinodular|obesidade secundaria|obesidade imc|hiperprolactinemia/,'Cardiologia / endocrinologia'],
      ['fer',/ferida|ulcera de pressao|necrose|pe diabetico/,'Feridas'],
      ['puerp',/amamentacao|aleitamento|puerperio/,'Puerpério']
    ];
    for(const [prefix,rx,title] of specialized){
      if(!rx.test(current)||prefix==='puerp'&&p!=='puerp')continue;
      const condition=p==='hip'&&value(p,'condicao-protocolar')!=='Sem condição adicional'?value(p,'condicao-protocolar'):'';
      const diagnosis=p==='ist'?value(p,'diagnostico-sindromico'):'';
      const specific=prefix==='hip'?condition:prefix==='ist'&&rx.test(R.norm(diagnosis))?diagnosis:'';
      const context=(specific?R.norm(specific):current)+(ctx.gestante==='Sim'?' CONTEXTO_GESTANTE':'')+(value(p,'lactante')==='Sim'?' CONTEXTO_LACTANTE':'');
      const d=condutaProtocoladaModulo(prefix,context);if(!d?.protocolada)continue;
      // Esquemas específicos do adulto dependem de idade e situação obstétrica estabelecidas.
      const drug=prefix==='ist'&&ctx.adult&&(ctx.gestante==='Não'||ctx.male)&&!ctx.urgent&&!redFlag;
      output.push({title:specific||title,care:d.conduta,note:d.observacoes&&!d.observacoes.startsWith('Revisar critérios clínicos')?d.observacoes:'',treatment:drug?[d.medicacao,d.dosagem].filter(Boolean).join(' '):'',refs:[addRef(d.fonte,d.url)]});
    }
    if(['pna','pnc'].includes(p)&&Number.isFinite(ctx.ig)){
      const id=ctx.ig<14?'pn1':ctx.ig<28?'pn2':'pn3',built=ExamesRegras.build(id,ctx);
      output.push({title:built.name,exams:built.items.filter(x=>x.selected).map(x=>x.name).join(' · '),kit:id,refs:[addRef('Pré-natal · exames por trimestre',ExamesRegras.sources.pn.url+'#page=29')]});
    }
    const alergias=R.norm([value(p,'alergia'),value(p,'alergias')].join(' '));
    if(alergias.trim()){
      const farmacos=['amoxicilina','cefalexina','nitrofurantoina','bromoprida','metoclopramida','ondansetrona','dipirona','paracetamol','escopolamina','lactulose','aciclovir','loratadina','albendazol','permetrina','metronidazol','fluconazol','miconazol'];
      for(const item of output){
        for(const campo of ['treatment','medication']){
          const esquema=R.norm(item[campo]);
          if(farmacos.some(nome=>alergias.includes(nome)&&esquema.includes(nome)))item[campo]='Há referência a este medicamento no campo de alergias. Revisar a alergia e o quadro do protocolo antes de escolher uma alternativa.';
        }
      }
    }
    return output;
  }
  function tag(name,cls,text){
    const node=document.createElement(name);if(cls)node.className=cls;if(text)node.textContent=text;return node;
  }
  function line(node,label,text){if(!text)return;const row=tag('p');row.append(tag('strong','',label+' '),document.createTextNode(text));node.append(row);}
  function mountPicker(p,model){
    const pane=byId(p+'-'+assessment[p]);if(!pane)return;
    const field=['queixa','queixas','queixa-principal','sintomas','manual-queixa'].map(k=>byId(p+'-'+k)).find(e=>e?.matches('textarea,input[type=text]'));
    if(!field)return;
    const existing=[...pane.querySelectorAll('.complaint-chip,[id$="-queixas-clin"] label,[id$="-queixas-gin"] label')].map(e=>R.norm(e.textContent.trim()));
    const options=R.rules.filter(r=>!existing.some(label=>r.rx.test(label)));
    const picker=tag('details','protocol-picker'),summary=tag('summary','',existing.length?'Outras queixas do protocolo':'Selecionar queixa do protocolo');
    const list=tag('div','protocol-options');picker.append(summary,list);
    // Na entrevista ginecológica, a fala da paciente é um registro literal.
    let selecao=field;
    if(p==='smu'){
      selecao=tag('input','aps-new');selecao.type='hidden';selecao.id='smu-protocolo-queixas';picker.append(selecao);
    }
    const lines=()=>selecao.value.split(/\r?\n/);
    picker.addEventListener('toggle',()=>{
      if(!picker.open)return;
      if(!list.childElementCount)for(const {title} of options){
        const b=tag('button','btn btn-s',title==='Disúria'?'Disúria / suspeita de ITU':title);
        b.type='button';b.dataset.reason=title;list.append(b);
      }
      const selected=lines();for(const b of list.children)b.setAttribute('aria-pressed',String(selected.includes(b.dataset.reason)));
    });
    list.addEventListener('click',event=>{
      const title=event.target.closest('button')?.dataset.reason;if(!title)return;
      const previous=lines();
      selecao.value=previous.includes(title)?previous.filter(line=>line!==title).join('\n'):[selecao.value,title].filter(Boolean).join('\n');
      selecao.dispatchEvent(new Event('input',{bubbles:true}));picker.open=false;picker.after(model.box);refresh(p);summary.focus({preventScroll:true});
      const rect=summary.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)summary.scrollIntoView({block:'center'});
    });
    if(pane.contains(field)&&!field.closest('details,.extra-record')&&field.closest('.f'))field.closest('.f').before(picker);else pane.prepend(picker);
  }
  function navigate(p,id){
    if(id==='corrimento'&&p!=='smu'){
      byId(p+'-corr-abrir')?.click();return;
    }
    const tab=pages.get(p).page.querySelector('[aria-controls="'+p+'-'+id+'"]');tab?.click();
  }
  function display(p){
    const model=pages.get(p);if(!model)return;
    const {page,box}=model,ctx=ESFExames.context(p),text=inputText(p,page),items=activeDecisions(p,text,ctx);
    const stamp=JSON.stringify(items);
    if(model.stamp===stamp)return;model.stamp=stamp;
    box.replaceChildren();box.hidden=!items.length;
    for(const [index,item] of items.entries()){
      const section=tag('article','care-item');
      section.append(tag('h3','',item.title));
      if(item.dengue){
        const grid=tag('div','g3');
        for(const [key,label] of dengueCampos){
          const wrap=tag('label','f',label),select=tag('select');
          for(const opt of ['','Sim','Não'])select.add(new Option(opt||'Não avaliado',opt));
          const saved=byId(p+'-dengue-'+key);select.value=saved.value;
          select.onchange=()=>{saved.value=select.value;saved.dispatchEvent(new Event('input',{bubbles:true}));model.stamp='';display(p);};
          wrap.append(select);grid.append(wrap);
        }section.append(grid);
      }
      if(item.priority)section.append(tag('p','care-priority',item.priority));
      line(section,'Medicação prevista no protocolo',item.medication);
      line(section,'Conduta',item.care);line(section,'Tratamento / manejo',item.treatment);line(section,'Exames e avaliação',item.exams);
      if(item.note)section.append(tag('p','care-note',item.note));
      const links=tag('div','care-links');
      for(const ref of item.refs||[]){
        if(!ref.url?.startsWith('https://'))continue;
        const link=tag('a','',ref.title);link.href=ref.url;link.target='_blank';link.rel='noopener';links.append(link);
      }
      section.append(links);
      if(item.kit&&byId(p+'-exkit-painel')){
        const order=tag('button','btn btn-s','Revisar pedido de exames');order.type='button';
        order.onclick=()=>{
          if(!ESFExames.cart(p).some(x=>x.kit===item.kit))ESFExames.build(p,item.kit);
          ESFExames.open(p,item.kit);
        };
        section.append(order);
      }
      if(item.action){const b=tag('button','btn btn-s',item.action==='corrimento'?'Avaliar corrimento':item.action==='contracepcao'?'Avaliar método contraceptivo':'Abrir exames e seguimento');b.type='button';b.onclick=()=>navigate(p,item.action);section.append(b);}
      if(index>0&&item.kit?.startsWith('pn')){const more=tag('details');more.append(tag('summary','',item.title),section);box.append(more);}else box.append(section);
    }
  }
  function disclosure(node,label,cls){
    if(!node||node.parentElement?.classList.contains(cls))return;
    const details=tag('details',cls);details.append(tag('summary','',label));node.before(details);details.append(node);return details;
  }
  function clean(page,p){
    // Guardar os controles antigos para reabertura de históricos e edição de dados complementares.
    const manual=byId('manual-soap-'+p);disclosure(manual,'Complementar o registro em texto livre','extra-record');
    const exams=byId(p+'-exkit-painel');if(exams){
      disclosure(exams,'Pedidos de exames','order-drawer');
      const picker=exams.querySelector('.exam-picker');disclosure(picker,'Escolher outro kit','manual-kit');
      byId(p+'-exkit-sugestoes')?.setAttribute('hidden','');
    }
    const oldExam=byId('smu-confirmar-exames')?.closest('section');
    if(p==='smu'&&oldExam)disclosure(oldExam,'Consultar ou editar pedidos do formulário anterior','old-orders');
    const native=page.querySelector('.tp.on')||page;
    const duplicates=new Set();
    for(const btn of page.querySelectorAll('button[onclick]')){
      const action=btn.getAttribute('onclick').trim(),key=(btn.closest('.tp')?.id||page.id)+'|'+action;
      if(/^gerarSAE\(/.test(action)){if(duplicates.has(key))btn.remove();else duplicates.add(key);}
      if(action==='gerarSoapPorIA()'&&byId('quick-actions')?.querySelector('.ai'))btn.hidden=true;
    }
    if(p==='ger')byId('ger-motivo')?.closest('.f')?.classList.add('legacy-motive');
    for(const d of page.querySelectorAll('[id$="-endereco-auto"]')){
      const field=byId(p+'-endereco');
      if(field&&d.contains(byId(p+'-logradouro'))&&field.closest('.f'))field.closest('.f').classList.add('combined-address');
    }
    const anthro=byId(p+'-antropometria-auto');
    const vital=(byId(p+'-pa')||byId(p+'-pa-atual')||byId(p+'-peso'))?.closest('.card');
    if(anthro&&vital&&vital!==anthro&&vital.closest('.tp')===anthro.closest('.tp')){
      const fields=anthro.querySelector('.module-form-grid');if(fields)vital.append(fields);
      const status=byId(p+'-imc-status');if(status)vital.append(status);anthro.remove();
    }
    for(const card of page.querySelectorAll('.card')){
      const title=card.querySelector(':scope > .ct')?.textContent.trim();
      if(title==='Avaliação Vacinal — PNI'&&p!=='pu')disclosure(card,'Avaliar vacinação','support-section');
      if(title==='Análise livre de laudo laboratorial')disclosure(card,'Interpretar laudo laboratorial','support-section');
    }
    // A área de impressão e os cálculos continuam lendo os valores dos mesmos controles.
    return native;
  }
  function syncLegacy(p){
    const m=pages.get(p);if(!m)return;
    const address=byId(p+'-endereco'),derived=value(p,'logradouro')||value(p,'cep');
    if(address?.closest('.combined-address'))address.closest('.f').hidden=Boolean(derived||!address.value);
    const old=byId('ger-motivo');if(p==='ger'&&old?.closest('.legacy-motive'))old.closest('.f').hidden=!old.value;
    const historic=byId('smu-confirmar-exames')?.closest('.old-orders');
    if(p==='smu'&&historic)historic.hidden=![...historic.querySelectorAll('textarea,select')].some(e=>e.value)&&!window.ESFSaudeMulher?.records().some(r=>r.id==='exames');
  }
  function refresh(p){const m=pages.get(p);if(!m)return;if(!m.box.isConnected||m.page.classList.contains('on')&&m.box.parentElement&&!m.box.parentElement.getClientRects().length)m.home.after(m.box);syncLegacy(p);display(p);}
  function reset(p){const m=pages.get(p);if(!m)return;clearTimeout(m.timer);m.stamp='';m.home.after(m.box);m.box.replaceChildren();m.box.hidden=true;for(const id of ['motivo','completo']){const e=byId(p+'-guide-'+id);if(e){e.value='';e.checked=false;}}}
  function mount(){
    for(const [id,p] of Object.entries(QUICK_PAGE_PREFIX)){
      const page=byId(id);if(!page)continue;
      const home=page.querySelector('.ux-stage-label')||page.querySelector('.tabs');if(!home)continue;
      const box=tag('aside','consultation-protocol');box.id=p+'-protocolo-atual';box.setAttribute('aria-label','Orientação do protocolo');box.setAttribute('aria-live','polite');box.hidden=true;home.after(box);
      const old=tag('div');old.hidden=true;
      for(const [key] of dengueCampos){const field=tag('input','aps-new');field.type='hidden';field.id=p+'-dengue-'+key;old.append(field);}
      byId(p+'-cpf')?.addEventListener('input',()=>{for(const [key] of dengueCampos)byId(p+'-dengue-'+key).value='';});
      for(const k of ['motivo','completo']){const input=tag('input');input.id=p+'-guide-'+k;input.type=k==='completo'?'checkbox':'text';old.append(input);}old.className='consultation-guide legacy-guide';page.append(old);
      pages.set(p,{page,box,home,stamp:'',timer:0});clean(page,p);if(assessment[p])mountPicker(p,pages.get(p));
      const change=e=>{
        if(e.target.closest('.consultation-protocol,.protocol-picker'))return;
        const model=pages.get(p),target=e.target;
        if(Object.values(SOAP_IDS_MODULO[p]||{}).includes(target.id))return;
        const relevant=target.closest('.clinical-chip,.complaint-chip,.alert-chip,[data-priority],[id$="-queixas-clin"],[id$="-queixas-gin"]')||kinds.some(k=>target.id===p+'-'+k)||[...Object.keys(binaryFindings[p]||{}),'tipo','tecido','gestante','motivo-consulta'].some(k=>target.id===p+'-'+k);
        const place=relevant&&(target.closest('.cklist')||target.closest('.complaint-list,.alert-check-list,.clinical-group,.f,.g2,.cki,.rpills'));
        if(place&&!place.contains(box)&&!place.closest('[hidden]')&&place.getClientRects().length)place.after(box);
        clearTimeout(model.timer);
        const picked=e.type==='click'&&target.closest('.complaint-chip.selected');
        model.timer=setTimeout(()=>{
          refresh(p);
          if(picked&&!box.hidden&&box.getBoundingClientRect().top>innerHeight-(byId('quick-actions')?.offsetHeight||0)-60){
            box.scrollIntoView({block:'center',behavior:'instant'});
          }
        },e.type==='input'?100:0);
      };
      for(const event of ['change','input','click'])page.addEventListener(event,change);
    }
    const restore=window.restaurarDadosModulo;
    window.restaurarDadosModulo=function(p,...args){const r=restore.call(this,p,...args);refresh(p);return r;};
    const nav=window.go;
    window.go=function(...args){const r=nav.apply(this,args);const p=prefixoPaginaAtual();if(p)refresh(p);return r;};
    matchMedia('(max-width:760px)').addEventListener('change',e=>{if(e.matches)alternarMenuLateral(true);});
    refresh(prefixoPaginaAtual());
  }
  function orientacoes(p){
    const modelo=pages.get(p);
    if(!modelo)return '';
    return activeDecisions(p,inputText(p,modelo.page),ESFExames.context(p))
      .filter(item=>!item.kit?.startsWith('pn'))
      .map(item=>[item.title,item.priority,item.care,item.treatment,item.medication&&'Opção do protocolo para avaliação: '+item.medication].filter(Boolean).join(' — ')).join('\n');
  }
  window.ESFConsultaGuiada={refresh,reset,findings,orientacoes};document.addEventListener('DOMContentLoaded',mount);
})();
