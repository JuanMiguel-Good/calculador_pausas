import { supabase } from '../lib/supabase.js';
import { buildExerciseSteps } from './exercises.js';

export const BS = {
  sessionId: null,
  workerName: '',
  workerId: null,
  companyId: null,
  jobPositionId: null,
  pausas: [],
  exercises: [],
  timers: [],
  current: null,
  postponedFor: {},
  stepIndex: 0,
  stepTimer: null,
  totalCompleted: 0,
  active: false,
  isDemo: false,
  horaIni: 7,
};

// ── Overlay helpers ──
function showOverlay() {
  const o = document.getElementById('breakOverlay');
  if (o) o.style.display = 'flex';
}
function hideOverlay() {
  const o = document.getElementById('breakOverlay');
  if (o) o.style.display = 'none';
}
function setOverlayExercise() {
  const o = document.getElementById('breakOverlay');
  const d = document.getElementById('bovDone');
  const a = document.getElementById('bovActions');
  const ex = document.getElementById('bovExercise');
  if (o) o.style.display = 'flex';
  if (d) d.style.display = 'none';
  if (a) a.style.display = 'flex';
  if (ex) ex.style.display = 'block';
}
function setOverlayDone() {
  const d = document.getElementById('bovDone');
  const a = document.getElementById('bovActions');
  const ex = document.getElementById('bovExercise');
  if (d) d.style.display = 'block';
  if (a) a.style.display = 'none';
  if (ex) ex.style.display = 'none';
}

function updateRingTimer(secs, totalSecs) {
  const ring = document.getElementById('bovRingFill');
  const text = document.getElementById('bovRingText');
  if (!ring || !text) return;
  const circumference = 138.2;
  const pct = secs / totalSecs;
  ring.style.strokeDashoffset = circumference * (1 - pct);
  text.textContent = fmtSecs(secs);
}

// ── Activate / deactivate ──
export function activateAlerts() {
  if (!BS.pausas.length) return;

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  BS.sessionId = crypto.randomUUID();
  BS.active = true;
  saveSession();
  scheduleBreaks();
  renderActivationStatus();
  showDemoBreak();
}

export function deactivateAlerts() {
  BS.timers.forEach(t => clearTimeout(t));
  BS.timers = [];
  BS.active = false;
  localStorage.removeItem('breakSession');
  renderActivationStatus();
}

export function renderActivationStatus() {
  const btn = document.getElementById('aacBtn');
  const btnOff = document.getElementById('aacBtnOff');
  const status = document.getElementById('aacStatus');
  if (!btn) return;

  if (BS.active) {
    btn.style.display = 'none';
    btnOff.style.display = 'block';
    status.style.display = 'block';

    const now = Date.now();
    const next = BS.pausas.find(p => clockTimeForOffset(p.at) > now);

    let html = '<div class="aac-status-line">';
    if (next) {
      const realMs = clockTimeForOffset(next.at);
      const h = new Date(realMs).getHours(), m = new Date(realMs).getMinutes();
      html += 'Alertas activas &middot; Próxima pausa: ' + fmt2(h, m);
    } else {
      html += 'Alertas activas &middot; Todas las pausas de hoy ya ocurrieron';
    }
    html += '</div><div class="aac-schedule">';
    BS.pausas.forEach(p => {
      const fireMs = clockTimeForOffset(p.at);
      const passed = fireMs <= now;
      const isNext = p === next;
      const h = new Date(fireMs).getHours(), m = new Date(fireMs).getMinutes();
      html += '<div class="aac-sch-row' + (passed ? ' aac-sch-past' : '') + (isNext ? ' aac-sch-next' : '') + '">'
        + '<span class="aac-sch-dot"></span>'
        + '<span class="aac-sch-time">' + fmt2(h, m) + '</span>'
        + '<span class="aac-sch-dur">' + p.dur + '&nbsp;min</span>'
        + (passed ? '<span class="aac-sch-badge aac-sch-badge-past">Pasó</span>' : isNext ? '<span class="aac-sch-badge aac-sch-badge-next">Próxima</span>' : '')
        + '</div>';
    });
    html += '</div>';
    status.innerHTML = html;
  } else {
    btn.style.display = 'block';
    btnOff.style.display = 'none';
    status.style.display = 'none';
  }
}

