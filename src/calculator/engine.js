import { distribuirPorPct, distribuirNPausas, distribuirCadaX } from './distribute.js';

// ── Calculation state ──
export const S = {
  horas: 8, turno: 'dia', horaIni: 7,
  peso: '0', tcarga: '1',
  mode: 'unico',
  actUnica: null,
  mixActs: {},
  isMixed: false,
  postura: '2', posturaEsPantalla: false, esConductor: false,
  mental: 'no', repetitivo: 'no', nocturno: 'no',
};

const tabA7 = {
  '0': { '1': 0, '2': 0, '3': 0, '4': 0 },
  '1': { '1': 0, '2': 0, '3': 3, '4': 3 },
  '2': { '1': 0, '2': 0, '3': 3, '4': 7 },
  '3': { '1': 0, '2': 3, '3': 7, '4': 10 },
  '4': { '1': 3, '2': 7, '3': 10, '4': 13 },
};

export function fmt(h, m) {
  return String(h % 24).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

export function deriveFromActivity(act) {
  S.posturaEsPantalla = false; S.esConductor = false; S.mental = 'no';
  if (act === 'pantalla') { S.postura = '2'; S.posturaEsPantalla = true; S.mental = 'si'; }
  else if (act === 'conduccion') { S.postura = '7'; S.esConductor = true; }
  else if (act === 'forzada') { S.postura = '7'; }
  else { S.postura = '2'; }
}

export function pick(el) {
  const g = el.dataset.g, v = el.dataset.v;
  document.querySelectorAll(`[data-g="${g}"]`).forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  S[g] = v;
  if (g === 'horas') S.horas = parseInt(v);
  if (g === 'turno') S.turno = v;
  if (g === 'peso') {
    if (v === '0') {
      S.tcarga = '1';
      document.getElementById('tcargaWrap').style.display = 'none';
      document.getElementById('btn2').disabled = false;
    } else {
      document.getElementById('tcargaWrap').style.display = 'block';
      S.tcarga = null;
      document.getElementById('btn2').disabled = true;
    }
  }
  if (g === 'tcarga') { S.tcarga = v; document.getElementById('btn2').disabled = false; }
}

export function setMode(mode) {
  S.mode = mode; S.actUnica = null; S.mixActs = {}; S.isMixed = false;
  document.getElementById('modeUnico').classList.toggle('sel', mode === 'unico');
  document.getElementById('modeMixto').classList.toggle('sel', mode === 'mixto');
  document.getElementById('wrapUnico').style.display = mode === 'unico' ? 'block' : 'none';
  document.getElementById('wrapMixto').style.display = mode === 'mixto' ? 'block' : 'none';
  document.getElementById('btn3').disabled = true;
  ['pantalla', 'fisico', 'conduccion'].forEach(a => {
    const el = document.getElementById('mx-' + a);
    const ck = document.getElementById('mxck-' + a);
    if (el) el.classList.remove('active');
    if (ck) ck.style.display = 'none';
  });
  updatePctTotal();
}

export function pickAct(el) {
  document.querySelectorAll('.act-card').forEach(c => c.classList.remove('sel', 'sel-orange', 'sel-purple'));
  const act = el.dataset.act;
  const cls = act === 'conduccion' ? 'sel-orange' : act === 'pantalla' ? 'sel-purple' : 'sel';
  el.classList.add(cls);
  S.actUnica = act; S.isMixed = false;
  deriveFromActivity(act);
  document.getElementById('btn3').disabled = false;
}

export function toggleMixed(act) {
  const el = document.getElementById('mx-' + act);
  const ck = document.getElementById('mxck-' + act);
  const active = el.classList.contains('active');
  if (active) {
    el.classList.remove('active');
    if (ck) ck.style.display = 'none';
    delete S.mixActs[act];
  } else {
    el.classList.add('active');
    if (ck) ck.style.display = 'block';
    const sl = document.getElementById('sl-' + act);
    S.mixActs[act] = sl ? parseInt(sl.value) : 50;
  }
  updatePctTotal();
}

export function updateSlider(act, val) {
  const disp = document.getElementById('pctv-' + act);
  if (disp) disp.textContent = val;
  S.mixActs[act] = parseInt(val);
  const sl = document.getElementById('sl-' + act);
  if (sl) {
    const pct = (val - 10) / (90 - 10) * 100;
    sl.style.background = `linear-gradient(to right, var(--blue) 0%, var(--blue) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`;
  }
  updatePctTotal();
}

export function updatePctTotal() {
  const entries = Object.entries(S.mixActs);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  const el = document.getElementById('pctTotal');
  const warn = document.getElementById('pctWarn');
  if (!el) return;
  el.textContent = total + '%';
  el.className = 'pt-num' + (total === 100 ? ' ok' : total > 100 ? ' over' : ' under');
  const ok = total === 100 && entries.length >= 2;
  if (warn) warn.classList.toggle('show', total !== 100 && entries.length > 0);
  document.getElementById('btn3').disabled = !ok;
  if (ok) {
    const dominant = entries.sort((a, b) => b[1] - a[1])[0][0];
    deriveFromActivity(dominant);
    S.isMixed = true;
  }
}

export function pickToggle(el, group, val) {
  document.querySelectorAll(`[data-g="${group}"]`).forEach(b => b.classList.remove('sel', 'sel-no'));
  if (val === 'no') el.classList.add('sel-no');
  else el.classList.add('sel');
  S[group] = val;
  toggleReveal('rev-' + (group === 'repetitivo' ? 'rep' : group === 'nocturno' ? 'noc' : group), val);
}

function toggleReveal(id, val) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', val === 'si');
}

