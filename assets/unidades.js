/* Account unit assignments are written only through the administrator RPC. */
(function(){
  'use strict';
  let resolvedOwner='';
  const original=(window.ESFUnidadesToledo?.unidades||[]).slice();
  const items=()=>window.ESFUnidadesToledo?.unidades||[];
  const byId=id=>document.getElementById(id);
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function updateCatalog(units){
    window.ESFUnidadesToledo.unidades=units;
    const own=byId('u-unidade');if(own)delete own.dataset.current;
    document.querySelectorAll('[data-unit-user]').forEach(control=>{control.innerHTML=options(control.dataset.current||'');});
    refresh();
  }
  async function loadCatalog(){
    if(!_sb||!CURRENT_AUTH_USER_ID||window.MODO_OFFLINE)return false;
    const actor=CURRENT_AUTH_USER_ID,units=[];
    try{
      for(let offset=0;;offset+=500){
        const {data,error}=await comLimite(_sb.from('unidades_saude_toledo').select('codigo,nome,grupo').eq('ativa',true).order('nome').range(offset,offset+499),8000);
        if(actor!==CURRENT_AUTH_USER_ID)return false;
        if(error||!Array.isArray(data))throw error||Error('Catálogo indisponível');
        units.push(...data);if(data.length<500)break;
      }
      updateCatalog(units);return true;
    }catch{return false;}
  }
  function registration(userId){
    return '<details class="admin-local-extra" data-user="'+escape(userId)+'"><summary>Adicionar consultório particular</summary>'+
      '<label>Nome do consultório<input type="text" minlength="3" maxlength="160" placeholder="Ex.: Consultório Santa Clara"></label>'+
      '<button type="button" class="btn btn-s" onclick="ESFUnidades.cadastrarConsultorio(this)">Cadastrar e vincular</button><p role="status"></p></details>';
  }
  async function createOffice(button){
    const box=button.closest('[data-user]'),input=box.querySelector('input'),status=box.querySelector('[role="status"]');
    if(button.disabled)return;
    if(!CURRENT_AUTH_USER_ID||!temPermissao('ver_admin')||!_sb||window.MODO_OFFLINE){status.textContent='Entre como administrador conectado para cadastrar o consultório.';return;}
    const name=input.value.trim().replace(/\s+/g,' ');
    if(name.length<3||!input.reportValidity()){status.textContent='Informe o nome do consultório.';input.focus();return;}
    const actor=CURRENT_AUTH_USER_ID,userId=box.dataset.user;
    button.disabled=true;status.textContent='Cadastrando…';
    try{
      const {data,error}=await comLimite(_sb.rpc('admin_cadastrar_consultorio',{p_user_id:userId,p_nome:name}),12000);
      if(actor!==CURRENT_AUTH_USER_ID)return;
      if(error)throw error;
      if(!data?.nome||!data?.codigo||data.grupo!=='Consultórios particulares')throw Error('Resposta inválida');
      updateCatalog([...items().filter(u=>u.codigo!==data.codigo),data]);
      const control=box.parentElement.querySelector('[data-unit-user]');
      if(control){control.value=data.nome;control.dataset.current=data.nome;}
      if(userId===actor)receiveAssignment(data.nome);
      status.textContent='Consultório cadastrado e vinculado ao profissional.';input.value='';
    }catch(error){
      if(actor===CURRENT_AUTH_USER_ID)status.textContent=error?.code==='22023'?error.message:
        error?.code==='42501'?'Somente o administrador pode cadastrar consultórios.':'Não foi possível confirmar. Tente novamente com o mesmo nome.';
    }finally{button.disabled=false;}
  }
  function receiveAssignment(unit){
    PERMISSOES_ATUAIS={...PERMISSOES_ATUAIS,unidade_escopo:unit};receive(CURRENT_AUTH_USER_ID,unit);
    try{const cache=JSON.parse(localStorage.getItem('esf_sessao_cache')||'null');if(cache?.uid===CURRENT_AUTH_USER_ID){cache.profile=CURRENT_USER_PROFILE;cache.permissoes=PERMISSOES_ATUAIS;localStorage.setItem('esf_sessao_cache',JSON.stringify(cache));}}catch(_){}
  }
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
    window.ESFEscopo?.atualizar();refresh();
  }
  async function change(userId,unit,control){
    if(!CURRENT_AUTH_USER_ID||!temPermissao('ver_admin')){showToast('Somente o administrador pode alterar a unidade.');return false;}
    if(!_sb||window.MODO_OFFLINE){showToast('Conecte-se para alterar a unidade.');return false;}
    if(unit&&!items().some(u=>u.nome===unit)){showToast('Escolha um local cadastrado na lista.');return false;}
    const actor=CURRENT_AUTH_USER_ID,previous=control?.dataset.current??CURRENT_USER_PROFILE?.unidade??'';
    if(control)control.disabled=true;
    try{
      const {data,error}=await comLimite(_sb.rpc('admin_definir_unidade',{p_user_id:userId,p_unidade:unit}),12000,'A alteração da unidade não respondeu.');
      if(actor!==CURRENT_AUTH_USER_ID)return false;
      if(error)throw error;
      if(data!==unit)throw new Error('O servidor não confirmou a unidade.');
      if(userId===CURRENT_AUTH_USER_ID){
        receiveAssignment(unit);
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
  window.ESFUnidades={options,refresh,carregarCatalogo:loadCatalog,cadastroHtml:registration,cadastrarConsultorio:createOffice,receberPerfil:receive,alterar:change,salvarMinhaUnidade:saveMine,iniciarSessao:()=>{resolvedOwner='';updateCatalog(original.slice());}};
  document.addEventListener('DOMContentLoaded',refresh);
})();
