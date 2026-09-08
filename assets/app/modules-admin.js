// --- SUPABASE AUTH & ADMIN LOGIC ---

document.addEventListener('DOMContentLoaded', async () => {
  const status=document.getElementById('auth-connection-status'),err=document.getElementById('auth-err-login');
  if(status)status.textContent='Conectando ao login seguro...';
  const conectado=await inicializarSupabase();
  if(!conectado){
    if(entrarModoOffline()){
      if(status)status.textContent='';
    }else{
      if(status)status.textContent='O site abriu, mas a rede bloqueou o serviço de login.';
      if(err){err.textContent='Use “Diagnóstico de conexão” e solicite à TI a liberação dos endereços indicados. Se você já entrou neste dispositivo antes, tente novamente com internet para habilitar o modo offline.';err.style.display='block';}
    }
    return;
  }
  try{
    const { data: { session } } = await comLimite(_sb.auth.getSession(),9000,'O serviço de login não respondeu. A rede da unidade pode estar bloqueando o Supabase.');
    verificarAcesso(session);
    if(status)status.textContent='Acesse com seu email e senha cadastrados';
    _sb.auth.onAuthStateChange((event, session) => verificarAcesso(session));
  }catch(e){
    // Sessão não respondeu: tenta modo offline com sessão em cache antes de bloquear.
    if(entrarModoOffline()){
      if(status)status.textContent='';
    }else{
      if(status)status.textContent='O site abriu, mas o serviço de login não respondeu.';
      if(err){err.textContent=e.message;err.style.display='block';}
    }
  }
  setTimeout(()=>{garantirChartJs();garantirPdfJs()},500);
});

async function diagnosticarConexao(){
  const out=document.getElementById('auth-network-diagnostic');out.style.display='block';out.textContent='Testando conexão...';
  const linhas=[`Site atual: ${location.hostname||'arquivo local'} — OK`];
  const testar=async(nome,url)=>{
    try{await comLimite(fetch(url,{mode:'no-cors',cache:'no-store'}),5000);linhas.push(`${nome}: acessível`)}
    catch(e){linhas.push(`${nome}: BLOQUEADO ou sem resposta`)}
  };
  await testar('Banco/login Supabase',_SB_URL+'/auth/v1/health');
  await testar('Bibliotecas CDN','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  out.textContent=linhas.join('\n')+'\n\nSolicitar à TI a liberação HTTPS (porta 443) de:\n'+[
    location.hostname,
    'mcmletzjgykhwknshacg.supabase.co',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ].filter(Boolean).join('\n');
}

function aplicarPermissoesInterface(){
  const mostrar=(seletor,permitido)=>document.querySelectorAll(seletor).forEach(el=>el.style.display=permitido?'':'none');
  mostrar('[onclick*="historico"]',temPermissao('ver_historico'));
  mostrar('[onclick*="pacientes"]',temPermissao('ver_historico'));
  mostrar('[onclick*="busca-ativa"],[onclick*="indicadores"],[onclick*="territorio"],[onclick*="relatorios"]',temPermissao('ver_historico'));
  mostrar('[onclick*="editor"]',temPermissao('editar_protocolos'));
  mostrar('.nb-reportes,[onclick*="reportes"]',temPermissao('reportar_erro'));
  mostrar('.quick-action-btn.ai,[onclick*="gerarSoapPorIA"]',temPermissao('usar_ia_soap'));
  mostrar('#btn-ficha-rosa,[onclick*="gerarPdfERSM"],[onclick*="gerarLaudoTesteRapido"],[onclick*="gerarTodosLaudosTesteRapido"]',temPermissao('gerar_documentos'));
  document.querySelectorAll('.admin-test-btn').forEach(el=>el.style.display=temPermissao('usar_modo_teste')?'inline-flex':'none');
  if(temPermissao('usar_modo_teste'))mostrarBotoesTesteAdmin();
  if(temPermissao('ver_admin')&&!document.getElementById('admin-nav-btn')){
    const nav=document.querySelector('.bar-nav'),btn=document.createElement('button');
    if(nav){btn.id='admin-nav-btn';btn.className='nb';btn.style.borderColor='rgba(255,100,100,0.5)';btn.style.color='#ff9999';btn.innerHTML=ic('shield')+' Admin';btn.onclick=abrirAdmin;nav.appendChild(btn);}
  }
  aplicarModulosAtivos();
}

function reabrirAtendimento(id){
  const a=carregarAtendimentos().find(x=>x.id===id),cfg=a&&MODULOS_ATENDIMENTO[a.tipo];
  if(!a||!cfg)return showToast('Não foi possível reabrir este atendimento.');
  if(!a.dados||!Object.keys(a.dados).length)return showToast('Este atendimento antigo possui apenas o SOAP. Use o botão Editar.');
  registrarAuditoria('Atendimento reaberto',`${a.tipo} · ${a.id}`);
  ATENDIMENTO_EM_EDICAO=id;
  go(cfg.page);
  setTimeout(()=>{restaurarDadosModulo(cfg.prefix,a.dados);window.scrollTo({top:0,behavior:'smooth'});showToast('Consulta reaberta. Ao salvar, o histórico será atualizado.');},120);
}
async function carregarPermissoesUsuario(user){
  const admin=user?.email==='inpress.rodrigues@gmail.com';
  if(admin){PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,ver_historico:true,usar_modo_teste:true,usar_ia_soap:true,gerar_documentos:true,editar_protocolos:true,reportar_erro:true,ver_reportes:true,ver_admin:true,nivel_acesso:'gerente_municipal',municipio_escopo:'Toledo'};aplicarPermissoesInterface();_cacharSessaoOffline(user);return;}
  PERMISSOES_ATUAIS={...PERMISSOES_PADRAO};
  if(_sb&&user?.id){
    const {data}=await _sb.from('perfis').select('nome,cargo,unidade,permissoes').eq('user_id',user.id).maybeSingle();
    if(data?.permissoes)PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,...data.permissoes};
    if(data)CURRENT_USER_PROFILE={...(CURRENT_USER_PROFILE||{}),nome:data.nome||CURRENT_USER_PROFILE?.nome||'',cargo:data.cargo||CURRENT_USER_PROFILE?.cargo||'',unidade:data.unidade||CURRENT_USER_PROFILE?.unidade||'',nivel_acesso:PERMISSOES_ATUAIS.nivel_acesso,municipio:PERMISSOES_ATUAIS.municipio_escopo||'Toledo'};
  }
  aplicarPermissoesInterface();
  _cacharSessaoOffline(user);
}

// Guarda a última sessão bem-sucedida (id, perfil, permissões) para permitir
// entrada em modo offline quando o SDK do Supabase não carrega (rede bloqueada).
function _cacharSessaoOffline(user){
  try{
    const meta=user?.user_metadata||{};
    const profile=CURRENT_USER_PROFILE||{nome:meta.nome||user?.email||'',cargo:meta.cargo||'',conselho:meta.conselho||'',unidade:meta.unidade||''};
    const ts=Date.now();sessionStorage.setItem('esf_autorizacao_offline',JSON.stringify({uid:user?.id||'',ts,atividade:ts}));
    sessionStorage.setItem('esf_sessao_cache',JSON.stringify({uid:user?.id||'',profile,permissoes:PERMISSOES_ATUAIS,ts}));
  }catch(e){}
}

// Entra no app usando a sessão em cache, sem rede. Retorna true se conseguiu.
function entrarModoOffline(){
  let cache=null,aut=null;try{cache=JSON.parse(sessionStorage.getItem('esf_sessao_cache')||'null');aut=JSON.parse(sessionStorage.getItem('esf_autorizacao_offline')||'null')}catch(e){}
  const now=Date.now();if(!cache?.uid||aut?.uid!==cache.uid||!aut.ts||now-aut.ts>8*60*60*1000||now-aut.atividade>15*60*1000||now<aut.ts)return false;
  window.MODO_OFFLINE=true;
  CURRENT_AUTH_USER_ID=cache.uid;
  CURRENT_USER_PROFILE=cache.profile||null;
  PERMISSOES_ATUAIS={...PERMISSOES_PADRAO,...(cache.permissoes||{}),ver_admin:false,editar_protocolos:false,usar_ia_soap:false,usar_modo_teste:false};
  const authScreen=document.getElementById('auth-screen');if(authScreen)authScreen.classList.remove('visible');
  try{aplicarPermissoesInterface()}catch(e){}
  try{iniciarSessaoSegura()}catch(e){}
  const nome=(CURRENT_USER_PROFILE&&CURRENT_USER_PROFILE.nome)||'';
  const chip=document.getElementById('user-chip-label');if(chip)chip.innerText=nome?nome.split(' ')[0]:'Minha Conta';
  try{registrarAuditoria('Acesso offline','Sessão em cache — sem rede')}catch(e){}
  mostrarBannerOffline();
  return true;
}

// Banner persistente indicando o modo offline (sem overlap: empurra o corpo/sidebar).
function mostrarBannerOffline(){
  if(document.getElementById('offline-banner'))return;
  if(!document.getElementById('offline-banner-style')){
    const st=document.createElement('style');st.id='offline-banner-style';
    st.textContent='#offline-banner{position:fixed;top:0;left:0;right:0;height:30px;line-height:1.25;z-index:400;background:#8d3b00;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;text-align:center;padding:2px 12px;box-shadow:0 2px 10px rgba(0,0,0,.2)}body.modo-offline{padding-top:30px}body.modo-offline .bar{top:30px;height:calc(100vh - 30px)}';
    document.head.appendChild(st);
  }
  document.body.classList.add('modo-offline');
  const b=document.createElement('div');b.id='offline-banner';
  b.textContent='Modo offline: usando dados locais deste dispositivo. Sincronização com a nuvem e IA SOAP indisponíveis até reconectar.';
  document.body.appendChild(b);
}

function limparDadosDaTelaAoSair(){
  clearTimeout(autoDraftTimer);
  document.querySelectorAll('.pg input,.pg textarea,.pg select').forEach(e=>{if(e.type==='checkbox'||e.type==='radio')e.checked=false;else if(e.type==='file')e.value='';else if(e.tagName==='SELECT')e.selectedIndex=0;else e.value='';});
  document.querySelectorAll('.pg .selected,.pg .clinical-chip.on').forEach(e=>e.classList.remove('selected','on'));
  document.querySelectorAll('.pg').forEach(e=>{delete e.dataset.draftChecked;delete e.dataset.userEdited;});
  document.querySelectorAll('.edit-modal.open').forEach(e=>{e.classList.remove('open');e.querySelectorAll('input,textarea,select').forEach(f=>f.value='');});
  document.querySelectorAll('.ia-compare-backdrop').forEach(e=>e.remove());
  document.querySelectorAll('#hist-tbody,#pac-tbody,#ba-tbody,#rel-conteudo,#admin-stats').forEach(e=>e.replaceChildren());
  document.querySelectorAll('[id^="ex-ai-out-"],[id^="clinical-validation-"],[id^="auditoria-pdf-validacao-"]').forEach(e=>e.replaceChildren());
  if(typeof EXAMES_PADRAO!=='undefined')Object.keys(EXAMES_PADRAO).forEach(k=>delete EXAMES_PADRAO[k]);
  if(typeof VAC_RESULTADOS!=='undefined')Object.keys(VAC_RESULTADOS).forEach(k=>delete VAC_RESULTADOS[k]);
  window.ultimoRiscoPna=null;window.__ultimoSoapIA=null;window.MODO_OFFLINE=false;
  document.getElementById('offline-banner')?.remove();document.body.classList.remove('modo-offline');
  PERMISSOES_ATUAIS={...PERMISSOES_PADRAO};
}
function verificarAcesso(session) {
  const authScreen = document.getElementById('auth-screen');
  if (!session) {
    if(CURRENT_AUTH_USER_ID){try{salvarRascunhoAutomatico();registrarAuditoria('Logout','Sessão encerrada');}catch(e){}}
    sessionStorage.removeItem('esf_sessao_cache');sessionStorage.removeItem('esf_autorizacao_offline');localStorage.removeItem('esf_sessao_cache');
    limparDadosDaTelaAoSair();
    CURRENT_AUTH_USER_ID='';
    CURRENT_USER_PROFILE=null;
    clearTimeout(inactivityTimer);
    if(window.trialInterval){clearInterval(window.trialInterval);window.trialInterval=null;}
    authScreen.classList.add('visible');
  } else {
    authScreen.classList.remove('visible');
    const user = session.user;
    if(CURRENT_AUTH_USER_ID&&CURRENT_AUTH_USER_ID!==user.id){salvarRascunhoAutomatico();limparDadosDaTelaAoSair();}
    const meta = user.user_metadata || {};
    carregarPermissoesUsuario(user);
    CURRENT_AUTH_USER_ID=user.id;
    CURRENT_USER_PROFILE={nome:meta.nome||user.email||'',cargo:meta.cargo||'',conselho:meta.conselho||'',unidade:meta.unidade||''};
    localStorage.setItem(chaveUsuarioAtual(),JSON.stringify(CURRENT_USER_PROFILE));
    registrarAuditoria('Login','Acesso autenticado');
    iniciarSessaoSegura();
    carregarAparenciaNuvem();
    agendarSincronizacao();
    baixarAtendimentosNuvem();
    baixarPacientesNuvem();

    // Auto-preencher painel do usuário local e desabilitar edição
    if(document.getElementById('u-nome')) {
      const el = document.getElementById('u-nome');
      el.value = meta.nome || '';
      el.readOnly = true;
      el.style.backgroundColor = 'var(--sf2)';
    }
    if(document.getElementById('u-cargo')) {
      const el = document.getElementById('u-cargo');
      el.value = meta.cargo || '';
      el.disabled = true;
    }
    if(document.getElementById('u-conselho')) {
      const el = document.getElementById('u-conselho');
      el.value = meta.conselho || '';
      el.readOnly = true;
      el.style.backgroundColor = 'var(--sf2)';
    }
    if(document.getElementById('u-unidade')) {
      const el = document.getElementById('u-unidade');
      el.value = meta.unidade || '';
      el.readOnly = true;
      el.style.backgroundColor = 'var(--sf2)';
    }

    // Ocultar botão "Salvar" do modal antigo
    const saveBtn = document.querySelector('.user-save-btn');
    if (saveBtn) saveBtn.style.display = 'none';

    if(document.getElementById('user-chip-label')) document.getElementById('user-chip-label').innerText = meta.nome ? meta.nome.split(' ')[0] : 'Minha Conta';

    // --- LOGICA DE CONTA TESTE (TRIAL) ---
    if (meta.role === 'trial' && meta.expiry) {
      const expiryDate = new Date(meta.expiry).getTime();
      const now = new Date().getTime();
      if (now > expiryDate) {
        alert("Sua conta teste expirou!");
        _sb.auth.signOut();
        return;
      }

      let countdownEl = document.getElementById('trial-countdown');
      if (!countdownEl) {
        countdownEl = document.createElement('div');
        countdownEl.id = 'trial-countdown';
        countdownEl.style.cssText = 'font-size:9px;color:#ffe875;font-weight:bold;margin-top:2px;text-transform:uppercase;line-height:1;white-space:nowrap;';

        const chipLabel = document.getElementById('user-chip-label');
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'flex-start';
        wrapper.id = 'trial-wrapper';

        chipLabel.parentNode.insertBefore(wrapper, chipLabel);
        wrapper.appendChild(chipLabel);
        wrapper.appendChild(countdownEl);
      }

      if (window.trialInterval) clearInterval(window.trialInterval);
      const updateTime = () => {
        const distance = expiryDate - new Date().getTime();
        if (distance <= 0) {
          clearInterval(window.trialInterval);
          alert("Sua conta teste expirou!");
          _sb.auth.signOut();
        } else {
          const h = Math.floor(distance / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          document.getElementById('trial-countdown').innerText = `TESTE: ${h}h ${m}m restantes`;
        }
      };
      updateTime();
      window.trialInterval = setInterval(updateTime, 60000);
    }

    // Se for admin, mostrar botões exclusivos
    if (user.email === 'inpress.rodrigues@gmail.com') {
      mostrarBotoesTesteAdmin();
      const btnTeste = document.getElementById('btn-prev-teste');
      if (btnTeste) btnTeste.style.display = 'inline-flex';
      if (!document.getElementById('admin-nav-btn')) {
        const nav = document.querySelector('.bar-nav');
        if (nav) {
          const btn = document.createElement('button');
          btn.id = 'admin-nav-btn';
          btn.className = 'nb';
          btn.style.borderColor = 'rgba(255,100,100,0.5)';
          btn.style.color = '#ff9999';
          btn.innerHTML = ic('shield')+' Admin';
          btn.onclick = abrirAdmin;
          nav.appendChild(btn);
        }
      }
    }

    // Adicionar botão de Sair / Trocar Usuário
    const userPanel = document.querySelector('.user-panel');
    if (userPanel && !document.getElementById('btn-logout')) {
      const btnLogout = document.createElement('button');
      btnLogout.id = 'btn-logout';
      btnLogout.innerText = 'Sair da Conta (Trocar Usuário)';
      btnLogout.style.cssText = 'background:#fee2e2;color:#b91c1c;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;width:100%;margin-top:10px;';
      btnLogout.onclick = async () => {
        await _sb.auth.signOut();
        if(document.getElementById('user-modal')) document.getElementById('user-modal').classList.remove('open');
      };
      userPanel.appendChild(btnLogout);
    }
  }
}

async function authLogin() {
  let email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  const errDiv = document.getElementById('auth-err-login');

  if (!email.includes('@')) email = email + '@esf.temp';

  errDiv.style.display = 'none';
  const btn = document.getElementById('auth-login-btn');
  btn.disabled = true;
  btn.innerText = 'Entrando...';

  if(!_sb)await inicializarSupabase();
  if(!_sb){errDiv.innerText='A rede bloqueou o serviço de login. Abra o Diagnóstico de conexão.';errDiv.style.display='block';btn.disabled=false;btn.innerText='Entrar';return;}
  let data,error;
  try{({data,error}=await comLimite(_sb.auth.signInWithPassword({ email, password: pass }),12000,'O login não respondeu. Verifique o bloqueio da rede da UBS.'))}
  catch(e){error=e}

  btn.disabled = false;
  btn.innerText = 'Entrar';

  if (error) {
    const m=(error.message||'').toLowerCase();
    let msg='Não foi possível entrar. Verifique o email e a senha.';
    if(/invalid login|invalid credentials|credentials/.test(m))msg='Email ou senha incorretos.';
    else if(/email not confirmed|not confirmed/.test(m))msg='Seu email ainda não foi confirmado. Fale com o administrador.';
    else if(/network|failed to fetch|timeout|não respondeu|rede/.test(m))msg='Sem resposta do servidor. Verifique a conexão ou o bloqueio da rede da unidade (use o Diagnóstico de conexão).';
    else if(/too many|rate limit/.test(m))msg='Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
    errDiv.innerText = msg;
    errDiv.style.display = 'block';
  }
}

async function recuperarSenha(){
  const errDiv = document.getElementById('auth-err-login');
  let email = (document.getElementById('auth-email').value || '').trim();
  if(!email){
    showToast('Digite seu email primeiro para receber o link de redefinição.');
    return;
  }
  if(!email.includes('@')) email = email + '@esf.temp';
  errDiv.style.display = 'none';
  if(!_sb) await inicializarSupabase();
  if(!_sb){
    errDiv.innerText = 'A rede bloqueou o serviço de redefinição de senha. Abra o Diagnóstico de conexão e solicite à TI a liberação dos endereços indicados.';
    errDiv.style.display = 'block';
    return;
  }
  try{
    const {error} = await comLimite(_sb.auth.resetPasswordForEmail(email),12000,'O servidor de redefinição não respondeu. Verifique o bloqueio da rede da unidade.');
    if(error) throw error;
    errDiv.innerText = 'Se este email tiver conta, enviamos um link de redefinição.';
    errDiv.style.display = 'block';
  }catch(e){
    const m = (e?.message || '').toLowerCase();
    if(/network|failed to fetch|timeout|não respondeu|rede/.test(m)){
      errDiv.innerText = 'Sem resposta do servidor. Verifique a conexão ou o bloqueio da rede da unidade (use o Diagnóstico de conexão).';
    }else if(/too many|rate limit/.test(m)){
      errDiv.innerText = 'Muitas solicitações. Aguarde alguns minutos e tente novamente.';
    }else{
      // Mensagem neutra: não revela se o email existe.
      errDiv.innerText = 'Se este email tiver conta, enviamos um link de redefinição.';
    }
    errDiv.style.display = 'block';
  }
}

const APARENCIA_KEY='esf_aparencia_v1';
const APARENCIA_PADRAO={primary:'#175930',accent:'#3a1d68',bg:'#f1f0eb',surface:'#ffffff',font:'DM Sans',corner:8,opacity:64,blur:20,radius:18,shadow:12};
let APARENCIA_ATUAL={...APARENCIA_PADRAO};
function hexRgb(hex){const h=(hex||'#ffffff').replace('#','');return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}}
function rgbHex({r,g,b}){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function misturarCor(a,b,p){const x=hexRgb(a),y=hexRgb(b);return rgbHex({r:x.r+(y.r-x.r)*p,g:x.g+(y.g-x.g)*p,b:x.b+(y.b-x.b)*p})}
function corRgba(hex,alpha){const c=hexRgb(hex);return `rgba(${c.r},${c.g},${c.b},${alpha})`}
function corEscura(hex){const c=hexRgb(hex);return (c.r*299+c.g*587+c.b*114)/1000<145}
function aplicarAparencia(cfg){
  APARENCIA_ATUAL={...APARENCIA_PADRAO,...cfg};
  const a=APARENCIA_ATUAL,root=document.documentElement.style,tx=corEscura(a.surface)?'#f4f6f4':'#1c1b17',tx2=corEscura(a.surface)?'#c5cec8':'#59574f';
  const font=a.font==='Inter'?'Inter, system-ui, sans-serif':a.font==='DM Sans'?"'DM Sans', sans-serif":a.font==='Georgia'?'Georgia, serif':`${a.font}, sans-serif`;
  root.setProperty('--green',a.primary);root.setProperty('--purple',a.accent);root.setProperty('--bg',a.bg);root.setProperty('--sf',a.surface);
  root.setProperty('--sf2',misturarCor(a.surface,a.bg,.55));root.setProperty('--bd',misturarCor(a.surface,corEscura(a.surface)?'#ffffff':'#777777',.2));
  root.setProperty('--tx',tx);root.setProperty('--tx2',tx2);root.setProperty('--font',font);root.setProperty('--r',`${a.corner}px`);root.setProperty('--rl',`${Number(a.corner)+5}px`);
  root.setProperty('--theme-control-radius',`${a.corner}px`);root.setProperty('--theme-glass-radius',`${a.radius}px`);root.setProperty('--theme-dashboard-radius',`${Number(a.radius)+4}px`);
  root.setProperty('--theme-glass-blur',`${a.blur}px`);root.setProperty('--theme-glass-bg',`linear-gradient(145deg,${corRgba(a.surface,a.opacity/100)},${corRgba(a.surface,Math.max(.18,a.opacity/100-.28))})`);
  root.setProperty('--theme-glass-hover',`linear-gradient(145deg,${corRgba(a.surface,Math.min(.98,a.opacity/100+.14))},${corRgba(misturarCor(a.surface,a.primary,.12),Math.max(.3,a.opacity/100-.12))})`);
  root.setProperty('--theme-control-bg',corRgba(a.surface,Math.min(.98,a.opacity/100+.12)));
  root.setProperty('--theme-dashboard-bg',`linear-gradient(142deg,${corRgba(misturarCor(a.bg,a.primary,.18),.97)} 0%,${corRgba(a.bg,.94)} 38%,${corRgba(misturarCor(a.bg,a.accent,.14),.9)} 72%,${corRgba(misturarCor(a.bg,'#86b9d2',.18),.94)} 100%)`);
  root.setProperty('--theme-shadow-box',`0 18px 48px ${corRgba(a.primary,a.shadow/100)}`);
}
function lerAparenciaAdmin(){
  const val=id=>document.getElementById(id)?.value;
  return {primary:val('theme-primary')||APARENCIA_ATUAL.primary,accent:val('theme-accent')||APARENCIA_ATUAL.accent,bg:val('theme-bg')||APARENCIA_ATUAL.bg,surface:val('theme-surface')||APARENCIA_ATUAL.surface,font:val('theme-font')||APARENCIA_ATUAL.font,corner:Number(val('theme-corner-style')||APARENCIA_ATUAL.corner),opacity:Number(val('theme-opacity')||APARENCIA_ATUAL.opacity),blur:Number(val('theme-blur')||APARENCIA_ATUAL.blur),radius:Number(val('theme-radius')||APARENCIA_ATUAL.radius),shadow:Number(val('theme-shadow')||APARENCIA_ATUAL.shadow)};
}
function preencherControlesAparencia(a=APARENCIA_ATUAL){
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v};Object.entries({primary:a.primary,accent:a.accent,bg:a.bg,surface:a.surface,font:a.font,'corner-style':a.corner,opacity:a.opacity,blur:a.blur,radius:a.radius,shadow:a.shadow}).forEach(([k,v])=>set(`theme-${k}`,v));atualizarSaidasAparencia(a);
}
function atualizarSaidasAparencia(a){[['opacity','%'],['blur','px'],['radius','px'],['shadow','%']].forEach(([k,s])=>{const el=document.getElementById(`theme-${k}-out`);if(el)el.textContent=`${a[k]}${s}`})}
function atualizarAparenciaAdmin(){const a=lerAparenciaAdmin();aplicarAparencia(a);atualizarSaidasAparencia(a)}
async function salvarAparenciaAdmin(){const a=lerAparenciaAdmin();aplicarAparencia(a);localStorage.setItem(APARENCIA_KEY,JSON.stringify(a));if(_sb){const {error}=await _sb.from('configuracoes_sistema').upsert({chave:'aparencia',valor:a,updated_at:new Date().toISOString()},{onConflict:'chave'});showToast(error?'Aparência salva neste dispositivo. Execute o SQL seguro para compartilhar com todos.':'Aparência salva para todos os usuários.');return}showToast('Aparência salva neste dispositivo.')}
async function carregarAparenciaNuvem(){if(!_sb)return;const {data}=await _sb.from('configuracoes_sistema').select('valor').eq('chave','aparencia').maybeSingle();if(data?.valor){APARENCIA_ATUAL={...APARENCIA_PADRAO,...data.valor};localStorage.setItem(APARENCIA_KEY,JSON.stringify(APARENCIA_ATUAL));aplicarAparencia(APARENCIA_ATUAL);preencherControlesAparencia(APARENCIA_ATUAL)}}
async function restaurarAparenciaPadrao(){APARENCIA_ATUAL={...APARENCIA_PADRAO};preencherControlesAparencia();aplicarAparencia(APARENCIA_ATUAL);localStorage.removeItem(APARENCIA_KEY);if(_sb)await _sb.from('configuracoes_sistema').upsert({chave:'aparencia',valor:APARENCIA_ATUAL,updated_at:new Date().toISOString()},{onConflict:'chave'});showToast('Aparência padrão restaurada.')}
function aplicarPresetAparencia(nome){
  const presets={liquid:{...APARENCIA_PADRAO},clinico:{...APARENCIA_PADRAO,accent:'#193b6a',opacity:88,blur:8,radius:12,shadow:7},contraste:{...APARENCIA_PADRAO,primary:'#0b4725',accent:'#193b6a',bg:'#e8ebe8',opacity:95,blur:0,radius:10,shadow:16}};
  APARENCIA_ATUAL={...(presets[nome]||APARENCIA_PADRAO)};preencherControlesAparencia();aplicarAparencia(APARENCIA_ATUAL);
}
document.addEventListener('DOMContentLoaded',()=>{try{APARENCIA_ATUAL={...APARENCIA_PADRAO,...JSON.parse(localStorage.getItem(APARENCIA_KEY)||'{}')}}catch(e){}aplicarAparencia(APARENCIA_ATUAL);preencherControlesAparencia(APARENCIA_ATUAL)});

// Lógica Admin
async function usuarioAdminAtual() { return !!_sb&&temPermissao('ver_admin'); }
async function abrirAdmin() {
  if(!await usuarioAdminAtual()){showToast('Acesso restrito ao administrador.');return;}
  document.getElementById('admin-screen').classList.add('visible');
  renderAdminModulos();
  preencherAdminAISoap();
  adminRefresh();
}
function fecharAdmin() {
  document.getElementById('admin-screen').classList.remove('visible');
}
function adminTab(btn,tabId) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  btn?.classList.add('active');
  const sec = document.getElementById('admin-sec-' + tabId);
  if (sec) sec.classList.add('active');
  if(tabId==='ia-soap')preencherAdminAISoap();
}
function adminFiltrarAtd(){
  const busca=(document.getElementById('admin-atd-busca')?.value||'').toLowerCase(),tipo=document.getElementById('admin-atd-tipo')?.value||'';
  document.querySelectorAll('#admin-atd-tbody tr').forEach(tr=>{const texto=tr.textContent.toLowerCase(),tipoLinha=tr.children[1]?.textContent||'';tr.style.display=(!busca||texto.includes(busca))&&(!tipo||tipoLinha.includes(tipo))?'':'none';});
}
async function adminRefresh() {
  if(!await usuarioAdminAtual())return;
  await adminCarregarPermissoes();
  const atdTbody = document.getElementById('admin-atd-tbody');
  if (atdTbody) {
    atdTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Buscando no banco de dados...</td></tr>';
    if(!_sb){atdTbody.innerHTML='<tr><td colspan="6" style="text-align:center;">Admin online indisponível. Verifique a conexão.</td></tr>';return;}

    const { data, error } = await aplicarEscopoQueryAtendimentos(_sb.from('atendimentos').select('*')).order('data', { ascending: false });

    if (error || !data) {
      atdTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#b91c1c;background:#fef2f2;padding:20px;">
        ${ic('warning')} <b>Atenção:</b> Para ver os atendimentos de todos, crie uma tabela chamada <b>atendimentos</b> no seu Supabase com as colunas:<br><br>
        <code>id_local (text), paciente (text), tipo (text), profissional (text), unidade (text), data (text), soap (text), user_id (uuid)</code><br><br>
        Mantenha o RLS (Row Level Security) ativado e crie Policies específicas para leitura e inserção conforme o perfil do usuário.
      </td></tr>`;
    } else if (data.length === 0) {
      atdTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum atendimento registrado na nuvem ainda.</td></tr>';
    } else {
      const stats=document.getElementById('admin-stats');
      if(stats){
        const hoje=new Date().toDateString();
        const hojeTotal=data.filter(a=>new Date(a.data).toDateString()===hoje).length;
        const profissionais=new Set(data.map(a=>a.profissional).filter(Boolean)).size;
        stats.innerHTML=`<div class="admin-stat"><strong>${data.length}</strong><span>atendimentos</span></div><div class="admin-stat"><strong>${hojeTotal}</strong><span>hoje</span></div><div class="admin-stat"><strong>${profissionais}</strong><span>profissionais</span></div>`;
      }
      const typeIcons = {
        'Abertura PN': ic('pregnant'),
        'Consulta PN': ic('stethoscope'),
        'Puericultura': ic('baby'),
        'Preventivo': ic('flower'),
        'Idoso': ic('elder'),
        'Saúde Mental': ic('brain')
      };

      atdTbody.innerHTML = data.map(a => {
        const icon = typeIcons[a.tipo] || ic('doc');
        // Preparando a string pro onclick para não quebrar aspas
        const soapSafe = encodeURIComponent(a.soap);
        const pacSafe = encodeURIComponent(a.paciente);

        return `
        <tr>
          <td><strong>${escTR(a.paciente)}</strong></td>
          <td><span class="badge-ok" style="font-size:12px;padding:4px 10px;border-radius:20px;background:#e0f2fe;color:#075985;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">${icon} ${escTR(a.tipo)}</span></td>
          <td>${escTR(a.profissional)}</td>
          <td>${escTR(a.unidade || '-')}</td>
          <td style="white-space:nowrap;">${new Date(a.data).toLocaleString()}</td>
          <td style="text-align:center;">
            <button onclick="abrirProntuarioAdmin('${pacSafe}', '${soapSafe}')" style="background:#eaf3ee;color:#175930;border:1px solid #b6dcc5;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:bold;display:inline-flex;align-items:center;gap:6px;transition:0.2s;">
              ${ic('eye')} Ver
            </button>
          </td>
        </tr>
      `}).join('');
    }
  }
}

function abrirProntuarioAdmin(pacienteEnc, soapEnc) {
  const paciente = decodeURIComponent(pacienteEnc);
  const soap = decodeURIComponent(soapEnc);

  let modal = document.getElementById('admin-soap-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-soap-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = `
      <div style="background:var(--sf);border-radius:16px;padding:24px;width:100%;max-width:600px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,0.22);">
        <h3 id="admin-soap-title" style="margin-bottom:16px;font-size:16px;font-weight:bold;color:var(--tx);display:flex;align-items:center;gap:8px;">${ic('eye')} Prontuário</h3>
        <textarea id="admin-soap-text" readonly style="flex:1;min-height:250px;border:1px solid var(--bd);border-radius:10px;padding:14px;font-family:monospace;font-size:13px;line-height:1.6;resize:none;background:var(--sf2);color:var(--tx);outline:none;"></textarea>
        <button onclick="document.getElementById('admin-soap-modal').style.display='none'" style="margin-top:16px;background:var(--green);color:#fff;border:none;padding:12px;border-radius:10px;cursor:pointer;font-weight:bold;font-size:14px;">Fechar</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('admin-soap-title').innerText = 'Prontuário de ' + paciente;
  document.getElementById('admin-soap-text').value = soap;
  modal.style.display = 'flex';
}

const PERMISSAO_LABELS={ver_historico:'Histórico',usar_modo_teste:'Modo TESTE',usar_ia_soap:'IA SOAP',gerar_documentos:'Documentos/PDF',editar_protocolos:'Protocolos',reportar_erro:'Reportar',ver_reportes:'Gerenciar relatos',ver_admin:'Admin'};
async function adminCarregarPermissoes(){
  const tbody=document.getElementById('admin-users-tbody');if(!tbody||!_sb)return;
  const {data,error}=await _sb.from('perfis').select('user_id,nome,email,cargo,unidade,permissoes').order('nome');
  if(error){tbody.innerHTML='<tr><td colspan="8">Execute o arquivo SUPABASE-BACKEND-SEGURO.sql para habilitar permissões.</td></tr>';return;}
  tbody.innerHTML=(data||[]).map(p=>{
    const perms={...PERMISSOES_PADRAO,...(p.permissoes||{})};
    const nome=escTR(p.nome||p.email||'Usuário');
    const detalhe=[p.cargo,p.unidade,p.email].filter(Boolean).map(escTR).join(' · ');
    const nivel=perms.nivel_acesso||'enfermeiro',unidade=escTR(perms.unidade_escopo||p.unidade||''),municipio=escTR(perms.municipio_escopo||'Toledo');
    const escopo=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px"><select onchange="adminAlterarPermissao('${p.user_id}','nivel_acesso',this.value)" style="font-size:11px;padding:4px"><option value="enfermeiro" ${nivel==='enfermeiro'?'selected':''}>Enfermeiro</option><option value="gerente_esf" ${nivel==='gerente_esf'?'selected':''}>Gerente ESF/APS</option><option value="gerente_municipal" ${nivel==='gerente_municipal'?'selected':''}>Gerente municipal</option></select><input value="${unidade}" placeholder="Unidade/ESF" onchange="adminAlterarPermissao('${p.user_id}','unidade_escopo',this.value)" style="font-size:11px;padding:4px"><input value="${municipio}" placeholder="Município" onchange="adminAlterarPermissao('${p.user_id}','municipio_escopo',this.value)" style="font-size:11px;padding:4px;grid-column:1/-1"></div>`;
    const check=chave=>`<td style="text-align:center"><input type="checkbox" ${perms[chave]?'checked':''} onchange="adminAlterarPermissao('${p.user_id}','${chave}',this.checked)"></td>`;
    return `<tr><td><strong>${nome}</strong><div style="font-size:11px;color:var(--tx2)">${detalhe}</div>${escopo}</td>${check('ver_historico')}${check('usar_modo_teste')}${check('usar_ia_soap')}${check('gerar_documentos')}${check('editar_protocolos')}${check('ver_reportes')}${check('ver_admin')}</tr>`;
  }).join('')||'<tr><td colspan="8">Nenhum perfil encontrado.</td></tr>';
}
async function adminAlterarPermissao(userId,chave,valor){
  if(!await usuarioAdminAtual())return;
  const {data,error:readError}=await _sb.from('perfis').select('permissoes').eq('user_id',userId).single();
  if(readError){showToast('Não foi possível ler as permissões.');return;}
  const permissoes={...PERMISSOES_PADRAO,...(data?.permissoes||{}),[chave]:valor};
  const {error}=await _sb.from('perfis').update({permissoes,updated_at:new Date().toISOString()}).eq('user_id',userId);
  showToast(error?'Não foi possível salvar a permissão.':'Permissão atualizada.');
}

// =====================================================================
// GERAR FICHA ROSA — 100% no navegador com pdf-lib (sem servidor)
// =====================================================================

function preencherDadosTeste() {
  // Dados fictícios para teste da Ficha Rosa
  const set = (id, val) => { const el = document.getElementById(id); if(el){ el.value = val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }};
  const ck  = (name, val) => { const el = document.querySelector(`input[name="${name}"][value="${val}"]`); if(el){ el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true})); }};
  const nome=sorteioTeste(['Marina Alves Ribeiro','Camila Fernandes Souza','Juliana Martins Pereira','Renata Oliveira Costa','Beatriz Lima Rocha']);

  // Cabeçalho
  set('prev-cnes',       '2796535');
  set('prev-cod-mun',    '4127882');  // Toledo/PR
  set('prev-us',         'UBS COSMOS');
  set('prev-us-mun',     'Toledo / PR');
  set('prev-prontuario', '00415');

  // Dados pessoais
  set('prev-cns',        `7${Array.from({length:14},()=>inteiroTeste(0,9)).join('')}`);
  set('prev-nome',       nome);
  set('prev-nome-mae',   sorteioTeste(['Sonia Maria Ribeiro','Lucia Helena Souza','Aparecida Martins Pereira']));
  set('prev-apelido',    nome.split(' ')[0]);
  set('prev-cpf',        cpfFicticioValido());
  set('prev-nac',        'Brasileira');
  set('prev-nasc',       dataIdadeTeste(inteiroTeste(25,59)));
  set('prev-raca',       'Parda');
  set('prev-escol',      'Ensino Médio Completo');

  // Endereço
  set('prev-logr',   sorteioTeste(['Rua das Flores','Rua São João','Avenida Maripá','Rua Santos Dumont']));
  set('prev-num',    String(inteiroTeste(40,980)));
  set('prev-bairro', sorteioTeste(['Jardim Europa','Centro','Jardim Panorama','Vila Industrial']));
  set('prev-mun',    'Toledo / PR');
  set('prev-cep',    '85900-000');
  set('prev-tel',    `(45) 9${inteiroTeste(1000,9999)}-${inteiroTeste(1000,9999)}`);
  set('prev-ref',    sorteioTeste(['Próximo à escola municipal','Ao lado da praça','Próximo ao mercado do bairro']));

  // Anamnese
  ck('prev-motivo', 'rastr');
  set('prev-fez',       'sim');
  set('prev-ult',       '2024');
  set('prev-diu',       'Não');
  set('prev-gravida',   'Não');
  set('prev-pilula',    'Sim');
  set('prev-thr',       'Não');
  set('prev-radio',     'Não');
  set('prev-dum',       '2026-05-10');
  set('prev-sang-rel',  'nao');
  set('prev-sang-menop','nao');

  // Exame clínico
  ck('prev-colo', 'normal');
  ck('prev-dst',  'nao');

  // Coleta
  const hoje = new Date().toISOString().slice(0,10);
  set('prev-data', hoje);
  set('prev-enf',  sorteioTeste(['Enf. Mariana Lopes','Enf. Carlos Henrique','Enf. Ana Paula Ribeiro']));

  document.getElementById('ficha-rosa-status').style.color='#7c3aed';
  document.getElementById('ficha-rosa-status').textContent='Dados de teste preenchidos.';
  setTimeout(()=>{ document.getElementById('ficha-rosa-status').textContent=''; }, 3000);
}

