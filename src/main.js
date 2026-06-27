import { supabase } from './lib/supabase.js';
import { getProfile } from './lib/auth.js';
import { navigate, getCurrentRoute, onRouteChange, initRouter } from './lib/router.js';
import { restoreSession, setupAlertCard, activateAlerts, deactivateAlerts, closePanel, expandPanel, collapsePanel, startBreak, postponeBreak, skipBreak, nextBreakStep, closeBreakOverlay, skipBreakFromOverlay } from './calculator/alerts.js';
import { mountBreakOverlay, createBreakOverlayHTML } from './components/break-overlay.js';
import { mountOnboardingModal, createOnboardingModalHTML } from './components/onboarding-modal.js';
import { pick, setMode, pickAct, toggleMixed, updateSlider, updatePctTotal, pickToggle, goStep, calcular, resetAll } from './calculator/engine.js';

// ─── Mount overlay/modal HTML ───────────────────────────────────────────────
document.body.insertAdjacentHTML('beforeend', createBreakOverlayHTML());
document.body.insertAdjacentHTML('beforeend', createOnboardingModalHTML());
mountBreakOverlay();
mountOnboardingModal();

// ─── Expose functions for inline onclick handlers ────────────────────────────
// Calculator
window.pick = pick;
window.setMode = setMode;
window.pickAct = pickAct;
window.toggleMixed = toggleMixed;
window.updateSlider = updateSlider;
window.updatePctTotal = updatePctTotal;
window.pickToggle = pickToggle;
window.goStep = goStep;
window.calcular = function() {
  const result = calcular();
  if (result && window.onCalcResult) window.onCalcResult(result);
};
window.resetAll = resetAll;
// Alerts
window.activateAlerts = activateAlerts;
window.deactivateAlerts = deactivateAlerts;
// Break panel actions (called from inline onclick in index.html)
window.startBreak = startBreak;
window.postponeBreak = postponeBreak;
window.skipBreak = skipBreak;
window.expandPanel = expandPanel;
window.collapsePanel = collapsePanel;
window.closePanel = closePanel;
// Overlay
window.nextBreakStep = nextBreakStep;
window.nextStep = nextBreakStep;
window.closeBreakOverlay = closeBreakOverlay;
window.skipBreakFromOverlay = skipBreakFromOverlay;
// Misc (called from existing HTML)
window.toggleReveal = function(id, val) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', val === 'si');
};
window.showScreenInfo = function() {};

// ─── View shell ─────────────────────────────────────────────────────────────
let viewShell = document.getElementById('viewShell');
if (!viewShell) {
  viewShell = document.createElement('div');
  viewShell.id = 'viewShell';
  document.body.appendChild(viewShell);
}

// ─── Calculator DOM (already in index.html) ─────────────────────────────────
const calculatorRoot = document.getElementById('calculatorRoot');

function showCalculator(show) {
  if (calculatorRoot) calculatorRoot.style.display = show ? '' : 'none';
}

function showShell(show) {
  viewShell.style.display = show ? '' : 'none';
  viewShell.style.minHeight = show ? '100vh' : '';
}

// ─── Auth state + routing ───────────────────────────────────────────────────
let currentProfile = null;

async function resolveProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { currentProfile = null; return null; }
    currentProfile = await getProfile(user.id);
    return currentProfile;
  } catch (_) {
    currentProfile = null;
    return null;
  }
}