const STEP_LABELS = ['', 'Tu trabajo', 'Carga física', 'Postura', 'Carga mental', 'Resultado'];
export function goStep(n) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('step' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
  }
  for (let i = 1; i <= 5; i++) {
    const c = document.getElementById('pc' + i), l = document.getElementById('pl' + i);
    if (!c) continue;
    c.className = 'pstep-circle' + (i < n ? ' done' : i === n ? ' active' : '');
    l.className = 'pstep-label' + (i < n ? ' done' : i === n ? ' active' : '');
    if (i < 5) { const ln = document.getElementById('pln' + i); if (ln) ln.className = 'pline' + (i < n ? ' done' : ''); }
  }
  const shell = document.querySelector('.progress-shell');
  if (shell) shell.setAttribute('data-label', 'Paso ' + n + ' de 5 · ' + STEP_LABELS[n]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function calcular() {
  S.horaIni = parseInt(document.getElementById('inHoraIni').value) || 7;
  S.horas = parseInt(document.querySelector('[data-g="horas"].sel')?.dataset.v) || 8;
  const nombre = document.getElementById('inNombre').value || 'Puesto evaluado';
  const totalMin = S.horas * 60;
  const refrigMin = 60;

  if (S.mode === 'unico' && S.actUnica) deriveFromActivity(S.actUnica);

  const refrig13h = 13 * 60;
  const inicioAbs = S.horaIni * 60;
  let refrigOffset;
  if (inicioAbs < refrig13h && inicioAbs + totalMin > refrig13h) {
    refrigOffset = refrig13h - inicioAbs;
  } else {
    refrigOffset = Math.floor(totalMin / 2);
  }
  refrigOffset = Math.max(90, Math.min(refrigOffset, totalMin - refrigMin - 30));

  const pA7 = tabA7[S.peso][S.tcarga || '1'];
  const mA7 = Math.round(totalMin * pA7 / 100);
  const reglas = [];
  reglas.push({
    id: 'a7', fuente: 'Anexo 7 · Carga física',
    regla: pA7 === 0 ? 'Sin manipulación de cargas significativa' : pA7 + '% de la jornada = ' + mA7 + ' min',
    detalle: pA7 === 0 ? 'No aplica pausa adicional por este criterio.' : 'Tabla según peso manipulado y tiempo de exposición.',
    minutos: mA7, pausas: pA7 === 0 ? [] : distribuirPorPct(mA7, S.horas, S.horaIni, refrigMin, refrigOffset), activo: pA7 > 0,
  });

  const pA8 = parseInt(S.postura || '2');
  const mA8 = Math.round(totalMin * pA8 / 100);
  const postLabels = { '2': 'Postura favorable (2%)', '3': 'Parado/caminando (3%)', '5': 'De pie constante (5%)', '7': 'Postura forzada (7%)' };
  reglas.push({
    id: 'a8', fuente: 'Anexo 8 · Postura',
    regla: S.posturaEsPantalla ? 'Trabajo en escritorio/pantalla → 2% por postura' : (postLabels[String(pA8)] || pA8 + '%'),
    detalle: pA8 === 7 ? 'Cambio postural cada hora. Nunca más de 2 horas en la misma posición.' : 'Pausas según porcentaje de la jornada.',
    minutos: mA8, pausas: mA8 === 0 ? [] : distribuirPorPct(mA8, S.horas, S.horaIni, refrigMin, refrigOffset), activo: true,
  });

  let mConduc = 0, pausasConduc = [];
  if (S.esConductor) {
    let t = 120;
    while (t < totalMin - 15) {
      let at = t;
      if (at >= refrigOffset - 5 && at <= refrigOffset + refrigMin + 5) at = refrigOffset + refrigMin + 5;
      if (at + 15 <= totalMin) pausasConduc.push({ at, dur: 15, tipo: 'pausa' });
      t += 120 + 15;
    }
    mConduc = pausasConduc.length * 15;
  }
  reglas.push({
    id: 'conduc', fuente: 'Sección 6.7.3 + Anexo 8 · Conducción',
    regla: S.esConductor ? 'Nunca más de 2h continuas → ' + pausasConduc.length + ' pausa' + (pausasConduc.length !== 1 ? 's' : '') + ' de pie de 15 min mínimo' : 'No aplica — sin conducción',
    detalle: S.esConductor ? 'La pausa debe ser de pie con ejercicio. No cuenta permanecer sentado en la cabina.' : '',
    minutos: mConduc, pausas: pausasConduc, activo: S.esConductor,
  });

  let mRep = 0, pausasRep = [], repActivo = S.repetitivo === 'si';
  if (repActivo) {
    const numPausas = S.horas <= 6 ? 2 : Math.max(3, Math.round(S.horas / 8 * 3));
    pausasRep = distribuirNPausas(numPausas, 8, S.horas, S.horaIni, refrigMin, refrigOffset);
    mRep = pausasRep.length * 8;
  }
  reglas.push({
    id: 'rep', fuente: 'Sección 6.7.3 · Movimientos repetitivos',
    regla: repActivo ? (S.horas <= 6 ? 'Mínimo 2 pausas de 8 min en jornada de 6h' : 'Mínimo ' + Math.max(3, Math.round(S.horas / 8 * 3)) + ' pausas de 8 min') : 'No aplica — sin movimientos repetitivos',
    detalle: repActivo ? 'Independientemente del intervalo para el almuerzo (RM 546-2026-MINSA, Sección 6.7.3).' : '',
    minutos: mRep, pausas: pausasRep, activo: repActivo,
  });

  let mMental = 0, pausasMental = [], mentalActivo = S.mental === 'si';
  if (mentalActivo) {
    pausasMental = distribuirCadaX(90, 7, S.horas, S.horaIni, refrigMin, refrigOffset);
    mMental = pausasMental.length * 7;
  }
  reglas.push({
    id: 'mental', fuente: 'Sección 6.7.3 · Carga mental / pantalla',
    regla: mentalActivo ? 'Pausa de 5-10 min cada hora y media de trabajo' : 'No aplica — sin carga mental significativa',
    detalle: mentalActivo ? 'Las pausas incluyen recuperación de fatiga visual. Se usa 7 min (punto medio entre 5 y 10).' : '',
    minutos: mMental, pausas: pausasMental, activo: mentalActivo,
  });

  let ganadora;
  if (S.esConductor) {
    ganadora = reglas.find(r => r.id === 'conduc');
  } else {
    ganadora = reglas.filter(r => r.activo).reduce((a, b) => b.minutos > a.minutos ? b : a, reglas.find(r => r.activo) || reglas[0]);
  }
  if (S.nocturno === 'si') ganadora = null;

  const mFinal = ganadora ? ganadora.minutos : 0;
  let modeDesc = S.mode === 'mixto'
    ? 'Jornada mixta: ' + Object.entries(S.mixActs).map(([k, v]) => k + ' ' + v + '%').join(' + ')
    : 'Actividad: ' + (S.actUnica || S.postura);
  document.getElementById('rhWho').textContent = nombre;
  document.getElementById('rhBig').textContent = S.nocturno === 'si' ? '—' : mFinal;
  document.getElementById('rhNote').textContent = S.nocturno === 'si'
    ? 'Jornada nocturna o atípica: se requiere evaluación ergonómica antes de fijar pausas'
    : modeDesc + ' · Jornada de ' + S.horas + 'h · Las pausas son adicionales al refrigerio';

  let bkHTML = '';
  reglas.forEach(r => {
    const esGanadora = ganadora && r.id === ganadora.id;
    const dim = !r.activo;
    const numStr = r.activo ? String(r.minutos) + "'" : '—';
    bkHTML += '<div class="bk-row">'
      + '<div class="bk-left"><div class="bk-source">' + r.fuente + '</div>'
      + '<div class="bk-rule' + (dim ? ' dim' : '') + '">' + r.regla
      + (esGanadora ? '<span class="bk-tag tag-winner">Se aplica</span>' : '')
      + (!r.activo ? '<span class="bk-tag tag-na">No aplica</span>' : (!esGanadora && r.minutos > 0 ? '<span class="bk-tag tag-skipped">Menor</span>' : ''))
      + '</div>' + (r.detalle ? '<div class="bk-detail">' + r.detalle + '</div>' : '') + '</div>'
      + '<div class="bk-right"><div class="bk-num' + (dim ? ' dim' : '') + '">' + numStr + '</div>'
      + '<div class="bk-unit">' + (r.activo ? 'minutos' : '') + '</div></div></div>';
  });
  if (ganadora) {
    const mixedNote = S.mode === 'mixto'
      ? '<div style="font-size:11px;color:var(--slate);margin-top:6px;line-height:1.5;">En jornada mixta cada bloque tiene su propia regla. El horario refleja la actividad dominante.</div>' : '';
    bkHTML += '<div class="bk-winner"><div class="bk-winner-label">Total pausas activas (sin refrigerio)</div><div class="bk-winner-val">' + mFinal + ' min</div></div>' + mixedNote;
  }
  if (S.nocturno === 'si') {
    bkHTML += '<div style="background:#fff7ed;border-radius:8px;padding:12px 14px;margin-top:10px;font-size:12px;color:#92400e;line-height:1.5;"><strong>Jornada nocturna o atípica (ej. 21x7):</strong> la Sección 6.7.3 establece que se debe realizar primero una <strong>evaluación ergonómica formal</strong> para definir el programa de pausas.</div>';
  }
  document.getElementById('bkContent').innerHTML = bkHTML;

  if (ganadora && ganadora.pausas && ganadora.pausas.length > 0) {
    const refH = Math.floor((S.horaIni * 60 + refrigOffset) / 60) % 24;
    const refM = (S.horaIni * 60 + refrigOffset) % 60;
    const refEnd = Math.floor((S.horaIni * 60 + refrigOffset + refrigMin) / 60) % 24;
    const refEndM = (S.horaIni * 60 + refrigOffset + refrigMin) % 60;
    const refStr = String(refH).padStart(2, '0') + ':' + String(refM).padStart(2, '0') + ' – ' + String(refEnd).padStart(2, '0') + ':' + String(refEndM).padStart(2, '0');
    document.getElementById('schedSubtitle').textContent =
      ganadora.pausas.length + ' pausa' + (ganadora.pausas.length > 1 ? 's' : '') + ' de ' + ganadora.pausas[0].dur + ' min · Criterio: ' + ganadora.fuente + ' · Refrigerio 60 min: ' + refStr + ' (no suma al total)';
    renderSchedule(S.horas, S.horaIni, ganadora.pausas, refrigMin, refrigOffset);
  } else {
    document.getElementById('schedSubtitle').textContent = S.nocturno === 'si' ? 'Requiere evaluación ergonómica previa.' : 'No se requieren pausas adicionales por estos criterios.';
    document.getElementById('dayStrip').innerHTML = '<div class="ds-work" style="flex:1;font-size:11px;font-weight:600;color:#1a56db;">Jornada de ' + S.horas + 'h</div>';
    document.getElementById('schedList').innerHTML = '';
  }

  renderExercises(S.postura, S.mental, S.repetitivo, S.peso);
  renderRecos(reglas, nombre);
  goStep(5);

  // Return calculated data so callers (admin save, worker activate) can use it
  const alertPausas = (ganadora && ganadora.pausas) ? ganadora.pausas : [];
  return {
    pausas: alertPausas,
    nombre,
    mFinal,
    ganadoraId: ganadora ? ganadora.id : null,
    config: {
      horas: S.horas, turno: S.turno, horaIni: S.horaIni,
      peso: S.peso, tcarga: S.tcarga, mode: S.mode,
      actUnica: S.actUnica, mixActs: { ...S.mixActs },
      postura: S.postura, mental: S.mental, repetitivo: S.repetitivo, nocturno: S.nocturno,
    },
  };
}

function renderSchedule(horas, ini, pausas, refrigMin, refrigOffset) {
  const totalMin = horas * 60;
  const refrigAt = refrigOffset !== undefined ? refrigOffset : Math.floor(totalMin / 2);
  const eventos = [...pausas, { at: refrigAt, dur: refrigMin, tipo: 'refrig' }].sort((a, b) => a.at - b.at);
  let sHTML = '', prev = 0;
  eventos.forEach(e => {
    const w = e.at - prev;
    if (w > 0) sHTML += '<div class="ds-work" style="flex:' + w + '"></div>';
    const cls = e.tipo === 'refrig' ? 'ds-refrig' : 'ds-pause';
    sHTML += '<div class="' + cls + '" style="flex:' + Math.max(e.dur, 4) + '"></div>';
    prev = e.at + e.dur;
  });
  if (prev < totalMin) sHTML += '<div class="ds-work" style="flex:' + (totalMin - prev) + '"></div>';
  document.getElementById('dayStrip').innerHTML = sHTML;

  let lHTML = '', cursor = 0;
  eventos.forEach(e => {
    if (e.at > cursor) {
      const h1 = (Math.floor(cursor / 60) + ini) % 24, m1 = cursor % 60;
      const h2 = (Math.floor(e.at / 60) + ini) % 24, m2 = e.at % 60;
      lHTML += '<div class="sched-row sr-work"><svg class="sr-icon" style="color:#1a56db"><use href="#ico-work"/></svg><div class="sr-time">' + fmt(h1, m1) + ' – ' + fmt(h2, m2) + '</div><div class="sr-desc">Trabajo activo</div></div>';
    }
    const ph = (Math.floor(e.at / 60) + ini) % 24, pm = e.at % 60;
    const pe = (Math.floor((e.at + e.dur) / 60) + ini) % 24, pem = (e.at + e.dur) % 60;
    const esRef = e.tipo === 'refrig';
    lHTML += '<div class="sched-row ' + (esRef ? 'sr-refrig' : 'sr-pause') + '">'
      + '<svg class="sr-icon" style="color:' + (esRef ? '#ea580c' : '#d97706') + '"><use href="#ico-' + (esRef ? 'food' : 'pause') + '"/></svg>'
      + '<div class="sr-time">' + fmt(ph, pm) + ' – ' + fmt(pe, pem) + '</div>'
      + '<div class="sr-desc">' + (esRef ? 'Refrigerio — no cuenta como pausa activa' : (S.esConductor ? 'Pausa de conductor — baja del vehículo, de pie con ejercicio' : 'Pausa activa — estira, respira, camina')) + '</div>'
      + '<div class="sr-dur">' + (esRef ? e.dur + ' min (refrigerio)' : e.dur + ' min') + '</div>'
      + '</div>';
    cursor = e.at + e.dur;
  });
  if (cursor < totalMin) {
    const h1 = (Math.floor(cursor / 60) + ini) % 24, m1 = cursor % 60;
    const h2 = (Math.floor(totalMin / 60) + ini) % 24, m2 = totalMin % 60;
    lHTML += '<div class="sched-row sr-work"><svg class="sr-icon" style="color:#1a56db"><use href="#ico-work"/></svg><div class="sr-time">' + fmt(h1, m1) + ' – ' + fmt(h2, m2) + '</div><div class="sr-desc">Trabajo activo</div></div>';
  }
  document.getElementById('schedList').innerHTML = lHTML;
}

function renderExercises(postura, mental, repetitivo, peso) {
  const items = [
    { ic: 'stretch', label: 'Estiramientos', sub: 'Cuello, hombros, muñecas, caderas, tobillos' },
    { ic: 'breathe', label: 'Respiración profunda', sub: 'Inhala 4 seg · retén 4 · exhala 6' },
  ];
  if (S.esConductor) items.push({ ic: 'back', label: 'Pausa de conductor', sub: 'De pie 15 min · estira piernas y espalda' });
  if (mental === 'si') items.push({ ic: 'eye', label: 'Pausa visual', sub: 'Mira a +6 m por 20 seg · parpadea' });
  if (repetitivo === 'si') items.push({ ic: 'stretch', label: 'Recuperación muscular', sub: 'Sacude manos · rota hombros' });
  if (postura === '7' && !S.esConductor) items.push({ ic: 'back', label: 'Cambio postural', sub: '30 seg cada 10 min · máx 2h misma posición' });
  if (parseInt(peso) >= 3) items.push({ ic: 'stretch', label: 'Ejercicios lumbares', sub: 'Extensiones de columna · rotación de cadera' });
  document.getElementById('exList').innerHTML = items.map(x =>
    '<div class="ex-card"><svg class="ex-card-icon" style="color:#059669"><use href="#ico-' + x.ic + '"/></svg>'
    + '<div class="ex-card-label">' + x.label + '</div><div class="ex-card-sub">' + x.sub + '</div></div>'
  ).join('');
}

function renderRecos(reglas, nombre) {
  const items = [];
  const a7 = reglas.find(r => r.id === 'a7');
  const a8 = reglas.find(r => r.id === 'a8');
  if ((a7 && a7.minutos >= Math.round(S.horas * 60 * 0.10)) || (a8 && a8.minutos >= Math.round(S.horas * 60 * 0.07)))
    items.push({ ic: 'warn', type: 'warn', label: 'Requiere evaluación ergonómica formal' });
  if (parseInt(S.peso) >= 4) items.push({ ic: 'warn', type: 'warn', label: 'Carga >27 kg: faja lumbar + rotación de puestos' });
  if (parseInt(S.peso) === 3) items.push({ ic: 'doc', type: 'info', label: 'Carga 11-27 kg: capacitar en manipulación manual' });
  if (S.esConductor) items.push({ ic: 'warn', type: 'warn', label: 'Conductor: máx 2h al volante · pausa de pie 15 min' });
  else if (S.postura === '7') items.push({ ic: 'warn', type: 'warn', label: 'Postura forzada: micropausas 30 seg cada 10 min' });
  if (S.nocturno === 'si') items.push({ ic: 'moon', type: 'warn', label: 'Turno nocturno: evaluación ergonómica previa obligatoria' });
  if (S.mental === 'si') items.push({ ic: 'eye', type: 'info', label: 'Pantalla: monitor a altura de ojos · Anexo 6 PSLT' });
  if (S.repetitivo === 'si') items.push({ ic: 'doc', type: 'info', label: 'Repetitivo: pausas adicionales al refrigerio · Anexo 3' });
  if (S.mode === 'mixto') items.push({ ic: 'doc', type: 'info', label: 'Jornada mixta: documentar regla por cada bloque de actividad' });
  items.push({ ic: 'doc', type: 'info', label: 'Registrar en Programa PSLT · Anexo 2 · RM 546-2026-MINSA' });
  items.push({ ic: 'check', type: 'ok', label: 'Evaluar cada 3 meses · Cuestionario de Satisfacción · Anexo 4' });
  const colorMap = { warn: 'reco-warn', info: '', ok: 'reco-ok' };
  const iconColorMap = { warn: '#dc2626', info: '#92400e', ok: '#059669' };
  document.getElementById('recoList').innerHTML = items.map(x =>
    '<div class="reco-row ' + (colorMap[x.type] || '') + '"><svg class="ri-icon" style="color:' + iconColorMap[x.type] + '"><use href="#ico-' + x.ic + '"/></svg><div class="ri-label">' + x.label + '</div></div>'
  ).join('');
}

export function resetAll() {
  S.horas = 8; S.turno = 'dia'; S.horaIni = 7; S.peso = '0'; S.tcarga = '1';
  S.mode = 'unico'; S.actUnica = null; S.mixActs = {}; S.isMixed = false;
  S.postura = '2'; S.posturaEsPantalla = false; S.esConductor = false;
  S.mental = 'no'; S.repetitivo = 'no'; S.nocturno = 'no';
  setMode('unico');
  document.querySelectorAll('.act-card').forEach(c => c.classList.remove('sel', 'sel-orange', 'sel-purple'));
  document.querySelectorAll('.ichoice, .hchoice').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.rule-reveal').forEach(b => b.classList.remove('show'));
  document.querySelector('[data-g="horas"][data-v="8"]').classList.add('sel');
  document.querySelector('[data-g="turno"][data-v="dia"]').classList.add('sel');
  document.querySelectorAll('[data-g="repetitivo"][data-v="no"]').forEach(b => b.classList.add('sel-no'));
  document.querySelectorAll('[data-g="mental"][data-v="no"]').forEach(b => b.classList.add('sel-no'));
  document.querySelectorAll('[data-g="nocturno"][data-v="no"]').forEach(b => b.classList.add('sel-no'));
  document.getElementById('inNombre').value = '';
  document.getElementById('inHoraIni').value = 7;
  document.getElementById('tcargaWrap').style.display = 'none';
  document.getElementById('btn2').disabled = true;
  document.getElementById('btn3').disabled = true;
  goStep(1);
}
