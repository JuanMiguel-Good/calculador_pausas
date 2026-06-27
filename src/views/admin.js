import { supabase } from '../lib/supabase.js';
import { signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export async function renderAdmin(shell, profile) {
  const company = profile.company;

  shell.innerHTML = `
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
          <div class="adm-logo-company">${company?.name || 'Mi empresa'}</div>
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
</div>`;

  injectAdminStyles();

  shell.querySelector('#admLogout').addEventListener('click', async () => {
    await signOut();
    navigate('/login');
  });

  shell.querySelectorAll('.adm-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      shell.querySelectorAll('.adm-tab').forEach(t => t.classList.toggle('active', t === btn));
      const tab = btn.dataset.tab;
      shell.querySelectorAll('.adm-panel').forEach(p => p.classList.remove('active'));
      shell.querySelector(`#admTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
      if (tab === 'reports') loadReports(shell, company.id);
    });
  });

  shell.querySelector('#admAddPosition').addEventListener('click', () => {
    // Navigate to calculator root and set a flag to save result as position
    window._adminSaveMode = { companyId: company.id, onSave: () => loadPositions(shell, company.id) };
    navigate('/');
    setTimeout(() => {
      const saveCard = document.getElementById('adminSaveCard');
      if (saveCard) saveCard.style.display = '';
    }, 300);
  });

  shell.querySelector('#admAddWorker').addEventListener('click', async () => {
    await populatePositionDropdown(shell, company.id);
    shell.querySelector('#admWorkerModal').style.display = 'flex';
  });

  shell.querySelector('#admWkSubmit').addEventListener('click', () => createWorker(shell, profile, company));

  // Set up company link banner
  const companyLink = `${location.origin}/#/login?ruc=${company.ruc}`;
  shell.querySelector('#admCompanyLinkUrl').textContent = companyLink;
  shell.querySelector('#admCopyCompanyLink').addEventListener('click', () => {
    navigator.clipboard.writeText(companyLink).then(() => {
      const btn = shell.querySelector('#admCopyCompanyLink');
      btn.textContent = 'Copiado!';
      setTimeout(() => { btn.textContent = 'Copiar link'; }, 2000);
    });
  });

  await loadPositions(shell, company.id);
  await loadWorkers(shell, company.id);
}

async function loadPositions(shell, companyId) {
  const { data: positions } = await supabase
    .from('job_positions')
    .select('id, name, created_at, result')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const list = shell.querySelector('#admPositionList');
  if (!positions || positions.length === 0) {
    list.innerHTML = '<div class="adm-empty">No hay puestos configurados. Haz clic en "+ Nuevo puesto" para calcular y guardar uno.</div>';
    return;
  }

  list.innerHTML = `
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Nombre del puesto</th><th>Pausas diarias</th><th>Duración total</th><th>Creado</th><th></th></tr></thead>
        <tbody>
          ${positions.map(p => {
            const res = p.result || {};
            return `
            <tr>
              <td class="adm-cell-name">${p.name}</td>
              <td>${res.pausas?.length ?? '—'}</td>
              <td>${res.mFinal ? res.mFinal + ' min' : '—'}</td>
              <td>${new Date(p.created_at).toLocaleDateString('es-PE')}</td>
              <td><button class="adm-tbl-del" data-id="${p.id}" title="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  list.querySelectorAll('.adm-tbl-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este puesto? Se desvincularán los trabajadores asignados.')) return;
      await supabase.from('job_positions').delete().eq('id', btn.dataset.id);
      await loadPositions(shell, companyId);
    });
  });
}

