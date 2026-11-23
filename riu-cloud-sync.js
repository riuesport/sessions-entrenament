/* RIU · Desament privat compartit. Supabase Auth + RLS + versió optimista.
 * Mai no desa ni publica fitxes privades a GitHub.
 * Sense configuració, la versió HTML anterior continua en mode local.
 */
(() => {
  'use strict';
  const cfg = window.RIU_CLOUD_CONFIG || {};
  if (!cfg.url || !cfg.publishableKey) {
    const warning=document.createElement('div');
    warning.setAttribute('role','status');
    warning.style.cssText='padding:10px 22px;background:#fff4db;color:#795321;border-bottom:1px solid #eed49a;font:13px/1.45 Arial,sans-serif';
    warning.textContent='RIU: desament només local en aquest navegador. El desament privat compartit encara està pendent de configurar.';
    const nav=document.getElementById('nav');
    if(nav)nav.insertAdjacentElement('afterend',warning);
    console.info('RIU: mode local. El desament privat encara no està configurat.');
    return;
  }

  const state = {
    client: null, ready: false, version: 0, session: null,
    dirty: false, saving: false, conflict: false, loading: false,
    timer: null, poll: null, lastJSON: null, ignored: false
  };
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const gate = document.createElement('div'); gate.id = 'riu-cloud-gate';
  const bar = document.createElement('div'); bar.id = 'riu-cloud-bar';
  const nav = $('nav');
  if(nav) nav.insertAdjacentElement('afterend',bar);
  document.body.append(gate);

  const bridge = window.RIUCloudBridge = {
    enabled: true, getStatus: () => ({ready:state.ready,dirty:state.dirty,revision:state.version,conflict:state.conflict}),
    markDirty(){
      if(!state.ready || state.loading) return;
      state.dirty = true;
      status('● Canvis pendents de desar…');
      clearTimeout(state.timer);
      if(!state.conflict) state.timer = setTimeout(() => saveCloud(),1400);
    },
    save: () => saveCloud(), load: () => reloadFromCloud(true)
  };

  function status(message, danger=false) {
    const label=$('riu-cloud-state');
    if(label){label.textContent=message;label.style.color=danger?'#ae2836':'#073553';}
  }
  function renderBar(){
    const user=state.session?.user?.email ?? '';
    bar.innerHTML = `<div><strong>☁ RIU · Espai privat</strong> <span id="riu-cloud-state" style="margin-left:10px"></span>${user?`<small style="margin-left:8px;color:#4f6876">${esc(user)}</small>`:''}</div><div style="display:flex;flex-wrap:wrap;gap:7px"><button type="button" id="riu-cloud-save">Desar ara</button><button type="button" id="riu-cloud-load">Actualitzar</button><button type="button" id="riu-cloud-export">Còpia JSON</button><button type="button" id="riu-cloud-out">Sortir</button></div>`;
    $('riu-cloud-save').onclick=()=>saveCloud(true);
    $('riu-cloud-load').onclick=()=>reloadFromCloud(true);
    $('riu-cloud-export').onclick=()=>backup();
    $('riu-cloud-out').onclick=()=>logout();
    status(state.ready?`✓ Sincronitzat · versió ${state.version}`:'Connectant…');
  }
  function showGate(body){
    document.documentElement.classList.add('riu-cloud-locked');
    gate.style.display='flex';gate.innerHTML=`<div class="riu-gate-card"><h2>RIU · Accés privat</h2>${body}</div>`;
  }
  function showLogin(error=''){
    showGate(`<p class="intro">Accés exclusiu per als entrenadors autoritzats. Les sessions i les fitxes es desen en una base privada compartida.</p><form id="riu-cloud-login"><label for="riu-cloud-email">Correu electrònic</label><input id="riu-cloud-email" type="email" autocomplete="username" required><label for="riu-cloud-password">Contrasenya</label><input id="riu-cloud-password" type="password" autocomplete="current-password" required><button id="riu-cloud-submit" type="submit">Entrar al planificador</button><p id="riu-cloud-error" class="error">${esc(error)}</p></form><small>No es permet crear comptes des d'aquesta pantalla. Els accessos els gestiona RIU.</small>`);
    $('riu-cloud-login').onsubmit=async ev=>{
      ev.preventDefault();
      const submit=$('riu-cloud-submit');submit.disabled=true;submit.textContent='Verificant…';
      const email=$('riu-cloud-email').value.trim(),password=$('riu-cloud-password').value;
      try{
        const {data:res,error:e}=await state.client.auth.signInWithPassword({email,password});
        if(e)throw e;
        state.session=res.session;
        await enterPrivateSpace();
      }catch(err){const e=$('riu-cloud-error');if(e)e.textContent='No es pot accedir: '+err.message;}
      finally{if(submit.isConnected){submit.disabled=false;submit.textContent='Entrar al planificador';}}
    };
  }
  function showProblem(title,body,allowExit=true){
    showGate(`<p class="intro">${esc(title)}</p><p>${esc(body)}</p>${allowExit?'<button id="riu-cloud-problem-exit">Tancar sessió</button>':''}`);
    if(allowExit)$('riu-cloud-problem-exit').onclick=()=>logout();
  }
  function showInitialize(){
    showGate(`<p class="intro">És la primera vegada que s'obre l'espai compartit de RIU. Encara no s'han desat dades a la base privada.</p><p>Inicialitza'l amb la programació que ja inclou aquest HTML: sis mesocicles, exercicis, dissabtes, gent gran i readaptació. Després podràs importar una còpia JSON si tens modificacions anteriors.</p><button id="riu-cloud-init">Crear l'espai compartit</button> <button type="button" id="riu-cloud-init-out" style="background:#e9f2f7;color:#123a53">Sortir</button><p id="riu-cloud-init-error" class="error"></p>`);
    $('riu-cloud-init-out').onclick=()=>logout();
    $('riu-cloud-init').onclick=async()=>{
      $('riu-cloud-init').disabled=true;
      try {
        const snapshot=preparedSnapshot();
        const serialized=JSON.stringify(snapshot);
        const {data:next,error}=await state.client.rpc('riu_write',{p_expected_version:0,p_payload:snapshot});
        if(error)throw error;
        state.version=Number(next);state.lastJSON=serialized;
        state.ready=true;state.dirty=false;state.conflict=false;
        openApp();
      }catch(e){const el=$('riu-cloud-init-error');if(el)el.textContent='No s’ha pogut inicialitzar: '+e.message+' (comprova permisos i SQL).';$('riu-cloud-init').disabled=false;}
    };
  }
  function preparedSnapshot(){
    const snapshot=JSON.parse(JSON.stringify(data));
    for(const exercise of [...(snapshot.exercises||[]),...(snapshot.motor||[])]){
      if(typeof exercise.media==='string'&&exercise.media.startsWith('riu-photo:')){
        // Las fotos locales no deben confundirse con fotos compartidas.
        const photo=typeof photoCache!=='undefined'?photoCache.get(exercise.id):null;
        if(photo) exercise.media=photo;
        else exercise.media='';
      }
    }
    return snapshot;
  }
  function validateSnapshot(value){
    return value&&typeof value==='object'&&Array.isArray(value.months)&&Array.isArray(value.exercises)&&Array.isArray(value.motor);
  }
  function applySnapshot(remote){
    if(!validateSnapshot(remote))throw Error('La versió del servidor no conté un planificador RIU vàlid.');
    state.loading=true;
    try {
      data=JSON.parse(JSON.stringify(remote));
      if(view==='riu' && window.RIUPlanner){
        const screen=window.RIUPlanner.getState()?.screen || 'readaptacio';
        window.RIUPlanner.open(screen);
      }else{
        render();
      }
    } finally {state.loading=false;}
  }
  function openApp(){
    gate.style.display='none'; gate.innerHTML='';
    document.documentElement.classList.remove('riu-cloud-locked');
    renderBar();
    status(`✓ Desat al núvol · versió ${state.version}`);
    startPolling();
  }
  async function queryRemote(){
    const {data:remote,error}=await state.client.from('riu_data').select('version,payload,updated_at').eq('id','main').maybeSingle();
    if(error)throw error;
    return remote;
  }
  async function enterPrivateSpace(){
    state.ready=false;clearTimeout(state.timer);
    showGate('<p class="intro">Connectant amb la base de dades privada de RIU…</p>');
    try{
      const userId=state.session?.user?.id;
      if(!userId)throw Error('No hi ha cap sessió iniciada.');
      const {data:member,error:membersError}=await state.client.from('riu_members').select('user_id').eq('user_id',userId).maybeSingle();
      if(membersError)throw membersError;
      if(!member){showProblem('Compte sense permisos','El teu usuari encara no està autoritzat a la base de dades de RIU. Un administrador ha d’afegir-lo a riu_members.');return;}
      const remote=await queryRemote();
      if(!remote){state.version=0;showInitialize();return;}
      applySnapshot(remote.payload);
      state.version=Number(remote.version);
      state.lastJSON=JSON.stringify(preparedSnapshot());
      state.ready=true;state.dirty=false;state.conflict=false;
      openApp();
    }catch(err){showProblem('Error de connexió o configuració',err.message+' · Comprova la URL pública de Supabase, la clau i les taules SQL.');}
  }
  async function saveCloud(manual=false){
    if(!state.ready||state.saving||state.conflict)return;
    clearTimeout(state.timer);
    const snapshot=preparedSnapshot(),serialized=JSON.stringify(snapshot);
    if(serialized===state.lastJSON){state.dirty=false;status(`✓ Tot desat · versió ${state.version}`);return;}
    state.saving=true;state.dirty=true;status('☁ Desant canvis…');
    try{
      const {data:next,error}=await state.client.rpc('riu_write',{p_expected_version:state.version,p_payload:snapshot});
      if(error)throw error;
      state.version=Number(next);state.lastJSON=serialized;
      state.dirty=JSON.stringify(preparedSnapshot())!==serialized;
      status(state.dirty?'● Hi ha més canvis per desar':`✓ Desat al núvol · versió ${state.version}`);
    }catch(err){
      state.dirty=true;
      if(/RIU_CONFLICT|40001/i.test(err.message||'')||String(err.code)==='40001'){
        state.conflict=true;
        status('⚠ Conflicte: algú ha canviat la programació. Exporta una còpia i prem Actualitzar.',true);
        alert('RIU: s’han detectat canvis publicats per l’altre entrenador. NO s’han sobreescrit. Exporta una còpia JSON dels teus canvis i prem Actualitzar per carregar la nova versió.');
      }else{
        status('⚠ No s’han desat els canvis. Revisa la connexió i prem Desar ara.',true);
        if(manual)alert('Error en desar al núvol: '+err.message);
      }
    }finally{
      state.saving=false;
      if(state.dirty&&!state.conflict&&serialized===state.lastJSON){state.timer=setTimeout(()=>saveCloud(),1700)}
    }
  }
  async function reloadFromCloud(manual=false){
    if(!state.session||state.saving)return;
    if(state.dirty){
      if(!manual)return;
      if(!confirm('Tens canvis locals no desats. Actualitzar-los els descartaria. Fes primer una còpia JSON. Vols continuar?'))return;
    }
    const oldDirty=state.dirty;
    try{
      state.loading=true;
      const remote=await queryRemote();
      if(!remote)throw Error('No hi ha dades inicialitzades.');
      if(state.dirty && !manual)return;
      state.conflict=false;state.dirty=false;
      applySnapshot(remote.payload);
      state.version=Number(remote.version);state.lastJSON=JSON.stringify(preparedSnapshot());
      status(`✓ Actualitzat des del núvol · versió ${state.version}`);
    }catch(e){state.dirty=oldDirty;status('Error en actualitzar: '+e.message,true)}finally{state.loading=false;}
  }
  function startPolling(){
    clearInterval(state.poll);
    state.poll=setInterval(async()=>{
      if(!state.ready||!state.session||state.loading||state.saving)return;
      try{
        const {data:row,error}=await state.client.from('riu_data').select('version').eq('id','main').maybeSingle();
        if(error||!row)return;
        if(Number(row.version)!==state.version){
          if(state.dirty||state.conflict){state.conflict=true;status('⚠ Altres canvis al núvol. Exporta una còpia i prem Actualitzar.',true);}
          else await reloadFromCloud(false);
        }
      }catch(_e){}
    },15000);
  }
  function backup(){
    try{
      const blob=new Blob([JSON.stringify(preparedSnapshot(),null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='RIU_copia_privada_'+new Date().toISOString().slice(0,10)+'.json';
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    }catch(e){alert('Error en exportar: '+e.message)}
  }
  async function logout(){
    clearInterval(state.poll);clearTimeout(state.timer);
    if(state.dirty&&!confirm('Hi ha canvis sense desar. Tanca la sessió igualment?'))return;
    state.ready=false;state.dirty=false;state.conflict=false;state.lastJSON=null;state.version=0;state.session=null;
    data=JSON.parse(JSON.stringify(DEFAULT_DATA));
    const app=document.getElementById('app'),modal=document.getElementById('modal');
    if(app)app.replaceChildren();
    if(modal)modal.replaceChildren();
    bar.innerHTML='';
    showLogin();
    await state.client.auth.signOut();
  }
  async function loadSDK(){
    if(window.supabase?.createClient)return;
    await new Promise((resolve,reject)=>{
      const src=document.createElement('script');src.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      src.onload=()=>resolve();src.onerror=()=>reject(Error('No es pot carregar la llibreria de Supabase.'));
      document.head.append(src);
    });
    if(!window.supabase?.createClient)throw Error('La llibreria de Supabase no ha carregat.');
  }
  async function start(){
    showGate('<p class="intro">Preparant la connexió segura…</p>');
    try{
      await loadSDK();
      state.client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'riu-cloud-session-v1'}});
      const {data:initial,error}=await state.client.auth.getSession();
      if(error)throw error;
      if(initial?.session){state.session=initial.session;await enterPrivateSpace();}
      else showLogin();
      state.client.auth.onAuthStateChange((event,session)=>{
        // Supabase recommends not awaiting DB requests synchronously inside this callback.
        if(event==='SIGNED_OUT'){
          state.session=null;
          state.ready=false;
          clearInterval(state.poll);
          data=JSON.parse(JSON.stringify(DEFAULT_DATA));
          document.getElementById('app')?.replaceChildren();
          document.getElementById('modal')?.replaceChildren();
          showLogin();
        }else if(event==='TOKEN_REFRESHED'){
          state.session=session;
        }
      });
    }catch(e){showProblem('No s’ha pogut iniciar el desament privat',e.message+' · Fins que el servei no funcioni, les fitxes no es desaran al núvol.',false);}
  }
  window.addEventListener('beforeunload',ev=>{
    if(state.dirty){ev.preventDefault();ev.returnValue='Tens canvis encara no desats al núvol.';}
  });
  start();
})();