export function clockTimeForOffset(offsetMin) {
  const now = new Date();
  const startMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), BS.horaIni, 0, 0, 0).getTime();
  return startMs + offsetMin * 60000;
}

export function scheduleBreaks() {
  BS.timers.forEach(t => clearTimeout(t));
  BS.timers = [];
  BS.pausas.forEach((p, index) => {
    const fireAt = clockTimeForOffset(p.at);
    const delay = fireAt - Date.now();
    if (delay <= 0) return;
    const t = setTimeout(() => showBreakPanel(index, p), delay);
    BS.timers.push(t);
  });
}

export function showDemoBreak() {
  const demoBreak = BS.pausas[0] ? { ...BS.pausas[0] } : { at: 0, dur: 5, tipo: 'activa' };
  BS.isDemo = true;
  BS.current = { index: 0, pausaObj: demoBreak };
  BS.stepIndex = 0;

  const barText = document.getElementById('bpBarText');
  const bpLabel = document.getElementById('bpLabel');
  const bpDur = document.getElementById('bpDur');
  const postBtn = document.getElementById('bpPostpone');
  if (barText) barText.textContent = 'Vista previa — así se verán tus alertas';
  if (bpLabel) bpLabel.textContent = 'Pausa de prueba';
  if (bpDur) bpDur.textContent = demoBreak.dur + ' minutos';
  if (postBtn) { postBtn.disabled = false; postBtn.title = 'Posponer 5 minutos'; }

  showState('idle');
  expandPanel();
  const panel = document.getElementById('breakPanel');
  if (panel) { panel.classList.remove('bp-hidden'); panel.classList.add('bp-visible'); }
}

export function showBreakPanel(index, pausaObj) {
  BS.current = { index, pausaObj };
  BS.stepIndex = 0;
  const panel = document.getElementById('breakPanel');
  const barText = document.getElementById('bpBarText');
  const bpLabel = document.getElementById('bpLabel');
  const bpDur = document.getElementById('bpDur');
  const postBtn = document.getElementById('bpPostpone');

  if (barText) barText.textContent = 'Pausa #' + (index + 1) + ' — es hora de descansar';
  if (bpLabel) bpLabel.textContent = 'Pausa activa #' + (index + 1);
  if (bpDur) bpDur.textContent = pausaObj.dur + ' minutos';
  if (postBtn) { postBtn.disabled = !!BS.postponedFor[index]; postBtn.title = BS.postponedFor[index] ? 'Ya pospusiste esta pausa' : 'Posponer 5 minutos'; }

  showState('idle');
  expandPanel();
  if (panel) { panel.classList.remove('bp-hidden'); panel.classList.add('bp-visible'); }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Pausa activa', { body: 'Es hora de tu pausa #' + (index + 1) + ' de ' + pausaObj.dur + ' min', tag: 'break-' + index });
  }
}

export function closePanel() {
  const panel = document.getElementById('breakPanel');
  if (panel) { panel.classList.add('bp-hidden'); panel.classList.remove('bp-visible'); }
  if (BS.stepTimer) { clearInterval(BS.stepTimer); BS.stepTimer = null; }
  BS.isDemo = false;
  showState('idle');
}

export function expandPanel() {
  const bar = document.getElementById('bpBar');
  const body = document.getElementById('bpBody');
  if (bar) bar.style.display = 'none';
  if (body) body.style.display = 'block';
}

export function collapsePanel() {
  const bar = document.getElementById('bpBar');
  const body = document.getElementById('bpBody');
  if (bar) bar.style.display = 'flex';
  if (body) body.style.display = 'none';
}

export function showState(state) {
  const idle = document.getElementById('bpIdle');
  const active = document.getElementById('bpActive');
  const done = document.getElementById('bpDone');
  if (idle) idle.style.display = state === 'idle' ? 'block' : 'none';
  if (active) active.style.display = state === 'active' ? 'block' : 'none';
  if (done) done.style.display = state === 'done' ? 'block' : 'none';
}

// ── startBreak: hides panel, shows centered overlay ──
export function startBreak() {
  if (BS.stepTimer) clearInterval(BS.stepTimer);
  BS.stepIndex = 0;
  closePanel();

  // Pre-load all GIF/image assets so the browser caches them before display
  BS.exercises.forEach(s => {
    if (s.media) { const i = new Image(); i.src = s.media; }
  });

  // Set up overlay header info
  const label = document.getElementById('bovLabel');
  const dur = document.getElementById('bovDur');
  if (BS.current && BS.current.pausaObj) {
    if (label) label.textContent = BS.isDemo ? 'Vista previa de pausa' : 'Pausa activa #' + (BS.current.index + 1);
    if (dur) dur.textContent = BS.current.pausaObj.dur + ' minutos';
  }

  setOverlayExercise();
  renderBreakStep();
}

