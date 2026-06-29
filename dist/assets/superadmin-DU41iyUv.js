import{b as n,c as v,n as u}from"./index-CKszgeZc.js";import{m,I as o}from"./nav-CaL1R5qX.js";async function y(a,s){a.innerHTML=`
<div class="sa-wrap">
  <div class="sa-body">
    <!-- Stats -->
    <div class="sa-stats" id="saStats">
      <div class="sa-stat-card"><div class="sa-stat-val" id="saStatTotal">—</div><div class="sa-stat-lbl">Empresas totales</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val sa-green" id="saStatActive">—</div><div class="sa-stat-lbl">Activas</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val sa-yellow" id="saStatPending">—</div><div class="sa-stat-lbl">Pendientes</div></div>
      <div class="sa-stat-card"><div class="sa-stat-val" id="saStatWorkers">—</div><div class="sa-stat-lbl">Trabajadores</div></div>
    </div>

    <div id="saTabPending" class="sa-tab-panel active">
      <div id="saPendingList" class="sa-company-list"><div class="sa-loading">Cargando…</div></div>
    </div>
    <div id="saTabAll" class="sa-tab-panel">
      <div id="saAllList" class="sa-company-list"><div class="sa-loading">Cargando…</div></div>
    </div>
  </div>
</div>`,f();function e(i){a.querySelectorAll(".sa-tab-panel").forEach(p=>p.classList.remove("active")),a.querySelector(`#saTab${i.charAt(0).toUpperCase()+i.slice(1)}`).classList.add("active"),t.setActive(i)}const t=m(a.querySelector(".sa-wrap"),{user:{name:s.full_name||"Superadmin",roleLabel:"Superadmin"},items:[{key:"pending",icon:o.clock,label:"Pendientes",onClick:()=>e("pending")},{key:"all",icon:o.building,label:"Todas las empresas",onClick:()=>e("all")}],onLogout:async()=>{await v(),u("/login")}});await c(a),await l(a)}async function c(a){const{data:s}=await n.from("companies").select("id, status"),{count:e}=await n.from("profiles").select("id",{count:"exact",head:!0}).eq("role","worker");s&&(a.querySelector("#saStatTotal").textContent=s.length,a.querySelector("#saStatActive").textContent=s.filter(t=>t.status==="active").length,a.querySelector("#saStatPending").textContent=s.filter(t=>t.status==="pending").length,a.querySelector("#saStatWorkers").textContent=e??"—")}async function l(a){const{data:s}=await n.from("companies").select("id, name, ruc, contact_email, status, created_at").order("created_at",{ascending:!1});if(!s)return;const e=s.filter(i=>i.status==="pending"),t=s;d(a.querySelector("#saPendingList"),e,a),d(a.querySelector("#saAllList"),t,a)}function d(a,s,e){if(s.length===0){a.innerHTML='<div class="sa-empty">No hay empresas en esta categoría.</div>';return}a.innerHTML=s.map(t=>`
    <div class="sa-company-row" data-id="${t.id}">
      <div class="sa-company-info">
        <div class="sa-company-name">${t.name}</div>
        <div class="sa-company-meta">RUC ${t.ruc} &middot; ${t.contact_email} &middot; ${new Date(t.created_at).toLocaleDateString("es-PE")}</div>
      </div>
      <div class="sa-company-actions">
        <span class="sa-status sa-status-${t.status}">${g(t.status)}</span>
        ${t.status==="pending"?`<button class="sa-action-btn sa-approve" data-id="${t.id}">Aprobar</button>`:""}
        ${t.status==="active"?`<button class="sa-action-btn sa-suspend" data-id="${t.id}">Suspender</button>`:""}
        ${t.status==="suspended"?`<button class="sa-action-btn sa-approve" data-id="${t.id}">Reactivar</button>`:""}
      </div>
    </div>
  `).join(""),a.querySelectorAll(".sa-approve").forEach(t=>{t.addEventListener("click",()=>r(t.dataset.id,"active",e))}),a.querySelectorAll(".sa-suspend").forEach(t=>{t.addEventListener("click",()=>r(t.dataset.id,"suspended",e))})}async function r(a,s,e){await n.from("companies").update({status:s}).eq("id",a),await c(e),await l(e)}function g(a){return{pending:"Pendiente",active:"Activa",suspended:"Suspendida"}[a]||a}function f(){if(document.getElementById("saStyles"))return;const a=document.createElement("style");a.id="saStyles",a.textContent=`
    .sa-wrap { min-height:100vh;background:var(--bg); }
    .sa-body { max-width:960px;margin:0 auto;padding:28px 24px; }
    .sa-stats { display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px; }
    .sa-stat-card { background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .sa-stat-val { font-size:32px;font-weight:900;color:var(--navy); }
    .sa-stat-val.sa-green { color:var(--green); }
    .sa-stat-val.sa-yellow { color:#d97706; }
    .sa-stat-lbl { font-size:12px;color:var(--slate);margin-top:4px;font-weight:600; }
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
  `,document.head.appendChild(a)}export{y as renderSuperadmin};
