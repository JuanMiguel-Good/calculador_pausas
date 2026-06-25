import { supabase } from '../lib/supabase.js';
import { signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';

export async function renderWorker(shell, profile) {
  shell.innerHTML = `
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
        <span class="wv-worker-name">${profile.full_name || 'Trabajador'}</span>
        <button class="wv-logout" id="wvLogout">Salir</button>
      </div>
    </div>
  </header>

  <div class="wv-body">
    <!-- Profile + position card -->
    <div class="wv-profile-card">
      <div class="wv-avatar">${(profile.full_name || 'T').charAt(0).toUpperCase()}</div>
      <div>
        <div class="wv-pname">${profile.full_name || 'Trabajador'}</div>
        <div class="wv-pmeta">DNI ${profile.dni} &middot; ${profile.company?.name || ''}</div>
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
</div>`;

  injectWorkerStyles();

  shell.querySelector('#wvLogout').addEventListener('click', async () => {
    await signOut();
    navigate('/login');
  });

  await loadWorkerData(shell, profile);
}

async function loadWorkerData(shell, profile) {
  // Get worker assignment and job position
  const { data: assignment } = await supabase
    .from('worker_assignments')
    .select('job_position_id, job_positions(id, name, result)')
    .eq('worker_id', profile.id)
    .eq('active', true)
    .maybeSingle();

  const position = assignment?.job_positions;
  const posBadge = shell.querySelector('#wvPosBadge');

  if (position) {
    posBadge.textContent = position.name;
    posBadge.classList.add('wv-pos-active');
    renderSchedule(shell, position.result);
  } else {
    posBadge.textContent = 'Sin puesto asignado';
    shell.querySelector('#wvSchedule').innerHTML = '<div class="wv-empty">Aún no tienes un puesto asignado. Comunícate con tu administrador.</div>';
  }

  // Load 7-day history
  await loadHistory(shell, profile.id);
}

function renderSchedule(shell, result) {
  const pausas = result?.pausas || [];
  const scheduleEl = shell.querySelector('#wvSchedule');
  const activateWrap = shell.querySelector('#wvActivateWrap');

  if (pausas.length === 0) {
    scheduleEl.innerHTML = '<div class="wv-empty">No se encontraron pausas configuradas para este puesto.</div>';
    return;
  }

  scheduleEl.innerHTML = `
    <div class="wv-schedule-list">
      ${pausas.map((p, i) => `
        <div class="wv-schedule-item">
          <div class="wv-sched-num">${i + 1}</div>
          <div class="wv-sched-time">${p.hora}</div>
          <div class="wv-sched-dur">${p.min} min</div>
          <div class="wv-sched-status" id="wvSchedStatus${i}">
            <span class="wv-dot"></span>
            Programada
          </div>
        </div>
      `).join('')}
    </div>`;

  activateWrap.style.display = '';

  shell.querySelector('#wvActivate').addEventListener('click', () => {
    // Delegate to the existing alert system from main
    if (typeof window.workerActivateAlerts === 'function') {
      window.workerActivateAlerts(result);
    }
  });
}

async function loadHistory(shell, workerId) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await supabase
    .from('break_events')
    .select('status, occurred_at, job_positions(name)')
    .eq('worker_id', workerId)
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false });

  const histEl = shell.querySelector('#wvHistory');

  if (!events || events.length === 0) {
    histEl.innerHTML = '<div class="wv-empty">No hay registros en los últimos 7 días.</div>';
    return;
  }

  histEl.innerHTML = `
    <div class="wv-history-list">
      ${events.map(ev => {
        const dt = new Date(ev.occurred_at);
        return `<div class="wv-hist-row">
          <div class="wv-hist-status wv-hist-${ev.status}">${statusIcon(ev.status)}</div>
          <div class="wv-hist-info">
            <div class="wv-hist-label">${statusLabel(ev.status)}</div>
            <div class="wv-hist-date">${dt.toLocaleDateString('es-PE')} ${dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div class="wv-hist-pos">${ev.job_positions?.name || ''}</div>
        </div>`;
      }).join('')}
    </div>`;
}

function statusIcon(s) {
  if (s === 'completed') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if (s === 'skipped') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>`;
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d97706" stroke-width="2"/><path d="M12 8v4l3 3" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function statusLabel(s) {
  return { completed: 'Completada', skipped: 'Saltada', postponed: 'Pospuesta' }[s] || s;
}

function injectWorkerStyles() {
  if (document.getElementById('wvStyles')) return;
  const style = document.createElement('style');
  style.id = 'wvStyles';
  style.textContent = `
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
  `;
  document.head.appendChild(style);
}