async function loadWorkers(shell, companyId) {
  const { data: workers } = await supabase
    .from('profiles')
    .select('id, full_name, dni, alerts_enabled, worker_assignments!worker_id(job_positions(name))')
    .eq('company_id', companyId)
    .eq('role', 'worker')
    .order('full_name');

  const list = shell.querySelector('#admWorkerList');
  if (!workers || workers.length === 0) {
    list.innerHTML = '<div class="adm-empty">No hay trabajadores registrados. Haz clic en "+ Agregar trabajador" para empezar.</div>';
    return;
  }

  list.innerHTML = `
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Nombre</th><th>DNI</th><th>Puesto asignado</th><th>Notificaciones</th></tr></thead>
        <tbody>
          ${workers.map(w => `
            <tr>
              <td class="adm-cell-name">${w.full_name}</td>
              <td>${w.dni}</td>
              <td>${w.worker_assignments?.[0]?.job_positions?.name || '<span style="color:var(--slate)">Sin asignar</span>'}</td>
              <td>${w.alerts_enabled
                ? '<span class="adm-pill adm-pill-green">Activas</span>'
                : '<span style="font-size:12px;color:var(--slate)">Inactivas</span>'
              }</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

async function loadReports(shell, companyId) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await supabase
    .from('break_events')
    .select('worker_id, action, created_at, profiles(full_name)')
    .eq('company_id', companyId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  const list = shell.querySelector('#admReportList');
  if (!events || events.length === 0) {
    list.innerHTML = '<div class="adm-empty">No hay eventos registrados en los últimos 7 días.</div>';
    return;
  }

  const byWorker = {};
  for (const ev of events) {
    const name = ev.profiles?.full_name || ev.worker_id;
    if (!byWorker[name]) byWorker[name] = { completed: 0, skipped: 0, postponed: 0 };
    byWorker[name][ev.action] = (byWorker[name][ev.action] || 0) + 1;
  }

  list.innerHTML = `
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Trabajador</th><th>Completadas</th><th>Pospuestas</th><th>Saltadas</th><th>Total</th></tr></thead>
        <tbody>
          ${Object.entries(byWorker).map(([name, s]) => {
            const total = (s.completed || 0) + (s.skipped || 0) + (s.postponed || 0);
            const pct = total > 0 ? Math.round((s.completed / total) * 100) : 0;
            return `<tr>
              <td class="adm-cell-name">${name}</td>
              <td><span class="adm-pill adm-pill-green">${s.completed || 0}</span></td>
              <td>${s.postponed || 0}</td>
              <td>${s.skipped || 0}</td>
              <td><strong>${pct}%</strong></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function populatePositionDropdown(shell, companyId) {
  const { data: positions } = await supabase.from('job_positions').select('id, name').eq('company_id', companyId).order('name');
  const select = shell.querySelector('#wkPosition');
  select.innerHTML = '<option value="">Selecciona un puesto…</option>' +
    (positions || []).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

async function createWorker(shell, profile, company) {
  const errorEl = shell.querySelector('#admWkError');
  errorEl.style.display = 'none';

  const name = shell.querySelector('#wkName').value.trim();
  const dni = shell.querySelector('#wkDni').value.trim();
  const positionId = shell.querySelector('#wkPosition').value;

  if (!name) return showWkError(errorEl, 'Ingresa el nombre del trabajador.');
  if (!/^\d{8}$/.test(dni)) return showWkError(errorEl, 'El DNI debe tener 8 dígitos.');

  const submitBtn = shell.querySelector('#admWkSubmit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creando…';

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wfmuvdioqscurgvdzddu.supabase.co';
    const res = await fetch(`${supabaseUrl}/functions/v1/worker-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ company_id: company.id, name, dni, job_position_id: positionId || null }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Error ${res.status}`);

    shell.querySelector('#admWorkerModal').style.display = 'none';
    shell.querySelector('#wkName').value = '';
    shell.querySelector('#wkDni').value = '';
    shell.querySelector('#wkPosition').value = '';

    shell.querySelector('#admSuccessModal').style.display = 'flex';
    await loadWorkers(shell, company.id);
  } catch (err) {
    showWkError(errorEl, err.message || 'Error al crear el trabajador.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Crear trabajador';
  }
}

function showWkError(el, msg) {
  el.textContent = msg;
  el.style.display = '';
}

function injectAdminStyles() {
  if (document.getElementById('admStyles')) return;
  const style = document.createElement('style');
  style.id = 'admStyles';
  style.textContent = `
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
    /* Company link banner */
    .adm-company-link-banner { background:var(--blue-light);border:1.5px solid #bfdbfe;border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap; }
    .adm-clb-left { display:flex;align-items:center;gap:12px;min-width:0; }
    .adm-clb-icon { width:34px;height:34px;background:var(--blue);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0; }
    .adm-clb-label { font-size:12px;font-weight:700;color:var(--navy);margin-bottom:2px; }
    .adm-clb-url { font-size:11px;color:var(--blue);font-family:monospace;word-break:break-all; }
    .adm-clb-copy { width:auto;padding:8px 16px;font-size:13px;flex-shrink:0; }
    @media(max-width:600px){ .adm-tabs{width:100%;} .adm-tab{flex:1;text-align:center;} .adm-company-link-banner{flex-direction:column;align-items:flex-start;} .adm-clb-copy{width:100%;} }
  `;
  document.head.appendChild(style);
}
