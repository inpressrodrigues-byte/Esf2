(() => {
  'use strict';
  const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const button=(text,fn)=>{const b=el('button',text);b.type='button';b.className='btn btn-s';b.onclick=fn;return b;};
  function stage(row){
    if(['Aguardando atendimento','Em escuta'].includes(row.estado))return 'Triagem';
    if(['Triagem concluída','Em atendimento'].includes(row.estado))return 'Atendimento';
    return '';
  }
  function roomKey(unit,step){return JSON.stringify(['prumo-sala',CURRENT_AUTH_USER_ID,unit,step]);}
  function caller(row,unit,onScreen){
    const step=stage(row);if(!step)return;
    const details=el('details'),title=el('summary','Chamar para '+step.toLowerCase()),form=el('form'),label=el('label','Sala ou consultório'),room=el('input'),submit=el('button','Enviar chamada'),feedback=el('p');
    details.className='call-control';room.maxLength=60;room.required=true;
    room.placeholder=step==='Triagem'?'Ex.: Sala de triagem':'Ex.: Consultório 2';room.value=sessionStorage.getItem(roomKey(unit,step))||'';
    label.className='f';label.append(room);submit.className='btn btn-p';submit.type='submit';feedback.setAttribute('role','status');
    const professional=el('label','Quem vai atender'),who=el('select');professional.className='f';
    who.setAttribute('aria-label','Quem vai atender');who.append(new Option(CURRENT_USER_PROFILE?.nome||'Meu perfil','eu'));
    if(row.profissional&&row.profissional!==CURRENT_USER_PROFILE?.nome)who.append(new Option(row.profissional+' (agenda)','agenda'));
    professional.append(who);form.append(label,professional,submit,feedback);details.append(title,form);onScreen.append(details);
    let request=null,lastCall='';
    form.onsubmit=async e=>{
      e.preventDefault();const destination=room.value.trim(),scope=escopoDadosClinicos().chave;
      if(!destination||submit.disabled)return;
      submit.disabled=true;feedback.textContent='Enviando…';
      const choice=JSON.stringify([destination,who.value]);if(lastCall!==choice||!request)request=crypto.randomUUID();lastCall=choice;
      try{
        const {data,error}=await _sb.rpc('agenda_chamar',{atendimento:row.id,etapa:step,destino:destination,pedido:request,versao:row.versao,responsavel:who.value});
        if(error||data!==request)throw error||Error();
        request=null;
        if(!details.isConnected||escopoDadosClinicos().chave!==scope)return;
        sessionStorage.setItem(roomKey(unit,step),destination);
        title.textContent='Chamar novamente para '+step.toLowerCase();submit.textContent='Repetir chamada';feedback.textContent='Chamada enviada ao painel da UBS.';
      }catch(e){if(details.isConnected&&escopoDadosClinicos().chave===scope)feedback.textContent=e?.message?.includes('Aguarde')?'Aguarde alguns segundos para repetir.':'Chamada não confirmada. Confira a conexão, a etapa da fila e o nome do profissional no perfil.';}
      finally{submit.disabled=false;}
    };
  }
  function panel(root,unit,current){
    const action=el('details');action.className='panel-tools';action.append(el('summary','Painel da sala de espera'));
    const content=el('div'),status=el('p');status.setAttribute('role','status');const links=el('div');links.className='panel-links';let seq=0;
    const reset=()=>{seq++;links.replaceChildren();status.textContent='';action.open=false;};unit.addEventListener('change',reset);
    const generate=button('Preparar tela de chamadas',async()=>{
      const u=unit.value,id=++seq;generate.disabled=true;
      try{
        const {data,error}=await _sb.rpc('agenda_painel_configurar',{ubs:u,desativar:false});
        if(!current()||id!==seq)return;if(error||!data)throw Error();
        const url=new URL('painel.html',location.href);url.hash=data;
        const a=el('a','Abrir painel');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.className='btn btn-p';
        const copy=button('Copiar link para a TV',async()=>{try{await navigator.clipboard.writeText(url.href);status.textContent='Link copiado.';}catch{const input=el('input');input.readOnly=true;input.value=url.href;input.setAttribute('aria-label','Link para a TV');links.append(input);input.select();}});
        links.replaceChildren(a,copy);status.textContent='O link funciona por 12 horas nesta UBS.';
      }catch{if(current()&&id===seq)status.textContent='Não foi possível preparar o painel.';}finally{generate.disabled=false;}
    });
    const stop=button('Desconectar telas da UBS',async()=>{
      if(!confirm('Desconectar todos os painéis de chamadas de '+unit.value+'?'))return;
      const id=++seq;stop.disabled=true;
      try{const {error}=await _sb.rpc('agenda_painel_configurar',{ubs:unit.value,desativar:true});if(error)throw error;if(current()&&id===seq){links.replaceChildren();status.textContent='Telas desconectadas.';}}
      catch{if(current()&&id===seq)status.textContent='Não foi possível desconectar as telas.';}finally{stop.disabled=false;}
    });
    content.append(generate,links,stop,status);action.append(content);root.append(action);
  }
  window.ChamadorAPS={caller,panel};
})();
