/* Prévia editável: remoção automática não prova anonimização de texto livre. */
window.revisarEnvioIA=function(soap){
 return new Promise(resolve=>{
  const backdrop=document.createElement('div');backdrop.className='ia-compare-backdrop';backdrop.id='ia-send-review';
  const modal=document.createElement('div');modal.className='ia-compare-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Conferir texto enviado à IA');
  const title=document.createElement('h3');title.textContent='Conferir texto antes de enviar à IA';
  const note=document.createElement('p');note.textContent='Identificadores conhecidos foram removidos. Confira o texto e retire nomes, endereços e outros detalhes que permitam identificar a pessoa. Apenas o texto abaixo será enviado.';
  const area=document.createElement('textarea');area.value=soap;area.style.cssText='width:100%;min-height:280px';area.setAttribute('aria-label','Texto a enviar à IA');
  const actions=document.createElement('div');actions.className='ia-compare-actions';
  const finish=value=>{backdrop.remove();resolve(value);};
  const cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn-s';cancel.textContent='Cancelar';cancel.onclick=()=>finish(null);
  const send=document.createElement('button');send.type='button';send.className='btn btn-p';send.textContent='Conferi o texto, enviar';send.onclick=()=>finish(area.value.trim()||null);
  actions.append(cancel,send);modal.append(title,note,area,actions);backdrop.append(modal);document.body.append(backdrop);area.focus();
  backdrop.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish(null);}if(e.key==='Tab'){const first=area,last=send;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 });
};