async function handleRoute(route) {
  // Strip query string for matching
  const path = route.split('?')[0];

  // Public calculator
  if (path === '/' || path === '') {
    // Authenticated workers go directly to their panel
    const p = currentProfile || await resolveProfile();
    if (p?.role === 'worker') { navigate('/worker'); return; }

    showCalculator(true);
    showShell(false);
    // Pass current profile to the alert card if calculator has results
    if (window._calcResult) {
      const r = window._calcResult;
      const cfg = r.config || {};
      setupAlertCard(r.pausas, currentProfile?.full_name, cfg.horaIni || 7, cfg.postura || '2', cfg.mental || 'no', cfg.repetitivo || 'no', cfg.actUnica === 'conduccion', cfg.peso || '0', currentProfile);
    }
    return;
  }

  showCalculator(false);
  showShell(true);

  const profile = currentProfile || await resolveProfile();

  // Guard: redirect unauthenticated visitors away from protected routes
  if (['/superadmin', '/admin', '/worker'].includes(path) && !profile) {
    navigate('/login');
    return;
  }

  // Guard: redirect authenticated users away from auth pages
  if (['/login', '/register', '/setup'].includes(path) && profile) {
    redirectByRole(profile.role);
    return;
  }

  // Lazy-load view modules
  switch (path) {
    case '/login': {
      const { renderLogin } = await import('./views/login.js');
      await renderLogin(viewShell);
      break;
    }
    case '/register': {
      const { renderRegister } = await import('./views/register.js');
      renderRegister(viewShell);
      break;
    }
    case '/setup': {
      const { renderSetup } = await import('./views/setup.js');
      renderSetup(viewShell);
      break;
    }
    case '/superadmin': {
      if (profile?.role !== 'superadmin') { navigate('/login'); return; }
      const { renderSuperadmin } = await import('./views/superadmin.js');
      await renderSuperadmin(viewShell, profile);
      break;
    }
    case '/admin': {
      if (profile?.role !== 'admin') { navigate('/login'); return; }
      if (profile.company?.status !== 'active') {
        viewShell.innerHTML = pendingApprovalHTML(profile);
        return;
      }
      const { renderAdmin } = await import('./views/admin.js');
      await renderAdmin(viewShell, profile);
      break;
    }
    case '/worker': {
      if (profile?.role !== 'worker') { navigate('/login'); return; }
      const { renderWorker } = await import('./views/worker.js');
      await renderWorker(viewShell, profile);
      break;
    }
    default:
      navigate('/');
  }
}

function redirectByRole(role) {
  if (role === 'superadmin') navigate('/superadmin');
  else if (role === 'admin') navigate('/admin');
  else navigate('/worker');
}

function pendingApprovalHTML(profile) {
  return `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg,#f1f5f9)">
      <div style="background:#fff;border-radius:20px;padding:40px 32px;max-width:440px;width:100%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.1)">
        <div style="width:64px;height:64px;background:#fefce8;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d97706" stroke-width="1.8"/><path d="M12 8v4l3 3" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <h2 style="font-size:20px;font-weight:800;color:#0f2137;margin-bottom:8px">Solicitud en revisión</h2>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px">Tu empresa <strong>${profile.company?.name || ''}</strong> está pendiente de aprobación. Te notificaremos al correo registrado.</p>
        <button onclick="location.hash='/'" style="padding:12px 24px;background:#1a56db;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Volver a la calculadora</button>
      </div>
    </div>`;
}

// ─── Wire calculator → alert card (called from engine.js calcular) ───────────
window.onCalcResult = function(result) {
  window._calcResult = result;
  const cfg = result.config || {};
  setupAlertCard(result.pausas, currentProfile?.full_name, cfg.horaIni || 7, cfg.postura || '2', cfg.mental || 'no', cfg.repetitivo || 'no', cfg.actUnica === 'conduccion', cfg.peso || '0', currentProfile);

  // If admin is in save mode, show the save card
  if (window._adminSaveMode) {
    showAdminSaveCard(result);
  }

  // Show conversion CTA for unauthenticated users
  if (!currentProfile) {
    showRegisterCTA();
  }
};

