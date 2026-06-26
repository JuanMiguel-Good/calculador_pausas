import{b as p,n as l,a as n}from"./index-D5YiH_BL.js";async function f(a,s){a.innerHTML=`
<div class="sa-wrap">
  <header class="sa-header">
    <div class="sa-header-inner">
      <div class="sa-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fff" stroke-width="2"/>
        </svg>
        <span>PausasLab</span>
        <span class="sa-badge">Superadmin</span>
      </div>
      <button class="sa-logout" id="saLogout">Cerrar sesión</button>
    </div>
  </header>

  <div class="sa-body">
    <!-- Stats -->
    <div class="sa-stats" id="saStats">
      <div class="sa-stat-card"><div class="sa-stat-val" id="saStatTotal">—</div><div class="sa-stat-lbl">Empresas totales</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val sa-green" id="saStatActive">—</div><div class="sa-stat-lbl">Activas</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val sa-yellow" id="saStatPending">—</div><div class="sa-stat-lbl">Pendientes</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val" id="saStatWorkers">—</div><div class="sa-stat-lbl">Trabajadores</div></div>
    </div>

    <!-- Tabs -->
    <div class="sa-tabs">
      <button class="sa-tab active" data-tab="pending">Pendientes de aprobación</button>
      <button class="sa-tab" data-tab="all">Todas las empresas</button>
    </div>

    <div id="saTabPending" class="sa-tab-panel active">
      <div id="saPendingList" class="sa-company-list"><div class="sa-loading">Cargando…</div></div>
    </div>
    <div id="saTabAll" class="sa-tab-panel">
      <div id="saAllList" class="sa-company-list"><div class="sa-loading">Cargando…</div></div>
    </div>
  </div>
</div>`,v(),a.querySelector("#saLogout").addEventListener("click",async()=>{await p(),l("/login")}),a.querySelectorAll(".sa-tab").forEach(e=>{e.addEventListener("click",()=>{a.querySelectorAll(".sa-tab").forEach(i=>i.classList.toggle("active",i===e));const t=e.dataset.tab;a.querySelectorAll(".sa-tab-panel").forEach(i=>i.classList.remove("active")),a.querySelector(`#saTab${t.charAt(0).toUpperCase()+t.slice(1)}`).classList.add("active")})}),await r(a),await c(a)}async function r(a){const{data:s}=await n.from("companies").select("id, status"),{count:e}=await n.from("profiles").select("id",{count:"exact",head:!0}).eq("role","worker");s&&(a.querySelector("#saStatTotal").textContent=s.length,a.querySelector("#saStatActive").textContent=s.filter(t=>t.status==="active").length,a.querySelector("#saStatPending").textContent=s.filter(t=>t.status==="pending").length,a.querySelector("#saStatWorkers").textContent=e??"—")}async function c(a){const{data:s}=await n.from("companies").select("id, name, ruc, contact_email, status, created_at").order("created_at",{ascending:!1});if(!s)return;const e=s.filter(i=>i.status==="pending"),t=s;o(a.querySelector("#saPendingList"),e,a),o(a.querySelector("#saAllList"),t,a)}function o(a,s,e){if(s.length===0){a.innerHTML='<div class="sa-empty">No hay empresas en esta categoría.</div>';return}a.innerHTML=s.map(t=>`
    <div class="sa-company-row" data-id="${t.id}">
      <div class="sa-company-info">
        <div class="sa-company-name">${t.name}</div>
        <div class="sa-company-meta">RUC ${t.ruc} &middot; ${t.contact_email} &middot; ${new Date(t.created_at).toLocaleDateString("es-PE")}</div>
      </div>
      <div class="sa-company-actions">
        <span class="sa-status sa-status-${t.status}">${u(t.status)}</span>
        ${t.status==="pending"?`<button class="sa-action-btn sa-approve" data-id="${t.id}">Aprobar</button>`:""}
        ${t.status==="active"?`<button class="sa-action-btn sa-suspend" data-id="${t.id}">Suspender</button>`:""}
        ${t.status==="suspended"?`<button class="sa-action-btn sa-approve" data-id="${t.id}">Reactivar</button>`:""}
      </div>
    </div>
  `).join(""),a.querySelectorAll(".sa-approve").forEach(t=>{t.addEventListener("click",()=>d(t.dataset.id,"active",e))}),a.querySelectorAll(".sa-suspend").forEach(t=>{t.addEventListener("click",()=>d(t.dataset.id,"suspended",e))})}async function d(a,s,e){await n.from("companies").update({status:s}).eq("id",a),await r(e),await c(e)}function u(a){return{pending:"Pendiente",active:"Activa",suspended:"Suspendida"}[a]||a}function v(){if(document.getElementById("saStyles"))return;const a=document.createElement("style");a.id="saStyles",a.textContent=`
    .sa-wrap { min-height:100vh;background:var(--bg); }
    .sa-header { background:var(--navy);padding:0 24px; }
    .sa-header-inner { max-width:960px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between; }
    .sa-logo { display:flex;align-items:center;gap:10px; }
    .sa-logo span { font-size:16px;font-weight:800;color:#fff; }
    .sa-badge { font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;background:rgba(255,255,255,0.15);color:#fff;padding:3px 8px;border-radius:20px; }
    .sa-logout { background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit; }
    .sa-logout:hover { background:rgba(255,255,255,0.2); }
    .sa-body { max-width:960px;margin:0 auto;padding:28px 24px; }
    .sa-stats { display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px; }
    .sa-stat-card { background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .sa-stat-val { font-size:32px;font-weight:900;color:var(--navy); }
    .sa-stat-val.sa-green { color:var(--green); }
    .sa-stat-val.sa-yellow { color:#d97706; }
    .sa-stat-lbl { font-size:12px;color:var(--slate);margin-top:4px;font-weight:600; }
    .sa-tabs { display:flex;gap:4px;margin-bottom:16px; }
    .sa-tab { padding:9px 18px;border:none;background:transparent;border-radius:8px;font-size:13px;font-weight:600;color:var(--slate);cursor:pointer;font-family:inherit; }
    .sa-tab.active { background:#fff;color:var(--navy);box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .sa-tab-panel { display:none; }
    .sa-tab-panel.active { display:block; }
    .sa-company-list { background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden; }
    .sa-company-row { display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:12px; }
    .sa-company-row:last-child { border-bottom:none; }
    .sa-company-name { font-size:14px;font-weight:700;color:var(--navy);margin-bottom:3px; }
    .sa-company-meta { font-size:12px;color:var(--slate); }
    .sa-company-actions { display:flex;align-items:center;gap:10px;flex-shrink:0; }
    .sa-status { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 10px;border-radius:20px; }
    .sa-status-pending { background:#fefce8;color:#92400e; }
    .sa-status-active { background:var(--green-light);color:var(--green); }
    .sa-status-suspended { background:#fef2f2;color:#dc2626; }
    .sa-action-btn { padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;border:none;transition:opacity .15s; }
    .sa-action-btn:hover { opacity:.8; }
    .sa-approve { background:var(--green);color:#fff; }
    .sa-suspend { background:#fef2f2;color:#dc2626;border:1px solid #fecaca; }
    .sa-loading,.sa-empty { padding:32px;text-align:center;font-size:14px;color:var(--slate); }
    @media(max-width:600px){ .sa-company-row{flex-direction:column;align-items:flex-start;} }
  `,document.head.appendChild(a)}export{f as renderSuperadmin};