export function postponeBreak() {
  if (BS.isDemo) { closePanel(); return; }
  const { index, pausaObj } = BS.current;
  if (BS.postponedFor[index]) return;
  BS.postponedFor[index] = true;
  trackEvent('postponed');
  closePanel();
  const t = setTimeout(() => showBreakPanel(index, pausaObj), 5 * 60000);
  BS.timers.push(t);
}

export function skipBreak() {
  if (BS.isDemo) { closePanel(); return; }
  if (!confirm('¿Seguro que quieres saltar esta pausa? Tu cuerpo lo registra aunque tu pantalla no.')) return;
  trackEvent('skipped');
  closePanel();
}

// ── Overlay exercise step renderer ──
function renderBreakStep() {
  const steps = BS.exercises;
  const step = steps[BS.stepIndex];
  if (!step) { finishBreak(); return; }

  const total = steps.length;
  const pct = (BS.stepIndex / total) * 100;
  const fill = document.getElementById('bovProgressFill');
  const progressLabel = document.getElementById('bovProgressLabel');
  const icon = document.getElementById('bovExIcon');
  const media = document.getElementById('bovExMedia');
  const name = document.getElementById('bovExName');
  const inst = document.getElementById('bovExInst');
  const nextBtn = document.getElementById('bovNextBtn');

  if (fill) fill.style.width = pct + '%';
  if (progressLabel) progressLabel.textContent = 'Ejercicio ' + (BS.stepIndex + 1) + ' de ' + total;

  if (step.media) {
    if (media) {
      const img = document.createElement('img');
      img.alt = step.name;
      img.src = step.media;
      media.innerHTML = '';
      media.appendChild(img);
      media.style.display = '';
    }
    if (icon) icon.style.display = 'none';
  } else {
    if (media) {
      media.innerHTML = '';
      media.style.display = 'none';
    }
    if (icon) { icon.style.display = ''; icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="color:var(--blue)"><use href="#ico-' + step.ic + '"/></svg>'; }
  }
  if (name) name.textContent = step.name;
  if (inst) inst.textContent = step.inst;
  if (nextBtn) nextBtn.textContent = BS.stepIndex < total - 1 ? 'Siguiente ejercicio' : 'Terminar pausa';

  const totalSecs = step.secs;
  let remaining = totalSecs;
  updateRingTimer(remaining, totalSecs);

  if (BS.stepTimer) clearInterval(BS.stepTimer);
  BS.stepTimer = setInterval(() => {
    remaining--;
    updateRingTimer(remaining, totalSecs);
    if (remaining <= 0) {
      clearInterval(BS.stepTimer);
      BS.stepTimer = null;
      setTimeout(() => nextBreakStep(), 1500);
    }
  }, 1000);
}

export function nextBreakStep() {
  if (BS.stepTimer) { clearInterval(BS.stepTimer); BS.stepTimer = null; }
  BS.stepIndex++;
  if (BS.stepIndex >= BS.exercises.length) {
    finishBreak();
  } else {
    renderBreakStep();
  }
}

export function closeBreakOverlay() {
  if (BS.stepTimer) { clearInterval(BS.stepTimer); BS.stepTimer = null; }
  hideOverlay();
  BS.isDemo = false;
}

export function skipBreakFromOverlay() {
  if (BS.isDemo) { closeBreakOverlay(); return; }
  const confirmed = confirm('¿Seguro que quieres saltar esta pausa? Tu cuerpo lo registra aunque tu pantalla no.');
  if (!confirmed) return;
  if (BS.stepTimer) { clearInterval(BS.stepTimer); BS.stepTimer = null; }
  trackEvent('skipped');
  hideOverlay();
}

function finishBreak() {
  if (BS.stepTimer) { clearInterval(BS.stepTimer); BS.stepTimer = null; }
  BS.totalCompleted++;

  const fill = document.getElementById('bovProgressFill');
  if (fill) fill.style.width = '100%';

  const ring = document.getElementById('bovRingFill');
  const text = document.getElementById('bovRingText');
  if (ring) ring.style.strokeDashoffset = '0';
  if (text) text.textContent = '✓';

  const total = BS.pausas.length;
  const remaining = total - BS.totalCompleted;
  let msg = 'Completaste ' + BS.totalCompleted + ' de ' + total + ' pausa' + (total !== 1 ? 's' : '') + ' hoy.';
  if (remaining > 0) msg += ' Quedan ' + remaining + ' más.';
  else msg += ' ¡Completaste todas las pausas del día!';

  const doneSub = document.getElementById('bovDoneSub');
  if (doneSub) doneSub.textContent = msg;

  setOverlayDone();
  trackEvent('completed');
  renderActivationStatus();
}

async function trackEvent(action) {
  if (BS.isDemo) return;
  if (!BS.current || !BS.sessionId) return;
  const { index, pausaObj } = BS.current;
  const realMs = clockTimeForOffset(pausaObj.at);
  try {
    await supabase.from('break_events').insert({
      session_id: BS.sessionId,
      worker_name: BS.workerName || '',
      break_index: index,
      scheduled_time: new Date(realMs).toISOString(),
      duration_min: pausaObj.dur,
      action,
      worker_id: BS.workerId || null,
      company_id: BS.companyId || null,
      job_position_id: BS.jobPositionId || null,
    });
  } catch (_) { /* non-critical */ }
}

export function saveSession() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('breakSession', JSON.stringify({
    date: today,
    sessionId: BS.sessionId,
    workerName: BS.workerName,
    horaIni: BS.horaIni,
    pausas: BS.pausas,
    workerId: BS.workerId,
    companyId: BS.companyId,
    jobPositionId: BS.jobPositionId,
  }));
}

