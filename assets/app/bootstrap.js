const _SB_URL = 'https://mcmletzjgykhwknshacg.supabase.co';
const _SB_KEY = 'sb_publishable_E6SrzpJ09LIiIq1PJJAP8A_sq9_98Lb';
let _sb = null;

/* ===== Sistema de ícones SVG (substitui emojis) — traços Feather/Lucide, herdam cor (currentColor) e tamanho (1em) ===== */
const _IC_ATTRS = 'viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-.15em;flex-shrink:0" aria-hidden="true"';
const _IC_PATHS = {
  // pessoas / módulos
  pregnant: '<circle cx="12" cy="4" r="2"/><path d="M12 6v7"/><path d="M12 9c3 0 5 2 5 5 0 2-1 4-3 4"/><path d="M9 13v6"/><path d="M15 19v2M9 19v2"/>',
  stethoscope: '<path d="M6 3v6a5 5 0 0 0 10 0V3"/><path d="M6 3H4M16 3h2"/><path d="M11 14v2a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-1"/><circle cx="20" cy="14" r="2"/>',
  baby: '<circle cx="12" cy="6" r="3"/><path d="M9 6h.01M15 6h.01"/><path d="M10.5 8.5c.5.4 1 .5 1.5.5s1-.1 1.5-.5"/><path d="M6 13c1.5 2 3.7 3 6 3s4.5-1 6-3"/><path d="M8 12v5a4 4 0 0 0 8 0v-5"/>',
  child: '<circle cx="12" cy="5" r="2.5"/><path d="M12 7.5V15"/><path d="M8 10h8"/><path d="M9 21l3-6 3 6"/>',
  elder: '<circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v7"/><path d="M8.5 11h7"/><path d="M9 21l1.5-6.5M15 21l-1.5-6.5"/><path d="M17 10v11"/>',
  brain: '<path d="M9.5 3A2.5 2.5 0 0 0 7 5.5c-1.4.3-2.5 1.6-2.5 3 0 .5.1 1 .4 1.4-.6.5-1 1.3-1 2.2 0 1 .5 1.9 1.3 2.4-.1.3-.2.7-.2 1 0 1.5 1.2 2.7 2.7 2.7.5 0 1-.1 1.4-.4.3.8 1.1 1.4 2 1.4V3.5A.5.5 0 0 0 9.5 3z"/><path d="M14.5 3A2.5 2.5 0 0 1 17 5.5c1.4.3 2.5 1.6 2.5 3 0 .5-.1 1-.4 1.4.6.5 1 1.3 1 2.2 0 1-.5 1.9-1.3 2.4.1.3.2.7.2 1 0 1.5-1.2 2.7-2.7 2.7-.5 0-1-.1-1.4-.4-.3.8-1.1 1.4-2 1.4"/>',
  users: '<path d="M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3"/><path d="M22 20v-1a4 4 0 0 0-3-3.87"/><path d="M16 4.13A4 4 0 0 1 16 12"/>',
  user: '<path d="M19 21v-1a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v1"/><circle cx="12" cy="7" r="4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  gemini: '<circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M4.5 21v-2a3 3 0 0 1 3-3M19.5 21v-2a3 3 0 0 0-3-3"/>',
  flower: '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V6M12 14.5V18M9.5 12H6M14.5 12H18M10.2 10.2 7.8 7.8M13.8 13.8l2.4 2.4M13.8 10.2l2.4-2.4M10.2 13.8l-2.4 2.4"/>',
  // ações / seções
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
  pill: '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(45 12 12)"/><path d="M8.5 8.5l7 7"/>',
  microscope: '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 0 0 0-14"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6l3-3 2 2-3 3"/>',
  report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  ruler: '<path d="M3 14l7 7 11-11-7-7z"/><path d="M7 10l2 2M10 7l2 2M13 4l2 2M4 13l2 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0 5 5l-9.6 9.6a2 2 0 0 1-2.8-2.8z"/><path d="M18 2l1.5 1.5L21 5l-2 2-2-2z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="M15 5l4 4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
  // clínicos
  virus: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  flask: '<path d="M9 2h6"/><path d="M10 2v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V2"/><path d="M7 15h10"/>',
  dna: '<path d="M4 3c0 5 16 5 16 11M20 3c0 5-16 5-16 11M4 21c0-5 16-5 16-11"/><path d="M7 5h10M8 8h8M8 16h8M7 19h10"/>',
  syringe: '<path d="M18 2l4 4"/><path d="M17 3l4 4-2 2-4-4z"/><path d="M15 5 4 16l-2 6 6-2L19 9z"/><path d="M8 13l3 3M11 10l3 3"/>',
  blood: '<path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>',
  lungs: '<path d="M12 3v8"/><path d="M10 8c0 5-1 6-3 8-1.5 1.5-4 1.5-4-1 0-3 1-6 3-8 2-2 4-1 4 1z"/><path d="M14 8c0 5 1 6 3 8 1.5 1.5 4 1.5 4-1 0-3-1-6-3-8-2-2-4-1-4 1z"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z"/>',
  kidney: '<path d="M8 4c3 0 4 3 4 6s1 6-3 6-5-3-5-6 1-6 4-6z"/><path d="M16 4c-3 0-4 3-4 6M16 22c3 0 4-3 4-6s-1-6-4-6"/>',
  bone: '<path d="M17 3a2.5 2.5 0 0 1 2 4l-9 9a2.5 2.5 0 1 1-3 3 2.5 2.5 0 1 1-3-3l9-9a2.5 2.5 0 0 1 4-2z"/>',
  salad: '<path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M12 12V8M12 8c0-2 1.5-3 3-3M12 8c0-2-1.5-3-3-3"/>',
  candy: '<circle cx="12" cy="12" r="4"/><path d="M8 12 4 9v6zM16 12l4-3v6z"/>',
  utensils: '<path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12"/><path d="M17 2c-2 0-3 2-3 5s1 4 3 4v11"/>',
  hospital: '<path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 22h20"/><path d="M12 7v4M10 9h4"/><path d="M9 22v-4h6v4"/>',
  house: '<path d="M3 10l9-7 9 7"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/>',
  puzzle: '<path d="M9 3h6v3a2 2 0 0 0 4 0h2v6h-3a2 2 0 0 0 0 4h3v3H9v-3a2 2 0 0 0-4 0H3v-6h3a2 2 0 0 0 0-4H3V3h6z"/>',
  butterfly: '<path d="M12 5v14"/><path d="M12 8C10 4 4 4 4 9c0 4 4 5 8 3M12 8c2-4 8-4 8 1 0 4-4 5-8 3M12 14c-2 4-6 4-6 0M12 14c2 4 6 4 6 0"/>',
  // status / alertas
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6M19 3l3 3"/>',
  friable: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  inbox: '<path d="M4 4h16v10h-5l-1 3h-4l-1-3H4z"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  dove: '<path d="M22 6c-2 0-4 1-5 3-1-4-5-6-9-5 2 1 3 3 3 5-3 0-6 2-7 5 2-1 4-1 6 0-1 2-1 4 0 6 1-3 3-5 6-6 2 0 4-1 5-3 1 2 3 3 5 3-2-2-3-5-2-8 0 0 0-1-2-3z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  feather: '<path d="M20 5a5.5 5.5 0 0 0-8 0l-6 6v6h6l6-6a5.5 5.5 0 0 0 2-6z"/><path d="M16 8 4 20M13 11h-4M11 13v4"/>',
  rainbow: '<path d="M3 17a9 9 0 0 1 18 0"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M9 17a3 3 0 0 1 6 0"/>',
  seedling: '<path d="M12 22V11"/><path d="M12 11C12 7 8 6 4 6c0 4 4 5 8 5zM12 13c0-3 3-4 6-4 0 3-3 4-6 4z"/>',
  knife: '<path d="M4 20 20 4M14 4c4 0 6 2 6 6L9 21 4 20l1-5z"/><path d="M18 6 6 18"/>'
};
function ic(nome){ var p=_IC_PATHS[nome]; return p?('<svg '+_IC_ATTRS+'>'+p+'</svg>'):('<svg '+_IC_ATTRS+'><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>'); }
function icrisk(n){ var m={alto:'dr',inter:'da',hab:'dg',dr:'dr',da:'da',dg:'dg'}; return '<span class="dot dot-lg '+(m[n]||'dg')+'"></span>'; }
// Hidrata ícones declarados em HTML estático via data-ic="nome" (preenche uma vez; não reprocessa).
function hidratarIcones(raiz){ (raiz||document).querySelectorAll('[data-ic]:not([data-ic-done])').forEach(function(el){ el.innerHTML=ic(el.getAttribute('data-ic')); el.setAttribute('data-ic-done','1'); }); }
document.addEventListener('DOMContentLoaded',function(){ hidratarIcones(); try{ var io=new MutationObserver(function(){ hidratarIcones(); }); io.observe(document.body,{childList:true,subtree:true}); }catch(e){} });
const DEPENDENCIAS_REDE={
  supabase:['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2','https://unpkg.com/@supabase/supabase-js@2'],
  pdfjs:['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js','https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js'],
  chart:['https://cdn.jsdelivr.net/npm/chart.js','https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js']
};
function carregarScriptComLimite(src,timeout=7000){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script'),timer=setTimeout(()=>{s.remove();reject(new Error('Tempo excedido: '+src))},timeout);
    s.src=src;s.async=true;s.onload=()=>{clearTimeout(timer);resolve(src)};s.onerror=()=>{clearTimeout(timer);s.remove();reject(new Error('Bloqueado ou indisponível: '+src))};document.head.appendChild(s);
  });
}
async function carregarDependenciaRede(nome,teste){
  if(teste())return true;
  for(const src of DEPENDENCIAS_REDE[nome]||[]){try{await carregarScriptComLimite(src);if(teste())return true}catch(e){console.warn(e.message)}}
  return false;
}
async function inicializarSupabase(){
  const ok=await carregarDependenciaRede('supabase',()=>!!window.supabase?.createClient);
  if(ok&&!_sb)_sb=window.supabase.createClient(_SB_URL,_SB_KEY);
  return !!_sb;
}
function comLimite(promise,timeout=9000,mensagem='A conexão demorou além do esperado.'){
  return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(mensagem)),timeout))]);
}
const PERMISSOES_PADRAO={ver_historico:true,usar_modo_teste:false,usar_ia_soap:false,gerar_documentos:true,editar_protocolos:false,reportar_erro:true,ver_reportes:false,ver_admin:false,nivel_acesso:'enfermeiro',unidade_escopo:'',municipio_escopo:'Toledo'};
let PERMISSOES_ATUAIS={...PERMISSOES_PADRAO};
function temPermissao(chave){return PERMISSOES_ATUAIS[chave]===true;}
function exigirPermissao(chave,mensagem='Você não possui permissão para usar este recurso.'){if(temPermissao(chave))return true;showToast(mensagem);return false;}
