import{b as u,c as f,n as b}from"./index-CKszgeZc.js";import{m as y,I as w}from"./nav-CaL1R5qX.js";const x="BNxx-vzPooERleLp7DPREp4Pbkd5NtYUnKKu-1Vw3yyy8_CrJ0LL0IOPP52ErOcBt0OgXywpc0_hN_Hd0X6y2E0";async function j(e,t){var o,r;e.innerHTML=`
<div class="wv-wrap">
  <div class="wv-body">
    <!-- Profile + position card -->
    <div class="wv-profile-card">
      <div class="wv-avatar">${(t.full_name||"T").charAt(0).toUpperCase()}</div>
      <div>
        <div class="wv-pname">${t.full_name||"Trabajador"}</div>
        <div class="wv-pmeta">DNI ${t.dni} &middot; ${((o=t.company)==null?void 0:o.name)||""}</div>
      </div>
      <div class="wv-pos-badge" id="wvPosBadge">Cargando puesto…</div>
    </div>

    <!-- Today's schedule -->
    <div class="wv-section" id="wvSectionSchedule">
      <h2 class="wv-section-title">Programa de hoy</h2>
      <div id="wvSchedule" class="wv-schedule-wrap"><div class="wv-loading">Cargando…</div></div>
    </div>

    <!-- Push notification section (shown when worker has a position) -->
    <div id="wvPushWrap" class="wv-push-wrap" style="display:none">

      <!-- State: not enabled -->
      <div id="wvPushOff">
        <div class="wv-push-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="wv-push-copy">
          <div class="wv-push-title">Recibir alertas de pausa todos los días</div>
          <div class="wv-push-sub">Activa una vez. El sistema te enviará una notificación en tu pantalla cuando llegue cada pausa — sin tener que abrir esta página.</div>
        </div>
        <button class="wv-btn-push-on" id="wvActivate">Activar alertas</button>
        <div id="wvPushError" class="wv-push-error" style="display:none"></div>
      </div>

      <!-- State: enabled -->
      <div id="wvPushOn" style="display:none">
        <div class="wv-push-active-row">
          <div class="wv-push-active-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Alertas activas
          </div>
          <div class="wv-push-active-copy">Recibirás una notificación en tu pantalla en cada pausa, todos los días.</div>
          <button class="wv-btn-push-off" id="wvDeactivate">Desactivar</button>
        </div>
      </div>

    </div>

    <!-- 7-day history -->
    <div class="wv-section" id="wvSectionHistory" style="display:none">
      <h2 class="wv-section-title">Historial reciente (7 días)</h2>
      <div id="wvHistory" class="wv-history"><div class="wv-loading">Cargando…</div></div>
    </div>
  </div>
</div>`,L();const a=y(e.querySelector(".wv-wrap"),{user:{name:t.full_name||"Trabajador",roleLabel:((r=t.company)==null?void 0:r.name)||"Trabajador"},items:[{key:"schedule",icon:w.calendar,label:"Mi horario",onClick:()=>i("schedule")},{key:"history",icon:w.history,label:"Historial",onClick:()=>i("history")},{key:"alerts",icon:w.bell,label:"Alertas",onClick:()=>i("alerts")}],onLogout:async()=>{await f(),b("/login")}});function i(s){e.querySelector("#wvSectionSchedule").style.display=s==="schedule"?"":"none",e.querySelector("#wvSectionHistory").style.display=s==="history"?"":"none",e.querySelector("#wvPushWrap").style.display=s==="alerts"?"":"none",a.setActive(s)}e.querySelector("#wvSectionHistory").style.display="none",await m(e,t,a,i)}async function m(e,t,a,i){const{data:o}=await u.from("worker_assignments").select("job_position_id, job_positions(id, name, result)").eq("worker_id",t.id).order("assigned_at",{ascending:!1}).limit(1).maybeSingle(),r=o==null?void 0:o.job_positions,s=e.querySelector("#wvPosBadge");r?(s.textContent=r.name,s.classList.add("wv-pos-active"),k(e,r.result),S(e,t,i,a,r.result)):(s.textContent="Sin puesto asignado",e.querySelector("#wvSchedule").innerHTML='<div class="wv-empty">Aún no tienes un puesto asignado. Comunícate con tu administrador.</div>'),await E(e,t.id)}function g(e){const t=Math.floor(e/60)%24,a=e%60;return String(t).padStart(2,"0")+":"+String(a).padStart(2,"0")}function k(e,t){var r;const a=(t==null?void 0:t.pausas)||[],i=((r=t==null?void 0:t.config)==null?void 0:r.horaIni)??7,o=e.querySelector("#wvSchedule");if(a.length===0){o.innerHTML='<div class="wv-empty">No se encontraron pausas configuradas para este puesto.</div>';return}o.innerHTML=`
    <div class="wv-schedule-list">
      ${a.map((s,d)=>{const l=g(i*60+s.at),c=g(i*60+s.at+s.dur);return`
        <div class="wv-schedule-item">
          <div class="wv-sched-num">${d+1}</div>
          <div class="wv-sched-time">${l} – ${c}</div>
          <div class="wv-sched-dur">${s.dur} min</div>
          <div class="wv-sched-status" id="wvSchedStatus${d}">
            <span class="wv-dot"></span>
            Programada
          </div>
        </div>`}).join("")}
    </div>`}function S(e,t,a,i,o){const r=e.querySelector("#wvPushWrap"),s=e.querySelector("#wvPushOff"),d=e.querySelector("#wvPushOn");function l(){s.style.display="none",d.style.display=""}function c(){s.style.display="",d.style.display="none"}t.alerts_enabled?l():c(),r.style.display="",a("schedule"),e.querySelector("#wvActivate").addEventListener("click",async()=>{var h;const n=e.querySelector("#wvPushError"),v=e.querySelector("#wvActivate");if(n.style.display="none",!("serviceWorker"in navigator)||!("PushManager"in window)){n.textContent="Tu navegador no soporta notificaciones push. Usa Chrome, Edge o Firefox.",n.style.display="";return}if(Notification.permission==="denied"){n.textContent="Las notificaciones están bloqueadas en tu navegador. Habilítalas en la configuración del sitio.",n.style.display="";return}if(Notification.permission!=="granted"){v.disabled=!0,v.textContent="Esperando permiso…";const p=await Notification.requestPermission();if(v.disabled=!1,v.textContent="Activar alertas",p!=="granted"){n.textContent="Necesitas permitir las notificaciones para activar las alertas.",n.style.display="";return}}l(),(h=window.workerActivateAlerts)==null||h.call(window,o),_(t.id).then(p=>{p&&(c(),n.textContent=p,n.style.display="")})}),e.querySelector("#wvDeactivate").addEventListener("click",()=>{c(),C(t.id)})}function P(e){const t="=".repeat((4-e.length%4)%4),a=(e+t).replace(/-/g,"+").replace(/_/g,"/"),i=atob(a);return Uint8Array.from([...i].map(o=>o.charCodeAt(0)))}async function _(e){try{const a=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:P(x)}),{error:i}=await u.from("profiles").update({alerts_enabled:!0,push_subscription:a.toJSON()}).eq("id",e);return i?i.message:null}catch(t){return t.message||"Error al registrar las alertas. Recarga e intenta de nuevo."}}async function C(e){try{if("serviceWorker"in navigator){const t=await Promise.race([navigator.serviceWorker.ready,new Promise((i,o)=>setTimeout(()=>o(new Error("timeout")),5e3))]),a=await Promise.race([t.pushManager.getSubscription(),new Promise((i,o)=>setTimeout(()=>o(new Error("timeout")),5e3))]);a&&await Promise.race([a.unsubscribe(),new Promise(i=>setTimeout(i,5e3))])}}catch{}try{await u.from("profiles").update({alerts_enabled:!1,push_subscription:null}).eq("id",e)}catch{}}async function E(e,t){const a=new Date(Date.now()-6048e5).toISOString(),{data:i}=await u.from("break_events").select("action, created_at, job_positions(name)").eq("worker_id",t).gte("created_at",a).order("created_at",{ascending:!1}),o=e.querySelector("#wvHistory");if(!i||i.length===0){o.innerHTML='<div class="wv-empty">No hay registros en los últimos 7 días.</div>';return}o.innerHTML=`
    <div class="wv-history-list">
      ${i.map(r=>{var d;const s=new Date(r.created_at);return`<div class="wv-hist-row">
          <div class="wv-hist-status wv-hist-${r.action}">${q(r.action)}</div>
          <div class="wv-hist-info">
            <div class="wv-hist-label">${z(r.action)}</div>
            <div class="wv-hist-date">${s.toLocaleDateString("es-PE")} ${s.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <div class="wv-hist-pos">${((d=r.job_positions)==null?void 0:d.name)||""}</div>
        </div>`}).join("")}
    </div>`}function q(e){return e==="completed"?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>':e==="skipped"?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d97706" stroke-width="2"/><path d="M12 8v4l3 3" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg>'}function z(e){return{completed:"Completada",skipped:"Saltada",postponed:"Pospuesta"}[e]||e}function L(){if(document.getElementById("wvStyles"))return;const e=document.createElement("style");e.id="wvStyles",e.textContent=`
    .wv-wrap { min-height:100vh;background:var(--bg); }
    .wv-body { max-width:640px;margin:0 auto;padding:24px 20px; }
    .wv-profile-card { background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.07);display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap; }
    .wv-avatar { width:52px;height:52px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;flex-shrink:0; }
    .wv-pname { font-size:16px;font-weight:800;color:var(--navy); }
    .wv-pmeta { font-size:12px;color:var(--slate);margin-top:2px; }
    .wv-pos-badge { margin-left:auto;font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;background:var(--slate-light);color:var(--slate);flex-shrink:0; }
    .wv-pos-active { background:var(--blue-light);color:var(--blue); }
    .wv-section { margin-bottom:24px; }
    .wv-section-title { font-size:15px;font-weight:800;color:var(--navy);margin-bottom:12px; }
    .wv-schedule-wrap { background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden; }
    .wv-schedule-item { display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--border); }
    .wv-schedule-item:last-child { border-bottom:none; }
    .wv-sched-num { width:24px;height:24px;border-radius:50%;background:var(--blue-light);color:var(--blue);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0; }
    .wv-sched-time { font-size:15px;font-weight:800;color:var(--navy);min-width:56px; }
    .wv-sched-dur { font-size:12px;color:var(--slate);min-width:48px; }
    .wv-sched-status { display:flex;align-items:center;gap:6px;font-size:12px;color:var(--slate);margin-left:auto; }
    .wv-dot { width:6px;height:6px;border-radius:50%;background:var(--border); }
    /* Push notification card */
    .wv-push-wrap { background:#fff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);padding:20px;margin-bottom:24px; }
    #wvPushOff { display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px; }
    .wv-push-icon { width:56px;height:56px;border-radius:16px;background:var(--blue-light);color:var(--blue);display:flex;align-items:center;justify-content:center; }
    .wv-push-title { font-size:15px;font-weight:800;color:var(--navy);margin-bottom:4px; }
    .wv-push-sub { font-size:13px;color:var(--slate);line-height:1.6; }
    .wv-btn-push-on { padding:12px 28px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;width:100%; }
    .wv-btn-push-on:hover { background:#1d4ed8; }
    .wv-btn-push-on:disabled { opacity:.6;cursor:not-allowed; }
    .wv-push-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:9px 13px;font-size:13px;width:100%;box-sizing:border-box; }
    .wv-push-active-row { display:flex;flex-direction:column;gap:10px; }
    .wv-push-active-badge { display:inline-flex;align-items:center;gap:6px;background:#d1fae5;color:#059669;font-size:13px;font-weight:700;padding:6px 14px;border-radius:20px;width:fit-content; }
    .wv-push-active-copy { font-size:13px;color:var(--slate);line-height:1.6; }
    .wv-btn-push-off { padding:9px 16px;background:var(--slate-light);color:var(--slate);border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;width:fit-content;transition:all .15s; }
    .wv-btn-push-off:hover { background:#fef2f2;color:#dc2626;border-color:#fecaca; }
    .wv-btn-push-off:disabled { opacity:.6;cursor:not-allowed; }
    /* History */
    .wv-history { background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden; }
    .wv-hist-row { display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--border); }
    .wv-hist-row:last-child { border-bottom:none; }
    .wv-hist-status { width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .wv-hist-completed { background:var(--green-light); }
    .wv-hist-skipped { background:#fef2f2; }
    .wv-hist-postponed { background:#fefce8; }
    .wv-hist-label { font-size:13px;font-weight:700;color:var(--navy); }
    .wv-hist-date { font-size:11px;color:var(--slate);margin-top:1px; }
    .wv-hist-pos { margin-left:auto;font-size:11px;color:var(--slate);text-align:right; }
    .wv-loading,.wv-empty { padding:24px;text-align:center;font-size:14px;color:var(--slate); }
  `,document.head.appendChild(e)}export{j as renderWorker};
