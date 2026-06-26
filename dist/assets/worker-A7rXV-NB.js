import{b as w,n as g,a as v}from"./index-D5YiH_BL.js";async function k(t,e){var i;t.innerHTML=`
<div class="wv-wrap">
  <header class="wv-header">
    <div class="wv-header-inner">
      <div class="wv-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fff" stroke-width="2"/>
        </svg>
        <span>PausasLab</span>
      </div>
      <div class="wv-header-right">
        <span class="wv-worker-name">${e.full_name||"Trabajador"}</span>
        <button class="wv-logout" id="wvLogout">Salir</button>
      </div>
    </div>
  </header>

  <div class="wv-body">
    <!-- Profile + position card -->
    <div class="wv-profile-card">
      <div class="wv-avatar">${(e.full_name||"T").charAt(0).toUpperCase()}</div>
      <div>
        <div class="wv-pname">${e.full_name||"Trabajador"}</div>
        <div class="wv-pmeta">DNI ${e.dni} &middot; ${((i=e.company)==null?void 0:i.name)||""}</div>
      </div>
      <div class="wv-pos-badge" id="wvPosBadge">Cargando puesto…</div>
    </div>

    <!-- Today's schedule -->
    <div class="wv-section">
      <h2 class="wv-section-title">Programa de hoy</h2>
      <div id="wvSchedule" class="wv-schedule-wrap"><div class="wv-loading">Cargando…</div></div>
    </div>

    <!-- Activate button -->
    <div id="wvActivateWrap" class="wv-activate-wrap" style="display:none">
      <button class="wv-btn-activate" id="wvActivate">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/></svg>
        Activar alertas para hoy
      </button>
      <p class="wv-activate-hint">Recibirás una notificación visual cuando llegue el momento de tu pausa.</p>
    </div>

    <!-- 7-day history -->
    <div class="wv-section">
      <h2 class="wv-section-title">Historial reciente (7 días)</h2>
      <div id="wvHistory" class="wv-history"><div class="wv-loading">Cargando…</div></div>
    </div>
  </div>
</div>`,m(),t.querySelector("#wvLogout").addEventListener("click",async()=>{await w(),g("/login")}),await h(t,e)}async function h(t,e){const{data:i}=await v.from("worker_assignments").select("job_position_id, job_positions(id, name, result)").eq("worker_id",e.id).order("assigned_at",{ascending:!1}).limit(1).maybeSingle(),a=i==null?void 0:i.job_positions,o=t.querySelector("#wvPosBadge");a?(o.textContent=a.name,o.classList.add("wv-pos-active"),u(t,a.result)):(o.textContent="Sin puesto asignado",t.querySelector("#wvSchedule").innerHTML='<div class="wv-empty">Aún no tienes un puesto asignado. Comunícate con tu administrador.</div>'),await f(t,e.id)}function c(t){const e=Math.floor(t/60)%24,i=t%60;return String(e).padStart(2,"0")+":"+String(i).padStart(2,"0")}function u(t,e){var r;const i=(e==null?void 0:e.pausas)||[],a=((r=e==null?void 0:e.config)==null?void 0:r.horaIni)??7,o=t.querySelector("#wvSchedule"),s=t.querySelector("#wvActivateWrap");if(i.length===0){o.innerHTML='<div class="wv-empty">No se encontraron pausas configuradas para este puesto.</div>';return}o.innerHTML=`
    <div class="wv-schedule-list">
      ${i.map((n,d)=>{const l=c(a*60+n.at),p=c(a*60+n.at+n.dur);return`
        <div class="wv-schedule-item">
          <div class="wv-sched-num">${d+1}</div>
          <div class="wv-sched-time">${l} – ${p}</div>
          <div class="wv-sched-dur">${n.dur} min</div>
          <div class="wv-sched-status" id="wvSchedStatus${d}">
            <span class="wv-dot"></span>
            Programada
          </div>
        </div>`}).join("")}
    </div>`,s.style.display="",t.querySelector("#wvActivate").addEventListener("click",()=>{typeof window.workerActivateAlerts=="function"&&window.workerActivateAlerts(e)})}async function f(t,e){const i=new Date(Date.now()-6048e5).toISOString(),{data:a}=await v.from("break_events").select("action, created_at, job_positions(name)").eq("worker_id",e).gte("created_at",i).order("created_at",{ascending:!1}),o=t.querySelector("#wvHistory");if(!a||a.length===0){o.innerHTML='<div class="wv-empty">No hay registros en los últimos 7 días.</div>';return}o.innerHTML=`
    <div class="wv-history-list">
      ${a.map(s=>{var n;const r=new Date(s.created_at);return`<div class="wv-hist-row">
          <div class="wv-hist-status wv-hist-${s.action}">${x(s.action)}</div>
          <div class="wv-hist-info">
            <div class="wv-hist-label">${b(s.action)}</div>
            <div class="wv-hist-date">${r.toLocaleDateString("es-PE")} ${r.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <div class="wv-hist-pos">${((n=s.job_positions)==null?void 0:n.name)||""}</div>
        </div>`}).join("")}
    </div>`}function x(t){return t==="completed"?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>':t==="skipped"?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d97706" stroke-width="2"/><path d="M12 8v4l3 3" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg>'}function b(t){return{completed:"Completada",skipped:"Saltada",postponed:"Pospuesta"}[t]||t}function m(){if(document.getElementById("wvStyles"))return;const t=document.createElement("style");t.id="wvStyles",t.textContent=`
    .wv-wrap { min-height:100vh;background:var(--bg); }
    .wv-header { background:var(--navy);padding:0 24px; }
    .wv-header-inner { max-width:640px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between; }
    .wv-logo { display:flex;align-items:center;gap:10px; }
    .wv-logo span { font-size:16px;font-weight:800;color:#fff; }
    .wv-header-right { display:flex;align-items:center;gap:12px; }
    .wv-worker-name { font-size:13px;color:rgba(255,255,255,0.7); }
    .wv-logout { background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit; }
    .wv-logout:hover { background:rgba(255,255,255,0.2); }
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
    .wv-schedule-list {}
    .wv-schedule-item { display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--border); }
    .wv-schedule-item:last-child { border-bottom:none; }
    .wv-sched-num { width:24px;height:24px;border-radius:50%;background:var(--blue-light);color:var(--blue);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0; }
    .wv-sched-time { font-size:15px;font-weight:800;color:var(--navy);min-width:56px; }
    .wv-sched-dur { font-size:12px;color:var(--slate);min-width:48px; }
    .wv-sched-status { display:flex;align-items:center;gap:6px;font-size:12px;color:var(--slate);margin-left:auto; }
    .wv-dot { width:6px;height:6px;border-radius:50%;background:var(--border); }
    .wv-activate-wrap { background:var(--blue-light);border:1.5px solid #bfdbfe;border-radius:14px;padding:20px;text-align:center;margin-bottom:24px; }
    .wv-btn-activate { display:inline-flex;align-items:center;gap:8px;padding:13px 24px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin-bottom:10px; }
    .wv-btn-activate:hover { background:#1d4ed8; }
    .wv-activate-hint { font-size:12px;color:var(--blue);opacity:.8;margin:0; }
    .wv-history { background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden; }
    .wv-history-list {}
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
  `,document.head.appendChild(t)}export{k as renderWorker};