async function buscarCNES() {
  const nome = (document.getElementById('prev-us')?.value||'').trim();
  const mun  = (document.getElementById('prev-us-mun')?.value||'').replace(/\s*\/.*$/,'').trim();
  const st   = document.getElementById('prev-cnes-status');
  if(!nome){ if(st) st.textContent='Digite o nome da unidade primeiro.'; return; }
  if(st) st.textContent='Buscando...';
  try {
    const q = encodeURIComponent((mun?mun+' ':'')+nome);
    const r = await fetchComTimeout(`https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?nome_fantasia=${q}&limit=5`);
    const j = await r.json();
    const items = j?.itens||j?.data||[];
    if(items.length){
      const found = items[0];
      const cnesVal = found.codigo_cnes||found.cnes||'';
      document.getElementById('prev-cnes').value = cnesVal;
      if(st) st.textContent = `${found.nome_fantasia||found.nome||cnesVal}`;
    } else {
      if(st) st.textContent='Não encontrado. Preencha manualmente.';
    }
  } catch(e) {
    if(st) st.textContent='Erro na busca. Preencha manualmente.';
  }
}

async function buscarCodMun() {
  const mun = (document.getElementById('prev-us-mun')?.value||'').replace(/\s*\/.*$/,'').trim();
  const st  = document.getElementById('prev-cod-mun-status');
  if(!mun){ if(st) st.textContent='Digite o município primeiro.'; return; }
  if(st) st.textContent='Buscando...';
  try {
    const r = await fetchComTimeout(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado`);
    const j = await r.json();
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const found = j.find(m => norm(m['municipio-nome'])===norm(mun));
    if(found){
      const cod = String(found['municipio-id']);
      document.getElementById('prev-cod-mun').value = cod;
      if(st) st.textContent=`${found['municipio-nome']} — ${cod}`;
    } else {
      if(st) st.textContent='Não encontrado. Preencha manualmente.';
    }
  } catch(e) {
    if(st) st.textContent='Erro na busca. Preencha manualmente.';
  }
}

const MAPA_CITOPATOLOGICO_CAMPOS=[{"id":"C002","tipo":"texto","campo":"UF","x":357,"y":248,"w":127,"h":40,"cx":420,"cy":268},{"id":"C003","tipo":"texto","campo":"CNES da Unidade de Saúde","x":681,"y":248,"w":430,"h":40,"cx":896,"cy":268},{"id":"C004","tipo":"texto","campo":"Nº Protocolo","x":1695,"y":248,"w":760,"h":42,"cx":2075,"cy":269},{"id":"C005","tipo":"texto","campo":"Unidade de Saúde","x":357,"y":326,"w":965,"h":47,"cx":839,"cy":349},{"id":"C006","tipo":"texto","campo":"Município","x":357,"y":470,"w":1018,"h":45,"cx":866,"cy":492},{"id":"C007","tipo":"texto","campo":"Prontuário","x":1647,"y":466,"w":630,"h":45,"cx":1962,"cy":488},{"id":"C008","tipo":"texto","campo":"Cartão SUS","x":360,"y":632,"w":940,"h":48,"cx":830,"cy":656},{"id":"C009","tipo":"texto","campo":"Nome completo da mulher","x":360,"y":735,"w":2095,"h":76,"cx":1407,"cy":773},{"id":"C010","tipo":"texto","campo":"Nome completo da mãe","x":360,"y":850,"w":2095,"h":76,"cx":1407,"cy":888},{"id":"C011","tipo":"texto","campo":"Apelido da mulher","x":1215,"y":930,"w":805,"h":42,"cx":1617,"cy":951},{"id":"C012","tipo":"texto","campo":"CPF","x":360,"y":1010,"w":705,"h":42,"cx":712,"cy":1031},{"id":"C013","tipo":"texto","campo":"Nacionalidade","x":1215,"y":1008,"w":760,"h":42,"cx":1595,"cy":1029},{"id":"C014","tipo":"data","campo":"Data de nascimento","x":360,"y":1072,"w":600,"h":50,"cx":660,"cy":1097},{"id":"C015","tipo":"texto","campo":"Idade","x":1040,"y":1075,"w":130,"h":52,"cx":1105,"cy":1101},{"id":"C016","tipo":"checkbox","campo":"Raça/cor - Branca","x":1240,"y":1090,"w":42,"h":42,"cx":1261,"cy":1111},{"id":"C017","tipo":"checkbox","campo":"Raça/cor - Preta","x":1386,"y":1090,"w":42,"h":42,"cx":1407,"cy":1111},{"id":"C018","tipo":"checkbox","campo":"Raça/cor - Parda","x":1518,"y":1090,"w":42,"h":42,"cx":1539,"cy":1111},{"id":"C019","tipo":"checkbox","campo":"Raça/cor - Amarela","x":1660,"y":1090,"w":42,"h":42,"cx":1681,"cy":1111},{"id":"C020","tipo":"checkbox","campo":"Raça/cor - Indígena/Etnia","x":1824,"y":1090,"w":42,"h":42,"cx":1845,"cy":1111},{"id":"C021","tipo":"texto","campo":"Logradouro","x":360,"y":1240,"w":2095,"h":48,"cx":1407,"cy":1264},{"id":"C022","tipo":"texto","campo":"Número","x":360,"y":1334,"w":375,"h":42,"cx":547,"cy":1355},{"id":"C023","tipo":"texto","campo":"Complemento","x":850,"y":1334,"w":680,"h":42,"cx":1190,"cy":1355},{"id":"C024","tipo":"texto","campo":"Bairro","x":1515,"y":1374,"w":705,"h":42,"cx":1867,"cy":1395},{"id":"C025","tipo":"texto","campo":"UF","x":2270,"y":1374,"w":185,"h":42,"cx":2362,"cy":1395},{"id":"C026","tipo":"texto","campo":"Código do Município","x":360,"y":1434,"w":465,"h":42,"cx":592,"cy":1455},{"id":"C027","tipo":"texto","campo":"Município","x":855,"y":1434,"w":970,"h":42,"cx":1340,"cy":1455},{"id":"C028","tipo":"texto","campo":"CEP","x":360,"y":1538,"w":575,"h":50,"cx":647,"cy":1563},{"id":"C029","tipo":"texto","campo":"DDD","x":1125,"y":1538,"w":130,"h":50,"cx":1190,"cy":1563},{"id":"C030","tipo":"texto","campo":"Telefone","x":1388,"y":1538,"w":585,"h":50,"cx":1680,"cy":1563},{"id":"C031","tipo":"texto","campo":"Ponto de referência","x":360,"y":1630,"w":2095,"h":50,"cx":1407,"cy":1655},{"id":"C032","tipo":"checkbox","campo":"Escolaridade - Analfabeta","x":545,"y":1678,"w":42,"h":42,"cx":566,"cy":1699},{"id":"C033","tipo":"checkbox","campo":"Escolaridade - Ensino Fundamental Incompleto","x":760,"y":1678,"w":42,"h":42,"cx":781,"cy":1699},{"id":"C034","tipo":"checkbox","campo":"Escolaridade - Ensino Fundamental Completo","x":1215,"y":1678,"w":42,"h":42,"cx":1236,"cy":1699},{"id":"C035","tipo":"checkbox","campo":"Escolaridade - Ensino Médio Completo","x":1630,"y":1678,"w":42,"h":42,"cx":1651,"cy":1699},{"id":"C036","tipo":"checkbox","campo":"Escolaridade - Ensino Superior Completo","x":1975,"y":1678,"w":42,"h":42,"cx":1996,"cy":1699},{"id":"C037","tipo":"checkbox","campo":"Motivo - Rastreamento","x":430,"y":1880,"w":42,"h":42,"cx":451,"cy":1901},{"id":"C038","tipo":"checkbox","campo":"Motivo - Repetição","x":430,"y":1932,"w":42,"h":42,"cx":451,"cy":1953},{"id":"C039","tipo":"checkbox","campo":"Motivo - Seguimento","x":430,"y":1982,"w":42,"h":42,"cx":451,"cy":2003},{"id":"C040","tipo":"checkbox","campo":"2. Fez exame preventivo - Sim","x":430,"y":2122,"w":42,"h":42,"cx":451,"cy":2143},{"id":"C041","tipo":"texto","campo":"2. Ano do último exame preventivo","x":510,"y":2180,"w":230,"h":50,"cx":625,"cy":2205},{"id":"C042","tipo":"checkbox","campo":"2. Fez exame preventivo - Não","x":430,"y":2260,"w":42,"h":42,"cx":451,"cy":2281},{"id":"C043","tipo":"checkbox","campo":"2. Fez exame preventivo - Não sabe","x":620,"y":2260,"w":42,"h":42,"cx":641,"cy":2281},{"id":"C044","tipo":"checkbox","campo":"3. Usa DIU - Sim","x":625,"y":2350,"w":42,"h":42,"cx":646,"cy":2371},{"id":"C045","tipo":"checkbox","campo":"3. Usa DIU - Não","x":840,"y":2350,"w":42,"h":42,"cx":861,"cy":2371},{"id":"C046","tipo":"checkbox","campo":"3. Usa DIU - Não sabe","x":990,"y":2350,"w":42,"h":42,"cx":1011,"cy":2371},{"id":"C047","tipo":"checkbox","campo":"4. Está grávida - Sim","x":625,"y":2435,"w":42,"h":42,"cx":646,"cy":2456},{"id":"C048","tipo":"checkbox","campo":"4. Está grávida - Não","x":840,"y":2435,"w":42,"h":42,"cx":861,"cy":2456},{"id":"C049","tipo":"checkbox","campo":"4. Está grávida - Não sabe","x":990,"y":2435,"w":42,"h":42,"cx":1011,"cy":2456},{"id":"C050","tipo":"checkbox","campo":"5. Usa pílula anticoncepcional - Sim","x":625,"y":2575,"w":42,"h":42,"cx":646,"cy":2596},{"id":"C051","tipo":"checkbox","campo":"5. Usa pílula anticoncepcional - Não","x":840,"y":2575,"w":42,"h":42,"cx":861,"cy":2596},{"id":"C052","tipo":"checkbox","campo":"5. Usa pílula anticoncepcional - Não sabe","x":990,"y":2575,"w":42,"h":42,"cx":1011,"cy":2596},{"id":"C053","tipo":"checkbox","campo":"6. Usa hormônio/remédio para menopausa - Sim","x":625,"y":2720,"w":42,"h":42,"cx":646,"cy":2741},{"id":"C054","tipo":"checkbox","campo":"6. Usa hormônio/remédio para menopausa - Não","x":840,"y":2720,"w":42,"h":42,"cx":861,"cy":2741},{"id":"C055","tipo":"checkbox","campo":"6. Usa hormônio/remédio para menopausa - Não sabe","x":990,"y":2720,"w":42,"h":42,"cx":1011,"cy":2741},{"id":"C056","tipo":"checkbox","campo":"7. Radioterapia - Sim","x":1620,"y":1880,"w":42,"h":42,"cx":1641,"cy":1901},{"id":"C057","tipo":"checkbox","campo":"7. Radioterapia - Não","x":1805,"y":1880,"w":42,"h":42,"cx":1826,"cy":1901},{"id":"C058","tipo":"checkbox","campo":"7. Radioterapia - Não sabe","x":1950,"y":1880,"w":42,"h":42,"cx":1971,"cy":1901},{"id":"C059","tipo":"data","campo":"8. Data da última menstruação/regra","x":1400,"y":2078,"w":580,"h":50,"cx":1690,"cy":2103},{"id":"C060","tipo":"checkbox","campo":"8. Não sabe / Não lembra","x":2020,"y":2080,"w":42,"h":42,"cx":2041,"cy":2101},{"id":"C061","tipo":"checkbox","campo":"9. Sangramento após relações sexuais - Sim","x":1620,"y":2265,"w":42,"h":42,"cx":1641,"cy":2286},{"id":"C062","tipo":"checkbox","campo":"9. Sangramento após relações sexuais - Não/Não sabe/Não lembra","x":1620,"y":2330,"w":42,"h":42,"cx":1641,"cy":2351},{"id":"C063","tipo":"checkbox","campo":"10. Sangramento após menopausa - Sim","x":1620,"y":2565,"w":42,"h":42,"cx":1641,"cy":2586},{"id":"C064","tipo":"checkbox","campo":"10. Sangramento após menopausa - Não/Não sabe/Não lembra/Não está na menopausa","x":1620,"y":2630,"w":42,"h":42,"cx":1641,"cy":2651},{"id":"C065","tipo":"checkbox","campo":"11. Inspeção do colo - Normal","x":355,"y":2945,"w":42,"h":42,"cx":376,"cy":2966},{"id":"C066","tipo":"checkbox","campo":"11. Inspeção do colo - Ausente","x":355,"y":3000,"w":42,"h":42,"cx":376,"cy":3021},{"id":"C067","tipo":"checkbox","campo":"11. Inspeção do colo - Alterado","x":355,"y":3054,"w":42,"h":42,"cx":376,"cy":3075},{"id":"C068","tipo":"checkbox","campo":"11. Inspeção do colo - Colo não visualizado","x":355,"y":3107,"w":42,"h":42,"cx":376,"cy":3128},{"id":"C069","tipo":"checkbox","campo":"12. Sinais sugestivos de DST - Sim","x":1360,"y":2945,"w":42,"h":42,"cx":1381,"cy":2966},{"id":"C070","tipo":"checkbox","campo":"12. Sinais sugestivos de DST - Não","x":1360,"y":3000,"w":42,"h":42,"cx":1381,"cy":3021},{"id":"C071","tipo":"data","campo":"Data da coleta","x":355,"y":3285,"w":615,"h":55,"cx":662,"cy":3312},{"id":"C072","tipo":"texto","campo":"Responsável","x":1085,"y":3285,"w":1370,"h":55,"cx":1770,"cy":3312}];
async function gerarFichaRosa() {
  if(!exigirPermissao('gerar_documentos'))return;
  const btn = document.getElementById('btn-ficha-rosa');
  const st  = document.getElementById('ficha-rosa-status');

  const motivoRad = document.querySelector('input[name="prev-motivo"]:checked');
  const motivoVal = motivoRad ? motivoRad.value : '';
  const motivoMap = { rastr:'Rastreamento', repet:'Repetição', segs:'Seguimento' };

  const coloRad = document.querySelector('input[name="prev-colo"]:checked');
  const coloVal = coloRad ? coloRad.value : '';

  const dstRad  = document.querySelector('input[name="prev-dst"]:checked');
  const dstVal  = dstRad ? dstRad.value : '';

  const fezMap  = { sim:'Sim', nao:'Não', ns:'Não sabe' };
  const sangMap = { sim:'Sim', nao:'Não' };

  const munUF   = document.getElementById('prev-mun')?.value || 'Toledo / PR';
  const [munNome, ufRes] = munUF.includes('/') ? munUF.split('/').map(s=>s.trim()) : [munUF,'PR'];
  const usUF    = document.getElementById('prev-us-mun')?.value || 'Toledo / PR';
  const [usMun, ufUs] = usUF.includes('/') ? usUF.split('/').map(s=>s.trim()) : [usUF,'PR'];

  const d = {
    uf:            ufUs||'PR',
    cnes:          document.getElementById('prev-cnes')?.value||'',
    cod_mun:       document.getElementById('prev-cod-mun')?.value||'',
    unidade_saude: document.getElementById('prev-us')?.value||'',
    municipio_us:  usMun||'Toledo',
    prontuario:    document.getElementById('prev-prontuario')?.value||'',
    cns:           document.getElementById('prev-cns')?.value||'',
    nome:          document.getElementById('prev-nome')?.value||'',
    nome_mae:      document.getElementById('prev-nome-mae')?.value||'',
    apelido:       document.getElementById('prev-apelido')?.value||'',
    cpf:           document.getElementById('prev-cpf')?.value||'',
    nacionalidade: document.getElementById('prev-nac')?.value||'Brasileira',
    nasc:          document.getElementById('prev-nasc')?.value||'',
    idade:         document.getElementById('prev-idade')?.value||'',
    raca:          document.getElementById('prev-raca')?.value||'',
    escolaridade:  document.getElementById('prev-escol')?.value||'',
    logradouro:    document.getElementById('prev-logr')?.value||'',
    numero:        document.getElementById('prev-num')?.value||'',
    bairro:        document.getElementById('prev-bairro')?.value||'',
    municipio:     munNome,
    uf_res:        ufRes||'PR',
    cep:           document.getElementById('prev-cep')?.value||'',
    telefone:      document.getElementById('prev-tel')?.value||'',
    referencia:    document.getElementById('prev-ref')?.value||'',
    motivo:        motivoMap[motivoVal]||'',
    fez:           fezMap[document.getElementById('prev-fez')?.value]||'',
    ult:           document.getElementById('prev-ult')?.value||'',
    diu:           document.getElementById('prev-diu')?.value||'',
    gravida:       document.getElementById('prev-gravida')?.value||'',
    pilula:        document.getElementById('prev-pilula')?.value||'',
    thr:           document.getElementById('prev-thr')?.value||'',
    radio:         document.getElementById('prev-radio')?.value||'',
    dum:           document.getElementById('prev-dum')?.value||'',
    dum_ns:        document.getElementById('prev-dum-ns')?.value==='sim',
    sang_rel:      sangMap[document.getElementById('prev-sang-rel')?.value]||'',
    sang_menop:    sangMap[document.getElementById('prev-sang-menop')?.value]||'',
    colo:          coloVal,
    dst:           dstVal,
    data_coleta:   document.getElementById('prev-data')?.value||'',
    responsavel:   document.getElementById('prev-enf')?.value||'',
  };

  if (!d.nome) {
    st.style.color='#b91c1c'; st.textContent='Preencha o nome da paciente.'; return;
  }

  btn.disabled=true; btn.textContent='⏳ Gerando...';
  st.style.color='var(--tx2)'; st.textContent='Gerando sobreimpressao A4...';

  try {
    async function carregarPdfLib(){
      if(window.PDFLib?.PDFDocument)return;
      const fontes=['pdf-lib.min.js','https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'];
      for(const src of fontes){
        try{
          await new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Falha ao carregar '+src));document.head.appendChild(s)});
          if(window.PDFLib?.PDFDocument)return;
        }catch(e){console.warn(e)}
      }
      throw new Error('O gerador da Ficha Rosa não foi carregado. Verifique a internet e recarregue a página.');
    }
    await carregarPdfLib();
    const {PDFDocument, rgb, StandardFonts} = window.PDFLib;

    function b64ToBytes(b64){
      const bin=atob(b64); const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      return bytes;
    }

    // Converte acentos para equivalentes WinAnsi (suportado pelo Helvetica embutido)
    function safe(str){
      if(!str) return '';
      return String(str)
        .replace(/[ÀÁÂÃÄ]/g,'A').replace(/[àáâãä]/g,'a')
        .replace(/[ÈÉÊË]/g,'E').replace(/[èéêë]/g,'e')
        .replace(/[ÍÌÎÏ]/g,'I').replace(/[íìîï]/g,'i')
        .replace(/[ÓÒÔÕÖ]/g,'O').replace(/[óòôõö]/g,'o')
        .replace(/[ÚÙÛÜ]/g,'U').replace(/[úùûü]/g,'u')
        .replace(/[Ç]/g,'C').replace(/[ç]/g,'c')
        .replace(/[Ñ]/g,'N').replace(/[ñ]/g,'n')
        .replace(/[^a-zA-Z0-9\s.,;\-/()°ºª@:!?#%&*+_=<>'"]/g,'?');
    }

    function fmtDate(d){
      if(d&&d.length===10&&d[4]==='-') return `${d.slice(8,10)}/${d.slice(5,7)}/${d.slice(0,4)}`;
      return d||'';
    }

    // Sobreimpressao: uma unica pagina A4 branca, sem o desenho da ficha.
    // A ficha rosa fisica deve estar previamente colocada na impressora.
    const pdfDoc = await PDFDocument.create();
    const page   = pdfDoc.addPage([595, 842]);
    const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const {height} = page.getSize();

    // Calibração fixa baseada no ODG oficial anexado:
    // página 20,99 × 29,703 cm; imagem 20,339 × 29,703 cm em x=0,011 cm; bitmap 2480 × 3508 px a 300 dpi.
    // A saída continua limpa para sobreimpressão: somente dados, sem desenhar o formulário.
    const CM_TO_PT = 72 / 2.54;
    const ODG_PAGE = {wCm:20.99,hCm:29.703,imgXCm:0.011,imgYCm:0,imgWCm:20.339,imgHCm:29.703};
    const ODG_IMG = {
      x: ODG_PAGE.imgXCm * CM_TO_PT,
      y: ODG_PAGE.imgYCm * CM_TO_PT,
      w: ODG_PAGE.imgWCm * CM_TO_PT,
      h: ODG_PAGE.imgHCm * CM_TO_PT
    };
    const BASE_COORD = {w:616, h:842};
    const ODG_PRINT_OFFSET = {x:0, y:-30.5};
    const formX = x => ODG_IMG.x + (x * ODG_IMG.w / BASE_COORD.w) + ODG_PRINT_OFFSET.x;
    const formY = y => ODG_IMG.y + ((y + ODG_PRINT_OFFSET.y) * ODG_IMG.h / BASE_COORD.h);
    const freeX = formX;
    const gridX = formX;
    const checkX = formX;
    const formYFree = formY;
    const formYGrid = formY;
    const formYCheck = formY;
    const fontGridFichaRosa = 5.3;
    const fontFreeFichaRosa = 7.0;
    const fontCheckFichaRosa = 6.0;
    const baselineFichaRosa = 8.7;
    const offCampo = () => ({x:0,y:0});

    // t() — texto livre (campos sem caixinhas individuais)
    function t(x, yTop, text, size, campo){
      if(!text) return;
      if(typeof size==='string'){campo=size;size=undefined;}
      const fs=size||fontFreeFichaRosa;
      const o=offCampo(campo);
      page.drawText(safe(String(text)),{x:freeX(x)+o.x, y:height-formYFree(yTop)-o.y, size:fs, font, color:rgb(0,0,0)});
    }
    // ck() — cx,cy = centro do checkbox (top-origin). Caixa ~9.7x8.9pt, fonte 6pt
    function ck(cx, cy, campo){
      const sz=fontCheckFichaRosa;
      const o=offCampo(campo);
      page.drawText('X',{x:checkX(cx)-sz*0.32+o.x, y:height-formYCheck(cy)-sz*0.54-o.y, size:sz, font, color:rgb(0,0,0)});
    }

    // tc() — distribui cada caractere em sua célula individual
    // xs: array com a posição x do início de cada célula
    // yTop: posição y do topo da linha de células (coordenada PDF top-origin)
    // text: string a inserir
    // size: tamanho da fonte
    function tc(xs, yTop, text, size, campo){
      if(!text) return;
      if(typeof size==='string'){campo=size;size=undefined;}
      const fs=size||fontGridFichaRosa, base=baselineFichaRosa;
      const txt = safe(String(text)).trim().replace(/\s+/g,' ').toUpperCase();
      const o=offCampo(campo);
      const gx = xs.map(x=>gridX(x)+o.x);
      for(let i=0;i<txt.length&&i<gx.length-1;i++){
        const ch = txt[i];
        if(ch===' ') continue;
        const cellW = gx[i+1] - gx[i];
        const charW = font.widthOfTextAtSize(ch, fs);
        const cx = gx[i] + (cellW - charW) / 2;
        page.drawText(ch,{x:cx, y:height-formYGrid(yTop)-base-o.y, size:fs, font, color:rgb(0,0,0)});
      }
    }

    // tcd() — distribui dígitos de data DDMMAAAA pulando células de barra (/)
    // O formulário tem barras físicas em posições fixas: idx 2 e 5 são os gaps de barra
    // Portanto mapeamento: char[0]=xs[0], [1]=xs[1], [2]=xs[3], [3]=xs[4], [4]=xs[6], [5]=xs[7], [6]=xs[8], [7]=xs[9]
    function tcd(xs, yTop, ddmmaaaa, size, campo){
      if(!ddmmaaaa) return;
      if(typeof size==='string'){campo=size;size=undefined;}
      const fs=size||fontGridFichaRosa, base=baselineFichaRosa;
      const d = safe(ddmmaaaa.replace(/\D/g,'')).slice(0,8);
      const cellMap = [0,1,3,4,6,7,8,9];
      const o=offCampo(campo);
      const gx = xs.map(x=>gridX(x)+o.x);
      for(let i=0;i<d.length&&i<cellMap.length;i++){
        const ci = cellMap[i];
        if(ci >= gx.length-1) break;
        const cellW = gx[ci+1] - gx[ci];
        const charW = font.widthOfTextAtSize(d[i], fs);
        const cx = gx[ci] + (cellW - charW) / 2;
        page.drawText(d[i],{x:cx, y:height-formYGrid(yTop)-base-o.y, size:fs, font, color:rgb(0,0,0)});
      }
    }

    // ── PREENCHIMENTO PELO MAPA JSON DO ODG ──
    // Fonte principal: pacote_codex_mapeamento_citopatologico.zip /
    // mapa_coordenadas_citopatologico.json. Coordenadas originais em px:
    // 2480 x 3508, origem no canto superior esquerdo.
    const mapaFicha = new Map();
    MAPA_CITOPATOLOGICO_CAMPOS.forEach(c=>{
      mapaFicha.set(c.id, c);
      if(!mapaFicha.has(c.campo)) mapaFicha.set(c.campo, c);
    });
    const sxMapa = 595 / 2480;
    const syMapa = 842 / 3508;
    const pxX = x => x * sxMapa;
    const pxY = y => y * syMapa;
    const textoFicha = str => safe(String(str||'')).trim().replace(/\s+/g,' ').toUpperCase();
    const digitosFicha = str => String(str||'').replace(/\D/g,'');
    const campoMapa = key => mapaFicha.get(key);
    function desenharTextoMapa(key, value, opts={}){
      const c = campoMapa(key);
      const txt = textoFicha(value);
      if(!c || !txt) return;
      const fs = opts.size || 6.3;
      const cellPx = opts.cellPx || Math.max(54, Math.min(64, c.h * 1.55));
      const max = Math.max(1, Math.floor(c.w / cellPx));
      const chars = opts.continuo ? txt.replace(/\s+/g,' ').slice(0, max * 2) : txt.slice(0, max);
      if(opts.continuo){
        page.drawText(chars, {
          x: pxX(c.x + 4),
          y: height - pxY(c.y + c.h * 0.66),
          size: fs,
          font,
          color: rgb(0,0,0),
          maxWidth: pxX(c.w - 8)
        });
        return;
      }
      for(let i=0;i<chars.length && i<max;i++){
        const ch = chars[i];
        if(ch === ' ') continue;
        const centerX = pxX(c.x + i * cellPx + cellPx / 2);
        const charW = font.widthOfTextAtSize(ch, fs);
        page.drawText(ch, {
          x: centerX - charW / 2,
          y: height - pxY(c.y + c.h * 0.69),
          size: fs,
          font,
          color: rgb(0,0,0)
        });
      }
    }
    function desenharDataMapa(key, value){
      const c = campoMapa(key);
      const digits = digitosFicha(fmtDate(value)).slice(0,8);
      if(!c || !digits) return;
      const fs = 6.3;
      const cellPx = Math.max(54, Math.min(64, c.h * 1.55));
      const cellMap = [0,1,3,4,6,7,8,9];
      for(let i=0;i<digits.length && i<cellMap.length;i++){
        const centerX = pxX(c.x + cellMap[i] * cellPx + cellPx / 2);
        const charW = font.widthOfTextAtSize(digits[i], fs);
        page.drawText(digits[i], {
          x: centerX - charW / 2,
          y: height - pxY(c.y + c.h * 0.69),
          size: fs,
          font,
          color: rgb(0,0,0)
        });
      }
    }
    function marcarMapa(key){
      const c = campoMapa(key);
      if(!c) return;
      const fs = 7.2;
      page.drawText('X', {
        x: pxX(c.cx) - font.widthOfTextAtSize('X', fs) / 2,
        y: height - pxY(c.cy) - fs * 0.36,
        size: fs,
        font,
        color: rgb(0,0,0)
      });
    }
    function valorSN(v){
      const s = String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
      if(!s) return '';
      if(s === 'ns' || s.includes('nao sabe') || s.includes('nao lembra')) return 'Não sabe';
      if(s.startsWith('sim')) return 'Sim';
      if(s.startsWith('nao') || s.startsWith('não')) return 'Não';
      return v;
    }
    function marcarSN(prefixo, valor){
      const v = valorSN(valor);
      if(v === 'Sim') marcarMapa(`${prefixo} - Sim`);
      else if(v === 'Não') marcarMapa(`${prefixo} - Não`);
      else if(v === 'Não sabe') marcarMapa(`${prefixo} - Não sabe`);
    }

    // Cabeçalho e identificação. Campos duplicados usam ID do JSON para não misturar
    // UF/Município da unidade com UF/Município residencial.
    desenharTextoMapa('C002', d.uf, {cellPx:61});
    desenharTextoMapa('CNES da Unidade de Saúde', d.cnes, {cellPx:61});
    desenharTextoMapa('Nº Protocolo', document.getElementById('prev-protocolo')?.value || d.prontuario, {cellPx:61});
    desenharTextoMapa('Unidade de Saúde', d.unidade_saude, {cellPx:61});
    desenharTextoMapa('C006', d.municipio_us, {cellPx:61});
    desenharTextoMapa('Prontuário', d.prontuario, {cellPx:61});
    desenharTextoMapa('Cartão SUS', d.cns, {cellPx:61});
    desenharTextoMapa('Nome completo da mulher', d.nome, {cellPx:61});
    desenharTextoMapa('Nome completo da mãe', d.nome_mae, {cellPx:61});
    desenharTextoMapa('Apelido da mulher', d.apelido, {cellPx:61});
    desenharTextoMapa('CPF', digitosFicha(d.cpf), {cellPx:61});
    desenharTextoMapa('Nacionalidade', d.nacionalidade, {cellPx:61});
    desenharDataMapa('Data de nascimento', d.nasc);
    desenharTextoMapa('Idade', d.idade, {cellPx:61});

    const racaCampo = {
      'Branca':'Raça/cor - Branca',
      'Preta':'Raça/cor - Preta',
      'Parda':'Raça/cor - Parda',
      'Amarela':'Raça/cor - Amarela',
      'Indígena':'Raça/cor - Indígena/Etnia',
      'Indigena':'Raça/cor - Indígena/Etnia'
    };
    if(racaCampo[d.raca]) marcarMapa(racaCampo[d.raca]);

    desenharTextoMapa('Logradouro', abrevLogr(d.logradouro), {cellPx:61});
    desenharTextoMapa('Número', d.numero, {cellPx:61});
    desenharTextoMapa('Complemento', document.getElementById('prev-comp')?.value || '', {cellPx:61});
    desenharTextoMapa('Bairro', abrevLogr(d.bairro), {cellPx:61});
    desenharTextoMapa('C025', d.uf_res, {cellPx:61});
    desenharTextoMapa('Código do Município', d.cod_mun, {cellPx:61});
    desenharTextoMapa('C027', d.municipio, {cellPx:61});
    desenharTextoMapa('CEP', digitosFicha(d.cep), {cellPx:61});
    const telMapa = digitosFicha(d.telefone);
    if(telMapa.length > 8){
      desenharTextoMapa('DDD', telMapa.slice(0,2), {cellPx:61});
      desenharTextoMapa('Telefone', telMapa.slice(2), {cellPx:61});
    } else {
      desenharTextoMapa('Telefone', telMapa, {cellPx:61});
    }
    desenharTextoMapa('Ponto de referência', d.referencia, {cellPx:61});

    const escolaridadeNormalizada = String(d.escolaridade||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(escolaridadeNormalizada.includes('analf')) marcarMapa('Escolaridade - Analfabeta');
    else if(escolaridadeNormalizada.includes('superior')) marcarMapa('Escolaridade - Ensino Superior Completo');
    else if(escolaridadeNormalizada.includes('medio')) marcarMapa('Escolaridade - Ensino Médio Completo');
    else if(escolaridadeNormalizada.includes('fundamental') && escolaridadeNormalizada.includes('completo')) marcarMapa('Escolaridade - Ensino Fundamental Completo');
    else if(escolaridadeNormalizada.includes('fundamental')) marcarMapa('Escolaridade - Ensino Fundamental Incompleto');

    if(d.motivo === 'Rastreamento') marcarMapa('Motivo - Rastreamento');
    else if(d.motivo === 'Repetição' || d.motivo === 'Repeticao') marcarMapa('Motivo - Repetição');
    else if(d.motivo === 'Seguimento') marcarMapa('Motivo - Seguimento');

    if(d.fez === 'Sim'){
      marcarMapa('2. Fez exame preventivo - Sim');
      desenharTextoMapa('2. Ano do último exame preventivo', String(d.ult||'').slice(0,4), {cellPx:61});
    } else if(d.fez === 'Não' || d.fez === 'Nao') marcarMapa('2. Fez exame preventivo - Não');
    else if(d.fez === 'Não sabe' || d.fez === 'Nao sabe') marcarMapa('2. Fez exame preventivo - Não sabe');

    marcarSN('3. Usa DIU', d.diu);
    marcarSN('4. Está grávida', d.gravida);
    marcarSN('5. Usa pílula anticoncepcional', d.pilula);
    marcarSN('6. Usa hormônio/remédio para menopausa', d.thr);
    marcarSN('7. Radioterapia', d.radio);
    if(d.dum_ns) marcarMapa('8. Não sabe / Não lembra');
    else desenharDataMapa('8. Data da última menstruação/regra', d.dum);
    if(d.sang_rel === 'Sim') marcarMapa('9. Sangramento após relações sexuais - Sim');
    else if(d.sang_rel) marcarMapa('9. Sangramento após relações sexuais - Não/Não sabe/Não lembra');
    if(d.sang_menop === 'Sim') marcarMapa('10. Sangramento após menopausa - Sim');
    else if(d.sang_menop) marcarMapa('10. Sangramento após menopausa - Não/Não sabe/Não lembra/Não está na menopausa');

    const coloCampo = {
      normal:'11. Inspeção do colo - Normal',
      ausente:'11. Inspeção do colo - Ausente',
      alterado:'11. Inspeção do colo - Alterado',
      naovisu:'11. Inspeção do colo - Colo não visualizado'
    };
    if(coloCampo[d.colo]) marcarMapa(coloCampo[d.colo]);
    if(d.dst === 'sim') marcarMapa('12. Sinais sugestivos de DST - Sim');
    else if(d.dst === 'nao') marcarMapa('12. Sinais sugestivos de DST - Não');
    desenharDataMapa('Data da coleta', d.data_coleta);
    desenharTextoMapa('Responsável', d.responsavel, {cellPx:61});

    const pdfBytesMapa = await pdfDoc.save();
    const blobMapa = new Blob([pdfBytesMapa],{type:'application/pdf'});
    const urlMapa  = URL.createObjectURL(blobMapa);
    const aMapa    = document.createElement('a');
    const nomeSafeMapa=(d.nome.split(' ')[0]||'paciente').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
    aMapa.href=urlMapa; aMapa.download=`sobreimpressao-ficha-rosa_${nomeSafeMapa}_${d.data_coleta||'semdata'}.pdf`;
    document.body.appendChild(aMapa); aMapa.click();
    document.body.removeChild(aMapa);
    setTimeout(()=>URL.revokeObjectURL(urlMapa),120000);

    st.style.color='var(--green)';
    st.innerHTML=ic('check')+' Sobreimpressão gerada pelo mapa JSON. <a href="'+urlMapa+'" target="_blank" rel="noopener" style="color:var(--green);font-weight:700">Abrir PDF</a>';
    return;

    // ── Posições x das células por campo (medidas do PDF oficial) ──
    // Cada array lista a borda esquerda de cada célula + borda direita da última
    const CX = {
      // Cabeçalho
      cnes:      [177.3,192.5,207.7,222.9,238.1,253.3,268.5,283.0],   // 7 células após UF
      us:        [99.3,114.5,129.7,144.9,160.1,175.3,190.5,205.7,220.9,236.1,251.3,266.5,281.7,296.9,312.1,327.3,342.5,357.7,372.9,388.1,403.3,418.5,433.7,448.9,464.1,479.3,494.5,509.7,524.9,540.1,555.3,570.5,585.7,600.9,616.0],
      mun_us:    [99.3,114.5,129.7,144.9,160.1,175.3,190.5,205.7,220.9,236.1,251.3,266.5,281.7,296.9,312.1,327.3,343.0],
      pront:     [417.7,432.9,448.0,463.2,478.4,493.6,508.8,524.0],
      // Informações pessoais
      cns:       [100.7,115.6,130.8,146.0,161.7,176.4,191.6,206.8,222.0,237.2,252.4,267.6,281.7,295.9,310.0,324.2,340.0],
      nome:      [100.5,115.7,130.9,146.1,161.3,176.5,191.7,206.9,222.1,237.3,252.5,267.7,282.9,298.1,313.3,328.5,343.7,358.9,374.1,389.3,404.5,419.7,434.9,450.1,465.3,480.5,495.7,510.9,526.1,541.3,556.5,571.7,586.9,602.1,618.0],
      nome_mae:  [100.5,115.7,130.9,146.1,161.3,176.5,191.7,206.9,222.1,237.3,252.5,267.7,282.9,298.1,313.3,328.5,343.7,358.9,374.1,389.3,404.5,419.7,434.9,450.1,465.3,480.5,495.7,510.9,526.1,541.3,556.5,571.7,586.9,602.1,618.0],
      apelido:   [380.0,395.2,410.4,425.6,440.8,456.0,471.2,486.4,501.6,516.8,532.0,547.2,562.4,577.6,592.8,608.0,618.0],
      cpf:       [100.6,115.8,131.0,146.2,161.4,176.6,191.8,207.0,222.2,237.4,252.7,267.4,283.0],
      nac:       [316.0,331.2,346.4,361.6,376.8,392.0,407.2,422.4,437.6,452.8,468.0,483.2,498.4,513.6,528.8,544.0,559.2,574.4,589.6,604.8,618.0],
      nasc:      [100.5,115.7,130.9,146.1,159.4,174.6,190.8,206.0,221.2,236.4,251.6,267.8,283.0],  // DD/MM/AAAA (idx 2 e 5 = gaps barra)
      idade:     [267.8,283.0,298.2],
      logr:      [100.5,115.7,130.9,146.1,161.3,176.5,191.7,206.9,222.1,237.3,252.5,267.7,282.9,298.1,313.3,328.5,343.7,358.9,374.1,389.3,404.5,419.7,434.9,450.1,465.3,480.5,495.7,510.9,526.1,541.3,556.5,571.7,586.9,602.1,618.0],
      num:       [101.6,116.5,131.7,146.9,162.1,177.3,192.5,208.5],
      bairro:    [374.9,390.1,405.3,420.5,435.7,450.9,466.1,481.3,496.5,511.7,526.9,542.1,557.3,572.5,587.7,602.2],
      mun_res:   [161.0,176.2,191.4,206.6,221.8,237.0,252.2,267.4,282.6,297.8,313.0,328.2,343.4,358.6,373.8,389.0],
      cep:       [100.5,115.7,130.9,146.1,161.3,176.5,191.7,206.9,222.1],
      ddd:       [296.0,311.2,326.4],
      tel:       [338.0,353.2,368.4,383.6,398.8,414.0,429.2,444.4,459.6],
      referencia:[99.3,114.5,129.7,144.9,160.1,175.3,190.5,205.7,220.9,236.1,251.3,266.5,281.7,296.9,312.1,327.3,342.5,357.7,372.9,388.1,403.3,418.5,433.7,448.9,464.1,479.3,494.5,509.7,524.9,540.1,555.3,570.5,585.7,600.9,616.0],
      // Anamnese
      ult_prev:  [159.0,174.2,189.4,205.0],   // ano (4 dígitos)
      dum:       [346.1,361.3,376.5,391.7,405.0,420.2,436.4,451.6,466.8,482.0,497.2],  // DD MM AAAA
      // Rodapé
      data_col:  [99.3,114.5,129.7,144.9,158.2,173.4,189.6,204.8,220.0,235.2,250.4],
      resp:      [281.0,296.2,311.4,326.6,341.8,357.0,372.2,387.4,402.6,417.8,433.0,448.2,463.4,478.6,493.8,509.0,524.2,539.4,554.6,569.8,585.0,600.2,616.0],
    };

    // yTop de cada linha de células (coordenada PDF top-origin = topo da célula)
    const Y = {
      cnes:92, us:112, mun_us:124, pront:144,
      cns:186, nome:209, nome_mae:222, apelido:258, cpf:274, nac:270, nasc:296, idade:296,
      logr:330, num:350, bairro:362, mun_res:384, cep:404, ddd:404, tel:404,
      referencia:421, ult_prev:558, dum:536,
      data_col:824, resp:822,
    };

    // ── CABEÇALHO ──
    t(130, 91, d.uf, 7, 'uf');                                 // UF — 2 chars, campo curto
    tc(CX.cnes,   Y.cnes,   d.cnes, 'cnes');
    tc(CX.us,     Y.us,     d.unidade_saude, 'us');
    tc(CX.mun_us, Y.mun_us, d.municipio_us, 'mun-us');
    tc(CX.pront,  Y.pront,  d.prontuario, 'prontuario');

    // ── INFORMAÇÕES PESSOAIS ──
    tc(CX.cns,      Y.cns,      d.cns, 'cns');
    tc(CX.nome,     Y.nome,     d.nome, 'nome');
    tc(CX.nome_mae, Y.nome_mae, d.nome_mae, 'mae');
    tc(CX.apelido, Y.apelido, d.apelido, 'apelido');
    tc(CX.cpf,  Y.cpf,  (d.cpf||'').replace(/[.\-]/g,''), 'cpf');
    tc(CX.nac, Y.nac, d.nacionalidade, 'nacionalidade');

    // Data de nascimento
    tcd(CX.nasc, Y.nasc, fmtDate(d.nasc), 'nascimento');
    tc(CX.idade, Y.idade, String(d.idade||''), 'idade');

    const racaMap={'Branca':[321.5,299.7],'Preta':[357.6,299.7],'Parda':[388.9,299.7],'Amarela':[422.9,299.7],'Indigena':[465.4,299.7]};
    const racaKey = d.raca==='Indígena'?'Indigena':d.raca;
    if(racaMap[racaKey]) ck(...racaMap[racaKey], 'raca');

    // ── ENDEREÇO ──
    function abrevLogr(s){
      if(!s) return '';
      return s.replace(/\bJardim\b/gi,'JD').replace(/\bAvenida\b/gi,'AV').replace(/\bRua\b/gi,'R').replace(/\bAlameda\b/gi,'AL').replace(/\bEstrada\b/gi,'EST').replace(/\bTravessa\b/gi,'TV').replace(/\bVila\b/gi,'VL');
    }
    tc(CX.logr,    Y.logr,    abrevLogr(d.logradouro), 'logradouro');
    tc(CX.num,     Y.num,     d.numero, 'numero');
    tc(CX.bairro,  Y.bairro,  abrevLogr(d.bairro), 'bairro');
    t(617, 375, d.uf_res, 7, 'uf-res');
    // Código do Município (células antes de x=161 na linha y=384)
    const codMunXs=[100.5,115.7,130.9,146.1,159.4];
    tc(codMunXs, Y.mun_res, d.cod_mun||'', 'cod-mun');
    tc(CX.mun_res, Y.mun_res, d.municipio, 'mun-res');
    tc(CX.cep,     Y.cep,     (d.cep||'').replace(/[-]/g,''), 'cep');
    const tel=(d.telefone||'').replace(/[()\s-]/g,'');
    if(tel.length>=10){ tc(CX.ddd,Y.ddd,tel.slice(0,2), 'ddd'); tc(CX.tel,Y.tel,tel.slice(2), 'telefone'); }
    else if(tel) tc(CX.tel,Y.tel,tel, 'telefone');
    tc(CX.referencia, Y.referencia, d.referencia, 'referencia');

    const escolMap={'Analfabeta':[149.8,443.3],'Ensino Fundamental Incompleto':[199.0,443.3],'Ensino Fundamental Completo':[307.3,443.3],'Ensino Medio Completo':[411.1,443.3],'Ensino Superior Completo':[494.8,443.3]};
    const escolKey = d.escolaridade.replace(/[éê]/g,'e').replace(/[ó]/g,'o');
    if(escolMap[escolKey]) ck(...escolMap[escolKey], 'escolaridade');
    else if(d.escolaridade.includes('Médio')||d.escolaridade.includes('Medio')) ck(411.1,443.3, 'escolaridade');
    else if(d.escolaridade.includes('Superior')) ck(494.8,443.3, 'escolaridade');
    else if(d.escolaridade.includes('Fundamental')&&d.escolaridade.includes('Completo')) ck(307.3,443.3, 'escolaridade');
    else if(d.escolaridade.includes('Fundamental')) ck(199.0,443.3, 'escolaridade');
    else if(d.escolaridade.includes('Analfabeta')) ck(149.8,443.3, 'escolaridade');

    // ── ANAMNESE ── (coords = centros exatos medidos do PDF)
    if(d.motivo==='Rastreamento')       ck(122.2,495.7, 'motivo');
    else if(d.motivo==='Repeticao'||d.motivo==='Repetição') ck(122.2,507.7, 'motivo');
    else if(d.motivo==='Seguimento')    ck(122.2,519.3, 'motivo');

    const radMap={'Sim':[414.8,495.4],'Nao':[459.0,495.4],'Não':[459.0,495.4],'Nao sabe':[495.0,495.4],'Não sabe':[495.0,495.4]};
    if(radMap[d.radio]) ck(...radMap[d.radio], 'radio');

    if(d.fez==='Sim'){
      ck(122.1,551.6, 'fez-prev');
      if(d.ult) tc(CX.ult_prev, Y.ult_prev, String(d.ult).slice(0,4), 'ult-prev');
    }
    else if(d.fez==='Não'||d.fez==='Nao') ck(122.1,582.7, 'fez-prev');
    else if(d.fez==='Não sabe'||d.fez==='Nao sabe') ck(165.3,582.7, 'fez-prev');

    if(d.dum&&!d.dum_ns) tcd(CX.dum, Y.dum, fmtDate(d.dum), 'dum');
    else if(d.dum_ns) ck(514.1,540.0, 'dum-ns');

    const diuMap={'Sim':[165.0,602.7],'Não':[216.2,602.7],'Nao':[216.2,602.7],'Não sabe':[252.2,602.7]};
    if(diuMap[d.diu]) ck(...diuMap[d.diu], 'diu');

    if(d.sang_rel==='Sim') ck(413.1,589.1, 'sang-rel');
    else if(d.sang_rel)    ck(413.1,602.8, 'sang-rel');

    const gravMap={'Sim':[166.9,622.7],'Não':[216.2,622.7],'Nao':[216.2,622.7],'Não sabe':[252.2,622.7]};
    if(gravMap[d.gravida]) ck(...gravMap[d.gravida], 'gravida');

    if(d.sang_menop==='Sim') ck(412.9,653.9, 'sang-menop');
    else if(d.sang_menop)    ck(412.9,667.3, 'sang-menop');

    const pilMap={'Sim':[165.3,657.7],'Não':[216.2,657.7],'Nao':[216.2,657.7],'Não sabe':[252.2,657.7]};
    if(pilMap[d.pilula]) ck(...pilMap[d.pilula], 'pilula');

    const thrMap={'Sim':[165.3,692.5],'Não':[216.2,692.5],'Nao':[216.2,692.5],'Não sabe':[252.2,692.5]};
    if(thrMap[d.thr]) ck(...thrMap[d.thr], 'thr');

    // ── EXAME CLÍNICO ──
    const coloMap={normal:[104.2,741.0],ausente:[104.2,754.0],alterado:[104.2,767.0],naovisu:[104.2,780.0]};
    if(coloMap[d.colo]) ck(...coloMap[d.colo], 'colo');

    if(d.dst==='sim')      ck(355.1,742.0, 'ist');
    else if(d.dst==='nao') ck(355.1,755.7, 'ist');

    // ── RODAPÉ ──
    tcd(CX.data_col, Y.data_col, fmtDate(d.data_coleta), 'data-coleta');
    tc(CX.resp,     Y.resp,     d.responsavel, 'responsavel');

    // ── DOWNLOAD ──
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes],{type:'application/pdf'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const nomeSafe=(d.nome.split(' ')[0]||'paciente').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
    a.href=url; a.download=`sobreimpressao-ficha-rosa_${nomeSafe}_${d.data_coleta||'semdata'}.pdf`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),120000);

    st.style.color='var(--green)';
    st.innerHTML=ic('check')+' Sobreimpressão gerada. <a href="'+url+'" target="_blank" rel="noopener" style="color:var(--green);font-weight:700">Abrir PDF</a>';

  } catch(e){
    console.error(e);
    st.style.color='#b91c1c';
    st.textContent=''+(e?.message||String(e||'Não foi possível gerar a Ficha Rosa.'));
  } finally {
    btn.disabled=false; btn.innerHTML=ic('flower')+' Gerar Ficha Rosa';
  }
}

// ══ MÓDULOS CLÍNICOS GERAIS, PRIORIDADE, EXAME GUIADO E SAE ══
const EXAME_GUIADO_SISTEMAS=['Estado geral','Nível de consciência','Pele e mucosas','Hidratação','Cabeça e pescoço','Olhos','Ouvidos','Cavidade oral','Respiratório','Cardiovascular','Abdome','Geniturinário','Neurológico','Membros superiores','Membros inferiores','Edema','Dor','Feridas','Mobilidade','Marcha','Humor/afetividade','Comunicação','Nutrição','Eliminações'];
const FATORES_PRIORIDADE=['Sinais vitais alterados','Queixa aguda','Dor intensa','Febre persistente','Alteração respiratória','Alteração neurológica','Gestante','Criança pequena','Idoso frágil','Vulnerabilidade social','Risco de violência','Risco de suicídio','Falta de acompanhamento','Resultado de exame alterado'];
const QUEIXAS_ACOLHIMENTO=['Atraso menstrual','Cefaleia','Cólica menstrual','Constipação','Crise convulsiva','Descompensação da pressão arterial','Diarreia e/ou náusea/vômito','Dispneia','Disúria','Dor abdominal','Dor articular','Dor lombar','Dor osteomuscular','Dor torácica','Edema','Febre','Herpes labial','Herpes genital','Herpes zoster','Hemorroida/doenças orificiais','Hiperglicemia','Leucorreias','Mastalgia','Mordedura/acidente com animais','Odinofagia/síndrome gripal','Otalgia','Parasitoses intestinais','Pirose','Problemas de pele','Problemas oftalmológicos','Queimadura','Reação alérgica','Sangramento genital','Síndrome pé-mão-boca','Sofrimento mental','Demanda administrativa','Vacina atrasada','Resultado de exame','Outros'];
const ALERTAS_QUEIXA={
  'Tosse':['Falta de ar','Saturação baixa','Febre persistente','Dor torácica','Sangue no escarro','Confusão mental','Criança pequena','Idoso frágil','Gestante','Piora progressiva'],
  'Dor abdominal':['Dor intensa','Rigidez abdominal','Vômitos persistentes','Febre','Sangramento','Desmaio','Gestante','Dor localizada intensa','Sinais de desidratação'],
  'Disúria/queixa urinária':['Febre','Dor lombar','Gestante','Sangue na urina','Náuseas/vômitos','ITU de repetição','Idoso com confusão mental'],
  'Falta de ar':['Saturação baixa','Cianose','Confusão mental','Dor torácica','Piora progressiva'],
  'Dor torácica':['Dor intensa','Falta de ar','Sudorese','Desmaio','Alteração neurológica'],
  'Febre':['Febre persistente','Confusão mental','Sinais de desidratação','Criança pequena','Idoso frágil','Gestante'],
  'Cefaleia':['Dor intensa','Alteração neurológica','Alteração visual','Rigidez de nuca','Gestante'],
  'Ansiedade/crise emocional':['Risco de suicídio','Agitação intensa','Confusão mental','Risco de violência'],
  'Dor de garganta':['Falta de ar','Dificuldade importante para engolir','Sialorreia','Febre persistente','Piora progressiva'],
  'Náuseas/vômitos':['Vômitos persistentes','Sinais de desidratação','Sangramento','Dor abdominal intensa','Gestante','Alteração neurológica'],
  'Diarreia':['Sinais de desidratação','Sangramento','Febre persistente','Dor abdominal intensa','Criança pequena','Idoso frágil'],
  'Corrimento':['Dor pélvica importante','Febre','Gestante','Violência sexual','Lesões sugestivas','Sinais sistêmicos'],
  'Dor lombar':['Febre','Alteração neurológica','Perda de força/sensibilidade','Trauma','Gestante','Sangue na urina'],
  'Feridas/lesões de pele':['Febre','Necrose','Odor forte','Exsudato purulento','Celulite ao redor','Ferida em pé diabético'],
  'Pressão alta':['Dor torácica','Falta de ar','Alteração neurológica','Alteração visual','Cefaleia intensa','Gestante'],
  'Glicemia alterada':['Alteração neurológica','Sinais de desidratação','Vômitos persistentes','Hipoglicemia importante','Glicemia muito elevada'],
  'Queda':['Alteração neurológica','Desmaio','Trauma craniano','Dor intensa','Uso de anticoagulante','Idoso frágil'],
  'Mordedura/picada':['Falta de ar','Edema de face','Sinais sistêmicos','Necrose','Sangramento','Animal não localizado'],
  'Suspeita de dengue':['Sangramento','Dor abdominal intensa','Vômitos persistentes','Desmaio','Hipotensão','Sinais de desidratação'],
  'Suspeita de IST':['Teste reagente','Gestante com teste reagente','Violência sexual','Lesões sugestivas','Dor pélvica importante','Sinais sistêmicos'],
  'Outros':['Dor intensa','Febre persistente','Falta de ar','Alteração neurológica','Sangramento','Piora progressiva']
};
Object.assign(ALERTAS_QUEIXA,{
  'Atraso menstrual':['Dor abdominal moderada/grave','Blumberg positivo','Dor pélvica moderada','Defesa muscular','Febre associada a leucorreia','Massa abdominal','Sintomas sugestivos de gravidez','TIG positivo','TIG negativo'],
  'Cólica menstrual':['Dor intensa','Sangramento intenso','Febre','Suspeita de gravidez','Síncope','Dor pélvica persistente'],
  'Constipação':['Dor abdominal intensa','Vômitos persistentes','Distensão importante','Sangramento retal','Febre','Idoso frágil'],
  'Crise convulsiva':['Crise em atividade','Rebaixamento de consciência','Trauma associado','Gestante','Febre','Primeira crise','Crises repetidas'],
  'Descompensação da pressão arterial':['PA muito elevada','Dor torácica','Falta de ar','Alteração neurológica','Alteração visual','Cefaleia intensa','Gestante'],
  'Diarreia e/ou náusea/vômito':['Sinais de desidratação','Vômitos persistentes','Sangramento','Febre persistente','Dor abdominal intensa','Criança pequena','Idoso frágil','Gestante'],
  'Dispneia':['Saturação baixa','Cianose','Confusão mental','Dor torácica','Uso de musculatura acessória','Piora progressiva'],
  'Disúria':['Febre','Dor lombar','Gestante','Sangue na urina','Náuseas/vômitos','ITU de repetição','Idoso com confusão mental'],
  'Dor articular':['Febre','Edema importante','Trauma','Limitação funcional intensa','Suspeita de dengue/chikungunya'],
  'Dor osteomuscular':['Trauma importante','Déficit neurológico','Dor intensa','Febre','Perda de força/sensibilidade'],
  'Edema':['Falta de ar','Dor torácica','Gestante','Edema súbito','Dor em panturrilha','Assimetria de membros'],
  'Herpes labial':['Imunossupressão','Lesões extensas','Febre','Dor intensa'],
  'Herpes genital':['Primeiro episódio','Gestante','Imunossupressão','Lesões extensas','Dor intensa','Retenção urinária'],
  'Herpes zoster':['Lesão em face/olho','Imunossupressão','Dor intensa','Lesões extensas','Febre'],
  'Hemorroida/doenças orificiais':['Sangramento intenso','Dor intensa','Febre','Secreção purulenta','Trombose dolorosa'],
  'Hiperglicemia':['Glicemia muito elevada','Vômitos persistentes','Sinais de desidratação','Alteração neurológica','Respiração alterada','Ferida infectada'],
  'Leucorreias':['Dor pélvica importante','Febre','Gestante','Violência sexual','Lesões sugestivas','Sinais sistêmicos','Sangramento pós-coito'],
  'Mastalgia':['Nódulo palpável','Sinais de mastite','Febre','Secreção papilar sanguinolenta','Gestante/puérpera'],
  'Mordedura/acidente com animais':['Animal não localizado','Ferimento profundo','Sangramento intenso','Sinais sistêmicos','Edema de face','Necrose','Acidente com animal peçonhento'],
  'Odinofagia/síndrome gripal':['Falta de ar','Saturação baixa','Dificuldade importante para engolir','Sialorreia','Febre persistente','Piora progressiva','Gestante','Idoso frágil'],
  'Otalgia':['Febre persistente','Secreção no ouvido','Dor intensa','Tontura intensa','Criança pequena'],
  'Parasitoses intestinais':['Desnutrição','Anemia suspeita','Sangue nas fezes','Dor abdominal intensa','Vômitos persistentes'],
  'Pirose':['Dor torácica','Vômitos persistentes','Sangramento digestivo','Perda de peso','Disfagia'],
  'Problemas de pele':['Febre','Necrose','Odor forte','Exsudato purulento','Celulite ao redor','Ferida em pé diabético','Lesão suspeita'],
  'Problemas oftalmológicos':['Perda visual súbita','Dor ocular intensa','Trauma ocular','Corpo estranho','Olho vermelho com baixa visual'],
  'Queimadura':['Face/vias aéreas','Grande extensão','Criança pequena','Idoso frágil','Genitália/mãos/pés','Bolhas extensas','Sinais de infecção'],
  'Reação alérgica':['Falta de ar','Edema de face/língua','Chiado no peito','Hipotensão/desmaio','Urticária disseminada','Piora progressiva'],
  'Sangramento genital':['Gestante','Sangramento intenso','Dor pélvica importante','Tontura/desmaio','Pós-menopausa','Febre'],
  'Síndrome pé-mão-boca':['Criança pequena','Sinais de desidratação','Febre persistente','Lesões extensas','Prostração'],
  'Sofrimento mental':['Ideação suicida','Plano suicida','Tentativa recente','Surto psicótico','Risco de violência','Intoxicação/abstinência','Sem rede de apoio'],
  'Demanda administrativa':['Sem queixa clínica','Necessidade de orientação','Documento/resultado','Renovação/encaminhamento'],
  'Vacina atrasada':['Criança pequena','Gestante','Idoso','Imunossupressão','Exposição de risco'],
  'Resultado de exame':['Resultado crítico','Exame alterado com sintomas','Gestante','Criança','Idoso frágil']
});
const DEMANDA_DESFECHOS=['Atendido pelo enfermeiro','Encaminhado para médico','Encaminhado para odontologia','Encaminhado para sala de vacina','Encaminhado para curativo/procedimento','Encaminhado para UPA','Encaminhado para maternidade','SAMU acionado','Vaga Zero acionada','Encaminhado para CAPS/ASM','Encaminhado para vigilância/SINAN','Agendado retorno','Orientado autocuidado','Incluído em busca ativa','Recusou atendimento','Evadiu','Outro'];
const DEMANDA_CATEGORIAS={
  ginecologico:['Atraso menstrual','Cólica menstrual','Leucorreias','Mastalgia','Sangramento genital','Herpes genital'],
  respiratorio:['Dispneia','Odinofagia/síndrome gripal','Febre'],
  dor:['Cefaleia','Dor abdominal','Dor articular','Dor lombar','Dor osteomuscular','Dor torácica','Pirose','Otalgia'],
  metabolico:['Descompensação da pressão arterial','Hiperglicemia','Edema','Resultado de exame'],
  pele:['Problemas de pele','Queimadura','Herpes labial','Herpes zoster','Feridas/lesões de pele'],
  pediatrico:['Febre','Síndrome pé-mão-boca','Diarreia e/ou náusea/vômito','Otalgia','Vacina atrasada'],
  mental:['Sofrimento mental'],
  vigilancia:['Mordedura/acidente com animais','Suspeita de dengue','Suspeita de IST','Reação alérgica'],
  administrativo:['Demanda administrativa','Vacina atrasada','Resultado de exame','Outros']
};
const DEMANDA_MODULOS={
  'Atraso menstrual':['Pré-Natal','IST','PNI'],
  'Leucorreias':['IST','Preventivo','SINAN se agravo notificável'],
  'Herpes genital':['IST'],
  'Sangramento genital':['Pré-Natal/Maternidade se gestante','Preventivo'],
  'Sofrimento mental':['Saúde Mental/ERSM','CAPS/ASM se risco'],
  'Febre':['Puericultura se criança','SINAN se suspeita de agravo'],
  'Síndrome pé-mão-boca':['Puericultura'],
  'Descompensação da pressão arterial':['Hiperdia'],
  'Hiperglicemia':['Hiperdia'],
  'Problemas de pele':['Feridas/Curativos'],
  'Queimadura':['Feridas/Curativos'],
  'Mordedura/acidente com animais':['PNI','SINAN/Vigilância','Feridas/Curativos'],
  'Vacina atrasada':['PNI'],
  'Resultado de exame':['Histórico','módulo relacionado ao achado']
};
const DEMANDA_FLUXOS=ESFDemandFlows;
DEMANDA_CATEGORIAS.outros_fluxos_oficiais=Object.keys(DEMANDA_FLUXOS).filter(q=>!Object.values(DEMANDA_CATEGORIAS).flat().includes(q));
function fluxoDemanda(q){
  return DEMANDA_FLUXOS[q]||{perguntas:'Caracterizar início, duração, intensidade, sinais vitais, sinais de alerta, contexto especial e vulnerabilidade.',vermelho:'Instabilidade, alteração neurológica, dispneia, dor intensa com sinais sistêmicos, sangramento importante ou risco imediato.',amarelo:'Sintoma agudo com fator de risco, dor moderada/intensa, febre persistente, gestante, criança pequena ou idoso frágil.',verde:'Queixa aguda estável, sem sinal de alerta, com necessidade de manejo no dia.',azul:'Demanda eletiva/administrativa, sem sintoma agudo nem sinal de alerta.',conduta:'Definir conduta específica da queixa, orientar sinais de retorno e registrar desfecho. Se houver alerta, elevar classificação e acionar fluxo relacionado.',modulos:(DEMANDA_MODULOS[q]||['Histórico']).join('; ')};
}
function criteriosMunicipaisSelecionados(){
  try{return JSON.parse(val('ger-criterios-municipais')||'[]').flatMap(x=>{const fluxo=DEMANDA_FLUXOS[x.queixa],c=fluxo?.criterios?.find(c=>c.id===x.id);return c?[{...c,queixa:x.queixa}]:[];});}catch(e){return [];}
}
function selecionarCriterioMunicipal(queixa,id,checked){
  let campo=document.getElementById('ger-criterios-municipais');if(!campo)return;
  let dados=criteriosMunicipaisSelecionados().map(x=>({queixa:x.queixa,id:x.id})).filter(x=>!(x.queixa===queixa&&x.id===id));if(checked)dados.push({queixa,id});campo.value=JSON.stringify(dados);avaliarDemandaEspontanea();
}
function tabelaCriteriosMunicipais(queixa,fluxo){
  if(!fluxo.criterios)return '<p>Sem tabela específica para esta seleção. Registrar avaliação profissional e consultar a fonte aplicável.</p>';
  const selecionados=criteriosMunicipaisSelecionados();
  return `<p><a href="${escTR(fluxo.url)}" target="_blank" rel="noopener">Abrir capítulo oficial — página ${fluxo.pagina}</a>. Revise o quadro completo e registre o achado que justifica a categoria.</p><div class="municipal-criteria">${fluxo.criterios.map(c=>`<details><summary>${c.cor} — critérios municipais</summary><p>${escTR(c.texto)}</p><label class="assessment-confirmation"><input type="checkbox" ${selecionados.some(x=>x.queixa===queixa&&x.id===c.id)?'checked':''} onchange="selecionarCriterioMunicipal('${escTR(queixa)}','${c.id}',this.checked)">Identifiquei achado compatível com esta categoria e conferi o contexto.</label></details>`).join('')}</div>`;
}
function demandaPainelHtml(p){
  if(p!=='ger')return'';
  return`<div class="demand-toolbar"><button type="button" class="btn btn-s" onclick="novoAcolhimentoDemanda()">Novo acolhimento</button><button type="button" class="btn btn-s" onclick="filtrarQueixasDemanda('todas')">Todas</button>${Object.keys(DEMANDA_CATEGORIAS).map(k=>`<button type="button" class="btn btn-s demand-filter" onclick="filtrarQueixasDemanda('${k}')">${k}</button>`).join('')}<button type="button" class="btn btn-ai" onclick="gerarRelatorioTestesDemanda()">Testar fluxos</button></div><div class="module-form-grid"><div class="f"><label for="ger-modo">Modo de atendimento</label><select id="ger-modo" onchange="atualizarModoDemanda()"><option>Modo rápido</option><option>Modo completo</option><option>Modo auditoria</option></select></div><div class="f required-mark"><label for="ger-chegada">Horário de chegada</label><input id="ger-chegada" type="time" value="${new Date().toTimeString().slice(0,5)}"></div><div class="f required-mark"><label for="ger-classificacao-cor">Classificação Toledo 2026</label><select id="ger-classificacao-cor" onchange="avaliarDemandaEspontanea()"><option value="">— automática ou manual —</option><option>Vermelho</option><option>Amarelo</option><option>Verde</option><option>Azul</option></select></div><div class="f span2 required-mark"><label for="ger-criterio-classificacao">Critério que justificou a classificação</label><textarea id="ger-criterio-classificacao" placeholder="O sistema sugere, mas revise e complete o critério clínico."></textarea></div><div class="f span2"><label for="ger-justificativa-rebaixamento">Justificativa técnica se rebaixar a cor sugerida</label><textarea id="ger-justificativa-rebaixamento" placeholder="Obrigatória se a cor manual for menor que a cor sugerida pelo sistema."></textarea></div><div class="f"><label for="ger-responsavel-reavaliacao">Responsável pela reavaliação</label><input id="ger-responsavel-reavaliacao" placeholder="Ex: enfermeiro/profissional responsável"></div><div class="f"><label for="ger-monitoramento">Monitoramento / medidas de conforto</label><input id="ger-monitoramento" placeholder="Ex: PA seriada, repouso, hidratação, observação..."></div><div class="f span2 required-mark"><label for="ger-desfecho">Desfecho do acolhimento</label><select id="ger-desfecho" onchange="avaliarDemandaEspontanea()"><option value="">— selecionar —</option>${DEMANDA_DESFECHOS.map(x=>`<option>${x}</option>`).join('')}</select></div></div><div id="ger-demanda-painel" class="priority-panel"><strong>Classificação não definida</strong><small>Selecione uma queixa e sinais de alerta.</small></div><input type="hidden" id="ger-criterios-municipais" value="[]"><div class="f"><label for="ger-achado-criterio">Achado que corresponde ao critério municipal selecionado</label><textarea id="ger-achado-criterio"></textarea></div><div id="ger-fluxo-queixa"></div><div id="ger-integracoes" class="alert alert-i">Integrações serão sugeridas conforme a queixa selecionada.</div><div id="ger-auditoria-demanda"></div><div id="ger-relatorio-testes"></div>`;
}
function filtrarQueixasDemanda(cat){
  const permitidas=cat==='todas'?null:new Set(DEMANDA_CATEGORIAS[cat]||[]);
  document.querySelectorAll('#pg-consulta-geral .complaint-chip').forEach(b=>b.style.display=!permitidas||permitidas.has(b.textContent.trim())?'inline-flex':'none');
}
function atualizarModoDemanda(renderAuditoria=true){
  const modo=val('ger-modo'),pg=document.getElementById('pg-consulta-geral');if(!pg)return;
  pg.classList.toggle('modo-rapido-demanda',modo==='Modo rápido');
  const audit=document.getElementById('ger-auditoria-demanda');if(audit&&modo==='Modo auditoria'&&renderAuditoria)audit.innerHTML=validarDemandaEspontanea(false).map(x=>`<div class="alert alert-w">${escTR(x)}</div>`).join('')||'<div class="alert alert-s">Sem pendências críticas identificadas.</div>';
}
function corDemandaPorDados(){
  const calculada=ESFClinical.triage({complaints:val('ger-complaints'),alerts:val('ger-alerts'),text:[val('ger-queixa'),val('ger-hma'),val('ger-gravidade'),val('ger-motivo')].join('; '),pa:val('ger-pa'),sat:val('ger-sat'),fr:val('ger-fr'),glicemia:val('ger-glicemia'),assessed:document.getElementById('ger-avaliacao-confirmada')?.checked});
  const selecionados=criteriosMunicipaisSelecionados();const maior=selecionados.sort((a,b)=>(ORDEM_RISCO_DEMANDA[b.cor]||0)-(ORDEM_RISCO_DEMANDA[a.cor]||0))[0];
  if(maior&&(ORDEM_RISCO_DEMANDA[maior.cor]||0)>=(ORDEM_RISCO_DEMANDA[calculada.cor]||0))return{cor:maior.cor,criterio:`Critério municipal conferido (${maior.queixa}, p. ${maior.pagina}): ${val('ger-achado-criterio')||'Descrever o achado que corresponde à categoria selecionada.'}`,acao:ESFClinical.triageActions[maior.cor]};
  return calculada;
}

const ORDEM_RISCO_DEMANDA={'Não classificado':0,Azul:1,Verde:2,Amarelo:3,Vermelho:4};
function integracoesDemanda(){
  const qs=val('ger-complaints').split('; ').filter(Boolean),texto=normalizarTextoProtocolo([qs.join(' '),val('ger-alerts'),val('ger-hma'),val('ger-queixa')].join(' ')),mods=new Set();
  qs.forEach(q=>(DEMANDA_MODULOS[q]||[]).forEach(m=>mods.add(m)));
  if(/gestante|tig positivo|atraso menstrual|sangramento genital|perda de liquido|movimentos fetais/.test(texto))mods.add('Pré-Natal');
  if(/leucorreia|corrimento|herpes genital|sifilis|hiv|violencia sexual|ist|teste reagente/.test(texto))mods.add('IST');
  if(/violencia sexual|mordedura|animal|dengue|hiv|sifilis|hepatite|agravo notificavel/.test(texto))mods.add('SINAN/Vigilância');
  if(/sofrimento mental|ideacao|suicid|surto|ansiedade|crise emocional/.test(texto))mods.add('Saúde Mental');
  if(/pa |pressao|hiperglicemia|glicemia|diabetes|hipertens/.test(texto))mods.add('Hiperdia');
  if(/ferida|queimadura|pele|necrose|curativo/.test(texto))mods.add('Feridas/Curativos');
  if(/vacina|mordedura|animal|gestante|crianca|idoso/.test(texto))mods.add('PNI/Vacinação');
  return[...mods];
}
function avaliarDemandaEspontanea(){
  const sug=corDemandaPorDados(),manual=val('ger-classificacao-cor'),cor=manual||sug.cor,criterio=document.getElementById('ger-criterio-classificacao'),desfecho=val('ger-desfecho'),mods=integracoesDemanda(),painel=document.getElementById('ger-demanda-painel');
  if(criterio){if(!criterio.value.trim()||criterio.value===criterio.dataset.automatico)criterio.value=sug.criterio;criterio.dataset.automatico=sug.criterio;}
  const acao=ESFClinical.triageActions[cor]||sug.acao;
  const principal=val('ger-complaints').split('; ').filter(Boolean)[0]||'Outros',fluxo=fluxoDemanda(principal),fluxoEl=document.getElementById('ger-fluxo-queixa');
  if(fluxoEl){const assinatura=principal+'|'+val('ger-criterios-municipais');if(fluxoEl.dataset.assinatura!==assinatura){fluxoEl.dataset.assinatura=assinatura;fluxoEl.innerHTML=`<div class="demand-flow-card"><h4>Fluxo da queixa: ${escTR(principal)}</h4>${tabelaCriteriosMunicipais(principal,fluxo)}<p>${escTR(fluxo.conduta)}</p></div>`;}}
  if(painel){painel.className='priority-panel demanda-'+cor.toLowerCase();painel.innerHTML=`<strong>${cor} — ${cor==='Vermelho'?'atendimento imediato':cor==='Amarelo'?'prioritário no mesmo turno':cor==='Verde'?'atendimento no dia':cor==='Azul'?'eletivo/agendado':'avaliação pendente'}</strong><small>Critério: ${escTR(val('ger-criterio-classificacao')||sug.criterio)}\nAção: ${escTR(acao)}${desfecho?`\nDesfecho: ${escTR(desfecho)}`:''}</small>`}
  const integ=document.getElementById('ger-integracoes');if(integ)integ.innerHTML=mods.length?`<strong>Módulos/fluxos sugeridos:</strong> ${mods.map(escTR).join(' · ')}.`:'Integrações serão sugeridas conforme a queixa selecionada.';
  [['prioridade',cor],['prioridade-motivo',val('ger-criterio-classificacao')||sug.criterio],['prioridade-acao',acao]].forEach(([k,v])=>{const e=document.getElementById(`ger-${k}`);if(e)e.value=v});
  atualizarModoDemanda(false);
  return{cor,corSugerida:sug.cor,criterio:val('ger-criterio-classificacao')||sug.criterio,acao,mods,desfecho,fluxo:principal};
}
function validarDemandaEspontanea(alertar=true){
  const d=avaliarDemandaEspontanea(),pend=[];
  if(criteriosMunicipaisSelecionados().length&&!val('ger-achado-criterio'))pend.push('Descreva o achado que justifica o critério municipal selecionado.');
  if(!val('ger-motivo')&&!val('ger-queixa'))pend.push('Informe o motivo da procura/queixa principal.');
  if(!val('ger-complaints'))pend.push('Selecione ao menos uma queixa/fluxo do protocolo.');
  if(!d.cor||d.cor==='Não classificado')pend.push('Complete a avaliação antes de definir a classificação de risco.');
  if(!d.criterio)pend.push('Informe o critério que justificou a classificação.');
  if(!d.desfecho)pend.push('Selecione o desfecho do acolhimento.');
  if(ORDEM_RISCO_DEMANDA[d.cor]<ORDEM_RISCO_DEMANDA[d.corSugerida]&&!val('ger-justificativa-rebaixamento'))pend.push(`Classificação sugerida ${d.corSugerida}; para usar ${d.cor}, registre justificativa técnica do rebaixamento.`);
  const t=normalizarTextoProtocolo([val('ger-alerts'),val('ger-queixa'),val('ger-hma'),d.criterio,val('ger-conduta'),val('ger-encaminhamento'),d.desfecho].join(' '));
  if(d.cor==='Vermelho'&&!/samu|vaga zero|m[eé]dic|upa|maternidade|imediat|emerg/.test(t))pend.push('Classificação Vermelho exige registro de atendimento imediato, presença médica e/ou acionamento adequado.');
  if(d.cor==='Amarelo'&&!/mesmo turno|priorit|m[eé]dic|monitor/.test([t,val('ger-monitoramento'),val('ger-responsavel-reavaliacao')].join(' ')))pend.push('Classificação Amarelo exige prioridade no mesmo turno, monitoramento/medidas de conforto e responsável pela reavaliação.');
  if(d.cor==='Verde'&&!val('ger-conduta'))pend.push('Classificação Verde exige conduta específica da queixa, orientações e retorno; não deixar plano genérico.');
  if(d.cor==='Azul'&&/dor intensa|saturacao baixa|gestante|sangramento|alteracao neurologica|ideacao suicida|violencia sexual/.test(t))pend.push('Classificação Azul não é compatível com sinal de alerta registrado.');
  if(d.cor==='Azul'&&/febre|dor moderada|sintoma agudo|crianca pequena|idoso fragil|gestante|sofrimento mental/.test(t))pend.push('Azul deve ficar restrito a demanda eletiva/administrativa sem sintoma agudo relevante.');
  if(/gestante/.test(t)&&/sangramento|perda de liquido|movimentos fetais/.test(t)&&!/maternidade|pre.?natal|obstetr/.test(t))pend.push('Gestante com sinal de alerta precisa acionar Pré-Natal/maternidade/urgência.');
  if(/ideacao suicida|surto psicotico|tentativa recente|risco de suicidio/.test(t)&&!/saude mental|caps|asm|urgencia|m[eé]dic/.test(t))pend.push('Sofrimento mental grave precisa acionar Saúde Mental/urgência.');
  if(/leucorreia|corrimento|herpes genital|violencia sexual|teste reagente/.test(t)&&!/ist|sinan|vigilancia/.test(t))pend.push('Possível IST/violência/exposição precisa acionar IST e SINAN quando aplicável.');
  if(/teste|mock|paciente teste|ficticio/.test(t))pend.push('Há possível dado fictício/teste no atendimento. Revise antes de usar em prontuário real.');
  if(alertar&&pend.length){alert('Avisos para revisar. Nenhuma ação foi bloqueada.\n\n- '+pend.join('\n- '));}
  return pend;
}
function novoAcolhimentoDemanda(){['ger-motivo','ger-queixa','ger-hma','ger-inicio','ger-sintomas','ger-conduta','ger-orientacoes','ger-encaminhamento','ger-retorno','ger-desfecho','ger-criterio-classificacao','ger-classificacao-cor'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});document.querySelectorAll('#pg-consulta-geral .complaint-chip.selected,#pg-consulta-geral .alert-chip.selected').forEach(b=>b.classList.remove('selected'));['ger-complaints','ger-alerts'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});renderAlertasAcolhimento('ger');avaliarDemandaEspontanea();}
function gerarRelatorioTestesDemanda(){
  const testes=[
    ['Dor torácica','Dor torácica; Falta de ar; Sudorese','Vermelho'],
    ['Dispneia','Saturação baixa; Cianose','Vermelho'],
    ['Atraso menstrual','Sintomas sugestivos de gravidez','Verde'],
    ['Atraso menstrual','Blumberg positivo; Dor abdominal moderada/grave','Vermelho'],
    ['Cefaleia','Sem sinais neurológicos','Verde'],
    ['Cefaleia','Alteração neurológica','Vermelho'],
    ['Febre','Criança pequena; Febre persistente','Amarelo'],
    ['Leucorreias','Corrimento; Dor pélvica importante','Amarelo'],
    ['Sofrimento mental','Ideação suicida; Plano suicida','Vermelho'],
    ['Reação alérgica','Prurido/urticária sem sinais sistêmicos','Verde'],
    ['Reação alérgica','Edema de face; Falta de ar','Vermelho'],
    ['Demanda administrativa','Documento/orientação sem queixa clínica aguda','Azul']
  ];
  const resultado=testes.map(([queixa,alertas,esperada])=>{
    const cor=ESFClinical.triage({complaints:queixa,alerts:alertas,assessed:true}).cor;
    return{queixa,alertas,esperada,cor,passou:cor===esperada,fluxo:fluxoDemanda(queixa).conduta};
  });
  const out=document.getElementById('ger-relatorio-testes');if(out)out.innerHTML=`<div class="demand-flow-card"><h4>Relatório de testes internos — Demanda Espontânea</h4><div class="vac-table-wrap"><table class="vac-table"><thead><tr><th>Queixa</th><th>Sinais</th><th>Esperado</th><th>Gerado</th><th>Resultado</th></tr></thead><tbody>${resultado.map(r=>`<tr><td>${escTR(r.queixa)}</td><td>${escTR(r.alertas)}</td><td>${escTR(r.esperada)}</td><td>${escTR(r.cor)}</td><td>${r.passou?'Passou':'Falhou'}</td></tr>`).join('')}</tbody></table></div><div class="alert ${resultado.every(r=>r.passou)?'alert-s':'alert-w'}">${resultado.filter(r=>r.passou).length}/${resultado.length} testes passaram. Este relatório é apoio interno; revisar casos reais clinicamente.</div></div>`;
}
const AUDITORIA_PROTOCOLOS=[
  ['Demanda Espontânea','Protocolo Municipal de Enfermagem — Demanda Espontânea APS Toledo','2026','Demanda Espontânea','Classificação Vermelho/Amarelo/Verde/Azul, desfecho, fluxo por queixa','Completar validação humana de todos os fluxos do PDF oficial'],
  ['IST/Testes rápidos','Protocolo IST Toledo','2020','IST, Pré-Natal, SINAN','Testes rápidos, sífilis/HIV/hepatites, candidíase, vaginose, tricomoníase, herpes e parceria','Conferir REMUME local e disponibilidade na unidade'],
  ['Pré-Natal','Protocolo Pré-Natal Toledo 4ª edição','2021','Abertura PN, Consulta PN, Puerpério','IG/DPP, risco, exames, vacinação, sinais de alerta e DMG','Revisar mudanças municipais futuras'],
  ['PNI/Vacinação','Calendário Nacional de Vacinação/PNI','vigente','PNI e todas as consultas','Histórico vacinal, pendências, gestante/criança/adulto/idoso','Confirmar disponibilidade, intervalos e CRIE na sala de vacina'],
  ['Puericultura','Estratificação de risco e acompanhamento de puericultura Paraná','2021','Puericultura','Crescimento, DNPM, vacinação e risco','Conferir curva/idade no prontuário antes de concluir'],
  ['Idoso','IVCF-20 e protocolos transversais','vigente','Idoso','IVCF, domínios, quedas, polifarmácia e violência','Validar domínios e contexto familiar'],
  ['Saúde Mental','ERSM versão reduzida e fluxos municipais','vigente','Saúde Mental','ERSM, risco, CAPS/ASM e plano de segurança','Sempre validar exame do estado mental e risco suicida'],
  ['SINAN','Ficha SINAN e lista nacional de agravos','vigente','SINAN, IST, Demanda','Notificação individual e agravos acionados','Confirmar ficha específica do agravo quando aplicável']
];
const AUDITORIA_CENARIOS=[
  ['Dor torácica grave','Dor torácica','Dor torácica; Falta de ar; Sudorese','Vermelho','Urgência/UPA/SAMU'],
  ['Dispneia grave','Dispneia','Saturação baixa; Cianose','Vermelho','Urgência'],
  ['Cefaleia simples','Cefaleia','Dor leve sem sinais neurológicos','Verde','Demanda'],
  ['Cefaleia neurológica','Cefaleia','Alteração neurológica','Vermelho','Urgência'],
  ['Febre criança','Febre','Criança pequena; Febre persistente','Amarelo','Puericultura'],
  ['Gestante com sangramento','Sangramento genital','Gestante; Sangramento intenso','Vermelho','Pré-Natal/Maternidade'],
  ['Atraso menstrual leve','Atraso menstrual','Sintomas sugestivos de gravidez','Verde','Pré-Natal'],
  ['Atraso menstrual grave','Atraso menstrual','Blumberg positivo; Dor abdominal moderada/grave','Vermelho','Urgência/Pré-Natal'],
  ['Leucorreia com dor','Leucorreias','Corrimento; Dor pélvica importante','Amarelo','IST/Preventivo'],
  ['Reação alérgica leve','Reação alérgica','Prurido/urticária sem sinais sistêmicos','Verde','Demanda'],
  ['Anafilaxia','Reação alérgica','Edema de face; Falta de ar','Vermelho','SAMU/UPA'],
  ['Mordedura animal','Mordedura/acidente com animais','Animal não localizado; Ferimento profundo','Amarelo','PNI/SINAN/Feridas'],
  ['Sofrimento leve','Sofrimento mental','Ansiedade sem ideação suicida','Verde','Saúde Mental'],
  ['Ideação suicida','Sofrimento mental','Ideação suicida; Plano suicida','Vermelho','Saúde Mental/CAPS'],
  ['Demanda administrativa','Demanda administrativa','Documento/orientação sem queixa clínica aguda','Azul','Administrativo']
];
function classificarCenarioAuditoria(queixa,sinais){return ESFClinical.triage({complaints:queixa,alerts:sinais,assessed:true}).cor;}

function rodarAuditoriaClinica(){
  const resultados=AUDITORIA_CENARIOS.map(([cenario,queixa,sinais,esperada,mod])=>{const cor=classificarCenarioAuditoria(queixa,sinais),fluxo=fluxoDemanda(queixa),passou=cor===esperada;return{cenario,queixa,sinais,esperada,cor,criterio:fluxo[cor.toLowerCase()]||fluxo.conduta,conduta:fluxo.conduta,modulos:mod,passou,correcao:passou?'Sem correção automática indicada.':'Revisar regra de classificação/fluxo antes de publicar.'}});
  const ok=resultados.filter(r=>r.passou).length,out=document.getElementById('auditoria-clinica-resultados'),res=document.getElementById('auditoria-clinica-resumo');
  if(res)res.innerHTML=`<div class="lab-summary-item ${ok===resultados.length?'ok':'att'}"><strong>${ok}/${resultados.length}</strong><span>Testes passaram</span></div><div class="lab-summary-item ok"><strong>${AUDITORIA_PROTOCOLOS.length}</strong><span>Protocolos mapeados</span></div><div class="lab-summary-item att"><strong>Humana</strong><span>Validação final obrigatória</span></div>`;
  if(out)out.innerHTML=`<div class="vac-table-wrap"><table class="vac-table"><thead><tr><th>Cenário</th><th>Queixa</th><th>Esperado</th><th>Gerado</th><th>Critério</th><th>Conduta</th><th>Módulos</th><th>Resultado</th></tr></thead><tbody>${resultados.map(r=>`<tr><td>${escTR(r.cenario)}</td><td>${escTR(r.queixa)}</td><td>${escTR(r.esperada)}</td><td>${escTR(r.cor)}</td><td>${escTR(fraseProtocolarCurta(r.criterio,120))}</td><td>${escTR(fraseProtocolarCurta(r.conduta,140))}</td><td>${escTR(r.modulos)}</td><td>${r.passou?'Passou':'Falhou'}</td></tr>`).join('')}</tbody></table></div><div class="alert ${ok===resultados.length?'alert-s':'alert-w'}">${ok}/${resultados.length} cenários passaram. Resultado de apoio interno; revisar protocolos e casos reais antes de uso institucional.</div>`;
  try{localStorage.setItem('esf_auditoria_clinica_ultima',JSON.stringify({data:new Date().toISOString(),resultados}))}catch(e){}
  renderAuditoriaProtocolos();
  return resultados;
}
function renderAuditoriaProtocolos(){
  const p=document.getElementById('auditoria-protocolos');if(p)p.innerHTML=`<div class="vac-table-wrap"><table class="vac-table"><thead><tr><th>Módulo</th><th>Fonte</th><th>Ano/versão</th><th>Aplicado em</th><th>Condutas implementadas</th><th>Pendência</th></tr></thead><tbody>${AUDITORIA_PROTOCOLOS.map(x=>`<tr>${x.map(c=>`<td>${escTR(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const h=document.getElementById('auditoria-pendencias-humanas');if(h)h.innerHTML=['Validar condutas medicamentosas contra REMUME/protocolo vigente da unidade.','Conferir fluxos completos de cada queixa no PDF oficial de Demanda Espontânea Toledo 2026.','Confirmar políticas reais de Supabase/RLS, perfis e auditoria institucional antes de produção.','Revisar documentos impressos com folhas oficiais e impressora da UBS.','Manter profissional responsável revisando SOAP antes de copiar para e-SUS/PEC.'].map(x=>`<div class="alert alert-w">${escTR(x)}</div>`).join('');
}
function exportarAuditoriaClinica(){
  let dados=[];try{dados=JSON.parse(localStorage.getItem('esf_auditoria_clinica_ultima')||'{}').resultados||[]}catch(e){}
  if(!dados.length)dados=rodarAuditoriaClinica();
  const csv='cenario;queixa;sinais;esperado;gerado;resultado;modulos\\n'+dados.map(r=>[r.cenario,r.queixa,r.sinais,r.esperada,r.cor,r.passou?'passou':'falhou',r.modulos].map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(';')).join('\\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='auditoria-clinica-esf.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
const MODULOS_CLINICOS={
  ger:{tipo:'Demanda Espontânea / Acolhimento',page:'consulta-geral',titulo:'Demanda Espontânea / Acolhimento',sub:'Porta de entrada da APS: escuta qualificada, risco Toledo 2026, conduta e desfecho',icone:'✚',desenvolvimento:false,queixas:QUEIXAS_ACOLHIMENTO,
    campos:[['motivo','Motivo da consulta','textarea'],['queixa','Queixa principal','textarea'],['hma','História da doença/queixa atual','textarea'],['inicio','Tempo de início','text'],['sintomas','Sintomas associados','textarea'],['antecedentes','Antecedentes pessoais','textarea'],['comorbidades','Comorbidades','textarea'],['medicamentos','Medicamentos em uso','textarea'],['alergias','Alergias','textarea'],['familiar','Histórico familiar relevante','textarea'],['habitos','Hábitos de vida','textarea'],['social','Condições sociais relevantes','textarea'],['problemas','Problemas identificados','textarea'],['necessidade','Diagnóstico/necessidade de enfermagem sugerida','textarea'],['conduta','Condutas de enfermagem','textarea'],['orientacoes','Orientações dadas','textarea'],['encaminhamento','Encaminhamentos','textarea'],['retorno','Retorno programado','text'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea'],['observacoes','Observações','textarea']]},
  acol:{tipo:'Acolhimento',page:'acolhimento',titulo:'Acolhimento / Demanda Espontânea',sub:'Módulo legado integrado à Consulta Geral',icone:'◉',desenvolvimento:true,oculto:true,queixas:QUEIXAS_ACOLHIMENTO,
    campos:[['queixa','Queixa principal','textarea'],['inicio','Tempo de início','text'],['intensidade','Intensidade','select',['Leve','Moderada','Intensa']],['sintomas','Sinais e sintomas associados','textarea'],['comorbidades','Comorbidades','textarea'],['medicamentos','Medicamentos em uso','textarea'],['alergias','Alergias','textarea'],['gestante','Gestante','select',['Não','Sim']],['crianca','Criança','select',['Não','Sim']],['idoso','Idoso','select',['Não','Sim']],['vulneravel','Paciente vulnerável','select',['Não','Sim']],['gravidade','Sinais de gravidade','textarea'],['conduta','Conduta de enfermagem','textarea'],['medico','Necessidade de atendimento médico','select',['Não','Sim','Imediato']],['encaminhamento','Encaminhamento','textarea'],['retorno','Retorno','text'],['orientacoes','Orientações','textarea'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea']]},
  hip:{tipo:'Hiperdia',page:'hiperdia',titulo:'Hiperdia / Condições Crônicas',sub:'Hipertensão, diabetes, adesão, riscos e seguimento',icone:'♥',desenvolvimento:true,
    campos:[['diagnostico','Diagnóstico conhecido','select',['Hipertensão','Diabetes','Hipertensão e diabetes','Outro']],['condicao-protocolar','Condição protocolar associada','select',['Sem condição adicional','HAS mal controlada com três medicações em dose plena','DM sem controle com insulina ≥ 1 unidade/kg/dia e boa adesão','DM com TFG menor que 30','DM2 com doença cardiovascular em metformina + sulfonilureia','DM — avaliação de iSGLT2','Insuficiência cardíaca com síncope / hipoperfusão / congestão pulmonar','Arritmia com síncope / hipoperfusão / dispneia / alteração de risco','Hipotireoidismo central','Hipotireoidismo em dose elevada de levotiroxina > 2,5 mcg/kg/dia','Hipertireoidismo','Hipertireoidismo subclínico','Nódulo de tireoide','Bócio multinodular','Obesidade secundária','Obesidade IMC 35–39,99 com comorbidade e insucesso por 2 anos','Obesidade IMC 40–49,99 e insucesso por 2 anos / cirurgia bariátrica','Obesidade IMC 50 ou mais / cirurgia bariátrica','Hiperprolactinemia']],['pa-atual','PA atual','text'],['pa-anteriores','PA anteriores','textarea'],['glicemia','Glicemia capilar','number'],['hba1c','Hemoglobina glicada (%)','number'],['dose-insulina','Dose total de insulina (unidades/kg/dia)','number'],['tfg','TFG estimada (mL/min/1,73m²)','number'],['peso','Peso (kg)','number'],['altura','Altura (cm)','number'],['imc','IMC','number'],['circ-abdominal','Circunferência abdominal (cm)','number'],['medicamentos','Medicamentos em uso','textarea'],['adesao','Adesão ao tratamento','select',['Adequada','Parcial','Inadequada']],['esquecimento','Esquecimento de medicação','select',['Não','Sim']],['efeitos','Efeitos adversos','textarea'],['alimentacao','Alimentação','textarea'],['atividade','Atividade física','textarea'],['tabagismo','Tabagismo','select',['Não','Sim']],['alcool','Álcool','text'],['sono','Sono','text'],['estresse','Estresse','text'],['dor-toracica','Dor torácica','select',['Não','Sim']],['falta-ar','Falta de ar','select',['Não','Sim']],['tontura','Tontura','select',['Não','Sim']],['cefaleia','Cefaleia','select',['Não','Sim']],['visual','Alteração visual','select',['Não','Sim']],['edema','Edema','select',['Não','Sim']],['pe-diabetico','Pé diabético','select',['Não','Sim']],['feridas','Feridas','select',['Não','Sim']],['hipoglicemia','Hipoglicemia','select',['Não','Sim']],['exames','Últimos exames','textarea'],['ultima-medica','Última consulta médica','date'],['pendencias','Encaminhamentos pendentes','textarea'],['conduta','Plano/conduta de cuidado','textarea'],['orientacoes','Orientações simples','textarea'],['retorno','Retorno','text'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea']]},
  fer:{tipo:'Feridas / Curativos',page:'feridas',titulo:'Feridas / Curativos',sub:'Avaliação estruturada, curativo e evolução comparativa',icone:'✣',desenvolvimento:true,
    campos:[['local','Local da ferida','text'],['tipo','Tipo de ferida','select',['Lesão por pressão','Venosa','Arterial','Diabética','Traumática','Cirúrgica','Queimadura','Outra']],['inicio','Data de início','date'],['comprimento','Comprimento (cm)','number'],['largura','Largura (cm)','number'],['profundidade','Profundidade (cm)','number'],['bordas','Bordas','text'],['tecido','Tecido predominante','select',['Granulação','Fibrina','Necrose','Epitelização','Esfacelo']],['exsudato','Quantidade de exsudato','select',['Ausente','Pouco','Moderado','Intenso']],['aspecto-exsudato','Aspecto do exsudato','text'],['odor','Odor','select',['Ausente','Leve','Forte']],['dor','Dor / intensidade','text'],['pele','Pele ao redor','textarea'],['infeccao','Sinais de infecção','textarea'],['edema','Presença de edema','select',['Não','Sim']],['calor','Calor local','select',['Não','Sim']],['cobertura','Cobertura utilizada','text'],['produto','Produto utilizado','text'],['frequencia','Frequência de troca','text'],['orientacoes','Orientações ao paciente/cuidador','textarea'],['medico','Necessidade de avaliação médica','select',['Não','Sim','Imediata']],['visita','Necessidade de visita domiciliar','select',['Não','Sim']],['retorno','Retorno','text'],['evolucao','Evolução comparativa','textarea'],['conduta','Conduta de enfermagem','textarea'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea']],
    alertas:['Aumento da ferida','Necrose','Odor forte','Exsudato purulento','Dor intensa','Febre','Celulite ao redor','Ferida em pé diabético','Suspeita de infecção'],foto:true},
  puerp:{tipo:'Puerpério',page:'puerperio',titulo:'Puerpério',sub:'Avaliação materna, amamentação, saúde mental e sinais de alerta',icone:'◌',desenvolvimento:true,
    campos:[['data-parto','Data do parto','date'],['tipo-parto','Tipo de parto','select',['Vaginal','Cesárea','Instrumental','Outro']],['local-parto','Local do parto','text'],['dias','Dias de pós-parto','number'],['sangramento','Sangramento','textarea'],['dor','Dor','textarea'],['febre','Febre','select',['Não','Sim']],['mamas','Mamas','textarea'],['amamentacao','Amamentação','textarea'],['fissuras','Fissuras mamilares','select',['Não','Sim']],['ingurgitamento','Ingurgitamento','select',['Não','Sim']],['ferida','Ferida operatória/episiorrafia','textarea'],['eliminacoes','Eliminações','textarea'],['sono','Sono','text'],['alimentacao','Alimentação','text'],['humor','Humor','textarea'],['choro','Choro frequente','select',['Não','Sim']],['ansiedade','Ansiedade','select',['Não','Sim']],['rede','Rede de apoio','textarea'],['vinculo','Vínculo mãe-bebê','textarea'],['depressao','Sinais de depressão pós-parto','textarea'],['planejamento','Planejamento reprodutivo','textarea'],['vacinacao','Vacinação','textarea'],['medicamentos','Medicações','textarea'],['rn','RN vinculado','text'],['conduta','Conduta de enfermagem','textarea'],['orientacoes','Orientações','textarea'],['retorno','Retorno','text'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea']],
    alertas:['Febre','Sangramento intenso','Dor intensa','Secreção/odor em ferida operatória','Mastite','Tristeza intensa','Ideação suicida','Rejeição do bebê','Falta de rede de apoio','Sinais de violência']},
  ist:{tipo:'IST / Testes Rápidos',page:'ist',titulo:'IST / Testes Rápidos',sub:'Testagem isolada, registro profissional, orientação, conduta protocolar e retorno',icone:'＋',desenvolvimento:false,
    campos:[['motivo','Motivo da testagem/atendimento','textarea'],['queixa-sindrome','Queixa ou síndrome principal','select',['Corrimento','Prurido/ardor vulvovaginal','Odor vaginal','Disúria','Dor pélvica','Úlcera genital','Vesículas / herpes','Verrugas / HPV','Teste reagente','Parceria com IST','Exposição sexual recente','Violência sexual','Rastreamento sem sintomas','Outro']],['suspeita-clinica','Suspeita clínica inicial','textarea'],['sintomas','Sintomas e exame dirigido','textarea'],['diagnostico-sindromico','Diagnóstico confirmado, se houver','select',['Não definido — manter como suspeita clínica','Diagnóstico clínico confirmado: Candidíase vulvovaginal','Diagnóstico clínico confirmado: Candidíase complicada ou recorrente','Diagnóstico clínico confirmado: Vaginose bacteriana','Diagnóstico clínico confirmado: Vaginose bacteriana recorrente','Diagnóstico clínico confirmado: Tricomoníase','Diagnóstico clínico confirmado: Cervicite','Diagnóstico clínico confirmado: Uretrite','Diagnóstico confirmado: Sífilis recente','Diagnóstico confirmado: Sífilis tardia / duração ignorada','Neurossífilis','Herpes genital — primeiro episódio','Herpes genital — recidiva com lesões maiores','Herpes genital — recidiva com lesões menores','Supressão de herpes — 6 ou mais episódios/ano','Herpes genital em imunossuprimido','Condiloma / HPV — lesões pequenas','Condiloma / HPV — lesões extensas','Cancroide','Linfogranuloma venéreo / LGV','Donovanose']],['lactante','Lactante','select',['Não','Sim']],['corrimento','Corrimento','select',['Não','Sim']],['lesoes','Lesões genitais','select',['Não','Sim']],['dor-pelvica','Dor pélvica','select',['Não','Sim']],['disuria','Disúria','select',['Não','Sim']],['exposicao','Exposição sexual recente','select',['Não','Sim']],['violencia','Violência sexual','select',['Não','Sim']],['parceiro','Parceiro sintomático','select',['Não','Sim']],['tratamento','Tratamento realizado / medicado conforme protocolo','textarea'],['orientacoes','Orientações de prevenção, janela imunológica e sinais de alerta','textarea'],['parceria','Parceria sexual: convocação/testagem/tratamento quando indicado','textarea'],['notificacao','Notificação/SINAN, se aplicável','textarea'],['encaminhamento','Encaminhamento / rede acionada','textarea'],['retorno','Retorno','text'],['conduta','Conduta de enfermagem / protocolo local','textarea'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea']],
    alertas:['Teste reagente','Gestante com teste reagente','Violência sexual','Lesões sugestivas','Dor pélvica importante','Sinais sistêmicos']},
  vd:{tipo:'Visita Domiciliar',page:'visita-domiciliar',titulo:'Visita Domiciliar',sub:'Avaliação no domicílio: acamados, dispositivos, medicações, cuidador, risco e plano de cuidados',icone:'⌂',desenvolvimento:false,
    campos:[
      ['sexo','Sexo','select',['Feminino','Masculino','Outro / não informado']],['cuidador','Cuidador principal','text'],['parentesco-cuidador','Parentesco do cuidador','text'],['telefone-cuidador','Telefone do cuidador','text'],
      ['acs','ACS responsável','text'],['familia','Família / núcleo familiar','text'],['responsavel-familiar','Responsável familiar','text'],['mora-sozinho','Mora sozinho','select',['Não','Sim']],['moradores','Número de moradores','number'],
      ['beneficio-social','Benefício social','textarea'],['condicao-moradia','Condição de moradia','select',['Própria','Alugada','Cedida','Situação instável','Outra']],['saneamento','Saneamento básico','select',['Adequado','Inadequado','Ausente']],['agua','Água tratada','select',['Sim','Não','Parcial']],['energia','Energia elétrica','select',['Sim','Não']],['acessibilidade','Acessibilidade do domicílio','textarea'],['escadas','Escadas / barreiras arquitetônicas','select',['Não','Sim']],['risco-ambiental','Risco ambiental / higiene / ventilação / animais','textarea'],
      ['motivo','Motivo da visita','select',['Primeira visita','Rotina / acompanhamento','Pós-alta hospitalar','Curativo','Avaliação de acamado','Avaliação de sonda/dispositivo','Avaliação de medicações','Queixa aguda','Busca ativa','Avaliação do cuidador','Outro']],['queixa','Queixa principal / demanda da família','textarea'],['historia','História e contexto da visita','textarea'],
      ['acamado','Paciente acamado','select',['Não','Sim','Restrito ao leito parcialmente']],['mobilidade','Mobilidade','select',['Deambula sem auxílio','Deambula com auxílio','Cadeirante','Restrito ao leito','Acamado']],['adl','Dependência para atividades diárias','select',['Independente','Dependência parcial','Dependência total']],['consciencia','Nível de consciência','select',['Lúcido/orientado','Sonolento','Confuso','Rebaixado']],['comunicacao','Comunicação','select',['Preservada','Dificuldade parcial','Não verbal / muito limitada']],['emocional','Estado emocional','textarea'],['dor','Dor referida','textarea'],
      ['glicemia','Glicemia capilar','number'],['peso','Peso (kg)','number'],['altura','Altura (cm)','number'],['imc','IMC','number'],['panturrilha','Circunferência da panturrilha, se idoso (cm)','number'],['vitais-obs','Observações dos sinais vitais','textarea'],
      ['decubito','Decúbito e mudança de posição','textarea'],['transferencia','Senta, levanta e transferência','textarea'],['higiene','Banho, higiene íntima, vestuário e eliminações','textarea'],['fraldas','Uso de fraldas / trocas / dermatite associada à incontinência','textarea'],
      ['alimentacao-via','Via de alimentação','select',['Oral','SNE / SNG','Gastrostomia','Jejunostomia','Parenteral','Mista']],['dieta','Dieta, aceitação e hidratação','textarea'],['sonda-dieta','Complemento livre sobre alimentação/sonda, se necessário','textarea'],
      ['pele','Pele, lesões e risco de LPP','textarea'],['feridas','Feridas / LPP: local, tamanho, tecido, exsudato, odor, dor, cobertura','textarea'],['eliminacoes','Diurese, evacuação, constipação, diarreia, ostomias','textarea'],['respiratorio','Respiração, tosse, secreção, risco de broncoaspiração','textarea'],
      ['cuidador-avaliacao','Avaliação do cuidador: compreensão, sobrecarga, rede de apoio','textarea'],['orientacoes','Orientações realizadas','textarea'],['conduta','Condutas de enfermagem realizadas / pactuadas','textarea'],['retorno','Retorno / próxima visita','text'],['sinais-alerta-orientados','Sinais de alerta orientados','textarea']
    ],
    alertas:['Febre','Dispneia','Saturação baixa','Dor intensa','Rebaixamento/confusão aguda','PA muito elevada','Glicemia muito elevada','Hipoglicemia','Queda recente','Suspeita de infecção','Necrose','Exsudato purulento','Odor forte em ferida','Sonda exteriorizada/obstruída','Sangramento','Cuidador exausto','Violência/negligência','Falta de medicação essencial','Ausência de insumos básicos'],
    extraHtml:visitaDomiciliarExtraHtml}
};
const EXAMES_MODULOS_NOVOS={
  ger:commonAdultExam.concat([{title:'Pele, mucosas e dor',items:[cp('Pele integra, mucosas normocoradas e hidratadas'),cp('Palidez ou hipocoramento','attention'),cp('Lesao de pele','attention'),cp('Dor intensa','critical','Avaliar intensidade, sinais associados e solicitar avaliação médica conforme gravidade.')]}]),
  acol:commonAdultExam,
  hip:commonAdultExam.concat([{title:'Pes e perfusao',items:[cp('Pes integros, pulsos presentes e sensibilidade preservada'),cp('Sensibilidade reduzida em pes','attention'),cp('Ferida em pe diabetico','critical','Proteger a lesão e solicitar avaliação médica prioritária conforme fluxo de pé diabético.'),cp('Edema importante','attention')]}]),
  fer:[{title:'Estado geral e sinais infecciosos',items:[cp('BEG, afebril, hidratado'),cp('Febril','attention'),cp('MEG ou sinais sistêmicos','critical','Solicitar avaliação médica imediata.') ]},{title:'Ferida e pele ao redor',items:[cp('Leito com granulação, sem sinais de infecção'),cp('Esfacelo ou fibrina','attention'),cp('Necrose','critical','Solicitar avaliação médica e revisar plano de cuidado da ferida.'),cp('Exsudato purulento ou odor forte','critical','Avaliar suspeita de infecção e solicitar avaliação médica.'),cp('Celulite ao redor','critical','Solicitar avaliação médica no mesmo atendimento.') ]},{title:'Dor, edema e perfusao',items:[cp('Sem dor importante, perfusao preservada'),cp('Dor local','attention'),cp('Dor intensa ou desproporcional','critical','Solicitar avaliação médica imediata.'),cp('Edema','attention'),cp('Perfusao reduzida','critical','Solicitar avaliação vascular/médica prioritária.')]}],
  puerp:[{title:'Condicoes gerais e sangramento',items:[cp('BEG, afebril, hidratada'),cp('Dor leve esperada','attention'),cp('Febre','critical','Avaliar imediatamente suspeita de infecção puerperal.'),cp('Sangramento intenso','critical','Encaminhar imediatamente para avaliação obstétrica.') ]},{title:'Mamas e amamentacao',items:[cp('Mamas sem alterações, amamentação efetiva'),cp('Fissura mamilar','attention'),cp('Ingurgitamento','attention'),cp('Sinais de mastite','critical','Solicitar avaliação médica e apoiar manutenção segura da amamentação.') ]},{title:'Ferida e eliminacoes',items:[cp('Ferida operatória/episiorrafia sem alterações'),cp('Dor ou edema local','attention'),cp('Secreção ou odor na ferida','critical','Solicitar avaliação médica no mesmo atendimento.'),cp('Eliminações preservadas'),cp('Disúria ou retenção','attention')]},{title:'Humor, vinculo e seguranca',items:[cp('Humor estável, vínculo presente e rede de apoio'),cp('Choro frequente ou ansiedade','attention'),cp('Tristeza intensa ou rejeição do bebê','critical','Realizar avaliação imediata de saúde mental e rede de apoio.'),cp('Ideação suicida','critical','Não deixar desacompanhada e acionar fluxo de urgência.')]}],
  ist:[{title:'Condicoes gerais',items:[cp('BEG, afebril, hidratado'),cp('Febre ou mal-estar','attention'),cp('Sinais sistêmicos ou MEG','critical','Solicitar avaliação médica imediata.') ]},{title:'Vulva, vagina e genitalia',items:[cp('Sem lesões genitais visíveis'),cp('Corrimento vaginal/uretral','attention'),cp('Úlcera ou vesículas genitais','attention'),cp('Lesão extensa, dolorosa ou suspeita','critical','Solicitar avaliação médica prioritária e seguir fluxo de IST.') ]},{title:'Abdome e pelve',items:[cp('Abdome indolor, sem sinais de irritação'),cp('Dor pélvica','attention'),cp('Dor pélvica intensa ou sinais de irritação peritoneal','critical','Solicitar avaliação médica imediata.') ]}],
  vd:[{title:'Condições gerais no domicílio',items:[cp('BEG, responsivo, hidratado, sem sinal agudo'),cp('Acamado ou restrito ao leito','attention'),cp('Confusão aguda ou rebaixamento','critical','Avaliar gravidade e necessidade de atendimento imediato conforme fluxo local.'),cp('Dor intensa','critical','Reavaliar sinais associados e necessidade de avaliação médica conforme quadro.')]},{title:'Pele, LPP e feridas',items:[cp('Pele íntegra, sem lesão por pressão'),cp('Pele ressecada ou hiperemia','attention'),cp('Lesão por pressão / ferida','attention'),cp('Necrose, odor forte ou exsudato purulento','critical','Registrar achado, proteger lesão e solicitar avaliação conforme protocolo/local.')]},{title:'Respiratório e dispositivos',items:[cp('Eupneico, sem secreção importante'),cp('Tosse ou secreção','attention'),cp('Risco de broncoaspiração','attention'),cp('Dispneia ou saturação baixa','critical','Avaliar necessidade de atendimento imediato conforme protocolo/local.')]}],
  default:commonAdultExam
};
const ANAMNESE_MODULOS_NOVOS={
  ger:[
    {title:'Evolução da queixa',items:[cp('Início recente, sem piora progressiva'),cp('Sintomas persistentes ou recorrentes','attention'),cp('Piora progressiva','critical'),cp('Dor intensa','critical'),cp('Interfere nas atividades diárias','attention')]},
    {title:'Sintomas gerais',items:[cp('Nega febre, dispneia, dor torácica, sangramento e alteração neurológica'),cp('Febre persistente','attention'),cp('Falta de ar','critical'),cp('Dor torácica','critical'),cp('Sangramento','critical'),cp('Alteração neurológica','critical')]},
    {title:'Condições e segurança',items:[cp('Aceita dieta e hidratação, eliminações preservadas'),cp('Medicamentos em uso informados'),cp('Nega alergias medicamentosas'),cp('Gestante','attention'),cp('Idoso frágil','attention'),cp('Vulnerabilidade social','attention'),cp('Risco de violência','critical'),cp('Risco de suicídio','critical')]}
  ],
  hip:[
    {title:'Controle e adesão',items:[cp('Uso regular das medicações e boa adesão'),cp('Esquecimentos ocasionais','attention'),cp('Adesão inadequada','attention'),cp('Efeitos adversos','attention'),cp('Sem acompanhamento recente','attention')]},
    {title:'Sintomas cardiovasculares e metabólicos',items:[cp('Nega dor torácica, dispneia, edema e sintomas de hipo/hiperglicemia'),cp('Dor torácica','critical'),cp('Falta de ar','critical'),cp('Edema','attention'),cp('Tontura ou cefaleia','attention'),cp('Sintomas de hipoglicemia','critical'),cp('Poliúria, polidipsia ou perda de peso','attention')]},
    {title:'Hábitos e autocuidado',items:[cp('Alimentação e atividade física conforme plano pactuado'),cp('Sedentarismo','attention'),cp('Consumo elevado de sal ou ultraprocessados','attention'),cp('Tabagismo','attention'),cp('Dificuldade para autocuidado dos pés','attention')]}
  ],
  fer:[
    {title:'Evolução da ferida',items:[cp('Ferida estável ou em redução'),cp('Aumento das dimensões','critical'),cp('Início recente','attention'),cp('Recorrente','attention'),cp('Dificuldade para realizar curativo','attention')]},
    {title:'Sintomas associados',items:[cp('Nega febre, odor forte, secreção purulenta e dor intensa'),cp('Febre','critical'),cp('Odor forte','critical'),cp('Exsudato purulento','critical'),cp('Dor intensa','critical'),cp('Edema ou calor local','attention')]},
    {title:'Contexto de cuidado',items:[cp('Paciente/cuidador compreende os cuidados'),cp('Diabetes','attention'),cp('Mobilidade reduzida','attention'),cp('Necessita visita domiciliar','attention'),cp('Sem rede de apoio','attention')]}
  ],
  puerp:[
    {title:'Recuperação puerperal',items:[cp('Recuperação habitual, sem febre ou sangramento aumentado'),cp('Sangramento intenso','critical'),cp('Febre','critical'),cp('Dor intensa','critical'),cp('Alteração em ferida operatória/episiorrafia','attention')]},
    {title:'Amamentação e mamas',items:[cp('Amamentação efetiva, sem dor ou lesões mamilares'),cp('Dificuldade de pega','attention'),cp('Fissura mamilar','attention'),cp('Ingurgitamento','attention'),cp('Sinais de mastite','critical')]},
    {title:'Humor, vínculo e apoio',items:[cp('Humor estável, vínculo presente e rede de apoio disponível'),cp('Ansiedade ou choro frequente','attention'),cp('Tristeza intensa','critical'),cp('Rejeição do bebê','critical'),cp('Ideação suicida','critical'),cp('Falta de rede de apoio','attention')]}
  ],
  ist:[
    {title:'Motivo e exposição',items:[cp('Testagem de rotina, sem sintomas'),cp('Exposição sexual recente','attention'),cp('Parceiro sintomático','attention'),cp('Violência sexual','critical'),cp('Gestante ou lactante','attention')]},
    {title:'Sintomas geniturinários',items:[cp('Nega corrimento, lesões, disúria e dor pélvica'),cp('Corrimento','attention'),cp('Lesões genitais','attention'),cp('Disúria','attention'),cp('Dor pélvica importante','critical'),cp('Sinais sistêmicos','critical')]},
    {title:'Aconselhamento e seguimento',items:[cp('Compreende janela imunológica e prevenção combinada'),cp('Necessita convocação de parceria','attention'),cp('Teste reagente','critical'),cp('Dificuldade para retorno','attention')]}
  ],
  vd:[
    {title:'Motivo e contexto da visita',items:[cp('Visita de rotina / acompanhamento'),cp('Pós-alta hospitalar','attention'),cp('Busca ativa','attention'),cp('Queixa aguda no domicílio','critical'),cp('Avaliação de acamado','attention'),cp('Avaliação de sonda/dispositivo','attention')]},
    {title:'Cuidador e rede de apoio',items:[cp('Cuidador presente e orientado'),cp('Cuidador com dúvidas','attention'),cp('Cuidador sobrecarregado','attention'),cp('Ausência de cuidador/rede de apoio','critical'),cp('Suspeita de violência ou negligência','critical')]},
    {title:'Medicações, insumos e segurança',items:[cp('Medicações organizadas e prescrição disponível'),cp('Dúvida sobre uso de medicação','attention'),cp('Falta de medicação ou insumo','critical'),cp('Risco de queda no domicílio','attention'),cp('Barreiras de acesso à UBS','attention')]}
  ]
};
function guiaAnamneseNovo(p){const grupos=ANAMNESE_MODULOS_NOVOS[p]||ANAMNESE_MODULOS_NOVOS.ger;return`<div class="clinical-guide" data-module="${p}"><div class="clinical-guide-head"><strong>Anamnese guiada — seleção rápida</strong><span>Clique nos achados relatados; eles serão usados no SOAP, prioridade e SAE</span></div>${clinicalPane(p,'anamnesis',grupos,true)}<div class="clinical-alerts" data-clinical-alert="${p}"></div></div>`}
function guiaExameNovo(p){const grupos=EXAMES_MODULOS_NOVOS[p]||EXAMES_MODULOS_NOVOS.default;return`<div class="clinical-guide" data-module="${p}"><div class="clinical-guide-head"><strong>Resultados rápidos do exame físico</strong><span>Clique nos achados; eles serão usados no SOAP, prioridade e SAE</span></div>${clinicalPane(p,'exam',grupos,true)}<div class="clinical-alerts" data-clinical-alert="${p}"></div></div><div class="f" style="margin-top:12px"><label>Complemento livre do exame físico</label><textarea id="${p}-exame-complementar" placeholder="Descreva outros achados, medidas e observações relevantes..."></textarea></div>`}
const VD_DISPOSITIVOS=['Sonda vesical de demora','Sonda vesical de alívio','SNE/SNG','Gastrostomia','Jejunostomia','Traqueostomia','Oxigenoterapia','Ostomia intestinal','Acesso venoso','Dreno','Curativo complexo','Outro dispositivo'];
const VD_INSUMOS=['Fraldas','Luvas','Gazes','Soro fisiológico','Cobertura de curativo','Seringas','Equipo/frascos de dieta','Fitas de glicemia','Lancetas','Medicamentos de uso contínuo','Material para sonda','Outros'];
function vdSelectPontuado(id,label,ops){return`<div class="f"><label>${label}</label><select id="${id}" onchange="calcularEscalasVD();classificarRiscoVD()"><option value="">Não avaliado</option>${ops.map(o=>`<option value="${o[1]}">${o[0]}</option>`).join('')}</select></div>`}
function escalasVDHtml(p){
  const braden=[['braden-sensorial','Percepção sensorial',[['1 - Totalmente limitada',1],['2 - Muito limitada',2],['3 - Levemente limitada',3],['4 - Sem limitação',4]]],['braden-umidade','Umidade',[['1 - Constantemente úmida',1],['2 - Muito úmida',2],['3 - Ocasionalmente úmida',3],['4 - Raramente úmida',4]]],['braden-atividade','Atividade',[['1 - Acamado',1],['2 - Cadeira',2],['3 - Anda ocasionalmente',3],['4 - Anda frequentemente',4]]],['braden-mobilidade','Mobilidade',[['1 - Totalmente imóvel',1],['2 - Muito limitada',2],['3 - Levemente limitada',3],['4 - Sem limitação',4]]],['braden-nutricao','Nutrição',[['1 - Muito pobre',1],['2 - Provavelmente inadequada',2],['3 - Adequada',3],['4 - Excelente',4]]],['braden-friccao','Fricção/cisalhamento',[['1 - Problema',1],['2 - Problema potencial',2],['3 - Sem problema aparente',3]]]];
  const katz=['Banho','Vestir-se','Higiene pessoal','Transferência','Continência','Alimentação'].map((x,i)=>[`katz-${i}`,x,[['Independente',1],['Dependente',0]]]);
  const barthel=[['barthel-alim','Alimentação',[['0 - Incapaz',0],['5 - Precisa de ajuda',5],['10 - Independente',10]]],['barthel-banho','Banho',[['0 - Dependente',0],['5 - Independente',5]]],['barthel-higiene','Higiene pessoal',[['0 - Dependente',0],['5 - Independente',5]]],['barthel-vestir','Vestir-se',[['0 - Dependente',0],['5 - Ajuda parcial',5],['10 - Independente',10]]],['barthel-intestino','Intestino',[['0 - Incontinente',0],['5 - Acidente ocasional',5],['10 - Continente',10]]],['barthel-bexiga','Bexiga',[['0 - Incontinente',0],['5 - Acidente ocasional',5],['10 - Continente',10]]],['barthel-vaso','Uso do vaso sanitário',[['0 - Dependente',0],['5 - Ajuda parcial',5],['10 - Independente',10]]],['barthel-transfer','Transferência cadeira/cama',[['0 - Incapaz',0],['5 - Grande ajuda',5],['10 - Pequena ajuda',10],['15 - Independente',15]]],['barthel-mob','Mobilidade',[['0 - Imóvel',0],['5 - Cadeira de rodas independente',5],['10 - Anda com ajuda',10],['15 - Independente',15]]],['barthel-escadas','Escadas',[['0 - Incapaz',0],['5 - Ajuda',5],['10 - Independente',10]]]];
  const morse=[['morse-queda','Histórico de queda recente',[['Não',0],['Sim',25]]],['morse-diagnostico','Diagnóstico secundário',[['Não',0],['Sim',15]]],['morse-auxilio','Auxílio para deambular',[['Nenhum/acamado/auxílio profissional',0],['Muletas/bengala/andador',15],['Apoia-se em móveis',30]]],['morse-iv','Terapia EV / acesso salinizado',[['Não',0],['Sim',20]]],['morse-marcha','Marcha',[['Normal/acamado/cadeira de rodas',0],['Fraca',10],['Comprometida',20]]],['morse-mental','Estado mental',[['Orientado quanto à própria capacidade',0],['Superestima capacidade/esquece limitações',15]]]];
  const mna=[['mna-ingesta','Redução da ingestão alimentar',[['Grave',0],['Moderada',1],['Sem redução',2]]],['mna-peso','Perda de peso recente',[['> 3 kg',0],['Não sabe',1],['1 a 3 kg',2],['Sem perda',3]]],['mna-mobilidade','Mobilidade',[['Restrito ao leito/cadeira',0],['Sai da cama/cadeira, não sai de casa',1],['Sai de casa',2]]],['mna-estresse','Doença aguda/estresse recente',[['Sim',0],['Não',2]]],['mna-neuro','Problema neuropsicológico',[['Demência/depressão grave',0],['Demência leve',1],['Sem problema',2]]],['mna-imc','IMC ou panturrilha',[['IMC < 19 ou panturrilha < 31 cm',0],['IMC 19 a <21',1],['IMC 21 a <23',2],['IMC >= 23 ou panturrilha adequada',3]]]];
  const bloco=(titulo,items)=>`<div class="scale-card"><h4>${titulo}</h4><div class="module-form-grid">${items.map(x=>vdSelectPontuado(`${p}-${x[0]}`,x[1],x[2])).join('')}</div></div>`;
  return`${bloco('Braden — risco de lesão por pressão',braden)}${bloco('Katz — atividades básicas de vida diária',katz)}${bloco('Barthel — índice de funcionalidade',barthel)}${bloco('Morse — risco de queda',morse)}${bloco('Triagem nutricional MNA-SF simplificada',mna)}<div class="module-form-grid"><div class="f span2"><label>Justificativa quando escala não aplicada</label><textarea id="${p}-escala-nao-aplicada" placeholder="Ex: paciente indisponível, recusa, condição clínica impediu aplicação completa..."></textarea></div></div><div id="${p}-escalas-resultado" class="alert alert-i">Escalas ainda não calculadas.</div><input type="hidden" id="${p}-escalas-resumo">`;
}
function campoDispVD(i,k,label,t='text',ops=[]){
  const id=`vd-device-${i}-${k}`,attr=`data-device-field="${escTR(label)}"`;
  if(t==='textarea')return`<div class="f span2"><label>${label}</label><textarea id="${id}" ${attr} oninput="classificarRiscoVD()"></textarea></div>`;
  if(t==='select')return`<div class="f"><label>${label}</label><select id="${id}" ${attr} onchange="classificarRiscoVD()"><option value="">Não avaliado</option>${ops.map(x=>`<option>${escTR(x)}</option>`).join('')}</select></div>`;
  return`<div class="f"><label>${label}</label><input id="${id}" ${attr} type="${t}" oninput="classificarRiscoVD()"></div>`;
}
function coletarMarcadosVD(sel){return Array.from(document.querySelectorAll(sel+':checked')).map(x=>x.value||x.closest('label')?.textContent?.trim()).filter(Boolean)}
function resumoDispositivosVD(){
  return Array.from(document.querySelectorAll('.vd-device-card')).map(card=>{
    const nome=card.dataset.device||'Dispositivo',partes=[];
    card.querySelectorAll('[data-device-field]').forEach(el=>{const v=String(el.value||'').trim();if(v)partes.push(`${el.dataset.deviceField}: ${v}`)});
    return partes.length?`${nome}: ${partes.join('; ')}`:nome;
  });
}
function calcularEscalasVD(){
  const n=id=>{const el=document.getElementById(id);if(!el||el.value==='')return null;const v=Number(el.value);return Number.isFinite(v)?v:null},linhas=[],pend=[],riscos=[];
  const escala=(nome,ids,interp)=>{
    const vals=ids.map(n),pre=vals.filter(v=>v!==null).length;
    if(!pre)return;
    if(pre<ids.length){pend.push(`${nome}: aplicação incompleta (${pre}/${ids.length} itens).`);return}
    const total=vals.reduce((a,b)=>a+b,0),res=interp(total);linhas.push(`${nome}: ${total} pontos — ${res.texto}.`);if(res.risco)riscos.push(res.risco);
  };
  escala('Braden',['vd-braden-sensorial','vd-braden-umidade','vd-braden-atividade','vd-braden-mobilidade','vd-braden-nutricao','vd-braden-friccao'],t=>t<=9?{texto:'risco muito alto de lesão por pressão',risco:'Braden com risco muito alto de LPP'}:t<=12?{texto:'risco alto de lesão por pressão',risco:'Braden com risco alto de LPP'}:t<=14?{texto:'risco moderado de lesão por pressão',risco:'Braden com risco moderado de LPP'}:t<=18?{texto:'risco baixo de lesão por pressão',risco:'Braden com risco baixo de LPP'}:{texto:'baixo risco/sem risco relevante pela escala'});
  escala('Katz',['vd-katz-0','vd-katz-1','vd-katz-2','vd-katz-3','vd-katz-4','vd-katz-5'],t=>t===6?{texto:'independente para ABVD'}:t>=3?{texto:'dependência parcial para ABVD',risco:'dependência parcial em ABVD'}:{texto:'dependência importante para ABVD',risco:'dependência importante em ABVD'});
  escala('Barthel',['vd-barthel-alim','vd-barthel-banho','vd-barthel-higiene','vd-barthel-vestir','vd-barthel-intestino','vd-barthel-bexiga','vd-barthel-vaso','vd-barthel-transfer','vd-barthel-mob','vd-barthel-escadas'],t=>t<=20?{texto:'dependência total',risco:'Barthel com dependência total'}:t<=60?{texto:'dependência grave',risco:'Barthel com dependência grave'}:t<=90?{texto:'dependência moderada'}:t<=99?{texto:'dependência leve'}:{texto:'independente'});
  escala('Morse',['vd-morse-queda','vd-morse-diagnostico','vd-morse-auxilio','vd-morse-iv','vd-morse-marcha','vd-morse-mental'],t=>t>=45?{texto:'alto risco de queda',risco:'Morse com alto risco de queda'}:t>=25?{texto:'risco moderado de queda',risco:'Morse com risco moderado de queda'}:{texto:'baixo risco de queda'});
  escala('MNA-SF simplificada',['vd-mna-ingesta','vd-mna-peso','vd-mna-mobilidade','vd-mna-estresse','vd-mna-neuro','vd-mna-imc'],t=>t<=7?{texto:'desnutrição provável',risco:'triagem nutricional com desnutrição provável'}:t<=11?{texto:'risco nutricional',risco:'triagem nutricional com risco nutricional'}:{texto:'estado nutricional sem risco pela triagem'});
  const just=val('vd-escala-nao-aplicada');if(just)pend.push(`Escala(s) não aplicada(s)/parciais: ${just}.`);
  const resumo=[...linhas,...pend],hidden=document.getElementById('vd-escalas-resumo');if(hidden)hidden.value=resumo.join('\n');
  const out=document.getElementById('vd-escalas-resultado');if(out)out.innerHTML=resumo.length?`<strong>Resultado das escalas:</strong><br>${resumo.map(escTR).join('<br>')}`:'Escalas ainda não calculadas.';
  return{linhas,pendencias:pend,riscos};
}
function textoSoapAnonimizadoVD(){const nome=String(val('vd-nome')||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return textoSoapAtual(false).replace(nome?new RegExp(nome,'gi'):/__nomex__/g,'Paciente').replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,'CPF oculto').replace(/\b\d{15}\b/g,'CNS oculto').replace(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g,'telefone oculto')}
function copiarSoapAnonimizadoVD(){copiarTextoSeguro(textoSoapAnonimizadoVD());showToast('SOAP anonimizado copiado.')}
async function gerarPDFVisitaDomiciliar(){
  if(!exigirPermissao('gerar_documentos'))return;
  try{await carregarPdfLibPN();const {PDFDocument,StandardFonts,rgb}=PDFLib,pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),cor=rgb(.03,.09,.19);let page=pdf.addPage([595.28,841.89]),y=802;page.drawText('RELATÓRIO DE VISITA DOMICILIAR — ESF',{x:44,y,size:13,font:bold,color:cor});y-=24;const linhas=relatorioTextoVisitaDomiciliar().split('\n');for(const l of linhas){const partes=pnPdfLinhas(l,font,9,505);for(const p of partes){if(y<48){page=pdf.addPage([595.28,841.89]);y=802}page.drawText(p,{x:44,y,size:9,font,color:cor});y-=12}if(!l.trim())y-=4}await baixarPdfPN(pdf,`visita-domiciliar-${rotuloId(val('vd-nome')||'paciente')}.pdf`);showToast('Relatório PDF da visita gerado.')}catch(e){console.error(e);showToast('Não foi possível gerar o PDF da visita domiciliar.')}
}

// Visita domiciliar 2.0: roteiro por etapas, campos condicionais, risco em 4 dimensões e PDF enxuto.
const VD_TIPOS_VISITA=[['rotina','Rotina/acompanhamento'],['primeira','Primeira visita'],['acamado','Acamado/restrito ao leito'],['pos-alta','Pós-alta hospitalar'],['ferida','Curativo/LPP/ferida'],['dispositivo','Sonda/dispositivo'],['idoso-fragil','Idoso frágil'],['busca-ativa','Busca ativa'],['cuidador','Cuidador sobrecarregado'],['social','Condição social/vulnerabilidade']];
function vdField(id,label,t='text',opts=[]){const full=`vd-${id}`,ev=t==='textarea'?'oninput':'onchange';if(t==='textarea')return`<div class="f span2"><label>${label}</label><textarea id="${full}" ${ev}="classificarRiscoVD();validarVisitaDomiciliar()"></textarea></div>`;if(t==='select')return`<div class="f"><label>${label}</label><select id="${full}" onchange="classificarRiscoVD();validarVisitaDomiciliar()"><option value="">—</option>${opts.map(o=>`<option>${escTR(o)}</option>`).join('')}</select></div>`;return`<div class="f"><label>${label}</label><input id="${full}" type="${t}" oninput="classificarRiscoVD();validarVisitaDomiciliar()"></div>`}
function vdStep(titulo,sub,conteudo,show='',open=true){return`<details class="vd-step vd-conditional" ${open?'open':''} ${show?`data-vd-show="${show}"`:''}><summary><span>${titulo}</span>${sub?`<small>${sub}</small>`:''}</summary><div class="vd-step-body">${conteudo}</div></details>`}
function vdCheck(id,label){return`<label class="soft-check"><input type="checkbox" id="vd-${id}" onchange="classificarRiscoVD();validarVisitaDomiciliar()">${label}</label>`}
function vdInsumosTable(){return`<div class="vd-panel-table"><table class="vd-table"><thead><tr><th>Item</th><th>Tem em casa</th><th>Suficiente</th><th>Quem fornece</th><th>Solicitar</th><th>Obs.</th></tr></thead><tbody>${VD_INSUMOS.map(x=>`<tr data-insumo="${escTR(x)}"><td>${escTR(x)}</td><td><select class="vd-insumo-tem" onchange="classificarRiscoVD();validarVisitaDomiciliar()"><option value="">Não avaliado</option><option>Sim</option><option>Não</option><option>Parcial</option></select></td><td><select class="vd-insumo-suf" onchange="classificarRiscoVD();validarVisitaDomiciliar()"><option value="">Não avaliado</option><option>Sim</option><option>Não</option><option>Parcial</option></select></td><td><input class="vd-insumo-forn"></td><td><select class="vd-insumo-solicitar" onchange="classificarRiscoVD();validarVisitaDomiciliar()"><option value="">Não avaliado</option><option>Não</option><option>Sim</option></select></td><td><input class="vd-insumo-obs"></td></tr>`).join('')}</tbody></table></div>`}
function visitaDomiciliarExtraHtml(p){
  const tipos=VD_TIPOS_VISITA.map(([v,l])=>`<label class="vd-type-card"><input type="radio" name="vd-tipo-visita-radio" value="${v}" onchange="document.getElementById('vd-tipo-visita').value=this.value;atualizarTipoVisitaVD();classificarRiscoVD();validarVisitaDomiciliar()"> ${l}</label>`).join('');
  return`<div class="home-visit-extra">
    <div class="alert alert-i"><strong>Visita domiciliar:</strong> roteiro inteligente para registro assistencial. O sistema apoia a avaliação e não substitui julgamento profissional, protocolos municipais ou fluxos locais.</div>
    <input type="hidden" id="vd-tipo-visita">
    <div class="vd-step" open><summary><span>Tipo de visita</span><small>Escolha para mostrar só os campos relevantes</small></summary><div class="vd-step-body"><div class="vd-type-grid">${tipos}</div></div></div>
    ${vdStep('Etapa 1 — Pré-visita','organização antes de sair para o domicílio',`<div class="module-form-grid">${vdField('motivo','Motivo da visita','textarea')}${vdField('objetivo-visita','Objetivo da visita','textarea')}${vdField('acs','ACS responsável')}${vdField('familia','Família / núcleo familiar')}${vdField('responsavel-familiar','Responsável familiar')}${vdField('sexo','Sexo','select',['Feminino','Masculino','Outro / não informado'])}${vdField('cuidador','Cuidador principal')}${vdField('parentesco-cuidador','Parentesco do cuidador')}${vdField('telefone-cuidador','Telefone do cuidador')}${vdField('ultima-visita','Última visita domiciliar','date')}${vdField('materiais','Materiais necessários antes da visita','textarea')}${vdField('pre-obs','Observações antes da visita','textarea')}</div>`)}
    ${vdStep('Etapa 2 — Avaliação rápida do paciente','estado geral, sinais e dependência',`<div class="module-form-grid">${vdField('queixa','Queixa principal / demanda da família','textarea')}${vdField('historia','História e contexto da visita','textarea')}${vdField('estado-geral','Estado geral','select',['BEG','REG','MEG','Sonolento','Confuso','Rebaixado'])}${vdField('consciencia','Nível de consciência','select',['Lúcido/orientado','Sonolento','Confuso','Rebaixado'])}${vdField('comunicacao','Comunicação','select',['Preservada','Dificuldade parcial','Não verbal / muito limitada'])}${vdField('dor','Dor referida','textarea')}${vdField('acamado','Paciente acamado','select',['Não','Sim','Restrito ao leito parcialmente'])}${vdField('restrito-domicilio','Restrito ao domicílio','select',['Não','Sim','Parcial'])}${vdField('mobilidade','Mobilidade','select',['Deambula sem auxílio','Deambula com auxílio','Cadeirante','Restrito ao leito','Acamado'])}${vdField('adl','Grau de dependência','select',['Independente','Dependência parcial','Dependência total'])}${vdField('eliminacoes','Eliminações','textarea')}${vdField('sono','Sono/repouso','textarea')}${vdField('higiene','Higiene','textarea')}${vdField('dieta','Alimentação/hidratação','textarea')}${vdField('glicemia','Glicemia capilar','number')}${vdField('peso','Peso (kg)','number')}${vdField('altura','Altura (cm)','number')}${vdField('imc','IMC','number')}${vdField('panturrilha','Circunferência da panturrilha, se idoso (cm)','number')}${vdField('vitais-obs','Observações dos sinais vitais','textarea')}</div>`)}
    ${vdStep('Etapa 3 — Acamado / restrito ao leito','pele, LPP, decúbito e segurança',`<div class="check-row">${vdCheck('decubito-mudanca','Mudança de decúbito orientada/realizada')}${vdCheck('colchao-adequado','Colchão adequado')}${vdCheck('pele-avaliada','Pele avaliada')}${vdCheck('sacral','Região sacral avaliada')}${vdCheck('calcaneos','Calcâneos avaliados')}${vdCheck('trocanteres','Trocânteres avaliados')}${vdCheck('cotovelos','Cotovelos avaliados')}${vdCheck('vermelhidao','Presença de vermelhidão')}${vdCheck('lpp-presente','Presença de LPP')}${vdCheck('fralda','Uso de fralda')}${vdCheck('broncoaspiracao','Risco de broncoaspiração')}${vdCheck('cuidador-presente','Cuidador presente')}${vdCheck('cuidador-orientado','Cuidador orientado')}</div><div class="module-form-grid">${vdField('decubito','Frequência/observações da mudança de decúbito','textarea')}${vdField('transferencia','Senta, levanta e transferência','textarea')}${vdField('fraldas','Fralda/trocas/dermatite associada à incontinência','textarea')}${vdField('pele','Pele, lesões e risco de LPP','textarea')}</div>`,'acamado,idoso-fragil')}
    ${vdStep('Etapa 3 — Pós-alta hospitalar','transição do cuidado',`<div class="module-form-grid">${vdField('alta-data','Data da alta','date')}${vdField('alta-servico','Hospital/serviço de origem')}${vdField('alta-motivo','Motivo da internação','textarea')}${vdField('alta-orientacoes','Orientações recebidas na alta','textarea')}${vdField('alta-receita','Receita conferida','select',['Sim','Não','Não disponível'])}${vdField('alta-retornos','Exames/retornos agendados','textarea')}${vdField('alta-dispositivo','Curativo/dispositivo após alta','textarea')}${vdField('alta-alertas','Sinais de alerta presentes','textarea')}${vdField('alta-equipe','Necessidade de avaliação da equipe','textarea')}</div>`,'pos-alta')}
    ${vdStep('Etapa 3 — Curativo / LPP / ferida','avaliação estruturada da lesão',`<div class="module-form-grid">${vdField('ferida-local','Local da ferida')}${vdField('ferida-tipo','Tipo de ferida','select',['Lesão por pressão','Venosa','Arterial','Diabética','Traumática','Cirúrgica','Queimadura','Outra'])}${vdField('ferida-lpp-estagio','Se LPP, estágio','select',['Estágio 1','Estágio 2','Estágio 3','Estágio 4','Não classificável','Lesão tissular profunda','Não se aplica'])}${vdField('ferida-tamanho','Tamanho aproximado')}${vdField('ferida-bordas','Bordas')}${vdField('ferida-leito','Leito da ferida','textarea')}${vdField('ferida-exsudato','Exsudato','select',['Ausente','Pouco','Moderado','Intenso'])}${vdField('ferida-odor','Odor','select',['Ausente','Leve','Forte'])}${vdField('ferida-dor','Dor')}${vdField('ferida-pele','Pele ao redor','textarea')}${vdField('ferida-cobertura','Cobertura utilizada')}${vdField('ferida-frequencia','Frequência de troca')}${vdField('ferida-quem','Quem realiza o curativo')}${vdField('ferida-evolucao','Evolução em relação à última visita','select',['Melhorou','Piorou','Manteve','Primeira avaliação'])}${vdField('ferida-foto','Autorização para foto','select',['Não','Sim'])}${vdField('feridas','Resumo livre de feridas/LPP','textarea')}</div>`,'ferida,acamado')}
    ${vdStep('Etapa 3 — Sondas e dispositivos','cards por dispositivo marcado',`<div class="check-row">${VD_DISPOSITIVOS.map(x=>`<label class="soft-check"><input type="checkbox" class="vd-device" value="${escTR(x)}" onchange="atualizarDispositivosVD();classificarRiscoVD();validarVisitaDomiciliar()">${escTR(x)}</label>`).join('')}</div><div id="vd-device-details"></div><div id="vd-dispositivos-detalhes"></div>`,'dispositivo,ferida,acamado,pos-alta')}
    ${vdStep('Etapa 4 — Reconciliação medicamentosa','conferência de uso, horários e segurança',`<div class="brow"><button type="button" class="btn btn-s" onclick="adicionarMedicamentoVD()">Adicionar medicação</button><button type="button" class="btn btn-s" onclick="atualizarAlertasMedicamentosVD()">Conferir medicações</button></div><div class="vd-panel-table"><table class="vd-table"><thead><tr><th>Nome</th><th>Dose informada</th><th>Horário</th><th>Via</th><th>Quem administra</th><th>Tem em casa</th><th>Uso conforme receita</th><th>Receita conferida</th><th>Está acabando</th><th>Obs.</th><th></th></tr></thead><tbody id="vd-med-body"></tbody></table></div><div id="vd-med-alertas" class="alert alert-i" style="margin-top:8px">Adicione medicações para conferir riscos de uso e organização.</div>`)}
    ${vdStep('Etapa 5 — Alimentação e sondas','abre alerta se houver risco de broncoaspiração',`<div class="module-form-grid">${vdField('alimentacao-via','Via de alimentação','select',['Oral','SNE / SNG','Gastrostomia','Jejunostomia','Parenteral','Mista'])}${vdField('sonda-tipo','Tipo de sonda/dispositivo alimentar','select',['Não utiliza / não avaliado','SNE','SNG','Gastrostomia','Jejunostomia','Outra'])}${vdField('sonda-data','Data de instalação/troca','date')}${vdField('sonda-formula','Fórmula/dieta utilizada')}${vdField('sonda-volume','Volume por horário')}${vdField('sonda-horarios','Horários / frequência')}${vdField('sonda-agua','Água antes/depois / lavagem')}${vdField('sonda-metodo','Método','select',['Bolus','Gravitacional','Bomba','Outro','Não avaliado'])}${vdField('sonda-cabeceira','Posição durante administração','select',['Cabeceira elevada','Cabeceira inadequada','Não avaliado'])}${vdField('sonda-quem','Quem administra')}${vdField('sonda-prescricao','Prescrição nutricional conferida','select',['Sim','Não','Não disponível'])}${vdField('sonda-vomitos','Náuseas/vômitos','select',['Não','Sim'])}${vdField('sonda-distensao','Distensão abdominal','select',['Não','Sim'])}${vdField('sonda-diarreia','Diarreia','select',['Não','Sim'])}${vdField('sonda-constipacao','Constipação','select',['Não','Sim'])}${vdField('sonda-engasgo','Tosse/engasgo durante dieta','select',['Não','Sim'])}${vdField('sonda-obstrucao','Obstrução/intercorrência','select',['Não','Sim'])}${vdField('sonda-pele','Pele ao redor da GTT/JTT','textarea')}${vdField('sonda-dieta','Complemento livre sobre alimentação/sonda','textarea')}</div>`,'dispositivo,acamado,idoso-fragil')}
    ${vdStep('Etapa 6 — Cuidador e família','sobrecarga e rede de apoio',`<div class="module-form-grid">${vdField('cuidador-sozinho','Cuidador cuida sozinho','select',['Não','Sim','Parcial'])}${vdField('cuidador-medicacao','Sabe administrar medicações','select',['Sim','Não','Parcial'])}${vdField('cuidador-dispositivo','Sabe manejar sonda/dispositivo','select',['Sim','Não','Parcial','Não se aplica'])}${vdField('cuidador-higiene','Sabe realizar higiene e mudança de decúbito','select',['Sim','Não','Parcial'])}${vdField('cuidador-sobrecarga-sel','Demonstra cansaço/sobrecarga','select',['Não','Sim'])}${vdField('rede-apoio','Há rede de apoio','select',['Sim','Não','Parcial'])}${vdField('cuidador-avaliacao','Avaliação do cuidador: compreensão, sobrecarga, rede de apoio','textarea')}${vdField('cuidador-plano','Plano para cuidador/família','textarea')}</div><label class="soft-check"><input type="checkbox" id="vd-cuidador-sobrecarga" onchange="classificarRiscoVD();validarVisitaDomiciliar()"> Cuidador sobrecarregado</label>`,'cuidador,acamado,idoso-fragil,social')}
    ${vdStep('Etapa 7 — Ambiente domiciliar','risco ambiental e social separado do risco clínico',`<div class="module-form-grid">${vdField('condicao-moradia','Condição de moradia','select',['Própria','Alugada','Cedida','Situação instável','Outra'])}${vdField('saneamento','Saneamento básico','select',['Adequado','Inadequado','Ausente'])}${vdField('agua','Água tratada','select',['Sim','Não','Parcial'])}${vdField('energia','Energia elétrica','select',['Sim','Não'])}${vdField('acesso-domicilio','Acesso ao domicílio','select',['Adequado','Difícil','Muito difícil'])}${vdField('cama-adequada','Cama adequada','select',['Sim','Não','Parcial'])}${vdField('banheiro-acessivel','Banheiro acessível','select',['Sim','Não','Parcial'])}${vdField('riscos-queda-ambiente','Tapetes/fios/piso/escadas/iluminação','textarea')}${vdField('armazenamento','Armazenamento de medicações/dieta','textarea')}${vdField('acessibilidade','Acessibilidade do domicílio','textarea')}${vdField('escadas','Escadas/barreiras arquitetônicas','select',['Não','Sim'])}${vdField('risco-ambiental','Risco ambiental / higiene / ventilação / animais','textarea')}${vdField('beneficio-social','Benefício/contexto social','textarea')}${vdField('mora-sozinho','Mora sozinho','select',['Não','Sim'])}${vdField('moradores','Número de moradores','number')}</div>`,'social,acamado,idoso-fragil,busca-ativa')}
    ${vdStep('Etapa 8 — Insumos','faltas essenciais viram pendência',`${vdInsumosTable()}<div class="module-form-grid" style="margin-top:10px"><div class="f"><label for="vd-insumos-suficientes">Suficiência geral de insumos</label><select id="vd-insumos-suficientes" onchange="classificarRiscoVD();validarVisitaDomiciliar()"><option value="">Não avaliado</option><option>Suficientes</option><option>Parcial</option><option>Insuficientes</option></select></div><div class="f span2"><label for="vd-insumos-obs">Solicitações/observações de insumos</label><textarea id="vd-insumos-obs" oninput="validarVisitaDomiciliar()"></textarea></div></div>`)}
    ${vdStep('Escalas condicionais','aplique só quando fizer sentido',`${escalasVDHtml(p)}<div class="alert alert-i"><strong>Uso sugerido:</strong> acamado/restrito ao leito → Braden + Katz/Barthel; risco de queda → Morse; baixa ingesta/perda de peso → MNA; cuidador sobrecarregado → checklist familiar.</div>`)}
    ${vdStep('Risco, pendências e plano','revise antes de salvar ou gerar PDF',`<div class="vd-risk-grid" id="vd-risco-dimensoes"></div><div id="vd-risco-painel" class="priority-panel rotina" style="margin-top:10px"><strong>Risco não calculado</strong><small>Preencha a avaliação.</small></div><div class="module-form-grid" style="margin-top:10px"><div class="f"><label for="vd-risco-manual">Risco revisado pelo profissional</label><select id="vd-risco-manual" onchange="classificarRiscoVD();validarVisitaDomiciliar()"><option value="">Usar risco automático</option><option>Baixo</option><option>Moderado</option><option>Alto</option></select></div><div class="f span2"><label for="vd-risco-justificativa">Justificativa se ajustar o risco</label><textarea id="vd-risco-justificativa"></textarea></div><div class="f"><label for="vd-soap-modelo">Modelo SOAP</label><select id="vd-soap-modelo"><option>SOAP completo</option><option>SOAP resumido PEC/e-SUS</option></select></div>${vdField('conduta','Condutas de enfermagem realizadas / pactuadas','textarea')}${vdField('orientacoes','Orientações realizadas','textarea')}${vdField('retorno','Retorno / próxima visita','text')}${vdField('sinais-alerta-orientados','Sinais de alerta orientados','textarea')}</div><div id="vd-pendencias-painel" style="margin-top:10px"></div><div class="pre-save-review"><input type="checkbox" id="vd-revisao-final"><div><span>Declaro que revisei as informações e validei a conduta registrada.</span><small>Permite salvar com pendências leves; pendências críticas exigem conduta/justificativa registrada.</small></div></div>`)}
    ${vdStep('Painel de acompanhamento de acamados','resumo local a partir do histórico salvo',`<div class="brow"><button type="button" class="btn btn-s" onclick="atualizarPainelAcamadosVD()">Atualizar painel</button><button type="button" class="btn btn-s" onclick="filtrarPainelVD('alto')">Alto risco</button><button type="button" class="btn btn-s" onclick="filtrarPainelVD('acamado')">Acamados</button><button type="button" class="btn btn-s" onclick="filtrarPainelVD('lpp')">Com LPP</button><button type="button" class="btn btn-s" onclick="filtrarPainelVD('insumo')">Falta de insumos</button></div><div id="vd-painel-acamados" class="vd-panel-table"><table><tbody><tr><td>Nenhum dado carregado ainda.</td></tr></tbody></table></div>`)}
  </div>`}
if(typeof MODULOS_CLINICOS!=='undefined'&&MODULOS_CLINICOS.vd)MODULOS_CLINICOS.vd.extraHtml=visitaDomiciliarExtraHtml;
function atualizarTipoVisitaVD(){
  const tipo=val('vd-tipo-visita')||'rotina';
  document.querySelectorAll('[name="vd-tipo-visita-radio"]').forEach(r=>{r.checked=r.value===tipo});
  document.querySelectorAll('.vd-conditional[data-vd-show]').forEach(el=>{const lista=String(el.dataset.vdShow||'').split(',');el.hidden=!(lista.includes(tipo)||tipo==='primeira'||tipo==='rotina')});
  if(tipo==='acamado'){const a=document.getElementById('vd-acamado');if(a&&!a.value)a.value='Sim'}
  if(tipo==='ferida'){const f=document.getElementById('vd-ferida-tipo');if(f&&!f.value)f.value='Lesão por pressão'}
  validarVisitaDomiciliar();classificarRiscoVD();
}
function adicionarMedicamentoVD(dados={}){
  const body=document.getElementById('vd-med-body');if(!body)return;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input class="vd-med-nome" value="${escTR(dados.nome||'')}" oninput="atualizarAlertasMedicamentosVD()"></td><td><input class="vd-med-dose" value="${escTR(dados.dose||'')}" placeholder="Como está prescrito/embalagem"></td><td><input class="vd-med-horarios" value="${escTR(dados.horarios||'')}" oninput="atualizarAlertasMedicamentosVD()"></td><td><select class="vd-med-via"><option>VO</option><option>SC</option><option>IM</option><option>EV</option><option>Tópica</option><option>Inalatória</option><option>Sonda</option><option>Outra</option></select></td><td><input class="vd-med-admin" value="${escTR(dados.admin||'')}"></td><td><select class="vd-med-tem" onchange="atualizarAlertasMedicamentosVD()"><option>Sim</option><option>Não</option><option>Parcial</option></select></td><td><select class="vd-med-uso" onchange="atualizarAlertasMedicamentosVD()"><option>Sim</option><option>Não</option><option>Não sabe</option></select></td><td><select class="vd-med-receita" onchange="atualizarAlertasMedicamentosVD()"><option>Sim</option><option>Não</option><option>Não conferida</option></select></td><td><select class="vd-med-acabando" onchange="atualizarAlertasMedicamentosVD()"><option>Não</option><option>Sim</option></select></td><td><input class="vd-med-obs"></td><td><button class="btn btn-s" type="button" onclick="this.closest('tr').remove();atualizarAlertasMedicamentosVD();validarVisitaDomiciliar()">Remover</button></td>`;
  body.appendChild(tr);atualizarAlertasMedicamentosVD();validarVisitaDomiciliar();
}
function coletarMedicamentosVD(){
  return Array.from(document.querySelectorAll('#vd-med-body tr')).map(r=>({nome:r.querySelector('.vd-med-nome')?.value.trim()||'',dose:r.querySelector('.vd-med-dose')?.value.trim()||'',via:r.querySelector('.vd-med-via')?.value||'',horarios:r.querySelector('.vd-med-horarios')?.value.trim()||'',admin:r.querySelector('.vd-med-admin')?.value.trim()||'',tem:r.querySelector('.vd-med-tem')?.value||'',uso:r.querySelector('.vd-med-uso')?.value||'',receita:r.querySelector('.vd-med-receita')?.value||'',acabando:r.querySelector('.vd-med-acabando')?.value||'',obs:r.querySelector('.vd-med-obs')?.value.trim()||''})).filter(x=>x.nome||x.dose||x.horarios);
}
function coletarInsumosVD(){
  const porTabela=Array.from(document.querySelectorAll('.vd-table tr[data-insumo]')).map(r=>({item:r.dataset.insumo,tem:r.querySelector('.vd-insumo-tem')?.value||'',suf:r.querySelector('.vd-insumo-suf')?.value||'',forn:r.querySelector('.vd-insumo-forn')?.value||'',sol:r.querySelector('.vd-insumo-solicitar')?.value||'',obs:r.querySelector('.vd-insumo-obs')?.value||''}));
  return porTabela.length?porTabela:coletarMarcadosVD('.vd-insumo').map(item=>({item,tem:'Sim',suf:'Sim',sol:'Não'}));
}
function alertasMedicamentosVD(meds=coletarMedicamentosVD()){
  const alertas=[],risco=/insulina|varfarina|rivaroxabana|apixabana|dabigatrana|heparina|clonazepam|diazepam|alprazolam|morfina|tramadol|codeina|furosemida|hidroclorotiazida|losartana|enalapril|captopril|metformina|glibenclamida|antibi[oó]tico|amoxicilina|azitromicina|sertralina|fluoxetina|amitriptilina|haloperidol|risperidona/i;
  meds.forEach(m=>{const txt=[m.nome,m.dose,m.horarios,m.obs].join(' ');if(risco.test(txt))alertas.push(`Atenção: ${m.nome||'medicação'} é medicação de maior risco. Conferir uso, horário, armazenamento e necessidade de comunicação à equipe conforme fluxo local.`);if(m.tem==='Não'||m.acabando==='Sim')alertas.push(`${m.nome||'Medicação'}: falta/estoque acabando no domicílio.`);if(m.uso==='Não'||m.receita==='Não'||m.receita==='Não conferida')alertas.push(`${m.nome||'Medicação'}: uso/receita precisa de conferência.`)});
  return alertas;
}
function atualizarAlertasMedicamentosVD(){
  const alertas=alertasMedicamentosVD();
  const el=document.getElementById('vd-med-alertas');if(el)el.className=alertas.length?'alert alert-w':'alert alert-i',el.innerHTML=alertas.length?`<strong>Alertas de medicação:</strong><br>${alertas.map(escTR).join('<br>')}`:'Medicações sem alerta automático nos campos preenchidos.';
  return alertas;
}
function camposDispositivoVD(nome,i){
  const base=[['funcionamento','Funcionando adequadamente','select',['Sim','Não','Parcial','Não avaliado']],['intercorrencia','Intercorrência','textarea'],['ultima','Data da última troca','date'],['proxima','Próxima troca prevista','date'],['cuidador','Quem realiza cuidado/troca','text'],['insumos','Insumos necessários','textarea'],['orientacoes','Orientações feitas','textarea'],['equipe','Necessidade de avaliação da equipe','textarea']];
  const extra=/traqueostomia/i.test(nome)?[['secrecao','Secreção/aspiração/cânula','textarea'],['fixacao','Fixação e pele ao redor','textarea']]:/oxigen/i.test(nome)?[['fluxo','Fluxo/equipamento/umidificação','textarea'],['saturacao','Saturação e sintomas','textarea']]:/ostomia/i.test(nome)?[['pele','Pele periestoma e bolsa','textarea']]:[];
  return`<div class="vd-device-card" data-device="${escTR(nome)}"><h4>${escTR(nome)}</h4><div class="module-form-grid">${[...base,...extra].map(c=>campoDispVD(i,...c)).join('')}</div></div>`;
}
function atualizarDispositivosVD(){
  const area=document.getElementById('vd-device-details')||document.getElementById('vd-dispositivos-detalhes');if(!area)return;
  const marcados=coletarMarcadosVD('.vd-device');area.innerHTML=marcados.length?`<div class="module-form-grid">${marcados.map((x,i)=>camposDispositivoVD(x,i)).join('')}</div>`:'';
  classificarRiscoVD();validarVisitaDomiciliar();
}
function resumoSondaVD(){
  const tipo=val('vd-sonda-tipo');if(!tipo||/não utiliza|nao utiliza/i.test(tipo))return'';
  return[`Alimentação/sonda: ${tipo}`,val('vd-sonda-data')?`instalação/troca ${val('vd-sonda-data')}`:'',val('vd-sonda-formula')?`fórmula ${val('vd-sonda-formula')}`:'',val('vd-sonda-volume')?`volume ${val('vd-sonda-volume')}`:'',val('vd-sonda-horarios')?`horários/frequência ${val('vd-sonda-horarios')}`:'',val('vd-sonda-agua')?`água/lavagem ${val('vd-sonda-agua')}`:'',val('vd-sonda-metodo')?`método ${val('vd-sonda-metodo')}`:'',val('vd-sonda-cabeceira')?`posição ${val('vd-sonda-cabeceira')}`:'',val('vd-sonda-quem')?`administra: ${val('vd-sonda-quem')}`:'',val('vd-sonda-prescricao')?`prescrição nutricional: ${val('vd-sonda-prescricao')}`:'',val('vd-sonda-pele')?`pele/fixação: ${val('vd-sonda-pele')}`:'',val('vd-sonda-dieta')].filter(Boolean).join('; ')+'.';
}
function dimensoesRiscoVD(){
  const esc=calcularEscalasVD(),texto=[val('vd-estado-geral'),val('vd-consciencia'),val('vd-alerts'),val('vd-respiratorio'),val('vd-ferida-odor'),val('vd-ferida-exsudato'),val('vd-feridas'),resumoSondaVD()].join(' '),dim={clinico:[],funcional:[],social:[],ambiental:[]};
  if(/MEG|rebaixado|confuso|dispneia|saturação baixa|saturacao baixa|necrose|purulento|odor forte|sangramento|hipoglicemia|dor intensa/i.test(texto))dim.clinico.push('sinal clínico de alerta ou gravidade');
  if(['vd-sonda-engasgo','vd-sonda-obstrucao','vd-sonda-vomitos','vd-sonda-distensao'].some(id=>val(id)==='Sim')||/cabeceira inadequada|não/i.test(val('vd-sonda-cabeceira')))dim.clinico.push('risco/intercorrência de alimentação por sonda');
  if(/sim|restrito|acamado|cadeirante|dependência total/i.test([val('vd-acamado'),val('vd-restrito-domicilio'),val('vd-mobilidade'),val('vd-adl')].join(' ')))dim.funcional.push('restrição de mobilidade/dependência');
  if(document.getElementById('vd-lpp-presente')?.checked||val('vd-ferida-tipo')||val('vd-feridas'))dim.funcional.push('ferida/LPP ou risco de lesão por pressão');
  esc.riscos.forEach(r=>/queda|braden|barthel|katz|depend/i.test(r)?dim.funcional.push(r):/nutric/i.test(r)?dim.clinico.push(r):dim.funcional.push(r));
  if(document.getElementById('vd-cuidador-sobrecarga')?.checked||val('vd-cuidador-sobrecarga-sel')==='Sim'||val('vd-rede-apoio')==='Não'||val('vd-cuidador-sozinho')==='Sim')dim.social.push('cuidador/rede de apoio insuficiente ou sobrecarregado');
  if(/situação instável|inadequado|ausente|não|difícil|escadas|barreira|tapete|fio|piso/i.test([val('vd-condicao-moradia'),val('vd-saneamento'),val('vd-agua'),val('vd-energia'),val('vd-acesso-domicilio'),val('vd-riscos-queda-ambiente'),val('vd-risco-ambiental'),val('vd-escadas')].join(' ')))dim.ambiental.push('risco ambiental/social no domicílio');
  const ins=coletarInsumosVD();if(/insuficientes/i.test(val('vd-insumos-suficientes'))||ins.some(i=>i.tem==='Não'||i.suf==='Não'||i.sol==='Sim'))dim.ambiental.push('falta/insuficiência de insumos');
  if(alertasMedicamentosVD().length)dim.clinico.push('medicações exigem conferência de segurança');
  return dim;
}
function grauDimensaoVD(lista){if(!lista.length)return document.getElementById('vd-avaliacao-confirmada')?.checked?'Baixo':'Não avaliado';return lista.some(x=>/gravidade|rebaixado|necrose|purulento|broncoaspiração|intercorrência|dependência total|insuficiência|falta|sobrecarregado|alto|muito alto/i.test(x))?'Alto':'Moderado'}
function classificarRiscoVD(){
  const dim=dimensoesRiscoVD(),graus=Object.fromEntries(Object.entries(dim).map(([k,v])=>[k,grauDimensaoVD(v)])),auto=Object.values(graus).includes('Alto')?'Alto':Object.values(graus).includes('Moderado')?'Moderado':Object.values(graus).includes('Não avaliado')?'Não avaliado':'Baixo',final=val('vd-risco-manual')||auto,motivos=[...new Set(Object.values(dim).flat())],grid=document.getElementById('vd-risco-dimensoes');
  if(grid){const nomes={clinico:'Risco clínico',funcional:'Risco funcional',social:'Risco social/familiar',ambiental:'Risco ambiental/insumos'};grid.innerHTML=Object.entries(graus).map(([k,g])=>`<div class="vd-risk-card ${g==='Alto'?'alto':g==='Moderado'?'moderado':''}"><strong>${nomes[k]}: ${g}</strong><small>${dim[k].length?dim[k].map(escTR).join('\n'):'Sem fator automático nos campos preenchidos.'}</small></div>`).join('')}
  const p=document.getElementById('vd-risco-painel');if(p){p.className='priority-panel '+(final==='Alto'?'alta':final==='Moderado'?'media':'rotina');p.innerHTML=`<strong>Risco final da visita: ${final}</strong><small>${motivos.length?`Motivos: ${motivos.join('; ')}.`:'Sem fator automático de risco nos campos preenchidos.'}${final==='Alto'?'\nPaciente classificado como alto risco. Registrar ação tomada e avaliar necessidade de comunicação à equipe conforme fluxo local.':''}</small>`}
  return{risco:final,auto,dimensoes:dim,graus,motivos};
}
function validarVisitaDomiciliar(){
  const risco=classificarRiscoVD(),crit=[],leve=[],tipo=val('vd-tipo-visita')||'rotina',temPlano=!!(val('vd-conduta')||val('vd-orientacoes')||val('vd-cuidador-plano')||val('vd-insumos-obs'));
  if((/acamado|idoso-fragil/.test(tipo)||val('vd-acamado')==='Sim')&&!(val('vd-pa')||val('vd-fc')||val('vd-fr')||val('vd-sat')||val('vd-temp')))crit.push('Acamado/restrito ao leito sem sinais vitais registrados.');
  if((/acamado|idoso-fragil/.test(tipo)||val('vd-acamado')==='Sim')&&!val('vd-pele')&&!document.getElementById('vd-pele-avaliada')?.checked)crit.push('Acamado sem avaliação de pele/LPP registrada.');
  if((/dispositivo/.test(tipo)||val('vd-sonda-tipo'))&&val('vd-sonda-tipo')&&!val('vd-sonda-formula')&&!val('vd-sonda-volume')&&!val('vd-sonda-horarios'))crit.push('Sonda/dispositivo alimentar sem registro mínimo de dieta/volume/horários.');
  if(coletarMedicamentosVD().length&&!coletarMedicamentosVD().some(m=>m.horarios||m.uso||m.receita))leve.push('Medicações registradas sem horário/forma de uso conferida.');
  if(risco.risco==='Alto'&&!temPlano)crit.push('Risco alto sem plano/conduta/orientação registrada.');
  if((document.getElementById('vd-cuidador-sobrecarga')?.checked||val('vd-cuidador-sobrecarga-sel')==='Sim')&&!val('vd-cuidador-plano')&&!val('vd-orientacoes')&&!val('vd-conduta'))crit.push('Cuidador sobrecarregado sem orientação/plano registrado.');
  if((/insuficientes/i.test(val('vd-insumos-suficientes'))||coletarInsumosVD().some(i=>i.tem==='Não'||i.suf==='Não'||i.sol==='Sim'))&&!val('vd-insumos-obs')&&!val('vd-conduta'))crit.push('Falta de insumo essencial sem conduta/registro de solicitação.');
  if(!val('vd-retorno'))leve.push('Retorno/próxima visita não definido.');
  const out=document.getElementById('vd-pendencias-painel');if(out){const itens=[...crit.map(x=>['critica',x]),...leve.map(x=>['leve',x])];out.innerHTML=itens.length?`<div class="vd-pending-list">${itens.map(([c,t])=>`<div class="vd-pending-item ${c}"><strong>${c==='critica'?'Pendência crítica':'Pendência leve'}:</strong> ${escTR(t)}</div>`).join('')}</div>`:'<div class="alert alert-ok">Sem pendência automática crítica nos campos preenchidos.</div>'}
  return{criticas:crit,leves:leve};
}
function resumoInsumosVD(){
  const ins=coletarInsumosVD().filter(i=>i.tem==='Não'||i.suf==='Não'||i.sol==='Sim'||i.obs);return ins.map(i=>`${i.item}: tem em casa ${i.tem||'não informado'}, suficiente ${i.suf||'não informado'}${i.sol==='Sim'?', precisa solicitar':''}${i.forn?`, fornecedor: ${i.forn}`:''}${i.obs?`, obs.: ${i.obs}`:''}`).join('; ');
}
function problemasPrioritariosVD(risco){
  const out=[];if(/sim|restrito|acamado/i.test([val('vd-acamado'),val('vd-mobilidade')].join(' ')))out.push('Paciente acamado/restrito ao leito ou com dependência funcional relevante.');if(document.getElementById('vd-lpp-presente')?.checked||val('vd-ferida-tipo')||val('vd-feridas'))out.push('Risco ou presença de lesão por pressão/ferida.');if(atualizarAlertasMedicamentosVD().length)out.push('Medicações exigem conferência de segurança e organização no domicílio.');if(risco.dimensoes.social.length)out.push('Cuidador/rede familiar com ponto de atenção.');if(risco.dimensoes.ambiental.length)out.push('Risco ambiental ou falta de insumos no domicílio.');return out;
}
function gerarSoapVisitaDomiciliar(){
  const risco=classificarRiscoVD(),pend=validarVisitaDomiciliar(),escalas=calcularEscalasVD(),meds=coletarMedicamentosVD(),dispDetalhe=resumoDispositivosVD(),insResumo=resumoInsumosVD(),sonda=resumoSondaVD(),guia=coletarGuiaClinico('vd'),vitais=[['PA',val('vd-pa')],['FC',val('vd-fc')],['FR',val('vd-fr')],['SpO2',val('vd-sat')],['T',val('vd-temp')],['Glicemia capilar',val('vd-glicemia')],['Dor',val('vd-dor-escala')],['IMC',val('vd-imc')]].filter(x=>x[1]).map(x=>`${x[0]}: ${x[1]}`).join(' | '),nome=val('vd-nome'),idade=idadePorNascimento(val('vd-nasc')),resumido=val('vd-soap-modelo')==='SOAP resumido PEC/e-SUS',tipo=(VD_TIPOS_VISITA.find(x=>x[0]===val('vd-tipo-visita'))||[])[1]||'Rotina/acompanhamento',problemas=problemasPrioritariosVD(risco);
  const desc=`DESCRIÇÃO DA CONSULTA\nVisita domiciliar de enfermagem${nome?` a ${nome}`:''}${idade?`, ${idade}`:''}. Tipo: ${tipo}.`;
  const s=[`${desc}`,`S:`,val('vd-motivo')?`Motivo/objetivo: ${val('vd-motivo')}.`:'',val('vd-objetivo-visita')?`Objetivo da visita: ${val('vd-objetivo-visita')}.`:'',val('vd-queixa')?`Demanda referida: ${val('vd-queixa')}.`:'',!resumido&&val('vd-historia')?val('vd-historia'):'',val('vd-cuidador')?`Cuidador principal: ${val('vd-cuidador')}${val('vd-parentesco-cuidador')?` (${val('vd-parentesco-cuidador')})`:''}.`:'',val('vd-cuidador-avaliacao')?`Cuidador/família: ${val('vd-cuidador-avaliacao')}.`:'' ].filter(Boolean).join('\n');
  const o=[`O:`,vitais,val('vd-estado-geral')?`Estado geral: ${val('vd-estado-geral')}.`:'',val('vd-consciencia')?`Consciência/comunicação: ${[val('vd-consciencia'),val('vd-comunicacao')].filter(Boolean).join('; ')}.`:'',`Mobilidade/dependência: ${[val('vd-acamado'),val('vd-restrito-domicilio'),val('vd-mobilidade'),val('vd-adl')].filter(Boolean).join('; ')}.`,val('vd-pele')?`Pele/LPP: ${val('vd-pele')}.`:'',val('vd-ferida-local')||val('vd-ferida-tipo')?`Ferida/LPP: ${[val('vd-ferida-local'),val('vd-ferida-tipo'),val('vd-ferida-lpp-estagio'),val('vd-ferida-tamanho'),val('vd-ferida-leito'),val('vd-ferida-exsudato'),val('vd-ferida-odor'),val('vd-ferida-cobertura')].filter(Boolean).join('; ')}.`:'',val('vd-feridas')?`Feridas/curativos: ${val('vd-feridas')}.`:'',sonda,meds.length?`Medicações conferidas: ${meds.map(m=>`${m.nome}${m.dose?` (${m.dose})`:''}${m.horarios?`, horários: ${m.horarios}`:''}${m.admin?`, administra: ${m.admin}`:''}${m.tem?`, tem em casa: ${m.tem}`:''}${m.uso?`, usa conforme receita: ${m.uso}`:''}`).join('; ')}.`:'',dispDetalhe.length?`Dispositivos avaliados:\n${dispDetalhe.join('\n')}`:'',insResumo?`Insumos: ${insResumo}.`:'',!resumido&&val('vd-risco-ambiental')?`Ambiente domiciliar: ${[val('vd-condicao-moradia'),val('vd-saneamento'),val('vd-agua'),val('vd-energia'),val('vd-acessibilidade'),val('vd-risco-ambiental')].filter(Boolean).join('; ')}.`:'',escalas.linhas.length?`Escalas aplicadas:\n${escalas.linhas.join('\n')}`:'',guia.resumo?`Achados guiados: ${guia.resumo}`:''].filter(Boolean).join('\n');
  const a=[`A:`,problemas.length?`Problemas prioritários da visita:\n${problemas.map((p,i)=>`${i+1}. ${p}`).join('\n')}`:'',`Risco clínico: ${risco.graus.clinico}. Risco funcional: ${risco.graus.funcional}. Risco social/familiar: ${risco.graus.social}. Risco ambiental/insumos: ${risco.graus.ambiental}.`, `Risco final: ${risco.risco}.`,risco.motivos.length&&!resumido?`Critérios: ${risco.motivos.join('; ')}.`:'',pend.criticas.length?`Pendências críticas para revisar: ${pend.criticas.join('; ')}.`:'',val('vd-alerts')?`Alertas selecionados: ${val('vd-alerts')}.`:'',guia.alertas?`Pontos de atenção do exame/anamnese: ${guia.alertas}.`:''].filter(Boolean).join('\n');
  const ptxt=[`P:`,val('vd-conduta')?`Condutas de enfermagem realizadas/pactuadas: ${val('vd-conduta')}.`:'',val('vd-orientacoes')?`Orientações ao paciente/cuidador: ${val('vd-orientacoes')}.`:'',val('vd-cuidador-plano')?`Plano com cuidador/família: ${val('vd-cuidador-plano')}.`:'',val('vd-insumos-obs')?`Insumos/solicitações: ${val('vd-insumos-obs')}.`:'',risco.risco==='Alto'?'Paciente classificado como alto risco; registrar ação tomada e avaliar necessidade de comunicação à equipe conforme fluxo local.':'',val('vd-sinais-alerta-orientados')?`Sinais de alerta orientados: ${val('vd-sinais-alerta-orientados')}.`:'',val('vd-retorno')?`Próxima visita/retorno: ${val('vd-retorno')}.`:'',`Base protocolar: ${SOAP_BASE_PROTOCOLAR.vd}`].filter(Boolean).join('\n');
  document.getElementById('vd-s').value=limparTextoSoap(s);document.getElementById('vd-o').value=limparTextoSoap(o);document.getElementById('vd-a').value=limparTextoSoap(a);document.getElementById('vd-p').value=limparTextoSoap(ptxt);
  const op=document.getElementById('vd-orientacao-paciente');if(op)op.value=[val('vd-orientacoes'),val('vd-sinais-alerta-orientados'),val('vd-retorno')?`Retorno/próxima visita: ${val('vd-retorno')}.`:'' ].filter(Boolean).join('\n');
  showToast(resumido?'SOAP resumido da visita gerado.':'SOAP completo da visita gerado. Revise antes de salvar.');
}
function relatorioTextoVisitaDomiciliar(){
  if(!val('vd-s')&&!val('vd-o')&&!val('vd-a')&&!val('vd-p'))gerarSoapVisitaDomiciliar();
  const risco=classificarRiscoVD(),sec=(t,linhas)=>{const l=linhas.filter(Boolean);return l.length?[``,t,...l]:[]};
  return [`RELATÓRIO DE VISITA DOMICILIAR`,new Date().toLocaleString('pt-BR'),...sec('1. Identificação do paciente',[`Paciente: ${val('vd-nome')||''}`,`CPF/CNS: ${val('vd-cpf')||''} / ${val('vd-cns')||''}`,`Endereço: ${[val('vd-logradouro'),val('vd-numero'),val('vd-bairro'),val('vd-municipio'),val('vd-uf')].filter(Boolean).join(', ')}`]),...sec('2. Dados da visita',[`Tipo de visita: ${(VD_TIPOS_VISITA.find(x=>x[0]===val('vd-tipo-visita'))||[])[1]||'Rotina/acompanhamento'}`,`Profissional: ${val('vd-profissional')||''}`,`ACS/microárea: ${val('vd-acs')||val('vd-microarea')||''}`,`Cuidador: ${val('vd-cuidador')||''} ${val('vd-telefone-cuidador')||''}`]),...sec('3. Avaliação clínica resumida',[val('vd-queixa'),val('vd-historia'),val('vd-vitais-obs')]),...sec('4. Feridas/LPP',[val('vd-ferida-local')||val('vd-feridas')?[val('vd-ferida-local'),val('vd-ferida-tipo'),val('vd-ferida-lpp-estagio'),val('vd-ferida-tamanho'),val('vd-ferida-exsudato'),val('vd-ferida-odor'),val('vd-feridas')].filter(Boolean).join('; '):'']),...sec('5. Sondas/dispositivos',[resumoSondaVD(),...resumoDispositivosVD()]),...sec('6. Medicações',[coletarMedicamentosVD().map(m=>`${m.nome} ${m.dose||''} ${m.horarios?`— ${m.horarios}`:''} ${m.uso?`— uso conforme receita: ${m.uso}`:''}`).join('\n')]),...sec('7. Alimentação / cuidador / ambiente / insumos',[val('vd-dieta'),val('vd-cuidador-avaliacao'),val('vd-risco-ambiental'),resumoInsumosVD()]),...sec('8. Escalas',[val('vd-escalas-resumo')]),...sec('9. Risco',[`Clínico: ${risco.graus.clinico}; Funcional: ${risco.graus.funcional}; Social/familiar: ${risco.graus.social}; Ambiental/insumos: ${risco.graus.ambiental}.`,`Risco final: ${risco.risco}.`]),...sec('10. SOAP',[textoSoapAtual(false)]),'','Aviso: documento de apoio ao registro profissional. Revisar, validar clinicamente e seguir protocolos/fluxos locais antes de uso assistencial.'].join('\n');
}
function dadosPainelVD(){
  return carregarAtendimentos().filter(a=>/visita domiciliar/i.test(a.tipo||'')||a.dados?.['vd-tipo-visita']).map(a=>{const d=a.dados||{},txt=JSON.stringify(d).toLowerCase();return{nome:a.nome||d['vd-nome']||'Paciente',idade:d['vd-nasc']?idadePorNascimento(d['vd-nasc']):'',micro:d['vd-microarea']||d['vd-acs']||'',acs:d['vd-acs']||'',data:a.data||d['vd-data-hora']||'',prox:d['vd-retorno']||'',risco:d['vd-risco-manual']||d['vd-risco']||(/alto/.test(txt)?'Alto':''),acamado:/acamado|restrito ao leito/.test(txt),lpp:/lpp|lesão por pressão|lesao por pressao/.test(txt),sonda:/sonda|gastrostomia|traqueostomia|ostomia|dispositivo/.test(txt),insumo:/insuficiente|falta de insumo|precisa solicitar/.test(txt),cuidador:/sobrecarga|cuidador exausto/.test(txt),acao:d['vd-retorno']||d['vd-conduta']||''}})}
function atualizarPainelAcamadosVD(filtro=''){
  const el=document.getElementById('vd-painel-acamados');if(!el)return;let dados=dadosPainelVD();if(filtro==='alto')dados=dados.filter(x=>/alto/i.test(x.risco));if(filtro==='acamado')dados=dados.filter(x=>x.acamado);if(filtro==='lpp')dados=dados.filter(x=>x.lpp);if(filtro==='insumo')dados=dados.filter(x=>x.insumo);
  el.innerHTML=dados.length?`<table><thead><tr><th>Paciente</th><th>Micro/ACS</th><th>Última VD</th><th>Próxima</th><th>Risco</th><th>Achados</th><th>Ação pendente</th></tr></thead><tbody>${dados.map(x=>`<tr><td>${escTR(x.nome)}${x.idade?`<br><small>${escTR(x.idade)}</small>`:''}</td><td>${escTR([x.micro,x.acs].filter(Boolean).join(' / '))}</td><td>${x.data?new Date(x.data).toLocaleDateString('pt-BR'):''}</td><td>${escTR(x.prox||'')}</td><td>${escTR(x.risco||'')}</td><td>${[x.acamado?'Acamado':'',x.lpp?'LPP/ferida':'',x.sonda?'Sonda/dispositivo':'',x.insumo?'Falta de insumos':'',x.cuidador?'Cuidador sobrecarregado':''].filter(Boolean).map(escTR).join('<br>')}</td><td>${escTR(x.acao||'')}</td></tr>`).join('')}</tbody></table>`:'<table><tbody><tr><td>Nenhuma visita domiciliar encontrada no histórico local para este filtro.</td></tr></tbody></table>';
}
function filtrarPainelVD(f){atualizarPainelAcamadosVD(f)}
function atualizarSoftChecks(root=document){root.querySelectorAll?.('label.soft-check').forEach(label=>{const input=label.querySelector('input[type="checkbox"]');if(input)label.classList.toggle('selected',!!input.checked)})}
document.addEventListener('change',e=>{const label=e.target?.closest?.('label.soft-check');if(label&&e.target.matches?.('input[type="checkbox"]'))label.classList.toggle('selected',e.target.checked);if(e.target?.id?.startsWith('vd-')||e.target?.classList?.contains('vd-device'))setTimeout(()=>{classificarRiscoVD();validarVisitaDomiciliar();atualizarSoftChecks(document.getElementById('pg-visita-domiciliar')||document)},0)});
document.addEventListener('input',e=>{if(e.target?.id?.startsWith('vd-')||String(e.target?.className||'').includes('vd-'))clearTimeout(window._vdTimer),window._vdTimer=setTimeout(()=>{classificarRiscoVD();validarVisitaDomiciliar();atualizarSoftChecks(document.getElementById('pg-visita-domiciliar')||document)},180)});
function testesRapidosISTHtml(){return`<div class="card"><div class="ct"><span class="dot dr"></span>Testes rápidos e laudos padronizados</div><div class="alert alert-i"><strong>Modelo completo:</strong> gestante utiliza DUO HIV/Sífilis como TR1; não gestante utiliza testes separados. Registre TR2, marca/lote, coleta, executor e parceiro(a) quando presente.</div><div class="g3"><div class="f"><label for="ist-tr-condicao">Condição da pessoa principal</label><select id="ist-tr-condicao" onchange="atualizarTestesRapidosIST()"><option value="naogestante">Não gestante — testes separados</option><option value="gestante">Gestante — HIV/Sífilis DUO</option></select></div><div class="f"><label for="ist-tr-parceiro-presente">Parceiro(a) presente?</label><select id="ist-tr-parceiro-presente" onchange="atualizarTestesRapidosIST()"><option value="nao">Não</option><option value="sim">Sim — gerar laudo separado</option></select></div><div class="f"><label for="ist-tr-municipio">Município</label><input id="ist-tr-municipio" value="Toledo"></div></div><div class="tr-person"><div class="tr-person-head">Pessoa principal — dados puxados da identificação</div><div class="tr-person-body"><div class="g4"><div class="f"><label for="ist-tr-p-nome">Nome</label><input id="ist-tr-p-nome" class="ro" readonly></div><div class="f"><label for="ist-tr-p-pront">Prontuário</label><input id="ist-tr-p-pront"></div><div class="f"><label for="ist-tr-p-nasc">Data de nascimento</label><input id="ist-tr-p-nasc" class="ro" readonly></div><div class="f"><label for="ist-tr-p-sexo">Sexo</label><select id="ist-tr-p-sexo"><option>Feminino</option><option>Masculino</option></select></div></div><div id="ist-tr-p-testes"></div><div class="g3" style="margin-top:10px"><div class="f"><label>Data da coleta</label><input type="date" id="ist-tr-p-data"></div><div class="f"><label>Horário da leitura</label><input type="time" id="ist-tr-p-hora"></div><div class="f"><label for="ist-tr-p-executor">Executor / COREN</label><input id="ist-tr-p-executor"></div></div><div class="brow"><button class="btn btn-p" type="button" onclick="gerarLaudoISTStandalone('p')">Gerar laudo da pessoa principal</button></div></div></div><div class="tr-person" id="ist-tr-parceiro-box" style="display:none"><div class="tr-person-head">Parceiro(a) — laudo individual</div><div class="tr-person-body"><div class="g4"><div class="f"><label for="ist-tr-c-nome">Nome completo</label><input id="ist-tr-c-nome"></div><div class="f"><label for="ist-tr-c-pront">Prontuário</label><input id="ist-tr-c-pront"></div><div class="f"><label>Data de nascimento</label><input type="date" id="ist-tr-c-nasc"></div><div class="f"><label for="ist-tr-c-sexo">Sexo</label><select id="ist-tr-c-sexo"><option>Masculino</option><option>Feminino</option></select></div></div><div id="ist-tr-c-testes"></div><div class="g3" style="margin-top:10px"><div class="f"><label>Data da coleta</label><input type="date" id="ist-tr-c-data"></div><div class="f"><label>Horário da leitura</label><input type="time" id="ist-tr-c-hora"></div><div class="f"><label for="ist-tr-c-executor">Executor / COREN</label><input id="ist-tr-c-executor"></div></div><div class="brow"><button class="btn btn-p" type="button" onclick="gerarLaudoISTStandalone('c')">Gerar laudo do parceiro(a)</button></div></div></div><div id="ist-tr-alertas"></div><div class="brow"><button class="btn btn-ai" type="button" onclick="gerarTodosLaudosIST()">Gerar todos os laudos necessários</button></div></div>`}
function rotuloId(txt){return String(txt).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function campoModulo(p,c){const[id,l,t,ops]=c,full=`${p}-${id}`,span=t==='textarea'?' span2':'';if(t==='textarea')return`<div class="f${span}"><label>${l}</label><textarea id="${full}"></textarea></div>`;if(t==='select')return`<div class="f"><label>${l}</label><select id="${full}" onchange="avaliarPrioridadeModulo('${p}')"><option value="">—</option>${ops.map(x=>`<option>${x}</option>`).join('')}</select></div>`;return`<div class="f"><label>${l}</label><input id="${full}" type="${t}" oninput="avaliarPrioridadeModulo('${p}')"></div>`}
Object.keys(ESFDemandFlows).forEach(q=>{if(!MODULOS_CLINICOS.ger.queixas.includes(q))MODULOS_CLINICOS.ger.queixas.push(q);});
function identificacaoModulo(p){return`<div class="module-form-grid"><div class="f required-mark"><label>Paciente</label><input id="${p}-nome" required></div><div class="f required-mark"><label>CPF</label><input id="${p}-cpf" class="paciente-cpf" inputmode="numeric" required></div><div class="f"><label>CNS</label><input id="${p}-cns" inputmode="numeric"></div><div class="f"><label>Data de nascimento</label><input id="${p}-nasc" type="date"></div><div class="f"><label>Data e horário</label><input id="${p}-data-hora" type="datetime-local" value="${ESFClinical.localDateTime()}"></div><div class="f"><label>Profissional</label><input id="${p}-profissional" value="${escTR(getUsuarioAtual()?.nome||'')}"></div><div class="f"><label>Telefone</label><input id="${p}-telefone" class="telefone-mask" type="tel" inputmode="tel"></div><div class="f"><label>Microárea</label><input id="${p}-microarea"></div><div class="f"><label>CEP</label><input id="${p}-cep" class="cep-auto" inputmode="numeric" maxlength="9" placeholder="00000-000"><small id="${p}-cep-status"></small></div><div class="f span2"><label>Logradouro</label><input id="${p}-logradouro"></div><div class="f"><label>Número</label><input id="${p}-numero"></div><div class="f"><label>Complemento</label><input id="${p}-complemento"></div><div class="f"><label>Bairro</label><input id="${p}-bairro"></div><div class="f"><label>Município</label><input id="${p}-municipio"></div><div class="f"><label>UF</label><input id="${p}-uf" maxlength="2"></div><input type="hidden" id="${p}-endereco"></div>`}
function exameGuiadoModulo(p){return`<div class="guided-exam-grid">${EXAME_GUIADO_SISTEMAS.map(s=>{const k=rotuloId(s);return`<div class="guided-exam-item"><strong>${s}</strong><div class="guided-exam-controls"><select id="${p}-ef-${k}" onchange="atualizarExameGuiado('${p}','${k}')"><option value="">Não avaliado</option><option>Normal</option><option>Alterado</option></select><input id="${p}-ef-${k}-desc" placeholder="Descrição se alterado" disabled></div></div>`}).join('')}</div><input type="hidden" id="${p}-exame-guiado">`}
function atualizarExameGuiado(p,k){const s=document.getElementById(`${p}-ef-${k}`),d=document.getElementById(`${p}-ef-${k}-desc`);if(d){d.disabled=s.value!=='Alterado';if(d.disabled)d.value=''}const linhas=EXAME_GUIADO_SISTEMAS.map(x=>{const id=rotuloId(x),v=val(`${p}-ef-${id}`),desc=val(`${p}-ef-${id}-desc`);return v?`${x}: ${v}${desc?` — ${desc}`:''}.`:''}).filter(Boolean);document.getElementById(`${p}-exame-guiado`).value=linhas.join('\n')}
function chipsModulo(p,lista,tipo){return`<div class="${tipo==='alert'?'alert-check-list':'complaint-list'}">${lista.map(x=>`<button type="button" class="${tipo==='alert'?'alert-chip':'complaint-chip'}" onclick="alternarChipModulo('${p}','${tipo}',this)">${x}</button>`).join('')}</div><input type="hidden" id="${p}-${tipo==='alert'?'alerts':'complaints'}">`}
function alternarChipModulo(p,tipo,btn){btn.classList.toggle('selected');const sel=Array.from(btn.parentElement.querySelectorAll('.selected')).map(x=>x.textContent.trim()),id=`${p}-${tipo==='alert'?'alerts':'complaints'}`;document.getElementById(id).value=sel.join('; ');if((p==='acol'||p==='ger')&&tipo!=='alert')renderAlertasAcolhimento(p);if(p==='ger')avaliarDemandaEspontanea();avaliarPrioridadeModulo(p)}
function renderAlertasAcolhimento(p='ger'){const qs=val(`${p}-complaints`).split('; ').filter(Boolean),lista=[...new Set(qs.flatMap(q=>ALERTAS_QUEIXA[q]||['Piora progressiva']))],el=document.getElementById(`${p}-alertas-dinamicos`);if(el)el.innerHTML=lista.length?`<div class="ct"><span class="dot dr"></span>Sinais de alerta das queixas selecionadas</div>${chipsModulo(p,lista,'alert')}`:'<div class="alert alert-i">Selecione a queixa para exibir o checklist de sinais de alerta.</div>'}
function prioridadeModuloHtml(p){return`<div class="ct"><span class="dot da"></span>Fatores para classificação de prioridade</div><div class="alert-check-list">${FATORES_PRIORIDADE.map(x=>`<label class="alert-chip"><input type="checkbox" data-priority="${x}" onchange="avaliarPrioridadeModulo('${p}')"> ${x}</label>`).join('')}</div><div id="${p}-prioridade-painel" class="priority-panel"><strong>Rotina</strong><small>Sem fator de prioridade identificado no momento.</small></div><input type="hidden" id="${p}-prioridade" value="Rotina"><input type="hidden" id="${p}-prioridade-motivo"><input type="hidden" id="${p}-prioridade-acao">`}
function protocoloModuloHtml(p){return`<div id="${p}-protocolo-conduta" class="protocol-decision"><div class="protocol-decision-head">Decisão conforme protocolos cadastrados</div><div class="protocol-decision-grid"><div class="protocol-decision-item"><strong>Conduta</strong>Preencha os achados para verificar a conduta.</div><div class="protocol-decision-item"><strong>Medicação</strong>Somente será exibida quando explicitamente prevista.</div><div class="protocol-decision-item"><strong>Dosagem / tempo</strong>Somente será exibida quando explicitamente prevista.</div></div><div class="protocol-decision-notes"><strong>Observações do protocolo</strong>Serão exibidas orientações, alternativas, retornos e critérios de avaliação médica.</div></div>`}
function fraseProtocolarCurta(texto,limite=240){
  const limpo=String(texto||'').replace(/\s+/g,' ').trim();if(!limpo)return'';
  const frases=limpo.match(/[^.!?;]+[.!?;]?/g)||[limpo],selecionadas=[];let total=0;
  for(const frase of frases){const f=frase.trim();if(!f)continue;if(total+f.length>limite&&selecionadas.length)break;selecionadas.push(f);total+=f.length;if(selecionadas.length>=2)break}
  const saida=selecionadas.join(' ').trim();return saida.length>limite?saida.slice(0,limite-1).trim()+'…':saida;
}
function informacaoProtocolarUtil(texto){const t=String(texto||'').trim();return t&&!/^(não|nao) prevista|não há|nao ha|somente será|somente sera/i.test(t)}
function resumoDecisaoProtocolar(d,{fonte=true}={}){
  if(!d)return'';
  const linhas=[],conduta=fraseProtocolarCurta(d.conduta,260),med=fraseProtocolarCurta(d.medicacao,150),dose=fraseProtocolarCurta(d.dosagem,190);
  if(conduta)linhas.push(`Conduta: ${conduta}`);
  if(informacaoProtocolarUtil(med))linhas.push(`Medicação: ${med}${informacaoProtocolarUtil(dose)?` | ${dose}`:''}`);
  else if(informacaoProtocolarUtil(dose))linhas.push(`Dose/tempo: ${dose}`);
  if(fonte&&d.fonte)linhas.push(`Fonte: ${d.fonte}.`);
  return linhas.join('\n');
}
function resumoLinhasOperacionais(texto,limite=4){return[...new Set(String(texto||'').split('\n').map(x=>x.trim()).filter(x=>x&&!/^fonte:/i.test(x)))].slice(0,limite).map(x=>fraseProtocolarCurta(x,220)).join('\n')}
function renderCondutaProtocoladaModulo(p,contexto=''){
  const cfg=MODULOS_CLINICOS[p],dados=cfg?resumoCamposModulo(p):'',guia=typeof coletarGuiaClinico==='function'?coletarGuiaClinico(p):{},tr=p==='ist'&&typeof resumoTestesRapidosIST==='function'?resumoTestesRapidosIST().texto:'',ctxGestante=p==='ist'&&document.getElementById('ist-tr-condicao')?.value==='gestante'?'CONTEXTO_GESTANTE':'',ctxLactante=p==='ist'&&val('ist-lactante')==='Sim'?'CONTEXTO_LACTANTE':'',d=condutaProtocoladaModulo(p,[contexto,dados,guia.alertas,guia.condutas,tr,val(`${p}-alerts`),val(`${p}-complaints`),ctxGestante,ctxLactante].join(' ')),out=document.getElementById(`${p}-protocolo-conduta`);
  if(out)out.innerHTML=`<div class="protocol-decision-head"><span class="clinical-seal ${d.protocolada?'protocol':'validate'}">${d.protocolada?'Conduta protocolar':'Requer validação'}</span> ${d.protocolada?'Conduta localizada em protocolo cadastrado':'Sem conduta específica localizada'}</div><div class="protocol-decision-grid"><div class="protocol-decision-item"><strong>Conduta</strong>${escTR(d.conduta||'Não definida.')}</div><div class="protocol-decision-item"><strong>Medicação</strong>${escTR(d.medicacao||'Não prevista neste protocolo.')}</div><div class="protocol-decision-item"><strong>Dosagem / tempo</strong>${escTR(d.dosagem||'Não prevista neste protocolo.')}</div></div><div class="protocol-decision-notes"><strong>Observações do protocolo</strong>${escTR(d.observacoes||'Revisar e validar clinicamente.')}</div><div class="protocol-decision-source">Conforme protocolo: <a href="${d.url}" target="_blank" rel="noopener">${escTR(d.fonte)}</a>. Apoio à decisão: revisar e validar clinicamente antes de registrar a conduta.</div>`;
  return d;
}
// lerPA agora é definida uma única vez, cedo (junto de avaliarProtocolosPna).
function avaliarPrioridadeModulo(p){
  if(p==='ger'){const d=avaliarDemandaEspontanea(),panel=document.getElementById('ger-prioridade-painel');if(panel){panel.className='priority-panel demanda-'+d.cor.toLowerCase();panel.innerHTML=`<strong>${escTR(d.cor)}</strong><small>${escTR(d.criterio)} — ${escTR(d.acao)}</small>`;}return{grau:d.cor,motivos:[d.criterio],acao:d.acao};}
  if(p==='ger'){
    const d=avaliarDemandaEspontanea(),painel=document.getElementById('ger-prioridade-painel');
    if(painel){painel.className='priority-panel demanda-'+String(d.cor||'azul').toLowerCase();painel.innerHTML=`<strong>${d.cor}</strong><small>Critério: ${escTR(d.criterio||'não definido')}\nAção sugerida: ${escTR(d.acao||'definir conduta')}${d.mods.length?`\nIntegrações: ${d.mods.join(' · ')}`:''}</small>`}
    return{grau:d.cor,motivos:[d.criterio].filter(Boolean),acao:d.acao};
  }
  const pg=document.getElementById('pg-'+(moduloPorPrefixo(p)?.page||''));if(!pg)return{grau:'Rotina',motivos:[],acao:'Acompanhamento conforme programação.'};
  const motivos=Array.from(pg.querySelectorAll('[data-priority]:checked')).map(x=>x.dataset.priority),alerts=val(`${p}-alerts`).split('; ').filter(Boolean),guia=typeof coletarGuiaClinico==='function'?coletarGuiaClinico(p):{};motivos.push(...alerts,...String(guia.alertas||'').split('\n').filter(Boolean));
  const [pas,pad]=lerPA(val(`${p}-pa-atual`)||val(`${p}-pa`)),sat=Number(val(`${p}-sat`)||0),glic=Number(val(`${p}-glicemia`)||0);
  if(pas>=180||pad>=120)motivos.push('PA muito elevada');else if(pas>=160||pad>=100)motivos.push('PA elevada');
  if(sat&&sat<92)motivos.push('Saturação baixa');if(glic&&glic<54)motivos.push('Hipoglicemia importante');if(glic>=300)motivos.push('Glicemia muito elevada');
  if(p==='hip'&&val('hip-ultima-medica')&&diasDesde(val('hip-ultima-medica'))>180)motivos.push('Falta de acompanhamento há mais de 6 meses');
  const respostasAlerta=Array.from(pg.querySelectorAll('select,input,textarea')).filter(e=>{const v=normalizarTextoProtocolo(e.value);return v!=='nao reagente'&&/sim|reagente|imediat|intensa|forte|necrose|purulent|alterad/i.test(v)}).map(e=>`${e.id}: ${e.value}`);
  const texto=[...motivos,...respostasAlerta,val(`${p}-gravidade`),val(`${p}-infeccao`),val(`${p}-sangramento`),val(`${p}-depressao`),guia.condutas||''].join(' ').toLowerCase();
  let grau='Rotina',classe='',acao='Manter acompanhamento e retorno programado.';
  if(/ideação suicida|risco de suicídio|dor torácica|falta de ar|alteração neurológica|sangramento intenso|saturação baixa|pa muito elevada|hipoglicemia|violência sexual|risco de violência|gestante com teste reagente/.test(texto)){grau='Urgência clínica — avaliação profissional';classe='urgencia';acao='Realizar avaliação clínica imediata e registrar os achados.'}
  else if(motivos.length||/reagente|necrose|infecção|febre|gestante|idoso frágil|dor intensa/.test(texto)){grau='Prioridade alta';classe='alta';acao='Realizar avaliação clínica prioritária e registrar os achados.'}
  else if(/vulnerabilidade|falta de acompanhamento|resultado de exame alterado|queixa aguda/.test(texto)){grau='Prioridade média';classe='media';acao='Organizar avaliação no mesmo turno ou retorno breve, conforme disponibilidade e quadro.'}
  else if(texto.trim()){grau='Prioridade baixa';acao='Orientar, pactuar retorno e reavaliar se houver piora.'}
  const protocolo=renderCondutaProtocoladaModulo(p,texto);if(MODULOS_COM_PROTOCOLO_ATIVO.has(p)&&texto.trim())acao=resumoDecisaoProtocolar(protocolo,{fonte:false})||acao;
  const todosMotivos=[...new Set([...motivos,...respostasAlerta])],motivosVisiveis=todosMotivos.slice(0,4).map(x=>fraseProtocolarCurta(String(x).replace(/^[^:]+:\s*/,'').replace(/^ALERTA:\s*/i,''),100));const painel=document.getElementById(`${p}-prioridade-painel`);if(painel){painel.className='priority-panel '+classe;painel.innerHTML=`<strong>${grau}</strong><small>Motivo: ${motivosVisiveis.join('; ')||'sem fator automático identificado'}\nAção sugerida: ${acao}${protocolo.fonte?`\nFonte: ${protocolo.fonte}`:''}</small>`}
  [['prioridade',grau],['prioridade-motivo',todosMotivos.join('; ')],['prioridade-acao',acao]].forEach(([k,v])=>{const e=document.getElementById(`${p}-${k}`);if(e)e.value=v});return{grau,motivos:todosMotivos,acao}
}
function vitaisModulo(p){return`<div class="module-form-grid"><div class="f"><label>Pressão arterial</label><input id="${p}-pa" placeholder="120/80" oninput="avaliarPrioridadeModulo('${p}')"></div><div class="f"><label>Frequência cardíaca</label><input id="${p}-fc" type="number"></div><div class="f"><label>Frequência respiratória</label><input id="${p}-fr" type="number"></div><div class="f"><label>Saturação O₂ (%)</label><input id="${p}-sat" type="number" oninput="avaliarPrioridadeModulo('${p}')"></div><div class="f"><label>Temperatura (°C)</label><input id="${p}-temp" type="number" step=".1" oninput="avaliarPrioridadeModulo('${p}')"></div><div class="f"><label>Dor (0–10)</label><input id="${p}-dor-escala" type="number" min="0" max="10" oninput="avaliarPrioridadeModulo('${p}')"></div></div>`}
function avisoModuloDesenvolvimento(p){
  const f=FONTES_PROTOCOLARES_MODULOS[p]||FONTES_PROTOCOLARES_MODULOS.ger;
  return`<div class="protocol-guard"><strong>Módulo em desenvolvimento — trava de segurança protocolar ativa</strong>Condutas automáticas de medicação ou encaminhamento somente aparecem quando estiverem explicitamente descritas no protocolo oficial cadastrado. Quando não houver conduta localizada, o sistema apenas registra o alerta para avaliação profissional. Fonte: <a href="${f.url}" target="_blank" rel="noopener">${f.nome}</a>.</div>`;
}
function paginaModuloClinico(p,cfg){
  const alertas=cfg.alertas||[];
  return`<div class="pg clinical-module" id="pg-${cfg.page}">
    <div class="sh"><div class="sh-ic ic-g">${cfg.icone}</div><div><div class="sh-t">${cfg.titulo}${cfg.desenvolvimento?` <span class="dev-badge">EM DESENVOLVIMENTO</span>`:''}</div><div class="sh-s">${cfg.sub}</div></div></div>
    ${cfg.desenvolvimento?avisoModuloDesenvolvimento(p):''}
    <div class="tabs"><div class="tab on" onclick="tab(this,'${p}-cad')">1 · Identificação</div><div class="tab" onclick="tab(this,'${p}-aval')">2 · Avaliação</div><div class="tab" onclick="tab(this,'${p}-prio')">3 · Prioridade / Alertas</div><div class="tab" onclick="tab(this,'${p}-soap')">4 · SOAP / SAE</div></div>
    <div class="tp on" id="${p}-cad"><div class="card"><div class="ct"><span class="dot dg"></span>Identificação</div>${identificacaoModulo(p)}</div></div>
    <div class="tp" id="${p}-aval"><div class="card">${cfg.queixas?`<div class="ct"><span class="dot da"></span>${p==='ger'?'Queixas / fluxos do protocolo Toledo 2026':'Queixas comuns'}</div>${chipsModulo(p,cfg.queixas,'complaint')}<div id="${p}-alertas-dinamicos" style="margin-top:12px"></div>${demandaPainelHtml(p)}`:''}${guiaAnamneseNovo(p)}<div class="ct"><span class="dot db"></span>Avaliação clínica detalhada</div>${p==='fer'?`<div class="brow"><button class="btn btn-s" onclick="gerarEvolucaoComparativaFerida()">Comparar com último curativo</button></div>`:''}${p==='vd'?'':`<div class="module-form-grid">${cfg.campos.map(x=>campoModulo(p,x)).join('')}</div>`}${cfg.extraHtml?cfg.extraHtml(p):''}${cfg.foto?`<div class="lgpd-photo"><strong>Foto evolutiva da ferida</strong><p>Imagem é dado sensível. Anexe somente após autorização do paciente/responsável e conforme regras de LGPD da unidade. A foto não é armazenada automaticamente no navegador.</p><label><input type="checkbox" id="${p}-foto-autorizada"> Autorização registrada</label><br><input type="file" id="${p}-foto" accept="image/*" onchange="preverFotoFerida(event,'${p}')"><img id="${p}-foto-preview" class="photo-preview" alt="Prévia da ferida"></div>`:''}</div><div class="card"><div class="ct"><span class="dot dg"></span>Exame físico</div><div class="alert alert-i">Clique nos achados encontrados. Eles serão usados no SOAP, prioridade e SAE.</div>${guiaExameNovo(p)}</div><div class="card"><div class="ct"><span class="dot dr"></span>Sinais vitais</div>${vitaisModulo(p)}</div>${p==='ist'?testesRapidosISTHtml():''}</div>
    <div class="tp" id="${p}-prio"><div class="card">${alertas.length?`<div class="ct"><span class="dot dr"></span>Alertas específicos</div>${chipsModulo(p,alertas,'alert')}`:''}${prioridadeModuloHtml(p)}${protocoloModuloHtml(p)}</div></div>
    <div class="tp" id="${p}-soap"><div class="card"><div class="ct"><span class="dot db"></span>Evolução SOAP e orientação ao paciente</div><div class="brow"><button class="btn btn-p" onclick="gerarSoapGenerico('${p}')">Gerar SOAP</button><button class="btn btn-ai" type="button" onclick="gerarSAE('${p}')">GERAR SAE</button>${p==='ist'?`<button class="btn btn-s" onclick="gerarTodosLaudosIST()">Gerar laudos de teste rápido</button>`:''}${p==='vd'?`<button class="btn btn-s" onclick="gerarPDFVisitaDomiciliar()">Gerar relatório PDF</button><button class="btn btn-s" onclick="copiarSoapAnonimizadoVD()">Copiar SOAP anonimizado</button>`:''}<button class="save-atend-btn" onclick="salvarAtendimentoModulo('${cfg.tipo}')">Salvar atendimento</button></div><div class="soap-grid"><div class="soap-item f"><label>S — Subjetivo</label><textarea id="${p}-s"></textarea></div><div class="soap-item f"><label>O — Objetivo</label><textarea id="${p}-o"></textarea></div><div class="soap-item f"><label>A — Avaliação</label><textarea id="${p}-a"></textarea></div><div class="soap-item f"><label>P — Plano</label><textarea id="${p}-p"></textarea></div></div><div class="f"><label>Orientação simples para o paciente</label><textarea id="${p}-orientacao-paciente"></textarea></div></div></div>
  </div>`
}
function montarModulosClinicos(){const wrap=document.querySelector('.wrap');Object.entries(MODULOS_CLINICOS).forEach(([p,c])=>{if(!c.oculto&&!document.getElementById(`pg-${c.page}`))wrap.insertAdjacentHTML('beforeend',paginaModuloClinico(p,c))});renderAlertasAcolhimento('ger');atualizarTestesRapidosIST();if(typeof atualizarTipoVisitaVD==='function')atualizarTipoVisitaVD();if(typeof atualizarSoftChecks==='function')atualizarSoftChecks(document.getElementById('pg-visita-domiciliar')||document);if(typeof atualizarPainelAcamadosVD==='function')atualizarPainelAcamadosVD();['ist-nome','ist-nasc','ist-profissional'].forEach(id=>document.getElementById(id)?.addEventListener('input',copiarDadosPacienteParaISTTR));montarPlanosCuidados()}
function preverFotoFerida(event,p){const f=event.target.files?.[0],ok=document.getElementById(`${p}-foto-autorizada`)?.checked,img=document.getElementById(`${p}-foto-preview`);if(!f)return;if(!ok){event.target.value='';showToast('Registre a autorização antes de anexar a foto.');return}img.src=URL.createObjectURL(f);img.style.display='block'}
function gerarEvolucaoComparativaFerida(){const cpf=normalizarCPF(val('fer-cpf')),anteriores=carregarAtendimentos().filter(a=>a.tipo==='Feridas / Curativos'&&(!cpf||a.cpf===cpf)).sort((a,b)=>new Date(b.data)-new Date(a.data)),ant=anteriores[0];if(!ant){showToast('Nenhum curativo anterior encontrado para comparar.');return}const n=id=>Number(val(id)||0),old=id=>Number(ant.dados?.[id]||0),area=n('fer-comprimento')*n('fer-largura'),areaAnt=old('fer-comprimento')*old('fer-largura'),dif=areaAnt?Math.round(((area-areaAnt)/areaAnt)*100):null,linhas=[`Comparação com ${new Date(ant.data).toLocaleDateString('pt-BR')}:`,areaAnt&&area?`Área estimada: ${areaAnt.toFixed(1)} cm² → ${area.toFixed(1)} cm² (${dif>0?'+':''}${dif}%).`:'Dimensões insuficientes para calcular variação de área.',`Exsudato anterior: ${ant.dados?.['fer-exsudato']||'não informado'}; atual: ${val('fer-exsudato','não informado')}.`,`Tecido anterior: ${ant.dados?.['fer-tecido']||'não informado'}; atual: ${val('fer-tecido','não informado')}.`,`Sinais de infecção anteriores: ${ant.dados?.['fer-infeccao']||'não informados'}; atuais: ${val('fer-infeccao','não informados')}.`];document.getElementById('fer-evolucao').value=linhas.join('\n');showToast('Evolução comparativa gerada. Revise os achados.')}
function copiarDadosPacienteParaISTTR(){[['ist-nome','ist-tr-p-nome'],['ist-nasc','ist-tr-p-nasc'],['ist-profissional','ist-tr-p-executor']].forEach(([a,b])=>{const x=document.getElementById(a),y=document.getElementById(b);if(x&&y)y.value=x.value||y.value||''})}
function atualizarTestesRapidosIST(){
  if(!document.getElementById('ist-tr-p-testes'))return;copiarDadosPacienteParaISTTR();const gestante=document.getElementById('ist-tr-condicao')?.value==='gestante',parceiro=document.getElementById('ist-tr-parceiro-presente')?.value==='sim';
  const principal=document.getElementById('ist-tr-p-testes'),acomp=document.getElementById('ist-tr-c-testes'),modo=gestante?'gestante':'naogestante';if(principal.dataset.modo!==modo){montarCamposTR('ist-tr-p',gestante);principal.dataset.modo=modo}if(!acomp.dataset.modo){montarCamposTR('ist-tr-c',false);acomp.dataset.modo='naogestante'}const sexo=document.getElementById('ist-tr-p-sexo');if(sexo&&gestante)sexo.value='Feminino';const box=document.getElementById('ist-tr-parceiro-box');if(box)box.style.display=parceiro?'block':'none';
  const hoje=new Date().toISOString().slice(0,10),hora=new Date().toTimeString().slice(0,5),executor=val('ist-profissional',getUsuarioAtual()?.nome||'');['ist-tr-p-data','ist-tr-c-data'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.value)e.value=hoje});['ist-tr-p-hora','ist-tr-c-hora'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.value)e.value=hora});['ist-tr-p-executor','ist-tr-c-executor'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.value)e.value=executor});avaliarResultadosTR();
}
function resumoTestesRapidosIST(){
  if(!document.getElementById('ist-tr-p-testes'))return{texto:'Testes rápidos não registrados.',conduta:''};
  const d=dadosLaudoTR('ist-tr-p',document.getElementById('ist-tr-condicao')?.value==='gestante'),todos=[['HIV TR1',d.hiv1],['HIV TR2',d.hiv2],['Sífilis',d.sif],['Hepatite B',d.hepb],['Hepatite C',d.hepc]],realizados=todos.filter(([,r])=>r&&!/NÃO REALIZADO|NAO REALIZADO/i.test(r)),pendentes=todos.filter(([,r])=>!r||/NÃO REALIZADO|NAO REALIZADO/i.test(r)).map(x=>x[0]),cond=[];
  if(d.hiv1==='REAGENTE'&&d.hiv2==='REAGENTE')cond.push('HIV — dois testes reagentes: realizar notificação; acolhimento e aconselhamento pós-teste; solicitar testagem da parceria fixa ou das parcerias dos últimos 12 meses; ligar para o CTA para agendamento.');
  else if(d.hiv1==='REAGENTE'&&d.hiv2==='NÃO REAGENTE')cond.push('HIV — TR1 reagente e TR2 não reagente: solicitar no sistema municipal “Pesquisa de Anticorpos Anti-HIV-1 + HIV-2 (Elisa)”.');
  else if(d.hiv1==='REAGENTE')cond.push('HIV — TR1 reagente sem segundo teste conclusivo: realizar TR2 diferente antes de concluir o diagnóstico.');
  if(d.sif==='REAGENTE')cond.push('Sífilis reagente: solicitar teste não treponêmico VDRL, classificar o estágio clínico antes de definir tratamento e testar todas as parcerias. O sistema não sugere medicação sem estágio registrado.');
  if(d.hepb==='REAGENTE')cond.push('HBsAg reagente: notificar; solicitar HBsAg com demais marcadores virais e PCR quantitativo pelo formulário próprio; encaminhar a documentação à epidemiologia; testar parceria e contatos domiciliares. Somente se PCR > 2.000, contatar CTA para agendamento com infectologista.');
  if(d.hepc==='REAGENTE')cond.push('Anti-HCV reagente: notificar; solicitar PCR quantitativo pelo formulário próprio e encaminhar a documentação à epidemiologia; com o PCR pronto, agendar infectologista no CTA; testar parceria e contatos domiciliares.');
  if(!cond.length&&realizados.length)cond.push('Resultados realizados sem fluxo reagente identificado: registrar aconselhamento e orientações de prevenção combinada conforme o Protocolo IST Toledo.');
  if(pendentes.length)cond.push(`Pendentes testes rápidos para ${pendentes.join(', ')}, a serem realizados conforme protocolo local.`);
  cond.push('Fonte: Protocolo IST Toledo 2020.');
  return{texto:realizados.map(([n,r])=>`${n}: ${r.toLowerCase()}`).join('; '),realizados,pendentes,conduta:cond.join('\n')};
}
function gerarLaudoISTStandalone(pessoa='p'){if(!exigirPermissao('gerar_documentos'))return;copiarDadosPacienteParaISTTR();const gestante=pessoa==='p'&&document.getElementById('ist-tr-condicao')?.value==='gestante',d=dadosLaudoTR(`ist-tr-${pessoa}`,gestante);if(!d.nome){showToast('Informe o nome da pessoa antes de gerar o laudo.');return}abrirLaudosTR([paginaLaudoTR(d)])}
function gerarTodosLaudosIST(){if(!exigirPermissao('gerar_documentos'))return;copiarDadosPacienteParaISTTR();const principal=dadosLaudoTR('ist-tr-p',document.getElementById('ist-tr-condicao')?.value==='gestante');if(!principal.nome){showToast('Informe os dados da pessoa principal.');return}const paginas=[paginaLaudoTR(principal)];if(document.getElementById('ist-tr-parceiro-presente')?.value==='sim'){const parceiro=dadosLaudoTR('ist-tr-c',false);if(!parceiro.nome){showToast('Informe os dados do parceiro(a).');return}paginas.push(paginaLaudoTR(parceiro))}abrirLaudosTR(paginas)}
function resumoCamposModulo(p){const cfg=MODULOS_CLINICOS[p],linhas=[];(cfg?.campos||[]).forEach(([id,l])=>{const v=val(`${p}-${id}`);if(v)linhas.push(`${l}: ${v}`)});return linhas.join('\n')}
function gerarSoapGenerico(p){
  if(p==='vd')return gerarSoapVisitaDomiciliar();
  if(p==='ger'&&validarDemandaEspontanea(true).length)return;
  const cfg=MODULOS_CLINICOS[p],pri=avaliarPrioridadeModulo(p),queixas=val(`${p}-complaints`),alertas=val(`${p}-alerts`),dados=resumoCamposModulo(p),guia=coletarGuiaClinico(p),vitais=[['PA',val(`${p}-pa`)||val(`${p}-pa-atual`)],['FC',val(`${p}-fc`)],['FR',val(`${p}-fr`)],['SpO2',val(`${p}-sat`)],['Temperatura',val(`${p}-temp`)],['Dor',val(`${p}-dor-escala`)]].filter(x=>x[1]).map(x=>x.join(': ')).join(' | '),tr=p==='ist'?resumoTestesRapidosIST():null;
  const demanda=p==='ger'?avaliarDemandaEspontanea():null;
  const protocolo=renderCondutaProtocoladaModulo(p,[queixas,alertas,dados,guia.alertas,pri.motivos.join(' ')].join(' '));
  const resumoProtocolo=!guia.condutas?resumoDecisaoProtocolar(protocolo,{fonte:false}):'',condutaTR=tr&&/REAGENTE/.test(tr.texto)?resumoLinhasOperacionais(tr.conduta||'',3):'',condutaAutomatica=[resumoProtocolo,condutaTR].filter(Boolean).join('\n'),acaoPrioridade=pri.grau!=='Rotina'&&pri.acao&&pri.acao!==resumoProtocolo&&pri.acao!==guia.condutas?`Prioridade: ${fraseProtocolarCurta(pri.acao,220)}`:'';
  const motivo=val(`${p}-motivo`)||val(`${p}-queixa`),queixa=val(`${p}-queixa`)||queixas,retorno=val(`${p}-retorno`),orientacoes=val(`${p}-orientacoes`);
  montarSoapClinico({nome:val(`${p}-nome`),idade:idadePorNascimento(val(`${p}-nasc`)),modulo:p,ids:{s:`${p}-s`,o:`${p}-o`,a:`${p}-a`,p:`${p}-p`},descricao:[cfg.titulo,motivo?`Motivo do atendimento: ${motivo}.`:'',p==='ger'&&val('ger-chegada')?`Chegada às ${val('ger-chegada')}.`:''].filter(Boolean).join(' '),hma:[queixa?`Comparece referindo ${queixa}.`:'',val(`${p}-hma`),val(`${p}-inicio`)?`Início/tempo de evolução: ${val(`${p}-inicio`)}.`:'',val(`${p}-sintomas`)?`Sintomas associados: ${val(`${p}-sintomas`)}.`:''].filter(Boolean).join('\n'),hp:[val(`${p}-antecedentes`)?`Antecedentes pessoais: ${val(`${p}-antecedentes`)}.`:'',val(`${p}-comorbidades`)?`Comorbidades: ${val(`${p}-comorbidades`)}.`:'',val(`${p}-medicamentos`)?`Medicamentos em uso: ${val(`${p}-medicamentos`)}.`:'',val(`${p}-alergias`)?`Alergias: ${val(`${p}-alergias`)}.`:'',val(`${p}-familiar`)?`Histórico familiar: ${val(`${p}-familiar`)}.`:'',val(`${p}-social`)?`Condições sociais: ${val(`${p}-social`)}.`:''].filter(Boolean).join('\n'),exame:[vitais,val(`${p}-exame-complementar`),demanda?`Classificação Toledo 2026: ${demanda.cor}.`:'' ].filter(Boolean).join('\n'),objetivo:tr?`Testes rápidos: ${tr.texto}`:'',hd:[val(`${p}-problemas`),val(`${p}-necessidade`),demanda?`Fluxo aplicado: ${queixas||'demanda espontânea'}. Classificação ${demanda.cor}, justificada por: ${demanda.criterio}.`:'',demanda&&demanda.cor!==demanda.corSugerida?`Classificação sugerida pelo sistema: ${demanda.corSugerida}. Justificativa técnica registrada para classificação manual: ${val('ger-justificativa-rebaixamento')}.`:'' ].filter(Boolean).join('\n'),avaliacao:[pri.motivos.length?`Motivo da prioridade: ${pri.motivos.join('; ')}.`:'',alertas?`Alertas selecionados: ${alertas}.`:'',demanda?.mods?.length?`Módulos/fluxos acionados ou sugeridos: ${demanda.mods.join('; ')}.`:''].filter(Boolean).join('\n'),cd:[val(`${p}-conduta`),condutaAutomatica,acaoPrioridade,val('ger-monitoramento')?`Monitoramento/medidas de conforto: ${val('ger-monitoramento')}.`:'',val('ger-responsavel-reavaliacao')?`Responsável pela reavaliação: ${val('ger-responsavel-reavaliacao')}.`:'',val(`${p}-encaminhamento`)?`Encaminhamento registrado pelo profissional: ${val(`${p}-encaminhamento`)}.`:'',demanda?.desfecho?`Desfecho: ${demanda.desfecho}.`:'',retorno?`Retorno pactuado: ${retorno}.`:'',p==='ger'?'Base protocolar: Protocolo Municipal de Enfermagem — Avaliação e Manejo da Demanda Espontânea na APS, Toledo/PR, 1ª edição, 2026.':(protocolo.protocolada?`Fonte verificada: ${tr?'Protocolo IST Toledo 2020':protocolo.fonte}.`:'') ].filter(Boolean).join('\n'),plano:[orientacoes,val(`${p}-sinais-alerta-orientados`)?`Sinais de alerta orientados: ${val(`${p}-sinais-alerta-orientados`)}.`:''].filter(Boolean).join('\n')});
  const orientacaoPaciente=document.getElementById(`${p}-orientacao-paciente`);if(orientacaoPaciente)orientacaoPaciente.value=[orientacoes,retorno?`Retorno: ${retorno}.`:'' ].filter(Boolean).join('\n');showToast('SOAP técnico e orientação gerados. Revise antes de salvar.');
}
function montarPrioridadeExistentes(){PLANO_MODULOS.filter(([p])=>!MODULOS_CLINICOS[p]).forEach(([p,alvo])=>{const a=document.getElementById(alvo);if(!a||document.getElementById(`${p}-prioridade-comum`))return;const c=document.createElement('div');c.className='card';c.id=`${p}-prioridade-comum`;c.innerHTML=`<div class="ct"><span class="dot dr"></span>Classificação de prioridade do atendimento</div>${prioridadeModuloHtml(p)}`;a.appendChild(c)})}

// Central protocolar transversal: todas as consultas cruzam os dados com todos os
// protocolos assistenciais cadastrados, além dos motores especializados de cada linha.
const CENTRAL_PROTOCOLAR_MODULOS={
  pna:{nome:'Abertura de Pré-Natal',especializado:'Pré-Natal, Diabetes na Gestação, Hipertensão na Gestação, Ferro, Tireoide e Linha Materno-Infantil'},
  pnc:{nome:'Consulta de Pré-Natal',especializado:'Pré-Natal, Diabetes na Gestação, Hipertensão na Gestação, Ferro, Tireoide e Linha Materno-Infantil'},
  pu:{nome:'Puericultura',especializado:'Fluxo de Pediatria e Estratificação de Risco da Puericultura'},
  prev:{nome:'Preventivo',especializado:'IST, rastreamento citopatológico e fluxos de avaliação de lesões'},
  id:{nome:'Idoso',especializado:'IVCF-20 e protocolos transversais clínicos'},
  sm:{nome:'Saúde Mental',especializado:'ERSM, Fluxograma Saúde Mental/CER e protocolo de registros'},
  ger:{nome:'Consulta Geral',especializado:'Protocolos transversais municipais'},
  acol:{nome:'Acolhimento',especializado:'Protocolos transversais municipais'},
  hip:{nome:'Hiperdia',especializado:'Cardiologia e Endocrinologia'},
  fer:{nome:'Feridas / Curativos',especializado:'Teledermatologia e protocolos transversais'},
  puerp:{nome:'Puerpério',especializado:'Assistência puerperal e protocolos transversais'},
  ist:{nome:'IST / Testes Rápidos',especializado:'Protocolo IST Toledo 2020'},
  vd:{nome:'Visita Domiciliar',especializado:'Atenção domiciliar, acamados, dispositivos e protocolos transversais'}
};
const CENTRAL_SOAP_P={pna:'pna-soap-p',pnc:'pnc-p',pu:'pu-p',prev:'prev-p',id:'id-p',sm:'sm-p',ger:'ger-p',acol:'acol-p',hip:'hip-p',fer:'fer-p',puerp:'puerp-p',ist:'ist-p',vd:'vd-p'};
function textoConsultaCentral(prefix){
  const cfg=CENTRAL_PROTOCOLAR_MODULOS[prefix],page=cfg&&document.getElementById(paginaDoModulo(prefix));
  if(!page)return'';
  const soapIds=new Set(Object.values(SOAP_IDS_MODULO).flatMap(x=>Object.values(x)));
  const campos=Array.from(page.querySelectorAll('input,select,textarea')).filter(e=>!soapIds.has(e.id)&&!/^lab-livre-texto-/.test(e.id||'')&&e.type!=='hidden'&&e.type!=='file'&&((e.type==='checkbox'||e.type==='radio')?e.checked:String(e.value||'').trim())).map(e=>`${e.id||e.name}: ${(e.type==='checkbox'||e.type==='radio')?(e.closest('label')?.textContent||e.value):e.value}`);
  const chips=Array.from(page.querySelectorAll('.clinical-chip.selected,.complaint-chip.selected,.alert-chip.selected')).map(e=>e.textContent.trim());
  return normalizarTextoProtocolo([...campos,...chips,resumoExamesParaCentral(prefix)].join(' | '));
}
function decisoesCentralProtocolar(prefix){
  const t=textoConsultaCentral(prefix),out=[],push=(titulo,d)=>{if(d?.protocolada&&d.conduta&&!out.some(x=>x.d.texto===d.texto))out.push({titulo,d})};
  const istRx=/candidiase|vaginose|tricomon|cervicite|uretrite|sifilis|herpes|condiloma|hpv|cancroide|linfogranuloma|lgv|donovanose|hiv.*reagente|hbsag.*reagente|anti.?hcv.*reagente/;
  const hipRx=/has mal controlada|tres medicacoes em dose plena|dm sem controle|1 unidade\/kg|tfg menor que 30|isglt2|insuficiencia cardiaca|arritmia|hipotireoidismo|hipertireoidismo|nodulo de tireoide|bocio multinodular|obesidade secundaria|cirurgia bariatrica|hiperprolactinemia|sindrome coronariana/;
  if(istRx.test(t))push('Protocolo IST Toledo',condutaProtocoladaModulo('ist',`${t} ${prefix==='pna'||prefix==='pnc'?'CONTEXTO_GESTANTE':''} ${prefix==='puerp'?'CONTEXTO_LACTANTE':''}`));
  if(hipRx.test(t))push('Cardiologia / Endocrinologia',condutaProtocoladaModulo('hip',t));
  if(/lesao de pele|lesão de pele|ferida|ulcera|necrose|dermatoscopia|teledermato/.test(t))push('Teledermatologia',condutaProtocoladaModulo('fer',t));
  if(prefix==='puerp')push('Assistência puerperal',condutaProtocoladaModulo('puerp',t));
  if(prefix==='sm'&&/suicid|autoagress|heteroagress|surto|psicose|alucin|delirio/.test(t))push('Saúde Mental',decisaoProtocolar({nome:'Fluxograma Saúde Mental / CER — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},'Aplicar a estratificação ERSM, avaliar segurança imediata, rede de apoio e o fluxo municipal de saúde mental correspondente ao risco identificado.','Não prevista automaticamente neste protocolo.','Não prevista automaticamente neste protocolo.',true,'Registrar exame do estado mental, risco, fatores de proteção, rede de apoio e serviço acionado.'));
  if(prefix==='pu'&&/atraso|ausencia de marco|não reage|nao reage|baixo peso|velocidade de crescimento/.test(t))push('Pediatria / Puericultura',decisaoProtocolar({nome:'Fluxo de Encaminhamento Pediatria — Toledo',url:'https://www.toledo.pr.gov.br/portais/saude/gabinete-da-secretaria-de-saude/protocolos-da-secretaria-da-saude'},'Revisar a estratificação da criança, registrar o marco ou alteração encontrada e aplicar o fluxo pediátrico municipal compatível.','Não prevista automaticamente neste protocolo de encaminhamento.','Não prevista automaticamente neste protocolo de encaminhamento.',true,'Documentar idade, crescimento, desenvolvimento, sinais/sintomas, antecedentes e exames disponíveis.'));
  return out;
}
function renderCentralProtocolar(prefix){
  const out=document.getElementById(`central-protocol-${prefix}`),cfg=CENTRAL_PROTOCOLAR_MODULOS[prefix];if(!out||!cfg)return[];
  const ds=decisoesCentralProtocolar(prefix);
  out.innerHTML=`<div class="central-protocol-head"><span>Condutas acionadas — ${cfg.nome}</span><small>Resumo para decisão rápida</small></div>${ds.length?ds.map(({titulo,d})=>`<div class="central-protocol-result"><strong>${escTR(titulo)}</strong><pre>${escTR(resumoDecisaoProtocolar(d))}</pre></div>`).join(''):`<div class="central-protocol-empty">Nenhuma conduta adicional acionada pelos dados atuais.</div>`}`;
  return ds;
}
function montarCentralProtocolar(){
  PLANO_MODULOS.forEach(([prefix,alvo])=>{const area=document.getElementById(alvo);if(!area||document.getElementById(`central-protocol-${prefix}`))return;const c=document.createElement('div');c.id=`central-protocol-${prefix}`;c.className='central-protocol-card';area.appendChild(c);renderCentralProtocolar(prefix)});
}
function anexarCentralAoSoap(prefix){
  const ds=renderCentralProtocolar(prefix),id=CENTRAL_SOAP_P[prefix],el=document.getElementById(id);if(!el||!ds.length)return;
  const marker='\n\nCONDUTAS PROTOCOLARES ACIONADAS:\n',marcadorAntigo='\n\nCENTRAL PROTOCOLAR TRANSVERSAL:\n',base=String(el.value||'').split(marker)[0].split(marcadorAntigo)[0],novas=ds.filter(x=>!base.includes(fraseProtocolarCurta(x.d.conduta,80).slice(0,45))),texto=novas.slice(0,4).map(x=>`- ${x.titulo}: ${fraseProtocolarCurta(x.d.conduta,230)}`).join('\n');el.value=texto?base+marker+texto:base;
}
let centralProtocolTimer;
document.addEventListener('input',e=>{const pg=e.target.closest?.('.pg');if(!pg)return;clearTimeout(centralProtocolTimer);centralProtocolTimer=setTimeout(()=>{for(const p of Object.keys(CENTRAL_PROTOCOLAR_MODULOS))if(pg.contains(document.getElementById(`central-protocol-${p}`))||pg.id===paginaDoModulo(p))renderCentralProtocolar(p)},120)});
document.addEventListener('change',e=>e.target.closest?.('.pg')&&setTimeout(()=>Object.keys(CENTRAL_PROTOCOLAR_MODULOS).forEach(renderCentralProtocolar),0));
document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b||!/gerar.*(soap|evolu|evolução)/i.test(`${b.textContent} ${b.getAttribute('onclick')||''}`))return;setTimeout(()=>Object.keys(CENTRAL_PROTOCOLAR_MODULOS).forEach(anexarCentralAoSoap),250)});
document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b||!/gerar.*(soap|evolu|evolução)/i.test(`${b.textContent} ${b.getAttribute('onclick')||''}`))return;setTimeout(()=>{const p=prefixoPaginaAtual();if(p&&!devePularFinalizadorSoapAutomatico(p))finalizarSoapModulo(p)},520)});

// Automações básicas compartilhadas: antropometria/IMC e endereço por CEP.
const AUTOMACAO_PREFIXOS=['pna','pnc','pu','prev','id','sm','ger','acol','hip','fer','puerp','ist','vd'];
const AUTOMACAO_ALVOS_CLINICOS={pna:'pna-4',pnc:'pnc-3',pu:'pu-3',prev:'prev-3',id:'id-2',sm:'sm-2',ger:'ger-aval',acol:'acol-aval',hip:'hip-aval',fer:'fer-aval',puerp:'puerp-aval',ist:'ist-aval',vd:'vd-aval'};
const AUTOMACAO_ALVOS_IDENTIFICACAO={pna:'pna-1',pnc:'pnc-1',pu:'pu-1',prev:'prev-1',id:'id-1',sm:'sm-1',ger:'ger-cad',acol:'acol-cad',hip:'hip-cad',fer:'fer-cad',puerp:'puerp-cad',ist:'ist-cad',vd:'vd-cad'};
function campoAltura(prefix){return document.getElementById(`${prefix}-altura`)||document.getElementById(`${prefix}-alt`)}
function classificacaoImc(imc,prefix){
  if(prefix==='pu')return'IMC calculado; interpretar pela curva de crescimento para idade e sexo.';
  if(imc<18.5)return'Abaixo do peso';if(imc<25)return'Eutrofia';if(imc<30)return'Sobrepeso';if(imc<35)return'Obesidade grau I';if(imc<40)return'Obesidade grau II';return'Obesidade grau III';
}
function calcularImcAutomatico(prefix){
  const peso=document.getElementById(`${prefix}-peso`),altura=campoAltura(prefix),imcEl=document.getElementById(`${prefix}-imc`),status=document.getElementById(`${prefix}-imc-status`);
  if(!peso||!altura||!imcEl)return;
  const p=Number(String(peso.value||'').replace(',','.')),aInformada=Number(String(altura.value||'').replace(',','.')),a=aInformada>3?aInformada/100:aInformada;
  if(!(p>0&&a>0)){imcEl.value='';if(status)status.textContent='Informe peso e altura para calcular automaticamente.';return}
  const imc=p/(a*a),classe=classificacaoImc(imc,prefix);
  imcEl.readOnly=true;imcEl.classList.add('ro');imcEl.value=imcEl.type==='number'?imc.toFixed(1):`${imc.toFixed(1)} kg/m² — ${classe}`;
  if(status)status.textContent=`IMC ${imc.toFixed(1)} kg/m² — ${classe}`;
  if(prefix==='pna'&&typeof avaliarProtocolosPna==='function')avaliarProtocolosPna();
  if(typeof MODULOS_CLINICOS!=='undefined'&&MODULOS_CLINICOS[prefix])avaliarPrioridadeModulo(prefix);
}
function montarAntropometriaAutomatica(prefix){
  const alvo=document.getElementById(AUTOMACAO_ALVOS_CLINICOS[prefix]);if(!alvo)return;
  let peso=document.getElementById(`${prefix}-peso`),altura=campoAltura(prefix),imc=document.getElementById(`${prefix}-imc`);
  if(!peso||!altura||!imc){
    const card=document.createElement('div');card.className='card';card.id=`${prefix}-antropometria-auto`;
    card.innerHTML=`<div class="ct"><span class="dot dg"></span>Antropometria e IMC automático</div><div class="module-form-grid">${peso?'':`<div class="f"><label>Peso (kg)</label><input type="number" id="${prefix}-peso" step="0.1" min="0"></div>`}${altura?'':`<div class="f"><label>Altura (cm ou m)</label><input type="number" id="${prefix}-altura" step="0.01" min="0" placeholder="Ex.: 165 ou 1,65"></div>`}${imc?'':`<div class="f"><label>IMC</label><input type="text" id="${prefix}-imc" class="ro" readonly></div>`}</div><small id="${prefix}-imc-status" style="display:block;margin-top:7px;color:var(--tx3)">Informe peso e altura para calcular automaticamente.</small>`;
    alvo.appendChild(card);
  }else if(!document.getElementById(`${prefix}-imc-status`)){
    const status=document.createElement('small');status.id=`${prefix}-imc-status`;status.style.cssText='display:block;margin-top:7px;color:var(--tx3)';imc.closest('.f')?.appendChild(status);
  }
  peso=document.getElementById(`${prefix}-peso`);altura=campoAltura(prefix);imc=document.getElementById(`${prefix}-imc`);
  if(imc){imc.readOnly=true;imc.classList.add('ro')}
  [peso,altura].forEach(el=>el&&!el.dataset.imcAuto&&(el.dataset.imcAuto='1',el.addEventListener('input',()=>calcularImcAutomatico(prefix))));
  calcularImcAutomatico(prefix);
}
function camposEnderecoPrefixo(prefix){
  if(prefix==='prev')return{cep:'prev-cep',logradouro:'prev-logr',bairro:'prev-bairro',municipio:'prev-mun',uf:null,status:'prev-cep-status'};
  if(prefix==='sinan')return{cep:'sinan-cep',logradouro:'sinan-logradouro',bairro:'sinan-bairro',municipio:'sinan-mun-res',uf:'sinan-uf-res',ibge:'sinan-mun-res-cod',status:null};
  return{cep:`${prefix}-cep`,logradouro:`${prefix}-logradouro`,numero:`${prefix}-numero`,complemento:`${prefix}-complemento`,bairro:`${prefix}-bairro`,municipio:`${prefix}-municipio`,uf:`${prefix}-uf`,status:`${prefix}-cep-status`,endereco:`${prefix}-endereco`};
}
function montarEnderecoAutomatico(prefix){
  const alvo=document.getElementById(AUTOMACAO_ALVOS_IDENTIFICACAO[prefix]);if(!alvo||document.getElementById(`${prefix}-cep`))return;
  const card=document.createElement('div');card.className='card';card.id=`${prefix}-endereco-auto`;card.innerHTML=`<div class="ct"><span class="dot db"></span>Endereço do paciente</div><div class="module-form-grid"><div class="f"><label>CEP</label><input id="${prefix}-cep" class="cep-auto" inputmode="numeric" maxlength="9" placeholder="00000-000"><small id="${prefix}-cep-status"></small></div><div class="f span2"><label>Logradouro</label><input id="${prefix}-logradouro"></div><div class="f"><label>Número</label><input id="${prefix}-numero"></div><div class="f"><label>Complemento</label><input id="${prefix}-complemento"></div><div class="f"><label>Bairro</label><input id="${prefix}-bairro"></div><div class="f"><label>Município</label><input id="${prefix}-municipio"></div><div class="f"><label>UF</label><input id="${prefix}-uf" maxlength="2"></div></div>`;alvo.appendChild(card);
}
function sincronizarEnderecoCompleto(prefix){
  const c=camposEnderecoPrefixo(prefix),dest=document.getElementById(c.endereco);if(!dest)return;
  const v=id=>String(document.getElementById(id)?.value||'').trim(),linha=[v(c.logradouro),v(c.numero),v(c.complemento)].filter(Boolean).join(', '),cidade=[v(c.bairro),v(c.municipio),v(c.uf)].filter(Boolean).join(' - ');
  dest.value=[linha,cidade].filter(Boolean).join(' | ');
}
async function buscarCepAutomatico(prefix){
  const c=camposEnderecoPrefixo(prefix),cepEl=document.getElementById(c.cep),status=c.status&&document.getElementById(c.status),cep=String(cepEl?.value||'').replace(/\D/g,'');
  if(!cep){if(status)status.textContent='';return}if(cep.length!==8){if(status)status.textContent='Informe um CEP com 8 números.';return}
  cepEl.value=cep.replace(/^(\d{5})(\d{3})$/,'$1-$2');if(status)status.textContent='Buscando endereço...';
  try{
    const resposta=await fetchComTimeout(`https://viacep.com.br/ws/${cep}/json/`);if(!resposta.ok)throw new Error('Falha na consulta');const d=await resposta.json();if(d.erro)throw new Error('CEP não encontrado');
    [[c.logradouro,d.logradouro],[c.bairro,d.bairro],[c.municipio,prefix==='prev'?[d.localidade,d.uf].filter(Boolean).join(' / '):d.localidade],[c.uf,d.uf],[c.ibge,d.ibge]].forEach(([id,valor])=>{const el=id&&document.getElementById(id);if(el&&valor)el.value=valor});
    sincronizarEnderecoCompleto(prefix);if(status)status.textContent='Endereço preenchido automaticamente.';showToast('Endereço preenchido pelo CEP.');
  }catch(e){if(status)status.textContent='Não foi possível localizar o CEP. Preencha manualmente.'}
}
function montarAutomacoesBasicas(){
  AUTOMACAO_PREFIXOS.forEach(prefix=>{montarAntropometriaAutomatica(prefix);montarEnderecoAutomatico(prefix)});
  document.querySelectorAll('[id$="-cep"]').forEach(el=>{if(el.dataset.cepAuto)return;const prefix=el.id==='prev-cep'?'prev':el.id==='sinan-cep'?'sinan':el.id.replace(/-cep$/,'');if(prefix==='prev'||prefix==='sinan')return;el.dataset.cepAuto='1';el.addEventListener('blur',()=>buscarCepAutomatico(prefix));el.addEventListener('input',()=>{const n=el.value.replace(/\D/g,'').slice(0,8);el.value=n.length>5?`${n.slice(0,5)}-${n.slice(5)}`:n;if(n.length===8)buscarCepAutomatico(prefix)})});
  AUTOMACAO_PREFIXOS.forEach(prefix=>{const c=camposEnderecoPrefixo(prefix);[c.logradouro,c.numero,c.complemento,c.bairro,c.municipio,c.uf].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>sincronizarEnderecoCompleto(prefix)))});
}

// Segurança clínica, privacidade e auditoria local.
const CLINICAL_SAFETY_VERSION='2026-06-13.1',AUDIT_KEY='esf_auditoria_v1';let inactivityTimer=null;
function registrarAuditoria(acao,detalhe=''){
  const u=typeof getUsuarioAtual==='function'?getUsuarioAtual():CURRENT_USER_PROFILE||{},lista=(()=>{try{return JSON.parse(localStorage.getItem(chaveDadosLocais(AUDIT_KEY))||'[]')}catch(e){return[]}})();
  lista.unshift({data:new Date().toISOString(),usuario:u?.nome||'Não identificado',userId:CURRENT_AUTH_USER_ID||'',acao,detalhe:String(detalhe||'').slice(0,180)});localStorage.setItem(chaveDadosLocais(AUDIT_KEY),JSON.stringify(lista.slice(0,1000)));renderAuditoriaLocal();
}
function renderAuditoriaLocal(){const out=document.getElementById('audit-local-list');if(!out)return;let lista=[];try{lista=JSON.parse(localStorage.getItem(chaveDadosLocais(AUDIT_KEY))||'[]')}catch(e){}out.innerHTML=`<table class="audit-table"><thead><tr><th>Data/hora</th><th>Profissional</th><th>Ação</th><th>Registro</th></tr></thead><tbody>${lista.slice(0,150).map(x=>`<tr><td>${new Date(x.data).toLocaleString('pt-BR')}</td><td>${escTR(x.usuario)}</td><td>${escTR(x.acao)}</td><td>${escTR(x.detalhe)}</td></tr>`).join('')||'<tr><td colspan="4">Nenhum evento registrado neste dispositivo.</td></tr>'}</tbody></table>`}
function montarPainelAuditoria(){
  const fontes=document.getElementById('ed-fontes');if(!fontes||document.getElementById('audit-local-card'))return;const card=document.createElement('div');card.className='card';card.id='audit-local-card';card.innerHTML=`<div class="ct"><span class="dot dr"></span>Trilha de auditoria deste dispositivo</div><div class="alert alert-i">Registra login, logout, abertura, edição, salvamento e exclusão. Para auditoria institucional entre dispositivos, manter autenticação e políticas do banco configuradas.</div><div id="audit-local-list" style="overflow:auto;max-height:430px"></div>`;fontes.appendChild(card);renderAuditoriaLocal();
}
function mostrarTermoResponsabilidade(forcar=false){
  if(!CURRENT_AUTH_USER_ID)return;const chave=`esf_termo_clinico:${CURRENT_AUTH_USER_ID}:${CLINICAL_SAFETY_VERSION}`;if(!forcar&&localStorage.getItem(chave)==='aceito')return;
  let modal=document.getElementById('clinical-safety-modal');if(!modal){modal=document.createElement('div');modal.id='clinical-safety-modal';modal.className='clinical-safety-modal';document.body.appendChild(modal)}
  modal.innerHTML=`<div class="clinical-safety-panel"><h2>Segurança e responsabilidade clínica</h2><p>Este sistema oferece apoio à decisão e organização do registro. Ele não substitui avaliação profissional, protocolo municipal vigente, prescrição legal ou encaminhamento quando indicado.</p><ul><li>Revise achados, contraindicações, alergias, gestação/lactação e contexto clínico antes de registrar a conduta.</li><li>Dados pessoais e de saúde são sensíveis. Acesse somente pacientes relacionados ao seu trabalho e não compartilhe credenciais.</li><li>Itens marcados como <b>Sugestão</b> ou <b>Requer validação</b> devem ser confirmados pelo profissional responsável.</li></ul><label class="clinical-safety-check"><input type="checkbox" id="clinical-safety-accept"> <span>Li, compreendi e assumo responsabilidade pelo uso profissional e pela proteção dos dados acessados.</span></label><button class="btn btn-p" id="clinical-safety-confirm" disabled>Continuar</button></div>`;modal.classList.add('open');const check=document.getElementById('clinical-safety-accept'),btn=document.getElementById('clinical-safety-confirm');check.onchange=()=>btn.disabled=!check.checked;btn.onclick=()=>{localStorage.setItem(chave,'aceito');modal.classList.remove('open');registrarAuditoria('Termo clínico aceito',CLINICAL_SAFETY_VERSION)};
}
function bloquearSessaoLocal(motivo='Sessão bloqueada'){
  try{salvarRascunhoAutomatico();registrarAuditoria('Sessão bloqueada',motivo);}catch(e){}
  sessionStorage.removeItem('esf_sessao_cache');sessionStorage.removeItem('esf_autorizacao_offline');
  localStorage.removeItem('esf_sessao_cache');
  verificarAcesso(null);
}
function resetarInatividade(){
  if(!CURRENT_AUTH_USER_ID)return;
  try{const aut=JSON.parse(sessionStorage.getItem('esf_autorizacao_offline')||'null');if(aut?.uid===CURRENT_AUTH_USER_ID){aut.atividade=Date.now();sessionStorage.setItem('esf_autorizacao_offline',JSON.stringify(aut));}}catch(e){}
  clearTimeout(inactivityTimer);inactivityTimer=setTimeout(async()=>{bloquearSessaoLocal('Inatividade superior a 15 minutos');showToast('Sessão bloqueada por inatividade. Identifique-se novamente.');try{if(_sb)await _sb.auth.signOut();}catch(e){}},15*60*1000);
}

function iniciarSessaoSegura(){['pointerdown','keydown','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,resetarInatividade,{passive:true}));resetarInatividade();mostrarTermoResponsabilidade();montarPainelAuditoria();if(!document.getElementById('clinical-safety-bar')){const bar=document.createElement('div');bar.id='clinical-safety-bar';bar.className='clinical-safety-bar';bar.innerHTML='Apoio à decisão clínica · validar pelo profissional · dados de saúde protegidos pela LGPD · sessão encerra após 15 minutos de inatividade';bar.onclick=()=>mostrarTermoResponsabilidade(true);document.body.appendChild(bar)}}
function campoExtra(id,label,t='text',ops=[]){return t==='textarea'?`<div class="f span2"><label>${label}</label><textarea id="${id}"></textarea></div>`:t==='select'?`<div class="f"><label>${label}</label><select id="${id}"><option value="">—</option>${ops.map(x=>`<option>${x}</option>`).join('')}</select></div>`:`<div class="f"><label>${label}</label><input id="${id}" type="${t}"></div>`}
function adicionarCardClinico(alvo,id,titulo,campos){const area=document.getElementById(alvo);if(!area||document.getElementById(id))return;const c=document.createElement('div');c.className='card';c.id=id;c.innerHTML=`<div class="ct"><span class="dot da"></span>${titulo}</div><div class="module-form-grid">${campos.filter(x=>!document.getElementById(x[0])).map(x=>campoExtra(...x)).join('')}</div>`;area.appendChild(c)}
function completarModulosPrioritarios(){
  adicionarCardClinico('hip-aval','hip-monitoramento-ampliado','Monitoramento cardiovascular, renal e diabetes',[['hip-risco-cv','Risco cardiovascular','select',['Baixo','Intermediário','Alto','Muito alto']],['hip-relacao-albumina-creatinina','Relação albumina/creatinina','text'],['hip-lipidograma','Lipidograma / data','text'],['hip-fundo-olho','Fundo de olho / última avaliação','text'],['hip-avaliacao-renal','Avaliação renal / creatinina e TFG','textarea'],['hip-meta-pactuada','Metas e plano pactuados','textarea']]);
  adicionarCardClinico('puerp-aval','puerp-consulta-ampliada','Consulta puerperal ampliada',[['puerp-loquios','Lóquios','select',['Fisiológicos','Aumentados','Odor alterado','Não avaliados']],['puerp-pega','Pega e posicionamento','select',['Adequados','Necessitam apoio','Não avaliados']],['puerp-contracepcao','Contracepção / método desejado','text'],['puerp-revisao-parto','Revisão do parto e intercorrências','textarea']]);
  adicionarCardClinico('ist-aval','ist-aconselhamento','Aconselhamento e seguimento',[['ist-pre-teste','Aconselhamento pré-teste','textarea'],['ist-pos-teste','Aconselhamento pós-teste','textarea'],['ist-janela','Janela imunológica / exposição recente','textarea'],['ist-complementares','Testes complementares necessários','textarea'],['ist-seguimento','Seguimento pactuado','textarea']]);
  adicionarCardClinico('prev-2','prev-historico-rastreamento','Histórico de rastreamento e antecedentes cervicais',[['prev-ultimo-exame','Data do último preventivo','date'],['prev-resultado-anterior','Resultado anterior','textarea'],['prev-nic-anterior','NIC / lesão cervical anterior','select',['Não','Sim','Não sabe']],['prev-colposcopia','Colposcopia ou tratamento anterior','textarea'],['prev-hpv','Histórico de HPV','select',['Não','Sim','Não sabe']],['prev-histerectomia','Histerectomia','select',['Não','Sim — colo mantido','Sim — colo removido']],['prev-sangramento-pos-coito','Sangramento pós-coito','select',['Não','Sim']],['prev-dor-pelvica','Dor pélvica','select',['Não','Sim']]]);
  adicionarCardClinico('id-4','id-seguranca-ampliada','Segurança, medicamentos e necessidades ampliadas',[['id-interacoes','Possíveis interações / revisão medicamentosa','textarea'],['id-benzodiazepinico','Uso de benzodiazepínico','select',['Não','Sim']],['id-seguranca-domicilio','Segurança no domicílio','textarea'],['id-saude-bucal','Saúde bucal','select',['Sem queixa','Necessita avaliação','Em acompanhamento']],['id-incontinencia','Incontinência urinária','select',['Não','Sim']],['id-sono','Sono','text'],['id-dor-cronica','Dor crônica','textarea']]);
  adicionarCardClinico('sm-2','sm-crise-ampliada','Avaliação de crise e plano de segurança',[['sm-ideacao-atual','Ideação suicida atual','select',['Não','Sim']],['sm-plano-suicida','Plano definido','select',['Não','Sim']],['sm-meio-disponivel','Meio disponível / acesso','textarea'],['sm-tentativa-previa','Tentativa prévia / automutilação','textarea'],['sm-intoxicacao-abstinencia','Intoxicação ou abstinência','textarea'],['sm-violencia-risco','Risco de violência','textarea'],['sm-rede-crise','Rede de apoio disponível','textarea'],['sm-contato-emergencia','Contato de emergência','text'],['sm-plano-seguranca','Plano de segurança pactuado','textarea']]);
}

// Checklist antes de salvar qualquer consulta.
function avaliarChecklistSalvar(tipo){const cfg=MODULOS_ATENDIMENTO[tipo],pg=document.getElementById('pg-'+cfg.page),p=cfg.prefix,texto=id=>String(document.getElementById(id)?.value||'').trim(),tem=rx=>Array.from(pg.querySelectorAll('input,select,textarea')).some(e=>rx.test(e.id)&&String(e.value||'').trim()),soap=cfg.soap.map(texto).join(' ');return[['Sinais vitais preenchidos?',tem(/-(pa|fc|fr|sat|temp|glicemia)/)],['Alergias registradas?',tem(/alerg/i)],['Medicamentos em uso registrados?',tem(/medic/i)],['Queixa principal preenchida?',tem(/queixa|motivo/i)||!!texto(cfg.soap[0])],['Exame físico registrado?',tem(/exame-guiado|ef-|exame/i)||!!texto(cfg.soap[1])],['Conduta registrada?',tem(/conduta/i)||!!texto(cfg.soap[3])],['Orientações registradas?',tem(/orient/i)||/orient/i.test(soap)],['Retorno definido?',tem(/retorno/i)||/retorno/i.test(soap)],['Encaminhamento registrado, se necessário?',tem(/encaminh/i)||/encaminh/i.test(soap)],['Sinais de alerta orientados?',tem(/sinais-alerta/i)||/sinais de alerta/i.test(soap)],['Paciente/família compreendeu as orientações?',!!texto(`${p}-pc-pactuada`)]]}
function abrirChecklistPreSalvar(tipo){return new Promise(resolve=>{let m=document.getElementById('pre-save-modal');if(!m){m=document.createElement('div');m.id='pre-save-modal';m.className='edit-modal';document.body.appendChild(m)}const itens=avaliarChecklistSalvar(tipo),pend=itens.filter(x=>!x[1]).length;m.innerHTML=`<div class="edit-panel" style="max-width:740px"><h3>Checklist antes de salvar</h3><p>${pend?`Existem ${pend} campos importantes não preenchidos. É possível salvar após revisão profissional.`:'Itens principais conferidos.'}</p><div class="pre-save-list">${itens.map(x=>`<div class="pre-save-item ${x[1]?'ok':'pending'}">${x[1]?'✓':'○'} ${x[0]}</div>`).join('')}</div><label class="pre-save-review"><input type="checkbox" id="pre-save-review-ok"> <span>Declaro que revisei as informações e validei a conduta registrada.</span></label><div class="edit-actions"><button class="btn btn-p" id="pre-save-confirm" disabled>Salvar atendimento</button><button class="edit-cancel-btn" id="pre-save-cancel">Voltar e revisar</button></div></div>`;m.classList.add('open');const chk=m.querySelector('#pre-save-review-ok'),btn=m.querySelector('#pre-save-confirm');chk.onchange=()=>btn.disabled=!chk.checked;btn.onclick=()=>{m.classList.remove('open');resolve(true)};m.querySelector('#pre-save-cancel').onclick=()=>{m.classList.remove('open');resolve(false)}})}

document.addEventListener('DOMContentLoaded',()=>{montarModulosClinicos();montarPrioridadeExistentes();montarComplementosManuaisSoap();montarCentralProtocolar();montarAutomacoesBasicas();completarModulosPrioritarios();montarCentralPNI();montarAvaliadoresVacinais();montarLeitoresLivres();montarPainelAuditoria();renderAuditoriaProtocolos();rodarAuditoriaClinica();atualizarAcaoGlicosimetroSoapPN()});