// Admin: save a calculator result as a job position
function showAdminSaveCard(result) {
  let saveCard = document.getElementById('adminSaveCard');
  if (!saveCard) {
    saveCard = document.createElement('div');
    saveCard.id = 'adminSaveCard';
    saveCard.className = 'asc-card';
    const alertCard = document.getElementById('alertActivateCard');
    if (alertCard) alertCard.insertAdjacentElement('beforebegin', saveCard);
    else document.getElementById('calculatorRoot')?.appendChild(saveCard);
  }

  injectAdminSaveCardStyles();

  saveCard.innerHTML = `
    <div class="asc-header">
      <div class="asc-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="1.8"/><polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="1.8"/><polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="1.8"/></svg>
      </div>
      <div>
        <div class="asc-title">Guardar como puesto de trabajo</div>
        <div class="asc-sub">Asigna un nombre y guarda este resultado para tus trabajadores.</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px;align-items:center">
      <input id="ascPositionName" class="asc-input" type="text" placeholder="Ej: Digitador, Operador de caja…" style="flex:1">
      <button class="asc-btn" id="ascSaveBtn">Guardar puesto</button>
    </div>
    <div id="ascError" class="asc-error" style="display:none"></div>
    <div id="ascSuccess" class="asc-success" style="display:none"></div>
  `;
  saveCard.style.display = '';

  saveCard.querySelector('#ascSaveBtn').addEventListener('click', async () => {
    const name = saveCard.querySelector('#ascPositionName').value.trim();
    const errEl = saveCard.querySelector('#ascError');
    const okEl = saveCard.querySelector('#ascSuccess');
    errEl.style.display = 'none';
    okEl.style.display = 'none';

    if (!name) { errEl.textContent = 'Ingresa un nombre para el puesto.'; errEl.style.display = ''; return; }

    const btn = saveCard.querySelector('#ascSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Guardando…';

    const { error } = await supabase.from('job_positions').insert({
      company_id: window._adminSaveMode.companyId,
      name,
      config: result,
      result,
    });

    if (error) {
      errEl.textContent = error.message || 'Error al guardar.';
      errEl.style.display = '';
      btn.disabled = false;
      btn.textContent = 'Guardar puesto';
    } else {
      okEl.textContent = `Puesto "${name}" guardado correctamente.`;
      okEl.style.display = '';
      window._adminSaveMode?.onSave?.();
      setTimeout(() => { saveCard.style.display = 'none'; window._adminSaveMode = null; }, 2500);
    }
  });
}

function injectAdminSaveCardStyles() {
  if (document.getElementById('ascStyles')) return;
  const style = document.createElement('style');
  style.id = 'ascStyles';
  style.textContent = `
    .asc-card { background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:18px 20px;margin-top:16px; }
    .asc-header { display:flex;align-items:flex-start;gap:12px; }
    .asc-icon { width:38px;height:38px;background:var(--blue-light);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--blue);flex-shrink:0; }
    .asc-title { font-size:14px;font-weight:700;color:var(--navy);margin-bottom:2px; }
    .asc-sub { font-size:12px;color:var(--slate); }
    .asc-input { padding:10px 13px;border:1.5px solid var(--border);border-radius:9px;font-size:13px;font-family:inherit;color:var(--text);background:#fff;transition:border-color .15s; }
    .asc-input:focus { outline:none;border-color:var(--blue); }
    .asc-btn { padding:10px 16px;background:var(--navy);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .2s; }
    .asc-btn:hover { background:#1e3a5f; }
    .asc-btn:disabled { opacity:.6;cursor:not-allowed; }
    .asc-error { background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:7px;padding:8px 12px;font-size:12px;margin-top:8px; }
    .asc-success { background:var(--green-light);border:1px solid #a7f3d0;color:var(--green);border-radius:7px;padding:8px 12px;font-size:12px;margin-top:8px;font-weight:600; }
  `;
  document.head.appendChild(style);
}

// Conversion CTA shown to unauthenticated users after calculator result
function showRegisterCTA() {
  if (document.getElementById('registerCTA')) return;

  const cta = document.createElement('div');
  cta.id = 'registerCTA';
  cta.className = 'reg-cta-card';
  const alertCard = document.getElementById('alertActivateCard');
  if (alertCard) alertCard.insertAdjacentElement('afterend', cta);
  else document.getElementById('calculatorRoot')?.appendChild(cta);

  if (!document.getElementById('regCtaStyles')) {
    const style = document.createElement('style');
    style.id = 'regCtaStyles';
    style.textContent = `
      .reg-cta-card { background:linear-gradient(135deg,#0f2137 0%,#1a3a5c 100%);border-radius:16px;padding:24px 24px 20px;margin-top:16px;color:#fff; }
      .reg-cta-badge { display:inline-block;background:rgba(255,255,255,0.15);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px; }
      .reg-cta-title { font-size:18px;font-weight:800;margin-bottom:8px;line-height:1.3; }
      .reg-cta-sub { font-size:13px;opacity:.75;line-height:1.6;margin-bottom:18px; }
      .reg-cta-features { display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px; }
      .reg-cta-feat { display:flex;align-items:center;gap:6px;font-size:12px;opacity:.85; }
      .reg-cta-dot { width:6px;height:6px;border-radius:50%;background:#38bdf8;flex-shrink:0; }
      .reg-cta-btn { display:block;width:100%;padding:13px;background:#1a56db;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;text-align:center;box-sizing:border-box; }
      .reg-cta-btn:hover { background:#1d4ed8; }
    `;
    document.head.appendChild(style);
  }

  cta.innerHTML = `
    <div class="reg-cta-badge">Para empresas</div>
    <div class="reg-cta-title">Implementa estas pausas en tu empresa</div>
    <div class="reg-cta-sub">Registra tu empresa y crea un programa de pausas activas por puesto de trabajo. Tus trabajadores recibirán alertas en tiempo real.</div>
    <div class="reg-cta-features">
      <div class="reg-cta-feat"><div class="reg-cta-dot"></div>Alertas automáticas por puesto</div>
      <div class="reg-cta-feat"><div class="reg-cta-dot"></div>Acceso simple por DNI</div>
      <div class="reg-cta-feat"><div class="reg-cta-dot"></div>Reportes de cumplimiento</div>
    </div>
    <button class="reg-cta-btn" onclick="location.hash='/register'">Registrar mi empresa gratis</button>
  `;
}

// Worker portal: activate alerts from their saved position result
window.workerActivateAlerts = function(result) {
  if (!result?.pausas) return;
  const cfg = result.config || {};
  setupAlertCard(result.pausas, currentProfile?.full_name, cfg.horaIni || 7, cfg.postura || '2', cfg.mental || 'no', cfg.repetitivo || 'no', cfg.actUnica === 'conduccion', cfg.peso || '0', currentProfile);
  activateAlerts();
};

// Header auth links
function renderHeaderAuth(profile) {
  const headerRight = document.querySelector('.header-right');
  if (!headerRight) return;

  if (profile) {
    const roleLabel = { superadmin: 'Superadmin', admin: 'Admin', worker: profile.full_name || 'Trabajador' }[profile.role] || '';
    headerRight.innerHTML = `
      <span style="font-size:12px;color:var(--slate);font-weight:600">${roleLabel}</span>
      <button onclick="location.hash='/${profile.role === 'superadmin' ? 'superadmin' : profile.role === 'admin' ? 'admin' : 'worker'}'" style="padding:7px 14px;background:var(--blue-light);color:var(--blue);border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Mi panel</button>
    `;
  } else {
    headerRight.innerHTML = `
      <button onclick="location.hash='/login'" style="padding:7px 14px;background:var(--blue-light);color:var(--blue);border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Iniciar sesión</button>
      <button onclick="location.hash='/register'" style="padding:7px 14px;background:var(--blue);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Registrar empresa</button>
    `;
  }
}

// ─── Service worker (Web Push) ───────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
supabase.auth.onAuthStateChange((event, session) => {
  (async () => {
    if (session?.user) {
      currentProfile = await getProfile(session.user.id);
    } else {
      currentProfile = null;
    }
    renderHeaderAuth(currentProfile);

    // If on calculator and result already visible, refresh the alert card
    const path = getCurrentRoute().split('?')[0];
    if ((path === '/' || path === '') && window._calcResult) {
      const r = window._calcResult;
      const cfg = r.config || {};
      setupAlertCard(r.pausas, currentProfile?.full_name, cfg.horaIni || 7, cfg.postura || '2', cfg.mental || 'no', cfg.repetitivo || 'no', cfg.actUnica === 'conduccion', cfg.peso || '0', currentProfile);
    }

    // After sign-out, redirect to home if on a protected route
    if (event === 'SIGNED_OUT' && ['/superadmin', '/admin', '/worker'].includes(path)) {
      navigate('/');
    }
  })();
});

// Restore break session before routing
restoreSession();

// Set up router
onRouteChange(handleRoute);
initRouter();