export function restoreSession() {
  const raw = localStorage.getItem('breakSession');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (saved.date !== today) { localStorage.removeItem('breakSession'); return; }
    BS.sessionId = saved.sessionId;
    BS.workerName = saved.workerName;
    BS.horaIni = saved.horaIni;
    BS.pausas = saved.pausas;
    BS.workerId = saved.workerId || null;
    BS.companyId = saved.companyId || null;
    BS.jobPositionId = saved.jobPositionId || null;
    BS.active = true;
    BS.exercises = buildExerciseSteps('2', 'no', 'no', false, '0');
    scheduleBreaks();
    renderActivationStatus();
  } catch (_) { localStorage.removeItem('breakSession'); }
}

export function setupAlertCard(pausas, workerName, horaIni, postura, mental, repetitivo, esConductor, peso, profile) {
  BS.pausas = pausas || [];
  BS.workerName = workerName || '';
  BS.horaIni = horaIni || 7;
  BS.exercises = buildExerciseSteps(postura, mental, repetitivo, esConductor, peso);
  BS.postponedFor = {};
  BS.totalCompleted = 0;
  BS.workerId = profile?.id || null;
  BS.companyId = profile?.company_id || null;

  const card = document.getElementById('alertActivateCard');
  if (!card) return;

  if (BS.pausas.length === 0) { card.style.display = 'none'; return; }

  card.style.display = 'block';

  // If user is not logged in, show onboarding CTA instead of direct activate
  if (!profile) {
    const aacBtn = document.getElementById('aacBtn');
    const aacBtnOff = document.getElementById('aacBtnOff');
    if (aacBtn) {
      aacBtn.textContent = 'Activar alertas gratis';
      aacBtn.onclick = () => window.showOnboarding?.();
    }
    if (aacBtnOff) aacBtnOff.style.display = 'none';
    const header = card.querySelector('.aac-header');
    if (header) {
      const sub = header.querySelector('.aac-sub');
      if (sub) sub.textContent = 'Regístrate o inicia sesión para activar alertas en tiempo real y llevar el registro de cumplimiento.';
    }
  } else {
    const aacBtn = document.getElementById('aacBtn');
    if (aacBtn) {
      aacBtn.textContent = 'Activar alertas para hoy';
      aacBtn.onclick = () => activateAlerts();
    }
  }

  renderActivationStatus();
}

function fmtSecs(s) {
  if (s <= 0) return '0:00';
  const m = Math.floor(s / 60), sec = s % 60;
  return m + ':' + String(sec).padStart(2, '0');
}
function fmt2(h, m) {
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
