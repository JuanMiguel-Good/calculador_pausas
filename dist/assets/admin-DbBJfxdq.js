import{b as y,n as g,a as l}from"./index-D5YiH_BL.js";async function L(a,i){const d=i.company;a.innerHTML=`
<div class="adm-wrap">
  <header class="adm-header">
    <div class="adm-header-inner">
      <div class="adm-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fff" stroke-width="2"/>
        </svg>
        <div>
          <div class="adm-logo-name">PausasLab</div>
          <div class="adm-logo-company">${(d==null?void 0:d.name)||"Mi empresa"}</div>
        </div>
      </div>
      <button class="adm-logout" id="admLogout">Cerrar sesión</button>
    </div>
  </header>

  <div class="adm-body">
    <div class="adm-tabs">
      <button class="adm-tab active" data-tab="positions">Puestos de trabajo</button>
      <button class="adm-tab" data-tab="workers">Trabajadores</button>
      <button class="adm-tab" data-tab="reports">Reportes</button>
    </div>

    <!-- Positions tab -->
    <div id="admTabPositions" class="adm-panel active">
      <div class="adm-panel-header">
        <h2 class="adm-panel-title">Puestos de trabajo</h2>
        <button class="adm-btn-primary" id="admAddPosition">+ Nuevo puesto</button>
      </div>
      <div id="admPositionList" class="adm-list"><div class="adm-loading">Cargando…</div></div>
    </div>

    <!-- Workers tab -->
    <div id="admTabWorkers" class="adm-panel">
      <div class="adm-panel-header">
        <h2 class="adm-panel-title">Trabajadores</h2>
        <button class="adm-btn-primary" id="admAddWorker">+ Agregar trabajador</button>
      </div>
      <div id="admWorkerList" class="adm-list"><div class="adm-loading">Cargando…</div></div>
    </div>

    <!-- Reports tab -->
    <div id="admTabReports" class="adm-panel">
      <div class="adm-panel-header">
        <h2 class="adm-panel-title">Cumplimiento últimos 7 días</h2>
      </div>
      <div id="admReportList" class="adm-list"><div class="adm-loading">Cargando…</div></div>
    </div>
  </div>

  <!-- Add Worker modal -->
  <div id="admWorkerModal" class="adm-modal-overlay" style="display:none">
    <div class="adm-modal-backdrop" onclick="document.getElementById('admWorkerModal').style.display='none'">
      <div class="adm-modal" onclick="event.stopPropagation()">
        <h3 class="adm-modal-title">Agregar trabajador</h3>
        <div class="adm-field"><label class="adm-label">Nombre completo</label><input class="adm-input" id="wkName" type="text" placeholder="Juan Pérez"></div>
        <div class="adm-field"><label class="adm-label">DNI</label><input class="adm-input" id="wkDni" type="text" inputmode="numeric" maxlength="8" placeholder="12345678"></div>
        <div class="adm-field"><label class="adm-label">Puesto de trabajo</label>
          <select class="adm-input" id="wkPosition"><option value="">Selecciona un puesto…</option></select>
        </div>
        <div id="admWkError" class="adm-error" style="display:none"></div>
        <div class="adm-modal-actions">
          <button class="adm-btn-secondary" onclick="document.getElementById('admWorkerModal').style.display='none'">Cancelar</button>
          <button class="adm-btn-primary" id="admWkSubmit">Crear trabajador</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Link result modal -->
  <div id="admLinkModal" class="adm-modal-overlay" style="display:none">
    <div class="adm-modal-backdrop" onclick="document.getElementById('admLinkModal').style.display='none'">
      <div class="adm-modal" onclick="event.stopPropagation()">
        <div class="adm-link-check">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="1.8"/>
            <path d="M8 12l3 3 5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="adm-modal-title">Trabajador creado</h3>
        <p class="adm-modal-sub">Copia este enlace y envíalo al trabajador. Podrá iniciar sesión con su DNI.</p>
        <div class="adm-link-box" id="admLinkBox"></div>
        <button class="adm-btn-copy" id="admCopyLink">Copiar enlace</button>
        <button class="adm-btn-secondary" style="width:100%;margin-top:8px" onclick="document.getElementById('admLinkModal').style.display='none'">Cerrar</button>
      </div>
    </div>
  </div>
</div>`,w(),a.querySelector("#admLogout").addEventListener("click",async()=>{await y(),g("/login")}),a.querySelectorAll(".adm-tab").forEach(t=>{t.addEventListener("click",()=>{a.querySelectorAll(".adm-tab").forEach(o=>o.classList.toggle("active",o===t));const e=t.dataset.tab;a.querySelectorAll(".adm-panel").forEach(o=>o.classList.remove("active")),a.querySelector(`#admTab${e.charAt(0).toUpperCase()+e.slice(1)}`).classList.add("active"),e==="reports"&&x(a,d.id)})}),a.querySelector("#admAddPosition").addEventListener("click",()=>{window._adminSaveMode={companyId:d.id,onSave:()=>b(a,d.id)},g("/"),setTimeout(()=>{const t=document.getElementById("adminSaveCard");t&&(t.style.display="")},300)}),a.querySelector("#admAddWorker").addEventListener("click",async()=>{await k(a,d.id),a.querySelector("#admWorkerModal").style.display="flex"}),a.querySelector("#admWkSubmit").addEventListener("click",()=>h(a,i,d)),a.querySelector("#admCopyLink").addEventListener("click",()=>{const t=a.querySelector("#admLinkBox").textContent;navigator.clipboard.writeText(t).then(()=>{const e=a.querySelector("#admCopyLink");e.textContent="Copiado!",setTimeout(()=>{e.textContent="Copiar enlace"},2e3)})}),await b(a,d.id),await v(a,d.id)}async function b(a,i){const{data:d}=await l.from("job_positions").select("id, name, created_at, result").eq("company_id",i).order("created_at",{ascending:!1}),t=a.querySelector("#admPositionList");if(!d||d.length===0){t.innerHTML='<div class="adm-empty">No hay puestos configurados. Haz clic en "+ Nuevo puesto" para calcular y guardar uno.</div>';return}t.innerHTML=`
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Nombre del puesto</th><th>Pausas diarias</th><th>Duración total</th><th>Creado</th><th></th></tr></thead>
        <tbody>
          ${d.map(e=>{var s;const o=e.result||{};return`
            <tr>
              <td class="adm-cell-name">${e.name}</td>
              <td>${((s=o.pausas)==null?void 0:s.length)??"—"}</td>
              <td>${o.mFinal?o.mFinal+" min":"—"}</td>
              <td>${new Date(e.created_at).toLocaleDateString("es-PE")}</td>
              <td><button class="adm-tbl-del" data-id="${e.id}" title="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button></td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`,t.querySelectorAll(".adm-tbl-del").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar este puesto? Se desvincularán los trabajadores asignados.")&&(await l.from("job_positions").delete().eq("id",e.dataset.id),await b(a,i))})})}async function v(a,i){const{data:d}=await l.from("profiles").select("id, full_name, dni, worker_assignments!worker_id(job_positions(name))").eq("company_id",i).eq("role","worker").order("full_name"),t=a.querySelector("#admWorkerList");if(!d||d.length===0){t.innerHTML='<div class="adm-empty">No hay trabajadores registrados. Haz clic en "+ Agregar trabajador" para empezar.</div>';return}t.innerHTML=`
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Nombre</th><th>DNI</th><th>Puesto asignado</th><th></th></tr></thead>
        <tbody>
          ${d.map(o=>{var s,n,r;return`
            <tr>
              <td class="adm-cell-name">${o.full_name}</td>
              <td>${o.dni}</td>
              <td>${((r=(n=(s=o.worker_assignments)==null?void 0:s[0])==null?void 0:n.job_positions)==null?void 0:r.name)||'<span style="color:var(--slate)">Sin asignar</span>'}</td>
              <td>
                <button class="adm-tbl-link" data-id="${o.id}" data-dni="${o.dni}" title="Copiar enlace de acceso">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Link
                </button>
              </td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`;const{data:e}=await l.from("companies").select("ruc").eq("id",i).maybeSingle();t.querySelectorAll(".adm-tbl-link").forEach(o=>{o.addEventListener("click",()=>{const s=`${location.origin}/#/login?mode=worker&ruc=${(e==null?void 0:e.ruc)||""}&dni=${o.dataset.dni}`;f(a,s)})})}async function x(a,i){var s;const d=new Date(Date.now()-6048e5).toISOString(),{data:t}=await l.from("break_events").select("worker_id, status, occurred_at, profiles(full_name)").eq("company_id",i).gte("occurred_at",d).order("occurred_at",{ascending:!1}),e=a.querySelector("#admReportList");if(!t||t.length===0){e.innerHTML='<div class="adm-empty">No hay eventos registrados en los últimos 7 días.</div>';return}const o={};for(const n of t){const r=((s=n.profiles)==null?void 0:s.full_name)||n.worker_id;o[r]||(o[r]={completed:0,skipped:0,postponed:0}),o[r][n.status]=(o[r][n.status]||0)+1}e.innerHTML=`
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Trabajador</th><th>Completadas</th><th>Pospuestas</th><th>Saltadas</th><th>Total</th></tr></thead>
        <tbody>
          ${Object.entries(o).map(([n,r])=>{const c=(r.completed||0)+(r.skipped||0)+(r.postponed||0),m=c>0?Math.round(r.completed/c*100):0;return`<tr>
              <td class="adm-cell-name">${n}</td>
              <td><span class="adm-pill adm-pill-green">${r.completed||0}</span></td>
              <td>${r.postponed||0}</td>
              <td>${r.skipped||0}</td>
              <td><strong>${m}%</strong></td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`}async function k(a,i){const{data:d}=await l.from("job_positions").select("id, name").eq("company_id",i).order("name"),t=a.querySelector("#wkPosition");t.innerHTML='<option value="">Selecciona un puesto…</option>'+(d||[]).map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}async function h(a,i,d){var r;const t=a.querySelector("#admWkError");t.style.display="none";const e=a.querySelector("#wkName").value.trim(),o=a.querySelector("#wkDni").value.trim(),s=a.querySelector("#wkPosition").value;if(!e)return p(t,"Ingresa el nombre del trabajador.");if(!/^\d{8}$/.test(o))return p(t,"El DNI debe tener 8 dígitos.");const n=a.querySelector("#admWkSubmit");n.disabled=!0,n.textContent="Creando…";try{const m=await fetch("https://wfmuvdioqscurgvdzddu.supabase.co/functions/v1/worker-create",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${(r=(await l.auth.getSession()).data.session)==null?void 0:r.access_token}`},body:JSON.stringify({company_id:d.id,name:e,dni:o,job_position_id:s||null})}),u=await m.json();if(!m.ok)throw new Error(u.error||`Error ${m.status}`);a.querySelector("#admWorkerModal").style.display="none",a.querySelector("#wkName").value="",a.querySelector("#wkDni").value="",a.querySelector("#wkPosition").value="",f(a,u.loginUrl),await v(a,d.id)}catch(c){p(t,c.message||"Error al crear el trabajador.")}finally{n.disabled=!1,n.textContent="Crear trabajador"}}function p(a,i){a.textContent=i,a.style.display=""}function f(a,i){a.querySelector("#admLinkBox").textContent=i,a.querySelector("#admLinkModal").style.display="flex"}function w(){if(document.getElementById("admStyles"))return;const a=document.createElement("style");a.id="admStyles",a.textContent=`
    .adm-wrap { min-height:100vh;background:var(--bg); }
    .adm-header { background:var(--navy);padding:0 24px; }
    .adm-header-inner { max-width:960px;margin:0 auto;height:64px;display:flex;align-items:center;justify-content:space-between; }
    .adm-logo { display:flex;align-items:center;gap:12px; }
    .adm-logo-name { font-size:15px;font-weight:800;color:#fff; }
    .adm-logo-company { font-size:11px;color:rgba(255,255,255,0.6); }
    .adm-logout { background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit; }
    .adm-logout:hover { background:rgba(255,255,255,0.2); }
    .adm-body { max-width:960px;margin:0 auto;padding:28px 24px; }
    .adm-tabs { display:flex;gap:4px;margin-bottom:20px;background:#fff;padding:4px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);width:fit-content; }
    .adm-tab { padding:9px 20px;border:none;background:transparent;border-radius:9px;font-size:13px;font-weight:600;color:var(--slate);cursor:pointer;font-family:inherit;transition:all .15s; }
    .adm-tab.active { background:var(--navy);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.15); }
    .adm-panel { display:none; }
    .adm-panel.active { display:block; }
    .adm-panel-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
    .adm-panel-title { font-size:18px;font-weight:800;color:var(--navy); }
    .adm-btn-primary { padding:10px 18px;background:var(--blue);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s; }
    .adm-btn-primary:hover { background:#1d4ed8; }
    .adm-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
    .adm-btn-secondary { padding:10px 18px;background:var(--slate-light);color:var(--slate);border:1.5px solid var(--border);border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit; }
    .adm-list { background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden; }
    .adm-table-wrap { overflow-x:auto; }
    .adm-table { width:100%;border-collapse:collapse;font-size:13px; }
    .adm-table thead tr { background:var(--slate-light);border-bottom:1px solid var(--border); }
    .adm-table th { padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:var(--slate);text-transform:uppercase;letter-spacing:.5px; }
    .adm-table td { padding:13px 16px;border-bottom:1px solid var(--border);color:var(--text); }
    .adm-table tr:last-child td { border-bottom:none; }
    .adm-cell-name { font-weight:700;color:var(--navy); }
    .adm-tbl-del { background:none;border:none;color:var(--slate);cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;justify-content:center; }
    .adm-tbl-del:hover { color:#dc2626;background:#fef2f2; }
    .adm-tbl-link { background:var(--blue-light);border:none;color:var(--blue);cursor:pointer;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px;font-family:inherit; }
    .adm-tbl-link:hover { background:#dbeafe; }
    .adm-pill { padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700; }
    .adm-pill-green { background:var(--green-light);color:var(--green); }
    .adm-loading,.adm-empty { padding:32px;text-align:center;font-size:14px;color:var(--slate); }
    /* Modal */
    .adm-modal-overlay { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center; }
    .adm-modal-backdrop { position:absolute;inset:0;background:rgba(10,20,40,0.7);display:flex;align-items:center;justify-content:center;padding:20px; }
    .adm-modal { background:#fff;border-radius:18px;padding:28px 24px;width:100%;max-width:400px;position:relative;animation:admSlideUp .25s ease; }
    @keyframes admSlideUp { from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1} }
    .adm-modal-title { font-size:18px;font-weight:800;color:var(--navy);margin-bottom:18px; }
    .adm-modal-sub { font-size:13px;color:var(--slate);margin-bottom:16px;line-height:1.6; }
    .adm-modal-actions { display:flex;gap:8px;margin-top:18px; }
    .adm-field { margin-bottom:14px; }
    .adm-label { display:block;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:5px; }
    .adm-input { width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:9px;font-size:14px;font-family:inherit;color:var(--text);background:#fff;box-sizing:border-box;transition:border-color .15s; }
    .adm-input:focus { outline:none;border-color:var(--blue); }
    select.adm-input { cursor:pointer; }
    .adm-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:9px 13px;font-size:13px; }
    .adm-link-check { text-align:center;margin-bottom:12px; }
    .adm-link-box { background:var(--slate-light);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--navy);word-break:break-all;margin-bottom:12px;font-family:monospace; }
    .adm-btn-copy { width:100%;padding:12px;background:var(--green);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s; }
    .adm-btn-copy:hover { background:#047857; }
    @media(max-width:600px){ .adm-tabs{width:100%;} .adm-tab{flex:1;text-align:center;} }
  `,document.head.appendChild(a)}export{L as renderAdmin};
