import { supabase } from '../lib/supabase.js';
import { signOut } from '../lib/auth.js';
import { navigate } from '../lib/router.js';
import { mountNav, ICONS } from '../components/nav.js';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
  || 'BNxx-vzPooERleLp7DPREp4Pbkd5NtYUnKKu-1Vw3yyy8_CrJ0LL0IOPP52ErOcBt0OgXywpc0_hN_Hd0X6y2E0';

export async function renderWorker(shell, profile) {
  shell.innerHTML = `
<div class="wv-wrap">
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
</div>`;

  injectWorkerStyles();

  const nav = mountNav(shell.querySelector('.wv-wrap'), {
    user: { name: profile.full_name || 'Trabajador', roleLabel: profile.company?.name || 'Trabajador' },
    items: [
      { key: 'schedule', icon: ICONS.calendar, label: 'Mi horario', onClick: () => showSection('schedule') },
      { key: 'history',  icon: ICONS.history,  label: 'Historial',  onClick: () => showSection('history') },
      { key: 'alerts',   icon: ICONS.bell,     label: 'Alertas',    onClick: () => showSection('alerts') },
    ],
    onLogout: async () => { await signOut(); navigate('/login'); },
  });

  function showSection(key) {
    shell.querySelector('#wvSectionSchedule').style.display = (key === 'schedule') ? '' : 'none';
    shell.querySelector('#wvSectionHistory').style.display  = (key === 'history')  ? '' : 'none';
    shell.querySelector('#wvPushWrap').style.display        = (key === 'alerts')   ? '' : 'none';
    nav.setActive(key);
  }

  // Schedule is visible by default; push section controlled by loadWorkerData
  shell.querySelector('#wvSectionHistory').style.display = 'none';

  await loadWorkerData(shell, profile, nav, showSection);
}

async function loadWorkerData(shell, profile, nav, showSection) {
  const { data: assignment } = await supabase
    .from('worker_assignments')
    .select('job_position_id, job_positions(id, name, result)')
    .eq('worker_id', profile.id)
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = assignment?.job_positions;
  const posBadge = shell.querySelector('#wvPosBadge');

  if (position) {
    posBadge.textContent = position.name;
    posBadge.classList.add('wv-pos-active');
    renderSchedule(shell, position.result);
    renderPushSection(shell, profile, showSection, nav, position.result);
  } else {
    posBadge.textContent = 'Sin puesto asignado';
    shell.querySelector('#wvSchedule').innerHTML = '<div class="wv-empty">Aún no tienes un puesto asignado. Comunícate con tu administrador.</div>';
  }

  await loadHistory(shell, profile.id);
}

function fmtTime(totalMin) {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function renderSchedule(shell, result) {
  const pausas = result?.pausas || [];
  const horaIni = result?.config?.horaIni ?? 7;
  const scheduleEl = shell.querySelector('#wvSchedule');

  if (pausas.length === 0) {
    scheduleEl.innerHTML = '<div class="wv-empty">No se encontraron pausas configuradas para este puesto.</div>';
    return;
  }

  scheduleEl.innerHTML = `
    <div class="wv-schedule-list">
      ${pausas.map((p, i) => {
        const start = fmtTime(horaIni * 60 + p.at);
        const end = fmtTime(horaIni * 60 + p.at + p.dur);
        return `
        <div class="wv-schedule-item">
          <div class="wv-sched-num">${i + 1}</div>
          <div class="wv-sched-time">${start} – ${end}</div>
          <div class="wv-sched-dur">${p.dur} min</div>
          <div class="wv-sched-status" id="wvSchedStatus${i}">
            <span class="wv-dot"></span>
            Programada
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderPushSection(shell, profile, showSection, nav, positionResult) {
  const wrap = shell.querySelector('#wvPushWrap');
  const offEl = shell.querySelector('#wvPushOff');
  const onEl = shell.querySelector('#wvPushOn');

  function showActive() { offEl.style.display = 'none'; onEl.style.display = ''; }
  function showInactive() { offEl.style.display = ''; onEl.style.display = 'none'; }

  if (profile.alerts_enabled) { showActive(); } else { showInactive(); }

  // If nav "Alertas" item is clicked, show the push wrap
  wrap.style.display = '';
  showSection('schedule'); // start on schedule view

  shell.querySelector('#wvActivate').addEventListener('click', async () => {
    const errEl = shell.querySelector('#wvPushError');
    errEl.style.display = 'none';
    const btn = shell.querySelector('#wvActivate');
    btn.disabled = true;
    btn.textContent = 'Activando…';

    const result = await subscribeToPush(profile.id);
    if (result.error) {
      errEl.textContent = result.error;
      errEl.style.display = '';
      btn.disabled = false;
      btn.textContent = 'Activar alertas';
    } else {
      showActive();
      window.workerActivateAlerts?.(positionResult);
    }
  });

  shell.querySelector('#wvDeactivate').addEventListener('click', () => {
    showInactive();
    unsubscribeFromPush(profile.id);
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function subscribeToPush(workerId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { error: 'Tu navegador no soporta notificaciones push. Usa Chrome, Edge o Firefox.' };
  }

  let permission = Notification.permission;
  if (permission === 'denied') {
    return { error: 'Las notificaciones están bloqueadas en tu navegador. Habilítalas en la configuración del sitio.' };
  }
  if (permission !== 'granted') {
    permission = await Promise.race([
      Notification.requestPermission(),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 15000)),
    ]);
  }
  if (permission !== 'granted') {
    return { error: permission === 'timeout'
      ? 'El diálogo de permisos no respondió. Verifica que las notificaciones no estén bloqueadas a nivel del sistema.'
      : 'Necesitas permitir las notificaciones para activar las alertas.' };
  }

  try {
    const swReady = Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('El servicio de notificaciones tardó demasiado. Recarga la página e intenta de nuevo.')), 8000)),
    ]);
    const registration = await swReady;
    const subscription = await Promise.race([
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('El registro de notificaciones expiró. Verifica tu conexión e intenta de nuevo.')), 10000)),
    ]);

    const { error } = await supabase
      .from('profiles')
      .update({ alerts_enabled: true, push_subscription: subscription.toJSON() })
      .eq('id', workerId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err) {
    return { error: err.message || 'Error al activar las alertas.' };
  }
}

async function unsubscribeFromPush(workerId) {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);
      const sub = await Promise.race([
        registration.pushManager.getSubscription(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);
      if (sub) {
        await Promise.race([
          sub.unsubscribe(),
          new Promise(resolve => setTimeout(resolve, 5000)),
        ]);
      }
    }
  } catch (_) { /* ignore — still clear DB record */ }

  try {
    await supabase
      .from('profiles')
      .update({ alerts_enabled: false, push_subscription: null })
      .eq('id', workerId);
  } catch (_) { /* non-critical */ }
}

async function loadHistory(shell, workerId) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await supabase
    .from('break_events')
    .select('action, created_at, job_positions(name)')
    .eq('worker_id', workerId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  const histEl = shell.querySelector('#wvHistory');

  if (!events || events.length === 0) {
    histEl.innerHTML = '<div class="wv-empty">No hay registros en los últimos 7 días.</div>';
    return;
  }

  histEl.innerHTML = `
    <div class="wv-history-list">
      ${events.map(ev => {
        const dt = new Date(ev.created_at);
        return `<div class="wv-hist-row">
          <div class="wv-hist-status wv-hist-${ev.action}">${statusIcon(ev.action)}</div>
          <div class="wv-hist-info">
            <div class="wv-hist-label">${statusLabel(ev.action)}</div>
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
  `;
  document.head.appendChild(style);
}
