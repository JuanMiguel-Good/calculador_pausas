export function createBreakOverlayHTML() {
  return `
<div id="breakOverlay" class="bov-overlay" style="display:none" role="dialog" aria-modal="true">
  <div class="bov-backdrop">
    <div class="bov-card">
      <div class="bov-header" id="bovHeader">
        <div>
          <div class="bov-label" id="bovLabel">Pausa activa</div>
          <div class="bov-dur" id="bovDur">7 minutos</div>
        </div>
        <div class="bov-progress-ring">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4"/>
            <circle id="bovRingFill" cx="26" cy="26" r="22" fill="none" stroke="#FFE500" stroke-width="4"
              stroke-dasharray="138.2" stroke-dashoffset="138.2" stroke-linecap="round"
              transform="rotate(-90 26 26)" style="transition:stroke-dashoffset 1s linear"/>
          </svg>
          <div class="bov-ring-text" id="bovRingText">—</div>
        </div>
      </div>

      <div class="bov-progress-bar-wrap">
        <div class="bov-progress-bar-track">
          <div class="bov-progress-bar-fill" id="bovProgressFill"></div>
        </div>
        <div class="bov-progress-label" id="bovProgressLabel">Ejercicio 1 de 3</div>
      </div>

      <!-- Exercise content -->
      <div id="bovExercise" class="bov-exercise">
        <div id="bovExMedia" class="bov-ex-media" style="display:none"></div>
        <div class="bov-ex-icon" id="bovExIcon"></div>
        <div class="bov-ex-name" id="bovExName"></div>
        <div class="bov-ex-inst" id="bovExInst"></div>
      </div>

      <!-- Done state -->
      <div id="bovDone" class="bov-done" style="display:none">
        <div class="bov-done-check">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="1.8"/>
            <path d="M8 12l3 3 5-5" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="bov-done-title">Pausa completada</div>
        <div class="bov-done-sub" id="bovDoneSub"></div>
        <button class="bov-btn-primary" onclick="window.closeBreakOverlay()">Continuar trabajando</button>
      </div>

      <!-- Action buttons (shown during exercises) -->
      <div id="bovActions" class="bov-actions">
        <button class="bov-btn-primary" id="bovNextBtn" onclick="window.nextBreakStep()">
          Siguiente ejercicio
        </button>
        <button class="bov-btn-skip" onclick="window.skipBreakFromOverlay()">
          Saltar esta pausa
        </button>
      </div>
    </div>
  </div>
</div>`;
}

export function mountBreakOverlay() {
  // CSS injected once
  if (document.getElementById('bovStyles')) return;
  const style = document.createElement('style');
  style.id = 'bovStyles';
  style.textContent = `
    .bov-overlay {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      animation: bovFadeIn .25s ease;
    }
    @keyframes bovFadeIn { from{opacity:0} to{opacity:1} }
    .bov-backdrop {
      position: absolute; inset: 0;
      background: rgba(10,20,40,0.88);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .bov-card {
      background: #fff;
      border-radius: 20px;
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      animation: bovSlideUp .3s cubic-bezier(.4,0,.2,1);
    }
    @keyframes bovSlideUp { from{opacity:0} to{opacity:1} }
    .bov-header {
      background: var(--navy);
      padding: 20px 20px 16px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
    }
    .bov-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: rgba(255,255,255,0.55); margin-bottom: 3px;
    }
    .bov-dur { font-size: 24px; font-weight: 900; color: #fff; }
    .bov-progress-ring { position: relative; flex-shrink: 0; }
    .bov-ring-text {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; color: var(--yellow);
      font-variant-numeric: tabular-nums;
    }
    .bov-progress-bar-wrap {
      padding: 14px 20px 10px;
      background: var(--slate-light);
      border-bottom: 1px solid var(--border);
    }
    .bov-progress-bar-track {
      height: 6px; background: var(--border); border-radius: 4px; overflow: hidden; margin-bottom: 6px;
    }
    .bov-progress-bar-fill {
      height: 100%; background: var(--blue); border-radius: 4px; transition: width .5s ease;
    }
    .bov-progress-label {
      font-size: 11px; font-weight: 700; color: var(--slate);
      text-transform: uppercase; letter-spacing: .5px;
    }
    .bov-exercise {
      padding: 24px 24px 8px;
      text-align: center;
    }
    .bov-ex-icon {
      width: 64px; height: 64px; margin: 0 auto 14px;
      background: var(--blue-light); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .bov-ex-media {
      margin: 0 auto 14px;
      max-width: 260px; width: 100%;
    }
    .bov-ex-media img {
      display: block; width: 100%; height: auto;
      max-height: 180px; object-fit: contain;
      border-radius: 12px;
    }
    @media(max-width:480px) {
      .bov-ex-media img { max-height: 140px; }
    }
    .bov-ex-name {
      font-size: 18px; font-weight: 800; color: var(--navy); margin-bottom: 10px;
    }
    .bov-ex-inst {
      font-size: 13px; color: var(--text-soft); line-height: 1.65;
      max-width: 340px; margin: 0 auto;
    }
    .bov-done {
      padding: 28px 24px; text-align: center;
    }
    .bov-done-check { margin-bottom: 12px; }
    .bov-done-title { font-size: 20px; font-weight: 800; color: var(--navy); margin-bottom: 6px; }
    .bov-done-sub { font-size: 13px; color: var(--slate); line-height: 1.5; margin-bottom: 20px; }
    .bov-actions { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 8px; }
    .bov-btn-primary {
      width: 100%; padding: 14px; background: var(--blue); color: #fff;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: inherit; transition: background .2s;
    }
    .bov-btn-primary:hover { background: #1d4ed8; }
    .bov-btn-skip {
      width: 100%; padding: 10px; background: transparent; color: var(--slate);
      border: none; font-size: 12px; cursor: pointer; font-family: inherit;
      transition: color .15s;
    }
    .bov-btn-skip:hover { color: var(--red); }
    @media(max-width:480px) {
      .bov-card { border-radius: 16px; }
      .bov-ex-name { font-size: 16px; }
      .bov-ex-inst { font-size: 12px; }
    }
  `;
  document.head.appendChild(style);
}
