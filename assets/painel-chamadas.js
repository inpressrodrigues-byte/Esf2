(() => {
  'use strict';
  const get=id=>document.getElementById(id);
  const keyName='prumo-painel-chave';
  const fragment=location.hash.slice(1);
  const token=fragment||sessionStorage.getItem(keyName);
  if(fragment){sessionStorage.setItem(keyName,fragment);history.replaceState(null,'',location.pathname);}
  let voice=false,last='',currentCall=null,spoken=new Set(),initialized=false,timer,expiry;
  const synth=window.speechSynthesis;
  const choice=get('locutor'),notice=get('aviso-voz');
  let voices=[],preferred='';
  try{preferred=localStorage.getItem('prumo-voz-pt')||'';}catch{}
  function refreshVoices(){
    const score=v=>(/^pt[-_]br$/i.test(v.lang)?10:0)+(/natural|neural|premium|enhanced|aprimorada/i.test(v.name)?4:0)+(v.default?1:0);
    voices=(synth?.getVoices()||[]).filter(v=>v.localService&&/^pt([-_]|$)/i.test(v.lang)).sort((a,b)=>score(b)-score(a));
    choice.replaceChildren(...voices.map(v=>new Option(v.name,v.voiceURI)));
    if(voices.some(v=>v.voiceURI===preferred))choice.value=preferred;
    choice.disabled=get('ouvir').disabled=get('voz').disabled=!voices.length;
    notice.textContent=voices.length?'':'Instale ou habilite uma voz em português neste aparelho e reabra o painel.';
    if(!voices.length)get('ajustes-voz').open=true;
  }
  choice.onchange=()=>{preferred=choice.value;try{localStorage.setItem('prumo-voz-pt',preferred);}catch{}};
  synth?.addEventListener('voiceschanged',refreshVoices);refreshVoices();
  function announce(c){
    const speaker=voices.find(v=>v.voiceURI===choice.value);
    if(!speaker)return;
    const room=String(c.sala).trim().replace(/^consult[oó]rio\b/i,'consultório');
    const destination=/^\d/.test(room)?(c.etapa==='Triagem'?'à sala ':'ao consultório ')+room:/^(sala|triagem|recepção|enfermaria|farmácia)\b/i.test(room)?'à '+room:/^(consultório|setor|acolhimento|balcão)\b/i.test(room)?'ao '+room:'ao local '+room;
    const titles={'enfermeiro(a)':'o enfermeiro','médico(a)':'o médico','técnico(a) de enfermagem':'o técnico de enfermagem','acs':'o agente comunitário de saúde',
      'enfermeira':'a enfermeira','enfermeiro':'o enfermeiro','médica':'a médica','médico':'o médico','técnica de enfermagem':'a técnica de enfermagem','técnico de enfermagem':'o técnico de enfermagem'};
    const title=titles[(c.cargo||'').trim().toLocaleLowerCase('pt-BR')];
    const msg=new SpeechSynthesisUtterance('Chamando '+c.paciente+'. Favor comparecer '+destination+', com '+(title?title+' ':'')+c.profissional+'.');
    msg.voice=speaker;msg.lang=speaker.lang;msg.rate=.9;
    msg.onerror=e=>{if(!['interrupted','canceled'].includes(e.error)){notice.textContent='Falha ao reproduzir. Teste outra voz e confira o áudio do aparelho.';get('ajustes-voz').open=true;}};
    synth.speak(msg);
  }
  const demo=()=>announce({paciente:'Maria Oliveira',sala:'Consultório 2',cargo:'Enfermeira',profissional:'Ana Souza'});
  get('ouvir').onclick=demo;
  const clockFormat=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'});
  function historyList(rows){
    const list=get('anteriores').querySelector('ul');
    list.replaceChildren(...rows.map(row=>{
      const li=document.createElement('li'),name=document.createElement('strong'),by=document.createElement('span'),time=document.createElement('time');
      name.textContent=row.paciente;by.textContent=row.etapa+' · '+(row.quemChamou||'Profissional não informado');
      time.dateTime=row.hora;time.textContent=clockFormat.format(new Date(row.hora));
      li.append(name,by,time);return li;
    }));
    get('sem-historico').hidden=rows.length>0;
  }
  function clear(title){
    get('etapa').textContent='Sala de espera';get('paciente').textContent=title;
    get('destino').textContent=get('profissional').textContent='';
    if(last)synth?.cancel();last='';currentCall=null;
  }
  function render(data){
    get('unidade').textContent=data.unidade;const calls=data.chamadas;
    historyList(data.historico||[]);
    const c=calls[0];if(!c){clear('Aguardando chamada');spoken.clear();initialized=true;return;}
    currentCall=c;
    if(last!==c.id){
      get('etapa').textContent='Chamada para '+c.etapa.toLocaleLowerCase('pt-BR');
      get('paciente').textContent=c.paciente;get('destino').textContent=c.sala;
      get('profissional').textContent='Profissional · '+c.profissional;last=c.id;
    }
    for(const item of [...calls].reverse())if(voice&&(initialized||item===c)&&!spoken.has(item.id))announce(item);
    spoken=new Set(calls.map(x=>x.id));initialized=true;
  }
  async function poll(){
    if(!token||!/^[0-9a-f-]{36}$/i.test(token)){clear('Painel sem vínculo');get('situacao').textContent='Abra este painel pelo link da agenda da UBS.';return;}
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
    try{
      const r=await fetch(_SB_URL+'/rest/v1/rpc/agenda_painel_ler',{method:'POST',headers:{apikey:_SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({chave:token}),signal:controller.signal,cache:'no-store',credentials:'omit'});
      if(r.status===401||r.status===403){sessionStorage.removeItem(keyName);historyList([]);clear('Painel encerrado');get('situacao').textContent='Gere um novo link na agenda da UBS.';return;}
      if(!r.ok)throw Error();
      const data=await r.json();if(!Array.isArray(data.chamadas))throw Error();
      render(data);get('situacao').textContent='Conectado';clearTimeout(expiry);
      expiry=setTimeout(()=>{historyList([]);clear('Reconectando…');get('situacao').textContent='Sem atualização da UBS';},12000);
    }catch{historyList([]);clear('Reconectando…');get('situacao').textContent='Confira a conexão do monitor.';}
    finally{clearTimeout(timeout);}
    timer=setTimeout(poll,2500);
  }
  get('voz').onclick=()=>{
    voice=!voice;get('voz').setAttribute('aria-pressed',String(voice));
    get('voz').textContent=voice?'Desativar voz':'Ativar voz';
    if(!voice)synth.cancel();
    else if(currentCall)announce(currentCall);
    else{
      const msg=new SpeechSynthesisUtterance('Voz ativada.');
      msg.voice=voices.find(v=>v.voiceURI===choice.value);msg.lang=msg.voice.lang;msg.rate=.9;synth.speak(msg);
    }
  };
  get('cheia').hidden=!document.documentElement.requestFullscreen;
  get('cheia').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{get('situacao').textContent='Tela cheia indisponível neste navegador.';}};
  document.addEventListener('fullscreenchange',()=>{get('cheia').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';});
  function clock(){get('relogio').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'});}
  clock();setInterval(clock,10000);poll();
  window.addEventListener('pagehide',()=>{clearTimeout(timer);clearTimeout(expiry);historyList([]);clear('Aguardando chamada');});
  window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
})();
