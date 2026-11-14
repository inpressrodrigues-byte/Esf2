(() => {
  'use strict';
  const get=id=>document.getElementById(id);
  const keyName='prumo-painel-chave';
  const fragment=location.hash.slice(1);
  const token=fragment||sessionStorage.getItem(keyName);
  if(fragment){sessionStorage.setItem(keyName,fragment);history.replaceState(null,'',location.pathname);}
  let voice=false,last='',spoken=new Set(),initialized=false,timer,expiry;
  const synth=window.speechSynthesis;
  function clear(title){
    get('etapa').textContent='Sala de espera';get('paciente').textContent=title;
    get('destino').textContent=get('profissional').textContent='';get('anteriores').hidden=true;
    get('anteriores').querySelector('ul').replaceChildren();last='';synth?.cancel();
  }
  function speak(c){if(!voice||!synth)return;const msg=new SpeechSynthesisUtterance([c.paciente,c.sala,'com '+c.profissional].join('. '));msg.lang='pt-BR';synth.speak(msg);}
  function render(data){
    get('unidade').textContent=data.unidade;const calls=data.chamadas;
    const c=calls[0];if(!c){clear('Aguardando chamada');spoken.clear();initialized=true;return;}
    if(last!==c.id){
      get('etapa').textContent='Chamada para '+c.etapa.toLocaleLowerCase('pt-BR');
      get('paciente').textContent=c.paciente;get('destino').textContent=c.sala;
      get('profissional').textContent='Profissional · '+c.profissional;last=c.id;
    }
    for(const item of [...calls].reverse())if(initialized&&!spoken.has(item.id))speak(item);
    spoken=new Set(calls.map(x=>x.id));initialized=true;
    const section=get('anteriores'),list=section.querySelector('ul');list.replaceChildren();
    for(const item of calls.slice(1,5)){
      const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=item.paciente;
      li.append(strong,document.createTextNode(item.sala+' · '+item.profissional));list.append(li);
    }
    section.hidden=calls.length<2;
  }
  async function poll(){
    if(!token||!/^[0-9a-f-]{36}$/i.test(token)){clear('Painel sem vínculo');get('situacao').textContent='Abra este painel pelo link da agenda da UBS.';return;}
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
    try{
      const r=await fetch(_SB_URL+'/rest/v1/rpc/agenda_painel_ler',{method:'POST',headers:{apikey:_SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({chave:token}),signal:controller.signal,cache:'no-store',credentials:'omit'});
      if(r.status===401||r.status===403){sessionStorage.removeItem(keyName);clear('Painel encerrado');get('situacao').textContent='Gere um novo link na agenda da UBS.';return;}
      if(!r.ok)throw Error();
      const data=await r.json();if(!Array.isArray(data.chamadas))throw Error();
      render(data);get('situacao').textContent='Conectado';clearTimeout(expiry);
      expiry=setTimeout(()=>{clear('Reconectando…');get('situacao').textContent='Sem atualização da UBS';},12000);
    }catch{clear('Reconectando…');get('situacao').textContent='Confira a conexão do monitor.';}
    finally{clearTimeout(timeout);}
    timer=setTimeout(poll,2500);
  }
  get('voz').disabled=!synth;get('voz').onclick=()=>{voice=!voice;get('voz').setAttribute('aria-pressed',String(voice));get('voz').textContent=voice?'Desativar voz':'Ativar voz';if(!voice)synth.cancel();else{const msg=new SpeechSynthesisUtterance('Voz ativada');msg.lang='pt-BR';synth.speak(msg);}};
  get('cheia').hidden=!document.documentElement.requestFullscreen;
  get('cheia').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{get('situacao').textContent='Tela cheia indisponível neste navegador.';}};
  document.addEventListener('fullscreenchange',()=>{get('cheia').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';});
  function clock(){get('relogio').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'});}
  clock();setInterval(clock,10000);poll();
  window.addEventListener('pagehide',()=>{clearTimeout(timer);clearTimeout(expiry);clear('Aguardando chamada');});
  window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
})();
