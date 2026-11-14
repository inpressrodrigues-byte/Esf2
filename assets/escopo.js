/* Limpeza de tela e gestão de vínculo. A autorização efetiva permanece na RLS. */
(()=>{
 'use strict';
 let anterior='';
 function atualizar(){
  const atual=escopoDadosClinicos().chave;
  if(anterior&&anterior!==atual){
   window.EquipeAPS?.limpar();
   for(const key of ['terr-familias-resumo','ba-acompanhados','ba-tbody','terr-kpis','ba-kpis'])document.getElementById(key)?.replaceChildren();
   for(const cfg of Object.values(MODULOS_ATENDIMENTO)){
    const page=document.getElementById('pg-'+cfg.page);window.ESFUsability?.beforeRestore(page);window.ESFCiap?.restore(cfg.prefix,[]);
    page?.querySelectorAll('.ux-draft-prompt').forEach(e=>e.remove());
   }
   ATENDIMENTO_EM_EDICAO=null;fecharPaciente();limparCadastroTerritorial();
   document.querySelectorAll('.edit-modal.open').forEach(e=>e.classList.remove('open'));
   for(const id of ['pac-lista','hist-lista','rel-conteudo','terr-lista','ind-ciap'])document.getElementById(id)?.replaceChildren();
  }
  anterior=atual;
 }
 async function vincular(cpf){
  if(!escopoDadosClinicos().municipal)return showToast('Somente a gestão municipal pode vincular a UBS.');
  if(!_sb||!navigator.onLine||window.MODO_OFFLINE)return showToast('Conecte-se para alterar o vínculo de UBS.');
  const unidade=document.getElementById('pac-vinculo-ubs')?.value||null,escopo=escopoDadosClinicos().chave;
  try{
   const {data,error}=await _sb.from('pacientes').update({unidade,updated_by:CURRENT_AUTH_USER_ID}).eq('cpf',cpf).select('cpf,unidade').maybeSingle();
   if(escopo!==escopoDadosClinicos().chave)return;if(error)throw error;if(!data)throw Error('Cadastro indisponível.');
   await baixarPacientesNuvem();if(escopo!==escopoDadosClinicos().chave)return;abrirPaciente(cpf);renderPacientes();showToast('Vínculo de UBS atualizado.');
  }catch{showToast('Não foi possível alterar a UBS. Confira a permissão e sincronize o cadastro.');}
 }
 window.ESFEscopo={atualizar,vincular};
 document.addEventListener('DOMContentLoaded',()=>{
  anterior=escopoDadosClinicos().chave;
  const abrir=window.abrirPaciente;
  window.abrirPaciente=function(cpf){
   abrir(cpf);const p=carregarPacientes()[cpf],out=document.getElementById('pac-modal-conteudo');if(!p||!out)return;
   const box=document.createElement('div');box.className='alert alert-i';
   const label=document.createElement('label');label.textContent='UBS do cadastro: '+(p.unidade||'Não vinculada — acesso restrito à gestão municipal');box.append(label);
   if(escopoDadosClinicos().municipal){
    const select=document.createElement('select');select.id='pac-vinculo-ubs';select.setAttribute('aria-label','UBS do cadastro');select.innerHTML=ESFUnidades.options(p.unidade||'');
    const button=document.createElement('button');button.type='button';button.className='btn btn-s';button.textContent='Salvar vínculo de UBS';button.onclick=()=>vincular(cpf);box.append(select,button);
   }
   out.prepend(box);
  };
  const go=window.go;window.go=function(...args){atualizar();return go.apply(this,args);};
 });
})();
