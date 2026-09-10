/* Account unit assignments are written only through the administrator RPC. */
(function(){
  'use strict';
  let resolvedOwner='';
  const items=()=>window.ESFUnidadesToledo?.unidades||[];
  const byId=id=>document.getElementById(id);
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function options(current=''){
    const groups=new Map();
    for(const u of items()){if(!groups.has(u.grupo))groups.set(u.grupo,[]);groups.get(u.grupo).push(u);}
    const option=(value,label,extra='')=>`<option value="${escape(value)}" ${value===current?'selected':''} ${extra}>${escape(label)}</option>`;
    let html=option('','Unidade não definida');
    if(current&&!items().some(u=>u.nome===current))html+=option(current,`Cadastro atual: ${current}`,'disabled');
    for(const [group,units]of groups)html+=`<optgroup label="${escape(group)}">${units.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')).map(u=>option(u.nome,u.nome)).join('')}</optgroup>`;
    return html;
  }
  function refresh(){
    const select=byId('u-unidade'),button=byId('u-salvar-unidade'),help=byId('u-unidade-ajuda');if(!select)return;
    const unit=CURRENT_USER_PROFILE?.unidade||'',resolved=resolvedOwner===CURRENT_AUTH_USER_ID&&!!resolvedOwner;
    const allowed=resolved&&temPermissao('ver_admin')&&!!_sb&&!window.MODO_OFFLINE;
    if(select.dataset.current!==unit||!select.options.length){select.innerHTML=options(unit);select.dataset.current=unit;}
    select.disabled=!allowed;select.style.backgroundColor=allowed?'var(--sf)':'var(--sf2)';button.hidden=!temPermissao('ver_admin');button.disabled=!allowed;
    help.textContent=window.MODO_OFFLINE?'Unidade em cache. Alterações exigem conexão.':!resolved?'Conferindo a unidade da conta...':temPermissao('ver_admin')?'Escolha sua unidade de atendimento.':'Unidade definida pelo administrador.';
  }
  function receive(userId,unit){
    if(userId!==CURRENT_AUTH_USER_ID)return;
    resolvedOwner=userId;CURRENT_USER_PROFILE={...(CURRENT_USER_PROFILE||{}),unidade:unit||''};
    try{localStorage.setItem(chaveUsuarioAtual(),JSON.stringify(CURRENT_USER_PROFILE));}catch(_){}
    if(typeof atualizarResumoDashboard==='function')atualizarResumoDashboard();
    refresh();
  }
  async function change(userId,unit,control){
    if(!CURRENT_AUTH_USER_ID||!temPermissao('ver_admin')){showToast('Somente o administrador pode alterar a unidade.');return false;}
    if(!_sb||window.MODO_OFFLINE){showToast('Conecte-se para alterar a unidade.');return false;}
    if(unit&&!items().some(u=>u.nome===unit)){showToast('Escolha uma unidade da lista de Toledo.');return false;}
    const actor=CURRENT_AUTH_USER_ID,previous=control?.dataset.current??CURRENT_USER_PROFILE?.unidade??'';
    if(control)control.disabled=true;
    try{
      const {data,error}=await comLimite(_sb.rpc('admin_definir_unidade',{p_user_id:userId,p_unidade:unit}),12000,'A alteração da unidade não respondeu.');
      if(actor!==CURRENT_AUTH_USER_ID)return false;
      if(error)throw error;
      if(data!==unit)throw new Error('O servidor não confirmou a unidade.');
      if(userId===CURRENT_AUTH_USER_ID){
        PERMISSOES_ATUAIS={...PERMISSOES_ATUAIS,unidade_escopo:unit};receive(userId,unit);
        try{const cache=JSON.parse(localStorage.getItem('esf_sessao_cache')||'null');if(cache?.uid===actor){cache.profile=CURRENT_USER_PROFILE;cache.permissoes=PERMISSOES_ATUAIS;localStorage.setItem('esf_sessao_cache',JSON.stringify(cache));}}catch(_){}
      }
      if(control)control.dataset.current=unit;
      showToast('Unidade atualizada.');return true;
    }catch(error){
      if(actor!==CURRENT_AUTH_USER_ID)return false;
      if(control)control.value=previous;
      showToast(error?.code==='42501'?'O servidor permite esta alteração somente ao administrador.':'Não foi possível confirmar a unidade. Atualize a lista antes de tentar novamente.');return false;
    }finally{if(control&&actor===CURRENT_AUTH_USER_ID)control.disabled=!temPermissao('ver_admin')||!!window.MODO_OFFLINE;refresh();}
  }
  async function saveMine(){
    const select=byId('u-unidade'),button=byId('u-salvar-unidade');button.disabled=true;
    try{if(await change(CURRENT_AUTH_USER_ID,select.value,select))byId('user-modal').classList.remove('open');}finally{refresh();}
  }
  window.ESFUnidades={options,refresh,receberPerfil:receive,alterar:change,salvarMinhaUnidade:saveMine,iniciarSessao:()=>{resolvedOwner='';refresh();}};
  document.addEventListener('DOMContentLoaded',refresh);
})();
