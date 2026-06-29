import{n as v,b as l,c as g}from"./index-CKszgeZc.js";import{m as x,I as p}from"./nav-CaL1R5qX.js";async function _(a,n){const e=n.company;a.innerHTML=`
<div class="adm-wrap">
  <div class="adm-body">
    <!-- Positions panel -->
    <div id="admTabPositions" class="adm-panel active">
      <div class="adm-panel-header">
        <h2 class="adm-panel-title">Puestos de trabajo</h2>
        <button class="adm-btn-primary" id="admAddPosition">+ Nuevo puesto</button>
      </div>
      <div id="admPositionList" class="adm-list"><div class="adm-loading">Cargando…</div></div>
    </div>

    <!-- Workers panel -->
    <div id="admTabWorkers" class="adm-panel">
      <div class="adm-panel-header">
        <h2 class="adm-panel-title">Trabajadores</h2>
        <button class="adm-btn-primary" id="admAddWorker">+ Agregar trabajador</button>
      </div>
      <div class="adm-company-link-banner" id="admCompanyLinkBanner">
        <div class="adm-clb-left">
          <div class="adm-clb-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <div class="adm-clb-label">Link de acceso para trabajadores</div>
            <div class="adm-clb-url" id="admCompanyLinkUrl"></div>
          </div>
        </div>
        <button class="adm-btn-copy adm-clb-copy" id="admCopyCompanyLink">Copiar link</button>
      </div>
      <div id="admWorkerList" class="adm-list"><div class="adm-loading">Cargando…</div></div>
    </div>

    <!-- Reports panel -->
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

  <!-- Success modal (worker created) -->
  <div id="admSuccessModal" class="adm-modal-overlay" style="display:none">
    <div class="adm-modal-backdrop" onclick="document.getElementById('admSuccessModal').style.display='none'">
      <div class="adm-modal" onclick="event.stopPropagation()">
        <div class="adm-link-check">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="1.8"/>
            <path d="M8 12l3 3 5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="adm-modal-title">Trabajador creado</h3>
        <p class="adm-modal-sub">El trabajador fue registrado exitosamente. Comparte el link de empresa para que pueda ingresar con su DNI.</p>
        <button class="adm-btn-copy" onclick="document.getElementById('admSuccessModal').style.display='none'">Entendido</button>
      </div>
    </div>
  </div>
</div>`,S();function o(d){a.querySelectorAll(".adm-panel").forEach(i=>i.classList.remove("active")),a.querySelector(`#admTab${d.charAt(0).toUpperCase()+d.slice(1)}`).classList.add("active"),d==="reports"&&k(a,e.id),t.setActive(d)}const t=x(a.querySelector(".adm-wrap"),{user:{name:n.full_name||"Admin",roleLabel:(e==null?void 0:e.name)||"Mi empresa"},items:[{key:"positions",icon:p.briefcase,label:"Puestos de trabajo",onClick:()=>o("positions")},{key:"workers",icon:p.users,label:"Trabajadores",onClick:()=>o("workers")},{key:"reports",icon:p.chart,label:"Reportes",onClick:()=>o("reports")}],onLogout:async()=>{await g(),v("/login")}});a.querySelector("#admAddPosition").addEventListener("click",()=>{window._adminSaveMode={companyId:e.id,onSave:()=>u(a,e.id)},v("/"),setTimeout(()=>{const d=document.getElementById("adminSaveCard");d&&(d.style.display="")},300)}),a.querySelector("#admAddWorker").addEventListener("click",async()=>{await h(a,e.id),a.querySelector("#admWorkerModal").style.display="flex"}),a.querySelector("#admWkSubmit").addEventListener("click",()=>w(a,n,e));const r=`${location.origin}/#/login?ruc=${e.ruc}`;a.querySelector("#admCompanyLinkUrl").textContent=r,a.querySelector("#admCopyCompanyLink").addEventListener("click",()=>{navigator.clipboard.writeText(r).then(()=>{const d=a.querySelector("#admCopyCompanyLink");d.textContent="Copiado!",setTimeout(()=>{d.textContent="Copiar link"},2e3)})}),await u(a,e.id),await y(a,e.id)}async function u(a,n){const{data:e}=await l.from("job_positions").select("id, name, created_at, result").eq("company_id",n).order("created_at",{ascending:!1}),o=a.querySelector("#admPositionList");if(!e||e.length===0){o.innerHTML='<div class="adm-empty">No hay puestos configurados. Haz clic en "+ Nuevo puesto" para calcular y guardar uno.</div>';return}o.innerHTML=`
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Nombre del puesto</th><th>Pausas diarias</th><th>Duración total</th><th>Creado</th><th></th></tr></thead>
        <tbody>
          ${e.map(t=>{var d;const r=t.result||{};return`
            <tr>
              <td class="adm-cell-name">${t.name}</td>
              <td>${((d=r.pausas)==null?void 0:d.length)??"—"}</td>
              <td>${r.mFinal?r.mFinal+" min":"—"}</td>
              <td>${new Date(t.created_at).toLocaleDateString("es-PE")}</td>
              <td><button class="adm-tbl-del" data-id="${t.id}" title="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button></td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`,o.querySelectorAll(".adm-tbl-del").forEach(t=>{t.addEventListener("click",async()=>{confirm("¿Eliminar este puesto? Se desvincularán los trabajadores asignados.")&&(await l.from("job_positions").delete().eq("id",t.dataset.id),await u(a,n))})})}async function y(a,n){const{data:e}=await l.from("profiles").select("id, full_name, dni, alerts_enabled, worker_assignments!worker_id(job_positions(name))").eq("company_id",n).eq("role","worker").order("full_name"),o=a.querySelector("#admWorkerList");if(!e||e.length===0){o.innerHTML='<div class="adm-empty">No hay trabajadores registrados. Haz clic en "+ Agregar trabajador" para empezar.</div>';return}o.innerHTML=`
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Nombre</th><th>DNI</th><th>Puesto asignado</th><th>Notificaciones</th></tr></thead>
        <tbody>
          ${e.map(t=>{var r,d,i;return`
            <tr>
              <td class="adm-cell-name">${t.full_name}</td>
              <td>${t.dni}</td>
              <td>${((i=(d=(r=t.worker_assignments)==null?void 0:r[0])==null?void 0:d.job_positions)==null?void 0:i.name)||'<span style="color:var(--slate)">Sin asignar</span>'}</td>
              <td>${t.alerts_enabled?'<span class="adm-pill adm-pill-green">Activas</span>':'<span style="font-size:12px;color:var(--slate)">Inactivas</span>'}</td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`}async function k(a,n){var d;const e=new Date(Date.now()-6048e5).toISOString(),{data:o}=await l.from("break_events").select("worker_id, action, created_at, profiles(full_name)").eq("company_id",n).gte("created_at",e).order("created_at",{ascending:!1}),t=a.querySelector("#admReportList");if(!o||o.length===0){t.innerHTML='<div class="adm-empty">No hay eventos registrados en los últimos 7 días.</div>';return}const r={};for(const i of o){const s=((d=i.profiles)==null?void 0:d.full_name)||i.worker_id;r[s]||(r[s]={completed:0,skipped:0,postponed:0}),r[s][i.action]=(r[s][i.action]||0)+1}t.innerHTML=`
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Trabajador</th><th>Completadas</th><th>Pospuestas</th><th>Saltadas</th><th>Total</th></tr></thead>
        <tbody>
          ${Object.entries(r).map(([i,s])=>{const c=(s.completed||0)+(s.skipped||0)+(s.postponed||0),m=c>0?Math.round(s.completed/c*100):0;return`<tr>
              <td class="adm-cell-name">${i}</td>
              <td><span class="adm-pill adm-pill-green">${s.completed||0}</span></td>
              <td>${s.postponed||0}</td>
              <td>${s.skipped||0}</td>
              <td><strong>${m}%</strong></td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`}async function h(a,n){const{data:e}=await l.from("job_positions").select("id, name").eq("company_id",n).order("name"),o=a.querySelector("#wkPosition");o.innerHTML='<option value="">Selecciona un puesto…</option>'+(e||[]).map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}async function w(a,n,e){var s;const o=a.querySelector("#admWkError");o.style.display="none";const t=a.querySelector("#wkName").value.trim(),r=a.querySelector("#wkDni").value.trim(),d=a.querySelector("#wkPosition").value;if(!t)return b(o,"Ingresa el nombre del trabajador.");if(!/^\d{8}$/.test(r))return b(o,"El DNI debe tener 8 dígitos.");const i=a.querySelector("#admWkSubmit");i.disabled=!0,i.textContent="Creando…";try{const m=await fetch("https://wfmuvdioqscurgvdzddu.supabase.co/functions/v1/worker-create",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${(s=(await l.auth.getSession()).data.session)==null?void 0:s.access_token}`},body:JSON.stringify({company_id:e.id,name:t,dni:r,job_position_id:d||null})}),f=await m.json();if(!m.ok)throw new Error(f.error||`Error ${m.status}`);a.querySelector("#admWorkerModal").style.display="none",a.querySelector("#wkName").value="",a.querySelector("#wkDni").value="",a.querySelector("#wkPosition").value="",a.querySelector("#admSuccessModal").style.display="flex",await y(a,e.id)}catch(c){b(o,c.message||"Error al crear el trabajador.")}finally{i.disabled=!1,i.textContent="Crear trabajador"}}function b(a,n){a.textContent=n,a.style.display=""}function S(){if(document.getElementById("admStyles"))return;const a=document.createElement("style");a.id="admStyles",a.textContent=`
    .adm-wrap { min-height:100vh;background:var(--bg); }
    .adm-body { max-width:960px;margin:0 auto;padding:28px 24px; }
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
    /* Company link banner */
    .adm-company-link-banner { background:var(--blue-light);border:1.5px solid #bfdbfe;border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap; }
    .adm-clb-left { display:flex;align-items:center;gap:12px;min-width:0; }
    .adm-clb-icon { width:34px;height:34px;background:var(--blue);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0; }
    .adm-clb-label { font-size:12px;font-weight:700;color:var(--navy);margin-bottom:2px; }
    .adm-clb-url { font-size:11px;color:var(--blue);font-family:monospace;word-break:break-all; }
    .adm-clb-copy { width:auto;padding:8px 16px;font-size:13px;flex-shrink:0; }
    @media(max-width:600px){ .adm-company-link-banner{flex-direction:column;align-items:flex-start;} .adm-clb-copy{width:100%;} }
  `,document.head.appendChild(a)}export{_ as renderAdmin};
